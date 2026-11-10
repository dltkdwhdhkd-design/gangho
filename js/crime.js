// 아무나 건드릴 자유. 말을 걸면 협박하거나 죽이고 빼앗을 수 있고, 평타 키로 곧장 칼을 뽑을 수도 있다
// 대가는 따라온다: 악명, 문파의 원한, 포졸과 제자들. 아이와 동행, 지금 이야기를 쥔 사람은 대상이 아니다
import { G, Sound, toast, rnd, pick, josa } from './core.js';
import { ctx, say, narr, choice } from './ctx.js';
import { WHO } from './dialog.js';
import { DB } from './items.js';
import { give } from './state.js';
import { foeFor } from './free.js';
import { CAND } from './life.js';
import { FOES } from './foes.js';

const S = () => G.S;
// 이야기를 끌고 가는 사람, 내 집과 내 문파 사람, 일거리 게시판
const KEEP = new Set(['gwak', 'gwak2', 'chief', 'cheon', 'fox', 'wei', 'go', 'disc', 'samaung', 'hall_clerk', 'car', 'beggar', 'wife', 'husband', 'spouse']);
const NOMAP = new Set(['myhouse', 'mysect', 'hall_in', 'library']);
const isKid = n => (n.size && n.size < 16) || /kid|child|boy|girl/i.test(n.id) || ['Boy', 'Girl', 'Child'].includes(n.spr);
const marked = n => { try { return typeof n.mark === 'function' ? !!n.mark() : !!n.mark; } catch { return false; } };
export function can(n, mapId = G.field.m?.id) {
  if (!n || n.hide > 0 || !n.spr || NOMAP.has(mapId) || /^r_my/.test(mapId)) return false;
  if (isKid(n) || KEEP.has(n.id) || CAND[n.id] || /^c_/.test(n.id) || (G.party?.members?.() || []).includes(n.id)) return false;
  return !marked(n);
}
const nameOf = n => WHO[n.id]?.name || n.name || (n.hint && !/말 걸기|일거리/.test(n.hint) ? n.hint : null) || '행인';
function kindOf(n) {
  const s = `${n.id} ${n.hint || ''} ${n.spr}`;
  if (/gate|guard|patrol|watch|drill|tutor|walk\d|sect|순찰|문지기|포졸|제자|사범|호위|무사|교두|Knight|Samurai|Ninja/.test(s)) return 'martial';
  if (/beg|거지|Caveman/.test(s)) return 'beggar';
  if (/Noble|Inspector|merchant|trader|steward|행수|부자|나리|집사|아전/.test(s)) return 'rich';
  if (/stall|hawk|shop|smith|host|dealer|realtor|vendor|seller|상인|주인|장수|노점|대장장이|주모|객주|약방|의원|책방/.test(s)) return 'vendor';
  return 'folk';
}
const factionOf = id => { const m = /^b_(\w+)$/.exec(id) || /^r_([a-z]+)_/.exec(id); if (m) return m[1]; return ['shaolin', 'cloudmt'].includes(id) ? id : null; };
const townish = id => !!(G.evil?.TOWNS?.[id] || /^c_/.test(id) || Object.values(G.evil?.TOWNS || {}).some(t => t.rooms.includes(id)));
const infamy = v => { G.jh?.ensure?.(); if (G.evil?.infamy) G.evil.infamy(v); else if (S().fr) S().fr.infamy = Math.max(0, S().fr.infamy + v); };
const news = t => { try { G.free?.addNews?.(t); } catch { } };
const POOL = { vendor: ['tea', 'plum_wine', 'sweets', 'skewer', 'noodle', 'rice_ball', 'herb', 'honey', 'sachet', 'hairpin'], rich: ['silver_cup', 'jade_ring', 'hairpin', 'plum_wine', 'tea', 'gold_cup'], martial: ['ore_iron', 'hide', 'herb', 'rice_ball'], folk: ['rice_ball', 'herb', 'meat', 'wood', 'sweets'], beggar: ['rice_ball'] };
const SILVER = { folk: [6, 26], vendor: [30, 110], rich: [140, 380], martial: [20, 70], beggar: [0, 3] };
function loot(k, mul = 1) {
  const s = S(), [a, b] = SILVER[k], v = Math.round((a + Math.random() * (b - a)) * mul * (1 + s.lv * .03)); s.silver += v;
  const got = [`은자 ${v}냥`]; if (Math.random() < (k === 'beggar' ? .1 : .55) * mul) { const ids = POOL[k].filter(x => DB[x]); if (ids.length) { const id = pick(ids); give(id, 1); got.push(DB[id].name); } }
  Sound.sfx('coin'); toast(got.join(', ') + ' 빼앗음', 3); return v;
}
// 말하는 사람 자리. 이름 없는 사람도 말풍선에 이름과 얼굴이 뜨게
const voice = n => { WHO.cv_v = { name: nameOf(n), face: n.spr }; return 'cv_v'; };
const YIELD = {
  folk: ['살려 주십시오. 이게 다입니다.', '가져가세요. 제발 가져가세요.', '애들 밥값인데…… 가져가십시오.'],
  vendor: ['오늘 판 거 다 드리겠습니다. 가판만은 엎지 마십시오.', '장사 밑천입니다. 이번 한 번만…….', '아이고, 나리. 여기 있습니다.'],
  rich: ['얼마면 되겠소. 말만 하시오.', '내가 누군지 알고 이러는 거요? …받으시오.', '칼 치우시오. 돈이면 되지 않소.'],
  beggar: ['털 게 있어 보이쇼? 이 그릇이 전부요.'],
};
const DEFY = ['칼 찬 사람한테 칼을 들이대? 해 보자는 거요?', '협박은 상대를 봐 가면서 하시오.', '여기가 어디라고. 뽑으시오.'];
// 죽은 사람은 한동안 자리에 없다. 시간이 지나면 다른 사람이 그 자리를 잇는다
const deadKey = (mapId, n) => mapId + ':' + n.id;
export function apply(mapId, npcs) {
  const s = S(), d = s.dead_npc || {}; for (const k in d) if (d[k] <= s.day) delete d[k];
  const out = npcs.filter(n => !(d[deadKey(mapId, n)] > s.day));
  for (const n of out) { if (n._cv || !n.talk || KEEP.has(n.id) || isKid(n) || CAND[n.id]) continue; const base = n.talk; n._cv = 1; n.talk = () => menu(n, base, mapId); }
  return out;
}
async function menu(n, base, mapId) {
  if (!can(n, mapId) || (G.auto && !G.crimeTest)) return base(); // 자동 시험은 원래 대화를 본다
  const c = await choice(`${nameOf(n)}. 어떻게 할까?`, ['말을 건다', '협박한다', '죽이고 빼앗는다', '그만둔다']);
  if (c === 0) return base(); if (c === 1) return threaten(n, mapId); if (c === 2) return attack(n, mapId, true);
}
async function threaten(n, mapId) {
  const s = S(), k = kindOf(n), who = voice(n), key = 'thr_' + deadKey(mapId, n);
  if (s.daily[key]) { await say(who, '오늘 벌써 다 털어 갔잖습니까. 더는 없습니다.'); return; }
  s.daily[key] = 1; await say('me', pick(['가진 거 다 내놔.', '조용히 내놓으면 아무도 안 다친다.', '목숨값을 치러라.']), 'a');
  if (k === 'martial' && Math.random() < .7) { await say(who, pick(DEFY)); return fight(n, mapId, false); }
  await say(who, pick(YIELD[k])); loot(k, .55); infamy(k === 'beggar' ? 1 : 3);
  if (townish(mapId) && k !== 'beggar' && Math.random() < .3) { await narr('누가 소리를 질렀다. 포졸들이 골목 끝에서 달려온다.'); return guards(mapId); }
  const f = factionOf(mapId); if (f) G.jh?.feud?.(f, nameOf(n), 'threat');
}
// 칼을 뽑는다. 말을 건 뒤든 평타 키든
export async function attack(n, mapId = G.field.m.id, asked = false) {
  if (!asked) { const c = await choice(`${josa(nameOf(n), '을/를')} 벨까? 되돌릴 수 없다.`, ['벤다', '그만둔다']); if (c) return; }
  else await say('me', pick(['운이 없었다고 생각해라.', '가진 걸 두고 가라. 목숨까지.', '……']), 'a');
  return fight(n, mapId, true);
}
async function guards(mapId) {
  const lv = S().lv, win = await ctx.duel({ foes: [foeFor('guard', lv), foeFor('guard', lv)], arena: G.field.m.arena || 'village', bgm: 'fight', title: '포졸', optional: true, noIntro: true });
  if (!win) { const v = Math.round(S().silver * .3); S().silver -= v; infamy(-2); await narr(`포졸들에게 붙잡혀 곤장을 맞았다. 벌금으로 은자 ${v}냥을 냈다.`); return false; }
  infamy(4); await narr('포졸들이 칼을 놓고 흩어졌다. 이 동네에서 내 얼굴을 모르는 사람은 이제 없다.'); return true;
}
async function fight(n, mapId, meant) {
  const s = S(), k = kindOf(n), lv = s.lv, f = factionOf(mapId), name = nameOf(n);
  const id = 'cv_' + k, base = foeFor(k === 'martial' ? 'guard' : 'villager', Math.max(1, Math.round(k === 'martial' ? lv : lv * .5)));
  FOES[id] = { ...FOES[base], name, spr: n.spr.includes('/') ? n.spr : 'chars/' + n.spr, title: undefined };
  const foes = [id];
  if (f && G.jh?.crew && k === 'martial') { const F2 = G.free?.fac?.(f); if (F2) foes.push(...G.jh.crew(F2, lv, 1)); }
  else if (townish(mapId) && k !== 'martial' && Math.random() < .5) { foes.push(foeFor('guard', lv)); await narr('비명 소리에 포졸이 달려왔다.'); }
  const win = await ctx.duel({ foes, arena: G.field.m.arena || 'village', bgm: 'fight', title: name, optional: true, noIntro: true, noLoot: true });
  if (!win) { infamy(1); await narr(pick(['흙바닥에 나뒹굴었다. 사람들이 내 얼굴을 똑똑히 봤다.', '칼을 놓쳤다. 정신을 차리니 다들 멀찍이 떨어져 수군거리고 있었다.'])); return; }
  const c = await choice(`${josa(name, '이/가')} 쓰러졌다. 아직 숨이 붙어 있다.`, ['숨통을 끊고 뒤진다', '가진 것만 빼앗고 살려 둔다']);
  loot(k, c === 0 ? 1 : .7);
  if (c === 0) {
    (s.dead_npc = s.dead_npc || {})[deadKey(mapId, n)] = s.day + (s.mode === 'free' ? 12 : 4);
    infamy(k === 'martial' ? 6 : 10); if (f && G.jh?.kill) { await G.jh.kill(f, name); G.jh.feud(f, name, 'kill'); }
    if (s.rep) { s.rep.jeong = (s.rep.jeong || 0) - 2; s.rep.sa = (s.rep.sa || 0) + 1; }
    news(`${G.field.m.name}에서 ${josa(name, '이/가')} 칼에 맞아 죽었다. ${s.name}의 짓이라는 소문이다.`);
    await narr(pick(['피를 닦고 품을 뒤졌다. 구경하던 사람들이 하나둘 문을 닫았다.', '숨이 멎은 걸 확인하고 전대를 풀었다. 아무도 다가오지 않았다.', '칼을 거두었다. 뒤에서 누군가 우는 소리가 났다.']));
  } else { infamy(k === 'martial' ? 2 : 4); if (f) G.jh?.feud?.(f, name, 'rob'); await narr(pick(['전대를 빼앗고 등을 떠밀었다. 다리를 절며 도망쳤다.', '목숨은 두고 가진 것만 거뒀다. 원망하는 눈빛이 등에 꽂혔다.'])); }
  if (f && G.jh?.alarm && (c === 0 || Math.random() < .5)) await G.jh.alarm(G.free.fac(f) || { name: f, group: '' });  // 본가 안에서 일을 벌이면 경종이 울린다
  G.field.refresh();
}
G.crime = { can, apply, attack, kindOf };
