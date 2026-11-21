import { TS } from '../core.js';
import { MAPS } from '../maps.js';
import { STAMPS, drawStamp } from '../tiles.js';
import { buildLandscape, cover, landscapeOf, paintLandscape, wildernessArt } from '../landscape.js';
import { drawCourt } from './field-art.js';
import { stageOf } from './stages.js';
import { drawRegional2D } from './regional-buildings.js';

const WIDTH=46,HEIGHT=30;
const clamp=(a,v,b)=>Math.max(a,Math.min(b,v));
const themes={forest:'forest',snow:'snow',sand:'sand',moon:'forest',fort:'rock'};
function getFloor(map,x,y) {
  if(map.hgt){
    const a=clamp(0,Math.floor(x),map.w-1),b=clamp(0,Math.floor(y),map.h-1),z=map.hgt[b][a];
    return 9*(map.stair?.[a+','+b]&&b+1<map.h?z+(map.hgt[b+1][a]-z)*(y-Math.floor(y)):z);
  }
  return landscapeOf(map)?.height(x,y)??0;
}
function backdropStamps(source,ox,oy,scale,focus) {
  const out=[],ex=ox+WIDTH/scale,ey=oy+HEIGHT/scale;
  let list=source.stamps;
  if(source.og){
    list=[];for(let j=Math.floor((oy-9)/32);j<=Math.floor((ey+9)/32);j++)
      for(let i=Math.floor((ox-10)/32);i<=Math.floor((ex+10)/32);i++)list.push(...(source.og.get(i+j*4096)||[]));
  }
  for(const s of list){
    const spec=STAMPS[s.name];if(!spec)continue;
    const sc=s.sc||1,x=s.x/TS,y=s.base/TS,w=(s.w||spec[3]*sc)/TS;
    if(x+w<ox-3||x>ex+3||y<oy-4||y>ey+2||s.flat)continue;
    const item={...s,x:(s.x-ox*TS)*scale,y:(s.y-oy*TS)*scale,base:(s.base-oy*TS)*scale,sc:sc*scale};
    const near=Math.hypot((item.x+w*TS*scale*.5-focus[0])/145,(item.base-focus[1]+24)/112);
    if(near<1 && /^(bush|fern|flower|g_|tallgrass)/.test(s.name) && !s.sol)continue;
    if(s.w)item.w=s.w*scale;
    if(s.sol)item.sol={x:(s.sol.x-ox*TS)*scale,y:(s.sol.y-oy*TS)*scale,w:s.sol.w*scale,h:s.sol.h*scale};
    if(source.sites){
      const site=source.sites.find(q=>x+w/2>=q.x0&&x+w/2<=q.x1&&y>=q.y0&&y<=q.y1);
      if(site)item.archOwner=site.map;
    }
    out.push(item);
  }
  return out;
}
// Connected half-tile grid for movement, spawn placement, sliding and routing around the local river or walls.
function navigation(stage,source,sx,sy,scale,focus) {
  const step=TS/2,w=WIDTH*2,h=HEIGHT*2,open=new Uint8Array(w*h);
  const tileOf=(x,y)=>clamp(0,Math.floor(y/step),h-1)*w+clamp(0,Math.floor(x/step),w-1);
  const point=i=>[(i%w+.5)*step,(Math.floor(i/w)+.5)*step];
  for(let y=2;y<h-2;y++)for(let x=2;x<w-2;x++){
    const X=sx+(x+.5)*step/scale,Y=sy+(y+.5)*step/scale;
    open[y*w+x]=source.blocked(X,Y,Math.max(2,5/scale),Math.max(2,4/scale))?0:1;
  }
  function nearest(x,y,mask=open) {
    const id=tileOf(x,y);if(mask[id])return id;
    let best=-1,bd=Infinity;for(let i=0;i<mask.length;i++)if(mask[i]){
      const X=(i%w+.5)*step-x,Y=(Math.floor(i/w)+.5)*step-y,d=X*X+Y*Y;
      if(d<bd){best=i;bd=d;}
    }return best;
  }
  const seed=nearest(...focus),queue=new Int32Array(w*h),reachable=new Uint8Array(w*h);
  if(seed<0)return null;
  let end=1;queue[0]=seed;reachable[seed]=1;
  for(let i=0;i<end;i++)for(const j of [queue[i]-1,queue[i]+1,queue[i]-w,queue[i]+w])
    if(open[j]&&!reachable[j]){reachable[j]=1;queue[end++]=j;}
  const contains=(x,y)=>x>=0&&y>=0&&x<w*step&&y<h*step&&!!reachable[tileOf(x,y)];
  const snap=(x,y)=>contains(x,y)?[x,y]:point(nearest(x,y,reachable));
  function move(x,y,X,Y){
    if(!contains(x,y))[x,y]=snap(x,y);
    const n=Math.max(1,Math.ceil(Math.max(Math.abs(X-x),Math.abs(Y-y))/(step*.65))),dx=(X-x)/n,dy=(Y-y)/n;
    for(let i=0;i<n;i++){if(contains(x+dx,y))x+=dx;if(contains(x,y+dy))y+=dy;}return [x,y];
  }
  const routeMaps=new Map();
  function steer(a,t){
    const dx=t.x-a.x,dy=t.y-a.y,n=Math.max(1,Math.ceil(Math.hypot(dx,dy)/step));
    let clear=true;for(let i=1;i<=n;i++)if(!contains(a.x+dx*i/n,a.y+dy*i/n)){clear=false;break;}
    if(clear)return null;
    const goal=nearest(t.x,t.y,reachable);let dist=routeMaps.get(goal);
    if(!dist){
      dist=new Int16Array(w*h).fill(-1);dist[goal]=0;queue[0]=goal;let size=1;
      for(let i=0;i<size;i++)for(const j of [queue[i]-1,queue[i]+1,queue[i]-w,queue[i]+w])
        if(reachable[j]&&dist[j]<0){dist[j]=dist[queue[i]]+1;queue[size++]=j;}
      routeMaps.set(goal,dist);if(routeMaps.size>12)routeMaps.delete(routeMaps.keys().next().value);
    }
    const id=nearest(a.x,a.y,reachable);let next=id;
    for(const j of [id-1,id+1,id-w,id+w])if(dist[j]>=0&&dist[j]<dist[next])next=j;
    if(next===id)return null;const [x,y]=point(next),d=Math.hypot(x-a.x,y-a.y)||1;return [(x-a.x)/d,(y-a.y)/d];
  }
  return {contains,snap,move,steer,area:end*step*step,focus:snap(...focus)};
}
function trainingSite(field) {
  let map=field.m;
  if(map.room){const exit=map.portals.find(d=>MAPS[d.to]&&!MAPS[d.to].room);if(exit)map=MAPS[exit.to];}
  if(map.court)return {map,x:map.court.x,y:map.court.y+1.5};
  const marked={guhwa:[24.5,15],cloudmt:[23,24],shaolin:[20,16],ninehall:[22,19],fiveclans:[22,19],mysect:[20,18]};
  let at=marked[map.id];
  if(!at&&map.id.startsWith('c_'))at=[map.w*.5,map.h*.52];
  if(!at)return null;
  const [x,y]=map.freeNear(at[0]*(map.k||1)*TS,at[1]*(map.k||1)*TS);
  return {map,x:x/TS,y:y/TS};
}
export function encounterStage(field,requested='village',spar=false,native=false) {
  const real=!!field?.m && !!field.p && !field.m.stage;
  const site=real && spar && trainingSite(field);
  const source=site?site.map:real?field.m:stageOf(requested);
  const px=site?site.x:real?field.p.x/TS:source.w*.5,py=site?site.y:real?field.p.y/TS:source.h*.5;
  const original=landscapeOf(source), room=!!source.room, bi=source.biome||'grass';
  const climate=original?.climate(px,py),theme=room?'room':source.id==='world'?
    (original.shore(px,py)<2.6?'dock':({[cover.forest]:'forest',[cover.snow]:'snow',[cover.sand]:'sand'}[climate]||'road')):
    (source.arena||requested);
  const kind=climate===cover.snow?'snow':climate===cover.sand?'sand':climate===cover.forest?'forest':
    ({deep:'forest',dusk:'forest',snow:'snow',sand:'sand'}[bi]||themes[theme]||'meadow');
  const stage=new source.constructor('encounter_'+source.id,WIDTH,HEIGHT,{stage:true,room,roomStyle:source.roomStyle,roomKind:source.roomKind,
    name:source.name||'싸움터',biome:bi,arena:theme,stamps:[],portals:[]});
  // Small halls and narrow passes are magnified around the point of contact until a connected duel fits.
  let scale=Math.max(site?1:room?2.25:source.live?1.55:1.75,WIDTH/source.w,HEIGHT/source.h);
  let ox,oy,nav;
  for(let pass=0;pass<4;pass++){
    ox=clamp(0,px-WIDTH*.5/scale,Math.max(0,source.w-WIDTH/scale));
    oy=clamp(0,py-HEIGHT*.55/scale,Math.max(0,source.h-HEIGHT/scale));
    nav=navigation(stage,source,ox*TS,oy*TS,scale,[(px-ox)*TS*scale,(py-oy)*TS*scale]);
    if(nav&&(nav.area>=(room?68000:98000)||pass===3))break;
    if(pass<3)scale*=1.42;
  }
  if(!nav&&real)return encounterStage(null,requested,false,false);
  if(!nav)throw Error('No walkable encounter ground: '+requested);
  stage.encounter={sourceId:source.id,focus:[px,py],origin:[ox,oy],scale,theme,room,natural:!!original,bridges:source.id==='world',nav};
  if(native&&real) {
    stage.encounter.source=source;
    return stage;
  }
  stage.canal=!!source.canal;
  if(room){stage.floor=source.floor;stage.wall=source.wall;stage.emblem=source.emblem;
    if(source.carpet){const [x,y,w,h]=source.carpet;stage.carpet=[(x-ox)*scale,(y-oy)*scale,w*scale,h*scale];}
  }
  if(source.hgt){
    stage.hgt=Array.from({length:HEIGHT},()=>Array(WIDTH).fill(0));stage.stair={};stage.face=source.face;
    for(let y=0;y<HEIGHT;y++)for(let x=0;x<WIDTH;x++){
      const X=ox+(x+.5)/scale,Y=oy+(y+.5)/scale,ix=Math.floor(X),iy=Math.floor(Y);
      stage.hgt[y][x]=source.hgt[iy]?.[ix]||0;
      if(source.stair?.[ix+','+iy]&&Math.floor(Y+1/scale)>iy)stage.stair[x+','+y]=true;
    }
  }
  stage.stamps=backdropStamps(source,ox,oy,scale,nav.focus);
  if(source.court)stage.court={...source.court,x:(source.court.x-ox)*scale,y:(source.court.y-oy)*scale,radius:source.court.radius*scale};
  if(source.galleries)stage.galleries=source.galleries.filter(s=>s.x+s.w>ox&&s.x<ox+WIDTH/scale&&s.y+s.h>oy&&s.y<oy+HEIGHT/scale)
    .map(s=>({...s,x:(s.x-ox)*scale,y:(s.y-oy)*scale,w:s.w*scale,h:s.h*scale}));
  const classes=new Uint8Array(WIDTH*HEIGHT),biomes=Array.from({length:HEIGHT},()=>new Uint8Array(WIDTH));
  for(let y=0;y<HEIGHT;y++)for(let x=0;x<WIDTH;x++){
    const X=ox+(x+.5)/scale,Y=oy+(y+.5)/scale,v=source.g[Math.floor(Y)]?.[Math.floor(X)]??0;stage.g[y][x]=v;
    const c=original?.climate(X,Y),i=y*WIDTH+x;
    biomes[y][x]=c===4||kind==='snow'?4:c===5||kind==='sand'?2:c===1||kind==='forest'?1:0;
    classes[i]=v===2?2:v===4&&source.id==='world'?9:v===1?8:0;
  }
  if(!room){
    const land=buildLandscape(stage,{classes,biomes,kind,seed:(Math.floor(px)*13)^Math.floor(py)});
    for(let y=0;y<HEIGHT;y++)for(let x=0;x<WIDTH;x++){
      const X=ox+(x+.5)/scale,Y=oy+(y+.5)/scale,i=y*WIDTH+x,v=stage.g[y][x];
      land.heights[i]=v===2||(v===4&&stage.encounter.bridges)?-4:getFloor(source,X,Y);
      if(original)land.material[i]=original.climate(X,Y);
      if(v===4&&!stage.encounter.bridges)land.material[i]=cover.wood;
    }
    stage.landscape=land;
    // The camera can see beyond the navigation boundary. Continue the actual source landscape there.
    const pad=9,bw=WIDTH+2*pad,bh=HEIGHT+2*pad;
    const fringe={id:'encounter-fringe',w:bw,h:bh,g:Array.from({length:bh},()=>new Uint8Array(bw))};
    const pixels=new Uint8Array(bw*bh),climates=Array.from({length:bh},()=>new Uint8Array(bw));
    const sample=(x,y)=>[clamp(0,ox+(x-pad+.5)/scale,source.w-.001),clamp(0,oy+(y-pad+.5)/scale,source.h-.001)];
    for(let y=0;y<bh;y++)for(let x=0;x<bw;x++){
      const [X,Y]=sample(x,y),v=source.g[Math.floor(Y)][Math.floor(X)],tone=original?.climate(X,Y);
      fringe.g[y][x]=v;climates[y][x]=tone===cover.snow||kind==='snow'?4:tone===cover.sand||kind==='sand'?2:tone===cover.forest||kind==='forest'?1:0;
      pixels[y*bw+x]=v===2?2:v===1?8:0;
    }
    const outer=buildLandscape(fringe,{classes:pixels,biomes:climates,kind,seed:land.seed});
    for(let y=0;y<bh;y++)for(let x=0;x<bw;x++){
      const [X,Y]=sample(x,y),k=y*bw+x;
      outer.heights[k]=fringe.g[y][x]===2?-4:getFloor(source,X,Y);
      if(original)outer.material[k]=original.climate(X,Y);
    }
    outer.offsetX=outer.offsetY=-pad;stage.surround={field:outer,pad};
  }
  return stage;
}
export function encounterFloor(stage) {
  const c=document.createElement('canvas');c.width=stage.w*TS;c.height=stage.h*TS;const ctx=c.getContext('2d');
  if(stage.landscape)paintLandscape(ctx,stage.landscape,{x0:0,y0:0,x1:stage.w,y1:stage.h},TS);
  else stage.paintBase(ctx);
  if(stage.court)drawCourt(ctx,stage.court,TS);
  for(const s of stage.stamps.slice().sort((a,b)=>a.base-b.base)){
    if(s.landmark&&wildernessArt.props[s.landmark]){const a=wildernessArt.props[s.landmark],h=24*(s.sc||1);ctx.drawImage(a,s.x,s.base-h,h*a.width/a.height,h);}
    else {const t=STAMPS[s.name];if(t&&!drawRegional2D(ctx,stage,s,t[3],t[4]))drawStamp(ctx,s.name,s.x,s.y,s.sc||1);}
  }
  return c;
}
