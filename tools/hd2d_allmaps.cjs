// 새 화면으로 바깥 지도를 하나씩 띄워 오류, 소품 수, 세우는 시간을 재고, 지도마다 한 장씩 찍는다
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 720 } }); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(process.env.GAME_URL + '?hd2d=1'); await p.waitForFunction(() => window.__G && __G.dbg, null, { timeout: 60000 }); await p.waitForTimeout(1500);
  await p.evaluate(async () => { const G = __G; G.noSave = true; G.S = G.dbg.newState('나그네', 'BlueSamurai', 'm', 'normal'); document.querySelector('#screen').innerHTML = ''; G.bgDraw = null; G.auto = true; G.free.start(); for (let i = 0; i < 400 && G.field.busy; i++) await new Promise(r => setTimeout(r, 30)); G.auto = false; });
  const ids = await p.evaluate(async () => { const { MAPS } = await import('/gangho/js/maps.js'); return Object.keys(MAPS).filter(id => { const m = MAPS[id]; return !m.room && !m.hasIso && !m.live && !m.isoRoom && !id.startsWith('r_') && !id.startsWith('h_'); }); });
  const only = process.env.ONLY ? process.env.ONLY.split(',') : null; let i = 0;
  for (const id of ids) { if (only && !only.includes(id)) continue; const e0 = errs.length;
    const r = await p.evaluate(async id => { const G = __G, f = G.field, { MAPS } = await import('/gangho/js/maps.js'); const m = MAPS[id]; f.busy = false; G.S.flags.night = false;
      // 걸을 수 있는 가운데쯤 자리
      let best = null; for (let y = 2; y < m.h - 2; y++) for (let x = 2; x < m.w - 2; x++) { if (m.blocked(x * 16 + 8, y * 16 + 8)) continue; const d = Math.hypot(x - m.w / 2, y - m.h / 2); if (!best || d < best[2]) best = [x, y, d]; }
      f.load(id, best[0] / (m.k || 1) + .5, best[1] / (m.k || 1) + .5, 0); f.roam.length = 0; await new Promise(r => setTimeout(r, 400)); G.hd.render(f); for (let k = 0; k < 200 && G.hd.modelsPending; k++) { G.hd.render(f); await new Promise(r => setTimeout(r, 50)); } for (let k = 0; k < 3; k++) { G.hd.render(f); await new Promise(r => setTimeout(r, 60)); }
      await new Promise(r => setTimeout(r, 1200)); return { act: G.hd.active(f.m), now: f.m.id, p: [Math.round(f.p.x / 16), Math.round(f.p.y / 16)], busy: f.busy, scene: G.scene, ...G.hd.stats() }; }, id);
    await p.screenshot({ path: `/tmp/claude-0/shots/m_${String(i++).padStart(2, '0')}_${id}.png` });
    console.log(id, r.now, r.p, r.busy, r.scene, r.act ? '새 화면' : '예전 화면', '소품', r.props, '덩어리', r.boxes, '세우기', r.buildMs + 'ms', errs.length > e0 ? '오류: ' + errs.slice(e0).join(' | ').slice(0, 200) : ''); }
  await b.close(); })();
