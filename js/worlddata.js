// 강호 전도의 자리. px는 804×658 참고 지도 좌표, map은 들어갈 지도, at은 도착 칸
const B = (id, name, px, style, t, o = {}) => ({ id, name, px, map: 'b_' + id, at: [20, 26.5], style, t, kind: 'sect', fac: id, ...o });
const C = (id, name, px, t, o = {}) => ({ id, name, px, map: 'c_' + id, at: [20, 26.5], style: 'town', t, kind: 'city', ...o });
const O = (id, name, px, at, t, o = {}) => ({ id, name, px, map: id, at, t, kind: 'old', ...o });
export const LOCS = [
  // 처음부터 있던 곳
  O('cheongha', '청하진', [598, 436], [22.5, 25], 1), O('valley', '청풍골', [574, 428], [35, 15.5], 1), O('bamboo', '대숲길', [600, 414], [18, 29], 1, { need: 'bamboo_open' }),
  O('pass', '동쪽 산길', [630, 436], [3, 12.5], 2, { need: 'pass_open' }), O('fort', '흑풍채', [652, 426], [3, 13], 3, { need: 'fort_open', fac: 'nokrim', color: 'evil' }), O('cloudmt', '창운산', [642, 462], [22.5, 33], 2, { need: 'cloud_open', fac: 'changun', color: 'sect' }),
  O('guhwa', '구화성', [602, 472], [24.5, 29], 3, { need: 'boat_guhwa' }), O('shaolin', '소림사', [556, 356], [19.5, 26], 4, { fac: 'shaolin', color: 'sect' }), O('hwasan', '화산파', [515, 362], [22, 11.5], 4, { fac: 'hwasan', color: 'sect' }),
  O('wolha', '월하곡', [540, 472], [22, 37], 6, { need: 'seen_wolha' }), O('silk', '비단길', [392, 262], [41, 15.5], 5, { need: 'seen_silk' }), O('oasis', '사주성', [300, 240], [40, 15.5], 5, { need: 'seen_oasis' }),
  O('tiangate', '천산 입구', [138, 208], [22, 30], 6, { need: 'seen_tiangate' }), O('snowpeak', '빙궁 설산', [118, 178], [22, 30], 6, { need: 'seen_snowpeak' }), O('blackpalace', '흑운궁', [92, 150], [22, 34], 6, { need: 'seen_blackpalace' }),
  // 구파일방
  B('wudang', '무당파', [530, 403], 'dao', 4), B('jongnam', '종남파', [495, 375], 'dao', 3), B('emei', '아미파', [402, 458], 'temple', 3), B('gonryun', '곤륜파', [242, 356], 'peak', 4), B('gongdong', '공동파', [425, 345], 'dao', 3), B('jeomchang', '점창파', [358, 517], 'dao', 3), B('cheongseong', '청성파', [410, 415], 'dao', 3), B('gaebang', '개방 총타', [608, 265], 'slum', 3),
  // 오대세가
  B('namgung', '남궁세가', [638, 411], 'manor', 4), B('moyong', '모용세가', [682, 215], 'manor', 4), B('jegal', '제갈세가', [552, 403], 'manor', 4), B('dang', '사천당가', [424, 432], 'manor', 3), B('paeng', '하북팽가', [590, 252], 'manor', 3),
  // 사파와 마교
  B('janggang', '장강수로채', [520, 425], 'water', 3, { color: 'evil' }), B('haomun', '하오문', [654, 416], 'slum', 3, { color: 'evil' }), B('odok', '오독문', [400, 540], 'fort', 4, { color: 'evil' }), B('hyeoleui', '혈의방', [470, 500], 'fort', 4, { color: 'evil' }), B('cheonma', '천마신교', [180, 262], 'dark', 6, { color: 'evil' }),
  // 그 밖의 문파
  B('haenam', '해남파', [522, 632], 'water', 3, { boat: 'c_guangzhou' }), B('cheonsan', '천산파', [178, 190], 'peak', 5), B('jeonjin', '전진교', [478, 384], 'dao', 3), B('mosan', '모산파', [650, 385], 'dao', 2), B('jangbaek', '장백파', [728, 195], 'peak', 3), B('pota', '보타문', [714, 414], 'water', 3, { boat: 'c_suzhou' }),
  B('hwangbo', '황보세가', [617, 301], 'manor', 3), B('ak', '산동악가', [612, 322], 'manor', 3), B('yang', '신창양가', [540, 307], 'manor', 3), B('eon', '진주언가', [578, 299], 'manor', 2), B('jin', '광동진가', [576, 535], 'manor', 3),
  B('bukhae', '북해빙궁', [400, 40], 'ice', 6, { color: 'out' }), B('noeum', '뇌음사', [32, 368], 'west', 6, { color: 'out' }), B('podalra', '포달랍궁', [207, 426], 'west', 5, { color: 'out' }),
  // 도시
  C('yeongyeong', '연경', [598, 232], 3), C('nakyang', '낙양', [538, 346], 3), C('changan', '장안', [480, 352], 3), C('seongdo', '성도', [402, 432], 3), C('guangzhou', '광주', [548, 556], 4, { boat: 'b_haenam' }), C('suzhou', '소주', [672, 402], 3, { boat: 'b_pota' }),
];
export const ROADS = [
  ['cheongha', 'bamboo'], ['cheongha', 'valley'], ['cheongha', 'pass'], ['pass', 'fort'], ['pass', 'cloudmt'], ['cheongha', 'guhwa'], ['guhwa', 'cloudmt'], ['guhwa', 'wolha'], ['valley', 'jegal'], ['jegal', 'wudang'], ['wudang', 'janggang'], ['janggang', 'wolha'], ['jegal', 'shaolin'], ['shaolin', 'nakyang'], ['shaolin', 'hwasan'], ['hwasan', 'changan'], ['nakyang', 'yang'], ['yang', 'eon'], ['eon', 'hwangbo'], ['hwangbo', 'ak'], ['ak', 'mosan'], ['eon', 'gaebang'], ['gaebang', 'hwangbo'], ['gaebang', 'paeng'], ['paeng', 'yeongyeong'], ['yeongyeong', 'moyong'], ['moyong', 'jangbaek'], ['yeongyeong', 'bukhae'],
  ['changan', 'jongnam'], ['jongnam', 'jeonjin'], ['changan', 'gongdong'], ['gongdong', 'silk'], ['silk', 'oasis'], ['oasis', 'tiangate'], ['tiangate', 'snowpeak'], ['snowpeak', 'blackpalace'], ['oasis', 'cheonma'], ['cheonma', 'cheonsan'], ['oasis', 'gonryun'], ['gonryun', 'podalra'], ['podalra', 'noeum'], ['jeonjin', 'cheongseong'], ['cheongseong', 'seongdo'], ['seongdo', 'emei'], ['seongdo', 'dang'], ['dang', 'janggang'], ['emei', 'jeomchang'], ['jeomchang', 'odok'], ['odok', 'hyeoleui'], ['hyeoleui', 'janggang'], ['hyeoleui', 'jin'], ['jin', 'guangzhou'], ['guhwa', 'jin'], ['cloudmt', 'namgung'], ['cheongha', 'namgung'], ['namgung', 'haomun'], ['namgung', 'mosan'], ['mosan', 'suzhou'], ['haomun', 'suzhou'],
];
export const PROV = [['서역', 170, 285], ['토번', 150, 390], ['청해', 280, 300], ['감숙', 385, 300], ['대막', 470, 170], ['북해', 400, 75], ['사천', 385, 405], ['운남', 345, 545], ['귀주', 445, 515], ['광서', 490, 535], ['광동', 590, 520], ['호남', 505, 465], ['호북', 505, 410], ['강서', 585, 500], ['복건', 640, 510], ['강남', 665, 435], ['안휘', 612, 385], ['하남', 575, 345], ['섬서', 468, 325], ['산서', 525, 270], ['하북', 570, 225], ['산동', 645, 312], ['요동', 695, 180], ['장백', 745, 125], ['흑룡', 680, 60], ['해남', 522, 650]];
