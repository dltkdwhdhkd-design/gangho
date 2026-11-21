import { cover, hashLand, landscapeOf, paintLandscape, wildernessArt } from '../landscape.js';
import { regionFor } from './regional-buildings.js';
import { outdoorMaterial, terrainHorizons } from './outdoor-light.js';

export function reliefMesh(T, field, area, tile, hs, zs, material) {
  const w=area.x1-area.x0,h=area.y1-area.y0;
  const geo=new T.PlaneGeometry(w*tile,h*tile*zs,w*2,h*2);
  geo.rotateX(-Math.PI/2);
  const p=geo.attributes.position,midX=(area.x0+area.x1)/2,midY=(area.y0+area.y1)/2;
  for(let i=0;i<p.count;i++){
    const x=midX+p.getX(i)/tile,y=midY+p.getZ(i)/(tile*zs);
    p.setY(i,field.height(x,y)*hs);
  }
  geo.computeVertexNormals();geo.computeBoundingSphere();
  terrainHorizons(T,geo,field,midX,midY,tile,hs,zs);
  const mesh=new T.Mesh(geo,outdoorMaterial(material,true));mesh.position.set(midX*tile,0,midY*tile*zs);
  mesh.name='travel-relief';mesh.castShadow=true;return mesh;
}

export function localScenery(map,s,cx,fy) {
  const f=landscapeOf(map);if(!f)return null;
  const t=f.climate(cx/16,fy/16),r=hashLand(Math.round(cx),Math.round(fy),11);
  if(s.landmark)return f.isWorld?[s.landmark==='teahut'?'miniHamlet':'miniArch',s.landmark==='teahut'?42:34]:[s.landmark,s.landmark==='teahut'?29:15];
  if(f.isWorld){
    const nearRoad=f.roads[f.index(cx/16,fy/16)]<8,small=nearRoad?.58:1;
    if(/^mtn|^crag/.test(s.name)){
      if(r>.47)return ['',0];
      const stone=t===cover.snow?'miniSnow':t===cover.sand?'miniMesa':r<.22?'miniKarst':'miniSlate';
      return [stone,(53+85*r)*small];
    }
    if(/^rocks|^boulder/.test(s.name))return [t===cover.snow?'snowcrag':t===cover.sand?'miniMesa':'miniBank',(12+16*r)*small];
    if(/tree_snow|tree_white|grove_white/.test(s.name))return [r<.58?'miniFirs':'fir',(24+r*23)*small];
    if(/plum|_pink/.test(s.name))return ['miniPlum',(24+r*23)*small];
    if(/bamboo/.test(s.name))return ['miniBamboo',(21+r*24)*small];
    if(/pine|tree_round|tree_big|grove_green|t_willow/.test(s.name)){
      const pine=s.name.includes('pine'),willow=f.shore(cx/16,fy/16)<4;
      return [willow?'riverwillow':r<.57?(pine?'miniFirs':'miniGrove'):(pine?'oldpine':'persimmon'),(24+r*26)*small];
    }
  }
  if(/^mtn|^crag/.test(s.name))return r<.27?[t===cover.snow?'snowcrag':t===cover.sand?'mesa':'spire',42+r*45]:['',0];
  if(/^rocks|^boulder/.test(s.name))return [t===cover.snow?'snowcrag':t===cover.sand?'mesa':r<.49?'shelf':'riverstone',11+r*14];
  if(/bamboo/.test(s.name))return [r<.34?'miniBamboo':'canes',29+r*18];
  if(/tree_snow|tree_white|grove_white/.test(s.name))return ['fir',33+r*21];
  if(/tree_pine|grove_pine|t_pine/.test(s.name))return ['oldpine',32+r*25];
  if(/tree_round|tree_big|grove_green|t_willow/.test(s.name)){
    if(f.shore(cx/16,fy/16)<5)return ['riverwillow',29+r*19];
    return [r<.29?'goldtree':r<.69?'persimmon':'oldpine',29+r*24];
  }
  return null;
}
const groundedRock=/^mini(?:Karst|Slate|Snow|Mesa|Bank)$|^(?:riverstone|snowcrag|shelf)$/;
// The feet of a wide painted rock follow the slope. Its front edge touches the earth across the whole width.
export function sceneryBatch(T,map,zs,hs,heightAt){
  const sets=new Map();
  return {
    add(name,tex,mats,x,y,w,h){
      let b=sets.get(tex);
      if(!b){b={p:[],uv:[],n:[],idx:[],mats};sets.set(tex,b);}
      const rock=groundedRock.test(name),base=heightAt(map,x,y),skirt=rock?.33:.16;
      const depth=Math.min(w*.19,h*.39),sink=rock?Math.min(h*.20,8):Math.min(2,h*.07);
      const start=b.p.length/3,flip=hashLand(x|0,y|0,62)<.46;
      for(let row=0;row<3;row++)for(let col=0;col<4;col++){
        const u=col/3,dx=(u-.5)*w,dz=row===0?depth*(1-.42*Math.abs(u*2-1)):0,v=row===0?0:row===1?skirt:1;
        const floor=heightAt(map,x+dx,y+dz);
        const top=row===0?floor-sink:row===1?.62*base+.38*floor+h*hs*skirt-sink*.6:base+h*hs-sink;
        b.p.push(x+dx,top,(y+dz)*zs);b.uv.push(flip?1-u:u,v);b.n.push((u-.5)*.27,.98,.07);
        if(row<2&&col<3){const k=start+row*4+col;b.idx.push(k,k+1,k+5,k,k+5,k+4);}
      }
    },
    finish(group){
      for(const b of sets.values()){
        const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(b.p,3));
        g.setAttribute('normal',new T.Float32BufferAttribute(b.n,3));g.setAttribute('uv',new T.Float32BufferAttribute(b.uv,2));g.setIndex(b.idx);
        const mesh=new T.Mesh(g,b.mats.f);mesh.customDepthMaterial=b.mats.d;mesh.castShadow=mesh.receiveShadow=true;
        mesh.name='regional-scenery';mesh.userData.deco=true;group.add(mesh);
      }
    }
  };
}
export function addRiverMargins(T,group,map,area,field,tile,hs,zs,texture,material,heightAt) {
  if(!wildernessArt.ready)return;
  const sets=new Map();
  function plant(name,high,u,v,flip=false){
    const tex=texture('field_'+name);if(!tex)return;
    const h=high*hs,w=high*tex.image.width/tex.image.height,X=u*tile,Z=v*tile*zs,Y=heightAt(map,X,v*tile);
    let b=sets.get(tex);if(!b){b={p:[],uv:[],idx:[]};sets.set(tex,b);}
    const j=b.p.length/3,front=high*.24,embed=groundedRock.test(name)?high*.21:high*.065;
    for(let row=0;row<3;row++)for(let col=0;col<3;col++){
      const dx=w*(col*.5-.5),dz=row===0?front:0,floor=heightAt(map,X+dx,v*tile+dz);
      const t=row===0?0:row===1?.24:1,level=row===0?floor-embed:row===1?.65*Y+.35*floor+h*t-embed:Y+h-embed;
      b.p.push(X+dx,level,Z+dz*zs);b.uv.push(flip?1-col*.5:col*.5,t);
      if(row<2&&col<2){const k=j+row*3+col;b.idx.push(k,k+1,k+4,k,k+4,k+3);}
    }
  }
  for(let y=area.y0;y<area.y1;y++)for(let x=area.x0;x<area.x1;x++){
    const r=hashLand(x,y,74),u=x+.2+hashLand(x,y,75)*.61,v=y+.23+hashLand(x,y,76)*.55;
    if(r>.16||map.g[y]?.[x]!==0||field.sample(field.roads,u,v)<2.7)continue;
    const shore=field.shore(u,v), climate=field.climate(u,v);
    let name,high;
    if(shore>.10&&shore<1.9){name=r<.102&&climate!==cover.snow?'reedbed':'riverstone';high=name==='reedbed'?6+r*21:3.5+r*20;}
    else if(shore>=1.9&&shore<4.2&&r<.025){name=climate===cover.snow?'snowcrag':'riverstone';high=8+r*90;}
    else continue;
    if(field.isWorld){name=name==='reedbed'?'miniReeds':name==='snowcrag'?name:'miniBank';high*=1.42;}
    plant(name,high,u,v,hashLand(x,y,77)>.5);
  }
  const verges={cheongha:['miniGrove','miniReeds'],hwasan:['miniPlum','miniSlate'],wudang:['riverwillow','miniReeds'],seongdo:['miniBamboo','miniFirs'],silk:['miniMesa','miniBank'],tiangate:['miniSnow','miniFirs']};
  if(field.isWorld)for(const site of map.sites||[]){
    if(site.x0>area.x1+5||site.x1<area.x0-5||site.y0>area.y1+6||site.y1<area.y0-5)continue;
    const style=regionFor(site.map)?.[0],planting=style==='plum'?'miniPlum':['bamboo','workshop'].includes(style)?'miniBamboo':['alpine','tao','sword','highland'].includes(style)?'miniFirs':style==='caravan'?'miniMesa':'miniGrove';
    const length=site.x1-site.x0;
    for(let i=1;i<=8;i++){
      const r=hashLand(site.x0,site.y0,i),u=site.x0+length*(i-.5)/8,v=site.y0-2.4-r*3;
      if(u<area.x0||u>=area.x1||v<area.y0||v>=area.y1||map.g[Math.floor(v)]?.[Math.floor(u)]!==0||field.shore(u,v)<1.4||field.sample(field.tracks,u,v)<5)continue;
      plant(planting,20+21*r,u,v,r>.5);
    }
  }
  for(const stop of map.scenicStops||[]){
    const choices=verges[stop.from];if(!choices)continue;
    for(let j=2;j<stop.trail.length-1;j+=4){
      const [x,y]=stop.trail[j],[nx,ny]=stop.trail[j+1],length=Math.hypot(nx-x,ny-y)||1;
      const r=hashLand(x,y,87),side=r<.5?-1:1,width=2.8+r*2.6;
      const u=x+.5-side*(ny-y)*width/length,v=y+.5+side*(nx-x)*width/length;
      if(u<area.x0||u>=area.x1||v<area.y0||v>=area.y1||map.g[Math.floor(v)]?.[Math.floor(u)]!==0||field.sample(field.roads,u,v)<6)continue;
      plant(choices[j%3===0?1:0],23+20*r,u,v,r>.5);
    }
  }
  for(const [tex,b] of sets){
    const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(b.p,3));g.setAttribute('uv',new T.Float32BufferAttribute(b.uv,2));g.setIndex(b.idx);
    const n=new Float32Array(b.p.length);for(let i=1;i<n.length;i+=3)n[i]=1;g.setAttribute('normal',new T.BufferAttribute(n,3));
    const mats=material(tex),o=new T.Mesh(g,mats.m);o.receiveShadow=o.castShadow=true;o.customDepthMaterial=mats.d;o.userData={deco:true};o.name='river-margin';group.add(o);
  }
}
const vistas=new Map();
export function addSurround(T,group,map,tile,hs,zs){
  if(!map.surround)return;
  const {field,pad}=map.surround,area={x0:0,y0:0,x1:field.w,y1:field.h};
  const c=document.createElement('canvas');c.width=field.w*tile;c.height=field.h*tile;
  paintLandscape(c.getContext('2d'),field,area,tile);
  const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;
  const obj=reliefMesh(T,field,area,tile,hs,zs,new T.MeshLambertMaterial({map:tex}));
  const geo=obj.geometry,keys=geo.index.array,kept=[],p=geo.attributes.position;
  for(let i=0;i<keys.length;i+=3){
    const a=keys[i],b=keys[i+1],d=keys[i+2];
    const x=(p.getX(a)+p.getX(b)+p.getX(d))/(3*tile)+field.w/2-pad;
    const y=(p.getZ(a)+p.getZ(b)+p.getZ(d))/(3*tile*zs)+field.h/2-pad;
    if(x<=0||x>=map.w||y<=0||y>=map.h)kept.push(a,b,d);
  }
  geo.setIndex(kept);obj.position.x-=pad*tile;obj.position.z-=pad*tile*zs;
  obj.name='encounter-surroundings';obj.userData={backdrop:true,ownPaint:true};obj.castShadow=false;group.add(obj);
}
export function addVista(T,group,map,area,field,tile,zs) {
  if(!wildernessArt.ready||map.room)return;
  const site=(!field||map.encounter&&!map.encounter.natural)&&regionFor(map.encounter?.sourceId||map.id);
  if(!field&&!site)return;
  const x=(area.x0+area.x1)/2,y=(area.y0+area.y1)/2,cl=field?.climate(x,y);
  const style=site?.[0],id=style?(['alpine','highland'].includes(style)?2:style==='caravan'?3:['tao','bamboo','workshop','shadow'].includes(style)?1:0):cl===cover.snow?2:cl===cover.sand?3:cl===cover.forest?1:0;
  const key=style||id;
  if(!vistas.has(key)){
    const scenes={plum:0,tao:0,temple:0,sword:0,observatory:0,canal:1,harbor:1,village:1,
      capital:2,fortress:2,workshop:3,bamboo:3,shadow:3};
    const sky=style in scenes?wildernessArt.settlements[scenes[style]]:wildernessArt.horizons[id];
    const tex=new T.CanvasTexture(sky);tex.colorSpace=T.SRGBColorSpace;
    vistas.set(key,new T.MeshLambertMaterial({map:tex,fog:true,side:T.DoubleSide}));
  }
  const w=Math.max(780,(area.x1-area.x0)*tile*1.55),h=w*.225;
  const o=new T.Mesh(new T.PlaneGeometry(w,h),vistas.get(key));
  const terrace=map.hgt?Math.max(...map.hgt[0])*9:0;
  o.position.set(x*tile,h*.5-35+terrace,(area.y0*tile-75-(map.surround?.pad||0)*tile)*zs);
  o.userData={backdrop:true};o.name='regional-horizon';group.add(o);
}
