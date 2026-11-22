// Open GAME_URL in a fresh browser context. The character and its inventory exist only in that context.
async function inspectGrowth() {
  const G=window.__G;
  const {SKILLS,WEAPONS}=await import('./js/data.js');
  const {ARMORS,PAIRS,plusCap}=await import('./js/gear.js');
  const {newState,stats,bonus,readSaveFile}=await import('./js/state.js');
  const T=await import('./js/training.js'), R=await import('./js/refinements.js');
  const {projectGear,gearRatings,compareGear}=await import('./js/gear-comparison.js');
  const {openMenu,closeMenu,showResult,shopItem}=await import('./js/ui.js');
  const {openCraft}=await import('./js/life.js'), {Battle,fight}=await import('./js/battle.js');
  const report={checks:0,skills:0,ranks:0,styles:0,refits:0,rewards:0};
  const check=(value,label)=>{report.checks++;if(!value)throw Error(label);};
  const equal=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
  const near=(a,b)=>Math.abs(a-b)<1e-7;
  const node=q=>{const el=document.querySelector(q);if(!el)throw Error('화면에 없음 '+q);return el;};
  const choose=(key,id)=>node('[data-'+key+'="'+id+'"]').click();
  const styles={검:'iron_sword',도:'iron_blade',창:'iron_spear',권:'fist_wrap'};
  const learned=Object.keys(SKILLS);
  const s=G.S=newState('수련생','BlueSamurai','m','normal');
  G.manual=G.noSave=true;G.auto=false;G.scene='field';G.battle=null;
  G.field.load('cheongha',22,25);
  s.weapons.push(...Object.values(styles),'blue_sword');
  s.skills=learned.slice();s.weapon='iron_sword';
  s.slots=['cloud_flash','breath',null,'flow_three'];
  for(const [type,id] of Object.entries(styles)) {
    const moves=learned.filter(key=>SKILLS[key].w===type);
    const sample={...s,weapon:id,skills:[...moves,...moves,'breath'],mastery:{breath:999}};
    const ranks=[0,5,15,32,60];
    for(const rank of ranks) {
      sample.mastery[moves[0]]=rank;
      check(T.practiceOf(sample,moves[0]).rank===ranks.indexOf(rank)+1,type+' 숙련 경계 '+rank);
    }
    for(const key of moves)sample.mastery[key]=60;
    const d=T.disciplineOf(sample,type), inactive=T.disciplineOf(sample,type==='검'?'창':'검');
    check(d.points===12 && d.stage==='통달' && inactive.points===0,type+' 중복과 공통 초식 제외');
    check(Object.entries(d.fx).every(([key,v])=>near((bonus(sample)[key] || 0)-(bonus({...sample,mastery:{}})[key] || 0),v)),type+' 실제 보너스');
    report.styles++;
  }
  for(const skill of Object.values(SKILLS)) {
    const w=styles[skill.w] || 'iron_sword', sheet={...s,weapon:w};
    const b=bonus(sheet),st=stats(sheet,b);
    for(let rank=1;rank<=5;rank++) {
      const cost=T.skillCost(skill,rank,b),duration=T.skillCooldown(skill,rank,st);
      check(cost>=0 && duration>0 && Number.isFinite(T.skillPower(skill,rank,st,b)),skill.name+' 성장 수치');
      check(cost<=T.skillCost(skill,1,b)+1e-8 && !/undefined|NaN/.test(T.skillEstimate(skill,rank,st,b)),skill.name+' 수련 표시');
      report.ranks++;
    }
    report.skills++;
  }
  // Import an old save with mixed families in its four slots, then cycle the player's own layouts.
  const legacy={...s,slots:['cloud_flash','one_point','breath',null],mastery:{cloud_flash:75}};
  delete legacy.weaponSlots;delete legacy.refinements;delete legacy.studyFocus;
  const migrated=await readSaveFile(new File([JSON.stringify(legacy)],'old.json'));
  check(migrated.slots[0]==='cloud_flash' && !migrated.slots.includes('one_point'),'기존 저장 검법 배치');
  check(!T.recordPractice(migrated,'cloud_flash',3) && migrated.mastery.cloud_flash===75,'기존 5성 사용 횟수 보존');
  T.equipWeapon(migrated,'iron_spear');check(migrated.slots[1]==='one_point','옛 창법 위치 복원');
  for(const id of Object.values(styles)) {
    const original=s.slots.slice(),old=s.weapon;
    const next=projectGear(s,'weapon',id);
    check(s.weapon===old && equal(s.slots,original),'미리보기 원본 유지');
    T.equipWeapon(s,id);
    check(equal(s.slots,next.slots) && s.slots.every(k=>!k || ['무관',WEAPONS[id].type].includes(SKILLS[k].w)),'계열 배치 '+id);
  }
  T.equipWeapon(s,'iron_sword');check(equal(s.slots,['cloud_flash','breath',null,'flow_three']),'빈 칸과 키 위치 복원');
  const commons=learned.filter(key=>SKILLS[key].w==='무관').slice(0,4);
  const universal={...s,slots:commons.slice(),weaponSlots:{}};
  T.equipWeapon(universal,'iron_spear');
  check(universal.slots.some(key=>SKILLS[key].w==='창'),'처음 드는 병기의 전용 초식');
  T.equipWeapon(universal,'iron_sword');check(equal(universal.slots,commons),'공통기 네 칸 수동 배치 복원');
  T.equipWeapon(s,'blue_sword');check(s.slots[2]===null,'같은 검법 배치 유지');
  const sold='tiger_spear', oldWeapon=s.weapon;
  check(shopItem.weapon(sold).info().desc.includes('→') && s.weapon===oldWeapon,'상점 실제 착용 비교');
  shopItem.weapon(sold).buy();check(s.weapon===sold && !s.slots.includes('cloud_flash'),'상점 자동 착용');
  T.equipWeapon(s,'iron_sword');
  s.skills=['cloud_flash','flow_three','wind_turn','breath','one_point','break_mount','iron_fist'];
  s.mastery={cloud_flash:15};s.pts=1;s.ins=2;
  openMenu('stat');
  const str=s.str;
  check(node('[data-up=str]').parentNode.textContent.includes('→'),'근력 투자 전 비교');
  choose('up','str');check(s.str===str+1 && !s.pts,'근력 투자');
  choose('t','mer');s.mer.lung=2;
  choose('t','stat');choose('t','mer');
  check(node('[data-mer=lung]').closest('.note').textContent.includes('방어'),'마지막 혈의 맥 완성 효과 미리보기');
  choose('mer','lung');check(s.mer.lung===3 && s.ins===0,'경맥 개통');
  choose('t','skill');const select=node('#study-focus');select.value='flow_three';select.dispatchEvent(new Event('change'));
  check(s.studyFocus==='flow_three' && node('[data-k=cloud_flash]').textContent.includes('첫 타격'),'초식 수련 선택과 첫 타격');
  choose('s',2);choose('k','wind_turn');check(s.slots[2]==='wind_turn','초식 배치');
  closeMenu();
  const [pair,pairName]=PAIRS[0], wind=Object.keys(ARMORS).filter(k=>ARMORS[k].set==='wind');
  s.armors=['scale_armor',...wind];s.accs=[...pair,'c_jade'];s.hearts.push('swift','tonap');
  openMenu('gear');choose('accslot',0);choose('a',pair[0]);choose('accslot',1);
  check(node('[data-a="'+pair[1]+'"]').textContent.includes(pairName+' 발동'),'장신구 짝 발동 미리보기');
  choose('a',pair[1]);check(s.acc===pair[0] && s.acc2===pair[1],'장신구 두 칸');
  choose('accslot',1);check(node('[data-a=c_jade]').textContent.includes(pairName+' 해제'),'짝 해제 미리보기');
  choose('a','c_jade');check(s.acc===pair[0] && s.acc2==='c_jade','지정한 장신구만 교체');
  for(let i=0;i<wind.length;i++) {
    if (i===1 || i===3) check(node('[data-r="'+wind[i]+'"]').textContent.includes((i+1)+'벌 발동'),'한 벌 발동 '+(i+1));
    if (i===3) check(!node('[data-r="'+wind[i]+'"]').textContent.includes('2벌 해제'),'네 벌 착용 후 두 벌 효과도 유지');
    choose('r',wind[i]);
  }
  closeMenu();
  const cfg={foes:['rowdy'],arena:'ring',spar:true,noIntro:true};
  const b=new Battle(cfg);G.battle=b;G.scene='battle';const p=b.p;
  p.hp=p.maxHp*.41;p.mp=p.maxMp*.57;
  openMenu('skill');check(node('#study-focus').disabled,'대결 시작 후 집중 수련 고정');
  choose('t','gear');choose('r','scale_armor');choose('h','swift');closeMenu();
  const st=stats(s);
  check(['atk','def','crit','regen','spd','maxHp','maxMp'].every(k=>near(p[k],st[k])) && near(b.st.cdMul,st.cdMul),'대결 중 교체 실효 수치');
  for(let i=0;i<12;i++){s.heart=i%2?'swift':'tonap';b.refreshGear();}
  check(near(p.hp/p.maxHp,.41) && near(p.mp/p.maxMp,.57),'탈착 반복 시 체력·내력 비율');
  const skill=SKILLS.cloud_flash, rank=T.practiceOf(s,'cloud_flash').rank, cost=T.skillCost(skill,rank,b.b);
  p.mp=cost-.01;b.hud();check(node('#sk0').classList.contains('off'),'내력 부족 표시');
  p.mp=cost;b.hud();check(!node('#sk0').classList.contains('off'),'할인 반영 사용 가능 표시');
  b.trySkill(p,'cloud_flash');
  check(near(p.mp,0) && near(p.cd.cloud_flash,T.skillCooldown(skill,rank,b.st)) && s.mastery.cloud_flash===16,'내력과 재사용시간 실제 적용');
  [s.slots[0],s.slots[2]]=[s.slots[2],s.slots[0]];b.refreshGear();p.mp=p.maxMp;
  const before=p.mp;b.trySkill(p,'cloud_flash');
  check(p.mp===before && s.mastery.cloud_flash===16,'다른 칸에서도 재사용시간 유지');
  b.trySkill(p,'wind_turn');check(p.mp<before && p.cd.wind_turn>0,'원래 칸의 다른 초식 바로 사용');
  G.battle=null;G.scene='field';
  for(const [enemy,multiplier,act,outcome,focus,gain] of [
    ['rowdy',1,true,'win','flow_three',1],['rowdy',10,true,'win','flow_three',2],
    ['rowdy',30,true,'win','flow_three',3],['rowdy',1,true,'win','breath',1],
    ['rowdy',1,false,'win','flow_three',0],['rowdy',1,true,'lose','flow_three',0],
    ['log',1,true,'win','flow_three',0],['rowdy',1,true,'win','one_point',0],['rowdy',0,true,'win','flow_three',0],
  ]) {
    s.studyFocus=focus;const was=s.mastery[focus] || 0;
    const pending=fight({...cfg,foes:[enemy],expMul:multiplier}), duel=G.battle;
    if(act)duel.basic(duel.p,{x:1,y:0});
    duel.actors[1].yielded=true;await duel.onDone(outcome);
    const result=await pending;await duel.onDone(outcome);
    check((s.mastery[focus] || 0)===was+gain && (result.study?.gain || 0)===gain,'실전 수련 보상 '+[enemy,multiplier,act,outcome,focus]);
    if(gain===3) {
      const done=showResult(result);check(node('.result').textContent.includes('숙련 +3회'),'승리창에서 수련 확인');node('.result').click();await done;
    }
    report.rewards++;
  }
  const beforeForge=s.silver;s.silver=0;s.inv={};const empty=openCraft('forge','대장간');
  check(node('[data-refit=light]').disabled && node('[data-upgrade]').disabled,'재료 없는 대장간');
  node('#modal .x').click();await empty;
  s.silver=beforeForge+10000;s.inv={ore_iron:99,ore_blue:99,hide:99,wood:99};
  for(const [type,id] of Object.entries(styles)) {
    T.equipWeapon(s,id);const done=openCraft('forge','대장간'),price=R.refitPrice(id);
    for(const [key,form] of Object.entries(R.refinements[type])) {
      const cash=s.silver,material=s.inv[price.material],base=gearRatings(s);
      const expected=gearRatings({...s,refinements:{...s.refinements,[id]:key}});
      const button=node('[data-refit="'+key+'"]');
      check(button.textContent.includes('→') && !equal(base,expected),'개조 수치 비교 '+form.name);
      button.click();button.click();
      check(s.silver===cash-price.silver && s.inv[price.material]===material-price.count && equal(gearRatings(s),expected),form.name+' 실제 비용과 능력치');
      check(node('[data-refit="'+key+'"]').disabled && R.currentRefinement(s)?.name===form.name,'장착한 개조 표시');
      report.refits++;
    }
    if (type==='검') {
      const upgrade=node('[data-upgrade]'),cash=s.silver,iron=s.inv.ore_iron;
      check(upgrade.textContent.includes('실제 공격력'),'강화 후 총 공격력 표시');upgrade.click();upgrade.click();
      check(s.wplus[id]===1 && s.silver===cash-40 && s.inv.ore_iron===iron-2,'강화 중복 결제 방지');
      s.wplus[id]=plusCap(id);node('#modal .x').click();await done;
      const capped=openCraft('forge','대장간');check(node('[data-upgrade]').disabled,'등급별 강화 한도');node('#modal .x').click();await capped;
    } else { node('#modal .x').click();await done; }
  }
  T.equipWeapon(s,'blue_sword');check(!R.currentRefinement(s),'동종의 다른 무기 개조 독립');
  T.equipWeapon(s,'iron_sword');
  const restored=await readSaveFile(new File([JSON.stringify(s)],'growth.json'));
  check(equal(restored.refinements,s.refinements) && equal(restored.weaponSlots,s.weaponSlots) && restored.studyFocus===s.studyFocus,'새 저장 재개');
  const cash=s.silver,plus=s.wplus.iron_sword,inv=JSON.stringify(s.inv),forge=openCraft('forge','대장간');
  choose('refit','reset');check(!R.currentRefinement(s) && s.silver===cash && JSON.stringify(s.inv)===inv && s.wplus.iron_sword===plus,'기본형 무료 복원과 강화 유지');
  node('#modal .x').click();await forge;check(!compareGear(s,s),'동일 장비 차이 없음');
  return report;
}
module.exports={inspectGrowth};
if(require.main===module)(async()=>{
  const {chromium}=require('playwright'),browser=await chromium.launch();
  try{
    const page=await browser.newPage();await page.goto(process.env.GAME_URL);
    await page.waitForFunction(()=>window.__G?.dbg);console.log(JSON.stringify(await page.evaluate(inspectGrowth)));
  } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
