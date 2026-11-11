// 바깥 지도 쿼터뷰. 지도는 정면 지도와 똑같이 네모 칸에서 돈다(길, 담, 문, 사람 자리, 충돌, 이야기 좌표가 전부 그대로).
// 그릴 때만 그 평면도를 45도 돌려 눕힌다: 칸 좌표 (x, y) → 화면 ((x - y)·a, (x + y)·a·t). 북쪽이 오른쪽 위, 남쪽이 왼쪽 아래다.
// 그래서 길도 담도 집 밑선도 전부 같은 두 방향으로만 뻗는다. 땅은 평면도를 칠한 뒤 통째로 눕히고, 집과 담은 쿼터뷰 그림으로 바꿔 세우고, 나머지 소품은 제자리에 세운다
import { G, TS, IMG } from './core.js';
import { STAMPS, drawStamp } from './tiles.js';
import { ISO, ISO_SC, meta, corners, frontY, normIso, drawIso } from './iso.js';
import { LOCS } from './worlddata.js';

const A = ISO_SC, clamp = (v, a, b) => v < a ? a : v > b ? b : v;
// 정면 집 → 쿼터뷰 집. 아직 임시 상자인 그림(TEMP)은 쓰지 않고 받은 그림 가운데 비슷한 것으로 세운다
const TEMP = new Set(['adobe', 'bell', 'cabin', 'dorm', 'gate_manor', 'gate_sect', 'kitchen', 'library', 'lodge', 'pagoda', 'platform', 'ruin', 'shack', 'ship', 'stairs', 'stilt', 'tent', 'watchtower', 'yurt']);
const real = n => n && meta(n) && !TEMP.has(n) ? n : null;
const ISO_OF = { hall: ['hall_dao'], lodge: ['lodge', 'rich'], house_red: ['rich'], inn: ['inn'], hut_o: ['tile_house'], hut_b: ['tile_house'], hut_o2: ['thatch'], shop_blue: ['store'], shop_green: ['clinic'], clay: ['adobe', 'barn'], wood_o: ['barn'], wood_b: ['thatch_long'], mud: ['shack', 'thatch'], straw: ['thatch'] };
const HALL = { temple: 'hall_temple', dao: 'hall_dao', manor: 'hall_manor', dark: 'hall_dark', ice: 'hall_ice', west: 'hall_west', fort: 'hall_dark' };
export const hallOf = id => { const l = LOCS.find(q => q.map === id); return real(HALL[l?.style]) || 'hall_dao'; };
const ISO_ROOM = { smith: 'smithy', clinic: 'clinic', shop: 'store', inn: 'inn', gamble: 'gamble', gov: 'yamen', book: 'books', bokun: 'shrine', myhouse: 'thatch', dorm: 'dorm', mess: 'kitchen', lib: 'library' };
// 문파 양식마다 [큰 곁채, 작은 곁채, 담]
const SECT = { manor: ['rich', 'tile_house', 'wall_tile'], temple: ['tile_house', 'tile_house', 'wall_tile'], dao: ['tile_house', 'tile_house', 'wall_tile'], peak: ['tile_house', 'thatch_long', 'wall_stone'], ice: ['tile_house', 'tile_house', 'wall_stone'], west: ['rich', 'tile_house', 'wall_stone'], dark: ['rich', 'tile_house', 'wall_stone'], water: ['thatch_long', 'barn', 'fence'], fort: ['thatch_long', 'barn', 'palisade'], slum: ['thatch', 'barn', 'fence'] };
const WALLS = { wall_h: 'wall_tile', wall_m: 'wall_tile', wall_v: 'wall_tile', wood_h: 'palisade', wood_v: 'palisade', fence_h: 'fence' };
const STALLS = ['stall', 'stall_fruit', 'stall_meat', 'stall_pot'];
const TREE = { tree_round: 'tree_round', tree_big: 'tree_round', grove_green: 'tree_round' };
const isTree = n => /^(tree_|plum|grove_|bamboo)/.test(n), isRock = n => /^(rocks|boulder|mtn)/.test(n);
// 세워 그리는 소품의 크기. 사람은 그대로이고 세상은 a만큼 줄어 있으니, 나무와 바위는 덜 줄이고 살림과 깃발은 조금 더 줄인다
const scOf = n => isTree(n) ? .95 : isRock(n) ? .8 : /^(flag|pen_|banner)/.test(n) ? .8 : /^(fern|flower|bush)/.test(n) ? .8 : .7;
const hash = (x, y, s = 1) => { let h = (x * 374761393 + y * 668265263 + s * 2246822519) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };

// ── 1. 계획: 어느 집이 어느 그림이 되고 바닥이 어디를 차지하나. 지도마다 한 번, 칸 좌표로 정한다 ──
function plan(m) {
  if (m._isoPlan) return m._isoPlan;
  const l = LOCS.find(q => q.map === m.id), sect = l && /^b_/.test(m.id) ? SECT[l.style] || SECT.dao : null, B = [];  // b_: 문파와 세가 본거지, c_: 고을
  for (const st of m.stamps) {
    const s = STAMPS[st.name]; if (!s || st.flat) continue;
    if (ISO_OF[st.name] || real(st.isoAs)) {
      const w = s[3] * (st.sc || 1), h = s[4] * (st.sc || 1), by = st.y + h;
      const door = m.portals.find(q => q.door && q.x < st.x + w && q.x + q.w > st.x && Math.abs(q.y + q.h / 2 - by) < 20), kind = door ? String(door.to).replace(/^[rh]_[a-z0-9]+_/, '').replace(/\d+$/, '') : '';
      let name = real(st.isoAs) || (kind === 'hall' && door && /^r_/.test(door.to) ? hallOf(m.id) : null) || real(ISO_ROOM[kind]) || (sect && real(sect[st.name === 'lodge' || st.name === 'house_red' ? 0 : 1])) || (ISO_OF[st.name] || []).map(real).find(Boolean) || 'tile_house';
      if (name === 'inn' && /^c_/.test(m.id) && real('inn_city')) name = 'inn_city';
      B.push({ st, name, door, Dx: door ? door.x + door.w / 2 : st.x + w / 2, by });
    }
  }
  // 이 지도의 바닥선 기울기: 서 있는 집 그림들의 평균에 맞춘다. 그래야 그림을 가장 덜 건드린다
  let sum = 0, n = 0; for (const b of B) { const q = ISO[b.name], wgt = /^hall_/.test(b.name) ? 3 : 1; sum += ((q.ls ?? .5) + (q.rs ?? .5)) / 2 * wgt; n += wgt; }
  const t = m.isoT || clamp(n ? sum / n : .36, .3, .46);
  const foot = [];
  for (const b of B) {
    const key = normIso(b.name, t) || b.name, q = ISO[key], wL = q.fw * 16 / A, hL = q.fh * 16 / A, s = STAMPS[b.st.name];
    const x1 = b.Dx + (q.door ?? .5) * wL, y1 = b.by;
    // 막힘 상자를 정면 집 것에서 쿼터뷰 집 바닥으로 바꾼다. 문 앞(아래쪽 줄)은 그대로다
    if (s.length > 5) { const k = m.solids.findIndex(r => r.x === b.st.x + s[5] && r.y === b.st.y + s[6] && r.w === s[7] && r.h === s[8]); if (k >= 0) m.solids.splice(k, 1); }
    const box = { x: x1 - wL + 1, y: y1 - hL, w: wL - 2, h: hL - 2 }; m.solids.push(box); foot.push(box);
    Object.assign(b, { key, x1, y1, wL, hL, box });
  }
  // 겹침 점검: 집끼리, 집과 길
  const warn = [];
  for (let i = 0; i < B.length; i++) {
    const a = B[i].box; for (let j = i + 1; j < B.length; j++) { const c = B[j].box; if (a.x < c.x + c.w && a.x + a.w > c.x && a.y < c.y + c.h && a.y + a.h > c.y) warn.push(`집 겹침 ${B[i].name}@${Math.round(a.x / TS)},${Math.round(a.y / TS)} × ${B[j].name}`); }
    let road = 0; for (let ty = Math.floor(a.y / TS); ty <= Math.floor((a.y + a.h - 1) / TS); ty++) for (let tx = Math.floor(a.x / TS); tx <= Math.floor((a.x + a.w - 1) / TS); tx++) { const v = m.g[ty]?.[tx]; if (v === 1 || v === 2) road++; }
    if (road > 3) warn.push(`길 위 ${B[i].name}@${Math.round(a.x / TS)},${Math.round(a.y / TS)} (${road}칸)`);
    for (const q of m.portals) if (q !== B[i].door && q.x + q.w / 2 > a.x && q.x + q.w / 2 < a.x + a.w && q.y + q.h > a.y && q.y + q.h < a.y + a.h) warn.push(`문 가림 ${B[i].name}@${Math.round(a.x / TS)},${Math.round(a.y / TS)}`);
  }
  m.layWarn = warn; m.isoFoot = foot;
  const P0 = { B, t, sect, town: /^c_/.test(m.id), fences: [], props: [] }; if (!sect) lots(m, P0);
  return m._isoPlan = P0;
}

// 살림집 터: 집과 앞마당을 울타리로 한 바퀴 두르고 문 앞만 튼다. 칸 좌표의 네모라서 울타리가 집 밑선과 저절로 나란하다
// 길이나 이웃집, 다른 터에 걸리면 마당을 줄여 보고, 그래도 안 되면 두르지 않는다
const HOME = new Set(['thatch', 'tile_house', 'thatch_long', 'barn']), YARD = ['woodpile', 'jars', 'haystack', 'crates', 'coop', 'ricebags', 'herbrack', 'millstone', 'laundry'];
function lots(m, P0) {
  const rings = [], hit = (R, b) => R.x < b.x + b.w && R.x + R.w > b.x && R.y < b.y + b.h && R.y + R.h > b.y;
  const free = (R, self) => {
    if (R.x < 4 || R.y < 4 || R.x + R.w > m.w * TS - 4 || R.y + R.h > m.h * TS - 4) return false;
    for (const b of P0.B) if (b !== self && hit(R, b.box)) return false;
    for (const q of rings) if (hit({ x: R.x - 6, y: R.y - 6, w: R.w + 12, h: R.h + 12 }, q)) return false;
    for (const q of m.portals) if (q !== self.door && hit(R, q)) return false;
    for (let ty = Math.floor(R.y / TS); ty <= Math.floor((R.y + R.h) / TS); ty++) for (let tx = Math.floor(R.x / TS); tx <= Math.floor((R.x + R.w) / TS); tx++) if (m.g[ty]?.[tx]) return false;  // 길, 물, 돌바닥 위로는 두르지 않는다
    for (const st of m.stamps) { const sp = STAMPS[st.name]; if (!sp || sp.length < 6 || st === self.st || P0.B.some(b => b.st === st)) continue; const tr = { x: st.x + sp[5], y: st.y + sp[6], w: sp[7], h: sp[8] }; if (hit(R, tr) && !(tr.x > R.x + 3 && tr.y > R.y + 3 && tr.x + tr.w < R.x + R.w - 3 && tr.y + tr.h < R.y + R.h - 3)) return false; }  // 울타리 줄이 나무나 바위를 꿰뚫지 않게
    return true;
  };
  for (const b of P0.B) {
    if (!HOME.has(b.name) || (b.door && !/(_home\d*|^myhouse|^h_)/.test(b.door.to))) continue;
    let R = null; for (const [fr, sd, bk] of [[30, 9, 7], [24, 7, 6], [18, 5, 5], [13, 4, 4]]) { const c = { x: b.box.x - sd, y: b.box.y - bk, w: b.box.w + sd * 2, h: b.box.h + bk + 2 + fr }; if (free(c, b)) { R = c; break; } }
    if (!R) continue; rings.push(R);
    const x0 = R.x, x1 = R.x + R.w, y0 = R.y, y1 = R.y + R.h, gl = clamp(b.Dx - 12, x0 + 4, x1 - 28), gr = gl + 24, T = 3;
    P0.fences.push({ ax: 'x', a: x0, b: x1, at: y0 }, { ax: 'x', a: x0, b: gl, at: y1 }, { ax: 'x', a: gr, b: x1, at: y1 }, { ax: 'y', a: y0, b: y1, at: x0 }, { ax: 'y', a: y0, b: y1, at: x1 });
    m.solids.push({ x: x0, y: y0 - T, w: R.w, h: T }, { x: x0, y: y1 - T, w: gl - x0, h: T }, { x: gr, y: y1 - T, w: x1 - gr, h: T }, { x: x0, y: y0, w: T, h: R.h }, { x: x1 - T, y: y0, w: T, h: R.h });
    // 마당 살림: 앞마당 양 귀퉁이에. 문 앞길은 비운다
    const hs = Math.round(b.box.x * 7 + b.box.y * 13), yard = y1 - (b.box.y + b.box.h); if (yard < 16) continue;
    [[x1 - 6, hs], [gl - 4, hs + 3]].forEach(([fx, h2], i) => { const nm = YARD[h2 % YARD.length]; if (!real(nm)) return; const q = ISO[nm], wL = q.fw * 16 / A, hL = q.fh * 16 / A, fy = y1 - 6; if (fx - wL < x0 + 4 || (i === 0 && fx - wL < gr + 3) || hL > yard - 6) return; P0.props.push({ name: nm, x: fx, y: fy }); m.solids.push({ x: fx - wL, y: fy - hL, w: wL, h: hL }); });
  }
}

// ── 2. 땅: 평면도를 칠해 통째로 눕힌다. 지도 밖은 가장자리 칸을 그대로 이어 붙여(길은 계속 뻗고 강은 계속 흐른다) 숲으로 덮는다 ──
function ground(m, r, cv) {
  const c = cv.getContext('2d'), a = r.a, t = r.t, W = cv.width, H = cv.height, mw = m.w, mh = m.h;
  // 화면 네 귀퉁이가 평면도의 어디인지 보고 그만큼 넓혀 칠한다
  const inv = (X, Y) => { const u = (X - r.ox) / a, v = (Y - r.oy) / (a * t); return [(u + v) / 2, (v - u) / 2]; };
  let x0 = 0, y0 = 0, x1 = mw * TS, y1 = mh * TS; for (const [X, Y] of [[0, 0], [W, 0], [0, H], [W, H]]) { const [x, y] = inv(X, Y); x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
  const M0 = Math.ceil(-x0 / TS) + 1, N0 = Math.ceil(-y0 / TS) + 1, EW = Math.ceil(x1 / TS) + 1 + M0, EH = Math.ceil(y1 / TS) + 1 + N0;
  const bi = { grass: 0, deep: 1, sand: 2, plain: 3, rose: 3, snow: 4, dusk: 5 }[m.biome] ?? 0, src = m.gPaint || m.g;
  const g2 = [], b2 = []; for (let y = 0; y < EH; y++) { const sy = clamp(y - N0, 0, mh - 1), gr = [], br = []; for (let x = 0; x < EW; x++) { const sx = clamp(x - M0, 0, mw - 1); gr.push(src[sy][sx]); br.push(m.bm ? m.bm[sy][sx] : bi); } g2.push(gr); b2.push(br); }
  r.ext = { M0, N0, EW, EH, g2 };
  // 가로 띠로 나눠, 화면에 걸리는 칸만 칠해서 눕힌다
  const BAND = 12, tmp = document.createElement('canvas'), tc = tmp.getContext('2d', { willReadFrequently: false });
  c.imageSmoothingEnabled = true; c.imageSmoothingQuality = 'high';
  for (let by = 0; by < EH; by += BAND) {
    const bh = Math.min(BAND, EH - by), ya = (by - N0) * TS, yb = ya + bh * TS; let xa = Infinity, xb = -Infinity;
    // 이 띠에서 화면에 들어오는 x 범위: X = (x - y)a + ox ∈ [0, W], Y = (x + y)at + oy ∈ [0, H]
    for (const y of [ya, yb]) { const lo = Math.max(-r.ox / a + y, -r.oy / (a * t) - y), hi = Math.min((W - r.ox) / a + y, (H - r.oy) / (a * t) - y); xa = Math.min(xa, lo); xb = Math.max(xb, hi); }
    if (xb <= xa - BAND * TS) continue; const tx0 = clamp(Math.floor(xa / TS) + M0 - 1 - BAND / 2, 0, EW), tx1 = clamp(Math.ceil(xb / TS) + M0 + 1 + BAND / 2, 0, EW); if (tx1 <= tx0) continue;  // 띠 안쪽에서 범위가 가장 넓어질 수 있어 반 띠만큼 넉넉히
    const ph = Math.min(bh + 1, EH - by); tmp.width = (tx1 - tx0) * TS; tmp.height = ph * TS; G.world.paintArea(tc, tx0, by, tx1 - tx0, ph, g2, b2, EW, EH);  // 한 줄 겹쳐 칠해 띠 사이에 금이 안 가게
    c.setTransform(a, a * t, -a, a * t, r.ox, r.oy); c.drawImage(tmp, (tx0 - M0) * TS, ya);
  }
  c.setTransform(1, 0, 0, 1, 0, 0);
}

// ── 3. 소품: 집과 담은 쿼터뷰 그림으로, 나머지는 제자리에 세운다 ──
export function buildIsoOut(m) {
  const P0 = plan(m), t = P0.t, a = A, top = 132, pad = 56, bot = 44;
  const r = m.isoRoom = { a, t, out: true, ox: m.h * TS * a + pad, oy: top };
  r.W = Math.ceil((m.w + m.h) * TS * a + pad * 2); r.H = Math.ceil((m.w + m.h) * TS * a * t + top + bot);
  const P = (x, y) => [(x - y) * a + r.ox, (x + y) * a * t + r.oy];
  const cv = document.createElement('canvas'); cv.width = r.W; cv.height = r.H; ground(m, r, cv);
  const objs = [], flat = [], isoAt = (key, x, y, flip, extra) => { const q = meta(key, flip), [X, Y] = P(x, y); const o = { name: key, x: Math.round(X - q.ax), y: Math.round(Y - q.ay), w: q.w, h: q.h, base: Y, iso: corners(X, Y, q.fw, q.fh, q.ls, q.rs), flip: !!flip, ...extra }; objs.push(o); return o; };
  const byStamp = new Map(P0.B.map(b => [b.st, b])), blds = [];
  for (const b of P0.B) blds.push(b.obj = isoAt(b.key, b.x1, b.y1, false, { src: b.name, bld: true }));
  // 담: 가로로 이어진 줄(같은 높이, 붙어 있는 칸)을 찾아 쿼터뷰 담 조각으로 잇는다. 동쪽 끝에서 서쪽으로, 남쪽 끝에서 북쪽으로
  const used = new Set(), walls = m.stamps.filter(s => WALLS[s.name] && !s.flat), at = new Set(walls.map(s => `${Math.round(s.x)},${Math.round(s.y)}`)), has = (x, y) => at.has(`${Math.round(x)},${Math.round(y)}`);
  const wallArt = n => { const k = P0.town && n === 'wall_h' ? 'city_wall' : (n === 'wall_h' || n === 'wall_m') && P0.sect ? P0.sect[2] : WALLS[n]; return real(k) || 'wall_tile'; };
  const isCol = s => /_v$/.test(s.name) || ((has(s.x, s.y - 16) || has(s.x, s.y + 16)) && !has(s.x - 16, s.y) && !has(s.x + 16, s.y));
  const runs = (list, ax) => { const g = new Map(); for (const s of list) { const k = wallArt(s.name) + '|' + Math.round(ax === 'x' ? s.y : s.x); (g.get(k) || g.set(k, []).get(k)).push(s); } const out = []; for (const l of g.values()) { l.sort((p, q) => p[ax] - q[ax]); let i = 0; while (i < l.length) { let j = i; while (j + 1 < l.length && l[j + 1][ax] - l[j][ax] <= 16.5) j++; out.push(l.slice(i, j + 1)); i = j + 1; } } return out; };
  for (const run of runs(walls.filter(s => !isCol(s)), 'x')) {
    const xa = run[0].x, xb = run[run.length - 1].x + 16, ys = run[0].y + 16, art = normIso(wallArt(run[0].name), t, 'w') || wallArt(run[0].name), q = ISO[art], step = q.fw * 16 / a, n = Math.max(1, Math.ceil((xb - xa) / step - .15));
    for (let k = 0; k < n; k++) isoAt(art, Math.max(xb - k * step, xa + step), ys, false, { wall: true });
    run.forEach(s => used.add(s));
  }
  for (const run of runs(walls.filter(isCol), 'y')) {
    const ya = run[0].y, yb = run[run.length - 1].y + 16, xe = run[0].x + 12, art = normIso(wallArt(run[0].name), t, 'w') || wallArt(run[0].name), q = ISO[art], step = q.fw * 16 / a, n = Math.max(1, Math.ceil((yb - ya) / step - .15));
    for (let k = 0; k < n; k++) isoAt(art, xe, Math.max(yb - k * step, ya + step), true, { wall: true });
    run.forEach(s => used.add(s));
  }
  // 울타리와 마당 살림
  const fq = normIso('fence', t, 'w') || 'fence', fstep = ISO[fq].fw * 16 / a;
  for (const f of P0.fences) { const n = Math.max(1, Math.ceil((f.b - f.a) / fstep - .2)); if (f.b - f.a < 4) continue; for (let k = 0; k < n; k++) { const e = Math.max(f.b - k * fstep, Math.min(f.b, f.a + fstep)); f.ax === 'x' ? isoAt(fq, e, f.at, false, { wall: true }) : isoAt(fq, f.at, e, true, { wall: true }); } }
  for (const p of P0.props) { const k = normIso(p.name, t) || p.name; isoAt(k, p.x, p.y, false, {}); }
  let stallN = 0;
  for (const st of m.stamps) {
    const s = STAMPS[st.name]; if (!s || byStamp.has(st) || used.has(st)) continue; const sc0 = st.sc || 1, w = s[3] * sc0, h = s[4] * sc0, solid = s.length > 5;
    if (st.name === 'awning') continue;
    if (st.name === 'counter' && m.stamps.some(o => o.name === 'awning' && Math.abs(o.x + 24 - st.x) < 6 && Math.abs(o.y + 32 - st.y) < 6)) {  // 차양 밑 매대 → 좌판
      const sn = STALLS[stallN++ % 4], art = normIso(sn, t) || sn, q = ISO[art]; isoAt(art, st.x + 24 + q.fw * 8 / a, st.y + 9 + q.fh * 8 / a, false, {}); continue;
    }
    if (st.name === 'gate_arch') {  // 산문, 성문: 담 줄 한가운데에 문루를 세우고 문길 양옆만 막는다
      if (P0.sect && /fence|palisade/.test(P0.sect[2])) continue;  // 울타리나 목책을 두른 곳은 문루 없이 터 두고 양옆 깃발로 문을 삼는다
      const gk = real(P0.town ? 'city_gate' : P0.sect && P0.sect[2] === 'wall_tile' ? 'gate_manor' : 'gate_sect') || 'city_gate', art = normIso(gk, t) || gk, q = ISO[art], wL = q.fw * 16 / a, hL = q.fh * 16 / a, cx = st.x + 32, cy = st.y + 48 - 6;
      isoAt(art, cx + wL / 2, cy + hL / 2, false, { src: gk, gate: true });
      if (!st._gs) { st._gs = 1; const side = Math.max(4, (wL - 34) / 2); m.solids.push({ x: cx - wL / 2, y: cy - hL / 2, w: side, h: hL }, { x: cx + wL / 2 - side, y: cy - hL / 2, w: side, h: hL }); }
      continue;
    }
    // 세울 자리: 막힘 상자가 있으면 그 가운데, 없으면 그림 밑변 가운데(깃발은 장대 밑동)
    const fl = /^flagl_/.test(st.name) ? 17.5 : /^flag_/.test(st.name) ? 2.5 : /^pen_/.test(st.name) ? 5 : null;
    const lx = fl !== null ? st.x + fl * sc0 : solid ? st.x + (s[5] + s[7] / 2) * sc0 : st.x + w / 2, ly = fl !== null ? st.y + h : solid ? st.y + (s[6] + s[8] / 2) * sc0 : st.flat ? st.y + h * .7 : (st.base ?? st.y + h), [X, Y] = P(lx, ly);
    const tk = TREE[st.name] && real(TREE[st.name]);
    if (tk) { const flip = hash(Math.round(st.x), Math.round(st.y)) < .5, q = meta(tk, flip); objs.push({ name: tk, x: Math.round(X - q.ax), y: Math.round(Y + 2 - q.ay), w: q.w, h: q.h, base: Y + 2, flip, tree: true, pt: [X, Y] }); continue; }
    const sc = scOf(st.name) * sc0, ax = fl !== null ? fl * sc : solid ? (s[5] + s[7] / 2) * sc : s[3] * sc / 2, ay = fl !== null || !solid ? s[4] * sc : Math.min(s[4], s[6] + s[8] * .8) * sc;
    const o = { name: st.name, x: Math.round(X - ax), y: Math.round(Y - ay), sc, w: s[3] * sc, base: Y + (solid ? s[4] * sc - ay : 0), pt: [X, Y] };
    if (st.flat) flat.push(o); else objs.push(o);
  }
  // 지도 밖 숲: 넓혀 칠한 땅의 풀밭에 나무를 촘촘히. 들어갈 수 없는 곳이라 막힘은 없다
  outside(m, r, P, objs, cv);
  // 세운 소품과 집의 앞뒤: 집 바닥 앞선보다 아래에 섰으면 집 앞, 위면 집 뒤
  for (const o of objs) { if (!o.pt) continue; let k = o.base; for (const b of blds) { if (o.pt[0] < b.x - 8 || o.pt[0] > b.x + b.w + 8 || o.pt[1] < b.y || o.pt[1] - 28 > b.iso.F[1]) continue; if (o.pt[1] > frontY(b.iso, o.pt[0])) k = Math.max(k, b.base + .01); else k = Math.min(k, b.base - .01); } o.base = k; }
  // 바닥 소품(풀, 꽃)은 땅 그림에 바로 찍는다
  const c = cv.getContext('2d'); c.imageSmoothingEnabled = false; flat.sort((p, q) => p.base - q.base); for (const o of flat) drawStamp(c, o.name, o.x, o.y, o.sc);
  // 이름표: 집 위에 달린 것은 쿼터뷰 집 지붕 위로 옮긴다
  for (const l of m.labels || []) { const lx = l.x * TS, ly = l.y * TS, b = P0.B.find(b => { const s = STAMPS[b.st.name]; return lx > b.st.x - 8 && lx < b.st.x + s[3] + 8 && ly > b.st.y - 20 && ly < b.st.y + 12; }); l.iso = b ? [b.obj.x + b.obj.w / 2, b.obj.y + 2] : (([X, Y]) => [X, Y - 26])(P(lx, ly)); }
  m.canvas = cv; m.isoObjs = objs; m.hasIso = true;
}
// 지도 밖을 채우는 숲. 들어갈 수 없는 곳이라 눈에 덜 띄어야 한다: 가장자리 몇 칸만 소품으로 세우고, 그 너머는 땅 그림에 찍은 뒤 어둡게 눌러 둔다
function outside(m, r, P, objs, cv) {
  const cnt = {}; for (const s of m.stamps) if (isTree(s.name) && !/^grove_|^bamboo/.test(s.name)) cnt[s.name] = (cnt[s.name] || 0) + 1;
  const base = m.biome === 'snow' ? ['tree_snow', 'tree_pine'] : m.biome === 'sand' ? ['tree_dead', 'boulder'] : m.biome === 'deep' ? ['tree_pine', 'tree_round'] : ['tree_round', 'tree_big'];
  const own = Object.entries(cnt).sort((p, q) => q[1] - p[1]).slice(0, 2).map(e => e[0]), dry = m.biome === 'sand' || m.biome === 'plain' || m.biome === 'rose';
  const { M0, N0, EW, EH, g2 } = r.ext, STEP = dry ? 4.2 : 2.5, far = [];
  for (let gy = 0; gy < EH / STEP; gy++) for (let gx = 0; gx < EW / STEP; gx++) {
    const tx = (gx + hash(gx, gy, 3) * .85) * STEP - M0, ty = (gy + hash(gx, gy, 5) * .85) * STEP - N0;
    if (tx > -1.4 && ty > -1.4 && tx < m.w + 1.4 && ty < m.h + 1.4) continue;  // 지도 안과 가장자리 한 줄은 지도가 놓은 대로
    if (g2[Math.floor(ty + N0)]?.[Math.floor(tx + M0)] !== 0) continue;  // 밖으로 뻗는 길과 물은 비워 둔다
    const [X, Y] = P(tx * TS, ty * TS); if (X < -40 || X > r.W + 40 || Y < -10 || Y > r.H + 60) continue;
    const d = Math.max(-tx, -ty, tx - m.w, ty - m.h); if (hash(gx, gy, 11) < (dry ? .45 : d > 4 ? .22 : .08)) continue;
    const name = own.length && hash(gx, gy, 9) < .45 ? own[Math.floor(hash(gx, gy, 7) * own.length)] : base[Math.floor(hash(gx, gy, 17) * base.length)], tk = TREE[name] && real(TREE[name]);
    let o; if (tk) { const flip = hash(gx, gy, 13) < .5, q = meta(tk, flip); o = { name: tk, x: Math.round(X - q.ax), y: Math.round(Y - q.ay), w: q.w, h: q.h, base: Y, flip, iso0: 1 }; }
    else { const s = STAMPS[name]; if (!s) continue; const sc = isTree(name) ? .95 : .8; o = { name, x: Math.round(X - s[3] * sc / 2), y: Math.round(Y - s[4] * sc + 2), sc, w: s[3] * sc, base: Y }; }
    (d <= 3.2 ? objs : far).push(o);
  }
  // 먼 숲은 어둡게 눌러 땅 그림에 찍는다. 땅(강, 길)은 그대로 이어져 보인다
  // 거름망은 나무마다 걸면 느리다. 따로 한 장에 모아 그린 뒤 한 번에 씌운다
  const lay = document.createElement('canvas'); lay.width = r.W; lay.height = r.H; const lc = lay.getContext('2d'); lc.imageSmoothingEnabled = false; far.sort((p, q) => p.base - q.base);
  for (const o of far) o.iso0 ? drawIso(lc, o) : drawStamp(lc, o.name, o.x, o.y, o.sc);
  const c = cv.getContext('2d'); c.filter = dry ? 'brightness(.86) saturate(.8)' : 'brightness(.62) saturate(.75)'; c.drawImage(lay, 0, 0); c.filter = 'none';
}
