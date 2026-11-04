// 실제 키 입력으로 걷고, 건물에 들어갔다 나오고, 메뉴와 전투를 확인한다
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
  const errs = []; p.on('pageerror', e => errs.push('PAGE ' + e.message + ' ' + (e.stack || '').slice(0, 300))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto((process.env.GAME_URL || 'http://127.0.0.1:8123/index.html')); await p.waitForTimeout(1300);
  await p.click('#bNew'); await p.waitForTimeout(200); await p.click('#go'); await p.waitForTimeout(800);
  const st = () => p.evaluate(() => { const G = __G, f = G.field; return { map: f.m.id, x: +(f.p.x / 16).toFixed(1), y: +(f.p.y / 16).toFixed(1), busy: f.busy, step: G.S.flags.step, dlg: G.dbg.dialog.talking(), scene: G.scene, goal: G.S.goal }; });
  for (let i = 0; i < 40; i++) { await p.keyboard.press('e'); await p.waitForTimeout(90); if (!(await st()).dlg && i > 3) break; }
  console.log('after intro', await st());
  await p.evaluate(() => __G.field.p.x = 13.4 * 16); await p.evaluate(() => __G.field.p.y = 5.9 * 16); await p.evaluate(() => __G.field.p.dir = 3);
  await p.waitForTimeout(100); await p.screenshot({ path: '/tmp/claude-0/shots/w1.png' });
  await p.keyboard.press('e'); await p.waitForTimeout(400); console.log('talk', await st());
  for (let i = 0; i < 80; i++) { const s = await st(); if (s.scene === 'battle') break; await p.keyboard.press('e'); await p.waitForTimeout(70); }
  await p.waitForTimeout(1600); console.log('battle?', await st()); await p.screenshot({ path: '/tmp/claude-0/shots/w2.png' });
  // 장작 패기: 실제 키로 친다
  for (let i = 0; i < 70; i++) { const s = await st(); if (s.scene !== 'battle') break; const v = await p.evaluate(() => { const B = __G.battle; const T = B.actors.find(a => a.team === 1 && !a.dead); if (!T) return null; const dx = T.x - B.p.x, dy = T.y - B.p.y; return [dx, dy]; }); if (v) { const k = []; if (v[0] > 18) k.push('KeyD'); if (v[0] < -18) k.push('KeyA'); if (v[1] > 16) k.push('KeyS'); if (v[1] < -16) k.push('KeyW'); for (const c of k) await p.keyboard.down(c); await p.waitForTimeout(120); for (const c of k) await p.keyboard.up(c); } await p.keyboard.press('KeyJ'); await p.waitForTimeout(160); }
  await p.waitForTimeout(1500); await p.screenshot({ path: '/tmp/claude-0/shots/w3.png' }); console.log('after logs', await st());
  console.log(errs.slice(0, 8).join('\n')); await b.close();
})().catch(e => { console.log(String(e).slice(0, 800)); process.exit(1); });
