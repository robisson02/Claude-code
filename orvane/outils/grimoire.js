// node outils/grimoire.js decouper     : grimoire.js -> verif/grimoire/<classe>.json (16 emplacements {base, declinaison})
// node outils/grimoire.js assembler    : verif/grimoire/*.json -> grimoire.js (+ verif/grimoire-sorts.json pour simule.js)
// node outils/grimoire.js aplatir <classe> : verif/grimoire/<classe>.json -> verif/grimoire/<classe>-sorts.json (pour simule.js)
// node outils/grimoire.js verifier [classe] : contrôles du moteur (verifierSort + verifierClasse) et noms uniques entre classes
const fs = require('fs'), path = require('path');
const RAC = path.join(__dirname, '..'), DOS = path.join(RAC, 'verif', 'grimoire');
const ORDRE = ['levainqueur', 'patissorcier', 'bouchevalier', 'pateladin', 'fromagicien', 'merlanceur', 'traitreur', 'legumancien'];
const [cmd, quelle] = process.argv.slice(2);
const lire = c => JSON.parse(fs.readFileSync(path.join(DOS, c + '.json'), 'utf8'));
if (cmd === 'decouper') {
  delete require.cache[require.resolve(path.join(RAC, 'grimoire.js'))];
  const G = require(path.join(RAC, 'grimoire.js'));
  ORDRE.forEach(c => fs.writeFileSync(path.join(DOS, c + '.json'), JSON.stringify(G[c], null, 1)));
  console.log('découpé en', ORDRE.length, 'fichiers dans', DOS);
} else if (cmd === 'assembler') {
  const out = Object.fromEntries(ORDRE.map(c => [c, lire(c)]));
  const s = "// Le grimoire d'Orvane : 16 emplacements par classe, chacun avec son sort de base et sa déclinaison,\n" +
    "// au format du contrat (moteur/CONTRAT.md). On équipe l'un ou l'autre ; changement hors combat seulement.\n" +
    'var ORVANE = (typeof window !== "undefined" ? window : globalThis).ORVANE = (typeof window !== "undefined" ? window : globalThis).ORVANE || {};\n' +
    'ORVANE.GRIMOIRE = ' + JSON.stringify(out, null, 1) + ";\nif (typeof module === 'object' && module.exports) module.exports = ORVANE.GRIMOIRE;\n";
  fs.writeFileSync(path.join(RAC, 'grimoire.js'), s);
  fs.writeFileSync(path.join(RAC, 'verif', 'grimoire-sorts.json'), JSON.stringify(Object.values(out).flat().flatMap(e => [e.base, e.declinaison])));
  console.log('grimoire.js assemblé :', s.length, 'octets');
} else if (cmd === 'aplatir') {
  const c = quelle; const l = lire(c);
  fs.writeFileSync(path.join(DOS, c + '-sorts.json'), JSON.stringify(l.flatMap(e => [e.base, e.declinaison])));
  console.log('écrit', path.join(DOS, c + '-sorts.json'));
} else if (cmd === 'verifier') {
  const R = require(path.join(RAC, 'moteur', 'regles.js'));
  const arr = v => Array.isArray(v) ? v : (v && (v.problemes || v.erreurs)) || [];
  let total = 0; const noms = {};
  for (const c of ORDRE) {
    const l = lire(c), sorts = l.flatMap(e => [e.base, e.declinaison]);
    sorts.forEach(s => { const k = String(s.nom).trim().toLowerCase(); (noms[k] = noms[k] || []).push(c); });
    if (quelle && quelle !== c) continue;
    const pb = [];
    if (l.length !== 16) pb.push('il faut 16 emplacements');
    sorts.forEach(s => arr(R.verifierSort(s)).forEach(p => pb.push(`${s.nom} : ${p}`)));
    arr(R.verifierClasse(sorts)).forEach(p => pb.push(p));
    l.forEach((e, i) => { if (e.declinaison.declinaisonDe !== e.base.id) pb.push(`emplacement ${i + 1} : declinaisonDe ≠ id du sort de base`); });
    console.log(c.padEnd(13), pb.length ? pb.length + ' remarque(s)\n  - ' + pb.join('\n  - ') : 'ok'); total += pb.length;
  }
  const dbl = Object.entries(noms).filter(([, l]) => l.length > 1);
  if (dbl.length) { console.log('noms en double entre classes :', dbl.map(([n, l]) => `${n} (${l.join(', ')})`).join(' ; ')); total += dbl.length; }
  process.exit(total ? 1 : 0);
} else console.log('usage : node outils/grimoire.js decouper|assembler|verifier [classe]');
