// 새 화면 전투: 3D 무대가 뜨고, 싸움이 끝까지 돌고, 끝나면 마을이 다시 그려지는지. 새 화면을 끄면 3D 무대가 없어야 한다
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const errs = [], out = [], fail = [];
  for (const q of ['?hd2d=1', '']) {
    const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
    p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/404|Failed to load/.test(m.text())) errs.push(m.text()); });
    await p.goto(process.env.GAME_URL + q); await p.waitForFunction(() => window.__G && __G.dbg, null, { timeout: 60000 }); await p.waitForTimeout(1500);
    const r = await p.evaluate(async () => {
      const G = __G; G.noSave = true; G.S = G.dbg.newState('나그네', 'BlueSamurai', 'm', 'normal'); document.querySelector('#screen').innerHTML = ''; G.bgDraw = null; G.auto = true; G.free.start();
      for (let i = 0; i < 400 && G.field.busy; i++) await new Promise(r => setTimeout(r, 30));
      G.manual = true; G.speedup = 2000; G.bot = { skill: .9 }; Object.assign(G.S, { lv: 40, str: 60, con: 60, agi: 50 }); G.S.hp = 9999;
      const { fight } = await import('/gangho/js/battle.js'); const res = {};
      for (const ar of ['village', 'court', 'forest', 'dock', 'yard', 'ring', 'moon', 'snow', 'sand', 'fort', 'room']) {
        let done = null; fight({ foes: ['bandit', 'bandit'], allies: ['so_ally'], arena: ar, noIntro: true }).then(o => done = o);
        const B = G.battle; res[ar] = { stage: !!B.stage };
        let i = 0; while (!done && i++ < 3000) { G.fast(30); await new Promise(r => setTimeout(r, 0)); }
        res[ar].out = done?.outcome || '멈춤';
      }
      G.fast(2); await new Promise(r => setTimeout(r, 400)); G.fast(2); const gl = document.querySelector('#gl'); return { res, gl: gl ? gl.style.display : '없음', scene: G.scene, bb: G.hd.bbLeft?.() ?? 0 };
    });
    out.push(q + ' ' + JSON.stringify(r));
    for (const [k, v] of Object.entries(r.res)) { if (v.out !== 'win') fail.push(`${q} ${k}: ${v.out}`); if (v.stage !== (q === '?hd2d=1')) fail.push(`${q} ${k}: 3D 무대 ${v.stage}`); }
    if (r.bb) fail.push(`전투 뒤 마을에 전투 인물 ${r.bb}명이 남음`);
    if (q && r.gl !== 'block') fail.push('전투 뒤 새 화면이 안 보임: ' + r.gl);
    await p.close();
  }
  console.log(out.join('\n')); if (fail.length) console.log('실패\n' + fail.join('\n'));
  console.log(errs.slice(0, 5).join('\n') || 'no errors'); await b.close(); if (fail.length || errs.length) process.exit(1);
})().catch(e => { console.log(String(e).slice(0, 500)); process.exit(1); });
