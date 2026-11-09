// 문파 본거지와 도시. 처음 들어갈 때 만든다
import { G, Sound, toast, josa, pick } from './core.js';
import { Story, ctx, say, narr, choice } from './ctx.js';
import { WHO } from './dialog.js';
import { MAPS, makeMap } from './maps.js';
import { STAMPS } from './tiles.js';
import { TS } from './core.js';
import { LOOT } from './items.js';
import { learn } from './state.js';
import { LOCS } from './worlddata.js';
import { EXTRA, SURNAME } from './freedata.js';
import { TALK, CITYTALK, HOME, REG, CTX, STALLS, CITYHAWK, TALES, LISTEN, PERFORM, BEGGAR, PATROL, KIDS, ELDERS, DRUNK, GAMBLE, CAPTIVES, SLAVER } from './talkdata.js';
import { WEAPONS } from './data.js';
import { CLANS } from './clandata.js';

const NEW = EXTRA.filter(f => f.hi); NEW.forEach(f => { WHO[f.key] = { name: f.who, face: f.spr }; });
const ST = {
  temple: { mount: 1, hall: 'hall', biome: 'grass', bgm: 'temple', arena: 'court', wall: 'wall_h', trees: ['tree_round', 'grove_green'], side: 'lodge', small: 'hut_o2', deco: ['statue_big', 'plum_w'], folk: ['Monk', 'Monk2'], ban: 'banner3' },
  dao: { mount: 1, biome: 'deep', bgm: 'mystic', arena: 'forest', wall: 'wall_h', trees: ['tree_pine', 'grove_pine'], side: 'lodge', small: 'wood_o', deco: ['plum', 'statue'], folk: ['OldMan', 'BlueNinja', 'Villager'], ban: 'banner5' },
  peak: { mount: 1, biome: 'snow', bgm: 'mystic', arena: 'snow', ambient: 'snow', wall: 'wood_h', trees: ['tree_snow', 'grove_white'], side: 'lodge', small: 'wood_b', deco: ['boulder_w', 'tree_white'], folk: ['Eskimo', 'EskimoNinja'], ban: 'banner5' },
  manor: { big: 'house_red', hall: 'house_red', biome: 'grass', bgm: 'story', arena: 'yard', wall: 'wall_h', trees: ['tree_round', 'plum_o'], side: 'house_red', small: 'shop_green', deco: ['plum', 'pot'], folk: ['Knight', 'Noble', 'Villager4'], ban: 'banner1' },
  water: { big: 'wood_b', hall: 'wood_b', biome: 'sand', bgm: 'road', arena: 'village', wall: 'fence_h', trees: ['tree_dead', 'bush3'], side: 'wood_b', small: 'wood_o', deco: ['jar', 'log'], folk: ['Villager3', 'Villager2'], water: true, ban: 'banner6' },
  fort: { big: 'wood_b', hall: 'wood_b', biome: 'dusk', bgm: 'dungeon', arena: 'fort', wall: 'wood_h', trees: ['tree_dead', 'grove_dead'], side: 'wood_b', small: 'mud', deco: ['boulder_b', 'jar'], folk: ['DarkNinja', 'RedNinja', 'Caveman'], ban: 'banner7' },
  dark: { biome: 'dusk', bgm: 'curse', arena: 'moon', tint: 'rgba(60,8,30,.28)', wall: 'wall_h', trees: ['tree_dead', 'grove_dead'], side: 'lodge', small: 'mud', deco: ['statue_big', 'boulder_b'], folk: ['Skeleton', 'RedNinja2', 'MaskedNinja'], ban: 'banner7' },
  slum: { big: 'straw', hall: 'mud', biome: 'sand', bgm: 'good', arena: 'village', wall: 'fence_h', trees: ['tree_dead', 'bush3'], side: 'straw', small: 'mud', deco: ['jar', 'log'], folk: ['Gaebang', 'Villager2', 'Boy'], ban: 'banner2' },
  ice: { biome: 'snow', bgm: 'mystic', arena: 'snow', ambient: 'snow', tint: 'rgba(120,170,230,.14)', wall: 'wall_h', trees: ['tree_snow', 'boulder_w'], side: 'lodge', small: 'wood_b', deco: ['boulder_w', 'statue'], folk: ['Eskimo', 'Cavegirl'], water: true, ban: 'banner5' },
  west: { mount: 1, big: 'clay', biome: 'sand', bgm: 'temple', arena: 'sand', wall: 'wall_h', trees: ['tree_dead', 'boulder'], side: 'clay', small: 'clay', deco: ['statue_big', 'pot'], folk: ['Monk2', 'Master'], ban: 'banner3' },
};
const CHAT = {
  temple: ['아침 공양 전에 마당부터 쓸어야 합니다.', '사형이 또 졸다가 죽비를 맞았습니다.', '보시는 저쪽 함에 넣으시면 됩니다. 아, 안 하셔도 됩니다. 정말로요.'],
  dao: ['좌공 시간이라 크게 말씀하시면 혼납니다.', '사부님이 약초 캐러 가셨는데 사흘째 안 오십니다.', '단로 불이 꺼지면 제가 죽습니다. 먼저 가 보겠습니다.'],
  peak: ['산문까지 올라오느라 고생하셨습니다. 내려갈 때가 더 힘듭니다.', '여기서는 해가 지면 아무도 밖에 안 나갑니다.', '장작이 곧 무공입니다. 장문인 말씀이에요.'],
  manor: ['가주님 허락 없이는 안채에 못 들어갑니다.', '손님이 많아서 밥이 모자랍니다.', '도련님이 또 담을 넘었습니다. 못 보셨지요?'],
  water: ['이번 달 통행세가 덜 걷혔다고 위에서 난리입니다.', '배 탈 일 있으면 말만 하쇼. 값은 말하기 나름이니까.', '물은 믿어도 뱃사람은 믿지 마쇼. 우리 어른이 한 말이오.'],
  fort: ['눈 깔아. 처음 왔으면 그게 안전해.', '우리 어른 심기가 안 좋아. 볼일만 보고 가.', '구경 왔어? 여기 구경값은 비싸.'],
  dark: ['이곳에 온 까닭을 스스로 알고 계십니까.', '교주님의 눈은 모든 곳에 있습니다.', '두려워하지 마십시오. 처음에는 다들 그럽니다.'],
  slum: ['엽전 한 닢이면 소문 하나 드립니다.', '여기선 물건 잃어버리면 찾지 마쇼. 다시 사쇼.', '오늘은 밥을 얻었으니 나는 쉬는 날이오.'],
  ice: ['호수 얼음이 두꺼워서 말을 타고 건넙니다.', '중원 사람은 오랜만에 봅니다. 다들 중간에 돌아가거든요.', '궁주님 앞에서는 춥다는 말을 하지 마십시오.'],
  west: ['숨을 천천히 쉬십시오. 처음에는 다들 어지러워합니다.', '여기까지 오셨으니 차 한 잔은 드시고 가십시오.', '소림 얘기는 어른들 앞에서 꺼내지 마십시오.'],
  town: ['요즘 관아가 칼 찬 사람들을 눈여겨본다더군.', '비단값이 또 올랐어. 서쪽 길이 막혔다나.', '여기 국수는 맛없어. 그래도 다들 먹어.', '칼 차고 다니는 사람은 외상을 안 줘.'],
};
function fold(s) { let n = 7; for (const c of s) n = (n * 31 + c.charCodeAt(0)) % 233280; return () => (n = (n * 9301 + 49297) % 233280) / 233280; }
// 세력마다 건물 이름과 풍경이 다르다: [본전, 연무장, 서고, 장로 거처, 덧붙임]
const FEAT = {
  hwasan: ['연화전', '낙안봉 연무장', '자하각', '장로원', { biome: 'rose', trees: ['plum', 'tree_pink', 'rocks'], ambient: 'leafpink', deco: ['plum', 'tree_pink'], mount: 1 }], wudang: ['자소궁', '태극 마당', '장경각', '장로원', { mount: 1 }], jongnam: ['중양궁', '종남 연무장', '장경각', '장로원', { mount: 1 }], emei: ['금정대전', '보현 마당', '장경각', '사태원', { mount: 1 }], gonryun: ['옥허전', '설봉 연무장', '장경각', '장로원', { mount: 1 }], gongdong: ['칠상전', '공동 연무장', '비급각', '장로원', { mount: 1 }], jeomchang: ['사일전', '점창 연무장', '장경각', '장로원', { mount: 1 }], cheongseong: ['상청궁', '청성 마당', '장경각', '장로원', { mount: 1 }], gaebang: ['총타 대청', '타구 마당', '소문방', '장로 오두막', {}],
  namgung: ['창궁전', '남궁 연무장', '서고', '원로원', {}], moyong: ['참합장', '연자오 마당', '환시수각', '원로원', {}], jegal: ['팔괘전', '구궁 마당', '장서루', '원로원', {}], dang: ['만독전', '암기 훈련장', '독경각', '원로원', { deco: ['fern1', 'jar'] }], paeng: ['오호전', '오호 연무장', '서고', '원로원', {}],
  janggang: ['취의청', '수련장', '장부방', '두령 거처', {}], haomun: ['금전방', '뒷마당', '정보방', '어른 방', {}], odok: ['오독전', '독충 마당', '독경방', '장로 굴', {}], hyeoleui: ['혈의청', '암살 훈련장', '장부방', '장로 방', {}], cheonma: ['천마전', '혈우 광장', '마경각', '장로원', { mount: 1 }],
  haenam: ['해조전', '파도 마당', '장경각', '장로원', {}], cheonsan: ['표묘궁', '천산 마당', '장경각', '장로원', { mount: 1 }], jeonjin: ['전진궁', '북두 마당', '장경각', '장로원', { mount: 1 }], mosan: ['구소궁', '오뢰 마당', '부적방', '장로원', { mount: 1 }], jangbaek: ['천지전', '백호 마당', '장경각', '장로원', { mount: 1 }], pota: ['자죽전', '조음 마당', '장경각', '사태원', {}],
  hwangbo: ['천왕전', '권법 연무장', '서고', '원로원', {}], ak: ['정충전', '창술 연무장', '서고', '원로원', {}], yang: ['천파전', '창술 연무장', '서고', '원로원', {}], eon: ['패왕전', '권법 마당', '서고', '원로원', {}], jin: ['철선 무관', '권법 마당', '서고', '원로원', {}], bukhae: ['빙백궁', '빙호 광장', '장경각', '장로원', {}], noeum: ['대웅보전', '범음 마당', '장경각', '장로원', { mount: 1 }], podalra: ['금강전', '법왕 광장', '경전고', '장로원', { mount: 1 }],
};
const ROOMS = {}; // 방 id → { back, bx, by, kind, name, owner }
const SW = id => STAMPS[id][3] / TS, SH = id => STAMPS[id][4] / TS;
const ROOM = { hall: [22, 14, 9, 13], lib: [18, 12, 7, 11], elder: [18, 12, 7, 11], dorm: [18, 12, 7, 11], mess: [18, 12, 7, 11], inn: [18, 12, 7, 11], shop: [16, 11, 6, 10], book: [16, 11, 6, 10], clinic: [14, 10, 5, 9], armory: [14, 10, 5, 9], gov: [20, 13, 8, 12], gamble: [20, 13, 8, 12], home: [14, 10, 5, 9], temple: [16, 11, 6, 10] };
const HOUSES = ['hall', 'lodge', 'house_red', 'inn', 'hut_o', 'hut_b', 'hut_o2', 'shop_blue', 'shop_green', 'clay', 'wood_o', 'wood_b', 'mud', 'straw'];
function room(m, l, stamp, x, y, kind, name, o) {
  const id = `r_${l.id}_${kind}${o?.n || ''}`, [, , ex, ey] = ROOM[kind]; ROOMS[id] = { back: l.map, bx: x + SW(stamp) / 2, by: y + SH(stamp) + 1, kind, name, owner: l };
  m.house(stamp, x, y, id, ex + 2, ey - .6, 1, { doorDx: 0 }); if (!o?.quiet) m.label(x + SW(stamp) / 2, y - .6, name); return id;
}
function makeRoom(id) {
  if (/^r_\w+_home$/.test(id) && !ROOMS[id]) { const g = id.replace(/_home$/, '_gamble'); makeRoom(g); if (MAPS[g]) MAPS[id] = MAPS[g]; if (ROOMS[g]) ROOMS[id] = ROOMS[g]; return; }  // 예전 저장: 첫 민가 자리에 도박장이 섰다
  const info = ROOMS[id] || (() => { if (id.startsWith('h_')) return null; const o = LOCS.find(q => id.startsWith(`r_${q.id}_`)); if (o) { G.world.ensure(o.map); return ROOMS[id]; } })(); if (!info) { console.warn('없는 방', id); return; }
  const [w, h, ex] = ROOM[info.kind], dark = ['fort', 'dark'].includes(info.owner.style), m = makeMap(id, w, h, { name: `${info.owner.name} ${info.name}`, bgm: info.owner.style === 'temple' ? 'temple' : 'quiet', room: true, roomStyle: dark ? 1 : 0, arena: 'room', tint: dark ? 'rgba(30,8,20,.22)' : undefined });
  const k = info.kind;
  if (k === 'hall') { m.put('tablet', 10, 1).put('f_chair', 10.5, 3).put('lantern', 3, 2).put('lantern', 18, 2).put('lantern', 3, 7).put('lantern', 18, 7).put('longtable', 5, 8).put('longtable', 14, 8).put('rack', 1, 2).put('rack', 19, 2).put('plant', 1, 11).put('plant', 20, 11).put('f_scroll', 6, 1).put('f_scroll', 15, 1); }
  if (k === 'lib') { m.row('bookcase', 1, 1, 4, 4).row('bookcase2', 2, 5, 4, 4).put('scrollcase', 14, 8).put('counter', 2, 8).put('f_lamp', 9, 8); }
  if (k === 'elder') { m.put('tablet2', 8, 1).put('f_scroll', 3, 1).put('f_scroll', 13, 1).put('f_chair', 4, 3).put('f_chair', 13, 3).put('teapot', 8.5, 5).put('longtable', 7, 5).put('f_bonsai', 1, 9).put('f_bonsai', 16, 9); }
  if (k === 'dorm') { m.row('f_bed', 1, 1, 5, 3).row('f_bed', 1, 6, 5, 3).put('chest', 16, 9).put('f_lamp', 1, 10); }
  if (k === 'mess') { m.put('f_stove', 1, 1).put('f_stove', 4, 1).put('jar', 8, 1).put('pot', 10, 1).put('longtable', 3, 5).put('longtable', 10, 5).put('longtable', 3, 8).put('longtable', 10, 8).row('stool', 3, 4, 3, 1).row('stool', 10, 4, 3, 1); }
  if (k === 'inn') { m.put('counter', 1, 2).put('shelf', 5, 1).put('rack', 11, 1).put('longtable', 3, 6).put('longtable', 11, 6).put('longtable', 3, 9).put('longtable', 11, 9).row('stool', 3, 5, 3, 1).row('stool', 11, 5, 3, 1).put('plant', 16, 2); }
  if (k === 'shop') { m.put('shelf', 1, 1).put('shelf2', 4, 1).put('shelf', 8, 1).put('counter', 4, 4).put('box', 1, 7).put('box', 13, 7).put('jar', 13, 2); }
  if (k === 'book') { m.row('bookcase', 1, 1, 3, 4).put('scrollcase', 13, 1).put('counter', 4, 5).put('f_lamp', 1, 8).put('box', 13, 7); }
  if (k === 'clinic') { m.put('shelf2', 1, 1).put('shelf2', 4, 1).put('drawer', 8, 1).put('bed', 9, 5).put('counter', 1, 5).put('jar', 12, 8).put('plant', 1, 8); }
  if (k === 'armory') { m.row('rack', 1, 1, 4, 3).put('box', 1, 7).put('box', 12, 7).put('chest', 11, 5).put('counter', 2, 5); }
  if (k === 'gov') { m.put('f_chair', 9.5, 2).put('longtable', 8, 4).put('tablet', 9, 1).put('f_scroll', 3, 1).put('f_scroll', 16, 1).put('rack', 1, 5).put('rack', 17, 5).put('lantern', 3, 9).put('lantern', 16, 9); }
  if (k === 'gamble') { m.put('counter', 8, 4).put('f_scroll', 5, 1).put('f_scroll', 13, 1).put('shelf', 15, 1).put('jar', 2, 1).put('lantern', 1, 2).put('lantern', 18, 2).put('lantern', 1, 8).put('lantern', 18, 8).put('longtable', 3, 7).put('longtable', 13, 7).put('box', 17, 11).put('plant', 1, 11); }
  if (k === 'temple') { m.put('tablet', 7, 1).put('tablet2', 3, 2).put('tablet2', 12, 2).put('lantern', 1, 4).put('lantern', 14, 4).put('longtable', 6, 5).put('plant', 1, 9).put('plant', 14, 9); }
  if (k === 'home') { const v = [...id].reduce((a, c) => a + c.charCodeAt(0), 0) % 4; if (v === 0) m.put('f_bed', 1, 1).put('chest', 4, 1).put('longtable', 6, 5).row('stool', 6, 4, 3, 1).put('jar', 12, 1).put('f_stove', 10, 1); if (v === 1) m.put('bed', 9, 1).put('drawer', 1, 1).put('shelf', 4, 1).put('longtable', 3, 6).put('plant', 12, 7); if (v === 2) m.put('shelf2', 1, 1).put('box', 5, 1).put('box', 7, 1).put('jar', 10, 1).put('pot', 12, 1).put('counter', 2, 5).put('f_bed', 10, 6); if (v === 3) m.put('f_stove', 1, 1).put('longtable', 5, 5).put('f_bed', 10, 1).put('f_lamp', 8, 1).put('f_bonsai', 1, 7).put('stool', 5, 4).put('stool', 7, 4); }
  m.exit(ex, h - 1, 4, 1, info.back, info.bx, info.by, 0, { door: true }); m.render();
}
// 세력 본거지. 아래가 산문, 위로 갈수록 외문 구역, 연무장, 내문 구역, 본전이다
const YARD = { x: 8, y: 24, w: 30, h: 17 };
function sectLayout(m, l, st, ft) {
  const W = 46, H = 68, cx = 21, w = st.wall, ex = ft[4] || {}, trees = ex.trees || st.trees, R = fold(l.id), mid = cx + 2, hall = ex.hall || st.hall || 'hall', big = st.big || 'lodge', small = st.small;
  // 가장자리. 산에 있는 문파는 바위와 나무를 두껍게 두른다
  const west = l.id === 'hwasan'; m.border(trees, west ? [[cx - 1, H - 3, 6, 3], [0, 28, 3, 7]] : [[cx - 1, H - 3, 6, 3]], 3);
  for (let y = 3; y < H - 3; y += 4) { const a = trees[Math.floor(R() * trees.length)], b = trees[Math.floor(R() * trees.length)]; if (!(west && y > 25 && y < 37)) m.put(a, 1 + R() * 2, y); m.put(b, W - 6 + R() * 2, y); }
  if (west) m.fill(0, 30, 9, 4, 3);
  const mt = ex.mount || st.mount;
  if (mt) { m.put('rocks', 3, 8); m.put('rocks', 39, 8); }
  // 구역을 층으로 나눈다. 산이면 바위 벼랑, 평지면 담장이고 가운데만 계단처럼 열려 있다
  for (const y of [42, 20]) { if (mt) { for (let x = 2; x < 17; x += 4) m.put('rocks', x, y); for (let x = 29; x < 43; x += 4) m.put('rocks', x, y); } else { m.row(w, 3, y + 2, 15); m.row(w, 28, y + 2, 15); } }
  if (st.water) { m.water(1, 54, 15, 5); m.water(32, 54, 13, 5); }
  m.fill(cx, 9, 4, H - 9, 3);
  // 산문
  m.row(w, 3, 60, cx - 3); m.row(w, cx + 4, 60, W - cx - 7); m.put('gate_arch', cx, 58, { nosolid: true }); m.place(mid, 57.2, l.name); m.put(st.ban, cx - 2, 61); m.put(st.ban, cx + 5, 61);
  // 외문 구역
  room(m, l, big, 7, 45, 'dorm', '외문 숙소'); if (!st.water) { room(m, l, big, 13, 45, 'dorm', '외문 숙소', { n: 2, quiet: 1 }); m.put('log', 7, 53); m.put('log', 10, 53); }
  room(m, l, small, 33, 47, 'mess', '식당'); m.put('jar', 30, 52); m.put('jar', 32, 52); m.put('pot', 35, 52); m.put(st.ban, cx - 3, 50); m.put(st.ban, cx + 6, 50);
  // 연무장
  m.fill(YARD.x, YARD.y, YARD.w, YARD.h, 3); m.place(mid, YARD.y - 1, ft[1]);
  for (let i = 0; i < 6; i++) m.put('f_dummy', YARD.x + 2 + i * 5, YARD.y + 1);
  m.put('rack', YARD.x + 1, YARD.y + 13); m.put('rack', YARD.x + YARD.w - 4, YARD.y + 13); m.put(st.ban, YARD.x - 1, YARD.y); m.put(st.ban, YARD.x + YARD.w, YARD.y); m.put(st.ban, YARD.x - 1, YARD.y + 14); m.put(st.ban, YARD.x + YARD.w, YARD.y + 14);
  // 내문 구역
  room(m, l, big, 7, 12, 'lib', ft[2]); room(m, l, big, 35, 12, 'elder', ft[3]); room(m, l, small, 13, 13, 'clinic', '약방'); room(m, l, small, 28, 13, 'armory', '무기고');
  const dk = i => (ex.deco || st.deco)[i % (ex.deco || st.deco).length]; m.put(dk(0), 3, 18); m.put(dk(1), 41, 18); m.put(dk(0), 17, 19); m.put(dk(1), 28, 19);
  // 본전
  m.fill(cx - 5, 8, 14, 2, 3); room(m, l, hall, cx, 1, 'hall', ft[0]); m.put(dk(0), cx - 5, 3); m.put(dk(0), cx + 6, 3); m.put(st.ban, cx - 2, 6); m.put(st.ban, cx + 5, 6);
  // 길가 나무와 석등. 사람 사는 곳처럼 보이게 빈 땅을 채운다
  for (const y of [11, 15, 46, 50, 54]) { m.put(dk(y), cx - 3, y); m.put(y % 4 ? 'lantern' : dk(y + 1), cx + 6, y); }
  for (const [x, y] of [[8, 26], [36, 26], [8, 38], [36, 38]]) m.put('pot', x, y);
  for (const [x, y] of [[4, 28], [40, 28], [4, 34], [40, 34], [4, 48], [40, 46], [18, 56], [27, 56]]) if (!(west && x === 4 && y < 40)) m.put(trees[Math.floor(R() * trees.length)], x, y);
  m.scatter(['flower1', 'fern1', 'fern2', 'bush2'], 60, 7);
}
const SLAVE = ['guangzhou', 'changan', 'suzhou'];  // 노예 시장이 서는 고을
function townLayout(m, l) {
  const W = 60, H = 48, cx = 28; m.walkOn = [1, 3];
  m.border(['tree_round', 'grove_green'], [[cx - 1, H - 3, 6, 3]], 3);
  m.fill(cx, 3, 4, H - 3, 1); m.fill(3, 21, W - 6, 4, 1); m.fill(20, 14, 20, 18, 3);
  m.row('wall_h', 3, 43, cx - 3); m.row('wall_h', cx + 4, 43, W - cx - 7); m.put('gate_arch', cx, 41, { nosolid: true }); m.place(cx + 2, 40, l.name);
  room(m, l, 'inn', 6, 13, 'inn', '객잔'); room(m, l, 'shop_green', 14, 14, 'shop', '저잣거리'); room(m, l, 'shop_blue', 42, 14, 'book', '고서점'); room(m, l, 'hall', 26, 2, 'gov', '관아'); room(m, l, 'house_red', 49, 13, 'gamble', '도박장');
  [['hut_o', 34, 8], ['hut_o2', 18, 7], ['clay', 40, 6], ['wood_b', 6, 30], ['hut_o', 13, 30], ['clay', 40, 30], ['wood_o', 47, 30], ['hut_b', 6, 36], ['hut_o2', 13, 36], ['hut_b', 40, 36], ['hut_o', 47, 36]].forEach(([st, x, y], i) => room(m, l, st, x, y, 'home', '민가', { n: i + 1, quiet: 1 }));
  m.put('banner2', 20, 13); m.put('banner1', 39, 13); m.put('statue', 29.5, 19, { nosolid: true });
  // 광장 네 귀퉁이의 좌판. 차양 밑에 매대를 놓고 장사꾼은 그 뒤에 선다
  for (const [x, y] of [[21, 16], [34, 16], [21, 26], [34, 26]]) { m.put('awning', x, y, { nosolid: true }); m.put('counter', x + 1.5, y + 2); }
  m.put('jar', 21, 18.6); m.put('pot', 38.7, 18.6); m.put('box', 21, 28.6); m.put('jar', 38.7, 28.6); m.put('sign_sword', 9, 25.3); m.scatter(['flower1', 'fern1'], 18, 4);
  if (SLAVE.includes(l.id)) { m.fill(47, 6, 9, 3, 4); m.row('wood_h', 47, 5, 9); m.put('banner7', 46.4, 5.4); m.put('banner7', 55.8, 5.4); m.put('log', 45.6, 9.6); m.put('box', 55.6, 9.4); m.label(51.5, 4.4, '노예 시장'); }
}
// 지도에 있는 건물 가운데 문이 없는 것에 문을 달아 준다
function autoDoors(m, owner) {
  [...m.stamps].forEach((st, i) => { if (!HOUSES.includes(st.name)) return; const w = STAMPS[st.name][3], h = STAMPS[st.name][4], cx = st.x + w / 2, by = st.y + h; if (m.portals.some(q => q.x + q.w > st.x && q.x < st.x + w && Math.abs(q.y - by) < 28)) return;
    const bx = cx / TS, byT = by / TS + 1; if (m.blocked(cx, by + 16) || m.blocked(cx, by + 8)) return; const big = st.name === 'hall' || st.name === 'lodge', kind = big ? 'temple' : 'home', id = `h_${m.id}_${i}`, [, , ex, ey] = ROOM[kind]; ROOMS[id] = { back: m.id, bx, by: byT, kind, name: big ? '전각' : '집', owner };
    m.portals.push({ x: cx - 9, y: by - 4, w: 18, h: 9, to: id, tx: ex + 2, ty: ey - .6, dir: 1, door: true }); });
}
function make(id) {
  if (id.startsWith('r_') || id.startsWith('h_')) return makeRoom(id);
  const l = LOCS.find(q => q.map === id); if (!l) { console.warn('없는 지도', id); return; }
  const town = l.style === 'town', st = town ? { biome: l.px[1] > 480 ? 'grass' : 'sand', bgm: 'good', arena: 'village' } : ST[l.style], ft = FEAT[l.fac] || ['본전', '연무장', '서고', '장로원', {}], ex = ft[4] || {}, W = town ? 60 : 46, H = town ? 48 : 68;
  const m = makeMap(id, W, H, { name: l.name, bgm: st.bgm, biome: ex.biome || st.biome, arena: st.arena, ambient: ex.ambient || st.ambient, tint: st.tint });
  if (town) townLayout(m, l); else sectLayout(m, l, st, ft);
  const [wx, wy] = G.world.entry(id), gate = town ? 26 : 19; m.exit(town ? 26 : 19, H - 1, 8, 1, 'world', wx, wy, 0); if (id === 'b_hwasan') m.exit(0, 30, 1, 5, 'hwasan', 28, 11, 2);
  m.render();
}
// ── 사람들 ──
const hiOnce = async f => { const k = 'hi_' + f.id; if (f.hi && !G.S.flags[k]) { G.S.flags[k] = 1; await say(f.key, f.hi); } };
export async function storyFac(f) {
  await hiOnce(f); const s = G.S, opts = [];
  if (!s.daily['duel_' + f.id]) opts.push(['비무를 청한다', async () => {
    s.daily['duel_' + f.id] = 1;
    const won = await ctx.duel({ foes: ['clan_' + f.id], arena: G.field.m.arena, bgm: 'boss', title: `${f.name} · ${f.who}`, yieldAt: .25, optional: true, noLoot: true });
    if (!won) { await say(f.key, '다시 오시오.'); return; }
    s.flags['clan_' + f.id] = true; const g = f.gift.find(k => !s.skills.includes(k));
    if (g) { learn(g); await say(f.key, '가져가시오. 쓸 줄 아는 사람이 쓰는 게 낫소.'); } else if (f.heart && !s.hearts.includes(f.heart)) { s.hearts.push(f.heart); toast('심법을 익혔다', 3); }
    if (LOOT[f.id]) await G.life.lootPick(f.who, LOOT[f.id]);
  }]);
  opts.push(['이곳에 대해 묻는다', async () => { await narr(f.desc); }], ['그만둔다', async () => { }]);
  const c = await choice(f.name, opts.map(o => o[0])); await opts[c][1]();
}
const AWAY = { 구파일방: '장문인께서는 구화성 구파 회관에 가 계십니다. 뵈러 오셨다면 그쪽으로 가십시오.', 오대세가: '가주님은 구화성 세가 거리에 나가 계십니다.', 사파: '어른은 여기 없어. 찾지 마.', 마교: '교주님을 뵐 자격이 아직 없습니다.' };
// ── 이름 없는 사람들 ──
// 말할 때 이름과 얼굴을 띄운다. 같은 사람에게 다시 걸면 다음 말을 한다
const ARTOF = { Villager: 'town', Villager2: 'town', Villager3: 'town', Villager4: 'town2', Woman: 'town2', Boy: 'kid' };
const SAID = new Map();
function npcSay(name, spr, text, art) { WHO._npc = { name, face: spr, art: art === undefined ? ARTOF[spr] : art || undefined }; return say('_npc', text); }
function nextLine(key, list) { const i = SAID.get(key) || 0; SAID.set(key, i + 1); return list[i % list.length]; }
// 강호 소식을 그 사람 말투로 옮긴다. "~붙었다." → "~붙었답니다."
function hearsay(reg) {
  const S = G.S, fr = S.fr; let t = null;
  if (S.mode !== 'free' && G.jh.talkOfDay && Math.random() < .5) t = G.jh.talkOfDay();
  if (!t && fr && fr.news) { const n = fr.news.find(x => +x.split('일:')[0] >= (S.day || 1) - 6); if (n) t = n.replace(/^\d+일: /, ''); }
  if (!t) return null; t = t.split(/(?<=[.?!])\s/)[0].trim();
  if (/[?!]$/.test(t) || !/다\.$/.test(t)) return t;
  const end = { hap: ['답니다.', '이랍니다.', '했답니다.'], hao: ['다더군.', '이라더군.', '했다더군.'], ban: ['다더라.', '이라더라.', '했다더라.'] }[reg];
  if (/하다\.$/.test(t)) return t.slice(0, -3) + end[2]; if (/이다\.$/.test(t)) return t.slice(0, -3) + end[1]; return t.slice(0, -2) + end[0];
}
function ctxLines(f, role) {
  const reg = REG[f.id] || 'hap', C = CTX[reg], S = G.S, rep = G.jh.rep(f.id), out = [];
  if (S.flags.night) out.push(pick(C.night));
  if (role === 'gate') { if (rep >= 60 && S.title) out.push(pick(C.known).replace('{t}', S.title)); else if (rep >= 25) out.push(pick(C.friend)); else if (rep < 0) out.push(pick(C.wary)); }
  else if (Math.random() < .45) { const n = hearsay(reg); if (n) out.push(pick(C.news).replace('{n}', n)); }
  return out.map(t => t.replace('{f}', f.name));
}
const GREET = { hap: '어서 오십시오.', hao: '어서 오시오.', ban: '볼일 있나.' };
const SHOUT = { hap: ['하앗!', '하나! 둘!', '얍!'], hao: ['하앗!', '하나! 둘!', '이얍!'], ban: ['…….', '흡!'] };
const COACH = { hap: ['자세 낮춰!', '칼끝 봐라!', '다시!', '숨 고르고!'], hao: ['허리 펴!', '다시!', '소리 크게!', '발 붙여!'], ban: ['다시.', '느려.', '숨 죽여.'] };
const SLEEPY = ['하암…', '졸리다.', '불 끌까.'];
const FACEART = { gaebang: 'beggar', janggang: 'pirate', cheonma: 'believer' };
// 문지기에게 물어볼 수 있는 것
async function gateAsk(f, l, name, spr, art) {
  const reg = REG[f.id] || 'hap', c = await choice('무엇을 물을까?', ['이곳에 대해 묻는다', '요즘 소식을 묻는다', '그만둔다']); if (c === 2) return;
  if (c === 0) {
    const head = f.group === '세가' || f.group === '오대세가' ? '가주님' : f.align === 'jeong' ? '장문인' : '어른', main = FEAT[f.id]?.[0] || '본전', yard = FEAT[f.id]?.[1] || '연무장';
    await npcSay(name, spr, { hap: `${f.name} 말씀입니까.`, hao: `${f.name} 말이오?`, ban: '여기?' }[reg], art); await narr(f.desc);
    await npcSay(name, spr, { hap: `${head}의 거처는 맨 위 ${main}입니다. 비무를 청하시거나 일손을 보태시려면 ${yard}의 사범님을 찾으십시오.`, hao: `${head}은 맨 위 ${main}에 계시오. 비무든 일거리든 ${yard} 사범한테 말하시오.`, ban: `위에 ${main}. 일거리는 ${yard} 사범한테.` }[reg], art);
  } else { const n = hearsay(reg); await npcSay(name, spr, n ? pick(CTX[reg].news).replace('{n}', n) : { hap: '요즘은 조용합니다. 조용한 게 제일입니다.', hao: '요즘은 별일 없소.', ban: '없다.' }[reg], art); }
}
async function shopTalk(l) {
  const c = await choice(`${l.name} 저잣거리다. 없는 게 없다.`, ['물건 사기', '물건 팔기', '그만둔다']);
  if (c === 0) await ctx.shop(`${l.name} 저잣거리`, [ctx.item.potion(), ctx.item.stuff('rice', 4), ctx.item.stuff('noodlep', 4), ctx.item.stuff('tea', 44), ctx.item.stuff('sweets', 24), ctx.item.weapon('iron_sword'), ctx.item.weapon('iron_blade'), ctx.item.weapon('iron_spear'), ctx.item.weapon('fist_wrap')]);
  if (c === 1) await G.life.openSell();
}
async function innTalk(l) {
  const S = G.S, c = await choice(`${l.name} 객잔이다.`, ['하룻밤 묵는다 (은자 8냥)', '밥을 먹는다 (은자 4냥)', '그만둔다']);
  if (c === 0) { if (S.silver < 8) { await say(null, '주머니가 비었다.'); return; } S.silver -= 8; await G.life.sleepNow(); }
  if (c === 1) { if (S.silver < 4) { await say(null, '주머니가 비었다.'); return; } S.silver -= 4; S.potion = Math.max(S.potion, S.potionMax); await say(null, '든든하게 먹었다. 금창약도 채웠다.'); }
}
async function boatTalk(l) {
  const to = LOCS.find(q => q.map === l.boat), fee = 20, c = await choice(`${to.name}까지 가는 배가 있다. 뱃삯은 은자 ${fee}냥.`, ['탄다', '그만둔다']); if (c) return;
  if (G.S.silver < fee) { await say(null, '뱃삯이 모자란다.'); return; } G.S.silver -= fee; Sound.sfx('select', .6); await ctx.warp(to.map, to.at[0], to.at[1], 1);
}
const elderName = (l, i) => { const R = fold(l.id + i); return `${SURNAME[Math.floor(R() * SURNAME.length)]} 장로`; };
function roomNpcs(id, out) {
  const r = ROOMS[id], l = r.owner, kind = r.kind; const hash = [...id].reduce((a, c) => a * 31 + c.charCodeAt(0) & 65535, 7);
  if (kind === 'home') { const [who, spr, t] = HOME[hash % HOME.length]; out.npcs.push({ id: 'res', spr, x: 7, y: 4 + hash % 2, dir: 0, hint: who, talk: async () => { await npcSay(who, spr, nextLine(id + 'res', t).replace(/\{p\}/g, l.name)); } }); return; }
  if (kind === 'temple') { out.npcs.push({ id: 'res', spr: 'Monk', x: 8, y: 7.4, dir: 0, life: 'work', hint: '전각지기', talk: async () => { await npcSay('전각지기', 'Monk', nextLine(id + 'res', ['향만 피우고 가시면 됩니다. 소리는 내지 마십시오.', '바닥을 막 닦았습니다. 밟으신 데는 제가 다시 닦겠습니다.', '오늘은 손님이 없었습니다. 이런 날은 부처님도 쉬십니다.'])); } }); return; }
  if (kind === 'gov') { out.npcs.push({ id: 'res', spr: 'Inspector', x: 10, y: 6.4, dir: 0, life: 'work', hint: '아전', talk: async () => { await npcSay('아전', 'Inspector', nextLine(id + 'res', [`${l.name} 관아요. 칼 찬 사람끼리 싸운 일은 우리 소관이 아니오. 위에서 그렇게 말하라고 했소.`, '세금 내러 왔소? 아니면 나가시오. 오늘 장부가 산더미요.', '방은 저쪽 벽에 붙어 있소. 현상금 걸린 놈 얼굴도 거기 있고.'])); } }); return; }
  if (kind === 'gamble') {
    out.npcs.push({ id: 'dealer', spr: 'DarkNinja', x: 9.5, y: 4.3, dir: 0, life: 'still', hint: '물주', hawk: ['홀이냐 짝이냐, 거시오!', '자, 엎습니다!', '판돈 거시오, 판돈!'], gap: [5, 9], talk: () => gambleTalk(l) },
      { id: 'gboss', spr: 'Inspector', x: 17.2, y: 4.2, dir: 2, life: 'still', hint: '도박장 주인', talk: async () => { await npcSay('도박장 주인', 'Inspector', nextLine(id + 'b', GAMBLE.boss)); } },
      { id: 'gdoor', spr: 'Caveman2', x: 6.2, y: 10.8, dir: 3, life: 'still', hint: '덩치', talk: async () => { await npcSay('덩치', 'Caveman2', '칼은 차고 들어와도 되오. 뽑지만 마시오.'); } });
    [[3.8, 7.25, 0, 'Villager2'], [5.4, 8.85, 1, 'Villager'], [13.8, 7.25, 0, 'Villager3'], [15.4, 8.85, 1, 'Samurai']].forEach(([x, y, dir, spr], i) => out.npcs.push({ id: 'gb' + i, spr, x, y, dir, life: 'still', lively: 1, hint: '노름꾼', barks: GAMBLE.bark, talk: async () => { await npcSay('노름꾼', spr, nextLine(id + 'gb' + i, rot(['말 걸지 마시오. 지금 끗발이 오르는 중이오.', '집문서는 아직 안 걸었소. 아직은.', '어제 딴 돈을 오늘 다 잃었소. 그러니 본전이오, 본전.', '물주가 대접 엎을 때 손목을 보시오. …아니, 내가 그런 말 안 했소.'], i))); } }));
    out.npcs.push({ id: 'gwatch', spr: 'Woman', x: 11.6, y: 9.6, dir: 1, life: 'watch', lively: 1, look: [14.5, 7.5], hint: '구경꾼', barks: ['어머, 또 졌네.', '저 사람 오늘 집에 못 가겠소.'], talk: async () => { await npcSay('구경꾼', 'Woman', '남편 찾으러 왔소. 저기 저 사람. 끌고 가려다 구경하고 있소.'); } });
    return;
  }
  if (kind === 'inn') {  // 객잔은 소문이 모이는 곳이다
    const CT = CITYTALK[l.id] || { talk: CHAT.town }, gossip = i => async () => { const n = hearsay('hao'); await npcSay('술손님', ['Villager2', 'Samurai', 'Villager'][i], n && Math.random() < .6 ? pick(CTX.hao.news).replace('{n}', n) : nextLine(id + 'pt' + i, rot(CT.talk, i + 3))); };
    out.npcs.push({ id: 'cinn', spr: 'OldWoman', x: 3, y: 4.6, dir: 0, hint: '객잔 주인', talk: () => innTalk(l) },
      { id: 'pt0', spr: 'Villager2', x: 4.4, y: 5.8, dir: 0, life: 'still', lively: 1, hint: '술손님', barks: ['술 한 병 더!', '들었소? 그 소문.', '캬, 좋다.'], talk: gossip(0) },
      { id: 'pt1', spr: 'Samurai', x: 12.4, y: 5.8, dir: 0, life: 'still', hint: '삿갓 쓴 손님', barks: ['…', '술이 싱겁군.'], talk: gossip(1) },
      { id: 'pt2', spr: 'Villager', x: 4.6, y: 8.6, dir: 0, life: 'still', lively: 1, hint: '술손님', barks: ['여기 국수 하나!', '쉿, 저 사람 강호인이오.'], talk: gossip(2) },
      { id: 'srv', spr: 'Villager4', x: 9, y: 7.6, dir: 0, life: 'wander', r: 4, speed: 30, hint: '점소이', barks: ['네, 갑니다!', '뜨거우니 조심하시오!', '술 나갑니다!'], talk: async () => { await npcSay('점소이', 'Villager4', nextLine(id + 'srv', ['자리는 아무 데나 앉으시오. 주문은 주인 할머니한테 하시고.', '저 삿갓 쓴 손님은 사흘째 술만 드시오. 말 걸지 마시오. 지난번에 말 건 사람이 탁자째 날아갔소.', '방은 위층이오. 이불은 어제 빨았소. 아마도.'])); } });
  }
  if (kind === 'shop') out.npcs.push({ id: 'cshop', spr: 'Greenman', x: 6, y: 3.4, dir: 0, hint: '장사꾼', talk: () => shopTalk(l) });
  if (kind === 'book') out.npcs.push({ id: 'cbook', spr: 'Sodi', x: 6, y: 4.4, dir: 0, hint: '서점 주인', talk: () => G.arts.bookshop(l) });
  const f = l.fac && G.free?.fac(l.fac); if (!f || G.jh.fallen(f.id)) return;
  const st = ST[l.style], folk = st.folk, hostile = G.jh.hostile(f.id);
  if (kind === 'hall') { if (G.S.mode !== 'free' && f.hi && !hostile) out.npcs.push({ id: f.key, spr: f.spr, x: 11, y: 5, dir: 0, hint: f.name, talk: () => storyFac(f) }); if (G.S.mode !== 'free' && !f.hi) { const c = CLANS.find(q => q.id === f.id); if (c && !G.S.flags.boat_guhwa && !hostile) out.npcs.push({ ...G.clanNpc(c), x: 11, y: 5 }); else out.npcs.push({ id: 'keeper', spr: folk[0], x: 11, y: 5, dir: 0, hint: '본전을 지키는 제자', talk: async () => { await say(null, AWAY[f.group] || '어른은 지금 안 계십니다.'); } }); } }
  if (hostile) return;
  const T = TALK[f.id] || {}, room = T.room || CHAT[l.style], who = f.group === '세가' || f.group === '오대세가' ? '가솔' : '제자', fart = FACEART[f.id];
  if (kind === 'clinic') out.npcs.push({ id: 'heal', spr: 'OldMan', x: 4, y: 7, dir: 0, hint: '의원', talk: async () => { await say(null, `${l.name} 의원: 상처를 봐 드리겠습니다. 금창약도 채워 드리지요.`); G.S.potion = Math.max(G.S.potion, G.S.potionMax); Sound.sfx('heal', .6); } });
  if (kind === 'armory') out.npcs.push({ id: 'smith', spr: 'Caveman2', x: 4, y: 7.4, dir: 0, life: 'work', hint: '무기고지기', talk: () => armory(f) });
  if (kind === 'elder') { out.npcs.push({ id: 'elder1', spr: 'OldMan', x: 5, y: 5, dir: 0, hint: elderName(l, 1), talk: () => G.arts.tutor(f) }, { id: 'elder2', spr: 'OldMan2', x: 14, y: 5, dir: 0, hint: elderName(l, 2), talk: async () => { await say(null, `${elderName(l, 2)}: 강호에서 ${f.name} 이름을 지키는 게 칼보다 어렵네. 우호가 쌓이면 가르칠 게 더 있을 걸세.`); } }); }
  if (kind === 'lib') out.npcs.push({ id: 'elder3', spr: 'Sodi', x: 9, y: 8.4, dir: 0, hint: `${elderName(l, 3)} (서고지기)`, talk: async () => { await narr(f.desc); await G.arts.library(f); } });
  if (kind === 'dorm') out.npcs.push({ id: 'd1', spr: folk[0], x: 5, y: 5, dir: 3, hint: who, barks: () => G.S.flags.night ? SLEEPY : null, talk: async () => { await npcSay(`${f.name} ${who}`, folk[0], nextLine(id + 'd1', [...ctxLines(f, 'room'), ...room]), fart); } }, { id: 'd2', spr: folk[1 % folk.length], x: 12, y: 5, dir: 2, life: 'work', hint: who, talk: async () => { await npcSay(`${f.name} ${who}`, folk[1 % folk.length], nextLine(id + 'd2', [...room].reverse()), fart); } });
  if (kind === 'mess') out.npcs.push({ id: 'cook', spr: 'Villager4', x: 3, y: 3.6, dir: 0, life: 'work', hint: '밥 짓는 사람', barks: ['불 세다!', '간 봐야지.', '그릇 내와!'], talk: async () => { await npcSay('밥 짓는 사람', 'Villager4', nextLine(id + 'cook', ['밥때 되면 오시오. 지금은 물밖에 없소.', '손님 밥은 따로 안 짓소. 같이 먹고 싶으면 그릇 들고 줄 서시오.', '반찬 투정하는 사람은 다음 끼니를 굶기오. 여기 법이오.'])); } }, { id: 'd3', spr: folk[0], x: 13, y: 4, dir: 0, hint: who, talk: async () => { await npcSay(`${f.name} ${who}`, folk[0], nextLine(id + 'd3', [...ctxLines(f, 'room'), ...room]), fart); } });
}
async function armory(f) {
  const s = G.S, w = (LOOT[f.id] || []).find(k => WEAPONS[k] && !s.weapons.includes(k)); if (!w) { await say(null, '무기고지기: 내줄 만한 칼이 없소.'); return; } if (G.jh.rep(f.id) < 35) { await say(null, `무기고지기: 우리 사람한테만 파는 물건이오. (우호 35)`); return; }
  const c = await choice(`${WEAPONS[w].name}을(를) 살까? (은자 800냥)`, ['산다', '그만둔다']); if (c) return; if (s.silver < 800) { await say(null, '은자가 모자란다.'); return; } s.silver -= 800; s.weapons.push(w); Sound.sfx('coin'); toast(`${WEAPONS[w].name}을(를) 샀다`, 3);
}
// ── 저잣거리 사람들 ──
const rot = (a, i) => a.slice(i % a.length).concat(a.slice(0, i % a.length));
function townNpcs(l, id, out, folk) {
  const CT = CITYTALK[l.id] || { talk: CHAT.town, bark: [] }, night = G.S.flags.night, kid = G.S.gender === 'f' ? '누나' : '형';
  const talkOf = (i, spr, who = `${l.name} 사람`) => async () => { const t = i < 2 && G.jh.talkOfDay(); await npcSay(who, spr, t || nextLine(id + i, rot(CT.talk, i))); };
  // 길을 오가는 사람들. 짝수 번째는 가끔 집이나 가게에 들어갔다 나온다
  [[29, 12], [24, 22], [36, 23], [29, 30], [12, 22], [46, 22], [29, 36]].slice(0, night ? 2 : 7).forEach(([x, y], i) => { const spr = folk[i % folk.length]; out.npcs.push({ id: `folk${i}`, spr, x: x + .5, y: y + .75, dir: i % 4, life: 'stroll', enters: i % 2 === 0, speed: 17 + (i * 7) % 11, hint: '말 걸기', barks: () => night ? SLEEPY : CT.bark, talk: talkOf(i, spr) }); });
  // 순라군 둘. 하나는 광장을 돌고 하나는 큰길을 오간다
  [[[20, 15], [39, 15], [39, 31], [20, 31]], [[30, 10], [30, 38], [30, 23], [55, 23], [4, 23], [30, 23]]].forEach((route, i) => out.npcs.push({ id: 'guard' + i, spr: 'Knight', x: route[0][0] + .5, y: route[0][1] + .75, dir: 0, life: 'patrol', route, speed: 19, hint: '순라군', barks: () => night ? PATROL.night : PATROL.day, talk: async () => { await npcSay('순라군', 'Knight', nextLine(id + 'pt', PATROL.talk)); } }));
  // 문 앞 거지는 밤낮없이 앉아 있다
  out.npcs.push({ id: 'gatebeg', spr: 'Caveman', x: 26.4, y: 39.6, dir: 3, life: 'still', hint: '거지', hawk: BEGGAR.hawk, gap: [12, 22], talk: () => beggarTalk(l) });
  // 도박장 앞 호객꾼
  out.npcs.push({ id: 'tout', spr: 'Greenman', x: 53, y: 17.3, dir: 2, life: 'still', hint: '호객꾼', hawk: ['한 판 하고 가시오!', '오늘 운수 좋아 보이시오!', '홀이냐 짝이냐!'], talk: async () => { await npcSay('호객꾼', 'Greenman', nextLine(id + 'tout', ['들어가 보시오. 따면 손님 돈이고, 잃어도 손님 돈이오. 하하.', '하오문이 보는 판이라 속임수는 없소. 속임수가 필요 없거든.', '칼 찬 양반들은 판을 크게 걸더군. 크게 따는 사람도 있소. 가끔.'])); } });
  if (SLAVE.includes(l.id)) slaveNpcs(l, id, out, night);
  if (night) {  // 밤에는 좌판이 걷히고 취객이 나온다
    out.npcs.push({ id: 'drunk', spr: 'Villager2', x: 10, y: 18.8, dir: 0, life: 'wander', r: 2.5, speed: 11, hint: '취객', barks: DRUNK, talk: async () => { await npcSay('취객', 'Villager2', nextLine(id + 'dr', ['어이, 친구! 한 잔 받으시오! …잔이 어디 갔지?', '내가 왕년에 화산파 장문인이랑 술을 마셨소. 진짜요. 장문인은 기억 못 하겠지만.', '집에 가면 마누라가 기다리오. 그러니 한 잔만 더.'])); } });
    return;
  }
  STALLS.forEach((st, i) => { const [x, y] = [[24, 18.3], [37, 18.3], [24, 28.3], [37, 28.3]][i]; out.npcs.push({ id: 'stall_' + st.k, spr: st.spr, x, y, dir: 0, life: 'still', hint: st.who, hawk: [...st.hawk, ...(CITYHAWK[l.id]?.[st.k] || [])], gap: [6, 12], talk: () => stallTalk(l, st) }); });
  // 이야기꾼과 듣는 사람들
  out.npcs.push({ id: 'teller', spr: 'Monk', x: 15, y: 26.4, dir: 0, life: 'still', hint: '이야기꾼', hawk: ['자, 들어들 보시오!', '이건 진짜 있었던 일이오.', '오늘은 무슨 얘기를 할까…'], talk: () => tellerTalk(l) });
  [[13.4, 28.2, 'Villager'], [15.1, 28.7, 'Woman'], [16.8, 28.1, 'Villager4']].forEach(([x, y, spr], i) => out.npcs.push({ id: 'listen' + i, spr, x, y, dir: 1, life: 'watch', lively: 1, look: [15, 26.4], hint: '말 걸기', barks: LISTEN, talk: async () => { await npcSay('듣는 사람', spr, rot(['쉿. 지금 제일 재밌는 대목이오.', '저 영감 얘기는 반이 거짓말이오. 그래도 재밌소.', '어제 들은 얘기랑 끝이 다르오. 그래서 또 듣는 거요.'], i)[0]); } }));
  // 재주꾼과 구경꾼
  out.npcs.push({ id: 'perf', spr: 'GrayNinja', x: 35.5, y: 34.2, dir: 0, life: 'perform', hint: '재주꾼', hawk: PERFORM.hawk, gap: [5, 10], talk: () => perfTalk(l) });
  [[33.8, 35.9, 'Villager3'], [35.6, 36.4, 'BlueNinja'], [37.3, 35.8, 'OldWoman']].forEach(([x, y, spr], i) => out.npcs.push({ id: 'watch' + i, spr, x, y, dir: 1, life: 'watch', lively: 1, look: [35.5, 34.2], hint: '구경꾼', barks: PERFORM.watch, talk: async () => { await npcSay('구경꾼', spr, rot(['저 칼이 진짜라오. 아까 사과를 두 쪽 내는 걸 봤소.', '한 푼 던져 주시오. 저 사람도 먹고살아야지.', '저 재주면 문파에 들어가도 되겠소. 본인은 싫다더군.'], i)[0]); } }));
  // 뛰어노는 아이들, 수다 떠는 노인들
  [[33, 25, 'Villager'], [25, 30, 'Woman']].forEach(([x, y, spr], i) => out.npcs.push({ id: 'kid' + i, spr, size: 12, x, y, dir: i, life: 'wander', r: 4, speed: 38, hint: '아이', barks: KIDS, talk: async () => { await npcSay('아이', spr, nextLine(id + 'kid' + i, [`${kid}, 그 칼 진짜예요? 한 번만 만져 봐도 돼요?`, '저기 재주꾼 아저씨가 칼을 삼켰어요! 진짜로요!', '엄마가 칼 찬 사람이랑 말하지 말랬어요. 근데 벌써 말했네.']), 'kid'); } }));
  out.npcs.push({ id: 'old0', spr: 'Sodi', x: 25.4, y: 20.4, dir: 3, life: 'still', hint: '영감', duo: 'old1', barks: ELDERS, talk: async () => { await npcSay('영감', 'Sodi', '젊은이, 장기 둘 줄 아시오? 모르면 훈수나 두지 마시오.'); } },
    { id: 'old1', spr: 'OldWoman', x: 26.8, y: 20.4, dir: 2, life: 'still', hint: '할멈', talk: async () => { await npcSay('할멈', 'OldWoman', '우리 영감이 어제 한 말을 오늘 또 하오. 사십 년째요. 나는 사십 년째 듣고.'); } });
}
async function stallTalk(l, st) {
  await npcSay(st.who, st.spr, nextLine(l.id + st.k, st.talk));
  const c = await choice(st.name, [st.sell ? '물건을 판다' : '물건을 본다', '그만둔다']); if (c) return;
  if (st.sell) { await G.life.openSell(); return; }
  await ctx.shop(`${l.name} ${st.name}`, st.goods.map(([k, v]) => k === 'potion' ? ctx.item.potion() : ctx.item.stuff(k, v)));
}
async function tellerTalk(l) {
  const S = G.S, fr = S.fr, mine = fr && fr.fame >= 40 && (fr.news || []).find(x => x.includes(S.name));
  if (mine && Math.random() < .6) {
    await npcSay('이야기꾼', 'Sodi', `요즘 장터에서 제일 많이 오르내리는 얘기요. "${mine.replace(/^\d+일: /, '')}" ${josa(S.name, '이라는/라는')} 사람, 칼 솜씨가 귀신 같다더군.`);
    await narr('듣던 사람들이 고개를 끄덕인다. 이야기 속 사람이 바로 옆에 서 있는 줄은 아무도 모른다.'); return;
  }
  const n = hearsay('hao'); if (n && Math.random() < .35) { await npcSay('이야기꾼', 'Sodi', pick(CTX.hao.news).replace('{n}', n)); return; }
  const k = 'tale_' + l.id, i = (G.S.daily[k] = ((G.S.daily[k] ?? Math.floor(Math.random() * TALES.length)) + 1)) % TALES.length;
  for (const line of TALES[i]) await npcSay('이야기꾼', 'Sodi', line);
}
async function perfTalk(l) {
  await npcSay('재주꾼', 'GrayNinja', nextLine(l.id + 'perf', PERFORM.talk));
  const c = await choice('동전을 던져 줄까?', ['은자 3냥을 던진다', '그냥 본다']); if (c) return;
  if (G.S.silver < 3) { await say(null, '주머니가 비었다.'); return; } G.S.silver -= 3; Sound.sfx('coin', .6);
  await npcSay('재주꾼', 'GrayNinja', G.S.daily['perf_' + l.id] ? '또 주시오? 그럼 칼 하나 더 삼키리다.' : '고맙소! 자, 이번엔 눈 감고 갑니다!'); G.S.daily['perf_' + l.id] = 1;
}
async function beggarTalk(l) {
  const S = G.S, k = 'beg_' + l.id;
  if (S.daily[k]) { await npcSay('거지', 'Caveman', BEGGAR.again); return; }
  await npcSay('거지', 'Caveman', BEGGAR.ask); const c = await choice('동냥 그릇이 비어 있다.', ['은자 2냥을 넣어 준다', '그냥 간다']); if (c) return;
  if (S.silver < 2) { await say(null, '주머니가 비었다.'); return; } S.silver -= 2; S.daily[k] = 1; Sound.sfx('coin', .6); G.jh.addRep?.('gaebang', 1);
  const n = hearsay('hap'); await npcSay('거지', 'Caveman', BEGGAR.thanks); await npcSay('거지', 'Caveman', n ? `${n} 저 같은 놈 귀에도 들어올 정도면 다들 아는 얘깁니다요.` : BEGGAR.none);
}
// ── 도박장: 주사위 두 개의 합이 홀인지 짝인지 맞힌다. 딴 돈의 열에 하나는 구전으로 떼고, 하루에 600냥 넘게 따면 내보낸다 ──
const NUM = ['', '하나', '둘', '셋', '넷', '다섯', '여섯'];
async function gambleTalk(l) {
  const S = G.S, k = 'gam_' + l.id, cap = 600;
  if ((S.daily[k] || 0) >= cap) { await npcSay('물주', 'DarkNinja', '오늘은 손님 날이었습니다. 판은 내일 다시 엽니다.'); return; }
  await npcSay('물주', 'DarkNinja', '주사위 두 개, 합이 홀이냐 짝이냐. 맞히시면 건 만큼 드리고, 구전으로 열에 하나는 떼어 갑니다.');
  for (; ;) {
    const c = await choice(`가진 은자 ${S.silver}냥. 얼마를 걸까?`, ['10냥', '50냥', '200냥', '그만한다']); if (c === 3) return;
    const bet = [10, 50, 200][c]; if (S.silver < bet) { await say(null, '판돈이 모자란다.'); continue; }
    const g = await choice('홀이냐 짝이냐?', ['홀', '짝']), a = 1 + Math.floor(Math.random() * 6), b = 1 + Math.floor(Math.random() * 6), odd = (a + b) % 2 === 1;
    Sound.sfx('select', .5); await narr(`대접이 엎어졌다가 열린다. ${josa(NUM[a], '과/와')} ${NUM[b]}, ${odd ? '홀' : '짝'}이다.`);
    if ((g === 0) === odd) { const v = Math.max(1, Math.floor(bet * .9)); S.silver += v; S.daily[k] = (S.daily[k] || 0) + v; Sound.sfx('coin'); toast(`은자 ${v}냥을 땄다`, 2); }
    else { S.silver -= bet; S.daily[k] = (S.daily[k] || 0) - bet; toast(`은자 ${bet}냥을 잃었다`, 2); }
    if ((S.daily[k] || 0) >= cap) { await npcSay('물주', 'DarkNinja', '허허, 오늘은 손님 날이군요. 판은 여기까지입니다.'); return; }
  }
}
// ── 노예 시장: 사고팔 수는 없다. 값을 치러 풀어 주거나, 노예상을 쳐서 일주일 동안 문을 닫게 한다 ──
function captivesOf(l) { const R = fold(l.id + (G.S.day || 1)), a = [...CAPTIVES], out = []; while (out.length < 4) out.push(a.splice(Math.floor(R() * a.length), 1)[0]); return out; }
function slaveNpcs(l, id, out, night) {
  const S = G.S, shut = (S.flags['slave_shut_' + l.id] || 0) > (S.day || 1);
  if (shut || night) { out.spots.push({ x: 47, y: 6, w: 9, h: 3, hint: '빈 단상', act: async () => { await narr(shut ? SLAVER.shut : '밤이라 단상이 비어 있다. 끌려온 사람들은 어딘가에 갇혀 있을 것이다.'); } }); return; }
  const freed = S.daily['freed_' + l.id] || [];
  captivesOf(l).forEach(([who, spr, line], i) => { if (!freed.includes(i)) out.npcs.push({ id: 'cap' + i, spr, x: 48.5 + i * 2, y: 7.7, dir: 0, life: 'still', hint: who, talk: async () => { await npcSay(who, spr, line); const c = await choice('어떻게 할까?', ['풀어 주겠다고 한다', '그만둔다']); if (!c) await ransom(l, i); } }); });
  out.npcs.push({ id: 'slaver', spr: 'GoldKnight', x: 51.5, y: 10.5, dir: 0, life: 'still', hint: '노예상', hawk: SLAVER.hawk, gap: [7, 13], talk: () => slaverTalk(l) },
    { id: 'sguard', spr: 'Lion', x: 46, y: 8.6, dir: 3, life: 'still', hint: '노예상 부하', barks: SLAVER.guard, talk: async () => { await npcSay('노예상 부하', 'Lion', '물건에 손대지 마시오. 사람이라고? 값 매겨지면 물건이오.'); } });
}
async function slaverTalk(l) {
  await npcSay('노예상', 'GoldKnight', SLAVER.talk);
  const c = await choice('노예상이다.', ['값을 치르고 사람을 풀어 준다', '노예상을 친다', '그만둔다']);
  if (c === 0) { const caps = captivesOf(l), freed = G.S.daily['freed_' + l.id] || [], left = caps.map((q, i) => i).filter(i => !freed.includes(i)); if (!left.length) return; const k = await choice('누구를 풀어 줄까?', [...left.map(i => caps[i][0]), '그만둔다']); if (k < left.length) await ransom(l, left[k]); }
  if (c === 1) await raid(l);
}
async function ransom(l, i) {
  const S = G.S, price = 80 + S.lv * 10, c = await choice(`노예상에게 은자 ${price}냥을 치를까?`, ['치른다', '그만둔다']); if (c) return;
  if (S.silver < price) { await say(null, '은자가 모자란다.'); return; }
  S.silver -= price; Sound.sfx('coin'); await npcSay('노예상', 'GoldKnight', SLAVER.free); await freeMen(l, [i]);
}
async function raid(l) {
  const S = G.S, lv = S.lv, F = G.free.foes; await narr('칼자루에 손을 얹자 노예상 뒤에서 덩치들이 몽둥이를 집어 들었다.');
  F.q_slaver = { ...F[G.free.foeFor('rogue', lv + 1, true)], name: '노예상 호위 대장' };
  if (!await ctx.duel({ foes: ['q_slaver', ...G.free.group('bandit', lv, 2)], arena: G.field.m.arena, bgm: 'fight', title: `${l.name} 노예 시장`, optional: true, noIntro: true })) { await narr('물러났다. 노예상이 등 뒤에서 웃었다.'); return; }
  const caps = captivesOf(l), freed = S.daily['freed_' + l.id] || [], left = caps.map((q, i) => i).filter(i => !freed.includes(i)), v = 40 + lv * 4;
  S.flags['slave_shut_' + l.id] = (S.day || 1) + 7; S.silver += v; G.jh.news(`${S.name}, ${l.name} 노예 시장을 엎다.`);
  await narr(`밧줄을 끊었다. 노예상 전대에서 은자 ${v}냥이 나왔다.`); await freeMen(l, left, 1);
}
async function freeMen(l, idx, all) {
  const S = G.S, caps = captivesOf(l), fr = S.fr, sect = fr?.sect; S.daily['freed_' + l.id] = [...(S.daily['freed_' + l.id] || []), ...idx];
  if (fr) fr.fame += all ? 10 : 3;
  if (all) await narr('붙잡혀 있던 사람들이 서로 얼굴만 보다가, 하나둘 성문 쪽으로 걸어갔다.');
  else { const [who, spr] = caps[idx[0]]; await npcSay(who, spr, pick(['…정말 가도 되는 거요? 이 은혜를 어찌 갚으라고.', '고맙소. 고향 가는 길은 아직 기억하오.', '나 같은 사람한테 돈을 쓰다니. 별난 사람이오, 정말.'])); }
  if (sect && idx.length) {
    const k = all ? (await choice('갈 데 없는 사람이 하나 남아 머뭇거린다.', [`${josa(sect.name, '으로/로')} 데려간다`, '노자를 쥐여 보낸다'])) : (await choice('갈 데가 있느냐고 물었다.', [`${josa(sect.name, '으로/로')} 오라고 한다`, '고향으로 보낸다']));
    if (!k) { if (sect.guests.length >= 5) { await narr(`${sect.name}에는 이미 입문을 기다리는 사람이 많다. 노자를 쥐여 보냈다.`); } else { const [who, spr] = caps[idx[0]], d = { ...G.sect.mkD(), spr }; sect.guests.push(d); await narr(`"제 이름은 ${d.n}입니다." ${josa(who, '이었던/였던')} 사람이 처음으로 이름을 말했다. ${sect.name} 입문 희망자 명단에 이름이 올랐다.`); } }
  }
  G.field.refresh();
}
// 이야기 지도의 뒷배경 사람들. 줄거리 사람들과 겹치지 않게 평화로운 때에만 나온다
function ambient(id) {
  const out = { npcs: [], spots: [], trigs: [], roam: [] }, F = G.S?.flags; if (!F) return out;
  const step = F.step || 'p0', night = F.night;
  if (id === 'guhwa' && (step === 'end' || (G.after('c3b') && !G.after('c4a')))) {
    const T = ['구화성은 비무대회 때만 사람이 이렇게 많소. 평소엔 반도 안 되오.', '구파 회관 쪽은 칼 찬 사람만 다니오. 우리 같은 사람은 세가 거리로 돌아가오.', '남문 나루에 배가 늘었소. 대회 구경 온 사람들이오.', '맹주 창고 앞엔 얼씬도 하지 마시오. 지키는 사람들 눈빛이 다르오.', '여기 사람은 칼 솜씨보다 말솜씨로 먹고사오. 장사꾼 도시니까.'];
    [[24, 24], [12, 14], [38, 18], [30, 27], [16, 26]].slice(0, night ? 2 : 5).forEach(([x, y], i) => { const spr = ['Villager', 'Woman', 'Greenman', 'Villager3', 'OldWoman'][i]; out.npcs.push({ id: 'gw' + i, spr, x: x + .5, y: y + .75, dir: i % 4, life: 'stroll', far: 24, enters: i % 2 === 0, speed: 17 + i * 2, hint: '구화성 사람', barks: night ? SLEEPY : ['대회 구경 가세!', '오늘은 누가 이기려나.', '길 좀 비키시오!', '남궁 공자 봤소?'], talk: async () => { await npcSay('구화성 사람', spr, nextLine('gw' + i, rot(T, i))); } }); });
    if (!night && step !== 'end') [[21.2, 20.6, 'Villager2'], [22.8, 21, 'Woman'], [26.9, 21, 'Villager4']].forEach(([x, y, spr], i) => out.npcs.push({ id: 'gs' + i, spr, x, y, dir: 1, life: 'watch', lively: 1, look: [25, 15], hint: '구경꾼', barks: ['베어라!', '막아, 막아!', '아이고, 아깝다!', '돈 걸었단 말이오!'], talk: async () => { await npcSay('구경꾼', spr, rot(['이번 판에 은자 열 냥 걸었소. 지면 마누라한테 맞아 죽소.', '저 칼 쓰는 품새 보시오. 어디서 배웠을까.', '작년 우승자는 첫판에 떨어졌소. 강호가 그렇소.'], i)[0]); } }));
    if (!night) out.npcs.push({ id: 'gpeddler', spr: 'Villager4', x: 14.5, y: 18.75, dir: 0, life: 'stroll', far: 14, speed: 14, hint: '떡장수', hawk: ['떡 사려, 떡!', '구경하면서 드시오!', '찹쌀떡이오!'], gap: [6, 11], talk: async () => { await npcSay('떡장수', 'Villager4', '대회 구경엔 떡이 최고요. 손에 안 묻고, 소리도 안 나고.'); if (!(await choice('떡장수다.', ['물건을 본다', '그만둔다']))) await ctx.shop('떡장수', [ctx.item.stuff('sweets', 30), ctx.item.stuff('rice_ball', 26), ctx.item.stuff('skewer', 50)]); } });
  }
  if (id === 'cheongha' && F.burned && !F.plague) {
    const T = ['그물 손질은 해 질 녘에 하는 거요. 낮엔 고기 잡고.', '객잔이 다시 섰으니 사람이 좀 돌아오겠지.', '나루에 배가 하루 두 번 들어오오. 놓치면 내일이오.'];
    [[22, 20], [30, 18]].slice(0, night ? 0 : 2).forEach(([x, y], i) => { const spr = ['Villager3', 'Woman'][i]; out.npcs.push({ id: 'cw' + i, spr, x: x + .5, y: y + .75, dir: 0, life: 'stroll', far: 16, enters: true, speed: 16, hint: '청하진 사람', barks: ['오늘 물때 좋네.', '바람이 차다.', '곽씨네 국수 먹으러 가야지.'], talk: async () => { await npcSay('청하진 사람', spr, nextLine('cw' + i, rot(T, i))); } }); });
  }
  return out;
}
function provider(id) {
  const out = { npcs: [], spots: [], trigs: [], roam: [] }, F = G.S?.flags; if (!F) return out;
  if (id.startsWith('r_') || id.startsWith('h_')) { if (ROOMS[id]) { G.jh.ensure(); roomNpcs(id, out); } return out; }
  const l = LOCS.find(q => q.map === id); if (!l) return out;
  if (G.S.mode !== 'free' && !F.world_open && G.after && G.after('c1a')) F.world_open = true;
  if (l.kind === 'old') { const hf = l.fac && G.free.fac(l.fac); if (hf && l.tutor && G.world.open() && !G.jh.hostile(hf.id)) out.npcs.push({ id: 'tutor', spr: 'GreenNinja', x: l.tutor[0], y: l.tutor[1], dir: 0, hint: '사범', talk: () => G.arts.tutor(hf) }); out.spots.push({ x: l.at[0] - 2.5, y: l.at[1] - 2, w: 3, h: 2.6, hint: '강호로 나간다', when: () => G.world.open(), act: async () => { const [x, y] = G.world.entry(id); Sound.sfx('select', .6); await ctx.warp('world', x, y, 0); } }); return out; }
  G.jh.ensure(); const town = l.style === 'town', chat = CHAT[l.style] || CHAT.town, folk = town ? ['Villager', 'Woman', 'Greenman', 'Villager2', 'Villager4', 'OldWoman', 'Villager3'] : ST[l.style].folk, R = fold(id);
  if (l.boat) out.npcs.push({ id: 'boat', spr: 'Villager3', x: town ? 33 : 26, y: town ? 44.5 : 62, dir: 2, hint: '뱃사공', talk: () => boatTalk(l) });
  if (town) {
    townNpcs(l, id, out, folk);
    out.npcs.push({ id: 'cboard', spr: 'Gaebang', x: 30, y: 15.5, dir: 0, hint: '일거리 묻기', talk: () => G.freeBoard0() }); return out;
  }
  const f = G.free?.fac(l.fac); if (!f) return out;
  if (G.jh.fallen(f.id)) { out.npcs = [{ id: 'ash', spr: 'Villager', x: 23, y: 44, dir: 0, hint: '잿더미를 치우는 사람', talk: () => G.jh.rebuild(f) }]; return out; }
  if (G.jh.hostile(f.id)) { out.trigs.push({ x: 20, y: 56, w: 6, h: 4, when: () => !G.S.daily['gate_' + f.id], run: async () => { G.S.daily['gate_' + f.id] = 1; await G.jh.gate(f); } }); return out; }
  // 문지기, 일하는 외문 제자, 연무장에서 수련하는 제자들, 사범. 밤에는 수련을 쉬고 일꾼도 줄어든다
  const T = TALK[l.fac] || {}, reg = REG[l.fac] || 'hap', name = f.group === '세가' || f.group === '오대세가' ? '가솔' : '제자', night = G.S.flags.night, fart = FACEART[f.id];
  const pool = (role, base) => [...ctxLines(f, role), ...(base || chat)];
  const gateName = `${f.name} 문지기`;
  out.npcs.push({ id: 'gate1', spr: folk[0], x: 19.6, y: 62, dir: 0, dir0: 0, hint: '문지기', greet: GREET[reg], talk: async () => { await npcSay(gateName, folk[0], nextLine(id + 'g1', pool('gate', T.gate)), fart); await gateAsk(f, l, gateName, folk[0], fart); } },
    { id: 'gate2', spr: folk[1 % folk.length], x: 26.4, y: 62, dir: 0, dir0: 0, hint: '문지기', barks: () => night ? SLEEPY : null, talk: async () => { await npcSay(gateName, folk[1 % folk.length], nextLine(id + 'g2', [`어른들은 맨 위 ${FEAT[l.fac]?.[0] || '본전'}에 계십니다. 연무장을 지나 곧장 올라가십시오.`, ...(T.gate || []).slice().reverse()]), fart); } });
  [[17, 50], [28, 50], [12, 52], [34, 55]].slice(0, night ? 2 : 4).forEach(([x, y], i) => { const spr = folk[i % folk.length], w = T.work || chat; out.npcs.push({ id: `work${i}`, spr, x, y, dir: i % 4, life: i % 2 ? 'work' : 'wander', r: 2.2, hint: `외문 ${name}`, barks: () => night ? SLEEPY : T.bark, talk: async () => { await npcSay(`외문 ${name}`, spr, nextLine(id + 'w' + i, pool('work', w.slice(i % w.length).concat(w.slice(0, i % w.length)))), fart); } }); });
  if (!night) for (let r = 0; r < 2; r++) for (let c = 0; c < 6; c++) { const spr = folk[(r + c) % folk.length], k = r * 6 + c; out.npcs.push({ id: `drill${r}${c}`, spr, x: YARD.x + 3.5 + c * 4.6, y: YARD.y + 6 + r * 3.4, dir: 1, drill: 1, hint: name, barks: k % 4 ? null : SHOUT[reg], talk: async () => { const d = T.drill || chat; await npcSay(`수련하는 ${name}`, spr, nextLine(id + 'd' + k, d.slice(k % d.length).concat(d.slice(0, k % d.length))), fart); } }); }
  [[22.5, 48.75], [23.5, 16.75]].slice(0, night ? 1 : 2).forEach(([x, y], i) => { const spr = folk[(i + 2) % folk.length], w = T.work || chat; out.npcs.push({ id: `walk${i}`, spr, x, y, dir: 0, life: 'stroll', far: 22, speed: 20, hint: name, barks: () => night ? SLEEPY : T.bark, talk: async () => { await npcSay(`${f.name} ${name}`, spr, nextLine(id + 'k' + i, pool('work', rot(w, i + 1))), fart); } }); });
  out.npcs.push({ id: 'tutor', spr: folk[0], x: YARD.x + YARD.w / 2 + 1.5, y: YARD.y + 4, dir: 0, dir0: 0, life: night ? 'idle' : 'wander', r: 1.6, hint: '사범', barks: night ? null : COACH[reg], talk: () => G.arts.tutor(f) });
  return out;
}
function init() {
  Story.providers.push(provider, ambient);
  for (const id in MAPS) { const m = MAPS[id]; if (!m.room && id !== 'world' && id !== 'mysect' && !id.startsWith('b_') && !id.startsWith('c_')) autoDoors(m, { id, name: m.name, style: 'town', map: id }); }
  MAPS.hwasan?.exit(29, 9, 1, 5, 'b_hwasan', 1.5, 32, 3);
  for (const l of LOCS) if (l.kind === 'old' && MAPS[l.map]) { const m = MAPS[l.map], n = m.stamps.length; m.put('signpost', Math.floor(l.at[0] - 1.5), Math.floor(l.at[1] - 1.5), { nosolid: true }); if (m.objs) m.objs.push(m.stamps[n]); }
}
G.base = { make, init, folk: l => l && ST[l.style] ? ST[l.style].folk : null, spot: id => id.startsWith('c_') ? [31, 19] : [31, 34] };
