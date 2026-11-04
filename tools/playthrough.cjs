// 처음부터 끝까지 이야기를 자동으로 진행하며 오류와 밸런스를 확인한다
const { chromium } = require('playwright');
const diff = process.argv[2] || 'normal', skill = +(process.argv[3] || .6);
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
  const errs = []; p.on('pageerror', e => errs.push('PAGE ' + e.message + ' ' + (e.stack || '').slice(0, 400))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); else if (m.text().startsWith('LOG')) console.log(m.text()); });
  await p.goto((process.env.GAME_URL || 'http://127.0.0.1:8123/index.html')); await p.waitForTimeout(1200);
  const res = await p.evaluate(async ({ diff, skill, clans }) => {
    const process_clans = clans; const G = __G, D = G.dbg; G.manual = true; G.auto = true; G.speedup = 2000; G.bot = { skill };
    const log = { push: t => console.log('LOG ' + t), join: () => '' }; const sleep = () => new Promise(r => setTimeout(r, 0));
    const pump = async (n = 3) => { for (let i = 0; i < n; i++) { G.fast(60); await sleep(); } };
    G.S = D.newState('진소', 'BlueSamurai', 'm', diff); document.querySelector('#screen').innerHTML = ''; G.bgDraw = null;
    const S = G.S, F = S.flags; D.Story.begin();
    const best = { 검: ['stick', 'iron_sword', 'blue_sword', 'moon_sword'] };
    const upkeep = () => {
      while (S.pts > 0) { const k = ['str', 'con', 'inn', 'str', 'agi'][S.pts % 5]; S[k]++; S.pts--; }
      for (const w of best.검) if (S.weapons.includes(w)) S.weapon = w;
      const buy = (id, price) => { if (!S.weapons.includes(id) && S.silver >= price) { S.silver -= price; S.weapons.push(id); } };
      buy('blue_sword', 420);
      while (S.silver > 60 && S.potion < 6) { S.silver -= 12; S.potion++; }
      const usable = S.skills.filter(id => { const k = D.ctx.learn && window.__SK ? 1 : 1; return true; });
    };
    const wantedMap = { c1a: () => !F.c1inn ? ['inn', 8, 8] : ['cheongha', 22, 25], c1b: ['clinic', 7, 8], c1c: ['bamboo', 27, 7], c1d: ['clinic', 7, 8], c1e: ['pass', 19, 12], c1f: ['fort', 10, 14], c1g: ['inn', 8, 8], c1h: ['clinic', 7, 8], c2a: ['cloudmt', 22, 30], c2b: ['cloudmt', 22, 21], c2c: ['hall_in', 8, 11], c2d: ['cloudmt', 40, 10], c2e: ['hall_in', 8, 11], c2f: ['library', 7, 8], c2g: ['hall_in', 8, 11], c3a: ['cloudmt', 22, 34], c3b: ['guhwa', 24, 20], c3c: ['guhwa', 24, 20], c3e: ['guhwa', 24, 20], c4a: ['wolha', 22, 26], c4b: ['wolha', 22, 12], c4c: ['wolha', 22, 8] };
    let iter = 0, lastStep = '', stuck = 0, loses = 0;
    while (iter++ < 3000) {
      await pump(2);
      if (G.scene === 'battle' && G.battle) { const B = G.battle, t0 = B.t; const name = B.cfg.title || B.cfg.foes.join(); let n = 0; while (G.scene === 'battle' && G.battle === B && n++ < 400) { G.fast(60); await sleep(); } log.push(`${S.flags.step} ${name} lv${S.lv} ${B.outcome} ${B.t.toFixed(0)}s hp${Math.round(B.p.hp / B.p.maxHp * 100)}% pot${S.potion}`); if (B.outcome === 'lose') { loses++; S.exp += D.stats ? 60 + S.lv * 20 : 0; if (S.exp > 18 * Math.pow(S.lv, 1.32)) { S.exp = 0; S.lv++; S.pts += 3; } } await pump(1); continue; }
      if (G.field.busy) continue;
      upkeep();
      const st = S.flags.step; if (st === 'end') break;
      if (st === lastStep) stuck++; else { stuck = 0; lastStep = st; }
      if (stuck > 400) { log.push('STUCK at ' + st + ' map ' + S.map + ' goal ' + S.goal); break; }
      const f = G.field, m = f.m;
      let mark = f.npcs.find(n => n.mark && n.mark());
      if (st === 'c3b' && F.monk_met && (F.round || 0) >= 2 && process_clans) {
        const left = ['shaolin', 'wudang', 'hwasan', 'jongnam', 'emei', 'gonryun', 'gongdong', 'jeomchang', 'cheongseong', 'gaebang', 'namgung', 'moyong', 'jegal', 'dang', 'paeng'].filter(k => !F['clan_' + k]);
        if (left.length) {
          const five = ['namgung', 'moyong', 'jegal', 'dang', 'paeng'].includes(left[0]), mid = five ? 'fiveclans' : 'ninehall';
          if (m.id !== mid) { f.load(mid, five ? 37 : 2, five ? 12 : 10, 1); continue; }
          const n = f.npcs.find(x => x.id === 'clan_' + left[0]); if (n) { f.run(n.talk); continue; }
        }
      }
      if (st === 'c3b' && !F.monk_met) { if (m.id !== 'inn2') { f.load('inn2', 8, 8, 1); continue; } }
      if (st === 'c3b' && F.monk_met) {
        const r = F.round || 0;
        if (r === 2 && !F.chief_met) { if (m.id !== 'hall2') { f.load('hall2', 7, 8, 1); continue; } }
        else if (r === 3 && !F.ambushed) { if (m.id !== 'inn2') { f.load('inn2', 8, 8, 1); continue; } const t = f.trigs.find(t => t.when && t.when()); if (t) { f.run(t.run); continue; } }
        else { if (m.id !== 'guhwa') { f.load('guhwa', 24, 20, 1); continue; } mark = f.npcs.find(n => n.id === 'judge'); }
      }
      if (mark && mark.talk) { f.face(mark); f.run(mark.talk); continue; }
      const trig = f.trigs.find(t => !t.when || t.when()); if (trig) { f.run(trig.run); continue; }
      let w = wantedMap[st]; if (typeof w === 'function') w = w();
      if (st === 'c4a') { const k = !F.tr1 ? 0 : !F.tr2 ? 1 : 2; if (m.id !== 'wolha') { f.load('wolha', 22, 26, 1); continue; } const sp = f.spots[k]; f.run(sp.act); continue; }
      if (st === 'c3e') { if (m.id !== 'guhwa') { f.load('guhwa', 24, 20, 1); continue; } const so = f.npcs.find(n => n.mark && n.mark()); if (so) { f.run(so.talk); continue; } f.run(f.npcs.find(n => n.id === 'judge').talk); continue; }
      if (w && m.id !== w[0]) { f.load(w[0], w[1], w[2], 1); continue; }
      const spot = f.spots.find(s => (!s.when || s.when()) && (st === 'c1a' ? s.hint === '살펴보기' : st === 'c1c' ? s.hint === '석상' : st === 'c1g' ? String(s.hint).includes('우물') : st === 'c2d' ? s.hint === '살펴보기' : st === 'c2f' ? s.hint === '기록 찾기' : st === 'c3a' ? s.hint === '뱃길 안내' : false));
      if (spot) { f.run(spot.act); continue; }
      const boat = f.npcs.find(n => n.id === 'boat'); if (st === 'c1a' && boat) { f.run(boat.talk); continue; }
      if (st === 'c1f') { const n = f.npcs.find(n => n.id === 'bruiser') || f.npcs.find(n => n.id === 'lion'); if (n) { f.run(n.talk); continue; } }
      if (st === 'c2b') { const n = f.npcs.find(n => n.id === 'go'); if (n) { f.run(n.talk); continue; } }
      log.push('no action at ' + st + ' map ' + m.id); stuck += 10;
    }
    return { log, lv: S.lv, step: S.flags.step, skills: S.skills, silver: S.silver, love: S.love, loses, time: S.time, flags: Object.keys(S.flags).length, pages: S.pages };
  }, { diff, skill, clans: process.argv[4] === 'clans' });
  delete res.log; console.log(JSON.stringify(res));
  console.log('ERR', errs.slice(0, 10).join('\n')); await b.close();
})().catch(e => { console.log(String(e).slice(0, 1200)); process.exit(1); });
