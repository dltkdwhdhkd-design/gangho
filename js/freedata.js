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
// 전도에 새로 나온 세력
const N = (id, group, align, name, who, spr, tier, wpn, moves, gift, heart, desc, hi) => ({ id, group, align, name, who, key: 'clan_' + id, spr, tier, wpn, moves, gift, heart, at: ['b_' + id, 20, 11.5], desc, hi });
EXTRA.push(
  N('haenam', '문파', 'jeong', '해남파', '임해조', 'Samurai', 1, 'Sword', ['diancang', 'swallow_qi', 'double', 'lunge'], ['diancang', 'swallow_qi'], 'tonap', '남쪽 바다 섬에 있는 검문. 파도를 보고 칼을 배운다고 한다. 제자들 말로는 그냥 배가 자주 뒤집힌다.', '배 타고 왔소? 멀미를 안 했으면 칼도 들 만하겠군.'),
  N('cheonsan', '문파', 'jeong', '천산파', '고산옥', 'EskimoNinja', 2, 'Rapier', ['fall_flower', 'kunlun', 'flurry', 'blink'], ['fall_flower', 'kunlun'], 'jaha', '천마신교를 코앞에 두고 몇백 년을 버틴 검문. 사람이 적어서 장문인이 직접 장작을 팬다.', '장작 좀 들고 들어오지 그랬어. 여긴 손님도 일해.'),
  N('jeonjin', '문파', 'jeong', '전진교', '장양 진인', 'OldMan2', 2, 'Sword', ['zhongnan', 'taiji', 'double', 'swallow_qi'], ['zhongnan', 'taiji'], 'taecheong', '칼보다 계율을 먼저 가르치는 도관. 종남파와 같은 산을 나눠 쓰는 탓에 사이가 애매하다.', '술 냄새가 나는구려. 문 안에서는 참으시오.'),
  N('mosan', '문파', 'jeong', '모산파', '허정자', 'OldMan3', 1, 'Sword', ['palmun', 'emei', 'quick', 'dart3'], ['palmun', 'emei'], 'tonap', '부적을 쓰고 귀신을 쫓아 주며 먹고사는 도가 문파. 사람보다 귀신을 더 많이 상대했다고 자랑한다.', '어깨에 뭐가 붙었네. 아, 먼지요.'),
  N('jangbaek', '문파', 'jeong', '장백파', '박무산', 'GrayNinja', 1, 'Lance', ['one_point', 'sweep_army', 'lunge', 'heavy'], ['one_point', 'sweep_army'], 'iron_shirt', '장백산 눈길을 오르내리며 창을 익히는 문파. 산삼을 캐고 호랑이를 잡아 살림을 꾸린다.', '삼 캐러 왔으면 돌아가시오. 창 배우러 왔으면 들어오고.'),
  N('pota', '문파', 'jeong', '보타문', '자운 사태', 'Monk2', 1, 'Rapier', ['emei', 'ihwa', 'quick', 'swallow_qi'], ['emei', 'ihwa'], 'tonap', '남해 작은 섬의 비구니 문파. 어부들이 뱃길을 묻으러 오고, 해적들은 이 섬을 피해서 간다.', '배가 고프면 공양간으로 가시오. 칼을 들고 오셨으면 나와 얘기합시다.'),
  N('hwangbo', '세가', 'jeong', '황보세가', '황보웅', 'RedSamurai', 2, 'Club', ['iron_fist', 'chain_kick', 'heavy', 'lunge'], ['iron_fist', 'chain_kick'], 'iron_shirt', '권법 하나로 대를 이어 온 집안. 손님이 오면 술부터 내고, 술이 돌면 팔씨름부터 한다.', '손을 보니 일은 좀 해 봤군. 앉게, 술부터 하지.'),
  N('ak', '세가', 'jeong', '산동악가', '악정산', 'GoldKnight', 2, 'Lance', ['dragon_pass', 'hundred_flower', 'sweep_army', 'lunge'], ['dragon_pass', 'hundred_flower'], 'iron_shirt', '조상이 나라를 지키다 죽었다는 집안. 지금도 아이들에게 칼보다 그 얘기를 먼저 가르친다.', '우리 집안 창은 사람을 이기려고 배운 게 아니오. 지키려고 배웠지.'),
  N('yang', '세가', 'jeong', '신창양가', '양 태군', 'OldWoman', 2, 'Lance', ['sky_pierce', 'one_point', 'sweep_army', 'lunge'], ['sky_pierce', 'one_point'], 'iron_shirt', '남자들이 전쟁터에서 다 죽은 뒤 며느리들이 창을 들어 지킨 집안. 지금도 안주인이 집안을 끌고 간다.', '늙은이 앞이라고 봐줄 생각은 말게. 내가 자네 할머니뻘이어도 창은 내가 빠르니.'),
  N('eon', '세가', 'jeong', '진주언가', '언창호', 'Lion', 1, 'Club', ['kongtong', 'earth_stomp', 'iron_fist', 'heavy'], ['kongtong', 'earth_stomp'], 'iron_shirt', '주먹이 세기로 소문난 집안. 머리가 나쁘다는 소문도 같이 났는데, 본인들은 앞의 소문만 들었다.', '말이 길면 주먹이 늦어. 할 말 있으면 짧게 해.'),
  N('jin', '세가', 'jeong', '광동진가', '진태석', 'Villager4', 1, 'Club', ['chain_kick', 'diamond_body', 'iron_fist', 'lunge'], ['chain_kick', 'diamond_body'], 'iron_shirt', '남쪽 저잣거리에서 시작한 권법 집안. 약방과 무관을 같이 열어 때린 사람을 고쳐 주고 돈을 두 번 받는다.', '어디 다쳐서 왔나, 다치러 왔나. 값이 달라.'),
  N('bukhae', '새외', 'oe', '북해빙궁', '설한연', 'Cavegirl2', 3, 'Rapier', ['swallow_qi', 'wind_turn', 'flurry', 'blink'], ['swallow_qi', 'wind_turn'], 'jaha', '중원에서 말 타고 두 달을 가야 나오는 얼음 호수 옆의 궁. 중원 일에 끼어들지 않는다고 하면서 소식은 누구보다 빨리 듣는다.', '여기까지 걸어왔어? 중원 사람치고는 고집이 있네.'),
  N('noeum', '새외', 'oe', '뇌음사', '무량 법사', 'Sodi', 3, 'Club', ['tathagata', 'luohan', 'heavy', 'earth_stomp'], ['tathagata', 'luohan'], 'yigin', '서쪽 끝 설산 너머의 절. 소림의 뿌리가 여기라고 주장하고, 소림은 그 말을 듣지 못한 척한다.', '소림에서 왔소? 아니라고? 다행이오. 그쪽과는 얘기가 길어지거든.'),
  N('podalra', '새외', 'oe', '포달랍궁', '금강 법왕', 'Master', 3, 'Club', ['diamond_body', 'earth_stomp', 'heavy', 'iron_fist'], ['diamond_body', 'earth_stomp'], 'yigin', '토번 고원 꼭대기의 궁. 숨이 가쁜 곳에서 평생 수련한 승려들이라 내려오면 다들 날아다닌다.', '숨이 가쁘오? 앉아서 차부터 드시오. 차도 못 마시면 싸움은 더 못하오.'),
);
Object.assign(RANKS, { 문파: ['외문 제자', '내문 제자', '진전 제자', '장로', '장문인'], 세가: ['식객', '가신', '내원 무사', '원로', '가주'], 새외: ['행자', '제자', '호법', '장로', '궁주'] });
Object.assign(TRIALS, {
  haenam: { lines: [['clan_haenam', '요즘 뱃사람들이 물귀신을 봤다고 바다에 안 나가오. 귀신이 칼을 찼다는군.'], ['clan_haenam', '가서 귀신을 좀 때려 보시오. 맞으면 사람이오.']], kind: 'pirate', end: '맞으니까 사람이었다. 임해조는 그럴 줄 알았다며 배 수리비를 그놈들한테 청구했다.' },
  cheonsan: { lines: [['clan_cheonsan', '마교 놈들이 또 우리 약초밭을 밟고 지나갔어.'], ['clan_cheonsan', '밭값을 받아 와. 사람이 없으니까 네가 가.']], kind: 'hunter', end: '밭값은 칼자국으로 받았다. 고산옥은 고개만 끄덕이고 장작을 마저 팼다.' },
  jeonjin: { lines: [['clan_jeonjin', '산 아래 도사 행세를 하며 돈을 뜯는 자들이 있소. 전진교 도포를 입고 말이오.'], ['clan_jeonjin', '도포를 벗기시오. 입은 사람보다 옷이 더 아깝소.']], kind: 'rogue', end: '도포 세 벌을 들고 돌아왔다. 장양 진인은 빨아서 다시 쓰라고 했다.' },
  mosan: { lines: [['clan_mosan', '아랫마을 묘지에서 밤마다 곡소리가 난다는군.'], ['clan_mosan', '귀신이면 내가 가겠는데 발자국이 있어. 그래서 자네가 가게.']], kind: 'bandit', end: '도굴꾼들이었다. 허정자는 실망한 얼굴로 부적을 도로 넣었다.' },
  jangbaek: { lines: [['clan_jangbaek', '삼밭에 손을 대는 놈들이 있소. 올해만 세 번째요.'], ['clan_jangbaek', '삼은 십 년을 기다린 거요. 놈들도 그만큼 아프게 해 주시오.']], kind: 'bandit', end: '훔친 삼을 도로 받아 왔다. 박무산은 뿌리 하나하나를 세어 보고서야 고맙다고 했다.' },
  pota: { lines: [['clan_pota', '해적이 어부 아이들을 잡아갔소.'], ['clan_pota', '다 데려오시오. 해적은 내가 나중에 따로 만나겠소.']], kind: 'pirate', end: '아이들을 배에 태워 돌려보냈다. 자운 사태는 합장을 하더니 염주를 내려놓고 칼을 집었다.' },
  hwangbo: { lines: [['clan_hwangbo', '언가 놈들이 우리 무관 간판을 떼어 갔네.'], ['clan_hwangbo', '술 깨기 전에 도로 달아 놓게.']], kind: 'guard', end: '간판을 도로 달았다. 다음 날 언가 쪽 간판이 없어졌다는 소문을 들었다.' },
  ak: { lines: [['clan_ak', '해안 쪽 마을을 터는 왜구가 있다 하오. 관군은 오려면 멀었소.'], ['clan_ak', '우리 집안은 그럴 때 가만있지 않소. 가시오.']], kind: 'pirate', end: '마을 사람들이 보리쌀 한 자루를 내밀었다. 악정산은 그것만은 받아 오라고 했다.' },
  yang: { lines: [['clan_yang', '옛날 전장터에 묻은 우리 집안 사람들 묘를 파헤치는 놈들이 있다네.'], ['clan_yang', '창은 안 뽑아도 좋으니 다리는 부러뜨리게.']], kind: 'bandit', end: '양 태군은 묘를 다시 덮는 동안 아무 말도 하지 않았다.' },
  eon: { lines: [['clan_eon', '황보 놈들이 또 시비야. 가서 때려.'], ['clan_eon', '왜냐고? 그걸 왜 물어?']], kind: 'guard', end: '이겼다. 왜 싸웠는지는 끝내 아무도 몰랐다.' },
  jin: { lines: [['clan_jin', '저잣거리 상인들한테 자릿세를 걷는 패거리가 있어. 원래 그건 아무도 안 받던 건데.'], ['clan_jin', '좀 패 주고 와. 치료는 싸게 해 줄 테니.']], kind: 'rogue', end: '패거리는 진태석의 약방으로 실려 갔고, 약값은 정가대로 나왔다.' },
  bukhae: { lines: [['clan_bukhae', '호수 얼음을 깨고 다니는 밀렵꾼들이 있어. 이 호수는 우리 집이야.'], ['clan_bukhae', '내쫓아. 얼음 속에 넣어 두라는 말은 아직 안 했어.']], kind: 'hunter', end: '밀렵꾼들은 남쪽으로 내뺐다. 설한연은 중원에도 쓸 만한 사람이 있다고 편지에 적었다.' },
  noeum: { lines: [['clan_noeum', '순례자들 짐을 터는 패거리가 고개에 있소.'], ['clan_noeum', '부처님께 가는 길을 막으면 안 되지. 비켜 드리게 하시오.']], kind: 'bandit', end: '패거리는 비켜 주었다. 무량 법사는 소림에도 이 일을 꼭 알리라고 했다.' },
  podalra: { lines: [['clan_podalra', '소금길 대상이 이번 달에 안 왔소. 차가 떨어져 가오.'], ['clan_podalra', '찾아오시오. 이 궁에 차가 없으면 큰일이 나오.']], kind: 'rogue', end: '대상을 찾아 데려왔다. 금강 법왕은 그날 찻잔을 일곱 번 비웠다.' },
});
// 세력마다 다른 일
export const FJOBS = {
  shaolin: [['hunt', '파계승 잡기', '소림 옷을 입고 시주를 뜯는 자가 {p}에 있다고 하오.', 'rogue'], ['gather', '공양 쌀', '올겨울 공양할 쌀이 모자라오.', 'rice', 5]],
  wudang: [['deliver', '단약 전달', '{p}의 은퇴한 사숙께 단약을 전해 주시오.', 'bandit'], ['spar', '대리 비무', '{r} 사람이 우리 제자에게 시비를 걸었소. 대신 나가 주시오.', 'guard']],
  hwasan: [['spar', '종남과 한판', '{p}에서 종남 제자가 화산을 들먹였대. 입 좀 막아 줘.', 'guard'], ['gather', '술 재료', '장문인 술에 넣을 꿀이 떨어졌어.', 'honey', 3]],
  jongnam: [['spar', '화산 제자 혼내기', '화산 제자가 {p}에서 종남을 비웃었다 하오. 바로잡으시오.', 'guard'], ['escort', '순례 도사 호위', '{p}까지 가는 도사들을 호위하시오.', 'bandit']],
  emei: [['hunt', '인신매매범 소탕', '{p}에 사람을 사고파는 놈들이 있다. 다리는 부러뜨려도 된다.', 'rogue'], ['gather', '약초 공양', '아랫마을 환자들에게 쓸 약초를 구해 와라.', 'herb', 5]],
  gonryun: [['escort', '약초꾼 호위', '약초꾼들이 {p}까지 간다. 곰보다 사람이 더 무섭다더군.', 'bandit'], ['gather', '겨울옷 가죽', '제자들 겨울옷에 쓸 가죽이 모자라오.', 'hide', 3]],
  gongdong: [['hunt', '가짜 비급 장수', '{p}에서 칠상권 비급을 판다는 놈을 잡아 와라. 아이고, 허리야.', 'rogue'], ['gather', '권갑 재료', '권갑 만들 철광석이 필요하다.', 'ore_iron', 4]],
  jeomchang: [['spar', '쾌검 시험', '{p}에 빠르다고 소문난 칼이 있소. 우리보다 빠르면 곤란하오.', 'guard'], ['deliver', '급한 서찰', '{p}에 서찰을 전하시오. 빨리.', 'rogue']],
  cheongseong: [['gather', '장문인의 차', '장문인 차가 떨어졌소.', 'tea', 3], ['hunt', '순례객 터는 놈', '{p}에서 순례객을 터는 자들이 있소.', 'bandit']],
  gaebang: [['deliver', '소문 전달', '{p} 분타에 쪽지를 전해 주쇼. 입으로 전하면 값이 오르니까.', 'rogue'], ['hunt', '거지 패는 놈', '{p}에서 우리 애들을 때리는 놈이 있소. 밥값 좀 받아 주쇼.', 'rogue']],
  namgung: [['escort', '세가 마차 호위', '남궁 마차가 {p}를 지나오. 가문의 체면이 실렸으니 긁히지 않게 하시오.', 'bandit'], ['spar', '가문 체면', '{r} 사람이 남궁을 입에 올렸소. 사과를 받아 오시오.', 'guard']],
  moyong: [['deliver', '답례품 전달', '{p}의 어르신께 답례를 보내오. 받은 것은 돌려주는 것이 법도요.', 'rogue'], ['gather', '답례용 옥돌', '답례품에 쓸 옥돌이 필요하오.', 'jade', 1]],
  jegal: [['deliver', '봉인 서찰', '{p}에 서찰을 전하시오. 열어 보면 압니다. 제가 안다는 뜻입니다.', 'rogue'], ['hunt', '첩자 색출', '{p}에 {r} 쪽 눈이 있습니다. 둘입니다. 셋일 수도 있습니다.', 'rogue']],
  dang: [['gather', '독 재료', '독에 쓸 뱀독이 필요해요.', 'venom', 3], ['hunt', '암기 도둑', '{p}에 당가 암기를 훔친 놈이 있어요. 손은 안 돌려줘도 돼요.', 'rogue']],
  paeng: [['hunt', '산적 토벌', '{p} 산적들이 팽가 땅을 밟았다. 머릿수나 세어 오너라.', 'bandit'], ['spar', '칼 자랑', '{r} 쪽 도객이 칼 자랑을 한다더군. 꺾고 와.', 'guard']],
  nokrim: [['extort', '통행세', '{p} 고개에서 통행세를 걷어라.', 'bandit'], ['raid', '표물 털기', '{p}를 지나는 표물을 털어라.', 'guard']],
  janggang: [['extort', '뱃길 세금', '{p} 나루에서 뱃길 세금을 걷어 오쇼.', 'pirate'], ['raid', '소금배 습격', '{p}를 지나는 소금배를 잡으쇼.', 'guard']],
  haomun: [['deliver', '소문 배달', '{p} 기루에 소문을 넣고 오세요. 돈 되는 소문이에요.', 'rogue'], ['extort', '도박빚 수금', '{p} 손님이 빚을 안 갚아요. 웃으면서 받아 와요.', 'rogue']],
  odok: [['gather', '독 항아리', '뱀독이 모자라. 항아리가 비었어.', 'venom', 4], ['assassin', '약방 주인', '{p} 약방 주인이 해독제를 싸게 판대. 장사를 그만두게 해.', 'rogue']],
  hyeoleui: [['assassin', '돈 받은 일', '의뢰인이 {p}의 한 사람을 지목했다. 사연은 묻지 마라.', 'rogue'], ['hunt', '배신자 처리', '{p}로 달아난 동료가 있다.', 'rogue']],
  cheonma: [['escort', '신도 순례', '신도들이 {p}로 옵니다. 데려오십시오.', 'guard'], ['raid', '경전 불태우기', '{r}의 경전이 {p}를 지납니다.', 'guard']],
  changun: [['deliver', '문주의 서찰', '{p}에 문주님 서찰을 전해 주게.', 'rogue'], ['gather', '상처약 재료', '제자들 상처약이 떨어졌어.', 'herb', 4]],
  haenam: [['hunt', '해적 쫓기', '{p} 앞바다를 터는 놈들이 있소.', 'pirate'], ['gather', '섬 식량', '섬사람들 먹을 생선이 모자라오.', 'f_crucian', 4]],
  cheonsan: [['gather', '겨울 장작', '겨울 장작이 모자라. 목재 좀 구해 와.', 'wood', 5], ['hunt', '마교 척후', '{p}에 마교 척후가 있어.', 'hunter']],
  jeonjin: [['hunt', '가짜 도사', '{p}에서 전진교 이름을 팔아 부적을 파는 자가 있소.', 'rogue'], ['gather', '재계 쌀', '재계에 쓸 쌀이 떨어졌소.', 'rice', 4]],
  mosan: [['hunt', '귀신 소동', '{p}에 귀신이 나온다는군. 발자국이 있으면 자네 일이야.', 'bandit'], ['deliver', '부적 배달', '{p} 마을에 부적을 갖다 주게. 효험은 묻지 말고.', 'rogue']],
  jangbaek: [['escort', '삼꾼 호위', '삼꾼들이 {p}까지 내려가오.', 'bandit'], ['gather', '겨울 가죽', '겨울옷 가죽이 필요하오.', 'hide', 3]],
  pota: [['escort', '어민 호송', '어민 배를 {p}까지 호위하시오.', 'pirate'], ['gather', '섬 약초', '섬 아이들이 앓고 있소.', 'herb', 4]],
  hwangbo: [['spar', '술값 비무', '{p}에 언가 놈이 왔다네. 이기면 술은 내가 사지.', 'guard'], ['gather', '술 재료', '꿀이 떨어졌네. 술을 못 빚어.', 'honey', 3]],
  ak: [['hunt', '왜구 토벌', '{p} 해안에 왜구가 올라왔소.', 'pirate'], ['escort', '피난민 호위', '피난민들을 {p}까지 모시시오.', 'bandit']],
  yang: [['hunt', '옛 전장 도굴꾼', '{p} 옛 전장의 묘를 파는 자들이 있다네.', 'bandit'], ['deliver', '제물 전달', '{p} 사당에 제물을 올리고 오게.', 'rogue']],
  eon: [['spar', '그냥 때리기', '{p}에 센 놈이 있대. 가서 때려.', 'guard'], ['gather', '철광석', '철광석 가져와. 뭐에 쓰냐고? 몰라.', 'ore_iron', 4]],
  jin: [['hunt', '자릿세 패거리', '{p} 저잣거리에 자릿세 걷는 놈들이 있어.', 'rogue'], ['gather', '약방 약초', '약방에 약초가 떨어졌어. 값은 쳐 주지.', 'herb', 5]],
  bukhae: [['hunt', '밀렵꾼', '{p}까지 내려온 밀렵꾼을 쫓아.', 'hunter'], ['deliver', '궁주의 편지', '{p}에 편지를 전해. 답장은 안 기다려.', 'rogue']],
  noeum: [['escort', '순례자 호위', '순례자들이 {p}를 지나오.', 'bandit'], ['gather', '법회 향 재료', '법회에 쓸 약초가 필요하오.', 'herb', 4]],
  podalra: [['escort', '소금 대상 호위', '소금 대상을 {p}까지 호위하시오.', 'bandit'], ['gather', '법왕의 차', '차가 떨어지면 큰일이오.', 'tea', 4]],
};
