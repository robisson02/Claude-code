// Passe 6 : les voyages entre les îles, joués comme un joueur (doigt sur téléphone, souris ou clavier sur ordinateur).
// window.__orvane sert à LIRE l'état (l'île, les objets à l'écran, le lieu sauvé, le dernier passage) ; quelques mises en situation
// écrivent l'état (marquées « mise en situation »). node voyages.js [partie…]  (sans argument : toutes)
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
const texteFenetre = (p, id) => ev(p, id => (document.querySelector('#' + id + ' .fenetre') || {}).innerText || '', id).then(t => t.replace(/[\s\u00a0\u202f]+/g, ' ').trim());

async function partie(nom, o, fn) {
  if (voulu.length && !voulu.includes(nom)) return;
  console.log('\n=== ' + nom + ' ===');
  const T = await ouvrir(Object.assign({ dossier: DOSSIER }, o));
  T.V = outils(T);
  try { await fn(T); } catch (e) { ok(false, nom + ' : exception', e.stack.split('\n').slice(0, 4).join(' | ')); await T.cap(nom + '-erreur').catch(() => {}); }
  ok(T.msgs.length === 0, nom + ' : console vide', T.msgs.join(' | ').slice(0, 400));
  fs.writeFileSync(__dirname + '/' + nom + '-journal.txt', T.journal.join('\n') + '\n\nConsole :\n' + (T.msgs.join('\n') || 'vide'));
  await T.b.close();
}
// Un passage : vérifie l'île d'arrivée, la durée (1,5 s au plus), la case d'arrivée (le sol), la sauvegarde
async function passer(T, id, ileAttendue, prefixe) {
  const { p, cap } = T;
  const r = await T.V.prendre(id);
  const lieu = await ev(p, () => window.__orvane.lieu()), moi = await ev(p, () => window.__orvane.moi());
  ok(r.vers === ileAttendue, `${id} : arrivée ${ileAttendue}`, `${r.de} → ${r.vers}, ${r.genre}`);
  ok(r.duree != null && r.duree <= 1500, `${id} : passage en 1,5 s au plus`, r.duree + ' ms');
  ok(lieu && lieu.ile === r.vers && moi && lieu.case && lieu.case[0] === moi[0] && lieu.case[1] === moi[1], `${id} : île et case sauvées`, JSON.stringify({ lieu: lieu && [lieu.ile, lieu.case], moi }));
  if (prefixe) await cap(prefixe);
  return r;
}

(async () => {
  // ---------- Tous les moyens, dans chaque sens (téléphone, au doigt) ----------
  await partie('aller-retour', { w: 390, h: 844 }, async T => {
    const { p, pause, cap, log, V } = T;
    await creer(p, { classe: 'patissorcier', niveau: 1 }); await pause(900);
    ok(await V.ile() === 'fourneau', 'un nouvel artisan commence au Fourneau');
    await cap('tel-01-fourneau');
    // le Four banal du Fourneau : premier toucher = où il mène ; second = on y va, il s'allume, son panneau s'ouvre
    let t = await V.toucher('fourneau-four', 1);
    ok(/Four banal du Fourneau, éteint/.test(t.consigne), 'four éteint : premier toucher, il le dit', t.consigne);
    await cap('tel-02-four-apercu');
    const pt = await V.point('fourneau-four'); await T.tap(pt.x, pt.y);
    await pause(400); await V.calme(); await pause(700);
    ok((await dialogues(p)).includes('d-fiche') && /Four banal du Fourneau/.test(await texteFenetre(p, 'd-fiche')), 'four : panneau des fours allumés', await texteFenetre(p, 'd-fiche'));
    ok((await ev(p, () => window.__orvane.lieu().fours))['fourneau-four'] === true, 'Four banal du Fourneau allumé et sauvé');
    await cap('tel-03-four-panneau');
    await p.click('#d-fiche footer [data-fermer]'); await pause(300);
    // la marche par le bord, dans les deux sens, et la traversée du pont
    await passer(T, 'fourneau-bord', 'voie-lactee', 'tel-04-voie-lactee');
    await passer(T, 'vl-haut', 'halle', 'tel-05-halle');
    await passer(T, 'halle-bord', 'voie-lactee');
    await passer(T, 'vl-bas', 'fourneau');
    // le monte-plats : monter, descendre, remonter
    await passer(T, 'fourneau-monte-plats', 'penderie', 'tel-06-penderie');
    await passer(T, 'penderie-monte-plats', 'fourneau');
    await passer(T, 'fourneau-monte-plats', 'penderie');
    // le passe-plat : vers la Halle, et retour
    await passer(T, 'penderie-passe-plat', 'halle');
    await passer(T, 'halle-passe-plat', 'penderie');
    // le toboggan (sens unique)
    t = await V.toucher('penderie-toboggan', 1);
    ok(/sens unique|ne se remonte pas/.test(t.consigne), 'toboggan : il dit qu\'il est à sens unique', t.consigne);
    await cap('tel-07-toboggan-apercu');
    const pt2 = await V.point('penderie-toboggan'); await T.tap(pt2.x, pt2.y);
    await pause(400); await V.calme(); await pause(300);
    ok(await V.ile() === 'moule', 'toboggan : arrivée au Moule');
    await cap('tel-08-moule');
    ok(!(await V.objets()).some(o => o.genre === 'toboggan'), 'au Moule, pas de toboggan pour remonter');
    t = await V.toucher('moule-bas-toboggan', 1);
    log('bas du toboggan : ' + t.consigne);
    // la Grande Pelle est fermée au niveau 1
    t = await V.toucher('moule-pelle', 2); await pause(500);
    ok(/niveau 12/.test(t.consigne) && await V.ile() === 'moule', 'Grande Pelle fermée sous le niveau 12, avec une phrase claire', t.consigne);
    await cap('tel-09-pelle-fermee');
    // le Four banal du Moule : on l'allume, on part vers le Fourneau
    await V.toucher('moule-four', 2); await pause(400); await V.calme(); await pause(600);
    const txt = await texteFenetre(p, 'd-fiche');
    ok(/Le Fourneau/.test(txt) && /La Halle des Ébauches/.test(txt), 'four du Moule : les autres fours allumés', txt);
    await cap('tel-10-four-moule');
    await p.click('#d-fiche [data-four="fourneau-four"]'); await pause(400); await V.calme(); await pause(300);
    let d = await ev(p, () => window.__orvane.dernierPassage);
    ok(await V.ile() === 'fourneau' && d && d.genre === 'four' && d.duree <= 1500, 'four : Moule → Fourneau', JSON.stringify(d));
    // depuis le Fourneau, vers la Halle (toujours allumé), puis de la Halle vers le Moule
    await V.toucher('fourneau-four', 2); await pause(400); await V.calme(); await pause(500);
    await p.click('#d-fiche [data-four="halle-four"]'); await pause(400); await V.calme(); await pause(300);
    ok(await V.ile() === 'halle', 'four : Fourneau → Halle');
    await V.toucher('halle-four', 2); await pause(400); await V.calme(); await pause(500);
    await p.click('#d-fiche [data-four="moule-four"]'); await pause(400); await V.calme(); await pause(300);
    ok(await V.ile() === 'moule', 'four : Halle → Moule');
    const lieu = await ev(p, () => window.__orvane.lieu());
    ok(Object.keys(lieu.visitees).length === 5, 'îles visitées sauvées', JSON.stringify(lieu.visitees));
    const etal = await (async () => { await passer(T, 'moule-four', 'moule').catch(() => {}); })();
  });

  // ---------- La Grande Pelle et la Sieste (niveau 12) ----------
  await partie('pelle-sieste', { w: 390, h: 844 }, async T => {
    const { p, pause, cap, log, V } = T;
    await creer(p, { classe: 'merlanceur', niveau: 12 }); await pause(900);
    // mise en situation : l'artisan a déjà découvert le Moule (on y va par le toboggan, comme un joueur)
    await V.prendre('fourneau-monte-plats'); await V.prendre('penderie-toboggan');
    let t = await V.toucher('moule-pelle', 1);
    ok(/Tu quittes l'Astrelier\s?: tu pourras revenir en faisant la sieste/.test(t.consigne.replace(/ /g, ' ')), 'Grande Pelle : premier toucher, la confirmation', t.consigne);
    await cap('tel-11-pelle-confirmation');
    const pt = await V.point('moule-pelle'); await T.tap(pt.x, pt.y);
    await pause(400); await V.calme(); await pause(400);
    const d = await ev(p, () => window.__orvane.dernierPassage);
    ok(await V.ile() === 'grand-etal' && d.genre === 'pelle' && d.duree <= 1500, 'Grande Pelle : le Défournement vers Grand-Étal', JSON.stringify(d));
    await cap('tel-12-grand-etal');
    const pan = await V.toucher('grand-etal-pancarte', 1);
    ok(/La suite du monde arrive bientôt/.test(pan.consigne), 'Grand-Étal : la pancarte', pan.consigne);
    // le Four banal de Grand-Étal : un réseau à part
    await V.toucher('grand-etal-four', 2); await pause(400); await V.calme(); await p.waitForFunction(() => document.getElementById('d-fiche').open, null, { timeout: 5000 }).catch(() => {}); await pause(200);
    const txt = await texteFenetre(p, 'd-fiche');
    ok(/seul Four banal de ce côté du monde/.test(txt) && !/Le Fourneau/.test(txt), 'Grand-Étal : son four est à part (réseau séparé)', txt);
    await p.click('#d-fiche footer [data-fermer]'); await pause(300);
    // la Sieste : se réveiller à la Halle
    await V.toucher('grand-etal-sieste', 2); await pause(400); await V.calme(); await pause(500);
    const s = await texteFenetre(p, 'd-fiche');
    ok(/Où veux-tu te réveiller/.test(s) && /La Halle des Ébauches/.test(s), 'Sieste : choisir où se réveiller', s);
    await cap('tel-13-sieste');
    await p.click('#d-fiche [data-reve="halle-four"]'); await pause(400); await V.calme(); await pause(300);
    let dp = await ev(p, () => window.__orvane.dernierPassage);
    ok(await V.ile() === 'halle' && dp.genre === 'sieste' && dp.duree <= 1500, 'Sieste : retour à la Halle en rêvant', JSON.stringify(dp));
    await cap('tel-14-reveil-halle');
    // de la Halle : retour au Moule par le four (allumé ?), sinon par le toboggan ; puis Pelle et Sieste vers le Fourneau
    const lieu = await ev(p, () => window.__orvane.lieu());
    log('fours : ' + JSON.stringify(lieu.fours));
    await V.toucher('halle-four', 2); await pause(400); await V.calme(); await pause(500);
    const f = await ev(p, () => !!document.querySelector('#d-fiche [data-four="moule-four"]'));
    if (f) { await p.click('#d-fiche [data-four="moule-four"]'); await pause(400); await V.calme(); await pause(300); }
    else { await p.click('#d-fiche footer [data-fermer]'); await V.prendre('halle-passe-plat'); await V.prendre('penderie-toboggan'); }
    ok(await V.ile() === 'moule', 'retour au Moule');
    await V.prendre('moule-pelle');
    await V.toucher('grand-etal-sieste', 2); await pause(400); await V.calme(); await pause(500);
    const opts = await ev(p, () => [...document.querySelectorAll('#d-fiche [data-reve]')].map(b => b.dataset.reve));
    ok(opts.includes('halle-four') && opts.includes('moule-four'), 'Sieste : la Halle et les fours allumés de l\'Astrelier', JSON.stringify(opts));
    await p.click('#d-fiche [data-reve="moule-four"]'); await pause(400); await V.calme(); await pause(300);
    ok(await V.ile() === 'moule', 'Sieste : réveil près du Four banal du Moule');
  });
  // ---------- Un combat sur la Voie lactée : la carte du pont, puis retour sur le pont ----------
  await partie('combat-vl', { w: 390, h: 844 }, async T => {
    const { p, pause, cap, log, V, tap, tapSel } = T;
    const { CERVEAU } = require('./cerveau.js');
    await creer(p, { classe: 'levainqueur', niveau: 3 }); await pause(900);
    await p.evaluate(CERVEAU);
    await V.prendre('fourneau-bord');
    const g = await ev(p, () => window.__orvane.groupes());
    ok(g.length === 1 && /grumeau/.test(g[0].groupe), 'Voie lactée : un groupe de Grumeaux', JSON.stringify(g));
    const posG = () => ev(p, () => { const s = window.__orvane.jeu.sceneActive, pg = s.pionsGroupes.find(Boolean); return pg ? s.vue.versEcran(pg.c.x, pg.c.y - pg.hauteur * .45) : null; });
    let q = await posG(); await tap(q.x, q.y); await pause(500);
    if (!(await ev(p, () => document.getElementById('d-fiche').open))) { q = await posG(); await tap(q.x, q.y); await pause(500); }
    const fiche = await texteFenetre(p, 'd-fiche');
    ok(/sur la Voie lactée/.test(fiche), 'fiche du groupe : « le combat se joue ici, sur la Voie lactée »', fiche.slice(0, 220));
    await cap('tel-20-fiche-grumeaux');
    await tapSel('#engager');
    await p.waitForFunction(() => window.__orvane.scene === 'placement', null, { timeout: 20000 }); await pause(900);
    const memeCarte = await ev(p, () => JSON.stringify(window.__orvane.etat.carte.lignes) === JSON.stringify(window.ORVANE.Regles.interne.preparerCarte(window.ORVANE.Proto.Iles.carteCombat('voie-lactee')).lignes));
    const jeux = await ev(p, () => window.__orvane.etat.carte.departs.length);
    ok(memeCarte && jeux >= 3, 'le combat se joue sur la carte du pont (3 jeux de départ)', 'jeux : ' + jeux);
    await cap('tel-21-pont-mise-en-place');
    await tapSel('#envoyer'); await pause(400); await T.attendre(); await pause(300);
    const cer = (m, a) => p.evaluate(([m, a]) => window.__cerveau[m](a), [m, a]);
    let tours = 0, capture = false;
    while (await T.scene() === 'combat' && tours < 30) {
      const ec = await cer('etat');
      if (!ec || ec.actif !== 'moi' || (await cer('scene')).phase !== 'joueur') { await T.attendre(); continue; }
      tours++;
      let marches = 0;
      for (let k = 0; k < 8 && await T.scene() === 'combat'; k++) {
        const plan = await cer('plan', marches);
        if (plan.type === 'aucun' || plan.type === 'fin') break;
        if (plan.type === 'pain') { await tapSel('#b-pain'); await pause(250); await tapSel('#b-pain'); await pause(450); await T.attendre(); continue; }
        if (plan.type === 'marche') { marches++; q = await T.ecranCase(plan.case); await tap(q.x, q.y); await pause(380); await tap(q.x, q.y); await pause(450); await T.attendre(); continue; }
        if (plan.type === 'sort') {
          await tapSel(`#grille-sorts .sort[data-id="${plan.id}"]`); await pause(250);
          q = await T.ecranCase(plan.case); await tap(q.x, q.y); await pause(380);
          if (!capture) { await cap('tel-22-pont-combat'); capture = true; }
          await tap(q.x, q.y); await pause(450); await T.attendre();
        }
      }
      if (await T.scene() !== 'combat') break;
      if ((await cer('etat')).actif === 'moi') { await tapSel('#fin-tour'); await pause(300); await T.attendre(); }
    }
    await pause(1200);
    ok(await T.scene() === 'addition', 'le combat sur le pont va jusqu\'à l\'Addition', tours + ' tours');
    const add = await texteFenetre(p, 'd-addition');
    ok(/Retour à la Voie lactée/.test(add), 'Addition : « Retour à la Voie lactée »', add.slice(0, 200));
    await cap('tel-23-pont-addition');
    await tapSel('#retour-balade');
    await p.waitForFunction(() => window.__orvane.scene === 'balade', null, { timeout: 20000 }); await pause(900);
    ok(await V.ile() === 'voie-lactee', 'après le combat : retour sur l\'île où l\'on était (la Voie lactée)');
    const g2 = await ev(p, () => window.__orvane.groupes());
    log('groupes après le combat : ' + JSON.stringify(g2));
    await cap('tel-24-retour-pont');
    // les groupes vaincus reviennent, île par île : on part au Fourneau, on revient 20 s plus tard
    if (g2.length && !g2[0].actif) {
      await V.prendre('vl-bas');
      const gf = await ev(p, () => window.__orvane.groupes());
      ok(gf.length >= 3 && gf.filter(x => x.actif).length >= 3, 'au Fourneau, ses groupes à lui', JSON.stringify(gf.map(x => x.groupe)));
      await pause(20500);
      await V.prendre('fourneau-bord');
      const g3 = await ev(p, () => window.__orvane.groupes());
      ok(g3.length === 1 && g3[0].actif, 'Voie lactée : le groupe vaincu est revenu', JSON.stringify(g3));
    }
  });

  // ---------- La carte de l'Astrelier ----------
  await partie('carte', { w: 390, h: 844 }, async T => {
    const { p, pause, cap, log, V, tapSel } = T;
    await creer(p, { classe: 'fromagicien', niveau: 1 }); await pause(900);
    const b = await p.$eval('#b-carte', e => { const r = e.getBoundingClientRect(); return { w: r.width, h: r.height }; });
    ok(b.w >= 44 && b.h >= 44, 'bouton « Carte » d\'au moins 44 px', JSON.stringify(b));
    await tapSel('#b-carte'); await pause(500);
    const info = await ev(p, () => ({ boutons: [...document.querySelectorAll('#d-carte .ile-b')].map(b => { const r = b.getBoundingClientRect(); return { ile: b.dataset.ile, w: Math.round(r.width), h: Math.round(r.height), inconnue: b.classList.contains('inconnue'), ici: b.classList.contains('ici') }; }), liens: document.querySelectorAll('#d-carte .carte-svg circle[r="13"]').length }));
    ok(info.boutons.length === 6 && info.boutons.every(x => x.w >= 44 && x.h >= 44), 'carte : 6 îles touchables (44 px au moins)', JSON.stringify(info.boutons));
    ok(info.boutons.find(x => x.ile === 'fourneau').ici && info.boutons.filter(x => x.inconnue).length === 5, 'carte : le Fourneau « ici », les autres en silhouette');
    await cap('tel-30-carte-debut');
    await tapSel('#d-carte [data-ile="moule"]'); await pause(300);
    const d = (await p.textContent('#carte-detail')).replace(/ /g, ' ');
    ok(/Le Moule/.test(d) && /toboggan de la Penderie/.test(d), 'carte : toucher une île dit son nom et comment y aller', d);
    await cap('tel-31-carte-moule');
    ok(!(await p.$('#d-carte [data-partir]')), 'carte : pas de voyage depuis la carte (pas devant un four)');
    await tapSel('#d-carte footer .bouton'); await pause(300);
    // devant un four allumé : la carte propose de partir vers les autres fours allumés
    await V.toucher('fourneau-four', 2); await pause(400); await V.calme(); await pause(500);
    await p.click('#d-fiche footer [data-fermer]'); await pause(300);
    await tapSel('#b-carte'); await pause(500);
    const dep = await ev(p, () => [...document.querySelectorAll('#d-carte [data-partir]')].map(b => b.dataset.partir));
    ok(dep.includes('halle-four'), 'carte : devant un Four banal allumé, « Partir » vers les fours allumés', JSON.stringify(dep));
    await cap('tel-32-carte-four');
    await tapSel('#d-carte [data-partir="halle-four"]'); await pause(400); await V.calme(); await pause(400);
    ok(await V.ile() === 'halle', 'carte : partir du four vers la Halle');
    await tapSel('#b-carte'); await pause(500);
    const ici = await ev(p, () => document.querySelector('#d-carte .ile-b.ici').dataset.ile);
    ok(ici === 'halle', 'carte : la Halle est maintenant « ici »');
    await tapSel('#d-carte summary'); await pause(300);
    await cap('tel-33-carte-legende');
  });

  // ---------- La quête « Le tour de l'Astrelier » ----------
  await partie('tour', { w: 390, h: 844 }, async T => {
    const { p, pause, cap, log, V, tapSel } = T;
    await creer(p, { classe: 'traitreur', niveau: 2 }); await pause(900);
    const ble0 = await ev(p, () => window.__orvane.profil.ble);
    await tapSel('#b-carte'); await pause(500);
    await tapSel('#carte-tour'); await pause(700);
    let t = await ev(p, () => window.__orvane.tour());
    ok(t && t.statut === 'actif', 'quête commencée depuis la carte');
    const lireCarte = () => ev(p, () => { const c = document.getElementById('tour-carte'); const a = document.getElementById('tour-anneau'); return { visible: !c.hidden, etape: document.getElementById('tour-etape').textContent, texte: document.getElementById('tour-texte').textContent, anneau: !a.hidden }; });
    let c = await lireCarte();
    ok(c.visible && c.anneau, 'carte de quête et anneau doré', JSON.stringify(c));
    await cap('tel-40-tour-debut');
    // on suit la carte de quête : l'anneau montre l'objet à toucher (ou le chemin), on le touche deux fois
    const suivre = async () => {
      for (let k = 0; k < 40; k++) {
        t = await ev(p, () => window.__orvane.tour());
        if (!t || t.statut !== 'actif') return;
        if (await ev(p, () => document.getElementById('d-fiche').open)) {
          // un panneau de four : partir vers un autre four (étape « voyager d'un four à l'autre »)
          const f = await ev(p, () => [...document.querySelectorAll('#d-fiche [data-four]')].map(b => b.dataset.four));
          if (f.length) { await p.click('#d-fiche [data-four="' + f[f.length - 1] + '"]'); await pause(400); await V.calme(); await pause(300); continue; }
          await p.click('#d-fiche [data-fermer]'); await pause(300); continue;
        }
        const v = t.vue; c = await lireCarte();
        log(`  [${await V.ile()}] ${c.etape} · « ${c.texte} »`);
        if (!v || !v.cible) { log('!! pas de cible'); return; }
        const ob = (await V.objets()).find(o => o.case[0] === v.cible[0] && o.case[1] === v.cible[1]);
        if (!ob) { log('!! cible inconnue ' + JSON.stringify(v.cible)); return; }
        await V.toucher(ob.id, 2); await pause(400); await V.calme(); await pause(400);
      }
    };
    await suivre();
    await pause(800);
    t = await ev(p, () => window.__orvane.tour());
    const fin = await texteFenetre(p, 'd-fiche');
    ok(t.statut === 'fini' && /Quête réussie/.test(fin), 'quête du tour finie', t.statut + ' ; ' + JSON.stringify(t.fait) + ' ; ' + fin.slice(0, 160));
    const ble1 = await ev(p, () => window.__orvane.profil.ble);
    ok(ble1 - ble0 === 30, 'récompense : 30 Blé', ble0 + ' → ' + ble1);
    await cap('tel-41-tour-fin');
  });

  // ---------- Rechargement sur chaque île, ancienne sauvegarde, nouvel artisan ----------
  await partie('recharge', { w: 390, h: 844 }, async T => {
    const { p, pause, cap, log, V, tapSel } = T;
    await creer(p, { classe: 'bouchevalier', niveau: 12 }); await pause(900);
    const recharger = async () => {
      await p.reload(); await p.waitForFunction(() => window.__orvane && window.__orvane.scene === 'creation', null, { timeout: 30000 });
      await tapSel('#reprendre'); await p.waitForFunction(() => window.__orvane.scene === 'balade', null, { timeout: 20000 }); await pause(900);
    };
    const chemin = [['fourneau-bord', 'voie-lactee'], ['vl-haut', 'halle'], ['halle-passe-plat', 'penderie'], ['penderie-toboggan', 'moule'], ['moule-pelle', 'grand-etal']];
    for (const [id, ile] of [[null, 'fourneau']].concat(chemin)) {
      if (id) await V.prendre(id);
      // quelques pas sur l'île, puis on recharge la page
      const avant = await ev(p, () => window.__orvane.moi());
      await recharger();
      const apres = await ev(p, () => window.__orvane.moi());
      ok(await V.ile() === ile && avant[0] === apres[0] && avant[1] === apres[1], `rechargement ${ile} : même île, même case`, JSON.stringify({ avant, apres }));
    }
    await cap('tel-50-recharge-grand-etal');
    // une ancienne sauvegarde (d'avant les îles) reprend au Fourneau — mise en situation : on retire le lieu du profil sauvé
    await ev(p, () => { const v = JSON.parse(localStorage.getItem('orvane-proto-1')); delete v.profil.monde; delete v.profil.tour; localStorage.setItem('orvane-proto-1', JSON.stringify(v)); });
    await recharger();
    ok(await V.ile() === 'fourneau', 'ancienne sauvegarde : on reprend au Fourneau');
    // une sauvegarde abîmée (île inconnue, case hors de l'île) : le Fourneau, à son départ
    await ev(p, () => { const v = JSON.parse(localStorage.getItem('orvane-proto-1')); v.profil.monde = { ile: 'atlantide', case: [99, -3], fours: 'oui', visitees: [1] }; localStorage.setItem('orvane-proto-1', JSON.stringify(v)); });
    await recharger();
    ok(await V.ile() === 'fourneau', 'sauvegarde abîmée : on reprend au Fourneau');
    await ev(p, () => { const v = JSON.parse(localStorage.getItem('orvane-proto-1')); v.profil.monde = { ile: 'penderie', case: [0, 0] }; localStorage.setItem('orvane-proto-1', JSON.stringify(v)); });
    await recharger();
    const m = await ev(p, () => window.__orvane.moi());
    ok(await V.ile() === 'penderie' && !(m[0] === 0 && m[1] === 0), 'case hors du sol : départ de l\'île', JSON.stringify(m));
  });

  // ---------- Toucher pendant un passage : ignoré ; animations réduites ----------
  await partie('pendant', { w: 390, h: 844, reduit: true }, async T => {
    const { p, pause, cap, log, V, tap } = T;
    await creer(p, { classe: 'levainqueur', niveau: 1 }); await pause(900);
    // animations réduites : un passage sans rien toucher, mesuré
    const r0 = await V.prendre('fourneau-bord');
    ok(r0.duree <= 800, 'animations réduites : passage court (fondu, sans mouvement)', r0.duree + ' ms');
    await V.prendre('vl-bas');
    const pt = await V.point('fourneau-bord');
    await tap(pt.x, pt.y); await pause(420); await tap(pt.x, pt.y);
    // on attend que le passage commence, puis on touche le terrain et un bouton du bas, tout de suite
    await p.waitForFunction(() => !!window.__orvane.passage, null, { timeout: 15000, polling: 10 });
    const g = await p.$eval('#b-grimoire', e => { const r = e.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; });
    await tap(200, 400); await tap(g.x, g.y); await tap(120, 300);
    const encore = await ev(p, () => !!window.__orvane.passage);
    await V.calme(); await pause(500);
    const d = await ev(p, () => window.__orvane.dernierPassage), moi = await ev(p, () => window.__orvane.moi());
    ok(encore && await V.ile() === 'voie-lactee' && moi[0] === 16 && moi[1] === 17 && !(await dialogues(p)).length, 'touchers pendant le passage ignorés (terrain et boutons)', JSON.stringify({ encore, moi, dialogues: await dialogues(p) }));
  });

  // ---------- Le tutoriel loin du Fourneau : Mère Fournil reste au Fourneau, la carte de quête montre le chemin ----------
  await partie('tuto-ailleurs', { w: 390, h: 844 }, async T => {
    const { p, pause, cap, log, V, tapSel } = T;
    await creer(p, { classe: 'levainqueur', niveau: 1, tuto: true, repartir: false }); await pause(600);
    await p.waitForSelector('#tuto-oui', { timeout: 15000 }); await pause(300);
    await tapSel('#tuto-oui'); await pause(900);
    // étape 1 : on marche… jusqu'au bord, vers la Voie lactée
    await V.prendre('fourneau-bord');
    const e = await ev(p, () => { const t = window.__orvane.tuto(); return { etape: t.etape, texte: document.getElementById('tuto-texte').textContent, anneau: !document.getElementById('tuto-anneau').hidden, carte: !document.getElementById('tuto-carte').hidden, pnj: !!window.__orvane.jeu.sceneActive.pnj, groupes: window.__orvane.groupes().map(g => g.groupe) }; });
    ok(e.carte && /t'attend au Fourneau/.test(e.texte) && e.anneau, 'tutoriel sur la Voie lactée : « t\'attend au Fourneau », anneau sur le chemin', JSON.stringify(e));
    ok(!e.pnj && !e.groupes.includes('entrainement'), 'ni Mère Fournil ni le Grumeau d\'entraînement hors du Fourneau', JSON.stringify(e.groupes));
    await cap('tel-60-tuto-ailleurs');
    await V.prendre('vl-bas');
    const f = await ev(p, () => ({ pnj: !!window.__orvane.jeu.sceneActive.pnj, groupes: window.__orvane.groupes().map(g => g.groupe), texte: document.getElementById('tuto-texte').textContent }));
    ok(f.pnj && f.groupes.includes('entrainement'), 'de retour au Fourneau : Mère Fournil et le Grumeau d\'entraînement', JSON.stringify(f));
  });

  // ---------- Petits écrans et ordinateur : chaque île, cibles de 44 px, pas de défilement de côté ----------
  for (const [nom, o] of [['tailles-360', { w: 360, h: 740 }], ['tailles-ordi', { w: 1280, h: 800, tel: false }]]) {
    await partie(nom, o, async T => {
      const { p, pause, cap, log, V, tapSel } = T;
      const pre = nom === 'tailles-ordi' ? 'ordi' : 'p360';
      await creer(p, { classe: 'merlanceur', niveau: 12 }); await pause(900);
      const verifier = async ile => {
        const petites = await T.petitesCibles(), deb = await ev(p, () => document.documentElement.scrollWidth > innerWidth + 1);
        ok(!petites.length && !deb, `${pre} ${ile} : cibles de 44 px au moins, pas de défilement de côté`, petites.join(', '));
        await cap(`${pre}-${ile}`);
      };
      await verifier('fourneau');
      for (const [id, ile] of [['fourneau-bord', 'voie-lactee'], ['vl-haut', 'halle'], ['halle-passe-plat', 'penderie'], ['penderie-toboggan', 'moule'], ['moule-pelle', 'grand-etal']]) {
        const r = await V.prendre(id);
        ok(r.vers === ile && r.duree <= 1500, `${pre} : ${id} → ${ile}`, r.duree + ' ms');
        await verifier(ile);
      }
      await tapSel('#b-carte'); await pause(500);
      const petites = await T.petitesCibles();
      ok(!petites.length, `${pre} carte : cibles de 44 px au moins`, petites.join(', '));
      await cap(`${pre}-carte`);
    });
  }

  // ---------- Voie lactée : renoncer, abandonner (défaite), recharger pendant un combat ----------
  await partie('defaite-vl', { w: 390, h: 844 }, async T => {
    const { p, pause, cap, log, V, tap, tapSel } = T;
    await creer(p, { classe: 'patissorcier', niveau: 2 }); await pause(900);
    await V.prendre('fourneau-bord');
    // marcher un peu vers le milieu du pont
    const engager = async () => {
      const posG = () => ev(p, () => { const s = window.__orvane.jeu.sceneActive, pg = s.pionsGroupes.find(Boolean); return pg ? s.vue.versEcran(pg.c.x, pg.c.y - pg.hauteur * .45) : null; });
      let q = await posG(); await tap(q.x, q.y); await pause(500);
      if (!(await ev(p, () => document.getElementById('d-fiche').open))) { q = await posG(); await tap(q.x, q.y); await pause(500); }
      await tapSel('#engager');
      await p.waitForFunction(() => window.__orvane.scene === 'placement', null, { timeout: 20000 }); await pause(800);
    };
    await engager();
    await tapSel('#b-reglages-combat'); await pause(400);
    const lib = await p.textContent('#r-renoncer');
    ok(/retour à la Voie lactée/.test(lib), 'Réglages de la Mise en place : « Renoncer (retour à la Voie lactée) »', lib);
    await tapSel('#r-renoncer'); await pause(200); await tapSel('#r-renoncer');
    await p.waitForFunction(() => window.__orvane.scene === 'balade', null, { timeout: 20000 }); await pause(800);
    ok(await V.ile() === 'voie-lactee' && (await ev(p, () => window.__orvane.groupes()))[0].actif, 'renoncer : retour sur la Voie lactée, le groupe reste là');
    // abandonner pendant le combat : défaite, retour au départ de la Voie lactée
    await engager();
    await tapSel('#envoyer'); await pause(500); await T.attendre();
    await tapSel('#b-reglages-combat'); await pause(400);
    await tapSel('#r-abandon'); await pause(200); await tapSel('#r-abandon');
    await p.waitForFunction(() => window.__orvane.scene === 'addition', null, { timeout: 30000 }); await pause(600);
    const add = await texteFenetre(p, 'd-addition');
    ok(/Retour à la Voie lactée/.test(add), 'défaite : « Retour à la Voie lactée »', add.slice(0, 160));
    await tapSel('#retour-balade');
    await p.waitForFunction(() => window.__orvane.scene === 'balade', null, { timeout: 20000 }); await pause(800);
    const moi = await ev(p, () => window.__orvane.moi()), dep = await ev(p, () => window.ORVANE.Proto.Iles.ile('voie-lactee').depart);
    ok(await V.ile() === 'voie-lactee' && moi[0] === dep[0] && moi[1] === dep[1], 'défaite : au départ de la Voie lactée', JSON.stringify({ moi, dep }));
    // recharger pendant un combat : on reprend sur la Voie lactée
    await engager();
    await p.reload(); await p.waitForFunction(() => window.__orvane && window.__orvane.scene === 'creation', null, { timeout: 30000 });
    await tapSel('#reprendre'); await p.waitForFunction(() => window.__orvane.scene === 'balade', null, { timeout: 20000 }); await pause(800);
    ok(await V.ile() === 'voie-lactee', 'recharger pendant un combat : on reprend sur la Voie lactée');
  });

  // ---------- Typographie et Lexique ----------
  await partie('lexique', { w: 390, h: 844 }, async T => {
    const { p, pause, cap, tapSel } = T;
    await creer(p, { classe: 'levainqueur', niveau: 1 }); await pause(900);
    await tapSel('#b-lexique'); await pause(400);
    await tapSel('#d-lexique [data-aller="voyage"]'); await pause(400);
    const mots = await ev(p, () => [...document.querySelectorAll('#lexg-voyage dt')].map(d => d.textContent));
    ok(['Four banal', 'Passe-plat', 'Monte-plats', 'Toboggan', 'Grande Pelle (Défournement)', 'Sieste', 'Voie lactée'].every(m => mots.includes(m)), 'Lexique : les mots des voyages', mots.join(', '));
    const brut = await ev(p, () => { const t = document.getElementById('d-lexique').innerText; return (t.match(/ [:;!?](\s|$)|« | »/g) || []).length; });
    ok(brut === 0, 'Lexique : espaces insécables avant : ; ! ? et dans « »', brut + ' espaces ordinaires');
    await cap('tel-70-lexique-voyager');
  });

  // ---------- Au clavier (ordinateur) : jusqu'au monte-plats posé au bord, Entrée deux fois ----------
  await partie('clavier', { w: 1280, h: 800, tel: false }, async T => {
    const { p, pause, cap, log, V } = T;
    await creer(p, { classe: 'pateladin', niveau: 1 }); await pause(900);
    for (let i = 0; i < 40; i++) { await p.keyboard.press('Tab'); if (await ev(p, () => document.activeElement.tagName === 'CANVAS')) break; }
    const cur = () => ev(p, () => { const s = window.ORVANE.Proto.Jeu.sceneActive; return s.curseur ? s.curseur.slice() : null; });
    // du départ (9,9) au monte-plats (12,7) : droite ×3, haut ×2
    for (const k of ['ArrowRight', 'ArrowRight', 'ArrowRight', 'ArrowUp', 'ArrowUp']) { await p.keyboard.press(k); await pause(80); }
    ok(JSON.stringify(await cur()) === '[12,7]', 'curseur clavier sur le monte-plats (dans le vide, au bord)', JSON.stringify(await cur()));
    await p.keyboard.press('Enter'); await pause(300);
    ok(await ev(p, () => window.__orvane.apercuVoyage()) === 'fourneau-monte-plats', 'Entrée : l\'aperçu du monte-plats');
    await cap('ordi-01-clavier-monte-plats');
    await p.keyboard.press('Escape'); await pause(200);
    ok(await ev(p, () => window.__orvane.apercuVoyage()) === null, 'Échap : l\'aperçu disparaît');
    await p.keyboard.press('Enter'); await pause(300); await p.keyboard.press('Enter');
    await pause(400); await V.calme(); await pause(300);
    ok(await V.ile() === 'penderie', 'Entrée deux fois : monte-plats vers la Penderie');
    await cap('ordi-02-penderie');
  });
  console.log('\n' + bilan.filter(l => l.startsWith('ÉCHEC')).length + ' échec(s) sur ' + bilan.length);
  fs.writeFileSync(__dirname + '/voyages-bilan.txt', bilan.join('\n') + '\n');
})();
