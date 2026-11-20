// 새 화면에서 서 있는 사람이 집이나 소품 뒤에 가려지는지 본다(옛 2D는 occlude_test.cjs).
// 지도마다 제자리 사람의 몸 다섯 점에 카메라에서 줄을 그어, 셋 이상이 집·소품에 막히면 "가려짐"으로 센다.
//   길에서: 주인공이 멀리 있고 카메라만 그 사람을 본다(지나가다 보이는가)
//   옆에서: 주인공이 그 사람 바로 옆(남·동·서·북 가운데 설 수 있는 곳)에 선다. 가리던 집은 걷히고 소품은 옅어진다. 어느 쪽에 서도 가려지면 문제다 → 실패
//   node hd_occl_test.cjs [free|story]    Q='&gk=0.857'을 주면 그 값으로 견줄 수 있다    LIST=1이면 길에서 가려지는 사람도 다 적는다
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
  const errs = []; p.on('pageerror', e => errs.push('PAGE ' + e.message));
  await p.goto(process.env.GAME_URL + '?hd2d=1' + (process.env.Q || '')); await p.waitForFunction(() => window.__G && __G.dbg && __G.hd?.ready, null, { timeout: 90000 }); await p.waitForTimeout(1500);
  const r = await p.evaluate(async ([mode, LIST]) => {
    const G = __G, sl = t => new Promise(r => setTimeout(r, t)), { MAPS } = await import('./js/maps.js'), { LOCS } = await import('./js/worlddata.js'), H = G.hd;
    G.noSave = true; G.auto = true; G.noSpawn = true; G.S = G.dbg.newState('진소', 'BlueSamurai', 'm', 'normal'); document.querySelector('#screen').innerHTML = ''; G.bgDraw = null;
    if (mode === 'free') { G.free.start(); for (let i = 0; i < 400 && G.field.busy; i++) await sl(30); G.free.tick = () => {}; }
    else { G.scene = 'field'; G.S.flags = { step: 'c3b', met_yun: true, met_so: true, boat_guhwa: true, burned: true, world_open: true, world_tip: 1 }; }
    G.S.flags.night = false; H.noGov = true;
    const out = [], seen = new Set(); let people = 0, street = 0, near = 0, maps = 0;
    const check = async id => {
      if (seen.has(id)) return; seen.add(id);
      try { G.world.ensure(id); if (!MAPS[id] && !/^[rh]_/.test(id)) return; G.field.load(id, 5, 5, 1); } catch (e) { out.push(`✗ ${id}: 불러오기 오류 ${e.message}`); return; }  // 만들어지는 방(r_, h_)은 들어갈 때 생긴다
      for (let i = 0; i < 300 && G.field.busy; i++) await sl(20);
      const F = G.field, m = F.m; if (!H.active(m)) return; maps++;
      H.peek = null; H.aim(F); for (let i = 0; i < 60 && H.modelsPending > 0; i++) await sl(100);
      for (const n of F.npcs) { if (n.stamp || !n.spr || n.hide > 0) continue; people++;
        H.peek = [n.x, n.y + 20]; H.aim(F); const [c1, by1] = H.covered(n.x, n.y); if (c1 < 3) continue; street++;
        // 옆에 서 본다: 설 수 있는 네 자리 가운데 가장 덜 가려지는 쪽
        const p0 = [F.p.x, F.p.y]; let best = 9, by = by1, stood = 0;
        for (const [dx, dy] of [[0, 18], [18, 0], [-18, 0], [0, -18], [0, 30], [26, 0], [-26, 0]]) { const x = n.x + dx, y = n.y + dy; if (m.blocked(x, y)) continue; stood++; F.p.x = x; F.p.y = y; H.peek = null; H.aim(F); H.aim(F); const [c2, by2] = H.covered(n.x, n.y); if (c2 < best) { best = c2; by = by2; } }
        F.p.x = p0[0]; F.p.y = p0[1]; H.peek = null;
        const tag = `${id}(${m.name || ''}) ${n.id}(${n.hint || n.name || ''}) ${(n.x / 16).toFixed(1)},${(n.y / 16).toFixed(1)}`;
        if (!stood) out.push(`  ${tag}: 옆에 설 자리 없음, 길에서 ${c1}/5 ← ${by1.join(',')}`);
        else if (best >= 3) { near++; out.push(`✗ ${tag}: 옆에 서도 ${best}/5 가려짐 ← ${by.join(',')}`); }
        else if (LIST) out.push(`  ${tag}: 길에서 ${c1}/5 ← ${by1.join(',')} (옆에 서면 ${best}/5)`);
      }
    };
    for (const l of LOCS) await check(l.map);
    for (const id of Object.keys(MAPS)) if (id !== 'world') await check(id);
    // 만들어지는 방: 종류마다 두 곳씩(문파와 고을의 방, 민가). 벽과 기둥 조각이 사람을 가리지 않는지 본다(2026-11-20에 방이 다 새 화면으로 떴다)
    const rooms = {}; for (const id of Object.keys(MAPS)) for (const q of MAPS[id].portals || []) { const to = q.to || '', k = (/^r_.*_([a-z]+)\d*$/.exec(to) || [])[1] || (/^h_/.test(to) ? 'house' : ''); if (k && (rooms[k] ||= []).length < 2 && !rooms[k].includes(to)) rooms[k].push(to); }
    const before = maps; for (const k in rooms) for (const id of rooms[k]) await check(id); out.push(`만들어지는 방 ${maps - before}곳(${Object.keys(rooms).length}가지)을 더 봤다`);
    out.push(`지도 ${maps}곳, 서 있는 사람 ${people}명: 길에서 가려지는 사람 ${street}명, 옆에 서도 가려지는 사람 ${near}명`);
    return out.join('\n');
  }, [process.argv[2] || 'free', !!process.env.LIST]);
  console.log(r); console.log(errs.slice(0, 5).join('\n') || '오류 없음');
  if (/^✗/m.test(r) || errs.length) { console.log('실패'); process.exitCode = 1; } else console.log('통과');
  await b.close();
})().catch(e => { console.log(String(e).slice(0, 500)); process.exit(1); });
