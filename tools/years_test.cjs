// 정마 대세: 여러 해를 돌려 마교나 무림맹이 완전히 무너지기까지 몇 해가 걸리는지, 무너진 뒤 얼마나 못 일어서는지 본다
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message + ' ' + (e.stack || '').slice(0, 300)));
  await p.goto(process.env.GAME_URL); await p.waitForFunction(() => window.__G && __G.dbg, null, { timeout: 30000 }); await p.waitForTimeout(800);
  const r = await p.evaluate(async () => {
    const G = __G, out = []; G.manual = true; G.auto = true; G.S = G.dbg.newState('진소', 'BlueSamurai', 'm', 'normal'); document.querySelector('#screen').innerHTML = ''; G.bgDraw = null; G.free.start(); for (let i = 0; i < 400 && G.field.busy; i++) { G.fast(30); await new Promise(r => setTimeout(r, 0)); } G.free.tick = () => { };
    const { nextDay } = await import('/gangho/js/state.js'); const SG = G.saga, g = SG.st(), fr = G.S.fr, YEARS = +(new URLSearchParams(location.search).get('y') || 6);
    // 1) 그냥 여러 해
    const log = []; let last = '';
    for (let d = 1; d <= 365 * YEARS; d++) { nextDay(); const h = g.hist.find(x => /정마대전 —|멸문|붕괴/.test(x)); if (h && h !== last) { last = h; log.push(h); } }
    out.push(`${YEARS}해 동안 정마 판: ` + log.reverse().join(' / ')); out.push('지금 대세 ' + g.dm + ' 마교 무너짐 ' + G.jh.fallen('cheonma'));
    // 1-2) 나 없이 붙은 정마대전 이백 번: 무림맹이 몇 번 이기나(대세는 매번 0에서)
    { let w = 0; for (let i = 0; i < 200; i++) { g.arcs = []; g.occ = {}; for (const k in fr.fallen) delete fr.fallen[k]; g.ruin = {}; fr.power.cheonma = 100; g.dm = 0; g.cool.demon = 0; SG.debug.tension('jm', 120); SG.debug.start('demon'); const a = SG.arc('demon'); if (!a) continue; for (let k = 0; k < 3; k++) SG.debug.next('demon'); for (let k = 0; k < 8; k++) { a.left = 9; G.saga.debug.tick?.(a); } SG.debug.next('demon'); if (g.lastDemon.win) w++; } out.push('나 없이 무림맹 승률 ' + w / 2 + '%'); }
    // 2) 대세가 무림맹 쪽 2일 때 한 번 더 이기면 멸문
    g.arcs = []; g.occ = {}; for (const k in fr.fallen) delete fr.fallen[k]; g.ruin = {}; fr.power.cheonma = 120; g.dm = 2; g.cool.demon = 0; SG.debug.tension('jm', 120); SG.debug.start('demon'); const d = SG.arc('demon');
    for (let i = 0; i < 3; i++) SG.debug.next('demon'); d.finalWon = 1; SG.debug.next('demon');
    out.push('멸문: 마교 무너짐 ' + G.jh.fallen('cheonma') + ' 대세 ' + g.dm + ' / ' + g.hist[0]);
    for (let i = 0; i < 400; i++) nextDay(); out.push('400일 뒤 마교 무너짐 ' + G.jh.fallen('cheonma'));
    for (let i = 0; i < 360; i++) nextDay(); out.push('760일 뒤 마교 무너짐 ' + G.jh.fallen('cheonma') + ' / ' + (fr.news.find(n => /잔당|다시 일어섰다/.test(n)) || ''));
    // 3) 무림맹 쪽이 셋 지면 붕괴
    g.arcs = []; g.occ = {}; g.ruin = {}; for (const k in fr.fallen) delete fr.fallen[k]; fr.power.cheonma = 150; g.dm = -2; g.cool.demon = 0; SG.debug.tension('jm', 120); SG.debug.start('demon'); const d2 = SG.arc('demon'); d2.score = -99;
    for (let i = 0; i < 4; i++) SG.debug.next('demon'); out.push('붕괴: ' + g.hist[0] + ' 점령 ' + Object.keys(g.occ).join(',') + ' 무너진 정파 ' + Object.keys(fr.fallen).join(','));
    for (let i = 0; i < 30; i++) nextDay(); out.push('30일 뒤 여전히 무너짐 ' + Object.keys(fr.fallen).length + ' 점령 ' + Object.keys(g.occ).length);
    // 4) 습격으로는 마교가 안 무너진다
    g.ruin = {}; for (const k in fr.fallen) delete fr.fallen[k]; G.jh.hurt('cheonma', 999); out.push('습격 999에도 마교 무너짐 ' + G.jh.fallen('cheonma') + ' 힘 ' + fr.power.cheonma);
    return out;
  });
  console.log(r.join('\n')); console.log(errs.slice(0, 5).join('\n') || '오류 없음'); await b.close();
})();
