// 방침 2 점검: 바깥 지도마다 집이 카메라(남쪽)에 맞게 서 있는지 센다.
// 앞길 없음: 문 아래 4칸 안에 길이 없다. 등이 길: 집 바로 위 2칸에 길이 있다(길에서 보면 집 등을 보게 된다). 뒤 틈: 집 바로 위 칸이 걸을 수 있는 땅이다.
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage(); await p.goto(process.env.GAME_URL); await p.waitForFunction(() => window.__G && __G.dbg, null, { timeout: 30000 }); await p.waitForTimeout(1500);
  const r = await p.evaluate(async () => { const { MAPS } = await import('/gangho/js/maps.js'), T = await import('/gangho/js/tiles.js'), TS = 16;
    const D = ['hall', 'lodge', 'house_red', 'inn', 'hut_o', 'hut_b', 'hut_o2', 'shop_blue', 'shop_green', 'clay', 'wood_o', 'wood_b', 'mud', 'straw'], out = [];
    for (const id in MAPS) { const m = MAPS[id]; if (m.room || id === 'world' || id === 'mysect' || id.startsWith('b_') || id.startsWith('c_') || id.startsWith('r_') || id.startsWith('h_')) continue;
      const hs = m.stamps.filter(s => D.includes(s.name) && !s.iso); if (!hs.length) continue; let nf = 0, back = 0, gap = 0;
      for (const s of hs) { const S = T.STAMPS[s.name], x0 = Math.floor(s.x / TS), x1 = Math.floor((s.x + S[3] - 1) / TS), ty = Math.floor(s.y / TS), by = Math.floor((s.y + S[4]) / TS), cx = Math.floor((s.x + S[3] / 2) / TS);
        let f = false; for (let y = by; y < by + 4; y++) for (let x = cx - 1; x <= cx + 1; x++) if (m.g[y]?.[x] === 1) f = true; if (!f) nf++;
        let bk = false; for (let y = ty - 2; y < ty; y++) for (let x = x0; x <= x1; x++) if (m.g[y]?.[x] === 1) bk = true; if (bk) back++;
        if (s.y > 8 && !m.blocked(s.x + S[3] / 2, s.y - 4)) gap++; }
      out.push([id, m.name, hs.length, nf, back, gap]); }
    return out; });
  let A = 0, B = 0; console.log('지도\t집\t앞길없음\t등이길\t뒤틈');
  for (const [id, n, h, nf, bk, g] of r) { console.log(`${id}(${n})\t${h}\t${nf}\t${bk}\t${g}`); if (bk || nf > h / 3) A++; B += h; }
  console.log(`집 있는 바깥 지도 ${r.length}곳, 집 ${B}채. 손봐야 할 지도(등이 길인 집이 있거나 앞길 없는 집이 3분의 1 넘음) ${A}곳`); await b.close(); })();
