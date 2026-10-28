// Petites classes de mots utilisées par le classement des suggestions et par les règles de grammaire.
// Portage de correcteur/src/mots.js.

package fr.correcteurreel

/** Pronoms sujets et la personne de conjugaison qu'ils imposent. */
val SUJETS = linkedMapOf(
    "je" to "1s", "j'" to "1s", "tu" to "2s", "il" to "3s", "elle" to "3s", "on" to "3s",
    "nous" to "1p", "vous" to "2p", "ils" to "3p", "elles" to "3p",
)

/** Pronoms qui peuvent se glisser entre le sujet et le verbe : « il NE LE LUI a pas dit ». */
val CLITIQUES = setOf(
    "ne", "n'", "me", "m'", "te", "t'", "se", "s'", "le", "la", "les", "l'", "lui", "leur", "y", "en", "nous", "vous",
)

/** Pronoms toniques, qui ne sont jamais sujets à eux seuls d'un verbe qui suit une coordination. */
val TONIQUES = setOf("moi", "toi", "lui", "elle", "nous", "vous", "eux", "elles")

/** Déterminants avec le genre et le nombre qu'ils imposent ("" : indifférent). */
val DETERMINANTS: Map<String, Pair<String, String>> = mapOf(
    "le" to ("m" to "s"), "un" to ("m" to "s"), "ce" to ("m" to "s"), "cet" to ("m" to "s"), "du" to ("m" to "s"),
    "au" to ("m" to "s"),
    "la" to ("f" to "s"), "une" to ("f" to "s"), "cette" to ("f" to "s"), "ma" to ("f" to "s"), "ta" to ("f" to "s"),
    "sa" to ("f" to "s"),
    // « mon amie » : mon/ton/son s'emploient aussi devant un nom féminin commençant par une voyelle.
    "mon" to ("" to "s"), "ton" to ("" to "s"), "son" to ("" to "s"),
    "l'" to ("" to "s"), "notre" to ("" to "s"), "votre" to ("" to "s"), "leur" to ("" to "s"), "chaque" to ("" to "s"),
    "les" to ("" to "p"), "des" to ("" to "p"), "ces" to ("" to "p"), "mes" to ("" to "p"), "tes" to ("" to "p"),
    "ses" to ("" to "p"), "nos" to ("" to "p"), "vos" to ("" to "p"), "leurs" to ("" to "p"), "aux" to ("" to "p"),
    "quelques" to ("" to "p"), "plusieurs" to ("" to "p"),
)

/** Déterminants qui sont aussi des pronoms (« je LA vois ») : on ne pénalise pas un verbe après eux. */
val DETERMINANTS_AMBIGUS = setOf("le", "la", "les", "l'", "leur")

/** Adverbes qui peuvent séparer un auxiliaire de son participe : « j'ai PAS ENCORE mangé ». */
val ADVERBES_INTERCALES = setOf(
    "pas", "plus", "jamais", "rien", "bien", "mal", "déjà", "tout", "toujours", "encore", "beaucoup", "trop",
    "vraiment", "souvent", "peu", "même", "aussi", "enfin", "presque", "seulement", "tellement", "vite",
    "longtemps", "assez", "certainement", "sûrement", "probablement", "forcément", "juste", "carrément",
    "complètement", "totalement", "point", "guère", "peut-être", "très",
)

/** Mots après lesquels un pronom « nous »/« vous » en tête de chaîne est forcément sujet. */
val OUVRANTS = setOf(
    "et", "mais", "ou", "puis", "alors", "donc", "quand", "si", "que", "qu'", "comme", "lorsque", "lorsqu'",
    "puisque", "puisqu'", "car", "parce", "où", "pourquoi", "comment",
)

val INTERROGATIFS = setOf("qu'", "pourquoi", "où", "comment", "quand", "quoi", "qui", "combien")
