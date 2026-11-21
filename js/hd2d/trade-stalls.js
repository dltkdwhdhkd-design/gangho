import { regionFor } from './regional-buildings.js';
const symbols={clinic_front:'藥',books_front:'書',tea_front:'茶',market_baskets:'貨',display_rack:'兵',silk_table:'綢',meal_table:'食',writing_table:'墨',tea_table:'茶'};
const dye={clinic_front:['#406253','#e7d6a3'],books_front:['#415269','#e3d5b7'],tea_front:['#716341','#ece1ae'],market_baskets:['#966043','#f0d9b1'],display_rack:['#475666','#d4c49b'],silk_table:['#864658','#edce9a'],meal_table:['#93714b','#e4d7a8'],writing_table:['#4d606e','#e2d7b9'],tea_table:['#4c6e5c','#eddaab']};
const flags=new Map(),paints=new Map();
function textile(T,key,cloth){
  const id=key+(cloth?'canopy':'sign');if(flags.has(id))return flags.get(id);
  const c=document.createElement('canvas');c.width=128;c.height=cloth?128:208;const g=c.getContext('2d'),[a,b]=dye[key]||dye.market_baskets;
  g.fillStyle=a;g.fillRect(0,0,c.width,c.height);
  for(let x=0;x<c.width;x+=2){g.globalAlpha=x%6===0?.07:.035;g.fillStyle=b;g.fillRect(x,0,1,c.height);}
  g.globalAlpha=1;g.strokeStyle=b;
  if(cloth){for(const y of [3,8,116,123]){g.lineWidth=y%2?1:3;g.beginPath();g.moveTo(0,y);g.lineTo(128,y);g.stroke();}
    for(let x=-8;x<140;x+=23){g.lineWidth=1.5;g.beginPath();g.arc(x,112,8,0,Math.PI,true);g.stroke();}}
  else{g.lineWidth=3;g.strokeRect(8,11,112,185);g.lineWidth=1;g.strokeRect(13,16,102,175);g.fillStyle=b;g.textAlign='center';g.textBaseline='middle';g.font='bold 77px Batang,SimSun,serif';g.fillText(symbols[key]||'貨',64,99);g.fillRect(57,155,14,16);}
  const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.anisotropy=4;const m=new T.MeshLambertMaterial({map:t,side:T.DoubleSide});flags.set(id,m);return m;
}
function timber(T,color){
  if(!paints.has(color))paints.set(color,new T.MeshLambertMaterial({color}));return paints.get(color);
}
function rail(T,g,a,b,r,col='#795839'){
  const p=new T.Vector3(...a),v=new T.Vector3(...b).sub(p);const o=new T.Mesh(new T.CylinderGeometry(r,r*1.08,v.length(),8),timber(T,col));
  o.position.copy(p).addScaledVector(v,.5);o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),v.normalize());o.castShadow=o.receiveShadow=true;g.add(o);
}
function fabric(T,rows,mat){
  const p=[],uv=[],idx=[];for(const [j,row] of rows.entries())for(const [i,point] of row.entries()){
    p.push(...point);uv.push(i/(row.length-1),1-j/(rows.length-1));
    if(j<rows.length-1&&i<row.length-1){const k=j*row.length+i;idx.push(k,k+row.length,k+1,k+1,k+row.length,k+row.length+1);}
  }
  const geo=new T.BufferGeometry();geo.setIndex(idx);geo.setAttribute('position',new T.Float32BufferAttribute(p,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geo.computeVertexNormals();
  const o=new T.Mesh(geo,mat);o.castShadow=o.receiveShadow=true;return o;
}
export function hangingShopFlag(T,g,key,side){
  const x=.59*side;
  rail(T,g,[x,0,-.10],[x,1.83,-.10],.028);
  rail(T,g,[x-.24,1.72,-.08],[x+.25,1.72,-.08],.023,'#a18057');
  g.add(fabric(T,Array.from({length:7},(_,j)=>Array.from({length:6},(_,i)=>{
    const u=i/5,v=j/6;return [x+(u-.5)*.43+.023*v,1.72-v*.80+(j===6?.034*Math.sin(u*6):0),-.065+.027*Math.sin(u*8+v)*v];
  })),textile(T,key,false)));
}
export function makeAwning(T,map,s,spec,hs,zs,heightAt){
  if(!s.marketUse)return;
  const x=s.x+spec[3]*(s.sc||1)*.5,y=s.base,w=Math.max(24,spec[3]*(s.sc||1)*.87),d=w*.45;
  const g=new T.Group(),h=Math.min(w*.57,27);
  for(const X of [-.46,.46])for(const Z of [-.48,.48])rail(T,g,[w*X,0,Z*d],[w*X,h+(Z<0?2:0),Z*d],w*.012);
  for(const Z of [-.48,.48])rail(T,g,[-w*.50,h+(Z<0?2:0),d*Z],[w*.50,h+(Z<0?2:0),d*Z],w*.016);
  const roof=Array.from({length:7},(_,j)=>Array.from({length:13},(_,i)=>{const u=i/12,v=j/6;
    return [(u-.5)*w*1.08,h+2.45*(1-v)-1.45*Math.sin(Math.PI*u)+.35*Math.cos(u*Math.PI*10),(v-.51)*d*1.17];}));
  g.add(fabric(T,roof,textile(T,s.marketUse,true)));
  const hem=[roof[6],roof[6].map(([x,y,z],i)=>[x,y-1.8-.55*Math.sin(i/12*Math.PI*6),z+.36])];g.add(fabric(T,hem,textile(T,s.marketUse,true)));
  g.position.set(x,heightAt(map,x,y),y*zs);g.scale.set(1,hs,zs);g.userData={s,market:true};return g;
}
export function marketGoods(city,at){
  const style=regionFor(city)?.[0],sets={
    canal:['silk_table','tea_table','books_front','clinic_front'],harbor:['market_baskets','meal_table','tea_front','silk_table'],
    capital:['writing_table','silk_table','tea_table','clinic_front'],workshop:['clinic_front','display_rack','books_front','tea_table'],
    fortress:['display_rack','meal_table','market_baskets','tea_front'],bamboo:['tea_table','market_baskets','clinic_front','books_front']};
  return (sets[style]||sets.capital)[at%4];
}
