// Simulation de combats d'Orvane : un artisan (joué par l'IA) contre un groupe du Fourneau.
//
//   node simule.js [N] [fichier-de-sorts] [options]
//
//   N                  nombre de combats (1000 par défaut)
//   fichier-de-sorts   .js ou .json au format du contrat : un tableau de sorts, ou { sorts: [...] },
//                      ou { classe: [...] } ; par défaut ./sorts-essai.js
//   --classe=ID        classe de l'artisan (levainqueur par défaut)
//   --niveau=N         niveau de l'artisan (2 par défaut : le Fourneau se joue aux niveaux 1 à 3)
//   --groupe=ID|tous   groupe du Fourneau (chef-seul, mie-et-pate, grumeaux, le-chef) ; « tous » les fait tourner (défaut)
//   --placement=ia|pire|hasard|chaque
//                      ia : la case dorée que l'IA juge la meilleure (défaut) ; pire : celle qu'elle juge la pire ;
//                      hasard : une case au hasard ; chaque : N combats sur CHACUNE des 6 cases de chaque jeu de départ,
//                      pour mesurer l'objectif « un bon placement coûte 30 à 40 % des Victuailles, un mauvais peut faire perdre »
//   Le jeu de cases de départ tourne d'un combat à l'autre (partie 3.3), comme en jeu.
//   --declinaisons     équipe la déclinaison quand elle existe (sinon le sort de base)
//   --affinites=F:15,T:10   répartition du capital (sinon : partagé entre les éléments de ses sorts de dégâts)
//   --graine=N         première graine (1 par défaut)
'use strict';
const path = require('path');
const fs = require('fs');
const R = require('./regles.js');
const M = require('./monstres.js');
const O = require('./outils.js');

const args = process.argv.slice(2);
const opt = { n: 1000, fichier: null, classe: 'levainqueur', niveau: 2, groupe: 'tous', placement: 'ia', declinaisons: false, affinites: null, graine: 1 };
args.forEach(a => {
  const m = a.match(/^--([^=]+)(?:=(.*))?$/);
  if (m) {
    const k = m[1], v = m[2];
    if (k === 'classe') opt.classe = v;
    else if (k === 'niveau') opt.niveau = +v;
    else if (k === 'groupe') opt.groupe = v;
    else if (k === 'placement') opt.placement = v;
    else if (k === 'declinaisons') opt.declinaisons = true;
    else if (k === 'graine') opt.graine = +v;
    else if (k === 'affinites') { opt.affinites = {}; v.split(',').forEach(p => { const [e, n] = p.split(':'); opt.affinites[e] = +n; }); }
    else { console.error('Option inconnue : ' + a); process.exit(2); }
  } else if (/^\d+$/.test(a)) opt.n = +a;
  else opt.fichier = a;
});

function lireSorts(f) {
  const chemin = path.resolve(f || path.join(__dirname, 'sorts-essai.js'));
  let v;
  if (/\.json$/i.test(chemin)) v = JSON.parse(fs.readFileSync(chemin, 'utf8'));
  else v = require(chemin);
  if (Array.isArray(v)) return v;
  if (v && Array.isArray(v.sorts)) return v.sorts;
  if (v && typeof v === 'object') return Object.values(v).filter(Array.isArray).flat();
  throw new Error('Fichier de sorts illisible : ' + chemin);
}

// Le grimoire : pour chaque emplacement débloqué, le sort de base (ou sa déclinaison avec --declinaisons).
function grimoire(tous) {
  const miens = tous.filter(s => s.classe === opt.classe && (s.niveau || 1) <= opt.niveau && s.emplacement > 0);
  const parEmp = {};
  miens.forEach(s => {
    const k = s.emplacement, actuel = parEmp[k], decl = !!s.declinaisonDe;
    if (!actuel) parEmp[k] = s;
    else if (opt.declinaisons ? decl && !actuel.declinaisonDe : !decl && actuel.declinaisonDe) parEmp[k] = s;
  });
  const g = Object.keys(parEmp).sort((a, b) => a - b).map(k => parEmp[k]);
  try { g.push(O.pour(opt.classe)); } catch (e) { /* classe sans outil */ }
  return g;
}
function affinitesParDefaut(sorts) {
  if (opt.affinites) return opt.affinites;
  // « Répartir pour moi » (contrat, décision 11) : l'élément le plus présent parmi les sorts de dégâts équipés
  // (à égalité : celui du sort au plus petit emplacement), plus le 2e s'il a au moins la moitié de ses sorts ;
  // les points se dépensent à tour de rôle, au coût réel des paliers ; rien en Victuailles.
  const compte = {}, premier = {};
  sorts.filter(s => s.element !== 'N' && JSON.stringify(s.effets).includes('"degats"')).forEach(s => {
    compte[s.element] = (compte[s.element] || 0) + 1;
    const emp = s.emplacement || 99;
    if (!(s.element in premier) || emp < premier[s.element]) premier[s.element] = emp;
  });
  const tri = Object.keys(compte).sort((a, b) => compte[b] - compte[a] || premier[a] - premier[b]);
  const els = tri.slice(0, 1);
  if (tri[1] && compte[tri[1]] * 2 >= compte[tri[0]]) els.push(tri[1]);
  const capital = R.CONST.CAPITAL_PAR_NIVEAU * (opt.niveau - 1), a = {};
  els.forEach(e => { a[e] = 0; });
  const cout = () => els.reduce((t, e) => t + R.coutAffinite(a[e]), 0);
  for (let monte = true; monte && els.length;) {
    monte = false;
    for (const e of els) { a[e]++; if (cout() <= capital) monte = true; else a[e]--; }
  }
  return a;
}

const tous = lireSorts(opt.fichier);
const sorts = grimoire(tous);
if (!sorts.length) { console.error('Aucun sort pour ' + opt.classe + ' au niveau ' + opt.niveau); process.exit(2); }
const affinites = affinitesParDefaut(sorts);
const groupes = opt.groupe === 'tous' ? M.GROUPES.fourneau.map(g => g.id) : [opt.groupe];

function lcg(g) { let s = (g * 2654435761) >>> 0 || 1; return () => (s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296; }

const res = [];
const avertissements = new Set();
const nbJeux = M.carte('fourneau').departs.length;
// Un combat : placement = 'ia' | 'pire' | 'hasard' | une case [x, y].
function combat(graine, groupe, depart, placement) {
  const etat = R.creerCombat({
    carte: M.carte('fourneau'), graine,
    artisans: [{ id: 'artisan', nom: 'Artisan', classe: opt.classe, niveau: opt.niveau, affinites, sorts, controle: 'ia' }],
    monstres: M.groupe('fourneau', groupe), options: { commande: 'aucune', depart }
  });
  etat.avertissements.forEach(a => avertissements.add(a));
  const cases = etat.carte.departs[etat.depart].artisans;
  if (Array.isArray(placement)) R.placer(etat, 'artisan', placement);
  else if (placement === 'hasard') { const r = lcg(graine); R.placer(etat, 'artisan', cases[Math.floor(r() * cases.length)]); }
  else R.iaPlace(etat, 'artisan', { pire: placement === 'pire' });
  const caseDepart = R.trouver(etat, 'artisan').case.slice();
  R.commencer(etat);
  let actions = 0;
  while (etat.phase === 'combat' && actions < 2000) {
    const a = R.actif(etat);
    const r = R.iaJoue(etat, a.id);
    if (!r.ok) throw new Error('IA refusée : ' + r.raison);
    actions++;
    if (etat.manche > 60) break;
  }
  const art = R.trouver(etat, 'artisan');
  const fini = etat.phase === 'fin';
  const victoire = fini && etat.resultat.vainqueur === 'artisans';
  return {
    groupe, depart, caseDepart, victoire, nul: !fini, manches: etat.manche,
    perte: victoire ? (art.victuaillesMax - art.victuailles) / art.victuaillesMax : 1,
    pain: R.CONST.PAIN_DE_ROUTE.parCombat - art.pain,
    xp: fini ? etat.resultat.addition.xp.artisan : 0
  };
}
if (opt.placement === 'chaque') {
  // N combats sur chaque case dorée de chaque jeu, pour chaque groupe (le hasard change d'un combat à l'autre)
  const parCase = Math.max(1, Math.round(opt.n / (groupes.length * nbJeux * 6)));
  groupes.forEach(groupe => {
    for (let d = 0; d < nbJeux; d++) M.carte('fourneau').departs[d].artisans.forEach((cs, ic) => {
      for (let i = 0; i < parCase; i++) res.push(combat(opt.graine + 100000 * d + 1000 * ic + i, groupe, d, cs));
    });
  });
} else {
  for (let i = 0; i < opt.n; i++) res.push(combat(opt.graine + i, groupes[i % groupes.length], Math.floor(i / groupes.length) % nbJeux, opt.placement));
}

// ---------- Rapport ----------
const pct = x => (100 * x).toFixed(1).replace('.', ',') + ' %';
const moy = l => l.length ? l.reduce((a, b) => a + b, 0) / l.length : 0;
const fmt = x => x.toFixed(2).replace('.', ',');
function barre(n, total, largeur = 40) { return '█'.repeat(Math.round(largeur * n / Math.max(1, total))); }
function bilan(liste, titre) {
  const v = liste.filter(r => r.victoire), d = liste.filter(r => !r.victoire && !r.nul), nuls = liste.filter(r => r.nul);
  console.log('\n== ' + titre + ' : ' + liste.length + ' combats ==');
  console.log('Victoires : ' + v.length + ' (' + pct(v.length / liste.length) + ')   défaites : ' + d.length + '   sans fin (60 manches) : ' + nuls.length);
  console.log('Victuailles perdues, victoires seules : moyenne ' + pct(moy(v.map(r => r.perte))) + ' ; tous combats (défaite = 100 %) : ' + pct(moy(liste.map(r => r.perte))));
  console.log('Durée : ' + fmt(moy(liste.map(r => r.manches))) + ' manches en moyenne (min ' + Math.min(...liste.map(r => r.manches)) + ', max ' + Math.max(...liste.map(r => r.manches)) + ')');
  console.log('Pains de route mangés : ' + fmt(moy(liste.map(r => r.pain))) + ' par combat');
  return { v, d };
}
console.log('Simulation Orvane : ' + opt.n + ' combats, ' + opt.classe + ' niveau ' + opt.niveau + ', placement ' + opt.placement +
  ', affinités ' + JSON.stringify(affinites));
console.log('Grimoire : ' + sorts.map(s => s.nom + (s.emplacement === 0 ? ' (' + s.outil + ')' : '')).join(', '));
if (avertissements.size) console.log('Avertissements : ' + [...avertissements].join(' | '));
const { v } = bilan(res, 'Ensemble');
console.log('\nRépartition des Victuailles perdues (victoires) :');
for (let k = 0; k < 10; k++) {
  const n = v.filter(r => r.perte >= k / 10 && (k === 9 ? r.perte <= 1 : r.perte < (k + 1) / 10)).length;
  console.log(('  ' + (k * 10) + ' à ' + ((k + 1) * 10) + ' %').padEnd(14) + String(n).padStart(5) + '  ' + barre(n, v.length));
}
const def = res.filter(r => !r.victoire).length;
console.log('  défaite'.padEnd(14) + String(def).padStart(5) + '  ' + barre(def, res.length));
console.log('\nRépartition de la durée (manches) :');
const maxM = Math.max(...res.map(r => r.manches));
for (let m = 1; m <= maxM; m++) {
  const n = res.filter(r => r.manches === m).length;
  if (n) console.log(('  ' + m).padEnd(6) + String(n).padStart(5) + '  ' + barre(n, res.length));
}
if (groupes.length > 1) groupes.forEach(g => bilan(res.filter(r => r.groupe === g), 'Groupe « ' + M.GROUPES.fourneau.find(x => x.id === g).nom + ' »'));

// L'objectif d'équilibrage (rapport, partie 2) : « un bon placement coûte 30 à 40 % des Victuailles, un mauvais peut faire perdre ».
if (opt.placement === 'chaque') {
  console.log('\n== Objectif : un bon placement coûte 30 à 40 %, un mauvais peut faire perdre ==');
  console.log('(par groupe et par jeu de départ : la meilleure et la pire des 6 cases dorées, perte moyenne, défaite = 100 %)');
  groupes.forEach(g => {
    const lignes = [];
    for (let d = 0; d < nbJeux; d++) {
      const cases = {};
      res.filter(r => r.groupe === g && r.depart === d).forEach(r => { const k = r.caseDepart.join(','); (cases[k] = cases[k] || []).push(r); });
      const st = Object.keys(cases).map(k => ({ k, perte: moy(cases[k].map(r => r.perte)), def: cases[k].filter(r => !r.victoire).length / cases[k].length }));
      st.sort((a, b) => a.perte - b.perte);
      const b = st[0], w = st[st.length - 1];
      lignes.push('jeu ' + d + ' : meilleure [' + b.k + '] ' + pct(b.perte) + ', pire [' + w.k + '] ' + pct(w.perte) + ' (défaites ' + pct(w.def) + ')');
    }
    console.log(('« ' + M.GROUPES.fourneau.find(x => x.id === g).nom + ' »').padEnd(30) + lignes.join(' ; '));
  });
}
