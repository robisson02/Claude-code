const { ouvrir } = require('./da-outils.js');
(async () => {
  const T = await ouvrir({ reduit: true });
  const { p, pause, ev, apercu, filmer, secondToucher, calme, log } = T;
  await ev(() => window.__orvane.creer({ niveau: 12 })); await pause(800);
  await apercu('fourneau-monte-plats');
  const f = await filmer('r-monte-plats', secondToucher('fourneau-monte-plats'), { pas: 40, apres: 4 });
  log('console : ' + (T.msgs.join(' | ') || 'vide'));
  await T.b.close();
  const { execSync } = require('child_process');
  execSync('python3 ' + __dirname + '/planche-films.py r-', { stdio: 'inherit' });
})();
