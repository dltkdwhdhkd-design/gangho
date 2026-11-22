// Run against GAME_URL with Playwright. Each browser context has its own save and touch settings.
const assert=require('node:assert/strict');
async function explore(browser,url) {
  const context=await browser.newContext({viewport:{width:1060,height:596}}),page=await context.newPage();
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const ready=()=>page.waitForFunction(()=>window.__G?.dbg,null,{timeout:120000});
  const point=()=>page.evaluate(()=>[__G.field.p.x,__G.field.p.y,__G.field.p.dir]);
  const tab=key=>page.locator('[data-t="'+key+'"]').click();
  const report={};
  try{
    await page.goto(url,{waitUntil:'domcontentloaded'});await ready();
    await page.evaluate(async()=>{
      const G=__G;G.manual=G.noSpawn=true;G.S=G.dbg.newState('청풍','BlueSamurai','m','normal');G.scene='field';G.bgDraw=null;document.querySelector('#screen').replaceChildren();
      G.field.load('b_hwasan',23,40,1);
    });
    // Open a region from a cold load, before exploring the overworld, then switch to the world tab and back.
    for(const id of ['b_hwasan','r_hwasan_clinic']){
      await page.evaluate(id=>{__G.field.load(id,id.startsWith('r_')?8:23,id.startsWith('r_')?9:40,1);},id);
      await page.click('#mapb');await page.waitForSelector('#mapc');
      assert.equal(await page.locator('[data-v=area].on').count(),1,id+' 지역 지도');
      await page.keyboard.press('Tab');await page.waitForSelector('[data-v=world].on');
      await page.keyboard.press('Tab');await page.waitForSelector('[data-v=area].on');
      await page.locator('#modal .x').click();
    }
    report.coldMaps=2;
    await page.evaluate(async()=>{
      const G=__G,s=G.S;s.weapon='iron_sword';s.weapons.push('iron_sword');s.skills=['cloud_flash','flow_three'];
      s.slots=['cloud_flash',null,null,null];G.field.load('cheongha',22,25);
      (await import('./js/ui.js')).openMenu('skill');
    });
    await page.locator('#study-focus').focus();await page.keyboard.press('ArrowDown');
    assert.equal(await page.evaluate(()=>__G.S.studyFocus),'cloud_flash','키보드로 수련 선택');
    await page.locator('#modal .x').click();
    const start=await point();await page.keyboard.down('ArrowRight');
    await page.evaluate(()=>{for(let i=0;i<12;i++)__G.field.update(1/60);});await page.keyboard.up('ArrowRight');
    const beforeTitle=await point();assert.ok(Math.hypot(beforeTitle[0]-start[0],beforeTitle[1]-start[1])>6,'실제 이동');
    await page.click('#mbtn');await tab('set');await page.click('#tt');await page.click('#bLoad');
    assert.deepEqual(await point(),beforeTitle,'이어 하기의 위치와 방향');report.fieldPosition=true;
    await page.evaluate(()=>{
      const G=__G;G.S.house.lv=2;G.field.load('myhouse',0,0);
      const f=G.field;for(let y=40;y<f.m.h*16-30;y+=8)for(let x=48;x<f.m.w*16-32;x+=8){
        if(Math.hypot(x-f.p.x,y-f.p.y)>50&&!f.m.blocked(x,y)&&!f.npcs.some(n=>Math.hypot(n.x-x,n.y-y)<20)){
          f.p.x=x;f.p.y=y;f.p.dir=2;return;
        }
      }throw Error('집 안 빈 자리');
    });
    const home=await point();await page.click('#mbtn');await tab('save');
    await page.locator('.slotc[data-i="0"] [data-a="save"]').click();await page.locator('#modal .x').click();
    await page.evaluate(()=>__G.field.load('myhouse',0,0));assert.notDeepEqual(await point(),home);
    await page.click('#mbtn');await tab('save');
    const load=page.locator('.slotc[data-i="0"] [data-a="load"]');await load.click();await load.click();
    assert.deepEqual(await point(),home,'집 안 저장 칸 복원');report.homePosition=true;
    await page.evaluate(()=>{
      const G=__G;G.S.house.items=[];G.S.house.furn={stool:2,bed:1};G.field.load('myhouse',0,0);
      if(G.hd.active(G.field.m))G.hd.aim(G.field);
      G.fast(0);
    });
    await page.click('#dbtn');await page.click('[data-f=stool]');
    const floor=await page.evaluate(()=>{
      const G=__G,f=G.field,cv=document.querySelector('#cv'),r=cv.getBoundingClientRect(),points=[];
      for(let y=2;y<f.m.h-3;y+=2)for(let x=2;x<f.m.w-3;x+=2){
        if(!G.life.canPlace('stool',x,y))continue;
        const wx=(x+.5)*16,wy=(y+.5)*16;
        const [sx,sy]=G.hd.active(f.m)?G.hd.proj(wx,wy):[(wx-f.cam.x)*4,(wy-f.cam.y)*4];
        const px=r.left+r.width*sx/1280,py=r.top+r.height*sy/720;
        if(document.elementFromPoint(px,py)===cv)points.push([x,y,px,py]);
      }
      return points;
    });
    assert.ok(floor.length>=4,'화면에서 짚을 수 있는 바닥');
    for(const [x,y,px,py] of floor){
      await page.mouse.move(px,py);
      assert.deepEqual(await page.evaluate(()=>[__G.decor.cx,__G.decor.cy]),[x,y],'바닥과 배치 커서');
    }
    const [tx,ty,clickX,clickY]=floor.at(-1);await page.mouse.click(clickX,clickY);
    assert.deepEqual(await page.evaluate(()=>__G.S.house.items.map(o=>[o.id,o.x,o.y])),[['stool',tx,ty]],'선택한 칸에 배치');
    const trap=await page.evaluate(async()=>{
      const G=__G,f=G.field,h=G.S.house,{buildHouse}=await import('./js/maps.js');
      const {canReachHouseExit}=await import('./js/landing.js');
      const bed={id:'bed',x:3,y:2};
      const layout=buildHouse({...G.S,house:{...h,items:[bed]}},false);
      const solid=layout.stamps[0].sol,x=solid.x+solid.w/2,y=solid.y+solid.h/2;
      f.p.x=x;f.p.y=y;G.decor.sel='bed';G.life.placeAt(bed.x,bed.y);
      const valid=h.furn.bed===1 && !h.items.some(o=>o.id==='bed') && !f.m.blocked(x,y);
      G.life.closeDecor();h.items=[bed];G.S.px=x;G.S.py=y;
      f.load('myhouse',x/16,y/16,0,'saved');
      const recovered=canReachHouseExit(f.m,f.p.x,f.p.y) && !f.m.blocked(f.p.x,f.p.y);
      // A clear point may be cut off from the door by furniture on all four sides.
      const pocket={...f.m,w:8,h:8,portals:[{to:'cheongha',x:48,y:112,w:32,h:16}],
        blocked(px,py){if(px<5||py<5||px>123||py>127)return true;
          return (px>=32&&px<=88&&(py>=32&&py<=40||py>=80&&py<=88))||
            (py>=32&&py<=88&&(px>=32&&px<=40||px>=80&&px<=88));}};
      return {valid,recovered,sealed:!canReachHouseExit(pocket,60,60),outside:canReachHouseExit(pocket,60,100)};
    });
    assert.deepEqual(trap,{valid:true,recovered:true,sealed:true,outside:true});report.houseTiles=floor.length;report.houseEscape=true;
    await page.click('#dbtn');await page.click('#mbtn');await tab('set');await page.click('#tt');await page.click('#bLoad');
    assert.equal(await page.evaluate(()=>!!__G.decor||!!document.querySelector('#decor')),false,'집 편집 종료 후 이어 하기');
    report.editorClosed=true;
    await page.evaluate(async()=>{
      const G=__G;G.field.load('cheongha',22,25);const {fight}=await import('./js/battle.js'),{openMenu}=await import('./js/ui.js');
      (await import('./js/state.js')).save();fight({foes:['rowdy'],arena:'ring',spar:true,noIntro:true});openMenu('set');
    });
    await page.click('#tt');await page.waitForSelector('#bLoad',{timeout:120000});await ready();
    await page.evaluate(()=>{__G.manual=true;});await page.click('#bLoad');
    assert.equal(await page.evaluate(()=>__G.scene==='field' && !__G.battle && !document.querySelector('#stage').classList.contains('inbattle')),true,'비무에서 제목을 거쳐 이어 하기');
    await page.click('#mbtn');await tab('skill');assert.equal(await page.locator('#study-focus').isEnabled(),true);
    report.battleReturn=true;assert.deepEqual(errors,[]);
  }finally{await context.close();}
  const phone=await browser.newContext({hasTouch:true,isMobile:true,viewport:{width:844,height:390}});
  try{
    const p=await phone.newPage(),issues=[];p.on('pageerror',e=>issues.push(e.message));
    await p.goto(url,{waitUntil:'domcontentloaded'});await p.waitForFunction(()=>window.__G?.dbg,null,{timeout:120000});await p.waitForTimeout(750);
    assert.equal(await p.locator('#touch').isVisible(),false);
    await p.tap('#bNew');await p.tap('[data-gender=f]');await p.fill('#nm','서하');await p.waitForTimeout(350);
    assert.deepEqual(issues,[]);report.touchTitle=true;
  }finally{await phone.close();}
  return report;
}
module.exports={explore};
if(require.main===module)(async()=>{
 const {chromium}=require('playwright'),b=await chromium.launch();
 try{console.log(await explore(b,process.env.GAME_URL));}finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
