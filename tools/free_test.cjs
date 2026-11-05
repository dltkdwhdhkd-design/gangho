// 자유 모드를 처음부터 돌려 본다: 입문, 임무, 승급, 탈퇴, 문파 건설, 악행
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
  const errs = []; p.on('pageerror', e => errs.push('PAGE ' + e.message + ' ' + (e.stack || '').slice(0, 300))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 300)); });
  await p.goto(process.env.GAME_URL); await p.waitForTimeout(1800);
  const r = await p.evaluate(async () => {
    const G = __G, D = G.dbg, sleep = () => new Promise(r => setTimeout(r, 0)), out = [];
    G.manual = true; G.auto = true; G.speedup = 2000; G.bot = { skill: .7 };
    G.S = D.newState('진소', 'BlueSamurai', 'm', 'normal'); document.querySelector('#screen').innerHTML = ''; G.bgDraw = null; G.free.start(); const S = G.S, fr = S.fr;
    const pump = async (cond, n = 4000) => { let i = 0; while (!cond() && i++ < n) { G.fast(60); await sleep(); } return i < n; };
    await pump(() => !G.field.busy, 2000); out.push('시작 ' + G.field.m.id + ' ' + S.flags.step + ' 은자 ' + S.silver);
    const run = async (name, fn, pick) => { G.autoPick = pick === undefined ? null : (typeof pick === 'function' ? pick : () => pick); let fin = false, err = null; G.field.busy = false; G.field.run(async () => { try { await fn(); } catch (e) { err = e; } fin = true; }); const ok = await pump(() => fin); out.push(`${name}: ${err ? '오류 ' + err.message : ok ? 'ok' : '멈춤 ' + G.scene}`); G.scene = 'field'; G.battle = null; G.field.busy = false; };
    const buff = () => Object.assign(S, { lv: 30, str: 45, con: 45, agi: 35, inn: 35, weapon: 'blue_sword', weapons: ['mop', 'army_blade', 'blue_sword'], potion: 9, potionMax: 9 });
    { G.autoPick = null; let w = 0, l = 0; G.bot = { skill: .4 }; for (let i = 0; i < 8; i++) { const j = G.free.makeJob(null); if (['gather'].includes(j.type)) continue; j.lv = 1; const p0 = S.potion; fr.jobs = [j]; S.potion = 3; let fin = false; G.field.busy = false; G.field.run(async () => { await G.free.runJob(j); fin = true; }); await pump(() => fin); G.scene = 'field'; G.battle = null; G.field.busy = false; if (fr.jobs.length) l++; else w++; fr.jobs = []; } out.push(`레벨 ${S.lv} 낭인 임무 성공 ${w} 실패 ${l}`); G.bot = { skill: .7 }; }
    buff(); S.silver = 9000;
    // 빠른 이동과 NPC
    for (const id of ['cloudmt', 'fort', 'shrine', 'ninehall', 'fiveclans', 'inn']) { G.field.load(id, 5, 5, 1); const c = D.Story.content(id); out.push(id + ': ' + c.npcs.filter(n => !/^g\d/.test(n.id)).map(n => n.id).join(' ')); }
    const npc = (map, id) => { G.field.load(map, 10, 10, 1); return D.Story.content(map).npcs.find(n => n.id === id); };
    // 입문
    const go = npc('cloudmt', 'go'); out.push('고진 ' + !!go);
    await run('입문', () => G.free.join(G.free.fac('changun')));
    out.push(`소속 ${fr.fac} ${S.title}`);
    // 임무 모든 종류
    for (let i = 0; i < 40; i++) { const j = G.free.makeJob(G.free.fac('changun')); fr.jobs = [j]; await run(`임무 ${j.type} ${j.map}`, () => G.free.runJob(j), 0); if (out[out.length - 1].includes('ok') && i > 3) out.pop(); if (fr.jobs.length && j.type !== 'gather') out.push('남음 ' + j.type); fr.jobs = []; }
    for (const al of ['nokrim', 'cheonma']) for (let i = 0; i < 14; i++) { const j = G.free.makeJob(G.free.fac(al)); fr.jobs = [j]; await run(`임무 ${al} ${j.type}`, () => G.free.runJob(j), 0); if (out[out.length - 1].endsWith('ok')) out.pop(); fr.jobs = []; }
    out.push(`공적 ${fr.merit} 명성 ${fr.fame} 끝낸 ${fr.done} 악명 ${fr.infamy}`);
    // 승급
    fr.merit = 2000; S.lv = 40; buff(); S.lv = 40;
    for (let k = 0; k < 4; k++) { await run('승급 ' + (fr.rank + 1), () => G.free.promote(G.free.fac('changun'))); out.push(`직위 ${fr.rank} ${S.title} 스킬 ${S.skills.length}`); }
    await run('명령', () => G.free.order('changun'), 0); out.push('전쟁 ' + JSON.stringify(fr.wars));
    for (let d = 0; d < 30; d++) D.nextDay ? D.nextDay() : G.free.daily(); out.push('소식 ' + fr.news.slice(0, 3).join(' | '));
    // 떠나고 문파 세우기
    fr.fac = null; fr.rank = 0; fr.jobs = []; S.silver = 20000;
    await run('창건', () => G.sect.found(), c => (String(c.text).includes('어디에') ? 0 : String(c.text).includes('길을') ? 2 : 0));
    out.push(`문파 ${fr.sect && fr.sect.name} ${fr.fac} ${G.field.m.id} 제자 ${fr.sect && fr.sect.d.length}`);
    if (fr.sect) {
      for (const id in { lodge: 1, yard: 1, kitchen: 1, farm: 1, clinic: 1, forge: 1, library: 1, shrine: 1, tower: 1 }) fr.sect.b[id] = 1; G.sect.build(); G.field.load('mysect', 20, 24, 1);
      for (const k in G.sect.ev) { fr.sect.ev = k; await run('사건 ' + k, () => G.sect.runEv(), 0); }
      fr.sect.d[0].job = 'follow'; const c = G.sect.withFollow({ foes: [] }); out.push('동행 ' + (c.allies || []).join());
      for (let d = 0; d < 12; d++) G.free.daily(); out.push(`12일 뒤 제자 ${fr.sect.d.length} 은자 ${S.silver} 등급 ${G.sect.grade()}`);
    }
    // 악행
    fr.infamy = 0; G.field.load('guhwa', 24, 26, 1);
    await run('보호세', () => G.evil.tax('guhwa'));
    await run('마을 습격', () => G.evil.raid('guhwa'), c => (String(c.text).includes('칠까') ? 0 : 1));
    out.push(`악명 ${fr.infamy} 폐허 ${G.evil.ruined('guhwa')} 구화 NPC ${D.Story.content('guhwa').npcs.map(n => n.id).filter(x => !/^g\d/.test(x)).join(' ')}`);
    await run('청하진 습격', () => G.evil.raid('cheongha'), c => (String(c.text).includes('칠까') ? 0 : 0)); out.push(`곽 문닫음 ${S.flags.gwak_shut} 폐허 ${G.evil.ruined('cheongha')}`);
    await run('상단', () => G.evil.caravan('pass'), 2); await run('토벌대', () => G.evil.hunters());
    await run('속죄', () => G.evil.atone(), 0); await run('재건', () => G.evil.plaza('guhwa'), 0); out.push(`재건 후 폐허 ${G.evil.ruined('guhwa')} 악명 ${fr.infamy}`);
    // 히로인
    const heroines = {}; for (const [m, id] of [['clinic', 'yun'], ['guhwa', 'so'], ['bokun', 'baekrang'], ['guhwa', 'hyeok'], ['fiveclans', 'clan_dang'], ['fiveclans', 'clan_moyong'], ['fiveclans', 'clan_namgung'], ['guhwa', 'cheol']]) heroines[id] = !!D.Story.content(m).npcs.find(n => n.id === id); out.push('히로인 ' + JSON.stringify(heroines));
    S.love.yun = 80; const nx = G.bond.next('yun'); out.push('인연 다음 ' + !!nx); let c = 0; while (G.bond.next('yun') && c++ < 5) { await run('인연 윤설 ' + c, () => G.bond.play('yun')); S.love.yun = 100; }
    return out;
  });
  console.log(r.join('\n')); console.log(errs.slice(0, 6).join('\n') || 'no errors'); await b.close();
})().catch(e => { console.log(String(e).slice(0, 600)); process.exit(1); });
