// 내 문파: 터를 잡고 건물을 짓고 제자를 받는다
import { G, Sound, toast, josa, el, esc, rnd, pick, fadeTo } from './core.js';
import { ctx, say, narr, choice } from './ctx.js';
import { WHO } from './dialog.js';
import { FOES } from './foes.js';
import { MAPS } from './maps.js';
import { give } from './state.js';
import { panel } from './life.js';
import { SKILLS } from './data.js';
import { SURNAME, GIVEN } from './freedata.js';

const S = () => G.S, Fr = () => G.S.fr, Se = () => G.S.fr.sect;
Object.assign(WHO, { sect_d: { name: '제자', face: 'GreenNinja', art: 'disc' }, guest: { name: '입문 희망자', face: 'Villager', art: 'town' }, challenger: { name: '떠돌이 고수', face: 'Samurai', art: 'wander' } });
export const SITES = [
  { id: 'valley', name: '청풍골 강변', map: 'valley', back: [35, 15.5], desc: '물과 풀이 넉넉해 제자 유지비가 적다.', upkeep: .75 },
  { id: 'pass', name: '창운산 기슭', map: 'pass', back: [20, 12], desc: '기운이 맑아 제자가 빨리 자란다.', grow: 1.35 },
  { id: 'guhwa', name: '구화성 외곽', map: 'guhwa', back: [24.5, 29], desc: '사람이 많아 입문 희망자가 잦고 수입이 좋다.', income: 1.4 },
];
// 건물. 등급마다 값이 오른다
export const BLD = {
  lodge: { name: '제자 숙소', cost: 700, max: 3, desc: '제자 정원 +5', stamps: [['lodge', 7, 8], ['lodge', 29, 8], ['wood_o', 7, 20]] },
  yard: { name: '연무장', cost: 600, max: 2, desc: '제자가 더 빨리 자란다', stamps: [['f_dummy', 15, 18], ['f_dummy', 19, 18], ['f_dummy', 23, 18], ['f_dummy', 17, 21], ['f_dummy', 21, 21]] },
  kitchen: { name: '식당', cost: 400, max: 2, desc: '유지비 -20%', stamps: [['hut_b', 30, 20]] },
  farm: { name: '전답', cost: 500, max: 3, desc: '매일 은자 +50', stamps: [['straw', 2, 24], ['mud', 6, 25], ['straw', 33, 25]] },
  clinic: { name: '약방', cost: 800, max: 1, desc: '금창약 최대치 +2', stamps: [['hut_o', 2, 14]] },
  forge: { name: '대장간', cost: 900, max: 1, desc: '매일 철광 1개', stamps: [['hut_o2', 33, 14]] },
  library: { name: '장경각', cost: 1200, max: 1, desc: '문파 절기를 정할 수 있고 제자 무공이 오른다', stamps: [['wood_b', 13, 9]] },
  shrine: { name: '사당', cost: 600, max: 1, desc: '매일 명성 +1', stamps: [['statue', 25, 10]] },
  tower: { name: '망루', cost: 1000, max: 2, desc: '습격을 막아 낸다', stamps: [['banner3', 16, 26], ['banner3', 23, 26]] },
};
export const blv = id => (Se()?.b || {})[id] || 0;
const cap = () => 4 + blv('lodge') * 5;
export function grade() { const s = Se(), v = Fr().fame + s.d.length * 6 + Object.values(s.b).reduce((a, b) => a + b, 0) * 10; return v < 60 ? '무명 문파' : v < 160 ? '소문파' : v < 320 ? '중견 문파' : v < 600 ? '명문' : '천하 명문'; }
const site = () => SITES.find(x => x.id === Se().site);
const dName = () => pick(SURNAME) + pick(GIVEN);
const mkD = () => ({ n: dName(), lv: Math.max(1, Math.round(S().lv * rnd(.3, .6))), tal: 1 + Math.floor(rnd(0, 5)), xp: 0, job: 'train', spr: pick(['GreenNinja', 'BlueNinja', 'Villager', 'Villager2', 'Villager3', 'Boy', 'Samurai']) });
const TAL = ['둔재', '평범함', '쓸 만함', '뛰어남', '기재'];

export function buildSect() {
  const m = MAPS.mysect, s = Se(); if (!m.objs0) { m.objs0 = m.objs.slice(); m.solids0 = m.solids.slice(); }
  m.name = s ? s.name : '내 문파'; m.stamps = []; m.solids = m.solids0.slice();
  if (s) for (const id in BLD) BLD[id].stamps.slice(0, id === 'yard' ? blv(id) * 2 + 1 : id === 'farm' || id === 'lodge' || id === 'tower' ? blv(id) * (id === 'tower' ? 1 : 1) : blv(id) ? 1 : 0).forEach(([n, x, y]) => { if (blv(id)) m.put(n, x, y); });
  m.objs = [...m.objs0, ...m.stamps.filter(x => !x.flat)]; m._whole = null;
  if (s) { const b = site(), q = m.portals[0]; if (q) { q.to = b.map; q.tx = b.back[0]; q.ty = b.back[1]; } }
}
export async function foundSect() {
  const fr = Fr(), s = S();
  if (fr.sect) { await say('realtor', '문파 터는 이미 있으시잖소.'); return; }
  if (fr.fac) { await say('realtor', '다른 문파에 몸담은 분이 터를 사면 그쪽에서 가만있겠소? 나오고 다시 오시오.'); return; }
  if (s.lv < 10 || s.silver < 2000) { await say('realtor', '문파 터는 은자 이천 냥이오. 그리고 레벨 10은 되어야 제자들이 말을 듣지. 땅이 어디 도망가겠소.'); return; }
  await say('realtor', '좋은 터가 세 군데 있소.');
  const c = await choice('어디에 문을 세울까?', [...SITES.map(x => `${x.name}: ${x.desc}`), '그만둔다']); if (c === SITES.length) return;
  const name = ((await ctx.ask('문파 이름', '세울 문파의 이름을 적으세요.', '달맞이문')) || '달맞이문').trim().slice(0, 8) || '달맞이문';
  const al = await choice('어떤 길을 걷는 문파로 내걸까?', ['정도를 걷는다', '사도를 걷는다', '어느 쪽에도 안 속한다']);
  s.silver -= 2000; fr.fac = 'my'; fr.rank = 4; fr.sect = { name, site: SITES[c].id, align: ['jeong', 'sa', 'free'][al], b: {}, d: [mkD(), mkD()], guests: [], ev: null, tech: [], day: s.day, log: [] };
  s.title = `${name} 장문인`; buildSect(); G.free.addNews(`${s.name}, ${josa(name, '을/를')} 세우다.`);
  if (al === 0) G.free.addRep('shaolin', 10); if (al === 1) G.free.addRep('nokrim', 10);
  await fadeTo(1); G.field.load('mysect', 20, 24, 1); await fadeTo(0);
  await narr(`터를 다지고 현판을 걸었다. 건물이라고는 본전 하나, 제자라고는 소문 듣고 찾아온 사람 둘이 전부였다.`);
  await say('sect_d', '장문인, 저희는 뭐부터 하면 됩니까?');
  await say('me', '바닥부터 닦아요.');
  await say('sect_d', '네?');
  await narr('집사가 장부를 들고 왔다. 건물을 짓고 제자를 받는 일은 집사에게 말하면 되었다.');
  ctx.note(`${josa(name, '을/를')} 세웠다.`);
}
// 집사
export async function openSect() {
  await panel('문파 살림', (B, redraw) => {
    const s = Se(), fr = Fr(), inc = income();
    B.innerHTML = `<div class="two"><div><h2>${esc(s.name)} <small class="hint">${grade()}</small></h2><div class="stat"><b>제자</b><span>${s.d.length}/${cap()}</span></div><div class="stat"><b>명성</b><span>${fr.fame}</span></div><div class="stat"><b>하루 수지</b><span>은자 ${inc >= 0 ? '+' : ''}${inc}</span></div><div class="stat"><b>가진 은자</b><span>${S().silver}</span></div><h2 style="margin-top:10px">건물</h2><div class="list" id="bl"></div></div><div><h2>제자</h2><div class="list" id="dl"></div>${s.guests.length ? '<h2 style="margin-top:10px">입문 희망자</h2><div class="list" id="gl"></div>' : ''}${blv('library') ? '<h2 style="margin-top:10px">문파 절기</h2><div class="list" id="tl"></div>' : ''}</div></div>`;
    const bl = B.querySelector('#bl');
    for (const id in BLD) { const k = BLD[id], lv = blv(id), price = k.cost * (lv + 1), b = el('button', 'item', `${k.name} ${lv ? lv + '단계' : ''}<span class="tag">${lv >= k.max ? '최고' : `은자 ${price}`}</span><small>${k.desc}</small>`); b.disabled = lv >= k.max || S().silver < price; b.onclick = () => { S().silver -= price; s.b[id] = lv + 1; if (id === 'clinic') S().potionMax += 2; buildSect(); Sound.sfx('ok3'); redraw(); }; bl.appendChild(b); }
    const dl = B.querySelector('#dl');
    const JOB = { train: '수련', follow: '동행', q_herb: '약초 채집', q_guard: '호위 일', q_fame: '이름 알리기' };
    s.d.forEach((d, i) => { const b = el('button', 'item', `${esc(d.n)} <small class="hint">${TAL[d.tal - 1]} · 레벨 ${d.lv}</small><span class="tag">${JOB[d.job]}${d.days ? ` ${d.days}일` : ''}</span>`); b.disabled = !!d.days; b.onclick = () => { const k = Object.keys(JOB), nx = k[(k.indexOf(d.job) + 1) % k.length]; if (nx === 'follow' && s.d.filter(x => x.job === 'follow').length >= 2) d.job = 'q_herb'; else d.job = nx; if (d.job.startsWith('q_')) d.days = 3; Sound.sfx('tick'); redraw(); }; dl.appendChild(b); });
    if (!s.d.length) dl.innerHTML = '<p class="hint">제자가 없다.</p>';
    const gl = B.querySelector('#gl');
    if (gl) s.guests.forEach((g, i) => { const b = el('button', 'item', `${esc(g.n)} <small class="hint">${TAL[g.tal - 1]} · 레벨 ${g.lv}</small><span class="tag">받는다</span>`); b.disabled = s.d.length >= cap(); b.onclick = () => { s.d.push(g); s.guests.splice(i, 1); G.field.refresh(); redraw(); }; gl.appendChild(b); });
    const tl = B.querySelector('#tl');
    if (tl) S().skills.filter(k => SKILLS[k] && !SKILLS[k].ult).slice(0, 12).forEach(k => { const on = s.tech.includes(k), b = el('button', 'btn sm' + (on ? ' on' : ''), SKILLS[k].name); b.onclick = () => { if (on) s.tech = s.tech.filter(x => x !== k); else if (s.tech.length < 3) s.tech.push(k); redraw(); }; tl.appendChild(b); });
  }, 1040);
  G.field.refresh();
}
function income() { const s = Se(), b = site(), up = s.d.length * 8 * (b.upkeep || 1) * (1 - blv('kitchen') * .2); return Math.round(Math.max(1, G.free.dayLen() / 600) * (20 + blv('farm') * 50 + s.d.filter(d => d.job === 'q_guard').length * 10) * (b.income || 1) - up); }
function daily() {
  const s = Se(); if (!s) return; const fr = Fr(), b = site(), inc = income();
  S().silver = Math.max(0, S().silver + inc); if (S().silver === 0 && inc < 0 && s.d.length) { const d = s.d.splice(Math.floor(rnd(0, s.d.length)), 1)[0]; addLog(`${josa(d.n, '이/가')} 밥이 없다며 문을 나갔다.`); }
  if (blv('forge')) give('ore_iron', 1); if (blv('shrine')) fr.fame += 1;
  for (const d of s.d) {
    if (d.job === 'train') { d.xp += d.tal * (b.grow || 1) * (1 + blv('yard') * .5) * (1 + (s.tech.length ? .2 : 0)); while (d.xp >= d.lv * 4 + 6) { d.xp -= d.lv * 4 + 6; d.lv++; } }
    if (d.days) { d.days--; if (!d.days) { const ok = rnd(0, 1) < .55 + d.lv * .01 + d.tal * .05; if (d.job === 'q_herb') { give('herb', ok ? 3 : 1); addLog(`${josa(d.n, '이/가')} 약초를 캐 왔다.`); } if (d.job === 'q_guard') { const v = ok ? 80 + d.lv * 10 : 20; S().silver += v; addLog(ok ? `${josa(d.n, '이/가')} 호위 일을 마치고 은자 ${v}냥을 벌어 왔다.` : `${josa(d.n, '이/가')} 호위 길에서 다쳐 돌아왔다.`); } if (d.job === 'q_fame') { fr.fame += ok ? 6 : 1; addLog(ok ? `${josa(d.n, '이/가')} 비무에서 이겨 문파 이름을 알렸다.` : `${josa(d.n, '이/가')} 비무에서 지고 돌아왔다.`); } d.job = 'train'; } }
  }
  if (s.guests.length < 3 && s.d.length < cap() && rnd(0, 1) < (.25 + fr.fame * .002) * (b.income ? 1.5 : 1)) s.guests.push(mkD());
  if (!s.ev && rnd(0, 1) < .22) s.ev = pick(Object.keys(EV));
}
const addLog = t => { G.free.addNews(t); };
// 문파 일
const EV = {
  async challenger() {
    await say('challenger', '문패 좀 내려 주시오. 이 근방에서 칼 쓰는 곳은 다 들렀는데 여기만 남았소.');
    const c = await choice('떠돌이 고수가 현판을 올려다본다.', ['직접 상대한다', '은자 200냥을 쥐여 보낸다']);
    if (c === 1) { S().silver = Math.max(0, S().silver - 200); await narr('고수는 돈을 세어 보더니 문패를 칭찬하고 갔다. 제자들이 나를 쳐다보지 않았다.'); return; }
    if (await ctx.duel({ foes: [G.free.foeFor('rogue', S().lv + 1, true)], arena: 'court', bgm: 'boss', title: '도장 깨기', optional: true, noLoot: true, noIntro: true })) { Fr().fame += 10; await narr('제자들이 현판 밑에서 소리를 질렀다. 그날 저녁 입문을 청하는 사람이 둘 늘었다.'); }
    else { Fr().fame = Math.max(0, Fr().fame - 8); await narr('고수는 문패를 떼어 가지는 않았다. 그게 더 분했다.'); }
  },
  async quarrel() {
    if (Se().d.length < 2) { await narr('제자 하나가 혼자서 목검을 휘두르고 있었다. 오늘은 조용한 날이었다.'); return; }
    const a = pick(Se().d), b = pick(Se().d.filter(x => x !== a));
    await narr(`${josa(a.n, '과/와')} ${josa(b.n, '이/가')} 마당에서 멱살을 잡고 있었다. 누가 먼저 밥을 푸느냐로 시작한 싸움이라고 했다.`);
    const c = await choice('제자들이 나를 본다.', ['둘 다 물 백 동이를 시킨다', '칼로 정하라고 대련을 시킨다']);
    if (c === 0) await narr('둘은 하루 종일 물을 나르다 저녁에 나란히 쓰러졌다. 다음 날부터 밥은 같이 먹었다.');
    else { a.lv++; await narr(`${josa(a.n, '이/가')} 이겼다. ${josa(b.n, '은/는')} 그날부터 새벽에 혼자 나와 칼을 휘둘렀다.`); b.xp += 10; }
  },
  async envoy() {
    await narr('이웃 문파에서 사람이 왔다. 앞으로 잘 지내자며 예물을 바라는 눈치였다.');
    const c = await choice('사절이 찻잔만 만지작거린다.', ['은자 300냥을 내준다', '차만 대접해 보낸다']);
    if (c === 0) { S().silver = Math.max(0, S().silver - 300); Fr().fame += 8; await narr('사절은 웃으며 돌아갔다. 얼마 뒤 강호에 우리 문파 이름이 좋게 돌았다.'); }
    else { await narr('사절은 차를 다 비우고 일어났다. 인사는 아주 공손했다.'); Fr().fame = Math.max(0, Fr().fame - 3); }
  },
  async refugees() {
    await narr('전쟁을 피해 온 사람들이 산문 앞에 앉아 있었다. 밥을 달라는 말도 못 하고 앉아만 있었다.');
    const c = await choice('집사가 쌀독을 들여다본다.', ['은자 150냥어치 죽을 쑨다', '문을 닫는다']);
    if (c === 0) { S().silver = Math.max(0, S().silver - 150); Fr().fame += 8; if (Se().guests.length < 3) Se().guests.push(mkD()); await narr('사흘 동안 죽을 쑤었다. 떠날 때 젊은 사람 하나가 남아서 빗자루를 들었다.'); }
    else await narr('밤새 문밖에서 기침 소리가 났다. 아침에는 아무도 없었다.');
  },
  async homesick() {
    if (!Se().d.length) return; const d = pick(Se().d);
    await say('sect_d', `장문인, ${d.n}입니다. 고향 어머니가 앓는다고 기별이 왔습니다.`);
    const c = await choice('제자가 무릎을 꿇고 있다.', ['노자를 주어 보낸다', '수련 중이니 남으라고 한다']);
    if (c === 0) { S().silver = Math.max(0, S().silver - 50); Se().d = Se().d.filter(x => x !== d); Fr().fame += 3; await narr('한 달 뒤 곶감 한 접이 인편으로 왔다. 어머니가 일어나셨다는 말과 함께.'); }
    else { await narr('제자는 고개를 숙이고 돌아갔다. 그날부터 말수가 줄었다.'); d.tal = Math.max(1, d.tal - 1); }
  },
  async raid() {
    if (blv('tower')) { await narr('밤에 산적들이 담을 넘으려다 망루에 들켰다. 제자들이 횃불을 들고 나가자 그대로 달아났다.'); Fr().fame += 3; return; }
    await narr('밤중에 창고 쪽에서 소리가 났다. 복면 쓴 놈들이 쌀가마를 끌어내고 있었다.');
    if (await ctx.duel({ foes: G.free.group('bandit', S().lv, 3), arena: 'court', bgm: 'fight', title: '문파 습격', optional: true, noIntro: true })) { Fr().fame += 4; await narr('날이 밝자 제자들이 쌀가마를 다시 쌓았다.'); }
    else { S().silver = Math.max(0, Math.round(S().silver * .8)); await narr('창고가 털렸다. 은자 궤짝도 함께 사라졌다.'); }
  },
  async scroll() {
    await narr('제자 하나가 뒷산에서 낡은 책을 주워 왔다. 절반은 벌레가 먹었는데 나머지 절반이 쓸 만했다.');
    S().tp = (S().tp || 0) + 1; toast('수련 점수 1점을 얻었다', 3);
  },
  async gwak() {
    await say('gwak', '문파를 차렸다길래 와 봤더니 바닥 꼴이 이게 뭐야.', 'a');
    await say('me', '아주머니.');
    await say('gwak', '장문인이면 뭐 해. 제자들 걸레부터 쥐여. 허리 세우고 왼발로 밀고.', 'a');
    await narr('그날 제자들은 곽 아주머니 국자 밑에서 마당을 네 번 닦았다. 그러고 나니 다들 걸음이 조금 달라져 있었다.');
    Se().d.forEach(d => { d.lv++; });
    await say('gwak', '국수는 내가 끓일 테니 먹고 또 닦아. 밥값은 받는다.', 'h');
  },
};
async function runEv() { const k = Se().ev; Se().ev = null; if (EV[k]) await EV[k](); }
function withFollow(cfg) {
  const s = Se(); if (!s || cfg.noFollow) return cfg; const L = s.d.filter(d => d.job === 'follow').slice(0, 2); if (!L.length) return cfg;
  const ids = L.map((d, i) => { const id = 'd_ally' + i, lv = d.lv; FOES[id] = { name: d.n, spr: 'chars/' + d.spr, hp: 60 + lv * 34, atk: 6 + lv * 1.3, def: 1 + lv * .3, spd: 58, exp: 0, silver: 0, pause: 1.2, moves: ['slash', 'lunge', 'double'].concat(s.tech.filter(k => /^(cloud_flash|swallow_qi|iron_fist|one_point|blood_fan)$/.test(k))), wpn: 'Sword' }; return id; });
  return { ...cfg, allies: [...(cfg.allies || []), ...ids] };
}
function npcs(id, out) {
  out.forEach(n => { if (n.id === 'realtor') { const base = n.talk; n.hint = '복덕방'; n.talk = async () => { const c = await choice('복덕방 영감이 안경을 닦는다.', ['집을 알아본다', '문파 터를 알아본다', '그만둔다']); if (c === 0) await base(); if (c === 1) await foundSect(); }; } });
  if (id === 'mysect' && Se()) {
    const s = Se();
    out.push({ id: 'steward', spr: 'OldMan', x: 20, y: 11, dir: 0, hint: '집사', mark: () => !!s.ev || s.guests.length > 0, talk: async () => { if (s.ev) { await runEv(); return; } const c = await choice(`${s.name} · ${grade()}`, ['문파 살림을 본다', '일거리를 찾아본다', '장문인 명령', '그만둔다']); if (c === 0) await openSect(); if (c === 1) await G.freeBoard(); if (c === 2) await G.free.order('my'); } });
    s.d.slice(0, 8).forEach((d, i) => out.push({ id: 'dd' + i, spr: d.spr, x: 12 + i * 2.4, y: 15 + (i % 2) * 8, dir: 0, talk: async () => { await say('sect_d', pick(['장문인, 오늘도 수련했습니다.', '밥이 맛있습니다.', '왼발이 잘 안 나갑니다.', '언제 저도 칼을 쥐어 봅니까?', '어제 꿈에 장문인이 나왔습니다. 무서웠습니다.'])); } }));
  }
  return out;
}
G.sect = { daily, npcs, withFollow, build: buildSect, found: foundSect, open: openSect, ev: EV, runEv, blv, grade, mkD };
