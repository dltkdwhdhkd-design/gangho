// 전투 무대: 전투 테마마다 24×15칸짜리 지도 하나. 새 화면(hd2d.js)이 이 지도를 3D로 세우고 그 위에서 싸움을 그린다
// 전투 좌표와 판정은 그대로다(가로 384, 세로 240 평면도 점). 무대 북쪽과 양옆에만 높은 것을 두고, 남쪽(화면 아래)은 비운다
// 블렌더 무대 모형(tools/blender/stages.py → st_<테마>.glb)을 m.models로 놓는다. 모형이 서면 alt()로 감싼 옛 소품은 빠진다(js/hd2d.js setMap)
import { makeMap } from '../maps.js';

const W = 24, H = 15, CACHE = {};
const ring = (m, fn) => { for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) m.g[y][x] = fn(x, y); };
// 북쪽 담: tx 0..W를 name으로 잇는다(ty는 담 밑동이 무대 위 끝에 닿게)
const backRow = (m, name, ty = -0.4, step = 1) => { for (let x = -3; x < W + 3; x += step) m.put(name, x, ty); };
// 블렌더 무대 모형(m.models)이 서면 빼는 옛 소품: 모형을 못 읽었거나 옛 그림 모드일 때만 보인다
const alt = (m, fn) => { const n0 = m.stamps.length; fn(); for (const s of m.stamps.slice(n0)) s.alt = 1; };
const sides = (m, names, n = 3) => { for (let i = 0; i < n; i++) { m.put(names[i % names.length], -2.6, 2 + i * 4); m.put(names[(i + 1) % names.length], W + .4, 1 + i * 4); } };

const BUILD = {
  yard: m => { m.biome = 'sand'; ring(m, (x, y) => (x > 1 && x < W - 2 && y > 1 && y < H - 2) ? 1 : 0); alt(m, () => { m.put('inn', 8, -2.6); backRow(m, 'wall_h', -.6); m.put('jar', 2, .6).put('jar', 3, .7).put('pot', 20, .8); }); m.put('stump', 21, 12.5); m.models = [{ key: 'st_yard' }]; sides(m, ['t_willow', 'plum']); },
  village: m => { m.biome = 'grass'; ring(m, (x, y) => (y > 3 && y < H - 4) ? 1 : 0); alt(m, () => { m.put('hut_b', 3, -2.5).put('straw', 15, -1.6); backRow(m, 'fence_h', .2); m.put('v_cart', 11, .6); }); m.put('bush1', 9, 1).put('bush1', 21, 1.2); m.models = [{ key: 'st_village' }]; sides(m, ['tree_round', 't_willow']); },
  forest: m => { m.biome = 'deep'; ring(m, (x, y) => (Math.abs(x - 12) < 8 && Math.abs(y - 7) < 5) ? 1 : 0); m.put('grove_pine', -1, -2.6).put('grove_pine', 7, -2.8).put('grove_pine', 15, -2.6).put('t_pine', 21, -2.4); alt(m, () => m.put('stump', 4, 1)); m.put('bush1', 18, 1); m.models = [{ key: 'st_forest' }]; sides(m, ['t_pine', 'grove_pine', 'tree_round']); },
  fort: m => { m.biome = 'dusk'; ring(m, (x, y) => (x > 0 && x < W - 1 && y > 1 && y < H - 1) ? 1 : 0); alt(m, () => { backRow(m, 'wood_h', -.4); m.put('hut_b', 15, -3.2).put('banner2', 5, -1).put('banner2', 9, -1); }); m.put('stump', 2, 1); m.models = [{ key: 'st_fort' }]; sides(m, ['t_pine', 'tree_dead']); },
  court: m => { m.biome = 'grass'; ring(m, (x, y) => (x > 2 && x < W - 3 && y > 2 && y < H - 3) ? 3 : 0); alt(m, () => { m.put('hall', 10, -6.2); backRow(m, 'wall_h', -.6); m.put('v_stonelamp', 7, .2).put('v_stonelamp', 17, .2).put('banner3', 4, -.9).put('banner3', 19, -.9); }); m.models = [{ key: 'st_court' }]; sides(m, ['plum', 't_pine']); },
  ring: m => { m.biome = 'sand'; ring(m, (x, y) => (x > 1 && x < W - 2 && y > 1 && y < H - 2) ? 5 : 3); alt(m, () => { m.put('lodge', 9, -4.2); backRow(m, 'wall_h', -.6); for (let x = 1; x < W; x += 3) m.put(['banner1', 'banner2', 'banner3'][x % 3], x, -1); }); m.models = [{ key: 'st_ring' }]; sides(m, ['tree_round', 'plum']); },
  dock: m => { m.biome = 'grass'; ring(m, (x, y) => (y < 3 || y > H - 3) ? 2 : 4); alt(m, () => m.put('house_red', 15, -4.6).put('v_cart', 4, -1.4)); m.models = [{ key: 'st_dock' }]; sides(m, ['t_willow', 'tree_round']); },
  room: m => { m.biome = 'plain'; ring(m, () => 3); alt(m, () => { m.put('house_red', 2, -3.2).put('inn', 9, -3.2).put('house_red', 17, -3.2); }); m.put('jar', 1, 1).put('pot', 22, 1); m.models = [{ key: 'st_room' }]; },
  moon: m => { m.biome = 'dusk'; ring(m, (x, y) => (Math.abs(x - 12) < 9 && Math.abs(y - 7) < 6) ? 1 : 0); for (let x = -2; x < W + 2; x += 2.2) m.put('tree_dead', x, -1.6); alt(m, () => m.put('p_stonewall', 6, .3).put('p_stonewall', 15, .4)); m.models = [{ key: 'st_moon' }]; sides(m, ['tree_dead']); },
  sand: m => { m.biome = 'sand'; ring(m, (x, y) => (Math.abs(x - 12) < 9 && Math.abs(y - 7) < 5) ? 1 : 0); for (let x = -2; x < W + 2; x += 2.6) m.put('tree_dead', x, -1.6); alt(m, () => m.put('p_stonewall', 9, .3)); m.models = [{ key: 'st_sand' }]; sides(m, ['tree_dead']); },
  snow: m => { m.biome = 'snow'; ring(m, () => 0); for (let x = -2; x < W + 2; x += 2) m.put('tree_snow', x, -1.6); m.models = [{ key: 'st_snow' }]; sides(m, ['tree_snow']); },
};
export function stageOf(theme) {
  const k = BUILD[theme] ? theme : 'village'; if (CACHE[k]) return CACHE[k];
  const m = makeMap('st_' + k, W, H, { name: '싸움터', arena: k, stage: true });
  BUILD[k](m); m.render(); return (CACHE[k] = m);
}
