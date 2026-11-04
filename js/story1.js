// 프롤로그와 1장: 청하진
import { G, Sound, fadeTo, wait, toast } from './core.js';
import { Story, ctx, say, narr, choice } from './ctx.js';
import { learn } from './state.js';
import { WEAPONS } from './data.js';

const S = () => G.S, F = () => G.S.flags, step = () => G.S.flags.step || 'p0', set = v => { G.S.flags.step = v; };
const at = (...a) => a.includes(step());
const after = v => ORDER.indexOf(step()) >= ORDER.indexOf(v);
const ORDER = ['p0', 'p1', 'p2', 'c1a', 'c1b', 'c1c', 'c1d', 's1', 's2', 's3', 's4', 'c1e', 'c1f', 'c1g', 'c1h', 'c2a', 'c2b', 'c2c', 'c2d', 'c2e', 'c2f', 'c2g', 'c2h', 'c3a', 'c3b', 'c3c', 'c3d', 'c3e', 'c3f', 'c3g', 'c4a', 'c4b', 'c4c', 'c4d', 'c4e', 'end'];
export { step, set, at, after };

Story.scenes.opening = async () => {
  await narr('강을 따라 물건과 소문이 오가는 나루, 청하진.\n이 마을 달맞이 객잔에는\n열일곱 해 전 문 앞에 버려졌던 아이가 점소이로 산다.');
  await say('gwak', '{나}! 거기서 뭐 하냐! 해가 중천이다!');
  await say('me', '방금 바닥 다 닦았어요.');
  await say('gwak', '닦은 바닥이 왜 저렇게 번들거려? 손님들 미끄러져 죽겠다.');
  await say('gwak', '그리고 저기 구석 자리 백 영감. 오늘은 꼭 받아 와라. 방값이 석 달 치다.');
  await say('me', '그 어르신은 말만 붙이면 걸레질 타박이던데요.');
  await say('gwak', '타박을 듣든 술주정을 듣든 은자만 받아 오면 된다.');
  set('p1'); ctx.goal('구석 자리의 백 노인에게 방값 받기');
};
async function baekFirst() {
  await say('baek', '또 왔냐, 점소이.');
  await say('me', '어르신, 방값이요. 석 달 치.');
  await say('baek', '방값보다 네 허리가 급하다. 걸레질을 왜 그리 하느냐.');
  await say('baek', '허리는 세우고, 왼발로 밀고, 오른발은 따라오게만 두라고 어제도 말했을 텐데.');
  await say('me', '그렇게 하면 바닥이 안 닦여요.');
  await say('baek', '바닥이 안 닦여도 걸음은 닦인다. 말대꾸할 힘이 남았으면 장작이나 패 오너라.');
  await say('baek', '세 더미. 그럼 방값 얘기를 들어는 주마.');
  await say('me', '왜 제가 돈 받으러 와서 일을 더 하고 있지…');
  await ctx.duel({ foes: ['log', 'log', 'log'], arena: 'yard', title: '장작 패기', bgm: 'peaceful', tip: '<b>W A S D</b> 이동, <b>J</b> 평타. J를 이어서 누르면 연달아 벱니다.' });
  await say('gwak', '장작은 잘 패네. 방값은?');
  await say('me', '…내일 주신대요.');
  await narr('저녁이 되자 객잔이 뱃사람들로 찼다.');
  await say('rowdy', '야, 점소이! 술이 왜 이렇게 싱거워!');
  await say('me', '손님, 그건 물입니다. 술은 아직 안 시키셨어요.');
  await say('rowdy', '이 자식이 사람을 놀려? 오늘 술값은 없는 줄 알아라!');
  await say('gwak', '{나}. 저 손님들 밖으로 모셔라.');
  await say('me', '제가요?');
  await say('gwak', '장작 패는 놈이 왈패 둘을 못 패겠느냐. 쟁반은 들고 가고.');
  learn('tray');
  await ctx.duel({ foes: ['rowdy', 'rowdy'], arena: 'yard', title: '왈패 소동', tip: '<b>U</b> 쟁반 던지기. <b>L</b> 막기: 노란 예고가 뜨면 누르세요. 맞기 직전에 누르면 <b>튕겨내기</b>가 됩니다.' });
  await narr('그날 밤, 객잔 처마 아래.');
  F().night = true; G.field.load('cheongha', 22.5, 13, 1);
  await say('baek', '쟁반으로 왈패를 잡는 놈은 처음 본다.');
  await say('me', '보셨어요? 그럼 방값도…');
  await say('baek', '막는 건 제법이더구나. 걸레질이 어디 가겠느냐.');
  await say('me', '네?');
  await say('baek', '저 달 봐라. 저렇게 가늘어도 달은 달이지. 초승이라는 건 말이다, 뜨기 시작했다는 뜻이다.');
  await say('me', '어르신, 취하셨어요.');
  await say('baek', '허허. 그래, 취했다. 내일은 꼭 주마.');
  await narr('다음 날 아침, 구석방은 비어 있었다.\n방값 대신 낡은 목검 한 자루와 찢어진 종이 한 장이 탁자에 놓여 있었다.');
  F().night = false; G.field.load('inn', 13, 8, 1);
  await say('me', '이 영감님이 끝내 튀었네. 목검이랑… 이건 뭐지. 책장이 찢어진 건가.');
  await say('gwak', '방값은 받았냐? …그 종이, 어디서 났냐.');
  await say('me', '백 영감님이 두고 갔어요. 글자가 있긴 한데 읽을 수가 없어요.');
  await say('gwak', '…….');
  await say('gwak', '오늘은 일찍 문 닫자. 그 종이는 품에 넣고, 아무한테도 보이지 마라.');
  await say('me', '아주머니가 은자 얘기를 안 하시네. 어디 아프세요?');
  await say('gwak', '문이나 닫아!');
  await narr('그날 밤. 삐걱, 하고 지붕 위에서 소리가 났다.');
  F().night = true; G.field.load('cheongha', 22.5, 13.4, 0);
  Sound.bgm('dark');
  await say('shadow', '점소이. 노인이 두고 간 것을 내놓아라.');
  await say('me', '방값이요? 저희도 못 받았는데요.');
  await ctx.duel({ foes: ['shadow0', 'shadow0'], arena: 'yard', bgm: 'fight', title: '흑의인', tip: '<b>K</b> 경공: 잠깐 빠르게 움직이고 그동안 맞지 않습니다. 날아오는 비도나 <b>붉은 예고</b>는 피하세요.' });
  await say('me', '하아, 하아… 뭐야, 이 사람들.');
  await say('shadow', '제법이군. 하지만…');
  await say('gwak', '어딜 남의 집 마당에서 칼질이냐.');
  await narr('곽 아주머니의 국자가 흑의인의 목덜미를 쳤다.\n사람이 소리도 없이 쓰러졌다.');
  await say('me', '아주머니…? 지금 뭘 하신 거예요?');
  await say('gwak', '입 다물어. 강 쪽으로 뛰어라. 뒤돌아보지 말고.');
  await say('fox', '오랜만입니다, 곽 호법. 십칠 년을 숨어 살았으니 이제 쉬셔도 되지요.');
  await say('gwak', '{나}! 뛰어!');
  await say('me', '혼자 어떻게 가요!');
  await ctx.duel({ foes: ['fox0'], arena: 'yard', bgm: 'boss', title: '여우 가면', survive: 16, tip: '이길 수 없는 상대입니다. 16초를 버티세요.' });
  await say('fox', '이 아이인가. …달이 아직 어리군.');
  await narr('곽 아주머니가 쓰러지는 것이 보였다.\n마지막으로 기억나는 건 등을 때린 충격, 그리고 차가운 강물이었다.');
  await fadeTo(1); F().night = false; F().burned = true; set('c1a');
  G.field.load('clinic', 9.2, 7.6, 3); await fadeTo(0);
  await say('yun', '눈 떴네요. 강물을 한 말은 마셨어요.');
  await say('me', '여기가…');
  await say('yun', '윤씨 약방이요. 갈대밭에 걸려 있길래 끌고 왔어요. 무거웠어요.');
  await say('me', '아주머니는요? 곽 아주머니는!');
  await say('yun', '객잔은 반쯤 탔고, 아주머니는 없었어요. 사람들은 검은 옷 입은 자들이 데려갔다고 해요.');
  await say('me', '…제가 찾으러 가야 해요.');
  await say('yun', '그 몸으로요? 일단 품에 있던 종이부터 보세요. 젖지도 않았어요. 이상한 종이예요.');
  F().met_yun = true;
  await narr('제1부 · 객잔의 점소이\n\n타다 남은 객잔');
  ctx.goal('불탄 객잔을 살펴보고, 나루터의 뱃사공에게 묻기');
  ctx.note('곽 아주머니는 검은 옷의 무리에게 끌려갔다. 여우 가면이 아주머니를 “곽 호법”이라고 불렀다.');
  ctx.note('마을에서 할 수 있는 일: 복덕방에서 집 사기, 뱃사공에게 낚싯대 얻기, 서쪽 청풍골에서 사냥과 벌목, 대장간과 약방에서 제작, 떠돌이 비무객과 겨루기.');
}

async function c1Inn() {
  await say('me', '곽 아주머니 방이다. 장부랑… 이건 아주머니 글씨가 아닌데.');
  await say(null, '서랍 깊은 곳에서 작은 쪽지가 나왔다. “그믐마다 은자 다섯 냥. 아이가 스물이 되기 전엔 절대 알리지 말 것. 낙월.”');
  await say('me', '그믐마다 오던 그 봉투…? 나한테 뭘 알리지 말라는 거야.');
  await say(null, '뒷문 쪽 우물에 쇠 뚜껑이 덮여 있다. 달 모양의 구멍이 나 있어 열리지 않는다.');
  ctx.note('아주머니 서랍의 쪽지: “그믐마다 은자 다섯 냥. 아이가 스물이 되기 전엔 절대 알리지 말 것. 낙월.”');
  ctx.note('객잔 우물 뚜껑에 달 모양 구멍이 있다. 맞는 것을 찾아야 한다.');
  F().c1inn = true; await checkClues();
}
async function checkClues() {
  if (F().c1inn && F().c1boat) {
    set('c1b'); ctx.goal('약방의 윤설에게 찢어진 종이를 보이기');
  }
}
async function yunPaper() {
  await say('yun', '종이 다 봤어요? 글자는 옛날 서체예요. 약방 고서에서 본 적 있어요.');
  await say('yun', '“월하칠식 제일식, 초승. 허리를 세우고 왼발로 밀고, 오른발은 따라오게 둔다.”');
  await say('me', '…그거 걸레질이잖아요.');
  await say('yun', '걸레질요?');
  await say('me', '백 영감이 맨날 시키던 거요! 그 영감이 삼 년 동안 나한테 무공을 가르친 거였어요?');
  await say('yun', '밑에 더 있어요. “대숲 석상 앞에서 세 번 걷고 네 번째에 베어라.” 뒷산 대숲길에 석상이 있죠.');
  await say('yun', '요즘 거기 멧돼지가 사납대요. 목검 하나로 가겠다면 금창약은 가져가요. 값은 나중에 받을게요.');
  S().potion += 2; toast('금창약 2개를 받았다');
  F().bamboo_open = true; set('c1c'); ctx.goal('북쪽 대숲길의 석상을 찾기 (마을 북쪽 출구)');
}
async function stoneStatue() {
  if (step() !== 'c1c') { await say(null, '이끼 낀 석상이 서 있다.'); return; }
  await say('me', '이게 그 석상인가 보네. 세 번 걷고, 네 번째에…');
  await say('racoon', '꾸르르륵.');
  await say('me', '…너구리가 왜 이렇게 커.');
  await say('me', '잠깐, 입에 뭘 물고 있어. 그거 내 금창약 주머니잖아!');
  const won = await ctx.duel({ foes: ['raccoon_king'], arena: 'forest', bgm: 'boss', title: '대왕 너구리', tip: '<b>붉은 예고</b>는 막을 수 없습니다. <b>K 경공</b>으로 빠져나가세요. 아래 노란 줄을 깎으면 자세가 무너집니다.' });
  await say('me', '이겼다… 약은 다 먹었네. 이 도둑놈이.');
  await narr('숨을 고르고 석상 앞에 섰다.\n허리를 세우고, 왼발로 밀고, 오른발은 따라오게 둔다.\n셋, 그리고 넷.');
  await say(null, '걸음이 끊겼다고 느낀 순간, 석상의 등 뒤에 서 있었다.');
  await say('me', '…지금 뭐가 된 거지.');
  ctx.page('moon1');
  await say(null, '찢어진 종이의 글자가 또렷해졌다. 메뉴의 초식 배치에서 확인할 수 있다.');
  S().silver += 30;
  set('c1d'); ctx.goal('청하진으로 돌아가 윤설에게 알리기');
  F().cloud_hint = true;
}
async function yunAfter() {
  await say('me', '됐어요. 걸음이 건너뛰어졌어요. 눈 깜짝할 새에요.');
  await say('yun', '그 말이 약방에서 할 말은 아니에요. 어디 다쳤어요?');
  await say('me', '너구리한테 물렸어요.');
  await say('yun', '…팔 내밀어요.');
  await say('yun', '뱃사공 노씨가 찾던데요. 흑의인들이 탄 배를 봤대요.');
  await say('doc', '{나}야. 운기조식 정도는 알아 두어라. 강호에 나가면 네 몸은 네가 돌봐야 한다.');
  learn('breath');
  set('s1'); ctx.goal('나루터의 뱃사공 노씨 만나기');
  const c = await choice('윤설이 약을 싸 주며 시선을 피한다.', ['고맙다고 말한다', '값은 나중에 갚겠다고 말한다']);
  if (c === 0) { await say('me', '고마워요. 강에서 건져 준 것도.'); await say('yun', '…무거웠다니까요.'); ctx.love('yun'); }
  else { await say('me', '약값은 꼭 갚을게요.'); await say('yun', '네, 장부에 적어 뒀어요.'); }
}
async function roadBlock() {
  await say('bandit', '멈춰라! 이 길은 녹림 칠십이채, 흑풍채 맹호 나리의 길이다!');
  await say('me', '흑의인들이 이쪽으로 갔다던데요.');
  await say('bandit', '그건 몰라도 통행세는 안다!');
  await ctx.duel({ foes: ['bandit', 'bandit', 'archer'], arena: 'fort', title: '흑풍채 산적', tip: '활을 쏘는 적부터 잡으세요. <b>I</b>에 초승을 두었다면 등 뒤로 건너갈 수 있습니다.' });
  await say('me', '이 앞이 산채구나.');
  F().fort_open = true; set('c1f'); ctx.goal('흑풍채로 들어가 흑의인의 행방 찾기');
}
async function bruiser() {
  await say('bandit', '채주님께는 못 간다! 형님, 나와 주십쇼!');
  await ctx.duel({ foes: ['bruiser', 'bandit'], arena: 'fort', title: '행동대장' });
  F().bruiser = true;
  await say('me', '이 궤짝은 뭐지. 책이 들어 있네.');
  learn('break_mount'); learn('blood_fan');
  await say(null, '《파산도법》 낡은 필사본. 도를 들면 쓸 수 있다.');
  await say('me', '도는 없는데… 일단 챙기자.');
}
async function lionFight() {
  if (!F().bruiser) { await say('bandit', '어딜 들어와!'); return; }
  await say('lion', '네가 내 애들을 쓰러뜨린 놈이냐. 생각보다 어린데.');
  await say('me', '흑의인들 어디로 갔어요. 곽 아주머니를 데려갔어요.');
  await say('lion', '하하! 물건 값을 받았으니 길을 내줬을 뿐이다. 알고 싶으면 나를 이겨 봐라.');
  await ctx.duel({ foes: ['lion'], arena: 'fort', bgm: 'boss', title: '광사자 맹호' });
  await say('lion', '크윽… 강호가 좁긴 좁군. 점소이한테 지다니.');
  await say('me', '말해요. 누가 시켰어요.');
  await say('lion', '나도 얼굴은 못 봤다. 다들 얼굴을 가린 놈들이니까. 무면회라고 하더군. 녹림 칠십이채의 총채주도 그놈들 일이라면 말을 아낀다.');
  await say('lion', '값을 낸 건 그놈들이지만, 서찰엔 창운검문 인장이 찍혀 있었다. 놀랍지? 정파 나리들이 말이야.');
  await say('lion', '이것도 가져가라. 놈들이 흘리고 간 쇳조각이다. 달 모양이라 뭔가 했지.');
  await say(null, '달 모양 쇠붙이를 얻었다. 객잔 우물 뚜껑의 구멍과 크기가 비슷하다.');
  ctx.silver(120);
  ctx.note('광사자 맹호: 흑의인은 무면회. 서찰에 창운검문 인장이 찍혀 있었다.');
  set('c1g'); ctx.goal('객잔 우물 뚜껑을 달 모양 쇠붙이로 열어 보기');
}
async function wellOpen() {
  await say(null, '쇠붙이를 끼워 돌리자 뚜껑이 소리 없이 열렸다. 우물 벽에 사다리가 있다.');
  await ctx.warp('well', 6, 7, 1);
  await say('me', '…위패?');
  await narr('작은 방에 위패가 빼곡했다. 모두 마흔아홉.\n맨 앞 위패에는 이렇게 적혀 있었다.\n“월하문 문주 월청운 내외의 신위”');
  await say('me', '아주머니는 여기서 매일 향을 피운 건가. 이 궤짝은…');
  await say(null, '궤짝 안에 찢어진 종이 한 장과 편지가 들어 있었다.');
  await say('gwak', '이걸 읽고 있다면 나는 곁에 없겠구나. 너는 내가 주운 아이가 아니다. 월하문의 마지막 아이다.');
  await say('gwak', '십칠 년 전 달 없는 밤에 문파가 불탔다. 나는 호법이었고, 너를 안고 도망쳤다.');
  await say('gwak', '그날 골짜기를 둘러싼 깃발은 구파일방과 오대세가의 것이었다. 정천맹이라는 이름 아래 모두 왔지.');
  await say('gwak', '누가 시작했는지는 모른다. 다만 문을 안에서 열어 준 자가 있었다.');
  await say('gwak', '복수는 생각도 마라. 그래도 나간다면 밥은 챙겨 먹고. 방값은 꼭 받아라.');
  await say('me', '…이런 때도 방값이에요.');
  ctx.page('moon2');
  ctx.note('나는 월하문의 마지막 아이. 곽 아주머니는 월하문 호법 곽란. 구파일방과 오대세가가 월하곡을 둘러쌌고, 문을 안에서 열어 준 자가 있었다.');
  set('c1h'); F().well_open = true; F().cloud_open = true;
  ctx.goal('윤설에게 작별하고, 동쪽 산길 남쪽 길로 창운산에 가기');
}
async function yunGo() {
  await say('me', '창운산에 가려고요. 서찰 얘기도 있고, 아주머니 일도요.');
  await say('yun', '가요. 저도.');
  await say('me', '네?');
  await say('yun', '창운문 문주가 오래 앓는다는 소문이 있어요. 아버지가 진맥 부탁을 받았는데 제가 대신 갑니다. 혼자 보내면 장부의 약값을 못 받잖아요.');
  await say('doc', '데리고 가거라. 저 애 고집은 내가 못 꺾는다.');
  F().yun_join = true; set('c2a'); ctx.goal('동쪽 산길 남쪽 길을 따라 창운산으로 가기');
}

const talkTown = {
  boat: async () => {
    if (F().burned && !F().rod && step() !== 'c1a') { F().rod = true; await say('boat', '객잔도 탔는데 뭘 먹고 사냐. 이 낚싯대 가져가라. 나루 끝에서 던지면 뭐라도 문다.'); Sound.sfx('bonus'); await say(null, '낚싯대를 받았다. 물가에서 E 키로 낚시한다.'); return; }
    if (step() === 'c1a') { await say('boat', '네가 살아 있었구나! 그날 밤 흑의인 놈들이 배 세 척으로 강을 건너더니 동쪽 산으로 가더라.'); await say('boat', '동쪽이면 흑풍채 놈들 땅인데. 맨손으론 못 간다.'); F().c1boat = true; ctx.note('뱃사공: 흑의인들은 동쪽 산, 흑풍채 쪽으로 갔다.'); await checkClues(); return; }
    if (F().boat_guhwa) { const c = await choice('어디로 갈까?', ['구화성으로', '그만둔다'], 'boat'); if (c === 0) await ctx.warp('guhwa', 24.5, 29, 1); return; }
    await say('boat', '강물은 늘 그 자리인데 사람만 바뀌는구나.');
  },
  smith: async () => {
    if (step() === 'c1e' && !F().smith_gift) {
      F().smith_gift = true;
      await say('smith', '살아 있었구나. 곽 아주머니 밥을 십 년 얻어먹었다. 그 목검으로 산적을 치겠다고? 이거 가져가.');
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
      n.push({ id: 'gwak', spr: 'OldWoman', x: 4, y: 4.6, dir: 0, talk: async () => { if (s === 'p1') await say('gwak', '구석 자리다. 백 영감, 오늘은 놓치지 마라.'); else await say('gwak', '일해라, 일.'); } });
      n.push({ id: 'baek', spr: 'OldMan3', x: 14.5, y: 5.6, dir: 2, mark: () => at('p1'), talk: async () => { if (at('p1')) { set('p2'); await baekFirst(); } else await say('baek', '허리.'); } });
      n.push({ id: 'guest', spr: 'Villager', x: 11, y: 8.6, dir: 1, talk: async () => { await say('town', '여기 국수는 곽 아주머니 욕을 먹으면서 먹어야 맛이 나.'); } });
    } else {
      sp.push({ x: 1, y: 3, w: 3, h: 1, hint: '살펴보기', when: () => !F().c1inn, act: c1Inn });
      sp.push({ x: 13, y: 10, w: 2, h: 2, hint: F().well_open ? '우물 아래로' : '우물 뚜껑', act: async () => { if (F().well_open) await ctx.warp('well', 6, 7, 1); else if (at('c1g')) await wellOpen(); else await say(null, '쇠 뚜껑에 달 모양 구멍이 나 있다. 꿈쩍도 하지 않는다.'); } });
      sp.push({ x: 7, y: 5, w: 2, h: 2, hint: '구석방 탁자', when: () => after('c1a'), act: async () => { await say(null, '타다 남은 탁자에 술잔 자국이 남아 있다. 석 달 치 방값은 끝내 받지 못했다.'); } });
    }
  }
  if (id === 'clinic') {
    n.push({ id: 'yun', spr: 'Princess', x: 3.5, y: 4.8, dir: 0, mark: () => at('c1b', 'c1d', 'c1h'), when: () => (!F().yun_join || at('end')) && S().married !== 'yun', talk: async () => { if (at('c1b')) await yunPaper(); else if (at('c1d')) await yunAfter(); else if (at('c1h')) await yunGo(); else if (F().c1yun2 || !after('c1e')) await say('yun', '약이 필요하면 만물상보다 여기가 낫다는 말은 안 할게요. 제일 싼 건 맞아요.'); else { F().c1yun2 = true; await yunNight(); } } });
    n.push({ id: 'doc', spr: 'OldMan', x: 9.5, y: 3.6, dir: 0, talk: async () => { await say('doc', '몸이 재산이다. 금창약은 넉넉히 챙겨라.'); const c = await choice('무엇을 할까?', ['약 사기', '약 조제', '침상에서 쉬기 (5냥)', '그만둔다'], 'doc'); if (c === 0) await ctx.shop('윤씨 약방', [ctx.item.potion()]); if (c === 1) await G.life.openCraft('brew', '윤씨 약방 · 조제'); if (c === 2 && S().silver >= 5) { S().silver -= 5; await G.life.sleepNow(); } } });
  }
  if (id === 'smith') n.push({ id: 'smith', spr: 'Caveman2', x: 4, y: 4.6, dir: 0, mark: () => at('c1e') && !F().smith_gift, talk: talkTown.smith });
  if (id === 'shop') n.push({ id: 'shopk', spr: 'Noble', x: 5, y: 3.6, dir: 0, talk: talkTown.shopk });
  if (id === 'cheongha' && !at('p0', 'p1', 'p2')) {
    n.push({ id: 'boat', spr: 'OldMan2', x: 22.5, y: 27.8, dir: 3, mark: () => at('c1a') && !F().c1boat, talk: talkTown.boat });
    n.push({ id: 'kid', spr: 'Child', x: 16, y: 16.8, dir: 3, talk: async () => { await say('kid', '쟁반 또 던져 봐요! 그거 진짜 멋있었어요!'); } });
    n.push({ id: 'town', spr: 'Villager', x: 29, y: 16.6, dir: 2, talk: async () => { await say('town', after('c1h') ? '네가 흑풍채를 혼냈다며? 객잔 다시 지을 때 부르거라.' : '곽 아주머니가 그렇게 될 줄이야. 객잔 불은 우리가 껐다.'); } });
    n.push({ id: 'town2', spr: 'Villager4', x: 12, y: 16.8, dir: 3, talk: async () => { await say('town2', '그믐만 되면 낯선 사람이 객잔에 봉투를 두고 갔단다. 십 년도 넘었을걸.'); if (!F().note_env) { F().note_env = true; ctx.note('마을 아낙: 그믐마다 낯선 사람이 객잔에 봉투를 두고 갔다.'); } } });
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
    ro.push({ spr: 'chars/Villager2', x: 8, y: 9, foes: ['bandit', 'bandit'] }, { spr: 'chars/Samurai', x: 24, y: 12, foes: ['archer', 'archer', 'bandit'] }, { spr: 'chars/Villager2', x: 29, y: 19, foes: ['bandit', 'bandit', 'archer'] });
  }
  return { npcs: n, spots: sp, trigs: tr, roam: ro };
});
async function yunNight() {
  await say('yun', '요즘 밤마다 약방 앞에서 걸레질 걸음을 걷던데요.');
  await say('me', '보셨어요?');
  await say('yun', '창문이 그쪽이에요. 처음엔 몽유병인 줄 알았어요.');
  const c = await choice('윤설이 약초를 썰던 손을 멈춘다.', ['왜 도와주느냐고 묻는다', '약초 써는 법을 묻는다']);
  if (c === 0) { await say('yun', '제가 건졌잖아요. 건진 사람이 죽으면 아깝죠. 약값도 있고.'); await say('yun', '…그리고 곽 아주머니가 어릴 때 국수를 공짜로 줬어요. 그게 다예요.'); ctx.love('yun'); if (!S().hearts.includes('tonap')) { S().hearts.push('tonap'); await say('yun', '이거 아버지 책에서 베꼈어요. 호흡법이에요. 내력이 빨리 찰 거예요.'); toast('심법 기초토납법을 익혔다'); } }
  else await say('yun', '칼 쥐듯 쥐지 마세요. 어차피 칼도 그렇게 쥐면 안 될 것 같은데.');
}
