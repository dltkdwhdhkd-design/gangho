// 사람이 걸어서 닿을 수 있는지 전 지도를 훑는다. 봇은 순간이동이라 이걸 못 잡는다.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(process.env.GAME_URL); await p.waitForTimeout(1500);
  const r = await p.evaluate(async () => {
    const G = __G, D = G.dbg, M = D.MAPS, TS = 16;
    const { Story } = await import('./js/ctx.js');
    const files = ['story1', 'story2', 'part1', 'part1a', 'part1b', 'routes', 'part4', 'part7', 'part8', 'part9', 'clans', 'life', 'bonds'];
    const warps = {}; let ORDER = [];
    for (const f of files) { const t = await (await fetch(`js/${f}.js`)).text(); for (const m of t.matchAll(/(?:warp|load)\('(\w+)',\s*([\d.]+),\s*([\d.]+)/g)) (warps[m[1]] = warps[m[1]] || []).push([+m[2], +m[3]]); }
    const o = /ORDER\s*=\s*(\[[^\]]+\])/.exec(await (await fetch('js/story1.js')).text()); if (o) ORDER = eval(o[1]);
    const inc = {}; for (const id in M) for (const q of M[id].portals) if (M[q.to]) (inc[q.to] = inc[q.to] || []).push([q.tx, q.ty]);
    const flood = (id) => { const m = M[id], seen = new Set(), q = []; for (const [x, y] of [...(inc[id] || []), ...(warps[id] || [])]) { const a = [Math.floor(x), Math.floor(y)]; for (const [dx, dy] of [[0, 0], [0, -1], [0, 1], [1, 0], [-1, 0]]) { const c = [a[0] + dx, a[1] + dy], k = c.join(); if (seen.has(k) || c[0] < 0 || c[1] < 0 || c[0] >= m.w || c[1] >= m.h) continue; if (m.blocked((c[0] + .5) * TS, (c[1] + .7) * TS)) continue; seen.add(k); q.push(c); } } while (q.length) { const [x, y] = q.shift(); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy, k = nx + ',' + ny; if (seen.has(k) || nx < 0 || ny < 0 || nx >= m.w || ny >= m.h) continue; if (m.blocked((nx + .5) * TS, (ny + .7) * TS)) continue; seen.add(k); q.push([nx, ny]); } } return seen; };
    G.S = D.newState('진소', 'BlueSamurai', 'm', 'normal');
    const reg = {}, out = new Set(), noin = [];
    for (const id in M) { reg[id] = flood(id); if (!reg[id].size) { noin.push(id); } }
    const near = (s, cx, cy, rx, ry) => { for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) if (s.has(x + ',' + y)) return true; return false; };
    const steps = ORDER.length ? ORDER : ['p0'];
    const FL = [{}, { burned: true, round: 1, kang: 1 }, { burned: true, act3: true, inn_rebuilt: true }, { burned: true, act3: true, cross: true, worm: true, hyeok_join: true, baek_gone: true, gwi_dead: true, bing_dead: true }, { burned: true, act3: true, crippled: true, inn_rebuilt: true }];
    for (const step of steps) for (const fl of FL) { G.S.flags = { ...fl, step }; for (const id in M) { if (!reg[id].size) continue; let c; try { c = Story.content(id); } catch (e) { continue; } for (const n of c.npcs) if (!near(reg[id], n.x + .5, n.y + .5, 2, 2)) out.add(`${id} NPC ${n.id || n.name} ${n.x},${n.y}`); for (const s of [...c.spots, ...c.trigs]) if (s.w && !near(reg[id], s.x + s.w / 2, s.y + s.h / 2, s.w / 2 + 1, s.h / 2 + 1)) out.add(`${id} SPOT ${s.label || s.id || ''} ${s.x},${s.y}`); } }
    for (const id in M) { const m = M[id]; if (!reg[id].size) continue; for (const q of m.portals) if (!q.door && !near(reg[id], (q.x + q.w / 2) / TS, (q.y + q.h / 2) / TS, q.w / TS / 2 + 1, q.h / TS / 2 + 1)) out.add(`${id} EXIT → ${q.to} ${q.x / TS},${q.y / TS}`); }
    return { steps: steps.length, maps: Object.keys(M).length, noin, bad: [...out] };
  });
  console.log(JSON.stringify(r, null, 0)); console.log(errs.slice(0, 3).join('\n') || 'no errors'); await b.close();
})().catch(e => { console.log(String(e).slice(0, 500)); process.exit(1); });
