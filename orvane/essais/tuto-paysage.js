// Téléphone en paysage (844 × 390) et animations réduites : la carte de quête, l'anneau, le combat
const { ouvrir } = require('./outils.js');
const { preparer } = require('./tuto-outils.js');
const arg = (n, d) => { const a = process.argv.find(x => x.startsWith('--' + n + '=')); return a ? a.split('=')[1] : d; };
(async () => {
  const W = +arg('w', 844), H = +arg('h', 390), reduit = process.argv.includes('--reduit'), PREF = arg('prefixe', 'paysage');
  const o = await ouvrir({ w: W, h: H, dossier: __dirname + '/tuto', reduit });
  const { p, tapSel, pause, log } = o;
  const T = preparer(o, PREF);
  await tapSel('#entrer'); await p.waitForSelector('#tuto-oui'); await tapSel('#tuto-oui'); await pause(900);
  let e = await T.lire(); await T.noter(e, true);
  const anim = await p.evaluate(() => { const a = document.querySelector('#tuto-anneau i'); return a ? getComputedStyle(a).animationName : '?'; });
  log('Animation de l\'anneau : ' + anim + (reduit ? ' (animations réduites demandées)' : ''));
  log('Zone utile du terrain : ' + JSON.stringify(await p.evaluate(() => window.__orvane.rectUtile())));
  e = await T.suivre(x => x.scene === 'combat' && x.num === 5 && x.cible && /sort/.test(x.cible.id));
  await T.noter(e, true);
  const anim2 = await p.evaluate(() => { const a = document.querySelector('.tuto-cible'); return a ? getComputedStyle(a).animationName : '?'; });
  log('Animation de la cible (bouton) : ' + anim2);
  log('Cibles de moins de 44 px : ' + ((await o.petitesCibles()).join(', ') || 'aucune'));
  log('Console : ' + (o.msgs.length ? o.msgs.join('\n') : 'vide'));
  T.ecrire(PREF);
  await o.b.close();
})().catch(e => { console.error(e); process.exit(1); });
