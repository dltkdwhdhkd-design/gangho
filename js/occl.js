// 가림: 사람은 처음부터 가구나 건물 그림에 가려지지 않는 자리에 세우고(field.refresh), 주인공이 건물이나 소품 뒤로 들어가면 그 그림을 옅게 그린다
// 그림의 빈 곳(투명한 곳)은 가리지 않으니 그림마다 불투명한 자리를 한 번 재 둔다
import { IMG } from './core.js';
import { ISO, frontY } from './iso.js';
import { STAMPS } from './tiles.js';

const MASK = new Map();
function mask(key, src, sx, sy, sw, sh) {
  if (MASK.has(key)) return MASK.get(key);
  if (!src || !src.width || src.complete === false) return null;  // 아직 안 불러온 그림은 재지 않는다(다음에 다시)
  let k = null;
  try {
    const w = Math.max(1, Math.round(sw / 2)), h = Math.max(1, Math.round(sh / 2)), c = document.createElement('canvas'); c.width = w; c.height = h;
    const x = c.getContext('2d', { willReadFrequently: true }); x.drawImage(src, sx, sy, sw, sh, 0, 0, w, h);
    const d = x.getImageData(0, 0, w, h).data, a = new Uint8Array(w * h); for (let i = 0; i < a.length; i++) a[i] = d[i * 4 + 3] > 140 ? 1 : 0; k = { w, h, a };
  } catch (e) { k = null; }
  MASK.set(key, k); return k;
}
const isIsoArt = s => !!(s.iso || (s.h && ISO[s.name] && IMG['iso/' + s.name]));
// 그림 상자(화면 좌표)
export function boxOf(s) {
  if (isIsoArt(s)) { const q = ISO[s.name]; return { x: s.x, y: s.y, w: s.w ?? q.w, h: s.h ?? q.h }; }
  const st = STAMPS[s.name]; if (!st) return null; const sc = s.sc || 1; return { x: s.x, y: s.y, w: st[3] * sc, h: st[4] * sc };
}
// 그 자리(화면 좌표)에 그림이 칠해져 있나
export function opaque(s, X, Y) {
  const b = boxOf(s); if (!b) return false; let u = (X - b.x) / b.w, v = (Y - b.y) / b.h; if (u < 0 || v < 0 || u >= 1 || v >= 1) return false; if (s.flip) u = 1 - u;
  let k;
  if (isIsoArt(s)) { const src = IMG['iso/' + s.name]; k = src && mask('iso/' + s.name, src, 0, 0, src.width, src.height); }
  else { const st = STAMPS[s.name], hd = IMG['stamp/' + s.name]; if (hd) k = mask('stamp/' + s.name, hd, 0, 0, hd.width, hd.height); else { const src = IMG['tiles/' + st[0]]; k = src && mask('tile/' + s.name, src, st[1], st[2], st[3], st[4]); } }
  if (!k) return false; return !!k.a[Math.min(k.h - 1, Math.floor(v * k.h)) * k.w + Math.min(k.w - 1, Math.floor(u * k.w))];
}
// 몸에서 재 보는 자리(사람 키는 14점쯤): 머리, 가슴, 허리, 무릎 양쪽
const BODY = [[0, -13], [0, -9], [0, -6], [-3, -3], [3, -3]];
export const covered = (s, X, Y) => { let n = 0; for (const [dx, dy] of BODY) if (opaque(s, X + dx, Y + dy)) n++; return n; };

// 그리기 직전, 줄 세운 목록에서 주인공 뒤에 오는(앞에 그려지는) 그림이 몸을 조금이라도 가리면 그 그림에 fade를 단다
export function mark(list, X, Y) {
  const i = list.findIndex(o => o.me); if (i < 0) return;
  for (let j = i + 1; j < list.length; j++) {
    const q = list[j]; if (!q.s) continue; const b = boxOf(q.s); if (!b || b.x > X + 5 || b.x + b.w < X - 5 || b.y > Y - 2 || b.y + b.h < Y - 14) continue;
    if (covered(q.s, X, Y)) q.fade = true;
  }
}
// 사람이 그 그림 뒤에 서 있나(그 그림이 사람보다 나중에 그려지나). front: 쿼터뷰 바깥 지도처럼 바닥 앞선으로 앞뒤를 가리는 지도
export function behind(s, X, Y, front) {
  if (front && s.iso && X >= s.x - 8 && X <= s.x + (s.w || 0) + 8) return Y <= frontY(s.iso, X);
  return (s.base ?? 0) > Y;
}
