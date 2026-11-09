// 악행과 악명: 약탈, 보호세, 마을 습격. 대가는 뒤따라온다. 아이는 대상이 아니다
import { G, Sound, toast, rnd, pick, josa } from './core.js';
import { ctx, say, narr, choice } from './ctx.js';
import { WHO } from './dialog.js';
import { FOES } from './foes.js';
import { MAPS } from './maps.js';

const S = () => G.S, Fr = () => G.S.fr, F = () => G.S.flags;
Object.assign(WHO, { merchant: { name: '상단 행수', face: 'Noble' } });
FOES.gwak_foe = { name: '곽 아주머니', spr: 'chars/OldWoman', hp: 3000, atk: 40, def: 14, spd: 74, exp: 300, silver: 0, pause: .85, moves: ['flurry', 'double', 'heavy', 'quick'], wpn: 'Club', boss: 1, poise: 300, title: '국자를 든' };
export const TOWNS = {
  cheongha: { name: '청하진', size: 3, rooms: ['inn', 'smith', 'clinic', 'shop', 'bokun'], plaza: [18, 20] },
  guhwa: { name: '구화성', size: 5, rooms: ['inn2', 'shop2', 'hall2'], plaza: [24, 24] },
  oasis: { name: '사주성', size: 4, rooms: [], plaza: [22, 18] },
  c_yeongyeong: { name: '연경', size: 6, rooms: [], plaza: [20, 16] }, c_nakyang: { name: '낙양', size: 5, rooms: [], plaza: [20, 16] }, c_changan: { name: '장안', size: 5, rooms: [], plaza: [20, 16] }, c_seongdo: { name: '성도', size: 5, rooms: [], plaza: [20, 16] }, c_guangzhou: { name: '광주', size: 5, rooms: [], plaza: [20, 16] }, c_suzhou: { name: '소주', size: 6, rooms: [], plaza: [20, 16] },
};
const townOf = id => Object.keys(TOWNS).find(k => k === id || TOWNS[k].rooms.includes(id));
const st = k => (Fr().towns[k] = Fr().towns[k] || {});
const ruined = k => !!st(k).ruined;
const tierName = v => v >= 120 ? '혈귀' : v >= 70 ? '마두' : v >= 30 ? '악적' : '';
// 정파 소속이 악행을 하면 규율에 걸린다
async function discipline() {
  const fr = Fr(), f = G.free && fr.fac && fr.fac !== 'my' ? fr.fac : null; if (!f) return;
  const c = FACSget(f); if (!c || c.align !== 'jeong') return;
  fr.warn = (fr.warn || 0) + 1;
  if (fr.warn >= 2) { fr.left[f] = 1; fr.fac = null; fr.rank = 0; fr.merit = 0; fr.warn = 0; S().title = '파문당한 낭인'; G.free.addRep(f, -50); G.free.addNews(`${c.name}, ${josa(S().name, '을/를')} 파문하다.`); await narr(`${c.name}에서 사람이 왔다. 파문장을 내밀고 내 문패를 그 자리에서 쪼갰다.`); }
  else await narr(`${c.name}에서 서찰이 왔다. 한 번만 더 소문이 들리면 문패를 거둔다고 적혀 있었다.`);
}
const FACSget = id => G.free.fac(id);
function infamy(n) { const fr = Fr(), t0 = tierName(fr.infamy); fr.infamy = Math.max(0, fr.infamy + n); const t1 = tierName(fr.infamy); if (t1 && t1 !== t0 && n > 0) { toast(`강호에서 나를 ${t1}라고 부르기 시작했다`, 4); G.free.addNews(`강호 사람들이 ${josa(S().name, '을/를')} ${t1}라 부른다.`); } }
async function plaza(k) {
  const t = TOWNS[k], s = st(k);
  if (s.ruined) {
    const cost = t.size * 800, c = await choice(`${josa(t.name, '은/는')} 폐허다. 돌아온 사람이 몇 없다.`, [`은자 ${cost}냥을 내어 다시 세운다`, '그만둔다']);
    if (c === 0) { if (S().silver < cost) { await say(null, '은자가 모자란다.'); return; } S().silver -= cost; s.ruined = 0; setTint(k); infamy(-20); Fr().fame += 10; await narr('목수와 쌀을 들여보냈다. 누가 돈을 냈는지 아는 사람들은 고맙다는 말을 하지 않았다.'); G.field.refresh(); }
    return;
  }
  const taxed = S().daily['tax_' + k], opts = [...(taxed ? [] : ['보호세를 걷는다']), '마을을 습격한다', '그만둔다'];
  const c = await choice(`${t.name} 광장. 사람들이 오가고 있다.`, opts), o = opts[c];
  if (o === '보호세를 걷는다') return tax(k);
  if (o === '마을을 습격한다') return raid(k);
}
async function tax(k) {
  const t = TOWNS[k], v = t.size * 40 + Math.floor(S().lv * 3);
  S().daily['tax_' + k] = 1; S().silver += v; Sound.sfx('coin'); infamy(3);
  await narr(pick(['장사꾼들이 말없이 돈을 모아 내밀었다.', '가게 주인이 눈을 내리깔고 돈주머니를 내놓았다.', '칼집을 두드리기만 했는데 은자가 나왔다.']));
  toast(`보호세 은자 ${v}냥`, 3); await discipline();
}
async function raid(k) {
  const t = TOWNS[k], lv = S().lv, c = await choice(`${josa(t.name, '을/를')} 칠까? 돌이킬 수 없다.`, ['친다', '그만둔다']); if (c) return;
  if (k === 'cheongha') {
    await say('gwak', '{나}야. 그 칼 어디다 대려고 그러냐.', 'a');
    await say('me', '비키세요.', 'a');
    await say('gwak', '내가 말했지. 못된 짓 하고 다니면 내 국자가 찾아간다고.', 'a');
    const w = await ctx.duel({ foes: ['gwak_foe'], arena: 'village', bgm: 'boss', title: '곽 아주머니', optional: true, noLoot: true, noFollow: true });
    if (!w) { await narr('눈을 뜨니 나루 밖 갈대밭이었다. 머리에 혹이 나 있었고 품에 주먹밥 하나가 들어 있었다.'); infamy(5); await ctx.warp('valley', 35, 15.5, 2); return; }
    await say('gwak', '많이 컸네.', 's');
    await narr('곽 아주머니는 국자를 내려놓고 돌아서서 객잔으로 들어갔다. 그 뒤로 달맞이 객잔 문은 내게 열리지 않았다.');
    F().gwak_shut = true;
  }
  await narr('민병들이 징을 치며 뛰어나왔다. 아이들을 먼저 배에 태워 보내고 온 사람들이었다.');
  if (!await ctx.duel({ foes: [...G.free.group('villager', lv, 3), ...G.free.group('guard', lv, 2)], arena: MAPS[k].arena, bgm: 'fight', title: `${t.name} 습격`, optional: true, noIntro: true })) { infamy(5); await narr('민병들에게 밀려났다. 마을 사람들이 내 얼굴을 봤다.'); return; }
  const v = t.size * 300 + lv * 20; S().silver += v; infamy(20); Sound.sfx('coin');
  const m = await choice('민병이 무너졌다. 남은 사람들이 창고 앞에 몰려 있다.', ['재물만 챙기고 간다', '남김없이 벤다']);
  if (m === 0) await narr('창고를 털고 나왔다. 뒤에서 욕을 하는 사람은 없었다. 다들 내 칼만 보고 있었다.');
  else { infamy(50); S().silver += t.size * 100; G.free.addRep('shaolin', -30); await narr('칼이 멈췄을 때 마을에는 불 타는 소리밖에 없었다. 나루에 빈 배 몇 척이 흔들리고 있었다.'); }
  st(k).ruined = S().day; setTint(k); hurtLove(k, m === 1 ? 60 : 30);
  G.free.addNews(`${josa(t.name, '이/가')} ${S().name}의 손에 잿더미가 되었다.`);
  await discipline(); G.field.refresh();
}
function hurtLove(k, n) { const s = S(); for (const id in s.love) s.love[id] = Math.max(0, s.love[id] - n); if (s.partner) { const id = s.partner; if (s.love[id] < 30) { s.partner = null; toast('연인이 떠났다', 4); } } }
function setTint(k) { const m = MAPS[k]; if (!m) return; if (m._t0 === undefined) m._t0 = m.tint; m.tint = ruined(k) ? 'rgba(30,12,10,.5)' : m._t0; }
async function caravan(map) {
  S().daily['car_' + map] = 1; const lv = S().lv;
  const c = await choice('짐수레 넷이 지나간다. 행수가 칼 찬 사람을 보고 멈칫한다.', ['호위를 자청한다', '통행세를 뜯는다', '턴다', '그냥 보낸다']);
  if (c === 0) { const v = 30 + lv * 6; S().silver += v; Fr().fame += 2; await say('merchant', '고맙소. 이쪽 길이 요즘 흉흉해서.'); toast(`호위 삯 은자 ${v}냥`, 3); }
  if (c === 1) { const v = 20 + lv * 5; S().silver += v; infamy(2); await say('merchant', '이번만이오.'); toast(`은자 ${v}냥`, 3); await discipline(); }
  if (c === 2) {
    if (!await ctx.duel({ foes: G.free.group('guard', lv, 3), arena: MAPS[map].arena, bgm: 'fight', title: '상단 습격', optional: true, noIntro: true })) { infamy(3); return; }
    const v = 120 + lv * 22; S().silver += v; infamy(8); toast(`약탈한 은자 ${v}냥`, 3); await discipline();
  }
  G.field.refresh();
}
async function hunters() {
  const fr = Fr(); fr.hunted = false; const lv = S().lv + 2, bounty = fr.infamy * 12;
  await narr(`현상금 은자 ${bounty}냥. 길 앞뒤로 칼 찬 사람들이 나타났다. 토벌대였다.`);
  if (await ctx.duel({ foes: G.free.group('hunter', lv, 4), arena: G.field.m.arena, bgm: 'boss', title: '토벌대', optional: true, noIntro: true })) { fr.fame += 4; G.free.addRep('nokrim', 3); await narr('토벌대를 물리쳤다. 소문은 더 크게 돌 것이다.'); }
  else { const v = Math.round(S().silver * .4); S().silver -= v; infamy(-6); await narr(`묶여서 끌려갔다가 은자 ${v}냥을 뜯기고 풀려났다.`); await ctx.warp('cheongha', 22.5, 25, 1); }
}
async function atone() {
  const c = await choice('소림 시주함이다. 은자 500냥을 넣으면 악명이 조금 씻긴다.', ['은자 500냥을 넣는다', '그만둔다']); if (c) return;
  if (S().silver < 500) { await say(null, '은자가 모자란다.'); return; }
  S().silver -= 500; infamy(-15); await narr('노승이 아무것도 묻지 않고 향 하나를 내주었다.');
}
const refused = async (n) => { await say(n, '죄송합니다. 나리한테는 팔 게 없습니다.'); };
function npcs(id, out) {
  const fr = Fr(), k = townOf(id); for (const t in TOWNS) setTint(t);
  if (k && ruined(k)) out = out.filter(n => !['town', 'town2', 'kid', 'shopk', 'smith', 'doc', 'yun', 'host', 'wander', 'realtor', 'beggar', 'gwak', 'baekrang'].includes(n.id));
  if (F().gwak_shut) out = out.filter(n => n.id !== 'gwak');
  if (fr.infamy >= 70 && !['sa', 'ma'].includes(G.free.fac(fr.fac)?.align)) out.forEach(n => { if (['shopk', 'smith', 'smith2'].includes(n.id)) { n.talk = () => refused(n.id === 'shopk' ? 'shopk' : 'smith'); n.mark = null; } });
  if (['pass', 'valley', 'bamboo', 'silk'].includes(id) && !S().daily['car_' + id]) out.push({ id: 'car', spr: 'Noble', x: { pass: 20, valley: 30, bamboo: 19, silk: 22 }[id], y: { pass: 12.6, valley: 15.5, bamboo: 22, silk: 13.5 }[id], dir: 2, hint: '상단', talk: () => caravan(id) });
  return out;
}
function spots(id, sp) {
  const t = TOWNS[id]; if (t) sp.push({ x: t.plaza[0], y: t.plaza[1], w: 3, h: 2, hint: '광장', act: () => plaza(id) });
  if (id === 'shaolin') sp.push({ x: 18, y: 21, w: 3, h: 2, hint: '시주함', act: atone });
  return sp;
}
function trigs(id, tr) { if (Fr().hunted && !MAPS[id].room && id !== 'mysect') tr.push({ x: 0, y: 0, w: 99, h: 99, when: () => Fr().hunted, run: hunters }); return tr; }
function daily() { const fr = Fr(); if (fr.infamy >= 30 && rnd(0, 1) < Math.min(.5, fr.infamy / 300)) fr.hunted = true; if (fr.infamy > 0 && rnd(0, 1) < .2) fr.infamy = Math.max(0, fr.infamy - 1); for (const k in TOWNS) { const s = st(k); if (s.ruined && S().day - s.ruined >= 40) { s.ruined = 0; setTint(k); G.free.addNews(`${TOWNS[k].name}에 사람들이 다시 모여들었다.`); } else setTint(k); } }
G.evil = { npcs, spots, trigs, daily, plaza, tax, raid, caravan, hunters, atone, infamy, afterJob() { }, TOWNS, ruined };
