// Normalisation et découpage du texte.

// Préfixes qui s'élident devant une voyelle : « j'ai » se découpe en « j' » + « ai ».
const ELISIONS = new Set(["j", "l", "d", "m", "t", "s", "c", "n", "qu", "jusqu", "lorsqu", "puisqu", "quoiqu"]);

/** Uniformise les apostrophes et les ligatures pour que « cœur » et « coeur », « l’ami » et « l'ami » se comparent. */
export function normaliser(s) {
  return s
    .normalize("NFC")
    .replace(/[’ʼ‘`]/g, "'")
    .replace(/œ/g, "oe")
    .replace(/Œ/g, "Oe")
    .replace(/æ/g, "ae")
    .replace(/Æ/g, "Ae");
}

export function sansAccents(s) {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").normalize("NFC");
}

/**
 * Clé de recherche insensible aux accents, à la casse, aux apostrophes et aux traits d'union.
 * Deux mots qui ont la même clé ne diffèrent que par ce que l'on tape mal sur un téléphone :
 * cle("Réel") === cle("reel") === "reel", cle("aujourd'hui") === "aujourdhui".
 */
export function cle(s) {
  return sansAccents(normaliser(s).toLowerCase()).replace(/['-]/g, "");
}

/** Forme de référence d'un mot pour les recherches dans le lexique. */
export function forme(s) {
  return normaliser(s).toLowerCase();
}

/** Décrit la casse d'un mot tapé pour pouvoir la reproduire sur la correction. */
export function casse(mot) {
  const lettres = [...mot].filter((c) => c.toLowerCase() !== c.toUpperCase());
  if (lettres.length === 0) return "minuscules";
  const majuscules = lettres.filter((c) => c === c.toUpperCase() && c !== c.toLowerCase());
  if (majuscules.length === 0) return "minuscules";
  if (majuscules.length === lettres.length && lettres.length > 1) return "majuscules";
  if (majuscules.length === 1 && lettres[0] === majuscules[0]) return "capitale";
  return "mixte";
}

export function appliquerCasse(mot, modele) {
  if (modele === "majuscules") return mot.toUpperCase();
  if (modele === "capitale") {
    const premier = mot.search(/\p{L}/u);
    if (premier < 0) return mot;
    return mot.slice(0, premier) + mot[premier].toUpperCase() + mot.slice(premier + 1);
  }
  return mot;
}

const RE_MOT = /\p{L}+(?:['’-]\p{L}+)*['’]?/gu;
const FIN_PHRASE = /[.!?…\n]/;
const FIN_PROPOSITION = /[.!?…\n,;:()"«»[\]{}]/;

/**
 * Découpe un texte en mots, en conservant leur position.
 *
 * Chaque mot indique s'il commence une phrase (après « . », « ! », « ? »…) ou une proposition
 * (après une virgule, un point-virgule…), ce dont les règles de grammaire ont besoin pour ne pas
 * relier deux mots séparés par une ponctuation.
 *
 * @param {string} texte
 * @param {(forme: string) => boolean} estConnu permet de garder entiers les mots comme « aujourd'hui »
 */
export function tokeniser(texte, estConnu = () => false) {
  const mots = [];
  let finPrecedent = 0;
  for (const m of texte.matchAll(RE_MOT)) {
    const separateur = texte.slice(finPrecedent, m.index);
    const debutPhrase = mots.length === 0 || FIN_PHRASE.test(separateur);
    const debutProposition = debutPhrase || FIN_PROPOSITION.test(separateur);
    const morceaux = decouperElisions(m[0], estConnu);
    let position = m.index;
    morceaux.forEach((morceau, k) => {
      mots.push({
        texte: morceau,
        forme: forme(morceau),
        debut: position,
        fin: position + morceau.length,
        debutPhrase: k === 0 && debutPhrase,
        debutProposition: k === 0 && debutProposition,
      });
      position += morceau.length;
    });
    finPrecedent = m.index + m[0].length;
  }
  return mots;
}

function decouperElisions(mot, estConnu) {
  const morceaux = [];
  let reste = mot;
  while (true) {
    const f = forme(reste);
    if (estConnu(f)) break;
    const apostrophe = reste.search(/['’]/);
    if (apostrophe <= 0 || apostrophe === reste.length - 1) break;
    const prefixe = forme(reste.slice(0, apostrophe));
    if (!ELISIONS.has(prefixe)) break;
    morceaux.push(reste.slice(0, apostrophe + 1));
    reste = reste.slice(apostrophe + 1);
  }
  morceaux.push(reste);
  return morceaux;
}
