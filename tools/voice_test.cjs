// 거리 사람들의 말: 사람마다 말투가 다른지, 강호 사정과 내 평판에 따라 화제가 바뀌는지, 자리표가 비지 않는지 본다
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
  const errs = []; p.on('pageerror', e => errs.push('PAGE ' + e.message + ' ' + (e.stack || '').slice(0, 300))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 300)); });
  await p.goto(process.env.GAME_URL); await p.waitForFunction(() => window.__G && __G.dbg, null, { timeout: 30000 }); await p.waitForTimeout(800);
  const r = await p.evaluate(async () => {
    const G = __G, sleep = () => new Promise(r => setTimeout(r, 0)), out = [];
    G.manual = true; G.auto = true; G.speedup = 2000; G.S = G.dbg.newState('진소', 'BlueSamurai', 'm', 'normal'); document.querySelector('#screen').innerHTML = ''; G.bgDraw = null; const S = G.S;
    G.free.start(); let n = 0; while (G.field.busy && n++ < 2000) { G.fast(60); await sleep(); } G.free.tick = () => { };
    const SG = G.saga, g = SG.st(), V = G.voices, bad = [], all = new Set();
    G.world.ensure('c_nakyang'); G.field.load('c_nakyang', 30, 22, 1); for (let i = 0; i < 5; i++) G.fast(1);
    const folk = G.field.npcs.filter(q => /^folk/.test(q.id)); out.push('낙양 사람들: ' + folk.map(q => q.hint).join(', '));
    const VO = V.assign('c_nakyang', ['Villager', 'Woman', 'Greenman', 'Villager2', 'Villager4', 'OldWoman', 'Villager3']);
    const talk = (tag, k = 3) => { const L = []; VO.forEach((P, i) => { for (let j = 0; j < k; j++) { const t = V.line(`${tag}:${i}`, P.p, { map: 'c_nakyang', place: '낙양', local: ['낙양 이야기'] }); all.add(t); if (/[{}]|undefined|null/.test(t)) bad.push(t); L.push(`${P.who}: ${t}`); } }); return L; };
    const show = (title, L, n = 4) => out.push(`── ${title}\n` + L.filter((_, i) => i % 3 === 0).slice(0, n).join('\n'));
    show('평소', talk('a'));
    g.arcs = []; SG.debug.start('tourney'); show('대회 공고', talk('b'), 7);
    g.cool.jsw = 0; SG.debug.tension('js', 120); SG.debug.start('jsw'); SG.debug.next('jsw'); show('정사대전 중', talk('c'), 7);
    g.arcs = []; g.occ = { c_changan: { boss: '혈마 향주 박혈' } }; show('장안이 마교 손에', talk('d'), 7);
    g.occ = {}; S.fr.fame = 300; show('명성이 높을 때', talk('e'), 4);
    S.fr.infamy = 90; show('악명이 높을 때', talk('f'), 4);
    S.fr.infamy = 0; S.fr.fame = 0; const again = []; for (let j = 0; j < 4; j++) again.push(V.line('z:0', VO[0].p, { map: 'c_nakyang', place: '낙양' })); out.push('── 같은 사람에게 네 번\n' + again.join('\n'));
    out.push(`서로 다른 말 ${all.size}줄, 자리표가 빈 말 ${bad.length}줄 ${bad.slice(0, 3).join(' / ')}`);
    // 실제로 말 걸기
    G.field.refresh(); const f0 = G.field.npcs.find(q => q.id === 'folk0'); let fin = false, err = null; G.field.busy = false; G.field.run(async () => { try { await f0.talk(); } catch (e) { err = e; } fin = true; }); for (let i = 0; !fin && i < 3000; i++) { G.fast(60); await sleep(); }
    out.push('실제 대화 ' + (err ? 'ERR ' + err.message : fin ? 'ok' : '안 끝남'));
    return out;
  });
  console.log(r.join('\n')); console.log(errs.slice(0, 8).join('\n') || '오류 없음'); await b.close();
})();
