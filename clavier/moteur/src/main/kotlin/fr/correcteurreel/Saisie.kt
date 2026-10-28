// Ce que le clavier demande au moteur pendant la frappe, sans rien qui dépende d'Android :
// le pont avec HeliBoard (clavier/heliboard/src/CorrecteurReel.kt) ne fait que traduire ses objets vers ceux-ci.
//
// Particularité du clavier : il garde « j'ai » ou « l'homme » en un seul mot, alors que le moteur raisonne sur
// « j' » + « ai ». Chaque fonction ne traite donc que le dernier morceau du mot, avec le morceau d'avant comme contexte.

package fr.correcteurreel

/** Nombre de mots en arrière que la grammaire peut encore retoucher : on ne modifie pas un texte ancien. */
const val MOTS_RETOUCHABLES = 4

/** Ce que le moteur pense du mot en cours de frappe. */
class Avis(
    /** Correction à appliquer à l'espace, ou null. */
    val correction: String?,
    /** Le mot tapé est valide : le clavier ne doit pas le corriger. */
    val valide: Boolean,
    /** Propositions pour la barre de suggestions, la correction en premier. */
    val propositions: List<String>,
)

/** Remplacement dans le texte avant le curseur : tout ce qui suit [debut] devient [nouvelleFin]. */
class RemplacementFin(val debut: Int, val nouvelleFin: String)

class Saisie(val correcteur: Correcteur) {
    /** Corrections de grammaire que l'utilisateur a annulées, pour ne pas les refaire. */
    private val grammaireRefusee = HashSet<String>()

    private fun morceaux(mot: String) = tokeniser(mot) { correcteur.lexique.contient(it) }

    /**
     * Contexte du dernier morceau d'un mot : le morceau d'avant (« j' ») ou, à défaut, le mot précédent tel que
     * le clavier le donne (dont on garde aussi le dernier morceau : « ai » pour « j'ai »).
     */
    private fun contexte(parties: List<Mot>, motPrecedent: String?, debutPhrase: Boolean): ContexteMot {
        if (parties.size > 1) return ContexteMot(parties[parties.size - 2].texte, false)
        val precedent = motPrecedent?.takeIf { it.isNotEmpty() }?.let { morceaux(it).lastOrNull()?.texte }
        return ContexteMot(precedent, debutPhrase)
    }

    private fun cleRefus(precedent: String?, avant: String, apres: String) =
        "${precedent?.let(::forme) ?: "^"}|${forme(avant)}→${forme(apres)}"

    /** Pendant la frappe : propositions pour la barre et décision de corriger à l'espace. */
    fun avis(tape: String, motPrecedent: String?, debutPhrase: Boolean): Avis? {
        if (tape.isEmpty()) return null
        val parties = morceaux(tape)
        val dernier = parties.lastOrNull() ?: return null
        // Chiffres ou symboles collés au mot : le clavier garde son comportement habituel.
        if (dernier.fin != tape.length) return null
        val debut = tape.substring(0, dernier.debut)
        val ctx = contexte(parties, motPrecedent, debutPhrase)
        val analyse = correcteur.analyserMot(dernier.texte, ctx)
        val correction = if (analyse.auto) analyse.correction else null
        val propositions = (listOfNotNull(correction) + correcteur.suggestions(dernier.texte, ctx) + analyse.suggestions)
            .map { debut + it }
            .filter { it != tape }
            .distinct()
        return Avis(correction?.let { debut + it }, analyse.valide, propositions)
    }

    /**
     * À l'espace : accorde le mot qui se termine avec ce qui précède (« ils mange » → « ils mangent »,
     * « il est la. » → « là »). Renvoie le mot à écrire.
     *
     * @param texteAvant le texte avant le curseur, mot tapé compris
     * @param tape le mot tapé, tel qu'il est à la fin de [texteAvant]
     * @param mot le mot qui va être écrit (le mot tapé ou sa correction)
     * @param separateur ce qui termine le mot (espace, ponctuation)
     */
    fun accorder(texteAvant: String, tape: String, mot: String, separateur: String?): String {
        if (mot.isEmpty() || !texteAvant.endsWith(tape)) return mot
        val prefixe = texteAvant.substring(0, texteAvant.length - tape.length)
        val texte = prefixe + mot + (separateur ?: "")
        val fin = prefixe.length + mot.length
        val mots = tokeniser(texte) { correcteur.lexique.contient(it) }
        val correction = correcteur.verifierGrammaire(texte, enCours = true).firstOrNull { c ->
            c.confiance == Confiance.HAUTE && c.fin == fin && c.debut >= prefixe.length &&
                cleRefus(mots.lastOrNull { it.fin <= c.debut }?.texte, c.avant, c.apres) !in grammaireRefusee
        } ?: return mot
        return mot.substring(0, correction.debut - prefixe.length) + correction.apres
    }

    /**
     * Après chaque mot : relit les derniers mots et corrige ceux qui précèdent le dernier
     * (« je vais a paris » devient « je vais à paris » dès que « paris » est tapé).
     */
    fun grammaireApresMot(texteAvant: String): RemplacementFin? {
        val mots = tokeniser(texteAvant) { correcteur.lexique.contient(it) }
        if (mots.size < 2) return null
        val dernier = mots.last()
        val limite = mots[maxOf(0, mots.size - MOTS_RETOUCHABLES)].debut
        val corrections = correcteur.verifierGrammaire(texteAvant, enCours = true).filter { c ->
            c.confiance == Confiance.HAUTE && c.debut >= limite && c.fin <= dernier.debut &&
                cleRefus(mots.lastOrNull { it.fin <= c.debut }?.texte, c.avant, c.apres) !in grammaireRefusee
        }
        if (corrections.isEmpty()) return null
        val debut = corrections.first().debut
        val nouvelleFin = StringBuilder(texteAvant.substring(debut))
        for (c in corrections.sortedByDescending { it.debut }) nouvelleFin.replace(c.debut - debut, c.fin - debut, c.apres)
        return RemplacementFin(debut, nouvelleFin.toString())
    }

    /**
     * Un mot vient d'être écrit : le moteur apprend ce qui reste dans le texte, sauf une forme sans accent d'un
     * mot existant. [garde] : l'utilisateur a choisi le mot exactement comme il l'avait tapé.
     */
    fun motEcrit(ecrit: String, garde: Boolean, motPrecedent: String?, debutPhrase: Boolean): Apprentissage? {
        val parties = morceaux(ecrit)
        val dernier = parties.lastOrNull() ?: return null
        val ctx = contexte(parties, motPrecedent, debutPhrase)
        if (garde) return correcteur.garderMot(dernier.texte, ctx)
        return correcteur.profil.observer(
            dernier.texte,
            precedent = ctx.precedent,
            nomPropre = casse(dernier.texte) == Casse.CAPITALE && !ctx.debutPhrase,
        )
    }

    /** L'utilisateur a annulé une correction (retour arrière juste après) : on ne la refera pas. */
    fun correctionAnnulee(
        tape: String,
        correction: String,
        motPrecedent: String?,
        debutPhrase: Boolean,
        apprendre: Boolean,
    ): Apprentissage? {
        if (tape == correction) return null
        val partiesTape = morceaux(tape)
        val dernierTape = partiesTape.lastOrNull() ?: return null
        val dernierCorrige = morceaux(correction).lastOrNull() ?: return null
        val ctx = contexte(partiesTape, motPrecedent, debutPhrase)
        grammaireRefusee += cleRefus(ctx.precedent, dernierTape.texte, dernierCorrige.texte)
        return if (apprendre) correcteur.annulerCorrection(dernierTape.texte, dernierCorrige.texte, ctx) else null
    }
}
