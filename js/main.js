import { G, STEP, $, Input, IMG, Sound, loadAll, loadArtList, toast } from './core.js';
import { buildMaps, isoTest } from './maps.js';
import { tickDialog, talking } from './dialog.js';
import { Field } from './field.js';
import { showTitle } from './ui.js';
import { initTouch } from './touch.js';
import { fight } from './battle.js';
import { Story } from './story.js';
import { ctx as sctx } from './ctx.js';
import { MAPS } from './maps.js';
import * as state from './state.js';
import { newState, stats } from './state.js';
import * as dialog from './dialog.js';
import { HD } from './hd2d.js';

const cv = $('#cv'), ctx = cv.getContext('2d'); ctx.imageSmoothingEnabled = false; G.ctx = ctx;
function fit() {
  const s = Math.min(innerWidth / 1280, innerHeight / 720);
  $('#stage').style.transform = `translate(-50%,-50%) scale(${s})`;
}
addEventListener('resize', fit); fit();
// 꾸미기: 화면을 눌러 가구를 놓는다
const tileAt = e => { const r = cv.getBoundingClientRect(), f = G.field; return [Math.floor(((e.clientX - r.left) / r.width * 320 + f.cam.x) / 16), Math.floor(((e.clientY - r.top) / r.height * 180 + f.cam.y) / 16)]; };
cv.addEventListener('pointermove', e => { if (G.decor) { [G.decor.cx, G.decor.cy] = tileAt(e); } });
cv.addEventListener('pointerdown', e => { if (G.decor) { [G.decor.cx, G.decor.cy] = tileAt(e); G.life.placeAt(G.decor.cx, G.decor.cy); } });

function tick(dt) {
  if (G.menuOpen) { Input.tick(dt); return; }
  if (talking()) { tickDialog(dt); return; }
  if (G.scene === 'battle' && G.battle) G.battle.update(dt);
  else if (G.scene === 'field' && G.field) { G.S.time += dt; G.field.update(dt); if (G.S.mode === 'free' && G.free) G.free.tick(dt); if (G.field.m?.live) G.world.tick(dt); }
  else Input.tick(dt);
}
function render() {
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.imageSmoothingEnabled = false;
  if (G.scene === 'battle' && G.battle) G.battle.draw(ctx);
  else if (G.scene === 'field' && G.field) G.field.draw(ctx);
  else if (G.bgDraw) G.bgDraw(ctx);
  if (G.scene !== 'field') HD.hide();  // 새 화면은 필드에서만 보인다
}
let last = performance.now(), acc = 0;
function frame(now) {
  requestAnimationFrame(frame);
  if (G.manual) return;
  acc += Math.min(.1, (now - last) / 1000) * (G.speedup || 1); last = now;
  let n = 0;
  while (acc >= STEP && n++ < 240) { tick(STEP); acc -= STEP; }
  render();
}
// 자동 시험에서 시간을 빠르게 돌릴 때 쓴다
G.fast = (n) => { for (let i = 0; i < n; i++) tick(STEP); render(); };

(async function boot() {
  ctx.fillStyle = '#14110f'; ctx.fillRect(0, 0, 1280, 720);
  ctx.fillStyle = '#efe3c8'; ctx.font = '24px Galmuri14, sans-serif'; ctx.textAlign = 'center'; ctx.fillText('불러오는 중...', 640, 360);
  Input.init(); initTouch();
  await loadAll(p => { ctx.fillStyle = '#14110f'; ctx.fillRect(0, 380, 1280, 40); ctx.fillStyle = '#e0ad3b'; ctx.fillRect(440, 390, 400 * p, 10); });
  loadArtList(); // 일러스트는 뒤에서 받는다. 먼저 뜬 화면을 막지 않는다
  await document.fonts.load('20px Galmuri14', '강호').catch(() => { });
  await document.fonts.load('20px Galmuri11Bold', '강호').catch(() => { });
  buildMaps(); G.base.init();
  if (HD.want) await HD.init();  // 새 화면(?hd2d=1). 못 켜면 2D 그대로
  G.field = new Field();
  showTitle();
  requestAnimationFrame(frame);
  G.dbg = { fight, Story, ctx: sctx, MAPS, newState, stats, dialog, state, isoTest };
  window.__G = G;
})();
