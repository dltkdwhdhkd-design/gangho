// 1부 2장: 강변의 보호세. 떠돌이 수적 패거리와의 동네 소동
import { G, Sound, fadeTo, toast, pick } from './core.js';
import { Story, ctx, say, narr, choice } from './ctx.js';
import { WHO } from './dialog.js';
import { give } from './state.js';
import { FOES } from './foes.js';
import { step, set, at } from './story1.js';

const S = () => G.S, F = () => G.S.flags;
Object.assign(WHO, { pirate: { name: '수적', face: 'Villager3' }, elder: { name: '촌장 어른', face: 'Monk' }, wife: { name: '순이네', face: 'Woman' }, husband: { name: '순이 아버지', face: 'Villager' }, baekrang: { name: '백랑', face: 'Cavegirl' }, wei: { name: '낭리비어 위충', face: 'Paeng' } });
Object.assign(FOES, { smith_ally: { name: '대장장이 강씨', spr: 'chars/Caveman2', hp: 120, atk: 13, def: 4, spd: 48, exp: 0, silver: 0, pause: 1.4, moves: ['slash', 'heavy'], wpn: 'Club' } });

async function wharf() {
  await say('boat', '왔구먼. 팔 다쳤다며? 너구리한테 물렸다고 온 동네에 소문났어.');
  await say('me', '그걸 어떻게 아세요?');
  await say('boat', '이 동네에 비밀이 어딨어. 그보다 저기 좀 봐.');
  await narr('나루 끝에 처음 보는 쾌선 세 척이 묶여 있었다. 돛에 검은 물고기가 그려져 있었다.');
  await say('boat', '검은물고기패여. 강을 떠도는 수적 놈들인디, 어디 큰 산채에도 못 끼는 떨거지들이지. 객잔 타고 열흘도 안 됐는데 벌써 냄새를 맡았구먼.');
  await say('me', '뭐 하러 온 건데요?');
  await say('boat', '뭐 하긴, 뜯어먹으러 왔지.');
  await say('pirate', '어이, 영감. 이 나루는 오늘부터 우리가 지켜 준다. 배 한 척에 은자 두 냥씩 내. 그리고 객잔 터 땅문서도 가져오고.');
  await say('me', '땅문서는 곽 아주머니 거야.');
  await say('pirate', '곽 아주머니? 그 여편네 없어졌다며. 주인 없는 땅은 먼저 먹는 놈이 임자야.');
  F().pirate_met = true;
  const c = await choice('수적이 뱃사공의 멱살을 잡는다.', ['쟁반을 든다', '좋게 말해 본다']);
  if (c === 0) { await say('me', '손 놔. 우리 객잔 단골이야.'); ctx.rep('jeong', 1); }
  else { await say('me', '아주머니 돌아오시면 그때 얘기하세요. 일단 국수라도 드시고 가시죠.'); await say('pirate', '국수? 장난하냐, 이 자식이?'); ctx.rep('sa', 1); }
  await ctx.duel({ foes: ['pirate', 'pirate', 'pirate'], arena: 'dock', title: '검은물고기패', tip: '적이 많을 때는 <b>K 경공</b>으로 빠져나와 한 명씩 상대하세요.' });
  await say('pirate', '크윽… 너 우리 두목이 누군지 모르지? 낭리비어한테 덤빈 거야, 넌.');
  await say('boat', '큰일 났네. 저놈들은 맞으면 더 떼로 몰려와. 촌장 어른이 사람들을 모으고 있으니까 가 보자고.');
  set('s2'); ctx.goal('광장의 촌장 어른과 이야기하기');
}
async function meeting() {
  await say('elder', '다들 모였나. 수적 놈들이 그믐에 다시 오겠다고 기별을 보냈네. 땅문서를 내놓지 않으면 나루를 태우겠다는군.');
  await say('smith', '곽씨 땅을 왜 저놈들이 달라고 합니까?');
  await say('town2', '그냥 줘 버립시다. 사람이 먼저지, 객잔은 이미 타 버렸잖아요.');
  await say('smith', '오늘 땅문서 내주면 내일은 대장간 내놓으라고 할걸요.');
  await say('town', '정천맹에 사람을 보내면 안 됩니까? 강호 질서를 지킨다면서요.');
  await say('elder', '이미 보냈네. 청하진은 맹 관할이 아니니 현령에게 알아보라는 답이 왔어.');
  await say('smith', '현령은 벌써 수적 놈들 돈을 먹었을 텐데요.');
  await say('elder', '자네 생각은 어떤가. 이 마을에서 싸움을 제대로 해 본 사람은 자네뿐일세.');
  const c = await choice('사람들이 모두 나를 본다.', ['싸우자고 한다', '보호세로 시간을 벌자고 한다']);
  if (c === 0) { await say('me', '싸워야죠. 그믐까지 열흘이면 준비할 시간은 있어요.'); await say('town2', '저 많은 수적을 우리가 어떻게 막아요?'); await say('me', '나루 입구만 막으면 한 번에 몇 명밖에 못 들어와요.'); ctx.rep('jeong', 2); }
  else { await say('me', '보호세를 한 번만 내고 시간을 벌죠. 그동안 작살도 만들고 사람도 모으면 돼요.'); await say('smith', '돈 주기는 아깝지만 틀린 말은 아니네.'); S().silver = Math.max(0, S().silver - 15); ctx.rep('sa', 2); }
  await say('elder', '좋네. 그럼 할 일이 많겠군. 강씨랑 순이네, 그리고 저 꼬마 녀석도 자네를 찾던데 한번 가 보게.');
  F().s2_on = true; ctx.goal('대장장이 강씨, 순이네, 꼬마의 부탁 들어주기 (마을의 ! 표시)');
  ctx.note('수적 검은물고기패가 객잔 터 땅문서를 요구한다. 그믐에 다시 온다. 정천맹은 도와주지 않았다.');
}
async function checkAll() {
  if (F().q_smith && F().q_wife && F().q_kid) {
    F().bokun_open = true; set('s3');
    await say('boat', '세 집 일을 다 해결했다고? 장하구먼. 그 나무패 말이여, 복운전이라는 도박장 출입패여. 거기 주인이 강호 소문을 판다더라고.');
    ctx.goal('복운전(광장 남쪽의 주황 지붕)에서 소문 알아보기');
  }
}
async function qSmith() {
  await say('smith', '수적 놈들이 마을 쇠를 다 쓸어 갔다. 나루 창고에 쌓아 놨대. 쇠가 있어야 작살이라도 만들지.');
  await say('me', '지키는 놈은 몇 명이에요?');
  await say('smith', '셋인가 넷인가, 잘 모르겠다.');
  await ctx.duel({ foes: ['pirate', 'pirate', 'pirate_bow'], arena: 'dock', title: '나루 창고', tip: '활을 든 적은 가만히 있으면 맞습니다. 좌우로 움직이며 다가가세요.' });
  give('ore_iron', 4); F().q_smith = true;
  await say('smith', '이 정도면 작살 열 자루는 나온다. 뱃사람들 손에 쥐여 줘야지. 네 칼은 따로 챙겨 줄 테니까 일단 살아서 와.');
  await checkAll();
}
async function qWife() {
  await say('wife', '우리 집 양반이 수적 배에 끌려갔어요. 노 저을 사람이 모자란다고요. 순이가 밤마다 아버지를 찾아요.');
  await say('me', '배가 어디 있어요?');
  await say('wife', '나루 아래쪽 갈대밭에요. 밤에 불 끄고 대 놓는대요. 제발 부탁드려요. 모아 둔 돈이 조금 있어요.');
  await say('me', '돈은 넣어 두세요. 제가 찾아볼게요.');
  await narr('밤에 갈대밭으로 갔다. 배 위에서 코 고는 소리가 났다.');
  await ctx.duel({ foes: ['pirate_hook', 'pirate', 'pirate'], arena: 'dock', title: '갈대밭의 배' });
  await say('husband', '살았다, 살았어… 고맙네. 그런데 이보게, 땅문서는 핑계야. 배 밑에 있을 때 들었는데 저놈들이 객잔 우물 얘기를 하더라고.');
  await say('me', '우물이요?');
  await say('husband', '얼굴 가린 손님이 그 우물을 찾아 주면 은자 천 냥을 주기로 했다는 거야. 뭐가 있길래 그러는지 원.');
  ctx.note('순이 아버지: 수적이 찾는 것은 땅문서가 아니라 객잔 우물이다. 얼굴을 가린 손님이 은자 천 냥을 약속했다.');
  F().q_wife = true; await say('wife', '여보! 살아 있었구나! …저기, 정말 돈은 안 받으실 거예요?'); await say('me', '네, 괜찮아요.'); ctx.rep('jeong', 1);
  await checkAll();
}
async function qKid() {
  await say('kid', '아저씨, 저 좀 숨겨 주세요. 수적 아저씨 주머니에서 뭘 좀 꺼냈는데 지금 쫓아와요.');
  await say('me', '그걸 왜 꺼냈어.');
  await say('kid', '저도 강호인 될 거예요. 강호인은 원래 남의 물건 가져가잖아요.');
  await say('me', '그건 도둑이야.');
  await say('pirate', '이 꼬맹이 어디 갔어! 내 패 내놔!');
  await ctx.duel({ foes: ['pirate', 'pirate'], arena: 'village', title: '꼬마를 지켜라' });
  await say('kid', '와, 진짜 멋있다. 이거 아저씨 가져요. 복(福) 자가 새겨진 나무패인데요, 복운전이라는 도박장 출입패래요.');
  await say('me', '다음부터 남의 주머니에 손대지 마.');
  await say('kid', '네! 근데 쟁반 던지는 거 가르쳐 주세요.');
  F().q_kid = true; await checkAll();
}
async function gamble() {
  let win = 0;
  for (let i = 0; i < 3; i++) {
    const c = await choice(`${i + 1}판째. 주사위 통이 멈췄다. 이긴 판 ${win}`, ['홀', '짝']);
    const r = Math.random() < .5 ? 0 : 1; if (r === c) { win++; Sound.sfx('coin'); await say('baekrang', '맞았네요.'); } else await say('baekrang', '아쉬워라.');
  }
  return win;
}
async function baekrang() {
  await say('baekrang', '어머, 이게 누구야. 우리 점소이 아니에요? 한판 하러 왔어요, 소문 사러 왔어요?');
  await say('me', '검은물고기패가 왜 객잔 우물을 찾는지 알고 싶어요.');
  await say('baekrang', '그건 은자 서른 냥이에요. 돈 없으면 홀짝 세 판 해요. 두 판 이기면 그냥 알려 주고, 지면 내 심부름 하나 해 주고.');
  const c = await choice('백랑이 주사위를 굴린다.', ['은자 서른 냥을 낸다', '홀짝을 한다']);
  if (c === 0 && S().silver >= 30) { S().silver -= 30; Sound.sfx('coin'); }
  else {
    const w = await gamble();
    if (w < 2) { await say('baekrang', '졌네요. 그럼 저기 저 손님 좀 내보내 줘요. 석 달째 외상만 긋거든요. 그런 거 잘한다면서요.'); await say('me', '어딜 가나 이 일이네.'); await ctx.duel({ foes: ['pirate_hook'], arena: 'room', title: '외상 손님' }); await say('baekrang', '어머, 잘하네요.'); }
    else await say('baekrang', '운이 좋네요. 그럼 그냥 알려 줄게요.');
  }
  await say('baekrang', '두목 위충은 어디에도 못 낀 떠돌이예요. 강호 큰 어른들은 이런 시골 나루에 관심도 없고요.');
  await say('me', '그럼 위충한테 돈을 준 건 사파예요?');
  await say('baekrang', '아니요. 정파도 아니에요.');
  await say('me', '그럼 누구예요?');
  await say('baekrang', '그건 저도 입에 못 올려요. 그 이름 잘못 꺼냈다가 혀 잘린 사람이 있거든요. 강호에 정파랑 사파만 있는 건 아니라는 정도만 알아 둬요.');
  await say('baekrang', '그믐에 위충이 직접 올 거예요. 물 위에서 싸우면 못 이기니까 나루로 끌어내요.');
  await say('me', '왜 도와주세요?');
  await say('baekrang', '수적이 나루를 먹으면 우리 손님이 줄거든요. 그리고 곽 아주머니 국수를 좋아했어요.');
  F().demon_hint = true; ctx.rep('sa', 1); ctx.note('백랑: 우물을 찾는 손님은 정파도 사파도 아니다. 강호에는 세 번째 길이 있다.');
  set('s4'); ctx.goal('준비를 마치고 광장의 촌장 어른에게 말하기 (그믐밤 시작)');
}
async function newmoon() {
  const a = await choice('그믐밤을 맞을까? 전투가 세 번 이어진다.', ['시작한다', '조금 더 준비한다'], 'elder'); if (a) return;
  F().night = true; G.field.load('cheongha', 22.5, 24, 3); Sound.bgm('dark');
  await narr('그믐이 왔다. 달이 없는 캄캄한 밤, 강 위로 횃불이 줄지어 올라왔다.');
  await say('smith', '작살 들어! 맨 앞은 내가 선다!');
  await say('boat', '이놈들아, 내 나루에서 썩 꺼져!');
  await ctx.duel({ foes: ['pirate', 'pirate', 'pirate', 'pirate'], allies: ['smith_ally'], arena: 'yard', bgm: 'fight', title: '객잔 터 방어전' });
  await say('me', '아직 안 끝났어요. 배가 또 와요!');
  await ctx.duel({ foes: ['pirate_hook', 'pirate_hook', 'pirate_bow', 'pirate_bow'], allies: ['smith_ally'], arena: 'dock', bgm: 'fight', title: '나루 끝에서' });
  await say('wei', '점소이 하나 때문에 배를 세 번이나 띄웠다. 내 체면이 뭐가 되냐.');
  await say('me', '땅문서는 없어. 우물도 네 것이 아니고. 돌아가.');
  await say('wei', '하나만 묻자. 관아가 걷으면 세금이고, 큰 문파가 걷으면 의연금이고, 내가 걷으면 약탈이냐?');
  await say('me', '그래서 남의 마을을 태우겠다고?');
  await say('wei', '말로는 안 되겠군. 덤벼라.');
  await ctx.duel({ foes: ['wei'], arena: 'dock', bgm: 'boss', title: '낭리비어 위충' });
  await say('wei', '졌다. 제대로 배운 것 같지도 않은 놈한테.');
  await say('me', '우물은 왜 찾은 거야.');
  await say('wei', '나도 몰라. 얼굴 가린 손님이 돈을 미리 줬어. 그 돈 없으면 우리 애들 서른이 굶는다.');
  const c = await choice('위충이 칼을 내려놓는다.', ['살려서 보낸다', '포박해 관아로 넘긴다']);
  if (c === 0) { await say('me', '가. 다시는 이 나루에 오지 마.'); await say('wei', '이 빚은 잊지 않으마, 점소이.'); F().wei_spared = true; ctx.rep('sa', 3); }
  else { await say('elder', '현령이 제대로 처리할지는 모르겠네만, 그래도 법대로 해야지.'); await say('wei', '사흘이면 풀려날 거다. 그래도 네 뜻은 알겠다.'); ctx.rep('jeong', 3); }
  await fadeTo(1); F().night = false; G.field.load('cheongha', 21, 16, 0); await fadeTo(0);
  await say('elder', '다들 고생했네. 죽은 사람이 없다니 천만다행일세.');
  await say('yun', '다친 사람이 열세 명이에요. {나} 씨까지 열네 명이고요. 팔 줘 봐요.');
  await say('town2', '국수라도 끓일까요? 곽씨 솜씨는 안 나겠지만.');
  await say('me', '네, 많이 끓여 주세요.');
  await narr('그날 청하진 사람들은 객잔 터에 모여 국수를 먹었다. 곽 아주머니 맛은 아니었지만 아무도 뭐라고 하지 않았다.');
  await say('boat', '이제 어디로 갈 거여?');
  await say('me', '곽 아주머니를 찾아야죠. 흑의인들이 간 동쪽으로 가 볼게요.');
  ctx.silver(60); F().pass_open = true; F().fort_open = false; F().s4_done = true;
  set('c1e'); ctx.goal('대장간에서 무기를 구하고, 동쪽 산길로 가기');
}

Story.providers.push(function content5(id) {
  const n = [], tr = [];
  if (id === 'cheongha') {
    if (at('s1')) tr.push({ x: 19, y: 25, w: 8, h: 4, when: () => at('s1'), run: wharf });
    if (at('s2', 's3', 's4')) n.push({ id: 'elder', spr: 'Monk', x: 23.5, y: 18.4, dir: 2, mark: () => (at('s2') && !F().s2_on) || at('s4'), talk: async () => { if (at('s2') && !F().s2_on) await meeting(); else if (at('s4')) await newmoon(); else await say('elder', '서두르게. 그믐이 오고 있네.'); } });
    if (at('s2') && F().s2_on) {
      if (!F().q_smith) n.push({ id: 'q_smith', spr: 'Caveman2', x: 10, y: 17.6, dir: 3, mark: () => true, talk: qSmith });
      if (!F().q_wife) n.push({ id: 'q_wife', spr: 'Woman', x: 34, y: 17.4, dir: 2, mark: () => true, talk: qWife });
      if (!F().q_kid) n.push({ id: 'q_kid', spr: 'Child', x: 30, y: 24.5, dir: 2, mark: () => true, talk: qKid });
    }
  }
  if (id === 'bokun') n.push({ id: 'baekrang', spr: 'Cavegirl', x: 7, y: 5.6, dir: 0, mark: () => at('s3'), talk: async () => { if (at('s3')) await baekrang(); else await say('baekrang', '또 놀러 와요.'); } });
  return { npcs: n, spots: [], trigs: tr, roam: [] };
});
