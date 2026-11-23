// Phase-one audit. Count landmarks at five player positions in the real HD camera.
// Empty-screen coverage is an estimate from the projected sprite bounds. It is
// reported separately from the counts and is not a pixel classification.
const {chromium}=require('playwright');
async function sample() {
  const G=window.__G, {TS}=await import('./js/core.js'),{STAMPS}=await import('./js/tiles.js');
  const places={
    cheongha:[[22,25],[22,16],[20,12],[12,23],[43,15]],
    bamboo:[[18,30],[18,15],[26,7],[29,23],[10,8]],
    pass:[[2,13],[20,13],[26,10],[14,15],[37,18]],
    cloudmt:[[22,35],[22,20],[22,10],[31,22],[6,20]],
    guhwa:[[24,29],[24,19],[24,14],[35,20],[46,19]],
  };
  const goals={cheongha:[28,12,4,35,6,1],guhwa:[28,12,4,35,6,1],cloudmt:[24,10,3,40,4,2],
    pass:[18,8,1,50,1,2],bamboo:[18,8,1,50,1,2]};
  G.S=G.dbg.newState('답사객','BlueSamurai','m','normal');G.manual=G.noSave=true;
  (await import('./js/free.js')).initFree();G.scene='field';G.bgDraw=null;
  document.querySelector('#screen').replaceChildren();
  const report=[];
  for (const [id,samples] of Object.entries(places)) {
    for (const [x,y] of samples) {
      const f=G.field;f.load(id,x,y);const m=f.m;
      await f.peopleReady;G.hd.resetCam();G.hd.render(f);
      if (!G.hd.active(m)) throw Error('HD 화면 미활성 '+id);
      const P=G.hd.proj, boxes=[],kinds=new Set(),heights=new Set();
      const inside=([x,y,z])=>x>=0 && x<=1280 && y>=0 && y<=720 && z<1;
      for (const s of m.stamps) {
        const spec=STAMPS[s.src || s.name];if (!spec)continue;
        const w=spec[3]*(s.sc || 1),h=spec[4]*(s.sc || 1);
        const l=P(s.x,s.base),r=P(s.x+w,s.base),t=P(s.x+w/2,s.base,h);
        const box=[Math.min(l[0],r[0]),Math.min(l[1],t[1]),Math.max(l[0],r[0]),Math.max(l[1],t[1])];
        if (l[2]>=1 || box[2]<0 || box[0]>1280 || box[3]<0 || box[1]>720) continue;
        boxes.push(box);kinds.add(s.name);
      }
      for (const s of f.spots.filter(s=>s.kind==='find')) {
        if (!inside(P(s.px,s.py)))continue;
        const [x,y]=P(s.px,s.py),[tx,ty]=P(s.px+5,s.py,6);
        boxes.push([x-Math.abs(x-tx),ty,x+Math.abs(x-tx),y]);kinds.add('발견물');
      }
      let empty=0;
      for(let y=9;y<720;y+=18)for(let x=16;x<1280;x+=32)if(!boxes.some(([l,t,r,b])=>x>=l&&x<=r&&y>=t&&y<=b))empty++;
      for (let y=0;y<m.h;y++)for(let x=0;x<m.w;x++)if(inside(P((x+.5)*TS,(y+.5)*TS)))heights.add(m.hgt?.[y]?.[x] || 0);
      const people=f.npcs.filter(n=>!n.stamp && !n.hide && inside(P(n.x,n.y,8))).length;
      const lamps=(m._lamps || []).filter(([x,y,h])=>inside(P(x,y,h))).length;
      const values=[boxes.length,kinds.size,people,Math.round(100*empty/1600),lamps,Math.max(0,heights.size-1)];
      const labels=['소품','종류','인물','빈 화면 추정(%)','등불','높이 차'];
      const warnings=labels.filter((l,i)=>i===3?values[i]>goals[id][i]:values[i]<goals[id][i]);
      report.push({지도:m.name,자리:[x,y].join(','),...Object.fromEntries(labels.map((s,i)=>[s,values[i]])),경고:warnings.join(', ')});
    }
  }
  return report;
}
(async()=>{const browser=await chromium.launch();try{
  const p=await browser.newPage();p.setDefaultTimeout(120000);
  await p.goto(process.env.GAME_URL);await p.waitForFunction(()=>window.__G?.dbg && __G.hd?.ready);
  const rows=await p.evaluate(sample);if(rows.length!==25)throw Error('측정 누락');
  console.table(rows);
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
