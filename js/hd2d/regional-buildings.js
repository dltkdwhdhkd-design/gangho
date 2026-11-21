// Architectural identities are shared by the travel map, settlement, and its encounters.
const sites = {
  hwasan:['plum','華山','梅'], wudang:['tao','武當','☯'], shaolin:['temple','少林','禪'], emei:['temple','峨嵋','蓮'],
  jongnam:['sword','終南','松'], gonryun:['alpine','崑崙','雲'], gongdong:['fortress','崆峒','玄'], jeomchang:['bamboo','點蒼','蒼'],
  cheongseong:['bamboo','青城','竹'], gaebang:['village','丐幫','義'], namgung:['sword','南宮','劍'], moyong:['canal','慕容','燕'],
  jegal:['observatory','諸葛','易'], dang:['workshop','唐門','藥'], paeng:['fortress','彭家','刀'], janggang:['harbor','長江','舟'],
  haomun:['canal','下汚','影'], odok:['workshop','五毒','蠱'], hyeoleui:['shadow','血衣','血'], cheonma:['shadow','天魔','魔'],
  haenam:['harbor','海南','潮'], cheonsan:['alpine','天山','雪'], jeonjin:['tao','全眞','眞'], mosan:['observatory','茅山','符'],
  jangbaek:['alpine','長白','松'], pota:['temple','普陀','蓮'], hwangbo:['capital','皇甫','拳'], ak:['fortress','岳家','岳'],
  yang:['sword','楊家','槍'], eon:['shadow','彦家','鎖'], jin:['harbor','陳家','潮'], bukhae:['alpine','北海','氷'],
  noeum:['highland','雷音','雷'], podalra:['highland','布達拉','日'], yeongyeong:['fortress','燕京','燕'], nakyang:['capital','洛陽','洛'],
  changan:['capital','長安','京'], seongdo:['workshop','成都','蜀'], guangzhou:['harbor','廣州','海'], suzhou:['canal','蘇州','蘇'],
  hangzhou:['canal','杭州','茶'], nanjing:['capital','南京','金'], kaifeng:['capital','開封','汴'], wuchang:['harbor','武昌','江'],
  taiyuan:['fortress','太原','晉'], fuzhou:['harbor','福州','閩'], dali:['bamboo','大理','洱'], cheongha:['village','清河','茶'],
  valley:['village','清風','泉'], bamboo:['bamboo','竹林','竹'], pass:['fortress','東關','關'], fort:['fortress','黑風','黑'],
  cloudmt:['tao','蒼雲','雲'], guhwa:['capital','九華','華'], wolha:['canal','月下','月'], silk:['caravan','絲路','商'],
  oasis:['caravan','沙州','沙'], tiangate:['highland','天門','關'], snowpeak:['alpine','雪峰','雪'], blackpalace:['shadow','黑雲','玄']
};
const neutral=['village','客舍','茶'];
const roles={hall:'hall',lodge:'wing',inn:'inn',shop_blue:'shop',shop_green:'shop',hut_o:'home',hut_b:'home',
  house_red:'wing',wood_o:'home',wood_b:'cottage',hut_o2:'cottage',mud:'cottage',straw:'cottage',clay:'home',gate:'gate',gate_arch:'gate'};
const areaStyle={forest:'bamboo',sand:'caravan',snow:'alpine',rock:'alpine'};
export const regionalStyles=['plum','tao','temple','workshop','observatory','sword','canal','fortress','capital','alpine','caravan','bamboo','shadow','village','harbor','highland'];
export const regionalRoles=['hall','wing','inn','home','cottage','shop','gate'];
export function regionFor(id){
  if(!id)return null;
  const key=id.replace(/^encounter_/,'').replace(/^shaolin_main$/,'shaolin').replace(/^[bcr]_/,'').split('_')[0];
  return sites[key]||null;
}
export function architectureOf(map,stamp,tile=16){
  const role=stamp.archRole||(stamp.grand?'hall':roles[stamp.archName||stamp.src||stamp.name]);
  if(!role||stamp.flat||stamp.landmark||map.room)return null;
  let owner=stamp.grand||stamp.archOwner||map.encounter?.sourceId||map.id;
  if(owner==='world'&&map.sites){
    const x=(stamp.x+(stamp.w||40)/2)/tile,y=stamp.base/tile;
    owner=map.sites.find(p=>x>=p.x0&&x<=p.x1&&y>=p.y0&&y<=p.y1)?.map||'';
  }
  const profile=regionFor(owner)||[areaStyle[map.landscape?.kind]||neutral[0],neutral[1],neutral[2]];
  return {style:profile[0],sign:profile[1],crest:profile[2],role};
}
const ornaments=new Map();
// Plaques stand at the actual lintel. The silk banners identify a family even across a common regional building tradition.
function crestTexture(T,style,word,crest){
  const key=style+word+crest;
  if(ornaments.has(key))return ornaments.get(key);
  const c=document.createElement('canvas'); c.width=160;c.height=64;
  const g=c.getContext('2d');g.fillStyle=({plum:'#632c35',tao:'#33554d',shadow:'#442c41',sword:'#34475b',workshop:'#384c41',caravan:'#416966'}[style]||'#4b4035');
  g.fillRect(0,0,160,64);g.strokeStyle='#d0ac73';g.lineWidth=3;g.strokeRect(4,4,152,56);
  g.fillStyle='#ebd5a2';g.textAlign='center';g.textBaseline='middle';g.font='bold 32px "Noto Serif CJK SC","Malgun Gothic",serif';
  g.fillText(word,80,32,136);
  const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;
  const m=new T.MeshLambertMaterial({map:t,side:T.DoubleSide});ornaments.set(key,m);return m;
}
export function regionalBuilding(T,map,stamp,spec,profile,library,materials,heightAt,hs,zs,tile){
  const src=library?.getObjectByName(profile.role);if(!src)return null;
  const sc=stamp.sc||1, gate=profile.role==='gate';
  const width=gate?spec[3]*sc*(stamp.name==='gate'?1.57:1.10) : (stamp.sol?.w||spec[7]*sc);
  const depth=gate?Math.max(width*.25,13*sc):(stamp.sol?.h||spec[8]*sc);
  let x=gate?stamp.x+spec[3]*sc*.5:stamp.sol?stamp.sol.x+width*.5:stamp.x+(spec[5]+spec[7]/2)*sc;
  if(gate&&map.court&&!map.stage&&stamp.name==='gate_arch')x=stamp.x+(2*(map.k||1))*tile;
  const y=gate?stamp.base:stamp.sol?stamp.sol.y+depth:stamp.y+(spec[6]+spec[8])*sc;
  const sy=(gate?width*.48:profile.role==='hall'&&stamp.hallWidth?Math.max(width*.35,32*sc):profile.role==='hall'?Math.max(width*.50,48*sc):Math.max(width*.48,24*sc))*hs;
  const group=new T.Group(), model=src.clone(true), ms=[];
  model.traverse(obj=>{if(!obj.isMesh)return;const M=materials.get(obj.geometry);obj.material=M.m;obj.customDepthMaterial=M.d;
    obj.userData={M,owner:group,shared:true};ms.push(obj);});
  group.add(model);
  if(gate||profile.role==='hall'){
    const badge=new T.Mesh(new T.PlaneGeometry(gate?.47:.36,gate?.15:.105),crestTexture(T,profile.style,!gate&&profile.sign==='武當'?'紫霄宮':profile.sign,profile.crest));
    const tallGate=['fortress','capital','shadow','caravan','highland','alpine'].includes(profile.style);
    const raised=['bamboo','harbor','canal','observatory'].includes(profile.style);
    const hallHeight=(['caravan','highland'].includes(profile.style)?.72*1.18:profile.style==='alpine'?.72*.88:.72)+(raised?.255:.20);
    const signed={tao:[0,.802,.068],plum:[0,.742,.068],temple:[0,.822,.068],capital:[0,.722,.068],observatory:[-.40,.86,-.275],workshop:[-.13,.67,-.49],fortress:[0,.88,-.174],shadow:[0,.88,-.27],canal:[-.37,.77,-.30],harbor:[-.25,.81,-.52]};
    if(!gate&&signed[profile.style])badge.position.set(...signed[profile.style]);
    else if(gate&&['canal','observatory'].includes(profile.style))badge.position.set(0,.785,-.263);
    else badge.position.set(0,gate?(tallGate?.916:1.026):hallHeight-.076,gate?-.307:-.135);
    badge.userData.flat=true;group.add(badge);
  }
  group.scale.set(width/1.90,sy,depth/1.06*zs);
  group.position.set(x,heightAt(map,x,y-1),y*zs);group.userData={s:stamp,house:true,ms,architecture:profile.style+'/'+profile.role,region:profile.sign};
  return group;
}
let atlas;
let atlasReady;
export function loadRegionalAtlas(){
  if(!atlas){atlas=new Image();atlas.src='assets/hd2d/landscape/architecture.webp';}
  return atlasReady||(atlasReady=atlas.decode().then(()=>atlas).catch(()=>null));
}
export function drawRegional2D(ctx,map,stamp,w0,h0){
  const p=architectureOf(map,stamp);if(!p)return false;
  if(!atlas)loadRegionalAtlas();
  if(!atlas.naturalWidth)return false;
  const cellW=atlas.naturalWidth/regionalRoles.length,cellH=atlas.naturalHeight/regionalStyles.length;
  const scale=stamp.sc||1,w=stamp.hallWidth?stamp.hallWidth*1.25:stamp.iso?stamp.w*1.18:w0*scale*1.19;
  const h=stamp.hallWidth?w*.64:stamp.iso?Math.max(stamp.h,w*.71):p.role==='hall'?Math.max(w*.82,h0*scale*.76):w*.77;
  const x=stamp.x+(stamp.iso?stamp.w:w0*scale)/2;
  ctx.drawImage(atlas,regionalRoles.indexOf(p.role)*cellW,regionalStyles.indexOf(p.style)*cellH,cellW,cellH,
    x-w*.5,stamp.base-h*.90,w,h);
  return true;
}

