// 노예 시장의 나머지 절반: 싸워 이긴 자를 묶어 끌고 와 팔고, 산 사람을 풀어 주거나 집 하인으로 데려간다
// 묶어 가기는 강호(큰 지도)나 자유 강호에서 떠돌이 적을 이겼을 때만. 팔면 은자를 받고 악명이 오르고 정파 평판이 깎이며, 바른 동료는 싫어한다
import { G, Sound, toast, josa, pick } from './core.js';
import { Story, say, narr, choice } from './ctx.js';
import { FOES } from './foes.js';
import { give } from './state.js';

const S = () => G.S, MAXC = 6, MAXS = 4;
const caps = () => (S().captives = S().captives || []);
const servs = () => (S().servants = S().servants || []);
export const capCount = () => caps().length;

// ── 묶어 가기 ──
async function capture(r) {
  const s = S(); if (!s || !(s.mode === 'free' || G.field.m?.live) || !r.foes?.length) return;
  const room = MAXC - caps().length, list = r.foes.filter(id => FOES[id] && /^q_/.test(id));
  if (!list.length) return;
  if (room <= 0) { toast(`포로는 ${MAXC}명까지만 끌고 다닐 수 있다`, 2.4); return; }
  const c = await choice(`쓰러진 ${josa(FOES[list[0]].name, '이/가')} 신음하고 있다.`, [`묶어서 끌고 간다 (지금 ${caps().length}/${MAXC})`, '그냥 둔다']); if (c) return;
  const got = list.slice(0, room).map(id => ({ name: FOES[id].name.replace(/ 두목$/, ''), spr: FOES[id].spr, lv: s.lv, boss: /_b$/.test(id) }));
  caps().push(...got); Sound.sfx('tick'); toast(`${got.length}명을 묶었다. 노예 시장(광주·장안·소주)에 넘길 수 있다`, 3);
}
const enc0 = Story.encounter.bind(Story);
Story.encounter = async r => { const won = await enc0(r); if (won) await capture(r); return won; };

// ── 노예상에게 넘기기 ──
export async function sellTo(l) {
  const s = S(), L = caps(); if (!L.length) return;
  const val = q => Math.round((20 + q.lv * 5) * (q.boss ? 2 : 1)), sum = L.reduce((a, q) => a + val(q), 0);
  await say(null, '노예상: ' + pick(['어디 봅시다. 이빨 멀쩡하고, 팔다리 붙어 있고. 쓸 만하오.', '산적 놈들이로군. 광산에서 잘 쓰겠소.', '험하게 다뤘구려. 값은 좀 깎겠소. 농담이오, 제값 쳐 드리지.']));
  const c = await choice(`묶어 온 ${L.length}명을 은자 ${sum}냥에 넘길까?`, ['넘긴다', '그만둔다']); if (c) return;
  s.silver += sum; Sound.sfx('coin'); const n = L.length; s.captives = [];
  if (s.rep) { s.rep.jeong = Math.max(0, (s.rep.jeong || 0) - n); s.rep.sa = (s.rep.sa || 0) + n; }
  if (s.fr) s.fr.infamy = Math.min(100, (s.fr.infamy || 0) + n * 2);
  G.jh?.news?.(`${s.name}, ${l.name} 노예 시장에 사람 ${n}명을 넘기다.`);
  await narr(`밧줄 끝이 노예상 부하 손으로 넘어갔다. 은자 ${sum}냥이 손에 쥐어졌다.`);
  for (const id of G.party?.members() || []) { if (['yun', 'cheol', 'hyeok', 'c_mun', 'c_gu', 'clan_moyong', 'clan_namgung'].includes(id)) { s.love[id] = Math.max(0, (s.love[id] || 0) - 4); await say(id, pick(['…이건 아니에요.', '보고 있기 힘들군.', '이렇게까지 해야 했소?', '못 본 걸로 하겠습니다. 이번 한 번만입니다.'])); break; } }
}

// ── 사 온 사람: 집 하인 ──
const JOBS = { herb: ['약초를 캔다', () => give('herb', 2), '약초 2'], fish: ['물고기를 잡는다', () => give('f_crucian', 1), '붕어 1'], wood: ['장작을 팬다', () => give('wood', 2), '목재 2'], market: ['장에 나가 일한다', () => { S().silver += 6; }, '은자 6'] };
const LINES = {
  new: ['…무슨 일을 하면 됩니까.', '밥만 주시면 시키는 일은 다 하겠습니다.', '산 사람이 시키는 대로 해야지요. 그게 법이라니까.'],
  plain: ['오늘도 별일 없었습니다.', '마당 쓸어 뒀습니다.', '이 집은 밥이 넉넉해서 좋습니다.', '시장에서 주인 이름을 들었습니다. 강호에서 유명하시더군요.', '고향 꿈을 꿨습니다. 깨니까 여기더군요. 나쁘진 않았습니다.'],
  freed: ['…정말 가도 됩니까? 이 은혜는 잊지 않겠습니다.', '풀어 주신다고요? 돈 주고 사서요? 별난 분이십니다.', '고향 가는 길은 아직 기억합니다. 고맙습니다.'],
};
export async function bought(cap) {
  const s = S(), hasHouse = !!s.flags.own_house, opts = ['풀어 준다'];
  if (hasHouse && servs().length < MAXS) opts.push('집 하인으로 데려간다');
  const k = await choice(`${josa(cap[0], '을/를')} 샀다. 어떻게 할까?`, opts);
  if (opts[k] === '풀어 준다') return 'free';
  const SN = ['김', '이', '박', '최', '장', '왕', '유', '한', '조', '마', '서', '양'], M = ['석', '철', '평', '강', '진', '수', '호', '범'], F = ['연', '화', '란', '옥', '선', '매', '향', '희'], g = cap[3] === 'f' ? F : M;
  const name = pick(SN) + pick(g) + pick(g === F ? ['이', '아', '단', '심'] : ['돌', '구', '만', '복']);
  servs().push({ name, who: cap[0], spr: cap[1], job: null }); await say(null, `"제 이름은 ${name}입니다." ${josa(cap[0], '이었던/였던')} 사람이 처음으로 이름을 말했다.`);
  toast(`${josa(name, '이/가')} 집 하인이 되었다. 집에서 일을 맡길 수 있다`, 3); return 'kept';
}
async function servantTalk(i) {
  const v = servs()[i]; if (!v) return; await say(null, `${v.name}: ${pick(v.job ? LINES.plain : LINES.new)}`);
  const o = [...Object.entries(JOBS).map(([k, j]) => (v.job === k ? '✓ ' : '') + j[0]), '쉬게 한다', '풀어 준다', '그만둔다'], c = await choice(`${v.name} · ${v.who}`, o), keys = Object.keys(JOBS);
  if (c < keys.length) { v.job = keys[c]; toast(`${v.name}: ${JOBS[v.job][0]}`, 2); }
  else if (o[c] === '쉬게 한다') v.job = null;
  else if (o[c] === '풀어 준다') { servs().splice(i, 1); await say(null, `${v.name}: ${pick(LINES.freed)}`); if (S().fr) S().fr.fame += 3; G.field.refresh(); }
}
function daily() { const got = []; for (const v of servs()) { const j = JOBS[v.job]; if (j) { j[1](); got.push(`${v.name}: ${j[2]}`); } } if (got.length) toast(`집 하인 · ${got.join(', ')}`, 3.4); }
Story.providers.push(id => {
  const out = { npcs: [], spots: [], trigs: [], roam: [] }; if (id !== 'myhouse' || !G.S) return out;
  servs().forEach((v, i) => out.npcs.push({ id: 'serv' + i, spr: v.spr, x: 3 + i * 2, y: 7, dir: 0, hint: v.name, talk: () => servantTalk(i) })); return out;
});
G.slave = { capture, sellTo, bought, daily, count: capCount, servants: servs };
