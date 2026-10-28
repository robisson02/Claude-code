// SPDX-License-Identifier: GPL-3.0-only
//
// Pont entre HeliBoard et le moteur Correcteur Réel (paquet fr.correcteurreel, copié depuis clavier/moteur).
//
// Le moteur ne s'occupe que du français, et seulement une fois son dictionnaire chargé : en dehors de ces cas,
// chaque fonction renvoie null ou ne fait rien, et HeliBoard se comporte exactement comme d'habitude.
// Toute erreur du moteur est rattrapée ici pour ne jamais faire planter le clavier.

package helium314.keyboard.latin.correcteur

import android.content.Context
import helium314.keyboard.latin.NgramContext
import helium314.keyboard.latin.SuggestedWords.SuggestedWordInfo
import helium314.keyboard.latin.dictionary.Dictionary
import helium314.keyboard.latin.settings.SettingsValues
import helium314.keyboard.latin.utils.Log
import fr.correcteurreel.Casse
import fr.correcteurreel.Confiance
import fr.correcteurreel.ContexteMot
import fr.correcteurreel.Correcteur
import fr.correcteurreel.Lexique
import fr.correcteurreel.Mot
import fr.correcteurreel.ProfilUtilisateur
import fr.correcteurreel.casse
import fr.correcteurreel.forme
import fr.correcteurreel.tokeniser
import kotlinx.serialization.json.Json
import java.io.File
import java.util.zip.GZIPInputStream
import kotlin.concurrent.thread

object CorrecteurReel {
    private const val TAG = "CorrecteurReel"
    private const val FICHIER_PROFIL = "correcteur-reel-profil.json"
    /** Nombre de caractères relus avant le curseur pour la grammaire. */
    const val LONGUEUR_RELUE = 300
    /** La grammaire ne retouche que les derniers mots : on ne modifie pas un texte écrit il y a longtemps. */
    private const val MOTS_RETOUCHABLES = 4

    // Le moteur est appelé depuis le fil de l'interface et depuis celui des suggestions : un seul à la fois.
    private val verrou = Any()
    @Volatile private var correcteur: Correcteur? = null
    @Volatile private var chargementLance = false
    private var fichierProfil: File? = null
    private var aSauvegarder = false
    /** Corrections de grammaire que l'utilisateur a annulées (jusqu'à la fermeture du clavier). */
    private val grammaireRefusee = HashSet<String>()

    /** Source des suggestions du moteur dans la barre de HeliBoard. */
    @JvmField val dictionnaire: Dictionary = Dictionary.PhonyDictionary("correcteur_reel")

    /** Charge le dictionnaire en arrière-plan : le clavier reste utilisable pendant ce temps. */
    @JvmStatic
    fun initialiser(context: Context) {
        if (chargementLance) return
        chargementLance = true
        val app = context.applicationContext
        thread(name = TAG, isDaemon = true) {
            try {
                val debut = System.currentTimeMillis()
                val lexique = Lexique()
                app.assets.open("correcteur/lexique-fr.tsv.gz").use { flux ->
                    GZIPInputStream(flux).bufferedReader().useLines { lignes -> lignes.forEach(lexique::charger) }
                }
                app.assets.open("correcteur/complements.tsv").use { lexique.charger(it.bufferedReader().readText()) }
                lexique.finaliser()
                val fichier = File(app.filesDir, FICHIER_PROFIL)
                val profil = if (fichier.exists()) {
                    ProfilUtilisateur.importer(Json.parseToJsonElement(fichier.readText()), lexique)
                } else {
                    ProfilUtilisateur(lexique)
                }
                synchronized(verrou) {
                    fichierProfil = fichier
                    correcteur = Correcteur(lexique, profil)
                }
                Log.i(TAG, "dictionnaire chargé en ${System.currentTimeMillis() - debut} ms")
            } catch (e: Throwable) {
                Log.e(TAG, "impossible de charger le correcteur", e)
            }
        }
    }

    /** Enregistre ce que le clavier a appris (en arrière-plan). */
    @JvmStatic
    fun sauvegarder() {
        val (json, fichier) = synchronized(verrou) {
            if (!aSauvegarder) return
            aSauvegarder = false
            (correcteur?.profil?.exporter()?.toString() ?: return) to (fichierProfil ?: return)
        }
        thread(name = "$TAG-sauvegarde") {
            try {
                val temporaire = File(fichier.parentFile, fichier.name + ".tmp")
                temporaire.writeText(json)
                temporaire.renameTo(fichier)
            } catch (e: Throwable) {
                Log.e(TAG, "sauvegarde impossible", e)
            }
        }
    }

    /** Le moteur ne travaille que pour une disposition française, si l'utilisateur ne l'a pas désactivé. */
    @JvmStatic
    fun actif(sv: SettingsValues): Boolean =
        sv.mCorrecteurReel && sv.mLocale.language == "fr" && correcteur != null

    /** Pas d'apprentissage en navigation privée, dans les champs de mot de passe, ni si l'utilisateur l'a refusé. */
    private fun peutApprendre(sv: SettingsValues) = !sv.mIncognitoModeEnabled && sv.mUsePersonalizedDicts

    private inline fun <T> securise(defaut: T, action: (Correcteur) -> T): T = try {
        synchronized(verrou) { correcteur?.let(action) ?: defaut }
    } catch (e: Throwable) {
        Log.e(TAG, "erreur du correcteur", e)
        defaut
    }

    // HeliBoard garde « j'ai » ou « l'homme » en un seul mot ; le moteur raisonne sur « j' » + « ai ».
    private fun morceaux(c: Correcteur, mot: String): List<Mot> = tokeniser(mot) { c.lexique.contient(it) }

    /** Le mot précédent tel que le moteur le comprend (dernière partie de « j'ai » : « ai »). */
    private fun precedent(c: Correcteur, ngram: NgramContext): String? {
        val mot = ngram.getNthPrevWord(1)?.toString()?.takeIf { it.isNotEmpty() } ?: return null
        return morceaux(c, mot).lastOrNull()?.texte
    }

    /** Contexte du dernier morceau d'un mot : le morceau d'avant (« j' ») ou le mot précédent. */
    private fun contexte(c: Correcteur, parties: List<Mot>, ngram: NgramContext) =
        if (parties.size > 1) ContexteMot(parties[parties.size - 2].texte, false)
        else ContexteMot(precedent(c, ngram), ngram.isBeginningOfSentenceContext)

    // --- Pendant la frappe : barre de suggestions et décision de corriger -------------------------

    /** Ce que le moteur pense du mot en cours de frappe. */
    class Avis(
        /** Correction automatique à appliquer à l'espace, ou null. */
        @JvmField val correction: String?,
        /** Le mot tapé est valide : HeliBoard ne doit pas le corriger. */
        @JvmField val valide: Boolean,
        /** Propositions pour la barre, dans l'ordre (la correction automatique en premier). */
        @JvmField val propositions: List<String>,
    )

    @JvmStatic
    fun avis(sv: SettingsValues, tape: String, ngram: NgramContext): Avis? {
        if (tape.isEmpty() || !actif(sv)) return null
        return securise<Avis?>(null) { c ->
            val parties = morceaux(c, tape)
            val dernier = parties.lastOrNull() ?: return@securise null
            // Chiffres, symboles collés au mot… : on laisse HeliBoard faire.
            if (dernier.fin != tape.length) return@securise null
            val debut = tape.substring(0, dernier.debut)
            val ctx = contexte(c, parties, ngram)
            val analyse = c.analyserMot(dernier.texte, ctx)
            val correction = if (analyse.auto) analyse.correction else null
            val propositions = (listOfNotNull(correction) + c.suggestions(dernier.texte, ctx) + analyse.suggestions)
                .map { debut + it }
                .filter { it != tape }
                .distinct()
            Avis(correction?.let { debut + it }, analyse.valide, propositions)
        }
    }

    /** Place les propositions du moteur en tête de la liste de suggestions de HeliBoard. */
    @JvmStatic
    fun ajouterPropositions(liste: ArrayList<SuggestedWordInfo>, avis: Avis, ngram: NgramContext) {
        if (avis.propositions.isEmpty()) return
        val contexte = ngram.extractPrevWordsContext()
        liste.removeAll { it.mWord in avis.propositions }
        liste.addAll(0, avis.propositions.mapIndexed { i, mot ->
            val auto = i == 0 && avis.correction == mot
            SuggestedWordInfo(
                mot, contexte, SuggestedWordInfo.MAX_SCORE - 1 - i,
                if (auto) SuggestedWordInfo.KIND_CORRECTION or SuggestedWordInfo.KIND_FLAG_APPROPRIATE_FOR_AUTO_CORRECTION
                else SuggestedWordInfo.KIND_CORRECTION,
                dictionnaire, SuggestedWordInfo.NOT_AN_INDEX, SuggestedWordInfo.NOT_A_CONFIDENCE,
            )
        })
    }

    /** Vrai si la première suggestion est la correction automatique décidée par le moteur. */
    @JvmStatic
    fun estCorrectionDuMoteur(info: SuggestedWordInfo?, avis: Avis): Boolean =
        avis.correction != null && info != null && info.mSourceDict === dictionnaire &&
            forme(info.mWord) == forme(avis.correction)

    // --- À l'espace : grammaire du mot qui se termine -----------------------------------------

    private fun cleRefus(precedent: String?, avant: String, apres: String) =
        "${precedent?.let(::forme) ?: "^"}|${forme(avant)}→${forme(apres)}"

    /**
     * Accorde le mot qui se termine avec ce qui précède (« ils mange » → « ils mangent », « il est la. » → « là »).
     * Comme la correction passe par le même chemin que la correction automatique, un retour arrière l'annule.
     *
     * @param texteAvant le texte avant le curseur, mot en cours compris
     * @param tape le mot tapé (tel qu'il est dans le texte)
     * @param mot le mot qui va être écrit (le mot tapé ou sa correction automatique)
     */
    @JvmStatic
    fun accorder(sv: SettingsValues, texteAvant: CharSequence?, tape: String, mot: String, separateur: String?): String {
        if (!actif(sv) || !sv.mCorrecteurReelGrammaire || texteAvant == null || mot.isEmpty()) return mot
        val avant = texteAvant.toString()
        if (!avant.endsWith(tape)) return mot
        return securise(mot) { c ->
            val prefixe = avant.substring(0, avant.length - tape.length)
            val texte = prefixe + mot + (separateur ?: "")
            val fin = prefixe.length + mot.length
            val mots = tokeniser(texte) { c.lexique.contient(it) }
            val correction = c.verifierGrammaire(texte, enCours = true).firstOrNull { cg ->
                cg.confiance == Confiance.HAUTE && cg.fin == fin && cg.debut >= prefixe.length &&
                    cleRefus(mots.lastOrNull { it.fin <= cg.debut }?.texte, cg.avant, cg.apres) !in grammaireRefusee
            } ?: return@securise mot
            mot.substring(0, correction.debut - prefixe.length) + correction.apres
        }
    }

    // --- Après le mot : grammaire des mots précédents ------------------------------------------

    /** Remplacement à faire dans le texte avant le curseur : tout ce qui suit [debut] devient [nouvelleFin]. */
    class Remplacement(@JvmField val debut: Int, @JvmField val nouvelleFin: String)

    /**
     * Après chaque mot, relit les derniers mots : « je vais a paris » devient « je vais à paris » dès que
     * « paris » est tapé. Le dernier mot n'est pas touché (c'est [accorder] qui s'en charge).
     */
    @JvmStatic
    fun grammaireApresMot(sv: SettingsValues, texteAvant: CharSequence?): Remplacement? {
        if (!actif(sv) || !sv.mCorrecteurReelGrammaire || texteAvant == null) return null
        val texte = texteAvant.toString()
        return securise<Remplacement?>(null) { c ->
            val mots = tokeniser(texte) { c.lexique.contient(it) }
            if (mots.size < 2) return@securise null
            val dernier = mots.last()
            val limite = mots[maxOf(0, mots.size - MOTS_RETOUCHABLES)].debut
            val corrections = c.verifierGrammaire(texte, enCours = true).filter { cg ->
                cg.confiance == Confiance.HAUTE && cg.debut >= limite && cg.fin <= dernier.debut &&
                    cleRefus(mots.lastOrNull { it.fin <= cg.debut }?.texte, cg.avant, cg.apres) !in grammaireRefusee
            }
            if (corrections.isEmpty()) return@securise null
            val debut = corrections.first().debut
            val nouvelleFin = StringBuilder(texte.substring(debut))
            for (cg in corrections.sortedByDescending { it.debut }) {
                nouvelleFin.replace(cg.debut - debut, cg.fin - debut, cg.apres)
            }
            Remplacement(debut, nouvelleFin.toString())
        }
    }

    // --- Apprentissage --------------------------------------------------------------------------

    /**
     * Un mot vient d'être écrit dans le texte. Le moteur apprend ce qui y reste, sauf s'il s'agit d'une forme
     * sans accent d'un mot existant. [garde] : l'utilisateur a choisi le mot tel qu'il l'avait tapé.
     */
    @JvmStatic
    fun motEcrit(sv: SettingsValues, ecrit: String, garde: Boolean, ngram: NgramContext) {
        if (!actif(sv) || !peutApprendre(sv) || ecrit.isEmpty()) return
        securise(Unit) { c ->
            val parties = morceaux(c, ecrit)
            val dernier = parties.lastOrNull() ?: return@securise
            val ctx = contexte(c, parties, ngram)
            if (garde) {
                c.garderMot(dernier.texte, ctx)
            } else {
                c.profil.observer(
                    dernier.texte,
                    precedent = ctx.precedent,
                    nomPropre = casse(dernier.texte) == Casse.CAPITALE && !ctx.debutPhrase,
                )
            }
            aSauvegarder = true
        }
    }

    /** L'utilisateur a annulé une correction (retour arrière juste après) : le moteur s'en souvient. */
    @JvmStatic
    fun correctionAnnulee(sv: SettingsValues, tape: String, correction: String, ngram: NgramContext) {
        if (!actif(sv) || tape == correction) return
        securise(Unit) { c ->
            val partiesTape = morceaux(c, tape)
            val partiesCorrection = morceaux(c, correction)
            val dernierTape = partiesTape.lastOrNull() ?: return@securise
            val dernierCorrige = partiesCorrection.lastOrNull() ?: return@securise
            val ctx = contexte(c, partiesTape, ngram)
            grammaireRefusee += cleRefus(ctx.precedent, dernierTape.texte, dernierCorrige.texte)
            if (peutApprendre(sv)) {
                c.annulerCorrection(dernierTape.texte, dernierCorrige.texte, ctx)
                aSauvegarder = true
            }
        }
    }
}
