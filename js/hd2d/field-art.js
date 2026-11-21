import { bridgeHeight } from './walkways.js';
import { loadWildernessArt } from '../landscape.js';
import { loadRegionalAtlas } from './regional-buildings.js';
const materials = 'grass moss road yard slab plank sand snow cedar roof plaster crag'.split(' ');
const margins = ['bank_ledge','bank_reeds','trail_dry','trail_fern','trail_paving','trail_frost'];
const scenery = {
  statue: ['lion_guard', 23], statue_big: ['lion_guard', 33],
  lantern: ['silk_lamp', 23], v_lamppost: ['silk_lamp', 27], sign: ['shop_sign', 17],
  bush1: ['shrub', 8], bush2: ['shrub', 9], bush3: ['shrub', 10], bush4: ['ferns', 7],
  grove_green: ['shrub', 18], fern1: ['ferns', 6], fern2: ['ferns', 7],
  pot: ['jars', 8], jar: ['jars', 9], f_dummy: ['training_post', 17], v_dummy: ['training_post', 17],
  rack: ['blade_rack', 19], rack2: ['blade_rack', 20], gong: ['brass_gong', 22],
  v_stall: ['stall', 25], log: ['logpile', 9], chest: ['travel_chest', 8], box: ['travel_chest', 8],
  tree_round: ['ginkgo', 51], tree_big: ['persimmon', 58], tree_pine: ['pine', 54],
  t_pine: ['pine', 54], t_camphor: ['ginkgo', 49], t_maple: ['persimmon', 44],
  bamboo: ['bamboo', 39], t_bamboo: ['bamboo', 39], plum: ['plum', 45], plum_w: ['plum', 46],
  plum_o: ['persimmon', 44], plum_g: ['willow', 49], t_plum: ['plum', 45], t_willow: ['willow', 49],
  v_stonelamp: ['stone_lamp', 18], censer: ['censer', 14], bell: ['bell', 27],
  tablet: ['stele', 20], tablet2: ['stele', 16], f_bonsai: ['bonsai', 12],
  notice: ['notice', 21], cart: ['cart', 19], boulder_w: ['outcrop', 19],
  tree_snow: ['fir', 52], v_signboard: ['notice', 20], v_cart: ['cart', 19], v_basket: ['baskets', 9], v_notice: ['notice', 21],
};
export const fieldProps = (name, biome) => biome === 'snow' && ['tree_pine','t_pine','tree_round'].includes(name)
  ? ['fir', 54] : scenery[name];
export const floorMaterial = { fl_pine: 'plank', fl_dark: 'cedar', fl_slab: 'slab', fl_brick: 'yard', fl_scale: 'slab', fl_mat: 'plank' };
export const walking = {};
export let combatLayout;
const loading = new Map();
let castIndex;
export function loadActorPage(images,page) {
  if (!page || images['field_'+page]) return;
  if (!loading.has(page)) {
    loading.set(page, new Promise(resolve => {
      const image = new Image();
      image.onload = () => { images['field_'+page] = image; loading.delete(page); resolve(); };
      image.onerror = () => { loading.delete(page); resolve(); };
      image.src = 'assets/hd2d/field/' + page + '.webp';
    }));
  }
  return loading.get(page);
}
export function loadCombatArt(images,slot) {
  return slot && loadActorPage(images,slot[0].replace('walk','combat'));
}
export function loadCastIndex(images) {
  if (!castIndex) castIndex = Promise.all(['walk','motions'].map(async name => {
    const response=await fetch('assets/hd2d/field/'+name+'.json');
    if(!response.ok)throw Error(name+' '+response.status);
    const data=await response.json();
    if(name==='walk')Object.assign(walking,data);
    else {combatLayout=data;await loadActorPage(images,'weapons');}
  })).catch(()=>{castIndex=null;});
  return castIndex;
}
export async function loadFieldArt(images) {
  const names = new Set([...materials, ...margins, ...Object.values(scenery).map(a => a[0]), 'fir']);
  await Promise.all([loadCastIndex(images),loadRegionalAtlas(),loadWildernessArt().then(a=>{
    for(const [key,im] of Object.entries(a.props))images['field_'+key]=im;
  }), ...[...names].map(name=>loadActorPage(images,name))]);
  const leads = [walking.type_BlueSamurai, walking.type_JadeRunner].filter(Boolean);
  await Promise.all(leads.flatMap(slot => [loadActorPage(images, slot[0]), loadCombatArt(images, slot)]));
}

// Preserve the existing mapped rivers, mountain shadows, settlement footprints and coastline.
export function paintWorldSurface(ctx, m, area, images, tile, biomeAt) {
  const patterns = new Map();
  for (const name of materials) {
    const image = images['field_' + name];
    if (image) patterns.set(name, ctx.createPattern(image, 'repeat'));
  }
  ctx.save();
  ctx.translate(-area.x0 * tile, -area.y0 * tile);
  function edge(x, y) {
    let seed = Math.imul(x + 19, 73856093) ^ Math.imul(y + 41, 19349663);
    seed = Math.imul(seed ^ (seed >>> 16), 1597334677);
    return [(x + ((seed & 255) / 255 - .5) * .42) * tile, (y + (((seed >>> 8) & 255) / 255 - .5) * .42) * tile];
  }
  for (let y = area.y0; y < area.y1; y++) for (let x = area.x0; x < area.x1; x++) {
    const ground = m.g[y]?.[x];
    if (ground === 2) continue;
    if (ground===4) {
      ctx.globalAlpha=1;ctx.fillStyle='#568c7c';ctx.fillRect(x*tile,y*tile,tile,tile);
      const seed=(x*257+y*79)>>>0;
      ctx.globalAlpha=.30;ctx.fillStyle='#a8c6ab';
      for(let i=0;i<4;i++)ctx.fillRect((x+((seed+31*i)%79)/80)*tile,(y+((seed+19*i)%89)/90)*tile,tile*.18,tile*.03);
      const shelf=images.field_bank_ledge;
      if(shelf && bridgeHeight(m,(x+.5)*tile,(y+.5)*tile,tile)<.5){
        ctx.globalAlpha=.80;ctx.drawImage(shelf,(x-.05)*tile,(y+.15)*tile,tile*1.1,tile*.6);
      }
      continue;
    }
    const biome = biomeAt(x, y);
    const material = { 1: 'road', 3: 'yard', 4: 'plank', 5: 'slab' }[ground]
      || ({ deep: 'moss', sand: 'sand', snow: 'snow' }[biome] || 'grass');
    const pattern = patterns.get(material);
    if (!pattern) continue;
    ctx.globalAlpha = ground === 0 ? .67 : .87;
    ctx.fillStyle = pattern;
    const straight = ground === 4 || ground === 5 || [m.g[y]?.[x-1],m.g[y]?.[x+1],m.g[y-1]?.[x],m.g[y+1]?.[x]].includes(2);
    if (straight) ctx.fillRect(x * tile, y * tile, tile, tile);
    else {
      ctx.beginPath();
      ctx.moveTo(...edge(x,y)); ctx.lineTo(...edge(x+1,y));
      ctx.lineTo(...edge(x+1,y+1)); ctx.lineTo(...edge(x,y+1)); ctx.closePath(); ctx.fill();
    }
  }
  paintMargins(ctx,m,area,images,tile,biomeAt);
  ctx.restore();
}

export function paintMargins(ctx,m,area,images,tile,biomeAt) {
  ctx.save();
  for(let y=area.y0;y<area.y1;y++)for(let x=area.x0;x<area.x1;x++){
    const ground=m.g[y]?.[x];
    if(ground!==0 && ground!==1)continue;
    for(const [dx,dy,turn] of [[0,1,0],[1,0,-1],[0,-1,2],[-1,0,1]]){
      const next=m.g[y+dy]?.[x+dx];
      if(next!==2 && (ground!==0 || ![1,3,5].includes(next)))continue;
      const seed=((x+31)*73856093^(y+67)*19349663^(dx+3*dy)*83492791)>>>0;
      if(seed%7<(next===2?2:4))continue;
      const biome=biomeAt?biomeAt(x,y):m.biome;
      const name=next===2 ? margins[seed%2] : biome==='snow'?'trail_frost':
        next===3||next===5?'trail_paving':seed%3?'trail_dry':'trail_fern';
      const im=images['field_'+name];if(!im)continue;
      const w=tile*(.78+(seed%49)/100), h=Math.min(tile*.52,w*im.height/im.width);
      ctx.save();ctx.translate((x+.5+dx*.47)*tile,(y+.5+dy*.47)*tile);
      ctx.rotate(turn*Math.PI/2);if(seed&64)ctx.scale(-1,1);
      ctx.globalAlpha=next===2?.89:.77;ctx.drawImage(im,-w/2,-h*.76,w,h);ctx.restore();
    }
  }
  ctx.restore();
}

export function drawCourt(ctx, court, cell) {
  const { x, y, radius, motif } = court;
  ctx.save();
  ctx.translate(x * cell, y * cell);
  ctx.scale(cell, cell);
  ctx.lineWidth = .075;
  ctx.strokeStyle = 'rgba(191,174,138,.46)';
  for (const k of [1, .92, .57]) {
    ctx.beginPath(); ctx.arc(0, 0, radius * k, 0, Math.PI * 2); ctx.stroke();
  }
  const count = motif === 'plum' ? 5 : 8;
  for (let i = 0; i < count; i++) {
    ctx.rotate(Math.PI * 2 / count);
    ctx.beginPath();
    if (motif === 'plum') ctx.ellipse(0, -radius * .29, radius * .19, radius * .25, 0, 0, Math.PI * 2);
    else { ctx.moveTo(-radius * .15, -radius * .71); ctx.lineTo(radius * .15, -radius * .71); }
    ctx.stroke();
  }
  if(court.crest && motif!=='plum'){
    ctx.fillStyle='rgba(110,91,63,.42)';ctx.font='bold '+(radius*.58)+'px serif';
    ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(court.crest,0,0);
  }
  ctx.restore();
}
