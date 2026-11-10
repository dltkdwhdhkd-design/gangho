// 강호가 나를 대하는 방식: 세력 관계, 원한, 복수, 그리고 나와 상관없이 벌어지는 사건
import { G, Sound, toast, josa, esc, pick } from './core.js';
import { Story, ctx, say, narr, choice } from './ctx.js';
import { FOES } from './foes.js';
import { WEAPONS } from './data.js';
import { have, take } from './state.js';
import { FACS, fac } from './free.js';
import { LOCS } from './worlddata.js';
import { SURNAME, GIVEN } from './freedata.js';

const S = () => G.S;
export function ensure() {
  const s = S(); if (!s) return null; if (!s.fr) { s.fr = { fac: null, rank: 0, merit: 0, rep: {}, fame: 0, infamy: 0, jobs: [], board: {}, done: 0, sect: null, towns: {}, wars: [], news: [], power: {}, nextId: 1, clock: 0, left: {} }; FACS.forEach(f => { s.fr.power[f.id] = 40 + f.tier * 20; }); }
  const f = s.fr; f.grudge = f.grudge || []; f.ev = f.ev || []; f.fallen = f.fallen || {}; f.dead = f.dead || {}; f.evId = f.evId || 1; for (const x of FACS) if (f.power[x.id] === undefined) f.power[x.id] = 40 + x.tier * 20; return f;
}
const Fr = () => ensure();
// ── 세력 사이 ──
const FRIEND = [['shaolin', 'wudang'], ['shaolin', 'emei'], ['wudang', 'emei'], ['namgung', 'moyong'], ['namgung', 'jegal'], ['jongnam', 'gongdong'], ['hwangbo', 'ak'], ['yang', 'ak'], ['hwasan', 'emei'], ['cheonsan', 'gonryun'], ['pota', 'emei'], ['janggang', 'nokrim'], ['odok', 'hyeoleui'], ['haomun', 'hyeoleui'], ['gaebang', 'shaolin'], ['jeonjin', 'wudang'], ['podalra', 'noeum']];
const FOE = [['hwasan', 'jongnam'], ['hwangbo', 'eon'], ['shaolin', 'noeum'], ['jeonjin', 'jongnam'], ['cheonsan', 'cheonma'], ['gaebang', 'haomun'], ['dang', 'odok'], ['paeng', 'nokrim'], ['haenam', 'janggang'], ['namgung', 'cheonma'], ['bukhae', 'gonryun']];
const near = (L, id) => L.filter(p => p.includes(id)).map(p => p[0] === id ? p[1] : p[0]);
const rep = id => Fr().rep[id] || 0;
const hostile = id => rep(id) <= -40;
function setRep(id, n) { const fr = Fr(), was = hostile(id); fr.rep[id] = Math.max(-100, Math.min(100, rep(id) + n)); const f = fac(id); if (!f) return; if (!was && hostile(id)) { toast(`${josa(f.name, '이/가')} 나를 적으로 삼았다`, 4); news(`${f.name}, ${josa(S().name, '을/를')} 적으로 선포하다.`); } if (was && !hostile(id)) toast(`${josa(f.name, '과/와')}의 원한이 풀렸다`, 3); }
// 나쁜 소문은 친한 세력에게 번지고 앙숙은 반긴다
function addRep(id, n, spread = true) {
  setRep(id, n); if (!spread || Math.abs(n) < 4) return; const f = fac(id); if (!f) return;
  for (const o of near(FRIEND, id)) setRep(o, Math.round(n * .4)); for (const o of near(FOE, id)) setRep(o, -Math.round(n * .3));
  if (n < 0) for (const o of FACS) if (o.id !== id && o.align === f.align && !near(FRIEND, id).includes(o.id) && !near(FOE, id).includes(o.id)) setRep(o.id, Math.round(n * .12));
}
const news = t => { const fr = Fr(); fr.news.unshift(`${S().day}일: ${t}`); fr.news.length = Math.min(fr.news.length, 30); };
// 세력 제자
function folk(f) { const l = LOCS.find(q => q.fac === f.id), L = G.base?.folk(l) || ['Knight']; return L.find(s => s !== 'Skeleton') || L[0]; }  // 마교 제자도 사람 모습(해골은 혈마와 강시 몫)
function disciple(f, lv, sp) {
  const k = `fd_${f.id}${sp ? '_s' : ''}`, m = G.arts.usable(f.id).slice(0, sp ? 3 : 2);
  FOES[k] = { name: sp ? `${f.name} 사범` : `${f.name} 제자`, spr: 'chars/' + folk(f), hp: Math.round((30 + lv * 24) * (sp ? 1.8 : 1)), atk: (6 + lv * 1.4) * (sp ? 1.05 : .95), def: 1 + lv * .33, spd: Math.min(80, 52 + lv * .6), exp: Math.round((8 + lv * 5.4) * (sp ? 1.6 : 1)), silver: Math.round(4 + lv * 1.1), pause: sp ? 1 : 1.15, moves: ['slash', ...m], wpn: f.wpn, guard: sp ? .6 : .3, poise: sp ? 30 + lv * 2 : 0 };
  return k;
}
const crew = (f, lv, n) => Array.from({ length: n }, () => disciple(f, lv));
const manName = () => pick(SURNAME) + pick(GIVEN);
// ── 원한 ──
function addGrudge(fid, victim, stage = 1) {
  const fr = Fr(); if (fr.grudge.length >= 4) return; const f = fac(fid); if (!f) return;
  fr.grudge.push({ id: fr.evId++, fac: fid, who: manName(), victim, stage, wait: 2 + Math.floor(Math.random() * 4), lv: S().lv + stage });
}
async function kill(fid, name) {
  const fr = Fr(); fr.infamy += 4; addRep(fid, -14); if (Math.random() < .55) addGrudge(fid, name); news(`${fac(fid)?.name || '어느 문파'} 사람이 칼에 맞아 죽었다는 소문이 돈다.`);
  if (fr.fac && fr.fac === fid) { await narr('같은 문파 사람을 벴다. 돌아갈 곳이 없어졌다.'); G.free.leaveForce?.(fid); }
}
// 본가나 본문 안에서 손을 대면 그 자리에서 원수가 된다. 친한 세력도 등을 돌리고(addRep가 번진다), 며칠 동안 추격대가 쫓는다
function feud(fid, victim, how = 'kill') {
  const fr = Fr(), f = fac(fid); if (!f) return;
  addRep(fid, how === 'kill' ? Math.min(-60, -50 - rep(fid)) : how === 'rob' ? -30 : -15);
  if (how !== 'kill') return;
  if (!fr.grudge.some(g => g.fac === fid)) addGrudge(fid, victim, 2);
  fr.chase = { fac: fid, until: S().day + 4 };
  news(`${josa(f.name, '이/가')} ${josa(S().name, '을/를')} 원수로 삼았다. ${/세가/.test(f.group) ? '본가' : '본문'} 사람을 죽였다고 한다.`);
}
// 경종: 그 자리에서 사람들이 몰려온다. 지면 두들겨 맞고 산문 밖으로 내던져진다
async function alarm(f) {
  const lv = S().lv, home = /세가/.test(f.group) ? '본가' : '본문';
  await narr(pick([`종이 다급하게 울렸다. ${f.name} 사람들이 칼을 뽑고 사방에서 몰려온다.`, `누군가 "살인이다!" 하고 외쳤다. 담장 너머에서 ${f.name} 무사들이 뛰어나온다.`, `${home} 한가운데서 피를 봤다. 사범이 앞장서서 달려오고 있었다.`]));
  const won = await ctx.duel({ foes: [disciple(f, lv + 1, true), ...crew(f, lv, lv < 8 ? 2 : 3)], arena: G.field.m.arena, bgm: 'boss', title: `${f.name} 경종`, optional: true, noIntro: true });
  if (won) { await narr('쓰러진 사람들 너머로 또 발소리가 들린다. 오래 있을 곳이 아니다.'); return true; }
  const v = Math.round(S().silver * .3); S().silver -= v; await narr(`흠씬 두들겨 맞고 ${home} 밖으로 내던져졌다. 전대에서 은자 ${v}냥이 사라졌다.`);
  const q = G.field.m.portals.find(p => p.to === 'world'); if (q) await G.field.warp('world', q.tx, q.ty, 0); return false;
}
// 이긴 뒤 어떻게 할까
async function after(r) {
  const f = fac(r.fac); if (!f) return;
  if (r.gr) { const g = r.gr, c = await choice(`${josa(g.who, '이/가')} 무릎을 꿇었다. 칼끝이 목에 닿아 있다.`, ['살려 보낸다', '숨통을 끊는다']); Fr().grudge = Fr().grudge.filter(x => x !== g); if (c === 0) { await say(null, `${g.who}: 오늘 일은 잊지 않겠소. 원수로는 말고.`); addRep(r.fac, 6); Fr().fame += 3; } else { await narr('칼을 거두고 나니 조용했다. 이 사람에게도 사제가 있을 것이다.'); await kill(r.fac, g.who); if (g.stage < 3 && Fr().grudge.length) Fr().grudge[Fr().grudge.length - 1].stage = g.stage + 1; } return; }
  const c = await choice(`${f.name} 사람들이 쓰러져 있다.`, ['살려 보낸다', '숨통을 끊는다']);
  if (c === 0) { addRep(r.fac, 2); await say(null, '다음에 또 보면 그때는 안 놓아 준다고 말해 두었다.'); } else await kill(r.fac, `${f.name} 제자`);
}
// 전도에서 나를 찾아오는 사람들
function spawn(x, y) {
  const fr = Fr(), ch = fr.chase;
  // 갓 원수가 된 세력은 며칠 동안 친한 세력 사람까지 섞어 추격대를 보낸다
  if (ch && S().day <= ch.until && !fr.dead[ch.fac] && !fr.fallen[ch.fac] && Math.random() < .85) {
    const f = fac(ch.fac), al = near(FRIEND, ch.fac).map(fac).filter(x => x && !fr.fallen[x.id]), a = al.length ? pick(al) : null, lv = S().lv;
    const foes = [disciple(f, lv + 1, true), ...crew(f, lv, lv < 8 ? 1 : 2), ...(a ? crew(a, lv, 1) : [])];
    return { spr: FOES[foes[0]].spr, x, y, hx: x, hy: y, foes, fac: f.id, dir: 0, walk: 0, t: 1, vx: 0, vy: 0, intro: `${f.name}${a ? `·${a.name}` : ''} 추격대: ${pick(['살인자가 저기 있다! 놓치지 마라!', '찾았다. 우리 사람 목숨값을 받으러 왔다.', '도망칠 데는 없다. 강호 끝까지 쫓는다.'])}` };
  }
  const g = fr.grudge.find(q => q.wait <= 0);
  if (g) { const f = fac(g.fac), k = 'gr_' + g.id, lv = Math.max(g.lv, S().lv), kin = ['사제', '사형', '사부'][g.stage - 1] || '사형'; FOES[k] = { ...FOES[disciple(f, lv, true)], name: g.who, hp: Math.round((60 + lv * 30) * (1 + g.stage * .35)), boss: 1, poise: 60 + lv * 4 }; return { spr: FOES[k].spr, x, y, hx: x, hy: y, foes: [k], fac: g.fac, gr: g, intro: `${g.who}: ${josa(g.victim, '은/는')} 내 ${kin}이었다. 오늘 갚겠다.`, dir: 0, walk: 0, t: 1, vx: 0, vy: 0 }; }
  const H = FACS.filter(f => hostile(f.id) && !fr.dead[f.id]); if (H.length && Math.random() < .4) { const f = pick(H), lv = S().lv, foes = crew(f, lv, lv < 8 ? 1 : lv < 18 ? 2 : 3); return { spr: FOES[foes[0]].spr, x, y, hx: x, hy: y, foes, fac: f.id, intro: `${f.name} 추격대: 찾았다. 네 얼굴은 벌써 방이 붙었어.`, dir: 0, walk: 0, t: 1, vx: 0, vy: 0 }; }
  return null;
}
// 본거지 앞을 막는다
async function gate(f) {
  await say(null, `${f.name} 문지기가 칼을 뽑았다. 안에서도 사람들이 뛰어나온다.`);
  const lv = S().lv, won = await ctx.duel({ foes: crew(f, lv, lv < 8 ? 2 : 3), arena: G.field.m.arena, bgm: 'fight', title: `${f.name} 산문`, optional: true, noIntro: true });
  if (won) await after({ fac: f.id }); else await G.field.warp(...exitOf());
}
const exitOf = () => { const m = G.field.m, q = m.portals.find(p => p.to === 'world'); return ['world', q.tx, q.ty, 0]; };
// 사범에게 칼을 뽑는다
async function challenge(f) {
  const c = await choice(`${f.name}에 칼을 뽑으면 되돌리기 어렵다.`, ['칼을 뽑는다', '그만둔다']); if (c) return; addRep(f.id, -45); const lv = S().lv, won = await ctx.duel({ foes: [disciple(f, lv, true), ...crew(f, lv, 2)], arena: G.field.m.arena, bgm: 'fight', title: `${f.name} 습격`, optional: true, noIntro: true }); if (won) await after({ fac: f.id }); G.field.refresh();
}
// 화해
async function peace(f) { const cost = 200 + Math.abs(rep(f.id)) * 12; if (S().silver < cost) { toast(`화해금 은자 ${cost}냥이 모자란다`, 2.4); return; } S().silver -= cost; addRep(f.id, 45, false); Fr().grudge = Fr().grudge.filter(g => g.fac !== f.id); news(`${S().name}, ${f.name}에 사람을 보내 화해를 청하다.`); Sound.sfx('coin'); }
function jobDone(j) { const t = j.type; if (!j.rival) return; if (t === 'raid' || t === 'war' || t === 'assassin') { addRep(j.rival, t === 'assassin' ? -10 : -5); if (t === 'assassin' && Math.random() < .5) addGrudge(j.rival, manName()); } }
// ── 강호 사건 ──
const CITY = LOCS.filter(l => l.kind === 'city'), RIGHT = () => LOCS.filter(l => l.kind === 'sect' && fac(l.fac)?.align === 'jeong');
const canFall = f => S().mode === 'free' || !!f.hi;
function fall(id) { const fr = Fr(), f = fac(id); if (!f || fr.fallen[id] || fr.fac === id || !canFall(f) || G.saga?.guard(id)) return; fr.fallen[id] = S().day; news(`${josa(f.name, '이/가')} 무너졌다. 산문에 불이 났다는 소문이다.`); toast(`${josa(f.name, '이/가')} 무너졌다`, 4); }
function hurt(id, n) { const fr = Fr(); fr.power[id] = Math.max(10, (fr.power[id] || 60) - n); if (fr.power[id] <= 25) fall(id); }
const gain = (id, n) => { const fr = Fr(); fr.power[id] = Math.min(150, (fr.power[id] || 60) + n); };  // 한 해를 돌려도 세력이 끝없이 불지 않게
const rich = lv => 200 + lv * 16;
const VILLAIN = [['살수 조칠', '현상금이 붙은 지 십 년째다.'], ['독수 왕팔', '우물에 독을 풀고 다녔다.'], ['인면 곽노', '여관 손님만 골라 털었다.'], ['쌍도 마륭', '관군 셋을 베고 달아났다.'], ['흑호 나삼', '산길 표국을 혼자 털었다.'], ['귀면 서노', '얼굴을 본 사람이 없다.']];
const LEG = [['leg_sword', '의천검', '검', 42, 'Sword', '하늘에 기댄다는 칼. 세상에 한 자루뿐이다.'], ['leg_blade', '도룡도', '도', 44, 'BigSword', '용을 잡는다는 큰 칼. 무겁다.'], ['leg_spear', '패왕창', '창', 43, 'Lance2', '옛 패왕이 들었다는 창.'], ['leg_fist', '금강수갑', '권', 41, 'Club', '금강석을 박은 권갑.']];
for (const [k, name, type, atk, spr, desc] of LEG) WEAPONS[k] = { name, type, atk, spr, desc };
const wild = () => { G.world.build(); for (let i = 0; i < 40; i++) { const [x, y] = G.world.wildAround(pick(LOCS).px); if (x) return [x, y]; } return G.world.entry('cheongha'); };
const round = async (f, n, title) => { const lv = S().lv; return ctx.duel({ foes: f, arena: G.field.m.arena, bgm: n === 3 ? 'boss' : 'fight', title, optional: true, noIntro: true }); };
const TYPES = {
  tourney: { hint: '비무대회 접수처', mk: () => { const l = pick(CITY); return { map: l.map, place: l.name, left: 7, name: `${l.name} 비무대회` }; }, start: e => `${e.place}에서 비무대회가 열린다는 방이 붙었다.`, end: e => `${e.name}에서 ${pick(FACS).name} 사람이 우승했다.`,
    async run(e) { const s = S(); if (e.done) { await say(null, '대회는 끝났다. 빈 단상만 남았다.'); return; } const c = await choice(`${e.name}에 나갈까? (참가비 은자 50냥)`, ['나간다', '그만둔다']); if (c) return; if (s.silver < 50) { await say(null, '참가비가 모자란다.'); return; } s.silver -= 50; const lv = s.lv;
      for (let i = 1; i <= 3; i++) { const f = pick(FACS); await narr(`${i}회전. 상대는 ${f.name} 사람이다.`); const foes = i === 3 && lv >= 20 ? ['clan_' + f.id] : [disciple(f, lv + i - 1, true)]; if (!await round(foes, i, `${e.name} ${i}회전`)) { await say(null, '단상에서 내려왔다. 구경꾼들이 벌써 다음 사람을 보고 있었다.'); e.done = 1; return; } }
      e.done = 1; e.left = 0; e.won = 1; const v = rich(lv); s.silver += v; Fr().fame += 18; news(`${s.name}, ${e.name}에서 우승하다.`); await narr(`끝까지 서 있었다. 상금 은자 ${v}냥을 받았다.`); for (let i = 0; i < 2; i++) G.arts.drop(null, 1); } },
  treasure: { hint: '땅을 파는 사람들', mk: () => { const [x, y] = wild(); return { map: 'world', x, y, place: '강호 어딘가', left: 6, name: '고수의 유품' }; }, start: () => `옛 고수의 유품이 나왔다는 소문이 돈다. 칼 찬 사람들이 벌써 길을 나섰다.`, end: () => `옛 고수의 유품은 ${pick(FACS).name} 손에 들어갔다고 한다.`,
    async run(e) { await narr('먼저 온 사람들이 구덩이를 둘러싸고 서로 노려보고 있었다. 내가 다가가자 칼이 일제히 이쪽을 향했다.'); const lv = S().lv; if (!await round(G.free.group('rogue', lv + 1, 3), 2, '유품 쟁탈')) return; e.done = 1; e.left = 0; e.won = 1; await narr('구덩이 바닥에서 썩은 궤짝이 나왔다.'); for (let i = 0; i < 3; i++) G.arts.drop(null, 1); S().silver += rich(lv) >> 1; Fr().fame += 6; } },
  raid: { hint: '피투성이 제자', mk: () => { const fr = Fr(), L = RIGHT().filter(l => !fr.fallen[l.fac] && l.map.startsWith('b_')), l = pick(L), a = pick(['cheonma', 'cheonma', 'nokrim', 'hyeoleui', 'odok']); return { map: l.map, place: l.name, b: l.fac, a, left: 5, name: `${fac(a).name}의 ${l.name} 습격` }; }, start: e => `${josa(fac(e.a).name, '이/가')} ${josa(e.place, '을/를')} 치러 간다는 소문이 돈다.`, end: e => { hurt(e.b, 16); gain(e.a, 8); return `${josa(e.place, '이/가')} ${fac(e.a).name}에게 크게 당했다.`; },
    async run(e) { const a = fac(e.a), b = fac(e.b); if (e.done) { await say(null, '제자가 고맙다는 말을 몇 번이고 했다.'); return; } await say(null, `${b.name} 제자: ${a.name} 놈들이 산문까지 왔습니다. 칼을 드실 수 있으면 도와주십시오!`); const lv = S().lv; if (!await round(crew(a, lv + 1, 3), 2, `${b.name} 방어전`)) return; e.done = 1; e.left = 0; e.won = 1; hurt(e.a, 10); addRep(e.b, 22); Fr().fame += 10; const v = rich(lv) >> 1; S().silver += v; await say(null, `${b.name} 제자: 이 은혜는 잊지 않겠습니다. 은자 ${v}냥입니다.`); G.arts.drop(e.b, 1); news(`${S().name}, ${josa(e.place, '을/를')} 지켜 내다.`); } },
  plague: { hint: '지친 의원', mk: () => { const l = pick(CITY); return { map: l.map, place: l.name, left: 8, name: `${l.name} 역병` }; }, start: e => `${e.place}에 역병이 돈다. 사람들이 성문을 나서지 못한다.`, end: e => `${e.place} 역병이 겨우 가라앉았다. 집집마다 곡소리가 났다.`,
    async run(e) { if (e.done) { await say(null, '의원이 이제 눈을 붙일 수 있겠다고 했다.'); return; } await say(null, '의원: 약초가 모자랍니다. 다섯 뿌리만 있어도 한 집을 살립니다.'); if (have('herb') < 5) { await say(null, '약초가 모자란다.'); return; } const c = await choice('약초 다섯 뿌리를 내줄까?', ['내준다', '그만둔다']); if (c) return; take('herb', 5); e.done = 1; e.left = 0; e.won = 1; Fr().fame += 12; Fr().infamy = Math.max(0, Fr().infamy - 8); for (const f of FACS) if (f.align === 'jeong') setRep(f.id, 3); news(`${S().name}, ${e.place}에 약초를 내놓다.`); await narr('의원은 약초를 받아 들고 말없이 고개를 숙였다.'); } },
  famine: { hint: '구휼소', mk: () => { const l = pick(CITY); return { map: l.map, place: l.name, left: 8, name: `${l.name} 흉년` }; }, start: e => `${e.place} 일대에 흉년이 들었다. 쌀값이 세 배로 뛰었다.`, end: e => `${e.place}의 쌀값이 겨우 내렸다. 떠난 사람은 돌아오지 않았다.`,
    async run(e) { if (e.done) { await say(null, '죽 솥에 김이 오르고 있다.'); return; } if (have('rice') < 4) { await say(null, '구휼소 사람이 쌀 네 되만 있어도 하루는 버틴다고 했다.'); return; } const c = await choice('쌀 네 되를 내놓을까?', ['내놓는다', '그만둔다']); if (c) return; take('rice', 4); e.done = 1; e.left = 0; e.won = 1; Fr().fame += 10; Fr().infamy = Math.max(0, Fr().infamy - 6); news(`${S().name}, ${e.place} 구휼소에 쌀을 내놓다.`); await narr('줄이 조금 줄었다.'); } },
  bounty: { hint: '현상수배범', mk: () => { const [x, y] = wild(), [who, why] = pick(VILLAIN); return { map: 'world', x, y, place: '강호 어딘가', who, why, left: 9, name: `${who} 현상수배` }; }, start: e => `${e.who}에게 현상금이 붙었다. ${e.why}`, end: e => `${josa(e.who, '은/는')} 달아났다.`,
    async run(e) { await say(null, `${e.who}: 내 목값이 얼마나 하던가?`); const lv = S().lv, k = G.free.foeFor('rogue', lv + 2, true); FOES[k + '_v'] = { ...FOES[k], name: e.who }; if (!await round([k + '_v', ...G.free.group('bandit', lv, 2)], 3, e.name)) return; e.done = 1; e.left = 0; e.won = 1; const v = rich(lv); S().silver += v; Fr().fame += 8; news(`${S().name}, ${josa(e.who, '을/를')} 잡다.`); await narr(`관아에 넘기고 은자 ${v}냥을 받았다.`); } },
  caravan: { hint: '상단 행수', mk: () => { const l = pick(CITY); return { map: l.map, place: l.name, left: 5, name: `${l.name} 상단 호위` }; }, start: e => `${e.place}의 큰 상단이 호위를 구한다.`, end: e => `${e.place} 상단이 산적에게 털렸다.`,
    async run(e) { if (e.done) { await say(null, '행수가 다음에도 부탁한다고 했다.'); return; } const c = await choice('행수가 호위를 구한다. 따라갈까?', ['따라간다', '그만둔다']); if (c) return; await narr('짐수레 스무 대가 성문을 나섰다. 해 질 무렵 고개에서 사람들이 쏟아져 나왔다.'); const lv = S().lv; if (!await round(G.free.group('bandit', lv + 1, 3), 2, '상단 호위')) return; e.done = 1; e.left = 0; e.won = 1; const v = rich(lv); S().silver += v; await narr(`행수가 삯으로 은자 ${v}냥을 세어 주었다.`); } },
  blade: { hint: '신병 쟁탈전', mk: () => { const l = pick(CITY), w = pick(LEG); return { map: l.map, place: l.name, w: w[0], left: 7, name: `${w[1]} 쟁탈전` }; }, start: e => `${josa(WEAPONS[e.w].name, '이/가')} ${e.place}에 나타났다는 소문에 강호가 들썩인다.`, end: e => `${josa(WEAPONS[e.w].name, '은/는')} ${pick(FACS).name} 손에 들어갔다.`,
    async run(e) { if (S().weapons.includes(e.w)) { await say(null, '이미 내 손에 있다.'); return; } await narr('칼 한 자루를 두고 사람들이 줄을 서서 서로를 베고 있었다.'); const lv = S().lv; for (let i = 1; i <= 2; i++) { const f = pick(FACS); if (!await round([disciple(f, lv + 2, true), disciple(f, lv + 1, true)], i, `${e.name} ${i}차`)) return; } e.done = 1; e.left = 0; e.won = 1; S().weapons.push(e.w); Sound.sfx('ok3'); toast(`${josa(WEAPONS[e.w].name, '을/를')} 손에 넣었다`, 4); Fr().fame += 14; news(`${S().name}, ${josa(WEAPONS[e.w].name, '을/를')} 차지하다.`); } },
};
let quiet = null;
function startEv(type) { const fr = Fr(), T = TYPES[type], e = { id: fr.evId++, type, ...T.mk() }; if (S().mode === 'free') e.left = Math.ceil(e.left * .6); fr.ev.push(e); news(T.start(e)); if (quiet) quiet.push(e.name); else toast(`강호 소식: ${e.name}`, 3.4); }
// 이야기 모드의 시간은 지문을 따른다. "사흘이 지났다"면 사흘이 간다. 말이 없으면 장이 넘어갈 때만 조금 흐른다
const SPAN = { 하루: 1, 이틀: 2, 사흘: 3, 나흘: 4, 닷새: 5, 엿새: 6, 이레: 7, 여드레: 8, 아흐레: 9, 열흘: 10, 보름: 15, '한 달': 30, '두 달': 60, '석 달': 90, '넉 달': 120, 반년: 180, '한 해': 365, '일 년': 365 };
const SPAN_RE = new RegExp(`(${Object.keys(SPAN).join('|')})\\s*(?:이|을|가|를)?\\s*(?:더\\s*)?(지났|지나|갔다|뒤|후|걸렸|만에|동안|밤낮|됐|흘렀)`, 'g');
function heard(t) { const s = S(); if (!s || s.mode === 'free' || !t) return; let m, d = 0; SPAN_RE.lastIndex = 0; while ((m = SPAN_RE.exec(t))) d = Math.max(d, SPAN[m[1]]); if (d) s.storyPass = (s.storyPass || 0) + d; }
function storyTime() {
  const s = S(), step = s?.flags?.step; if (!step || s.mode === 'free') return; const ch = s.chapter || '', lc = s.lastChap ?? ch; s.lastChap = ch;
  const part = c => (c.match(/^제\d+부/) || [''])[0], days = s.storyPass || (part(ch) !== part(lc) ? 10 : ch !== lc ? 4 : 0); s.storyPass = 0; if (!days) return; quiet = [];
  for (let i = 0; i < days; i++) { s.day++; s.daily = {}; daily(); G.party?.daily(); }
  const L = quiet; quiet = null; if (L.length) toast(`강호 소식: ${L[L.length - 1]}`, 3.2); G.field.showHud?.();
}
function daily() {
  const fr = Fr(); if (!fr) return; for (const g of fr.grudge) g.wait--;
  for (const e of fr.ev) e.left--;
  for (const e of fr.ev.filter(q => q.left <= 0)) if (!e.won) news(TYPES[e.type].end(e)); fr.ev = fr.ev.filter(e => e.left > 0);
  if (fr.ev.length < 3 && Math.random() < (S().mode === 'free' ? .55 : .3) && G.world.open()) startEv(pick([...(S().mode === 'free' && G.saga ? [] : ['tourney']), 'treasure', 'raid', 'plague', 'famine', 'bounty', 'bounty', 'caravan', 'blade']));
  // 세력의 부침
  for (const f of FACS) { if (fr.fallen[f.id]) { if (S().day - fr.fallen[f.id] > (S().mode === 'free' ? 12 : 24) && !G.saga?.ruined(f.id)) { delete fr.fallen[f.id]; fr.power[f.id] = 40; news(`${josa(f.name, '이/가')} 다시 일어섰다.`); } continue; } if (Math.random() < .15) fr.power[f.id] = Math.min(150, Math.max(25, (fr.power[f.id] || 60) + (Math.random() < .5 ? 2 : -2))); fr.power[f.id] += (40 + f.tier * 20 - fr.power[f.id]) * .012; }  // 세력은 몇 달에 걸쳐 제 크기로 돌아온다
  if (S().mode !== 'free' && G.free.worldTick) G.free.worldTick();
}
const evNpcs = id => { const fr = Fr(); return (fr?.ev || []).filter(e => e.map === id && !e.won).map(e => ({ id: 'ev' + e.id, spr: e.type === 'plague' ? 'OldMan' : e.type === 'bounty' ? 'DarkNinja' : e.type === 'raid' ? 'GreenNinja' : e.type === 'treasure' ? 'Villager2' : 'Noble', x: e.x ?? G.base.spot(e.map)[0], y: e.y ?? G.base.spot(e.map)[1], dir: 0, mark: () => true, hint: TYPES[e.type].hint, talk: () => TYPES[e.type].run(e) })); };
Story.providers.push(id => ({ npcs: G.S && G.world?.open() ? [...evNpcs(id), ...(S().mode !== 'free' ? G.free.jobNpcs(id) : [])] : [], spots: [], trigs: [], roam: [] }));
// 이야기가 어디까지 왔는지에 따라 사람들이 하는 말
const RUMOR = {
  1: ['청하진 쪽에 수적이 보호세를 뜯는다던데요.', '달맞이 객잔이 불탔대요. 국수가 괜찮았는데.', '창운문이 제자를 받는다는 말이 있어요.'],
  2: ['창운문 문주가 앓아누웠다는 소문이 돌아요.', '창운산 쪽 약초값이 올랐어요. 누가 사들이는 모양이에요.', '검각주 위문상이 곧 문주가 될 거라고들 해요.'],
  3: ['구화성에서 천하비무가 열린대요. 방값이 세 배가 됐어요.', '소림 장경각을 청소한 낭인이 있대요. 무슨 소린지는 모르겠지만.', '화산이랑 종남이 또 싸운대요. 그 사람들은 쉬는 날이 있나 몰라요.'],
  4: ['구화성 대회장에 불이 났대요. 맹주가 토벌령을 내렸다나요.', '흑도맹 깃발이 강가에 보인대요.', '뱃삯이 세 배가 됐어요. 전쟁 때문이래요.'],
  5: ['장문인이 자다가 죽었대요. 혈의방 짓이라는데 본 사람이 없어요.', '사천 쪽에서는 우물을 함부로 마시지 말래요. 독이 돌았대요.', '고을마다 징발령이에요. 우리 아들도 끌려갔어요.'],
  6: ['구화성 사람들이 십칠 년 전 얘기를 수군대요. 뭔지는 말을 안 해 줘요.', '달이 이상해요. 어젯밤엔 붉게 떴다니까요.', '맹주가 어쨌다는 소문이 있는데, 입조심해요.'],
  7: ['서쪽 문파들이 열흘 만에 무너졌대요.', '붉은 비 오면 받아 마시지 마요. 앓다가 벌떡 일어난대요.', '정파랑 사파가 한 객잔에 앉았대요. 오래 살고 볼 일이에요.'],
  8: ['서쪽으로 원정대가 떠났대요. 돌아온 사람은 아직 없어요.', '비단길 장사꾼이 씨가 말랐어요.', '사주성 성문이 낮에도 닫혀 있대요.'],
  9: ['천산 쪽 소식이 끊겼어요.', '강 따라 피난민이 내려와요. 다들 말을 안 해요.', '그래도 문은 열어야지요. 국밥은 식으면 못 먹으니까.'],
};
const talkOfDay = () => { const s = S(); if (s.mode === 'free') return null; const n = +(String(s.chapter || '').match(/^제(\d+)부/) || [])[1]; return RUMOR[n] ? pick(RUMOR[n]) : null; };
// 재건
async function rebuild(f) { const c = await choice(`${josa(f.name, '은/는')} 무너졌다. 남은 사람들이 잿더미를 치우고 있다.`, ['은자 1000냥을 내놓는다', '돌아선다']); if (c) return; if (S().silver < 1000) { await say(null, '은자가 모자란다.'); return; } S().silver -= 1000; delete Fr().fallen[f.id]; Fr().power[f.id] = 45; addRep(f.id, 45, false); Fr().fame += 12; news(`${S().name}, ${f.name} 재건을 돕다.`); await narr('남은 제자들이 땅에 머리를 찧었다. 일으켜 세우느라 한참 걸렸다.'); G.field.refresh(); }
// 소식 탭
function tab(B) {
  const fr = Fr(), rows = fr.ev.map(e => `<div class="note" style="margin-bottom:6px;padding:7px 10px"><b style="font-weight:400">${esc(e.name)}</b> <small class="hint">${esc(e.place)} · ${e.left}일 남음${e.won ? ' · 끝남' : ''}</small></div>`).join('') || '<p class="hint">지금은 큰일이 없다.</p>';
  const gr = fr.grudge.map(g => `<div class="hint">${esc(g.who)} (${fac(g.fac)?.name}): ${esc(g.victim)}의 일로 나를 찾고 있다.</div>`).join('') || '<div class="hint">나를 찾는 사람은 없다.</div>';
  const bad = FACS.filter(f => hostile(f.id)).map(f => `<div style="margin-bottom:4px">${f.name} <small class="hint">우호 ${rep(f.id)}</small> <button class="btn sm" data-p="${f.id}">화해금 은자 ${200 + Math.abs(rep(f.id)) * 12}냥</button></div>`).join('') || '<div class="hint">적으로 삼은 세력은 없다.</div>';
  const down = Object.keys(fr.fallen).map(k => fac(k)?.name).filter(Boolean).join(', '), jobs = S().mode === 'free' ? '' : `<h2 style="margin-top:10px">맡은 일</h2>${fr.jobs.map(j => `<div class="hint">${esc(j.title)} (${esc(j.place || '')})</div>`).join('') || '<div class="hint">맡은 일이 없다. 도시에서 일거리를 찾을 수 있다.</div>'}`;
  B.innerHTML = `${G.saga?.html() || ''}<div class="two"><div><h2>강호 사건</h2>${rows}<p class="hint">자리는 지도(M)에 별로 나온다. 끼어들지 않아도 날짜가 지나면 저절로 끝난다.</p>${jobs}${G.era?.open().length ? `<h2 style="margin-top:10px">들려오는 이야기</h2>${G.era.open().map(q => `<div class="hint">${esc(q.where)} 쪽에 무슨 일이 있다고 한다.</div>`).join('')}` : ''}<h2 style="margin-top:10px">원한</h2>${gr}<h2 style="margin-top:10px">적대</h2>${bad}${down ? `<h2 style="margin-top:10px">무너진 세력</h2><div class="hint">${down}</div>` : ''}</div><div><h2>소문</h2>${fr.news.slice(0, 16).map(n => `<div class="hint">${esc(n)}</div>`).join('') || '<div class="hint">아직 들리는 소문이 없다.</div>'}</div></div>`;
  B.querySelectorAll('[data-p]').forEach(b => b.onclick = () => { peace(fac(b.dataset.p)); tab(B); });
}
G.jh = { feud, alarm, hurt, gain, talkOfDay, heard, storyTime, ensure, rep, addRep, hostile, disciple, crew, kill, after, spawn, gate, challenge, peace, jobDone, daily, tab, rebuild, fallen: id => !!Fr()?.fallen[id], news, startEv, TYPES, marks: () => [...(Fr()?.ev || []).filter(e => !e.won), ...(G.saga?.marks() || [])], near };
