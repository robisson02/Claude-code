// Tests du moteur de règles d'Orvane : node tests.js (module assert de node, aucune dépendance).
'use strict';
const assert = require('assert');
const fs = require('fs');
const vm = require('vm');
const path = require('path');
const R = require('./regles.js');
const M = require('./monstres.js');
const O = require('./outils.js');
const ESSAI = require('./sorts-essai.js');

let reussis = 0, echoues = 0;
const echecs = [];
function test(nom, f) {
  try { f(); reussis++; } catch (e) { echoues++; echecs.push({ nom, e }); }
}

// ---------- Aides ----------
const grille = (w, h, ch = '.') => Array.from({ length: h }, () => ch.repeat(w));
const fiche = o => Object.assign({ nom: 'Cible', niveau: 1, victuailles: 200, cm: 6, pas: 3, ouverture: 0, rideau: 5, fauxFuyant: 5, sorts: [], xp: 10, ble: 2, objets: [] }, o);
const Sp = o => Object.assign({ id: 't', nom: 'Essai', element: 'F', cm: 2, niveau: 1, rayon: { min: 0, max: 12, modifiable: false }, lancer: 'libre', vue: false,
  cible: 'case', parTour: 0, parCible: 0, relance: 0, maitre: 0, zone: { forme: 'case' }, touche: 'ennemis', effets: [] }, o);
const D = (v, el = 'F') => ({ type: 'degats', element: el, min: v, max: v, maitre: [v, v] });
function mk(o = {}) {
  const e = R.creerCombat({
    carte: { lignes: o.lignes || grille(12, 12), departs: [{ artisans: o.departsA || [], monstres: [] }] }, graine: o.graine || 1,
    artisans: (o.artisans || []).map(a => Object.assign({ classe: 'levainqueur', niveau: 1 }, a)),
    monstres: (o.monstres || []).map(m => fiche(m)),
    options: Object.assign({ commande: 'aucune' }, o.options || {})
  });
  if (o.commencer !== false) { const r = R.commencer(e); assert.ok(r.ok, r.raison); }
  return e;
}
const C = (e, id) => R.trouver(e, id);
function passer(e) { const a = R.actif(e); const r = R.finDuTour(e, a.id); assert.ok(r.ok, r.raison); return r.evenements; }
function jusqua(e, id) { for (let i = 0; i < 60 && R.actif(e) && R.actif(e).id !== id; i++) passer(e); assert.strictEqual(R.actif(e).id, id); }
function L(e, id, s, cs) { const r = R.lancer(e, id, s, cs); assert.ok(r.ok, r.raison); return r.evenements; }
const de = (evs, type) => evs.filter(x => x.type === type);
const geler = e => JSON.stringify(e);
const faux = lignes => ({ carte: R.interne.preparerCarte({ lignes }), combattants: [], sol: [] });

// =====================================================================
// Carte
// =====================================================================
test('carte : lignes normalisées, décors nommés, cases de départ lues', () => {
  const k = R.interne.preparerCarte({ lignes: ['a.B', '~m.'], legende: { B: 'billot' } });
  assert.deepStrictEqual(k.lignes, ['..#', '~..']);
  assert.strictEqual(k.decors['2,0'], 'billot');
  assert.deepStrictEqual(k.departs[0], { artisans: [[0, 0]], monstres: [[1, 1]] });
});
test('carte : sol, décor plein et vide (hors carte = vide)', () => {
  const e = faux(['.#~']);
  assert.strictEqual(R.terrain(e, [0, 0]), 'sol');
  assert.strictEqual(R.terrain(e, [1, 0]), 'plein');
  assert.strictEqual(R.terrain(e, [2, 0]), 'vide');
  assert.strictEqual(R.terrain(e, [5, 5]), 'vide');
});
// Rapport, partie 2, point 16 : « des cartes de combat pensées pour le portrait : losange étiré en hauteur d'environ 9 × 13 cases
// (110 à 130 cases jouables) ». Ce test vérifiait une grille de 10 × 13 ; or, avec la projection de l'API
// (ecranX = (x − y) × L/2, ecranY = (x + y) × H/2), une grille rectangulaire est un losange deux fois plus LARGE que haut
// (relecture de conformité, écart 5). Il vérifie maintenant ce que demande le rapport : la carte, à l'écran, est plus haute que large
// (cases de 55 × 28 px, partie 3.23), environ 9 demi-colonnes sur 13 rangées, et 110 à 130 cases jouables.
test('Fourneau : en portrait à l\'écran (plus haut que large), 110 à 130 cases jouables, 3 jeux de départ de 6 cases sur le sol', () => {
  const e = faux(M.carte('fourneau').lignes);
  const k = R.interne.preparerCarte(M.carte('fourneau'));
  let n = 0, x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
  for (let y = 0; y < k.hauteur; y++) for (let x = 0; x < k.largeur; x++) {
    const t = R.terrain(e, [x, y]);
    if (t === 'sol') n++;
    if (t === 'vide') continue;
    const ex = (x - y) * 55 / 2, ey = (x + y) * 28 / 2;
    x0 = Math.min(x0, ex - 27.5); x1 = Math.max(x1, ex + 27.5); y0 = Math.min(y0, ey - 14); y1 = Math.max(y1, ey + 14);
  }
  assert.ok(n >= 110 && n <= 130, n);
  assert.ok(y1 - y0 > 1.25 * (x1 - x0), 'à l\'écran : ' + (x1 - x0) + ' × ' + (y1 - y0) + ' px');
  assert.ok(Math.round((x1 - x0) / 27.5) - 1 === 9, 'demi-colonnes : ' + ((x1 - x0) / 27.5 - 1));
  assert.strictEqual(k.departs.length, 3);
  k.departs.forEach(j => {
    assert.strictEqual(j.artisans.length, 6); assert.strictEqual(j.monstres.length, 6);
    j.artisans.concat(j.monstres).forEach(cs => assert.strictEqual(R.terrain(e, cs), 'sol', cs));
  });
  assert.strictEqual(Object.keys(k.decors).length, 5);
});

// =====================================================================
// Mise en place et ordre de jeu
// =====================================================================
test('Mise en place : les monstres sont placés par le jeu, l\'artisan choisit une case dorée et peut en changer', () => {
  const e = R.creerCombat({ carte: M.carte(), graine: 3, artisans: [{ id: 'a', classe: 'levainqueur', niveau: 6 }], monstres: M.groupe('fourneau', 'mie-et-pate'), options: { depart: 0, commande: 'aucune' } });
  assert.strictEqual(e.phase, 'miseEnPlace');
  e.combattants.filter(c => c.genre === 'monstre').forEach(m => assert.ok(e.carte.departs[0].monstres.some(cs => cs[0] === m.case[0] && cs[1] === m.case[1])));
  // (cases dorées du jeu 0 de la carte en portrait : [9, 7], [10, 8]… ; [0, 0] est du vide)
  assert.strictEqual(R.placer(e, 'a', [0, 0]).ok, false);
  assert.ok(R.placer(e, 'a', [9, 7]).ok);
  assert.ok(R.placer(e, 'a', [10, 8]).ok);
  assert.deepStrictEqual(C(e, 'a').case, [10, 8]);
  assert.strictEqual(R.deplacer(e, 'a', [10, 9]).raison, 'Le combat n\'a pas commencé');
  assert.ok(R.commencer(e).ok);
  assert.strictEqual(R.placer(e, 'a', [9, 7]).ok, false);
});
test('Mise en place : un artisan non placé reçoit une case dorée libre au début', () => {
  const e = R.creerCombat({ carte: M.carte(), graine: 3, artisans: [{ id: 'a', classe: 'levainqueur', niveau: 6 }], monstres: M.groupe('fourneau', 'grumeaux'), options: { depart: 1, commande: 'aucune' } });
  R.commencer(e);
  assert.ok(e.carte.departs[1].artisans.some(cs => cs[0] === C(e, 'a').case[0] && cs[1] === C(e, 'a').case[1]));
});
test('Mise en place : un allié rejoint (cloche de service), 4 artisans au plus ; « Envoyez ! » lance le combat quand tous sont prêts', () => {
  const e = R.creerCombat({ carte: M.carte(), graine: 3, artisans: [{ id: 'a', classe: 'levainqueur', niveau: 6 }], monstres: M.groupe('fourneau', 'mie-et-pate'), options: { depart: 0, commande: 'aucune' } });
  assert.strictEqual(R.rejoindre(e, { id: 'a', classe: 'merlanceur', niveau: 3 }).evenements[0].id, 'a-2');
  R.rejoindre(e, { id: 'c', classe: 'traitreur' }); R.rejoindre(e, { id: 'd', classe: 'legumancien' });
  assert.strictEqual(R.rejoindre(e, { id: 'e', classe: 'pateladin' }).raison, 'Le service est complet (4 artisans au plus)');
  assert.ok(C(e, 'a-2').etats.some(x => x.etat === 'maree-haute'));
  ['a', 'a-2', 'c'].forEach(id => { const r = R.pret(e, id); assert.ok(r.ok); assert.strictEqual(e.phase, 'miseEnPlace'); });
  const r = R.pret(e, 'd');
  assert.strictEqual(e.phase, 'combat');
  assert.ok(de(r.evenements, 'debut').length === 1);
  assert.strictEqual(R.rejoindre(e, { id: 'f', classe: 'pateladin' }).ok, false);
});
test('ordre de jeu : le camp à l\'Ouverture moyenne la plus haute commence, puis alternance', () => {
  const e = mk({
    artisans: [{ id: 'a1', case: [0, 0], equipement: { ouverture: 50 } }, { id: 'a2', case: [1, 0], equipement: { ouverture: 20 } }, { id: 'a3', case: [2, 0] }],
    monstres: [{ id: 'm1', case: [0, 9], ouverture: 140 }, { id: 'm2', case: [1, 9], ouverture: 90 }]
  });
  assert.deepStrictEqual(e.frise, ['a1', 'm1', 'a2', 'm2', 'a3']);
  assert.strictEqual(R.actif(e).id, 'a1');
});
test('ordre de jeu : à égalité, tirage au sort fixé par la graine', () => {
  const f = g => mk({ graine: g, artisans: [{ id: 'a', case: [0, 0] }], monstres: [{ id: 'm', case: [5, 5], ouverture: 100 }] }).frise.join();
  assert.strictEqual(f(11), f(11));
  const vus = new Set(); for (let g = 1; g < 30; g++) vus.add(f(g));
  assert.strictEqual(vus.size, 2);
});
test('ordre de jeu (3.22) : le Mie-tron (130) joue avant un artisan de niveau 6, le Grumeau après', () => {
  const e = R.creerCombat({ carte: M.carte(), graine: 5, artisans: [{ id: 'a', classe: 'levainqueur', niveau: 6 }], monstres: M.groupe('fourneau', 'mie-et-pate'), options: { commande: 'aucune' } });
  R.commencer(e);
  assert.deepStrictEqual(e.frise.map(id => C(e, id).fiche || id), ['mie-tron', 'a', 'grumeau']);
});
test('ordre de jeu : un camp vide de suivants laisse l\'autre enchaîner', () => {
  const e = mk({ artisans: [{ id: 'a', case: [0, 0] }], monstres: [{ id: 'm1', case: [5, 5] }, { id: 'm2', case: [6, 5] }, { id: 'm3', case: [7, 5] }] });
  assert.deepStrictEqual(e.frise, ['a', 'm1', 'm2', 'm3']);
});
test('ordre de jeu : un combattant tombé est sauté', () => {
  const e = mk({ artisans: [{ id: 'a', case: [0, 0], sorts: [Sp({ effets: [D(500)] })] }], monstres: [{ id: 'm1', case: [5, 5] }, { id: 'm2', case: [6, 5] }] });
  L(e, 'a', 't', [5, 5]);
  assert.strictEqual(C(e, 'm1').vivant, false);
  const evs = passer(e);
  assert.strictEqual(R.actif(e).id, 'm2');
  assert.ok(!de(evs, 'tour').some(x => x.id === 'm1'));
});
test('ordre de jeu : la manche avance quand la frise est finie', () => {
  const e = mk({ artisans: [{ id: 'a', case: [0, 0] }], monstres: [{ id: 'm', case: [5, 5] }] });
  assert.strictEqual(e.manche, 1); passer(e); passer(e);
  assert.strictEqual(e.manche, 2); assert.strictEqual(R.actif(e).id, 'a');
});

// =====================================================================
// Le tour et le Minuteur
// =====================================================================
test('tour : CM et Pas rendus pleins au début du tour', () => {
  const e = mk({ artisans: [{ id: 'a', case: [0, 0], sorts: [Sp({ cm: 4, effets: [D(1)] })] }], monstres: [{ id: 'm', case: [5, 5] }] });
  L(e, 'a', 't', [5, 5]); assert.ok(R.deplacer(e, 'a', [0, 2]).ok);
  assert.strictEqual(C(e, 'a').cm, 2); assert.strictEqual(C(e, 'a').pas, 1);
  passer(e); passer(e);
  assert.strictEqual(C(e, 'a').cm, 6); assert.strictEqual(C(e, 'a').pas, 3);
});
test('Minuteur : 45 secondes exposées, actif par défaut', () => {
  const e = R.creerCombat({ carte: { lignes: grille(5, 5) }, artisans: [{ id: 'a', classe: 'levainqueur', case: [0, 0] }], monstres: [fiche({ id: 'm', case: [4, 4] })], options: { commande: 'aucune' } });
  const evs = R.commencer(e).evenements;
  assert.strictEqual(R.CONST.MINUTEUR_S, 45);
  assert.strictEqual(R.tempsDuTour(e), 45);
  assert.strictEqual(de(evs, 'tour')[0].minuteur, 45);
});
test('Minuteur : désactivable en solo', () => {
  const e = R.creerCombat({ carte: { lignes: grille(5, 5) }, artisans: [{ id: 'a', classe: 'levainqueur', case: [0, 0] }], monstres: [fiche({ id: 'm', case: [4, 4] })], options: { minuteur: false, commande: 'aucune' } });
  const evs = R.commencer(e).evenements;
  assert.strictEqual(R.tempsDuTour(e), null); assert.strictEqual(de(evs, 'tour')[0].minuteur, null);
});
test('Minuteur : un artisan absent 3 tours d\'affilée quitte le service (il compte comme tombé)', () => {
  const e = mk({ artisans: [{ id: 'a', case: [0, 0] }, { id: 'b', case: [1, 0] }], monstres: [{ id: 'm', case: [9, 9] }] });
  for (let i = 0; i < 2; i++) { R.finDuTour(e, 'a', { absent: true }); jusqua(e, 'a'); }
  assert.ok(R.deplacer(e, 'a', [0, 1]).ok);
  R.finDuTour(e, 'a', { absent: true }); jusqua(e, 'a');
  assert.strictEqual(C(e, 'a').absences, 1);
  R.finDuTour(e, 'a', { absent: true }); jusqua(e, 'a');
  const evs = R.finDuTour(e, 'a', { absent: true }).evenements;
  assert.deepStrictEqual(de(evs, 'quitte')[0], { type: 'quitte', id: 'a' });
  assert.strictEqual(C(e, 'a').vivant, false);
  assert.strictEqual(e.phase, 'combat');
  assert.strictEqual(R.actif(e).id, 'm');
});
test('tour : seul l\'actif agit, avec une raison claire', () => {
  const e = mk({ artisans: [{ id: 'a', case: [0, 0] }], monstres: [{ id: 'm', case: [5, 5] }] });
  assert.strictEqual(R.finDuTour(e, 'm').raison, 'Ce n\'est pas le tour de Cible');
  assert.strictEqual(R.deplacer(e, 'm', [5, 6]).ok, false);
  assert.strictEqual(R.finDuTour(e, 'zz').raison, 'Combattant inconnu');
});

// =====================================================================
// Déplacement
// =====================================================================
test('marche : 4 directions, 1 Pas par case, coût = distance', () => {
  const e = mk({ artisans: [{ id: 'a', case: [0, 0] }], monstres: [{ id: 'm', case: [11, 11] }] });
  const d = R.deplacementsPossibles(e, 'a');
  assert.strictEqual(d.length, 9);
  d.forEach(x => assert.strictEqual(x.cout, x.case[0] + x.case[1]));
  const r = R.deplacer(e, 'a', [1, 2]);
  assert.ok(r.ok); assert.strictEqual(de(r.evenements, 'deplacement')[0].chemin.length, 4);
  assert.strictEqual(C(e, 'a').pas, 0);
  for (let i = 1; i < d[0].chemin.length; i++) assert.strictEqual(R.distance(d[0].chemin[i - 1], d[0].chemin[i]), 1);
});
test('marche : ni décor, ni vide, ni combattant (allié compris) ne se traversent', () => {
  const e = mk({ lignes: ['.#....', '~.....', '......'], artisans: [{ id: 'a', case: [0, 0] }, { id: 'c', case: [0, 2] }, { id: 'b', case: [1, 2] }], monstres: [{ id: 'm', case: [5, 2] }] });
  assert.strictEqual(R.deplacementsPossibles(e, 'a').length, 0);
  assert.strictEqual(R.deplacementsPossibles(e, 'c').length, 0);
  assert.strictEqual(R.deplacer(e, 'a', [2, 0]).raison, 'Case hors d\'atteinte');
  assert.strictEqual(R.deplacer(e, 'a', [1, 0]).raison, 'On ne marche pas là');
  assert.strictEqual(R.deplacer(e, 'a', [0, 1]).raison, 'On ne marche pas là');
});
test('marche : plus de Pas, refus', () => {
  const e = mk({ artisans: [{ id: 'a', case: [0, 0] }], monstres: [{ id: 'm', case: [11, 11] }] });
  assert.ok(R.deplacer(e, 'a', [0, 3]).ok);
  assert.strictEqual(R.deplacer(e, 'a', [0, 4]).raison, 'Plus de Pas');
});
test('Enraciné : ne peut plus marcher, mais peut encore lancer', () => {
  const e = mk({ artisans: [{ id: 'a', case: [0, 0], sorts: [Sp({ id: 'r', cible: 'soi', touche: 'allies', effets: [{ type: 'etat', etat: 'enracine', tours: 1 }] }), Sp({ effets: [D(5)] })] }], monstres: [{ id: 'm', case: [5, 5] }] });
  L(e, 'a', 'r');
  assert.strictEqual(R.deplacer(e, 'a', [0, 1]).raison, 'Enraciné : impossible de marcher ce tour');
  assert.deepStrictEqual(R.deplacementsPossibles(e, 'a'), []);
  L(e, 'a', 't', [5, 5]);
});
// Le tableau du Rideau (partie 3.7)
test('Rideau : Faux-fuyant 5 contre 1 Grumeau (Rideau 5) → 4 CM et 2 Pas, puis 1 Pas après la sortie', () => {
  const e = mk({ artisans: [{ id: 'a', case: [2, 2] }], monstres: [{ id: 'g', case: [3, 2], rideau: 5 }] });
  const ap = R.apercuDeplacement(e, 'a', [1, 2]);
  assert.ok(ap.ok);
  assert.deepStrictEqual([ap.cmRestants, ap.pasRestants], [4, 1]);
  assert.deepStrictEqual(ap.perte, { cm: 2, pas: 1 });
  const r = R.deplacer(e, 'a', [1, 2]);
  assert.deepStrictEqual(de(r.evenements, 'rideau')[0], { type: 'rideau', id: 'a', case: [2, 2], cmPerdus: 2, pasPerdus: 1 });
  assert.deepStrictEqual([C(e, 'a').cm, C(e, 'a').pas], [4, 1]);
});
test('Rideau : 2 Grumeaux → 44 %, 3 CM et 1 Pas, 0 après la sortie', () => {
  const e = mk({ artisans: [{ id: 'a', case: [2, 2] }], monstres: [{ id: 'g1', case: [3, 2] }, { id: 'g2', case: [2, 3] }] });
  const ap = R.apercuDeplacement(e, 'a', [1, 2]);
  assert.deepStrictEqual([ap.cmRestants, ap.pasRestants], [3, 0]);
  assert.ok(Math.abs(ap.rideau[0].part - 100 / 225) < 1e-9);
});
test('Rideau : Faux-fuyant 10 contre Rideau 5 → rien perdu', () => {
  const e = mk({ artisans: [{ id: 'a', case: [2, 2], equipement: { fauxFuyant: 5 } }], monstres: [{ id: 'g', case: [3, 2] }] });
  const ap = R.apercuDeplacement(e, 'a', [1, 2]);
  assert.deepStrictEqual(ap.perte, { cm: 0, pas: 0 }); assert.strictEqual(ap.pasRestants, 2);
});
test('Rideau : Bouchevalier ennemi (Rideau 20) → 22 %, 1 CM et 1 Pas (par arrondi, sans minimum)', () => {
  const e = mk({ artisans: [{ id: 'a', case: [2, 2] }], monstres: [{ id: 'b', case: [3, 2], rideau: 20 }] });
  const ap = R.apercuDeplacement(e, 'a', [1, 2]);
  assert.deepStrictEqual(ap.rideau[0], { case: [2, 2], cm: 5, pas: 2, part: 10 / 45 });
  assert.deepStrictEqual([ap.cmRestants, ap.pasRestants], [1, 0]);
  assert.deepStrictEqual(R.apercuRideau(e, 'a'), { auContact: true, ennemis: ['b'], part: 10 / 45, pasApres: 1, cmApres: 1, perte: { cm: 5, pas: 2 }, pris: false });
});
test('Rideau (décision 1 mise à jour) : pas de minimum ; à 0 Pas on est « Pris dans le Rideau », et l\'aperçu le montre', () => {
  const e = mk({ artisans: [{ id: 'a', case: [2, 2] }], monstres: [{ id: 'b1', case: [3, 2], rideau: 20 }, { id: 'b2', case: [2, 3], rideau: 5 }] });
  const ap = R.apercuRideau(e, 'a');
  assert.strictEqual(ap.auContact, true); assert.deepStrictEqual(ap.ennemis.sort(), ['b1', 'b2']);
  assert.strictEqual(ap.pasApres, 0);
  assert.strictEqual(ap.pris, true);
  assert.deepStrictEqual(R.deplacementsPossibles(e, 'a'), []);
  assert.strictEqual(R.apercuDeplacement(e, 'a', [1, 2]).raison, 'Pris dans le Rideau');
  const avant = geler(e);
  assert.strictEqual(R.deplacer(e, 'a', [1, 2]).raison, 'Pris dans le Rideau');
  assert.strictEqual(geler(e), avant);
  assert.ok(R.lancer(e, 'a', 'x', [3, 2]).ok === false);
});
test('Rideau : avec 2 Pas contre un Rideau de 20, arrondi(2 × 22 %) = 0, on reste pris ; avec 3 Pas, on sort avec 1', () => {
  const e = mk({ artisans: [{ id: 'a', case: [2, 2] }], monstres: [{ id: 'b', case: [3, 2], rideau: 20 }] });
  assert.strictEqual(R.apercuRideau(e, 'a').pasApres, 1);
  C(e, 'a').pas = 2;
  assert.strictEqual(R.apercuRideau(e, 'a').pris, true);
  assert.strictEqual(R.deplacer(e, 'a', [1, 2]).raison, 'Pris dans le Rideau');
});
test('Rideau : une perte en chemin qui rend la case trop lointaine est dite « (Rideau) »', () => {
  const e = mk({ artisans: [{ id: 'a', case: [2, 2] }], monstres: [{ id: 'g', case: [3, 2] }] });
  assert.strictEqual(R.apercuDeplacement(e, 'a', [0, 1]).raison, 'Case hors d\'atteinte (Rideau)');
  assert.strictEqual(R.apercuDeplacement(e, 'a', [9, 9]).raison, 'Case hors d\'atteinte');
});
test('Rideau : Glissant fait partir sans perte', () => {
  const e = mk({ artisans: [{ id: 'a', case: [2, 2], sorts: [Sp({ id: 'gl', cm: 1, cible: 'soi', touche: 'allies', effets: [{ type: 'etat', etat: 'glissant', tours: 1 }] })] }], monstres: [{ id: 'g', case: [3, 2] }] });
  L(e, 'a', 'gl');
  const r = R.deplacer(e, 'a', [0, 2]);
  assert.strictEqual(de(r.evenements, 'rideau').length, 0);
  assert.deepStrictEqual([C(e, 'a').cm, C(e, 'a').pas], [5, 1]);
});
test('Rideau : la portée sans Rideau montre les cases devenues hors d\'atteinte', () => {
  const e = mk({ artisans: [{ id: 'a', case: [2, 2] }], monstres: [{ id: 'g1', case: [3, 2] }, { id: 'g2', case: [2, 3] }] });
  const avec = R.deplacementsPossibles(e, 'a').length, sans = R.deplacementsPossibles(e, 'a', { sansRideau: true }).length;
  assert.ok(sans > avec, sans + ' > ' + avec);
});
test('Rideau : un ennemi Dérobé ne retient pas ; on bute sur lui sans le savoir', () => {
  const e = mk({ artisans: [{ id: 'a', case: [0, 0] }], monstres: [{ id: 'd', case: [2, 0] }, { id: 'm', case: [9, 9] }] });
  C(e, 'd').etats.push({ etat: 'derobe', tours: 2, couches: 1, source: 'd' });
  const r = R.deplacer(e, 'a', [3, 0]);
  assert.ok(r.ok);
  assert.deepStrictEqual(C(e, 'a').case, [1, 0]);
  assert.strictEqual(de(r.evenements, 'bute').length, 1);
  assert.strictEqual(de(r.evenements, 'revele')[0].id, 'd');
  assert.strictEqual(de(r.evenements, 'rideau').length, 0);
  assert.strictEqual(C(e, 'a').pas, 2);
});

// =====================================================================
// Ligne de vue
// =====================================================================
test('vue : le décor plein coupe la vue, le vide non', () => {
  assert.strictEqual(R.ligneDeVue(faux(['.....', '..#..', '.....']), [0, 1], [4, 1]), false);
  assert.strictEqual(R.ligneDeVue(faux(['.....', '..~..', '.....']), [0, 1], [4, 1]), true);
});
test('vue : tout combattant la coupe, allié compris ; un Dérobé non', () => {
  const e = mk({ artisans: [{ id: 'a', case: [0, 1] }, { id: 'b', case: [2, 1] }], monstres: [{ id: 'm', case: [4, 1] }] });
  assert.strictEqual(R.ligneDeVue(e, [0, 1], [4, 1]), false);
  C(e, 'b').etats.push({ etat: 'derobe', tours: 1, couches: 1, source: 'b' });
  assert.strictEqual(R.ligneDeVue(e, [0, 1], [4, 1]), true);
});
test('vue : la case du lanceur et la case visée ne comptent pas', () => {
  const e = mk({ artisans: [{ id: 'a', case: [0, 0] }], monstres: [{ id: 'm', case: [1, 0] }] });
  assert.strictEqual(R.ligneDeVue(e, [0, 0], [1, 0]), true);
});
test('vue : supercover, cases traversées exactes', () => {
  assert.deepStrictEqual(R.interne.traverse([0, 0], [2, 1]), [{ c: [1, 0] }, { c: [1, 1] }]);
  assert.deepStrictEqual(R.interne.traverse([0, 0], [2, 2]), [{ coin: [[1, 0], [0, 1]] }, { c: [1, 1] }, { coin: [[2, 1], [1, 2]] }]);
});
test('vue : règle du coin (coupée seulement si les deux cases bloquent)', () => {
  assert.strictEqual(R.ligneDeVue(faux(['.#.', '...', '...']), [0, 0], [2, 2]), true);
  assert.strictEqual(R.ligneDeVue(faux(['.#.', '#..', '...']), [0, 0], [2, 2]), false);
  assert.strictEqual(R.ligneDeVue(faux(['...', '...', '.#.']), [0, 0], [2, 2]), true);
});
test('vue : symétrique (si je te vois, tu me vois), sur 2000 paires au hasard', () => {
  let g = 12345; const r = () => (g = (g * 16807) % 2147483647) / 2147483647;
  for (let k = 0; k < 20; k++) {
    const lignes = grille(14, 14).map(l => l.split('').map(() => (r() < 0.22 ? '#' : '.')).join(''));
    const e = faux(lignes);
    for (let i = 0; i < 100; i++) {
      const a = [Math.floor(r() * 14), Math.floor(r() * 14)], b = [Math.floor(r() * 14), Math.floor(r() * 14)];
      assert.strictEqual(R.ligneDeVue(e, a, b), R.ligneDeVue(e, b, a), JSON.stringify([a, b]));
    }
  }
});
test('vue : un sort « vue : non » se lance derrière un obstacle', () => {
  const e = mk({ lignes: ['.....', '..#..', '.....'], artisans: [{ id: 'a', case: [0, 1], sorts: [Sp({ id: 'v', vue: true, effets: [D(1)] }), Sp({ id: 'n', vue: false, effets: [D(1)] })] }], monstres: [{ id: 'm', case: [4, 1] }] });
  assert.strictEqual(R.lancer(e, 'a', 'v', [4, 1]).raison, 'Pas de vue');
  assert.ok(R.lancer(e, 'a', 'n', [4, 1]).ok);
});

// =====================================================================
// Rayon, manières de lancer, cibles
// =====================================================================
function rayonEssai(sort, eq) {
  const e = mk({ lignes: grille(15, 15), artisans: [{ id: 'a', case: [7, 7], equipement: eq || {}, sorts: [sort] }], monstres: [{ id: 'm', case: [0, 0] }] });
  return R.casesVisables(e, 'a', sort.id);
}
test('Rayon : min ≤ distance ≤ max (un losange troué)', () => {
  const v = rayonEssai(Sp({ rayon: { min: 2, max: 4, modifiable: false } }));
  assert.strictEqual(v.cases.length, 36);
  assert.ok(v.cases.every(c => { const d = Math.abs(c.case[0] - 7) + Math.abs(c.case[1] - 7); return d >= 2 && d <= 4; }));
});
test('Rayon modifiable : le bonus de Rayon allonge le max', () => {
  assert.strictEqual(rayonEssai(Sp({ rayon: { min: 2, max: 4, modifiable: true } }), { rayon: 2 }).cases.length, 80);
});
test('Rayon non modifiable : le bonus ne compte pas', () => {
  assert.strictEqual(rayonEssai(Sp({ rayon: { min: 2, max: 4, modifiable: false } }), { rayon: 2 }).cases.length, 36);
});
test('Rayon modifiable : jamais sous le min', () => {
  const s = Sp({ rayon: { min: 2, max: 4, modifiable: true } });
  const e = mk({ lignes: grille(15, 15), artisans: [{ id: 'a', case: [7, 7], sorts: [s] }], monstres: [{ id: 'm', case: [0, 0] }] });
  C(e, 'a').carac.rayon = -5;
  assert.strictEqual(R.casesVisables(e, 'a', 't').cases.length, 8);
});
test('lancer en ligne : même X ou même Y', () => {
  const v = rayonEssai(Sp({ rayon: { min: 1, max: 3 }, lancer: 'ligne' }));
  assert.strictEqual(v.cases.filter(c => c.visable).length, 12);
  assert.ok(v.cases.filter(c => !c.visable).every(c => c.raison === 'Il faut lancer en ligne' && c.vue === false));
});
test('lancer en diagonale : |ΔX| = |ΔY|', () => {
  const v = rayonEssai(Sp({ rayon: { min: 1, max: 4 }, lancer: 'diagonale' }));
  assert.strictEqual(v.cases.filter(c => c.visable).length, 8);
});
test('lancer en ligne et en diagonale : 8 branches', () => {
  const v = rayonEssai(Sp({ rayon: { min: 1, max: 4 }, lancer: 'ligne+diagonale' }));
  assert.strictEqual(v.cases.filter(c => c.visable).length, 24);
});
test('cibles : ennemi, allié, combattant, case libre, case, soi', () => {
  const s = [
    Sp({ id: 'en', cible: 'ennemi', effets: [D(1)] }), Sp({ id: 'al', cible: 'allie', touche: 'allies', effets: [] }),
    Sp({ id: 'co', cible: 'combattant', effets: [D(1)] }), Sp({ id: 'cl', cible: 'caseLibre', effets: [] }),
    Sp({ id: 'ca', cible: 'case', effets: [] }), Sp({ id: 'so', cible: 'soi', touche: 'allies', effets: [] })
  ];
  const e = mk({ artisans: [{ id: 'a', case: [0, 0], sorts: s }, { id: 'b', case: [2, 0] }], monstres: [{ id: 'm', case: [4, 0] }] });
  C(e, 'a').cm = 99;
  assert.strictEqual(R.lancer(e, 'a', 'en', [2, 0]).raison, 'Il faut viser un ennemi');
  assert.strictEqual(R.lancer(e, 'a', 'en', [5, 5]).raison, 'Il faut viser un ennemi');
  assert.ok(R.lancer(e, 'a', 'en', [4, 0]).ok);
  assert.strictEqual(R.lancer(e, 'a', 'al', [4, 0]).raison, 'Il faut viser un allié');
  assert.ok(R.lancer(e, 'a', 'al', [2, 0]).ok);
  assert.ok(R.lancer(e, 'a', 'al', [0, 0]).ok);
  assert.strictEqual(R.lancer(e, 'a', 'co', [5, 5]).raison, 'Il faut viser un combattant');
  assert.strictEqual(R.lancer(e, 'a', 'cl', [4, 0]).raison, 'Il faut viser une case libre');
  assert.ok(R.lancer(e, 'a', 'cl', [5, 5]).ok);
  assert.ok(R.lancer(e, 'a', 'ca', [4, 0]).ok);
  assert.strictEqual(R.lancer(e, 'a', 'so', [1, 0]).raison, 'Ce sort se lance sur soi');
  assert.ok(R.lancer(e, 'a', 'so').ok);
  assert.strictEqual(R.lancer(e, 'a', 'ca', [-1, 0]).raison, 'Case hors du terrain');
  assert.strictEqual(R.lancer(e, 'a', 'xx', [4, 0]).raison, 'Ce sort n\'est pas dans le grimoire de a');
});

// =====================================================================
// Limites de lancer et relances
// =====================================================================
test('parTour : « Plus de service pour ce tour »', () => {
  const e = mk({ artisans: [{ id: 'a', case: [0, 0], sorts: [Sp({ cm: 1, parTour: 2, effets: [D(1)] })] }], monstres: [{ id: 'm', case: [4, 0] }] });
  L(e, 'a', 't', [4, 0]); L(e, 'a', 't', [4, 0]);
  assert.strictEqual(R.lancer(e, 'a', 't', [4, 0]).raison, 'Plus de service pour ce tour');
  passer(e); passer(e);
  L(e, 'a', 't', [4, 0]);
});
test('parCible : « Déjà servi à cette cible » (une autre cible reste possible)', () => {
  const e = mk({ artisans: [{ id: 'a', case: [0, 0], sorts: [Sp({ cm: 1, parCible: 1, cible: 'ennemi', effets: [D(1)] })] }], monstres: [{ id: 'm1', case: [4, 0] }, { id: 'm2', case: [5, 0] }] });
  L(e, 'a', 't', [4, 0]);
  assert.strictEqual(R.lancer(e, 'a', 't', [4, 0]).raison, 'Déjà servi à cette cible');
  L(e, 'a', 't', [5, 0]);
});
test('relance : « Revient dans 2 tours », puis 1, puis libre', () => {
  const e = mk({ artisans: [{ id: 'a', case: [0, 0], sorts: [Sp({ cm: 1, relance: 2, effets: [D(1)] })] }], monstres: [{ id: 'm', case: [4, 0] }] });
  L(e, 'a', 't', [4, 0]);
  assert.strictEqual(R.lancer(e, 'a', 't', [4, 0]).raison, 'Revient dans 2 tours');
  passer(e); passer(e);
  assert.strictEqual(R.lancer(e, 'a', 't', [4, 0]).raison, 'Revient dans 1 tour');
  passer(e); passer(e);
  L(e, 'a', 't', [4, 0]);
});
test('relanceInitiale : pas avant le tour indiqué (chef-d\'œuvre : pas avant le 3e tour)', () => {
  const e = mk({ artisans: [{ id: 'a', case: [0, 0], sorts: [Sp({ cm: 1, relance: 5, relanceInitiale: 2, effets: [D(1)] })] }], monstres: [{ id: 'm', case: [4, 0] }] });
  assert.strictEqual(R.lancer(e, 'a', 't', [4, 0]).raison, 'Revient dans 2 tours');
  passer(e); passer(e);
  assert.strictEqual(R.lancer(e, 'a', 't', [4, 0]).raison, 'Revient dans 1 tour');
  passer(e); passer(e);
  L(e, 'a', 't', [4, 0]);
});
test('plafondPose : nombre d\'objets du sort en même temps', () => {
  const e = mk({ artisans: [{ id: 'a', case: [0, 0], sorts: [Sp({ cm: 1, plafondPose: 2, cible: 'caseLibre', effets: [{ type: 'pose', quoi: 'nappe', tours: 5, effets: [] }] })] }], monstres: [{ id: 'm', case: [9, 9] }] });
  L(e, 'a', 't', [3, 3]); L(e, 'a', 't', [4, 3]);
  assert.strictEqual(R.lancer(e, 'a', 't', [5, 3]).raison, 'Déjà 2 posés : plafond atteint');
});
test('CM : « Pas assez de coups de main »', () => {
  const e = mk({ artisans: [{ id: 'a', case: [0, 0], sorts: [Sp({ cm: 7, effets: [D(1)] })] }], monstres: [{ id: 'm', case: [4, 0] }] });
  assert.strictEqual(R.lancer(e, 'a', 't', [4, 0]).raison, 'Pas assez de coups de main (7 CM)');
});
test('une action refusée ne modifie pas l\'état', () => {
  const e = mk({ artisans: [{ id: 'a', case: [0, 0], sorts: [Sp({ cm: 1, rayon: { min: 1, max: 2 }, effets: [D(1)] })] }], monstres: [{ id: 'm', case: [4, 0] }] });
  const avant = geler(e);
  [R.lancer(e, 'a', 't', [4, 0]), R.deplacer(e, 'a', [9, 9]), R.finDuTour(e, 'm'), R.utiliserPainDeRoute(e, 'a'), R.lancer(e, 'a', 't', [0, 0]), R.deplacer(e, 'a', [0, 0])]
    .forEach(r => { assert.strictEqual(r.ok, false); assert.ok(typeof r.raison === 'string' && r.raison.length > 3); });
  assert.strictEqual(geler(e), avant);
});

// =====================================================================
// Dégâts, soins, coup de maître
// =====================================================================
test('dégâts (exemple 3.11) : jet 12, Flambée 30, Grumeau −20 % → 18 ; Entame 2, maximum 52 → 50', () => {
  // l'exemple du rapport prend un Grumeau à 52 Victuailles (avant la baisse de 35 % du 14 novembre) : on le garde tel quel
  const e = mk({ artisans: [{ id: 'a', case: [0, 0], niveau: 7, affinites: { F: 30 }, sorts: [Sp({ effets: [D(12)] })] }], monstres: [Object.assign(M.fiche('grumeau'), { id: 'g', case: [3, 0], victuailles: 52 })] });
  const evs = L(e, 'a', 't', [3, 0]), d = de(evs, 'degats')[0];
  assert.strictEqual(d.valeur, 18); assert.strictEqual(d.entame, 2);
  assert.strictEqual(C(e, 'g').victuailles, 34);
  assert.strictEqual(d.max, 50);
});
test('dégâts : fourchette de Mie-raille sur ce Grumeau : 15 à 21 (maître 19 à 26)', () => {
  const mr = ESSAI.find(s => s.id === 'levainqueur.mie-raille');
  const e = mk({ artisans: [{ id: 'a', case: [0, 0], niveau: 7, affinites: { F: 30 }, sorts: [mr] }], monstres: [Object.assign(M.fiche('grumeau'), { id: 'g', case: [3, 0] })] });
  const ap = R.apercuSort(e, 'a', mr.id, [3, 0]);
  assert.ok(ap.ok, ap.raison);
  assert.deepStrictEqual(ap.cibles[0].degats, { min: 15, max: 21, maitreMin: 19, maitreMax: 26 });
  assert.strictEqual(ap.chanceMaitre, 11);
});
test('dégâts : Levure ajoutée à l\'affinité ; Neutre : la Levure seule', () => {
  const e = mk({ artisans: [{ id: 'a', case: [0, 0], niveau: 7, affinites: { F: 30 }, equipement: { levure: 20 } }], monstres: [{ id: 'm', case: [3, 0] }] });
  const a = C(e, 'a'), m = C(e, 'm');
  assert.strictEqual(R.interne.calculerDegats(e, a, { element: 'F' }, { element: 'F' }, m, 0, 10, true, 1), 15);
  assert.strictEqual(R.interne.calculerDegats(e, a, { element: 'N' }, { element: 'N' }, m, 0, 10, true, 1), 12);
});
test('Conservation : plafonnée à 40 % pour un artisan, libre pour un monstre (−50 à +100)', () => {
  const e = mk({ artisans: [{ id: 'a', case: [0, 0], equipement: { conservation: { F: 60 } } }], monstres: [{ id: 'm', case: [3, 0], conservation: { F: 80, E: -70 } }] });
  const a = C(e, 'a'), m = C(e, 'm');
  assert.strictEqual(R.interne.conservationEff(a, 'F'), 40);
  a.bonus.push({ carac: 'conservation', valeur: 30, tours: 1, source: 'a' });
  assert.strictEqual(R.interne.conservationEff(a, 'F'), 40);
  assert.strictEqual(R.interne.conservationEff(m, 'F'), 80);
  assert.strictEqual(R.interne.conservationEff(m, 'E'), -50);
  assert.strictEqual(R.interne.calculerDegats(e, a, { element: 'F' }, { element: 'F' }, m, 0, 100, true, 1), 20);
});
test('Attendri : −10 % de Conservation (1 couche), −15 % (2 couches)', () => {
  const e = mk({ artisans: [{ id: 'a', case: [0, 0] }], monstres: [{ id: 'm', case: [3, 0], conservation: { F: 20 } }] });
  const m = C(e, 'm');
  m.etats.push({ etat: 'attendri', tours: 2, couches: 1, source: 'a' });
  assert.strictEqual(R.interne.conservationEff(m, 'F'), 10);
  m.etats[0].couches = 2;
  assert.strictEqual(R.interne.conservationEff(m, 'F'), 5);
});
test('coup de maître : un sort à 0 % n\'en fait jamais ; à 100 % on prend la fourchette maître', () => {
  const s0 = Sp({ id: 's0', effets: [{ type: 'degats', element: 'F', min: 10, max: 10, maitre: [30, 30] }] });
  const s5 = Sp({ id: 's5', maitre: 5, effets: [{ type: 'degats', element: 'F', min: 10, max: 10, maitre: [30, 30] }] });
  const e = mk({ artisans: [{ id: 'a', case: [0, 0], equipement: { coupDeMaitre: 100 }, sorts: [s0, s5] }], monstres: [{ id: 'm', case: [3, 0] }] });
  let evs = L(e, 'a', 's0', [3, 0]);
  assert.strictEqual(de(evs, 'lancer')[0].maitre, false); assert.strictEqual(de(evs, 'degats')[0].valeur, 10);
  evs = L(e, 'a', 's5', [3, 0]);
  assert.strictEqual(de(evs, 'lancer')[0].maitre, true); assert.strictEqual(de(evs, 'degats')[0].valeur, 30); assert.strictEqual(de(evs, 'degats')[0].maitre, true);
});
test('coup de maître : fourchette maître par défaut 25 % plus haute', () => {
  const n = R.normaliserSort(Sp({ effets: [{ type: 'degats', element: 'F', min: 10, max: 14 }] }));
  assert.deepStrictEqual(n.effets[0].maitre, [13, 18]);
});
test('états qui changent les dégâts : Fumé −15 %, Marée basse +20 %, multipliés entre eux', () => {
  const e = mk({ artisans: [{ id: 'a', case: [0, 0] }], monstres: [{ id: 'm', case: [3, 0] }] });
  const a = C(e, 'a'), m = C(e, 'm'), f = () => R.interne.calculerDegats(e, a, { element: 'F' }, { element: 'F' }, m, 0, 100, true, 1);
  a.etats.push({ etat: 'fume', tours: 1, couches: 1, source: 'm' });
  assert.strictEqual(f(), 85);
  a.etats.push({ etat: 'maree-basse', tours: 0, couches: 1, source: 'a' });
  assert.strictEqual(f(), 102);
  a.etats.shift();
  assert.strictEqual(f(), 120);
});
test('boucliers : ils absorbent d\'abord, le Nappé tombe avec eux ; 3 couches au plus', () => {
  const gl = ESSAI.find(s => s.id === 'patissorcier.glacage');
  const e = mk({ artisans: [{ id: 'p', classe: 'patissorcier', case: [0, 0], sorts: [gl] }, { id: 'b', case: [1, 0] }],
    monstres: [{ id: 'm', case: [2, 0], sorts: [Sp({ id: 'coup', cible: 'ennemi', effets: [D(30, 'T')] })] }] });
  let evs = L(e, 'p', gl.id, [1, 0]);
  assert.strictEqual(de(evs, 'bouclier')[0].valeur, 20);
  assert.ok(C(e, 'b').etats.some(x => x.etat === 'nappe'));
  jusqua(e, 'm');
  evs = L(e, 'm', 'coup', [1, 0]);
  const d = de(evs, 'degats')[0];
  assert.deepStrictEqual([d.valeur, d.absorbe, d.perdu], [30, 20, 10]);
  assert.ok(!C(e, 'b').etats.some(x => x.etat === 'nappe'));
  const p = C(e, 'p');
  for (let i = 0; i < 4; i++) { p.relances = {}; p.tour = { lances: {}, cibles: {}, pasMarches: 0, pain: 0 }; p.cm = 6; }
  jusqua(e, 'p');
  for (let i = 0; i < 4; i++) { p.relances = {}; p.tour.lances = {}; p.tour.cibles = {}; p.cm = 6; L(e, 'p', gl.id, [1, 0]); }
  assert.strictEqual(C(e, 'b').boucliers.length, 3);
});
test('soin : jet × (100 + Levure) / 100 + Remontant, plafonné au maximum diminué de l\'Entame', () => {
  const soin = Sp({ id: 'soin', element: 'N', cible: 'allie', touche: 'allies', effets: [{ type: 'soin', min: 10, max: 10, maitre: [10, 10] }] });
  const e = mk({ artisans: [{ id: 'p', classe: 'patissorcier', case: [0, 0], equipement: { levure: 20, remontant: 3 }, sorts: [soin] }, { id: 'b', case: [1, 0] }], monstres: [{ id: 'm', case: [9, 9] }] });
  const b = C(e, 'b');
  b.victuailles = 50;
  let evs = L(e, 'p', 'soin', [1, 0]);
  assert.strictEqual(de(evs, 'soin')[0].valeur, 15);
  b.victuailles = b.victuaillesMax - 12; b.entame = 10;
  C(e, 'p').cm = 6;
  evs = L(e, 'p', 'soin', [1, 0]);
  assert.deepStrictEqual([de(evs, 'soin')[0].valeur, de(evs, 'soin')[0].brut], [2, 15]);
  assert.strictEqual(b.victuailles, b.victuaillesMax - 10);
});
test('Entame : 12,5 % des dégâts reçus ; brique entame (Tranchant) 25 % pendant 2 tours ; plafond 50 %', () => {
  const tr = Sp({ id: 'tr', cible: 'ennemi', effets: [{ type: 'entame', part: 25, tours: 2 }, D(40)] });
  const e = mk({ artisans: [{ id: 'a', case: [0, 0], sorts: [Sp({ id: 'n', effets: [D(40)] }), tr] }], monstres: [{ id: 'm', case: [3, 0] }] });
  C(e, 'a').cm = 20;
  assert.strictEqual(de(L(e, 'a', 'n', [3, 0]), 'degats')[0].entame, 5);
  assert.strictEqual(de(L(e, 'a', 'tr', [3, 0]), 'degats')[0].entame, 10);
  C(e, 'm').entameSpeciale.part = 80;
  assert.strictEqual(de(L(e, 'a', 'n', [3, 0]), 'degats')[0].entame, 20);
  passer(e); passer(e); passer(e);
  assert.strictEqual(C(e, 'm').entameSpeciale.tours, 1);
  passer(e);
  assert.strictEqual(C(e, 'm').entameSpeciale, null);
});
test('Entame : les soins ne la rendent pas', () => {
  const soin = Sp({ id: 'soin', element: 'N', cible: 'soi', touche: 'allies', effets: [{ type: 'soin', min: 100, max: 100 }] });
  const e = mk({ artisans: [{ id: 'p', classe: 'patissorcier', case: [0, 0], sorts: [soin] }], monstres: [{ id: 'm', case: [9, 9] }] });
  const p = C(e, 'p'); p.victuailles = 15; p.entame = 16;
  L(e, 'p', 'soin');
  assert.strictEqual(p.victuailles, p.victuaillesMax - 16);
});

// =====================================================================
// Zones
// =====================================================================
const ZG = faux(grille(21, 21));
const nz = (forme, t, min) => R.casesZone(ZG, { forme, taille: t, tailleMin: min || 0 }, [10, 4], [10, 10]).length;
[['croix', [5, 9, 13]], ['rond', [5, 13, 25]], ['anneau', [4, 8, 12]], ['ligne', [2, 3, 4]], ['travers', [3, 5, 7]],
 ['cone', [4, 9, 16]], ['demi-rond', [4, 9, 16]], ['carre', [9, 25, 49]]].forEach(([forme, n]) => {
  test('zone ' + forme + ' : ' + n.join(' / ') + ' cases (tailles 1 / 2 / 3)', () => {
    assert.deepStrictEqual([nz(forme, 1), nz(forme, 2), nz(forme, 3)], n);
  });
});
test('zone case : 1 case ; terrain : toutes les cases du sol', () => {
  assert.strictEqual(nz('case', 0), 1);
  assert.strictEqual(nz('terrain', 0), 441);
});
test('zones orientées : la ligne, le cône et le demi-rond partent vers l\'arrière (axe lanceur → cible)', () => {
  const l = R.casesZone(ZG, { forme: 'ligne', taille: 2 }, [10, 4], [10, 10]).map(z => z.case);
  assert.deepStrictEqual(l, [[10, 10], [10, 11], [10, 12]]);
  assert.ok(R.casesZone(ZG, { forme: 'demi-rond', taille: 3 }, [10, 4], [10, 10]).every(z => z.case[1] >= 10));
  assert.ok(R.casesZone(ZG, { forme: 'cone', taille: 3 }, [10, 4], [10, 10]).every(z => z.case[1] >= 10));
  assert.ok(R.casesZone(ZG, { forme: 'travers', taille: 2 }, [10, 4], [10, 10]).every(z => z.case[1] === 10));
});
test('zone : taille minimum (un rond de 2 sans son centre)', () => {
  assert.strictEqual(nz('rond', 2, 1), 12);
  assert.strictEqual(nz('croix', 2, 1), 8);
});
test('zone : le décor et le vide ne font pas partie de la zone', () => {
  assert.strictEqual(R.casesZone(faux(['.#.', '~..', '...']), { forme: 'rond', taille: 1 }, [2, 2], [1, 1]).length, 3);
});
test('zone : baisse de 15 % par case d\'éloignement, 3 fois au plus (55 %)', () => {
  const s = Sp({ zone: { forme: 'rond', taille: 4 }, effets: [D(100)] });
  const e = mk({ lignes: grille(14, 8), artisans: [{ id: 'a', case: [5, 0], sorts: [s] }],
    monstres: [0, 1, 2, 3, 4].map(i => ({ id: 'm' + i, case: [5 + i, 5] })) });
  const evs = de(L(e, 'a', 't', [5, 5]), 'degats');
  assert.deepStrictEqual([0, 1, 2, 3, 4].map(i => evs.find(x => x.cible === 'm' + i).valeur), [100, 85, 70, 55, 55]);
});
test('zone : « sans baisse »', () => {
  const s = Sp({ zone: { forme: 'rond', taille: 2, baisse: false }, effets: [D(100)] });
  const e = mk({ artisans: [{ id: 'a', case: [5, 0], sorts: [s] }], monstres: [{ id: 'm0', case: [5, 5] }, { id: 'm2', case: [7, 5] }] });
  assert.deepStrictEqual(de(L(e, 'a', 't', [5, 5]), 'degats').map(x => x.valeur), [100, 100]);
});
test('zone de dégâts : ne touche jamais les alliés ni le lanceur (décision 2)', () => {
  const s = Sp({ cible: 'soi', zone: { forme: 'rond', taille: 2 }, effets: [D(30)] });
  const e = mk({ artisans: [{ id: 'a', case: [5, 5], sorts: [s] }, { id: 'b', case: [6, 5] }], monstres: [{ id: 'm', case: [5, 6] }] });
  const evs = de(L(e, 'a', 't'), 'degats');
  assert.deepStrictEqual(evs.map(x => x.cible), ['m']);
  assert.strictEqual(C(e, 'a').victuailles, C(e, 'a').victuaillesMax);
});
test('zone de soutien : touche les alliés et le lanceur, pas les ennemis', () => {
  const s = Sp({ element: 'N', cible: 'soi', touche: 'allies', zone: { forme: 'rond', taille: 2, baisse: false }, effets: [{ type: 'soin', min: 10, max: 10 }] });
  const e = mk({ artisans: [{ id: 'a', classe: 'patissorcier', case: [5, 5], sorts: [s] }, { id: 'b', case: [6, 5] }], monstres: [{ id: 'm', case: [5, 6] }] });
  ['a', 'b', 'm'].forEach(id => { C(e, id).victuailles -= 20; });
  const evs = de(L(e, 'a', 't'), 'soin');
  assert.deepStrictEqual(evs.map(x => x.cible).sort(), ['a', 'b']);
});

// =====================================================================
// Poussée, attirance, Écrasement, bond, échange, dans-le-dos
// =====================================================================
const pousse = (n, extra = {}) => Sp(Object.assign({ id: 'p', cm: 1, cible: 'ennemi', rayon: { min: 1, max: 2 }, effets: [{ type: 'pousse', cases: n }] }, extra));
test('poussée : la cible s\'éloigne du lanceur, case par case', () => {
  const e = mk({ artisans: [{ id: 'a', case: [2, 5], sorts: [pousse(2)] }], monstres: [{ id: 'm', case: [3, 5] }] });
  const evs = L(e, 'a', 'p', [3, 5]);
  assert.deepStrictEqual(C(e, 'm').case, [5, 5]);
  assert.deepStrictEqual(de(evs, 'pousse')[0].chemin, [[3, 5], [4, 5], [5, 5]]);
  assert.strictEqual(de(evs, 'ecrasement').length, 0);
});
test('Écrasement (exemple 3.13) : Bouchevalier niveau 40, billot juste derrière, poussée de 2 → 44', () => {
  const e = mk({ lignes: ['..........', '....B.....', '..........'], artisans: [{ id: 'b', classe: 'bouchevalier', niveau: 40, case: [2, 1], sorts: [pousse(2)] }], monstres: [{ id: 'g', case: [3, 1] }] });
  const evs = L(e, 'b', 'p', [3, 1]);
  assert.strictEqual(de(evs, 'ecrasement')[0].valeur, 44);
  assert.strictEqual(de(evs, 'ecrasement')[0].cases, 2);
  const d = de(evs, 'degats')[0];
  assert.strictEqual(d.valeur, 44); assert.strictEqual(d.ecrasement, true); assert.strictEqual(d.element, null);
  assert.strictEqual(d.entame, 5);
  assert.deepStrictEqual(C(e, 'g').case, [3, 1]);
});
test('Écrasement : sans Conservation ; le combattant heurté en subit la moitié, rien au-delà', () => {
  const e = mk({ artisans: [{ id: 'b', niveau: 40, case: [2, 1], sorts: [pousse(2)] }], monstres: [{ id: 'g', case: [3, 1], conservation: { F: 50, T: 50 } }, { id: 'h', case: [5, 1] }, { id: 'k', case: [6, 1] }] });
  const evs = L(e, 'b', 'p', [3, 1]);
  assert.deepStrictEqual(C(e, 'g').case, [4, 1]);
  const d = de(evs, 'degats');
  assert.deepStrictEqual(d.map(x => [x.cible, x.valeur]), [['g', 22], ['h', 11]]);
});
test('Écrasement : un allié heurté ne prend rien (les dégâts ne touchent jamais les alliés)', () => {
  const e = mk({ artisans: [{ id: 'b', niveau: 40, case: [2, 1], sorts: [pousse(2)] }, { id: 'c', case: [4, 1] }], monstres: [{ id: 'g', case: [3, 1] }] });
  const evs = L(e, 'b', 'p', [3, 1]);
  assert.deepStrictEqual(de(evs, 'degats').map(x => x.cible), ['g']);
});
test('poussée : en diagonale à égalité parfaite, sinon sur l\'axe le plus long', () => {
  let e = mk({ artisans: [{ id: 'a', case: [2, 2], sorts: [pousse(1)] }], monstres: [{ id: 'm', case: [3, 3] }] });
  L(e, 'a', 'p', [3, 3]); assert.deepStrictEqual(C(e, 'm').case, [4, 4]);
  e = mk({ artisans: [{ id: 'a', case: [2, 2], sorts: [pousse(1, { rayon: { min: 1, max: 3 } })] }], monstres: [{ id: 'm', case: [4, 3] }] });
  L(e, 'a', 'p', [4, 3]); assert.deepStrictEqual(C(e, 'm').case, [5, 3]);
});
test('Planté : ni poussé, ni attiré, ni échangé', () => {
  const e = mk({ artisans: [{ id: 'a', case: [2, 5], sorts: [pousse(2), Sp({ id: 'at', cm: 1, cible: 'ennemi', effets: [{ type: 'attire', cases: 2 }] }), Sp({ id: 'ec', cm: 1, cible: 'ennemi', effets: [{ type: 'echange' }] })] }], monstres: [{ id: 'm', case: [3, 5] }] });
  C(e, 'm').etats.push({ etat: 'plante', tours: 2, couches: 1, source: 'm' });
  ['p', 'at', 'ec'].forEach(s => { const evs = L(e, 'a', s, [3, 5]); assert.strictEqual(de(evs, 'resiste').length, 1); });
  assert.deepStrictEqual(C(e, 'm').case, [3, 5]); assert.deepStrictEqual(C(e, 'a').case, [2, 5]);
});
test('attirance : la cible vient vers le lanceur et s\'arrête au contact', () => {
  const e = mk({ artisans: [{ id: 'a', case: [0, 5], sorts: [Sp({ id: 'at', cible: 'ennemi', effets: [{ type: 'attire', cases: 10 }] })] }], monstres: [{ id: 'm', case: [6, 5] }] });
  const evs = L(e, 'a', 'at', [6, 5]);
  assert.deepStrictEqual(C(e, 'm').case, [1, 5]); assert.strictEqual(de(evs, 'attire').length, 1);
});
test('ramène : attire un allié vers soi', () => {
  const e = mk({ artisans: [{ id: 'a', case: [2, 2], sorts: [Sp({ id: 'ra', element: 'N', cible: 'allie', touche: 'allies', effets: [{ type: 'ramene', cases: 2 }] })] }, { id: 'b', case: [6, 2] }], monstres: [{ id: 'm', case: [9, 9] }] });
  L(e, 'a', 'ra', [6, 2]);
  assert.deepStrictEqual(C(e, 'b').case, [4, 2]);
});
test('zone qui pousse : chaque cible s\'éloigne de la case visée, la plus éloignée d\'abord', () => {
  const s = Sp({ id: 'zp', zone: { forme: 'croix', taille: 1 }, effets: [{ type: 'pousse', cases: 1 }] });
  const e = mk({ artisans: [{ id: 'a', case: [0, 5], sorts: [s] }], monstres: [{ id: 'c', case: [5, 5] }, { id: 'd', case: [6, 5] }, { id: 'h', case: [5, 4] }] });
  L(e, 'a', 'zp', [5, 5]);
  assert.deepStrictEqual([C(e, 'c').case, C(e, 'd').case, C(e, 'h').case], [[6, 5], [7, 5], [5, 3]]);
});
test('un piège sur le chemin d\'une poussée l\'arrête et se déclenche (sans Écrasement)', () => {
  const piege = Sp({ id: 'pi', cm: 1, cible: 'caseLibre', effets: [{ type: 'pose', quoi: 'piege', effets: [D(10)] }] });
  const e = mk({ artisans: [{ id: 'a', case: [2, 5], sorts: [piege, pousse(3)] }], monstres: [{ id: 'm', case: [3, 5] }] });
  L(e, 'a', 'pi', [5, 5]);
  const evs = L(e, 'a', 'p', [3, 5]);
  assert.deepStrictEqual(C(e, 'm').case, [5, 5]);
  assert.strictEqual(de(evs, 'declenchement')[0].quoi, 'piege');
  assert.strictEqual(de(evs, 'degats')[0].valeur, 10);
  assert.strictEqual(de(evs, 'ecrasement').length, 0);
  assert.strictEqual(e.sol.length, 0);
});
test('bond : le lanceur va sur la case libre visée', () => {
  const bond = ESSAI.find(s => s.id === 'levainqueur.croute-que-croute');
  const e = mk({ artisans: [{ id: 'a', niveau: 7, case: [2, 2], sorts: [bond] }], monstres: [{ id: 'm', case: [9, 9] }] });
  const evs = L(e, 'a', bond.id, [4, 3]);
  assert.deepStrictEqual(C(e, 'a').case, [4, 3]);
  assert.deepStrictEqual(de(evs, 'bond')[0], { type: 'bond', id: 'a', de: [2, 2], vers: [4, 3] });
  assert.strictEqual(R.lancer(e, 'a', bond.id, [4, 4]).raison, 'Revient dans 2 tours');
});
test('échange : lanceur et cible échangent leurs cases', () => {
  const e = mk({ artisans: [{ id: 'a', case: [2, 2], sorts: [Sp({ id: 'ec', element: 'N', cible: 'combattant', effets: [{ type: 'echange' }] })] }], monstres: [{ id: 'm', case: [5, 2] }] });
  L(e, 'a', 'ec', [5, 2]);
  assert.deepStrictEqual([C(e, 'a').case, C(e, 'm').case], [[5, 2], [2, 2]]);
});
test('dans-le-dos : le lanceur passe derrière la cible, et « si dansLeDos » joue après', () => {
  const s = Sp({ id: 'dd', cible: 'ennemi', effets: [{ type: 'dans-le-dos' }, { type: 'si', condition: 'dansLeDos', effets: [D(50)] }] });
  const s2 = Sp({ id: 'nd', cible: 'ennemi', effets: [{ type: 'si', condition: 'dansLeDos', effets: [D(50)] }] });
  const e = mk({ artisans: [{ id: 'a', case: [5, 8], sorts: [s, s2] }], monstres: [{ id: 'm', case: [5, 5] }] });
  assert.deepStrictEqual(C(e, 'm').orientation, [0, 1]);
  assert.strictEqual(de(L(e, 'a', 'nd', [5, 5]), 'degats').length, 0);
  const evs = L(e, 'a', 'dd', [5, 5]);
  assert.deepStrictEqual(C(e, 'a').case, [5, 4]);
  assert.strictEqual(de(evs, 'degats')[0].valeur, 50);
  assert.ok(R.interne.dansLeDos([4, 4], C(e, 'm')));
  assert.ok(!R.interne.dansLeDos([4, 5], C(e, 'm')));
});

// =====================================================================
// Retraits de CM et de Pas
// =====================================================================
test('retraits : garantis, appliqués au prochain tour de la cible, plafonnés à 2 CM et 2 Pas', () => {
  const e = mk({ artisans: [{ id: 'a', case: [0, 0], sorts: [Sp({ id: 'rp', cm: 1, effets: [{ type: 'retire', quoi: 'pas', n: 3 }] }), Sp({ id: 'rc', cm: 1, effets: [{ type: 'retire', quoi: 'cm', n: 1 }] })] }], monstres: [{ id: 'm', case: [4, 0] }] });
  let evs = L(e, 'a', 'rp', [4, 0]);
  assert.deepStrictEqual(de(evs, 'retrait')[0], { type: 'retrait', cible: 'm', quoi: 'pas', n: 2, demande: 3, plafond: true });
  L(e, 'a', 'rc', [4, 0]); L(e, 'a', 'rc', [4, 0]); L(e, 'a', 'rc', [4, 0]);
  evs = passer(e);
  assert.deepStrictEqual([C(e, 'm').cm, C(e, 'm').pas], [4, 1]);
  assert.deepStrictEqual(de(evs, 'tour')[0].retraits, { cm: 2, pas: 2 });
  passer(e);
  L(e, 'a', 'rp', [4, 0]);
  passer(e);
  assert.strictEqual(C(e, 'm').pas, 1);
});
test('retraits : pendant son propre tour, ils s\'appliquent tout de suite', () => {
  const e = mk({ artisans: [{ id: 'a', case: [0, 0], sorts: [Sp({ id: 'rs', element: 'N', cm: 1, cible: 'soi', touche: 'allies', effets: [{ type: 'retire', quoi: 'pas', n: 1 }] })] }], monstres: [{ id: 'm', case: [4, 0] }] });
  L(e, 'a', 'rs');
  assert.strictEqual(C(e, 'a').pas, 2);
});
test('retraits : l\'état Ramolli compte dans le plafond', () => {
  const s = Sp({ id: 'ram', cm: 1, effets: [{ type: 'etat', etat: 'ramolli', tours: 1, couches: 2 }] });
  const r = Sp({ id: 'rp', cm: 1, effets: [{ type: 'retire', quoi: 'pas', n: 1 }] });
  const e = mk({ artisans: [{ id: 'a', case: [0, 0], sorts: [s, r] }], monstres: [{ id: 'm', case: [4, 0] }] });
  L(e, 'a', 'rp', [4, 0]); L(e, 'a', 'ram', [4, 0]);
  passer(e);
  assert.strictEqual(C(e, 'm').pas, 1);
});

// =====================================================================
// États
// =====================================================================
test('états : reposer remet la durée au maximum sans cumul ; Ramolli monte à 2 couches au plus', () => {
  const s = Sp({ id: 'en', cm: 1, effets: [{ type: 'etat', etat: 'enracine', tours: 1 }, { type: 'etat', etat: 'ramolli', tours: 2, couches: 1 }] });
  const e = mk({ artisans: [{ id: 'a', case: [0, 0], sorts: [s] }], monstres: [{ id: 'm', case: [4, 0] }] });
  L(e, 'a', 'en', [4, 0]); L(e, 'a', 'en', [4, 0]); L(e, 'a', 'en', [4, 0]);
  const m = C(e, 'm');
  assert.strictEqual(m.etats.filter(x => x.etat === 'enracine').length, 1);
  assert.strictEqual(m.etats.find(x => x.etat === 'ramolli').couches, 2);
});
test('états : ils décomptent à la fin du tour du porteur', () => {
  const e = mk({ artisans: [{ id: 'a', case: [0, 0], sorts: [Sp({ id: 'f', cm: 1, effets: [{ type: 'etat', etat: 'fume', tours: 2 }] })] }], monstres: [{ id: 'm', case: [4, 0] }] });
  L(e, 'a', 'f', [4, 0]);
  passer(e);
  assert.strictEqual(C(e, 'm').etats[0].tours, 2);
  const evs = passer(e);
  assert.strictEqual(C(e, 'm').etats[0].tours, 1);
  assert.strictEqual(de(evs, 'etat').length, 0);
  passer(e);
  const evs2 = passer(e);
  assert.strictEqual(C(e, 'm').etats.length, 0);
  assert.deepStrictEqual(de(evs2, 'etat')[0], { type: 'etat', action: 'fini', cible: 'm', etat: 'fume' });
});
test('Brûlé : perd des Victuailles au début de son tour (Flambée du poseur)', () => {
  const e = mk({ artisans: [{ id: 'a', case: [0, 0], niveau: 3, affinites: { F: 10 }, sorts: [Sp({ id: 'b', cm: 1, effets: [{ type: 'etat', etat: 'brule', tours: 2, couches: 2, valeur: 5 }] })] }], monstres: [{ id: 'm', case: [4, 0] }] });
  L(e, 'a', 'b', [4, 0]);
  const evs = passer(e);
  const d = de(evs, 'degats')[0];
  assert.strictEqual(d.cible, 'm'); assert.strictEqual(d.valeur, 11); assert.strictEqual(d.etat, 'brule');
});
test('Affiné : compteur +1 par tour passé (5 au plus) et « si cibleAffinee »', () => {
  const s = Sp({ id: 'af', cm: 1, effets: [{ type: 'etat', etat: 'affine', tours: 10 }, D(10), { type: 'si', condition: 'cibleAffinee', n: 1, effets: [D(20)] }] });
  const e = mk({ artisans: [{ id: 'a', case: [0, 0], sorts: [s] }], monstres: [{ id: 'm', case: [4, 0] }] });
  assert.deepStrictEqual(de(L(e, 'a', 'af', [4, 0]), 'degats').map(x => x.valeur), [10]);
  passer(e);
  passer(e);
  assert.strictEqual(C(e, 'm').etats[0].couches, 1);
  assert.deepStrictEqual(de(L(e, 'a', 'af', [4, 0]), 'degats').map(x => x.valeur), [10, 20]);
  for (let i = 0; i < 12; i++) passer(e);
  assert.strictEqual(C(e, 'm').etats.find(x => x.etat === 'affine').couches, 5);
});
test('Fève : celui qui fait tomber le porteur gagne 1 CM', () => {
  const e = mk({ artisans: [{ id: 'a', case: [0, 0], sorts: [Sp({ id: 'fe', cm: 1, effets: [{ type: 'etat', etat: 'feve', tours: 0 }] }), Sp({ id: 'k', cm: 2, effets: [D(500)] })] }], monstres: [{ id: 'm', case: [4, 0] }, { id: 'm2', case: [8, 8] }] });
  L(e, 'a', 'fe', [4, 0]);
  const evs = L(e, 'a', 'k', [4, 0]);
  assert.strictEqual(de(evs, 'gain-cm')[0].cause, 'feve');
  assert.strictEqual(C(e, 'a').cm, 4);
});
test('Marée : le Merlanceur commence en marée haute (+2 Rayon), puis alterne à chaque tour (+20 %)', () => {
  const e = mk({ artisans: [{ id: 'me', classe: 'merlanceur', case: [0, 0] }], monstres: [{ id: 'm', case: [4, 0] }] });
  const me = C(e, 'me');
  assert.ok(me.etats.some(x => x.etat === 'maree-haute'));
  assert.strictEqual(R.interne.caracEff(me, 'rayon'), 2);
  passer(e); const evs = passer(e);
  assert.deepStrictEqual(de(evs, 'maree')[0], { type: 'maree', id: 'me', etat: 'maree-basse' });
  assert.strictEqual(R.interne.caracEff(me, 'rayon'), 0);
  assert.strictEqual(R.interne.calculerDegats(e, me, { element: 'E' }, { element: 'E' }, C(e, 'm'), 0, 10, true, 1), 12);
  passer(e); passer(e);
  assert.ok(me.etats.some(x => x.etat === 'maree-haute'));
});
test('« si mareeHaute » et « si mareeBasse »', () => {
  const s = Sp({ id: 'ma', cm: 1, effets: [{ type: 'si', condition: 'mareeHaute', effets: [D(7)] }, { type: 'si', condition: 'mareeBasse', effets: [D(9)] }] });
  const e = mk({ artisans: [{ id: 'me', classe: 'merlanceur', case: [0, 0], sorts: [s] }], monstres: [{ id: 'm', case: [4, 0] }] });
  assert.deepStrictEqual(de(L(e, 'me', 'ma', [4, 0]), 'degats').map(x => x.valeur), [7]);
  passer(e); passer(e);
  assert.deepStrictEqual(de(L(e, 'me', 'ma', [4, 0]), 'degats').map(x => x.valeur), [10]);
});
test('Dérobé : invisible pour l\'ennemi (vue du camp, cible impossible), révélé quand il lance', () => {
  const e = mk({ artisans: [{ id: 'a', case: [0, 0], sorts: [Sp({ id: 'en', cible: 'ennemi', effets: [D(1)] })] }], monstres: [{ id: 'm', case: [4, 0], sorts: [Sp({ id: 'c', cible: 'ennemi', effets: [D(1)] })] }] });
  C(e, 'm').etats.push({ etat: 'derobe', tours: 3, couches: 1, source: 'm' });
  assert.strictEqual(R.lancer(e, 'a', 'en', [4, 0]).raison, 'Il faut viser un ennemi');
  assert.strictEqual(R.vuePour(e, 'artisans').combattants.find(c => c.id === 'm').case, null);
  assert.deepStrictEqual(R.vuePour(e, 'monstres').combattants.find(c => c.id === 'm').case, [4, 0]);
  passer(e);
  assert.deepStrictEqual(de(L(e, 'm', 'c', [0, 0]), 'revele')[0].case, [4, 0]);
});
test('états d\'un combattant tombé : ils s\'arrêtent (sauf la Fève)', () => {
  const s = Sp({ id: 'e2', cm: 1, effets: [{ type: 'etat', etat: 'ramolli', tours: 3 }, { type: 'etat', etat: 'feve', tours: 0 }] });
  const e = mk({ artisans: [{ id: 'a', case: [0, 0] }, { id: 'b', case: [1, 0], sorts: [s] }], monstres: [{ id: 'm', case: [4, 0], sorts: [Sp({ id: 'k', cible: 'ennemi', effets: [D(999)] })] }] });
  jusqua(e, 'b'); L(e, 'b', 'e2', [4, 0]);
  jusqua(e, 'm');
  const evs = L(e, 'm', 'k', [1, 0]);
  assert.ok(de(evs, 'tombe').some(x => x.id === 'b'));
  assert.deepStrictEqual(C(e, 'm').etats.map(x => x.etat), ['feve']);
});

// =====================================================================
// Au sol : nappes, pièges, fournées, graines, Ustensiles
// =====================================================================
const nappe = (decl, extra = {}) => Sp(Object.assign({ id: 'na', cm: 1, cible: 'case', effets: [{ type: 'pose', quoi: 'nappe', tours: 2, declenche: decl, zone: { forme: 'rond', taille: 1, baisse: false }, touche: 'ennemis', effets: [D(10)] }] }, extra));
test('nappe « debut » : agit sur qui commence son tour dedans', () => {
  const e = mk({ artisans: [{ id: 'a', case: [0, 0], sorts: [nappe('debut')] }], monstres: [{ id: 'm', case: [5, 5] }] });
  const evp = L(e, 'a', 'na', [5, 4]);
  assert.strictEqual(de(evp, 'pose')[0].cases.length, 5);
  const evs = passer(e);
  assert.strictEqual(de(evs, 'declenchement')[0].quoi, 'nappe');
  assert.strictEqual(de(evs, 'degats')[0].valeur, 10);
});
test('nappe « entree » : une fois par tour et par combattant', () => {
  const e = mk({ artisans: [{ id: 'a', case: [0, 0], sorts: [nappe('entree', { effets: [{ type: 'pose', quoi: 'nappe', tours: 3, declenche: 'entree', zone: { forme: 'ligne', taille: 2 }, touche: 'ennemis', effets: [D(10)] }] })] }], monstres: [{ id: 'm', case: [5, 9] }] });
  L(e, 'a', 'na', [5, 6]);
  passer(e);
  const evs = R.deplacer(e, 'm', [5, 6]).evenements;
  assert.strictEqual(de(evs, 'degats').length, 1);
  assert.deepStrictEqual(C(e, 'm').case, [5, 6]);
  passer(e); passer(e);
  const evs2 = R.deplacer(e, 'm', [4, 6]).evenements;
  assert.strictEqual(de(evs2, 'degats').length, 0);
  const evs3 = R.deplacer(e, 'm', [5, 6]).evenements;
  assert.strictEqual(de(evs3, 'degats').length, 1);
});
test('nappe « fin » : agit sur qui finit son tour dedans', () => {
  const e = mk({ artisans: [{ id: 'a', case: [0, 0], sorts: [nappe('fin')] }], monstres: [{ id: 'm', case: [5, 5] }] });
  L(e, 'a', 'na', [5, 5]);
  passer(e);
  const evs = passer(e);
  assert.strictEqual(de(evs, 'degats')[0].cible, 'm');
});
test('nappe : disparaît après N tours de son poseur ; une nappe de soutien touche les alliés', () => {
  const s = Sp({ id: 'fu', element: 'N', cm: 1, effets: [{ type: 'pose', quoi: 'nappe', tours: 1, declenche: 'debut', zone: { forme: 'case' }, touche: 'allies', effets: [{ type: 'etat', etat: 'glissant', tours: 1 }] }] });
  const e = mk({ artisans: [{ id: 'a', case: [0, 0], sorts: [s] }, { id: 'b', case: [1, 0] }], monstres: [{ id: 'm', case: [5, 5] }] });
  L(e, 'a', 'fu', [1, 0]);
  assert.deepStrictEqual(e.frise, ['a', 'm', 'b']);
  passer(e);
  const evs = passer(e);
  assert.ok(de(evs, 'etat').some(x => x.cible === 'b' && x.etat === 'glissant'));
  const evs2 = passer(e);
  assert.strictEqual(de(evs2, 'disparait')[0].raison, 'fini');
  assert.strictEqual(e.sol.length, 0);
});
test('piège : caché à l\'ennemi, il arrête la marche, se déclenche et disparaît', () => {
  const ab = ESSAI.find(s => s.id === 'traitreur.amuse-bouche');
  const e = mk({ artisans: [{ id: 't', classe: 'traitreur', case: [0, 0], sorts: [ab] }], monstres: [{ id: 'm', case: [2, 4] }] });
  L(e, 't', ab.id, [2, 2]);
  assert.strictEqual(R.vuePour(e, 'monstres').sol.length, 0);
  assert.strictEqual(R.vuePour(e, 'artisans').sol.length, 1);
  passer(e);
  assert.ok(R.deplacementsPossibles(e, 'm').some(x => x.case[0] === 2 && x.case[1] === 1));
  const evs = R.deplacer(e, 'm', [2, 1]).evenements;
  assert.deepStrictEqual(C(e, 'm').case, [2, 2]);
  assert.strictEqual(de(evs, 'declenchement')[0].quoi, 'piege');
  const d = de(evs, 'degats')[0].valeur;
  assert.ok(d >= 12 && d <= 19, d);
  assert.strictEqual(e.sol.length, 0);
  assert.strictEqual(C(e, 'm').pas, 1);
});
test('piège : 3 au plus par poseur, jamais deux sur une case', () => {
  const s = Sp({ id: 'pi', cm: 1, cible: 'caseLibre', effets: [{ type: 'pose', quoi: 'piege', effets: [D(1)] }] });
  const e = mk({ artisans: [{ id: 't', case: [0, 0], sorts: [s] }], monstres: [{ id: 'm', case: [9, 9] }] });
  L(e, 't', 'pi', [2, 0]);
  assert.strictEqual(R.lancer(e, 't', 'pi', [2, 0]).raison, 'Il y a déjà un piège ici');
  L(e, 't', 'pi', [3, 0]); L(e, 't', 'pi', [4, 0]);
  assert.strictEqual(R.lancer(e, 't', 'pi', [5, 0]).raison, 'Déjà 3 pièges posés');
});
test('« si buffetComplet » : 3 pièges posés', () => {
  const s = Sp({ id: 'pi', cm: 1, cible: 'caseLibre', effets: [{ type: 'pose', quoi: 'piege', effets: [D(1)] }] });
  const b = Sp({ id: 'bu', cm: 1, cible: 'soi', touche: 'allies', element: 'N', effets: [{ type: 'si', condition: 'buffetComplet', effets: [{ type: 'gainCM', n: 1, qui: 'soi' }] }] });
  const e = mk({ artisans: [{ id: 't', case: [0, 0], sorts: [s, b] }], monstres: [{ id: 'm', case: [9, 9] }] });
  L(e, 't', 'pi', [2, 0]); L(e, 't', 'pi', [3, 0]);
  assert.strictEqual(de(L(e, 't', 'bu'), 'gain-cm').length, 0);
  L(e, 't', 'pi', [4, 0]);
  assert.strictEqual(de(L(e, 't', 'bu'), 'gain-cm').length, 1);
});
test('fournée : éclate au début du tour de son poseur après N tours, dans sa zone', () => {
  const s = Sp({ id: 'fo', cm: 1, cible: 'caseLibre', effets: [{ type: 'pose', quoi: 'fournee', tours: 2, zone: { forme: 'croix', taille: 1, baisse: false }, touche: 'ennemis', effets: [D(15)] }] });
  const e = mk({ artisans: [{ id: 'a', case: [0, 0], sorts: [s] }], monstres: [{ id: 'm', case: [5, 5] }] });
  L(e, 'a', 'fo', [5, 4]);
  passer(e);
  let evs = passer(e);
  assert.deepStrictEqual(de(evs, 'cuisson')[0].reste, 1);
  assert.strictEqual(de(evs, 'degats').length, 0);
  passer(e);
  evs = passer(e);
  assert.strictEqual(de(evs, 'declenchement')[0].quoi, 'fournee');
  assert.strictEqual(de(evs, 'degats')[0].valeur, 15);
  assert.strictEqual(e.sol.length, 0);
});
test('fournée qui occupe sa case (Four à pain) : bloque la marche et la vue ; cassée, elle n\'éclate pas', () => {
  const four = Object.assign({}, ESSAI.find(s => s.id === 'levainqueur.four-a-pain'), { niveau: 1 });
  const e = mk({ artisans: [{ id: 'a', case: [0, 5], sorts: [four] }], monstres: [{ id: 'm', case: [4, 5], sorts: [Sp({ id: 'k', cible: 'combattant', effets: [D(40, 'T')] })] }] });
  L(e, 'a', four.id, [2, 5]);
  const ent = e.combattants.find(c => c.genre === 'ustensile');
  assert.ok(ent && ent.victuailles === 30);
  assert.strictEqual(R.ligneDeVue(e, [0, 5], [4, 5]), false);
  assert.ok(!e.frise.includes(ent.id));
  passer(e);
  assert.ok(!R.deplacementsPossibles(e, 'm').some(x => x.case[0] === 2 && x.case[1] === 5));
  const evs = L(e, 'm', 'k', [2, 5]);
  assert.ok(de(evs, 'disparait').some(x => x.raison === 'casse'));
  assert.strictEqual(e.sol.length, 0);
  passer(e); passer(e);
  const evs2 = passer(e);
  assert.strictEqual(de(evs2, 'declenchement').length, 0);
});
test('fournée « cuitTout » (extension) : toutes les fournées du poseur éclatent d\'un coup', () => {
  const f = Sp({ id: 'fo', cm: 1, cible: 'caseLibre', effets: [{ type: 'pose', quoi: 'fournee', tours: 5, zone: { forme: 'case' }, effets: [D(10)] }] });
  const tout = Sp({ id: 'gf', cm: 1, cible: 'soi', touche: 'ennemis', effets: [{ type: 'pose', quoi: 'fournee', cuitTout: true, tours: 0, zone: { forme: 'case' }, effets: [] }] });
  const e = mk({ artisans: [{ id: 'a', case: [0, 0], sorts: [f, tout] }], monstres: [{ id: 'm', case: [5, 5] }, { id: 'n', case: [6, 6] }] });
  L(e, 'a', 'fo', [5, 4]); L(e, 'a', 'fo', [6, 5]);
  C(e, 'm').case = [5, 4]; C(e, 'n').case = [6, 5];
  const evs = L(e, 'a', 'gf');
  assert.strictEqual(de(evs, 'declenchement').filter(x => x.quoi === 'fournee').length, 3);
  assert.strictEqual(de(evs, 'degats').length, 2);
});
test('graine : devient un Commis au début du prochain tour du poseur, si la case est libre ; sinon elle attend', () => {
  const g = Sp({ id: 'gr', element: 'N', cm: 1, cible: 'caseLibre', effets: [{ type: 'pose', quoi: 'graine', commis: { nom: 'Radis', victuailles: 20, cm: 3, pas: 3, sorts: [] } }] });
  const e = mk({ artisans: [{ id: 'a', case: [0, 0], sorts: [g] }], monstres: [{ id: 'm', case: [3, 3] }] });
  L(e, 'a', 'gr', [3, 2]);
  passer(e);
  R.deplacer(e, 'm', [3, 2]);
  let evs = passer(e);
  assert.strictEqual(de(evs, 'invoque').length, 0);
  passer(e);
  R.deplacer(e, 'm', [3, 4]);
  evs = passer(e);
  const inv = de(evs, 'invoque')[0];
  assert.ok(inv); assert.deepStrictEqual(inv.case, [3, 2]);
  assert.strictEqual(e.frise[1], inv.id);
});
test('Ustensile : occupe une case, bloque la marche et la vue, a des Victuailles, hors frise', () => {
  const u = Sp({ id: 'us', element: 'N', cm: 1, cible: 'caseLibre', effets: [{ type: 'pose', quoi: 'ustensile', victuailles: 25, tours: 0, effets: [] }] });
  const e = mk({ lignes: ['.....'], artisans: [{ id: 'a', case: [0, 0], sorts: [u] }], monstres: [{ id: 'm', case: [4, 0], sorts: [Sp({ id: 'k', cible: 'combattant', effets: [D(30, 'T')] })] }] });
  L(e, 'a', 'us', [2, 0]);
  const ent = e.combattants.find(c => c.genre === 'ustensile');
  assert.strictEqual(ent.victuailles, 25);
  assert.strictEqual(R.ligneDeVue(e, [0, 0], [4, 0]), false);
  assert.strictEqual(e.frise.includes(ent.id), false);
  passer(e);
  assert.ok(!R.deplacementsPossibles(e, 'm').some(x => x.case[0] < 2));
  L(e, 'm', 'k', [2, 0]);
  assert.strictEqual(ent.vivant, false);
  assert.ok(R.deplacementsPossibles(e, 'm').some(x => x.case[0] === 1));
});
test('tomber : tout ce qu\'il a posé disparaît, ses Commis aussi', () => {
  const s = [nappe('debut'), Sp({ id: 'pi', cm: 1, cible: 'caseLibre', effets: [{ type: 'pose', quoi: 'piege', effets: [D(1)] }] }),
    Sp({ id: 'co', element: 'N', cm: 1, cible: 'caseLibre', effets: [{ type: 'invoque', commis: { nom: 'Mitron', victuailles: 20, cm: 3, pas: 3, sorts: [] } }] })];
  const e = mk({ artisans: [{ id: 'a', case: [0, 0] }, { id: 'b', case: [1, 0], sorts: s }], monstres: [{ id: 'm', case: [6, 5], sorts: [Sp({ id: 'k', cible: 'ennemi', effets: [D(9999)] })] }] });
  jusqua(e, 'b');
  L(e, 'b', 'na', [5, 5]); L(e, 'b', 'pi', [6, 6]); L(e, 'b', 'co', [1, 1]);
  assert.strictEqual(e.sol.length, 2);
  jusqua(e, 'm');
  const evs = L(e, 'm', 'k', [1, 0]);
  assert.strictEqual(e.sol.length, 0);
  assert.strictEqual(de(evs, 'tombe').length, 2);
  assert.ok(e.combattants.filter(c => c.genre === 'commis').every(c => !c.vivant));
});

// =====================================================================
// Les Commis
// =====================================================================
const commis = Sp({ id: 'co', element: 'N', cm: 2, cible: 'caseLibre', relance: 4, effets: [{ type: 'invoque', commis: { nom: 'Mitron', victuailles: 30, cm: 3, pas: 3, ouverture: 0, rideau: 3, fauxFuyant: 3,
  sorts: [{ id: 'mitron.frappe', nom: 'Frappe', element: 'T', cm: 3, rayon: { min: 1, max: 9 }, vue: false, cible: 'ennemi', parTour: 1, effets: [{ type: 'degats', element: 'T', min: 12, max: 12, maitre: [12, 12] }] }] } }] });
test('Commis : Victuailles × (1 + niveau / 120), joue juste après son artisan, par l\'IA', () => {
  const e = mk({ artisans: [{ id: 'a', niveau: 60, case: [0, 0], sorts: [commis] }], monstres: [{ id: 'm', case: [5, 5] }] });
  const evs = L(e, 'a', 'co', [1, 0]);
  const k = C(e, de(evs, 'invoque')[0].id);
  assert.strictEqual(k.victuailles, 45);
  assert.deepStrictEqual(e.frise, ['a', k.id, 'm']);
  assert.strictEqual(k.controle, 'ia');
  passer(e);
  assert.strictEqual(R.actif(e).id, k.id);
  // Décision 9 (rangs, « règle générique, pas de données par sort ») : le sort d'appel (niveau 1) est au rang 2 au niveau 60,
  // et les dégâts du Commis font partie de ce sort : 12 × 1,15 = 14, puis × (1 + 60 / 120) = 21 (avant la correction : 18, sans rang).
  assert.strictEqual(de(L(e, k.id, 'mitron.frappe', [5, 5]), 'degats')[0].valeur, 21);
});
test('Commis : pas plus que la caractéristique Commis (1 au départ)', () => {
  const s = Object.assign({}, commis, { relance: 0 });
  const e = mk({ artisans: [{ id: 'a', case: [0, 0], sorts: [s] }], monstres: [{ id: 'm', case: [5, 5] }] });
  L(e, 'a', 'co', [1, 0]);
  assert.strictEqual(R.lancer(e, 'a', 'co', [2, 0]).raison, 'Plus de place pour un Commis');
});
test('Commis : il disparaît quand son artisan tombe ; il ne compte pas pour la victoire', () => {
  const e = mk({ artisans: [{ id: 'a', case: [0, 0], sorts: [commis] }], monstres: [{ id: 'm', case: [5, 5], sorts: [Sp({ id: 'k', cible: 'ennemi', effets: [D(9999)] })] }] });
  L(e, 'a', 'co', [1, 0]);
  jusqua(e, 'm');
  const evs = L(e, 'm', 'k', [0, 0]);
  assert.strictEqual(de(evs, 'tombe').length, 2);
  assert.strictEqual(R.resultat(e).vainqueur, 'monstres');
});

// =====================================================================
// Rebond, renforce, si, bonus, gainCM
// =====================================================================
test('rebond : sur l\'ennemi le plus proche à « rayon » cases au plus, à « part » %', () => {
  const s = Sp({ id: 'rb', cible: 'ennemi', effets: [D(40), { type: 'rebond', fois: 2, rayon: 3, part: 50 }] });
  const e = mk({ artisans: [{ id: 'a', case: [0, 5], sorts: [s] }], monstres: [{ id: 'm1', case: [5, 5] }, { id: 'm2', case: [7, 5] }, { id: 'm3', case: [9, 5] }, { id: 'm4', case: [5, 9] }] });
  const evs = L(e, 'a', 'rb', [5, 5]);
  assert.deepStrictEqual(de(evs, 'degats').map(x => [x.cible, x.valeur, x.rebond]), [['m1', 40, 0], ['m2', 20, 1], ['m3', 20, 2]]);
  assert.strictEqual(de(evs, 'rebond').length, 2);
});
test('renforce « element:F » +50 % pour 1 lancer ; « famille:fournee » pendant 2 tours', () => {
  const r = Sp({ id: 'rf', element: 'N', cm: 1, cible: 'soi', touche: 'allies', effets: [{ type: 'renforce', quoi: 'element:F', valeur: 50, tours: 3, fois: 1 }] });
  const f = Sp({ id: 'fl', cm: 1, effets: [D(20)] });
  const e = mk({ artisans: [{ id: 'a', case: [0, 0], sorts: [r, f] }], monstres: [{ id: 'm', case: [4, 0] }] });
  L(e, 'a', 'rf');
  assert.strictEqual(de(L(e, 'a', 'fl', [4, 0]), 'degats')[0].valeur, 30);
  assert.strictEqual(de(L(e, 'a', 'fl', [4, 0]), 'degats')[0].valeur, 20);
  const r2 = Sp({ id: 'rf2', element: 'N', cm: 1, cible: 'soi', touche: 'allies', effets: [{ type: 'renforce', quoi: 'famille:fournee', valeur: 100, tours: 2, fois: 0 }] });
  const fo = Sp({ id: 'fo', cm: 1, cible: 'caseLibre', effets: [{ type: 'pose', quoi: 'fournee', tours: 1, zone: { forme: 'case' }, effets: [D(10)] }] });
  const e2 = mk({ artisans: [{ id: 'a', case: [0, 0], sorts: [r2, fo] }], monstres: [{ id: 'm', case: [4, 1] }] });
  L(e2, 'a', 'rf2'); L(e2, 'a', 'fo', [4, 0]);
  C(e2, 'm').case = [4, 0];
  passer(e2);
  assert.strictEqual(de(passer(e2), 'degats')[0].valeur, 20);
});
test('« si cibleBlessee » (moins de 50 % des Victuailles)', () => {
  const s = Sp({ id: 'cb', cm: 1, effets: [D(10), { type: 'si', condition: 'cibleBlessee', effets: [D(30)] }] });
  const e = mk({ artisans: [{ id: 'a', case: [0, 0], sorts: [s] }], monstres: [{ id: 'm', case: [4, 0], victuailles: 100 }] });
  assert.deepStrictEqual(de(L(e, 'a', 'cb', [4, 0]), 'degats').map(x => x.valeur), [10]);
  C(e, 'm').victuailles = 55;
  assert.deepStrictEqual(de(L(e, 'a', 'cb', [4, 0]), 'degats').map(x => x.valeur), [10, 30]);
});
test('« si cibleTombe » : après les dégâts du sort ; gainCM sur soi', () => {
  const s = Sp({ id: 'ct', cm: 2, effets: [D(50), { type: 'si', condition: 'cibleTombe', effets: [{ type: 'gainCM', n: 2, qui: 'soi' }] }] });
  const e = mk({ artisans: [{ id: 'a', case: [0, 0], sorts: [s] }], monstres: [{ id: 'm', case: [4, 0], victuailles: 30 }, { id: 'n', case: [5, 0], victuailles: 300 }] });
  L(e, 'a', 'ct', [5, 0]);
  assert.strictEqual(C(e, 'a').cm, 4);
  L(e, 'a', 'ct', [4, 0]);
  assert.strictEqual(C(e, 'a').cm, 4);
});
test('« si auContact »', () => {
  const s = Sp({ id: 'ac', cm: 1, cible: 'ennemi', effets: [D(10), { type: 'si', condition: 'auContact', effets: [D(10)] }] });
  const e = mk({ artisans: [{ id: 'a', case: [0, 0], sorts: [s] }], monstres: [{ id: 'm', case: [1, 0] }, { id: 'n', case: [3, 0] }] });
  assert.strictEqual(de(L(e, 'a', 'ac', [1, 0]), 'degats').length, 2);
  assert.strictEqual(de(L(e, 'a', 'ac', [3, 0]), 'degats').length, 1);
});
test('bonus sur soi : Pas et CM tout de suite ; fini à la fin du tour pour une durée de 1', () => {
  const s = Sp({ id: 'bo', element: 'N', cm: 1, cible: 'soi', touche: 'allies', effets: [{ type: 'bonus', carac: 'pas', valeur: 2, tours: 1, qui: 'soi' }] });
  const e = mk({ artisans: [{ id: 'a', case: [0, 0], sorts: [s] }], monstres: [{ id: 'm', case: [9, 9] }] });
  L(e, 'a', 'bo');
  assert.strictEqual(C(e, 'a').pas, 5);
  passer(e); passer(e);
  assert.strictEqual(C(e, 'a').pas, 3);
});
test('bonus « allies » et gainCM « allies » : tous les alliés (le gain des autres vient à leur tour)', () => {
  const s = Sp({ id: 'ba', element: 'N', cm: 1, cible: 'soi', touche: 'allies', effets: [{ type: 'bonus', carac: 'levure', valeur: 20, tours: 2, qui: 'allies' }, { type: 'gainCM', n: 1, qui: 'allies' }] });
  const e = mk({ artisans: [{ id: 'a', case: [0, 0], sorts: [s] }, { id: 'b', case: [5, 0] }], monstres: [{ id: 'm', case: [9, 9] }] });
  L(e, 'a', 'ba');
  assert.strictEqual(R.interne.caracEff(C(e, 'b'), 'levure'), 20);
  assert.strictEqual(C(e, 'a').cm, 6);
  jusqua(e, 'b');
  assert.strictEqual(C(e, 'b').cm, 7);
});

// =====================================================================
// Tomber, fin du combat, Addition
// =====================================================================
test('rend son tablier : il quitte la grille, sa case se libère', () => {
  const e = mk({ artisans: [{ id: 'a', case: [0, 0], sorts: [Sp({ effets: [D(999)] })] }], monstres: [{ id: 'm', case: [1, 0] }, { id: 'n', case: [9, 9] }] });
  const evs = L(e, 'a', 't', [1, 0]);
  assert.deepStrictEqual(de(evs, 'tombe')[0], { type: 'tombe', id: 'm', genre: 'monstre', case: [1, 0], par: 'a' });
  assert.strictEqual(C(e, 'm').case, null);
  assert.ok(R.deplacer(e, 'a', [1, 0]).ok);
});
function finir(o) {
  const e = mk(Object.assign({ artisans: [{ id: 'a', case: [0, 0], niveau: 10, sorts: [Sp({ cible: 'soi', zone: { forme: 'terrain' }, effets: [D(9999)] })] }] }, o));
  const evs = L(e, e.frise[0], 't');
  return { e, evs, fin: de(evs, 'fin')[0] };
}
test('victoire : l\'Addition donne XP, Blé et objets', () => {
  const { e, fin } = finir({ monstres: [{ id: 'g', case: [5, 5], niveau: 2, xp: 25, ble: 4, objets: [{ id: 'sur', taux: 100 }, { id: 'jamais', taux: 0 }] }, { id: 'h', case: [6, 5], niveau: 3, xp: 35, ble: 5 }] });
  assert.strictEqual(fin.vainqueur, 'artisans');
  assert.strictEqual(fin.addition.xp.a, 60);
  assert.strictEqual(fin.addition.ble.a, 9);
  assert.deepStrictEqual(fin.addition.objets.a.map(o => o.id), ['sur']);
  assert.strictEqual(e.phase, 'fin');
  assert.strictEqual(R.resultat(e).vainqueur, 'artisans');
});
test('XP : coefficient de groupe, part du joueur, écart de niveau (−5 % par niveau, 20 % au moins), Savoir-faire', () => {
  const sp = Sp({ cible: 'soi', zone: { forme: 'terrain' }, effets: [D(9999)] });
  const { fin } = finir({ artisans: [{ id: 'a', case: [0, 0], niveau: 10, sorts: [sp] }, { id: 'b', case: [1, 0], niveau: 30 }], monstres: [{ id: 'g', case: [5, 5], niveau: 3, xp: 60 }] });
  assert.strictEqual(fin.addition.xp.a, 17);
  assert.strictEqual(fin.addition.xp.b, 10);
  const { fin: f2 } = finir({ artisans: [{ id: 'a', case: [0, 0], niveau: 15, capital: { savoirFaire: 10 }, sorts: [sp] }], monstres: [{ id: 'g', case: [5, 5], niveau: 3, xp: 100 }] });
  assert.strictEqual(f2.addition.xp.a, 94);
});
test('objets : taux × (100 + Ristourne) / 100, artisans servis par Ristourne décroissante', () => {
  const sp = Sp({ cible: 'soi', zone: { forme: 'terrain' }, effets: [D(9999)] });
  const { fin } = finir({ artisans: [{ id: 'a', case: [0, 0], sorts: [sp] }, { id: 'b', case: [1, 0], equipement: { ristourne: 100 } }], monstres: [{ id: 'g', case: [5, 5], objets: [{ id: 'x', taux: 50 }] }] });
  assert.deepStrictEqual([fin.addition.objets.a.length, fin.addition.objets.b.length], [0, 1]);
});
test('défaite : la moitié de l\'XP des monstres tombés, ni objet ni Blé', () => {
  const e = mk({ artisans: [{ id: 'a', case: [0, 0], sorts: [Sp({ cible: 'ennemi', effets: [D(9999)] })] }],
    monstres: [{ id: 'g', case: [5, 5], xp: 20, objets: [{ id: 'x', taux: 100 }] }, { id: 'h', case: [6, 6], xp: 50, sorts: [Sp({ id: 'k', cible: 'ennemi', effets: [D(9999)] })] }] });
  L(e, 'a', 't', [5, 5]);
  jusqua(e, 'h');
  const fin = de(L(e, 'h', 'k', [0, 0]), 'fin')[0];
  assert.strictEqual(fin.vainqueur, 'monstres');
  assert.strictEqual(fin.addition.xp.a, 10);
  assert.strictEqual(fin.addition.ble.a, 0);
  assert.deepStrictEqual(fin.addition.objets.a, []);
});
test('abandon : défaite sans butin ; ensuite toute action est refusée', () => {
  const e = mk({ artisans: [{ id: 'a', case: [0, 0] }], monstres: [{ id: 'g', case: [5, 5] }] });
  const fin = de(R.abandonner(e, 'a').evenements, 'fin')[0];
  assert.strictEqual(fin.vainqueur, 'monstres'); assert.strictEqual(fin.addition.xp.a, 0);
  assert.strictEqual(R.finDuTour(e, 'a').raison, 'Le combat est terminé');
  assert.strictEqual(R.actif(e), null);
});

// =====================================================================
// La Commande
// =====================================================================
function avecCommande(idc, o = {}) {
  return mk(Object.assign({ artisans: [{ id: 'a', case: [0, 0], sorts: [Sp({ id: 'k', cm: 1, cible: 'ennemi', effets: [D(9999)] }), Sp({ id: 'p', cm: 1, cible: 'ennemi', effets: [D(1)] })] }],
    monstres: [{ id: 'g', case: [1, 0] }, { id: 'h', case: [5, 5] }], options: { commande: idc } }, o));
}
const respectee = e => e.commande.respectee;
test('Commande : deux proposées au hasard pendant la Mise en place, bonus de 25 à 100 %', () => {
  const e = R.creerCombat({ carte: M.carte(), graine: 9, artisans: [{ id: 'a', classe: 'levainqueur', niveau: 6 }], monstres: M.groupe('fourneau', 'mie-et-pate') });
  assert.strictEqual(e.commande.proposees.length, 2);
  assert.notStrictEqual(e.commande.proposees[0], e.commande.proposees[1]);
  e.commande.proposees.forEach(k => { assert.ok(R.COMMANDES[k]); assert.ok(e.commande.bonus[k] >= 25 && e.commande.bonus[k] <= 100); });
  assert.strictEqual(R.choisirCommande(e, 'n-existe-pas').ok, false);
  assert.ok(R.choisirCommande(e, e.commande.proposees[1]).ok);
  assert.ok(R.choisirBonusCommande(e, 'a', 'ristourne').ok);
  assert.strictEqual(R.choisirBonusCommande(e, 'a', 'or').ok, false);
  assert.strictEqual(Object.keys(R.COMMANDES).length, 8);
});
test('Commande « Sans contact » : finir son tour à côté d\'un ennemi l\'annule', () => {
  const e = avecCommande('sans-contact');
  const evs = passer(e);
  assert.strictEqual(respectee(e), false);
  assert.strictEqual(de(evs, 'commande')[0].respectee, false);
});
test('Commande « Fait minute » : gagner avant la fin de la 5e manche', () => {
  const e = avecCommande('fait-minute');
  for (let i = 0; i < 12; i++) passer(e);
  assert.strictEqual(e.manche, 5); assert.strictEqual(respectee(e), true);
  passer(e); passer(e); passer(e);
  assert.strictEqual(e.manche, 6); assert.strictEqual(respectee(e), false);
});
test('Commande « À la chaîne » : faire tomber les ennemis dans l\'ordre indiqué', () => {
  const e = avecCommande('a-la-chaine', { monstres: [{ id: 'g', case: [1, 0] }, { id: 'h', case: [5, 5] }, { id: 'i', case: [4, 5] }] });
  e.commande.ordre = ['g', 'h', 'i']; e.commande.prochain = 0;
  C(e, 'a').cm = 10;
  L(e, 'a', 'k', [1, 0]); assert.strictEqual(respectee(e), true);
  L(e, 'a', 'k', [4, 5]); assert.strictEqual(respectee(e), false);
});
test('Commande « Fait main » : chaque ennemi tombe sous un Coup d\'outil', () => {
  const outil = Object.assign(O.pour('bouchevalier'), { rayon: { min: 1, max: 12 }, effets: [D(9999)] });
  const e = avecCommande('fait-main', { artisans: [{ id: 'a', classe: 'bouchevalier', case: [0, 0], sorts: [outil, Sp({ id: 'k', cm: 1, cible: 'ennemi', effets: [D(9999)] })] }] });
  C(e, 'a').cm = 20;
  L(e, 'a', 'bouchevalier.coup-d-outil', [1, 0]); assert.strictEqual(respectee(e), true);
  L(e, 'a', 'k', [5, 5]); assert.strictEqual(respectee(e), false);
});
test('Commande « Sans sel » : aucun soin (le Pain de route compte)', () => {
  const e = avecCommande('sans-sel');
  C(e, 'a').victuailles = 40;
  assert.ok(R.utiliserPainDeRoute(e, 'a').ok);
  assert.strictEqual(respectee(e), false);
});
test('Commande « Sur le plan de travail » : au plus 1 Pas par tour', () => {
  const e = avecCommande('plan-de-travail', { artisans: [{ id: 'a', case: [5, 5] }] });
  R.deplacer(e, 'a', [5, 6]); assert.strictEqual(respectee(e), true);
  R.deplacer(e, 'a', [5, 7]); assert.strictEqual(respectee(e), false);
});
test('Commande « Une seule cuisson » : jamais deux fois le même sort dans un tour', () => {
  const e = avecCommande('une-seule-cuisson');
  L(e, 'a', 'p', [1, 0]); assert.strictEqual(respectee(e), true);
  L(e, 'a', 'p', [1, 0]); assert.strictEqual(respectee(e), false);
});
test('Commande « Service en salle » : jamais deux débuts de tour sur la même case', () => {
  const e = avecCommande('service-en-salle', { artisans: [{ id: 'a', case: [5, 5] }] });
  R.deplacer(e, 'a', [5, 6]); passer(e); jusqua(e, 'a');
  assert.strictEqual(respectee(e), true);
  passer(e); jusqua(e, 'a');
  assert.strictEqual(respectee(e), false);
});
test('Commande respectée : bonus de Savoir-faire sur l\'XP de l\'Addition', () => {
  const e = avecCommande('une-seule-cuisson', { artisans: [{ id: 'a', case: [0, 0], niveau: 5, sorts: [Sp({ cible: 'soi', zone: { forme: 'terrain' }, effets: [D(9999)] })] }], monstres: [{ id: 'g', case: [5, 5], niveau: 2, xp: 100 }] });
  const b = e.commande.bonus['une-seule-cuisson'];
  const fin = de(L(e, 'a', 't'), 'fin')[0];
  assert.strictEqual(fin.addition.xp.a, Math.floor(100 * (1 + b / 100) + 1e-9));
  assert.strictEqual(fin.addition.commande.respectee, true);
});

// =====================================================================
// Rangs des sorts (décision 9)
// =====================================================================
test('rangs : rang 2 cinquante niveaux après le déblocage, rang 3 cent niveaux après (plafonné à 200)', () => {
  assert.deepStrictEqual([R.rangSort(1, 50), R.rangSort(1, 51), R.rangSort(1, 100), R.rangSort(1, 101)], [1, 2, 2, 3]);
  assert.deepStrictEqual([R.rangSort(120, 169), R.rangSort(120, 170), R.rangSort(120, 199), R.rangSort(120, 200)], [1, 2, 2, 3]);
  assert.deepStrictEqual([R.rangSort(150, 199), R.rangSort(200, 200)], [1, 3]);
});
test('rangs : × 1,15 au rang 2 ; × 1,30 et relance − 1 au rang 3 (dégâts, soins, boucliers)', () => {
  const s = Sp({ relance: 2, effets: [{ type: 'degats', element: 'F', min: 10, max: 14, maitre: [13, 17] }, { type: 'bouclier', valeur: 20, tours: 2 }] });
  const r2 = R.sortAuRang(s, 2), r3 = R.sortAuRang(s, 3);
  assert.deepStrictEqual([r2.effets[0].min, r2.effets[0].max, r2.effets[0].maitre], [12, 16, [15, 20]]);
  assert.strictEqual(r2.effets[1].valeur, 23); assert.strictEqual(r2.relance, 2);
  assert.deepStrictEqual([r3.effets[0].min, r3.effets[0].max, r3.effets[0].maitre], [13, 18, [17, 22]]);
  assert.strictEqual(r3.relance, 1);
  assert.strictEqual(R.sortAuRang(Sp({ relance: 0 }), 3).relance, 0);
});
test('rangs : appliqués à la création du combat ; un sort pas encore débloqué est écarté', () => {
  const e = mk({ artisans: [{ id: 'a', case: [0, 0], niveau: 51, sorts: ESSAI.filter(s => s.classe === 'levainqueur') }], monstres: [{ id: 'm', case: [9, 9] }] });
  const a = C(e, 'a');
  const mr = a.sorts.find(s => s.id === 'levainqueur.mie-raille');
  assert.strictEqual(mr.rang, 2); assert.strictEqual(mr.effets[0].min, 12);
  assert.ok(!a.sorts.some(s => s.id === 'levainqueur.four-a-pain'));
  assert.ok(e.avertissements.some(m => /Four à pain/.test(m)));
});
test('grimoire : un seul sort par emplacement (le sort de base OU sa déclinaison)', () => {
  const e = mk({ artisans: [{ id: 'a', case: [0, 0], niveau: 7, sorts: ESSAI.filter(s => s.classe === 'levainqueur' && s.emplacement <= 3) }], monstres: [{ id: 'm', case: [9, 9] }] });
  assert.strictEqual(C(e, 'a').sorts.length, 3);
  assert.strictEqual(e.avertissements.filter(m => /deux sorts pour l'emplacement/.test(m)).length, 3);
});

// =====================================================================
// Pain de route (décision 3)
// =====================================================================
test('Pain de route : 2 CM, soigne 12 + 2 × niveau / 10, une fois par tour, 3 par combat', () => {
  const e = mk({ artisans: [{ id: 'a', case: [0, 0], niveau: 6 }], monstres: [{ id: 'm', case: [9, 9] }] });
  const a = C(e, 'a');
  a.victuailles = 50;
  const evs = R.utiliserPainDeRoute(e, 'a').evenements;
  assert.strictEqual(de(evs, 'soin')[0].valeur, 13);
  assert.deepStrictEqual([a.victuailles, a.cm, a.pain], [63, 4, 2]);
  assert.strictEqual(R.utiliserPainDeRoute(e, 'a').raison, 'Déjà mangé ce tour');
  passer(e); passer(e); assert.ok(R.utiliserPainDeRoute(e, 'a').ok);
  passer(e); passer(e); assert.ok(R.utiliserPainDeRoute(e, 'a').ok);
  passer(e); passer(e); assert.strictEqual(R.utiliserPainDeRoute(e, 'a').raison, 'Plus de Pain de route');
  assert.strictEqual(R.valeurPain(100), 32);
  assert.strictEqual(R.valeurPain(1), 12);
});
test('Pain de route : refusé si les Victuailles sont pleines ou s\'il manque des CM ; pas pour un monstre', () => {
  const e = mk({ artisans: [{ id: 'a', case: [0, 0], sorts: [Sp({ cm: 5, effets: [D(1)] })] }], monstres: [{ id: 'm', case: [5, 5] }] });
  assert.strictEqual(R.utiliserPainDeRoute(e, 'a').raison, 'Victuailles déjà pleines');
  L(e, 'a', 't', [5, 5]); C(e, 'a').victuailles = 10;
  assert.strictEqual(R.utiliserPainDeRoute(e, 'a').raison, 'Pas assez de coups de main (2 CM)');
  passer(e);
  assert.strictEqual(R.utiliserPainDeRoute(e, 'm').raison, 'Seuls les artisans ont un Sac');
});

// =====================================================================
// Caractéristiques dérivées d'un artisan
// =====================================================================
test('caractéristiques : 6 CM et 3 Pas, +1 CM au niveau 100 ; Victuailles 90 + 5 × niveau + 2 par point', () => {
  const a1 = R.deriverArtisan({ niveau: 1 }), a100 = R.deriverArtisan({ niveau: 100, capital: { victuailles: 10 } });
  assert.deepStrictEqual([a1.cm, a1.pas, a1.victuailles, a1.rideau, a1.fauxFuyant, a1.ouverture, a1.commis], [6, 3, 95, 5, 5, 100, 1]);
  assert.deepStrictEqual([a100.cm, a100.victuailles], [7, 610]);
  assert.strictEqual(R.deriverArtisan({ niveau: 99 }).cm, 6);
});
test('effets secondaires des affinités (table de constantes, décision 5)', () => {
  const a = R.deriverArtisan({ niveau: 24, affinites: { T: 25, S: 30, C: 10, F: 40, E: 9 } });
  assert.deepStrictEqual([a.rideau, a.fauxFuyant, a.ouverture, a.coupDeMaitre, a.victuailles], [7, 8, 120, 2, 90 + 120 + 4]);
  assert.deepStrictEqual(Object.keys(R.CONST.AFFINITES_SECONDAIRES).sort(), ['C', 'E', 'F', 'S', 'T']);
});
test('capital : 5 points par niveau ; paliers 1, 2, 3 points ; dépassement refusé', () => {
  assert.deepStrictEqual([80, 81, 160, 161, 170].map(R.coutAffinite), [80, 82, 240, 243, 270]);
  assert.strictEqual(R.deriverArtisan({ niveau: 3, affinites: { F: 6 }, capital: { savoirFaire: 4 } }).capital.reste, 0);
  assert.strictEqual(R.deriverArtisan({ niveau: 1, capital: { savoirFaire: 0 } }).savoirFaire, 0);
  assert.throws(() => R.creerCombat({ carte: { lignes: grille(3, 3) }, artisans: [{ id: 'a', classe: 'levainqueur', niveau: 2, affinites: { F: 6 }, case: [0, 0] }] }), /capital dépassé/);
});
test('plafonds d\'équipement : 11 CM, 6 Pas, +5 Rayon, 5 Commis, Conservation 40 %', () => {
  const a = R.deriverArtisan({ niveau: 1, equipement: { cm: 10, pas: 10, rayon: 9, commis: 10, conservation: { T: 90 } } });
  assert.deepStrictEqual([a.cm, a.pas, a.rayon, a.commis, a.conservation.T], [11, 6, 5, 5, 40]);
});

// =====================================================================
// IA
// =====================================================================
test('IA : fait tomber une cible quand un sort le peut', () => {
  const e = mk({ artisans: [{ id: 'a', case: [5, 5] }, { id: 'b', case: [5, 8] }], monstres: [Object.assign(M.fiche('grumeau'), { id: 'g', case: [7, 5] })] });
  C(e, 'a').victuailles = 5;
  jusqua(e, 'g');
  const r = R.iaJoue(e, 'g');
  assert.ok(r.ok);
  assert.ok(de(r.evenements, 'tombe').some(x => x.id === 'a'));
});
test('IA « colle » : finit son tour au contact de l\'artisan le plus fragile', () => {
  const g = Object.assign(M.fiche('grumeau'), { id: 'g', case: [5, 5], cm: 0 });
  const e = mk({ artisans: [{ id: 'fort', case: [5, 7] }, { id: 'faible', case: [8, 6] }], monstres: [g] });
  C(e, 'faible').victuailles = 30;
  jusqua(e, 'g');
  R.iaJoue(e, 'g');
  assert.strictEqual(R.distance(C(e, 'g').case, C(e, 'faible').case), 1);
});
test('IA « tire » : finit à 3 à 5 cases, hors du contact', () => {
  const e = mk({ artisans: [{ id: 'a', case: [5, 5] }], monstres: [Object.assign(M.fiche('mie-tron'), { id: 't', case: [5, 6], ouverture: 0 })] });
  jusqua(e, 't');
  const r = R.iaJoue(e, 't');
  const d = R.distance(C(e, 't').case, C(e, 'a').case);
  assert.ok(d >= 3 && d <= 5, d);
  assert.ok(de(r.evenements, 'lancer').length >= 1);
});
test('IA : joue tout son tour puis passe la main', () => {
  const e = mk({ artisans: [{ id: 'a', case: [5, 5] }], monstres: [Object.assign(M.fiche('grumeau'), { id: 'g', case: [5, 8] })] });
  jusqua(e, 'g');
  const r = R.iaJoue(e, 'g');
  assert.ok(de(r.evenements, 'fin-tour').some(x => x.id === 'g'));
  assert.strictEqual(R.actif(e).id, 'a');
  assert.ok(de(r.evenements, 'degats').length >= 1);
});
test('IA : refusée si ce n\'est pas le tour du combattant', () => {
  const e = mk({ artisans: [{ id: 'a', case: [5, 5] }], monstres: [{ id: 'g', case: [5, 8] }] });
  assert.strictEqual(R.iaJoue(e, 'g').ok, false);
});
test('IA : ne voit pas les pièges ennemis et marche dessus', () => {
  const ab = Object.assign({}, ESSAI.find(s => s.id === 'traitreur.amuse-bouche'));
  const e = mk({ lignes: ['...........'], artisans: [{ id: 't', classe: 'traitreur', case: [0, 0], sorts: [ab] }], monstres: [Object.assign(M.fiche('grumeau'), { id: 'g', case: [5, 0] })] });
  L(e, 't', ab.id, [3, 0]);
  jusqua(e, 'g');
  const r = R.iaJoue(e, 'g');
  assert.ok(de(r.evenements, 'declenchement').some(x => x.quoi === 'piege'));
});
test('IA : mange son Pain de route quand ses Victuailles sont basses et qu\'il n\'a rien à frapper', () => {
  const e = mk({ artisans: [{ id: 'a', case: [0, 0], controle: 'ia', niveau: 6 }], monstres: [{ id: 'g', case: [11, 11] }] });
  C(e, 'a').victuailles = 20;
  const r = R.iaJoue(e, 'a');
  assert.strictEqual(de(r.evenements, 'pain').length, 1);
});

// =====================================================================
// Hasard déterministe, état JSON
// =====================================================================
function combatComplet(graine) {
  const sorts = ESSAI.filter(s => s.classe === 'levainqueur' && !s.declinaisonDe && s.niveau <= 6).concat([O.pour('levainqueur')]);
  const e = R.creerCombat({ carte: M.carte(), graine, artisans: [{ id: 'moi', classe: 'levainqueur', niveau: 6, affinites: { F: 15, T: 10 }, sorts, controle: 'ia' }], monstres: M.groupe('fourneau', 'le-chef') });
  R.iaPlace(e, 'moi');
  const evs = R.commencer(e).evenements;
  for (let i = 0; i < 400 && e.phase === 'combat'; i++) evs.push(...R.iaJoue(e, R.actif(e).id).evenements);
  return { e, evs };
}
test('hasard : même graine, même combat (événements et état identiques)', () => {
  const a = combatComplet(42), b = combatComplet(42);
  assert.strictEqual(JSON.stringify(a.evs), JSON.stringify(b.evs));
  assert.strictEqual(geler(a.e), geler(b.e));
  assert.strictEqual(a.e.phase, 'fin');
  const c = combatComplet(43);
  assert.notStrictEqual(JSON.stringify(c.evs), JSON.stringify(a.evs));
});
test('état JSON : on le sauve en plein combat et on reprend à l\'identique', () => {
  const sorts = ESSAI.filter(s => s.classe === 'levainqueur' && !s.declinaisonDe && s.niveau <= 6).concat([O.pour('levainqueur')]);
  const e = R.creerCombat({ carte: M.carte(), graine: 77, artisans: [{ id: 'moi', classe: 'levainqueur', niveau: 6, sorts }], monstres: M.groupe('fourneau', 'mie-et-pate') });
  R.commencer(e);
  for (let i = 0; i < 5; i++) R.iaJoue(e, R.actif(e).id);
  const copie = JSON.parse(JSON.stringify(e));
  assert.deepStrictEqual(copie, e);
  const suite = x => { const ev = []; for (let i = 0; i < 400 && x.phase === 'combat'; i++) ev.push(...R.iaJoue(x, R.actif(x).id).evenements); return JSON.stringify(ev); };
  assert.strictEqual(suite(copie), suite(e));
});

// =====================================================================
// Aperçus
// =====================================================================
test('apercuSort : « tombe » sûr, possible, ou non', () => {
  const mr = ESSAI.find(s => s.id === 'levainqueur.mie-raille');
  const e = mk({ artisans: [{ id: 'a', case: [0, 0], niveau: 7, affinites: { F: 30 }, sorts: [mr] }], monstres: ['g1', 'g2', 'g3'].map((id, i) => Object.assign(M.fiche('grumeau'), { id, case: [3 + i, 0] })) });
  C(e, 'g1').victuailles = 15; C(e, 'g2').victuailles = 20; C(e, 'g3').victuailles = 30;
  C(e, 'g2').case = [0, 3]; C(e, 'g3').case = [2, 2];
  assert.strictEqual(R.apercuSort(e, 'a', mr.id, [3, 0]).cibles[0].tombe, 'sur');
  assert.strictEqual(R.apercuSort(e, 'a', mr.id, [0, 3]).cibles[0].tombe, 'possible');
  assert.strictEqual(R.apercuSort(e, 'a', mr.id, [2, 2]).cibles[0].tombe, null);
});
test('apercuSort : zone, cibles, rien ne change dans l\'état (ni le hasard)', () => {
  const s = Sp({ zone: { forme: 'croix', taille: 1 }, effets: [{ type: 'degats', element: 'F', min: 10, max: 20, maitre: [25, 30] }, { type: 'pousse', cases: 1 }], maitre: 10 });
  const e = mk({ artisans: [{ id: 'a', case: [0, 5], sorts: [s] }], monstres: [{ id: 'm', case: [5, 5] }, { id: 'n', case: [6, 5] }] });
  const avant = geler(e);
  const ap = R.apercuSort(e, 'a', 't', [5, 5]);
  assert.strictEqual(geler(e), avant);
  assert.strictEqual(ap.zone.length, 5);
  assert.deepStrictEqual(ap.cibles.find(c => c.id === 'm').degats, { min: 10, max: 20, maitreMin: 25, maitreMax: 30 });
  assert.deepStrictEqual(ap.cibles.find(c => c.id === 'n').degats, { min: 8, max: 17, maitreMin: 21, maitreMax: 25 });
  assert.ok(ap.cibles.find(c => c.id === 'n').effets.some(x => x.type === 'pousse'));
});
test('apercuSort : la raison du refus (Rayon, vue, service, cible, relance)', () => {
  const s1 = Sp({ id: 's1', cm: 1, parTour: 1, parCible: 0, rayon: { min: 1, max: 4 }, vue: true, effets: [D(1)] });
  const s2 = Sp({ id: 's2', cm: 1, parCible: 1, effets: [D(1)] });
  const s3 = Sp({ id: 's3', cm: 1, relance: 2, effets: [D(1)] });
  const e = mk({ lignes: ['.......', '...#...', '.......'], artisans: [{ id: 'a', case: [1, 1], sorts: [s1, s2, s3] }], monstres: [{ id: 'm', case: [5, 1] }, { id: 'n', case: [1, 2] }] });
  assert.strictEqual(R.apercuSort(e, 'a', 's1', [6, 1]).raison, 'Hors du Rayon');
  assert.strictEqual(R.apercuSort(e, 'a', 's1', [5, 1]).raison, 'Pas de vue');
  L(e, 'a', 's1', [1, 2]);
  assert.strictEqual(R.apercuSort(e, 'a', 's1', [1, 2]).raison, 'Plus de service pour ce tour');
  L(e, 'a', 's2', [1, 2]);
  assert.strictEqual(R.apercuSort(e, 'a', 's2', [1, 2]).raison, 'Déjà servi à cette cible');
  L(e, 'a', 's3', [1, 2]);
  assert.strictEqual(R.apercuSort(e, 'a', 's3', [1, 2]).raison, 'Revient dans 2 tours');
});
test('casesVisables : pour chaque case du Rayon, visable ou cachée, et pourquoi', () => {
  const s = Sp({ id: 'v', cible: 'ennemi', rayon: { min: 1, max: 5 }, vue: true, effets: [D(1)] });
  const e = mk({ lignes: ['.......', '...#...', '.......'], artisans: [{ id: 'a', case: [1, 1], sorts: [s] }], monstres: [{ id: 'm', case: [5, 1] }, { id: 'n', case: [1, 2] }] });
  const v = R.casesVisables(e, 'a', 'v');
  const k = (x, y) => v.cases.find(c => c.case[0] === x && c.case[1] === y);
  assert.deepStrictEqual(k(5, 1), { case: [5, 1], vue: false, visable: false, raison: 'Pas de vue' });
  assert.deepStrictEqual(k(1, 2), { case: [1, 2], vue: true, visable: true, raison: null });
  assert.deepStrictEqual(k(2, 0), { case: [2, 0], vue: true, visable: false, raison: 'Il faut viser un ennemi' });
  assert.ok(!v.cases.some(c => c.case[0] === 3 && c.case[1] === 1));
  assert.strictEqual(v.disponible, true);
});
test('barre : chaque sort avec sa disponibilité, sa raison et son Rayon effectif', () => {
  const e = mk({ artisans: [{ id: 'a', case: [0, 0], equipement: { rayon: 1 }, sorts: [Sp({ id: 'b1', cm: 1, parTour: 1, rayon: { min: 1, max: 3, modifiable: true }, effets: [D(1)] })] }], monstres: [{ id: 'm', case: [2, 0] }] });
  L(e, 'a', 'b1', [2, 0]);
  const b = R.barre(e, 'a')[0];
  assert.deepStrictEqual([b.disponible, b.raison, b.rayon.max, b.lancesCeTour], [false, 'Plus de service pour ce tour', 4, 1]);
});

// =====================================================================
// Données : outils, monstres, sorts d'essai, vérificateur
// =====================================================================
const contexte = { window: {} }; contexte.window = contexte; vm.createContext(contexte);
vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'donnees.js'), 'utf8'), contexte);
const CLASSES = contexte.ORVANE.CLASSES;
test('outils : un Coup d\'outil par classe (emplacement 0, élément de l\'outil, jamais N), outil de donnees.js', () => {
  assert.strictEqual(CLASSES.length, 8);
  CLASSES.forEach(cl => {
    const o = O.pour(cl.id);
    assert.strictEqual(o.emplacement, 0); assert.strictEqual(o.outil, cl.outil); assert.strictEqual(o.classe, cl.id);
    assert.notStrictEqual(o.element, 'N'); assert.ok(['F', 'E', 'T', 'S', 'C'].includes(o.element));
    assert.ok(o.cm >= 3 && o.cm <= 5); assert.ok(o.effets.some(b => b.type === 'degats' && b.element === o.element));
    assert.deepStrictEqual(R.verifierSort(o), []);
  });
});
test('outils : les formes du point 15 (Rouleau en travers, Fouet en croix, Couperet gros maître, Couteau 2 par tour…)', () => {
  const n = id => R.casesZone(ZG, O.pour(id).zone, [10, 9], [10, 10]).length;
  assert.strictEqual(n('levainqueur'), 3);
  assert.strictEqual(O.pour('patissorcier').zone.forme, 'croix');
  assert.strictEqual(O.pour('bouchevalier').maitre, 25);
  assert.strictEqual(O.pour('traitreur').parTour, 2);
  assert.deepStrictEqual([O.pour('merlanceur').rayon.min, O.pour('merlanceur').rayon.max], [2, 5]);
  assert.strictEqual(n('legumancien'), 2); assert.strictEqual(n('pateladin'), 2);
  assert.ok(O.pour('fromagicien').effets.some(b => b.type === 'pousse'));
  assert.deepStrictEqual([O.pour('fromagicien').rayon.min, O.pour('fromagicien').rayon.max], [1, 2]);
  CLASSES.forEach(cl => { if (cl.id !== 'traitreur') assert.strictEqual(O.pour(cl.id).parTour, 1); });
});
test('Pain de route : la fiche de outils.js reprend les constantes du moteur', () => {
  const P = O.PAIN_DE_ROUTE, C2 = R.CONST.PAIN_DE_ROUTE;
  assert.deepStrictEqual([P.cm, P.parTour, P.parCombat, P.soin.base, P.soin.facteurNiveau, P.soin.diviseurNiveau], [C2.cm, C2.parTour, C2.parCombat, C2.base, C2.facteurNiveau, C2.diviseurNiveau]);
});
test('monstres : Grumeau et Mie-tron conformes à la partie 3.22', () => {
  // Victuailles baissées de 35 % le 14 novembre (décision de l'utilisateur : des combats plus courts au début) : 52 → 34, 40 → 26
  const g = M.fiche('grumeau'), t = M.fiche('mie-tron');
  assert.deepStrictEqual([g.niveau, g.victuailles, g.cm, g.pas, g.ouverture, g.rideau, g.fauxFuyant, g.conservation.F, g.conservation.E, g.xp, g.ble, g.comportement], [2, 34, 4, 3, 80, 5, 0, -20, 30, 25, 4, 'colle']);
  assert.deepStrictEqual([t.niveau, t.victuailles, t.cm, t.pas, t.ouverture, t.rideau, t.fauxFuyant, t.conservation.T, t.conservation.S, t.xp, t.ble, t.comportement], [3, 26, 5, 3, 130, 0, 8, -20, 20, 35, 5, 'tire']);
  const cp = g.sorts[0], pc = g.sorts[1], mi = t.sorts[0], pf = t.sorts[1];
  assert.deepStrictEqual([cp.cm, cp.rayon.max, cp.effets[0].min, cp.effets[0].max, cp.effets[0].element, cp.parTour], [3, 1, 8, 11, 'T', 1]);
  assert.deepStrictEqual([pc.cm, pc.rayon.min, pc.rayon.max, pc.effets[0].etat, pc.effets[0].tours, pc.relance], [2, 1, 2, 'ramolli', 1, 2]);
  assert.deepStrictEqual([mi.cm, mi.rayon.min, mi.rayon.max, mi.vue, mi.effets[0].min, mi.effets[0].max, mi.effets[0].element, mi.parTour], [2, 2, 5, true, 6, 9, 'F', 2]);
  assert.deepStrictEqual([pf.cm, pf.rayon.min, pf.rayon.max, pf.effets[0].etat, pf.effets[0].tours, pf.relance], [3, 1, 3, 'fume', 1, 3]);
});
test('monstres : le Grumeau chef, plus gros, mène son groupe ; XP, Blé et objets pour tous', () => {
  const c = M.fiche('grumeau-chef'), g = M.fiche('grumeau');
  assert.ok(c.chef && c.taille > g.taille && c.victuailles > g.victuailles && c.xp > g.xp);
  Object.values(M.FICHES).forEach(f => { assert.ok(f.xp > 0 && f.ble > 0 && f.objets.length > 0); f.sorts.forEach(s => assert.deepStrictEqual(R.verifierSort(s), [])); });
  M.GROUPES.fourneau.forEach(gr => assert.ok(gr.membres.length >= 1 && gr.membres.length <= 2));
  assert.deepStrictEqual(M.prevision('fourneau', 'le-chef').xp, 95);
});
test('sorts d\'essai : conformes au contrat (vérificateur), dont les 3 exemples du rapport', () => {
  ESSAI.forEach(s => assert.deepStrictEqual(R.verifierSort(s), [], s.id));
  ['levainqueur.mie-raille', 'levainqueur.four-a-pain', 'bouchevalier.coup-de-jarret'].forEach(id => assert.ok(ESSAI.some(s => s.id === id)));
});
test('vérificateur : repère les fautes du contrat', () => {
  const p = R.verifierSort({ id: 'x.y', classe: 'levainqueur', nom: 'Faute', element: 'N', cm: 7, niveau: 10, rayon: { min: 1, max: 2 }, cible: 'ennemi', touche: 'tous', maitre: 30,
    effets: [{ type: 'degats', element: 'F', min: 1, max: 2 }, { type: 'soin', min: 1, max: 1 }, { type: 'etat', etat: 'sommeil' }, { type: 'vol' }] });
  ['7 CM avant le niveau 100', 'touche doit valoir', 'un sort N ne fait pas de dégâts', 'sans aucune limite', 'soin hors Pâtissorcier', 'état inconnu', 'brique inconnue', 'maitre hors de 0 à 25', 'autre élément']
    .forEach(m => assert.ok(p.some(x => x.includes(m)), m));
  assert.ok(R.verifierSort(Sp({ effets: [{ type: 'bond' }], maitre: 5 })).some(x => x.includes('maitre doit valoir 0')));
});
test('API : enveloppe UMD (module node, ORVANE.Regles dans un navigateur)', () => {
  const ctx = {}; ctx.self = ctx; vm.createContext(ctx);
  ['regles.js', 'monstres.js', 'outils.js', 'sorts-essai.js'].forEach(f => vm.runInContext(fs.readFileSync(path.join(__dirname, f), 'utf8'), ctx));
  assert.strictEqual(typeof ctx.ORVANE.Regles.creerCombat, 'function');
  assert.ok(ctx.ORVANE.Monstres.FICHES.grumeau && ctx.ORVANE.Outils.pour && ctx.ORVANE.SORTS_ESSAI.length);
});

// =====================================================================
// Corrections après les deux relectures (tests adverses et conformité)
// =====================================================================
test('touche (décision 2) : un sort de soutien sans « touche » agit sur l\'allié ; un sort de dégâts touche toujours les ennemis', () => {
  const GL = Sp({ id: 'gl', element: 'N', cm: 1, cible: 'allie', parTour: 1, effets: [{ type: 'bouclier', valeur: 20, tours: 2 }, { type: 'etat', etat: 'nappe', tours: 2 }] });
  delete GL.touche;
  const DER = Sp({ id: 'der', element: 'C', cm: 1, cible: 'soi', effets: [{ type: 'etat', etat: 'derobe', tours: 1 }] });
  delete DER.touche;
  const MAL = Sp({ id: 'mal', touche: 'allies', parTour: 1, zone: { forme: 'rond', taille: 1 }, effets: [D(30)] });
  assert.strictEqual(R.normaliserSort(GL).touche, 'allies');
  assert.strictEqual(R.normaliserSort(MAL).touche, 'ennemis');
  assert.strictEqual(R.normaliserSort(Sp({ id: 'pc', touche: undefined, cible: 'ennemi', effets: [{ type: 'etat', etat: 'ramolli', tours: 1 }] })).touche, 'ennemis');
  const e = mk({ artisans: [{ id: 'a', classe: 'patissorcier', case: [5, 5], sorts: [GL, DER, MAL] }, { id: 'b', case: [5, 6] }], monstres: [{ id: 'm', case: [6, 5] }] });
  L(e, 'a', 'gl', [5, 6]);
  assert.strictEqual(C(e, 'b').boucliers.length, 1);
  L(e, 'a', 'der', [5, 5]);
  assert.ok(C(e, 'a').etats.some(x => x.etat === 'derobe'));
  L(e, 'a', 'mal', [5, 5]);
  assert.deepStrictEqual([C(e, 'a').victuailles, C(e, 'b').victuailles, C(e, 'm').victuailles < 200], [95, 95, true]);
  // le vérificateur prévient : un sort de soutien écrit avec « ennemis » ne ferait rien
  assert.ok(R.verifierSort(Object.assign({}, GL, { touche: 'ennemis' })).some(x => /sort de soutien touche les alliés/.test(x)));
});
test('vuePour : rien ne trahit la case d\'un ennemi Dérobé ; la graine du hasard et le compteur ne partent pas au client', () => {
  const e = mk({ artisans: [{ id: 'a', case: [2, 2] }], monstres: [{ id: 'm', case: [6, 7] }] });
  passer(e); R.deplacer(e, 'm', [6, 8]);
  C(e, 'm').etats.push({ etat: 'derobe', tours: 2, couches: 1, source: 'm' });
  const v = R.vuePour(e, 'artisans'), m = v.combattants.find(c => c.id === 'm');
  assert.deepStrictEqual([m.case, m.orientation, m.derniereCaseDebut, m.tour.caseDebut, m.tour.pasMarches, m.cache], [null, null, null, null, 0, true]);
  assert.ok(!('alea' in v) && !('compteur' in v));
  assert.deepStrictEqual(R.vuePour(e, 'monstres').combattants.find(c => c.id === 'm').case, [6, 8]);
  assert.ok(R.apercuSort(v, 'm', 'x', [0, 0]).ok === false);   // une vue reste lisible par le moteur (refus propre, pas d'exception)
});
test('evenementsPour : sans le chemin d\'un Dérobé, sans les pièges de l\'autre camp ; son propre camp voit tout', () => {
  const DER = Sp({ id: 'der', element: 'C', cm: 1, cible: 'soi', touche: 'allies', effets: [{ type: 'etat', etat: 'derobe', tours: 2 }] });
  const PG = Sp({ id: 'pg', element: 'T', cible: 'caseLibre', parTour: 2, effets: [{ type: 'pose', quoi: 'piege', effets: [D(5, 'T')] }] });
  const e = mk({ artisans: [{ id: 'a', case: [0, 0], sorts: [DER, PG] }], monstres: [{ id: 'm', case: [9, 9] }] });
  const evs = L(e, 'a', 'der', [0, 0]).concat(L(e, 'a', 'pg', [3, 3])).concat(R.deplacer(e, 'a', [0, 2]).evenements);
  const pourM = R.evenementsPour(e, evs, 'monstres'), pourA = R.evenementsPour(e, evs, 'artisans');
  assert.strictEqual(de(pourM, 'deplacement').length, 0, 'chemin du Dérobé');
  assert.strictEqual(de(pourM, 'pose').length, 0, 'pose du piège');
  assert.ok(de(pourM, 'lancer').filter(x => x.sortId === 'pg').every(x => x.case === null && x.cache));
  assert.ok(de(pourM, 'etat').some(x => x.etat === 'derobe'), 'on voit qu\'il se dérobe (sans sa case)');
  assert.deepStrictEqual(pourA, evs);
  assert.ok(!JSON.stringify(pourM).includes('[3,3]') && !JSON.stringify(pourM).includes('[0,2]'));
});
test('renforce « famille:fournee » : un renfort d\'un lancer ou d\'un tour vaut aussi quand la fournée éclate plus tard', () => {
  const PF = ESSAI.find(s => s.id === 'levainqueur.petite-fournee');
  const coup = rf => {
    const sorts = [PF]; if (rf) sorts.push(Sp({ id: 'rf', element: 'N', cm: 1, cible: 'soi', touche: 'allies', parTour: 1, effets: [Object.assign({ type: 'renforce', quoi: 'famille:fournee', valeur: 100 }, rf)] }));
    const e = mk({ graine: 4, artisans: [{ id: 'a', case: [0, 0], sorts }], monstres: [{ id: 'm', case: [4, 0], victuailles: 500, pas: 0 }] });
    if (rf) L(e, 'a', 'rf');
    L(e, 'a', 'levainqueur.petite-fournee', [3, 0]); passer(e); passer(e);
    return 500 - C(e, 'm').victuailles;
  };
  const sans = coup(null);
  assert.ok(sans > 0);
  [{ fois: 1, tours: 3 }, { tours: 1 }, { tours: 2 }].forEach(rf => assert.ok(coup(rf) >= 2 * sans - 1, JSON.stringify(rf) + ' : ' + coup(rf) + ' contre ' + sans));
});
test('aperçu : une fournée qui éclate tout de suite (ou un piège atteint) ne tire jamais au hasard, et montre sa fourchette maître', () => {
  const F0 = Sp({ id: 'f0', cible: 'case', parTour: 2, effets: [{ type: 'pose', quoi: 'fournee', tours: 0, maitre: 15, zone: { forme: 'case' }, effets: [{ type: 'degats', element: 'F', min: 20, max: 30, maitre: [25, 38] }] }] });
  const vus = new Set();
  [3, 4, 5, 6].forEach(g => {
    const e = mk({ graine: g, artisans: [{ id: 'a', case: [0, 0], sorts: [F0] }], monstres: [{ id: 'm', case: [4, 0] }] });
    const avant = geler(e), ap = R.apercuSort(e, 'a', 'f0', [4, 0]);
    assert.strictEqual(geler(e), avant);
    vus.add(JSON.stringify(ap.cibles[0].degats));
    assert.strictEqual(ap.chanceMaitrePose, 15);
  });
  assert.deepStrictEqual([...vus], [JSON.stringify({ min: 20, max: 30, maitreMin: 25, maitreMax: 38 })]);
});
test('Brûlé (partie 3.16, « sans cumul, sauf mention ») : relancer remet la durée sans ajouter de couche ; la brique dit les couches', () => {
  const B1 = Sp({ id: 'b1', cm: 1, cible: 'ennemi', parTour: 3, effets: [{ type: 'etat', etat: 'brule', tours: 2, couches: 1 }] });
  const B2 = Sp({ id: 'b2', cm: 1, cible: 'ennemi', parTour: 3, effets: [{ type: 'etat', etat: 'brule', tours: 2, couches: 2 }] });
  const e = mk({ artisans: [{ id: 'a', case: [0, 0], sorts: [B1, B2] }], monstres: [{ id: 'm', case: [4, 0] }] });
  L(e, 'a', 'b1', [4, 0]); L(e, 'a', 'b1', [4, 0]);
  assert.strictEqual(C(e, 'm').etats.find(x => x.etat === 'brule').couches, 1);
  L(e, 'a', 'b2', [4, 0]); L(e, 'a', 'b1', [4, 0]);
  assert.strictEqual(C(e, 'm').etats.find(x => x.etat === 'brule').couches, 2);
});
test('abandon en groupe : celui qui abandonne quitte le service (il compte comme tombé, rien à l\'Addition), les autres continuent', () => {
  const e = mk({ artisans: [{ id: 'a', case: [0, 0] }, { id: 'b', case: [1, 0], sorts: [Sp({ cm: 1, parTour: 9, effets: [D(500)] })] }], monstres: [{ id: 'm', case: [5, 5], xp: 100, ble: 10 }] });
  assert.strictEqual(R.actif(e).id, 'a');
  const evs = R.abandonner(e, 'a').evenements;
  assert.ok(de(evs, 'quitte').length === 1 && de(evs, 'tombe').some(x => x.id === 'a'));
  assert.strictEqual(e.phase, 'combat');
  jusqua(e, 'b'); L(e, 'b', 't', [5, 5]);
  assert.strictEqual(e.resultat.vainqueur, 'artisans');
  assert.deepStrictEqual([e.resultat.addition.xp.a, e.resultat.addition.ble.a, e.resultat.addition.ble.b], [0, 0, 10]);
  assert.ok(e.resultat.addition.xp.b > 0);
  const s = mk({ artisans: [{ id: 'a', case: [0, 0] }, { id: 'b', case: [1, 0] }], monstres: [{ id: 'm', case: [9, 9] }] });
  R.abandonner(s, 'b'); R.abandonner(s, 'a');
  assert.deepStrictEqual([s.phase, s.resultat.vainqueur, s.resultat.abandon], ['fin', 'monstres', true]);
});
test('vérificateur (§3, §4, décision 9) : emplacement, niveau, id, chef-d\'œuvre, réglages des briques, Ouverture', () => {
  const base = ESSAI.find(s => s.id === 'levainqueur.mie-raille');
  const v = o => R.verifierSort(Object.assign(JSON.parse(JSON.stringify(base)), o));
  assert.ok(v({ emplacement: 23 }).some(x => /emplacement/.test(x)));
  assert.ok(v({ niveau: 12 }).some(x => /se débloque au niveau 1/.test(x)));
  assert.ok(v({ id: 'MAUVAIS ID' }).some(x => /id/.test(x)));
  assert.ok(v({ emplacement: 16, niveau: 200 }).some(x => /Chef-d'œuvre/.test(x)));
  assert.deepStrictEqual(v({ emplacement: 16, niveau: 200, nom: 'Chef-d\'œuvre de mie', id: 'levainqueur.chef-d-oeuvre-de-mie' }), []);
  assert.ok(v({ effets: [{ type: 'degats', element: 'F', min: 1, max: 2 }, { type: 'pousse' }, { type: 'retire', quoi: 'pas' }, { type: 'bouclier' }] }).filter(x => /sans « (cases|n|valeur) »/.test(x)).length === 3);
  assert.ok(v({ texte: undefined }).some(x => /champ manquant « texte »/.test(x)));
  assert.ok(R.verifierSort(Sp({ element: 'N', cible: 'soi', touche: 'allies', effets: [{ type: 'bonus', carac: 'ouverture', valeur: 20, tours: 2, qui: 'soi' }] })).some(x => /Ouverture sans effet/.test(x)));
  assert.deepStrictEqual(R.NIVEAUX_EMPLACEMENTS[9], [88, 96]);
});
test('vérificateur de classe (§4) : noms uniques, un sort de base par emplacement, couverture des éléments aux niveaux 34, 81 et 200', () => {
  const N = R.NIVEAUX_EMPLACEMENTS, els = ['F', 'E', 'T', 'S', 'C'];
  const grim = [];
  for (let i = 1; i <= 16; i++) {
    const el = els[(i - 1) % 5], nom = (i === 16 ? 'Chef-d\'œuvre ' : 'Sort ') + 'numero ' + i;
    grim.push({ id: 'levainqueur.' + nom.toLowerCase().replace(/œ/g, 'oe').replace(/[^a-z0-9]+/g, '-'), classe: 'levainqueur', emplacement: i, declinaisonDe: null, niveau: N[i][0], nom, element: el, cm: 3,
      rayon: { min: 1, max: 3, modifiable: false }, lancer: 'libre', vue: true, cible: 'ennemi', parTour: 2, parCible: 1, relance: 0, relanceInitiale: 0, plafondPose: 0, maitre: 5,
      zone: { forme: 'case', taille: 0, tailleMin: 0, baisse: true }, touche: 'ennemis', effets: [{ type: 'degats', element: el, min: 10, max: 12, maitre: [12, 15] }], texte: '', change: '' });
  }
  const r = R.verifierClasse(grim);
  assert.deepStrictEqual(r.couverture.levainqueur[34], { F: 1, E: 1, T: 1, S: 1, C: 1 });
  assert.ok(r.problemes.some(x => /au niveau 81, 1 emplacement\(s\) en/.test(x)), 'seuil du niveau 81');
  assert.ok(r.problemes.some(x => /au niveau 200/.test(x)), 'seuils du niveau 200');
  const double = grim.concat([Object.assign({}, grim[0], { id: 'traitreur.sort-numero-1', classe: 'traitreur' })]);
  assert.ok(R.verifierClasse(double).problemes.some(x => /en double/.test(x)));
  assert.ok(R.verifierClasse(grim.slice(1)).problemes.some(x => /emplacement 1 : 0 sort de base/.test(x)));
});
test('Commande (partie 3.21) : le bonus suit le nombre d\'artisans ; sans choix de l\'initiateur, la première proposée est prise', () => {
  const e = R.creerCombat({ carte: { lignes: grille(8, 8), departs: [{ artisans: [[0, 0], [1, 0], [2, 0], [3, 0]], monstres: [[7, 7], [6, 7]] }] }, graine: 3,
    artisans: [{ id: 'a', classe: 'levainqueur' }], monstres: [fiche({ id: 'm1' }), fiche({ id: 'm2' })], options: { commande: 'sans-sel' } });
  const solo = e.commande.bonus['sans-sel'];
  ['b', 'c', 'd'].forEach(id => R.rejoindre(e, { id, classe: 'merlanceur' }));
  assert.ok(e.commande.bonus['sans-sel'] < solo, solo + ' → ' + e.commande.bonus['sans-sel']);
  const f = R.creerCombat({ carte: { lignes: grille(8, 8) }, graine: 3, artisans: [{ id: 'a', classe: 'levainqueur', case: [0, 0] }], monstres: [fiche({ id: 'm', case: [7, 7] })], options: {} });
  R.commencer(f);
  assert.strictEqual(f.commande.choisie, f.commande.proposees[0]);
  const g = R.creerCombat({ carte: { lignes: grille(8, 8) }, graine: 3, artisans: [{ id: 'a', classe: 'levainqueur', case: [0, 0] }], monstres: [fiche({ id: 'm', case: [7, 7] })], options: {} });
  R.choisirCommande(g, null); R.commencer(g);
  assert.strictEqual(g.commande.choisie, null);
});
test('IA (partie 3.22, point 1) : une chute certaine passe avant un coup plus rentable', () => {
  const ZONE = Sp({ id: 'zone', cm: 6, cible: 'case', parTour: 1, rayon: { min: 0, max: 12, modifiable: false }, zone: { forme: 'rond', taille: 2, baisse: false }, effets: [D(30)] });
  const PIQUE = Sp({ id: 'pique', cm: 6, cible: 'ennemi', parTour: 1, effets: [D(6)] });
  const e = mk({ artisans: [{ id: 'a', case: [5, 5] }, { id: 'b', case: [5, 6] }, { id: 'c', case: [6, 5] }, { id: 'd', case: [11, 11] }],
    monstres: [{ id: 'm', case: [11, 0], pas: 0, ouverture: 500, sorts: [ZONE, PIQUE] }] });
  C(e, 'd').victuailles = 5;
  assert.strictEqual(R.actif(e).id, 'm');
  // sans la priorité stricte (bonusChuteSure = 0), l'IA préférait la zone sur les trois artisans groupés (90 dégâts) ;
  // avec elle, le seul lancer du tour fait tomber « d » (par la pique, ou par la zone posée sur lui)
  const evs = R.iaJoue(e, 'm').evenements;
  assert.strictEqual(de(evs, 'lancer').length, 1);
  assert.strictEqual(C(e, 'd').vivant, false);
  const sauve = R.CONST.IA.bonusChuteSure;
  try {
    R.CONST.IA.bonusChuteSure = 0;
    const e2 = mk({ artisans: [{ id: 'a', case: [5, 5] }, { id: 'b', case: [5, 6] }, { id: 'c', case: [6, 5] }, { id: 'd', case: [11, 11] }],
      monstres: [{ id: 'm', case: [11, 0], pas: 0, ouverture: 500, sorts: [ZONE, PIQUE] }] });
    C(e2, 'd').victuailles = 5;
    R.iaJoue(e2, 'm');
    assert.strictEqual(C(e2, 'd').vivant, true, 'le test doit distinguer les deux réglages');
  } finally { R.CONST.IA.bonusChuteSure = sauve; }
});
test('IA : la case de départ évite d\'être vue par les monstres (à l\'abri d\'un décor) ; « pire » prend l\'inverse', () => {
  const lignes = ['..........', '..........', '..........', '....#.....', '..........', '..........'];
  const tireur = Sp({ id: 'tir', cible: 'ennemi', parTour: 2, rayon: { min: 2, max: 5, modifiable: false }, vue: true, effets: [D(8)] });
  const cree = () => R.creerCombat({ carte: { lignes, departs: [{ artisans: [[4, 5], [8, 5]], monstres: [[4, 0]] }] }, graine: 2,
    artisans: [{ id: 'a', classe: 'levainqueur' }], monstres: [fiche({ id: 'm', comportement: 'tire', sorts: [tireur] })], options: { commande: 'aucune' } });
  let e = cree(); R.iaPlace(e, 'a'); assert.deepStrictEqual(C(e, 'a').case, [4, 5]);
  e = cree(); R.iaPlace(e, 'a', { pire: true }); assert.deepStrictEqual(C(e, 'a').case, [8, 5]);
});
test('outils : le Couperet garde un gros taux de coup de maître (25 %) avec la fourchette maître habituelle (environ + 25 %)', () => {
  const b = O.pour('bouchevalier').effets[0];
  assert.ok(b.maitre[0] >= Math.floor(b.min * 1.2) && b.maitre[1] <= Math.ceil(b.max * 1.3), JSON.stringify(b));
});

// ---------- Correctifs après les essais du prototype ----------
test('Minuteur en solo : trois tours passés ne font pas quitter le service (absent avec max: null)', () => {
  const e = mk({ artisans: [{ id: 'a', case: [0, 0] }], monstres: [{ id: 'm', case: [9, 9] }] });
  for (let i = 1; i <= 4; i++) {
    const evs = R.finDuTour(e, 'a', { absent: true }).evenements;
    assert.deepStrictEqual(de(evs, 'absent')[0], { type: 'absent', id: 'a', n: i, max: null });
    assert.strictEqual(de(evs, 'quitte').length, 0);
    jusqua(e, 'a');
  }
  assert.strictEqual(C(e, 'a').vivant, true);
  assert.strictEqual(e.phase, 'combat');
});
test('Minuteur en groupe : l\'événement absent donne le maximum (3)', () => {
  const e = mk({ artisans: [{ id: 'a', case: [0, 0] }, { id: 'b', case: [1, 0] }], monstres: [{ id: 'm', case: [9, 9] }] });
  jusqua(e, 'a');
  assert.strictEqual(de(R.finDuTour(e, 'a', { absent: true }).evenements, 'absent')[0].max, 3);
});
test('Addition d\'une défaite : la Commande tenue est sans objet (respectee null, pas appliquée)', () => {
  const e = mk({ artisans: [{ id: 'a', case: [0, 0] }], monstres: [{ id: 'm', case: [9, 9] }], options: { commande: 'une-seule-cuisson' } });
  assert.ok(R.abandonner(e, 'a').ok);
  const k = R.resultat(e).addition.commande;
  assert.strictEqual(k.respectee, null); assert.strictEqual(k.appliquee, false);
  assert.ok(/sans objet/i.test(k.raison), k.raison);
});
test('Commande ratée : la raison dit ce qui s\'est passé, la règle reste à part', () => {
  const s = Sp({ id: 'deux', cm: 1, effets: [D(1)] });
  const e = mk({ artisans: [{ id: 'a', case: [0, 0], sorts: [s] }], monstres: [{ id: 'm', case: [5, 5] }], options: { commande: 'une-seule-cuisson' } });
  jusqua(e, 'a');
  L(e, 'a', 'deux', [5, 5]);
  const ev = de(L(e, 'a', 'deux', [5, 5]), 'commande')[0];
  assert.ok(ev && ev.raison.indexOf('deux fois dans le même tour') > 0, JSON.stringify(ev));
  assert.strictEqual(ev.regle, R.COMMANDES['une-seule-cuisson'].regle);
});
test('apercuPain : refus et valeur vraiment rendue, sans toucher l\'état', () => {
  const e = mk({ artisans: [{ id: 'a', case: [0, 0] }], monstres: [{ id: 'm', case: [9, 9] }] });
  jusqua(e, 'a');
  const a = C(e, 'a');
  let p = R.apercuPain(e, 'a');
  assert.strictEqual(p.disponible, false); assert.strictEqual(p.raison, 'Victuailles déjà pleines');
  a.victuailles -= 5;
  const avant = geler(e);
  p = R.apercuPain(e, 'a');
  assert.strictEqual(p.disponible, true); assert.strictEqual(p.valeur, 5); assert.strictEqual(p.cm, 2);
  assert.strictEqual(geler(e), avant);
});
test('apercuSort d\'une fournée qui cuit : zone d\'éclatement et dégâts, aux positions actuelles', () => {
  const s = Sp({ id: 'fo', cm: 1, cible: 'caseLibre', effets: [{ type: 'pose', quoi: 'fournee', tours: 2, zone: { forme: 'croix', taille: 1, baisse: false }, touche: 'ennemis', effets: [D(15)] }] });
  const e = mk({ artisans: [{ id: 'a', case: [0, 0], sorts: [s] }], monstres: [{ id: 'm', case: [5, 5] }] });
  jusqua(e, 'a');
  const ap = R.apercuSort(e, 'a', 'fo', [5, 4]);
  assert.ok(ap.ok && ap.eclatement, JSON.stringify(ap));
  assert.strictEqual(ap.eclatement.zone.length, 5); assert.strictEqual(ap.eclatement.tours, 2);
  const m = ap.eclatement.cibles.find(k => k.id === 'm');
  assert.ok(m && m.degats.min === 15 && m.degats.max === 15, JSON.stringify(ap.eclatement));
  assert.strictEqual(ap.cibles.filter(k => k.degats).length, 0);
  assert.strictEqual(R.apercuSort(e, 'a', 'fo', [2, 3]).eclatement.cibles.length, 0);
});

test('une seule fournée par case : la 2e est refusée (aperçu compris), ailleurs elle passe ; une fournée qui éclate tout de suite n\'est pas gênée', () => {
  const s = Sp({ id: 'fo', cm: 1, cible: 'caseLibre', effets: [{ type: 'pose', quoi: 'fournee', tours: 2, zone: { forme: 'case' }, effets: [D(10)] }] });
  const tout = Sp({ id: 'gf', cm: 1, cible: 'case', rayon: { min: 0, max: 12, modifiable: false }, effets: [{ type: 'pose', quoi: 'fournee', tours: 0, zone: { forme: 'case' }, effets: [D(5)] }] });
  const e = mk({ artisans: [{ id: 'a', case: [0, 0], sorts: [s, tout] }], monstres: [{ id: 'm', case: [9, 9] }] });
  jusqua(e, 'a');
  L(e, 'a', 'fo', [3, 3]);
  const r = R.lancer(e, 'a', 'fo', [3, 3]);
  assert.strictEqual(r.ok, false); assert.strictEqual(r.raison, 'Il y a déjà une fournée ici');
  assert.strictEqual(R.apercuSort(e, 'a', 'fo', [3, 3]).raison, 'Il y a déjà une fournée ici');
  assert.ok(!R.casesVisables(e, 'a', 'fo').cases.some(c => c.case[0] === 3 && c.case[1] === 3 && c.visable));
  L(e, 'a', 'fo', [3, 4]);
  assert.ok(R.lancer(e, 'a', 'gf', [3, 3]).ok);
});

// ---------- Bilan ----------
echecs.forEach(({ nom, e }) => { console.log('ÉCHEC : ' + nom); console.log('  ' + String(e && e.stack || e).split('\n').slice(0, 4).join('\n  ')); });
console.log(reussis + ' réussis, ' + echoues + ' échoués (' + (reussis + echoues) + ' tests)');
process.exit(echoues ? 1 : 0);
