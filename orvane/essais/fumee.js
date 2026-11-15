// Premier essai : le Fourneau, ses objets, un passage vers la Voie lactée (au doigt)
const { ouvrir } = require('./outils.js');
(async () => {
  const o = await ouvrir({ w: 390, h: 844 });
  const { p, tap, pause, log, cap, msgs } = o;
  await p.evaluate(() => window.__orvane.creer({ classe: 'levainqueur', niveau: 1 }));
  await pause(800);
  log('île : ' + await p.evaluate(() => window.__orvane.ile));
  const obj = await p.evaluate(() => window.__orvane.objets());
  log(JSON.stringify(obj));
  await cap('fumee-01-fourneau');
  const bord = obj.find(x => x.id === 'fourneau-bord');
  await tap(bord.ecran.x, bord.ecran.y); await pause(500);
  log('aperçu : ' + await p.evaluate(() => window.__orvane.apercuVoyage()) + ' · consigne : ' + await p.textContent('#consigne-balade'));
  await cap('fumee-02-apercu');
  await tap(bord.ecran.x, bord.ecran.y); await pause(400);
  await p.evaluate(() => window.__orvane.attendre(30000));
  log('île : ' + await p.evaluate(() => window.__orvane.ile) + ' · passage ' + JSON.stringify(await p.evaluate(() => window.__orvane.dernierPassage)));
  await pause(600);
  await cap('fumee-03-voie-lactee');
  log('console : ' + JSON.stringify(msgs));
  await o.b.close();
})().catch(e => { console.error(e); process.exit(1); });
