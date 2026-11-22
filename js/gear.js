// 장비 등급과 옷(갑옷) 칸
// - 등급 여섯: 범품 < 양품 < 상품 < 명품 < 보구 < 신병. 무기는 `grade`가 적혀 있으면 그 값, 없으면 공격력으로 정한다. 장신구·옷도 같은 등급 표를 쓴다
// - 등급이 주는 것: 이름 빛깔, 강화 한도(cap), 무기 등급 덤(fx. 상품부터 치명·초식 위력·체력이 조금 붙는다)
// - 옷: 칸 넷(머리·상의·하의·신발). 효과는 장신구와 같은 식으로 bonus()에 더해진다(js/state.js)
// - 장신구: 두 개까지. 정해진 짝을 같이 끼면 덤(PAIRS)
// 다음에 늘릴 것(docs/master-plan.md J): 보스가 떨구는 옷과 무기, 등급별 덧붙는 특성(같은 물건이라도 붙는 특성이 다르게), 옷 한 벌 효과
import { WEAPONS } from './data.js';
import { ACCS } from './items.js';

export const GRADES = [
  { name: '범품', color: '#7c766a', cap: 3, fx: {} },
  { name: '양품', color: '#3f7f3c', cap: 4, fx: {} },
  { name: '상품', color: '#2f68ac', cap: 5, fx: { crit: 2 } },
  { name: '명품', color: '#7d3fb0', cap: 5, fx: { crit: 3, skill: 3 } },
  { name: '보구', color: '#b8741c', cap: 6, fx: { crit: 4, skill: 5, hp: 3 } },
  { name: '신병', color: '#c0301f', cap: 7, fx: { crit: 5, skill: 8, hp: 5 } },
];
const BYATK = [6, 12, 20, 27, 34];  // 공격력이 이 값 이하면 그 등급(범품 ≤6, 양품 ≤12, 상품 ≤20, 명품 ≤27, 보구 ≤34, 그 위는 신병)
export function weaponGrade(id) { const w = WEAPONS[id]; if (!w) return 0; if (w.grade != null) return w.grade; let g = BYATK.findIndex(v => w.atk <= v); return g < 0 ? 5 : g; }
export function accGrade(id) { const a = ACCS[id]; if (!a) return 0; return a.grade ?? (id.startsWith('b_') ? 3 : 2); }  // 인연이 준 것은 명품, 문파에서 얻은 것은 상품

// 옷 칸 넷: 머리, 상의, 하의, 신발. `G.S.armors`(가진 것), `G.S.wear = { head, top, bottom, boots }`(입은 것)
export const SLOTS = [['head', '머리'], ['top', '상의'], ['bottom', '하의'], ['boots', '신발']];
const A = (slot, name, grade, price, fx, desc, set) => ({ slot, name, grade, price, fx, desc, set });
export const ARMORS = {
  // 상의
  cloth_robe: A('top', '무명 도포', 0, 60, { def: 2 }, '질긴 무명으로 지은 겉옷. 없는 것보다 낫다.'),
  leather_vest: A('top', '가죽 조끼', 1, 180, { def: 4 }, '소가죽을 겹쳐 댄 조끼. 표사들이 즐겨 입는다.'),
  chain_shirt: A('top', '쇄자갑', 2, 420, { def: 7, spd: -3 }, '쇠고리를 엮은 속갑옷. 든든하지만 조금 무겁다.'),
  silk_robe: A('top', '비단 장삼', 2, 460, { def: 4, regen: 10 }, '숨이 잘 통하는 비단 장삼. 내력이 빨리 돈다.'),
  scale_armor: A('top', '철린갑', 3, 900, { def: 10, hp: 4 }, '쇠비늘을 물고기처럼 겹친 갑옷. 칼끝이 미끄러진다.'),
  cloud_robe: A('top', '운문 도포', 3, 880, { def: 6, mp: 10, regen: 10 }, '구름 무늬를 수놓은 도포. 도가 고수들의 옷이다.'),
  frost_fur: A('top', '설표 털옷', 3, 1100, { def: 8, hp: 6 }, '천산 눈표범 털로 지은 옷. 서역 상인만 판다.'),
  gold_silk: A('top', '금사연갑', 4, 2400, { def: 12, hp: 6 }, '금실을 섞어 짠 속갑옷. 칼이 들어가지 않는다고 한다.'),
  cheonjam: A('top', '천잠보의', 5, 0, { def: 14, hp: 8, crit: 3 }, '하늘누에 실로 짠 옷. 강호에 한 벌뿐이라 한다.'),
  // 하의
  cloth_pants: A('bottom', '무명 바지', 0, 40, { def: 1 }, '무릎을 덧댄 무명 바지.'),
  leather_greaves: A('bottom', '가죽 각반', 1, 140, { def: 3 }, '정강이에 감는 가죽 각반. 먼 길에 좋다.'),
  iron_greaves: A('bottom', '쇠 정강이받이', 2, 360, { def: 5, spd: -2 }, '쇠판을 댄 정강이받이. 하단 베기를 막아 준다.'),
  silk_pants: A('bottom', '비단 고의', 2, 380, { def: 2, regen: 8 }, '통이 넓은 비단 바지. 보법이 편하다.'),
  cloud_skirt: A('bottom', '운문 하상', 3, 760, { def: 4, mp: 8, cd: -3 }, '도포 아래 두르는 치마 꼴 하의. 걸음에 기가 실린다.'),
  tiger_greaves: A('bottom', '호피 각반', 3, 820, { def: 6, hp: 4 }, '호랑이 가죽 각반. 산채 두령들이 찬다.'),
  // 신발
  straw_shoes: A('boots', '짚신', 0, 20, { spd: 2 }, '새로 삼은 짚신. 발이 가볍다.'),
  leather_boots: A('boots', '가죽신', 1, 120, { spd: 4, def: 1 }, '밑창을 겹댄 가죽신.'),
  wind_boots: A('boots', '경풍화', 2, 400, { spd: 7 }, '밑창이 얇고 질긴 신. 경공 익히는 이들이 신는다.'),
  iron_boots: A('boots', '철각화', 2, 380, { def: 4, spd: 1 }, '코에 쇠를 박은 신. 차면 아프다.'),
  snow_boots: A('boots', '답설화', 3, 900, { spd: 9, cd: -3 }, '눈 위에 자국이 안 남는다는 신.'),
  // 머리
  headband: A('head', '무명 두건', 0, 30, { def: 1 }, '땀이 눈에 안 들어가게 묶는 두건.'),
  bamboo_hat: A('head', '죽립', 1, 110, { def: 2, regen: 5 }, '대나무 삿갓. 얼굴을 가리기 좋다.'),
  hero_band: A('head', '영웅건', 2, 340, { crit: 2, def: 1 }, '이마에 매는 붉은 띠. 매면 물러서기 싫어진다.'),
  iron_helm: A('head', '철 투구', 2, 360, { def: 5, spd: -1 }, '군에서 흘러나온 투구.'),
  jade_crown: A('head', '옥관', 3, 880, { mp: 10, cd: -4 }, '상투를 고정하는 옥 장식. 정신이 맑아진다.'),
  // 보구·신병: 가게에 없다. 보스가 떨구거나 숨은 일로 얻는다(dropFor)
  gold_greaves: A('bottom', '금린 각반', 4, 0, { def: 8, hp: 5 }, '금빛 비늘을 이은 각반. 왕부 호위들이 찼다.', 'gold'),
  gold_helm: A('head', '금봉 투구', 4, 0, { def: 7, crit: 2 }, '봉황을 새긴 투구. 이마의 금박이 닳아 있다.', 'gold'),
  gold_boots: A('boots', '금사 전화', 4, 0, { spd: 8, def: 3 }, '금실로 누빈 전투화. 무겁지 않다.', 'gold'),
  wind_robe: A('top', '청풍 도의', 4, 0, { def: 8, spd: 6, regen: 10 }, '바람이 스며드는 얇은 도의. 경공 고수의 옷이다.', 'wind'),
  wind_pants: A('bottom', '청풍 고의', 4, 0, { def: 4, spd: 5 }, '움직임을 막지 않는 바지.', 'wind'),
  wind_band: A('head', '청풍 영웅건', 4, 0, { crit: 3, cd: -4 }, '이마에 매는 푸른 띠.', 'wind'),
  feather_boots: A('boots', '비연화', 4, 0, { spd: 12, cd: -3 }, '제비 깃털처럼 가벼운 신.', 'wind'),
  cheonjam_pants: A('bottom', '천잠 하의', 5, 0, { def: 10, hp: 6 }, '천잠사로 짠 하의.', 'cheonjam'),
  cheonjam_crown: A('head', '천잠 관', 5, 0, { mp: 14, cd: -6, def: 4 }, '천잠사를 엮은 관.', 'cheonjam'),
  cheonjam_boots: A('boots', '천잠 운리', 5, 0, { spd: 12, def: 5 }, '구름을 밟는 듯한 신.', 'cheonjam'),
};
ARMORS.gold_silk.set = 'gold'; ARMORS.cheonjam.set = 'cheonjam';
// 한 벌: 같은 이름 줄의 옷을 여럿 입으면 덤(2벌, 4벌)
export const SETS = {
  gold: { name: '금린 한 벌', 2: { def: 4 }, 4: { hp: 8, atk: 5 } },
  wind: { name: '청풍 한 벌', 2: { spd: 5 }, 4: { cd: -8, crit: 4 } },
  cheonjam: { name: '천잠 한 벌', 2: { hp: 6 }, 4: { skill: 10, def: 6 } },
};
export function setsOf(S) {
  const n = {}; for (const id of Object.values(wearOf(S))) { const k = id && ARMORS[id]?.set; if (k) n[k] = (n[k] || 0) + 1; }
  return Object.entries(n).map(([k, c]) => ({ k, c, name: SETS[k].name, fx: Object.assign({}, c >= 2 ? SETS[k][2] : {}, ...(c >= 4 ? [SETS[k][4]] : [])), next: c < 2 ? 2 : c < 4 ? 4 : 0 })).filter(q => q.c >= 1);
}
// 보스가 떨구는 장비: 경지가 높을수록 높은 등급. 아직 없는 것 가운데 하나
export function dropFor(realm, owned) {
  const g = realm >= 6 ? 5 : realm >= 4 ? 4 : realm >= 3 ? 3 : 2;
  const pool = Object.keys(ARMORS).filter(id => ARMORS[id].grade === g && !owned.includes(id) && !(g <= 3 && ARMORS[id].price === 0));
  return pool.length ? pool[Math.floor(Math.random() * pool.length)] : null;
}
// 입은 것: 옛 저장(armor 한 칸)도 받는다
export const wearOf = S => S.wear || (S.armor ? { top: S.armor } : {});
export function wearPut(S, id) { const a = ARMORS[id]; if (!a) return; S.wear = { ...wearOf(S) }; S.wear[a.slot] = S.wear[a.slot] === id ? null : id; delete S.armor; }

// 장신구: 두 개까지 낀다(`G.S.acc`, `G.S.acc2`). 정해진 짝을 같이 끼면 덤이 붙는다
export const ACC_SLOTS = 2;
export const accWorn = S => [S.acc, S.acc2].filter(Boolean);
export function accPut(S,id,slot) {
  if (!ACCS[id]) return;
  if (slot===0 || slot===1) {
    if (S.acc===id) S.acc=null;
    else if (S.acc2===id) S.acc2=null;
    else S[slot===0?'acc':'acc2']=id;
  } else if (S.acc===id) { S.acc=S.acc2 || null; S.acc2=null; }
  else if (S.acc2===id) S.acc2=null;
  else if (!S.acc) S.acc=id;
  else if (!S.acc2) S.acc2=id;
  else { S.acc=S.acc2; S.acc2=id; }
}
// 가게에서 파는 흔한 장신구(문파·인연이 주는 것은 js/items.js ACCS)
const B = (name, desc, fx, price, grade) => ({ name, desc, fx, price, grade });
Object.assign(ACCS, {
  c_ring: B('구리 가락지', '공격력 +3%', { atk: 3 }, 80, 0), c_cord: B('붉은 매듭', '체력 +4%', { hp: 4 }, 80, 0),
  c_jade: B('옥 노리개', '내력 +8%', { mp: 8 }, 220, 1), c_bell: B('은방울', '이동 속도 +5%', { spd: 5 }, 220, 1), c_tooth: B('늑대 이빨 목걸이', '치명타 +3%', { crit: 3 }, 240, 1),
  c_silver: B('은 가락지', '공격력 +5%, 내력 회복 +8%', { atk: 5, regen: 8 }, 520, 2), c_amber: B('호박 패물', '체력 +7%, 방어 +3', { hp: 7, def: 3 }, 520, 2), c_mirror: B('호심경', '방어 +6', { def: 6 }, 480, 2),
  c_goldring: B('금 가락지', '공격력 +7%, 치명타 +3%', { atk: 7, crit: 3 }, 1200, 3), c_pearl: B('야명주', '내력 +12%, 쿨타임 -5%', { mp: 12, cd: -5 }, 1300, 3),
});
// 짝 효과: [둘, 이름, 덤]
export const PAIRS = [
  [['c_ring', 'c_cord'], '맨손의 낭인', { atk: 2, hp: 2 }], [['c_jade', 'c_bell'], '옥과 방울', { regen: 8 }], [['c_tooth', 'c_goldring'], '사냥꾼의 패물', { crit: 3 }],
  [['c_silver', 'c_amber'], '은과 호박', { hp: 4, atk: 2 }], [['c_mirror', 'c_amber'], '겹겹의 방비', { def: 4 }], [['c_pearl', 'c_jade'], '맑은 구슬', { mp: 6, cd: -3 }],
  [['a_plum', 'b_so'], '매화와 벽수', { crit: 3 }], [['a_taiji', 'a_beads'], '불도쌍수', { hp: 5, regen: 10 }], [['a_nam', 'a_mo'], '창궁과 동경', { atk: 4 }], [['b_yun', 'a_emei'], '약손', { potion: 15 }],
];
export const pairOf = S => { const w = accWorn(S); return w.length < 2 ? null : PAIRS.find(([p]) => p.includes(w[0]) && p.includes(w[1])) || null; };
export const pairsWith = id => PAIRS.filter(([p]) => p.includes(id)).map(([p, n, fx]) => ({ other: p.find(k => k !== id), name: n, fx }));
export const armorGrade = id => ARMORS[id]?.grade ?? 0;
export const gradeOf = (kind, id) => GRADES[kind === 'weapon' ? weaponGrade(id) : kind === 'acc' ? accGrade(id) : armorGrade(id)] || GRADES[0];
// 이름을 등급 빛깔로, 뒤에 등급 딱지
export const gname = (kind, id, name) => { const g = gradeOf(kind, id); return `<span style="color:${g.color}">${name}</span><span class="tag" style="background:${g.color};color:#fff8e6">${g.name}</span>`; };
export const plusCap = id => GRADES[weaponGrade(id)].cap;
const effectUnits = {
  atk:['공격력','%'],def:['방어',''],hp:['체력','%'],mp:['내력','%'],spd:['이동 속도','%'],
  crit:['치명타','%p'],critDmg:['치명 피해','%'],regen:['내력 회복','%'],cd:['재사용 시간','%'],
  mpCost:['초식 내력 소모','%'],skill:['초식 위력','%'],ult:['절초 위력','%'],basic:['기본 공격 위력','%'],
  basicSpeed:['기본 공격 속도','%'],poiseDmg:['자세 피해','%'],mpHit:['기본 공격 적중 내력',''],
  reach:['기본 공격 거리','%'],parry:['튕겨내기 시간','초'],potion:['금창약 효과','%'],
  lifeHit:['타격 흡혈','%'],killHeal:['격파 시 체력 회복','%'],dashCd:['경공 대기','초'],
  dashInv:['경공 무적','초'],silver:['전리품 은자','%'],exp:['전투 경험','%'],
};
export const fxText = fx => Object.entries(fx || {}).flatMap(([key,v])=>{
  if (!v) return [];
  if (key==='venom') return ['기본 공격에 독'];
  const entry=effectUnits[key];
  return entry?[entry[0]+' '+(v>0?'+':'')+v+entry[1]]:[];
}).join(', ');
