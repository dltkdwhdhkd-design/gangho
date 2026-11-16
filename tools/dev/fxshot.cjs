// 초식 연출 찍기: SK='plum,taiji,...' WAIT=ms
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 720 } }); const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto(process.env.GAME_URL + (process.env.Q ?? '?hd2d=1')); await p.waitForFunction(() => window.__G && __G.dbg, null, { timeout: 60000 }); await p.waitForTimeout(1500);
  await p.evaluate(async () => { const G = __G; G.noSave = true; G.S = G.dbg.newState('나그네', 'BlueSamurai', 'm', 'normal'); document.querySelector('#screen').innerHTML = ''; G.bgDraw = null; G.auto = true; G.free.start(); for (let i = 0; i < 400 && G.field.busy; i++) await new Promise(r => setTimeout(r, 30)); G.auto = false; });
  await p.evaluate(async () => { const { fight } = await import('/gangho/js/battle.js'); window.__F = fight({ foes: (process_foes = ['bandit', 'so_rival', 'bandit']), allies: ['so_ally', 'cheol_ally'], arena: 'village', noIntro: true, title: 'fx' }); });
  await p.waitForTimeout(800);
  const L = (process.env.SK || 'plum').split(','), W = +(process.env.WAIT || 260);
  for (const k of L) {
    await p.evaluate(async (k) => { const G = __G, B = G.battle, { SKILLS } = await import('/gangho/js/data.js'); const P = B.p; P.hp = P.maxHp; P.mp = P.maxMp; P.x = B.W / 2 - 30; P.y = B.H * .6; P.ax = 1; P.ay = 0; P.face = 3; P.st = 'idle'; P.sk = null;
      B.actors.filter(a => a.team === 1).forEach((a, i) => { a.dead = false; a.hp = a.maxHp; a.x = P.x + 40 + i * 14; a.y = P.y - 12 + i * 12; a.st = 'idle'; a.atkCd = 9; a.dummy = true; });
      B.actors.filter(a => a.team === 0 && !a.isPlayer).forEach((a, i) => { a.x = P.x - 30; a.y = P.y + 10 + i * 18; a.dummy = true; });
      B.proj = []; B.zones = []; B.teles = []; B.parts = []; const sk = SKILLS[k]; B.start(P, sk, k); }, k);
    await p.waitForTimeout(W); await p.screenshot({ path: `/tmp/claude-0/shots/fx/${k}.png` });
    await p.waitForTimeout(900);
  }
  console.log(errs.join('\n') || '오류 없음'); await b.close(); })();
