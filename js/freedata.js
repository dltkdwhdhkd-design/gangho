// 자유 모드 자료: 세력, 직위, 임무 문구
export const RANKS = {
  구파일방: ['외문 제자', '내문 제자', '진전 제자', '장로', '장문인'],
  오대세가: ['식객', '가신', '내원 무사', '원로', '가주'],
  신흥: ['외문 제자', '내문 제자', '대사형', '검각주', '문주'],
  사파: ['졸개', '행동대', '두령', '부두목', '수장'],
  마교: ['신도', '교도', '향주', '당주', '교주'],
  개방: ['일결 제자', '삼결 제자', '오결 제자', '칠결 장로', '방주'],
};
export const RANK_MERIT = [0, 120, 350, 800, 1600];
export const RANK_LV = [1, 8, 16, 26, 34];
// 사파와 마교, 창운문. 구파일방과 오대세가는 clandata의 CLANS를 함께 쓴다
export const EXTRA = [
  { id: 'changun', group: '신흥', align: 'jeong', name: '창운문', who: '고진', key: 'go', spr: 'Inspector', tier: 1, wpn: 'Sword', moves: ['double', 'cloud_flash', 'swallow_qi', 'wind_turn'], gift: ['cloud_flash', 'flow_three', 'swallow_qi', 'wind_turn'], heart: 'tonap', at: ['cloudmt', 22.5, 19], desc: '구파일방 바로 아래 자리를 넘보는 신흥 문파. 외문 출신도 실력만 있으면 위로 올라간다.' },
  { id: 'nokrim', group: '사파', align: 'sa', name: '녹림 칠십이채', who: '구양철', key: 'guyang', spr: 'Caveman2', tier: 2, wpn: 'Axe', moves: ['heavy', 'break_mount', 'earth_stomp', 'mad_wind'], gift: ['break_mount', 'blood_fan', 'mad_wind'], heart: 'fury', at: ['fort', 13, 21], desc: '산을 먹고 사는 산채들의 연합. 칼 쥔 사람보다 밭 뺏기고 올라온 사람이 많다.' },
  { id: 'janggang', group: '사파', align: 'sa', name: '장강수로채', who: '오강', key: 'ogang', spr: 'Villager3', tier: 2, wpn: 'Lance', moves: ['one_point', 'sweep_army', 'dragon_pass', 'lunge'], gift: ['one_point', 'dragon_pass', 'sweep_army'], heart: 'iron_shirt', at: ['fort', 23, 19], desc: '장강 뱃길을 쥔 큰 수적. 뜯고 나서 배가 뒤집히면 건져는 준다.' },
  { id: 'haomun', group: '사파', align: 'sa', name: '하오문', who: '만화부인', key: 'manhwa', spr: 'Woman', tier: 2, wpn: 'Ninjaku', moves: ['quick', 'dart3', 'blink', 'flurry'], gift: ['dart', 'tagu'], heart: 'swift', at: ['fort', 23, 15], desc: '도박장과 기루, 도둑들의 소문망. 싸움보다 장사를 좋아한다.' },
  { id: 'odok', group: '사파', align: 'sa', name: '오독문', who: '남화', key: 'namhwa', spr: 'Woman', tier: 2, wpn: 'Ninjaku', moves: ['venom', 'spit', 'quick', 'blink'], gift: ['dart', 'kongtong'], heart: 'fury', at: ['fort', 13, 17.5], desc: '독을 쓰는 문파. 독이 나왔다 하면 다들 이쪽부터 쳐다본다.' },
  { id: 'hyeoleui', group: '사파', align: 'sa', name: '혈의방', who: '혈수 막고', key: 'makgo', spr: 'RedNinja', tier: 3, wpn: 'Ninjaku', moves: ['flurry', 'blink', 'dart3', 'lunge'], gift: ['dart', 'blood_fan', 'mad_wind'], heart: 'swift', at: ['fort', 8, 18], desc: '돈을 받고 사람을 죽이는 살수들. 말이 없다.' },
  { id: 'cheonma', group: '마교', align: 'ma', name: '천마신교', who: '혈마', key: 'hyeolma', spr: 'Skeleton', tier: 3, wpn: 'Axe', moves: ['venom', 'heavy', 'mad_wind', 'blink'], gift: ['blood_fan', 'mad_wind', 'break_mount'], heart: 'fury', at: ['shrine', 10, 7], desc: '서역에서 온 교단. 칼 찬 사람보다 밥 짓는 신도가 더 많다.' },
];
// 장로로 오르기 전 그 세력만의 일. lines는 [말하는 사람, 대사], foes는 q_ 적 종류
export const TRIALS = {
  shaolin: { lines: [['clan_shaolin', '아랫마을에 파계승 패거리가 시주를 뜯고 다니오. 소림 옷을 입고 말이오.'], ['clan_shaolin', '벌은 주되 죽이지는 마시오. 그래도 소림 밥을 먹은 사람들이오.']], kind: 'rogue', end: '패거리는 머리를 땅에 찧고 절로 돌아갔다. 혜각 대사가 그 사람들에게 내린 벌은 삼 년 동안 바닥 닦기였다.' },
  wudang: { lines: [['clan_wudang', '우리 제자 둘이 칼을 들고 마주 섰다더군. 누가 옳은지를 두고.'], ['clan_wudang', '대개 오래 걸리는 일이니 가서 끝내 주게. 둘 다 눕히면 빨리 끝나네.']], kind: 'guard', end: '둘 다 눕혔더니 그제야 서로를 부축했다. 청허 도장은 그게 태극이라고 했다.' },
  hwasan: { lines: [['clan_hwasan', '종남 애들이 화산 절벽길에 말뚝을 박았어. 내 땅에.'], ['clan_hwasan', '뽑아. 박은 놈들 앞에서.']], kind: 'guard', end: '말뚝을 뽑아서 종남 쪽으로 던졌다. 매향은 꽃이나 보러 가자고 했다.' },
  jongnam: { lines: [['clan_jongnam', '화산 애들이 또 절벽길을 막았소. 우리 말뚝을 뽑아 던졌다 하오.'], ['clan_jongnam', '다시 박으시오. 박을 때까지 비키지 마시오.']], kind: 'guard', end: '말뚝을 다시 박았다. 서문각은 흡족해했고 나는 이 일이 내년에도 있을 거라는 걸 알았다.' },
  emei: { lines: [['clan_emei', '산 밑 마을 처녀들이 팔려 간다는 소문이 있다. 인신매매하는 놈들이야.'], ['clan_emei', '다 잡아 와라. 다리는 부러뜨려도 된다.']], kind: 'rogue', end: '갇혀 있던 사람들을 풀어 주고 나니 해가 뜨고 있었다. 정혜 사태는 수고했다는 말 대신 밥을 더 퍼 주었다.' },
  gonryun: { lines: [['clan_gonryun', '설산 약초꾼들이 안 돌아왔소. 곰이라 하기엔 발자국이 사람 것이오.'], ['clan_gonryun', '눈 오기 전에 찾아 주시오.']], kind: 'bandit', end: '약초꾼들은 산적 굴에서 나무를 패고 있었다. 설봉자는 고맙다며 말없이 털옷 한 벌을 던져 주었다.' },
  gongdong: { lines: [['clan_gongdong', '칠상권 쓰는 법을 물어보는 놈이 있으면 내 앞에 데려와라. 아이고, 허리야.'], ['clan_gongdong', '요즘 비급을 베껴서 파는 놈이 있다더라. 그 책으로 연습하다 애들이 다친다.']], kind: 'rogue', end: '가짜 비급 삼십 권을 태웠다. 막철심은 그중 한 권을 슬쩍 빼서 읽더니 자기 것보다 낫다고 투덜거렸다.' },
  jeomchang: { lines: [['clan_jeomchang', '셋.'], ['me', '셋이요?'], ['clan_jeomchang', '서쪽 고개. 쾌검 쓰는 놈들. 내 이름을 팔고 있다.']], kind: 'rogue', end: '돌아와서 끝났다고 했더니 섭일은 고개만 한 번 끄덕였다. 그날 저녁 내 방 앞에 짧은 검 한 자루가 놓여 있었다.' },
  cheongseong: { lines: [['clan_cheongseong', '차 한잔 하시오. 찻잎 싣고 오던 수레가 털렸소.'], ['clan_cheongseong', '찻잎은 찾아 주시오. 도둑은 차 한잔 먹이고 보내도 좋소.']], kind: 'bandit', end: '찻잎을 찾아왔다. 진다명은 잎 한 장을 씹어 보더니 비를 맞았다며 한숨을 쉬었다.' },
  gaebang: { lines: [['clan_gaebang', '거지 깃발 들고 관아에 뒷돈 받는 놈이 있다. 우리 쪽 사람이야.'], ['clan_gaebang', '밥은 먹여서 내쫓아라. 그게 개방 법이다.']], kind: 'rogue', end: '그 사람 앞에 국밥 한 그릇을 놓고 타구봉을 받아 왔다. 홍두 장로는 호리병만 흔들고 아무 말도 안 했다.' },
  namgung: { lines: [['clan_namgung', '남궁세가 이름으로 빚을 놓고 다니는 놈이 있다.'], ['clan_namgung', '찾아서 문서를 불태워라. 내 이름으로 하는 일이다. 대충 하지 마라.']], kind: 'rogue', end: '문서를 태우는데 빚진 사람들이 멀리서 보고 있었다. 남궁진은 그 얘기를 듣고 잘했다는 말 없이 검을 한 번 더 휘둘렀다.' },
  moyong: { lines: [['clan_moyong', '모용가에서 받은 것을 돌려주지 않는 사람이 있소.'], ['clan_moyong', '가서 돌려받으시오. 칼로 받았으면 칼로, 말로 받았으면 말로.']], kind: 'guard', end: '칼로 돌려받았다. 모용설은 장부 같은 것을 펴더니 한 줄을 지웠다.' },
  jegal: { lines: [['clan_jegal', '계산이 맞지 않는 곳이 하나 있습니다. 세가 창고의 쌀이 일곱 섬 빕니다.'], ['clan_jegal', '범인은 셋 중 하나입니다. 다 잡아 오시면 계산이 빠릅니다.']], kind: 'bandit', end: '셋 다 잡아 왔더니 제갈현이 부채로 한 사람을 가리켰다. 처음부터 알고 있었던 것 같았다.' },
  dang: { lines: [['clan_dang', '독고에서 약 하나가 없어졌어요. 그걸 사람한테 쓰면 곤란해요.'], ['clan_dang', '훔쳐 간 놈이 입에 대기 전에 찾아요. 대고 나면 찾을 필요도 없고요.']], kind: 'rogue', end: '약병은 입도 안 뗀 채로 돌아왔다. 당소연은 병을 흔들어 보더니 아까워하는 얼굴을 했다.' },
  paeng: { lines: [['clan_paeng', '하하! 팽가 방계 애들이 본가 애들한테 맞고 다닌다더라!'], ['clan_paeng', '네가 가서 다 패라! 방계 쪽이든 본가 쪽이든 다 패고 같이 밥 먹여라!']], kind: 'guard', end: '다 패고 밥을 먹였다. 팽대악이 그날 술값을 냈다.' },
  changun: { lines: [['go', '장서각 열쇠가 또 없어졌다. 검각에 있던 놈들 중 하나일 거다.'], ['go', '찾아와라. 사람은 어깨부터 쳐라.']], kind: 'rogue', end: '어깨부터 쳤다. 열쇠는 그 사람 신발 밑창에 있었다.' },
  nokrim: { lines: [['guyang', '옆 산채 놈들이 우리 애들 쌀을 털었다.'], ['guyang', '찾아와라. 쌀만. 사람은 굶었으면 그럴 수도 있다.']], kind: 'bandit', end: '쌀 두 섬을 지고 돌아왔다. 구양철은 한 섬을 도로 돌려보내라고 했다.' },
  janggang: { lines: [['ogang', '내 뱃길에서 함부로 세금 걷는 놈들이 나왔다. 정천맹 옷을 입었는데 가짜다.'], ['ogang', '물에 빠뜨려라. 건져 주지는 말고.']], kind: 'pirate', end: '다 물에 빠뜨렸다. 그래도 건져 주는 게 법이라고 해서 오강이 투덜거리며 밧줄을 던졌다.' },
  haomun: { lines: [['manhwa', '소문 하나를 찾아와요. 내가 판 적 없는 소문이 돌아다니거든요.'], ['manhwa', '누가 내 장사를 흉내 내는지 보고, 값을 치르게 해요.']], kind: 'rogue', end: '가짜 소문을 팔던 사람은 하오문 값을 치르고 나서 하오문 사람이 되었다. 만화부인은 싸게 샀다고 좋아했다.' },
  odok: { lines: [['namhwa', '누가 또 오독문 이름으로 독을 팔아요. 그 독에 사람이 죽으면 또 우리 탓이에요.'], ['namhwa', '찾아서 입에 넣어 줘요. 제 독이 아니면 뭔지 궁금하니까요.']], kind: 'rogue', end: '독 장수는 자기 독을 먹기 전에 다 불었다. 남화는 그 독을 손끝에 찍어 보고 웃었다.' },
  hyeoleui: { lines: [['makgo', '방 안에 배신자.'], ['me', '누군데요?'], ['makgo', '이름을 대면 일이 끝납니다. 찾으십시오.']], kind: 'rogue', end: '끝났다고 보고했다. 막고는 고개를 끄덕였고 다음 날부터 방에서 내 자리가 하나 앞으로 옮겨졌다.' },
  cheonma: { lines: [['hyeolma', '분타 쌀독에 손을 대는 놈이 있다. 신도들이 굶어.'], ['hyeolma', '찾아서 제단 앞에 세워라.']], kind: 'rogue', end: '쌀 도둑은 굶는 신도의 아비였다. 혈마는 그 얘기를 듣고 쌀 한 말을 더 내주라고 했다. 이유는 말하지 않았다.' },
};
// 임무 문구. {p}는 장소, {r}은 맞서는 세력
export const JOBS = {
  jeong: [
    ['hunt', '산적 토벌', '{p}에 산적이 자리를 잡았다. 장꾼들이 길을 못 다닌다고 한다.', 'bandit'],
    ['hunt', '흉수 추적', '사람을 해치고 달아난 자가 {p}에 숨었다.', 'rogue'],
    ['hunt', '수적 소탕', '{p} 물가에서 배가 털렸다. 수적들을 쫓아 보내라.', 'pirate'],
    ['escort', '상단 호위', '{p}에 닿은 상단이 사람을 기다린다. 가서 다음 길까지 지켜 줘라.', 'bandit'],
    ['deliver', '서찰 전달', '{p}에 있는 사람에게 서찰을 전해라. 내용은 묻지 말고.', 'rogue'],
    ['spar', '타문 비무', '{r} 제자가 우리를 얕본다고 떠들고 다닌다. {p}에서 만나 꺾어 줘라.', 'guard'],
    ['gather', '약재 납품', '창고에 약초가 떨어졌다. 약초를 모아 와라.', 'herb', 5],
    ['gather', '철광 납품', '병기창에 쇠가 모자란다. 철광을 구해 와라.', 'ore_iron', 3],
    ['gather', '가죽 납품', '겨울옷을 지어야 한다. 가죽을 구해 와라.', 'hide', 3],
  ],
  sa: [
    ['raid', '상단 털기', '{p}로 비단 실은 상단이 지나간다는 소문이다. 호위가 붙어 있다.', 'guard'],
    ['extort', '자릿세 걷기', '{p} 장사꾼들이 이번 달 자릿세를 안 냈다. 받아 와라.', 'guard'],
    ['assassin', '청부', '{p}에 숨어 사는 표적이 있다. 은자는 이미 받았다.', 'rogue'],
    ['hunt', '영역 다툼', '{r} 놈들이 {p}에서 우리 사람을 건드렸다.', 'guard'],
    ['deliver', '밀서 운반', '{p}로 밀서를 나른다. 관군 눈에 띄지 마라.', 'guard'],
    ['gather', '말린 고기', '산채 애들이 굶는다. 고기를 구해 와라.', 'meat', 4],
  ],
  ma: [
    ['hunt', '이단 처단', '{p}에서 교단을 욕보이는 무리가 나왔다.', 'guard'],
    ['escort', '신도 호송', '서역에서 온 신도들이 {p}에서 기다린다. 데려와라.', 'guard'],
    ['assassin', '밀정 제거', '{r}의 밀정이 {p}에 있다. 입을 막아라.', 'rogue'],
    ['raid', '성물 회수', '{p}를 지나는 수레에 교단 성물이 실려 있다.', 'guard'],
    ['gather', '제단 약초', '제단에 올릴 약초가 필요하다.', 'herb', 5],
  ],
  free: [
    ['hunt', '현상범 잡기', '{p}에 현상금이 붙은 자가 나타났다고 한다.', 'rogue'],
    ['hunt', '산적 쫓기', '{p} 사람들이 돈을 모았다. 산적 좀 쫓아 달라고 한다.', 'bandit'],
    ['escort', '짐꾼 호위', '{p}까지 가는 짐꾼이 호위를 찾는다.', 'bandit'],
    ['deliver', '보따리 배달', '{p}에 사는 사람에게 보따리를 전해 달란다. 삯은 넉넉하다.', 'rogue'],
    ['gather', '약초 구함', '약방에서 약초를 비싸게 쳐 준다고 한다.', 'herb', 4],
    ['gather', '생선 구함', '객잔에서 쓸 민물고기를 구한다고 한다.', 'f_crucian', 3],
  ],
};
export const WAR_JOB = ['war', '전선 지원', '{r}와의 싸움이 {p}까지 번졌다. 가서 우리 쪽을 받쳐라.', 'guard'];
// 빠른 이동. 도착 자리와 등급(높을수록 위험)
export const PLACES = {
  cheongha: { name: '청하진', at: [22.5, 25], t: 1 }, valley: { name: '청풍골', at: [35, 15.5], t: 1 }, bamboo: { name: '죽림', at: [18, 29], t: 1 },
  pass: { name: '동쪽 산길', at: [3, 12.5], t: 2 }, cloudmt: { name: '창운산', at: [22.5, 33], t: 2 }, fort: { name: '흑풍채', at: [3, 13], t: 3 },
  guhwa: { name: '구화성', at: [24.5, 29], t: 3 }, ninehall: { name: '구파 회관', at: [3, 10.5], t: 3 }, fiveclans: { name: '세가 거리', at: [37, 12.5], t: 3 },
  shaolin: { name: '소림사', at: [19.5, 26], t: 4 }, hwasan: { name: '화산', at: [22, 11.5], t: 4 }, wolha: { name: '월하곡', at: [22, 37], t: 6 },
  silk: { name: '비단길', at: [41, 15.5], t: 5 }, oasis: { name: '사주성', at: [40, 15.5], t: 5 }, snowpeak: { name: '천산 설원', at: [22, 30], t: 6 }, tiangate: { name: '천산 문', at: [22, 30], t: 7 },
};
export const SURNAME = '김이박최정강조윤장임한오서신권황안송류전홍고문양손배백허유남심노하곽성차주우구민'.split('');
export const GIVEN = ['철수', '대길', '복동', '만수', '길수', '덕구', '춘삼', '삼돌', '기철', '석구', '용팔', '달수', '영식', '태복', '칠성', '돌쇠', '수남', '갑성', '판석', '천복', '연화', '소영', '봄이', '옥분', '금순', '말자', '향이', '미령', '선녀', '설화'];
