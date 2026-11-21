// 화산귀환 인물에게 말을 걸고 같은 인물과 비무를 끝까지 치른다.
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/404|Failed to load/.test(m.text())) errs.push(m.text()); });
  await p.goto(process.env.GAME_URL); await p.waitForFunction(() => window.__G && __G.dbg, null, { timeout: 60000 }); await p.waitForTimeout(1500);
  const r = await p.evaluate(async () => { const G = __G, D = G.dbg; G.noSave = true; G.S = D.newState('나그네', 'BlueSamurai', 'm', 'normal'); document.querySelector('#screen').innerHTML = ''; G.bgDraw = null; G.auto = true; G.free.start(); for (let i = 0; i < 400 && G.field.busy; i++) await new Promise(r => setTimeout(r, 30));
    G.manual = true; G.speedup = 2000; G.bot = { skill: .9 }; Object.assign(G.S, { lv: 40, str: 80, con: 80 }); G.S.hp = 9999; const out = [], said = [];
    const { MAPS } = await import('/gangho/js/maps.js'); const orig = G.dialogSay;
    for (const [id, k] of [['b_hwasan', 'cheongmyeong'], ['b_hwasan', 'hyeonjong'], ['b_jongnam', 'jingeumryong'], ['b_dang', 'dangbo'], ['b_wudang', 'heodo']]) {
      G.world?.ensure?.(id); G.field.load(id, MAPS[id].w / 2, MAPS[id].h / 2, 0); await new Promise(r => setTimeout(r, 50)); const n = G.field.npcs.find(n => n.id === k); if (!n) { out.push(k + ' 없음'); continue; }
      G.autoPick = c => { const i=c.opts.findIndex(s=>s==='비무를 청한다'||s==='지도 대련을 청한다');return i>=0?i:0; };
      let fin = false; G.field.run(async () => { await n.talk(); fin = true; }); let i = 0; while (!fin && i++ < 4000) { G.fast(60); await new Promise(r => setTimeout(r, 0)); }
      out.push(`${k}: ${fin ? 'ok' : '멈춤'} ${G.lastOutcome || '비무 없음'}`); G.lastOutcome = null; G.scene = 'field'; G.field.busy = false;
    } return out; });
  console.log(r.join("\n")); console.log(errs.slice(0, 5).join("\n") || "오류 없음"); await b.close(); if (errs.length || r.some(x => /멈춤|없음/.test(x))) process.exit(1); })();
