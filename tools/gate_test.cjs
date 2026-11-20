// 대문이 담의 트인 곳 가운데에 서 있는지 본다. 지도마다 gate·gate_arch 그림을 찾아, 같은 줄에 놓인 담(wall·fence·wood_h) 사이의 틈과 그 밑을 지나는 길의 가운데를 견준다.
// 2.5점 넘게 어긋나면 실패. 2026-11-20에 창운산·구화성·내 문파·소림사의 대문이 트인 곳보다 한 칸 왼쪽에 서 있는 것을 주인이 보고 알려 주셔서 만들었다(전에는 아무도 재지 않았다)
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 720 } }); const errs = []; p.on('pageerror', e => errs.push(e.message.slice(0, 200)));
  await p.goto(process.env.GAME_URL); await p.waitForFunction(() => window.__G && __G.dbg, null, { timeout: 90000 }); await p.waitForTimeout(1200);
  const r = await p.evaluate(async () => { const G = __G, sl = t => new Promise(r => setTimeout(r, t)); G.noSave = true; G.S = G.dbg.newState('진소', 'BlueSamurai', 'm', 'normal'); document.querySelector('#screen').innerHTML = ''; G.bgDraw = null; G.auto = true; G.noSpawn = true; G.free.start(); for (let i = 0; i < 400 && G.field.busy; i++) await sl(30); G.free.tick = () => {};
    const W = await import('/gangho/js/worlddata.js'), TL = await import('/gangho/js/tiles.js'), ST = TL.STAMPS; for (const l of W.LOCS || []) { try { G.world.ensure(l.map); } catch (e) { } }
    const M = G.dbg.MAPS, out = [], ids = Object.keys(M); let gates = 0, bad = 0;
    for (const id of ids) { let m; try { m = M[id]; } catch (e) { continue; } if (!m || !m.stamps || m.room || id === 'world') continue;
      const walls = m.stamps.filter(s => /^(wall|fence|wood_h|wall_)/.test(s.name) && ST[s.name]).map(s => ({ x0: s.x, x1: s.x + ST[s.name][3] * (s.sc || 1), y0: s.y, y1: s.y + ST[s.name][4] * (s.sc || 1) }));
      for (const s of m.stamps) { if (!/^gate/.test(s.name)) continue; gates++; const st = ST[s.name], gx0 = s.x, gx1 = s.x + st[3], gc = (gx0 + gx1) / 2, by = s.y + st[4];
        // 대문 밑동 줄(위아래 12점 안)에 걸친 담
        const row = walls.filter(w => w.y1 > by - 14 && w.y0 < by + 6); let L = -1e9, R = 1e9; for (const w of row) { if (w.x1 <= gc + 1 && w.x1 > L) L = w.x1; if (w.x0 >= gc - 1 && w.x0 < R) R = w.x0; }
        // 대문 가운데가 담 안에 묻혔으면(틈이 대문 옆에 있으면) 가장 가까운 틈을 찾는다
        const inWall = row.some(w => w.x0 < gc && w.x1 > gc); let note = '';
        if (inWall) { const xs = row.map(w => [w.x0, w.x1]).sort((a, c) => a[0] - c[0]); let best = null; for (let i = 0; i + 1 < xs.length; i++) { const a = xs[i][1], c = xs[i + 1][0]; if (c - a > 8) { const mid = (a + c) / 2; if (!best || Math.abs(mid - gc) < Math.abs(best[2] - gc)) best = [a, c, mid]; } } if (best) { L = best[0]; R = best[1]; } note = ' (대문 가운데가 담에 묻힘)'; }
        // 대문 바로 아래(남쪽 한 칸)를 지나는 길 칸의 가운데
        const ty = Math.min(m.h - 1, Math.floor(by / 16) + 1), road = []; for (let x = Math.max(0, Math.floor(gx0 / 16) - 4); x < Math.min(m.w, Math.ceil(gx1 / 16) + 4); x++) if (m.g[ty]?.[x] === 2 || m.g[ty]?.[x] === 1) road.push(x);
        const rc = road.length ? (road[0] + road[road.length - 1] + 1) * 8 : null, gap = L > -1e8 && R < 1e8 ? [L, R] : null, gm = gap ? (gap[0] + gap[1]) / 2 : null;
        const off = gm != null ? gc - gm : rc != null ? gc - rc : null, ok = off == null || Math.abs(off) <= 2.5; if (!ok) bad++;
        out.push(`${ok ? '○' : '✗'} ${id}(${m.name}) ${s.name} 가로 ${(gx0 / 16).toFixed(2)}~${(gx1 / 16).toFixed(2)} | 담의 틈 ${gap ? (gap[0] / 16).toFixed(2) + '~' + (gap[1] / 16).toFixed(2) : '없음'} | 길 ${road.length ? road[0] + '~' + (road[road.length - 1] + 1) : '없음'} | 어긋남 ${off == null ? '?' : (off / 16).toFixed(2) + '칸'}${note}`); } }
    return { out, gates, bad, n: ids.length }; });
  const seen = new Map(); for (const l of r.out) { const k = l.replace(/[a-z_0-9]+\([^)]*\)/, '*'); if (!seen.has(k)) seen.set(k, [l, 0]); seen.get(k)[1]++; }
  for (const [l, n] of seen.values()) console.log(l + (n > 1 ? `  (같은 꼴 ${n}곳)` : '')); console.log(`지도 ${r.n}곳, 대문 ${r.gates}개, 어긋난 것 ${r.bad}개`); console.log(errs.length ? '오류 ' + errs.slice(0, 3).join(' | ') : '오류 없음'); console.log(r.bad || errs.length ? '실패' : '통과'); await b.close(); process.exit(r.bad || errs.length ? 1 : 0); })().catch(e => { console.log(String(e).slice(0, 800)); process.exit(1); });
