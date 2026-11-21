import { jegalFord,onJegalAxis } from '../river-crossing.js';
import { timberBridge } from './river-models.js';
const bridgeMaps = new WeakMap();

function bridges(map) {
  map=map.src || map;
  if (bridgeMaps.has(map)) return bridgeMaps.get(map);
  const tiles=new Map(), spans=[], seen=new Set(), {w,h,g}=map;
  for (let y=0;y<h;y++) for (let x=0;x<w;x++) {
    const first=y*w+x;
    if (g[y][x]!==4 || seen.has(first)) continue;
    const cells=[first];seen.add(first);
    let x0=x,x1=x,y0=y,y1=y;
    for(let n=0;n<cells.length;n++){
      const a=cells[n]%w,b=Math.floor(cells[n]/w);
      x0=Math.min(x0,a);x1=Math.max(x1,a);y0=Math.min(y0,b);y1=Math.max(y1,b);
      for(const [i,j] of [[a-1,b],[a+1,b],[a,b-1],[a,b+1]]){
        const k=j*w+i;
        if(g[j]?.[i]===4&&!seen.has(k)){seen.add(k);cells.push(k);}
      }
    }
    const dx=x1-x0+1,dy=y1-y0+1;
    let eastWater=0,northWater=0;
    for(let j=y0;j<=y1;j++)eastWater+=(g[j]?.[x0-1]===2)+(g[j]?.[x1+1]===2);
    for(let i=x0;i<=x1;i++)northWater+=(g[y0-1]?.[i]===2)+(g[y1+1]?.[i]===2);
    const across=dx===dy ? northWater>=eastWater : dx>dy;
    const count=across?dx:dy, sections=Array.from({length:count},()=>[Infinity,-Infinity]);
    let besideWater=false;
    for(const k of cells){
      const px=k%w,py=Math.floor(k/w),q=sections[across?px-x0:py-y0],v=across?py:px;
      q[0]=Math.min(q[0],v);q[1]=Math.max(q[1],v+1);
      if([g[py]?.[px-1],g[py]?.[px+1],g[py-1]?.[px],g[py+1]?.[px]].includes(2))besideWater=true;
    }
    if(!besideWater)continue;
    const widths=sections.map(q=>q[1]-q[0]).sort((a,b)=>a-b);
    const clearWidth=Math.min(2.05,Math.max(1.12,widths[Math.floor(widths.length/2)]*.72));
    const jegal=map.id==='world'&&x0>885&&x1<905&&y0>=650&&y1<=667;
    const s={x0,y0,x1:x1+1,y1:y1+1,across,sections,clearWidth:jegal?jegalFord.width:clearWidth,jegal};
    s.rise=jegal?s.clearWidth*.15*16:Math.min(4.6,s.clearWidth*2.8);
    spans.push(s);for(const k of cells)tiles.set(k,s);
  }
  const result={tiles,spans};bridgeMaps.set(map,result);return result;
}
function deckSection(s,t) {
  const rows=s.sections, j=t*rows.length-.5, i=Math.floor(j), f=j-i;
  const weights=[(1-f)**3/6,(4-6*f*f+3*f**3)/6,(1+3*f+3*f*f-3*f**3)/6,f**3/6];
  let lo=0,hi=0;
  for(let k=0;k<4;k++){
    const cut=rows[Math.max(0,Math.min(rows.length-1,i+k-1))];
    lo+=cut[0]*weights[k];hi+=cut[1]*weights[k];
  }
  return [(lo+hi)/2,Math.min(s.clearWidth,hi-lo)/2];
}
const deckRise=(t,rise)=>Math.sin(Math.PI*t)**2*rise;
function bridgePoint(map,x,y,tile){
  const gx=x/tile,gy=y/tile,ix=Math.floor(gx),iy=Math.floor(gy);
  if(map.id==='world'&&gx>jegalFord.ax-2&&gx<jegalFord.bx+2&&gy>jegalFord.ay-2&&gy<jegalFord.by+2){
    const p=onJegalAxis(gx,gy),half=jegalFord.width/2;
    if(p.t>=0&&p.t<=1&&Math.abs(p.side)<=half+.64)
      return {...p,half,offset:Math.abs(p.side),rise:jegalFord.width*.15*tile,jegal:true};
  }
  if(map.g[iy]?.[ix]!==4)return;
  const s=bridges(map).tiles.get(iy*map.w+ix);if(!s)return;
  if(s.jegal)return;
  const t=s.across?(gx-s.x0)/(s.x1-s.x0):(gy-s.y0)/(s.y1-s.y0);
  const [center,half]=deckSection(s,t);
  return {t,half,center,rise:s.rise,across:s.across,offset:Math.abs((s.across?gy:gx)-center)};
}
export function bridgeHeight(map,x,y,tile) {
  const p=bridgePoint(map,x,y,tile);
  return p&&p.offset<=p.half ? deckRise(p.t,p.rise):0;
}
export function bridgeRail(map,x,y,w,tile) {
  const p=bridgePoint(map,x,y,tile);
  return !!p && p.t>.04 && p.t<.96 && p.offset>=p.half-(.65+Math.min(w*.28,1.6))/tile;
}
export function bridgeLanding(map,x,y,tile) {
  const p=bridgePoint(map,x,y,tile);
  if(!p || p.t<=.04 || p.t>=.96 || p.offset<p.half-.18)return [x,y];
  if(p.jegal)return [p.x*tile,p.y*tile];
  return p.across?[x,p.center*tile]:[p.center*tile,y];
}

const materials={};
function model(T,texture,name) {
  const group=new T.Group(), layers=new Map();group.name=name;group.userData.ms=[];
  const colors={wood:[0xb99265,'cedar'],deck:[0xe0c6a0,'plank'],red:[0xa85340,'cedar'],roof:[0xb7c5bc,'roof'],
    earth:[0xb79972,'yard'],log:[0x886c4e,'cedar'],cut:[0xc19c73,'plank'],rib:[0xa1ae9e,'slab'],edge:[0xb9aa83,'slab'],green:[0x58766b,'cedar'],stone:[0xc1b7a0,'slab']};
  function layer(k) {
    if(!layers.has(k))layers.set(k,{p:[],uv:[]});
    return layers.get(k);
  }
  function quad(k,a,b,c,d,s=1,t=1) {
    const l=layer(k);
    l.p.push(...a,...b,...c,...a,...c,...d);l.uv.push(0,0,s,0,s,t,0,0,s,t,0,t);
  }
  function box(k,x,y,z,w,h,d,tilt=0) {
    const point=(a,b,c)=>[x+a*w/2,y+b*h/2+c*tilt/2,z+c*d/2];
    const a=point(-1,-1,-1),b=point(1,-1,-1),c=point(1,1,-1),v=point(-1,1,-1);
    const e=point(-1,-1,1),f=point(1,-1,1),g=point(1,1,1),q=point(-1,1,1);
    quad(k,e,f,g,q,w/12,h/10);quad(k,b,a,v,c,w/12,h/10);
    quad(k,a,e,q,v,d/12,h/10);quad(k,f,b,c,g,d/12,h/10);
    quad(k,v,q,g,c,w/12,d/12);quad(k,e,a,b,f,w/12,d/12);
  }
  function finish(){
    for(const [k,l] of layers){
      if(!materials[k]){
        const [color,map]=colors[k],m=new T.MeshLambertMaterial({color,map:texture('field_'+map),side:T.DoubleSide});
        const f=m.clone();f.transparent=true;f.opacity=.25;f.depthWrite=false;materials[k]={m,f};
      }
      const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(l.p,3));
      geo.setAttribute('uv',new T.Float32BufferAttribute(l.uv,2));geo.computeVertexNormals();
      const M=materials[k],mesh=new T.Mesh(geo,M.m);mesh.castShadow=mesh.receiveShadow=true;
      mesh.userData={M,owner:group};group.add(mesh);group.userData.ms.push(mesh);
    }
    return group;
  }
  return {box,quad,finish};
}

function gallery(T,texture,w,length,color) {
  const {box,quad,finish}=model(T,texture,'covered-gallery');
  const half=w/2, end=length/2, bays=Math.max(3,Math.round(length/20));
  box('wood',0,.36,0,w,.72,length);
  for(let i=0;i<=bays;i++){
    const z=(i/bays-.5)*(length-3);
    for(const sign of [-1,1]){
      const x=sign*(half-1.5);
      box('stone',x,.85,z,3.5,1.5,3.5);box(color,x,10.3,z,1.8,19,1.8);
      box('green',x,18.9,z,3,1.6,4.3);box('edge',x,20.1,z,5,1,5.5);
    }
    box(color,0,20.9,z,w+2,1.7,2);box('green',0,22,z,w+4,.7,2);
  }
  for(const sign of [-1,1]){
    const x=sign*(half-1.5);
    box(color,x,20.8,0,2,1.9,length+4);
    box('wood',x,5.6,0,.9,1,length-3);box(color,x,2.7,0,.8,.85,length-3);
    for(let z=-end+3;z<end-1;z+=5)box(color,x,3.9,z,.7,4.7,.7);
    const pt=(u,v)=>{
      const corner=Math.pow(Math.abs(v),7);
      return [sign*u*(half+3.2),22+5.2*(1-u)**1.65+2.25*corner*u,v*(end+3)];
    };
    for(let j=0;j<12;j++)for(let i=0;i<4;i++){
      const a=j/6-1,b=(j+1)/6-1,c=i/4,d=(i+1)/4;
      quad('roof',pt(c,a),pt(c,b),pt(d,b),pt(d,a),length/12/9,w/4/12);
    }
    for(let j=0;j<12;j++){
      const a=pt(1,j/6-1),b=pt(1,(j+1)/6-1);
      quad('edge',a,b,[b[0],b[1]-.8,b[2]],[a[0],a[1]-.8,a[2]]);
    }
    for(let z=-end;z<end+1;z+=3.6){
      const v=z/(end+3);
      for(let i=0;i<4;i++){
        const a=pt(i/4,v),b=pt((i+1)/4,v);
        quad('rib',[a[0],a[1]+.15,a[2]-.28],[b[0],b[1]+.15,b[2]-.28],
          [b[0],b[1]+.48,b[2]+.28],[a[0],a[1]+.48,a[2]+.28]);
      }
    }
  }
  box('edge',0,27.3,0,1.4,1.1,length+6);
  return finish();
}
function bridge(T,texture,s,tile){
  const {box,quad,finish}=model(T,texture,'timber-footbridge');
  const length=(s.pathLength??s.sections.length)*tile;
  const mid=s.across?(s.y0+s.y1)/2:(s.x0+s.x1)/2;
  function frame(t){
    const [center,half]=deckSection(s,t);
    let lo=(center-half-mid)*tile,hi=(center+half-mid)*tile;
    if(s.across)[lo,hi]=[-hi,-lo];
    return [lo,hi,deckRise(t,s.rise),(t-.5)*length];
  }
  function member(a,b,r,h,key){
    const dx=b[0]-a[0],dz=b[2]-a[2],len=Math.hypot(dx,dz)||1;
    const point=(p,side,up)=>[p[0]+side*r*dz/len,p[1]+up*h,p[2]-side*r*dx/len];
    const A=point(a,-1,0),B=point(b,-1,0),C=point(b,1,0),D=point(a,1,0);
    const aa=point(a,-1,-1),bb=point(b,-1,-1),cc=point(b,1,-1),dd=point(a,1,-1);
    quad(key,A,B,C,D,len/11,.26);quad(key,aa,bb,B,A,len/11,.25);quad(key,D,C,cc,dd,len/11,.25);
  }
  const boards=Math.max(5,Math.round(length/4.7));
  for(let i=0;i<boards;i++){
    const [l,r,h,z]=frame(i/boards),[L,R,H,Z]=frame((i+1)/boards);
    quad(i%6===1?'cut':'deck',[l,h,z],[r,h,z],[R,H,Z-.14],[L,H,Z-.14],(r-l)/14,.34);
    for(const [a,b] of [[l,L],[r,R]])quad('log',[a,h,z],[a,h-1.15,z],[b,H-1.15,Z],[b,H,Z]);
  }
  const bays=Math.max(2,Math.round(length/19));
  for(let i=0;i<=bays;i++){
    const [l,r,h,z]=frame(i/bays);
    if(i>0&&i<bays&&i%2===1){
      box('log',(l+r)/2,h-2.5,z,r-l+1,1.65,2.7);
      for(const x of [l+1.65,r-1.65]){
        box('log',x,h-6.5,z,1.9,10,2);
        for(const sign of [-1,1])member([x,h-1.5,z+sign*6],[x,h-6.6,z],.62,.92,'wood');
      }
    }
    for(const side of [0,1]){
      const x=side?r-.7:l+.7;
      box('log',x,h+2.8,z,1.40,7.4,1.52);box('wood',x,h+6.56,z,1.60,.41,1.70);
      if(i===bays)continue;
      const [L,R,H,Z]=frame((i+1)/bays),X=side?R-.7:L+.7;
      for(const rail of [2.9,5.75])member([x,h+rail,z],[X,H+rail,Z],.39,.62,'wood');
      member([x,h-1.1,z],[X,H-1.1,Z],.70,1.35,'log');
    }
  }
  return finish();
}

function timberApproaches(T,texture,map,tile,zs,heightAt){
  const b=jegalFord,axis=onJegalAxis(b.ax,b.ay),{quad,finish}=model(T,texture,'ford-approaches');
  for(const end of [0,1]){
    const ex=end?b.bx:b.ax,ey=end?b.by:b.ay,sign=end?1:-1;
    function point(d,w,up=0){
      const x=(ex+axis.ux*d*sign+axis.uy*w)*tile,y=(ey+axis.uy*d*sign-axis.ux*w)*tile;
      return [x,.13+up+Math.max(0,heightAt(map,x,y))*Math.min(1,d/.62),y*zs];
    }
    const h=b.width*.5,rows=[[0,-h,h],[.32,-h-.06,h+.13],[.86,-h-.18,h+.17],[1.43,-h-.02,h+.07],[1.94,-h+.31,h-.17]];
    for(let i=1;i<rows.length;i++){
      const [d,l,r]=rows[i-1],[D,L,R]=rows[i];
      quad('earth',point(d,l),point(d,r),point(D,R),point(D,L),1.8,.68);
    }
    for(let i=0;i<10;i++){
      const side=i%2?1:-1,d=.06+Math.floor(i/2)*.29;
      const outer=side*(h+.015+.072*Math.sin(i*5)),inner=outer-side*(.16+.025*(i%3));
      quad('stone',point(d,inner,.14),point(d+.037,outer,.12),point(d+.245,outer,.14),point(d+.208,inner,.16),.31,.31);
    }
  }
  return finish();
}
function bridgeLandings(T,texture,map,span,tile,hs,zs,heightAt){
  const {quad,finish}=model(T,texture,'river-abutments');let built=false;
  for(const end of [0,1]){
    const [center,half]=deckSection(span,end),sign=end?1:-1;
    const x=span.across?(end?span.x1:span.x0):center,y=span.across?center:(end?span.y1:span.y0);
    const north=span.across?0:sign,east=span.across?sign:0;
    let target=null,best=Infinity;
    for(let j=Math.floor(y)-2;j<=Math.floor(y)+2;j++)for(let i=Math.floor(x)-2;i<=Math.floor(x)+2;i++){
      const gx=i+.5,gy=j+.5,along=(gx-x)*east+(gy-y)*north;
      if(along<.35||![0,1,3,5].includes(map.g[j]?.[i]))continue;
      const side=(gx-x)*north-(gy-y)*east,d=Math.abs(along-1.15)+Math.abs(side)*1.5;
      if(d<best){best=d;target=[gx,gy];}
    }
    if(!target)continue;
    const [gx,gy]=target,w=half*tile,base=(a,b,h)=>[a*tile,h,b*tile*zs];
    const bank=(a,b)=>base(a,b,heightAt(map,a*tile,b*tile)+.18);
    const left=base(x+north*w/tile,y-east*w/tile,.12),right=base(x-north*w/tile,y+east*w/tile,.12);
    const outerL=bank(gx+north*w*.83/tile,gy-east*w*.83/tile),outerR=bank(gx-north*w*.83/tile,gy+east*w*.83/tile);
    quad('edge',left,right,outerR,outerL,Math.max(1,w/4),2);
    const low=p=>[p[0],p[1]-2.5*hs,p[2]];
    quad('rib',low(left),left,outerL,low(outerL));quad('rib',right,low(right),low(outerR),outerR);built=true;
  }
  return built?finish():null;
}
export function addWalkways(T,group,map,area,tile,hs,zs,heightAt,texture,library) {
  for(const g of map.galleries || []){
    const x=(g.x+g.w/2)*tile,y=(g.y+g.h/2)*tile;
    const building=gallery(T,texture,g.w*tile,g.h*tile,g.color);
    building.position.set(x,heightAt(map,x,y),y*zs);building.scale.set(1,hs,zs);group.add(building);
  }
  if(map.id!=='world'&&!map.encounter?.bridges&&!map.canal)return;
  for(const s of bridges(map).spans){
    if(s.x1<area.x0||s.y1<area.y0||s.x0>=area.x1||s.y0>=area.y1)continue;
    if(s.jegal){
      const b=jegalFord,axis=onJegalAxis(b.ax,b.ay);
      let deck=timberBridge(library,b.width*tile,axis.length*tile,hs,1);
      if(!deck){
        deck=bridge(T,texture,{across:false,x0:0,x1:b.width,sections:[[0,b.width]],clearWidth:b.width,pathLength:axis.length,rise:b.width*tile*.15},tile);
        deck.scale.y=hs;
      }
      deck.rotation.y=Math.atan2(axis.ux,axis.uy);
      deck.position.set((b.ax+b.bx)*tile/2,0,(b.ay+b.by)*tile/2);
      const crossing=new T.Group();crossing.name='jegal-timber-bridge';crossing.scale.z=zs;crossing.add(deck);group.add(crossing);
      group.add(timberApproaches(T,texture,map,tile,zs,heightAt));continue;
    }
    const obj=bridge(T,texture,s,tile);
    obj.position.set((s.x0+s.x1)*tile/2,0,(s.y0+s.y1)*tile/2*zs);
    obj.scale.set(1,hs,zs);if(s.across)obj.rotation.y=Math.PI/2;group.add(obj);
    if(map.id==='world'){const landings=bridgeLandings(T,texture,map,s,tile,hs,zs,heightAt);if(landings)group.add(landings);}
  }
}
