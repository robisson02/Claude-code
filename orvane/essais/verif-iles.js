// Les îles : chaque plan se lit, chaque objet a son accès, chaque sortie mène au sol ; le pont (carte de combat) est valide
// pour le moteur. Imprime chaque île comme à l'écran (une rangée par demi-rangée de losanges).
const I = require('../proto/iles.js');
const R = require('../moteur/regles.js');
const M = require('../moteur/monstres.js');
const departFourneau = [9, 9];
const err = I.verifier({ fourneau: departFourneau });
console.log(err.length ? 'ERREURS :\n' + err.join('\n') : 'Îles : aucune erreur');
function ecran(lignes, marques) {
  const H = lignes.length, W = Math.max(...lignes.map(l => l.length));
  const cells = [];
  for (let y = -2; y < H + 2; y++) for (let x = -2; x < W + 2; x++) cells.push([x, y]);
  let umin = Infinity, umax = -Infinity, vmin = Infinity, vmax = -Infinity;
  const vis = [];
  cells.forEach(([x, y]) => {
    const ch = (lignes[y] || '')[x];
    const m = marques[x + ',' + y];
    if ((!ch || ch === '~') && !m) return;
    const u = x - y, v = x + y; vis.push({ u, v, c: m || ch });
    umin = Math.min(umin, u); umax = Math.max(umax, u); vmin = Math.min(vmin, v); vmax = Math.max(vmax, v);
  });
  const out = [];
  for (let v = vmin; v <= vmax; v++) { let s = ''; for (let u = umin; u <= umax; u++) { const c = vis.find(q => q.u === u && q.v === v); s += c ? c.c : ' '; } out.push(String(v).padStart(3) + ' ' + s); }
  return out.join('\n');
}
I.LISTE.forEach(id => {
  const ile = I.ile(id), m = {};
  ile.objets.forEach(o => { m[o.case.join(',')] = { marche: '>', four: 'O', 'passe-plat': 'P', 'monte-plats': 'm', toboggan: 't', pelle: 'p', sieste: 'Z', info: 'i', arrivee: 'A' }[o.genre] || '?'; if (o.acces && o.genre !== 'marche' && o.genre !== 'arrivee') m[o.acces.join(',')] = m[o.acces.join(',')] || 'a'; });
  if (ile.depart) m[ile.depart.join(',')] = '@';
  (ile.maisons || []).forEach(c => (m[c.join(',')] = '*'));
  const sols = ile.lignes.join('').split('').filter(c => c === '.').length;
  console.log(`\n== ${ile.nom} (${id}) : ${ile.lignes.length} lignes, ${sols} cases de sol ==`);
  ile.objets.forEach(o => console.log(`  ${o.id.padEnd(22)} ${o.genre.padEnd(11)} case ${JSON.stringify(o.case)} accès ${JSON.stringify(o.acces)} arrivée ${JSON.stringify(o.arrivee)}${o.vers ? ' → ' + o.vers : ''}`));
  console.log(ecran(ile.lignes, m));
});
// le pont
const c = I.carteCombat('voie-lactee');
const k = R.interne.preparerCarte(c);
console.log('\n== Carte de combat du pont ==');
c.departs.forEach((d, i) => {
  const bad = d.artisans.concat(d.monstres).filter(q => (c.lignes[q[1]] || '')[q[0]] !== '.');
  const doublons = new Set(d.artisans.map(String)).size !== 6 || new Set(d.monstres.map(String)).size !== 6;
  console.log(`  jeu ${i} : ${bad.length ? 'CASES HORS SOL ' + JSON.stringify(bad) : 'cases de sol'}${doublons ? ', DOUBLONS' : ''}`);
});
const mk = {}; c.departs.forEach((d, i) => { d.artisans.forEach(q => (mk[q.join(',')] = String.fromCharCode(97 + i))); d.monstres.forEach(q => (mk[q.join(',')] = String.fromCharCode(120 + i))); });
console.log(ecran(c.lignes, mk));
console.log('sol : ' + c.lignes.join('').split('').filter(ch => ch === '.').length + ' cases, décors : ' + Object.keys(k.decors).length);
// un combat d'essai sur le pont
const etat = R.creerCombat({ carte: I.carteCombat('voie-lactee'), graine: 3, artisans: [{ id: 'a', nom: 'A', classe: 'levainqueur', niveau: 2, affinites: {}, sorts: [require('../moteur/outils.js').pour('levainqueur')], controle: 'ia' }], monstres: M.groupe('voie-lactee', 'grumeaux-du-pont'), options: { commande: 'aucune', depart: 1 } });
console.log('combat créé sur le pont : ' + etat.combattants.map(x => x.id + '@' + x.case).join(' '));
console.log('Groupes de la Voie lactée : ' + M.GROUPES['voie-lactee'].map(g => g.id).join(', ') + ' ; prévision : ' + JSON.stringify(M.prevision('voie-lactee', 'grumeaux-du-pont')));
