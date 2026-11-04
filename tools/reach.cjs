// 모든 지도의 포탈, 사람, 조사 지점에 실제로 걸어서 닿을 수 있는지 확인한다
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto((process.env.GAME_URL || 'http://127.0.0.1:8123/index.html')); await p.waitForTimeout(1200);
  const out = await p.evaluate(() => {
    const G = __G, D = G.dbg; G.S = D.newState('a', 'Boy', 'm', 'normal');
    const res = [];
    const allFlags = ['c1a', 'c1c', 'c1e', 'c2b', 'c2c', 'c2d', 'c2f', 'c2g', 'c3a', 'c3b', 'c3e', 'c4a', 'c4b', 'c4c'];
    for (const [id, m] of Object.entries(D.MAPS)) {
      for (const q of m.portals) {
        const t = D.MAPS[q.to]; if (!t) { res.push(`${id}: 없는 지도 ${q.to}`); continue; }
        if (t.blocked(q.tx * 16, q.ty * 16)) res.push(`${id} → ${q.to}: 도착점(${q.tx},${q.ty})이 막힘`);
        for (const r of t.portals) if (q.tx * 16 > r.x && q.tx * 16 < r.x + r.w && q.ty * 16 > r.y && q.ty * 16 < r.y + r.h) res.push(`${id} → ${q.to}: 도착점이 다른 포탈 위`);
      }
      // 시작점: 들어오는 포탈의 도착점들
      const starts = []; for (const [k, o] of Object.entries(D.MAPS)) for (const q of o.portals) if (q.to === id) starts.push([q.tx * 16, q.ty * 16]);
      if (!starts.length) { const q = m.portals[0]; if (q) starts.push([q.x + q.w / 2, q.y - 6]); }
      const S = 4, W = m.w * 16 / S | 0, H = m.h * 16 / S | 0, seen = new Uint8Array(W * H), st = [];
      for (const [x, y] of starts) { const a = x / S | 0, c = y / S | 0; if (a >= 0 && c >= 0 && a < W && c < H && !seen[c * W + a]) { seen[c * W + a] = 1; st.push([a, c]); } }
      while (st.length) { const [x, y] = st.pop(); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const a = x + dx, c = y + dy; if (a < 0 || c < 0 || a >= W || c >= H || seen[c * W + a]) continue; if (m.blocked(a * S, c * S)) continue; seen[c * W + a] = 1; st.push([a, c]); } }
      const reach = (x, y, r = 22) => { for (let c = Math.max(0, (y - r) / S | 0); c <= Math.min(H - 1, (y + r) / S | 0); c++) for (let a = Math.max(0, (x - r) / S | 0); a <= Math.min(W - 1, (x + r) / S | 0); a++) if (seen[c * W + a]) return true; return false; };
      for (const q of m.portals) if (!reach(q.x + q.w / 2, q.y + q.h / 2, 14)) res.push(`${id}: 포탈 ${q.to}에 닿을 수 없음`);
      const items = new Map();
      for (const st of ['p1', ...allFlags]) { G.S.flags = { step: st, burned: st !== 'p1' }; const c = D.Story.content(id); for (const n of c.npcs) items.set('사람 ' + n.id, [n.x * 16, n.y * 16]); for (const s of c.spots) items.set('지점 ' + s.hint, [(s.x + s.w / 2) * 16, (s.y + s.h / 2) * 16]); for (const t of c.trigs) items.set('사건', [(t.x + t.w / 2) * 16, (t.y + t.h / 2) * 16]); for (const r of c.roam) items.set('몹 ' + r.spr, [r.x * 16, r.y * 16]); }
      for (const [k, [x, y]] of items) { if (!reach(x, y)) res.push(`${id}: ${k}(${(x / 16).toFixed(1)},${(y / 16).toFixed(1)}) 닿을 수 없음`); }
    }
    return res;
  });
  console.log(out.join('\n') || '문제 없음'); console.log(errs.join('\n')); await b.close();
})().catch(e => { console.log(String(e).slice(0, 700)); process.exit(1); });
