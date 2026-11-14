// Typographie française dans les chaînes d'un fichier JS : espace insécable avant : ; ! ? et à l'intérieur des « ».
// On ne touche qu'au texte des chaînes ('…', "…", `…` hors ${…}), jamais au code ni aux expressions régulières.
// node typo.js fichier.js [--ecrire]   (sans --ecrire : montre seulement les chaînes qui changeraient)
const fs = require('fs');
const f = process.argv[2], ecrire = process.argv.includes('--ecrire');
const src = fs.readFileSync(f, 'utf8');
const NB = ' ';
const corriger = t => t.replace(/ ([:;!?])(?=[\s"'`<)]|$)/g, NB + '$1').replace(/« /g, '«' + NB).replace(/ »/g, NB + '»');
let out = '', i = 0, changes = [];
const n = src.length;
function chaine(q) { // i est sur le guillemet ouvrant ; renvoie la fin
  let j = i + 1, txt = '';
  while (j < n && src[j] !== q) { if (src[j] === '\\') { txt += src[j] + src[j + 1]; j += 2; continue; } if (src[j] === '\n' && q !== '`') break; txt += src[j]; j++; }
  return { txt, fin: j };
}
function code(stopAccolade) {
  let prof = 0, dernier = '';
  while (i < n) {
    const c = src[i], d = src[i + 1];
    if (c === '/' && d === '/') { const e = src.indexOf('\n', i); const k = e < 0 ? n : e; out += src.slice(i, k); i = k; continue; }
    if (c === '/' && d === '*') { const e = src.indexOf('*/', i + 2); const k = e < 0 ? n : e + 2; out += src.slice(i, k); i = k; continue; }
    if (c === '/' && /[(,=:[!&|?{};+\-*%<>~^]$|^$/.test(dernier)) { // une expression régulière
      let j = i + 1, classe = false;
      while (j < n) { if (src[j] === '\\') { j += 2; continue; } if (src[j] === '[') classe = true; else if (src[j] === ']') classe = false; else if (src[j] === '/' && !classe) break; else if (src[j] === '\n') break; j++; }
      j++; while (/[a-z]/i.test(src[j])) j++;
      out += src.slice(i, j); i = j; dernier = 'x'; continue;
    }
    if (c === '"' || c === "'") { const { txt, fin } = chaine(c); const t2 = corriger(txt); if (t2 !== txt) changes.push(txt); out += c + t2 + (src[fin] || ''); i = fin + 1; dernier = 'x'; continue; }
    if (c === '`') { i++; out += '`'; gabarit(); dernier = 'x'; continue; }
    if (stopAccolade) { if (c === '{') prof++; else if (c === '}') { if (prof === 0) return; prof--; } }
    out += c; if (!/\s/.test(c)) dernier = c; i++;
  }
}
function gabarit() {
  let txt = '';
  const vider = () => { const t2 = corriger(txt); if (t2 !== txt) changes.push(txt); out += t2; txt = ''; };
  while (i < n) {
    const c = src[i];
    if (c === '\\') { txt += c + src[i + 1]; i += 2; continue; }
    if (c === '`') { vider(); out += '`'; i++; return; }
    if (c === '$' && src[i + 1] === '{') { vider(); out += '${'; i += 2; code(true); out += '}'; i++; continue; }
    txt += c; i++;
  }
  vider();
}
code(false);
if (out.length !== src.length) { /* les insécables remplacent des espaces : même longueur */ }
console.log(f + ' : ' + changes.length + ' chaîne(s) corrigée(s)');
if (!ecrire) changes.forEach(c => console.log('  · ' + c.slice(0, 140).replace(/\n/g, ' ')));
else fs.writeFileSync(f, out);
