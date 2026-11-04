// 저장 자료와 능력치 계산
import { G, Sound, toast } from './core.js';
import { WEAPONS, HEARTS, SKILLS, expNeed, rankOf } from './data.js';
const KEY = 'gangho_save_v1';
export const DIFF = { easy: { name: '쉬움', foeAtk: .7, foeHp: .85 }, normal: { name: '보통', foeAtk: 1, foeHp: 1 }, hard: { name: '어려움', foeAtk: 1.3, foeHp: 1.2 } };
export function newState(name, look, gender, diff) {
  return {
    v: 1, name, look, gender, diff, lv: 1, exp: 0, pts: 0, str: 5, con: 5, agi: 5, inn: 5, silver: 20,
    weapon: 'stick', weapons: ['stick'], skills: [], slots: [null, null, null, null], heart: 'none', hearts: ['none'],
    potion: 3, potionMax: 3, mastery: {}, flags: {}, love: { yun: 0, so: 0, cheol: 0 }, pages: [], notes: [], goal: '', map: 'inn', x: 0, y: 0, dir: 0, wanted: {}, time: 0, day: 1,
  };
}
export function stats(S = G.S) {
  const w = WEAPONS[S.weapon];
  const atk = w.atk + S.str * 1.3, maxHp = 90 + S.con * 10 + S.lv * 5, maxMp = 40 + S.inn * 6, def = S.con * .6;
  let regen = 1.8 + S.inn * .08, cdMul = Math.max(.75, 1 - S.agi * .004);
  if (S.heart === 'tonap') regen *= 1.3;
  if (S.heart === 'swift') cdMul *= .85;
  return { atk, maxHp, maxMp, def, regen, cdMul, spd: 78 + S.agi * .7, crit: .03 + S.agi * .004, power: 1 + S.inn * .02, wtype: w.type };
}
export const masteryLv = id => { const n = (G.S.mastery[id] || 0); return n >= 60 ? 5 : n >= 32 ? 4 : n >= 15 ? 3 : n >= 5 ? 2 : 1; };
export function gainExp(n) {
  const S = G.S; S.exp += n; let up = 0;
  while (S.exp >= expNeed(S.lv)) { S.exp -= expNeed(S.lv); S.lv++; S.pts += 3; up++; }
  return up;
}
export function learn(id) {
  const S = G.S; if (S.skills.includes(id)) return false;
  S.skills.push(id);
  const i = S.slots.indexOf(null);
  if (i >= 0 && canEquip(id)) S.slots[i] = id;
  Sound.sfx('bonus'); toast(`초식을 익혔다: ${SKILLS[id].name}`, 3);
  return true;
}
export const canEquip = (id, S = G.S) => { const k = SKILLS[id]; return k.w === '무관' || k.w === WEAPONS[S.weapon].type; };
export function save(slient = true) {
  try { localStorage.setItem(KEY, JSON.stringify(G.S)); if (!slient) toast('저장했습니다'); } catch (e) { if (!slient) toast('저장하지 못했습니다'); }
}
export function load() { try { const r = localStorage.getItem(KEY); return r ? JSON.parse(r) : null; } catch (e) { return null; } }
export function hasSave() { return !!load(); }
export { rankOf };
