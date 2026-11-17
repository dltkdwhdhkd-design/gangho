// 2부 외문의 닷새: 네 가지 오후 일과 저녁 장면 다섯이 끝까지 돌고, 복선 두 개가 수첩에 남고, 경지는 많아야 둘 오르는지
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 720 } }); const errs = [];
  p.on('pageerror', e => errs.push(e.message));
  await p.goto(process.env.GAME_URL); await p.waitForFunction(() => window.__G && __G.dbg, null, { timeout: 60000 }); await p.waitForTimeout(1000);
  const r = await p.evaluate(async () => {
    const G = __G, sl = t => new Promise(r => setTimeout(r, t)); G.noSave = true; G.S = G.dbg.newState('나그네', 'BlueSamurai', 'm', 'normal'); document.querySelector('#screen').innerHTML = ''; G.bgDraw = null; G.auto = true; G.free.start();
    for (let i = 0; i < 400 && G.field.busy; i++) await sl(30);
    G.manual = true; G.speedup = 2000; G.bot = { skill: .9 }; Object.assign(G.S, { lv: 10, exp: 0 }); G.S.hp = 9999;
    const { fiveDays } = await import('/gangho/js/part2c.js'); const out = [];
    for (const seq of [[3, 1, 2, 0, 1], [0, 2, 3, 2, 3]]) {
      let i = 0; G.autoPick = c => /째 날/.test(c.text) ? seq[i++] : 0; for (const k of Object.keys(G.S.flags)) if (/^d5_|^days5|^fs_/.test(k)) delete G.S.flags[k];
      const lv0 = G.S.lv, n0 = G.S.notes.length; let done = false; fiveDays().then(() => done = true);
      for (let t = 0; t < 6000 && !done; t++) { G.fast(30); await sl(0); }
      out.push({ done, lv: [lv0, G.S.lv], torn: !!G.S.flags.fs_torn, dang: !!G.S.flags.fs_dang, notes: G.S.notes.length - n0, picks: i });
    }
    return out;
  });
  console.log(JSON.stringify(r)); const fail = [];
  for (const o of r) { if (!o.done) fail.push('닷새가 끝나지 않음'); if (!o.torn || !o.dang) fail.push('복선이 빠짐'); if (o.lv[1] - o.lv[0] > 2) fail.push('경지가 너무 오름 ' + o.lv); if (o.picks !== 5) fail.push('고른 날 ' + o.picks); }
  if (fail.length) console.log('실패\n' + fail.join('\n')); console.log(errs.join('\n') || 'no errors'); await b.close(); if (fail.length || errs.length) process.exit(1);
})();
