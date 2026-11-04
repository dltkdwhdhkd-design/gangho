// 2장 창운산, 3장 구화성, 4장 월하곡
import { G, Sound, fadeTo, wait, toast } from './core.js';
import { Story, ctx, say, narr, choice } from './ctx.js';
import { step, set, at, after } from './story1.js';
import { learn } from './state.js';
import { clansWon } from './clandata.js';

const S = () => G.S, F = () => G.S.flags;
// ── 2장 ──
async function arrive() {
  await narr('제2부 · 구름 위의 칼\n\n창운산. 구파일방 바로 아랫줄에 선다는 신흥 명문, 창운검문이 구름 위에 앉아 있다.');
  await say('yun', '저는 문주님 진맥하러 왔다고 하면 돼요. {나} 씨는요?');
  await say('me', '입문 시험을 본대요. 외문 제자로 들어가서 서찰에 인장 찍은 사람을 찾아야죠.');
  await say('yun', '점소이가 어떻게 검문에 들어가요.');
  await say('me', '쟁반이 있잖아요.');
  await say('yun', '…그렇네요.');
  set('c2b'); ctx.goal('연무장에서 고진 사형에게 입문 시험 보기');
}
async function exam() {
  await say('go', '객잔 심부름꾼이 창운검문에 들어오겠다고? 여기는 국수 나르는 데가 아니다.');
  await say('me', '시험 보러 왔습니다. 돈은 안 내도 된다면서요.');
  await say('go', '좋다. 제자 둘을 이기면 나와 겨룰 자격을 주지.');
  await ctx.duel({ foes: ['disciple', 'disciple'], arena: 'court', title: '입문 시험', yieldAt: 0 });
  await say('go', '제법 움직이는군. 그 걸음은 뭐냐?');
  await ctx.duel({ foes: ['senior_go'], arena: 'court', bgm: 'boss', title: '사형 고진', yieldAt: .25 });
  await say('go', '…인정하지. 외문 제자로 받아 주마. 사형이라고 불러라.');
  await say('so', '걸음이 재밌네. 어디서 배웠어?');
  await say('me', '누구세요?');
  await say('so', '벽수궁 소연하. 객으로 와 있어. 그 걸음, 창운문 것이 아니야. 한 판 할래?');
  await say('me', '방금 시험 끝났는데요.');
  await say('so', '그러니까 몸이 풀렸겠네.');
  await ctx.duel({ foes: ['so_rival'], arena: 'court', bgm: 'boss', title: '소연하', yieldAt: .35 });
  await say('so', '점소이라고 했지? 네 칼은 사람 목만 찾아. 어디서 배웠어?');
  await say('me', '배운 적은 없어요. 그렇게 안 하면 죽는 데 있었어요.');
  await say('so', '…이상한 사람이네.');
  F().met_so = true;
  set('c2c'); ctx.goal('본전에서 윤설과 함께 문주를 뵙기');
}
async function lordSick() {
  await say('yun', '왔어요? 문주님을 뵈었는데, 병이 아니에요.');
  await say('me', '그럼요?');
  await say('yun', '칠일소혼산. 이레에 한 번씩 조금씩 먹이는 독이에요. 사천당가에서나 만든다는 건데, 곁에 있는 사람이 아니면 먹일 수가 없어요.');
  await say('wi', '검각주 위문상이오. 의원 낭자, 문주께서는 오래된 지병이시오. 함부로 말하지 마시오.');
  await say('yun', '네. 제가 말이 짧아서요.');
  await say('yun', '(작은 목소리로) 달빛이끼가 있으면 해독해요. 산 북동쪽 바위틈에 난대요. 저 사람 보는 앞에선 못 가요.');
  set('c2d'); ctx.goal('창운산 북동쪽 끝 매화나무 아래에서 달빛이끼 캐기');
}
async function moss() {
  if (!at('c2d')) { await say(null, '흰 매화 아래 바위틈이 축축하다.'); return; }
  await say('me', '이거구나. 달빛이끼. 밤도 아닌데 희미하게 빛나네.');
  await say('shadow', '그건 두고 가라.');
  await ctx.duel({ foes: ['shadow', 'shadow', 'puppet'], arena: 'forest', title: '무면회', bgm: 'fight' });
  await say('me', '창운산 안에서 흑의인이 나왔어. 누가 부른 거야.');
  set('c2e'); ctx.goal('본전의 윤설에게 달빛이끼 전하기');
}
async function cure() {
  await say('yun', '구했어요? 잘했어요. 사흘은 걸리지만 깨어나실 거예요.');
  await narr('사흘이 지났다.');
  await say('lord', '…의원 낭자에게 들었다. 네가 이끼를 캐 왔다고.');
  await say('lord', '장로 중에 누가 내게 독을 먹였는지 안다. 다만 증거가 없다. 장서각에 십칠 년 전 기록이 있을 것이다.');
  await say('me', '십칠 년 전이요?');
  await say('lord', '구파일방과 오대세가가 정천맹의 깃발 아래 모여 월하문을 친 해다. 아는 이름인가?');
  await say('me', '…조금요.');
  await say('yun', '문주님 곁은 제가 지킬게요. 다치지 말고 다녀와요. 이번엔 장부에 안 적을게요.');
  const c = await choice('윤설이 작은 약병을 건넨다.', ['손을 잡고 고맙다고 말한다', '장부에 적으라고 농담한다']);
  if (c === 0) { await say('yun', '…손 놓아요. 약 쏟아져요.'); ctx.love('yun'); } else await say('yun', '적었어요. 이자도요.');
  S().potion += 2;
  F().night = true; set('c2f'); ctx.goal('밤에 장서각 들어가기 (왼쪽 건물)');
}
async function library() {
  await say('me', '십칠 년 전 기록… 여기 있는데 가운데가 다 뜯겨 있어.');
  await say('so', '찾는 게 같네.');
  await say('me', '깜짝이야! 왜 여기 있어요?');
  await say('so', '내 사부가 십칠 년 전 월하문 토벌에 나갔다가 돌아오지 않았어. 벽수궁에선 다들 입을 다물고.');
  await say('so', '그래서 객이라는 이름으로 왔어. 너는? 점소이가 장서각에 들어올 이유는 없을 텐데.');
  const c = await choice('소연하가 빤히 본다.', ['월하문의 마지막 아이라고 털어놓는다', '심부름이라고 얼버무린다']);
  if (c === 0) { await say('me', '저, 월하문 사람이래요. 얼마 전에 알았어요.'); await say('so', '…그래서 그 걸음이구나. 고마워, 말해 줘서. 이제 나도 숨길 게 없네.'); ctx.love('so'); }
  else { await say('me', '심부름이에요.'); await say('so', '거짓말이 서툴구나. 됐어. 언젠가 말해.'); }
  await say(null, '뜯긴 장부 틈에서 쪽지 하나가 떨어졌다. “토벌대 명부. 내통자 낙월. 맹주 수결.”');
  await say('so', '맹주 수결이라고? 정천맹주 연경추?');
  await say('wi', '거기까지.');
  await say('wi', '문주를 살린 것은 뜻밖이었다. 아이들이 밤에 책을 읽다 죽는 일은 흔하지.');
  ctx.note('장서각 쪽지: “토벌대 명부. 내통자 낙월. 맹주 수결.”');
  await ctx.duel({ foes: ['shadow', 'shadow', 'shadow'], allies: ['so_ally'], arena: 'room', title: '장서각 습격', bgm: 'fight' });
  await say('so', '본전으로 도망쳤어! 문주가 위험해!');
  F().night = false;
  set('c2g'); ctx.goal('본전으로 달려가 위문상을 막기');
  await ctx.warp('cloudmt', 22.5, 9, 1);
}
async function wiBoss() {
  await say('wi', '점소이 하나가 십칠 년 공든 탑을 건드리는구나.');
  await say('me', '곽 아주머니 어디 있어요.');
  await say('wi', '네 사문의 초식이 그렇게 궁금하더냐. 나도 궁금했다. 그래서 내 품에 두 장이 있지. 가져가 보아라.');
  await ctx.duel({ foes: ['elder_wi'], arena: 'room', bgm: 'boss', title: '검각주 위문상' });
  await say('wi', '…맹주께서는… 너를 기다리신다… 구화성에서…');
  await narr('위문상의 품에서 찢어진 종이 두 장이 나왔다.');
  ctx.page('moon3'); ctx.page('moon4');
  await say('lord', '창운문이 부끄럽구나. 사과로는 모자라겠지. 내가 가르칠 수 있는 것이라도 가져가거라.');
  ['cloud_flash', 'flow_three', 'wind_turn', 'swallow_qi', 'fall_flower'].forEach(learn);
  await say('lord', '《청운검법》이다. 검을 든다면 쓸모가 있을 것이다.');
  await say('lord', '구화성에서 곧 천하비무대회가 열린다. 우승자에게는 월하문의 유물 달거울을 준다고 맹주가 직접 정했지. 이상하지 않으냐.');
  await say('so', '너를 부르는 미끼네. 그래도 갈 거지? 나도 간다. 비무대에서 만나면 안 봐줘.');
  await say('lord', '대회까지 석 달이 남았다. 지금 네 무공으로는 예선도 어렵다. 강호를 보고 오너라. 소림에 서찰을 써 주마.');
  await say('lord', '네 걸음을 알아볼 사람이 거기 있을지도 모른다.');
  ctx.silver(300);
  set('t1'); ctx.goal('산문 앞 뱃길 안내에서 소림으로 떠나기');
}
// ── 3장 ──
export async function toGuhwa() {
  F().boat_guhwa = true;
  await narr('제3부 · 천하비무\n\n구화성. 구파일방과 오대세가가 모두 깃발을 들고 왔다.\n강호 사람이 다 모였다는 말이 과장이 아닌 날이었다.');
  await ctx.warp('guhwa', 24.5, 29, 1);
  await say('yun', '사람이 너무 많아요. 소매치기 조심해요.');
  await say('me', '아, 금봉 객잔에서 시끄러운 소리가 나는데요.');
  await say('yun', '동문 밖 구파 회관에는 구파일방이, 서문 밖 세가 거리에는 오대세가가 묵는대요. 대표들에게 비무를 청할 수도 있다던데요.');
  await say('me', '이기면 뭘 주나요?');
  await say('yun', '인정해 주면 자기네 무공을 조금 나눠 주는 게 강호 예법이래요. 지면 망신이고요.');
  set('c3b'); ctx.goal('금봉 객잔에 들르기, 광장의 심판에게 대회 등록하기 (동문·서문에서 문파 비무 가능)');
}
async function monkMeet() {
  await say('host', '스님! 돼지고기 세 근에 술 두 병이요! 스님이 그걸 드시고 돈이 없다니요!');
  await say('cheol', '시주, 부처님은 고기를 탓하지 않으셨소. 다만 값을 탓하지도 않으셨지.');
  await say('me', '제가 객잔 일을 해 봐서 아는데, 이런 손님이 제일 나빠요. 얼마예요?');
  S().silver = Math.max(0, S().silver - 20);
  await say('cheol', '오! 시주의 얼굴에 공덕이 넘치오. 나는 철우라 하오. 소림에서 쫓겨났지. 비무대회에 나가 상금으로 갚으려던 참이오.');
  await say('cheol', '밥 한 끼 빚졌으니 이건 공짜요. 주먹 쓰는 법이오.');
  learn('iron_fist'); learn('earth_stomp');
  F().met_cheol = true; F().monk_met = true;
}
const ROUNDS = [['fighter_a', '공동파 곽충'], ['fighter_b', '팽가 방계 마혜'], ['fighter_c', '곤륜파 등표'], ['cheolu_spar', '소림 파계승 철우']];
async function bracketName() {
  await say('judge', '대진표를 쓰겠소. 이름은 적었고, 별호는 뭐요?');
  await say('me', '별호요?');
  await say('judge', '강호에 이름 석 자만 들고 나오는 사람은 없소. 없으면 지금 지으시오. 대진표에 오른 이름이 곧 강호에 도는 이름이오.');
  S().title = await ctx.ask('별호 짓기', '대진표에 올릴 별호를 적으세요. 메뉴의 상태에서 언제든 다시 바꿀 수 있습니다.', S().title);
  await say('judge', '{호} {나}. 적었소.');
  F().title_free = true;
}
async function judge() {
  if (!F().title_free) await bracketName();
  const r = F().round || 0;
  if (!F().monk_met) { await say('judge', '등록은 받았소. 그런데 객잔 소동부터 해결하고 오시오. 그쪽 사람들이 난리요.'); return; }
  if (r === 2 && !F().chief_met) { await say('judge', '맹주께서 찾으시오. 정천맹 객관으로 가 보시오.'); return; }
  if (r === 3 && !F().ambushed) { await say('judge', '오늘 경기는 끝났소. 객잔에서 쉬시오.'); return; }
  if (r >= 4) { if (at('c3e')) await finalMatch(); else await say('judge', '결승 준비가 되면 말씀하시오.'); return; }
  const [id, name] = ROUNDS[r];
  const c = await choice(`${r + 1}회전 상대는 ${name}. 올라가시겠소?`, ['올라간다', '조금 더 준비한다'], 'judge');
  if (c) return;
  await say('judge', '{호} {나}, 비무대로 오르시오.');
  if (id === 'cheolu_spar') { await say('cheol', '시주! 빚은 빚이고 비무는 비무요. 힘껏 치시오. 내가 이기면 밥 한 끼 더 사시오.'); }
  await ctx.duel({ foes: [id], arena: 'ring', bgm: 'boss', title: `${r + 1}회전 · ${name}`, yieldAt: .25 });
  F().round = r + 1;
  if (r === 0) ctx.goal('다음 경기까지 시내를 둘러보고 심판에게 말하기');
  if (r === 1) { await say('judge', '훌륭하오. 맹주께서 직접 뵙고 싶다 하시오. 동쪽 정천맹 객관으로 가시오.'); ctx.goal('동쪽 정천맹 객관에서 맹주 만나기'); }
  if (r === 2) { await say('judge', '오늘 경기는 여기까지요. 푹 쉬시오.'); ctx.goal('금봉 객잔에서 쉬기'); }
  if (r === 3) {
    await say('cheol', '졌소! 밥은 내가… 아니, 시주가 사시오. 대신 이걸 주겠소.');
    learn('chain_kick'); learn('diamond_body');
    if (!S().hearts.includes('iron_shirt')) { S().hearts.push('iron_shirt'); toast('심법 철포삼을 익혔다'); }
    ctx.love('cheol'); set('c3e'); ctx.goal('결승 전에 소연하를 만나고, 심판에게 말하기');
  }
}
async function chiefMeet() {
  await say('chief', '네가 창운문을 구했다는 그 젊은이로구나. 앉거라. 차가 식는다.');
  await say('chief', '군에서 버려진 낭인이었다고? 좋다. 강호에는 그런 사람이 필요하다. 다들 출신을 너무 따져.');
  await say('chief', '나도 구파일방도 오대세가도 아닌 곳에서 왔다. 이 자리에 앉기까지 서른 해가 걸렸지.');
  await say('me', '맹주님, 십칠 년 전 월하문 일을 아십니까.');
  await say('chief', '알다마다. 내 평생의 부끄러움이다. 마공을 익혔다는 소문을 믿고 구파일방과 오대세가에 토벌을 청했지. 뒤늦게 소문이 거짓이라는 것을 알았다.');
  await say('chief', '달거울을 상품으로 내건 것도 속죄다. 유물이 옳은 사람에게 가기를 바라서.');
  await say('me', '…….');
  await say('so', '어때 보였어?');
  await say('me', '좋은 분 같았어요. 차도 맛있었고.');
  await say('so', '그게 무섭네.');
  F().chief_met = true; ctx.goal('광장의 심판에게 말하기');
}
async function ambush() {
  await say('me', '오늘은 푹 자자…');
  await narr('삼경. 창틀이 소리 없이 열렸다.');
  await ctx.duel({ foes: ['shadow2', 'shadow2', 'shadow2'], arena: 'room', title: '심야 암습', bgm: 'fight' });
  await say('cheol', '시주! 괜찮소? 내가 옆방에서 코를 고느라 늦었소.');
  await say('me', '이놈들은 왜 대회 중에 저를 노리죠?');
  await say('yun', '결승까지 올라가는 걸 원치 않는 사람과, 원하는 사람이 다른가 봐요.');
  F().ambushed = true; ctx.goal('광장의 심판에게 다음 경기 신청하기');
}
async function lantern() {
  await say('yun', '오늘 밤 등불 놀이가 있대요. 약재 사러 나왔다가 그냥 봤어요. 그냥요.');
  const c = await choice('윤설이 등불을 보고 있다.', ['같이 보자고 한다', '내일 경기 준비를 하러 간다']);
  if (c === 0) { await say('me', '같이 봐요. 저 등불 값은 제가 낼게요.'); await say('yun', '…처음으로 {나} 씨가 돈을 내는 걸 봤어요.'); await say('yun', '장부, 이번 건 지워 줄게요.'); ctx.love('yun'); if (!S().hearts.includes('mercy')) { S().hearts.push('mercy'); toast('심법 인의심공을 익혔다'); } }
  else await say('yun', '네. 그렇겠죠.');
  F().ev_lantern = true;
}
async function soEve() {
  await say('so', '내일이네. 안 봐준다고 했지.');
  await say('me', '알아요.');
  await say('so', '이기면 달거울을 네가 가져. 내가 이기면… 같이 맹주 앞에 서자. 어느 쪽이든 그 사람 얼굴을 볼 거야.');
  const c = await choice('소연하가 칼을 닦는다.', ['사부님을 꼭 찾자고 한다', '살살 해 달라고 한다']);
  if (c === 0) { await say('so', '찾는다는 말, 고맙네. 사실은 이미 죽었다는 걸 알아. 그래도 고마워.'); ctx.love('so'); if (!S().hearts.includes('swift')) { S().hearts.push('swift'); toast('심법 쾌검심결을 익혔다'); } }
  else await say('so', '싫어.');
  F().ev_soeve = true;
}
async function cheolDrink() {
  await say('cheol', '시주, 왜 쫓겨났는지 궁금하지 않소?');
  await say('me', '고기 드셔서요?');
  await say('cheol', '아니오. 소림 말사에 산적이 몰려왔는데 주지가 문을 닫으라 하더이다. 밖에 마을 사람들이 있는데. 그래서 문을 부수고 나갔지. 고기는 그 뒤에 배웠소.');
  await say('me', '…생각보다 멋있는 이유네요.');
  await say('cheol', '그러니 오늘 술값은 시주가 내시오.');
  F().ev_cheol = true; ctx.love('cheol');
}
async function finalMatch() {
  const left = 15 - clansWon();
  const c = await choice(`결승 상대는 소연하. 끝나면 구화성을 떠나게 될 것 같다.${left ? ` (아직 비무하지 않은 세력 ${left}곳)` : ''}`, ['올라간다', '조금 더 준비한다'], 'judge'); if (c) return;
  await say('so', '말했지. 안 봐줘.');
  await ctx.duel({ foes: ['so_final'], arena: 'ring', bgm: 'boss', title: '결승 · 소연하', yieldAt: .2 });
  await say('so', '…졌다. 분하네. 칼이 가벼워졌어, {호}.');
  await say('judge', '천하비무대회 우승자, {호} {나}!');
  await narr('함성 속에서 맹주가 직접 달거울을 건넸다.\n그날 밤 정천맹 객관에서 구파일방과 오대세가의 장문인들이 모인 축하 연회가 열렸다.');
  await ctx.warp('hall2', 7, 8, 1);
  await say('chief', '잔을 들어라. 네 아버지도 술이 약했지.');
  await say('me', '…네?');
  await say(null, '달거울이 품에서 뜨거워졌다. 거울에 비친 낱장에 숨은 글이 떠올랐다. “내통자 낙월을 움직인 자, 연경추. 달 없는 밤, 그가 문주를 베다.”');
  await say('chief', '거울을 봤구나. 일곱 장을 모아 준 것은 고맙다. 제자를 시키니 십칠 년이 걸려도 안 되더니, 네가 석 달 만에 하더구나.');
  await say('me', '곽 아주머니는 어디 있어요.');
  await say('chief', '월하곡. 제칠식이 거기 있으니 네가 올 줄 알았다. 다만 나는 네가 살아서 도착할 필요는 없다고 본다. 낱장만 도착하면 된다.');
  await say('yun', '{나} 씨! 잔 내려놔요! 독이에요!');
  await say(null, '윤설이 뛰어들어 잔을 쳐 냈다. 연회장의 문이 닫히고 얼굴 없는 자들이 내려왔다.');
  ctx.page('moon5'); ctx.page('moon6');
  await ctx.duel({ foes: ['shadow2', 'shadow2', 'shadow2', 'shadow2'], allies: ['so_ally', 'cheol_ally'], arena: 'room', title: '정천맹 객관 탈출', bgm: 'fight' });
  await say('cheol', '시주들, 뒷문이오! 내가 부쉈소! 문 부수는 건 내 전공이오!');
  await say('so', '곽 호법이 월하곡에 있다면 가야지. 내 사부 일도 거기서 끝내겠어.');
  await say('boat', '이런, 먼 데까지 왔더니 네가 쫓기고 있구나. 타라! 곽 아주머니 국수값은 내가 갚는다.');
  await G.route.crossroads();
}
// ── 4장 ──
async function trace(k) {
  if (F()['tr' + k]) { await say(null, '이미 살펴보았다.'); return; }
  F()['tr' + k] = true;
  if (k === 1) { await say(null, '돌문이 안에서 빗장이 풀린 채 쓰러져 있다. 주위에 구파일방과 오대세가의 찢어진 깃발이 흙에 묻혀 있다. 불에 탄 빗장 위로 희미한 환영이 떠올랐다.'); await say('voice', '“사형, 문을 열어요. 맹주가 약속했습니다. 마공을 익힌 자만 벌하겠다고.”'); }
  if (k === 2) { await say(null, '돌계단에 아이 신발 한 짝이 놓여 있다.'); await say('voice', '“큰아이는 못 찾았습니다! 작은아이부터! 곽 호법, 뛰시오!”'); }
  if (k === 3) { await say(null, '본전 터 아래 마흔아홉 개의 칼자국이 있다. 그중 하나는 유난히 깊다.'); await say('voice', '“연 형, 어찌하여….”'); }
  ctx.note(k === 1 ? '문을 연 사람은 “사형”이라 불렸다.' : k === 2 ? '아이가 둘이었다. 큰아이는 찾지 못했다고 한다.' : '문주를 벤 것은 “연 형”.');
  if (F().tr1 && F().tr2 && F().tr3) { set('c4b'); ctx.goal('본전 터의 석상 앞으로 가기'); }
}
async function baekReunion() {
  await say('baek', '왔구나. 방값 받으러 왔느냐.');
  await say('me', '…어르신.');
  await say('baek', '허리가 많이 펴졌다. 걸레질이 헛되지 않았구나.');
  await say('me', '낙월이 어르신이죠. 문을 연 것도요.');
  await say('baek', '그래. 내가 열었다. 연경추가 마공을 뿌리 뽑을 뿐 사람은 안 다친다고 했다. 믿고 싶었다. 사문에서 밀려난 대제자의 못난 마음이었지.');
  await say('baek', '그날 밤 너를 곽란에게 넘기고, 큰아이는 끝내 찾지 못했다. 그 뒤로 그믐마다 은자를 보내고 술을 마셨다.');
  await say('baek', '방값은 갚을 길이 없고, 이것뿐이다.');
  ctx.page('moon7');
  const has = S().weapons.includes('moon_sword'); if (!has) { S().weapons.push('moon_sword'); toast('월영검을 받았다'); }
  await say('baek', '제칠식 낙월. 네 아버지의 칼 월영검과 함께 가져가라. 그리고 달은 지지만 또 뜬다는 것만 기억해라.');
  const c = await choice('백 노인이 고개를 숙인다.', ['용서한다고 말한다', '방값은 나중에 받겠다고 말한다', '아무 말도 하지 않는다']);
  if (c === 0) await say('baek', '그 말은 곽란에게 듣기로 하마.');
  if (c === 1) { await say('baek', '허허… 그래. 살아서 갚으마.'); F().baek_live = true; }
  if (c === 2) await say('baek', '그래. 그게 맞다.');
  await say('fox', '감동적이군요, 사부님.');
  await say('baek', '…비켜라, 아이야.');
  await narr('여우 가면의 칼이 백 노인의 어깨를 꿰뚫었다.\n그 뒤로 골짜기가 울리며 붉은 눈이 떠올랐다.');
  await say('fox', '먼저 저것을 이겨 보아라. 맹주가 월하문의 시신으로 빚은 것이다. 이기면 위에서 기다리지.');
  await ctx.duel({ foes: ['demon_eye'], arena: 'moon', bgm: 'boss', title: '혈안귀' });
  set('c4c'); ctx.goal('북쪽 석상 앞에서 여우 가면과 맞서기');
}
async function foxBoss() {
  await say('fox', '달이 이제 좀 찼구나.');
  await say('me', '곽 아주머니를 내놔요.');
  await say('fox', '저 안에 있다. 살아 있지. 그 노인네가 내 이름을 부를까 봐 죽이지 못했다.');
  await say('me', '당신, 왜 월하칠식을 써요.');
  await say('fox', '직접 물어봐라. 칼로.');
  await ctx.duel({ foes: ['fox'], arena: 'moon', bgm: 'boss', title: '여우 가면' });
  await narr('가면이 갈라져 떨어졌다.\n거기에는, 곽 아주머니가 그토록 자주 들여다보던 위패 속 문주의 얼굴이 있었다.');
  await say('cheon', '…너도 개처럼 컸다더구나. 나는 여덟 살에 저 사람 손에 끌려가 사람 죽이는 법을 배웠다.');
  await say('me', '큰아이… 월천. 그럼 당신이…');
  await say('cheon', '피붙이라고는 부르지 마라. 그 말을 들으면 칼을 못 든다.');
  await say('cheon', '하나만 알아 둬라. 북쪽 변경 마을에 불을 지른 건 전쟁이 아니다. 너를 찾던 무면당이다. 견대도 저 사람이 고아를 모으려고 만든 곳이고.');
  await say('me', '…제 번호도요?');
  await say('cheon', '그 마지막 임무도. 네가 살아 돌아온 것만 저 사람의 계산에 없었다.');
  await say('gwak', '천아! 이 못난 놈, 밥은 먹고 다니냐!');
  await say('cheon', '…아주머니.');
  await say('chief', '다들 모였구나. 쓸모가 다한 것도 함께.');
  await narr('연경추의 검이 월천의 등을 뚫었다.\n월천은 쓰러지면서도 맹주의 손목을 붙들었다.');
  await say('cheon', '가라… 달이… 뜰 때… 베어라…');
  set('c4d');
  await G.route.chiefBattle();
  await ending();
}
async function ending() {
  if (S().side && S().side !== 'jeong') return G.route.routeEnding();
  await narr('달이 떴다.\n강호는 맹주가 쓰러졌다는 소식으로 석 달을 시끄러웠고,\n월천의 무덤은 마흔아홉 위패 곁에 쉰 번째로 놓였다.');
  await narr('정천맹은 해체되었다.\n구파일방과 오대세가의 장문인들은 차례로 월하곡에 올라 향을 피웠다.\n열일곱 해가 늦은 향이었다.');
  await say('gwak', '방값은?');
  await say('me', '아주머니, 첫마디가 그거예요?');
  await say('gwak', '살아 돌아왔으니 된 거지. 그래서, 그 낱장들은 어쩔 거냐.');
  const c = await choice('찢어진 일곱 장을 앞에 두고', ['태운다. 이 때문에 죽은 사람이 너무 많다', '문파를 다시 세운다. 달은 또 뜬다', '우선 객잔부터 다시 짓는다']);
  if (c === 0) { await narr('일곱 장은 재가 되어 강으로 날아갔다.\n초식은 이제 한 사람의 걸음에만 남았다.\n그 뒤로 강호에 걸레질이 유독 빠른 사람이 있다는 소문이 돌았다.'); }
  if (c === 1) { await narr('월하곡에 다시 돌문이 섰다. 첫 제자는 쟁반을 든 꼬마였다.\n입문 시험은 걸레질이다.'); }
  if (c === 2) { await narr('달맞이 객잔이 다시 문을 열었다.\n윤씨 약방이 장부를 들고 찾아오고,\n벽수궁의 검객이 국수를 먹고 가고,\n파계승은 오늘도 밥값이 없다.'); }
  if (F().baek_live) await say('baek', '점소이. 방값 가져왔다. 이자는 깎자.');
  { const q = S().married || S().partner; if (q) await say(q, G.life.pick(G.life.cand[q].chat)); }
  await narr('강호에 이름 하나가 남았다.\n{호} {나}.');
  await narr('그해 겨울, 서쪽 하늘에 붉은 달이 떴다.\n개방의 거지들이 밥그릇을 엎었고,\n사파의 깃발 아래에서도 처음으로 침묵이 흘렀다.\n\n강호행 · 제1막 끝\n이야기는 제7부 ‘붉은 달’로 이어집니다.');
  set('end'); F().cleared = true; ctx.goal('');
  await ctx.warp('cheongha', 22.5, 16, 0);
}

Story.providers.push(function content2(id) {
  const n = [], sp = [], tr = [], ro = [];
  if (id === 'pass' && at('c2a')) { /* 창운산 가는 길 */ }
  if (id === 'cloudmt') {
    if (at('c2a')) tr.push({ x: 18, y: 28, w: 10, h: 6, when: () => at('c2a'), run: arrive });
    n.push({ id: 'go', spr: 'Inspector', x: 22.5, y: 19, dir: 0, mark: () => at('c2b'), when: () => !after('c3a'), talk: async () => { if (at('c2b')) await exam(); else await say('go', '수련을 게을리하지 마라, 사제.'); } });
    n.push({ id: 'disc', spr: 'GreenNinja', x: 15, y: 19, dir: 3, talk: async () => { const c = await choice('연무장에서 대련할까?', ['대련한다', '그만둔다'], 'disc'); if (c === 0) await ctx.duel({ foes: ['disciple', 'disciple'], arena: 'court', title: '대련', optional: true, bgm: 'fight' }); } });
    n.push({ id: 'smith2', spr: 'Caveman2', x: 32, y: 23, dir: 2, talk: async () => { await say('smith', '창운문 병기창이오. 값은 치르시오.'); await ctx.shop('창운문 병기창', [ctx.item.weapon('blue_sword'), ctx.item.weapon('ghost_blade'), ctx.item.weapon('dragon_spear'), ctx.item.weapon('iron_gauntlet'), ctx.item.potion()]); } });
    sp.push({ x: 39, y: 7, w: 3, h: 3, hint: '살펴보기', act: moss });
    if (after('c2d') || at('c2d')) ro.push({ spr: 'chars/GrayNinja', x: 36, y: 12, foes: ['shadow'] });
    sp.push({ x: 21, y: 34, w: 4, h: 2, hint: '뱃길 안내', when: () => at('c3a') || !!F().boat_guhwa, act: async () => { if (at('c3a')) await toGuhwa(); else { const c = await choice('구화성으로 갈까?', ['간다', '그만둔다']); if (!c) await ctx.warp('guhwa', 24.5, 29, 1); } } });
  }
  if (id === 'hall_in') {
    n.push({ id: 'yun', spr: 'Princess', x: 8, y: 9, dir: 1, mark: () => at('c2c', 'c2e'), when: () => at('c2c', 'c2d', 'c2e', 'c2f'), talk: async () => { if (at('c2c')) await lordSick(); else if (at('c2e')) await cure(); else await say('yun', '곁에 있을게요.'); } });
    n.push({ id: 'wi', spr: 'Noble', x: 10.5, y: 9, dir: 1, when: () => at('c2g'), mark: () => true, hint: '맞서기', talk: wiBoss });
    n.push({ id: 'lord', spr: 'Monk', x: 9, y: 5.4, dir: 0, when: () => after('c2f'), talk: async () => { await say('lord', '몸은 나아졌다. 고맙구나.'); } });
  }
  if (id === 'library' && at('c2f')) sp.push({ x: 6, y: 2, w: 3, h: 3, hint: '기록 찾기', act: library });
  if (id === 'guhwa') {
    n.push({ id: 'judge', spr: 'Inspector', x: 24.5, y: 15, dir: 0, mark: () => after('c3b') && !after('c4a'), when: () => !after('c4a'), talk: judge });
    n.push({ id: 'yun', spr: 'Princess', x: 13, y: 15, dir: 3, mark: () => (F().round || 0) >= 1 && !F().ev_lantern, when: () => !after('c4a') && S().married !== 'yun', talk: async () => { if ((F().round || 0) >= 1 && !F().ev_lantern) await lantern(); else await say('yun', '금창약은 넉넉해요? 값은 장부에.'); } });
    n.push({ id: 'so', spr: 'RedSamurai', x: 34, y: 15, dir: 2, mark: () => at('c3e') && !F().ev_soeve, when: () => (!after('c4a') || at('end')) && S().married !== 'so', talk: async () => { if (at('c3e') && !F().ev_soeve) await soEve(); else await say('so', '칼은 닦았어?'); } });
    n.push({ id: 'cheol', spr: 'Monk2', x: 20, y: 22, dir: 3, mark: () => !!F().monk_met && !F().ev_cheol, when: () => !!F().monk_met && (!after('c4a') || at('end')), talk: async () => { if (!F().ev_cheol) await cheolDrink(); else await say('cheol', '나무아미… 저 만두 하나만.'); } });
    n.push({ id: 'boat', spr: 'OldMan2', x: 26.5, y: 29, dir: 2, talk: async () => { const c = await choice('청하진으로 갈까?', ['간다', '그만둔다'], 'boat'); if (!c) await ctx.warp('cheongha', 22.5, 26, 1); } });
  }
  if (id === 'inn2') {
    n.push({ id: 'host', spr: 'Villager', x: 4, y: 4.6, dir: 0, mark: () => after('c3b') && !F().monk_met, talk: async () => { if (!F().monk_met) await monkMeet(); else await say('host', '어서 오시오. 스님 빚을 대신 갚은 분이시지.'); } });
    tr.push({ x: 2, y: 6, w: 14, h: 6, when: () => (F().round || 0) === 3 && !F().ambushed, run: ambush });
  }
  if (id === 'shop2') n.push({ id: 'shopk', spr: 'Noble', x: 5, y: 3.6, dir: 0, talk: async () => { const c = await choice('무엇을 할까?', ['물건 사기', '가구 사기', '선물 사기', '물건 팔기', '그만둔다'], 'shopk'); if (c === 1) await ctx.shop('구화 상회 · 가구', ['bookcase', 'shelf', 'rack', 'scroll', 'chair', 'dummy', 'plum_tree', 'sword_rack'].map(ctx.item.furn)); if (c === 2) await ctx.shop('구화 상회 · 선물', [['tea', 44], ['plum_wine', 70], ['hairpin', 130], ['sachet', 60], ['poem', 90], ['jade', 200]].map(a => ctx.item.stuff(...a))); if (c === 3) await G.life.openSell(); if (c) return; await ctx.shop('구화 상회', [ctx.item.potion(), ctx.item.weapon('blue_sword'), ctx.item.weapon('dragon_spear'), ctx.item.weapon('ghost_blade'), ctx.item.weapon('iron_gauntlet'), ctx.item.book('one_point', 200), ctx.item.book('dragon_pass', 260), ctx.item.book('sweep_army', 260), ctx.item.book('mad_wind', 260), ctx.item.book('hundred_flower', 340), ctx.item.book('sky_pierce', 700), ctx.item.heart('fury', 300)]); } });
  if (id === 'hall2' && !after('c3e')) n.push({ id: 'chief', spr: 'Master', x: 7, y: 4.6, dir: 0, mark: () => (F().round || 0) === 2 && !F().chief_met, talk: async () => { if ((F().round || 0) >= 2 && !F().chief_met) await chiefMeet(); else await say('chief', '차가 식는다.'); } });
  if (id === 'wolha') {
    sp.push({ x: 20, y: 28, w: 4, h: 2, hint: '쓰러진 돌문', act: () => trace(1) }, { x: 7, y: 22, w: 3, h: 3, hint: '돌계단', act: () => trace(2) }, { x: 33, y: 22, w: 3, h: 3, hint: '칼자국', act: () => trace(3) });
    n.push({ id: 'baek', spr: 'OldMan3', x: 22, y: 10, dir: 0, mark: () => at('c4b'), when: () => at('c4b'), talk: baekReunion });
    n.push({ id: 'fox', spr: 'MaskedNinja', x: 22, y: 6.5, dir: 0, mark: () => at('c4c'), when: () => at('c4c'), hint: '맞서기', talk: foxBoss });
    ro.push({ spr: 'mon/Spirit', x: 14, y: 30.5, foes: ['ghost', 'ghost'] }, { spr: 'chars/Skeleton', x: 30, y: 30.5, foes: ['skull', 'ghost'] }, { spr: 'mon/Spirit', x: 8.5, y: 25, foes: ['ghost', 'skull'] }, { spr: 'chars/Skeleton', x: 21, y: 20.5, foes: ['skull', 'skull'] }, { spr: 'mon/Spirit', x: 22, y: 14, foes: ['ghost', 'ghost', 'skull'] });
  }
  return { npcs: n, spots: sp, trigs: tr, roam: ro };
});
