// 6부 앞 두 장과 복선 회수: 네 길(정파·사파·마교·낭인) 모두 달거울의 글 → 두 번째 담판이 끝까지 돌고, 회상 대사가 오류 없이 나오는지
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 720 } }); const errs = [];
  p.on('pageerror', e => errs.push(e.message));
  await p.goto(process.env.GAME_URL); await p.waitForFunction(() => window.__G && __G.dbg, null, { timeout: 60000 }); await p.waitForTimeout(1000);
  const out = [];
  for (const [side, fl] of [['jeong', { jg_samaung: 1, sm_odok: 1, lion_debt: 1, fs_order: 1, sm_drink: 'poured' }], ['sa', { lion_debt: 1 }], ['ma', {}], ['free', { jg_date: 1, sm_drink: 'took' }]]) {
    out.push(await p.evaluate(async ([side, fl]) => {
      const G = __G, sl = t => new Promise(r => setTimeout(r, t)), run = async pr => { let d = false, e = null; pr.then(() => d = true, x => { e = x.message; d = true; }); for (let t = 0; t < 6000 && !d; t++) { G.fast(30); await sl(0); } return e || d; };
      G.noSave = true; G.S = G.dbg.newState('나그네', 'BlueSamurai', 'm', 'normal'); document.querySelector('#screen').innerHTML = ''; G.bgDraw = null; G.auto = true;
      G.scene = 'field'; G.field.load('cheongha', 22, 20, 0); for (let i = 0; i < 300 && G.field.busy; i++) await sl(30);
      G.manual = true; G.speedup = 2000; G.bot = { skill: .9 }; Object.assign(G.S, { lv: 26, side }); Object.assign(G.S.flags, fl);
      const r = [];
      for (const k of ['mirrorCh', 'secondTalk', 'soupBack', 'chiefBack', 'villageBack']) r.push(k + ':' + await run(G.p6[k]()));
      return { side, r, mirror: !!G.S.flags.w6_mirror, talk: !!G.S.flags.w6_talk, lion: !!G.S.flags.lion_w6 };
    }, [side, fl]));
  }
  console.log(JSON.stringify(out)); const fail = [];
  for (const o of out) { if (o.r.some(x => !x.endsWith(':true'))) fail.push(o.side + ' ' + o.r.join(' ')); if (!o.mirror || !o.talk) fail.push(o.side + ' 표시 없음'); }
  if (fail.length) console.log('실패\n' + fail.join('\n')); console.log(errs.join('\n') || 'no errors'); await b.close(); if (fail.length || errs.length) process.exit(1);
})();
