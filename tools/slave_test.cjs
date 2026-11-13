// 노예 시장: 이긴 적 묶기 → 노예상에게 넘기기(은자·악명), 사람 사서 집 하인으로 → 집에서 일 맡기기 → 다음 날 거둬들이기
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 720 } }); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(process.env.GAME_URL); await p.waitForFunction(() => window.__G && __G.dbg, null, { timeout: 60000 }); await p.waitForTimeout(1500);
  await p.evaluate(async () => { const G = __G; G.noSave = true; G.S = G.dbg.newState('나그네', 'BlueSamurai', 'm', 'normal'); document.querySelector('#screen').innerHTML = ''; G.bgDraw = null; G.auto = true; G.free.start(); for (let i = 0; i < 400 && G.field.busy; i++) await new Promise(r => setTimeout(r, 30)); G.auto = false; G.S.silver = 1000; G.S.flags.own_house = 1; G.S.house.lv = 1; G.S.flags.world_open = 1; G.field.busy = false; });
  const click = async t => { const q = p.locator('.choices button', { hasText: t }).first(); try { await q.waitFor({ timeout: 6000 }); } catch (e) { await p.screenshot({ path: '/tmp/slave_fail.png' }); console.log('못 찾음', t); throw e; } await q.click(); await p.waitForTimeout(250); };
  const skip = async () => { for (let i = 0; i < 12; i++) { if (await p.locator('.choices button').count()) return; if (!await p.evaluate(() => __G.field.busy)) return; await p.keyboard.press('Enter'); await p.waitForTimeout(160); } };
  const run = async f => { await p.evaluate(f); await p.waitForTimeout(500); if (await p.locator('.choices button', { hasText: '말을 건다' }).count()) await click('말을 건다'); };
  // 1) 묶기
  await run(() => { const G = __G, foes = G.free.group('bandit', 6, 2); G.field.busy = false; G.field.run(() => G.slave.capture({ foes })); });
  await click('묶어서'); await skip();
  const c1 = await p.evaluate(() => __G.S.captives.length); console.log('묶은 포로', c1);
  // 2) 광주 노예 시장에서 넘기기
  await p.evaluate(async () => { const G = __G; G.world.ensure('c_guangzhou'); G.field.busy = false; G.field.load('c_guangzhou', 51, 13, 1); await new Promise(r => setTimeout(r, 600)); });
  const s0 = await p.evaluate(() => ({ silver: __G.S.silver, sa: __G.S.rep.sa, jeong: __G.S.rep.jeong, slaver: !!__G.field.npcs.find(n => n.id === 'slaver') }));
  console.log('노예상 있음', s0.slaver);
  await run(() => { const f = __G.field; f.busy = false; f.run(f.npcs.find(n => n.id === 'slaver').talk); }); await skip();
  await click('포로를 넘긴다'); await skip(); await click('넘긴다'); await skip();
  const s1 = await p.evaluate(() => ({ silver: __G.S.silver, sa: __G.S.rep.sa, jeong: __G.S.rep.jeong, caps: __G.S.captives.length }));
  console.log('넘긴 뒤', JSON.stringify(s0), '→', JSON.stringify(s1));
  // 3) 사서 집 하인으로
  await run(() => { const f = __G.field; f.busy = false; f.run(f.npcs.find(n => n.id === 'slaver').talk); }); await skip();
  await click('사람을 산다'); const who = await p.locator('.choices button').first().innerText(); await p.locator('.choices button').first().click(); await p.waitForTimeout(300); await skip(); await click('치른다'); await skip(); await click('집 하인으로'); await skip();
  const sv = await p.evaluate(() => __G.S.servants.map(v => v.name + '/' + v.who)); console.log('산 사람', who, '→ 하인', sv.join(','));
  // 4) 집에서 일 맡기기, 다음 날
  await p.evaluate(async () => { const G = __G; const { buildHouse } = await import('/gangho/js/maps.js'); buildHouse(G.S); G.field.busy = false; G.field.load('myhouse', 5, 8, 1); await new Promise(r => setTimeout(r, 500)); });
  const hasNpc = await p.evaluate(() => !!__G.field.npcs.find(n => n.id === 'serv0')); console.log('집에 하인 있음', hasNpc);
  await run(() => { const f = __G.field; f.busy = false; f.run(f.npcs.find(n => n.id === 'serv0').talk); }); await skip(); await click('약초를 캔다'); await skip();
  const h0 = await p.evaluate(() => __G.S.inv.herb || 0); await p.evaluate(async () => { const { nextDay } = await import('/gangho/js/state.js'); nextDay(); }); const h1 = await p.evaluate(() => __G.S.inv.herb || 0);
  console.log('약초', h0, '→', h1);
  const ok = c1 === 2 && s1.silver > s0.silver && s1.caps === 0 && s1.sa > s0.sa && sv.length === 1 && hasNpc && h1 === h0 + 2 && !errs.length;
  console.log(ok ? '통과' : '실패'); console.log(errs.join('\n') || '오류 없음'); await b.close(); process.exit(ok ? 0 : 1); })();
