// 무공을 얻는 길: 사사, 대련과 견식, 잔권 해독, 기연, 책방
import { G, Sound, toast, josa, esc, pick, rnd } from './core.js';
import { ctx, say, narr, choice } from './ctx.js';
import { SKILLS, HEARTS } from './data.js';
import { MOVES } from './foes.js';
import { learn } from './state.js';
import { FACS } from './free.js';
import { ARTS, ART_HEARTS, RELICS, RELIC_HEARTS } from './artdata.js';

const S = () => G.S, pw = t => [1, 1.22, 1.5][t - 1];
const arcH = (r, a, mul, o = {}) => ({ shape: 'arc', r, a, mul, kb: 44, stun: .38, ...o }), lineH = (len, wd, mul, o = {}) => ({ shape: 'line', len, w: wd, mul, kb: 40, stun: .36, ...o }), ring = (r, mul, o = {}) => ({ shape: 'circle', r, mul, kb: 50, stun: .4, ...o });
const ULT = { cut: 1, armor: .8 };
const ARCH = {
  slash: t => ({ mp: 8 + t * 3, cd: 3 + t * 1.2, dur: .44, steps: [{ t: .16, sfx: 'sword2', move: { d: 8, dur: .05 }, hit: arcH(38, 85, 2.05 * pw(t)), fx: { n: 'double', s: 1.6 } }] }),
  combo: t => ({ mp: 9 + t * 3, cd: 3.5 + t * 1.2, dur: .6, steps: [.08, .22, .38].map((q, i) => ({ t: q, sfx: i === 2 ? 'sword2' : 'sword', move: { d: 6, dur: .05 }, hit: arcH(26, 72, (i === 2 ? 1.2 : .8) * pw(t), { kb: i === 2 ? 54 : 8, stun: .26 }), fx: { n: i === 2 ? 'double' : 'claw', s: 1 } })) }),
  flurry: t => ({ mp: 12 + t * 3, cd: 5 + t * 1.4, dur: .82, steps: [.06, .16, .26, .36, .46, .56, .68].map((q, i) => ({ t: q, sfx: i % 2 ? 'mini' : 'sword', hit: arcH(30, 70, (i === 6 ? 1 : .55) * pw(t), { kb: i === 6 ? 60 : 4, stun: .2 }), fx: { n: 'slash', s: 1.1 } })) }),
  pierce: t => ({ mp: 7 + t * 3, cd: 2.5 + t * 1.2, dur: .4, steps: [{ t: .14, sfx: 'sword2', move: { d: 10, dur: .06 }, hit: lineH(66, 12, 2 * pw(t)), fx: { n: 'cut', s: 1.8, along: 1 } }] }),
  dash: t => ({ mp: 9 + t * 4, cd: 3.5 + t * 1.5, dur: .44, steps: [{ t: 0, sfx: 'sword2', move: { d: 64 + t * 8, dur: .13, iframe: true, ghost: true } }, { t: .13, hit: lineH(70 + t * 8, 14, 2.05 * pw(t), { back: 66 + t * 8 }), fx: { n: 'cut', s: 1.5, along: 1 } }] }),
  spin: t => ({ mp: 11 + t * 3, cd: 5 + t * 1.3, dur: .5, steps: [{ t: .13, sfx: 'sword2', hit: ring(36, 2 * pw(t), { kb: 62 }), fx: { n: 'circle', s: 1.6, at: 'self' } }] }),
  wave: t => ({ mp: 8 + t * 3.5, cd: 3 + t * 1.3, dur: .36, steps: [{ t: .13, sfx: 'magic1', proj: { img: t === 3 ? 'p_bigenergy' : 'p_energy', speed: 200, mul: 1.55 * pw(t), life: .95, r: t === 3 ? 10 : 7, pierce: true, stun: .3 } }] }),
  fan: t => ({ mp: 8 + t * 3, cd: 3.5 + t * 1.2, dur: .36, steps: [{ t: .12, sfx: 'magic1', proj: { img: 'p_energy', speed: 200, mul: .85 * pw(t), life: .7, n: t === 3 ? 5 : 3, spread: 15, r: 6, stun: .2 } }] }),
  dart: t => ({ mp: 6 + t * 2, cd: 2.5 + t, dur: .3, steps: [{ t: .1, sfx: 'sword', proj: { img: 'p_kunai', speed: 250, mul: 1.5 * pw(t), life: .9, r: 4, stun: .2 } }] }),
  palm: t => ({ mp: 8 + t * 3, cd: 3 + t * 1.3, dur: .42, steps: [{ t: .15, sfx: 'hit3', move: { d: 9, dur: .05 }, hit: arcH(30, 62, 2.35 * pw(t), { kb: 90, stun: .45 }), fx: { n: 'spark', s: 1.6, at: 'front', off: 16 } }] }),
  crush: t => ({ mp: 12 + t * 4, cd: 5 + t * 1.5, dur: .62, steps: [{ t: .02, armor: .4 }, { t: .3, sfx: 'boom2', move: { d: 10, dur: .05 }, hit: arcH(34, 70, 3.1 * pw(t), { kb: 110, stun: .6, ub: t === 3 }), fx: { n: 'spark', s: 2.2, at: 'front', off: 18 }, shake: 3 }] }),
  leap: t => ({ mp: 12 + t * 3.5, cd: 6 + t * 1.3, dur: .68, o: { teleToFoe: true }, steps: [{ t: .02, iframe: .42, jump: .4, sfx: 'jump' }, { t: .42, sfx: 'sword2', hit: ring(36, 2.5 * pw(t), { kb: 54, stun: .5 }), fx: { n: 'circle', s: 1.7, at: 'self' } }] }),
  stomp: t => ({ mp: 11 + t * 3, cd: 6 + t * 1.3, dur: .5, steps: [{ t: .18, sfx: 'boom2', hit: ring(38 + t * 4, 1.4 * pw(t), { kb: 16, stun: 1 }), fx: { n: 'ring', s: 1.9, at: 'self' }, shake: 3 }] }),
  blink: t => ({ mp: 9 + t * 3, cd: 4 + t * 1.3, dur: .44, steps: [{ t: .03, sfx: 'magic2', blink: { behind: 16 }, fx: { n: 'smoke', s: 1, at: 'self' } }, { t: .18, sfx: 'sword2', hit: arcH(28, 100, 2 * pw(t)), fx: { n: 'double', s: 1.3 } }] }),
  mine: t => ({ mp: 14 + t * 4, cd: 8 + t * 1.4, dur: .42, steps: [{ t: .1, sfx: 'magic3', zone: { at: 'ring', n: 5 + t, dist: 44, r: 16, delay: .55, mul: 1.3 * pw(t), stun: 1, kb: 0, player: true, fx: 'ringw', sfx: 'magic2' } }] }),
  counter: t => ({ mp: 8 + t * 3, cd: 7 + t, dur: .7, o: { self: true }, steps: [{ t: 0, sfx: 'select', counter: { dur: .62, mul: 2.5 * pw(t), all: t === 3 }, fx: { n: 'shieldb', s: 1.2, at: 'self' } }] }),
  ult_line: () => ({ mp: 45, cd: 28, dur: .9, o: { ult: true }, steps: [{ t: .02, ...ULT }, { t: .34, sfx: 'boom', hit: lineH(130, 40, 5.6, { kb: 120, stun: .8, ub: true }), fx: { n: 'cut', s: 3.4, along: 1 }, shake: 6 }] }),
  ult_arc: () => ({ mp: 45, cd: 28, dur: .9, o: { ult: true }, steps: [{ t: .02, ...ULT }, { t: .36, sfx: 'boom', hit: arcH(76, 60, 5.8, { kb: 130, stun: .9, ub: true }), fx: { n: 'spark', s: 4, at: 'front', off: 34 }, shake: 6 }] }),
  ult_ring: () => ({ mp: 45, cd: 28, dur: .9, o: { ult: true }, steps: [{ t: .02, ...ULT }, { t: .4, sfx: 'boom', hit: ring(62, 5.2, { kb: 90, stun: .9, ub: true }), fx: { n: 'thunder', s: 2.6, at: 'self' }, shake: 6 }] }),
  ult_fan: () => ({ mp: 45, cd: 28, dur: .8, o: { ult: true }, steps: [{ t: .02, ...ULT }, { t: .3, sfx: 'boom2', proj: { img: 'p_kunai', speed: 260, mul: 1.5, life: .8, n: 9, spread: 11, r: 5, stun: .3 }, shake: 4 }] }),
  ult_pull: () => ({ mp: 45, cd: 28, dur: .95, o: { ult: true }, steps: [{ t: .02, ...ULT, sfx: 'magic2', pull: { r: 110, f: 170 } }, { t: .42, sfx: 'boom', hit: ring(58, 5, { kb: 70, stun: .9, ub: true }), heal: { hp: .12, mp: .2 }, fx: { n: 'aurap', s: 2.6, at: 'self' }, shake: 5 }] }),
};
const make = (id, name, han, w, school, arch, t, desc, fac) => { const a = ARCH[arch](t); SKILLS[id] = { id, name, han, w, school, mp: Math.round(a.mp), cd: +a.cd.toFixed(1), desc, dur: a.dur, steps: a.steps, tier: t, fac, ...(a.o || {}) }; };
const nameOf = fid => fid === 'jabhak' ? '강호 잡학' : (FACS.find(f => f.id === fid) || {}).name || fid;
export const ID = {}; // 세력 id → 초식 id 목록
for (const fid in ARTS) { ID[fid] = ARTS[fid].map((a, i) => { const id = `x_${fid}${i + 1}`; make(id, a[0], a[1], a[2], nameOf(fid), a[3], a[4], a[5], fid); return id; }); }
for (const r of RELICS) make(r.id, r.name, r.han, r.w, '기연', r.arch, 3, r.desc, null);
for (const fid in ART_HEARTS) { const [name, , desc, fx] = ART_HEARTS[fid]; HEARTS['h_' + fid] = { name, desc: `${nameOf(fid)}의 심법. ${desc}.`, fx }; }
for (const r of RELIC_HEARTS) HEARTS[r.id] = { name: r.name, desc: `기연으로 얻은 심법. ${r.desc}.`, fx: r.fx };
// 적이 쓰는 꼴. 예고가 길고 위력이 낮다
function toMove(k) {
  const useful = k.steps.some(q => q.hit || q.proj || q.zone); if (!useful) return null;
  const sc = k.ult ? .42 : .55, steps = k.steps.map(q => { const r = { ...q, t: q.t + .36 }; delete r.cut; delete r.heal; if (q.hit) r.hit = { ...q.hit, mul: q.hit.mul * sc, ub: false }; if (q.proj) r.proj = { ...q.proj, mul: q.proj.mul * sc }; if (q.zone) r.zone = { ...q.zone, mul: q.zone.mul * sc, player: false }; if (q.blink) r.blink = { ...q.blink, enemy: true }; return r; });
  const h = k.steps.find(q => q.hit)?.hit, range = k.teleToFoe ? 130 : k.steps.some(q => q.proj) ? 120 : k.steps.some(q => q.blink) ? 130 : k.steps.some(q => q.zone) ? 60 : h ? (h.len || h.r || 30) + (k.steps[0].move?.d || 0) * .6 : 40;
  return { range, dur: k.dur + .4, steps, teleToFoe: k.teleToFoe, noTele: k.steps.some(q => q.blink), name: k.name };
}
for (const k in SKILLS) if (k.startsWith('x_') && !MOVES[k]) { const m = toMove(SKILLS[k]); if (m) MOVES[k] = { ...m, id: k, fromSkill: true, cd: SKILLS[k].cd }; }
export const usable = fid => (ID[fid] || []).filter(k => MOVES[k]);

// ── 견식: 튕겨낸 초식은 몸이 기억한다 ──
const needSee = () => Math.max(4, 9 - Math.floor(S().inn / 10));
const seeable = k => { const q = SKILLS[k]; return q && !q.ult && q.school !== '월하칠식' && q.w; };
function parried(key) {
  const s = S(); if (!seeable(key) || s.skills.includes(key)) return; s.insight = s.insight || {}; s.insight[key] = (s.insight[key] || 0) + 1;
  if (s.insight[key] >= needSee()) { learn(key); toast(`막아 내며 익혔다: ${SKILLS[key].name}`, 3.4); }
  else if (s.insight[key] === 1) toast(`처음 보는 초식이다: ${SKILLS[key].name}`, 2.2);
}
// ── 잔권 ──
const needScrap = k => (SKILLS[k].tier || 1) + 2;
function addScrap(k, n = 1) { const s = S(); s.scrap = s.scrap || {}; s.scrap[k] = (s.scrap[k] || 0) + n; Sound.sfx('secret', .6); toast(`비급 잔권을 주웠다: ${SKILLS[k].name} (${s.scrap[k]}/${needScrap(k)})`, 2.8); }
function drop(fid, ch = .08) {
  if (Math.random() > ch) return; const s = S(), pool = (fid && ID[fid] ? ID[fid] : ID[pick(Object.keys(ID))]).filter(k => !s.skills.includes(k) && !SKILLS[k].ult && (SKILLS[k].tier < 3 || Math.random() < .3)); if (pool.length) addScrap(pick(pool));
}
async function decode(k) {
  const s = S(), q = SKILLS[k]; s.decode = s.decode || {}; await narr(`${q.name} 잔권을 펴 놓고 밤을 새웠다.`);
  s.decode[k] = (s.decode[k] || 0) + (28 + s.inn * 1.4) * (1 + (G.party?.fx().decode || 0) / 100);
  if (s.decode[k] >= 100) { delete s.decode[k]; delete s.scrap[k]; learn(k); await G.life.sleepNow(); await narr(`끊어진 구절이 이어졌다. ${josa(q.name, '을/를')} 익혔다.`); }
  else { await G.life.sleepNow(); await narr(`아직 다 읽히지 않는다. (해독 ${Math.round(s.decode[k])}%)`); }
}
// ── 사사 ──
const REP = [10, 30, 55], PRICE = [80, 240, 600], LV = [1, 12, 24];
async function teachList(f) {
  const s = S(), jh = G.jh, rep = jh.rep(f.id), mine = s.fr.fac === f.id, L = (ID[f.id] || []).filter(k => !s.skills.includes(k)), h = 'h_' + f.id, opts = [];
  for (const k of L) { const q = SKILLS[k], t = (q.tier || 1) - 1, price = mine ? PRICE[t] >> 1 : PRICE[t], ok = (mine ? s.fr.rank >= t : rep >= REP[t]) && s.lv >= LV[t]; opts.push([`${q.name} · 은자 ${price}냥${ok ? '' : mine ? ` (${t}계급 이상, 레벨 ${LV[t]})` : ` (우호 ${REP[t]}, 레벨 ${LV[t]})`}`, async () => {
    if (!ok) { await say(null, '사범이 고개를 저었다. 아직 그럴 사이가 아니라는 뜻이다.'); return; } if (s.silver < price) { await say(null, '은자가 모자란다.'); return; }
    s.silver -= price; await narr('사범이 기본자세부터 다시 잡아 주었다. 해가 질 때까지 같은 동작만 했다.'); await G.life.sleepNow(); learn(k); jh.addRep(f.id, 2);
  }]); }
  for (const hk of [h, f.heart]) if (hk && HEARTS[hk] && hk !== 'none' && !s.hearts.includes(hk)) { const ok = mine ? s.fr.rank >= 1 : rep >= 45; opts.push([`${HEARTS[hk].name} · 은자 400냥${ok ? '' : mine ? ' (내문 이상)' : ' (우호 45)'}`, async () => { if (!ok) { await say(null, '심법은 아무에게나 주지 않는다고 했다.'); return; } if (s.silver < 400) { await say(null, '은자가 모자란다.'); return; } s.silver -= 400; s.hearts.push(hk); await narr('호흡을 고르는 법을 처음부터 다시 배웠다. 숨 쉬는 것도 배워야 하는 일이었다.'); await G.life.sleepNow(); toast(`심법을 익혔다: ${HEARTS[hk].name}`, 3); }]); }
  if (!opts.length) { await say(null, '가르칠 것은 다 가르쳤다고 한다.'); return; }
  opts.push(['그만둔다', async () => { }]); const c = await choice(`무엇을 배울까? (우호 ${rep})`, opts.map(o => o[0])); await opts[c][1]();
}
export async function tutor(f) {
  const s = S(), jh = G.jh; if (jh.hostile(f.id)) { await say(null, '사범이 칼자루에 손을 얹었다. 얘기할 사이가 아니다.'); return; }
  const opts = [['가르침을 청한다', () => teachList(f)]];
  if (!s.daily['spar_' + f.id]) opts.push(['대련을 청한다', async () => { s.daily['spar_' + f.id] = 1; const won = await ctx.duel({ foes: [jh.disciple(f, s.lv, true)], arena: G.field.m.arena, bgm: 'fight', title: `${f.name} 대련`, optional: true, noIntro: true, spar: true }); if (won) { jh.addRep(f.id, 2); await say(null, '좋은 칼이라고 했다. 다음에 또 오라고 한다.'); drop(f.id, .35); } else await say(null, '사범이 손을 내밀어 일으켜 주었다.'); }]);
  if (!s.daily['alms_' + f.id]) opts.push(['헌금한다 (은자 50냥)', async () => { if (s.silver < 50) { await say(null, '은자가 모자란다.'); return; } s.silver -= 50; s.daily['alms_' + f.id] = 1; jh.addRep(f.id, 3); Sound.sfx('coin'); await say(null, '장부에 이름을 적어 주었다.'); }]);
  opts.push(['이곳에 대해 묻는다', async () => { await narr(f.desc); }], ['그만둔다', async () => { }]);
  const c = await choice(`${f.name} 사범 · 우호 ${jh.rep(f.id)}`, opts.map(o => o[0])); await opts[c][1]();
}
// ── 책방 ──
export async function bookshop(l) {
  const s = S(), day = s.day, seed = l.id.length * 7 + day, q = (n, L) => L[(seed * 31 + n * 17) % L.length], J = ID.jabhak.filter(k => !s.skills.includes(k)), books = [...new Set([q(1, J), q(2, J), q(3, J)])].filter(Boolean), all = Object.keys(ID).filter(k => k !== 'jabhak'), fid = q(4, all), scrap = q(5, ID[fid].filter(k => !SKILLS[k].ult)), opts = [];
  for (const k of books) { const p = 120 + (SKILLS[k].tier || 1) * 90; opts.push([`${SKILLS[k].name} 비급 · 은자 ${p}냥`, async () => { if (s.silver < p) { await say(null, '은자가 모자란다.'); return; } s.silver -= p; learn(k); }]); }
  if (scrap && !s.skills.includes(scrap) && !s.daily['scrap_' + l.id]) opts.push([`${SKILLS[scrap].name} 잔권 · 은자 90냥`, async () => { if (s.silver < 90) { await say(null, '은자가 모자란다.'); return; } s.silver -= 90; s.daily['scrap_' + l.id] = 1; addScrap(scrap); }]);
  opts.push(['그만둔다', async () => { }]); const c = await choice(`${l.name} 고서점이다. 곰팡내가 난다.`, opts.map(o => o[0])); await opts[c][1]();
}
// ── 기연 ──
const ALL_RELICS = [...RELICS.map(r => ({ ...r, skill: 1 })), ...RELIC_HEARTS];
async function relic(r) {
  const s = S(); if (s.inn < r.inn) { await narr('뭔가 있다. 그런데 아직 내 눈으로는 읽히지 않는다.'); toast(`내공 ${r.inn} 이상이 되면 다시 와 보자`, 3); return; }
  for (const l of r.lines) await narr(l);
  (s.relic = s.relic || {})[r.id] = 1; if (r.skill) learn(r.id); else { s.hearts.push(r.id); Sound.sfx('bonus'); toast(`심법을 익혔다: ${r.name}`, 3); } ctx.note(`${r.where}에서 ${josa(r.name, '을/를')} 얻었다.`);
}
const rumor = () => { const L = ALL_RELICS.filter(r => !(S().relic || {})[r.id]); return L.length ? `${pick(L).where}에 뭐가 있다던데요. 다녀온 사람마다 말이 달라요.` : null; };
// ── 무공록 ──
function codex(B) {
  const s = S(), all = Object.keys(SKILLS), have = s.skills.length, jh = G.jh;
  const sec = (fid, title) => {
    const L = fid === 'relic' ? RELICS.map(r => r.id) : ID[fid] || []; if (!L.length) return '';
    return `<details ${fid === B._open ? 'open' : ''} data-f="${fid}" style="margin-bottom:4px"><summary style="cursor:pointer">${esc(title)} <small class="hint">${L.filter(k => s.skills.includes(k)).length}/${L.length}${fid !== 'relic' && fid !== 'jabhak' ? ` · 우호 ${jh.rep(fid)}` : ''}</small></summary><div class="list" style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:6px">${L.map(k => { const q = SKILLS[k], got = s.skills.includes(k), sc = (s.scrap || {})[k] || 0, ins = (s.insight || {})[k] || 0, need = needScrap(k), can = sc >= need && !got; return `<button class="item ${got ? 'eq' : ''}" ${can ? `data-dec="${k}"` : 'disabled'}>${got || sc || ins ? q.name : '？？？'}${q.ult ? '<span class="tag ult">절초</span>' : ''}<span class="tag">${q.w}</span><small>${got ? q.desc : fid === 'relic' ? '강호 어딘가에 있다.' : `잔권 ${sc}/${need}${seeable(k) ? ` · 견식 ${ins}/${needSee()}` : ''}${(s.decode || {})[k] ? ` · 해독 ${Math.round(s.decode[k])}%` : ''}${can ? ' · 눌러서 해독' : ''}`}</small></button>`; }).join('')}</div></details>`;
  };
  const hs = s.hearts.filter(h => h !== 'none').map(h => HEARTS[h].name).join(', ') || '없음';
  B.innerHTML = `<p class="hint">익힌 초식 ${have}/${all.length} · 익힌 심법 ${s.hearts.length - 1}/${Object.keys(HEARTS).length - 1} (${esc(hs)})</p><p class="hint">사범에게 배우거나, 대련에서 막아 내며 익히거나, 잔권을 모아 해독하거나, 강호 곳곳의 기연을 찾으면 된다.</p>` + sec('jabhak', '강호 잡학') + FACS.map(f => sec(f.id, f.name)).join('') + sec('relic', '기연');
  B.querySelectorAll('details').forEach(d => d.ontoggle = () => { if (d.open) B._open = d.dataset.f; });
  B.querySelectorAll('[data-dec]').forEach(b => b.onclick = () => { const k = b.dataset.dec; G.closeMenu && G.closeMenu(); G.field.run(() => decode(k)); });
}
G.arts = { parried, drop, tutor, bookshop, codex, relics: ALL_RELICS, relic, addScrap, usable, rumor, ID };
