// 지도마다 놓인 소품 수, 소품 종류 수, 칸 100개당 꾸밈 소품 수, 높낮이가 있는지를 뽑는다(docs/checklist.md "지도 한 장의 기준"의 표).
//   cd /tmp/pw && GAME_URL=http://localhost:8002/gangho/ node -r ./launch_patch.cjs mapstat.cjs
// 만들어지는 방은 열네 가지를 가지마다 처음 찾은 한 곳씩만 잰다.
// 한 줄: 지도 이름|이름|크기|갈래(고정·방·문파·고을)|소품 수|종류 수|담·울타리를 뺀 소품 수|높낮이|칸 100개당(담·울타리를 뺀 소품으로 센다)
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
  await p.goto(process.env.GAME_URL); await p.waitForFunction(() => window.__G && __G.dbg, null, { timeout: 60000 }); await p.waitForTimeout(1000);
  const r = await p.evaluate(async () => { const G = __G, sl = t => new Promise(r => setTimeout(r, t)); G.noSave = true; G.S = G.dbg.newState('나그네', 'BlueSamurai', 'm', 'normal'); document.querySelector('#screen').innerHTML = ''; G.bgDraw = null; G.auto = true; G.free.start(); for (let i = 0; i < 400 && G.field.busy; i++) await sl(30);
    const { LOCS } = await import('/gangho/js/worlddata.js'); for (const l of LOCS) { try { G.world.ensure(l.map); } catch (e) {} } const cw = console.warn; console.warn = () => {}; for (const kind of ['hall', 'lib', 'elder', 'dorm', 'mess', 'clinic', 'armory', 'inn', 'shop', 'book', 'temple', 'home', 'gov', 'gamble']) { for (const l of LOCS) { const id = 'r_' + l.id + '_' + kind; try { G.world.ensure(id); } catch (e) {} if (G.dbg.MAPS[id]) break; } } console.warn = cw;
    const M = G.dbg.MAPS, out = [];
    for (const id of Object.keys(M)) { const m = M[id]; if (id === 'world' || id === 'isotest') continue; const st = m.stamps || [], kinds = new Set(st.map(s => s.name)), deco = st.filter(s => !/^(wall_|fence_|wood_[hv])/.test(s.name));
      out.push([id, m.name || '', m.w + 'x' + m.h, m.room ? '방' : id.startsWith('b_') ? '문파' : id.startsWith('c_') ? '고을' : '고정', st.length, kinds.size, deco.length, m.hgt ? '있음' : '-', Math.round(deco.length / (m.w * m.h) * 1000) / 10].join('|')); }
    return out; });
  console.log(r.join('\n')); await b.close(); })();
