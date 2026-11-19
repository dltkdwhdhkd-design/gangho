// 새 화면 둘러보기: 장면마다 한 장씩 찍고, 사람이 화면에서 차지하는 키와 새 화면으로 떴는지를 적는다.
// 화면을 손댄 뒤에는 이걸 돌려 앞뒤 그림을 눈으로 견준다(docs/checklist.md "결 재는 법").
//   cd /tmp/pw && GAME_URL=http://localhost:8002/gangho/ OUT=/tmp/tour node -r ./launch_patch.cjs tour.cjs
//   OUT=찍은 그림 폴더(기본 /tmp/tour)  Q='&camk=0.95'(주소에 덧붙일 것)  ONLY=정규식(그 장면만)  TIME=morning|day|evening|night(시각 고정)
// 찍은 뒤 빛깔은 python3 tools/tone.py /tmp/tour/*.png 로 잰다. 시험 환경은 느려서 다 찍는 데 5분쯤 걸린다.
const { chromium } = require('playwright');
const fs = require('fs');
(async () => {
  const OUT = process.env.OUT || '/tmp/tour', ONLY = process.env.ONLY ? new RegExp(process.env.ONLY) : null, on = n => !ONLY || ONLY.test(n); fs.mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 720 } }); const errs = [], bad = new Set();
  p.on('pageerror', e => errs.push('PAGE ' + e.message.slice(0, 200))); p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errs.push('CON ' + m.text().slice(0, 200)); });
  p.on('response', r => { if (r.status() >= 400) bad.add(r.status() + ' ' + r.url().split('/gangho/').pop()); });
  const T0 = Date.now(), rows = [];
  const shot = async (n, note = '') => { await p.screenshot({ path: `${OUT}/${n}.png`, timeout: 180000 }); rows.push(`${n.padEnd(18)} ${note}`); console.log(n, note, Math.round((Date.now() - T0) / 1000) + 's'); };
  // 지도에 들어가 가장 가까운 빈 자리에 선다. 사람 한 칸의 키가 화면 높이의 몇 분의 1인지 잰다(그림 속 몸은 칸보다 6~7% 크다)
  const go = async (m, x, y) => p.evaluate(async ([m, x, y]) => {
    const G = __G, sl = t => new Promise(r => setTimeout(r, t)); if (m) { G.world.ensure?.(m); const M = G.dbg.MAPS[m]; G.field.load(m, x ?? M.w / 2, y ?? M.h / 2, 0); }
    for (let i = 0; i < 600 && G.field.busy; i++) await sl(50); const F = G.field, P = F.p;
    if (F.m.blocked(P.x, P.y)) out: for (let r = 8; r < 400; r += 8) for (let a = 0; a < 16; a++) { const X = P.x + Math.cos(a * Math.PI / 8) * r, Y = P.y + Math.sin(a * Math.PI / 8) * r; if (!F.m.blocked(X, Y)) { P.x = X; P.y = Y; break out; } }
    for (let i = 0; i < 60 && G.hd.modelsPending > 0; i++) await sl(100); await sl(2500);
    const hd = G.hd.active(F.m), f = G.hd.proj(P.x, P.y + 1, 0), h = G.hd.proj(P.x, P.y + 1, G.hd.bodyH(F.m));
    return `지도 ${F.m.id} · ${hd ? '새 화면' : '옛 2D'}` + (hd ? ` · 사람 키 = 화면 높이의 1/${(720 / ((f[1] - h[1]) * 1.065)).toFixed(1)}` : '');
  }, [m, x, y]);
  await p.goto(process.env.GAME_URL + '?hd2d=1' + (process.env.Q || '')); await p.waitForFunction(() => window.__G && __G.dbg, null, { timeout: 60000 }); await p.waitForTimeout(2500);
  if (on('00_title')) await shot('00_title');
  await p.evaluate(async time => { const G = __G, sl = t => new Promise(r => setTimeout(r, t)); G.noSave = true; G.S = G.dbg.newState('진소', 'BlueSamurai', 'm', 'normal'); document.querySelector('#screen').innerHTML = ''; G.bgDraw = null; G.auto = true; G.free.start(); for (let i = 0; i < 400 && G.field.busy; i++) await sl(30); G.hd.noGov = true; if (time) G.hd.setOpt('time', time);
    Object.assign(G.S, { lv: 16, str: 18, con: 14, agi: 10, inn: 14, pts: 2, silver: 860, weapon: 'blue_sword', weapons: ['stick', 'iron_sword', 'blue_sword'], ins: 3 }); }, process.env.TIME || '');
  // 큰 지도는 처음 나가면 안내 글이 떠서 입력을 기다린다(G.auto가 넘긴다). 멈춘 것이 아니다
  for (const [n, m, x, y] of [['01_town_cheongha', ''], ['02_town_guhwa', 'guhwa'], ['03_sect_hwasan', 'b_hwasan', 22, 30], ['04_valley', 'valley', 20, 16], ['05_room_inn', 'inn', 9, 8]]) if (on(n)) await shot(n, await go(m, x, y));
  // 문파 안 방(r_<곳>_<종류>)과 내 집은 아직 옛 2D로 뜬다(js/hd2d/rooms.js ROOMS에 없는 방)
  if (on('06_room_base')) await shot('06_room_base', await go('r_hwasan_hall', 10, 10));
  if (on('07_world')) { await p.evaluate(() => { const G = __G, [x, y] = G.world.entry('guhwa') || G.world.entry('cheongha'); G.field.load('world', x, y + 2, 0); }); await shot('07_world', await go('', 0, 0)); }
  await p.evaluate(() => { __G.auto = false; });
  if (on('08_dialog')) { await go('inn', 9, 8);
    p.evaluate(async () => { const { say, choice } = await import('/gangho/js/ctx.js'); await say('gwak', '일어났으면 걸레 들어. 누워서 밥만 축낼래? 해가 중천이다.', 'a'); await say('yun', '약은 하루 두 번 바르시라고 해요.', 'h'); await choice('맹호가 칼을 내려놓고 사발을 비운다.', ['나중에 신세를 갚으라고 한다', '산적질을 그만두라고 한다']); }).catch(() => {});
    // 화면에 뜬 것을 보고 넘긴다(정해진 시간만큼만 기다리면 느린 환경에서 어긋난다). 원하는 꼴이 될 때까지 E를 한 번씩 누른다
    const until = async (fn, arg) => { for (let i = 0; i < 40; i++) { if (await p.evaluate(fn, arg)) return; await p.keyboard.press('e'); await p.waitForTimeout(600); } throw new Error('대화가 넘어가지 않음'); };
    const who = t => document.querySelector('#dialog .box .who')?.textContent === t;
    await p.waitForFunction(who, '곽 아주머니', { timeout: 30000 }); await until(who, '윤설'); await p.waitForTimeout(3000); await shot('08_dialog');
    await until(() => !!document.querySelector('#dialog .choices .btn')); await p.waitForTimeout(1500); await shot('09_choice'); await until(() => !document.querySelector('#dialog')?.innerHTML); await p.waitForTimeout(600); }
  if (on('10_menu')) { await p.keyboard.press('Escape'); await p.waitForTimeout(1200); await shot('10_menu_stat');
    for (const t of ['skill', 'mer', 'gear']) { const h = await p.$(`.tabs button[data-t=${t}]`); if (h) { await h.click(); await p.waitForTimeout(900); await shot('10_menu_' + t); } else errs.push('메뉴 탭 없음: ' + t); }
    await p.keyboard.press('Escape'); await p.waitForTimeout(600); }
  for (const [ar, foes] of [['court', ['disciple', 'disciple']], ['village', ['bandit', 'bandit', 'fighter_b']], ['forest', ['bandit', 'bandit']]]) if (on('11_battle_' + ar)) {
    await p.evaluate(async ([ar, foes]) => { const G = __G; const { fight } = await import('/gangho/js/battle.js'); G.S.hp = 9999; G.S.mp = 999; G.bot = { skill: 1 }; fight({ foes, allies: ['so_ally'], arena: ar, noIntro: true, optional: true }); }, [ar, foes]);
    await p.waitForTimeout(5000);
    const note = await p.evaluate(() => { const G = __G, B = G.battle; if (!B) return '싸움이 이미 끝남'; const a = B.actors.find(q => q.isPlayer), f = G.hd.proj(a.x, a.y + 1, 0), h = G.hd.proj(a.x, a.y + 1, G.hd.bodyH(B.stage, true));
      return `싸움판 ${Math.round(B.right - B.left)}×${Math.round(B.floorB - B.top)}` + (B.stage ? ` · 사람 키 = 화면 높이의 1/${(720 / ((f[1] - h[1]) * 1.065)).toFixed(1)}` : ' · 옛 2D 전투'); });
    await shot('11_battle_' + ar, note);
    await p.evaluate(() => { const G = __G; if (G.battle) { G.battle.onDone = null; G.battle = null; } G.scene = 'field'; G.bot = null; document.querySelector('#stage').classList.remove('inbattle'); G.hd.resetCam?.(); }); await p.waitForTimeout(800);
  }
  console.log('\n── 요약 ──\n' + rows.join('\n'));
  console.log('못 읽은 파일: ' + ([...bad].join(' | ') || '없음')); console.log('오류: ' + ([...new Set(errs)].slice(0, 20).join('\n') || '없음')); await b.close();
})();
