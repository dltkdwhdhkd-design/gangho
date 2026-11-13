// 지도. 타일 단위로 길과 물을 깔고 소품을 얹는다.
import { G, TS, rint, pick, IMG } from './core.js';
import { FURN, HOUSES } from './items.js';
const DOORED = ['hall', 'lodge', 'house_red', 'inn', 'hut_o', 'hut_b', 'hut_o2', 'shop_blue', 'shop_green', 'clay', 'wood_o', 'wood_b', 'mud', 'straw'];  // base.js autoDoors와 같은 목록
import { STAMPS, drawStamp, paintGround, paintRoom, curbs, mottle } from './tiles.js';
import { meta, corners, hitsBox, drawIso } from './iso.js';
import { buildIsoRoom } from './isoroom.js';
import { buildIsoOut } from './isoout.js';
import './isoprops.js';

// 쿼터뷰로 눕히지 않는 지도: 강호 전도, 내가 짓는 문파(위에서 내려다보며 놓는다)
const FLATMAP = new Set(['world', 'mysect', 'isotest']);
class MapDef {
  constructor(id, w, h, o = {}) {
    const k = o.k ?? 1;
    Object.assign(this, { id, w: Math.round(w * k), h: Math.round(h * k), k, biome: 'grass', name: '', bgm: 'village', arena: 'village', stamps: [], solids: [], portals: [], tint: null, room: false, encounters: null, ...o });
    this.w = Math.round(w * k); this.h = Math.round(h * k); this.k = k;
    this.g = Array.from({ length: this.h }, () => new Array(this.w).fill(0));
  }
  road(x0, y0, x1, y1, wd = 2) { const k = this.k; if (k !== 1) { x0 = Math.round(x0 * k); y0 = Math.round(y0 * k); x1 = Math.round(x1 * k); y1 = Math.round(y1 * k); wd = Math.max(1, Math.round(wd * k)); } return this.roadRaw(x0, y0, x1, y1, wd); }
  roadRaw(x0, y0, x1, y1, wd = 2) { for (let y = Math.min(y0, y1); y <= Math.max(y0, y1) + (y0 === y1 ? wd - 1 : 0); y++) for (let x = Math.min(x0, x1); x <= Math.max(x0, x1) + (x0 === x1 ? wd - 1 : 0); x++) if (this.g[y] && this.g[y][x] !== undefined && this.g[y][x] !== 2) this.g[y][x] = 1; return this; }
  fill(x0, y0, w, h, v) { const k = this.k; if (k !== 1) { const a = Math.round(x0 * k), b = Math.round(y0 * k); w = Math.round((x0 + w) * k) - a; h = Math.round((y0 + h) * k) - b; x0 = a; y0 = b; } return this.fillRaw(x0, y0, w, h, v); }
  fillRaw(x0, y0, w, h, v) { for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) if (this.g[y] && this.g[y][x] !== undefined) this.g[y][x] = v; return this; }
  water(x, y, w, h) { return this.fill(x, y, w, h, 2); }
  // 땅 높낮이(새 화면이 그린다). 칸마다 높이 단(0이 보통 땅, 한 단은 사람 키의 6할쯤). 계단 칸(stair: 높은 쪽 방향)은 비탈로 잇는다.
  // 걷기는 따로 바꾸지 않는다: 높이가 다른 걸을 수 있는 칸 사이(계단이 아닌 곳)에 얇은 막힘을 넣는 것(heightEdges)으로 끝낸다
  terrace(x, y, w, h, lv) { const k = this.k; if (k !== 1) { const a = Math.round(x * k), b = Math.round(y * k); w = Math.round((x + w) * k) - a; h = Math.round((y + h) * k) - b; x = a; y = b; }
    this.hgt ||= this.g.map(r => r.map(() => 0)); for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) if (this.hgt[j] && this.hgt[j][i] !== undefined) this.hgt[j][i] = lv; return this; }
  stairs(x, y, w, h, up = 'n') { const k = this.k; if (k !== 1) { const a = Math.round(x * k), b = Math.round(y * k); w = Math.round((x + w) * k) - a; h = Math.max(1, Math.round((y + h) * k) - b); x = a; y = b; }
    this.stair ||= {}; for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) this.stair[i + ',' + j] = up; return this; }
  heightEdges() {
    const H = this.hgt, st = this.stair || {}, walk = (x, y) => this.g[y]?.[x] !== undefined && this.g[y][x] !== 2;
    for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) for (const [dx, dy] of [[1, 0], [0, 1]]) {
      const X = x + dx, Y = y + dy; if (!walk(x, y) || !walk(X, Y)) continue;  // 계단은 위아래로만 오르내리고 옆으로는 못 들어간다
      const a = !!st[x + ',' + y], b = !!st[X + ',' + Y], diff = H[y][x] !== H[Y][X];
      if (dx ? (diff || a !== b) : (diff && !a && !b)) this.solids.push(dx ? { x: X * TS - 2, y: y * TS, w: 4, h: TS } : { x: x * TS, y: Y * TS - 2, w: TS, h: 4 });
    }
    return this;
  }
  put(name, tx, ty, o = {}) {
    const s = STAMPS[name], px = tx * this.k * TS + (o.dx || 0), py = ty * this.k * TS + (o.dy || 0);
    if (!s) { console.warn('소품 없음', name); return this; }
    const sc = o.sc || 1;  // sc: 줄여 그리기(쿼터뷰 마을의 정면 소품). 막힘 상자도 같이 줄인다
    this.stamps.push({ name, x: px, y: py, base: py + s[4] * sc - (o.lift || 0), flat: o.flat, ...(sc !== 1 ? { sc, w: s[3] * sc } : {}), ...(o.isoAs ? { isoAs: o.isoAs } : {}) });
    if (s.length > 5 && !o.nosolid) { const sol = { x: px + s[5] * sc, y: py + s[6] * sc, w: s[7] * sc, h: s[8] * sc }; this.solids.push(sol); Object.defineProperty(this.stamps.at(-1), 'sol', { value: sol }); }
    return this;
  }
  // 줄지어 놓기. 넓힌 지도에서 한 칸짜리를 촘촘히 잇던 줄(담, 목책)은 조각을 더 넣어 틈이 생기지 않게 한다
  row(name, tx, ty, n, step = 1, o = {}) { const k = step === 1 ? this.k : 1, N = Math.ceil(n * k - (k - 1)); for (let i = 0; i < N; i++) this.put(name, tx + i * step / k, ty, o); return this; }
  col(name, tx, ty, n, step = 1, o = {}) { const k = step === 1 ? this.k : 1, N = Math.ceil(n * k - (k - 1)); for (let i = 0; i < N; i++) this.put(name, tx, ty + i * step / k, o); return this; }
  solid(tx, ty, w, h) { const k = this.k; this.solids.push({ x: tx * k * TS, y: ty * k * TS, w: w * TS, h: h * TS }); return this; }
  // 건물 입구: 스탬프 아래쪽 가운데에 포탈을 만든다
  house(name, tx, ty, to, ex, ey, dir = 1, o = {}) {
    this.put(name, tx, ty, o); const s = STAMPS[name], cx = tx * this.k * TS + s[3] / 2 + (o.doorDx || 0), by = ty * this.k * TS + s[4];
    this.portals.push({ x: cx - 9, y: by - 4, w: 18, h: 9, to, tx: ex, ty: ey, dir, door: true, when: o.when, lock: o.lock });
    return this;
  }
  exit(tx, ty, w, h, to, ex, ey, dir, o = {}) { const k = this.k, X = Math.round(tx * k * TS), Y = Math.round(ty * k * TS); this.portals.push({ x: X, y: Y, w: Math.round((tx + w) * k * TS) - X, h: Math.round((ty + h) * k * TS) - Y, to, tx: ex, ty: ey, dir, ...o }); return this; }
  // 쿼터뷰 담: (x, y) 앞 끝에서 n칸. dir 'l'이면 왼쪽 위로, 'r'이면 오른쪽 위로 뻗는다
  // 담 잇기: 한 조각이 여러 칸 길이로 그려져 있으면 그 길이만큼 건너뛰며 잇고, 그림의 밑선 기울기를 따른다
  isoWall(name, x, y, n, dir = 'l', o = {}) {
    const q = meta(name, dir === 'r'); if (!q) return this; const len = Math.max(1, dir === 'r' ? q.fh : q.fw), sl = (dir === 'r' ? q.rs : q.ls) ?? .5;
    let X = x * this.k, Y = y * this.k; for (let i = 0; i < n; i += len) { this.isoAt(name, X, Y, { ...o, flip: dir === 'r' }); X += dir === 'l' ? -len : len; Y -= len * sl; }
    return this;
  }
  // 깔린 돌바닥 마름모: 가운데 (cx, cy), 가로 반폭 hw칸. 세로는 그 절반(2:1)
  paveDiamond(cx, cy, hw, kind = 'stone') { const k = this.k; cx *= k; cy *= k; hw *= k; (this.pave = this.pave || []).push({ kind, poly: [[cx, cy - hw / 2], [cx + hw, cy], [cx, cy + hw / 2], [cx - hw, cy]].map(([a, b]) => [a * TS, b * TS]) }); return this; }
  // 쿼터뷰 소품: (fx, fy)는 바닥 마름모의 앞 모서리 자리(칸). flip이면 좌우를 뒤집어 입구가 오른쪽 앞면에 온다
  iso(name, fx, fy, o = {}) { return this.isoAt(name, fx * this.k, fy * this.k, o); }
  isoGround(name, X, Y, o = {}) { const q = meta(name, o.flip); if (!q) return this; (this.ground = this.ground || []).push({ name, x: Math.round(X - q.ax), y: Math.round(Y - q.ay), w: q.w, h: q.h, flip: !!o.flip, iso: corners(X, Y, q.fw, q.fh, q.ls, q.rs) }); return this; }
  isoAt(name, fx, fy, o = {}) {
    const q = meta(name, o.flip); if (!q) { console.warn('쿼터뷰 소품 없음', name); return this; }
    const sl = o.slope, ls = sl !== undefined && !o.flip ? sl : q.ls, rs = sl !== undefined && o.flip ? sl : q.rs;  // slope: 담 한 칸을 그 기울기로 민다
    const X = fx * TS, Y = fy * TS, c = corners(X, Y, q.fw, q.fh, ls, rs); this.hasIso = true;
    this.stamps.push({ name, x: Math.round(X - q.ax), y: Math.round(Y - q.ay), w: q.w, h: q.h, base: Y, iso: c, flip: !!o.flip, ...(sl !== undefined ? { sk: .5 - sl } : {}) });
    if (!o.nosolid) (this.polys = this.polys || []).push(c);
    return this;
  }
  // 깃발: (px, by)는 장대 밑동 자리(칸). left면 천이 왼쪽으로 날린다. 작은 기는 pen
  flag(id, px, by, left = false, o = {}) { if (!id) return this; return this.put((left ? 'flagl_' : 'flag_') + id, px - (left ? 17.5 : 2.5) / TS, by - 44 / TS, { nosolid: true, ...o }); }
  pen(id, px, by, o = {}) { if (!id) return this; return this.put('pen_' + id, px - 5 / TS, by - 28 / TS, { nosolid: true, ...o }); }
  label(tx, ty, text) { (this.labels = this.labels || []).push({ x: tx * this.k, y: ty * this.k, text }); return this; }
  // 전체 지도에만 보이는 이름
  place(tx, ty, text) { (this.names = this.names || []).push({ x: tx * this.k, y: ty * this.k, text }); return this; }
  scatter(names, n, seed = 1) {
    n = Math.round(n * this.k * this.k); let r = seed * 9301 + 49297; const R = () => (r = (r * 9301 + 49297) % 233280) / 233280;
    for (let i = 0; i < n * 4 && n > 0; i++) {
      const x = Math.floor(R() * this.w), y = Math.floor(R() * this.h); const nm = names[Math.floor(R() * names.length)];
      if (this.g[y][x] !== 0) continue;
      if (this.solids.some(s => s.x < (x + 1) * TS && s.x + s.w > x * TS && s.y < (y + 1) * TS && s.y + s.h > y * TS)) continue;
      this.stamps.push({ name: nm, x: x * TS, y: y * TS, base: 0, flat: true }); n--;
    }
    return this;
  }
  // 가장자리를 나무로 두른다. gaps는 비워 둘 구간
  border(names, gaps = [], step = 2) {
    const free = (x, y) => !gaps.some(g => x >= g[0] - 1 && x < g[0] + g[2] && y >= g[1] - 1 && y < g[1] + g[3]);
    let k = 0; const nm = () => names[k++ % names.length];
    const W = this.w / this.k, H = this.h / this.k, st = step / this.k;  // 넓힌 지도에서도 가장자리 나무 간격은 그대로
    for (let x = -1; x < W; x += st) { if (free(x, 0)) this.put(nm(), x, -1 / this.k); if (free(x, H - 1)) this.put(nm(), x, H - 2 / this.k); }
    for (let y = 1; y < H - 1; y += st) { if (free(0, y)) this.put(nm(), -1 / this.k, y); if (free(W - 1, y)) this.put(nm(), W - 1 / this.k, y); }
    return this;
  }
  // 땅만 칠한다(납작 소품은 빼고). 새 화면(hd2d.js)은 이 그림을 바닥에 눕히고 납작 소품은 따로 세운다
  paintBase(x) {
    if (this.room) { const doors = this.portals.filter(q => q.y + q.h >= this.h * TS - 2).map(q => [Math.round(q.x / TS), Math.round((q.x + q.w) / TS)]); paintRoom(x, this.w, this.h, this.roomStyle || 0, { doors, carpet: this.carpet }); }
    else if (G.world?.paintArea) { // 강호 전도와 같은 땅 칠하기: 길섶과 물가가 둥글고, 바닥 얼룩과 돌바닥 턱이 또렷하다
      const bi = { grass: 0, deep: 1, sand: 2, plain: 3, rose: 3, snow: 4, dusk: 5 }[this.biome] ?? 0, Bm = this.bm || this.g.map(r => r.map(() => bi));  // 쿼터뷰 마을은 칸마다 바닥(bm)과 칠할 때만 쓰는 흙 얼룩(gPaint)을 따로 둔다
      G.world.SOFT.on = !!this.isoNative; try { G.world.paintArea(x, 0, 0, this.w, this.h, this.gPaint || this.g, Bm, this.w, this.h); } finally { G.world.SOFT.on = false; }
    } else paintGround(x, this.g, this.biome);
    if (this.pave) for (const p of this.pave) paintPave(x, p);
    for (const s of this.ground || []) drawIso(x, s);
    if (this.hgt) { x.fillStyle = 'rgba(20,16,10,.35)'; for (let j = 0; j < this.h - 1; j++) for (let i = 0; i < this.w; i++) if (this.hgt[j][i] > this.hgt[j + 1][i] && !this.stair?.[i + ',' + j] && !this.stair?.[i + ',' + (j + 1)]) x.fillRect(i * TS, (j + 1) * TS, TS, 3); }  // 2D: 높은 칸 아래 가장자리에 그늘 띠
  }
  render() {
    const c = document.createElement('canvas'); c.width = this.w * TS; c.height = this.h * TS; const x = c.getContext('2d', { willReadFrequently: !this.room });
    this.paintBase(x);
    for (const s of this.stamps) if (s.flat) drawStamp(x, s.name, s.x, s.y, s.sc);
    this.canvas = c; this.objs = this.stamps.filter(s => !s.flat);
    if (!this.room && !this.live && !FLATMAP.has(this.id) && isoMode()) { this.top = c; buildIsoOut(this); }  // 바깥 지도 쿼터뷰: 평면도는 그대로 두고 그림만 눕힌다
    if (this.room && isoMode() && this.id !== 'myhouse') { // 쿼터뷰 미리보기: 바닥만 칠해 눕히고 뒷벽 두 면을 세운다
      const f = document.createElement('canvas'); f.width = c.width; f.height = c.height; const fx = f.getContext('2d'); fx.imageSmoothingEnabled = false;
      const flat = !this.roomStyle && IMG['ground/wood']; paintRoom(fx, this.w, this.h, this.roomStyle || 0, { carpet: this.carpet, floorOnly: true, noFloor: flat }); for (const s of this.stamps) if (s.flat) drawStamp(fx, s.name, s.x, s.y);
      buildIsoRoom(this, f, flat ? IMG['ground/wood'] : null);
    }
    if (this.room) { this.solids.push({ x: 0, y: 0, w: this.w * TS, h: TS + 4 }, { x: 0, y: 0, w: 10, h: this.h * TS }, { x: this.w * TS - 10, y: 0, w: 10, h: this.h * TS }, { x: 0, y: this.h * TS - 10, w: this.w * TS, h: 10 }); }
    return this;
  }
  // 좁힌 지도: 길(1, 3) 칸에 걸린 작은 소품(집이 아닌 것)을 가장 가까운 쪽으로 밀어 길을 비운다. 문 앞(포탈)도 비킨다
  // 거리 채우기: 길 북쪽 가장자리 풀밭에 길가 소품을 띄엄띄엄 세운다(카메라가 남쪽에서 보므로 길 위 사람을 가리지 않는다).
  // 문, 출구, 다른 막힘 둘레와 집 문 앞은 비우고, every칸에 하나꼴로 seed에 따라 고른다
  streetDress(list, every = 4, seed = 1) { const hs = (a, b) => { let h = (a * 374761393 + b * 668265263 + seed * 1013) | 0; h = (h ^ (h >>> 13)) * 1274126177 | 0; return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
    const apron = this.stamps.filter(st => DOORED.includes(st.name)).map(st => { const S = STAMPS[st.name]; return { x: st.x + S[3] / 2 - 20, y: st.y + S[4] - 4, w: 40, h: 40 }; });
    const hit = (r, pad) => this.solids.some(o => o.x < r.x + r.w + pad && o.x + o.w + pad > r.x && o.y < r.y + r.h + pad && o.y + o.h + pad > r.y) || this.portals.some(q => q.x < r.x + r.w + 16 && q.x + q.w + 16 > r.x && q.y < r.y + r.h + 24 && q.y + q.h + 24 > r.y) || apron.some(a => a.x < r.x + r.w && a.x + a.w > r.x && a.y < r.y + r.h && a.y + a.h > r.y);
    let last = -99;
    for (let ty = 2; ty < this.h - 1; ty++) for (let tx = 1; tx < this.w - 1; tx++) { if (this.g[ty][tx] !== 1 || this.g[ty - 1][tx] !== 0 || this.g[ty - 2]?.[tx] !== 0) continue;
      if (hs(tx, ty) > 1 / every || tx - last < 3) continue; const name = list[Math.floor(hs(ty, tx * 3) * list.length)], S = STAMPS[name]; if (!S) continue;
      const px = tx * TS + TS / 2 - S[3] / 2, py = ty * TS - S[4] - 1, r = S.length > 5 ? { x: px + S[5], y: py + S[6], w: S[7], h: S[8] } : { x: px, y: py + S[4] - 6, w: S[3], h: 6 };
      let ok = !hit(r, 6); for (let x = r.x; ok && x < r.x + r.w; x += 4) for (let y = r.y; y < r.y + r.h; y += 4) { const v = this.g[Math.floor(y / TS)]?.[Math.floor(x / TS)]; if (v !== 0) { ok = false; break; } }
      if (!ok) continue; this.put(name, 0, 0, { dx: px, dy: py }); last = tx; }
    return this;
  }
  // 집 뒤(북쪽) 좁은 틈 막기: 카메라가 남쪽에서 보므로 집 뒤는 보이지도 않고 걸어 들어가면 가려진다. 집 폭만큼 담을 친다(길 칸과 다른 막힘은 비운다)
  // 문 앞 길 잇기: 문 바로 아래에 길이나 마당이 없으면 문에서 남쪽으로 곧게 길을 내 가장 가까운 길(마당)에 잇는다. max칸 안에 없으면 손대지 않는다
  frontPaths(max = 6) {
    for (const st of this.stamps.filter(q => DOORED.includes(q.name) && !q.iso)) { const S = STAMPS[st.name], cx = Math.floor((st.x + S[3] / 2) / TS), by = Math.ceil((st.y + S[4]) / TS), W = v => v === 1 || v === 3;
      if (W(this.g[by]?.[cx]) || W(this.g[by + 1]?.[cx])) continue; let end = -1; for (let y = by; y < by + max && y < this.h; y++) if (W(this.g[y]?.[cx]) || W(this.g[y]?.[cx - 1])) { end = y; break; }
      if (end < 0) continue; for (let y = by; y < end; y++) for (const x of [cx - 1, cx]) if (this.g[y]?.[x] === 0) this.g[y][x] = 1; }
    return this;
  }
  backFence(names = DOORED, name = 'fence_h', o = {}) { const F = STAMPS[name];
    for (const st of this.stamps.filter(q => names.includes(q.name) && !q.iso)) { const S = STAMPS[st.name], y = st.y - F[4] + 2;
      for (let x = st.x; x + F[3] <= st.x + S[3] + 1; x += F[3]) { const r = { x: x + F[5], y: y + F[6], w: F[7], h: F[8] }, t = this.g[Math.floor((r.y + r.h - 1) / TS)]?.[Math.floor((r.x + r.w / 2) / TS)];
        if (t === undefined || (t === 1 && !o.yard) || t === 2 || this.solids.some(o => o.x < r.x + r.w && o.x + o.w > r.x && o.y < r.y + r.h && o.y + o.h > r.y)) continue; this.put(name, 0, 0, { dx: x, dy: y }); } }
    return this;
  }
  clearRoads() {
    let onRoad = r => { for (let ty = Math.floor(r.y / TS); ty <= Math.floor((r.y + r.h - .01) / TS); ty++) for (let tx = Math.floor(r.x / TS); tx <= Math.floor((r.x + r.w - .01) / TS); tx++) { const v = this.g[ty]?.[tx]; if (v === 1 || v === 3) return true; } return this.portals.some(q => q.x < r.x + r.w + 6 && q.x + q.w + 6 > r.x && q.y < r.y + r.h + 8 && q.y + q.h + 8 > r.y); };
    // 집 문 앞(나중에 autoDoors가 문을 다는 자리)도 길처럼 비워 둔다
    const apron = this.stamps.filter(st => DOORED.includes(st.name) && !st.iso).map(st => { const S = STAMPS[st.name]; return { x: st.x + S[3] / 2 - 14, y: st.y + S[4], w: 28, h: 22 }; });
    const road0 = onRoad; onRoad = r => road0(r) || apron.some(a => a.x < r.x + r.w && a.x + a.w > r.x && a.y < r.y + r.h && a.y + a.h > r.y);
    const hits = r => this.solids.some(o => o !== r && o.x < r.x + r.w && o.x + o.w > r.x && o.y < r.y + r.h && o.y + o.h > r.y);
    const isHouse = st => this.portals.some(q => q.door && q.x >= st.x && q.x <= st.x + STAMPS[st.name][3] && Math.abs(q.y + 4 - st.base) < 10);
    for (const st of this.stamps) { const r = st.sol; if (!r || isHouse(st) || !onRoad(r)) continue;
      out: for (let d = 2; d <= 48; d += 2) for (const [dx, dy] of [[0, -d], [0, d], [-d, 0], [d, 0]]) { const t = { x: r.x + dx, y: r.y + dy, w: r.w, h: r.h }; if (!onRoad(t) && !hits(t) && t.x >= 0 && t.y >= 0) { r.x += dx; r.y += dy; st.x += dx; st.y += dy; st.base += dy; break out; } } }
    return this;
  }
  // 집마다 문 옆에 살림 소품 하나(독, 장작, 상자 따위). 문 앞(28점 폭)과 길, 다른 막힘은 피하고, 둘 데가 없으면 놓지 않는다
  dress(list = ['v_jars', 'v_wood', 'jar', 'v_crates', 'pot', 'box']) {
    const busy = (r, own) => this.solids.some(o => o !== own && o.x < r.x + r.w + 2 && o.x + o.w + 2 > r.x && o.y < r.y + r.h + 2 && o.y + o.h + 2 > r.y)
      || this.portals.some(q => q.x < r.x + r.w + 2 && q.x + q.w + 2 > r.x && q.y < r.y + r.h + 10 && q.y + q.h + 10 > r.y)
      || [[r.x, r.y], [r.x + r.w, r.y], [r.x, r.y + r.h], [r.x + r.w, r.y + r.h]].some(([x, y]) => { const v = this.g[Math.floor(y / TS)]?.[Math.floor(x / TS)]; return v === undefined || v === 1 || v === 2; });
    this.stamps.filter(st => DOORED.includes(st.name) && !st.iso).forEach((st, i) => { const H = STAMPS[st.name], cx = st.x + H[3] / 2, by = st.y + H[4];
      for (const side of i % 2 ? [1, -1] : [-1, 1]) { const name = list[i % list.length], S = STAMPS[name], px = Math.round(cx + side * (H[3] / 2 - S[3] / 2 + 4) - S[3] / 2), py = by + 3 - S[4];
        if (Math.abs(px + S[3] / 2 - cx) - S[3] / 2 < 11) continue; const sol = { x: px + S[5], y: py + S[6], w: S[7], h: S[8] }; if (busy(sol, st.sol)) continue;
        this.put(name, 0, 0, { dx: px, dy: py }); break; } });
    return this;
  }
  // (px, py)가 막혔으면 가장 가까운 빈 자리(점 단위)를 돌려준다. 좁힌 지도에서 사람과 들어오는 자리를 비켜 세울 때 쓴다
  freeNear(px, py) { if (!this.blocked(px, py)) return [px, py]; for (let r = 4; r <= 64; r += 4) for (let a = 0; a < 16; a++) { const x = px + Math.cos(a / 8 * Math.PI) * r, y = py + Math.sin(a / 8 * Math.PI) * r; if (!this.blocked(x, y)) return [x, y]; } return [px, py]; }
  blocked(px, py, w = 9, h = 5) {
    const x0 = px - w / 2, y0 = py - h, x1 = px + w / 2, y1 = py;
    if (x0 < 0 || y0 < 0 || x1 > this.w * TS || y1 > this.h * TS) return true;
    for (let ty = Math.floor(y0 / TS); ty <= Math.floor((y1 - .01) / TS); ty++) for (let tx = Math.floor(x0 / TS); tx <= Math.floor((x1 - .01) / TS); tx++) if (this.g[ty] && this.g[ty][tx] === 2) return true;
    for (const s of this.solids) if (s.x < x1 && s.x + s.w > x0 && s.y < y1 && s.y + s.h > y0) return true;
    if (this.polys) for (const c of this.polys) if (hitsBox(c, px, py, w, h)) return true;
    return false;
  }
}

export const MAPS = {};
// 깔린 돌바닥 다각형: 돌 무늬를 채우고, 위쪽 두 변은 밝은 턱, 아래쪽 두 변은 그늘과 짙은 테두리
let PAT = {};
export function paintPave(c, p) {
  const t = IMG['ground/' + p.kind]; if (!t) return;
  if (!PAT[p.kind]) { const k = (t.hd || 1) * TS, n = Math.floor(t.width / k), cv = document.createElement('canvas'); cv.width = cv.height = n * TS; const q = cv.getContext('2d'); q.drawImage(t, 0, 0, n * k, n * k, 0, 0, n * TS, n * TS); PAT[p.kind] = cv; }
  const P = p.poly; c.save(); c.beginPath(); P.forEach(([a, b], i) => i ? c.lineTo(a, b) : c.moveTo(a, b)); c.closePath();
  c.fillStyle = 'rgba(0,0,0,.28)'; c.save(); c.translate(2, 3); c.fill(); c.restore();
  c.fillStyle = c.createPattern(PAT[p.kind], 'repeat'); c.fill(); c.clip();
  for (let i = 0; i < P.length; i++) { const [a, b] = P[i], [e, f] = P[(i + 1) % P.length], top = (b + f) / 2 < (P.reduce((s, q) => s + q[1], 0) / P.length); c.strokeStyle = top ? 'rgba(236,232,220,.9)' : 'rgba(70,66,64,.9)'; c.lineWidth = top ? 3 : 4; c.beginPath(); c.moveTo(a, b); c.lineTo(e, f); c.stroke(); }
  c.restore(); c.beginPath(); P.forEach(([a, b], i) => i ? c.lineTo(a, b) : c.moveTo(a, b)); c.closePath(); c.strokeStyle = '#3a3638'; c.lineWidth = 1; c.stroke();
}
G.mapK = id => MAPS[id]?.k || 1;
export const isoMode = () => { try { return localStorage.getItem('gangho_iso') === '1'; } catch { return false; } };
// 내 집은 가구가 바뀔 때마다 다시 만든다
export function buildHouse(S) {
  const h = HOUSES[S.house.lv], m = new MapDef('myhouse', h.w, h.h, { name: h.name, bgm: 'peaceful', room: true, arena: 'yard' });
  for (const i of S.house.items) m.put(FURN[i.id].stamp, i.x, i.y);
  m.exit(Math.floor(h.w / 2) - 2, h.h - 1, 4, 1, 'cheongha', 16, 22, 0, { door: true });
  m.render(); return MAPS.myhouse = m;
}
function M(id, w, h, o) { return MAPS[id] = new MapDef(id, w, h, o); }
export const makeMap = M;

// 쿼터뷰 시험 마을: 임시 상자 집으로 앞뒤 가림과 충돌을 맞춰 본다
export function isoTest() {
  const m = M('isotest', 40, 30, { name: '쿼터뷰 시험', bgm: 'village', biome: 'plain', arena: 'village' });
  for (let y = 0; y < 30; y++) for (let x = 0; x < 40; x++) m.g[y][x] = 0;
  for (let i = 0; i < 40; i++) { const y = Math.round(22 - i * .5); for (let d = 0; d < 3; d++) if (m.g[y + d]) m.g[y + d][i] = 1; }
  m.iso('inn', 12, 14).iso('thatch', 24, 11).iso('thatch', 30, 20, { flip: true }).iso('tile_house', 9, 25, { flip: true }).iso('hall_dao', 34, 9).iso('pavilion', 20, 24).iso('gate_sect', 18, 18);
  m.put('tree_round', 4, 4).put('tree_round', 36, 24).put('jar', 15, 15.5);
  m.exit(0, 20, 1, 4, 'cheongha', 20, 20, 0); m.render(); return m;
}
export function buildMaps() {
  // 청하진: 강변 나루 마을
  // k = .75: 청하진을 4분의 3으로 좁힌다(길 폭, 집 간격, 이야기 자리가 다 같이 줄고 집 크기는 그대로). 걸리는 사람 자리는 ctx.content가 가까운 빈 곳으로 비켜 세운다
  let m = M('cheongha', 46, 34, { name: '청하진', bgm: 'village', biome: 'grass', arena: 'village', k: .75 });
  m.water(0, 29, 46, 5);
  {
    // 큰길(가로)과 그 남쪽 집들 앞을 지나는 뒷길(가로). 새 화면 카메라는 남쪽에서 보므로 집 정면은 모두 남쪽 길을 본다
    m.road(3, 15, 42, 15, 2).road(22, 3, 22, 27, 2).road(9, 16, 9, 23, 2).road(32, 16, 32, 23, 2).road(21, 26, 24, 27, 2).road(2, 22.7, 44, 22.7, 2);
    m.fill(20, 12, 6, 3, 1);
    m.road(22, 0, 22, 4, 2).road(43, 15, 45, 15, 2).road(0, 15, 3, 15, 2);
    m.house('inn', 19, 8, 'inn', 8, 10, 1, { doorDx: 0 });
    m.put('hut_b', 26, 8).put('sign_dojo', 0, 0, { flat: false, nosolid: true }); m.stamps.pop();
    m.house('clay', 8, 11, 'smith', 7, 8, 1);
    m.house('shop_green', 31, 11, 'clinic', 7, 8, 1);
    m.house('shop_blue', 36, 18, 'shop', 6, 7, 1);
    m.house('hut_o', 14, 18, 'myhouse', 6, 7, 1, { when: 'own_house', lock: '비어 있는 집이다. 옆의 복덕방 영감에게 물어보자.' }).house('hut_o2', 26, 18, 'bokun', 7, 8, 1, { when: 'bokun_open', lock: '낮에는 문이 잠겨 있다. 밤에만 불이 켜진다는 집이다.' }).put('wood_o', 4, 18).put('wood_b', 12, 8);
    m.put('banner4', 17.6, 9.3, { nosolid: true }).put('banner4', 23.4, 9.3, { nosolid: true });  // 객잔 간판 기: 밥그릇
    m.put('plum', 43, 6).put('plum', 28, 3).put('plum_o', 12, 3).put('tree_round', 34, 6).put('tree_round', 5, 6);
    m.put('jar', 18, 12).put('pot', 26, 12).put('pot', 27, 12).put('signpost', 24, 16).put('signpost', 41, 13);
    m.border(['grove_green', 'tree_round', 'tree_big', 'tree_pine'], [[21, 0, 4, 2], [44, 14, 3, 4], [0, 27, 2, 8], [44, 27, 2, 8], [0, 33, 46, 2], [0, 13, 3, 5]], 3);
    m.put('tree_round', 8, 25.4).put('tree_round', 38, 25.4).put('stump', 13, 25.5).put('boulder', 29, 26).put('jar', 19, 25.5).put('pot', 26, 25.5).put('tree_big', 2, 12).put('plum_g', 36, 13).put('hut_o', 37.5, 9.3);  // 동쪽 살림집은 큰길 북쪽으로 옮김(뒷길에 걸려서)
    m.scatter(['flower1', 'flower2', 'flower3', 'bush1', 'bush3', 'fern1'], 40, 3);
    // 길가 살림 소품(새 화면 시제품에서 청하진만 채움). 막힘 있는 것은 길과 문 앞을 비켜 놓는다
    m.put('v_lamppost', 5, 13.05).put('v_lamppost', 17.5, 13.05).put('v_lamppost', 29.6, 13.05).put('v_lamppost', 7.3, 17.1).put('v_lamppost', 25, 17.1);  // 큰길 등롱 기둥
    m.put('v_wood', 12.2, 11.6).put('v_dummy', 6, 11.2);  // 대장간 옆 장작, 상자, 목인
    m.put('v_stall', 17.5, 12.45).put('v_jars', 27.8, 13.7).put('v_well', 37.5, 13.4).put('v_hay', 41.5, 13.7);  // 큰길 북쪽: 노점, 독, 우물, 짚더미
    m.put('v_cart', 16.5, 25.7).put('v_stonelamp', 34.5, 17.1).put('v_jars', 41.5, 17.3).put('v_crates', 29.5, 25.8).put('v_hay', 3.5, 19);  // 큰길 남쪽: 수레, 석등, 독, 상자, 짚더미
    m.put('v_laundry', 11.5, 25.6, { nosolid: true }).put('v_signboard', 25.3, 25.4);  // 빨래 줄, 나루 안내판
    m.row('fence_h', 3, 27.4, 17).row('fence_h', 26, 27.4, 17);  // 강둑 울타리(나루 길은 비움)
    for (const [n, x, y] of [['bush2', 13.2, 25.9], ['flower4', 19.6, 25.9], ['bush4', 27.2, 26], ['flower2', 31, 25.9], ['bush2', 35.2, 26], ['flower1', 8.2, 14.2], ['fern2', 35.6, 14.3], ['bush4', 18.4, 14.4], ['flower3', 24.6, 11.6], ['fern2', 3.4, 14.2]]) m.put(n, x, y, { nosolid: true });  // 집 앞 화단과 풀 포기
    m.scatter(['fern1', 'fern2', 'bush4', 'flower4', 'bush2'], 45, 11);
  }
  m.fill(21, 28, 4, 4, 4);
  { const K = m.k * TS; m.solids.push({ x: 21 * K - 4, y: 29 * K, w: 4, h: 3 * K }, { x: 25 * K, y: 29 * K, w: 4, h: 3 * K }, { x: 21 * K, y: 32 * K, w: 4 * K, h: 8 }); }
  m.terrace(0, 29, 46, 5, -2).terrace(21, 29, 4, 3, -1).stairs(21, 28, 4, 1).heightEdges().clearRoads().backFence().dress();  // 나루터 높낮이: 강물은 두 단, 나루 판은 한 단 아래, 둑에서 계단으로 내려간다
  m.exit(0, 14, 1, 4, 'valley', 37.5, 15.5, 2, { when: 'burned', lock: '서쪽 청풍골은 나중에 가 보자.' });
  m.label(3.5, 13.2, '← 청풍골');
  m.place(23, 13.8, '광장').place(23, 27, '나루터').place(13, 24.2, '복덕방');
  m.exit(21, 0, 4, 1, 'bamboo', 18, 30, 1, { when: 'bamboo_open', lock: '아직 산으로 갈 때가 아니다.' }).exit(45, 14, 1, 4, 'pass', 1, 13.5, 3, { when: 'pass_open', lock: '동쪽 산길은 지금 갈 이유가 없다.' });
  // 객잔 내부
  m = M('inn', 18, 13, { name: '달맞이 객잔', bgm: 'peaceful', room: true, arena: 'yard' });
  m.put('counter', 1, 2).put('shelf', 5, 1).put('shelf2', 9, 1).put('bookcase2', 1, 1).put('rack', 13, 2).put('longtable', 3, 6).put('longtable', 10, 6).put('longtable', 3, 9).put('longtable', 10, 9);
  m.row('stool', 3, 5, 3, 1).row('stool', 10, 5, 3, 1).row('stool', 3, 8, 3, 1).row('stool', 10, 8, 3, 1).put('plant', 16, 2).put('jar', 15, 10).put('pot', 15.5, 11);
  m.exit(7, 12, 4, 1, 'cheongha', 21, 12, 0, { door: true });
  // 약방
  m = M('clinic', 14, 11, { name: '윤씨 약방', bgm: 'quiet', room: true, arena: 'yard' });
  m.put('shelf2', 1, 1).put('shelf2', 3, 1).put('scrollcase', 6, 1).put('drawer', 9, 1).put('bed', 8, 5).put('counter', 2, 5).put('plant', 12, 2).put('jar', 1, 8);
  m.exit(5, 10, 4, 1, 'cheongha', 33, 15, 0, { door: true });
  // 대장간
  m = M('smith', 14, 11, { name: '강씨 대장간', bgm: 'village', room: true, arena: 'yard', roomStyle: 1 });
  m.put('rack', 2, 1).put('rack', 6, 1).put('box', 11, 2).put('box', 12, 2).put('counter', 2, 5).put('jar', 11, 7).put('stump', 9, 4);
  m.exit(5, 10, 4, 1, 'cheongha', 9.5, 15, 0, { door: true });
  // 잡화점
  m = M('shop', 12, 10, { name: '만물상', bgm: 'good', room: true, arena: 'yard' });
  m.put('shelf', 1, 1).put('shelf2', 3, 1).put('shelf', 7, 1).put('counter', 3, 4).put('box', 1, 6).put('box', 10, 6);
  m.exit(4, 9, 4, 1, 'cheongha', 37.5, 22, 0, { door: true });
  // 복운전: 하오문의 도박장
  m = M('bokun', 14, 11, { name: '복운전', bgm: 'mystic', room: true, roomStyle: 1, arena: 'room' });
  m.put('longtable', 2, 3).put('longtable', 8, 3).put('longtable', 2, 6).row('stool', 2, 2, 3).row('stool', 8, 2, 3).put('lantern', 12, 2).put('jar', 12, 7).put('rack', 8, 7);
  m.exit(5, 10, 4, 1, 'cheongha', 28, 22, 0, { door: true });
  // 우물 아래 밀실
  m = M('well', 12, 9, { name: '우물 아래 밀실', bgm: 'mystic', room: true, roomStyle: 1, arena: 'room', tint: 'rgba(20,10,40,.35)' });
  m.row('tablet', 2, 2, 4, 2).put('tablet2', 4, 3).put('tablet2', 6, 3).put('chest', 9, 5);
  m.exit(4, 8, 4, 1, 'inn', 13, 11, 1, { door: true });
  // 대숲길
  m = M('bamboo', 38, 33, { name: '대숲길', bgm: 'road', biome: 'deep', arena: 'forest' });
  m.road(18, 26, 18, 32, 2).road(18, 26, 30, 26, 2).road(30, 15, 30, 27, 2).road(10, 15, 31, 15, 2).road(10, 7, 10, 16, 2).road(10, 7, 26, 7, 2);
  m.fill(23, 3, 8, 7, 1);
  for (let y = -1; y < 34; y += 2) for (let x = 0; x < 38; x += 1) {
    const free = (m.g[Math.min(y + 2, 32)]?.[x] === 0 && m.g[clampy(y + 1)]?.[x] === 0 && m.g[clampy(y)]?.[x] === 0 && m.g[clampy(y + 3)]?.[x] === 0);
    if (free && (x + y) % 3 === 0 && ((x * 7 + y * 13) % 5 !== 0)) m.put('bamboo', x, y);
  }
  function clampy(v) { return Math.max(0, Math.min(32, v)); }
  m.put('statue', 27, 3).put('stump', 24, 8).put('stump_o', 28, 8);
  m.scatter(['fern1', 'fern2', 'bush2', 'bush4'], 30, 5);
  m.exit(17, 32, 4, 1, 'cheongha', 22.5, 2, 0);
  // 동쪽 산길
  m = M('pass', 40, 24, { name: '동쪽 산길', bgm: 'road', biome: 'sand', arena: 'fort' });
  m.road(0, 12, 20, 12, 2).road(20, 5, 20, 13, 2).road(20, 5, 39, 5, 2).road(26, 5, 26, 18, 2).road(26, 18, 39, 18, 2);
  m.border(['rocks', 'grove_dead', 'boulder', 'tree_dead'], [[0, 11, 2, 4], [38, 4, 3, 4], [38, 17, 3, 4]], 4);
  for (const [x, y] of [[6, 7], [13, 6], [6, 16], [13, 17], [31, 10], [33, 13], [16, 18], [24, 21], [30, 2]]) m.put(pick2(['boulder', 'tree_dead', 'stump', 'rocks'], x + y), x, y);
  function pick2(a, n) { return a[n % a.length]; }
  m.scatter(['bush1', 'fern1'], 18, 7);
  m.exit(0, 11, 1, 4, 'cheongha', 43.5, 15.5, 2).exit(39, 4, 1, 4, 'fort', 1, 13, 3, { when: 'fort_open', lock: '산채 입구다. 준비가 끝나면 다시 오자.' }).exit(39, 17, 1, 4, 'cloudmt', 22, 36, 1, { when: 'cloud_open', lock: '이 길 너머는 창운산이다. 지금은 갈 이유가 없다.' });
  // 흑풍채
  m = M('fort', 36, 26, { name: '흑풍채', bgm: 'dungeon', biome: 'dusk', arena: 'fort' });
  m.fill(1, 2, 34, 22, 1).fill(0, 11, 2, 4, 1).fill(16, 23, 4, 3, 1);  // 목책 안 마당, 서쪽 샛문 길, 남쪽 정문 길. 목책 밖은 맨땅
  m.row('wood_h', 2, 2, 33).col('wood_h', 1, 3, 8).col('wood_h', 34, 3, 20).row('wood_h', 2, 23, 14).row('wood_h', 20, 23, 15).col('wood_h', 1, 15, 9);  // 아래 목책 가운데는 강호로 나가는 문
  m.put('wood_b', 8, 4).put('wood_o', 16, 4).put('hut_b', 26, 4).put('lodge', 15, 14).put('straw', 6, 15).put('mud', 26, 16);
  m.backFence(['wood_b', 'wood_o', 'hut_b'], 'fence_h', { yard: true }); m.fenced = true;  // 북쪽 목책과 집 사이 한 칸 틈(마당 바닥이 길이라 규칙이 비켜 가서 따로)
  for (const [x, y] of [[13, 9], [22, 9], [5, 12], [30, 12], [10, 20], [24, 21]]) m.put('jar', x, y);
  m.flag('heukpung', 14.6, 14.75, true).flag('heukpung', 20.4, 14.75).flag('heukpung', 15.2, 23.9, true).flag('heukpung', 20.2, 23.9);  // 아래 문 양옆에도 산채 깃발
  m.exit(0, 12, 1, 3, 'pass', 37.5, 5.5, 2);
  // 창운산
  m = M('cloudmt', 46, 38, { name: '창운산', bgm: 'temple', biome: 'deep', arena: 'court' });
  m.road(22, 26, 22, 37, 2).fill(12, 13, 22, 13, 3).road(22, 7, 22, 13, 2);
  m.row('wall_h', 10, 11, 12).row('wall_h', 24, 11, 12).col('wall_h', 10, 11, 16).col('wall_h', 35, 11, 16).row('wall_h', 10, 26, 12).row('wall_h', 24, 26, 12);
  m.put('gate', 21, 25, { nosolid: true });
  m.house('hall', 19, 0, 'hall_in', 8, 11, 1).put('lodge', 13, 15).put('lodge', 29, 15);
  m.house('wood_b', 3, 15, 'library', 7, 9, 1).road(5, 18, 5, 19, 2).road(5, 19, 10, 19, 2).fill(10, 19, 1, 2, 3);
  m.solids = m.solids.filter(s => !(s.x === 10 * TS && s.y >= 19 * TS && s.y <= 20 * TS + 8)); m.stamps = m.stamps.filter(s => !(s.name === 'wall_h' && s.x === 10 * TS && (s.y === 19 * TS || s.y === 20 * TS)));
  m.flag('cloudmt', 20.6, 13.75, true).flag('cloudmt', 25.4, 13.75).put('statue', 15, 21).put('statue', 28, 21);
  m.put('plum_w', 38, 6).put('plum_w', 4, 5).put('plum', 40, 24).put('plum', 6, 28).put('plum_w', 34, 30);
  m.border(['grove_pine', 'tree_pine', 'tree_big'], [[21, 34, 4, 5]], 3);
  m.scatter(['fern1', 'fern2', 'bush2', 'bush4', 'flower4'], 40, 11);
  m.exit(21, 37, 4, 1, 'pass', 37.5, 18.5, 2);
  // 창운문 본전
  m = M('hall_in', 18, 14, { name: '창운문 본전', bgm: 'temple', room: true, arena: 'room' });
  m.put('statue_big', 7, 1).row('lantern', 3, 2, 2, 11).put('longtable', 7, 6).put('bookcase', 1, 1).put('bookcase', 15, 1);
  m.exit(7, 13, 4, 1, 'cloudmt', 21, 8, 0, { door: true });
  // 장서각
  m = M('library', 16, 12, { name: '장서각', bgm: 'mystic', room: true, arena: 'room' });
  m.put('bookcase', 1, 1).put('bookcase', 3, 1).put('bookcase', 5, 1).put('bookcase', 9, 1).put('bookcase', 11, 1).put('bookcase', 13, 1).put('bookcase', 2, 5).put('bookcase', 5, 5).put('bookcase', 9, 5).put('bookcase', 12, 5).put('scrollcase', 7, 1);
  m.exit(6, 11, 4, 1, 'cloudmt', 5, 19.5, 0, { door: true });
  // 구화성
  m = M('guhwa', 50, 36, { name: '구화성', bgm: 'good', biome: 'sand', arena: 'ring' });
  m.fill(4, 4, 42, 28, 3).road(24, 32, 24, 35, 2);
  m.row('wall_h', 2, 2, 46).row('wall_h', 2, 32, 22).row('wall_h', 26, 32, 22).col('wall_h', 2, 2, 31).col('wall_h', 47, 2, 31);
  m.put('gate', 23, 31, { nosolid: true });
  m.house('inn', 8, 6, 'inn2', 8, 10, 1).house('shop_blue', 16, 7, 'shop2', 6, 7, 1).house('shop_green', 37, 7, 'hall2', 7, 8, 1).put('hut_b', 8, 20).put('hut_o', 36, 20).put('hut_o2', 15, 22).put('hut_b', 30, 23).put('wood_o', 40, 14);
  m.fill(19, 11, 12, 9, 5);
  m.put('banner1', 19, 9, { nosolid: true }).put('banner2', 22, 9, { nosolid: true }).put('banner3', 27, 9, { nosolid: true }).put('banner1', 30, 9, { nosolid: true }).put('banner4', 12.1, 7.3, { nosolid: true }).put('hall', 21.5, 0, { dy: 8 });
  m.put('plum', 5, 14).put('plum_o', 4, 26).put('plum_o', 44, 5).put('statue', 19, 18).put('statue', 29, 18);
  m.fill(38, 25, 6, 5, 2).label(41, 24.4, '연못');
  m.put('jar', 15, 11).put('pot', 34, 11).put('pot', 35, 11);
  m.exit(23, 35, 4, 1, 'pass', 37.5, 18.5, 2, { when: 'never', lock: '산길은 끊겼다. 돌아가려면 남문 나루의 뱃사공을 찾자.' });
  m.solids = m.solids.filter(s => !((s.x === 47 * TS || s.x === 2 * TS) && s.y >= 18 * TS && s.y <= 20 * TS + 8));
  m.stamps = m.stamps.filter(s => !(s.name === 'wall_h' && (s.x === 47 * TS || s.x === 2 * TS) && s.y >= 18 * TS && s.y <= 20 * TS));
  m.fill(2, 18, 3, 3, 3).fill(46, 18, 3, 3, 3);
  m.exit(48, 18, 1, 3, 'ninehall', 1.5, 10.5, 3).exit(1, 18, 1, 3, 'fiveclans', 37.5, 12.5, 2);
  m.label(44.5, 17.2, '구파 회관 →').label(5.5, 17.2, '← 세가 거리');
  m.place(25, 14, '비무대').place(27, 28, '남문 나루').place(42, 13.6, '맹주 창고');
  // 청풍골: 사냥과 낚시, 벌목
  m = M('valley', 40, 30, { name: '청풍골', bgm: 'peaceful', biome: 'deep', arena: 'forest', ambient: 'leaf' });
  m.water(19, 0, 2, 30).fill(19, 13, 2, 3, 4).road(21, 14, 39, 14, 2).road(4, 14, 18, 14, 2);
  m.solids.push({ x: 0, y: -8, w: 40 * m.k * TS, h: 8 });
  m.border(['grove_pine', 'tree_big', 'grove_green', 'tree_pine'], [[38, 13, 3, 5], [0, 13, 4, 4]], 3);
  for (const [nm, x, y] of [['tree_pine', 9, 5], ['tree_round', 14, 7], ['tree_big', 26, 4], ['tree_pine', 32, 11], ['plum_g', 14, 19], ['tree_round', 7, 22], ['tree_pine', 25, 24], ['tree_big', 34, 26], ['boulder', 23, 10], ['boulder', 15, 25], ['plum', 30, 17], ['tree_round', 5, 9]]) m.put(nm, x, y);
  m.scatter(['fern1', 'fern2', 'bush2', 'bush4', 'flower3'], 34, 41);
  m.exit(39, 14, 1, 4, 'cheongha', 2, 15.5, 3).exit(0, 13, 1, 4, 'shrine', 7, 8, 1, { when: 'ma_open', lock: '깎아지른 절벽뿐이다.' });
  // 천마신교 분타: 청풍골 서쪽 절벽 안
  m = M('shrine', 14, 11, { name: '흑운궁 분타', bgm: 'curse', room: true, roomStyle: 1, arena: 'moon', tint: 'rgba(70,6,20,.4)' });
  m.put('statue', 6, 1).put('lantern', 1, 2).put('lantern', 12, 2).put('bookcase', 2, 1).put('bookcase', 10, 1);
  m.exit(5, 10, 4, 1, 'valley', 3, 15, 3, { door: true });
  // 자유 모드: 내 문파. 건물은 살 때마다 sect.js가 얹는다
  m = M('mysect', 40, 30, { name: '내 문파', bgm: 'temple', biome: 'grass', arena: 'court' });
  m.road(19, 8, 19, 29, 2).fill(10, 14, 20, 11, 3);
  m.put('hall', 18, 1).put('gate', 18, 27, { nosolid: true }).put('lantern', 16, 11).put('lantern', 23, 11);
  m.border(['tree_pine', 'grove_green', 'tree_big'], [[18, 28, 4, 3]], 3);
  m.scatter(['fern1', 'bush2', 'flower2'], 26, 6);
  m.exit(18, 29, 4, 1, 'valley', 35, 15.5, 2);
  // 소림사: 숭산의 절
  m = M('shaolin', 40, 30, { name: '소림사', bgm: 'temple', biome: 'grass', arena: 'court', ambient: 'leaf' });
  m.fill(14, 8, 12, 14, 3).road(19, 22, 19, 29, 2).road(5, 15, 14, 15, 2).road(26, 15, 34, 15, 2);
  m.put('hall', 17, 0).label(19, -.2 + 1, '대웅전').put('statue', 15, 9).put('statue', 23, 9).put('gate', 18.3, 21, { nosolid: true });
  m.house('wood_b', 3, 12, 'sutra', 7, 9, 1).label(5, 11.6, '장경각').put('lodge', 32, 9).label(34, 8.6, '나한당');
  m.put('tree_big', 10, 6).put('tree_pine', 28, 5).put('tree_round', 6, 22).put('tree_big', 31, 23).put('tree_pine', 12, 25).put('plum_g', 26, 25);
  m.border(['grove_pine', 'tree_big', 'grove_green'], [[18, 28, 4, 3]], 3);
  m.scatter(['fern1', 'bush1', 'flower3', 'bush3'], 26, 51);
  // 장경각
  m = M('sutra', 16, 12, { name: '소림 장경각', bgm: 'quiet', room: true, arena: 'room' });
  m.put('bookcase', 1, 1).put('bookcase', 3, 1).put('bookcase', 5, 1).put('bookcase', 9, 1).put('bookcase', 11, 1).put('bookcase', 13, 1).put('bookcase', 2, 5).put('bookcase', 12, 5).put('scrollcase', 7, 1);
  m.exit(6, 11, 4, 1, 'shaolin', 5, 16, 0, { door: true });
  // 화산 절벽길
  m = M('hwasan', 30, 20, { name: '화산 절벽길', bgm: 'road', biome: 'rose', arena: 'forest', ambient: 'leafpink' });
  m.road(0, 10, 29, 10, 3);
  for (const [nm, x, y] of [['plum', 3, 3], ['plum', 12, 2], ['plum', 22, 4], ['plum', 6, 14], ['plum', 18, 15], ['plum', 26, 14], ['boulder', 15, 6], ['boulder', 10, 15], ['tree_white', 26, 3]]) m.put(nm, x, y);
  m.border(['rocks', 'plum', 'boulder'], [[0, 9, 2, 5], [28, 9, 3, 5]], 4);
  m.scatter(['flower2', 'flower3', 'bush3'], 20, 61);
  // 벼랑 아래 동굴
  m = M('cliffcave', 16, 12, { name: '벼랑 아래 동굴', bgm: 'cave', room: true, roomStyle: 1, arena: 'moon', tint: 'rgba(10,20,40,.3)' });
  m.put('boulder', 2, 2).put('boulder', 12, 8).put('jar', 12, 2).put('tablet', 7, 2).put('tablet2', 9, 2).put('fern1', 3, 8, { flat: true }).put('flower1', 5, 3, { flat: true });
  // 구파 회관: 구파일방의 숙소가 늘어선 곳
  m = M('ninehall', 44, 25, { name: '구파 회관', bgm: 'temple', biome: 'grass', arena: 'court' });
  m.fill(0, 9, 44, 3, 3).fill(0, 19, 44, 3, 3).fill(1, 9, 2, 13, 3).fill(41, 9, 2, 13, 3).fill(21, 12, 2, 7, 3);
  const nine = [['house_red', 4, 5, '소림사', 'tree_big', 'shaolin'], ['hut_b', 12, 5, '무당파', 'tree_pine', 'wudang'], ['hut_o', 20, 5, '화산파', 'plum', 'hwasan'], ['hut_o2', 28, 5, '종남파', 'tree_pine', 'jongnam'], ['shop_green', 36, 5, '아미파', 'plum_w', 'emei'],
    ['wood_b', 4, 15, '곤륜파', 'tree_snow', 'gonryun'], ['clay', 12.5, 15, '공동파', 'boulder', 'gongdong'], ['wood_o', 20.5, 15, '점창파', 'tree_round', 'jeomchang'], ['hut_b', 28, 15, '청성파', 'bamboo', 'cheongseong'], ['straw', 36.5, 15.8, '개방', 'stump', 'gaebang']];
  for (const [st, x, y, nm, tr, fid] of nine) { m.put(st, x, y, { nosolid: false }).flag(fid, x + STAMPS[st][3] / TS + .3, y + STAMPS[st][4] / TS + .15).label(x + 2, y - .5, nm); m.put(tr, x - 2.4, y - .4 + (tr === 'plum' || tr === 'plum_w' ? -1 : 0)); }
  m.solids.push({ x: 0, y: 0, w: 44 * m.k * TS, h: 3 * m.k * TS }, { x: 0, y: 23 * m.k * TS, w: 44 * m.k * TS, h: 2 * m.k * TS });
  m.border(['grove_green', 'tree_big', 'grove_pine'], [[0, 8, 2, 5]], 3);
  m.scatter(['flower1', 'flower3', 'fern1', 'bush2'], 22, 21);
  m.exit(0, 9, 1, 3, 'guhwa', 46.5, 19.5, 2);
  // 세가 거리: 오대세가의 별채
  m = M('fiveclans', 42, 25, { name: '세가 거리', bgm: 'story', biome: 'deep', arena: 'ring' });
  m.fill(1, 10, 41, 3, 3).fill(1, 19, 36, 3, 3).fill(36, 13, 3, 9, 3);
  m.house('hall', 3, 1, 'fiveclans', 5, 10.5, 0, { when: 'never', lock: '남궁세가의 본채다. 함부로 들어갈 곳이 아니다.' }).label(5, .6, '남궁세가').flag('namgung', 2.6, 8.6, true).flag('namgung', 7.4, 8.6);
  m.put('lodge', 14, 3).label(16, 2.6, '모용세가').flag('moyong', 13.6, 8.6, true).flag('moyong', 18.4, 8.6).put('plum_w', 10, 4);
  m.put('house_red', 26, 6).label(28, 5.5, '제갈세가').flag('jegal', 25.6, 9.6, true).flag('jegal', 30.4, 9.6).put('tree_pine', 22, 5).put('bamboo', 33, 5).put('bamboo', 34, 5.4).put('bamboo', 35, 5);
  m.put('shop_green', 8, 15).label(10, 14.5, '사천당가').flag('dang', 7.6, 18.6, true).flag('dang', 12.4, 18.6).put('tree_dead', 4, 15).row('jar', 3, 18, 2, 1);
  m.put('clay', 22, 15).label(24, 14.5, '하북팽가').flag('paeng', 21.6, 18.6, true).flag('paeng', 25.4, 18.6).put('stump', 17, 16).put('stump_o', 27, 16).put('pot', 19, 18);
  m.solids.push({ x: 0, y: 23 * m.k * TS, w: 42 * m.k * TS, h: 2 * m.k * TS });
  m.border(['grove_pine', 'tree_big', 'grove_green'], [[40, 9, 3, 5]], 3);
  m.scatter(['fern1', 'fern2', 'bush2', 'bush4'], 20, 31);
  m.exit(41, 10, 1, 3, 'guhwa', 3.5, 19.5, 3);
  // 구화성 객잔과 맹주관
  m = M('inn2', 18, 13, { name: '금봉 객잔', bgm: 'peaceful', room: true, arena: 'room' });
  m.put('counter', 1, 2).put('shelf', 5, 1).put('rack', 13, 2).put('longtable', 3, 6).put('longtable', 10, 6).put('bed', 12, 9).put('bed', 3, 9).row('stool', 3, 5, 3).row('stool', 10, 5, 3);
  m.exit(7, 12, 4, 1, 'guhwa', 10, 10, 0, { door: true });
  m = M('shop2', 12, 10, { name: '구화 상회', bgm: 'good', room: true, arena: 'room' });
  m.put('shelf', 1, 1).put('rack', 3, 1).put('shelf2', 7, 1).put('counter', 3, 4).put('box', 1, 6);
  m.exit(4, 9, 4, 1, 'guhwa', 17.5, 11, 0, { door: true });
  m = M('hall2', 14, 11, { name: '정천맹 객관', bgm: 'dark', room: true, arena: 'room' });
  m.put('bookcase', 2, 1).put('bookcase', 10, 1).put('statue', 6, 1).put('longtable', 5, 5).put('lantern', 1, 2).put('lantern', 12, 2);
  m.exit(5, 10, 4, 1, 'guhwa', 39, 11, 0, { door: true });
  // 월하곡
  m = M('wolha', 44, 40, { name: '월하곡', bgm: 'curse', biome: 'dusk', arena: 'moon', tint: 'rgba(30,14,70,.34)' });
  m.road(21, 30, 21, 39, 2).road(8, 30, 34, 30, 2).road(8, 20, 8, 31, 2).road(34, 20, 34, 31, 2).road(8, 20, 35, 20, 2).road(21, 8, 21, 21, 2);
  m.fill(14, 3, 16, 8, 3);
  m.border(['grove_dead', 'tree_dead', 'rocks'], [[20, 37, 5, 4]], 4);
  for (const [x, y] of [[13, 24], [17, 26], [27, 24], [30, 27], [12, 16], [30, 15], [4, 12], [38, 12], [14, 34], [29, 34]]) m.put(pick2(['tree_dead', 'stump', 'boulder', 'grove_dead'], x * y), x, y);
  m.row('tablet', 15, 11, 3, 2).row('tablet', 24, 11, 3, 2).put('statue_big', 20, 1).put('statue', 15, 4).put('statue', 27, 4);
  m.scatter(['fern2', 'bush2'], 24, 9);
  m.exit(20, 39, 4, 1, 'guhwa', 24, 30, 1, { when: 'never', lock: '돌아갈 길은 끊겼다.' });
  // 제8부: 비단길, 사주성, 설산, 천산 입구
  m = M('silk', 44, 26, { name: '비단길', bgm: 'road', biome: 'sand', arena: 'sand' });
  m.road(0, 12, 18, 12, 2).road(18, 8, 18, 13, 2).road(18, 8, 30, 8, 2).road(30, 8, 30, 15, 2).road(30, 15, 43, 15, 2);
  m.border(['rocks', 'tree_dead', 'boulder'], [[42, 14, 3, 4], [0, 11, 3, 4]], 4);
  for (const [nm, x, y] of [['boulder', 8, 6], ['rocks', 14, 18], ['tree_dead', 24, 14], ['boulder', 36, 8], ['stump', 26, 20], ['tree_dead', 6, 19], ['rocks', 38, 21]]) m.put(nm, x, y);
  m.scatter(['bush1', 'bush3'], 18, 21);
  m.exit(0, 11, 1, 4, 'oasis', 41, 15.5, 2);
  m = M('oasis', 44, 30, { name: '사주성', bgm: 'good', biome: 'sand', arena: 'sand' });
  m.road(0, 15, 43, 15, 2).road(21, 0, 21, 15, 2).road(21, 15, 21, 20, 2); m.water(17, 21, 10, 5);
  m.road(10, 17, 10, 24, 2).road(2, 24, 17, 24, 2).road(36, 17, 36, 24, 2).road(29, 24, 38, 24, 2);  // 큰길 남쪽 집들 앞을 지나는 골목(정면이 남쪽 길을 보게)
  m.put('shop_green', 8, 8).put('mud', 14, 10).put('mud', 28, 9).put('straw', 33, 10).put('straw', 7, 20).put('mud', 31, 20).put('hut_b', 12, 21);
  m.put('tree_round', 15, 20).put('tree_round', 28, 20).put('tree_round', 15, 26).put('tree_round', 28, 26).put('jar', 19, 13).put('pot', 24, 13).put('rocks', 3, 9).put('boulder', 1, 12);
  m.border(['rocks', 'tree_dead'], [[20, 0, 4, 2], [42, 14, 3, 4]], 4);
  m.exit(43, 14, 1, 4, 'silk', 2, 13, 3);
  m.place(5.5, 8.6, '바위산 동굴').place(22, 2.6, '북문').place(22, 20.4, '오아시스');
  m = M('snowpeak', 44, 34, { name: '빙궁 설산', bgm: 'mystic', biome: 'snow', arena: 'snow', ambient: 'snow' });
  m.road(22, 8, 22, 33, 2).road(22, 13, 36, 13, 2).road(36, 8, 36, 14, 2);
  m.put('hall', 20, 0, { dy: -24 }).put('statue', 18, 8).put('statue', 26, 8);
  m.border(['tree_snow', 'rocks'], [[20, 31, 5, 4]], 3);
  for (const [nm, x, y] of [['tree_snow', 10, 8], ['tree_snow', 14, 16], ['tree_snow', 30, 20], ['tree_snow', 8, 24], ['tree_snow', 34, 26], ['rocks', 12, 12], ['rocks', 30, 6], ['tree_snow', 28, 28]]) m.put(nm, x, y);
  m.place(22, 5.4, '빙궁').place(36.5, 6.6, '고개 마루');
  m = M('tiangate', 44, 34, { name: '천산 입구', bgm: 'curse', biome: 'dusk', arena: 'moon', tint: 'rgba(40,10,30,.3)', ambient: 'snow' });
  m.road(21, 10, 21, 33, 2).fill(15, 7, 14, 5, 3);
  m.put('statue_big', 20, 3).put('statue', 15, 6).put('statue', 27, 6).row('tablet', 16, 12, 2, 3).row('tablet', 25, 12, 2, 3);
  m.border(['rocks', 'grove_dead', 'tree_dead'], [[20, 31, 5, 4]], 3);
  for (const [nm, x, y] of [['rocks', 10, 12], ['rocks', 32, 12], ['tree_dead', 12, 20], ['tree_dead', 30, 22], ['boulder', 14, 26], ['boulder', 28, 16]]) m.put(nm, x, y);
  // 제9부: 흑운궁
  m = M('blackpalace', 44, 38, { name: '흑운궁', bgm: 'curse', biome: 'dusk', arena: 'moon', tint: 'rgba(60,8,30,.34)' });
  m.water(0, 21, 44, 11); m.road(21, 12, 21, 37, 2); m.fill(21, 21, 2, 11, 4); m.fill(14, 8, 16, 12, 3);
  m.put('hall', 20, 0).put('statue_big', 13, 6).put('statue_big', 28, 6).row('wall_h', 2, 7, 12).row('wall_h', 30, 7, 12);
  m.border(['rocks', 'grove_dead'], [[20, 35, 5, 4]], 4);
  m.place(22, 7.6, '제단').place(25.5, 26.6, '다리');
  for (const k in MAPS) MAPS[k].render();
}
