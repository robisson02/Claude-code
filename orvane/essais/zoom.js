const { chromium } = require('playwright');
(async () => { const [vb, noms, sortie] = process.argv.slice(2); const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1250, height: 700 } });
  await p.addInitScript(([vb]) => { window.ZOOM = vb; }, [vb]);
  await p.goto('file://' + __dirname + '/voir-dessins.html'); await p.waitForTimeout(300);
  await p.evaluate(n => { const l = n.split(','); document.querySelectorAll('.c').forEach(c => { if (!l.includes(c.querySelector('span').textContent)) c.remove(); }); }, noms);
  await p.screenshot({ path: __dirname + '/' + sortie, fullPage: true }); await b.close(); })();
