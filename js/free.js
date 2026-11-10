// 자유 모드: 이야기 없이 강호를 산다. 소속, 임무, 직위, 세력 다툼
import { G, Sound, toast, josa, el, esc, rnd, pick, fadeTo, $ } from './core.js';
import { Story, ctx, say, narr, choice } from './ctx.js';
import { WHO } from './dialog.js';
import { FOES } from './foes.js';
import { MAPS } from './maps.js';
import { DB, ACCS, LOOT } from './items.js';
import { CLANS } from './clandata.js';
import { have, take, learn, nextDay, save } from './state.js';
import { panel } from './life.js';
import { EXTRA, RANKS, RANK_MERIT, RANK_LV, TRIALS, JOBS, FJOBS, WAR_JOB, PLACES } from './freedata.js';
import { LOCS } from './worlddata.js';

const S = () => G.S, Fr = () => G.S.fr, F = () => G.S.flags;
export const FACS = [...CLANS.map(c => ({ ...c, align: 'jeong', key: 'clan_' + c.id })), ...EXTRA];
// 자유 모드에서는 대표가 본거지에 있다
const HOME = { shaolin: ['shaolin', 20, 12.5] };
FACS.forEach(f => { const l = LOCS.find(q => q.fac === f.id); if (HOME[f.id]) f.at = HOME[f.id]; else if (l && l.map.startsWith('b_')) f.at = [`r_${l.id}_hall`, 11, 5]; });
export const fac = id => FACS.find(f => f.id === id);
export const rankName = (f, r) => (f.id === 'gaebang' ? RANKS.개방 : RANKS[f.group])[r];
const T = { 1: [1000, 28, 8, 66, 130, 60, 1.05, 130], 2: [1500, 34, 10, 72, 220, 100, .95, 170], 3: [2200, 40, 12, 76, 340, 160, .85, 220] };
for (const c of EXTRA) { const t = T[c.tier]; FOES['clan_' + c.id] = { name: c.who, spr: 'chars/' + c.spr, hp: t[0], atk: t[1], def: t[2], spd: t[3], exp: t[4], silver: t[5], pause: t[6], poise: t[7], moves: c.moves, boss: 1, title: c.name, wpn: c.wpn, guard: c.tier * .4, phases: [{ hp: .5, pause: t[6] * .8 }] }; }
Object.assign(WHO, { steward: { name: '집사', face: 'OldMan' } });

// ── 적 ──
const KIND = {
  bandit: ['산적', 'chars/Villager2', 'Club', ['slash', 'heavy', 'lunge']], rogue: ['낭인 무사', 'chars/DarkNinja', 'Ninjaku', ['quick', 'lunge', 'dart3']], pirate: ['수적', 'chars/Villager3', 'Lance', ['slash', 'lunge', 'heavy']],
  guard: ['호위 무사', 'chars/Knight', 'Sword', ['double', 'lunge', 'slash']], villager: ['민병', 'chars/Villager', 'Club', ['slash', 'heavy']], hunter: ['토벌대', 'chars/Knight', 'Sword', ['double', 'flurry', 'lunge']],
};
export function foeFor(kind, lv, boss) {
  const k = KIND[kind], id = `q_${kind}${boss ? '_b' : ''}`, m = boss ? 2.6 : 1;
  FOES[id] = { name: boss ? `${k[0]} 두목` : k[0], spr: k[1], hp: Math.round((30 + lv * 24) * m), atk: (6 + lv * 1.4) * (boss ? 1.15 : 1), def: 1 + lv * .33, spd: Math.min(80, 50 + lv * .6), exp: Math.round((8 + lv * 5.4) * (boss ? 2 : 1)), silver: Math.round((4 + lv * 1.1) * (boss ? 2 : 1)), pause: boss ? 1 : 1.15, moves: k[3], wpn: k[2], guard: boss ? .5 : .2, poise: boss ? 40 + lv * 3 : 0 };
  return id;
}
const group = (kind, lv, n) => { const a = n >= 3 ? [foeFor(kind, lv, true)] : []; while (a.length < n) a.push(foeFor(kind, lv)); return a; };

// ── 처음 ──
export function initFree() {
  const s = S();
  s.mode = 'free'; s.silver = 200; s.potion = 3; s.weapons = ['mop', 'army_blade']; s.weapon = 'army_blade'; s.map = 'cheongha';
  Object.assign(s.flags, { step: 'end', ended: true, act3: true, burned: true, inn_rebuilt: true, bamboo_open: true, fort_open: true, ma_open: true, pass_open: true, cloud_open: true, bokun_open: true, boat_guhwa: true, title_free: true, cross: true, monk_met: true, met_cheol: true, rod: true, bow: false });
  s.fr = { fac: null, rank: 0, merit: 0, rep: {}, fame: 0, infamy: 0, jobs: [], board: {}, done: 0, sect: null, towns: {}, wars: [], news: [], power: {}, nextId: 1, clock: 0, left: {} };
  FACS.forEach(f => { s.fr.power[f.id] = 40 + f.tier * 20; });
  s.flags.world_open = true; G.jh.ensure();
  learn('tray');
}
async function opening() {
  await narr('군적에서 이름이 지워진 뒤로 나는 청하진 달맞이 객잔에서 국수를 날랐다. 그렇게 석 달이 지났다.');
  await say('gwak', '{나}야, 이리 와 봐.');
  await say('me', '바닥 다 닦았는데요.');
  await say('gwak', '안다. 짐 싸.');
  await say('me', '네?', 'b');
  await say('gwak', '요즘 네 눈이 자꾸 나루 쪽으로 가더라. 평생 국수만 나를 놈이 아니야. 나가서 살아 봐. 문파에 들어가도 좋고 네가 하나 차려도 좋고.', 'h');
  await say('gwak', '못된 짓을 하고 다니면 내 국자가 찾아간다. 알았어?', 'a');
  await say('gwak', '이건 석 달 치 품삯이다. 배고프면 와. 밥값은 받는다.', 'h');
  await narr('그렇게 나는 강호로 나왔다. 어디로 갈지는 아무도 정해 주지 않았다.');
  ctx.goal('강호를 둘러보기 (청하진 나루 팻말에서 강호로 나갈 수 있다)');
  toast('지도(M)로 강호 전도를 봅니다. 가 본 곳은 눌러서 빠르게 갈 수 있습니다', 5);
}
export function startFree() { initFree(); G.scene = 'field'; G.field.load('cheongha', 22, 12, 0); $('#fade').style.opacity = 1; G.field.run(async () => { await fadeTo(0); await opening(); }); }

// ── 평판 ──
const repOf = id => Fr().rep[id] || 0;
export const addRep = (id, n) => { Fr().rep[id] = Math.max(-100, Math.min(100, repOf(id) + n)); };
export function addNews(t) { const f = Fr(); f.news.unshift(`${S().day}일: ${t}`); f.news.length = Math.min(f.news.length, 30); }
export const curFac = () => (Fr().fac && Fr().fac !== 'my' ? fac(Fr().fac) : null);
const facAlign = () => { const f = curFac(); return f ? f.align : Fr().fac === 'my' ? (Fr().sect.align || 'free') : 'free'; };
const rivalOf = f => { const al = f ? f.align : 'free', L = FACS.filter(x => x.id !== (f && f.id) && (al === 'jeong' ? x.align !== 'jeong' || rnd(0, 1) < .3 : al === 'sa' ? x.align === 'jeong' : x.align !== 'ma')); return pick(L.length ? L : FACS); };

// ── 임무 ──
function reachable(id) {
  const m = MAPS[id]; if (m._reach) return m._reach; const p = PLACES[id], st = p ? p.at : [m.w / 2, m.h / 2], from = [Math.floor(st[0]), Math.floor(st[1])], seen = new Set([from.join()]), q = [from], out = [];
  while (q.length) { const [x, y] = q.shift(); out.push([x, y]); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy, k = nx + ',' + ny; if (seen.has(k) || nx < 1 || ny < 1 || nx >= m.w - 1 || ny >= m.h - 1 || m.blocked((nx + .5) * 16, (ny + .7) * 16)) continue; seen.add(k); q.push([nx, ny]); } }
  return m._reach = out;
}
const spotIn = id => { const a = reachable(id).filter(([x, y]) => { const p = PLACES[id].at; return Math.hypot(x - p[0], y - p[1]) > 6; }); const b = pick(a.length ? a : reachable(id)); return [b[0] + .5, b[1] + .6]; };
const tierOf = lv => lv < 8 ? 1 : lv < 14 ? 2 : lv < 22 ? 3 : lv < 28 ? 4 : lv < 34 ? 5 : 6;
function wildSpot() {
  G.world.build(); const t = tierOf(S().lv), L = LOCS.filter(l => l.t <= t && l.t >= Math.max(1, t - 1)), l = pick(L.length ? L : LOCS), K = G.world.K, m = MAPS.world;
  for (let i = 0; i < 40; i++) { const a = rnd(0, 6.28), d = rnd(9, 20), x = Math.round(l.px[0] * K + Math.cos(a) * d), y = Math.round(l.px[1] * K + Math.sin(a) * d); if (!m.blocked((x + .5) * 16, (y + .7) * 16, 14, 10)) return { name: l.name + ' 근처', x: x + .5, y: y + .6 }; }
  const [x, y] = G.world.entry(l.map); return { name: l.name + ' 근처', x, y };
}
function placesFor(lv) { const t = tierOf(lv); return Object.keys(PLACES).filter(k => PLACES[k].t <= t && PLACES[k].t >= Math.max(1, t - 1) && !['ninehall', 'fiveclans'].includes(k)); }
function makeJob(f, war) {
  const s = S(), al = f ? f.align : facAlign(), pool = JOBS[al] || JOBS.free, t = war ? WAR_JOB : f && FJOBS[f.id] && rnd(0, 1) < .55 ? pick(FJOBS[f.id]) : pick(pool), lv = Math.max(1, s.lv + (rnd(0, 1) < .3 ? 1 : 0)), wild = rnd(0, 1) < .65 ? wildSpot() : null, map = wild ? 'world' : pick(placesFor(s.lv)), r = war ? fac(war) : rivalOf(f), p = wild ? wild.name : PLACES[map].name;
  const j = { id: Fr().nextId++, fac: f ? f.id : null, type: t[0], title: t[1], desc: t[2].replace(/\{p\}/g, p).replace(/\{r\}/g, r.name), kind: t[3], lv, map, place: p, rival: r.id, war: war || null };
  if (t[0] === 'gather') { if (!DB[t[3]]) return makeJob(f, war); j.item = t[3]; j.qty = t[4]; j.map = s.map; const h = f ? f.at : null; j.hub = h ? h[0] : 'cheongha'; j.map = j.hub; j.desc += ` (${DB[t[3]].name} ${t[4]}개)`; }
  if (t[0] === 'gather') j.place = PLACES[j.hub]?.name || fac(f?.id)?.name || '';
  [j.x, j.y] = t[0] === 'gather' ? gatherSpot(j.hub) : wild ? [wild.x, wild.y] : spotIn(map);
  j.silver = Math.round((30 + lv * 12) * (war ? 1.4 : 1)); j.merit = Math.round((24 + lv * 2.2) * (war ? 1.6 : 1)); j.fame = 2;
  return j;
}
const gatherSpot = id => { const p = id === 'cheongha' ? [20, 19] : id === 'cloudmt' ? [26, 20] : id === 'ninehall' ? [20, 13] : id === 'fiveclans' ? [18, 14] : id === 'fort' ? [18, 21] : id === 'shrine' ? [4, 8] : id.startsWith('r_') ? [5, 10.5] : [10, 10]; return p; };
function boardFor(fid) {
  const b = Fr().board, k = fid || 'free';
  const stamp = `${S().day}:${period()}`; // 하루가 길어서 끼니마다 일거리가 바뀐다
  if (!b[k] || b[k].day !== stamp) {
    const f = fid && fid !== 'my' ? fac(fid) : null, war = f ? warOf(f.id) : null;
    b[k] = { day: stamp, list: [] };
    for (let i = 0; i < 3; i++) b[k].list.push(makeJob(f));
    if (war) b[k].list.unshift(makeJob(f, war.a === f.id ? war.b : war.a));
    if (G.saga) b[k].list.unshift(...G.saga.jobsFor(fid));  // 무림 정세에 따라 올라오는 일
  }
  return b[k].list;
}
export async function openBoard(fid, title) {
  const list = boardFor(fid);
  await panel(title, (B, redraw, close) => {
    B.innerHTML = `<p class="hint">받은 임무 ${Fr().jobs.length}/4. 임무는 하루마다 바뀐다.</p>`;
    const L = el('div', 'list');
    if (!list.length) L.innerHTML = '<p class="hint">오늘은 더 받을 일이 없다.</p>';
    for (const j of list) {
      const b = el('button', 'item', `${esc(j.title)}<span class="tag">은자 ${j.silver}${j.fac ? ` · 공적 ${j.merit}` : ''}</span><small>${esc(j.desc)}</small>`);
      b.disabled = Fr().jobs.length >= 4;
      b.onclick = () => { Fr().jobs.push(j); list.splice(list.indexOf(j), 1); Sound.sfx('select'); syncGoal(); redraw(); };
      L.appendChild(b);
    }
    B.appendChild(L);
  });
  G.field.refresh();
}
export function syncGoal() { if (S().mode !== 'free') return; const J = Fr().jobs; if (!J.length) { if (/^임무/.test(S().goal || '')) ctx.goal(''); return; } ctx.goal(`임무: ${J[0].title} (${J[0].type === 'gather' ? '납품' : J[0].place || ''})${J.length > 1 ? ` 외 ${J.length - 1}건` : ''}`); }
function finish(j, ok = true) {
  const f = Fr(); f.jobs = f.jobs.filter(x => x !== j); syncGoal();
  if (!ok) return;
  S().silver += j.silver; f.done++; f.fame += j.fame;
  if (j.fac && j.fac === f.fac) f.merit += j.merit;
  if (j.fac) { addRep(j.fac, 3); addRep(j.rival, -1); }
  G.jh.jobDone(j);
  if (j.war) warScore(j.fac, 1);
  Sound.sfx('coin'); toast(`임무 완료: 은자 ${j.silver}냥${j.fac === f.fac && j.fac ? `, 공적 ${j.merit}` : ''}`, 3.5);
  if (G.evil) G.evil.afterJob(j);
}
const duelJob = (j, foes, title, extra = {}) => ctx.duel({ foes, arena: MAPS[j.map]?.arena || 'village', bgm: 'fight', title, optional: true, noIntro: true, ...extra });
const HINT = { hunt: '토벌하기', escort: '상단 만나기', deliver: '서찰 전하기', spar: '비무하기', gather: '납품하기', raid: '상단 덮치기', extort: '자릿세 받기', assassin: '표적 찾기', war: '전선 합류' };
const SPR = { hunt: 'Villager2', escort: 'Noble', deliver: 'Villager', spar: 'Samurai', gather: 'Villager4', raid: 'Noble', extort: 'Villager', assassin: 'OldMan', war: 'Knight' };
async function runJob(j) {
  if (j.type === 'saga') return G.saga.runJob(j, finish, duelJob);
  const n = () => 2 + (j.lv >= 10 ? 1 : 0) + (j.lv >= 24 ? 1 : 0), g = (kind = j.kind, c = n()) => group(kind, j.lv, c);
  if (j.type === 'gather') {
    if (have(j.item) < j.qty) { await say(null, `${DB[j.item].name} ${j.qty}개가 있어야 한다. 지금 ${have(j.item)}개 있다.`); return; }
    take(j.item, j.qty); await say(null, '창고지기가 수를 세어 보고 고개를 끄덕였다.'); finish(j); return;
  }
  if (j.type === 'deliver') {
    await say(null, '봉투를 건네자 받는 사람이 주위를 한 번 살피더니 문을 닫았다.');
    if (rnd(0, 1) < .35) { await narr('돌아서는데 뒤따라온 사람들이 길을 막았다.'); if (!await duelJob(j, g(j.kind, 2), '길목 습격')) return; }
    finish(j); return;
  }
  if (j.type === 'escort') { await say(null, '상단 행수가 반갑게 손을 흔들었다. 짐을 싣고 얼마 안 가 고갯마루에서 사람들이 뛰어나왔다.'); if (!await duelJob(j, g(), '호위')) return; await say(null, '행수가 삯을 세어 주었다. 짐은 하나도 안 없어졌다.'); finish(j); return; }
  if (j.type === 'spar') { const r = fac(j.rival); await say(null, `${r.name} 옷을 입은 사람이 칼을 뽑고 기다리고 있었다.`); if (!await duelJob(j, [foeFor('guard', j.lv, true)], `비무 · ${r.name}`, { yieldAt: .25, bgm: 'boss', noLoot: true })) return; finish(j); return; }
  if (j.type === 'extort') {
    const c = await choice('장사꾼들이 고개를 숙이고 있다.', ['좋게 말로 받는다', '좌판을 뒤엎는다', '이번 달은 봐준다']);
    if (c === 2) { await say(null, '장사꾼이 몇 번이고 고개를 숙였다. 받아 간 게 없으니 위에 할 말도 없었다.'); finish(j, false); return; }
    if (c === 1) { Fr().infamy += 3; await narr('좌판이 엎어지고 사과가 길바닥으로 굴렀다. 돈은 금방 나왔다.'); j.silver = Math.round(j.silver * 1.4); }
    else await say(null, '장사꾼은 한숨을 쉬며 돈주머니를 내밀었다.');
    finish(j); return;
  }
  if (j.type === 'assassin') {
    await narr('표적은 낡은 집에서 혼자 밥을 먹고 있었다. 칼 찬 사람을 보더니 수저를 내려놓았다.');
    const c = await choice('표적이 달아나지도 않고 앉아 있다.', ['일을 끝낸다', '놓아준다']);
    if (c === 1) { await say(null, '칼을 거두고 나왔다. 위에는 놓쳤다고 해야 했다.'); addRep(j.fac, -5); Fr().fame += 1; finish(j, false); return; }
    Fr().infamy += 6; await narr('일을 끝내고 나왔다. 밥상에는 수저가 두 벌 놓여 있었다.'); finish(j); return;
  }
  if (j.type === 'raid') {
    await narr('수레 넷에 호위가 붙어 있었다. 숲에서 튀어나가자 말이 놀라 울었다.');
    if (!await duelJob(j, g('guard'), '상단 습격')) return;
    Fr().infamy += 4; S().silver += j.lv * 6; finish(j); return;
  }
  if (j.type === 'war') { await narr(`${fac(j.rival).name} 사람들이 길을 끊고 서 있었다.`); if (!await duelJob(j, g('guard', n() + 1), '전선')) return; finish(j); return; }
  if (!await duelJob(j, g(), j.title)) return;
  finish(j);
}

// ── 문파 안에서 ──
const canPromote = () => { const f = Fr(), r = f.rank + 1; return curFac() && r <= 4 && f.merit >= RANK_MERIT[r] && S().lv >= RANK_LV[r]; };
function grantRank(f) {
  const s = S(), fr = Fr(), r = fr.rank;
  if (f.gift[r - 0]) learn(f.gift[r - 0]);
  if (r === 1 && f.heart && !s.hearts.includes(f.heart)) { s.hearts.push(f.heart); toast('문파 심법을 익혔다', 3); }
  if (r === 3 && LOOT[f.id]) { const a = LOOT[f.id].find(i => ACCS[i]); if (a && !(s.accs || []).includes(a)) { (s.accs = s.accs || []).push(a); toast(`${josa(ACCS[a].name, '을/를')} 받았다`, 3); } }
  s.title = `${f.name} ${rankName(f, r)}`;
}
async function join(f) {
  const fr = Fr();
  if (fr.fac) { await say(f.key, '다른 곳에 몸담은 사람은 받지 않습니다.'); return; }
  if (f.align === 'jeong' && fr.infamy >= 30) { await say(f.key, '손에 묻은 것부터 씻고 오시오. 그런 사람은 받을 수 없소.'); return; }
  if (repOf(f.id) <= -30 || fr.left[f.id]) { await say(f.key, '한 번 나간 문은 다시 열지 않소.'); return; }
  await say(f.key, f.group === '사파' ? '들어오고 싶다고? 절차는 간단하다. 여기 애들이랑 붙어서 서 있으면 된다.' : f.group === '마교' ? '입교하려면 먼저 시험을 치러야 합니다.' : '입문을 원하면 시험을 봐야 하오.');
  const won = await ctx.duel({ foes: group('guard', Math.max(1, S().lv), 2), arena: MAPS[f.at[0]]?.arena || 'court', bgm: 'fight', title: '입문 시험', optional: true, noIntro: true });
  if (!won) { await say(f.key, '다음에 다시 오시오.'); return; }
  fr.fac = f.id; fr.rank = 0; fr.merit = 0; addRep(f.id, 15); grantRank(f); Sound.sfx('ok3');
  addNews(`${S().name}, ${f.name}에 들어가다.`);
  await say(f.key, `${rankName(f, 0)}로 받겠소. 일이 있으면 언제든 찾아오시오.`);
}
async function leave(f) {
  const c = await choice(`${josa(f.name, '을/를')} 떠날까? 공적은 사라지고 다시 들어올 수 없다.`, ['떠난다', '그만둔다']); if (c) return;
  const fr = Fr(); addRep(f.id, -40); fr.left[f.id] = 1; fr.fac = null; fr.rank = 0; fr.merit = 0; fr.head = false; S().title = '떠돌이 낭인';
  fr.jobs = fr.jobs.filter(j => j.fac !== f.id); syncGoal(); addNews(`${S().name}, ${josa(f.name, '을/를')} 떠나다.`);
  await say(f.key, '가시오.');
}
async function promote(f) {
  const fr = Fr(), r = fr.rank + 1, lv = S().lv, arena = MAPS[f.at[0]]?.arena || 'court';
  if (r === 3) { const t = TRIALS[f.id]; for (const [w, l] of t.lines) await say(w, l); if (!await ctx.duel({ foes: group(t.kind, lv, 3), arena, bgm: 'fight', title: '장로 시험', optional: true, noIntro: true })) return; await narr(t.end); }
  else if (r === 4) { await say(f.key, '내 자리를 원하는군. 칼로 말하시오.'); if (!await ctx.duel({ foes: ['clan_' + f.id], arena, bgm: 'boss', title: `${f.name} 승계전`, yieldAt: .2, optional: true, noLoot: true })) return; fr.head = true; addNews(`${S().name}, ${f.name}의 ${rankName(f, 4)} 자리에 오르다.`); }
  else { await say(f.key, '실력을 보겠소.'); if (!await ctx.duel({ foes: group('guard', lv, r + 1), arena, bgm: 'fight', title: '승급 시험', optional: true, noIntro: true })) return; }
  fr.rank = r; grantRank(f); addRep(f.id, 10); Sound.sfx('ok3'); toast(`${rankName(f, r)}(으)로 올랐다`, 3.5);
  ctx.note(`${f.name} ${rankName(f, r)}가 되었다.`);
}
async function stipend(f) { const fr = Fr(), d = S().daily; d.stipend = 1; const v = Math.round((20 + fr.rank * 30) * Math.max(1, dayLen() / 600)); S().silver += v; Sound.sfx('coin'); await say(f.key, `이번 봉록이오. 은자 ${v}냥.`); }
async function sparClan(f) {
  S().daily['duel_' + f.id] = 1;
  const won = await ctx.duel({ foes: ['clan_' + f.id], arena: MAPS[f.at[0]]?.arena || 'court', bgm: 'boss', title: `${f.name} · ${f.who}`, yieldAt: .25, optional: true, noLoot: true });
  if (!won) { await say(f.key, '다시 오시오.'); return; }
  addRep(f.id, 8); Fr().fame += 6; F()['clan_' + f.id] = true;
  if (LOOT[f.id]) await G.life.lootPick(f.who, LOOT[f.id]); else ctx.silver(100);
}
export async function facTalk(f) {
  const fr = Fr(), mine = fr.fac === f.id, opts = [];
  if (mine) {
    const head = fr.rank === 4;
    opts.push(['임무를 받는다', () => openBoard(f.id, `${f.name} 임무`)]);
    if (!S().daily.stipend) opts.push([`봉록을 받는다`, () => stipend(f)]);
    if (canPromote()) opts.push([`${rankName(f, fr.rank + 1)} 시험을 본다`, () => promote(f)]);
    if (head) opts.push(['장문인 명령', () => order(f.id)]);
    opts.push([`${josa(f.name, '을/를')} 떠난다`, () => leave(f)]);
  } else {
    if (G.jh.hostile(f.id)) { await say(f.key, '네가 여기까지 걸어 들어온 건 칭찬해 주지.'); const won = await ctx.duel({ foes: ['clan_' + f.id], arena: G.field.m.arena, bgm: 'boss', title: `${f.name} · ${f.who}`, yieldAt: .2, optional: true, noLoot: true }); if (won) { const c = await choice(`${f.who}이(가) 쓰러졌다. 칼을 어떻게 할까?`, ['거둔다', '목을 벤다']); if (c === 0) { await say(f.key, '오늘 일은 기억하겠다.'); G.jh.addRep(f.id, 20, false); } else { await narr(`${f.name}의 어른이 내 칼에 죽었다. 강호가 이 일을 오래 말할 것이다.`); Fr().dead[f.id] = 1; Fr().infamy += 20; G.jh.news(`${S().name}, ${f.name}의 ${f.who}을(를) 베다.`); G.jh.addRep(f.id, -40); Fr().power[f.id] = 20; G.field.refresh(); } } return; }
    if (!S().daily['duel_' + f.id]) opts.push(['비무를 청한다', () => sparClan(f)]);
    if (!fr.fac) opts.push(['입문을 청한다', () => join(f)]);
    opts.push(['이곳에 대해 묻는다', async () => { await narr(f.desc); }]);
  }
  opts.push(['그만둔다', async () => { }]);
  if (f.hi && !F()['hi_' + f.id]) { F()['hi_' + f.id] = 1; await say(f.key, f.hi); }
  const lab = mine ? `${f.name} · ${rankName(f, fr.rank)} · 공적 ${fr.merit}${fr.rank < 4 ? `/${RANK_MERIT[fr.rank + 1]} (레벨 ${RANK_LV[fr.rank + 1]})` : ''}` : `${f.name} · 우호 ${repOf(f.id)}`;
  const c = await choice(lab, opts.map(o => o[0])); await opts[c][1]();
}

// ── 세력 다툼 ──
export const warOf = id => Fr().wars.find(w => w.a === id || w.b === id);
function warScore(id, n) { const w = warOf(id); if (w) { w.score += (w.a === id ? n : -n); } }
const nameOf = id => fac(id)?.name || myName();
function startWar(a, b) { Fr().wars.push({ a, b, days: 3 + Math.floor(rnd(0, 4)), score: 0 }); addNews(`${josa(nameOf(a), '이/가')} ${nameOf(b)}에 칼을 겨누었다.`); }
const myName = () => Fr().sect?.name || '내 문파';
function endWar(w) {
  const fr = Fr(), pa = (fr.power[w.a] || 60) + w.score * 10 + rnd(-20, 20), pb = (fr.power[w.b] || 60) - w.score * 10 + rnd(-20, 20), win = pa >= pb ? w.a : w.b, lose = win === w.a ? w.b : w.a;
  fr.power[win] = (fr.power[win] || 60) + 12; fr.power[lose] = Math.max(20, (fr.power[lose] || 60) - 12);
  addNews(`${josa(nameOf(win), '이/가')} ${josa(nameOf(lose), '과/와')}의 싸움에서 이겼다.`);
  const me = fr.fac === 'my' ? 'my' : fr.fac;
  if (me === win) { const v = 200 + fr.rank * 100; S().silver += v; fr.merit += 60; toast(`우리 쪽이 이겼다. 은자 ${v}냥`, 4); }
  if (me === lose) toast('우리 쪽이 졌다.', 4);
}
const NEWS = [
  a => `${a}의 제자가 구화성 저잣거리에서 시비 끝에 칼을 뽑았다.`, a => `${a}에서 큰 잔치를 열었다는 소문이다.`, a => `${a} 사람들이 약초를 사들이고 있다. 무슨 일이 있는 모양이다.`,
  a => `${a}의 어른이 앓아누웠다는 말이 돈다.`, a => `${a}가 젊은 제자를 새로 받는다고 한다.`,
];
function worldTick() {
  const fr = Fr(), L = FACS;
  if (rnd(0, 1) < .3) addNews(pick(NEWS)(pick(L).name));
  if (fr.wars.length < 2 && rnd(0, 1) < .14) {
    const a = pick(L), ops = L.filter(x => x !== a && x.align !== a.align && !warOf(x.id)); if (ops.length && !warOf(a.id)) { const b = pick(ops); startWar(a.id, b.id); }
  }
  for (const w of fr.wars) { w.days--; w.score += rnd(-.6, .6); }
  fr.wars.filter(w => w.days <= 0).forEach(endWar); fr.wars = fr.wars.filter(w => w.days > 0);
}
async function order(fid) {
  const fr = Fr(), w = warOf(fid), opts = [];
  if (!w) { const L = FACS.filter(x => x.id !== fid && !warOf(x.id)).sort((a, b) => repOf(a.id) - repOf(b.id)).slice(0, 4); L.forEach(x => opts.push([`${x.name}에 전쟁을 선포한다`, async () => { startWar(fid, x.id); addRep(x.id, -30); toast(`${x.name}과 전쟁을 시작했다`, 3); }])); }
  else { const o = w.a === fid ? w.b : w.a; opts.push([`${fac(o)?.name || myName()}에 화친을 청한다`, async () => { if (S().silver < 500) { await say(null, '화친금 은자 500냥이 모자란다.'); return; } S().silver -= 500; fr.wars = fr.wars.filter(x => x !== w); addNews(`${josa(nameOf(fid), '이/가')} 화친을 맺었다.`); }]); }
  opts.push(['그만둔다', async () => { }]);
  const c = await choice('어떤 명을 내릴까?', opts.map(o => o[0])); await opts[c][1]();
}

// ── 하루 ──
function daily() { const fr = Fr(); if (!fr) return; fr.clock = 0; F().night = false; fr.lastP = null; showTime(); worldTick(); if (G.saga) G.saga.daily(); if (fr.rep) for (const k in fr.board) if (!String(fr.board[k].day).startsWith(S().day + ':')) delete fr.board[k]; if (G.sect) G.sect.daily(); if (G.evil) G.evil.daily(); }
export const dayLen = () => S().dayLen || 2700; // 게임 하루의 길이(초). 메뉴 설정에서 바꾼다
const PERIOD = [[.25, '아침'], [.55, '낮'], [.75, '저녁'], [1.01, '밤']];
const period = () => { const q = (Fr()?.clock || 0) / dayLen(); return PERIOD.find(p => q < p[0])[1]; };
function showTime() { const e = document.querySelector('#dayl'); if (e) e.textContent = `${S().day}일째 ${period()}`; }
function tick(dt) { const fr = Fr(); if (!fr || G.field.busy) return; fr.clock += dt; if (fr.clock >= dayLen()) { nextDay(); toast(`${S().day}일째 아침이 되었다`, 2.4); return; } const p = period(), nt = p === '밤'; if (p !== fr.lastP) { fr.lastP = p; showTime(); } if (nt !== !!F().night) { F().night = nt; toast(nt ? '해가 졌다' : '날이 밝았다', 2); } }

// ── 사람들 ──
async function gwakTalk() {
  const c = await choice('곽 아주머니가 국자를 들고 쳐다본다.', ['하룻밤 묵는다 (은자 5냥)', '국수를 먹는다 (은자 3냥)', '요즘 어떠시냐고 묻는다', '그만둔다']);
  if (c === 0) { if (S().silver < 5) { await say('gwak', '외상은 안 된다, 이놈아.', 'a'); return; } S().silver -= 5; await G.life.sleepNow(); }
  if (c === 1) { if (S().silver < 3) { await say('gwak', '돈 벌어서 와.', 'h'); return; } S().silver -= 3; S().potion = Math.max(S().potion, S().potionMax); await say('gwak', '먹어. 국물까지 다 먹고.', 'h'); }
  if (c === 2) await say('gwak', Fr().infamy >= 40 ? '네 소문이 여기까지 온다. 내 국자 어디 뒀더라.' : Fr().fac ? '문파 밥은 먹을 만하냐? 살 빠졌다.' : '아직도 떠돌아? 밥은 먹고 다니냐.');
}
async function roninBoard() { await openBoard(null, '일거리'); }
const HIDE = ['bruiser', 'go', 'disc', 'gwak2'];
const NO_SPOT = ['살펴보기', '우물 뚜껑', '구석방 탁자', '석상', '무너진 부엌', '쓰러진 돌문', '돌계단', '칼자국'];
export const jobNpcs = id => Fr().jobs.filter(j => j.map === id).map(j => ({ id: 'q' + j.id, spr: j.spr || SPR[j.type] || 'Villager', x: j.x, y: j.y, dir: 0, mark: () => true, hint: j.hint || HINT[j.type] || j.title, talk: () => runJob(j) }));
function npcsFree(id, L) {
  let out = L.filter(n => !HIDE.includes(n.id) && !FACS.some(f => f.key === n.id && f.at[0] !== id));
  out.forEach(n => { const f = FACS.find(x => x.key === n.id && x.at[0] === id); if (f) { n.talk = () => facTalk(f); n.mark = () => Fr().fac === f.id && canPromote(); } });
  out.forEach(n => { if (n.id === 'beggar') { n.talk = roninBoard; n.mark = null; n.hint = '일거리 묻기'; } });
  if (id === 'inn') out.push({ id: 'gwak', spr: 'OldWoman', x: 4, y: 4.6, dir: 0, hint: '곽 아주머니', talk: gwakTalk });
  if (id === 'ninehall' || id === 'fiveclans') out.push({ id: 'hall_clerk', spr: 'Villager', x: 22, y: 10.5, dir: 0, hint: '회관지기', talk: async () => { await say(null, '어른들은 다들 본산으로 돌아가셨습니다. 뵈려면 본산까지 가셔야 합니다.'); } });
  for (const f of FACS) if (f.at[0] === id && !out.some(n => n.id === f.key) && !G.jh.fallen(f.id) && !Fr().dead?.[f.id]) out.push({ id: f.key, spr: f.spr, x: f.at[1], y: f.at[2], dir: 0, hint: f.name, mark: () => Fr().fac === f.id && canPromote(), talk: () => facTalk(f) });
  out.push(...jobNpcs(id));
  if (G.sect) out = G.sect.npcs(id, out);
  if (G.evil) out = G.evil.npcs(id, out);
  if (G.saga) out = G.saga.npcs(id, out);
  return out;
}
export function spotsFree(id, sp) { let out = sp.filter(s => !NO_SPOT.includes(s.hint)); if (G.evil) out = G.evil.spots(id, out); return out; }
export function trigsFree(id, tr) { return G.evil ? G.evil.trigs(id, tr) : tr; }

// 메뉴의 강호 탭
export function tabFree(B) {
  const fr = Fr(), f = curFac(), s = fr.sect;
  const me = fr.fac === 'my' ? `${esc(s.name)} 장문인` : f ? `${f.name} ${rankName(f, fr.rank)} · 공적 ${fr.merit}` : '무소속 낭인';
  const row = (t, v) => `<div class="stat"><b>${t}</b><span>${v}</span></div>`;
  const jobs = fr.jobs.map((j, i) => `<div class="note" style="margin-bottom:6px;padding:7px 10px"><b style="font-weight:400">${esc(j.title)}</b> <small class="hint">${j.type === 'gather' ? `${DB[j.item].name} ${j.qty}개 납품` : j.place || ''}</small><button class="btn sm" data-drop="${i}" style="float:right">포기</button><div class="hint">${esc(j.desc)}</div></div>`).join('') || '<p class="hint">받은 임무가 없다.</p>';
  const facs = [...FACS].sort((a, b) => (fr.power[b.id] || 0) - (fr.power[a.id] || 0)).map(x => `<tr><td>${x.name}</td><td>${{ jeong: '정', sa: '사', ma: '마' }[x.align]}</td><td>${Math.round(fr.power[x.id] || 0)}</td><td>${repOf(x.id)}</td></tr>`).join('');
  const wars = fr.wars.map(w => `<div class="hint">${fac(w.a)?.name || myName()} ↔ ${fac(w.b)?.name || myName()} (${w.days}일째 남음)</div>`).join('') || '<div class="hint">지금은 큰 싸움이 없다.</div>';
  B.innerHTML = `<div class="two"><div><h2>내 처지</h2>${row('소속', me)}${row('명성', fr.fame)}${row('악명', fr.infamy)}${row('현상금', `은자 ${fr.infamy * 12}냥`)}${row('끝낸 임무', fr.done)}<h2 style="margin-top:12px">받은 임무</h2>${jobs}<h2 style="margin-top:12px">전쟁</h2>${wars}</div><div><h2>세력</h2><table class="hint" style="width:100%;border-collapse:collapse"><tr><td>이름</td><td>길</td><td>세력</td><td>우호</td></tr>${facs}</table><h2 style="margin-top:12px">강호 소식</h2>${fr.news.slice(0, 10).map(n => `<div class="hint">${esc(n)}</div>`).join('') || '<div class="hint">아직 들려오는 소식이 없다.</div>'}</div></div>`;
  B.querySelectorAll('[data-drop]').forEach(b => b.onclick = () => { const j = fr.jobs[+b.dataset.drop]; fr.jobs.splice(+b.dataset.drop, 1); if (j.fac) addRep(j.fac, -2); syncGoal(); G.field.refresh(); tabFree(B); });
}
const duel0 = ctx.duel;
ctx.duel = cfg => duel0(S()?.mode === 'free' && G.sect ? G.sect.withFollow(cfg) : cfg);
G.freeBoard = () => openBoard('my', '일거리');
G.freeBoard0 = roninBoard;
G.free = { fac, start: startFree, npcs: npcsFree, spots: spotsFree, trigs: trigsFree, daily, tick, tab: tabFree, order, addRep, addNews, myName, foeFor, group, repOf, startWar, warOf, runJob, makeJob, boardFor, promote, join, facTalk, foes: FOES, jobNpcs, period, dayLen, rankOf: () => Fr().rank };
G.free.worldTick = worldTick;
G.free.leaveForce = id => { const fr = Fr(); fr.left[id] = 1; fr.fac = null; fr.rank = 0; fr.merit = 0; fr.head = false; S().title = '파문당한 낭인'; addRep(id, -50); fr.jobs = fr.jobs.filter(j => j.fac !== id); syncGoal(); };
