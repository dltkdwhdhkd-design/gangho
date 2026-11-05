// 제8부 서역의 달: 비단길을 지나 천산으로. 소연하의 사부, 돌아온 월천, 백 노인, 연경추의 끝
import { G, Sound, fadeTo, toast } from './core.js';
import { Story, ctx, say, narr, choice } from './ctx.js';
import { WHO } from './dialog.js';
import { FOES } from './foes.js';
import { WEAPONS } from './data.js';
import { set, at } from './story1.js';

const S = () => G.S, F = () => G.S.flags, side = () => G.S.side;
const PART = '서역의 달';
Object.assign(WHO, { trader: { name: '사주성 상인', face: 'Noble' }, flower: { name: '꽃 파는 노파', face: 'OldWoman' }, bingma: { name: '빙마', face: 'Eskimo' } });
const foe = (name, spr, hp, atk, def, spd, exp, silver, pause, moves, o = {}) => ({ name, spr, hp, atk, def, spd, exp, silver, pause, moves, ...o });
Object.assign(FOES, {
  scorpion: foe('사막 도마뱀', 'mon/Lizard', 900, 54, 12, 66, 210, 20, 1.05, ['bite', 'charge', 'venom'], { mon: 1 }),
  sand_cut: foe('모래 살수', 'chars/GrayNinja', 980, 56, 12, 82, 240, 40, 1, ['quick', 'blink', 'dart3', 'lunge'], { wpn: 'Ninjaku', guard: .4 }),
  sand_worm: foe('수맥의 거대 지렁이', 'mon/Snake2', 7000, 60, 14, 56, 1300, 500, .85, ['venom', 'charge', 'quake', 'spit', 'rain'], { mon: 1, boss: 1, poise: 440, scale: 2.8, r: 13 }),
  icefolk: foe('빙강시', 'chars/Eskimo', 1100, 58, 15, 50, 260, 20, 1.1, ['slash', 'heavy', 'lunge'], { wpn: 'Lance', poise: 90 }),
  bingma: foe('빙마', 'chars/Eskimo', 9500, 64, 15, 84, 1800, 600, .75, ['flurry', 'cloud_flash', 'blink', 'fan5', 'wind_turn', 'ring8'], { wpn: 'Katana', guard: 1, boss: 1, poise: 500, phases: [{ hp: .5, say: '그런 이름은 없다.', add: ['rain', 'tide'], pause: .6 }] }),
  cheon2: foe('월천', 'chars/MaskedNinja', 6500, 64, 15, 90, 900, 0, .75, ['moon1', 'moon3', 'blink', 'flurry', 'moon5'], { wpn: 'Katana', guard: .6, boss: 1, poise: 460, title: '돌아온 사람' }),
  ghost2: foe('망자', 'mon/Spirit2', 760, 52, 8, 60, 180, 10, 1.1, ['spit', 'bite', 'blink'], { mon: 1 }),
  gwima: foe('귀마', 'boss/GiantSpirit', 9000, 62, 13, 54, 1900, 700, .8, ['ring8', 'rain', 'spit', 'summon2', 'charge'], { boss: 1, poise: 520, minion: 'ghost2', big: { frames: 4, w: 48, h: 48, img: 'boss/GiantSpiritIdle' }, r: 13, phases: [{ hp: .5, say: '죽은 것이 산 것보다 말을 잘 듣는다.', add: ['fan5', 'quake'], pause: .62 }] }),
  gate_guard: foe('문지기 마장', 'chars/DarkNinja', 1300, 60, 15, 72, 300, 30, 1, ['flurry', 'lunge', 'heavy'], { wpn: 'BigSword', guard: .5, poise: 120 }),
  chief2: foe('심마 연경추', 'chars/Master', 11500, 62, 17, 80, 3000, 1500, .78, ['sky_sword', 'wind_turn', 'moon5', 'ring8', 'flurry', 'blink', 'quake'], { wpn: 'BigSword', guard: 1, boss: 1, poise: 640, phases: [{ hp: .66, say: '차가 식겠네.', add: ['rain', 'moon3'], pause: .62 }, { hp: .33, say: '자네 아버지도 여기까지는 왔지.', add: ['fan5', 'charge'], pause: .6 }], scale: 1.5 }),
});
Object.assign(WEAPONS, {
  frost_sword: { name: '천산설철검', type: '검', atk: 44, spr: 'Rapier', price: 2000, desc: '천산 눈 밑에서 캔 쇠로 벼린 검.' },
  frost_blade: { name: '천산설철도', type: '도', atk: 48, spr: 'BigSword', price: 2100, desc: '칼날에 늘 서리가 앉아 있다.' },
  frost_spear: { name: '천산설철창', type: '창', atk: 46, spr: 'Lance2', price: 2050, desc: '창대까지 쇠로 된 묵직한 창.' },
  frost_fist: { name: '천산설철권갑', type: '권', atk: 42, spr: 'Club', price: 1900, desc: '주먹을 쥐면 손등이 시리다.' },
});

// ── 제1장 비단길 ──
async function part8() {
  await ctx.part(8, PART, '제1장 비단길');
  ctx.cg('silk');
  await narr('봄이 오기 전에 원정대가 구화성을 떠났다. 연합군 본대는 천산 앞에서 만나기로 하고, 나는 혁련하를 따라 앞서 걸었다. 곽 아주머니 도시락은 사흘 만에 바닥이 났다.');
  ctx.cgOff();
  set('w1'); await ctx.warp('silk', 41, 15.5, 2);
  await say('hyeok', '사주성까지 열흘입니다. 낮에는 쉬고 밤에 별을 보고 걷습니다.');
  await say('yun', '물은 하루 세 번만 마셔요. 목마르다고 더 마시면 배탈 나요.');
  await say('so', '더워 죽겠다. 천산에 눈 있다며?');
  await say('hyeok', '이 모래를 지나야 눈이 나옵니다.');
  if (S().sworn === 'cheol') await say('cheol', '아우, 소승 물통 좀 열어 주시오. 한 손으로는 안 되오.');
  await narr('닷새째 밤에 바람이 자길래 모래 언덕 밑에 불을 피웠다. 곽 아주머니가 싸 준 보따리를 풀었더니 마른국수 한 묶음과 쪽지가 나왔다. 쪽지에는 삐뚤빼뚤한 글씨로 ‘소금 넣어라’라고 적혀 있었다.');
  await say('so', '이게 끝이야? 편지가 소금 넣어라?');
  await say('me', '제일 길게 쓰신 거예요.');
  await say('hyeok', '제가 끓여 보겠습니다.');
  await narr('혁련하는 찬물에 국수를 넣고 불을 붙이더니 물이 끓을 때까지 손을 모으고 앉아 있었다. 다들 궁금해서 아무도 말리지 않았다. 다 끓고 나니 풀이 되어 있었다.');
  await say('hyeok', '교리에 없는 일이라 그렇습니다.');
  await say('yun', '먹을 만해요.');
  await say('so', '거짓말하지 마.');
  if (!F().plague) {
    await narr('다들 잠든 뒤에도 윤설은 불 옆에서 아버지 장부를 넘기고 있었다.');
    await say('yun', '아버지 마지막 장에 {나} 씨 이름이 있어요.');
    await say('me', '제 이름이요?');
    await say('yun', '‘왼쪽 어깨 쓰는 버릇 못 고침. 딸이 볼 것.’ 그게 끝이에요. 앓아누워서까지 왕진 기록을 쓰고 있었어요.');
    await say('me', '고칠게요.');
    await say('yun', '아니요. 제가 볼게요. 그렇게 적혀 있잖아요.');
  }
  ctx.goal('비단길을 따라 서쪽 끝 사주성으로 가기');
  ctx.note('천산으로 원정을 떠났다. 비단길 끝에 사주성이 있다.');
}
async function oasisCome() {
  await narr('열흘 만에 사주성 성벽이 보였다. 그런데 낮인데도 성문이 닫혀 있었고, 성벽 밑에 사람들이 빈 물통을 안고 앉아 있었다.');
  await say('trader', '중원에서 오셨소? 하필 이럴 때 오셨구려. 우물이 다 말랐소.');
  await say('me', '비가 안 왔어요?');
  await say('trader', '여기는 원래 비가 안 오오. 산에서 내려오는 물길이 있는데, 그걸 막아 놓은 게 있소. 서쪽 바위산 동굴에 들어간 사람이 하나도 안 나왔소.');
  await say('hyeok', '혈교가 일부러 막은 것입니다. 사주성을 말려서 교단 앞에 꿇리려는 것이지요.');
  await say('yun', '물이 없으면 우리도 못 가요.');
  set('w1b'); ctx.goal('사주성 서쪽 끝의 바위산 동굴로 들어가 물길 열기');
  ctx.note('사주성의 물길이 막혔다. 서쪽 바위산 동굴을 살펴봐야 한다.');
}
async function wormFight() {
  await narr('동굴은 생각보다 깊었다. 바닥이 젖어 있는데 물은 없었다. 안쪽 벽이 숨을 쉬듯 움직였고, 나는 그제야 그게 벽이 아니라는 걸 알았다.');
  await say('me', '뭘 먹고 저렇게 컸어.');
  await say('so', '물 먹고 컸겠지. 비켜, 내가 왼쪽 맡을게.');
  await ctx.duel({ foes: ['sand_worm'], allies: ['so_ally'], arena: 'moon', bgm: 'boss', title: '물길의 괴물' });
  await narr('괴물이 쓰러지자 동굴 벽에서 물이 터져 나왔다. 물살에 떠밀려 나오다시피 동굴을 빠져나왔다. 그날 저녁 사주성 우물이 찼고, 성문이 활짝 열렸다.');
  await say('trader', '은인이오! 오늘 먹고 마시는 건 전부 공짜요. 약도 반값에 드리겠소.');
  F().worm = true;
  if (F().hyeok_join) await hyeokMother();
  await say('hyeok', '북쪽 고개를 넘으면 설산입니다. 빙궁이 그 안에 있습니다. 준비가 되면 성 북문으로 나가십시오.');
  set('w2'); ctx.goal('사주성에서 정비하고 북문으로 나가 빙궁 찾기');
}
async function hyeokMother() {
  await narr('잔치가 벌어진 저녁, 혁련하가 시장 끝 좌판 앞에 서 있었다. 말린 꽃을 파는 노파였다. 혁련하는 달맞이꽃 한 묶음을 든 채 움직이지 않았다.');
  await say('hyeok', '이 꽃은 어디서 납니까.');
  await say('flower', '우리 집 뒤에서 나요. 여기서는 잘 안 크는 꽃인데, 딸아이가 좋아해서 심었지요.');
  await say('hyeok', '따님은 어디 있습니까.');
  await say('flower', '열일곱 해 전에 천산 사람들이 데려갔어요. 네 살이었는데, 눈이 붉다고요. 그래도 꽃은 계속 심어요. 돌아오면 있어야 하니까.');
  await narr('노파가 고개를 들다가 멈췄다. 혁련하의 눈을 한참 들여다봤다. 혁련하는 평소처럼 아무 표정이 없었는데 꽃을 쥔 손가락이 하얬다.');
  await say('hyeok', '…그 아이를 뭐라고 부르셨습니까.');
  await say('flower', '소야요. 소야라고 불렀어요.');
  await narr('그날 밤 잠이 안 와 일어났더니 혁련하가 달빛 아래 앉아 작은 소리로 소야, 소야 하고 부르고 있었다.');
  ctx.love('hyeok');
}

// ── 제2장 빙마 ──
async function iceStart() {
  await ctx.chap(8, PART, '제2장 빙마');
  await narr('고개를 넘자 모래가 자갈이 되고 자갈이 눈이 됐다. 하루 사이에 땀이 얼어붙었다.');
  await say('so', '이거 봐. 이 깃발.');
  await narr('눈 속에 찢어진 깃발이 박혀 있었다. 파란 물결 무늬였다. 소연하가 언 손으로 눈을 털어 냈다.');
  await say('so', '벽수궁 깃발이야. 이게 왜 여기 있어.');
  await say('hyeok', '빙마는 십칠 년 전에 교단에 왔다고 들었습니다. 정파에서 왔다는 것 말고는 아는 사람이 없습니다.');
  await say('so', '…가자.');
  ctx.goal('설산 북쪽 끝의 빙궁으로 가기');
}
async function icePalace() {
  await narr('빙궁 벽은 얼음이었다. 얼음 속에 사람들이 서 있었다. 칼을 든 채였고, 옷은 정파 것이었다. 십칠 년 전 토벌에 나갔다 돌아오지 않은 사람들이었다.');
  await say('me', '이 사람들을 왜 여기 세워 놨을까요.');
  await say('so', '말 시키지 마. 나 지금 얼굴 보고 다니는 중이니까.');
  await ctx.duel({ foes: ['icefolk', 'icefolk', 'icefolk'], allies: ['so_ally'], arena: 'snow', bgm: 'fight', title: '빙궁 회랑' });
  await narr('궁 맨 안쪽에 얼음 의자가 있었다. 여인이 앉아 있었고, 허리에 찬 칼에는 칼집이 없었다. 칼날을 그대로 띠에 꽂고 있었다.');
  await say('so', '…사부님.');
  await say('bingma', '누구냐.');
  await say('so', '저 연하예요. 벽수궁 문 앞에 버려졌던 애요. 금방 온다면서요.');
  await say('bingma', '그런 이름은 없다. 나는 빙마다. 교주님께서 깨어나시는데 시끄럽구나.');
  await say('so', '{나}, 도와줘. 마지막은 내가 할게. 그건 내가 해야 돼.');
  await ctx.duel({ foes: ['bingma'], allies: ['so_ally'], arena: 'snow', bgm: 'boss', title: '빙마', yieldAt: .15, noLoot: true });
  ctx.cg('sheath');
  await narr('빙마가 무릎을 꿇었다. 소연하가 걸어가 칼을 들었다. 칼끝이 떨리지 않았다. 나는 그게 더 무서웠다. 칼이 들어가는 순간 빙마의 눈에서 서리가 걷혔다.');
  await say('bingma', '…연하야.');
  await say('so', '네.');
  await say('bingma', '칼집은.');
  await say('so', '십칠 년째 닦았어요.');
  await say('bingma', '금방… 온다고 했는데.');
  await say('so', '늦었어요. 많이요.');
  await narr('소연하는 사부의 허리에서 칼을 뽑아 등에 메고 다니던 빈 칼집에 넣었다. 소리도 없이 들어갔다.');
  ctx.cgOff();
  await say('so', '울지 마.');
  await say('me', '안 우는데요.');
  await say('so', '너한테 한 말 아니야.');
  F().bing_dead = true; ctx.love('so');
  ctx.note('빙마는 소연하의 사부였다. 소연하가 직접 칼을 받았다. 빈 칼집에 칼이 돌아갔다.');
  set('w3'); await thirdStart();
}

// ── 제3장 귀마 ──
async function thirdStart() {
  await ctx.chap(8, PART, '제3장 돌아온 사람');
  await narr('빙궁을 나와 천산 쪽 고개로 올랐다. 눈보라 속에서 사람 그림자가 하나둘 늘어났다. 곤륜 옷을 입은 사람도, 흑도맹 표식을 단 사람도 있었다. 다들 죽은 지 오래였고, 다들 같은 쪽을 보고 서 있었다.');
  await say('hyeok', '귀마의 망자입니다. 저 고개를 지나야 합니다.');
  ctx.goal('고개 마루로 올라가기');
}
async function ghostPass() {
  ctx.cg('ghost');
  await narr('고개 마루에 사람이 혼자 서 있었다. 머리에 눈이 쌓여도 털지 않았다. 가면은 없었다. 나와 닮은 얼굴이었다.');
  await say('me', '…형.');
  await narr('처음 불러 본 말이었다. 형이라고 부르지 말라던 사람은 고개도 돌리지 않았다.');
  ctx.cgOff();
  await say('gwima', '불러 봐야 소용없다. 내가 일으킨 것들은 귀가 없다.');
  await say('me', '내려와. 네 얼굴부터 보자.');
  await say('gwima', '먼저 네 형이랑 놀아라. 곽란이 키운 아이들이 서로 베는 걸 보고 싶구나.');
  await ctx.duel({ foes: ['cheon2'], arena: 'snow', bgm: 'boss', title: '월천', yieldAt: .3, noLoot: true });
  await narr('칼을 맞대는 내내 형은 숨소리도 내지 않았다. 내가 왼발을 밀면 똑같이 왼발이 나왔다. 칼끝에 어깨가 베여도 얼굴은 그대로였다. 무릎이 꺾인 형을 두고 나는 칼을 돌렸다.');
  await say('me', '이제 네 차례야.');
  await ctx.duel({ foes: ['gwima'], foeHpMul: G.S.diff === 'hard' ? .85 : 1, allies: ['so_ally'], arena: 'moon', bgm: 'boss', title: '귀마' });
  await say('gwima', '죽은 것은… 다시 일어난다… 나도…');
  await narr('귀마가 흩어지자 고개를 메우고 있던 망자들이 눈 위로 픽픽 쓰러졌다. 나는 형을 찾아 뒤를 돌아봤다.');
  await narr('형은 쓰러지지 않았다. 잠깐 제 손을 내려다보더니 천산 쪽으로 걸어가기 시작했다. 불러도 돌아보지 않았고, 금방 눈보라에 가려 보이지 않게 됐다.');
  await say('yun', '귀마가 죽었는데 왜 안 쓰러져요?');
  await say('hyeok', '저분을 부르는 것이 귀마만은 아니었던 모양입니다.');
  F().gwi_dead = true;
  ctx.note('고개에서 월천을 만났다. 귀마를 쓰러뜨렸지만 월천은 천산으로 걸어갔다.');
  set('w4'); ctx.goal('고개를 넘어 천산 입구로 가기');
  await ctx.warp('tiangate', 22, 30, 1);
  await fourthStart();
}

// ── 제4장 천산 입구 ──
async function fourthStart() {
  await ctx.chap(8, PART, '제4장 천산 입구');
  await narr('천산 입구는 산이 갈라진 틈이었다. 틈을 가로막은 돌문에 달 모양 구멍이 일곱 개 뚫려 있었다. 연합군 본대는 아직 오지 않았다.');
  ctx.goal('돌문 앞으로 가기');
}
async function lastRent() {
  if (F().baek_live) {
    await narr('돌문 앞에 움막이 하나 있었다. 모닥불이 꺼져 가고 있었고, 그 옆에 낯익은 술병이 누워 있었다.');
    await say('baek', '왔느냐.');
    await say('me', '어르신! 여기서 뭐 하세요?');
    await say('baek', '문지기를 하고 있다. 내가 연 문이니 내가 닫아야지. 석 달째다.');
    await say('baek', '허리가 많이 펴졌구나. 왼발은 아직 늦고.');
    await say('me', '방값 받으러 왔어요.');
    await say('baek', '허허, 이놈이.');
    await narr('백 노인이 품에서 봉투를 꺼냈다. 그믐마다 객잔 앞에 놓이던 그 봉투였다. 안에는 은자 다섯 냥이 들어 있었다.');
    await say('baek', '이번 달 몫이다. 곽란한테 갖다 줘라. 열일곱 해를 하루도 안 빠지고 보냈다고, 그건 꼭 말해라.');
    await say('me', '직접 드리시면 되잖아요.');
    await say('baek', '저것들이 오는구나.');
    await narr('돌문 틈으로 붉은 빛이 새어 나왔다. 틈을 비집고 시커먼 것들이 기어 나오고 있었다. 백 노인은 술병을 내려놓고 허리를 폈다.');
    await say('baek', '잘 봐라. 다시는 안 가르쳐 준다.');
    await ctx.duel({ foes: ['gate_guard', 'gate_guard', 'gate_guard'], allies: ['baek_ally2'], arena: 'moon', bgm: 'boss', title: '돌문 앞' });
    ctx.cg('last_rent');
    await narr('마지막 마장이 쓰러졌을 때 백 노인은 돌문에 등을 기대고 앉아 있었다. 칼이 어깨부터 옆구리까지 들어가 있었다. 십칠 년 전 그 어깨였다.');
    await say('baek', '방값은… 그걸로 된 거냐.');
    await say('me', '이자가 남았어요.');
    await say('baek', '허허… 깎아라.');
    await narr('백 노인의 허리는 끝까지 펴져 있었다.');
    ctx.cgOff();
    F().baek_gone = true;
  } else {
    await narr('출발하던 날 곽 아주머니가 봉투 하나를 쥐여 주었다. 백 영감이 월하곡에 가기 전 마지막 그믐에 보낸 거라고, 뜯지도 않았으니 천산에서 뜯으라고 했다.');
    await narr('돌문 앞에서 봉투를 뜯었다. 은자 다섯 냥과 찢어진 술집 종이가 들어 있었다.');
    await say(null, '“점소이. 이걸 읽는다면 나는 방값을 못 갚은 것이다. 왼발이 늦다. 그래도 거기까지 갔으면 허리는 폈겠지. 문을 열지 마라. 문은 내가 연 것으로 족하다.”');
    await say('me', '끝까지 잔소리네.');
    await narr('돌문 틈으로 붉은 빛이 새어 나왔다. 틈을 비집고 시커먼 것들이 기어 나오고 있었다.');
    await ctx.duel({ foes: ['gate_guard', 'gate_guard', 'gate_guard'], allies: ['so_ally'], arena: 'moon', bgm: 'boss', title: '돌문 앞' });
  }
  S().silver += 5; ctx.note('천산 입구의 돌문 앞에서 그믐 봉투를 받았다. 은자 다섯 냥.');
  set('w5'); await fifthStart();
}

// ── 제5장 심마 ──
async function fifthStart() {
  await ctx.chap(8, PART, '제5장 심마');
  await narr('돌문은 잠겨 있지 않았다. 안쪽으로 돌계단이 이어졌고, 그 끝에 탁자가 하나 놓여 있었다. 천산 뱃속 한가운데 찻잔 두 개가 김을 올리고 있었다.');
  await say('chief', '왔나. 앉게. 차가 식겠네.');
  await say('me', '살아 있었네.');
  await say('chief', '그 정도로 죽을 거였으면 이 자리까지 못 왔지.');
  await say('chief', '나도 어디서 왔는지 아무도 모르는 아이였네. 제단 앞에 버려졌지. 위에 앉은 놈들을 다 끌어내리고 싶었어. 정파든 마교든.');
  await say('me', '그래서 애들을 모아다 개처럼 부렸어?');
  await say('chief', '자네는 살았잖나. 살아서 일곱 장을 모았어. 고맙네.');
  await say('so', '내 사부님 머리에 얼음 넣은 것도 고맙다고 해 보지 그래.');
  await say('chief', '소 낭자도 왔군. 다들 모였어. 시작하지.');
  await ctx.duel({ foes: ['chief2'], allies: ['so_ally'], foeHpMul: G.S.diff === 'hard' ? .85 : 1, arena: 'moon', bgm: 'boss', title: '심마 연경추' });
  await narr('연경추의 칼이 부러졌다. 내 칼이 가슴을 뚫고 나갔는데, 그 사람은 웃고 있었다.');
  await say('chief', '일곱 초식이 한 몸에서 펼쳐져야 문이 열린다고 했지. 자네 몸에는 진작 다 있었네.');
  await say('chief', '모자란 건 하나였어. 문을 잠근 자의 핏줄이, 문을 판 자를 베는 것. 자네 아버지는 끝내 나를 안 베었네. 그래서 내가 벤 거고.');
  await say('me', '…뭐?');
  await say('chief', '내가 왜 자네 손에 죽으러 이 산속까지 왔겠나.');
  ctx.cg('chief_end');
  await narr('연경추의 피가 바닥에 닿자 돌바닥에 달 일곱 개가 차례로 떠올랐다. 초승, 월영, 반월, 월광, 만월, 월식, 낙월. 내가 익힌 순서 그대로였다. 곧이어 산 전체가 크게 울렸다.');
  ctx.cgOff();
  F().chief_end = true; ctx.note('연경추를 베었다. 그것이 마지막 열쇠였다. 봉인이 풀렸다.');
  await G.act3.part9();
}

const job = o => ({ dir: 0, mark: () => true, ...o });
Story.providers.push(function part8p(id) {
  const n = [], sp = [], tr = [], ro = [];
  if (id === 'oasis') {
    if (at('w1b', 'w2')) { n.push({ id: 'so', spr: 'RedSamurai', x: 16, y: 18, dir: 3, talk: async () => { await say('so', '칼은 닦았어?'); } }); n.push({ id: 'yun', spr: 'Princess', x: 18, y: 19, dir: 3, talk: async () => { await say('yun', '물은 하루 세 번이에요.'); } }); if (F().hyeok_join) n.push({ id: 'hyeok', spr: 'Hyeok', x: 24, y: 18, dir: 3, talk: async () => { await say('hyeok', '북문으로 나가면 설산입니다.'); } }); }
    if (at('w1')) tr.push({ x: 0, y: 0, w: 99, h: 99, when: () => at('w1'), run: oasisCome });
    n.push({ id: 'trader', spr: 'Noble', x: 20, y: 15, dir: 0, talk: async () => { await say('trader', F().worm ? '약은 은인께 반값이오. 칼은 대장장이 몫이 있어 깎아 드리지 못하오.' : '물이 없어서 장사가 안 되오. 그래도 보시오.'); await ctx.shop('사주성 상인', [ctx.item.potion(F().worm ? 8 : 14), ctx.item.weapon('frost_sword'), ctx.item.weapon('frost_blade'), ctx.item.weapon('frost_spear'), ctx.item.weapon('frost_fist')]); } });
    if (at('w1b')) n.push(job({ id: 'job_worm', stamp: 'rocks', spr: '', x: 6, y: 12, hint: '동굴로 들어가기', talk: wormFight }));
    if (at('w2', 'w1b')) { if (at('w2')) sp.push({ x: 18, y: 0, w: 6, h: 2, hint: '북문으로 나가기', act: async () => { await ctx.warp('snowpeak', 22, 30, 1); await iceStart(); set('w2b'); } }); }
  }
  if (id === 'silk') ro.push({ spr: 'mon/Lizard', x: 12, y: 11, foes: ['scorpion', 'scorpion'] }, { spr: 'chars/GrayNinja', x: 22, y: 15, foes: ['sand_cut', 'sand_cut'] }, { spr: 'mon/Lizard', x: 32, y: 11, foes: ['scorpion', 'sand_cut'] });
  if (id === 'snowpeak') {
    ro.push({ spr: 'chars/Eskimo', x: 14, y: 22, foes: ['icefolk', 'icefolk'] }, { spr: 'mon/Spirit2', x: 30, y: 18, foes: ['ghost2', 'ghost2'] }, { spr: 'chars/Eskimo', x: 16, y: 12, foes: ['icefolk', 'ghost2'] });
    if (at('w2b')) n.push(job({ id: 'job_ice', stamp: 'statue', spr: '', x: 22, y: 9, hint: '빙궁으로 들어가기', talk: icePalace }));
    if (at('w3')) n.push(job({ id: 'job_pass', stamp: 'tablet', spr: '', x: 36, y: 8, hint: '고개 마루로 오르기', talk: ghostPass }));
  }
  if (id === 'tiangate' && at('w4')) n.push(job({ id: 'job_gate', stamp: 'tablet', spr: '', x: 22, y: 10, hint: '돌문 앞으로 가기', talk: lastRent }));
  return { npcs: n, spots: sp, trigs: tr, roam: ro };
});
Object.assign(FOES, { baek_ally2: foe('백 노인', 'chars/OldMan3', 2600, 66, 16, 86, 0, 0, .9, ['moon1', 'moon3', 'flurry'], { wpn: 'Stick' }) });
G.act3.part8 = part8;
