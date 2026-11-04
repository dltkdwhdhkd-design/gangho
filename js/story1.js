// 프롤로그와 1장: 청하진
import { G, Sound, fadeTo, wait, toast, $ } from './core.js';
import { Story, ctx, say, narr, choice } from './ctx.js';
import { learn } from './state.js';
import { WEAPONS } from './data.js';

const S = () => G.S, F = () => G.S.flags, step = () => G.S.flags.step || 'p0', set = v => { G.S.flags.step = v; };
const at = (...a) => a.includes(step());
const after = v => ORDER.indexOf(step()) >= ORDER.indexOf(v);
const ORDER = ['p0', 'p0a', 'p1', 'p2', 'p3', 'p4', 'p5', 'c1a', 'c1b', 'c1c', 'c1d', 's1', 's2', 's3', 's4', 'c1e', 'c1f', 'c1g', 'c1h', 'c2a', 'c2b', 'c2c', 'c2d', 'c2e', 'c2f', 'c2g', 'c2h', 't1', 't2', 't3', 't4', 't5', 'c3a', 'c3b', 'c3c', 'c3d', 'c3e', 'c3f', 'c3g', 'c4a', 'sa1', 'sa2', 'ma1', 'ma2', 'c4b', 'c4c', 'c4d', 'c4e', 'end'];
export { step, set, at, after };
G.after = after;
const overBlack = on => $('#dialog').classList.toggle('over', on);

Story.scenes.opening = async () => {
  overBlack(true); Sound.bgm('dark');
  await narr('내가 다섯 살 때 전쟁이 났다. 북쪽 변경에 있던 우리 마을은 하룻밤 사이에 불탔고, 부모님도 그날 돌아가셨다.');
  await narr('갈 데가 없어서 군막을 따라다녔다. 애를 거둬 주는 사람은 없었지만 쫓아내는 사람도 없었다. 말똥을 치우고 시체 나르는 일을 거들면 남은 밥을 조금 얻어먹을 수 있었다.');
  await narr('일곱 살이 되던 해에 견대(犬隊)로 끌려갔다. 전쟁고아들을 모아 만든 척후대였는데, 거기서는 이름 대신 번호로 불렸다. 적진에 먼저 들어가서 화살이 어디서 날아오는지 알아내는 게 우리 일이었다. 병사들은 우리를 그냥 개새끼들이라고 불렀다.');
  await narr('팔백 명이던 견대는 내가 열일곱이 됐을 때 서른 명이 남아 있었다. 마지막 임무는 적의 보급기지를 치는 것이었는데, 가 보니 보급기지는 없고 매복만 있었다. 살아서 돌아온 건 나 하나뿐이었다.');
  await narr('돌아와 보니 나는 동료를 버리고 도망친 놈이 되어 있었다. 얼마 뒤 휴전이 맺어지자 군은 견대를 없던 일로 했고, 내 이름도 군적에서 지워졌다. 열여덟 살이었다. 손에 남은 건 이 빠진 칼 한 자루가 전부였다.');
  await narr('그 뒤로 두 해를 떠돌았다. 상단 호위도 서고 빚도 대신 받아 주면서 그날그날 먹을 돈을 벌었다. 세상은 그렇게 사는 놈들을 낭인이라고 불렀다.');
  await narr('스무 살이 된 봄에 청하진이라는 나루에서 배를 내렸다. 사흘째 아무것도 못 먹은 참이었다.');
  overBlack(false); Sound.bgm('village'); await fadeTo(0);
  set('p0a'); ctx.goal('마을 위쪽 달맞이 객잔에서 밥 먹기 (WASD 이동)');
};
export async function firstMeal() {
  await say('gwak', '어서 와. 칼 찬 손님은 돈부터 내고 앉아.');
  await say('me', '국수 한 그릇 주십시오.');
  await narr('국수가 나오자마자 국물까지 다 비웠다. 그러고 나서 주머니를 뒤져 보니 동전이 네 닢뿐이었다. 국수는 한 그릇에 열 닢이었다.');
  await say('gwak', '왜, 돈이 없어? 아이고, 어쩐지 먹는 꼴이 심상치 않더라니.');
  await say('me', '칼을 맡기겠습니다.');
  await say('gwak', '칼? 어디 봐. …이거 군용이잖아. 너 어디서 왔어?');
  await say('me', '북쪽에서 왔습니다.');
  await say('gwak', '나이는?');
  await say('me', '스물입니다.');
  await narr('아주머니는 내 얼굴을 한참 들여다보더니 고개를 기울여 귀 뒤쪽을 봤다. 그러다 들고 있던 국자를 바닥에 떨어뜨렸다.');
  await say('gwak', '아이고, 손에 기름이 묻어서. 칼은 내가 갖고 있을 테니까 모자란 여섯 닢어치 일하고 찾아가. 걸레는 저기 있어.');
  await say('me', '반나절이면 되겠습니다.');
  await say('gwak', '뭐가 반나절이야? 먹고 자는 건 공짜냐?');
  await fadeTo(1); overBlack(true); G.field.load('inn', 8, 8, 1);
  await narr('반나절이 어쩌다 한 달이 됐는지는 나도 모르겠다. 칼은 아직 못 찾았고, 동네 사람들은 나를 점소이라고 부른다.');
  overBlack(false); await fadeTo(0);
  await say('gwak', '{나}! 너 거기서 뭐 해! 해가 중천이야!');
  await say('me', '바닥을 닦았습니다.');
  await say('gwak', '닦긴 뭘 닦아? 저 번들거리는 것 좀 봐. 손님 자빠지면 네가 물어낼 거야?');
  await say('gwak', '그리고 구석방 백 영감 말이야, 오늘은 방값 좀 받아 와. 벌써 석 달 치 밀렸어.');
  await say('me', '어르신은 제가 갈 때마다 걸레질만 나무라십니다.');
  await say('gwak', '나무라든 말든 돈만 받아 오면 되잖아. 얼른 가!');
  set('p1'); ctx.goal('구석 자리의 백 노인에게 방값 받기');
}
async function baekFirst() {
  await say('baek', '또 왔느냐.');
  await say('me', '밀린 방값 받으러 왔습니다, 어르신.');
  await say('baek', '방값은 나중에 하고. 너 아까 보니까 또 허리 구부리고 닦더구나.');
  await say('baek', '허리 세우고, 왼발로 밀고, 오른발은 슬슬 따라오게 두라고 내가 어제도 말했지 않느냐.');
  await say('me', '그렇게 하면 바닥이 안 닦입니다.');
  await say('baek', '이놈아, 바닥이 문제냐. 됐다. 말대꾸할 기운 있으면 뒤뜰에 가서 장작이나 패 와라.');
  await say('baek', '세 더미만 패 오면 방값 얘기는 들어 주마.');
  await say('me', '돈 받으러 왔다가 일만 늘었네.');
  await ctx.duel({ foes: ['log', 'log', 'log'], arena: 'yard', title: '장작 패기', bgm: 'peaceful', tip: '<b>W A S D</b> 이동, <b>J</b> 평타. J를 이어서 누르면 연달아 벱니다.' });
  await say('gwak', '장작은 잘 패네. 그래서 돈은?');
  await say('me', '내일 주신답니다.');
  await say('gwak', '석 달째 내일이다, 내일. 들어가서 쉬어. 내일 심부름 많아.');
  set('p3'); ctx.goal('곽 아주머니에게 심부름 받기');
}
export async function evening() {
  await narr('저녁이 되자 객잔에 뱃사람들이 몰려들었다.');
  await say('rowdy', '야, 점소이! 이게 술이냐, 물이냐!');
  await say('me', '물입니다. 술은 아직 주문하지 않으셨습니다.');
  await say('rowdy', '이 새끼가 누굴 놀려? 오늘 술값 안 낸다, 어쩔래!');
  await say('gwak', '{나}야, 저 손님들 밖으로 좀 내보내라.');
  await say('me', '칼을 주시면 바로 끝내겠습니다.');
  await say('gwak', '미쳤어? 여기가 군막이냐? 사람 죽이지 말고 쟁반이나 들고 가.');
  learn('tray');
  await ctx.duel({ foes: ['rowdy', 'rowdy'], arena: 'yard', title: '왈패 소동', tip: '<b>U</b> 쟁반 던지기. <b>L</b> 막기: 노란 예고가 뜨면 누르세요. 맞기 직전에 누르면 <b>튕겨내기</b>가 됩니다.' });
  await narr('그날 밤 처마 밑에서 바람을 쐬고 있는데 백 노인이 옆에 와 앉았다.');
  F().night = true; G.field.load('cheongha', 22.5, 13, 1);
  await say('baek', '쟁반으로 왈패를 내쫓는 놈은 내 평생 처음 본다.');
  await say('me', '보셨습니까. 그럼 방값은…');
  await say('baek', '막는 걸 보니까 제법이더구나. 걸레질이 헛것은 아니었어.');
  await say('me', '예?');
  await say('baek', '저 달 좀 봐라. 저렇게 가늘어도 며칠만 지나면 차오르는 거다.');
  await say('me', '많이 드셨습니다, 어르신.');
  await say('baek', '허허, 그런가. 방값은 내일 꼭 주마.');
  F().night = false; G.field.load('inn', 8, 8, 1);
  set('p4'); ctx.goal('구석 자리의 백 노인 찾아가기');
}
export async function lastMorning() {
  await narr('다음 날 아침에 구석방에 가 보니 백 노인이 없었다. 탁자 위에 낡은 목검 한 자루와 찢어진 종이 한 장만 놓여 있었다.');
  F().night = false; G.field.load('inn', 13, 8, 1);
  await say('me', '결국 도망갔네. 이건 뭐지? 책에서 찢어 낸 건가.');
  await say('gwak', '방값은 받았… 잠깐, 그 종이 어디서 났어?');
  await say('me', '백 어르신이 두고 갔습니다. 글자가 있는데 못 읽겠습니다.');
  await say('gwak', '…….');
  await say('gwak', '오늘은 일찍 닫자. 그건 품에 넣어 두고 아무한테도 보이지 마. 알았어?');
  await say('me', '방값 얘기를 안 하시네요. 어디 편찮으십니까?');
  await say('gwak', '잔말 말고 문이나 닫아!');
  await narr('그날 밤, 지붕 위에서 기왓장 밟는 소리가 났다.');
  F().night = true; G.field.load('cheongha', 22.5, 13.4, 0);
  Sound.bgm('dark');
  await say('shadow', '노인이 두고 간 물건을 내놓아라.');
  await say('me', '방값이라면 저희도 못 받았습니다.');
  await ctx.duel({ foes: ['shadow0', 'shadow0'], arena: 'yard', bgm: 'fight', title: '흑의인', tip: '<b>K</b> 경공: 잠깐 빠르게 움직이고 그동안 맞지 않습니다. 날아오는 비도나 <b>붉은 예고</b>는 피하세요.' });
  await say('me', '하아… 뭐야, 이놈들. 군인은 아닌데.');
  await say('shadow', '점소이치고는 제법이구나. 그래 봐야…');
  await say('gwak', '남의 집 마당에서 뭐 하는 짓들이야?');
  await narr('곽 아주머니가 국자로 흑의인의 목덜미를 내리쳤다. 그 한 방에 흑의인이 소리도 못 내고 쓰러졌다.');
  await say('me', '아주머니, 방금 그건…');
  await say('gwak', '나중에 얘기해! 강 쪽으로 뛰어! 뒤돌아보지 말고!');
  await say('fox', '오랜만이오, 곽 호법. 십칠 년이나 숨어 살았으면 이제 그만할 때도 됐지.');
  await say('gwak', '{나}! 뭐 해, 뛰라니까!');
  await say('me', '혼자 두고 못 갑니다!');
  await ctx.duel({ foes: ['fox0'], arena: 'yard', bgm: 'boss', title: '여우 가면', survive: 16, tip: '이길 수 없는 상대입니다. 16초를 버티세요.' });
  await say('fox', '이 아이인가. 아직 덜 여물었군.');
  await narr('아주머니가 쓰러지는 게 보였다. 그러다 등에 뭔가를 세게 맞았는데, 그다음은 차가운 강물밖에 기억나지 않는다.');
  await fadeTo(1); F().night = false; F().burned = true; set('c1a');
  G.field.load('clinic', 9.2, 7.6, 3); await fadeTo(0);
  await say('yun', '정신이 들어요? 물을 어찌나 먹었는지 한참 토했어요.');
  await say('me', '여기가 어딥니까.');
  await say('yun', '약방이요. 갈대밭에 걸려 있는 걸 끌고 왔어요. 등에 흉터가 왜 그렇게 많아요? 대체 어디서 뭘 하다 온 거예요?');
  await say('me', '곽 아주머니는 어떻게 됐습니까.');
  await say('yun', '객잔은 반쯤 탔고 아주머니는 안 보여요. 검은 옷 입은 사람들이 데려갔다는 말이 있고요.');
  await say('me', '찾으러 가겠습니다.');
  await say('yun', '일어나지도 못하면서요? 그보다 품에 있던 종이 좀 봐요. 강에 빠졌는데 하나도 안 젖었어요.');
  F().met_yun = true;
  await narr('제1부 · 객잔의 낭인\n\n타다 남은 객잔');
  ctx.goal('불탄 객잔을 살펴보고, 나루터의 뱃사공에게 묻기');
  ctx.note('곽 아주머니는 검은 옷의 무리에게 끌려갔다. 여우 가면이 아주머니를 “곽 호법”이라고 불렀다.');
  ctx.note('마을에서 할 수 있는 일: 복덕방에서 집 사기, 뱃사공에게 낚싯대 얻기, 서쪽 청풍골에서 사냥과 벌목, 대장간과 약방에서 제작, 떠돌이 비무객과 겨루기.');
}

async function c1Inn() {
  await say('me', '아주머니 방이다. 장부는 멀쩡하네.');
  await say(null, '내 이름 옆에 여섯 닢이라고 적혀 있고, 그 옆에 붉은 글씨로 ‘갚음’이라고 쓰여 있었다. 날짜는 내가 온 첫날이었다.');
  await say('me', '첫날? 그럼 나는 한 달 동안 뭘 한 거야.');
  await say(null, '서랍을 여니 내 칼이 들어 있었다. 이 빠진 데를 숫돌로 갈아 놓았다. 칼 밑에 다른 사람 글씨로 쓴 쪽지가 있었다.');
  await say(null, '“그믐마다 은자 다섯 냥. 아이를 찾는 데 쓰시오. 낙월.”');
  await say('me', '그믐에 온다던 그 봉투구나. 아이를 찾아? 아주머니한테 애가 있었나.');
  S().weapons.push('army_blade'); S().weapon = 'army_blade'; toast('이 빠진 군도를 되찾았다'); Sound.sfx('bonus');
  await say(null, '뒷문 쪽 우물에 쇠 뚜껑이 덮여 있다. 달 모양 구멍이 뚫려 있고 열리지 않는다.');
  ctx.note('아주머니 서랍의 쪽지: “그믐마다 은자 다섯 냥. 아이를 찾는 데 쓰시오. 낙월.”');
  ctx.note('장부에는 내 밥값이 첫날 이미 갚은 것으로 적혀 있었다.');
  ctx.note('객잔 우물 뚜껑에 달 모양 구멍이 있다. 맞는 것을 찾아야 한다.');
  F().c1inn = true; await checkClues();
}
async function checkClues() {
  if (F().c1inn && F().c1boat) {
    set('c1b'); ctx.goal('약방의 윤설에게 찢어진 종이를 보이기');
  }
}
async function yunPaper() {
  await say('yun', '그 종이 말인데요, 옛날 글씨체예요. 약방 고서에서 본 적이 있어서 조금 읽었어요.');
  await say('yun', '“월하칠식 제일식, 초승. 허리를 세우고 왼발로 밀고, 오른발은 따라오게 둔다.”');
  await say('me', '그거 걸레질입니다.');
  await say('yun', '네?');
  await say('me', '백 어르신이 맨날 시키던 겁니다. 그럼 그분이 한 달 내내 저한테 무공을 가르친 겁니까?');
  await say('yun', '저한테 물어보면 어떡해요. 밑에 더 있어요. “대숲 석상 앞에서 세 번 걷고 네 번째에 베어라.” 뒷산 대숲길에 있는 석상 얘기 같은데요.');
  await say('yun', '거기 요즘 멧돼지가 나와요. 갈 거면 금창약 챙겨 가요. 돈은 나중에 주고요.');
  S().potion += 2; toast('금창약 2개를 받았다');
  F().bamboo_open = true; set('c1c'); ctx.goal('북쪽 대숲길의 석상을 찾기 (마을 북쪽 출구)');
}
async function stoneStatue() {
  if (step() !== 'c1c') { await say(null, '이끼 낀 석상이 서 있다.'); return; }
  await say('me', '이 석상인가. 세 번 걷고, 네 번째에…');
  await say('racoon', '꾸르르륵.');
  await say('me', '뭐야, 너구리가 왜 이렇게 커.');
  await say('me', '저 입에 문 거 내 금창약 주머니 아니야? 이 자식이!');
  const won = await ctx.duel({ foes: ['raccoon_king'], arena: 'forest', bgm: 'boss', title: '대왕 너구리', tip: '<b>붉은 예고</b>는 막을 수 없습니다. <b>K 경공</b>으로 빠져나가세요. 아래 노란 줄을 깎으면 자세가 무너집니다.' });
  await say('me', '이겼다. 약은 벌써 다 먹어 치웠네.');
  await narr('숨을 고르고 다시 석상 앞에 섰다. 허리를 세우고 왼발로 밀면서 세 걸음을 걷고, 네 번째 걸음과 함께 칼을 그었다.');
  await say(null, '순간 앞이 끊겼다. 정신을 차려 보니 나는 석상 뒤쪽에 서 있었다.');
  await say('me', '방금 뭐였지?');
  ctx.page('moon1');
  await say(null, '찢어진 종이의 글자가 또렷해졌다. 메뉴의 초식 배치에서 확인할 수 있다.');
  S().silver += 30;
  set('c1d'); ctx.goal('청하진으로 돌아가 윤설에게 알리기');
  F().cloud_hint = true;
}
async function yunAfter() {
  await say('me', '됐습니다. 석상 앞에 있었는데 눈 깜짝할 사이에 뒤로 넘어가 있었습니다.');
  await say('yun', '그런 얘기는 나중에 하고요, 어디 다쳤어요?');
  await say('me', '너구리한테 물렸습니다.');
  await say('yun', '…팔 줘 봐요.');
  await say('yun', '참, 뱃사공 노씨 아저씨가 찾던데요. 흑의인들 탄 배를 봤대요.');
  await say('doc', '{나}야, 운기조식이라도 좀 배워 두거라. 밖에 나가면 네 몸은 네가 챙겨야 한다.');
  learn('breath');
  set('s1'); ctx.goal('나루터의 뱃사공 노씨 만나기');
  const c = await choice('윤설이 약을 싸 주면서 이쪽을 보지 않는다.', ['고맙다고 한다', '약값은 꼭 갚겠다고 한다']);
  if (c === 0) { await say('me', '고맙습니다. 강에서 건져 주신 것도요.'); await say('yun', '고마우면 다치지나 마요.'); ctx.love('yun'); }
  else { await say('me', '약값은 꼭 갚겠습니다.'); await say('yun', '네, 다 적어 놨어요.'); }
}
async function roadBlock() {
  await say('bandit', '거기 서! 여긴 흑풍채 맹호 어른 땅이다!');
  await say('me', '흑의인들이 이쪽으로 지나가지 않았나.');
  await say('bandit', '그딴 건 모르겠고, 일단 통행세부터 내!');
  await ctx.duel({ foes: ['bandit', 'bandit', 'archer'], arena: 'fort', title: '흑풍채 산적', tip: '활을 쏘는 적부터 잡으세요. <b>I</b>에 초승을 두었다면 등 뒤로 건너갈 수 있습니다.' });
  await say('me', '이 앞이 산채구나.');
  F().fort_open = true; set('c1f'); ctx.goal('흑풍채로 들어가 흑의인의 행방 찾기');
}
async function bruiser() {
  await say('bandit', '채주님한테는 못 간다! 형님, 형님! 여기 웬 미친놈이 왔습니다!');
  await ctx.duel({ foes: ['bruiser', 'bandit'], arena: 'fort', title: '행동대장' });
  F().bruiser = true;
  await say('me', '궤짝이네. 안에 책이 있다.');
  learn('break_mount'); learn('blood_fan');
  await say(null, '《파산도법》 낡은 필사본. 도를 들면 쓸 수 있다.');
  await say('me', '도는 없지만 일단 챙겨 두자.');
}
async function lionFight() {
  if (!F().bruiser) { await say('bandit', '어딜 들어와, 이 자식이!'); return; }
  await say('lion', '네놈이 내 애들을 다 때려눕혔냐? 아직 애새끼구먼.');
  await say('me', '검은 옷 입은 자들이 어디로 갔는지 말해라. 여자 한 명을 끌고 갔을 거다.');
  await say('lion', '하하! 돈 받고 길 내줬지, 왜. 알고 싶으면 나를 꺾어 봐.');
  await ctx.duel({ foes: ['lion'], arena: 'fort', bgm: 'boss', title: '광사자 맹호' });
  await say('lion', '크윽… 내가 점소이한테 지다니. 소문나면 산채 문 닫아야겠다.');
  await say('me', '말해. 누가 시켰어.');
  await say('lion', '나도 얼굴은 못 봤다. 다들 복면을 썼으니까. 무면회라고 하던데, 이런 촌구석 산채에까지 돈을 뿌리는 걸 보면 보통 놈들은 아니야.');
  await say('lion', '근데 말이다, 놈들이 보여 준 서찰에 창운검문 인장이 찍혀 있더라. 그 잘난 정파 나리들이 말이야.');
  await say('lion', '이것도 가져가라. 놈들이 흘리고 간 쇳조각인데 달처럼 생겼어.');
  await say(null, '달 모양 쇠붙이를 얻었다. 객잔 우물 뚜껑의 구멍과 크기가 비슷하다.');
  const c = await choice('맹호가 칼을 내려놓고 눈치를 본다.', ['나중에 신세를 갚으라고 한다', '산적질을 그만두라고 한다']);
  if (c === 0) { await say('lion', '하하, 좋다. 녹림 사람은 빚지고는 못 산다. 언제든 찾아와라.'); F().lion_debt = true; ctx.rep('sa', 2); }
  else { await say('lion', '말은 쉽지. 이 산에 농사지을 땅이 어디 있다고.'); ctx.rep('jeong', 1); }
  ctx.silver(120);
  ctx.note('광사자 맹호: 흑의인은 무면회. 서찰에 창운검문 인장이 찍혀 있었다.');
  set('c1g'); ctx.goal('객잔 우물 뚜껑을 달 모양 쇠붙이로 열어 보기');
}
async function wellOpen() {
  await say(null, '쇠붙이를 끼워 돌리자 뚜껑이 소리 없이 열렸다. 우물 벽에 사다리가 있다.');
  await ctx.warp('well', 6, 7, 1);
  await say('me', '이게 다 위패야?');
  await narr('우물 밑 작은 방에 위패가 빼곡히 세워져 있었다. 세어 보니 마흔아홉 개였다. 맨 앞 위패에는 “월하문 문주 월청운 내외의 신위”라고 적혀 있었다.');
  await say('me', '아주머니가 여기서 매일 향을 피웠나 보다. 궤짝도 있네.');
  await say(null, '궤짝 안에 찢어진 종이 한 장과 편지가 들어 있었다.');
  await say('gwak', '네가 이 글을 읽고 있다면 나한테 무슨 일이 생겼다는 뜻이겠지.');
  await say('gwak', '네가 객잔에 들어온 날, 귀 뒤의 점을 보고 국자를 떨어뜨렸다. 네 어미 귀 뒤에도 똑같은 점이 있었다.');
  await say('gwak', '너는 그냥 떠돌이가 아니다. 월하문의 마지막 핏줄이다.');
  await say('gwak', '십칠 년 전 그믐밤에 문파가 불탔다. 나는 월하문 호법이었고, 세 살이던 너를 안고 산을 넘었다.');
  await say('gwak', '쫓아오는 놈들이 많아서 너를 데리고 다닐 수가 없었다. 그래서 북쪽 변경에 사는 마음 좋은 내외에게 맡겼다. 네가 부모로 알고 있는 분들이다.');
  await say('gwak', '두 해 뒤에 그 마을이 불탔다는 소식을 들었다. 그때부터 열다섯 해를 찾아다녔다. 너무 늦게 찾아서 미안하다.');
  await say('gwak', '그날 월하곡을 둘러싼 건 구파일방과 오대세가였다. 정천맹이라는 이름을 내걸고 다 같이 왔지.');
  await say('gwak', '왜 그랬는지는 나도 모른다. 다만 누군가 안에서 문을 열어 준 것만은 확실하다.');
  await say('gwak', '복수 같은 건 생각하지 마라. 그래도 기어이 나가겠다면 밥은 거르지 말고 다녀라.');
  await say('me', '끝까지 밥 얘기네.');
  await narr('나를 찾는 사람이 있었다는 걸 스무 살이 되도록 몰랐다.');
  ctx.page('moon2');
  ctx.note('나는 월하문의 마지막 아이. 곽 아주머니는 월하문 호법 곽란. 전쟁 때 잃은 부모는 나를 맡아 키운 분들이었다. 구파일방과 오대세가가 월하곡을 둘러쌌고, 문을 안에서 열어 준 자가 있었다.');
  set('c1h'); F().well_open = true; F().cloud_open = true;
  ctx.goal('윤설에게 작별하고, 동쪽 산길 남쪽 길로 창운산에 가기');
}
async function yunGo() {
  await say('me', '창운산에 다녀오겠습니다. 서찰 일도 있고, 아주머니도 찾아야 합니다.');
  await say('yun', '저도 갈 거예요.');
  await say('me', '예?');
  await say('yun', '창운문 문주님이 오래 편찮으시대요. 아버지한테 진맥을 와 달라는데 아버지는 먼 길을 못 가시니까 제가 가기로 했어요. 그쪽 따라가는 거 아니에요.');
  await say('doc', '데려가거라. 저 애 고집은 나도 못 꺾는다.');
  F().yun_join = true; set('c2a'); ctx.goal('동쪽 산길 남쪽 길을 따라 창운산으로 가기');
}

const talkTown = {
  boat: async () => {
    if (F().burned && !F().rod && step() !== 'c1a') { F().rod = true; await say('boat', '객잔이 타 버렸으니 먹고살 일이 걱정이겄네. 이 낚싯대 가져가. 나루 끝에서 던지면 뭐라도 물 거여.'); Sound.sfx('bonus'); await say(null, '낚싯대를 받았다. 물가에서 E 키로 낚시한다.'); return; }
    if (step() === 'c1a') { await say('boat', '아이고, 살아 있었구먼! 그날 밤에 시커먼 놈들이 배 세 척으로 강을 건너더니 동쪽 산으로 올라가더라고.'); await say('boat', '거긴 흑풍채 놈들 땅이여. 맨손으로는 못 가.'); F().c1boat = true; ctx.note('뱃사공: 흑의인들은 동쪽 산, 흑풍채 쪽으로 갔다.'); await checkClues(); return; }
    if (F().boat_guhwa) { const c = await choice('어디로 갈까?', ['구화성으로', '그만둔다'], 'boat'); if (c === 0) await ctx.warp('guhwa', 24.5, 29, 1); return; }
    await say('boat', '또 오셔.');
  },
  smith: async () => {
    if (step() === 'c1e' && !F().smith_gift) {
      F().smith_gift = true;
      await say('smith', '살아 있었구나. 곽씨 밥을 내가 십 년을 얻어먹었다. 그 칼 갖고 산적 치러 간다고? 이거 가져가라.');
      S().weapons.push('iron_sword'); S().weapon = 'iron_sword'; toast('철검을 받았다'); Sound.sfx('bonus');
    }
    const c = await choice('무엇을 할까?', ['무기 사기', '제작과 강화', '그만둔다'], 'smith'); if (c === 0) await ctx.shop('철 대장간', [ctx.item.weapon('iron_sword'), ctx.item.weapon('iron_blade'), ctx.item.weapon('iron_spear'), ctx.item.weapon('fist_wrap'), ctx.item.weapon('blue_sword'), ctx.item.weapon('ghost_blade')]); if (c === 1) await G.life.openCraft('forge', '철 대장간 · 제작과 강화');
  },
  shopk: async () => { const c = await choice('무엇을 할까?', ['물건 사기', '가구 사기', '물건 팔기', '그만둔다'], 'shopk'); if (c === 0) await ctx.shop('만물상', [ctx.item.potion(), ctx.item.stuff('rice', 4), ctx.item.stuff('noodlep', 4), ctx.item.stuff('sweets', 24), ctx.item.stuff('tea', 44), ctx.item.book('dart', 40), ctx.item.heart('tonap', 60), ctx.item.heart('iron_shirt', 160)]); if (c === 1) await ctx.shop('만물상 · 가구', ['bed', 'table', 'stool', 'drawer', 'plant', 'jar', 'lamp', 'stove', 'bench'].map(ctx.item.furn)); if (c === 2) await G.life.openSell(); },
};
async function wantedBoard() {
  const list = [['wanted1', '좀도둑 쥐눈이', 40, 'c1c'], ['wanted2', '독수리 마삼', 120, 'c2a'], ['wanted3', '인면수 낭패', 300, 'c3a']].filter(w => after(w[3]) && !S().wanted[w[0]]);
  if (!list.length) { await say(null, '붙어 있는 방이 없다.'); return; }
  const c = await choice('현상수배 방이 붙어 있다.', [...list.map(w => `${w[1]} (상금 ${w[2]}냥)`), '그만둔다']);
  if (c >= list.length) return;
  const w = list[c];
  const won = await ctx.duel({ foes: [w[0]], arena: 'village', title: w[1], bgm: 'fight', optional: true });
  if (won) { S().wanted[w[0]] = true; ctx.silver(w[2]); }
}
async function practice() { await ctx.duel({ foes: ['dummy'], arena: 'yard', title: '수련', bgm: 'peaceful', survive: 25, tip: '허수아비를 상대로 25초간 초식을 시험합니다.', expMul: 0 }); }

Story.providers.push(function content1(id) {
  const n = [], sp = [], tr = [], ro = [], s = step();
  if (id === 'inn') {
    if (!F().burned) {
      n.push({ id: 'gwak', spr: 'OldWoman', x: 4, y: 4.6, dir: 0, mark: () => G.life.dayMark('gwak'), talk: async () => { if (await G.life.dayTalk('gwak')) return; if (s === 'p1') await say('gwak', '저기 구석방이야. 오늘은 꼭 받아 와.'); else await say('gwak', '일해, 일.'); } });
      n.push({ id: 'baek', spr: 'OldMan3', x: 14.5, y: 5.6, dir: 2, mark: () => at('p1') || G.life.dayMark('baek'), talk: async () => { if (at('p1')) { set('p2'); await baekFirst(); } else if (!(await G.life.dayTalk('baek'))) await say('baek', '허리 펴라.'); } });
      n.push({ id: 'guest', spr: 'Villager', x: 13.7, y: 8.6, dir: 2, talk: async () => { await say('town', '여기 국수는 곽씨한테 욕을 먹으면서 먹어야 제맛이지.'); } });
    } else {
      sp.push({ x: 1, y: 3, w: 3, h: 1, hint: '살펴보기', when: () => !F().c1inn, act: c1Inn });
      sp.push({ x: 13, y: 10, w: 2, h: 2, hint: F().well_open ? '우물 아래로' : '우물 뚜껑', act: async () => { if (F().well_open) await ctx.warp('well', 6, 7, 1); else if (at('c1g')) await wellOpen(); else await say(null, '쇠 뚜껑에 달 모양 구멍이 나 있다. 꿈쩍도 하지 않는다.'); } });
      sp.push({ x: 7, y: 5, w: 2, h: 2, hint: '구석방 탁자', when: () => after('c1a'), act: async () => { await say(null, '타다 남은 탁자에 술잔 자국이 남아 있다.'); } });
    }
  }
  if (id === 'clinic' && F().burned) {
    n.push({ id: 'yun', spr: 'Princess', x: 3.5, y: 4.8, dir: 0, mark: () => at('c1b', 'c1d', 'c1h'), when: () => (!F().yun_join || at('end')) && S().married !== 'yun', talk: async () => { if (at('c1b')) await yunPaper(); else if (at('c1d')) await yunAfter(); else if (at('c1h')) await yunGo(); else if (F().c1yun2 || !after('c1e')) await say('yun', '금창약은 만물상보다 여기가 싸요. 많이 사 가요.'); else { F().c1yun2 = true; await yunNight(); } } });
    n.push({ id: 'doc', spr: 'OldMan', x: 9.5, y: 3.6, dir: 0, talk: async () => { await say('doc', '몸이 재산이다. 금창약은 넉넉히 챙겨라.'); const c = await choice('무엇을 할까?', ['약 사기', '약 조제', '침상에서 쉬기 (5냥)', '그만둔다'], 'doc'); if (c === 0) await ctx.shop('윤씨 약방', [ctx.item.potion()]); if (c === 1) await G.life.openCraft('brew', '윤씨 약방 · 조제'); if (c === 2 && S().silver >= 5) { S().silver -= 5; await G.life.sleepNow(); } } });
  }
  if (id === 'smith' && F().burned) n.push({ id: 'smith', spr: 'Caveman2', x: 4, y: 4.6, dir: 0, mark: () => at('c1e') && !F().smith_gift, talk: talkTown.smith });
  if (id === 'shop') n.push({ id: 'shopk', spr: 'Noble', x: 5, y: 3.6, dir: 0, talk: talkTown.shopk });
  if (id === 'cheongha' && F().burned) {
    n.push({ id: 'boat', spr: 'OldMan2', x: 22.5, y: 27.8, dir: 3, mark: () => at('c1a') && !F().c1boat, talk: talkTown.boat });
    n.push({ id: 'kid', spr: 'Child', x: 16, y: 16.8, dir: 3, talk: async () => { await say('kid', '아저씨, 쟁반 또 던져 봐요! 저번에 진짜 멋있었어요!'); } });
    n.push({ id: 'town', spr: 'Villager', x: 29, y: 16.6, dir: 2, talk: async () => { await say('town', F().plague ? '콜록… 우물물은 마시지 말게… 콜록…' : S().side === 'ma' ? '자네가 마교로 갔다는 말이 돌던데, 설마 아니겠지?' : S().side === 'sa' ? '흑도맹에 들어갔다면서. 그래도 여기 오면 밥은 먹고 가게.' : after('c1h') ? '자네가 흑풍채를 혼내 줬다며? 객잔 다시 지을 때 부르게. 나도 거들 테니.' : '곽씨가 그렇게 될 줄 누가 알았겠나. 객잔 불은 우리가 껐네.'); } });
    n.push({ id: 'town2', spr: 'Villager4', x: 12, y: 16.8, dir: 3, talk: async () => { await say('town2', '그믐만 되면 낯선 사람이 객잔 앞에 봉투를 두고 갔어. 십 년도 넘었을걸.'); if (!F().note_env) { F().note_env = true; ctx.note('마을 아낙: 그믐마다 낯선 사람이 객잔에 봉투를 두고 갔다.'); } } });
    sp.push({ x: 24, y: 16, w: 1, h: 1, hint: '방 보기', act: wantedBoard });
    sp.push({ x: 41, y: 13, w: 1, h: 1, hint: '이정표', act: async () => { await say(null, '동쪽: 산길. 산길을 지나 북쪽은 흑풍채, 남쪽은 창운산.'); } });
    sp.push({ x: 26, y: 13, w: 2, h: 1, hint: '수련하기', act: practice });
  }
  if (id === 'bamboo') {
    sp.push({ x: 27, y: 3, w: 2, h: 3, hint: '석상', act: stoneStatue });
    ro.push({ spr: 'mon/Beast', x: 27, y: 26.5, foes: ['boar'] }, { spr: 'mon/Snake', x: 30.5, y: 20, foes: ['snake', 'snake'] }, { spr: 'mon/Racoon', x: 22, y: 15.5, foes: ['raccoon', 'raccoon'] }, { spr: 'mon/Beast', x: 11, y: 12, foes: ['boar', 'snake'] }, { spr: 'mon/Bamboo', x: 18, y: 7.5, foes: ['bamboo', 'raccoon'] });
  }
  if (id === 'pass') {
    if (at('c1e')) tr.push({ x: 18, y: 3, w: 6, h: 11, when: () => at('c1e'), run: roadBlock });
    ro.push({ spr: 'chars/Villager2', x: 12, y: 12.5, foes: ['bandit'] }, { spr: 'chars/Samurai', x: 30, y: 5.5, foes: ['bandit', 'archer'] }, { spr: 'chars/Villager2', x: 30, y: 18.5, foes: ['bandit', 'bandit'] });
  }
  if (id === 'fort') {
    n.push({ id: 'lion', spr: 'Lion', x: 18, y: 19, dir: 2, mark: () => !after('c1g') && !!F().bruiser, when: () => !after('c1g'), talk: lionFight });
    n.push({ id: 'bruiser', spr: 'Caveman2', x: 10, y: 12, dir: 3, when: () => !F().bruiser, hint: '맞서기', talk: bruiser });
    if (S().side !== 'sa') ro.push({ spr: 'chars/Villager2', x: 8, y: 9, foes: ['bandit', 'bandit'] }, { spr: 'chars/Samurai', x: 24, y: 12, foes: ['archer', 'archer', 'bandit'] }, { spr: 'chars/Villager2', x: 29, y: 19, foes: ['bandit', 'bandit', 'archer'] });
  }
  return { npcs: n, spots: sp, trigs: tr, roam: ro };
});
async function yunNight() {
  await say('yun', '요즘 밤마다 약방 앞에서 이상하게 걸어 다니던데요.');
  await say('me', '보셨습니까.');
  await say('yun', '창문이 그쪽이잖아요. 처음엔 몽유병인 줄 알았어요.');
  const c = await choice('윤설이 약초를 썰다 말고 쳐다본다.', ['왜 도와주느냐고 묻는다', '약초 써는 법을 묻는다']);
  if (c === 0) { await say('yun', '제가 건졌잖아요. 건져 놨는데 죽으면 아깝죠.'); await say('yun', '그리고 어릴 때 곽 아주머니가 국수를 공짜로 많이 주셨어요. 그게 다예요.'); ctx.love('yun'); if (!S().hearts.includes('tonap')) { S().hearts.push('tonap'); await say('yun', '이거 아버지 책에서 베낀 호흡법이에요. 내력이 빨리 찰 거예요.'); toast('심법 기초토납법을 익혔다'); } }
  else await say('yun', '칼 쥐듯이 쥐지 마세요. 손 베여요.');
}
