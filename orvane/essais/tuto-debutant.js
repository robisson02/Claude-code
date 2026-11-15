// Passe 6 (repris de la passe 5) : le tutoriel joué comme un débutant complet : on ne suit que ce que l'écran montre (la carte de quête, l'anneau doré),
// au doigt (ou à la souris avec --ordi). window.__orvane ne sert qu'à LIRE l'état.
// node tuto-debutant.js [--ordi] [--w=390 --h=844] [--classe=patissorcier] [--prefixe=tel] [--reduit]
const { ouvrir } = require('./outils.js');
const { preparer } = require('./tuto-outils.js');
const fs = require('fs');
const arg = (n, d) => { const a = process.argv.find(x => x.startsWith('--' + n + '=')); return a ? a.split('=')[1] : d; };
const ordi = process.argv.includes('--ordi');
const W = +arg('w', ordi ? 1280 : 390), H = +arg('h', ordi ? 800 : 844), PREF = arg('prefixe', ordi ? 'ordi' : 'tel'), CLASSE = arg('classe', '');
const DOSSIER = __dirname + '/tuto';
fs.mkdirSync(DOSSIER, { recursive: true });
(async () => {
  const o = await ouvrir({ w: W, h: H, tel: !ordi, dossier: DOSSIER, reduit: process.argv.includes('--reduit') });
  const { p, tapSel, pause, log } = o;
  const T = preparer(o, PREF);
  log(`Écran ${W} × ${H}, ${ordi ? 'souris' : 'doigt'}${CLASSE ? ', classe ' + CLASSE : ''}`);
  if (CLASSE) { await tapSel(`[data-classe="${CLASSE}"]`); await pause(200); }
  await tapSel('#entrer');
  await p.waitForSelector('#tuto-oui', { timeout: 15000 });
  await pause(400);
  await T.capture('e0-proposition');
  log('Proposition : « ' + (await p.textContent('#d-fiche .corps')).trim().replace(/\s+/g, ' ') + ' »');
  await tapSel('#tuto-oui');
  await pause(900);
  const fin = await T.suivre(null);
  let ok = !!fin.fin;
  if (ok) {
    await pause(300);
    log('Fin : « ' + (await p.textContent('#d-fiche .corps')).trim().replace(/\s+/g, ' ') + ' »');
    await T.capture('fin-de-quete');
    await tapSel('#d-fiche footer .or');
  } else log('!! La quête ne s\'est pas finie : ' + JSON.stringify(fin));
  await pause(700);
  const t = await p.evaluate(() => ({ tuto: window.__orvane.tuto(), profil: window.__orvane.profil }));
  log('État final : ' + JSON.stringify({ statut: t.tuto && t.tuto.statut, fait: t.tuto && Object.keys(t.tuto.fait).length, niveau: t.profil.niveau, xp: t.profil.xp, ble: t.profil.ble, sac: t.profil.sac, carac: t.profil.carac }));
  const carte = await p.evaluate(() => !document.getElementById('tuto-carte').hidden);
  log('Carte de quête encore visible : ' + carte);
  // passe 6 : Mère Fournil propose ensuite « Le tour de l'Astrelier » (facultative)
  const tour = await p.waitForSelector('#tour-oui', { timeout: 6000 }).then(() => true).catch(() => false);
  log('Quête « Le tour de l\'Astrelier » proposée : ' + tour);
  if (tour) {
    log('Proposition : « ' + (await p.textContent('#d-fiche .corps')).trim().replace(/\s+/g, ' ') + ' »');
    await T.capture('proposition-tour');
    await tapSel('#tour-oui'); await pause(900);
    const c = await p.evaluate(() => ({ visible: !document.getElementById('tour-carte').hidden, texte: document.getElementById('tour-texte').textContent, anneau: !document.getElementById('tour-anneau').hidden }));
    log('Carte du tour : ' + JSON.stringify(c));
    if (!c.visible) ok = false;
  } else ok = false;
  await T.capture('apres-quete');
  const petites = await o.petitesCibles();
  log('Cibles de moins de 44 px : ' + (petites.length ? petites.join(', ') : 'aucune'));
  log('Console : ' + (o.msgs.length ? o.msgs.join('\n') : 'vide'));
  T.ecrire(PREF);
  await o.b.close();
  if (!ok) process.exit(2);
})().catch(e => { console.error(e); process.exit(1); });
