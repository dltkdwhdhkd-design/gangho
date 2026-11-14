// 강호를 떠도는 무리: 정파 문파·세가, 사파, 마교 사람들이 강호 길을 오간다
// - 정파: 악명이 높거나(현상금이 붙었거나) 원수진 세력이면 나를 잡으러 달려든다. 사파·마교 무리와 마주치면 칼을 뽑는다
// - 사파: 평소엔 그냥 지나간다. 시비를 걸면 싸우고, 그 세력에 원한을 산다. 원수진 사파는 먼저 덤빈다
// - 마교: 나(천마신교가 아니면)와 다른 무리 모두에게 시비를 건다
// - 현상범 무리: 사파·마교 무리 가운데 현상금이 걸린 자. 쓰러뜨리면 상금. 정파 무리가 쫓는다
// 무리끼리 붙으면 칼빛이 오가다 한쪽이 쓰러진다. 싸움판에 끼어 한쪽 편을 들 수 있다
import { G, Sound, toast, josa, pick } from './core.js';
import { say, narr, choice, ctx } from './ctx.js';
import { FOES } from './foes.js';
import { FACS } from './free.js';

const S = () => G.S, Fr = () => G.S.fr, MAXB = 2;
const ENEMY = (a, b) => (a.side !== b.side && (a.side === 'ma' || b.side === 'ma' || (a.side === 'jeong') !== (b.side === 'jeong'))) || (a.side === 'jeong' && b.side === 'jeong' && !!G.saga?.feuding?.(a.fac, b.fac));  // 같은 정파라도 이권 다툼 중이면(js/saga.js 정파 내분) 칼을 뽑는다
const alive = f => !Fr()?.fallen?.[f.id] && !Fr()?.dead?.[f.id];
const myFac = () => Fr()?.fac, bounty = () => (Fr()?.infamy || 0) * 12;
const VILL = ['흑풍 마삼', '독사 염구', '피바람 곽자', '쌍도 노칠', '야차 진오', '귀수 엽팔'];
const LINES = {
  jeong: ['요즘 사파 놈들이 길목마다 진을 친다더군. 조심하시오.', '사문 일로 가는 길이오. 비켜 주시면 고맙겠소.', '현상범 방을 보셨소? 우리도 그놈들을 쫓는 중이오.', '강호가 어지러울수록 협의를 지켜야지.'],
  sa: ['뭘 봐? 갈 길 가.', '흐흐, 주머니가 두둑해 보이는데. 농담이야.', '우리 일에 끼어들지 마라. 오래 살고 싶으면.', '정파 놈들 냄새가 나는데… 당신은 아니지?'],
  ma: ['천마께서 굽어보신다.', '무릎 꿇는 자는 살려 둔다.'],
  mine: ['사형(사제)! 여기서 다 보네.', '본문 소식 들었소? 요즘 다들 바쁘오.', '같은 문하끼리 길에서 만나니 반갑구려.'],
};
const bands = () => G.field.roam.filter(r => r.band && !r.gone);

// ── 무리 만들기 ──
function spawn(x, y) {
  const s = S(); if (!s?.fr || bands().length >= MAXB || Math.random() < .45) return null;
  const roll = Math.random(), want = roll < .5 ? 'jeong' : roll < .85 ? 'sa' : 'ma';
  const F = FACS.filter(f => f.align === want && alive(f)); if (!F.length) return null;
  const R = want === 'jeong' && G.saga?.riftFacs?.(), f = R && Math.random() < .6 ? FACS.find(x => x.id === pick(R)) || pick(F) : pick(F), lv = Math.max(1, s.lv + (Math.random() < .3 ? 1 : 0)), n = lv < 6 ? 2 : 3, foes = G.jh.crew(f, lv, n);
  const villain = want !== 'jeong' && Math.random() < .35, b = { band: 1, fac: f.id, side: want, lv, foes, x, y, hx: x, hy: y, dir: 0, walk: 0, t: 1, vx: 0, vy: 0, peace: true, ai, spr: FOES[foes[0]].spr };
  b.tag = villain ? `현상범 ${pick(VILL)}` : `${f.name} ${pick(want === 'jeong' ? ['제자들', '무사들', '일행'] : want === 'sa' ? ['패거리', '무리', '일당'] : ['교도들'])}`;
  if (villain) b.prize = 80 + lv * 25;
  b.crew = foes.slice(1).map((k, i) => ({ spr: FOES[k].spr, x: x - 10 - i * 8, y: y - 6 + i * 10, dir: 0, walk: 0 }));
  b.dest = wanderTo(b); return b;
}
function wanderTo(b) { const a = Math.random() * 6.28, r = 120 + Math.random() * 160; return { x: b.x + Math.cos(a) * r, y: b.y + Math.sin(a) * r }; }

// 나를 노리는가
function hunts(b) {
  const s = S(), fr = Fr(); if (!fr) return false;
  if (b.fac === myFac()) return false;
  if (G.jh.hostile(b.fac)) return true;
  if (b.side === 'ma') return myFac() !== 'cheonma';
  if (b.side === 'jeong') return fr.infamy >= 25;  // 현상금 붙은 자는 정파가 잡으러 온다
  return false;
}
// ── 움직임 ──
function ai(b, dt, f, d) {
  const sp = 22;
  if (b.fight) {  // 다른 무리와 싸우는 중: 제자리에서 칼을 맞댄다
    b.fight.t -= dt; b.vx = b.vy = 0; b.walk += dt * 9; const o = b.fight.with; if (!o || o.gone) { b.fight = null; return; }
    b.dir = Math.abs(o.x - b.x) > Math.abs(o.y - b.y) ? (o.x < b.x ? 2 : 3) : (o.y < b.y ? 1 : 0);
    if (b.fight.t <= 0 && b.fight.lead) settle(b, o); return;
  }
  // 나를 노리면 달려든다
  if (hunts(b) && d < 150) {
    if (b.peace) { b.peace = false; b.intro = b.side === 'jeong' ? `${b.tag}: ${Fr().infamy >= 25 ? `현상금 은자 ${bounty()}냥짜리가 여기 있었군! 잡아라!` : '원수를 만났다! 놓치지 마라!'}` : b.side === 'ma' ? `${b.tag}: 천마께서 강림하신다! 무릎 꿇어라!` : `${b.tag}: 저놈이다! 형님들 원수를 갚자!`; Sound.sfx('cancel'); b.win = () => { if (b.prize) { S().silver += b.prize; S().fr.fame += 3; toast(`현상범을 잡았다. 상금 은자 ${b.prize}냥`, 3); } }; }
    const s = 48; b.vx = (f.p.x - b.x) / d * s; b.vy = (f.p.y - b.y) / d * s; return;
  }
  // 원수 무리를 보면 붙는다. 현상범과 마교는 지나가는 길손(js/travel.js)도 덮친다
  for (const o of [...bands(), ...(b.side === 'ma' || b.prize ? G.travel?.list() || [] : [])]) {
    if (o === b || o.fight || (!o.trav && !ENEMY(b, o))) continue; const e = Math.hypot(o.x - b.x, o.y - b.y);
    if (e < 26) { const t = 7 + Math.random() * 4; b.fight = { with: o, t, lead: true }; o.fight = { with: b, t, lead: false }; if (d < 260) toast(o.trav ? `${josa(b.tag, '이/가')} ${josa(o.tag.split(' · ')[0], '을/를')} 덮쳤다!` : `${josa(b.tag, '와/과')} ${josa(o.tag, '이/가')} 맞붙었다`, 2.6); return; }
    if (e < 170) { b.vx = (o.x - b.x) / e * 34; b.vy = (o.y - b.y) / e * 34; return; }
  }
  // 그냥 지나간다
  const q = Math.hypot(b.dest.x - b.x, b.dest.y - b.y); if (q < 12 || (b.t -= dt) < -14) { b.dest = wanderTo(b); b.t = 1; }
  b.vx = (b.dest.x - b.x) / (q || 1) * sp; b.vy = (b.dest.y - b.y) / (q || 1) * sp;
}
// 뒤따르는 무리
function follow(b, dt) {
  b.crew.forEach((q, i) => {
    const tx = b.fight ? b.x + (i ? 10 : -10) : b.x - (b.vx || 0) * .5 * (i + 1) + (i ? 9 : -9), ty = b.fight ? b.y + 8 + i * 6 : b.y - (b.vy || 0) * .5 * (i + 1) + 4, dx = tx - q.x, dy = ty - q.y, e = Math.hypot(dx, dy);
    if (e > 2) { const k = Math.min(1, dt * 4); q.x += dx * k; q.y += dy * k; q.walk += dt * 7; q.dir = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 2 : 3) : (dy < 0 ? 1 : 0); } else if (b.fight) q.walk += dt * 9;
  });
}
// 싸움이 끝나면 한쪽이 쓰러진다(사람 수와 단계로 기운다)
function settle(a, b) {
  const pa = a.foes.length * (a.side === 'ma' ? 1.3 : 1) + Math.random() * 2, pb = b.foes.length * (b.side === 'ma' ? 1.3 : 1) + Math.random() * 2, [w, l] = pa >= pb ? [a, b] : [b, a];
  l.gone = true; w.fight = null; a.fight = b.fight = null; w.foes = w.foes.slice(0, Math.max(1, w.foes.length - 1)); if (w.crew) w.crew = w.crew.slice(0, w.foes.length - 1);
  if (l.trav) { G.travel.robbed(l, w.tag); if (Math.hypot(G.field.p.x - l.x, G.field.p.y - l.y) < 260) toast(`${josa(l.tag.split(' · ')[0], '이/가')} 털렸다`, 2.4); return; }
  if (w.trav) { G.jh.news(`${josa(w.tag.split(' · ')[0], '이/가')} ${josa(l.tag, '을/를')} 물리쳤다.`); return; }
  G.jh.news(`${josa(w.tag, '이/가')} 강호 길에서 ${josa(l.tag, '을/를')} 쓰러뜨렸다.`);
  if (Math.hypot(G.field.p.x - l.x, G.field.p.y - l.y) < 260) toast(`${josa(w.tag, '이/가')} 이겼다`, 2.4);
}
// ── 다가가 말을 건다 ──
async function talk(b) {
  const s = S(), f = FACS.find(x => x.id === b.fac), mine = b.fac === myFac();
  if (b.fight && b.fight.with && !b.fight.with.gone) return join(b, b.fight.with);
  await say(null, `${b.tag}: ${pick(mine ? LINES.mine : LINES[b.side])}`);
  const o = ['말을 섞는다', ...(b.side === 'jeong' && !mine ? ['비무를 청한다'] : []), ...(mine ? [] : ['시비를 건다']), '그냥 간다'], c = await choice(b.tag, o);
  if (o[c] === '말을 섞는다') { const N = Fr().news || []; await say(null, N.length ? `${b.tag}: 들었소? "${pick(N.slice(0, 5)).replace(/^\d+일: /, '')}"` : `${b.tag}: 요즘은 조용하오. 폭풍 전이겠지.`); return; }
  if (o[c] === '비무를 청한다') { const won = await ctx.duel({ foes: [b.foes[0]], arena: G.field.m.arena, bgm: 'fight', noIntro: true, optional: true, yieldAt: .3, noLoot: true }); if (won) { G.jh.addRep(b.fac, 3); s.fr.fame += 1; await say(null, `${b.tag}: 좋은 솜씨요. 한 수 배웠소.`); } else await say(null, `${b.tag}: 아직 멀었구려. 다음에 또 봅시다.`); return; }
  if (o[c] === '시비를 건다') return pick_(b, f);
}
// 시비: 싸우고, 원한을 산다
async function pick_(b, f) {
  const s = S(); await narr(pick([`어깨를 부딪쳤다. ${b.tag}의 눈빛이 바뀌었다.`, `"어디서 굴러먹던 패거리냐?" 한마디에 칼이 뽑혔다.`, `길을 막고 서서 비키지 않았다. 저쪽이 먼저 칼자루에 손을 댔다.`]));
  G.jh.addRep(b.fac, b.side === 'jeong' ? -18 : -12);
  const won = await ctx.duel({ foes: b.foes, arena: G.field.m.arena, bgm: 'fight', noIntro: true, optional: true });
  if (!won) { b.cool = 4; const v = Math.round(s.silver * .15); s.silver -= v; await narr(`흠씬 두들겨 맞았다. 전대에서 은자 ${v}냥이 사라졌다.`); return; }
  await finish(b, f);
}
async function finish(b, f) {
  const s = S(); b.gone = true;
  if (b.prize) { s.silver += b.prize; Sound.sfx('coin'); s.fr.fame += 3; await narr(`${josa(b.tag, '을/를')} 관아에 넘기고 상금 은자 ${b.prize}냥을 받았다.`); G.jh.news(`${s.name}, 현상범을 잡다.`); return; }
  const c = await choice(`${josa(b.tag, '이/가')} 쓰러져 있다.`, ['살려 보낸다', '숨통을 끊는다', ...(b.side !== 'jeong' && G.slave ? ['묶어서 끌고 간다'] : [])]);
  if (c === 0) { await say(null, `${b.tag}: …이 일은 잊지 않겠다.`); if (b.side !== 'jeong' && Math.random() < .5) G.jh.grudge(b.fac, `${f?.name || ''} 사람`); return; }
  if (c === 2) { const L = (s.captives = s.captives || []), room = Math.max(0, 6 - L.length), got = b.foes.slice(0, room).map(k => ({ name: FOES[k].name, spr: FOES[k].spr, lv: s.lv, boss: false })); L.push(...got); toast(got.length ? `${got.length}명을 묶었다. 노예 시장에 넘길 수 있다` : '더는 끌고 갈 수 없다', 2.6); return; }
  await G.jh.kill(b.fac, `${f?.name || ''} 사람`);
  if (b.side !== 'jeong') { s.fr.infamy = Math.max(0, s.fr.infamy - 3); s.fr.fame += 2; }  // 사파·마교를 벤 것은 정파에서 칭찬한다
}
// 싸움판에 끼어든다: 한쪽 편을 든다
async function join(a, b) {
  const N = q => q.trav ? q.tag.split(' · ')[0] : q.tag;
  const c = await choice(b.trav ? `${josa(a.tag, '이/가')} ${josa(N(b), '을/를')} 덮쳤다.` : `${josa(a.tag, '와/과')} ${josa(b.tag, '이/가')} 칼을 맞대고 있다.`, b.trav ? [`${josa(N(b), '을/를')} 구한다`, `${a.tag} 편에 붙어 같이 턴다`, '구경만 한다'] : [`${a.tag} 편을 든다`, `${b.tag} 편을 든다`, '구경만 한다']); if (c === 2) return;
  if (b.trav) { const [me, foe] = c === 0 ? [b, a] : [a, b]; a.fight = b.fight = null; const won = await ctx.duel({ foes: foe.foes, allies: me.foes, arena: G.field.m.arena, bgm: 'fight', noIntro: true, optional: true }); if (!won) { await narr('밀려나고 말았다.'); foe.cool = 4; return; }
    if (me.trav) { await G.travel.saved(me); await finish(foe, FACS.find(x => x.id === foe.fac)); } else { foe.gone = true; G.travel.robbed(foe); await narr(`${josa(N(foe), '이/가')} 가진 것을 다 털렸다. 은자 ${foe.purse}냥이 손에 들어왔다.`); } return; }
  const [me, foe] = c === 0 ? [a, b] : [b, a]; a.fight = b.fight = null;
  const won = await ctx.duel({ foes: foe.foes, allies: me.foes, arena: G.field.m.arena, bgm: 'fight', noIntro: true, optional: true });
  if (!won) { await narr('둘 다 쓰러뜨리지 못하고 물러났다.'); foe.cool = 4; return; }
  G.jh.addRep(me.fac, 8); G.jh.addRep(foe.fac, -10);
  await say(null, `${me.tag}: 고맙소! 이 은혜는 사문에 알리겠소.`);
  await finish(foe, FACS.find(x => x.id === foe.fac));
}
// ── 그리기: 이름표와 싸움 칼빛. 무리와 길손(js/travel.js) 모두. P를 주면 새 화면(HD-2D) 위 화면 좌표로 그린다 ──
function over(c, roam, t, P) {
  const k = P ? 2 : 1; c.save(); c.font = `${7 * k}px sans-serif`; c.textAlign = 'center'; c.textBaseline = 'alphabetic';
  const at = (x, y, h) => P ? P(x, y, h * .7) : [x, y - h * .62];
  for (const b of roam) {
    if ((!b.band && !b.trav) || b.gone) continue; const col = b.trav ? (b.escort ? '#b8ffb0' : '#f2ead2') : b.side === 'jeong' ? '#bfe3ff' : b.side === 'sa' ? '#ffcf9a' : '#ff8a8a';
    const label = b.prize ? `${b.tag} · 상금 ${b.prize}냥` : b.escort ? `${b.tag} · 호위 중` : b.tag, [x, y] = at(b.x, b.y, 30); c.fillStyle = 'rgba(0,0,0,.55)'; const w = c.measureText(label).width + 6 * k; c.fillRect(Math.round(x - w / 2), Math.round(y - 7 * k), w, 9 * k); c.fillStyle = b.peace ? col : '#ff6a5a'; c.fillText(label, Math.round(x), Math.round(y));
    if (b.fight && b.fight.lead && b.fight.with) { const o = b.fight.with, [mx, my] = at((b.x + o.x) / 2, (b.y + o.y) / 2, 8); if (Math.sin(t * 13) > .3) { c.strokeStyle = '#fff6c8'; c.lineWidth = k; c.beginPath(); const a = t * 9; c.moveTo(mx - Math.cos(a) * 6 * k, my - Math.sin(a) * 6 * k); c.lineTo(mx + Math.cos(a) * 6 * k, my + Math.sin(a) * 6 * k); c.stroke(); } }
  }
  c.restore();
}
G.wander = { spawn, talk, follow, over, bands, hunts, join };
