// 강호 전도의 자리. px는 804×658 참고 지도 좌표, map은 들어갈 지도, at은 도착 칸
const B = (id, name, px, style, t, o = {}) => ({ id, name, px, map: 'b_' + id, at: [23, 65.4], style, t, kind: 'sect', fac: id, ...o });
const C = (id, name, px, t, o = {}) => ({ id, name, px, map: 'c_' + id, at: [30, 45.6], style: 'town', t, kind: 'city', ...o });
const O = (id, name, px, at, t, o = {}) => ({ id, name, px, map: id, at, t, kind: 'old', ...o });
export const LOCS = [
  // 처음부터 있던 곳
  O('cheongha', '청하진', [598, 436], [22.5, 25], 1), O('valley', '청풍골', [574, 428], [35, 15.5], 1), O('bamboo', '대숲길', [604, 419], [18, 29], 1, { need: 'bamboo_open' }),
  O('pass', '동쪽 산길', [630, 436], [3, 12.5], 2, { need: 'pass_open' }), O('fort', '흑풍채', [668, 440], [3, 13], 3, { need: 'fort_open', fac: 'nokrim', color: 'evil', tutor: [17, 21] }), O('cloudmt', '창운산', [642, 462], [22.5, 33], 2, { need: 'cloud_open', fac: 'changun', color: 'sect', tutor: [25.5, 30] }),
  O('guhwa', '구화성', [602, 472], [24.5, 29], 3, { need: 'boat_guhwa' }), O('shaolin', '소림사', [556, 356], [19.5, 26], 4, { fac: 'shaolin', color: 'sect', tutor: [24, 12.5] }), B('hwasan', '화산파', [515, 364], 'dao', 4),
  O('wolha', '월하곡', [540, 472], [22, 37], 6, { need: 'seen_wolha' }), O('silk', '비단길', [386, 256], [41, 15.5], 5, { need: 'seen_silk' }), O('oasis', '사주성', [300, 240], [40, 15.5], 5, { need: 'seen_oasis' }),
  O('tiangate', '천산 입구', [138, 208], [22, 30], 6, { need: 'seen_tiangate' }), O('snowpeak', '빙궁 설산', [118, 178], [22, 30], 6, { need: 'seen_snowpeak' }), O('blackpalace', '흑운궁', [92, 150], [22, 34], 6, { need: 'seen_blackpalace' }),
  // 구파일방
  B('wudang', '무당파', [543, 390], 'dao', 4), B('jongnam', '종남파', [486, 369], 'dao', 3), B('emei', '아미파', [402, 458], 'temple', 3), B('gonryun', '곤륜파', [242, 356], 'peak', 4), B('gongdong', '공동파', [425, 345], 'dao', 3), B('jeomchang', '점창파', [358, 517], 'dao', 3), B('cheongseong', '청성파', [410, 415], 'dao', 3), B('gaebang', '개방 총타', [613, 265], 'slum', 3),
  // 오대세가
  B('namgung', '남궁세가', [638, 411], 'manor', 4), B('moyong', '모용세가', [662, 236], 'manor', 4), B('jegal', '제갈세가', [551, 401], 'manor', 4), B('dang', '사천당가', [424, 432], 'manor', 3), B('paeng', '하북팽가', [584, 252], 'manor', 3),
  // 사파와 마교
  B('janggang', '장강수로채', [524, 429], 'water', 3, { color: 'evil' }), B('haomun', '하오문', [654, 416], 'slum', 3, { color: 'evil' }), B('odok', '오독문', [400, 540], 'fort', 4, { color: 'evil' }), B('hyeoleui', '혈의방', [470, 509], 'fort', 4, { color: 'evil' }), B('cheonma', '천마신교', [180, 262], 'dark', 6, { color: 'evil' }),
  // 그 밖의 문파
  B('haenam', '해남파', [388, 634], 'water', 3, { boat: 'c_guangzhou' }), B('cheonsan', '천산파', [178, 190], 'peak', 5), B('jeonjin', '전진교', [478, 408], 'dao', 3), B('mosan', '모산파', [650, 385], 'dao', 2), B('jangbaek', '장백파', [711, 171], 'peak', 3), B('pota', '보타문', [714, 414], 'water', 3, { boat: 'c_suzhou' }),
  B('hwangbo', '황보세가', [624, 291], 'manor', 3), B('ak', '산동악가', [612, 326], 'manor', 3), B('yang', '신창양가', [546, 313], 'manor', 3), B('eon', '진주언가', [578, 310], 'manor', 2), B('jin', '광동진가', [576, 535], 'manor', 3),
  B('bukhae', '북해빙궁', [400, 40], 'ice', 6, { color: 'out' }), B('noeum', '뇌음사', [32, 368], 'west', 6, { color: 'out' }), B('podalra', '포달랍궁', [207, 426], 'west', 5, { color: 'out' }),
  // 도시
  C('yeongyeong', '연경', [598, 232], 3), C('nakyang', '낙양', [526, 332], 3), C('changan', '장안', [480, 352], 3), C('seongdo', '성도', [402, 432], 3), C('guangzhou', '광주', [548, 556], 4, { boat: 'b_haenam' }), C('suzhou', '소주', [672, 402], 3, { boat: 'b_pota' }),
  // 새로 낸 큰 고을. 땅 그림엔 없어서 world.js carve()가 터를 고르고 큰길까지 길을 낸다
  C('hangzhou', '항주', [686, 424], 3, { road: 1 }), C('nanjing', '남경', [628, 352], 3, { road: 1 }), C('kaifeng', '개봉', [562, 338], 3, { road: 1 }), C('wuchang', '무창', [556, 446], 3, { road: 1 }),
  C('taiyuan', '태원', [546, 272], 4, { road: 1 }), C('fuzhou', '복주', [620, 500], 4, { road: 1 }), C('dali', '대리', [330, 540], 5, { road: 1 }),
];
export const ROADS = [
  ['cheongha', 'bamboo'], ['cheongha', 'valley'], ['cheongha', 'pass'], ['pass', 'fort'], ['pass', 'cloudmt'], ['cheongha', 'guhwa'], ['guhwa', 'cloudmt'], ['guhwa', 'wolha'], ['valley', 'jegal'], ['jegal', 'wudang'], ['wudang', 'janggang'], ['janggang', 'wolha'], ['jegal', 'shaolin'], ['shaolin', 'nakyang'], ['shaolin', 'hwasan'], ['hwasan', 'changan'], ['nakyang', 'yang'], ['yang', 'eon'], ['eon', 'hwangbo'], ['hwangbo', 'ak'], ['ak', 'mosan'], ['eon', 'gaebang'], ['gaebang', 'hwangbo'], ['gaebang', 'paeng'], ['paeng', 'yeongyeong'], ['yeongyeong', 'moyong'], ['moyong', 'jangbaek'], ['yeongyeong', 'bukhae'],
  ['changan', 'jongnam'], ['jongnam', 'jeonjin'], ['changan', 'gongdong'], ['gongdong', 'silk'], ['silk', 'oasis'], ['oasis', 'tiangate'], ['tiangate', 'snowpeak'], ['snowpeak', 'blackpalace'], ['oasis', 'cheonma'], ['cheonma', 'cheonsan'], ['oasis', 'gonryun'], ['gonryun', 'podalra'], ['podalra', 'noeum'], ['jeonjin', 'cheongseong'], ['cheongseong', 'seongdo'], ['seongdo', 'emei'], ['seongdo', 'dang'], ['dang', 'janggang'], ['emei', 'jeomchang'], ['jeomchang', 'odok'], ['odok', 'hyeoleui'], ['hyeoleui', 'janggang'], ['hyeoleui', 'jin'], ['jin', 'guangzhou'], ['guhwa', 'jin'], ['cloudmt', 'namgung'], ['cheongha', 'namgung'], ['namgung', 'haomun'], ['namgung', 'mosan'], ['mosan', 'suzhou'], ['haomun', 'suzhou'],
  ['hangzhou', 'suzhou'], ['hangzhou', 'fort'], ['nanjing', 'mosan'], ['nanjing', 'ak'], ['kaifeng', 'nakyang'], ['kaifeng', 'eon'], ['wuchang', 'janggang'], ['wuchang', 'valley'], ['taiyuan', 'paeng'], ['fuzhou', 'guhwa'], ['dali', 'jeomchang'], ['dali', 'odok'],
];
export const PROV = [['서역', 170, 285], ['토번', 150, 390], ['청해', 280, 300], ['감숙', 385, 300], ['대막', 470, 170], ['북해', 400, 75], ['사천', 385, 405], ['운남', 345, 545], ['귀주', 445, 515], ['광서', 490, 535], ['광동', 590, 520], ['호남', 505, 465], ['호북', 505, 410], ['강서', 585, 500], ['복건', 640, 510], ['강남', 665, 435], ['안휘', 612, 385], ['하남', 575, 345], ['섬서', 468, 325], ['산서', 525, 270], ['하북', 570, 225], ['산동', 645, 312], ['요동', 695, 180], ['장백', 745, 125], ['흑룡', 680, 60], ['해남', 522, 650]];
