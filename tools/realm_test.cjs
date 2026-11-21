// 문파 안의 직위별 상대, 본편과 자유 모드의 대표 인물, 실제 비무에서의 난이도와 막기·연계.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 720 } }); const errs = [], fail = [];
  p.on('pageerror', e => errs.push(e.message));
  await p.goto(process.env.GAME_URL); await p.waitForFunction(() => window.__G && __G.dbg, null, { timeout: 60000 }); await p.waitForTimeout(1500);
  const r = await p.evaluate(async () => {
    const G = __G; G.noSave = true; G.S = G.dbg.newState('나그네', 'BlueSamurai', 'm', 'normal'); document.querySelector('#screen').innerHTML = ''; G.bgDraw = null; G.auto = true; G.free.start();
    for (let i = 0; i < 400 && G.field.busy; i++) await new Promise(r => setTimeout(r, 30));
    const RL = await import('/gangho/js/realm.js'), { FOES } = await import('/gangho/js/foes.js'), { fight } = await import('/gangho/js/battle.js');
    const bad = Object.entries(FOES).filter(([id, f]) => { const r = RL.realmOf(id, f); return !(r >= 0 && r <= 7); }).map(([id]) => id);
    // 이야기 보스는 능력치가 얼마나 바뀌나(이야기 균형이 크게 흔들리면 안 된다)
    const story = {}; for (const id of ['lion', 'wei', 'so_final', 'fox', 'chief', 'chief2', 'bingma', 'cheon2', 'tianmo', 'samaung_foe', 'hyeolma2', 'clan_namgung', 'clan_shaolin', 'clan_hwasan', 'clan_jongnam']) { const f = FOES[id]; if (!f) continue; const a = { hp: f.hp, maxHp: f.hp, atk: f.atk, pause: f.pause, maxPoise: f.poise, poise: f.poise }; RL.apply(a, id, f, { optional: false }, true); story[id] = `${RL.NAME[a.realm]} 공격 ${f.atk}→${a.atk.toFixed(1)} 체력 ${f.hp}→${a.hp}`; }
    const {FACS}=await import('/gangho/js/free.js');
    const {rankedStats}=await import('/gangho/js/martial-standing.js');
    for(const f of FACS) {
      const students=['외문 제자','내문 제자','사범','장로'].map(role=>rankedStats(FOES[G.jh.disciple(f,1,role)]));
      if(students.map(s=>s.realm).join(',')!=='1,2,3,5' || students.some((s,i)=>i && (s.hp<=students[i-1].hp || s.atk<=students[i-1].atk)))bad.push(f.name+' 직위별 능력치');
    }
    for(const [story,free] of [['ogang_foe','clan_janggang'],['guyang_foe','clan_nokrim'],['hyegak_ally','clan_shaolin'],['namgung_ally','clan_namgung']])
      if(RL.realmOf(story,FOES[story])!==RL.realmOf(free,FOES[free]))bad.push(story+' 경지 불일치');
    const difficulties=[];
    for(const mode of ['easy','normal','hard']) {
      G.S.diff=mode;const end=fight({foes:['clan_jongnam'],arena:'court',noIntro:true,optional:true});
      const battle=G.battle,opponent=battle.actors.find(a=>a.team===1);difficulties.push([opponent.maxHp,opponent.atk]);
      battle.ended=true;battle.outcome='lose';battle.finish();await end;
    }
    if(difficulties.some((s,i)=>i && (s[0]<=difficulties[i-1][0]||s[1]<=difficulties[i-1][1])))bad.push('난이도별 능력치');
    G.S.diff='normal';
    // 혜각 대사(현경)와 산적(삼류)을 같은 조건에서 겨룬다.
    G.manual = true; G.speedup = 2000; G.bot = { skill: .9 }; Object.assign(G.S, { lv: 30, str: 60, con: 60, agi: 50 }); G.S.hp = 9999;
    const watch = async foes => {
      let done = null; fight({ foes, arena: 'ring', noIntro: true, optional: true }).then(o => done = o); const B = G.battle, a = B.actors.find(x => x.team === 1);
      const c = { realm: RL.NAME[a.realm], guard: 0, chain: 0, counter: 0, parry: 0 }; let was = '';
      const sayO = B.say.bind(B); B.say = (o, t, col) => { if (o === a && /튕겨/.test(t)) c.parry++; if (o === a && /되받아/.test(t)) c.counter++; return sayO(o, t, col); };
      let i = 0; while (!done && i++ < 3000) { G.fast(30); if (a.st === 'guard' && was !== 'guard') c.guard++; if (a.chainN > 0 && a.st === 'skill' && was !== 'skill') c.chain++; was = a.st; await new Promise(r => setTimeout(r, 0)); }
      c.out = done?.outcome || '멈춤'; return c;
    };
    return { bad, story, hi: await watch(['clan_shaolin']), lo: await watch(['bandit', 'bandit']) };
  });
  console.log(JSON.stringify(r, null, 1));
  if (r.bad.length) fail.push('경지 없음 ' + r.bad.join(','));
  if (r.hi.realm !== '현경') fail.push('혜각 대사가 현경이 아님 ' + r.hi.realm);
  if (r.hi.guard + r.hi.counter < 2 || r.hi.chain < 1) fail.push('현경 상대가 막거나 잇지 않음');
  if (r.lo.guard > 0) fail.push('삼류 산적이 막음');
  console.log(fail.length ? '실패\n' + fail.join('\n') : '통과'); console.log(errs.slice(0, 5).join('\n') || 'no errors');
  await b.close(); if (fail.length || errs.length) process.exit(1);
})().catch(e => { console.log(String(e).slice(0, 500)); process.exit(1); });
