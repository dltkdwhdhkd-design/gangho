import { TS } from './core.js';
import { STAMPS } from './tiles.js';

// Coordinates in these layouts mark the foot of the object, in the same tiles as story destinations.
function place(map, name, x, y, scale = 1) {
  const spec = STAMPS[name], unit = TS * map.k;
  map.put(name, x - spec[3] * scale / (2 * unit), y - spec[4] * scale / unit, { sc: scale });
}

function placeAll(map, objects) {
  for (const object of objects) place(map, ...object);
}

function verge(map, species, beds) {
  const offsets = [[0, 0, 1], [-.61, .24, .69], [.77, -.14, .82], [.26, .54, .63], [-.42, -.57, .74]];
  for (const [i, [x, y, size, count]] of beds.entries()) {
    const angle = i * 2.4, c = Math.cos(angle), s = Math.sin(angle);
    for (const [j, [dx, dy, sc]] of offsets.slice(0, count).entries()) {
      const u = x + (dx * c - dy * s) * size, v = y + (dx * s + dy * c) * size;
      if (map.g[Math.floor(v * map.k)]?.[Math.floor(u * map.k)] !== 0) continue;
      if (map.blocked(u * map.k * TS, v * map.k * TS, 4, 3)) continue;
      place(map, species[(i + j) % species.length], u, v, sc * size);
    }
  }
}

function travelBoard(map, x, y) {
  map.roadside = { signX: x, signY: y };
  place(map, 'v_signboard', x, y, .74);
}

const villageFixtures = {
  notice: ['signpost', 24.65, 14.45, .84],
  direction: ['signpost', 43.3, 14.15, .68],
  practice: ['v_dummy', 26.85, 13.3, .76]
};
export function fixtureSpot(key) {
  const [, x, y] = villageFixtures[key];
  return { x: x - .7, y: y - .35, w: 1.4, h: 1.5 };
}

export function dressCheongha(map) {
  // Behind the northern roofs, the orchard breaks at the path into the bamboo hills.
  placeAll(map, [
    ['tree_pine', 2.7, 4.2, .80], ['tree_big', 5.1, 7.2, .82], ['plum_w', 8.1, 5.4, .79],
    ['tree_pine', 10.3, 2.9, .74], ['plum', 14.1, 4.8, .84], ['plum_w', 17.5, 6.5, .64],
    ['tree_round', 19.2, 3.2, .71], ['plum_o', 27.7, 4.1, .85], ['plum', 32.0, 6.7, .71],
    ['tree_pine', 34.5, 3.0, .81], ['tree_big', 38.1, 5.3, .93], ['plum_w', 42.4, 3.7, .67],
    ['tree_round', 44.2, 7.4, .75], ['tree_pine', 45.2, 11.2, .76], ['plum', 43.85, 21.4, .62],
    ['tree_big', 2.2, 10.8, .77], ['plum_w', 2.1, 21.4, .64],
    ['plum_g', 3.4, 26.3, .83], ['plum_g', 43.0, 26.7, .77],
  ]);

  // The forge, inn, communal well and landing each have their own working space.
  placeAll(map, [
    ['v_wood', 6.0, 13.6, .92], ['stump', 4.1, 13.35, .55],
    ['banner4', 18.8, 11.65, .82], ['v_lamppost', 24.95, 12.25, .85],
    ['v_jars', 25.65, 10.9, .73], ['v_well', 20.8, 21.3, .83],
    ['pot', 36.9, 13.8, .77], ['v_laundry', 11.9, 20.6, .70],
    ['v_cart', 16.4, 26.65, .90], ['p_sacks', 14.35, 26.15, .76],
    ['v_crates', 30.6, 26.5, .83], ['p_barrels', 32.5, 26.8, .75],
    ['v_lamppost', 27.65, 26.35, .73],
    ['p_lanterns', 4.8, 14.0, .66], ['v_lamppost', 41.8, 13.8, .72],
    ['v_jars', 7.1, 21.2, .63], ['p_sacks', 39.8, 21.6, .60],
    ['v_lamppost', 18.1, 11.15, .64], ['v_crates', 15.8, 10.45, .50],
    ['pot', 15.2, 10.7, .60], ['fern1', 24.9, 9.45, .73],
    ['v_wood', 29.9, 9.6, .60], ['p_barrels', 4.7, 25.7, .64],
  ]);
  placeAll(map, Object.values(villageFixtures));
  travelBoard(map, 20.05, 25.8);
  verge(map, ['fern1', 'bush4', 'flower4'], [
    [5.6, 8.2, .95, 4], [13.5, 5.7, .84, 3], [18.1, 6.9, .97, 4],
    [30.35, 13.1, .87, 5], [36.9, 13.0, .74, 3], [42.5, 8.8, .91, 4],
    [11.6, 19.2, .84, 3], [19.9, 20.0, .67, 3], [35.3, 18.7, .70, 3],
  ]);
  verge(map, ['g_reeds', 'bush2', 'g_fern'], [
    [2.5, 27.6, .92, 4], [5.4, 27.7, 1.03, 5], [9.8, 27.3, .83, 3],
    [35.6, 27.55, .91, 5], [38.4, 27.8, .81, 3], [43.1, 27.9, .95, 5],
  ]);
}

const bambooGroves = [
  [3.6, 4.0], [7.0, 2.7], [13.6, 3.8], [20.0, 2.6], [34.2, 3.5],
  [3.6, 9.8], [15.1, 10.9], [22.6, 11.5], [33.5, 11.1],
  [4.9, 17.2], [7.2, 21.8], [15.5, 20.8], [23.2, 21.5], [35.3, 19.9],
  [3.2, 29.0], [10.9, 27.4], [12.7, 31.3], [23.9, 31.1], [34.7, 28.8],
];
const bambooGathering = [[6, 12], [26, 12], [20, 21], [14, 12], [34, 22]];
export function dressBamboo(map) {
  const stems = [[0, 0, 1.06], [-1.4, .45, .84], [1.2, 1.45, .73], [.75, -1.6, .94], [-2.1, -1.2, .70]];
  for (const [i, [cx, cy]] of bambooGroves.entries()) {
    const angle = i * 2.4, c = Math.cos(angle), s = Math.sin(angle);
    for (const [dx, dy, sc] of stems.slice(0, 3 + i % 3)) {
      const x = cx + dx * c - dy * s, y = cy + dx * s + dy * c;
      // The south-facing camera projects the crown onto ground north of the roots.
      let clear = true;
      for (let v = Math.floor(y - 3.1 * sc); v <= Math.floor(y + .45); v++) {
        for (let u = Math.floor(x - 1.3 * sc); u <= Math.floor(x + 1.3 * sc); u++) {
          if (map.g[v]?.[u] !== 0) clear = false;
        }
      }
      if (clear && !bambooGathering.some(([u, v]) => Math.abs(u-x) < 1.35 && v > y-3.1 && v < y+.85)) {
        place(map, 'bamboo', x, y, sc);
      }
    }
  }
  placeAll(map, [['stump', 22.15, 8.9, .62], ['stump_o', 32.6, 6.5, .55]]);
  travelBoard(map, 15.65, 29.55);
  verge(map, ['fern1', 'bush4', 'fern2'], [
    [13.2, 28.4, 1.02, 5], [21.1, 30.0, .76, 3], [25.0, 23.2, 1, 5],
    [34.2, 16.4, .83, 3], [6.8, 17.9, .94, 4], [15.0, 11.8, .88, 4], [32.5, 9.5, .80, 3],
  ]);
}

export function dressValley(map) {
  placeAll(map, [
    ['tree_pine', 2.8, 5.2, .93], ['tree_big', 5.2, 4.65, .70], ['tree_pine', 7.7, 6.4, .79],
    ['tree_round', 12.65, 5.5, .85], ['tree_pine', 14.9, 3.4, 1.02], ['plum_g', 17.1, 7.6, .82],
    ['plum_g', 22.95, 4.6, .91], ['tree_big', 26.1, 3.7, .78], ['tree_pine', 30.4, 8.9, .93],
    ['tree_pine', 33.0, 10.4, .73], ['tree_big', 37.5, 4.5, .93],
    ['plum_w', 5.8, 21.8, .83], ['tree_round', 8.35, 25.8, .74], ['plum_g', 17.3, 24.1, .90],
    ['plum_g', 22.8, 24.5, .75], ['tree_pine', 28.8, 25.0, .92], ['tree_pine', 31.4, 26.8, .78],
    ['tree_big', 36.05, 22.9, .94], ['boulder', 23.3, 9.4, .71], ['boulder', 15.2, 25.8, .68],
  ]);
  travelBoard(map, 35.6, 12.75);
  verge(map, ['g_reeds', 'fern1', 'bush2'], [
    [17.95, 5.1, .92, 5], [22.2, 8.1, .83, 4], [17.8, 19.5, .96, 4],
    [22.35, 23.2, 1.04, 5], [4.6, 5.8, .87, 4], [30.8, 10.2, .91, 4], [34.7, 24.1, .89, 4],
  ]);
}

export function dressEastPass(map) {
  travelBoard(map, 5.8, 14.9);
  verge(map, ['fern2', 'bush2', 'bush4'], [
    [6.5, 10.5, .76, 3], [13.1, 8.8, .89, 3], [22.65, 3.3, .75, 3],
    [29.1, 9.25, .82, 3], [34.4, 16.0, .77, 4], [12.9, 21.8, .75, 3],
  ]);
}

export function cheonghaOnWorldMap(map, x, y) {
  // A tree behind the inn and a small freight yard identify the river settlement from the road.
  const pieces = [
    ['inn', -.65, -4.6], ['hut_b', -5.9, -3.6], ['hut_o', 4.75, -4.1],
    ['hut_o2', -4.5, -.1], ['shop_green', 4.0, -.36],
    ['tree_round', -7.7, -5.65, .82], ['plum', 2.2, -6.85, .76], ['plum_g', 7.7, -2.2, .81],
    ['v_cart', -7.0, -.65, .85], ['v_crates', -7.65, -1.75, .70],
  ];
  for (const [name, dx, dy, sc] of pieces) place(map, name, x+dx, y+dy, sc);
}

// A saved day always has the same weather around the ferry.
export function ferryRain(map,s) {
  return map?.id==='cheongha' && [2,5,8].includes((s?.day || 1)%10);
}
export function drawFerryRain(c,w,h,t) {
  c.save();
  c.fillStyle='rgba(56,74,91,.12)';c.fillRect(0,0,w,h);
  c.strokeStyle='rgba(184,204,215,.45)';c.lineWidth=Math.max(.6,w/1100);
  const count=Math.ceil(w*.47);
  c.beginPath();
  for (let i=0;i<count;i++) {
    const speed=210+(i%7)*15, y=(i*179.3+t*speed)%(h+12)-10;
    const x=((i*113.7-y*.17)%(w+12)+w+12)%(w+12)-4;
    c.moveTo(x,y);c.lineTo(x-1.4,y+6+i%4);
  }
  c.stroke();c.restore();
}
