// 쿼터뷰(2:1 아이소메트릭) 소품. 땅은 화면 평면 그대로 두고, 건물과 담과 가구만 45도 돌려 앉힌다
// 바닥 마름모는 앞 모서리 F(화면에서 가장 아래 점)를 기준으로 잡는다.
//   왼쪽 앞면: F에서 왼쪽 위로 fw칸 → L,  오른쪽 앞면: F에서 오른쪽 위로 fh칸 → R,  뒷 모서리 K
//   한 칸은 화면에서 가로 32, 세로 16 마름모다. 한 칸 걸음은 (±16, -8)
//   그림마다 바닥선 기울기가 조금씩 다르면(ls, rs: 가로 1에 세로 몇) 그 기울기를 그대로 따른다. 없으면 0.5
import { IMG } from './core.js';
import { ISOMETA } from './isometa.js';

export const IS = 16, IH = 8;
export const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
// 소품 정보: 그림 크기(w, h, 논리 점), 그림 안 앞 모서리 자리(ax, ay), 바닥 칸(fw, fh)
// 바깥 건물과 나무는 받은 그림보다 작게 앉힌다. 사람 키(15)에 견주어 집이 너무 커서 마을이 듬성해 보였다. 방 안 가구는 그대로
export const ISO_SC = .62;
const ROOMY = new Set(['bed', 'table', 'counter', 'bookshelf', 'wineshelf', 'medchest', 'weaponrack', 'screen', 'throne', 'stove', 'watertank', 'ricechest', 'censer', 'pillar', 'standlamp', 'flowerpot', 'scroll', 'crates']);
// 본전과 큰 관청은 조금 덜 줄여 위엄을 남기고, 담 한 칸은 사람 어깨 높이가 되게 줄이지 않는다
const SC_OF = k => ROOMY.has(k) || /^(wall_tile|wall_stone|hedge|fence_bamboo)$/.test(k) ? 1 : /^hall_/.test(k) ? .8 : /^(yamen|city_gate)$/.test(k) ? .7 : ISO_SC;
export const ISO = Object.fromEntries(Object.entries(ISOMETA).map(([k, v]) => { const sc = SC_OF(k); return [k, sc === 1 ? v : { ...v, w: v.w * sc, h: v.h * sc, ax: v.ax * sc, ay: v.ay * sc, fw: v.fw * sc, fh: v.fh * sc }]; }));
// 좌우를 뒤집으면 왼쪽 앞면과 오른쪽 앞면이 바뀐다
export function meta(name, flip) { const q = ISO[name]; if (!q) return null; return flip ? { ...q, ax: q.w - q.ax, fw: q.fh, fh: q.fw, ls: q.rs, rs: q.ls } : q; }
export function corners(fx, fy, fw, fh, ls = .5, rs = .5) {
  const L = [fx - fw * IS, fy - fw * IS * ls], R = [fx + fh * IS, fy - fh * IS * rs];
  return { F: [fx, fy], L, R, K: [L[0] + R[0] - fx, L[1] + R[1] - fy], fw, fh };
}
// 앞쪽 테두리(L-F-R)가 x 자리에서 갖는 높이. 이 선보다 아래(큰 y)에 선 사람은 소품 앞에 그린다
export function frontY(c, x) {
  if (x <= c.F[0]) { const t = clamp((x - c.L[0]) / Math.max(1, c.F[0] - c.L[0]), 0, 1); return c.L[1] + (c.F[1] - c.L[1]) * t; }
  const t = clamp((x - c.F[0]) / Math.max(1, c.R[0] - c.F[0]), 0, 1); return c.F[1] + (c.R[1] - c.F[1]) * t;
}
// 마름모 안인가. pad만큼 안으로 줄여서 본다
export function inside(c, x, y, pad = 0) {
  const ux = c.L[0] - c.F[0], uy = c.L[1] - c.F[1], vx = c.R[0] - c.F[0], vy = c.R[1] - c.F[1], det = ux * vy - uy * vx; if (!det) return false;
  const dx = x - c.F[0], dy = y - c.F[1], a = (dx * vy - dy * vx) / det * c.fw, b = (ux * dy - uy * dx) / det * c.fh, p = pad / IS;
  return a > p && b > p && a < c.fw - p && b < c.fh - p;
}
// 발 상자(가로 w, 세로 h, 발끝 px,py)가 마름모와 겹치나
export function hitsBox(c, px, py, w, h) {
  const x0 = px - w / 2, x1 = px + w / 2, y0 = py - h, y1 = py;
  if (x1 < c.L[0] || x0 > c.R[0] || y1 < c.K[1] || y0 > c.F[1]) return false;
  for (const [x, y] of [[x0, y0], [x1, y0], [x0, y1], [x1, y1], [px, y1], [px, y0]]) if (inside(c, x, y, 1)) return true;
  for (const [x, y] of [c.F, c.L, c.R, c.K]) if (x > x0 && x < x1 && y > y0 && y < y1) return true;
  return false;
}
// 그리기. flip이면 좌우를 뒤집는다
export function drawIso(ctx, s) {
  const im = IMG['iso/' + s.name], q = ISO[s.name]; if (!im || !q) return;
  if (s.sk) { // 담 한 칸을 이웃 집 밑선 기울기에 맞춰 세로로만 민다(기둥은 곧게 선 채로)
    const Fx = s.x + (s.flip ? q.w - q.ax : q.ax), k = s.flip ? s.sk : -s.sk; ctx.save(); ctx.transform(1, k, 0, 1, 0, -k * Fx); drawIso(ctx, { ...s, sk: 0 }); ctx.restore(); return;
  }
  if (!s.flip) { ctx.drawImage(im, s.x, s.y, q.w, q.h); return; }
  ctx.save(); ctx.translate(s.x + q.w, s.y); ctx.scale(-1, 1); ctx.drawImage(im, 0, 0, q.w, q.h); ctx.restore();
}
// 그릴 순서: 소품은 앞 모서리 높이로, 사람은 발 높이로 줄을 세우되, 겹친 소품과는 앞뒤를 따져 끼워 넣는다
export function orderKeys(list) {
  const isos = list.filter(o => o.s && o.s.iso);
  for (const o of list) {
    if (!o.actor) continue; let k = o.y; const x = o.x;
    for (const p of isos) {
      const c = p.s.iso, q = p.s; if (x < q.x - 8 || x > q.x + q.w + 8 || o.y < q.y || o.y - 28 > c.F[1]) continue; // 그림과 안 겹치면 상관없다
      if (o.y > frontY(c, x)) k = Math.max(k, p.y + .01); else k = Math.min(k, p.y - .01);
    }
    o.y = k;
  }
}
