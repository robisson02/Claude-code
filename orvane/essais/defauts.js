// Passe 7 : un essai par défaut signalé (débutant, robustesse, direction artistique), joué comme un joueur (doigt, souris, clavier).
// window.__orvane sert à LIRE l'état ; les mises en situation qui écrivent l'état sont marquées « mise en situation ».
// node defauts.js [partie…]  (sans argument : toutes)
const { ouvrir } = require('./outils.js');
const { outils } = require('./voyages-outils.js');
const fs = require('fs');
const DOSSIER = __dirname + '/captures';
fs.mkdirSync(DOSSIER, { recursive: true });
const voulu = process.argv.slice(2);
const bilan = [];
const ok = (cond, quoi, detail) => { bilan.push((cond ? 'OK     ' : 'ÉCHEC  ') + quoi + (detail ? ' — ' + detail : '')); console.log(bilan[bilan.length - 1]); return cond; };
const creer = (p, o) => p.evaluate(o => window.__orvane.creer(o), o);
const ev = (p, f, a) => p.evaluate(f, a);
const dialogues = p => ev(p, () => [...document.querySelectorAll('dialog')].filter(d => d.open).map(d => d.id));
const texteFenetre = (p, id) => ev(p, id => (document.querySelector('#' + id + ' .fenetre') || {}).innerText || '', id).then(t => t.replace(/\s+/g, ' ').trim());
const sp = s => String(s || '').replace(/[  ]/g, ' ');

async function partie(nom, o, fn) {
  if (voulu.length && !voulu.includes(nom)) return;
  console.log('\n=== ' + nom + ' ===');
  const T = await ouvrir(Object.assign({ dossier: DOSSIER }, o));
  T.V = outils(T);
  T.recharger = async () => {
    await T.p.reload(); await T.p.waitForFunction(() => window.__orvane && window.__orvane.scene === 'creation', null, { timeout: 30000 });
    await T.tapSel('#reprendre'); await T.p.waitForFunction(() => window.__orvane.scene === 'balade', null, { timeout: 20000 }); await T.pause(900);
  };
  try { await fn(T); } catch (e) { ok(false, nom + ' : exception', e.stack.split('\n').slice(0, 4).join(' | ')); await T.cap('d-' + nom + '-erreur').catch(() => {}); }
  ok(T.msgs.length === 0, nom + ' : console vide', T.msgs.join(' | ').slice(0, 400));
  fs.writeFileSync(__dirname + '/d-' + nom + '-journal.txt', T.journal.join('\n') + '\n\nConsole :\n' + (T.msgs.join('\n') || 'vide'));
  await T.b.close();
}
const voileLibre = p => ev(p, () => { const v = document.getElementById('voile'); return v.hidden || +getComputedStyle(v).opacity < .05; });

(async () => {
  // ---------- Robustesse 1 (grave) : un groupe vaincu revient au moment d'un passage → écran noir ----------
  await partie('retour-pendant-passage', { w: 390, h: 844 }, async T => {
    const { p, pause, V, cap, log, cdp } = T;
    await creer(p, { classe: 'levainqueur', niveau: 12 }); await pause(900);
    await V.prendre('fourneau-bord');                       // la Voie lactée (ses groupes existent maintenant)
    await V.prendre('vl-haut');                             // la Halle
    // mise en situation : le groupe du pont a été vaincu il y a longtemps (il doit revenir)
    await ev(p, () => { const m = window.__orvane.jeu.monde; m.parIle['voie-lactee'].groupes.forEach(g => { g.actif = false; g.revient = Date.now() - 1000; }); });
    // essai A : on force la minuterie de la vieille scène pendant le passage (le moment exact du défaut)
    const pt = await V.point('halle-bord'); await T.tap(pt.x, pt.y); await pause(420); await T.tap(pt.x, pt.y);
    await p.waitForFunction(() => { const ps = window.__orvane.jeu.passage; return ps && ps.couvert; }, null, { timeout: 15000, polling: 5 });
    const force = await ev(p, () => { const s = window.__orvane.jeu.sceneActive; try { s.verifierRetours(); return 'appelée'; } catch (e) { return 'erreur ' + e.message; } });
    await V.calme(); await pause(600);
    const e = await ev(p, () => ({ ile: window.__orvane.ile, groupes: window.__orvane.groupes(), passage: !!window.__orvane.jeu.passage }));
    ok(e.ile === 'voie-lactee' && !e.passage && await voileLibre(p), 'A : la minuterie pendant le passage ne bloque rien, la Voie lactée s\'ouvre', JSON.stringify({ force, e }));
    ok(e.groupes.every(g => /grumeau/.test(g.groupe)), 'A : les groupes du pont restent des Grumeaux', JSON.stringify(e.groupes));
    await cap('d-retour-pendant-a');
    // essai B : 24 allers-retours Halle ⇄ Voie lactée avec le processeur ralenti ×4, le groupe du pont toujours prêt à revenir
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
    let bloque = 0;
    for (let i = 0; i < 12; i++) {
      await ev(p, () => { const m = window.__orvane.jeu.monde; (m.parIle['voie-lactee'].groupes || []).forEach(g => { g.actif = false; g.revient = Date.now() + 300; }); });
      await V.prendre('vl-haut');
      if (!(await voileLibre(p)) || await V.ile() !== 'halle') bloque++;
      await ev(p, () => { const m = window.__orvane.jeu.monde; (m.parIle['voie-lactee'].groupes || []).forEach(g => { g.actif = false; g.revient = Date.now() + 200; }); });
      await V.prendre('halle-bord');
      if (!(await voileLibre(p)) || await V.ile() !== 'voie-lactee') bloque++;
    }
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
    ok(bloque === 0, 'B : 24 passages avec retours de groupe et processeur ralenti ×4, aucun écran bloqué', bloque + ' blocage(s)');
  });

  // ---------- Robustesse 2 et 3 : loin du Fourneau, l'anneau du tutoriel ; à Grand-Étal, la quête du tour ----------
  await partie('loin', { w: 390, h: 844 }, async T => {
    const { p, pause, V, cap, tapSel } = T;
    await creer(p, { classe: 'levainqueur', niveau: 1, tuto: true, repartir: false }); await pause(600);
    await p.waitForSelector('#tuto-oui', { timeout: 15000 }); await pause(300); await tapSel('#tuto-oui'); await pause(900);
    await V.prendre('fourneau-monte-plats'); await V.prendre('penderie-toboggan');
    await pause(500);
    const m = await ev(p, () => { const t = window.__orvane.tuto(); return { ile: window.__orvane.ile, cible: t.vue && t.vue.cible, texte: document.getElementById('tuto-texte').textContent, anneau: !document.getElementById('tuto-anneau').hidden }; });
    ok(m.ile === 'moule' && m.anneau && m.cible && m.cible.case && m.cible.case.join() === '4,4', 'tutoriel au Moule : l\'anneau doré sur le Four banal (éteint)', JSON.stringify(m));
    await cap('d-loin-tuto-moule');
    // le chemin du four : on le suit (on l'allume, on part vers un four allumé), jusqu'au Fourneau
    await V.toucher('moule-four', 2); await pause(400); await V.calme(); await pause(900);
    const f = await ev(p, () => [...document.querySelectorAll('#d-fiche [data-four]')].map(b => b.dataset.four));
    ok(f.includes('halle-four'), 'four du Moule allumé : on peut partir vers la Halle', JSON.stringify(f));
    // le tutoriel à Grand-Étal (artisan de niveau 26) : l'anneau sur le lit de la Sieste
    await ev(p, () => { document.querySelectorAll('dialog[open]').forEach(d => d.close()); });
    const T2 = await ouvrir({ dossier: DOSSIER });
    T2.V = outils(T2);
    try {
      await creer(T2.p, { classe: 'merlanceur', niveau: 26, tuto: true }); await T2.pause(600);
      await T2.p.waitForSelector('#tuto-oui', { timeout: 15000 }); await T2.pause(300); await T2.tapSel('#tuto-oui'); await T2.pause(900);
      await T2.V.prendre('fourneau-monte-plats'); await T2.V.prendre('penderie-toboggan'); await T2.V.prendre('moule-pelle'); await T2.pause(500);
      const g = await ev(T2.p, () => { const t = window.__orvane.tuto(); return { ile: window.__orvane.ile, cible: t.vue && t.vue.cible, anneau: !document.getElementById('tuto-anneau').hidden }; });
      ok(g.ile === 'grand-etal' && g.anneau && g.cible && g.cible.case && g.cible.case.join() === '7,3', 'tutoriel à Grand-Étal : l\'anneau doré sur le lit de farine', JSON.stringify(g));
      await T2.cap('d-loin-tuto-grand-etal');
      // la quête du tour à Grand-Étal (tutoriel passé) : la carte de quête envoie à la Sieste
      await ev(T2.p, () => window.__orvane.jeu.sceneActive && 0);
      await ev(T2.p, () => { ORVANE.Proto.Tuto.passer(); ORVANE.Proto.Astrelier.commencer(); });   // mise en situation : tutoriel passé, quête commencée
      await T2.pause(700);
      const q = await ev(T2.p, () => { const t = window.__orvane.tour(); return { cible: t.vue && t.vue.cible, texte: document.getElementById('tour-texte').textContent, anneau: !document.getElementById('tour-anneau').hidden }; });
      ok(q.cible && q.cible.join() === '7,3' && /sieste/.test(q.texte) && q.anneau, 'quête du tour à Grand-Étal : la carte envoie au lit de farine', JSON.stringify(q));
      await T2.cap('d-loin-tour-grand-etal');
      ok(T2.msgs.length === 0, 'loin (Grand-Étal) : console vide', T2.msgs.join(' | '));
    } finally { await T2.b.close(); }
  });

  // ---------- Débutant 3, robustesse 4 : « Reprendre la quête » garde les étapes faites ; numéros ; « Sûr ? » ----------
  await partie('reprendre', { w: 390, h: 844 }, async T => {
    const { p, pause, V, cap, tapSel, log } = T;
    await creer(p, { classe: 'traitreur', niveau: 2 }); await pause(900);
    await tapSel('#b-carte'); await pause(500); await tapSel('#carte-tour'); await pause(700);
    await V.prendre('fourneau-monte-plats'); await V.prendre('penderie-toboggan');
    let t = await ev(p, () => window.__orvane.tour());
    ok(t.fait['monte-plats'] && t.fait.toboggan, 'deux étapes faites', JSON.stringify(t.fait));
    const lire = () => ev(p, () => ({ etape: document.getElementById('tour-etape').textContent, texte: document.getElementById('tour-texte').textContent, bouton: document.getElementById('tour-arreter').textContent }));
    await pause(2600);
    let c = await lire(); log('carte : ' + JSON.stringify(c));
    const num = +((sp(c.etape).match(/Étape (\d)/) || [])[1]);
    const liste = await ev(p, () => ORVANE.Proto.Astrelier.ETAPES.map(e => e.id));
    const vue = t.vue;
    ok(/2 faites/.test(sp(c.etape)) && num >= 1, 'la carte de quête dit combien d\'étapes sont faites', c.etape);
    // le numéro est celui de la liste (carte et journal)
    const titres = await ev(p, () => ORVANE.Proto.Astrelier.ETAPES.map(e => e.titre));
    log('liste : ' + titres.join(' / ') + ' ; conseil : ' + JSON.stringify(vue));
    ok(vue && vue.num === num, 'numéro de l\'étape = numéro dans la liste', JSON.stringify({ num, vue: vue && vue.num }));
    await tapSel('#tour-arreter'); await pause(300);
    c = await lire();
    ok(sp(c.bouton).trim() === 'Sûr ?' && /Touche « Sûr \? »/.test(sp(c.texte)), '« Arrêter » : le texte dit le mot du bouton', JSON.stringify(c));
    await tapSel('#tour-arreter'); await pause(500);
    await tapSel('#b-carte'); await pause(500);
    const b = await ev(p, () => document.getElementById('carte-tour').textContent);
    ok(/Reprendre/.test(b), 'carte : « Reprendre la quête »', b);
    await cap('d-reprendre-carte');
    await tapSel('#carte-tour'); await pause(700);
    t = await ev(p, () => window.__orvane.tour());
    ok(t.statut === 'actif' && t.fait['monte-plats'] && t.fait.toboggan, 'reprise : les étapes faites sont gardées', JSON.stringify(t.fait));
    c = await lire();
    ok(/2 faites/.test(sp(c.etape)), 'reprise : « 2 faites »', c.etape);
    // le premier four allumé : « 1 sur 2 »
    await V.toucher('moule-four', 2);
    const bravo = await ev(p, () => new Promise(res => { const t0 = Date.now(); const f = () => { const t = document.getElementById('tour-etape').textContent; if (/Four allumé/.test(t) || Date.now() - t0 > 8000) res(t); else setTimeout(f, 50); }; f(); }));
    ok(/Four allumé : 1 sur 2/.test(sp(bravo)), 'premier four allumé : « 1 sur 2 »', bravo);
    await pause(900); await ev(p, () => document.querySelectorAll('dialog[open]').forEach(d => d.close()));
  });

  // ---------- Robustesse 5, 6 ; débutant 10 : double toucher, changer d'avis, appui long ----------
  await partie('gestes', { w: 390, h: 844 }, async T => {
    const { p, pause, V, cap, tap, appuiLong } = T;
    await creer(p, { classe: 'levainqueur', niveau: 3 }); await pause(900);
    // double toucher rapide (150 ms) sur la flèche : on part
    let pt = await V.enVue('fourneau-bord');
    await tap(pt.x, pt.y); await pause(150); await tap(pt.x, pt.y);
    await pause(300); await V.calme(); await pause(300);
    ok(await V.ile() === 'voie-lactee', 'double toucher sur un passage : on y va', await V.ile());
    await V.prendre('vl-bas');
    // appui long sur un objet : son étiquette, sans y aller
    pt = await V.enVue('fourneau-monte-plats');
    await appuiLong(pt.x, pt.y); await pause(400);
    const a = await ev(p, () => ({ apercu: window.__orvane.apercuVoyage(), consigne: document.getElementById('consigne-balade').textContent, ile: window.__orvane.ile }));
    ok(a.apercu === 'fourneau-monte-plats' && /Monte-plats/.test(a.consigne) && a.ile === 'fourneau', 'appui long : l\'étiquette du passage, sans partir', JSON.stringify(a));
    await cap('d-gestes-appui-long');
    // changer d'avis : deux touchers sur le monte-plats (la marche part), puis un toucher sur le Four banal
    pt = await V.point('fourneau-monte-plats'); await tap(pt.x, pt.y); await pause(200);
    const f = await V.point('fourneau-four'); await tap(f.x, f.y);
    await pause(2500); await V.calme(); await pause(300);
    ok(await V.ile() === 'fourneau', 'changer d\'avis en marchant : le premier voyage est oublié', await V.ile());
    // Échap (clavier) arrête la marche vers un passage : essayé dans la partie « clavier »
  });

  // ---------- Robustesse 7, 10, 11 : clavier pendant un passage, Échap, curseur après un passage ----------
  await partie('clavier', { w: 1280, h: 800, tel: false }, async T => {
    const { p, pause, V } = T;
    await creer(p, { classe: 'levainqueur', niveau: 3 }); await pause(900);
    await p.focus('canvas'); await p.keyboard.press('ArrowLeft'); await pause(100);
    // aller sur la flèche (0,4) au clavier : on lit sa case, on y amène le curseur
    const aller = async c => {
      for (let k = 0; k < 40; k++) {
        const cur = await ev(p, () => window.__orvane.jeu.sceneActive.curseur);
        if (!cur) { await p.keyboard.press('ArrowLeft'); continue; }
        if (cur[0] === c[0] && cur[1] === c[1]) return true;
        const essais = [];
        if (cur[0] !== c[0]) essais.push(cur[0] > c[0] ? 'ArrowLeft' : 'ArrowRight');
        if (cur[1] !== c[1]) essais.push(cur[1] > c[1] ? 'ArrowUp' : 'ArrowDown');
        for (const touche of essais.length > 1 && (k % 2) ? essais.reverse() : essais) {
          await p.keyboard.press(touche); await pause(40);
          const n = await ev(p, () => window.__orvane.jeu.sceneActive.curseur);
          if (n[0] !== cur[0] || n[1] !== cur[1]) break;
        }
      }
      return false;
    };
    await aller([0, 4]);
    await p.keyboard.press('Enter'); await pause(200); await p.keyboard.press('Enter'); await pause(250);
    // Échap pendant la marche : on ne part pas
    await p.keyboard.press('Escape'); await pause(2500); await V.calme();
    ok(await V.ile() === 'fourneau', 'Échap arrête la marche vers un passage', await V.ile());
    // pendant un passage : Tab vers « Carte », Entrée → rien ne s'ouvre
    await p.focus('canvas'); await aller([0, 4]);
    T.log('avant : ' + JSON.stringify(await ev(p, () => ({ cur: window.__orvane.jeu.sceneActive.curseur, moi: window.__orvane.moi(), ap: window.__orvane.apercuVoyage(), focus: document.activeElement && document.activeElement.tagName }))));
    await p.keyboard.press('Enter'); await pause(150); await p.keyboard.press('Enter'); await pause(150);
    T.log('après : ' + JSON.stringify(await ev(p, () => ({ cur: window.__orvane.jeu.sceneActive.curseur, ap: window.__orvane.apercuVoyage(), cible: window.__orvane.jeu.sceneActive.cible, ensuite: !!window.__orvane.jeu.sceneActive.ensuite }))));
    await p.waitForFunction(() => !!window.__orvane.jeu.passage, null, { timeout: 15000, polling: 5 });
    await ev(p, () => document.getElementById('b-carte').focus());
    await p.keyboard.press('Enter'); await pause(50); await p.keyboard.press('Enter');
    await V.calme(); await pause(500);
    ok(!(await dialogues(p)).length && await V.ile() === 'voie-lactee', 'clavier pendant un passage : aucune fenêtre ne s\'ouvre', JSON.stringify(await dialogues(p)));
    // après le passage : le curseur est sur la case de l'artisan, Entrée marche
    await p.focus('canvas'); await pause(100);
    const cur = await ev(p, () => ({ c: window.__orvane.jeu.sceneActive.curseur, moi: window.__orvane.moi(), clavier: window.__orvane.jeu.clavierActif }));
    ok(cur.c && cur.moi && cur.c[0] === cur.moi[0] && cur.c[1] === cur.moi[1], 'après un passage, le curseur est sur sa case', JSON.stringify(cur));
    await p.keyboard.press('ArrowUp'); await pause(80); await p.keyboard.press('Enter'); await pause(1200); await V.calme();
    const m2 = await ev(p, () => window.__orvane.moi());
    ok(m2[0] !== cur.moi[0] || m2[1] !== cur.moi[1], 'puis une flèche et Entrée : il marche', JSON.stringify(m2));
  });

  // ---------- Robustesse 8 et 9 : recharger à la fin d'un passage ; recharger debout sur la maison d'un groupe ----------
  await partie('recharge', { w: 390, h: 844 }, async T => {
    const { p, pause, V, tapSel, recharger } = T;
    await creer(p, { classe: 'traitreur', niveau: 12 }); await pause(900);
    await tapSel('#b-carte'); await pause(500); await tapSel('#carte-tour'); await pause(700);
    // recharger juste après que le voile est posé (l'île d'arrivée est sauvée) : l'étape du monte-plats est comptée
    const pt = await V.point('fourneau-monte-plats'); await T.tap(pt.x, pt.y); await pause(420); await T.tap(pt.x, pt.y);
    await p.waitForFunction(() => { const ps = window.__orvane.jeu.passage; return ps && ps.couvert; }, null, { timeout: 15000, polling: 5 });
    await recharger();
    let t = await ev(p, () => window.__orvane.tour());
    ok(await V.ile() === 'penderie' && t.fait['monte-plats'], 'recharger pendant l\'arrivée : l\'étape est gardée', JSON.stringify({ ile: await V.ile(), fait: t.fait }));
    // le pont : on entre par le bas, on recharge pendant la sortie par le haut → l'étape « pont » est gardée
    await V.prendre('penderie-monte-plats'); await V.prendre('fourneau-bord');
    const ph = await V.enVue('vl-haut'); await T.tap(ph.x, ph.y); await pause(420); await T.tap(ph.x, ph.y);
    await p.waitForFunction(() => { const ps = window.__orvane.jeu.passage; return ps && ps.couvert; }, null, { timeout: 30000, polling: 5 });
    await recharger();
    t = await ev(p, () => window.__orvane.tour());
    ok(await V.ile() === 'halle' && t.fait.pont, 'recharger pendant la sortie du pont : la traversée est gardée', JSON.stringify(t.fait));
    // la maison du groupe du pont : mise en situation, le groupe est vaincu et l'artisan va sur sa maison, puis on recharge
    await V.prendre('halle-bord');
    const maison = await ev(p, () => window.__orvane.jeu.monde.groupes[0].maison);
    await ev(p, () => { window.__orvane.jeu.monde.groupes.forEach(g => { g.actif = false; g.revient = Date.now() + 999999; }); const s = window.__orvane.jeu.sceneActive; s.pionsGroupes.forEach(x => x && x.detruire()); s.pionsGroupes = []; });
    await ev(p, c => window.__orvane.toucherCase(c), maison); await pause(300); await V.calme();
    const moi = await ev(p, () => window.__orvane.moi());
    await recharger();
    const apres = await ev(p, () => ({ moi: window.__orvane.moi(), groupes: window.__orvane.groupes() }));
    ok(moi.join() === maison.join() && apres.moi.join() === maison.join() && apres.groupes.every(g => g.case.join() !== maison.join()), 'recharger debout sur la maison d\'un groupe : le groupe se pose à côté', JSON.stringify({ maison, apres }));
  });

  // ---------- Débutant 1, 2, 5 : Penderie (passe-plat et monte-plats séparés), crêpe du toboggan, étal ----------
  await partie('touchers', { w: 390, h: 844 }, async T => {
    const { p, pause, V, cap, tap } = T;
    await creer(p, { classe: 'levainqueur', niveau: 12 }); await pause(900);
    await V.prendre('fourneau-monte-plats');
    // chaque point opaque du dessin du passe-plat choisit le passe-plat ; chaque point de la caisse et du treuil, le monte-plats
    const essai = async (id, attendu) => {
      const pts = await ev(p, id => {
        const s = window.__orvane.jeu.sceneActive, r = s.objetsVoyage.find(x => x.o.id === id), l = [];
        [r.im, r.cordes].filter(Boolean).forEach(im => { const b = im.getBounds(); for (let i = 1; i < 6; i++) for (let j = 1; j < 8; j++) { const wx = b.x + b.width * i / 6, wy = b.y + b.height * j / 8; const px = Math.floor((wx - im.x) / im.scaleX + im.displayOriginX), py = Math.floor((wy - im.y) / im.scaleY + im.displayOriginY); if (s.textures.getPixelAlpha(px, py, im.texture.key) > 120) { const e = s.vue.versEcran(wx, wy); l.push(e); } } });
        return l;
      }, id);
      let bons = 0, n = 0;
      for (const q of pts) {
        const r = await ev(p, q => { const s = window.__orvane.jeu.sceneActive, t = s.sousLeDoigt(q.x, q.y); if (t.pion) return 'pion'; const o = ORVANE.Proto.Voyage.objetSous(s, t); return o ? o.o.id : null; }, q);
        if (r === 'pion') continue;
        n++; if (r === attendu) bons++;
      }
      return { bons, n };
    };
    const pp = await essai('penderie-passe-plat', 'penderie-passe-plat'), mp = await essai('penderie-monte-plats', 'penderie-monte-plats');
    ok(pp.n > 5 && pp.bons === pp.n, 'Penderie : toucher le dessin du passe-plat choisit toujours le passe-plat', JSON.stringify(pp));
    ok(mp.n > 5 && mp.bons === mp.n, 'Penderie : toucher la caisse ou le treuil choisit le monte-plats', JSON.stringify(mp));
    const tb = await essai('penderie-toboggan', 'penderie-toboggan');
    ok(tb.n > 5 && tb.bons / tb.n >= .95, 'toboggan : la crêpe se touche partout (près de l\'île aussi)', JSON.stringify(tb));
    // au doigt : le haut de la crêpe, près de l'île
    const haut = await ev(p, () => { const s = window.__orvane.jeu.sceneActive, r = s.objetsVoyage.find(x => x.o.id === 'penderie-toboggan'), c = r.o.case, w = ORVANE.Proto.iso(c[0], c[1]); return s.vue.versEcran(w.x - 4, w.y + 14); });
    await tap(haut.x, haut.y); await pause(500);
    ok(await ev(p, () => window.__orvane.apercuVoyage()) === 'penderie-toboggan', 'au doigt, le haut de la crêpe montre le toboggan', JSON.stringify(haut));
    await cap('d-touchers-crepe');
    await V.prendre('penderie-passe-plat');
    // l'étal de la Halle, touché dans le jour entre l'auvent et le comptoir
    const jour = await ev(p, () => { const s = window.__orvane.jeu.sceneActive, r = s.objetsVoyage.find(x => x.o.id === 'halle-etal-pain'), b = r.im.getBounds(); return s.vue.versEcran(b.centerX, b.y + b.height * .45); });
    await V.enVue('halle-etal-pain');
    const jour2 = await ev(p, () => { const s = window.__orvane.jeu.sceneActive, r = s.objetsVoyage.find(x => x.o.id === 'halle-etal-pain'), b = r.im.getBounds(); return s.vue.versEcran(b.centerX, b.y + b.height * .45); });
    await tap(jour2.x, jour2.y); await pause(500);
    const e = await ev(p, () => ({ apercu: window.__orvane.apercuVoyage(), consigne: document.getElementById('consigne-balade').textContent }));
    ok(e.apercu === 'halle-etal-pain' && /Bientôt/.test(e.consigne) && !/ : L| : « B/.test(e.consigne), 'étal touché en son milieu : « Bientôt ! »', JSON.stringify({ jour, e }));
  });

  // ---------- Débutant 4 : le tour proposé sans le tutoriel, et au retour s'il ne l'a jamais été ----------
  await partie('propositions', { w: 390, h: 844 }, async T => {
    const { p, pause, tapSel, recharger, cap } = T;
    await creer(p, { classe: 'levainqueur', niveau: 1, tuto: true, repartir: false }); await pause(600);
    await p.waitForSelector('#tuto-non', { timeout: 15000 }); await pause(300); await tapSel('#tuto-non');
    await p.waitForFunction(() => document.getElementById('d-fiche').open && /tour de l'Astrelier/i.test(document.getElementById('d-fiche').textContent), null, { timeout: 15000 }).catch(() => {});
    const t = await ev(p, () => ({ ouvert: document.getElementById('d-fiche').open, texte: document.getElementById('d-fiche').innerText }));
    ok(t.ouvert && /Le tour de l'Astrelier/.test(t.texte) && /Oui, j'y vais/.test(t.texte), '« Non, je connais le jeu » : le tour est proposé quand même', t.texte.slice(0, 160));
    await cap('d-propositions-sans-tuto');
    await tapSel('#d-fiche footer [data-fermer]'); await pause(300);
    // mise en situation : le tutoriel est fini, le tour jamais proposé (le jeu fermé pendant la fenêtre de fin)
    await ev(p, () => { const pr = window.__orvane.profil; pr.tuto.statut = 'fini'; delete pr.tour; ORVANE.Proto.Profil.sauver(); });
    await recharger(); await pause(1200);
    const r = await ev(p, () => ({ ouvert: document.getElementById('d-fiche').open, texte: document.getElementById('d-fiche').innerText }));
    ok(r.ouvert && /Le tour de l'Astrelier/.test(r.texte), 'au retour : le tour jamais proposé l\'est', r.texte.slice(0, 120));
    await tapSel('#d-fiche footer [data-fermer]'); await pause(300);
    // la question du tutoriel restée sans réponse (jeu fermé) revient au retour
    const T3 = await ouvrir({ dossier: DOSSIER });
    try {
      await creer(T3.p, { classe: 'levainqueur', niveau: 1, tuto: true, repartir: false }); await T3.pause(600);
      await T3.p.waitForSelector('#tuto-oui', { timeout: 15000 });
      await T3.p.reload(); await T3.p.waitForFunction(() => window.__orvane && window.__orvane.scene === 'creation', null, { timeout: 30000 });
      await T3.tapSel('#reprendre'); await T3.pause(1600);
      const q = await ev(T3.p, () => !!document.getElementById('tuto-oui') && document.getElementById('d-fiche').open);
      ok(q, 'au retour : « Suivre le tutoriel ? » revient', String(q));
      ok(T3.msgs.length === 0, 'propositions (retour) : console vide', T3.msgs.join(' | '));
    } finally { await T3.b.close(); }
    // la liste des niveaux de départ (essai) a 12
    const T4 = await ouvrir({ dossier: DOSSIER });
    try { const l = await ev(T4.p, () => [...document.querySelectorAll('#niveau option')].map(o => o.value)); ok(l.includes('12'), 'écran de création : le niveau 12 dans la liste', l.join(',')); } finally { await T4.b.close(); }
  });

  // ---------- Direction artistique 1, 14, 16 : sens du monte-plats, caisse à l'arrivée, vue immobile au départ du pont ----------
  await partie('mouvements', { w: 390, h: 844 }, async T => {
    const { p, pause, V } = T;
    await creer(p, { classe: 'levainqueur', niveau: 12 }); await pause(900);
    await V.prendre('fourneau-monte-plats');
    // descendre : la caisse va vers le bas pendant le départ
    const pt = await V.point('penderie-monte-plats'); await T.tap(pt.x, pt.y); await pause(420); await T.tap(pt.x, pt.y);
    const y0 = await ev(p, () => { const s = window.__orvane.jeu.sceneActive; return s.objetsVoyage.find(x => x.o.id === 'penderie-monte-plats').caisse.y; });
    await p.waitForFunction(() => { const ps = window.__orvane.jeu.passage; return ps && performance.now() - ps.debut > 480; }, null, { timeout: 15000, polling: 5 });
    const y1 = await ev(p, () => { const s = window.__orvane.jeu.sceneActive; return s.objetsVoyage.find(x => x.o.id === 'penderie-monte-plats').caisse.y; });
    ok(y1 > y0 + 20, 'monte-plats « descendre » : la caisse descend', JSON.stringify({ y0, y1 }));
    // à l'arrivée au Fourneau : la caisse n'est jamais visible seule, loin de sa place
    const seule = await ev(p, () => new Promise(res => {
      let vu = false; const t0 = Date.now();
      const f = () => { const s = window.__orvane.jeu.sceneActive; if (s && s.ileId === 'fourneau' && s.objetsVoyage) { const r = s.objetsVoyage.find(x => x.o.id === 'fourneau-monte-plats'), c = r && r.caisse; if (c && s.moi && c.alpha > .3 && s.moi.c.alpha < .1) vu = true; } if (Date.now() - t0 < 2500) requestAnimationFrame(f); else res(vu); };
      f();
    }));
    await V.calme();
    ok(!seule && await V.ile() === 'fourneau', 'à l\'arrivée, la caisse apparaît avec l\'artisan', String(seule));
    // la vue ne glisse pas pendant le départ par le haut du pont
    await V.prendre('fourneau-bord');
    const ph = await V.enVue('vl-haut'); await T.tap(ph.x, ph.y); await pause(420); await T.tap(ph.x, ph.y);
    await p.waitForFunction(() => !!window.__orvane.jeu.passage, null, { timeout: 30000, polling: 5 });
    const c0 = await ev(p, () => { const c = window.__orvane.jeu.sceneActive.cam; return [c.scrollX, c.scrollY]; });
    await p.waitForFunction(() => { const ps = window.__orvane.jeu.passage; return !ps || ps.depart; }, null, { timeout: 15000, polling: 5 });
    const c1 = await ev(p, () => { const s = window.__orvane.jeu.sceneActive; const c = s.cam; return [c.scrollX, c.scrollY]; });
    ok(Math.hypot(c1[0] - c0[0], c1[1] - c0[1]) < 6, 'la vue reste immobile pendant le départ', JSON.stringify({ c0, c1 }));
    await V.calme();
  });

  // ---------- Direction artistique 2 : les étiquettes de premier toucher restent dans l'écran (390 et 360) ----------
  for (const [nom, o] of [['etiquettes-390', { w: 390, h: 844 }], ['etiquettes-360', { w: 360, h: 740 }]]) {
    await partie(nom, o, async T => {
      const { p, pause, V } = T;
      await creer(p, { classe: 'levainqueur', niveau: 1 }); await pause(900);
      const iles = ['fourneau', 'voie-lactee', 'halle', 'penderie', 'moule', 'grand-etal'];
      let n = 0, mauvais = [];
      for (const ile of iles) {
        await ev(p, i => window.__orvane.jeu.changerIle({ ile: i }), ile); await pause(900);
        for (const ob of await V.objets()) {
          await V.toucher(ob.id, 1); await pause(150);
          const e = await ev(p, () => { const s = window.__orvane.jeu.sceneActive, l = s.plateau.etiquettes.filter(t => t.etiquette); return l.map(t => { const b = t.getBounds(), a = s.vue.versEcran(b.x, b.y), c = s.vue.versEcran(b.right, b.bottom); return { x0: a.x, x1: c.x, y0: a.y, texte: t.text }; }); });
          e.forEach(x => { n++; if (x.x0 < 0 || x.x1 > innerW(o) || x.y0 < 0) mauvais.push(ob.id + ' ' + JSON.stringify(x)); });
          await ev(p, () => { const s = window.__orvane.jeu.sceneActive; ORVANE.Proto.Voyage.annuler(s); });
        }
      }
      ok(n >= 20 && mauvais.length === 0, `${nom} : ${n} étiquettes, toutes dans l'écran`, mauvais.join(' | ').slice(0, 500));
    });
  }

  fs.writeFileSync(__dirname + '/defauts-bilan.txt', bilan.join('\n') + '\n');
  const ech = bilan.filter(l => l.startsWith('ÉCHEC')).length;
  console.log(`\n${bilan.length - ech} OK, ${ech} échec(s)`);
})();
function innerW(o) { return o.w; }
