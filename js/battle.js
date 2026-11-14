// 직접 조작 전투
import { G, IMG, Input, Sound, $, $$, el, esc, STEP, VW, VH, SCALE, TS, clamp, lerp, rnd, rint, pick, hyp, snap, drawActorSprite, drawShadow, whiteOf, wait, qSheet, QZ } from './core.js';
import { Keys } from './core.js';
import { stageClear } from './dialog.js';
import { SKILLS, BASIC, WEAPONS } from './data.js';
import { MOVES, FOES } from './foes.js';
import { arena, ARENA_W, ARENA_H, drawStamp, STAMPS } from './tiles.js';
import { stats, bonus, masteryLv, canEquip, DIFF, gainExp, save, give } from './state.js';
import { DB } from './items.js';
import { openMenu } from './ui.js';

const PARRY = .17, D2R = Math.PI / 180;
const FX = { slash: [32, 32, 4], curve: [32, 32, 4], double: [32, 32, 4], double2: [32, 32, 4], circle: [32, 32, 4], cut: [32, 32, 5], claw: [32, 32, 4], smoke: [32, 32, 6], flam: [32, 32, 5], thunder: [40, 28, 4], rock: [30, 30, 14], spark: [32, 32, 5], spirit: [32, 32, 5], spiritb: [32, 32, 5], aura: [32, 32, 4], aurap: [32, 32, 4], ring: [32, 32, 4], ringw: [32, 32, 4], shieldy: [24, 26, 6], shieldb: [24, 26, 6] };
const PJ = { p_arrow: [13, 5, 1], p_kunai: [14, 5, 1], p_shuriken: [16, 16, 2], p_energy: [16, 16, 4], p_fire: [16, 16, 4], p_bigenergy: [24, 24, 4] };

// 대각선으로 움직일 때는 옆모습이 먼저다. 그래야 어느 쪽으로 가는지 보인다
function faceOf(x, y) { return Math.abs(x) >= Math.abs(y) * .55 ? (x < 0 ? 2 : 3) : (y < 0 ? 1 : 0); }

class Actor {
  constructor(o) {
    Object.assign(this, { x: 0, y: 0, vx: 0, vy: 0, ax: 1, ay: 0, face: 0, r: 6, team: 1, st: 'idle', stT: 0, sk: null, skT: 0, skI: 0, mv: null, cd: {}, dashCd: 0, iframe: 0, armor: 0, flash: 0, walk: 0, combo: 0, comboT: 0, queued: false, atkCd: .8, buffs: {}, dots: [], z: 0, guardT: 0, ghostT: 0, counter: 0, hpLag: 1, poise: 0, maxPoise: 0, slowT: 0, slowF: 1, ghosts: [], swing: null, aiT: 0, guardAI: 0, strafe: Math.random() < .5 ? 1 : -1, mp: 0, maxMp: 0, regen: 0, dead: false, deadT: 0 }, o);
    this.hp = this.hp ?? this.maxHp;
  }
  get busy() { return this.st === 'skill' || this.st === 'dash' || this.st === 'stun' || this.dead; }
}

export class Battle {
  constructor(cfg) {
    this.cfg = cfg; this.t = 0; this.actors = []; this.fx = []; this.proj = []; this.zones = []; this.nums = []; this.teles = []; this.parts = [];
    this.stop = 0; this.shakeT = 0; this.shakeA = 0; this.ended = false; this.endT = 0; this.outcome = null; this.cam = { x: 0, y: 0 }; this.pending = []; this.cut = null; this.introT = cfg.noIntro ? 0 : 1.05; this.spawnQ = [];
    this.W = ARENA_W * TS; this.H = ARENA_H * TS; this.bg = arena(cfg.arena || 'village'); this.top = cfg.arena === 'room' ? 18 : 22; this.floorB = this.H - 12; this.left = 10; this.right = this.W - 10;
    const S = G.S, st = stats(S); this.st = st; this.b = bonus(S);
    const p = new Actor({ id: 'player', team: 0, name: S.name, spr: 'chars/' + S.look, isPlayer: true, x: this.W / 2, y: this.H * .68, maxHp: st.maxHp, hp: st.maxHp, maxMp: st.maxMp, mp: st.maxMp * .7, regen: st.regen, atk: st.atk, def: st.def, spd: st.spd, crit: st.crit, ax: 0, ay: -1, face: 1 });
    p.wpn = WEAPONS[S.weapon].spr; this.actors.push(p); this.p = p;
    (cfg.allies || []).forEach((id, i, l) => this.spawn(id, 0, this.W / 2 + (i - (l.length - 1) / 2) * 34 + (l.length % 2 ? 20 : 0), this.H * .74 + (i % 2) * 10));
    const list = cfg.foes; list.forEach((id, i) => { const n = list.length, ox = (i - (n - 1) / 2) * 38; this.spawn(id, 1, this.W / 2 + ox, this.H * .3 + (i % 2) * 14); });
    this.camera(1);
    this.buildHud();
  }
  spawn(id, team, x, y) {
    const f = FOES[id], d = DIFF[G.S.diff] || DIFF.normal, enemy = team === 1;
    const hp = Math.round(f.hp * (enemy ? d.foeHp * (this.cfg.foeHpMul || 1) : 1)), atk = f.atk * (enemy ? d.foeAtk : 1);
    const a = new Actor({ id, def_: f, team, name: f.name, spr: f.spr, x, y, maxHp: hp, hp, atk, def: f.def, spd: f.spd, crit: .02, boss: f.boss, elite: f.elite, mon: f.mon, big: f.big, r: f.r || 6, scale: f.scale || 1, wpn: f.wpn, moves: f.moves.slice(), pause: f.pause, poise: f.poise || 0, maxPoise: f.poise || 0, phase: 0, ax: 0, ay: 1, face: 0, dummy: f.dummy, atkCd: rnd(.6, 1.3) });
    if (team === 0) { a.hp = a.maxHp = hp * 1.4; a.atk = atk * .7; }
    this.actors.push(a); return a;
  }
  foes(a) { return this.actors.filter(o => o.team !== a.team && !o.dead); }
  near(a, r = 1e9, cone = null) {
    let best = null, bd = r;
    for (const o of this.foes(a)) { const dx = o.x - a.x, dy = o.y - a.y, d = hyp(dx, dy); if (d >= bd) continue; if (cone && (dx * cone.x + dy * cone.y) / (d || 1) < cone.c) continue; best = o; bd = d; }
    return best;
  }
  // ── 진행 ──
  update(dt) {
    Input.tick(dt); this.t += dt;
    if (this.tipEl && (this.tipT -= dt) <= 0) { this.tipEl.remove(); this.tipEl = null; }
    if (Input.take('menu') && !this.ended) { openMenu('skill'); return; }
    if (this.cut) { this.cut.t -= dt; if (this.cut.t <= 0) { this.cut.el.remove(); this.cut = null; } this.tickFx(dt); this.hud(); return; }
    if (this.introT > 0) { this.introT -= dt; if (this.introT <= 0 && this.vsEl) { this.vsEl.remove(); this.vsEl = null; } this.camera(.2); this.hud(); return; }
    if (this.stop > 0) { this.stop -= dt; this.tickFx(dt); this.hud(); return; }
    if (!this.ended) {
      const p = this.p;
      if (!p.dead) { if (G.bot) this.bot(p, dt); else this.control(p, dt); }
      for (const a of this.actors) if (a !== p && !a.dead && !a.dummy) this.ai(a, dt);
    }
    for (const a of this.actors) this.tickActor(a, dt);
    this.separate();
    this.tickProj(dt); this.tickZones(dt); this.tickFx(dt);
    for (const s of this.spawnQ) { const ang = rnd(6.28), a = this.spawn(s, 1, clamp(this.p.x + Math.cos(ang) * 90, 30, this.W - 30), clamp(this.p.y + Math.sin(ang) * 70, 40, this.H - 30)); this.addFx('smoke', a.x, a.y - 6, 1); }
    this.spawnQ = [];
    this.camera(.12); this.checkEnd(dt); this.hud();
  }
  checkEnd(dt) {
    if (this.ended) { this.endT += dt; if (this.endT > 1.05 && !this.resolved) { this.resolved = true; this.finish(); } return; }
    const c = this.cfg, p = this.p, foes = this.actors.filter(a => a.team === 1), alive = foes.filter(a => !a.dead);
    if (c.survive && this.t >= c.survive) return this.end('win');
    if (p.hp <= 0) return this.end(c.survive || c.loseOk ? 'win' : 'lose');
    const leads = foes.filter(a => a.boss); if (c.yieldAt && (leads.length ? leads : foes).some(f => f.hp / f.maxHp <= c.yieldAt)) { foes.forEach(f => { f.st = 'idle'; f.sk = null; f.yielded = true; }); return this.end('win'); }
    if (!alive.length || (c.foes.length === 1 && foes[0].dead)) return this.end('win');
  }
  end(o) {
    this.ended = true; this.outcome = o; this.stop = .3;
    Sound.sfx(o === 'win' ? 'ok2' : 'over');
    this.proj = []; this.zones = []; this.teles = [];
  }
  // ── 플레이어 입력 ──
  control(a, dt) {
    const I = Input, d = I.dir(), moving = d.x || d.y;
    if (moving && a.st !== 'skill' && a.st !== 'dash') { const l = hyp(d.x, d.y); a.ax = d.x / l; a.ay = d.y / l; a.face = faceOf(d.x, d.y); }
    if (I.buf.potion > 0 && !a.busy) { I.take('potion'); this.usePotion(a); }
    if (a.st === 'stun') return;
    const free = a.st === 'idle' || a.st === 'move' || a.st === 'guard';
    const canCancel = free || (a.st === 'skill' && a.sk && a.skT >= (a.sk.cancel ?? a.sk.dur));
    if (I.buf.dash > 0 && a.dashCd <= 0 && (canCancel || (a.st === 'skill' && a.sk.basic))) {
      I.take('dash'); this.dash(a, moving ? d : { x: a.ax, y: a.ay }); return;
    }
    if (canCancel || a.st === 'skill' && a.sk.basic && a.skT > .1) {
      for (let i = 0; i < 4; i++) if (I.buf['s' + i] > 0) {
        I.take('s' + i); const id = G.S.slots[i];
        if (id) this.trySkill(a, id, i);
        else this.say(a, '비어 있음', '#ccc');
        return;
      }
    }
    if (I.buf.atk > 0) {
      if (canCancel) { I.take('atk'); this.basic(a, d); return; }
    }
    if (I.down.guard && free) {
      if (a.st !== 'guard') { a.st = 'guard'; a.guardT = 0; }
      this.aim(a, d); a.guardT += dt; a.vx = d.x * a.spd * .3; a.vy = d.y * a.spd * .3; return;
    }
    if (a.st === 'guard') a.st = 'idle';
    if (free) { a.vx = d.x * a.spd; a.vy = d.y * a.spd; a.st = moving ? 'move' : 'idle'; }
  }
  // 시험용: 사람 대신 키를 누르는 간단한 플레이어
  bot(a, dt) {
    const T = this.near(a); if (!T) return;
    const dx = T.x - a.x, dy = T.y - a.y, d = hyp(dx, dy) || 1;
    if (!a.busy) { a.ax = dx / d; a.ay = dy / d; a.face = faceOf(dx, dy); }
    const danger = this.teles.find(t => t.owner.team === 1 && hyp(t.x - a.x, t.y - a.y) < 60 && t.left < .3);
    const skill = G.bot.skill ?? .5;
    if (danger && a.dashCd <= 0 && !a.busy && Math.random() < skill) { const s = Math.random() < .5 ? 1 : -1; this.dash(a, { x: -a.ay * s - a.ax * .5, y: a.ax * s - a.ay * .5 }); return; }
    if (a.busy) return;
    if (a.hp / a.maxHp < .4 && G.S.potion > 0) this.usePotion(a);
    for (let i = 0; i < 4; i++) { const id = G.S.slots[i]; if (id && (a.cd[i] || 0) <= 0 && a.mp >= SKILLS[id].mp && !SKILLS[id].self && d < 62 && Math.random() < (G.bot.skillUse ?? .08)) { this.trySkill(a, id, i); return; } }
    a.botWait = (a.botWait || 0) - dt; if (a.botWait > 0) { a.st = 'idle'; a.vx = a.vy = 0; return; } // 사람처럼 쉬어 가며 때리는 시험용 지연
    if (d < 24) { this.basic(a, { x: dx / d, y: dy / d }); if (G.bot.rest && a.combo === 0) a.botWait = G.bot.rest; return; }
    a.vx = dx / d * a.spd; a.vy = dy / d * a.spd; a.st = 'move';
  }
  aim(a, d) {
    let dx = a.ax, dy = a.ay;
    const moving = d && (d.x || d.y); if (moving) { const l = hyp(d.x, d.y); dx = d.x / l; dy = d.y / l; }
    const T = this.near(a, 96, moving ? { x: dx, y: dy, c: .35 } : null) || (moving ? null : this.near(a, 110));
    if (T) { const tx = T.x - a.x, ty = T.y - a.y, l = hyp(tx, ty) || 1; dx = tx / l; dy = ty / l; }
    a.ax = dx; a.ay = dy; a.face = faceOf(dx, dy);
  }
  basic(a, d) {
    const type = this.st.wtype, list = BASIC[type];
    if (a.comboT <= 0) a.combo = 0;
    this.aim(a, d);
    this.start(a, list[a.combo % list.length], 'basic'); a.vx = a.vy = 0;
    const last = a.combo === list.length - 1, b = this.b;
    a.skRate = 1 + (b.basicSpeed || 0) / 100;
    if (last && b.armorBasic) a.armor = Math.max(a.armor, .4);
    if (last && b.qi) this.shoot(a, { img: 'p_energy', speed: 190, mul: .7, life: .6, r: 6, pierce: true, stun: .2 }, list[a.combo]);
    a.combo = (a.combo + 1) % list.length; a.comboT = .6;
    a.basicHit = true;
  }
  trySkill(a, id, slot) {
    const k = SKILLS[id];
    if ((a.cd[slot] || 0) > 0) return this.say(a, '아직', '#ccc');
    if (!canEquip(id)) return this.say(a, '무기가 안 맞음', '#ccc');
    const cost = k.mp * (1 + (this.b.mpCost || 0) / 100);
    if (a.mp < cost) { Sound.sfx('cancel'); return this.say(a, '내력 부족', '#8fc0ff'); }
    a.mp -= cost; a.skRate = 1; a.cd[slot] = k.cd * this.st.cdMul * (masteryLv(id) >= 5 ? .85 : 1);
    this.aim(a, Input.dir()); a.vx = a.vy = 0;
    if (a.isPlayer) { G.S.mastery[id] = (G.S.mastery[id] || 0) + 1; }
    this.start(a, k, id);
  }
  usePotion(a) {
    if (G.S.potion <= 0) return this.say(a, '금창약 없음', '#ccc');
    G.S.potion--; const h = Math.round(a.maxHp * .35 * (1 + (this.b.potion || 0) / 100)); a.hp = Math.min(a.maxHp, a.hp + h); this.num(a.x, a.y - 16, '+' + h, '#7fe08a', 1); Sound.sfx('power1');
  }
  dash(a, d) {
    const l = hyp(d.x, d.y) || 1; const b = a.isPlayer ? this.b : {}; a.st = 'dash'; a.sk = null; a.stT = .17; a.iframe = Math.max(a.iframe, .2 + (b.dashInv || 0)); a.dashCd = .6 + (b.dashCd || 0);
    if (b.dashHit) a.rush = { mul: .8, kb: 16, stun: .25, seen: new Set() };
    a.vx = d.x / l * 225; a.vy = d.y / l * 225; a.ghostT = .17; Sound.sfx('jump', .7);
    a.face = faceOf(d.x, d.y); this.addFx('smoke', a.x, a.y - 2, .5);
  }
  // ── 초식 실행 ──
  start(a, sk, key) {
    a.st = 'skill'; a.sk = sk; a.skKey = key; a.skT = 0; a.skI = 0; a.vx = a.vy = 0; a.counter = 0; a.skSeq = (a.skSeq || 0) + 1;
    if (sk.steps && sk.teleToFoe) { const T = this.near(a); a.jumpTo = T ? { x: T.x, y: T.y } : null; }
    if (a.team === 1 && !sk.noTele) this.addTeles(a, sk);
  }
  addTeles(a, sk) {
    const slow = a.slowT > 0 ? 1 / a.slowF : 1;
    const to = sk.teleToFoe && a.jumpTo; const add = (step, h) => this.teles.push({ owner: a, skRef: sk, x: to ? to.x : a.x, y: to ? to.y : a.y, ax: a.ax, ay: a.ay, left: step.t * slow, tot: step.t * slow, shape: h.shape, r: h.r, a: h.a, len: h.len, w: h.w, off: h.off, ub: h.ub });
    if (sk.tele) return add(sk.steps[0], { ub: true, ...sk.tele });
    for (const s of sk.steps) { if (s.hit) add(s, s.hit); }
    const pr = sk.steps.find(s => s.proj); if (pr && !sk.steps.some(s => s.hit)) this.teles.push({ owner: a, skRef: sk, x: a.x, y: a.y, ax: a.ax, ay: a.ay, left: pr.t * slow, tot: pr.t * slow, shape: 'line', len: 46, w: 5 });
  }
  runStep(a, s) {
    const sk = a.sk, dmgBase = a.atk;
    if (s.sfx) Sound.sfx(s.sfx, .9);
    if (s.armor) a.armor = Math.max(a.armor, s.armor);
    if (s.iframe) a.iframe = Math.max(a.iframe, s.iframe);
    if (s.cut && a.isPlayer || s.cut && a.boss) this.cutin(sk.name);
    if (s.jump) { a.jumpT = s.jump; a.jumpD = s.jump; }
    if (s.move) { const dd = s.move.d; a.mv = { vx: a.ax * dd / s.move.dur, vy: a.ay * dd / s.move.dur, t: s.move.dur, ghost: s.move.ghost }; if (s.move.iframe) a.iframe = Math.max(a.iframe, s.move.dur + .06); if (s.move.ghost) a.ghostT = s.move.dur; }
    if (s.rush) { a.mv = { vx: a.ax * s.rush.d / s.rush.dur, vy: a.ay * s.rush.d / s.rush.dur, t: s.rush.dur, ghost: true }; a.rush = { ...s.rush, seen: new Set() }; a.ghostT = s.rush.dur; }
    if (s.blink) { const T = this.near(a); if (T) { const tl = hyp(T.ax, T.ay) || 1, b = s.blink.behind; a.x = clamp(T.x - T.ax / tl * b, this.left, this.right); a.y = clamp(T.y - T.ay / tl * b, this.top, this.floorB); const dx = T.x - a.x, dy = T.y - a.y, l = hyp(dx, dy) || 1; a.ax = dx / l; a.ay = dy / l; a.face = faceOf(dx, dy); a.iframe = Math.max(a.iframe, .2); if (s.blink.enemy) this.teles.push({ owner: a, skRef: sk, x: a.x, y: a.y, ax: a.ax, ay: a.ay, left: .28, tot: .28, shape: 'arc', r: 26, a: 90 }); } }
    if (s.fx) { const key = 'sk_' + sk.id; if (IMG['fx/' + key] && s === sk.steps.find(q => q.fx)) { FX[key] = FX[key] || [48, 48, 6]; this.stepFx(a, { ...s.fx, n: key }); } else this.stepFx(a, s.fx); }
    if (s.shake) this.shake(s.shake);
    if (s.hit) { this.swingFx(a, s.hit); this.melee(a, s.hit, sk); }
    if (s.proj) this.shoot(a, s.proj, sk);
    if (s.zone) this.zone(a, s.zone, sk);
    if (s.clearProj) this.proj = this.proj.filter(p => p.team === a.team);
    if (s.selfhurt) { const v = Math.round(a.maxHp * s.selfhurt); a.hp = Math.max(1, a.hp - v); this.num(a.x, a.y - 18, v, '#ff7a6a', .8); }
    if (s.heal) { const h = Math.round(a.maxHp * s.heal.hp); a.hp = Math.min(a.maxHp, a.hp + h); a.mp = Math.min(a.maxMp, a.mp + a.maxMp * s.heal.mp); this.num(a.x, a.y - 18, '+' + h, '#7fe08a', 1); }
    if (s.buff) { a.buffs[s.buff.id] = s.buff.dur; this.say(a, sk.name, '#ffd27a'); }
    if (s.counter) { a.counter = s.counter.dur; a.counterMul = s.counter.mul; a.counterAll = s.counter.all; a.counterName = sk.name; a.counterKey = a.skKey; }
    if (s.pull) for (const o of this.foes(a)) { const dx = a.x - o.x, dy = a.y - o.y, d = hyp(dx, dy) || 1; if (d < s.pull.r) { o.kx = dx / d * s.pull.f; o.ky = dy / d * s.pull.f; o.kT = .3; } }
    if (s.slowfoes) for (const o of this.foes(a)) { o.slowT = s.slowfoes.dur; o.slowF = s.slowfoes.f; }
    if (s.moonstrike) { const list = this.foes(a); if (list.length) { const T = list[(a.msI = (a.msI || 0) + 1) % list.length]; a.x = clamp(T.x + rnd(-12, 12), this.left, this.right); a.y = clamp(T.y + rnd(-10, 10), this.top, this.floorB); a.ghostT = .1; this.addFx('cut', T.x, T.y - 6, s.moonstrike.big ? 3 : 1.5, rnd(6.28)); this.applyHit(a, T, { mul: s.moonstrike.mul, kb: 16, stun: .5, ub: true }, sk); } }
    if (s.spawn) { const id = (a.def_.minion || s.spawn.id); for (let i = 0; i < s.spawn.n; i++) this.spawnQ.push(id); a.cd['spawn'] = a.cd['spawn'] || 0; }
  }
  stepFx(a, f) {
    if (f.at === 'self') return this.addFx(f.n, a.x, a.y - 6, f.s || 1);
    const off = f.off ?? 18, ang = Math.atan2(a.ay, a.ax);
    if (f.at === 'front') return this.addFx(f.n, a.x + a.ax * off, a.y + a.ay * off - 6, f.s || 1);
    this.addFx(f.n, a.x + a.ax * off, a.y + a.ay * off - 6, f.s || 1, ang, f.flip);
  }
  swingFx(a, h) { if (a.wpn) a.swing = { t: 0, dur: .13, from: h.shape === 'line' ? 0 : -1.2, to: h.shape === 'line' ? 0 : 1.2, thrust: h.shape === 'line' }; }
  // 근접 판정
  melee(a, h, sk) {
    const ca = Math.cos((h.a || 0) * D2R);
    if (a.isPlayer && sk && sk.basic && this.b.reach) { const q = 1 + this.b.reach / 100; h = { ...h, r: h.r && h.r * q, len: h.len && h.len * q }; }
    for (const o of this.foes(a)) {
      if (o.iframe > 0) continue;
      let x = o.x - a.x, y = (o.y - 3) - (a.y - 3), inside = false; const pad = o.r;
      if (h.shape === 'arc') { const d = hyp(x, y); inside = d < h.r + pad && (d < 7 || (x * a.ax + y * a.ay) / d > ca); }
      else if (h.shape === 'circle') { const cx = a.x + a.ax * (h.off || 0), cy = a.y + a.ay * (h.off || 0); inside = hyp(o.x - cx, o.y - cy) < h.r + pad; }
      else { const f = x * a.ax + y * a.ay, s = Math.abs(-x * a.ay + y * a.ax); inside = f > -(h.back || 4) - pad && f < h.len + pad && s < h.w / 2 + pad; }
      if (inside) this.applyHit(a, o, h, sk);
    }
  }
  shoot(a, p, sk) {
    const n = p.n || 1, base = Math.atan2(a.ay, a.ax);
    for (let i = 0; i < n; i++) {
      const an = base + (i - (n - 1) / 2) * (p.spread || 0) * D2R;
      this.proj.push({ ...p, x: a.x + Math.cos(an) * 8, y: a.y - 5 + Math.sin(an) * 8, vx: Math.cos(an) * p.speed, vy: Math.sin(an) * p.speed, an, owner: a, team: a.team, age: 0, seen: new Set(), sk });
    }
  }
  zone(a, z, sk) {
    const T = this.near(a); const n = z.n || 1;
    for (let i = 0; i < n; i++) {
      let x = a.x, y = a.y;
      if (z.at === 'ring') { const an = i / n * 6.283; x = clamp(a.x + Math.cos(an) * z.dist, 10, this.W - 10); y = clamp(a.y + Math.sin(an) * z.dist * .85, 20, this.H - 10); }
      if (z.at === 'target' && T) { x = clamp(T.x + (i ? rnd(-z.spread, z.spread) : 0), 10, this.W - 10); y = clamp(T.y + (i ? rnd(-z.spread, z.spread) : 0), 20, this.H - 10); }
      this.zones.push({ x, y, r: z.r, left: z.delay + (z.at === 'ring' ? 0 : i * .08), tot: z.delay + (z.at === 'ring' ? 0 : i * .08), h: { mul: z.mul, kb: z.kb ?? 40, stun: z.stun ?? .4, ub: z.ub, dot: z.dot, slow: z.slow, drain: z.drain, shock: z.shock }, owner: a, team: a.team, sk, fx: z.fx, fxS: z.at === 'ring' ? 1 : 0, sfx: z.sfx, player: z.player && a.team === 0 });
    }
  }
  // 피해 처리
  applyHit(src, o, h, sk, proj) {
    const isP = o.isPlayer, inv = src.isPlayer;
    if (o.def_ && o.def_.immune && !(o.exposed > 0)) { if (!(sk && sk.expose)) { if (!(o.immT > this.t)) { o.immT = this.t + .7; this.say(o, '닿지 않는다', '#d8c8a8'); Sound.sfx('mini', .6); } return; } }
    if (sk && sk.expose && o.def_ && o.def_.immune) { o.exposed = 5.5; this.say(o, '달빛이 벗겨졌다!', '#fff3c8'); this.shake(3); this.addFx('ringw', o.x, o.y - 8, 2.4); }
    const dx = o.x - src.x, dy = o.y - src.y, d = hyp(dx, dy) || 1, nx = dx / d, ny = dy / d;
    if (o.counter > 0 && (!h.ub || o.counterAll)) { // 낙화유수, 이화접목
      o.counter = 0; o.iframe = .4; const m = o.counterMul; this.addFx('double', src.x, src.y - 6, 1.6); this.say(o, (o.counterName || '반격') + '!', '#ffd27a'); this.stop = .08; Sound.sfx('sword2'); this.applyHit(o, src, { mul: m, kb: 60, stun: .7, ub: true }, o.sk); return;
    }
    const front = (-nx * o.ax + -ny * o.ay) > -.1 || proj;
    if (o.st === 'guard' && front && !h.ub) {
      const moon = o.buffs.moonlight > 0;
      if (o.guardT < PARRY + (isP ? (this.b.parry || 0) : 0) || moon) return this.parry(o, src, proj);
      const bd = this.calc(src, o, h, sk) * .22; o.hp -= bd; o.mp = Math.max(0, o.mp - bd * .4); this.num(o.x, o.y - 16, Math.round(bd), '#bbb', .8); Sound.sfx('mini', .8); this.addFx('spark', o.x + nx * -6, o.y - 6, .5);
      o.kx = nx * 40; o.ky = ny * 40; o.kT = .1;
      if (isP && o.mp <= 0) { o.st = 'stun'; o.stT = .7; this.say(o, '자세 무너짐', '#ff8f7a'); }
      return;
    }
    let dmg = this.calc(src, o, h, sk), crit = Math.random() < src.crit;
    if (crit) dmg *= 1.6 + (inv ? (this.b.critDmg || 0) / 100 : 0);
    if (o.buffs.diamond > 0) dmg *= .5;
    if (isP && G.S.heart === 'iron_shirt') dmg *= .9;
    if (src.isPlayer && G.S.heart === 'fury' && src.hp < src.maxHp * .5) dmg *= 1.25;
    if (o.stagger > 0) dmg *= 1.4;
    dmg = Math.max(1, Math.round(dmg)); o.hp -= dmg; o.flash = .1;
    this.num(o.x + rnd(-4, 4), o.y - 16, dmg, crit ? '#ffd23c' : isP ? '#ff7a6a' : '#fff', crit ? 1.35 : 1);
    this.addFx('spark', o.x - nx * 2, o.y - 7, .55);
    Sound.sfx(rint(0, 1) ? 'hit' : 'hit2', .8);
    if (src.isPlayer) {
      src.mp = Math.min(src.maxMp, src.mp + (sk && sk.basic ? 1.6 + (this.b.mpHit || 0) : .4));
      if (this.b.lifeHit) src.hp = Math.min(src.maxHp, src.hp + dmg * this.b.lifeHit / 100);
      if (this.b.venom && sk && sk.basic) o.dots.push({ dps: src.atk * .12, t: 2, n: 0 });
    }
    if (h.dot) o.dots.push({ dps: src.atk * h.dot.dps, t: h.dot.t, n: 0 });
    if (h.slow) { o.slowT = Math.max(o.slowT || 0, h.slow.dur); o.slowF = h.slow.f; }  // 한기·물살: 느려진다
    if (h.drain) src.hp = Math.min(src.maxHp, src.hp + dmg * h.drain);  // 흡기: 준 피해만큼 조금 돌아온다
    if (h.shock && !h.chain) { this.addFx('thunder', o.x, o.y - 12, 1.2); const n2 = this.foes(src).filter(q => q !== o && hyp(q.x - o.x, q.y - o.y) < 80).sort((a, b) => hyp(a.x - o.x, a.y - o.y) - hyp(b.x - o.x, b.y - o.y))[0]; if (n2) { this.addFx('thunder', n2.x, n2.y - 12, 1); this.applyHit(src, n2, { mul: (h.mul || 1) * .4, kb: 20, stun: .35, ub: true, chain: 1 }, sk); } }  // 뇌전: 벼락이 떨어지고 가까운 적 하나로 튄다
    // 경직과 밀림
    let stagger = true;
    if (o.armor > 0 || o.buffs.diamond > 0) stagger = false;
    if (o.maxPoise > 0) {
      o.poise -= (h.mul || 1) * 7 * (inv ? 1 + (this.b.poiseDmg || 0) / 100 : 0);
      if (o.poise > 0) stagger = false;
      else if (o.maxPoise < 9000) { o.poise = o.maxPoise; o.st = 'stun'; o.stT = 1.5; o.stagger = 1.5; o.sk = null; stagger = false; this.say(o, '자세 무너짐!', '#ffd23c'); this.shake(3); Sound.sfx('boom2'); this.teles = this.teles.filter(t => t.owner !== o); }
    }
    if (stagger) { o.st = 'stun'; o.stT = (h.stun || .25); o.sk = null; o.mv = null; o.rush = null; o.vx = o.vy = 0; o.kx = nx * (h.kb || 20) * 2.4; o.ky = ny * (h.kb || 20) * 2.4; o.kT = .16; this.teles = this.teles.filter(t => t.owner !== o); }
    this.stop = Math.max(this.stop, (h.mul || 1) > 2 ? .09 : .045);
    if (isP) { this.shake(2); o.iframe = Math.max(o.iframe, .3); }
    if ((h.mul || 1) >= 3) this.shake(3);
    if (o.hp <= 0) this.kill(o, src);
  }
  calc(src, o, h, sk) {
    let m = h.mul || 1;
    if (src.isPlayer) {
      const b = this.b;
      if (sk && !sk.basic) m *= this.st.power * (1 + (masteryLv(src.skKey) - 1) * .07) * (1 + ((b.skill || 0) + (sk.ult ? (b.ult || 0) : 0)) / 100);
      else m *= 1 + (b.basic || 0) / 100;
    }
    if (src.team === 1 && sk && sk.fromSkill) m *= .55;
    return src.atk * m * (60 / (60 + o.def)) * rnd(.93, 1.07);
  }
  parry(o, src, proj) {
    this.addFx('ringw', o.x, o.y - 7, 1.2); Sound.sfx('sword2'); Sound.sfx('power1', .5); this.stop = .12; this.shake(2);
    this.say(o, '튕겨내기!', '#ffe9a8'); o.iframe = .25;
    if (o.isPlayer) {
      if (G.arts && src?.skKey && src.st === 'skill') G.arts.parried(src.skKey);
      o.mp = Math.min(o.maxMp, o.mp + 8);
      if (G.S.heart === 'mercy') o.hp = Math.min(o.maxHp, o.hp + o.maxHp * .05);
      if (G.S.heart === 'moon_heart') for (const k in o.cd) o.cd[k] = Math.max(0, o.cd[k] - 2);
    }
    if (!proj && !src.dead) { src.st = 'stun'; src.stT = src.isPlayer ? .5 : src.boss ? .75 : 1; src.sk = null; src.mv = null; src.rush = null; src.vx = src.vy = 0; src.stagger = src.stT; this.teles = this.teles.filter(t => t.owner !== src); if (src.maxPoise) src.poise -= 26; }
  }
  kill(o, src) {
    o.dead = true; o.st = 'dead'; o.deadT = 0; o.sk = null; o.mv = null; o.rush = null; this.teles = this.teles.filter(t => t.owner !== o);
    Sound.sfx('kill'); if (o.boss) { this.shake(6); this.stop = .35; }
    if (src && src.isPlayer && this.b.killHeal) src.hp = Math.min(src.maxHp, src.hp + src.maxHp * this.b.killHeal / 100);
    if (o.team === 1) { this.addFx('smoke', o.x, o.y - 7, 1.2); }
  }
  // ── 매 틱 ──
  tickActor(a, dt0) {
    if (a.dead) { a.deadT += dt0; return; }
    const dt = dt0 * (a.slowT > 0 ? a.slowF : 1);
    if (a.slowT > 0) a.slowT -= dt0;
    if (a.exposed > 0) a.exposed -= dt0;
    a.iframe -= dt; a.armor -= dt; a.dashCd -= dt; a.comboT -= dt; a.flash -= dt; a.counter -= dt; a.ghostT -= dt; a.atkCd -= dt; a.stagger = Math.max(0, (a.stagger || 0) - dt);
    for (const k in a.cd) if (a.cd[k] > 0) a.cd[k] -= dt0;
    for (const k in a.buffs) if (a.buffs[k] > 0) a.buffs[k] -= dt0;
    if (a.isPlayer) a.mp = Math.min(a.maxMp, a.mp + a.regen * dt);
    if (a.maxPoise && a.st !== 'stun' && a.poise < a.maxPoise) a.poise = Math.min(a.maxPoise, a.poise + a.maxPoise * .03 * dt);
    a.hpLag = lerp(a.hpLag, a.hp / a.maxHp, .06);
    for (const d of a.dots) { d.t -= dt; d.n += dt; if (d.n >= .5) { d.n = 0; const v = Math.max(1, Math.round(d.dps * .5)); a.hp -= v; this.num(a.x, a.y - 16, v, '#b6e05c', .8); if (a.hp <= 0) { if (a.isPlayer) a.hp = 1; else this.kill(a, this.p); } } }
    a.dots = a.dots.filter(d => d.t > 0);
    if (a.jumpT > 0) { a.jumpT -= dt; const u = 1 - a.jumpT / a.jumpD; a.z = Math.sin(u * Math.PI) * 42; if (a.jumpTo) { a.x = lerp(a.x, a.jumpTo.x, .1); a.y = lerp(a.y, a.jumpTo.y, .1); } if (a.jumpT <= 0) a.z = 0; }
    if (a.swing) { a.swing.t += dt; if (a.swing.t >= a.swing.dur) a.swing = null; }
    if (a.ghostT > 0 && Math.floor(this.t * 60) % 2 === 0) a.ghosts.push({ x: a.x, y: a.y, t: .18, face: a.face });
    for (const g of a.ghosts) g.t -= dt0; a.ghosts = a.ghosts.filter(g => g.t > 0);
    switch (a.st) {
      case 'skill': {
        a.skT += dt * (a.sk.basic ? (a.skRate || 1) : 1);
        const steps = a.sk.steps;
        while (a.sk && a.skI < steps.length && steps[a.skI].t <= a.skT) this.runStep(a, steps[a.skI++]);
        if (a.st === 'skill' && a.sk && a.skT >= a.sk.dur) { a.sk = null; a.st = 'idle'; a.rush = null; }
        break;
      }
      case 'dash': a.stT -= dt; if (a.stT <= 0) { a.st = 'idle'; a.vx = a.vy = 0; a.rush = null; } break;
      case 'stun': a.stT -= dt; a.vx *= .8; a.vy *= .8; if (a.stT <= 0) a.st = 'idle'; break;
    }
    let vx = a.vx, vy = a.vy;
    if (a.mv) { vx = a.mv.vx; vy = a.mv.vy; a.mv.t -= dt; if (a.mv.t <= 0) a.mv = null; }
    if (a.kT > 0) { a.kT -= dt; vx += a.kx; vy += a.ky; }
    a.x = clamp(a.x + vx * dt, this.left, this.right); a.y = clamp(a.y + vy * dt, this.top, this.floorB);
    if ((a.st === 'move') || a.mv) a.walk += dt * (a.mon ? 7 : 9);
    if (a.rush) for (const o of this.foes(a)) if (!a.rush.seen.has(o) && o.iframe <= 0 && hyp(o.x - a.x, o.y - a.y) < o.r + a.r + 4) { a.rush.seen.add(o); this.applyHit(a, o, a.rush, a.sk); }
  }
  separate() {
    const L = this.actors.filter(a => !a.dead);
    for (let i = 0; i < L.length; i++) for (let j = i + 1; j < L.length; j++) {
      const a = L[i], b = L[j], d = hyp(b.x - a.x, b.y - a.y), m = a.r + b.r - 1;
      if (d < m && d > .01) { const px = (b.x - a.x) / d * (m - d) * .5, py = (b.y - a.y) / d * (m - d) * .5; if (!a.mv) { a.x -= px; a.y -= py; } if (!b.mv) { b.x += px; b.y += py; } }
    }
  }
  tickProj(dt) {
    for (const p of this.proj) {
      p.age += dt; p.x += p.vx * dt; p.y += p.vy * dt;
      if (p.ret && p.age > p.life * .5) { const o = p.owner, dx = o.x - p.x, dy = o.y - 6 - p.y, d = hyp(dx, dy) || 1; p.vx = lerp(p.vx, dx / d * p.speed * 1.2, .14); p.vy = lerp(p.vy, dy / d * p.speed * 1.2, .14); if (d < 10) { p.age = 99; if (!p.seenDone) p.seen.clear(); } }
      if (p.x < 0 || p.y < 0 || p.x > this.W || p.y > this.H) { if (!p.ret) p.age = 99; }
      for (const o of this.actors) {
        if (o.team === p.team || o.dead || o.iframe > 0 || p.seen.has(o)) continue;
        if (hyp(o.x - p.x, o.y - 5 - p.y) < o.r + p.r) {
          p.seen.add(o);
          this.applyHit(p.owner, o, { mul: p.mul, kb: p.kb ?? 22, stun: p.stun, ub: p.ub, dot: p.dot, slow: p.slow, drain: p.drain, shock: p.shock }, p.sk, p);
          if (!p.pierce) p.age = 99;
          break;
        }
      }
    }
    this.proj = this.proj.filter(p => p.age < p.life);
  }
  tickZones(dt) {
    for (const z of this.zones) {
      z.left -= dt;
      if (z.left <= 0) {
        if (z.sfx) Sound.sfx(z.sfx, .7);
        this.addFx(z.fx || 'ring', z.x, z.y - 6, z.r / 14); this.shake(1.5);
        for (const o of this.actors) if (o.team !== z.team && !o.dead && o.iframe <= 0 && hyp(o.x - z.x, o.y - z.y) < z.r + o.r) this.applyHit(z.owner, o, z.h, z.sk);
      }
    }
    this.zones = this.zones.filter(z => z.left > 0);
    for (const t of this.teles) t.left -= dt;
    this.teles = this.teles.filter(t => t.left > 0);
  }
  tickFx(dt) {
    for (const f of this.fx) f.t += dt;
    this.fx = this.fx.filter(f => f.t < f.dur);
    for (const n of this.nums) { n.t += dt; n.y -= 22 * dt * (1 - n.t); }
    this.nums = this.nums.filter(n => n.t < .85);
    if (this.shakeT > 0) this.shakeT -= dt;
  }
  addFx(n, x, y, s = 1, rot = 0, flip = 0) { const d = FX[n] || [32, 32, 4]; this.fx.push({ n, x, y, s, rot, flip, t: 0, dur: d[2] * (n === 'rock' ? .035 : .05), fw: d[0], fh: d[1], frames: d[2] }); }
  num(x, y, v, c = '#fff', s = 1) { this.nums.push({ x, y, v, c, s, t: 0 }); }
  say(a, txt, c = '#fff') { this.nums.push({ x: a.x, y: a.y - 22, v: txt, c, s: .85, t: 0, text: 1 }); }
  shake(a) { this.shakeT = .18; this.shakeA = Math.max(a, this.shakeT > 0 ? this.shakeA : 0); }
  cutin(name) { const c = el('div', 'cutin', name); $('#hud').appendChild(c); this.cut = { t: .55, el: c }; Sound.sfx('power2'); }
  camera(k) { const c = this.cam, x = clamp(this.p.x - VW / 2, 0, this.W - VW), y = clamp(this.p.y - VH / 2 - 4, 0, this.H - VH); c.x = lerp(c.x, x, k); c.y = lerp(c.y, y, k); }
  // ── 적 AI ──
  ai(a, dt0) {
    const dt = dt0 * (a.slowT > 0 ? a.slowF : 1);
    this.phaseCheck(a);
    if (a.busy) return;
    const T = this.near(a); if (!T) { a.vx = a.vy = 0; return; }
    const dx = T.x - a.x, dy = T.y - a.y, d = hyp(dx, dy) || 1, nx = dx / d, ny = dy / d;
    if (a.st === 'guard') { a.guardT += dt; a.guardAI -= dt; a.vx = a.vy = 0; if (a.guardAI <= 0) { a.st = 'idle'; a.atkCd = Math.min(a.atkCd, .2); } return; }
    a.ax = lerp(a.ax, nx, .25); a.ay = lerp(a.ay, ny, .25); const l = hyp(a.ax, a.ay) || 1; a.ax /= l; a.ay /= l; a.face = faceOf(a.ax, a.ay);
    const f = a.def_;
    // 막기: 플레이어가 코앞에서 공격하면 일정 확률로 막는다
    if (f.guard && T.st === 'skill' && d < 44 && T.skT < .08 && a.guardSeen !== T.skSeq) { a.guardSeen = T.skSeq; if (Math.random() < f.guard * .4) { a.st = 'guard'; a.guardT = f.guard >= 1 && Math.random() < .3 ? .1 : .3; a.guardAI = rnd(.35, .7); return; } }
    const attackers = this.actors.filter(o => o.team === 1 && !o.dead && o.st === 'skill').length;
    if (a.atkCd <= 0 && (a.boss || attackers < 2 || a.team === 0)) {
      const opts = a.moves.map(m => MOVES[m]).filter(m => m && d <= m.range + 8 && (a.cd[m.id] || 0) <= 0);
      if (opts.length) {
        const m = pick(opts); a.ax = nx; a.ay = ny; a.face = faceOf(nx, ny);
        this.start(a, m, m.id); a.cd[m.id] = m.once || (m.ult ? 16 : 0) || (m.fromSkill ? Math.min(m.cd, 8) : 0) || (m.range > 90 ? 3 : .5);
        a.atkCd = a.pause * rnd(.75, 1.3) + m.dur * .35; return;
      }
    }
    const keep = f.keep || 0; const close = Math.min(...a.moves.map(m => MOVES[m] ? MOVES[m].range : 40), 40) * .8;
    a.aiT -= dt; if (a.aiT <= 0) { a.aiT = rnd(.7, 1.6); a.strafe = Math.random() < .5 ? 1 : -1; }
    let mx = 0, my = 0;
    if (keep) { if (d < keep * .7) { mx = -nx; my = -ny; } else if (d > keep * 1.2) { mx = nx; my = ny; } else { mx = -ny * a.strafe; my = nx * a.strafe; } }
    else if (d > close) { mx = nx; my = ny; }
    else if (a.atkCd > .25) { const back = a.atkCd > .7 ? -.5 : 0; mx = -ny * a.strafe + nx * back; my = nx * a.strafe + ny * back; }
    a.vx = mx * a.spd; a.vy = my * a.spd; a.st = (mx || my) ? 'move' : 'idle';
  }
  phaseCheck(a) {
    const ph = a.def_.phases; if (!ph || a.phase >= ph.length) return;
    const p = ph[a.phase]; if (a.hp / a.maxHp > p.hp) return;
    a.phase++; if (p.add) a.moves.push(...p.add); if (p.pause) a.pause = p.pause;
    if (p.say) this.say(a, p.say, '#ffb36a');
    if (p.say) { this.nums[this.nums.length - 1].s = 1; this.nums[this.nums.length - 1].y -= 6; this.nums[this.nums.length - 1].long = 1; }
    this.shake(4); this.addFx('aurap', a.x, a.y - 7, 2); Sound.sfx('strange');
  }
  // ── 그리기 ──
  draw(c) {
    const cam = this.cam; let sx = 0, sy = 0;
    if (this.shakeT > 0) { sx = rnd(-this.shakeA, this.shakeA); sy = rnd(-this.shakeA, this.shakeA); } else this.shakeA = 0;
    c.save(); c.setTransform(SCALE, 0, 0, SCALE, 0, 0); c.imageSmoothingEnabled = false;
    const ox = -snap(cam.x + sx), oy = -snap(cam.y + sy); c.translate(ox, oy);
    c.fillStyle = '#000'; c.fillRect(-20, -20, this.W + 40, this.H + 40); c.drawImage(this.bg, 0, 0);
    for (const t of this.teles) this.drawTele(c, t);
    for (const z of this.zones) { const u = 1 - z.left / z.tot; c.fillStyle = z.player ? 'rgba(170,200,255,.2)' : 'rgba(230,50,30,.2)'; c.beginPath(); c.ellipse(z.x, z.y, z.r, z.r * .8, 0, 0, 7); c.fill(); c.fillStyle = z.player ? 'rgba(190,220,255,.4)' : 'rgba(255,70,40,.42)'; c.beginPath(); c.ellipse(z.x, z.y, z.r * u, z.r * .8 * u, 0, 0, 7); c.fill(); }
    const list = [...this.actors].sort((a, b) => a.y - b.y);
    for (const a of list) this.drawActor(c, a);
    for (const p of this.proj) this.drawProj(c, p);
    for (const f of this.fx) this.drawFx(c, f);
    c.restore();
    // 숫자는 고해상도로
    c.save(); c.textAlign = 'center';
    for (const n of this.nums) {
      const a = n.t < .1 ? n.t / .1 : (n.t > .6 ? (.85 - n.t) / .25 : 1), s = n.text ? 20 : 26 * n.s;
      c.globalAlpha = clamp(a, 0, 1); c.font = `${Math.round(s)}px Galmuri11Bold, Galmuri14, sans-serif`;
      const x = (n.x + ox) * SCALE, y = (n.y + oy) * SCALE;
      c.lineWidth = 5; c.strokeStyle = '#000'; c.strokeText(n.v, x, y); c.fillStyle = n.c; c.fillText(n.v, x, y);
    }
    c.restore();
    if (this.p.hp / this.p.maxHp < .25 && !this.ended) { const g = c.createRadialGradient(640, 360, 300, 640, 360, 760); g.addColorStop(0, 'rgba(120,0,0,0)'); g.addColorStop(1, `rgba(130,0,0,${.32 + Math.sin(this.t * 6) * .1})`); c.fillStyle = g; c.fillRect(0, 0, 1280, 720); }
  }
  drawTele(c, t) {
    const u = 1 - t.left / t.tot, col = t.ub ? '230,50,30' : '240,190,60';
    c.save(); c.translate(t.x, t.y); const an = Math.atan2(t.ay, t.ax);
    const shape = (k) => {
      c.beginPath();
      if (t.shape === 'arc') { c.moveTo(0, 0); c.arc(0, 0, t.r * k, an - t.a * D2R, an + t.a * D2R); c.closePath(); }
      else if (t.shape === 'circle') c.ellipse(t.ax * (t.off || 0), t.ay * (t.off || 0), t.r * k, t.r * k * .85, 0, 0, 7);
      else { c.rotate(an); c.rect(0, -t.w / 2, t.len * k, t.w); }
      c.fill();
    };
    c.fillStyle = `rgba(${col},.17)`; c.save(); shape(1); c.restore(); c.fillStyle = `rgba(${col},.38)`; c.save(); shape(u); c.restore();
    c.restore();
  }
  drawActor(c, a) {
    const dead = a.dead, alpha = dead ? clamp(1 - a.deadT / .8, 0, 1) : (a.iframe > 0 && a.st !== 'skill' && Math.floor(this.t * 30) % 2 ? .55 : 1);
    if (dead && alpha <= 0) return;
    const s = a.scale || 1, y = a.y;
    if (a.st === 'guard') { c.fillStyle = 'rgba(160,210,255,.28)'; c.beginPath(); c.arc(a.x + a.ax * 4, y - 6 + a.ay * 4, 9, 0, 7); c.fill(); }
    drawShadow(c, a.x, y, a.big ? 2 : s);
    for (const g of a.ghosts) { c.globalAlpha = g.t * 2.2; this.sprite(c, a, g.x, g.y, 0, g.face); c.globalAlpha = 1; }
    c.globalAlpha = alpha;
    this.sprite(c, a, a.x, y - (a.z || 0), 0, a.face);
    if (a.flash > 0 && !a.big) { const w = whiteOf(a.spr); if (w) { c.globalAlpha = .85; this.sprite(c, a, a.x, y - (a.z || 0), 0, a.face, w); } }
    c.globalAlpha = 1;
    if (a.swing && a.wpn) this.drawWeapon(c, a);
    if (a.st === 'stun' && !dead && a.stagger > 0) { for (let i = 0; i < 3; i++) { const an = this.t * 6 + i * 2.1; c.fillStyle = '#ffe36a'; c.fillRect(snap(a.x + Math.cos(an) * 7), snap(y - 20 + Math.sin(an) * 2), 2, 2); } }
    if (a.def_ && a.def_.immune && !(a.exposed > 0)) { c.strokeStyle = 'rgba(230,50,40,.75)'; c.lineWidth = 1; c.beginPath(); c.arc(a.x, y - 9 * s, 12 * s, 0, 7); c.stroke(); }
    if (a.buffs.diamond > 0) { c.strokeStyle = 'rgba(255,220,120,.7)'; c.lineWidth = 1; c.beginPath(); c.arc(a.x, y - 7, 10, 0, 7); c.stroke(); }
    if (a.buffs.moonlight > 0) { c.strokeStyle = 'rgba(170,210,255,.85)'; c.lineWidth = 1; c.beginPath(); c.arc(a.x, y - 7, 11, 0, 7); c.stroke(); }
    if (a.slowT > 0) { c.fillStyle = 'rgba(120,80,200,.3)'; c.beginPath(); c.arc(a.x, y - 6, 9, 0, 7); c.fill(); }
    if (a.team === 1 && !a.boss && a !== this.bossA && !dead && !a.dummy) { const w = 16; c.fillStyle = '#000'; c.fillRect(snap(a.x - w / 2 - .5), snap(y - 21), w + 1, 2.5); c.fillStyle = '#d8402e'; c.fillRect(snap(a.x - w / 2), snap(y - 20.75), w * clamp(a.hp / a.maxHp, 0, 1), 2); }
    if (a.team === 0 && !a.isPlayer && !dead) { const w = 16; c.fillStyle = '#000'; c.fillRect(snap(a.x - w / 2 - .5), snap(y - 21), w + 1, 2.5); c.fillStyle = '#58b878'; c.fillRect(snap(a.x - w / 2), snap(y - 20.75), w * clamp(a.hp / a.maxHp, 0, 1), 2); }
  }
  sprite(c, a, x, y, _, face, white) {
    const s = a.scale || 1;
    if (a.def_ && a.def_.stamp) { if (!white) { const q = STAMPS[a.def_.stamp]; drawStamp(c, a.def_.stamp, snap(x - q[3] / 2), snap(y - q[4] + 2)); } return; }
    if (a.big) {
      const b = a.big, im = white || IMG[b.img]; if (!im) return; const fr = Math.floor(this.t * 7) % b.frames, k = im.hd || 1;
      c.drawImage(im, fr * b.w * k, 0, b.w * k, b.h * k, snap(x - b.w / 2), snap(y - b.h + 6), b.w, b.h); return;
    }
    const im = white || IMG[a.spr]; if (!im) return;
    let row = 0;
    if (a.mon) row = Math.floor(a.walk) % 4;
    else if (a.st === 'skill') row = a.jumpT > 0 ? 5 : 4;
    else if (a.st === 'dash') row = 5;
    else if (a.dead) row = 0;
    else if (a.st === 'guard') row = 6;
    else if (a.st === 'move') row = Math.floor(a.walk) % 4;
    // 쿼터뷰 인물 시트(_q): 비스듬한 앞모습과 뒷모습, 오른쪽을 보면 뒤집는다
    const qi = !a.mon && qSheet(a.spr);
    if (qi) {
      const im2 = white ? whiteOf(a.spr + '_q') : qi, k = 32 * (qi.hd || 1), r = [0, 1, 0, 2, 3, 4, 5][Math.min(row, 6)], back = face === 1 || (a.ay < -.38 && a.st === 'move'), flip = face === 3 || (a.ax > .2 && face !== 2), w = Math.round(16 * QZ) * s, top = snap(y - w * 31 / 32);
      if (!im2) return; c.save(); if (flip) { c.translate(snap(x), 0); c.scale(-1, 1); c.drawImage(im2, (back ? 1 : 0) * k, r * k, k, k, -w / 2, top, w, w); } else c.drawImage(im2, (back ? 1 : 0) * k, r * k, k, k, snap(x - w / 2), top, w, w); c.restore(); return;
    }
    const f = 16 * (im.hd || 1); row = Math.min(row, Math.floor(im.height / f) - 1);
    const w = 16 * s, dg = row < 4 && !a.mon && IMG[a.spr + '_d'] && Math.min(Math.abs(a.ax), Math.abs(a.ay)) > .38 ? (white ? whiteOf(a.spr + '_d') : IMG[a.spr + '_d']) : null;
    if (dg) { const k = 16 * (dg.hd || 1), sx = (a.ay < 0 ? 1 : 0) * k; c.save(); if (a.ax < 0) { c.translate(snap(x), 0); c.scale(-1, 1); c.drawImage(dg, sx, Math.min(row, 3) * k, k, k, -w / 2, snap(y - 15 * s), w, w); } else c.drawImage(dg, sx, Math.min(row, 3) * k, k, k, snap(x - w / 2), snap(y - 15 * s), w, w); c.restore(); return; }
    c.drawImage(im, face * f, row * f, f, f, snap(x - w / 2), snap(y - 15 * s), w, w);
  }
  drawWeapon(c, a) {
    const im = IMG['wpn/' + a.wpn]; if (!im) return;
    const sw = a.swing, u = sw.t / sw.dur, base = Math.atan2(a.ay, a.ax), an = base + lerp(sw.from, sw.to, u) + Math.PI / 2;
    c.save(); c.translate(a.x + a.ax * 3, a.y - 7 + a.ay * 3); c.rotate(an);
    const push = sw.thrust ? Math.sin(u * Math.PI) * 8 : 2;
    const iw = im.width / (im.hd || 1), ih = im.height / (im.hd || 1); c.drawImage(im, -iw / 2, -ih - push, iw, ih); c.restore();
  }
  drawProj(c, p) {
    c.save(); c.translate(p.x, p.y);
    if (p.img === 'tray') { c.rotate(p.age * 18); c.fillStyle = '#7a4a22'; c.beginPath(); c.ellipse(0, 0, 6, 3.4, 0, 0, 7); c.fill(); c.fillStyle = '#b57a3e'; c.beginPath(); c.ellipse(0, 0, 4.4, 2.2, 0, 0, 7); c.fill(); }
    else if (p.img === 'plum') { c.rotate(p.age * 9); c.fillStyle = '#ffb7c8'; for (let i = 0; i < 5; i++) { const q = i * 1.2566; c.beginPath(); c.arc(Math.cos(q) * 2.4, Math.sin(q) * 2.4, 1.8, 0, 7); c.fill(); } c.fillStyle = '#ffe36a'; c.fillRect(-1, -1, 2, 2); }
    else if (p.img === 'crescent') { c.rotate(p.an); c.strokeStyle = '#eaf2ff'; c.lineWidth = 3; c.beginPath(); c.arc(-6, 0, 12, -1.1, 1.1); c.stroke(); c.strokeStyle = 'rgba(150,190,255,.6)'; c.lineWidth = 5; c.beginPath(); c.arc(-9, 0, 12, -1, 1); c.stroke(); }
    else { const d = PJ[p.img] || [16, 16, 1], im = IMG['fx/' + p.img], fr = Math.floor(p.age * 12) % d[2], k = im?.hd || 1; c.rotate(p.an); if (im) c.drawImage(im, fr * d[0] * k, 0, d[0] * k, d[1] * k, -d[0] / 2, -d[1] / 2, d[0], d[1]); }
    c.restore();
  }
  drawFx(c, f) {
    const im = IMG['fx/' + f.n]; if (!im) return; const fr = Math.min(f.frames - 1, Math.floor(f.t / f.dur * f.frames));
    c.save(); c.translate(f.x, f.y); if (f.rot) c.rotate(f.rot); if (f.flip) c.scale(1, -1); c.scale(f.s, f.s);
    const k = im.hd || 1; c.drawImage(im, fr * f.fw * k, 0, f.fw * k, f.fh * k, -f.fw / 2, -f.fh / 2, f.fw, f.fh); c.restore();
  }
  // 싸우는 도중 메뉴에서 초식이나 무기를 바꾼 경우
  refreshGear() {
    const st = stats(G.S), p = this.p; this.st = st; p.atk = st.atk; p.wpn = WEAPONS[G.S.weapon].spr;
    const tip = this.tipEl; this.buildHud(); if (tip && this.tipT > 0) { this.tipEl = tip; $('#hud').appendChild(tip); }
  }
  // ── HUD ──
  buildHud() {
    const h = $('#hud'); h.innerHTML = '';
    const p = this.p, S = G.S;
    h.innerHTML = `<div class="bars"><div class="bname">${esc(S.title)} ${esc(p.name)}</div><div class="bar"><i class="lag" id="hLag"></i><i class="val" id="hVal"></i><b id="hTxt"></b></div><div class="bar mp"><i class="val" id="mVal"></i><b id="mTxt"></b></div></div>`;
    const bosses = this.actors.filter(a => (a.boss || a.elite) && a.team === 1).sort((a, b) => !!b.boss - !!a.boss);
    if (bosses.length) { const b = bosses[0]; this.bossA = b; h.insertAdjacentHTML('beforeend', `<div class="boss"><div class="bname">${(b.def_.title ? b.def_.title + ' ' : '') + (b.def_.nameplate || b.name)}</div><div class="bar"><i class="lag" id="bLag"></i><i class="val" id="bVal"></i></div><div class="bar pos"><i class="val" id="bPos"></i></div></div>`); }
    const key = (i) => Keys.label('s' + i);
    let sk = '';
    S.slots.forEach((id, i) => { const k = id && SKILLS[id]; sk += `<div class="sk ${k && k.ult ? 'ult' : ''}" id="sk${i}"><span class="ky">${key(i)}</span>${k ? `<span class="mp">${k.mp}</span><span class="nm">${k.name}</span>` : '<span class="nm">-</span>'}<div class="cd"></div><span class="ct"></span></div>`; });
    sk += `<div class="sk small"><span class="ky">${Keys.label('atk')}</span><span class="nm">평타</span></div><div class="sk small" id="skDash"><span class="ky">${Keys.label('dash')}</span><span class="nm">경공</span><div class="cd"></div></div><div class="sk small"><span class="ky">${Keys.label('guard')}</span><span class="nm">막기</span></div><div class="sk small" id="skPot"><span class="ky">${Keys.label('potion')}</span><span class="nm">금창약<br><span id="potN"></span></span></div>`;
    h.insertAdjacentHTML('beforeend', `<div class="skills">${sk}</div>`);
    if (this.introT > 0) { this.vsEl = el('div', 'vs', this.cfg.title || (bosses[0] ? bosses[0].name : '대결')); h.appendChild(this.vsEl); }
    if (G.touchB) { S.slots.forEach((id, i) => { G.touchB[3 + i].textContent = id ? SKILLS[id].name.replace(/^제\d식 /, '').slice(0, 4) : '-'; }); $$('.skills .small').forEach(e => e.style.display = 'none'); $('.skills').style.bottom = '6px'; }
    if (this.cfg.tip) { this.tipEl = el('div', 'tut', this.cfg.tip); h.appendChild(this.tipEl); this.tipT = 11; }
    this.hudEls = { hVal: $('#hVal'), hLag: $('#hLag'), hTxt: $('#hTxt'), mVal: $('#mVal'), mTxt: $('#mTxt'), bVal: $('#bVal'), bLag: $('#bLag'), bPos: $('#bPos'), potN: $('#potN'), dash: $('#skDash .cd'), slots: [0, 1, 2, 3].map(i => $('#sk' + i)) };
  }
  hud() {
    const E = this.hudEls, p = this.p; if (!E) return;
    const set = (e, v) => { if (e && e._v !== v) { e._v = v; e.style.width = v; } };
    const txt = (e, v) => { if (e && e._t !== v) { e._t = v; e.textContent = v; } };
    set(E.hVal, clamp(p.hp / p.maxHp, 0, 1) * 100 + '%'); set(E.hLag, clamp(p.hpLag, 0, 1) * 100 + '%'); set(E.mVal, clamp(p.mp / p.maxMp, 0, 1) * 100 + '%');
    txt(E.hTxt, `${Math.max(0, Math.ceil(p.hp))} / ${p.maxHp}`); txt(E.mTxt, `${Math.floor(p.mp)} / ${p.maxMp}`); txt(E.potN, String(G.S.potion));
    if (this.bossA) { const b = this.bossA; set(E.bVal, clamp(b.hp / b.maxHp, 0, 1) * 100 + '%'); set(E.bLag, clamp(b.hpLag, 0, 1) * 100 + '%'); set(E.bPos, (b.maxPoise ? clamp(b.poise / b.maxPoise, 0, 1) : 0) * 100 + '%'); }
    const S = G.S;
    S.slots.forEach((id, i) => {
      const e = E.slots[i]; if (!id) return; const k = SKILLS[id], cd = p.cd[i] || 0, ok = canEquip(id);
      const cdEl = e._cd || (e._cd = e.querySelector('.cd')), ct = e._ct || (e._ct = e.querySelector('.ct'));
      const h = cd > 0 ? clamp(cd / (k.cd * this.st.cdMul), 0, 1) * 100 : 0;
      const hv = h.toFixed(0) + '%'; if (cdEl._h !== hv) { cdEl._h = hv; cdEl.style.height = hv; }
      txt(ct, cd > 0 ? Math.ceil(cd) : '');
      const off = !ok || p.mp < k.mp; if (e._off !== off) { e._off = off; e.classList.toggle('off', off); }
    });
    if (E.dash) { const v = (clamp(p.dashCd / .6, 0, 1) * 100).toFixed(0) + '%'; if (E.dash._h !== v) { E.dash._h = v; E.dash.style.height = v; } }
  }
  finish() { this.onDone && this.onDone(this.outcome); }
}

// 전투 한 판을 치르고 결과를 돌려준다
export function fight(cfg) {
  stageClear();
  return new Promise(res => {
    const prev = G.scene;
    const B = new Battle(cfg);
    Input.clear();
    G.battle = B; G.scene = 'battle';
    Sound.bgm(cfg.bgm || (cfg.foes.some(f => FOES[f].boss) ? 'boss' : 'fight'));
    B.onDone = async (o) => {
      G.lastOutcome = o;
      let up = 0, ex = 0, si = 0; const drops = [];
      if (o === 'win') {
        for (const a of B.actors) if (a.team === 1) { const f = a.def_; if (a.dead || a.yielded) { ex += f.exp; si += f.silver; } }
        ex = Math.round(ex * (cfg.expMul ?? 1)); si = Math.round(si * (cfg.expMul ?? 1));
        si = Math.round(si * (1 + (G.party?.fx().silver || 0) / 100)); up = gainExp(ex); G.S.silver += si;
        for (const a of B.actors) if (a.team === 1 && a.dead) for (const [id, ch, lo, hi] of a.def_.drops || []) if (Math.random() < ch) { const n = rint(lo, hi); give(id, n); drops.push(`${DB[id].name} ${n}`); }
      }
      const meal = G.S.meal; if (meal && --meal.left <= 0) G.S.meal = null;
      $('#hud').innerHTML = '';
      G.scene = prev === 'battle' ? 'field' : prev; G.battle = null;
      res({ outcome: o, exp: ex, silver: si, levelUp: up, drops });
    };
  });
}
