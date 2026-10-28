import assert from "node:assert/strict";
import { test } from "node:test";
import { appliquerCasse, casse, cle, tokeniser } from "../src/texte.js";
import { distanceFrappe, voisines } from "../src/clavier.js";

test("la clé ignore accents, casse, apostrophes et traits d'union", () => {
  assert.equal(cle("Réel"), "reel");
  assert.equal(cle("aujourd’hui"), "aujourdhui");
  assert.equal(cle("Peut-Être"), "peutetre");
  assert.equal(cle("cœur"), "coeur");
});

test("la casse tapée est reproduite sur la correction", () => {
  assert.equal(casse("reel"), "minuscules");
  assert.equal(casse("Reel"), "capitale");
  assert.equal(casse("REEL"), "majuscules");
  assert.equal(casse("A"), "capitale");
  assert.equal(appliquerCasse("réel", "capitale"), "Réel");
  assert.equal(appliquerCasse("réel", "majuscules"), "RÉEL");
  assert.equal(appliquerCasse("à", "capitale"), "À");
});

test("le découpage sépare les élisions et repère phrases et propositions", () => {
  const mots = tokeniser("J'ai vu l'ami, puis il est parti. Aujourd'hui", (f) => f === "aujourd'hui");
  assert.deepEqual(mots.map((m) => m.texte), ["J'", "ai", "vu", "l'", "ami", "puis", "il", "est", "parti", "Aujourd'hui"]);
  assert.deepEqual(mots.filter((m) => m.debutPhrase).map((m) => m.texte), ["J'", "Aujourd'hui"]);
  assert.deepEqual(mots.filter((m) => m.debutProposition).map((m) => m.texte), ["J'", "puis", "Aujourd'hui"]);
  assert.equal(mots[1].debut, 2);
});

test("les touches voisines du clavier AZERTY coûtent moins cher", () => {
  assert.ok(voisines("e", "r"));
  assert.ok(voisines("b", "n"));
  assert.ok(!voisines("a", "p"));
  assert.equal(distanceFrappe("bonjoue", "bonjour"), 0.5);
  assert.equal(distanceFrappe("bonjoqr", "bonjour"), 1);
  assert.equal(distanceFrappe("chein", "chien"), 0.6);
  assert.equal(distanceFrappe("telephonne", "telephone"), 0.5);
  assert.equal(distanceFrappe("apeler", "appeler"), 0.5);
  assert.equal(distanceFrappe("abcdefgh", "zzzzzzzz", 2), Infinity);
});
