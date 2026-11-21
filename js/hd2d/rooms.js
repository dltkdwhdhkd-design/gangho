// 새 화면의 방. 벽은 블렌더 조각(rw_*.glb: art-src/blender/gangho_m1.py. docs/chatgpt-blender.md)을
// 방 크기와 종류만 보고 세운다. 그래서 방마다 모형을 따로 굽지 않고, 고을과 문파의 모든 방이 새 화면으로 뜬다. 바닥과 가구는 2D 그대로 깔고 세운다.
// 약속: 북쪽 벽의 앞면은 0번 줄 아래 끝(평면도 y = 16), 옆벽의 앞면은 가장자리에서 6 들어온 곳(2D의 막힘이 10이라 사람이 벽에 박히지 않는다).
// 남쪽(카메라 쪽)은 세우지 않고 문지방 돌만 놓는다. 좌표는 평면도 점(x 오른쪽, y 아래가 남쪽), z는 바닥에서의 높이.
const TS = 16;  // 한 칸(js/core.js의 TS와 같다)
export const OWN = new Set(['cliffcave']);  // 제 모형을 그대로 쓰는 방(동굴: tools/blender/rooms.py → rm_cliffcave.glb)
export function roomModels(m) { if (m.room && OWN.has(m.id) && !m.models) m.models = [{ key: 'rm_' + m.id, y: 16 }]; }

// 벽의 종류(js/hd2d/palette.js WALLS): 방 종류마다 벽의 겉이 다르다. 지도에 m.wall을 적으면 그것을 쓴다
const KIND = { hall: 'hall', lib: 'hall', temple: 'hall', gov: 'hall', elder: 'plaster', inn: 'plaster', shop: 'plaster', book: 'plaster', clinic: 'plaster', home: 'plaster', dorm: 'plank', mess: 'plank', gamble: 'plank', armory: 'brick' };
const BYID = { inn: 'plaster', inn2: 'plaster', clinic: 'plaster', shop: 'plaster', shop2: 'plaster', myhouse: 'plaster', smith: 'brick', hall_in: 'hall', hall2: 'hall', library: 'hall', sutra: 'hall', bokun: 'hall', well: 'dark', shrine: 'dark' };
export const wallKind = m => m.wall || BYID[m.id] || (m.roomStyle === 1 ? 'dark' : KIND[m.roomKind]) || 'plaster';
// 방 바닥(받은 그림 FL1 → assets/hd2d/preview/fl_*.webp): 방 종류마다 다르게 깐다. 지도에 m.floor를 적으면 그것을 쓴다
//   fl_scale 비늘 돌바닥(본전, 사당) / fl_dark 짙은 마루(객잔, 식당, 가게) / fl_pine 빛바랜 소나무 마루(숙소, 살림집) / fl_brick 잿빛 전돌(서고, 약방) / fl_slab 짙은 판석(관아, 대장간, 밀실) / fl_mat 돗자리(초가)
const FLOOR = { hall: 'fl_scale', temple: 'fl_scale', gov: 'fl_slab', lib: 'fl_brick', book: 'fl_brick', clinic: 'fl_brick', armory: 'fl_slab', inn: 'fl_dark', mess: 'fl_dark', gamble: 'fl_dark', shop: 'fl_dark', elder: 'fl_dark', dorm: 'fl_pine', home: 'fl_pine' };
const FLOORID = { hall_in: 'fl_scale', hall2: 'fl_scale', bokun: 'fl_scale', inn: 'fl_dark', inn2: 'fl_dark', shop: 'fl_dark', shop2: 'fl_dark', clinic: 'fl_brick', library: 'fl_brick', sutra: 'fl_brick', smith: 'fl_slab', well: 'fl_slab', shrine: 'fl_slab', myhouse: 'fl_pine' };
export const floorOf = m => m.floor || FLOORID[m.id] || (wallKind(m) === 'earth' ? 'fl_mat' : FLOOR[m.roomKind]) || (m.roomStyle === 1 ? 'fl_slab' : 'fl_pine');
export const FLOORS = ['fl_scale', 'fl_dark', 'fl_pine', 'fl_brick', 'fl_mat', 'fl_slab'];
const WIN = { plaster: 3, hall: 3, plank: 2, earth: 1, brick: 0, dark: 0 };  // 기둥 사이 한 칸에 낼 수 있는 창의 수(벽돌과 돌 방에는 창이 없다)
// 뒷벽 가운데에 둥근 문양판을 거는 방: 문파의 본전
export const hasEmblem = m => m.emblem !== undefined ? !!m.emblem : m.roomKind === 'hall' || m.id === 'hall_in';
// 문양판에 얹는 글자: 지도에 m.emblem을 적으면 그 글자, 아니면 문파마다 한 글자(만들어지는 방 r_<곳>_hall은 <곳>으로 찾는다). 모르는 곳은 武
const GLYPH = { hall_in: '雲', changun: '雲', shaolin: '禪', hwasan: '華', wudang: '武', jongnam: '終', emei: '峨', gonryun: '崑', gongdong: '崆', jeomchang: '蒼', cheongseong: '靑', gaebang: '丐', namgung: '南', moyong: '慕', jegal: '諸', dang: '唐', paeng: '彭',
  janggang: '江', haomun: '下', odok: '毒', hyeoleui: '血', cheonma: '魔', haenam: '海', cheonsan: '天', jeonjin: '眞', mosan: '茅', jangbaek: '白', pota: '普', hwangbo: '皇', ak: '岳', yang: '楊', eon: '彦', jin: '陳', bukhae: '氷', noeum: '雷', podalra: '布' };
export const emblemOf = m => !hasEmblem(m) ? '' : typeof m.emblem === 'string' ? m.emblem : GLYPH[m.id] || GLYPH[(/^r_([a-z]+)_/.exec(m.id) || [])[1]] || '武';
export const WALL_K = .9;    // 벽 조각을 세울 때의 높이 배율. 조각은 높이 60(용마루 64)으로 만들고, 게임이 0.9배로 세워 용마루까지가 사람 키의 2.7배가 되게 한다(기준 그림에서 잰 값)
export const WALL_TOP = 60;  // 세운 벽의 꼭대기(용마루 64 × 0.9)에 조금 더한 높이. 카메라가 이 높이까지 화면에 담는다

import { silkBay } from './room-silks.js';
export function roomWalls(m) {
  const W = m.w * TS, H = m.h * TS, kind = wallKind(m), P = [], XW = 6, yS = H - 8, inner = W - 2 * XW, face = hasEmblem(m);
  const add = (key, x, y, o) => P.push({ key, x, y, z: 0, rot: 0, sx: 1, ...o });
  // 북쪽 벽: 칸마다 한 조각
  for (let i = 0; i < m.w; i++) add('rw_wall', 8 + i * TS, TS);
  // 옆벽: 앞면이 방 안을 보게 돌려 세운다(서쪽 벽은 1, 동쪽 벽은 3 = 90°씩). 북쪽 벽에서 남쪽 끝까지를 고르게 나눈다
  const n = Math.max(1, Math.round((yS - TS) / TS)), L = (yS - TS) / n;
  for (let j = 0; j < n; j++) { const y = TS + L * (j + .5); add('rw_wall', XW, y, { rot: 1, sx: L / TS }); add('rw_wall', W - XW, y, { rot: 3, sx: L / TS }); }
  // 모서리와 벽 끝의 굵은 기둥
  for (const x of [XW - 2.5, W - XW + 2.5]) { add('rw_pillar', x, TS - 2.5); add('rw_pillar', x, yS + 3); }
  // 북쪽 벽의 사이기둥: 서너 칸마다, 칸의 경계에. 문양판을 거는 방은 가운데가 기둥이 아니라 칸이 되게 홀수로 나눈다
  let nb = Math.max(2, Math.round(inner / 56)); if (face && nb % 2 === 0) nb++;
  const posts = []; for (let k = 1; k < nb; k++) posts.push(TS * Math.round((XW + inner * k / nb) / TS));
  for (const x of posts) add('rw_post', x, TS);
  // 창: 기둥 사이 칸마다 한 칸(16) 간격으로 줄지어. 창턱 높이 17. 문양판이 걸리는 가운데 칸은 비운다
  const edges = [XW + 2, ...posts, W - XW - 2];
  if (WIN[kind]) for (let k = 0; k < edges.length - 1; k++) { const c = (edges[k] + edges[k + 1]) / 2, wide = edges[k + 1] - edges[k];
    if (face && Math.abs(c - W / 2) < 8) continue;
    if(silkBay(m,k,edges.length-1)){add('silk',c,TS+2,{z:17});continue;}
    const cnt = Math.max(1, Math.min(WIN[kind], Math.floor((wide - 6) / TS))); for (let q = 0; q < cnt; q++) add('rw_window', c + TS * (q - (cnt - 1) / 2), TS, { z: 17 }); }
  if (face) add('rw_emblem', W / 2, TS, { z: 20 });
  // 옆벽: 세 조각마다 사이기둥, 그 사이에 창 하나
  for (let j = 1; j < n; j++) if (j % 3 === 0) { add('rw_post', XW, TS + L * j, { rot: 1 }); add('rw_post', W - XW, TS + L * j, { rot: 3 }); }
  if (WIN[kind] >= 2) for (let j = 1; j < n; j += 3) { const y = TS + L * (j + .5); add('rw_window', XW, y, { rot: 1, z: 17 }); add('rw_window', W - XW, y, { rot: 3, z: 17 }); }
  // 남쪽 가장자리의 문지방 돌
  const ns = Math.max(1, Math.round(inner / TS)); for (let i = 0; i < ns; i++) add('rw_sill', XW + inner * (i + .5) / ns, H - 5, { sx: inner / ns / TS });
  return { kind, parts: P };
}

// 소품 그림 → 블렌더 조각(docs/chatgpt-blender.md의 M2 이후). 조각 파일이 들어와 있을 때만(assets/hd2d/models/kit.json. tools/blender/gpt.py --install이 적는다)
// 그림 대신 조각을 세운다. 그래서 받기 전에는 아무것도 바뀌지 않고, 받아 넣으면 바로 선다. 넣은 뒤에는 화면에서 보고 어울리지 않는 줄은 뺀다.
// 조각은 사람 키 15점 기준이라 사람과 같은 배율로 키우고(방 안 1.45배), 가로는 그림의 막힘 폭에 맞춘다(js/hd2d.js furniture).
//   rot: 90°씩 돌려 놓기 / keep: 가로를 맞추지 않고 제 모양대로(의자, 걸상, 차 탁자처럼 늘이면 티가 나는 것)
// altar, chair, teatable, seat는 조각을 세우려고 새로 붙인 이름이다(js/tiles.js). 장문인 자리(f_chair)는 그림이 넓은 옥좌라 그대로 둔다
export const FURN = {
  longtable: { key: 'fn_table' }, altar: { key: 'fn_altar' }, counter: { key: 'fn_counter' }, bench: { key: 'fn_bench' }, seat: { key: 'fn_bench' },
  teatable: { key: 'fn_teatable', keep: 1 }, chair: { key: 'fn_chair', keep: 1 }, stool: { key: 'fn_stool', keep: 1 }, f_stool: { key: 'fn_stool', keep: 1 },
  bed: { key: 'fn_bed' }, f_bed: { key: 'fn_bed', rot: 1 },
  bookcase: { key: 'fn_bookcase' }, drawer: { key: 'fn_drawers' }, shelf: { key: 'fn_shelf' }, shelf2: { key: 'fn_shelf' }, screen: { key: 'fn_screen' },
  rack: { key: 'fn_rack' }, rack2: { key: 'fn_rack' }, chest: { key: 'fn_chest' }, f_dummy: { key: 'fn_dummy' }, f_stove: { key: 'fn_stove' },
};
