// 쿼터뷰 마을 살림 소품을 도트로 그려 둔다: 울타리, 장작더미, 짚더미, 우물, 곡식 자루, 손수레, 건조대, 좌판, 평상, 나무 궤짝
// 받은 그림(QB62~65)이 오면 그 그림이 이 이름을 덮어쓴다. 그 전까지 마을이 휑하지 않게 쓰는 자리 메우기
// 그림은 논리 점 하나를 2×2로 쪼개 그린다(R = 2). 칸 걸음: 왼쪽 앞면 (-16, -8), 오른쪽 앞면 (+16, -8)
import { IMG } from './core.js';
import { ISO } from './iso.js';

const R = 2;
function sheet(w, h) {
  const c = document.createElement('canvas'); c.width = w * R; c.height = h * R; const x = c.getContext('2d');
  const px = (a, b, col) => { x.fillStyle = col; x.fillRect(Math.round(a), Math.round(b), 1, 1); };
  const rect = (a, b, w2, h2, col) => { x.fillStyle = col; x.fillRect(Math.round(a), Math.round(b), Math.round(w2), Math.round(h2)); };
  const line = (x0, y0, x1, y1, col, t = 1) => { x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1); const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1; let e = dx + dy; x.fillStyle = col; for (; ;) { x.fillRect(x0 - (t > 1 ? t >> 1 : 0), y0 - (t > 1 ? t >> 1 : 0), t, t); if (x0 === x1 && y0 === y1) break; const e2 = 2 * e; if (e2 >= dy) { e += dy; x0 += sx; } if (e2 <= dx) { e += dx; y0 += sy; } } };
  const poly = (P, col) => { // 점 가운데로 훑는 다각형 채우기. 안티앨리어싱 없이
    const ys = P.map(p => p[1]), y0 = Math.floor(Math.min(...ys)), y1 = Math.ceil(Math.max(...ys)); x.fillStyle = col;
    for (let y = y0; y <= y1; y++) { const yc = y + .5, xs = []; for (let i = 0; i < P.length; i++) { const [ax, ay] = P[i], [bx, by] = P[(i + 1) % P.length]; if ((ay <= yc && by > yc) || (by <= yc && ay > yc)) xs.push(ax + (yc - ay) / (by - ay) * (bx - ax)); } xs.sort((a, b) => a - b); for (let i = 0; i + 1 < xs.length; i += 2) { const a = Math.round(xs[i]), b = Math.round(xs[i + 1]); if (b > a) x.fillRect(a, y, b - a, 1); } }
  };
  const edge = (P, col) => { for (let i = 0; i < P.length; i++) line(...P[i], ...P[(i + 1) % P.length], col); };
  const ell = (cx, cy, rx, ry, col) => { x.fillStyle = col; for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) { const t = 1 - ((y + .5 - cy) / ry) ** 2; if (t < 0) continue; const w2 = rx * Math.sqrt(t); x.fillRect(Math.round(cx - w2), y, Math.round(cx + w2) - Math.round(cx - w2), 1); } };
  return { c, x, px, rect, line, poly, edge, ell };
}
// 칸 좌표(a: 왼쪽 앞면 쪽으로 몇 칸, b: 오른쪽 앞면 쪽으로 몇 칸, z: 위로 논리 점)를 그림 점으로
const at = (F, a, b, z = 0) => [F[0] + (-a + b) * 16 * R, F[1] + (-a - b) * 8 * R - z * R];
// 상자 하나: 바닥 a0..a1, b0..b1, 높이 z0..z1. 왼쪽 면, 오른쪽 면, 윗면을 칠하고 테두리를 두른다
function box(S, F, a0, a1, b0, b1, z0, z1, col) {
  const [top, lf, rt, ln] = col, p = (a, b, z) => at(F, a, b, z);
  S.poly([p(a1, b0, z0), p(a0, b0, z0), p(a0, b0, z1), p(a1, b0, z1)], lf);   // 왼쪽 앞면(b0 쪽)
  S.poly([p(a0, b0, z0), p(a0, b1, z0), p(a0, b1, z1), p(a0, b0, z1)], rt);   // 오른쪽 앞면(a0 쪽)
  S.poly([p(a0, b0, z1), p(a0, b1, z1), p(a1, b1, z1), p(a1, b0, z1)], top);
  S.edge([p(a1, b0, z0), p(a0, b0, z0), p(a0, b1, z0), p(a0, b1, z1), p(a1, b1, z1), p(a1, b0, z1)], ln); S.line(...p(a0, b0, z0), ...p(a0, b0, z1), ln); S.line(...p(a0, b0, z1), ...p(a1, b0, z1), ln); S.line(...p(a0, b0, z1), ...p(a0, b1, z1), ln);
}
const WOOD = ['#a9784a', '#8a5d36', '#6b4628', '#3a2616'], DARKW = ['#8a6040', '#6d4a2c', '#553820', '#30200f'];
// 그림을 등록: 그림 크기(w, h 논리 점), 앞 모서리 자리(ax, ay), 바닥 칸(fw, fh)
function reg(name, S, w, h, ax, ay, fw, fh) { if (ISO[name] && !ISO[name].made) return; const c = S.c; c.hd = R; IMG['iso/' + name] = c; ISO[name] = { w, h, ax, ay, fw, fh, ls: .5, rs: .5, made: 1 }; }  // 받은 그림이 있으면 그걸 쓴다

// 울타리 한 칸: 앞 모서리에서 왼쪽 위로 한 칸(가로 16점, 세로 16×sl점). 말뚝을 고르게 박고 가로대 두 줄을 이웃 칸과 이어지게
// 집 그림마다 밑선 기울기(sl)가 달라서, 집을 두르는 울타리는 그 집 기울기로 따로 그린다(fenceFor)
const FCOL = { pfence: [10, ['#b0814f', '#8a6038', '#5e3f24', '#33220f']], pfence_d: [13, ['#8a7a68', '#6a5c4c', '#4a4034', '#26201a']] };
function fence(name, tall, col, sl = .5) {
  const dy = Math.ceil(16 * sl), w = 20, h = tall + dy + 4, S = sheet(w, h), F = [17 * R, (h - 1) * R];
  const P = (t, z) => [F[0] - t * 16 * R + .06 * 16 * R, F[1] - t * 16 * sl * R - .06 * 8 * R - z * R];
  for (const z of [tall * .35, tall * .72]) { const [a0, b0] = P(-.02, z), [a1, b1] = P(1.02, z); S.line(a0, b0 + 1, a1, b1 + 1, col[3], 1); }
  for (let i = 0; i < 6; i++) {
    const t = (i + .5) / 6, [x0, y0] = P(t, 0), hh = (tall - (i % 2) * 1.5) * R, X = Math.round(x0) - 1;
    S.rect(X - 1, y0 - hh, 4, hh + 1, col[3]); S.rect(X, y0 - hh + 1, 2, hh - 1, col[1]); S.px(X, y0 - hh + 1, col[0]); S.rect(X, y0 - hh + 2, 1, hh - 3, col[0]); S.rect(X + 1, y0 - hh - 1, 1, 2, col[3]);
  }
  for (const z of [tall * .35, tall * .72]) { const [a0, b0] = P(-.02, z), [a1, b1] = P(1.02, z); S.line(a0, b0, a1, b1, col[2], 1); S.line(a0, b0 - 1, a1, b1 - 1, col[1], 1); }
  reg(name, S, w, h, 17, h - 1, 1, .4); ISO[name].ls = sl;
}
export function fenceFor(kind, sl) { const k = Math.round(sl * 40) / 40, name = `${kind}@${k}`; if (!ISO[name]) { const [t, c] = FCOL[kind] || FCOL.pfence; fence(name, t, c, k); } return name; }
function woodpile() { // 장작더미: 통나무 끝이 왼쪽 앞면으로 보이게 3·2·1로 쌓는다
  const w = 30, h = 22, S = sheet(w, h), F = [16 * R, (h - 2) * R];
  box(S, F, 0, 1.4, 0, .25, 0, 1.2, ['#5b4430', '#4a3624', '#3c2b1c', '#241810']);
  const rows = [[0, 3], [1, 2], [2, 1]];
  for (const [r, n] of rows) for (let i = 0; i < n; i++) {
    const a = .25 + i * .42 + r * .21, [cx, cy] = at(F, a, 0, 3.4 + r * 4.6), [bx, by] = at(F, a, 1.1, 3.4 + r * 4.6);
    S.poly([[cx - 2, cy - 4.6 * R / 2], [bx - 2, by - 4.6 * R / 2], [bx + 2, by + 4.6 * R / 2], [cx + 2, cy + 4.6 * R / 2]], '#7a5232');
    S.line(cx, cy - 4.4, bx, by - 4.4, '#9b6c42'); S.line(cx + 1, cy + 4, bx + 1, by + 4, '#4a301a');
  }
  for (const [r, n] of rows) for (let i = 0; i < n; i++) { const a = .25 + i * .42 + r * .21, [cx, cy] = at(F, a, 0, 3.4 + r * 4.6); S.ell(cx, cy, 5, 4.6, '#3a2616'); S.ell(cx, cy, 4, 3.7, '#d9b27a'); S.ell(cx, cy, 2.4, 2.2, '#b88a52'); S.px(cx, cy, '#8a6038'); }
  reg('woodpile', S, w, h, 16, h - 2, 1.5, 1.2);
}
function haystack() { // 짚더미: 둥근 짚 봉우리에 결을 긋고 위를 새끼로 묶는다
  const w = 24, h = 24, S = sheet(w, h), cx = 12 * R, by = (h - 3) * R;
  const RW = y => { const t = y / (18 * R); return 10.5 * Math.sqrt(Math.max(0, 1 - t ** 2.4)) * R; };  // 밑은 넓고 위로 갈수록 둥글게 좁아진다
  for (let y = 0; y < 18 * R; y++) { const t = y / (18 * R), rw = RW(y); S.rect(cx - rw, by - y, rw * 2, 1, t > .62 ? '#ecd17c' : t > .28 ? '#d6b25a' : '#b48c3c'); }
  for (let i = 0; i < 26; i++) { const a = (i * 47) % 100 / 100, xx = cx + (a - .5) * 18 * R, yy = by - 2 - ((i * 31) % 60) / 60 * 14 * R; S.line(xx, yy, xx + 2, yy + 5, i % 3 ? '#a88232' : '#f5df98'); }
  for (let y = 0; y < 18 * R; y++) { const rw = RW(y); S.px(cx - rw, by - y, '#6e5222'); S.px(cx + rw - 1, by - y, '#6e5222'); }
  S.ell(cx, by - 17 * R, 3 * R, 1.4 * R, '#8a6a2a'); S.rect(cx - 9 * R, by - 7 * R, 18 * R, 2, '#8a6a2a'); S.rect(cx - 1, by - 21 * R, 2, 4 * R, '#7a5a24');
  reg('haystack', S, w, h, 12, h - 3, 1, 1);
}
function well() { // 우물: 돌로 둥글게 쌓은 통, 안은 검은 물, 위에 두레박 틀
  const w = 26, h = 30, S = sheet(w, h), cx = 13 * R, by = (h - 4) * R, rx = 10 * R, ry = 5 * R, ht = 8 * R;
  S.ell(cx, by, rx + 1, ry + 1, '#2b2a2c'); S.rect(cx - rx, by - ht, rx * 2, ht, '#7f7c78');
  for (let r = 0; r < 3; r++) for (let i = 0; i < 7; i++) { const x0 = cx - rx + ((i + (r % 2) * .5) / 7) * rx * 2, y0 = by - ht + r * (ht / 3) + 2; S.rect(x0, y0, rx * 2 / 7 - 2, ht / 3 - 2, r === 2 ? '#6c6965' : '#9a9690'); S.rect(x0, y0, rx * 2 / 7 - 2, 1, '#b8b4ae'); }
  S.ell(cx, by, rx, ry, '#7f7c78'); S.ell(cx, by - ht, rx, ry, '#a9a59e'); S.ell(cx, by - ht, rx - 3 * R, ry - 1.6 * R, '#3c3a3a'); S.ell(cx, by - ht + 1, rx - 4 * R, ry - 2.4 * R, '#1d2a30');
  S.rect(cx - rx, by - ht, 1, ht, '#3a3836'); S.rect(cx + rx - 1, by - ht, 1, ht, '#3a3836');
  for (const sx of [-1, 1]) { const X = cx + sx * (rx - 2 * R); S.rect(X - 2, by - ht - 14 * R, 4, 14 * R + 2, '#3a2616'); S.rect(X - 1, by - ht - 14 * R, 2, 14 * R, '#8a5d36'); }
  S.rect(cx - rx + R, by - ht - 14 * R - 2, rx * 2 - 2 * R, 4, '#3a2616'); S.rect(cx - rx + R, by - ht - 14 * R - 1, rx * 2 - 2 * R, 2, '#a9784a');
  S.rect(cx - 1, by - ht - 13 * R, 1, 8 * R, '#c8b8a0'); S.rect(cx - 3, by - ht - 5 * R, 6, 6, '#5a3a20'); S.rect(cx - 2, by - ht - 5 * R + 1, 4, 3, '#8a5d36');
  reg('well_i', S, w, h, 13, h - 4 + 5, 1.1, 1.1);
}
function sacks() { // 곡식 자루 서넛: 흰 무명 자루, 주둥이를 끈으로 묶었다
  const w = 24, h = 16, S = sheet(w, h), base = (h - 2) * R;
  for (const [cx, cy, sw] of [[8, 0, 7], [16, -1, 7], [12, -6, 6.5]]) {
    const X = cx * R, Y = base + cy * R; S.ell(X, Y - 4 * R, sw * R + 1, 5 * R + 1, '#4a4038'); S.ell(X, Y - 4 * R, sw * R, 5 * R, '#e8e0cc'); S.ell(X - 2, Y - 5 * R, sw * R * .7, 3.4 * R, '#f6f2e4'); S.ell(X + 3, Y - 2.6 * R, sw * R * .6, 2 * R, '#c9bfa6');
    S.rect(X - 2, Y - 10 * R, 4, 3 * R, '#c9bfa6'); S.rect(X - 3, Y - 8 * R, 6, 2, '#8a6a3a');
  }
  reg('sacks', S, w, h, 12, h - 2, 1.2, .8);
}
function cart() { // 손수레: 판자 짐칸에 바퀴 둘, 앞으로 뻗은 손잡이
  const w = 40, h = 26, S = sheet(w, h), F = [22 * R, (h - 4) * R];
  for (const b of [.05, 1.15]) { const [cx, cy] = at(F, .9, b, 4.6); S.ell(cx, cy, 4.8 * R + 1, 5.2 * R + 1, '#2a1b10'); S.ell(cx, cy, 4.8 * R, 5.2 * R, '#7a5232'); S.ell(cx, cy, 3.4 * R, 3.8 * R, '#2a1b10'); S.ell(cx, cy, 1.2 * R, 1.3 * R, '#a9784a'); for (let k = 0; k < 4; k++) { const an = k * Math.PI / 4; S.line(cx + Math.cos(an) * 3.4 * R, cy + Math.sin(an) * 3.8 * R, cx - Math.cos(an) * 3.4 * R, cy - Math.sin(an) * 3.8 * R, '#7a5232'); } if (b > 1) break; }
  box(S, F, 0, 1.9, .2, 1.1, 5, 7.5, WOOD); box(S, F, 0, 1.9, .2, .32, 7.5, 10, DARKW); box(S, F, 1.75, 1.9, .2, 1.1, 7.5, 10, DARKW);
  const [hx0, hy0] = at(F, 0, .35, 7), [hx1, hy1] = at(F, -1.4, .35, 4); S.line(hx0, hy0, hx1, hy1, '#3a2616', 3); S.line(hx0, hy0 - 1, hx1, hy1 - 1, '#a9784a'); const [gx0, gy0] = at(F, 0, 1, 7), [gx1, gy1] = at(F, -1.4, 1, 4); S.line(gx0, gy0, gx1, gy1, '#3a2616', 3); S.line(gx0, gy0 - 1, gx1, gy1 - 1, '#a9784a');
  { const [cx, cy] = at(F, .9, 1.15, 4.6); S.ell(cx, cy, 4.8 * R + 1, 5.2 * R + 1, '#2a1b10'); S.ell(cx, cy, 4.8 * R, 5.2 * R, '#8a5d36'); S.ell(cx, cy, 3.4 * R, 3.8 * R, '#3a2616'); S.ell(cx, cy, 1.2 * R, 1.3 * R, '#c8a070'); for (let k = 0; k < 4; k++) { const an = k * Math.PI / 4; S.line(cx + Math.cos(an) * 3.4 * R, cy + Math.sin(an) * 3.8 * R, cx - Math.cos(an) * 3.4 * R, cy - Math.sin(an) * 3.8 * R, '#8a5d36'); } }
  reg('cart_i', S, w, h, 22, h - 4, 2, 1.2);
}
function rack() { // 건조대: 기둥 둘에 장대를 걸고 고추 꿰미와 마른 생선을 매달았다
  const w = 22, h = 28, S = sheet(w, h), F = [19 * R, (h - 2) * R];
  for (const a of [0, 1]) { const [x0, y0] = at(F, a, .1); S.rect(x0 - 2, y0 - 22 * R, 4, 22 * R, '#3a2616'); S.rect(x0 - 1, y0 - 22 * R + 1, 2, 22 * R - 2, '#8a5d36'); }
  const [p0, q0] = at(F, -.05, .1, 21), [p1, q1] = at(F, 1.05, .1, 21); S.line(p0, q0, p1, q1, '#3a2616', 3); S.line(p0, q0 - 1, p1, q1 - 1, '#b88a5a');
  for (let i = 0; i < 5; i++) { const t = .14 + i * .18, [x0, y0] = at(F, t, .1, 20); if (i % 2) { for (let k = 0; k < 6; k++) { S.rect(x0 - 2, y0 + k * 3 + 1, 4, 3, k % 2 ? '#b82a1c' : '#d8402a'); S.px(x0 - 2, y0 + k * 3 + 1, '#6a140c'); } } else { S.rect(x0, y0, 1, 3, '#c8b8a0'); S.ell(x0, y0 + 9, 2.2, 6, '#5a5048'); S.ell(x0, y0 + 9, 1.4, 5, '#9a8c7a'); S.rect(x0 - 2, y0 + 15, 5, 2, '#5a5048'); } }
  reg('rack_i', S, w, h, 19, h - 2, 1, .3);
}
function stall() { // 좌판: 네 기둥에 짙은 천 차양, 아래 나무 판 위에 독과 광주리
  const w = 44, h = 38, S = sheet(w, h), F = [24 * R, (h - 3) * R];
  box(S, F, .1, 1.9, .1, .9, 0, 7, WOOD);
  for (const [a, b] of [[.1, .9], [1.9, .9], [1.9, .1]]) { const [x0, y0] = at(F, a, b, 0); S.rect(x0 - 1, y0 - 20 * R, 3, 20 * R, '#3a2616'); }
  const goods = [[.45, .5, '#7a3a22'], [.95, .5, '#c89a5a'], [1.45, .55, '#7a3a22'], [.7, .25, '#5a7a3a'], [1.25, .3, '#d8c8a0']];
  for (const [a, b, col] of goods) { const [x0, y0] = at(F, a, b, 7); S.ell(x0, y0 - 3, 4, 4, '#2a1b10'); S.ell(x0, y0 - 3, 3, 3, col); S.px(x0 - 1, y0 - 5, 'rgba(255,255,255,.6)'); }
  const T = [at(F, -.05, -.05, 21), at(F, 2.05, -.05, 21), at(F, 2.05, 1.05, 23), at(F, -.05, 1.05, 23)];
  S.poly(T, '#3e4650'); S.poly([T[0], T[1], [T[1][0], T[1][1] + 6], [T[0][0], T[0][1] + 6]], '#2e343c'); S.edge(T, '#1c2026');
  for (let i = 0; i < 9; i++) { const t = i / 8, x0 = T[0][0] + (T[1][0] - T[0][0]) * t, y0 = T[0][1] + (T[1][1] - T[0][1]) * t; S.rect(x0 - 1, y0 + 4, 3, 4, '#2e343c'); }
  { const [x0, y0] = at(F, .1, .1, 0); S.rect(x0 - 1, y0 - 20 * R, 3, 20 * R, '#3a2616'); S.rect(x0, y0 - 20 * R, 1, 20 * R, '#8a5d36'); }
  reg('stall_i', S, w, h, 24, h - 3, 2, 1);
}
function bench() { // 평상: 낮고 넓은 나무 마루
  const w = 40, h = 20, S = sheet(w, h), F = [20 * R, (h - 2) * R];
  for (const [a, b] of [[.1, .1], [1.9, .1], [.1, 1.1], [1.9, 1.1]]) box(S, F, a, a + .15, b, b + .15, 0, 4, DARKW);
  box(S, F, 0, 2, 0, 1.25, 4, 6, WOOD);
  for (let i = 1; i < 5; i++) { const [x0, y0] = at(F, 0, i * .25, 6), [x1, y1] = at(F, 2, i * .25, 6); S.line(x0, y0, x1, y1, '#8a5d36'); }
  reg('bench_i', S, w, h, 20, h - 2, 2, 1.25);
}
function crates() { // 나무 궤짝 둘
  const w = 26, h = 22, S = sheet(w, h), F = [13 * R, (h - 2) * R];
  box(S, F, 0, .8, 0, .8, 0, 9, WOOD); box(S, F, .1, .7, .1, .7, 9, 16, ['#b88a5a', '#966a40', '#74502e', '#3a2616']);
  for (const z of [3, 6]) { const [x0, y0] = at(F, 0, 0, z), [x1, y1] = at(F, .8, 0, z); S.line(x0, y0, x1, y1, '#5a3a20'); }
  reg('crates_i', S, w, h, 13, h - 2, .8, .8);
}
for (const k in FCOL) fence(k, ...FCOL[k]);
woodpile(); haystack(); well(); sacks(); cart(); rack(); stall(); bench(); crates();
