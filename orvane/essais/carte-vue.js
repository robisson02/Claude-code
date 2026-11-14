const { ouvrir } = require('./outils.js');
const { outils } = require('./voyages-outils.js');
(async () => {
  const T = await ouvrir({ dsf: 2 }); const { p, pause, cap, tapSel } = T; T.V = outils(T);
  await p.evaluate(() => window.__orvane.creer({ niveau: 12 })); await pause(800);
  await T.V.prendre('fourneau-bord'); await pause(300);
  await tapSel('#b-carte'); await pause(600); await cap('carte-vl');
  await p.evaluate(() => document.querySelector('.carte-legende').open = true); await pause(200);
  await p.evaluate(() => document.querySelector('.carte-legende').scrollIntoView()); await pause(200); await cap('carte-vl-legende');
  await p.click('#d-carte footer [data-fermer]'); await pause(300);
  await T.V.prendre('vl-bas'); await T.V.prendre('fourneau-monte-plats'); await T.V.prendre('penderie-toboggan');
  await T.V.toucher('moule-four', 2); await pause(500); await T.V.calme(); await pause(900);
  await p.evaluate(() => document.querySelectorAll('dialog[open]').forEach(d => d.close())); await pause(200);
  await tapSel('#b-carte'); await pause(600); await cap('carte-moule');
  const r = await p.evaluate(() => [...document.querySelectorAll('.ile-b')].map(b => b.dataset.ile));
  await tapSel('.ile-b[data-ile="grand-etal"]'); await pause(300); await cap('carte-moule-ge');
  console.log('console : ' + (T.msgs.join(' | ') || 'vide'));
  await T.b.close();
})();
