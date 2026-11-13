// 동료: 따라다니는 동료에게 말 걸기(물어볼 거리), 선물(인연 인물·강호 인물), 동료 탭 선물 단추
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 720 } }); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(process.env.GAME_URL); await p.waitForFunction(() => window.__G && __G.dbg, null, { timeout: 60000 }); await p.waitForTimeout(1500);
  await p.evaluate(async () => { const G = __G; G.noSave = true; G.S = G.dbg.newState('나그네', 'BlueSamurai', 'm', 'normal'); document.querySelector('#screen').innerHTML = ''; G.bgDraw = null; G.auto = true; G.free.start(); for (let i = 0; i < 400 && G.field.busy; i++) await new Promise(r => setTimeout(r, 30)); G.auto = false;
    const S = G.S; S.pt = { in: ['yun', 'c_gu'], home: {}, met: { yun: 1, c_gu: 1 }, up: {}, moves: {} }; S.inv.plum_wine = 2; S.inv.ginseng = 1; S.love.c_gu = 10; S.love.yun = 10; G.field.busy = false; });
  const click = async t => { const b = p.locator('.choices button', { hasText: t }).first(); try { await b.waitFor({ timeout: 5000 }); } catch (e) { await p.screenshot({ path: '/tmp/companion_fail.png' }); console.log('못 찾음', t, await p.evaluate(() => ({ busy: __G.field.busy, html: document.querySelector('.choices')?.innerText }))); throw e; } await b.click(); };
  const adv = async () => { for (let i = 0; i < 6; i++) { if (await p.locator('.choices button').count()) return; await p.keyboard.press('Enter'); await p.waitForTimeout(150); } };
  const lines = [];
  // 1) 뒤따르는 동료가 말 걸 대상으로 잡히는지: 동료 자리 쪽을 본다
  const tg = await p.evaluate(async () => { const f = __G.field; for (let i = 0; i < 40; i++) { f.trail.unshift({ x: f.p.x, y: f.p.y + 16 * (i < 16 ? 0 : 1), dir: 0 }); } const q = f.trail[16]; f.p.dir = 0; f.p.x = q.x; f.p.y = q.y - 12; const t = f.target(); f.p.dir = 1; f.p.y -= 40; return t && t.hint; });
  for (let i = 0; i < 30 && await p.evaluate(() => __G.field.busy); i++) { await p.keyboard.press('Enter'); await p.waitForTimeout(200); }
  console.log('동료를 대상으로 잡음:', tg);
  // 2) 강호 인물(구 노창)에게 이야기: 물어볼 거리 고르기
  for (const topic of ['요즘 어때?', '여기는 어때?', '네 이야기 좀 해 줘', '나를 어떻게 생각해?']) {
    await p.evaluate(() => { __G.field.busy = false; __G.field.run(() => __G.party.talkTo('c_gu')); }); await p.waitForTimeout(300); await click('이야기한다'); await p.waitForTimeout(200); await click(topic); await p.waitForTimeout(1500);
    lines.push(topic + ' → ' + (await p.locator('#dialog .txt').first().innerText().catch(() => '?')).replace(/\s+/g, ' ').slice(0, 80)); await adv(); for (let i = 0; i < 4; i++) { await p.keyboard.press('Enter'); await p.waitForTimeout(120); }
  }
  console.log(lines.join('\n'));
  // 3) 선물: 구 노창 매화주(아주 좋아함), 윤설 산삼(아주 좋아함)
  const before = await p.evaluate(() => ({ gu: __G.S.love.c_gu, yun: __G.S.love.yun }));
  await p.evaluate(() => { __G.field.busy = false; __G.field.run(() => __G.party.talkTo('c_gu')); }); await p.waitForTimeout(300); await click('선물을 준다'); await p.waitForTimeout(200); await click('매화주'); await p.waitForTimeout(400); for (let i = 0; i < 4; i++) { await p.keyboard.press('Enter'); await p.waitForTimeout(150); }
  await p.evaluate(() => { __G.field.busy = false; __G.field.run(() => __G.party.talkTo('yun')); }); await p.waitForTimeout(300); await click('선물을 준다'); await p.waitForTimeout(300); await p.locator('.list button', { hasText: '산삼' }).first().click(); await p.waitForTimeout(400); for (let i = 0; i < 4; i++) { await p.keyboard.press('Enter'); await p.waitForTimeout(150); }
  const after = await p.evaluate(() => ({ gu: __G.S.love.c_gu, yun: __G.S.love.yun, wine: __G.S.inv.plum_wine, gin: __G.S.inv.ginseng }));
  console.log('호감', JSON.stringify(before), '→', JSON.stringify(after));
  const ok = tg && tg.includes('구 노창') || tg && tg.includes('윤설'); const giftOk = after.gu >= before.gu + 15 && after.yun >= before.yun + 15;
  console.log(ok && giftOk && !errs.length ? '통과' : '실패'); console.log(errs.join('\n') || '오류 없음'); await b.close(); process.exit(ok && giftOk && !errs.length ? 0 : 1); })();
