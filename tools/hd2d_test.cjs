// 새 화면(HD-2D, ?hd2d=1) 시험: 켜지는지, 지도가 오류 없이 그려지는지, 걸어 다니는 곳마다 주인공이 화면 안에 있는지,
// 건물 뒤로 들어가면 그 건물이 옅어지는지, 지도를 다시 세우는 데 얼마나 걸리는지 본다. 인물 키, 시각, 그림별로 화면을 찍는다
// 쓰는 법: GAME_URL=http://localhost:8000/ node tools/hd2d_test.cjs   (찍은 화면은 /tmp/claude-0/shots/hd2d_*.png)
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
  const errs = []; p.on('pageerror', e => errs.push('PAGE ' + e.message + ' ' + (e.stack || '').slice(0, 300))); p.on('console', m => { if (m.type() === 'error' && !/favicon|404/.test(m.text())) errs.push(m.text().slice(0, 300)); });
  const url = new URL(process.env.GAME_URL || 'http://localhost:8000/'); url.searchParams.set('hd2d', '1');
  await p.goto(url.href); await p.waitForTimeout(2500);
  const st = await p.evaluate(() => ({ ready: __G.hd.ready, failed: __G.hd.failed }));
  console.log('켜짐', JSON.stringify(st)); if (!st.ready) { console.log('WebGL2를 못 써서 2D로 돈다. 여기서 멈춘다'); console.log(errs.join('\n')); await b.close(); return; }
  await p.evaluate(() => { __G.hd.noGov = true; __G.hd.setOpt('art', 1); document.querySelector('#hdgo').click(); });
  await p.waitForFunction(() => __G.field?.m?.id === 'cheongha' && !__G.field.busy && !__G.auto, null, { timeout: 90000 });
  // 1) 걸어 다니는 칸마다 주인공 발과 머리가 화면 안에 있나(카메라가 따라붙은 뒤)
  const out = await p.evaluate(async () => {
    const G = __G, f = G.field, H = G.hd, sleep = ms => new Promise(r => setTimeout(r, ms)); G.manual = true;
    const m = f.m, pick = [], bad = []; for (let y = 1; y < m.h - 1; y += 2) for (let x = 1; x < m.w - 1; x += 3) if (!m.blocked(x * 16 + 8, y * 16 + 12)) pick.push([x, y]);  // 걸을 수 있는 칸을 고루
    for (const z of [9, 7, 6]) { H.setOpt('zoom', z);
      for (const [x, y] of pick) { f.p.x = x * 16 + 8; f.p.y = y * 16 + 12; H.aim(f);
        const [fx, fy] = H.proj(f.p.x, f.p.y, 0), [hx, hy] = H.proj(f.p.x, f.p.y, 15); if (fx < 20 || fx > 1260 || hy < 20 || fy > 700) bad.push(`${z}:${x},${y} 발(${fx | 0},${fy | 0}) 머리y ${hy | 0}`); }
      await sleep(0); }
    // 2) 건물 뒤: 객잔 지붕 뒤에 서면 객잔이 옅어진다
    const inn = f.m.stamps.find(s => s.name === 'inn');  // 좁힌 지도에서도 객잔 자리를 따라간다
    H.setOpt('zoom', 7); f.p.x = inn.x + 32; f.p.y = inn.y + 1.2 * 16; H.aim(f); const behind = H.stats().faded;
    f.p.x = inn.x + 32; f.p.y = inn.y + 5 * 16; H.aim(f); const front = H.stats().faded;
    // 3) 지도 다시 세우기
    f.load('cheongha', 22.5, 16, 0); H.render(f); const build = H.stats().buildMs;
    G.manual = false; return { tiles: pick.length, bad, behind, front, build, stats: H.stats() };
  });
  console.log(`칸 ${out.tiles}곳 × 인물 키 3가지: 화면 밖 ${out.bad.length}곳`); if (out.bad.length) console.log('  ' + out.bad.slice(0, 10).join('\n  '));
  console.log(`건물 뒤에 서면 옅어진 그림 ${out.behind}개(1개 이상이어야 함), 앞에 서면 ${out.front}개(0이어야 함)`);
  console.log(`지도 세우기 ${out.build}ms, 소품 ${out.stats.props}개, 그림 크기 ${out.stats.size}`);
  // 4) 찍기
  const shot = async n => { await p.waitForTimeout(400); await p.screenshot({ path: `/tmp/claude-0/shots/hd2d_${n}.png` }); };
  const go = (x, y, o) => p.evaluate(([x, y, o]) => { const G = __G, f = G.field, H = G.hd; for (const k in o) H.setOpt(k, o[k]); f.p.x = x * 16; f.p.y = y * 16; H.aim(f); H.render(f); }, [x, y, o]);
  for (const z of [9, 7, 6]) { await go(21, 22.6, { zoom: z, time: 'day' }); await shot('z' + z); }
  for (const t of ['morning', 'day', 'evening', 'night']) { await go(21, 13, { zoom: 7, time: t }); await shot('t_' + t); }
  const inn = await p.evaluate(() => { const s = __G.field.m.stamps.find(s => s.name === 'inn'); return [s.x / 16 + 2, s.y / 16 + 1.2]; }); await go(inn[0], inn[1], { zoom: 7, time: 'day' }); await shot('behind');
  await p.evaluate(() => { const f = __G.field; f.p.x = 4 * 16; f.p.y = 15.5 * 16; const n = f.npcs.slice().sort((a, b) => Math.hypot(a.x - f.p.x, a.y - f.p.y) - Math.hypot(b.x - f.p.x, b.y - f.p.y))[0]; if (n) f.bubble(n, '말풍선이 머리 위에 뜨는지 본다'); });
  await go(4, 15.5, { zoom: 9, time: 'day' }); await shot('exit');
  await p.evaluate(() => __G.hd.setOpt('art', 1)); await p.waitForTimeout(1500);
  for (const z of [9, 7, 6]) { await go(21, 22.6, { zoom: z, time: 'day' }); await shot('art_z' + z); }
  await go(21, 22.6, { zoom: 7, time: 'night' }); await shot('art_night');
  await p.evaluate(() => { __G.hd.setOpt('art', 1); __G.hd.setOpt('time', 'auto'); __G.hd.setOpt('zoom', 9); });
  console.log(errs.length ? '오류\n' + errs.slice(0, 10).join('\n') : '오류 없음'); await b.close();
})().catch(e => { console.log(String(e).slice(0, 800)); process.exit(1); });
