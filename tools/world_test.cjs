// 강호 전도와 본거지 점검: 자료, 걸어서 닿는지, 지도마다 오류가 없는지
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
  const errs = []; p.on('pageerror', e => errs.push('PAGE ' + e.message + ' ' + (e.stack || '').slice(0, 400))); p.on('console', m => { if (['error', 'warning'].includes(m.type())) errs.push(m.text().slice(0, 200)); }); p.on('response', r => { if (r.status() >= 400) errs.push(r.status() + ' ' + r.url()); });
  await p.goto(process.env.GAME_URL); await p.waitForFunction('window.__G && __G.dbg', { timeout: 30000 }).catch(() => console.log(errs.join('\n'))); await p.waitForTimeout(800);
  const r = await p.evaluate(async () => {
    const G = __G, D = G.dbg, out = [], sleep = () => new Promise(r => setTimeout(r, 0));
    G.manual = true; G.auto = true; G.speedup = 2000;
    G.S = D.newState('진소', 'BlueSamurai', 'm', 'normal'); document.querySelector('#screen').innerHTML = ''; G.bgDraw = null; G.free.start(); const S = G.S;
    let n = 0; while (G.field.busy && n++ < 2000) { G.fast(60); await sleep(); }
    const t0 = performance.now(); G.world.build(); out.push('전도 만들기 ' + Math.round(performance.now() - t0) + 'ms');
    const J = n => import('/gangho/js/' + n + '.js'), [mp, wd, fr, da, fo, it, fd, dl, co] = await Promise.all(['maps', 'worlddata', 'free', 'data', 'foes', 'items', 'freedata', 'dialog', 'core'].map(J));
    const { MAPS } = mp, { LOCS, ROADS } = wd, { FACS } = fr, { SKILLS, HEARTS, WEAPONS } = da, { MOVES } = fo, { DB, ACCS, LOOT } = it, { TRIALS } = fd, { WHO } = dl, { IMG } = co;
    const w = MAPS.world; out.push(`크기 ${w.w}×${w.h} 소품 ${w.stamps.length} 충돌 ${w.solids.length} 위치 ${LOCS.length} 길 ${ROADS.length} 세력 ${FACS.length}`);
    // 자료 검사
    for (const f of FACS) { for (const k of f.moves) if (!MOVES[k]) out.push(`기술 없음 ${f.id} ${k}`); for (const k of f.gift) if (!SKILLS[k]) out.push(`전수 없음 ${f.id} ${k}`); if (f.heart && !HEARTS[f.heart]) out.push(`심법 없음 ${f.id} ${f.heart}`); if (!TRIALS[f.id]) out.push('시험 없음 ' + f.id); if (!WHO[f.key]) out.push('WHO 없음 ' + f.key); if (!IMG['chars/' + f.spr]) out.push('그림 없음 ' + f.spr); if (LOOT[f.id]) for (const i of LOOT[f.id]) if (!WEAPONS[i] && !ACCS[i] && !DB[i]) out.push('물건 없음 ' + i); }
    // 걸어서 닿는가
    const q = new Int32Array(w.w * w.h), seen = new Uint8Array(w.w * w.h), K = G.world.K, start = G.world.entry('cheongha'); let h = 0, t = 0; const id = (x, y) => y * w.w + x, s0 = id(Math.floor(start[0]), Math.floor(start[1])); q[t++] = s0; seen[s0] = 1;
    while (h < t) { const c = q[h++], x = c % w.w, y = Math.floor(c / w.w); for (const [a, b] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + a, ny = y + b; if (nx < 0 || ny < 0 || nx >= w.w || ny >= w.h) continue; const k = id(nx, ny); if (seen[k]) continue; if (w.blocked((nx + .5) * 16, (ny + .7) * 16)) continue; seen[k] = 1; q[t++] = k; } }
    out.push('걸어서 닿는 칸 ' + t);
    const lost = LOCS.filter(l => { const [x, y] = G.world.entry(l.map); return !seen[id(Math.floor(x), Math.floor(y))]; }).map(l => l.name); out.push('못 닿는 곳: ' + (lost.join(' ') || '없음'));
    // 지도마다
    for (const l of LOCS) { G.field.load(l.map, l.at[0], l.at[1], 1); G.fast(3); const m = MAPS[l.map], c = D.Story.content(l.map), reps = c.npcs.filter(n => FACS.some(f => f.key === n.id)).map(n => n.id).join(','); const arrive = m.blocked(l.at[0] * 16, l.at[1] * 16);
      const fac = FACS.find(f => f.id === l.fac), walk = (tx, ty) => { const sn = new Set([Math.floor(l.at[0]) + ',' + Math.floor(l.at[1])]), Q = [[Math.floor(l.at[0]), Math.floor(l.at[1])]]; while (Q.length) { const [x, y] = Q.shift(); if (Math.hypot(x - tx, y - ty) < 2.4) return true; for (const [a, b] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const k = (x + a) + ',' + (y + b); if (sn.has(k) || m.blocked((x + a + .5) * 16, (y + b + .7) * 16)) continue; sn.add(k); Q.push([x + a, y + b]); } } return false; };
      const bad = []; if (arrive) bad.push('도착칸 막힘'); if (fac && fac.at[0] === l.map && !walk(fac.at[1], fac.at[2])) bad.push('대표에게 못 감');
      for (const n of c.npcs) if (n.spr && !n.stamp && !walk(n.x, n.y)) bad.push('못 감 ' + n.id);
      for (const q of m.portals.filter(q => q.door && /^[rh]_/.test(q.to))) { const dx = (q.x + q.w / 2) / 16, dy = (q.y + q.h) / 16; if (!walk(dx, dy)) bad.push('문 못 감 ' + q.to); G.field.load(q.to, q.tx, q.ty, 1); G.fast(2); const rm = MAPS[q.to], rc = D.Story.content(q.to); if (rm.blocked(q.tx * 16, q.ty * 16)) bad.push('방 도착 막힘 ' + q.to); const start = [Math.floor(q.tx), Math.floor(q.ty)], sn = new Set([start.join()]), Q2 = [start]; while (Q2.length) { const [x, y] = Q2.shift(); for (const [a, b] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const k = (x + a) + ',' + (y + b); if (sn.has(k) || rm.blocked((x + a + .5) * 16, (y + b + .7) * 16)) continue; sn.add(k); Q2.push([x + a, y + b]); } } for (const n of rc.npcs) if (n.spr && ![...sn].some(k => { const [a, b] = k.split(',').map(Number); return Math.hypot(a - n.x, b - n.y) < 2.4; })) bad.push(`방 사람 못 감 ${q.to} ${n.id}`); const back = rm.portals.find(z => z.to === l.map); if (!back) bad.push('방 나가는 문 없음 ' + q.to); else if (m.blocked(back.tx * 16, back.ty * 16)) bad.push('문앞 막힘 ' + q.to); } if (m.portals.some(q => /^[rh]_/.test(q.to))) G.field.load(l.map, l.at[0], l.at[1], 1);
      if (bad.length) out.push(`${l.name}: ${[...new Set(bad)].join(' / ')}`); }
    return out;
  });
  console.log(r.join('\n')); console.log('오류', errs.length, [...new Set(errs)].slice(0, 12).join('\n'));
  await b.close();
})();
