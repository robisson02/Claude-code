// Génère les cas de référence du moteur JavaScript (correcteur/src) pour vérifier que le portage Kotlin
// donne exactement les mêmes résultats :
//   node outils/generer-parite.mjs
// Les fichiers sont écrits dans src/test/resources/parite/.

import { mkdirSync, writeFileSync } from "node:fs";
import { Correcteur } from "../../../correcteur/src/moteur.js";
import { chargerLexique } from "../../../correcteur/src/node.js";
import { verifierGrammaire } from "../../../correcteur/src/grammaire.js";

const lexique = chargerLexique();
const sortie = new URL("../src/test/resources/parite/", import.meta.url);
mkdirSync(sortie, { recursive: true });
const ecrire = (nom, donnees) => writeFileSync(new URL(nom, sortie), JSON.stringify(donnees, null, 0) + "\n");

// Générateur pseudo-aléatoire déterministe (mulberry32) : les cas sont les mêmes à chaque génération.
let graine = 20261028;
function hasard() {
  graine |= 0; graine = (graine + 0x6d2b79f5) | 0;
  let t = Math.imul(graine ^ (graine >>> 15), 1 | graine);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
const choisir = (liste) => liste[Math.floor(hasard() * liste.length)];

const frequents = [...lexique.entrees.values()]
  .filter((e) => /^\p{L}+$/u.test(e.forme) && e.forme.length >= 2)
  .sort((a, b) => b.freq - a.freq)
  .slice(0, 8000)
  .map((e) => e.forme);

const VOISINES = { a: "zq", z: "aes", e: "zrd", r: "etf", t: "ryg", y: "tuh", u: "yij", i: "uok", o: "ipl", p: "om",
  q: "asw", s: "qdz", d: "sfe", f: "dgr", g: "fht", h: "gjy", j: "hku", k: "jli", l: "kmo", m: "lp", w: "qx", x: "wc",
  c: "xv", v: "cb", b: "vn", n: "bh" };
function abimer(mot) {
  const sans = mot.normalize("NFD").replace(/[̀-ͯ]/g, "");
  const i = Math.floor(hasard() * mot.length);
  switch (Math.floor(hasard() * 8)) {
    case 0: return mot;
    case 1: return sans;
    case 2: { const v = VOISINES[sans[i]]; return v ? sans.slice(0, i) + choisir([...v]) + sans.slice(i + 1) : sans; }
    case 3: return i + 1 < sans.length ? sans.slice(0, i) + sans[i + 1] + sans[i] + sans.slice(i + 2) : sans;
    case 4: return sans.slice(0, i) + sans[i] + sans.slice(i);
    case 5: return sans.length > 3 ? sans.slice(0, i) + sans.slice(i + 1) : sans;
    case 6: return sans[0].toUpperCase() + sans.slice(1);
    default: { const j = Math.floor(hasard() * sans.length);
      return sans.slice(0, i) + (VOISINES[sans[i]]?.[0] ?? sans[i]) + sans.slice(i + 1, j) + sans.slice(j + 1); }
  }
}

const PRECEDENTS = [null, null, null, "le", "la", "les", "un", "une", "je", "tu", "il", "ils", "nous", "vous", "est",
  "a", "de", "pour", "très", "c'est", "et", "on", "elle"];
const MOTS_FIXES = ["reel", "Reel", "REEL", "tres", "deja", "ca", "francais", "ete", "apres", "ecole", "probleme",
  "interessant", "aujourdhui", "peut-etre", "voila", "forcement", "bientot", "etait", "bonjoue", "maisob", "telephonne",
  "chein", "apeler", "anticonstitutionelement", "developpemnt", "a", "ou", "la", "sur", "des", "du", "mur", "tache",
  "cote", "foret", "age", "invites", "eleve", "Paul", "paul", "Lea", "Kylian", "jsp", "mdr", "tkt", "chelou", "wesh",
  "pècheur", "pecheur", "Bonjoue", "as-tu", "dis-moi", "va-t-il", "quelqu", "aujourd", "j'", "c'", "123", "iPhone",
  "œil", "coeur", "Ça", "A", "À", "lea", "Matheo", "snap", "insta", "ptdr", "oklm", "bg", "zarbi", "frérot"];

// 1. Analyse de mots isolés
const mots = [];
const ajouterMot = (mot, precedent, debutPhrase) => {
  const a = new Correcteur(lexique).analyserMot(mot, { precedent, debutPhrase });
  mots.push({ mot, precedent, debutPhrase, attendu: a });
};
for (const m of MOTS_FIXES) for (const p of [null, "la", "il", "est"]) ajouterMot(m, p, p === null);
for (let n = 0; n < 2500; n++) ajouterMot(abimer(choisir(frequents)), choisir(PRECEDENTS), hasard() < 0.3);
ecrire("mots.json", mots);

// 2. Barre de suggestions
const suggestions = [];
const c0 = new Correcteur(lexique);
for (let n = 0; n < 400; n++) {
  const mot = abimer(choisir(frequents));
  const partiel = mot.slice(0, 1 + Math.floor(hasard() * Math.min(6, mot.length)));
  const precedent = choisir(PRECEDENTS);
  suggestions.push({ partiel, precedent, attendu: c0.suggestions(partiel, { precedent }) });
}
ecrire("suggestions.json", suggestions);

// 3. Textes complets et vérification pendant la frappe
const PHRASES = [
  "Il a mangé une pomme.", "Je vais à Paris demain.", "Elle est là.", "Tu veux du café ou du thé ?", "Où est le chat ?",
  "C'est sûr qu'il viendra.", "Il est sur la table.", "Ils ont faim.", "Nous mangeons ensemble.", "Il nous mange.",
  "Lui et elle mangent.", "Ce que tu dis a du sens.", "Ce qu'il voulait a été fait.", "Le chat a faim.",
  "Marie a un chien.", "J'ai été manger chez lui.", "Il peut être content.", "C'est ce que je veux.", "Il faut manger.",
  "Elle s'est levée tôt.", "Ça va bien.", "Sa mère est partie.", "Je sais où il est.", "Tu manges ou tu dors ?",
  "Le jour où il est venu.", "Un jour ou l'autre.", "Je suis allé manger.", "Il n'y a rien de prévu.",
  "Des vacances d'été.", "C'est à moi.", "Je pense à toi.", "Peut-être demain.", "Bien sûr que oui.",
  "Qu'est-ce que tu fais ?", "La forêt est belle.", "Ce jour-là, il pleuvait.", "Paul et elle mangent.",
  "je vais a paris, c'est tres reel. j'ai manger et ils mange. ou est le telephonne ?", "rien a manger",
  "A demain !", "il à mangé", "a cote de moi", "tout a fait", "d'ou tu viens", "la ville ou j'habite",
  "je sais pas ou il est", "ou t'es ?", "il est parti la ou il voulait", "il est la.", "je suis sur de moi",
  "bien sur que oui", "c'est pas sur.", "peut etre demain", "est ce que tu viens", "aujourd hui", "quelqu un",
  "nous mange", "tu mange", "je manges", "tu a raison", "j'a faim", "ils son partis", "ils on faim", "il a manger",
  "j'ai pas manger", "elle est aller au cinema", "je suis aller manger", "je vais mangé", "il faut mangé",
  "vous pouvez mangez", "pour mangé", "sans mangé", "il ce lave", "il c'est trompé", "il ses trompé", "sa va",
  "sa me saoule", "comme sa.", "ces pas grave", "il et parti", "c'et bon", "Lea est la. pècheur. un eleve.",
];
const textes = [];
const enCours = [];
const bruiter = (phrase) => phrase.replace(/\p{L}+/gu, (m) => (hasard() < 0.25 ? abimer(m) : m));
const corpus = [...PHRASES, ...PHRASES.map(bruiter), ...PHRASES.map(bruiter)];
for (const texte of corpus) {
  textes.push({ texte, attendu: c0.corrigerTexte(texte) });
  const coupes = [...texte.matchAll(/\s/g)].map((m) => m.index + 1);
  for (const fin of coupes) {
    const debut = texte.slice(0, fin);
    enCours.push({ texte: debut, attendu: verifierGrammaire(debut, lexique, { enCours: true }) });
  }
}
ecrire("textes.json", textes);
ecrire("grammaire-en-cours.json", enCours);

// 4. Scénarios d'apprentissage : une suite d'événements du clavier sur un même profil
const VOCABULAIRE = ["reel", "mdr", "chelou", "wesh", "Kylian", "Maëlou", "Maelou", "foret", "pécheur", "pecheur",
  "tres", "bonjour", "ptdr", "jsp", "tkt", "Anaëlle", "anaelle", "forêt", "réel", "smartphone", "zarbi", "oklm", "Lea"];
const scenarios = [];
for (let s = 0; s < 12; s++) {
  const c = new Correcteur(lexique);
  const etapes = [];
  for (let n = 0; n < 60; n++) {
    const mot = choisir(VOCABULAIRE);
    const precedent = choisir(PRECEDENTS);
    const debutPhrase = precedent === null && hasard() < 0.5;
    const ctx = { precedent, debutPhrase };
    const op = choisir(["motTermine", "motTermine", "motTermine", "annuler", "garder", "ajouter", "oublier", "analyser", "suggestions"]);
    let resultat;
    const forcer = op === "ajouter" && hasard() < 0.3;
    if (op === "motTermine") resultat = c.motTermine(mot, ctx);
    else if (op === "annuler") {
      const a = c.analyserMot(mot, ctx);
      resultat = a.correction ? c.annulerCorrection(mot, a.correction, ctx) : null;
    } else if (op === "garder") resultat = c.garderMot(mot, ctx);
    else if (op === "ajouter") resultat = c.profil.ajouter(mot, { forcer });
    else if (op === "oublier") resultat = c.profil.oublier(mot);
    else if (op === "analyser") resultat = c.analyserMot(mot, ctx);
    else resultat = c.suggestions(mot.slice(0, 3), ctx);
    etapes.push({ op, mot, precedent, debutPhrase, forcer, attendu: resultat });
  }
  const profil = c.profil.exporter();
  profil.appris = profil.appris.map(([f, infos]) => [f, { ...infos, depuis: 0 }]);
  scenarios.push({ etapes, profil });
}
ecrire("scenarios.json", scenarios);
console.log(`${mots.length} mots, ${suggestions.length} suggestions, ${textes.length} textes, ${enCours.length} vérifications en cours, ${scenarios.length} scénarios`);
