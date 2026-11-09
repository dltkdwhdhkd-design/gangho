// 저잣거리 살림살이: 걷는 사람, 좌판, 도박장, 노예 시장을 찍고 눌러 본다
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
  const errs = []; p.on('pageerror', e => errs.push('PAGE ' + e.message + ' ' + (e.stack || '').slice(0, 300))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 300)); });
  await p.goto(process.env.GAME_URL); await p.waitForTimeout(1800);
  const shot = async n => p.screenshot({ path: `/tmp/claude-0/shots/${n}.png` });
  await p.evaluate(() => { const G = __G; G.S = G.dbg.newState('진소', 'BlueSamurai', 'm', 'normal'); document.querySelector('#screen').innerHTML = ''; G.bgDraw = null; G.free.start(); G.auto = true; });
  await p.evaluate(async () => { const G = __G; for (let i = 0; i < 400 && G.field.busy; i++) { G.fast(30); await new Promise(r => setTimeout(r, 0)); } G.S.flags.night = false; G.field.load('c_guangzhou', 29.5, 25, 1); });
  await p.waitForTimeout(400);
  const at = async (x, y, n, sec = 4) => { await p.evaluate(([x, y]) => { const f = __G.field; f.p.x = x * 16; f.p.y = y * 16; }, [x, y]); for (let i = 0; i < sec * 2; i++) await p.evaluate(() => __G.fast(30)); await shot(n); };
  await at(30, 22, 's1', 6); await at(30, 29, 's2', 3); await at(16, 30, 's3', 3); await at(36, 38, 's4', 3); await at(51, 13, 's5', 3); await at(28, 38, 's6', 2);
  const info = await p.evaluate(() => { const f = __G.field; return f.npcs.map(n => `${n.id}:${(n.x / 16).toFixed(1)},${(n.y / 16).toFixed(1)}${n.hide > 0 ? 'H' : ''}${n.trip ? 'T' : ''}`).join(' '); });
  console.log(info);
  // 오래 돌려서 걷는 사람이 길에 붙어 다니는지, 막혀서 멈추지 않는지 본다
  const moved = await p.evaluate(() => { const f = __G.field, s = f.npcs.filter(n => n.life === 'stroll' || n.life === 'patrol').map(n => [n.id, n.x, n.y]); for (let i = 0; i < 60; i++) __G.fast(60); let hid = 0; const r = s.map(([id, x, y]) => { const n = f.npcs.find(q => q.id === id); if (n.hide > 0) hid++; return `${id}:${Math.round(Math.hypot(n.x - x, n.y - y) / 16)}`; }); return r.join(' ') + ' hidden ' + hid + ' grass ' + f.npcs.filter(n => (n.life === 'stroll' || n.life === 'patrol') && ![1, 3].includes(f.m.g[Math.floor((n.y - 4) / 16)]?.[Math.floor(n.x / 16)])).length; });
  console.log('moved', moved);
  // 도박장
  const r = await p.evaluate(async () => {
    const G = __G, sleep = () => new Promise(r => setTimeout(r, 0)), out = [], S = G.S; G.manual = true; G.auto = true; G.speedup = 2000; G.bot = { skill: .9 };
    const pump = async (cond, n = 3000) => { let i = 0; while (!cond() && i++ < n) { G.fast(60); await sleep(); } return i < n; };
    const run = async (name, fn, pick) => { G.autoPick = typeof pick === 'function' ? pick : () => pick; let fin = false, err = null; G.field.busy = false; G.field.run(async () => { try { await fn(); } catch (e) { err = e; } fin = true; }); const ok = await pump(() => fin); if (!ok) out.push('  상태 ' + JSON.stringify({ busy: G.field.busy, scene: G.scene, cur: G.dbg.dialog.talking(), dlg: document.querySelector('#dialog')?.innerText.slice(0, 80), modal: document.querySelector('#screen')?.innerText.slice(0, 80) })); out.push(`${name}: ${err ? '오류 ' + err.message + ' ' + (err.stack || '').slice(0, 200) : ok ? 'ok' : '멈춤 ' + G.scene}`); G.scene = 'field'; G.battle = null; };
    G.free.tick = () => {}; G.jh.storyTime = () => {}; S.silver = 5000; S.lv = 20; Object.assign(S, { str: 40, con: 40, agi: 30, inn: 30, weapon: 'blue_sword', weapons: ['blue_sword'], potion: 9, potionMax: 9 });
    G.field.load('r_guangzhou_gamble', 10, 11, 1); await pump(() => !G.field.busy, 300);
    out.push('도박장 ' + G.field.npcs.map(n => n.id).join(','));
    let k = 0; const s0 = S.silver; await run('홀짝', () => G.field.npcs.find(n => n.id === 'dealer').talk(), c => { k++; return k > 24 ? (c.opts.length - 1) : (c.opts.length === 2 ? k % 2 : 1); }); out.push(`은자 ${s0} → ${S.silver}, 오늘 ${S.daily.gam_guangzhou}`);
    G.field.load('c_guangzhou', 51, 12, 1); await pump(() => !G.field.busy, 300);
    out.push('시장 ' + G.field.npcs.filter(n => /^cap|slaver|sguard/.test(n.id)).map(n => n.id + '(' + n.hint + ')').join(','));
    S.fr.sect = { name: '청운문', guests: [], d: [], b: {} };
    await run('몸값', () => G.field.npcs.find(n => n.id === 'cap1').talk(), 0); out.push('남은 ' + G.field.npcs.filter(n => /^cap/.test(n.id)).map(n => n.id).join(',') + ' 손님 ' + JSON.stringify(S.fr.sect.guests.map(g => g.n + '/' + g.spr)));
    await run('습격', () => G.field.npcs.find(n => n.id === 'slaver').talk(), c => c.text.includes('노예상이다') ? 1 : 0); out.push('닫힘 ' + S.flags.slave_shut_guangzhou + ' 오늘 ' + S.day + ' 남은 ' + G.field.npcs.filter(n => /^cap|slaver/.test(n.id)).length + ' 손님 ' + S.fr.sect.guests.length + ' 소식 ' + S.fr.news[0]);
    for (const nm of ['stall_food', 'stall_junk', 'teller', 'perf', 'gatebeg', 'tout', 'guard0', 'kid0', 'old0', 'folk0', 'listen0', 'watch1']) { const n = G.field.npcs.find(q => q.id === nm); if (!n) { out.push(nm + ' 없음'); continue; } await run(nm, () => n.talk(), c => c.opts.length - 1); }
    await run('이야기2', () => G.field.npcs.find(n => n.id === 'teller').talk(), 0);
    await run('거지2', () => G.field.npcs.find(n => n.id === 'gatebeg').talk(), 0);
    G.field.load('r_guangzhou_inn', 9, 10, 1); await pump(() => !G.field.busy, 300); out.push('객잔 ' + G.field.npcs.map(n => n.id).join(','));
    for (const n of G.field.npcs.filter(q => q.id !== 'cinn')) await run(n.id, () => n.talk(), 0);
    S.flags.night = true; G.field.load('c_nakyang', 29.5, 25, 1); await pump(() => !G.field.busy, 300); out.push('밤 낙양 ' + G.field.npcs.map(n => n.id).join(','));
    S.flags.night = false; G.field.load('b_wudang', 22, 50, 1); await pump(() => !G.field.busy, 300); out.push('무당 ' + G.field.npcs.filter(n => n.life === 'stroll').map(n => n.id).join(','));
    return out.join('\n');
  });
  console.log(r);
  await p.evaluate(() => { const G = __G; G.autoPick = null; G.S.flags.night = false; G.field.load('r_guangzhou_gamble', 10, 11, 1); }); for (let i = 0; i < 6; i++) await p.evaluate(() => __G.fast(30)); await shot('s7');
  await p.evaluate(() => { __G.field.load('r_guangzhou_inn', 9, 10, 1); }); for (let i = 0; i < 6; i++) await p.evaluate(() => __G.fast(30)); await shot('s8');
  await p.evaluate(() => { __G.S.flags.slave_shut_changan = 0; __G.field.load('c_changan', 51, 12.5, 1); }); for (let i = 0; i < 8; i++) await p.evaluate(() => __G.fast(30)); await shot('s9');
  console.log(errs.slice(0, 8).join('\n')); await b.close();
})().catch(e => { console.log(String(e).slice(0, 800)); process.exit(1); });
