// 경맥 판: 싸워서 얻는 깨달음(G.S.ins)을 혈자리에 넣어 혈을 뚫는다. 뚫은 혈마다 능력이 오르고, 한 맥을 다 뚫으면 덤이 붙는다.
// 여덟 맥을 넷 이상 다 뚫으면 임맥·독맥이 열리고, 둘 다 뚫으면 임독양맥 타통.
// 깨달음 얻는 길: 경지가 세 번 오를 때마다 1, 처음 쓰러뜨린 보스마다 1, 화산귀환 인물을 비무로 처음 이기면 1(나보다 경지가 높으면 2)
// 효과는 js/state.js bonus()에 더해진다. 판 그림은 js/ui.js tabMeridian
import { G, toast, Sound } from './core.js';

const H = (name, fx) => ({ name, fx });
export const MERIDIANS = [
  { id: 'lung', name: '수태음폐경', what: '체력', pts: [H('중부', { hp: 3 }), H('척택', { hp: 3 }), H('소상', { hp: 4 })], done: { hp: 4, def: 1 } },
  { id: 'li', name: '수양명대장경', what: '공격', pts: [H('상양', { atk: 2 }), H('곡지', { atk: 3 }), H('영향', { atk: 3 })], done: { atk: 3, crit: 1 } },
  { id: 'st', name: '족양명위경', what: '방어', pts: [H('승읍', { def: 1 }), H('족삼리', { def: 2 }), H('여태', { def: 2 })], done: { def: 2, hp: 3 } },
  { id: 'sp', name: '족태음비경', what: '내력 회복', pts: [H('은백', { regen: 6 }), H('삼음교', { regen: 6 }), H('대포', { regen: 8 })], done: { regen: 8, mp: 4 } },
  { id: 'ht', name: '수소음심경', what: '치명', pts: [H('극천', { crit: 1 }), H('신문', { crit: 1 }), H('소충', { crit: 2 })], done: { crit: 2, skill: 3 } },
  { id: 'si', name: '수태양소장경', what: '신법', pts: [H('소택', { spd: 2 }), H('양곡', { spd: 2 }), H('청궁', { spd: 3 })], done: { spd: 3, cd: -2 } },
  { id: 'bl', name: '족태양방광경', what: '쿨타임', pts: [H('정명', { cd: -2 }), H('위중', { cd: -2 }), H('지음', { cd: -3 })], done: { cd: -3, regen: 5 } },
  { id: 'ki', name: '족소음신경', what: '내력', pts: [H('용천', { mp: 4 }), H('태계', { mp: 4 }), H('수부', { mp: 6 })], done: { mp: 6, hp: 2 } },
];
export const VESSELS = [
  { id: 'ren', name: '임맥', what: '음의 바다', pts: [H('회음', { mp: 5 }), H('기해', { regen: 8 }), H('단중', { mp: 5 }), H('승장', { regen: 8 })], done: { mp: 8, hp: 4 } },
  { id: 'du', name: '독맥', what: '양의 바다', pts: [H('장강', { atk: 3 }), H('명문', { hp: 4 }), H('대추', { atk: 3 }), H('백회', { crit: 2 })], done: { atk: 4, def: 3 } },
];
export const TATONG = { name: '임독양맥 타통', fx: { skill: 10, cd: -5, hp: 5, mp: 5 } };
const ALL = [...MERIDIANS, ...VESSELS];
export const cost = (m, i) => m.id === 'ren' || m.id === 'du' ? 2 : i === 2 ? 2 : 1;
export const opened = (S, m) => (S.mer || {})[m.id] || 0;
export const full = (S, m) => opened(S, m) >= m.pts.length;
export const vesselsOpen = S => MERIDIANS.filter(m => full(S, m)).length >= 4;
export function canOpen(S, m) { const i = opened(S, m); if (i >= m.pts.length) return false; if (VESSELS.includes(m) && !vesselsOpen(S)) return false; return (S.ins || 0) >= cost(m, i); }
export function open(S, m) { if (!canOpen(S, m)) return false; const i = opened(S, m); S.ins -= cost(m, i); (S.mer ||= {})[m.id] = i + 1;
  Sound.sfx('power1'); toast(`${m.pts[i].name}혈을 뚫었다${full(S, m) ? ` · ${m.name}이 다 열렸다` : ''}`, 3); if (VESSELS.every(v => full(S, v)) && VESSELS.includes(m) && full(S, m)) toast(`${TATONG.name}! 온몸의 기가 막힘없이 돈다`, 4); return true; }
export function fxOf(S) {
  const b = {}, add = fx => { for (const k in fx) b[k] = (b[k] || 0) + fx[k]; };
  for (const m of ALL) { const n = opened(S, m); for (let i = 0; i < n; i++) add(m.pts[i].fx); if (n >= m.pts.length) add(m.done); }
  if (VESSELS.every(v => full(S, v))) add(TATONG.fx); return b;
}
// 깨달음 얻기
export function gain(n, why) { const S = G.S; if (!S || !n) return; S.ins = (S.ins || 0) + n; toast(`깨달음 +${n}${why ? ` (${why})` : ''} · 메뉴의 경맥에서 혈을 뚫을 수 있다`, 3); }
export function bossDown(id) { const S = G.S; if (!S || !id) return; S.bossWon ||= {}; if (S.bossWon[id]) return; S.bossWon[id] = 1; gain(1, '강적을 꺾었다'); }
// 옛 저장: 경지 세 단계마다 1점을 미리 쳐 준다
export function fillIns(S) { if (S.ins == null) { S.ins = Math.floor((S.lv || 1) / 3); S.mer = S.mer || {}; } }
