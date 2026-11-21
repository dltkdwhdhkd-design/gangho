// Eight held cels from a single standing pose. Facing is independent of the walking cycle.
const cels = 8;
const lift = [0, 1, 2, 2, 2, 1, 1, 0];
const follow = [0, 0, 1, 2, 2, 2, 1, 0];
const atlasKeys = new WeakMap();
const recent = new Map();
const clamp = a => Math.max(0, Math.min(1, a));
const seeds = new Map();

export function standing(n) {
  if (n.pose != null || n.hopT > 0 || n.path?.length || n.moving || n.fight) return false;
  return ('vx' in n || 'vy' in n) ? !(n.vx || n.vy) : !n.walk;
}

export function idleCel(n, t, identity) {
  const key = identity || [n.id || n.role || n.spr, n.hx ?? '', n.hy ?? '', n.lag ?? ''].join('/');
  let seed = seeds.get(key);
  if (seed === undefined) {
    seed = 2166136261;
    for (const ch of key) seed = Math.imul(seed ^ ch.charCodeAt(0), 16777619) >>> 0;
    seeds.set(key, seed);
  }
  const period = 2.6 + (seed % 77) * .01;
  return Math.floor((t / period + (seed % 113) / 113) * cels) & 7;
}

function drawCels(source, dir) {
  const size = source.width / 4;
  const canvas = document.createElement('canvas');
  canvas.width = size * 4;
  canvas.height = size * 2;
  const ctx = canvas.getContext('2d', {willReadFrequently:true});
  ctx.drawImage(source, dir * size, 0, size, size, 0, 0, size, size);
  const raw = ctx.getImageData(0, 0, size, size);
  const pixels = new Uint32Array(raw.data.buffer);
  const result = ctx.createImageData(canvas.width, canvas.height);
  const ink = new Uint32Array(result.data.buffer);
  let left = size, right = -1, top = size, bottom = -1;
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    if (raw.data[(y * size + x) * 4 + 3] < 24) continue;
    left = Math.min(left,x); right = Math.max(right,x);
    top = Math.min(top,y); bottom = Math.max(bottom,y);
  }
  if (right < left) return canvas;
  const height = Math.max(1,bottom - top), half = Math.max(1,(right-left)/2), center = (right+left)/2;
  const amplitude = Math.min(1.25, Math.max(.52, height / 89));
  for (let cel = 0; cel < cels; cel++) {
    const ox = (cel & 3) * size, oy = (cel >> 2) * size;
    for (let y = Math.max(0,top-3); y <= bottom; y++) {
      const depth = (y-top)/height;
      const torso = clamp((.82-depth)/.45);
      for (let x = Math.max(0,left-2); x <= Math.min(size-1,right+2); x++) {
        const side = (x-center)/half, outer = Math.abs(side);
        const cuff = clamp((outer-.47)*4) * clamp((depth-.38)*11) * clamp((.81-depth)*9);
        const dy = Math.round(amplitude * torso * (lift[cel] * (1-cuff) + follow[cel] * cuff));
        // Only the outer locks above the brow or beyond the cheeks sway sideways.
        const looseHair = clamp((outer-.70)*5) * clamp((.53-depth)*10);
        const locks = Math.round(amplitude * looseHair * (follow[cel]-lift[cel]));
        const sx = x - locks * Math.sign(side), sy = y + dy;
        if (sx >= 0 && sx < size && sy >= 0 && sy < size)
          ink[(oy+y)*canvas.width + ox+x] = pixels[sy*size+sx];
      }
    }
  }
  ctx.putImageData(result,0,0);
  return canvas;
}

export function idleFacing(source, dir) {
  let dirs = atlasKeys.get(source);
  if (!dirs) { dirs = []; atlasKeys.set(source,dirs); }
  let entry = dirs[dir];
  const now = performance.now();
  if (!entry) {
    entry = {canvas:drawCels(source,dir),release:null,dirs,dir};
    dirs[dir] = entry;
  }
  recent.delete(entry); recent.set(entry,now);
  // Keep all visible people. Dispose older, off-screen facings as the player travels.
  if (recent.size > 56) for (const [old, time] of recent) {
    if (recent.size <= 56 || now-time < 1200) break;
    recent.delete(old); old.dirs[old.dir] = null; old.release?.();
  }
  return entry;
}
