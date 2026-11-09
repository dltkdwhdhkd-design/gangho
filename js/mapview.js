// 미니맵과 전체 지도 (M)
import { G, Input, Sound, $, $$, el, esc, TS } from './core.js';
import { Keys } from './core.js';
import { MAPS } from './maps.js';
import { drawStamp } from './tiles.js';
import { drawIso } from './iso.js';

const burnedInn = (c, m, k, ox = 0, oy = 0) => { if (m.id === 'cheongha' && G.S.flags.burned && !G.S.flags.inn_rebuilt) { c.fillStyle = 'rgba(25,14,8,.62)'; c.fillRect(ox + 19 * TS * k, oy + 8 * TS * k, 4 * TS * k, (3 * TS - 2) * k); } };
// 소품까지 다 그린 지도 한 장. 지도마다 한 번만 만든다
export function whole(m) {
  if (m._whole) return m._whole;
  const c = document.createElement('canvas'); c.width = m.w * TS; c.height = m.h * TS;
  const x = c.getContext('2d'); x.imageSmoothingEnabled = false; x.drawImage(m.canvas, 0, 0);
  for (const s of [...m.objs].sort((a, b) => a.base - b.base)) s.iso ? drawIso(x, s) : drawStamp(x, s.name, s.x, s.y);
  return m._whole = c;
}
const open = q => !q.when || !!G.S.flags[q.when];
const marks = f => f.npcs.filter(n => n.mark && n.mark());
const foesOf = f => f.roam.filter(r => !r.gone);
// 방 안에 있으면 그 방이 속한 바깥 지도와 문 앞 자리를 찾는다
function region(m, f) {
  if (m.live) return null;
  let cur = m, pos = { x: f.p.x / TS, y: f.p.y / TS };
  for (let i = 0; i < 4 && cur.room; i++) { const q = cur.portals.find(p => MAPS[p.to]); if (!q) return null; pos = { x: q.tx, y: q.ty }; cur = MAPS[q.to]; }
  return { m: cur, pos };
}

// ── 미니맵 ──
const K = 2; // 칸 하나를 몇 점으로 그릴까
let mm = null, base = null, frame = 0;
export function bindMini(f) {
  mm = $('#mm'); if (!mm) return; const m = f.m;
  if (m.room) { mm.style.display = 'none'; return; }
  mm.width = m.live ? 240 : m.w * K; mm.height = m.live ? 196 : m.h * K; mm.style.width = (m.live ? 240 : m.w * K * 2) + 'px'; mm.style.height = (m.live ? 196 : m.h * K * 2) + 'px'; mm.onclick = () => { if (!f.busy) openMap(); };
  base = document.createElement('canvas'); base.width = mm.width; base.height = mm.height;
  const x = base.getContext('2d'); x.imageSmoothingQuality = 'high'; if (m.live) G.world.china(x, mm.width, mm.height, { mini: true }); else { x.drawImage(whole(m), 0, 0, mm.width, mm.height); burnedInn(x, m, K / TS); }
  frame = 0;
}
export function tickMini(f) {
  if (!mm || !mm.isConnected || f.m.room) return;
  const hide = f.busy || !!G.decor; if (mm._hide !== hide) { mm._hide = hide; mm.style.display = hide ? 'none' : 'block'; }
  if (hide || frame++ % 6) return;
  const kk = f.m.live ? mm.width / (f.m.w * TS) : K / TS, x = mm.getContext('2d'), dot = (px, py, s, col) => { const a = Math.round(px * kk - s / 2), b = Math.round(py * kk - s / 2); x.fillStyle = '#000'; x.fillRect(a - 1, b - 1, s + 2, s + 2); x.fillStyle = col; x.fillRect(a, b, s, s); };
  x.drawImage(base, 0, 0);
  for (const r of foesOf(f)) dot(r.x, r.y, 2, '#e8503a');
  for (const n of marks(f)) dot(n.x, n.y, 3, '#ffd23c');
  dot(f.p.x, f.p.y, 3, Math.floor(frame / 12) % 2 ? '#ffffff' : '#7fe0ff');
}

// ── 이 지역 ──
function doorName(q) {
  if (q.to === 'myhouse') return open(q) ? '내 집' : '빈집';
  if (!open(q) || !MAPS[q.to]) return '';
  return MAPS[q.to].name;
}
function drawArea(cv, r, f) {
  const c = cv.getContext('2d'), m = r.m, k = Math.min(cv.width / (m.w * TS), cv.height / (m.h * TS)), ox = (cv.width - m.w * TS * k) / 2, oy = (cv.height - m.h * TS * k) / 2;
  const X = v => ox + v * k, Y = v => oy + v * k;
  c.fillStyle = '#14110f'; c.fillRect(0, 0, cv.width, cv.height);
  c.imageSmoothingEnabled = k < 1; c.drawImage(whole(m), ox, oy, m.w * TS * k, m.h * TS * k); burnedInn(c, m, k, ox, oy);
  const text = (t, x, y, col = '#ffe9a8', size = 17) => { c.font = `${size}px Galmuri11Bold, Galmuri14, sans-serif`; c.textAlign = 'center'; c.lineJoin = 'round'; const w = c.measureText(t).width / 2; x = Math.max(ox + w + 4, Math.min(ox + m.w * TS * k - w - 4, x)); y = Math.max(oy + 18, Math.min(oy + m.h * TS * k - 6, y)); c.lineWidth = 5; c.strokeStyle = '#000'; c.strokeText(t, x, y); c.fillStyle = col; c.fillText(t, x, y); };
  const dot = (px, py, s, col) => { c.fillStyle = '#000'; c.fillRect(X(px) - s / 2 - 2, Y(py) - s / 2 - 2, s + 4, s + 4); c.fillStyle = col; c.fillRect(X(px) - s / 2, Y(py) - s / 2, s, s); };
  const bare = t => t.replace(/[←→ ]/g, ''), fixed = (m.labels || []).map(l => bare(l.text)), inside = f.m.room;
  for (const l of m.labels || []) text(l.text, X(l.x * TS), Y(l.y * TS));
  for (const l of m.names || []) text(l.text, X(l.x * TS), Y(l.y * TS), '#fff3d6');
  for (const q of m.portals) {
    if (q.when === 'never') continue;
    const cx = q.x + q.w / 2, cy = q.y + q.h / 2;
    if (q.door) { const n = doorName(q), near = inside && Math.hypot(cx / TS - r.pos.x, cy / TS - r.pos.y) < 4; if (n && !near && !fixed.some(t => bare(n).includes(t))) text(n, X(cx), Y(q.y + q.h) + 18); continue; }
    if (fixed.some(t => MAPS[q.to] && bare(MAPS[q.to].name).includes(t))) continue;
    const name = open(q) ? MAPS[q.to].name : '막힌 길', arrow = q.x < 2 * TS ? ['← ', ''] : q.x + q.w > (m.w - 2) * TS ? ['', ' →'] : q.y < 2 * TS ? ['↑ ', ''] : ['↓ ', ''];
    text(arrow[0] + name + arrow[1], X(cx), q.y <= 0 ? Y(cy) + 24 : Y(cy) + (q.y + q.h >= m.h * TS ? -8 : 6), open(q) ? '#ffe9a8' : '#b9aa92');
  }
  if (m === f.m) { for (const a of foesOf(f)) dot(a.x, a.y, 6, '#e8503a'); for (const n of marks(f)) { dot(n.x, n.y - 4, 10, '#ffd23c'); text('!', X(n.x), Y(n.y - 4) + 6, '#000', 15); } }
  dot(r.pos.x * TS, r.pos.y * TS, 12, '#7fe0ff'); text(inside ? `나 · ${f.m.name}` : '나', X(r.pos.x * TS), Y(r.pos.y * TS) - 12, '#fff');
}

// ── 강호 전도 ──
function drawWorld(cv, here) { cv.width = 1206; cv.height = 987; cv.style.cssText = 'display:block;width:1206px;height:987px;max-width:none;image-rendering:auto'; G.world.china(cv.getContext('2d'), cv.width, cv.height, { here }); const box = document.createElement('div'); box.style.cssText = 'overflow:auto;height:570px;max-width:100%;margin:0 auto'; cv.parentNode.insertBefore(box, cv); box.appendChild(cv); const [x, y] = G.world.here(); box.scrollLeft = x * 1.5 - box.clientWidth / 2; box.scrollTop = y * 1.5 - box.clientHeight / 2; }

// ── 지도 창 ──
let view = 'area';
export function openMap() {
  if (G.menuOpen) return;
  const f = G.field, r = region(f.m, f), M = $('#modal'); view = 'area'; G.menuOpen = true; Input.clear(); Sound.sfx('select'); M.classList.add('on');
  const close = () => { G.menuOpen = false; M.classList.remove('on'); M.innerHTML = ''; Input.clear(); document.removeEventListener('keydown', k); };
  const draw = () => {
    if (!r) view = 'world';
    M.innerHTML = `<div class="menu"><div class="pane" style="height:auto"><div class="tabs">${r ? `<button data-v="area" class="${view === 'area' ? 'on' : ''}">${esc(r.m.name)}</button>` : ''}<button data-v="world" class="${view === 'world' ? 'on' : ''}">강호 전도</button><button class="x">닫기 (${Keys.label('map')})</button></div><div class="body" style="padding:10px 12px 8px"><canvas id="mapc" width="1152" height="540" style="display:block;width:1152px;height:540px"></canvas><p class="hint" style="margin:6px 0 0">${view === 'area' ? '파란 칸이 나, 노란 칸이 할 일, 붉은 칸이 적입니다.' : ''} Tab으로 지도를 바꿉니다.${G.S.goal ? ` · 목표: ${G.S.goal}` : ''}</p></div></div></div>`;
    $$('[data-v]', M).forEach(b => b.onclick = () => { view = b.dataset.v; Sound.sfx('tick'); draw(); });
    $('.x', M).onclick = close;
    const cv = $('#mapc', M); if (view === 'area') drawArea(cv, r, f); else drawWorld(cv, r ? r.m.id : null);
    if (view === 'world' && !f.busy) G.world.travelBar(M, close);
  };
  const k = e => {
    if (e.repeat) return;
    if (Keys.is('map', e.code) || e.code === 'Escape') { e.preventDefault(); e.stopPropagation(); close(); }
    if (e.code === 'Tab' && r) { e.preventDefault(); view = view === 'area' ? 'world' : 'area'; Sound.sfx('tick'); draw(); }
  };
  document.addEventListener('keydown', k); draw();
}
