// 쿼터뷰 미리보기의 방 안. 방은 그대로 네모 칸(이야기, 사람 자리, 가구 충돌이 다 여기서 돈다)이고
// 그릴 때만 마름모로 눕힌다: 칸 좌표 (x, y)는 화면 (x - y, (x + y) / 2)로 간다. 위쪽 벽(y=0)은 오른쪽 뒷벽, 왼쪽 벽(x=0)은 왼쪽 뒷벽이 된다
import { TS, IMG } from './core.js';
import { STAMPS, drawStamp } from './tiles.js';
import { meta, corners } from './iso.js';

const WH = 46, M = 6, LIP = 7;  // 벽 높이, 둘레 여백, 바닥 두께
// 방 가구를 쿼터뷰 소품으로 바꿔 그릴 이름. 그림이 오기 전엔 정면 그림을 그대로 세운다
const FURN_ISO = { f_bed: 'bed', bed: 'bed', longtable: 'table', counter: 'counter', bookcase: 'bookshelf', bookcase2: 'bookshelf', shelf: 'wineshelf', shelf2: 'medchest', drawer: 'medchest', rack: 'weaponrack', screen: 'screen', f_chair: 'throne', f_stove: 'stove', jar: 'watertank', chest: 'ricechest', censer: 'censer', pillar: 'pillar', f_lamp: 'standlamp', lantern: 'standlamp', plant: 'flowerpot', f_bonsai: 'flowerpot', f_scroll: 'scroll', box: 'crates' };
const PAL = {
  wood: { plaster: '#d8c7a2', plaster2: '#c9b48c', panel: '#7a5232', panel2: '#5e3c24', post: '#5a3420', beam: '#3a2414', win: '#f1e3b6', lip: '#2a1a10' },
  red: { plaster: '#dccaa4', plaster2: '#cbb48a', panel: '#7a3a26', panel2: '#5c2a1a', post: '#8a2a1c', beam: '#3a1a10', win: '#f3e1b0', lip: '#2a140c' },
  dark: { plaster: '#4a404c', plaster2: '#3c3340', panel: '#2e2632', panel2: '#221c26', post: '#1e161c', beam: '#120c10', win: '#6c6a8a', lip: '#0e0a0c' },
};
const RED = new Set(['hall', 'gov', 'temple', 'elder', 'gamble', 'bokun', 'shrine', 'hall_in', 'hall2']);

export function isIsoRoom(m) { return !!m.isoRoom; }
// 칸 좌표 → 방 그림 좌표
export function proj(m, x, y) { const r = m.isoRoom; return [x - y + r.ox, (x + y) / 2 + r.oy]; }
// 화면 방향(dx, dy) → 칸 방향. 화면에서 같은 빠르기로 움직이게 한다
export function toGrid(dx, dy) { return [dy + dx / 2, dy - dx / 2]; }
// 칸 방향 → 화면 방향
export function toScreen(dx, dy) { return [dx - dy, (dx + dy) / 2]; }

export function buildIsoRoom(m, floor, flatTex) {  // flatTex: 이미 비스듬히 그린 마루 그림. 있으면 화면에 그대로 깐다
  const W = m.w * TS, H = m.h * TS, x0 = 6, y0 = TS, x1 = W - 6, y1 = H - 6;
  const ox = y1 - x0 + M, oy = WH + M + 4 - (x0 + y0) / 2;
  m.isoRoom = { ox, oy, x0, y0, x1, y1 };
  const P = (x, y) => proj(m, x, y), [rx] = P(x1, y0), [, by] = P(x1, y1);
  const cv = document.createElement('canvas'); cv.width = Math.ceil(rx + M); cv.height = Math.ceil(by + LIP + M); m.isoRoom.W = cv.width; m.isoRoom.H = cv.height;
  const c = cv.getContext('2d'); c.imageSmoothingEnabled = false;
  const pal = m.roomStyle === 1 ? PAL.dark : RED.has(m.roomKind) || RED.has(m.id) ? PAL.red : PAL.wood;
  const poly = (pts, fill) => { c.beginPath(); pts.forEach(([a, b], i) => i ? c.lineTo(a, b) : c.moveTo(a, b)); c.closePath(); c.fillStyle = fill; c.fill(); };
  // 앞쪽 바닥 두께: 방이 어둠 위에 떠 있는 판처럼 보이게
  const L = P(x0, y1), F = P(x1, y1), R = P(x1, y0), K = P(x0, y0);
  poly([L, F, R, [R[0], R[1] + LIP], [F[0], F[1] + LIP], [L[0], L[1] + LIP]], pal.lip);
  if (flatTex) { c.save(); c.beginPath(); [K, R, F, L].forEach(([a, b], i) => i ? c.lineTo(a, b) : c.moveTo(a, b)); c.closePath(); c.clip(); const pt = c.createPattern(flatTex, 'repeat'); pt.setTransform(new DOMMatrix().scale(1 / (flatTex.hd || 1))); c.fillStyle = pt; c.fillRect(0, 0, cv.width, cv.height); c.restore(); }
  // 바닥: 네모 방 바닥 그림을 그대로 눕힌다(새 마루면 깔개와 바닥 소품만)
  c.save(); c.setTransform(1, .5, -1, .5, ox, oy); c.beginPath(); c.rect(x0, y0, x1 - x0, y1 - y0); c.clip(); c.drawImage(floor, 0, 0);
  // 벽 밑 그늘
  let g = c.createLinearGradient(0, y0, 0, y0 + 22); g.addColorStop(0, 'rgba(0,0,0,.34)'); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.fillRect(x0, y0, x1 - x0, 22);
  g = c.createLinearGradient(x0, 0, x0 + 22, 0); g.addColorStop(0, 'rgba(0,0,0,.28)'); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.fillRect(x0, y0, 22, y1 - y0);
  c.restore();
  // 앞 가장자리에 밝은 테
  c.strokeStyle = 'rgba(255,240,210,.18)'; c.lineWidth = 1; c.beginPath(); c.moveTo(L[0], L[1] + .5); c.lineTo(F[0], F[1] + .5); c.lineTo(R[0], R[1] + .5); c.stroke();
  // 문: 앞 가장자리를 터서 문지방을 놓고 바깥 빛이 들게 한다
  for (const q of m.portals) {
    if (q.y + q.h < H - 2) continue; const a = Math.max(x0, q.x), b = Math.min(x1, q.x + q.w);
    c.save(); c.setTransform(1, .5, -1, .5, ox, oy);
    c.fillStyle = '#9c8f7c'; c.fillRect(a, y1 - 3, b - a, 3); c.fillStyle = '#5a5044'; c.fillRect(a, y1, b - a, 1.5);
    const gl = c.createLinearGradient(0, y1 - 14, 0, y1 + 16); gl.addColorStop(0, 'rgba(255,236,186,0)'); gl.addColorStop(.5, 'rgba(255,236,186,.4)'); gl.addColorStop(1, 'rgba(255,244,214,.9)'); c.fillStyle = gl; c.fillRect(a, y1 - 14, b - a, 30);
    c.restore();
  }
  // 뒷벽 두 면. 벽마다 (가로 u, 높이 v) 평면으로 놓고 그린다
  const wall = (A, len, dirx, dark, windows) => {
    c.save(); c.setTransform(dirx, .5, 0, 1, A[0], A[1]);
    c.fillStyle = pal.plaster; c.fillRect(0, -WH, len, WH);
    c.fillStyle = pal.plaster2; for (let u = 3; u < len; u += 7) c.fillRect(u, -WH + 6, 1, WH - 22);  // 회벽 결
    c.fillStyle = pal.panel; c.fillRect(0, -15, len, 15); c.fillStyle = pal.panel2; for (let u = 2; u < len; u += 6) c.fillRect(u, -15, 1, 15); c.fillRect(0, -2, len, 2);  // 판자 징두리
    c.fillStyle = pal.beam; c.fillRect(0, -16, len, 2); c.fillRect(0, -WH, len, 4);  // 가로 띠, 위 보
    const posts = Math.max(1, Math.round(len / 64));
    for (let i = 0; i <= posts; i++) { const u = Math.min(len - 5, Math.max(0, i * len / posts - 2.5)); c.fillStyle = pal.post; c.fillRect(u, -WH, 5, WH); c.fillStyle = 'rgba(255,255,255,.14)'; c.fillRect(u + 1, -WH, 1, WH); }
    if (windows) for (let i = 0; i < posts; i++) {  // 기둥 사이 격자창
      const cu = (i + .5) * len / posts, ww = Math.min(26, len / posts - 16); if (ww < 10) continue; const u = cu - ww / 2, v0 = -WH + 9, wh = 17;
      c.fillStyle = pal.beam; c.fillRect(u - 2, v0 - 2, ww + 4, wh + 4); c.fillStyle = pal.win; c.fillRect(u, v0, ww, wh);
      c.fillStyle = pal.panel2; for (let k = u + 4; k < u + ww; k += 4) c.fillRect(k, v0, 1, wh); for (let k = v0 + 4; k < v0 + wh; k += 4) c.fillRect(u, k, ww, 1);
    }
    if (dark) { c.fillStyle = `rgba(0,0,0,${dark})`; c.fillRect(0, -WH, len, WH); }
    c.restore();
  };
  wall(K, x1 - x0, 1, 0, true);             // 오른쪽 뒷벽(위쪽 벽): 빛을 받는다
  wall(K, y1 - y0, -1, .2, m.roomStyle !== 1); // 왼쪽 뒷벽(왼쪽 벽): 그늘
  // 벽 위 갓: 두께가 보이게
  poly([[K[0], K[1] - WH], [R[0], R[1] - WH], [R[0] + 3, R[1] - WH - 1.5], [K[0], K[1] - WH - 3]], pal.beam);
  poly([[K[0], K[1] - WH], [L[0], L[1] - WH], [L[0] - 3, L[1] - WH - 1.5], [K[0], K[1] - WH - 3]], pal.beam);
  // 모서리 기둥과 벽 끝 기둥
  for (const [x, y, w] of [[K[0] - 3, K[1], 6], [R[0] - 4, R[1], 5], [L[0] - 1, L[1], 5]]) { c.fillStyle = pal.post; c.fillRect(x, y - WH - 3, w, WH + 3); c.fillStyle = 'rgba(255,255,255,.16)'; c.fillRect(x + 1, y - WH - 3, 1, WH + 3); }
  m.canvas = cv;
  // 가구: 충돌 상자(없으면 그림 밑변) 가운데를 눕힌 자리에 세운다. 쿼터뷰 가구 그림이 있으면 그걸 쓴다
  m.isoObjs = m.objs.map(s => {
    const st = STAMPS[s.name]; if (!st) return s; const w = st[3], h = st[4], box = st.length > 5 ? { x: s.x + st[5], y: s.y + st[6], w: st[7], h: st[8] } : null;
    const iso = FURN_ISO[s.name], q = iso && meta(iso);
    if (q && box) { const [fx, fy] = P(box.x + box.w, box.y + box.h), cn = corners(fx, fy, q.fw, q.fh, q.ls, q.rs); return { name: iso, x: Math.round(fx - q.ax), y: Math.round(fy - q.ay), w: q.w, h: q.h, base: fy, iso: cn }; }
    const [ax, ay] = box ? P(box.x + box.w / 2, box.y + box.h / 2) : P(s.x + w / 2, s.base), bottom = ay + (box ? 3 : 0);
    return { name: s.name, x: Math.round(ax - w / 2), y: Math.round(bottom - h), base: bottom, w };
  });
}
