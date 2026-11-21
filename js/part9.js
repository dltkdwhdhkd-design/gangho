// 제9부 낙월: 천마에게 지고, 무공을 잃고, 객잔으로 돌아가 걸레를 든다. 그리고 끝
import { G, Sound, fadeTo, toast, $, josa } from './core.js';
import { Story, ctx, say, narr, choice } from './ctx.js';
import { WHO } from './dialog.js';
import { FOES } from './foes.js';
import { SKILLS } from './data.js';
import { learn } from './state.js';
import { set, at } from './story1.js';

const S = () => G.S, F = () => G.S.flags, side = () => G.S.side;
const PART = '낙월';
const over = on => $('#dialog').classList.toggle('over', on);
Object.assign(WHO, { cheonma: { name: '천마', face: 'Master' } });
const foe = (name, spr, hp, atk, def, spd, exp, silver, pause, moves, o = {}) => ({ name, spr, hp, atk, def, spd, exp, silver, pause, moves, ...o });
// 서문: 천마에게 유일하게 닿는 걸음
SKILLS.moon0 = { name: '서문', han: '序文', w: '무관', school: '월하칠식', mp: 0, cd: 7, desc: '허리를 세우고, 왼발로 밀고, 오른발은 따라오게 둔다. 천마를 덮은 달빛을 닦아 낸다. 잠시 다른 초식이 천마에게 닿는다.', dur: .62, expose: true, steps: [{ t: .02, sfx: 'select', move: { d: 46, dur: .34, iframe: true, ghost: true } }, { t: .36, sfx: 'magic2', hit: { shape: 'arc', r: 40, a: 100, mul: 1.6, kb: 20, stun: .4, ub: true }, fx: { n: 'ringw', s: 2, at: 'self' } }] };
Object.assign(FOES, {
  tianmo0: foe('천마', 'chars/Master', 99999, 90, 40, 70, 0, 0, .9, ['flurry', 'ring8', 'quake', 'blink'], { wpn: 'BigSword', boss: 1, poise: 99999, immune: 1, title: '삼백 년 만에 깨어난', scale: 1.8 }),
  tianmo: foe('천마 혁련무극', 'chars/Master', 8500, 62, 18, 84, 0, 0, .76, ['sky_sword', 'ring8', 'moon5', 'flurry', 'blink', 'quake', 'rain'], { wpn: 'BigSword', boss: 1, poise: 900, immune: 1, scale: 1.8, phases: [{ hp: .6, say: '배가 고프구나.', add: ['fan5', 'charge'], pause: .6 }, { hp: .3, say: '달을 내놓아라.', add: ['moon3', 'tide'], pause: .5 }] }),
  majang: foe('마장', 'chars/DarkNinja', 1200, 62, 14, 74, 320, 30, 1, ['flurry', 'heavy', 'lunge', 'blink'], { wpn: 'Axe', guard: .4 }),
  moon_envoy: foe('붉은 달 사자', 'chars/RedArmor', 6000, 68, 16, 84, 1400, 600, .78, ['flurry', 'cloud_flash', 'fan5', 'rain', 'blink'], { wpn: 'Katana', guard: .7, boss: 1, poise: 480 }),
  gwak_ally: foe('곽 아주머니', 'chars/OldWoman', 2400, 72, 16, 70, 0, 0, 1, ['flurry', 'cloud_flash', 'quick'], { wpn: 'Stick' }),
  town_ally: foe('청하진 사람들', 'chars/Villager', 900, 34, 8, 52, 0, 0, 1.3, ['slash', 'lunge'], { wpn: 'Club' }),
  ogang_ally: foe('오강', 'chars/Villager3', 2200, 46, 13, 70, 0, 0, 1, ['double', 'lunge', 'spin'], { wpn: 'Lance' }),
  guyang_ally: foe('구양철', 'chars/Caveman2', 2600, 50, 15, 60, 0, 0, 1.1, ['heavy', 'quake', 'spin'], { wpn: 'Axe' }),
  go_ally9: foe('고진', 'chars/Inspector', 1800, 46, 13, 72, 0, 0, 1, ['double', 'lunge', 'cloud_flash'], { wpn: 'Sword' }),
  jang_ally: foe('장팔', 'chars/GreenNinja', 1200, 34, 12, 60, 0, 0, 1.2, ['heavy', 'slash'], { wpn: 'Club' }),
  samaung_last: foe('사마웅', 'chars/Samaung', 3000, 60, 18, 62, 0, 0, 1, ['heavy', 'quake', 'spin'], { wpn: 'BigSword' }),
});

// 서문이 초식 칸에 없으면 마지막 칸에 넣어 준다
const slotPreface = () => { const s = S(); if (s.skills.includes('moon0') && !s.slots.includes('moon0')) { s.slots[3] = 'moon0'; toast('초식 서문을 P 칸에 넣었다', 3); } };

// ── 제1장 천마 재림 ──
async function part9() {
  await ctx.part(9, PART, '제1장 천마 재림');
  ctx.cg('tianmo');
  await narr('천산 허리가 위아래로 갈라졌다. 그 틈으로 달이 보였는데, 붉은 달이 그렇게 가까이 있는 줄은 그때 처음 알았다.');
  await narr('누가 돌계단을 걸어 올라왔다. 키가 큰 사람도 아니었다. 맨발이었다. 그 사람이 한 걸음 디딜 때마다 얼어붙은 물이 터지는 소리가 났다.');
  ctx.cgOff();
  await say('cheonma', '삼백 년을 잤더니 배가 고프구나. 문을 연 것이 너냐.');
  await say('me', '…….');
  await say('cheonma', '수고했다. 뭐라도 먹어야겠다.');
  await say('so', '{나}! 뒤로 빠져!', 'a');
  await ctx.duel({ foes: ['tianmo0'], arena: 'moon', bgm: 'boss', title: '천마', survive: 22, tip: '칼이 통하지 않습니다. 22초를 버티세요.' });
  await narr('무엇을 해도 닿지 않았다. 칠식을 차례로 쏟아부었는데 칼끝이 달빛에 미끄러졌다. 낙월까지 썼다. 일곱 번째 달이 떨어졌는데 그 사람은 옷깃을 털었다.');
  await say('cheonma', '달을 베러 왔느냐. 달은 먹는 것이다.');
  await narr('손가락 하나가 내 배꼽 밑을 눌렀다. 아프지 않았다. 다만 그동안 몸 안을 돌던 것이 전부 빠져나갔다. 물 뺀 자루처럼 무릎이 꺾였다.');
  F().crippled = true;
  await say('samaung', '이 애송이가, 언제 왔다고 먼저 눕나.');
  await narr('누가 나를 짐짝처럼 어깨에 들쳐 멨다. 그다음은 기억이 끊겼다.');
  await fadeTo(1); over(true);
  await narr('나중에 들은 얘기다. 천산 앞에 닿은 연합군 본대는 사흘 만에 무너졌다. 사마웅이 나를 메고 나왔고, 소연하가 뒤를 끊었고, 혁련하가 물 있는 길을 찾았다. 살아서 비단길을 되돌아온 사람은 나간 사람의 삼분의 일이 안 됐다.');
  await narr('청하진까지 석 달이 걸렸다고 한다. 나는 그 석 달 동안 숟가락을 혼자 들지 못했다.');
  over(false);
  set('x2'); G.field.load('inn', 13, 8, 1); await fadeTo(0);
  await home();
}

// ── 제2장 객잔으로 ──
const SPOTS = [[4, 8, '문턱', '허리를 세웠다. 숨이 찼다. 칼 쓰던 팔로 걸레 하나를 못 밀었다.'], [9, 9, '가운데 탁자 밑', '왼발로 밀었다. 오른발이 따라오질 않아서 넘어졌다. 다시 밀었다.'], [14, 8, '구석방 앞', '오른발이 조금 따라왔다. 스무 살 봄에 내가 닦던 자리였다.']];
async function home() {
  await ctx.chap(9, PART, '제2장 객잔으로');
  await say('gwak', '{나}야! 거기서 뭐 해! 해가 중천이다!', 'a');
  await say('me', '…아주머니.', 's');
  await say('gwak', '일어났으면 걸레 들어. 누워서 밥만 축낼래?', 'a');
  await say('me', '내공이 없어요. 칼도 못 들어요.', 's');
  await say('gwak', '누가 칼 들랬어? 걸레 들랬지. 내공 없어도 바닥은 닦이더라. 얼른 가!', 'a');
  ctx.goal('달맞이 객잔 바닥 세 군데 닦기');
  ctx.note('무공을 잃었다. 달맞이 객잔으로 돌아왔다. 곽 아주머니가 걸레를 쥐여 주었다.');
}
async function mop(i) {
  await say(null, SPOTS[i][3]); F()['xm' + i] = true; Sound.sfx('select');
  if (F().xm0 && F().xm1 && F().xm2) await preface();
}
async function preface() {
  ctx.cg('mop_again');
  await narr('그렇게 한 달을 닦았다. 칼을 찬 사람들은 객잔에 들르지 않았다. 손님은 약을 얻으러 온 피난민들이었고, 나는 그 사람들 그릇을 치웠다. 아침마다 허리를 세우고 왼발로 밀었다.');
  await narr('어느 날 아침, 닦아 놓은 바닥을 돌아보다가 알았다. 오른발이 저절로 따라오고 있었다. 숨이 끊기지 않았다. 배꼽 밑에서 아주 작은 뭔가가 같이 밀리고 있었다.');
  ctx.cgOff();
  await say('kid', '쟁반 {나루아이}, 이제 칼 못 들어요?');
  await say('me', '응.', 'h');
  await say('kid', '그럼 쟁반이라도 던져요. 쟁반 잘 던지잖아요.');
  await narr('쟁반은 들렸다. 던지면 두 칸도 못 날아가서 문제였다. 꼬마가 주워다 주기를 열 번쯤 하더니 자기가 던져 보겠다고 했다. 나보다 멀리 날아갔다.');
  await say('gwak', '늦었어. 국수 다 불겠다. 이리 와서 국물 끓이는 거나 배워.');
  await say('me', '국물이요? 나중에 가르쳐 주신다면서요.', 'b');
  await say('gwak', '지금이 나중이다. 민물새우 한 줌에 무 한 토막. 끓으면 불 줄이고 딴생각 말고 앉아 있어.');
  await say('me', '그게 다예요?', 'b');
  await say('gwak', '그럼 뭐, 비법이라도 있는 줄 알았냐.', 'h');
  await say('me', '이걸 왜 그렇게 안 가르쳐 주셨어요?');
  await say('gwak', '그것까지 알려 주면 너 나갈 거 아냐.', 'h');
  await say('gwak', '…이제 다 배웠네.', 's');
  await narr('곽 아주머니가 장부를 꺼냈다. 내 이름 옆에 ‘갚음’이라고 적혀 있던 그 장부였다. 표지를 젖히더니 맨 앞 장을 조심스럽게 뜯어냈다. 뒷면에 옛날 글씨가 빼곡했다.');
  ctx.cg('preface');
  await say('gwak', '서문이다. 네 어미가 불길 속에서 나한테 넘겨준 거야. 찢지 말고 맨 앞에 두라고 해서 맨 앞에 뒀다. 장부 맨 앞에.', 's');
  if (F().f7_well) await say('gwak', '비단옷 놈이 우물 밑을 석 달 팠지. 위패 밑까지 들쑤셨어. 내 허리춤은 못 팠고.', 'h');
  await say('me', '이걸 장부에 붙여 놓으셨어요?', 's');
  await say('gwak', '누가 국숫집 장부를 뒤지겠냐.', 'h');
  await say(null, '“이 글을 먼저 읽는 이에게. 일곱 초식은 천마를 베는 법이 아니다. 천마는 베이지 않는다. 사람 마음에 쌓인 먼지 같은 것이라 닦아 낼 수 있을 뿐이다.”');
  await say(null, '“허리를 세우고, 왼발로 밀고, 오른발은 따라오게 둔다. 이것이 전부다. 일곱 초식은 이 걸음을 잊지 않으려고 적어 둔 것이다.”');
  await say('me', '…걸레질인데요.', 's');
  await narr('── 3부, 소림 장경각 ──\n“네가 모으는 종이 말이다. 일식 앞에 한 장이 더 있었을 게다.”');
  await narr('── 3부, 화산 벼랑 동굴 ──\n“칠식을 다 모아도 그것이 끝은 아니다. 서문을 찢지 마라. 맨 앞 장은 절대 찢지 마라.”');
  if (F().fr_med) await narr('── 4부, 처방 쪽지 ──\n“감초 넣었냐. 밥은 먹고 다니고. 서문은 안 찢었다.”');
  else await narr('── 6부, 월하곡 ──\n“……서문은 찢지 않았다. 그것만 알아 둬.”');
  await narr('── 1부, 청하진 객잔 ──\n“허리는 세우고 왼발로 밀고, 오른발은 슬슬 따라오게 두라고 어제도 일렀거늘.” 백 노인이 객잔 바닥을 가리키며 하던 잔소리.');
  await say('gwak', '그래. 네 어미가 처음 배운 것도 바닥 닦기였어. 월하문 아이들은 칼을 잡기 전에 삼 년을 닦았다. 백 영감이 왜 너한테 그걸 시켰겠냐.', 's');
  ctx.cgOff();
  S().skills.includes('moon0') || learn('moon0');
  F().crippled = false;
  await narr('그날 저녁 마당에 나가 왼발을 밀어 보았다. 칼은 없었다. 걸음이 지나간 자리의 먼지가 밀려났고, 처마에 앉아 있던 붉은 빛이 한 뼘쯤 물러났다.');
  await say(null, '내공이 돌아왔다. 초식 서문을 익혔다. 메뉴의 초식 배치에서 칸에 넣을 수 있다.');
  ctx.note('곽 아주머니 장부 맨 앞에 서문이 있었다. 일곱 초식은 걸레질을 잊지 않으려고 적은 것이다.');
  await say('boat', '{나}야! 강 위로 불이 내려온다! 저것들이 여기까지 왔구먼!');
  set('x3'); await siege();
}

// ── 제3장 달맞이 객잔 방어전 ──
async function siege() {
  await ctx.chap(9, PART, '제3장 달맞이 객잔');
  await narr('천마의 군세가 장강을 타고 내려왔다. 구화성은 이틀을 버텼다. 그다음 나루가 청하진이었다. 달아날 곳이 있는 사람은 벌써 달아났어야 했는데, 객잔 앞에 사람들이 하나둘 모이고 있었다.');
  ctx.cg('siege');
  await say('smith', '작살은 여든 자루다. 저번보다 많다.');
  await say('elder', '늙은이는 뒤에 있으라고들 하는데, 뒤가 어딘가. 여기가 맨 뒤일세.');
  await say('guyang', '산길은 내 애들이 막았다. 쌀값은 이걸로 치른 거다.');
  await say('namhwa', '나루 밖 우물은 제가 손봐 뒀어요. 저쪽 놈들이 마시면 그날로 끝이에요. 우리 쪽은 마시지 마세요.');
  await G.side.siege();
  if (F().wei_spared) await say('wei', '점소이, 국수 외상 갚으러 왔다. 배는 다 뒤집어 놨으니 강으로는 못 물러난다.');
  if (F().lion_debt) await say('lion', '산에서 내려왔다. 녹림 놈들은 빚지고는 못 산다고 했잖냐.');
  // 1~5부에서 만난 청하진 바깥 사람들 중 온 사람
  if (F().l_yang) await say('yang', '부엌은 이 늙은이가 맡을게. 손주 놈 몫까지 국 끓여 놓을 테니, 다 끝나면 와서 먹어.');
  if (F().jg_refuge) await say('rf_boy', '{나루아이}, 나도 쟁반 줘요. 칼은 안 줘도 돼요. {나루아이}처럼 던질래요.');
  if (F().r3_kaifeng) await say('clan_gaebang', '개방 거지들이 강가에 쫙 깔렸네. 저쪽 배가 몇 척인지, 언제 오는지 반 시진마다 알려 주지.');
  if (F().r3_nanjing) await say('ng_young', '남궁은 대숲 쪽 문에 섰소. 이번엔 숙부님 혼담이 아니라 내 이름을 걸었소.');
  if (F().r3_hangzhou) await say('clan_moyong', '저쪽 무공은 내가 되받아 주겠소. 내 말로 하자면, 걱정 마시오.');
  if (F().kids_saved) await narr('나무패를 벗은 아이들 서른한 명이 쟁반을 하나씩 들고 줄을 섰다. 말리는 사람이 없었다. 꼬마가 맨 앞에서 던지는 법을 가르치고 있었다.');
  const post = await deploy();
  await say('gwak', '다들 밥은 먹었어? 안 먹은 놈은 나중에 먹어. 살아서 먹어.');
  await narr('곽 아주머니가 국자를 들고 맨 앞으로 걸어 나갔다. 나는 쟁반을 집어 들었다.');
  ctx.cgOff();
  await ctx.duel({ foes: ['majang', 'majang', 'majang'], allies: ['gwak_ally', 'town_ally', ...post[0].map(k => DEF[k].ally)].slice(0, 4), arena: 'dock', bgm: 'fight', title: '나루 문' });
  await say('me', '아주머니, 물러나세요!', 'b');
  await say('gwak', '네가 물러나, 이놈아. 나는 여기서 십칠 년을 살았다.', 'a');
  await ctx.duel({ foes: ['majang', 'majang', 'hyeol_elite', 'hyeol_elite'], allies: ['gwak_ally', 'town_ally', ...[...post[1], ...post[2]].map(k => DEF[k].ally)].slice(0, 4), arena: 'forest', bgm: 'fight', title: '대숲 문과 우물' });
  await narr('광장이 뚫렸다. 객잔 마당까지 밀렸을 때 붉은 갑옷을 입은 자가 지붕 위로 뛰어올랐다. 객잔이 불타던 그믐밤처럼 기왓장 밟는 소리가 났다.');
  await say('me', '남의 집 지붕에서 뭐 하는 짓이야!', 'a');
  await ctx.duel({ foes: ['moon_envoy'], allies: ['gwak_ally'], arena: 'yard', bgm: 'boss', title: '붉은 달 사자' });
  await siegeToll(post);
  await narr('날이 밝았다. 군세가 강 건너로 물러났다. 객잔은 지붕이 반쯤 날아갔는데 서 있었고, 곽 아주머니는 오른쪽 어깨를 누르고 부뚜막 앞에 앉아 있었다. 옛날 칼자국 위로 새 칼자국이 나 있었다.');
  await say('yun', '팔 줘 봐요. 아니, 아주머니 어깨부터요.');
  await say('gwak', '약 너무 쓰게 달이지 말고 감초 많이 넣어.', 'h');
  await say('me', '아주머니.', 's');
  await say('gwak', '왜.');
  await say('me', '다녀올게요.', 's');
  await say('gwak', '…밥은 먹고 가.', 's');
  await narr('마지막 국수는 내가 끓였다. 곽 아주머니는 한 숟갈 뜨고 나서 소금이 모자란다고 했다. 그릇은 다 비웠다.');
  { const c = await choice('곽 아주머니가 빈 그릇을 들고 묻는다. “하나 더 싸 주랴?”', ['{형} 몫으로 하나 더 싸 달라고 한다', '괜찮다고 한다']);
    if (c === 0) { F().gwak_soup = true; G.fate?.mark(); await say('gwak', '…천이 놈 몫이냐. 식기 전에 먹이라고는 안 한다. 식어도 먹여.', 's'); await say(null, '국 한 그릇을 받았다. 보자기에 싸서 등에 멨다.'); } }
  ctx.note('달맞이 객잔을 지켰다. 천마를 치러 다시 천산으로 간다.');
  set('x4'); await palaceStart();
}

// 객잔 방어전 배치: 온 사람을 세 문에 나눠 세운다. 한 문에 하나뿐이면 그 사람이 쓰러지고, 아무도 없으면 마을이 사람을 잃는다. 여섯이 넘게 오면 아무도 안 죽는다
const GATES = ['나루 문', '대숲 문', '우물'];
const DEF = {
  cheol: { name: '철우', ally: 'cheol_ally', ok: () => !!F().cheol_arm && G.fate?.of('cheol') !== 'dead', die: '철우는 우물가에서 남은 오른팔 하나로 문짝을 받치고 서 있었다. 날이 밝을 때까지 그 자세였다.' },
  wei: { name: '위충', ally: 'wei_ally', ok: () => !!F().wei_spared && G.fate?.of('wei') !== 'lost', die: '위충은 나루 문 앞 물속에 엎어져 있었다. 뒤집어 놓은 배 밑으로 마장 셋이 같이 가라앉아 있었다.' },
  lion: { name: '맹호', ally: 'lion_ally', ok: () => !!F().lion_debt, die: '맹호는 문 앞에 앉은 채였다. 도끼는 오른손에 있었다. 빚은 갚았다고 했다더라고, 아이들이 전했다.' },
  go: { name: '고진', ally: 'go_ally9', ok: () => !!F().go_bond && !F().go_dead, die: '고진은 무너진 문 자리에 혼자 서 있다가 쓰러졌다. 칼끝은 끝까지 바닥을 보지 않았다.' },
  jang: { name: '장팔', ally: 'jang_ally', ok: () => !!F().jang_bond && G.fate?.of('jang') !== 'lost', die: '장팔은 쟁반 든 아이들을 객잔 안으로 밀어 넣고 문을 막았다. 문은 버텼다. 장팔은 못 버텼다.' },
  guyang: { name: '구양철', ally: 'guyang_ally', ok: () => (F().jg_guyang === 'saved' || G.S.side === 'sa'), die: '구양철은 산길 쪽 문을 끝까지 비키지 않았다. 녹림 놈들이 사흘 동안 그 문 앞에서 울었다.' },
  smith: { name: '대장장이 강씨', ally: 'smith_ally', ok: () => true, safe: 1 },
};
async function deploy() {
  const L = Object.keys(DEF).filter(k => DEF[k].ok()), post = [[], [], []];
  await narr(`객잔으로 들어오는 길은 셋이었다. 나루 쪽 문, 대숲 쪽 문, 그리고 뒷마당 우물. 내 곁에 선 사람은 ${L.length}명이었다.`);
  if (L.length < 6) await say('gwak', '셋을 다 막을 사람이 없다. 문 하나에 둘은 서야 안 무너진다. 알아서 세워.', 'a');
  for (const [i, k] of L.entries()) {
    const c = G.auto ? i % 3 : await choice(`${josa(DEF[k].name, "을/를")} 어디에 세울까? (나루 ${post[0].length} · 대숲 ${post[1].length} · 우물 ${post[2].length})`, GATES);
    post[c].push(k);
  }
  F().siege_post = post; G.fate?.mark();
  return post;
}
async function siegeToll(post) {
  const n = post.flat().length; if (n >= 6) { await narr('세 문 모두 버텼다. 아침에 이름을 불러 보니 한 사람도 빠지지 않았다.'); return; }
  let lost = false;
  for (const [i, g] of post.entries()) {
    if (g.length === 0 && !lost) { lost = true; await narr(`${GATES[i]}에는 아무도 서 있지 않았다. 마장들이 그리로 들이쳤고, 촌장 어른이 지팡이를 들고 막아섰다.`); G.fate?.set('town', 'dead', `${GATES[i]}에 아무도 세우지 않았다`); }
    else if (g.length === 1 && !DEF[g[0]].safe) { const k = g[0]; await narr(DEF[k].die); G.fate?.set(k, 'dead', `객잔 방어전에서 ${GATES[i]}을 혼자 지켰다`); if (k === 'go') F().go_dead = true; }
  }
}

// ── 제4장 흑운궁 ──
async function palaceStart() {
  await ctx.chap(9, PART, '제4장 흑운궁');
  await narr('이번에는 군대를 데려가지 않았다. 강호에 군대가 남아 있지도 않았다. 혁련하가 아는 길로 석 달을 걸어 천산 뒤쪽 벼랑에 닿았다. 구름 위에 검은 궁이 얹혀 있었다.');
  await ctx.warp('blackpalace', 22, 34, 1);
  await say('hyeok', '이 다리를 건너면 흑운궁입니다. 저는 여기서 자랐습니다. 다리는 하나뿐입니다.');
  if (S().sworn === 'cheol' && G.fate?.of('cheol') !== 'dead') await say('cheol', '아우, 소승은 오른손이 남았소. 문짝 하나는 더 부술 수 있소.');
  ctx.goal('다리를 건너 흑운궁 제단으로 가기');
  ctx.note('흑운궁에 닿았다.');
}
async function bridge() {
  await narr('다리 중간쯤 갔을 때 양쪽 벼랑에서 마장들이 쏟아져 나왔다. 앞뒤로 끝이 보이지 않았다.');
  await say('samaung', '이 다리, 폭이 딱 칼 하나 휘두를 만하네.');
  await say('me', '패천도. 왜 여기 계세요. 분명 강호에 남으신다고…', 'b');
  await say('samaung', '네놈 메고 나올 때 등에 뭘 흘렸는지 아냐. 그 빚은 받아야지.');
  const og = F().jg_ogang === 'spared' || (side() === 'sa' && F().sa_t2), gy = (F().jg_guyang === 'saved' || (side() === 'sa' && F().sa_t1)) && G.fate?.of('guyang') !== 'dead', tb = (F().table_good || 0) >= 2;
  if (og && gy && tb) return bridgeTogether();
  await ctx.duel({ foes: ['majang', 'majang', 'majang', 'hyeol_elite'], allies: ['samaung_last'], arena: 'moon', bgm: 'boss', title: '흑운궁 다리' });
  await say('samaung', '가라.');
  await say('me', '같이 가요.');
  await say('samaung', '내 형제 열둘 얘기 해 줬지? 그 애들이 나 늦는다고 욕할 때가 됐다. 가, 이 자식아. 연경추 목은 네가 따고 내 몫은 안 남겼잖냐. 이번 건 내가 먹는다.');
  ctx.cg('samaung_end');
  await narr('사마웅은 다리 한가운데서 큰 칼을 땅에 꽂고 돌아섰다. 뒤를 돌아보지 말라고 했는데 나는 돌아봤다. 맨 앞 놈의 목이 날아갔고, 그 사람은 웃고 있었다. 칼 부딪는 소리는 궁 문이 닫힐 때까지 들렸다.');
  ctx.cgOff();
  F().samaung_dead = true; await hall();
}
// 살려 보낸 두 채주가 따라와 다리 양 끝을 나눠 막는다. 합석에서 한 상에 앉았던 일이 여기서 돌아온다
async function bridgeTogether() {
  await say('ogang', '형님 혼자 폭 좋은 다리 차지하는 건 반칙이오. 물귀신도 다리 위에서는 싸울 줄 아오.');
  await say('guyang', '산길은 애들한테 맡기고 왔다. 무창에서, 산길에서 이놈한테 빚진 놈들이 둘이나 서 있는데 형님 혼자 죽겠다고?');
  await say('samaung', '…이놈들이. 내 몫을 나눠 먹겠다고?');
  await say('me', '합석에서 한 상에 앉았잖아요. 국수도 셋이 나눠 드셨으면서.', 'h');
  await ctx.duel({ foes: ['majang', 'majang', 'majang', 'majang', 'hyeol_elite'], allies: ['samaung_last', 'ogang_ally', 'guyang_ally'], arena: 'moon', bgm: 'boss', title: '흑운궁 다리' });
  await narr('셋이 다리 한가운데에 등을 맞대고 섰다. 오강이 앞을, 구양철이 뒤를, 사마웅이 가운데를 맡았다. 나는 돌아보지 않고 달렸다. 이번에는 돌아볼 필요가 없었다.');
  await narr('궁 문이 닫히기 직전에 사마웅의 목소리가 들렸다. 형제 열둘한테 혼날 날을 미뤄야겠다고, 욕 섞인 웃음소리였다.');
  G.fate?.set('samaung', 'alive', '살려 보낸 오강과 구양철이 다리 위에 같이 섰다');
  await hall();
}
async function hall() {
  await narr('제단으로 가는 복도는 길었다. 복도 끝에 사람이 서 있었다. 가면도 없이, 눈 쌓인 머리 그대로였다.');
  await say('me', '{형}.', 's');
  slotPreface();
  await ctx.duel({ foes: ['cheon2'], arena: 'moon', bgm: 'boss', title: '월천', yieldAt: .5, noLoot: true, tip: '<b>서문</b>을 쓰세요. 먼지를 닦아 내듯.' });
  ctx.cg('cheon_end');
  await narr('칼을 맞대다 말고 나는 칼을 내렸다. 왼발로 밀었다. 칼 대신 걸음을 들이밀었다. {형} 얼굴에 쌓인 눈이 천천히 벗겨졌다.');
  await say('cheon', '…{나}.');
  await say('me', '{형}.', 's');
  await say('cheon', '그 말… 하지 말랬지.');
  if (F().wol_named && F().wol_mop && F().gwak_soup) return hallSaved();
  await narr('그 순간 복도 끝에서 붉은 빛이 날아왔다. 내가 고개를 돌리기도 전에 {형}이 나를 등 뒤로 밀쳤다. 빛은 {형}의 가슴에서 멈췄다.');
  await say('cheon', '아주머니한테… 밥은 먹고 다녔다고 해라.');
  await say('me', '{형}!', 's');
  await say('cheon', '달이 뜨면… 베지 말고… 닦아라.');
  ctx.cgOff();
  await narr('이번에는 내가 직접 눈을 감겨 주었다.');
  F().cheon_end = true;
  set('x5'); await finale();
}

// 숨은 길: 월하곡에서 형이라고 불렀고, 고개에서 칼 대신 걸레질로 끝냈고, 곽 아주머니의 국을 들고 왔다
async function hallSaved() {
  await narr('그 순간 복도 끝에서 붉은 빛이 날아왔다. {형}이 나를 등 뒤로 밀치려 했다. 나는 그보다 먼저 등에 멘 보자기를 풀어 앞으로 내밀었다.');
  await narr('빛은 국그릇에 맞았다. 그릇이 깨지고 식은 국물이 {형} 얼굴에 튀었다. 민물새우 한 줌에 무 한 토막. 붉은 빛은 국물에 젖은 데부터 꺼졌다.');
  await say('cheon', '…이게 뭐냐.', 'b');
  await say('me', '아주머니가 {형} 몫이래. 식어도 먹이랬어.', 'h');
  await say('cheon', '다 쏟았잖아.', 'b');
  await say('me', '내려가면 또 끓여 주실 거야. 소금 모자라다고 하면서.', 'h');
  await narr('{형}이 웃었다. 처음 보는 얼굴이었다. 열일곱 해 동안 눈 밑에 쌓여 있던 것이 한꺼번에 녹는 얼굴이었다.');
  await say('cheon', '…가라. 제단은 너 혼자 가야 한다. 나는 문 앞에 서 있겠다. 이번에는 안 죽고.', 'h');
  ctx.cgOff();
  F().cheon_end = true; G.fate?.set('wolcheon', 'alive', '이름을 불렀고, 걸레질로 끝냈고, 국 한 그릇을 들고 갔다');
  set('x5'); await finale();
}

// ── 제5장 낙월 ──
async function finale() {
  await ctx.chap(9, PART, '제5장 낙월');
  await narr('제단은 하늘로 뚫려 있었다. 붉은 달이 손 닿을 만큼 내려와 있었고, 그 밑에 그 사람이 앉아 있었다. 앞에 놓인 것은 아무것도 없는 빈 그릇이었다.');
  await say('cheonma', '또 왔구나. 무공을 뺏었는데 어찌 걸어 왔느냐.');
  await say('me', '걸레질했습니다.');
  await say('cheonma', '…걸레질.');
  await say('me', '당신 먼지 닦으러 왔어요.', 'a');
  await say('cheonma', '삼백 년 전에 그 말을 한 계집이 있었지. 배가 고프구나. 너는 어떤 맛이냐.');
  if (side() === 'ma') {  // 마교 길: 마지막으로 한 번 더 고른다. 빈 그릇을 채워 바치면 붉은 달 결말
    await say('cheonma', '너는 내 교단에서 컸다. 그릇을 채워라. 그러면 아무도 배고프지 않게 해 주마.');
    const c = await choice('천마가 빈 그릇을 내민다.', ['그릇을 받지 않고, 허리를 세운다', '그릇을 채워 바친다']);
    if (c === 1) {
      F().ma_side_end = true; G.fate?.mark();
      ctx.cg('fall');
      await narr('나는 그릇을 받았다. 품에서 일곱 장을 꺼내 그릇에 넣었다. 그 사람이 그릇을 들어 마셨다. 달이 더 붉어졌다. 배가 부른 얼굴이었다.');
      await say('cheonma', '착하구나. 이제 아무도 배고프지 않다.');
      ctx.cgOff(); F().tianmo_down = false;
      return lastChoice();
    }
  }
  const allies = []; { const a = await G.bond.join(side(), allies); if (a) allies.push(a); }
  if (F().hyeok_join && !allies.includes('hyeok_ally')) { await say('hyeok', '제단의 불은 제가 끄겠습니다. 저는 소야입니다.'); allies.push('hyeok_ally'); }
  if (!allies.includes('so_ally')) { await say('so', '왼발 늦지 마라.', 'h'); allies.push('so_ally'); }
  slotPreface();
  await ctx.duel({ foes: ['tianmo'], allies, foeHpMul: G.S.diff === 'hard' ? .75 : 1, arena: 'moon', bgm: 'boss', title: '천마 혁련무극', tip: '칼이 닿지 않습니다. 초식 <b>서문</b>으로 달빛을 닦아 내면 잠시 닿습니다. 메뉴에서 칸에 넣으세요.' });
  ctx.cg('fall');
  await narr('허리를 세웠다. 왼발로 밀었다. 오른발이 따라왔다. 칠식은 하나도 쓰지 않았다. 군막에서 배운 것도, 강호에서 배운 것도 쓰지 않았다. 객잔 바닥을 닦던 걸음으로 그 사람에게 걸어갔다.');
  await narr('손바닥이 그 사람 가슴에 닿았다. 먼지가 닦이듯 붉은빛이 밀려났다. 그 밑에 나온 것은 맨발에 비쩍 마른 사람 하나였다. 그 사람이 빈 그릇을 내려다봤다.');
  await say('cheonma', '…배가 고팠을 뿐인데.');
  await say('me', '내려가시면 국수 한 그릇 드릴게요.', 'h');
  await narr('그 사람은 뭐라고 대답하려다 말고 웃는 것 같았다. 그리고 먼지처럼 흩어졌다. 달이 천천히 지기 시작했다. 붉은빛이 빠져나간 달은 처음 보는 것처럼 하얬다.');
  ctx.cgOff();
  F().tianmo_down = true;
  await lastChoice();
}
const LEAD = { jeong: ['정천맹을 다시 세운다', '맹주 자리는 내가 맡았다. 맨 처음 한 일은 맹주 창고 지하를 메운 것이었다.'], sa: ['흑도맹을 이끈다', '사마웅의 큰 칼은 산채 마당에 꽂아 두었다. 흑도맹은 그 칼 앞에서 맹세한 뒤로 양민의 쌀을 건드리지 않는다.'], ma: ['교단을 거두어 잠근다', '남은 신도들을 데리고 제단의 불을 껐다. 제단 자리에 달맞이꽃을 심었다.'], free: ['강호의 일을 맡는다', '깃발 없는 사람이 정파와 사파 사이에 앉는 자리가 생겼다. 다들 나를 합석 어른이라고 불렀는데, 그 말이 제일 듣기 싫었다.'] };
async function lastChoice() {
  if (await G.chronicle.deferEnding()) return;
  const s = side() || 'jeong', lead = LEAD[s];
  await narr('달이 지고 나서도 세상은 그대로 있었다. 무너진 산문을 고치고, 불탄 나루를 다시 놓고, 죽은 사람들 이름을 적는 데 한 해가 갔다.');
  if (!F().ma_side_end) {
    const p = await choice('품 안에 월하칠식 일곱 장이 있다. 이제 무엇에 쓸까.', ['태운다', '곽 아주머니에게 맡긴다', '지니고 다닌다']);
    F().pages_fate = ['burn', 'gwak', 'keep'][p]; if (p === 0) F().pages_burned = true;
  }
  const c = F().ma_side_end ? 1 : await choice('그 뒤로 나는', ['달맞이 객잔으로 돌아간다', lead[0], '천산에 남아 봉인 자리를 지킨다', '다시 길을 떠난다']);
  F().finale = ['inn', 'lead', 'seal', 'road'][c];
  await G.endings.play(c);
  await G.side.ending();
  await G.bond.ending();
  await G.chronicle.ending();
  ctx.cgOff();
  await narr('그 뒤로 강호에서는 나를 이렇게 불렀다. {호} {나}.\n\n사람들이 뭐라고 부르든, 나는 곽씨네 점소이였다.');
  await G.act3.credits();
}
async function credits() {
  await ctx.part(9, '강호행', '끝');
  set('end'); delete F().awaitingRoadEnding; F().cleared = true; F().ended = true; ctx.goal('');
  await ctx.warp('cheongha', 22.5, 16, 0);
  toast('이야기를 끝냈습니다. 강호를 계속 돌아다닐 수 있습니다.', 5);
}

const job = o => ({ dir: 0, mark: () => true, ...o });
Story.providers.push(function part9p(id) {
  const n = [];
  if (id === 'inn' && at('x2')) SPOTS.forEach(([x, y, name], i) => { if (!F()['xm' + i]) n.push(job({ id: 'xmop' + i, stamp: 'pot', spr: '', x, y, hint: `${name} 닦기`, talk: () => mop(i) })); });
  if (id === 'blackpalace' && at('x4')) n.push(job({ id: 'job_bridge', stamp: 'statue', spr: '', x: 22, y: 20, hint: '다리를 건너기', talk: bridge }));
  return { npcs: n, spots: [], trigs: [], roam: [] };
});
Object.assign(G.act3, { part9, credits });
G.act3t = Object.assign(G.act3t || {}, { lastChoice, deploy, siegeToll, bridge, hall, finale, siege });  // 시험용
