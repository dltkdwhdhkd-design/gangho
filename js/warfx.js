// 전쟁의 흔적을 그린다
// 무너진 문파: 막 무너졌을 땐 불길과 연기, 그다음엔 그을린 전각과 잿더미, 다시 일어서기 전엔 비계와 목재 더미
// 마교가 차지한 고을: 천마 깃발, 몇 채는 불타 그을리고 연기가 오른다. 무림맹 본거지: 정파 깃발. 강호 길: 진채의 깃발과 모닥불, 교전 자리의 칼빛
import { G, TS } from './core.js';
import { STAMPS, drawStamp } from './tiles.js';
import { LOCS } from './worlddata.js';

const BLD = new Set(['hall', 'lodge', 'house_red', 'inn', 'hut_o', 'hut_b', 'hut_o2', 'shop_blue', 'shop_green', 'clay', 'wood_o', 'wood_b', 'mud', 'straw']);
const NOT_ISO = /tree|wall|fence|palisade|rock|stone|dock|stairs|bamboo|willow|pine|peach|plum|maple|bush|grass|flower|reed|lotus|boat|mountain|cliff|cart|well|jar|crate|bench|lamp|flag|banner/;
const isBld = s => s.iso ? !NOT_ISO.test(s.name) && (s.w || 0) >= 60 : BLD.has(s.name);
const hash = s => ((Math.round(s.x) * 73856093) ^ (Math.round(s.y) * 19349663)) >>> 0;
const FILTER = { burning: 'brightness(.4) sepia(.6) saturate(.7)', ash: 'brightness(.46) sepia(.4) saturate(.45)', rebuild: 'brightness(.78) sepia(.3)', occupied: 'brightness(.45) sepia(.6) saturate(.7)' };

// 이 지도는 지금 어떤 꼴인가
function state(m) {
  const S = G.S; if (!S || !m || m.room || m.live) return null;
  const l = LOCS.find(q => q.map === m.id), fr = S.fr;
  if (l?.fac && fr?.fallen?.[l.fac]) {
    const d0 = fr.fallen[l.fac], ru = G.saga?.st?.()?.ruin?.[l.fac], total = ru && ru > d0 ? ru - d0 : (S.mode === 'free' ? 12 : 24), day = S.day - d0, left = total - day;
    return { kind: left <= Math.max(3, total * .15) ? 'rebuild' : day <= Math.max(3, total * .12) ? 'burning' : 'ash', all: 1 };
  }
  const f = G.saga?.fx?.(m.id); if (f?.occ) return { kind: 'occupied', part: .35, flags: ['cheonma'] };
  if (f?.hq) return { kind: null, flags: f.hq };
  return null;
}
const hit = (st, s) => st?.kind && isBld(s) && (st.all || hash(s) % 100 < st.part * 100);
// 건물 그리기 전에 씌울 거름망
export function tint(m, s) {
  if (m.live) { for (const w of m._wsl || []) if (w.has.has(s)) return FILTER[w.st.kind]; return null; }
  const st = m._wst; return hit(st, s) ? FILTER[st.kind] : null;
}
const box = s => { const sz = STAMPS[s.name]; return { x: s.x, y: s.y, w: s.w || sz?.[3] || 32, h: s.h || sz?.[4] || 32 }; };
const view = (b, cam) => b.x + b.w > cam.x - 40 && b.x < cam.x + 360 && b.y + b.h > cam.y - 60 && b.y < cam.y + 240;

// 강호 지도 위 문파 터와 고을(js/world.js가 남긴 m.sites): 무너진 문파는 그을리고, 점령된 고을은 몇 채가 탄다. 날이나 판이 바뀔 때만 다시 고른다
function worldSites(m) {
  const S = G.S, g = G.saga?.st?.(); if (!S?.fr || !m.sites) return (m._wsl = []);
  const key = `${S.day}|${JSON.stringify(S.fr.fallen || {})}|${Object.keys(g?.occ || {})}`; if (m._wsk === key) return m._wsl;
  m._wsk = key; m._wsl = [];
  for (const q of m.sites) {
    const st = state({ id: q.map }); if (!st?.kind) continue;
    const list = (m.objs || []).filter(s => { if (!hit(st, s)) return false; const b = box(s), cx = b.x + b.w / 2, by = b.y + b.h; return cx >= q.x0 * TS && cx <= q.x1 * TS && by >= q.y0 * TS && by <= q.y1 * TS; });
    if (list.length) m._wsl.push({ st, list, has: new Set(list) });
  }
  return m._wsl;
}
// 건물 발치: 잿더미와 타다 남은 들보, 다시 세울 땐 목재 더미
function ground(c, st, s, cam) {
  const b = box(s); if (!view(b, cam)) return; const h = hash(s), cx = b.x + b.w / 2, by = b.y + b.h;
  if (st.kind === 'rebuild') { c.fillStyle = '#7a5a36'; for (let i = 0; i < 4; i++) c.fillRect(Math.round(cx + b.w * .35 + (h >> i & 3)), Math.round(by - 4 - i * 2), 14, 2); c.fillStyle = '#4a3420'; c.fillRect(Math.round(cx + b.w * .35), Math.round(by - 1), 18, 1); return; }
  c.fillStyle = 'rgba(26,20,16,.5)'; c.beginPath(); c.ellipse(cx, by - 2, b.w * .55, 7, 0, 0, 7); c.fill();
  c.fillStyle = 'rgba(20,14,10,.75)'; for (let i = 0; i < 5; i++) { const x = cx + ((h >> (i * 3)) % 40) - 20, y = by + ((h >> (i * 2 + 1)) % 9) - 3; c.save(); c.translate(Math.round(x), Math.round(y)); c.rotate(((h >> i) % 7 - 3) * .25); c.fillRect(-5, -1, 10, 2); c.restore(); }
}
// 땅 위, 사람과 건물 아래: 잿더미, 목재 더미, 깃발, 진채
export function under(c, m, cam, t) {
  m._wst = state(m); const st = m._wst;
  if (st?.kind) for (const s of m.objs || []) if (hit(st, s)) ground(c, st, s, cam);
  if (m.live) for (const w of worldSites(m)) for (const s of w.list) ground(c, w.st, s, cam);
  const flags = st?.flags; if (flags && !m.room) {
    const k = m.k || 1, spots = [[20.5, 15.4], [38.5, 15.4], [20.5, 31.4], [38.5, 31.4], [27, 39.6], [33, 39.6]];
    spots.forEach(([x, y], i) => { const id = flags[i % flags.length], nm = STAMPS['flag_' + id] ? 'flag_' + id : 'banner4'; drawStamp(c, nm, Math.round(x * k * TS - 2.5), Math.round(y * k * TS - 44)); });
  }
  if (m.live) {
    const f = G.saga?.fx?.('world'); if (!f) return;
    for (const cp of f.camps || []) { const X = cp.x * TS, Y = cp.y * TS; if (X < cam.x - 60 || X > cam.x + 380 || Y < cam.y - 60 || Y > cam.y + 260) continue; for (const [dx, dy] of [[-30, 6], [34, 6], [2, -14]]) { const nm = STAMPS['flag_' + cp.flag] ? 'flag_' + cp.flag : 'banner4'; drawStamp(c, nm, Math.round(X + dx - 2.5), Math.round(Y + dy - 44)); } c.fillStyle = '#4a3220'; c.fillRect(Math.round(X - 5), Math.round(Y + 37), 10, 2); c.fillStyle = '#2a1c12'; c.fillRect(Math.round(X - 3), Math.round(Y + 36), 6, 1); fire(c, X, Y + 36, t, 1); }  // 무사들 사이에 모닥불
  }
}
// 모닥불이나 불길 한 덩이: 도트 기둥을 겹쳐 일렁이게 한다(바깥 붉은빛, 안 주황, 가운데 노랑)
function fire(c, x, y, t, s = 1) {
  const H = 9 * s; x = Math.round(x); y = Math.round(y);
  for (let i = -3; i <= 3; i++) {
    const a = Math.abs(i), h = Math.max(1, Math.round(H * (1 - a / 4) * (.65 + .35 * Math.sin(t * 11 + i * 1.7 + x)))), X = x + i;
    c.fillStyle = '#b8321a'; c.fillRect(X, y - h, 1, h);
    if (a <= 2) { const h2 = Math.round(h * .72); c.fillStyle = '#ff8a2a'; c.fillRect(X, y - h2, 1, h2); }
    if (a <= 1) { const h3 = Math.round(h * .45); c.fillStyle = '#ffdc6a'; c.fillRect(X, y - h3, 1, h3); }
  }
  if (Math.sin(t * 7 + x) > .6) { c.fillStyle = '#ffb040'; c.fillRect(x + Math.round(Math.sin(t * 13) * 2), y - Math.round(H + 2), 1, 1); }
}
// 연기 한 덩이: 둥근 원 대신 도트 덩어리로
function puff(c, x, y, r, col, al) { x = Math.round(x); y = Math.round(y); r = Math.max(1, Math.round(r)); c.fillStyle = `rgba(${col},${al})`; c.fillRect(x - r, y - r + 1, r * 2, r * 2 - 2); c.fillRect(x - r + 1, y - r, r * 2 - 2, r * 2); }
// 건물 위: 불길, 연기, 불씨, 비계
function air(c, st, s, cam, t) {
  const b = box(s); if (!view(b, cam)) return; const h = hash(s), cx = b.x + b.w / 2, top = b.y + b.h * .28, by = b.y + b.h;
  {
    if (st.kind === 'rebuild') { c.strokeStyle = 'rgba(120,86,48,.95)'; c.lineWidth = 1.5; c.beginPath(); for (let i = 0; i <= 3; i++) { const x = b.x + b.w * (.2 + i * .2); c.moveTo(x, by - 2); c.lineTo(x, b.y + b.h * .35); } for (let j = 0; j < 3; j++) { const y = by - 6 - j * b.h * .18; c.moveTo(b.x + b.w * .18, y); c.lineTo(b.x + b.w * .82, y); } c.stroke(); return; }
    const thick = st.kind === 'burning' ? .62 : st.kind === 'occupied' ? .5 : .32, n = st.kind === 'burning' ? 8 : 5, col = st.kind === 'ash' ? '96,92,88' : '52,46,44';
    for (let i = 0; i < n; i++) { const ph = (t * (.16 + (h % 5) * .01) + i / n + (h % 97) / 97) % 1, x = cx + ((h >> i) % 21 - 10) + Math.sin(ph * 6 + i) * 5 + ph * 14, y = top - ph * 50, r = 2 + ph * 7;
      puff(c, x, y, r, col, (1 - ph * ph) * thick); }
    if (st.kind === 'ash') for (let i = 0; i < 2; i++) { const ph = (t * .4 + i * .5 + (h % 7) / 7) % 1; c.fillStyle = `rgba(255,120,50,${(1 - ph) * .8})`; c.fillRect(Math.round(cx + ((h >> (i + 4)) % 24) - 12), Math.round(by - 6 - ph * 10), 1, 1); }  // 잿더미 속 남은 불씨
    if (st.kind === 'burning') {
      for (let i = 0; i < 3; i++) fire(c, b.x + b.w * (.25 + i * .25) + ((h >> i) % 7 - 3), top + b.h * (.15 + (i % 2) * .2), t + i * .3, .9);
      for (let i = 0; i < 6; i++) { const ph = (t * .5 + i / 6 + (h % 13) / 13) % 1; c.fillStyle = `rgba(255,${150 + (i * 30) % 90},60,${1 - ph})`; c.fillRect(Math.round(cx + ((h >> (i + 2)) % 30) - 15 + Math.sin(ph * 9) * 4), Math.round(top + 10 - ph * 50), 1, 1); }
    }
  }
}
// 사람과 건물 위: 불길, 연기, 불씨, 비계, 묶인 사람들의 밧줄, 교전 자리의 칼빛
export function over(c, m, cam, t) {
  const st = m._wst;
  if (st?.kind) for (const s of m.objs || []) if (hit(st, s)) air(c, st, s, cam, t);
  if (m.live) for (const w of m._wsl || []) for (const s of w.list) air(c, w.st, s, cam, t);
  if (st?.kind === 'occupied') {  // 광장에 묶인 사람들: 허리 밧줄과 서로 이은 줄
    const cap = (G.field?.npcs || []).filter(n => /^sg_cap/.test(n.id)).sort((a, b) => a.x - b.x); c.fillStyle = '#a07a44';
    cap.forEach((n, i) => { c.fillRect(Math.round(n.x - 4), Math.round(n.y - 8), 8, 1); const o = cap[i + 1]; if (!o) return; const x0 = n.x + 4, y0 = n.y - 8, x1 = o.x - 4, y1 = o.y - 8, L = Math.max(1, Math.round(Math.hypot(x1 - x0, y1 - y0))); for (let j = 0; j <= L; j++) { const u = j / L; c.fillRect(Math.round(x0 + (x1 - x0) * u), Math.round(y0 + (y1 - y0) * u + Math.sin(u * Math.PI) * 2), 1, 1); } });
  }
  if (m.live) { const f = G.saga?.fx?.('world'); for (const q of f?.sk || []) { const X = q.x * TS, Y = q.y * TS - 10; if (X < cam.x - 40 || X > cam.x + 360 || Y < cam.y - 40 || Y > cam.y + 220) continue; const ph = (t * 1.6 + q.id * .37) % 1; if (ph < .25) { c.strokeStyle = `rgba(255,255,240,${1 - ph * 4})`; c.lineWidth = 1; c.beginPath(); c.arc(X + Math.sin(q.id) * 3, Y + (q.id % 2) * 8, 6 + ph * 10, -.9 + q.id, .4 + q.id); c.stroke(); } } }
}
G.warfx = { tint, under, over };
