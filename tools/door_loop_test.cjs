// 청하진의 문마다: 들어갔다가 나와서 1초 서 있을 때 다시 들어가지 않는지
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(process.env.GAME_URL); await p.waitForFunction(() => window.__G && __G.dbg, null, { timeout: 30000 }); await p.waitForTimeout(800);
  const r = await p.evaluate(async () => { const G = __G; G.noSave = true; G.S = G.dbg.newState('나그네', 'BlueSamurai', 'm', 'normal'); document.querySelector('#screen').innerHTML = ''; G.bgDraw = null; G.auto = true; G.free.start(); for (let i = 0; i < 400 && G.field.busy; i++) await new Promise(r => setTimeout(r, 30)); G.auto = false;
    const f = G.field, out = []; f.load('cheongha', 22, 16, 0); await new Promise(r => setTimeout(r, 300));
    const doors = f.m.portals.filter(q => q.door && !q.when && !q.lock).map(q => ({ ...q }));
    for (const q of doors) { f.busy = false; f.load('cheongha', 22, 16, 0); await new Promise(r => setTimeout(r, 100)); f.p.x = q.x + q.w / 2; f.p.y = q.y + q.h / 2; for (let i = 0; i < 80 && f.m.id === 'cheongha'; i++) await new Promise(r => setTimeout(r, 30));
      const room = f.m.id; if (room === 'cheongha') { out.push(q.to + ': 안 들어가짐'); continue; } for (let i = 0; i < 80 && f.busy; i++) await new Promise(r => setTimeout(r, 30));
      const ex = f.m.portals.find(e => e.to === 'cheongha'); if (!ex) { out.push(q.to + ': 나가는 곳 없음'); continue; } f.p.x = ex.x + ex.w / 2; f.p.y = ex.y + ex.h / 2; for (let i = 0; i < 80 && f.m.id !== 'cheongha'; i++) await new Promise(r => setTimeout(r, 30));
      for (let i = 0; i < 80 && f.busy; i++) await new Promise(r => setTimeout(r, 30)); await new Promise(r => setTimeout(r, 1200)); out.push(`${q.to}: 나온 뒤 ${f.m.id === 'cheongha' ? '밖에 있음' : '다시 들어감(' + f.m.id + ')'}`); }
    return out; });
  console.log(r.join('\n')); console.log(errs.slice(0, 3).join('\n') || '오류 없음'); await b.close(); })();
