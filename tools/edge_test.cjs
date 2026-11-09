// 맵 끝에 닿은 길인데 나가는 곳이 없는 자리 찾기
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(process.env.GAME_URL); await p.waitForTimeout(1500);
  const r = await p.evaluate(async (mode) => {
    const G = __G; G.manual = true; G.auto = true; G.S = G.dbg.newState('진소', 'BlueSamurai', 'm', 'normal'); document.querySelector('#screen').innerHTML = ''; G.bgDraw = null;
    if (mode === 'free') G.free.start(); else { G.scene = 'field'; G.S.flags.step = 'c2a'; G.S.flags.world_open = true; G.jh.ensure(); G.field.load('cheongha', 22, 25, 1); }
    for (let i = 0; i < 400 && G.field.busy; i++) { G.fast(30); await new Promise(r => setTimeout(r, 0)); } if (G.free) G.free.tick = () => { };
    const { MAPS } = await import('/gangho/js/maps.js'), W = await import('/gangho/js/worlddata.js'); for (const l of W.LOCS) try { G.world.ensure(l.map); } catch (e) { }
    const out = [];
    for (const id of Object.keys(MAPS)) {
      const m = MAPS[id]; if (!m || id === 'world' || m.room || !m.g) continue; G.world.linkEdges(m);
      const bad = []; const inP = (x, y) => m.portals.some(q => x * 16 + 8 >= q.x - 8 && x * 16 + 8 <= q.x + q.w + 8 && y * 16 + 8 >= q.y - 8 && y * 16 + 8 <= q.y + q.h + 8);
      const walk = v => v === 1 || v === 3 || (m.walkOn || []).includes(v);
      for (let x = 0; x < m.w; x++) for (const y of [0, m.h - 1]) if (walk(m.g[y][x]) && !inP(x, y)) bad.push(`${x},${y}`);
      for (let y = 0; y < m.h; y++) for (const x of [0, m.w - 1]) if (walk(m.g[y][x]) && !inP(x, y)) bad.push(`${x},${y}`);
      const ex = m.portals.filter(q => q.x <= 0 || q.y <= 0 || q.x + q.w >= m.w * 16 || q.y + q.h >= m.h * 16).map(q => `${q.to}`);
      if (bad.length) out.push(`${id} ${m.name || ''}: 막힌 끝 ${bad.length}칸 (${bad.slice(0, 4).join(' ')}) / 가장자리 출구 ${ex.join(',') || '없음'}`);
    }
    return out;
  }, process.env.MODE || 'free');
  console.log(r.join('\n') || '막힌 길 없음'); console.log(errs.join('\n')); await b.close();
})();
