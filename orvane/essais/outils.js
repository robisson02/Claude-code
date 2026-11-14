// Outils des essais (repris de la passe 5) : on touche l'écran comme un joueur (Playwright).
const { chromium } = require('playwright');
const fs = require('fs');
const RACINE = require('path').resolve(__dirname, '..');
const ICI = __dirname;
const PAGE = process.env.ORVANE_PAGE || (RACINE + '/jeu.html');
async function ouvrir(o = {}) {
  const w = o.w || 390, h = o.h || 844, tel = o.tel !== false;
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: o.dsf || (tel ? 3 : 1), hasTouch: tel, isMobile: tel, reducedMotion: o.reduit ? 'reduce' : 'no-preference', locale: 'fr-FR' });
  if (o.stockage) await ctx.addInitScript(v => { try { localStorage.setItem('orvane-proto-1', v); } catch (e) {} }, o.stockage);
  const p = await ctx.newPage();
  const cdp = await ctx.newCDPSession(p);
  const msgs = [], journal = [];
  p.on('console', m => { if (m.type() === 'error' || (m.type() === 'warning' && !/GPU stall|GL Driver|WebGL|swiftshader/i.test(m.text()))) msgs.push(m.type() + ': ' + m.text()); });
  p.on('pageerror', e => msgs.push('pageerror: ' + e.message + '\n' + (e.stack || '').split('\n').slice(0, 4).join('\n')));
  const log = (...a) => { const l = a.join(' '); journal.push(l); console.log(l); };
  const dossier = o.dossier || (ICI + '/captures');
  const cap = async (nom, opt = {}) => { const f = dossier + '/' + nom + '.png'; await p.screenshot(Object.assign({ path: f }, opt)); log('  [capture ' + nom + ']'); return f; };
  const pause = ms => p.waitForTimeout(ms);
  const tap = async (x, y) => { if (tel) await p.touchscreen.tap(x, y); else await p.mouse.click(x, y); };
  const sous = (x, y) => p.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); if (!e) return 'rien'; return e.tagName === 'CANVAS' ? 'canvas' : (e.id ? '#' + e.id : e.tagName.toLowerCase() + '.' + String(e.className).split(' ')[0]); }, [x, y]);
  const tapSel = async (sel) => {
    const el = await p.$(sel); if (!el) throw new Error('Introuvable : ' + sel);
    await el.evaluate(e => e.scrollIntoView({ block: 'nearest', inline: 'nearest' }));
    const bb = await el.boundingBox(); if (!bb) throw new Error('Invisible : ' + sel);
    const x = bb.x + bb.width / 2, y = bb.y + bb.height / 2;
    const dessus = await p.evaluate(([sel, x, y]) => { const e = document.querySelector(sel), d = document.elementFromPoint(x, y); return !d || e === d || e.contains(d) || (d.tagName === 'LABEL' && d.contains(e)) || (e.labels && [...e.labels].includes(d)) ? null : (d.id ? '#' + d.id : d.tagName.toLowerCase() + '.' + d.className); }, [sel, x, y]);
    if (dessus) log('!! En voulant toucher', sel, ', le doigt tombe sur', dessus);
    await tap(x, y);
    return bb;
  };
  const touche = (type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts.map((q, i) => ({ x: q.x, y: q.y, id: i + 1, radiusX: 6, radiusY: 6, force: 1 })) });
  const glisser = async (x0, y0, x1, y1, etapes = 12, ms = 220) => { await touche('touchStart', [{ x: x0, y: y0 }]); for (let i = 1; i <= etapes; i++) { await touche('touchMove', [{ x: x0 + (x1 - x0) * i / etapes, y: y0 + (y1 - y0) * i / etapes }]); await pause(ms / etapes); } await touche('touchEnd', []); };
  const pincer = async (cx, cy, d0, d1, etapes = 10) => { const pts = d => [{ x: cx - d / 2, y: cy }, { x: cx + d / 2, y: cy }]; await touche('touchStart', pts(d0)); for (let i = 1; i <= etapes; i++) { await touche('touchMove', pts(d0 + (d1 - d0) * i / etapes)); await pause(20); } await touche('touchEnd', []); };
  const appuiLong = async (x, y, ms = 750) => { if (tel) { await touche('touchStart', [{ x, y }]); await pause(ms); await touche('touchEnd', []); } else { await p.mouse.click(x, y, { button: 'right' }); } };
  const ecranCase = c => p.evaluate(c => window.__orvane.ecranDeCase(c), c);
  const ecranPion = id => p.evaluate(id => window.__orvane.ecranDePion(id), id);
  const attendre = (t = 90000) => p.evaluate(t => window.__orvane.attendre(t), t);
  const scene = () => p.evaluate(() => window.__orvane.scene);
  const petitesCibles = () => p.evaluate(() => {
    const l = [];
    document.querySelectorAll('button, input, select, label.carte-choix, label.option-sort, [role=tab], a').forEach(e => {
      if (e.offsetParent === null && getComputedStyle(e).position !== 'fixed') return;
      if (e.closest('[hidden]')) return;
      const r = e.getBoundingClientRect(); if (!r.width || !r.height) return;
      if (r.bottom < 0 || r.top > innerHeight) return;
      if (e.matches('input[type=radio], input[type=checkbox]') && e.closest('label')) return;
      if (r.width < 44 || r.height < 44) l.push(((e.id && '#' + e.id) || e.getAttribute('aria-label') || e.textContent.trim().slice(0, 18) || e.tagName) + ' ' + Math.round(r.width) + '×' + Math.round(r.height));
    });
    return l;
  });
  const ecrireJournal = nom => fs.writeFileSync(ICI + '/' + nom + '-journal.txt', journal.join('\n') + '\n\nConsole :\n' + msgs.join('\n'));
  await p.goto('file://' + PAGE);
  await p.waitForFunction(() => window.__orvane && window.__orvane.scene === 'creation', null, { timeout: 40000 });
  return { b, ctx, p, cdp, log, cap, pause, tap, tapSel, sous, glisser, pincer, appuiLong, ecranCase, ecranPion, attendre, scene, petitesCibles, msgs, journal, ecrireJournal, w, h, tel };
}
module.exports = { ouvrir, RACINE, ICI };
