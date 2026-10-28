// Disposition AZERTY d'un téléphone et distance d'édition pondérée par la proximité des touches.
// Portage de correcteur/src/clavier.js.

package fr.correcteurreel

private val RANGEES = listOf("azertyuiop", "qsdfghjklm", "wxcvbn")
// Décalage horizontal de chaque rangée (en largeur de touche) : sur le clavier Samsung, « w » est sous « s »/« d ».
private val DECALAGES = listOf(0.0, 0.0, 1.5)

private class Position(val x: Double, val y: Double)

private val POSITIONS: Map<Char, Position> = buildMap {
    RANGEES.forEachIndexed { y, rangee ->
        rangee.forEachIndexed { x, lettre -> put(lettre, Position(x + DECALAGES[y], y.toDouble())) }
    }
}

/** Vrai si deux lettres sont sur des touches voisines (le doigt a glissé). */
fun voisines(a: Char?, b: Char?): Boolean {
    if (a == null || b == null || a == b) return false
    val pa = POSITIONS[a] ?: return false
    val pb = POSITIONS[b] ?: return false
    return StrictMath.hypot(pa.x - pb.x, pa.y - pb.y) <= 1.5
}

/** Coûts des erreurs de frappe : une touche voisine ou une lettre doublée coûte moins qu'une lettre au hasard. */
object Couts {
    const val SUBSTITUTION_VOISINE = 0.5
    const val SUBSTITUTION = 1.0
    const val INSERTION_DOUBLEE = 0.5 // « telephonne » : lettre tapée deux fois
    const val INSERTION_VOISINE = 0.7 // « bonjoiur » : touche voisine effleurée en plus
    const val INSERTION = 1.0
    const val OMISSION_DOUBLEE = 0.5 // « apeler » : lettre double oubliée
    const val OMISSION = 1.0
    const val TRANSPOSITION = 0.6 // « chein » : deux lettres inversées
}

/**
 * Distance de Damerau-Levenshtein pondérée entre ce qui a été tapé et un mot candidat.
 * Les deux chaînes sont des clés (sans accents) : les oublis d'accents ne coûtent rien ici.
 * Au-delà de [max], le calcul s'arrête et renvoie l'infini.
 */
fun distanceFrappe(tape: String, mot: String, max: Double = Double.POSITIVE_INFINITY): Double {
    val n = tape.length
    val m = mot.length
    val d = Array(n + 1) { DoubleArray(m + 1) }
    for (i in 1..n) d[i][0] = d[i - 1][0] + coutInsertion(tape, i - 1)
    for (j in 1..m) d[0][j] = d[0][j - 1] + coutOmission(mot, j - 1)
    var minAvant = 0.0
    for (i in 1..n) {
        for (j in 1..m) {
            val a = tape[i - 1]
            val b = mot[j - 1]
            val cout = if (a == b) 0.0 else if (voisines(a, b)) Couts.SUBSTITUTION_VOISINE else Couts.SUBSTITUTION
            var meilleur = d[i - 1][j - 1] + cout
            meilleur = minOf(meilleur, d[i - 1][j] + coutInsertion(tape, i - 1))
            meilleur = minOf(meilleur, d[i][j - 1] + coutOmission(mot, j - 1))
            if (i > 1 && j > 1 && a == mot[j - 2] && tape[i - 2] == b && a != b) {
                meilleur = minOf(meilleur, d[i - 2][j - 2] + Couts.TRANSPOSITION)
            }
            d[i][j] = meilleur
        }
        // Les lignes suivantes dépendent de cette ligne, et de la précédente par une inversion.
        val minLigne = d[i].min()
        if (minLigne > max && minAvant + Couts.TRANSPOSITION > max) return Double.POSITIVE_INFINITY
        minAvant = minLigne
    }
    return d[n][m]
}

// Lettre tapée en trop à la position i de ce qui a été tapé.
private fun coutInsertion(tape: String, i: Int): Double {
    val c = tape[i]
    val avant = tape.getOrNull(i - 1)
    val apres = tape.getOrNull(i + 1)
    if (c == avant || c == apres) return Couts.INSERTION_DOUBLEE
    if (voisines(c, avant) || voisines(c, apres)) return Couts.INSERTION_VOISINE
    return Couts.INSERTION
}

// Lettre du mot oubliée à la position j.
private fun coutOmission(mot: String, j: Int): Double {
    val c = mot[j]
    if (c == mot.getOrNull(j - 1) || c == mot.getOrNull(j + 1)) return Couts.OMISSION_DOUBLEE
    return Couts.OMISSION
}

private const val ALPHABET = "abcdefghijklmnopqrstuvwxyz"

/** Toutes les chaînes à une seule modification (suppression, inversion, remplacement, ajout) de la clé. */
fun variantes(k: String): Sequence<String> = sequence {
    for (i in 0..k.length) {
        val g = k.substring(0, i)
        val d = k.substring(i)
        if (d.isNotEmpty()) yield(g + d.substring(1))
        if (d.length > 1) yield(g + d[1] + d[0] + d.substring(2))
        for (c in ALPHABET) {
            if (d.isNotEmpty() && c != d[0]) yield(g + c + d.substring(1))
            yield(g + c + d)
        }
    }
}
