// 1부 1장: 객잔의 며칠. 불이 나기 전의 일상을 플레이한다
import { G, Sound, fadeTo, toast } from './core.js';
import { Story, ctx, say, narr, choice } from './ctx.js';
import { WHO } from './dialog.js';
import { FOES } from './foes.js';
import { step, set, at, evening, lastMorning, firstMeal } from './story1.js';

const F = () => G.S.flags;
Object.assign(WHO, { yang: { name: '양씨 할머니', face: 'OldWoman' }, deed: { name: '비단옷 손님', face: 'Noble' } });
FOES.baek_train = { name: '백 노인', spr: 'chars/OldMan3', hp: 99999, atk: 3, def: 40, spd: 40, exp: 0, silver: 0, pause: .9, moves: ['dart3', 'quick'], boss: 1, poise: 99999, keep: 70, title: '장작 던지는' };

async function errands() {
  await say('gwak', '일어났냐. 오늘은 세 군데다. 약방에 외상값 갚고, 대장간에서 내 칼 찾아오고, 나루에서 생선 받아 와.');
  await say('me', '세 군데나요? 점심 장사는 어쩌고요.', 'b');
  await say('gwak', '뒀다 뭐 할 다리야? 그리고 약방 딸한테 쓸데없는 소리 하지 말고.', 'a');
  await say('me', '무슨 소리요.');
  await say('gwak', '군막 얘기 말이다. 동네 사람들 겁먹어. 얼른 갔다 와!', 'a');
  F().errand = true; ctx.goal('심부름: 윤씨 약방, 대장간, 나루터 (마을의 ! 표시)');
}
async function yunFirst() {
  await say('yun', '달맞이 객잔에서 왔어요? 장부 가져올게요.');
  await say('me', '곽 아주머니가 외상값 갖다 드리래요.');
  await say('yun', '아, 칼 잡히고 걸레질한다는 사람이 댁이구나. 잠깐만요, 세어 볼게요. 맞네요.', 'h');
  await say('yun', '아주머니 어깨 약은 아직 남았대요?');
  await say('me', '어깨요? 아주머니 어깨가 왜요?');
  await say('yun', '몰랐어요? 오른쪽 어깨에 오래된 칼자국이 있거든요. 아버지가 십 년 넘게 약을 지어 드렸어요.');
  await say('yun', '국자질을 아무리 세게 해도 그런 상처는 안 생기죠.');
  await say('me', '…칼 오래 쓴 사람들 어깨에 그런 자국이 남아요. 군막에서 많이 봤어요.', 's');
  await say('yun', '근데 걸음이 왜 그래요? 왼발로만 미는 거 같은데.');
  await say('me', '구석방 어르신이 걸레질을 그렇게 하라고 하셔서요.');
  await say('yun', '그 객잔은 사람들이 다 이상하네요.', 'h');
  F().e_yun = true; F().met_yun = true; ctx.note('약방 윤설: 곽 아주머니 오른쪽 어깨에 오래된 칼자국이 있다.'); await doneCheck();
}
async function smithFirst() {
  await say('smith', '왔냐. 곽씨 칼 다 갈아 놨다. 조심해라, 나도 손 베였어.');
  await say('me', '식칼인데요?');
  await say('smith', '이게 식칼이냐? 쇠가 달라. 내가 삼십 년을 쇠를 두드렸는데 이런 건 못 만든다.');
  await say('smith', '어디서 났냐고 물었더니 대답은 안 하고 무를 썰어 보이더라. 도마까지 잘렸어.');
  await say('me', '아주머니가 원래 그래요.');
  await say('smith', '너 낭인이었다며. 칼은 어쩌고 쟁반을 들고 다니냐?');
  await say('me', '국수 값으로 잡혔어요.');
  await say('smith', '곽씨가 사람을 저렇게 오래 붙잡아 두는 건 처음 본다.');
  F().e_smith = true; await doneCheck();
}
async function boatFirst() {
  await say('boat', '왔구먼. 오늘 잉어가 실혀. 곽씨 몫이여.');
  await say('me', '고맙습니다.');
  await say('boat', '오늘내일은 곽씨 심기 건드리지 말어. 모레가 그믐이잖여.');
  await say('me', '그믐이 왜요?');
  await say('boat', '너 아직 모르는구먼. 그믐마다 그 집 문 앞에 봉투가 놓여.');
  await say('me', '봉투요?');
  await say('boat', '은자 다섯 냥이 들어 있어. 누가 두고 가는지는 십 년 넘도록 아무도 못 봤고. 곽씨는 그 돈으로 사람을 사서 어딜 자꾸 보내더라고.');
  await say('me', '어디로요?');
  await say('boat', '내가 그걸 어찌 아누. 궁금해도 묻지 말어. 그거 물어봤다가 국자로 맞은 놈이 한둘이 아녀.');
  F().e_boat = true; await doneCheck();
}
async function doneCheck() {
  if (F().e_yun && F().e_smith && F().e_boat) ctx.goal('객잔으로 돌아가 곽 아주머니에게 알리기');
}
async function backHome() {
  await say('gwak', '늦었어. 칼 줘 봐. 그래, 잘 갈았네.');
  await say('me', '어깨는 괜찮으세요?');
  await say('gwak', '누가 그래?');
  await say('me', '아니에요.');
  await say('gwak', '약방 딸이랑 쓸데없는 소리 하지 말랬지. 손님 온다, 그릇이나 내와.', 'a');
  await evening();
}
async function training() {
  await say('baek', '일어났느냐. 어제 왈패 막는 걸 보니 칼 쓰던 버릇이 남았더구나. 사람 잡는 발이야. 왼발이 늦어.');
  await say('me', '어르신, 방값이요.');
  await say('baek', '마당으로 나와라. 거기서 얘기하자.');
  await say('me', '주시게요?');
  await say('baek', '내가 장작을 던질 테니 피해 봐라. 다 피하면 생각해 보마.');
  await say('me', '그게 방값이랑 무슨 상관이에요!', 'a');
  await ctx.duel({ foes: ['baek_train'], arena: 'yard', title: '장작 피하기', bgm: 'peaceful', survive: 20, expMul: 0, tip: '<b>K 경공</b>: 잠깐 빠르게 움직이고 그동안 맞지 않습니다. 날아오는 장작을 피해 20초를 버티세요.' });
  await say('baek', '몇 대 맞긴 했어도 넘어지진 않았구나.');
  await say('me', '사람한테 장작을 던지시면 어떡해요.', 'a');
  await say('baek', '강호에 나가면 칼을 던지는 놈도 있다.');
  await say('me', '군막에도 많았어요. 어르신은 강호에 계셨어요?');
  await say('baek', '술집에 있었다. 술이나 가져와라.');
  F().trained = true; ctx.goal('곽 아주머니에게 가기');
}
// ── 객잔의 점심: 손님 셋 ──
async function lunchStart() {
  await say('gwak', '장작에 맞고 왔냐? 얼굴은 멀쩡하네. 됐다, 점심 손님 받아.');
  await say('me', '오늘은 몇 분이에요?');
  await say('gwak', '노씨, 양씨 할머니, 그리고 아침부터 와서 앉아 있는 비단옷. 비단옷은 국수 말고 딴 걸 찾을 거다. 상대하지 마.', 'a');
  await say('me', '딴 거요?');
  await say('gwak', '가 보면 알아. 노씨는 면 많이, 할머니는 국물 많이.');
  F().lunch = true; ctx.goal('점심 손님 셋 받기 (객잔 안의 ! 표시)');
}
async function guestNo() {
  await say('boat', '어, 왔냐. 면 많이. 아침부터 노 젓느라 팔이 떨어지겄어.');
  await say('me', '오늘은 손님이 많았어요?');
  await say('boat', '손님은 무슨. 관청 배가 또 지나갔어. 세곡 싣고. 그 배 지나가면 우리 같은 거룻배는 한나절 강가에 붙어 있어야 혀.');
  await say('boat', '근데 너 아침마다 마당에서 이상하게 걷더라. 춤추는 것도 아니고.');
  await say('me', '백 어르신이 걸레질을 그렇게 하래서요. 왼발로 밀고 오른발은 따라오게.');
  await say('boat', '그 영감 말을 듣는 사람이 있었구먼. 술값 떼먹는 거 말고는 하는 일이 없는 줄 알았더니.', 'h');
  await say('boat', '그래도 그 걸음, 물 위에서 보면 배 젓는 거랑 닮았어. 힘을 한 번에 안 쓰고 흘려보내는 거.');
  F().l_no = true; await lunchCheck();
}
async function guestYang() {
  await say('yang', '아이고, 새로 온 {손님}이구먼. 국물 많이. 이 늙은이는 면은 몇 가닥이면 돼.');
  await say('me', '면도 넉넉히 드릴게요. 아주머니가 그러래요.');
  await say('yang', '곽씨가? 그 사람 입으로는 그런 말 안 해. 손으로만 하지.', 'h');
  await narr('그릇을 내려놓다가 젖은 바닥에 발이 미끄러졌다. 할머니가 먼저 내 팔을 잡았다.');
  await say('yang', '바닥이 번들번들하네. 걸레질을 너무 열심히 했구먼.');
  await say('me', '열심히 하면 혼나고 대충 하면 또 혼나요.', 'a');
  await say('yang', '{손님} 몇 살이여?');
  await say('me', '스물이요.');
  await say('yang', '우리 손주가 살았으면 딱 그 나이여. 북쪽에 끌려갔지. 애들만 모아서 뭘 시킨다고.', 's');
  await say('me', '…….', 's');
  await say('yang', '늙은이가 별소리를 다 하네. 이거 먹어. 아침에 삶았어. 계란은 국숫값이 아니여, 그냥 주는 거여.');
  await say('me', '…잘 먹을게요.', 's');
  F().l_yang = true; ctx.note('양씨 할머니: 손주가 북쪽으로 끌려갔다. 애들만 모아서 뭘 시킨다고. (견대였을까)'); await lunchCheck();
}
async function guestDeed() {
  await say('deed', '점소이, 국수는 됐고. 주인 어디 있나?');
  await say('me', '부엌에요. 국수 안 드시면 자리값은 내셔야 하는데요.');
  await say('deed', '하하, 자리값이라. 이 객잔 땅값을 치르러 왔네. 여기 땅문서도 있고 은자도 있어. 백 냥. 이런 촌 나루에 객잔 하나에 백 냥이면 후하지.');
  await say('me', '아주머니가 판대요?');
  await say('deed', '그러니까 자네가 좀 거들어 주게. 자네도 여기 묶여 있는 처지라며. 성사되면 열 냥 주지.');
  await say('deed', '아, 그리고 하나만. 뒷마당 우물 말이야. 물은 잘 나오나?');
  await say('me', '그 우물은 뚜껑이 쇠라 안 열려요. 물은 저 앞 공동 우물에서 길어요.');
  await say('deed', '그래? 쇠 뚜껑이라…', 'b');
  const c = await choice('비단옷 손님이 은자 한 냥을 탁자에 올려놓는다.', ['은자는 놔두고 나가시라고 한다', '아주머니에게 알린다']);
  if (c === 0) { await say('me', '자리값으로 받을게요. 땅은 안 판대요. 나가세요.'); await say('deed', '허, 점소이가 장사를 할 줄 아는구먼. 또 오지.'); ctx.silver(1); }
  else { await say('gwak', '또 왔어? 안 판다고 했지. 국자로 나가고 싶어, 발로 나가고 싶어?', 'a'); await say('deed', '…또 오겠소.'); }
  F().l_deed = true; ctx.note('비단옷 손님이 객잔 땅을 사겠다며 백 냥을 내밀었다. 뒷마당 쇠 뚜껑 우물을 물었다.'); await lunchCheck();
}
async function lunchCheck() { if (F().l_no && F().l_yang && F().l_deed) ctx.goal('곽 아주머니에게 가기'); }
async function herbErrand() {
  await say('gwak', '비단옷은 갔냐. 됐다. 그런 놈은 또 와.', 'a');
  await say('me', '우물을 묻던데요.');
  await say('gwak', '…….', 'b');
  await say('gwak', '약방 가서 내 어깨 약 받아 와. 윤씨가 달여 놨을 거다. 오는 길에 딴 데 새지 말고.');
  F().herb = true; ctx.goal('윤씨 약방에서 곽 아주머니 어깨 약 받아 오기');
}
async function yunHerb() {
  await say('yun', '또 왔네요. 어깨 약이죠? 아직 안 됐어요. 기다리는 동안 이거나 썰어요.', 'h');
  await say('me', '제가요?');
  await say('yun', '공짜로 기다리게요? 결대로, 얇게. 칼 쥐듯이 쥐지 말고요.');
  await narr('약초 써는 칼은 가볍고 손잡이가 짧았다. 몇 번 썰다 보니 손이 저절로 빨라졌다.');
  await say('yun', '…빠르네요. 근데 왜 칼끝을 자꾸 문 쪽으로 돌려요?');
  await say('me', '버릇이에요. 칼 들고 있을 때 등 뒤에 문이 있으면 불안해서.', 's');
  await say('yun', '여기 약방이에요. 들어오는 건 기침하는 할아버지들뿐이에요.', 'h');
  await say('yun', '자요, 약. 하루 두 번 바르시라고 해요. 그리고 아주머니한테 비단옷 사람 조심하시라고 전해 줘요. 어제는 우리 약방 앞에서 객잔 쪽을 한참 보고 있었어요.');
  await say('me', '전할게요.');
  F().herb_done = true; ctx.goal('객잔으로 돌아가 곽 아주머니에게 약 드리기');
}
async function noodleNight() {
  await say('gwak', '약은 거기 둬. 윤씨 딸이 비단옷 얘기도 하디?');
  await say('me', '조심하시래요.');
  await say('gwak', '애들이 걱정이 많아. 손님 다 갔다. 바닥 닦고 이리 와.');
  await narr('불 꺼진 객잔 바닥을 마지막으로 닦았다. 허리를 펴고 왼발로 밀고, 오른발은 따라오게. 바닥 끝에서 끝까지 한 번도 멈추지 않았다.');
  await narr('다 닦고 나서야 알았다. 걸레를 든 손은 하나도 힘을 안 썼는데 몸은 방 끝까지 와 있었다.');
  await say('me', '…이거 보법이잖아.', 'b');
  await say('gwak', '거기서 뭐 해. 면 뽑는 거나 배워.');
  await say('me', '제가요?', 'b');
  await say('gwak', '내가 언제까지 끓일 줄 알아? 물이 끓으면 면을 넣고, 넘치려고 할 때 찬물을 한 번 끼얹어. 국물은 나중에 가르쳐 줄게.');
  await say('me', '국물은 왜 나중이에요?');
  await say('gwak', '그것까지 알려 주면 너 나갈 거 아냐.', 'h');
  await say('me', '여섯 닢만 갚으면 나갈 사람인데요.');
  await say('gwak', '아직 멀었다, 이놈아.', 'h');
  await narr('밤늦게 불을 끄러 나왔더니 곽 아주머니가 구석방 문 앞에 서 있었다. 국 한 그릇을 내려놓고 한참 서 있다가 아무 말 없이 돌아갔다.');
  await say('me', '방값 받아 오라고 그렇게 난리를 치시더니.', 'a');
  await narr('그믐날 새벽, 객잔 문 앞에 봉투가 놓여 있었다. 문을 열고 나가 보니 골목 끝으로 삿갓 쓴 사람이 사라지고 있었다.');
  await say('me', '저기요! 잠깐만요!');
  await say(null, '봉투 안에는 은자 다섯 냥만 들어 있었다. 구석방 불은 꺼져 있었다.');
  ctx.note('그믐 새벽, 봉투를 두고 가는 삿갓을 보았다. 곽 아주머니는 밤에 구석방 앞에 국을 두고 간다.');
  set('p5'); await lastMorning();
}
async function dayTalkImpl(who) {
  if (who === 'gwak') {
    if (at('p3') && !F().errand) { await errands(); return true; }
    if (at('p3') && F().e_yun && F().e_smith && F().e_boat) { await backHome(); return true; }
    if (at('p3')) { await say('gwak', '아직도 안 갔어? 약방, 대장간, 나루!', 'a'); return true; }
    if (at('p4') && F().trained && !F().lunch) { await lunchStart(); return true; }
    if (at('p4') && F().lunch && !(F().l_no && F().l_yang && F().l_deed)) { await say('gwak', '손님 기다린다. 얼른!', 'a'); return true; }
    if (at('p4') && !F().herb) { await herbErrand(); return true; }
    if (at('p4') && !F().herb_done) { await say('gwak', '약방 다녀오라니까!', 'a'); return true; }
    if (at('p4') && F().herb_done) { await noodleNight(); return true; }
    return false;
  }
  if (who === 'baek' && at('p4') && !F().trained) { await training(); return true; }
  return false;
}
G.life.dayTalk = dayTalkImpl;
G.life.dayMark = who => who === 'gwak' ? (at('p3') && (!F().errand || (F().e_yun && F().e_smith && F().e_boat))) || (at('p4') && !!F().trained && (!F().lunch || (F().l_no && F().l_yang && F().l_deed && !F().herb) || !!F().herb_done)) : at('p4') && !F().trained;

Story.providers.push(function content7(id) {
  const n = [], tr = [];
  if (at('p0a')) {
    if (id === 'inn') tr.push({ x: 0, y: 0, w: 99, h: 99, when: () => at('p0a'), run: firstMeal });
    if (id === 'cheongha') {
      n.push({ id: 'boat', spr: 'OldMan2', x: 22.5, y: 27.8, dir: 3, barks: ['배 떠나오!', '바람 좋다.'], talk: async () => { await say('boat', '내렸으면 저리 비켜. 밥은 저 위 달맞이 객잔이여. 칼 찬 손님은 돈부터 내야 할 거고.'); } });
      n.push({ id: 'kid', spr: 'Child', x: 16, y: 16.8, dir: 3, life: 'wander', r: 2.5, barks: ['쟁반 던져 봐요!', '와아, 칼이다!', '술래잡기 할 사람!'], talk: async () => { await say('kid', '와, 칼이다! 그거 진짜예요?'); await say('me', '밥집이 어디냐.', 'a'); await say('kid', '달맞이 객잔이요! 저기 위에요!'); } });
      n.push({ id: 'town', spr: 'Villager', x: 29, y: 16.6, dir: 2, life: 'work', barks: () => G.S.flags.plague ? ['콜록…', '물 좀…'] : ['오늘 물때가 좋네.', '그물 손봐야지.', '곽씨네 국수 냄새 좋다.'], talk: async () => { await say('town', '낭인이구먼. 이 마을에선 칼 뽑지 말게. 곽씨 성질이 보통이 아니야.'); } });
    }
  }
  if (at('p3')) {
    if (id === 'clinic') n.push({ id: 'yun', spr: 'Princess', x: 3.5, y: 4.8, dir: 0, mark: () => !!F().errand && !F().e_yun, talk: async () => { if (F().errand && !F().e_yun) await yunFirst(); else await say('yun', '무슨 일이에요?'); } });
    if (id === 'smith') n.push({ id: 'smith', spr: 'Caveman2', x: 4, y: 4.6, dir: 0, mark: () => !!F().errand && !F().e_smith, talk: async () => { if (F().errand && !F().e_smith) await smithFirst(); else await say('smith', '불 앞에서 얼쩡대지 마라.'); } });
    if (id === 'cheongha') {
      n.push({ id: 'boat', spr: 'OldMan2', x: 22.5, y: 27.8, dir: 3, barks: ['배 떠나오!', '바람 좋다.'], mark: () => !!F().errand && !F().e_boat, talk: async () => { if (F().errand && !F().e_boat) await boatFirst(); else await say('boat', '오늘 물이 좋구먼.'); } });
      n.push({ id: 'kid', spr: 'Child', x: 16, y: 16.8, dir: 3, life: 'wander', r: 2.5, barks: ['쟁반 던져 봐요!', '와아, 칼이다!', '술래잡기 할 사람!'], talk: async () => { await say('kid', '진짜 낭인이에요? 사람 죽여 봤어요?'); await say('me', '심부름 가는 중이야. 저리 가.', 'a'); } });
      n.push({ id: 'town', spr: 'Villager', x: 29, y: 16.6, dir: 2, life: 'work', barks: () => G.S.flags.plague ? ['콜록…', '물 좀…'] : ['오늘 물때가 좋네.', '그물 손봐야지.', '곽씨네 국수 냄새 좋다.'], talk: async () => { await say('town', '곽씨한테 오늘은 안 혼났나?'); } });
      n.push({ id: 'town2', spr: 'Villager4', x: 12, y: 16.8, dir: 3, life: 'work', barks: ['빨래가 산더미네.', '애들 또 어디 갔어.', '날 좋다.'], talk: async () => { await say('town2', '곽씨가 낯선 사람을 한 달이나 붙들어 두다니, 별일이야. 십칠 년을 혼자 살던 사람이.'); await say('town2', '처음 이 마을에 왔을 땐 온몸이 피투성이였지. 산적을 만났다고 하더라만.'); } });
    }
  }
  if (at('p4') && F().lunch) {
    if (id === 'inn') {
      n.push({ id: 'boat', spr: 'OldMan', x: 7.4, y: 7.5, dir: 3, mark: () => !F().l_no, talk: async () => { if (!F().l_no) await guestNo(); else await say('boat', '면 맛있다. 국물은 곽씨가 아직 안 가르쳐 줬지?'); } });
      n.push({ id: 'yang', spr: 'OldWoman', x: 10.6, y: 7.85, dir: 1, mark: () => !F().l_yang, talk: async () => { if (!F().l_yang) await guestYang(); else await say('yang', '계란은 다 먹었어? 껍질은 밭에 뿌려.'); } });
      n.push({ id: 'deed', spr: 'Villager', x: 10.8, y: 11.2, dir: 1, when: () => !F().l_deed, mark: () => !F().l_deed, talk: guestDeed });
    }
    if (id === 'clinic') n.push({ id: 'yun', spr: 'Princess', x: 3.5, y: 4.8, dir: 0, mark: () => !!F().herb && !F().herb_done, talk: async () => { if (F().herb && !F().herb_done) await yunHerb(); else await say('yun', '약 가져갔잖아요. 또 뭐요?'); } });
  }
  return { npcs: n, spots: [], trigs: tr, roam: [] };
});
