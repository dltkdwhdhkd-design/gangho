// 이야기 시기에 맞춰 강호 곳곳에서 벌어지는 일. 안 가도 이야기는 간다. 가 보면 전쟁 밑바닥이 보인다
import { G, Sound } from './core.js';
import { Story, ctx, say, narr, choice } from './ctx.js';
import { WHO } from './dialog.js';
import { FOES } from './foes.js';
import { learn } from './state.js';

const S = () => G.S, F = () => G.S.flags;
const partNo = () => +(String(S().chapter || '').match(/^제(\d+)부/) || [])[1] || 0;
Object.assign(WHO, { uncheong: { name: '운청', face: 'Greenman' } });
FOES.wang_ally = { ...FOES.disciple, name: '왕충', hp: 900, atk: 22, boss: 0 };
const crew = (id, lv, n) => G.jh.crew(G.free.fac(id), lv, n);
async function tofu() {
  await narr('산문 아래 장터가 비어 있었다. 두부 파는 노파만 혼자 좌판을 지키고 있었다.');
  await say('gomom', '총각이구먼. 밥은 먹고 다니냐.');
  await say('me', '네. 장사는 좀 되세요?');
  await say('gomom', '살 사람이 없어. 젊은 것들이 다 끌려갔거든. 외문 애들도 쉰 명 다 갔어. 위에서 사람을 내라고 했다나. 우리 아들이 말렸는데도 소용없었대.');
  await say('gomom', '그 왜, 마른 애 있잖아. 석두. 나한테 두부 외상을 달아 놓고 갔어. 돌아와서 갚겠다고.');
  await say('gomom', '장강 나루 쪽에 있다는구먼. 지나는 길이면 이것 좀 전해 줘. 식어도 먹을 만은 할 거여.');
  await narr('두부 네 모를 받았다. 보자기가 따뜻했다.');
  ctx.note('두부 노파: 창운문 외문 제자들이 징발돼 장강 나루 막사에 있다. 석두에게 두부를 전해 달라고 했다.');
}
async function frontline() {
  await narr('장강 나루 근처에 막사가 늘어서 있었다. 맨 앞줄, 강에 제일 가까운 막사에 창운문 옷을 입은 사람들이 앉아 있었다. 갑옷은 없었다.');
  await narr('저 자리를 안다. 제일 먼저 화살이 오는 자리다. 손이 나도 모르게 허리께로 갔다.');
  await say('wangchung', '너는… 그 점소이.');
  await narr('왕충이었다. 신발이 진흙투성이였고 볼이 쑥 들어가 있었다.');
  await say('me', '왜 외문이 앞줄에 있어요?');
  await say('wangchung', '문파 크기대로 줄을 세웠다더군. 내문은 뒤에 있다.');
  await say('me', '사형은 내문이잖아요.');
  await say('wangchung', '내가 내 발로 왔다. 우리 집 쌀 먹은 놈들이니까. 아버지가 보낸 쌀을 여기서 풀고 있어. 곧 군량을 빼돌렸다고 잡혀가겠지.');
  await narr('석두는 막사 구석에서 신발을 깁고 있었다. 남의 신발이었다. 두부 보자기를 건넸다.');
  await say('seokdu', '식었네요. 맛있어요.');
  await say('jangpal', '형씨! 여긴 어쩐 일이어유. 아이고, 살이 빠졌네유. 나는 쪘어유. 왕 사형이 쌀을 풀어서유.');
  await narr('그날 밤 강 건너에서 횃불이 올라왔다. 소리가 먼저 왔고, 화살은 그다음에 왔다.');
  await ctx.duel({ foes: G.free.group('pirate', Math.max(S().lv, 18), 3), allies: ['wang_ally'], arena: 'village', title: '야습', bgm: 'fight', optional: true, noIntro: true });
  await narr('야습은 짧았다. 동이 트고 앞줄 막사에서 사람을 세어 보니 열둘이 없었다.');
  await narr('석두는 막사 뒤 진흙에 엎드려 있었다. 손에 신발 한 짝을 쥐고 있었다. 뒤축이 단단하게 기워져 있었다.');
  await say('jangpal', '어젯밤에 석두가 그랬어유. 형씨 신발 뒤축 안 터졌느냐고유.');
  await narr('내 신발을 내려다보았다. 뒤축은 멀쩡했다.');
  await say('wangchung', '남은 애들은 내가 데리고 간다. 어디로든. 순찰사한테는 다 죽었다고 적으라 할 거다.');
  await say('me', '명부에서 지워지는 거예요. 없던 사람이 돼요.', 's');
  await say('wangchung', F().jang_bond ? '안다. 장팔이 말하더군. 너도 그랬다며. 그래도 살아 있잖아.' : '안다. 그래도 살아 있는 게 낫지.');
  await narr('장팔과 왕충이 남은 사람들을 데리고 갈대밭으로 들어갔다. 장팔은 목검을 지팡이처럼 짚고 있었다. 새끼줄은 그대로였다.');
  await narr('석두는 내가 묻었다. 신발은 신겨 주었다. 어깨, 손목, 무릎을 차례로 바르게 놓아 주었다. 다른 건 해 줄 게 없었다.');
  ctx.rep('jeong', -1); ctx.note('장강 나루 앞줄 막사. 석두가 죽었다. 왕충과 장팔이 남은 사람들을 빼냈다.');
}
async function elder() {
  await say(null, '종남 제자: 서 장로님이 주무시다 돌아가셨습니다. 문은 안에서 잠겨 있었고 상처도 없습니다. 위에서는 심장병이라 합니다.');
  await narr('방을 살펴보았다. 들보 위 먼지에 손바닥 하나만 한 자국이 있었다. 베개를 들어 보니 은전 한 닢이 놓여 있었다.');
  await say('me', '이게 뭔지 알아요?');
  await say(null, '종남 제자: 혈의방이 일을 끝내면 남기는 표식이라는 말을 들었습니다. 아직 멀리 못 갔을 겁니다.');
  await narr('산문 뒤 비탈에서 발자국을 찾았다. 일부러 늦게 움직인 발자국이었다. 쫓아오라는 뜻이었다.');
  const f = G.free.fac('hyeoleui'); await ctx.duel({ foes: crew('hyeoleui', Math.max(S().lv, 20), 2), arena: 'forest', title: '혈의방 살수', bgm: 'fight', optional: true, noIntro: true });
  await narr('살수의 품에서 접힌 표가 나왔다. 값이 적혀 있고 그 옆에 인장이 찍혀 있었다. 정천맹 군수부 인장이었다.');
  await say('me', '이 사람 죽이라고 돈 낸 쪽이 우리 편이라는 건가.', 'a');
  await narr('서 장로는 지난달 회의에서 징발을 반대했다고 한다. 표를 품에 넣었다. 이 전쟁에서 편이라는 말이 점점 쓸모없어지고 있었다.');
  G.arts.drop('hyeoleui', 1); ctx.note('종남 서 장로 암살. 혈의방 살수의 품에 정천맹 군수부 인장이 찍힌 표가 있었다.');
}
async function dangWell() {
  await say('clan_dang', '오셨네요. 때를 잘못 고르셨어요. 지금 저 독 만드는 중이에요.');
  await say('me', '무슨 독요?');
  await say('clan_dang', '오독문이 우리 쪽 우물에 독을 풀었거든요. 애들이 셋 죽었어요. 어른들이 똑같이 해 주라네요. 오독문 마을 우물에.', 's');
  await say('clan_dang', '독은 제가 제일 잘 만들어요. 그래서 저한테 시킨 거죠. 그 마을에도 애들이 있다는 건 어른들도 알아요.', 's');
  const c = await choice('당소연이 작은 병을 흔들어 본다.', ['풀지 말라고 한다', '당신이 정할 일이라고 한다', '내가 대신 들고 가겠다고 한다']);
  if (c === 0) { await say('me', '풀지 마요.'); await say('clan_dang', '쉽게 말하네요. 그래도 말해 줘서 고마워요.', 's'); }
  else if (c === 1) { await say('me', '소연 씨가 정할 일이에요.'); await say('clan_dang', '다들 그렇게 말하고 가더라고요. 그쪽은 남아 있네요.', 'h'); ctx.love('clan_dang'); }
  else { await say('me', '제가 들고 갈게요. 무슨 일이 있어도 소연 씨 손으로 푼 건 아니게.'); await say('clan_dang', '바보예요? 그럼 그쪽 손으로 푼 게 되잖아요.', 'b'); await narr('당소연이 한참 나를 보다가 병을 뺏어 갔다.'); ctx.love('clan_dang'); }
  await narr('이튿날 새벽, 당소연과 오독문 마을 우물가까지 갔다. 그녀는 병을 기울였다. 투명한 액체가 우물로 들어갔다.');
  await say('me', '결국 넣었어요?');
  await say('clan_dang', '해독약이에요. 우리 우물에 풀린 독의. 저쪽 사람들도 자기네 독에 당하는 날이 올 테니까요.', 'h');
  await say('clan_dang', '어른들한테는 넣었다고 할 거예요. 넣긴 넣었잖아요.', 'h');
  await narr('돌아오는 길에 당가 감시자들이 뒤를 밟고 있었다는 걸 알았다. 당소연은 그쪽으로 작은 표창 하나를 던졌다. 나무에 박혔다. 맞히려 했으면 맞혔을 것이다.');
  ctx.note('당소연이 오독문 마을 우물에 해독약을 넣었다.');
}
async function cheongseong() {
  await narr('성도 성문 앞에 피난민이 줄을 서 있었다. 그 틈에서 젊은 도사 하나가 칼집을 두 손으로 안고 앉아 있었다. 칼을 찰 줄 몰라서가 아니라 찰 수가 없는 것 같았다. 한쪽 어깨가 없었다.');
  await say('uncheong', '청성파 운청입니다. 청성산은 사흘 만에 끝났습니다. 장문인께서 이걸 들고 가라고 하셨습니다. 저는 제일 어려서요. 칼도 제일 못 씁니다.');
  await say('uncheong', '뒤에서 쫓아오는 사람들이 있습니다. 이 칼을 찾습니다. 저는 죽어도 되는데 칼은 아미로 가야 합니다.');
  await narr('말이 끝나기 전에 피난민 줄 뒤쪽이 흩어졌다. 붉은 옷을 입은 사람들이 사람들 사이로 걸어오고 있었다. 뛰지 않았다.');
  await ctx.duel({ foes: crew('cheonma', Math.max(S().lv, 28), 3), arena: 'village', title: '성도 성문', bgm: 'fight', optional: true, noIntro: true });
  await say('uncheong', '고맙습니다. 저는 아미로 갑니다.');
  await say('me', '한 팔로 그 길을요?', 'b');
  await say('uncheong', '청성파가 이제 저 하나입니다. 제가 안 가면 청성은 없던 곳이 됩니다.');
  await narr('운청은 칼을 풀어 내 앞에서 한 번 뽑았다. 왼팔로 서툴게 초식 하나를 보였다. 솔바람처럼 가벼운 칼이었다.');
  await say('uncheong', '이것만은 누가 기억해 주십시오. 저는 칼을 제일 못 쓰니까 제가 쓰는 걸 보면 누구나 따라 할 수 있습니다.');
  if (!S().skills.includes('x_cheongseong1')) learn('x_cheongseong1');
  ctx.note('청성파 운청을 성도에서 만났다. 장문인의 칼을 들고 아미로 갔다.');
}
const K = 1.6, Q = [
  { id: 'tofu', part: [4, 5], map: 'cloudmt', x: 24, y: 30, spr: 'OldWoman', hint: '두부 파는 노파', run: tofu, where: '창운산 산문 아래' },
  { id: 'front', part: [4, 5], after: 'tofu', map: 'world', x: Math.round(505 * K), y: Math.round(448 * K), spr: 'GreenNinja', hint: '창운문 옷을 입은 사람들', run: frontline, where: '장강 나루' },
  { id: 'elder', part: [5, 6], map: 'b_jongnam', x: 16, y: 44, spr: 'BlueNinja', hint: '울고 있는 제자', run: elder, where: '종남파' },
  { id: 'dang', part: [5, 6], map: 'b_dang', x: 16, y: 44, spr: 'Dang', hint: '당소연', run: dangWell, where: '사천당가' },
  { id: 'cs', part: [7, 8], map: 'c_seongdo', x: 24, y: 28, spr: 'Greenman', hint: '칼집을 안은 도사', run: cheongseong, where: '성도' },
];
const open = () => { if (!G.S || S().mode === 'free' || !G.world?.open()) return []; const p = partNo(); return Q.filter(q => !F()['q_' + q.id] && q.part.includes(p) && (!q.after || F()['q_' + q.after])); };
Story.providers.push(id => ({ npcs: open().filter(q => q.map === id).map(q => ({ id: 'era_' + q.id, spr: q.spr, x: q.x, y: q.y, dir: 0, mark: () => true, hint: q.hint, talk: async () => { F()['q_' + q.id] = 1; await q.run(); G.field.refresh(); } })), spots: [], trigs: [], roam: [] }));
G.era = { open };
