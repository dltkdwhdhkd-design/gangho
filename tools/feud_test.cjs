// 은원: 남궁세가 본가에서 사람을 죽이면 원수가 되고, 경종이 울리고, 다시 들어가면 칼 든 사람들이 기다리고, 입문은 거절되고, 강호에서 추격대가 쫓아온다
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
  const errs = []; p.on('pageerror', e => errs.push('PAGE ' + e.message + ' ' + (e.stack || '').slice(0, 300))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 300)); });
  await p.goto(process.env.GAME_URL); await p.waitForFunction(() => window.__G && __G.dbg, null, { timeout: 30000 }); await p.waitForTimeout(800);
  const r = await p.evaluate(async () => {
    const G = __G, sleep = () => new Promise(r => setTimeout(r, 0)), out = [];
    G.manual = true; G.auto = true; G.crimeTest = true; G.speedup = 2000; G.bot = { skill: .95 };
    G.S = G.dbg.newState('진소', 'BlueSamurai', 'm', 'normal'); document.querySelector('#screen').innerHTML = ''; G.bgDraw = null; const S = G.S;
    G.free.start(); let n = 0; while (G.field.busy && n++ < 2000) { G.fast(60); await sleep(); } G.free.tick = () => { };
    Object.assign(S, { lv: 30, str: 60, con: 60, agi: 50, inn: 50, potion: 9, potionMax: 9, silver: 3000, weapon: 'army_blade' }); S.weapons = ['army_blade'];
    const run = async (name, fn, pick) => { G.autoPick = pick === undefined ? null : pick; let fin = false, err = null; G.field.busy = false; G.field.run(async () => { try { await fn(); } catch (e) { err = e; } fin = true; }); let i = 0; while (!fin && i++ < 8000) { G.fast(60); await sleep(); } if (err || !fin) out.push(`${name}: ${err ? 'ERR ' + err.message + ' ' + (err.stack || '').slice(0, 200) : '안 끝남'}`); return !err && fin; };
    const by = t => c => { const i = c.opts.findIndex(o => o.startsWith(t)); return i >= 0 ? i : 0; };
    G.world.ensure('b_namgung'); G.field.load('b_namgung', 23, 50, 0); for (let i = 0; i < 5; i++) G.fast(1);
    out.push('처음 우호 ' + G.jh.rep('namgung') + ' 원수 ' + G.jh.hostile('namgung'));
    const v = G.field.npcs.find(q => q.talk && G.crime.can(q) && /work|walk/.test(q.id)); out.push('대상 ' + (v && v.id));
    await run('살인', () => v.talk(), c => /숨통/.test(c.opts[0]) ? 0 : by('죽이고')(c));
    out.push(`살인 뒤 우호 ${G.jh.rep('namgung')} 원수 ${G.jh.hostile('namgung')} 모용 우호 ${G.jh.rep('moyong')} 제갈 우호 ${G.jh.rep('jegal')} 원한 ${S.fr.grudge.map(g => g.fac).join(',')} 추격 ${JSON.stringify(S.fr.chase)}`);
    out.push('지금 있는 곳 ' + G.field.m.id);
    // 다시 들어가 본다
    G.field.load('b_namgung', 23, 62, 0); for (let i = 0; i < 5; i++) G.fast(1);
    out.push('산문 안 사람 ' + G.field.npcs.map(q => q.id).join(' ') + ' / 칼 든 무리 ' + G.field.roam.length + ' ' + (G.field.roam[0]?.intro || ''));
    // 가주에게 입문
    const head = G.field.npcs.find(q => q.id === G.free.fac('namgung').key); out.push('가주 ' + !!head);
    if (head) await run('가주', () => head.talk(), c => { const i = c.opts.findIndex(o => o.startsWith('입문')); return i >= 0 ? i : 0; });
    out.push('입문 ' + (S.fr.fac || '안 됨'));
    // 강호에 나가면 추격대
    G.field.load('world', ...G.world.entry('b_namgung'), 0); const sp = G.jh.spawn(100, 100); out.push('추격대 ' + (sp ? sp.intro : '없음') + ' 인원 ' + (sp?.foes.length || 0));
    // 원수가 아닐 때 입문 거절 문턱(우호 -10)
    S.fr.rep.moyong = -10; S.fr.grudge = []; G.world.ensure('b_moyong'); G.field.load('b_moyong', 23, 50, 0); for (let i = 0; i < 5; i++) G.fast(1);
    const h2 = G.field.npcs.find(q => q.id === G.free.fac('moyong').key); if (h2) await run('모용 입문', () => h2.talk(), c => { const i = c.opts.findIndex(o => o.startsWith('입문')); return i >= 0 ? i : c.opts.length - 1; });
    out.push('모용 입문(우호 -10) ' + (S.fr.fac || '거절'));
    return out;
  });
  console.log(r.join('\n')); console.log(errs.slice(0, 8).join('\n') || '오류 없음'); await b.close();
})();
