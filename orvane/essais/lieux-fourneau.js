// Les lieux du Fourneau (départ, maisons des groupes, Mère Fournil, Grumeau d'entraînement), calculés comme dans le jeu,
// pour placer les objets de voyage sans rien déranger.
const M = require('../moteur/monstres.js');
const carte = M.carte('fourneau');
const L = carte.lignes, H = L.length, W = Math.max(...L.map(l => l.length));
const t = (x, y) => { if (y < 0 || y >= H || x < 0 || x >= W) return 'vide'; const c = L[y][x]; if (c === undefined || c === '~' || c === ' ') return 'vide'; if (c === '.') return 'sol'; return 'plein'; };
const sol = (x, y) => t(x, y) === 'sol';
const cases = []; for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (t(x, y) !== 'vide') cases.push([x, y]);
const DIRS8 = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
const sols = cases.filter(c => sol(c[0], c[1]));
const d = (a, b) => Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);
const dep = carte.departs[0].artisans;
const cx = dep.reduce((t, c) => t + c[0], 0) / dep.length, cy = dep.reduce((t, c) => t + c[1], 0) / dep.length;
const depart = sols.slice().sort((a, b) => d(a, [cx, cy]) - d(b, [cx, cy]))[0];
const ouverte = c => DIRS8.filter(([dx, dy]) => sol(c[0] + dx, c[1] + dy)).length >= 6;
const maisons = [], pris = [depart];
for (let k = 0; k < 3; k++) {
  let best = null, bs = -1;
  sols.filter(ouverte).forEach(c => { const m = Math.min(...pris.map(q => d(c, q) * (q === depart ? 1.25 : 1))); if (m > bs) { bs = m; best = c; } });
  if (!best || bs < 3) break;
  maisons.push(best); pris.push(best);
}
const meme = (a, b) => a[0] === b[0] && a[1] === b[1];
const cheb = (a, b) => Math.max(Math.abs(a[0] - b[0]), Math.abs(a[1] - b[1]));
const sols2 = cases.filter(c => sol(c[0], c[1]) && !meme(c, depart));
const ouvert = c => DIRS8.filter(([dx, dy]) => sol(c[0] + dx, c[1] + dy)).length;
const loinMaisons = c => maisons.length ? Math.min(...maisons.map(m => cheb(c, m))) : 9;
let l = sols2.filter(c => [3, 4].indexOf(cheb(c, depart)) >= 0 && ouvert(c) === 8 && loinMaisons(c) >= 3);
if (!l.length) l = sols2.filter(c => [3, 4].indexOf(cheb(c, depart)) >= 0 && ouvert(c) >= 6 && loinMaisons(c) >= 3);
if (!l.length) l = sols2.filter(c => cheb(c, depart) >= 2 && loinMaisons(c) >= 2);
l.sort((a, b) => (loinMaisons(b) - loinMaisons(a)) || (cheb(a, depart) - cheb(b, depart)) || ((a[0] + a[1]) - (b[0] + b[1])));
const entrainement = l[0];
let m = sols2.filter(c => cheb(c, depart) === 2 && ouvert(c) === 8 && loinMaisons(c) >= 2 && !meme(c, entrainement));
if (!m.length) m = sols2.filter(c => cheb(c, depart) === 2 && ouvert(c) >= 5 && loinMaisons(c) >= 2 && !meme(c, entrainement));
m.sort((a, b) => (cheb(b, entrainement) - cheb(a, entrainement)) || (ouvert(b) - ouvert(a)));
const pnj = m[0];
console.log(JSON.stringify({ depart, maisons, entrainement, pnj }));
// la carte, avec les lieux
for (let y = 0; y < H; y++) {
  let s = '';
  for (let x = 0; x < W; x++) {
    const c = [x, y];
    let ch = L[y][x] || '~';
    if (meme(c, depart)) ch = 'D'; else if (maisons.some(q => meme(q, c))) ch = 'H'; else if (meme(c, entrainement)) ch = 'E'; else if (meme(c, pnj)) ch = 'N';
    else if (sol(x, y) && maisons.some(q => cheb(q, c) <= 2)) ch = ',';
    s += ch;
  }
  console.log(String(y).padStart(2) + ' ' + s);
}
console.log('   ' + Array.from({ length: W }, (_, i) => i % 10).join(''));
