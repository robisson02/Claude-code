// Passe 7 : filmer chaque passage (horloge arrêtée, une image toutes les 40 ms), puis une planche par passage.
// node films.js [reduit]
const { ouvrir, FILMS, CAPT } = require('./da-outils.js');
const { execSync } = require('child_process');
const reduit = process.argv[2] === 'reduit';
(async () => {
  const T = await ouvrir({ reduit });
  const { p, pause, log, ev, apercu, filmer, secondToucher, cap, calme } = T;
  await ev(() => window.__orvane.creer({ niveau: 12, classe: 'patissorcier' }));
  await pause(800);
  const pre = reduit ? 'r-' : '';
  const film = async (nom, id, dest) => {
    if (dest) { await ev(i => window.__orvane.jeu.changerIle({ ile: i }), dest); await pause(900); }
    const a = await apercu(id); log(nom + ' : ' + a.consigne);
    await cap(pre + 'apercu-' + nom);
    await filmer(pre + nom, secondToucher(id), { pas: 40, apres: 8 });
    await calme(); await pause(300);
  };
  // le Four banal : l'allumer (marche jusqu'à lui, la flamme, puis le panneau)
  {
    const a = await apercu('fourneau-four'); log('four : ' + a.consigne);
    await cap(pre + 'apercu-four-eteint');
    await filmer(pre + 'four-allumer', secondToucher('fourneau-four'), { toujours: true, images: 60, pas: 40 });
    await pause(1200); await cap(pre + 'four-panneau');
    await p.click('#d-fiche footer [data-fermer]'); await pause(300);
  }
  await film('marche-fourneau-vl', 'fourneau-bord');
  await film('pont-haut-halle', 'vl-haut');
  await film('passe-plat-halle', 'halle-passe-plat');
  await film('monte-plats-descente', 'penderie-monte-plats');
  await film('monte-plats-montee', 'fourneau-monte-plats');
  await film('toboggan', 'penderie-toboggan');
  await film('pelle', 'moule-pelle');
  // la Sieste : le panneau, puis « Rêver » vers la Halle
  {
    const a = await apercu('grand-etal-sieste'); log('sieste : ' + a.consigne);
    await cap(pre + 'apercu-sieste');
    const pt = await T.point('grand-etal-sieste'); await T.tap(pt.x, pt.y); await pause(300); await calme(); await pause(500);
    await cap(pre + 'sieste-panneau');
    await filmer(pre + 'sieste', async () => { await p.click('[data-reve="halle-four"]'); }, { pas: 40, apres: 8 });
    await calme(); await pause(300);
  }
  // le Four banal : de la Halle au Fourneau
  {
    const pt = await T.point('halle-four'); await T.tap(pt.x, pt.y); await pause(500); await T.tap(pt.x, pt.y); await pause(400); await calme(); await pause(900);
    await filmer(pre + 'four-halle-fourneau', async () => { await p.click('[data-four="fourneau-four"]'); }, { pas: 40, apres: 8 });
  }
  log('console : ' + (T.msgs.join(' | ') || 'vide'));
  await T.b.close();
  execSync(`python3 ${__dirname}/planche-films.py ${pre}`, { stdio: 'inherit' });
})();
