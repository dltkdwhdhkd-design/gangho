// 정파 내분(자유 모드 무림 정세): 같은 정파 두 세력이 고을 이권을 두고 갈라서고, 강호 길에서 두 세력 무리가 칼을 뽑고, 한쪽 편을 들거나 화해시킬 수 있다
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
  const errs = []; p.on('pageerror', e => errs.push('PAGE ' + e.message + ' ' + (e.stack || '').slice(0, 300)));
  await p.goto(process.env.GAME_URL); await p.waitForTimeout(1800);
  const r = await p.evaluate(async () => {
    const G = __G, D = G.dbg, sleep = () => new Promise(r => setTimeout(r, 0)), out = [], bad = [];
    G.manual = true; G.auto = true; G.speedup = 2000; G.bot = { skill: .8 };
    G.S = D.newState('진소', 'BlueSamurai', 'm', 'normal'); document.querySelector('#screen').innerHTML = ''; G.bgDraw = null; const S = G.S;
    G.free.start(); let n = 0; while (G.field.busy && n++ < 2000) { G.fast(60); await sleep(); }
    Object.assign(S, { lv: 30, str: 50, con: 50, agi: 40, inn: 40, potion: 9, potionMax: 9, silver: 3000 }); S.flags.world_open = 1; S.flags.world_tip = 1;
    const run = async (name, fn, pick) => { G.autoPick = pick; let fin = false, err = null; G.field.busy = false; G.field.run(async () => { try { await fn(); } catch (e) { err = e; } fin = true; }); let i = 0; while (!fin && i++ < 5000) { G.fast(60); await sleep(); } out.push(`${name}: ${err ? 'ERR ' + err.message : fin ? 'ok' : 'TIMEOUT'}`); if (err || !fin) bad.push(name); G.autoPick = null; };
    const SG = G.saga; SG.st(); SG.debug.start('rift'); const a = SG.arc('rift'); if (!a) return { out: ['판이 안 섰다'], bad: ['시작'] };
    out.push(`판: ${a.A} vs ${a.B} · ${a.place} ${a.prize} · ${a.phase}`); SG.debug.next('rift'); out.push(`단계: ${a.phase}, 다툼 사이 ${SG.feuding(a.A, a.B)}`); if (!SG.feuding(a.A, a.B)) bad.push('feuding');
    // 고을 안 두 장로
    G.world.ensure(a.map); G.field.load(a.map, 30, 40, 1); for (let i = 0; i < 10; i++) { G.fast(30); await sleep(); }
    const L = G.field.npcs.filter(q => q.id.startsWith('sg_rift')); out.push(`장로 ${L.length}명: ${L.map(q => q.hint).join(', ')}`); if (L.length !== 2) bad.push('장로');
    const { MAPS } = await import('/gangho/js/maps.js'); for (const q of L) if (MAPS[a.map].blocked(q.x, q.y)) bad.push('장로 자리 막힘');
    const r0 = G.jh.rep(a.A), r1 = G.jh.rep(a.B); await run('편들기', () => L[0].talk(), c => 0);
    out.push(`편든 쪽 ${a.helped}, 평판 ${r0}→${G.jh.rep(a.A)} / ${r1}→${G.jh.rep(a.B)}`); if (a.helped !== a.A) bad.push('편들기');
    // 강호 길: 두 세력 무리가 마주치면 칼을 뽑는다
    G.world.build(); const [x0, y0] = G.world.entry('cheongha'); G.field.load('world', x0, y0 + 3, 0); for (let i = 0; i < 10; i++) { G.fast(30); await sleep(); }
    const f = G.field, P = f.p, mk = id => { for (let i = 0; i < 600; i++) { const q = G.wander.spawn(P.x + 60, P.y); if (q && q.fac === id) return q; } return null; };
    f.roam = []; const A = mk(a.A), B = mk(a.B); out.push(`무리: ${A?.tag} / ${B?.tag}`);
    if (A && B) { A.x = P.x + 120; A.y = P.y; B.x = P.x + 150; B.y = P.y; A.dest = { x: A.x, y: A.y }; B.dest = { x: B.x, y: B.y }; f.roam.push(A, B); for (let i = 0; i < 400 && !(A.gone || B.gone); i++) { G.fast(30); await sleep(); } out.push(`정파끼리 길 싸움: ${A.gone || B.gone ? '붙음' : '안 붙음'}`); if (!(A.gone || B.gone)) bad.push('길 싸움'); }
    else bad.push('무리');
    SG.debug.next('rift'); out.push(`끝: 판 ${SG.arc('rift') ? '남음' : '닫힘'} · ${(S.fr.news || [])[0] || ''}`);
    // 화해
    SG.st().cool.rift = 0; SG.debug.start('rift'); const b2 = SG.arc('rift'); SG.debug.next('rift'); S.fr.fame = 400; G.field.load(b2.map, 30, 40, 1); for (let i = 0; i < 10; i++) { G.fast(30); await sleep(); }
    const L2 = G.field.npcs.filter(q => q.id.startsWith('sg_rift')); await run('화해', () => L2[0].talk(), c => { const i = c.opts.findIndex(t => /한자리/.test(t)); return i < 0 ? 0 : i; });
    out.push(`화해 ${b2.peace ? '됨' : '안 됨(운)'} · 정세 표 ${SG.html().includes('정파 내분')}`);
    return { out, bad };
  });
  console.log(r.out.join('\n')); console.log(errs.join('\n') || '오류 없음'); const ok = !r.bad.length && !errs.length; console.log(ok ? '통과' : '실패 ' + r.bad.join(',')); await b.close(); process.exit(ok ? 0 : 1);
})();
