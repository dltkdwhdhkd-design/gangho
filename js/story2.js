// 2장 창운산, 3장 구화성, 4장 월하곡
import { G, Sound, fadeTo, wait, toast } from './core.js';
import { Story, ctx, say, narr, choice } from './ctx.js';
import { step, set, at, after } from './story1.js';
import { learn } from './state.js';
import { clansWon } from './clandata.js';
import { after2 } from './part2.js';

const S = () => G.S, F = () => G.S.flags;
// ── 2장 ──
async function arrive() {
  await ctx.part(2, '구름 위의 칼', '제1장 입문');
  await narr('창운산에는 창운문이 있다. 구파일방 바로 아래 자리를 넘본다는 신흥 명문이다.');
  await narr('산문까지 돌계단이 구백 칸이라고 했다. 세다가 육백 칸쯤에서 잊어버렸다. 계단 끝에 사람들이 줄을 서 있었다. 보따리를 멘 사람, 아버지 손에 끌려온 사람, 칼 대신 낫을 찬 사람도 있었다.');
  await say('jangpal', '형씨도 시험 보러 왔어유? 나는 이번이 세 번째유.');
  await say('me', '세 번이나요?');
  await say('jangpal', '첫해는 목검을 놓쳤고 작년엔 배가 아파서 나갔어유. 올해도 떨어지면 집에 가서 소나 몰아야 되는디, 우리 집에 소가 없어유.');
  await say('me', '그럼 뭘 몰아요?');
  await say('jangpal', '그러니께 꼭 붙어야지유.');
  await say('yun', '저는 문주님 진맥하러 왔다고 하면 되는데, {나} 씨는 어쩌려고요?');
  await say('me', '입문 시험을 볼 거예요. 외문 제자로 들어가서 서찰에 인장 찍은 놈을 찾아야죠.');
  await say('yun', '점소이가 시험을 본다고요?', 'b');
  await say('me', '칼은 좀 쓰니까요.');
  await say('yun', '그건 그렇죠. 너무 튀지나 마요.', 'h');
  set('c2b'); ctx.goal('연무장에서 고진 사형에게 입문 시험 보기');
}
async function exam() {
  await say('go', '객잔 심부름꾼이 창운문에 들어오겠다고? 여기는 국수 나르는 데가 아니다.');
  await say('me', '시험은 누구나 볼 수 있다고 들었는데요.');
  await say('go', '좋다. 제자 둘을 이기면 나와 겨룰 기회를 주겠다.');
  await ctx.duel({ foes: ['disciple', 'disciple'], arena: 'court', title: '입문 시험', yieldAt: 0 });
  await say('go', '제법 움직이는군. 그 걸음은 어디서 배웠느냐?');
  await ctx.duel({ foes: ['senior_go'], arena: 'court', bgm: 'boss', title: '사형 고진', yieldAt: .25 });
  await say('go', '인정하겠다. 외문 제자로 받아 주지. 앞으로 나를 사형이라고 불러라.');
  await narr('장팔도 붙었다. 목검을 또 놓쳤는데 상대가 그걸 밟고 미끄러졌다고 했다.');
  await say('go', '외문 제자는 묘시에 일어난다. 물 긷고 마당 쓸고 밥 짓고, 그러고 남는 시간에 칼을 잡는다. 불만 있으면 지금 내려가라.');
  await say('me', '마당은 잘 씁니다.');
  await say('go', '그건 두고 보자.');
  await ctx.chap(2, '구름 위의 칼', '제2장 연무장의 나날');
  ctx.cg('go_yard');
  await say('so', '야, 너 걸음이 재밌다. 어디서 배웠어?', 'h');
  await say('me', '누구세요?');
  await say('so', '벽수궁 소연하. 객으로 와 있어. 그 걸음 창운문 거 아니지? 나랑 한판 하자.', 'h');
  await say('me', '방금 시험 끝났는데요.');
  await say('so', '잘됐네. 몸 풀렸겠다.', 'h');
  await ctx.duel({ foes: ['so_rival'], arena: 'court', bgm: 'boss', title: '소연하', yieldAt: .35 });
  await say('so', '너 점소이라고 했지? 근데 칼이 왜 사람 목만 노려? 어디서 배웠어?');
  await say('me', '배운 적은 없어요. 안 그러면 죽는 데 있었거든요.');
  await say('so', '뭐야, 너 좀 무섭다. 마음에 들어.', 'h');
  F().met_so = true;
  set('c2b2'); ctx.goal('외문 일과: 우물가 물 긷기, 연무장 목인 치기, 식당 밥 당번');
}
async function lordSick() {
  await ctx.chap(2, '구름 위의 칼', '제3장 문주의 병');
  await say('yun', '왔어요? 문주님 뵙고 왔는데 병이 아니에요.');
  await say('me', '그럼 뭔데요?');
  await say('yun', '칠일소혼산이라는 독이에요. 이레에 한 번씩 조금씩 먹이는 건데, 곁에 있는 사람 아니면 먹일 수가 없어요.');
  await say('wi', '검각주 위문상이오. 의원 낭자, 문주께서는 오래된 지병이시오. 함부로 입을 놀리지 마시오.');
  await say('yun', '네, 죄송합니다.');
  if (F().wi_tea) { await say('yun', '(작은 목소리로) 혹시 검각에서 주는 거 뭐 마셨어요? 손 줘 봐요.'); await narr('윤설이 내 손목을 짚고 한참 있다가 놓았다.'); await say('yun', '괜찮아요. 한 번으로는 티도 안 나요. 앞으로 여기서 주는 건 아무것도 먹지 마요.'); }
  await say('yun', '(작은 목소리로) 달빛이끼만 있으면 해독할 수 있어요. 산 북동쪽 바위틈에 난대요. 저 사람 눈에 띄지 않게 가요.');
  set('c2d'); ctx.goal('창운산 북동쪽 끝 매화나무 아래에서 달빛이끼 캐기');
}
async function moss() {
  if (!at('c2d')) { await say(null, '흰 매화 아래 바위틈이 축축하다.'); return; }
  await say('me', '이게 달빛이끼인가. 낮인데도 희미하게 빛나네.');
  await say('shadow', '그건 두고 가라.');
  await ctx.duel({ foes: ['shadow', 'shadow', 'puppet'], arena: 'forest', title: '무면회', bgm: 'fight' });
  await say('me', '창운산 안에 흑의인이 있다니. 누가 불러들인 거지.');
  set('c2e'); ctx.goal('본전의 윤설에게 달빛이끼 전하기');
}
async function cure() {
  await say('yun', '구했어요? 잘했어요. 사흘쯤 걸리겠지만 깨어나실 거예요.', 'h');
  await narr('사흘이 지났다.');
  await say('lord', '의원 낭자에게 들었소. 그대가 이끼를 캐 왔다지.');
  await say('lord', '장로 중 누가 내게 독을 먹였는지는 짐작이 가오. 다만 증거가 없소. 장서각에 십칠 년 전 기록이 있을 것이오.');
  await say('me', '십칠 년 전이요?');
  await say('lord', '구파일방과 오대세가가 정천맹 깃발 아래 모여 월하문을 친 해 말이오. 혹시 아는 이름이오?');
  await say('me', '조금요.');
  await say('yun', '문주님은 제가 지킬게요. 다치지 말고 다녀와요.');
  const c = await choice('윤설이 작은 약병을 건넨다.', ['손을 잡고 고맙다고 한다', '약값은 얼마냐고 묻는다']);
  if (c === 0) { await say('yun', '손 놔요. 약 쏟아져요.', 'a'); ctx.love('yun'); } else await say('yun', '지금 그걸 물어요? 나중에 한꺼번에 받을게요.', 'b');
  S().potion += 2;
  F().night = true; set('c2f'); ctx.goal('밤에 장서각 들어가기 (왼쪽 건물)');
}
async function library() {
  await ctx.chap(2, '구름 위의 칼', '제4장 장서각의 밤');
  ctx.cg('library');
  await say('me', '십칠 년 전 기록이 여기 있는데 가운데가 다 뜯겨 있네.');
  await say('so', '너도 그거 찾으러 왔어?');
  await say('me', '언제 들어왔어요?');
  await say('so', '내 사부님이 십칠 년 전 월하문 토벌에 나갔다가 안 돌아오셨어. 벽수궁에서는 아무도 말을 안 해 주고.', 's');
  await say('so', '그래서 객으로 들어온 거야. 넌? 점소이가 장서각엔 왜 왔어?');
  const c = await choice('소연하가 빤히 쳐다본다.', ['월하문의 마지막 아이라고 털어놓는다', '심부름이라고 둘러댄다']);
  if (c === 0) { await say('me', '월하문 사람이래요. 얼마 전에 알았어요.'); await say('so', '아, 그래서 그 걸음이구나. 말해 줘서 고맙다.', 'h'); ctx.love('so'); }
  else { await say('me', '심부름이요.'); await say('so', '거짓말 되게 못한다. 됐어, 말하기 싫으면 말아.', 'a'); }
  await say(null, '뜯긴 장부 틈에서 쪽지 하나가 떨어졌다. “토벌대 명부. 내통자 낙월. 맹주 수결.”');
  await say('so', '맹주 수결이라고? 정천맹주 연경추?', 'b');
  await say('wi', '거기까지 하시오.');
  await say('wi', '문주가 살아날 줄은 몰랐소. 밤에 책 읽다 변을 당하는 아이들이 더러 있더군.');
  ctx.note('장서각 쪽지: “토벌대 명부. 내통자 낙월. 맹주 수결.”');
  ctx.cgOff();
  await ctx.duel({ foes: ['shadow', 'shadow', 'shadow'], allies: ['so_ally'], arena: 'room', title: '장서각 습격', bgm: 'fight' });
  await say('so', '본전 쪽으로 갔어! 문주님이 위험해!', 'b');
  F().night = false;
  set('c2g'); ctx.goal('본전으로 달려가 위문상을 막기');
  await ctx.warp('cloudmt', 22.5, 9, 1);
}
async function wiBoss() {
  await ctx.chap(2, '구름 위의 칼', '제5장 검각주');
  await say('wi', '점소이 따위가 십칠 년 공들인 일을 망치는구나.');
  await say('me', '곽 아주머니 어디 있어.', 'a');
  await say('wi', '그보다 네 사문의 초식이 궁금하지 않으냐. 내 품에 두 장이 있다. 가져갈 수 있으면 가져가 보아라.');
  const allies = []; await after2.wiArrive(allies);
  await ctx.duel({ foes: ['elder_wi'], allies, arena: 'room', bgm: 'boss', title: '검각주 위문상' });
  await say('wi', '맹주께서… 구화성에서 너를 기다리실 것이다…');
  await narr('위문상의 품에서 찢어진 종이 두 장이 나왔다.');
  ctx.page('moon3'); ctx.page('moon4');
  await say('lord', '창운문이 부끄럽소. 사과로 될 일은 아니니, 내가 가르칠 수 있는 것이라도 가져가시오.');
  ['cloud_flash', 'flow_three', 'wind_turn', 'swallow_qi', 'fall_flower'].forEach(learn);
  await say('lord', '청운검법이오. 검을 쓴다면 도움이 될 것이오.');
  await say('lord', '곧 구화성에서 천하비무대회가 열리오. 우승자에게 월하문의 유물 달거울을 준다고 맹주가 직접 정했소. 이상하지 않소?');
  await say('so', '너 오라고 미끼 던진 거네. 그래도 갈 거지? 나도 갈 거야. 비무대에서 만나면 안 봐준다.', 'h');
  await say('lord', '대회까지 석 달 남았소. 지금 그대 무공으로는 예선도 어렵소. 강호를 좀 보고 오시오. 소림에 서찰을 써 주겠소.');
  await say('lord', '그대 걸음을 알아볼 사람이 거기 있을지도 모르오.');
  await after2.wiAfter();
  ctx.silver(300);
  set('t1'); ctx.goal('산문 앞 뱃길 안내에서 소림으로 떠나기');
}
// ── 3장 ──
export async function toGuhwa() {
  F().boat_guhwa = true;
  await ctx.chap(3, '강호 유람', '제3장 구화성');
  await narr('구화성에 구파일방과 오대세가의 깃발이 모두 모였다. 거리마다 칼 찬 사람들로 발 디딜 틈이 없었다.');
  await ctx.warp('guhwa', 24.5, 29, 1);
  await say('yun', '사람 진짜 많다. 소매치기 조심해요.', 'h');
  await say('me', '금봉 객잔 쪽이 시끄러운데요.');
  await say('yun', '아, 그리고 동문 밖 구파 회관에는 구파일방이, 서문 밖 세가 거리에는 오대세가가 묵는대요. 대표들한테 비무를 청할 수도 있다던데요.');
  await say('me', '이기면 뭘 주는데요?');
  await say('yun', '인정받으면 자기네 무공을 조금 가르쳐 준대요. 지면 망신이고요.');
  set('c3b'); ctx.goal('금봉 객잔에 들르기, 광장의 심판에게 대회 등록하기 (동문·서문에서 문파 비무 가능)');
}
async function monkMeet() {
  await say('host', '스님! 돼지고기 세 근에 술이 두 병이오! 그걸 다 드시고 돈이 없다니요!');
  await say('cheol', '시주, 너무 야박하게 굴지 마시오. 비무대회 상금 타면 갚는다니까 그러시오.');
  await say('me', '얼마예요? 제가 낼게요.');
  S().silver = Math.max(0, S().silver - 20);
  await say('cheol', '오! 고맙소, 시주! 나는 철우라 하오. 소림에서 쫓겨난 땡중이지.');
  await say('cheol', '밥 한 끼 빚졌으니 그냥 갈 수야 없지. 주먹 쓰는 법을 하나 가르쳐 드리겠소.');
  learn('iron_fist'); learn('earth_stomp');
  F().met_cheol = true; F().monk_met = true;
}
const ROUNDS = [['fighter_a', '공동파 곽충'], ['fighter_b', '팽가 방계 팽소소'], ['fighter_c', '곤륜파 등표'], ['cheolu_spar', '소림 파계승 철우']];
async function bracketName() {
  await say('judge', '대진표를 쓰겠소. 이름은 적었고, 별호는 뭐요?');
  await say('me', '별호요?');
  await say('judge', '강호에 이름만 들고 나오는 사람은 없소. 없으면 지금 지으시오. 대진표에 적은 대로 강호에 소문이 나오.');
  S().title = await ctx.ask('별호 짓기', '대진표에 올릴 별호를 적으세요. 메뉴의 상태에서 언제든 다시 바꿀 수 있습니다.', S().title);
  await say('judge', '{호} {나}. 적었소.');
  F().title_free = true;
}
async function judge() {
  if (!F().title_free) await bracketName();
  const r = F().round || 0;
  if (!F().monk_met) { await say('judge', '등록은 됐소. 그런데 금봉 객잔에 무슨 소동이 났나 보오. 그쪽부터 가 보시오.'); return; }
  if (r === 2 && !F().chief_met) { await say('judge', '맹주께서 찾으시오. 정천맹 객관으로 가 보시오.'); return; }
  if (r === 3 && !F().ambushed) { await say('judge', '오늘 경기는 끝났소. 객잔에서 쉬시오.'); return; }
  if (r >= 4) { if (at('c3e')) await finalMatch(); else await say('judge', '결승 준비가 되면 말씀하시오.'); return; }
  const [id, name] = ROUNDS[r];
  const c = await choice(`${r + 1}회전 상대는 ${name}. 올라가시겠소?`, ['올라간다', '조금 더 준비한다'], 'judge');
  if (c) return;
  await say('judge', '{호} {나}, 비무대로 오르시오.');
  if (id === 'cheolu_spar') { await say('cheol', '시주! 빚은 빚이고 비무는 비무요. 사정 안 봐주겠소. 내가 이기면 밥 한 끼 더 사시오!'); }
  if (r === 0) await say('gwakchung', '공동파 곽충이오. 주먹이 좀 아플 거요. 미리 말해 두는 거요.');
  if (r === 1) await say('sosu', '팽가 방계 팽소소다. 본가 사람들이 저 위에서 구경 중이니까 쉽게는 안 져 줄 거야.');
  if (r === 2) await say('deung', '곤륜파 등표요. 산에서 내려온 건 처음이라 사람이 이렇게 많은 줄 몰랐소. 어지럽구려.');
  await ctx.duel({ foes: [id], arena: 'ring', bgm: 'boss', title: `${r + 1}회전 · ${name}`, yieldAt: .25 });
  F().round = r + 1;
  if (r === 0) await say('gwakchung', '내가 친 자리가 자꾸 비어 있던데, 그 걸음 뭐요? 아무튼 졌소. 공동산에 오면 술 한잔 삽시다.');
  if (r === 1) await say('sosu', '본가 애들 표정 봤어? 방계가 여기까지 올라온 건 처음이래. 너한테 진 건 분한데 그건 좋다.');
  if (r === 2) await say('deung', '졌소. 구경은 잘했소. 돌아가서 사제들한테 자랑해야겠소. 눈밖에 없는 데라 애들이 뭐든 듣고 싶어 하거든.');
  if (r === 0) ctx.goal('다음 경기까지 시내를 둘러보고 심판에게 말하기');
  if (r === 1) { await say('judge', '훌륭하오. 맹주께서 직접 뵙고 싶다 하시오. 동쪽 정천맹 객관으로 가시오.'); ctx.goal('동쪽 정천맹 객관에서 맹주 만나기'); }
  if (r === 2) { await say('judge', '오늘 경기는 여기까지요. 푹 쉬시오.'); ctx.goal('금봉 객잔에서 쉬기'); }
  if (r === 3) {
    await say('cheol', '졌소! 아이고, 시주 주먹이 맵구려. 이거나 받으시오.');
    learn('chain_kick'); learn('diamond_body');
    if (!S().hearts.includes('iron_shirt')) { S().hearts.push('iron_shirt'); toast('심법 철포삼을 익혔다'); }
    ctx.love('cheol'); set('c3e'); ctx.goal('결승 전에 소연하를 만나고, 심판에게 말하기');
  }
}
async function chiefMeet() {
  await ctx.chap(3, '강호 유람', '제4장 맹주의 차');
  await say('chief', '자네가 창운문을 구했다는 그 젊은이로군. 앉게. 차가 식겠네.');
  await say('chief', '군에서 버려진 낭인이었다고? 괜찮네. 강호는 출신을 너무 따져서 탈이야.');
  await say('chief', '나도 구파일방이나 오대세가 출신이 아닐세. 이 자리까지 오는 데 서른 해가 걸렸지.');
  await say('me', '맹주님, 십칠 년 전 월하문 일을 아십니까.');
  await say('chief', '알다마다. 내 평생의 허물일세. 마공을 익혔다는 소문을 믿고 토벌을 청했는데, 나중에 보니 거짓이었어.');
  await say('chief', '달거울을 상품으로 내건 것도 그 때문일세. 제 주인을 찾아가기를 바라서 말이야.');
  await say('me', '…….');
  await say('so', '어때, 맹주 만나 보니까?');
  await say('me', '좋은 분 같던데요. 차도 맛있었고요.', 'h');
  await say('so', '그게 더 수상한데.');
  F().chief_met = true; ctx.goal('광장의 심판에게 말하기');
}
async function ambush() {
  await say('me', '오늘은 좀 자자.');
  await narr('삼경쯤 창틀이 소리 없이 열렸다.');
  await ctx.duel({ foes: ['shadow2', 'shadow2', 'shadow2'], arena: 'room', title: '심야 암습', bgm: 'fight' });
  await say('cheol', '시주! 괜찮소? 옆방에서 자느라 늦었소.');
  await say('me', '왜 대회 중에 저를 노리는 거죠?');
  await say('yun', '결승까지 가는 걸 싫어하는 사람이 있나 봐요.');
  F().ambushed = true; ctx.goal('광장의 심판에게 다음 경기 신청하기');
}
async function lantern() {
  await say('yun', '오늘 밤에 등불 놀이가 있대요. 약재 사러 나왔다가 봤어요. 진짜로요.', 'h');
  const c = await choice('윤설이 등불을 보고 있다.', ['같이 보자고 한다', '내일 경기를 준비하러 간다']);
  if (c === 0) { await say('me', '같이 보실래요? 등불은 제가 살게요.', 'h'); await say('yun', '웬일이에요? {나} 씨가 돈을 다 쓰고.', 'h'); await say('yun', '오늘은 좋네요. 고마워요.', 'h'); ctx.love('yun'); if (!S().hearts.includes('mercy')) { S().hearts.push('mercy'); toast('심법 인의심공을 익혔다'); } }
  else await say('yun', '네, 그러세요.', 'h');
  F().ev_lantern = true;
}
async function soEve() {
  await say('so', '내일이네. 안 봐준다고 했다.');
  await say('me', '알아요.');
  await say('so', '네가 이기면 달거울은 네 거고, 내가 이기면 같이 맹주 앞에 서자. 어느 쪽이든 그 사람 얼굴은 볼 거야.');
  const c = await choice('소연하가 칼을 닦는다.', ['사부님을 꼭 찾자고 한다', '살살 해 달라고 한다']);
  if (c === 0) { await say('so', '고맙다. 사실 돌아가셨을 거라는 건 알아. 그래도 고마워.', 's'); ctx.love('so'); if (!S().hearts.includes('swift')) { S().hearts.push('swift'); toast('심법 쾌검심결을 익혔다'); } }
  else await say('so', '싫은데.', 'h');
  F().ev_soeve = true;
}
async function cheolDrink() {
  await say('cheol', '시주, 내가 왜 소림에서 쫓겨났는지 궁금하지 않소?');
  await say('me', '고기 드셔서 아니에요?');
  await say('cheol', '아니오. 소림 아랫마을에 산적이 몰려왔는데 노스님들이 산문을 닫으라 하더이다. 밖에 마을 사람들이 있는데 말이오. 그래서 문을 부수고 나갔소. 고기는 그다음에 배웠고.');
  await say('me', '생각보다 멋있는 이유네요.');
  await say('cheol', '그렇지? 그러니 오늘 술은 시주가 사시오.');
  F().ev_cheol = true; ctx.love('cheol');
}
async function finalMatch() {
  const left = 15 - clansWon();
  const c = await choice(`결승 상대는 소연하. 끝나면 구화성을 떠나게 될 것 같다.${left ? ` (아직 비무하지 않은 세력 ${left}곳)` : ''}`, ['올라간다', '조금 더 준비한다'], 'judge'); if (c) return;
  await ctx.chap(3, '강호 유람', '제5장 천하비무');
  ctx.cg('final');
  await say('so', '말했지. 안 봐준다고.', 'h');
  await ctx.duel({ foes: ['so_final'], arena: 'ring', bgm: 'boss', title: '결승 · 소연하', yieldAt: .2 });
  await say('so', '아, 졌다. 분하네. 너 칼 많이 늘었다.', 'h');
  await say('judge', '천하비무대회 우승자, {호} {나}!');
  await narr('함성 속에서 맹주가 직접 달거울을 건네주었다. 그날 밤 정천맹 객관에서 장문인들이 모인 축하 연회가 열렸다.');
  await ctx.warp('hall2', 7, 8, 1);
  ctx.cg('banquet');
  await say('chief', '한잔 받게. 자네 아버지도 술은 약했지.');
  await say('me', '…예?', 'b');
  await say(null, '품속의 달거울이 뜨거워졌다. 꺼내 보니 뒷판이 벌어져 있고 찢어진 종이 두 장이 끼어 있었다. 거울에 비추자 종이에 숨은 글이 떠올랐다. “낙월을 움직인 자는 연경추다. 달 없는 밤에 그가 문주를 베었다.”');
  await say('chief', '거울을 봤군. 낱장을 모아 줘서 고맙네. 제자들은 십칠 년을 찾아도 못 찾던 걸 자네는 석 달 만에 찾더군.');
  await say('me', '곽 아주머니는 어디 있어.', 'a');
  await say('chief', '월하곡에 있네. 제칠식이 거기 있으니 자네도 오겠지. 하지만 자네가 살아서 갈 필요는 없어. 낱장만 가면 되니까.');
  await say('yun', '{나} 씨! 마시지 마요! 독이에요!', 'b');
  await say(null, '윤설이 뛰어들어 잔을 쳐 냈다. 연회장 문이 닫히고 복면을 쓴 자들이 내려왔다.');
  ctx.page('moon5'); ctx.page('moon6');
  ctx.cgOff();
  await ctx.duel({ foes: ['shadow2', 'shadow2', 'shadow2', 'shadow2'], allies: ['so_ally', 'cheol_ally'], arena: 'room', title: '정천맹 객관 탈출', bgm: 'fight' });
  await say('cheol', '시주들, 뒷문으로 오시오! 내가 부숴 놨소!');
  await say('so', '곽 호법이 월하곡에 있다면 거기로 가야지. 내 사부님 일도 거기서 끝낼 거야.');
  await say('boat', '아이고, 구화성까지 왔더니 네가 쫓기고 있네. 얼른 타!');
  await G.route.crossroads();
}
// ── 4장 ──
async function kitchenRuin() {
  F().tr_kitchen = true;
  await narr('본전 터 뒤로 돌아가니 무너진 부엌이 있었다. 아궁이 위에 큰 솥이 엎어져 있고, 벽에 못이 하나 남아 있었다. 국자를 걸던 못 같았다. 높이가 딱 곽 아주머니 어깨께였다.');
  await say('me', '여기서도 국을 끓이셨구나.', 's');
}
async function trace(k) {
  if (F()['tr' + k]) { await say(null, '이미 살펴보았다.'); return; }
  F()['tr' + k] = true;
  if (k === 1) { await say(null, '돌문이 쓰러져 있다. 빗장은 안에서 풀려 있었다. 주위에 구파일방과 오대세가의 찢어진 깃발이 흙에 묻혀 있다.'); await say('voice', '“사형, 문을 열어요. 맹주가 약속했습니다. 마공을 익힌 자만 벌하겠다고.”'); }
  if (k === 2) { await say(null, '돌계단에 아이 신발 한 짝이 놓여 있다.'); await say('voice', '“큰아이는 못 찾았습니다! 작은아이부터! 곽 호법, 뛰시오!”'); }
  if (k === 3) { await say(null, '본전 터 아래 마흔아홉 개의 칼자국이 있다. 그중 하나는 유난히 깊다.'); await say('voice', '“연 형, 어찌하여….”'); }
  ctx.note(k === 1 ? '문을 연 사람은 “사형”이라 불렸다.' : k === 2 ? '아이가 둘이었다. 큰아이는 찾지 못했다고 한다.' : '문주를 벤 것은 “연 형”.');
  if (F().tr1 && F().tr2 && F().tr3) { set('c4b'); ctx.goal('본전 터의 석상 앞으로 가기'); }
}
async function baekReunion() {
  await ctx.chap(6, '달이 진 골짜기', '제2장 고백');
  await say('baek', '왔느냐.');
  await say('me', '어르신.');
  await say('baek', '허리가 많이 펴졌구나.');
  await say('me', '낙월이 어르신이죠? 문을 연 것도요.');
  await say('baek', '그래, 내가 열었다. 연경추가 마공 익힌 자만 벌하겠다고 했다. 사문에서 밀려난 게 분해서 그 말을 믿고 싶었지.');
  await say('baek', '그날 밤 너를 곽란에게 넘겼고, 큰아이는 끝내 찾지 못했다. 그 뒤로 그믐마다 은자를 보내며 술만 마셨다.');
  await say('baek', '내가 줄 수 있는 건 이것뿐이다.');
  ctx.page('moon7');
  const has = S().weapons.includes('moon_sword'); if (!has) { S().weapons.push('moon_sword'); toast('월영검을 받았다'); }
  await say('baek', '네 아버지의 칼 월영검이다. 제칠식 낙월도 함께 가져가라.');
  const c = await choice('백 노인이 고개를 숙인다.', ['용서한다고 한다', '살아서 갚으라고 한다', '아무 말도 하지 않는다']);
  if (c === 0) await say('baek', '그 말은 곽란한테 듣고 싶구나.');
  if (c === 1) { await say('baek', '허허, 그래. 그러마.'); F().baek_live = true; }
  if (c === 2) await say('baek', '그래. 그게 맞다.');
  await say('fox', '이제야 만나는군요, 사부님.');
  await say('baek', '…비켜라, 아이야.');
  await narr('여우 가면의 칼이 백 노인의 어깨를 꿰뚫었다. 그때 골짜기가 울리더니 붉은 눈이 떠올랐다.');
  await say('fox', '먼저 저놈부터 상대해 봐라. 맹주가 월하문 시신으로 빚은 것이다. 이기면 위에서 기다리지.');
  await ctx.duel({ foes: ['demon_eye'], arena: 'moon', bgm: 'boss', title: '혈안귀' });
  set('c4c'); ctx.goal('북쪽 석상 앞에서 여우 가면과 맞서기');
}
async function foxBoss() {
  await ctx.chap(6, '달이 진 골짜기', '제3장 여우 가면');
  await say('fox', '제법 컸구나.');
  await say('me', '곽 아주머니를 내놔라.', 'a');
  await say('fox', '저 안에 있다. 살아 있다. 나도 그 노인네는 못 죽이겠더군.');
  await say('me', '왜 월하칠식을 쓰는 거냐.', 'a');
  await say('fox', '궁금하면 이겨 봐라.');
  await ctx.duel({ foes: ['fox'], arena: 'moon', bgm: 'boss', title: '여우 가면' });
  ctx.cg('mask');
  await narr('가면이 갈라져 떨어졌다. 나와 어딘가 닮은 얼굴이었다.');
  ctx.cgOff();
  await say('cheon', '너도 개처럼 컸다더구나. 나는 여덟 살에 연경추 손에 끌려가 사람 죽이는 법을 배웠다.');
  await say('me', '그럼 당신이 그 큰아이…', 'b');
  await say('cheon', '형이라고 부르지 마라. 그 말을 들으면 칼을 못 든다.');
  await say('cheon', '하나만 알아 둬라. 북쪽 변경 마을을 태운 건 전쟁이 아니다. 너를 찾던 무면회다. 견대도 연경추가 고아를 모으려고 만든 곳이고.');
  await say('me', '제 마지막 임무도요?', 's');
  await say('cheon', '그래. 네가 살아 돌아온 것만 그자의 계산에 없었다.');
  await say('gwak', '천아! 이 못난 놈아, 밥은 먹고 다니냐!', 's');
  await say('cheon', '…아주머니.');
  await say('chief', '다들 모였군. 쓸모가 다한 놈도 같이.');
  ctx.cg('chief_stab');
  await narr('연경추의 검이 월천의 등을 뚫었다. 월천은 쓰러지면서도 맹주의 손목을 놓지 않았다.');
  await say('cheon', '가라… 달이 뜨면… 베어라…');
  ctx.cgOff();
  await ctx.chap(6, '달이 진 골짜기', '제4장 낙월의 밤');
  set('c4d');
  await G.route.chiefBattle();
  await ending();
}
async function ending() {
  await ctx.chap(6, '달이 진 골짜기', '제5장 달이 진 뒤');
  await narr('싸움이 끝난 자리에 곽 아주머니가 월천을 무릎에 눕히고 앉아 있었다. 소매로 얼굴의 피를 닦아 주고 있었다. 석 달 사이에 머리가 허옇게 세어 있었다.');
  await say('gwak', '왔냐.');
  await say('me', '네.');
  await say('gwak', '얼굴이 그게 뭐야. 밥은 먹고 다녔어?', 'a');
  await narr('뭐라고 대답하려는데 목이 막혔다. 곽 아주머니가 주먹으로 내 머리를 한 번 쥐어박았다.');
  if (F().tr_kitchen) { await say('me', '부엌 터 봤어요.'); await say('gwak', '거길 봤어? 그 솥으로 삼백 명 밥을 했다. 네 아버지가 국이 싱겁다고 하도 타박해서 국자로 한 대 때린 적도 있어.', 'h'); }
  await say('gwak', '이 애 좀 같이 들어라. 혼자는 못 들겠다.');
  await narr('월천은 생각보다 가벼웠다.');
  if (S().side && S().side !== 'jeong') return G.route.routeEnding();
  await narr('달이 떴다. 강호는 맹주가 쓰러졌다는 소식으로 석 달을 시끄러웠다. 월천의 무덤은 월하곡 본전 터에 만들어 주었다.');
  await narr('정천맹은 해체되었다. 구파일방과 오대세가의 장문인들이 차례로 월하곡에 올라와 향을 피웠다.');
  if (F().baek_live) {
    await say('gwak', '그래서, 백 영감 방값은 받았어?', 'h');
    await say('me', '아주머니, 첫마디가 그거예요?', 'a');
    await say('gwak', '살아 돌아왔으면 됐지, 뭐. 그래서 그 종이들은 어쩔 거야?', 'h');
  } else {
    await G.route.baekFate();
    await say('gwak', '백 영감 방값은 끝내 못 받았네.', 's');
    await say('me', '아주머니, 첫마디가 그거예요?', 'a');
    await say('gwak', '장부에서 지워 줘야지, 뭐. 그래서 그 종이들은 어쩔 거야?', 'h');
  }
  const c = await choice('찢어진 일곱 장을 앞에 두고', ['태운다', '문파를 다시 세운다', '객잔부터 다시 짓는다']);
  if (c === 0) { await narr('일곱 장을 태웠다. 재는 강으로 날아갔고, 초식은 내 몸에만 남았다.'); }
  if (c === 1) { await narr('월하곡에 다시 돌문을 세웠다. 첫 제자는 쟁반 던지던 그 꼬마였다.'); }
  F().ending = ['jeong_burn', 'jeong_clan', 'jeong_inn'][c];
  if (c === 2) { F().inn_rebuilt = true; await narr('달맞이 객잔이 다시 문을 열었다. 윤설이 장부를 들고 찾아오고, 소연하가 국수를 먹고 가고, 철우는 오늘도 돈이 없다.'); }
  if (F().baek_live) await G.route.baekFate();
  await narr('그해 가을이 저물도록 강호는 조용했다. 강호에서는 나를 이렇게 불렀다. {호} {나}.');
  await G.act3.begin();
}

Story.providers.push(function content2(id) {
  const n = [], sp = [], tr = [], ro = [];
  if (id === 'pass' && at('c2a')) { /* 창운산 가는 길 */ }
  if (id === 'cloudmt') {
    if (at('c2a')) tr.push({ x: 18, y: 28, w: 10, h: 6, when: () => at('c2a'), run: arrive });
    n.push({ id: 'go', spr: 'Inspector', x: 22.5, y: 19, dir: 0, mark: () => at('c2b') || (at('c2f') && !!F().jang_clue && !F().go_told), when: () => !after('c3a'), talk: async () => { if (at('c2b')) await exam(); else if (at('c2f') && F().jang_clue && !F().go_told) await after2.told(); else await say('go', '수련을 게을리하지 마라, 사제.'); } });
    n.push({ id: 'disc', spr: 'GreenNinja', x: 12.6, y: 21.6, dir: 3, talk: async () => { const c = await choice('연무장에서 대련할까?', ['대련한다', '그만둔다'], 'disc'); if (c === 0) await ctx.duel({ foes: ['disciple', 'disciple'], arena: 'court', title: '대련', optional: true, bgm: 'fight' }); } });
    n.push({ id: 'smith2', spr: 'Caveman2', x: 32, y: 23, dir: 2, talk: async () => { await say('smith', '창운문 병기창이오. 값은 치르시오.'); await ctx.shop('창운문 병기창', [ctx.item.weapon('blue_sword'), ctx.item.weapon('ghost_blade'), ctx.item.weapon('dragon_spear'), ctx.item.weapon('iron_gauntlet'), ctx.item.weapon('pine_sword'), ctx.item.weapon('moon_glaive'), ctx.item.weapon('plum_spear'), ctx.item.weapon('diamond_fist'), ctx.item.potion()]); } });
    sp.push({ x: 39, y: 7, w: 3, h: 3, hint: '살펴보기', act: moss });
    if (after('c2d') || at('c2d')) ro.push({ spr: 'chars/GrayNinja', x: 36, y: 12, foes: ['shadow'] });
    sp.push({ x: 21, y: 34, w: 4, h: 2, hint: '뱃길 안내', when: () => at('c3a') || !!F().boat_guhwa, act: async () => { if (at('c3a')) await toGuhwa(); else { const c = await choice('구화성으로 갈까?', ['간다', '그만둔다']); if (!c) await ctx.warp('guhwa', 24.5, 29, 1); } } });
  }
  if (id === 'hall_in') {
    n.push({ id: 'yun', spr: 'Princess', x: 8, y: 9, dir: 1, mark: () => at('c2c', 'c2e'), when: () => at('c2c', 'c2d', 'c2e', 'c2f'), talk: async () => { if (at('c2c')) await lordSick(); else if (at('c2e')) await cure(); else await say('yun', '곁에 있을게요.', 'h'); } });
    n.push({ id: 'wi', spr: 'Noble', x: 10.5, y: 9, dir: 1, when: () => at('c2g'), mark: () => true, hint: '맞서기', talk: wiBoss });
    n.push({ id: 'lord', spr: 'Monk', x: 9, y: 5.4, dir: 0, when: () => after('c2f'), talk: async () => { await say('lord', '몸은 많이 나았소. 고맙소.'); } });
  }
  if (id === 'library' && at('c2f')) sp.push({ x: 6, y: 2, w: 3, h: 3, hint: '기록 찾기', act: library });
  if (id === 'guhwa') {
    n.push({ id: 'judge', spr: 'Inspector', x: 24.5, y: 15, dir: 0, mark: () => after('c3b') && !after('c4a'), when: () => !after('c4a'), talk: judge });
    n.push({ id: 'yun', spr: 'Princess', x: 13, y: 15, dir: 3, mark: () => (F().round || 0) >= 1 && !F().ev_lantern, when: () => !after('c4a') && S().married !== 'yun', talk: async () => { if ((F().round || 0) >= 1 && !F().ev_lantern) await lantern(); else await say('yun', '금창약은 넉넉해요?'); } });
    n.push({ id: 'so', spr: 'RedSamurai', x: 34, y: 15, dir: 2, mark: () => at('c3e') && !F().ev_soeve, when: () => (!after('c4a') || at('end')) && S().married !== 'so', talk: async () => { if (at('c3e') && !F().ev_soeve) await soEve(); else await say('so', '칼은 닦았어?'); } });
    n.push({ id: 'cheol', spr: 'Monk2', x: 20, y: 22, dir: 3, mark: () => !!F().monk_met && !F().ev_cheol, when: () => !!F().monk_met && !F().cheol_dead && (!after('c4a') || at('end')), talk: async () => { if (!F().ev_cheol) await cheolDrink(); else await say('cheol', '나무아미… 저 만두 하나만 사 주시오.'); } });
    n.push({ id: 'boat', spr: 'OldMan2', x: 26.5, y: 29, dir: 2, talk: async () => { const c = await choice('청하진으로 갈까?', ['간다', '그만둔다'], 'boat'); if (!c) await ctx.warp('cheongha', 22.5, 26, 1); } });
  }
  if (id === 'inn2') {
    n.push({ id: 'host', spr: 'Villager', x: 4, y: 4.6, dir: 0, mark: () => after('c3b') && !F().monk_met, talk: async () => { if (!F().monk_met) await monkMeet(); else await say('host', '어서 오십시오. 스님 빚을 대신 갚아 주신 분이시군요.'); } });
    tr.push({ x: 2, y: 6, w: 14, h: 6, when: () => (F().round || 0) === 3 && !F().ambushed, run: ambush });
  }
  if (id === 'shop2') n.push({ id: 'shopk', spr: 'Noble', x: 5, y: 3.6, dir: 0, talk: async () => { const c = await choice('무엇을 할까?', ['물건 사기', '가구 사기', '선물 사기', '물건 팔기', '그만둔다'], 'shopk'); if (c === 1) await ctx.shop('구화 상회 · 가구', ['bookcase', 'shelf', 'rack', 'scroll', 'chair', 'dummy', 'plum_tree', 'sword_rack'].map(ctx.item.furn)); if (c === 2) await ctx.shop('구화 상회 · 선물', [['tea', 44], ['plum_wine', 70], ['hairpin', 130], ['sachet', 60], ['poem', 90], ['jade', 200]].map(a => ctx.item.stuff(...a))); if (c === 3) await G.life.openSell(); if (c) return; await ctx.shop('구화 상회', [ctx.item.potion(), ctx.item.weapon('blue_sword'), ctx.item.weapon('dragon_spear'), ctx.item.weapon('ghost_blade'), ctx.item.weapon('iron_gauntlet'), ctx.item.book('one_point', 200), ctx.item.book('dragon_pass', 260), ctx.item.book('sweep_army', 260), ctx.item.book('mad_wind', 260), ctx.item.book('hundred_flower', 340), ctx.item.book('sky_pierce', 700), ctx.item.heart('fury', 300)]); } });
  if (id === 'hall2' && !after('c3e')) n.push({ id: 'chief', spr: 'Master', x: 7, y: 4.6, dir: 0, mark: () => (F().round || 0) === 2 && !F().chief_met, talk: async () => { if ((F().round || 0) >= 2 && !F().chief_met) await chiefMeet(); else await say('chief', '차가 식겠네.'); } });
  if (id === 'wolha') {
    if (!F().tr_kitchen) sp.push({ x: 28, y: 22, w: 3, h: 3, hint: '무너진 부엌', act: kitchenRuin });
    sp.push({ x: 20, y: 28, w: 4, h: 2, hint: '쓰러진 돌문', act: () => trace(1) }, { x: 7, y: 22, w: 3, h: 3, hint: '돌계단', act: () => trace(2) }, { x: 33, y: 22, w: 3, h: 3, hint: '칼자국', act: () => trace(3) });
    n.push({ id: 'baek', spr: 'OldMan3', x: 22, y: 10, dir: 0, mark: () => at('c4b'), when: () => at('c4b'), talk: baekReunion });
    n.push({ id: 'fox', spr: 'MaskedNinja', x: 22, y: 6.5, dir: 0, mark: () => at('c4c'), when: () => at('c4c'), hint: '맞서기', talk: foxBoss });
    ro.push({ spr: 'mon/Spirit', x: 14, y: 30.5, foes: ['ghost', 'ghost'] }, { spr: 'chars/Skeleton', x: 30, y: 30.5, foes: ['skull', 'ghost'] }, { spr: 'mon/Spirit', x: 8.5, y: 25, foes: ['ghost', 'skull'] }, { spr: 'chars/Skeleton', x: 21, y: 20.5, foes: ['skull', 'skull'] }, { spr: 'mon/Spirit', x: 22, y: 14, foes: ['ghost', 'ghost', 'skull'] });
  }
  return { npcs: n, spots: sp, trigs: tr, roam: ro };
});
