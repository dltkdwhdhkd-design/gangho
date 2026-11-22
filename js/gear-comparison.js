import { bonus, stats } from './state.js';
import { WEAPONS, HEARTS } from './data.js';
import { ARMORS, accPut, wearPut, pairOf, setsOf } from './gear.js';
import { ACCS } from './items.js';
import { equipWeapon, basicMpReturn, parryWindow } from './training.js';

const catalogs={weapon:WEAPONS, armor:ARMORS, acc:ACCS, heart:HEARTS};
const inventory={weapon:'weapons',armor:'armors',acc:'accs',heart:'hearts'};

export function changeGear(s,kind,id,slot) {
  if (!catalogs[kind]?.[id] || !s[inventory[kind]]?.includes(id)) return false;
  if (kind==='weapon') return equipWeapon(s,id);
  if (kind==='armor') wearPut(s,id);
  if (kind==='acc') accPut(s,id,slot);
  if (kind==='heart') s.heart=id;
  return true;
}

export function projectGear(s,kind,id,slot) {
  const key=inventory[kind];
  const next={...s,[key]:s[key]?.includes(id)?s[key]:[...(s[key] || []),id]};
  changeGear(next,kind,id,slot);
  return next;
}

export const numberText = n => String(Number(n.toFixed(2)));
const fields = [
  ['atk','공격력'],['def','방어'],['hp','최대 체력'],['mp','최대 내력'],['crit','치명 확률','%'],
  ['power','초식 위력','%'],['basic','기본 공격 위력','%'],['cooldown','재사용 시간','%',true],
  ['cost','초식 내력 소모','%',true],['speed','이동 속도'],['regen','초당 내력'],
  ['basicSpeed','기본 공격 속도','%'],['reach','기본 공격 거리','%'],['poise','자세 피해','%'],
  ['mpHit','기본 공격 적중 내력'],['parry','튕겨내기 시간','초'],['critDmg','치명 피해','%'],
  ['ult','절초 추가 위력','%'],['potion','금창약 회복량','%'],['lifeHit','타격 흡혈','%'],
  ['incoming','받는 피해','%',true],['fury','체력 절반 미만 위력','%'],['mercy','튕겨내기 체력 회복','%'],
  ['moon','튕겨내기 대기 단축','초'],['killHeal','격파 시 체력 회복','%'],
];
export function gearRatings(s) {
  const b=bonus(s), st=stats(s,b);
  return {
    atk:st.atk,def:st.def,hp:st.maxHp,mp:st.maxMp,crit:st.crit*100,speed:st.spd,regen:st.regen,
    cooldown:st.cdMul*100,cost:Math.max(35,100+(b.mpCost || 0)),power:st.power*(100+(b.skill || 0)),
    basic:100+(b.basic || 0),basicSpeed:100+(b.basicSpeed || 0),reach:100+(b.reach || 0),
    poise:100+(b.poiseDmg || 0),mpHit:basicMpReturn(b),parry:parryWindow(b),
    critDmg:160+(b.critDmg || 0),ult:b.ult || 0,potion:35*(1+(b.potion || 0)/100),
    lifeHit:b.lifeHit || 0,incoming:s.heart==='iron_shirt'?90:100,fury:s.heart==='fury'?125:100,
    mercy:s.heart==='mercy'?5:0,moon:s.heart==='moon_heart'?2:0,killHeal:b.killHeal || 0,
  };
}

export function ratingChanges(before,after) {
  return fields.flatMap(([key,label,unit='',lower=false])=>{
    const old=numberText(before[key]),next=numberText(after[key]);
    if (old===next) return [];
    return [{key,label,old:old+unit,next:next+unit,improved:lower?after[key]<before[key]:after[key]>before[key]}];
  });
}
export function effectsOfSet(s) {
  const names=setsOf(s).flatMap(q=>[2,4].filter(n=>q.c>=n).map(n=>q.name+' '+n+'벌'));
  const pair=pairOf(s);
  if (pair) names.push(pair[1]);
  const b=bonus(s);
  if (b.venom) names.push('기본 공격 독');
  if (b.qi) names.push('기본 공격 끝타 검기');
  if (b.armorBasic) names.push('기본 공격 끝타 버티기');
  return names;
}
export function compareGear(s,next,before=gearRatings(s)) {
  const lines=ratingChanges(before,gearRatings(next)).map(c=>
    '<span class="'+(c.improved?'gain':'loss')+'">'+c.label+' '+c.old+' → '+c.next+'</span>');
  const oldSet=effectsOfSet(s),newSet=effectsOfSet(next);
  for (const name of newSet.filter(n=>!oldSet.includes(n))) lines.unshift('<span class="gain">'+name+' 발동</span>');
  for (const name of oldSet.filter(n=>!newSet.includes(n))) lines.unshift('<span class="loss">'+name+' 해제</span>');
  return lines.length?'<small class="equip-delta">'+lines.join(' · ')+'</small>':'';
}
