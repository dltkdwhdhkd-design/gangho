// 초식 연출: 문파·무공마다 다른 빛깔과 조각(꽃잎, 벼락, 태극, 서리 따위)을 그린다
// 그림 파일 없이 캔버스로만 그린다. 싸움 판정은 건드리지 않는다
import { rnd, lerp, clamp, VW, VH } from './core.js';

// 무공 갈래(school) → 연출 꼴
const SCHOOL = {
  '청운검법': 'cloud', '남궁세가': 'lightning', '파산도법': 'blade', '하북팽가': 'quake', '유룡창법': 'spear', '소림 외가권': 'gold', '소림사': 'gold',
  '무당파': 'taiji', '화산파': 'plum', '종남파': 'star', '아미파': 'lotus', '곤륜파': 'ice', '공동파': 'quake', '점창파': 'sun', '청성파': 'wind',
  '개방': 'dust', '모용세가': 'mirror', '제갈세가': 'glyph', '사천당가': 'poison', '월하칠식': 'moon',
};
// 세력 id(x_<id>N 초식) → 연출 꼴
const FAC = {
  hwasan: 'plum', namgung: 'lightning', wudang: 'taiji', shaolin: 'gold', ak: 'gold', eon: 'gold', noeum: 'gold', emei: 'lotus', pota: 'lotus',
  dang: 'poison', odok: 'poison', haomun: 'poison', gaebang: 'dust', gonryun: 'ice', cheonsan: 'ice', jangbaek: 'ice', bukhae: 'ice',
  haenam: 'water', janggang: 'water', byeoksu: 'water', jongnam: 'star', jeonjin: 'glyph', mosan: 'glyph', jegal: 'glyph', yunui: 'mirror', moyong: 'mirror',
  paeng: 'quake', hwangbo: 'quake', nokrim: 'quake', gongdong: 'quake', jeomchang: 'sun', cheongseong: 'wind', jin: 'wind', yang: 'spear',
  podalra: 'fire', hyeoleui: 'blood', cheonma: 'blood', changun: 'cloud',
};
const BYID = { x_hwasan3: 'jaha' };  // 초식 하나만 다른 꼴(자하검기는 보랏빛 노을)
const RELIC = { r_dokgo: 'wind', r_six: 'sun', r_lingbo: 'water', r_geongon: 'taiji', r_yiyang: 'sun', r_tanji: 'star', r_ansu: 'cloud', r_taehyeon: 'glyph' };
// 꼴마다 [주색, 밝은색, 어두운색]
export const PAL = {
  plum: ['#ff8fb4', '#ffe1ea', '#c2406e'], jaha: ['#a77ae8', '#e2d0ff', '#4a2c7a'], lightning: ['#ffe86a', '#ffffff', '#6a8cff'], taiji: ['#bcd8ff', '#ffffff', '#1d2233'], gold: ['#ffc94a', '#fff1b8', '#b8741c'],
  lotus: ['#ffb0d0', '#fff4f8', '#e2a640'], poison: ['#8ee05a', '#d8ffb0', '#7a3fa8'], dust: ['#c9a26a', '#efe0b8', '#6f5230'], ice: ['#9fe6ff', '#ffffff', '#3d7fd0'],
  water: ['#5fb8ff', '#d8f2ff', '#1f5fa8'], star: ['#ffe27a', '#ffffff', '#5f6fd8'], mirror: ['#d8d0ff', '#ffffff', '#7a6ac8'], glyph: ['#ffd36a', '#fff3c8', '#c0602a'],
  quake: ['#e0a060', '#ffe0b0', '#6a4020'], blood: ['#ff3a3a', '#ffb0a0', '#3a0610'], wind: ['#9ff0c0', '#ffffff', '#3aa070'], fire: ['#ff9a3a', '#fff0a0', '#c02a10'],
  moon: ['#cfe0ff', '#ffffff', '#6a7ad8'], cloud: ['#bfe4ff', '#ffffff', '#5a90c8'], sun: ['#ffd84a', '#fffbe0', '#ff7a2a'], spear: ['#7fe6e0', '#e8ffff', '#2a8f9a'],
  blade: ['#ff9a5a', '#ffe0c0', '#a83a1a'], steel: ['#d8e4f0', '#ffffff', '#7a8aa0'], beast: ['#e8d8c0', '#ffffff', '#806040'],
};
export const NAME = { plum: '매화', jaha: '자하', lightning: '뇌전', taiji: '태극', gold: '금강', lotus: '불광', poison: '독', dust: '취타', ice: '한빙', water: '물살', star: '칠성', mirror: '이형', glyph: '진법', quake: '패도', blood: '혈마', wind: '바람', fire: '화염', moon: '월광', cloud: '청운', sun: '일양', spear: '용', blade: '도기', steel: '검기', beast: '' };

export function styleOf(a, sk) {
  if (!sk) return a?.mon ? 'beast' : 'steel';
  if (sk.fxSt) return sk.fxSt;
  if (BYID[sk.id]) return (sk.fxSt = BYID[sk.id]);
  const m = /^x_([a-z]+)\d+$/.exec(sk.id || ''), own = (sk.fac && FAC[sk.fac]) || (m && FAC[m[1]]) || SCHOOL[sk.school] || RELIC[sk.id];
  if (own) { try { sk.fxSt = own; } catch { } return own; }  // 초식에 딸린 꼴만 기억한다(평타 같은 공용 초식은 쓰는 사람을 따른다)
  const f = /^(?:fd|sga|sgn)_([a-z]+)/.exec(a?.id || '');
  return a?.mon ? 'beast' : a?.def_?.fxSt || (f && FAC[f[1]]) || (sk.ult ? 'blood' : 'steel');
}

const MAX = 900;
// ChatGPT 효과 시트(tools/fx_in.py → assets/fx2). 있으면 시트 칸을, 없으면 코드 그림을 쓴다. 자리 목록: docs/art-slots.md
export const SHEET = {};
try { fetch('assets/fx2/fx.json').then(r => r.ok ? r.json() : {}).then(j => { for (const [k, v] of Object.entries(j || {})) { const im = new Image(); im.onload = () => { SHEET[k] = { im, ...v }; }; im.src = `assets/fx2/${k}.webp`; } }).catch(() => { }); } catch { }
function sheetAt(c, name, i, x, y, k = 1, rot = 0, flip = false) {
  const S = SHEET[name]; if (!S) return false; const f = Math.max(0, Math.min(S.n - 1, i | 0));
  c.save(); c.translate(x, y); if (rot) c.rotate(rot); if (flip) c.scale(-1, 1); c.drawImage(S.im, f * S.w, 0, S.w, S.h, -S.w / 2 * k, -S.h / 2 * k, S.w * k, S.h * k); c.restore(); return true;
}
// 화산: 검이 지나간 자리에 매화가 핀다(봉오리 → 만개 → 번쩍 → 흩날림). 늦게 피고 한꺼번에 터진다. 기획: docs/chatgpt-hwasan.md
const HW = { red: '#c8284a', dark: '#8e1838', pink: '#ff9fbd', light: '#ffc4d6', white: '#fff0f5', gold: '#ffe36a' };
function bloom(B, x, y, delay = 0, big = false, hit = false) { P(B, { k: 'bloom', x, y, life: big ? .9 : .62, delay, big, hit, s: big ? 13 : 5 }); }
// 매화 가지: 곧은 칼빛이 아니라 마디마다 꺾이고 갈라지는 붉은 줄기. 마디에 봉오리가 차례로 맺힌다
function branch(B, x, y, ang, len, delay = 0, nodes = 4) {
  const pts = [[0, 0]], fork = []; let px = 0, py = 0, a = 0; const n = 6, step = len / n;
  for (let i = 1; i <= n; i++) { a += rnd(-.35, .35); px += Math.cos(a) * step; py += Math.sin(a) * step; pts.push([px, py]); if (i > 1 && i < n && Math.random() < .55) { const fa = a + (Math.random() < .5 ? 1 : -1) * rnd(.5, .9), fl = step * rnd(.8, 1.6); fork.push([px, py, px + Math.cos(fa) * fl, py + Math.sin(fa) * fl]); } }
  P(B, { k: 'branch', x, y, ang, pts, fork, life: .55, delay, w: Math.max(1, len / 80), len, add: 0 });
  const ca = Math.cos(ang), sa = Math.sin(ang), at = ([u, v]) => [x + u * ca - v * sa, y + u * sa + v * ca];
  for (let i = 0; i < nodes; i++) { const j = Math.min(n, 1 + Math.round(i * (n - 1) / Math.max(1, nodes - 1))), [bx, by] = at(pts[j]); bloom(B, bx, by, delay + .05 + j * .035); }
  for (const f of fork) { const [bx, by] = at([f[2], f[3]]); bloom(B, bx, by, delay + .12); }
}
function plumUlt(B, a) {  // 매화만개: 허공에 가지가 그어지고 수십 송이가 맺힌 뒤 한꺼번에 핀다
  for (let i = 0; i < 6; i++) branch(B, a.x, a.y - 8, i / 6 * 6.28 + rnd(-.2, .2), rnd(70, 110), .25 + i * .03, 3);
  for (let i = 0; i < 18; i++) { const q = rnd(6.28), r = rnd(20, 120); bloom(B, a.x + Math.cos(q) * r, a.y - 8 + Math.sin(q) * r * .6, .45 + rnd(0, .08), i % 5 === 0, true); }
}
// 휘날리는 꽃잎: 좌우로 흔들리며 천천히 떨어지고, 뒤집히며 폭이 좁아졌다 넓어진다
const PINK = ['#ffb3cb', '#ff97b8', '#f7a6c0', '#fff0f5', '#c94f7c'], LOT = ['#fff4f8', '#ffd0e2', '#ffc0d8', '#ffffff', '#e08aa8'];
// 꽃잎 칸: [x, y, 색(0 바탕, 1 그늘, 2 빛)]
const PF = [[[1, 0, 0], [2, 0, 2], [0, 1, 1], [1, 1, 0], [2, 1, 0]], [[0, 0, 0], [1, 0, 2], [0, 1, 1], [1, 1, 0]], [[0, 0, 2], [0, 1, 0], [0, 2, 1]]];
const PF2 = [[[1, 0, 0], [2, 0, 0], [3, 0, 2], [0, 1, 1], [1, 1, 0], [2, 1, 0], [3, 1, 0], [1, 2, 1], [2, 2, 0]], [[0, 0, 0], [1, 0, 2], [0, 1, 1], [1, 1, 0], [2, 1, 0], [1, 2, 1]], [[0, 0, 2], [0, 1, 0], [0, 2, 0], [0, 3, 1]]];
function petal(B, x, y, vx, vy, st, life = rnd(.8, 1.5)) {
  const L = st === 'lotus' ? LOT : PINK;
  P(B, { k: 'petalF', x, y, vx, vy, g: 26, drag: .955, life, big: Math.random() < .35, col: L[(Math.random() * 3) | 0], col2: L[3], dk: L[4], rot: rnd(6.28), vr: rnd(-5, 5), sw: rnd(30, 70), f: rnd(4, 8), ph: rnd(6.28), fl: rnd(6, 12) });
}
function P(B, o) { if (B.parts.length < MAX) B.parts.push({ t: 0, vx: 0, vy: 0, g: 0, drag: 1, rot: 0, vr: 0, a0: 1, ...o }); }
const C = st => PAL[st] || PAL.steel;

// 기를 모을 때: 발밑과 몸 둘레
export function cast(B, st, a, big) {
  const [c0, c1, c2] = C(st), x = a.x, y = a.y, k = big ? 1.6 : 1;
  P(B, { k: 'ring', x, y, life: .32, s: 4, s2: 18 * k, col: c0, w: 2, add: 1, flat: 1 });
  switch (st) {
    case 'plum': for (let i = 0; i < 12 * k; i++) { const an = i / (12 * k) * 6.28, r = rnd(8, 16); petal(B, x + Math.cos(an) * r, y - 8 + Math.sin(an) * r * .5, -Math.sin(an) * 55, Math.cos(an) * 25 - 25, 'plum'); } break;  // 몸을 감아 도는 꽃잎 바람
    case 'lightning': for (let i = 0; i < 3 * k; i++) P(B, bolt(x + rnd(-10, 10), y - 26 - rnd(6), x + rnd(-6, 6), y - rnd(4), c0, c1, .16 + i * .05)); break;
    case 'taiji': P(B, { k: 'taiji', x, y, life: .7, s: 12 * k, col: c1, col2: c2, vr: 7, flat: 1, add: 0 }); break;
    case 'gold': P(B, { k: 'ring', x, y: y - 8, life: .45, s: 6, s2: 16 * k, col: c1, w: 1.5, add: 1 }); P(B, { k: 'wheel', x, y: y - 9, life: .5, s: 10 * k, col: c0, vr: 3, add: 1 }); break;
    case 'lotus': P(B, { k: 'lotus', x, y, life: .7, s: 12 * k, col: c0, col2: c1, flat: 1 }); for (let i = 0; i < 5; i++) P(B, { k: 'ray', x, y: y - 8, ang: -1.57 + rnd(-1, 1), life: .4, s: 18 * k, col: c2, add: 1 }); break;
    case 'poison': for (let i = 0; i < 6 * k; i++) P(B, { k: 'mist', x: x + rnd(-10, 10), y: y - rnd(2, 10), vx: rnd(-10, 10), vy: -rnd(4, 12), life: .7, s: 3, s2: 7, col: i % 2 ? c0 : c2, a0: .45 }); break;
    case 'dust': for (let i = 0; i < 10; i++) { const an = i / 10 * 6.28; P(B, { k: 'leaf', x: x + Math.cos(an) * 10, y: y - 2 + Math.sin(an) * 4, vx: -Math.sin(an) * 50, vy: -20 + Math.cos(an) * 10, life: .55, s: 1.4, col: i % 2 ? c0 : c2, vr: 10, drag: .93 }); } break;
    case 'ice': case 'cloud': for (let i = 0; i < 8; i++) P(B, { k: st === 'ice' ? 'shard' : 'mist', x: x + rnd(-12, 12), y: y - rnd(0, 14), vy: -rnd(8, 20), life: .5, s: st === 'ice' ? 2 : 3, s2: 6, col: i % 2 ? c0 : c1, rot: rnd(6.28), vr: rnd(-4, 4), add: 1, a0: st === 'ice' ? 1 : .5 }); break;
    case 'water': for (let i = 0; i < 10; i++) { const an = i / 10 * 6.28; P(B, { k: 'drop', x, y: y - 2, vx: Math.cos(an) * 40, vy: Math.sin(an) * 18 - 30, g: 160, life: .5, s: 1.4, col: i % 2 ? c0 : c1 }); } break;
    case 'star': { const D = [[-14, -24], [-9, -26], [-4, -24], [0, -21], [4, -24], [9, -22], [14, -27]]; D.forEach(([dx, dy], i) => P(B, { k: 'star', x: x + dx, y: y + dy, life: .55, s: 2.4, col: i === 6 ? c1 : c0, vr: 4, add: 1, delay: i * .04 })); break; }
    case 'mirror': for (let i = 0; i < 6; i++) { const an = i / 6 * 6.28; P(B, { k: 'orbit', x, y: y - 8, r: 14, ang: an, life: .6, s: 2.4, col: i % 2 ? c0 : c1, vr: 9, add: 1 }); } break;
    case 'glyph': P(B, { k: 'glyph', x, y, life: .75, s: 15 * k, col: c0, vr: 2, flat: 1, add: 1 }); break;
    case 'quake': P(B, { k: 'crack', x, y, life: .6, s: 16 * k, col: c2, seed: Math.random() * 99, flat: 1 }); for (let i = 0; i < 6; i++) P(B, { k: 'rock', x: x + rnd(-8, 8), y, vx: rnd(-30, 30), vy: -rnd(40, 80), g: 260, life: .5, s: 1.6, col: i % 2 ? c0 : c2, vr: 8 }); break;
    case 'jaha': for (let i = 0; i < 12 * k; i++) P(B, { k: 'flame', x: x + rnd(-10, 10), y: y - rnd(0, 4), vy: -rnd(18, 40), life: rnd(.4, .7), s: rnd(1.6, 2.6), col: c0, col2: c2, add: 1 }); for (let i = 0; i < 5; i++) petal(B, x + rnd(-8, 8), y - rnd(4, 16), rnd(-20, 20), -rnd(5, 20), 'plum'); break;  // 자하신공: 발밑에서 보랏빛 노을이 피어오른다
    case 'blood': case 'fire': for (let i = 0; i < 10 * k; i++) P(B, { k: 'flame', x: x + rnd(-9, 9), y: y - rnd(0, 6), vy: -rnd(20, 45), life: rnd(.35, .6), s: rnd(1.6, 2.8), col: c0, col2: st === 'blood' ? c2 : c1, add: st === 'fire' ? 1 : 0 }); break;
    case 'wind': for (let i = 0; i < 6; i++) P(B, { k: 'streak', x: x + rnd(-14, 14), y: y - rnd(2, 18), vx: rnd(60, 110) * (Math.random() < .5 ? -1 : 1), life: .3, s: 8, col: i % 2 ? c0 : c1, add: 1 }); break;
    case 'moon': P(B, { k: 'crescentP', x, y: y - 26, life: .6, s: 7 * k, col: c1, col2: c0, add: 1 }); break;
    case 'sun': for (let i = 0; i < 10; i++) P(B, { k: 'ray', x, y: y - 8, ang: i / 10 * 6.28, life: .35, s: 16 * k, col: c0, add: 1 }); break;
    case 'spear': for (let i = 0; i < 14; i++) P(B, { k: 'orbit', x, y: y - 2 - i * 1.6, r: 10 - i * .4, ang: i * .9, life: .45, s: 1.6, col: i % 2 ? c0 : c1, vr: 12, add: 1 }); break;
    case 'blade': for (let i = 0; i < 8; i++) P(B, { k: 'dot', x: x + rnd(-8, 8), y: y - rnd(0, 12), vy: -rnd(20, 50), life: .5, s: 1, col: i % 2 ? c0 : c1, add: 1 }); break;
    default: P(B, { k: 'star', x: x + rnd(-6, 6), y: y - 14, life: .3, s: 3, col: c1, add: 1 });
  }
}
function bolt(x1, y1, x2, y2, c0, c1, life, delay = 0) {
  const pts = [], n = 6; for (let i = 0; i <= n; i++) { const u = i / n; pts.push([lerp(x1, x2, u) + (i && i < n ? rnd(-4, 4) : 0), lerp(y1, y2, u) + (i && i < n ? rnd(-2, 2) : 0)]); }
  return { k: 'bolt', x: x1, y: y1, pts, life, col: c0, col2: c1, add: 1, delay };
}

// 휘두를 때: 칼 궤적과 그 둘레 조각
export function swing(B, st, a, h, sk) {
  const [c0, c1, c2] = C(st), an = Math.atan2(a.ay, a.ax), x = a.x, y = a.y - 6, ult = sk?.ult;
  if (h.shape === 'line') P(B, { k: 'thrust', x, y, ang: an, life: .26, s: Math.min(h.len || 40, 140), w: Math.min(h.w || 10, 40) * .45, col: c0, col2: c1, add: 1 });
  else if (h.shape === 'circle') P(B, { k: 'ring', x, y: a.y, life: .3, s: 6, s2: (h.r || 30) * .95, col: c0, w: 3, add: 1, flat: 1 });
  else P(B, { k: 'slash', x, y, ang: an, r: Math.min(h.r || 30, 90) * .8, sweep: Math.min((h.a || 80) * Math.PI / 180, 2.6), life: .28, w: ult ? 7 : 4, col: c0, col2: c1, add: 1, flip: (a.swingN = (a.swingN || 0) + 1) % 2 });
  const R = h.shape === 'line' ? (h.len || 40) : (h.r || 30), n = ult ? 22 : 8;
  for (let i = 0; i < n; i++) {
    const d = rnd(.3, 1) * R * (h.shape === 'circle' ? 1 : .9), q = h.shape === 'circle' ? rnd(6.28) : an + rnd(-1, 1) * (h.shape === 'line' ? .12 : Math.min((h.a || 80) * Math.PI / 180, 1.3)), px = x + Math.cos(q) * d, py = y + Math.sin(q) * d * (h.shape === 'circle' ? .8 : 1);
    bit(B, st, px, py, Math.cos(q), Math.sin(q), c0, c1, c2, i);
  }
  if (st === 'plum' && sk && !sk.basic) { const R2 = (h.shape === 'line' ? (h.len || 40) : (h.r || 30)) * .9; if (h.shape === 'circle') for (let i = 0; i < 5; i++) branch(B, x, y, i / 5 * 6.28, R2 * .8, .04, 2); else branch(B, x, y, an + (h.shape === 'line' ? 0 : rnd(-.3, .3)), R2, .03, h.shape === 'line' ? 7 : 4); }
  if (st === 'lightning') for (let i = 0; i < (ult ? 4 : 1); i++) { const d = R * rnd(.5, 1), q = an + rnd(-.6, .6); P(B, bolt(x, y, x + Math.cos(q) * d, y + Math.sin(q) * d, c0, c1, .14)); }
  if (st === 'taiji' && h.shape !== 'line') P(B, { k: 'taiji', x: x + a.ax * 14, y: y + a.ay * 10, life: .4, s: 9, col: c1, col2: c2, vr: -10 });
  if (st === 'quake' && (h.mul || 1) > 2.5) P(B, { k: 'crack', x: x + a.ax * 20, y: a.y + a.ay * 16, life: .5, s: 18, col: c2, seed: Math.random() * 99, flat: 1 });
}
// 꼴에 맞는 조각 하나
function bit(B, st, x, y, nx, ny, c0, c1, c2, i) {
  const sp = rnd(20, 60);
  switch (st) {
    case 'jaha': if (i % 2) return petal(B, x, y, nx * sp, ny * sp - 15, 'plum'); return P(B, { k: 'mist', x, y, vx: nx * sp * .4, vy: ny * sp * .4 - 8, life: .6, s: 2, s2: 6, col: i % 4 ? c0 : c2, a0: .45 });
    case 'plum': case 'lotus': petal(B, x, y, nx * sp * 1.4 + rnd(-15, 15), ny * sp - 20, st); if (i % 2) petal(B, x + rnd(-4, 4), y + rnd(-3, 3), nx * sp * .6, -rnd(10, 30), st); return;
    case 'dust': return P(B, { k: 'leaf', x, y, vx: nx * sp, vy: ny * sp - 20, life: .5, s: 1.3, col: i % 2 ? c0 : c2, vr: 12, g: 40, drag: .94 });
    case 'ice': case 'mirror': return P(B, { k: 'shard', x, y, vx: nx * sp, vy: ny * sp, life: .35, s: rnd(1.6, 2.6), col: i % 2 ? c0 : c1, rot: Math.atan2(ny, nx), add: 1, drag: .9 });
    case 'poison': return P(B, { k: i % 3 ? 'mist' : 'needle', x, y, vx: nx * sp * .5, vy: ny * sp * .5 - 6, life: .55, s: 2, s2: 5, col: i % 2 ? c0 : c2, a0: .5, rot: Math.atan2(ny, nx) });
    case 'water': return P(B, { k: 'drop', x, y, vx: nx * sp, vy: ny * sp - 30, g: 180, life: .45, s: 1.3, col: i % 2 ? c0 : c1 });
    case 'star': case 'sun': case 'glyph': case 'gold': return P(B, { k: 'star', x, y, vx: nx * 10, vy: ny * 10, life: .35, s: rnd(1.4, 2.4), col: i % 2 ? c0 : c1, vr: 6, add: 1 });
    case 'blood': case 'fire': return P(B, { k: 'flame', x, y, vx: nx * 15, vy: -rnd(15, 35), life: .4, s: rnd(1.4, 2.2), col: c0, col2: st === 'blood' ? c2 : c1, add: st === 'fire' ? 1 : 0 });
    case 'quake': return P(B, { k: 'rock', x, y, vx: nx * sp, vy: -rnd(30, 70), g: 240, life: .45, s: 1.4, col: i % 2 ? c0 : c2, vr: 8 });
    case 'wind': case 'cloud': case 'spear': return P(B, { k: 'streak', x, y, vx: nx * 120, vy: ny * 120, life: .18, s: 6, col: i % 2 ? c0 : c1, add: 1 });
    case 'beast': return P(B, { k: 'dot', x, y, vx: nx * sp, vy: ny * sp, life: .25, s: 1, col: c0 });
    default: return P(B, { k: 'spark', x, y, vx: nx * sp * 2, vy: ny * sp * 2, life: .2, s: 4, col: i % 2 ? c0 : c1, add: 1 });
  }
}
// 맞았을 때
export function impact(B, st, o, nx, ny, big) {
  const [c0, c1, c2] = C(st), x = o.x, y = o.y - 7, n = big ? 12 : 5;
  P(B, { k: 'burst', x, y, life: .14, s: big ? 11 : 7, col: c1, add: 1 });
  P(B, { k: 'hitstar', x, y, life: big ? .18 : .13, s: big ? 12 : 7, col: c1, ang: Math.atan2(ny, nx), add: 1 });  // 맞는 순간 번쩍(빛살 여덟 갈래)
  for (let i = 0; i < n; i++) { const q = Math.atan2(ny, nx) + rnd(-1.2, 1.2); bit(B, st, x, y, Math.cos(q), Math.sin(q), c0, c1, c2, i); }
  if (st === 'plum') bloom(B, x + rnd(-3, 3), y + rnd(-3, 2), .08, big, true);  // 늦게 핀다
  if (st === 'lightning') P(B, bolt(x + rnd(-4, 4), y - 30, x, y, c0, c1, .14));
  if (st === 'poison') P(B, { k: 'mist', x, y, vy: -6, life: .8, s: 4, s2: 9, col: c0, a0: .35 });
  if (st === 'ice') P(B, { k: 'ring', x, y: o.y, life: .3, s: 3, s2: 10, col: c1, w: 1.5, add: 1, flat: 1 });
  if (st === 'gold' && big) P(B, { k: 'wheel', x, y, life: .35, s: 9, col: c0, vr: 6, add: 1 });
}
// 날아가는 기운의 꼬리
export function trail(B, st, p) {
  const [c0, c1, c2] = C(st);
  if (st === 'plum' || st === 'lotus') { const l = p.speed || 1; for (let i = 0; i < 2; i++) if (Math.random() < .7) petal(B, p.x + rnd(-3, 3), p.y + rnd(-3, 3), -p.vx / l * rnd(10, 30) - p.vy / l * rnd(-30, 30), -p.vy / l * 15 + rnd(-20, 5), st, rnd(.6, 1.1)); return; }
  if (Math.random() < .55) bit(B, st, p.x + rnd(-2, 2), p.y + rnd(-2, 2), -p.vx / (p.speed || 1) * .3, -p.vy / (p.speed || 1) * .3, c0, c1, c2, (B.t * 60) | 0);
}
// 땅에서 터질 때
export function burstAt(B, st, x, y, r) {
  const [c0, c1, c2] = C(st);
  P(B, { k: 'ring', x, y, life: .3, s: 3, s2: r * 1.1, col: c0, w: 2.5, add: 1, flat: 1 });
  for (let i = 0; i < 8; i++) { const q = rnd(6.28); bit(B, st, x + Math.cos(q) * r * .4, y - 4 + Math.sin(q) * r * .3, Math.cos(q), Math.sin(q) - .5, c0, c1, c2, i); }
  if (st === 'lightning') P(B, bolt(x + rnd(-3, 3), y - 44, x, y - 2, c0, c1, .2));
  if (st === 'glyph') P(B, { k: 'glyph', x, y, life: .4, s: r, col: c0, vr: 4, flat: 1, add: 1 });
  if (st === 'taiji') P(B, { k: 'taiji', x, y, life: .4, s: r * .8, col: c1, col2: c2, vr: 9, flat: 1 });
}
// 절초: 판 전체를 덮는 연출
export function ult(B, st, a) {
  cast(B, st, a, true);
  const [c0, c1] = C(st); B.flashC = c0; B.flashT = .16; B.dimT = .9; B.zoomT = .75; B.zoomX = a.x; B.zoomY = a.y - 8;
  P(B, { k: 'ring', x: a.x, y: a.y, life: .55, s: 8, s2: 70, col: c1, w: 3, add: 1, flat: 1 });
  if (st === 'plum') plumUlt(B, a);
  for (let i = 0; i < 16; i++) { const q = i / 16 * 6.28; P(B, { k: 'streak', x: a.x + Math.cos(q) * 70, y: a.y - 8 + Math.sin(q) * 50, vx: -Math.cos(q) * 200, vy: -Math.sin(q) * 140, life: .3, s: 10, col: i % 2 ? c0 : c1, add: 1 }); }  // 기가 몸으로 빨려 든다
}

export function tick(B, dt) {
  for (const p of B.parts) {
    if (p.delay > 0) { p.delay -= dt; continue; }
    p.t += dt; p.vy += p.g * dt; if (p.sw) p.vx += Math.sin(p.t * p.f + p.ph) * p.sw * dt; p.vx *= p.drag; p.vy *= p.drag; p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt;
    if (p.k === 'orbit') p.ang += p.vr * dt;
    if (p.k === 'bloom' && !p.popped && p.t / p.life >= .58) { p.popped = true; for (let i = 0; i < (p.big ? 14 : 5); i++) { const q = rnd(6.28), v = rnd(20, p.big ? 80 : 45); petal(B, p.x, p.y, Math.cos(q) * v, Math.sin(q) * v - 15, 'plum'); } if (p.hit) B.stop = Math.max(B.stop || 0, p.big ? .08 : .035); }
  }
  B.parts = B.parts.filter(p => p.t < p.life);
  for (const k of ['flashT', 'dimT', 'zoomT']) if (B[k] > 0) B[k] -= dt;
}

// 도트 결 맞추기: 조각은 평면도 한 점 = 한 칸인 작은 판(320×180)에 그리고, 반투명 가장자리를 세 단계로 끊은 뒤 4배로 키워 붙인다.
// 그래서 꽃잎·검기도 옛 효과 그림처럼 각진 도트로 보인다
let LN, LA;
const LW = 420, LH = 240;  // 2D 전투가 한 화면에 보이는 평면도 넓이보다 조금 크게
const mkL = () => { const c = document.createElement('canvas'); c.width = LW; c.height = LH; const x = c.getContext('2d', { willReadFrequently: true }); x.imageSmoothingEnabled = false; return x; };
function crisp(x) {
  const im = x.getImageData(0, 0, LW, LH), d = im.data;
  for (let i = 3; i < d.length; i += 4) { const a = d[i]; if (!a) continue; const q = a < 48 ? 0 : a < 150 ? 128 : 255; if (q && q !== a) { const k = q / a; d[i - 3] = Math.min(255, d[i - 3] * k); d[i - 2] = Math.min(255, d[i - 2] * k); d[i - 1] = Math.min(255, d[i - 1] * k); } d[i] = q; }
  x.putImageData(im, 0, 0);
}
// c: 판 좌표(SCALE 곱한 상태)로 옮겨 둔 본 캔버스. ox, oy: 화면 왼쪽 위의 평면도 자리(음수)
// M: 새 화면(3D) 전투일 때 평면도 (x, y)를 화면(1280×720)으로 옮기는 행렬 함수. 그때 작은 판은 화면의 4분의 1이다
export function draw(c, B, under, ox, oy, projs = [], raw, M) {
  LN = LN || mkL(); LA = LA || mkL();
  for (const x of [LN, LA]) { x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, LW, LH); if (!M) x.translate(ox, oy); }
  const at = (x, px, py, flat) => { if (M) { const m = M(px, py, flat); x.setTransform(m[0] / 4, m[1] / 4, m[2] / 4, m[3] / 4, m[4] / 4, m[5] / 4); } };
  let n = 0;
  for (const p of B.parts) {
    if (p.delay > 0 || !!p.flat !== !!under) continue;
    const u = p.t / p.life, al = (p.a0 ?? 1) * (u < .15 ? u / .15 : 1 - Math.max(0, u - .4) / .6);
    if (al <= 0) continue; const x = p.add ? LA : LN;
    x.save(); at(x, p.x, p.y, p.flat); x.globalAlpha = clamp(al, 0, 1); if (p.add) x.globalCompositeOperation = 'lighter';
    shape(x, p, u); x.restore(); n++;
  }
  for (const p of projs) { LN.save(); at(LN, p.x, p.y); if (p.img === 'plum' || p.st && (p.img === 'p_energy' || p.img === 'p_bigenergy')) drawProj(LN, p, p.st || 'plum'); else raw(LN, p); LN.restore(); n++; }
  if (!n) return;
  crisp(LN); crisp(LA);
  c.save(); c.imageSmoothingEnabled = false; if (M) c.setTransform(4, 0, 0, 4, 0, 0);
  const X = M ? 0 : -ox, Y = M ? 0 : -oy; c.drawImage(LN.canvas, X, Y); c.globalCompositeOperation = 'lighter'; c.drawImage(LA.canvas, X, Y); c.restore();
}
// 초승달 하나: 반지름 r, 시작각 a0에서 span만큼, 가운데 두께 w(양 끝으로 갈수록 가늘어짐)
function crescent(c, r, a0, span, w, col, al) {
  if (Math.abs(span) < .02 || w <= 0) return; const N = 18, A = c.globalAlpha; c.globalAlpha = A * al; c.fillStyle = col; c.beginPath();
  for (let i = 0; i <= N; i++) { const t = i / N, a = a0 + span * t, th = w * Math.pow(Math.sin(Math.PI * t), .7) / 2; c.lineTo(Math.cos(a) * (r + th), Math.sin(a) * (r + th)); }
  for (let i = N; i >= 0; i--) { const t = i / N, a = a0 + span * t, th = w * Math.pow(Math.sin(Math.PI * t), .7) / 2 * .55; c.lineTo(Math.cos(a) * (r - th), Math.sin(a) * (r - th)); }
  c.closePath(); c.fill(); c.globalAlpha = A;
}
function shape(c, p, u) {
  const x = p.x, y = p.y;
  switch (p.k) {
    case 'ring': { const r = lerp(p.s, p.s2, 1 - (1 - u) * (1 - u)); c.strokeStyle = p.col; c.lineWidth = Math.max(.3, p.w * (1 - u)); c.beginPath(); c.ellipse(x, y, r, r * (p.flat ? .55 : 1), 0, 0, 6.29); c.stroke(); break; }
    case 'bloom': {  // 봉오리 → 반쯤 → 만개 → 번쩍 → (터지면 꽃잎이 따로 흩날린다)
      const q = u / .58; if (q > 1.25) break; const big = p.big;
      if (sheetAt(c, big ? 'hs_bloom_big' : 'hs_bloom', Math.min(7, Math.floor(q * 5)), x, y)) break;
      // 코드 그림은 봉오리만: 꽃 모양을 코드로 그리면 장난감처럼 보여서, 만개 그림(hs_bloom)이 오기 전까지는 봉오리가 부풀다 번쩍이며 꽃잎으로 터지는 것으로 대신한다
      const X = Math.round(x), Y = Math.round(y), b = big ? 2 : 1;
      if (q <= 1) { const g = q < .5 ? 1 : 2; c.fillStyle = HW.dark; c.fillRect(X, Y, g * b, g * b); c.fillStyle = q > .75 ? HW.white : HW.red; c.fillRect(X, Y, b, b); }  // 작은 봉오리 한두 점
      else { const r = (q - 1) * 30 * b; c.strokeStyle = HW.white; c.lineWidth = 1; c.beginPath(); c.arc(x, y, r, 0, 6.29); c.stroke(); }
      break; }
    case 'branch': {  // 자라나는 가지: 앞 절반 동안 끝까지 뻗고, 뒤 절반 동안 옅어진다
      c.translate(x, y); c.rotate(p.ang); const grow = Math.min(1, u * 2.4), n = p.pts.length - 1, upto = grow * n;
      if (SHEET.hs_branch) { sheetAt(c, 'hs_branch', Math.floor(u * 8), p.len / 2, 0, p.len / SHEET.hs_branch.w); break; }
      c.lineCap = 'round'; c.lineJoin = 'round';
      for (const [col, w] of [[HW.dark, p.w + 1.6], [HW.red, p.w], [HW.white, Math.max(.6, p.w * .35)]]) {
        c.strokeStyle = col; c.lineWidth = w * (1 - Math.max(0, u - .55)); c.beginPath(); c.moveTo(0, 0);
        for (let i = 1; i <= Math.ceil(upto); i++) { const [ax, ay] = p.pts[i - 1], [bx, by] = p.pts[i], f = Math.min(1, upto - (i - 1)); c.lineTo(ax + (bx - ax) * f, ay + (by - ay) * f); } c.stroke();
        if (grow > .6) for (const f of p.fork) { c.beginPath(); c.moveTo(f[0], f[1]); c.lineTo(f[0] + (f[2] - f[0]) * (grow - .6) / .4, f[1] + (f[3] - f[1]) * (grow - .6) / .4); c.stroke(); }
      }
      break; }
    case 'petalF': {  // 점을 하나하나 찍은 꽃잎. 뒤집히는 폭에 따라 넓은 잎·반쪽·옆모습 세 칸을 고른다
      if (SHEET.hs_petal) { const fr = Math.floor((p.t * p.fl / 1.6 + p.ph) % 4), row = PINK.indexOf(p.col) % 3; sheetAt(c, 'hs_petal', (row < 0 ? 1 : row) * 4 + (fr < 0 ? 0 : fr), x, y, p.big ? 1 : .75, p.rot); break; }
      const w = Math.abs(Math.cos(p.t * p.fl + p.ph)), F = (p.big ? PF2 : PF)[w > .66 ? 0 : w > .3 ? 1 : 2], fl = Math.sin(p.rot) > 0, X = Math.round(x), Y = Math.round(y), K = [p.col, p.dk, p.col2];
      for (const [dx, dy, ci] of F) { c.fillStyle = K[ci]; c.fillRect(X + (fl ? -dx : dx), Y + dy, 1, 1); } break; }
    case 'petal': c.translate(x, y); c.rotate(p.rot); c.fillStyle = p.col; c.beginPath(); c.ellipse(0, 0, p.s * 1.3, p.s * .7, 0, 0, 6.29); c.fill(); break;
    case 'leaf': c.translate(x, y); c.rotate(p.rot); c.fillStyle = p.col; c.fillRect(-p.s, -p.s * .4, p.s * 2, p.s * .8); break;
    case 'shard': c.translate(x, y); c.rotate(p.rot); c.fillStyle = p.col; c.beginPath(); c.moveTo(p.s * 1.8, 0); c.lineTo(0, p.s * .5); c.lineTo(-p.s, 0); c.lineTo(0, -p.s * .5); c.closePath(); c.fill(); break;
    case 'needle': c.translate(x, y); c.rotate(p.rot); c.strokeStyle = '#d8e0d0'; c.lineWidth = .6; c.beginPath(); c.moveTo(-3, 0); c.lineTo(3, 0); c.stroke(); break;
    case 'mist': { const r = lerp(p.s, p.s2 || p.s, u); c.fillStyle = p.col; c.beginPath(); c.arc(x, y, r, 0, 6.29); c.fill(); break; }
    case 'drop': c.fillStyle = p.col; c.fillRect(x - p.s / 2, y - p.s / 2, p.s, p.s * 1.4); break;
    case 'dot': c.fillStyle = p.col; c.fillRect(x - p.s / 2, y - p.s / 2, p.s, p.s); break;
    case 'rock': c.translate(x, y); c.rotate(p.rot); c.fillStyle = p.col; c.fillRect(-p.s, -p.s * .8, p.s * 2, p.s * 1.6); break;
    case 'star': { c.translate(x, y); c.rotate(p.rot); const s = p.s * (1 - u * .4); c.fillStyle = p.col; c.beginPath(); for (let i = 0; i < 8; i++) { const r = i % 2 ? s * .32 : s, q = i * Math.PI / 4; c.lineTo(Math.cos(q) * r, Math.sin(q) * r); } c.closePath(); c.fill(); break; }
    case 'spark': { const l = Math.hypot(p.vx, p.vy) || 1; c.strokeStyle = p.col; c.lineWidth = .8; c.beginPath(); c.moveTo(x, y); c.lineTo(x - p.vx / l * p.s, y - p.vy / l * p.s); c.stroke(); break; }
    case 'streak': { const l = Math.hypot(p.vx, p.vy) || 1; c.strokeStyle = p.col; c.lineWidth = 1; c.beginPath(); c.moveTo(x, y); c.lineTo(x - p.vx / l * p.s, y - p.vy / l * p.s); c.stroke(); break; }
    case 'ray': { const l = p.s * (.3 + u * .7); c.strokeStyle = p.col; c.lineWidth = 1.4 * (1 - u) + .3; c.beginPath(); c.moveTo(x + Math.cos(p.ang) * l * .3, y + Math.sin(p.ang) * l * .3); c.lineTo(x + Math.cos(p.ang) * l, y + Math.sin(p.ang) * l); c.stroke(); break; }
    case 'burst': { const r = p.s * (.4 + u); const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, p.col); g.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, 6.29); c.fill(); break; }
    case 'flame': { const s = p.s * (1 - u * .6); c.fillStyle = u < .45 ? p.col : p.col2; c.beginPath(); c.moveTo(x, y - s * 2.2); c.quadraticCurveTo(x + s, y, x, y + s * .6); c.quadraticCurveTo(x - s, y, x, y - s * 2.2); c.fill(); break; }
    case 'bolt': { c.lineJoin = 'round'; for (const [col, w] of [[p.col, 2.4], [p.col2, .9]]) { c.strokeStyle = col; c.lineWidth = w; c.beginPath(); p.pts.forEach(([a, b], i) => i ? c.lineTo(a, b) : c.moveTo(a, b)); c.stroke(); } break; }
    case 'taiji': { const r = p.s * (.6 + u * .5); c.translate(x, y); if (p.flat) c.scale(1, .55); c.rotate(p.rot); c.globalAlpha *= .8;
      c.fillStyle = p.col; c.beginPath(); c.arc(0, 0, r, -1.571, 1.571); c.arc(0, r / 2, r / 2, 1.571, 4.712, true); c.arc(0, -r / 2, r / 2, 1.571, 4.712); c.fill();
      c.fillStyle = p.col2; c.beginPath(); c.arc(0, 0, r, 1.571, 4.712); c.arc(0, -r / 2, r / 2, 4.712, 1.571, true); c.arc(0, r / 2, r / 2, 4.712, 1.571); c.fill();
      c.fillStyle = p.col2; c.beginPath(); c.arc(0, -r / 2, r / 7, 0, 6.29); c.fill(); c.fillStyle = p.col; c.beginPath(); c.arc(0, r / 2, r / 7, 0, 6.29); c.fill();
      c.strokeStyle = p.col; c.lineWidth = .8; c.beginPath(); c.arc(0, 0, r + 1.5, 0, 6.29); c.stroke(); break; }
    case 'lotus': { const r = p.s * Math.min(1, u * 2.5); c.translate(x, y); c.scale(1, .55); for (let i = 0; i < 8; i++) { c.save(); c.rotate(i / 8 * 6.28 + u); c.fillStyle = i % 2 ? p.col : p.col2; c.beginPath(); c.ellipse(r * .55, 0, r * .5, r * .2, 0, 0, 6.29); c.fill(); c.restore(); } c.fillStyle = '#ffe080'; c.beginPath(); c.arc(0, 0, r * .18, 0, 6.29); c.fill(); break; }
    case 'wheel': { c.translate(x, y); c.rotate(p.rot); const r = p.s * (.7 + u * .4); c.strokeStyle = p.col; c.lineWidth = 1.2; c.beginPath(); c.arc(0, 0, r, 0, 6.29); c.stroke(); for (let i = 0; i < 8; i++) { const q = i * Math.PI / 4; c.beginPath(); c.moveTo(Math.cos(q) * r * .3, Math.sin(q) * r * .3); c.lineTo(Math.cos(q) * r, Math.sin(q) * r); c.stroke(); } break; }
    case 'glyph': { c.translate(x, y); c.scale(1, .55); c.rotate(p.rot); const r = p.s * Math.min(1, u * 3); c.strokeStyle = p.col; c.lineWidth = 1.2; c.strokeRect(-r * .7, -r * .7, r * 1.4, r * 1.4); c.rotate(Math.PI / 4); c.strokeRect(-r * .7, -r * .7, r * 1.4, r * 1.4); c.beginPath(); c.arc(0, 0, r, 0, 6.29); c.stroke(); c.beginPath(); c.arc(0, 0, r * .35, 0, 6.29); c.stroke(); break; }
    case 'crack': { c.translate(x, y); c.scale(1, .55); c.strokeStyle = p.col; c.lineWidth = 1.4; let s = p.seed; const R = () => (s = (s * 9301 + 49297) % 233280) / 233280; const r = p.s * Math.min(1, u * 4);
      for (let i = 0; i < 7; i++) { let q = i / 7 * 6.28 + R(), px = 0, py = 0; c.beginPath(); c.moveTo(0, 0); for (let j = 1; j <= 3; j++) { q += (R() - .5) * .8; px += Math.cos(q) * r / 3; py += Math.sin(q) * r / 3; c.lineTo(px, py); } c.stroke(); } break; }
    case 'orbit': { const px = x + Math.cos(p.ang) * p.r, py = y + Math.sin(p.ang) * p.r * .5; c.fillStyle = p.col; c.fillRect(px - p.s / 2, py - p.s / 2, p.s, p.s); break; }
    case 'crescentP': { const r = p.s; c.fillStyle = p.col; c.beginPath(); c.arc(x, y, r, 0, 6.29); c.fill(); c.globalCompositeOperation = 'destination-out'; c.beginPath(); c.arc(x + r * .45, y - r * .2, r * .85, 0, 6.29); c.fill(); break; }
    case 'slash': { // 초승달 검기: 가운데가 두껍고 양 끝이 칼날처럼 가늘다. 바깥 빛 → 제 색 → 흰 날 세 겹, 뒤로 잔상 두 겹
      if (SHEET.sw_arc && !p.big) { sheetAt(c, 'sw_arc', Math.floor(u * 8), x, y, p.r * 2.2 / SHEET.sw_arc.w, p.ang, !!p.flip); break; }
      const sw = p.sweep, prog = Math.min(1, u * 2.6), r = p.r, W = p.w * 1.6 * (1 - u * .55), dir = p.flip ? -1 : 1;
      const a0 = p.ang - dir * sw / 2, span = dir * sw * prog;  // 그어진 만큼만
      c.translate(x, y);
      // 잔상: 조금 뒤에서 따라오는 옅은 호
      for (const [lag, al, k] of [[.22, .35, .55], [.12, .55, .75]]) if (prog > lag) { crescent(c, r * (1 - lag * .25), a0, span * (1 - lag), W * k, p.col, al); }
      crescent(c, r, a0, span, W * 1.5, p.col, .5);      // 바깥 빛
      crescent(c, r, a0, span, W, p.col2 || p.col, 1);    // 제 색
      crescent(c, r + W * .12, a0, span, W * .38, '#ffffff', 1);  // 흰 날
      // 칼끝 번쩍: 다 그어지는 순간 호 끝에 작은 십자
      if (u > .3 && u < .55) { const ea = a0 + span, ex = Math.cos(ea) * r, ey = Math.sin(ea) * r, k = (1 - Math.abs(u - .42) / .13) * W * 1.4; c.fillStyle = '#ffffff'; c.fillRect(ex - k, ey - .6, k * 2, 1.2); c.fillRect(ex - .6, ey - k, 1.2, k * 2); }
      break; }
    case 'hitstar': {  // 날카로운 빛살: 긴 넷(맞은 방향으로 더 길게) + 짧은 넷
      if (SHEET.sw_hit) { sheetAt(c, 'sw_hit', Math.floor(u * 6), x, y, p.s * 2 / SHEET.sw_hit.w); break; }
      c.translate(x, y); c.rotate(p.ang); const L = p.s * (u < .35 ? u / .35 : 1) , th = Math.max(.6, 2.2 * (1 - u));
      for (let i = 0; i < 8; i++) { const long = i % 2 === 0, l = L * (long ? (i === 0 ? 1.25 : 1) : .45); c.rotate(Math.PI / 4); c.fillStyle = i % 2 ? p.col : '#ffffff'; c.beginPath(); c.moveTo(0, -th / 2); c.lineTo(l, 0); c.lineTo(0, th / 2); c.closePath(); c.fill(); }
      break; }
    case 'thrust': {  // 찌르기 검기: 창끝처럼 뾰족한 빛줄기, 흰 심지, 끝에서 고리 충격파
      if (SHEET.sw_thrust) { sheetAt(c, 'sw_thrust', Math.floor(u * 6), x + Math.cos(p.ang) * p.s / 2, y + Math.sin(p.ang) * p.s / 2, p.s / SHEET.sw_thrust.w, p.ang); break; }
      c.translate(x, y); c.rotate(p.ang); const l = p.s * Math.min(1, u * 4), w = Math.max(2, p.w * 1.3) * (1 - u * .7);
      const A = c.globalAlpha, blade = (ww, col, al, l0 = 0) => { c.globalAlpha = A * al; c.fillStyle = col; c.beginPath(); c.moveTo(l0, -ww / 2); c.lineTo(l * .78, -ww * .32); c.lineTo(l, 0); c.lineTo(l * .78, ww * .32); c.lineTo(l0, ww / 2); c.closePath(); c.fill(); };
      blade(w * 1.8, p.col, .45); blade(w, p.col2 || p.col, 1); blade(w * .32, '#ffffff', 1, l * .1); c.globalAlpha = A;
      if (u > .2 && u < .7) { const q = (u - .2) / .5; c.strokeStyle = '#ffffff'; c.lineWidth = Math.max(.6, 2 * (1 - q)); c.beginPath(); c.ellipse(l, 0, 2 + q * 6, 3 + q * 9, 0, 0, 6.29); c.stroke(); }
      break; }
  }
}

// 날아가는 기운: 세력마다 다른 꼴로 그린다(옛 그림 p_energy 자리를 바꾼다)
function drawProj(c, p, st) {
  const [c0, c1, c2] = C(st), big = p.img === 'p_bigenergy', s = big ? 1.5 : 1;
  if (st === 'plum' || st === 'lotus' || p.img === 'plum') return swirl(c, p, st === 'lotus' ? 'lotus' : 'plum', s);
  c.save(); c.translate(p.x, p.y); c.globalCompositeOperation = 'lighter';
  const g = c.createRadialGradient(0, 0, 0, 0, 0, 9 * s); g.addColorStop(0, c0 + 'cc'); g.addColorStop(1, c0 + '00'); c.fillStyle = g; c.beginPath(); c.arc(0, 0, 9 * s, 0, 6.29); c.fill();
  c.globalCompositeOperation = 'source-over'; c.rotate(p.an); c.scale(s, s);
  switch (st) {
    case 'ice': case 'mirror': c.fillStyle = c1; c.beginPath(); c.moveTo(8, 0); c.lineTo(0, 3); c.lineTo(-6, 0); c.lineTo(0, -3); c.closePath(); c.fill(); c.fillStyle = c0; c.fillRect(-6, -.5, 12, 1); break;
    case 'lightning': c.strokeStyle = c1; c.lineWidth = 1.2; c.beginPath(); c.moveTo(-8, 0); for (let i = -6; i <= 8; i += 2) c.lineTo(i, rnd(-3, 3)); c.stroke(); c.fillStyle = c0; c.beginPath(); c.arc(4, 0, 2.6, 0, 7); c.fill(); break;
    case 'poison': c.fillStyle = c0; c.beginPath(); c.ellipse(0, 0, 6, 2.2, 0, 0, 7); c.fill(); c.fillStyle = c2; c.beginPath(); c.arc(2, 0, 1.4, 0, 7); c.fill(); break;
    case 'fire': case 'sun': case 'blood': c.fillStyle = c0; c.beginPath(); c.arc(2, 0, 4, 0, 7); c.fill(); c.fillStyle = c1; c.beginPath(); c.arc(2.5, 0, 2.2, 0, 7); c.fill(); c.fillStyle = c2; c.beginPath(); c.moveTo(-1, -3); c.lineTo(-9, 0); c.lineTo(-1, 3); c.fill(); break;
    case 'star': case 'glyph': case 'gold': c.rotate(p.age * 12); c.fillStyle = c0; c.beginPath(); for (let i = 0; i < 8; i++) { const r = i % 2 ? 1.8 : 5, q = i * Math.PI / 4; c.lineTo(Math.cos(q) * r, Math.sin(q) * r); } c.closePath(); c.fill(); c.fillStyle = c1; c.fillRect(-1, -1, 2, 2); break;
    case 'water': c.strokeStyle = c1; c.lineWidth = 2; c.beginPath(); c.arc(-4, 0, 8, -1, 1); c.stroke(); c.strokeStyle = c0; c.lineWidth = 3; c.beginPath(); c.arc(-7, 0, 8, -.9, .9); c.stroke(); break;
    case 'quake': case 'dust': c.rotate(p.age * 10); c.fillStyle = c0; c.fillRect(-3, -3, 6, 6); c.fillStyle = c2; c.fillRect(-1, -3, 4, 2); break;
    default: c.strokeStyle = c1; c.lineWidth = 2.4; c.beginPath(); c.arc(-6, 0, 11, -1.1, 1.1); c.stroke(); c.strokeStyle = c0 + 'aa'; c.lineWidth = 4; c.beginPath(); c.arc(-9, 0, 11, -1, 1); c.stroke();  // 바람·청운·검기: 초승달 검기
  }
  c.restore();
}

// 꽃잎 소용돌이: 기운의 몸은 꽃이 아니라 휘감아 도는 꽃잎 무리
function swirl(c, p, st, k = 1) {
  const L = st === 'lotus' ? LOT : PINK, n = 10;
  for (let i = 0; i < n; i++) { const q = p.age * 11 + i / n * 6.28, r = (2.5 + (i % 3) * 2) * k, w = Math.abs(Math.cos(p.age * 9 + i)), F = (i % 3 ? PF : PF2)[w > .66 ? 0 : w > .3 ? 1 : 2], X = Math.round(p.x + Math.cos(q) * r * 1.4), Y = Math.round(p.y + Math.sin(q) * r * .8), K = [L[i % 3], L[4], L[3]], fl = i % 2;
    for (const [dx, dy, ci] of F) { c.fillStyle = K[ci]; c.fillRect(X + (fl ? -dx : dx), Y + dy, 1, 1); } }
}
// 화면 전체: 절초를 쓸 때 어둡게, 번쩍
export function screen(c, B) {
  if (B.dimT > 0) { c.fillStyle = `rgba(6,4,12,${Math.min(.55, B.dimT * .9)})`; c.fillRect(0, 0, 1280, 720); }
  if (B.flashT > 0) { c.globalAlpha = B.flashT / .16 * .45; c.fillStyle = B.flashC || '#fff'; c.fillRect(0, 0, 1280, 720); c.globalAlpha = 1; }
}
