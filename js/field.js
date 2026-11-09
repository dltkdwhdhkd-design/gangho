// 마을과 산길을 걸어 다니는 화면
import { G, IMG, Input, Sound, $, el, TS, SCALE, VW, VH, clamp, rnd, hyp, snap, drawActorSprite, drawShadow, fadeTo, wait, toast } from './core.js';
import { Keys } from './core.js';
import { MAPS } from './maps.js';
import { drawStamp } from './tiles.js';
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
    this.trail = []; const m = MAPS[id]; this.m = m; G.S.map = id; (G.S.seen = G.S.seen || {})[id] = 1; G.S.flags['seen_' + id] = 1; this.arrows = []; this.p.x = tx * TS; this.p.y = ty * TS; this.p.dir = dir;
    this.refresh(true); this.camera(1); this.showHud();
    if (m.bgm && !this.noBgm) Sound.bgm(G.S.flags.night && m.nightBgm ? m.nightBgm : m.bgm);
    this.parts = [];
    this.flashPlace();
  }
  refresh(fresh) {
    const id = this.m.id, c = Story.content(id);
    const old = fresh ? new Map() : new Map(this.npcs.map(n => [n.id, n]));
    this.npcs = c.npcs.map(n => { const q = { dir: 0, walk: 0, ...n, x: n.x * TS, y: n.y * TS, hx: n.x * TS, hy: n.y * TS }, o = old.get(n.id);
      if (o && o.hx === q.hx && o.hy === q.hy && q.life && q.life !== 'still') Object.assign(q, { x: o.x, y: o.y, dir: o.dir, lt: o.lt, greetT: o.greetT });  // 같은 사람이면 서 있던 자리를 지킨다
      return q; });
    if (fresh) this.barkT = 2.5;
    this.spots = c.spots; this.trigs = c.trigs;
    if (fresh) this.animals = c.hunt.map(a => ({ ...a, ...G.life.animals[a.kind], x: a.x * TS, y: a.y * TS, vx: 0, vy: 0, t: rnd(1, 3), walk: 0 }));
    if (fresh) this.roam = c.roam.map(r => ({ ...r, x: r.x * TS, y: r.y * TS, hx: r.x * TS, hy: r.y * TS, dir: 0, walk: 0, t: rnd(1, 3), vx: 0, vy: 0 }));
    this.updateGoal();
  }
  flashPlace() { const e = $('#place'); if (!e) return; e.textContent = this.m.name; e.classList.add('on'); clearTimeout(this._pt); this._pt = setTimeout(() => e.classList.remove('on'), 1800); }
  showHud() {
    const h = $('#hud'); h.innerHTML = `<div class="goal" id="goal"></div><div class="place" id="place"></div><div class="mini">${this.m.id === 'myhouse' ? '<button class="btn sm" id="dbtn">꾸미기 (' + Keys.label('decor') + ')</button>' : ''}<button class="btn sm" id="mapb">지도 (${Keys.label('map')})</button><button class="btn sm" id="mbtn">메뉴 (${Keys.label('opt')})</button></div><canvas id="mm"></canvas><div class="keys" id="keys"><span id="dayl">${G.S.day}일째${G.S.mode === 'free' ? ' ' + G.free.period() : ''}</span>${G.touch ? '' : ` · 대화 ${Keys.label('ok')} · 메뉴 ${Keys.label('opt')} · 지도 ${Keys.label('map')}`}${G.S.flags.bow && this.m.hunting !== false && (this.animals || []).length ? ' · 활 J' : ''}</div><div class="talkhint" id="thint" style="display:none"></div>`;
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
    this.busy = false; stageClear(); G.hideCG && G.hideCG(); checkTitles(); if (G.jh && G.scene === 'field') G.jh.storyTime(); if (G.scene === 'field') { this.refresh(); if (!$('#goal')) this.showHud(); } G.S.px = this.p.x; G.S.py = this.p.y; G.S.dir = this.p.dir; save();
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
    const p = this.p, m = this.m, d = Input.dir(), S = G.S, sp = 76;
    let moving = false;
    if (d.x || d.y) {
      moving = true;
      p.dir = Math.abs(d.x) >= Math.abs(d.y) * .55 ? (d.x < 0 ? 2 : 3) : (d.y < 0 ? 1 : 0); p.diag = d.x && d.y && Math.min(Math.abs(d.x), Math.abs(d.y)) > .3 ? (d.y > 0 ? 0 : 1) + (d.x < 0 ? 2 : 0) : undefined;
      const nx = p.x + d.x * sp * dt, ny = p.y + d.y * sp * dt;
      const blocked = (x, y) => m.blocked(x, y) || this.npcs.some(n => hyp(n.x - x, (n.y - 1) - y) < 8);
      if (!blocked(nx, p.y)) p.x = nx; if (!blocked(p.x, ny)) p.y = ny;
      p.walk += dt * 8; this.trail.unshift({ x: p.x, y: p.y, dir: p.dir, diag: p.diag }); if (this.trail.length > 70) this.trail.pop();
    } else p.walk = 0;
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
    if (hint) { if (tgt) { const txt = (G.touch ? '' : 'E ') + (tgt.hint || '말 걸기'); if (hint._t !== txt) { hint._t = txt; hint.textContent = txt; } hint.style.display = 'block'; } else hint.style.display = 'none'; }
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
    for (const n of this.npcs) { const d = hyp(n.x - x, n.y - 4 - y); if (d < bd) { bd = d; best = n; } }
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
      if (n.bubT > 0) n.bubT -= dt; if (n.greetT > 0) n.greetT -= dt;
      if (n.stamp || n.path) continue;
      const life = n.life || (n.drill ? 'drill' : 'idle'); if (life === 'still') continue;
      const d = hyp(p.x - n.x, p.y - n.y); n.lt = (n.lt ?? rnd(.4, 3)) - dt;
      if (n.greet && d < 40 && !(n.greetT > 0)) { n.greetT = 40; this.bubble(n, typeof n.greet === 'function' ? n.greet() : n.greet); }
      if (life === 'drill') {  // 다 같이 같은 순서로 초식을 밟는다
        const ph = (t + (n.lag || 0)) % 3.2, k = Math.floor(t / 3.2) % 2;
        n.pose = ph < .7 ? 4 : ph < 1.5 ? undefined : ph < 2.2 ? 6 : 4; n.walk = ph >= .7 && ph < 1.5 ? (ph - .7) * 6 : 0;
        n.dir = ph >= 2.2 ? (k ? 2 : 3) : 1; continue;
      }
      if (d < 26 && !n.mv) { if (life !== 'work' || moving) this.face(n); n.pose = undefined; n.walk = 0; continue; }  // 다가오면 멈춰서 쳐다본다
      if (life === 'work') {
        if (n.lt <= 0) { n.lt = rnd(1.4, 2.6); n.wk = (n.wk || 0) + 1; if (n.wk % 3 === 0) n.dir = [0, 2, 3][Math.floor(rnd(3))]; }
        n.pose = n.lt > 1 ? 4 : undefined; n.walk = 0; continue;
      }
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
      this.barkT = rnd(3.5, 7.5);
      const c = this.npcs.filter(n => n.barks && !(n.bubT > 0) && hyp(p.x - n.x, p.y - n.y) < 110 && n !== this._lastBark);
      if (c.length) { const n = c[Math.floor(rnd(c.length))], b = typeof n.barks === 'function' ? n.barks() : n.barks; if (b && b.length) { this.bubble(n, b[Math.floor(rnd(b.length))]); this._lastBark = n; } }
    }
  }
  bubble(n, text) { if (!text) return; n.bub = text; n.bubT = Math.min(5, 2.2 + text.length * .07); }
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
    for (const s of m.live ? G.world.objsNear(cam) : m.objs) if (s.x < cam.x + VW + 8 && s.x > cam.x - 120 && s.y < cam.y + VH + 8 && s.base > cam.y - 8) list.push({ y: s.base, s });
    for (const n of this.npcs) list.push({ y: n.y, n });
    for (const r of this.roam) if (!r.gone) list.push({ y: r.y, n: r, mon: true });
    if (G.party && this.m.id !== 'world0') G.party.members().forEach((id, i) => { if (this.npcs.some(n => n.id === id)) return; const q = this.trail[Math.min(this.trail.length - 1, 16 + i * 16)]; if (!q) return; list.push({ y: q.y, n: { spr: G.party.spr(id), x: q.x, y: q.y, dir: q.dir, diag: q.diag, walk: p.walk } }); });
    for (const a of this.animals) if (!a.gone) list.push({ y: a.y, ani: a });
    if (!this.hideMe) list.push({ y: p.y, me: true });
    list.sort((a, b) => a.y - b.y);
    const mark = n => { if (!n.mark || !n.mark()) return; const b = Math.sin(this.t * 5) * 1.2; c.fillStyle = '#000'; c.fillRect(snap(n.x - 2), snap(n.y - 25 + b), 4, 8); c.fillStyle = '#ffd23c'; c.fillRect(snap(n.x - 1), snap(n.y - 24 + b), 2, 4); c.fillRect(snap(n.x - 1), snap(n.y - 19 + b), 2, 1.5); };
    for (const o of list) {
      if (o.s) drawStamp(c, o.s.name, o.s.x, o.s.y);
      else if (o.ani) { const a = o.ani, im = IMG[a.spr]; drawShadow(c, a.x, a.y, .8); if (im) { c.save(); c.translate(snap(a.x), snap(a.y - 15)); if (a.vx < 0) c.scale(-1, 1); c.drawImage(im, (Math.floor(a.walk) % 2) * 16, 0, 16, 16, -8, 0, 16, 16); c.restore(); } }
      else if (o.n && o.n.stamp) { drawStamp(c, o.n.stamp, o.n.x - 8, o.n.y - 14); mark(o.n); }
      else if (o.me) { drawShadow(c, p.x, p.y); drawActorSprite(c, 'chars/' + S.look, p.dir, Math.floor(p.walk) % 4, p.x, p.y, { diag: p.walk ? p.diag : undefined }); }
      else { const n = o.n, key = n.spr.includes('/') ? n.spr : 'chars/' + n.spr; drawShadow(c, n.x, n.y); drawActorSprite(c, key, n.dir, n.pose ?? Math.floor(n.walk || 0) % 4, n.x, n.y, { diag: n.walk ? n.diag : undefined });
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
    this.drawBubbles(c, ox, oy);
    tickMini(this);
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
