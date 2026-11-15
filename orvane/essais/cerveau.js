// Le « cerveau » des essais de la passe 5 (partie.js) : choisir un coup comme un joueur appliqué (lecture de l'état seulement).
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
module.exports = { CERVEAU };
