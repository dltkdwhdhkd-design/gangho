// 물건, 제작법, 물고기, 가구, 장신구, 무공 트리 자료
import { WEAPONS } from './data.js';

// 아이콘은 assets/items 파일 이름이거나 [시트, x, y, 폭, 높이]
const N = 'tiles/Nature', H = 'tiles/House';
const I = (name, icon, sell, kind, desc, o = {}) => ({ name, icon, sell, kind, desc, ...o });
export const DB = {
  // 재료
  ore_iron: I('철광석', [N, 2, 243, 11, 10], 6, '재료', '동쪽 산길 바위에서 캔다.'), ore_blue: I('청강석', [N, 18, 243, 11, 10], 16, '재료', '창운산 뒤에서 나는 푸른 돌.'), ore_star: I('운철', [N, 34, 243, 11, 10], 60, '재료', '하늘에서 떨어졌다는 쇠. 무척 귀하다.'),
  wood: I('목재', [N, 66, 128, 14, 14], 3, '재료', '청풍골에서 벤다.'), hide: I('가죽', 'Stamp', 8, '재료', '짐승 가죽.'), fur: I('모피', 'Stamp', 14, '재료', '부드러운 털가죽.'), meat: I('고기', 'Beaf', 7, '재료', '구워도 삶아도 좋다.'), feather: I('꿩 깃털', 'SeedLargeWhite', 5, '재료', '장식에 쓴다.'), antler: I('녹용', 'SeedBig3', 40, '재료', '노루에게서 얻는 귀한 약재.'),
  herb: I('약초', 'TeaLeaf', 4, '재료', '어디서나 나지만 쓸모가 많다.'), ginseng: I('산삼', 'SeedBig1', 90, '재료', '깊은 산에서 드물게 캔다.'), honey: I('석청', 'Honey', 18, '재료', '바위틈에 고인 꿀.'), shoot: I('죽순', 'SeedBig2', 5, '재료', '대숲에서 난다.'), venom: I('독주머니', 'SeedBig3', 12, '재료', '독사에게서 얻는다.'), rice: I('쌀', 'Nut', 3, '재료', '만물상에서 판다.'), noodlep: I('면', 'SeedLarge', 3, '재료', '만물상에서 판다.'), jade: I('옥돌', [N, 50, 243, 11, 10], 80, '재료', '가락지를 깎을 수 있는 맑은 돌.'),
  // 물고기
  f_crucian: I('붕어', 'Fish', 6, '물고기', '어디에나 있다.'), f_carp: I('잉어', 'Fish', 12, '물고기', '힘이 세다.'), f_catfish: I('메기', 'Fish', 14, '물고기', '수염이 멋지다.'), f_eel: I('장어', 'Fish', 26, '물고기', '몸에 좋다고들 한다.'), f_sweet: I('은어', 'Fish', 18, '물고기', '맑은 계곡에 산다.'), f_mandarin: I('쏘가리', 'Fish', 30, '물고기', '계곡의 호랑이.'), f_shrimp: I('민물새우', 'Shrimp', 9, '물고기', '국물을 내기 좋다.'), f_gold: I('금잉어', 'Fish', 80, '물고기', '구화성 연못의 귀한 물고기.'), f_sturgeon: I('철갑상어', 'Fish', 160, '물고기', '아주 드물다.'), f_moon: I('월광어', 'Fish', 400, '물고기', '달빛이 비치는 밤에만 잡힌다는 전설의 물고기.'),
  // 요리: 먹으면 전투 세 번 동안 효과
  noodle: I('곽씨 국수', 'Noodle', 20, '요리', '전투 세 번: 체력 +10%', { meal: { hp: 10 } }), rice_ball: I('주먹밥', 'Onigiri', 12, '요리', '전투 세 번: 내력 +10%', { meal: { mp: 10 } }), skewer: I('고기 꼬치', 'Yakitori', 24, '요리', '전투 세 번: 공격력 +8%', { meal: { atk: 8 } }), fish_soup: I('매운탕', 'Noodle', 40, '요리', '전투 세 번: 체력 +15%, 공격력 +5%', { meal: { hp: 15, atk: 5 } }), eel_rice: I('장어구이', 'Sushi', 60, '요리', '전투 세 번: 공격력 +12%, 치명타 +4%', { meal: { atk: 12, crit: 4 } }), shoot_rice: I('죽순밥', 'Onigiri', 30, '요리', '전투 세 번: 내력 회복 +40%', { meal: { regen: 40 } }), ginseng_soup: I('삼계탕', 'Noodle', 150, '요리', '전투 세 번: 체력 +25%, 내력 +20%', { meal: { hp: 25, mp: 20 } }), moon_feast: I('월하 진미', 'Sushi', 600, '요리', '전투 세 번: 공격력 +20%, 체력 +20%, 쿨타임 -10%', { meal: { atk: 20, hp: 20, cd: -10 } }),
  // 선물
  tea: I('작설차', 'TeaLeaf', 30, '선물', '향이 맑은 찻잎.'), plum_wine: I('매화주', 'MilkPot', 50, '선물', '매화 향이 나는 술.'), hairpin: I('은비녀', 'SilverKey', 90, '선물', '작은 꽃이 달린 비녀.'), sachet: I('향낭', 'Hear', 40, '선물', '말린 꽃을 넣은 주머니.'), poem: I('시집', 'Letter2', 60, '선물', '읽다 보면 얼굴이 붉어진다.'), sweets: I('약과', 'Nut', 16, '선물', '달콤한 과자.'), jade_ring: I('옥가락지', 'Hear', 300, '선물', '혼인을 청할 때 쓰는 예물.'),
  // 전리품 보물
  gold_cup: I('금잔', 'GoldCup', 240, '보물', '팔면 값이 꽤 나간다.'), silver_cup: I('은잔', 'SilverCup', 120, '보물', '팔면 값이 나간다.'),
};
// 장신구: 비무 전리품. 한 번에 하나만 찬다.
const A = (name, desc, fx) => ({ name, desc, fx });
export const ACCS = {
  a_beads: A('항마염주', '체력 +12%', { hp: 12 }), a_taiji: A('태극패', '내력 회복 +30%', { regen: 30 }), a_plum: A('매화향낭', '치명타 +8%', { crit: 8 }), a_jongnam: A('종남옥패', '방어 +8', { def: 8 }), a_emei: A('아미 불진', '금창약 효과 +30%', { potion: 30 }),
  a_kunlun: A('설련화', '내력 +15%', { mp: 15 }), a_gong: A('칠상부', '공격력 +10%, 체력 -5%', { atk: 10, hp: -5 }), a_diancang: A('경풍화', '이동 속도 +10%', { spd: 10 }), a_qing: A('청성 찻잔', '초식 내력 소모 -12%', { mpCost: -12 }), a_gae: A('거지 표주박', '타격 피해의 2%를 체력으로', { lifeHit: 2 }),
  a_nam: A('창궁 패옥', '공격력 +8%, 치명타 +4%', { atk: 8, crit: 4 }), a_mo: A('모용 동경', '튕겨내기 시간 +0.05초', { parry: .05 }), a_je: A('제갈 금낭', '쿨타임 -10%', { cd: -10 }), a_dang: A('벽독주', '평타에 약한 독이 묻는다', { venom: 1 }), a_paeng: A('호랑이 허리띠', '평타 피해 +14%', { basic: 14 }),
};
const W = (name, type, atk, spr, desc) => ({ name, type, atk, spr, desc });
Object.assign(WEAPONS, {
  black_sword: W('흑철검', '검', 24, 'Katana', '대장간에서 벼린 검은 쇠칼.'), black_blade: W('흑철도', '도', 27, 'BigSword', '묵직한 검은 칼.'), dragon_tooth: W('용아창', '창', 26, 'Lance2', '창날이 이빨처럼 휘었다.'), vajra_fist: W('금강권투', '권', 24, 'Club', '두드리면 종소리가 난다.'), star_sword: W('운철검', '검', 38, 'Rapier', '운철로 벼린 명검.'),
  w_hangma: W('항마권투', '권', 26, 'Club', '소림의 보물.'), w_zhenwu: W('진무검', '검', 27, 'Sword', '무당의 고검.'), w_plum: W('매화검', '검', 25, 'Rapier', '칼끝에서 꽃향기가 난다.'), w_jongnam: W('청봉검', '검', 24, 'Sword', '종남 검수의 애검.'), w_emei: W('아미자', '권', 24, 'Sai', '손에 끼는 짧은 쇠.'), w_kunlun: W('설봉창', '창', 26, 'Lance2', '창날에 서리가 앉아 있다.'), w_gong: W('칠상권투', '권', 28, 'Club', '끼면 손이 아프다.'), w_diancang: W('사일쾌검', '검', 26, 'Ninjaku', '가볍고 빠르다.'), w_qing: W('송풍검', '검', 24, 'Katana', '바람 소리가 난다.'), w_tagu: W('타구봉', '창', 24, 'Stick', '개를 때리는 막대기. 방주의 상징이다.'),
  w_namgung: W('창궁검', '검', 32, 'Rapier', '남궁의 가보.'), w_moyong: W('환영검', '검', 30, 'Katana', '빛에 따라 칼날이 사라진다.'), w_jegal: W('철우선', '권', 28, 'Sai', '쇠로 만든 깃털 부채.'), w_dang: W('독비수', '도', 27, 'Ninjaku', '칼날이 푸르다.'), w_paeng: W('오호대도', '도', 33, 'BigSword', '범 다섯 마리가 새겨진 대도.'),
});
// 세력별 전리품 세 가지
export const LOOT = { shaolin: ['w_hangma', 'a_beads', 'ginseng'], wudang: ['w_zhenwu', 'a_taiji', 'tea'], hwasan: ['w_plum', 'a_plum', 'plum_wine'], jongnam: ['w_jongnam', 'a_jongnam', 'silver_cup'], emei: ['w_emei', 'a_emei', 'sachet'], gonryun: ['w_kunlun', 'a_kunlun', 'ore_star'], gongdong: ['w_gong', 'a_gong', 'ore_blue'], jeomchang: ['w_diancang', 'a_diancang', 'silver_cup'], cheongseong: ['w_qing', 'a_qing', 'tea'], gaebang: ['w_tagu', 'a_gae', 'sweets'], namgung: ['w_namgung', 'a_nam', 'gold_cup'], moyong: ['w_moyong', 'a_mo', 'hairpin'], jegal: ['w_jegal', 'a_je', 'poem'], dang: ['w_dang', 'a_dang', 'venom'], paeng: ['w_paeng', 'a_paeng', 'meat'] };
// 제작법. at: forge 대장간, brew 약방, cook 부엌, bench 작업대
const R = (id, at, out, need, silver = 0) => ({ id, at, out, need, silver });
export const RECIPES = [
  R('rb1', 'forge', { weapon: 'black_sword' }, { ore_iron: 6, ore_blue: 2, wood: 2 }, 120), R('rb2', 'forge', { weapon: 'black_blade' }, { ore_iron: 8, ore_blue: 2, wood: 2 }, 120), R('rb3', 'forge', { weapon: 'dragon_tooth' }, { ore_iron: 6, ore_blue: 3, wood: 3 }, 120), R('rb4', 'forge', { weapon: 'vajra_fist' }, { ore_iron: 6, ore_blue: 3, hide: 2 }, 120), R('rb5', 'forge', { weapon: 'star_sword' }, { ore_star: 3, ore_blue: 5, wood: 2 }, 400),
  R('rj1', 'forge', { item: 'jade_ring' }, { jade: 2, ore_blue: 1 }, 80), R('rj2', 'forge', { item: 'hairpin' }, { ore_iron: 2, jade: 1 }, 20),
  R('br1', 'brew', { potion: 2 }, { herb: 3 }), R('br2', 'brew', { potion: 5 }, { herb: 5, honey: 1 }), R('br3', 'brew', { maxpotion: 1 }, { ginseng: 1, antler: 1, honey: 2 }, 100), R('br4', 'brew', { item: 'sachet' }, { herb: 2, feather: 1 }), R('br5', 'brew', { item: 'tea' }, { herb: 4 }), R('br6', 'brew', { item: 'plum_wine' }, { honey: 1, herb: 2, rice: 2 }),
  R('ck1', 'cook', { item: 'noodle' }, { noodlep: 2, meat: 1 }), R('ck2', 'cook', { item: 'rice_ball' }, { rice: 2 }), R('ck3', 'cook', { item: 'skewer' }, { meat: 2 }), R('ck4', 'cook', { item: 'fish_soup' }, { f_carp: 1, f_shrimp: 1, herb: 1 }), R('ck5', 'cook', { item: 'eel_rice' }, { f_eel: 1, rice: 1 }), R('ck6', 'cook', { item: 'shoot_rice' }, { shoot: 2, rice: 1 }), R('ck7', 'cook', { item: 'ginseng_soup' }, { ginseng: 1, meat: 2, rice: 1 }), R('ck8', 'cook', { item: 'moon_feast' }, { f_moon: 1, ginseng: 1, honey: 1 }), R('ck9', 'cook', { item: 'sweets' }, { honey: 1, rice: 1 }),
  R('bn1', 'bench', { furn: 'bed' }, { wood: 4, hide: 1 }), R('bn2', 'bench', { furn: 'table' }, { wood: 4 }), R('bn3', 'bench', { furn: 'stool' }, { wood: 1 }), R('bn4', 'bench', { furn: 'bookcase' }, { wood: 6 }), R('bn5', 'bench', { furn: 'dummy' }, { wood: 8, ore_iron: 2 }), R('bn6', 'bench', { furn: 'stove' }, { ore_iron: 3, wood: 2 }), R('bn7', 'bench', { furn: 'plum_tree' }, { wood: 2, herb: 3 }),
];
// 낚시터별 물고기: [물고기, 비중, 어려움(1~3)]
export const FISH = {
  river: [['f_crucian', 50, 1], ['f_carp', 28, 2], ['f_catfish', 14, 2], ['f_eel', 7, 3], ['f_moon', 1, 3]],
  stream: [['f_sweet', 44, 1], ['f_shrimp', 30, 1], ['f_mandarin', 22, 3], ['f_eel', 4, 3]],
  pond: [['f_carp', 50, 2], ['f_gold', 34, 2], ['f_sturgeon', 14, 3], ['f_moon', 2, 3]],
};
// 가구. score는 꾸밈 점수, act는 눌렀을 때 하는 일
const FU = (name, stamp, price, score, act) => ({ name, stamp, price, score, act });
export const FURN = {
  bed: FU('침상', 'f_bed', 60, 10, 'bed'), table: FU('긴 탁자', 'longtable', 40, 6), stool: FU('의자', 'f_stool', 10, 2), drawer: FU('서랍장', 'drawer', 50, 7), bookcase: FU('서가', 'bookcase', 80, 10, 'book'), shelf: FU('찬장', 'shelf2', 60, 7), plant: FU('화분', 'plant', 24, 5), jar: FU('장독', 'jar', 12, 2), lamp: FU('등잔', 'f_lamp', 30, 5), rack: FU('옷걸이', 'rack', 40, 5), scroll: FU('족자', 'f_scroll', 70, 9), chair: FU('큰 의자', 'f_chair', 120, 12),
  stove: FU('부뚜막', 'f_stove', 70, 8, 'cook'), bench: FU('작업대', 'f_bench', 90, 8, 'bench'), dummy: FU('목인장', 'f_dummy', 150, 12, 'dummy'), plum_tree: FU('분재 매화', 'f_bonsai', 200, 20), sword_rack: FU('병기대', 'rack2', 180, 14),
};
export const HOUSES = [null, { name: '초가집', w: 12, h: 9, price: 200 }, { name: '기와집', w: 16, h: 11, price: 900 }, { name: '대저택', w: 20, h: 13, price: 3000 }];

// 무공 트리: [아이디, 이름, 열, 행, 최대 단계, 단계당 효과, 앞선 칸, 설명]
const n = (id, name, c, r, max, fx, req, desc) => ({ id, name, c, r, max, fx, req, desc });
export const TREES = [
  { id: 'sword', name: '검', w: '검', nodes: [n('s1', '기본 검세', 1, 0, 3, { basic: 6 }, [], '평타 피해 +6%'), n('s2', '쾌검', 0, 1, 3, { basicSpeed: 5 }, ['s1'], '평타 속도 +5%'), n('s3', '검기성형', 2, 1, 1, { qi: 1 }, ['s1'], '평타 마지막 타에 검기가 나간다'), n('s4', '초식 정련', 0, 2, 3, { skill: 6 }, ['s2'], '초식 위력 +6%'), n('s5', '회심', 2, 2, 3, { crit: 3 }, ['s3'], '치명타 +3%'), n('s6', '검심통명', 1, 3, 2, { cd: -6 }, ['s4', 's5'], '쿨타임 -6%'), n('s7', '신검합일', 1, 4, 1, { ult: 30 }, ['s6'], '절초 위력 +30%')] },
  { id: 'blade', name: '도', w: '도', nodes: [n('b1', '묵직한 칼', 1, 0, 3, { basic: 8 }, [], '평타 피해 +8%'), n('b2', '호신강기', 0, 1, 1, { armorBasic: 1 }, ['b1'], '평타 마지막 타에 밀리지 않는다'), n('b3', '큰 휘두름', 2, 1, 3, { reach: 6 }, ['b1'], '평타 사거리 +6%'), n('b4', '혈기', 0, 2, 3, { killHeal: 4 }, ['b2'], '적을 쓰러뜨리면 체력 4% 회복'), n('b5', '파갑', 2, 2, 3, { poiseDmg: 20 }, ['b3'], '상대 자세를 20% 더 무너뜨린다'), n('b6', '광도', 1, 3, 2, { skill: 10 }, ['b4', 'b5'], '초식 위력 +10%'), n('b7', '일도양단', 1, 4, 1, { ult: 30 }, ['b6'], '절초 위력 +30%')] },
  { id: 'spear', name: '창', w: '창', nodes: [n('p1', '긴 손', 1, 0, 3, { reach: 7 }, [], '평타 사거리 +7%'), n('p2', '창세', 0, 1, 3, { basic: 6 }, ['p1'], '평타 피해 +6%'), n('p3', '기 끌어오기', 2, 1, 3, { mpHit: .6 }, ['p1'], '평타 적중 시 내력 추가 회복'), n('p4', '연환 찌르기', 0, 2, 3, { basicSpeed: 5 }, ['p2'], '평타 속도 +5%'), n('p5', '창막', 2, 2, 2, { def: 4 }, ['p3'], '방어 +4'), n('p6', '창신', 1, 3, 2, { skill: 9 }, ['p4', 'p5'], '초식 위력 +9%'), n('p7', '창룡출해', 1, 4, 1, { ult: 30 }, ['p6'], '절초 위력 +30%')] },
  { id: 'fist', name: '권', w: '권', nodes: [n('f1', '단련', 1, 0, 3, { basic: 6 }, [], '평타 피해 +6%'), n('f2', '연타', 0, 1, 3, { mpHit: .5 }, ['f1'], '평타 적중 시 내력 추가 회복'), n('f3', '철골', 2, 1, 3, { hp: 4 }, ['f1'], '체력 +4%'), n('f4', '흡기', 0, 2, 2, { lifeHit: 2 }, ['f2'], '피해의 2%를 체력으로'), n('f5', '불퇴', 2, 2, 1, { armorBasic: 1 }, ['f3'], '평타 마지막 타에 밀리지 않는다'), n('f6', '권심', 1, 3, 2, { skill: 9 }, ['f4', 'f5'], '초식 위력 +9%'), n('f7', '일권파산', 1, 4, 1, { ult: 30 }, ['f6'], '절초 위력 +30%')] },
  { id: 'inner', name: '심공', nodes: [n('i1', '토납', 1, 0, 3, { regen: 10 }, [], '내력 회복 +10%'), n('i2', '단전 확장', 0, 1, 3, { mp: 8 }, ['i1'], '내력 +8%'), n('i3', '경맥 소통', 2, 1, 3, { mpCost: -4 }, ['i1'], '내력 소모 -4%'), n('i4', '기혈 순환', 0, 2, 3, { hp: 5 }, ['i2'], '체력 +5%'), n('i5', '초식 숙달', 2, 2, 3, { skill: 4 }, ['i3'], '초식 위력 +4%'), n('i6', '대주천', 1, 3, 1, { cd: -8 }, ['i4', 'i5'], '쿨타임 -8%'), n('i7', '반박귀진', 1, 4, 1, { atk: 10, mp: 10 }, ['i6'], '공격력 +10%, 내력 +10%')] },
  { id: 'move', name: '신법', nodes: [n('m1', '가벼운 발', 1, 0, 3, { spd: 4 }, [], '이동 속도 +4%'), n('m2', '잔영', 0, 1, 2, { dashInv: .06 }, ['m1'], '경공 무적 시간 +0.06초'), n('m3', '연환보', 2, 1, 2, { dashCd: -.1 }, ['m1'], '경공 대기 -0.1초'), n('m4', '눈썰미', 0, 2, 2, { parry: .04 }, ['m2'], '튕겨내기 시간 +0.04초'), n('m5', '급소 노리기', 2, 2, 3, { critDmg: 12 }, ['m3'], '치명타 피해 +12%'), n('m6', '초상비', 1, 3, 1, { spd: 8 }, ['m4', 'm5'], '이동 속도 +8%'), n('m7', '이형환위', 1, 4, 1, { dashHit: 1 }, ['m6'], '경공으로 스친 적을 벤다')] },
];
