// 3부 강을 따라: 네 고을을 고른 순서대로 돌고(! 표시 사람에게 말 걸기) 구화성(c3a)으로 넘어가는지, 복선이 수첩에 남는지
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 720 } }); const errs = [];
  p.on('pageerror', e => errs.push(e.message));
  await p.goto(process.env.GAME_URL); await p.waitForFunction(() => window.__G && __G.dbg, null, { timeout: 60000 }); await p.waitForTimeout(1000);
  const out = [];
  for (const order of [[0, 0, 0], [3, 1, 0]]) {
    out.push(await p.evaluate(async order => {
      const G = __G, sl = t => new Promise(r => setTimeout(r, t)), run = async pr => { let d = false; pr.then(() => d = true); for (let t = 0; t < 9000 && !d; t++) { G.fast(30); await sl(0); } return d; };
      G.noSave = true; G.S = G.dbg.newState('나그네', 'BlueSamurai', 'm', 'normal'); document.querySelector('#screen').innerHTML = ''; G.bgDraw = null; G.auto = true;
      G.scene = 'field'; G.field.load('hwasan', 22, 11.5, 2); for (let i = 0; i < 300 && G.field.busy; i++) await sl(30);
      G.manual = true; G.speedup = 2000; G.bot = { skill: .9 }; Object.assign(G.S, { lv: 14 }); G.S.flags.step = 't5';
      let i = 0; const seen = []; G.autoPick = c => /어디/.test(c.text) ? order[i++] ?? 0 : 0;
      if (!await run(G.r3.roadStart())) return { err: 'start' };
      for (let k = 0; k < 4 && G.S.flags.step === 't6'; k++) {
        const n = G.field.npcs.find(n => n.id.startsWith('r3_') && n.mark?.()); seen.push(G.field.m.id); if (!n) return { err: 'no npc', map: G.field.m.id, seen };
        if (!await run(n.talk())) return { err: 'talk', map: G.field.m.id, seen };
      }
      const N = G.S.notes.join('|');
      return { step: G.S.flags.step, seen, map: G.field.m.id, rice: N.includes('사람 수보다'), order: N.includes('이월 초사흘'), poison: N.includes('칠일소혼산') };
    }, order));
  }
  // 구화성 금봉 객잔 합석 → 5부 패천도가 알아보는지
  const sm = await p.evaluate(async () => {
    const G = __G, sl = t => new Promise(r => setTimeout(r, t)), run = async pr => { let d = false; pr.then(() => d = true); for (let t = 0; t < 3000 && !d; t++) { G.fast(30); await sl(0); } return d; };
    G.S.flags.step = 'c3c'; G.field.load('inn2', 9, 10, 0); for (let i = 0; i < 300 && G.field.busy; i++) await sl(30);
    const n = G.field.npcs.find(n => n.id === 'sm_guest'); if (!n) return { err: 'no sm_guest' };
    if (!await run(n.talk())) return { err: 'sm talk' };
    if (!await run(G.ch5.samaungEcho())) return { err: 'echo' };
    return { sm: G.S.flags.sm_drink };
  });
  console.log(JSON.stringify(out), JSON.stringify(sm)); const fail = [];
  if (sm.err || !sm.sm) fail.push('금봉 객잔 합석: ' + JSON.stringify(sm));
  for (const o of out) { if (o.err) fail.push(JSON.stringify(o)); else { if (o.step !== 'c3a' && !String(o.step).startsWith('c3')) fail.push('구화성으로 안 넘어감 ' + o.step); if (!o.rice || !o.order || !o.poison) fail.push('복선 빠짐'); if (new Set(o.seen).size !== 4) fail.push('네 고을을 다 안 돎 ' + o.seen); } }
  if (out[0].seen && out[1].seen && out[0].seen.join() === out[1].seen.join()) fail.push('고른 순서가 반영 안 됨');
  if (fail.length) console.log('실패\n' + fail.join('\n')); console.log(errs.join('\n') || 'no errors'); await b.close(); if (fail.length || errs.length) process.exit(1);
})();
