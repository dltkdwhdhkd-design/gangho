const materials = 'grass moss road yard slab plank sand snow cedar roof plaster crag'.split(' ');
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
export async function loadFieldArt(images) {
  const names = new Set([...materials, ...Object.values(scenery).map(a => a[0]), 'fir']);
  const [manifest, motions] = await Promise.all(['walk','motions'].map(name => fetch('assets/hd2d/field/'+name+'.json')));
  if (motions.ok) { combatLayout=await motions.json(); names.add('weapons'); }
  if (manifest.ok) {
    Object.assign(walking, await manifest.json());
    for (const [page] of Object.values(walking)) {
      names.add(page);
      if (combatLayout) names.add(page.replace('walk','combat'));
    }
  }
  await Promise.all([...names].map(name => new Promise(resolve => {
    const image = new Image();
    image.onload = () => { images['field_' + name] = image; resolve(); };
    image.onerror = resolve;
    image.src = 'assets/hd2d/field/' + name + '.webp';
  })));
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
  ctx.restore();
}
