// 1부 1장: 객잔의 며칠. 불이 나기 전의 일상을 플레이한다
import { G, Sound, fadeTo, toast } from './core.js';
import { Story, ctx, say, narr, choice } from './ctx.js';
import { WHO } from './dialog.js';
import { FOES } from './foes.js';
import { step, set, at, evening, lastMorning, firstMeal } from './story1.js';

const F = () => G.S.flags;
FOES.baek_train = { name: '백 노인', spr: 'chars/OldMan3', hp: 99999, atk: 3, def: 40, spd: 40, exp: 0, silver: 0, pause: .9, moves: ['dart3', 'quick'], boss: 1, poise: 99999, keep: 70, title: '장작 던지는' };

async function errands() {
  await say('gwak', '일어났냐. 오늘은 세 군데다. 약방에 외상값 갚고, 대장간에서 내 칼 찾아오고, 나루에서 생선 받아 와라.');
  await say('me', '세 군데를 언제 다 가요. 점심 장사는요?');
  await say('gwak', '네 다리는 뒀다 뭐 하냐. 그리고 약방 딸한테 쓸데없는 말 하지 말고.');
  await say('me', '제가 무슨 말을 해요.');
  await say('gwak', '군막 얘기 말이다. 동네 사람들 겁먹는다. 가!');
  F().errand = true; ctx.goal('심부름: 윤씨 약방, 대장간, 나루터 (마을의 ! 표시)');
}
async function yunFirst() {
  await say('yun', '달맞이 객잔이요? 외상 장부 가져올게요.');
  await say('me', '곽 아주머니 심부름이에요. 외상값 가져왔습니다.');
  await say('yun', '…칼 잡힌 낭인이 걸레질한다더니 그쪽이군요. 세어 볼게요. 맞네요.');
  await say('yun', '그 약, 계속 쓰시죠? 어깨에 바르는 거요.');
  await say('me', '어깨요? 아주머니 어깨가 왜요?');
  await say('yun', '몰라요? 오른쪽 어깨에 오래된 칼자국이 있어요. 아버지가 십 년 넘게 약을 지어 드렸어요.');
  await say('yun', '국자질을 아무리 세게 해도 그런 상처는 안 생겨요.');
  await say('me', '칼자국은 제가 좀 알아요. 칼을 오래 쓴 사람 어깨에 남는 자리가 있죠. …물어보면 국자가 날아오겠지만요.');
  await say('yun', '그쪽 걸음이요, 왜 그렇게 걸어요? 왼발만 미는 것 같은데.');
  await say('me', '걸레질 때문에요. 구석방 영감님이 시켜서.');
  await say('yun', '이상한 객잔이네요.');
  F().e_yun = true; F().met_yun = true; ctx.note('약방 윤설: 곽 아주머니 오른쪽 어깨에 오래된 칼자국이 있다.'); await doneCheck();
}
async function smithFirst() {
  await say('smith', '왔냐. 곽 아주머니 칼 다 갈아 놨다. 조심해라. 나도 손을 베었다.');
  await say('me', '식칼 가지고 뭘 그렇게 조심해요.');
  await say('smith', '이게 식칼이냐? 쇠가 다르다. 이 동네에서 이런 쇠를 쓰는 집은 없어. 내가 삼십 년을 쳤는데 나도 못 만든다.');
  await say('smith', '어디서 났냐고 물었더니 무를 썰어 보이더라. 도마까지 잘렸지.');
  await say('me', '아주머니 원래 그래요. 도마 값도 저한테 물렸어요.');
  await say('smith', '너 낭인이었다며. 칼은 어쩌고 쟁반을 들고 다니냐.');
  await say('me', '밥값으로 잡혔어요. 한 달째 이자가 붙고 있어요.');
  await say('smith', '…그 아주머니가 사람을 그렇게 오래 붙잡아 두는 건 처음 본다.');
  F().e_smith = true; await doneCheck();
}
async function boatFirst() {
  await say('boat', '왔구나. 오늘 잉어가 좋다. 곽 아주머니 몫이다.');
  await say('me', '고맙습니다. 이 동네는 다들 곽 아주머니를 어려워하시네요.');
  await say('boat', '너 아직 모르는구나. 그믐이 모레다. 그 집 문 앞에 봉투가 놓이는 날이지.');
  await say('me', '봉투요?');
  await say('boat', '달마다 은자 다섯 냥. 누가 두고 가는지 십 년 넘게 아무도 못 봤다. 곽씨는 그 돈으로 사람을 사서 어딘가로 보내더라.');
  await say('me', '뭘 찾는 건데요?');
  await say('boat', '…세상에 공짜 은자는 없다. 그건 물어보지 마라. 강물도 어디서 오는지 다들 안 물어보고 쓰잖냐.');
  F().e_boat = true; await doneCheck();
}
async function doneCheck() {
  if (F().e_yun && F().e_smith && F().e_boat) ctx.goal('객잔으로 돌아가 곽 아주머니에게 알리기');
}
async function backHome() {
  await say('gwak', '늦었다. 칼 줘 봐. …그래, 잘 갈았네.');
  await say('me', '아주머니, 어깨 아프세요?');
  await say('gwak', '누가 그러디.');
  await say('me', '…아무도요.');
  await say('gwak', '약방 딸하고 쓸데없는 말 하지 말랬지. 국수 그릇이나 내와라. 손님 온다.');
  await evening();
}
async function training() {
  await say('baek', '일어났냐. 어제 왈패를 막는 걸 보니 칼 쓰던 버릇이 남았더구나. 사람 죽이는 발이야. 왼발이 늦다.');
  await say('me', '어르신, 방값이요.');
  await say('baek', '마당으로 나와라. 방값 얘기는 거기서 하자.');
  await say('me', '진짜요? 은자 주시게요?');
  await say('baek', '내가 장작을 던지마. 안 맞으면 네가 이긴 거고, 맞으면 또 내일이다.');
  await say('me', '그게 무슨 방값이에요!');
  await ctx.duel({ foes: ['baek_train'], arena: 'yard', title: '장작 피하기', bgm: 'peaceful', survive: 20, expMul: 0, tip: '<b>K 경공</b>: 잠깐 빠르게 움직이고 그동안 맞지 않습니다. 날아오는 장작을 피해 20초를 버티세요.' });
  await say('baek', '몇 개 맞았지만 넘어지지는 않았구나.');
  await say('me', '장작을 사람한테 던지는 분이 어디 있어요.');
  await say('baek', '강호에는 칼을 던지는 놈도 있다.');
  await say('me', '전쟁터에는 더 많았어요. 어르신은 강호에 계셨어요?');
  await say('baek', '술집에 있었다. 술 가져와라.');
  F().trained = true; ctx.goal('곽 아주머니에게 가기');
}
async function noodleNight() {
  await say('gwak', '장작을 맞고 다니냐. 이리 와. 면 뽑는 거나 배워라.');
  await say('me', '갑자기요?');
  await say('gwak', '내가 언제까지 끓일 줄 알고. 물은 끓기 직전에 멈추고, 면은 그릇보다 먼저 올리는 거다. 국물은 비밀이고.');
  await say('me', '가르쳐 주시면서 왜 비밀이에요?');
  await say('gwak', '다 알려 주면 네가 나갈 거 아니냐.');
  await say('me', '밥값만 갚으면 나갈 사람인데요.');
  await say('gwak', '…그래. 그 밥값이 아직 많이 남았다.');
  await narr('밤이 깊어 불을 끄러 나왔다.\n곽 아주머니가 구석방 문 앞에 서 있었다.\n국 한 그릇을 문 앞에 내려놓고, 한참을 서 있다가, 말없이 돌아갔다.');
  await say('me', '…방값을 그렇게 받아 내라시더니.');
  await narr('그믐날 새벽. 객잔 문 앞에 봉투가 놓여 있었다.\n문을 열었을 때, 골목 끝으로 삿갓 하나가 사라지는 것이 보였다.');
  await say('me', '저기요! 잠깐만요!');
  await say(null, '봉투에는 은자 다섯 냥과, 이번에는 쪽지가 없었다. 구석방에 불은 꺼져 있었다.');
  ctx.note('그믐 새벽, 봉투를 두고 가는 삿갓을 보았다. 곽 아주머니는 밤에 구석방 앞에 국을 두고 간다.');
  set('p5'); await lastMorning();
}
async function dayTalkImpl(who) {
  if (who === 'gwak') {
    if (at('p3') && !F().errand) { await errands(); return true; }
    if (at('p3') && F().e_yun && F().e_smith && F().e_boat) { await backHome(); return true; }
    if (at('p3')) { await say('gwak', '아직 안 갔냐? 약방, 대장간, 나루다.'); return true; }
    if (at('p4') && F().trained) { await noodleNight(); return true; }
    return false;
  }
  if (who === 'baek' && at('p4') && !F().trained) { await training(); return true; }
  return false;
}
G.life.dayTalk = dayTalkImpl;
G.life.dayMark = who => who === 'gwak' ? (at('p3') && (!F().errand || (F().e_yun && F().e_smith && F().e_boat))) || (at('p4') && !!F().trained) : at('p4') && !F().trained;

Story.providers.push(function content7(id) {
  const n = [], tr = [];
  if (at('p0a')) {
    if (id === 'inn') tr.push({ x: 0, y: 0, w: 99, h: 99, when: () => at('p0a'), run: firstMeal });
    if (id === 'cheongha') {
      n.push({ id: 'boat', spr: 'OldMan2', x: 22.5, y: 27.8, dir: 3, talk: async () => { await say('boat', '내렸으면 비켜라. 밥은 마을 위쪽 달맞이 객잔이다. 칼 찬 손님은 돈부터 내고.'); } });
      n.push({ id: 'kid', spr: 'Child', x: 16, y: 16.8, dir: 3, talk: async () => { await say('kid', '와, 칼이다! 진짜 칼이에요?'); await say('me', '…밥집이 어디냐.'); await say('kid', '달맞이 객잔요! 욕을 먹어야 맛있대요!'); } });
      n.push({ id: 'town', spr: 'Villager', x: 29, y: 16.6, dir: 2, talk: async () => { await say('town', '낭인이구먼. 이 마을에선 칼 뽑지 말게. 곽씨 국자가 더 빠르네.'); } });
    }
  }
  if (at('p3')) {
    if (id === 'clinic') n.push({ id: 'yun', spr: 'Princess', x: 3.5, y: 4.8, dir: 0, mark: () => !!F().errand && !F().e_yun, talk: async () => { if (F().errand && !F().e_yun) await yunFirst(); else await say('yun', '장부는 잘 있어요.'); } });
    if (id === 'smith') n.push({ id: 'smith', spr: 'Caveman2', x: 4, y: 4.6, dir: 0, mark: () => !!F().errand && !F().e_smith, talk: async () => { if (F().errand && !F().e_smith) await smithFirst(); else await say('smith', '불 앞에서 얼쩡대지 마라.'); } });
    if (id === 'cheongha') {
      n.push({ id: 'boat', spr: 'OldMan2', x: 22.5, y: 27.8, dir: 3, mark: () => !!F().errand && !F().e_boat, talk: async () => { if (F().errand && !F().e_boat) await boatFirst(); else await say('boat', '강은 오늘도 잘 흐른다.'); } });
      n.push({ id: 'kid', spr: 'Child', x: 16, y: 16.8, dir: 3, talk: async () => { await say('kid', '진짜 낭인이에요? 사람 죽여 봤어요?'); await say('me', '국수 식는다. 저리 가.'); } });
      n.push({ id: 'town', spr: 'Villager', x: 29, y: 16.6, dir: 2, talk: async () => { await say('town', '달맞이 국수는 욕을 먹어야 맛이 난다니까. 오늘도 들었냐?'); } });
      n.push({ id: 'town2', spr: 'Villager4', x: 12, y: 16.8, dir: 3, talk: async () => { await say('town2', '곽씨가 낯선 사람을 한 달이나 붙들어 두다니. 십칠 년을 혼자 살던 사람이.'); await say('town2', '처음 이 마을에 왔을 땐 온몸이 피투성이였지. 산적을 만났다고 하더라만.'); } });
    }
  }
  return { npcs: n, spots: [], trigs: tr, roam: [] };
});
