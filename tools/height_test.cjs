// 높낮이가 있는 지도를 모두 살핀다(자유 강호 기준).
//  ① 계단: 계단 칸은 남쪽 칸보다 꼭 한 단 높아야 하고(한 칸에 한 단씩 오른다), 북쪽 칸은 같은 단이거나 한 단 높은 계단이어야 한다
//  ② 닿기: 출구에서 걸어서 사람·일감·자리에 모두 닿는가(단 사이의 막힘과 계단을 넣은 뒤에도)
//  ③ 가림: 걸어서 닿는 칸 가운데, 바로 남쪽 칸이 두 단 넘게 높은 칸이 있는가(카메라가 남쪽에서 보므로 그 턱이 사람을 가린다)
// 쓰는 법: GAME_URL=http://localhost:8002/gangho/ node tools/height_test.cjs
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(process.env.GAME_URL); await p.waitForFunction(() => window.__G && __G.dbg, null, { timeout: 30000 }); await p.waitForTimeout(800);
  const r = await p.evaluate(async () => {
    const G = __G, D = G.dbg, sl = t => new Promise(r => setTimeout(r, t)); G.noSave = true; G.auto = true; G.noSpawn = true; G.S = D.newState('진소', 'BlueSamurai', 'm', 'normal'); document.querySelector('#screen').innerHTML = ''; G.bgDraw = null;
    G.free.start(); for (let i = 0; i < 400 && G.field.busy; i++) await sl(20); G.free.tick = () => {};
    const { MAPS } = await import('/gangho/js/maps.js'), W = await import('/gangho/js/worlddata.js');
    for (const l of W.LOCS || []) { try { G.world.ensure(l.map); } catch (e) { } }
    const bad = [], seen = [], S = 8;
    for (const id in MAPS) {
      const m0 = MAPS[id]; if (!m0.hgt) continue;
      try { G.field.busy = false; G.field.load(id, 2, 2, 0); } catch (e) { bad.push(id + ' 불러오기 실패 ' + e.message); continue; }
      const M = G.field.m, H = M.hgt, st = M.stair || {}, lv = (x, y) => H[y]?.[x];
      // ① 계단
      for (const k in st) { const [x, y] = k.split(',').map(Number), a = lv(x, y), s = lv(x, y + 1), n = lv(x, y - 1), ns = !!st[x + ',' + (y - 1)];
        if (s === undefined || a - s !== 1) bad.push(`${id} 계단 (${x},${y}): 남쪽 칸과 ${a - s}단 차이(한 단이어야 한다)`);
        if (n !== undefined && !(ns ? n - a === 1 : n === a)) bad.push(`${id} 계단 (${x},${y}): 북쪽 칸(${n}단${ns ? ', 계단' : ''})과 이어지지 않는다(이 칸 ${a}단)`); }
      // ② 닿기: 걸을 수 있는 칸을 덩어리로 나눈다(8점 격자, reach_test와 같은 방법)
      const Wd = Math.floor(M.w * 16 / S), Hd = Math.floor(M.h * 16 / S), lab = new Int32Array(Wd * Hd).fill(-1), ok = (x, y) => !M.blocked(x * S + S / 2, y * S + S / 2 + 2, 9, 5);
      let n = 0; const size = [];
      for (let i = 0; i < Wd * Hd; i++) { if (lab[i] >= 0 || !ok(i % Wd, Math.floor(i / Wd))) continue; const Q = [i]; lab[i] = n; let c = 0; while (Q.length) { const k = Q.pop(); c++; const x = k % Wd, y = Math.floor(k / Wd); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const X = x + dx, Y = y + dy; if (X < 0 || Y < 0 || X >= Wd || Y >= Hd) continue; const j = Y * Wd + X; if (lab[j] >= 0 || !ok(X, Y)) continue; lab[j] = n; Q.push(j); } } size.push(c); n++; }
      const near = (px, py, r) => { const s = new Set(); for (let y = Math.floor((py - r) / S); y <= Math.floor((py + r) / S); y++) for (let x = Math.floor((px - r) / S); x <= Math.floor((px + r) / S); x++) { if (x < 0 || y < 0 || x >= Wd || y >= Hd) continue; const l = lab[y * Wd + x]; if (l >= 0) s.add(l); } return s; };
      // 출구, 사람, 자리가 모두 한 덩어리 안에 있어야 한다. 가장 많은 것이 닿는 덩어리를 본 덩어리로 삼고, 거기에 못 닿는 것을 적는다. 자리(spots)는 칸 단위로 적혀 있다(사람과 출구는 점 단위)
      const anc = [];
      for (const q of M.portals || []) anc.push([`출구 ${q.to} (${Math.round(q.x / 16)},${Math.round(q.y / 16)})`, near(q.x + q.w / 2, q.y + q.h / 2, Math.max(q.w, q.h) / 2 + 12)]);
      for (const q of G.field.npcs) anc.push([`${q.id || q.hint || '사람'} (${(q.x / 16).toFixed(1)},${(q.y / 16).toFixed(1)})`, near(q.x, q.y, 20)]);
      for (const q of G.field.spots) anc.push([`자리 "${q.hint || ''}" (${q.x},${q.y})`, near((q.x + q.w / 2) * 16, (q.y + q.h / 2) * 16, Math.max(q.w, q.h) * 8 + 12)]);
      const cnt = {}; for (const [, c] of anc) for (const l of c) cnt[l] = (cnt[l] || 0) + 1;
      const main = anc.length ? +Object.keys(cnt).sort((a, b) => cnt[b] - cnt[a] || size[b] - size[a])[0] : size.indexOf(Math.max(...size)), hit = c => c.has(main), ppl = anc.length - (M.portals || []).length;
      for (const [nm, c] of anc) if (!hit(c)) bad.push(`${id} ${nm}: 다른 출구·사람과 걸어서 이어지지 않는다`);
      // ③ 가림: 닿는 칸의 바로 남쪽이 두 단 넘게 높은가
      let hid = 0; const ex = [];
      for (let y = 0; y < M.h - 1; y++) for (let x = 0; x < M.w; x++) { if (st[x + ',' + y] || st[x + ',' + (y + 1)] || lv(x, y + 1) - lv(x, y) < 2) continue; if (hit(near(x * 16 + 8, y * 16 + 8, 6))) { hid++; if (ex.length < 3) ex.push(`(${x},${y})`); } }
      if (hid) bad.push(`${id} 남쪽이 두 단 넘게 높아 사람이 가려지는 칸 ${hid}곳: ${ex.join(' ')}`);
      const lvs = [...new Set(H.flat())].sort((a, b) => a - b);
      seen.push(`${id}(${M.name}): 단 ${lvs.join(' ')} · 계단 칸 ${Object.keys(st).length} · 면 ${M.face === 'rock' ? '바위 절벽' : '축대'} · 사람·자리 ${ppl}`);
    }
    return { bad, seen };
  });
  console.log(r.seen.join('\n')); console.log(r.bad.join('\n') || '어긋난 데 없음'); console.log(errs.slice(0, 5).join('\n') || '오류 없음');
  if (r.bad.length || errs.length || !r.seen.length) { console.log(`실패: 어긋난 데 ${r.bad.length}곳, 오류 ${errs.length}`); process.exitCode = 1; } else console.log(`통과 (높낮이 지도 ${r.seen.length}곳)`);
  await b.close();
})();
