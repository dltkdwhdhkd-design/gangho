// 사람이 소품 뒤에 가려지는지 본다: 지도마다 서 있는 사람(제자리 사람)의 도트가 그 뒤에 그려지는 소품에 얼마나 덮이는지 센다
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage();
  const errs = []; p.on('pageerror', e => errs.push('PAGE ' + e.message));
  await p.goto(process.env.GAME_URL); await p.waitForTimeout(2000);
  const r = await p.evaluate(async (mode) => {
    const G = __G, sleep = () => new Promise(r => setTimeout(r, 0)), { STAMPS, drawStamp } = await import('./js/tiles.js'), { MAPS } = await import('./js/maps.js'), { LOCS } = await import('./js/worlddata.js'), { drawActorSprite } = await import('./js/core.js');
    G.manual = true; G.auto = true; G.S = G.dbg.newState('진소', 'BlueSamurai', 'm', 'normal'); document.querySelector('#screen').innerHTML = ''; G.bgDraw = null;
    if (mode === 'free') { G.free.start(); for (let i = 0; i < 400 && G.field.busy; i++) { G.fast(30); await sleep(); } G.free.tick = () => {}; }
    else { G.scene = 'field'; G.S.flags = { step: 'c3b', met_yun: true, met_so: true, boat_guhwa: true, burned: true, world_open: true, world_tip: 1 }; }
    G.S.flags.night = false;
    const A = document.createElement('canvas'), B = document.createElement('canvas'); A.width = A.height = B.width = B.height = 16; const a = A.getContext('2d', { willReadFrequently: true }), bb = B.getContext('2d', { willReadFrequently: true });
    const out = [], seen = new Set(), check = id => {
      if (seen.has(id)) return; seen.add(id);
      try { G.world.ensure(id); if (!MAPS[id]) return; G.field.load(id, 5, 5, 1); } catch (e) { out.push(`${id}: 불러오기 오류 ${e.message}`); return; }
      const m = G.field.m, st = m.objs || m.stamps || [];
      for (const n of G.field.npcs) {
        if (n.stamp || !n.spr || n.hide > 0) continue;
        const x0 = n.x - 8, y0 = n.y - 15; a.clearRect(0, 0, 16, 16); bb.clearRect(0, 0, 16, 16);
        a.save(); a.translate(-x0, -y0); drawActorSprite(a, 'chars/' + n.spr, n.dir || 0, 0, n.x, n.y, { size: n.size }); a.restore();
        bb.save(); bb.translate(-x0, -y0); let any = [];
        for (const s of st) { const S = STAMPS[s.name]; if (!S || s.base <= n.y) continue; if (s.x > n.x + 8 || s.x + S[3] < n.x - 8 || s.y > n.y + 1 || s.y + S[4] < n.y - 15) continue; drawStamp(bb, s.name, s.x, s.y); any.push(s.name); }
        bb.restore(); if (!any.length) continue;
        const da = a.getImageData(0, 0, 16, 16).data, db = bb.getImageData(0, 0, 16, 16).data; let tot = 0, cov = 0;
        for (let i = 3; i < da.length; i += 4) if (da[i] > 100) { tot++; if (db[i] > 100) cov++; }
        if (tot && cov / tot > .3) out.push(`${id} ${n.id}(${n.hint || ''}) ${(n.x / 16).toFixed(1)},${(n.y / 16).toFixed(1)} ${Math.round(cov / tot * 100)}% ← ${[...new Set(any)].join(',')}`);
      }
    };
    for (const l of LOCS) check(l.map);
    for (const id of Object.keys(MAPS)) if (id !== 'world') check(id);
    return out.join('\n') + `\n지도 ${seen.size}곳`;
  }, process.argv[2] || 'free');
  console.log(r); console.log(errs.slice(0, 5).join('\n')); await b.close();
})().catch(e => { console.log(String(e).slice(0, 500)); process.exit(1); });
