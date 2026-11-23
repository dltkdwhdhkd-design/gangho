import { rankOfArt } from './martial-study.js';
import { SKILLS, WEAPONS } from './data.js';

const thresholds = [0, 5, 15, 32, 60];
const stages = [
  {at:0, name:'기초'}, {at:2, name:'입문'}, {at:5, name:'소성'}, {at:9, name:'대성'}, {at:12, name:'통달'},
];
export const disciplines = {
  검:{name:'검법', effect:{skill:2}}, 도:{name:'도법', effect:{basic:1, poiseDmg:4}},
  창:{name:'창법', effect:{skill:1, mpCost:-2}}, 권:{name:'권법', effect:{basic:1, mpHit:.25}},
};

export function masteryLevel(uses = 0) {
  for (let rank=thresholds.length; rank>1; rank--) {
    if (uses>=thresholds[rank-1]) return rank;
  }
  return 1;
}

export function practiceOf(s, id) {
  const uses = Math.max(0, Number(s.mastery?.[id]) || 0);
  if (s.study) return {uses,rank:rankOfArt(s,id),next:thresholds.find(n=>n>uses) ?? null};
  const rank = masteryLevel(uses);
  return {uses, rank, next:thresholds[rank] ?? null};
}

export function disciplineOf(s, type) {
  const scores = new Array(5).fill(0);
  for (const id of new Set(s.skills || [])) {
    if (SKILLS[id]?.w === type) scores[Math.min(5,practiceOf(s,id).rank)-1]++;
  }
  let points = 0, room = 3;
  for (let score=4; score>0 && room>0; score--) {
    const count = Math.min(room, scores[score]);
    points += count*score;
    room -= count;
  }
  const level = stages.filter(stage => points >= stage.at).length-1;
  const school = disciplines[type];
  const fx = Object.fromEntries(Object.entries(school?.effect || {}).map(([k,v])=>[k,v*level]));
  return {name:school?.name || type, level, stage:stages[level].name, points, next:stages[level+1]?.at ?? null, fx};
}

export function recordPractice(s,id,amount) {
  if (!SKILLS[id] || !s.skills.includes(id) || !(amount>0)) return null;
  const old = practiceOf(s,id);
  if (old.next === null) return null;
  const gain = Math.min(amount, thresholds.at(-1)-old.uses);
  s.mastery ??= {};
  s.mastery[id] = old.uses+gain;
  return {id,gain,before:old.rank,...practiceOf(s,id)};
}

export function finishStudy(s,id,experience,usedTypes) {
  const skill = SKILLS[id];
  if (!skill || experience<=0 || !usedTypes.size || (skill.w!=='무관' && !usedTypes.has(skill.w))) return null;
  return recordPractice(s,id,experience>=180 ? 3 : experience>=50 ? 2 : 1);
}

export function skillCost(skill,rank,bonuses) {
  return Math.max(0, skill.mp * Math.max(.35,1+(bonuses.mpCost || 0)/100) * (bonuses.studied ? (rank>=3 ? .9 : 1) : 1-(rank-1)*.02));
}
export function skillCooldown(skill,rank,stats) {
  return skill.cd * stats.cdMul * (stats.studied ? (rank>=7 ? .9 : 1) : (rank>=5?.85:1));
}
export function skillPower(skill,rank,stats,bonuses) {
  return stats.power * (1+(rank-1)*(stats.studied ? .06 : .07)) * (1+((bonuses.skill || 0)+(skill.ult ? bonuses.ult || 0 : 0))/100);
}

export const parryWindow = bonuses => .17+(bonuses.parry || 0);
export const basicMpReturn = bonuses => 1.6+(bonuses.mpHit || 0);
export const defenseFactor = defense => 60/(60+defense);
export function skillEstimate(skill,rank,stats,bonuses) {
  for (const step of skill.steps) {
    const hit=step.hit || step.proj || step.zone || step.moonstrike || step.rush || step.counter;
    if (hit && Number.isFinite(hit.mul)) {
      const base=stats.atk*hit.mul*skillPower(skill,rank,stats,bonuses)*defenseFactor(20);
      const label=step.proj?'첫 투사체':step.zone?'첫 범위 타격':step.counter?'반격':'첫 타격';
      return label+' '+Math.max(1,Math.round(base*.93))+'~'+Math.max(1,Math.round(base*1.07));
    }
    if (Number.isFinite(step.heal?.hp)) return '체력 회복 '+Math.round(stats.maxHp*step.heal.hp);
  }
  return '';
}

const fits = (id,type) => SKILLS[id] && (SKILLS[id].w===type || SKILLS[id].w==='무관');
function validSlots(s,slots,type) {
  const used=new Set();
  return Array.from({length:4},(_,i)=>{
    const id=slots?.[i];
    if (!s.skills.includes(id) || !fits(id,type) || used.has(id)) return null;
    used.add(id);
    return id;
  });
}

function initialSlots(s,type,from) {
  const slots=validSlots(s,from,type);
  const learned=(s.skills || []).filter(id=>fits(id,type) && !slots.includes(id));
  const pool=[...learned.filter(id=>SKILLS[id].w===type),...learned.filter(id=>SKILLS[id].w==='무관')];
  // A newly tried weapon gets one of its own techniques even when all previous keys were universal.
  if (slots.every(Boolean) && slots.every(id=>SKILLS[id].w==='무관') && pool[0] && SKILLS[pool[0]].w===type)
    slots[0]=pool.shift();
  return slots.map(id=>id || pool.shift() || null);
}

export function equipWeapon(s,id) {
  if (!WEAPONS[id] || !s.weapons.includes(id)) return false;
  const old=WEAPONS[s.weapon]?.type, type=WEAPONS[id].type;
  if (old!==type) {
    const book={...s.weaponSlots};
    if (old) book[old]=validSlots(s,s.slots,old);
    s.slots=Array.isArray(book[type]) ? validSlots(s,book[type],type) : initialSlots(s,type,s.slots);
    s.weaponSlots=book;
  }
  s.weapon=id;
  return true;
}

export function restoreTraining(s) {
  s.skills ??= [];
  s.mastery ??= {};
  s.weaponSlots ??= {};
  const type=WEAPONS[s.weapon]?.type;
  if (!type) return;
  const old=Array.isArray(s.slots)?s.slots:[];
  const otherTypes=new Set(old.map(id=>SKILLS[id]?.w).filter(t=>disciplines[t] && t!==type));
  for (const other of otherTypes) if (!s.weaponSlots[other]) s.weaponSlots[other]=validSlots(s,old,other);
  s.slots=otherTypes.size?initialSlots(s,type,old):validSlots(s,old,type);
  if (!s.skills.includes(s.studyFocus) || !SKILLS[s.studyFocus]) s.studyFocus=null;
}
