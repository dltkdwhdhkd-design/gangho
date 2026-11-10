// 모든 바깥 지도에서 출구와 문이 서로 걸어서 이어지는지 본다. 막힌 출구를 찾는다
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(process.env.GAME_URL); await p.waitForFunction(() => window.__G && __G.dbg, null, { timeout: 30000 }); await p.waitForTimeout(800);
  const r = await p.evaluate(async () => {
    const G = __G; G.manual = true; G.auto = true; G.S = G.dbg.newState('진소', 'BlueSamurai', 'm', 'normal'); document.querySelector('#screen').innerHTML = ''; G.bgDraw = null;
    Object.assign(G.S.flags, { world_open: true });
    const { MAPS } = await import('/gangho/js/maps.js'), W = await import('/gangho/js/worlddata.js');
    for (const l of W.LOCS || []) { try { G.world.ensure(l.map); } catch (e) { } }
    const out = [], S = 8;
    for (const id in MAPS) {
      const m = MAPS[id]; if (m.room || m.live || id === 'world' || !m.portals?.length) continue;
      try { G.field.busy = false; G.field.load(id, 2, 2, 0); } catch (e) { out.push(id + ' 불러오기 실패 ' + e.message); continue; }
      const M = G.field.m, Wd = Math.floor(M.w * 16 / S), Hd = Math.floor(M.h * 16 / S), lab = new Int32Array(Wd * Hd).fill(-1), ok = (x, y) => !M.blocked(x * S + S / 2, y * S + S / 2 + 2, 9, 5);
      let n = 0; const size = [];
      for (let i = 0; i < Wd * Hd; i++) { if (lab[i] >= 0 || !ok(i % Wd, Math.floor(i / Wd))) continue; const Q = [i]; lab[i] = n; let c = 0; while (Q.length) { const k = Q.pop(); c++; const x = k % Wd, y = Math.floor(k / Wd); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const X = x + dx, Y = y + dy; if (X < 0 || Y < 0 || X >= Wd || Y >= Hd) continue; const j = Y * Wd + X; if (lab[j] >= 0 || !ok(X, Y)) continue; lab[j] = n; Q.push(j); } } size.push(c); n++; }
      // 출구마다 닿는 칸의 덩어리
      const comp = q => { const s = new Set(); for (let y = Math.floor((q.y - 12) / S); y <= Math.floor((q.y + q.h + 12) / S); y++) for (let x = Math.floor((q.x - 12) / S); x <= Math.floor((q.x + q.w + 12) / S); x++) { if (x < 0 || y < 0 || x >= Wd || y >= Hd) continue; const l = lab[y * Wd + x]; if (l >= 0) s.add(l); } return s; };
      const cs = M.portals.map(q => [q, comp(q)]); const main = size.indexOf(Math.max(...size));
      const bad = cs.filter(([q, s]) => !s.has(main)).map(([q]) => `${q.to}@${Math.round(q.x / 16)},${Math.round(q.y / 16)}`);
      if (bad.length) out.push(`${id}(${M.name}) 막힌 출구: ${bad.join(' ')}`);
    }
    return out;
  });
  console.log(r.join('\n') || '막힌 출구 없음'); console.log(errs.slice(0, 5).join('\n') || '오류 없음'); await b.close();
})();
