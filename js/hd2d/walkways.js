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
    const s={x0,y0,x1:x1+1,y1:y1+1,across,sections,clearWidth};
    spans.push(s);for(const k of cells)tiles.set(k,s);
  }
  const result={tiles,spans};bridgeMaps.set(map,result);return result;
}
function deckSection(s,t) {
  const j=Math.max(0,Math.min(s.sections.length-1,t*s.sections.length-.5)),i=Math.floor(j),f=j-i;
  const a=s.sections[i],b=s.sections[Math.min(i+1,s.sections.length-1)];
  const lo=a[0]*(1-f)+b[0]*f,hi=a[1]*(1-f)+b[1]*f;
  return [(lo+hi)/2,Math.min(s.clearWidth,hi-lo)/2];
}
function bridgePoint(map,x,y,tile){
  const gx=x/tile,gy=y/tile,ix=Math.floor(gx),iy=Math.floor(gy);
  if(map.g[iy]?.[ix]!==4)return;
  const s=bridges(map).tiles.get(iy*map.w+ix);if(!s)return;
  const t=s.across?(gx-s.x0)/(s.x1-s.x0):(gy-s.y0)/(s.y1-s.y0);
  const [center,half]=deckSection(s,t);
  return {t,half,center,across:s.across,offset:Math.abs((s.across?gy:gx)-center)};
}
export function bridgeHeight(map,x,y,tile) {
  const p=bridgePoint(map,x,y,tile);
  return p&&p.offset<=p.half ? Math.sin(Math.PI*p.t)*4.6:0;
}
export function bridgeRail(map,x,y,w,tile) {
  const p=bridgePoint(map,x,y,tile);
  return !!p && p.t>.04 && p.t<.96 && p.offset>=p.half-(.65+Math.min(w*.28,1.6))/tile;
}
export function bridgeLanding(map,x,y,tile) {
  const p=bridgePoint(map,x,y,tile);
  if(!p || p.t<=.04 || p.t>=.96 || p.offset<p.half-.18)return [x,y];
  return p.across?[x,p.center*tile]:[p.center*tile,y];
}

const materials={};
function model(T,texture,name) {
  const group=new T.Group(), layers=new Map();group.name=name;group.userData.ms=[];
  const colors={wood:[0xb99265,'cedar'],deck:[0xe0c6a0,'plank'],red:[0xa85340,'cedar'],roof:[0xb7c5bc,'roof'],
    rib:[0xa1ae9e,'slab'],edge:[0xb9aa83,'slab'],green:[0x58766b,'cedar'],stone:[0xc1b7a0,'slab']};
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
  const {box,quad,finish}=model(T,texture,'arched-footbridge');
  const sections=s.sections,long=sections.length*tile,mid=s.across?(s.y0+s.y1)/2:(s.x0+s.x1)/2;
  function frame(t){
    const [center,half]=deckSection(s,t);
    let lo=(center-half-mid)*tile,hi=(center+half-mid)*tile;
    if(s.across)[lo,hi]=[-hi,-lo];
    return [lo,hi,4.6*Math.sin(Math.PI*t),(t-.5)*long];
  }
  const n=Math.max(5,Math.ceil(long/3));
  for(let i=0;i<n;i++){
    const [l,r,h,z]=frame(i/n),[L,R,H,Z]=frame((i+1)/n);
    quad('deck',[l,h,z],[r,h,z],[R,H,Z-.1],[L,H,Z-.1],(r-l)/12,.45);
    quad('edge',[l,h+.03,z],[r,h+.03,z],[r,h+.03,z+.18],[l,h+.03,z+.18],(r-l)/12,.1);
    quad('red',[l,h-.9,z],[r,h-.9,z],[r,h,z],[l,h,z],(r-l)/12,.2);
    quad('wood',[l,h,z],[l,h-.9,z],[L,H-.9,Z],[L,H,Z]);
    quad('wood',[r,h,z],[R,H,Z],[R,H-.9,Z],[r,h-.9,z]);
  }
  const bays=Math.max(2,Math.ceil(long/13));
  for(const side of [0,1])for(let i=0;i<=bays;i++){
    const a=frame(i/bays),x=a[side]+(side?-.65:.65);
    box('red',x,a[2]+2.7,a[3],1.05,5.5,1.05);box('edge',x,a[2]+5.65,a[3],1.45,.6,1.45);
    if(i===bays)continue;
    const b=frame((i+1)/bays),X=b[side]+(side?-.65:.65);
    for(const rail of [2.2,4.8]){
      const h=a[2]+rail,H=b[2]+rail;
      quad('wood',[x-.35,h,a[3]],[X-.35,H,b[3]],[X+.35,H,b[3]],[x+.35,h,a[3]]);
      for(const d of [-.35,.35])quad('wood',[x+d,h,a[3]],[X+d,H,b[3]],[X+d,H-.7,b[3]],[x+d,h-.7,a[3]]);
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
export function addWalkways(T,group,map,area,tile,hs,zs,heightAt,texture) {
  for(const g of map.galleries || []){
    const x=(g.x+g.w/2)*tile,y=(g.y+g.h/2)*tile;
    const building=gallery(T,texture,g.w*tile,g.h*tile,g.color);
    building.position.set(x,heightAt(map,x,y),y*zs);building.scale.set(1,hs,zs);group.add(building);
  }
  if(map.id!=='world'&&!map.encounter?.bridges&&!map.canal)return;
  for(const s of bridges(map).spans){
    if(s.x1<area.x0||s.y1<area.y0||s.x0>=area.x1||s.y0>=area.y1)continue;
    const obj=bridge(T,texture,s,tile);
    obj.position.set((s.x0+s.x1)*tile/2,0,(s.y0+s.y1)*tile/2*zs);
    obj.scale.set(1,hs,zs);if(s.across)obj.rotation.y=Math.PI/2;group.add(obj);
    if(map.id==='world'){const landings=bridgeLandings(T,texture,map,s,tile,hs,zs,heightAt);if(landings)group.add(landings);}
  }
}
