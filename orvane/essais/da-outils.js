// Direction artistique, passe 6 : ouvrir le jeu au téléphone (390 × 844, deviceScaleFactor 2) avec une horloge qu'on peut arrêter,
// pour filmer chaque passage image par image (avant, pendant, après). Rien n'est modifié dans le prototype : on lit l'état
// (window.__orvane) et on touche l'écran comme un doigt.
const { chromium } = require('playwright');
const fs = require('fs');
const RACINE = require('path').resolve(__dirname, '..');
const ICI = __dirname;
const CAPT = ICI + '/captures', FILMS = ICI + '/films';
fs.mkdirSync(CAPT, { recursive: true }); fs.mkdirSync(FILMS, { recursive: true });

async function ouvrir(o = {}) {
  const w = o.w || 390, h = o.h || 844;
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: o.dsf || 2, hasTouch: true, isMobile: true, reducedMotion: o.reduit ? 'reduce' : 'no-preference', locale: 'fr-FR' });
  await ctx.clock.install();
  const p = await ctx.newPage();
  const cdp = await ctx.newCDPSession(p);
  const msgs = [], journal = [];
  p.on('console', m => { if (m.type() === 'error' || (m.type() === 'warning' && !/GPU stall|GL Driver|WebGL|swiftshader/i.test(m.text()))) msgs.push(m.type() + ': ' + m.text()); });
  p.on('pageerror', e => msgs.push('pageerror: ' + e.message));
  const log = (...a) => { const l = a.join(' '); journal.push(l); console.log(l); };
  const pause = ms => p.waitForTimeout(ms);
  const tap = (x, y) => p.touchscreen.tap(x, y);
  const touche = (type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts.map((q, i) => ({ x: q.x, y: q.y, id: i + 1, radiusX: 6, radiusY: 6, force: 1 })) });
  const glisser = async (x0, y0, x1, y1, etapes = 12, ms = 220) => { await touche('touchStart', [{ x: x0, y: y0 }]); for (let i = 1; i <= etapes; i++) { await touche('touchMove', [{ x: x0 + (x1 - x0) * i / etapes, y: y0 + (y1 - y0) * i / etapes }]); await pause(ms / etapes); } await touche('touchEnd', []); };
  const cap = async (nom, opt = {}) => { const f = CAPT + '/' + nom + '.png'; await p.screenshot(Object.assign({ path: f }, opt)); log('  [capture ' + nom + ']'); return f; };
  const ev = (f, a) => p.evaluate(f, a);
  const ile = () => ev(() => window.__orvane.ile);
  const objets = () => ev(() => window.__orvane.objets());
  const calme = () => ev(() => window.__orvane.attendre(60000)).catch(e => log('!! attente : ' + e.message));
  async function point(id) {
    const ob = (await objets()).find(x => x.id === id);
    if (!ob) throw new Error('Objet absent de l\'île : ' + id);
    return ob.genre === 'marche' || !ob.dessin ? ob.ecran : ob.dessin;
  }
  async function enVue(id) {
    for (let k = 0; k < 4; k++) {
      const pt = await point(id), r = await ev(() => window.__orvane.rectUtile());
      if (pt.x > r.x + 24 && pt.x < r.x + r.w - 24 && pt.y > r.y + 24 && pt.y < r.y + r.h - 24) return pt;
      const cx = r.x + r.w / 2, cy = r.y + r.h / 2;
      await glisser(cx, cy, cx - (pt.x - cx) * .8, cy - (pt.y - cy) * .8);
      await pause(250);
    }
    return point(id);
  }
  // Premier toucher : l'aperçu (étiquette, case d'accès dorée, consigne)
  async function apercu(id) {
    const pt = await enVue(id);
    await tap(pt.x, pt.y); await pause(500);
    return { consigne: (await p.textContent('#consigne-balade')).trim(), apercu: await ev(() => window.__orvane.apercuVoyage()) };
  }
  // Filmer : l'horloge du jeu est arrêtée, on la fait avancer par pas de « pas » ms et on prend une image à chaque pas
  // tant qu'un passage est en cours (ou pendant « images » pas si o.toujours), puis encore « apres » pas.
  async function filmer(nom, declencher, o = {}) {
    const dir = FILMS + '/' + nom; fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
    const pas = o.pas || 40;
    const avant = await objets().catch(() => []), moiAvant = await ev(() => window.__orvane.ecranDePion('moi')).catch(() => null);
    const t0 = await ev(() => Date.now());
    await p.clock.pauseAt(t0 + 500);
    await declencher();
    const images = []; let vu = false, fini = 0, k = 0, attente = 0;
    for (let i = 0; i < (o.max || 900); i++) {
      await p.clock.runFor(pas);
      const e = await ev(() => { const J = window.__orvane.jeu, ps = J.passage; return { pass: !!ps, t: ps ? Math.round(performance.now() - ps.debut) : null, ile: window.__orvane.ile, voile: (() => { const v = document.getElementById('voile'); return v.hidden ? 0 : +getComputedStyle(v).opacity; })() }; });
      if (e.pass) vu = true;
      const filme = o.toujours ? i < (o.images || 30) : (e.pass || (vu && fini < (o.apres || 6)));
      if (!e.pass && !vu && !o.toujours) { if (++attente > (o.marcheMax || 400)) { log('!! pas de passage pour ' + nom); break; } if (o.pendantMarche && attente % o.pendantMarche === 0) { const f = dir + '/marche-' + String(attente).padStart(4, '0') + '.png'; await p.screenshot({ path: f }); images.push({ f, t: null, marche: true, ile: e.ile }); } continue; }
      if (filme) {
        k++;
        const f = dir + '/' + String(k).padStart(3, '0') + '.png';
        await p.screenshot({ path: f });
        images.push({ f, t: e.t, ile: e.ile, voile: e.voile, apres: vu && !e.pass });
      }
      if (vu && !e.pass) fini++;
      if (o.toujours && i >= (o.images || 30)) break;
      if (!o.toujours && vu && fini >= (o.apres || 6)) break;
    }
    await p.clock.resume();
    await pause(200);
    const d = await ev(() => window.__orvane.dernierPassage);
    const apres = await objets().catch(() => []), moiApres = await ev(() => window.__orvane.ecranDePion('moi')).catch(() => null);
    fs.writeFileSync(dir + '/images.json', JSON.stringify({ nom, pas, passage: d, avant, moiAvant, apres, moiApres, images }, null, 1));
    log(`  [film ${nom} : ${images.length} images${d ? ', ' + d.genre + ' ' + d.de + ' → ' + d.vers + ', ' + d.duree + ' ms (départ ' + d.depart + ', voilé ' + d.couvert + ', île prête ' + d.ouverture + ')' : ''}]`);
    return { images, passage: d };
  }
  // Le second toucher d'un objet (après l'aperçu), horloge arrêtée
  const secondToucher = id => async () => { const pt = await point(id); await tap(pt.x, pt.y); };
  // Les objets visibles, en coordonnées d'écran (pour les recadrages des planches)
  const ecrireObjets = async nom => { const l = await objets(); fs.writeFileSync(CAPT + '/' + nom + '.objets.json', JSON.stringify(l, null, 1)); return l; };
  await p.goto('file://' + RACINE + '/jeu.html');
  await p.waitForFunction(() => window.__orvane && window.__orvane.scene === 'creation', null, { timeout: 40000 });
  return { b, ctx, p, cdp, log, cap, pause, tap, glisser, ev, ile, objets, calme, point, enVue, apercu, filmer, secondToucher, ecrireObjets, msgs, journal };
}
module.exports = { ouvrir, RACINE, ICI, CAPT, FILMS };
