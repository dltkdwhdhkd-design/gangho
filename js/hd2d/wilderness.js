import { cover, hashLand, landscapeOf, paintLandscape, wildernessArt } from '../landscape.js';
import { regionFor } from './regional-buildings.js';

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
  const mesh=new T.Mesh(geo,material);mesh.position.set(midX*tile,0,midY*tile*zs);
  mesh.name='travel-relief';mesh.castShadow=true;return mesh;
}

export function localScenery(map,s,cx,fy) {
  const f=landscapeOf(map);if(!f)return null;
  const t=f.climate(cx/16,fy/16),r=hashLand(Math.round(cx),Math.round(fy),11);
  if(s.landmark)return [s.landmark,s.landmark==='teahut'?29:15];
  if(/^mtn|^crag/.test(s.name))return r<.27?[t===cover.snow?'snowcrag':t===cover.sand?'mesa':'spire',42+r*45]:['',0];
  if(/^rocks|^boulder/.test(s.name))return [t===cover.snow?'snowcrag':t===cover.sand?'mesa':r<.49?'shelf':'riverstone',11+r*14];
  if(/bamboo/.test(s.name))return ['canes',28+r*15];
  if(/tree_snow|tree_white|grove_white/.test(s.name))return ['fir',33+r*21];
  if(/tree_pine|grove_pine|t_pine/.test(s.name))return ['oldpine',32+r*25];
  if(/tree_round|tree_big|grove_green|t_willow/.test(s.name)){
    if(f.shore(cx/16,fy/16)<5)return ['riverwillow',29+r*19];
    return [r<.29?'goldtree':r<.69?'persimmon':'oldpine',29+r*24];
  }
  return null;
}
export function addRiverMargins(T,group,map,area,field,tile,hs,zs,texture,material,heightAt) {
  if(!wildernessArt.ready)return;
  const sets=new Map();
  for(let y=area.y0;y<area.y1;y++)for(let x=area.x0;x<area.x1;x++){
    const r=hashLand(x,y,74),u=x+.2+hashLand(x,y,75)*.61,v=y+.23+hashLand(x,y,76)*.55;
    if(r>.16||map.g[y]?.[x]!==0||field.sample(field.roads,u,v)<2.7)continue;
    const shore=field.shore(u,v), climate=field.climate(u,v);
    let name,high;
    if(shore>.10&&shore<1.9){name=r<.102&&climate!==cover.snow?'reedbed':'riverstone';high=name==='reedbed'?6+r*21:3.5+r*20;}
    else if(shore>=1.9&&shore<4.2&&r<.025){name=climate===cover.snow?'snowcrag':'riverstone';high=8+r*90;}
    else continue;
    const tex=texture('field_'+name);if(!tex)continue;
    const h=high*hs,w=high*tex.image.width/tex.image.height,X=u*tile,Z=v*tile*zs,Y=heightAt(map,X,v*tile);
    let b=sets.get(tex);if(!b){b={p:[],uv:[],idx:[]};sets.set(tex,b);}
    const j=b.p.length/3;b.p.push(X-w/2,Y,Z,X+w/2,Y,Z,X+w/2,Y+h,Z,X-w/2,Y+h,Z);
    b.uv.push(0,0,1,0,1,1,0,1);b.idx.push(j,j+1,j+2,j,j+2,j+3);
  }
  for(const [tex,b] of sets){
    const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(b.p,3));g.setAttribute('uv',new T.Float32BufferAttribute(b.uv,2));g.setIndex(b.idx);
    const n=new Float32Array(b.p.length);for(let i=1;i<n.length;i+=3)n[i]=1;g.setAttribute('normal',new T.BufferAttribute(n,3));
    const o=new T.Mesh(g,material(tex).m);o.receiveShadow=true;o.userData={deco:true};o.name='river-margin';group.add(o);
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
