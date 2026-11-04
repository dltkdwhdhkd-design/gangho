// 낚시 놀이를 실제 키로 플레이해 보고 성공할 수 있는지 확인한다
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
  const errs = []; p.on('pageerror', e => errs.push('PAGE ' + e.message));
  await p.goto(process.env.GAME_URL); await p.waitForTimeout(1300);
  await p.evaluate(() => { const G = __G, D = G.dbg; G.S = D.newState('진소', 'BlueSamurai', 'm', 'normal'); G.S.flags = { burned: true, rod: true, step: 'c1c' }; document.querySelector('#screen').innerHTML = ''; G.bgDraw = null; G.scene = 'field'; G.field.load('cheongha', 22, 30, 1); });
  let wins = 0, tries = +(process.argv[2] || 3), shot = false;
  for (let t = 0; t < tries; t++) {
    await p.evaluate(() => { window.__fr = null; __G.life.fishing('river').then(r => window.__fr = r); });
    for (let i = 0; i < 80; i++) { if (await p.evaluate(() => document.querySelector('#fm')?.textContent === '입질이다!')) break; await p.waitForTimeout(50); }
    await p.keyboard.down('KeyE'); await p.waitForTimeout(60); await p.keyboard.up('KeyE');
    let down = false;
    for (let i = 0; i < 400; i++) {
      const st = await p.evaluate(() => { if (window.__fr !== null) return null; const z = document.querySelector('#fz'), f = document.querySelector('#ff'); if (!z || !f) return { wait: 1 }; const zb = parseFloat(z.style.bottom), zh = parseFloat(z.style.height), fb = parseFloat((f.style.bottom.match(/([\d.]+)%/) || [0, 50])[1]); return { c: zb + zh / 2, f: fb }; });
      if (st === null) break; if (st.wait) { await p.waitForTimeout(30); continue; }
      const want = st.f > st.c; if (want !== down) { if (want) await p.keyboard.down('KeyE'); else await p.keyboard.up('KeyE'); down = want; }
      if (i === 40 && !shot) { shot = true; await p.screenshot({ path: '/tmp/claude-0/shots/l9.png' }); }
      await p.waitForTimeout(40);
    }
    if (down) await p.keyboard.up('KeyE');
    const r = await p.evaluate(() => window.__fr); if (r) wins++; await p.waitForTimeout(150);
  }
  console.log('낚시 성공', wins, '/', tries, errs.join(' ')); await b.close();
})().catch(e => { console.log(String(e).slice(0, 700)); process.exit(1); });
