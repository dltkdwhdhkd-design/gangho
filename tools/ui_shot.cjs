const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
  const errs = []; p.on('pageerror', e => errs.push('PAGE ' + e.message + ' ' + (e.stack || '').slice(0, 300))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto((process.env.GAME_URL || 'http://127.0.0.1:8123/index.html')); await p.waitForTimeout(1300);
  await p.evaluate(() => {
    const G = __G; G.S = G.dbg.newState('진소', 'BlueSamurai', 'm', 'normal'); Object.assign(G.S, { lv: 14, str: 16, con: 12, agi: 9, inn: 14, pts: 3, silver: 860, weapon: 'blue_sword', weapons: ['stick', 'iron_sword', 'blue_sword', 'iron_blade'], skills: ['cloud_flash', 'flow_three', 'wind_turn', 'swallow_qi', 'tray', 'moon1', 'moon2', 'moon3', 'moon4', 'break_mount', 'blood_fan', 'sky_sword', 'moon7'], slots: ['cloud_flash', 'moon1', 'moon3', 'sky_sword'], hearts: ['none', 'tonap', 'iron_shirt'], heart: 'tonap', pages: ['moon1', 'moon2', 'moon3', 'moon4'], notes: ['곽 아주머니는 검은 옷의 무리에게 끌려갔다.', '나는 월하문의 마지막 아이.'], love: { yun: 2, so: 1, cheol: 0 } }); G.S.flags = { step: 'c3b', met_yun: true, met_so: true, boat_guhwa: true };
    document.querySelector('#screen').innerHTML = ''; G.bgDraw = null; G.scene = 'field'; G.S.goal = '광장의 심판에게 대회 등록하기'; G.field.load('guhwa', 24.5, 22, 1);
  });
  await p.waitForTimeout(500); await p.screenshot({ path: '/tmp/claude-0/shots/u0.png' });
  await p.keyboard.press('Escape'); await p.waitForTimeout(200); await p.screenshot({ path: '/tmp/claude-0/shots/u1.png' });
  await p.click('.tabs button[data-t=skill]'); await p.waitForTimeout(150); await p.screenshot({ path: '/tmp/claude-0/shots/u2.png' });
  await p.click('.tabs button[data-t=gear]'); await p.waitForTimeout(100); await p.click('.tabs button[data-t=note]'); await p.waitForTimeout(100); await p.screenshot({ path: '/tmp/claude-0/shots/u3.png' });
  await p.click('.tabs button[data-t=love]'); await p.waitForTimeout(150); await p.screenshot({ path: '/tmp/claude-0/shots/u4.png' });
  await p.click('.tabs button[data-t=set]'); await p.waitForTimeout(100); await p.keyboard.press('Escape'); await p.waitForTimeout(100);
  await p.evaluate(() => { const G = __G; G.manual = true; G.dbg.fight({ foes: ['so_final'], arena: 'ring', noIntro: true }); }); const tick = n => p.evaluate(n => __G.fast(n), n);
  await tick(60); for (let i = 0; i < 40; i++) { await tick(6); const t = await p.evaluate(() => __G.battle.teles.length); if (t) break; } await p.screenshot({ path: '/tmp/claude-0/shots/u5.png' });
  await p.keyboard.press('KeyP'); await tick(3); await tick(4); await p.screenshot({ path: '/tmp/claude-0/shots/u6.png' }); await tick(50); await p.screenshot({ path: '/tmp/claude-0/shots/u7.png' });
  console.log(errs.slice(0, 8).join('\n')); await b.close();
  const b2 = await chromium.launch(); const c = await b2.newContext({ viewport: { width: 844, height: 390 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 }); const q = await c.newPage();
  await q.goto((process.env.GAME_URL || 'http://127.0.0.1:8123/index.html')); await q.waitForTimeout(1300);
  await q.evaluate(() => { const G = __G; G.S = G.dbg.newState('진소', 'Boy', 'm', 'normal'); G.S.flags = { step: 'c1c', bamboo_open: true }; G.S.goal = '북쪽 대숲길의 석상을 찾기'; document.querySelector('#screen').innerHTML = ''; G.bgDraw = null; G.scene = 'field'; G.field.load('cheongha', 24, 18, 1); });
  await q.waitForTimeout(500); await q.screenshot({ path: '/tmp/claude-0/shots/m1.png' });
  await q.evaluate(() => { __G.dbg.fight({ foes: ['bandit'], arena: 'village', noIntro: true }); }); await q.waitForTimeout(700); await q.screenshot({ path: '/tmp/claude-0/shots/m2.png' }); await b2.close();
})().catch(e => { console.log(String(e).slice(0, 800)); process.exit(1); });
