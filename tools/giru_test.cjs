// 기루: 고을마다 기루가 서고, 포주·기녀·손님이 있다. 술상, 몸값 치르기(풀어 줌), 도망친 기녀(현상금), 노예 시장의 포주 수하
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 720 } }); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(process.env.GAME_URL); await p.waitForFunction(() => window.__G && __G.dbg, null, { timeout: 60000 }); await p.waitForTimeout(1500);
  await p.evaluate(async () => { const G = __G; G.noSave = true; G.S = G.dbg.newState('나그네', 'BlueSamurai', 'm', 'normal'); document.querySelector('#screen').innerHTML = ''; G.bgDraw = null; G.auto = true; G.free.start(); for (let i = 0; i < 400 && G.field.busy; i++) await new Promise(r => setTimeout(r, 30)); G.auto = false; G.S.silver = 5000; G.S.flags.world_open = 1; G.field.busy = false; });
  const click = async t => { const q = p.locator('.choices button', { hasText: t }).first(); try { await q.waitFor({ timeout: 6000 }); } catch (e) { await p.screenshot({ path: '/tmp/giru_fail.png' }); console.log('못 찾음', t); throw e; } await q.click(); await p.waitForTimeout(250); };
  const skip = async () => { for (let i = 0; i < 14; i++) { if (await p.locator('.choices button').count()) return; if (!await p.evaluate(() => __G.field.busy)) return; await p.keyboard.press('Enter'); await p.waitForTimeout(160); } };
  const talk = async id => { await p.evaluate(id => { const f = __G.field; f.busy = false; f.run(f.npcs.find(n => n.id === id).talk); }, id); await p.waitForTimeout(500); if (await p.locator('.choices button', { hasText: '말을 건다' }).count()) await click('말을 건다'); await skip(); };
  const go = (map, x, y) => p.evaluate(async ([map, x, y]) => { const G = __G; G.world.ensure('c_guangzhou'); G.field.busy = false; G.field.load(map, x, y, 1); await new Promise(r => setTimeout(r, 600)); }, [map, x, y]);
  await go('c_guangzhou', 30, 30);
  const town = await p.evaluate(() => ({ label: (__G.field.m.labels || []).some(l => l.text === '해월루'), door: __G.field.m.portals.some(q => q.to === 'r_guangzhou_home4'), mook: !!__G.field.npcs.find(n => n.id === 'giru_mook') }));
  console.log('고을', JSON.stringify(town));
  await go('r_guangzhou_home4', 7, 8);
  const inside = await p.evaluate(() => __G.field.npcs.map(n => n.id + ':' + n.hint)); console.log('기루 안', inside.join(', '));
  await p.screenshot({ path: '/tmp/claude-0/shots/giru_in.png' });
  // 술상
  const pot0 = await p.evaluate(() => { __G.S.potion = 0; return __G.S.silver; });
  await talk('pimp'); await click('술상'); await skip();
  const pot1 = await p.evaluate(() => ({ potion: __G.S.potion, silver: __G.S.silver }));
  console.log('술상', pot0, '→', JSON.stringify(pot1));
  // 몸값 치르고 풀어 주기
  await talk('pimp'); await click('몸값'); const who = (await p.locator('.choices button').first().innerText()).split(' ')[0]; await p.locator('.choices button').first().click(); await p.waitForTimeout(300); await skip(); await click('치른다'); await skip(); await click('풀어 준다'); await skip();
  const left = await p.evaluate(() => __G.field.npcs.filter(n => /^gi\d/.test(n.id)).length); console.log('빼낸 기녀', who, '남은 기녀', left);
  // 도망: 남은 기녀 하나가 도망친 날
  await p.evaluate(() => { const S = __G.S; const k = Object.keys(S.flags).filter(k => k.startsWith('giru_out_guangzhou_')).map(k => +k.split('_').pop()); S.flags.giru_run = null; S.daily = {}; });
  await p.evaluate(async () => { const { giruNpcs } = await import('/gangho/js/giru.js'); const out = { npcs: [] }; for (let i = 0; i < 60 && !__G.S.flags.giru_run; i++) { __G.S.daily = {}; giruNpcs({ id: 'guangzhou' }, 'x', out); } });
  const run = await p.evaluate(() => __G.S.flags.giru_run); console.log('도망', JSON.stringify(run));
  await go('c_guangzhou', 50, 34);
  const rn = await p.evaluate(() => { const n = __G.field.npcs.find(n => n.id === 'runaway'); return n && !__G.field.m.blocked(n.x, n.y + 4) && !__G.field.m.blocked(n.x + 16, n.y + 4); }); console.log('숨은 기녀 있음(걸어 닿음)', rn);
  const s0 = await p.evaluate(() => __G.S.silver); await talk('runaway'); await click('끌고 간다'); await skip(); const s1 = await p.evaluate(() => ({ silver: __G.S.silver, run: __G.S.flags.giru_run }));
  console.log('현상금', s0, '→', JSON.stringify(s1));
  const ok = town.label && town.door && town.mook && inside.filter(t => t.startsWith('gi')).length === 3 && inside.some(t => t.startsWith('pimp')) && pot1.potion > 0 && pot1.silver === pot0 - 40 && left === 2 && run && rn && s1.silver > s0 && !s1.run && !errs.length;
  console.log(ok ? '통과' : '실패'); console.log(errs.join('\n') || '오류 없음'); await b.close(); process.exit(ok ? 0 : 1); })();
