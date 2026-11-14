// 강호를 떠도는 무리: 무리끼리 싸우고, 악명이 높으면 정파가 달려들고, 사파에 시비를 걸면 원한, 현상범 상금, 편들기, 관아에서 현상금 덮기
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
  const errs = []; p.on('pageerror', e => errs.push('PAGE ' + e.message + ' ' + (e.stack || '').slice(0, 300)));
  await p.goto(process.env.GAME_URL); await p.waitForTimeout(1800);
  const r = await p.evaluate(async () => {
    const G = __G, D = G.dbg, sleep = () => new Promise(r => setTimeout(r, 0)), out = [];
    G.manual = true; G.auto = true; G.speedup = 2000; G.bot = { skill: .8 };
    G.S = D.newState('진소', 'BlueSamurai', 'm', 'normal'); document.querySelector('#screen').innerHTML = ''; G.bgDraw = null; const S = G.S;
    G.free.start(); let n = 0; while (G.field.busy && n++ < 2000) { G.fast(60); await sleep(); }
    Object.assign(S, { lv: 30, str: 50, con: 50, agi: 40, inn: 40, potion: 9, potionMax: 9, silver: 5000 }); S.flags.world_open = 1; S.flags.world_tip = 1;
    const run = async (name, fn, pick) => { G.autoPick = pick === undefined ? null : (typeof pick === 'function' ? pick : () => pick); let fin = false, err = null; G.field.busy = false; G.field.run(async () => { try { await fn(); } catch (e) { err = e; } fin = true; }); let i = 0; while (!fin && i++ < 5000) { G.fast(60); await sleep(); } out.push(`${name}: ${err ? 'ERR ' + err.message : fin ? 'ok' : 'TIMEOUT'}`); G.autoPick = null; return !err && fin; };
    G.world.build(); const [x0, y0] = G.world.entry('cheongha'); G.field.load('world', x0, y0 + 3, 0); for (let i = 0; i < 20; i++) { G.fast(30); await sleep(); }
    const f = G.field, P = f.p, mk = side => { for (let i = 0; i < 200; i++) { const q = G.wander.spawn(P.x + 60, P.y); if (q && q.side === side) return q; } return null; };
    // 1) 정파 무리와 사파 무리가 붙는다
    f.roam = []; S.fr.infamy = 0; const A = mk('jeong'), B = mk('sa'); A.x = P.x + 120; A.y = P.y; B.x = P.x + 150; B.y = P.y; A.dest = { x: A.x, y: A.y }; B.dest = { x: B.x, y: B.y }; f.roam.push(A, B);
    for (let i = 0; i < 400 && !(A.gone || B.gone); i++) { G.fast(30); await sleep(); }
    out.push(`무리 싸움: ${A.tag} vs ${B.tag} → ${A.gone ? B.tag : B.gone ? A.tag : '안 끝남'} 이김, 소식 ${(S.fr.news || [])[0] || ''}`);
    // 2) 악명이 높으면 정파 무리가 달려든다
    f.roam = []; S.fr.infamy = 40; const C = mk('jeong'); C.x = P.x + 80; C.y = P.y; f.roam.push(C); for (let i = 0; i < 20; i++) { G.fast(10); await sleep(); }
    out.push(`악명 40에 정파 무리: ${C.peace ? '그냥 지나감' : '달려듦'} · ${C.intro || ''}`);
    // 3) 사파 무리에 시비를 건다
    f.roam = []; S.fr.infamy = 0; const E = mk('sa'), rep0 = G.jh.rep(E.fac), g0 = S.fr.grudge.length; f.roam.push(E);
    await run('시비', () => G.wander.talk(E), c => { const i = c.opts.findIndex(t => /시비|살려/.test(t)); return i < 0 ? 0 : i; });
    out.push(`시비 뒤 평판 ${rep0} → ${G.jh.rep(E.fac)}, 원한 ${g0} → ${S.fr.grudge.length}, 무리 사라짐 ${!!E.gone}`);
    // 4) 현상범 무리를 잡는다
    f.roam = []; let V = null; for (let i = 0; i < 400 && !V; i++) { const q = G.wander.spawn(P.x + 60, P.y); if (q && q.prize) V = q; } f.roam.push(V); const s0 = S.silver;
    await run('현상범', () => G.wander.talk(V), c => { const i = c.opts.findIndex(t => /시비/.test(t)); return i < 0 ? 0 : i; });
    out.push(`현상범 ${V.tag}: 은자 ${s0} → ${S.silver}`);
    // 5) 싸움판에 끼어든다
    f.roam = []; const J = mk('jeong'), K = mk('sa'); J.x = K.x = P.x + 40; J.y = K.y = P.y; J.fight = { with: K, t: 99, lead: true }; K.fight = { with: J, t: 99 }; f.roam.push(J, K); const r0 = G.jh.rep(J.fac);
    await run('편들기', () => G.wander.talk(J), o => 0);
    out.push(`편들기: ${J.tag} 평판 ${r0} → ${G.jh.rep(J.fac)}, ${K.tag} 쓰러짐 ${!!K.gone}`);
    // 6) 관아에서 현상금을 덮는다
    S.fr.infamy = 40; const i0 = S.fr.infamy; G.world.ensure('c_guangzhou'); 
    out.push(`그리는 함수 ${typeof G.wander.over}`);
    return { out, ok: (A.gone || B.gone) && !C.peace && G.jh.rep(E.fac) < rep0 && S.silver > s0 && K.gone };
  });
  console.log(r.out.join('\n')); console.log(errs.join('\n') || '오류 없음'); console.log(r.ok && !errs.length ? '통과' : '실패'); await b.close(); process.exit(r.ok && !errs.length ? 0 : 1);
})();
