// 무공, 동료, 세력 반응, 강호 사건 점검. 자유 모드와 이야기 모드 둘 다
const { chromium } = require('playwright');
const mode = process.argv[2] || 'free';
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
  const errs = []; p.on('pageerror', e => errs.push('PAGE ' + e.message + ' ' + (e.stack || '').slice(0, 400))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 300)); });
  await p.goto(process.env.GAME_URL); await p.waitForTimeout(1800);
  const r = await p.evaluate(async (mode) => {
    const G = __G, D = G.dbg, sleep = () => new Promise(r => setTimeout(r, 0)), out = [];
    G.manual = true; G.auto = true; G.speedup = 2000; G.bot = { skill: .8 };
    G.S = D.newState('진소', 'BlueSamurai', 'm', 'normal'); document.querySelector('#screen').innerHTML = ''; G.bgDraw = null; const S = G.S;
    if (mode === 'free') G.free.start(); else { G.scene = 'field'; S.flags.step = 'c2a'; S.flags.world_open = true; G.jh.ensure(); G.field.load('cheongha', 22, 25, 1); }
    let n = 0; while (G.field.busy && n++ < 2000) { G.fast(60); await sleep(); }
    const [da, fo, wd] = await Promise.all(['data', 'foes', 'worlddata'].map(x => import(`/gangho/js/${x}.js`))), { SKILLS, HEARTS, WEAPONS } = da, { MOVES, FOES } = fo, { LOCS } = wd;
    const run = async (name, fn, pick) => { G.autoPick = pick === undefined ? null : (typeof pick === 'function' ? pick : () => pick); let fin = false, err = null; G.field.busy = false; G.field.run(async () => { try { await fn(); } catch (e) { err = e; } fin = true; }); let i = 0; while (!fin && i++ < 5000) { G.fast(60); await sleep(); } const m = `${name}: ${err ? 'ERR ' + err.message + ' ' + (err.stack || '').slice(0, 240) : fin ? 'ok' : 'TIMEOUT'}`; if (!m.endsWith('ok')) out.push(m); G.autoPick = null; return !err && fin; };
    const buff = () => Object.assign(S, { lv: 32, str: 50, con: 50, agi: 40, inn: 40, silver: 90000, potion: 9, potionMax: 9, weapon: 'army_blade' });
    const x = Object.keys(SKILLS).filter(k => /^(x_|r_)/.test(k)); out.push(`초식 ${Object.keys(SKILLS).length} 새로 ${x.length} 심법 ${Object.keys(HEARTS).length} 적 기술 ${x.filter(k => MOVES[k]).length}`);
    for (const k of x) { const q = SKILLS[k]; if (!q.name || !q.w || !q.steps?.length || !(q.mp > 0) || !(q.cd > 0)) out.push('나쁜 초식 ' + k); }
    buff(); S.weapons = ['army_blade', 'blue_sword', 'iron_spear', 'fist_wrap', 'mop']; const wt = { 검: 'blue_sword', 도: 'army_blade', 창: 'iron_spear', 권: 'fist_wrap', 무관: 'blue_sword' };
    // 새 초식을 직접 써 본다
    let used = 0; for (const w of ['검', '도', '창', '권', '무관']) { const L = x.filter(k => SKILLS[k].w === w); for (let i = 0; i < L.length; i += 4) { S.weapon = wt[w]; S.skills = L.slice(i, i + 4); S.slots = [...S.skills, null, null, null].slice(0, 4); G.field.m.id; await run(`초식 ${S.skills.map(k => SKILLS[k].name)}`, () => D.ctx.duel({ foes: ['fd_x'].length ? [G.jh.disciple(G.free.fac('wudang'), 30, true)] : [], arena: 'court', bgm: 'fight', noIntro: true, optional: true })); used += S.skills.length; } } out.push('써 본 초식 ' + used);
    S.skills = []; S.slots = [null, null, null, null]; S.weapon = 'blue_sword';
    // 세력 사람들과 싸워 본다
    for (const f of G.free.FACS || []) { }
    const FL = LOCS.filter(l => l.fac).map(l => l.fac); for (const id of FL) { const f = G.free.fac(id); if (!f) { out.push('세력 없음 ' + id); continue; } await run('제자 ' + id, () => D.ctx.duel({ foes: G.jh.crew(f, 30, 2), arena: 'court', bgm: 'fight', noIntro: true, optional: true })); }
    for (const id of ['haenam', 'bukhae', 'podalra']) await run('대표 ' + id, () => D.ctx.duel({ foes: ['clan_' + id], arena: 'court', bgm: 'boss', noIntro: true, optional: true, yieldAt: .25, noLoot: true }));
    const ins = Object.keys(S.insight || {}).length; out.push(`견식 ${ins} 익힘 ${S.skills.length}`);
    // 사사, 책방, 잔권
    const w = G.free.fac('wudang'); buff(); G.jh.addRep('wudang', 80, false); G.field.load('b_wudang', 20, 26.5, 1); const tu = G.field.npcs.find(n => n.id === 'tutor'); out.push('사범 ' + !!tu);
    const before = S.skills.length; for (let i = 0; i < 4; i++) await run('사사 ' + i, () => G.arts.tutor(w), (t, o) => 0); await run('대련', () => G.arts.tutor(w), 1); await run('헌금', () => G.arts.tutor(w), 1); out.push(`사사 ${S.skills.length - before} 심법 ${S.hearts.join(' ')}`);
    G.field.load('c_nakyang', 20, 26.5, 1); await run('책방', () => G.arts.bookshop(LOCS.find(l => l.id === 'nakyang')), 0); const K = G.arts.ID.jabhak.find(k => !S.skills.includes(k)); G.arts.addScrap(K, 3);
    for (let i = 0; i < 4; i++) { if (S.skills.includes(K)) break; await run('해독', () => G.arts.ID && (async () => { const b = document.createElement('div'); G.arts.codex(b); const q = b.querySelector(`[data-dec="${K}"]`); if (!q) throw new Error('해독 버튼 없음'); })()); } G.arts.parried('luohan'); for (let i = 0; i < 9; i++) G.arts.parried('luohan'); out.push('견식 나한권 ' + S.skills.includes('luohan'));
    await run('기연', () => G.arts.relic(G.arts.relics[0])); await run('기연심법', () => G.arts.relic(G.arts.relics[9])); out.push(`기연 ${Object.keys(S.relic || {}).length} 심법수 ${S.hearts.length}`);
    S.heart = S.hearts.find(h => h.startsWith('h_')) || S.heart; const st = D.stats(); out.push('심법 효과 공격 ' + Math.round(st.atk));
    // 동료
    G.field.load('c_nakyang', 20, 26.5, 1); let n1 = G.field.npcs.find(q => q.id === 'c_haho'); out.push('하후민 ' + !!n1); { let q = 0; await run('동료 합류', () => n1.talk(), () => q++ ? 0 : 1); } out.push('동료 ' + (S.pt?.in || []).join(' ')); S.flags.met_so = 1; S.love.so = 30; await run('연인 후보 합류', () => G.party.join('so')); out.push('동료 ' + S.pt.in.join(' '));
    G.field.load('world', 700, 500, 1); await run('동료 전투', () => D.ctx.duel({ foes: G.free.group('bandit', 30, 3), arena: 'village', bgm: 'fight', noIntro: true, optional: true }));
    { const q = G.field.p; for (let i = 0; i < 60; i++) { G.field.trail.unshift({ x: q.x - i, y: q.y, dir: 0 }); } G.fast(3); } const pb = document.createElement('div'); G.party.tab(pb); out.push('동료 탭 ' + pb.querySelectorAll('[data-a]').length); pb.querySelector('[data-a="out"]').click(); out.push('뺀 뒤 ' + S.pt.in.length + ' 집 ' + Object.keys(S.pt.home).length); S.flags.own_house = true; G.party.tab(pb); S.pt.home[Object.keys(S.pt.home)[0]] = 'herb'; const h0 = S.inv.herb || 0; D.state.nextDay(); out.push('집터 약초 +' + ((S.inv.herb || 0) - h0));
    // 세력 반응
    G.jh.addRep('hwasan', -50); out.push(`화산 ${G.jh.rep('hwasan')} 적대 ${G.jh.hostile('hwasan')} 종남 ${G.jh.rep('jongnam')} 매화 친구 아미 ${G.jh.rep('emei')}`);
    const before2 = S.fr.grudge.length; G.jh.addRep('dang', -60); G.field.load('b_dang', 20, 26.5, 1); const tr = D.Story.content('b_dang').trigs; out.push('문 막기 ' + tr.length); await run('산문 전투', () => G.jh.gate(G.free.fac('dang')), 1); out.push(`끝난 곳 ${G.field.m.id} 악명 ${S.fr.infamy} 원한 ${S.fr.grudge.length}`);
    G.jh.ensure().grudge.push({ id: 900, fac: 'dang', who: '당칠', victim: '당팔', stage: 1, wait: 0, lv: 30 }); G.field.load('world', 700, 500, 1); const ro = G.jh.spawn(G.field.p.x + 40, G.field.p.y); out.push('복수자 ' + ro?.gr?.who); await run('복수자 전투', () => D.Story.encounter(ro), 0); out.push('남은 원한 ' + S.fr.grudge.length);
    S.fr.grudge = []; const hu = G.jh.spawn(G.field.p.x + 40, G.field.p.y); out.push('추격대 ' + !!hu); if (hu) await run('추격대 전투', () => D.Story.encounter(hu), 1);
    await run('사범에게 칼을', () => { G.field.load('b_jongnam', 20, 20, 1); return G.jh.challenge(G.free.fac('jongnam')); }, 0); out.push('종남 ' + G.jh.rep('jongnam'));
    const bad = G.free.fac('hwasan'); S.silver = 90000; await G.jh.peace(bad); out.push('화해 후 화산 ' + G.jh.rep('hwasan'));
    // 강호 사건
    S.fr.ev = []; S.inv.herb = 20; S.inv.rice = 20; for (const t in G.jh.TYPES) { buff(); G.jh.startEv(t); const e = S.fr.ev[S.fr.ev.length - 1]; if (e.map !== 'world') G.field.load(e.map, 20, 26.5, 1); else G.field.load('world', e.x, e.y + 2, 1); G.field.refresh(); const np = G.field.npcs.find(q => q.id === 'ev' + e.id); if (!np) { out.push('사건 사람 없음 ' + t); continue; } await run('사건 ' + t, () => np.talk(), 0); out.push(`${e.name}: 성공 ${!!e.won}`); }
    S.fr.ev = []; G.jh.startEv('raid'); const e2 = S.fr.ev[0]; e2.left = 1; S.fr.power[e2.b] = 30; D.state.nextDay(); out.push('방치 후 세력 ' + S.fr.power[e2.b] + ' 무너짐 ' + Object.keys(S.fr.fallen).join(' '));
    const fid = Object.keys(S.fr.fallen)[0]; if (fid) { const l = LOCS.find(q => q.fac === fid); if (l?.map.startsWith('b_')) { G.field.load(l.map, 20, 26.5, 1); out.push('폐허 사람 ' + G.field.npcs.map(q => q.id).join(' ')); await run('재건', () => G.jh.rebuild(G.free.fac(fid)), 0); out.push('재건 후 ' + Object.keys(S.fr.fallen).length); } }
    for (let i = 0; i < 40; i++) D.state.nextDay(); out.push(`40일 뒤 사건 ${S.fr.ev.length} 소문 ${S.fr.news.length}`);
    const tb = document.createElement('div'); G.jh.tab(tb); G.arts.codex(tb); out.push('탭 ok');
    return out;
  }, mode);
  console.log(r.join('\n')); console.log('오류', errs.length, [...new Set(errs)].slice(0, 10).join('\n')); await b.close();
})();
