// 쿼터뷰 마을 짜기: 집은 문 앞 땅 자리로 앉히고, 겹치면 알려 준다. 땅은 흙바닥 위주로 칠하고, 울타리와 살림 소품과 나무 무리를 둔다
// 이야기 쪽 좌표(사람이 서는 자리, 출구, 큰길)는 정면 지도와 같게 두고, 그 둘레를 새로 채운다
import { G, TS } from './core.js';
import { meta, corners } from './iso.js';
import { STAMPS } from './tiles.js';
import { fenceFor } from './isoprops.js';
const FSC = .62;  // 정면 소품(독, 팻말, 등)을 쿼터뷰 집과 사람 크기에 맞춰 줄이는 비율

const hash2 = (x, y, s) => { let h = (x * 374761393 + y * 668265263 + s * 2246822519) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
function vnoise(x, y, s) { const i = Math.floor(x), j = Math.floor(y), u = x - i, v = y - j, f = t => t * t * (3 - 2 * t), a = hash2(i, j, s), b = hash2(i + 1, j, s), c = hash2(i, j + 1, s), d = hash2(i + 1, j + 1, s); return a + (b - a) * f(u) + (c - a) * f(v) + (a - b - c + d) * f(u) * f(v); }
export const fbm = (x, y, s = 1) => vnoise(x, y, s) * .6 + vnoise(x * 2.1, y * 2.1, s + 7) * .3 + vnoise(x * 4.3, y * 4.3, s + 13) * .1;
const BI = { grass: 0, deep: 1, sand: 2, plain: 3, rose: 3, snow: 4, dusk: 5 };
// 바닥 네 모서리끼리 겹치나(볼록 사각형 분리축)
function sat(A, B, pad) { for (const P of [A, B]) for (let i = 0; i < 4; i++) { const [x1, y1] = P[i], [x2, y2] = P[(i + 1) % 4], nx = y1 - y2, ny = x2 - x1, l = Math.hypot(nx, ny) || 1; let a0 = Infinity, a1 = -Infinity, b0 = Infinity, b1 = -Infinity; for (const [x, y] of A) { const t = (x * nx + y * ny) / l; a0 = Math.min(a0, t); a1 = Math.max(a1, t); } for (const [x, y] of B) { const t = (x * nx + y * ny) / l; b0 = Math.min(b0, t); b1 = Math.max(b1, t); } if (a1 + pad <= b0 || b1 + pad <= a0) return false; } return true; }

const inQ = (Q, x, y, pad) => { for (let i = 0; i < 4; i++) { const [x1, y1] = Q[i], [x2, y2] = Q[(i + 1) % 4], cr = (x2 - x1) * (y - y1) - (y2 - y1) * (x - x1), l = Math.hypot(x2 - x1, y2 - y1); if (cr / l < pad) return false; } return true; };
const cw = Q => { const a = (Q[1][0] - Q[0][0]) * (Q[2][1] - Q[0][1]) - (Q[1][1] - Q[0][1]) * (Q[2][0] - Q[0][0]); return a < 0 ? Q.slice().reverse() : Q; };
const rectQ = (x, y, w, h) => [[x * TS, y * TS], [(x + w) * TS, y * TS], [(x + w) * TS, (y + h) * TS], [x * TS, (y + h) * TS]];
// 자리를 밀어 보는 차례: 제자리, 좌우로 반 칸씩, 앞뒤로 조금
const SLIDE = [[0, 0]]; for (let r = .5; r <= 3; r += .5) SLIDE.push([-r, 0], [r, 0], [0, r * .4], [0, -r * .4], [-r, r * .4], [r, -r * .4]);

export class Lay {
  constructor(m, seed = 1) { this.m = m; this.seed = seed; this.lots = []; this.plots = []; this.keeps = []; this.warn = []; m.bm = m.g.map(r => r.map(() => BI[m.biome] ?? 0)); m.noDress = true; m.isoNative = true; }
  // 비워 둘 자리(큰길, 광장, 사람이 서는 자리). 집과 마당이 들어오지 않는다
  keep(x, y, w, h) { this.keeps.push(cw(rectQ(x, y, w, h))); return this; }
  // 그 자리에 무엇이 걸리나. 없으면 null
  clash(Q, o = {}) {
    for (const p of this.lots) if (p !== o.self && sat(Q, p.quad, o.pad ?? 4)) return '집 ' + p.name + '@' + p.at;
    if (o.bx) for (const p of this.lots) { const b = o.bx, c = p.bx, ov = Math.max(0, Math.min(b[0] + b[2], c[0] + c[2]) - Math.max(b[0], c[0])) * Math.max(0, Math.min(b[1] + b[3], c[1] + c[3]) - Math.max(b[1], c[1])); if (ov > Math.min(b[2] * b[3], c[2] * c[3]) * .16) return '가림 ' + p.name; }  // 바닥은 안 겹쳐도 그림이 많이 겹치면 지저분하다
    if (!o.inPlot) for (const p of this.plots) if (sat(Q, p, 2)) return '마당';
    if (!o.street) for (const k of this.keeps) if (sat(Q, k, 0)) return '길';
    const W = this.m.w * TS, H = this.m.h * TS; if (Q.some(([x, y]) => x < 4 || y < 4 || x > W - 4 || y > H - 4)) return '지도 밖';
    return null;
  }
  // 집 자리 계산: 문 앞 땅 자리 (dx, dy)칸에서 앞 모서리, 바닥 네 모서리, 그림 상자
  geo(name, dx, dy, flip) {
    const q = meta(name, flip); if (!q) return null;
    const D = [dx * TS, dy * TS], t = q.door ?? .5, F = flip ? [D[0] - q.fh * t * 16, D[1] + q.fh * t * 16 * (q.rs ?? .5)] : [D[0] + q.fw * t * 16, D[1] + q.fw * t * 16 * (q.ls ?? .5)];
    const c = corners(F[0], F[1], q.fw, q.fh, q.ls, q.rs); return { q, D, F, c, quad: [c.F, c.L, c.K, c.R], bx: [F[0] - q.ax, F[1] - q.ay, q.w, q.h] };
  }
  // 살림집 마당: 집 바닥과 나란한 평행사변형. a는 왼쪽 앞면을 따라(0 → fw), b는 오른쪽 앞면을 따라(0 → fh). 문은 뒤집지 않았으면 b=0 면, 뒤집었으면 a=0 면
  plotOf(G, flip, [fr, sd, bk]) {
    const c = G.c, uL = [(c.L[0] - c.F[0]) / c.fw, (c.L[1] - c.F[1]) / c.fw], uR = [(c.R[0] - c.F[0]) / c.fh, (c.R[1] - c.F[1]) / c.fh];
    const P = (a, b) => [(c.F[0] + a * uL[0] + b * uR[0]) / TS, (c.F[1] + a * uL[1] + b * uR[1]) / TS];
    let a0, a1, b0, b1; if (flip) { a0 = -fr; a1 = c.fw + bk; b0 = -sd; b1 = c.fh + sd; } else { b0 = -fr; b1 = c.fh + bk; a0 = -sd; a1 = c.fw + sd; }
    const A = Math.ceil(a1 - a0 - .15), B = Math.ceil(b1 - b0 - .15); a1 = a0 + A; b1 = b0 + B;
    const door = flip ? (G.q.door ?? .5) * c.fh : (G.q.door ?? .5) * c.fw;
    return { P, a0, a1, b0, b1, A, B, door, Q: [P(a0, b0), P(a1, b0), P(a1, b1), P(a0, b1)].map(([x, y]) => [x * TS, y * TS]) };
  }
  // 집: 문 앞 땅 자리 (dx, dy)칸. flip이면 문이 오른쪽 앞면(남동쪽), 아니면 왼쪽 앞면(남서쪽). o.to가 있으면 들어가는 문
  // 걸리는 게 있으면 조금씩 밀어 본다(o.fixed면 안 민다). o.yard가 있으면 마당까지 들어갈 자리를 찾는다
  bld(name, dx, dy, flip = false, o = {}) {
    const m = this.m; let G = null, PL = null, at = null, why = null;
    for (const [sx, sy] of o.fixed ? [[0, 0]] : SLIDE) {
      const g = this.geo(name, dx + sx, dy + sy, flip); if (!g) { this.warn.push('그림 없음 ' + name); return this; }
      const pl = o.yard ? this.plotOf(g, flip, o.yard) : null; why = this.clash(g.quad, { street: !!o.street, bx: g.bx }) || (pl && this.clash(cw(pl.Q)));
      if (!why) { G = g; PL = pl; at = [dx + sx, dy + sy]; break; }
    }
    if (!G) { this.warn.push(`자리 없음 ${name}@${dx},${dy} (${why})`); if (!o.to && !o.must) return this; G = this.geo(name, dx, dy, flip); PL = o.yard ? this.plotOf(G, flip, o.yard) : null; at = [dx, dy]; }
    else if (at[0] !== dx || at[1] !== dy) this.warn.push(`밀림 ${name} ${dx},${dy} → ${at[0]},${at[1]}`);
    const lot = { name, at: `${at[0]},${at[1]}`, quad: G.quad, D: G.D, flip, c: G.c, bx: G.bx }; this.lots.push(lot);
    m.isoAt(name, G.F[0] / TS, G.F[1] / TS, { flip });
    if (o.to) { m.portals.push({ x: Math.round(G.D[0] - 9), y: Math.round(G.D[1] + 1), w: 18, h: 11, to: o.to, tx: o.tx ?? 6, ty: o.ty ?? 7, dir: 1, door: true, when: o.when, lock: o.lock }); this.keep(G.D[0] / TS - 1.2, G.D[1] / TS - .2, 2.4, 2.2); }  // 문 앞은 비워 둔다
    if (PL) this.fenceIn(lot, PL, flip, o); else if (o.path !== false) this.walk(at[0], at[1] + .6, o.path || 2.2, flip);
    return this;
  }
  // 빈 구역 채우기: rect [x, y, w, h]칸 안에 살림집을 이리저리 놓아 보며 들어가는 만큼 앉힌다
  // pal: [[집 이름, 무게, 마당 소품들], ...], o.flip: 문 방향(true 남동, false 남서, 함수면 x에 따라), o.tries, o.max, o.yard
  pack(rect, pal, o = {}) {
    const [rx, ry, rw, rh] = rect; let seed = this.seed * 977 + rx * 31 + ry * 7, n = 0; const R = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
    const tot = pal.reduce((s2, p) => s2 + p[1], 0), pick = () => { let r = R() * tot; for (const p of pal) if ((r -= p[1]) <= 0) return p; return pal[0]; };
    for (let i = 0; i < (o.tries || 300) && n < (o.max || 99); i++) {
      const [name, , inside] = pick(), dx = rx + R() * rw, dy = ry + R() * rh, flip = typeof o.flip === 'function' ? o.flip(dx, dy) : o.flip ?? R() < .5;
      const g = this.geo(name, dx, dy, flip); if (!g) continue; const PL = this.plotOf(g, flip, o.yard || o.bare || [3, .8, .5]), Q = cw(PL.Q);  // bare: 울타리 없이 둘레만 비운다
      if (Q.some(([x, y]) => x < rx * TS - 8 || x > (rx + rw) * TS + 8 || y < ry * TS - 8 || y > (ry + rh) * TS + 8)) continue;
      if (this.clash(g.quad, { bx: g.bx }) || this.clash(Q, { pad: 6 }) || this.plots.some(p => sat(Q, p, o.gap ?? 14))) continue;  // 이웃 마당과 사이를 띄운다
      const out = flip ? PL.P(PL.a0 - 1.4, PL.door) : PL.P(PL.door, PL.b0 - 1.4), ox = out[0] * TS, oy = out[1] * TS;  // 대문 밖이 막혀 있으면 안 된다
      if (this.lots.some(p => inQ(cw(p.quad), ox, oy, -8)) || this.plots.some(p => inQ(p, ox, oy, -8)) || ox < 8 || oy < 8 || ox > this.m.w * TS - 8 || oy > this.m.h * TS - 8 || this.m.g[Math.floor(oy / TS)]?.[Math.floor(ox / TS)] === 2) continue;
      if (o.bare) { this.bld(name, dx, dy, flip, { fixed: true, to: o.door?.(n), ...(o.door ? o.doorOpt(n) : {}) }); this.plots.push(Q); } else this.bld(name, dx, dy, flip, { fixed: true, yard: o.yard || [3, .8, .5], inside, fence: o.fence }); n++;
    }
    return this;
  }
  // 빈 땅 메우기: rect 안 빈 자리(집, 마당, 길, 물 아닌 곳)에 소품이나 나무를 n개. 쿼터뷰 소품은 iso, 정면 소품은 put
  litter(rect, names, n, o = {}) {
    const [rx, ry, rw, rh] = rect; let seed = this.seed * 131 + rx * 17 + ry * 29 + n, k = 0; const R = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
    for (let i = 0; i < n * 12 && k < n; i++) {
      const nm = names[Math.floor(R() * names.length)], x = rx + R() * rw, y = ry + R() * rh, X = x * TS, Y = y * TS, gv = this.m.g[Math.floor(y)]?.[Math.floor(x)];
      if (gv === 2 || gv === 4 || gv === 1 || gv === 3 || (o.offStreet !== false && this.keeps.some(q => inQ(q, X, Y, -10)))) continue;  // 길 위에는 안 놓는다
      const before = this.m.stamps.length; if (meta(nm)) this.iso(nm, x, y, R() < .5, { street: false }); else this.put(nm, x, y, { street: false, sc: o.sc });
      if (this.m.stamps.length > before) k++;
    }
    return this;
  }
  // 살림집: 집과 마당을 울타리로 한 바퀴 두르고 문 앞만 튼다. o.yard: [문 쪽 마당 깊이, 옆, 뒤](칸), o.inside: 마당 안 소품 이름들
  home(name, dx, dy, flip = false, o = {}) { return this.bld(name, dx, dy, flip, { yard: [3, .8, .5], ...o }); }
  fenceIn(lot, PL, flip, o) {
    const { P, a0, a1, b0, b1, A, B, door } = PL, q = meta(lot.name, flip), plot = cw(PL.Q); this.plots.push(plot); lot.plot = plot;
    const kind = o.fence || 'fence', fq = meta(kind) || meta('pfence'), fk = meta(kind) ? kind : 'pfence', st = fq.fw;  // 받은 울타리 그림 한 칸 길이(칸)만큼씩 잇는다
    const gw = Math.max(2, Math.round(1.6 / st)), gaps = [flip ? [1, Math.max(0, Math.round((door - b0) / st - gw / 2)), gw] : [0, Math.max(0, Math.round((door - a0) / st - gw / 2)), gw], ...(o.gaps || [])];
    const side = (k, n, start, sl, f2) => { const N = Math.ceil(n / st - .2); for (let i = 0; i < N; i++) { if (gaps.some(g => g[0] === k && i >= g[1] && i < g[1] + g[2])) continue; const [x, y] = start(Math.min(i * st, n - st)); this.m.isoAt(fk, x, y, { flip: f2, slope: sl }); } };
    side(0, A, t => P(a0 + t, b0), q.ls ?? .5, false); side(1, B, t => P(a0, b0 + t), q.rs ?? .5, true); side(2, A, t => P(a0 + t, b1), q.ls ?? .5, false); side(3, B, t => P(a1, b0 + t), q.rs ?? .5, true);
    // 문에서 대문까지 밟은 흙, 대문 밖으로 조금 더
    const g = this.m.g, fr = flip ? -a0 : -b0; for (let i = 0; i <= fr + 2; i += .5) { const [x, y] = flip ? P(-i, door) : P(door, -i); const X = Math.floor(x), Y = Math.floor(y); if (g[Y]?.[X] === 0) g[Y][X] = 1; }
    // 마당 안 살림: 울타리 안, 집 바닥과 대문 길을 비켜 놓을 자리를 찾는다(문에서 먼 구석부터)
    const put = [], cand = []; for (let a = a0 + .3; a < a1 - .2; a += .35) for (let b = b0 + .3; b < b1 - .2; b += .35) { const along = flip ? b - door : a - door, front = flip ? a < 0 : b < 0; if (front && Math.abs(along) < 1.3) continue; cand.push([a, b, -Math.abs(along) + (front ? -.6 : 0)]); }
    cand.sort((u, v) => u[2] - v[2]);
    for (const nm of o.inside || []) {
      const f3 = hash2(put.length, lot.D[0] * 13 + lot.D[1], this.seed) < .5, pq = meta(nm, f3); if (!pq) continue;
      for (const [a, b] of cand) {
        const [x, y] = P(a, b), cc = corners(x * TS, y * TS, pq.fw, pq.fh, pq.ls, pq.rs), Q = [cc.F, cc.L, cc.K, cc.R];
        if (!Q.every(([qx, qy]) => inQ(plot, qx, qy, 2))) continue; if (sat(Q, lot.quad, 1) || put.some(r => sat(Q, r, 1))) continue;
        put.push(Q); this.m.isoAt(nm, x, y, { flip: f3 }); break;
      }
      if (put.length < (o.inside.indexOf(nm) + 1)) this.warn.push(`마당에 못 놓음 ${nm} (${lot.name}@${lot.at}, 후보 ${cand.length})`);
    }
  }
  // 문 앞을 밟아 다진 흙길로: 문에서 바깥으로 몇 칸
  walk(x, y, n, flip) { const g = this.m.g; for (let i = 0; i < n * 2; i++) { const X = Math.floor(x + (flip ? 1 : -1) * i * .5), Y = Math.floor(y + i * .25); if (g[Y]?.[X] === 0) g[Y][X] = 1; } return this; }
  // 소품: 앞 모서리 자리(칸). 쿼터뷰 소품이면 바닥 마름모로 막고, 정면 소품이면 그 소품의 막힘 상자를 쓴다
  iso(name, x, y, flip = false, o = {}) {
    const q = meta(name, flip); if (!q) { this.warn.push('그림 없음 ' + name); return this; }
    const c = corners(x * TS, y * TS, q.fw, q.fh, q.ls, q.rs); if (!o.force && this.clash([c.F, c.L, c.K, c.R], { pad: 2, street: o.street ?? true })) return this;  // 집이나 마당에 걸리면 안 놓는다
    this.m.isoAt(name, x, y, { flip, nosolid: o.nosolid }); return this;
  }
  // 정면 소품은 줄여서, 밑동 가운데 자리는 그대로. 밑동이 집이나 마당 안이면 안 놓는다
  put(name, x, y, o = {}) {
    const S = STAMPS[name], sc = o.sc ?? FSC; if (!S) return this; const X = x - S[3] * (1 - sc) / 32, Y = y - S[4] * (1 - sc) / 16, bx = (X + S[3] * sc / 32) * TS, by = (Y + S[4] * sc / 16) * TS;
    if (!o.force && (this.lots.some(p => inQ(cw(p.quad), bx, by, -4)) || this.plots.some(p => inQ(p, bx, by, -4)) || (o.street === false && this.keeps.some(k => inQ(k, bx, by, 0))))) return this;
    this.m.put(name, X, Y, { sc, ...o }); return this;
  }
  // 울타리: (x, y) 앞 끝에서 n칸. 'l'은 왼쪽 위로, 'r'은 오른쪽 위로
  fence(x, y, n, dir = 'l', kind = 'pfence') { this.m.isoWall(kind, x, y, n, dir); return this; }
  // 울타리로 두른 마당: 앞 모서리 (x, y)에서 왼쪽 위로 a칸, 오른쪽 위로 b칸. gap은 [변 번호(0 앞왼, 1 앞오른, 2 뒤왼, 3 뒤오른), 시작, 길이]
  yard(x, y, a, b, gaps = [], kind = 'pfence') {
    const L = [x - a, y - a * .5], R = [x + b, y - b * .5], K = [L[0] + b, L[1] - b * .5];
    const sides = [[x, y, a, 'l'], [x, y, b, 'r'], [R[0], R[1], a, 'l'], [L[0], L[1], b, 'r']];
    sides.forEach(([sx, sy, n, dir], k) => { let i = 0; const gs = gaps.filter(g => g[0] === k); while (i < n) { const gp = gs.find(g => i >= g[1] && i < g[1] + g[2]); if (gp) { i = gp[1] + gp[2]; continue; } const nx = sx + (dir === 'l' ? -i : i), ny = sy - i * .5; this.m.isoAt(kind, nx, ny, { flip: dir === 'r' }); i++; } });
    return this;
  }
  // 나무 무리: 가운데 (cx, cy)칸 둘레 r칸 안에 n그루. 쿼터뷰 나무와 정면 나무를 섞는다
  grove(cx, cy, n, r = 2, kinds = ['tree_round', 'plum_g', 'tree_round', 'tree_big']) {
    for (let i = 0; i < n; i++) { const a = hash2(i, cx * 7 + cy, this.seed) * Math.PI * 2, d = Math.sqrt(hash2(i, cy * 5 + cx, this.seed + 3)) * r, x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d * .6, k = kinds[i % kinds.length];
      if (meta(k)) this.iso(k, x, y, hash2(i, 9, this.seed) < .5, { street: false }); else this.put(k, x - 1, y - 2, { sc: .8, street: false }); }
    return this;
  }
  // 흙바닥: 타원 몇 개를 합친 자리를 sand로. 가장자리는 잡음으로 흔든다
  dirt(blobs, kind = 'sand') {
    const B = this.m.bm, v = BI[kind];
    for (let y = 0; y < B.length; y++) for (let x = 0; x < B[0].length; x++) { let s = 0; for (const [cx, cy, rx, ry] of blobs) s = Math.max(s, 1 - Math.hypot((x - cx) / rx, (y - cy) / ry)); if (s + (fbm(x * .16, y * .16, this.seed) - .5) * .55 > .06) B[y][x] = v; }
    return this;
  }
  // 짙은 흙 얼룩: 흙바닥 위에 밟아 다진 자국을 구름처럼. 길(g=1)은 그대로 두고 칠할 때만 쓴다
  blotch(dens = .5) {
    const m = this.m, P = m.g.map(r => r.slice());
    for (let y = 0; y < P.length; y++) for (let x = 0; x < P[0].length; x++) {
      if (P[y][x] === 2 || P[y][x] > 2) continue; const road = m.g[y][x] === 1, n = fbm(x * .3, y * .3, this.seed + 21), n2 = fbm(x * .55 + 9, y * .55, this.seed + 5);
      P[y][x] = m.bm[y][x] === BI.sand && (n * .75 + n2 * .25) > (road ? .58 - dens * .1 : .66 - dens * .06) ? 1 : 0;  // 큰길도 띠가 아니라 얼룩으로. 밟는 자리일수록 조금 더 짙다
    }
    m.gPaint = P; return this;
  }
  // 넓은 마당이나 거리: 칸을 길로
  open(x, y, w, h) { this.m.fillRaw(Math.round(x), Math.round(y), Math.round(w), Math.round(h), 1); return this.keep(x, y, w, h); }
}
