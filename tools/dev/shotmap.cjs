const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(process.env.GAME_URL || 'http://localhost:8002/gangho/'); await p.waitForFunction(() => window.__G && __G.dbg, null, { timeout: 30000 }); await p.waitForTimeout(800);
  await p.evaluate(async ([MAP, X, Y]) => { const G = __G; G.noSave = true; G.S = G.dbg.newState('나그네', 'BlueSamurai', 'm', 'normal'); document.querySelector('#screen').innerHTML = ''; G.bgDraw = null; G.auto = true; G.free.start(); for (let i = 0; i < 400 && G.field.busy; i++) await new Promise(r => setTimeout(r, 30)); G.auto = false; G.field.load(MAP, X, Y, 0); }, [process.env.MAP, +process.env.X, +process.env.Y]);
  await p.waitForTimeout(1500); await p.evaluate(([X, Y]) => { const f = __G.field; f.p.x = X * 16; f.p.y = Y * 16; }, [+process.env.X, +process.env.Y]);
  await p.waitForTimeout(800); await p.screenshot({ path: '/tmp/claude-0/shots/' + process.env.MAP + '.png' }); console.log(errs.join('\n') || '오류 없음'); await b.close();
})();
