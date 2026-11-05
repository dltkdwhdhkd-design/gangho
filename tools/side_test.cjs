// 곁가지 이야기를 한 번씩 끝까지 돌려 오류가 없는지 본다
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto(process.env.GAME_URL); await p.waitForTimeout(1500);
  const r = await p.evaluate(async () => {
    const G = __G, D = G.dbg; G.manual = true; G.auto = true; G.speedup = 2000; G.bot = { skill: .7 };
    G.S = D.newState('진소', 'BlueSamurai', 'm', 'normal'); document.querySelector('#screen').innerHTML = ''; G.bgDraw = null; G.scene = 'field';
    const S = G.S, F = S.flags, sleep = () => new Promise(r => setTimeout(r, 0)), out = [];
    Object.assign(S, { lv: 30, str: 40, con: 40, agi: 30, inn: 30, silver: 500, potion: 9, weapon: 'blue_sword', weapons: ['blue_sword'] }); S.hp = 9999;
    const play = async (name, map, step, fl, id, pick) => {
      Object.assign(F, { burned: true, step }, fl); G.field.load(map, 20, 20, 1); await sleep();
      const c = D.Story.content(map), n = c.npcs.find(x => x.id === id); if (!n) { out.push(name + ': NPC 없음'); return; }
      if (pick !== undefined) G.autoPick = () => pick; else G.autoPick = null;
      let fin = false; G.field.run(async () => { await n.talk(); fin = true; }); let i = 0;
      while (!fin && i++ < 4000) { G.fast(60); await sleep(); }
      out.push(`${name}: ${fin ? 'ok' : '멈춤 ' + G.scene}`); G.scene = 'field'; G.battle = null; G.field.busy = false;
    };
    await play('가짜 호 0', 'guhwa', 'c3c', { round: 1 }, 'ohbok', 0); delete F.ohbok;
    await play('가짜 호 2', 'guhwa', 'c3c', { round: 1 }, 'ohbok', 2);
    await play('양씨 진실', 'guhwa', 'c3c', {}, 'oldmom', 0); delete F.mom47;
    await play('양씨 거짓', 'guhwa', 'c3c', {}, 'oldmom', 1);
    await play('늙은 검객', 'ninehall', 'c3c', {}, 'oldsword', 0); delete F.old_done;
    await play('늙은 검객2', 'ninehall', 'c3c', {}, 'oldsword', 1);
    await play('왈패', 'guhwa', 'c3c', { kang: 1 }, 'thug');
    const h = G.side.hook; F.kang = 0; for (const [k, nm] of [['smith', '강씨 1'], ['doc', '왕진']]) { const f = h(k); if (!f) { out.push(nm + ': 없음'); continue; } let fin = false; G.field.run(async () => { await f(); fin = true; }); let i = 0; while (!fin && i++ < 3000) { G.fast(60); await sleep(); } out.push(nm + (fin ? ': ok' : ': 멈춤')); G.field.busy = false; }
    F.kang = 2; { const f = h('smith'); let fin = false; G.field.run(async () => { await f(); fin = true; }); let i = 0; while (!fin && i++ < 3000) { G.fast(60); await sleep(); } out.push('강씨 끝' + (fin ? ': ok ' + JSON.stringify(S.wplus) : ': 멈춤')); G.field.busy = false; }
    await play('신도', 'shrine', 'ma2', {}, 'believer'); await play('제단', 'shrine', 'ma2', {}, 'altar');
    for (const id of ['guyang', 'ogang', 'namhwa', 'manhwa']) await play(id, 'fort', 'sa2', {}, id);
    await play('물 긷기', 'cloudmt', 'c2b2', {}, 'ch_well', 0); await play('목인', 'cloudmt', 'c2b2', {}, 'ch_dummy', 1); await play('식당', 'cloudmt', 'c2b2', {}, 'ch_kitchen', 1);
    { Object.assign(F, { step: 'jg1', wanted: false }); G.field.load('cheongha', 20, 20, 1); await sleep(); const t = D.Story.content('cheongha').trigs.find(x => x.when()); let fin = false; if (t) G.field.run(async () => { await t.run(); fin = true; }); let i = 0; while (!fin && i++ < 2000) { G.fast(60); await sleep(); } out.push('수배 전단: ' + (fin ? 'ok' : '멈춤')); G.field.busy = false; }
    out.push(`baby=${F.baby} accs=${(S.accs || []).join()}`);
    return out;
  });
  console.log(r.join('\n')); console.log(errs.slice(0, 5).join('\n') || 'no errors'); await b.close();
})().catch(e => { console.log(String(e).slice(0, 500)); process.exit(1); });
