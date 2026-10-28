import assert from "node:assert/strict";
import { test } from "node:test";
import { ProfilUtilisateur, SEUILS } from "../src/profil.js";
import { lexique, nouveauCorrecteur } from "./aide.js";

test("« reel » n'est jamais appris, même tapé et imposé de nombreuses fois", () => {
  const c = nouveauCorrecteur();
  for (let n = 0; n < 10; n++) {
    const r = c.motTermine("reel", { precedent: "c'est" });
    assert.equal(r.final, "réel");
    const annulation = c.annulerCorrection("reel", r.correction, { precedent: "c'est" });
    assert.equal(annulation.statut, "bloque");
  }
  assert.equal(c.profil.estAppris("reel"), false);
  assert.equal(c.analyserMot("reel").correction, "réel");
  assert.equal(c.analyserMot("reel").auto, true);
  assert.equal(c.profil.bloques.get("reel").tentatives, 10);
});

test("un mot que le correcteur prend pour une faute est appris après deux annulations", () => {
  const c = nouveauCorrecteur();
  const premier = c.motTermine("mdr", { precedent: "trop" });
  assert.equal(premier.final, "mer");
  assert.equal(c.annulerCorrection("mdr", "mer", { precedent: "trop" }).statut, "quarantaine");
  c.motTermine("mdr", { precedent: "ah" });
  assert.equal(c.annulerCorrection("mdr", "mer", { precedent: "ah" }).statut, "appris");
  const ensuite = c.analyserMot("mdr");
  assert.equal(ensuite.valide, true);
  assert.equal(ensuite.correction, null);
  // l'usage compté pour « mer » pendant la correction a été retiré
  assert.equal(c.profil.usages.get("mer") ?? 0, 0);
});

test("un mot inconnu sans correction évidente est appris après plusieurs usages dans des contextes variés", () => {
  const c = nouveauCorrecteur();
  assert.equal(c.motTermine("chelou", { precedent: "trop" }).apprentissage.statut, "quarantaine");
  assert.equal(c.motTermine("chelou", { precedent: "trop" }).apprentissage.statut, "quarantaine");
  assert.equal(c.motTermine("chelou", { precedent: "c'est" }).apprentissage.statut, "appris");
  assert.equal(SEUILS.occurrences, 3);
});

test("un nom propre est appris plus vite, puis corrigé quand on oublie son accent", () => {
  const c = nouveauCorrecteur();
  c.motTermine("Maëlou", { precedent: "avec" });
  assert.equal(c.motTermine("Maëlou", { precedent: "pour" }).apprentissage.statut, "appris");
  const a = c.analyserMot("Maelou", { precedent: "avec" });
  assert.equal(a.correction, "Maëlou");
  assert.equal(a.auto, true);
  assert.equal(c.motTermine("Maelou", { precedent: "avec" }).final, "Maëlou");
  assert.equal(c.profil.estAppris("maelou"), false);
});

test("l'ajout manuel refuse une forme sans accent, sauf si on insiste", () => {
  const c = nouveauCorrecteur();
  const refus = c.profil.ajouter("reel");
  assert.equal(refus.ajoute, false);
  assert.equal(refus.correction, "réel");
  assert.equal(c.profil.ajouter("reel", { forcer: true }).ajoute, true);
  // « un reel Instagram » : désormais accepté
  assert.equal(c.analyserMot("reel").auto, false);
  // un contact ajouté est connu tout de suite, et corrigé quand on oublie son accent
  assert.equal(c.profil.ajouter("Anaëlle", { source: "contact" }).ajoute, true);
  assert.equal(c.analyserMot("anaelle").correction, "Anaëlle");
});

test("refuser la version accentuée d'un mot valide est mémorisé", () => {
  const c = nouveauCorrecteur();
  assert.equal(c.motTermine("foret", { precedent: "la" }).final, "forêt");
  assert.equal(c.annulerCorrection("foret", "forêt", { precedent: "la" }).statut, "valide");
  assert.equal(c.analyserMot("foret", { precedent: "la" }).auto, false);
});

test("les habitudes de l'utilisateur changent le classement, jamais la validité", () => {
  const c = nouveauCorrecteur();
  assert.equal(c.analyserMot("pecheur").correction, "pêcheur");
  for (let n = 0; n < 5; n++) c.motTermine("pécheur");
  assert.equal(c.analyserMot("pecheur").correction, "pécheur");
});

test("rien n'est appris quand l'apprentissage est désactivé (mot de passe, navigation privée)", () => {
  const c = nouveauCorrecteur();
  c.profil.apprentissageActif = false;
  for (let n = 0; n < 5; n++) assert.equal(c.motTermine("chelou", { precedent: String(n) }).apprentissage.statut, "ignore");
  assert.equal(c.profil.estAppris("chelou"), false);
  assert.equal(c.profil.quarantaine.size, 0);
});

test("le profil se sauvegarde et se recharge", () => {
  const c = nouveauCorrecteur();
  c.profil.ajouter("Anaëlle", { source: "contact" });
  c.motTermine("reel");
  c.motTermine("chelou");
  const json = JSON.parse(JSON.stringify(c.profil.exporter()));
  const profil = ProfilUtilisateur.importer(json, lexique);
  assert.equal(profil.estAppris("anaëlle"), true);
  assert.equal(profil.ecriture("anaëlle"), "Anaëlle");
  assert.equal(profil.formesApprisesParCle("anaelle")[0], "anaëlle");
  assert.equal(profil.quarantaine.get("chelou").occurrences, 1);
  assert.equal(profil.usages.get("réel"), 1);
});
