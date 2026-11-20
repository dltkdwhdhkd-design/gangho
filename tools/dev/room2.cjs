// 방 찍기(옛 2D 화면과 새 화면 둘 다). 살림을 다시 짠 방을 두 화면에서 보고, 이야기의 사람이 선 모습까지 본다.
//   MODE=2d|hd(기본 hd)  ROOMS="inn hall_in @inn @hall @elder"(@종류: 만들어지는 방 가운데 그 종류 한 곳)  OUT=/tmp/rm2/a
//   POS="n m s"(주인공이 설 깊이)  AT="x,y"(칸으로 주인공 자리)  STEP=p4(이야기 단계. 없으면 자유 모드)  NIGHT=1(밤)
//   cd /tmp/pw && MODE=hd STEP=p4 ROOMS="inn" OUT=/tmp/rm2/a GAME_URL=http://localhost:8002/gangho/ node -r ./launch_patch.cjs room2.cjs
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 720 } }); const errs = []; p.on('pageerror', e => errs.push(e.message.slice(0, 200))); p.on('console', m => { if (m.type() === 'error' || /모형 못 읽음|소품 없음/.test(m.text())) errs.push(m.text().slice(0, 160)); });
  const hd = (process.env.MODE || 'hd') === 'hd';
  await p.goto(process.env.GAME_URL + (hd ? '?hd2d=1' : '?hd2d=0') + (process.env.Q || '')); await p.waitForFunction(hd ? () => window.__G && __G.dbg && __G.hd?.ready : () => window.__G && __G.dbg, null, { timeout: 90000 }); await p.waitForTimeout(1500);
  await p.evaluate(([a, b]) => { window.__STEP = a; window.__NIGHT = b; }, [process.env.STEP || '', process.env.NIGHT ? 1 : 0]);
  const ex = await p.evaluate(async () => { const G = __G, sl = t => new Promise(r => setTimeout(r, t)); G.noSave = true; G.S = G.dbg.newState('진소', 'BlueSamurai', 'm', 'normal'); document.querySelector('#screen').innerHTML = ''; G.bgDraw = null; G.auto = true; G.noSpawn = true; const STEP = window.__STEP; if (STEP) { G.scene = 'field'; G.S.flags.step = STEP; G.S.flags.world_open = true; G.jh?.ensure?.(); G.field.load('cheongha', 22, 25, 1); } else G.free.start(); for (let i = 0; i < 400 && G.field.busy; i++) await sl(30); if (G.free) G.free.tick = () => {}; if (G.hd) G.hd.noGov = true; G.S.flags.night = window.__NIGHT ? 1 : 0;
    const W = await import('/gangho/js/worlddata.js'); for (const l of W.LOCS || []) { try { G.world.ensure(l.map); } catch (e) { } }
    const M = G.dbg.MAPS, to = new Set(); for (const id in M) for (const q of M[id].portals || []) if (q.door || /^r_/.test(q.to)) to.add(q.to);
    const o = {}; for (const k of ['hall', 'home', 'inn', 'shop', 'dorm', 'mess', 'temple', 'gov', 'lib', 'elder', 'clinic', 'armory', 'book', 'gamble']) o[k] = [...to].find(t => new RegExp('^r_.*_' + k + '\\d*$').test(t));
    for (const t of to) { if (!/^r_.*_home\d*$/.test(t)) continue; let m; try { m = M[t]; } catch (e) { } if (!m || !m.stamps) continue; const has = n => m.stamps.some(s => s.name === n);
      if (!o.tea && has('teapot') && has('counter')) o.tea = t; if (!o.rest && has('f_stove') && has('counter')) o.rest = t; if (!o.shrine && has('tablet') && m.carpet) o.shrine = t; }
    return o; });
  const list = (process.env.ROOMS || 'hall_in').split(' ').filter(Boolean).map(k => k[0] === '@' ? ex[k.slice(1)] : k).filter(Boolean), POS = (process.env.POS || 'm').split(' '), AT = process.env.AT ? process.env.AT.split(',').map(Number) : null;
  for (const id of list) for (const ps of POS) { const r = await p.evaluate(async ([id, ps, hd, AT]) => { const G = __G, sl = t => new Promise(r => setTimeout(r, t)); G.field.busy = false; if (G.field.m?.id !== id) { try { G.field.load(id, 0, 0, 0); } catch (e) { return id + ' 불러오기 실패 ' + e.message; } for (let i = 0; i < 600 && G.field.busy; i++) await sl(50); }
      const m = G.field.m; G.field.roam.length = 0; G.field.trigs.length = 0; const e = m.portals[0]; G.field.p.x = AT ? AT[0] * 16 : e ? e.x + e.w / 2 : m.w * 8; G.field.p.y = AT ? AT[1] * 16 : m.h * 16 * (ps === 'n' ? .2 : ps === 's' ? .86 : .55);
      if (hd) { for (let i = 0; i < 60; i++) { await sl(300); if (i > 6 && !G.hd.modelsPending) break; } await sl(1800); } else await sl(900);
      return `${id} ${m.name} ${m.w}x${m.h} ${ps} 사람 ${G.field.npcs.map(n => `${n.id}@${(n.x / 16).toFixed(1)},${(n.y / 16).toFixed(1)}`).join(' ')}`; }, [id, ps, hd, AT]);
    await p.screenshot({ path: `${process.env.OUT || '/tmp/rm2/a'}_${id}_${ps}.png` }); console.log(r); }
  console.log('오류', errs.length, errs.slice(0, 6).join(' | ')); await b.close(); })();
