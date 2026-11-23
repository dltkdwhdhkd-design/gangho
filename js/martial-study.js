import { HEARTS, SKILLS } from './data.js';

// This branch of progression is opt-in at character creation. Older saves keep
// use-based mastery until the full meridian migration is ready.
export function newStudy() {
  return { points: 0, skills: {}, hearts: {}, supports: [] };
}
export function rankOfArt(s, id) {
  const ranks = HEARTS[id] ? s.study?.hearts : s.study?.skills;
  return Math.max(1, Math.min(10, Number(ranks?.[id]) || 1));
}
function heartTier(id) {
  if (HEARTS[id]?.tier) return HEARTS[id].tier;
  if (['yigin','taecheong','jaha','changgung','moon_heart'].includes(id)) return 3;
  if (['swift','fury','mercy','sesu'].includes(id)) return 2;
  return 1;
}
export function studyPrice(s, id, learning = false) {
  const skill = SKILLS[id], heart = HEARTS[id];
  if (!skill && (!heart || id === 'none')) return Infinity;
  const tier = skill?.tier ?? heartTier(id);
  const base = skill ? (skill.ult ? 100 : [20, 35, 60][Math.min(3,tier)-1] || 20)
    : [30, 50, 80, 120][Math.min(4,tier)-1] || 30;
  const rank = learning ? 1 : rankOfArt(s, id);
  const uses = learning ? 0 : s.mastery?.[id] || 0;
  const discount = skill ? [5,15,32,60].filter(n => uses >= n).length * .1 : 0;
  return Math.round(base * rank ** 1.5 * (1-discount));
}
export function raiseArt(s, id) {
  const heart = HEARTS[id], rank = rankOfArt(s,id), price = studyPrice(s,id);
  if (!s.study || id === 'none' || rank >= 10 || s.study.points < price ||
      !(heart ? s.hearts : s.skills).includes(id)) return false;
  s.study.points -= price;
  (heart ? s.study.hearts : s.study.skills)[id] = rank+1;
  if (heart && [3,6,9,10].includes(rank+1)) s.ins += rank >= 8 && heartTier(id) >= 3 ? 2 : 1;
  return true;
}
export function heartStrength(s,id=s.heart) {
  if (id==='none' || !HEARTS[id]) return 0;
  const weight=id===s.heart ? 1 : s.study?.supports?.includes(id) ? .3 : 0;
  if (!weight || !s.study) return weight;
  const rank=rankOfArt(s,id);
  return weight*(rank<=5 ? .5+(rank-1)*.125 : 1+(rank-5)*.08);
}
export function awardStudy(s, points) {
  if (s.study) s.study.points += Math.max(0, Math.floor(points));
}
