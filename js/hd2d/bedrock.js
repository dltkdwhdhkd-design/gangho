// Smooth granite outcrops. All dimensions, including texture coordinates, are fixed in world space.
import { outdoorMaterial } from './outdoor-light.js';
const shapes=new Map(),paints=new Map();
function irregular(seed,i){
  let n=Math.imul(seed+13,2246822519)^Math.imul(i+197,3266489917);
  n=Math.imul(n^(n>>>15),1597334677);return ((n^(n>>>16))>>>0)/4294967296;
}
export function boulder(T,seed){
  if(shapes.has(seed))return shapes.get(seed);
  const pos=[],ink=[],uv=[],indices=[],rings=7,sides=15;
  const radius=[.69,.86,.99,1,.84,.56,.11],height=[0,.09,.28,.51,.74,.90,1];
  const squash=irregular(seed,83)*.12+.68;
  for(let j=0;j<rings;j++)for(let i=0;i<=sides;i++){
    const k=i%sides,a=k*Math.PI*2/sides;
    const profile=.84+.25*irregular(seed,k)+.07*Math.cos(3*a+seed*.09);
    const x=radius[j]*Math.cos(a)*profile+(j/rings-.4)*.18;
    const z=radius[j]*Math.sin(a)*profile*squash;
    const y=height[j]*(1+.13*Math.cos(a+seed*.3)*radius[j]+.035*Math.sin(3*a));
    pos.push(x,y,z);uv.push(i/sides*2+.018*Math.sin(a),.08+y*.84);
    const lichens=Math.max(0,(y-.58)*.5+.27*Math.sin(2*a+seed));
    const light=.83+y*.21+.04*Math.sin(3*a+seed);
    ink.push(light*(1-lichens*.21),light*(1-lichens*.10),light*(1-lichens*.31));
    if(j<rings-1&&i<sides){const n=j*(sides+1)+i;indices.push(n,n+sides+1,n+1,n+1,n+sides+1,n+sides+2);}
  }
  const top=pos.length/3;pos.push(.12,1.01,0);ink.push(1,.99,.95);uv.push(.53,.88);
  for(let i=0;i<sides;i++)indices.push((rings-1)*(sides+1)+i,top,(rings-1)*(sides+1)+i+1);
  const geo=new T.BufferGeometry();geo.setIndex(indices);geo.setAttribute('position',new T.Float32BufferAttribute(pos,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geo.setAttribute('color',new T.Float32BufferAttribute(ink,3));geo.computeVertexNormals();
  const nrm=geo.attributes.normal;
  for(let j=0;j<rings;j++){const a=j*(sides+1),b=a+sides,v=new T.Vector3().fromBufferAttribute(nrm,a).add(new T.Vector3().fromBufferAttribute(nrm,b)).normalize();nrm.setXYZ(a,v.x,v.y,v.z);nrm.setXYZ(b,v.x,v.y,v.z);}
  geo.computeBoundingSphere();shapes.set(seed,geo);return geo;
}
function granite(T,tone,texture){
  if(paints.has(tone))return paints.get(tone);
  const paint=new T.MeshLambertMaterial({map:texture('field_mountain-granite'),color:tone,vertexColors:true});
  const fade=paint.clone();fade.transparent=true;fade.opacity=.35;fade.depthWrite=false;
  const M={m:outdoorMaterial(paint),f:outdoorMaterial(fade)};paints.set(tone,M);return M;
}
export function weatheredStones(T,map,s,spec,heightAt,hs,zs,texture){
  if(map.room||map.id==='world'||s.flat||!['rocks','rocks_s','boulder','g_rocks','g_mossrock'].includes(s.name))return;
  const sc=s.sc||1,sol=s.sol,w=sol?.w||spec[3]*sc,depth=sol?.h||w*.50;
  const x=sol?sol.x+w/2:s.x+w/2,y=sol?sol.y+depth/2:s.base-2;
  const seed=(Math.round(x)*53+Math.round(y)*163)>>>0;
  const group=new T.Group(),ms=[],M=granite(T,map.biome==='snow'?'#dbedeb':map.biome==='sand'?'#c3aa8a':'#c3c4ad',texture);
  const pack=s.name.startsWith('rocks'),small=s.name.startsWith('g_');
  const layouts=pack?[[-.21,-.02,.67,.65],[.17,.09,.46,.43],[.36,-.08,.29,.33],[-.42,.15,.23,.20]]:
    small?[[-.20,0,.50,.36],[.22,.11,.33,.26]]:[[.035,0,.94,.64],[-.35,.15,.24,.18]];
  for(const [i,[dx,dz,size,high]] of layouts.entries()){
    const v=irregular(seed,i),geo=boulder(T,Math.floor(v*17)),o=new T.Mesh(geo,M.m);
    const xx=x+dx*w,yy=y+dz*depth,r=w*size*.61;
    o.scale.set(r,Math.min(w*.68,depth*1.22)*high*hs,(depth*.55+w*.13)*size*zs);
    o.rotation.y=(v-.5)*1.2;o.position.set(xx,heightAt(map,xx,yy)-.27*hs,yy*zs);
    o.castShadow=o.receiveShadow=true;o.userData={M,owner:group,shared:true};group.add(o);ms.push(o);
  }
  group.userData={s,rock:true,ms};return group;
}
