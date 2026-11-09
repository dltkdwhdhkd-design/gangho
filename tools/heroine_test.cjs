// 히로인 점검: 어디서 만나는지, 사연 셋이 끝까지 도는지, 고백과 혼인, 결전 합류, 결말 뒷이야기, 그림
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
    if (G.free) G.free.tick = () => { };
    const [{ CAND }, { MAPS }, { WHO }, core] = await Promise.all(['life', 'maps', 'dialog', 'core'].map(x => import(`/gangho/js/${x}.js`)));
    const lines = []; const box = document.querySelector('#dlg') || document.body;
    const run = async (name, fn, pick) => { G.autoPick = pick === undefined ? null : pick; let fin = false, err = null; G.field.busy = false; G.field.run(async () => { try { await fn(); } catch (e) { err = e; } fin = true; }); let i = 0; while (!fin && i++ < 6000) { G.fast(60); await sleep(); } if (err || !fin) out.push(`${name}: ${err ? 'ERR ' + err.message : '안 끝남'}`); return !err && fin; };
    // 어디서 만나나
    const where = {}; const W = await import('/gangho/js/worlddata.js'); for (const l of W.LOCS) try { G.world.ensure(l.map); G.field.load(`r_${l.id}_hall`, 5, 5, 0); } catch (e) { }
    for (const id of Object.keys(MAPS)) { if (id === 'world') continue; try { G.field.load(id, 5, 5, 0); } catch (e) { continue; } for (const q of G.field.npcs) if (CAND[q.id]) (where[q.id] = where[q.id] || []).push(id); }
    for (const id in CAND) out.push(`만남 ${id} ${CAND[id].name}: ${(where[id] || []).slice(0, 6).join(' ') || '없음'}`);
    // 그림
    for (const id in CAND) { const w = WHO[id] || {}, k = w.art || id, ex = ['n', 'h', 's', 'a', 'b'].filter(e => core.ART.get(`${k}_${e}`)); out.push(`그림 ${id}: ${ex.join('') || '없음'} 얼굴 ${w.face || '-'}`); }
    // 사연, 고백, 혼인
    S.lv = 30; S.silver = 99999;
    for (const id in CAND) {
      S.flags['met_' + id] = true; if (id.startsWith('clan_')) S.flags[id] = true; let k = 0;
      while (k++ < 6) { S.love[id] = 100; if (!G.bond.next(id)) break; await run(`사연 ${id} ${k}`, () => G.bond.play(id), 0); }
      const done = G.bond.done(id), tot = G.bond.total(id);
      const home = (where[id] || [])[0]; let nt = null; if (home) { G.field.load(home, 5, 5, 0); nt = G.field.npcs.find(q => q.id === id); }
      let step = '';
      if (nt) {
        S.love[id] = 100; S.partner = null; S.married = null; S.sworn = null;
        const want = CAND[id].sworn ? '의형제' : '마음을', seen = [];
        for (let t = 0; t < 3 && S.partner !== id && S.sworn !== id; t++) { seen.length = 0; await run(`고백 ${id}`, () => nt.talk(), c => { seen.push((c.text || '').slice(0, 30) + ' [' + c.opts.join('/') + ']'); const i = c.opts.findIndex(o => o.startsWith(want)); return i >= 0 ? i : c.opts.length - 1; }); }
        if (S.partner !== id && S.sworn !== id) out.push(`  ${id} 표시 ${typeof nt.mark === 'function' ? nt.mark() : nt.mark} 선택지 ${seen.join(' | ') || '없음'}`);
        if (S.partner === id) { S.love[id] = 100; if (G.bond.next(id)) await run(`연인 사연 ${id}`, () => G.bond.play(id), 0); }
        step = S.partner === id ? '연인' : S.sworn === id ? '의형제' : '실패';
        if (S.partner === id) { S.love[id] = 100; await run(`청혼 ${id}`, () => nt.talk(), c => { const i = c.opts.findIndex(o => o.startsWith('혼인')); return i >= 0 ? i : c.opts.length - 1; }); if (S.married === id) step += '→혼인'; }
        let ally = null; await run(`합류 ${id}`, async () => { ally = await G.bond.join('jeong', []); }); step += ` 합류 ${ally || '-'}`;
      }
      out.push(`사연 ${id} ${done}→${G.bond.done(id)}/${tot} ${step || '만날 곳 없음'}`);
      S.partner = null; S.married = null; S.sworn = null;
    }
    return out;
  }, mode);
  console.log(r.join('\n')); console.log(errs.slice(0, 10).join('\n') || '오류 없음'); await b.close();
})();
