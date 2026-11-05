// 문파 본거지와 도시. 처음 들어갈 때 만든다
import { G, Sound, toast, josa, pick } from './core.js';
import { Story, ctx, say, narr, choice } from './ctx.js';
import { WHO } from './dialog.js';
import { MAPS, makeMap } from './maps.js';
import { LOOT } from './items.js';
import { learn } from './state.js';
import { LOCS } from './worlddata.js';
import { EXTRA } from './freedata.js';
import { CLANS } from './clandata.js';

const NEW = EXTRA.filter(f => f.hi); NEW.forEach(f => { WHO[f.key] = { name: f.who, face: f.spr }; });
const ST = {
  temple: { biome: 'grass', bgm: 'temple', arena: 'court', wall: 'wall_h', trees: ['tree_round', 'grove_green'], side: 'lodge', small: 'hut_o2', deco: ['statue_big', 'plum_w'], folk: ['Monk', 'Monk2'], ban: 'banner3' },
  dao: { biome: 'deep', bgm: 'mystic', arena: 'forest', wall: 'wall_h', trees: ['tree_pine', 'grove_pine'], side: 'lodge', small: 'wood_o', deco: ['plum', 'statue'], folk: ['OldMan', 'BlueNinja', 'Villager'], ban: 'banner5' },
  peak: { biome: 'snow', bgm: 'mystic', arena: 'snow', ambient: 'snow', wall: 'wood_h', trees: ['tree_snow', 'grove_white'], side: 'lodge', small: 'wood_b', deco: ['boulder_w', 'tree_white'], folk: ['Eskimo', 'EskimoNinja'], ban: 'banner5' },
  manor: { biome: 'grass', bgm: 'story', arena: 'yard', wall: 'wall_h', trees: ['tree_round', 'plum_o'], side: 'house_red', small: 'shop_green', deco: ['plum', 'pot'], folk: ['Knight', 'Noble', 'Villager4'], ban: 'banner1' },
  water: { biome: 'sand', bgm: 'road', arena: 'village', wall: 'fence_h', trees: ['tree_dead', 'bush3'], side: 'wood_b', small: 'wood_o', deco: ['jar', 'log'], folk: ['Villager3', 'Villager2'], water: true, ban: 'banner6' },
  fort: { biome: 'dusk', bgm: 'dungeon', arena: 'fort', wall: 'wood_h', trees: ['tree_dead', 'grove_dead'], side: 'wood_b', small: 'mud', deco: ['boulder_b', 'jar'], folk: ['DarkNinja', 'RedNinja', 'Caveman'], ban: 'banner7' },
  dark: { biome: 'dusk', bgm: 'curse', arena: 'moon', tint: 'rgba(60,8,30,.28)', wall: 'wall_h', trees: ['tree_dead', 'grove_dead'], side: 'lodge', small: 'mud', deco: ['statue_big', 'boulder_b'], folk: ['Skeleton', 'RedNinja2', 'MaskedNinja'], ban: 'banner7' },
  slum: { biome: 'sand', bgm: 'good', arena: 'village', wall: 'fence_h', trees: ['tree_dead', 'bush3'], side: 'straw', small: 'mud', deco: ['jar', 'log'], folk: ['Gaebang', 'Villager2', 'Boy'], ban: 'banner2' },
  ice: { biome: 'snow', bgm: 'mystic', arena: 'snow', ambient: 'snow', tint: 'rgba(120,170,230,.14)', wall: 'wall_h', trees: ['tree_snow', 'boulder_w'], side: 'lodge', small: 'wood_b', deco: ['boulder_w', 'statue'], folk: ['Eskimo', 'Cavegirl'], water: true, ban: 'banner5' },
  west: { biome: 'sand', bgm: 'temple', arena: 'sand', wall: 'wall_h', trees: ['tree_dead', 'boulder'], side: 'clay', small: 'clay', deco: ['statue_big', 'pot'], folk: ['Monk2', 'Master'], ban: 'banner3' },
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
function layout(m, l, st) {
  const R = fold(l.id), w = st.wall;
  m.border(st.trees, [[17, 27, 6, 3]], 3);
  if (st.water) { m.water(1, 20, 15, 6); m.water(25, 20, 14, 6); }
  m.road(18, 9, 18, 29, 4); m.fill(9, 9, 22, 7, 3);
  if (l.style === 'fort' || l.style === 'slum') { m.put('lodge', 18, 2); } else m.put('hall', 18, 1);
  m.put(st.side, 7, 2); m.put(st.side, 29, 2); m.put(st.small, 4, 12); m.put(st.small, 32, 12);
  if (!st.water) { m.put(st.small, 7, 19); m.put(st.side, 29, 19); }
  m.put(st.ban, 15, 7); m.put(st.ban, 24, 7); m.put(st.ban, 15, 16); m.put(st.ban, 24, 16);
  const dk = (i) => st.deco[i % st.deco.length]; m.put(dk(0), 11, 7); m.put(dk(0), 27, 7); m.put(dk(1), 12, 17); m.put(dk(1), 26, 17);
  m.row(w, 2, 25, 16); m.row(w, 22, 25, 16); m.col(w, 2, 1, 24); m.col(w, 37, 1, 24); m.put('gate_arch', 18, 23, { nosolid: true });
  m.put('f_dummy', 11, 11); m.put('f_dummy', 28, 11);
  if (R() < .5) m.scatter(['flower1', 'flower2', 'fern1'], 14, 3); else m.scatter(['fern1', 'fern2', 'bush2'], 12, 5);
}
function townLayout(m, l) {
  m.border(['tree_round', 'grove_green'], [[17, 27, 6, 3]], 3);
  m.road(18, 2, 18, 29, 4); m.road(2, 14, 37, 14, 4); m.fill(11, 10, 18, 11, 3);
  m.put('house_red', 3, 3); m.put('shop_blue', 9, 4); m.put('lodge', 14, 2); m.put('shop_green', 23, 4); m.put('hut_b', 28, 3); m.put('hut_o', 33, 3);
  m.put('wood_b', 3, 19); m.put('clay', 8, 20); m.put('hut_o2', 12, 21); m.put('wood_o', 24, 20); m.put('shop_blue', 29, 20); m.put('hut_b', 33, 21);
  m.put('banner2', 11, 8); m.put('banner1', 28, 8); m.put('statue', 19, 8, { dx: 2 }); m.put('pot', 13, 21); m.put('jar', 27, 21); m.put('awning', 12, 9, { nosolid: true }); m.scatter(['flower1', 'fern1'], 10, 4);
}
function make(id) {
  const l = LOCS.find(q => q.map === id); if (!l) { console.warn('없는 지도', id); return; }
  const st = l.style === 'town' ? { biome: l.px[1] > 480 ? 'grass' : 'sand', bgm: 'good', arena: 'village' } : ST[l.style], m = makeMap(id, 40, 30, { name: l.name, bgm: st.bgm, biome: st.biome, arena: st.arena, ambient: st.ambient, tint: st.tint });
  if (l.style === 'town') townLayout(m, l); else layout(m, l, st);
  const [wx, wy] = G.world.entry(id); m.exit(18, 29, 4, 1, 'world', wx, wy, 0);
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
function provider(id) {
  const out = { npcs: [], spots: [], trigs: [], roam: [] }, l = LOCS.find(q => q.map === id), F = G.S?.flags; if (!l || !F) return out;
  if (G.S.mode !== 'free' && !F.world_open && G.after && G.after('c1a')) F.world_open = true;
  if (l.kind === 'old') { out.spots.push({ x: l.at[0] - 2.5, y: l.at[1] - 2, w: 3, h: 2.6, hint: '강호로 나간다', when: () => G.world.open(), act: async () => { const [x, y] = G.world.entry(id); Sound.sfx('select', .6); await ctx.warp('world', x, y, 0); } }); return out; }
  const chat = CHAT[l.style], folk = l.style === 'town' ? ['Villager', 'Woman', 'Noble', 'Villager2', 'Boy'] : ST[l.style].folk, R = fold(id), spots = l.style === 'town' ? [[13, 12], [26, 12], [20, 18], [9, 15], [31, 15]] : [[11, 13], [14, 14.5], [26, 13], [29, 14.5]];
  spots.forEach(([x, y], i) => { const line = chat[(i + Math.floor(R() * 3)) % chat.length]; out.npcs.push({ id: `folk${i}`, spr: folk[i % folk.length], x, y, dir: i % 3 === 0 ? 0 : i % 2 ? 2 : 3, hint: '말 걸기', talk: async () => { await say(null, line); } }); });
  if (l.boat) out.npcs.push({ id: 'boat', spr: 'Villager3', x: 24, y: 26.5, dir: 2, hint: '뱃사공', talk: () => boatTalk(l) });
  if (l.style === 'town') {
    out.npcs.push({ id: 'cshop', spr: 'Noble', x: 12, y: 17, dir: 3, hint: '저잣거리', talk: () => shopTalk(l) }, { id: 'cinn', spr: 'OldWoman', x: 27, y: 17, dir: 2, hint: '객잔', talk: () => innTalk(l) });
    if (G.S.mode === 'free') out.npcs.push({ id: 'cboard', spr: 'Gaebang', x: 20, y: 12, dir: 0, hint: '일거리 묻기', talk: () => G.freeBoard0() });
    return out;
  }
  const f = G.free?.fac(l.fac); if (!f || G.S.mode === 'free') { if (!f) return out; return out; }
  if (f.hi) out.npcs.push({ id: f.key, spr: f.spr, x: 20, y: 11.5, dir: 0, hint: f.name, talk: () => storyFac(f) });
  else out.npcs.push({ id: 'keeper', spr: folk[0], x: 16.5, y: 23, dir: 3, hint: '문지기', talk: async () => { await say(null, AWAY[f.group] || '어른은 지금 안 계십니다.'); } });
  return out;
}
function init() {
  Story.providers.push(provider);
  for (const l of LOCS) if (l.kind === 'old' && MAPS[l.map]) { const m = MAPS[l.map], n = m.stamps.length; m.put('signpost', Math.floor(l.at[0] - 1.5), Math.floor(l.at[1] - 1.5), { nosolid: true }); if (m.objs) m.objs.push(m.stamps[n]); }
}
G.base = { make, init };
