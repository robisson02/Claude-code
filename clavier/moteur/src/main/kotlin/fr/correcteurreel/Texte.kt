// Normalisation et découpage du texte. Portage de correcteur/src/texte.js.

package fr.correcteurreel

import java.text.Normalizer

// Préfixes qui s'élident devant une voyelle : « j'ai » se découpe en « j' » + « ai ».
private val ELISIONS = setOf("j", "l", "d", "m", "t", "s", "c", "n", "qu", "jusqu", "lorsqu", "puisqu", "quoiqu")

private val APOSTROPHES = Regex("[’ʼ‘`]")
private val DIACRITIQUES = Regex("[\\u0300-\\u036f]")
private val APOSTROPHE_OU_TRAIT = Regex("['-]")
private val LETTRE = Regex("\\p{L}")

/** Uniformise les apostrophes et les ligatures pour que « cœur » et « coeur », « l’ami » et « l'ami » se comparent. */
fun normaliser(s: String): String =
    Normalizer.normalize(s, Normalizer.Form.NFC)
        .replace(APOSTROPHES, "'")
        .replace("œ", "oe")
        .replace("Œ", "Oe")
        .replace("æ", "ae")
        .replace("Æ", "Ae")

fun sansAccents(s: String): String =
    Normalizer.normalize(Normalizer.normalize(s, Normalizer.Form.NFD).replace(DIACRITIQUES, ""), Normalizer.Form.NFC)

/**
 * Clé de recherche insensible aux accents, à la casse, aux apostrophes et aux traits d'union.
 * Deux mots qui ont la même clé ne diffèrent que par ce que l'on tape mal sur un téléphone :
 * cle("Réel") == cle("reel") == "reel", cle("aujourd'hui") == "aujourdhui".
 */
fun cle(s: String): String = sansAccents(normaliser(s).lowercase()).replace(APOSTROPHE_OU_TRAIT, "")

/** Forme de référence d'un mot pour les recherches dans le lexique. */
fun forme(s: String): String = normaliser(s).lowercase()

enum class Casse { MINUSCULES, MAJUSCULES, CAPITALE, MIXTE }

private fun estLettre(c: Char) = c.lowercaseChar() != c.uppercaseChar()

/** Décrit la casse d'un mot tapé pour pouvoir la reproduire sur la correction. */
fun casse(mot: String): Casse {
    val lettres = mot.filter(::estLettre)
    if (lettres.isEmpty()) return Casse.MINUSCULES
    val majuscules = lettres.filter { it == it.uppercaseChar() && it != it.lowercaseChar() }
    if (majuscules.isEmpty()) return Casse.MINUSCULES
    if (majuscules.length == lettres.length && lettres.length > 1) return Casse.MAJUSCULES
    if (majuscules.length == 1 && lettres[0] == majuscules[0]) return Casse.CAPITALE
    return Casse.MIXTE
}

fun appliquerCasse(mot: String, modele: Casse): String = when (modele) {
    Casse.MAJUSCULES -> mot.uppercase()
    Casse.CAPITALE -> {
        val premier = LETTRE.find(mot)?.range?.first
        if (premier == null) mot else mot.substring(0, premier) + mot[premier].toString().uppercase() + mot.substring(premier + 1)
    }
    else -> mot
}

/** Un mot du texte, avec sa position et sa place dans la phrase. */
data class Mot(
    val texte: String,
    val forme: String,
    val debut: Int,
    val fin: Int,
    /** Premier mot du texte ou mot qui suit « . », « ! », « ? »… */
    val debutPhrase: Boolean,
    /** Premier mot d'une phrase ou mot qui suit une virgule, un point-virgule… */
    val debutProposition: Boolean,
)

private val RE_MOT = Regex("\\p{L}+(?:['’-]\\p{L}+)*['’]?")
private val FIN_PHRASE = Regex("[.!?…\\n]")
private val FIN_PROPOSITION = Regex("[.!?…\\n,;:()\"«»\\[\\]{}]")

/**
 * Découpe un texte en mots, en conservant leur position.
 *
 * Chaque mot indique s'il commence une phrase ou une proposition, ce dont les règles de grammaire ont
 * besoin pour ne pas relier deux mots séparés par une ponctuation.
 *
 * @param estConnu permet de garder entiers les mots comme « aujourd'hui »
 */
fun tokeniser(texte: String, estConnu: (String) -> Boolean = { false }): List<Mot> {
    val mots = mutableListOf<Mot>()
    var finPrecedent = 0
    for (m in RE_MOT.findAll(texte)) {
        val separateur = texte.substring(finPrecedent, m.range.first)
        val debutPhrase = mots.isEmpty() || FIN_PHRASE.containsMatchIn(separateur)
        val debutProposition = debutPhrase || FIN_PROPOSITION.containsMatchIn(separateur)
        var position = m.range.first
        decouperElisions(m.value, estConnu).forEachIndexed { k, morceau ->
            mots += Mot(
                texte = morceau,
                forme = forme(morceau),
                debut = position,
                fin = position + morceau.length,
                debutPhrase = k == 0 && debutPhrase,
                debutProposition = k == 0 && debutProposition,
            )
            position += morceau.length
        }
        finPrecedent = m.range.last + 1
    }
    return mots
}

private fun decouperElisions(mot: String, estConnu: (String) -> Boolean): List<String> {
    val morceaux = mutableListOf<String>()
    var reste = mot
    while (true) {
        if (estConnu(forme(reste))) break
        val apostrophe = reste.indexOfFirst { it == '\'' || it == '’' }
        if (apostrophe <= 0 || apostrophe == reste.length - 1) break
        if (forme(reste.substring(0, apostrophe)) !in ELISIONS) break
        morceaux += reste.substring(0, apostrophe + 1)
        reste = reste.substring(apostrophe + 1)
    }
    morceaux += reste
    return morceaux
}
