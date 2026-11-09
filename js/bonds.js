// 인연 사연: 호감이 쌓이면 인물마다 사연이 차례로 열린다. 셋째 사연을 봐야 마음을 전할 수 있다
import { G, Sound, toast, josa } from './core.js';
import { ctx, say, narr, choice } from './ctx.js';
import { ACCS } from './items.js';
import { FOES } from './foes.js';

const S = () => G.S, F = () => G.S.flags;
const keep = id => { const s = S(); if (!(s.accs || []).includes(id)) (s.accs = s.accs || []).push(id); Sound.sfx('bonus'); toast(`${josa(ACCS[id].name, '을/를')} 받았다`, 3); };
FOES.hitman = { name: '혈의방 자객', spr: 'chars/DarkNinja', hp: 100, atk: 10, def: 3, spd: 78, exp: 0, silver: 0, pause: 1.05, moves: ['quick', 'dart3', 'lunge'], wpn: 'Ninjaku', guard: .3 };

export const BONDS = {
  yun: [
    { at: 15, run: async () => {
      await say('yun', '잠깐 앉아 봐요. 약값 얘기 좀 해요.');
      await say('me', '얼마나 밀렸어요?');
      await say('yun', '직접 봐요.');
      await narr('윤설이 장부를 내밀었다. 내 이름 밑에 액수는 없고 날짜와 다친 자리만 빼곡했다. 왼팔, 왼쪽 옆구리, 왼쪽 어깨, 다시 왼팔.');
      await say('me', '이게 약값이에요?');
      await say('yun', '약값은 따로 적어요. 이건 제가 보려고 적은 거고요. 아버지가 그러셨어요. 사람을 고치려면 어디가 자꾸 다치는지부터 보라고요.');
      await say('yun', '왼쪽만 맞고 다니는 거 알아요? 왼발이 늦어서 그래요.');
      const c = await choice('윤설이 붓으로 장부를 톡톡 친다.', ['왼발을 고쳐 보겠다고 한다', '군막에서는 왼쪽을 내주는 게 기본이었다고 한다']);
      if (c === 0) { await say('me', '고쳐 볼게요.'); await say('yun', '네. 장부가 줄면 저도 좋죠.'); }
      else { await say('me', '왼쪽을 내주고 목을 따는 게 군막에서는 기본이었어요.'); await say('yun', '그런 얘기는 꿰매는 사람 앞에서 하는 거 아니에요.', 'a'); }
    } },
    { at: 40, run: async () => {
      await say('yun', '제가 그날 왜 갈대밭에 있었는지 물어본 적 없죠?');
      await say('me', '약초 캐러 가신 거 아니에요?');
      await say('yun', '장마 지나면 사람이 떠내려와요. 열두 살 때부터 아버지랑 돌았어요. 안 건지면 아무도 안 건지니까요.');
      await say('me', '많이 건지셨어요?');
      await say('yun', '일곱 명이요.', 's');
      await say('me', '다들 어떻게 됐어요?');
      await say('yun', '{나} 씨가 여덟 번째예요.');
      await say('me', '…….');
      await say('yun', '처음이었어요. 살아난 사람이요. 그래서 건져 놓고 죽으면 아깝다고 한 거예요. 농담이 아니라요.');
      const c = await choice('윤설은 약초 써는 손을 멈추지 않는다.', ['이제 안 죽겠다고 한다', '아무 말 없이 약초를 같이 썬다']);
      if (c === 0) { await say('me', '안 죽을게요.'); await say('yun', '그 말 제일 많이 하는 사람들이 어떻게 됐는지 알아요? 됐고, 이거나 썰어요.'); }
      else await narr('칼 쥐듯이 쥐지 말라는 잔소리를 들으며 약초를 썰었다. 윤설은 한동안 말이 없다가 내가 썬 걸 전부 다시 썰었다.');
    } },
    { at: 70, run: async () => {
      await narr('윤설이 사흘째 쪽잠만 자고 있었다. 다친 사람 붕대를 갈다가 앉은 채로 졸았다.');
      await say('me', '좀 주무세요.');
      await say('yun', '이것만 하고요.');
      await say('me', '아까도 그러셨어요. 밥은 드셨어요?');
      await say('yun', '…언제 먹었더라.');
      await narr('부엌을 빌려 면을 뽑았다. 물이 끓으면 면을 넣고, 넘치려고 할 때 찬물을 한 번 끼얹는다. 곽 아주머니가 가르쳐 준 건 거기까지였다.');
      await say('yun', '이거 {나} 씨가 만든 거예요? 국물이 왜 이래요. 맹물이에요?', 'a');
      await say('me', '국물은 아직 안 배웠어요.');
      await say('yun', '그러면서 점소이였어요?', 'h');
      ctx.cg('bond_yun');
      await narr('윤설은 투덜거리면서 국물까지 다 마셨다. 그러고는 그릇을 내려놓자마자 그 자리에서 잠들었다. 며칠 뒤 장부를 슬쩍 봤더니 그날 날짜 옆에 이렇게 적혀 있었다. ‘국수 한 그릇. 맛없음. 외상 없음.’');
      ctx.cgOff();
      await say('yun', '훔쳐보지 마요. 그리고 이거 가져가요. 금창약 넣는 주머니예요. 칼 차는 자리에 묶어 두면 왼손으로도 꺼낼 수 있어요.', 'b');
      keep('b_yun');
    } },
    { lover: 1, at: 80, run: async () => {
      await say('yun', '왼손 줘 봐요.');
      await narr('윤설이 내 손목을 짚었다. 맥을 보는 줄 알았는데 한참이 지나도 손을 놓지 않았다.');
      await say('me', '어디 안 좋아요?');
      await say('yun', '아니요. 그냥 잡은 거예요. 의원은 그냥 잡으면 안 돼요?', 'b');
      await say('me', '돼요.');
      await say('yun', '아버지가 물어보셨어요. 저 사람 어디가 좋으냐고요.');
      await say('me', '뭐라고 하셨어요?');
      await say('yun', '자꾸 다쳐서 좋다고 했어요.', 'h');
      await say('me', '그게 좋은 거예요?');
      await say('yun', '제가 없으면 안 되는 사람이잖아요.', 'h');
    } },
  ],
  so: [
    { at: 15, run: async () => {
      await say('so', '야, 손 풀렸어? 한판 하자. 지는 사람이 술 사기.', 'h');
      await say('me', '저 돈 없는데요.');
      await say('so', '그러니까 이겨야지.', 'h');
      await ctx.duel({ foes: ['so_rival'], arena: 'ring', bgm: 'boss', title: '내기 비무', yieldAt: .5, optional: true, noLoot: true, expMul: .2 });
      await say('so', '술은 내가 산다. 대신 하나만 말해 줘. 너 왜 맨날 왼발부터 나가?');
      await say('me', '걸레질할 때 버릇이에요.');
      await say('so', '걸레질? 너 지금 나 놀려?', 'a');
      await say('me', '진짜예요.');
      await say('so', '진짜 같아서 더 열받네.', 'a');
    } },
    { at: 40, run: async () => {
      await narr('소연하가 칼집 하나를 닦고 있었다. 칼은 없고 빈 칼집이었다.');
      await say('me', '칼은 어디 갔어요?');
      await say('so', '사부님이 들고 나갔어. 십칠 년 전에. 칼집은 두고.', 's');
      await say('me', '왜 칼집을 두고 가요?');
      await say('so', '그걸 몰라서 십칠 년째 닦고 있어.', 's');
      await say('so', '나 여섯 살 때 벽수궁 문 앞에 버려졌거든. 사부님이 주워다 키웠어. 밥 먹이고 칼 쥐는 법 가르쳐 주고, 어느 날 금방 온다고 나가서 안 왔어.', 's');
      await say('so', '칼집을 두고 갔다는 건 돌아올 생각이었다는 거잖아. 안 그래?', 's');
      const c = await choice('소연하가 칼집에서 눈을 떼지 않는다.', ['그럴 거라고 말해 준다', '칼을 뽑아 들고 나갔다는 뜻일 수도 있다고 말한다']);
      if (c === 0) { await say('me', '그럴 거예요.'); await say('so', '너 거짓말 진짜 못한다. 그래도 고맙다.', 'h'); }
      else { await say('me', '칼을 뽑아 들고 나갔다는 뜻일 수도 있어요.'); await say('so', '…야. 그 말은 내가 혼자 있을 때 하루에 열 번씩 해. 그걸 대놓고 하냐, 너는.', 'a'); ctx.love('so'); }
    } },
    { at: 70, run: async () => {
      await say('so', '벽수궁에서 편지 왔어. 돌아오래. 객으로 나간 지 너무 오래됐다고.');
      await say('me', '가실 거예요?');
      await say('so', '돌아가면 사부님 얘기는 입에 올리지 말라는 거고, 안 가면 파문이야.', 's');
      await say('so', '넌 어땠어? 군적에서 이름 지워졌을 때.');
      await say('me', '지운 건 저쪽이고요. 저는 아무것도 안 했어요. 그날도 밥은 먹었고요.');
      await say('so', '뭐야, 그게 위로야?');
      await say('me', '아니요. 그냥 그랬다고요. 이름이 지워져도 밥은 넘어가더라고요.');
      await narr('소연하는 소리 내어 웃더니 편지를 접어 불에 던졌다.');
      await say('so', '나 이제 갈 데 없다. 네가 책임져.', 'h');
      await say('me', '네?', 'b');
      await say('so', '농담이야. 반쯤은. 이거 받아. 사부님이 칼집에 달아 둔 매듭이야. 나한테 있어 봤자 칼집만 더 쳐다보게 되니까.', 'h');
      keep('b_so');
    } },
    { lover: 1, at: 80, run: async () => {
      await say('so', '일어나. 달 떴어.');
      await say('me', '지금요?');
      await say('so', '왼발 봐 준다고 했잖아. 낮에는 사람들이 봐서 싫어.');
      ctx.cg('bond_so');
      await narr('달빛 아래서 한참을 겨뤘다. 소연하가 칼등으로 내 왼 발목을 툭 쳤다.');
      await say('so', '여기. 여기가 늦어. 내가 왜 네 왼발에 이렇게 매달리는 줄 알아?');
      await say('me', '왜요?');
      await say('so', '그 걸음을 보면 사부님 생각이 나야 하는데 요즘은 네 생각이 나거든. 그게 이상해서.', 'b');
      await say('so', '뭘 봐. 칼 들어.', 'b');
    } },
  ],
  clan_dang: [
    { at: 15, run: async () => {
      await say('clan_dang', '차 한잔 해요. 세 잔 중에 하나는 제가 손을 좀 봤어요.', 'h');
      await say('me', '그걸 왜 말해 줘요?');
      await say('clan_dang', '안 말해 주면 재미없잖아요. 골라요.', 'h');
      await choice('찻잔 셋이 놓여 있다.', ['왼쪽 잔', '가운데 잔', '오른쪽 잔']);
      await narr('눈을 감고 들이켰다. 쓴맛이 혀끝에 남았다가 사라졌다. 숨을 세어 봤는데 멀쩡했다.');
      await say('me', '뭘 탔어요?');
      await say('clan_dang', '아무것도요. 세 잔 다 그냥 차예요.', 'h');
      await say('me', '그럼 왜 그랬어요?');
      await say('clan_dang', '당가에 오는 손님들은 다들 입술만 대고 내려놔요. 잔을 비우는 사람이 있나 궁금했거든요.');
    } },
    { at: 40, run: async () => {
      await say('clan_dang', '제가 어릴 때 뭘 먹고 컸는지 알아요?');
      await say('me', '밥이요?');
      await say('clan_dang', '독이요. 당가 아이들은 세 살부터 하루에 한 방울씩 먹어요. 몸에 배면 웬만한 건 안 듣거든요.');
      await say('clan_dang', '덕분에 안 죽어요. 대신 혀가 고장 났어요. 단맛은 열 살 때쯤 없어졌고, 짠맛만 조금 남았어요.', 's');
      await say('me', '그럼 차는요?');
      await say('clan_dang', '뜨거운 물이죠. 사람들이 향이 어떻다고 하면 고개만 끄덕여요.');
      const c = await choice('당소연이 빈 찻잔을 손끝으로 돌린다.', ['짠 국수를 사 주겠다고 한다', '미안하다고 한다']);
      if (c === 0) {
        await say('me', '그럼 짠 거 드시러 가요. 국수는 제가 좀 알아요.');
        await say('clan_dang', '저 국수 싫어하는 거 몰라요? 남들 맛있다는 얼굴 보는 게 싫어서 그래요.', 'a');
        await narr('그래도 따라나섰다. 주인에게 소금을 세 배로 넣어 달라고 했더니 미친놈 보듯 봤다. 당소연은 국물을 한 숟갈 뜨고 한참 가만히 있었다.');
        await say('clan_dang', '…이건 좀 알겠네요.', 'h');
      } else { await say('clan_dang', '왜 {나} 씨가 미안해요. 동정은 독보다 써요. 그건 제가 맛을 알아요.', 'a'); }
    } },
    { at: 70, run: async () => {
      await say('clan_dang', '앞으로 {나} 씨 찻잔은 이걸로 해요.');
      ctx.cg('bond_dang');
      await narr('작은 흰 잔이었다. 뒤집어 보니 밑바닥에 내 이름이 새겨져 있었다.');
      await say('clan_dang', '당가에서 찻잔에 이름을 새기는 건 두 경우뿐이에요. 독을 탈 사람이거나, 절대 안 탈 사람이거나.', 'h');
      await say('me', '제 건 어느 쪽이에요?');
      await say('clan_dang', '매일 아침 마셔 보면 알겠죠.', 'h');
      keep('b_dang');
    } },
    { lover: 1, at: 80, run: async () => {
      await say('clan_dang', '어제 국물을 마셨는데요. 짠맛 말고 뭐가 하나 더 났어요.');
      await say('me', '뭐요?');
      await say('clan_dang', '몰라요. 처음 먹어 보는 맛이라서요. 사람들이 달다고 하는 게 그런 건가 봐요.', 'b');
      await say('me', '약과 사다 드릴까요?');
      await say('clan_dang', '…{나} 씨는 진짜 눈치가 없네요.', 'b');
    } },
  ],
  clan_moyong: [
    { at: 15, run: async () => {
      await say('clan_moyong', '그 걸음을 가르쳐 주시오.');
      await say('me', '걸레질이요?');
      await say('clan_moyong', '장난치지 말라고 했소.', 'a');
      await say('me', '진짜 걸레질이에요. 허리 세우고 왼발로 밀고, 오른발은 따라오게 두는 거예요.');
      await narr('모용설이 치맛자락을 걷고 마당을 걸었다. 세 걸음 만에 제 발에 걸려 넘어졌다.');
      await say('clan_moyong', '…못 본 것으로 하시오.', 'b');
      await say('me', '네.');
      await say('clan_moyong', '아니오. 보았으면 돌려주어야 하오. 그대도 넘어져 보시오.', 'a');
      const c = await choice('모용설이 흙을 털지도 않고 이쪽을 본다.', ['넘어져 준다', '싫다고 한다']);
      if (c === 0) await narr('일부러 넘어졌다. 모용설이 입을 가리고 어깨를 떨었다. 웃는 건지 화가 난 건지 끝내 알 수 없었다.');
      else await say('clan_moyong', '모용가에서 받은 것을 안 돌려주겠다는 말이오? 적어 두겠소.', 'a');
    } },
    { at: 40, run: async () => {
      await say('clan_moyong', '모용가에는 초식이 하나도 없소.');
      await say('me', '네?');
      await say('clan_moyong', '상대 초식을 받아서 돌려줄 뿐이오. 남이 치지 않으면 우리 칼은 움직이지 않소. 어릴 때부터 거울 앞에서 배운 것은 남의 표정과 말투였소.');
      await say('me', '그럼 지금 말투는요?');
      await say('clan_moyong', '증조모의 말투요.');
      await say('me', '소저 말투는 없어요?');
      await say('clan_moyong', '…그런 것은 생각해 본 적이 없소.', 'b');
      const c = await choice('모용설이 대답할 말을 찾지 못하고 있다.', ['아무 말이나 해 보라고 한다', '천천히 찾아보라고 한다']);
      if (c === 0) {
        await say('me', '아무 말이나 해 보세요. 증조모님 말고요.');
        ctx.cg('bond_mo');
        await say('clan_moyong', '뭐, 뭐라고 해야 하오. 그러니까… 배고파.', 'b');
        await say('me', '그거네요.');
        await say('clan_moyong', '잊어 주시오.', 'b');
      } else await say('clan_moyong', '천천히라. 증조모님은 그런 말을 안 하셨소.');
    } },
    { at: 70, run: async () => {
      await say('clan_moyong', '남궁세가에서 혼담이 왔소. 남궁진의 오라비요.');
      await say('me', '좋은 자리네요.');
      await say('clan_moyong', '아버지도 그렇게 말씀하셨소. 말투까지 같구려.', 's');
      await say('me', '소저 생각은요?');
      await say('clan_moyong', '모용가 사람은 받은 것을 돌려줄 뿐이오. 혼담을 받았으니 혼인으로 돌려주는 것이 법도요.');
      await say('me', '싫으면 안 돌려줘도 되잖아요.');
      await say('clan_moyong', '그대는 쉽게 말하오.', 's');
      await narr('며칠 뒤 남궁세가 사람들이 굳은 얼굴로 세가 거리를 떠나는 걸 봤다.');
      await say('clan_moyong', '말했소. 싫다고. 내 말로 한 것은 처음이오. 아버지는 사흘째 밥을 안 드시오.', 'h');
      await say('clan_moyong', '이것은 받으시오. 돌려주는 것이 아니라 그냥 주는 것이오. 어떻게 하는 건지 몰라서 그냥 내미오.', 'b');
      keep('b_mo');
    } },
    { lover: 1, at: 80, run: async () => {
      await say('clan_moyong', '초식을 하나 만들었소. 보시오.', 'h');
      await narr('왼발로 밀고 오른발이 따라오는 걸음에 칼을 얹은 초식이었다. 세 걸음째에서 또 넘어질 뻔했다.');
      await say('me', '이름은 뭐예요?');
      await say('clan_moyong', '아직 없소. 모용가에는 초식 이름을 지어 본 사람이 없소.');
      await say('clan_moyong', '그리고 말이오. 그대 앞에서는 증조모 말투를 그만 쓰려고 하오.', 'b');
      await say('me', '그럼 뭐라고 하시게요?');
      await say('clan_moyong', '…배고파.', 'b');
    } },
  ],
  clan_namgung: [
    { at: 15, run: async () => {
      await say('clan_namgung', '네가 말하는 곽씨 국수라는 게 뭐냐.');
      await say('me', '국수요? 그냥 국수인데요.');
      await say('clan_namgung', '세가 사람들 눈에 안 띄는 데서 먹어야 한다. 앞장서라.');
      await narr('남궁진은 삿갓까지 쓰고 금봉 객잔 구석에 앉았다. 국수를 받아 놓고 젓가락을 어떻게 드는지 한참 내려다봤다.');
      await say('clan_namgung', '남궁가 밥상에는 열두 가지가 오른다. 한 그릇에 다 들어 있는 건 처음 본다.');
      await say('me', '맛은 어때요?');
      await say('clan_namgung', '나쁘지 않다. …한 그릇 더.', 'b');
    } },
    { at: 40, run: async () => {
      await narr('새벽에 세가 거리를 지나는데 남궁세가 담장 안에서 칼바람 소리가 났다. 남궁진이 혼자 검을 휘두르고 있었다.');
      await say('me', '벌써 일어나셨어요?');
      await say('clan_namgung', '구백십이. 말 걸지 마라. 구백십삼.', 'a');
      ctx.cg('bond_nam');
      await narr('천 번을 채우고 나서야 검을 내렸다. 손바닥에 피가 배어 있었다.');
      await say('clan_namgung', '오라비는 오백 번이면 된다. 나는 천 번을 해야 장로들이 같은 자리에 세워 준다.');
      await say('me', '왜요?');
      await say('clan_namgung', '딸이니까.', 'a');
      await say('clan_namgung', '네가 출신이 그렇게 중요하냐고 물었지. 나는 태어난 집안 때문에 이러고 있다. 그때 네 말이 듣기 싫었던 건 그래서다.', 's');
      const c = await choice('남궁진이 피 묻은 손을 소매로 닦는다.', ['붕대를 감아 주겠다고 한다', '내일은 천 한 번을 하라고 한다']);
      if (c === 0) { await say('me', '손 줘 보세요. 붕대는 제가 많이 감아 봤어요.'); await say('clan_namgung', '…아프다. 살살 해라.', 'b'); }
      else { await say('me', '내일은 천 한 번 하세요. 오라버니가 천 번을 하게요.'); await say('clan_namgung', '건방진 놈.', 'h'); ctx.love('clan_namgung'); }
    } },
    { at: 70, run: async () => {
      await say('clan_namgung', '장로회가 내일 후계를 정한다. 오라비가 되겠지.');
      await say('me', '비무로 정하면 안 돼요?');
      await say('clan_namgung', '그런 법은 없다.');
      await say('me', '그 법은 누가 만들었는데요?');
      await say('clan_namgung', '…….');
      await narr('이튿날 세가 거리가 떠들썩했다. 남궁진이 장로회 앞에서 오라비에게 칼을 뽑았다는 것이다.');
      await say('clan_namgung', '이겼다. 장로 셋이 뒷목을 잡고 쓰러졌다.', 'h');
      await say('me', '축하해요.');
      await say('clan_namgung', '네 탓이다. 이건 내 검끈이다. 천 번 휘두를 때마다 손에 감던 것이니 비싼 물건은 아니다. 가져가라.', 'b');
      keep('b_nam');
    } },
    { lover: 1, at: 80, run: async () => {
      await say('clan_namgung', '가문 사람들이 네 출신을 묻더군.');
      await say('me', '뭐라고 하셨어요?');
      await say('clan_namgung', '객잔 점소이라고 했다.');
      await say('me', '다들 화내시죠?');
      await say('clan_namgung', '장로 하나가 밥상을 엎었다. 앞으로 내가 국수를 끓여 먹겠다고 했더니 나머지 둘이 드러누웠다.', 'h');
      await say('me', '끓일 줄 아세요?');
      await say('clan_namgung', '모른다. 가르쳐라.', 'b');
    } },
  ],
  baekrang: [
    { at: 15, run: async () => {
      await say('baekrang', '손 좀 내밀어 봐요.', 'h');
      await narr('백랑이 내 손바닥에 주사위 둘을 올려놓았다. 던져 보니 합이 홀이었다. 다시 던져도 홀이었다. 다섯 번을 던졌는데 다섯 번 다 홀이었다.');
      await say('me', '왜 계속 홀이에요?');
      await say('baekrang', '안쪽에 납을 넣었거든요.', 'h');
      await say('me', '그럼 저번에 저랑 한 것도?');
      await say('baekrang', '어머, 그때는 안 그랬어요. 돈 안 되는 손님한테는 안 쓰거든요.', 'h');
      await say('me', '이걸 왜 알려 주는데요?');
      await say('baekrang', '단골한테는 미리 알려 줘요. 그래야 오래 오거든요.', 'h');
    } },
    { at: 40, run: async () => {
      await say('baekrang', '제가 얼마였는지 알아요?');
      await say('me', '네?');
      await say('baekrang', '은자 석 냥이요. 일곱 살 때요. 흉년에 아버지가 하오문에 팔았는데, 문주님이 값을 깎아서 샀대요.', 's');
      await say('baekrang', '그때부터 뭐든 값을 먼저 말하는 버릇이 들었어요. 값을 알면 마음이 편하거든요.', 's');
      await say('me', '저는 값도 없었어요. 군에서 끌고 가면서 한 푼도 안 줬어요.');
      await say('baekrang', '어머, 그건 제가 이겼네요.', 'h');
      await narr('백랑이 깔깔 웃었다. 나도 어쩐지 웃음이 났다.');
    } },
    { at: 70, run: async () => {
      await say('baekrang', '오늘은 공짜로 하나 알려 줄게요.', 'h');
      await say('me', '공짜요? 어디 아파요?');
      await say('baekrang', '잘 들어요. 혈의방에 점소이 머리값이 들어왔어요. 은자 천 냥이요. 오늘 밤에 둘이 온대요.');
      await narr('밤이 되자 정말로 지붕에서 기왓장 밟는 소리가 났다.');
      const lv = S().lv; Object.assign(FOES.hitman, { hp: 70 + lv * 24, atk: 8 + lv * 1.9, def: 2 + lv * .4 });
      await ctx.duel({ foes: ['hitman', 'hitman'], arena: 'yard', bgm: 'fight', title: '혈의방 자객', optional: true });
      ctx.cg('bond_bae');
      await narr('이튿날 다시 만났더니 백랑의 왼손 새끼손가락에 붕대가 감겨 있었다.');
      await say('me', '손은 왜 그래요?');
      await say('baekrang', '하오문에 규칙이 있거든요. 소문을 공짜로 넘기면 손가락 한 마디를 문에 내야 해요.');
      await say('me', '…왜 그랬어요?');
      await say('baekrang', '값을 매겨 봤는데요. 손가락 한 마디보다는 비싸더라고요.', 'h');
      await say('baekrang', '이거 가져가요. 납 넣은 주사위예요. 저랑 할 때는 쓰지 말고요.', 'h');
      keep('b_bae');
    } },
    { lover: 1, at: 80, run: async () => {
      await say('baekrang', '저 오늘 큰돈 썼어요.', 'h');
      await say('me', '뭘 샀는데요?');
      await say('baekrang', '저요. 은자 석 냥에 스무 해치 이자를 얹어서 문주님한테 제 값을 치렀어요.', 'h');
      await say('me', '얼마 나왔어요?');
      await say('baekrang', '비밀이에요. 이제 제 값은 제가 정하거든요.', 'h');
      await say('baekrang', '그러니까 잘 들어요. 당신한테는 안 팔아요. 그냥 줄 거예요.', 'b');
    } },
  ],
  hyeok: [
    { at: 15, ok: () => !!F().cross, run: async () => {
      await narr('구화성 저잣거리를 지나다 혁련하가 걸음을 멈췄다. 엿장수가 가위를 철컥거리며 노래를 하고 있었고, 둘러선 사람들이 웃고 있었다.');
      await say('hyeok', '여쭐 것이 있습니다. 저 사람들은 왜 웃습니까.');
      await say('me', '재미있어서요.');
      await say('hyeok', '무엇이 재미있습니까.');
      await say('me', '글쎄요. 저 아저씨 가위질이 웃기잖아요.');
      await narr('혁련하는 엿장수의 손을 한참 들여다봤다.');
      await say('hyeok', '천산에서는 제단 앞에서 웃으면 사흘을 굶습니다.');
      await say('me', '여기는 제단이 아니에요.');
      await say('hyeok', '그렇습니까. 그럼 조금 더 보고 가겠습니다.');
    } },
    { at: 40, ok: () => !!F().cross, run: async () => {
      await say('hyeok', '혁련은 교주님의 성입니다. 하는 제가 뽑힌 날 아침 노을을 보고 붙인 이름입니다. 부모가 지어 준 이름은 모릅니다.');
      await say('me', '기억 안 나세요?');
      await say('hyeok', '네 살이었습니다. 당신은 번호로 불렸다고 들었습니다. 그때도 이름이 있었습니까.');
      await say('me', '있었어요. 아무도 안 불러서 밤에 혼자 불렀어요. 안 그러면 잊어버리거든요.');
      await say('hyeok', '혼자서요.', 's');
      await say('me', '네.');
      await say('hyeok', '…어떻게 부르는 것입니까.');
      await narr('그날 밤 잠이 안 와서 뒤척이는데 어둠 속에서 아주 작은 소리가 났다. 혁련하가 자기 이름을 불러 보고 있었다.');
    } },
    { at: 70, ok: () => !!F().cross, run: async () => {
      await say('hyeok', '향을 하나 만들었습니다. 달맞이꽃에 국수 끓이는 김을 쐬었습니다.');
      await say('me', '국수 김이요?');
      await say('hyeok', '교리에 없는 향입니다. 제단에 올릴 수 없습니다.');
      await say('me', '그럼 어디에 써요?');
      await say('hyeok', '모르겠습니다. 저는 잠이 잘 오지 않습니다. 그런데 이 향을 피우면 잠이 옵니다. 당신 곁에서도 그렇습니다.', 'b');
      await say('hyeok', '가져가십시오. 교리에 없는 물건이니 제단에서는 찾지 않을 것입니다.');
      keep('b_hyeok');
    } },
    { lover: 1, at: 80, ok: () => !!F().cross, run: async () => {
      await say('hyeok', '사람들이 웃는 이유를 하나 알았습니다.', 'h');
      await say('me', '뭔데요?');
      await say('hyeok', '당신이 아까 문턱에 걸려 넘어질 뻔했습니다.', 'h');
      await say('me', '그게 웃겨요?');
      await say('hyeok', '네.', 'h');
      ctx.cg('bond_hyeok');
      await narr('혁련하가 소리 내어 웃는 걸 처음 들었다. 웃는 법이 서툴러서 기침처럼 들렸다.');
    } },
  ],
  cheol: [
    { at: 15, run: async () => {
      await say('cheol', '시주, 오늘은 소승이 밥을 사겠소.');
      await say('me', '돈이 생기셨어요?');
      await say('cheol', '없소. 마음으로 사겠소. 값은 시주가 치르시오.');
      await say('me', '그건 제가 사는 거잖아요.');
      await say('cheol', '그렇게 따지면 세상에 보시라는 말이 없어지오.');
      await narr('결국 만두 스무 개 값을 내가 냈다. 철우는 열아홉 개를 먹고 마지막 하나를 내 앞으로 밀어 놓았다.');
      await say('cheol', '이게 소승이 사는 것이오.');
    } },
    { at: 40, run: async () => {
      await say('me', '고기는 왜 드시기 시작했어요?');
      await say('cheol', '문을 부수고 나갔다고 했잖소. 산적은 쫓았는데 늦었소. 그 마을에서 열둘을 살리고 셋을 못 살렸소.');
      await say('cheol', '다 끝나고 나니 손자를 잃은 노파가 국을 끓여 왔소. 승복 입은 걸 뻔히 보고도 고깃국을 말이오. 그 집에 남은 마지막 닭이었소.');
      await say('cheol', '안 먹으면 그 노파가 울 것 같아서 먹었소.');
      await say('me', '…….');
      await say('cheol', '맛있었소. 그게 제일 괴로웠소.');
      await say('cheol', '그래서 오늘 저녁은 뭐요, 시주?');
    } },
    { at: 70, run: async () => {
      await say('cheol', '시주, 소림에서 사람이 왔소. 혜각 대사가 보냈다며 주먹밥 세 개를 두고 갔소.');
      await say('me', '주먹밥이요?');
      await say('cheol', '문을 부수고 나오던 날 밤에도 그 양반이 주먹밥 세 개를 쥐여 줬소. 그날 소승을 제일 크게 혼낸 사람도 그 양반이었고.');
      ctx.cg('bond_cheol');
      await narr('철우는 주먹밥을 한참 들여다보더니 하나를 내게 내밀었다. 철우가 먹을 것을 먼저 내미는 건 처음 보았다.');
      await say('cheol', '시주는 소승이 아는 사람 중에 밥을 제일 많이 사 준 사람이오. 갚을 것은 없고, 이거나 받으시오. 소림에서 나올 때 가지고 나온 염주요.');
      keep('b_cheol');
    } },
    { at: 60, ok: () => !F().cheol_dead && !F().c7_done, run: async () => {
      await say('cheol', '시주, 오늘은 밥 말고 부탁이 있소. 소림 아랫마을에 같이 가 주시오.');
      await narr('고깃국을 끓여 주었다는 그 노파가 지난달에 갔다고 했다. 철우는 닭 한 마리를 사 들고 산길을 올랐다. 무덤은 마을 뒤 밭둑에 있었다.');
      await narr('철우가 무덤 앞에 닭을 놓고 경을 외웠다. 목소리가 생각보다 좋았다. 그러고 있으니 소림 스님 같았다.');
      await say('me', '경도 외우시네요.');
      await say('cheol', '이십 년을 외웠는데 문 부순다고 잊히겠소. 고기 먹은 입으로 외워서 효험은 모르겠소만.');
      await narr('경이 끝나자 철우는 닭을 도로 집어 들었다.');
      await say('me', '그걸 드시게요?');
      await say('cheol', '그 노파가 음식 버리면 벌 받는다고 했소.');
      await narr('마을 어귀에 앉아 둘이서 닭을 뜯었다. 철우는 다리 하나를 내 쪽으로 밀어 놓고 한참 강을 보고 있었다.');
      await say('cheol', '시주, 소승이 죽거든 경은 필요 없소. 국이나 한 그릇 끓여 주시오.');
      await say('me', '고기 넣어서요?');
      await say('cheol', '당연한 소리를.');
      F().cheol_soup = true;
    } },
  ],
};

const done = id => (S().bonds || {})[id] || 0;
function next(id) {
  const L = BONDS[id]; if (!L) return null;
  const e = L[done(id)], s = S(); if (!e) return null;
  if ((s.love[id] || 0) < e.at) return null;
  if (e.lover && s.partner !== id && s.married !== id) return null;
  if (e.ok && !e.ok()) return null;
  return e;
}
async function play(id) {
  const e = next(id); if (!e) return; const s = S();
  await e.run();
  (s.bonds = s.bonds || {})[id] = done(id) + 1; s.love[id] = Math.min(100, (s.love[id] || 0) + 4); F()['met_' + id] = true;
}
// 연인이 결전에 달려온다
const JOIN = {
  so: ['so', '늦어서 미안. 왼발 조심하랬지!', 'so_ally'],
  clan_dang: ['clan_dang', '제 찻잔 아직 안 돌려줬잖아요. 죽으면 곤란해요.', 'dang_ally'],
  clan_moyong: ['clan_moyong', '받은 것을 돌려주러 왔소. 그대에게 받은 것이 많아서 말이오.', 'moyong_ally'],
  clan_namgung: ['clan_namgung', '네가 죽으면 국수는 누가 가르치냐. 비켜라, 내가 먼저 친다.', 'namgung_ally'],
  baekrang: ['baekrang', '받을 게 남았거든요. 외상은 죽어도 받아요.', 'baek_ally'],
  hyeok: ['hyeok', '문은 열어 두겠다고 말씀드렸습니다.', 'hyeok_ally'],
};
async function join(side, allies = []) {
  const q = S().married || S().partner; if (!q) return null;
  if (side === 'ma' && (q === 'so' || q === 'yun')) return null; // 마교 길에서는 등을 돌린 사람들
  if (q === 'yun') { await say('yun', '금창약 챙겨 왔어요. 왼쪽 조심해요.'); S().potion += 3; toast('금창약 3개를 받았다'); return null; }
  const j = JOIN[q]; if (!j || allies.includes(j[2])) return null; // 이미 곁에 있는 사람은 다시 달려오지 않는다
  await say(j[0], j[1]); return j[2];
}
// 결말에 붙는 그 사람의 뒷이야기
const AFTER = {
  yun: '윤설은 지금도 장부에 내 몸 어디가 다쳤는지 적는다. 요즘은 왼쪽이 좀 줄었다고 한다.',
  so: '소연하와는 아직도 달만 뜨면 칼을 맞댄다. 빈 칼집은 우리 집 벽에 걸려 있다.',
  clan_dang: '내 찻잔은 여전히 따로 쓴다. 매일 아침 마셔 보는데 아직은 살아 있다.',
  clan_moyong: '모용설의 말투가 요즘 조금씩 이상해졌다. 배고프다는 말을 제일 잘한다.',
  clan_namgung: '남궁세가 가주가 끓이는 국수는 언제나 불어 있다. 아무도 그 말을 못 한다.',
  baekrang: '백랑은 여전히 뭐든 값부터 말한다. 내 값만은 아직 말해 주지 않았다.',
  hyeok: '혁련하는 아직도 웃는 법이 서툴다. 내가 문턱에 걸릴 때만 기침처럼 웃는다.',
};
async function ending() {
  const q = S().married || S().partner; if (q && AFTER[q]) await narr(AFTER[q]);
  if (F().kids_saved && !F().plague) await narr('창고 밑에서 데리고 나온 아이들은 나무패를 벗고 이름을 새로 받았다. 서른한 명 이름을 짓느라 곽 아주머니가 사흘을 앓았다.');
}
G.bond = { next, play, done, join, ending, total: id => (BONDS[id] || []).length };
