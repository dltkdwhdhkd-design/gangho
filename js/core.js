// 공용 도구: 수학, 그림과 소리 불러오기, 입력
export const TS = 16, SCALE = 4, VW = 320, VH = 180, STEP = 1 / 60;
export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => [...r.querySelectorAll(s)];
export const el = (tag, cls = '', html = '') => { const e = document.createElement(tag); if (cls) e.className = cls; if (html) e.innerHTML = html; return e; };
export const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
export const lerp = (a, b, t) => a + (b - a) * t;
export const rnd = (a = 1, b) => b === undefined ? Math.random() * a : a + Math.random() * (b - a);
export const rint = (a, b) => Math.floor(rnd(a, b + 1));
export const pick = a => a[Math.floor(Math.random() * a.length)];
export const hyp = Math.hypot;
export const wait = s => new Promise(r => setTimeout(r, s * 1000 / (G.speedup || 1)));
export const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// 게임 전체가 함께 쓰는 값
export const G = { S: null, scene: null, speedup: 1, paused: false, ctx: null, debug: false };

// ── 그림 ─────────────────────────────
export const IMG = {};
const IMAGES = {
  tiles: ['Floor', 'Nature', 'House', 'Element', 'Water', 'Relief', 'FloorDetail', 'Interior', 'InteriorFloor', 'WallSimple', 'InteriorElements'],
  chars: ['_Shadow', 'BlueNinja', 'BlueSamurai', 'Boy', 'Cavegirl', 'Cavegirl2', 'Caveman', 'Caveman2', 'Child', 'DarkNinja', 'EggBoy', 'EggGirl', 'GoldKnight', 'GrayNinja', 'GreenNinja', 'Greenman', 'Inspector', 'Knight', 'Lion', 'MaskFrog', 'MaskedNinja', 'Master', 'Monk', 'Monk2', 'Noble', 'OldMan', 'OldMan2', 'OldMan3', 'OldWoman', 'Princess', 'RedNinja', 'RedNinja2', 'RedSamurai', 'Samurai', 'Skeleton', 'Villager', 'Villager2', 'Villager3', 'Villager4', 'Woman'],
  faces: ['BlueNinja', 'BlueSamurai', 'Boy', 'Cavegirl', 'Cavegirl2', 'Caveman', 'Caveman2', 'Child', 'DarkNinja', 'EggBoy', 'EggGirl', 'GoldKnight', 'GrayNinja', 'GreenNinja', 'Inspector', 'Knight', 'Lion', 'MaskFrog', 'MaskedNinja', 'Master', 'Monk', 'Monk2', 'Noble', 'OldMan', 'OldMan2', 'OldMan3', 'OldWoman', 'Princess', 'RedNinja', 'RedNinja2', 'RedSamurai', 'Samurai', 'Skeleton', 'Villager', 'Villager2', 'Villager3', 'Villager4', 'Woman', 'GiantRacoon', 'DemonCyclop', 'GiantSpirit'],
  mon: ['Beast', 'Snake', 'Snake2', 'Bamboo', 'Spirit', 'Spirit2', 'Skull', 'Racoon', 'Mole', 'Cyclope', 'Flam', 'Slime', 'Eye', 'Butterfly', 'Owl', 'Lizard'],
  boss: ['GiantRacoonIdle', 'GiantRacoonAttack', 'DemonCyclopIdle', 'DemonCyclopHit', 'GiantSpiritIdle'],
  fx: ['slash', 'curve', 'double', 'double2', 'circle', 'cut', 'claw', 'smoke', 'flam', 'thunder', 'rock', 'spark', 'spirit', 'spiritb', 'aura', 'aurap', 'ring', 'ringw', 'shieldy', 'shieldb', 'p_arrow', 'p_kunai', 'p_shuriken', 'p_energy', 'p_fire', 'p_bigenergy', 'p_ice', 'leafpink', 'leaf', 'snow', 'psprk'],
  wpn: ['Sword', 'Katana', 'BigSword', 'Lance', 'Lance2', 'Stick', 'Sai', 'Axe', 'Club', 'Ninjaku', 'Rapier', 'Sword_icon', 'Katana_icon', 'BigSword_icon', 'Lance_icon', 'Lance2_icon', 'Stick_icon', 'Sai_icon', 'Axe_icon', 'Club_icon', 'Ninjaku_icon', 'Rapier_icon'],
  items: ['hp', 'mp', 'scroll', 'letter', 'silver', 'gold', 'key', 'chest'],
};
export async function loadAll(onp) {
  const list = [];
  for (const [d, ns] of Object.entries(IMAGES)) for (const n of ns) list.push([d + '/' + n, `assets/${d}/${n}.png`]);
  let done = 0;
  await Promise.all(list.map(([k, url]) => new Promise(res => {
    const im = new Image();
    im.onload = () => { IMG[k] = im; onp && onp(++done / list.length); res(); };
    im.onerror = () => { console.warn('그림 없음', url); done++; res(); };
    im.src = url;
  })));
}
// 나중에 일러스트를 넣으면 쓰는 자리. 파일이 없으면 얼굴 그림으로 대체한다.
export const ART = new Map();
export async function loadArtList() {
  try {
    const r = await fetch('assets/art/list.json'); if (!r.ok) return;
    const l = await r.json();
    await Promise.all(l.map(n => new Promise(res => { const im = new Image(); im.onload = () => { ART.set(n, im); res(); }; im.onerror = res; im.src = `assets/art/${n}.png`; })));
  } catch (e) { /* 일러스트가 아직 없으면 그대로 진행 */ }
}

// ── 소리 ─────────────────────────────
export const Sound = {
  ctx: null, buf: {}, cur: null, curName: '', bgmVol: .5, sfxVol: .7, muted: false,
  init() {
    if (this.ctx) return;
    try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); this.gain = this.ctx.createGain(); this.gain.gain.value = this.sfxVol; this.gain.connect(this.ctx.destination); } catch (e) { return; }
    for (const n of ['hit', 'hit1', 'hit2', 'hit3', 'hit4', 'mini', 'sword', 'sword2', 'kill', 'jump', 'fx', 'magic1', 'magic2', 'magic3', 'power1', 'power2', 'boom', 'boom2', 'fireball', 'spirit', 'strange', 'bonus', 'coin', 'ok1', 'ok2', 'ok3', 'over', 'secret', 'alert', 'accept', 'cancel', 'tick', 'select', 'text'])
      fetch(`assets/audio/sfx/${n}.mp3`).then(r => r.arrayBuffer()).then(b => this.ctx.decodeAudioData(b)).then(d => { this.buf[n] = d; }).catch(() => { });
  },
  sfx(n, vol = 1) {
    if (this.muted || !this.ctx || !this.buf[n]) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();
    const s = this.ctx.createBufferSource(); s.buffer = this.buf[n];
    const g = this.ctx.createGain(); g.gain.value = vol; s.connect(g); g.connect(this.gain); s.start();
  },
  bgm(n) {
    if (n === this.curName) return;
    this.curName = n;
    const old = this.cur;
    if (old) { let v = old.volume; const t = setInterval(() => { v -= .06; if (v <= 0) { clearInterval(t); old.pause(); } else old.volume = v; }, 40); }
    if (!n) { this.cur = null; return; }
    const a = new window.Audio(`assets/audio/bgm/${n}.mp3`); a.loop = true; a.volume = this.muted ? 0 : this.bgmVol;
    this.cur = a; a.play().catch(() => { });
  },
  resume() { if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume(); if (this.cur && this.cur.paused) this.cur.play().catch(() => { }); },
  setMuted(m) { this.muted = m; if (this.cur) this.cur.volume = m ? 0 : this.bgmVol; },
};

// ── 입력 ─────────────────────────────
const KEYMAP = {
  KeyW: ['up'], ArrowUp: ['up'], KeyS: ['down'], ArrowDown: ['down'], KeyA: ['left'], ArrowLeft: ['left'], KeyD: ['right'], ArrowRight: ['right'],
  KeyJ: ['atk'], KeyZ: ['atk'], KeyK: ['dash'], KeyX: ['dash'], Space: ['ok', 'dash'], KeyL: ['guard'], KeyC: ['guard'], ShiftLeft: ['guard'],
  KeyU: ['s0'], KeyI: ['s1'], KeyO: ['s2'], KeyP: ['s3'], Digit1: ['s0'], Digit2: ['s1'], Digit3: ['s2'], Digit4: ['s3'],
  KeyH: ['potion'], KeyQ: ['potion'], KeyE: ['ok'], Enter: ['ok'], Escape: ['menu'], KeyM: ['menu'],
};
export const Input = {
  down: {}, buf: {}, axis: { x: 0, y: 0 }, stick: { x: 0, y: 0 },
  press(a) { this.down[a] = true; this.buf[a] = .16; },
  release(a) { this.down[a] = false; },
  take(a) { if (this.buf[a] > 0) { this.buf[a] = 0; return true; } return false; },
  tick(dt) { for (const k in this.buf) if (this.buf[k] > 0) this.buf[k] -= dt; },
  clear() { this.down = {}; this.buf = {}; this.stick = { x: 0, y: 0 }; },
  dir() {
    let x = (this.down.right ? 1 : 0) - (this.down.left ? 1 : 0) + this.stick.x, y = (this.down.down ? 1 : 0) - (this.down.up ? 1 : 0) + this.stick.y;
    const l = hyp(x, y); if (l > 1) { x /= l; y /= l; }
    return { x, y };
  },
  init() {
    addEventListener('keydown', e => {
      Sound.init(); Sound.resume();
      if (document.activeElement && document.activeElement.tagName === 'INPUT') return;
      if (G.scene === 'title') return;
      const m = KEYMAP[e.code]; if (!m) return;
      e.preventDefault();
      if (e.repeat) return;
      m.forEach(a => this.press(a));
    });
    addEventListener('keyup', e => { const m = KEYMAP[e.code]; if (m) m.forEach(a => this.release(a)); });
    addEventListener('blur', () => this.clear());
    addEventListener('pointerdown', () => { Sound.init(); Sound.resume(); });
  },
};

// ── 그리기 도우미 ─────────────────────
const DIRROW = { down: 0, up: 1, left: 2, right: 3 };
export function drawFrame(ctx, img, sx, sy, sw, sh, x, y, w = sw, h = sh) { if (img) ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h); }
export const snap = v => Math.round(v * SCALE) / SCALE;
// 스프라이트 시트: 열은 방향(아래, 위, 왼쪽, 오른쪽), 행은 걷기 네 칸 + 공격 + 점프 + 특수
export function drawActorSprite(ctx, key, dirCol, row, x, y, opt = {}) {
  const img = IMG[key]; if (!img) return;
  const r = Math.min(row, Math.floor(img.height / 16) - 1);
  ctx.save();
  if (opt.alpha !== undefined) ctx.globalAlpha = opt.alpha;
  ctx.drawImage(img, dirCol * 16, r * 16, 16, 16, snap(x - 8), snap(y - 15), 16, 16);
  ctx.restore();
}
export function drawShadow(ctx, x, y, s = 1) { const im = IMG['chars/_Shadow']; if (im) ctx.drawImage(im, snap(x - 6 * s), snap(y - 3 * s), 12 * s, 7 * s); }
// 흰색으로 번쩍이는 효과를 위한 캐시
const whiteCache = {};
export function whiteOf(key) {
  if (whiteCache[key]) return whiteCache[key];
  const im = IMG[key]; if (!im) return null;
  const c = document.createElement('canvas'); c.width = im.width; c.height = im.height;
  const x = c.getContext('2d'); x.drawImage(im, 0, 0); x.globalCompositeOperation = 'source-in'; x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height);
  return whiteCache[key] = c;
}
export function toast(msg, s = 2.2) {
  const t = $('#toast'); t.textContent = msg; t.classList.add('on');
  clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove('on'), s * 1000);
}
export function fadeTo(v) { $('#fade').style.opacity = v; return wait(.3); }
