// 협박, 죽이고 빼앗기, 평타로 칼 뽑기, 경공 속도. 자유 모드와 이야기 모드
const { chromium } = require('playwright');
const mode = process.argv[2] || 'free';
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
  const errs = []; p.on('pageerror', e => errs.push('PAGE ' + e.message + ' ' + (e.stack || '').slice(0, 400))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 300)); });
  await p.goto(process.env.GAME_URL); await p.waitForTimeout(1800);
  const r = await p.evaluate(async (mode) => {
    const G = __G, D = G.dbg, sleep = () => new Promise(r => setTimeout(r, 0)), out = [];
    G.manual = true; G.auto = true; G.crimeTest = true; G.speedup = 2000; G.bot = { skill: .9 };
    G.S = D.newState('진소', 'BlueSamurai', 'm', 'normal'); document.querySelector('#screen').innerHTML = ''; G.bgDraw = null; const S = G.S;
    if (mode === 'free') G.free.start(); else { G.scene = 'field'; S.flags.step = 'c2a'; S.flags.world_open = true; G.jh.ensure(); G.field.load('cheongha', 22, 25, 1); }
    let n = 0; while (G.field.busy && n++ < 2000) { G.fast(60); await sleep(); }
    if (G.free) G.free.tick = () => { };
    Object.assign(S, { lv: 30, str: 50, con: 50, agi: 40, inn: 40, potion: 9, potionMax: 9, weapon: 'army_blade' }); S.weapons = ['army_blade'];
    const run = async (name, fn, pick) => { G.autoPick = pick === undefined ? null : pick; let fin = false, err = null; G.field.busy = false; G.field.run(async () => { try { await fn(); } catch (e) { err = e; } fin = true; }); let i = 0; while (!fin && i++ < 6000) { G.fast(60); await sleep(); } if (err || !fin) out.push(`${name}: ${err ? 'ERR ' + err.message + ' ' + (err.stack || '').slice(0, 200) : '안 끝남'}`); return !err && fin; };
    const by = t => c => { const i = c.opts.findIndex(o => o.startsWith(t)); return i >= 0 ? i : 0; };
    // 경공
    const I = (await import('/gangho/js/core.js')).Input;
    const speed = async (dash) => { let best = 0; for (const dir of ['right', 'left', 'up', 'down']) { G.field.load('c_nakyang', 20, 26.5, 1); for (let i = 0; i < 5; i++) G.fast(1); const x0 = G.field.p.x, y0 = G.field.p.y; I.down[dir] = true; if (dash) I.down.dash = true; for (let i = 0; i < 20; i++) G.fast(1); I.down[dir] = false; I.down.dash = false; best = Math.max(best, Math.round(Math.hypot(G.field.p.x - x0, G.field.p.y - y0))); } return best; };
    G.world.ensure('c_nakyang');
    out.push(`20프레임 걸음 ${await speed(false)}px 경공 ${await speed(true)}px`);
    // 거리 사람
    const W = await import('/gangho/js/worlddata.js'); const city = 'c_nakyang'; if (city.startsWith('c_')) G.world.ensure(city);
    G.field.load(city, 20, 26.5, 1);
    const pool = G.field.npcs.filter(q => q.talk && G.crime.can(q)), skip = G.field.npcs.filter(q => q.talk && !G.crime.can(q));
    out.push(`${city} 건드릴 수 있는 사람 ${pool.length}, 못 건드리는 사람 ${skip.map(q => q.id).slice(0, 12).join(' ')}`);
    const kids = G.field.npcs.filter(q => q.size && q.size < 16); out.push(`아이 ${kids.length} 대상 ${kids.filter(q => G.crime.can(q)).length}`);
    const kinds = {}; for (const q of pool) kinds[G.crime.kindOf(q)] = (kinds[G.crime.kindOf(q)] || 0) + 1; out.push('종류 ' + JSON.stringify(kinds));
    if (!pool.length) { out.push('대상 없음: ' + G.field.npcs.map(q => q.id + (q.talk ? '' : '(말없음)')).join(' ')); return out; }
    const v = pool.find(q => G.crime.kindOf(q) === 'vendor') || pool[0], f = pool.find(q => G.crime.kindOf(q) === 'folk' && q !== v) || pool[1];
    let s0 = S.silver; await run('협박', () => v.talk(), by('협박')); out.push(`협박 ${v.id} 은자 ${S.silver - s0} 악명 ${S.fr?.infamy}`);
    s0 = S.silver; await run('죽이고 빼앗기', () => f.talk(), c => c.opts[0].startsWith('숨통') ? 0 : by('죽이고')(c)); out.push(`살해 ${f.id} 은자 ${S.silver - s0} 악명 ${S.fr?.infamy} 죽은 자리 ${Object.keys(S.dead_npc || {}).join(' ')}`);
    G.field.refresh(); out.push('다시 불러도 없음 ' + !G.field.npcs.some(q => q.id === f.id));
    // 평타 키로 바로
    const t = G.field.npcs.find(q => q.talk && G.crime.can(q) && q !== v); if (t) { G.field.p.x = t.x; G.field.p.y = t.y + 10; G.field.p.dir = 1; t.walk = 0; const tg = G.field.target(); out.push('눈앞 ' + (tg && tg.id)); await run('평타 공격', () => G.crime.attack(tg || t), c => c.opts[0] === '벤다' ? 0 : c.opts.length - 1); }
    // 히로인과 동료는 안 된다
    const { CAND } = await import('/gangho/js/life.js'); out.push('히로인 대상 ' + Object.keys(CAND).filter(id => G.crime.can({ id, spr: 'X', talk: () => 0 })).length);
    S.day += 20; G.field.refresh(); out.push('스무 날 뒤 돌아옴 ' + G.field.npcs.some(q => q.id === f.id));
    return out;
  }, mode);
  console.log(r.join('\n')); console.log(errs.slice(0, 10).join('\n') || '오류 없음'); await b.close();
})();
