// Run against a running game with GAME_URL set. The page uses a fresh, unsaved character.
const assert = require('node:assert/strict');
async function inspectCombat() {
  const G=window.__G, {Battle}=await import('./js/battle.js'),{SKILLS,BASIC}=await import('./js/data.js');
  const {FOES,MOVES}=await import('./js/foes.js'),{COMP}=await import('./js/party.js'),{FACS}=await import('./js/free.js');
  const {motionFor}=await import('./js/hd2d/combat-art.js'),{openMenu,closeMenu}=await import('./js/ui.js');
  const {nativeMoveNames}=await import('./js/combat-loadout.js');
  const fail=[],check=(v,label)=>{if(!v)fail.push(label);};
  G.manual=G.noSave=true;G.S=G.dbg.newState('연무','BlueSamurai','m','normal');
  G.field.load('cheongha',22,25);
  const b=new Battle({foes:['rowdy'],arena:'ring',spar:true,noIntro:true}); G.battle=b;
  const report={human:0,fan:0,factions:FACS.length,companions:Object.keys(COMP).length,clanSkills:0,fail};
  const roster=new Set(Object.keys(FOES));
  for (const [id] of G.fan.P) {roster.add(G.fan.ally(id));report.fan++;}
  for (const id of Object.keys(COMP)) roster.add(G.party.spar(id));
  for (const fac of FACS) for (const role of ['외문 제자','내문 제자','사범','장로']) roster.add(G.jh.disciple(fac,1,role));
  const checkNames=new Set(), data={};
  for (const id of roster) {
    const f=FOES[id];if (!f || f.mon || f.big || f.dummy || !f.spr?.startsWith('chars/'))continue;
    const x=b.spawn(id,1,b.p.x,b.p.y-50);report.human++;
    check(x.equipment?.weapon?.name && x.equipment?.armor?.name && x.equipment?.trinket?.name,id+' 무장');
    check(Number.isFinite(x.atk+x.def+x.spd+x.maxHp) && x.atk>0,id+' 능력치');
    for (const m of x.moves) check(!!MOVES[m] && !!(MOVES[m].name || SKILLS[m]?.name || nativeMoveNames[m]),id+' 초식 '+m);
    if(id.startsWith('fan_'))checkNames.add(x.name);
    if(['fan_cheongmyeong_ally','fan_dangbo_ally','fan_maengso_ally','spar_yun','clan_namgung'].includes(id))
      data[id]=[x.equipment?.weapon.name,x.equipment?.armor.name,x.equipment?.trinket.name,...x.moves.map(m=>MOVES[m]?.name||m)];
    b.actors.pop();
  }
  report.sample=data;check(checkNames.size===39,'화산귀환 무장 인물 수');
  const realRandom=Math.random;
  try {
    Math.random=()=>.5;
    const target=b.actors[1], attacker=b.spawn('clan_hwasan',1,b.p.x,b.p.y-60);
    const scales={};
    report.skills=Object.keys(SKILLS).length;report.basicStrikes=Object.values(BASIC).flat().length;
    const player=b.p, soft={def:0}, hard={def:65};
    for (const skill of [...Object.values(SKILLS),...Object.values(BASIC).flat()]) {
      check(skill.dur>0 && (skill.mp ?? 0)>=0 && (skill.cd ?? 0)>=0,skill.name+' 소모량');
      for (const step of skill.steps) {
        const strike=step.hit || step.proj || step.zone || step.moonstrike || step.counter;
        if (!strike || !Number.isFinite(strike.mul)) continue;
        const lo=b.calc(player,soft,strike,skill),hi=b.calc(player,hard,strike,skill);
        check(Number.isFinite(lo+hi) && lo>hi && hi>0,(skill.id || '기본공격')+' 방어에 따른 피해');
      }
    }
    for (const [id,skill] of Object.entries(SKILLS)) {
      if (!skill.fac) continue;
      const npc=MOVES[id];check(!!npc,id+' NPC 무공');if(!npc)continue;report.clanSkills++;
      check(skill.ult===npc.ult && skill.fac===npc.fac,id+' 절초와 소속');
      for (const [i,step] of skill.steps.entries()) for (const kind of ['hit','proj','zone']) {
        if (!step[kind])continue;
        const src=step[kind],dest=npc.steps[i][kind];
        const ratio=b.calc(attacker,target,dest,npc)/b.calc(attacker,target,src,{...skill,fromSkill:false});
        check(Math.abs(ratio-(skill.ult ? .64 : .72))<1e-8,id+' 피해 '+kind);
        if (!scales[skill.ult?'ultimate':'normal'])scales[skill.ult?'ultimate':'normal']=Number(ratio.toFixed(3));
      }
    }
    report.ratio=scales;
    const plum=MOVES.x_hwasan5;attacker.sk=plum;attacker.skKey=plum.id;attacker.st='skill';attacker.skT=.65;
    const pose=motionFor(attacker,'cheongmyeong');
    check(plum.steps.find(s=>s.proj).proj.img==='plum' && !['dart','bow'].includes(pose[1]),'매화만개 검기와 검 모션');
    const healer=b.spawn(G.party.spar('yun'),1,b.p.x,b.p.y-40), heal=MOVES.x_yunui3;
    check(heal?.healing && healer.moves.includes(heal.id),'윤설 치유');healer.moves=[heal.id];healer.st='idle';healer.atkCd=0;healer.hp=healer.maxHp;
    b.ai(healer,1/60);check(healer.sk!==heal,'만피에 치유 낭비');
    healer.st='idle';healer.hp=healer.maxHp*.45;healer.atkCd=0;b.ai(healer,1/60);
    check(healer.sk===heal&&healer.cd[heal.id]>=16,'부상 시 치유와 재사용시간');
    const hp=healer.hp;for(let i=0;i<90;i++)b.tickActor(healer,1/60);
    check(healer.hp>hp&&healer.hp<healer.maxHp*.56,'치유 실효량');
    const a=b.p; a.ax=1;a.ay=0;a.crit=0; target.x=a.x+8;target.y=a.y;target.maxHp=target.hp=1e7;target.r=10;target.iframe=0;
    b.actors=[a,target];const volley=plum.steps.find(q=>q.proj).proj, single={...volley,n:1};
    b.shoot(a,single,SKILLS.x_hwasan5);b.tickProj(0);const one=1e7-target.hp;target.hp=1e7;
    b.shoot(a,volley,SKILLS.x_hwasan5);b.tickProj(0);const many=1e7-target.hp;
    report.volley={single:one,sameTarget:many,factor:+(many/one).toFixed(2)};
    check(one>0 && many/one>1.7 && many/one<2.6,'한 표적에 겹친 투사체');
    for(let i=0;i<8;i++)b.poison(a,target,plum,.2,3);
    b.poison(attacker,target,plum,.2,3);check(target.dots.length===2,'같은 독 갱신과 다른 시전자 구별');
    openMenu('fighters');check(document.querySelector('#modal .body').textContent.includes(target.equipment.weapon.name),'전투 메뉴 장비');closeMenu();
  } finally {Math.random=realRandom;G.battle=null;}
  return report;
}
module.exports={inspectCombat};
if(require.main===module)(async()=>{
 const {chromium}=require('playwright'),browser=await chromium.launch();
 try{const page=await browser.newPage();await page.goto(process.env.GAME_URL);await page.waitForFunction(()=>window.__G?.dbg);
 const result=await page.evaluate(inspectCombat);console.log(JSON.stringify(result,null,2));assert.deepEqual(result.fail,[]);}
 finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
