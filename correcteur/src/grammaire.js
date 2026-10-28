// Règles de grammaire contextuelles : homophones (a/à, ou/où…), accord sujet-verbe,
// participe passé ou infinitif (« j'ai manger » → « j'ai mangé »).
//
// Chaque règle examine un mot et ses voisins DANS LA MÊME PROPOSITION et peut proposer une correction :
//   - confiance "haute"   : le clavier peut l'appliquer tout seul ;
//   - confiance "moyenne" : à souligner et à proposer, sans l'appliquer.
// Les règles privilégient la précision : dans le doute, elles ne disent rien.

import { appliquerCasse, casse, cle, forme, tokeniser } from "./texte.js";
import {
  ADVERBES_INTERCALES, CLITIQUES, DETERMINANTS, INTERROGATIFS, OUVRANTS, SUJETS, TONIQUES,
} from "./mots.js";

const TAG_PERSONNEL = /^(ind|sub|con):(\w+):\d[sp]$/;

/**
 * Vérifie la grammaire d'un texte.
 *
 * @param {string} texte
 * @param {import("./lexique.js").Lexique} lexique
 * @param {object} [options]
 * @param {boolean} [options.enCours] le texte est en cours de frappe : la fin du texte n'est pas la fin de la phrase
 * @returns {Array<{debut:number, fin:number, avant:string, apres:string, regle:string, message:string, confiance:"haute"|"moyenne"}>}
 */
export function verifierGrammaire(texte, lexique, { enCours = false } = {}) {
  const t = tokeniser(texte, (f) => lexique.contient(f));
  const finFermee = t.length > 0 && /[.!?…\n,;:()"«»]/.test(texte.slice(t[t.length - 1].fin));
  const ctx = { lex: lexique, enCours, finFermee };
  const corrections = [];
  const pris = new Set();
  for (const regle of REGLES) {
    for (let i = 0; i < t.length; i++) {
      const c = regle(t, i, ctx);
      if (!c) continue;
      const indices = [];
      for (let k = c.i; k <= c.j; k++) indices.push(k);
      if (indices.some((k) => pris.has(k))) continue;
      const debut = t[c.i].debut;
      const fin = t[c.j].fin;
      const avant = texte.slice(debut, fin);
      const apres = appliquerCasse(c.remplacement, casse(t[c.i].texte));
      if (forme(avant) === forme(apres)) continue;
      indices.forEach((k) => pris.add(k));
      corrections.push({ debut, fin, avant, apres, regle: c.regle, message: c.message, confiance: c.confiance });
    }
  }
  return corrections.sort((a, b) => a.debut - b.debut);
}

/** Applique des corrections (positions dans le texte d'origine) en partant de la fin. */
export function appliquerCorrections(texte, corrections) {
  let resultat = texte;
  for (const c of [...corrections].sort((a, b) => b.debut - a.debut)) {
    resultat = resultat.slice(0, c.debut) + c.apres + resultat.slice(c.fin);
  }
  return resultat;
}

// --- Outils ---------------------------------------------------------------------------------

function correction(i, remplacement, regle, message, confiance = "haute", j = i) {
  return { i, j, remplacement, regle, message, confiance };
}

function precedent(t, i) {
  return i > 0 && !t[i].debutProposition ? t[i - 1] : null;
}

function suivant(t, i) {
  return i + 1 < t.length && !t[i + 1].debutProposition ? t[i + 1] : null;
}

/** true : la proposition s'arrête après le mot i ; false : un mot suit ; null : pas encore tapé. */
function finProposition(t, i, ctx) {
  if (i + 1 < t.length) return t[i + 1].debutProposition;
  if (ctx.finFermee) return true;
  return ctx.enCours ? null : true;
}

function estNomPropre(mot) {
  return casse(mot.texte) === "capitale" && !mot.debutPhrase;
}

/** « vas-tu » → « vas » : la partie verbale d'une inversion. */
function partieVerbale(lex, f) {
  return lex.contient(f) ? f : f.split("-")[0];
}

/** "avoir", "être" ou null selon que le mot est une forme conjuguée (ou l'infinitif) d'un auxiliaire. */
function auxiliaire(lex, f) {
  for (const l of lex.lecturesVerbales(f)) {
    if ((l.lemme === "avoir" || l.lemme === "être") && l.tags.some((tag) => TAG_PERSONNEL.test(tag) || tag === "inf")) {
      return l.lemme;
    }
  }
  return null;
}

/** Vrai si le mot est le plus souvent un nom (« chat », « travail ») plutôt qu'un pronom ou un verbe (« rien »). */
function estSurtoutNom(lex, f) {
  const lectures = lex.lectures(f);
  const nom = lectures.filter((l) => l.cgram === "NOM").reduce((s, l) => s + l.freq, 0);
  const total = lectures.reduce((s, l) => s + l.freq, 0);
  return nom > 0 && nom >= total / 2;
}

/** Un relatif (« ce QUE tu dis a… ») rend le sujet du verbe suivant difficile à trouver : on baisse la confiance. */
function contientRelatif(t, i) {
  for (let k = i - 1; k >= 0; k--) {
    if (["que", "qu'", "qui", "dont", "où", "quoi"].includes(t[k].forme)) return true;
    if (t[k].debutProposition) break;
  }
  return false;
}

/**
 * Cherche le pronom sujet du verbe en position i, en remontant les pronoms compléments :
 * « il NOUS LE donne » → « il » ; « nous LE donnons » → « nous ».
 */
function trouverSujet(t, i, lex) {
  let k = i - 1;
  const chaine = [];
  while (k >= 0 && !t[k + 1].debutProposition && CLITIQUES.has(t[k].forme)) {
    chaine.unshift(k);
    k--;
  }
  const avant = k >= 0 && !t[k + 1].debutProposition ? t[k] : null;
  if (avant && SUJETS.has(avant.forme)) {
    // « lui et elle mangent » : le vrai sujet est coordonné, on ne sait pas l'accorder.
    if (TONIQUES.has(avant.forme) && k >= 2 && !t[k].debutProposition && !t[k - 1].debutProposition
        && ["et", "ou", "ni"].includes(t[k - 1].forme)) {
      const x = t[k - 2];
      const nom = casse(x.texte) === "capitale" || (lex.aCategorie(x.forme, "NOM", "NPR") && !lex.estVerbeConjugue(x.forme));
      if (TONIQUES.has(x.forme) || nom) {
        return null;
      }
    }
    return { index: k, forme: avant.forme, personne: SUJETS.get(avant.forme) };
  }
  if (chaine.length && (!avant || OUVRANTS.has(avant.forme))) {
    const premier = t[chaine[0]].forme;
    if (premier === "nous" || premier === "vous") {
      return { index: chaine[0], forme: premier, personne: SUJETS.get(premier) };
    }
  }
  return null;
}

// --- Locutions figées ------------------------------------------------------------------------

const EXPRESSIONS = [
  {
    motif: ["bien", "sur"], par: "bien sûr",
    si: (t, i, j, ctx) => {
      const n = suivant(t, j);
      return n ? !DETERMINANTS.has(n.forme) : finProposition(t, j, ctx);
    },
  },
  { motif: ["la", "bas"], par: "là-bas" },
  { motif: ["au", "dela"], par: "au-delà" },
  { motif: ["aujourd", "hui"], par: "aujourd'hui" },
  { motif: ["quelqu", "un"], par: "quelqu'un" },
  {
    // « c'est peut-être » mais « il peut être »
    motif: ["peut", "etre"], par: "peut-être",
    si: (t, i, j, ctx) => {
      const p = precedent(t, i);
      return !p || (ctx.lex.estVerbeConjugue(p.forme) && !SUJETS.has(p.forme));
    },
  },
  {
    // « est-ce que tu viens » mais « c'est ce que je veux »
    motif: ["est", "ce", "que"], par: "est-ce que",
    si: (t, i) => {
      const p = precedent(t, i);
      return !p || INTERROGATIFS.has(p.forme);
    },
  },
  {
    motif: ["est", "ce", "qu'"], par: "est-ce qu'",
    si: (t, i) => {
      const p = precedent(t, i);
      return !p || INTERROGATIFS.has(p.forme);
    },
  },
  { motif: ["c'", "est", "a", "dire"], par: "c'est-à-dire" },
  {
    motif: ["tout", "a", "fait"], par: "tout à fait",
    si: (t, i, j, ctx) => {
      const n = suivant(t, j);
      return n ? !DETERMINANTS.has(n.forme) && !ctx.lex.estParticipePasse(n.forme) : finProposition(t, j, ctx);
    },
  },
  { motif: ["a", "peu", "pres"], par: "à peu près" },
  { motif: ["a", "plus", "tard"], par: "à plus tard" },
  { motif: ["a", "plus"], par: "à plus", si: (t, i, j, ctx) => finProposition(t, j, ctx) },
  { motif: ["a", "toute"], par: "à toute", si: (t, i, j, ctx) => finProposition(t, j, ctx) },
  ...["celui", "celle", "ceux", "celles"].flatMap((d) => [
    { motif: [d, "la"], par: `${d}-là` },
    { motif: [d, "ci"], par: `${d}-ci` },
  ]),
].map((e) => ({ ...e, cles: e.motif.map(cle) }));

function regleExpressions(t, i, ctx) {
  for (const e of EXPRESSIONS) {
    const j = i + e.cles.length - 1;
    if (j >= t.length) continue;
    let ok = true;
    for (let k = 0; k < e.cles.length && ok; k++) {
      ok = cle(t[i + k].forme) === e.cles[k] && (k === 0 || !t[i + k].debutProposition);
    }
    if (!ok) continue;
    if (e.si && e.si(t, i, j, ctx) !== true) continue;
    return correction(i, e.par, "locution", `Locution : « ${e.par} »`, "haute", j);
  }
  return null;
}

// --- a / à -----------------------------------------------------------------------------------

const AVANT_A_VERBE = new Set([
  "il", "elle", "on", "qui", "ça", "cela", "ceci", "y", "n'", "l'", "m'", "t'", "lui", "leur", "en", "nous", "vous",
]);
const AVANT_A_PREPOSITION = new Set(["jusqu'", "grâce", "face", "quant", "rapport"]);
// « a priori », « a fortiori » : locutions latines, sans accent.
const LATIN = new Set(["priori", "posteriori", "fortiori", "minima", "maxima"]);
const APRES_A_PREPOSITION = new Set([
  "côté", "cause", "partir", "peine", "propos", "travers", "part", "bientôt", "demain", "chaque", "quel", "quelle",
  "quels", "quelles", "qui", "quoi", "moi", "toi", "lui", "nous", "vous", "eux", "pied", "cheval", "vélo", "fond",
  "midi", "minuit", "condition", "présent", "nouveau", "gauche", "droite",
]);

function regleA(t, i, { lex }) {
  const f = t[i].forme;
  if (f !== "a" && f !== "à") return null;
  const p = precedent(t, i);
  const n = suivant(t, i);
  if (p && AVANT_A_VERBE.has(p.forme)) {
    if (f === "à" && !(n && APRES_A_PREPOSITION.has(n.forme))) {
      return correction(i, "a", "a/à", `Après « ${p.texte} », c'est le verbe avoir : « a » (sans accent)`);
    }
    return null;
  }
  // « Marie a… » : un mot avec majuscule devant « a » est sans doute un sujet, même en début de phrase.
  if (f === "à" || (p && casse(p.texte) === "capitale")) return null;
  // « ce qu'il voulait a été fait » : « a » est l'auxiliaire du participe qui suit.
  if (n && lex.estParticipePasse(n.forme) && !APRES_A_PREPOSITION.has(n.forme)) return null;
  if (n && LATIN.has(n.forme)) return null;

  const message = "Ici c'est la préposition « à » (on ne peut pas dire « avait »)";
  if (p && AVANT_A_PREPOSITION.has(p.forme)) return correction(i, "à", "a/à", message);
  if (n && APRES_A_PREPOSITION.has(n.forme)) return correction(i, "à", "a/à", message);
  const relatif = contientRelatif(t, i);
  if (p) {
    const pDetermine = i >= 2 && !t[i - 1].debutProposition && DETERMINANTS.has(t[i - 2].forme);
    const pVerbal = !pDetermine && !SUJETS.has(p.forme)
      && (lex.estVerbeConjugue(p.forme) || lex.estInfinitif(p.forme) || lex.estParticipePasse(p.forme));
    // « je vais a Paris », « j'ai pensé a toi », « c'est a moi »
    if (pVerbal) return correction(i, "à", "a/à", message, relatif ? "moyenne" : "haute");
  }
  if (n && lex.estInfinitif(n.forme)) {
    // « rien a manger » → « à » ; mais « le chat a manger » est sans doute « le chat a mangé ».
    const pNom = p && estSurtoutNom(lex, p.forme);
    return correction(i, "à", "a/à", message, pNom || relatif ? "moyenne" : "haute");
  }
  // « A demain », « A mon avis » en début de phrase
  if (t[i].debutPhrase && n) return correction(i, "à", "a/à", message);
  return null;
}

// --- Accord du verbe avec un pronom sujet ----------------------------------------------------

const HOMOPHONES_APRES_SUJET = { "3p": { son: "sont", on: "ont" } };

function regleAccord(t, i, { lex }) {
  const f = t[i].forme;
  const sujet = trouverSujet(t, i, lex);
  if (!sujet) return null;
  const homophone = HOMOPHONES_APRES_SUJET[sujet.personne]?.[f];
  if (homophone) {
    return correction(i, homophone, "accord", `Après « ${sujet.forme} », il faut le verbe : « ${homophone} »`);
  }
  if (!lex.estVerbeConjugue(f) || lex.saccordeAvec(f, sujet.personne)) return null;

  // Même verbe, même temps, à la bonne personne : « ils mange » → « mangent ».
  const options = [];
  for (const l of lex.lecturesVerbales(f)) {
    for (const tag of l.tags) {
      const m = TAG_PERSONNEL.exec(tag);
      if (!m) continue;
      for (const c of lex.conjuguer(l.lemme, `${m[1]}:${m[2]}:${sujet.personne}`)) {
        options.push({ forme: c.forme, score: Math.log10(l.freq + 0.1) + (m[1] === "ind" ? 1 : 0) });
      }
    }
  }
  if (!options.length) return null;
  options.sort((a, b) => b.score - a.score);
  const choix = options[0].forme;
  const rival = options.find((o) => o.forme !== choix);
  const confiance = rival && options[0].score - rival.score < 0.5 ? "moyenne" : "haute";
  return correction(i, choix, "accord", `Le verbe s'accorde avec « ${sujet.forme} » : « ${choix} »`, confiance);
}

// --- Participe passé après un auxiliaire : « j'ai manger » → « j'ai mangé » --------------------

const ACCORD_ETRE = { elle: ["f", "s"], ils: ["m", "p"], elles: ["f", "p"], nous: ["m", "p"] };

function regleAuxiliaire(t, i, { lex }) {
  const f = t[i].forme;
  const lectures = lex.lecturesVerbales(f).filter((l) => l.lemme.endsWith("er"));
  const lecture = lectures.find((l) => l.tags.includes("inf") && f.endsWith("er"))
    ?? (f.endsWith("ez") ? lectures.find((l) => l.tags.some((tag) => tag.endsWith(":2p"))) : null);
  if (!lecture) return null;

  let k = i - 1;
  while (k >= 0 && !t[k + 1].debutProposition && ADVERBES_INTERCALES.has(t[k].forme)) k--;
  if (k < 0 || t[k + 1].debutProposition) return null;
  const aux = auxiliaire(lex, t[k].forme);
  if (!aux) return null;
  const avantAux = k > 0 && !t[k].debutProposition ? t[k - 1] : null;
  // « il y a à manger » ; et « a » sans sujet devant est peut-être « à » (traité par la règle a/à).
  if (avantAux?.forme === "y") return null;
  if (t[k].forme === "a" && !(avantAux && (AVANT_A_VERBE.has(avantAux.forme) || estNomPropre(avantAux)))) return null;
  const sujet = trouverSujet(t, k, lex);
  if (aux === "être" && !sujet) return null;

  const [genre, nombre] = aux === "être" ? ACCORD_ETRE[sujet.forme] ?? ["m", "s"] : ["m", "s"];
  const participes = lex.conjuguer(lecture.lemme, "par:pas");
  const participe = participes.find((p) => p.genre === genre && p.nombre === nombre)
    ?? participes.find((p) => (p.genre || "m") === genre && (p.nombre || "s") === nombre);
  if (!participe) return null;
  return correction(
    i, participe.forme, "participe",
    `Après l'auxiliaire « ${t[k].texte} », on écrit le participe passé : « ${participe.forme} »`,
  );
}

// --- Infinitif après un verbe ou une préposition : « je vais mangé » → « je vais manger » ------

const MODAUX = new Set(["pouvoir", "vouloir", "devoir", "aller", "falloir", "savoir", "oser"]);
const PREFERENCES = new Set(["aimer", "adorer", "détester", "préférer"]);
const PREPOSITIONS_INFINITIF = new Set(["pour", "à", "de", "d'", "sans"]);
const PRONOMS_INDEFINIS = new Set(["rien", "chose", "personne", "quoi", "quelqu'un", "ça", "cela", "ceci"]);

function regleInfinitif(t, i, { lex }) {
  const f = t[i].forme;
  // Un nom (« le passé », « un employé ») ou « été » ne sont jamais à changer en infinitif.
  if (lex.aCategorie(f, "NOM")) return null;
  const lectures = lex.lecturesVerbales(f).filter((l) => l.lemme.endsWith("er") && lex.estInfinitif(l.lemme));
  const lecture = lectures.find((l) => l.tags.includes("par:pas"))
    ?? (f.endsWith("ez") ? lectures.find((l) => l.tags.some((tag) => tag.endsWith(":2p"))) : null);
  if (!lecture) return null;

  let k = i - 1;
  let clitique = false;
  while (k >= 0 && !t[k + 1].debutProposition
      && (ADVERBES_INTERCALES.has(t[k].forme) || (CLITIQUES.has(t[k].forme) && !SUJETS.has(t[k].forme)))) {
    if (CLITIQUES.has(t[k].forme)) clitique = true;
    k--;
  }
  if (k < 0 || t[k + 1].debutProposition) return null;
  const declencheur = t[k];
  const lemmes = lex.lecturesVerbales(partieVerbale(lex, declencheur.forme)).map((l) => l.lemme);
  const estPreposition = PREPOSITIONS_INFINITIF.has(declencheur.forme);
  if (estPreposition) {
    // « rien de prévu », « quelque chose de cassé » : le participe y est un adjectif.
    if ((declencheur.forme === "de" || declencheur.forme === "d'") && k > 0 && PRONOMS_INDEFINIS.has(t[k - 1].forme)) {
      return null;
    }
  } else if (!lemmes.some((l) => MODAUX.has(l) || (PREFERENCES.has(l) && !clitique))) {
    return null;
  }
  return correction(
    i, lecture.lemme, "infinitif",
    `Après « ${declencheur.texte} », on écrit l'infinitif : « ${lecture.lemme} »`,
  );
}

// --- ou / où --------------------------------------------------------------------------------

const AVANT_OU_RELATIF = new Set(["d'", "par", "importe", "jusqu'"]);
const LIEUX_TEMPS = new Set([
  "jour", "jours", "moment", "endroit", "endroits", "lieu", "ville", "pays", "maison", "instant", "heure", "année",
  "époque", "soir", "matin", "nuit", "semaine", "mois", "période", "cas", "pièce", "chambre", "rue", "place", "coin",
  "fois", "temps",
]);
const VERBES_INTERROGATION = new Set(["savoir", "demander", "ignorer"]);
const SUJETS_APRES_OU = new Set([...SUJETS.keys(), "c'", "ça", "ce"]);
const CLITIQUES_APRES_OU = new Set(["t'", "m'", "s'", "l'", "y", "en", "me", "te", "se"]);

function regleOu(t, i, ctx) {
  const { lex } = ctx;
  if (t[i].forme !== "ou") return null;
  const p = precedent(t, i);
  const n = suivant(t, i);
  const message = "« où » (lieu, moment) prend un accent ; « ou » sans accent veut dire « ou bien »";
  if (p && AVANT_OU_RELATIF.has(p.forme)) return correction(i, "où", "ou/où", message);
  const nSujet = n && SUJETS_APRES_OU.has(n.forme);
  if (p?.forme === "la" && nSujet) {
    return correction(i - 1, "là où", "ou/où", "« là où » : les deux mots prennent un accent", "haute", i);
  }
  if (p && LIEUX_TEMPS.has(p.forme) && nSujet) return correction(i, "où", "ou/où", message);
  if (p && nSujet) {
    // « je sais (pas) où il est », « je me demande où tu vas »
    const verbe = p.forme === "pas" && i >= 2 && !t[i - 1].debutProposition ? t[i - 2] : p;
    if (lex.lecturesVerbales(partieVerbale(lex, verbe.forme)).some((l) => VERBES_INTERROGATION.has(l.lemme))) {
      return correction(i, "où", "ou/où", message);
    }
  }
  if (t[i].debutPhrase && n) {
    // « Où est… ? », « Où t'es ? », « Où vas-tu ? »
    let k = i + 1;
    while (k < t.length && !t[k].debutProposition && CLITIQUES_APRES_OU.has(t[k].forme)) k++;
    const v = k < t.length && !t[k].debutProposition ? t[k] : null;
    if (v && !SUJETS.has(v.forme)
        && (v.forme.startsWith("est-ce") || lex.estVerbeConjugue(partieVerbale(lex, v.forme)))) {
      return correction(i, "où", "ou/où", message);
    }
  }
  if (n?.forme === "ça" && finProposition(t, i + 1, ctx) === true) return correction(i, "où", "ou/où", message);
  return null;
}

// --- la / là --------------------------------------------------------------------------------

const DEMONSTRATIFS = new Set(["ce", "cet", "cette", "ces"]);

function regleLa(t, i, ctx) {
  const { lex } = ctx;
  if (t[i].forme !== "la" || finProposition(t, i, ctx) !== true) return null;
  const p = precedent(t, i);
  if (!p) return null;
  const message = "« là » (à cet endroit) prend un accent ; « la » est un article ou un pronom";
  // « ce jour la » → « ce jour-là »
  if (i >= 2 && !t[i - 1].debutProposition && DEMONSTRATIFS.has(t[i - 2].forme) && lex.aCategorie(p.forme, "NOM")) {
    return correction(i - 1, `${p.forme}-là`, "la/là", message, "haute", i);
  }
  const ici = p.forme === "et" && i >= 2 && t[i - 2].forme === "ici";
  if (p.forme === "par" || ici || auxiliaire(lex, p.forme) === "être") return correction(i, "là", "la/là", message);
  return null;
}

// --- sur / sûr ------------------------------------------------------------------------------

const SUR = { sur: "sûr", sure: "sûre", surs: "sûrs", sures: "sûres" };
const INTENSIFS = new Set(["pas", "plus", "bien", "très", "tout", "trop", "vraiment", "assez", "presque", "si"]);

function regleSur(t, i, ctx) {
  const remplacement = SUR[t[i].forme];
  if (!remplacement) return null;
  let p = precedent(t, i);
  if (p && INTENSIFS.has(p.forme)) p = precedent(t, i - 1);
  if (!p || auxiliaire(ctx.lex, p.forme) !== "être") return null;
  const n = suivant(t, i);
  if (n ? !["de", "d'", "que", "qu'", "et"].includes(n.forme) : finProposition(t, i, ctx) !== true) return null;
  return correction(i, remplacement, "sur/sûr", "« sûr » (certain) prend un accent circonflexe ; « sur » veut dire « dessus »");
}

// --- ce / se, c'est / s'est -------------------------------------------------------------------

function regleCeSe(t, i, { lex }) {
  const f = t[i].forme;
  if (!["ce", "c'", "ses", "ces"].includes(f)) return null;
  let k = i - 1;
  if (k >= 0 && !t[k + 1].debutProposition && (t[k].forme === "ne" || t[k].forme === "n'")) k--;
  if (k < 0 || t[k + 1].debutProposition) return null;
  const sujet = t[k].forme;
  if (!["il", "elle", "on", "ils", "elles"].includes(sujet)) return null;
  const n = suivant(t, i);
  if (!n) return null;
  const message = "Devant un verbe, après un pronom sujet, c'est le pronom « se » / « s' »";
  if (f === "ce" && lex.estVerbeConjugue(partieVerbale(lex, n.forme))) return correction(i, "se", "ce/se", message);
  if (!["il", "elle", "on"].includes(sujet)) return null;
  // « il c'est trompé » → « il s'est trompé » ; « il ses trompé » → « il s'est trompé »
  if (f === "c'" && n.forme === "est") {
    const v = suivant(t, i + 1);
    return v && lex.estParticipePasse(v.forme) ? correction(i, "s'", "ce/se", message) : null;
  }
  if ((f === "ses" || f === "ces") && lex.estParticipePasse(n.forme) && !lex.aCategorie(n.forme, "NOM")) {
    return correction(i, "s'est", "ce/se", message);
  }
  return null;
}

// --- sa / ça --------------------------------------------------------------------------------

const APRES_CA = new Set(["m'", "me", "t'", "te", "nous", "vous", "lui", "leur", "y", "en", "ne", "n'"]);

function regleSaCa(t, i, ctx) {
  const { lex } = ctx;
  if (t[i].forme !== "sa") return null;
  const n = suivant(t, i);
  const message = "« ça » (= cela) ; « sa » est un déterminant (« sa maison »)";
  if (!n) return finProposition(t, i, ctx) === true ? correction(i, "ça", "sa/ça", message) : null;
  if (APRES_CA.has(n.forme)) return correction(i, "ça", "sa/ça", message);
  // « sa va », « sa fait » : un verbe que « sa » ne peut pas déterminer
  const nomFeminin = lex.lectures(n.forme).some(
    (l) => (l.cgram === "NOM" || l.cgram.startsWith("ADJ")) && l.genre !== "m" && l.nombre !== "p",
  );
  if (!nomFeminin && lex.estVerbeConjugue(partieVerbale(lex, n.forme))) return correction(i, "ça", "sa/ça", message);
  return null;
}

// --- ces / ses / c'est ----------------------------------------------------------------------

const APRES_CEST = new Set([
  "bon", "bien", "vrai", "normal", "super", "ça", "moi", "toi", "lui", "eux", "pour", "quoi", "qui", "possible",
  "impossible", "dommage", "génial", "sûr", "clair", "fini", "dur", "facile", "compliqué", "beau", "cool", "top", "nul",
  "mieux", "juste", "faux", "grave", "mort", "quand", "comme", "ok", "là", "ici", "rien", "mal", "dingue", "ouf",
  "chaud", "chiant", "drôle", "marrant", "simple", "gentil", "sympa", "incroyable", "important",
]);
const AMPLIFICATEURS = new Set(["pas", "trop", "vraiment", "tellement", "très", "plus", "toujours", "jamais"]);

function regleCesCest(t, i) {
  const f = t[i].forme;
  if (f !== "ces" && f !== "ses") return null;
  let n = suivant(t, i);
  if (n && AMPLIFICATEURS.has(n.forme)) n = suivant(t, i + 1);
  if (!n || !APRES_CEST.has(n.forme)) return null;
  return correction(i, "c'est", "ces/c'est", "« c'est » (= cela est) ; « ces » et « ses » sont des déterminants pluriels");
}

// --- et / est --------------------------------------------------------------------------------

function regleEtEst(t, i) {
  if (t[i].forme !== "et") return null;
  const p = precedent(t, i);
  if (!p || !["il", "on", "c'"].includes(p.forme)) return null;
  return correction(i, "est", "et/est", "« est » (verbe être) ; « et » sert à relier deux éléments");
}

const REGLES = [
  regleExpressions, regleA, regleAccord, regleAuxiliaire, regleInfinitif, regleOu, regleLa, regleSur, regleCeSe,
  regleSaCa, regleCesCest, regleEtEst,
];
