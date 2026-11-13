// 기루(妓樓): 큰 고을마다 하나. 포주가 노예 시장에서 사람을 들여 기녀로 앉히고, 손님은 술상과 가무를 산다
// 할 수 있는 것: 술상 들이기(금창약 채움, 소문), 기녀와 이야기, 기녀의 몸값을 치러 빼내기(풀어 주거나 집 하인으로),
// 도망친 기녀를 잡아다 주고 현상금을 받거나 노자를 쥐여 놓아주기. 노예 시장에는 포주 수하가 사람을 사러 나와 있다
import { G, Sound, toast, josa, pick } from './core.js';
import { say, narr, choice } from './ctx.js';
import { WHO } from './dialog.js';
import { ART } from './core.js';

const S = () => G.S, PA = 'giru_pimp';  // 포주 그림 이름(assets/art/giru_pimp_n.webp가 들어오면 그 그림으로 나온다)
// 고을마다 기루 이름과 포주
export const GIRU = {
  yeongyeong: ['취월루', '금 대인'], nakyang: ['모란각', '방 행수'], changan: ['화청루', '두 대인'], seongdo: ['부용각', '탁 행수'], guangzhou: ['해월루', '엽 대인'], suzhou: ['청파각', '심 행수'],
};
// 기녀: [기명, 도트, 그림 이름, 사연과 말(돌아가며), 몸값 배수]. 모두 스무 살 넘은 어른
const GIRLS = [
  ['홍매', 'Gisaeng', 'giru_hongmae', ['열아홉에 팔려 왔으니 올해로 오 년째예요. 가야금은 그동안 늘었어요. 다른 건 줄었고요.', '손님들은 제 노래를 듣는 척하면서 서로 눈치를 봐요. 노래는 저 혼자 들어요.', '아버지 노름빚이 저였대요. 아버지는 그 뒤로 노름을 끊었다고 들었어요. 비싼 값에 끊은 셈이죠.'], 1.2],
  ['월향', 'Gisaeng2', 'giru_wolhyang', ['춤은 어머니한테 배웠어요. 어머니도 여기서 추셨대요.', '술은 따르기만 해요. 마시면 행수가 장부에 적거든요. 제 장부에.', '시 지을 줄 아는 손님이 오면 좋아요. 대개는 시 아는 척하는 손님이 와요.'], 1],
  ['소옥', 'Gisaeng3', 'giru_soak', ['강남 배 위에서 노래하다가 배째로 팔렸어요. 배는 지금 누가 타고 있으려나.', '여기 사람들은 제 사투리를 귀엽다고 해요. 귀여워서 값이 올랐대요.', '빚이 얼마 남았는지 물어보면 행수가 매번 다르게 말해요. 그래서 이제 안 물어요.'], 1],
  ['연화', 'Gisaeng', 'giru_yeonhwa', ['노예 시장에서 왔어요. 거기보다는 여기가 따뜻해요. 그게 위로가 되는 게 슬퍼요.', '칼 찬 손님은 무서워요. 칼 안 찬 손님은 더 무서워요. 뭘 숨겼는지 모르니까.', '글을 배우고 싶어요. 장부를 읽을 수 있게.'], .9],
  ['채운', 'Gisaeng2', 'giru_chaeun', ['저는 비파를 타요. 손가락이 굳으면 끝이라 겨울이 싫어요.', '여기선 웃는 게 일이에요. 그래서 쉬는 날엔 안 웃어요.', '언젠가 강호에 나가 보고 싶어요. 칼 대신 비파를 메고요.'], 1.1],
  ['난주', 'Gisaeng3', 'giru_nanju', ['관기였다가 관아가 망해서 여기로 넘어왔어요. 주인만 바뀌었죠.', '손님들 얘기를 들으면 강호 소식은 다 알아요. 그게 제 유일한 재산이에요.', '행수가 저를 제일 아껴요. 제일 비싸니까요.'], 1.4],
];
const BOSS = {
  talk: ['손님, 우리 집은 술과 가무를 파오. 그 이상은 손님 주머니 사정이고.', '애들 몸값이 궁금하오? 다 장부에 있소. 장부는 거짓말을 안 하지. 내가 적었으니까.', '노예 시장에 우리 사람이 나가 있소. 쓸 만한 애가 들어오면 먼저 데려오지.'],
  lore: ['이 바닥은 간단하오. 빚진 집이 딸을 보내고, 딸은 빚을 갚고, 빚은 줄지 않소. 이자라는 게 있으니까.', '관아도 우리 집 단골이오. 그러니 칼 찬 손님도 여기선 얌전하시오.', '도망치는 애들이 가끔 있소. 다 잡혀 오오. 이 성 안에서 기녀 얼굴 모르는 사람이 없거든.', '노예상한테 사는 게 싸오. 근데 노예상한테 산 애들은 웃는 걸 가르치는 데 오래 걸리오.'],
  run: '{g} 밤사이 담을 넘었소. 성 안 어딘가에 숨었을 거요. 찾아다 주면 은자 {v}냥 드리지.',
  back: '잡아 왔구려. 약속한 은자요. 장부에 또 한 줄 늘겠군.',
  lost: '{g}가 끝내 안 돌아왔소. 누가 도와줬다는 말이 있던데. 손님은 아니겠지?',
  freed: '몸값만 맞으면 데려가시오. 장부에서 이름 하나 지우면 그만이오.',
};
const GUEST = ['한 곡 더!', '여기 술 한 병!', '오늘은 내가 내지.', '저 아이 가야금 소리 좋군.', '쉿, 춤 시작하오.'];
const MOOK = { barks: ['젊고 일 잘할 사람 있소?', '행수 어른 심부름이오. 둘만 데려가면 되오.', '값 깎아 주면 단골 되지.'], talk: ['기루에서 나왔소. 행수 어른이 사람이 모자라다 해서.', '여기서 사 가는 애들이 우리 집에선 제일 오래 버티오. 갈 데가 없으니까.'] };

// ── 지도: 기루 안 ──
export function giruRoom(m) {
  m.carpet = [5, 3, 4, 5];
  m.put('screen', 5.25, .55).put('f_scroll', 2, 1).put('f_scroll', 11, 1).put('counter', 10, 2).put('lantern', 1, 2).put('lantern', 12.5, 2).put('lantern', 1, 7).put('lantern', 12.5, 7)
    .put('longtable', 1.5, 6).put('teapot', 3, 6).put('longtable', 9, 6).put('teapot', 10.5, 6).row('stool', 1.5, 5, 3, 1).row('stool', 9, 5, 3, 1).put('f_bonsai', 1, 8.6).put('plant', 12, 8.6);
}
// ── 사람들 ──
const girlsOf = city => { let h = 0; for (const c of city) h = h * 31 + c.charCodeAt(0) & 65535; const a = [...GIRLS.keys()], out = []; while (out.length < 3) out.push(a.splice(h % a.length, 1)[0]), h = h * 7 + 3 & 65535; return out; };
const gone = (city, k) => !!S().flags[`giru_out_${city}_${k}`];
const price = k => Math.round((260 + S().lv * 22) * GIRLS[k][4]);
function npcSay(name, spr, text, art) { WHO._npc = { name, face: spr, art: art && ART.get(art + '_n') ? art : undefined }; return say('_npc', text); }
const LINE = new Map(); const next = (k, L) => { const i = LINE.get(k) || 0; LINE.set(k, i + 1); return L[i % L.length]; };
const pay = async n => { if (S().silver >= n) { S().silver -= n; return true; } await say(null, '주머니가 모자란다.'); return false; };
// 도망: 하루에 한 번 고을마다 굴린다. 사흘 안에 찾지 못하면 기루 사람들이 찾아낸다
function runaway(city) {
  const f = S().flags, r = f.giru_run; if (r && r.city === city && S().day - r.day > 3) { f.giru_run = null; f.giru_lost = city; }
  if (f.giru_run || S().daily['giru_roll_' + city]) return f.giru_run; S().daily['giru_roll_' + city] = 1;
  const L = girlsOf(city).filter(k => !gone(city, k)); if (L.length && Math.random() < .12) f.giru_run = { city, k: pick(L), day: S().day, asked: 0 };
  return f.giru_run;
}
export function giruNpcs(l, id, out) {
  const city = l.id, [house, boss] = GIRU[city] || ['기루', '행수'], run = runaway(city), L = girlsOf(city);
  out.npcs.push({ id: 'pimp', spr: 'Pimp', x: 10.6, y: 3.6, dir: 0, hint: `${house} 포주 ${boss}`, barks: ['어서 오시오!', '오늘 가야금 좋소.', '자리 있소, 자리!'], gap: [8, 14], talk: () => bossTalk(l, house, boss) });
  const at = [[3.2, 4.4], [7, 2.8], [10.2, 7.6]];
  L.forEach((k, i) => { if (gone(city, k) || (run && run.city === city && run.k === k)) return; const [n, spr, art, lines] = GIRLS[k]; out.npcs.push({ id: 'gi' + i, spr, x: at[i][0], y: at[i][1], dir: 0, life: 'still', lively: 1, hint: `기녀 ${n}`, barks: ['…', '한 곡 청하시겠어요?', '오늘 손님이 많네요.'], gap: [10, 18], talk: () => girlTalk(l, k) }); });
  [[2.4, 5.8, 'Villager3'], [9.6, 5.8, 'Greenman']].forEach(([x, y, spr], i) => out.npcs.push({ id: 'gg' + i, spr, x, y, dir: 0, life: 'still', lively: 1, hint: '술손님', barks: GUEST, talk: () => npcSay('술손님', spr, pick(['돈 쓰러 왔으면 조용히 쓰시오.', '저 아이 노래 한번 들어 보시오. 내 돈 아깝지 않소.', '강호 사람이오? 여기선 칼 얘기 마시오. 흥 깨지니까.'])) }));
}
// 도망친 기녀: 고을 동쪽 골목에 숨어 있다(js/base.js의 고을 사람들 사이에 끼운다)
export function runawayNpc(l, out) {
  const r = S()?.flags.giru_run; if (!r || r.city !== l.id) return; const [n, spr, art] = GIRLS[r.k];
  out.npcs.push({ id: 'runaway', spr, x: 53.5, y: 34.6, dir: 1, life: 'still', hint: '숨어 있는 여자', talk: () => runTalk(l, r) });
}
async function bossTalk(l, house, boss) {
  const s = S(), city = l.id, f = s.flags, r = f.giru_run, who = `포주 ${boss}`, v = 100 + s.lv * 6;
  if (f.giru_lost === city) { f.giru_lost = null; await npcSay(who, 'Pimp', BOSS.lost.replace('{g}', '그 아이'), PA); }
  if (r && r.city === city && !r.asked) { r.asked = 1; await npcSay(who, 'Pimp', BOSS.run.replace('{g}', josa(GIRLS[r.k][0], '이/가')).replace('{v}', v), PA); }
  else await npcSay(who, 'Pimp', next('boss' + city, BOSS.talk), PA);
  const L = girlsOf(city).filter(k => !gone(city, k) && !(r && r.city === city && r.k === k));
  const o = ['술상을 들인다 (은자 40냥)', ...(L.length ? ['기녀의 몸값을 묻는다'] : []), '이 바닥 이야기를 듣는다', '그만둔다'], c = await choice(`${house}의 포주다.`, o);
  if (o[c].startsWith('술상')) {
    if (!await pay(40)) return; s.potion = Math.max(s.potion, s.potionMax);
    await narr(`${house}의 기녀들이 가야금을 뜯고 춤을 춘다. 술이 몇 순배 돌았다. 금창약도 채웠다.`);
    const n = (s.fr?.news || [])[0]; if (n) await say(null, `옆자리 손님이 흘린 말: "${n.replace(/^\d+일: /, '')}"`);
  }
  if (o[c] === '기녀의 몸값을 묻는다') {
    const k2 = await choice('누구의 몸값을 물을까?', [...L.map(k => `${GIRLS[k][0]} (은자 ${price(k)}냥)`), '그만둔다']); if (k2 >= L.length) return; const k = L[k2], g = GIRLS[k];
    const c2 = await choice(`${g[0]}의 몸값 은자 ${price(k)}냥을 치를까?`, ['치른다', '그만둔다']); if (c2 || !await pay(price(k))) return;
    Sound.sfx('coin'); await npcSay(who, 'Pimp', BOSS.freed, PA); f[`giru_out_${city}_${k}`] = 1;
    const res = await G.slave.bought([g[0], g[1], g[3][0], 'f']);
    if (res === 'free') { await npcSay(g[0], g[1], pick(['…정말요? 장부에서 제 이름이 지워졌어요?', '고향에 편지부터 쓸래요. 글은 몰라도 누가 대신 써 주겠죠.', '이 은혜는 꼭 갚을게요. 어떻게 갚을지는 걸으면서 생각할게요.']), g[2]); if (s.fr) s.fr.fame += 4; }
    G.field.refresh();
  }
  if (o[c] === '이 바닥 이야기를 듣는다') await npcSay(who, 'Pimp', next('lore' + city, BOSS.lore), PA);
}
async function girlTalk(l, k) {
  const [n, spr, art, lines] = GIRLS[k]; await npcSay(`기녀 ${n}`, spr, next('girl' + l.id + k, lines), art);
  const c = await choice(`기녀 ${n}`, ['술 한 잔 받으며 강호 소문을 묻는다 (은자 10냥)', '그만둔다']);
  if (c === 0 && await pay(10)) { const N = (S().fr?.news || []).slice(0, 4); await npcSay(`기녀 ${n}`, spr, N.length ? `손님들이 그러던데요. "${pick(N).replace(/^\d+일: /, '')}"` : pick(['요즘은 조용해요. 손님들이 칼 얘기를 덜 해요.', '관아 사람들이 요즘 자주 와요. 뭔가 찾는 눈치예요.', '강 건너 수로채 배가 늘었대요. 뱃사람 손님이 그랬어요.']), art); }
}
async function runTalk(l, r) {
  const s = S(), [n, spr, art] = GIRLS[r.k], v = 100 + s.lv * 6, [house] = GIRU[l.id] || ['기루'];
  await npcSay(n, spr, pick([`…${house} 사람이에요? 아니죠? 아니라고 해 주세요.`, '쉿. 조금만 숨어 있으면 성문이 열려요. 그때까지만요.', '돌아가면 다리를 부러뜨린대요. 그래도 돌아가는 게 나을까요?']), art);
  const c = await choice(`${house}에서 도망친 ${n}이다.`, [`${house}로 끌고 간다 (현상금 은자 ${v}냥)`, '노자를 쥐여 성 밖으로 보낸다 (은자 30냥)', '못 본 척한다']);
  if (c === 0) {
    s.silver += v; s.flags.giru_run = null; Sound.sfx('coin'); if (s.rep) s.rep.jeong = Math.max(0, (s.rep.jeong || 0) - 2); if (s.fr) s.fr.infamy = Math.min(100, (s.fr.infamy || 0) + 4);
    await narr(`${n}의 팔을 잡아 ${house}까지 데려갔다. 포주가 은자 ${v}냥을 세어 주었다.`); await npcSay('포주', 'Pimp', BOSS.back, PA); G.jh?.news?.(`${s.name}, 도망친 기녀를 ${house}에 넘기다.`);
  }
  if (c === 1) {
    if (s.silver < 30) { await say(null, '주머니가 모자란다.'); return; } s.silver -= 30; s.flags.giru_run = null; s.flags[`giru_out_${l.id}_${r.k}`] = 1; if (s.fr) s.fr.fame += 5;
    await npcSay(n, spr, pick(['…이름도 안 물어보고요? 그럼 제 진짜 이름을 알려 드릴게요. 아니, 다음에 만나면요.', '살면서 은혜 갚을 날이 오면 좋겠어요. 꼭 그날까지 살게요.']), art); await narr(`${n}이 새벽 성문 쪽으로 사라졌다.`);
  }
  G.field.refresh();
}
// 노예 시장의 포주 수하
export function mookNpc(l, out) { if (!GIRU[l.id]) return; out.npcs.push({ id: 'giru_mook', spr: 'DarkNinja', x: 55.2, y: 10.2, dir: 2, life: 'still', hint: `${GIRU[l.id][0]} 사람`, barks: MOOK.barks, gap: [9, 15], talk: () => npcSay(`${GIRU[l.id][0]} 사람`, 'DarkNinja', pick(MOOK.talk)) }); }
