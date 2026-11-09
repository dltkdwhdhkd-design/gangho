// 제4~5부 길별 장면: 흑도맹 수뇌, 도하 화공, 분타의 신도들, 수배 전단
import { G } from './core.js';
import { Story, ctx, say, narr, choice } from './ctx.js';
import { WHO } from './dialog.js';
import { at } from './story1.js';

const S = () => G.S, F = () => G.S.flags;
Object.assign(WHO, { believer: { name: '서역 신도', face: 'Woman' } });

async function guyangTalk() {
  await say('guyang', '왔냐. 마당 판 값 받으러 왔다.');
  await say('me', '얼마예요?');
  await say('guyang', '돈 말고. 저기 솥 좀 봐라.');
  await narr('솥에는 쌀겨에 나물을 넣고 끓인 죽이 들어 있었다. 아이를 업은 여자들이 줄을 서 있었다. 칼 찬 사람보다 그쪽이 훨씬 많았다.');
  await say('guyang', '칠십이채 식구가 딸린 입까지 치면 사만이다. 그중 칼 쥔 놈은 오천이고. 나머지는 밭 뺏기고 산으로 올라온 사람들이야. 정천맹은 이걸 산적 소굴이라고 부르지.');
  await say('me', '산적 맞잖아요.');
  await say('guyang', '맞지. 그러니 네가 털어 오는 쌀이 어디로 가는지나 알아 둬라.');
  F().sa_t1 = true;
}
async function ogangTalk() {
  await say('ogang', '물에서 만나면 빠뜨린다고 했지? 농담이다. 한 번 빠뜨려 보고 싶긴 하다만.');
  await say('me', '수적 때문에 나루 사람이 끌려간 적이 있어요.');
  await say('ogang', '그 일은 나도 들었다. 위충이 제멋대로 군 거야.');
  if (F().wei_spared) await say('ogang', '그래서 벌을 줬는데, 그놈이 너한테 빚졌다고 벌을 잘도 받더라. 희한한 놈을 살려 줬어.');
  else await say('ogang', '정천맹 옥에서 썩고 있으니 벌은 그걸로 됐고.');
  await say('ogang', '정천맹이 나루마다 받는 세금이 우리 뱃세의 곱절이다. 어차피 뜯기는 건 똑같아. 다른 점은 우리는 뜯고 나서 배가 뒤집히면 건져는 준다는 거지.');
  F().sa_t2 = true;
}
async function namhwaTalk() {
  await say('namhwa', '여기 술 마실 때는 조심해요. 저는 안 탔지만 누가 탔는지는 몰라요.');
  await say('me', '그런 농담이 재밌어요?', 'a');
  await say('namhwa', '농담 아니에요. 사마웅 형제 열둘이 죽은 날 강호 사람들이 제일 먼저 뭐라고 했는지 알아요? 오독문 독이라고 했어요. 제 사부님은 그 말 때문에 정천맹 옥에서 돌아가셨고요.');
  await say('me', '오독문 독이 아니었어요?');
  await say('namhwa', '입 안이 붉게 마르고 맥이 거꾸로 뛰는 독이요. 그런 건 저희도 못 만들어요. 어디서 나왔는지 짐작은 가는데 증거가 없어요.');
  await say('namhwa', '증거 찾으면 제일 먼저 알려 줘요. 사부님 무덤에 가서 읽어 드리게요.');
  ctx.note('남화: 사마웅 형제들을 죽인 독은 오독문 독이 아니다. 입 안이 붉게 마르고 맥이 거꾸로 뛴다.');
  F().sa_t3 = true;
}
async function manhwaTalk() {
  await say('manhwa', '소문 하나 드릴까요? 공짜로요.');
  await say('me', '공짜면 더 의심스러운데요.');
  await say('manhwa', '백랑이 잘 가르쳤네. 맹주 쪽 귀가 이 산채에 있어요. 수뇌 열둘 언저리예요. 여기서 나온 말이 사흘이면 구화성에 닿아요. 누군지는 아직 못 찾았고요.');
  await say('me', '그걸 왜 저한테 말해요?');
  await say('manhwa', '당신만 맹주한테 원한이 확실하니까요. 나머지는 값만 맞으면 어디로든 가는 사람들이고요. 저를 포함해서요.');
  F().sa_t4 = true;
}
export async function crossFire() {
  await narr('강 한복판까지는 조용했다. 그러다 양쪽 갈대밭에서 불화살이 한꺼번에 날아왔다. 물길도 날짜도 다 새 나간 뒤였다.');
  await say('lion', '배 붙여! 붙이면 다 탄다, 떼라! 야, 떼라고!');
  await ctx.duel({ foes: ['jeong_elite', 'jeong_elite', 'shadow2'], allies: ['samaung_ally'], arena: 'dock', bgm: 'boss', title: '불붙은 배', survive: 35, tip: '35초를 버티면 강을 건넙니다.' });
  await narr('날이 밝았을 때 삼백 척 가운데 아흔 척이 없었다. 강가로 밀려온 사람들을 건져 올리는 데 한나절이 걸렸다.');
  if (F().lion_debt) { await say('lion', '봐라. 왼팔이 안 올라간다. 도끼는 오른손으로 드니까 괜찮아.'); await say('yun', '안 괜찮아요. 앉아요.', 'a'); }
  else await narr('윤설은 강가에 앉아 붕대를 찢다가 나중에는 자기 치맛단을 찢기 시작했다.');
  await say('samaung', '내 뱃길을 아는 놈은 수뇌 열둘뿐이다.');
  await say('makgo', '찾았습니다.');
  await narr('막고가 사람 하나를 끌고 왔다. 산채에서 술상을 돌보던 늙은 집사였다. 삼십 년 전 사마웅이 굶어 죽게 된 걸 거둔 사람이라고 했다.');
  await say('samaung', '왜 그랬어.');
  await say('makgo', '아들이 구화성 옥에 있답니다.');
  await narr('사마웅은 한참 그 사람을 내려다보다가 칼을 내렸다.');
  await say('samaung', '네가 정해라. 나는 저 얼굴을 보고는 못 정하겠다.');
  const c = await choice('늙은 집사가 고개를 들지 못한다.', ['죗값을 치르게 한다', '내쫓는다']);
  if (c === 0) { await say('makgo', '…알겠습니다.'); ctx.rep('sa', 2); }
  else { await say('samaung', '쌀 한 말 줘서 내보내라. 다음에 보면 내가 벤다.'); await narr('그 뒤로 사마웅은 술상에서 술을 직접 따랐다.'); F().sa_mercy = true; ctx.rep('jeong', 1); }
}
async function believerTalk() {
  await narr('분타에는 칼 찬 사람보다 밥 짓는 사람이 더 많았다. 다들 볕에 탄 얼굴에 말소리가 달랐다.');
  await say('believer', '처음 오셨어요? 저희는 서역에서 왔어요. 가뭄이 든 해에 중원 상인들이 땅을 다 사 갔거든요.');
  await say('me', '교주가 깨어나면 뭐가 달라져요?');
  await say('believer', '다 같이 배불리 먹는대요. 천산에 물이 돌아오고요.');
  await say('me', '믿으세요?');
  await say('believer', '믿어야지요. 믿는 동안은 여기서 밥이 나오니까요.');
  F().ma_t1 = true;
}
async function altarTalk() {
  await narr('제단 그을음이 눈에 거슬려서 걸레를 빨아 왔다. 한참 닦고 있는데 혁련하가 뒤에 와 서 있었다.');
  await say('hyeok', '무엇을 하십니까.');
  await say('me', '더러워서요.');
  await say('hyeok', '이 제단은 천 년 동안 불로 닦은 것입니다.');
  await say('me', '그래서 안 닦이나 보네요.', 'h');
  await narr('혁련하는 아무 말 없이 옆에 앉더니 걸레 한 장을 집었다. 잡는 법을 몰라서 손가락 두 개로 들고 있었다.');
  await say('hyeok', '왼발로 민다고 들었습니다.');
  await say('me', '앉아서 닦을 때는 안 그래요.');
  await say('hyeok', '그렇습니까.');
  await narr('둘이서 해가 질 때까지 닦았는데 제단은 별로 깨끗해지지 않았다. 혁련하는 검게 물든 손을 한참 들여다보고 있었다.');
  ctx.love('hyeok'); F().ma_t2 = true;
}
export async function maAfter() {
  if (F().plague) {
    await say('hyeok', '청하진에서 서른 명이 앓고 있습니다. 혈마 님은 기뻐하십니다.');
    await say('me', '네.');
    await say('hyeok', '저는 어젯밤 향을 피웠습니다. 교리에 없는 향입니다. 누구에게 올리는 것인지는 저도 모르겠습니다.');
  }
}
async function wanted() {
  F().wanted = true;
  await narr('나루 기둥마다 내 얼굴이 붙어 있었다. 은자 오백 냥. 코가 실제보다 컸다. 삿갓을 눌러쓰고 지나가는데 평상에 앉은 사람들이 나를 보고 말을 멈췄다.');
  await say('town2', '저 삿갓 쓴 사람 말이야, 어디서 많이 봤는데.');
  await say('town', '못 봤네.');
  await say('town2', '아직 보지도 않았잖아요.');
  await say('town', '나는 눈이 나빠서 아무것도 못 봐. 그리고 이 사람아, 곽씨네 걸레질하던 놈이 역적이면 나는 정천맹주다.');
  await narr('뒤에서 종이 찢는 소리가 났다. 돌아보니 기둥에 붙은 내 얼굴이 하나씩 떼어져 아궁이로 들어가고 있었다.');
}
const job = o => ({ dir: 0, mark: () => true, ...o });
Story.providers.push(function part45(id) {
  const n = [], tr = [];
  if (id === 'fort' && at('sa2')) {
    if (!F().sa_t1) n.push(job({ id: 'guyang', spr: 'Caveman2', x: 13, y: 21, hint: '구양철', talk: guyangTalk }));
    if (!F().sa_t2) n.push(job({ id: 'ogang', spr: 'Villager3', x: 23, y: 19, hint: '오강', talk: ogangTalk }));
    if (!F().sa_t3) n.push(job({ id: 'namhwa', spr: 'Woman', x: 13, y: 17.5, hint: '남화', talk: namhwaTalk }));
    if (!F().sa_t4) n.push(job({ id: 'manhwa', spr: 'Woman', x: 23, y: 15, hint: '만화부인', talk: manhwaTalk }));
  }
  if (id === 'shrine' && at('ma2')) {
    if (!F().ma_t1) n.push(job({ id: 'believer', spr: 'Woman', x: 3, y: 8, hint: '신도에게 말 걸기', talk: believerTalk }));
    if (!F().ma_t2) n.push(job({ id: 'altar', stamp: 'pot', spr: '', x: 10, y: 6, hint: '제단 닦기', talk: altarTalk }));
  }
  if (id === 'cheongha' && at('jg1', 'fr1') && !F().wanted) tr.push({ x: 15, y: 18, w: 16, h: 10, when: () => !F().wanted, run: wanted });
  return { npcs: n, spots: [], trigs: tr, roam: [] };
});
