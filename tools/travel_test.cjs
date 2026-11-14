// 강호 길손과 새 고을: 새 고을 일곱 곳이 전도에 서고 큰길로 이어진다. 길손은 목적지까지 큰길을 따라 걷고,
// 말을 걸면 갈래마다 할 일이 있고(행상 물건, 상단 호위, 시주, 치료), 털 수 있고, 현상범·마교 무리가 길손을 덮치면 구할 수 있다
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
  const errs = []; p.on('pageerror', e => errs.push('PAGE ' + e.message + ' ' + (e.stack || '').slice(0, 300))); p.on('console', m => { if (/길을 못 냈다/.test(m.text())) errs.push(m.text()); });
  await p.goto(process.env.GAME_URL); await p.waitForTimeout(1800);
  const r = await p.evaluate(async () => {
    const G = __G, D = G.dbg, sleep = () => new Promise(r => setTimeout(r, 0)), out = [], bad = [];
    G.manual = true; G.auto = true; G.speedup = 2000; G.bot = { skill: .8 };
    G.S = D.newState('진소', 'BlueSamurai', 'm', 'normal'); document.querySelector('#screen').innerHTML = ''; G.bgDraw = null; const S = G.S;
    G.free.start(); let n = 0; while (G.field.busy && n++ < 2000) { G.fast(60); await sleep(); }
    Object.assign(S, { lv: 30, str: 50, con: 50, agi: 40, inn: 40, potion: 2, potionMax: 9, silver: 5000 }); S.flags.world_open = 1; S.flags.world_tip = 1;
    const run = async (name, fn, pick) => { G.autoPick = pick === undefined ? null : (typeof pick === 'function' ? pick : () => pick); let fin = false, err = null; G.field.busy = false; G.field.run(async () => { try { await fn(); } catch (e) { err = e; } fin = true; }); let i = 0, shop = 0; while (!fin && i++ < 5000) { const x = document.querySelector('#modal.on .x'); if (x) { shop++; x.click(); } G.fast(60); await sleep(); } if (shop) out.push(`  (가게 창 ${shop}번 닫음)`); out.push(`${name}: ${err ? 'ERR ' + err.message : fin ? 'ok' : 'TIMEOUT'}`); if (err || !fin) bad.push(name); G.autoPick = null; return !err && fin; };
    const by = re => c => { const i = c.opts.findIndex(t => re.test(t)); return i < 0 ? c.opts.length - 1 : i; };
    // 1) 새 고을: 전도에 있고, 고을 지도가 서고, 청하진에서 걸어서 닿는다
    G.world.build(); const { MAPS } = await import('/gangho/js/maps.js'); const { LOCS } = await import('/gangho/js/worlddata.js'); const NEW = LOCS.filter(l => l.road);
    const w = MAPS.world, [W, H] = G.world.size, seen = new Uint8Array(W * H), [sx, sy] = G.world.entry('cheongha'), q = [Math.floor(sy) * W + Math.floor(sx)]; seen[q[0]] = 1;
    while (q.length) { const i = q.pop(), x = i % W, y = (i - x) / W; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const X = x + dx, Y = y + dy, j = Y * W + X; if (X < 0 || Y < 0 || X >= W || Y >= H || seen[j]) continue; const v = w.g[Y][X]; if (v === 2 || v === 6) continue; seen[j] = 1; q.push(j); } }
    for (const l of NEW) { const [x, y] = G.world.entry(l.map), ok = !!seen[Math.floor(y) * W + Math.floor(x)]; G.world.ensure(l.map); const m = MAPS[l.map]; out.push(`${l.name}: 걸어서 ${ok ? '닿음' : '못 닿음'}, 고을 지도 ${m ? m.w + '×' + m.h : '없음'}, 이름표 ${(w.labels || []).some(q => q.text === l.name)}`); if (!ok || !m) bad.push(l.name); }
    // 2) 길손이 큰길에서 생겨 목적지 쪽으로 걷는다
    const [x0, y0] = G.world.entry('c_nakyang'); G.field.load('world', x0, y0 + 14, 0); for (let i = 0; i < 20; i++) { G.fast(30); await sleep(); }
    const f = G.field, P = f.p, mk = kind => { for (let i = 0; i < 400; i++) { const a = Math.random() * 6.28, t = G.travel.spawn(P.x + Math.cos(a) * 120, P.y + Math.sin(a) * 100); if (t && (!kind || t.kind === kind)) return t; } return null; };
    const kinds = {}; for (let i = 0; i < 60; i++) { f.roam = []; const t = mk(); if (t) kinds[t.kind] = (kinds[t.kind] || 0) + 1; } out.push('생긴 길손: ' + JSON.stringify(kinds));
    if (Object.keys(kinds).length < 5) bad.push('길손 갈래');
    f.roam = []; const T = mk('peddler'); f.roam.push(T); const [ex, ey] = G.world.entry(T.dest.map), d0 = Math.hypot(ex * 16 - T.x, ey * 16 - T.y), k0 = T.k;
    P.x = T.x; P.y = T.y + 40; for (let i = 0; i < 300; i++) { G.fast(30); P.x = T.x; P.y = T.y + 40; await sleep(); }
    const d1 = Math.hypot(ex * 16 - T.x, ey * 16 - T.y); out.push(`${T.tag}: 길 점 ${T.path.length}개, ${k0} → ${T.k}번째, 목적지까지 ${Math.round(d0)} → ${Math.round(d1)}px`); if (T.k <= k0 + 3) bad.push('길손 걷기');
    const onRoad = T.path.every(([x, y]) => { const v = w.g[Math.floor(y / 16)][Math.floor(x / 16)]; return v === 1 || v === 4; }); out.push(`길 점이 다 큰길 위: ${onRoad}`); if (!onRoad) bad.push('큰길');
    // 3) 말 걸기: 어디 가나 / 행상 물건 / 의원 약 / 시주 / 서생 시
    f.roam = [T]; await run('행상 어디 가나', () => G.travel.talk(T), by(/어디/));
    await run('행상 물건', () => G.travel.talk(T), by(/물건/));
    const Dc = mk('doctor'); f.roam = [Dc]; S.potion = 1; await run('의원', () => G.travel.talk(Dc), by(/약을/)); out.push(`금창약 1 → ${S.potion}/${S.potionMax}`); if (S.potion !== S.potionMax) bad.push('의원');
    const Pg = mk('pilgrim'); f.roam = [Pg]; const fame0 = S.fr.fame; await run('시주', () => G.travel.talk(Pg), by(/시주/)); out.push(`명성 ${fame0} → ${S.fr.fame}`);
    const Sc = mk('scholar'); if (Sc) { f.roam = [Sc]; const p0 = S.inv.poem || 0; await run('서생 시', () => G.travel.talk(Sc), by(/시 한 수/)); out.push(`시 ${p0} → ${S.inv.poem || 0}`); }
    // 4) 상단 호위: 매복을 물리치고 목적지에 닿으면 품삯
    const Cv = mk('caravan'); f.roam = [Cv]; await run('호위 맡기', () => G.travel.talk(Cv), by(/호위/)); out.push(`호위 중 ${!!Cv.escort}, 표사 ${Cv.crew.length}명`);
    Cv.ambushT = 0; const sv0 = S.silver; let i2 = 0; while (!Cv.ambushed && i2++ < 50) { G.fast(30); P.x = Cv.x; P.y = Cv.y + 30; await sleep(); }
    let j = 0; while (f.busy && j++ < 5000) { G.fast(60); await sleep(); }
    out.push(`매복 ${Cv.ambushed ? '만남' : '없음'}, 상단 ${Cv.gone ? '털림' : '무사'}`);
    if (!Cv.gone) { Cv.k = Cv.path.length - 1; [Cv.x, Cv.y] = Cv.path[Cv.k]; for (let i = 0; i < 200 && !Cv.gone; i++) { G.fast(30); P.x = Cv.x; P.y = Cv.y + 30; await sleep(); } j = 0; while (f.busy && j++ < 3000) { G.fast(60); await sleep(); } out.push(`도착: 은자 ${sv0} → ${S.silver}`); if (S.silver <= sv0) bad.push('호위 품삯'); }
    // 5) 털기: 악명이 붙는다
    const Fm = mk('farmer'); f.roam = [Fm]; const inf0 = S.fr.infamy, s1 = S.silver; await run('농부 털기', () => G.travel.talk(Fm), c => { const i = c.opts.findIndex(t => /턴다/.test(t)); return i < 0 ? 0 : i; });
    out.push(`털기: 악명 ${inf0} → ${S.fr.infamy}, 은자 ${s1} → ${S.silver}, 사라짐 ${!!Fm.gone}`); if (S.fr.infamy <= inf0 || !Fm.gone) bad.push('털기');
    // 6) 현상범 무리가 길손을 덮치고, 끼어들어 구한다
    let V = null; for (let i = 0; i < 600 && !V; i++) { const q = G.wander.spawn(P.x + 60, P.y); if (q && q.prize) V = q; }
    const Vt = mk('peddler'); f.roam = [V, Vt]; V.x = Vt.x + 60; V.y = Vt.y; V.dest = { x: V.x, y: V.y }; P.x = Vt.x; P.y = Vt.y + 200; S.fr.infamy = 0;
    for (let i = 0; i < 80 && !V.fight; i++) { G.fast(30); await sleep(); } out.push(`현상범이 길손을 ${V.fight?.with === Vt ? '덮침' : '안 덮침'}`); if (V.fight?.with !== Vt) bad.push('덮치기');
    const s2 = S.silver; await run('길손 구하기', () => G.travel.talk(Vt), by(/구한다/)); out.push(`구함: 은자 ${s2} → ${S.silver}, 현상범 쓰러짐 ${!!V.gone}`); if (!V.gone) bad.push('구하기');
    // 7) 무리끼리 싸움이 끝나면 길손이 털린다(구경만)
    let V2 = null; for (let i = 0; i < 600 && !V2; i++) { const q = G.wander.spawn(P.x + 60, P.y); if (q && q.prize) V2 = q; } const Vt2 = mk('pilgrim'); f.roam = [V2, Vt2]; V2.x = Vt2.x + 20; V2.y = Vt2.y; V2.dest = { x: V2.x, y: V2.y }; P.x = Vt2.x; P.y = Vt2.y + 250;
    for (let i = 0; i < 900 && !Vt2.gone && !V2.gone; i++) { G.fast(30); await sleep(); } out.push(`구경만: 길손 ${Vt2.gone ? '털림' : '무사'} · 소식 ${(S.fr.news || [])[0] || ''}`);
    return { out, bad };
  });
  console.log(r.out.join('\n')); console.log(errs.join('\n') || '오류 없음'); const ok = !r.bad.length && !errs.length; console.log(ok ? '통과' : '실패 ' + r.bad.join(',')); await b.close(); process.exit(ok ? 0 : 1);
})();
