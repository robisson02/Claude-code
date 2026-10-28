// Petites classes de mots utilisées par le classement des suggestions et par les règles de grammaire.

/** Pronoms sujets et la personne de conjugaison qu'ils imposent. */
export const SUJETS = new Map([
  ["je", "1s"], ["j'", "1s"], ["tu", "2s"], ["il", "3s"], ["elle", "3s"], ["on", "3s"],
  ["nous", "1p"], ["vous", "2p"], ["ils", "3p"], ["elles", "3p"],
]);

/** Pronoms qui peuvent se glisser entre le sujet et le verbe : « il NE LE LUI a pas dit ». */
export const CLITIQUES = new Set([
  "ne", "n'", "me", "m'", "te", "t'", "se", "s'", "le", "la", "les", "l'", "lui", "leur", "y", "en", "nous", "vous",
]);

/** Pronoms toniques, qui ne sont jamais sujets à eux seuls d'un verbe qui suit une coordination. */
export const TONIQUES = new Set(["moi", "toi", "lui", "elle", "nous", "vous", "eux", "elles"]);

/** Déterminants avec le genre et le nombre qu'ils imposent ("" : indifférent). */
export const DETERMINANTS = new Map([
  ["le", ["m", "s"]], ["un", ["m", "s"]], ["ce", ["m", "s"]], ["cet", ["m", "s"]], ["du", ["m", "s"]], ["au", ["m", "s"]],
  ["la", ["f", "s"]], ["une", ["f", "s"]], ["cette", ["f", "s"]], ["ma", ["f", "s"]], ["ta", ["f", "s"]], ["sa", ["f", "s"]],
  // « mon amie » : mon/ton/son s'emploient aussi devant un nom féminin commençant par une voyelle.
  ["mon", ["", "s"]], ["ton", ["", "s"]], ["son", ["", "s"]],
  ["l'", ["", "s"]], ["notre", ["", "s"]], ["votre", ["", "s"]], ["leur", ["", "s"]], ["chaque", ["", "s"]],
  ["les", ["", "p"]], ["des", ["", "p"]], ["ces", ["", "p"]], ["mes", ["", "p"]], ["tes", ["", "p"]], ["ses", ["", "p"]],
  ["nos", ["", "p"]], ["vos", ["", "p"]], ["leurs", ["", "p"]], ["aux", ["", "p"]], ["quelques", ["", "p"]],
  ["plusieurs", ["", "p"]],
]);

/** Déterminants qui sont aussi des pronoms (« je LA vois ») : on ne pénalise pas un verbe après eux. */
export const DETERMINANTS_AMBIGUS = new Set(["le", "la", "les", "l'", "leur"]);

/** Adverbes qui peuvent séparer un auxiliaire de son participe : « j'ai PAS ENCORE mangé ». */
export const ADVERBES_INTERCALES = new Set([
  "pas", "plus", "jamais", "rien", "bien", "mal", "déjà", "tout", "toujours", "encore", "beaucoup", "trop",
  "vraiment", "souvent", "peu", "même", "aussi", "enfin", "presque", "seulement", "tellement", "vite",
  "longtemps", "assez", "certainement", "sûrement", "probablement", "forcément", "juste", "carrément",
  "complètement", "totalement", "point", "guère", "peut-être", "très",
]);

/** Mots après lesquels un pronom « nous »/« vous » en tête de chaîne est forcément sujet. */
export const OUVRANTS = new Set([
  "et", "mais", "ou", "puis", "alors", "donc", "quand", "si", "que", "qu'", "comme", "lorsque", "lorsqu'",
  "puisque", "puisqu'", "car", "parce", "où", "pourquoi", "comment",
]);

export const INTERROGATIFS = new Set(["qu'", "pourquoi", "où", "comment", "quand", "quoi", "qui", "combien"]);
