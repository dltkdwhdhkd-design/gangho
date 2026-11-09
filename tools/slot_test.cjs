// 저장 칸: 저장, 다른 곳으로 움직인 뒤 불러오기, 제목 화면에서 불러오기, 지우기, 내보내기
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ acceptDownloads: true }); const p = await ctx.newPage({ viewport: { width: 1280, height: 720 } });
  const errs = []; p.on('pageerror', e => errs.push('PAGE ' + e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 200)); });
  await p.goto(process.env.GAME_URL); await p.waitForTimeout(1500); await p.evaluate(() => localStorage.clear());
  await p.evaluate(async () => { const G = __G; G.manual = true; G.auto = true; G.S = G.dbg.newState('진소', 'BlueSamurai', 'm', 'normal'); document.querySelector('#screen').innerHTML = ''; G.bgDraw = null; G.free.start(); for (let i = 0; i < 400 && G.field.busy; i++) { G.fast(30); await new Promise(r => setTimeout(r, 0)); } G.free.tick = () => {}; G.field.load('c_nakyang', 29.5, 25, 1); G.fast(5); });
  const out = [];
  const st = () => p.evaluate(() => ({ map: __G.S.map, x: Math.round(__G.field.p.x / 16), y: Math.round(__G.field.p.y / 16), silver: __G.S.silver, day: __G.S.day }));
  await p.evaluate(() => { __G.S.silver = 777; __G.field.p.x = 33 * 16; __G.field.p.y = 30 * 16; });
  await p.keyboard.press('Escape'); await p.evaluate(() => __G.fast(2)); await p.click('.tabs button[data-t=save]');
  await p.click('.slotc[data-i="0"] [data-a=save]'); await p.waitForTimeout(200);
  out.push('칸0 ' + JSON.stringify(await p.evaluate(() => { const r = JSON.parse(localStorage.getItem('gangho_slot_0')); return { m: r.meta.place, day: r.meta.day, shot: r.meta.shot.length, size: JSON.stringify(r).length, silver: r.data.silver, px: r.data.px / 16 }; })));
  await p.screenshot({ path: '/tmp/claude-0/shots/slot1.png' });
  // 덮어쓰기는 두 번 눌러야 한다
  await p.click('.slotc[data-i="0"] [data-a=save]'); out.push('한 번 누름: ' + await p.textContent('.slotc[data-i="0"] [data-a=save]'));
  await p.click('.tabs .x'); await p.evaluate(() => { __G.S.silver = 5; __G.field.load('c_suzhou', 30, 30, 1); __G.fast(3); });
  out.push('바꾼 뒤 ' + JSON.stringify(await st()));
  await p.keyboard.press('Escape'); await p.evaluate(() => __G.fast(2)); await p.click('.tabs button[data-t=save]');
  await p.click('.slotc[data-i="0"] [data-a=load]'); await p.click('.slotc[data-i="0"] [data-a=load]'); await p.evaluate(() => __G.fast(5));
  out.push('불러온 뒤 ' + JSON.stringify(await st()) + ' 메뉴 ' + await p.evaluate(() => __G.menuOpen));
  // 내보내기
  await p.keyboard.press('Escape'); await p.evaluate(() => __G.fast(2)); await p.click('.tabs button[data-t=save]');
  const [dl] = await Promise.all([p.waitForEvent('download'), p.click('.slotc[data-i="0"] [data-a=exp]')]); out.push('내보낸 파일 ' + dl.suggestedFilename());
  await p.click('.tabs .x');
  // 제목 화면에서 불러오기
  await p.evaluate(() => { __G.S.silver = 1; __G.field.load('c_seongdo', 30, 30, 1); }); await p.keyboard.press('Escape'); await p.evaluate(() => __G.fast(2)); await p.click('.tabs button[data-t=set]'); await p.click('#tt'); await p.waitForTimeout(300);
  await p.click('#bSlot'); await p.waitForTimeout(200); await p.screenshot({ path: '/tmp/claude-0/shots/slot2.png' });
  await p.click('.slotc[data-i="0"] [data-a=load]'); await p.click('.slotc[data-i="0"] [data-a=load]'); await p.evaluate(() => __G.fast(5)); out.push('제목에서 불러온 뒤 ' + JSON.stringify(await st()));
  await p.keyboard.press('Escape'); await p.evaluate(() => __G.fast(2)); await p.click('.tabs button[data-t=save]');
  await p.click('.slotc[data-i="0"] [data-a=del]'); await p.click('.slotc[data-i="0"] [data-a=del]'); out.push('지운 뒤 ' + await p.evaluate(() => localStorage.getItem('gangho_slot_0')));
  console.log(out.join('\n')); console.log(errs.join('\n')); await b.close();
})().catch(e => { console.log(String(e).slice(0, 600)); process.exit(1); });
