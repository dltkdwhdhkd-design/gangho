// 타일과 소품(건물, 나무 등) 그리기
import { IMG, TS, pick, rnd, rint } from './core.js';
// 이름: [시트, x, y, 폭, 높이, 충돌 x, y, 폭, 높이(없으면 충돌 없음)]
const H = 'House', N = 'Nature', E = 'Element', IE = 'InteriorElements';
export const STAMPS = {
  hut_o: [H, 0, 0, 64, 48, 2, 24, 60, 22], hut_b: [H, 64, 0, 64, 48, 2, 24, 60, 22], hut_o2: [H, 128, 0, 64, 48, 2, 24, 60, 22], house_red: [H, 192, 0, 64, 48, 2, 24, 60, 22],
  shop_blue: [H, 256, 0, 48, 48, 2, 22, 44, 24], shop_green: [H, 304, 0, 64, 48, 2, 22, 60, 24], clay: [H, 368, 0, 48, 48, 2, 22, 44, 24], wood_o: [H, 416, 0, 48, 48, 2, 22, 44, 24], wood_b: [H, 464, 0, 64, 48, 2, 22, 60, 24],
  hall: [H, 400, 112, 64, 112, 2, 64, 60, 46], lodge: [H, 400, 225, 64, 80, 2, 34, 60, 44], mud: [H, 3, 120, 42, 39, 2, 18, 38, 19], straw: [H, 48, 128, 47, 32, 2, 12, 43, 18],
  gate: [H, 7, 82, 34, 29, 0, 22, 4, 6], gate_arch: [H, 464, 320, 64, 48, 0, 30, 10, 16], statue: [H, 49, 242, 30, 30, 2, 14, 26, 14], statue_big: [H, 16, 242, 34, 46, 2, 26, 30, 18],
  banner1: [H, 352, 320, 16, 28], banner2: [H, 368, 320, 16, 28], banner3: [H, 384, 320, 16, 28], banner4: [H, 400, 320, 16, 28], banner5: [H, 416, 320, 16, 28], banner6: [H, 432, 320, 16, 28], banner7: [H, 448, 320, 16, 28],
  wall_h: [H, 176, 144, 16, 16, 0, 4, 16, 12], wood_h: [H, 176, 80, 16, 16, 0, 4, 16, 12], fence_h: [H, 176, 112, 16, 16, 0, 6, 16, 8],
  pot: [H, 256, 235, 16, 20, 2, 10, 12, 8], jar: [H, 272, 235, 16, 20, 2, 10, 12, 8], sign_sword: [H, 96, 64, 32, 16], sign_dojo: [H, 64, 64, 32, 16], awning: [H, 256, 256, 96, 24],
  tree_round: [N, 0, 0, 32, 32, 10, 24, 12, 6], tree_pine: [N, 32, 0, 32, 32, 10, 24, 12, 6], tree_dead: [N, 64, 0, 32, 32, 10, 24, 12, 6], tree_big: [N, 97, 0, 32, 32, 10, 24, 12, 6], tree_snow: [N, 128, 0, 32, 32, 10, 24, 12, 6], tree_white: [N, 192, 0, 32, 32, 10, 24, 12, 6], tree_pink: [N, 224, 0, 32, 32, 10, 24, 12, 6],
  grove_pine: [N, 0, 32, 64, 48, 6, 34, 52, 12], grove_green: [N, 64, 32, 64, 48, 6, 34, 52, 12], grove_pink: [N, 192, 32, 64, 48, 6, 34, 52, 12], grove_dead: [N, 0, 80, 64, 48, 6, 34, 52, 12], grove_white: [N, 128, 32, 64, 48, 6, 34, 52, 12], rocks: [N, 193, 83, 61, 44, 4, 24, 54, 18],
  plum: [N, 0, 288, 48, 48, 18, 40, 12, 6], plum_g: [N, 48, 288, 48, 48, 18, 40, 12, 6], plum_w: [N, 96, 288, 48, 48, 18, 40, 12, 6], plum_o: [N, 144, 288, 48, 48, 18, 40, 12, 6],
  bamboo: [N, 176, 128, 16, 46, 5, 38, 6, 6], stump: [N, 1, 134, 30, 23, 4, 10, 22, 12], stump_o: [N, 33, 134, 30, 23, 4, 10, 22, 12], signpost: [N, 80, 128, 16, 16, 3, 10, 10, 5], boulder: [N, 66, 196, 29, 27, 2, 12, 25, 14], boulder_b: [N, 0, 194, 32, 30, 3, 14, 26, 15], boulder_w: [N, 32, 194, 32, 30, 3, 14, 26, 15],
  bush1: [N, 0, 160, 16, 16], bush2: [N, 16, 160, 16, 16], bush3: [N, 32, 160, 16, 16], bush4: [N, 48, 160, 16, 16], flower1: [N, 0, 176, 16, 16], flower2: [N, 16, 176, 16, 16], flower3: [N, 48, 176, 16, 16], flower4: [N, 96, 176, 16, 16], fern1: [N, 64, 176, 16, 16], fern2: [N, 80, 176, 16, 16],
  log: [N, 66, 128, 14, 14, 1, 6, 12, 8],
  shelf: [E, 96, 112, 32, 32, 0, 16, 32, 15], shelf2: [E, 128, 112, 32, 32, 0, 16, 32, 15], drawer: [E, 16, 112, 32, 32, 0, 16, 32, 15], bookcase: [E, 128, 112, 32, 32, 0, 16, 32, 15], bookcase2: [E, 240, 112, 16, 32], longtable: [E, 176, 16, 48, 16, 0, 2, 48, 13], bench: [E, 32, 176, 80, 16, 0, 6, 80, 9],
  f_bed: [E, 160, 0, 16, 32, 1, 8, 14, 22], f_stool: [E, 17, 19, 14, 13, 1, 6, 12, 7], f_lamp: [E, 176, 0, 16, 16, 4, 8, 8, 7], f_scroll: [E, 16, 80, 16, 32, 1, 18, 14, 13], f_chair: [E, 64, 60, 32, 20, 2, 6, 28, 13], f_stove: [E, 192, 0, 16, 16, 1, 5, 14, 10], f_bench: [E, 80, 16, 16, 16, 1, 5, 14, 10], f_dummy: [H, 241, 229, 14, 25, 2, 15, 10, 9], f_bonsai: [E, 0, 120, 16, 24, 2, 14, 12, 8], rack2: [E, 224, 41, 32, 21, 1, 8, 30, 12],
  stool: [E, 17, 19, 14, 13, 1, 6, 12, 7], box: [E, 32, 16, 16, 16, 1, 6, 14, 9], chest: [E, 48, 16, 16, 16, 1, 6, 14, 9], bed: [E, 176, 39, 48, 22, 2, 2, 44, 18], counter: [E, 32, 160, 48, 16, 0, 2, 48, 13], plant: [E, 0, 120, 16, 24, 2, 14, 12, 8], teapot: [E, 1, 160, 15, 15, 1, 6, 13, 8], rack: [E, 224, 41, 32, 21, 1, 8, 30, 12], lantern: [E, 96, 72, 16, 32, 4, 24, 8, 7], tablet: [E, 66, 32, 12, 15, 1, 8, 10, 6], tablet2: [E, 83, 32, 9, 16, 0, 8, 9, 7], scrollcase: [E, 17, 84, 14, 27, 1, 14, 12, 12],
};
export function drawStamp(ctx, name, x, y) { const s = STAMPS[name]; if (!s) return; const im = IMG['tiles/' + s[0]]; if (im) ctx.drawImage(im, s[1], s[2], s[3], s[4], x, y, s[3], s[4]); }

export const BIOME = {
  grass: { sheet: 'Floor', fill: [0, 12], block: [0, 7], det: [[1, 12], [2, 12], [3, 12], [4, 12], [2, 11], [3, 11]] },
  deep: { sheet: 'Floor', fill: [11, 12], block: [11, 7], det: [[12, 12], [13, 12], [14, 12], [15, 12]] },
  sand: { sheet: 'Floor', fill: [0, 5], block: [0, 0], det: [[1, 5], [2, 5], [3, 5], [4, 5]] },
  rose: { sheet: 'Floor', fill: [11, 5], block: [11, 0], det: [[12, 5], [13, 5], [14, 5], [15, 5]] },
  snow: { sheet: 'Floor', fill: [0, 19], block: [0, 14], det: [[1, 19], [2, 19], [3, 19], [4, 19]] },
  dusk: { sheet: 'Floor', fill: [11, 19], block: [11, 14], det: [[12, 19], [13, 19], [14, 19], [15, 19]] },
};
// 십자 이웃만 보고 고르는 간단한 자동 타일: 위1 오른2 아래4 왼8
const AUTO = { 0: [3, 3], 1: [3, 2], 4: [3, 0], 5: [3, 1], 2: [0, 3], 8: [2, 3], 10: [1, 3], 6: [0, 0], 12: [2, 0], 3: [0, 2], 9: [2, 2], 7: [0, 1], 13: [2, 1], 14: [1, 0], 11: [1, 2], 15: [1, 1] };
export function paintGround(c, g, biome, opt = {}) {
  // g[y][x]: 0 바닥, 1 길, 2 물, 3 깔린 돌바닥
  const b = BIOME[biome], fl = IMG['tiles/' + b.sheet], wa = IMG['tiles/Water'], w = g[0].length, h = g.length;
  const at = (x, y) => (y < 0 || y >= h || x < 0 || x >= w) ? -1 : g[y][x];
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    c.drawImage(fl, b.fill[0] * TS, b.fill[1] * TS, TS, TS, x * TS, y * TS, TS, TS);
    const v = g[y][x];
    if (v === 0 && Math.random() < (opt.detail ?? .13)) { const d = pick(b.det); c.drawImage(fl, d[0] * TS, d[1] * TS, TS, TS, x * TS, y * TS, TS, TS); }
    if (v === 1 || v === 2) {
      const same = (a, q) => { const k = at(a, q); return k === v || k === -1; };
      const m = (same(x, y - 1) ? 1 : 0) | (same(x + 1, y) ? 2 : 0) | (same(x, y + 1) ? 4 : 0) | (same(x - 1, y) ? 8 : 0);
      const [ax, ay] = AUTO[m];
      if (v === 1) c.drawImage(fl, (b.block[0] + ax) * TS, (b.block[1] + ay) * TS, TS, TS, x * TS, y * TS, TS, TS);
      else c.drawImage(wa, (ax) * TS, (6 + ay) * TS, TS, TS, x * TS, y * TS, TS, TS);
    }
    if (v === 3) { const f = IMG['tiles/InteriorFloor']; c.drawImage(f, (4 + (x + y * 2) % 3) * TS, 13 * TS, TS, TS, x * TS, y * TS, TS, TS); }
    if (v === 4) c.drawImage(wa, 6 * TS, 13 * TS, TS, TS, x * TS, y * TS, TS, TS);
    if (v === 5) { const f = IMG['tiles/InteriorFloor']; c.drawImage(f, 12 * TS, 1 * TS, TS, TS, x * TS, y * TS, TS, TS); }
  }
}
// 방 안 바닥과 벽
export function paintRoom(c, w, h, style = 0) {
  const f = style === 1 ? IMG['tiles/InteriorFloor'] : IMG['tiles/Water'], wall = IMG['tiles/WallSimple'];
  c.fillStyle = '#000'; c.fillRect(0, 0, w * TS, h * TS);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (style === 1) c.drawImage(f, (11 + (x + y) % 3) * TS, 12 * TS, TS, TS, x * TS, y * TS, TS, TS);
    else c.drawImage(f, 6 * TS, 13 * TS, TS, TS, x * TS, y * TS, TS, TS);
  }
  const ox = style === 1 ? 0 : 5, oy = style === 1 ? 6 : 0;
  const t = (sx, sy, x, y) => c.drawImage(wall, (ox + sx) * TS, (oy + sy) * TS, TS, TS, x * TS, y * TS, TS, TS);
  for (let x = 1; x < w - 1; x++) { t(1 + (x % 2), 0, x, 0); t(1 + (x % 2), 4, x, h - 1); }
  for (let y = 1; y < h - 1; y++) { t(0, 1 + (y % 2), 0, y); t(4, 1 + (y % 2), w - 1, y); }
  t(0, 0, 0, 0); t(4, 0, w - 1, 0); t(0, 4, 0, h - 1); t(4, 4, w - 1, h - 1);
}
function mk(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
const ARENA = {};
export const ARENA_W = 24, ARENA_H = 15;
// 싸움터 바닥. 테마마다 한 번만 그려 둔다.
export function arena(theme) {
  if (ARENA[theme]) return ARENA[theme];
  const cv = mk(ARENA_W * TS, ARENA_H * TS), c = cv.getContext('2d');
  const W = ARENA_W, Ht = ARENA_H;
  const grid = (fn) => Array.from({ length: Ht }, (_, y) => Array.from({ length: W }, (_, x) => fn(x, y)));
  const edge = (name, sp = TS) => { for (let x = 0; x < W * TS; x += sp) { drawStamp(c, name, x, -2); } };
  const plant = (names, n) => { for (let i = 0; i < n; i++) { drawStamp(c, pick(names), rint(0, W - 1) * TS, rint(1, Ht - 2) * TS); } };
  switch (theme) {
    case 'yard': paintGround(c, grid((x, y) => (x > 1 && x < W - 2 && y > 1 && y < Ht - 2) ? 1 : 0), 'sand'); edge('wall_h'); for (const [n, x, y] of [['jar', 2, 2], ['pot', 3, 2], ['jar', 20, 2], ['stump', 21, 12], ['bush1', 1, 7], ['bush3', 22, 6], ['fern1', 3, 13], ['flower1', 19, 13]]) drawStamp(c, n, x * TS, y * TS); break;
    case 'village': paintGround(c, grid((x, y) => (y > 3 && y < Ht - 4) ? 1 : 0), 'grass'); plant(['bush1', 'flower1', 'flower3', 'bush3'], 8); edge('fence_h'); break;
    case 'forest': paintGround(c, grid((x, y) => (Math.abs(x - 12) < 8 && Math.abs(y - 7) < 5) ? 1 : 0), 'deep', { detail: .2 }); plant(['fern1', 'fern2', 'bush2', 'bush4'], 12); for (let x = 0; x < W * TS; x += 11) drawStamp(c, 'bamboo', x, -30); break;
    case 'fort': paintGround(c, grid((x, y) => (x > 0 && x < W - 1 && y > 1 && y < Ht - 1) ? 1 : 0), 'dusk'); edge('wood_h'); break;
    case 'court': paintGround(c, grid((x, y) => (x > 2 && x < W - 3 && y > 2 && y < Ht - 3) ? 3 : 0), 'grass'); edge('wall_h'); for (let x = 16; x < W * TS; x += 64) drawStamp(c, 'banner3', x, 6); break;
    case 'ring': paintGround(c, grid((x, y) => (x > 1 && x < W - 2 && y > 1 && y < Ht - 2) ? 5 : 3), 'sand'); edge('wall_h'); for (let x = 16; x < W * TS; x += 48) drawStamp(c, ['banner1', 'banner2', 'banner5'][(x / 48 | 0) % 3], x, 6); break;
    case 'dock': paintGround(c, grid((x, y) => (y < 3 || y > Ht - 3) ? 2 : 4), 'grass', { detail: 0 }); break;
    case 'room': paintRoom(c, W, Ht, 0); break;
    case 'moon': paintGround(c, grid((x, y) => (Math.abs(x - 12) < 9 && Math.abs(y - 7) < 6) ? 1 : 0), 'dusk'); for (let x = 0; x < W * TS; x += 32) drawStamp(c, 'tree_dead', x, -14); c.fillStyle = 'rgba(40,20,70,.32)'; c.fillRect(0, 0, W * TS, Ht * TS); break;
    case 'snow': paintGround(c, grid(() => 0), 'snow'); for (let x = 0; x < W * TS; x += 32) drawStamp(c, 'tree_snow', x, -14); break;
    default: paintGround(c, grid(() => 0), 'grass');
  }
  return ARENA[theme] = cv;
}
