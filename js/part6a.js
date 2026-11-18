// 제6부 앞 두 장(줄거리 문서 6부 1·2장)과 6부 곳곳의 복선 회수. 모든 길(정파·사파·마교·낭인)이 지나간다
// 회수할 때마다 처음 장면을 한두 줄로 되비춘다(── 몇 부, 어디 ── 로 시작하는 짧은 회상)
import { G } from './core.js';
import { ctx, say, narr, choice } from './ctx.js';
import { WHO } from './dialog.js';

const F = () => G.S.flags, S = () => G.S;
const back = (where, line) => narr(`── ${where} ──\n${line}`);  // 되비춤

// ── 제1장 달거울의 글: 그믐 전날 밤, 지금까지 모은 것을 한 줄로 늘어놓는다 ──
export async function mirrorCh() {
  await ctx.part(6, '달이 진 골짜기', '제1장 달거울의 글');
  await narr('그믐 전날 밤, 나루 움막에 등잔 하나를 켜고 그동안 모은 것을 바닥에 늘어놓았다. 달거울, 찢어진 낱장들, 수첩.');
  await say('yun', '하나씩 읽어요. 순서대로. 그래야 머리가 안 엉켜요.');
  await narr('달거울 뒷판에서 나온 종이부터 읽었다.');
  await back('3부, 구화성 연회', '“낙월을 움직인 자는 연경추다. 달 없는 밤에 그가 문주를 베었다.”');
  await narr('거울을 등잔에 비춰 보았다. 그때는 못 본 글이 한 줄 더 떠올랐다. 아주 작게, 거울 테두리를 따라 돌아가며.');
  await narr('“불은 안에서 먼저 났다. 맹의 깃발은 사흘 뒤에 왔다.”');
  await say('me', '사흘 뒤.', 'b');
  if (F().fs_order || F().jg_date) await back(F().fs_order ? '3부, 무창 나루' : '4부, 제갈세가 서고', '“명령서는 삼월 열이레인데, 월하곡에 불이 난 게 삼월 열나흘이래요.” 제갈현은 사본을 접어 소매에 넣었다. 손이 떨렸다.');
  else await narr('제갈세가가 맡았다는 토벌 명령서의 날짜를 나는 끝내 보지 못했다. 그래도 거울은 사흘이라고 했다.');
  await back('3부, 소림 탑림', '“도착해 보니 골짜기는 이미 불타고 있었소. 칼을 뽑을 일도 없었지.” 혜각 대사는 그 말을 하고 오래 염주만 굴렸다.');
  await say('yun', '그러니까 정천맹이 불을 지른 게 아니에요. 정천맹은 다 탄 다음에 왔어요. 불은 안에서 났고요.');
  await say('me', '안에서 문을 연 사람이 있었고, 불은 그 사람들이 먼저 질렀다. 맹의 깃발은 그걸 덮으러 왔고.');
  await say('yun', '그럼 십칠 년 동안 강호가 월하문을 친 줄 알았던 게 다…….');
  await say('me', '한 사람이 짠 판이에요. 구파일방이랑 오대세가는 불 꺼진 데 와서 깃발만 꽂았고.');
  await narr('등잔불이 흔들렸다. 낱장 여섯 장이 바닥에 나란히 놓여 있었다. 일곱 번째 자리만 비어 있었다.');
  ctx.note('달거울 테두리의 숨은 글: “불은 안에서 먼저 났다. 맹의 깃발은 사흘 뒤에 왔다.” 명령서 날짜, 혜각의 “이미 불타고 있었다”와 맞는다.');
  F().w6_mirror = true;
}

// ── 제2장 두 번째 담판: 그믐밤 물길에서 패천도와 다시 만난다 ──
export async function secondTalk() {
  await ctx.chap(6, '달이 진 골짜기', '제2장 두 번째 담판');
  const s = S().side;
  await narr('월하곡으로 들어가는 물길 어귀에 검은 배가 열두 척 떠 있었다. 가운데 배 이물에 큰 칼을 짚은 사내가 서 있었다.');
  if (s === 'sa') {
    await say('samaung', '왔냐. 물길은 우리가 쥐었다. 맹주 놈 배는 하나도 못 들어간다.');
    await say('samaung', '이십 년 걸렸다. 오늘 밤엔 남이 따른 술 말고 내가 따른 술을 마시마.');
  } else if (F().jg_samaung) {
    await say('samaung', '약속대로 물길은 비워 뒀다. 맹주 배는 한 시진 전에 들어갔다. 수레가 서른 대였다.');
    if (F().sm_odok) await say('samaung', '남화한테 오독문 패 돌려줬다. 그 계집애가 울더라. 이십 년 만에 처음 운다고.');
  } else {
    await say('samaung', '정파 심부름도 아니고 역적 심부름도 아닌 놈이 그믐밤에 이 물길엔 왜 왔냐.');
    await say('me', '연경추를 베러요. 당신 형제 열둘을 죽인 독, 일배혈은 맹주관에서 나갔어요.');
    await say('samaung', '……말은 칼로 해라.', 'a');
    await ctx.duel({ foes: ['samaung_foe'], arena: 'dock', bgm: 'boss', title: '패천도 사마웅', survive: 20, tip: '이길 수 없는 상대입니다. 20초를 버티세요.' });
    await say('samaung', '버티는구먼. 그 정도면 연경추 앞까지는 가겠다. 물길은 비켜 주마.');
  }
  if (F().lion_debt) {
    await say('lion', '형님, 저는 이 점소이 배를 타겠습니다. 빚을 아직 다 못 갚아서요.');
    await say('samaung', '가라. 살아서 와라. 위패 자리 모자란다.');
    F().lion_w6 = true;
  }
  if (F().sm_drink) await say('samaung', F().sm_drink === 'poured' ? '구화성 금봉 객잔에서 네가 따른 술, 그거 아직 빚으로 달아 놨다.' : '구화성 금봉 객잔에서 내가 따른 술을 의심 없이 마시던 놈. 오늘은 의심하고 가라.');
  F().w6_talk = true;
}

// ── 6부 곳곳의 복선 회수: 다른 파일에서 부른다 ──
// 3장 곽 아주머니: 1부 구석방 앞의 국
export async function soupBack() {
  await back('1부, 청하진 객잔 구석방', '아침마다 구석방 문 앞에 국그릇이 놓여 있었다. 문을 열면 곽 아주머니는 늘 이미 부엌에 가 있었다.');
  await say('gwak', '월하문에선 앓는 사람 방 앞에 국을 두는 법이었다. 들어가서 귀찮게 하지 말고, 식기 전에 먹게. 네 아버지가 만든 법이다.');
  await say('me', '……그래서 열일곱 해 동안 한 번도 안 들어오셨구나.', 's');
}
// 5장 연경추: "나도 출신이 없다", 칠일소혼산을 가져간 손님
export async function chiefBack() {
  await back('3부, 맹주의 차', '“나도 구파일방이나 오대세가 출신이 아닐세. 이 자리까지 오는 데 서른 해가 걸렸지.”');
  await say('chief', '구화성에서 그렇게 말했지. 거짓말은 아니었네. 나는 출신이 없어. 천산 흑운궁에서 이름 없이 자랐으니까.');
  await say('me', '위문상도 당신 사람이었지. 맹주관 서기. 당가 독고에서 두 병을 가져갔어. 일배혈, 그리고 칠일소혼산.');
  await back('2부, 창운문 외문 숙소', '위문상이 내 어깨에 연고를 발라 주었다. 박하 냄새가 났다. 손톱이 유난히 깨끗했다.');
  await say('chief', '문상이는 손이 깨끗했지. 독을 다루는 손은 늘 깨끗해야 하거든.');
}
// 4장 여우 가면 뒤: 1부 다섯 살에 불탄 마을
export async function villageBack() {
  await back('1부, 북쪽 변경', '다섯 살 겨울, 마을이 불탔다. 아무도 이유를 몰랐다. 전쟁이라고 했다.');
}
G.p6 = { mirrorCh, secondTalk, soupBack, chiefBack, villageBack };
