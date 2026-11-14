const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1250, height: 760 } }); const e = []; p.on('pageerror', x => e.push(x.message)); p.on('console', m => { if (m.type() === 'error') e.push(m.text()); });
  await p.goto('file://' + __dirname + '/voir-dessins.html'); await p.waitForTimeout(400); await p.screenshot({ path: __dirname + '/dessins.png', fullPage: true }); console.log('erreurs : ' + (e.join(' | ') || 'aucune')); await b.close(); })();
