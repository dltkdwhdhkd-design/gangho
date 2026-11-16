// 운명 체계와 결말: 깃발 조합과 갈림 장면을 돌려 사람이 맞게 죽고 살고, 결말이 맞게 뽑히는지 본다
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/404|Failed to load/.test(m.text())) errs.push(m.text()); });
  await p.goto(process.env.GAME_URL); await p.waitForTimeout(1500);
  const r = await p.evaluate(async () => {
    const G = __G, D = G.dbg; G.manual = true; G.auto = true; G.speedup = 2000; G.bot = { skill: .9 };
    const out = [], fail = [], sleep = () => new Promise(r => setTimeout(r, 0));
    const fresh = (step, fl = {}, side = 'jeong') => { G.S = D.newState('진소', 'BlueSamurai', 'm', 'easy'); document.querySelector('#screen').innerHTML = ''; G.bgDraw = null; G.scene = 'field';
      Object.assign(G.S, { lv: 60, str: 90, con: 90, agi: 70, inn: 70, silver: 500, potion: 9, weapon: 'blue_sword', weapons: ['blue_sword'], side }); G.S.hp = 99999; Object.assign(G.S.flags, { burned: true, step }, fl); G.field.load('cheongha', 20, 20, 1); return G.S.flags; };
    const run = async (fn, pick) => { G.autoPick = pick || null; let fin = false, err = null; G.field.run(async () => { try { await fn(); } catch (e) { err = String(e); } fin = true; }); let i = 0; while (!fin && i++ < 20000) { G.fast(60); await sleep(); } G.scene = 'field'; G.battle = null; G.field.busy = false; return err || (fin ? 'ok' : '멈춤'); };
    const eq = (name, a, b) => { (a === b ? out : fail).push(`${name}: ${a}${a === b ? '' : ' (기대 ' + b + ')'}`); };
    const T = G.act3t, f = G.fate, { FOES } = await import('/gangho/js/foes.js');
    for (const k of ['tianmo', 'cheon2']) FOES[k] = { ...FOES[k], hp: 60, immune: 0, phases: [] };  // 시험은 결말까지만 보면 되므로 마지막 적을 약하게

    // 1. 깃발만으로 계산
    let F = fresh('x5', { cheol_dead: true, doc_dead: true, baek_gone: true, wei_spared: true, lion_debt: true });
    eq('철우', f.of('cheol'), 'dead'); eq('윤 의원', f.of('doc'), 'dead'); eq('위충', f.of('wei'), 'alive'); eq('죽은 여덟', f.dead8(), 3);
    F.jg_late = 'wc'; eq('늦은 무창 위충', f.of('wei'), 'lost');
    eq('결말 객잔', G.endings.pick(0).id, 'inn'); eq('결말 이끎', G.endings.pick(1).id, 'lord_j'); eq('결말 천산', G.endings.pick(2).id, 'gate');
    Object.assign(F, { hyegak_dead: true, go_dead: true }); eq('결말 빈 상', G.endings.pick(0).id, 'empty');
    F = fresh('x5', { cheol_arm: true, wei_spared: true, lion_debt: true, fate_doc: 'alive', fate_baek: 'alive', fate_samaung: 'alive', table_good: 3 }); eq('결말 만석', G.endings.pick(0).id, 'full');
    F = fresh('x5', {}, 'sa'); eq('사파 이끎', G.endings.pick(1).id, 'lord_s');

    // 2. 세 갈래 길: 셋째로 간 곳이 무너진다
    F = fresh('jg3', { jg_council: 1, wei_spared: true, jang_bond: true });
    out.push('무창 ' + await run(T.wuchang)); out.push('회관 ' + await run(T.hallNight)); out.push('산길 ' + await run(T.guyang));
    eq('늦은 곳', F.jg_late, 'gy'); eq('장팔', f.of('jang'), 'lost');
    F = fresh('jg3', { jg_council: 1, wei_spared: true });
    await run(T.hallNight); await run(T.guyang); await run(T.wuchang); eq('늦은 곳2', F.jg_late, 'wc'); eq('위충2', f.of('wei'), 'lost');

    // 3. 혈우와 소림: 이끼를 넉넉히 캐면 윤 의원이 살고, 의형제 철우가 죽는다
    F = fresh('r2b', { r_dang: true, moss_extra: true }); out.push('혈우 ' + await run(T.rainCure)); eq('윤 의원 삶', f.of('doc'), 'alive');
    F = fresh('r4', { moss_extra: true }); G.S.sworn = 'cheol'; out.push('소림 ' + await run(T.gateScene)); eq('철우 늦음', f.of('cheol'), 'dead');
    F = fresh('r4', {}); G.S.sworn = 'cheol'; await run(T.gateScene); eq('철우 의형제', f.of('cheol'), 'alive');

    // 4. 돌문: 가면 조각이 있으면 백 노인이 산다
    F = fresh('w4', { baek_live: true, mask_shard: true }); out.push('돌문 ' + await run(async () => { const s = G.act3t.lastRent; await s(); })); eq('백 노인', f.of('baek'), 'alive');

    // 5. 객잔 방어전 배치: 사람이 적으면 혼자 선 문에서 죽는다
    F = fresh('x3', { lion_debt: true, wei_spared: true });
    const post = await (async () => { let res; await run(async () => { res = await T.deploy(); await T.siegeToll(res); }); return res; })();
    out.push('배치 ' + JSON.stringify(post)); eq('맹호(대숲 혼자)', f.of('lion'), 'dead'); eq('촌장(빈 문 없음)', f.of('town'), 'alive');

    // 6. 다리: 두 채주를 살려 보냈고 합석이 잘 됐으면 사마웅이 산다
    F = fresh('x4', { jg_ogang: 'spared', jg_guyang: 'saved', table_good: 3, cheon_end: true });
    out.push('다리 ' + await run(T.bridge)); eq('사마웅', f.of('samaung'), 'alive'); out.push('다리 결말 ' + F.ending9);

    // 7. 숨은 결말: 형을 부르고, 걸레질로 끝내고, 국을 들고 감
    F = fresh('x4', { wol_named: true, wol_mop: true, gwak_soup: true });
    out.push('복도 ' + await run(T.hall, () => 0)); eq('월천', f.of('wolcheon'), 'alive'); eq('숨은 결말', F.ending9, 'two');

    // 8. 마교 길: 그릇을 바치면 붉은 달
    F = fresh('x5', {}, 'ma'); out.push('제단 ' + await run(T.finale, c => /빈 그릇을 내민다/.test(c.text) ? 1 : 0)); eq('붉은 달', F.ending9, 'redmoon');

    out.push('결말 기록 ' + G.endings.seenText());
    return { out, fail };
  });
  console.log(r.out.join('\n')); if (r.fail.length) console.log('\n실패\n' + r.fail.join('\n'));
  console.log(errs.slice(0, 5).join('\n') || 'no errors'); await b.close(); if (r.fail.length || errs.length) process.exit(1);
})().catch(e => { console.log(String(e).slice(0, 500)); process.exit(1); });
