// Une partie complète jouée comme un joueur (doigt sur téléphone, souris sur ordinateur), avec les captures finales.
// Passe 5 : nouvel artisan (« Non, je connais le jeu », puis ses points), case dorée déjà prise d'office, Commande expliquée ;
// on mesure la durée réelle du combat (« Envoyez ! » → Addition) ; au téléphone, captures du panneau des caractéristiques,
// de la barre avec des sorts grisés et du Lexique.
// node partie.js <tel|ordi> <classe> <h|f> <niveau> <groupe> <dossier des captures> <prefixe>
const { ouvrir } = require('./outils.js');
const [mode = 'tel', classe = 'merlanceur', sexe = 'h', niveau = '26', groupeVoulu = 'grumeaux', dossier = __dirname + '/captures', prefixe = 'tel'] = process.argv.slice(2);
const TEL = mode === 'tel';

const CERVEAU = () => {
  const O = () => window.__orvane;
  window.__cerveau = {
    etat() { const R = O().regles(), e = O().etat; if (!e) return null; const m = R.trouver(e, 'moi'); return { manche: e.manche, phase: e.phase, actif: (R.actif(e) || {}).id, moi: { v: m.victuailles, max: m.victuaillesMax, cm: m.cm, pas: m.pas, case: m.case, pain: m.pain }, mons: e.combattants.filter(c => c.camp !== 'artisans').map(c => c.nom + ':' + (c.vivant ? c.victuailles : 'tombé') + '@' + c.case) }; },
    scene() { const s = O().jeu.sceneActive; return s ? { phase: s.phase, apercu: s.apercu ? { type: s.apercu.type, case: s.apercu.case } : null, sort: s.sortChoisi } : null; },
    message() { return document.getElementById('message').textContent; },
    // un sort de loin dont le Rayon montre des cases visables et des cases cachées
    sortRayon() {
      const R = O().regles(), e = O().etat; let best = null;
      R.barre(e, 'moi').filter(b => b.disponible).forEach(b => { const v = R.casesVisables(e, 'moi', b.id); const n = v.cases.filter(c => c.visable).length, k = v.cases.filter(c => c.raison === 'Pas de vue').length; const sc = Math.min(n, 3 * k); if (n >= 3 && k >= 2 && (!best || sc > best.sc)) best = { id: b.id, nom: b.nom, r: b.rayon.max, visables: n, caches: k, sc }; });
      return best;
    },
    // le meilleur coup de zone (le plus d'ennemis touchés)
    sortZone() {
      const R = O().regles(), e = O().etat, moi = R.trouver(e, 'moi'); let best = null;
      R.barre(e, 'moi').filter(b => b.disponible).forEach(b => {
        const s = moi.sorts.find(x => x.id === b.id); if (!s || !s.zone || s.zone.forme === 'case' || !JSON.stringify(s.effets).includes('degats')) return;
        R.casesVisables(e, 'moi', b.id).cases.filter(c => c.visable).forEach(c => { const ap = R.apercuSort(e, 'moi', b.id, c.case); if (!ap.ok) return; const n = ap.cibles.filter(t => !t.allie && t.degats).length; if (n && (!best || n > best.n || (n === best.n && ap.zone.length > best.z))) best = { id: b.id, nom: b.nom, case: c.case, n, z: ap.zone.length }; });
      });
      return best;
    },
    // une case où marcher qui fait passer par le Rideau
    marcheRideau() {
      const R = O().regles(), e = O().etat, rid = R.apercuRideau(e, 'moi');
      if (!rid.auContact || rid.pris || !(rid.perte.pas || rid.perte.cm)) return null;
      const l = R.deplacementsPossibles(e, 'moi').filter(d => (d.rideau || []).length).sort((a, b) => b.cout - a.cout);
      return l.length ? { case: l[0].case, perte: l[0].perte } : null;
    },
    // une case au contact d'un monstre (pour que le Rideau existe au tour suivant)
    marcheContact() {
      const R = O().regles(), e = O().etat, ms = e.combattants.filter(c => c.camp !== 'artisans' && c.vivant && c.case);
      const l = R.deplacementsPossibles(e, 'moi').filter(d => ms.some(m => R.distance(m.case, d.case) === 1) && !(d.perte && (d.perte.pas || d.perte.cm)));
      return l.length ? l[0].case : null;
    },
    plan(marches) {
      const R = O().regles(), e = O().etat;
      if (!e || O().scene !== 'combat') return { type: 'aucun' };
      const a = R.actif(e); if (!a || a.id !== 'moi') return { type: 'aucun' };
      const moi = R.trouver(e, 'moi'), barre = R.barre(e, 'moi');
      if (moi.victuailles < moi.victuaillesMax * 0.45 && R.utiliserPainDeRoute(R.cloner(e), 'moi').ok) return { type: 'pain' };
      let best = null;
      barre.forEach((s, i) => {
        if (!s.disponible) return;
        R.casesVisables(e, 'moi', s.id).cases.forEach(c => {
          if (!c.visable) return;
          const ap = R.apercuSort(e, 'moi', s.id, c.case); if (!ap.ok) return;
          let sc = 0, cible = null;
          ap.cibles.forEach(t => { if (!t.allie && t.degats) { sc += (t.degats.min + t.degats.max) / 2 + (t.tombe === 'sur' ? 60 : 0); cible = cible || t.id; } });
          sc = sc / Math.max(1, s.cm) * 3 + sc * .2;
          if (sc > 0 && (!best || sc > best.sc)) best = { type: 'sort', id: s.id, nom: s.nom, index: i, case: c.case, sc, cible };
        });
      });
      if (best) return best;
      const ms = e.combattants.filter(c => c.camp !== 'artisans' && c.vivant && c.case);
      if (!ms.length) return { type: 'fin' };
      if (marches < 2 && moi.pas > 0) {
        const dmin = c => Math.min(...ms.map(m => R.distance(m.case, c)));
        let bm = null;
        R.deplacementsPossibles(e, 'moi').forEach(d => { const k = dmin(d.case); const val = Math.abs(k - 2) * 10 + d.cout * .1 + (d.perte ? (d.perte.cm || 0) * 3 : 0); if (!bm || val < bm.val) bm = { case: d.case, val, k }; });
        if (bm && Math.abs(bm.k - 2) < Math.abs(dmin(moi.case) - 2)) return { type: 'marche', case: bm.case };
      }
      return { type: 'fin' };
    },
    flottants() { const s = O().jeu.sceneActive; return !!(s && s.plateau && (s.plateau.flottants || []).some(f => f.fin > Date.now() && /^−\d+$/.test(f.texte || ''))); }
  };
};

(async () => {
  const T = await ouvrir(TEL ? { w: 390, h: 844, dossier } : { w: 1280, h: 800, tel: false, dossier });
  const { p, log, cap, pause, tap, tapSel, attendre, ecranCase, ecranPion, scene } = T;
  const C = nom => cap(prefixe + '-' + nom);
  const ev = (f, a) => p.evaluate(f, a);
  const cer = (m, a) => p.evaluate(([m, a]) => window.__cerveau[m](a), [m, a]);
  const vers = async c => { const q = await ecranCase(c); return q; };
  // premier temps : l'aperçu (toucher au doigt, survol à la souris)
  const apercuSur = async q => { if (TEL) await tap(q.x, q.y); else await p.mouse.move(q.x, q.y, { steps: 4 }); await pause(TEL ? 380 : 250); };
  // second temps : l'action (second toucher après le délai du double toucher, ou clic)
  const valider = async q => { if (TEL) await tap(q.x, q.y); else await p.mouse.click(q.x, q.y); await pause(450); await attendre(); };
  const faits = {};
  const t0 = Date.now();
  try {
    await p.evaluate(CERVEAU);
    // l'heure où l'Addition s'ouvre (pour la durée réelle du combat)
    await p.evaluate(() => { const d = document.getElementById('d-addition'); new MutationObserver(() => { if (d.open && !window.__tAddition) window.__tAddition = Date.now(); }).observe(d, { attributes: true }); });
    log(`=== ${mode} : ${classe} (${sexe}) niveau ${niveau} contre ${groupeVoulu} ===`);
    // ---------- Choix de la classe ----------
    await tapSel(`.classe-b[data-classe="${classe}"]`);
    if (sexe === 'f') await tapSel('[data-sexe="f"]');
    await tapSel('#peaux button:nth-child(4)');
    await tapSel('#poils button:nth-child(3)');
    await p.fill('#nom', TEL ? 'Anchoise' : 'Meringue');
    await p.selectOption('#niveau', niveau);
    await p.evaluate(() => document.getElementById('creation').scrollTo(0, 0));
    await pause(250); await C('01-choix-classe');
    await tapSel('#entrer');
    await pause(150);
    if (await ev(() => { const b = document.getElementById('entrer'); return !!b && b.classList.contains('confirmer') && !document.getElementById('creation').hidden; })) await tapSel('#entrer');
    await p.waitForFunction(() => window.__orvane.scene === 'balade', null, { timeout: 20000 });
    await pause(900);
    // un nouvel artisan : Mère Fournil propose le tutoriel (on le connaît), puis ses points sont à placer
    await p.waitForSelector('#tuto-non', { timeout: 8000 }); await pause(300);
    log('proposition :', (await p.$eval('#d-fiche', d => d.innerText)).replace(/\s+/g, ' ').slice(0, 160));
    await tapSel('#tuto-non'); await pause(500);
    // niveau 1 : aucun point à placer, pas de proposition
    const aDesPoints = await p.waitForSelector('#prop-choisir', { timeout: 4000 }).then(() => true).catch(() => false); await pause(300);
    if (aDesPoints) log('points :', (await p.$eval('#d-fiche', d => d.innerText)).replace(/\s+/g, ' ').slice(0, 200));
    if (!aDesPoints) log('niveau 1 : pas de points à placer');
    else if (TEL) {
      // le panneau : « Répartir pour moi », puis on change d'avis sur 2 points (Victuailles), l'aperçu le montre
      await tapSel('#prop-choisir'); await pause(500);
      await tapSel('#carac-auto'); await pause(300);
      const el = await ev(() => window.ORVANE.Proto.Profil.elementsConseilles()[0]);
      for (let k = 0; k < 2; k++) { await tapSel(`#d-carac [data-ligne="${el}"] [data-moins]`); await pause(200); }
      for (let k = 0; k < 2; k++) { await tapSel('#d-carac [data-ligne="victuailles"] [data-plus]'); await pause(200); }
      await ev(() => { const l = document.querySelector('#d-carac [data-ligne="victuailles"]'); l.scrollIntoView({ block: 'center' }); });
      await pause(300); await cap('carac-01');
      log('panneau :', JSON.stringify(await ev(() => ({ reste: document.getElementById('carac-n').textContent, statut: document.getElementById('carac-statut').textContent }))));
      await tapSel('#carac-valider'); await pause(500);
    } else { await tapSel('#prop-auto'); await pause(500); }
    // passe 7 : sans le tutoriel, Mère Fournil propose ensuite le tour de l'Astrelier (facultatif) : « Plus tard »
    if (await p.waitForSelector('#tour-oui', { timeout: 4000 }).then(() => true).catch(() => false)) {
      log('tour de l\'Astrelier proposé :', (await p.$eval('#d-fiche', d => d.innerText)).replace(/\s+/g, ' ').slice(0, 120));
      await pause(300); await tapSel('#d-fiche footer [data-fermer]'); await pause(400);
    }
    log('carac :', JSON.stringify(await ev(() => window.__orvane.profil.carac)), 'pastille', await ev(() => document.getElementById('pastille-carac').hidden ? 'cachée' : document.getElementById('pastille-carac').textContent));
    log('groupes :', JSON.stringify(await ev(() => window.__orvane.groupes())));
    await C('02-exploration-groupes');
    // ---------- Grimoire ----------
    await tapSel('#b-grimoire'); await pause(400);
    await C('03-grimoire');
    await tapSel('#d-grimoire footer .bouton'); await pause(200);
    // ---------- Fiche d'un groupe ----------
    const gi = await ev(g => { const l = window.__orvane.groupes(); return (l.find(x => x.actif && x.groupe === g) || l.find(x => x.actif)).i; }, groupeVoulu);
    const posG = () => ev(i => { const s = window.__orvane.jeu.sceneActive, pg = s.pionsGroupes[i]; return pg ? s.vue.versEcran(pg.c.x, pg.c.y - pg.hauteur * .45) : null; }, gi);
    let q = await posG(); await tap(q.x, q.y); await pause(500);
    if (!(await ev(() => document.getElementById('d-fiche').open))) { q = await posG(); await tap(q.x, q.y); await pause(500); }
    log('fiche :', (await p.$eval('#d-fiche', d => d.innerText)).replace(/\s+/g, ' ').slice(0, 200));
    await C('04-fiche-groupe');
    await tapSel('#engager');
    await p.waitForFunction(() => window.__orvane.scene === 'placement', null, { timeout: 20000 }); await pause(800);
    // ---------- Mise en place : la case dorée la plus proche des monstres ----------
    const caseDep = await ev(() => { const O = window.__orvane, R = O.regles(), e = O.etat, d = e.carte.departs[e.depart]; const ms = e.combattants.filter(c => c.camp !== 'artisans'); return d.artisans.slice().sort((a, b) => Math.min(...ms.map(m => R.distance(m.case, a))) - Math.min(...ms.map(m => R.distance(m.case, b))))[0]; });
    log('déjà placé en', JSON.stringify(await ev(() => window.__orvane.etat.combattants.find(c => c.id === 'moi').case)), '| consigne :', await p.$eval('#consigne-placement', e => e.textContent));
    await pause(2200);
    log('consigne (après la bulle) :', await p.$eval('#consigne-placement', e => e.textContent));
    q = await vers(caseDep); await tap(q.x, q.y); await pause(700);
    log('placé en', JSON.stringify(await ev(() => window.__orvane.etat.combattants.find(c => c.id === 'moi').case)), 'Commande', await p.$eval('#resume-commande', e => e.textContent), '|', await p.$eval('#resume-regle', e => e.textContent));
    await C('05-mise-en-place');
    await tapSel('#envoyer');
    const tEnvoi = Date.now();
    await pause(300); await attendre(); await pause(300);
    // ---------- Combat ----------
    let tours = 0;
    while (await scene() === 'combat' && tours < 25 && Date.now() - t0 < 500000) {
      const ec = await cer('etat');
      if (!ec || ec.actif !== 'moi' || (await cer('scene')).phase !== 'joueur') { await attendre(); continue; }
      tours++;
      log(`--- mon tour ${tours} : ${JSON.stringify(ec)}`);
      // 1. le Rayon d'un sort de loin, visable et caché
      if (!faits.rayon) {
        const r = await cer('sortRayon');
        if (r) {
          await tapSel(`#grille-sorts .sort[data-id="${r.id}"]`); await pause(350);
          if (!TEL) await p.mouse.move(5, 300);
          await pause(200); await C('07-sort-rayon-visable-cache'); faits.rayon = true;
          log('Rayon de', r.nom, ':', r.visables, 'cases visables,', r.caches, 'cachées | message', JSON.stringify(await cer('message')));
          await tapSel(`#grille-sorts .sort[data-id="${r.id}"]`); await pause(200);
        }
      }
      // 2. aperçu de déplacement avec le Rideau
      if (!faits.rideau) {
        const m = await cer('marcheRideau');
        if (m) {
          q = await vers(m.case); await apercuSur(q);
          log('aperçu de marche avec Rideau :', JSON.stringify(await cer('scene')), JSON.stringify(await cer('message')));
          await C('06-apercu-deplacement-rideau'); faits.rideau = true;
          // on annule : toucher sa propre case (ou Échap à la souris)
          if (TEL) { const mq = await vers((await cer('etat')).moi.case); await tap(mq.x, mq.y + 6); } else { await p.mouse.move(5, 300); await p.keyboard.press('Escape'); }
          await pause(400);
        } else if (tours === 1) {
          // au premier tour, on va au contact (le Rideau existera au tour suivant)
          const c = await cer('marcheContact');
          if (c) { q = await vers(c); await apercuSur(q); await valider(q); log('au contact en', JSON.stringify(c)); }
          await tapSel('#fin-tour'); await pause(300);
          await suivreTourMonstre();
          continue;
        }
      }
      // 3. aperçu d'une zone avec les fourchettes de dégâts, puis le lancer
      if (!faits.zone) {
        const z = await cer('sortZone');
        if (z && (z.n >= 2 || tours >= 3)) {
          await tapSel(`#grille-sorts .sort[data-id="${z.id}"]`); await pause(300);
          q = await vers(z.case); await apercuSur(q);
          log('aperçu de zone', z.nom, 'sur', JSON.stringify(z.case), ':', z.n, 'ennemis |', JSON.stringify(await cer('message')));
          await C('08-apercu-zone-fourchettes'); faits.zone = true;
          if (TEL) { await tapSel('#b-lancer'); await pause(450); await attendre(); } else await valider(q);
          log('  →', JSON.stringify((await cer('etat')).mons));
        }
      }
      // 4. le reste du tour
      let marches = 0;
      for (let k = 0; k < 8 && await scene() === 'combat'; k++) {
        const plan = await cer('plan', marches);
        if (plan.type === 'aucun' || plan.type === 'fin') break;
        if (plan.type === 'pain') { await tapSel('#b-pain'); await pause(250); await tapSel('#b-pain'); await pause(450); await attendre(); log('Pain de route'); continue; }
        if (plan.type === 'marche') { marches++; q = await vers(plan.case); await apercuSur(q); await valider(q); continue; }
        if (plan.type === 'sort') {
          await tapSel(`#grille-sorts .sort[data-id="${plan.id}"]`); await pause(250);
          q = await vers(plan.case); await apercuSur(q);
          const ap = await cer('scene');
          if (!ap.apercu || ap.apercu.type !== 'sort') { log('!! pas d\'aperçu pour', plan.nom, JSON.stringify(ap), JSON.stringify(await cer('message'))); await p.keyboard.press('Escape'); break; }
          await valider(q);
          log('  ', plan.nom, '→', JSON.stringify((await cer('etat')).mons));
        }
      }
      if (await scene() !== 'combat') break;
      // la barre en fin de tour : des sorts grisés et leurs repères (coût en rouge, relance, nombre par tour)
      if (TEL && !faits.grises) {
        const g = await ev(() => { const b = [...document.querySelectorAll('#grille-sorts .sort.grise')]; return { n: b.length, reperes: b.filter(x => x.querySelector('.relance, .limite, .cout.manque')).length }; });
        if (g.reperes >= 2) { await pause(200); await cap('sorts-grises-01'); faits.grises = true; log('sorts grisés :', JSON.stringify(g), JSON.stringify(await ev(() => [...document.querySelectorAll('#grille-sorts .sort.grise')].map(x => x.getAttribute('aria-label'))))); }
      }
      if ((await cer('etat')).actif === 'moi') { await tapSel('#fin-tour'); await pause(250); await suivreTourMonstre(); }
    }
    async function suivreTourMonstre() {
      for (let k = 0; k < 40; k++) {
        await pause(150);
        const s = await cer('scene'); if (!s || s.phase === 'joueur' || await scene() !== 'combat') break;
        if (!faits.monstre && s.phase === 'autre' && !/^À toi/.test(await cer('message')) && await cer('flottants')) { await pause(60); await C('09-tour-monstre'); faits.monstre = true; log('tour d\'un monstre :', JSON.stringify(await cer('message'))); }
      }
      await attendre();
    }
    await pause(1200);
    log('fin :', await scene(), 'captures faites', JSON.stringify(faits));
    if (await scene() === 'addition') {
      const duree = await ev(() => window.__tAddition || Date.now());
      log(`DURÉE DU COMBAT : ${((duree - tEnvoi) / 1000).toFixed(1)} s, ${await ev(() => window.__orvane.jeu.sceneActive.etat.manche)} manches, ${tours} tours joués`);
      log('Addition :', (await p.$eval('#d-addition', d => d.innerText)).replace(/\s+/g, ' '));
      log('barre après le combat :', await ev(() => (document.querySelector('#grille-sorts .sort') || {}).getAttribute('aria-label')));
      await C('10-addition');
      await tapSel('#retour-balade');
      await p.waitForFunction(() => window.__orvane.scene === 'balade', null, { timeout: 20000 }); await pause(800);
      await C('11-retour-exploration');
      if (TEL) {
        await tapSel('#b-lexique'); await pause(400);
        await tapSel('#d-lexique [data-aller="sol"]'); await pause(400);
        await cap('lexique-01'); await tapSel('#d-lexique footer .bouton'); await pause(300);
      }
      log('profil :', JSON.stringify(await ev(() => { const x = window.__orvane.profil; return { niveau: x.niveau, xp: x.xp, ble: x.ble, sac: x.sac, victoires: x.victoires }; })));
    }
  } catch (e) { log('ERREUR', e.stack); await C('erreur').catch(() => {}); }
  finally {
    log('durée', Math.round((Date.now() - t0) / 1000), 's ; console :', JSON.stringify(T.msgs));
    T.ecrireJournal('partie-' + prefixe);
    await T.b.close();
  }
})();
