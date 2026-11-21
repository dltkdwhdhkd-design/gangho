import { regionFor } from './regional-buildings.js';
const pigments={plum:'#7b4050',tao:'#47605b',temple:'#90613c',workshop:'#4d6958',observatory:'#646482',sword:'#40546c',canal:'#58736c',fortress:'#675949',capital:'#7d4841',alpine:'#647989',caravan:'#86704d',bamboo:'#667748',shadow:'#654854',village:'#7f7255',harbor:'#56757f',highland:'#884f42'};
const titles={clinic:['本草','仁術'],lib:['藏書','山居'],book:['書林','集古'],elder:['松風','聽泉'],dorm:['修身','靜心'],mess:['五味','清供'],inn:['清泉','春茗'],tea:['茶經','新茗'],rest:['山珍','四時'],shop:['百貨','利市'],silk:['錦繡','織雲'],gamble:['長樂','如意'],armory:['藏鋒','守正'],home:['四時','清芳'],shrine:['祈安','長寧'],temple:['觀心','山月'],gov:['明察','慎獨'],hall:['正心','同門'],giru:['清商','玉笛']};
const oldRooms={library:'lib',sutra:'lib',shop2:'shop',inn2:'inn',smith:'armory',hall_in:'hall',hall2:'hall',myhouse:'home'};
function typeOf(m){return m.roomUse||m.roomKind||oldRooms[m.id]||m.id;}
export function silkBay(m,i,count){
  const role=typeOf(m);if(!titles[role]||count<2)return false;
  if(['hall','gov','temple'].includes(role))return (i===0||i===count-1)&&count>2;
  return i===(role==='clinic'||role==='lib'||role==='armory'?Math.floor((count-1)/2):(m.id.length+role.length)%count);
}
const paintings=new Map();
function wallPainting(T,role,profile,canvasAtlas){
  const style=profile?.[0]||'village',sign=profile?.[2]||'山',key=style+'/'+role;
  if(paintings.has(key))return paintings.get(key);
  const c=document.createElement('canvas');c.width=176;c.height=320;
  const g=c.getContext('2d');g.fillStyle=pigments[style];g.fillRect(0,0,176,320);
  if(canvasAtlas){g.globalAlpha=.25;g.drawImage(canvasAtlas,768,0,256,256,0,0,176,320);g.globalAlpha=1;}
  g.strokeStyle='#c8ad78';g.lineWidth=2;g.strokeRect(5,8,166,304);
  g.fillStyle='#ddd0ac';g.fillRect(18,26,140,265);
  if(canvasAtlas)g.drawImage(canvasAtlas,0,256,256,256,19,27,138,263);
  g.fillStyle='#ece0bc';g.globalAlpha=.69;g.fillRect(19,27,138,263);g.globalAlpha=1;
  function branch(x,y,len,ang,k){
    const X=x+Math.cos(ang)*len,Y=y+Math.sin(ang)*len;
    g.strokeStyle=k>2?'#625b46':'#777c59';g.lineWidth=k*.70;g.beginPath();g.moveTo(x,y);g.quadraticCurveTo(x+(X-x)*.65+3,y+(Y-y)*.34,X,Y);g.stroke();
    if(k>0){branch(X,Y,len*.75,ang-.29,k-1);branch(x+(X-x)*.56,y+(Y-y)*.56,len*.59,ang+.59,k-1);}
    if(k<2){g.save();g.translate(X,Y);g.rotate(ang+.3);g.fillStyle=style==='plum'?'#aa747d':'#8b926a';g.beginPath();g.ellipse(2,0,k+3,1.7,0,0,Math.PI*2);g.fill();g.restore();}
  }
  if(['clinic','tea','home','dorm','rest','silk','shop','giru'].includes(role))branch(46,265,39,-1.09,5);
  else if(canvasAtlas)g.drawImage(canvasAtlas,768,512,256,256,25,156,126,122);
  const words=titles[role]||titles.home;
  g.textAlign='center';g.fillStyle='#504635';g.font='bold 32px KaiTi, SimSun, Batang, serif';
  [...words[0]].forEach((v,i)=>g.fillText(v,112,79+i*39));
  g.font='16px Batang,serif';[...words[1]].forEach((v,i)=>g.fillText(v,83,69+i*20));
  g.fillStyle='#a65546';g.fillRect(106,152,19,21);g.font='15px Batang,serif';g.fillStyle='#eddbb4';g.fillText(sign,115,168);
  const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.anisotropy=4;
  const material=new T.MeshLambertMaterial({map:t,side:T.DoubleSide});paintings.set(key,material);return material;
}
let brass,rod;
export function mountSilk(T,group,m,x,wallDepth,z,hs,zs,atlas){
  const role=typeOf(m),profile=regionFor(m.roomRegion||m.id),width=role==='hall'?9.0:11.8,height=21.5;
  const silk=new T.Mesh(new T.PlaneGeometry(width,height*hs),wallPainting(T,role,profile,atlas));
  silk.position.set(x,(z+height/2)*hs,wallDepth*zs);silk.receiveShadow=true;silk.userData.flat=true;group.add(silk);
  brass||=new T.MeshLambertMaterial({color:'#ac9164'});rod||=new T.CylinderGeometry(.48,.48,1,10);
  for(const h of [0,height]){const rail=new T.Mesh(rod,brass);rail.rotation.z=Math.PI/2;rail.scale.y=width+2.4;rail.position.set(x,(z+h)*hs,wallDepth*zs+.13);rail.userData={flat:true,shared:true};group.add(rail);}
}
