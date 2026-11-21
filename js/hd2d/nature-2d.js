import {jegalFord,onJegalAxis} from '../river-crossing.js';
import {foliageNames,foliageName,animalSizes} from './river-models.js';
import {fieldProps} from './field-art.js';
import {localScenery} from './wilderness.js';

import { plumVariant, drawPaintedPlum } from './painted-plums.js';
const sheets={};
function atlas(name){
  if(!sheets[name]){
    const img=new Image();img.src='assets/hd2d/landscape/'+name+'.webp';sheets[name]=img;
  }
  return sheets[name].naturalWidth?sheets[name]:null;
}
const plants=new WeakMap();
export function drawPlant2D(c,map,stamp,w0){
  if(map.room||stamp.flat||! /^(?:tree|grove|bamboo|plum|bush|fern|flower|t_|g_)/.test(stamp.name))return false;
  if(!plants.has(stamp)){
    const sc=stamp.sc||1,x=stamp.x+w0*sc/2,y=stamp.base;
    const scenery=localScenery(map,stamp,x,y)||fieldProps(stamp.name,map.biome);
    const r=((Math.imul(Math.round(x)+31,1103515245)^Math.imul(Math.round(y)+19,16777619))>>>0)/4294967296;
    const n=foliageName(stamp.name,scenery?.[0],r),index=foliageNames.indexOf(n);
    const size=(scenery?.[1]||(index>=0&&index<16?38:8))*sc;
    const plum=plumVariant(stamp.name,scenery?.[0],r);
    plants.set(stamp,index<0&&plum==null?null:{index,plum,x,y,h:size*1.49});
  }
  const p=plants.get(stamp);if(!p)return false;
  if(p.plum!=null&&drawPaintedPlum(c,p.plum,p.x,p.y,p.h*.84))return true;
  const img=atlas('groves');if(!img)return false;
  const w=p.h*128/140;
  c.drawImage(img,p.index%6*128,Math.floor(p.index/6)*140,128,140,p.x-w/2,p.y-p.h*.82,w,p.h);return true;
}
const rows=Object.keys(animalSizes);
export function drawAnimal2D(c,a){
  const y=rows.indexOf(a.kind),im=y>=0&&atlas('wildlife');if(!im)return false;
  const moving=!!(a.vx||a.vy);
  if(moving)a.fd=(a.vx<0?2:0)+(a.vy<0?1:0);
  const frame=(a.fd??2)*4+(moving?Math.floor(a.walk||0)%4:0),w=animalSizes[a.kind]*1.98,h=w*64/72;
  c.drawImage(im,frame*72,y*64,72,64,a.x-w*.5,a.y-h*.693,w,h);return true;
}
export function drawFord2D(c,map,cam,w,h,tile){
  if(map.id!=='world')return;
  const b=jegalFord;if(cam.x+w<(b.ax-3)*tile||cam.y+h<(b.ay-3)*tile||cam.x>(b.bx+3)*tile||cam.y>(b.by+3)*tile)return;
  const im=atlas('crossing');if(!im)return;
  const a=onJegalAxis(b.ax,b.ay),wide=b.width*tile*1.2,long=a.length*tile*5.8/5.6;
  c.save();c.translate((b.ax+b.bx)*tile/2,(b.ay+b.by)*tile/2);c.rotate(-Math.atan2(a.ux,a.uy));
  c.drawImage(im,-wide/2,-long/2,wide,long);c.restore();
}
