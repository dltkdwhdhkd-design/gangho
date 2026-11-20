// 빛 값을 바꿔 가며 찍는다(지도마다 한 번만 짓고 값만 갈아 끼운다). 낮·밤의 빛은 js/hd2d.js의 TIMES, 방의 빛은 ROOMT.
//   SETS='{"a":{"day":{"tint":[1,1,.9]}},"b":{"room":{"hemI":.3}}}'  SCENES="cheongha b_hwasan:22,30 valley:20,16 inn:9,8"  OUT=/tmp/lt  Q='&pitch=25&fov=22'  NIGHT=1
//   찍은 그림은 python3 tools/tone.py /tmp/lt/*.png 로 잰다. 2026-11-21에 낮과 방의 빛을 이걸로 맞췄다(docs/ws-study.md)
const { chromium } = require('playwright'); const fs = require('fs');
(async () => { const OUT = process.env.OUT || '/tmp/lt'; fs.mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 720 } }); const errs = []; p.on('pageerror', e => errs.push(e.message.slice(0, 200)));
  await p.goto(process.env.GAME_URL + '?hd2d=1' + (process.env.Q || '')); await p.waitForFunction(() => window.__G && __G.dbg && __G.hd?.ready, null, { timeout: 90000 }); await p.waitForTimeout(1500);
  await p.evaluate(async () => { const G = __G, sl = t => new Promise(r => setTimeout(r, t)); G.noSave = true; G.S = G.dbg.newState('진소', 'BlueSamurai', 'm', 'normal'); document.querySelector('#screen').innerHTML = ''; G.bgDraw = null; G.auto = true; G.free.start(); for (let i = 0; i < 400 && G.field.busy; i++) await sl(30); G.hd.noGov = true; if (G.free) G.free.tick = () => {}; window.__T0 = JSON.parse(JSON.stringify(G.hd.times)); });
  const SETS = JSON.parse(process.env.SETS || '{"base":{}}'), SC = (process.env.SCENES || 'cheongha b_hwasan:22,30 valley:20,16').split(' ');
  for (const sc of SC) { const [m, xy] = sc.split(':'), [x, y] = xy ? xy.split(',').map(Number) : [];
    await p.evaluate(async ([m, x, y]) => { const G = __G, sl = t => new Promise(r => setTimeout(r, t)); if (G.field.m?.id !== m) { G.world.ensure?.(m); const M = G.dbg.MAPS[m]; G.field.load(m, x ?? M.w / 2, y ?? M.h / 2, 0); } for (let i = 0; i < 600 && G.field.busy; i++) await sl(50); const F = G.field, P = F.p;
      if (F.m.blocked(P.x, P.y)) out: for (let r = 8; r < 400; r += 8) for (let a = 0; a < 16; a++) { const X = P.x + Math.cos(a * Math.PI / 8) * r, Y = P.y + Math.sin(a * Math.PI / 8) * r; if (!F.m.blocked(X, Y)) { P.x = X; P.y = Y; break out; } }
      for (let i = 0; i < 60 && G.hd.modelsPending > 0; i++) await sl(100); await sl(2500); }, [m, x, y]);
    for (const k in SETS) { await p.evaluate(([set, night]) => { const G = __G, T = G.hd.times, T0 = window.__T0; for (const t in T0) { for (const q in T[t]) if (!(q in T0[t])) delete T[t][q]; Object.assign(T[t], JSON.parse(JSON.stringify(T0[t]))); } for (const t in set) if (t !== 'room') Object.assign(T[t], set[t]); const RL = G.hd.roomLight; window.__R0 ||= {}; for (const t in RL) { window.__R0[t] ||= JSON.parse(JSON.stringify(RL[t])); for (const q in RL[t]) if (!(q in window.__R0[t])) delete RL[t][q]; Object.assign(RL[t], JSON.parse(JSON.stringify(window.__R0[t])), set.room || {}); } G.S.flags.night = night ? 1 : 0; }, [SETS[k], process.env.NIGHT ? 1 : 0]);
      await p.waitForTimeout(900); await p.screenshot({ path: `${OUT}/${m}_${k}.png` }); } console.log(m); }
  console.log('오류', errs.length, errs.slice(0, 4).join(' | ')); await b.close(); })();
