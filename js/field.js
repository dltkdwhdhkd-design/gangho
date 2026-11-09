// 마을과 산길을 걸어 다니는 화면
import { G, IMG, Input, Sound, $, el, TS, SCALE, VW, VH, clamp, rnd, hyp, snap, drawActorSprite, drawShadow, fadeTo, wait, toast } from './core.js';
import { Keys, josa } from './core.js';
import { MAPS } from './maps.js';
import { drawIso, orderKeys, inside as isoInside } from './iso.js';
import { drawStamp, STAMPS } from './tiles.js';
import { save } from './state.js';
import { Story } from './story.js';
import { openMenu } from './ui.js';
import { DB } from './items.js';
import { give } from './state.js';
import { checkTitles } from './titles.js';
import { stageClear } from './dialog.js';
import { bindMini, tickMini, openMap } from './mapview.js';

const DIRV = [[0, 1], [0, -1], [-1, 0], [1, 0]];
export class Field {
  constructor() { this.p = { x: 0, y: 0, dir: 0, walk: 0 }; this.npcs = []; this.spots = []; this.trigs = []; this.roam = []; this.cam = { x: 0, y: 0 }; this.busy = false; this.parts = []; this.t = 0; this.trail = []; }
  load(id, tx, ty, dir = 0) {
    if (id === 'myhouse') { G.life.enterHouse(); tx = Math.floor(MAPS.myhouse.w / 2); ty = MAPS.myhouse.h - 2; }
    if (id === 'mysect') G.sect.build();
    G.world.ensure(id);
    const from = this.m?.id; this.trail = []; const m = MAPS[id]; G.world?.linkEdges?.(m); this.m = m; G.S.map = id; (G.S.seen = G.S.seen || {})[id] = 1; G.S.flags['seen_' + id] = 1; this.arrows = []; this.p.x = tx * TS * (m.k || 1); this.p.y = ty * TS * (m.k || 1); this.p.dir = dir;
    // 넓힌 지도로 방에서 나오면 그 방 문 바로 앞에 선다
    if (m.k > 1 && from) { const d = m.portals.find(q => q.door && q.to === from); if (d) { this.p.x = d.x + d.w / 2; this.p.y = d.y + d.h + 8; } }
    this.refresh(true); this.camera(1); this.showHud();
    if (m.bgm && !this.noBgm) Sound.bgm(G.S.flags.night && m.nightBgm ? m.nightBgm : m.bgm);
    this.parts = [];
    this.flashPlace();
  }
  refresh(fresh) {
    const id = this.m.id, c = Story.content(id);
    const old = fresh ? new Map() : new Map(this.npcs.map(n => [n.id, n]));
    this.npcs = c.npcs.map(n => { const q = { dir: 0, walk: 0, ...n, x: n.x * TS, y: n.y * TS, hx: n.x * TS, hy: n.y * TS }, o = old.get(n.id);
      if (o && o.hx === q.hx && o.hy === q.hy && q.life && q.life !== 'still') Object.assign(q, { x: o.x, y: o.y, dir: o.dir, lt: o.lt, greetT: o.greetT, trip: o.trip, hide: o.hide, ri: o.ri, off: o.off, door: o.door });  // 같은 사람이면 서 있던 자리를 지킨다
      return q; });
    // 쿼터뷰 건물 바닥 안에 선 사람은 가까운 빈자리로 비켜 세운다
    if (this.m.polys) for (const n of this.npcs) { if (!this.m.polys.some(c => isoInside(c, n.x, n.y, -2))) continue;
      out: for (let r = 6; r < 80; r += 6) for (let a = 0; a < 16; a++) { const x = n.x + Math.cos(a * Math.PI / 8) * r, y = n.y + Math.sin(a * Math.PI / 8) * r; if (!this.m.blocked(x, y) && !this.m.polys.some(c => isoInside(c, x, y, -4))) { n.x = n.hx = x; n.y = n.hy = y; break out; } } }
    if (fresh) this.barkT = 2.5;
    this.spots = c.spots; this.trigs = c.trigs;
    if (fresh) this.animals = c.hunt.map(a => ({ ...a, ...G.life.animals[a.kind], x: a.x * TS, y: a.y * TS, vx: 0, vy: 0, t: rnd(1, 3), walk: 0 }));
    if (fresh) this.roam = c.roam.map(r => ({ ...r, x: r.x * TS, y: r.y * TS, hx: r.x * TS, hy: r.y * TS, dir: 0, walk: 0, t: rnd(1, 3), vx: 0, vy: 0 }));
    this.updateGoal();
  }
  flashPlace() { const e = $('#place'); if (!e) return; e.textContent = this.m.name; e.classList.add('on'); clearTimeout(this._pt); this._pt = setTimeout(() => e.classList.remove('on'), 1800); }
  showHud() {
    const h = $('#hud'); h.innerHTML = `<div class="goal" id="goal"></div><div class="place" id="place"></div><div class="mini">${this.m.id === 'myhouse' ? '<button class="btn sm" id="dbtn">꾸미기 (' + Keys.label('decor') + ')</button>' : ''}<button class="btn sm" id="mapb">지도 (${Keys.label('map')})</button><button class="btn sm" id="mbtn">메뉴 (${Keys.label('opt')})</button></div><canvas id="mm"></canvas><div class="keys" id="keys"><span id="dayl">${G.S.day}일째${G.S.mode === 'free' ? ' ' + G.free.period() : ''}</span>${G.touch ? '' : ` · 대화 ${Keys.label('ok')} · 경공 ${Keys.label('dash')}${[...(Keys.map.dash || []), ...(Keys.map.guard || [])].includes('ShiftLeft') ? '·Shift' : ''} · 메뉴 ${Keys.label('opt')} · 지도 ${Keys.label('map')}`}${G.S.flags.bow && this.m.hunting !== false && (this.animals || []).length ? ' · 활 J' : ''}</div><div class="talkhint" id="thint" style="display:none"></div>`;
    $('#mbtn').onclick = () => openMenu();
    $('#mapb').onclick = () => { if (!this.busy && !G.decor) openMap(); };
    bindMini(this);
    if ($('#dbtn')) $('#dbtn').onclick = () => { if (!this.busy && !G.decor) G.life.openDecor(); };
    this.updateGoal();
  }
  updateGoal() { const e = $('#goal'); if (e) { const g = G.S.goal; e.style.display = g ? 'block' : 'none'; e.innerHTML = `<b>목표</b>${g}`; } const b = $('#mbtn'); if (b) b.textContent = G.S.pts > 0 || G.S.tp > 0 ? `메뉴 (${Keys.label('opt')}) · 올릴 점수 있음` : `메뉴 (${Keys.label('opt')})`; }
  async run(fn) {
    if (this.busy) return; this.busy = true; Input.clear();
    try { await fn(); } catch (e) { console.error(e); }
    this.busy = false; stageClear(); G.hideCG && G.hideCG(); checkTitles(); if (G.jh && G.scene === 'field') G.jh.storyTime(); if (G.scene === 'field') { this.refresh(); if (!$('#goal')) this.showHud(); } G.S.px = this.p.x / (this.m.k || 1); G.S.py = this.p.y / (this.m.k || 1); G.S.dir = this.p.dir; save();
  }
  async warp(id, tx, ty, dir = 0) {
    await fadeTo(1); this.load(id, tx, ty, dir); await wait(.08); await fadeTo(0);
  }
  update(dt) {
    this.t += dt; Input.tick(dt);
    if (this.busy) { this.tickNpcs(dt); this.camera(.12); return; }
    if (G.decor) { this.tickDecor(); return; }
    if (Input.take('menu') || Input.take('opt')) { openMenu(); return; }
    if (Input.take('map')) { openMap(); return; }
    if (Input.take('decor') && this.m.id === 'myhouse') { G.life.openDecor(); return; }
    if (Input.take('frun')) { G.runOn = !G.runOn; toast(G.runOn ? '경공으로 달린다' : '걸어서 간다', 1.4); }
    const p = this.p, m = this.m, d = Input.dir(), S = G.S, run = !!(Input.down.dash || Input.down.guard || G.runOn), sp = run ? (m.id === 'world' ? 230 : 180) : 84;
    let moving = false; this.dashing = false;
    if (d.x || d.y) {
      moving = true;
      p.dir = Math.abs(d.x) >= Math.abs(d.y) * .55 ? (d.x < 0 ? 2 : 3) : (d.y < 0 ? 1 : 0); p.diag = d.x && d.y && Math.min(Math.abs(d.x), Math.abs(d.y)) > .3 ? (d.y > 0 ? 0 : 1) + (d.x < 0 ? 2 : 0) : undefined;
      const nx = p.x + d.x * sp * dt, ny = p.y + d.y * sp * dt;
      const blocked = (x, y) => m.blocked(x, y) || this.npcs.some(n => !(n.hide > 0) && hyp(n.x - x, (n.y - 1) - y) < 8);
      const ox = p.x, oy = p.y; if (!blocked(nx, p.y)) p.x = nx; if (!blocked(p.x, ny)) p.y = ny;
      // 발자취는 거리마다 남긴다. 경공으로 달려도 뒤따르는 동료와의 거리가 같다
      p.walk += dt * (run ? 13 : 8); this.dashing = run && (p.x !== ox || p.y !== oy); this._acc = (this._acc || 0) + hyp(p.x - ox, p.y - oy);
      const k = Math.min(8, Math.floor(this._acc / 1.4)); this._acc -= k * 1.4; for (let i = k; i >= 1; i--) this.trail.unshift({ x: ox + (p.x - ox) * i / k, y: oy + (p.y - oy) * i / k, dir: p.dir, diag: p.diag }); if (this.trail.length > 70) this.trail.length = 70;
    } else p.walk = 0;
    // 눈앞의 사람에게 곧장 칼을 뽑는다
    { const t0 = this.target(); if (t0 && t0.talk && G.crime?.can(t0) && Input.take('atk')) { this.face(t0); this.run(() => G.crime.attack(t0)); return; } }
    this.tickNpcs(dt); this.tickRoam(dt); this.tickHunt(dt); this.camera(.14);
    // 포탈
    for (const q of m.portals) {
      if (p.x > q.x && p.x < q.x + q.w && p.y > q.y && p.y < q.y + q.h) {
        if (q.when && !S.flags[q.when] && !(q.world && S.mode === 'free')) { if (q.lock && !this._locked) { this._locked = true; const msg = q.lock; p.y -= d.y * 3; p.x -= d.x * 3; this.run(async () => { await Story.line(msg); this._locked = false; }); } return; }
        if (q.door && Input.dir().y > 0 && q.dir !== 0 && false) continue;
        this.run(async () => { Sound.sfx('select', .6); await this.warp(q.to, q.tx, q.ty, q.dir); });
        return;
      }
    }
    // 자동 사건
    for (const t of this.trigs) {
      if (t.when && !t.when()) continue;
      if (p.x > t.x * TS && p.x < (t.x + t.w) * TS && p.y > t.y * TS && p.y < (t.y + t.h) * TS) { this.run(t.run); return; }
    }
    // 대화 대상
    const tgt = this.target(), hint = $('#thint');
    if (hint) { if (tgt) { const txt = (G.touch ? '' : 'E ') + (tgt.hint || '말 걸기') + (tgt.talk && G.crime?.can(tgt) ? (G.touch ? ' · 공격' : ` · ${Keys.label('atk')} 공격`) : ''); if (hint._t !== txt) { hint._t = txt; hint.textContent = txt; } hint.style.display = 'block'; } else hint.style.display = 'none'; }
    if (tgt && Input.take('ok')) { if (tgt.talk) { this.face(tgt); this.run(tgt.talk); } else if (tgt.act) this.run(tgt.act); }
    else Input.take('ok');
  }
  tickDecor() {
    const d = G.decor, I = Input;
    if (I.take('menu') || I.take('opt')) { G.life.closeDecor(); return; }
    if (I.take('up')) d.cy--; if (I.take('down')) d.cy++; if (I.take('left')) d.cx--; if (I.take('right')) d.cx++;
    if (I.take('ok')) G.life.placeAt(d.cx, d.cy);
  }
  tickHunt(dt) {
    const p = this.p, m = this.m;
    this.shootCd = (this.shootCd || 0) - dt;
    if (G.S.flags.bow && this.animals.length && this.shootCd <= 0 && Input.take('atk')) { const [fx, fy] = DIRV[p.dir]; this.arrows.push({ x: p.x, y: p.y - 6, vx: fx * 210, vy: fy * 210, t: .7, an: Math.atan2(fy, fx) }); this.shootCd = .45; Sound.sfx('sword', .6); }
    for (const a of this.animals) {
      if (a.gone) continue;
      const d = hyp(p.x - a.x, p.y - a.y); a.t -= dt;
      if (d < 62) { const s = a.speed || 66; a.vx = (a.x - p.x) / d * s; a.vy = (a.y - p.y) / d * s; a.t = .4; }
      else if (a.t <= 0) { a.t = rnd(.8, 2.4); const q = rnd(6.28), on = Math.random() < .6; a.vx = on ? Math.cos(q) * 18 : 0; a.vy = on ? Math.sin(q) * 18 : 0; }
      const nx = a.x + a.vx * dt, ny = a.y + a.vy * dt;
      if (!m.blocked(nx, a.y)) a.x = nx; else a.vx = -a.vx; if (!m.blocked(a.x, ny)) a.y = ny; else a.vy = -a.vy;
      if (a.vx || a.vy) a.walk += dt * 7;
    }
    for (const r of this.arrows) {
      r.x += r.vx * dt; r.y += r.vy * dt; r.t -= dt;
      for (const a of this.animals) if (!a.gone && hyp(a.x - r.x, a.y - 5 - r.y) < 9) { a.gone = true; r.t = 0; Sound.sfx('hit'); const got = a.drops.map(([k, n]) => { give(k, n); return `${DB[k].name} ${n}`; }); toast(`${a.name}: ${got.join(', ')}`, 2.4); break; }
    }
    this.arrows = this.arrows.filter(r => r.t > 0);
  }
  face(n) { const dx = this.p.x - n.x, dy = this.p.y - n.y; n.dir = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 2 : 3) : (dy < 0 ? 1 : 0); }
  target() {
    const p = this.p, [fx, fy] = DIRV[p.dir], x = p.x + fx * 10, y = p.y - 3 + fy * 10;
    let best = null, bd = 19;
    for (const n of this.npcs) { if (n.hide > 0) continue; const d = hyp(n.x - x, n.y - 4 - y); if (d < bd) { bd = d; best = n; } }
    if (best) return best;
    for (const s of this.spots) { if (s.when && !s.when()) continue; if (x > s.x * TS - 6 && x < (s.x + s.w) * TS + 6 && y > s.y * TS - 6 && y < (s.y + s.h) * TS + 6) return s; }
    return null;
  }
  tickNpcs(dt) { for (const n of this.npcs) { if (n.path) { const t = n.path[0]; if (!t) { n.path = null; n.moving = false; n.done && n.done(); continue; } const dx = t[0] * TS - n.x, dy = t[1] * TS - n.y, d = hyp(dx, dy); if (d < 1.5) { n.path.shift(); continue; } n.x += dx / d * 56 * dt; n.y += dy / d * 56 * dt; n.dir = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 2 : 3) : (dy < 0 ? 1 : 0); n.walk += dt * 8; } } if (!this.busy) this.tickLife(dt); }
  // ── 사람들의 하루 ──
  // life: idle 둘러보기(기본), wander 근처를 오가기, work 제자리에서 일하기, drill 연무장 수련, still 꼼짝 않기
  // barks: 주인공이 근처를 지날 때 머리 위에 뜨는 혼잣말. greet: 가까이 오면 한 번 건네는 인사
  tickLife(dt) {
    const p = this.p, m = this.m, t = this.t, moving = Input.dir().x || Input.dir().y;
    const freeAt = (x, y, me) => !m.blocked(x, y) && hyp(p.x - x, p.y - y) > 12 && !this.npcs.some(o => o !== me && hyp(o.x - x, o.y - y) < 9);
    for (const n of this.npcs) {
      if (n.bubT > 0) n.bubT -= dt; if (n.greetT > 0) n.greetT -= dt; if (n.hopT > 0) n.hopT -= dt;
      if (n.stamp || n.path) continue;
      const life = n.life || (n.drill ? 'drill' : 'idle'); if (life === 'still') continue;
      if (n.hide > 0) { n.hide -= dt; continue; }  // 집에 들어갔다
      if (life === 'watch') { const lx = n.look[0] * TS, ly = n.look[1] * TS; n.dir = Math.abs(lx - n.x) > Math.abs(ly - n.y) ? (lx < n.x ? 2 : 3) : (ly < n.y ? 1 : 0); continue; }  // 구경꾼은 구경거리만 본다
      if (life === 'perform') { const ph = (t + (n.lag || 0)) % 2.6; n.pose = ph < .45 ? 5 : ph < .9 ? 4 : ph < 1.35 ? 5 : undefined; n.dir = Math.floor(t / 2.6) % 3 === 2 ? 3 : 0; n.walk = 0; continue; }
      const d = hyp(p.x - n.x, p.y - n.y); n.lt = (n.lt ?? rnd(.4, 3)) - dt;
      if (n.greet && d < 40 && !(n.greetT > 0)) { n.greetT = 40; this.bubble(n, typeof n.greet === 'function' ? n.greet() : n.greet); }
      if (life === 'drill') {  // 다 같이 같은 순서로 초식을 밟는다
        const ph = (t + (n.lag || 0)) % 3.2, k = Math.floor(t / 3.2) % 2;
        n.pose = ph < .7 ? 4 : ph < 1.5 ? undefined : ph < 2.2 ? 6 : 4; n.walk = ph >= .7 && ph < 1.5 ? (ph - .7) * 6 : 0;
        n.dir = ph >= 2.2 ? (k ? 2 : 3) : 1; continue;
      }
      if (d < 26 && !n.mv && !n.trip) { if (life !== 'work' || moving) this.face(n); n.pose = undefined; n.walk = 0; continue; }  // 다가오면 멈춰서 쳐다본다
      if (life === 'work') {
        if (n.lt <= 0) { n.lt = rnd(1.4, 2.6); n.wk = (n.wk || 0) + 1; if (n.wk % 3 === 0 && !n.fix) n.dir = [0, 2, 3][Math.floor(rnd(3))]; }
        n.pose = n.lt > 1 ? 4 : undefined; n.walk = 0; continue;
      }
      if (life === 'stroll' || life === 'patrol') { this.stroll(n, life, dt); continue; }
      if (life === 'wander' && n.mv) {
        const dx = n.mv[0] - n.x, dy = n.mv[1] - n.y, q = hyp(dx, dy), sp = n.speed || 22;
        if (q < 2 || n.lt < -6) { n.mv = null; n.walk = 0; n.lt = rnd(1.5, 4.5); continue; }
        const nx = n.x + dx / q * sp * dt, ny = n.y + dy / q * sp * dt;
        if (!freeAt(nx, ny, n)) { n.mv = null; n.walk = 0; n.lt = rnd(.8, 2); continue; }
        n.x = nx; n.y = ny; n.dir = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 2 : 3) : (dy < 0 ? 1 : 0); n.walk += dt * 6; continue;
      }
      if (n.lt > 0) continue;
      if (life === 'wander' && Math.random() < .6) {
        const r = (n.r || 2.5) * TS;
        for (let i = 0; i < 6; i++) { const x = n.hx + rnd(-r, r), y = n.hy + rnd(-r * .7, r * .7); if (freeAt(x, y, n)) { n.mv = [x, y]; n.lt = 0; break; } }
        if (n.mv) continue;
      }
      n.lt = rnd(2.2, 5.5); n.pose = undefined;
      n.dir = d < 90 && Math.random() < .5 ? (Math.abs(p.x - n.x) > Math.abs(p.y - n.y) ? (p.x < n.x ? 2 : 3) : (p.y < n.y ? 1 : 0)) : Math.random() < .5 && n.dir0 !== undefined ? n.dir0 : Math.floor(rnd(4));
    }
    // 혼잣말: 가까이 있는 사람 하나가 가끔 입을 연다
    this.barkT = (this.barkT ?? 3) - dt;
    if (this.barkT <= 0) {
      const c = this.npcs.filter(n => n.barks && !(n.bubT > 0) && !(n.hide > 0) && hyp(p.x - n.x, p.y - n.y) < 110 && n !== this._lastBark);
      this.barkT = c.length > 5 ? rnd(2.2, 4.5) : rnd(3.5, 7.5);
      if (c.length) { const n = c[Math.floor(rnd(c.length))], b = typeof n.barks === 'function' ? n.barks() : n.barks; if (b && b.length) { const line = b[Math.floor(rnd(b.length))]; if (Array.isArray(line)) { this.bubble(n, line[0]); this._reply = { id: n.duo, text: line[1], t: 1.9 }; } else this.bubble(n, line); this._lastBark = n; } }
    }
    // 둘이 주고받는 말: 한 사람이 말하면 옆 사람이 받는다
    if (this._reply && (this._reply.t -= dt) <= 0) { const o = this.npcs.find(q => q.id === this._reply.id); if (o) this.bubble(o, this._reply.text); this._reply = null; }
    // 장사꾼은 손님을 부르느라 저 혼자 계속 외친다
    for (const n of this.npcs) if (n.hawk && !(n.bubT > 0)) { n.hawkT = (n.hawkT ?? rnd(1, 6)) - dt; if (n.hawkT <= 0) { n.hawkT = rnd(...(n.gap || [8, 15])); const h = typeof n.hawk === 'function' ? n.hawk() : n.hawk; if (h && h.length && hyp(p.x - n.x, p.y - n.y) < 170) this.bubble(n, h[Math.floor(rnd(h.length))]); } }
  }
  // 길을 따라 걷는다. stroll은 아무 데나, patrol은 route를 돈다. enters가 있으면 가끔 집 문 앞까지 가서 들어갔다가 나온다
  stroll(n, life, dt) {
    const p = this.p;
    if (!n.trip) {
      if (n.lt > 0) return;
      const w = this.walkTiles(), at = [Math.floor(n.x / TS), Math.floor((n.y - 4) / TS)]; let goal = null; n.door = null;
      if (life === 'patrol' && n.route) { n.ri = ((n.ri ?? -1) + 1) % n.route.length; goal = n.route[n.ri]; }
      else if (n.enters && Math.random() < .3) { const d = this.m.portals.filter(q => q.door && !q.lock && !q.when); if (d.length) { const q = d[Math.floor(rnd(d.length))]; n.door = [q.x + q.w / 2, q.y + 3]; goal = [Math.floor(n.door[0] / TS), Math.floor((q.y + q.h) / TS)]; } }
      for (let i = 0; i < 14 && !goal && w.list.length; i++) { const q = w.list[Math.floor(rnd(w.list.length))], dd = Math.abs(q[0] - at[0]) + Math.abs(q[1] - at[1]); if (dd > 4 && dd < (n.far || 28)) goal = q; }
      const path = goal && this.roadPath(at, goal), o = n.off ?? (n.off = rnd(-3, 3));
      if (path && path.length) { n.trip = path.map(([x, y]) => [x * TS + 8 + o, y * TS + 12 + o * .4]); if (n.door) n.trip.push(n.door); } else { n.door = null; n.lt = rnd(1.5, 3); }
      return;
    }
    const [tx, ty] = n.trip[0], dx = tx - n.x, dy = ty - n.y, q = hyp(dx, dy), sp = n.speed || 24;
    if (q < 1.5) { n.trip.shift(); if (!n.trip.length) { n.trip = null; n.walk = 0; n.lt = life === 'patrol' ? rnd(.4, 1.6) : rnd(1.5, 5); if (n.door) { n.hide = rnd(5, 12); n.dir = 0; n.y += 6; n.door = null; } } return; }
    if (hyp(p.x - (n.x + dx / q * 8), p.y - (n.y + dy / q * 8)) < 11) { n.walk = 0; return; }  // 주인공이 길을 막으면 기다린다
    const k = Math.min(q, sp * dt); n.x += dx / q * k; n.y += dy / q * k; n.dir = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 2 : 3) : (dy < 0 ? 1 : 0); n.walk += dt * 6.5;
  }
  // 걸을 수 있는 칸. 길(1), 돌바닥(3), 나무 바닥(4), 광장(5)은 road, 풀밭은 돌아갈 길이 없을 때만 밟는다
  walkTiles() {
    const m = this.m; if (m._walk) return m._walk; const road = new Set(), grass = new Set(), list = [], W = new Set(m.walkOn || [1, 3, 4, 5]);
    if (m.w * m.h < 12000) for (let y = 1; y < m.h - 1; y++) for (let x = 1; x < m.w - 1; x++) { const v = m.g[y][x]; if (v === 2 || m.blocked(x * TS + 8, y * TS + 12)) continue; if (W.has(v)) { road.add(x + ',' + y); list.push([x, y]); } else grass.add(x + ',' + y); }
    return m._walk = { road, grass, list };
  }
  roadPath(a, b) {
    const { road, grass } = this.walkTiles(), k = (x, y) => x + ',' + y, ok = kk => road.has(kk) || grass.has(kk), N4 = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    let s = ok(k(a[0], a[1])) ? a : null;
    if (!s) for (const [dx, dy] of [...N4, [1, 1], [-1, 1], [1, -1], [-1, -1]]) if (ok(k(a[0] + dx, a[1] + dy))) { s = [a[0] + dx, a[1] + dy]; break; }
    if (!s || !ok(k(b[0], b[1]))) return null;
    // 길은 1, 풀밭은 5로 치는 다익스트라. 칸 수가 적어서 칸막이 큐로 충분하다
    const dist = new Map([[k(s[0], s[1]), 0]]), prev = new Map([[k(s[0], s[1]), null]]), Q = [[s]], bk = k(b[0], b[1]);
    for (let c = 0; c < Q.length && c < 4000; c++) for (const cur of Q[c] || []) {
      const ck = k(cur[0], cur[1]); if (dist.get(ck) !== c) continue; if (ck === bk) { c = Q.length; break; }
      for (const [dx, dy] of N4) { const nx = cur[0] + dx, ny = cur[1] + dy, kk = k(nx, ny); if (!ok(kk)) continue; const nd = c + (road.has(kk) ? 1 : 5); if (dist.has(kk) && dist.get(kk) <= nd) continue; dist.set(kk, nd); prev.set(kk, cur); (Q[nd] = Q[nd] || []).push([nx, ny]); }
    }
    if (!prev.has(bk)) return null;
    const out = []; for (let c = b; c; c = prev.get(k(c[0], c[1]))) out.push(c); out.reverse();
    return out.filter((c, i) => i === 0 || i === out.length - 1 || !((out[i - 1][0] === c[0] && c[0] === out[i + 1][0]) || (out[i - 1][1] === c[1] && c[1] === out[i + 1][1])));
  }
  bubble(n, text) { if (!text) return; n.bub = text; n.bubT = Math.min(5, 2.2 + text.length * .07); if (n.lively) n.hopT = .4; }  // lively면 말할 때 들썩인다
  drawBubbles(c, ox, oy) {
    if (this.busy) return; const on = this.npcs.filter(n => n.bubT > 0 && n.bub); if (!on.length) return;
    c.setTransform(1, 0, 0, 1, 0, 0); c.font = '15px Galmuri11, Galmuri14, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
    for (const n of on) {
      const x = (n.x + ox) * SCALE, y = (n.y - 27 + oy) * SCALE; if (x < -200 || x > 1480 || y < 0 || y > 760) continue;
      const w = Math.min(420, c.measureText(n.bub).width + 22), h = 30, a = Math.min(1, n.bubT / .35);
      c.globalAlpha = a; c.fillStyle = '#fbf3df'; c.strokeStyle = '#2a2018'; c.lineWidth = 3;
      c.beginPath(); c.roundRect(Math.round(x - w / 2), Math.round(y - h), Math.round(w), h, 8); c.fill(); c.stroke();
      c.beginPath(); c.moveTo(x - 6, y - 1.5); c.lineTo(x, y + 8); c.lineTo(x + 6, y - 1.5); c.fill();
      c.beginPath(); c.moveTo(x - 6, y); c.lineTo(x, y + 8); c.lineTo(x + 6, y); c.stroke();
      c.fillStyle = '#2a2018'; c.fillText(n.bub, x, y - h / 2 + 1, 400);
    }
    c.globalAlpha = 1; c.textBaseline = 'alphabetic';
  }
  tickRoam(dt) {
    const p = this.p, m = this.m;
    for (const r of this.roam) {
      if (r.gone) continue;
      const d = hyp(p.x - r.x, p.y - r.y);
      if (r.cool > 0) { r.cool -= dt; continue; }
      if (d < 78) { const s = 44; r.vx = (p.x - r.x) / d * s; r.vy = (p.y - r.y) / d * s; }
      else { r.t -= dt; if (r.t <= 0) { r.t = rnd(1, 2.6); const a = rnd(6.28), on = Math.random() < .6; r.vx = on ? Math.cos(a) * 22 : 0; r.vy = on ? Math.sin(a) * 22 : 0; if (hyp(r.hx - r.x, r.hy - r.y) > 50) { const q = hyp(r.hx - r.x, r.hy - r.y); r.vx = (r.hx - r.x) / q * 22; r.vy = (r.hy - r.y) / q * 22; } } }
      const nx = r.x + r.vx * dt, ny = r.y + r.vy * dt;
      if (!m.blocked(nx, r.y)) r.x = nx; if (!m.blocked(r.x, ny)) r.y = ny;
      if (r.vx || r.vy) { r.walk += dt * 7; r.dir = Math.abs(r.vx) > Math.abs(r.vy) ? (r.vx < 0 ? 2 : 3) : (r.vy < 0 ? 1 : 0); }
      if (d < 11) { this.run(async () => { const won = await Story.encounter(r); if (won) r.gone = true; else { r.cool = 3; } }); return; }
    }
  }
  camera(k) {
    const m = this.m, W = m.w * TS, H = m.h * TS, p = this.p;
    const x = W <= VW ? (W - VW) / 2 : clamp(p.x - VW / 2, 0, W - VW), y = H <= VH ? (H - VH) / 2 : clamp(p.y - VH / 2, 0, H - VH);
    this.cam.x += (x - this.cam.x) * k; this.cam.y += (y - this.cam.y) * k;
  }
  draw(c) {
    const m = this.m, p = this.p, S = G.S, cam = this.cam;
    c.setTransform(SCALE, 0, 0, SCALE, 0, 0); c.imageSmoothingEnabled = false;
    c.fillStyle = '#000'; c.fillRect(0, 0, VW, VH);
    const ox = -snap(cam.x), oy = -snap(cam.y); c.translate(ox, oy);
    if (m.live) G.world.ground(c, cam); else c.drawImage(m.canvas, 0, 0);
    const list = [];
    for (const s of m.live ? G.world.objsNear(cam) : m.objs) if (s.x < cam.x + VW + 8 && s.x + (s.w || STAMPS[s.name]?.[3] || 120) > cam.x - 8 && s.y < cam.y + VH + 8 && s.base > cam.y - 8) list.push({ y: s.base, s });
    for (const n of this.npcs) if (!(n.hide > 0)) list.push({ y: n.y, n });
    for (const r of this.roam) if (!r.gone) list.push({ y: r.y, n: r, mon: true });
    if (G.party && this.m.id !== 'world0') G.party.members().forEach((id, i) => { if (this.npcs.some(n => n.id === id)) return; const q = this.trail[Math.min(this.trail.length - 1, 16 + i * 16)]; if (!q) return; list.push({ y: q.y, n: { spr: G.party.spr(id), x: q.x, y: q.y, dir: q.dir, diag: q.diag, walk: p.walk } }); });
    for (const a of this.animals) if (!a.gone) list.push({ y: a.y, ani: a });
    if (!this.hideMe) list.push({ y: p.y, me: true });
    if (m.hasIso || m.live) { for (const o of list) if (!o.s) { o.actor = true; o.x = o.me ? p.x : (o.n || o.ani || {}).x ?? 0; } orderKeys(list); }
    list.sort((a, b) => a.y - b.y);
    const mark = n => { if (!n.mark || !n.mark()) return; const b = Math.sin(this.t * 5) * 1.2; c.fillStyle = '#000'; c.fillRect(snap(n.x - 2), snap(n.y - 25 + b), 4, 8); c.fillStyle = '#ffd23c'; c.fillRect(snap(n.x - 1), snap(n.y - 24 + b), 2, 4); c.fillRect(snap(n.x - 1), snap(n.y - 19 + b), 2, 1.5); };
    for (const o of list) {
      if (o.s) { if (o.s.iso) drawIso(c, o.s); else drawStamp(c, o.s.name, o.s.x, o.s.y); }
      else if (o.ani) { const a = o.ani, im = IMG[a.spr]; drawShadow(c, a.x, a.y, .8); if (im) { c.save(); c.translate(snap(a.x), snap(a.y - 15)); if (a.vx < 0) c.scale(-1, 1); c.drawImage(im, (Math.floor(a.walk) % 2) * 16, 0, 16, 16, -8, 0, 16, 16); c.restore(); } }
      else if (o.n && o.n.stamp) { drawStamp(c, o.n.stamp, o.n.x - 8, o.n.y - 14); mark(o.n); }
      else if (o.me) {
        if (this.dashing) for (const [i, a] of [[9, .18], [5, .32]]) { const q = this.trail[i]; if (!q) continue; c.globalAlpha = a; drawActorSprite(c, 'chars/' + S.look, q.dir, Math.floor(p.walk + i) % 4, q.x, q.y, { diag: q.diag }); c.globalAlpha = 1; }
        drawShadow(c, p.x, p.y); drawActorSprite(c, 'chars/' + S.look, p.dir, Math.floor(p.walk) % 4, p.x, p.y, { diag: p.walk ? p.diag : undefined });
      }
      else { const n = o.n, key = n.spr.includes('/') ? n.spr : 'chars/' + n.spr; drawShadow(c, n.x, n.y, n.size ? n.size / 16 : undefined); drawActorSprite(c, key, n.dir, n.pose ?? Math.floor(n.walk || 0) % 4, n.x, n.y - (n.hopT > 0 ? Math.sin(n.hopT / .4 * Math.PI) * 2.5 : 0), { diag: n.walk ? n.diag : undefined, size: n.size });
        mark(n); }
    }
    if (S.flags.burned && !S.flags.inn_rebuilt && m.id === 'cheongha') { c.fillStyle = 'rgba(25,14,8,.62)'; c.fillRect(19 * TS, 8 * TS, 4 * TS, 3 * TS - 2); }
    const ar = IMG['fx/p_arrow']; for (const r of this.arrows) { c.save(); c.translate(r.x, r.y); c.rotate(r.an); if (ar) c.drawImage(ar, -6, -2, ar.width / (ar.hd || 1), ar.height / (ar.hd || 1)); c.restore(); }
    if (G.decor) {
      const d = G.decor; c.strokeStyle = '#ffe36a'; c.lineWidth = .75;
      if (d.sel) { const [w, h] = G.life.size(d.sel), ok = G.life.canPlace(d.sel, d.cx, d.cy); c.fillStyle = ok ? 'rgba(90,220,120,.35)' : 'rgba(230,60,50,.35)'; c.fillRect(d.cx * TS, d.cy * TS, w * TS, h * TS); }
      else c.strokeRect(d.cx * TS, d.cy * TS, TS, TS);
    }
    c.setTransform(SCALE, 0, 0, SCALE, 0, 0);
    this.ambient(c);
    const night = S.flags.night;
    if (m.tint) { c.fillStyle = m.tint; c.fillRect(0, 0, VW, VH); }
    if (night && !m.room) { c.fillStyle = 'rgba(14,16,60,.5)'; c.fillRect(0, 0, VW, VH); }
    if (G.fxOverlay) G.fxOverlay(c);
    if (m.labels) {
      c.setTransform(1, 0, 0, 1, 0, 0); c.textAlign = 'center'; c.font = '20px Galmuri11Bold, Galmuri14, sans-serif'; c.lineWidth = 5; c.strokeStyle = '#000'; c.fillStyle = '#ffe9a8';
      for (const l of m.labels) { const x = (l.x * TS + ox) * SCALE, y = (l.y * TS + oy) * SCALE; if (x < -120 || x > 1400 || y < -30 || y > 750) continue; c.strokeText(l.text, x, y); c.fillText(l.text, x, y); }
    }
    this.drawExits(c, ox, oy);
    this.drawBubbles(c, ox, oy);
    tickMini(this);
  }
  // 나가는 곳 표시: 맵 가장자리 출구와 방문에 들썩이는 화살표, 가까이 가면 어디로 가는지 적는다
  drawExits(c, ox, oy) {
    const m = this.m, p = this.p, S = G.S; if (m.live || this.busy) return;
    const W = m.w * TS, H = m.h * TS, t = performance.now() / 1000; c.setTransform(1, 0, 0, 1, 0, 0);
    for (const q of m.portals) {
      if (q.when && !S.flags[q.when] && !(q.world && S.mode === 'free')) continue;
      let dir = q.y + q.h >= H - 2 ? 'd' : q.y <= 2 ? 'u' : q.x <= 2 ? 'l' : q.x + q.w >= W - 2 ? 'r' : null; const door = !dir && q.door;
      if (!dir && !door) continue;
      const cx = q.x + q.w / 2, cy = q.y + q.h / 2, d = Math.hypot(p.x - cx, p.y - cy) / TS; if (d > (dir ? 10 : 3.5)) continue;
      let ax = cx, ay = cy; if (dir === 'd') ay = q.y + q.h - 12; if (dir === 'u') ay = q.y + 12; if (dir === 'l') ax = q.x + 12; if (dir === 'r') ax = q.x + q.w - 12; if (door) { dir = 'u'; ay = q.y + q.h + 10; }
      const b = Math.sin(t * 5) * 3, a = Math.max(.25, Math.min(1, (10 - d) / 4)), [vx, vy] = { d: [0, 1], u: [0, -1], l: [-1, 0], r: [1, 0] }[dir];
      const X = (ax + ox) * SCALE + vx * b * 2, Y = (ay + oy) * SCALE + vy * b * 2, k = door ? 9 : 13, px = -vy, py = vx;
      c.globalAlpha = a; c.lineJoin = 'round';
      for (const [col, lw] of [['#2a1608', 9], ['#ffe08a', 4]]) { c.strokeStyle = col; c.lineWidth = lw; c.beginPath(); for (const o of [0, -k * .9]) { c.moveTo(X + px * k - vx * k * .6 + vx * o, Y + py * k - vy * k * .6 + vy * o); c.lineTo(X + vx * k * .4 + vx * o, Y + vy * k * .4 + vy * o); c.lineTo(X - px * k - vx * k * .6 + vx * o, Y - py * k - vy * k * .6 + vy * o); } c.stroke(); }
      if (!door && d < 7) { const to = q.to === 'world' ? '강호' : MAPS[q.to]?.name || ''; if (to) { c.font = '18px Galmuri11Bold, Galmuri14, sans-serif'; c.textAlign = 'center'; c.lineWidth = 5; c.strokeStyle = '#000'; c.fillStyle = '#ffe9a8'; const tx = X - vx * 40 + (vx ? 0 : 0), ty = Y - vy * 34 - (vy ? 0 : 22); const lab = m.room ? '나가기' : josa(to, '으로/로'); c.strokeText(lab, tx, ty); c.fillText(lab, tx, ty); } }
      c.globalAlpha = 1;
    }
  }
  ambient(c) {
    const kind = this.m.ambient || ({ cheongha: 'leafpink', bamboo: 'leaf', cloudmt: 'leafpink', guhwa: 'leafpink', wolha: 'snow' })[this.m.id];
    if (!kind) return; const im = IMG['fx/' + kind]; if (!im) return;
    if (this.parts.length < 22 && Math.random() < .06) this.parts.push({ x: rnd(0, VW + 40), y: -8, vx: rnd(-16, -5), vy: rnd(9, 22), f: Math.floor(rnd(6)), t: rnd(100) });
    const k = im.hd || 1, fw = kind === 'snow' ? 8 : 12, fh = kind === 'snow' ? 8 : 7, frames = Math.floor(im.width / k / fw);
    for (const q of this.parts) { q.x += q.vx / 60; q.y += q.vy / 60; q.t += 1 / 60; const fr = Math.floor(q.t * 6) % frames; c.drawImage(im, fr * fw * k, 0, fw * k, fh * k, snap(q.x), snap(q.y), fw, fh); }
    this.parts = this.parts.filter(q => q.y < VH + 10 && q.x > -14);
  }
}
