// Voir chaque île (téléphone 390 × 844) : node iles-vue.js [niveau] [prefixe]
const { ouvrir } = require('./outils.js');
(async () => {
  const niv = +(process.argv[2] || 12), pre = process.argv[3] || 'vue';
  const o = await ouvrir({ dsf: 2 });
  const { p, pause, cap, log, msgs } = o;
  await p.evaluate(n => window.__orvane.creer({ niveau: n }), niv);
  for (const ile of ['fourneau', 'voie-lactee', 'halle', 'penderie', 'moule', 'grand-etal']) {
    await p.evaluate(i => window.__orvane.jeu.changerIle({ ile: i }), ile);
    await pause(900);
    await cap(pre + '-' + ile);
  }
  log('console : ' + (msgs.join('\n') || 'vide'));
  await o.b.close();
})();
