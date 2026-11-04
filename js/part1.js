// 1부 2장: 강변의 보호세. 떠돌이 수적 패거리와의 동네 소동
import { G, Sound, fadeTo, toast, pick } from './core.js';
import { Story, ctx, say, narr, choice } from './ctx.js';
import { WHO } from './dialog.js';
import { give } from './state.js';
import { FOES } from './foes.js';
import { step, set, at } from './story1.js';

const S = () => G.S, F = () => G.S.flags;
Object.assign(WHO, { pirate: { name: '수적', face: 'Villager3' }, elder: { name: '훈장 어른', face: 'Monk' }, wife: { name: '순이네', face: 'Woman' }, husband: { name: '순이 아버지', face: 'Villager' }, baekrang: { name: '백랑', face: 'Cavegirl' }, wei: { name: '낭리비어 위충', face: 'Paeng' } });
Object.assign(FOES, { smith_ally: { name: '철 대장장이', spr: 'chars/Caveman2', hp: 120, atk: 13, def: 4, spd: 48, exp: 0, silver: 0, pause: 1.4, moves: ['slash', 'heavy'], wpn: 'Club' } });

async function wharf() {
  await say('boat', '왔구나. 팔 다쳤다는 얘기는 들었다. 너구리한테 물렸다며.');
  await say('me', '그걸 어떻게 아세요.');
  await say('boat', '청하진에서 비밀이 제일 오래 간 게 한나절이다. 그건 됐고, 저기 봐라.');
  await narr('나루 끝에 처음 보는 쾌선 세 척이 묶여 있었다.\n돛에 검은 물고기가 그려져 있었다.');
  await say('boat', '검은물고기패다. 강을 떠도는 수적 패거리지. 큰 산채에도 못 끼는 놈들인데, 객잔이 타고 열흘도 안 돼서 왔다.');
  await say('me', '뭘 하러 왔는데요?');
  await say('boat', '저놈들이 오면 하는 일은 하나다.');
  await say('pirate', '어이, 노인장. 이 나루는 오늘부터 우리가 지켜 준다. 배 한 척에 은자 두 냥. 그리고 객잔 터 땅문서도 가져와.');
  await say('me', '땅문서요? 그건 곽 아주머니 거예요.');
  await say('pirate', '곽 아주머니? 없잖아. 없는 사람 땅은 강물 같은 거야. 먼저 뜨는 놈이 임자지.');
  F().pirate_met = true;
  const c = await choice('수적이 뱃사공의 멱살을 잡는다.', ['쟁반을 든다', '좋게 말해 본다']);
  if (c === 0) { await say('me', '손 놓으시죠. 그분 저희 집 단골이에요.'); ctx.rep('jeong', 1); }
  else { await say('me', '아주머니 돌아오시면 같이 얘기하시죠. 국수라도 한 그릇 드릴게요.'); await say('pirate', '국수? 우리 형제가 몇인 줄 알고?'); ctx.rep('sa', 1); }
  await ctx.duel({ foes: ['pirate', 'pirate', 'pirate'], arena: 'dock', title: '검은물고기패', tip: '적이 많을 때는 <b>K 경공</b>으로 빠져나와 한 명씩 상대하세요.' });
  await say('pirate', '크윽… 네놈, 우리 두목 낭리비어를 모르는구나. 두목께 전하마.');
  await say('boat', '큰일이다. 저놈들은 맞으면 더 많이 돌아온다. 훈장 어른이 사람들을 모으고 계신다. 가 보자.');
  set('s2'); ctx.goal('광장의 훈장 어른과 이야기하기');
}
async function meeting() {
  await say('elder', '다 모였나. 수로채에서 통지가 왔네. 그믐에 다시 온다고. 땅문서를 내놓지 않으면 나루를 태우겠다는군.');
  await say('smith', '곽 아주머니 땅을 왜 저놈들이 달라고 하는 겁니까.');
  await say('town2', '그냥 내줍시다. 사람이 먼저지요. 객잔은 이미 탔잖아요.');
  await say('smith', '오늘 땅문서를 주면 내일은 대장간을 달라고 합니다.');
  await say('town', '정천맹에 사람을 보내면 안 됩니까? 그 사람들이 강호 질서를 지킨다면서요.');
  await say('elder', '보냈네. 답이 왔어. “청하진은 맹의 관할이 아니니 현령에게 알아보라”더군.');
  await say('smith', '현령은 벌써 수로채에 돈을 먹었고요.');
  await say('elder', '자네 생각은 어떤가. 이 마을에서 전쟁을 치러 본 사람은 자네뿐이니.');
  const c = await choice('사람들이 모두 나를 본다.', ['싸우겠습니다', '보호세로 시간을 벌겠습니다']);
  if (c === 0) { await say('me', '그믐까지 열흘이에요. 군막에서는 사흘 주고 성을 지키라고 했습니다.'); await say('town2', '그래서 지켰어요?'); await say('me', '저는 살았습니다.'); ctx.rep('jeong', 2); }
  else { await say('me', '보호세를 한 번만 내서 열흘을 법시다. 외상 손님은 그렇게 상대해요. 일단 드시게 하고, 그동안 문을 잠그는 거예요.'); await say('smith', '장사꾼 같은 소리인데 틀린 말은 아니군.'); S().silver = Math.max(0, S().silver - 15); ctx.rep('sa', 2); }
  await say('elder', '좋네. 그럼 할 일이 많아. 철 대장장이, 순이네, 그리고 저 꼬마까지 다들 자네를 찾더군.');
  F().s2_on = true; ctx.goal('철 대장장이, 순이네, 꼬마의 부탁 들어주기 (마을의 ! 표시)');
  ctx.note('수적 검은물고기패가 객잔 터 땅문서를 요구한다. 그믐에 다시 온다. 정천맹은 도와주지 않았다.');
}
async function checkAll() {
  if (F().q_smith && F().q_wife && F().q_kid) {
    F().bokun_open = true; set('s3');
    await say('boat', '세 집 일을 다 해결했다고? 나보다 낫구나. 그 나무패 말이다, 복운전 표다. 밤에만 불이 켜지는 도박장이지. 거기 주인이 소문을 판다더라.');
    ctx.goal('복운전(광장 남쪽의 주황 지붕)에서 소문 알아보기');
  }
}
async function qSmith() {
  await say('smith', '수적 놈들이 쇠를 쓸어 갔다. 나루 창고에 쌓아 놨대. 쇠가 있어야 작살이라도 만들지.');
  await say('me', '창고요? 지키는 사람은요?');
  await say('smith', '셋. 넷일 수도 있고. 나는 쇠만 세지 사람은 안 세서.');
  await ctx.duel({ foes: ['pirate', 'pirate', 'pirate_bow'], arena: 'dock', title: '나루 창고', tip: '활을 든 적은 가만히 있으면 맞습니다. 좌우로 움직이며 다가가세요.' });
  give('ore_iron', 4); F().q_smith = true;
  await say('smith', '이걸로 작살 열 자루는 나온다. 뱃사람들 손에 쥐여 주마. 네 칼은 동쪽 산길 갈 때 따로 챙겨 줄 테니 살아서 와라.');
  await checkAll();
}
async function qWife() {
  await say('wife', '우리 집 양반이 수적 배에 끌려갔어요. 노 저을 사람이 모자란다고… 순이가 밤마다 아버지를 찾아요.');
  await say('me', '배가 어디 있어요?');
  await say('wife', '나루 아래쪽 갈대밭에요. 불을 끄고 대 놓는대요. 부탁드려요. 약값으로 모아 둔 은자가 조금 있어요.');
  await say('me', '은자는 넣어 두세요. 순이 국수 값은 곽 아주머니가 받으실 거예요.');
  await narr('밤, 갈대밭. 배 위에서 코 고는 소리가 났다.');
  await ctx.duel({ foes: ['pirate_hook', 'pirate', 'pirate'], arena: 'dock', title: '갈대밭의 배' });
  await say('husband', '살았다… 고맙네. 들어 보게. 땅문서 타령은 핑계야. 배 밑에서 들었는데 저놈들 객잔 우물 얘기를 하더군.');
  await say('me', '우물이요?');
  await say('husband', '얼굴을 가린 손님이 그걸 찾아 주면 은자 천 냥을 주기로 했대. 뭐가 있길래 그 난리인지.');
  ctx.note('순이 아버지: 수적이 찾는 것은 땅문서가 아니라 객잔 우물이다. 얼굴을 가린 손님이 은자 천 냥을 약속했다.');
  F().q_wife = true; await say('wife', '당신! 살아 있었구나! 이 사람아, 그 은자는 정말 안 받아요?'); await say('me', '네. 나중에 객잔 다시 열면 단골 해 주세요.'); ctx.rep('jeong', 1);
  await checkAll();
}
async function qKid() {
  await say('kid', '저기요. 제가 수적 아저씨 주머니에서 뭘 좀 꺼냈거든요. 지금 쫓겨요.');
  await say('me', '그걸 왜 꺼냈어.');
  await say('kid', '쟁반 던지는 거 보고 저도 강호인이 되려고요. 강호인은 원래 남의 물건을 가져가잖아요.');
  await say('me', '그건 수적이야. 강호인이 아니라.');
  await say('pirate', '이 꼬맹이 어디 갔어! 내 패 내놔!');
  await ctx.duel({ foes: ['pirate', 'pirate'], arena: 'village', title: '꼬마를 지켜라' });
  await say('kid', '와… 진짜 멋있다. 이거 드릴게요. 복(福) 자가 새겨진 나무패예요. 밤에만 불 켜지는 집 문패랑 똑같아요.');
  await say('me', '다음부터 주머니에 손 넣지 마. 손 잘린다.');
  await say('kid', '네. 대신 쟁반 던지는 법 가르쳐 주세요.');
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
  await say('baekrang', '어서 와요. 점소이가 여기를 다 오네. 한 판 하러 왔어요, 소문 사러 왔어요?');
  await say('me', '검은물고기패가 왜 객잔 우물을 찾는지 알고 싶어요.');
  await say('baekrang', '소문은 공짜가 없어요. 은자 서른 냥. 돈이 없으면 홀짝 세 판. 두 판 이기면 공짜, 지면 내 심부름 하나.');
  const c = await choice('백랑이 주사위를 굴린다.', ['은자 서른 냥을 낸다', '홀짝을 한다']);
  if (c === 0 && S().silver >= 30) { S().silver -= 30; Sound.sfx('coin'); }
  else {
    const w = await gamble();
    if (w < 2) { await say('baekrang', '졌네요. 저기 저 손님, 석 달째 외상이에요. 좀 내보내 줘요. 잘하잖아요, 그런 거.'); await say('me', '…이 일은 어딜 가나 똑같네.'); await ctx.duel({ foes: ['pirate_hook'], arena: 'room', title: '외상 손님' }); await say('baekrang', '역시 전문가네요.'); }
    else await say('baekrang', '운이 좋네요. 공짜로 드릴게요. 이런 날은 잘 없어요.');
  }
  await say('baekrang', '두목 위충은 어디에도 끼지 못한 떠돌이예요. 이런 시골 나루 일에 강호의 큰 어른들은 관심도 없고요.');
  await say('me', '그럼 위충에게 은자를 준 손님은 어느 쪽 사람이에요? 사파요?');
  await say('baekrang', '아니에요. 정파도 아니고.');
  await say('me', '정파도 사파도 아니면 누구예요?');
  await say('baekrang', '강호에는 길이 둘 있다고들 하죠. 사실은 셋이에요. 세 번째 길의 이름을 입에 올리면 혀가 잘려요. 나는 혀로 먹고사는 사람이고.');
  await say('baekrang', '그믐에 위충이 직접 와요. 물 위에서는 못 이겨요. 나루로 끌어내요.');
  await say('me', '왜 도와주세요?');
  await say('baekrang', '수적이 나루를 먹으면 우리 손님이 줄어요. 장사예요. 그리고 곽 아주머니 국수는 맛있었고.');
  F().demon_hint = true; ctx.rep('sa', 1); ctx.note('백랑: 우물을 찾는 손님은 정파도 사파도 아니다. 강호에는 세 번째 길이 있다.');
  set('s4'); ctx.goal('준비를 마치고 광장의 훈장 어른에게 말하기 (그믐밤 시작)');
}
async function newmoon() {
  const a = await choice('그믐밤을 맞을까? 전투가 세 번 이어진다.', ['시작한다', '조금 더 준비한다'], 'elder'); if (a) return;
  F().night = true; G.field.load('cheongha', 22.5, 24, 3); Sound.bgm('dark');
  await narr('그믐. 달이 없는 밤이다.\n강 위로 횃불이 줄지어 올라왔다.');
  await say('smith', '작살 들어라! 맨 앞은 내가 선다!');
  await say('boat', '이놈들아, 내 나루에서 나가라!');
  await ctx.duel({ foes: ['pirate', 'pirate', 'pirate', 'pirate'], allies: ['smith_ally'], arena: 'yard', bgm: 'fight', title: '객잔 터 방어전' });
  await say('me', '이게 끝이 아니에요. 배가 또 와요!');
  await ctx.duel({ foes: ['pirate_hook', 'pirate_hook', 'pirate_bow', 'pirate_bow'], allies: ['smith_ally'], arena: 'dock', bgm: 'fight', title: '나루 끝에서' });
  await say('wei', '점소이 하나 때문에 배를 세 번 띄웠다. 내 얼굴이 뭐가 되나.');
  await say('me', '땅문서는 없어요. 우물도 없고요. 돌아가세요.');
  await say('wei', '하나만 묻자. 관아가 걷으면 세금이고, 큰 문파가 걷으면 의연금이고, 내가 걷으면 약탈이냐?');
  await say('me', '…맞는 말이어도 멱살은 잡지 마세요.');
  await say('wei', '하하! 객잔 물을 먹어서 말은 잘하는군. 칼로 들어 보자.');
  await ctx.duel({ foes: ['wei'], arena: 'dock', bgm: 'boss', title: '낭리비어 위충' });
  await say('wei', '…졌다. 배운 적도 없는 놈한테.');
  await say('me', '우물은 왜 찾은 거예요.');
  await say('wei', '나도 모른다. 얼굴 가린 손님이 은자를 미리 줬다. 그 돈 없으면 내 형제 서른이 굶는다. 강은 인심이 없어.');
  const c = await choice('위충이 칼을 내려놓는다.', ['살려서 보낸다', '포박해 관아로 넘긴다']);
  if (c === 0) { await say('me', '가세요. 다시는 나루에 오지 말고요.'); await say('wei', '빚은 갚는 게 강의 법이다. 언젠가 물 위에서 보자, 점소이.'); F().wei_spared = true; ctx.rep('sa', 3); }
  else { await say('elder', '현령이 받아 줄지는 모르겠네만 그게 법이지.'); await say('wei', '법이라. 사흘이면 나온다. 그래도 네 뜻은 알겠다.'); ctx.rep('jeong', 3); }
  await fadeTo(1); F().night = false; G.field.load('cheongha', 21, 16, 0); await fadeTo(0);
  await say('elder', '이긴 건가. 살아 있으니 이긴 거겠지.');
  await say('yun', '다친 사람 열세 명, 죽은 사람 없음. 장부에 적었어요. 당신은 열네 번째고요. 팔 내밀어요.');
  await say('town2', '국수라도 끓일까요. 곽 아주머니 솜씨는 안 나겠지만.');
  await say('me', '…네. 많이 끓여 주세요.');
  await narr('그날 청하진 사람들은 객잔 터에서 국수를 먹었다.\n맛은 달랐다.\n모두가 그 말을 하지 않았다.');
  await say('boat', '이제 어디로 갈 거냐.');
  await say('me', '수적은 물러갔지만 곽 아주머니는 아직 못 찾았어요. 흑의인이 간 동쪽으로 가야죠.');
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
  if (id === 'bokun') n.push({ id: 'baekrang', spr: 'Cavegirl', x: 7, y: 5.6, dir: 0, mark: () => at('s3'), talk: async () => { if (at('s3')) await baekrang(); else await say('baekrang', '소문은 신선할 때 파는 거예요. 또 오세요.'); } });
  return { npcs: n, spots: [], trigs: tr, roam: [] };
});
