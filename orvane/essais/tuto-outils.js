// Outils des essais du tutoriel : lire l'écran (carte de quête, anneau doré, fenêtres) et suivre les consignes au doigt.
// window.__orvane ne sert qu'à lire l'état et à attendre que le jeu soit calme.
const fs = require('fs');
function preparer(o, prefixe) {
  const { p, tap, tapSel, pause, cap, log } = o;
  let n = 0;
  const lettres = {};
  const capture = async (nom) => cap(`${prefixe}-${String(++n).padStart(2, '0')}-${nom}`);
  const lire = () => p.evaluate(() => {
    const c = document.getElementById('tuto-carte'), t = window.__orvane.tuto();
    const r = c && !c.hidden ? c.getBoundingClientRect() : null;
    const cible = [...document.querySelectorAll('.tuto-cible')].find(e => e.getBoundingClientRect().width);
    const rc = cible ? cible.getBoundingClientRect() : null;
    const a = document.getElementById('tuto-anneau'), ra = a && !a.hidden ? a.getBoundingClientRect() : null;
    const dlg = [...document.querySelectorAll('dialog')].filter(d => d.open).map(d => d.id);
    const dans = document.querySelector('.tuto-dans');
    return {
      scene: window.__orvane.scene, etat: t, carte: !!r, replie: !!(c && c.classList.contains('repliee')),
      texte: r ? document.getElementById('tuto-texte').textContent : null, etape: r ? document.getElementById('tuto-etape').textContent : null,
      num: t && t.vue ? t.vue.num : null,
      aire: r ? Math.round(1000 * r.width * r.height / (innerWidth * innerHeight)) / 10 : 0,
      cible: cible ? { id: cible.id || cible.className.replace(' tuto-cible', ''), x: rc.x + rc.width / 2, y: rc.y + rc.height / 2, w: Math.round(rc.width), h: Math.round(rc.height) } : null,
      anneau: ra && ra.width ? { x: ra.x + ra.width / 2, y: ra.y + ra.height / 2 } : null,
      dialogues: dlg, dans: dans ? dans.textContent : null
    };
  });
  const attendre = () => p.evaluate(() => window.__orvane.attendre(60000)).catch(() => null);
  const vus = new Set();
  const noter = async (e, force) => {
    const cle = (e.texte || '') + '|' + e.dialogues.join(',') + '|' + (e.cible ? e.cible.id : e.anneau ? 'case' : '');
    if (vus.has(cle) && !force) return false;
    vus.add(cle);
    const k = 'e' + (e.num || 0); lettres[k] = (lettres[k] || 0) + 1;
    const nom = k + String.fromCharCode(96 + lettres[k]) + (e.dialogues[0] ? '-' + e.dialogues[0].slice(2) : '') + (e.scene === 'combat' || e.scene === 'placement' ? '-combat' : '');
    log(`[${e.scene}] ${e.etape} · carte ${e.aire} % de l'écran${e.dialogues.length ? ' · fenêtre ' + e.dialogues.join(',') : ''}\n    « ${e.texte} »` +
      (e.dans ? `\n    dans la fenêtre : « ${e.dans} »` : '') + `\n    cible : ${e.cible ? e.cible.id + ' (' + e.cible.w + '×' + e.cible.h + ')' : e.anneau ? 'anneau sur une case du terrain' : 'aucune'}`);
    await capture(nom);
    return true;
  };
  // Placer ses points « où l'on veut » : 2 + 2 dans les éléments conseillés, 1 en Victuailles
  const placerPoints = async () => {
    const els = await p.evaluate(() => window.ORVANE.Proto.Profil.elementsConseilles());
    const plan = [els[0], els[1] || els[0], els[0], els[1] || els[0], 'victuailles'];
    log('  je place mes points : ' + plan.join(', '));
    for (const el of plan) { const b = await p.$(`#d-carac [data-ligne="${el}"] [data-plus]:not([disabled])`); if (!b) break; await tapSel(`#d-carac [data-ligne="${el}"] [data-plus]`); await pause(250); }
  };
  // Suivre l'écran jusqu'à ce que jusqua(e) soit vrai (ou la fin de la quête)
  async function suivre(jusqua, o2 = {}) {
    let sansCible = 0;
    for (let i = 0; i < (o2.max || 300); i++) {
      await attendre();
      await pause(250);
      const e = await lire();
      if (e.dialogues.includes('d-fiche') && (await p.$('#tuto-lexique'))) { e.fin = true; return e; }
      if (jusqua && jusqua(e)) return e;
      if (!e.etat || e.etat.statut !== 'actif') { e.inactif = true; return e; }
      await noter(e);
      if (e.cible && /carac-reste/.test(e.cible.id)) { await placerPoints(); await pause(300); continue; }
      if (e.cible) { await tap(e.cible.x, e.cible.y); await pause(700); sansCible = 0; continue; }
      if (e.anneau) { await tap(e.anneau.x, e.anneau.y); await pause(700); sansCible = 0; continue; }
      if (++sansCible > 120) { log('!! Bloqué sans cible : ' + JSON.stringify(e)); e.bloque = true; return e; }
      await pause(400);
    }
    return { bloque: true };
  }
  const ecrire = (nom) => fs.writeFileSync(__dirname + '/tuto/' + nom + '-journal.txt', o.journal.join('\n') + '\n\nConsole :\n' + (o.msgs.length ? o.msgs.join('\n') : 'vide') + '\n');
  return { lire, attendre, noter, suivre, capture, placerPoints, ecrire };
}
module.exports = { preparer };
