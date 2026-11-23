const assert=require('node:assert/strict');
const {chromium}=require('playwright');

// Search for a standing position where the normal E interaction selects the
// object. Walk there with directional input, including the game's collisions.
async function walkTo(key) {
  const G=window.__G, field=G.field;
  const {Input}=await import('./js/core.js');
  const {personRadius}=await import('./js/landing.js');
  const {walkDir}=await import('./js/isoroom.js');
  const m=field.m, start={x:field.p.x,y:field.p.y};
  const match=t=>t && (t.key===key || t.id===key);
  const fake=Object.create(field), actions=['down','up','left','right'];
  const dirs=[[0,1],[0,-1],[-1,0],[1,0]];
  const queue=[{...start,path:[]}], seen=new Set();
  const step=2.8, radius=personRadius(m);
  let route;
  for (let i=0;i<queue.length && i<35000;i++) {
    const point=queue[i];
    const hash=Math.round((point.x-start.x)/step)+','+Math.round((point.y-start.y)/step);
    if (seen.has(hash)) continue;
    seen.add(hash);
    for (const [dir,[dx,dy]] of dirs.entries()) {
      fake.p={...point,dir};
      if (match(fake.target())) {route={steps:point.path,dir};break;}
      const [a,b]=m.isoRoom?walkDir(m,dx,dy):[dx,dy];
      const x=point.x+a*step,y=point.y+b*step;
      if (m.blocked(x,y) || field.npcs.some(n=>!n.ghost && !(n.hide>0) && Math.hypot(n.x-x,n.y-1-y)<radius)) continue;
      if (Math.hypot(x-start.x,y-start.y)>135) continue;
      queue.push({x,y,path:[...point.path,dir]});
    }
    if (route) break;
  }
  if (!route) throw Error('걸어갈 자리 없음 '+key);
  G.manual=true;
  for (const dir of route.steps) {
    Input.press(actions[dir]);field.update(1/30);Input.release(actions[dir]);
  }
  // Face the target with the same movement input as a player tapping an arrow.
  Input.press(actions[route.dir]);field.update(.0001);Input.release(actions[route.dir]);
  if (!match(field.target())) throw Error('실제 이동 뒤 대상 불일치 '+key+' '+JSON.stringify([field.p.x,field.p.y,field.target()?.id,field.target()?.hint]));
  Input.press('ok');field.update(1/60);Input.release('ok');G.manual=false;
}
async function audit() {
  const G=window.__G, {FINDS,discoverySpots,leapRank,leap}=await import('./js/finds.js');
  const {PEOPLE}=await import('./js/people.js'),{DB}=await import('./js/items.js');
  const {SKILLS,HEARTS,WEAPONS}=await import('./js/data.js');
  const {newState,load,save,readSaveFile,masteryLv}=await import('./js/state.js');
  const {raiseArt,studyPrice,heartStrength}=await import('./js/martial-study.js');
  const check=(value,n)=>{if(!value)throw Error(n);};
  const s=G.S;
  G.manual=true;
  save();const loaded=load();
  check(loaded.study.skills.dart===2 && loaded.ties.dock_tutor.taken.length===1 && loaded.finds['cheongha:dock'],'새 저장 왕복');
  const tea=s.inv.tea || 0;
  discoverySpots(G.field.m,s).find(q=>q.key==='cheongha:dock').act();
  check((s.inv.tea || 0)===tea,'열린 상자 중복 지급');
  const {meetingActions}=await import('./js/people.js');
  const tutor=PEOPLE.cheongha.find(p=>p.id==='dock_tutor');
  check(meetingActions(s,tutor)===meetingActions(loaded,tutor),'만남 조건 저장 왕복');
  check(!raiseArt(s,'wind_turn'),'모르는 초식 승급');
  for (const list of Object.values(PEOPLE)) for (const p of list) {
    check(DB[p.likes] && (!p.skill || SKILLS[p.skill]) && (!p.heart || HEARTS[p.heart]),p.name+' 자료');
  }
  const starts={cheongha:[22,25],bamboo:[18,30],pass:[2,13],cloudmt:[22,35],guhwa:[24,29]};
  for (const [map,list] of Object.entries(FINDS)) {
    G.field.load(map,...starts[map]);const m=G.field.m, spots=discoverySpots(m,s);
    const step=4, open=[], visited=new Set();
    const [sx,sy]=m.freeNear(G.field.p.x,G.field.p.y);
    open.push([Math.round(sx/step),Math.round(sy/step)]);
    for(let i=0;i<open.length;i++) {
      const [x,y]=open[i],h=x+','+y;
      if (visited.has(h) || m.blocked(x*step,y*step))continue;
      visited.add(h);for(const [dx,dy] of [[0,1],[0,-1],[-1,0],[1,0]])open.push([x+dx,y+dy]);
    }
    for (const [id,,x,y,item] of list) {
      check(WEAPONS[item] || DB[item] || ['study','silver'].includes(item),'없는 보상 '+item);
      const box=spots.find(q=>q.key===map+':'+id && q.kind==='find');
      const entry=spots.find(q=>q.key===box.key && q.kind==='leap' && !q.back) || box;
      check(!m.blocked(box.px,box.py),'막힌 도착점 '+box.key);
      check([...visited].some(h=>{const [x,y]=h.split(',').map(Number);return Math.hypot(entry.px-x*step,entry.py-y*step)<16;}),'닿을 수 없는 발견물 '+box.key);
    }
  }
  G.field.load('pass',27,12);const ledge=G.field.spots.find(q=>q.need===2 && !q.back);
  const before={...G.field.p};await ledge.act();
  check(G.field.p.x===before.x && s.leapSeen[ledge.key] && !s.crossings?.[ledge.key],'경공 2단계 제한');
  s.lv=6;G.field.load('cheongha',10,24);G.field.spots.find(q=>q.kind==='training').act();
  check(leapRank(s)===2,'신법 수련');G.field.load('pass',27,12);
  await leap(G.field,ledge.key,2,ledge.to);check(s.crossings[ledge.key] && Math.hypot(G.field.p.x-ledge.to[0],G.field.p.y-ledge.to[1])<.001,'경공 착지');
  s.hearts.push('tonap');s.study.points=100000;
  for(let i=1;i<10;i++)check(raiseArt(s,'tonap'),'심법 승급 '+i);
  check(!raiseArt(s,'tonap') && s.study.hearts.tonap===10 && s.ins>=4,'심법 극성');
  s.heart='tonap';s.hearts.push('swift');s.study.supports=['swift'];
  check(Math.abs(heartStrength(s,'tonap')-1.4)<1e-9 && heartStrength(s,'swift')===.15,'심법 주·보조 적용');
  s.mastery.dart=60;check(studyPrice(s,'dart')===Math.round(20*2**1.5*.6),'숙련 할인');
  const residents=new Set();
  for(const period of ['begin','guhwa','free']) {
    G.S=newState('답사객','BlueSamurai','m','normal');
    if(period==='guhwa') Object.assign(G.S.flags,{step:'c3b',burned:true,boat_guhwa:true,monk_met:true});
    if(period==='free') (await import('./js/free.js')).initFree();
    for (const [map,position] of Object.entries(starts)) {
      G.field.load(map,...position);
      for (const n of G.field.npcs) if(n.person) residents.add(n.person.id);
    }
  }
  check(residents.size===30,'본편과 자유 강호에 실제로 등장한 인물 수 '+residents.size);
  const old=newState('옛 길손','BlueSamurai','m','normal');delete old.study;old.mastery.dart=32;old.skills=['dart'];
  const legacy=await readSaveFile(new File([JSON.stringify(old)],'v5.json'));
  check(!legacy.study && masteryLv('dart',legacy)===4 && !raiseArt(legacy,'dart'),'기존 저장 호환');
  return {finds:Object.values(FINDS).flat().length, people:new Set(Object.values(PEOPLE).flat().map(p=>p.id)).size};
}

(async()=>{
  const browser=await chromium.launch();
  try {
    const page=await browser.newPage({viewport:{width:1280,height:720}}),errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    page.on('console',msg=>{if(msg.type()==='error')errors.push(msg.text());});
    await page.goto(process.env.GAME_URL);await page.waitForFunction(()=>window.__G?.dbg);
    await page.evaluate(()=>{__G.auto=true;__G.speedup=4;__G.bot={skill:1};});
    await page.click('#bNew');await page.fill('#nm','나루객');await page.click('#go');
    await page.waitForFunction(()=>__G.S?.flags.step==='p0a' && !__G.field.busy);
    const begin=Date.now(),idle=()=>page.waitForFunction(()=>!__G.field.busy);
    for(const id of ['dock','quay']){await page.evaluate(walkTo,'cheongha:'+id);await idle();}
    assert.equal(await page.evaluate(()=>__G.S.inv.tea),2);
    const act=async index=>{
      await page.evaluate(walkTo,'dock_tutor');
      await page.locator('[data-meet="'+index+'"]').click();await idle();
    };
    await act(1);await act(0);await act(2);
    await page.evaluate(walkTo,'dock_tutor');
    await page.evaluate(()=>{__G.auto=false;});
    await page.click('[data-meet="3"]');
    await page.locator('.result').click({timeout:90000});
    await page.locator('.loots .loot').first().click();
    await idle();
    await page.evaluate(()=>{__G.auto=true;});
    assert.equal(await page.evaluate(()=>__G.S.love.dock_tutor),40);
    await act(4);
    await page.click('#mbtn');await page.click('[data-t="skill"]');await page.click('[data-raise="dart"]');
    await page.click('#modal .x');assert.equal(await page.evaluate(()=>__G.S.study.skills.dart),2);
    const elapsed=(Date.now()-begin)/1000;
    const counts=await page.evaluate(audit);assert.deepEqual(counts,{finds:25,people:30});
    assert.deepEqual(errors.filter(e=>!e.includes('favicon')),[]);
    console.log('나루에서 실제 이동·선물·비무·사사·2성 통과',elapsed+'초 (자동 대사와 전투 봇).',counts);
  } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
