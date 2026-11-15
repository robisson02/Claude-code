// Outils des essais des voyages : toucher un objet de voyage comme un joueur (deux touchers), attendre la fin du passage.
// window.__orvane ne sert qu'à LIRE l'état (où sont les objets à l'écran, l'île, le dernier passage).
function outils(o) {
  const { p, tap, pause, log, sous } = o;
  const ile = () => p.evaluate(() => window.__orvane.ile);
  const objets = () => p.evaluate(() => window.__orvane.objets());
  const calme = () => p.evaluate(() => window.__orvane.attendre(60000)).catch(e => log('!! attente : ' + e.message));
  // le point à toucher : la flèche (sa case) pour une sortie par le bord, le dessin de l'objet sinon
  async function point(id) {
    const ob = (await objets()).find(x => x.id === id);
    if (!ob) throw new Error('Objet absent de l\'île : ' + id);
    return ob.genre === 'marche' || !ob.dessin ? ob.ecran : ob.dessin;
  }
  // amener un point à l'écran : glisser la vue (comme un doigt) s'il est caché sous l'interface
  async function enVue(id) {
    for (let k = 0; k < 4; k++) {
      const pt = await point(id), r = await p.evaluate(() => window.__orvane.rectUtile());
      const dedans = pt.x > r.x + 24 && pt.x < r.x + r.w - 24 && pt.y > r.y + 24 && pt.y < r.y + r.h - 24;
      if (dedans) return pt;
      const cx = r.x + r.w / 2, cy = r.y + r.h / 2;
      if (o.tel) await o.glisser(cx, cy, cx - (pt.x - cx) * .8, cy - (pt.y - cy) * .8);
      else { await p.mouse.move(cx, cy); await p.mouse.down(); await p.mouse.move(cx - (pt.x - cx) * .8, cy - (pt.y - cy) * .8, { steps: 8 }); await p.mouse.up(); }
      await pause(250);
    }
    return point(id);
  }
  async function toucher(id, n = 2) {
    let pt = await enVue(id);
    const s = await sous(pt.x, pt.y);
    if (s !== 'canvas') log('!! le doigt tombe sur ' + s + ' en touchant ' + id);
    await tap(pt.x, pt.y);
    await pause(420);
    const ap = await p.evaluate(() => window.__orvane.apercuVoyage());
    const consigne = (await p.textContent('#consigne-balade')).replace(/[\u00a0\u202f]/g, ' ');
    if (n >= 2) { pt = await point(id); await tap(pt.x, pt.y); }
    return { apercu: ap, consigne };
  }
  // un passage complet : deux touchers, la marche, l'animation ; renvoie l'île d'arrivée et la durée du passage
  async function prendre(id) {
    const de = await ile();
    const t = await toucher(id, 2);
    await pause(300);
    await calme();
    await pause(250);
    const a = await ile(), d = await p.evaluate(() => window.__orvane.dernierPassage);
    log(`  ${id} : « ${t.consigne} » → ${de} → ${a} (${d ? d.genre + ", " + d.duree + " ms [départ " + d.depart + ", voilé " + d.couvert + ", île prête " + d.ouverture + "]" : "pas de passage"})`);
    return { de, vers: a, duree: d ? d.duree : null, genre: d ? d.genre : null, consigne: t.consigne };
  }
  return { ile, objets, calme, point, enVue, toucher, prendre };
}
module.exports = { outils };
