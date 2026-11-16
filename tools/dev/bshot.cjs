// 건물 종류마다 바짝 붙어 찍기: [지도, 소품 이름, 시각]
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 720 } }); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(process.env.GAME_URL + '?hd2d=1'); await p.waitForFunction(() => window.__G && __G.dbg, null, { timeout: 60000 }); await p.waitForTimeout(1500);
  await p.evaluate(async () => { const G = __G; G.noSave = true; G.S = G.dbg.newState('나그네', 'BlueSamurai', 'm', 'normal'); document.querySelector('#screen').innerHTML = ''; G.bgDraw = null; G.auto = true; G.free.start(); for (let i = 0; i < 400 && G.field.busy; i++) await new Promise(r => setTimeout(r, 30)); G.auto = false; });
  const L = JSON.parse(process.env.B); let i = 0;
  for (const [map, name, time, orbit, zoom, up] of L) {
    const ok = await p.evaluate(async ([map, name, time, orbit, zoom, up]) => { const G = __G, f = G.field, H = G.hd, { MAPS } = await import('/gangho/js/maps.js'), T = await import('/gangho/js/tiles.js'); const m = MAPS[map];
      const [nm, ix] = name.split('#'); const s = m.stamps.filter(q => q.name === nm && !q.iso)[+ix || 0]; if (!s) return false; name = nm; const S = T.STAMPS[name]; f.busy = false; G.S.flags.night = false;
      f.load(map, (s.x + S[3] / 2) / 16 / (m.k || 1), (s.y + S[4] + 30) / 16 / (m.k || 1), 0); f.roam.length = 0; await new Promise(r => setTimeout(r, 300));
      H.setOpt('time', time || 'day'); H.setOpt('zoom', zoom || 7); f.p.x = s.x + S[3] / 2 + 20; f.p.y = s.y + S[4] + 26; H.peek = [s.x + S[3] / 2, s.y + S[4] - 10 - (up || 0) * 16]; H.orbit = orbit || 0;
      for (let k = 0; k < 200 && H.modelsPending; k++) { H.render(f); await new Promise(r => setTimeout(r, 50)); }
      for (let k = 0; k < 6; k++) { H.aim(f); H.render(f); await new Promise(r => setTimeout(r, 60)); } return true; }, [map, name, time, orbit, zoom, up]);
    await p.screenshot({ path: `/tmp/claude-0/shots/b_${String(i++).padStart(2, '0')}_${map}_${name}${orbit ? '_o' : ''}.png` }); if (!ok) console.log('없음', map, name); }
  await p.evaluate(() => { __G.hd.peek = null; __G.hd.orbit = 0; }); console.log(errs.join('\n') || '오류 없음'); await b.close(); })();
