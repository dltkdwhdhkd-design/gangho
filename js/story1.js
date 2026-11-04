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
  await narr('내가 다섯 살 때 전쟁이 터졌다. 북쪽 변경에 있던 우리 마을은 하룻밤 새 잿더미가 됐고, 부모님도 그날 돌아가셨다.');
  await narr('갈 데가 없으니 군막 주변을 맴돌았다. 거둬 주는 사람은 없어도 쫓아내는 사람도 없었다. 말똥 치우고 시체 나르는 걸 거들면 남은 밥 한 덩이는 얻어먹을 수 있었다.');
  await narr('일곱 살 되던 해, 나는 견대(犬隊)로 끌려갔다. 전쟁고아를 긁어모아 만든 척후대였다. 거기선 이름 대신 번호로 불렸고, 적진에 먼저 기어 들어가 화살이 어디서 날아오나 살피는 게 우리 일이었다. 말이 척후지 미끼나 다름없었다. 병사들은 우릴 개새끼들이라고 불렀다.');
  await narr('내가 열일곱이 되던 해, 팔백 명이던 견대는 서른 명으로 줄어 있었다. 마지막 명령은 적 보급기지를 치라는 거였는데, 막상 가 보니 보급기지는커녕 매복만 깔려 있었다. 살아서 돌아온 건 나 하나였다.');
  await narr('그런데 돌아오자마자 나는 동료를 버리고 혼자 도망친 놈이 됐다. 얼마 안 가 휴전이 맺어졌고, 군은 견대 같은 건 애초에 없었다는 듯 굴었다. 내 이름도 군적에서 지워졌다. 열여덟 살, 손에 남은 거라곤 이 빠진 칼 한 자루뿐이었다.');
  await narr('그 뒤로 두 해를 떠돌았다. 상단 호위도 서고 남의 빚도 대신 받아 주며 근근이 입에 풀칠을 했다. 세상은 나 같은 놈을 낭인이라고 불렀다.');
  await narr('스무 살 되던 봄, 청하진이라는 나루에 내렸을 때 나는 사흘째 굶고 있었다.');
  overBlack(false); Sound.bgm('village'); await fadeTo(0);
  set('p0a'); ctx.goal('마을 위쪽 달맞이 객잔에서 밥 먹기 (WASD 이동)');
};
export async function firstMeal() {
  await say('gwak', '어서 와. 칼 찬 손님은 돈부터 내고 앉아.');
  await say('me', '국수 한 그릇이요.');
  await narr('사흘을 굶었더니 눈에 뵈는 게 없었다. 국물까지 싹 비우고 나서야 주머니 사정이 떠올랐다. 뒤져 보니 동전 네 닢. 국수는 한 그릇에 열 닢이었다.');
  await say('gwak', '왜, 돈이 없어? 어쩐지 먹는 꼴이 심상치 않더라니.');
  await say('me', '칼을 맡기면 안 될까요.');
  await say('gwak', '칼? 어디 줘 봐. …이거 군용이잖아. 너 어디서 왔어?');
  await say('me', '북쪽이요.');
  await say('gwak', '몇 살이야?');
  await say('me', '스물이요.');
  await narr('아주머니는 내 얼굴을 한참 뜯어보더니 고개를 기울여 귀 뒤쪽을 들여다봤다. 그러다 들고 있던 국자를 떨어뜨렸다.');
  await say('gwak', '아이고, 손에 기름이 묻어서. …칼은 내가 갖고 있을 테니까, 모자란 여섯 닢어치 일하고 찾아가. 걸레는 저기 있다.');
  await say('me', '그 정도면 반나절이면 되겠네요.');
  await say('gwak', '퍽이나. 먹고 자는 건 공짜인 줄 아냐?');
  await fadeTo(1); overBlack(true); G.field.load('inn', 8, 8, 1);
  await narr('그 반나절이 어쩌다 한 달이 됐는지 모르겠다. 칼은 아직도 못 찾았고, 동네 사람들은 이제 나를 점소이라고 부른다.');
  overBlack(false); await fadeTo(0);
  await say('gwak', '{나}야! 거기서 뭐 해! 해가 중천이다!');
  await say('me', '바닥 닦았는데요.');
  await say('gwak', '이게 닦은 거야? 번들번들해 가지고. 손님 자빠지면 네가 물어낼래?');
  await say('gwak', '그리고 구석방 백 영감, 오늘은 어떻게든 방값 좀 받아 와. 벌써 석 달 치 밀렸어.');
  await say('me', '그 어르신, 제가 가면 걸레질 잔소리만 하시던데요.');
  await say('gwak', '잔소리를 하든 말든 돈만 받아 오면 될 거 아냐. 얼른 가!');
  set('p1'); ctx.goal('구석방의 백 노인에게 방값 받기');
}
async function baekFirst() {
  await say('baek', '또 왔느냐.');
  await say('me', '어르신, 방값 좀 주세요. 석 달 치 밀렸어요.');
  await say('baek', '방값은 됐고. 너 아까 보니까 또 허리를 구부리고 닦더구나.');
  await say('baek', '허리는 세우고 왼발로 밀고, 오른발은 슬슬 따라오게 두라고 어제도 일렀거늘.');
  await say('me', '그렇게 하면 바닥이 안 닦여요.');
  await say('baek', '이놈아, 바닥 닦는 게 문제냐. 됐다. 그렇게 기운이 남아돌면 뒤뜰에 가서 장작이나 패라.');
  await say('baek', '세 더미만 패 오면 방값 얘기는 들어 주마.');
  await say('me', '돈 받으러 왔다가 일만 늘었네.');
  await ctx.duel({ foes: ['log', 'log', 'log'], arena: 'yard', title: '장작 패기', bgm: 'peaceful', tip: '<b>W A S D</b> 이동, <b>J</b> 평타. J를 이어서 누르면 연달아 벱니다.' });
  await say('gwak', '장작은 잘 패네. 그래서 돈은?');
  await say('me', '내일 주신대요.');
  await say('gwak', '내일, 내일. 그 소리만 석 달째다. 들어가 쉬어. 내일 심부름 많아.');
  set('p3'); ctx.goal('곽 아주머니에게 심부름 받기');
}
export async function evening() {
  await narr('저녁이 되자 객잔이 뱃사람들로 북적였다.');
  await say('rowdy', '야, 점소이! 이게 술이냐 물이냐!');
  await say('me', '물인데요. 술은 아직 안 시키셨잖아요.');
  await say('rowdy', '이 새끼가 지금 장난하나? 오늘 술값은 없는 줄 알아!');
  await say('gwak', '{나}야, 저 양반들 밖으로 좀 모셔라.');
  await say('me', '칼 주시면 금방 끝낼게요.');
  await say('gwak', '미쳤냐? 여기가 군막인 줄 알아? 사람 잡지 말고 쟁반이나 들고 가.');
  learn('tray');
  await ctx.duel({ foes: ['rowdy', 'rowdy'], arena: 'yard', title: '왈패 소동', tip: '<b>U</b> 쟁반 던지기. <b>L</b> 막기: 노란 예고가 뜨면 누르세요. 맞기 직전에 누르면 <b>튕겨내기</b>가 됩니다.' });
  await narr('그날 밤, 처마 밑에서 바람을 쐬는데 백 노인이 슬그머니 옆에 와 앉았다.');
  F().night = true; G.field.load('cheongha', 22.5, 13, 1);
  await say('baek', '쟁반으로 왈패를 쫓아내는 놈은 내 평생 처음 본다.');
  await say('me', '보셨어요? 그럼 방값은…');
  await say('baek', '막는 걸 보니 제법이더구나. 걸레질이 헛되진 않았어.');
  await say('me', '네?');
  await say('baek', '저 달 좀 봐라. 저리 가늘어도 보름만 지나면 꽉 찬다.');
  await say('me', '어르신, 많이 취하셨어요.');
  await say('baek', '허허, 그런가. 방값은 내일 꼭 주마.');
  F().night = false; G.field.load('inn', 8, 8, 1);
  set('p4'); ctx.goal('구석방의 백 노인 찾아가기');
}
export async function lastMorning() {
  await narr('날이 밝아 구석방에 가 보니 백 노인은 온데간데없었다. 탁자 위에 낡은 목검 한 자루와 찢어진 종이 한 장만 덩그러니 놓여 있었다.');
  F().night = false; G.field.load('inn', 13, 8, 1);
  await say('me', '결국 튀었네. 목검은 또 왜 두고 갔대. 이건 뭐지? 책을 찢은 건가.');
  if (!S().weapons.includes('stick')) { S().weapons.push('stick'); S().weapon = 'stick'; toast('낡은 목검을 챙겼다'); }
  await say('gwak', '방값은 받았… 잠깐, 그 종이 어디서 났어?');
  await say('me', '백 어르신이 두고 갔어요. 글자가 적혀 있는데 못 읽겠네요.');
  await say('gwak', '…….');
  await say('gwak', '오늘은 일찍 닫자. 그건 품에 넣어 두고 아무한테도 보이지 마. 알았지?');
  await say('me', '방값 얘기를 안 하시네요. 어디 안 좋으세요?');
  await say('gwak', '잔말 말고 문이나 닫아!');
  await narr('그날 밤, 지붕 위에서 기왓장 밟는 소리가 났다.');
  F().night = true; G.field.load('cheongha', 22.5, 13.4, 0);
  Sound.bgm('dark');
  await say('shadow', '노인이 두고 간 물건을 내놔라.');
  await say('me', '방값이면 우리도 못 받았는데.');
  await ctx.duel({ foes: ['shadow0', 'shadow0'], arena: 'yard', bgm: 'fight', title: '흑의인', tip: '<b>K</b> 경공: 잠깐 빠르게 움직이고 그동안 맞지 않습니다. 날아오는 비도나 <b>붉은 예고</b>는 피하세요.' });
  await say('me', '하아… 뭐야, 이놈들. 군인은 아닌데.');
  await say('shadow', '점소이치고는 제법이군. 하지만 거기까지다.');
  await say('gwak', '남의 집 마당에서 뭣들 하는 짓이야!');
  await narr('곽 아주머니의 국자가 흑의인의 목덜미에 꽂혔다. 흑의인은 소리 한 번 못 지르고 고꾸라졌다.');
  await say('me', '아주머니, 방금 그거…');
  await say('gwak', '얘기는 나중에! 강 쪽으로 뛰어! 뒤돌아보지 말고!');
  await say('fox', '오랜만이오, 곽 호법. 십칠 년이나 숨어 살았으면 이제 그만할 때도 됐지.');
  await say('gwak', '{나}야! 뭐 해, 뛰라니까!');
  await say('me', '혼자 두고 어떻게 가요!');
  await ctx.duel({ foes: ['fox0'], arena: 'yard', bgm: 'boss', title: '여우 가면', survive: 16, tip: '이길 수 없는 상대입니다. 16초를 버티세요.' });
  await say('fox', '이 아이인가. 아직 덜 여물었군.');
  await narr('아주머니가 쓰러지는 게 보였다. 곧이어 등에 뭔가 세게 부딪혔고, 그다음은 차가운 강물밖에 기억나지 않는다.');
  await fadeTo(1); F().night = false; F().burned = true; set('c1a');
  G.field.load('clinic', 9.2, 7.6, 3); await fadeTo(0);
  await say('yun', '정신이 좀 들어요? 물을 얼마나 먹었는지 배를 누르니까 분수처럼 나오던데요.');
  await say('me', '여긴…');
  await say('yun', '약방이에요. 갈대밭에 걸려 있길래 끌고 왔어요. 근데 등에 흉터가 왜 그렇게 많아요? 어디서 뭘 하다 온 거예요?');
  await say('me', '아주머니는요? 곽 아주머니는 어떻게 됐어요?');
  await say('yun', '객잔은 반쯤 타 버렸고, 아주머니는 안 보여요. 검은 옷 입은 사람들이 끌고 갔다는 얘기가 있어요.');
  await say('me', '찾으러 가야 돼요.');
  await say('yun', '그 몸으로요? 일어나지도 못하면서. 그보다 품에 있던 이 종이 좀 봐요. 강에 빠졌는데 하나도 안 젖었어요.');
  F().met_yun = true;
  await narr('제1부 · 객잔의 낭인\n\n타다 남은 객잔');
  ctx.goal('불탄 객잔을 살펴보고, 나루터의 뱃사공에게 묻기');
  ctx.note('곽 아주머니는 검은 옷의 무리에게 끌려갔다. 여우 가면이 아주머니를 “곽 호법”이라고 불렀다.');
  ctx.note('마을에서 할 수 있는 일: 복덕방에서 집 사기, 뱃사공에게 낚싯대 얻기, 서쪽 청풍골에서 사냥과 벌목, 대장간과 약방에서 제작, 떠돌이 비무객과 겨루기.');
}

async function c1Inn() {
  await say('me', '아주머니 방이다. 장부는 멀쩡하네.');
  await say(null, '내 이름 옆에 여섯 닢이라고 적혀 있고, 그 옆에 붉은 글씨로 ‘갚음’이라고 쓰여 있었다. 날짜를 보니 내가 온 첫날이었다.');
  await say('me', '첫날? 그럼 나는 한 달 동안 뭘 한 거야.');
  await say(null, '서랍을 열자 내 칼이 나왔다. 이 빠진 데를 숫돌로 곱게 갈아 놓았다. 그 밑에 다른 사람 글씨로 쓴 쪽지가 깔려 있었다.');
  await say(null, '“그믐마다 은자 다섯 냥. 아이를 찾는 데 쓰시오. 낙월.”');
  await say('me', '그믐마다 온다던 그 봉투구나. 아이를 찾아? 아주머니한테 애가 있었나.');
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
  await say('yun', '그 종이 말인데요, 옛날 글씨체더라고요. 약방 고서에서 본 적이 있어서 조금 읽었어요.');
  await say('yun', '“월하칠식 제일식, 초승. 허리를 세우고 왼발로 밀고, 오른발은 따라오게 둔다.”');
  await say('me', '…그거 걸레질인데요.');
  await say('yun', '네?');
  await say('me', '백 어르신이 맨날 시키던 거예요. 그럼 그 영감님이 한 달 내내 저한테 무공을 가르친 거예요?');
  await say('yun', '그걸 저한테 물으면 어떡해요. 밑에 더 있어요. “대숲 석상 앞에서 세 번 걷고 네 번째에 베어라.” 뒷산 대숲길에 있는 석상 말인가 봐요.');
  await say('yun', '거기 요즘 멧돼지가 나와요. 갈 거면 금창약 챙겨 가요. 돈은 나중에 주고요.');
  S().potion += 2; toast('금창약 2개를 받았다');
  F().bamboo_open = true; set('c1c'); ctx.goal('북쪽 대숲길의 석상을 찾기 (마을 북쪽 출구)');
}
async function stoneStatue() {
  if (step() !== 'c1c') { await say(null, '이끼 낀 석상이 서 있다.'); return; }
  await say('me', '이 석상인가 보네. 세 번 걷고, 네 번째에…');
  await say('racoon', '꾸르르륵.');
  await say('me', '뭐야, 너구리가 왜 이렇게 커.');
  await say('me', '잠깐, 입에 문 거 내 금창약 주머니잖아! 이 자식이!');
  const won = await ctx.duel({ foes: ['raccoon_king'], arena: 'forest', bgm: 'boss', title: '대왕 너구리', tip: '<b>붉은 예고</b>는 막을 수 없습니다. <b>K 경공</b>으로 빠져나가세요. 아래 노란 줄을 깎으면 자세가 무너집니다.' });
  await say('me', '이겼다. 약은 벌써 다 먹어 치웠네.');
  await narr('숨을 고르고 다시 석상 앞에 섰다. 허리를 세우고 왼발로 밀며 세 걸음을 걷고, 네 걸음째에 칼을 그었다.');
  await say(null, '순간 눈앞이 번쩍하더니 어느새 석상 뒤에 서 있었다.');
  await say('me', '방금 뭐였지?');
  ctx.page('moon1');
  await say(null, '찢어진 종이의 글자가 또렷해졌다. 메뉴의 초식 배치에서 확인할 수 있다.');
  S().silver += 30;
  set('c1d'); ctx.goal('청하진으로 돌아가 윤설에게 알리기');
  F().cloud_hint = true;
}
async function yunAfter() {
  await say('me', '됐어요. 석상 앞에 있었는데 눈 깜짝할 새에 뒤로 넘어가 있더라고요.');
  await say('yun', '그건 나중에 듣고요. 어디 다쳤어요?');
  await say('me', '너구리한테 좀 물렸어요.');
  await say('yun', '…팔 줘 봐요.');
  await say('yun', '참, 뱃사공 노씨 아저씨가 찾던데요. 나루에 낯선 배가 들어왔대요.');
  await say('doc', '{나}야, 운기조식이라도 좀 배워 두거라. 밖에 나가면 네 몸은 네가 챙겨야 한다.');
  learn('breath');
  set('s1'); ctx.goal('나루터의 뱃사공 노씨 만나기');
  const c = await choice('윤설이 약을 싸 주면서 이쪽을 보지 않는다.', ['고맙다고 한다', '약값은 꼭 갚겠다고 한다']);
  if (c === 0) { await say('me', '고마워요. 강에서 건져 주신 것도요.'); await say('yun', '고마우면 다치지나 마요.'); ctx.love('yun'); }
  else { await say('me', '약값은 꼭 갚을게요.'); await say('yun', '네, 다 적어 놨어요.'); }
}
async function roadBlock() {
  await say('bandit', '거기 서! 여긴 흑풍채 맹호 어른 땅이다!');
  await say('me', '흑의인들 여기 안 지나갔어?');
  await say('bandit', '그딴 건 모르겠고 일단 통행세부터 내!');
  await ctx.duel({ foes: ['bandit', 'bandit', 'archer'], arena: 'fort', title: '흑풍채 산적', tip: '활을 쏘는 적부터 잡으세요. <b>I</b>에 초승을 두었다면 등 뒤로 건너갈 수 있습니다.' });
  await say('me', '이 앞이 산채구나.');
  F().fort_open = true; set('c1f'); ctx.goal('흑풍채로 들어가 흑의인의 행방 찾기');
}
async function bruiser() {
  await say('bandit', '채주님한테는 못 가! 형님, 형님! 웬 미친놈이 왔어요!');
  await ctx.duel({ foes: ['bruiser', 'bandit'], arena: 'fort', title: '행동대장' });
  F().bruiser = true;
  await say('me', '궤짝이네. 책이 들어 있어.');
  learn('break_mount'); learn('blood_fan');
  await say(null, '《파산도법》 낡은 필사본. 도를 들면 쓸 수 있다.');
  await say('me', '도는 없지만 일단 챙겨 두자.');
}
async function lionFight() {
  if (!F().bruiser) { await say('bandit', '어딜 들어와, 이 자식이!'); return; }
  await say('lion', '네놈이 우리 애들을 때려눕혔냐? 아직 솜털도 안 가신 놈이구먼.');
  await say('me', '검은 옷 입은 놈들 어디로 갔어. 여자 한 명을 끌고 갔을 텐데.');
  await say('lion', '하하! 돈 받고 길 터 줬지, 왜. 알고 싶으면 나를 꺾어 봐라.');
  await ctx.duel({ foes: ['lion'], arena: 'fort', bgm: 'boss', title: '광사자 맹호' });
  await say('lion', '크윽… 내가 점소이한테 지다니. 소문나면 산채 문 닫아야겠군.');
  await say('me', '말해. 누가 시켰어.');
  await say('lion', '나도 얼굴은 못 봤다. 다들 복면을 썼으니까. 무면회라던데, 이런 촌구석 산채에까지 돈을 뿌리는 걸 보면 보통 놈들이 아니야.');
  await say('lion', '근데 놈들이 내민 서찰에 창운문 인장이 찍혀 있더라. 그 잘난 정파 나리들이 말이야.');
  await say('lion', '이것도 가져가라. 놈들이 흘리고 간 쇳조각인데 꼭 달처럼 생겼더라고.');
  await say(null, '달 모양 쇠붙이를 얻었다. 객잔 우물 뚜껑의 구멍과 크기가 비슷하다.');
  const c = await choice('맹호가 칼을 내려놓고 눈치를 본다.', ['나중에 신세를 갚으라고 한다', '산적질을 그만두라고 한다']);
  if (c === 0) { await say('lion', '하하, 좋다. 녹림 놈들은 빚지고는 못 산다. 언제든 찾아와라.'); F().lion_debt = true; ctx.rep('sa', 2); }
  else { await say('lion', '말이야 쉽지. 이 산에 농사지을 땅이 어디 있다고.'); ctx.rep('jeong', 1); }
  ctx.silver(120);
  ctx.note('광사자 맹호: 흑의인은 무면회. 서찰에 창운문 인장이 찍혀 있었다.');
  set('c1g'); ctx.goal('객잔 우물 뚜껑을 달 모양 쇠붙이로 열어 보기');
}
async function wellOpen() {
  await say(null, '쇠붙이를 끼워 돌리자 뚜껑이 소리 없이 열렸다. 우물 벽에 사다리가 있다.');
  await ctx.warp('well', 6, 7, 1);
  await say('me', '이게 다 위패야?');
  await narr('우물 밑 작은 방에 위패가 빼곡히 들어차 있었다. 세어 보니 마흔아홉 개. 맨 앞 위패에는 “월하문 문주 월청운 내외의 신위”라고 적혀 있었다.');
  await say('me', '아주머니가 여기서 매일 향을 피우셨나 보네. 궤짝도 있다.');
  await say(null, '궤짝 안에 찢어진 종이 한 장과 편지가 들어 있었다.');
  await say('gwak', '이 글을 읽고 있다면 나한테 무슨 일이 생긴 거겠지.');
  await say('gwak', '네가 객잔에 들어오던 날, 귀 뒤의 점을 보고 국자를 떨어뜨렸다. 네 어미 귀 뒤에도 똑같은 점이 있었거든.');
  await say('gwak', '너는 그냥 떠돌이가 아니다. 월하문의 마지막 핏줄이다.');
  await say('gwak', '십칠 년 전 그믐밤에 문파가 불탔다. 나는 월하문 호법이었고, 세 살 난 너를 안고 산을 넘었다.');
  await say('gwak', '쫓아오는 놈들이 많아 너를 데리고 다닐 수가 없었다. 그래서 북쪽 변경에 사는 마음씨 좋은 내외에게 맡겼지. 네가 부모로 알고 있는 분들이다.');
  await say('gwak', '두 해 뒤, 그 마을이 불탔다는 소식을 들었다. 그 뒤로 열다섯 해를 찾아 헤맸다. 너무 늦게 찾아서 미안하다.');
  await say('gwak', '그날 월하곡을 에워싼 건 구파일방과 오대세가였다. 정천맹 깃발을 들고 다 같이 몰려왔지.');
  await say('gwak', '왜 그랬는지는 나도 모른다. 다만 누군가 안에서 문을 열어 줬다는 것만은 확실하다.');
  await say('gwak', '복수 같은 건 꿈도 꾸지 마라. 그래도 기어이 나가겠다면, 밥은 거르지 말고 다녀라.');
  await say('me', '끝까지 밥 얘기네.');
  await narr('누가 나를 찾고 있었다는 걸, 스무 살이 되도록 몰랐다.');
  ctx.page('moon2');
  ctx.note('나는 월하문의 마지막 아이. 곽 아주머니는 월하문 호법 곽란. 전쟁 때 잃은 부모는 나를 맡아 키운 분들이었다. 구파일방과 오대세가가 월하곡을 둘러쌌고, 문을 안에서 열어 준 자가 있었다.');
  set('c1h'); F().well_open = true; F().cloud_open = true;
  ctx.goal('윤설에게 작별하고, 동쪽 산길에서 남쪽으로 꺾어 창운산에 가기');
}
async function yunGo() {
  await say('me', '창운산에 다녀올게요. 서찰 일도 있고, 아주머니도 찾아야 하니까요.');
  await say('yun', '저도 갈래요.');
  await say('me', '네?');
  await say('yun', '창운문 문주님이 오래 앓고 계시대요. 아버지한테 진맥을 부탁해 왔는데 아버지는 먼 길을 못 가시니까 제가 가기로 했어요. 따라가는 거 아니에요.');
  await say('doc', '데려가거라. 저 애 고집은 나도 못 꺾는다.');
  F().yun_join = true; set('c2a'); ctx.goal('동쪽 산길에서 남쪽으로 꺾어 창운산으로 가기');
}

const talkTown = {
  boat: async () => {
    if (F().burned && !F().rod && step() !== 'c1a') { F().rod = true; await say('boat', '객잔이 타 버렸으니 먹고살 일이 막막하겄네. 이 낚싯대 가져가. 나루 끝에서 던지면 뭐라도 물 거여.'); Sound.sfx('bonus'); await say(null, '낚싯대를 받았다. 물가에서 E 키로 낚시한다.'); return; }
    if (step() === 'c1a') { await say('boat', '아이고, 살아 있었구먼! 그날 밤에 시커먼 놈들이 배 세 척으로 강을 건너더니 동쪽 산으로 올라가더라고.'); await say('boat', '거긴 흑풍채 놈들 땅인디. 맨손으로는 못 가.'); F().c1boat = true; ctx.note('뱃사공: 흑의인들은 동쪽 산, 흑풍채 쪽으로 갔다.'); await checkClues(); return; }
    if (F().boat_guhwa) { const c = await choice('어디로 갈까?', ['구화성으로', '그만둔다'], 'boat'); if (c === 0) await ctx.warp('guhwa', 24.5, 29, 1); return; }
    await say('boat', '그려, 또 와.');
  },
  smith: async () => {
    if (step() === 'c1e' && !F().smith_gift) {
      F().smith_gift = true;
      await say('smith', '약속한 칼이다. 산적 치러 간다며? 그 칼로는 안 되지. 곽씨 밥을 십 년이나 얻어먹었으니 값은 됐다.');
      S().weapons.push('iron_sword'); S().weapon = 'iron_sword'; toast('철검을 받았다'); Sound.sfx('bonus');
    }
    const c = await choice('무엇을 할까?', ['무기 사기', '제작과 강화', '그만둔다'], 'smith'); if (c === 0) await ctx.shop('강씨 대장간', [ctx.item.weapon('iron_sword'), ctx.item.weapon('iron_blade'), ctx.item.weapon('iron_spear'), ctx.item.weapon('fist_wrap'), ctx.item.weapon('blue_sword'), ctx.item.weapon('ghost_blade')]); if (c === 1) await G.life.openCraft('forge', '강씨 대장간 · 제작과 강화');
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
      n.push({ id: 'gwak', spr: 'OldWoman', x: 4, y: 4.6, dir: 0, mark: () => G.life.dayMark('gwak'), talk: async () => { if (await G.life.dayTalk('gwak')) return; if (s === 'p1') await say('gwak', '저기 구석방이다. 오늘은 꼭 받아 와.'); else await say('gwak', '일해, 일.'); } });
      n.push({ id: 'baek', spr: 'OldMan3', x: 14.5, y: 5.6, dir: 2, mark: () => at('p1') || G.life.dayMark('baek'), talk: async () => { if (at('p1')) { set('p2'); await baekFirst(); } else if (!(await G.life.dayTalk('baek'))) await say('baek', '허리 펴라.'); } });
      n.push({ id: 'guest', spr: 'Villager', x: 13.7, y: 8.6, dir: 2, talk: async () => { await say('town', '여기 국수는 곽씨한테 욕을 먹으면서 먹어야 제맛이지.'); } });
    } else {
      sp.push({ x: 1, y: 3, w: 3, h: 1, hint: '살펴보기', when: () => !F().c1inn, act: c1Inn });
      sp.push({ x: 13, y: 10, w: 2, h: 2, hint: F().well_open ? '우물 아래로' : '우물 뚜껑', act: async () => { if (F().well_open) await ctx.warp('well', 6, 7, 1); else if (at('c1g')) await wellOpen(); else await say(null, '쇠 뚜껑에 달 모양 구멍이 나 있다. 꿈쩍도 하지 않는다.'); } });
      sp.push({ x: 7, y: 5, w: 2, h: 2, hint: '구석방 탁자', when: () => after('c1a'), act: async () => { await say(null, '타다 남은 탁자에 술잔 자국이 남아 있다.'); } });
    }
  }
  if (id === 'clinic' && F().burned) {
    n.push({ id: 'yun', spr: 'Princess', x: 3.5, y: 4.8, dir: 0, mark: () => at('c1b', 'c1d', 'c1h'), when: () => (!F().yun_join || at('end') || S().side === 'free' || S().side === 'ma') && S().married !== 'yun', talk: async () => { if (at('c1b')) await yunPaper(); else if (at('c1d')) await yunAfter(); else if (at('c1h')) await yunGo(); else if (F().c1yun2 || !after('c1e')) await say('yun', '금창약은 만물상보다 여기가 싸요. 넉넉히 사 가요.'); else { F().c1yun2 = true; await yunNight(); } } });
    n.push({ id: 'doc', spr: 'OldMan', x: 9.5, y: 3.6, dir: 0, talk: async () => { await say('doc', '몸이 재산이다. 금창약은 넉넉히 챙겨라.'); const c = await choice('무엇을 할까?', ['약 사기', '약 조제', '침상에서 쉬기 (5냥)', '그만둔다'], 'doc'); if (c === 0) await ctx.shop('윤씨 약방', [ctx.item.potion(9)]); if (c === 1) await G.life.openCraft('brew', '윤씨 약방 · 조제'); if (c === 2 && S().silver >= 5) { S().silver -= 5; await G.life.sleepNow(); } } });
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
  await say('me', '보셨어요?');
  await say('yun', '창문이 그쪽으로 나 있잖아요. 처음엔 몽유병인 줄 알았어요.');
  const c = await choice('윤설이 약초를 썰다 말고 쳐다본다.', ['왜 도와주느냐고 묻는다', '약초 써는 법을 묻는다']);
  if (c === 0) { await say('yun', '제가 건졌으니까요. 건져 놓고 죽으면 아깝잖아요.'); await say('yun', '그리고 어릴 때 곽 아주머니가 국수를 공짜로 많이 주셨어요. 그뿐이에요.'); ctx.love('yun'); if (!S().hearts.includes('tonap')) { S().hearts.push('tonap'); await say('yun', '아버지 책에서 베낀 호흡법이에요. 내력이 빨리 찰 거예요.'); toast('심법 기초토납법을 익혔다'); } }
  else await say('yun', '칼 쥐듯이 쥐지 마요. 손 베여요.');
}
