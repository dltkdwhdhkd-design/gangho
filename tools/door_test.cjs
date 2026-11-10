// 바깥 지도의 문마다 실제로 들어가지는지 본다: 발이 문 포탈 안에 놓일 수 있고, 그 자리가 지도 큰 덩어리와 이어져 있어야 한다
// 쿼터뷰로 보려면 isowrap으로 돌린다
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
    const out = [], S = 2; let doors = 0, bad = 0;
    for (const id in MAPS) {
      const m = MAPS[id]; if (m.room || m.live || id === 'world' || !m.portals?.some(q => q.door)) continue;
      try { G.field.busy = false; G.field.load(id, 2, 2, 0); } catch (e) { out.push(id + ' 불러오기 실패 ' + e.message); continue; }
      const M = G.field.m, Wd = Math.floor(M.w * 16 / S), Hd = Math.floor(M.h * 16 / S), lab = new Int32Array(Wd * Hd).fill(-1), ok = (x, y) => !M.blocked(x * S + S / 2, y * S + S / 2, 9, 5);
      let n = 0; const size = [];
      for (let i = 0; i < Wd * Hd; i++) { if (lab[i] >= 0 || !ok(i % Wd, Math.floor(i / Wd))) continue; const Q = [i]; lab[i] = n; let c = 0; while (Q.length) { const k = Q.pop(); c++; const x = k % Wd, y = Math.floor(k / Wd); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const X = x + dx, Y = y + dy; if (X < 0 || Y < 0 || X >= Wd || Y >= Hd) continue; const j = Y * Wd + X; if (lab[j] >= 0 || !ok(X, Y)) continue; lab[j] = n; Q.push(j); } } size.push(c); n++; }
      const main = size.indexOf(Math.max(...size));
      for (const q of M.portals) {
        if (!q.door) continue; doors++; let hit = false;
        for (let y = Math.ceil(q.y / S); y < (q.y + q.h) / S && !hit; y++) for (let x = Math.ceil(q.x / S); x < (q.x + q.w) / S && !hit; x++) { const px = x * S + S / 2, py = y * S + S / 2; if (px > q.x && px < q.x + q.w && py > q.y && py < q.y + q.h && lab[y * Wd + x] === main) hit = true; }
        if (!hit) { bad++; out.push(`${id}(${M.name}) 못 들어가는 문: ${q.to}@${Math.round(q.x / 16)},${Math.round(q.y / 16)}`); }
      }
    }
    out.unshift(`문 ${doors}곳 가운데 못 들어가는 문 ${bad}곳`); return out;
  });
  console.log(r.join('\n')); console.log(errs.slice(0, 5).join('\n') || '오류 없음'); await b.close();
})();
