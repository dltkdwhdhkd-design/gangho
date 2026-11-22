import { WEAPONS } from './data.js';
import { weaponGrade } from './gear.js';

export const refinements = {
  검: {
    light:{name:'경량 손잡이',fx:{cd:-6,basic:-3}},
    weight:{name:'검자루 균형추',fx:{skill:6,mpCost:4}},
  },
  도: {
    weight:{name:'중량 칼등',fx:{poiseDmg:14,spd:-3}},
    light:{name:'경량 칼자루',fx:{basicSpeed:7,skill:-3}},
  },
  창: {
    long:{name:'긴 창대',fx:{reach:12,cd:3}},
    light:{name:'가벼운 창대',fx:{mpCost:-6,basic:-3}},
  },
  권: {
    reinforced:{name:'보강 권갑',fx:{def:3,spd:-2}},
    soft:{name:'유연한 권대',fx:{mpHit:.65,basic:-3}},
  },
};
export function currentRefinement(s,id=s.weapon) {
  const choices=refinements[WEAPONS[id]?.type], selected=s.refinements?.[id];
  return choices && Object.hasOwn(choices,selected) ? choices[selected] : null;
}
export function refitPrice(id) {
  const type=WEAPONS[id].type, grade=weaponGrade(id);
  return {silver:30+grade*15, material:type==='권'?'hide':type==='창'?'wood':'ore_iron', count:2+grade};
}
// 재료 차감과 개조 적용은 손님이 실제로 선택했을 때 한 번에 처리한다.
export function refitWeapon(s,id,choice) {
  if (id!==s.weapon || !s.weapons.includes(id) || !WEAPONS[id]) return false;
  const old=s.refinements?.[id] || null;
  if (old===choice || (choice!==null && !Object.hasOwn(refinements[WEAPONS[id].type],choice))) return false;
  if (choice!==null) {
    const {silver,material,count}=refitPrice(id);
    if (s.silver<silver || (s.inv?.[material] || 0)<count) return false;
    s.silver-=silver;
    s.inv[material]-=count;
    if (!s.inv[material]) delete s.inv[material];
  }
  s.refinements ??= {};
  if (choice===null) delete s.refinements[id];
  else s.refinements[id]=choice;
  return true;
}
