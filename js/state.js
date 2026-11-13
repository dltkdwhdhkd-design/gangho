// 저장 자료와 능력치 계산
import { G, Sound, toast } from './core.js';
import { WEAPONS, HEARTS, SKILLS, expNeed, rankOf } from './data.js';
import { DB, ACCS, TREES } from './items.js';
const KEY = 'gangho_save_v1';
export const DIFF = { easy: { name: '쉬움', foeAtk: .7, foeHp: .85 }, normal: { name: '보통', foeAtk: 1, foeHp: 1 }, hard: { name: '어려움', foeAtk: 1.3, foeHp: 1.2 } };
export function newState(name, look, gender, diff) {
  return {
    v: 3, name, look, gender, diff, title: '떠돌이 낭인', titles: ['ronin', 'dog'], sworn: null, side: null, lv: 1, exp: 0, pts: 0, str: 5, con: 5, agi: 5, inn: 5, silver: 0,
    weapon: 'mop', weapons: ['mop'], skills: [], slots: [null, null, null, null], heart: 'none', hearts: ['none'],
    potion: 3, potionMax: 3, rep: { jeong: 0, sa: 0, ma: 0 }, inv: {}, accs: [], tree: {}, tp: 0, acc: null, wplus: {}, meal: null, house: { lv: 0, items: [], furn: {} }, daily: {}, taken: {}, fishLog: {}, partner: null, married: null, mastery: {}, flags: {}, love: { yun: 0, so: 0, cheol: 0, clan_dang: 0, clan_moyong: 0, clan_namgung: 0, baekrang: 0, hyeok: 0 }, pages: [], notes: [], goal: '', map: 'inn', x: 0, y: 0, dir: 0, wanted: {}, time: 0, day: 1, seen: {}, bonds: {},
  };
}
// 무공 트리, 장신구, 요리, 배우자, 집에서 오는 효과를 합친다
export const SPOUSE_FX = { yun: { potion: 25, hp: 6 }, so: { atk: 6, crit: 3 }, cheol: { hp: 10, def: 4 }, clan_dang: { venom: 1, atk: 3 }, clan_moyong: { parry: .04, skill: 5 }, clan_namgung: { atk: 8 }, baekrang: { crit: 5, atk: 3 }, hyeok: { skill: 8, hp: 4 } };
export function bonus(S = G.S) {
  const b = {}, add = fx => { for (const k in fx) b[k] = (b[k] || 0) + fx[k]; };
  const wt = WEAPONS[S.weapon].type;
  for (const t of TREES) { if (t.w && t.w !== wt) continue; for (const n of t.nodes) { const r = S.tree[n.id] || 0; for (let i = 0; i < r; i++) add(n.fx); } }
  if (S.acc && ACCS[S.acc]) add(ACCS[S.acc].fx);
  if (HEARTS[S.heart]?.fx) add(HEARTS[S.heart].fx);
  if (G.party) add(G.party.fx());
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
// 저장은 두 가지다. 자동 저장(이어 하기)은 이 브라우저에 계속 덮어쓰고, 저장 칸은 고른 순간을 그대로 남긴다.
// 파일 내보내기는 누른 그 순간을 파일 한 장으로 받는다. 받은 파일은 다시 바뀌지 않는다
export function save(slient = true) {
  if (G.noSave) return;  // 새 화면 시제품의 둘러보기 판은 자동 저장하지 않는다
  try { localStorage.setItem(KEY, JSON.stringify(G.S)); if (!slient) toast('저장했습니다'); } catch (e) { if (!slient) toast('저장하지 못했습니다'); }
}
const fileName = S => `강호행_${S.name}_${S.day}일째_${new Date().toISOString().slice(0, 16).replace(/[-:T]/g, '')}.json`;
function download(text, name) {
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type: 'application/json' })); a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}
// 지금 이 순간을 파일 한 장으로 내보낸다
export function saveToFile(S = G.S) { download(JSON.stringify(S), fileName(S)); toast('지금 상태를 파일로 내보냈습니다', 3); }
// ── 저장 칸 ──
export const SLOTS = 12;
const SK = i => 'gangho_slot_' + i;
function rec(i) { try { const r = localStorage.getItem(SK(i)); return r ? JSON.parse(r) : null; } catch (e) { return null; } }
export function slotInfo(i) { return rec(i)?.meta || null; }
export function autoInfo() { const S = load(); return S ? metaOf(S, '') : null; }
export function metaOf(S, place, shot) { return { name: S.name, lv: S.lv, day: S.day, mode: S.mode, night: !!S.flags?.night, place: place || '', at: Date.now(), shot: shot || '' }; }
export function saveSlot(i, place, shot) {
  const S = G.S; try { localStorage.setItem(SK(i), JSON.stringify({ meta: metaOf(S, place, shot), data: S })); return true; }
  catch (e) { // 그림이 커서 칸이 모자라면 그림을 빼고 한 번 더
    try { localStorage.setItem(SK(i), JSON.stringify({ meta: metaOf(S, place, ''), data: S })); return true; } catch (e2) { return false; }
  }
}
export function loadSlot(i) { const r = rec(i); return r ? fill(migrate(r.data)) : null; }
export function delSlot(i) { try { localStorage.removeItem(SK(i)); } catch (e) { /* 지울 것이 없다 */ } }
export function exportSlot(i) { const r = rec(i); if (!r) return; download(JSON.stringify(r.data), fileName(r.data)); toast(`${i + 1}번 칸을 파일로 내보냈습니다`, 3); }
// 파일을 읽어 저장 상태로 바꾼다. 자동 저장에는 쓰지 않는다
export async function readSaveFile(file) {
  const d = JSON.parse(await file.text());
  if (!d || !d.name || !d.flags) throw new Error('강호행 저장 파일이 아닙니다');
  return fill(migrate(d));
}
export function importToSlot(i, S, place = '파일에서 가져옴') { try { localStorage.setItem(SK(i), JSON.stringify({ meta: metaOf(S, place, ''), data: S })); return true; } catch (e) { return false; } }
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
function fill(S) { if (!S.rep) S.rep = { jeong: 0, sa: 0, ma: 0 }; if (S.rep.ma === undefined) S.rep.ma = 0; if (S.side === undefined) S.side = null; if (!S.title) S.title = '떠돌이 낭인'; if (!S.titles) S.titles = ['ronin', 'dog']; if (S.sworn === undefined) S.sworn = null; if (!S.bonds) S.bonds = {}; if (S.flags.cleared && !S.flags.ended) { S.flags.chief_down = true; S.flags.cleared = false; } if (!S.seen) { const f = S.flags, q = { cheongha: 1, [S.map]: 1 }; if (f.burned) q.valley = 1; if (f.bamboo_open) q.bamboo = 1; if (f.pass_open) q.pass = 1; if (f.fort_open) q.fort = 1; if (f.cloud_open) q.cloudmt = 1; if (f.boat_guhwa) Object.assign(q, { guhwa: 1, ninehall: 1, fiveclans: 1, shaolin: 1, hwasan: 1 }); S.seen = q; } return S; }
export const have = id => (G.S.inv[id] || 0);
export function give(id, n = 1) { G.S.inv[id] = have(id) + n; }
export function take(id, n = 1) { G.S.inv[id] = have(id) - n; if (G.S.inv[id] <= 0) delete G.S.inv[id]; }
export function nextDay() { const S = G.S; S.day++; S.daily = {}; S.potion = Math.max(S.potion, S.potionMax); if (S.mode === 'free' && G.free) G.free.daily(); if (G.jh) G.jh.daily(); if (G.party) G.party.daily(); G.slave?.daily(); }
export function hasSave() { return !!load(); }
export { rankOf };
