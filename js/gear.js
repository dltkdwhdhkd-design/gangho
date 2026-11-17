// 장비 등급과 옷(갑옷) 칸
// - 등급 여섯: 범품 < 양품 < 상품 < 명품 < 보구 < 신병. 무기는 `grade`가 적혀 있으면 그 값, 없으면 공격력으로 정한다. 장신구·옷도 같은 등급 표를 쓴다
// - 등급이 주는 것: 이름 빛깔, 강화 한도(cap), 무기 등급 덤(fx. 상품부터 치명·초식 위력·체력이 조금 붙는다)
// - 옷: 새 장비 칸. `G.S.armors`(가진 것), `G.S.armor`(입은 것). 효과는 장신구와 같은 식으로 bonus()에 더해진다(js/state.js)
// 다음에 늘릴 것(docs/master-plan.md G): 신발·머리띠 칸, 보스가 떨구는 옷과 무기, 등급별 덧붙는 특성(같은 물건이라도 붙는 특성이 다르게)
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

const A = (name, grade, price, fx, desc) => ({ name, grade, price, fx, desc });
export const ARMORS = {
  cloth_robe: A('무명 도포', 0, 60, { def: 2 }, '질긴 무명으로 지은 겉옷. 없는 것보다 낫다.'),
  leather_vest: A('가죽 조끼', 1, 180, { def: 4 }, '소가죽을 겹쳐 댄 조끼. 표사들이 즐겨 입는다.'),
  chain_shirt: A('쇄자갑', 2, 420, { def: 7, spd: -3 }, '쇠고리를 엮은 속갑옷. 든든하지만 조금 무겁다.'),
  silk_robe: A('비단 장삼', 2, 460, { def: 4, regen: 10 }, '숨이 잘 통하는 비단 장삼. 내력이 빨리 돈다.'),
  scale_armor: A('철린갑', 3, 900, { def: 10, hp: 4 }, '쇠비늘을 물고기처럼 겹친 갑옷. 칼끝이 미끄러진다.'),
  cloud_robe: A('운문 도포', 3, 880, { def: 6, mp: 10, regen: 10 }, '구름 무늬를 수놓은 도포. 도가 고수들의 옷이다.'),
  frost_fur: A('설표 털옷', 3, 1100, { def: 8, hp: 6 }, '천산 눈표범 털로 지은 옷. 서역 상인만 판다.'),
  gold_silk: A('금사연갑', 4, 2400, { def: 12, hp: 6 }, '금실을 섞어 짠 속갑옷. 칼이 들어가지 않는다고 한다.'),
  cheonjam: A('천잠보의', 5, 0, { def: 14, hp: 8, crit: 3 }, '하늘누에 실로 짠 옷. 강호에 한 벌뿐이라 한다.'),
};
export const armorGrade = id => ARMORS[id]?.grade ?? 0;
export const gradeOf = (kind, id) => GRADES[kind === 'weapon' ? weaponGrade(id) : kind === 'acc' ? accGrade(id) : armorGrade(id)] || GRADES[0];
// 이름을 등급 빛깔로, 뒤에 등급 딱지
export const gname = (kind, id, name) => { const g = gradeOf(kind, id); return `<span style="color:${g.color}">${name}</span><span class="tag" style="background:${g.color};color:#fff8e6">${g.name}</span>`; };
export const plusCap = id => GRADES[weaponGrade(id)].cap;
const FXN = { def: v => `방어 ${v > 0 ? '+' : ''}${v}`, hp: v => `체력 +${v}%`, mp: v => `내력 +${v}%`, regen: v => `내력 회복 +${v}%`, crit: v => `치명타 +${v}%`, spd: v => `이동 ${v > 0 ? '+' : ''}${v}%`, skill: v => `초식 위력 +${v}%`, atk: v => `공격력 +${v}%` };
export const fxText = fx => Object.entries(fx || {}).map(([k, v]) => FXN[k] ? FXN[k](v) : '').filter(Boolean).join(', ');
