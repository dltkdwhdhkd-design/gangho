// Inject temporary HTTP errors in an isolated browser. No production requests are required.
const assert=require('node:assert/strict');

async function inspectStartup(browser,url) {
  const context=await browser.newContext(),page=await context.newPage();
  try {
    const counts=new Map(),events=[],errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    page.on('request',req=>{
      const path=new URL(req.url()).pathname.split('/gangho/')[1];
      if(path?.startsWith('assets/'))counts.set(path,(counts.get(path)||0)+1);
    });
    const slow='**/assets/hd/startup/00.json';
    let packCalls=0;
    await page.route(slow,async route=>{
      events.push(Date.now());
      if(++packCalls===1)await route.fulfill({status:429,headers:{'Retry-After':'1','Cache-Control':'no-store'},body:''});
      else await route.continue();
    });
    // One missing pack must use the original released files for its group.
    await page.route('**/assets/hd/startup/23.json',route=>route.fulfill({status:404,body:''}));
    await page.goto(url,{waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>window.__G?.dbg && __G.hd?.ready,null,{timeout:180000});
    assert.equal(packCalls,2);assert.ok(events[1]-events[0]>=950,'Retry-After');
    const bootFiles=[...counts.keys()].filter(path=>!path.includes('/startup/')).length;
    assert.ok(bootFiles<510,'individual startup files '+bootFiles);
    const artwork=await page.evaluate(async()=>{
      const {G,IMG}=await import('./js/core.js'),{assetJSON}=await import('./js/asset-loader.js');
      const hd=await assetJSON('assets/hd/list.json');
      const absent=hd.filter(key=>!IMG[key]?.naturalWidth);
      G.S=G.dbg.newState('나그네','BlueSamurai','m','normal');G.manual=G.noSave=true;
      G.scene='field';G.bgDraw=null;document.querySelector('#screen').replaceChildren();
      G.field.load('r_hwasan_clinic',8,9);G.hd.aim(G.field);G.fast(0);
      const cv=document.createElement('canvas');cv.width=160;cv.height=90;
      return {hd:hd.length,absent,clinic:G.hd.snap(cv.getContext('2d'),160,90)};
    });
    assert.deepEqual(artwork.absent,[]);assert.ok(artwork.clinic);
    let sceneCalls=0;
    await page.route('**/assets/art/bonds/clan_namgung_courtship.webp',async route=>{
      if(++sceneCalls<=2)await route.fulfill({status:503,headers:{'Retry-After':'1','Cache-Control':'no-store'},body:''});
      else await route.continue();
    });
    const painted=await page.evaluate(async()=>{
      const {withBondScene}=await import('./js/cg.js');
      return withBondScene('clan_namgung','confess',async()=>{
        const until=performance.now()+18000;
        while(performance.now()<until){
          const art=document.querySelector('#cg[data-art="atlas"] .bond-paint img');
          if(art?.naturalWidth)return true;
          await new Promise(resolve=>setTimeout(resolve,50));
        }
        return false;
      });
    });
    assert.ok(painted,'남궁선 인연 삽화 복구');assert.equal(sceneCalls,3);
    assert.deepEqual(errors,[]);
    return {bootFiles,hdImages:artwork.hd,packCalls,sceneCalls};
  } finally {await context.close();}
}
module.exports={inspectStartup};
if(require.main===module)(async()=>{
  const {chromium}=require('playwright'),browser=await chromium.launch();
  try {console.log(await inspectStartup(browser,process.env.GAME_URL));} finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
