// 본보기 밑그림 시험: 실행 중에 지도에 소품과 단을 얹어 찍는다(게임 파일은 바꾸지 않는다).
//   WHAT=hall|hwasan  MOD=1(얹는다)|0(지금 그대로)  Q='&gk=0.6&time=morning'  OUT=/tmp/mock
const { chromium } = require('playwright'); const fs = require('fs');
(async () => { const OUT = process.env.OUT || '/tmp/mock', WHAT = process.env.WHAT || 'hall', MOD = process.env.MOD === '1'; fs.mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 720 } }); const errs = [];
  p.on('pageerror', e => errs.push('PAGE ' + e.message.slice(0, 200))); p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errs.push('CON ' + m.text().slice(0, 200)); });
  await p.goto(process.env.GAME_URL + '?hd2d=1' + (process.env.Q || '')); await p.waitForFunction(() => window.__G && __G.dbg, null, { timeout: 60000 }); await p.waitForTimeout(2500);
  await p.evaluate(async () => { const G = __G, sl = t => new Promise(r => setTimeout(r, t)); G.noSave = true; G.S = G.dbg.newState('진소', 'BlueSamurai', 'm', 'normal'); document.querySelector('#screen').innerHTML = ''; G.bgDraw = null; G.auto = true; G.free.start(); for (let i = 0; i < 400 && G.field.busy; i++) await sl(30); G.hd.noGov = true; G.noSpawn = true; });
  const info = await p.evaluate(([WHAT, MOD]) => { const G = __G, M = G.dbg.MAPS; let m, log = [];
    const drop = (m, names) => { for (const st of m.stamps.filter(s => names.includes(s.name))) { if (st.sol) m.solids = m.solids.filter(q => q !== st.sol); } m.stamps = m.stamps.filter(s => !names.includes(s.name)); };
    if (WHAT === 'hall') { m = M.hall_in; log.push('전: 소품 ' + m.stamps.length);
      if (MOD) { drop(m, ['statue_big', 'longtable', 'lantern']);
        m.put('screen', 7.25, 0.6).put('longtable', 7.5, 2.75).put('censer', 8.45, 3.75).put('f_lamp', 6.6, 2.9).put('f_lamp', 10.9, 2.9);
        m.put('f_chair', 4.3, 2.4).put('f_chair', 11.7, 2.4).put('f_scroll', 3.3, 0.5).put('f_scroll', 13.7, 0.5).put('jar', 6.4, 1.3).put('pot', 10.9, 1.3);
        m.put('pillar', 3.3, 3.4).put('pillar', 14.0, 3.4).put('pillar', 3.3, 7.6).put('pillar', 14.0, 7.6);
        m.put('p_weapons', 0.3, 5.2).put('p_weapons', 15.8, 5.2).put('rack', 0.3, 8.4).put('rack2', 15.7, 8.4);
        m.put('lantern', 4.6, 4.6).put('lantern', 12.4, 4.6).put('lantern', 4.6, 8.8).put('lantern', 12.4, 8.8);
        m.put('f_dummy', 1.3, 10.6).put('f_dummy', 15.9, 10.6).put('f_bonsai', 0.4, 3.6).put('f_bonsai', 16.6, 3.6);
        for (const y of [6.4, 8, 9.6]) m.put('f_stool', 5.9, y).put('f_stool', 11.3, y);
        m.carpet = [7, 4, 4, 9]; }
      log.push('뒤: 소품 ' + m.stamps.length + ', 종류 ' + new Set(m.stamps.map(s => s.name)).size); }
    if (WHAT === 'hwasan') { m = M.hwasan; log.push('소품 ' + m.stamps.length);
      if (MOD) { m.terrace(0, 0, 30, 4, 4).terrace(0, 4, 30, 2, 2).terrace(0, 6, 30, 2, 1).terrace(0, 13, 30, 2, -2).terrace(0, 15, 30, 5, -5); m.heightEdges(); } }
    return log.join(' / '); }, [WHAT, MOD]);
  console.log(info);
  const at = async (id, x, y, name) => { const r = await p.evaluate(async ([id, x, y]) => { const G = __G, sl = t => new Promise(r => setTimeout(r, t)); G.field.load(id, x, y, 0); for (let i = 0; i < 600 && G.field.busy; i++) await sl(50); for (let i = 0; i < 60 && G.hd.modelsPending > 0; i++) await sl(100); await sl(3000); const F = G.field, P = F.p; return `${F.m.id} (${(P.x / 16).toFixed(1)}, ${(P.y / 16).toFixed(1)}) 막힘 ${F.m.blocked(P.x, P.y)} 새 화면 ${G.hd.active(F.m)}`; }, [id, x, y]); await p.screenshot({ path: `${OUT}/${name}.png`, timeout: 180000 }); console.log(name, r); };
  const tag = MOD ? 'mod' : 'now';
  if (WHAT === 'hall') { await at('hall_in', 9, 7.6, `hall_${tag}_a`); await at('hall_in', 9, 10.8, `hall_${tag}_b`); }
  if (WHAT === 'hwasan') { await at('hwasan', 14, 11.5, `hwasan_${tag}_a`); await at('hwasan', 22, 10.5, `hwasan_${tag}_b`); }
  console.log('오류', errs.length, errs.slice(0, 4).join(' | ')); await b.close(); })();
