// 청하진 쿼터뷰: 강가 나루 마을. 큰길 두 줄(동서, 남북)과 광장은 정면 지도와 같은 자리라 이야기 속 사람 자리가 그대로 맞는다
// 가게(객잔, 대장간, 약방, 잡화점)는 울타리 없이 큰길을 보고 앉고, 살림집은 집과 마당을 울타리로 한 바퀴 둘러 문 앞만 튼다
// 큰길 서쪽 집은 문이 남동쪽, 동쪽 집은 남서쪽을 본다
import { Lay } from './isovil.js';

export function isoCheongha(m) {
  const L = new Lay(m, 7);
  // 큰길과 광장(사람들이 서는 자리). 칸 단위 길(g=1)은 걷기와 길 찾기에 쓰고, 칠할 때는 얼룩으로만 보인다
  L.open(0, 14.4, 46, 3.4).open(20.2, 0, 5.6, 28).open(18, 12.8, 10, 4.4).open(20, 25, 6, 4);
  L.keep(18.4, 22.6, 4.4, 3).keep(23, 17.6, 3, 2);  // 우물가 아이, 장로가 서는 자리
  // ── 가게 ──
  L.bld('inn', 19.4, 12.6, true, { to: 'inn', tx: 8, ty: 10 });
  L.bld('smithy', 8.6, 13.8, false, { to: 'smith', tx: 7, ty: 8 });
  L.bld('clinic', 32.8, 13.9, false, { to: 'clinic', tx: 7, ty: 8 });
  L.bld('store', 36.8, 21.6, false, { to: 'shop', tx: 6, ty: 7 });
  L.bld('tile_house', 27.4, 21.6, false, { to: 'bokun', tx: 7, ty: 8, when: 'bokun_open', lock: '낮에는 문이 잠겨 있다. 밤에만 불이 켜진다는 집이다.' });
  L.bld('ferry', 27.6, 27.6, false);
  // ── 살림집: 울타리 친 마당. 내 집이 될 초가를 먼저 앉히고, 나머지는 네 구역에 들어가는 만큼 ──
  L.home('thatch', 15.6, 22.6, true, { to: 'myhouse', tx: 6, ty: 7, when: 'own_house', lock: '비어 있는 집이다. 옆의 복덕방 영감에게 물어보자.', inside: ['woodpile', 'laundry'] });
  const PAL = [['thatch', 4, ['woodpile', 'laundry', 'jars', 'coop']], ['tile_house', 3, ['bench', 'jars', 'herbrack']], ['thatch_long', 2, ['woodpile', 'millstone', 'ricebags']], ['barn', 2, ['haystack', 'haystack', 'cart', 'coop']]];
  const Y = { yard: [4.2, 1, .6] }; L.pack([0.5, 0.6, 19.4, 13.6], PAL, Y).pack([26, 0.6, 19.6, 13.6], PAL, Y).pack([0.5, 17.9, 19.4, 10.8], PAL, Y).pack([26, 17.9, 19.6, 10.8], PAL, Y);
  L.bld('shrine', 41.8, 6.2, false);
  // ── 광장과 큰길가 ──
  L.iso('stall_fruit', 26.2, 18.6).iso('stall_pot', 17.6, 18.4, true).iso('bench', 29.8, 18.4).iso('ricebags', 35.4, 18.6).iso('crates', 16.4, 19.6);
  L.iso('woodpile', 14.6, 12.4).iso('ricebags', 13.2, 12.9).iso('crates', 3.4, 14.6).iso('laundry', 13.6, 26.6).iso('laundry', 16.2, 27.2).iso('crates', 12.2, 27.8).iso('cart', 39.6, 24.2, true).iso('crates', 33.6, 22.6);
  L.iso('well', 19.4, 24.2).put('tree_dead', 17.2, 22.2).iso('signpole', 24.2, 16.6).iso('signpole', 41.2, 13.8).iso('lamppost', 19.4, 11.2).iso('stall_meat', 29.4, 13.2, true).iso('millstone', 3.2, 16.8);
  L.iso('jars', 17.2, 12.8).iso('jars', 5.6, 14.6, true).iso('jars', 38.4, 14.6).iso('jars', 26, 25.2).iso('jars', 37.6, 22.8, true);
  // ── 집 사이 빈 땅: 장작, 짚더미, 궤짝, 독. 풀밭 가장자리엔 덤불과 꽃 ──
  const STUFF = ['woodpile', 'haystack', 'crates', 'ricebags', 'jars', 'jars', 'cart', 'coop'];
  L.litter([0.5, 0.6, 19.4, 13.6], STUFF, 7).litter([26, 0.6, 19.6, 13.6], STUFF, 7).litter([0.5, 17.9, 19.4, 10.8], STUFF, 6).litter([26, 17.9, 19.6, 10.8], STUFF, 6);
  L.litter([0, 0, 46, 29], ['tree_round', 'tree_round', 'plum_g', 'tree_big', 'plum'], 14, { sc: .8 }).litter([0, 0, 46, 29], ['bush1', 'bush2', 'bush3', 'fern1', 'flower1', 'flower2'], 30, { sc: 1 });
  // ── 나무: 마을 가장자리에 무리로, 강가에는 띄엄띄엄 ──
  L.grove(3, 2.5, 6, 2.6).grove(10.6, 1.2, 3, 1.4, ['tree_round', 'tree_big']).grove(25.4, 1.6, 3, 1.4, ['tree_round', 'plum_o']).grove(31.6, 1.6, 3, 1.6).grove(1.4, 8.8, 3, 1.4, ['tree_big', 'tree_round'])
    .grove(17.2, 1.4, 2, 1.2, ['tree_round', 'plum_g']).grove(44, 10, 3, 1.6).grove(44.4, 2.6, 3, 1.6, ['tree_round', 'plum'])
    .put('bush1', 3.2, 27.2).put('bush3', 14.6, 28.1).put('fern1', 25.8, 28.2).put('bush1', 30.4, 28.3).put('bush4', 38.6, 28.2).put('fern2', 44.2, 27.8).put('bush2', 6.2, 28.3)
    .grove(1.6, 19.6, 4, 2).grove(44.2, 21.4, 4, 1.8, ['tree_round', 'plum_g']).grove(18.6, 28, 2, 1.2, ['plum_g', 'tree_round']).grove(31.2, 28.2, 2, 1.2, ['tree_round', 'plum']);
  // ── 땅: 마을 안은 흙, 가장자리는 풀 ──
  L.dirt([[22.5, 15.5, 21, 6.5], [22.5, 18, 6, 11], [22.5, 6, 3.4, 8], [10, 10, 8, 6], [34, 10, 9, 6], [11, 23.5, 9, 5.5], [33, 23.5, 10, 5.5]]).blotch(.55);
  if (L.warn.length) console.warn('청하진 쿼터뷰', L.warn.join(' / '));
  m.layWarn = L.warn;
}
