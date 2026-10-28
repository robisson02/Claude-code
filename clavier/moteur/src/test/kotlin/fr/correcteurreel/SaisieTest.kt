package fr.correcteurreel

import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertTrue
import kotlin.test.fail

/**
 * Simule le clavier HeliBoard touche par touche, avec les mêmes appels au moteur que le pont
 * (clavier/heliboard/src/CorrecteurReel.kt) : correction à l'espace, grammaire du mot qui se termine,
 * puis des mots précédents, retour arrière qui annule la dernière correction.
 */
class ClavierSimule(lexique: Lexique) {
    val saisie = Saisie(Correcteur(lexique))
    val texte = StringBuilder()
    private val enCours = StringBuilder()
    private var espaceEnAttente = false

    private class Ecrit(val tape: String, val ecrit: String, val separateur: Char, val precedent: String?, val debutPhrase: Boolean)
    private var dernier: Ecrit? = null

    /** Mot précédent tel que le donne HeliBoard : rien après une ponctuation, et le début de phrase. */
    private fun contexte(): Pair<String?, Boolean> {
        val m = Regex("([\\p{L}'’-]+)([^\\p{L}'’-]*)$").find(texte)
        if (m == null) return null to true
        val separateur = m.groupValues[2]
        if (Regex("[.!?…\\n]").containsMatchIn(separateur)) return null to true
        if (Regex("[,;:()\"«»]").containsMatchIn(separateur)) return null to false
        return m.groupValues[1] to false
    }

    fun taper(s: String): ClavierSimule {
        s.forEach(::touche)
        return this
    }

    private fun touche(ch: Char) {
        if (ch.isLetter() || ch == '\'' || ch == '-') {
            if (espaceEnAttente) texte.append(' ')
            espaceEnAttente = false
            enCours.append(ch)
            dernier = null
            return
        }
        espaceEnAttente = false
        if (enCours.isEmpty()) {
            texte.append(ch)
            dernier = null
            return
        }
        val tape = enCours.toString()
        enCours.clear()
        val (precedent, debutPhrase) = contexte()
        val avis = saisie.avis(tape, precedent, debutPhrase)
        val mot = saisie.accorder(texte.toString() + tape, tape, avis?.correction ?: tape, ch.toString())
        saisie.motEcrit(mot, false, precedent, debutPhrase)
        texte.append(mot).append(ch)
        dernier = if (mot != tape) Ecrit(tape, mot, ch, precedent, debutPhrase) else null
        saisie.grammaireApresMot(texte.toString())?.let { r ->
            texte.setLength(r.debut)
            texte.append(r.nouvelleFin)
        }
    }

    /** Retour arrière juste après une correction : le mot tapé revient, l'espace attend la touche suivante. */
    fun annuler(): ClavierSimule {
        val d = dernier ?: fail("rien à annuler dans « $texte »")
        val fin = d.ecrit + d.separateur
        assertTrue(texte.endsWith(fin), "« $texte » ne finit pas par « $fin »")
        texte.setLength(texte.length - fin.length)
        texte.append(d.tape)
        espaceEnAttente = d.separateur == ' '
        saisie.correctionAnnulee(d.tape, d.ecrit, d.precedent, d.debutPhrase, apprendre = true)
        dernier = null
        return this
    }

    override fun toString() = texte.toString() + enCours
}

class SaisieTest {
    private val lexique = Donnees.lexique
    private fun taper(s: String) = ClavierSimule(lexique).taper(s).toString()

    @Test
    fun `les fautes courantes sont corrigées pendant la frappe`() {
        val cas = listOf(
            "c'est tres reel " to "c'est très réel ",
            "je vais a paris " to "je vais à paris ",
            "ils mange " to "ils mangent ",
            "j'ai manger une pomme " to "j'ai mangé une pomme ",
            "il est la. " to "il est là. ",
            "ou est le telephonne ? " to "où est le téléphone ? ",
            "sa va, bien sur que oui. " to "ça va, bien sûr que oui. ",
            "je vais mangé " to "je vais manger ",
            "nous mange ensemble " to "nous mangeons ensemble ",
            "il c'est trompé " to "il s'est trompé ",
            "je sais pas ou il est " to "je sais pas où il est ",
            "elle est aller au cinema " to "elle est allée au cinéma ",
            "aujourdhui " to "aujourd'hui ",
        )
        val echecs = cas.filter { (tape, attendu) -> taper(tape) != attendu }
            .map { (tape, attendu) -> "« $tape » → « ${taper(tape)} » (attendu « $attendu »)" }
        if (echecs.isNotEmpty()) fail(echecs.joinToString("\n"))
    }

    @Test
    fun `aucune phrase correcte n'est modifiée pendant la frappe`() {
        val modifiees = PHRASES_CORRECTES.map { it + " " }.filter { taper(it) != it }.map { "« $it » → « ${taper(it)} »" }
        if (modifiees.isNotEmpty()) fail("${modifiees.size} phrases modifiées :\n" + modifiees.joinToString("\n"))
    }

    @Test
    fun `reel reste corrigé même après des annulations`() {
        val clavier = ClavierSimule(lexique)
        repeat(5) { clavier.taper(" reel ").annuler() }
        clavier.taper(" reel ")
        assertTrue(clavier.toString().endsWith("réel "), clavier.toString())
    }

    @Test
    fun `deux annulations font apprendre un mot`() {
        val clavier = ClavierSimule(lexique).taper("trop mdr ")
        assertEquals("trop mer ", clavier.toString())
        clavier.annuler().taper(" ah mdr ").annuler()
        clavier.taper(" ok mdr ")
        assertTrue(clavier.toString().endsWith("ok mdr "), clavier.toString())
    }

    @Test
    fun `une correction de grammaire annulée n'est pas refaite`() {
        val clavier = ClavierSimule(lexique).taper("ils mange ")
        assertEquals("ils mangent ", clavier.toString())
        clavier.annuler().taper(" et dorment ")
        assertEquals("ils mange et dorment ", clavier.toString())
    }

    @Test
    fun `j'ai et l'homme sont traités morceau par morceau`() {
        val saisie = Saisie(Correcteur(lexique))
        assertEquals(null, saisie.avis("j'ai", null, true)?.correction)
        assertEquals("l'école", saisie.avis("l'ecole", "vers", false)?.correction)
        assertTrue(saisie.avis("j'ai", null, true)!!.valide)
    }

    companion object {
        val PHRASES_CORRECTES = listOf(
            "Il a mangé une pomme.", "Je vais à Paris demain.", "Elle est là.", "Tu veux du café ou du thé ?",
            "Où est le chat ?", "C'est sûr qu'il viendra.", "Il est sur la table.", "Ils ont faim.", "Nous mangeons ensemble.",
            "Il nous mange.", "Vous nous avez vus.", "Je vous aime.", "Lui et elle mangent.", "Ce que tu dis a du sens.",
            "Ce qu'il voulait a été fait.", "La porte a été fermée.", "Il y a du monde.", "Le chat a faim.", "Marie a un chien.",
            "J'ai été manger chez lui.", "Il peut être content.", "C'est ce que je veux.", "Il faut manger.", "Je dois partir.",
            "Elle s'est levée tôt.", "Ça va bien.", "Sa mère est partie.", "Ses parents sont là.", "Ces gens sont gentils.",
            "Il fait beau aujourd'hui.", "Je sais où il est.", "Tu manges ou tu dors ?", "Le jour où il est venu.",
            "Un jour ou l'autre.", "Je suis allé manger.", "Elle est allée acheter du pain.", "Il n'y a rien de prévu.",
            "Un sentiment de passé.", "Une étude de marché.", "Des vacances d'été.", "Il est passé hier.", "Je l'ai vu.",
            "On a gagné !", "Il a peur.", "Elle a raison.", "C'est à moi.", "Je pense à toi.", "Tu as vu ça ?", "Il semble fatigué.",
            "Les enfants jouent dehors.", "Je ne sais pas.", "Peut-être demain.", "Il était une fois.", "Bien sûr que oui.",
            "Je t'aime.", "Il se lave.", "Elle se lève.", "Qu'est-ce que tu fais ?", "Je suis sûr de moi.", "La forêt est belle.",
            "C'est la vie.", "Je la vois.", "Mets-la là.", "Par là.", "Ce jour-là.", "Celui-là.", "Tu invites qui ?",
            "Il voila son visage.", "On est bien.", "Et il mange.", "Paul et elle mangent.", "Je mange et elle dort.",
            "A priori non.", "Il a mal au dos.", "Il a à faire.", "J'ai du travail à faire.", "Le vent a tourné.",
            "Tout le monde a compris.", "Ça me plaît.", "Il a acheté une voiture.", "Je voudrais un café.", "Elle aime danser.",
            "Il est tard.", "C'est trop bien !", "Vous êtes sûrs ?", "On se voit demain ?", "Elles sont parties.",
            "Je me demande où tu vas.", "Il ne le sait pas.", "Tu ne me l'as pas dit.", "Il en a marre.", "Qui a fait ça ?",
            "Ma sœur a un chat.", "Il a mangé et bu.", "L'été est chaud.", "Il a été malade.", "Un employé de bureau.",
            "Le passé est passé.", "Il faut le dire.", "Je préfère rester.", "Va chercher le pain.", "Il est venu me voir.",
            "Cela fait du bien.", "La cote de popularité.", "La côte est belle.", "Il a l'air content.",
        )
    }
}
