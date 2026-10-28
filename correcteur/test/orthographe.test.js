import assert from "node:assert/strict";
import { test } from "node:test";
import { nouveauCorrecteur } from "./aide.js";

const c = nouveauCorrecteur();
const corrige = (mot, contexte) => {
  const a = c.analyserMot(mot, contexte);
  return a.auto ? a.correction : mot;
};

test("« reel » est corrigé en « réel », ainsi que les autres accents oubliés", () => {
  const cas = {
    reel: "réel", tres: "très", deja: "déjà", ca: "ça", francais: "français", ete: "été", apres: "après",
    ecole: "école", probleme: "problème", interessant: "intéressant", aujourdhui: "aujourd'hui",
    "peut-etre": "peut-être", voila: "voilà", forcement: "forcément", bientot: "bientôt", etait: "était",
  };
  for (const [tape, attendu] of Object.entries(cas)) assert.equal(corrige(tape), attendu, tape);
});

test("la casse est conservée", () => {
  assert.equal(corrige("Reel", { debutPhrase: true }), "Réel");
  assert.equal(corrige("REEL"), "RÉEL");
});

test("les fautes de frappe sont corrigées selon la disposition AZERTY", () => {
  const cas = {
    bonjoue: "bonjour", maisob: "maison", telephonne: "téléphone", chein: "chien", apeler: "appeler",
    anticonstitutionelement: "anticonstitutionnellement", developpemnt: "développement",
  };
  for (const [tape, attendu] of Object.entries(cas)) assert.equal(corrige(tape), attendu, tape);
});

test("les mots valides ne sont pas touchés, même s'ils ont un homonyme accentué", () => {
  for (const mot of ["a", "ou", "la", "sur", "des", "du", "mur", "tache", "réel", "bonjour"]) {
    assert.equal(c.analyserMot(mot).auto, false, mot);
  }
});

test("un mot valide rare est remplacé par sa version accentuée bien plus fréquente, selon le contexte", () => {
  assert.equal(corrige("foret", { precedent: "la" }), "forêt");
  assert.equal(corrige("age", { precedent: "quel" }), "âge");
  assert.equal(corrige("cote", { precedent: "a" }), "côté");
  // « la cote » (de popularité) est correct : le déterminant féminin écarte « côté »
  assert.equal(corrige("cote", { precedent: "la" }), "cote");
  // après un pronom sujet, la forme verbale est la bonne
  assert.equal(corrige("invites", { precedent: "tu" }), "invites");
  assert.equal(corrige("voila", { precedent: "il" }), "voila");
});

test("le contexte départage les accents possibles", () => {
  assert.equal(corrige("eleve", { precedent: "un" }), "élève");
  assert.equal(corrige("eleve", { precedent: "est" }), "élevé");
});

test("les prénoms ne sont pas « corrigés » en mots du dictionnaire", () => {
  assert.equal(corrige("Paul", { debutPhrase: true }), "Paul");
  assert.equal(corrige("paul"), "Paul");
  assert.equal(corrige("Lea", { debutPhrase: true }), "Léa");
  // nom inconnu avec majuscule en milieu de phrase : suggéré, jamais imposé
  assert.equal(c.analyserMot("Kylian", { precedent: "avec" }).auto, false);
});

test("les abréviations courtes ne sont pas remplacées par des mots rares", () => {
  assert.equal(corrige("jsp"), "jsp");
});

test("la barre de suggestions complète le mot en cours", () => {
  assert.ok(c.suggestions("bonj").includes("bonjour"));
  assert.ok(c.suggestions("tele").includes("téléphone"));
  assert.equal(c.suggestions("reel")[0], "réel");
  assert.equal(c.suggestions("Bonj")[0], "Bonjour");
});
