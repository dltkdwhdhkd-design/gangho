// 저장 자료와 능력치 계산
import { G, Sound, toast } from './core.js';
import { WEAPONS, HEARTS, SKILLS, expNeed, rankOf } from './data.js';
import { DB, ACCS, TREES } from './items.js';
const KEY = 'gangho_save_v1';
export const DIFF = { easy: { name: '쉬움', foeAtk: .7, foeHp: .85 }, normal: { name: '보통', foeAtk: 1, foeHp: 1 }, hard: { name: '어려움', foeAtk: 1.3, foeHp: 1.2 } };
export function newState(name, look, gender, diff) {
  return {
    v: 3, name, look, gender, diff, title: '떠돌이 낭인', titles: ['ronin', 'dog'], sworn: null, side: null, lv: 1, exp: 0, pts: 0, str: 5, con: 5, agi: 5, inn: 5, silver: 20,
    weapon: 'stick', weapons: ['stick'], skills: [], slots: [null, null, null, null], heart: 'none', hearts: ['none'],
    potion: 3, potionMax: 3, rep: { jeong: 0, sa: 0, ma: 0 }, inv: {}, accs: [], tree: {}, tp: 0, acc: null, wplus: {}, meal: null, house: { lv: 0, items: [], furn: {} }, daily: {}, taken: {}, fishLog: {}, partner: null, married: null, mastery: {}, flags: {}, love: { yun: 0, so: 0, cheol: 0, clan_dang: 0, clan_moyong: 0, clan_namgung: 0, baekrang: 0, hyeok: 0 }, pages: [], notes: [], goal: '', map: 'inn', x: 0, y: 0, dir: 0, wanted: {}, time: 0, day: 1,
  };
}
// 무공 트리, 장신구, 요리, 배우자, 집에서 오는 효과를 합친다
export const SPOUSE_FX = { yun: { potion: 25, hp: 6 }, so: { atk: 6, crit: 3 }, cheol: { hp: 10, def: 4 }, clan_dang: { venom: 1, atk: 3 }, clan_moyong: { parry: .04, skill: 5 }, clan_namgung: { atk: 8 }, baekrang: { crit: 5, atk: 3 }, hyeok: { skill: 8, hp: 4 } };
export function bonus(S = G.S) {
  const b = {}, add = fx => { for (const k in fx) b[k] = (b[k] || 0) + fx[k]; };
  const wt = WEAPONS[S.weapon].type;
  for (const t of TREES) { if (t.w && t.w !== wt) continue; for (const n of t.nodes) { const r = S.tree[n.id] || 0; for (let i = 0; i < r; i++) add(n.fx); } }
  if (S.acc && ACCS[S.acc]) add(ACCS[S.acc].fx);
  if (S.meal && S.meal.left > 0) add(DB[S.meal.id].meal);
  if (S.married && SPOUSE_FX[S.married]) add(SPOUSE_FX[S.married]);
  if (S.sworn && SPOUSE_FX[S.sworn]) add(SPOUSE_FX[S.sworn]);
  if (S.rested === S.day) add({ atk: 5 });
  return b;
}
export function stats(S = G.S) {
  const w = WEAPONS[S.weapon], b = bonus(S), plus = (S.wplus || {})[S.weapon] || 0, pc = k => 1 + (b[k] || 0) / 100;
  const atk = (w.atk * (1 + plus * .12) + S.str * 1.3) * pc('atk'), maxMp = Math.round((40 + S.inn * 6) * pc('mp')), def = S.con * .6 + (b.def || 0);
  let maxHp = (90 + S.con * 10 + S.lv * 5) * pc('hp'), regen = (1.8 + S.inn * .08) * pc('regen'), cdMul = Math.max(.75, 1 - S.agi * .004) * pc('cd'), power = 1 + S.inn * .02;
  if (S.heart === 'tonap') regen *= 1.3;
  if (S.heart === 'swift') cdMul *= .85;
  if (S.heart === 'yigin') maxHp *= 1.15;
  if (S.heart === 'sesu') { regen *= 1.2; maxHp *= 1.05; }
  if (S.heart === 'taecheong') regen *= 1.5;
  if (S.heart === 'jaha') power *= 1.12;
  if (S.heart === 'changgung') { cdMul *= .9; maxHp *= 1.1; }
  maxHp = Math.round(maxHp);
  return { atk, maxHp, maxMp, def, regen, cdMul, spd: (78 + S.agi * .7) * pc('spd'), crit: .03 + S.agi * .004 + (b.crit || 0) / 100, power, wtype: w.type };
}
export const masteryLv = id => { const n = (G.S.mastery[id] || 0); return n >= 60 ? 5 : n >= 32 ? 4 : n >= 15 ? 3 : n >= 5 ? 2 : 1; };
export function gainExp(n) {
  const S = G.S; S.exp += n; let up = 0;
  while (S.exp >= expNeed(S.lv)) { S.exp -= expNeed(S.lv); S.lv++; S.pts += 3; S.tp = (S.tp || 0) + 1; up++; }
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
let fileHandle = null; // 기기에 고른 저장 파일. 지원하는 브라우저에서는 저장할 때마다 함께 갱신한다
async function writeFile(handle, text) { const w = await handle.createWritable(); await w.write(text); await w.close(); }
export function save(slient = true) {
  try { localStorage.setItem(KEY, JSON.stringify(G.S)); if (!slient) toast('저장했습니다'); } catch (e) { if (!slient) toast('저장하지 못했습니다'); }
  if (fileHandle) writeFile(fileHandle, JSON.stringify(G.S)).catch(() => { fileHandle = null; });
}
export async function saveToFile() {
  const S = G.S, text = JSON.stringify(S), name = `강호행_${S.name}_${S.day}일째.json`;
  if (window.showSaveFilePicker) {
    try {
      fileHandle = await window.showSaveFilePicker({ suggestedName: name, types: [{ description: '강호행 저장 파일', accept: { 'application/json': ['.json'] } }] });
      await writeFile(fileHandle, text); toast('기기에 저장했습니다. 이제 저장할 때마다 이 파일도 갱신됩니다.', 4); return;
    } catch (e) { if (e.name === 'AbortError') return; fileHandle = null; }
  }
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type: 'application/json' })); a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  toast('다운로드 폴더에 저장했습니다', 3);
}
export async function loadFromFile(file) {
  const d = JSON.parse(await file.text());
  if (!d || !d.name || !d.flags) throw new Error('강호행 저장 파일이 아닙니다');
  const S = fill(migrate(d)); localStorage.setItem(KEY, JSON.stringify(S)); return S;
}
export function load() { try { const r = localStorage.getItem(KEY); return r ? fill(migrate(JSON.parse(r))) : null; } catch (e) { return null; } }
// 예전 저장을 새 형식으로 옮긴다
function migrate(S) {
  if ((S.v || 1) < 2) {
    const d = newState(S.name, S.look, S.gender, S.diff);
    for (const k in d) if (S[k] === undefined) S[k] = d[k];
    for (const k in d.love) { if (S.love[k] === undefined) S.love[k] = 0; else S.love[k] *= 15; }
    S.tp = S.lv - 1; S.v = 2;
  }
  if (S.v < 3) { // 주인공은 남성으로 고정, 철우는 인연에서 의형제로
    S.gender = 'm'; if (['Cavegirl2', 'Woman', 'Villager4'].includes(S.look)) S.look = 'BlueSamurai';
    if (S.married === 'cheol' || S.partner === 'cheol') { S.sworn = 'cheol'; if (S.married === 'cheol') S.married = null; if (S.partner === 'cheol') S.partner = null; }
    S.v = 3;
  }
  return S;
}
function fill(S) { if (!S.rep) S.rep = { jeong: 0, sa: 0, ma: 0 }; if (S.rep.ma === undefined) S.rep.ma = 0; if (S.side === undefined) S.side = null; if (!S.title) S.title = '떠돌이 낭인'; if (!S.titles) S.titles = ['ronin', 'dog']; if (S.sworn === undefined) S.sworn = null; return S; }
export const have = id => (G.S.inv[id] || 0);
export function give(id, n = 1) { G.S.inv[id] = have(id) + n; }
export function take(id, n = 1) { G.S.inv[id] = have(id) - n; if (G.S.inv[id] <= 0) delete G.S.inv[id]; }
export function nextDay() { const S = G.S; S.day++; S.daily = {}; S.potion = Math.max(S.potion, S.potionMax); }
export function hasSave() { return !!load(); }
export { rankOf };
