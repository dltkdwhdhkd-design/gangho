// 고을 가게: 찻집, 주루, 비단 가게, 사당이 서는지, 안에 사람이 있는지, 말을 걸면 끝까지 가는지, 쿼터뷰에서 새 그림이 쓰이는지
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
  const errs = []; p.on('pageerror', e => errs.push('PAGE ' + e.message + ' ' + (e.stack || '').slice(0, 300))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 300)); });
  await p.goto(process.env.GAME_URL); await p.waitForFunction(() => window.__G && __G.dbg, null, { timeout: 30000 }); await p.waitForTimeout(800);
  const r = await p.evaluate(async () => {
    const G = __G, sleep = () => new Promise(r => setTimeout(r, 0)), out = [];
    G.manual = true; G.auto = true; G.speedup = 2000; G.S = G.dbg.newState('진소', 'BlueSamurai', 'm', 'normal'); document.querySelector('#screen').innerHTML = ''; G.bgDraw = null; const S = G.S;
    G.free.start(); let n = 0; while (G.field.busy && n++ < 2000) { G.fast(60); await sleep(); } G.free.tick = () => { }; S.silver = 1000;
    const run = async (name, fn, pick) => { G.autoPick = pick === undefined ? null : (() => pick); let fin = false, err = null; G.field.busy = false; G.field.run(async () => { try { await fn(); } catch (e) { err = e; } fin = true; }); let i = 0; while (!fin && i++ < 4000) { G.fast(60); await sleep(); } if (err || !fin) out.push(`${name}: ${err ? 'ERR ' + err.message + ' ' + (err.stack || '').slice(0, 200) : '안 끝남'}`); return !err && fin; };
    G.world.ensure('c_nakyang'); G.field.load('c_nakyang', 30, 22, 1); for (let i = 0; i < 3; i++) G.fast(1);
    const m = G.field.m, doors = m.portals.filter(q => /^r_nakyang_home\d+$/.test(q.to)).map(q => q.to);
    out.push('민가 문 ' + doors.length + ' 그림 ' + m.stamps.filter(s => s.iso).map(s => s.name).filter(n => /teahouse|restaurant|silk|temple_town/.test(n)).join(','));
    for (const [nm, n, picks] of [['주루', 1, [1, 3]], ['찻집', 2, [0, 1]], ['비단 가게', 3, [null]], ['사당', 7, [0, 0, 1]]]) {
      const id = `r_nakyang_home${n}`; G.field.load(id, 7, 8, 0); for (let i = 0; i < 3; i++) G.fast(1);
      const ns = G.field.npcs.map(q => q.hint); const before = S.silver; let ok = true;
      for (const pk of picks) ok = await run(nm, () => G.field.npcs.find(q => q.id === 'res').talk(), pk === null ? undefined : pk) && ok;
      const g0 = G.field.npcs.find(q => q.id === 'gu0'); if (g0) ok = await run(nm + ' 손님', () => g0.talk()) && ok;
      out.push(`${nm} (${G.field.m.name}) 사람 ${ns.join(',')} 은자 ${before}→${S.silver} 음식 ${JSON.stringify(S.meal || null)} ${ok ? 'ok' : ''}`);
    }
    return out;
  });
  console.log(r.join('\n')); console.log(errs.slice(0, 8).join('\n') || '오류 없음'); await b.close();
})();
