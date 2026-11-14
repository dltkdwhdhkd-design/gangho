// 강호 길손: 저마다 볼일이 있어 고을과 문파 사이 큰길을 오가는 사람들
// - 행상, 상단(표사가 따라붙는다), 순례자, 전령, 서생, 입문하러 가는 아이, 떠돌이 의원, 농부
// - 목적지(고을·문파)를 하나 정해 큰길을 따라 걷는다. 다 오면 성문으로 들어가 사라진다
// - 말을 걸면 어디 가는지, 길에서 들은 소문을 말하고, 갈래마다 할 수 있는 일이 다르다(물건, 호위, 시주, 치료…)
// - 털 수도 있다. 악명이 붙는다. 현상범·마교 무리는 지나가는 길손을 덮친다(js/wander.js). 끼어들어 구할 수 있다
import { G, TS, Sound, toast, josa, pick } from './core.js';
import { say, narr, choice, ctx } from './ctx.js';
import { LOCS } from './worlddata.js';
import { give } from './state.js';

const S = () => G.S, fr = () => G.jh?.ensure?.() || G.S.fr, MAXT = 3, rnd = (a, b) => a + Math.random() * (b - a);
const TEMPLE = new Set(['shaolin', 'wudang', 'emei', 'hwasan', 'jeonjin', 'mosan', 'pota', 'jongnam', 'cloudmt']);
const open = l => S().mode === 'free' || !l.need || S().flags[l.need];
const KINDS = {
  peddler: { tag: '행상', spr: ['Villager2', 'Villager3', 'Noble'], role: 'peddler', sp: 22, to: l => l.kind === 'city' || l.kind === 'old',
    why: d => `${d}에 물건 대러 가는 길이오. 등짐이 내 집이오.`,
    lines: ['이 길로 보름째요. 다리가 내 다리가 아니오.', '고개 하나 넘을 때마다 물건값이 한 푼씩 오르오. 그게 장사요.', '산적보다 무서운 게 비요. 비 맞으면 비단이 걸레가 되오.'] },
  caravan: { tag: '상단', spr: ['Noble'], role: 'merchant', sp: 17, crew: 2, to: l => l.kind === 'city',
    why: d => `${d}로 ${pick(['비단', '찻잎', '소금', '약재', '도자기', '쌀'])}을 실어 가오. 길이 험해 표사를 붙였소.`,
    lines: ['수레 바퀴가 또 빠질까 봐 조마조마하오.', '표국 값이 올랐소. 그래도 짐 잃는 것보단 싸지.', '요즘 길목마다 패거리가 진을 친다더군. 호위가 더 있으면 좋겠소.'] },
  pilgrim: { tag: '순례자', spr: ['OldWoman', 'OldMan2', 'Monk2'], role: 'pilgrim', sp: 15, to: l => TEMPLE.has(l.id),
    why: d => `${d}에 향 올리러 가오. 손주 병이 낫게 해 달라고.`,
    lines: ['나무아미타불. 길에서 만난 것도 인연이오.', '부처님은 칼 찬 사람도 마다하지 않으신다오.', '산문까지 아직 멀었소? 무릎이 먼저 알려 주는구려.'] },
  messenger: { tag: '전령', spr: ['GrayNinja', 'BlueNinja'], role: 'messenger', sp: 38, to: l => l.kind === 'sect',
    why: d => `${d}로 서찰을 나르오. 더는 묻지 마시오.`,
    lines: ['바쁘오. 말 세 마디만 하고 가겠소.', '서찰 속은 나도 모르오. 아는 날엔 목이 없겠지.', '사흘 걸릴 길을 이틀에 가야 하오.'] },
  scholar: { tag: '서생', spr: ['Villager'], role: 'scholar', sp: 16, to: l => ['c_nanjing', 'c_yeongyeong', 'c_kaifeng', 'c_hangzhou', 'c_nakyang'].includes(l.map),
    why: d => `과거 보러 ${d}에 가는 길입니다. 세 번째입니다. 이번엔 붙어야지요.`,
    lines: ['길에서도 책을 놓으면 안 됩니다. 아, 돌부리!', '무공 하시는 분들은 시험이 없어서 좋겠습니다.', '붓 한 자루로 천하를 다스린다지요. 칼 한 자루로도 그렇습니까?'] },
  hopeful: { tag: '입문 지망생', spr: ['Boy', 'Child'], role: 'kid', sp: 20, to: l => l.kind === 'sect' && l.color !== 'evil' && l.color !== 'out',
    why: d => `${d}에 제자로 들어가러 가요! 받아 줄지는 모르지만요.`,
    lines: ['저도 크면 대협이 될 거예요!', '산문 앞에서 사흘 꿇어앉으면 받아 준대요. 진짜예요?', '아저씨(언니)도 문파 사람이에요? 우와.'] },
  doctor: { tag: '떠돌이 의원', spr: ['OldMan3'], role: 'doctor', sp: 16, to: l => l.kind === 'city' || l.kind === 'old',
    why: d => `${d}에 역병 기운이 돈다기에 가 보는 길이오.`,
    lines: ['칼 맞은 자리는 술로 씻으시오. 마시지 말고.', '강호 사람들은 약값을 아끼다 목숨값을 치르오.', '맥을 짚어 보니 기혈이 좀 막혔구려. 농이오.'] },
  farmer: { tag: '농부', spr: ['Villager', 'Villager4'], role: 'farmer', sp: 15, to: l => l.kind === 'city' || l.kind === 'old',
    why: d => `${d} 장에 곡식 팔러 가오. 값이나 잘 쳐 주면 좋으련만.`,
    lines: ['올해는 비가 알맞게 왔소. 하늘이 웬일이오.', '칼 찬 양반들이 밭을 밟고 지나가면 일 년 농사가 끝이오.', '관아에 낼 것 내고 나면 남는 게 없소.'] },
};
const WEIGHT = [['peddler', 3], ['caravan', 2], ['pilgrim', 2], ['messenger', 1.5], ['scholar', 1], ['hopeful', 1], ['doctor', 1], ['farmer', 2]];
const roll = () => { let r = Math.random() * WEIGHT.reduce((a, w) => a + w[1], 0); for (const [k, w] of WEIGHT) if ((r -= w) < 0) return k; return 'peddler'; };
const list = () => G.field.roam.filter(r => r.trav && !r.gone);

// ── 큰길 따라 길 찾기: 지금 칸에서 목적지 성문까지 길(1)과 다리(4)만 밟는다 ──
function route(sx, sy, map) {
  const g = G.field.m.g, [W, H] = G.world.size, [ex, ey] = G.world.entry(map), gx = Math.floor(ex), gy = Math.floor(ey), road = (x, y) => { const v = g[y]?.[x]; return v === 1 || v === 4; };
  if (!road(sx, sy) || !road(gx, gy)) return null;
  const P = new Map([[sy * W + sx, -1]]), q = [sy * W + sx], goal = gy * W + gx; let h = 0;
  while (h < q.length) {
    const i = q[h++]; if (i === goal) break; const x = i % W, y = (i - x) / W;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const X = x + dx, Y = y + dy, j = Y * W + X; if (X < 0 || Y < 0 || X >= W || Y >= H || P.has(j) || !road(X, Y)) continue; P.set(j, i); q.push(j); }
  }
  if (!P.has(goal)) return null;
  const out = []; for (let i = goal; i >= 0; i = P.get(i)) out.push(i); out.reverse();
  // 칸 하나하나 대신 몇 칸씩 건너뛴 점으로(길이 넓어 그대로 걸어도 된다)
  return out.filter((_, k) => k % 3 === 0 || k === out.length - 1).map(i => [(i % W) * TS + 8, Math.floor(i / W) * TS + 10]);
}
// ── 만들기 ──
function spawn(x, y) {
  const s = S(); if (!s || list().length >= MAXT || Math.random() < .4) return null;
  const g = G.field.m.g; let sx = -1, sy = -1, best = 1e9; const cx = Math.floor(x / TS), cy = Math.floor(y / TS);
  for (let dy = -7; dy <= 7; dy++) for (let dx = -7; dx <= 7; dx++) { const v = g[cy + dy]?.[cx + dx]; if ((v === 1 || v === 4) && dx * dx + dy * dy < best) { best = dx * dx + dy * dy; sx = cx + dx; sy = cy + dy; } }
  if (sx < 0) return null;
  const kind = roll(), K = KINDS[kind], here = [sx / G.world.K, sy / G.world.K];
  const C = LOCS.filter(l => open(l) && K.to(l) && G.S.map !== l.map).map(l => ({ l, d: Math.hypot(l.px[0] - here[0], l.px[1] - here[1]) })).filter(o => o.d > 12 && o.d < (kind === 'caravan' ? 150 : 260)).sort((a, b) => a.d - b.d).slice(0, 6);
  for (let n = 0; n < 3 && C.length; n++) {
    const { l } = C.splice(Math.floor(Math.random() * C.length), 1)[0], path = route(sx, sy, l.map); if (!path || path.length < 4) continue;
    const lv = s.lv, px = sx * TS + 8, py = sy * TS + 10, foes = kind === 'caravan' ? [G.free.foeFor('guard', lv), G.free.foeFor('guard', lv)] : [G.free.foeFor('villager', Math.max(1, lv - 2))];
    const t = { trav: 1, kind, side: 'min', peace: true, ai, dest: l, path, k: 1, x: px, y: py, hx: px, hy: py, dir: 0, walk: 0, t: 1, vx: 0, vy: 0, lv, foes,
      spr: pick(K.spr), role: K.role, tag: `${K.tag} · ${l.name}행`, purse: Math.round(rnd(12, 40) + lv * (kind === 'caravan' ? 14 : 3)), stuck: 0 };
    if (K.crew) t.crew = Array.from({ length: K.crew }, (_, i) => ({ spr: 'Knight', x: px - 10 - i * 8, y: py - 6 + i * 10, dir: 0, walk: 0 }));
    return t;
  }
  return null;
}
// ── 걷기 ──
function ai(t, dt, f, d) {
  if (t.fight) { t.vx = t.vy = 0; t.walk += dt * 6; return; }  // 무리에게 붙들렸다(싸움은 js/wander.js가 끝낸다)
  if (t.escort) {
    if (d > 320) { t.escort = false; toast(`${josa(t.tag.split(' · ')[0], '을/를')} 놓쳤다. 호위는 없던 일이 됐다`, 2.8); }
    else if ((t.ambushT -= dt) <= 0 && !t.ambushed) { t.ambushed = true; t.vx = t.vy = 0; f.run(() => ambush(t)); return; }
  }
  const p = t.path[t.k]; if (!p) { arrive(t, d); return; }
  const dx = p[0] - t.x, dy = p[1] - t.y, e = Math.hypot(dx, dy), sp = KINDS[t.kind].sp * (t.escort && d > 90 ? .55 : 1);  // 호위가 처지면 기다려 준다
  if (e < 4) { t.k++; t.stuck = 0; return; }
  t.vx = dx / e * sp; t.vy = dy / e * sp;
  // 막혀서 못 가면 다음 점으로 건너뛴다
  const was = t._lx === undefined ? 1e9 : Math.hypot(t._lx - t.x, t._ly - t.y); t._lx = t.x; t._ly = t.y; if (was < .05) { if ((t.stuck += dt) > 1.2) { t.x = p[0]; t.y = p[1]; t.k++; t.stuck = 0; } } else t.stuck = 0;
}
async function arrive(t, d) {
  t.gone = true; if (!t.escort) return; const s = S(), pay = 50 + s.lv * 12;
  if (d > 320) return; s.silver += pay; Sound.sfx('coin'); if (fr()) fr().fame += 2;
  G.field.run(async () => { await say(null, `${t.tag.split(' · ')[0]} 행수: ${t.dest.name}에 무사히 닿았소! 약조한 은자 ${pay}냥이오. 다음에도 부탁하오.`); });
  G.jh?.news?.(`${s.name}, ${t.dest.name}까지 상단을 지켜 주다.`);
}
// 호위 길에 산적이 덮친다
async function ambush(t) {
  const s = S(), lv = s.lv, n = lv < 6 ? 2 : lv < 16 ? 3 : 4;
  await narr(pick(['수풀이 흔들리더니 복면 쓴 자들이 수레를 둘러쌌다!', '"짐 놓고 가라!" 고갯마루에서 산적들이 내려왔다.', '앞길에 통나무가 걸쳐 있다. 매복이다!']));
  const won = await ctx.duel({ foes: G.free.group('bandit', lv, n), allies: t.foes, arena: G.field.m.arena, bgm: 'fight', noIntro: true, optional: true });
  if (won) { await say(null, `${t.tag.split(' · ')[0]} 행수: 휴, 살았소! 조금만 더 가면 되오.`); return; }
  t.gone = true; t.escort = false; await narr('산적들이 수레를 끌고 사라졌다. 행수는 땅을 치며 울었다.'); G.jh?.news?.(`${t.dest.name}로 가던 상단이 산적에게 털렸다.`);
}
// ── 말 걸기 ──
async function talk(t) {
  const s = S(), K = KINDS[t.kind], who = t.tag.split(' · ')[0];
  if (t.fight && t.fight.with && !t.fight.with.gone) return G.wander.join(t.fight.with, t);
  await say(null, `${who}: ${pick(K.lines)}`);
  const O = [['어디 가시오?', async () => { await say(null, `${who}: ${K.why(t.dest.name)}`); }],
    ['길에서 들은 소문을 묻는다', async () => { const N = fr()?.news || []; await say(null, N.length && Math.random() < .75 ? `${who}: 오는 길에 들었소. "${pick(N.slice(0, 6)).replace(/^\d+일: /, '')}"` : `${who}: ${pick(['요 앞 주막 국밥이 괜찮소.', '고개 너머엔 산적이 나온다니 조심하시오.', '강 건너 마을에 무림 고수가 묵고 있다던데, 누군지는 모르겠소.', '요즘은 별일 없소. 별일 없는 게 제일이오.'])}`); }]];
  if (t.kind === 'peddler') O.push(['물건을 본다', () => wares(t)]);
  if (t.kind === 'farmer') O.push(['곡식을 산다', () => ctx.shop(`${who}의 지게`, [['rice_ball', 18], ['herb', 7], ['honey', 34]].map(([k, v]) => ctx.item.stuff(k, v)))]);
  if (t.kind === 'caravan' && !t.escort && !t.ambushed) O.push([`호위를 맡는다 (${t.dest.name}까지)`, async () => { t.escort = true; t.ambushT = rnd(18, 40); await say(null, `${who} 행수: 고맙소! ${t.dest.name}에 닿으면 은자 ${50 + s.lv * 12}냥을 드리리다.`); toast('상단을 따라 걷는다. 멀리 떨어지면 호위는 없던 일이 된다', 3); }]);
  if (t.kind === 'pilgrim' && !s.daily.alms) O.push(['시주한다 (은자 10냥)', async () => { if (s.silver < 10) return narr('전대가 비었다.'); s.silver -= 10; s.daily.alms = 1; if (fr()) fr().fame += 1; Sound.sfx('coin'); await say(null, `${who}: 복 받으실 거요. 부처님께 시주님 이름도 같이 올리리다.`); }]);
  if (t.kind === 'scholar' && !s.daily.poem) O.push(['시 한 수 청한다 (은자 20냥)', async () => { if (s.silver < 20) return narr('전대가 비었다.'); s.silver -= 20; s.daily.poem = 1; give('poem'); toast('시 한 수를 얻었다', 2.4); await say(null, `${who}: 길 위에서 쓴 것이라 거칩니다만… 정인께 드리면 좋아하실 겁니다.`); }]);
  if (t.kind === 'doctor') O.push([`약을 지어 달란다 (은자 ${30 + s.lv * 2}냥)`, async () => { const v = 30 + s.lv * 2; if (s.silver < v) return narr('전대가 모자란다.'); s.silver -= v; s.potion = s.potionMax; Sound.sfx('coin'); toast('금창약을 가득 채웠다', 2.4); }]);
  if (t.kind === 'hopeful') O.push(['격려한다', async () => { await say(null, `${who}: ${pick(['네! 꼭 대협이 될게요! 그때 저랑 비무해 주세요!', '산문 앞에서 안 울게요. 진짜로요.', '이름 알려 주세요! 나중에 사부님한테 자랑할래요.'])}`); if (fr()) fr().fame += .5; }]);
  if (t.kind === 'messenger' && t.dest.fac) O.push(['서찰을 빼앗는다', () => rob(t)]);
  if (t.kind !== 'messenger' && t.kind !== 'hopeful') O.push(['턴다', () => rob(t)]);
  O.push(['그냥 간다', async () => { }]);
  const c = await choice(t.tag, O.map(o => o[0])); await O[c][1]();
}
async function wares(t) {
  const P = [['rice_ball', 24], ['skewer', 48], ['sweets', 30], ['tea', 58], ['sachet', 78], ['herb', 9], ['honey', 38], ['plum_wine', 100], ['hairpin', 180], ['poem', 120]];
  const L = P.slice().sort(() => Math.random() - .5).slice(0, 4); t.goods = t.goods || L;
  await ctx.shop(`행상 등짐`, [ctx.item.potion(), ...t.goods.map(([k, v]) => ctx.item.stuff(k, v))]);
}
// 털기: 길손 털면 악명이 붙는다. 상단은 표사, 전령은 그 문파 사람이 막아선다
async function rob(t) {
  const s = S(), F = fr(), who = t.tag.split(' · ')[0], guarded = t.kind === 'caravan' || t.kind === 'messenger';
  const c = await choice(`${josa(who, '을/를')} 털면 악명이 붙는다.`, ['정말 턴다', '그만둔다']); if (c) return;
  if (guarded) {
    const fac = t.dest.fac && G.free.fac?.(t.dest.fac), foes = t.kind === 'caravan' ? t.foes : fac ? G.jh.crew(fac, s.lv, 1) : t.foes;
    await narr(t.kind === 'caravan' ? '표사들이 칼을 뽑아 수레 앞을 막아섰다.' : `${josa(who, '이/가')} 품속 서찰을 움켜쥐고 칼을 뽑았다.`);
    const won = await ctx.duel({ foes, arena: G.field.m.arena, bgm: 'fight', noIntro: true, optional: true });
    if (!won) { t.cool = 3; const v = Math.round(s.silver * .1); s.silver -= v; await narr(`쫓겨났다. 은자 ${v}냥을 흘렸다.`); return; }
  }
  t.gone = true; robbed(t);
  if (t.kind === 'messenger') { if (t.dest.fac && G.jh?.addRep) G.jh.addRep(t.dest.fac, -10); await narr(`서찰을 뜯어 보았다. ${pick(['문파 사이 동맹을 맺자는 내용이다. 이 서찰은 이제 닿지 않는다.', '장로 하나가 배신했다는 밀고다. 누가 보낸 것인지는 적혀 있지 않다.', '무림대회에 사람을 보내라는 전갈이다. 별것 아니다.'])}`); }
  else await narr(`${josa(who, '이/가')} 덜덜 떨며 전대를 내놓았다. 은자 ${t.purse}냥.`);
}
function robbed(t, by) {
  const s = S(), F = fr(); if (!by) { s.silver += t.purse; Sound.sfx('coin'); if (F) { F.infamy += t.kind === 'caravan' ? 6 : 3; F.fame = Math.max(0, F.fame - 1); } }
  const who = t.tag.split(' · ')[0]; G.jh?.news?.(by ? `${t.dest.name}로 가던 ${josa(who, '이/가')} ${by}에게 털렸다.` : `${t.dest.name} 가는 길에서 ${josa(who, '이/가')} 강도를 만났다는 소문이 돈다.`);
}
// 무리에게 붙들린 길손을 구해 주었다
async function saved(t) {
  const s = S(), who = t.tag.split(' · ')[0], v = Math.round(t.purse * .6); s.silver += v; Sound.sfx('coin'); if (fr()) fr().fame += 2;
  await say(null, `${who}: 은인이오! 가진 게 이것뿐이지만 받아 주시오. (은자 ${v}냥)`); G.jh?.news?.(`${s.name}, 강도 떼에게서 ${josa(who, '을/를')} 구하다.`);
}
G.travel = { spawn, talk, list, robbed, saved, route, KINDS };
