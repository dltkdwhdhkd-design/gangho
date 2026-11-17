// 경맥(js/meridian.js)과 고수 비무 전수(js/fanchars.js): 깨달음 쓰기, 효과가 능력치에 붙는지, 옛 저장 채우기, 이긴 뒤 초식과 깨달음
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage(); const errs = [], fail = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(process.env.GAME_URL); await p.waitForFunction(() => window.__G && __G.dbg, null, { timeout: 60000 }); await p.waitForTimeout(1500);
  const r = await p.evaluate(async () => { const G = __G; G.noSave = true; G.S = G.dbg.newState('진소', 'BlueSamurai', 'm', 'normal'); document.querySelector('#screen').innerHTML = ''; G.bgDraw = null; G.auto = true; G.free.start(); for (let i = 0; i < 400 && G.field.busy; i++) await new Promise(r => setTimeout(r, 30));
    const MER = await import('/gangho/js/meridian.js'), ST = await import('/gangho/js/state.js'), FC = await import('/gangho/js/fanchars.js'); const o = {};
    o.ins0 = G.S.ins; G.S.ins = 3; const h0 = ST.stats().maxHp; o.open = MER.open(G.S, MER.MERIDIANS[0]); o.h = [h0, ST.stats().maxHp]; o.ins1 = G.S.ins; o.renLocked = !MER.canOpen({ ...G.S, ins: 99 }, MER.VESSELS[0]);
    const old = JSON.parse(JSON.stringify(G.S)); delete old.ins; delete old.mer; old.lv = 12; MER.fillIns(old); o.oldIns = old.ins;
    o.boss = (() => { const i = G.S.ins; MER.bossDown('wei'); MER.bossDown('wei'); return G.S.ins - i; })();
    o.teach = FC.teachOf('hwasan', 4); return o; });
  console.log(JSON.stringify(r));
  if (r.ins0 !== 0) fail.push('새 게임 깨달음이 0이 아님'); if (!r.open || !(r.h[1] > r.h[0])) fail.push('혈을 뚫어도 체력이 안 오름'); if (r.ins1 !== 2) fail.push('깨달음이 안 줄음'); if (!r.renLocked) fail.push('임맥이 처음부터 열림');
  if (r.oldIns !== 4) fail.push('옛 저장 깨달음 채우기 틀림 ' + r.oldIns); if (r.boss !== 1) fail.push('같은 보스로 깨달음이 두 번 ' + r.boss); if (!/^x_hwasan/.test(r.teach || '')) fail.push('화산 고수 전수 초식 없음');
  console.log(fail.length ? '실패\n' + fail.join('\n') : '통과'); console.log(errs.slice(0, 5).join('\n') || 'no errors'); await b.close(); if (fail.length || errs.length) process.exit(1);
})().catch(e => { console.log(String(e).slice(0, 500)); process.exit(1); });
