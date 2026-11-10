// 무림 정세: 자유 모드에서 강호가 저 혼자 굴러가는 큰 판들. 무림대회, 정사대전, 무림맹과 마교의 싸움
// 판은 단계를 밟아 나간다. 날이 지나면 저절로 넘어가고, 내가 끼어들면 결과가 바뀐다. 상태는 모두 S.fr.saga에 담겨 저장된다
import { G, Sound, toast, josa, esc, pick, rnd } from './core.js';
import { ctx, say, narr, choice } from './ctx.js';
import { FOES } from './foes.js';
import { FACS, fac } from './free.js';
import { LOCS } from './worlddata.js';
import { SURNAME } from './freedata.js';
import { MAPS } from './maps.js';
import { TITLES } from './titles.js';
import { panel } from './life.js';

const S = () => G.S, Fr = () => G.jh.ensure();
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const CITY = LOCS.filter(l => l.kind === 'city');
const openCity = () => { const o = st()?.occ || {}, L = CITY.filter(l => !o[l.map]); return L.length ? L : CITY; };  // 마교가 차지한 고을에선 대회도 진도 안 연다
const loc = map => LOCS.find(l => l.map === map);
const pname = map => loc(map)?.name || map;
const alive = f => !!f && !G.jh.fallen(f.id) && !Fr().dead?.[f.id];
const side = al => FACS.filter(f => f.align === al && alive(f));
const pow = id => Fr().power[id] || 60;
const top = al => side(al).sort((a, b) => pow(b.id) - pow(a.id))[0];
const news = t => G.jh.news(t);
const isFree = () => S()?.mode === 'free';
const lv = () => S().lv;
const CAMP = { jeong: '정파', sa: '흑도맹' };
// 고수 이름: 세가는 집안 성을, 절은 법명을 쓴다
const GIV = ['운비', '청하', '무진', '현수', '검호', '설린', '소연', '백천', '유화', '진악', '명호', '한결', '서진', '청운', '적암', '은호', '비연', '강후', '태산', '월영'];
const FAM = { namgung: '남궁', moyong: '모용', jegal: '제갈', dang: '당', paeng: '팽', hwangbo: '황보', ak: '악', yang: '양', eon: '언', jin: '진' };
const NICK = ['쾌검', '철권', '청풍검', '혈수', '무영각', '벽력도', '은월검', '광도', '추혼창', '일지선', '비연', '철벽', '취권', '독수', '귀영'];
const hero = f => ['shaolin', 'noeum', 'podalra'].includes(f.id) ? `${pick(['혜', '원', '공', '법'])}${pick(['명', '정', '각', '진', '성', '광'])}` : (FAM[f.id] || pick(SURNAME)) + pick(GIV);

// ── 상태 ──
export function st() {
  const fr = Fr(); if (!fr) return null;
  const g = fr.saga = fr.saga || { v: 2, t: { js: 10, jm: 0 }, arcs: [], cool: { tourney: 2, jsw: 60, demon: 200 }, hist: [], occ: {}, side: null, id: 1, warn: {} };
  if (!g.v) { g.v = 2; g.t.js = Math.min(g.t.js, 30); g.t.jm = Math.min(g.t.jm, 10); g.cool.jsw = Math.max(g.cool.jsw, 30); g.cool.demon = Math.max(g.cool.demon, 150); }  // 첫 판 저장: 큰 싸움이 너무 잦던 때의 수치를 낮춘다
  return g;
}
const arc = k => st()?.arcs.find(a => a.kind === k);
const hist = t => { const g = st(); g.hist.unshift(`${S().day}일: ${t}`); g.hist.length = Math.min(g.hist.length, 12); };
// 내가 선 편: 문파에 들었으면 그 문파 편, 아니면 모병관에게 이름을 올린 편
function mySide() {
  const fr = Fr(), f = fr.fac && fr.fac !== 'my' ? fac(fr.fac) : null;
  if (f) return f.align === 'jeong' || f.align === 'sa' ? f.align : null;
  if (fr.fac === 'my' && (fr.sect?.align === 'jeong' || fr.sect?.align === 'sa')) return fr.sect.align;
  return st().side;
}
const cultMember = () => Fr().fac === 'cheonma';
const refresh = () => { try { if (G.scene === 'field' && G.field.m && !G.field.busy) G.field.refresh(); } catch (e) { } };

// ── 판의 단계 ──
const K = {
  tourney: { name: '무림대회', order: ['notice', 'main'], ph: { notice: ['공고', 3], main: ['본선', 2] } },
  jsw: { name: '정사대전', order: ['omen', 'war', 'battle'], ph: { omen: ['전운', 3], war: ['개전', 6], battle: ['격전', 3] } },
  demon: { name: '정마대전', order: ['omen', 'league', 'invade', 'final'], ph: { omen: ['징조', 3], league: ['무림맹 결성', 2], invade: ['마교 침공', 8], final: ['결전', 5] } },
};
const INIT = {}, ENTER = {}, TICK = {}, END = {};
function start(kind) { const g = st(), a = { id: g.id++, kind, day: S().day }; if (INIT[kind](a) === false) return; g.arcs.push(a); enter(a, K[kind].order[0]); }
function enter(a, ph) { a.phase = ph; a.left = K[a.kind].ph[ph][1]; ENTER[a.kind][ph]?.(a); }
function next(a) { const o = K[a.kind].order, i = o.indexOf(a.phase); if (i < o.length - 1) enter(a, o[i + 1]); else { END[a.kind](a); st().arcs = st().arcs.filter(x => x !== a); } }

// ── 하루 ──
function daily() {
  const g = st(); if (!g || !isFree()) return; const fr = Fr();
  // 긴장: 정파와 사파 문파끼리 붙은 싸움이 많을수록, 마교 세력이 클수록 빨리 오른다
  const jsWars = (fr.wars || []).filter(w => { const A = fac(w.a)?.align, B = fac(w.b)?.align; return (A === 'jeong' && B === 'sa') || (A === 'sa' && B === 'jeong'); }).length;
  if (!arc('jsw')) g.t.js = clamp(g.t.js + .75 + jsWars * .5 + rnd(-.3, .6), 0, 120);  // 넉 달에 한 번쯤 넘친다
  if (!arc('demon')) g.t.jm = alive(fac('cheonma')) ? clamp(g.t.jm + .26 + Math.max(0, (pow('cheonma') - 80) / 400) + rnd(-.1, .15), 0, 120) : 0;  // 한 해에 한 번쯤
  for (const [k, lim, t] of [['js', 65, '정파와 사파 제자들이 저잣거리마다 부딪힌다. 누가 먼저 칼을 뽑아도 이상하지 않다.'], ['jm', 65, '서쪽에서 붉은 옷을 입은 자들이 내려온다는 말이 돈다. 마을 몇 곳에서 사람이 사라졌다.']]) {
    if (g.t[k] >= lim && !g.warn[k]) { g.warn[k] = 1; news(t); } if (g.t[k] < 40) g.warn[k] = 0;
  }
  for (const k in g.cool) if (g.cool[k] > 0) g.cool[k]--;
  for (const a of [...g.arcs]) { a.left--; TICK[a.kind]?.(a); if (a.left <= 0) next(a); }
  // 점령이 풀리는 날
  for (const m in g.occ) if (g.occ[m].until && S().day >= g.occ[m].until) { delete g.occ[m]; news(`${pname(m)}에서 마교가 물러갔다. 사람들이 하나둘 문을 열었다.`); }
  // 새 판
  if (!arc('tourney') && g.cool.tourney <= 0 && arc('demon')?.phase !== 'invade') start('tourney');
  if (!arc('jsw') && !arc('demon') && g.cool.jsw <= 0 && g.t.js >= 100) start('jsw');
  else if (!arc('demon') && !arc('jsw') && g.cool.demon <= 0 && g.t.jm >= 100) start('demon');
  refresh();
}

// ── 무림대회 ──
const RN = ['8강', '4강', '결승'];
const label = e => e.me ? S().name : `${fac(e.fac)?.name || ''} ${e.nick} ${e.name}`;
INIT.tourney = a => {
  const host = pick(openCity()), L = FACS.filter(f => alive(f) && (f.align !== 'ma' || Math.random() < .3)).sort(() => Math.random() - .5).slice(0, 8);
  if (L.length < 8) return false;
  a.map = host.map; a.place = host.name; a.me = -1; a.res = [];
  a.ent = L.map(f => ({ fac: f.id, name: hero(f), nick: pick(NICK), lv: Math.max(3, lv() + f.tier - 1 + Math.floor(rnd(-2, 3))), pw: pow(f.id) * rnd(.8, 1.3) + f.tier * 15 }));
};
ENTER.tourney = {
  notice: a => { news(`${a.place}에서 무림대회가 열린다는 방이 붙었다. 사흘 뒤 본선이다.`); toast(`강호 소식: ${a.place} 무림대회`, 3.4); },
  main: a => { news(`${a.place} 무림대회 본선이 시작됐다. 여덟 명이 단상에 올랐다.`); if (a.me >= 0) toast(`무림대회 본선이다. ${a.place}의 단상으로 가자`, 3.6); },
};
const pairs = (a, r) => { const P = r === 0 ? [0, 1, 2, 3, 4, 5, 6, 7] : a.res[r - 1], out = []; for (let i = 0; i < P.length; i += 2) out.push([P[i], P[i + 1]]); return out; };
const sim = (a, [i, j]) => { const A = a.ent[i], B = a.ent[j]; if (A.me) return j; if (B.me) return i; return Math.random() < A.pw / (A.pw + B.pw) ? i : j; };
END.tourney = a => {
  for (let r = a.res.length; r < 3; r++) a.res[r] = pairs(a, r).map(p => sim(a, p));  // 내가 안 나온 판은 기권
  const w = a.ent[a.res[2][0]], g = st();
  if (!w.me) { G.jh.gain(w.fac, 6); news(`${a.place} 무림대회에서 ${josa(label(w), '이/가')} 우승했다.`); hist(`${a.place} 무림대회 — ${label(w)} 우승`); }
  g.lastT = { place: a.place, ent: a.ent, res: a.res, day: S().day, w: label(w) }; g.cool.tourney = 16 + Math.floor(rnd(0, 7));  // 넉 달에 대여섯 번
};
function master(a, i, r) {
  const e = a.ent[i], f = fac(e.fac), L = Math.max(e.lv, lv() - 1) + r, base = G.jh.disciple(f, L, true), id = `sg_m${i}`;
  FOES[id] = { ...FOES[base], name: `${e.nick} ${e.name}`, title: f.name, hp: Math.round(FOES[base].hp * (1.25 + r * .15)), boss: 1 };
  return id;
}
function bracketHtml(T) {
  const nm = i => { const e = T.ent[i]; return `<span style="${e.me ? 'color:#ffd23c' : ''}">${esc(label(e))}</span>`; };
  const col = r => pairs(T, r).map((p, k) => { const w = T.res[r]?.[k]; return `<div class="note" style="margin:0 0 5px;padding:5px 8px">${p.map(i => w === undefined ? nm(i) : i === w ? `<b style="font-weight:400">${nm(i)}</b>` : `<s style="opacity:.55">${nm(i)}</s>`).join('<br>')}</div>`; }).join('');
  const champ = T.res[2] ? `<p>우승: <b style="font-weight:400">${nm(T.res[2][0])}</b></p>` : '';
  return `<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">${[0, 1, 2].map(r => `<div><small class="hint">${RN[r]}</small>${r === 0 || T.res[r - 1] ? col(r) : ''}</div>`).join('')}</div>${champ}`;
}
const showBracket = (T, title) => panel(title || `${T.place} 무림대회 대진표`, B => { B.innerHTML = bracketHtml(T); }, 760);
async function tourTalk(a) {
  const s = S();
  if (a.phase === 'notice') {
    if (a.me >= 0) { await say(null, `접수처 서기: ${pick([`본선은 ${a.left}일 뒤요. 그날 이 단상 앞으로 오시오.`, `이름은 올려 두었소. ${a.left}일 뒤에 늦지 마시오. 늦으면 기권이오.`, '대진표 붙은 거 보셨소? 첫 상대가 만만치 않을 거요.'])}`); return; }
    if (a.cut) { await say(null, '접수처 서기: 예선에서 떨어진 분은 다음 대회를 기다리시오.'); return; }
    const c = await choice(`${a.place} 무림대회. 참가비 은자 50냥. 예선을 이기면 본선 여덟 자리에 든다.`, ['나간다', '대진표를 본다', '그만둔다']);
    if (c === 1) { await showBracket(a); return; } if (c) return;
    if (s.silver < 50) { await say(null, '참가비가 모자란다.'); return; } s.silver -= 50; Sound.sfx('coin');
    await narr('예선 상대는 둘이었다. 이긴 사람만 이름을 올린다.');
    const won = await ctx.duel({ foes: G.free.group('rogue', lv(), 2), arena: G.field.m.arena, bgm: 'fight', title: `${a.place} 무림대회 예선`, optional: true, noIntro: true, yieldAt: .25, noLoot: true });
    if (!won) { a.cut = 1; await say(null, '예선에서 떨어졌다. 다음 대회를 기다려야 한다.'); return; }
    const i = a.ent.reduce((b, e, k) => e.pw < a.ent[b].pw ? k : b, 0); a.ent[i] = { me: 1, lv: lv(), pw: 0 }; a.me = i;
    news(`${josa(s.name, '이/가')} ${a.place} 무림대회 본선에 이름을 올렸다.`);
    await narr(`본선 여덟 자리에 이름이 올랐다. 첫 상대는 ${label(a.ent[i ^ 1])}. 본선은 ${a.left}일 뒤다.`); return;
  }
  if (a.me < 0 || a.out || a.done) { const c = await choice(a.done ? '대회는 끝났다. 단상 위에 꽃잎이 흩어져 있다.' : '본선이 한창이다. 구경꾼들이 단상을 둘러싸고 있다.', ['대진표를 본다', '돌아선다']); if (c === 0) await showBracket(a); return; }
  for (let r = a.res.length; r < 3; r++) {
    const R = pairs(a, r), mine = R.find(p => p.includes(a.me)), opp = mine[0] === a.me ? mine[1] : mine[0];
    await narr(`${RN[r]}. 상대는 ${label(a.ent[opp])}.`);
    const won = await ctx.duel({ foes: [master(a, opp, r)], arena: G.field.m.arena, bgm: r === 2 ? 'boss' : 'fight', title: `${a.place} 무림대회 ${RN[r]}`, optional: true, noIntro: true, yieldAt: .25, noLoot: true });
    a.res[r] = R.map(p => p.includes(a.me) ? (won ? a.me : opp) : sim(a, p));
    if (!won) { a.out = 1; news(`${a.place} 무림대회 ${RN[r]}에서 ${josa(s.name, '이/가')} 떨어졌다.`); await say(null, '단상에서 내려왔다. 구경꾼들이 벌써 다음 판을 보고 있었다.'); return; }
    if (r < 2) { const np = pairs(a, r + 1).find(p => p.includes(a.me)), no = np[0] === a.me ? np[1] : np[0]; const c = await choice(`${RN[r]}을 이겼다. 다음 상대는 ${label(a.ent[no])}.`, ['바로 오른다', '숨을 고르고 다시 온다']); if (c) return; }
  }
  a.done = 1; a.left = Math.min(a.left, 1);
  const v = 200 + lv() * 15; s.silver += v; Fr().fame += 40; s.flags.saga_champ = (s.flags.saga_champ || 0) + 1; Sound.sfx('bonus');
  news(`${josa(s.name, '이/가')} ${a.place} 무림대회에서 우승했다. 단상 아래가 함성으로 들끓었다.`); hist(`${a.place} 무림대회 — ${s.name} 우승`);
  await narr(`끝까지 서 있었다. 상금 은자 ${v}냥과 비급 두 권을 받았다.`); for (let i = 0; i < 2; i++) G.arts.drop(null, 1);
}

// ── 정사대전 ──
INIT.jsw = a => {
  const J = top('jeong'), Sa = top('sa'); if (!J || !Sa) return false;
  const C = openCity().slice().sort(() => Math.random() - .5); if (C.length < 2) C.push(...CITY); a.j = J.id; a.s = Sa.id; a.score = 0; a.front = [C[0].map, C[1].map];
};
const sumPow = al => side(al).slice().sort((x, y) => pow(y.id) - pow(x.id)).slice(0, 4).reduce((t, f) => t + pow(f.id), 0);
ENTER.jsw = {
  omen: a => { news(`${fac(a.s).name} 사람들이 ${fac(a.j).name} 제자를 베었다. 정파와 사파 사이에 피바람이 분다.`); toast('강호 소식: 정사대전의 전운', 3.4); hist('정사대전 전운'); },
  war: a => { news(`정파와 사파가 끝내 칼을 뽑았다. ${josa(fac(a.j).name, '이/가')} 정파를, ${josa(fac(a.s).name, '이/가')} 흑도맹을 이끈다.`); toast('정사대전이 터졌다', 3.4); },
  battle: a => { news(`${pname(a.front[0])} 밖에 양쪽이 진을 쳤다. 사흘 안에 큰 싸움이 난다.`); toast(`정사대전: ${pname(a.front[0])}에서 결전`, 3.4); },
};
TICK.jsw = a => {
  if (a.phase === 'omen') return;
  a.score += (sumPow('jeong') - sumPow('sa')) / 400 + rnd(-1.2, 1.2);
  if (Math.random() < .5) { const lose = a.score >= 0 ? 'sa' : 'jeong', win = lose === 'sa' ? 'jeong' : 'sa', L = side(lose), W = side(win); if (L.length && W.length) { const f = pick(L), o = pick(W); G.jh.hurt(f.id, 3); news(`${o.name} 사람들이 ${f.name}의 거점 하나를 불태웠다.`); } }
};
END.jsw = a => {
  const v = a.score + rnd(-2, 2), win = v >= 0 ? 'jeong' : 'sa', lose = win === 'jeong' ? 'sa' : 'jeong', g = st();
  const L = side(lose).sort((x, y) => pow(y.id) - pow(x.id)); L.slice(0, 2).forEach(f => G.jh.hurt(f.id, 16)); if (L.length > 2) G.jh.hurt(pick(L.slice(2)).id, 28);
  side(win).forEach(f => G.jh.gain(f.id, 5));
  news(`정사대전이 끝났다. ${josa(CAMP[win], '이/가')} 이겼다. ${CAMP[lose]} 문파들이 산문을 걸어 잠갔다.`); hist(`정사대전 — ${CAMP[win]} 승리`);
  const me = mySide(); if (me && a.helped) { if (me === win) { const v2 = 300 + lv() * 15; S().silver += v2; Fr().fame += 30; S().flags['saga_jsw_' + me] = 1; toast(`우리 편이 이겼다. 은자 ${v2}냥`, 4); } else toast('우리 편이 졌다', 4); }
  g.t.js = 0; g.cool.jsw = 70; g.side = null; g.lastJsw = { win: CAMP[win], day: S().day };
};
async function recruit(a, al) {
  const me = mySide(), nm = CAMP[al];
  // 정파 모병관은 점잖고, 흑도맹 모병관은 거칠다
  const V = al === 'jeong' ? { ours: ['이미 우리 편이시오. 게시판에 일이 올라와 있소.', '몸조심하시오. 이번 싸움은 길게 갈 거요.', '대협 같은 분이 있어 든든하오. 다친 데는 없소?'], foe: [`…${CAMP[me]} 사람이 여긴 왜 왔소. 칼 뽑기 전에 돌아가시오.`, '여기는 당신 올 곳이 아니오. 오늘은 못 본 걸로 하겠소.'], ask: '이름을 올리면 의리를 지켜야 하오. 대신 강호가 당신을 의협으로 기억할 거요.' }
    : { ours: ['우리 편이잖아. 일은 게시판에 있어. 돈 받으려면 피 좀 묻혀 와.', '또 왔냐. 술은 싸움 끝나고 먹자.', '저쪽 놈들 목 하나에 은자 몇 냥인지 알지? 많이 따 와.'], foe: ['정파 냄새가 나는데. 오늘은 봐준다. 꺼져.', '여기서 칼 뽑으면 너만 손해야. 돌아가.'], ask: '돈은 정파보다 많이 줘. 대신 저쪽은 너를 사파 놈이라고 부르겠지. 상관없지?' };
  if (me === al) { await say(null, `${nm} 모병관: ${pick(V.ours)}`); return; }
  if (me) { await say(null, `${nm} 모병관: ${pick(V.foe)}`); return; }
  const c = await choice(`${nm} 모병관이 붓을 들었다. "${V.ask}"`, [`${nm} 편에 선다`, '그만둔다']); if (c) return;
  st().side = al; G.jh.addRep(al === 'jeong' ? a.j : a.s, 8); G.jh.addRep(al === 'jeong' ? a.s : a.j, -12);
  news(`${josa(S().name, '이/가')} ${nm} 편에 섰다.`); toast(`${nm} 편에 섰다. 일거리 게시판에 싸움 일이 올라온다`, 3.6);
}
async function battle(a) {
  const me = mySide(); if (!me) { await say(null, '진중 사람: 어느 편도 아닌 사람은 끼지 마시오. 모병관에게 먼저 가 보시오.'); return; }
  if (a.fought) { await say(null, a.fought === 2 ? '진중이 함성으로 가득하다. 오늘 싸움은 이겼다.' : '부상자들이 신음하고 있다. 다시 나설 힘이 없다.'); return; }
  const foe = me === 'jeong' ? 'sa' : 'jeong', E = side(foe), A = side(me), head = me === 'jeong' ? a.s : a.j, L = lv();
  const c = await choice(`${CAMP[me]} 지휘관: 내일 새벽 저쪽 진을 친다. 선봉에 서겠소?`, ['선봉에 선다', '아직이다']); if (c) return;
  const allies = A.slice(0, 2).map((f, i) => ally(f, L, i)), waves = [
    [G.jh.crew(pick(E), L, 3), '첫 줄이 부딪쳤다. 흙먼지 속에서 칼날만 번쩍였다.'],
    [[G.jh.disciple(pick(E), L + 1, true), ...G.jh.crew(pick(E), L + 1, 2)], '저쪽 사범들이 앞으로 나왔다.'],
    [[L >= 18 && FOES['clan_' + head] ? 'clan_' + head : named(fac(head), L + 3), G.jh.disciple(fac(head), L + 1, true)], `${fac(head).name}의 우두머리가 몸소 나섰다.`],
  ];
  for (const [i, [foes, line]] of waves.entries()) {
    await narr(line);
    if (!await ctx.duel({ foes, allies, arena: G.field.m.arena, bgm: i === 2 ? 'boss' : 'fight', title: `정사대전 ${i + 1}진`, optional: true, noIntro: true })) { a.fought = 1; a.score += me === 'jeong' ? -2 : 2; return; }
  }
  a.fought = 2; a.helped = 1; a.score += me === 'jeong' ? 8 : -8; news(`${pname(a.front[0])} 싸움에서 ${josa(CAMP[me], '이/가')} 저쪽 진을 무너뜨렸다. 선봉에 선 이는 ${S().name}이었다.`);
  await narr('저쪽 깃발이 쓰러졌다. 함성이 들판을 덮었다.');
}
// 내 편 사람과 이름 붙은 적
function ally(f, L, i) { const base = G.jh.disciple(f, L, true), id = `sga_${f.id}_${i}`; FOES[id] = { ...FOES[base], name: `${f.name} ${['사형', '장로', '사제'][i % 3]}`, exp: 0, silver: 0 }; return id; }
function named(f, L) { const base = G.jh.disciple(f, L, true), id = `sgn_${f.id}`; FOES[id] = { ...FOES[base], name: `${f.name} 장로`, hp: Math.round(FOES[base].hp * 1.6), boss: 1 }; return id; }

// ── 무림맹과 마교 ──
const CULT = () => fac('cheonma');
const dist = (l, m) => Math.hypot(l.px[0] - m.px[0], l.px[1] - m.px[1]);
const base = () => LOCS.find(l => l.map === 'b_cheonma');
INIT.demon = a => {
  if (!alive(CULT()) || !top('jeong')) return false;
  const B = base(), C = CITY.slice().sort((x, y) => dist(x, B) - dist(y, B)); a.order = C.map(l => l.map); a.hq = C[C.length - 1].map; a.score = 0; a.freed = 0; a.lord = null;
};
ENTER.demon = {
  omen: a => { news(`${pname(a.order[0])} 근처에서 사람들이 사라진다. 붉은 옷을 입은 자들을 봤다는 말이 돈다.`); toast('강호 소식: 서쪽에서 불길한 소문', 3.4); hist('마교의 징조'); },
  league: a => { a.lord = top('jeong').id; news(`정파 문파들이 ${pname(a.hq)}에 모여 무림맹을 세웠다. 맹주 자리를 두고 말이 많다.`); toast(`무림맹 결성: ${pname(a.hq)}`, 3.4); hist('무림맹 결성'); },
  invade: a => { occupy(a); toast('마교가 내려왔다', 3.4); },
  final: a => { news(`무림맹이 ${fac('cheonma').name} 본거지로 진군한다. 이번에 끝을 보겠다고 한다.`); toast('정마대전: 마교 본거지 결전', 3.4); },
};
function occupy(a) {
  const g = st(), m = a.order.find(x => !g.occ[x] && !(a.lib || []).includes(x)); if (!m || Object.keys(g.occ).length >= 3) return;  // 되찾은 고을은 이번 싸움에선 다시 안 뺏긴다
  g.occ[m] = { boss: `혈마 향주 ${pick(SURNAME)}${pick(['혈', '귀', '량', '참', '천'])}`, day: S().day };
  news(`마교가 ${pname(m)}을(를) 차지했다. 성문에 천마의 깃발이 걸렸다.`); hist(`마교, ${pname(m)} 점령`);
  const t = arc('tourney'); if (t && t.map === m) { g.arcs = g.arcs.filter(x => x !== t); g.cool.tourney = 6; news(`${pname(m)} 무림대회는 없던 일이 됐다. 단상이 부서졌다.`); }
}
TICK.demon = a => {
  if (a.phase === 'invade') { a.score += (sumPow('jeong') / 4 - pow('cheonma')) / 120 + rnd(-.6, .6); if (a.left > 0 && a.left % 3 === 0) occupy(a); }
};
END.demon = a => {
  const g = st(), win = a.finalWon || a.score + a.freed * 2 + rnd(-2, 2) > 0;  // 나 없이도 무림맹이 이길 때가 있다. 끼어들면 훨씬 낫다
  if (win) {
    G.jh.hurt('cheonma', a.finalWon ? 999 : 45); for (const m in g.occ) delete g.occ[m];  // 총단을 깨면 마교가 무너진다(몇 해 뒤 다시 일어난다)
    news(`무림맹이 마교를 물리쳤다. 천마의 깃발이 강물에 떠내려갔다.`); hist('정마대전 — 무림맹 승리');
    if (a.helped && !cultMember()) { const v = 500 + lv() * 20; S().silver += v; Fr().fame += 60; S().flags.saga_demon = 1; if (a.lord === 'me') S().flags.saga_lord = 1; toast(`마교를 물리쳤다. 은자 ${v}냥`, 4); }
  } else {
    for (const m in g.occ) g.occ[m].until = S().day + 15; side('jeong').sort((x, y) => pow(y.id) - pow(x.id)).slice(0, 3).forEach(f => G.jh.hurt(f.id, 15)); G.jh.gain('cheonma', 15);
    news(`무림맹이 무너졌다. 마교의 깃발이 ${Object.keys(g.occ).map(pname).join(', ') || '서쪽 하늘'}에 펄럭인다.`); hist('정마대전 — 마교 승리');
    if (cultMember()) { S().flags.saga_cult = 1; Fr().fame += 20; }
  }
  g.t.jm = 0; g.cool.demon = 200; g.lastDemon = { win: !!win, day: S().day };
};
async function leagueTalk(a) {
  const s = S(), fr = Fr();
  if (cultMember()) { await say(null, '무림맹 집사가 나를 위아래로 훑어보더니 문을 닫았다.'); return; }
  if (a.lord === 'me') { await say(null, '무림맹 집사: 맹주님, 문파마다 사람을 보냈습니다. 게시판에 일을 올려 두었습니다.'); return; }
  const able = fr.fame >= 80 && fr.infamy < 40 && mySide() !== 'sa';
  if (able && !a.asked && a.phase === 'league') {
    a.asked = 1; const c = await choice(`무림맹 집사: ${s.name} 대협의 이름을 모르는 사람이 없습니다. 어른들께서 맹주 자리를 맡아 주십사 하십니다.`, ['맹주 자리를 받는다', '사양한다']);
    if (c === 0) { a.lord = 'me'; fr.fame += 20; news(`${josa(s.name, '이/가')} 무림맹주로 추대되었다.`); hist(`${s.name}, 무림맹주 추대`); Sound.sfx('bonus'); await narr('맹주의 인장을 받았다. 생각보다 무거웠다.'); return; }
    await say(null, `무림맹 집사: 아쉽습니다. 그럼 ${fac(a.lord).name} 어른께서 맡으시겠지요.`); return;
  }
  await say(null, `무림맹 집사: 맹주는 ${a.lord === 'me' ? s.name : fac(a.lord)?.who || fac(a.lord)?.name}${a.lord === 'me' ? '' : ' 어른'}입니다. 마교를 치는 일이라면 누구든 환영합니다. 일거리 게시판을 보십시오.`);
}
async function liberate(map) {
  const g = st(), o = g.occ[map], L = lv(), cf = CULT(); if (!o) return;
  await say(null, `${o.boss}: ${pick(['무림맹의 개가 왔구나. 이 고을은 이제 천마의 것이다.', '혼자 왔느냐? 배짱 하나는 칭찬해 주마.', '천마께서 너 같은 놈을 좋아하신다. 제물로.', '이 고을 사람들은 벌써 무릎 꿇는 법을 배웠다. 너도 배워라.'])}`);
  const base0 = G.jh.disciple(cf, L + 2, true), k = 'sg_boss'; FOES[k] = { ...FOES[base0], name: o.boss, title: cf.name, hp: Math.round(FOES[base0].hp * 1.7), boss: 1 };
  if (!await ctx.duel({ foes: [k, ...G.jh.crew(cf, L, L < 10 ? 1 : 2)], arena: G.field.m.arena, bgm: 'boss', title: `${pname(map)} 해방`, optional: true, noIntro: true })) return;
  delete g.occ[map]; (g.hero = g.hero || {})[map] = S().day; const a = arc('demon'); if (a) { a.freed++; a.score += 2; a.helped = 1; (a.lib = a.lib || []).push(map); }
  const v = 150 + L * 8; S().silver += v; Fr().fame += 20; G.jh.addRep(top('jeong')?.id, 6);
  news(`${josa(S().name, '이/가')} ${pname(map)}을(를) 마교에게서 되찾았다.`); hist(`${pname(map)} 해방`); toast(`${pname(map)} 해방. 은자 ${v}냥`, 3.6); G.field.refresh();
}
async function finalBattle(a) {
  if (cultMember()) { await say(null, '무림맹 선봉장이 나를 보더니 칼자루를 잡았다. 여기 있을 곳이 아니다.'); return; }
  if (a.finalWon) { await say(null, '무림맹 선봉장: 끝났소. 이제 다친 사람들을 챙길 차례요.'); return; }
  const c = await choice('무림맹 선봉장: 저 문 너머가 천마신교 총단이오. 함께 들어가겠소?', ['선봉에 선다', '아직이다']); if (c) return;
  const L = lv(), cf = CULT(), A = side('jeong').slice(0, a.lord === 'me' ? 3 : 2).map((f, i) => ally(f, L + 1, i));
  const waves = [
    [G.jh.crew(cf, L + 1, 3), '문이 부서지자 붉은 옷들이 쏟아져 나왔다.'],
    [[named(cf, L + 2), ...G.jh.crew(cf, L + 1, 2)], '장로들이 길을 막았다.'],
    [[L >= 18 ? 'clan_cheonma' : named(cf, L + 4)], `대전 깊숙이, ${cf.who || '교주'}가 기다리고 있었다.`],
  ];
  for (const [i, [foes, line]] of waves.entries()) { await narr(line); if (!await ctx.duel({ foes, allies: A, arena: G.field.m.arena, bgm: i === 2 ? 'boss' : 'fight', title: `정마대전 결전 ${i + 1}진`, optional: true, noIntro: true })) return; }
  a.finalWon = 1; a.helped = 1; a.left = Math.min(a.left, 1); news(`무림맹이 ${cf.name} 대전을 무너뜨렸다. 맨 앞에 선 이는 ${S().name}이었다.`); await narr('천마의 깃발이 쓰러졌다. 연기 너머로 해가 떠올랐다.');
}

// ── 일거리 ──
function nearLoc(l) {
  G.world.build(); const K = G.world.K, m = MAPS.world;
  for (let i = 0; i < 40; i++) { const t = rnd(0, 6.28), d = rnd(8, 18), x = Math.round(l.px[0] * K + Math.cos(t) * d), y = Math.round(l.px[1] * K + Math.sin(t) * d); if (!m.blocked((x + .5) * 16, (y + .7) * 16, 14, 10)) return [x + .5, y + .6]; }
  return G.world.entry(l.map);
}
const JOB = {
  patrol: ['적 척후 사냥', '{e} 척후들이 {p} 근처를 돌아다닌다. 쓸어 내라.', '척후들이 덤불 속에서 일어났다.', 'Knight'],
  supply: ['보급 호위', '{p}로 가는 보급 수레를 지켜라. {e} 사람들이 노린다.', '수레가 고개에 들어서자 {e} 사람들이 길을 막았다.', 'Noble'],
  scout: ['적진 정찰', '{p} 근처 {e} 진영을 살피고 오라.', '진영 둘레를 돌며 깃발 수를 셌다.', 'GreenNinja'],
  missing: ['실종 조사', '{p} 근처에서 사람이 사라진다. 붉은 옷을 입은 자들을 찾아라.', '버려진 사당 안에서 붉은 옷들이 무언가를 외고 있었다.', 'OldMan'],
  refugee: ['피난민 호위', '{p}에서 빠져나온 피난민을 지켜라. 마교도가 뒤쫓는다.', '피난민 행렬 뒤로 붉은 옷들이 따라붙었다.', 'OldWoman'],
  cult: ['마교도 토벌', '{p} 둘레에 마교도 무리가 진을 쳤다.', '모닥불 둘레에 붉은 옷들이 둘러앉아 있었다.', 'Knight'],
};
function mkJob(a, fid, sub, foeFac, l) {
  const [x, y] = nearLoc(l), t = JOB[sub], e = fac(foeFac)?.name || '적', L = Math.max(1, lv() + (Math.random() < .3 ? 1 : 0)), lord = a.lord === 'me' ? 1.5 : 1;
  return { id: Fr().nextId++, fac: fid && fid !== 'my' ? fid : null, type: 'saga', sub, arc: a.id, title: `${K[a.kind].name}: ${t[0]}`, desc: t[1].replace('{p}', l.name).replace('{e}', e), intro: t[2].replace('{e}', e), hint: t[0], spr: t[3], lv: L, map: 'world', place: `${l.name} 근처`, x, y, rival: foeFac, foeFac, silver: Math.round((40 + L * 14) * lord), merit: Math.round(30 + L * 2.5), fame: 3 };
}
function jobsFor(fid) {
  const g = st(); if (!g || !isFree()) return []; const out = [], f = fid && fid !== 'my' ? fac(fid) : null;
  const j = arc('jsw'); if (j && j.phase !== 'omen') { const me = mySide(), mine = f ? f.align === me : !!g.side; if (me && mine) { const foe = me === 'jeong' ? 'sa' : 'jeong', E = side(foe); if (E.length) { const l = loc(pick(j.front)); out.push(mkJob(j, fid, pick(['patrol', 'supply', 'scout']), pick(E).id, l)); } } }
  const d = arc('demon'); if (d && !cultMember() && (!f || f.align !== 'ma')) {
    const occ = Object.keys(g.occ), l = loc(occ.length ? pick(occ) : d.order[0]);
    out.push(mkJob(d, fid, d.phase === 'omen' ? 'missing' : pick(d.phase === 'invade' ? ['refugee', 'cult', 'cult'] : ['cult']), 'cheonma', l));
  }
  return out;
}
async function runJob(j, finish, duel) {
  const a = st().arcs.find(x => x.id === j.arc), n = 2 + (j.lv >= 10) + (j.lv >= 24), F = fac(j.foeFac), foes = F ? G.jh.crew(F, j.lv, n) : G.free.group('bandit', j.lv, n);
  await narr(j.intro);
  if (j.sub !== 'scout' || Math.random() < .5) { if (j.sub === 'scout') await narr('들켰다. 칼 든 사람들이 달려왔다.'); if (!await duel(j, foes, j.title)) return; }
  finish(j); if (a) { a.helped = 1; if (a.kind === 'jsw') a.score += (mySide() === 'jeong' ? 1 : -1) * (j.sub === 'patrol' ? 1 : 1.5); else a.score += 1; }
}

// ── 전도에 나타나는 사람들 ──
function spawn(x, y) {
  const g = st(); if (!g || !isFree()) return null; const L = lv(), n = L < 8 ? 1 : L < 18 ? 2 : 3;
  const j = arc('jsw'); if (j && j.phase !== 'omen' && Math.random() < .35) {
    const me = mySide(), foe = me ? (me === 'jeong' ? 'sa' : 'jeong') : pick(['jeong', 'sa']), E = side(foe); if (!E.length) return null; const f = pick(E), foes = G.jh.crew(f, L, n);
    return { spr: FOES[foes[0]].spr, x, y, hx: x, hy: y, foes, fac: f.id, dir: 0, walk: 0, t: 1, vx: 0, vy: 0, intro: me ? `${f.name} 순찰대: ${CAMP[me]} 놈이다! 잡아라!` : `${f.name} 순찰대: 어느 편이냐? …대답이 늦군.`, win: () => { j.score += me === 'jeong' ? .5 : me === 'sa' ? -.5 : 0; } };
  }
  const d = arc('demon'); if (d && d.phase !== 'league' && !cultMember() && Math.random() < (d.phase === 'omen' ? .2 : .35)) {
    const cf = CULT(), foes = G.jh.crew(cf, L, n), k = `sg_cult${foes.length}`; FOES[k] = { ...FOES[foes[0]], name: '마교도' }; foes[0] = k;
    return { spr: FOES[k].spr, x, y, hx: x, hy: y, foes, dir: 0, walk: 0, t: 1, vx: 0, vy: 0, intro: '마교도: 천마께서 강림하신다! 무릎 꿇어라!', win: () => { d.score += .3; } };
  }
  return null;
}

// ── 고을 안 사람들 ──
const SCARED = ['쉿, 소리 내지 마요. 저 붉은 옷들이 듣고 있어요.', '가게는 다 문 닫았어요. 쌀 한 됫박 구하기도 어려워요.', '무림맹은 언제 온대요? 오기는 온대요?', '어젯밤에도 누가 끌려갔어요.'];
function npcs(id, out) {
  const g = st(); if (!g || !isFree()) return out; const sp = id.startsWith('c_') ? [31, 19] : [31, 34];
  const t = arc('tourney'); if (t && t.map === id) out.push({ id: 'sg_tour', spr: 'Noble', x: 33.5, y: 19.75, dir: 0, hint: t.phase === 'notice' ? '무림대회 접수처' : '무림대회 단상', mark: () => t.phase === 'notice' ? t.me < 0 && !t.cut : t.me >= 0 && !t.out && !t.done, talk: () => tourTalk(t) });
  const j = arc('jsw');
  if (j && j.front.includes(id)) {
    if (j.phase !== 'battle' || id !== j.front[0]) { out.push({ id: 'sg_rj', spr: 'Knight', x: 25.5, y: 26.75, dir: 0, hint: '정파 모병관', mark: () => !mySide(), talk: () => recruit(j, 'jeong') }); out.push({ id: 'sg_rs', spr: 'DarkNinja', x: 34.5, y: 26.75, dir: 0, hint: '흑도맹 모병관', mark: () => !mySide(), talk: () => recruit(j, 'sa') }); }
    else out.push({ id: 'sg_bt', spr: 'Knight', x: 29.5, y: 27.75, dir: 0, hint: `${CAMP[mySide()] || '양쪽'} 진영`, mark: () => !!mySide() && !j.fought, talk: () => battle(j) });
  }
  const d = arc('demon');
  if (d && id === d.hq && d.phase !== 'omen') out.push({ id: 'sg_league', spr: 'Noble', x: 33.5, y: 19.75, dir: 0, hint: '무림맹 집사', mark: () => d.phase === 'league' && !d.asked && Fr().fame >= 80, talk: () => leagueTalk(d) });
  if (d && d.phase === 'final' && id === 'b_cheonma') out.push({ id: 'sg_van', spr: 'Knight', x: sp[0], y: sp[1] + 2, dir: 1, hint: '무림맹 선봉장', mark: () => !d.finalWon && !cultMember(), talk: () => finalBattle(d) });
  const o = g.occ[id];
  if (o) {
    const friend = cultMember(), gone = /^(guard|tout|drunk|cboard|gatebeg|stall_|teller|listen|perf|watch|kid|old\d|boat)/;  // 장터, 구경꾼, 순라군은 사라진다
    const folk = out.filter(n => /^folk/.test(n.id)).slice(0, 2); folk.forEach(n => { n.hint = '겁먹은 사람'; n.talk = async () => say(null, pick(SCARED)); });
    out = out.filter(n => !gone.test(n.id) && !/^folk/.test(n.id)).concat(folk);
    const cult = (x, y, i) => ({ id: 'sg_c' + i, spr: 'DarkNinja', x, y, dir: 0, life: 'still', hint: '마교도', talk: async () => {
      if (friend) { await say(null, `마교도: ${pick(['형제여, 천마의 뜻이 함께하길.', '향주님은 광장에 계시오.', '이 고을 놈들은 겁이 많소. 다루기 쉽지.'])}`); return; }
      await say(null, `마교도: ${pick(['멈춰라. 어디 소속이냐.', '천마께 고개를 숙여라.', '여기서부턴 교의 땅이다.', '칼을 내려놓으면 살려는 준다.'])}`);
      const lv0 = lv(), foes = G.jh.crew(CULT(), lv0, lv0 < 10 ? 1 : 2); if (await ctx.duel({ foes, arena: G.field.m.arena, bgm: 'fight', title: '마교도', optional: true, noIntro: true })) { const a = arc('demon'); if (a) a.score += .3; }
    } });
    [[25.5, 31.75], [34.5, 31.75], [28, 37.75], [32, 37.75], [12, 23.75], [47, 23.75]].forEach(([x, y], i) => out.push(cult(x, y, i)));
    out.push({ id: 'sg_boss', spr: 'DarkNinja', x: 29.5, y: 21.75, dir: 0, hint: friend ? o.boss : `${o.boss} (해방)`, mark: () => !friend, talk: async () => { if (friend) { await say(null, `${o.boss}: 교의 일은 잘 되어 가오.`); return; } await liberate(id); } });
  }
  return out;
}
// 점령된 고을은 가게 문이 닫힌다
const shut = (map, to) => st()?.occ[map] && !cultMember() ? '문이 굳게 닫혀 있다. 안에서 숨죽인 기척만 난다.' : null;
// 전도 표시
function marks() {
  const g = st(); if (!g || !isFree()) return []; const out = [];
  const t = arc('tourney'); if (t) out.push({ map: t.map, color: '#ffd23c' });
  const j = arc('jsw'); if (j && j.phase === 'battle') out.push({ map: j.front[0], color: '#ff6a3c' });
  const d = arc('demon'); if (d) { if (d.phase !== 'omen') out.push({ map: d.hq, color: '#7ec8ff' }); for (const m in g.occ) out.push({ map: m, color: '#c43cff' }); if (d.phase === 'final') out.push({ map: 'b_cheonma', color: '#ff3b2c' }); }
  return out;
}
// 강호 소식 탭 맨 위
function html() {
  const g = st(); if (!g || !isFree()) return '';
  const bar = (n, c) => `<span style="display:inline-block;width:120px;height:8px;background:#2a2018;border-radius:4px;vertical-align:middle;overflow:hidden"><span style="display:block;height:100%;width:${clamp(n, 0, 100)}%;background:${c}"></span></span>`;
  const rows = g.arcs.map(a => { const [pn] = K[a.kind].ph[a.phase], where = a.kind === 'tourney' ? a.place : a.kind === 'jsw' ? pname(a.front[0]) : pname(a.hq); const extra = a.kind === 'jsw' && a.phase !== 'omen' ? ` · 형세 ${a.score >= 0 ? '정파' : '흑도맹'} 우세` : a.kind === 'demon' && a.lord ? ` · 맹주 ${a.lord === 'me' ? esc(S().name) : esc(fac(a.lord)?.who || '')}` : '';
    return `<div class="note" style="margin-bottom:6px;padding:7px 10px"><b style="font-weight:400">${K[a.kind].name}</b> <small class="hint">${esc(where)} · ${pn} · ${a.left}일 남음${extra}</small></div>`; }).join('') || '<p class="hint">큰 판은 아직 없다.</p>';
  const occ = Object.keys(g.occ).length ? `<div class="hint">마교가 차지한 곳: ${Object.keys(g.occ).map(m => pname(m) + (g.occ[m].until ? ` (${Math.max(0, g.occ[m].until - S().day)}일 뒤 물러감)` : '')).join(', ')}. 고을 광장의 향주를 쓰러뜨리면 되찾는다.</div>` : '';
  const me = mySide(), T = arc('tourney') || g.lastT;
  return `<h2>무림 정세</h2><div class="hint" style="margin-bottom:6px">정파와 사파 ${bar(g.t.js, '#e0703a')} · 정파와 마교 ${bar(g.t.jm, '#b03ad0')}${me ? ` · 나는 <b style="font-weight:400">${CAMP[me]}</b> 편` : ''}</div>${rows}${occ}`
    + (T ? `<h2 style="margin-top:10px">${esc(T.place)} 무림대회</h2>${bracketHtml(T)}` : '')
    + (g.hist.length ? `<h2 style="margin-top:10px">지나간 일</h2>${g.hist.slice(0, 6).map(h => `<div class="hint">${esc(h)}</div>`).join('')}` : '') + '<div style="height:10px"></div>';
}
// 호칭
TITLES.push(
  { id: 'sg_champ', name: '단상의 주인', how: '무림대회에서 우승한다', ok: S => !!S.flags.saga_champ },
  { id: 'sg_jeong', name: '정사대전의 검', how: '정사대전에서 정파 편으로 이긴다', ok: S => !!S.flags.saga_jsw_jeong },
  { id: 'sg_sa', name: '흑도의 칼', how: '정사대전에서 흑도맹 편으로 이긴다', ok: S => !!S.flags.saga_jsw_sa },
  { id: 'sg_demon', name: '마교를 꺾은 자', how: '정마대전에서 무림맹이 이긴다', ok: S => !!S.flags.saga_demon },
  { id: 'sg_lord', name: '무림맹주', how: '무림맹주로서 마교를 물리친다', ok: S => !!S.flags.saga_lord },
  { id: 'sg_cult', name: '천마의 그림자', how: '천마신교 사람으로 정마대전을 이긴다', ok: S => !!S.flags.saga_cult },
);
// 거리 사람들이 할 수 있는 화제와 그 값(js/voices.js). 숫자는 화제를 고를 가중치
function talkCtx(map) {
  const g = st(); if (!g || !isFree()) return null; const v = {}, on = {}, day = S().day;
  const t = arc('tourney'); if (t) { v.tp = t.place; on.tourNotice = 2; }
  if (g.lastT?.day && day - g.lastT.day <= 12) { v.tw = g.lastT.w; v.tl = g.lastT.place; on.tourDone = 1.5; }
  const j = arc('jsw'); if (j) { if (j.phase === 'omen') on.jswOmen = 3; else { on.jswWar = 3; v.ja = CAMP[j.score >= 0 ? 'jeong' : 'sa']; v.jf = pname(j.front[0]); } }
  if (g.lastJsw && day - g.lastJsw.day <= 12) { v.jw = g.lastJsw.win; on.jswAfter = 2; }
  const d = arc('demon'); if (d) { if (d.phase === 'omen') on.demonOmen = 3; else { v.hq = pname(d.hq); v.lord = d.lord === 'me' ? S().name : fac(d.lord)?.who || fac(d.lord)?.name; on.league = 2; } }
  const oc = Object.keys(g.occ).filter(m => m !== map); if (oc.length) { v.oc = pname(pick(oc)); on.occOther = 3; }
  if (g.lastDemon?.win && day - g.lastDemon.day <= 12) on.demonAfter = 2;
  if (g.hero?.[map]) on.savior = 1;
  return { v, on };
}
// 시험용: 판을 바로 띄운다
const debug = { start, next: k => { const a = arc(k); if (a) { a.left = 0; next(a); } }, tension: (k, v) => { st().t[k] = v; } };
G.saga = { talkCtx, st, daily, jobsFor, runJob, spawn, npcs, shut, marks, html, arc, mySide, debug };
