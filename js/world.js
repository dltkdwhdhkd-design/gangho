// 강호 전도: 중원과 변방을 한 장으로 걸어 다니는 큰 지도. 좌표는 804×658 참고 지도 기준
import { G, IMG, TS, VW, VH, rnd, pick, toast, el, esc, Sound } from './core.js';
import { MAPS, makeMap } from './maps.js';
import { BIOME, AUTO, hasTex, texTile } from './tiles.js';
import { DB } from './items.js';
import { give, nextDay } from './state.js';
import { Story, ctx, say, choice } from './ctx.js';
import { LOCS, ROADS, PROV } from './worlddata.js';

const K = 1.6, WW = Math.round(804 * K), WH = Math.round(658 * K), CH = 32;
// 바다. 해안선을 따라 시계 방향
const SEA = [[804, 100], [770, 130], [752, 160], [745, 190], [712, 222], [690, 240], [668, 232], [650, 255], [625, 262], [612, 272], [628, 292], [660, 290], [692, 295], [665, 318], [645, 338], [650, 352], [670, 385], [695, 395], [680, 405], [702, 430], [692, 470], [662, 520], [620, 548], [590, 567], [545, 585], [528, 598], [522, 618], [505, 592], [470, 575], [440, 590], [420, 605], [420, 658], [804, 658]];
// 중원의 경계. 전도에 선으로 그린다
const REALM = [[8, 195], [40, 193], [75, 190], [100, 160], [112, 135], [150, 122], [195, 148], [215, 165], [262, 195], [300, 207], [345, 212], [400, 212], [450, 205], [505, 190], [545, 170], [585, 150], [610, 140], [625, 118], [605, 75], [615, 40], [640, 18], [680, 22], [705, 55], [735, 75], [775, 82], [795, 112], [770, 130], [752, 160], [745, 190], [712, 222], [690, 240], [668, 232], [650, 255], [625, 262], [612, 272], [628, 292], [660, 290], [692, 295], [665, 318], [645, 338], [650, 352], [670, 385], [695, 395], [680, 405], [702, 430], [692, 470], [662, 520], [620, 548], [590, 567], [545, 585], [528, 598], [522, 618], [505, 592], [470, 575], [420, 568], [385, 595], [345, 565], [315, 545], [335, 490], [300, 445], [240, 445], [180, 460], [130, 420], [85, 395], [45, 345], [58, 300], [30, 275], [8, 250]];
const RIVERS = [[[262, 360], [300, 395], [345, 440], [385, 480], [430, 460], [470, 445], [520, 430], [560, 440], [600, 425], [635, 405], [665, 390], [692, 392]], [[290, 345], [345, 335], [385, 335], [405, 300], [440, 262], [480, 255], [495, 290], [500, 345], [540, 345], [580, 335], [625, 305], [650, 298]], [[470, 540], [540, 545], [590, 565]]];
const RANGES = [[[90, 395], [150, 430], [210, 445], [290, 435]], [[60, 300], [150, 310], [250, 335], [340, 360]], [[70, 215], [150, 195], [230, 205]], [[110, 150], [170, 150]], [[420, 365], [475, 368], [545, 372]], [[540, 250], [545, 300], [530, 340]], [[620, 60], [600, 120], [590, 165]], [[700, 190], [735, 175]], [[470, 505], [540, 505], [600, 500]], [[610, 470], [640, 520]], [[335, 420], [340, 500]]];
const ISLES = [[522, 636, 26, 15], [712, 520, 11, 28], [714, 416, 12, 11]];
const inPoly = (x, y, P) => { let c = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const [xi, yi] = P[i], [xj, yj] = P[j]; if (yi > y !== yj > y && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c; } return c; };
const biomeAt = (x, y) => { // x, y는 참고 지도 좌표
  if (y < 95 || (y < 205 && x < 250 && x > 80)) return 'snow';
  if (x < 300 && y < 300) return y < 215 && y > 180 ? 'snow' : 'sand';
  if (x < 345 && y >= 300) return y > 450 ? 'deep' : 'dusk';
  if (y < 262 && x < 430) return 'sand';
  if (x > 600 && y < 235) return 'deep';
  if (y < 262) return 'grass';
  if (y > 470 || (x < 480 && y > 430)) return 'deep';
  return 'grass';
};
const BN = ['grass', 'deep', 'sand', 'rose', 'snow', 'dusk'];
let m = null, chunks = new Map(), B = null, ready = false, STOPS = [], hits = [];
const seeded = n => () => (n = (n * 9301 + 49297) % 233280) / 233280;
function line(P, wd, fn) { for (let i = 0; i + 1 < P.length; i++) { const [a, b] = P[i], [c, d] = P[i + 1], n = Math.ceil(Math.hypot(c - a, d - b) * K * 1.5); for (let t = 0; t <= n; t++) { const x = (a + (c - a) * t / n) * K, y = (b + (d - b) * t / n) * K; for (let q = -wd; q <= wd; q++) for (let r = -wd; r <= wd; r++) if (q * q + r * r <= wd * wd + 1) fn(Math.round(x + q), Math.round(y + r)); } } }
export function buildWorld() {
  if (ready) return; ready = true;
  m = makeMap('world', WW, WH, { name: '강호', bgm: 'road', biome: 'grass', arena: 'village', live: true });
  const g = m.g; B = Array.from({ length: WH }, () => new Uint8Array(WW)); const R = seeded(7);
  for (let y = 0; y < WH; y++) for (let x = 0; x < WW; x++) {
    const px = x / K, py = y / K, n = (Math.sin(x * .05 + y * .03) + Math.sin(x * .02 - y * .045)) * 7, wob = Math.sin(x * .09 + y * .04) * 2.2 + Math.sin(y * .1 - x * .03) * 2.2;
    B[y][x] = BN.indexOf(biomeAt(px + n, py - n));
    let sea = inPoly(px + wob, py - wob, SEA); for (const [ix, iy, rx, ry] of ISLES) if (((px + wob - ix) / rx) ** 2 + ((py - wob - iy) / ry) ** 2 < 1) sea = false;
    if (sea) g[y][x] = 2;
  }
  RIVERS.forEach(r => line(r, 2, (x, y) => { if (g[y] && g[y][x] !== undefined) g[y][x] = 2; }));
  // 길: 물을 만나면 다리가 된다. 긴 길 가운데에는 주막을 둔다
  const pos = id => LOCS.find(q => q.id === id).px; STOPS = [];
  for (const [a, b] of ROADS) {
    const p = pos(a), q = pos(b), d = Math.hypot(q[0] - p[0], q[1] - p[1]), wig = Math.min(26, d * .16), o = [(q[1] - p[1]) / (d || 1), (p[0] - q[0]) / (d || 1)], w1 = (R() - .5) * 2 * wig, w2 = (R() - .5) * 2 * wig;
    const c1 = [p[0] + (q[0] - p[0]) * .34 + o[0] * w1, p[1] + (q[1] - p[1]) * .34 + o[1] * w1], c2 = [p[0] + (q[0] - p[0]) * .67 + o[0] * w2, p[1] + (q[1] - p[1]) * .67 + o[1] * w2];
    line([p, c1, c2, q], 1, (x, y) => { if (!g[y] || g[y][x] === undefined) return; g[y][x] = g[y][x] === 2 || g[y][x] === 4 ? 4 : 1; });
    if (d > 70) STOPS.push({ x: Math.round((c1[0] + c2[0]) / 2 * K), y: Math.round((c1[1] + c2[1]) / 2 * K) });
  }
  STOPS = STOPS.filter(t => g[t.y]?.[t.x] === 1 || g[t.y]?.[t.x] === 0);
  const near = (x, y, d) => { for (let q = -d; q <= d; q += 2) for (let r = -d; r <= d; r += 2) { const k = g[y + r]?.[x + q]; if (k === 1 || k === 4) return true; } return false; };
  const keep = [...LOCS.map(l => [l.px[0] * K, l.px[1] * K]), ...STOPS.map(t => [t.x, t.y])], far = (x, y, d) => keep.every(([a, b]) => Math.hypot(a - x, b - (y + 5)) > d);
  const ok = (x, y) => g[y]?.[x] === 0 && g[y + 3]?.[x + 3] === 0 && !near(x + 2, y + 2, 7) && far(x, y, 22);
  RANGES.forEach(r => line(r, 7, (x, y) => { if (R() < .012 && ok(x, y)) m.put(R() < .62 ? 'rocks' : (BN[B[y][x]] === 'snow' ? 'boulder_w' : 'boulder'), x, y); }));
  const TREE = { grass: ['tree_round', 'grove_green', 'tree_big', 'bush1', 'tree_round'], deep: ['grove_pine', 'tree_pine', 'grove_green', 'bamboo'], sand: ['tree_dead', 'boulder', 'bush3', 'rocks'], rose: ['tree_dead', 'stump'], snow: ['tree_snow', 'boulder_w', 'tree_snow', 'grove_white'], dusk: ['boulder_b', 'tree_dead', 'grove_dead'] };
  const dens = { grass: .008, deep: .02, sand: .002, rose: .003, snow: .006, dusk: .005 };
  for (let y = 2; y < WH - 4; y++) for (let x = 2; x < WW - 4; x++) { const b = BN[B[y][x]]; if (R() < dens[b] && ok(x, y)) m.put(TREE[b][Math.floor(R() * TREE[b].length)], x, y); }
  for (const t of STOPS) { m.put('hut_o', t.x - 2, t.y - 4); m.put('banner4', t.x + 2, t.y - 2); m.fill(t.x - 1, t.y - 1, 3, 2, 1); m.label(t.x, t.y - 5, '주막'); }
  for (const l of LOCS) compound(l);
  m.objs = m.stamps; m.canvas = null;
  // 칸 묶음별 충돌과 소품
  m.sg = new Map(); m.og = new Map();
  const add = (M, cx, cy, v) => { const k = cx + cy * 4096; (M.get(k) || M.set(k, []).get(k)).push(v); }, S = CH * TS;
  for (const s of m.solids) for (let cy = Math.floor(s.y / S); cy <= Math.floor((s.y + s.h) / S); cy++) for (let cx = Math.floor(s.x / S); cx <= Math.floor((s.x + s.w) / S); cx++) add(m.sg, cx, cy, s);
  for (const s of m.stamps) add(m.og, Math.floor(s.x / S), Math.floor(s.y / S), s);
  m.blocked = function (px, py, w = 9, h = 5) {
    const x0 = px - w / 2, y0 = py - h, x1 = px + w / 2, y1 = py; if (x0 < 0 || y0 < 0 || x1 > WW * TS || y1 > WH * TS) return true;
    for (let ty = Math.floor(y0 / TS); ty <= Math.floor((y1 - .01) / TS); ty++) for (let tx = Math.floor(x0 / TS); tx <= Math.floor((x1 - .01) / TS); tx++) if (g[ty][tx] === 2) return true;
    for (let cy = Math.floor(y0 / S); cy <= Math.floor(y1 / S); cy++) for (let cx = Math.floor(x0 / S); cx <= Math.floor(x1 / S); cx++) { const L = m.sg.get(cx + cy * 4096); if (L) for (const s of L) if (s.x < x1 && s.x + s.w > x0 && s.y < y1 && s.y + s.h > y0) return true; }
    return false;
  };
}
const objsNear = cam => { const S = CH * TS, out = []; for (let cy = Math.floor((cam.y - 120) / S); cy <= Math.floor((cam.y + VH + 8) / S); cy++) for (let cx = Math.floor((cam.x - 120) / S); cx <= Math.floor((cam.x + VW + 8) / S); cx++) { const L = m.og.get(cx + cy * 4096); if (L) out.push(...L); } return out; };
// 전도 위의 문파와 도시. 길가 집 한 채가 아니라 담장 두른 건물 무리로 보인다
function shape(l) { if (l.kind === 'city' || l.map === 'guhwa' || l.map === 'oasis') return 'city'; if (l.kind === 'old') return { cheongha: 'village', valley: 'hamlet', bamboo: 'pass', pass: 'pass', fort: 'fort', cloudmt: 'mount', shaolin: 'mount', wolha: 'pass', silk: 'pass', tiangate: 'pass', snowpeak: 'pass', blackpalace: 'dark' }[l.map]; return { dao: 'mount', temple: 'mount', peak: 'mount', west: 'mount', manor: 'manor', water: 'fort', fort: 'fort', slum: 'fort', dark: 'dark', ice: 'manor' }[l.style]; }
const SIZE = { city: [15, 16], mount: [11, 14], manor: [10, 11], fort: [9, 9], dark: [11, 14], village: [9, 8], hamlet: [5, 4], pass: [3, 2] };
function compound(l) {
  const tx = Math.round(l.px[0] * K), ty = Math.round(l.px[1] * K), s = shape(l), [rx, ry] = SIZE[s], g = m.g, x0 = tx - rx, x1 = tx + rx, y0 = ty - ry, y1 = ty;
  // 터를 고르고 둘레에 길을 낸다. 어느 쪽에서 오든 정문으로 돌아 들어간다
  for (let y = y0 - 1; y <= y1 + 3; y++) for (let x = x0 - 1; x <= x1 + 1; x++) if (g[y]?.[x] !== undefined) { const edge = y === y0 - 1 || y === y1 + 3 || x === x0 - 1 || x === x1 + 1; g[y][x] = edge ? 1 : y > y1 ? 1 : 0; }
  m.label(tx, ty + 4.6, l.name); const brow = (st, x, y, n) => { for (let i = 0; i < n; i++) m.put(st, x + i, y); };
  if (s === 'mount' || s === 'dark') {
    const w = s === 'dark' ? 'wall_h' : 'wall_h'; m.put('rocks', tx - rx - 5, ty - ry + 1); m.put('rocks', tx + rx + 2, ty - ry + 1); m.put('rocks', tx - rx - 5, ty - 7); m.put('rocks', tx + rx + 2, ty - 7); m.put('rocks', tx - 3, ty - ry - 4); m.put('rocks', tx + 1, ty - ry - 4);
    brow(w, x0, ty - 1, rx - 2); brow(w, tx + 3, ty - 1, rx - 2); for (let y = y0; y < ty; y++) { m.put(w, x0, y); m.put(w, x1 - 1, y); } brow(w, x0, y0, rx * 2);
    m.put('hall', tx - 2, y0 + 1); m.put('lodge', x0 + 1, y0 + 2); m.put('lodge', x1 - 6, y0 + 2); m.put('hut_o2', x0 + 1, ty - 5); m.put('hut_o2', x1 - 6, ty - 5); m.put('gate_arch', tx - 2, ty - 3, { nosolid: true }); m.put('banner3', tx - 4, ty - 3); m.put('banner3', tx + 3, ty - 3);
  } else if (s === 'manor') {
    brow('wall_h', x0, ty - 1, rx - 2); brow('wall_h', tx + 3, ty - 1, rx - 2); for (let y = y0; y < ty; y++) { m.put('wall_h', x0, y); m.put('wall_h', x1 - 1, y); } brow('wall_h', x0, y0, rx * 2);
    m.put('house_red', tx - 3, y0 + 1); m.put('hut_o', x0 + 1, y0 + 1); m.put('hut_b', x1 - 5, y0 + 1); m.put('gate_arch', tx - 2, ty - 3, { nosolid: true }); m.put('banner1', tx - 4, ty - 3); m.put('banner1', tx + 3, ty - 3);
  } else if (s === 'city') {
    brow('wall_h', x0, ty - 1, rx - 2); brow('wall_h', tx + 3, ty - 1, rx - 2); for (let y = y0; y < ty; y++) { m.put('wall_h', x0, y); m.put('wall_h', x1 - 1, y); } brow('wall_h', x0, y0, rx * 2);
    m.put('hall', tx - 2, y0 + 1); [[-13, -14, 'house_red'], [-7, -14, 'shop_green'], [3, -13, 'shop_blue'], [8, -14, 'hut_o'], [-13, -9, 'hut_b'], [-7, -9, 'hut_o2'], [3, -8, 'clay'], [8, -9, 'wood_b']].forEach(([a, b, st]) => m.put(st, tx + a, ty + b)); m.put('gate_arch', tx - 2, ty - 3, { nosolid: true });
  } else if (s === 'fort') {
    brow('wood_h', x0, ty - 1, rx - 2); brow('wood_h', tx + 3, ty - 1, rx - 2); for (let y = y0; y < ty; y++) { m.put('wood_h', x0, y); m.put('wood_h', x1 - 1, y); } brow('wood_h', x0, y0, rx * 2);
    m.put('wood_b', tx - 3, y0 + 1); m.put('wood_o', x0 + 1, ty - 5); m.put('mud', x1 - 5, ty - 5); m.put('banner7', tx - 3, ty - 3); m.put('banner7', tx + 2, ty - 3);
  } else if (s === 'village') { m.put('hut_o', tx - 8, ty - 7); m.put('house_red', tx - 3, ty - 8); m.put('hut_b', tx + 3, ty - 7); m.put('hut_o2', tx - 7, ty - 3); m.put('shop_green', tx + 2, ty - 3); }
  else if (s === 'hamlet') { m.put('hut_o', tx - 4, ty - 4); m.put('straw', tx + 1, ty - 4); }
  else m.put('gate_arch', tx - 2, ty - 3, { nosolid: true });
  m.exit(tx - 2, ty - 1, 4, 1, l.map, l.at[0], l.at[1], 1, { world: true, when: l.need, lock: l.need ? '지금 갈 만한 까닭이 없다.' : undefined });
}
const fillOf = b => BIOME[b];
function chunk(cx, cy) {
  const k = cx + ',' + cy; let e = chunks.get(k); if (e) { e.t = G.field.t; return e.c; }
  if (chunks.size >= 20) { let old = null; for (const [q, v] of chunks) if (!old || v.t < chunks.get(old).t) old = q; chunks.delete(old); }
  const c = document.createElement('canvas'); c.width = c.height = CH * TS; const x = c.getContext('2d'), g = m.g, fl = IMG['tiles/Floor'], wa = IMG['tiles/Water'], R = seeded(cx * 31 + cy * 7 + 3);
  const at = (a, b) => (b < 0 || b >= WH || a < 0 || a >= WW) ? -1 : g[b][a];
  for (let ty = cy * CH; ty < Math.min(WH, (cy + 1) * CH); ty++) for (let tx = cx * CH; tx < Math.min(WW, (cx + 1) * CH); tx++) {
    const b = fillOf(BN[B[ty][tx]]), v = g[ty][tx], X = (tx - cx * CH) * TS, Y = (ty - cy * CH) * TS;
    const bn = BN[B[ty][tx]];
    if (hasTex(bn)) { const same = (q, r) => { const u = at(q, r); return u === v || u === -1 || (v !== 0 && u === 4); }, mk = (same(tx, ty - 1) ? 1 : 0) | (same(tx + 1, ty) ? 2 : 0) | (same(tx, ty + 1) ? 4 : 0) | (same(tx - 1, ty) ? 8 : 0); R(); if (texTile(x, bn, v, mk, tx, ty, X, Y)) continue; }
    x.drawImage(fl, b.fill[0] * TS, b.fill[1] * TS, TS, TS, X, Y, TS, TS);
    if (v === 0 && R() < .12) { const d = b.det[Math.floor(R() * b.det.length)]; x.drawImage(fl, d[0] * TS, d[1] * TS, TS, TS, X, Y, TS, TS); }
    if (v === 1 || v === 2) { const same = (q, r) => { const u = at(q, r); return u === v || u === -1 || (v === 1 && u === 4) || (v === 2 && u === 4); }, mk = (same(tx, ty - 1) ? 1 : 0) | (same(tx + 1, ty) ? 2 : 0) | (same(tx, ty + 1) ? 4 : 0) | (same(tx - 1, ty) ? 8 : 0), [ax, ay] = AUTO[mk]; if (v === 1) x.drawImage(fl, (b.block[0] + ax) * TS, (b.block[1] + ay) * TS, TS, TS, X, Y, TS, TS); else x.drawImage(wa, ax * TS, (6 + ay) * TS, TS, TS, X, Y, TS, TS); }
    if (v === 4) x.drawImage(wa, 6 * TS, 13 * TS, TS, TS, X, Y, TS, TS);
  }
  chunks.set(k, { c, t: G.field.t }); return c;
}
function ground(c, cam) {
  const s = CH * TS, x0 = Math.max(0, Math.floor(cam.x / s)), y0 = Math.max(0, Math.floor(cam.y / s)), x1 = Math.min(Math.ceil(WW / CH) - 1, Math.floor((cam.x + VW) / s)), y1 = Math.min(Math.ceil(WH / CH) - 1, Math.floor((cam.y + VH) / s));
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) c.drawImage(chunk(x, y), x * s, y * s);
}
// 전도. 메뉴 지도와 작은 지도가 함께 쓴다
function china(c, W, H, o = {}) {
  const sx = W / 804, sy = H / 658, P = (x, y) => [x * sx, y * sy], path = L => { c.beginPath(); L.forEach(([x, y], i) => { const [a, b] = P(x, y); i ? c.lineTo(a, b) : c.moveTo(a, b); }); };
  c.fillStyle = '#e6d6b2'; c.fillRect(0, 0, W, H);
  path(SEA); c.closePath(); c.fillStyle = '#9cc2cc'; c.fill();
  for (const [x, y, rx, ry] of ISLES) { c.fillStyle = '#e6d6b2'; c.beginPath(); c.ellipse(x * sx, y * sy, rx * sx, ry * sy, 0, 0, 7); c.fill(); }
  path(REALM); c.closePath(); c.strokeStyle = 'rgba(90,60,30,.35)'; c.lineWidth = o.mini ? 1 : 2; c.setLineDash(o.mini ? [] : [6, 5]); c.stroke(); c.setLineDash([]);
  c.strokeStyle = '#7fb0c0'; c.lineWidth = o.mini ? 1.5 : 4; c.lineCap = 'round'; for (const r of RIVERS) { path(r); c.stroke(); }
  c.fillStyle = '#bfa987'; for (const r of RANGES) for (const [x, y] of r) { const [a, b] = P(x, y), s = o.mini ? 3 : 8; c.beginPath(); c.moveTo(a - s, b + s * .7); c.lineTo(a, b - s); c.lineTo(a + s, b + s * .7); c.fill(); }
  if (o.mini) { c.fillStyle = '#2a2018'; for (const l of LOCS) { const [a, b] = P(...l.px); c.fillRect(a - 1, b - 1, 2, 2); } return; }
  c.textAlign = 'center'; const seen = G.S.seen || {}, free = G.S.mode === 'free', F = G.S.flags;
  c.font = '24px Galmuri11, sans-serif'; c.fillStyle = 'rgba(110,84,50,.42)'; for (const [n, x, y] of PROV) { const [a, b] = P(x, y); c.fillText(n, a, b); }
  c.strokeStyle = 'rgba(122,90,58,.4)'; c.lineWidth = 2; for (const [a, b] of ROADS) { const p = LOCS.find(q => q.id === a), q = LOCS.find(z => z.id === b); if (!free && (p.need && !F[p.need] || q.need && !F[q.need])) continue; path([p.px, q.px]); c.stroke(); }
  c.font = '19px Galmuri11Bold, Galmuri14, sans-serif'; c.lineJoin = 'round';
  const COL = { sect: '#3f73c4', evil: '#c8483a', out: '#7a4fb0', city: '#2a2018', old: '#b08a3a' }; hits = [];
  for (const l of LOCS) {
    const k = !!seen[l.map], hide = !free && l.need && !F[l.need]; if (hide) continue;
    const [x, y] = P(...l.px), me = l.map === G.S.map || l.map === o.here, col = COL[l.color || l.kind] || '#3f73c4';
    c.fillStyle = '#2a2018'; c.fillRect(x - 7, y - 7, 14, 14); c.fillStyle = me ? '#ff3b2c' : k ? col : '#b8a888'; c.fillRect(x - 5, y - 5, 10, 10);
    c.lineWidth = 5; c.strokeStyle = '#efe2c2'; c.strokeText(l.name, x, y + 24); c.fillStyle = k ? '#2a2018' : '#7a6a52'; c.fillText(l.name, x, y + 24); hits.push({ l, x, y, k });
  }
  const ms = G.S.fr?.sect; if (ms) { const sl = LOCS.find(q => q.map === ms.site) || LOCS[0]; hits.push({ l: { name: ms.name, map: 'mysect', at: [20, 25], px: sl.px }, x: sl.px[0] * sx, y: sl.px[1] * sy, k: true }); }
  for (const e of G.jh.marks()) { const l = e.map === 'world' ? null : LOCS.find(q => q.map === e.map), a = l ? l.px[0] * sx : e.x / K * sx, b = l ? l.px[1] * sy : e.y / K * sy; c.fillStyle = '#ffd23c'; c.strokeStyle = '#7a2a18'; c.lineWidth = 3; c.beginPath(); for (let i = 0; i < 10; i++) { const r = i % 2 ? 7 : 16, q = i * Math.PI / 5 - 1.57; c.lineTo(a + Math.cos(q) * r, b + Math.sin(q) * r); } c.closePath(); c.fill(); c.stroke(); }
  for (const j of G.S.fr?.jobs || []) if (j.map === 'world') { const a = j.x / K * sx, b = j.y / K * sy; c.fillStyle = '#ffd23c'; c.strokeStyle = '#2a2018'; c.lineWidth = 3; c.beginPath(); c.arc(a, b, 9, 0, 7); c.fill(); c.stroke(); }
  if (G.S.map === 'world') { const a = G.field.p.x / TS / K * sx, b = G.field.p.y / TS / K * sy; c.fillStyle = '#ff3b2c'; c.beginPath(); c.arc(a, b, 11, 0, 7); c.fill(); c.strokeStyle = '#fff'; c.lineWidth = 3; c.stroke(); }
}
// 빠른 이동: 가 본 곳을 지도에서 누른다. 멀수록 비싸다
const openW = () => G.S.mode === 'free' || G.S.flags.world_open;
const whereAmI = () => { const f = G.field; if (f.m.live) return [f.p.x / TS / K, f.p.y / TS / K]; const l = LOCS.find(q => q.map === f.m.id) || LOCS.find(q => (f.m.portals || []).some(p => p.to === q.map)); return l ? l.px : [598, 436]; };
function travelBar(M, close) {
  if (!openW()) return; const cv = M.querySelector('#mapc'), pane = M.querySelector('.pane'); if (!cv || !pane) return;
  cv.style.cursor = 'pointer'; const h = el('div', 'hint', '가 본 곳을 누르면 빠른 이동 (거리에 따라 은자)'); h.style.padding = '6px 10px'; pane.appendChild(h);
  const fee = l => { const [x, y] = whereAmI(); return Math.max(5, Math.round(Math.hypot(l.px[0] - x, l.px[1] - y) / 12)); };
  const at = e => { const r = cv.getBoundingClientRect(), x = (e.clientX - r.left) * cv.width / r.width, y = (e.clientY - r.top) * cv.height / r.height; let b = null, bd = 26; for (const q of hits) { const d = Math.hypot(q.x - x, q.y - y); if (d < bd) { bd = d; b = q; } } return b; };
  cv.onmousemove = e => { const b = at(e); h.textContent = !b ? '가 본 곳을 누르면 빠른 이동 (거리에 따라 은자)' : b.k ? `${b.l.name}: 은자 ${fee(b.l)}냥` : `${b.l.name}: 아직 가 본 적 없다`; };
  cv.onclick = e => { const b = at(e); if (!b || !b.k) return; const f = fee(b.l); if (b.l.map === G.S.map) return; if (G.S.silver < f) { toast(`은자 ${f}냥이 있어야 한다`, 2); return; } close(); G.S.silver -= f; const [hx, hy] = whereAmI(), days = G.S.mode === 'free' ? Math.floor(Math.hypot(b.l.px[0] - hx, b.l.px[1] - hy) / 170) : 0; G.field.run(async () => { await ctx.warp(b.l.map, b.l.at[0], b.l.at[1], 1); for (let i = 0; i < days; i++) nextDay(); if (days) toast(`길에서 ${days}일을 보냈다`, 2.4); }); };
}
// 길에서 만나는 것들
const GROUND = { grass: [['herb', 'fern1'], ['wood', 'stump'], ['honey', 'flower4']], deep: [['herb', 'fern1'], ['wood', 'stump'], ['ginseng', 'flower1'], ['shoot', 'fern2']], sand: [['ore_iron', 'boulder']], rose: [['ore_iron', 'boulder']], snow: [['ore_blue', 'boulder_w'], ['herb', 'fern1']], dusk: [['ore_iron', 'boulder_b'], ['ore_star', 'boulder_b'], ['jade', 'boulder_b']] };
function nodes(cx, cy) {
  const R = seeded(cx * 137 + cy * 71 + 11), out = [], n = R() < .55 ? 1 : 2;
  for (let i = 0; i < n; i++) { const x = cx * CH + 2 + Math.floor(R() * (CH - 4)), y = cy * CH + 2 + Math.floor(R() * (CH - 4)), b = BN[B[y]?.[x] ?? 0], L = GROUND[b], g0 = L[Math.floor(R() * L.length)]; if (m.g[y]?.[x] !== 0 || m.blocked((x + .5) * TS, (y + .7) * TS, 14, 12)) continue; out.push({ key: `w_${cx}_${cy}_${i}`, item: g0[0], stamp: g0[1], x, y }); }
  return out;
}
const relicAt = r => r.at || (r.at = wildAround(r.px, 0) || [Math.round(r.px[0] * K), Math.round(r.px[1] * K)]);
function wildAround(px, min = 10) { for (let i = 0; i < 60; i++) { const a = Math.random() * 6.28, d = min + i * .6, x = Math.round(px[0] * K + Math.cos(a) * d), y = Math.round(px[1] * K + Math.sin(a) * d); if (m.g[y]?.[x] !== undefined && m.g[y][x] !== 2 && !m.blocked((x + .5) * TS, (y + .7) * TS, 18, 14)) return [x + .5, y + .6]; } return null; }
function npcsAt() {
  const f = G.field, S = G.S, px = f.p.x / TS, py = f.p.y / TS, cx = Math.floor(px / CH), cy = Math.floor(py / CH), out = [];
  for (let b = cy - 1; b <= cy + 1; b++) for (let a = cx - 1; a <= cx + 1; a++) for (const n of nodes(a, b)) if (!S.daily[n.key]) out.push({ id: n.key, stamp: n.stamp, spr: '', x: n.x, y: n.y, hint: `${DB[n.item].name} 얻기`, talk: async () => { const q = G.party?.fx().gather ? 2 : 1; give(n.item, q); S.daily[n.key] = 1; Sound.sfx('coin', .6); toast(`${DB[n.item].name} ${q}개를 얻었다`, 1.8); } });
  for (const r of G.arts.relics) { if ((S.relic || {})[r.id]) continue; const [rx, ry] = relicAt(r); if (Math.hypot(rx - px, ry - py) < 44) out.push({ id: r.id, stamp: r.stamp, spr: '', x: rx, y: ry, hint: '살펴보기', talk: () => G.arts.relic(r) }); }
  for (const t of STOPS) if (Math.hypot(t.x - px, t.y - py) < 40) out.push({ id: 'jumo', spr: 'OldWoman', x: t.x - .5, y: t.y + .6, dir: 0, hint: '주막', talk: jumo });
  return out;
}
async function jumo() {
  const S = G.S, c = await choice('길가 주막이다. 주모가 행주로 탁자를 훔치고 있다.', ['하룻밤 묵는다 (은자 5냥)', '국밥을 먹는다 (은자 3냥)', '요즘 소문을 묻는다', '그만둔다']);
  if (c === 0) { if (S.silver < 5) { await say(null, '주머니가 비었다.'); return; } S.silver -= 5; await G.life.sleepNow(); }
  if (c === 1) { if (S.silver < 3) { await say(null, '주머니가 비었다.'); return; } S.silver -= 3; S.potion = Math.max(S.potion, S.potionMax); await say(null, '뜨거운 국밥을 비우고 나니 금창약도 다시 채워 넣을 여유가 생겼다.'); }
  if (c === 2) { const rm = Math.random() < .35 ? G.arts.rumor() : G.jh.talkOfDay(), n = rm || (S.fr?.news?.length ? pick(S.fr.news.slice(0, 6)).replace(/^\d+일: /, '') : null) || pick(['소림 스님들이 요즘 산문을 일찍 닫는다더군요.', '장강 쪽 뱃삯이 또 올랐대요. 수로채가 뭘 또 걷는 모양이에요.', '서쪽으로 가는 장사꾼들이 부쩍 줄었어요. 왜 그런지는 아무도 말을 안 해요.', '개방 거지들한테 밥 한 끼 주면 소문을 공짜로 들을 수 있어요. 저는 그렇게 장사해요.']); await say(null, `주모: ${n}`); }
}
let spawnT = 3, lastProv = '', lastChunk = '';
function tick(dt) {
  const f = G.field; if (!f.m?.live || f.busy) return; if (!G.S.flags.world_tip) { G.S.flags.world_tip = 1; f.run(async () => { await say(null, '여기서부터 강호다. 길을 따라가면 마을과 문파가 나오고, 길가 주막에서는 쉬거나 소문을 들을 수 있다.'); await say(null, '문파 사범에게 무공을 배울 수 있고, 메뉴의 무공록과 소식에서 할 일을 찾을 수 있다. 지도(M)에서 가 본 곳을 누르면 빠르게 갈 수 있다.'); }); return; } const p = f.p, S = G.S, tx = Math.floor(p.x / TS), ty = Math.floor(p.y / TS), b = BN[B[ty]?.[tx] ?? 0];
  f.m.arena = { grass: 'village', deep: 'forest', sand: 'sand', rose: 'sand', snow: 'snow', dusk: 'fort' }[b]; f.m.ambient = b === 'snow' ? 'snow' : b === 'deep' ? 'leaf' : null;
  const ck = Math.floor(tx / CH) + ',' + Math.floor(ty / CH); if (ck !== lastChunk) { lastChunk = ck; f.refresh(); }
  let bp = null, bd = 1e9; for (const q of PROV) { const d = Math.hypot(q[1] - p.x / TS / K, q[2] - p.y / TS / K); if (d < bd) { bd = d; bp = q[0]; } }
  if (bp !== lastProv) { if (lastProv) G.party.bark(bp); lastProv = bp; const e = document.querySelector('#place'); if (e) { e.textContent = bp; e.classList.add('on'); clearTimeout(f._pt); f._pt = setTimeout(() => e.classList.remove('on'), 1800); } }
  // 물가에 서면 낚시
  const [dx, dy] = [[0, 1], [0, -1], [-1, 0], [1, 0]][p.dir] || [0, 1], wet = f.m.g[ty + dy * 1]?.[tx + dx * 1] === 2;
  f.spots = wet && S.flags.rod ? [{ x: tx - 1, y: ty - 1, w: 3, h: 3, hint: '낚시하기', act: () => G.life.fishing(b === 'deep' ? 'stream' : 'river') }] : [];
  spawnT -= dt; f.roam = f.roam.filter(r => !r.gone && Math.hypot(r.x - p.x, r.y - p.y) < 340); f.animals = f.animals.filter(a => !a.gone && Math.hypot(a.x - p.x, a.y - p.y) < 340);
  if (spawnT > 0) return; spawnT = 4 + Math.random() * 6;
  const a = Math.random() * 6.28, x = p.x + Math.cos(a) * 210, y = p.y + Math.sin(a) * 150; if (f.m.blocked(x, y, 14, 12)) return;
  if (S.flags.bow && f.animals.length < 3 && Math.random() < .5) { const k = pick(b === 'snow' ? ['rabbit', 'deer'] : ['rabbit', 'pheasant', 'deer']); f.animals.push({ kind: k, ...G.life.animals[k], x, y, vx: 0, vy: 0, t: 1, walk: 0 }); return; }
  if (f.roam.length >= 3 || !S.flags.world_open && S.mode !== 'free') return;
  const hunted = G.jh.spawn(x, y); if (hunted) { f.roam.push(hunted); return; }
  const lv = Math.max(1, S.lv + (Math.random() < .3 ? 1 : 0)), onRoad = f.m.g[ty]?.[tx] === 1 || f.m.g[ty]?.[tx] === 4, kind = pick(wet ? ['pirate', 'pirate', 'bandit'] : onRoad ? ['bandit', 'rogue', 'bandit'] : ['bandit', 'rogue']), n = lv < 5 ? 1 : lv < 14 ? 2 : 3, foes = G.free.group(kind, lv, n), FO = G.free.foes;
  f.roam.push({ spr: FO[foes[0]].spr, x, y, hx: x, hy: y, foes, dir: 0, walk: 0, t: 1 + Math.random() * 2, vx: 0, vy: 0 });
}
function ensure(id) { if (id === 'world') buildWorld(); else if (!MAPS[id]) G.base.make(id); }
const entry = id => { const l = LOCS.find(q => q.map === id); return l ? [Math.round(l.px[0] * K) + .5, Math.round(l.px[1] * K) + 3.5] : [Math.round(598 * K), Math.round(440 * K)]; };
Story.providers.push(id => id === 'world' && ready ? { npcs: npcsAt(), spots: [], trigs: [], roam: [] } : { npcs: [], spots: [], trigs: [], roam: [] });
G.world = { wildAround: px => wildAround(px, 12) || [null, null], here: whereAmI, ensure, build: buildWorld, ground, china, tick, travelBar, entry, objsNear, K, open: openW, size: [WW, WH] };
