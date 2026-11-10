// 정마대전이 눈에 보이는지: 점령지의 마교도와 묶인 사람들, 무림맹 본거지 무사, 진채, 길 위의 교전, 저절로 벌어지는 탈환전, 진채 지휘관과 함께 성문 치기, 교전 끼어들기, 무너진 문파의 모습
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
  const errs = []; p.on('pageerror', e => errs.push('PAGE ' + e.message + ' ' + (e.stack || '').slice(0, 300))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 300)); });
  await p.goto(process.env.GAME_URL); await p.waitForFunction(() => window.__G && __G.dbg, null, { timeout: 30000 }); await p.waitForTimeout(800);
  const r = await p.evaluate(async () => {
    const G = __G, sleep = () => new Promise(r => setTimeout(r, 0)), out = [];
    G.manual = true; G.auto = true; G.speedup = 2000; G.bot = { skill: .95 };
    G.S = G.dbg.newState('진소', 'BlueSamurai', 'm', 'normal'); document.querySelector('#screen').innerHTML = ''; G.bgDraw = null; const S = G.S;
    G.free.start(); let n = 0; while (G.field.busy && n++ < 2000) { G.fast(60); await sleep(); } G.free.tick = () => { };
    Object.assign(S, { lv: 30, str: 60, con: 60, agi: 50, inn: 50, potion: 9, potionMax: 9, silver: 3000, weapon: 'army_blade' }); S.weapons = ['army_blade'];
    const run = async (name, fn, pick) => { G.autoPick = pick === undefined ? null : pick; let fin = false, err = null; G.field.busy = false; G.field.run(async () => { try { await fn(); } catch (e) { err = e; } fin = true; }); let i = 0; while (!fin && i++ < 8000) { G.fast(60); await sleep(); } if (err || !fin) out.push(`${name}: ${err ? 'ERR ' + err.message + ' ' + (err.stack || '').slice(0, 200) : '안 끝남'}`); return !err && fin; };
    const SG = G.saga, g = SG.st(); g.arcs = []; g.cool.demon = 0; SG.debug.tension('jm', 120); SG.debug.start('demon'); SG.debug.next('demon'); SG.debug.next('demon');
    const d = SG.arc('demon'), occ = Object.keys(g.occ); out.push(`단계 ${d.phase} 본거지 ${d.hq} 점령지 ${occ.join(',')} 교전 ${d.sk?.length || 0}`);
    // 점령지 광장
    const m = occ[0]; G.world.ensure(m); G.field.load(m, 27, 24, 1); for (let i = 0; i < 5; i++) G.fast(1);
    const ids = G.field.npcs.map(q => q.id);
    out.push(`점령지 마교도 ${ids.filter(i => /^sg_c\d/.test(i)).length} 묶인 사람 ${ids.filter(i => /^sg_cap/.test(i)).length} 향주 ${ids.includes('sg_boss')} 효과 ${JSON.stringify(SG.fx(m))}`);
    // 무림맹 본거지
    G.world.ensure(d.hq); G.field.load(d.hq, 29.5, 20, 1); for (let i = 0; i < 5; i++) G.fast(1);
    out.push(`본거지 무사 ${G.field.npcs.filter(q => /^sg_lm/.test(q.id)).length} 깃발 ${JSON.stringify(SG.fx(d.hq).hq)}`);
    // 강호 길: 진채와 교전
    const [ex, ey] = G.world.entry(m); G.field.load('world', ex + 3.5, ey + 5, 1); for (let i = 0; i < 5; i++) G.fast(1);
    const wf = SG.fx('world'), W = G.world.build ? (G.world.build(), null) : null;
    out.push(`진채 ${wf.camps.length} 지휘관 ${!!G.field.npcs.find(q => q.id === 'sg_camp' + m)} 교전 ${wf.sk.length} 교전 사람 ${G.field.npcs.filter(q => /^sk\d/.test(q.id)).length} 해골 ${G.field.npcs.filter(q => /^sk\d/.test(q.id) && q.spr === 'Skeleton').length}`);
    const near = (a, b2) => Math.hypot(a.x - b2.x, a.y - b2.y); let tight = 0; wf.sk.forEach((q, i) => wf.sk.slice(i + 1).forEach(o => { if (near(q, o) < 7) tight++; })); out.push('붙어 있는 교전 ' + tight);
    // 교전에 끼어든다(무림맹 편)
    const q0 = wf.sk[0], s0 = d.score, f0 = G.field.npcs.find(q => q.id === `sk${q0.id}a0`);
    G.field.load('world', q0.x, q0.y + 2, 1); for (let i = 0; i < 3; i++) G.fast(1);
    await run('교전', () => G.field.npcs.find(q => q.id === `sk${q0.id}a0`).talk(), 0);
    out.push(`교전 끝 ${!!q0.done} 형세 ${s0.toFixed(1)}→${d.score.toFixed(1)} ${q0.A.fac} 우호 ${G.jh.rep(q0.A.fac)} 마교 우호 ${G.jh.rep('cheonma')} 남은 교전 사람 ${G.field.npcs.filter(q => q.id.startsWith(`sk${q0.id}`)).length}`);
    // 진채 지휘관과 성문을 친다
    G.field.load('world', ex + 3.5, ey + 5, 1); for (let i = 0; i < 3; i++) G.fast(1);
    const cmd = G.field.npcs.find(q => q.id === 'sg_camp' + m); const fr0 = d.freed;
    await run('성문', () => cmd.talk(), c => c.opts.findIndex(o => o.startsWith('지금')) >= 0 ? c.opts.findIndex(o => o.startsWith('지금')) : 0);
    out.push(`성문 친 뒤 ${m} 점령 ${!!g.occ[m]} 되찾은 수 ${fr0}→${d.freed}`);
    // 저절로 벌어지는 탈환전: 나머지 점령지에서 사흘마다
    ['c_changan', 'c_nakyang'].forEach(c => { g.occ[c] = { boss: '혈마 향주 시험', next: S.day + 1 }; });
    const left = Object.keys(g.occ); let tries = 0, freed = 0;
    for (let k = 0; k < 30 && Object.keys(g.occ).length; k++) { S.day++; const before = Object.keys(g.occ).length; for (const mm of Object.keys(g.occ)) if (g.occ[mm].next <= S.day) tries++; SG.debug.tick(d); freed += before - Object.keys(g.occ).length; if (d.left !== undefined) d.left = Math.max(d.left, 5); }
    out.push(`남은 점령지 ${left.join(',')} → 저절로 탈환 시도 ${tries}번, 되찾음 ${freed}, 지금 ${Object.keys(g.occ).join(',') || '없음'}`);
    out.push('소식 ' + S.fr.news.filter(t => /탈환|되찾/.test(t)).slice(0, 3).join(' / '));
    // 무너진 문파
    S.fr.fallen.namgung = S.day; G.world.ensure('b_namgung'); G.field.load('b_namgung', 23, 12, 1); for (let i = 0; i < 3; i++) G.fast(1);
    const st = G.field.m._wst; out.push('무너진 문파 모습 ' + JSON.stringify(st) + ' 그을린 건물 ' + (G.field.m.objs || []).filter(o => G.warfx.tint(G.field.m, o)).length);
    S.fr.fallen.namgung = S.day - 6; G.fast(1); out.push('엿새 뒤 ' + G.field.m._wst?.kind); S.fr.fallen.namgung = S.day - 11; G.fast(1); out.push('열하루 뒤 ' + G.field.m._wst?.kind);
    return out;
  });
  console.log(r.join('\n')); console.log(errs.slice(0, 8).join('\n') || '오류 없음'); await b.close();
})();
