import { G, STEP, TS, SCALE, VW, VH, $, Input, IMG, Sound, loadAll, loadArtList, toast } from './core.js';
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

const cv = $('#cv'), ctx = cv.getContext('2d'); G.ctx = ctx;
// 해상도: 화면 배치는 1280×720 그대로 두고 캔버스만 1920×1080으로 그린다(1.5배). 그리는 코드는 모두 1280×720 좌표를 쓰므로 변환에 1.5를 곱해 준다
const RK = 1.5; cv.width = 1280 * RK; cv.height = 720 * RK; ctx.imageSmoothingEnabled = false;
{ const st = ctx.setTransform.bind(ctx); ctx.setTransform = (a, b, c, d, e, f) => typeof a === 'object' ? st(a) : st(a * RK, b * RK, c * RK, d * RK, e * RK, f * RK); ctx.resetTransform = () => st(RK, 0, 0, RK, 0, 0); ctx.setTransform(1, 0, 0, 1, 0, 0); }
// 전체 화면: 설정의 단추, 또는 Alt+Enter
G.fullscreen = () => { try { if (document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen({ navigationUI: 'hide' }); } catch { } };
addEventListener('keydown', e => { if (e.altKey && e.code === 'Enter') { e.preventDefault(); G.fullscreen(); } });
function fit() {
  const s = Math.min(innerWidth / 1280, innerHeight / 720);
  $('#stage').style.transform = `translate(-50%,-50%) scale(${s})`;
}
addEventListener('resize', fit); fit();
// 꾸미기: 화면을 눌러 가구를 놓는다
function aimDecor(e) {
  if (!G.decor) return false;
  const r=cv.getBoundingClientRect(),f=G.field;
  const x=(e.clientX-r.left)/r.width*VW, y=(e.clientY-r.top)/r.height*VH;
  const floor=HD.active(f.m)?HD.roomFloorAt(x*SCALE,y*SCALE,f.m):[x+f.cam.x,y+f.cam.y];
  if (!floor) return false;
  const cx=Math.floor(floor[0]/TS),cy=Math.floor(floor[1]/TS);
  if (cx<0 || cy<0 || cx>=f.m.w || cy>=f.m.h) return false;
  Object.assign(G.decor,{cx,cy});return true;
}
cv.addEventListener('pointermove',aimDecor);
cv.addEventListener('pointerdown',e=>{if(aimDecor(e))G.life.placeAt(G.decor.cx,G.decor.cy);});

function tick(dt) {
  G.mainPlot?.tick(dt);
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
  if (G.scene !== 'field' && !(G.scene === 'battle' && G.battle?.stage)) HD.hide();  // 새 화면은 필드와 3D 무대 전투에서만 보인다
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
