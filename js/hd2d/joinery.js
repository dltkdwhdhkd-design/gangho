import {assetImage} from '../asset-loader.js';
// Furnishings are fitted to the existing interaction footprints. Dimensions in the library are metres.
import { hangingShopFlag } from './trade-stalls.js';
export const joineryKeys='medicine_chest herb_shelf herb_drying bookcase scroll_press crockery tea_cabinet house_cabinet daybed dorm_bed counter dispensing_counter table altar teatable bench chair stool folding_screen coffer display_rack clinic_front books_front tea_front market_baskets writing_table meal_table tea_table gaming_table silk_table'.split(' ');
const roomTypes={library:'lib',sutra:'lib',inn2:'inn',shop2:'shop',hall_in:'hall',myhouse:'home',smith:'armory'};
const plain={longtable:'table',altar:'altar',teatable:'teatable',seat:'bench',bench:'bench',chair:'chair',stool:'stool',f_stool:'stool',screen:'folding_screen',box:'coffer',chest:'coffer',scrollcase:'scroll_press',bed:'daybed',f_bed:'dorm_bed'};
const isShelf=s=>['shelf','shelf2','bookcase','bookcase2','rack','rack2'].includes(s.src||s.name);
const indoorUse=map=>map.roomUse||map.roomKind||roomTypes[map.id]||map.id;
const tableHeights={writing_table:.75,meal_table:.75,tea_table:.75,gaming_table:.75,silk_table:.75,table:.75,altar:.87,teatable:.48,bench:.43,counter:.833,dispensing_counter:.833,chair:.41,stool:.41};
export function furnitureKey(map,stamp){
  if(stamp.marketUse&&stamp.name==='counter')return stamp.marketUse;
  if(!map?.room||stamp.flat||stamp.on)return;
  const s=stamp.src||stamp.name,role=indoorUse(map);
  if(s==='longtable'){
    if(['gov','lib','elder','book','temple'].includes(role))return 'writing_table';
    if(['mess','rest'].includes(role))return 'meal_table';
    if(role==='inn')return (Math.floor(stamp.x/16)%3===0?'meal_table':'tea_table');
    if(['home','tea','shop','giru'].includes(role))return 'tea_table';
    if(role==='gamble')return 'gaming_table';
    if(role==='silk')return 'silk_table';
  }
  if(s==='f_bed'&&role==='dorm'&&(map.id.endsWith('2')||Math.round(stamp.x/16)%3===0))return 'daybed';
  if(plain[s])return plain[s];
  if(s==='drawer')return role==='clinic'?'medicine_chest':'house_cabinet';
  if(s==='counter')return role==='clinic'?'dispensing_counter':'counter';
  if(!isShelf(stamp))return;
  const shelves=map.stamps.filter(isShelf);
  const index=Math.max(0,shelves.findIndex(q=>q===stamp||(q.x===stamp.x&&q.y===stamp.y)));
  if(role==='clinic')return index%2?'herb_drying':'herb_shelf';
  if(role==='lib'||role==='book'||s==='bookcase'||s==='bookcase2')return index%3===1?'scroll_press':'bookcase';
  if(s==='rack'||s==='rack2')return ['inn','tea','mess','rest','shop'].includes(role)?'crockery':'display_rack';
  if(['inn','shop','tea','rest','mess','gamble','giru'].includes(role))return index%2?'tea_cabinet':'crockery';
  return index%2?'house_cabinet':'tea_cabinet';
}
export function frontageKey(map,s){
  if(map.room||map.id==='world'||map.stage||(!s.doorTo&&!(map.id==='mysect'&&s.archUse)))return;
  const use=s.archUse||roomTypes[s.doorTo]||s.doorTo;
  return {clinic:'clinic_front',lib:'books_front',book:'books_front',inn:'tea_front',tea:'tea_front',rest:'tea_front',
    mess:'tea_front',armory:'display_rack',shop:'market_baskets',silk:'market_baskets'}[use];
}
export const metre=actorScale=>15*actorScale/1.65;
export const topOfFurniture=(key,actorScale)=>tableHeights[key]&&tableHeights[key]*metre(actorScale);
function measured(T,model){
  // Named nodes can be quantized meshes. Measure a detached clone to avoid including a parent transform.
  if(!model.userData.joinerySize)model.userData.joinerySize=new T.Box3().setFromObject(model.clone(true)).getSize(new T.Vector3());
  return model.userData.joinerySize;
}
function instance(T,library,materials,key){
  const src=library?.getObjectByName(key);
  if(!src)return null;
  const group=new T.Group(),model=src.clone(true),ms=[];
  model.traverse(o=>{if(!o.isMesh)return;const M=materials.get(o.geometry);o.material=M.m;o.customDepthMaterial=M.d;
    o.castShadow=o.receiveShadow=true;o.userData={M,owner:group,shared:true};ms.push(o);});
  group.add(model);group.userData={ms,joinery:key};return {group,model,src};
}
export function placeFurniture(T,map,s,spec,key,library,materials,heightAt,hs,zs,actorScale){
  const part=instance(T,library,materials,key);if(!part)return;
  const k=metre(actorScale),sc=s.sc||1,side=(s.src||s.name)==='f_bed';
  const sol=s.sol||{x:s.x,y:s.base-7,w:spec[3]*sc,h:7};
  const size=measured(T,part.src),wide=side?size.z:size.x,deep=side?size.x:size.z;
  const keep=['stool','chair','teatable'].includes(key);
  const x=sol.x+sol.w/2,y=sol.y+sol.h/2;
  const sx=keep?k:Math.min(Math.max(sol.w/wide,k*.65),k*(key==='bench'||key==='counter'||key==='dispensing_counter'||key==='table'||key.endsWith('_table')?2.4:1.70));
  const sz=Math.min(Math.max(sol.h/deep,k*.82),k*1.26);
  if(side)part.model.rotateY(Math.PI/2);
  part.group.scale.set(sx,k*hs,sz*zs);
  part.group.position.set(x,heightAt(map,x,y),y*zs);Object.assign(part.group.userData,{s,furn:true});
  return part.group;
}
export function dressFront(T,map,s,key,library,materials,heightAt,hs,zs,tile){
  const part=instance(T,library,materials,key);
  const sol=s.sol;if(!part||!sol)return;
  const w=sol.w,portal=map.portals.find(q=>q.door&&q.to===s.doorTo);
  const center=portal?portal.x+portal.w/2:sol.x+w/2,doorWidth=portal?.w||12;
  const side=center-sol.x>sol.x+w-center?1:-1;
  const scale=Math.min(tile*.83,w*.205),x=center-side*Math.max(doorWidth*.52+scale*.62,w*.295);
  const y=sol.y+sol.h+3;
  hangingShopFlag(T,part.group,key,-side);
  part.group.scale.set(scale,scale*hs,scale*zs);
  part.group.position.set(x,heightAt(map,x,y-1),y*zs);
  Object.assign(part.group.userData,{s,frontage:true});return part.group;
}
let atlas,ready;
export function loadJoineryAtlas(){
  return ready || (ready=assetImage('assets/hd2d/landscape/furniture.webp')
    .then(image=>(atlas=image)).catch(()=>null));
}
export function drawFurniture2D(ctx,map,s,spec){
  const key=furnitureKey(map,s);if(!key)return false;
  if(!atlas)loadJoineryAtlas();if(!atlas?.naturalWidth)return false;
  const i=(s.src||s.name)==='f_bed'?joineryKeys.length+(key==='daybed'?1:0):joineryKeys.indexOf(key);
  const w=atlas.width/6,h=atlas.height/Math.ceil((joineryKeys.length+2)/6);
  const sc=s.sc||1,sol=s.sol,x=sol?sol.x+sol.w/2:s.x+spec[3]*sc/2;
  const width=sol?.w||spec[3]*sc;
  const ratio=atlasShapes[i];
  const visualWidth=Math.max(width*.92,Math.min(24,width*1.16)),vh=visualWidth*ratio;
  ctx.drawImage(atlas,(i%6)*w,Math.floor(i/6)*h,w,h,x-visualWidth*.54,s.base-vh,visualWidth*1.08,vh);
  return true;
}
// Projected height / width of the trimmed sprites in the orthographic furniture atlas.
export const atlasShapes=[1.033,1.003,1.033,0.944,0.879,0.879,0.879,0.879,0.493,0.493,0.54,0.606,0.628,0.586,0.954,0.342,1.749,1.125,0.923,0.741,0.756,0.997,0.744,0.721,0.587,0.628,0.628,0.628,0.628,0.648,1.644,1.644];
