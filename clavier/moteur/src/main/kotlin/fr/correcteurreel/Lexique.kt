// Dictionnaire de référence : uniquement des mots validés, avec leurs fréquences et leurs analyses.
// Portage de correcteur/src/lexique.js.

package fr.correcteurreel

private val MODES_PERSONNELS = Regex("^(ind|sub|con):")

/** Une analyse possible d'une forme : « a » est à la fois un nom (la lettre) et le verbe avoir. */
class Lecture(
    val lemme: String,
    val cgram: String,
    val genre: String,
    val nombre: String,
    val freq: Double,
    /** Conjugaisons : « ind:pre:3s », « inf », « par:pas »… */
    val tags: List<String>,
)

/** Une forme conjuguée d'un verbe, avec l'analyse qui la décrit. */
class FormeConjuguee(val forme: String, val lecture: Lecture) {
    val genre get() = lecture.genre
    val nombre get() = lecture.nombre
    val freq get() = lecture.freq
}

class Entree(val forme: String) {
    var freq = 0.0
    val lectures = ArrayList<Lecture>(1)
}

class Lexique {
    /** forme → fréquence et analyses */
    val entrees = HashMap<String, Entree>(200_000)
    /** clé sans accents → formes, de la plus fréquente à la moins fréquente */
    private val parCle = HashMap<String, MutableList<String>>(200_000)
    /** lemme → tag de conjugaison (« ind:pre:3p ») → formes portant ce tag */
    private val conjugaisons = HashMap<String, HashMap<String, MutableList<FormeConjuguee>>>()
    private var clesTriees: Array<String> = emptyArray()
    /** première lettre → longueur → clés, pour chercher les mots à deux fautes près */
    private val parInitiale = HashMap<Char, HashMap<Int, MutableList<String>>>()
    // Partage des petites chaînes et listes répétées des milliers de fois (catégories, conjugaisons, lemmes).
    private val chaines = HashMap<String, String>()
    private val listesDeTags = HashMap<String, List<String>>()

    private fun partager(s: String) = chaines.getOrPut(s) { s }

    /** Charge un fichier au format de correcteur/data/lexique-fr.tsv (une ligne par analyse). */
    fun charger(texte: CharSequence) {
        for (ligne in texte.lineSequence()) {
            if (ligne.isEmpty() || ligne.startsWith("#")) continue
            val c = ligne.split('\t')
            val ortho = c[0]
            val lemme = c.getOrNull(1).orEmpty().ifEmpty { ortho }
            val tags = c.getOrNull(6).orEmpty()
            ajouter(
                ortho,
                Lecture(
                    lemme = partager(lemme),
                    cgram = partager(c.getOrNull(2).orEmpty()),
                    genre = partager(c.getOrNull(3).orEmpty()),
                    nombre = partager(c.getOrNull(4).orEmpty()),
                    freq = c.getOrNull(5)?.toDoubleOrNull()?.takeUnless { it.isNaN() } ?: 0.0,
                    tags = listesDeTags.getOrPut(tags) { if (tags.isEmpty()) emptyList() else tags.split(',').map(::partager) },
                ),
            )
        }
    }

    fun ajouter(ortho: String, lecture: Lecture) {
        val f = forme(ortho)
        val entree = entrees.getOrPut(f) {
            val k = cle(f)
            // La plupart des mots n'ont ni accent ni apostrophe : leur clé est la forme elle-même.
            parCle.getOrPut(if (k == f) f else k) { ArrayList(1) }.add(f)
            Entree(f)
        }
        entree.freq += lecture.freq
        entree.lectures += lecture
        if (lecture.cgram == "VER" || lecture.cgram == "AUX") {
            val parTag = conjugaisons.getOrPut(lecture.lemme) { HashMap() }
            for (tag in lecture.tags) parTag.getOrPut(tag) { mutableListOf() } += FormeConjuguee(f, lecture)
        }
    }

    /** À appeler une fois tout chargé : trie les formes et construit les index de recherche. */
    fun finaliser() {
        for (formes in parCle.values) formes.sortByDescending { frequence(it) }
        clesTriees = parCle.keys.toTypedArray().also { it.sort() }
        for (k in clesTriees) {
            if (k.isEmpty()) continue
            parInitiale.getOrPut(k[0]) { HashMap() }.getOrPut(k.length) { mutableListOf() } += k
        }
        chaines.clear()
        listesDeTags.clear()
    }

    /** Clés de même initiale et de longueur proche (on se trompe rarement sur la première lettre deux fois). */
    fun clesVoisines(k: String, ecart: Int = 2): Sequence<String> = sequence {
        val parLongueur = parInitiale[k[0]] ?: return@sequence
        for (n in k.length - ecart..k.length + ecart) parLongueur[n]?.let { yieldAll(it) }
    }

    fun contient(mot: String) = entrees.containsKey(forme(mot))

    fun frequence(mot: String) = entrees[forme(mot)]?.freq ?: 0.0

    fun lectures(mot: String): List<Lecture> = entrees[forme(mot)]?.lectures ?: emptyList()

    fun formesParCle(k: String): List<String> = parCle[k] ?: emptyList()

    /** Formes d'un verbe pour un tag donné (« ind:pre:3p »), de la plus fréquente à la moins fréquente. */
    fun conjuguer(lemme: String, tag: String): List<FormeConjuguee> =
        conjugaisons[lemme]?.get(tag)?.sortedByDescending { it.freq } ?: emptyList()

    /** Clés commençant par un préfixe, pour proposer des complétions pendant la frappe. */
    fun clesCommencantPar(prefixe: String): Sequence<String> = sequence {
        var bas = 0
        var haut = clesTriees.size
        while (bas < haut) {
            val milieu = (bas + haut) ushr 1
            if (clesTriees[milieu] < prefixe) bas = milieu + 1 else haut = milieu
        }
        var i = bas
        while (i < clesTriees.size && clesTriees[i].startsWith(prefixe)) yield(clesTriees[i++])
    }

    // --- Analyse grammaticale élémentaire ------------------------------------------------------

    fun aCategorie(mot: String, vararg categories: String) =
        lectures(mot).any { l -> categories.any { c -> l.cgram == c || l.cgram.startsWith("$c:") } }

    fun lecturesVerbales(mot: String) = lectures(mot).filter { it.cgram == "VER" || it.cgram == "AUX" }

    /** Vrai si le mot peut être un verbe conjugué à un mode personnel (indicatif, subjonctif, conditionnel). */
    fun estVerbeConjugue(mot: String) =
        lecturesVerbales(mot).any { l -> l.tags.any { MODES_PERSONNELS.containsMatchIn(it) } }

    fun estInfinitif(mot: String) = lecturesVerbales(mot).any { "inf" in it.tags }

    fun estParticipePasse(mot: String) = lecturesVerbales(mot).any { "par:pas" in it.tags }

    /** Vrai si le mot peut s'accorder avec une personne (« 3p ») à un mode personnel. */
    fun saccordeAvec(mot: String, personne: String) = lecturesVerbales(mot).any { l ->
        l.tags.any { MODES_PERSONNELS.containsMatchIn(it) && it.endsWith(":$personne") }
    }

    companion object {
        /** Construit un lexique à partir d'un ou plusieurs fichiers au format de lexique-fr.tsv. */
        fun depuisTextes(vararg textes: CharSequence): Lexique {
            val lexique = Lexique()
            for (texte in textes) lexique.charger(texte)
            lexique.finaliser()
            return lexique
        }
    }
}
