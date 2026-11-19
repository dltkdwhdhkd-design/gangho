// 본편에 새로 넣은 장면의 "두 번째 보기": playthrough는 늘 첫 보기만 골라서, 둘째 보기 쪽 대사와 깃발이 오류 없이 도는지 따로 본다
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 720 } }); const errs = [];
  p.on('pageerror', e => errs.push(e.message));
  await p.goto(process.env.GAME_URL); await p.waitForFunction(() => window.__G && __G.dbg, null, { timeout: 60000 }); await p.waitForTimeout(1000);
  const r = await p.evaluate(async () => {
    const G = __G, sl = t => new Promise(r => setTimeout(r, t)), run = async pr => { let d = false, e = null; Promise.resolve(pr).then(() => d = true, x => { e = x.message; d = true; }); for (let t = 0; t < 8000 && !d; t++) { G.fast(30); await sl(0); } return e || d; };
    // 갈림이 도는지만 본다. 싸움에서 막히지 않게 주인공을 세게 둔다(세기 재기는 playthrough.cjs SNAP=1)
    const fresh = async (map, x, y, fl, lv = 24) => { G.noSave = true; G.S = G.dbg.newState('나그네', 'BlueSamurai', 'm', 'normal'); document.querySelector('#screen').innerHTML = ''; G.bgDraw = null; G.auto = true; G.scene = 'field'; G.field.load(map, x, y, 0); for (let i = 0; i < 300 && G.field.busy; i++) await sl(30); G.manual = true; G.speedup = 2000; G.bot = { skill: .9 }; Object.assign(G.S, { lv, side: 'jeong', str: 70, con: 70, agi: 30, inn: 40, weapon: 'blue_sword', weapons: ['stick', 'iron_sword', 'blue_sword'] }); G.S.hp = 9999; Object.assign(G.S.flags, fl); G.autoPick = () => 1; };
    const out = {}, F = () => G.S.flags;
    // 1부: 비단옷 손님(아주머니에게 알린다)
    await fresh('inn', 8, 9, { step: 'p4', trained: true, lunch: true }, 5); G.field.load('inn', 8, 9, 0); for (let i = 0; i < 300 && G.field.busy; i++) await sl(30);
    const deed = G.field.npcs.find(n => n.id === 'deed'); out.deed = deed ? await run(deed.talk()) : 'npc 없음'; out.deedFlag = !!F().l_deed;
    // 3부: 남궁 혼담(본인한테 물어보라), 금봉 객잔 술(내가 따른다)
    await fresh('c_nanjing', 21, 18, { step: 't6', r3_at: 'nanjing' }, 14); out.nanjing = await run(G.r3.nanjing()); out.nanjingFlag = !!F().r3_nanjing || F().step !== 't6';
    await fresh('inn2', 9, 10, { step: 'c3c' }, 15); out.sm = await run(G.r3.smDrink()); out.smFlag = F().sm_drink;
    // 4부: 피난민(수레까지 빼앗는다)
    const p4c = await import('/gangho/js/part4c.js'); await fresh('valley', 20, 16, { step: 'jg1', l_deed: true }, 20); out.refuge = await run(p4c.refugees()); out.refugeFlag = !!F().jg_refuge;
    // 5부: 오독문(내가 막는다), 총단(모른다고 한다), 균열(회관을 지켜 달라)
    const p5c = await import('/gangho/js/part5c.js'); await fresh('b_odok', 23, 62, { step: 'jg3', jg_od_call: true }, 24); out.odok = await run(G.act5c.odok()); out.odokFlag = F().jg_od;
    await fresh('fort', 18, 22, { step: 'jg3' }, 24); out.sneak = await run(p5c.sneak()); out.sneakFlag = !!F().jg_sneak;
    await fresh('valley', 20, 16, { step: 'jg3' }, 24); out.rift = await run(p5c.rift()); out.riftFlag = F().jg_witness;
    return out;
  });
  console.log(JSON.stringify(r)); const fail = [];
  for (const k of ['deed', 'nanjing', 'sm', 'refuge', 'odok', 'sneak', 'rift']) if (r[k] !== true) fail.push(k + ': ' + r[k]);
  if (r.smFlag !== 'poured') fail.push('술: ' + r.smFlag); if (r.odokFlag !== 'me') fail.push('오독문: ' + r.odokFlag); if (r.riftFlag !== 'hall') fail.push('균열: ' + r.riftFlag);
  for (const k of ['deedFlag', 'refugeFlag', 'sneakFlag']) if (!r[k]) fail.push(k);
  if (fail.length) console.log('실패\n' + fail.join('\n')); console.log(errs.join('\n') || 'no errors'); await b.close(); if (fail.length || errs.length) process.exit(1);
})();
