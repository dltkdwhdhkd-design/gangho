// 생활 체계를 차례로 시험한다: 제작, 낚시, 사냥, 집, 연애, 결혼, 트리, 전리품
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
  const errs = []; p.on('pageerror', e => errs.push('PAGE ' + e.message + ' ' + (e.stack || '').slice(0, 400))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto(process.env.GAME_URL); await p.waitForTimeout(1300);
  const r = await p.evaluate(async () => {
    const G = __G, D = G.dbg, L = G.life, o = {}; const sleep = ms => new Promise(r => setTimeout(r, ms));
    G.S = D.newState('진소', 'BlueSamurai', 'm', 'normal'); const S = G.S; Object.assign(S, { lv: 20, str: 24, con: 16, agi: 12, inn: 18, silver: 9000, tp: 15, weapon: 'iron_sword', weapons: ['stick', 'iron_sword'] });
    S.flags = { step: 'end', burned: true, boat_guhwa: true, bow: true, rod: true, yun_join: true, met_yun: true }; document.querySelector('#screen').innerHTML = ''; G.bgDraw = null; G.scene = 'field'; G.manual = true; G.auto = true; G.speedup = 3000; G.bot = { skill: .7 };
    const f = G.field; f.load('cheongha', 21, 16, 0);
    const pump = async (n = 6) => { for (let i = 0; i < n; i++) { G.fast(30); await sleep(1); } };
    const until = async (fn, n = 400) => { for (let i = 0; i < n; i++) { if (fn()) return true; G.fast(30); await sleep(1); } return false; };
    const idle = () => until(() => !f.busy && G.scene === 'field');
    const talk = async id => { const n = f.npcs.find(x => x.id === id); if (!n) throw new Error('사람 없음 ' + id); f.run(n.talk); await idle(); };
    const pickText = t => { G.autoPick = c => { const i = c.opts.findIndex(x => x.includes(t)); return i < 0 ? c.opts.length - 1 : i; }; };
    await pump();
    pickText('산다'); await talk('realtor'); o.house = [S.house.lv, !!S.flags.own_house];
    await f.warp('myhouse', 6, 7, 1); o.map = f.m.id; L.openDecor(); G.decor.sel = 'bed'; L.placeAt(2, 2); G.decor.sel = 'stove'; L.placeAt(5, 2); G.decor.sel = 'bench'; L.placeAt(7, 2); G.decor.sel = null; L.placeAt(7, 2); L.placeAt(8, 3); L.closeDecor(); o.items = S.house.items.map(i => i.id + '@' + i.x + ',' + i.y); o.spots = f.spots.map(s => s.hint);
    pickText('잔다'); f.run(f.spots.find(s => s.hint === '잠자기').act); await idle(); o.day = S.day;
    await f.warp('cheongha', 16, 22, 1); o.backPos = [f.p.x / 16, f.p.y / 16]; 
    f.run(f.spots.find(s => s.hint === '낚시하기').act); await idle(); o.fishInv = Object.keys(S.inv).filter(k => k.startsWith('f_'));
    await f.warp('valley', 30, 14, 2); o.animals = f.animals.length; const a = f.animals[0]; f.p.x = a.x + 40; f.p.y = a.y; f.p.dir = 2; a.vx = a.vy = 0; const invBefore = Object.keys(S.inv).length; G.auto = false; G.dbg.input = 0; for (let i = 0; i < 10 && !a.gone; i++) { a.x = f.p.x - 30; a.y = f.p.y; a.t = 9; f.shootCd = 0; f.tickHunt.call(f, 0); const ev = new KeyboardEvent('keydown', { code: 'KeyJ' }); window.dispatchEvent(ev); window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyJ' })); G.fast(12); await sleep(1); } G.auto = true; o.hunted = [a.gone, Object.keys(S.inv).filter(k => ['meat', 'hide'].includes(k))];
    const g = f.npcs.find(n => n.stamp); f.run(g.talk); await idle(); o.gathered = Object.keys(S.inv).length; o.gatherGone = !f.npcs.find(n => n === g);
    const { RECIPES } = await import(new URL('js/items.js', location.href).href);
    for (const k of ['ore_iron', 'ore_blue', 'wood', 'jade', 'herb', 'meat', 'rice']) D.state.give(k, 12);
    o.craft = ['rb1', 'rj1', 'br1', 'ck3', 'bn3'].map(id => { const q = RECIPES.find(r => r.id === id); return [id, L.craft(q)]; }); S.weapon = 'black_sword'; o.ring = S.inv.jade_ring; o.pot = S.potion; o.furn = S.house.furn.stool;
    const st0 = D.stats(); const { learnNode } = await import(new URL('js/ui.js', location.href).href); const { TREES } = await import(new URL('js/items.js', location.href).href); const T = TREES[0]; o.tree = [learnNode(T.nodes[0]), learnNode(T.nodes[0]), learnNode(T.nodes[6])]; o.tp = S.tp;
    S.meal = { id: 'skewer', left: 3 }; const st1 = D.stats(); o.atk = [Math.round(st0.atk), Math.round(st1.atk)];
    await f.warp('clinic', 7, 8, 1); o.yunThere = !!f.npcs.find(n => n.id === 'yun'); S.love.yun = 70; pickText('마음을'); await talk('yun'); o.partner = S.partner; S.love.yun = 100; pickText('혼인'); await talk('yun'); o.married = S.married; o.yunGone = !G.field.npcs.find(n => n.id === 'yun');
    await f.warp('myhouse', 6, 7, 1); o.spouseHome = !!f.npcs.find(n => n.id === 'yun'); o.atk2 = Math.round(D.stats().atk); o.hp2 = D.stats().maxHp;
    pickText('잔다'); f.run(f.spots.find(s => s.hint === '잠자기').act); await idle(); o.breakfast = Object.keys(S.inv).filter(k => ['noodle', 'rice_ball', 'skewer'].includes(k));
    await f.warp('fiveclans', 24, 20, 1); pickText('비무를 청한다'); await talk('clan_paeng'); o.clanWin = !!S.flags.clan_paeng; o.accs = S.accs; o.taken = Object.keys(S.taken); o.weapons = S.weapons; S.daily = {}; pickText('청한다'); await talk('clan_paeng'); o.taken2 = Object.keys(S.taken);
    S.flags.rod = true; await f.warp('cheongha', 26, 18, 0); pickText('겨룬다'); await talk('wander'); o.wander = S.daily.wander; o.taken3 = Object.keys(S.taken).length;
    D.state.save(); const raw = JSON.parse(localStorage.getItem('gangho_save_v1')); o.saved = [raw.v, raw.house.lv, raw.married]; delete raw.v; raw.love = { yun: 2, so: 1, cheol: 0 }; delete raw.inv; delete raw.tree; delete raw.house; raw.tp = undefined; localStorage.setItem('gangho_save_v1', JSON.stringify(raw)); const m = D.state.load(); o.migrated = [m.v, m.love, !!m.inv, m.tp, m.house];
    return o;
  });
  console.log(JSON.stringify(r, null, 0)); console.log('ERR', errs.slice(0, 6).join('\n')); await b.close();
})().catch(e => { console.log(String(e).slice(0, 900)); process.exit(1); });
