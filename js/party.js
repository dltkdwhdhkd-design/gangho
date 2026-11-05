// 동료: 호감을 쌓아 데리고 다니고, 집터에 머물게 하고, 일을 맡기고, 초식을 가르친다
import { G, Sound, toast, josa, esc } from './core.js';
import { Story, ctx, say, narr, choice } from './ctx.js';
import { WHO } from './dialog.js';
import { FOES, MOVES } from './foes.js';
import { DB } from './items.js';
import { SKILLS } from './data.js';
import { have, take, give } from './state.js';

const S = () => G.S, MAX = 2;
const st = () => (S().pt = S().pt || { in: [], home: {}, met: {}, up: {}, moves: {} });
// 인연이 있는 인물
export const COMP = {
  yun: { spr: 'Princess', wpn: 'Ninjaku', hp: .85, atk: .8, moves: ['quick', 'dart3'], fx: { potion: 20 }, good: 1, boon: '금창약 효과 +20%', bark: ['{p}요? 약초가 다르겠네요. 잠깐만요, 이것 좀 뜯고요.', '오늘은 왼쪽 안 맞았죠?', '밥은 제때 먹어야 해요. 강호고 뭐고.'] },
  so: { spr: 'RedSamurai', wpn: 'Sword', hp: 1, atk: 1.1, moves: ['swallow_qi', 'cloud_flash', 'double'], fx: { atk: 3 }, good: 1, boon: '공격 +3%', bark: ['{p}까지 왔네. 사부가 들으면 웃겠다.', '왼발 늦었어. 방금 그 돌부리.', '여기서 지는 사람이 술 사기다.'] },
  cheol: { spr: 'Monk2', wpn: 'Club', hp: 1.35, atk: .95, moves: ['luohan', 'iron_fist', 'earth_stomp'], fx: { hp: 5 }, good: 1, fac: 'shaolin', boon: '체력 +5%', bark: ['시주, {p}에는 뭐가 맛있소?', '부처님도 여기까지는 안 와 보셨을 것이오.', '배가 고프오. 말이 아니라 사실이오.'] },
  baekrang: { spr: 'Cavegirl', wpn: 'Ninjaku', hp: .9, atk: 1.05, moves: ['quick', 'dart3', 'blink'], fx: { crit: 3 }, boon: '치명타 +3%', bark: ['{p} 장사꾼들은 셈이 빨라요. 조심해요.', '여기 소문은 값이 얼마나 하려나.', '돈 냄새가 나요. 아, 아닌가.'] },
  hyeok: { spr: 'Hyeok', wpn: 'Ninjaku', hp: .95, atk: 1.15, moves: ['blink', 'flurry', 'venom'], fx: { skill: 4 }, boon: '초식 위력 +4%', bark: ['{p}. 교리서에는 없던 곳입니다.', '사람들이 저를 쳐다봅니다. 제가 무엇을 잘못했습니까.', '이 길은 어디로 갑니까. 아니, 묻는 것이 아니라 궁금한 것입니다.'] },
  clan_dang: { spr: 'Dang', wpn: 'Ninjaku', hp: .9, atk: 1, moves: ['dart3', 'venom', 'quick'], fx: { atk: 2, regen: 8 }, good: 1, fac: 'dang', boon: '공격 +2%, 내력 회복 +8%', bark: ['{p}의 약재는 독으로 쓰면 좋아요.', '그 물 마시지 마요. 아니, 마셔도 되는데 재미없어서요.', '오늘도 안 죽었네요. 다행이에요. 아마도요.'] },
  clan_moyong: { spr: 'Moyong', wpn: 'Rapier', hp: .95, atk: 1.05, moves: ['flurry', 'swallow_qi', 'blink'], fx: { parry: .02, skill: 2 }, good: 1, fac: 'moyong', boon: '튕겨내기 쉬움, 초식 위력 +2%', bark: ['{p}이라. 시 한 수 나올 만하오. 나는 아니지만.', '그대는 걸을 때 왼발이 늦소.', '받은 것은 돌려주겠소. 어제 그 국수 말이오.'] },
  clan_namgung: { spr: 'Namgung', wpn: 'Rapier', hp: 1.1, atk: 1.2, moves: ['cloud_flash', 'flurry', 'wind_turn'], fx: { atk: 4 }, good: 1, fac: 'namgung', boon: '공격 +4%', bark: ['{p}에도 국수는 있겠지.', '다음에는 내가 이긴다. 오늘 말고.', '남궁세가 사람은 길을 묻지 않는다. 그러니 네가 물어라.'] },
  // 강호에서 만나는 사람들
  c_haho: { name: '하후민', spr: 'Noble', wpn: 'Sword', hp: .9, atk: .9, moves: ['double', 'lunge', 'x_jabhak1'], fx: { hp: 3, atk: 2 }, good: 1, boon: '체력 +3%, 공격 +2%', at: 'c_nakyang', x: 9, y: 12, hint: '외상값에 시달리는 도련님', bark: ['{p}에 우리 집안 별장이 있었지. 있었어. 지금은 없고.', '칼은 내가 뽑을 테니 값은 네가 내.', '명문 세가 사람이 왜 걸어 다니느냐고 묻지 마.'] },
  c_mun: { name: '문창', spr: 'Villager', wpn: 'Stick', hp: .75, atk: .75, moves: ['quick', 'x_jabhak4'], fx: { decode: 20 }, good: 1, boon: '잔권 해독이 빨라진다', at: 'c_changan', x: 30, y: 12, hint: '책만 보는 서생', bark: ['{p}이 옛 지리지에는 이렇게 안 나오는데요.', '잠깐만요, 이 비석 좀 읽고요.', '칼 쓰는 책도 읽었습니다. 읽기만 했습니다.'] },
  c_owol: { name: '오월', spr: 'Cavegirl2', wpn: 'Lance', hp: 1.05, atk: 1.05, moves: ['one_point', 'sweep_army', 'lunge'], fx: { crit: 2, gather: 1 }, boon: '치명타 +2%, 채집이 두 배', at: 'c_yeongyeong', x: 30, y: 17, hint: '범 잡는 여자', bark: ['{p} 숲은 짐승 길이 넓네.', '바람이 바뀌었어. 뒤에 뭐가 있나 봐.', '사람 사냥은 재미없어. 말이 많아서.'] },
  c_hyegong: { name: '혜공', spr: 'Sodi', wpn: 'Club', hp: 1.25, atk: 1, moves: ['luohan', 'earth_stomp', 'x_gaebang2'], fx: { hp: 4, def: 2 }, boon: '체력 +4%, 방어 +2', at: 'c_seongdo', x: 9, y: 17, hint: '술 취한 스님', bark: ['{p} 술은 물을 탔다. 부처님이 보신다.', '계율은 깨라고 있는 게 아니고 잊으라고 있는 거야.', '자네 어깨에 힘 빼. 술 한잔 하면 빠지네.'] },
  c_saira: { name: '사이라', spr: 'Woman', wpn: 'Rapier', hp: .95, atk: 1.15, moves: ['flurry', 'blink', 'quick'], fx: { crit: 4 }, boon: '치명타 +4%', at: 'oasis', x: 26, y: 18, hint: '서역 여검객', bark: ['{p}은 물이 많아서 싫어.', '너희 말은 어렵다. 칼은 쉽다.', '내 고향에서는 이런 날 낙타를 잡는다.'] },
  c_gal: { name: '갈 선생', spr: 'OldMan3', wpn: 'Stick', hp: .85, atk: .7, moves: ['quick', 'dart3'], fx: { potion: 30 }, boon: '금창약 효과 +30%', at: 'c_suzhou', x: 31, y: 12, hint: '돌팔이 의원', bark: ['{p} 사람들은 위장이 약해. 내가 봤어.', '죽을 병은 아니야. 아마. 나도 몰라.', '약값은 나중에 받겠네. 살아 있으면.'] },
  c_yang: { name: '양춘', spr: 'EggBoy', wpn: 'Ninjaku', hp: .8, atk: .85, moves: ['quick', 'dart3', 'blink'], fx: { silver: 20 }, boon: '싸움에서 얻는 은자 +20%', at: 'c_guangzhou', x: 31, y: 17, hint: '수상한 좀도둑', bark: ['{p} 사람들은 주머니가 왼쪽이야.', '내가 훔친 게 아니라 떨어져 있던 거야.', '형님, 저 사람 비단 신을 신었어. 아, 그냥 그렇다고.'] },
  c_gu: { name: '구 노창', spr: 'OldMan2', wpn: 'Lance', hp: 1.15, atk: 1.05, moves: ['one_point', 'dragon_pass', 'sweep_army'], fx: { def: 4 }, good: 1, boon: '방어 +4', at: 'c_yeongyeong', x: 9, y: 12, hint: '은퇴한 창수', bark: ['{p}에서 싸운 적이 있지. 그때도 비가 왔어.', '요즘 젊은것들은 창을 너무 빨리 뺀다.', '허리가 아프면 비가 온다네. 지금 아파.'] },
};
for (const k in COMP) if (COMP[k].name && !WHO[k]) WHO[k] = { name: COMP[k].name, face: COMP[k].spr };
const nameOf = id => COMP[id].name || WHO[id]?.name || id;
const love = id => S().love[id] || 0, addLove = (id, n) => { S().love[id] = Math.min(100, love(id) + n); };
const known = () => Object.keys(st().met).filter(k => COMP[k]);
const isIn = id => st().in.includes(id);
// 합류. 강호 인물은 저마다 합류 조건이 있다
const JOIN = {
  c_haho: async id => { await say(id, '주인장이 외상값을 오늘 다 내라는군. 명문 세가 사람이 체면이 있지.'); await say(id, '은자 120냥만 빌려주면 어디든 따라가지. 진심이야. 다른 데 갈 데도 없어.'); const c = await choice('외상값을 대신 낼까? (은자 120냥)', ['내 준다', '그만둔다']); if (c) return false; if (S().silver < 120) { await say(null, '주머니가 비었다.'); return false; } S().silver -= 120; return true; },
  c_mun: async id => { await say(id, '이 책 뒷장이 없습니다. 어디 가면 있을까요. 강호에 나가면 있을까요.'); const n = Object.values(S().scrap || {}).reduce((a, b) => a + b, 0); if (n < 1) { await say(id, '혹시 비급 잔권 같은 걸 구하시면 보여 주십시오. 저는 그런 걸 읽는 사람입니다.'); return false; } await say(id, '그거 잔권 아닙니까? 제가 읽어 드리겠습니다. 따라가도 됩니까?'); return true; },
  c_owol: async id => { await say(id, '칼 찼네. 쓸 줄은 알아? 나랑 붙어서 서 있으면 따라가 줄게.'); return ctx.duel({ foes: [G.party.spar(id)], arena: 'forest', bgm: 'fight', title: '오월과 비무', optional: true, noIntro: true, noFollow: true }); },
  c_hyegong: async id => { await say(id, '자네 술 있나. 없으면 얘기 끝이고.'); if (have('plum_wine') < 1) { await say(id, '매화주 한 병이면 내가 극락까지도 따라가지.'); return false; } const c = await choice('매화주를 건넬까?', ['건넨다', '그만둔다']); if (c) return false; take('plum_wine'); await say(id, '좋아, 가세. 어디든 술은 있겠지.'); return true; },
  c_saira: async id => { await say(id, '너 강해? 나는 여기서 할 일이 없어. 강한 사람 따라가면 일이 생긴다.'); return ctx.duel({ foes: [G.party.spar(id)], arena: 'sand', bgm: 'fight', title: '사이라와 비무', optional: true, noIntro: true, noFollow: true }); },
  c_gal: async id => { await say(id, '약초가 없어서 병을 못 고치고 있네. 사실 약초가 있어도 못 고치지만.'); if (have('herb') < 5) { await say(id, '약초 다섯 뿌리만 구해 오게. 그럼 내가 자네 주치의가 되어 주지.'); return false; } take('herb', 5); await say(id, '좋아. 오늘부터 자네는 내 환자야.'); return true; },
  c_yang: async id => { await say(id, '형님, 살려 주쇼. 관아에 벌금 은자 80냥이 밀렸는데 안 내면 손을 자른답니다.'); const c = await choice('벌금을 대신 낼까? (은자 80냥)', ['내 준다', '그만둔다']); if (c) return false; if (S().silver < 80) { await say(null, '주머니가 비었다.'); return false; } S().silver -= 80; await say(id, '평생 모시겠습니다. 평생이 언제까지인지는 모르겠지만.'); return true; },
  c_gu: async id => { await say(id, '젊은이, 창 든 늙은이는 시시한 사람은 안 따라가.'); if (S().lv < 14) { await say(id, '조금 더 커서 오게.'); return false; } await say(id, '눈빛은 쓸 만하군. 마지막으로 한 번 더 나가 볼까.'); return true; },
};
async function join(id) {
  const p = st(); if (p.in.length >= MAX) { await say(null, `이미 ${MAX}명이 함께 다닌다. 메뉴의 동료 탭에서 자리를 비워야 한다.`); return false; }
  p.in.push(id); p.met[id] = 1; delete p.home[id]; Sound.sfx('ok3'); toast(`${nameOf(id)}이(가) 동료가 되었다`, 3); G.field.refresh(); return true;
}
const leave = id => { const p = st(); p.in = p.in.filter(k => k !== id); };
// 이름난 인물과 나누는 말
async function chat(id) { const c = COMP[id], s = S(); if (id.startsWith('c_') && G.bond.next(id)) return G.bond.play(id); if (!s.daily['chat_' + id]) { s.daily['chat_' + id] = 1; addLove(id, 3); } await say(id, c.bark[Math.floor(Math.random() * c.bark.length)].replace(/\{p\}/g, '이곳')); }
async function compTalk(id) {
  const p = st(), opts = [['이야기한다', () => chat(id)]];
  if (p.met[id]) { if (isIn(id)) opts.push(['잠시 헤어진다', async () => { leave(id); await say(id, '알았어. 또 보자.'); }]); else opts.push(['같이 가자고 한다', () => join(id)]); }
  else opts.push(['같이 다니자고 한다', async () => { if (await JOIN[id](id)) await join(id); }]);
  opts.push(['그만둔다', async () => { }]); const c = await choice(`${nameOf(id)} · ${COMP[id].hint || ''}`, opts.map(o => o[0])); await opts[c][1]();
}
// 인연 메뉴에 끼우는 항목
function loveOpt(id) {
  if (!COMP[id] || isIn(id)) return isIn(id) ? ['잠시 헤어진다', async () => { leave(id); await say(id, '알았어요. 몸조심해요.'); G.field.refresh(); }] : null;
  if (love(id) < 20) return null; return ['같이 다니자고 한다', () => join(id)];
}
// 전투에 끌고 들어갈 몸
function body(id, lv) {
  const c = COMP[id], k = 'pty_' + id, up = 1 + love(id) / 500 + (st().up[id] || 0) * .02, extra = (st().moves[id] || []).filter(m => MOVES[m]);
  FOES[k] = { name: nameOf(id), spr: 'chars/' + c.spr, hp: Math.round((70 + lv * 32) * c.hp * up), atk: (6 + lv * 1.25) * c.atk * up, def: 1 + lv * .3, spd: 64, exp: 0, silver: 0, pause: 1.05, moves: [...new Set([...c.moves, ...extra])], wpn: c.wpn, guard: .5 };
  return k;
}
const allies = cfg => { const s = S(), p = st(); if (!p.in.length || cfg.noFollow || cfg.spar || cfg.yieldAt || (s.mode !== 'free' && !cfg.optional)) return cfg; return { ...cfg, allies: [...(cfg.allies || []), ...p.in.map(id => body(id, s.lv))] }; };
const duel1 = ctx.duel; ctx.duel = async cfg => { const won = await duel1(allies(cfg)); if (won && G.S?.pt) for (const id of G.S.pt.in) addLove(id, 1); return won; };
function fx() { const b = {}, p = G.S?.pt; if (p) for (const id of p.in) for (const k in COMP[id].fx) b[k] = (b[k] || 0) + COMP[id].fx[k]; return b; }
// 집터
const JOBS = { herb: ['약초를 캔다', () => give('herb', 2), '약초 2'], fish: ['물고기를 잡는다', () => give('f_crucian', 1), '붕어 1'], ore: ['광석을 캔다', () => give('ore_iron', 2), '철광석 2'], train: ['수련한다', (id) => { st().up[id] = Math.min(25, (st().up[id] || 0) + 1); }, '실력 상승'] };
function daily() {
  const p = G.S?.pt; if (!p) return; const got = [];
  for (const id in p.home) { const j = JOBS[p.home[id]]; if (j) { j[1](id); got.push(`${nameOf(id)}: ${j[2]}`); } }
  if (got.length) toast(`집터 소식 · ${got.join(', ')}`, 3.4);
  const fr = S().fr; if (!fr) return;
  for (const id of [...p.in]) { addLove(id, 2); const c = COMP[id]; if ((c.good && fr.infamy >= 70) || (c.fac && G.jh.hostile(c.fac))) { leave(id); love(id) > 10 && addLove(id, -10); toast(`${nameOf(id)}이(가) 말없이 떠났다`, 4); } }
}
function bark(prov) { const p = G.S?.pt; if (!p?.in.length || Math.random() > .3) return; const id = p.in[Math.floor(Math.random() * p.in.length)], c = COMP[id]; toast(`${nameOf(id)}: ${c.bark[Math.floor(Math.random() * c.bark.length)].replace(/\{p\}/g, prov)}`, 3.6); }
async function teach(id) {
  const c = COMP[id], p = st(), L = S().skills.filter(k => MOVES[k] && !c.moves.includes(k) && SKILLS[k]?.w !== undefined && !(p.moves[id] || []).includes(k)).slice(-8), n = (p.moves[id] || []).length;
  if (n >= 3) { await say(id, '머리에 더 안 들어가요.'); return; } if (!L.length) { await say(null, '가르칠 만한 초식이 없다.'); return; }
  const o = [...L.map(k => SKILLS[k].name), '그만둔다'], k = await choice(`${nameOf(id)}에게 무엇을 가르칠까? (${n}/3)`, o); if (k >= L.length) return;
  (p.moves[id] = p.moves[id] || []).push(L[k]); addLove(id, 5); await G.life.sleepNow(); toast(`${nameOf(id)}이(가) ${SKILLS[L[k]].name}을(를) 익혔다`, 3);
}
function tab(B) {
  const s = S(), p = st(), L = known(), row = id => { const c = COMP[id], home = p.home[id]; return `<div class="note" style="margin-bottom:6px;padding:8px 10px"><b style="font-weight:400;font-size:18px">${esc(nameOf(id))}</b> <small class="hint">호감 ${love(id)} · ${c.boon}${id.startsWith('c_') && G.bond.next(id) ? ' · <b style="font-weight:400;color:var(--red)">할 얘기가 있는 듯하다</b>' : ''}${isIn(id) ? ' · 동행 중' : home !== undefined ? ` · 집터(${home ? JOBS[home][0] : '쉬는 중'})` : ''}</small><div class="hint">쓰는 초식: ${[...c.moves, ...(p.moves[id] || [])].map(m => SKILLS[m]?.name).filter(Boolean).join(', ') || '기본기'}</div><div style="margin-top:5px;display:flex;gap:5px;flex-wrap:wrap">${isIn(id) ? `<button class="btn sm" data-a="out" data-i="${id}">빼기</button><button class="btn sm" data-a="say" data-i="${id}">말 걸기</button><button class="btn sm" data-a="teach" data-i="${id}">초식 가르치기</button>` : `<button class="btn sm" data-a="in" data-i="${id}">데려가기</button>`}${s.flags.own_house && !isIn(id) ? Object.keys(JOBS).map(j => `<button class="btn sm ${home === j ? 'pri' : ''}" data-a="job" data-j="${j}" data-i="${id}">${JOBS[j][0]}</button>`).join('') : ''}</div></div>`; };
  B.innerHTML = `<p class="hint">호감을 쌓은 사람에게 같이 다니자고 할 수 있다. 함께 다니는 사람은 ${MAX}명까지다. 집을 사면 남은 사람에게 일을 맡길 수 있다.</p>${L.map(row).join('') || '<p class="hint">아직 함께 다니는 사람이 없다. 인연을 쌓거나 도시를 돌아보자.</p>'}`;
  B.querySelectorAll('[data-a]').forEach(b => b.onclick = () => { const id = b.dataset.i, a = b.dataset.a; if (a === 'out') { leave(id); p.home[id] = p.home[id] ?? null; tab(B); G.field.refresh(); } if (a === 'in') { if (p.in.length >= MAX) { toast(`${MAX}명까지다`, 2); return; } p.in.push(id); delete p.home[id]; tab(B); G.field.refresh(); } if (a === 'job') { p.home[id] = p.home[id] === b.dataset.j ? null : b.dataset.j; tab(B); } if (a === 'say') { G.closeMenu(); G.field.run(() => chat(id)); } if (a === 'teach') { G.closeMenu(); G.field.run(() => teach(id)); } });
}
// 강호 인물과 집터 사람을 지도에 놓는다
Story.providers.push(id => {
  const out = { npcs: [], spots: [], trigs: [], roam: [] }; if (!G.S || !G.world?.open()) return out; const p = st();
  for (const k in COMP) { const c = COMP[k]; if (c.at === id && !isIn(k) && p.home[k] === undefined && !p.gone?.[k]) out.npcs.push({ id: k, spr: c.spr, x: c.x, y: c.y, dir: 0, hint: c.hint, talk: () => compTalk(k) }); }
  if (id === 'myhouse') { let i = 0; for (const k in p.home) { if (S().married === k) continue; out.npcs.push({ id: 'home_' + k, spr: COMP[k].spr, x: 3 + i * 2, y: 4, dir: 0, hint: nameOf(k), talk: () => compTalk(k) }); i++; } }
  return out;
});
const spar = id => { const c = COMP[id], k = 'spar_' + id, lv = Math.max(8, S().lv - 1); FOES[k] = { name: nameOf(id), spr: 'chars/' + c.spr, hp: 80 + lv * 30, atk: 8 + lv * 1.3, def: 2 + lv * .3, spd: 66, exp: 20 + lv * 6, silver: 0, pause: 1, moves: c.moves, wpn: c.wpn, guard: .6, poise: 40 + lv * 3 }; return k; };
const dismiss = id => { const p = st(); leave(id); delete p.met[id]; delete p.home[id]; (p.gone = p.gone || {})[id] = 1; G.field.refresh(); };
G.party = { dismiss, fx, tab, join, loveOpt, daily, bark, spar, members: () => G.S?.pt?.in || [], spr: id => COMP[id].spr };
