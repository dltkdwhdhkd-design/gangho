// 미니맵과 전체 지도 (M)
import { G, Input, Sound, $, $$, el, esc, TS } from './core.js';
import { MAPS } from './maps.js';
import { drawStamp } from './tiles.js';

const burnedInn = (c, m, k, ox = 0, oy = 0) => { if (m.id === 'cheongha' && G.S.flags.burned && !G.S.flags.inn_rebuilt) { c.fillStyle = 'rgba(25,14,8,.62)'; c.fillRect(ox + 19 * TS * k, oy + 8 * TS * k, 4 * TS * k, (3 * TS - 2) * k); } };
// 소품까지 다 그린 지도 한 장. 지도마다 한 번만 만든다
function whole(m) {
  if (m._whole) return m._whole;
  const c = document.createElement('canvas'); c.width = m.w * TS; c.height = m.h * TS;
  const x = c.getContext('2d'); x.imageSmoothingEnabled = false; x.drawImage(m.canvas, 0, 0);
  for (const s of [...m.objs].sort((a, b) => a.base - b.base)) drawStamp(x, s.name, s.x, s.y);
  return m._whole = c;
}
const open = q => !q.when || !!G.S.flags[q.when];
const marks = f => f.npcs.filter(n => n.mark && n.mark());
const foesOf = f => f.roam.filter(r => !r.gone);
// 방 안에 있으면 그 방이 속한 바깥 지도와 문 앞 자리를 찾는다
function region(m, f) {
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
  mm.width = m.w * K; mm.height = m.h * K; mm.style.width = m.w * K * 2 + 'px'; mm.style.height = m.h * K * 2 + 'px'; mm.onclick = () => { if (!f.busy) openMap(); };
  base = document.createElement('canvas'); base.width = mm.width; base.height = mm.height;
  const x = base.getContext('2d'); x.imageSmoothingQuality = 'high'; x.drawImage(whole(m), 0, 0, mm.width, mm.height); burnedInn(x, m, K / TS);
  frame = 0;
}
export function tickMini(f) {
  if (!mm || !mm.isConnected || f.m.room) return;
  const hide = f.busy || !!G.decor; if (mm._hide !== hide) { mm._hide = hide; mm.style.display = hide ? 'none' : 'block'; }
  if (hide || frame++ % 6) return;
  const x = mm.getContext('2d'), dot = (px, py, s, col) => { const a = Math.round(px / TS * K - s / 2), b = Math.round(py / TS * K - s / 2); x.fillStyle = '#000'; x.fillRect(a - 1, b - 1, s + 2, s + 2); x.fillStyle = col; x.fillRect(a, b, s, s); };
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
const SPOTS = { cheongha: [822, 285], bamboo: [822, 165], valley: [680, 285], shrine: [560, 225], pass: [950, 285], fort: [1064, 195], cloudmt: [1083, 395], guhwa: [822, 445], ninehall: [960, 490], fiveclans: [684, 490], shaolin: [523, 415], hwasan: [390, 320], wolha: [575, 95], silk: [290, 400], oasis: [190, 330], snowpeak: [120, 215], tiangate: [75, 115], blackpalace: [230, 80] };
const ROADS = [['cheongha', 'bamboo'], ['cheongha', 'valley'], ['valley', 'shrine'], ['cheongha', 'pass'], ['pass', 'fort'], ['pass', 'cloudmt'], ['guhwa', 'ninehall'], ['guhwa', 'fiveclans'], ['shaolin', 'hwasan'], ['cheongha', 'guhwa', 1], ['cloudmt', 'guhwa', 1], ['cloudmt', 'shaolin', 1], ['hwasan', 'guhwa', 1], ['guhwa', 'wolha', 1], ['guhwa', 'silk'], ['silk', 'oasis'], ['oasis', 'snowpeak'], ['snowpeak', 'tiangate'], ['tiangate', 'blackpalace']];
const SECRET = ['shrine', 'wolha', 'silk', 'oasis', 'snowpeak', 'tiangate', 'blackpalace'];
function drawWorld(cv, here) {
  const c = cv.getContext('2d'), W = cv.width, H = cv.height, seen = G.S.seen || {}, known = id => !!seen[id];
  const near = id => !SECRET.includes(id) && ROADS.some(([a, b]) => (a === id && known(b)) || (b === id && known(a)));
  const shown = id => known(id) || near(id);
  c.fillStyle = '#e6d6b2'; c.fillRect(0, 0, W, H); c.strokeStyle = '#a8947a'; c.lineWidth = 6; c.strokeRect(10, 10, W - 20, H - 20);
  // 장강
  c.strokeStyle = '#8fb6c4'; c.lineWidth = 16; c.lineCap = 'round'; c.beginPath(); c.moveTo(310, 395); c.bezierCurveTo(520, 330, 600, 395, 822, 350); c.bezierCurveTo(990, 320, 1050, 340, W - 20, 300); c.stroke();
  // 산
  c.fillStyle = '#bfa987'; for (const [x, y, s] of [[415, 255, 26], [450, 270, 20], [375, 275, 18], [1050, 150, 24], [1090, 165, 18], [1120, 395, 16], [485, 450, 20], [545, 460, 15], [530, 60, 22], [620, 62, 20], [60, 200, 26], [110, 160, 20], [170, 150, 24]]) { c.beginPath(); c.moveTo(x - s, y + s * .8); c.lineTo(x, y - s * .8); c.lineTo(x + s, y + s * .8); c.closePath(); c.fill(); }
  // 길과 뱃길
  c.lineCap = 'butt';
  for (const [a, b, boat] of ROADS) {
    if (!shown(a) || !shown(b) || (!known(a) && !known(b))) continue;
    const p = SPOTS[a], q = SPOTS[b]; c.strokeStyle = boat ? '#4f7f96' : '#7a5a3a'; c.lineWidth = 3; c.setLineDash(boat ? [9, 8] : []); c.beginPath(); c.moveTo(...p); c.lineTo(...q); c.stroke();
  }
  c.setLineDash([]);
  c.textAlign = 'center'; c.font = '18px Galmuri11Bold, Galmuri14, sans-serif';
  for (const id in SPOTS) {
    if (!shown(id)) continue; const [x, y] = SPOTS[id], k = known(id), me = id === here;
    c.fillStyle = '#2a2018'; c.fillRect(x - 9, y - 9, 18, 18); c.fillStyle = me ? '#c43a2c' : k ? '#f4e6c4' : '#9a8a70'; c.fillRect(x - 6, y - 6, 12, 12);
    const name = k ? MAPS[id].name : '???'; c.lineWidth = 6; c.lineJoin = 'round'; c.strokeStyle = '#e6d6b2'; c.strokeText(name, x, y + 30); c.fillStyle = k ? '#2a2018' : '#8a7a62'; c.fillText(name, x, y + 30);
    if (me) { c.fillStyle = '#c43a2c'; c.font = '16px Galmuri11Bold, Galmuri14, sans-serif'; c.fillText('지금 여기', x, y - 16); c.font = '18px Galmuri11Bold, Galmuri14, sans-serif'; }
  }
}

// ── 지도 창 ──
let view = 'area';
export function openMap() {
  if (G.menuOpen) return;
  const f = G.field, r = region(f.m, f), M = $('#modal'); view = 'area'; G.menuOpen = true; Input.clear(); Sound.sfx('select'); M.classList.add('on');
  const close = () => { G.menuOpen = false; M.classList.remove('on'); M.innerHTML = ''; Input.clear(); document.removeEventListener('keydown', k); };
  const draw = () => {
    if (!r) view = 'world';
    M.innerHTML = `<div class="menu"><div class="pane" style="height:auto"><div class="tabs">${r ? `<button data-v="area" class="${view === 'area' ? 'on' : ''}">${esc(r.m.name)}</button>` : ''}<button data-v="world" class="${view === 'world' ? 'on' : ''}">강호 전도</button><button class="x">닫기 (M)</button></div><div class="body" style="padding:10px 12px 8px"><canvas id="mapc" width="1152" height="540" style="display:block;width:1152px;height:540px"></canvas><p class="hint" style="margin:6px 0 0">${view === 'area' ? '파란 칸이 나, 노란 칸이 할 일, 붉은 칸이 적입니다.' : '실선은 걷는 길, 점선은 뱃길입니다.'} Tab으로 지도를 바꿉니다.${G.S.goal ? ` · 목표: ${G.S.goal}` : ''}</p></div></div></div>`;
    $$('[data-v]', M).forEach(b => b.onclick = () => { view = b.dataset.v; Sound.sfx('tick'); draw(); });
    $('.x', M).onclick = close;
    const cv = $('#mapc', M); if (view === 'area') drawArea(cv, r, f); else drawWorld(cv, r ? r.m.id : null);
    if (G.S.mode === 'free' && view === 'world' && !f.busy) G.free.travelBar(M, close);
  };
  const k = e => {
    if (e.repeat) return;
    if (e.code === 'KeyM' || e.code === 'Escape') { e.preventDefault(); e.stopPropagation(); close(); }
    if (e.code === 'Tab' && r) { e.preventDefault(); view = view === 'area' ? 'world' : 'area'; Sound.sfx('tick'); draw(); }
  };
  document.addEventListener('keydown', k); draw();
}
