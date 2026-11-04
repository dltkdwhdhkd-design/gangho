// 지도. 타일 단위로 길과 물을 깔고 소품을 얹는다.
import { TS, rint, pick, IMG } from './core.js';
import { FURN, HOUSES } from './items.js';
import { STAMPS, drawStamp, paintGround, paintRoom } from './tiles.js';

class MapDef {
  constructor(id, w, h, o = {}) {
    Object.assign(this, { id, w, h, biome: 'grass', name: '', bgm: 'village', arena: 'village', stamps: [], solids: [], portals: [], tint: null, room: false, encounters: null, ...o });
    this.g = Array.from({ length: h }, () => new Array(w).fill(0));
  }
  road(x0, y0, x1, y1, wd = 2) { for (let y = Math.min(y0, y1); y <= Math.max(y0, y1) + (y0 === y1 ? wd - 1 : 0); y++) for (let x = Math.min(x0, x1); x <= Math.max(x0, x1) + (x0 === x1 ? wd - 1 : 0); x++) if (this.g[y] && this.g[y][x] !== undefined && this.g[y][x] !== 2) this.g[y][x] = 1; return this; }
  fill(x0, y0, w, h, v) { for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) if (this.g[y] && this.g[y][x] !== undefined) this.g[y][x] = v; return this; }
  water(x, y, w, h) { return this.fill(x, y, w, h, 2); }
  put(name, tx, ty, o = {}) {
    const s = STAMPS[name], px = tx * TS + (o.dx || 0), py = ty * TS + (o.dy || 0);
    if (!s) { console.warn('소품 없음', name); return this; }
    this.stamps.push({ name, x: px, y: py, base: py + s[4] - (o.lift || 0), flat: o.flat });
    if (s.length > 5 && !o.nosolid) this.solids.push({ x: px + s[5], y: py + s[6], w: s[7], h: s[8] });
    return this;
  }
  row(name, tx, ty, n, step = 1, o = {}) { for (let i = 0; i < n; i++) this.put(name, tx + i * step, ty, o); return this; }
  col(name, tx, ty, n, step = 1, o = {}) { for (let i = 0; i < n; i++) this.put(name, tx, ty + i * step, o); return this; }
  solid(tx, ty, w, h) { this.solids.push({ x: tx * TS, y: ty * TS, w: w * TS, h: h * TS }); return this; }
  // 건물 입구: 스탬프 아래쪽 가운데에 포탈을 만든다
  house(name, tx, ty, to, ex, ey, dir = 1, o = {}) {
    this.put(name, tx, ty, o); const s = STAMPS[name], cx = tx * TS + s[3] / 2 + (o.doorDx || 0), by = ty * TS + s[4];
    this.portals.push({ x: cx - 9, y: by - 4, w: 18, h: 9, to, tx: ex, ty: ey, dir, door: true, when: o.when, lock: o.lock });
    return this;
  }
  exit(tx, ty, w, h, to, ex, ey, dir, o = {}) { this.portals.push({ x: tx * TS, y: ty * TS, w: w * TS, h: h * TS, to, tx: ex, ty: ey, dir, ...o }); return this; }
  label(tx, ty, text) { (this.labels = this.labels || []).push({ x: tx, y: ty, text }); return this; }
  scatter(names, n, seed = 1) {
    let r = seed * 9301 + 49297; const R = () => (r = (r * 9301 + 49297) % 233280) / 233280;
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
    for (let x = -1; x < this.w; x += step) { if (free(x, 0)) this.put(nm(), x, -1); if (free(x, this.h - 1)) this.put(nm(), x, this.h - 2); }
    for (let y = 1; y < this.h - 1; y += step) { if (free(0, y)) this.put(nm(), -1, y); if (free(this.w - 1, y)) this.put(nm(), this.w - 1, y); }
    return this;
  }
  render() {
    const c = document.createElement('canvas'); c.width = this.w * TS; c.height = this.h * TS; const x = c.getContext('2d');
    if (this.room) paintRoom(x, this.w, this.h, this.roomStyle || 0); else paintGround(x, this.g, this.biome);
    for (const s of this.stamps) if (s.flat) drawStamp(x, s.name, s.x, s.y);
    this.canvas = c; this.objs = this.stamps.filter(s => !s.flat);
    if (this.room) { this.solids.push({ x: 0, y: 0, w: this.w * TS, h: TS + 4 }, { x: 0, y: 0, w: 10, h: this.h * TS }, { x: this.w * TS - 10, y: 0, w: 10, h: this.h * TS }, { x: 0, y: this.h * TS - 10, w: this.w * TS, h: 10 }); }
    return this;
  }
  blocked(px, py, w = 9, h = 5) {
    const x0 = px - w / 2, y0 = py - h, x1 = px + w / 2, y1 = py;
    if (x0 < 0 || y0 < 0 || x1 > this.w * TS || y1 > this.h * TS) return true;
    for (let ty = Math.floor(y0 / TS); ty <= Math.floor((y1 - .01) / TS); ty++) for (let tx = Math.floor(x0 / TS); tx <= Math.floor((x1 - .01) / TS); tx++) if (this.g[ty] && this.g[ty][tx] === 2) return true;
    for (const s of this.solids) if (s.x < x1 && s.x + s.w > x0 && s.y < y1 && s.y + s.h > y0) return true;
    return false;
  }
}

export const MAPS = {};
// 내 집은 가구가 바뀔 때마다 다시 만든다
export function buildHouse(S) {
  const h = HOUSES[S.house.lv], m = new MapDef('myhouse', h.w, h.h, { name: h.name, bgm: 'peaceful', room: true, arena: 'yard' });
  for (const i of S.house.items) m.put(FURN[i.id].stamp, i.x, i.y);
  m.exit(Math.floor(h.w / 2) - 2, h.h - 1, 4, 1, 'cheongha', 16, 22, 0, { door: true });
  m.render(); return MAPS.myhouse = m;
}
function M(id, w, h, o) { return MAPS[id] = new MapDef(id, w, h, o); }

export function buildMaps() {
  // 청하진: 강변 나루 마을
  let m = M('cheongha', 46, 34, { name: '청하진', bgm: 'village', biome: 'grass', arena: 'village' });
  m.water(0, 29, 46, 5);
  m.road(3, 15, 42, 15, 2).road(22, 3, 22, 27, 2).road(9, 16, 9, 20, 2).road(32, 16, 32, 21, 2).road(21, 26, 24, 27, 2);
  m.fill(20, 12, 6, 3, 1);
  m.road(22, 0, 22, 4, 2).road(43, 15, 45, 15, 2).road(0, 15, 3, 15, 2);
  m.house('house_red', 19, 8, 'inn', 8, 10, 1, { doorDx: 0 });
  m.put('hut_b', 26, 8).put('sign_dojo', 0, 0, { flat: false, nosolid: true }); m.stamps.pop();
  m.house('clay', 8, 11, 'smith', 7, 8, 1);
  m.house('shop_green', 31, 11, 'clinic', 7, 8, 1);
  m.house('shop_blue', 36, 18, 'shop', 6, 7, 1);
  m.house('hut_o', 14, 18, 'myhouse', 6, 7, 1, { when: 'own_house', lock: '비어 있는 집이다. 옆의 복덕방 영감에게 물어보자.' }).house('hut_o2', 26, 18, 'bokun', 7, 8, 1, { when: 'bokun_open', lock: '낮에는 문이 잠겨 있다. 밤에만 불이 켜진다는 집이다.' }).put('wood_o', 4, 18).put('wood_b', 12, 8);
  m.put('banner2', 17, 10, { nosolid: true }).put('banner2', 24, 10, { nosolid: true });
  m.put('plum', 2, 22).put('plum', 40, 8).put('plum_g', 18, 22).put('plum', 28, 3).put('plum_o', 12, 3).put('tree_round', 34, 6).put('tree_round', 5, 6);
  m.put('jar', 18, 12).put('pot', 26, 12).put('pot', 27, 12).put('signpost', 24, 16).put('signpost', 41, 13);
  m.fill(21, 28, 4, 4, 4);
  m.solids.push({ x: 21 * TS - 4, y: 29 * TS, w: 4, h: 3 * TS }, { x: 25 * TS, y: 29 * TS, w: 4, h: 3 * TS }, { x: 21 * TS, y: 32 * TS, w: 4 * TS, h: 8 });
  m.border(['grove_green', 'tree_round', 'tree_big', 'tree_pine'], [[21, 0, 4, 2], [44, 14, 3, 4], [0, 27, 2, 8], [44, 27, 2, 8], [0, 33, 46, 2], [0, 13, 3, 5]], 3);
  m.put('plum', 8, 25).put('plum_o', 34, 24).put('tree_round', 38, 25).put('stump', 13, 25).put('boulder', 29, 26).put('jar', 19, 25).put('pot', 26, 25).put('tree_big', 2, 12).put('plum_g', 36, 13).put('hut_o', 40, 21);
  m.scatter(['flower1', 'flower2', 'flower3', 'bush1', 'bush3', 'fern1'], 40, 3);
  m.exit(0, 14, 1, 4, 'valley', 37.5, 15.5, 2, { when: 'burned', lock: '서쪽 청풍골은 나중에 가 보자.' });
  m.label(3.5, 13.2, '← 청풍골');
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
  m = M('smith', 14, 11, { name: '철씨 대장간', bgm: 'village', room: true, arena: 'yard', roomStyle: 1 });
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
  m.fill(0, 0, 36, 26, 1);
  m.row('wood_h', 2, 2, 33).col('wood_h', 1, 3, 8).col('wood_h', 34, 3, 20).row('wood_h', 2, 23, 33).col('wood_h', 1, 15, 9);
  m.put('wood_b', 8, 4).put('wood_o', 16, 4).put('hut_b', 26, 4).put('lodge', 15, 14).put('straw', 6, 15).put('mud', 26, 16);
  for (const [x, y] of [[13, 9], [22, 9], [5, 12], [30, 12], [10, 20], [24, 21]]) m.put('jar', x, y);
  m.put('banner7', 14, 13, { nosolid: true }).put('banner7', 20, 13, { nosolid: true });
  m.exit(0, 12, 1, 3, 'pass', 37.5, 5.5, 2);
  // 창운산
  m = M('cloudmt', 46, 38, { name: '창운산', bgm: 'temple', biome: 'deep', arena: 'court' });
  m.road(22, 26, 22, 37, 2).fill(12, 13, 22, 13, 3).road(22, 7, 22, 13, 2);
  m.row('wall_h', 10, 11, 12).row('wall_h', 24, 11, 12).col('wall_h', 10, 11, 16).col('wall_h', 35, 11, 16).row('wall_h', 10, 26, 12).row('wall_h', 24, 26, 12);
  m.put('gate', 21, 25, { nosolid: true });
  m.house('hall', 19, 0, 'hall_in', 8, 11, 1).put('lodge', 13, 15).put('lodge', 29, 15);
  m.house('wood_b', 3, 15, 'library', 7, 9, 1).road(5, 18, 5, 19, 2).road(5, 19, 10, 19, 2).fill(10, 19, 1, 2, 3);
  m.solids = m.solids.filter(s => !(s.x === 10 * TS && s.y >= 19 * TS && s.y <= 20 * TS + 8)); m.stamps = m.stamps.filter(s => !(s.name === 'wall_h' && s.x === 10 * TS && (s.y === 19 * TS || s.y === 20 * TS)));
  m.put('banner3', 19, 12, { nosolid: true }).put('banner3', 26, 12, { nosolid: true }).put('statue', 15, 21).put('statue', 28, 21);
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
  m.house('house_red', 8, 6, 'inn2', 8, 10, 1).house('shop_blue', 16, 7, 'shop2', 6, 7, 1).house('shop_green', 37, 7, 'hall2', 7, 8, 1).put('hut_b', 8, 20).put('hut_o', 36, 20).put('hut_o2', 15, 22).put('hut_b', 30, 23).put('wood_o', 40, 14);
  m.fill(19, 11, 12, 9, 5);
  m.put('banner1', 19, 9, { nosolid: true }).put('banner2', 22, 9, { nosolid: true }).put('banner5', 27, 9, { nosolid: true }).put('banner1', 30, 9, { nosolid: true }).put('hall', 21.5, 0, { dy: 8 });
  m.put('plum', 5, 14).put('plum_o', 4, 26).put('plum_o', 44, 5).put('statue', 19, 18).put('statue', 29, 18);
  m.fill(38, 25, 6, 5, 2).label(41, 24.4, '연못');
  m.put('jar', 15, 11).put('pot', 34, 11).put('pot', 35, 11);
  m.exit(23, 35, 4, 1, 'pass', 37.5, 18.5, 2, { when: 'never', lock: '이제 되돌아갈 수 없다.' });
  m.solids = m.solids.filter(s => !((s.x === 47 * TS || s.x === 2 * TS) && s.y >= 18 * TS && s.y <= 20 * TS + 8));
  m.stamps = m.stamps.filter(s => !(s.name === 'wall_h' && (s.x === 47 * TS || s.x === 2 * TS) && s.y >= 18 * TS && s.y <= 20 * TS));
  m.fill(2, 18, 3, 3, 3).fill(46, 18, 3, 3, 3);
  m.exit(48, 18, 1, 3, 'ninehall', 1.5, 10.5, 3).exit(1, 18, 1, 3, 'fiveclans', 37.5, 12.5, 2);
  m.label(44.5, 17.2, '구파 회관 →').label(5.5, 17.2, '← 세가 거리');
  // 청풍골: 사냥과 낚시, 벌목
  m = M('valley', 40, 30, { name: '청풍골', bgm: 'peaceful', biome: 'deep', arena: 'forest', ambient: 'leaf' });
  m.water(19, 0, 2, 30).fill(19, 13, 2, 3, 4).road(21, 14, 39, 14, 2).road(4, 14, 18, 14, 2);
  m.solids.push({ x: 0, y: -8, w: 40 * TS, h: 8 });
  m.border(['grove_pine', 'tree_big', 'grove_green', 'tree_pine'], [[38, 13, 3, 5]], 3);
  for (const [nm, x, y] of [['tree_pine', 9, 5], ['tree_round', 14, 7], ['tree_big', 26, 4], ['tree_pine', 32, 11], ['plum_g', 14, 19], ['tree_round', 7, 22], ['tree_pine', 25, 24], ['tree_big', 34, 26], ['boulder', 23, 10], ['boulder', 15, 25], ['plum', 30, 17], ['tree_round', 5, 9]]) m.put(nm, x, y);
  m.scatter(['fern1', 'fern2', 'bush2', 'bush4', 'flower3'], 34, 41);
  m.exit(39, 14, 1, 4, 'cheongha', 2, 15.5, 3);
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
  const nine = [['house_red', 4, 5, '소림사', 'tree_big', 'banner2'], ['hut_b', 12, 5, '무당파', 'tree_pine', 'banner4'], ['hut_o', 20, 5, '화산파', 'plum', 'banner1'], ['hut_o2', 28, 5, '종남파', 'tree_pine', 'banner3'], ['shop_green', 36, 5, '아미파', 'plum_w', 'banner6'],
    ['wood_b', 4, 15, '곤륜파', 'tree_snow', 'banner4'], ['clay', 12.5, 15, '공동파', 'boulder', 'banner7'], ['wood_o', 20.5, 15, '점창파', 'tree_round', 'banner5'], ['hut_b', 28, 15, '청성파', 'bamboo', 'banner3'], ['straw', 36.5, 15.8, '개방', 'stump', 'banner7']];
  for (const [st, x, y, nm, tr, ban] of nine) { m.put(st, x, y, { nosolid: false }).put(ban, x + 4, y + 1.4, { nosolid: true }).label(x + 2, y - .5, nm); m.put(tr, x - 2.4, y - .4 + (tr === 'plum' || tr === 'plum_w' ? -1 : 0)); }
  m.solids.push({ x: 0, y: 0, w: 44 * TS, h: 3 * TS }, { x: 0, y: 23 * TS, w: 44 * TS, h: 2 * TS });
  m.border(['grove_green', 'tree_big', 'grove_pine'], [[0, 8, 2, 5]], 3);
  m.scatter(['flower1', 'flower3', 'fern1', 'bush2'], 22, 21);
  m.exit(0, 9, 1, 3, 'guhwa', 46.5, 19.5, 2);
  // 세가 거리: 오대세가의 별채
  m = M('fiveclans', 42, 25, { name: '세가 거리', bgm: 'story', biome: 'deep', arena: 'ring' });
  m.fill(1, 10, 41, 3, 3).fill(1, 19, 36, 3, 3).fill(36, 13, 3, 9, 3);
  m.house('hall', 3, 1, 'fiveclans', 5, 10.5, 0, { when: 'never', lock: '남궁세가의 본채다. 함부로 들어갈 곳이 아니다.' }).label(5, .6, '남궁세가').put('banner4', 2, 6.4, { nosolid: true }).put('banner4', 7, 6.4, { nosolid: true });
  m.put('lodge', 14, 3).label(16, 2.6, '모용세가').put('banner6', 13, 6.4, { nosolid: true }).put('banner6', 18, 6.4, { nosolid: true }).put('plum_w', 10, 4);
  m.put('house_red', 26, 6).label(28, 5.5, '제갈세가').put('banner5', 25, 6.4, { nosolid: true }).put('banner5', 30, 6.4, { nosolid: true }).put('tree_pine', 22, 5).put('bamboo', 33, 5).put('bamboo', 34, 5.4).put('bamboo', 35, 5);
  m.put('shop_green', 8, 15).label(10, 14.5, '사천당가').put('banner7', 7, 16.4, { nosolid: true }).put('banner7', 12, 16.4, { nosolid: true }).put('tree_dead', 4, 15).row('jar', 3, 18, 2, 1);
  m.put('clay', 22, 15).label(24, 14.5, '하북팽가').put('banner2', 21, 16.4, { nosolid: true }).put('banner2', 25, 16.4, { nosolid: true }).put('stump', 17, 16).put('stump_o', 27, 16).put('pot', 19, 18);
  m.solids.push({ x: 0, y: 23 * TS, w: 42 * TS, h: 2 * TS });
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
  for (const k in MAPS) MAPS[k].render();
}
