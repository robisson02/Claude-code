// Passe 5 : chaque défaut corrigé est revérifié dans le navigateur (téléphone au doigt, ordinateur au clavier).
// __orvane et ORVANE servent à lire l'état ; quelques mises en situation écrivent l'état (marquées « mise en situation »).
// node verif.js [partie…]   (sans argument : toutes)
const { ouvrir } = require('./outils.js');
const fs = require('fs');
const DOSSIER = __dirname + '/verif';
fs.mkdirSync(DOSSIER, { recursive: true });
const voulu = process.argv.slice(2);
const bilan = [];
const ok = (cond, quoi, detail) => { bilan.push((cond ? 'OK     ' : 'ÉCHEC  ') + quoi + (detail ? ' — ' + detail : '')); console.log(bilan[bilan.length - 1]); return cond; };
const lum = h => { const c = h.match(/\d+(\.\d+)?/g).slice(0, 3).map(x => +x / 255).map(v => v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4)); return .2126 * c[0] + .7152 * c[1] + .0722 * c[2]; };
const contraste = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };

async function partie(nom, o, fn) {
  if (voulu.length && !voulu.includes(nom)) return;
  const T = await ouvrir(Object.assign({ dossier: DOSSIER }, o));
  try { await fn(T); } catch (e) { ok(false, nom + ' : exception', e.stack.split('\n').slice(0, 3).join(' | ')); }
  ok(T.msgs.length === 0, nom + ' : console vide', T.msgs.join(' | ').slice(0, 400));
  fs.writeFileSync(DOSSIER + '/' + nom + '-journal.txt', T.journal.join('\n') + '\n\nConsole :\n' + (T.msgs.join('\n') || 'vide'));
  await T.b.close();
}
const creer = (p, o) => p.evaluate(o => window.__orvane.creer(o), o);
const ev = (p, f, a) => p.evaluate(f, a);

(async () => {
  // ---------- Clavier : toutes les cases, et entrer en combat au clavier ----------
  await partie('clavier', { w: 1280, h: 800, tel: false }, async ({ p, pause, log, cap, msgs }) => {
    await creer(p, { classe: 'levainqueur', niveau: 1 }); await pause(800);
    for (let i = 0; i < 40; i++) { await p.keyboard.press('Tab'); if (await ev(p, () => document.activeElement.tagName === 'CANVAS')) break; }
    const cur = () => ev(p, () => { const s = window.ORVANE.Proto.Jeu.sceneActive; return s.curseur ? s.curseur.slice() : null; });
    await p.keyboard.press('ArrowUp'); await pause(80);
    const a0 = await cur(), sens = {};
    for (const [k, d] of [['ArrowRight', [1, 0]], ['ArrowDown', [0, 1]], ['ArrowLeft', [-1, 0]], ['ArrowUp', [0, -1]]]) {
      const a = await cur(); await p.keyboard.press(k); await pause(60); const b = await cur();
      sens[k] = b && a && (b[0] - a[0] === d[0] && b[1] - a[1] === d[1]);
    }
    ok(Object.values(sens).every(Boolean), 'Clavier : chaque flèche mène à une case voisine de la grille', JSON.stringify(sens) + ' départ ' + JSON.stringify(a0));
    // toutes les cases de sol atteignables (flèches = 4 voisines de la grille)
    const r = await ev(p, () => {
      const s = window.ORVANE.Proto.Jeu.sceneActive, pl = s.plateau, D = [[0, -1], [1, 0], [0, 1], [-1, 0]];
      const sol = pl.cases().filter(c => pl.sol(c[0], c[1])).map(c => c.join(','));
      const vus = new Set([s.curseur.join(',')]), file = [s.curseur.slice()];
      while (file.length) { const c = file.shift(); D.forEach(d => { const n = [c[0] + d[0], c[1] + d[1]]; if (!vus.has(n.join(',')) && pl.existe(n[0], n[1])) { vus.add(n.join(',')); file.push(n); } }); }
      return { sol: sol.length, atteintes: sol.filter(k => vus.has(k)).length };
    });
    ok(r.sol === r.atteintes, 'Clavier : toutes les cases de sol atteignables en exploration', `${r.atteintes} sur ${r.sol}`);
    // entrer en combat au clavier : fiche → Entrée sur « Engager », puis les flèches (exception en passe 4)
    const g = (await ev(p, () => window.__orvane.groupes())).find(x => x.actif);
    await ev(p, i => window.__orvane.ouvrirGroupe(i), g.i); await pause(400);
    await p.keyboard.press('Enter');
    await p.waitForFunction(() => window.__orvane.scene === 'placement', null, { timeout: 20000 }); await pause(800);
    for (let i = 0; i < 40; i++) { if (await ev(p, () => document.activeElement.tagName === 'CANVAS')) break; await p.keyboard.press('Tab'); }
    const avant = msgs.length;
    await p.keyboard.press('ArrowLeft'); await pause(120);
    const c1 = await cur();
    ok(msgs.length === avant && !!c1, 'Clavier : flèche juste après être entré en combat, sans erreur', 'curseur ' + JSON.stringify(c1));
    // en combat : les 4 cases voisines (marcher d'1 Pas, frapper au contact) sont atteignables
    await ev(p, () => window.__orvane.envoyer()); await pause(600);
    await ev(p, () => { window.ORVANE.Proto.Jeu.sceneActive.curseur = null; });
    await p.keyboard.press('ArrowRight'); await p.keyboard.press('ArrowLeft'); await pause(100);
    const moi = await ev(p, () => window.__orvane.etat.combattants.find(c => c.id === 'moi').case), c2 = await cur();
    ok(c2 && c2[0] === moi[0] && c2[1] === moi[1], 'Clavier : en combat, le curseur part de sa case et y revient', JSON.stringify({ moi, c2 }));
    const verts = await ev(p, () => window.__orvane.regles().deplacementsPossibles(window.__orvane.etat, 'moi').length);
    log('cases vertes : ' + verts + ' (toutes atteignables : la grille entière l\'est)');
    await cap('clavier-combat');
  });

  // ---------- Création : « Entrer dans le jeu » en vue ----------
  await partie('creation', { w: 390, h: 844 }, async ({ p, pause, cap, tapSel }) => {
    for (const [w, h] of [[390, 844], [360, 740], [375, 667]]) {
      await p.setViewportSize({ width: w, height: h }); await pause(300);
      const r = await ev(p, () => { const b = document.getElementById('entrer').getBoundingClientRect(), e = document.elementFromPoint(b.x + b.width / 2, b.y + b.height / 2); return { haut: Math.round(b.top), bas: Math.round(b.bottom), h: innerHeight, dessus: e && (e.id || e.className) }; });
      ok(r.bas <= r.h && r.dessus === 'entrer', `Création ${w}×${h} : « Entrer dans le jeu » entièrement visible sans faire défiler`, JSON.stringify(r));
    }
    await p.setViewportSize({ width: 390, height: 844 }); await pause(300);
    await cap('creation-390');
    // en faisant défiler, le bouton reste en vue, et en bas de page il est à sa place
    await ev(p, () => document.getElementById('creation').scrollTo(0, 99999)); await pause(300);
    const r2 = await ev(p, () => { const b = document.getElementById('entrer').getBoundingClientRect(); return { bas: Math.round(b.bottom), h: innerHeight }; });
    ok(r2.bas <= r2.h, 'Création : bouton visible aussi en bas de la page', JSON.stringify(r2));
    await cap('creation-390-bas');
  });

  // ---------- Fiche d'un groupe : badge « chef », texte simple ----------
  await partie('fiche', { w: 390, h: 844 }, async ({ p, pause, cap }) => {
    await creer(p, { classe: 'patissorcier', niveau: 3 }); await pause(600);
    const gi = await ev(p, () => { const l = window.__orvane.groupes(); return (l.find(x => x.actif && x.groupe === 'chef-seul') || l.find(x => x.actif && /chef|mie/.test(x.groupe)) || l.find(x => x.actif)).i; });
    await ev(p, i => window.__orvane.ouvrirGroupe(i), gi); await pause(400);
    const r = await ev(p, () => {
      const c = document.querySelector('#d-fiche .chef'); if (!c) return null;
      const s = getComputedStyle(c); return { couleur: s.color, fond: s.backgroundColor, nom: c.parentElement.textContent, texte: document.querySelector('#d-fiche .corps').innerText.replace(/\s+/g, ' ') };
    });
    if (r) {
      const k = contraste(r.couleur, r.fond);
      ok(k >= 4.5, 'Badge « chef » lisible', `${r.couleur} sur ${r.fond} : ${k.toFixed(2)}:1`);
      ok(/chef chef|chef chef|chef\s+chef/.test(r.nom), 'Badge « chef » lu avec une espace', JSON.stringify(r.nom));
      ok(!/colle au contact/.test(r.texte) && /vient frapper au contact/.test(r.texte), 'Fiche : « vient frapper au contact »', r.texte.slice(0, 160));
    } else ok(false, 'Badge « chef » trouvé');
    await cap('fiche-chef');
  });

  // ---------- Premier vrai combat : Commande expliquée, Minuteur annoncé, alerte à 10 s, message « À toi » ----------
  await partie('combat', { w: 390, h: 844 }, async ({ p, pause, cap, tapSel, log }) => {
    await creer(p, { classe: 'levainqueur', niveau: 3 }); await pause(600);
    const g = (await ev(p, () => window.__orvane.groupes())).find(x => x.actif && x.groupe === 'grumeaux') || (await ev(p, () => window.__orvane.groupes())).find(x => x.actif);
    await ev(p, i => window.__orvane.engagerGroupe(i), g.i); await pause(3000);
    const mep = await ev(p, () => ({ consigne: document.getElementById('consigne-placement').textContent, regle: document.getElementById('resume-regle').textContent, nom: document.getElementById('resume-commande').textContent, moi: window.__orvane.etat.combattants.find(c => c.id === 'moi').case }));
    ok(!!mep.moi, 'Mise en place : on est déjà sur une case dorée (visible)', JSON.stringify(mep.moi));
    ok(/La Commande est un défi/.test(mep.consigne), 'Mise en place : la Commande expliquée la première fois', mep.consigne);
    ok(/^Défi[ \u00a0]: /.test(mep.regle), 'Mise en place : la règle de la Commande en une ligne dans le résumé', mep.nom + ' | ' + mep.regle);
    await cap('combat-01-mise-en-place');
    await tapSel('#envoyer'); await pause(300);
    await p.waitForFunction(() => { const O = window.__orvane, R = O.regles(), a = O.etat && R.actif(O.etat); return a && a.id === 'moi' && O.jeu.sceneActive.phase === 'joueur'; }, null, { timeout: 30000 });
    await pause(400);
    const m1 = await ev(p, () => document.getElementById('message').textContent);
    ok(/Minuteur[ \u00a0]: 45 s par tour/.test(m1), 'Premier tour : le Minuteur est annoncé (une fois)', m1);
    await cap('combat-02-minuteur-annonce');
    // l'alerte à 10 s : on attend sans rien faire
    const t0 = Date.now();
    await p.waitForFunction(() => /Plus que 10 secondes/.test(document.getElementById('message').textContent), null, { timeout: 45000 });
    log('alerte après ' + ((Date.now() - t0) / 1000).toFixed(1) + ' s');
    ok(true, 'Minuteur : alerte « Plus que 10 secondes » visible', await ev(p, () => document.getElementById('message').textContent));
    await cap('combat-03-alerte-10s');
    // on ne joue pas : le tour passe à 0 ; au tour suivant, le Minuteur n'est plus annoncé
    await p.waitForFunction(() => { const O = window.__orvane, R = O.regles(), e = O.etat; return e && e.manche >= 2 && (R.actif(e) || {}).id === 'moi' && O.jeu.sceneActive.phase === 'joueur'; }, null, { timeout: 60000 });
    await pause(500);
    const m2 = await ev(p, () => document.getElementById('message').textContent);
    ok(!/Minuteur : 45/.test(m2), 'Tour suivant : le Minuteur n\'est pas réannoncé', m2);
    // le message « À toi » suit ce qu'on peut faire : on dépense tous ses Pas (mise en situation : on retire les Pas dans l'état)
    await ev(p, () => { const O = window.__orvane, m = O.regles().trouver(O.etat, 'moi'); m.pas = 0; const s = O.jeu.sceneActive; s.calculerPortee(); s.majHud(); });
    await pause(3000);   // l'annonce « À toi ! » reste un instant, puis le message de fond
    const m3 = await ev(p, () => document.getElementById('message').textContent);
    ok(/plus de Pas, choisis un sort/.test(m3), 'À toi avec 0 Pas : « plus de Pas, choisis un sort »', m3);
    // un sort à la fois en relance et sans assez de CM : les deux raisons (mise en situation)
    const s = await ev(p, () => { const O = window.__orvane, R = O.regles(), m = R.trouver(O.etat, 'moi'), b = R.barre(O.etat, 'moi').find(x => x.cm >= 2); m.relances[b.id] = 2; m.cm = 0; O.jeu.sceneActive.majBarre(); O.jeu.sceneActive.choisirSort(b.id); return { nom: b.nom, message: document.getElementById('message').textContent, repere: (document.querySelector(`#grille-sorts [data-id="${b.id}"] .relance`) || {}).textContent }; });
    ok(/Pas assez de coups de main/.test(s.message) && /revient dans 2 tours/.test(s.message), 'Sort en relance et sans CM : les deux raisons au toucher', s.message + ' | repère ' + s.repere);
    await cap('combat-04-relance-et-cm');
    // le Pain quand les Victuailles sont pleines : « Vie pleine », sans rouge
    const pain = await ev(p, () => { const O = window.__orvane, m = O.regles().trouver(O.etat, 'moi'); m.cm = 6; m.relances = {}; m.victuailles = m.victuaillesMax - (m.entame || 0); O.jeu.sceneActive.majBarre(); const n = document.querySelector('#b-pain .nom'); return { texte: n.textContent, couleur: getComputedStyle(n).color, raison: document.getElementById('b-pain').getAttribute('aria-label') }; });
    ok(pain.texte === 'Vie pleine' && !/255, 154, 133/.test(pain.couleur), 'Pain de route plein : « Vie pleine », pas en rouge', JSON.stringify(pain));
  });

  // ---------- Combat d'entraînement : pas de Minuteur, même remis dans les Réglages ----------
  await partie('entrainement', { w: 390, h: 844 }, async ({ p, pause, cap, tapSel }) => {
    await creer(p, { classe: 'levainqueur', niveau: 1, tuto: true, repartir: false }); await pause(600);
    await p.waitForSelector('#tuto-oui', { timeout: 8000 }); await tapSel('#tuto-oui'); await pause(800);
    const g = (await ev(p, () => window.__orvane.groupes())).find(x => x.groupe === 'entrainement');
    await ev(p, i => window.__orvane.engagerGroupe(i), g.i); await pause(800);
    await ev(p, () => window.__orvane.envoyer()); await pause(600);
    await tapSel('#b-reglages-combat'); await pause(300);
    const r = await ev(p, () => { const c = document.getElementById('r-minuteur'); return { coche: c.checked, grise: c.disabled, note: document.querySelector('#d-reglages .texte-doux').textContent }; });
    ok(!r.coche && r.grise && /entraînement/.test(r.note), 'Réglages du combat d\'entraînement : Minuteur décoché, grisé, expliqué', JSON.stringify(r));
    await cap('entrainement-reglages');
    await tapSel('#d-reglages footer .bouton'); await pause(200);
    await ev(p, () => window.__orvane.jeu.sceneActive.reglerMinuteur(true)); await pause(300);
    ok(await ev(p, () => document.getElementById('minuteur').hidden), 'Combat d\'entraînement : reglerMinuteur(true) ne lance pas le Minuteur');
  });

  // ---------- Tutoriel : recharger sur l'Addition du combat gagné ----------
  await partie('recharge-addition', { w: 390, h: 844 }, async ({ p, pause, cap, tapSel, log }) => {
    await creer(p, { classe: 'fromagicien', niveau: 1, tuto: true, repartir: false }); await pause(600);
    await p.waitForSelector('#tuto-oui', { timeout: 8000 }); await tapSel('#tuto-oui'); await pause(800);
    const g = (await ev(p, () => window.__orvane.groupes())).find(x => x.groupe === 'entrainement');
    await ev(p, i => window.__orvane.engagerGroupe(i), g.i); await pause(800);
    await ev(p, () => window.__orvane.envoyer()); await pause(800);
    // mise en situation : le Grumeau à 1 Victuaille, collé à moi ; le Coup d'outil le fait tomber
    const r = await ev(p, async () => {
      const O = window.__orvane, R = O.regles(), e = O.etat, m = R.trouver(e, 'moi'), gr = e.combattants.find(c => c.genre === 'monstre');
      const libre = c => R.terrain(e, c) === 'sol' && !e.combattants.some(k => k.vivant && k.case && k.case[0] === c[0] && k.case[1] === c[1]);
      gr.case = [[1, 0], [-1, 0], [0, 1], [0, -1]].map(d => [m.case[0] + d[0], m.case[1] + d[1]]).find(libre); gr.victuailles = 1;
      const s = O.jeu.sceneActive; s.change(); s.synchroniser(); s.calculerPortee(); s.majHud();
      const b = R.barre(e, 'moi').find(x => x.disponible && R.apercuSort(e, 'moi', x.id, gr.case).ok);
      O.choisirSort(b.id); await O.toucherCase(gr.case); await O.toucherCase(gr.case);
      return { sort: b.nom };
    });
    log('lancé : ' + JSON.stringify(r));
    await p.waitForFunction(() => window.__orvane.scene === 'addition', null, { timeout: 20000 }); await pause(500);
    const avant = await ev(p, () => ({ t: window.__orvane.tuto(), niv: window.__orvane.profil.niveau }));
    log('avant rechargement : ' + JSON.stringify({ etape: avant.t.etape, fait: avant.t.fait, niveau: avant.niv }));
    await p.reload(); await p.waitForFunction(() => window.__orvane && window.__orvane.scene === 'creation', null, { timeout: 30000 }); await pause(500);
    await tapSel('#reprendre'); await p.waitForFunction(() => window.__orvane.scene === 'balade', null, { timeout: 20000 }); await pause(1500);
    const apres = await ev(p, () => ({ t: window.__orvane.tuto(), texte: document.getElementById('tuto-texte').textContent, groupes: window.__orvane.groupes().filter(g => g.actif).map(g => g.groupe) }));
    ok(apres.t.etape === 8, 'Rechargé sur l\'Addition gagnée : la quête reprend à l\'étape 8', `étape ${apres.t.etape} · « ${apres.texte} »`);
    ok(!apres.groupes.includes('entrainement'), 'Plus de Grumeau d\'entraînement à refaire', JSON.stringify(apres.groupes));
    ok(/gagné un niveau/.test(apres.texte), 'Étape 8 : « Tu as gagné un niveau… »', apres.texte);
    await cap('recharge-addition-etape8');
  });

  // ---------- Pains de route : la récompense sert ----------
  await partie('pains', { w: 390, h: 844 }, async ({ p, pause }) => {
    await creer(p, { classe: 'pateladin', niveau: 1 }); await pause(500);
    const r = await ev(p, async () => {
      const P = window.ORVANE.Proto, O = window.__orvane;
      P.Profil.profil.sac['sac.pain-de-route'] = 4; P.Profil.sauver();   // mise en situation : la récompense du tutoriel
      const g = O.groupes().find(x => x.actif);
      await O.engagerGroupe(g.i); await O.envoyer();
      const dans = O.regles().trouver(O.etat, 'moi').pain;
      const mange3 = P.Profil.mangerPains(3), apres3 = P.Profil.profil.sac['sac.pain-de-route'];
      const mange4 = P.Profil.mangerPains(4), apres4 = P.Profil.profil.sac['sac.pain-de-route'];
      return { dans, mange3, apres3, mange4, apres4 };
    });
    ok(r.dans === 4, 'Sac à 4 Pains : le combat en donne 4 (3 + 1 de réserve)', JSON.stringify(r));
    ok(r.apres3 === 4 && r.apres4 === 3, 'Les Pains du combat sont mangés d\'abord ; la réserve ensuite', JSON.stringify(r));
  });

  // ---------- Décor transparent devant une fournée (et sa lueur) ----------
  await partie('four', { w: 390, h: 844 }, async ({ p, pause, cap }) => {
    await creer(p, { classe: 'levainqueur', niveau: 10 }); await pause(500);
    await ev(p, async () => { const O = window.__orvane; await O.engagerGroupe(O.groupes().find(x => x.actif).i); await O.envoyer(); });
    await pause(600);
    const r = await ev(p, () => {
      const s = window.__orvane.jeu.sceneActive, pl = s.plateau, four = pl.decors.find(im => im.halo && im.texture.key === 'decor-four');
      if (!four) return null;
      const C = window.ORVANE.Proto.grille(four.x, four.y - 3), derriere = [C[0] - 1, C[1] - 1];
      const o = s.creerObjet({ id: 'essai', quoi: 'fournee', case: derriere, reste: 1 }); s.majObjet(o, { reste: 1 });   // mise en situation : une fournée derrière le four
      pl.transparence(s.tousLesPions(), [o]);
      const res = { four: C, fournee: derriere, alpha: four.alpha, halo: four.halo.alpha };
      s.objets.essai = o;
      return res;
    });
    if (!r) { ok(false, 'Four trouvé'); return; }
    ok(r.alpha <= .3 && r.halo <= .25, 'Fournée derrière le four : le four et sa lueur s\'effacent', JSON.stringify(r));
    await ev(p, c => { const O = window.__orvane, s = O.jeu.sceneActive; s.centrerSurCase(c, false); }, r.fournee); await pause(500);
    await cap('four-fournee-derriere');
  });

  // ---------- Un groupe qui vient de bouger : le toucher là où il était ouvre sa fiche ----------
  await partie('groupe-bouge', { w: 390, h: 844 }, async ({ p, pause, tap, cap, log }) => {
    await creer(p, { classe: 'merlanceur', niveau: 3 }); await pause(500);
    let fait = false;
    for (let essai = 0; essai < 12 && !fait; essai++) {
      const h = await p.waitForFunction(() => { const s = window.__orvane.jeu.sceneActive; const q = (s.pionsGroupes || []).find(x => x && x.bouge && x.quitte); return q ? { de: q.quitte.case, vers: q.versCase } : null; }, null, { timeout: 15000, polling: 30 });
      const m = await h.jsonValue();
      await pause(800);   // le joueur touche là où il a vu le groupe, un instant après qu'il est parti
      const q = await ev(p, c => window.__orvane.ecranDeCase(c), m.de);
      const rect = await ev(p, () => window.__orvane.rectUtile());
      if (q.y < rect.y + 10 || q.y > rect.y + rect.h - 10) { log('case hors de vue, on attend un autre pas'); continue; }
      await tap(q.x, q.y); await pause(500);
      const r = await ev(p, () => ({ fiche: document.getElementById('d-fiche').open, marche: !!window.__orvane.jeu.sceneActive.marche || !!window.__orvane.jeu.sceneActive.cible }));
      ok(r.fiche && !r.marche, 'Toucher la case qu\'un groupe vient de quitter ouvre sa fiche (pas de marche)', JSON.stringify({ case: m.de, vers: m.vers, r }));
      await cap('groupe-bouge-fiche');
      fait = true;
    }
    if (!fait) ok(false, 'Un pas de groupe observé');
  });

  // ---------- Lexique : textes relus ----------
  await partie('lexique', { w: 390, h: 844 }, async ({ p, pause }) => {
    await creer(p, { classe: 'traitreur', niveau: 1 }); await pause(400);
    const l = await ev(p, () => window.ORVANE.Proto.Lexique.entrees());
    const d = id => (l.find(e => e.id === id) || {}).def || '';
    ok(/Traîtreur/.test(d('piege')) && !/Traitreur/.test(JSON.stringify(l)), 'Lexique : « Traîtreur »');
    ok(/Au niveau 200, tous tes sorts sont au rang 3/.test(d('rang')), 'Lexique : Rang au niveau 200', d('rang'));
    ok(/ni changer de place/.test(d('plante')), 'Lexique : Planté ne s\'échange pas', d('plante'));
    ok(/réserve/.test(d('pain')) && /Vie pleine/.test(d('pain')), 'Lexique : Pain de route (réserve du Sac, « Vie pleine »)', d('pain'));
    ok(/« plein »[^«]*« 0\/2 »|plein.*0\/2/.test(d('relance')) && /servi une fois sur 2/.test(d('relance')), 'Lexique : repères des sorts grisés (plein avant 1/2)', d('relance'));
    const txt = await ev(p, () => [...document.querySelectorAll('script')].length);
    // typographie : plus d'espace ordinaire autour des guillemets dans les textes du jeu
    const brut = await ev(p, () => { let n = 0; const re = /« | »/g; window.ORVANE.Proto.Lexique.entrees().forEach(e => { n += (e.def.match(re) || []).length; }); return n; });
    ok(brut === 0, 'Typographie : guillemets avec espaces insécables (Lexique)', brut + ' espaces ordinaires');
  });

  console.log('\n=== BILAN ===\n' + bilan.join('\n'));
  fs.writeFileSync(DOSSIER + '/bilan.txt', bilan.join('\n') + '\n');
  process.exit(bilan.some(l => l.startsWith('ÉCHEC')) ? 1 : 0);
})();
