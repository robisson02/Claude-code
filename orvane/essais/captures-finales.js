// Passe 7 : les captures finales (téléphone 390 × 844, au doigt), ajoutées dans proto/captures sans effacer les autres.
//   ile-01… une par île ; voyage-01… chaque moyen pendant son passage (horloge arrêtée, l'image au milieu du départ) ;
//   carte-astrelier-01 ; quete-tour-01.
const { ouvrir, RACINE } = require('./da-outils.js');
const fs = require('fs');
const DEST = RACINE + '/proto/captures';
(async () => {
  const T = await ouvrir({ dsf: 3 });
  const { p, pause, log, ev, apercu, filmer, secondToucher, calme, point, tap } = T;
  const copier = (src, nom) => { fs.copyFileSync(src, DEST + '/' + nom + '.png'); log('  → proto/captures/' + nom + '.png'); };
  const photo = async (nom, attente) => { if (attente !== 0) await pause(attente || 2800); await p.screenshot({ path: DEST + '/' + nom + '.png' }); log('  → proto/captures/' + nom + '.png'); };
  // l'image du film la plus proche d'un moment du passage (en ms depuis son début)
  const image = (f, t) => { const l = f.images.filter(x => x.t != null); l.sort((a, b) => Math.abs(a.t - t) - Math.abs(b.t - t)); return l[0].f; };
  const passer = async (id, nom, t) => { await apercu(id); const f = await filmer('final-' + nom, secondToucher(id), { pas: 40, apres: 6 }); copier(image(f, t), nom); await calme(); await pause(600); };
  await ev(() => window.__orvane.creer({ niveau: 12, classe: 'patissorcier', sexe: 'f' }));
  await pause(1200);
  await photo('ile-03-fourneau');
  // le Four banal du Fourneau : l'allumer (la flamme)
  await apercu('fourneau-four');
  const fa = await filmer('final-four-allumer', secondToucher('fourneau-four'), { toujours: true, images: 50, pas: 40 });
  const flamme = fa.images[Math.min(fa.images.length - 1, 10)];          // la flamme jaillit de la bouche
  await pause(1000); await p.evaluate(() => document.querySelectorAll('dialog[open]').forEach(d => d.close())); await pause(300);
  await passer('fourneau-bord', 'voyage-01-marche-bord', 300);
  await pause(400); await photo('ile-02-voie-lactee');
  // le pont : traversée (la marche sur le tablier), puis la sortie par l'autre bout
  await passer('vl-haut', 'voyage-02-pont-traversee', 260);
  await photo('ile-01-halle');
  await passer('halle-passe-plat', 'voyage-03-passe-plat', 330);
  await photo('ile-04-penderie');
  await passer('penderie-monte-plats', 'voyage-04-monte-plats-descendre', 420);
  await passer('fourneau-monte-plats', 'voyage-05-monte-plats-monter', 420);
  await passer('penderie-toboggan', 'voyage-06-toboggan', 460);
  await photo('ile-05-moule');
  await passer('moule-pelle', 'voyage-07-grande-pelle', 470);
  await photo('ile-06-grand-etal');
  // la Sieste : le panneau, puis « Rêver » (vers le Moule, près de son Four banal, allumé en passant)
  await apercu('grand-etal-sieste');
  { const pt = await point('grand-etal-sieste'); await tap(pt.x, pt.y); await pause(400); await calme(); await pause(500); }
  const fs1 = await filmer('final-sieste', async () => { const b = await p.$('[data-reve="moule-four"]') || await p.$('[data-reve="halle-four"]'); await b.click(); }, { pas: 40, apres: 6 });
  copier(image(fs1, 420), 'voyage-08-sieste');
  await calme(); await pause(600);
  // le Four banal : d'un four allumé à un autre (il entre dans la bouche du four)
  { const pt = await point(await ev(() => window.__orvane.ile) === 'moule' ? 'moule-four' : 'halle-four'); await tap(pt.x, pt.y); await pause(500); await tap(pt.x, pt.y); await pause(400); await calme(); await pause(1000); }
  const ff = await filmer('final-four', async () => { await p.click('#d-fiche [data-four="fourneau-four"]'); }, { pas: 40, apres: 6 });
  copier(image(ff, 320), 'voyage-09-four-banal');
  if (flamme) copier(flamme.f, 'voyage-10-four-allumage');
  await calme(); await pause(600);
  // la carte de l'Astrelier, devant le Four banal du Fourneau
  await p.click('#b-carte'); await pause(800);
  await photo('carte-astrelier-01', 0);
  await p.click('#d-carte footer [data-fermer]'); await pause(400);
  // la quête du tour : la carte de quête et son anneau doré
  await p.click('#b-carte'); await pause(600); await p.click('#carte-tour'); await pause(2800);
  await photo('quete-tour-01', 0);
  log('console : ' + (T.msgs.join(' | ') || 'vide'));
  await T.b.close();
})();
