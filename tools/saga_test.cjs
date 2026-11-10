// 무림 정세: 날을 빠르게 돌려 큰 판이 시작부터 끝까지 도는지, 그리고 대회, 정사대전, 정마대전에 직접 끼어들어 본다
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
  const errs = []; p.on('pageerror', e => errs.push('PAGE ' + e.message + ' ' + (e.stack || '').slice(0, 400))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 300)); });
  await p.goto(process.env.GAME_URL); await p.waitForFunction(() => window.__G && __G.dbg, null, { timeout: 30000 }); await p.waitForTimeout(800);
  const r = await p.evaluate(async () => {
    const G = __G, D = G.dbg, sleep = () => new Promise(r => setTimeout(r, 0)), out = [];
    G.manual = true; G.auto = true; G.speedup = 2000; G.bot = { skill: .95 };
    G.S = D.newState('진소', 'BlueSamurai', 'm', 'normal'); document.querySelector('#screen').innerHTML = ''; G.bgDraw = null; const S = G.S;
    G.free.start(); let n = 0; while (G.field.busy && n++ < 2000) { G.fast(60); await sleep(); }
    G.free.tick = () => { };
    const { nextDay } = await import('/gangho/js/state.js');
    const run = async (name, fn, pick) => { G.autoPick = pick === undefined ? null : pick; let fin = false, err = null; G.field.busy = false; G.field.run(async () => { try { await fn(); } catch (e) { err = e; } fin = true; }); let i = 0; while (!fin && i++ < 12000) { G.fast(60); await sleep(); } if (err || !fin) out.push(`${name}: ${err ? 'ERR ' + err.message + ' ' + (err.stack || '').slice(0, 300) : '안 끝남'}`); return !err && fin; };
    const by = t => c => { const i = c.opts.findIndex(o => o.startsWith(t)); return i >= 0 ? i : 0; };
    const SG = G.saga, g = SG.st();
    // 1) 백이십 일을 그냥 흘려 보낸다
    const seen = {}, cnt = {}, at = {}, ids = new Set(); for (let d = 1; d <= 365; d++) { nextDay(); for (const a of g.arcs) { (seen[a.kind] = seen[a.kind] || new Set()).add(a.phase); if (!ids.has(a.id)) { ids.add(a.id); cnt[a.kind] = (cnt[a.kind] || 0) + 1; (at[a.kind] = at[a.kind] || []).push(S.day); } } if (d === 120) out.push('120일까지 열린 판: ' + JSON.stringify(cnt)); }
    out.push('한 해 동안 열린 판: ' + JSON.stringify(cnt) + ' 시작한 날: ' + JSON.stringify(at));
    out.push('저절로 돈 판: ' + Object.entries(seen).map(([k, v]) => `${k}(${[...v].join('>')})`).join(' '));
    out.push('지나간 일: ' + g.hist.slice(0, 8).join(' / '));
    out.push(`긴장 정사 ${Math.round(g.t.js)} 정마 ${Math.round(g.t.jm)} 점령 ${Object.keys(g.occ).join(',') || '없음'}`);
    // 2) 무림대회에 나가서 끝까지
    Object.assign(S, { lv: 30, str: 60, con: 60, agi: 50, inn: 50, potion: 9, potionMax: 9, silver: 5000, weapon: 'army_blade' }); S.weapons = ['army_blade'];
    g.arcs = []; g.occ = {}; SG.debug.start('tourney'); const t = SG.arc('tourney');
    G.world.ensure(t.map); G.field.load(t.map, 30, 22, 1); for (let i = 0; i < 5; i++) G.fast(1);
    let npc = G.field.npcs.find(q => q.id === 'sg_tour'); out.push('대회 접수처 ' + !!npc + ' ' + t.place);
    await run('예선', () => npc.talk(), by('나간다')); out.push(`예선 뒤 내 자리 ${t.me}`);
    SG.debug.next('tourney'); G.field.refresh(); npc = G.field.npcs.find(q => q.id === 'sg_tour');
    await run('본선', () => npc.talk(), by('바로')); out.push(`본선 결과 ${JSON.stringify(t.res)} 우승 ${t.done ? '나' : '못함'} 호칭 ${S.flags.saga_champ || 0}`);
    SG.debug.next('tourney'); out.push('대회 뒤 ' + (SG.arc('tourney') ? '남음' : '끝') + ' / ' + g.hist[0]);
    // 3) 정사대전: 모병관에게 이름을 올리고 일과 결전
    g.cool.jsw = 0; SG.debug.tension('js', 120); SG.debug.start('jsw'); const j = SG.arc('jsw');
    G.world.ensure(j.front[0]); G.field.load(j.front[0], 30, 22, 1); for (let i = 0; i < 5; i++) G.fast(1);
    npc = G.field.npcs.find(q => q.id === 'sg_rj'); await run('모병', () => npc.talk(), 0); out.push('내 편 ' + SG.mySide());
    SG.debug.next('jsw'); const jobs = SG.jobsFor(null); out.push('정사 일거리 ' + jobs.map(x => x.title).join(', '));
    if (jobs[0]) { S.fr.jobs.push(jobs[0]); const s0 = S.silver; await run('정사 일', () => G.free.runJob(jobs[0])); out.push(`일 뒤 은자 +${S.silver - s0} 형세 ${j.score.toFixed(1)}`); }
    const sp = SG.spawn(100, 100); out.push('순찰대 ' + (sp ? sp.intro : '없음'));
    SG.debug.next('jsw'); G.field.load(j.front[0], 30, 22, 1); for (let i = 0; i < 5; i++) G.fast(1);
    npc = G.field.npcs.find(q => q.id === 'sg_bt'); out.push('진영 ' + !!npc);
    if (npc) { await run('정사 결전', () => npc.talk(), by('선봉')); out.push(`결전 ${j.fought === 2 ? '이김' : '짐'} 형세 ${j.score.toFixed(1)}`); }
    SG.debug.next('jsw'); out.push('정사대전 뒤: ' + g.hist[0] + ' 호칭 ' + (S.flags.saga_jsw_jeong ? '정사대전의 검' : '없음'));
    // 4) 정마대전: 맹주, 해방, 결전
    S.fr.fame = 200; S.fr.infamy = 0; g.cool.demon = 0; SG.debug.tension('jm', 120); SG.debug.start('demon'); const d = SG.arc('demon');
    SG.debug.next('demon'); G.world.ensure(d.hq); G.field.load(d.hq, 30, 22, 1); for (let i = 0; i < 5; i++) G.fast(1);
    npc = G.field.npcs.find(q => q.id === 'sg_league'); out.push('무림맹 집사 ' + !!npc);
    if (npc) await run('맹주', () => npc.talk(), 0); out.push('맹주 ' + d.lord);
    SG.debug.next('demon'); const occ = Object.keys(g.occ); out.push('점령 ' + occ.join(','));
    G.world.ensure(occ[0]); G.field.load(occ[0], 30, 22, 1); for (let i = 0; i < 5; i++) G.fast(1);
    out.push('점령지 사람 ' + G.field.npcs.map(q => q.id).join(' '));
    out.push('가게 문 ' + (SG.shut(occ[0], 'x') || '열림'));
    npc = G.field.npcs.find(q => q.id === 'sg_boss'); if (npc) await run('해방', () => npc.talk(), 0); out.push('해방 뒤 점령 ' + (Object.keys(g.occ).join(',') || '없음') + ' 되찾음 ' + d.freed);
    SG.debug.next('demon'); G.world.ensure('b_cheonma'); G.field.load('b_cheonma', 31, 36, 1); for (let i = 0; i < 5; i++) G.fast(1);
    npc = G.field.npcs.find(q => q.id === 'sg_van'); out.push('선봉장 ' + !!npc);
    if (npc) await run('정마 결전', () => npc.talk(), by('선봉')); out.push('결전 ' + (d.finalWon ? '이김' : '못 이김'));
    SG.debug.next('demon'); out.push('정마대전 뒤: ' + g.hist[0] + ' 마교 무너짐 ' + G.jh.fallen('cheonma'));
    // 5) 소식 탭과 지도 표식이 그려지나
    const B = document.createElement('div'); G.jh.tab(B); out.push('탭 ' + (B.innerHTML.includes('무림 정세') ? 'ok' : '없음')); out.push('표식 ' + G.jh.marks().length);
    // 6) 저장했다 불러도 판이 남나
    const js = JSON.stringify(S.fr.saga); out.push('저장 크기 ' + js.length + ' 다시 읽기 ' + (JSON.parse(js).arcs ? 'ok' : '실패'));
    return out;
  });
  console.log(r.join('\n')); console.log(errs.slice(0, 10).join('\n') || '오류 없음'); await b.close();
})();
