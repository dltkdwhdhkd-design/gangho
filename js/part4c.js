// 제4부 정파 길에 장 둘을 더한다(줄거리 문서 4부 3장 피난민, 5장 하오문)
// 피난민: 증거 모으기(jg1)의 네 번째 일. 윤설의 야전 의원, 청하진 소식, 정천맹 징발대(사파를 치러 간 정파가 피난민 쌀을 걷는다)
// 하오문: 증거를 다 모은 밤, 움막이 팔린다. 첫 패전과 철우의 부상. 판 사람은 정파 쪽이었다
import { G, fadeTo } from './core.js';
import { Story, ctx, say, narr, choice } from './ctx.js';
import { WHO } from './dialog.js';
import { FOES } from './foes.js';
import { at } from './story1.js';

const F = () => G.S.flags;
Object.assign(WHO, {
  refugee: { name: '피난 온 아낙', face: 'Woman' }, rf_boy: { name: '피난 온 아이', face: 'Child' },
  levy: { name: '정천맹 징발관', face: 'Knight' }, manhwa: WHO.manhwa || { name: '만화부인', face: 'Woman' },
  baekrang: WHO.baekrang || { name: '백랑', face: 'Cavegirl' },
});
Object.assign(FOES, {
  levy: { name: '정천맹 징발관', spr: 'chars/Knight', hp: 1100, atk: 36, def: 11, spd: 64, exp: 160, silver: 40, pause: 1, moves: ['lunge', 'quick', 'flurry'], wpn: 'Sword', guard: .6, elite: 1, poise: 110 },
  hao_cut: { name: '하오문 살수', spr: 'chars/DarkNinja', hp: 520, atk: 40, def: 9, spd: 84, exp: 60, silver: 15, pause: .9, moves: ['quick', 'blink', 'dart3'], wpn: 'Ninjaku' },
  hao_lady: { name: '만화부인', spr: 'chars/Woman', hp: 4200, atk: 52, def: 14, spd: 82, exp: 0, silver: 0, pause: .85, moves: ['quick', 'dart3', 'blink', 'flurry', 'fan5'], wpn: 'Ninjaku', boss: 1, poise: 200 },
});

// ── 4부 3장 피난민 ──
export async function refugees() {
  await ctx.chap(4, '쫓기는 몸', '피난민');
  await narr('사흘 사이에 청풍골 아래 강가에 움막이 서른 채로 늘었다. 강 건너 전쟁터에서 밀려온 사람들이었다. 윤설이 사냥꾼 움막 앞에 거적을 깔고 약상자를 열었다.');
  await say('yun', '줄 세워요. 피 나는 사람 먼저, 열 나는 아이 다음, 배고픈 사람은 그다음이요. 배고픈 건 안 죽어요. 오늘은요.');
  await say('me', '저는 뭘 하면 돼요?');
  await say('yun', '물 끓여요. 계속. 그리고 손 씻어요. 칼 만진 손으로 붕대 만지지 말고요.');
  await narr('해가 질 때까지 물을 끓였다. 윤설은 화살촉을 열한 개 뽑았고, 다리 하나를 잘랐다. 자르기 전에 그 사내에게 이름을 묻고, 자른 뒤에도 그 이름으로 불렀다.');
  await say('refugee', '청하진에서 왔수. 아니, 청하진 지나서 왔지. 거기도 이제 사람이 반밖에 없어.');
  await say('me', '청하진이요? 나루 객잔 터는요?', 'b');
  await say('refugee', '객잔 터? 비단옷 입은 사람들이 와서 울타리를 쳤어. 밤마다 뒷마당 우물을 판다고. 물 나오는 우물을 왜 파는지 몰라.');
  if (F().l_deed) await narr('객잔 땅을 백 냥에 사겠다던 비단옷 손님. 쇠 뚜껑 우물을 묻던 그 얼굴이 생각났다.');
  await say('refugee', '아, 그리고 대장장이 강씨가 그러더라. 곽씨 아줌마 태운 배가 남쪽 물안개 쪽으로 가는 걸 본 사람이 있대. 그쪽은 배가 안 들어가는 데라는데.');
  await say('me', '……남쪽 물안개.', 's');
  ctx.note('청하진 피난민: 객잔 터에 비단옷들이 울타리를 치고 밤마다 우물을 판다. 곽 아주머니를 태운 배가 남쪽 물안개 쪽으로 가는 걸 본 사람이 있다.');
  await narr('밤이 되자 강둑 위로 횃불이 줄지어 내려왔다. 정천맹 깃발이었다. 피난민들이 반가워서 일어서다가, 수레를 보고 다시 앉았다.');
  await say('levy', '정천맹 군량 징발이다! 쌀이 있는 집은 다 내놔라. 흑도맹을 치는 데 쓰는 쌀이다. 너희를 지키는 데 쓰는 거다.');
  await say('refugee', '이건 강 건너서 지고 온 씨나락이에요. 이거 뺏기면 내년엔……', 's');
  await say('levy', '내년? 흑도맹이 이기면 내년은 없다.');
  await say('yun', '{나}, 저 사람은 다쳐도 안 고쳐 줄 거예요.', 'a');
  await ctx.duel({ foes: ['levy', 'jeong_guard', 'jeong_guard'], arena: G.field.m.arena, bgm: 'fight', title: '정천맹 징발대', optional: true });
  await say('levy', '……역적 놈이 여기 숨어 있었구나. 맹에 보고하겠다.');
  const c = await choice('징발관이 쓰러진 채 이쪽을 노려본다. 피난민들이 수레의 쌀가마를 끌어내리고 있다.', ['쌀만 두고 보내 준다', '수레까지 빼앗고 쫓아낸다']);
  if (c === 0) { await say('me', '쌀은 두고 가요. 보고는 하고 싶은 대로 하세요. 어차피 제 얼굴은 나루마다 붙어 있으니까.'); await say('levy', '……흑도맹이나 너나 다를 게 없다.'); ctx.rep('jeong', 1); }
  else { await say('me', '수레도 두고 가요. 씨나락 실을 데가 없대요.'); await narr('징발대는 빈손으로 강둑을 올라갔다. 피난민 몇이 수레를 끌어다 씨나락을 실었다. 누가 먼저랄 것도 없이 다들 나한테 고개를 숙였다.'); ctx.rep('jeong', 2); ctx.rep('sa', 1); }
  await say('rf_boy', '아저씨, 아저씨도 사파예요?');
  await say('me', '아니.');
  await say('rf_boy', '그럼 정파예요? 정파가 쌀 가져갔는데.');
  await say('me', '……점소이야.', 's');
  F().jg_refuge = true;
  ctx.note('정천맹 징발대가 피난민의 씨나락을 걷으러 왔다. 흑도맹을 치러 간 정파가 피난민 쌀부터 걷는다.');
}

// ── 4부 5장 하오문: 증거를 다 모은 밤 ──
export async function haomunNight() {
  await ctx.chap(4, '쫓기는 몸', '팔린 움막');
  await narr('증거 셋을 다 모은 밤이었다. 넷이 움막에 둘러앉아 내일 혜각 대사를 찾아갈 길을 정하는데, 철우가 먼저 고개를 들었다.');
  await say('cheol', '시주들, 개가 안 짖소.', 'b');
  await narr('사냥꾼 호씨의 개는 바람만 불어도 짖었다. 그 개가 조용했다. 움막 거적이 칼에 갈라졌다.');
  await say('manhwa', '어머, 넷이 다 있네. 값을 한 번에 받겠어요.', 'h');
  await ctx.duel({ foes: ['hao_lady', 'hao_cut', 'hao_cut', 'hao_cut'], allies: ['cheol_ally'], arena: G.field.m.arena, bgm: 'boss', title: '하오문 · 만화부인', survive: 35, tip: '이길 수 없는 싸움입니다. 35초를 버티세요.' });
  await narr('버틴 게 아니었다. 만화부인이 봐준 거였다. 살수 하나가 내 등 뒤로 들어온 걸 철우가 몸으로 막았다. 칼이 철우의 옆구리로 들어갔다가 나왔다.');
  await say('cheol', '……괜찮소. 소승은 살이 많아서.', 's');
  await say('yun', '말하지 마요! 누워요, 지금!', 'a');
  await say('manhwa', '죽이라는 값은 안 받았어요. 겁만 주라는 값이었죠. 증거를 들고 회관에 나타나지 말라는 경고요.');
  await say('so', '누가 냈는데.', 'a');
  await say('manhwa', '그건 다른 값이에요.');
  await narr('만화부인이 손을 들자 살수들이 어둠으로 물러났다. 마지막으로 남은 하나가 복면을 내렸다. 여자였다.');
  await say('baekrang', '값은 내가 대신 말해 줄게요. 공짜로. 이 움막 자리를 판 건 정천맹 사람이에요. 세가 거리 동문 순찰대장. 은자 서른 냥.', 's');
  await say('me', '왜 알려 줘요?');
  await say('baekrang', '하오문은 사람을 팔아요. 근데 자기 편을 파는 놈은 값을 못 쳐줘요. 그런 놈은 다음엔 우리를 파니까.');
  await say('manhwa', '백랑, 말이 많구나.');
  await say('baekrang', '단골 만들려고요, 문주님. 이 사람 오래 살 것 같거든요.', 'h');
  await narr('둘이 사라지고 나서야 손이 떨렸다. 처음으로 졌다. 칼을 쥐고도 아무것도 지키지 못했다. 철우의 피가 윤설의 소매를 타고 내려왔다.');
  await say('yun', '살아요. 살릴 거예요. 그러니까 그런 얼굴 하지 마요.', 's');
  await say('cheol', '시주…… 내일 회관엔 소승이 업혀서라도 가겠소. 소승이 문을 부수고 나온 절 어른들이오. 소승 얼굴을 봐야 시주 말도 좀 들을 거요.', 's');
  F().jg_hao = true; F().cheol_hurt = true;
  ctx.note('하오문 만화부인에게 처음으로 졌다. 철우가 옆구리를 찔렸다. 움막 자리를 판 사람은 정천맹 세가 거리 동문 순찰대장이었다. 백랑이 공짜로 알려 주었다.');
}

Story.providers.push(function part4c(id) {
  const n = [];
  if (id === 'valley' && at('jg1') && !F().jg_refuge) n.push({ id: 'refugee', spr: 'Woman', x: 24, y: 17, dir: 1, hint: '피난민 움막', mark: () => true, talk: refugees });
  return { npcs: n, spots: [], trigs: [], roam: [] };
});
