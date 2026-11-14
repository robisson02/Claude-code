// Tests adverses du moteur de règles d'Orvane : node tests-adverses.js
// Ils essaient de casser le moteur sur les cas limites du contrat (CONTRAT.md, qui fait foi)
// et de la partie 3 du rapport (../verif/t8/recherche-dofus.md). Aucune dépendance (module assert de node).
// Chaque test porte sa référence (contrat ou rapport). Code de sortie : 0 si tout passe, 1 sinon.
'use strict';
const assert = require('assert');
const R = require('./regles.js');
const M = require('./monstres.js');
const O = require('./outils.js');
const ESSAI = require('./sorts-essai.js');

const resultats = [];
function test(nom, ref, f) {
  try { f(); resultats.push({ nom, ref, ok: true }); }
  catch (e) { resultats.push({ nom, ref, ok: false, msg: (e && e.message) || String(e) }); }
}

// ---------- Aides ----------
const grille = (w, h, ch = '.') => Array.from({ length: h }, () => ch.repeat(w));
const avec = (lignes, x, y, ch) => lignes.map((l, j) => j === y ? l.slice(0, x) + ch + l.slice(x + 1) : l);
const fiche = o => Object.assign({ nom: o.id, niveau: 1, victuailles: 200, cm: 6, pas: 3, ouverture: 0, rideau: 5, fauxFuyant: 5, sorts: [], xp: 10, ble: 2, objets: [] }, o);
const Sp = o => Object.assign({ id: 't', nom: 'Essai ' + (o.id || 't'), element: 'F', cm: 2, niveau: 1, rayon: { min: 0, max: 12, modifiable: false },
  lancer: 'libre', vue: false, cible: 'case', parTour: 0, parCible: 0, relance: 0, maitre: 0, zone: { forme: 'case' }, touche: 'ennemis', effets: [] }, o);
const D = (v, el = 'F') => ({ type: 'degats', element: el, min: v, max: v, maitre: [v, v] });
let debut = [];
function mk(o = {}) {
  const e = R.creerCombat({
    carte: { lignes: o.lignes || grille(12, 12), departs: [{ artisans: o.departsA || [], monstres: o.departsM || [] }] },
    graine: o.graine === undefined ? 1 : o.graine,
    artisans: (o.artisans || []).map(a => Object.assign({ classe: 'levainqueur', niveau: 1 }, a)),
    monstres: (o.monstres || []).map(m => fiche(m)),
    options: Object.assign({ commande: 'aucune' }, o.options || {})
  });
  if (o.commencer !== false) { const r = R.commencer(e); assert.ok(r.ok, 'commencer : ' + r.raison); debut = r.evenements; }
  return e;
}
const C = (e, id) => R.trouver(e, id);
function passer(e) { const a = R.actif(e); assert.ok(a, 'personne n\'est actif'); const r = R.finDuTour(e, a.id); assert.ok(r.ok, r.raison); return r.evenements; }
function jusqua(e, id) { for (let i = 0; i < 80 && R.actif(e) && R.actif(e).id !== id; i++) passer(e); assert.ok(R.actif(e) && R.actif(e).id === id, 'jamais au tour de ' + id); }
function L(e, id, s, cs) { const r = R.lancer(e, id, s, cs); assert.ok(r.ok, 'lancer ' + s + ' : ' + r.raison); return r.evenements; }
function V(e, id, cs) { const r = R.deplacer(e, id, cs); assert.ok(r.ok, 'deplacer ' + id + ' : ' + r.raison); return r.evenements; }
const de = (evs, type) => evs.filter(x => x.type === type);
const geler = e => JSON.stringify(e);
const faux = lignes => ({ carte: R.interne.preparerCarte({ lignes }), combattants: [], sol: [] });
const eq = (a, b) => a[0] === b[0] && a[1] === b[1];
function poserEtat(e, id, etat, tours = 2, couches = 1) { C(e, id).etats.push({ etat, tours, couches, source: id }); }
function refusIntact(e, f, raison) {
  const avant = geler(e); const r = f();
  assert.strictEqual(r.ok, false, 'devait être refusé' + (raison ? ' (« ' + raison + ' »)' : '') + ', le moteur a accepté');
  if (raison) assert.strictEqual(r.raison, raison);
  assert.strictEqual(geler(e), avant, 'refus « ' + r.raison + ' » : l\'état a changé');
  return r;
}
function connexe(cases) {
  const k = c => c[0] + ',' + c[1], set = new Set(cases.map(k)), vus = new Set([k(cases[0])]), file = [cases[0]];
  while (file.length) { const c = file.shift(); [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(d => { const v = [c[0] + d[0], c[1] + d[1]]; if (set.has(k(v)) && !vus.has(k(v))) { vus.add(k(v)); file.push(v); } }); }
  return vus.size === set.size;
}
const sortEssai = id => JSON.parse(JSON.stringify(ESSAI.find(s => s.id === id)));
// sorts utiles
const POUSSE = (n, o = {}) => Sp(Object.assign({ id: 'p', element: 'T', cible: 'ennemi', rayon: { min: 1, max: 8, modifiable: false }, parTour: 2, effets: [{ type: 'pousse', cases: n }] }, o));
const ATTIRE = (n, o = {}) => Sp(Object.assign({ id: 'at', element: 'S', cible: 'ennemi', rayon: { min: 1, max: 8, modifiable: false }, parTour: 2, effets: [{ type: 'attire', cases: n }] }, o));
const PIEGE = (effets, o = {}) => Sp(Object.assign({ id: 'pg', element: 'T', cible: 'caseLibre', parTour: 3, plafondPose: 3, effets: [{ type: 'pose', quoi: 'piege', effets }] }, o));
const USTENSILE = Sp({ id: 'u', element: 'N', cible: 'caseLibre', effets: [{ type: 'pose', quoi: 'ustensile', victuailles: 20 }] });
const FRAPPE = (v, o = {}) => Sp(Object.assign({ id: 'x', cible: 'ennemi', parTour: 3, effets: [D(v)] }, o));
const INVOQUE = (commis, o = {}) => Sp(Object.assign({ id: 'inv', element: 'N', cible: 'caseLibre', parTour: 2, effets: [{ type: 'invoque', commis }] }, o));

// =====================================================================
// A. Ligne de vue (rapport §3.8)
// =====================================================================
const REF_VUE = 'Rapport §3.8 : « Si le segment passe pile par un coin, entre deux cases, la vue n\'est coupée que si les deux cases bloquent. La case du lanceur et la case visée ne comptent pas. »';
test('A1 vue : coin exact (0,0)→(3,1), coupée seulement si (2,0) ET (1,1) bloquent, dans les deux sens', REF_VUE, () => {
  const v = (l, a = [0, 0], b = [3, 1]) => R.ligneDeVue(faux(l), a, b);
  assert.strictEqual(v(['..#.', '....']), true, 'seule (2,0) bloque');
  assert.strictEqual(v(['....', '.#..']), true, 'seule (1,1) bloque');
  assert.strictEqual(v(['..#.', '.#..']), false, '(2,0) et (1,1) bloquent');
  assert.strictEqual(v(['..#.', '.#..'], [3, 1], [0, 0]), false, 'sens inverse');
  assert.strictEqual(v(['..#.', '....'], [3, 1], [0, 0]), true, 'sens inverse, un seul côté');
  assert.strictEqual(v(['.#..', '....']), false, '(1,0) est traversée');
  assert.strictEqual(v(['....', '..#.']), false, '(2,1) est traversée');
});
test('A2 vue : diagonale (0,0)→(2,2), deux coins distincts et la case centrale', REF_VUE, () => {
  const v = l => R.ligneDeVue(faux(l), [0, 0], [2, 2]);
  assert.strictEqual(v(['.#.', '...', '...']), true, '(1,0) seule');
  assert.strictEqual(v(['.#.', '#..', '...']), false, '(1,0)+(0,1) : même coin');
  assert.strictEqual(v(['.#.', '...', '.#.']), true, '(1,0)+(1,2) : deux coins différents');
  assert.strictEqual(v(['...', '..#', '.#.']), false, '(2,1)+(1,2) : même coin');
  assert.strictEqual(v(['...', '.#.', '...']), false, '(1,1) traversée');
});
test('A3 vue : un allié entre le lanceur et la cible coupe la vue, dans les deux sens', 'Rapport §3.8 : « Coupent la vue : … tout combattant visible (allié, ennemi, Commis). »', () => {
  const v = Sp({ id: 'v', vue: true, cible: 'ennemi', rayon: { min: 1, max: 8, modifiable: false }, parTour: 3, effets: [D(1)] });
  const e = mk({ artisans: [{ id: 'a', case: [0, 5], sorts: [v] }, { id: 'b', case: [2, 5] }], monstres: [{ id: 'm', case: [4, 5] }] });
  refusIntact(e, () => R.lancer(e, 'a', 'v', [4, 5]), 'Pas de vue');
  assert.strictEqual(R.ligneDeVue(e, [4, 5], [0, 5]), false);
  const k = R.casesVisables(e, 'a', 'v').cases.find(x => eq(x.case, [4, 5]));
  assert.ok(k && k.vue === false && !k.visable, 'casesVisables doit marquer la case sans vue');
});
test('A4 vue : coin exact formé par un allié et un décor = coupée ; allié seul au coin = vue', REF_VUE, () => {
  const v = Sp({ id: 'v', vue: true, cible: 'ennemi', rayon: { min: 1, max: 8, modifiable: false }, parTour: 3, effets: [D(1)] });
  const e1 = mk({ lignes: avec(grille(6, 6), 1, 1, '#'), artisans: [{ id: 'a', case: [0, 0], sorts: [v] }, { id: 'b', case: [2, 0] }], monstres: [{ id: 'm', case: [3, 1] }] });
  refusIntact(e1, () => R.lancer(e1, 'a', 'v', [3, 1]), 'Pas de vue');
  const e2 = mk({ artisans: [{ id: 'a', case: [0, 0], sorts: [v] }, { id: 'b', case: [2, 0] }], monstres: [{ id: 'm', case: [3, 1] }] });
  L(e2, 'a', 'v', [3, 1]);
});
test('A5 vue : un Ustensile coupe la vue ; un piège, le vide et un ennemi Dérobé ne la coupent pas', 'Rapport §3.8 : « Coupent la vue : … les Ustensiles … Ne coupent pas la vue : le vide entre les îles, les flaques et nappes au sol, les pièges, les combattants Dérobés. »', () => {
  const v = Sp({ id: 'v', vue: true, cible: 'ennemi', rayon: { min: 1, max: 8, modifiable: false }, parTour: 3, effets: [D(1)] });
  let e = mk({ artisans: [{ id: 'a', case: [0, 5], sorts: [v, USTENSILE] }], monstres: [{ id: 'm', case: [4, 5] }] });
  L(e, 'a', 'u', [2, 5]);
  refusIntact(e, () => R.lancer(e, 'a', 'v', [4, 5]), 'Pas de vue');
  e = mk({ artisans: [{ id: 'a', case: [0, 5], sorts: [v, PIEGE([D(1, 'T')])] }], monstres: [{ id: 'm', case: [4, 5] }] });
  L(e, 'a', 'pg', [2, 5]); L(e, 'a', 'v', [4, 5]);
  e = mk({ lignes: avec(grille(12, 12), 2, 5, '~'), artisans: [{ id: 'a', case: [0, 5], sorts: [v] }], monstres: [{ id: 'm', case: [4, 5] }] });
  L(e, 'a', 'v', [4, 5]);
  e = mk({ artisans: [{ id: 'a', case: [0, 5], sorts: [v] }], monstres: [{ id: 'm', case: [4, 5] }, { id: 'm2', case: [2, 5] }] });
  poserEtat(e, 'm2', 'derobe');
  L(e, 'a', 'v', [4, 5]);
});
test('A6 vue : symétrique avec décors, vide et combattants (5 cartes aléatoires, toutes les paires)', 'Rapport §3.8 : « Le résultat est le même dans les deux sens : si je te vois, tu me vois. »', () => {
  let s = 12345; const rnd = () => (s = (s * 1103515245 + 12345) % 2147483648) / 2147483648;
  for (let t = 0; t < 5; t++) {
    const lignes = Array.from({ length: 8 }, () => Array.from({ length: 8 }, () => { const r = rnd(); return r < 0.12 ? '#' : (r < 0.18 ? '~' : '.'); }).join(''));
    const libres = []; lignes.forEach((l, y) => [...l].forEach((ch, x) => { if (ch === '.') libres.push([x, y]); }));
    const occ = []; while (occ.length < 6) { const c = libres[Math.floor(rnd() * libres.length)]; if (!occ.some(o => eq(o, c))) occ.push(c); }
    const e = mk({ lignes, artisans: occ.slice(0, 3).map((c, i) => ({ id: 'a' + i, case: c })), monstres: occ.slice(3).map((c, i) => ({ id: 'm' + i, case: c })) });
    for (const p of libres) for (const q of libres) assert.strictEqual(R.ligneDeVue(e, p, q), R.ligneDeVue(e, q, p), 'asymétrie ' + p + ' ↔ ' + q);
  }
});

// =====================================================================
// B. Le Rideau (contrat, décision 1 mise à jour ; rapport §3.7)
// =====================================================================
const REF_RIDEAU = 'Contrat décision 1 : part gardée = (Faux-fuyant + 5) / (2 × Rideau + 5), parts multipliées ; Pas restants = arrondi(Pas × part), CM restants = arrondi(CM × part) ; si les Pas restants sont 0, déplacement refusé « Pris dans le Rideau ».';
test('B1 Rideau : 2 Grumeaux (Rideau 5), Faux-fuyant 5 → part 4/9, 3 CM et 1 Pas, puis 0 Pas après le pas de sortie', REF_RIDEAU + ' Tableau §3.7, ligne 2.', () => {
  const e = mk({ artisans: [{ id: 'a', case: [5, 5] }], monstres: [{ id: 'm1', case: [4, 5] }, { id: 'm2', case: [6, 5] }] });
  const r = R.apercuRideau(e, 'a');
  assert.ok(Math.abs(r.part - 4 / 9) < 1e-9, 'part ' + r.part);
  assert.deepStrictEqual([r.cmApres, r.pasApres, r.pris], [3, 1, false]);
  const evs = V(e, 'a', [5, 4]);
  assert.deepStrictEqual([C(e, 'a').cm, C(e, 'a').pas], [3, 0]);
  const rid = de(evs, 'rideau')[0];
  assert.deepStrictEqual([rid.cmPerdus, rid.pasPerdus], [3, 2]);
});
test('B2 Rideau : 3 ennemis au contact (Rideau 5) → part 8/27, 2 CM et 1 Pas, sortie possible', REF_RIDEAU, () => {
  const e = mk({ artisans: [{ id: 'a', case: [5, 5] }], monstres: [{ id: 'm1', case: [4, 5] }, { id: 'm2', case: [6, 5] }, { id: 'm3', case: [5, 6] }] });
  const r = R.apercuRideau(e, 'a');
  assert.ok(Math.abs(r.part - 8 / 27) < 1e-9, 'part ' + r.part);
  assert.deepStrictEqual([r.cmApres, r.pasApres], [2, 1]);
  V(e, 'a', [5, 4]);
  assert.deepStrictEqual([C(e, 'a').cm, C(e, 'a').pas, C(e, 'a').case], [2, 0, [5, 4]]);
});
test('B3 Rideau : un ennemi de Rideau 20 → 1 CM et 1 Pas (tableau §3.7, ligne 4), sortie puis 0 Pas', REF_RIDEAU, () => {
  const e = mk({ artisans: [{ id: 'a', case: [5, 5] }], monstres: [{ id: 'm', case: [6, 5], rideau: 20 }] });
  const r = R.apercuRideau(e, 'a');
  assert.deepStrictEqual([r.cmApres, r.pasApres, r.pris], [1, 1, false]);
  V(e, 'a', [4, 5]);
  assert.deepStrictEqual([C(e, 'a').cm, C(e, 'a').pas], [1, 0]);
});
test('B4 Rideau : 2 ennemis de Rideau 10 → 0 Pas restants : « Pris dans le Rideau », rien n\'est perdu', REF_RIDEAU + ' (Remplace « au moins 1 Pas gardé » du rapport §3.7.)', () => {
  const e = mk({ artisans: [{ id: 'a', case: [5, 5] }], monstres: [{ id: 'm1', case: [4, 5], rideau: 10 }, { id: 'm2', case: [6, 5], rideau: 10 }] });
  const r = R.apercuRideau(e, 'a');
  assert.strictEqual(r.pasApres, 0); assert.strictEqual(r.pris, true);
  refusIntact(e, () => R.deplacer(e, 'a', [5, 4]), 'Pris dans le Rideau');
  refusIntact(e, () => R.apercuDeplacement(e, 'a', [5, 4]), 'Pris dans le Rideau');
  assert.strictEqual(R.deplacementsPossibles(e, 'a').length, 0);
  assert.deepStrictEqual([C(e, 'a').cm, C(e, 'a').pas], [6, 3]);
});
test('B5 Rideau : la part s\'applique AVANT de payer le pas de sortie (1 Grumeau : 4 CM, 2 Pas, puis 1 Pas)', 'Rapport §3.7 : « Les CM et les Pas restants (avant de payer le pas qui fait sortir) sont multipliés par cette part » ; tableau ligne 1 : 4 CM et 2 Pas (puis le pas de sortie : 1 Pas).', () => {
  const e = mk({ artisans: [{ id: 'a', case: [5, 5] }], monstres: [{ id: 'm', case: [4, 5] }] });
  V(e, 'a', [6, 5]);
  assert.deepStrictEqual([C(e, 'a').cm, C(e, 'a').pas], [4, 1]);
  V(e, 'a', [7, 5]);
  assert.deepStrictEqual([C(e, 'a').cm, C(e, 'a').pas], [4, 0]);
});
test('B6 Rideau : Faux-fuyant ≥ 2 × Rideau (équipement ou Soufflé 50 → Faux-fuyant 10) = aucune perte, même à 2 ennemis', 'Contrat décision 1 : « Faux-fuyant ≥ 2 × Rideau ou l\'état Glissant : sortie sans perte. » Décision 5 : Soufflé → Faux-fuyant (+1 par 10).', () => {
  assert.strictEqual(R.deriverArtisan({ niveau: 11, affinites: { S: 50 } }).fauxFuyant, 10);
  [{ equipement: { fauxFuyant: 5 } }, { niveau: 11, affinites: { S: 50 } }].forEach(x => {
    const e = mk({ artisans: [Object.assign({ id: 'a', case: [5, 5] }, x)], monstres: [{ id: 'm1', case: [4, 5] }, { id: 'm2', case: [6, 5] }] });
    assert.strictEqual(R.apercuRideau(e, 'a').part, 1);
    const evs = V(e, 'a', [5, 4]);
    assert.strictEqual(de(evs, 'rideau').length, 0);
    assert.deepStrictEqual([C(e, 'a').cm, C(e, 'a').pas], [6, 2]);
  });
});
test('B7 Rideau : l\'état Glissant fait sortir sans perte, même pris par 3 ennemis', 'Contrat décision 1 et rapport §3.16 (Glissant : quitte le contact sans rien perdre).', () => {
  const e = mk({ artisans: [{ id: 'a', case: [5, 5] }], monstres: [{ id: 'm1', case: [4, 5], rideau: 20 }, { id: 'm2', case: [6, 5], rideau: 20 }, { id: 'm3', case: [5, 6], rideau: 20 }] });
  poserEtat(e, 'a', 'glissant', 1);
  assert.strictEqual(R.apercuRideau(e, 'a').part, 1);
  V(e, 'a', [5, 4]);
  assert.deepStrictEqual([C(e, 'a').cm, C(e, 'a').pas], [6, 2]);
});
test('B8 Rideau : ni un Ustensile ennemi, ni un ennemi Dérobé, ni un allié ne retiennent ; un Commis ennemi retient', 'Rapport §3.7 : « Seuls les ennemis visibles et debout retiennent (les Commis ennemis aussi ; pas les Ustensiles ni les combattants Dérobés). »', () => {
  // Ustensile ennemi
  let e = mk({ artisans: [{ id: 'a', case: [5, 5] }], monstres: [{ id: 'm', case: [9, 9], sorts: [USTENSILE] }] });
  passer(e); L(e, 'm', 'u', [5, 6]); passer(e);
  assert.strictEqual(R.apercuRideau(e, 'a').auContact, false, 'Ustensile');
  V(e, 'a', [4, 5]); assert.deepStrictEqual([C(e, 'a').cm, C(e, 'a').pas], [6, 2], 'Ustensile');
  // Dérobé ennemi
  e = mk({ artisans: [{ id: 'a', case: [5, 5] }], monstres: [{ id: 'm', case: [5, 6] }] });
  poserEtat(e, 'm', 'derobe');
  V(e, 'a', [4, 5]); assert.deepStrictEqual([C(e, 'a').cm, C(e, 'a').pas], [6, 2], 'Dérobé');
  // allié
  e = mk({ artisans: [{ id: 'a', case: [5, 5] }, { id: 'b', case: [5, 6] }], monstres: [{ id: 'm', case: [9, 9] }] });
  V(e, 'a', [4, 5]); assert.deepStrictEqual([C(e, 'a').cm, C(e, 'a').pas], [6, 2], 'allié');
  // Commis ennemi
  e = mk({ artisans: [{ id: 'a', case: [5, 5] }], monstres: [{ id: 'm', case: [9, 9], sorts: [INVOQUE({ nom: 'Pâton', victuailles: 20, cm: 3, pas: 3, rideau: 5, fauxFuyant: 0, sorts: [] })] }] });
  passer(e); L(e, 'm', 'inv', [5, 6]); jusqua(e, 'a');
  assert.strictEqual(R.apercuRideau(e, 'a').auContact, true, 'Commis');
  V(e, 'a', [4, 5]); assert.deepStrictEqual([C(e, 'a').cm, C(e, 'a').pas], [4, 1], 'Commis');
});
test('B9 Rideau : CONST.RIDEAU.pasGardes = 1 rétablit l\'ancien « au moins 1 Pas » (et 0 le supprime)', 'Rapport §3.7 « On garde toujours au moins 1 Pas » remplacé par la décision 1 ; le moteur annonce un réglage pour le rétablir.', () => {
  const old = R.CONST.RIDEAU.pasGardes;
  try {
    R.CONST.RIDEAU.pasGardes = 1;
    const e = mk({ artisans: [{ id: 'a', case: [5, 5] }], monstres: [{ id: 'm1', case: [4, 5], rideau: 10 }, { id: 'm2', case: [6, 5], rideau: 10 }] });
    assert.strictEqual(R.apercuRideau(e, 'a').pasApres, 1);
    V(e, 'a', [5, 4]);
    assert.deepStrictEqual([C(e, 'a').cm, C(e, 'a').pas], [1, 0]);
  } finally { R.CONST.RIDEAU.pasGardes = old; }
  assert.strictEqual(R.CONST.RIDEAU.pasGardes, 0, 'valeur par défaut : aucun minimum (décision 1)');
});
test('B10 Rideau : deux sorties de contact sur un même chemin se cumulent (couloir)', REF_RIDEAU + ' « en quittant une case au contact » : chaque sortie compte.', () => {
  const e = mk({ lignes: ['#.#.###', '.......', '#######'], artisans: [{ id: 'a', case: [1, 1], equipement: { pas: 3 } }], monstres: [{ id: 'm1', case: [1, 0] }, { id: 'm2', case: [3, 0] }] });
  const evs = V(e, 'a', [4, 1]);
  assert.strictEqual(de(evs, 'rideau').length, 2);
  assert.deepStrictEqual([C(e, 'a').cm, C(e, 'a').pas, C(e, 'a').case], [3, 0, [4, 1]]);
});

// =====================================================================
// C. Poussée, attirance, Écrasement, Planté (rapport §3.13 ; contrat décision 2)
// =====================================================================
const REF_ECRASE = 'Rapport §3.13 : « pour chaque case de poussée qu\'elle n\'a pas pu faire, elle subit 12 + niveau du lanceur / 4 … Le combattant heurté en subit la moitié … l\'Entame s\'applique. » Exemple : niveau 40, 2 cases bloquées = 44.';
test('C1 poussée contre un mur : Écrasement 2 × (12 + 40/4) = 44, Entame 5', REF_ECRASE, () => {
  const e = mk({ lignes: avec(grille(12, 12), 6, 5, '#'), artisans: [{ id: 'a', classe: 'bouchevalier', niveau: 40, case: [4, 5], sorts: [POUSSE(2)] }], monstres: [{ id: 'm', case: [5, 5] }] });
  const evs = L(e, 'a', 'p', [5, 5]);
  const ec = de(evs, 'ecrasement')[0];
  assert.ok(ec, 'pas d\'Écrasement'); assert.deepStrictEqual([ec.cases, ec.valeur], [2, 44]);
  assert.deepStrictEqual([C(e, 'm').victuailles, C(e, 'm').entame, C(e, 'm').case], [156, 5, [5, 5]]);
});
test('C2 poussée contre le vide et contre le bord de la carte : Écrasement aussi', 'Rapport §3.13 : « La cible s\'arrête si la case suivante est du décor plein, du vide, un Ustensile ou un combattant. »', () => {
  let e = mk({ lignes: avec(grille(12, 12), 6, 5, '~'), artisans: [{ id: 'a', classe: 'bouchevalier', niveau: 40, case: [4, 5], sorts: [POUSSE(2)] }], monstres: [{ id: 'm', case: [5, 5] }] });
  L(e, 'a', 'p', [5, 5]); assert.strictEqual(C(e, 'm').victuailles, 156, 'vide');
  e = mk({ artisans: [{ id: 'a', classe: 'bouchevalier', niveau: 40, case: [10, 5], sorts: [POUSSE(2)] }], monstres: [{ id: 'm', case: [11, 5] }] });
  L(e, 'a', 'p', [11, 5]); assert.strictEqual(C(e, 'm').victuailles, 156, 'bord');
});
test('C3 poussée contre un autre ennemi : la cible avance d\'1 case puis prend 44, le heurté 22', REF_ECRASE, () => {
  const e = mk({ artisans: [{ id: 'a', classe: 'bouchevalier', niveau: 40, case: [3, 5], sorts: [POUSSE(3)] }], monstres: [{ id: 'm', case: [4, 5] }, { id: 'm2', case: [6, 5] }] });
  const evs = L(e, 'a', 'p', [4, 5]);
  assert.deepStrictEqual(C(e, 'm').case, [5, 5]);
  assert.strictEqual(de(evs, 'ecrasement')[0].heurte, 'm2');
  assert.deepStrictEqual([C(e, 'm').victuailles, C(e, 'm2').victuailles], [156, 178]);
});
test('C4 poussée contre un allié du lanceur : l\'allié heurté ne prend rien', 'Contrat décision 2 : « Les zones de dégâts ne touchent JAMAIS les alliés (ni le lanceur). » (API §9 : rien pour un allié du lanceur heurté.)', () => {
  const e = mk({ artisans: [{ id: 'a', classe: 'bouchevalier', niveau: 40, case: [3, 5], sorts: [POUSSE(3)] }, { id: 'b', case: [6, 5] }], monstres: [{ id: 'm', case: [4, 5] }] });
  const vb = C(e, 'b').victuailles;
  L(e, 'a', 'p', [4, 5]);
  assert.deepStrictEqual([C(e, 'm').victuailles, C(e, 'b').victuailles], [156, vb]);
});
test('C5 poussée sur un piège : le piège se déclenche et arrête la cible (pas d\'Écrasement pour les cases restantes)', 'Rapport §3.13 : « Un piège sur le chemin d\'une poussée se déclenche et arrête la cible. »', () => {
  const e = mk({ artisans: [{ id: 'a', case: [3, 5], sorts: [POUSSE(3, { rayon: { min: 1, max: 1, modifiable: false } }), PIEGE([D(10, 'T')])] }], monstres: [{ id: 'm', case: [4, 5] }] });
  L(e, 'a', 'pg', [6, 5]);
  const evs = L(e, 'a', 'p', [4, 5]);
  assert.deepStrictEqual(C(e, 'm').case, [6, 5]);
  assert.strictEqual(de(evs, 'declenchement').length, 1);
  assert.strictEqual(de(evs, 'ecrasement').length, 0);
  assert.strictEqual(C(e, 'm').victuailles, 190);
  assert.strictEqual(e.sol.length, 0, 'le piège disparaît');
});
test('C6 poussée : diagonale à égalité parfaite ; sinon l\'axe le plus long', 'Rapport §3.13 : « Si la cible n\'est pas alignée, on prend l\'axe le plus long ; à égalité parfaite, elle part en diagonale. »', () => {
  let e = mk({ artisans: [{ id: 'a', case: [3, 3], sorts: [POUSSE(1)] }], monstres: [{ id: 'm', case: [4, 4] }] });
  L(e, 'a', 'p', [4, 4]); assert.deepStrictEqual(C(e, 'm').case, [5, 5]);
  e = mk({ artisans: [{ id: 'a', case: [3, 4], sorts: [POUSSE(1)] }], monstres: [{ id: 'm', case: [5, 5] }] });
  L(e, 'a', 'p', [5, 5]); assert.deepStrictEqual(C(e, 'm').case, [6, 5]);
});
test('C7 poussée en zone : chaque cible s\'éloigne de la case visée, la plus éloignée d\'abord (pas de faux Écrasement)', 'Rapport §3.13 : « Pour une zone qui pousse, chaque cible s\'éloigne de la case visée, en commençant par la plus éloignée. »', () => {
  const z = Sp({ id: 'z', element: 'S', cible: 'case', parTour: 2, zone: { forme: 'croix', taille: 2 }, effets: [{ type: 'pousse', cases: 1 }] });
  const e = mk({ artisans: [{ id: 'a', case: [1, 5], sorts: [z] }], monstres: [{ id: 'm1', case: [4, 5] }, { id: 'm2', case: [5, 5] }] });
  const evs = L(e, 'a', 'z', [3, 5]);
  assert.strictEqual(de(evs, 'ecrasement').length, 0);
  assert.deepStrictEqual([C(e, 'm1').case, C(e, 'm2').case], [[5, 5], [6, 5]]);
});
test('C8 Planté : ni poussé, ni attiré, ni échangé, ni ramené (et pas d\'Écrasement)', 'Rapport §3.13 : « L\'état Planté empêche tout déplacement forcé (poussée, attirance, échange, téléportation par un autre). »', () => {
  const X = Sp({ id: 'ech', element: 'N', cible: 'combattant', parTour: 2, effets: [{ type: 'echange' }] });
  const RM = Sp({ id: 'rm', element: 'N', cible: 'allie', touche: 'allies', parTour: 2, effets: [{ type: 'ramene', cases: 3 }] });
  const e = mk({ artisans: [{ id: 'a', case: [5, 5], equipement: { cm: 5 }, sorts: [POUSSE(2), ATTIRE(2), X, RM] }, { id: 'b', case: [5, 9] }], monstres: [{ id: 'm', case: [8, 5] }] });
  poserEtat(e, 'm', 'plante'); poserEtat(e, 'b', 'plante');
  let evs = L(e, 'a', 'p', [8, 5]);
  assert.deepStrictEqual(C(e, 'm').case, [8, 5]); assert.strictEqual(de(evs, 'resiste').length, 1); assert.strictEqual(de(evs, 'degats').length, 0);
  evs = L(e, 'a', 'at', [8, 5]); assert.deepStrictEqual(C(e, 'm').case, [8, 5]); assert.strictEqual(de(evs, 'resiste').length, 1);
  evs = L(e, 'a', 'ech', [8, 5]); assert.deepStrictEqual([C(e, 'a').case, C(e, 'm').case], [[5, 5], [8, 5]]);
  evs = L(e, 'a', 'rm', [5, 9]); assert.deepStrictEqual(C(e, 'b').case, [5, 9]); assert.strictEqual(de(evs, 'resiste').length, 1);
});
test('C9 attirance : la cible vient vers le lanceur et s\'arrête au contact, quel que soit n', 'Rapport §3.13 : « Attirer de n cases : la cible vient vers le lanceur, et s\'arrête au contact. »', () => {
  let e = mk({ artisans: [{ id: 'a', case: [0, 5], sorts: [ATTIRE(10)] }], monstres: [{ id: 'm', case: [5, 5] }] });
  L(e, 'a', 'at', [5, 5]); assert.deepStrictEqual(C(e, 'm').case, [1, 5]);
  const evs = L(e, 'a', 'at', [1, 5]); assert.deepStrictEqual(C(e, 'm').case, [1, 5]); assert.strictEqual(de(evs, 'attire').length, 0);
  e = mk({ artisans: [{ id: 'a', case: [0, 5], sorts: [ATTIRE(2)] }], monstres: [{ id: 'm', case: [5, 5] }] });
  L(e, 'a', 'at', [5, 5]); assert.deepStrictEqual(C(e, 'm').case, [3, 5]);
  e = mk({ artisans: [{ id: 'a', case: [2, 2], sorts: [ATTIRE(10)] }], monstres: [{ id: 'm', case: [5, 5] }] });
  L(e, 'a', 'at', [5, 5]); assert.strictEqual(R.distance(C(e, 'm').case, [2, 2]), 1, 'cible en diagonale');
});
test('C10 attirance bloquée par un obstacle : arrêt, sans Écrasement', 'Rapport §3.13 (l\'Écrasement ne vient que d\'une poussée).', () => {
  const e = mk({ lignes: avec(grille(12, 12), 3, 5, '#'), artisans: [{ id: 'a', case: [0, 5], sorts: [ATTIRE(10)] }], monstres: [{ id: 'm', case: [5, 5] }] });
  const evs = L(e, 'a', 'at', [5, 5]);
  assert.deepStrictEqual(C(e, 'm').case, [4, 5]); assert.strictEqual(C(e, 'm').victuailles, 200); assert.strictEqual(de(evs, 'ecrasement').length, 0);
});
test('C11 poussée d\'un ALLIÉ (sort de placement, touche « allies ») contre un mur : l\'allié ne prend pas d\'Écrasement', 'Contrat décision 2 : « Les zones de dégâts ne touchent JAMAIS les alliés » ; décision 8 : Soufflé = le placement. Le moteur épargne déjà l\'allié HEURTÉ (API §9, « décision 2 ») : l\'allié POUSSÉ devrait l\'être aussi.', () => {
  const PA = Sp({ id: 'pa', element: 'S', cible: 'allie', touche: 'allies', parTour: 1, effets: [{ type: 'pousse', cases: 2 }] });
  const e = mk({ lignes: avec(grille(12, 12), 6, 5, '#'), artisans: [{ id: 'a', case: [4, 5], sorts: [PA] }, { id: 'b', case: [5, 5] }], monstres: [{ id: 'm', case: [9, 9] }] });
  const evs = L(e, 'a', 'pa', [5, 5]);
  const d = de(evs, 'degats').filter(x => x.cible === 'b');
  assert.deepStrictEqual(d.map(x => x.valeur), [], 'l\'allié b prend ' + d.map(x => x.valeur + ' (Écrasement, Entame ' + x.entame + ')').join(', '));
});
test('C12 mort sur un piège ou une nappe en marchant, poussé ou attiré : pas d\'exception, le tour et le combat continuent', 'Rapport §3.17 : le piège « se déclenche quand un ennemi y entre, en marchant ou poussé » ; §3.19 (tomber) ; API §2 : chaque action renvoie { ok, evenements }.', () => {
  const PM = PIEGE([D(500, 'T')]);
  const NM = Sp({ id: 'na', element: 'T', cible: 'case', parTour: 2, effets: [{ type: 'pose', quoi: 'nappe', tours: 2, declenche: 'entree', effets: [D(500, 'T')] }] });
  const cas = {
    'un monstre marche sur un piège mortel': () => { const e = mk({ artisans: [{ id: 'a', case: [0, 0], sorts: [PM] }], monstres: [{ id: 'm', case: [5, 2] }, { id: 'n', case: [9, 9] }] }); L(e, 'a', 'pg', [5, 3]); passer(e); return [e, () => R.deplacer(e, 'm', [5, 4]), 'n']; },
    'un monstre entre dans une nappe mortelle': () => { const e = mk({ artisans: [{ id: 'a', case: [0, 0], sorts: [NM] }], monstres: [{ id: 'm', case: [5, 2] }, { id: 'n', case: [9, 9] }] }); L(e, 'a', 'na', [5, 3]); passer(e); return [e, () => R.deplacer(e, 'm', [5, 4]), 'n']; },
    'le dernier monstre marche sur un piège mortel': () => { const e = mk({ artisans: [{ id: 'a', case: [0, 0], sorts: [PM] }], monstres: [{ id: 'm', case: [5, 2] }] }); L(e, 'a', 'pg', [5, 3]); passer(e); return [e, () => R.deplacer(e, 'm', [5, 4]), 'fin']; },
    'un ennemi poussé sur un piège mortel': () => { const e = mk({ artisans: [{ id: 'a', case: [3, 5], sorts: [PM, POUSSE(3)] }], monstres: [{ id: 'm', case: [4, 5] }, { id: 'n', case: [9, 9] }] }); L(e, 'a', 'pg', [6, 5]); return [e, () => R.lancer(e, 'a', 'p', [4, 5]), 'a']; },
    'un ennemi attiré sur un piège mortel': () => { const e = mk({ artisans: [{ id: 'a', case: [0, 5], sorts: [PM, ATTIRE(5)] }], monstres: [{ id: 'm', case: [5, 5] }, { id: 'n', case: [9, 9] }] }); L(e, 'a', 'pg', [3, 5]); return [e, () => R.lancer(e, 'a', 'at', [5, 5]), 'a']; },
    'iaJoue : un monstre entouré de pièges mortels': () => { const e = mk({ artisans: [{ id: 'a', case: [5, 6], sorts: [PM] }], monstres: [{ id: 'm', case: [5, 2], sorts: [FRAPPE(5, { rayon: { min: 1, max: 1, modifiable: false } })] }, { id: 'n', case: [11, 11] }] }); L(e, 'a', 'pg', [5, 4]); L(e, 'a', 'pg', [4, 5]); L(e, 'a', 'pg', [6, 5]); passer(e); return [e, () => R.iaJoue(e, 'm'), 'n']; }
  };
  const ko = [];
  for (const nom of Object.keys(cas)) {
    const [e, action, attendu] = cas[nom]();
    let r;
    try { r = action(); } catch (x) {
      const a = R.actif(e), f = a && R.finDuTour(e, a.id);
      ko.push(nom + ' → exception « ' + x.message + ' » ; état bloqué : actif = ' + (a && a.id) + (a && !a.vivant ? ' (tombé)' : '') + ', finDuTour → « ' + (f && (f.ok ? 'ok' : f.raison)) + ' »');
      continue;
    }
    const a = R.actif(e);
    if (!r.ok) ko.push(nom + ' → refusé : ' + r.raison);
    else if (attendu === 'fin' ? e.phase !== 'fin' : !(a && a.id === attendu)) ko.push(nom + ' → actif ' + (a && a.id) + ', phase ' + e.phase);
  }
  assert.deepStrictEqual(ko, []);
});

// =====================================================================
// D. Zones (contrat décision 2 ; rapport §3.12)
// =====================================================================
const REF_ALLIES = 'Contrat décision 2 : « Les zones de dégâts ne touchent JAMAIS les alliés (ni le lanceur). Une zone de dégâts touche les ennemis. »';
test('D1 zone de dégâts centrée sur le lanceur : ni le lanceur, ni l\'allié, ni l\'Ustensile allié ; Coup d\'outil en travers non plus', REF_ALLIES, () => {
  const Z = Sp({ id: 'z', cible: 'case', parTour: 2, zone: { forme: 'rond', taille: 3 }, effets: [D(50)] });
  const e = mk({ artisans: [{ id: 'a', case: [5, 5], equipement: { cm: 5 }, sorts: [Z, USTENSILE, O.pour('levainqueur')] }, { id: 'b', case: [6, 6] }], monstres: [{ id: 'm', case: [6, 5] }, { id: 'm2', case: [5, 3] }] });
  L(e, 'a', 'u', [4, 5]);
  const ust = e.combattants.find(c => c.genre === 'ustensile');
  L(e, 'a', 'z', [5, 5]);
  L(e, 'a', 'levainqueur.coup-d-outil', [6, 5]);
  assert.deepStrictEqual([C(e, 'a').victuailles, C(e, 'b').victuailles, ust.victuailles], [95, 95, 20]);
  assert.ok(C(e, 'm').victuailles < 200 && C(e, 'm2').victuailles < 200);
});
test('D2 fournée et piège à zone : les alliés du poseur dans la zone ne sont pas touchés', REF_ALLIES, () => {
  const F = Sp({ id: 'f', cible: 'case', parTour: 2, effets: [{ type: 'pose', quoi: 'fournee', tours: 0, zone: { forme: 'rond', taille: 2 }, touche: 'ennemis', effets: [D(30)] }] });
  let e = mk({ artisans: [{ id: 'a', case: [0, 0], sorts: [F] }, { id: 'b', case: [5, 6] }], monstres: [{ id: 'm', case: [5, 4] }] });
  L(e, 'a', 'f', [5, 5]);
  assert.strictEqual(C(e, 'b').victuailles, 95, 'fournée'); assert.ok(C(e, 'm').victuailles < 200);
  const P = PIEGE([D(30, 'T')]); P.effets[0].zone = { forme: 'rond', taille: 2 };
  e = mk({ artisans: [{ id: 'a', case: [0, 0], sorts: [P] }, { id: 'b', case: [5, 6] }], monstres: [{ id: 'm', case: [8, 5] }] });
  L(e, 'a', 'pg', [5, 5]); passer(e);
  V(e, 'm', [5, 5]);
  assert.strictEqual(C(e, 'b').victuailles, 95, 'piège'); assert.ok(C(e, 'm').victuailles < 200);
});
test('D3 rebond : jamais sur un allié, même s\'il est le plus proche', 'Contrat §3 : « rebond … sur l\'ennemi le plus proche à rayon cases au plus ». Décision 2.', () => {
  const S = Sp({ id: 'r', element: 'C', cible: 'ennemi', parTour: 2, effets: [D(20, 'C'), { type: 'rebond', fois: 2, rayon: 5, part: 50 }] });
  const e = mk({ artisans: [{ id: 'a', case: [0, 0], sorts: [S] }, { id: 'b', case: [5, 6] }], monstres: [{ id: 'm1', case: [5, 5] }, { id: 'm2', case: [5, 8] }] });
  const evs = L(e, 'a', 'r', [5, 5]);
  assert.ok(!de(evs, 'rebond').some(x => x.vers === 'b'));
  assert.strictEqual(C(e, 'b').victuailles, 95); assert.strictEqual(C(e, 'm2').victuailles, 190);
});
test('D4 baisse en zone : −15 % par case d\'éloignement, 3 fois au plus (100, 85, 70, 55, 55, 55)', 'Contrat §2 : « baisse de 15 % par case d\'éloignement, 3 fois au plus ». Rapport §3.12 (55 % au minimum).', () => {
  const Z = Sp({ id: 'z', cible: 'case', parTour: 2, zone: { forme: 'rond', taille: 5 }, effets: [D(100)] });
  const e = mk({ lignes: grille(13, 13), artisans: [{ id: 'a', case: [0, 6], sorts: [Z] }], monstres: [6, 7, 8, 9, 10, 11].map(x => ({ id: 'm' + x, case: [x, 6] })) });
  L(e, 'a', 'z', [6, 6]);
  assert.deepStrictEqual([6, 7, 8, 9, 10, 11].map(x => 200 - C(e, 'm' + x).victuailles), [100, 85, 70, 55, 55, 55]);
});
test('D5 zone « sans baisse » : la même valeur partout', 'Rapport §3.12 : « Un sort peut être marqué « sans baisse ». »', () => {
  const Z = Sp({ id: 'z', cible: 'case', parTour: 2, zone: { forme: 'rond', taille: 5, baisse: false }, effets: [D(100)] });
  const e = mk({ lignes: grille(13, 13), artisans: [{ id: 'a', case: [0, 6], sorts: [Z] }], monstres: [6, 9, 11].map(x => ({ id: 'm' + x, case: [x, 6] })) });
  L(e, 'a', 'z', [6, 6]);
  assert.deepStrictEqual([6, 9, 11].map(x => 200 - C(e, 'm' + x).victuailles), [100, 100, 100]);
});
test('D6 demi-rond lancé en diagonale : 4 / 9 / 16 cases comme dans le tableau (point fragile déjà signalé par l\'auteur)', 'Rapport §3.12, tableau : « demi-rond : la moitié du rond tournée vers l\'arrière, la case visée comprise : 4 / 9 / 16 » ; API §9 : axe en diagonale à égalité.', () => {
  const e = faux(grille(20, 20));
  const n = (t, origine) => R.casesZone(e, { forme: 'demi-rond', taille: t }, origine, [10, 10]).length;
  assert.deepStrictEqual([1, 2, 3].map(t => n(t, [6, 10])), [4, 9, 16], 'en ligne');
  assert.deepStrictEqual([1, 2, 3].map(t => n(t, [7, 7])), [4, 9, 16], 'en diagonale');
});
test('D7 robustesse : un sort de dégâts mal écrit (touche « allies ») ne blesse quand même pas les alliés', REF_ALLIES + ' « JAMAIS » ; §4 : tout sort qui fait des dégâts a touche = « ennemis ».', () => {
  const Z = Sp({ id: 'mal', cible: 'case', parTour: 2, touche: 'allies', zone: { forme: 'rond', taille: 1 }, effets: [D(30)] });
  const e = mk({ artisans: [{ id: 'a', case: [5, 5], sorts: [Z] }, { id: 'b', case: [5, 6] }], monstres: [{ id: 'm', case: [6, 5] }] });
  assert.ok(e.avertissements.some(t => /touche les ennemis/.test(t)), 'avertissement attendu');
  L(e, 'a', 'mal', [5, 5]);
  assert.deepStrictEqual([C(e, 'a').victuailles, C(e, 'b').victuailles], [95, 95], 'le lanceur et l\'allié ont perdu ' + (95 - C(e, 'a').victuailles) + ' et ' + (95 - C(e, 'b').victuailles) + ' Victuailles');
});

// =====================================================================
// E. Limites, relances, rangs (contrat §2, décision 9 ; rapport §3.10)
// =====================================================================
test('E1 limites : parTour 3 / parCible 2 → « Déjà servi à cette cible », puis « Plus de service pour ce tour », remis à zéro au tour suivant', 'Rapport §3.10 (parTour, parCible) ; contrat §2 barème : frappe à 2 CM : 3 par tour, 2 par cible.', () => {
  const S = Sp({ id: 'l', cm: 1, cible: 'ennemi', parTour: 3, parCible: 2, effets: [D(1)] });
  const e = mk({ artisans: [{ id: 'a', case: [0, 0], sorts: [S] }], monstres: [{ id: 'm1', case: [3, 0] }, { id: 'm2', case: [0, 3] }] });
  L(e, 'a', 'l', [3, 0]); L(e, 'a', 'l', [3, 0]);
  refusIntact(e, () => R.lancer(e, 'a', 'l', [3, 0]), 'Déjà servi à cette cible');
  L(e, 'a', 'l', [0, 3]);
  refusIntact(e, () => R.lancer(e, 'a', 'l', [0, 3]), 'Plus de service pour ce tour');
  passer(e); passer(e); passer(e); jusqua(e, 'a');
  L(e, 'a', 'l', [3, 0]);
});
test('E2 relance 2 : lancé au tour t, refusé au tour t+1 (« Revient dans 1 tour »), permis au tour t+2', 'Rapport §3.10 : « relance : nombre de tours du lanceur à attendre avant de relancer ».', () => {
  const e = mk({ artisans: [{ id: 'a', case: [0, 0], sorts: [FRAPPE(1, { relance: 2 })] }], monstres: [{ id: 'm', case: [3, 0] }] });
  L(e, 'a', 'x', [3, 0]);
  passer(e); passer(e);
  refusIntact(e, () => R.lancer(e, 'a', 'x', [3, 0]), 'Revient dans 1 tour');
  passer(e); passer(e);
  L(e, 'a', 'x', [3, 0]);
});
test('E3 relanceInitiale : 1 → pas avant le 2e tour ; 2 → pas avant le 3e tour', 'Rapport §3.10 : « relanceInitiale : nombre de tours du lanceur avant le premier lancer » ; chef-d\'œuvre : « relanceInitiale 2 (pas avant le 3e tour) ».', () => {
  const e = mk({ artisans: [{ id: 'a', case: [0, 0], sorts: [FRAPPE(1, { id: 'r1', relanceInitiale: 1 }), FRAPPE(1, { id: 'r2', relanceInitiale: 2 })] }], monstres: [{ id: 'm', case: [3, 0] }] });
  refusIntact(e, () => R.lancer(e, 'a', 'r1', [3, 0]), 'Revient dans 1 tour');
  refusIntact(e, () => R.lancer(e, 'a', 'r2', [3, 0]), 'Revient dans 2 tours');
  passer(e); passer(e);
  L(e, 'a', 'r1', [3, 0]);
  refusIntact(e, () => R.lancer(e, 'a', 'r2', [3, 0]), 'Revient dans 1 tour');
  passer(e); passer(e);
  L(e, 'a', 'r2', [3, 0]);
});
test('E4 rang 3 : relance − 1, minimum 0 (relance 2 → 1, 1 → 0, 0 → 0)', 'Contrat décision 9 : « rang 3 = × 1,30 et relance − 1 (minimum 0) ».', () => {
  const e = mk({ artisans: [{ id: 'a', niveau: 101, case: [0, 0], sorts: [FRAPPE(1, { id: 'q2', relance: 2 }), FRAPPE(1, { id: 'q1', relance: 1 }), FRAPPE(1, { id: 'q0', relance: 0 })] }], monstres: [{ id: 'm', case: [3, 0] }] });
  const s = id => C(e, 'a').sorts.find(x => x.id === id);
  assert.deepStrictEqual([s('q2').rang, s('q2').relance, s('q1').relance, s('q0').relance], [3, 1, 0, 0]);
  L(e, 'a', 'q1', [3, 0]); L(e, 'a', 'q1', [3, 0]);
  L(e, 'a', 'q2', [3, 0]);
  passer(e); passer(e);
  L(e, 'a', 'q2', [3, 0]);
});
test('E5 rangs : rang 2 cinquante niveaux après le déblocage, rang 3 cent niveaux après, plafonné à 200', 'Contrat décision 9 : « un sort passe au rang 2 cinquante niveaux après son déblocage, au rang 3 cent niveaux après (plafonné à 200) ».', () => {
  const t = [[1, 50, 1], [1, 51, 2], [1, 100, 2], [1, 101, 3], [57, 106, 1], [57, 107, 2], [120, 169, 1], [120, 170, 2], [120, 199, 2], [120, 200, 3]];
  t.forEach(([s, a, r]) => assert.strictEqual(R.rangSort(s, a), r, 'sort ' + s + ', artisan ' + a));
});
test('E6 rangs : dégâts, soins et boucliers × 1,15 puis × 1,30, y compris dans une pose et un « si »', 'Contrat décision 9 : « rang 2 = dégâts, soins et boucliers × 1,15 ; rang 3 = × 1,30 ».', () => {
  const s = Sp({ id: 'k', effets: [{ type: 'degats', element: 'F', min: 10, max: 14, maitre: [13, 17] }, { type: 'soin', min: 20, max: 20 }, { type: 'bouclier', valeur: 20, tours: 2 },
    { type: 'pose', quoi: 'fournee', tours: 1, effets: [{ type: 'degats', element: 'F', min: 30, max: 36, maitre: [37, 45] }] }, { type: 'si', condition: 'cibleBlessee', effets: [D(10)] }] });
  const r2 = R.sortAuRang(s, 2), r3 = R.sortAuRang(s, 3);
  assert.deepStrictEqual([r2.effets[0].min, r2.effets[0].max, r2.effets[0].maitre], [12, 16, [15, 20]]);
  assert.deepStrictEqual([r2.effets[1].min, r2.effets[2].valeur, r2.effets[3].effets[0].min, r2.effets[3].effets[0].max, r2.effets[4].effets[0].min], [23, 23, 35, 41, 12]);
  assert.deepStrictEqual([r3.effets[0].min, r3.effets[0].max, r3.effets[2].valeur], [13, 18, 26]);
});
test('E7 rangs en combat : un artisan de niveau 51 frappe à 12 avec un sort de 10 (rang 2)', 'Contrat décision 9 (règle générique, pas de données par sort).', () => {
  const e = mk({ artisans: [{ id: 'a', niveau: 51, case: [0, 0], sorts: [FRAPPE(10)] }], monstres: [{ id: 'm', case: [3, 0] }] });
  L(e, 'a', 'x', [3, 0]);
  assert.strictEqual(C(e, 'm').victuailles, 188);
});
test('E8 rangs « règle générique » : le Coup d\'outil et les sorts d\'un Commis montent aussi de rang (à trancher)', 'Contrat décision 9 : « rang 2 = dégâts, soins et boucliers × 1,15 ; rang 3 = × 1,30 … Règle générique, pas de données par sort. » Le moteur exclut le Coup d\'outil (emplacement 0) et les sorts des Commis (API §9) ; ces exceptions ne sont pas dans le contrat.', () => {
  const inv = INVOQUE({ nom: 'K', victuailles: 10, cm: 3, pas: 3, sorts: [Sp({ id: 'k', element: 'T', cible: 'ennemi', parTour: 1, effets: [D(10, 'T')] })] }, { element: 'T' });
  const e = mk({ artisans: [{ id: 'a', classe: 'legumancien', niveau: 200, case: [0, 0], sorts: [O.pour('legumancien'), inv] }], monstres: [{ id: 'm', case: [5, 5] }] });
  const outil = C(e, 'a').sorts.find(s => s.emplacement === 0);
  const ecarts = [];
  if (outil.rang !== 3) ecarts.push('Coup d\'outil au rang ' + outil.rang + ' au niveau 200 (dégâts ' + outil.effets[0].min + '-' + outil.effets[0].max + ' au lieu de 18-22)');
  const iv = de(L(e, 'a', 'inv', [1, 0]), 'invoque')[0];
  const k = C(e, iv.id).sorts[0].effets[0];
  if (k.min !== 13) ecarts.push('sort du Commis invoqué par un sort de rang 3 : ' + k.min + ' au lieu de 13 (avant le × (1 + niveau / 120))');
  assert.deepStrictEqual(ecarts, []);
});

// =====================================================================
// F. Retraits de CM et de Pas (contrat §3 ; rapport §3.14)
// =====================================================================
const REF_RETRAIT = 'Contrat §3 : « retire … (garanti, plafond 2 CM et 2 Pas entre deux tours de la cible) ». Rapport §3.14 : « état Ramolli compris … Un retrait s\'applique à son prochain tour … Si c\'est son tour, il s\'applique tout de suite. »';
const RETIRE = (quoi, n, id) => Sp({ id: id || ('r' + quoi + n), element: 'E', cm: 1, cible: 'ennemi', parTour: 0, effets: [{ type: 'retire', quoi, n }] });
test('F1 retraits : 3 retraits de 1 Pas → 2 seulement, appliqués au début du tour de la cible', REF_RETRAIT, () => {
  const e = mk({ artisans: [{ id: 'a', case: [0, 0], sorts: [RETIRE('pas', 1)] }], monstres: [{ id: 'm', case: [3, 0] }] });
  const n = [1, 2, 3].map(() => de(L(e, 'a', 'rpas1', [3, 0]), 'retrait')[0].n);
  assert.deepStrictEqual(n, [1, 1, 0]);
  assert.strictEqual(C(e, 'm').pas, 0, 'la cible n\'a pas encore joué');
  const evs = passer(e);
  assert.deepStrictEqual([de(evs, 'tour')[0].retraits.pas, C(e, 'm').pas], [2, 1]);
});
test('F2 retraits : retirer 3 CM n\'en retire que 2', REF_RETRAIT, () => {
  const e = mk({ artisans: [{ id: 'a', case: [0, 0], sorts: [RETIRE('cm', 3)] }], monstres: [{ id: 'm', case: [3, 0] }] });
  const r = de(L(e, 'a', 'rcm3', [3, 0]), 'retrait')[0];
  assert.deepStrictEqual([r.n, r.plafond], [2, true]);
  passer(e); assert.strictEqual(C(e, 'm').cm, 4);
});
test('F3 retraits : Ramolli 2 couches + retrait de 2 Pas → 2 Pas perdus au total (dans les deux ordres)', REF_RETRAIT, () => {
  const RAM = Sp({ id: 'ram', element: 'E', cm: 1, cible: 'ennemi', effets: [{ type: 'etat', etat: 'ramolli', tours: 1, couches: 2 }] });
  [['ram', 'rpas2'], ['rpas2', 'ram']].forEach(ordre => {
    const e = mk({ artisans: [{ id: 'a', case: [0, 0], sorts: [RAM, RETIRE('pas', 2)] }], monstres: [{ id: 'm', case: [3, 0] }] });
    ordre.forEach(s => L(e, 'a', s, [3, 0]));
    passer(e); assert.strictEqual(C(e, 'm').pas, 1, ordre.join(' puis '));
  });
});
test('F4 retraits : la fenêtre se rouvre après le tour de la cible', REF_RETRAIT, () => {
  const e = mk({ artisans: [{ id: 'a', case: [0, 0], sorts: [RETIRE('pas', 2)] }], monstres: [{ id: 'm', case: [3, 0] }] });
  L(e, 'a', 'rpas2', [3, 0]); passer(e); assert.strictEqual(C(e, 'm').pas, 1);
  passer(e); L(e, 'a', 'rpas2', [3, 0]); passer(e); assert.strictEqual(C(e, 'm').pas, 1);
});
test('F5 retraits : reçu pendant son propre tour (piège), le retrait s\'applique tout de suite', REF_RETRAIT, () => {
  const e = mk({ artisans: [{ id: 'a', case: [0, 0], sorts: [PIEGE([{ type: 'retire', quoi: 'pas', n: 2 }])] }], monstres: [{ id: 'm', case: [5, 2] }] });
  L(e, 'a', 'pg', [5, 3]); passer(e);
  const evs = V(e, 'm', [5, 4]);
  assert.deepStrictEqual(C(e, 'm').case, [5, 3], 'le piège arrête');
  assert.strictEqual(de(evs, 'retrait')[0].n, 2);
  assert.strictEqual(C(e, 'm').pas, 0);
});

// =====================================================================
// G. Entame, soin, Pain de route, Conservation, coup de maître (rapport §3.11, §3.15 ; contrat décision 3)
// =====================================================================
test('G1 Entame : 18 dégâts → 18/8 = 2, le maximum du Grumeau passe de 52 à 50', 'Rapport §3.11 (exemple) et §3.15 : une part sur huit des dégâts reçus réduit le maximum.', () => {
  const e = mk({ artisans: [{ id: 'a', case: [0, 0], sorts: [FRAPPE(18)] }], monstres: [{ id: 'g', case: [3, 0], victuailles: 52 }] });
  const d = de(L(e, 'a', 'x', [3, 0]), 'degats')[0];
  assert.deepStrictEqual([d.perdu, d.entame, d.max, C(e, 'g').victuailles], [18, 2, 50, 34]);
});
test('G2 soin : ne rend pas l\'Entame (95 → 55, Entame 5, soin de 100 → 90)', 'Rapport §3.11 : « Un soin ne dépasse pas le maximum de Victuailles (diminué de l\'Entame) » ; §3.15 : « Les soins ne rendent pas l\'Entame. »', () => {
  const soin = Sp({ id: 's', element: 'N', cible: 'soi', touche: 'allies', parTour: 1, effets: [{ type: 'soin', min: 100, max: 100 }] });
  const e = mk({ artisans: [{ id: 'p', classe: 'patissorcier', case: [0, 0], sorts: [soin] }], monstres: [{ id: 'm', case: [3, 0], sorts: [FRAPPE(40)] }] });
  passer(e); L(e, 'm', 'x', [0, 0]); passer(e);
  assert.deepStrictEqual([C(e, 'p').victuailles, C(e, 'p').entame], [55, 5]);
  const s = de(L(e, 'p', 's', [0, 0]), 'soin')[0];
  assert.deepStrictEqual([s.valeur, C(e, 'p').victuailles, s.max], [35, 90, 90]);
});
test('G3 Entame spéciale : portée à 25 %, plafonnée à 50 % ; les boucliers absorbent avant l\'Entame', 'Contrat §3 : entame porte l\'Entame à part %. Rapport §3.15 : « Plafond : 50 % » ; §3.11 étapes 6-7 : les boucliers d\'abord, puis l\'Entame sur les Victuailles.', () => {
  const EN = p => Sp({ id: 'en' + p, element: 'F', cm: 1, cible: 'ennemi', parTour: 1, effets: [{ type: 'entame', part: p, tours: 2 }] });
  let e = mk({ artisans: [{ id: 'a', case: [0, 0], sorts: [EN(25), FRAPPE(40)] }], monstres: [{ id: 'm', case: [3, 0] }] });
  L(e, 'a', 'en25', [3, 0]); L(e, 'a', 'x', [3, 0]); assert.strictEqual(C(e, 'm').entame, 10);
  e = mk({ artisans: [{ id: 'a', case: [0, 0], sorts: [EN(80), FRAPPE(40)] }], monstres: [{ id: 'm', case: [3, 0] }] });
  L(e, 'a', 'en80', [3, 0]); L(e, 'a', 'x', [3, 0]); assert.strictEqual(C(e, 'm').entame, 20);
  e = mk({ artisans: [{ id: 'a', case: [0, 0], sorts: [FRAPPE(20)] }], monstres: [{ id: 'm', case: [3, 0] }] });
  C(e, 'm').boucliers.push({ valeur: 15, restant: 15, tours: 0, source: 'm', sortId: 'b' });
  const d = de(L(e, 'a', 'x', [3, 0]), 'degats')[0];
  assert.deepStrictEqual([d.absorbe, d.perdu, d.entame], [15, 5, 0]);
});
test('G4 Pain de route : 12 + 2 × niveau / 10 (arrondi bas), 2 CM, 1 par tour, 3 par combat, refusé si plein', 'Contrat décision 3 : « Pain de route du Sac : objet, 2 CM, 1 fois par tour, soigne 12 + 2 × niveau / 10 (arrondi bas), 3 par combat. »', () => {
  assert.deepStrictEqual([6, 9, 10, 200].map(R.valeurPain), [13, 13, 14, 52]);
  let e = mk({ artisans: [{ id: 'a', niveau: 6, case: [0, 0] }], monstres: [{ id: 'm', case: [5, 5] }] });
  refusIntact(e, () => R.utiliserPainDeRoute(e, 'a'), 'Victuailles déjà pleines');
  C(e, 'a').victuailles = 50;
  for (let t = 0; t < 3; t++) {
    const s = de(R.utiliserPainDeRoute(e, 'a').evenements, 'soin')[0];
    assert.strictEqual(s.valeur, 13); assert.strictEqual(C(e, 'a').cm, 4);
    refusIntact(e, () => R.utiliserPainDeRoute(e, 'a'), t < 2 ? 'Déjà mangé ce tour' : 'Plus de Pain de route');
    passer(e); passer(e);
  }
  refusIntact(e, () => R.utiliserPainDeRoute(e, 'a'), 'Plus de Pain de route');
  assert.strictEqual(C(e, 'a').victuailles, 89);
});
test('G5 Conservation d\'un artisan plafonnée à 40 % (équipement 60 %, puis + bonus de combat)', 'Rapport §3.11 étape 4 : « Conservation plafonnée à 40 % pour un artisan » ; §3.1.', () => {
  assert.strictEqual(R.deriverArtisan({ niveau: 1, equipement: { conservation: { F: 60 } } }).conservation.F, 40);
  const B = Sp({ id: 'bo', element: 'N', cible: 'soi', touche: 'allies', parTour: 1, effets: [{ type: 'bonus', carac: 'conservation', valeur: 30, tours: 2, qui: 'soi' }] });
  const e = mk({ artisans: [{ id: 'a', niveau: 20, case: [0, 0], equipement: { conservation: { F: 60 } }, sorts: [B] }], monstres: [{ id: 'm', case: [3, 0], sorts: [FRAPPE(100)] }] });
  L(e, 'a', 'bo', [0, 0]); passer(e);
  const v0 = C(e, 'a').victuailles;
  L(e, 'm', 'x', [0, 0]);
  assert.strictEqual(v0 - C(e, 'a').victuailles, 60);
});
test('G6 Conservation d\'un monstre : −20 % → × 1,2 ; libre de −50 % à +100 % (−80 → −50, 150 → 100)', 'Rapport §3.1 : « libre pour les monstres (de −50 % à +100 %) » ; §3.11 étape 4 (négative = faiblesse).', () => {
  const e = mk({ artisans: [{ id: 'a', case: [0, 0], sorts: [FRAPPE(100)] }], monstres: [{ id: 'm1', case: [3, 0], conservation: { F: -20 } }, { id: 'm2', case: [0, 3], conservation: { F: -80 } }, { id: 'm3', case: [3, 3], conservation: { F: 150 } }] });
  L(e, 'a', 'x', [3, 0]); L(e, 'a', 'x', [0, 3]); L(e, 'a', 'x', [3, 3]);
  assert.deepStrictEqual(['m1', 'm2', 'm3'].map(id => 200 - C(e, id).victuailles), [120, 150, 0]);
});
test('G7 coup de maître : un sort (ou une pose) à 0 % n\'en fait jamais, même avec 100 % de Coup de maître', 'Rapport §3.11 : « Un sort à 0 % ne fait jamais de coup de maître. » Contrat §3 : maitre 0 à 25.', () => {
  const Z = Sp({ id: 'z0', cm: 1, cible: 'ennemi', maitre: 0, effets: [{ type: 'degats', element: 'F', min: 10, max: 10, maitre: [99, 99] }] });
  const F = Sp({ id: 'f0', cm: 1, cible: 'case', maitre: 0, effets: [{ type: 'pose', quoi: 'fournee', tours: 0, maitre: 0, effets: [{ type: 'degats', element: 'F', min: 10, max: 10, maitre: [99, 99] }] }] });
  const e = mk({ artisans: [{ id: 'a', case: [0, 0], equipement: { coupDeMaitre: 100, cm: 5 }, sorts: [Z, F] }], monstres: [{ id: 'm', case: [3, 0], victuailles: 5000 }, { id: 'n', case: [9, 9], victuailles: 5000 }] });
  assert.strictEqual(R.barre(e, 'a').find(b => b.id === 'z0').chanceMaitre, 0);
  for (let t = 0; t < 3; t++) {
    for (let i = 0; i < 5; i++) { const evs = L(e, 'a', 'z0', [3, 0]); assert.ok(!de(evs, 'lancer')[0].maitre); assert.strictEqual(de(evs, 'degats')[0].valeur, 10); }
    for (let i = 0; i < 5; i++) { const evs = L(e, 'a', 'f0', [3, 0]); assert.ok(de(evs, 'degats').every(d => d.valeur === 10 && !d.maitre)); }
    passer(e); passer(e); passer(e);
  }
});
test('G8 coup de maître : chance = taux du sort + Coup de maître du lanceur, plafonnée à 100 %', 'Rapport §3.11 : « Chance = taux du sort + Coup de maître du lanceur, plafonnée à 100 %. »', () => {
  const e = mk({ artisans: [{ id: 'a', case: [0, 0], equipement: { coupDeMaitre: 95 }, sorts: [Sp({ id: 'k', cm: 1, cible: 'ennemi', maitre: 10, effets: [{ type: 'degats', element: 'F', min: 10, max: 10, maitre: [30, 30] }] })] }], monstres: [{ id: 'm', case: [3, 0], victuailles: 5000 }] });
  assert.strictEqual(R.barre(e, 'a')[0].chanceMaitre, 100);
  for (let i = 0; i < 6; i++) assert.strictEqual(de(L(e, 'a', 'k', [3, 0]), 'degats')[0].valeur, 30);
});

// =====================================================================
// H. Mort, Commis, ordre de jeu (rapport §3.4, §3.18, §3.19)
// =====================================================================
test('H1 mort pendant son propre tour (piège) : le tour passe au suivant, puis il est sauté', 'Rapport §3.5 : « Le tour finit … quand il tombe » ; §3.4 : « Un combattant tombé est sauté. »', () => {
  const e = mk({ artisans: [{ id: 'a', case: [0, 0] }, { id: 'b', case: [11, 11] }], monstres: [{ id: 'm', case: [6, 6], sorts: [PIEGE([D(500, 'T')])] }] });
  passer(e); L(e, 'm', 'pg', [0, 1]); passer(e); passer(e);
  assert.strictEqual(R.actif(e).id, 'a');
  const evs = V(e, 'a', [0, 1]);
  assert.strictEqual(C(e, 'a').vivant, false);
  assert.strictEqual(e.phase, 'combat');
  assert.strictEqual(R.actif(e).id, 'm');
  assert.ok(de(evs, 'fin-tour').some(x => x.id === 'a') && de(evs, 'tour').some(x => x.id === 'm'));
  passer(e); passer(e);
  assert.deepStrictEqual([R.actif(e).id, e.manche], ['m', 3]);
});
test('H1b mort pendant son propre tour par un bond sur un piège ennemi : le tour passe au suivant, puis il est sauté', 'Rapport §3.5 et §3.4 (même règle que H1, par un chemin sans marche).', () => {
  const BOND = Sp({ id: 'b', element: 'N', cible: 'caseLibre', parTour: 1, effets: [{ type: 'bond' }] });
  const e = mk({ artisans: [{ id: 'a', case: [0, 0], sorts: [BOND] }, { id: 'b', case: [11, 11] }], monstres: [{ id: 'm', case: [4, 4], sorts: [PIEGE([D(500, 'T')])] }] });
  passer(e); L(e, 'm', 'pg', [2, 0]); passer(e); passer(e);
  const evs = L(e, 'a', 'b', [2, 0]);
  assert.strictEqual(C(e, 'a').vivant, false);
  assert.ok(de(evs, 'fin-tour').some(x => x.id === 'a'));
  assert.strictEqual(R.actif(e).id, 'm');
  passer(e); passer(e);
  assert.deepStrictEqual([R.actif(e).id, e.manche], ['m', 3]);
});
test('H2 mort au début de son tour (Brûlé) : son tour est sauté ; dernier artisan → défaite', 'Rapport §3.5 (effets « début de tour ») et §3.19.', () => {
  const BR = Sp({ id: 'br', element: 'F', cible: 'ennemi', parTour: 2, effets: [{ type: 'etat', etat: 'brule', tours: 2, couches: 1 }] });
  let e = mk({ artisans: [{ id: 'a', case: [0, 0] }, { id: 'b', case: [0, 5] }], monstres: [{ id: 'm', case: [6, 6], sorts: [BR] }] });
  passer(e); L(e, 'm', 'br', [0, 5]); C(e, 'b').victuailles = 3;
  const evs = passer(e);
  assert.strictEqual(C(e, 'b').vivant, false);
  assert.deepStrictEqual([R.actif(e).id, e.manche], ['a', 2]);
  assert.ok(de(evs, 'degats').some(d => d.cible === 'b' && d.etat === 'brule'));
  e = mk({ artisans: [{ id: 'a', case: [0, 0] }], monstres: [{ id: 'm', case: [6, 6], sorts: [BR] }] });
  passer(e); L(e, 'm', 'br', [0, 0]); C(e, 'a').victuailles = 3; passer(e);
  assert.deepStrictEqual([e.phase, e.resultat && e.resultat.vainqueur], ['fin', 'monstres']);
});
const RADIS = { nom: 'Radis', victuailles: 20, cm: 3, pas: 3, rideau: 3, fauxFuyant: 3, sorts: [Sp({ id: 'croque', element: 'T', cm: 2, cible: 'ennemi', parTour: 1, effets: [D(10, 'T')] })] };
test('H3 Commis : il tombe avec son artisan, et ce que l\'artisan a posé disparaît', 'Rapport §3.18 : « Il disparaît s\'il tombe ou si son artisan tombe. » §3.19 : « Ses Commis, ses nappes, ses pièges, ses fournées et ses Ustensiles disparaissent. »', () => {
  let e = mk({ artisans: [{ id: 'a', classe: 'legumancien', case: [0, 0], sorts: [INVOQUE(RADIS), PIEGE([D(5, 'T')])] }, { id: 'b', case: [11, 11] }], monstres: [{ id: 'm', case: [6, 6], sorts: [FRAPPE(500)] }] });
  L(e, 'a', 'inv', [1, 0]); L(e, 'a', 'pg', [3, 3]);
  const k = e.combattants.find(c => c.genre === 'commis');
  jusqua(e, 'm');
  const evs = L(e, 'm', 'x', [0, 0]);
  assert.ok(de(evs, 'tombe').some(x => x.id === k.id), 'le Commis doit tomber');
  assert.strictEqual(e.sol.length, 0, 'le piège doit disparaître');
});
test('H3b Commis : son artisan tombe pendant son propre tour (piège) → le Commis tombe et son tour est sauté', 'Rapport §3.18 et §3.19 ; §3.4 : « Un combattant tombé est sauté. »', () => {
  const e = mk({ artisans: [{ id: 'a', classe: 'legumancien', case: [0, 0], sorts: [INVOQUE(RADIS)] }, { id: 'b', case: [11, 11] }], monstres: [{ id: 'm', case: [6, 6], sorts: [PIEGE([D(500, 'T')])] }] });
  L(e, 'a', 'inv', [2, 0]); jusqua(e, 'm'); L(e, 'm', 'pg', [0, 1]); jusqua(e, 'a');
  V(e, 'a', [0, 1]);
  assert.strictEqual(e.combattants.find(c => c.genre === 'commis').vivant, false);
  assert.strictEqual(R.actif(e).id, 'm');
});
test('H4 Commis : joue juste après son artisan ; Victuailles et dégâts × (1 + niveau / 120)', 'Rapport §3.4 : « Un Commis s\'insère juste après son artisan. » §3.18 : « Ses Victuailles et ses dégâts sont multipliés par (1 + niveau de l\'artisan / 120). »', () => {
  const inv = INVOQUE(RADIS, { niveau: 20 });
  const e = mk({ artisans: [{ id: 'a', classe: 'legumancien', niveau: 60, case: [0, 0], sorts: [inv] }], monstres: [{ id: 'm', case: [3, 0] }] });
  const iv = de(L(e, 'a', 'inv', [1, 0]), 'invoque')[0];
  assert.strictEqual(iv.victuailles, 30);
  assert.deepStrictEqual(e.frise, ['a', iv.id, 'm']);
  passer(e);
  assert.strictEqual(R.actif(e).id, iv.id);
  assert.strictEqual(de(L(e, iv.id, 'croque', [3, 0]), 'degats')[0].valeur, 15);
});
test('H5 Commis : plafond (1 au départ) → « Plus de place pour un Commis », sans rien changer', 'Rapport §3.18 : « autant de Commis en même temps que sa caractéristique Commis (1 au départ, 5 au plus) ».', () => {
  const e = mk({ artisans: [{ id: 'a', classe: 'legumancien', case: [0, 0], sorts: [INVOQUE(RADIS)] }], monstres: [{ id: 'm', case: [5, 5] }] });
  L(e, 'a', 'inv', [1, 0]);
  refusIntact(e, () => R.lancer(e, 'a', 'inv', [0, 1]), 'Plus de place pour un Commis');
});
test('H6 ordre alterné : quand un camp n\'a plus personne à faire jouer, l\'autre enchaîne', 'Rapport §3.4 : « Puis on alterne … Quand un camp n\'a plus personne à faire jouer, l\'autre enchaîne. »', () => {
  let e = mk({ artisans: [{ id: 'a1', case: [0, 0] }, { id: 'a2', case: [1, 0] }, { id: 'a3', case: [2, 0] }], monstres: [{ id: 'm', case: [9, 9], ouverture: 200 }] });
  assert.deepStrictEqual(e.frise, ['m', 'a1', 'a2', 'a3']);
  e = mk({ artisans: [{ id: 'a1', case: [0, 0] }, { id: 'a2', case: [1, 0] }], monstres: [{ id: 'm1', case: [9, 9], ouverture: 150 }, { id: 'm2', case: [8, 9], ouverture: 150 }, { id: 'm3', case: [7, 9], ouverture: 150 }] });
  assert.deepStrictEqual(e.frise, ['m1', 'a1', 'm2', 'a2', 'm3']);
});
test('H7 robustesse : un combat dont un camp est vide (aucun monstre) ne doit pas commencer', 'Rapport §3.19 : « Un camp perd quand tous ses combattants sont tombés » ; §3.20 : l\'Addition suppose des monstres. (Le contrat ne dit rien d\'un camp vide au départ.)', () => {
  const e = R.creerCombat({ carte: { lignes: grille(5, 5), departs: [{ artisans: [], monstres: [] }] }, artisans: [{ id: 'a', classe: 'levainqueur', case: [0, 0] }], monstres: [], options: { commande: 'aucune' } });
  const r = R.commencer(e);
  assert.strictEqual(r.ok, false, 'commencer accepte et donne : ' + de(r.evenements || [], 'fin').map(f => 'victoire des ' + f.vainqueur + ' à la manche ' + f.manche).join(''));
});

// =====================================================================
// I. Au sol : fournées, Ustensiles, pièges, graines ; ce que voit chaque camp (rapport §3.17)
// =====================================================================
test('I1 Petite fournée (1 tour) : éclate au début du PROCHAIN tour de son poseur, pas avant, et pas sur l\'allié', 'Rapport §3.17 : « Fournée … elle éclate au début du tour de son poseur, après N tours, dans sa zone. » Décision 2.', () => {
  const e = mk({ artisans: [{ id: 'a', case: [5, 8], sorts: [sortEssai('levainqueur.petite-fournee')] }, { id: 'b', case: [6, 5] }], monstres: [{ id: 'm', case: [5, 4] }] });
  assert.strictEqual(de(L(e, 'a', 'levainqueur.petite-fournee', [5, 5]), 'degats').length, 0);
  assert.strictEqual(de(passer(e), 'degats').length, 0, 'au tour du monstre');
  assert.strictEqual(de(passer(e), 'degats').length, 0, 'au tour de l\'allié');
  const evs = passer(e);
  assert.strictEqual(R.actif(e).id, 'a');
  assert.ok(de(evs, 'degats').some(d => d.cible === 'm'));
  assert.strictEqual(C(e, 'b').victuailles, 95);
  assert.strictEqual(e.sol.length, 0);
});
test('I2 Four à pain (2 tours) : cuit 1 tour, éclate au 2e ; pendant ce temps il bloque la marche et la vue', 'Rapport §3.17 (fournée, Ustensile : « Il bloque les Pas et la vue ») ; rapport §4 exemple 2.', () => {
  const VUE = Sp({ id: 'mv', vue: true, cible: 'ennemi', rayon: { min: 1, max: 8, modifiable: false }, parTour: 3, effets: [D(1)] });
  const e = mk({ artisans: [{ id: 'a', niveau: 57, case: [5, 5], sorts: [sortEssai('levainqueur.four-a-pain')] }], monstres: [{ id: 'm', case: [5, 2], sorts: [VUE] }] });
  const evs0 = L(e, 'a', 'levainqueur.four-a-pain', [5, 3]);
  assert.ok(de(evs0, 'pose')[0].entite, 'le four occupe sa case');
  passer(e);
  refusIntact(e, () => R.lancer(e, 'm', 'mv', [5, 5]), 'Pas de vue');
  refusIntact(e, () => R.deplacer(e, 'm', [5, 4]));
  let evs = passer(e);
  assert.strictEqual(de(evs, 'cuisson').length, 1); assert.strictEqual(de(evs, 'degats').length, 0);
  passer(e); evs = passer(e);
  assert.ok(de(evs, 'degats').some(d => d.cible === 'm'), 'le four doit éclater au 2e tour');
  assert.strictEqual(e.sol.length, 0);
});
test('I3 Four à pain cassé avant la fin de sa cuisson : il n\'éclate pas', 'Rapport §3.17 : « Un four à pain cassé avant la fin de sa cuisson n\'éclate pas. »', () => {
  const e = mk({ artisans: [{ id: 'a', niveau: 57, case: [5, 5], sorts: [sortEssai('levainqueur.four-a-pain')] }], monstres: [{ id: 'm', case: [5, 2], sorts: [FRAPPE(100, { cible: 'combattant' })] }] });
  L(e, 'a', 'levainqueur.four-a-pain', [5, 3]); passer(e);
  const evs = L(e, 'm', 'x', [5, 3]);
  assert.ok(de(evs, 'disparait').some(d => d.raison === 'casse'));
  let tout = passer(e).concat(passer(e), passer(e), passer(e));
  assert.ok(!de(tout, 'declenchement').length && C(e, 'm').victuailles === 200);
});
test('I4 piège caché : absent de la vue de l\'ennemi, sans effet sur ses aperçus, il se déclenche quand il y entre et l\'arrête', 'Rapport §3.17 : « Piège (caché à l\'ennemi, visible pour ton camp) … Il se déclenche quand un ennemi y entre … Il arrête son déplacement. »', () => {
  const e = mk({ artisans: [{ id: 'a', classe: 'traitreur', case: [5, 8], sorts: [sortEssai('traitreur.amuse-bouche')] }], monstres: [{ id: 'm', case: [5, 2] }] });
  const sansPiege = JSON.stringify(R.deplacementsPossibles(e, 'm'));
  const evs = L(e, 'a', 'traitreur.amuse-bouche', [5, 4]);
  assert.strictEqual(de(evs, 'pose')[0].cache, true);
  assert.strictEqual(R.vuePour(e, 'monstres').sol.length, 0);
  assert.strictEqual(R.vuePour(e, 'artisans').sol.length, 1);
  assert.strictEqual(JSON.stringify(R.deplacementsPossibles(e, 'm')), sansPiege);
  passer(e);
  const ap = R.apercuDeplacement(e, 'm', [5, 5]);
  assert.ok(ap.ok && ap.chemin.length === 4, 'l\'aperçu du monstre ignore le piège');
  const ev2 = V(e, 'm', [5, 5]);
  assert.deepStrictEqual(C(e, 'm').case, [5, 4]);
  assert.ok(de(ev2, 'declenchement').length === 1 && C(e, 'm').victuailles < 200);
});
test('I5 piège : pas sur un autre piège de son camp ; l\'ennemi n\'en apprend rien en essayant de poser le sien', 'Rapport §3.17 : « Pas sur une case occupée ni sur un autre piège. » (et caché à l\'ennemi)', () => {
  const e = mk({ artisans: [{ id: 'a', case: [5, 8], sorts: [PIEGE([D(5, 'T')])] }], monstres: [{ id: 'm', case: [5, 2], sorts: [PIEGE([D(5, 'T')], { id: 'mp' })] }] });
  L(e, 'a', 'pg', [5, 5]);
  refusIntact(e, () => R.lancer(e, 'a', 'pg', [5, 5]), 'Il y a déjà un piège ici');
  refusIntact(e, () => R.lancer(e, 'a', 'pg', [5, 2]), 'Il faut viser une case libre');
  passer(e);
  const r = R.lancer(e, 'm', 'mp', [5, 5]);
  assert.notStrictEqual(r.raison, 'Il y a déjà un piège ici', 'fuite : le refus révèle le piège caché');
});
test('I6 pose (piège, graine) sur une case occupée : refusée AVANT de payer, même si le sort vise « case »', 'Rapport §3.17 : piège « Pas sur une case occupée » ; contrat : un refus renvoie une raison et ne change rien (API §2).', () => {
  ['piege', 'graine'].forEach(quoi => {
    const S = Sp({ id: 'po', element: 'T', cible: 'case', parTour: 2, effets: [{ type: 'pose', quoi, tours: 1, effets: [D(5, 'T')], commis: RADIS }] });
    const e = mk({ artisans: [{ id: 'a', classe: 'legumancien', case: [0, 0], sorts: [S] }], monstres: [{ id: 'm', case: [3, 0] }] });
    const avant = geler(e), r = R.lancer(e, 'a', 'po', [3, 0]);
    assert.ok(!r.ok && geler(e) === avant, quoi + ' sur une case occupée : accepté (ok: ' + r.ok + '), ' + C(e, 'a').cm + ' CM restants, rien posé (' + e.sol.length + ' objet), événement « ' + (r.evenements || []).map(x => x.type).join(', ') + ' »');
  });
});
test('I7 graine : sur sa case occupée au moment de germer, elle attend ; elle germe quand la case se libère', 'Rapport §3.17 : « Graine : elle devient un Commis au début du prochain tour du poseur, si la case est libre ; sinon elle attend. »', () => {
  const GR = Sp({ id: 'gr', element: 'T', cible: 'caseLibre', rayon: { min: 1, max: 2, modifiable: false }, parTour: 1, effets: [{ type: 'pose', quoi: 'graine', tours: 1, commis: { nom: 'Radis', victuailles: 20, cm: 3, pas: 3, sorts: [] } }] });
  const e = mk({ artisans: [{ id: 'a', classe: 'legumancien', case: [0, 0], sorts: [GR] }], monstres: [{ id: 'm', case: [3, 0] }] });
  L(e, 'a', 'gr', [1, 0]); passer(e);
  V(e, 'm', [1, 0]);
  let evs = passer(e);
  assert.strictEqual(de(evs, 'invoque').length, 0, 'case occupée : elle attend');
  assert.strictEqual(e.sol.length, 1);
  passer(e); V(e, 'm', [2, 0]);
  evs = passer(e);
  assert.ok(de(evs, 'invoque').some(x => eq(x.case, [1, 0])), 'case libérée : elle germe');
});
test('I8 vuePour : un ennemi Dérobé ne laisse sa case nulle part dans la vue envoyée à l\'autre camp', 'Rapport §3.16 : « Dérobé : invisible pour l\'ennemi ». API : vuePour est « à utiliser pour dessiner et pour tout envoi au client d\'un joueur ».', () => {
  const DER = Sp({ id: 'der', element: 'C', cible: 'soi', touche: 'allies', parTour: 1, effets: [{ type: 'etat', etat: 'derobe', tours: 2 }] });
  const e = mk({ artisans: [{ id: 'a', case: [0, 0] }], monstres: [{ id: 'm', case: [6, 7], sorts: [DER] }] });
  passer(e); L(e, 'm', 'der', [6, 7]); passer(e);
  const vue = R.vuePour(e, 'artisans'), vu = vue.combattants.find(c => c.id === 'm');
  assert.strictEqual(vu.case, null);
  const fuites = [];
  (function chercher(o, chemin) {
    if (Array.isArray(o) && o.length === 2 && o[0] === 6 && o[1] === 7) { fuites.push(chemin); return; }
    if (o && typeof o === 'object') for (const k in o) chercher(o[k], chemin + '.' + k);
  })(vue, 'vue');
  assert.deepStrictEqual(fuites, [], 'la case [6,7] du Dérobé se lit dans ' + fuites.join(', '));
});
test('I9 nappe « entrée » : une seule fois par tour et par combattant, même en ressortant puis rentrant', 'Rapport §3.17 : « Elle agit sur qui … y entre … une fois par tour et par combattant. »', () => {
  const NA = Sp({ id: 'na', element: 'F', cible: 'case', parTour: 1, effets: [{ type: 'pose', quoi: 'nappe', tours: 2, declenche: 'entree', zone: { forme: 'case' }, touche: 'ennemis', effets: [D(10)] }] });
  const e = mk({ artisans: [{ id: 'a', case: [0, 0], sorts: [NA] }], monstres: [{ id: 'm', case: [5, 4], fauxFuyant: 50 }] });
  L(e, 'a', 'na', [5, 5]); passer(e);
  V(e, 'm', [5, 5]); V(e, 'm', [5, 4]); V(e, 'm', [5, 5]);
  assert.strictEqual(C(e, 'm').victuailles, 190);
});

// =====================================================================
// J. Commandes et Addition (rapport §3.20, §3.21)
// =====================================================================
const REF_CMD = 'Rapport §3.21 : « Tous les artisans doivent la respecter. Un manquement l\'annule pour tout le camp (elle passe en rayé). »';
const rompue = (e, id) => { assert.strictEqual(e.commande.choisie, id); assert.strictEqual(e.commande.respectee, false, id + ' devait être rompue'); };
test('J1 Commande « Une seule cuisson » : rompue au 2e lancer du même sort dans un tour', REF_CMD, () => {
  const e = mk({ options: { commande: 'une-seule-cuisson' }, artisans: [{ id: 'a', case: [0, 0], sorts: [FRAPPE(1)] }], monstres: [{ id: 'm', case: [3, 0] }] });
  L(e, 'a', 'x', [3, 0]); assert.strictEqual(e.commande.respectee, true);
  const evs = L(e, 'a', 'x', [3, 0]);
  rompue(e, 'une-seule-cuisson'); assert.strictEqual(de(evs, 'commande')[0].respectee, false);
});
test('J2 Commande « Sans contact » : rompue en finissant son tour à côté d\'un ennemi', REF_CMD, () => {
  const e = mk({ options: { commande: 'sans-contact' }, artisans: [{ id: 'a', case: [0, 0] }], monstres: [{ id: 'm', case: [2, 0] }] });
  V(e, 'a', [1, 0]); assert.strictEqual(e.commande.respectee, true);
  passer(e); rompue(e, 'sans-contact');
});
test('J3 Commande « Sur le plan de travail » : 1 Pas par tour permis, le 2e la rompt', REF_CMD, () => {
  const e = mk({ options: { commande: 'plan-de-travail' }, artisans: [{ id: 'a', case: [0, 0] }], monstres: [{ id: 'm', case: [9, 9] }] });
  V(e, 'a', [0, 1]); assert.strictEqual(e.commande.respectee, true);
  V(e, 'a', [0, 2]); rompue(e, 'plan-de-travail');
});
test('J4 Commande « Service en salle » : rompue en commençant deux tours de suite sur la même case', REF_CMD, () => {
  let e = mk({ options: { commande: 'service-en-salle' }, artisans: [{ id: 'a', case: [0, 0] }], monstres: [{ id: 'm', case: [9, 9] }] });
  V(e, 'a', [0, 1]); passer(e); passer(e); assert.strictEqual(e.commande.respectee, true);
  passer(e); passer(e); rompue(e, 'service-en-salle');
});
test('J5 Commande « Fait minute » : rompue à la 6e manche', REF_CMD + ' « Fait minute : gagner avant la fin de la 5e manche ».', () => {
  const e = mk({ options: { commande: 'fait-minute' }, artisans: [{ id: 'a', case: [0, 0] }], monstres: [{ id: 'm', case: [9, 9] }] });
  while (e.manche < 5) passer(e);
  assert.strictEqual(e.commande.respectee, true);
  while (e.manche < 6) passer(e);
  rompue(e, 'fait-minute');
});
test('J6 Commande « Sans sel » : le Pain de route la rompt ; un Pain refusé non', REF_CMD + ' « Sans sel : aucun soin de tout le combat ».', () => {
  const e = mk({ options: { commande: 'sans-sel' }, artisans: [{ id: 'a', case: [0, 0] }], monstres: [{ id: 'm', case: [9, 9] }] });
  R.utiliserPainDeRoute(e, 'a'); assert.strictEqual(e.commande.respectee, true);
  C(e, 'a').victuailles = 50; R.utiliserPainDeRoute(e, 'a'); rompue(e, 'sans-sel');
});
test('J7 Commande « Fait main » : tenue si l\'ennemi tombe sous un Coup d\'outil, rompue sinon', REF_CMD + ' « Fait main : chaque ennemi tombe sous un Coup d\'outil ».', () => {
  let e = mk({ options: { commande: 'fait-main' }, artisans: [{ id: 'a', case: [0, 5], sorts: [O.pour('levainqueur')] }], monstres: [{ id: 'm', case: [1, 5], victuailles: 5 }] });
  L(e, 'a', 'levainqueur.coup-d-outil', [1, 5]);
  assert.strictEqual(e.phase, 'fin'); assert.strictEqual(e.resultat.addition.commande.respectee, true);
  e = mk({ options: { commande: 'fait-main' }, artisans: [{ id: 'a', case: [0, 5], sorts: [FRAPPE(50)] }], monstres: [{ id: 'm', case: [1, 5], victuailles: 5 }] });
  L(e, 'a', 'x', [1, 5]); rompue(e, 'fait-main');
});
test('J8 Commande « À la chaîne » : rompue si les ennemis ne tombent pas dans l\'ordre indiqué', REF_CMD, () => {
  const e = mk({ options: { commande: 'a-la-chaine' }, artisans: [{ id: 'a', case: [0, 0], sorts: [FRAPPE(50)] }], monstres: [{ id: 'm1', case: [3, 0], victuailles: 5 }, { id: 'm2', case: [0, 3], victuailles: 5 }] });
  const [p, s] = e.commande.ordre;
  L(e, 'a', 'x', C(e, s).case); rompue(e, 'a-la-chaine');
  const e2 = mk({ options: { commande: 'a-la-chaine' }, artisans: [{ id: 'a', case: [0, 0], sorts: [FRAPPE(50)] }], monstres: [{ id: 'm1', case: [3, 0], victuailles: 5 }, { id: 'm2', case: [0, 3], victuailles: 5 }] });
  e2.commande.ordre.forEach(id => L(e2, 'a', 'x', C(e2, id).case));
  assert.strictEqual(e2.resultat.addition.commande.respectee, true);
});
test('J9 Addition : XP × coefficient de groupe × part du joueur ; Blé partagé (2 artisans 6 et 4, 60 XP, 9 Blé)', 'Rapport §3.20 : coefficient 2 → 1,15 ; part = niveau / somme des niveaux ; Blé partagé à parts égales.', () => {
  const Z = Sp({ id: 'z', cible: 'case', parTour: 2, zone: { forme: 'rond', taille: 2 }, effets: [D(50)] });
  const e = mk({ artisans: [{ id: 'a1', niveau: 6, case: [0, 0], sorts: [Z] }, { id: 'a2', niveau: 4, case: [0, 1] }], monstres: [{ id: 'g', niveau: 2, xp: 25, ble: 4, victuailles: 1, case: [5, 5] }, { id: 'mt', niveau: 3, xp: 35, ble: 5, victuailles: 1, case: [5, 6] }] });
  L(e, 'a1', 'z', [5, 5]);
  const ad = e.resultat.addition;
  assert.deepStrictEqual([ad.xp.a1, ad.xp.a2], [41, 27]);
  assert.strictEqual(ad.ble.a1 + ad.ble.a2, 9); assert.ok(Math.abs(ad.ble.a1 - ad.ble.a2) <= 1);
});
test('J10 Addition : écart de niveau −5 % par niveau au-delà de 10, 20 % au minimum', 'Rapport §3.20 : « si le plus fort monstre a plus de 10 niveaux de moins que le joueur, −5 % par niveau au-delà, 20 % au minimum ».', () => {
  [[20, 39], [40, 12], [13, 60]].forEach(([niv, xp]) => {
    const e = mk({ artisans: [{ id: 'a', niveau: niv, case: [0, 0], sorts: [FRAPPE(50)] }], monstres: [{ id: 'm', niveau: 3, xp: 60, victuailles: 1, case: [3, 0] }] });
    L(e, 'a', 'x', [3, 0]);
    assert.strictEqual(e.resultat.addition.xp.a, xp, 'niveau ' + niv);
  });
});
test('J11 Addition : défaite = moitié de l\'XP des monstres tombés, ni Blé ni objet', 'Rapport §3.20 : « Défaite : … la moitié de l\'XP des monstres tombés, aucun objet. »', () => {
  const e = mk({ artisans: [{ id: 'a', case: [0, 0], sorts: [FRAPPE(5)] }], monstres: [{ id: 'm1', xp: 25, victuailles: 1, case: [3, 0], objets: [{ id: 'o', taux: 100 }] }, { id: 'm2', xp: 35, case: [0, 3], sorts: [FRAPPE(500)] }] });
  L(e, 'a', 'x', [3, 0]); passer(e);
  L(e, 'm2', 'x', [0, 0]);
  const ad = e.resultat.addition;
  assert.deepStrictEqual([e.resultat.vainqueur, ad.xp.a, ad.ble.a, ad.objets.a.length], ['monstres', 12, 0, 0]);
});
test('J12 Addition : bonus de Commande en Savoir-faire (XP), pas en Ristourne, et rien si la Commande est rompue', 'Rapport §3.20 : XP × (1 + bonus de Commande) ; §3.21 : chaque artisan choisit Savoir-faire OU Ristourne.', () => {
  const run = (choix, rompre) => {
    const e = mk({ commencer: false, options: { commande: 'sans-sel' }, artisans: [{ id: 'a', case: [0, 0], sorts: [FRAPPE(50)] }], monstres: [{ id: 'm', xp: 100, victuailles: 1, case: [3, 0] }] });
    R.choisirBonusCommande(e, 'a', choix); R.commencer(e);
    if (rompre) { C(e, 'a').victuailles = 50; R.utiliserPainDeRoute(e, 'a'); }
    L(e, 'a', 'x', [3, 0]);
    return e.resultat.addition.xp.a;
  };
  const bonus = 30;
  assert.deepStrictEqual([run('savoirFaire'), run('ristourne'), run('savoirFaire', true)], [100 + bonus, 100, 100]);
});
test('J13 Addition : objets tirés avec taux × (100 + Ristourne) / 100, artisans servis par Ristourne décroissante', 'Rapport §3.20 : « Taux réel = taux × (100 + Ristourne) / 100. On tire objet par objet, et les artisans sont servis dans l\'ordre de Ristourne décroissante. »', () => {
  const e = mk({ artisans: [{ id: 'a1', case: [0, 0], sorts: [FRAPPE(50)] }, { id: 'a2', case: [0, 1], equipement: { ristourne: 50 } }], monstres: [{ id: 'm', case: [3, 0], victuailles: 1, ble: 3, objets: [{ id: 'sur', taux: 100 }, { id: 'jamais', taux: 0 }] }] });
  L(e, 'a1', 'x', [3, 0]);
  const ad = e.resultat.addition;
  assert.deepStrictEqual([ad.objets.a2.map(o => o.id), ad.objets.a1.length, ad.ble.a2, ad.ble.a1], [['sur'], 0, 2, 1]);
});

// =====================================================================
// K. Refus, entrées invalides, déterminisme, sérialisation, Minuteur, fiches, états
// =====================================================================
test('K1 refus : chaque action refusée renvoie sa raison et ne change rien à l\'état (octet par octet)', 'API §2 / contrat : « une action refusée renvoie { ok: false, raison } et ne touche pas à l\'état ».', () => {
  const v = Sp({ id: 'v', vue: true, cible: 'ennemi', lancer: 'ligne', rayon: { min: 1, max: 3, modifiable: false }, parTour: 1, effets: [D(1)] });
  const big = Sp({ id: 'big', cm: 7, niveau: 1, cible: 'ennemi', parTour: 1, effets: [D(1)] });
  const rl = FRAPPE(1, { id: 'rl', relance: 2 });
  const soi = Sp({ id: 'soi', element: 'N', cible: 'soi', touche: 'allies', effets: [{ type: 'bonus', carac: 'levure', valeur: 5, tours: 1, qui: 'soi' }] });
  const e = mk({ lignes: avec(grille(12, 12), 5, 4, '#'), artisans: [{ id: 'a', case: [5, 5], sorts: [v, big, rl, soi] }], monstres: [{ id: 'm', case: [5, 3] }, { id: 'n', case: [7, 7] }, { id: 'o', case: [5, 9] }] });
  L(e, 'a', 'rl', [5, 9]);
  refusIntact(e, () => R.lancer(e, 'a', 'v', [5, 9]), 'Hors du Rayon');
  refusIntact(e, () => R.lancer(e, 'a', 'big', [5, 3]), 'Pas assez de coups de main (7 CM)');
  refusIntact(e, () => R.lancer(e, 'a', 'rl', [5, 9]), 'Revient dans 2 tours');
  refusIntact(e, () => R.lancer(e, 'a', 'v', [5, 3]), 'Pas de vue');
  refusIntact(e, () => R.lancer(e, 'a', 'v', [6, 6]), 'Il faut lancer en ligne');
  refusIntact(e, () => R.lancer(e, 'a', 'v', [5, 6]), 'Il faut viser un ennemi');
  refusIntact(e, () => R.lancer(e, 'a', 'soi', [5, 6]), 'Ce sort se lance sur soi');
  refusIntact(e, () => R.lancer(e, 'a', 'v', [5, -1]), 'Case hors du terrain');
  refusIntact(e, () => R.lancer(e, 'a', 'zzz', [5, 3]), 'Ce sort n\'est pas dans le grimoire de a');
  refusIntact(e, () => R.deplacer(e, 'a', [5, 4]), 'On ne marche pas là');
  refusIntact(e, () => R.deplacer(e, 'a', [5, 5]), 'Déjà sur cette case');
  refusIntact(e, () => R.deplacer(e, 'a', [9, 9]), 'Case hors d\'atteinte');
  refusIntact(e, () => R.deplacer(e, 'a', 'x'), 'Case invalide');
  refusIntact(e, () => R.utiliserPainDeRoute(e, 'a'), 'Victuailles déjà pleines');
  refusIntact(e, () => R.finDuTour(e, 'm'), 'Ce n\'est pas le tour de m');
  refusIntact(e, () => R.iaJoue(e, 'm'), 'Ce n\'est pas le tour de m');
  refusIntact(e, () => R.placer(e, 'a', [0, 0]), 'La Mise en place est finie');
  refusIntact(e, () => R.choisirCommande(e, null));
  refusIntact(e, () => R.abandonner(e, 'm'), 'Seul un artisan peut abandonner');
  refusIntact(e, () => R.utiliserPainDeRoute(e, 'm'));
  refusIntact(e, () => R.lancer(e, 'zz', 'v', [5, 3]), 'Combattant inconnu');
  L(e, 'a', 'soi');
});
test('K2 aperçus et lectures : ne tirent pas au hasard et ne changent rien (graine comprise)', 'API §2 : « Les aperçus (apercuSort, casesVisables, deplacementsPossibles…) ne tirent jamais au hasard et ne changent rien. »', () => {
  const S = Sp({ id: 's', cible: 'ennemi', maitre: 20, parTour: 2, effets: [{ type: 'degats', element: 'F', min: 5, max: 15, maitre: [10, 20] }, { type: 'pousse', cases: 2 }] });
  const F = Sp({ id: 'f', cible: 'case', maitre: 0, effets: [{ type: 'pose', quoi: 'fournee', tours: 0, maitre: 15, zone: { forme: 'rond', taille: 1 }, effets: [{ type: 'degats', element: 'F', min: 5, max: 15, maitre: [10, 20] }] }] });
  const e = mk({ artisans: [{ id: 'a', case: [4, 5], sorts: [S, F] }], monstres: [{ id: 'm', case: [5, 5] }, { id: 'n', case: [4, 6] }] });
  const avant = geler(e);
  R.apercuSort(e, 'a', 's', [5, 5]); R.apercuSort(e, 'a', 'f', [5, 4]); R.casesVisables(e, 'a', 's'); R.barre(e, 'a');
  R.deplacementsPossibles(e, 'a'); R.deplacementsPossibles(e, 'm'); R.apercuDeplacement(e, 'a', [3, 5]); R.apercuRideau(e, 'a');
  R.vuePour(e, 'monstres'); R.resultat(e); R.verifierSort(S); R.ligneDeVue(e, [0, 0], [9, 9]);
  assert.strictEqual(geler(e), avant);
});
test('K3 entrées invalides : une case non entière ou non numérique est refusée (bond, sort, pose)', 'API §2 : cases toujours [x, y] sur la grille ; contrat : un refus ne change rien. (Robustesse : une case [2.5, 0] n\'existe pas.)', () => {
  const BOND = Sp({ id: 'b', element: 'N', cible: 'caseLibre', parTour: 3, effets: [{ type: 'bond' }] });
  const Z = Sp({ id: 'z', cible: 'case', parTour: 3, zone: { forme: 'rond', taille: 1 }, effets: [D(10)] });
  const essais = [['b', [2.5, 0]], ['b', ['2', '0']], ['z', [5.5, 5]], ['pg', [3.5, 3]]];
  const acceptes = [];
  essais.forEach(([s, cs]) => {
    const e = mk({ artisans: [{ id: 'a', case: [0, 0], sorts: [BOND, Z, PIEGE([D(5, 'T')])] }], monstres: [{ id: 'm', case: [5, 5] }] });
    const avant = geler(e), r = R.lancer(e, 'a', s, cs);
    if (r.ok || geler(e) !== avant) acceptes.push(s + ' sur ' + JSON.stringify(cs) + ' → ' + (r.ok ? 'accepté' : 'refusé mais état changé') + ' (case de a : ' + JSON.stringify(C(e, 'a').case) + ', CM ' + C(e, 'a').cm + '/6, dégâts ' + de(r.evenements || [], 'degats').length + ', sol ' + JSON.stringify(e.sol.map(o => o.case)) + ')');
  });
  assert.deepStrictEqual(acceptes, []);
});
function combatComplet(graine, couper) {
  const sorts = ESSAI.filter(s => s.classe === 'levainqueur' && !s.declinaisonDe && s.niveau <= 6).concat([O.pour('levainqueur')]);
  let e = R.creerCombat({ carte: M.carte('fourneau'), graine, artisans: [{ id: 'moi', classe: 'levainqueur', niveau: 6, affinites: { F: 12, T: 13 }, sorts }], monstres: M.groupe('fourneau', 'le-chef'), options: { depart: 0, commande: 'aucune' } });
  R.iaPlace(e, 'moi');
  const evs = [R.commencer(e).evenements];
  for (let i = 0; i < 300 && e.phase === 'combat'; i++) {
    if (couper === i) e = JSON.parse(JSON.stringify(e));
    evs.push(R.iaJoue(e, R.actif(e).id).evenements);
  }
  return { e, evs: JSON.stringify(evs) };
}
test('K4 déterminisme : même graine et mêmes actions = même combat (état et événements) ; graines différentes = combats différents', 'API §2 : « Même graine et mêmes actions = même combat. »', () => {
  const a = combatComplet(77), b = combatComplet(77);
  assert.strictEqual(a.e.phase, 'fin');
  assert.strictEqual(geler(a.e), geler(b.e)); assert.strictEqual(a.evs, b.evs);
  const vus = new Set([1, 2, 3, 4, 5].map(g => combatComplet(g).evs));
  assert.ok(vus.size > 1);
});
test('K5 sérialisation : JSON.parse(JSON.stringify(état)) à chaque tour d\'un combat complet donne le même combat', 'API §2 : « On peut le sauver avec JSON.stringify, le reprendre avec JSON.parse et continuer : le résultat est identique. »', () => {
  const ref = combatComplet(31);
  for (const k of [0, 3, 7, 12]) { const c = combatComplet(31, k); assert.strictEqual(geler(c.e), geler(ref.e), 'coupé au tour ' + k); assert.strictEqual(c.evs, ref.evs, 'coupé au tour ' + k); }
});
test('K6 sérialisation en plein milieu : fournées, Four à pain, piège, graine, états, boucliers, relances, Commis, Marée', 'API §2 (état JSON) ; contrat §3 (toutes les briques).', () => {
  const GR = Sp({ id: 'gr', element: 'T', cible: 'caseLibre', rayon: { min: 1, max: 2, modifiable: false }, parTour: 1, relance: 3, effets: [{ type: 'pose', quoi: 'graine', tours: 1, commis: RADIS }] });
  const GL = sortEssai('patissorcier.glacage');
  const construire = () => {
    const e = mk({ graine: 9, artisans: [
      { id: 'b', niveau: 57, case: [5, 10], sorts: [sortEssai('levainqueur.four-a-pain'), sortEssai('levainqueur.petite-fournee'), sortEssai('levainqueur.mie-raille'), O.pour('levainqueur')] },
      { id: 't', classe: 'traitreur', case: [3, 10], sorts: [sortEssai('traitreur.amuse-bouche'), O.pour('traitreur')] },
      { id: 'l', classe: 'legumancien', case: [7, 10], sorts: [GR, O.pour('legumancien')] },
      { id: 'p', classe: 'merlanceur', case: [1, 10], sorts: [O.pour('merlanceur'), GL] }],
      monstres: [M.fiche('grumeau-chef'), M.fiche('mie-tron'), M.fiche('grumeau')].map((f, i) => Object.assign(f, { id: f.id, case: [[5, 7], [4, 2], [7, 4]][i] })) });
    jusqua(e, 'b'); L(e, 'b', 'levainqueur.mie-raille', [5, 7]); L(e, 'b', 'levainqueur.four-a-pain', [5, 8]); jusqua(e, 't');
    L(e, 't', 'traitreur.amuse-bouche', [4, 8]); jusqua(e, 'l'); L(e, 'l', 'gr', [7, 8]); jusqua(e, 'p'); L(e, 'p', 'patissorcier.glacage', [3, 10]);
    jusqua(e, 'b'); L(e, 'b', 'levainqueur.petite-fournee', [6, 7]);
    return e;
  };
  const fin = e => { const evs = []; for (let i = 0; i < 400 && e.phase === 'combat'; i++) evs.push(R.iaJoue(e, R.actif(e).id).evenements); return JSON.stringify(evs); };
  const e1 = construire(), e2 = JSON.parse(JSON.stringify(construire()));
  assert.ok(e1.sol.length >= 3, 'objets au sol en attente : ' + e1.sol.map(o => o.quoi).join(', '));
  const f1 = fin(e1), f2 = fin(e2);
  assert.strictEqual(f1, f2); assert.strictEqual(geler(e1), geler(e2));
});
test('K7 état : ni NaN, ni Infinity, ni undefined, ni −0, ni fonction (sinon JSON les change)', 'API §2 : « Tout l\'état d\'un combat est un objet JSON simple. »', () => {
  const pb = [];
  const scan = (o, ch) => {
    if (typeof o === 'function') pb.push(ch + ' (fonction)');
    else if (typeof o === 'number') { if (!isFinite(o)) pb.push(ch + ' = ' + o); else if (Object.is(o, -0)) pb.push(ch + ' = -0'); }
    else if (o && typeof o === 'object') { if (o instanceof Map || o instanceof Set) pb.push(ch + ' (Map/Set)'); for (const k of Object.keys(o)) { if (o[k] === undefined) pb.push(ch + '.' + k + ' = undefined'); else scan(o[k], ch + '.' + k); } }
  };
  const c = combatComplet(5);
  scan(c.e, 'etat');
  const e = R.creerCombat({ carte: M.carte(), graine: 2, artisans: [{ id: 'a', classe: 'merlanceur', niveau: 6 }], monstres: M.groupe('fourneau', 'mie-et-pate'), options: {} });
  scan(e, 'creation'); R.commencer(e); scan(e, 'debut'); scan(R.vuePour(e, 'monstres'), 'vue');
  assert.deepStrictEqual(pb, []);
});
test('K8 Minuteur : 45 s à chaque tour, sans report du temps non utilisé, quels que soient CM et Pas', 'Contrat décision 4 : « Minuteur : 45 secondes par tour, sans report du temps non utilisé. »', () => {
  const e = mk({ artisans: [{ id: 'a', case: [0, 0], equipement: { cm: 5, pas: 3 } }], monstres: [{ id: 'm', case: [9, 9] }] });
  const evs = debut.slice();
  for (let i = 0; i < 6; i++) { assert.strictEqual(R.tempsDuTour(e), 45); evs.push(...passer(e)); }
  assert.ok(de(evs, 'tour').every(t => t.minuteur === 45));
});
test('K9 Minuteur : en groupe (2 artisans), il reste actif même si l\'option le coupe (seul le solo peut le désactiver)', 'Contrat décision 4 : « En solo il est actif par défaut et désactivable. » Rapport §3.5 : en groupe, un artisan absent voit ses tours passés automatiquement (il faut un Minuteur).', () => {
  const e = R.creerCombat({ carte: { lignes: grille(6, 6) }, artisans: [{ id: 'a', classe: 'levainqueur', case: [0, 0] }, { id: 'b', classe: 'merlanceur', case: [1, 0] }], monstres: [fiche({ id: 'm', case: [5, 5] })], options: { minuteur: false, commande: 'aucune' } });
  R.commencer(e);
  assert.strictEqual(R.tempsDuTour(e), 45, 'Minuteur à ' + R.tempsDuTour(e) + ' pour un groupe de 2');
  const s = R.creerCombat({ carte: { lignes: grille(6, 6) }, artisans: [{ id: 'a', classe: 'levainqueur', case: [0, 0] }], monstres: [fiche({ id: 'm', case: [5, 5] })], options: { minuteur: false, commande: 'aucune', depart: 0 } });
  R.rejoindre(s, { id: 'b', classe: 'merlanceur' }); R.commencer(s);
  assert.strictEqual(R.tempsDuTour(s), 45, 'solo sans Minuteur rejoint par un allié : ' + R.tempsDuTour(s));
});
test('K10 fiche : +1 CM au niveau 100 ; effets secondaires des affinités (décision 5)', 'Contrat décisions 5 et 6 : Terroir → Rideau (+1/10), Soufflé → Faux-fuyant (+1/10), Éclair → Ouverture (+2/point), Flambée → Coup de maître (+1 %/20), Eaudace → Victuailles (+1/2) ; +1 CM au niveau 100.', () => {
  assert.deepStrictEqual([R.deriverArtisan({ niveau: 99 }).cm, R.deriverArtisan({ niveau: 100 }).cm], [6, 7]);
  const f = R.deriverArtisan({ niveau: 50, affinites: { T: 10, S: 20, C: 5, F: 40, E: 9 } });
  assert.deepStrictEqual([f.rideau, f.fauxFuyant, f.ouverture, f.coupDeMaitre, f.victuailles], [6, 7, 110, 2, 90 + 250 + 4]);
});
test('K11 Enraciné : ne peut plus marcher, peut encore lancer', 'Rapport §3.16 : « Enraciné : ne peut plus marcher (il peut encore lancer). »', () => {
  const e = mk({ artisans: [{ id: 'a', case: [0, 0], sorts: [FRAPPE(1)] }], monstres: [{ id: 'm', case: [3, 0] }] });
  poserEtat(e, 'a', 'enracine', 1);
  refusIntact(e, () => R.deplacer(e, 'a', [0, 1]), 'Enraciné : impossible de marcher ce tour');
  assert.strictEqual(R.deplacementsPossibles(e, 'a').length, 0);
  L(e, 'a', 'x', [3, 0]);
});
test('K12 Fève : qui fait tomber le porteur gagne 1 CM ; la Fève reste si son poseur tombe, le Brûlé non', 'Rapport §3.16 (Fève : tout le combat) ; §3.19 : « Les états qu\'il a posés sur d\'autres s\'arrêtent (sauf la Fève). »', () => {
  const FE = Sp({ id: 'fe', element: 'N', cible: 'ennemi', parTour: 2, effets: [{ type: 'etat', etat: 'feve', tours: 0 }] });
  const BR = Sp({ id: 'br', element: 'F', cible: 'ennemi', parTour: 2, effets: [{ type: 'etat', etat: 'brule', tours: 3 }] });
  let e = mk({ artisans: [{ id: 'a', case: [0, 0], sorts: [FE, FRAPPE(500)] }], monstres: [{ id: 'm', case: [3, 0] }, { id: 'n', case: [9, 9] }] });
  L(e, 'a', 'fe', [3, 0]);
  const evs = L(e, 'a', 'x', [3, 0]);
  assert.ok(de(evs, 'gain-cm').some(g => g.cible === 'a' && g.cause === 'feve'));
  assert.strictEqual(C(e, 'a').cm, 3);
  e = mk({ artisans: [{ id: 'a', case: [0, 0], sorts: [FE, BR] }, { id: 'b', case: [9, 0] }], monstres: [{ id: 'm', case: [3, 0], sorts: [FRAPPE(500)] }] });
  L(e, 'a', 'fe', [3, 0]); L(e, 'a', 'br', [3, 0]); passer(e);
  L(e, 'm', 'x', [0, 0]);
  assert.deepStrictEqual(C(e, 'm').etats.map(x => x.etat).sort(), ['feve']);
});
test('K13 boucliers : 3 couches au plus (Nappé 3), ils absorbent d\'abord, Nappé tombe avec le dernier', 'Contrat §3 (Glaçage = bouclier + état nappé, 3 couches) ; rapport §3.16 (Nappé, jusqu\'à 3 couches).', () => {
  const GL = Sp({ id: 'gl', element: 'N', cm: 1, cible: 'allie', touche: 'allies', effets: [{ type: 'bouclier', valeur: 20, tours: 2, couchesMax: 3 }, { type: 'etat', etat: 'nappe', tours: 2, couches: 1 }] });
  const e = mk({ artisans: [{ id: 'a', classe: 'patissorcier', case: [0, 0], sorts: [GL] }, { id: 'b', case: [0, 3] }], monstres: [{ id: 'm', case: [3, 3], sorts: [FRAPPE(70)] }] });
  for (let i = 0; i < 4; i++) L(e, 'a', 'gl', [0, 3]);
  assert.deepStrictEqual([C(e, 'b').boucliers.length, C(e, 'b').boucliers.reduce((s, x) => s + x.restant, 0), C(e, 'b').etats.find(x => x.etat === 'nappe').couches], [3, 60, 3]);
  passer(e);
  const d = de(L(e, 'm', 'x', [0, 3]), 'degats')[0];
  assert.deepStrictEqual([d.absorbe, d.perdu, !!C(e, 'b').etats.find(x => x.etat === 'nappe')], [60, 10, false]);
});
test('K14 Marée : haute (+2 Rayon) puis basse (+20 % de dégâts), à chaque tour du Merlanceur', 'Rapport §3.16 : « Marée haute / Marée basse : +2 Rayon / +20 % de dégâts, alterne à chaque tour ».', () => {
  const H = Sp({ id: 'h', element: 'E', cible: 'ennemi', parTour: 3, rayon: { min: 1, max: 3, modifiable: true }, effets: [D(10, 'E')] });
  const e = mk({ artisans: [{ id: 'a', classe: 'merlanceur', case: [0, 0], sorts: [H] }], monstres: [{ id: 'm', case: [3, 0], victuailles: 500 }] });
  const tour = () => [R.barre(e, 'a')[0].rayon.max, de(L(e, 'a', 'h', [3, 0]), 'degats')[0].valeur];
  const t1 = tour(); passer(e); passer(e); const t2 = tour(); passer(e); passer(e); const t3 = tour();
  assert.deepStrictEqual([t1, t2, t3], [[5, 10], [3, 12], [5, 10]]);
});
test('K15 Rayon modifiable : un malus de Rayon ne le fait jamais passer sous le minimum', 'Rapport §3.9 : « max effectif = max du sort + bonus de Rayon du lanceur (jamais sous le min) ».', () => {
  const S = Sp({ id: 'rm', cible: 'ennemi', parTour: 3, rayon: { min: 3, max: 4, modifiable: true }, effets: [D(1)] });
  const e = mk({ artisans: [{ id: 'a', case: [0, 0], sorts: [S] }], monstres: [{ id: 'm', case: [3, 0] }, { id: 'n', case: [4, 0] }] });
  C(e, 'a').bonus.push({ carac: 'rayon', valeur: -5, tours: 2, source: 'a' });
  assert.strictEqual(R.barre(e, 'a')[0].rayon.max, 3);
  L(e, 'a', 'rm', [3, 0]);
  refusIntact(e, () => R.lancer(e, 'a', 'rm', [4, 0]), 'Hors du Rayon');
});
test('K16 Dérobé : on ne peut pas le viser ; on s\'y cogne en marchant (arrêt net, il est révélé)', 'Rapport §3.6 : « Un combattant Dérobé ennemi bloque aussi la case, mais on ne le sait qu\'en s\'y cognant : le déplacement s\'arrête là. »', () => {
  const e = mk({ artisans: [{ id: 'a', case: [0, 5], sorts: [FRAPPE(1)] }], monstres: [{ id: 'm', case: [2, 5] }] });
  poserEtat(e, 'm', 'derobe');
  refusIntact(e, () => R.lancer(e, 'a', 'x', [2, 5]), 'Il faut viser un ennemi');
  const evs = V(e, 'a', [3, 5]);
  assert.ok(de(evs, 'bute').some(b => b.contre === 'm') && de(evs, 'revele').length === 1);
  assert.deepStrictEqual([C(e, 'a').case, C(e, 'a').pas], [[1, 5], 2]);
});

// =====================================================================
// Bilan
// =====================================================================
const ko = resultats.filter(r => !r.ok);
resultats.forEach(r => console.log((r.ok ? 'ok    ' : 'ÉCHEC ') + r.nom));
console.log('\n' + (resultats.length - ko.length) + ' réussis, ' + ko.length + ' échoués sur ' + resultats.length + ' tests adverses.');
if (ko.length) {
  console.log('\n--- Détail des échecs ---');
  ko.forEach(r => console.log('\n✗ ' + r.nom + '\n  Référence : ' + r.ref + '\n  Moteur    : ' + r.msg));
}
process.exitCode = ko.length ? 1 : 0;
