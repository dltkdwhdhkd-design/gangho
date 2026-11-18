// 제2부 외문의 닷새: 한 달 일이 끝난 뒤 월말 시험 전까지 닷새를 플레이어가 고른다(수련·장팔 돕기·장서각·소연하와 비무)
// 저녁마다 정해진 장면이 하나씩 붙는다. 위문상을 가장 잘해 주는 어른으로 먼저 보여 주고, 복선 둘(당가 약상 손님, 칼로 뜯긴 기록)을 여기서 심는다
import { G, toast } from './core.js';
import { ctx, say, narr, choice } from './ctx.js';
import { WHO } from './dialog.js';
import { gainExp } from './state.js';
import { expNeed } from './data.js';

const F = () => G.S.flags;
Object.assign(WHO, { libold: { name: '장서각 마 노인', face: 'OldMan' }, dangsang: { name: '떠돌이 약상', face: 'Villager3' } });
const MORN = [
  '묘시에 일어나 물지게를 졌다. 우물 줄은 어제보다 조금 덜 차가웠다.',
  '새벽 안개가 연무장까지 내려와 있었다. 장팔이 물동이를 두 번 엎었다.',
  '물을 다 길었을 때 해가 산등성이에 걸렸다. 석두가 말없이 내 물지게 끈을 바꿔 매 주었다.',
  '비가 조금 왔다. 물을 길어 놓으면 하늘이 또 물을 주니 억울하다고 장팔이 투덜댔다.',
  '닷새째 아침. 물지게가 처음으로 어깨에 맞는다는 느낌이 들었다.',
];
// 닷새를 다 수련에 써도 경지 하나쯤만 오른다(뒤 싸움 난이도가 흔들리지 않게)
const exp = k => { const n = Math.round(expNeed(G.S.lv) * k); const up = gainExp(n); toast(up ? `수련이 쌓였다 · 경지가 올랐다` : '수련이 쌓였다'); };
const cnt = k => (F()['d5_' + k] = (F()['d5_' + k] || 0) + 1);

async function train() {
  const n = cnt('train');
  if (n === 1) {
    await narr('오후 내내 연무장 구석에서 목인을 쳤다. 어깨, 손목, 무릎. 목으로 가려는 손을 세 번에 한 번은 붙잡았다.');
    await say('go', '세 번에 한 번이면 두 번은 죽인 거다.');
    await say('me', '어제는 네 번에 한 번이었어요.');
    await say('go', '……그럼 나아진 거구나.', 'b');
  } else if (n === 2) {
    await narr('고진이 목검을 들고 내 앞에 섰다. 치지는 않고 내 칼끝만 툭툭 쳐서 밀어냈다. 백 번쯤 밀리고 나니 손목이 저절로 칼끝을 세웠다.');
    await say('go', '칼끝이 처지면 상대 칼이 그 위로 들어온다. 객잔 국자처럼 쥐지 마라.');
    await say('me', '국자는 처지면 국이 쏟아져요. 그래서 안 처지게 들었는데요.', 'h');
    await say('go', '……그럼 국자처럼 쥐어라.');
  } else {
    await narr('혼자 연무장을 돌았다. 왼발로 밀고 오른발은 따라오게. 소연하가 가르쳐 준 대로 두 걸음 물러섰다가 한 걸음 들어갔다. 목인 앞에서 칼이 처음으로 어깨에서 멈췄다.');
  }
  exp(.22);
}
async function helpJang() {
  const n = cnt('jang');
  if (n === 1) {
    await narr('장팔은 외문 숙소 뒤에서 장작을 패고 있었다. 도끼질 한 번에 한숨 한 번이었다.');
    await say('jangpal', '형씨, 이거 다 패야 저녁을 준대유. 나 혼자 하면 내일 아침에 먹어유.');
    await narr('반을 내가 팼다. 장작을 쪼개는 결이 칼 쓰는 결과 비슷했다. 나무도 사람처럼 갈라지는 자리가 따로 있었다.');
    await say('jangpal', '형씨는 뭐든 잘하네유. 나는 뭐 하나 잘하는 게 없어유.');
    await say('me', '목검은 안 놓치잖아요.');
    await say('jangpal', '그건 손에 땀이 많아서 그래유. 새끼줄이 착 붙어유.', 'h');
  } else if (n === 2) {
    await narr('장팔이 고향에 보낼 편지를 써 달라고 했다. 장팔은 글을 몰랐다.');
    await say('jangpal', '어머니, 밥 잘 먹어유. 형씨, 그렇게 써 줘유. 사형들이 때린다는 건 빼고유.');
    await say('me', '때려요?');
    await say('jangpal', '내문 사형들이 가끔유. 고진 사형은 안 때려유. 말로 패지.', 'h');
    await say('jangpal', '아, 그리고 검각주님이 보내 준 약값 잘 받았다고도 써 줘유. 우리 어머니 기침약 값을 검각주님이 대 주셨어유.');
    await narr('편지 끝에 장팔이 엄지에 먹을 묻혀 꾹 눌렀다. 이름 대신이었다.');
    F().jang_bond = true;
  } else {
    await narr('장팔과 둘이 식당 아궁이 재를 퍼냈다. 장팔은 재 속에서 다 탄 감자 하나를 찾아내 반으로 쪼갰다.');
    await say('jangpal', '외문에 삼 년 있으면 이런 데 감자가 있는 걸 알게 돼유.');
  }
  ctx.silver(5);
}
async function library() {
  const n = cnt('lib');
  if (n === 1) {
    await narr('장서각은 외문 제자도 해 지기 전까지는 들어갈 수 있었다. 들어가는 사람은 없었다. 마 노인이 혼자 먼지를 털고 있었다.');
    await say('libold', '외문이 책을 보러 왔다고? 십 년 만이네. 글은 아나?');
    await say('me', '객잔 장부는 봤어요. 외상 적는 거요.');
    await say('libold', '그럼 됐어. 무공서는 내문 것이니 손대지 말고, 저기 문파 일지나 봐. 아무도 안 읽어서 책이 심심해해.');
    await narr('창운문 일지는 쌀이 몇 섬 들어왔는지, 누가 병이 났는지, 손님이 누구였는지 같은 것뿐이었다. 그런데 그런 걸 읽다 보니 이 산에 사람이 살았던 게 보였다.');
    ctx.note('장서각 마 노인: 외문도 해 지기 전까지 문파 일지를 볼 수 있다.');
  } else {
    await narr('일지를 거꾸로 넘겼다. 이십 년 전 일지에는 젊은 위문상의 이름이 자주 나왔다. 약재를 사러 사천에 다녀왔다는 줄이 몇 번 있었다.');
    await say('libold', '검각주님은 젊을 때부터 문파 살림을 혼자 다 맡았지. 그분 없었으면 창운문은 진작 문 닫았어.');
  }
  exp(.12);
}
async function sparSo() {
  const n = cnt('so');
  if (n === 1) {
    await say('so', '또 왔어? 오늘은 물러서는 걸음 세 번. 그다음에 들어와.');
    await ctx.duel({ foes: ['so_rival'], arena: 'court', bgm: 'fight', title: '소연하와 비무', yieldAt: .55, optional: true, noIntro: true });
    await say('so', '두 번은 물러섰네. 세 번째는 참지 못하고 들어왔고.', 'h');
    await say('me', '세 번째엔 빈틈이 보였어요.');
    await say('so', '그건 내가 일부러 보여 준 거야. 다음엔 그것도 참아.');
    ctx.love('so');
  } else {
    await narr('소연하와 목검을 맞댔다. 이번에는 세 번을 다 물러섰다. 네 번째 걸음에서 소연하의 목검이 내 어깨에 닿기 전에 멈췄다.');
    await say('so', '봤지? 물러서면 보여.');
    await say('so', '……근데 너 오늘 일부러 맞아 준 거 아니지?', 'a');
    await say('me', '진짜로 졌어요.');
    await say('so', '그럼 됐어.', 'h');
  }
  exp(.18);
}
const ACT = [['연무장에서 수련한다', train], ['장팔을 돕는다', helpJang], ['장서각에 간다', library], ['소연하에게 비무를 청한다', sparSo]];

// ── 저녁 장면 ──
async function eve1() {
  await narr('저녁을 먹고 나오는데 위문상이 외문 숙소 앞에 서 있었다. 검각주가 외문 숙소까지 내려오는 일은 없다고 장팔이 나중에 말해 주었다.');
  await say('wi', '어깨 좀 봅시다. 물지게 자국이 이틀이면 굳는데, 굳기 전에 바르면 덜 아프오.');
  await narr('위문상이 작은 약합을 열어 손가락으로 연고를 떠 내 어깨에 발랐다. 박하 냄새가 났다. 손톱이 깨끗했다.');
  await say('wi', '밥은 먹었소? 외문 밥은 늘 모자라지.');
  await say('me', '모자라진 않아요. 객잔보다는 적지만요.');
  await say('wi', '문파 장부를 이십 년째 내가 보오. 외문 쌀이 모자란 건 내 탓이지. 다음 달엔 한 되씩 더 얹으라 해 두겠소.', 'h');
  await narr('위문상은 약합을 통째로 내 손에 쥐여 주고 갔다. 장팔이 문틈으로 그걸 보고 있었다.');
  await say('jangpal', '봤쥬? 검각주님은 우리 같은 것도 다 챙겨유.');
}
async function eve2() {
  await narr('밤늦게 연무장에 불이 하나 켜져 있었다. 고진이 목인 하나를 끌어안다시피 하고 갈라진 데를 새끼줄로 감고 있었다.');
  await say('me', '목인은 내일 바꾸면 되잖아요.');
  await say('go', '이건 내 사형이 세운 거다. 바꾸지 않는다.');
  await say('me', '그 사형은요?');
  await say('go', '내문 시험에서 목을 맞았다. 상대가 너처럼 쳤지.', 's');
  await narr('고진은 매듭을 이로 끊었다. 그리고 다시는 그 얘기를 하지 않았다.');
  await say('go', '자라. 내일도 물이다.');
  F().go_past = true;
}
async function eve3() {
  await narr('해 질 녘 산문으로 떠돌이 약상 하나가 올라왔다. 등짐에 사천 약재 냄새가 배어 있었다. 하룻밤 재워 달라는 걸 문지기가 외문 숙소로 보냈다.');
  await say('dangsang', '창운문 살림이 이렇게 폈구먼. 옛날엔 약값도 외상이었는데.');
  await say('me', '전에도 오셨어요?');
  await say('dangsang', '나야 이십 년 가까이 이 산 저 산 다녔지. 원래는 사천 당가 약고에서 일했어. 거기서 쫓겨나고 이렇게 떠돌고.');
  await say('me', '왜 쫓겨나셨는데요?');
  await say('dangsang', '약고에서 뭐가 없어졌거든. 손님 하나가 다녀간 뒤로. 그걸 지키던 게 나였으니 나가라더구먼.', 's');
  await narr('그때 위문상이 숙소 앞을 지나갔다. 약상이 고개를 들더니 위문상의 뒷모습을 한참 보았다.');
  await say('dangsang', '……저분, 어디서 뵌 것 같은데.');
  await say('wi', '손님이 오셨구려. 산길에 고생하셨소. 내일 내려가실 때 노잣돈을 좀 챙겨 드리리다.', 'h');
  await narr('다음 날 아침 약상은 보이지 않았다. 문지기 말로는 동트기도 전에 내려갔다고 했다. 노잣돈은 두 배였다고.');
  ctx.note('당가 약고에서 일했다는 떠돌이 약상이 위문상을 보고 "어디서 뵌 것 같다"고 했다. 다음 날 새벽에 사라졌다.');
  F().fs_dang = true;
}
async function eve4() {
  await narr('저녁에 위문상이 외문 숙소에 떡 한 광주리를 들고 왔다. 문주님 생신 떡이 남았다고 했다.');
  await say('wi', '석두, 신발 고치는 손이 좋다고 들었네. 장팔, 목검 자루는 네가 감았나? 잘 감았구나. 왕충, 다리는 다 나았는가?');
  await narr('외문 제자 열둘의 이름을 하나도 틀리지 않았다. 내 차례가 오자 위문상은 잠깐 나를 보았다.');
  await say('wi', '그대는 아직 목을 치나?');
  await say('me', '세 번에 한 번이요.');
  await say('wi', '고진보다 빠르구려. 그 사람은 일 년이 걸렸소.', 'h');
  await say('jangpal', '형씨, 저런 어른이 문주가 되면 좋겄어유. 지금 문주님도 좋지만유, 몸이 저러시니께.');
  await narr('그 말에 아무도 대꾸하지 않았다. 떡만 조용히 줄었다.');
}
async function eve5() {
  await narr('닷새째 저녁, 마 노인이 장서각에서 책을 옮겨 달라고 불렀다. 장마 전에 낡은 일지를 높은 시렁으로 올린다고 했다.');
  if (F().d5_lib) await say('libold', '자네가 일지 읽던 그 녀석이지. 마침 잘 왔어. 읽은 놈이 옮겨야 순서가 안 틀려.');
  await narr('십칠 년 전 일지를 올리다가 책이 이상하게 가볍다는 걸 알았다. 펼쳐 보니 봄 몇 달 치가 통째로 없었다. 뜯긴 자리가 자로 그은 듯 반듯했다.');
  await say('me', '어르신, 여기 뜯겨 있어요.');
  await say('libold', '쥐가 먹었다고들 하더군. 내가 오기 전 일이야.');
  await say('libold', '근데 이상하지. 쥐는 칼을 안 쓰거든.', 'b');
  await narr('마 노인은 그 책을 맨 위 시렁, 손이 안 닿는 데에 올렸다.');
  ctx.note('장서각: 십칠 년 전 봄 일지가 칼로 반듯하게 뜯겨 있다. 마 노인은 "쥐는 칼을 안 쓴다"고 했다.');
  F().fs_torn = true;
}
const EVE = [eve1, eve2, eve3, eve4, eve5];

export async function fiveDays() {
  await narr('한 달 일이 끝났다. 월말 시험까지 닷새가 남았다. 장팔 말로는 외문에서 제 마음대로 쓸 수 있는 날은 이것뿐이라고 했다.');
  for (let d = F().d5_day || 0; d < 5; d++) {
    await narr(MORN[d]);
    const c = await choice(`닷새 중 ${d + 1}째 날. 오후에는 무엇을 할까?`, ACT.map(a => a[0]));
    await ACT[c][1]();
    await EVE[d]();
    F().d5_day = d + 1;  // 중간에 저장하고 나가도 다음 날부터 잇는다
  }
  F().days5 = true;
}
