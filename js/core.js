// 공용 도구: 수학, 그림과 소리 불러오기, 입력
// 받침을 보고 조사를 고른다. josa('철검', '을/를') -> 철검을, josa('집', '으로/로') -> 집으로
export const hasJong = w => { const c = String(w).charCodeAt(String(w).length - 1); return c >= 0xAC00 && c <= 0xD7A3 && (c - 0xAC00) % 28 > 0; };
export const josa = (w, pair) => { const [a, b] = pair.split('/'), c = String(w).charCodeAt(String(w).length - 1); if (a === '으로' && c >= 0xAC00 && (c - 0xAC00) % 28 === 8) return w + b; return w + (hasJong(w) ? a : b); };
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
  chars: ['_Shadow', 'Hyeok', 'Samaung', 'BlueNinja', 'BlueSamurai', 'Boy', 'Cavegirl', 'Cavegirl2', 'EskimoNinja', 'Caveman', 'Caveman2', 'Child', 'DarkNinja', 'EggBoy', 'EggGirl', 'GoldKnight', 'GrayNinja', 'GreenNinja', 'Greenman', 'Inspector', 'Knight', 'Lion', 'MaskFrog', 'MaskedNinja', 'Master', 'Monk', 'Monk2', 'Noble', 'OldMan', 'OldMan2', 'OldMan3', 'OldWoman', 'Princess', 'RedNinja', 'RedNinja2', 'RedSamurai', 'Samurai', 'Skeleton', 'Villager', 'Villager2', 'Villager3', 'Villager4', 'Woman', 'Eskimo', 'Greenman', 'Namgung', 'Moyong', 'Jegal', 'Dang', 'Paeng', 'Hwasan', 'Gaebang', 'Sodi'],
  faces: ['Hyeok', 'Samaung', 'BlueNinja', 'BlueSamurai', 'Boy', 'Cavegirl', 'Cavegirl2', 'EskimoNinja', 'Caveman', 'Caveman2', 'Child', 'DarkNinja', 'EggBoy', 'EggGirl', 'GoldKnight', 'GrayNinja', 'GreenNinja', 'Inspector', 'Knight', 'Lion', 'MaskFrog', 'MaskedNinja', 'Master', 'Monk', 'Monk2', 'Noble', 'OldMan', 'OldMan2', 'OldMan3', 'OldWoman', 'Princess', 'RedNinja', 'RedNinja2', 'RedSamurai', 'Samurai', 'Skeleton', 'Villager', 'Villager2', 'Villager3', 'Villager4', 'Woman', 'GiantRacoon', 'DemonCyclop', 'GiantSpirit', 'Eskimo', 'Greenman', 'Namgung', 'Moyong', 'Jegal', 'Dang', 'Paeng', 'Hwasan', 'Gaebang', 'Sodi'],
  mon: ['Beast', 'Snake', 'Snake2', 'Bamboo', 'Spirit', 'Spirit2', 'Skull', 'Racoon', 'Mole', 'Cyclope', 'Flam', 'Slime', 'Eye', 'Butterfly', 'Owl', 'Lizard'],
  boss: ['GiantRacoonIdle', 'GiantRacoonAttack', 'DemonCyclopIdle', 'DemonCyclopHit', 'GiantSpiritIdle'],
  fx: ['slash', 'curve', 'double', 'double2', 'circle', 'cut', 'claw', 'smoke', 'flam', 'thunder', 'rock', 'spark', 'spirit', 'spiritb', 'aura', 'aurap', 'ring', 'ringw', 'shieldy', 'shieldb', 'p_arrow', 'p_kunai', 'p_shuriken', 'p_energy', 'p_fire', 'p_bigenergy', 'p_ice', 'leafpink', 'leaf', 'snow', 'psprk'],
  wpn: ['Sword', 'Katana', 'BigSword', 'Lance', 'Lance2', 'Stick', 'Sai', 'Axe', 'Club', 'Ninjaku', 'Rapier', 'Sword_icon', 'Katana_icon', 'BigSword_icon', 'Lance_icon', 'Lance2_icon', 'Stick_icon', 'Sai_icon', 'Bow_icon', 'Rod_icon', 'Axe_icon', 'Club_icon', 'Ninjaku_icon', 'Rapier_icon'],
  items: ['hp', 'mp', 'scroll', 'letter', 'silver', 'gold', 'key', 'chest', 'Beaf', 'Fish', 'Honey', 'Noodle', 'Nut', 'Onigiri', 'Shrimp', 'Sushi', 'TeaLeaf', 'Yakitori', 'SeedBig1', 'SeedBig2', 'SeedBig3', 'SeedLarge', 'SeedLargeWhite', 'Octopus', 'Calamari', 'Stamp', 'Letter2', 'GoldCup', 'SilverCup', 'SilverKey', 'Hear', 'MilkPot', 'EmptyPot', 'Medipack'],
  ani: ['pheasant', 'piglet', 'deer', 'rabbit', 'badger'],
};
export async function loadAll(onp) {
  const list = [];
  // 다시 그린 도트는 assets/hd에 있다. 있으면 기본 그림 대신 쓴다. 칸 크기가 두 배다
  let hd = []; try { const r = await fetch('assets/hd/list.json'); if (r.ok) hd = await r.json(); } catch (e) { /* 없으면 기본 그림 */ }
  for (const [d, ns] of Object.entries(IMAGES)) for (const n of ns) if (!hd.includes(d + '/' + n)) list.push([d + '/' + n, `assets/${d}/${n}.png`]);
  for (const k of hd) list.push([k, `assets/hd/${k}.webp`, 2]);
  let done = 0;
  await Promise.all(list.map(([k, url, h]) => new Promise(res => {
    const im = new Image();
    im.onload = () => { if (h) im.hd = h; IMG[k] = im; onp && onp(++done / list.length); res(); };
    im.onerror = () => { console.warn('그림 없음', url); done++; res(); };
    im.src = url;
  })));
}
// 나중에 일러스트를 넣으면 쓰는 자리. 파일이 없으면 얼굴 그림으로 대체한다.
export const ART = new Map();
export async function loadArtList() {
  try {
    const r = await fetch('assets/art/list.json'); if (!r.ok) return;
    const l = await r.json(); l.sort((a, b) => (b === 'cg_title') - (a === 'cg_title'));  // 제목 화면 그림부터 받는다
    await Promise.all(l.map(n => new Promise(res => { const im = new Image(); im.onload = () => { ART.set(n, im); res(); }; im.onerror = res; im.src = `assets/art/${n}.webp`; })));
  } catch (e) { /* 일러스트가 아직 없으면 그대로 진행 */ }
}

// ── 소리 ─────────────────────────────
const AUDIO_KEY = 'gangho_audio';
const audioPrefs = (() => { try { return JSON.parse(localStorage.getItem(AUDIO_KEY)) || {}; } catch (e) { return {}; } })();
export const Sound = {
  ctx: null, buf: {}, cur: null, curName: '', bgmVol: audioPrefs.bgm ?? .2, sfxVol: audioPrefs.sfx ?? .3, muted: !!audioPrefs.muted,
  keep() { try { localStorage.setItem(AUDIO_KEY, JSON.stringify({ bgm: this.bgmVol, sfx: this.sfxVol, muted: this.muted })); } catch (e) { /* 저장이 막혀 있어도 소리는 그대로 */ } },
  setBgm(v) { this.bgmVol = v; if (this.cur && !this.muted) this.cur.volume = v; this.keep(); },
  setSfx(v) { this.sfxVol = v; if (this.gain) this.gain.gain.value = v; this.keep(); },
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
  setMuted(m) { this.muted = m; if (this.cur) this.cur.volume = m ? 0 : this.bgmVol; this.keep(); },
};

// ── 입력 ─────────────────────────────
// 조작 키. 메뉴 설정에서 바꿀 수 있다. Enter와 Esc는 언제나 확인과 메뉴다
export const KEY_ACTIONS = [['up', '위로', 'all'], ['down', '아래로', 'all'], ['left', '왼쪽', 'all'], ['right', '오른쪽', 'all'], ['atk', '평타', 'fight'], ['dash', '경공', 'fight'], ['guard', '막기', 'fight'], ['s0', '초식 1', 'fight'], ['s1', '초식 2', 'fight'], ['s2', '초식 3', 'fight'], ['s3', '초식 4', 'fight'], ['potion', '금창약', 'fight'], ['ok', '대화·확인', 'field'], ['opt', '메뉴', 'field'], ['map', '지도', 'field'], ['decor', '집 꾸미기', 'field']];
export const KEY_PRESETS = {
  기본: { up: ['KeyW', 'ArrowUp'], down: ['KeyS', 'ArrowDown'], left: ['KeyA', 'ArrowLeft'], right: ['KeyD', 'ArrowRight'], atk: ['KeyJ', 'KeyZ'], dash: ['KeyK', 'Space'], guard: ['KeyL', 'ShiftLeft'], s0: ['KeyU', 'Digit1'], s1: ['KeyI', 'Digit2'], s2: ['KeyO', 'Digit3'], s3: ['KeyP', 'Digit4'], potion: ['KeyH', 'KeyQ'], ok: ['KeyE', 'Space'], opt: ['KeyO', 'Tab'], map: ['KeyM', ''], decor: ['KeyB', ''] },
  '방향키 + 왼손': { up: ['ArrowUp', ''], down: ['ArrowDown', ''], left: ['ArrowLeft', ''], right: ['ArrowRight', ''], atk: ['KeyZ', ''], dash: ['KeyX', ''], guard: ['KeyC', ''], s0: ['KeyA', ''], s1: ['KeyS', ''], s2: ['KeyD', ''], s3: ['KeyF', ''], potion: ['KeyV', ''], ok: ['KeyZ', 'Space'], opt: ['KeyQ', 'Tab'], map: ['KeyW', ''], decor: ['KeyE', ''] },
  '마우스 + WASD': { up: ['KeyW', ''], down: ['KeyS', ''], left: ['KeyA', ''], right: ['KeyD', ''], atk: ['Mouse0', ''], dash: ['Space', ''], guard: ['Mouse2', 'ShiftLeft'], s0: ['Digit1', 'KeyQ'], s1: ['Digit2', 'KeyE'], s2: ['Digit3', 'KeyR'], s3: ['Digit4', 'KeyF'], potion: ['KeyC', ''], ok: ['KeyE', 'Space'], opt: ['Tab', 'KeyI'], map: ['KeyM', ''], decor: ['KeyB', ''] },
  '숫자 초식': { up: ['KeyW', 'ArrowUp'], down: ['KeyS', 'ArrowDown'], left: ['KeyA', 'ArrowLeft'], right: ['KeyD', 'ArrowRight'], atk: ['KeyJ', ''], dash: ['KeyK', 'Space'], guard: ['KeyL', ''], s0: ['Digit1', ''], s1: ['Digit2', ''], s2: ['Digit3', ''], s3: ['Digit4', ''], potion: ['KeyH', ''], ok: ['KeyE', 'Space'], opt: ['KeyO', 'Tab'], map: ['KeyM', ''], decor: ['KeyB', ''] },
};
const KEYSAVE = 'gangho_keys';
export const Keys = {
  map: null, code: {},
  load() { let v = null; try { v = JSON.parse(localStorage.getItem(KEYSAVE) || 'null'); } catch { } this.map = { ...KEY_PRESETS.기본, ...(v || {}) }; this.build(); },
  save() { try { localStorage.setItem(KEYSAVE, JSON.stringify(this.map)); } catch { } this.build(); },
  build() { this.code = { Enter: ['ok'], Escape: ['menu'] }; for (const a in this.map) for (const c of this.map[a]) if (c) (this.code[c] = this.code[c] || []).push(a); },
  use(name) { this.map = JSON.parse(JSON.stringify(KEY_PRESETS[name])); this.save(); },
  // 같은 상황에서 겹치는 키는 원래 자리에서 빼고 새 자리로 옮긴다. 전투 키와 필드 키는 겹쳐도 된다
  set(act, slot, code) { const ctx = KEY_ACTIONS.find(k => k[0] === act)[2]; for (const [a, , c] of KEY_ACTIONS) if (a !== act && (c === ctx || c === 'all' || ctx === 'all')) this.map[a] = this.map[a].map(v => v === code ? '' : v); this.map[act] = [...this.map[act]]; if (this.map[act][1 - slot] === code) this.map[act][1 - slot] = ''; this.map[act][slot] = code; this.save(); },
  is(act, code) { return (this.map[act] || []).includes(code) || (act === 'ok' && code === 'Enter'); },
  name(code) { if (!code) return '없음'; const M = { Space: 'Space', ShiftLeft: '왼Shift', ShiftRight: '오른Shift', ControlLeft: '왼Ctrl', ControlRight: '오른Ctrl', AltLeft: '왼Alt', AltRight: '오른Alt', Tab: 'Tab', ArrowUp: '↑', ArrowDown: '↓', ArrowLeft: '←', ArrowRight: '→', Mouse0: '왼클릭', Mouse1: '휠클릭', Mouse2: '오른클릭', Semicolon: ';', Quote: "'", Comma: ',', Period: '.', Slash: '/', BracketLeft: '[', BracketRight: ']', Backquote: '`', Minus: '-', Equal: '=', Backslash: '\\', CapsLock: 'Caps' }; return M[code] || code.replace(/^Key/, '').replace(/^Digit/, '').replace(/^Numpad/, '숫자패드'); },
  label(act) { return this.name((this.map[act] || []).find(Boolean) || ''); },
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
    Keys.load();
    addEventListener('keydown', e => {
      Sound.init(); Sound.resume();
      if (document.activeElement && document.activeElement.tagName === 'INPUT') return;
      if (G.scene === 'title') return;
      const m = Keys.code[e.code]; if (!m) return;
      e.preventDefault();
      if (e.repeat) return;
      m.forEach(a => this.press(a));
    });
    addEventListener('keyup', e => { const m = Keys.code[e.code]; if (m) m.forEach(a => this.release(a)); });
    // 마우스 버튼도 키처럼 쓴다. 화면 단추나 메뉴를 누를 때는 건드리지 않는다
    const onCanvas = e => !G.menuOpen && !G.keyWait && !e.target?.closest?.('button,input,a,#modal,.menu');
    addEventListener('mousedown', e => { if (!onCanvas(e)) return; const m = Keys.code['Mouse' + e.button]; if (m) { e.preventDefault(); m.forEach(a => this.press(a)); } });
    addEventListener('mouseup', e => { const m = Keys.code['Mouse' + e.button]; if (m) m.forEach(a => this.release(a)); });
    addEventListener('contextmenu', e => { if (onCanvas(e) && Keys.code.Mouse2) e.preventDefault(); });
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
  const f = 16 * (img.hd || 1), r = Math.min(row, Math.floor(img.height / f) - 1);
  ctx.save();
  if (opt.alpha !== undefined) ctx.globalAlpha = opt.alpha;
  // 대각선 시트가 있으면 쓴다: 0 오른쪽 아래, 1 오른쪽 위, 2 왼쪽 아래, 3 왼쪽 위
  const dg = opt.diag !== undefined && IMG[key + '_d'];
  if (dg) { const k = 16 * (dg.hd || 1), left = opt.diag > 1, sx = (opt.diag % 2) * k, sy = Math.min(row, 3) * k; if (left) { ctx.translate(snap(x), 0); ctx.scale(-1, 1); ctx.drawImage(dg, sx, sy, k, k, -8, snap(y - 15), 16, 16); } else ctx.drawImage(dg, sx, sy, k, k, snap(x - 8), snap(y - 15), 16, 16); ctx.restore(); return; }
  ctx.drawImage(img, dirCol * f, r * f, f, f, snap(x - 8), snap(y - 15), 16, 16);
  ctx.restore();
}
export function drawShadow(ctx, x, y, s = 1) { const im = IMG['chars/_Shadow']; if (im) ctx.drawImage(im, snap(x - 6 * s), snap(y - 3 * s), 12 * s, 7 * s); }
// 흰색으로 번쩍이는 효과를 위한 캐시
const whiteCache = {};
export function whiteOf(key) {
  if (whiteCache[key]) return whiteCache[key];
  const im = IMG[key]; if (!im) return null;
  const c = document.createElement('canvas'); c.width = im.width; c.height = im.height; c.hd = im.hd;
  const x = c.getContext('2d'); x.drawImage(im, 0, 0); x.globalCompositeOperation = 'source-in'; x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height);
  return whiteCache[key] = c;
}
export function toast(msg, s = 2.2) {
  const t = $('#toast'); t.textContent = msg; t.classList.add('on');
  clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove('on'), s * 1000);
}
export function fadeTo(v) { $('#fade').style.opacity = v; return wait(.3); }
