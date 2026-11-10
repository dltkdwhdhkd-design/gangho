// 강호 전도: 중원과 변방을 한 장으로 걸어 다니는 큰 지도. 좌표는 804×658 참고 지도 기준
import { G, IMG, TS, VW, VH, rnd, pick, toast, el, esc, Sound } from './core.js';
import { MAPS, makeMap, isoMode, isoRetrofit, paintPave } from './maps.js';
import { hitsBox } from './iso.js';
import { BIOME, AUTO, STAMPS, hasTex, texTile, drawStamp, flagOf, curbs, mottle } from './tiles.js';
import { DB } from './items.js';
import { give, nextDay } from './state.js';
import { Story, ctx, say, choice } from './ctx.js';
import { LOCS, ROADS, PROV } from './worlddata.js';

const K = 1.6, WW = Math.round(804 * K), WH = Math.round(658 * K), CH = 32;
const BN = ['grass', 'deep', 'sand', 'plain', 'snow', 'dusk'];
// 땅 갈래. tools/world_gen.py가 고지도 그림(assets/hd/world/concept.webp)에서 뽑아 assets/world/terrain.png에 담는다
const PLAIN = 0, SEA = 1, RIVER = 2, STEPPE = 3, FOREST = 4, MOUNT = 5, SNOWM = 6, DESERT = 7, ROAD = 8, BRIDGE = 9, INN = 10, FOOT = 11, GLADE = 12, SNOWF = 13;
let m = null, chunks = new Map(), B = null, T = null, ready = false, STOPS = [], hits = [];
const seeded = n => () => (n = (n * 9301 + 49297) % 233280) / 233280;
const hash = (x, y, k = 0) => { let h = (x * 374761393 + y * 668265263 + k * 2246822519) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
// 부드러운 잡음: 숲의 나무 갈래, 꽃밭 같은 무리를 만든다
const vn = (x, y, s, k = 0) => { const X = x / s, Y = y / s, x0 = Math.floor(X), y0 = Math.floor(Y), u = X - x0, v = Y - y0, a = hash(x0, y0, k), b = hash(x0 + 1, y0, k), c = hash(x0, y0 + 1, k), d = hash(x0 + 1, y0 + 1, k), su = u * u * (3 - 2 * u), sv = v * v * (3 - 2 * v); return a + (b - a) * su + (c - a) * sv + (a - b - c + d) * su * sv; };
const cls = (x, y) => (x < 0 || y < 0 || x >= WW || y >= WH) ? SEA : T[y * WW + x];
function readTerrain() {
  T = new Uint8Array(WW * WH); B = Array.from({ length: WH }, () => new Uint8Array(WW));
  const im = IMG['world/terrain']; if (!im) { console.warn('강호 땅 그림이 없다'); return; }
  const c = document.createElement('canvas'); c.width = WW; c.height = WH; const x = c.getContext('2d', { willReadFrequently: true }); x.drawImage(im, 0, 0); const d = x.getImageData(0, 0, WW, WH).data;
  for (let i = 0, y = 0; y < WH; y++) for (let xx = 0; xx < WW; xx++, i++) { T[i] = Math.round(d[i * 4] / 16); B[y][xx] = Math.min(5, Math.round(d[i * 4 + 1] / 32)); }
}
// 나무, 바위, 산을 심을 자리. 길과 문파 터 둘레는 비워 둔다
let RES = null;
const reserve = (x0, y0, x1, y1) => { for (let y = Math.max(0, y0); y <= Math.min(WH - 1, y1); y++) for (let x = Math.max(0, x0); x <= Math.min(WW - 1, x1); x++) RES[y * WW + x] = 1; };
function plant(name, cx, cy, block = 1) { // cx, cy: 밑동 칸. 밑동 칸은 막힌다
  const s = STAMPS[name]; if (!s) return; m.put(name, (cx * TS + 8 - s[3] / 2) / TS, (cy * TS + TS - s[4]) / TS, { nosolid: true });
  const g = m.g, w = Math.max(1, Math.round(s[3] / TS * .55)) * block; for (let i = -Math.floor(w / 2); i < w - Math.floor(w / 2); i++) if (g[cy]?.[cx + i] === 0) g[cy][cx + i] = 6;
}
const free = (x, y, r = 0) => { for (let q = -r; q <= r; q++) for (let p = -r; p <= r; p++) { const X = x + p, Y = y + q; if (X < 0 || Y < 0 || X >= WW || Y >= WH || RES[Y * WW + X] || m.g[Y][X] !== 0) return false; } return true; };
const TREES = {
  broad: ['tree_round', 'tree_big', 'tree_round', 'grove_green', 'tree_big'], pine: ['tree_pine', 'grove_pine', 'tree_pine'], bamboo: ['bamboo', 'bamboo', 'tree_pine'],
  snow: ['tree_snow', 'grove_white', 'tree_snow', 'tree_white'], dead: ['tree_dead', 'grove_dead', 'tree_dead'], dry: ['tree_dead', 'bush3'], bloom: ['plum', 'tree_pink', 'grove_pink', 'plum_w'],
};
function kindAt(x, y) { // 그 자리 숲의 나무 갈래. 큰 무리로 바뀌게 잡음을 쓴다
  const b = BN[B[y][x]]; if (b === 'snow') return 'snow'; if (b === 'dusk') return 'dead'; if (b === 'sand') return 'dry';
  const n = vn(x, y, 46, 3); if (n < .34) return 'pine'; if (b === 'deep' && n > .8 && y > 560) return 'bamboo'; if (n > .9) return 'bloom'; return 'broad';
}
function nature() {
  const g = m.g;
  // 산: 바위산 무더기를 엇갈려 쌓아 산줄기처럼. 산 칸은 전부 막힌다
  for (let i = 0; i < WW * WH; i++) if (T[i] === MOUNT || T[i] === SNOWM) g[Math.floor(i / WW)][i % WW] = 6;
  for (let y = 4, row = 0; y < WH; y += 3, row++) for (let x = (row % 2) * 4; x < WW; x += 7) {
    const jx = x + Math.floor(hash(x, y, 1) * 3), jy = y + Math.floor(hash(x, y, 2) * 2), c = cls(jx, jy); if (c !== MOUNT && c !== SNOWM) continue;
    let n = 0; for (let q = -3; q <= 3; q++) { const k = cls(jx + q, jy); if (k === MOUNT || k === SNOWM) n++; } if (n < 5 || hash(x, y, 3) > .9) continue;
    const b = BN[B[jy][jx]]; plant(c === SNOWM || b === 'snow' ? 'mtn_s' : b === 'dusk' ? 'mtn_d' : 'mtn', jx, jy, 0);
  }
  // 산 가장자리와 틈: 작은 바위와 소나무
  for (let y = 2; y < WH; y += 2) for (let x = 1; x < WW; x += 3) {
    const jx = x + Math.floor(hash(x, y, 4) * 2), jy = y, c = cls(jx, jy); if (c !== MOUNT && c !== SNOWM) continue; if (hash(x, y, 5) > .32) continue;
    const b = BN[B[jy][jx]], sn = c === SNOWM || b === 'snow'; plant(hash(x, y, 6) < .55 ? (sn ? 'rocks_s' : 'rocks') : (sn ? 'tree_snow' : b === 'dusk' ? 'tree_dead' : 'tree_pine'), jx, jy, 0);
  }
  // 숲: 두 칸 간격 격자에 흔들어 심는다. 가장자리는 듬성듬성
  for (let y = 1; y < WH; y += 2) for (let x = 1; x < WW; x += 2) {
    const jx = x + Math.floor(hash(x, y, 7) * 2) - (y % 4 === 1 ? 1 : 0), jy = y + Math.floor(hash(x, y, 8) * 2); if (cls(jx, jy) !== FOREST || !free(jx, jy)) continue;
    let n = 0; for (let q = -2; q <= 2; q += 2) for (let p = -2; p <= 2; p += 2) if (cls(jx + p, jy + q) === FOREST) n++;
    if (hash(x, y, 9) > (n >= 9 ? .86 : n >= 6 ? .55 : .3)) continue;
    const L = TREES[kindAt(jx, jy)], nm = L[Math.floor(hash(x, y, 10) * L.length)]; plant(nm, jx, jy);
  }
  // 들판: 군데군데 나무 무리, 외딴 나무, 바위
  const DENS = { [PLAIN]: .08, [STEPPE]: .02, [GLADE]: .05, [FOOT]: .09, [DESERT]: .012, [SNOWF]: .04 };
  for (let y = 2; y < WH - 1; y += 3) for (let x = 2; x < WW - 1; x += 3) {
    const jx = x + Math.floor(hash(x, y, 11) * 3) - 1, jy = y + Math.floor(hash(x, y, 12) * 3) - 1, c = cls(jx, jy), d = DENS[c]; if (d === undefined || !free(jx, jy, 1)) continue;
    const copse = c === PLAIN || c === GLADE || c === STEPPE ? (vn(jx, jy, 22, 13) > .64 ? .5 : 0) : 0; if (hash(x, y, 14) > d + copse) continue;
    const b = BN[B[jy][jx]], r = hash(x, y, 15); let nm;
    if (c === FOOT) nm = r < .45 ? (b === 'snow' ? 'rocks_s' : 'rocks') : r < .7 ? (b === 'snow' ? 'boulder_w' : 'boulder') : (b === 'snow' ? 'tree_snow' : 'tree_pine');
    else if (c === DESERT) nm = r < .5 ? 'boulder' : r < .75 ? 'rocks' : 'tree_dead';
    else if (c === SNOWF) nm = r < .6 ? 'tree_snow' : 'boulder_w';
    else { const L = TREES[kindAt(jx, jy)]; nm = r < .12 ? 'stump' : r < .2 && b !== 'snow' ? 'boulder' : L[Math.floor(r * 97) % L.length]; }
    plant(nm, jx, jy);
  }
}
export function buildWorld() {
  if (ready) return; ready = true;
  m = makeMap('world', WW, WH, { name: '강호', bgm: 'road', biome: 'grass', arena: 'village', live: true });
  readTerrain(); const g = m.g; RES = new Uint8Array(WW * WH); STOPS = [];
  for (let y = 0; y < WH; y++) for (let x = 0; x < WW; x++) { const c = T[y * WW + x]; g[y][x] = c === SEA || c === RIVER ? 2 : c === ROAD ? 1 : c === BRIDGE ? 4 : 0; if (c === INN) STOPS.push({ x, y }); }
  // 길가 두 칸은 비워 둔다
  for (let y = 0; y < WH; y++) for (let x = 0; x < WW; x++) { const c = T[y * WW + x]; if (c === ROAD || c === BRIDGE) reserve(x - 2, y - 2, x + 2, y + 2); }
  for (const t of STOPS) { reserve(t.x - 5, t.y - 6, t.x + 5, t.y + 3); m.put('hut_o', t.x - 2, t.y - 4, { isoAs: 'tavern' }); m.put('banner4', t.x + 2, t.y - 2); m.put('jar', t.x - 3.2, t.y - 1.6); m.put('log', t.x + 3.3, t.y - .6); m.label(t.x, t.y - 5, '주막'); }
  for (const l of LOCS) compound(l);
  nature();
  if (isoMode()) { const C = LOCS.map(l => [Math.round(l.px[0] * K) * TS, Math.round(l.px[1] * K) * TS]); isoRetrofit(m, { live: true, leftOf: x => { let b = C[0]; for (const c of C) if (Math.abs(c[0] - x) < Math.abs(b[0] - x)) b = c; return x < b[0]; } }); }
  m.objs = m.stamps; m.canvas = null;
  // 칸 묶음별 충돌과 소품
  m.sg = new Map(); m.og = new Map();
  const add = (M, cx, cy, v) => { const k = cx + cy * 4096; (M.get(k) || M.set(k, []).get(k)).push(v); }, S = CH * TS;
  for (const s of m.solids) for (let cy = Math.floor(s.y / S); cy <= Math.floor((s.y + s.h) / S); cy++) for (let cx = Math.floor(s.x / S); cx <= Math.floor((s.x + s.w) / S); cx++) add(m.sg, cx, cy, s);
  for (const s of m.stamps) add(m.og, Math.floor((s.x + (s.w || STAMPS[s.name][3]) / 2) / S), Math.floor(s.base / S), s);
  m.pg = new Map(); for (const c of m.polys || []) for (let cy = Math.floor(c.K[1] / S); cy <= Math.floor(c.F[1] / S); cy++) for (let cx = Math.floor(c.L[0] / S); cx <= Math.floor(c.R[0] / S); cx++) add(m.pg, cx, cy, c);
  m.blocked = function (px, py, w = 9, h = 5) {
    const x0 = px - w / 2, y0 = py - h, x1 = px + w / 2, y1 = py; if (x0 < 0 || y0 < 0 || x1 > WW * TS || y1 > WH * TS) return true;
    for (let ty = Math.floor(y0 / TS); ty <= Math.floor((y1 - .01) / TS); ty++) for (let tx = Math.floor(x0 / TS); tx <= Math.floor((x1 - .01) / TS); tx++) { const v = g[ty][tx]; if (v === 2 || v === 6) return true; }
    for (let cy = Math.floor(y0 / S); cy <= Math.floor(y1 / S); cy++) for (let cx = Math.floor(x0 / S); cx <= Math.floor(x1 / S); cx++) { const L = m.sg.get(cx + cy * 4096); if (L) for (const s of L) if (s.x < x1 && s.x + s.w > x0 && s.y < y1 && s.y + s.h > y0) return true; const P = m.pg.get(cx + cy * 4096); if (P) for (const c of P) if (hitsBox(c, px, py, w, h)) return true; }
    return false;
  };
}
const objsNear = cam => { const S = CH * TS, out = []; for (let cy = Math.floor((cam.y - 16) / S); cy <= Math.floor((cam.y + VH + 90) / S); cy++) for (let cx = Math.floor((cam.x - 120) / S); cx <= Math.floor((cam.x + VW + 8) / S); cx++) { const L = m.og.get(cx + cy * 4096); if (L) out.push(...L); } return out; };
// 전도 위의 문파와 도시. 담장을 두르고, 산문과 본전 앞에 그 문파의 깃발을 세운다
const OLD = { cheongha: 'village', valley: 'hamlet', bamboo: 'pass', pass: 'pass', fort: 'fort', cloudmt: 'dao', shaolin: 'temple', wolha: 'pass', silk: 'pass', tiangate: 'pass', snowpeak: 'pass', blackpalace: 'dark' };
function styleOf(l) { if (l.kind === 'city' || l.map === 'guhwa' || l.map === 'oasis') return 'city'; return l.kind === 'old' ? OLD[l.map] : l.style; }
function shape(l) { const s = styleOf(l); return { dao: 'mount', temple: 'mount', peak: 'mount', west: 'mount', manor: 'manor', ice: 'manor', water: 'fort', fort: 'fort', slum: 'camp', dark: 'dark', city: 'city' }[s] || s; }
const SIZE = { city: [15, 16], mount: [11, 14], manor: [10, 11], fort: [9, 9], camp: [9, 8], dark: [11, 14], village: [9, 8], hamlet: [5, 4], pass: [3, 2] };
// 양식마다: 담, 본채, 곁채, 문 가까운 집, 나무, 돌, 장식
const LOOK = {
  dao: { wall: 'stone', hall: 'hall', side: 'lodge', small: 'wood_o', trees: ['tree_pine', 'grove_pine'], rock: 'rocks', deco: 'lantern' },
  temple: { wall: 'stone', hall: 'hall', side: 'lodge', small: 'hut_o2', trees: ['tree_round', 'tree_big'], rock: 'rocks', deco: 'lantern', idol: 'statue_big' },
  peak: { wall: 'stone', hall: 'hall', side: 'lodge', small: 'wood_b', trees: ['tree_snow', 'tree_white'], rock: 'rocks_s', deco: 'lantern' },
  west: { wall: 'stone', hall: 'hall', side: 'clay', small: 'clay', trees: ['tree_dead', 'boulder'], rock: 'rocks', deco: 'pot', idol: 'statue_big' },
  manor: { wall: 'stone', hall: 'lodge', side: 'house_red', small: 'hut_b', trees: ['plum', 'tree_round'], deco: 'lantern', lion: 1, pond: 1 },
  ice: { wall: 'stone', hall: 'lodge', side: 'wood_b', small: 'wood_b', trees: ['tree_snow', 'boulder_w'], deco: 'lantern', lion: 1 },
  water: { wall: 'wood', hall: 'wood_b', side: 'wood_o', small: 'hut_o2', trees: ['tree_round', 'bush3'], deco: 'jar' },
  fort: { wall: 'wood', hall: 'wood_b', side: 'mud', small: 'wood_o', trees: ['tree_dead', 'grove_dead'], deco: 'boulder_b' },
  slum: { wall: 'fence', hall: 'straw', side: 'mud', small: 'straw', trees: ['tree_big', 'bush3'], deco: 'jar' },
  dark: { wall: 'stone', hall: 'hall', side: 'lodge', small: 'mud', trees: ['tree_dead', 'grove_dead'], rock: 'rocks', deco: 'boulder_b', idol: 'statue_big' },
  city: { wall: 'stone', hall: 'hall', deco: 'lantern' },
};
function compound(l) {
  const tx = Math.round(l.px[0] * K), ty = Math.round(l.px[1] * K), sh = shape(l), sty = styleOf(l), [rx, ry] = SIZE[sh], g = m.g, x0 = tx - rx, x1 = tx + rx, y0 = ty - ry, y1 = ty;
  const fid = sty === 'city' ? 'gwan' : flagOf(l.id) || flagOf(l.map), L = LOOK[sty] || LOOK.dao, R = (k) => hash(tx, ty, k);
  // 터를 고르고 둘레에 길을 낸다. 어느 쪽에서 오든 정문으로 돌아 들어간다
  reserve(x0 - 4, y0 - 5, x1 + 4, y1 + 6);
  for (let y = y0 - 1; y <= y1 + 3; y++) for (let x = x0 - 1; x <= x1 + 1; x++) if (g[y]?.[x] !== undefined) { const edge = y === y0 - 1 || y === y1 + 3 || x === x0 - 1 || x === x1 + 1; g[y][x] = edge ? 1 : y > y1 ? 1 : 0; }
  m.label(tx, ty + 4.6, l.name);
  // 밑동 가운데 자리로 놓기
  const at = (name, cx, by, o) => { const s = STAMPS[name]; if (s) m.put(name, cx - s[3] / 32, by - s[4] / TS, o); };
  const stone = (ax, ay, bx, by) => { if (isoMode() && bx - ax > 2) { m.paveDiamond((ax + bx + 1) / 2, (ay + by + 1) / 2, (bx - ax + 1) / 2 + 1); return; } for (let y = ay; y <= by; y++) for (let x = ax; x <= bx; x++) if (g[y]?.[x] !== undefined) g[y][x] = 3; };
  // 담: 가로는 양끝 마구리와 이음매 없는 가운데, 세로는 용마루. 정문 자리만 비운다
  const ISO = isoMode();
  const wall = (X0, Y0, X1, Y1, kind, gap) => {
    if (ISO) { const k = kind === 'wood' ? 'palisade' : kind === 'fence' ? 'fence' : 'wall_tile', n = Math.max(2, Math.round((X1 - X0) / 4)); m.isoWall(k, tx - 2.2, Y1 + .8, n, 'l').isoWall(k, tx + 2.2, Y1 + .8, n, 'r'); return; }
    const [he, hm, v] = kind === 'wood' ? ['wood_h', 'wood_h', 'wood_v'] : kind === 'fence' ? ['fence_h', 'fence_h', 'wood_v'] : ['wall_h', 'wall_m', 'wall_v'];
    const row = (y, a, b) => { for (let x = a; x <= b; x++) m.put(x === a || x === b ? he : hm, x, y); };
    row(Y0, X0, X1); if (gap) { row(Y1, X0, gap[0] - 1); row(Y1, gap[1] + 1, X1); } else row(Y1, X0, X1);
    for (let y = Y0 + 1; y < Y1; y += kind === 'stone' ? 1 : .5) { m.put(v, X0, y, { nosolid: y % 1 !== 0 }); m.put(v, X1, y, { nosolid: y % 1 !== 0 }); }
    m.put(v, X0, Y1 - .4, { nosolid: true }); m.put(v, X1, Y1 - .4, { nosolid: true });
  };
  const gate = (kind) => { if (kind === 'fence') return; m.put('gate_arch', tx - 2, ty - 3, { nosolid: true }); };
  const flags = (by) => { m.flag(fid, tx - 2.35, by, true); m.flag(fid, tx + 2.35, by); };
  const plantIn = (name, cx, by) => at(name, cx, by);
  if (sh === 'mount' || sh === 'dark') {
    const X0 = x0, X1 = x1 - 1, Y0 = y0, Y1 = ty - 1;
    // 뒤로 산자락, 옆으로 나무. 산문을 산에 기대어 앉힌다
    for (const [dx, dy] of [[-8, -.3], [0, -1.4], [8, -.3], [-13, 4], [13, 4]]) at(L.rock || 'rocks', tx + dx, Y0 + dy);
    for (const [dx, dy] of [[-13.5, 9], [13.5, 9], [-13, 13.5], [13, 13.5]]) plantIn(L.trees[(dx + dy + 40) % L.trees.length | 0], tx + dx, Y0 + dy);
    wall(X0, Y0, X1, Y1, L.wall, [tx - 2, tx + 1]); gate(L.wall);
    stone(tx - 1, Y0 + 8, tx, Y1); stone(tx - 4, Y0 + 8, tx + 3, Y0 + 10);
    at(L.hall, tx, Y0 + 8); at(L.side, tx - 6.5, Y0 + 7); at(L.side, tx + 6.5, Y0 + 7); at(L.small, tx - 6.5, Y1 - .6); at(L.small, tx + 6.5, Y1 - .6);
    if (L.idol) at(L.idol, tx - 6.5, Y0 + 10.3), at(L.idol, tx + 6.5, Y0 + 10.3);
    else { plantIn(L.trees[0], tx - 6.5, Y0 + 10.4); plantIn(L.trees[0], tx + 6.5, Y0 + 10.4); }
    for (const y of [Y0 + 12.8, Y1 - .1]) { at(L.deco, tx - 2.2, y); at(L.deco, tx + 2.2, y); }
    m.flag(fid, tx - 2.6, Y0 + 8.7, true); m.flag(fid, tx + 2.6, Y0 + 8.7); flags(ty + .85);
    m.pen(fid, X0 + 1.5, Y0 + 1.6); m.pen(fid, X1 - .5, Y0 + 1.6);
  } else if (sh === 'manor') {
    const X0 = x0, X1 = x1 - 1, Y0 = y0, Y1 = ty - 1;
    for (const [dx, dy] of [[-12.5, 4], [12.5, 4], [-12, 10], [12, 10]]) plantIn(L.trees[(dx > 0 ? 1 : 0)], tx + dx, Y0 + dy);
    wall(X0, Y0, X1, Y1, L.wall, [tx - 2, tx + 1]); gate(L.wall);
    stone(tx - 4, Y0 + 6, tx + 3, Y1); stone(tx - 1, Y1, tx, Y1);
    at(L.hall, tx, Y0 + 6); at(L.side, tx - 6, Y0 + 4.2); at(L.side, tx + 6, Y0 + 4.2); if (!L.pond) at(L.small, tx - 6, Y1 - .5); at(L.small, tx + 6, Y1 - .5);
    if (L.pond) { for (let y = Y1 - 3; y <= Y1 - 2; y++) for (let x = X0 + 2; x <= X0 + 5; x++) g[y][x] = 2; at('rocks', X0 + 6.6, Y1 - 1.2); plantIn(L.trees[0], X1 - 2, Y0 + 7.6); }
    else plantIn(L.trees[0], X0 + 3, Y0 + 7.6), plantIn(L.trees[0], X1 - 2, Y0 + 7.6);
    at(L.deco, tx - 2.2, Y0 + 7.4); at(L.deco, tx + 2.2, Y0 + 7.4);
    if (L.lion) { at('statue', tx - 2.5, ty + .9); at('statue', tx + 2.5, ty + .9); m.flag(fid, tx - 3.7, ty + 1.2, true); m.flag(fid, tx + 3.7, ty + 1.2); } else flags(ty + .85);
    m.flag(fid, tx - 2.4, Y0 + 6.6, true); m.flag(fid, tx + 2.4, Y0 + 6.6); m.pen(fid, X0 + 1.5, Y0 + 1.6); m.pen(fid, X1 - .5, Y0 + 1.6);
  } else if (sh === 'fort' || sh === 'camp') {
    const X0 = x0, X1 = x1 - 1, Y0 = y0, Y1 = ty - 1;
    for (const [dx, dy] of [[-11, 2], [11, 2], [-11.5, 7], [11.5, 7]]) plantIn(L.trees[(dx > 0 ? 1 : 0)], tx + dx, Y0 + dy);
    if (sh === 'camp') { // 개방, 하오문: 낮은 울타리만 두르고 마당을 연다
      wall(X0, Y0, X1, Y1, 'fence', [tx - 2, tx + 1]);
      at(L.hall, tx, Y0 + 4); at(L.side, tx - 5.5, Y0 + 5); at(L.side, tx + 5.5, Y0 + 5); at(L.small, tx - 5, Y1 - .5); at(L.small, tx + 5, Y1 - .5);
      at('pot', tx - 1.2, Y0 + 6.2); at('log', tx + 1.3, Y0 + 6.6); at('stump', tx + 3.8, Y0 + 3.2); at('jar', X1 - 1, Y0 + 2.4);
      flags(ty + .2);
    } else {
      wall(X0, Y0, X1, Y1, 'wood', [tx - 2, tx + 1]);
      at(L.hall, tx, Y0 + 4.2); at(L.side, tx - 5, Y0 + 4.6); at(L.side, tx + 5, Y0 + 4.6); at(L.small, tx - 5, Y1 - .4); at(L.small, tx + 5, Y1 - .4);
      at(L.deco, tx - 2, Y0 + 6.4); at(L.deco, tx + 2, Y0 + 6.4); stone(tx - 1, Y0 + 5, tx, Y1);
      // 망루 대신 장대 깃발. 입구는 통나무 문설주
      m.put('wood_v', tx - 2.2, ty - 1.2, { nosolid: true }); m.put('wood_v', tx + 1.2, ty - 1.2, { nosolid: true });
      flags(ty + .5); m.flag(fid, X0 + .6, Y0 + .9); m.flag(fid, X1 + .4, Y0 + .9, true);
    }
  } else if (sh === 'city') {
    const X0 = x0, X1 = x1 - 1, Y0 = y0, Y1 = ty - 1;
    wall(X0, Y0, X1, Y1, 'stone', [tx - 2, tx + 1]); gate('stone');
    stone(tx - 1, Y0 + 9, tx, Y1); stone(X0 + 1, Y0 + 9, X1 - 1, Y0 + 10); stone(tx - 4, Y0 + 7, tx + 3, Y0 + 8);
    at('hall', tx, Y0 + 8); m.flag('gwan', tx - 2.6, Y0 + 8.7, true); m.flag('gwan', tx + 2.6, Y0 + 8.7);
    const HS = ['house_red', 'shop_green', 'hut_o', 'shop_blue', 'hut_b', 'hut_o2', 'clay', 'wood_b', 'inn'];
    for (const [cx, by] of [[-11, 4], [-6.5, 4], [6.5, 4], [11, 4], [-11, 8.6], [-6.5, 8.6], [6.5, 8.6], [11, 8.6], [-11, 14], [-6.5, 14], [6.5, 14], [11, 14]]) {
      const h = HS[Math.floor(R(cx * 7 + by) * HS.length)]; at(h, tx + cx, Y0 + by);
      if (h === 'inn' || (cx === -6.5 && by === 14)) at('banner4', tx + cx + 2.4, Y0 + by + .1);
    }
    for (const x of [tx - 3, tx + 3]) at('lantern', x, Y0 + 13.6);
    flags(ty + .85); m.pen('gwan', X0 + 1.5, Y0 + 1.6); m.pen('gwan', X1 - .5, Y0 + 1.6);
  } else if (sh === 'village') { m.put('hut_o', tx - 8, ty - 7); m.put('house_red', tx - 3, ty - 8); m.put('hut_b', tx + 3, ty - 7); m.put('hut_o2', tx - 7, ty - 3); m.put('shop_green', tx + 2, ty - 3); m.put('banner4', tx + .6, ty - 6.6, { nosolid: true }); }
  else if (sh === 'hamlet') { m.put('hut_o', tx - 4, ty - 4); m.put('straw', tx + 1, ty - 4); }
  else m.put('gate_arch', tx - 2, ty - 3, { nosolid: true });
  m.exit(tx - 2, ty - 1, 4, 1, l.map, l.at[0], l.at[1], 1, { world: true, when: l.need, lock: l.need ? '지금 갈 만한 까닭이 없다.' : undefined });
}
// 바닥 경계: 칸 경계를 따라 네모나게 갈리지 않게, 점마다 잡음만큼 흔든 자리의 바닥을 가져온다
let TEXD = {}, NX = null, NY = null, PATHD = null;
function texData(key, t = IMG['ground/' + key]) { // 바닥 그림을 칸 크기로 줄인 점 자료. L점마다 되풀이
  if (TEXD[key] !== undefined) return TEXD[key]; if (!t) return TEXD[key] = null;
  const k = (t.hd || 1) * TS, L = Math.floor(t.width / k) * TS, c = document.createElement('canvas'); c.width = c.height = L; const x = c.getContext('2d');
  x.drawImage(t, 0, 0, Math.floor(t.width / k) * k, Math.floor(t.width / k) * k, 0, 0, L, L); return TEXD[key] = { d: x.getImageData(0, 0, L, L).data, L };
}
function noiseTables() { // 128점마다 되풀이되는 부드러운 잡음 두 장(가로, 세로 흔들림)
  if (NX) return; NX = new Float32Array(128 * 128); NY = new Float32Array(128 * 128);
  const L = (k, i, j) => hash(i & 15, j & 15, k);
  for (const [A, k] of [[NX, 70], [NY, 71]]) for (let y = 0; y < 128; y++) for (let x = 0; x < 128; x++) {
    const X = x / 8, Y = y / 8, i = Math.floor(X), j = Math.floor(Y), u = X - i, v = Y - j, su = u * u * (3 - 2 * u), sv = v * v * (3 - 2 * v);
    const a = L(k, i, j), b = L(k, i + 1, j), c = L(k, i, j + 1), d = L(k, i + 1, j + 1), sm = a + (b - a) * su + (c - a) * sv + (a - b - c + d) * su * sv;
    const X2 = x / 4, Y2 = y / 4, i2 = Math.floor(X2), j2 = Math.floor(Y2), u2 = X2 - i2, v2 = Y2 - j2, s2u = u2 * u2 * (3 - 2 * u2), s2v = v2 * v2 * (3 - 2 * v2), L2 = (p, q) => hash(p & 31, q & 31, k + 5);
    const a2 = L2(i2, j2), b2 = L2(i2 + 1, j2), c2 = L2(i2, j2 + 1), d2 = L2(i2 + 1, j2 + 1), sm2 = a2 + (b2 - a2) * s2u + (c2 - a2) * s2v + (a2 - b2 - c2 + d2) * s2u * s2v;
    A[y * 128 + x] = (sm * .72 + sm2 * .28 - .5) * 1.5; // 잡티 없는 둥근 굴곡. 경계가 매끈한 덩어리로 갈린다
  }
}
function pathDark() { // 황토 땅 위의 길은 색이 비슷해 안 보인다. 짙게 눌러 쓴다
  if (PATHD) return PATHD; const P = IMG['ground/path']; if (!P) return null; const c = document.createElement('canvas'); c.width = P.width; c.height = P.height; const x = c.getContext('2d');
  x.drawImage(P, 0, 0); x.globalCompositeOperation = 'multiply'; x.fillStyle = '#a08772'; x.fillRect(0, 0, c.width, c.height); x.globalCompositeOperation = 'destination-in'; x.drawImage(P, 0, 0); c.hd = P.hd; return PATHD = c;
}
const PRI = [4, 5, 1, 3, 2, 3.5]; // 바닥 높낮이: grass, deep, sand, plain, snow, dusk
const DECAL = { grass: [['bush1', 'bush2', 'fern1', 'bush1', 'fern2'], .1, ['flower1', 'flower2', 'flower3', 'flower4', 'fern1']], plain: [['bush1', 'bush4', 'fern2', 'bush2', 'fern1', 'bush1'], .13, ['flower2', 'flower3', 'fern2', 'bush4']], deep: [['fern1', 'fern2', 'bush4', 'fern1'], .09], sand: [['bush3'], .014], snow: [[], 0], dusk: [['bush3'], .012] };
// 땅 칠하기: 바닥 텍스처, 바닥끼리와 길과 물가의 점 단위 경계, 얼룩, 돌바닥 턱. 강호 조각과 마을 지도가 같이 쓴다
// (X0, Y0)부터 NW×NH칸을 x에 칠한다. g는 바닥 갈래, Bm은 칸마다 바닥 이름 번호(BN), 지도 크기 MW×MH
function paintArea(x, X0, Y0, NW, NH, g, Bm, MW, MH) {
  const mixed = [], calm = new Set();
  const at = (a, b) => { if (b < 0 || b >= MH || a < 0 || a >= MW) return -1; const v = g[b][a]; return v === 6 ? 0 : v; };
  const bio = (a, b) => (b < 0 || b >= MH || a < 0 || a >= MW) ? -1 : Bm[b][a];
  for (let ty = Y0; ty < Y0 + NH; ty++) for (let tx = X0; tx < X0 + NW; tx++) {
    const v = at(tx, ty), X = (tx - X0) * TS, Y = (ty - Y0) * TS, bi = Bm[ty][tx], bn = BN[bi];
    const same = (q, r) => { const u = at(q, r); return u === v || u === -1 || (v !== 0 && u === 4); }, mk = (same(tx, ty - 1) ? 1 : 0) | (same(tx + 1, ty) ? 2 : 0) | (same(tx, ty + 1) ? 4 : 0) | (same(tx - 1, ty) ? 8 : 0);
    const P = IMG['ground/path']; if (v === 1 && bn === 'sand' && pathDark()) IMG['ground/path'] = PATHD;
    texTile(x, bn, v, mk, tx, ty, X, Y); IMG['ground/path'] = P;
    if (v > 2) continue;
    let mix = false, shore = false, fixd = false;
    for (let q = -1; q <= 1; q++) for (let p = -1; p <= 1; p++) { const u = at(tx + p, ty + q); if (u < 0) continue; if (u > 2) fixd = true; else if (u !== v) shore = true; if (Bm[ty + q][tx + p] !== bi) mix = true; }
    if (fixd) { if (v === 0 && shore) calm.add(tx + ty * MW); continue; } // 다리, 돌바닥 곁은 칸 그림 그대로
    if (shore && v === 0) calm.add(tx + ty * MW);
    if (mix || shore) mixed.push(tx, ty);
  }
  // 바닥, 길, 물이 갈리는 칸은 점 단위로 다시 칠한다. 물가와 길섶은 칸 중심 사이를 이어 둥글게 돈다
  const N = NW * TS, NHp = NH * TS, img = x.getImageData(0, 0, N, NHp), D = img.data, ox = X0 * TS, oy = Y0 * TS, PB = new Int8Array(N * NHp).fill(-1);
  for (let ty = 0; ty < NH; ty++) for (let tx = 0; tx < NW; tx++) { const gx = X0 + tx, gy = Y0 + ty; if (at(gx, gy) !== 0 || calm.has(gx + gy * MW)) continue; const b = Bm[gy][gx]; for (let py = 0; py < TS; py++) PB.fill(b, (ty * TS + py) * N + tx * TS, (ty * TS + py) * N + tx * TS + TS); }
  if (mixed.length) {
    noiseTables(); const W = TS + 4, K2 = new Int8Array(W * W), BI = new Int8Array(W * W);
    const sc = (a, b) => { a = Math.min(MW - 1, Math.max(0, a)); b = Math.min(MH - 1, Math.max(0, b)); const u = at(a, b); return u > 2 ? -1 : u; };
    const kindAt = (wx, wy) => { // 0 바닥, 1 길, 2 물
      const fx = wx / TS - .5, fy = wy / TS - .5, i = Math.floor(fx), j = Math.floor(fy), u = fx - i, w = fy - j, n = (wx & 127) + (wy & 127) * 128;
      const a = sc(i, j), b = sc(i + 1, j), c = sc(i, j + 1), d = sc(i + 1, j + 1), wt = [(1 - u) * (1 - w), u * (1 - w), (1 - u) * w, u * w], ks = [a, b, c, d];
      let pw = 0, pp = 0; for (let t = 0; t < 4; t++) { if (ks[t] === 2) pw += wt[t]; else if (ks[t] === 1) pp += wt[t]; }
      const own = sc(Math.round(fx), Math.round(fy));
      if (pp + NX[n] * .14 > .5 && (own === 1 || pw + NY[n] * .3 <= .5)) return 1; if (pw + NY[n] * .3 > .5) return 2; return 0;
    };
    const bioAt = (wx, wy) => { const n = (wx & 127) + (wy & 127) * 128; return Bm[Math.min(MH - 1, Math.max(0, Math.round(wy / TS - .5 + NY[n])))][Math.min(MW - 1, Math.max(0, Math.round(wx / TS - .5 + NX[n])))]; };
    const PD = pathDark() ? texData('pathd', PATHD) : null, PT = texData('path'), WT = texData('water');
    for (let i = 0; i < mixed.length; i += 2) {
      const tx = mixed[i], ty = mixed[i + 1];
      for (let py = -2; py < TS + 2; py++) for (let px = -2; px < TS + 2; px++) { const wx = tx * TS + px, wy = ty * TS + py, j = (py + 2) * W + px + 2; K2[j] = kindAt(wx, wy); BI[j] = bioAt(wx, wy); }
      for (let py = 0; py < TS; py++) for (let px = 0; px < TS; px++) {
        const wx = tx * TS + px, wy = ty * TS + py, j = (py + 2) * W + px + 2, k = K2[j], di = ((wy - oy) * N + (wx - ox)) * 4;
        const n1 = [K2[j - 1], K2[j + 1], K2[j - W], K2[j + W]], n2 = [K2[j - 2], K2[j + 2], K2[j - 2 * W], K2[j + 2 * W], K2[j - W - 1], K2[j - W + 1], K2[j + W - 1], K2[j + W + 1]];
        const bn = BN[BI[j]], T2 = k === 2 ? WT : k === 1 ? (bn === 'sand' && PD ? PD : PT) : texData(bn); if (!T2) continue;
        const si = ((wy % T2.L) * T2.L + (wx % T2.L)) * 4; let r = T2.d[si], gg = T2.d[si + 1], bb = T2.d[si + 2];
        if (k === 2) { if (n1.some(q => q !== 2)) r = gg = bb = 255; else if (n2.some(q => q !== 2) && hash(wx, wy, 31) < .45) { r = (r + 255) >> 1; gg = (gg + 255) >> 1; bb = (bb + 255) >> 1; } }
        else if (n1.includes(2) || n2.includes(2)) { r = 150; gg = 83; bb = 64; }
        else if (k === 1 && n1.includes(0)) { r = r * .64 | 0; gg = gg * .64 | 0; bb = bb * .62 | 0; }
        else if (k === 0) { // 바닥끼리 갈리는 자리: 높은 쪽(숲, 풀)에 진한 테두리 한 점, 낮은 쪽에 옅은 그늘
          const me = PRI[BI[j]]; let hi = false, lo = false; for (const q of [j - 1, j + 1, j - W, j + W]) { if (K2[q] !== 0 || BI[q] === BI[j]) continue; if (PRI[BI[q]] < me) hi = true; else lo = true; }
          if (hi) { r = r * .66 | 0; gg = gg * .7 | 0; bb = bb * .66 | 0; } else if (lo) { r = r * .9 | 0; gg = gg * .9 | 0; bb = bb * .88 | 0; }
        }
        D[di] = r; D[di + 1] = gg; D[di + 2] = bb; D[di + 3] = 255; PB[di >> 2] = k === 0 && !n1.includes(2) && !n2.includes(2) ? BI[j] : -1;
      }
    }
  }
  mottle(D, N, NHp, ox, oy, (px, py) => { const b = PB[py * N + px]; return b < 0 ? null : BN[b]; });
  x.putImageData(img, 0, 0);
  curbs(x, g, { x0: X0, y0: Y0, x1: X0 + NW, y1: Y0 + NH, ox: -X0 * TS, oy: -Y0 * TS });
  return calm;
}

function chunk(cx, cy) {
  const k = cx + ',' + cy; let e = chunks.get(k); if (e) { e.t = G.field.t; return e.c; }
  if (chunks.size >= 24) { let old = null; for (const [q, v] of chunks) if (!old || v.t < chunks.get(old).t) old = q; chunks.delete(old); }
  const c = document.createElement('canvas'); c.width = c.height = CH * TS; const x = c.getContext('2d', { willReadFrequently: true }), g = m.g;
  const at = (a, b) => { if (b < 0 || b >= WH || a < 0 || a >= WW) return -1; const v = g[b][a]; return v === 6 ? 0 : v; };
  const calm = paintArea(x, cx * CH, cy * CH, Math.min(CH, WW - cx * CH), Math.min(CH, WH - cy * CH), g, B, WW, WH);
  if (m.pave) { const X = cx * CH * TS, Y = cy * CH * TS, N = CH * TS; x.save(); x.translate(-X, -Y); for (const p of m.pave) { const xs = p.poly.map(q => q[0]), ys = p.poly.map(q => q[1]); if (Math.max(...xs) < X || Math.min(...xs) > X + N || Math.max(...ys) < Y || Math.min(...ys) > Y + N) continue; paintPave(x, p); } x.restore(); }
  for (let ty = cy * CH; ty < Math.min(WH, (cy + 1) * CH); ty++) for (let tx = cx * CH; tx < Math.min(WW, (cx + 1) * CH); tx++) {
    const v = at(tx, ty), X = (tx - cx * CH) * TS, Y = (ty - cy * CH) * TS, bn = BN[B[ty][tx]]; if (v !== 0 || calm.has(tx + ty * WW)) continue;
    // 풀포기와 꽃. 꽃은 무리 지어 핀다
    const D = DECAL[bn], cl = T[ty * WW + tx]; if (!D || cl === INN) continue;
    const patch = D[2] && vn(tx, ty, 13, 21) > .7, dens = patch ? .3 : D[1] * (.35 + 1.3 * vn(tx, ty, 9, 22)), L = patch ? D[2] : D[0];
    if (L.length && hash(tx, ty, 23) < dens) drawStamp(x, L[Math.floor(hash(tx, ty, 24) * L.length)], X + Math.floor(hash(tx, ty, 25) * 5) - 2, Y + Math.floor(hash(tx, ty, 26) * 5) - 3);
  }
  chunks.set(k, { c, t: G.field.t }); return c;
}
function ground(c, cam) {
  const s = CH * TS, x0 = Math.max(0, Math.floor(cam.x / s)), y0 = Math.max(0, Math.floor(cam.y / s)), x1 = Math.min(Math.ceil(WW / CH) - 1, Math.floor((cam.x + VW) / s)), y1 = Math.min(Math.ceil(WH / CH) - 1, Math.floor((cam.y + VH) / s));
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) c.drawImage(chunk(x, y), x * s, y * s);
}
// 전도. 메뉴 지도와 작은 지도가 함께 쓴다
let ROADMAP = null;
function roadLayer() { // 강호의 길을 지도에 얹을 한 장. 칸 하나가 점 하나
  if (ROADMAP || !T) return ROADMAP; const c = document.createElement('canvas'); c.width = WW; c.height = WH; const x = c.getContext('2d'), d = x.createImageData(WW, WH);
  for (let i = 0; i < WW * WH; i++) { const v = T[i]; if (v === ROAD || v === BRIDGE || v === INN) { d.data[i * 4] = 110; d.data[i * 4 + 1] = 62; d.data[i * 4 + 2] = 30; d.data[i * 4 + 3] = v === BRIDGE ? 150 : 205; } }
  x.putImageData(d, 0, 0); return ROADMAP = c;
}
function china(c, W, H, o = {}) {
  const sx = W / 804, sy = H / 658, P = (x, y) => [x * sx, y * sy], art = IMG['world/map'] || IMG['world/concept'];
  if (art) { c.imageSmoothingEnabled = true; c.imageSmoothingQuality = 'high'; c.drawImage(art, 0, 0, W, H); } else { c.fillStyle = '#e6d6b2'; c.fillRect(0, 0, W, H); }
  if (!o.mini && ready && roadLayer()) c.drawImage(ROADMAP, 0, 0, W, H);
  if (o.mini) { c.fillStyle = '#2a2018'; for (const l of LOCS) { const [a, b] = P(...l.px); c.fillRect(a - 1, b - 1, 2, 2); } return; }
  c.textAlign = 'center'; const seen = G.S.seen || {}, free = G.S.mode === 'free', F = G.S.flags;
  // 지방 이름은 땅 이름처럼 옅고 크게. 고을 표식과 겹치는 자리면 빼 둔다
  c.font = '22px Galmuri11, sans-serif'; c.lineJoin = 'round'; for (const [n, x, y] of PROV) { const [a, b] = P(x, y); if (!o.mini && LOCS.some(l => (free || !l.need || F[l.need]) && Math.abs(l.px[0] * sx - a) < 34 && Math.abs(l.px[1] * sy - b) < 22)) continue; c.lineWidth = 4; c.strokeStyle = 'rgba(40,28,16,.35)'; c.strokeText(n, a, b); c.fillStyle = 'rgba(255,244,214,.62)'; c.fillText(n, a, b); }
  if (!ready) { c.strokeStyle = 'rgba(122,90,58,.5)'; c.lineWidth = 2; for (const [a, b] of ROADS) { const p = LOCS.find(q => q.id === a), q = LOCS.find(z => z.id === b); if (!free && (p.need && !F[p.need] || q.need && !F[q.need])) continue; const [x0, y0] = P(...p.px), [x1, y1] = P(...q.px); c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke(); } }
  // 표식과 이름표. 이름표끼리 겹치면 자리를 옮기고, 그래도 겹치면 이름은 빼고 표식만 둔다(손을 대면 이름이 뜬다)
  const COL = { sect: '#3f73c4', evil: '#c8483a', out: '#7a4fb0', city: '#2a2018', old: '#b08a3a' }, ICON = { sect: 'map/sect', evil: 'map/evil', out: 'map/out', city: 'map/city', old: 'map/old' }; hits = [];
  const fs = Math.round(15 * Math.max(1, W / 1206)); c.font = `${fs}px Galmuri11Bold, Galmuri14, sans-serif`; c.textBaseline = 'middle';
  const list = LOCS.filter(l => free || !l.need || F[l.need]).map(l => { const [x, y] = P(...l.px), me = l.map === G.S.map || l.map === o.here, k = !!seen[l.map]; return { l, x, y, me, k, pr: me ? 0 : k ? 1 : l.kind === 'city' ? 2 : 3 }; }).sort((a, b) => a.pr - b.pr);
  const boxes = [], hitBox = b => boxes.some(q => b[0] < q[2] && b[2] > q[0] && b[1] < q[3] && b[3] > q[1]);
  for (const q of list) boxes.push([q.x - 7, q.y - 7, q.x + 7, q.y + 7]);
  for (const q of list) {
    const { l, x, y, me, k } = q, col = COL[l.color || l.kind] || '#3f73c4', ic = IMG[ICON[l.kind] || ''];
    if (ic) { const h = 30, w = ic.width / ic.height * h; c.globalAlpha = k || me ? 1 : .55; c.drawImage(ic, x - w / 2, y - h + 8, w, h); c.globalAlpha = 1; }
    else { c.save(); c.translate(x, y); c.rotate(Math.PI / 4); c.fillStyle = '#2a2018'; c.fillRect(-7, -7, 14, 14); c.fillStyle = me ? '#ff3b2c' : k ? col : '#b8a888'; c.fillRect(-5, -5, 10, 10); c.restore(); }
    hits.push({ l, x, y, k });
    const tw = c.measureText(l.name).width + 10, th = fs + 6;
    for (const [dx, dy] of [[0, 8 + th / 2], [0, -8 - th / 2], [tw / 2 + 9, 0], [-tw / 2 - 9, 0], [tw / 2 + 4, 8 + th / 2], [-tw / 2 - 4, 8 + th / 2], [tw / 2 + 4, -8 - th / 2], [-tw / 2 - 4, -8 - th / 2]]) {
      const b = [x + dx - tw / 2, y + dy - th / 2, x + dx + tw / 2, y + dy + th / 2]; if (hitBox(b) || b[0] < 0 || b[2] > W || b[1] < 0 || b[3] > H) continue;
      boxes.push(b); c.fillStyle = me ? 'rgba(122,26,18,.92)' : k ? 'rgba(244,232,204,.92)' : 'rgba(210,196,168,.78)'; c.fillRect(b[0], b[1], tw, th);
      c.strokeStyle = me ? '#ffd27a' : k ? col : 'rgba(90,70,50,.6)'; c.lineWidth = 2; c.strokeRect(b[0] + 1, b[1] + 1, tw - 2, th - 2);
      c.fillStyle = me ? '#fff4d6' : k ? '#2a2018' : '#6a5a44'; c.fillText(l.name, x + dx, y + dy + 1); break;
    }
  }
  c.textBaseline = 'alphabetic';
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
const GROUND = { grass: [['herb', 'fern1'], ['wood', 'stump'], ['honey', 'flower4']], plain: [['herb', 'fern1'], ['wood', 'stump'], ['honey', 'flower4']], deep: [['herb', 'fern1'], ['wood', 'stump'], ['ginseng', 'flower1'], ['shoot', 'fern2']], sand: [['ore_iron', 'boulder']], rose: [['ore_iron', 'boulder']], snow: [['ore_blue', 'boulder_w'], ['herb', 'fern1']], dusk: [['ore_iron', 'boulder_b'], ['ore_star', 'boulder_b'], ['jade', 'boulder_b']] };
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
  f.m.arena = { grass: 'village', deep: 'forest', sand: 'sand', plain: 'village', snow: 'snow', dusk: 'fort' }[b]; f.m.ambient = b === 'snow' ? 'snow' : b === 'deep' ? 'leaf' : null;
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
// 맵 끝에 닿은 길이 아무 데로도 안 가면 출구를 단다. 강호 자리가 있는 맵은 강호로, 아니면 그 맵에서 나가는 곳으로
function linkEdges(mp) {
  if (!mp || mp.room || mp.live || mp._linked || !mp.g || mp.id === 'mysect' || mp.id === 'myhouse') return; mp._linked = true;
  const walk = v => v === 1 || v === 3 || (mp.walkOn || []).includes(v), inP = (x, y) => mp.portals.some(q => x * TS + 8 >= q.x - 8 && x * TS + 8 <= q.x + q.w + 8 && y * TS + 8 >= q.y - 8 && y * TS + 8 <= q.y + q.h + 8);
  const l = LOCS.find(q => q.map === mp.id), back = mp.portals.find(q => !q.door && q.to !== mp.id && (q.x <= 2 || q.y <= 2 || q.x + q.w >= mp.w * TS - 2 || q.y + q.h >= mp.h * TS - 2)) || mp.portals.find(q => !q.door && q.to !== mp.id);
  let dest = null;
  if (l) { const [wx, wy] = entry(mp.id); dest = ['world', wx, wy, 0, { world: true, when: 'world_open', lock: '아직 먼 길을 나설 때가 아니다.' }]; }
  else if (back) dest = [back.to, back.tx, back.ty, back.dir, { when: back.when, lock: back.lock, world: back.world }];
  if (!dest) return;
  // 걸어서 닿는 가장 큰 땅(담 안 마을)과 이어진 가장자리에만 출구를 낸다. 담 밖 가장자리에 길이 깔려 있어도 거기엔 내지 않는다
  // 맨 가장자리 줄은 빼고 본다(담 밖 가장자리를 빙 돌아 이어지는 것을 막는다). 가장자리 칸은 바로 안쪽 칸이 그 땅에 들면 출구가 된다
  const W = mp.w, H = mp.h, free = (x, y) => x > 0 && y > 0 && x < W - 1 && y < H - 1 && !mp.blocked(x * TS + 8, y * TS + 10), lab = new Int32Array(W * H).fill(-1), sz = []; let main = -1;
  for (let i = 0; i < W * H; i++) { if (lab[i] >= 0 || !free(i % W, Math.floor(i / W))) continue; const n = sz.length, Q = [i]; lab[i] = n; let c = 0; while (Q.length) { const k = Q.pop(), x = k % W, y = (k - x) / W; c++; for (const [X, Y] of [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]]) { if (X < 0 || Y < 0 || X >= W || Y >= H) continue; const j = Y * W + X; if (lab[j] < 0 && free(X, Y)) { lab[j] = n; Q.push(j); } } } sz.push(c); if (main < 0 || c > sz[main]) main = n; }
  const side = (n, f, put) => { let a = -1; for (let i = 0; i <= n; i++) { const ok = i < n && (([x, y]) => walk(mp.g[y]?.[x]) && !inP(x, y) && !mp.blocked(x * TS + 8, y * TS + 10) && lab[Math.min(H - 2, Math.max(1, y)) * W + Math.min(W - 2, Math.max(1, x))] === main)(f(i)); if (ok && a < 0) a = i; if (!ok && a >= 0) { put(a, i - a); a = -1; } } };
  const ex = (x, y, w, h) => mp.portals.push({ x: x * TS, y: y * TS, w: w * TS, h: h * TS, to: dest[0], tx: dest[1], ty: dest[2], dir: dest[3], ...dest[4] }); // 칸 번호 그대로(넓힌 지도여도)
  side(mp.w, x => [x, mp.h - 1], (a, n) => ex(a, mp.h - 1, n, 1)); side(mp.w, x => [x, 0], (a, n) => ex(a, 0, n, 1));
  side(mp.h, y => [0, y], (a, n) => ex(0, a, 1, n)); side(mp.h, y => [mp.w - 1, y], (a, n) => ex(mp.w - 1, a, 1, n));
}
const entry = id => { const l = LOCS.find(q => q.map === id); return l ? [Math.round(l.px[0] * K) + .5, Math.round(l.px[1] * K) + 3.5] : [Math.round(598 * K), Math.round(440 * K)]; };
Story.providers.push(id => id === 'world' && ready ? { npcs: npcsAt(), spots: [], trigs: [], roam: [] } : { npcs: [], spots: [], trigs: [], roam: [] });
G.world = { linkEdges, paintArea, BN, wildAround: px => wildAround(px, 12) || [null, null], here: whereAmI, ensure, build: buildWorld, ground, china, tick, travelBar, entry, objsNear, K, open: openW, size: [WW, WH] };
