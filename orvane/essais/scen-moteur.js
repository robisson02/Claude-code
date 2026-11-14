// Essai des correctifs du moteur dans la page : absences en solo, Pain de route (apercuPain), fournée (eclatement), Addition d'une défaite.
const { ouvrir } = require('./outils.js');
(async () => {
  const T = await ouvrir({ w: 390, h: 844, dossier: __dirname + '/captures' });
  const { p, log, cap, pause, tapSel, attendre } = T;
  const msgs = () => p.evaluate(() => [...document.querySelectorAll('#annonce, #message, .annonce')].map(e => e.textContent.trim()).filter(Boolean).join(' | '));
  const scene = () => p.evaluate(() => window.__orvane.jeu.sceneActive);
  let ok = true;
  const verif = (cond, quoi) => { log((cond ? 'OK   ' : 'ÉCHEC ') + quoi); if (!cond) ok = false; };
  try {
    // 1. Levainqueur 10 (a Fournée) : aperçu d'éclatement venu du moteur
    await p.evaluate(() => window.__orvane.creer({ classe: 'levainqueur', niveau: 10 }));
    await pause(400);
    await p.evaluate(() => window.__orvane.engagerGroupe(0));
    await pause(500);
    await tapSel('#envoyer'); await attendre(); await pause(300);
    const four = await p.evaluate(() => {
      const O = window.__orvane, R = O.regles(), e = O.etat, moi = R.trouver(e, 'moi');
      const s = (moi.sorts || []).find(x => (x.effets || []).some(b => b.type === 'pose' && b.quoi === 'fournee' && b.tours > 0));
      if (!s) return { pas: 'aucun sort de fournée qui cuit' };
      const cases = R.casesVisables(e, 'moi', s.id).cases.filter(c => c.visable).map(c => c.case);
      let best = null;
      cases.forEach(c => { const ap = R.apercuSort(e, 'moi', s.id, c); if (ap.ok && ap.eclatement && (!best || ap.eclatement.cibles.length > best.n)) best = { c, n: ap.eclatement.cibles.length, z: ap.eclatement.zone.length }; });
      if (!best) return { sort: s.id, pas: 'aucune case' };
      O.choisirSort(s.id); O.toucherCase(best.c);
      const a = O.jeu.sceneActive.apercu;
      return { sort: s.nom, case: best.c, ciblesMoteur: best.n, zone: best.z, eclatPage: a && a.eclat ? { zone: a.eclat.zone.length, cibles: a.eclat.cibles.length } : null };
    });
    log('fournée', JSON.stringify(four));
    verif(four.eclatPage && four.eclatPage.zone === four.zone && four.eclatPage.cibles === four.ciblesMoteur, 'la page montre la zone et les cibles d\'éclatement données par le moteur');
    await cap('m-01-fournee-eclatement');
    // 2. Pain de route : refus à Victuailles pleines, valeur réelle quand il manque peu
    const pain = await p.evaluate(() => {
      const O = window.__orvane, s = O.jeu.sceneActive, R = O.regles(), moi = R.trouver(O.etat, 'moi');
      const avant = moi.victuailles, max = moi.victuaillesMax - moi.entame;
      moi.victuailles = max;
      const plein = s.etatPain(true);
      moi.victuailles = max - 4;
      const blesse = s.etatPain(true);
      moi.victuailles = avant;
      return { avant, max, plein, blesse };
    });
    log('pain', JSON.stringify(pain));
    verif(!pain.plein.disponible && /pleines/.test(pain.plein.raison || ''), 'Pain refusé à Victuailles pleines, avec la raison du moteur');
    verif(pain.blesse.disponible && pain.blesse.valeur === 4, 'Pain disponible et rend exactement ce qui manque (4)');
    // 3. Minuteur en solo : trois tours passés sans jouer, on reste en combat
    for (let i = 1; i <= 3; i++) {
      await p.evaluate(async () => { const s = window.__orvane.jeu.sceneActive; s.sortChoisi = null; s.apercu = null; s.aAgi = false; await s.finDuTour(true); });
      await pause(200);
      log('  annonce après le tour passé ' + i + ' :', await msgs());
      await attendre(); await pause(300);
    }
    const apres = await p.evaluate(() => { const O = window.__orvane, R = O.regles(), m = R.trouver(O.etat, 'moi'); return { vivant: m.vivant, absences: m.absences, phase: O.etat.phase, pastille: (document.getElementById('absences') || {}).textContent || '', cachee: !!(document.getElementById('absences') || {}).hidden }; });
    log('après 3 tours passés', JSON.stringify(apres));
    verif(apres.vivant && apres.phase === 'combat', 'en solo, 3 tours passés ne font pas quitter le combat');
    verif(apres.cachee || !/Absent/.test(apres.pastille), 'pas de pastille « Absent n/3 » en solo');
    await cap('m-02-solo-trois-absences');
    // 4. Abandon : l'Addition dit « sans objet » si une Commande était choisie
    const k = await p.evaluate(() => (window.__orvane.etat.commande || {}).choisie);
    await p.evaluate(() => { const R = window.__orvane.regles(); return true; });
    await tapSel('#b-reglages-combat'); await pause(400);
    for (let i = 0; i < 2; i++) { await tapSel('#r-abandon'); await pause(400); }
    await pause(1500);
    const add = await p.evaluate(() => { const d = document.getElementById('d-addition'); return d ? d.innerText : null; });
    log('Addition :', (add || '').replace(/\s+/g, ' ').slice(0, 300), '| Commande choisie :', k);
    verif(add && (!k || /sans objet|ratée/.test(add)) && !/réussie/.test(add), 'Addition d\'une défaite : Commande sans objet (ou ratée si elle l\'était déjà), jamais « réussie »');
    await cap('m-03-addition-abandon');
  } catch (e) { log('ERREUR', e.stack); ok = false; }
  log('console :', JSON.stringify(T.msgs || []));
  log(ok ? 'TOUT BON' : 'DES ÉCHECS');
  await T.b.close();
  process.exit(ok ? 0 : 1);
})();
