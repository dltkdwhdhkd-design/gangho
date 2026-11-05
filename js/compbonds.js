// 강호에서 만난 동료들의 사연. 호감이 쌓이면 차례로 열린다
import { G, Sound, toast } from './core.js';
import { say, narr, choice } from './ctx.js';
import { BONDS } from './bonds.js';

const S = () => G.S, grow = (id, n = 5) => { const p = S().pt; p.up[id] = Math.min(30, (p.up[id] || 0) + n); Sound.sfx('secret'); toast('동료가 한층 든든해졌다', 3); };
Object.assign(BONDS, {
  c_haho: [
    { at: 15, run: async () => {
      await narr('하후민이 걸음을 멈췄다. 담장 높은 기와집 앞이었다. 문패에는 모르는 성이 적혀 있었다.');
      await say('c_haho', '여기 연못에 잉어가 서른 마리 있었어. 내가 이름도 지어 줬지.');
      await say('me', '들어가 볼래요?');
      await say('c_haho', '됐어. 들어가면 외상값부터 물어볼 테니까.');
      await narr('그는 담장 너머로 고개를 빼고 한참 서 있다가, 잉어들이 잘 있으려나 하고 혼잣말을 했다.');
    } },
    { at: 40, run: async () => {
      await narr('길에서 허리 굽은 노인이 달려왔다. 무릎을 꿇으려는 걸 하후민이 붙잡았다.');
      await say(null, '노인: 도련님, 아직 칼을 안 파셨습니까.');
      await say('c_haho', '내놨는데 아무도 안 사더라고.');
      await narr('노인을 보내고 나서 물어보았다. 집안이 왜 그렇게 됐느냐고.');
      await say('c_haho', '아버지가 친구 빚보증을 섰어. 세 번. 세 번 다 같은 친구였지.');
      await say('c_haho', '그 친구는 지금도 우리 아버지가 좋은 사람이었다고 하고 다녀. 틀린 말은 아니야.');
    } },
    { at: 70, run: async () => {
      await say('c_haho', '전당포에서 이 칼에 은자 사백 냥을 부르더라.');
      await say('me', '파실 거예요?');
      await say('c_haho', '너한테 진 빚이 백이십 냥이지. 이자까지 치면 삼백쯤 되나.');
      await say('c_haho', '다 갚으면 따라다닐 핑계가 없어지잖아. 그러니까 안 판다.');
      await narr('그는 칼집을 한 번 닦고 도로 허리에 찼다. 그날 밥값은 내가 냈다.'); grow('c_haho');
    } },
  ],
  c_mun: [
    { at: 15, run: async () => {
      await say('c_mun', '저 과거에 일곱 번 떨어졌습니다.');
      await say('me', '왜요?');
      await say('c_mun', '답안지에 문제의 오자를 고쳐 드렸습니다. 시험관이 낸 문제에 틀린 글자가 있어서요.');
      await narr('일곱 번 다 그랬다고 한다.');
    } },
    { at: 40, run: async () => {
      await narr('문창이 밤새 불을 켜 두었다. 들여다보니 찢어진 책장 하나를 베끼고 있었다.');
      await say('c_mun', '스승님이 쓰시던 책입니다. 병란 때 불타고 이 한 장이 남았습니다.');
      await say('c_mun', '강호에 나오면 누가 베껴 둔 게 있지 않을까 싶어서요. 벌써 사 년째입니다.');
      await say('me', '찾으면 어쩌려고요?');
      await say('c_mun', '오자를 고쳐야지요. 스승님도 틀리신 데가 있거든요.');
    } },
    { at: 70, run: async () => {
      await narr('문창이 두꺼운 공책을 내밀었다. 내가 어디서 누구와 싸웠는지 날짜별로 적혀 있었다.');
      await say('me', '이걸 왜 써요?');
      await say('c_mun', '강호에는 이긴 사람 말만 남습니다. 틀린 글자투성이로요.');
      await say('c_mun', '제가 쓰면 적어도 오자는 없을 겁니다.');
      await narr('첫 장을 넘겨 보았다. 제목 자리가 비어 있었다. 뭐라고 쓸 거냐고 물으니 아직 안 끝났다고 했다.'); grow('c_mun');
    } },
  ],
  c_owol: [
    { at: 15, run: async () => {
      await say('c_owol', '첫 범은 열세 살 때 잡았어. 아버지가 잡고 나는 소리만 질렀지만.');
      await say('me', '아버지는 지금도 사냥하세요?');
      await say('c_owol', '두 번째 범이 잡았어.');
      await narr('오월은 그렇게 말하고 육포를 마저 씹었다.');
    } },
    { at: 40, run: async () => {
      await narr('눈길에서 오월이 쪼그려 앉아 발자국을 만졌다. 앞발 하나가 유난히 얕았다.');
      await say('c_owol', '왼 앞발을 저는 놈이야. 아버지 창이 박힌 자리지. 십오 년째 쫓고 있어.');
      await say('me', '잡으면 어쩌려고요?');
      await say('c_owol', '몰라. 그때 생각하려고 미뤄 뒀어.');
    } },
    { at: 70, run: async () => {
      await narr('그날 오월이 숲에서 오래 돌아오지 않았다. 찾아가 보니 바위 밑에 앉아 있었다. 앞에 늙은 범이 누워 있었다. 숨이 없었다. 왼 앞발에 녹슨 창날이 박혀 있었다.');
      await say('c_owol', '내가 왔을 때 이미 이랬어.');
      await say('c_owol', '털이 다 빠졌네. 이빨도 몇 개 없고. 얘도 힘들었나 봐.');
      await narr('오월은 창날을 뽑아 허리에 차고 돌을 날라 범을 덮었다. 나도 같이 날랐다.');
      await say('c_owol', '가자. 이제 어디로 가든 상관없어졌네. 그럼 너 따라가지 뭐.'); grow('c_owol');
    } },
  ],
  c_hyegong: [
    { at: 15, run: async () => {
      await say('me', '스님은 왜 술을 드세요?');
      await say('c_hyegong', '부처님이 안 말리시던데.');
      await say('me', '계율에 있잖아요.');
      await say('c_hyegong', '계율은 부처님이 쓴 게 아니야. 술을 안 마셔 본 사람이 썼지.');
    } },
    { at: 40, run: async () => {
      await narr('옛 싸움터 들판을 지날 때 혜공이 호리병을 내려놓았다. 처음 보는 일이었다. 그는 들판을 향해 합장하고 오래 경을 외웠다.');
      await say('c_hyegong', '소림에 있을 때 그 전쟁에 염불하러 왔었네. 시신 하나에 한 번씩. 삼천 번을 외웠어.');
      await say('c_hyegong', '삼천 번째에 입에서 경이 안 나오더군. 그 뒤로 입에 술이 들어갔지.');
      await say('me', '저도 그 전쟁에 있었어요. 시체를 날랐어요.');
      await say('c_hyegong', '그럼 만났겠군. 자네가 나르고 내가 외웠으니.');
    } },
    { at: 70, run: async () => {
      await narr('혜공이 소림 쪽 하늘을 보고 있었다.');
      await say('c_hyegong', '어젯밤 꿈에 그 삼천 명이 나왔네. 아무도 화를 안 내더군. 그게 더 무서웠어.');
      await say('c_hyegong', '자네, 경 한 줄 들어 볼 텐가. 맨입으로 외우는 건 십 년 만일세.');
      await narr('그는 호리병을 내 쪽으로 밀어 두고 경을 외웠다. 잘 외웠다. 끝나자마자 호리병을 도로 가져갔다.'); grow('c_hyegong');
    } },
  ],
  c_saira: [
    { at: 15, run: async () => {
      await say('c_saira', '네 말 어렵다. 왜 같은 말이 많아. 먹었어. 드셨어. 잡쉈어.');
      await say('me', '사람마다 달라서요.');
      await say('c_saira', '내 말에는 칼이 하나다. 사람이 아무리 높아도 칼은 같다.');
    } },
    { at: 40, run: async () => {
      await narr('사이라가 모래 위에 동그라미를 셋 그렸다.');
      await say('c_saira', '내 마을. 우물 셋. 동생도 셋. 지금은 우물이 없다. 모래가 먹었다.');
      await say('c_saira', '동생들은 상단을 따라 동쪽으로 갔다. 막내가 말했다. 누나, 칼 잘 쓰게 되면 찾아와.');
      await say('me', '그래서 사주성에 있었어요?');
      await say('c_saira', '동쪽으로 가는 사람은 다 거기 지난다. 삼 년 봤다. 없었다.');
    } },
    { at: 70, run: async () => {
      await narr('어느 저잣거리에서 사이라가 우뚝 섰다. 서역 말로 떠드는 젊은 장사꾼이 있었다. 사이라가 다가가 뭐라고 말하자 장사꾼의 얼굴이 하얗게 질렸다가 울음이 터졌다.');
      await narr('둘은 한참 붙어 서 있었다. 모르는 말이었지만 뜻은 알 수 있었다.');
      await say('c_saira', '막내다. 키가 나보다 크다. 화가 난다.');
      await say('me', '이제 사주성에 안 가도 되겠네요.');
      await say('c_saira', '막내가 말했다. 칼 잘 쓰네. 그러니 더 잘 쓸 거다. 너 따라가면 된다.'); grow('c_saira');
    } },
  ],
  c_gal: [
    { at: 15, run: async () => {
      await say('me', '선생님 의술은 어디서 배웠어요?');
      await say('c_gal', '어깨너머로. 누구 어깨였는지는 기억이 안 나.');
      await say('me', '지난번에 배탈 났는데 머리에 침을 놓으셨잖아요.');
      await say('c_gal', '나았잖아.');
      await say('me', '저절로 나은 것 같은데요.');
      await say('c_gal', '그걸 의술이라고 하는 걸세.');
    } },
    { at: 40, run: async () => {
      await narr('갈 선생이 길가에서 앓는 아이를 보더니 농담을 멈췄다. 손놀림이 달랐다. 맥을 짚는 손가락이 흔들리지 않았다.');
      await narr('밤새 곁을 지켰고, 새벽에 아이의 열이 내렸다.');
      await say('me', '돌팔이라면서요.');
      await say('c_gal', '입 다물게. 소문나면 사람들이 기대를 해.');
    } },
    { at: 70, run: async () => {
      await narr('술이 한 잔 들어간 밤이었다.');
      await say('c_gal', '궁에서 어의를 했네. 스무 해. 내 딸이 열병에 걸렸을 때 황자를 보느라 궁을 못 나갔지.');
      await say('c_gal', '나와 보니 동네 돌팔이가 딸을 보고 있더군. 잘 보고 있었어. 그래도 늦었지.');
      await say('c_gal', '그 돌팔이 성이 갈씨였네.');
      await narr('그는 잔을 비우고 내 왼쪽 어깨를 꾹 눌렀다. 아팠는데 오래된 결림이 풀렸다.'); grow('c_gal');
    } },
  ],
  c_yang: [
    { at: 15, run: async () => {
      await narr('은자 주머니가 가벼웠다. 양춘을 쳐다봤다. 그는 먼 산을 봤다.');
      await say('me', '내놔요.');
      await say('c_yang', '형님 걸 훔치겠습니까. 잠깐 맡아 둔 거지.');
      await narr('돌려받은 주머니에는 전보다 세 냥이 더 들어 있었다.');
      await say('c_yang', '이자요. 딴 데서 좀 벌었습니다.'); S().silver += 3;
    } },
    { at: 40, run: async () => {
      await narr('밤에 양춘이 몰래 나갔다. 따라가 보니 낡은 고아원 담장 너머로 돈주머니를 던져 넣고 있었다.');
      await say('c_yang', '형님, 이건 못 본 걸로 해 주쇼. 소문나면 장사 못 합니다.');
      await say('c_yang', '저 여기서 컸습니다. 배고파서 소매치기를 배웠지요. 원장 할머니는 아직도 제가 포목상을 하는 줄 압니다.');
    } },
    { at: 70, run: async () => {
      await narr('원장 할머니가 찾아왔다. 양춘은 담을 넘으려다 붙잡혔다.');
      await say(null, '원장: 이놈아, 네가 던지는 돈주머니마다 주인 이름이 수놓여 있더라. 그걸 다 돌려주느라 내가 얼마나 다닌 줄 아느냐.');
      await say('c_yang', '…네?');
      await say(null, '원장: 애들 먹일 돈은 네 손으로 벌어서 와라. 손 잘리지 말고.');
      await narr('양춘은 한동안 아무것도 훔치지 않았다. 그러다 내 주머니에 세 냥을 넣어 주었다.');
      await say('c_yang', '제가 번 겁니다. 형님 따라다니고 받은 삯이요. 저 이제 깨끗한 돈을 벌어 보겠습니다. 그러니까 일 좀 많이 시켜 주쇼.'); grow('c_yang');
    } },
  ],
  c_gu: [
    { at: 15, run: async () => {
      await say('c_gu', '왼발이 늦는구먼. 걸음은 어디서 배웠나. 군대 걸음인데.');
      await say('me', '그냥 떠돌다 보니까요.');
      await say('c_gu', '그래. 군대 걸음은 떠돌아도 안 빠지지.');
    } },
    { at: 40, run: async () => {
      await narr('구 노창이 모닥불을 보며 말했다.');
      await say('c_gu', '나는 북쪽 변경에서 창 교관을 했네. 전쟁고아들을 가르쳤지. 견대라고, 들어 봤나.');
      await narr('장작을 넣던 손이 멈췄다.');
      await say('c_gu', '창을 쥐어 줘도 키가 창보다 작았어. 먼저 기어 들어가 화살이나 맞는 애들이니 쓸 일도 없었지. 그래도 가르쳤네. 그거라도 해야 내가 잠을 잤거든.');
      await say('c_gu', '표정이 왜 그런가.');
      await say('me', '아니에요.');
    } },
    { at: 70, run: async () => {
      await narr('구 노창이 창을 짚고 내 앞에 섰다.');
      await say('c_gu', '마지막 명령서는 내가 전했네. 보급기지를 치라는 것. 매복이 있다는 걸 알았어. 위에서는 이미 휴전을 얘기하고 있었으니까. 견대는 없어져야 할 부대였지.');
      await say('c_gu', '서른이 갔는데 돌아온 건 하나였지. 위에서 그 하나를 도망자로 적으라고 했어. 그 장부에 내가 도장을 찍었네.');
      await say('c_gu', '왼발이 늦는 아이가 있었어. 처음 자네 걷는 걸 봤을 때 알았네.');
      await say('me', '왜 이제 말해요?');
      await say('c_gu', '자네가 강해지길 기다렸네. 찌를 사람이 제대로 찌르게.');
      await narr('그는 창을 거꾸로 쥐어 내게 내밀었다.');
      const c = await choice('창대가 손앞에 있다.', ['창을 받아 땅에 꽂는다', '가시라고 한다']);
      if (c === 1) { await say('me', '가세요. 다시는 보고 싶지 않아요.'); await narr('구 노창은 고개를 한 번 숙이고 창을 짚은 채 걸어갔다. 왼쪽으로 조금 기울어 있었다. 나도 아는 걸음이었다.'); G.party.dismiss('c_gu'); return; }
      await narr('나는 창을 받아 땅에 꽂고 왼발부터 한 걸음 걸었다.');
      await say('c_gu', '…여전히 늦구먼.');
      await say('me', '그러니까 좀 가르쳐 주세요. 교관님.'); grow('c_gu', 8);
    } },
  ],
});
