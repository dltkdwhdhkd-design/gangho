// 처음부터 끝까지 이야기를 자동으로 진행하며 오류와 밸런스를 확인한다
const { chromium } = require('playwright');
const diff = process.argv[2] || 'normal', skill = +(process.argv[3] || .6);
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
  const errs = []; p.on('pageerror', e => errs.push('PAGE ' + e.message + ' ' + (e.stack || '').slice(0, 400))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); else if (m.text().startsWith('LOG')) console.log(m.text()); });
  await p.goto((process.env.GAME_URL || 'http://127.0.0.1:8123/index.html')); await p.waitForFunction('window.__G', { timeout: 60000 });
  const res = await p.evaluate(async ({ diff, skill, clans, route, alt, snapOn }) => {
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
    const wantedMap = { r2: ['clinic', 7, 8], r2b: () => !F.r_moss ? ['cloudmt', 40, 11] : !F.r_dang ? ['fiveclans', 10, 22] : ['clinic', 7, 8], r3: ['inn', 8, 8], r4: ['shaolin', 19, 25], r5: ['guhwa', 24, 29], w1: ['oasis', 20, 18], w1b: ['oasis', 34, 13], w2: ['oasis', 20, 3], w2b: ['snowpeak', 22, 12], w3: ['snowpeak', 34, 10], w4: ['tiangate', 22, 13], x2: ['inn', 8, 8], x4: ['blackpalace', 22, 23], jg1: () => !F.jg_rice ? ['guhwa', 41, 20] : !F.jg_dang ? ['fiveclans', 10, 22] : !F.jg_date ? ['fiveclans', 28, 13] : ['valley', 26, 15], jg2: ['ninehall', 8, 12], jg3: ['fort', 18, 22], fr1: () => !F.fr_talk ? ['cheongha', 20, 19] : !F.fr_rice ? ['guhwa', 41, 20] : ['clinic', 7, 8], fr2: ['cheongha', 23, 20], sa3: () => !F.sa_rice2 ? ['guhwa', 41, 20] : ['guhwa', 24, 28], ma3: ['guhwa', 41, 20], sa1: ['fort', 18, 22], ma1: ['shrine', 7, 8], sa2: () => !F.sa_job1 ? ['cheongha', 22, 25] : !F.sa_job2 ? ['hall2', 7, 8] : !F.sa_job3 ? ['ninehall', 9, 13] : ['fort', 18, 22], ma2: () => !F.ma_job1 ? ['inn2', 8, 8] : !F.ma_job2 ? ['library', 7, 9] : !F.ma_job3 ? ['cheongha', 22, 25] : ['shrine', 7, 8], p0a: ['inn', 8, 8], p3: () => !F.errand ? ['inn', 8, 8] : !F.e_yun ? ['clinic', 7, 8] : !F.e_smith ? ['smith', 7, 8] : !F.e_boat ? ['cheongha', 22, 25] : ['inn', 8, 8], p4: ['inn', 8, 8], c1a: () => !F.c1inn ? ['inn', 8, 8] : ['cheongha', 22, 25], c1b: ['clinic', 7, 8], c1c: ['bamboo', 27, 7], c1d: ['clinic', 7, 8], s1: ['cheongha', 22, 26], s2: ['cheongha', 22, 20], s3: ['bokun', 7, 8], s4: ['cheongha', 22, 20], c1e: ['pass', 19, 12], c1f: ['fort', 10, 14], c1g: ['inn', 8, 8], c1h: ['clinic', 7, 8], c2a: ['cloudmt', 22, 30], c2b: ['cloudmt', 22, 21], c2b2: ['cloudmt', 22, 21], c2c: ['hall_in', 8, 11], c2d: ['cloudmt', 40, 10], c2e: ['hall_in', 8, 11], c2f: ['library', 7, 8], c2g: ['hall_in', 8, 11], t1: ['cloudmt', 22, 34], t2: ['shaolin', 19, 25], t3: ['sutra', 8, 8], t4: ['shaolin', 28, 16], t5: ['cliffcave', 8, 8], c3a: ['cloudmt', 22, 34], c3b: ['guhwa', 24, 20], c3c: ['guhwa', 24, 20], c3e: ['guhwa', 24, 20], c4a: ['wolha', 22, 26], c4b: ['wolha', 22, 12], c4c: ['wolha', 22, 8] };
    let iter = 0, lastStep = '', stuck = 0, loses = 0; const snaps = [];
    G.autoPick = c => { if (String(c.text).includes('누구의 손')) return ['jeong', 'sa', 'ma', 'free'].indexOf(route); if (/쌀을|명령서를|혜각이|제단의 불|고진이|항아리|맹호가|부맹주|일곱 장|강호행|탁자는|혜명이|그 뒤로 나는|비질 소리|아이들이 줄을|남궁진이 칼을|다들 나를 본다/.test(c.text)) return alt; return 0; };
    while (iter++ < 3000) {
      await pump(2);
      if (G.scene === 'battle' && G.battle) { const B = G.battle, t0 = B.t; if (snapOn && B.cfg.bgm === 'boss') snaps.push({ s: JSON.stringify(S), cfg: B.cfg }); const name = B.cfg.title || B.cfg.foes.join(); let n = 0; while (G.scene === 'battle' && G.battle === B && n++ < 400) { G.fast(60); await sleep(); } log.push(`${S.flags.step} ${name} lv${S.lv} ${B.outcome} ${B.t.toFixed(0)}s hp${Math.round(B.p.hp / B.p.maxHp * 100)}% pot${S.potion}`); if (B.outcome === 'lose') { loses++; S.exp += D.stats ? 60 + S.lv * 20 : 0; if (S.exp > 18 * Math.pow(S.lv, 1.32)) { S.exp = 0; S.lv++; S.pts += 3; } } await pump(1); continue; }
      if (G.field.busy) continue;
      upkeep();
      const st = S.flags.step; if (st === 'end') break; if (typeof F.__c === 'undefined') F.__c = 1;
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
      const spot = f.spots.find(s => (!s.when || s.when()) && (st === 'c1a' ? s.hint === '살펴보기' : st === 'c1c' ? s.hint === '석상' : st === 'c1g' ? String(s.hint).includes('우물') : st === 'c2d' ? s.hint === '살펴보기' : st === 'c2f' ? s.hint === '기록 찾기' : st === 'c3a' || st === 't1' ? s.hint === '뱃길 안내' : st === 'w2' ? s.hint === '북문으로 나가기' : false));
      if (spot) { f.run(spot.act); continue; }
      const boat = f.npcs.find(n => n.id === 'boat'); if (st === 'c1a' && boat) { f.run(boat.talk); continue; }
      if (st === 'c1f') { const n = f.npcs.find(n => n.id === 'bruiser') || f.npcs.find(n => n.id === 'lion'); if (n) { f.run(n.talk); continue; } }
      if (st === 'c2b') { const n = f.npcs.find(n => n.id === 'go'); if (n) { f.run(n.talk); continue; } }
      log.push('no action at ' + st + ' map ' + m.id); stuck += 10;
    }
    if (snapOn) { // 보스마다 사람에 가까운 봇과 잘하는 봇으로 여러 번 다시 싸워 본다
      const med = a => a.slice().sort((x, y) => x - y)[Math.floor(a.length / 2)];
      for (const kind of ['good', 'human']) { G.bot = kind === 'good' ? { skill: .6 } : { skill: .3, rest: .7, skillUse: .025 };
        console.log('LOG ==== ' + kind);
        for (const sn of snaps) { const T = [], H = [], P = []; let win = 0; const N = 5;
          for (let i = 0; i < N; i++) { G.S = JSON.parse(sn.s); G.S.flags.step = 'end'; const p0 = G.S.potion; G.scene = 'field'; G.battle = null; let out = null; D.fight({ ...sn.cfg, noIntro: true }).then(r => out = r); const B = G.battle; let n = 0; while (!out && n++ < 900) { G.fast(60); await sleep(); } if (B.outcome === 'win' && B.p.hp > 0) win++; T.push(B.t); H.push(B.p.hp / B.p.maxHp); P.push(p0 - G.S.potion); }
          const c = sn.cfg; console.log(`LOG ${(c.title || '').padEnd(14)} lv${JSON.parse(sn.s).lv} 승${win}/${N} ${med(T).toFixed(0)}s 체력${Math.round(med(H) * 100)}% 약${med(P)}`); }
      } return { lv: 0 }; }
    return { log, lv: S.lv, side: S.side, ending: S.flags.ending, rep: S.rep, titles: S.titles.length, step: S.flags.step, skills: S.skills, silver: S.silver, love: S.love, loses, time: S.time, flags: Object.keys(S.flags).length, pages: S.pages };
  }, { diff, skill, clans: process.argv[4] === 'clans', route: process.argv[5] || 'jeong', alt: +(process.argv[6] || 0), snapOn: !!process.env.SNAP });
  delete res.log; console.log(JSON.stringify(res));
  console.log('ERR', errs.slice(0, 10).join('\n')); await b.close();
})().catch(e => { console.log(String(e).slice(0, 1200)); process.exit(1); });
