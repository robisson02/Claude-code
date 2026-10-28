// Disposition AZERTY d'un téléphone et distance d'édition pondérée par la proximité des touches.

const RANGEES = ["azertyuiop", "qsdfghjklm", "wxcvbn"];
// Décalage horizontal de chaque rangée (en largeur de touche) : sur le clavier Samsung, « w » est sous « s »/« d ».
const DECALAGES = [0, 0, 1.5];

const POSITIONS = new Map();
RANGEES.forEach((rangee, y) => {
  [...rangee].forEach((lettre, x) => POSITIONS.set(lettre, { x: x + DECALAGES[y], y }));
});

/** Vrai si deux lettres sont sur des touches voisines (le doigt a glissé). */
export function voisines(a, b) {
  const pa = POSITIONS.get(a);
  const pb = POSITIONS.get(b);
  if (!pa || !pb || a === b) return false;
  return Math.hypot(pa.x - pb.x, pa.y - pb.y) <= 1.5;
}

// Coûts des erreurs de frappe : une touche voisine ou une lettre doublée coûte moins qu'une lettre au hasard.
export const COUTS = {
  substitutionVoisine: 0.5,
  substitution: 1,
  insertionDoublee: 0.5, // « telephonne » : lettre tapée deux fois
  insertionVoisine: 0.7, // « bonjoiur » : touche voisine effleurée en plus
  insertion: 1,
  omissionDoublee: 0.5, // « apeler » : lettre double oubliée
  omission: 1,
  transposition: 0.6, // « chein » : deux lettres inversées
};

/**
 * Distance de Damerau-Levenshtein pondérée entre ce qui a été tapé et un mot candidat.
 * Les deux chaînes sont des clés (sans accents) : les oublis d'accents ne coûtent rien ici.
 * Au-delà de `max`, le calcul s'arrête et renvoie Infinity.
 */
export function distanceFrappe(tape, mot, max = Infinity) {
  const n = tape.length;
  const m = mot.length;
  const d = Array.from({ length: n + 1 }, () => new Float64Array(m + 1));
  for (let i = 1; i <= n; i++) d[i][0] = d[i - 1][0] + coutInsertion(tape, i - 1);
  for (let j = 1; j <= m; j++) d[0][j] = d[0][j - 1] + coutOmission(mot, j - 1);
  let minAvant = 0;
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      const a = tape[i - 1];
      const b = mot[j - 1];
      let cout = a === b ? 0 : voisines(a, b) ? COUTS.substitutionVoisine : COUTS.substitution;
      let meilleur = d[i - 1][j - 1] + cout;
      meilleur = Math.min(meilleur, d[i - 1][j] + coutInsertion(tape, i - 1));
      meilleur = Math.min(meilleur, d[i][j - 1] + coutOmission(mot, j - 1));
      if (i > 1 && j > 1 && a === mot[j - 2] && tape[i - 2] === b && a !== b) {
        meilleur = Math.min(meilleur, d[i - 2][j - 2] + COUTS.transposition);
      }
      d[i][j] = meilleur;
    }
    // Les lignes suivantes dépendent de cette ligne, et de la précédente par une inversion.
    const minLigne = Math.min(...d[i]);
    if (minLigne > max && minAvant + COUTS.transposition > max) return Infinity;
    minAvant = minLigne;
  }
  return d[n][m];
}

// Lettre tapée en trop à la position i de ce qui a été tapé.
function coutInsertion(tape, i) {
  const c = tape[i];
  const avant = tape[i - 1];
  const apres = tape[i + 1];
  if (c === avant || c === apres) return COUTS.insertionDoublee;
  if (voisines(c, avant) || voisines(c, apres)) return COUTS.insertionVoisine;
  return COUTS.insertion;
}

// Lettre du mot oubliée à la position j.
function coutOmission(mot, j) {
  const c = mot[j];
  if (c === mot[j - 1] || c === mot[j + 1]) return COUTS.omissionDoublee;
  return COUTS.omission;
}

const ALPHABET = "abcdefghijklmnopqrstuvwxyz";

/** Toutes les chaînes à une seule modification (suppression, inversion, remplacement, ajout) de la clé. */
export function* variantes(k) {
  for (let i = 0; i <= k.length; i++) {
    const g = k.slice(0, i);
    const d = k.slice(i);
    if (d) yield g + d.slice(1);
    if (d.length > 1) yield g + d[1] + d[0] + d.slice(2);
    for (const c of ALPHABET) {
      if (d && c !== d[0]) yield g + c + d.slice(1);
      yield g + c + d;
    }
  }
}
