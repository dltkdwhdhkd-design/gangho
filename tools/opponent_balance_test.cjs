// GAME_URL로 실행 중인 게임에서 새 캐릭터로 문파 전투를 확인한다.
const assert = require('node:assert/strict');

async function inspectOpponents() {
  const G=window.__G, {Battle}=await import('./js/battle.js'), {FOES,MOVES}=await import('./js/foes.js');
  const {FACS,initFree}=await import('./js/free.js'), {ctx}=await import('./js/ctx.js');
  const {tickDialog}=await import('./js/dialog.js'), {fanRanks}=await import('./js/martial-standing.js');
  const issues=[], check=(ok,label)=>{if(!ok)issues.push(label);};
  G.manual=G.auto=G.noSave=G.noSpawn=true; G.speedup=1000; G.bgDraw=null; G.scene='field';
  document.querySelector('#screen').replaceChildren();
  G.S=G.dbg.newState('연무객','BlueSamurai','m','normal'); initFree();
  const s=G.S; s.lv=27;
  s.fr.sect={name:'연무문',b:{},tech:[],guests:[],log:[],d:[1,2].map(i=>({n:'제자'+i,lv:24,spr:'Samurai',job:'follow'}))};
  G.field.load('r_hwasan_elder',9,8); await G.field.peopleReady;
  const ring=new Battle({foes:['rowdy'],arena:'ring',optional:true,noIntro:true});
  function actor(id,team=1) {
    const a=ring.spawn(id,team,ring.p.x,ring.p.y-72);
    ring.actors.pop(); return a;
  }
  for(const f of FACS) {
    const roles=['외문 제자','내문 제자','사범','후계자','장로','장문인급'];
    const roster=roles.map(role=>actor(G.jh.disciple(f,27,role)));
    for(let i=1;i<roster.length;i++){
      const a=roster[i], before=roster[i-1];
      check(a.realm>before.realm && a.maxHp>before.maxHp && a.atk>before.atk,f.name+' '+roles[i]+' 위계');
    }
    const elder=roster[4];
    const floor=Math.round(3180*(1+(elder.equipment.fx.hp || 0)/200));
    check(elder.maxHp>=Math.round(floor*1.32) && elder.maxPoise>=210 && elder.guardChance>.55,f.name+' 장로');
    check(elder.moves.some(m=>m.startsWith('x_'+f.id)) && elder.moves.every(m=>MOVES[m]),f.name+' 장로 초식');
    const teacher=G.jh.disciple(f,21,'사범'), student=G.jh.disciple(f,21,'진전 제자');
    check(teacher!==student && FOES[teacher].position==='사범',f.name+' 동경지 직위');
    const rep=actor('clan_'+f.id);check(rep.def_.position && rep.atk>0 && rep.maxHp>0,f.name+' 대표');
  }
  const people=new Map();
  for(const map of new Set(G.fan.P.map(person=>person[2]))) {
    G.field.load(map,12,12);
    for(const n of G.field.npcs)if(n.opponent)people.set(n.id,n);
  }
  for(const [id] of G.fan.P) {
    const n=people.get(id), body=n && actor(n.opponent());
    check(body && body.realm===fanRanks[id] && body.def_.artId===id && body.equipment?.weapon &&
      body.moves.length>=2 && body.moves.every(m=>MOVES[m]),id+' 필드 상대');
  }
  const foe=actor('rowdy'), ally=actor('rowdy',0), dummy=actor('log');
  check(foe.maxHp>foe.def_.hp && foe.atk>foe.def_.atk,'보통 적 강화');
  check(ally.maxHp===Math.round(ally.def_.hp)*1.4 && Math.abs(ally.atk-ally.def_.atk*.7)<1e-8,'동료 능력치');
  check(dummy.maxHp===FOES.log.hp && dummy.atk===0,'장작 수련');
  const escort={foes:['rowdy'],allies:['so_ally']}, normal=G.sect.withFollow(escort);
  check(normal.allies.length===3 && normal.allies[0]==='so_ally','필드 호위');
  for(const rule of [{spar:true},{yieldAt:.2},{noFollow:true}])
    check(G.sect.withFollow({...escort,...rule}).allies.join()==='so_ally','동행 조건 '+JSON.stringify(rule));

  const settle=async(promise)=>{
    let done=false, error;promise.then(()=>{done=true;},e=>{done=true;error=e;});
    for(let i=0;i<400 && !done;i++){tickDialog(1/60);await new Promise(r=>setTimeout(r,0));}
    if(error)throw error;
    if(!done)throw Error('대화가 끝나지 않았다');
  };
  const snapshot=a=>({school:a.def_.school || (a.id.startsWith('clan_')?a.id.slice(5):null),realm:a.realm,hp:a.maxHp,atk:a.atk,poise:a.maxPoise,
    moves:a.moves.join(),weapon:a.equipment?.weapon.name});
  G.field.load('r_hwasan_elder',9,8);
  const elder=G.field.npcs.find(n=>n.id==='elder1'),expected=snapshot(actor(G.jh.disciple(G.free.fac('hwasan'),s.lv,'장로')));
  G.autoPick=c=>Math.max(0,c.opts.findIndex(s=>s.includes('대련을 청한다')));
  const talk=elder.talk();
  for(let i=0;i<300 && !G.battle;i++){tickDialog(1/60);await new Promise(r=>setTimeout(r,5));}
  if(!G.battle)throw Error('장로원 대련이 시작되지 않았다');
  const live=G.battle, target=live.actors.find(a=>a.team===1);
  check(live.actors.length===2 && live.cfg.spar && JSON.stringify(snapshot(target))===JSON.stringify(expected),'장로원 일대일 대련');
  check(live.bossA===target && document.querySelector('#bPos') && document.querySelector('#hud .boss .realm')?.textContent.includes('화경'),'화경 장로의 체력과 자세 표시');
  const hd=!!live.stage;
  G.bot={skill:.7};
  for(let i=0;i<10800 && !live.ended;i++)live.update(1/60);
  check(live.ended,'장로원 승패 판정');live.finish();await settle(talk);
  check(G.scene==='field' && G.field.m.id==='r_hwasan_elder','장로원 복귀');

  // 같은 사람이 비무, 필드 공격 또는 게시판에서 어느 전투원으로 해석되는지 검사한다.
  const originalDuel=ctx.duel;let entered;
  ctx.duel=async cfg=>{entered={cfg,actor:snapshot(actor(cfg.foes[0]))};return false;};
  try {
    await settle(G.crime.attack(elder,'r_hwasan_elder',true));
    check(JSON.stringify(entered.actor)===JSON.stringify(expected),'장로원 필드 공격');
    G.field.load('b_jongnam',12,12);const npc=G.field.npcs.find(n=>n.id==='samaseung');
    const known=snapshot(actor(npc.opponent()));await settle(G.crime.attack(npc,'b_jongnam',true));
    check(entered.cfg.foes[0]==='fan_samaseung' && JSON.stringify(entered.actor)===JSON.stringify(known),'사마승 고유 무공과 장비');
    G.field.load('fort',13,21);const master=G.field.npcs.find(n=>n.id==='guyang');
    const local=snapshot(actor('clan_nokrim'));await settle(G.crime.attack(master,'fort',true));
    check(entered.cfg.foes[0]==='clan_nokrim' && JSON.stringify(entered.actor)===JSON.stringify(local),'녹림 총채주');
    await settle(G.free.runJob({type:'spar',rival:'shaolin',lv:32,map:'cheongha'}));
    check(entered.cfg.spar && entered.actor.school==='shaolin' && entered.actor.realm===5 && entered.actor.moves.includes('x_shaolin'),'소림 대련 의뢰');
  } finally {ctx.duel=originalDuel;G.battle=null;}
  return {factions:FACS.length,people:people.size,elder:expected,hd,outcome:live.outcome,issues};
}
module.exports={inspectOpponents};
if(require.main===module)(async()=>{
  const {chromium}=require('playwright'),browser=await chromium.launch();
  try{
    const p=await browser.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
    await p.goto(process.env.GAME_URL);await p.waitForFunction(()=>window.__G?.dbg);
    const result=await p.evaluate(inspectOpponents);console.log(JSON.stringify(result,null,2));
    assert.deepEqual(result.issues,[]);assert.deepEqual(errors,[]);
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
