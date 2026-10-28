// SPDX-License-Identifier: GPL-3.0-only
//
// Pont entre HeliBoard et le moteur Correcteur Réel (paquet fr.correcteurreel, copié depuis clavier/moteur).
//
// Toute la logique est dans fr.correcteurreel.Saisie, testée sans Android (clavier/moteur/src/test/.../SaisieTest.kt) ;
// ce pont ne fait que charger le dictionnaire, traduire les objets de HeliBoard et protéger le clavier :
//   - le moteur ne travaille que pour une disposition française, une fois son dictionnaire chargé ;
//     sinon chaque fonction renvoie null ou ne fait rien, et HeliBoard se comporte comme d'habitude ;
//   - toute erreur du moteur est rattrapée ici pour ne jamais faire planter le clavier.

package helium314.keyboard.latin.correcteur

import android.content.Context
import fr.correcteurreel.Avis
import fr.correcteurreel.Correcteur
import fr.correcteurreel.Lexique
import fr.correcteurreel.ProfilUtilisateur
import fr.correcteurreel.Saisie
import fr.correcteurreel.forme
import helium314.keyboard.latin.NgramContext
import helium314.keyboard.latin.SuggestedWords.SuggestedWordInfo
import helium314.keyboard.latin.dictionary.Dictionary
import helium314.keyboard.latin.settings.SettingsValues
import helium314.keyboard.latin.utils.Log
import kotlinx.serialization.json.Json
import java.io.File
import java.util.zip.GZIPInputStream
import kotlin.concurrent.thread

object CorrecteurReel {
    private const val TAG = "CorrecteurReel"
    private const val FICHIER_PROFIL = "correcteur-reel-profil.json"
    /** Nombre de caractères relus avant le curseur pour la grammaire. */
    const val LONGUEUR_RELUE = 300

    // Le moteur est appelé depuis le fil de l'interface et depuis celui des suggestions : un seul à la fois.
    private val verrou = Any()
    @Volatile private var saisie: Saisie? = null
    @Volatile private var chargementLance = false
    private var fichierProfil: File? = null
    private var aSauvegarder = false

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
                    saisie = Saisie(Correcteur(lexique, profil))
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
            (saisie?.correcteur?.profil?.exporter()?.toString() ?: return) to (fichierProfil ?: return)
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
    fun actif(sv: SettingsValues): Boolean = sv.mCorrecteurReel && sv.mLocale.language == "fr" && saisie != null

    /** Pas d'apprentissage en navigation privée, dans les champs de mot de passe, ni si l'utilisateur l'a refusé. */
    private fun peutApprendre(sv: SettingsValues) = !sv.mIncognitoModeEnabled && sv.mUsePersonalizedDicts

    private inline fun <T> securise(defaut: T, action: (Saisie) -> T): T = try {
        synchronized(verrou) { saisie?.let(action) ?: defaut }
    } catch (e: Throwable) {
        Log.e(TAG, "erreur du correcteur", e)
        defaut
    }

    private fun motPrecedent(ngram: NgramContext): String? = ngram.getNthPrevWord(1)?.toString()

    // --- Pendant la frappe : barre de suggestions et décision de corriger ------------------------

    @JvmStatic
    fun avis(sv: SettingsValues, tape: String, ngram: NgramContext): Avis? {
        if (tape.isEmpty() || !actif(sv)) return null
        return securise<Avis?>(null) { it.avis(tape, motPrecedent(ngram), ngram.isBeginningOfSentenceContext) }
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
    fun estCorrectionDuMoteur(info: SuggestedWordInfo?, avis: Avis): Boolean {
        val correction = avis.correction ?: return false
        return info != null && info.mSourceDict === dictionnaire && forme(info.mWord) == forme(correction)
    }

    // --- Grammaire ---------------------------------------------------------------------------------

    /**
     * À l'espace : accorde le mot qui se termine avec ce qui précède (« ils mange » → « ils mangent »).
     * La correction passe par le même chemin que la correction automatique : un retour arrière l'annule.
     */
    @JvmStatic
    fun accorder(sv: SettingsValues, texteAvant: CharSequence?, tape: String, mot: String, separateur: String?): String {
        if (!actif(sv) || !sv.mCorrecteurReelGrammaire || texteAvant == null) return mot
        return securise(mot) { it.accorder(texteAvant.toString(), tape, mot, separateur) }
    }

    /** Remplacement à faire avant le curseur : tout ce qui suit [debut] devient [nouvelleFin]. */
    class Remplacement(@JvmField val debut: Int, @JvmField val nouvelleFin: String)

    /** Après chaque mot : corrige les mots qui le précèdent (« je vais a paris » → « à paris »). */
    @JvmStatic
    fun grammaireApresMot(sv: SettingsValues, texteAvant: CharSequence?): Remplacement? {
        if (!actif(sv) || !sv.mCorrecteurReelGrammaire || texteAvant == null) return null
        return securise<Remplacement?>(null) { s ->
            s.grammaireApresMot(texteAvant.toString())?.let { Remplacement(it.debut, it.nouvelleFin) }
        }
    }

    // --- Apprentissage -------------------------------------------------------------------------------

    /** Un mot vient d'être écrit. [garde] : l'utilisateur a choisi le mot exactement comme il l'avait tapé. */
    @JvmStatic
    fun motEcrit(sv: SettingsValues, ecrit: String, garde: Boolean, ngram: NgramContext) {
        if (!actif(sv) || !peutApprendre(sv) || ecrit.isEmpty()) return
        securise(Unit) {
            it.motEcrit(ecrit, garde, motPrecedent(ngram), ngram.isBeginningOfSentenceContext)
            aSauvegarder = true
        }
    }

    /** L'utilisateur a annulé une correction (retour arrière juste après) : le moteur s'en souvient. */
    @JvmStatic
    fun correctionAnnulee(sv: SettingsValues, tape: String, correction: String, ngram: NgramContext) {
        if (!actif(sv)) return
        securise(Unit) {
            val apprendre = peutApprendre(sv)
            it.correctionAnnulee(tape, correction, motPrecedent(ngram), ngram.isBeginningOfSentenceContext, apprendre)
            if (apprendre) aSauvegarder = true
        }
    }
}
