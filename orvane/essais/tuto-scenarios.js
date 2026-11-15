// Le tutoriel mis à l'épreuve (téléphone 390 × 844, au doigt) : « Non, je connais le jeu », « Suivre le tutoriel » dans les Réglages,
// « Passer » (deux touchers), « Recommencer le tutoriel », les choses faites dans le désordre (Grimoire d'abord, un autre groupe),
// Mère Fournil touchée sur le terrain, la page rechargée au milieu du combat, une défaite volontaire (abandon), puis la fin.
const { ouvrir } = require('./outils.js');
const { preparer } = require('./tuto-outils.js');
const fs = require('fs');
const DOSSIER = __dirname + '/tuto';
fs.mkdirSync(DOSSIER, { recursive: true });
(async () => {
  let o = await ouvrir({ w: 390, h: 844, dossier: DOSSIER });
  let { p, tap, tapSel, pause, log } = o;
  let T = preparer(o, 'scen');
  const etat = () => p.evaluate(() => window.__orvane.tuto());
  const texte = () => p.evaluate(() => { const c = document.getElementById('tuto-carte'); return c.hidden ? '(carte cachée)' : document.getElementById('tuto-texte').textContent.replace(/[\u00a0\u202f]/g, ' '); });
  const groupeTuto = () => p.evaluate(() => window.__orvane.groupes().filter(g => g.groupe === 'entrainement' && g.actif).length);
  const verifier = (ok, quoi) => log((ok ? '  OK  ' : '  !!  ') + quoi);
  const reglagesBalade = async () => { await tapSel('#b-reglages'); await pause(400); };

  // ---------- A. Nouvel artisan de niveau 5 : « Non, je connais le jeu » ----------
  log('A. Nouvel artisan de niveau 5, « Non, je connais le jeu »');
  await p.selectOption('#niveau', '5');
  await tapSel('#entrer');
  await p.waitForSelector('#tuto-non', { timeout: 15000 });
  await tapSel('#tuto-non');
  await pause(1400);
  const propose = await p.$('#prop-auto');
  verifier(!!propose, 'après « Non », le jeu propose de placer les points (niveau 5)');
  await T.capture('A-non-proposition-points');
  if (propose) await tapSel('#d-fiche footer [data-fermer]');
  await pause(400);
  // passe 7 : sans le tutoriel, Mère Fournil propose ensuite le tour de l'Astrelier (« Plus tard »)
  const tourPropose = await p.waitForSelector('#tour-oui', { timeout: 6000 }).catch(() => null);
  verifier(!!tourPropose, 'puis le jeu propose le tour de l\'Astrelier (facultatif)');
  if (tourPropose) { await tapSel('#d-fiche footer [data-fermer]'); await pause(400); }
  verifier((await etat()).statut === 'passe' && (await texte()) === '(carte cachée)' && !(await groupeTuto()), 'pas de carte de quête ni de Grumeau d\'entraînement');

  // ---------- B. Réglages : « Suivre le tutoriel », puis « Passer » en deux touchers ----------
  log('B. Réglages → « Suivre le tutoriel », puis « Passer »');
  await reglagesBalade();
  const lib = await p.textContent('#r-tuto');
  verifier(lib === 'Suivre le tutoriel', 'le bouton des Réglages dit « ' + lib + ' »');
  await T.capture('B-reglages-suivre');
  await tapSel('#r-tuto');
  await pause(900);
  verifier((await etat()).statut === 'actif' && (await groupeTuto()) === 1, 'quête commencée, Grumeau d\'entraînement apparu : « ' + (await texte()) + ' »');
  await T.capture('B-quete-commencee');
  await tapSel('#tuto-passer');
  await pause(300);
  verifier((await texte()) === 'Touche « Sûr ? » pour arrêter la quête.', 'premier toucher sur « Passer » : « ' + (await texte()) + ' »');
  await T.capture('B-passer-premier-toucher');
  await pause(4300);
  verifier((await etat()).statut === 'actif' && (await texte()) !== 'Touche « Sûr ? » pour arrêter la quête.', 'sans second toucher, rien ne se passe (4 s)');
  await tapSel('#tuto-passer'); await pause(250); await tapSel('#tuto-passer'); await pause(900);
  verifier((await etat()).statut === 'passe' && (await texte()) === '(carte cachée)' && !(await groupeTuto()), 'deux touchers : tutoriel passé, carte et Grumeau d\'entraînement partis');
  await T.capture('B-passe');

  // ---------- C. « Recommencer le tutoriel », puis tout dans le désordre ----------
  log('C. Réglages → « Recommencer le tutoriel », puis dans le désordre');
  await reglagesBalade();
  verifier((await p.textContent('#r-tuto')) === 'Recommencer le tutoriel', 'le bouton dit maintenant « Recommencer le tutoriel »');
  await tapSel('#r-tuto');
  await pause(900);
  let e = await T.lire();
  verifier(e.num === 1 && e.anneau, 'retour à l\'étape 1, anneau sur une case : « ' + e.texte + ' »');
  // le Grimoire d'abord (étape 9 en avance)
  await tapSel('#b-grimoire'); await pause(500);
  e = await T.lire(); await T.noter(e, true);
  verifier(/déclinaison/.test(e.dans || ''), 'Grimoire ouvert en avance : Mère Fournil en parle dans la fenêtre');
  await tapSel('#d-grimoire footer [data-fermer]'); await pause(600);
  verifier((await etat()).fait.grimoire === true, 'étape 9 comptée en avance (Grimoire ouvert puis fermé)');
  // Mère Fournil, touchée sur le terrain : la quête en entier
  const pnj = await p.evaluate(() => { const s = window.ORVANE.Proto.Jeu.sceneActive; return s.pnj ? s.vue.versEcran(s.pnj.c.x, s.pnj.c.y - 20) : null; });
  await tap(pnj.x, pnj.y); await pause(500);
  const journal = await p.$('.tuto-etapes');
  verifier(!!journal, 'toucher Mère Fournil ouvre la quête (étapes cochées)');
  await T.capture('C-mere-fournil');
  await tapSel('#d-fiche footer .or'); await pause(400);
  // un vrai groupe touché avant le Grumeau d'entraînement
  const reel = await p.evaluate(() => { const s = window.ORVANE.Proto.Jeu.sceneActive; const p = s.pionsGroupes.find(q => q && !q.groupe.tuto); return p ? s.vue.versEcran(p.c.x, p.c.y - 12) : null; });
  await tap(reel.x, reel.y); await pause(600);
  e = await T.lire(); await T.noter(e, true);
  verifier(/trop fort/.test(e.dans || '') && e.cible && /fermer|bouton/.test(e.cible.id), 'fiche d\'un vrai groupe : « ' + e.dans + ' »');
  await tap(e.cible.x, e.cible.y); await pause(500);
  // on suit l'écran jusqu'au combat (étape 5)
  e = await T.suivre(x => x.scene === 'combat' && x.num === 5 && x.cible && /sort/.test(x.cible.id));
  verifier(e.num === 5, 'au combat, étape 5 : « ' + e.texte + ' »');
  await T.capture('C-avant-rechargement');

  // ---------- D. La page rechargée au milieu du combat ----------
  log('D. Rechargement de la page au milieu du combat d\'entraînement');
  await p.reload();
  await p.waitForFunction(() => window.__orvane && window.__orvane.scene === 'creation', null, { timeout: 40000 });
  await pause(300);
  await tapSel('#reprendre');
  await pause(1500);
  e = await T.lire();
  verifier(e.num === 2 && /s'est arrêté/.test(e.texte) && e.anneau, 'après « Reprendre » : étape 2, « ' + e.texte + ' »');
  await T.noter(e, true);
  e = await T.suivre(x => x.scene === 'combat' && x.num >= 7);
  verifier(e.num === 7, 'les étapes déjà faites ne reviennent pas : étape 7, « ' + e.texte + ' »');

  // ---------- E. Défaite volontaire (abandon) ----------
  log('E. Défaite volontaire : Réglages du combat → Abandonner');
  await T.attendre();
  await tapSel('#b-reglages-combat'); await pause(400);
  await tapSel('#r-abandon'); await pause(200); await tapSel('#r-abandon');
  await p.waitForSelector('#d-addition[open]', { timeout: 20000 });
  await pause(800);
  e = await T.lire(); await T.noter(e, true);
  verifier(/Perdu/.test(e.dans || e.texte || '') && e.cible && e.cible.id === 'retour-balade', 'Addition de la défaite : « ' + (e.dans || e.texte) + ' »');
  await tap(e.cible.x, e.cible.y);
  await pause(1500);
  e = await T.lire(); await T.noter(e, true);
  verifier(e.num === 2 && /Pas grave/.test(e.texte) && (await groupeTuto()) === 1, 'au Fourneau : « ' + e.texte + ' », le Grumeau d\'entraînement est toujours là');

  // ---------- F. Jusqu'au bout ----------
  log('F. On reprend et on finit (les points de niveau 5 non placés : on n\'en place que 5)');
  e = await T.suivre(null);
  verifier(!!e.fin, 'quête finie');
  if (e.fin) { await T.capture('F-fin'); await tapSel('#d-fiche footer .or'); await pause(500); }
  // passe 6 : Mère Fournil propose ensuite « Le tour de l'Astrelier » ; on répond « Plus tard »
  const tour = await p.waitForSelector('#tour-oui', { timeout: 6000 }).then(() => true).catch(() => false);
  verifier(tour, 'après « Premier service » : la quête « Le tour de l\'Astrelier » est proposée');
  if (tour) { await tapSel('#d-fiche footer [data-fermer]'); await pause(400); }
  const fin = await p.evaluate(() => ({ t: window.__orvane.tuto(), p: window.__orvane.profil, reste: window.ORVANE.Proto.Profil.pointsRestants() }));
  log('État final : ' + JSON.stringify({ statut: fin.t.statut, prime: fin.t.prime, recompense: fin.t.recompense, niveau: fin.p.niveau, ble: fin.p.ble, pointsRestants: fin.reste }));
  // la récompense n'est donnée qu'une fois : on recommence et on regarde l'Addition et la fin
  await reglagesBalade();
  verifier((await p.textContent('#r-tuto')) === 'Recommencer le tutoriel', 'après la quête, les Réglages proposent « Recommencer le tutoriel »');
  await tapSel('#d-reglages footer [data-fermer]'); await pause(300);
  const petites = await o.petitesCibles();
  log('Cibles de moins de 44 px : ' + (petites.length ? petites.join(', ') : 'aucune'));
  log('Console : ' + (o.msgs.length ? o.msgs.join('\n') : 'vide'));
  T.ecrire('scen');
  await o.b.close();
})().catch(e => { console.error(e); process.exit(1); });
