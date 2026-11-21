// 제5부 정파 길 '오독문'(줄거리 문서 5부 2장): 흑도맹 거두 셋을 막은 뒤, 흑풍채에 가기 전에 남쪽 늪의 오독문에 들른다
// 당가 토벌대가 이십 년 묵은 누명(사마웅 형제 독살)을 핑계로 오독문을 쓸어버리러 간다. 당소연이 가문과 독고 기록 사이에서 고른다
// 남화가 오독문 이름으로 증언해 주면, 패천도 담판(part4.js samaungTalk)에서 그 말이 더해진다
import { G, fadeTo } from './core.js';
import { Story, ctx, say, narr, choice } from './ctx.js';
import { WHO } from './dialog.js';
import { FOES } from './foes.js';
import { at } from './story1.js';

const F = () => G.S.flags;
Object.assign(WHO, { dang_elder: { name: '당가 장로 당철', face: 'Dang' }, odok_man: { name: '오독문 독인', face: 'GreenNinja' } });
const foe = (name, spr, hp, atk, def, spd, exp, silver, pause, moves, o = {}) => ({ name, spr, hp, atk, def, spd, exp, silver, pause, moves, ...o });
Object.assign(FOES, {
  odok_man: foe('오독문 독인', 'chars/GreenNinja', 620, 38, 9, 78, 110, 30, .95, ['quick', 'dart3', 'venom'], { wpn: 'Sai', guard: .5 }),
  dang_guard: foe('당가 암기수', 'chars/Dang', 700, 40, 10, 74, 120, 40, .95, ['dart3', 'fan5', 'quick'], { wpn: 'Sai', guard: .5 }),
  dang_elder: foe('당가 장로 당철', 'chars/Dang', 2400, 46, 13, 72, 320, 160, .9, ['dart3', 'fan5', 'venom', 'blink', 'flurry'], { wpn: 'Sai', boss: 1, guard: .6, poise: 220, phases: [{ hp: .5, say: '당가 독은 당가가 거둔다. 남이 손댈 일이 아니다!', add: ['dang_guard'] }] }),
});
const MAP = 'b_odok';

// 셋을 다 막으면(part4b nextGoal) 당소연이 찾아온다
export async function odokCall() {
  await narr('흑도맹 거두 셋을 막고 구화성으로 돌아온 밤, 객잔 뒷문으로 당소연이 들어왔다. 삿갓을 깊이 눌러쓰고 있었다.');
  await say('clan_dang', '당가가 내일 새벽에 남쪽으로 떠나요. 오독문을 치러요.');
  await say('me', '오독문은 흑도맹이잖아요. 맹 토벌령에 든 거 아니에요?');
  await say('clan_dang', '명분은 그래요. 이십 년 전 사마웅 형제들을 독살한 게 오독문이라는 거. 근데 당신 품에 있는 그 독고 기록, 그게 뭐라고 했죠?', 'a');
  await say('me', '일배혈. 당가 독고에서 나갔고, 가져간 건 맹주관 서기.');
  await say('clan_dang', '장로님들은 그걸 알아요. 알면서 오독문 독경을 가지러 가는 거예요. 독으로 당가랑 겨룰 데는 천하에 거기 하나뿐이니까.', 's');
  await say('clan_dang', '같이 가 줘요. 나 혼자 가면 나는 그냥 당가 딸이에요.');
  F().jg_od_call = true;
  await narr('그 밤으로 떠났다. 당가 토벌대보다 하루를 앞서야 했다. 남쪽으로 이틀, 배를 버리고 늪길로 하루.');
  await fadeTo(1); G.field.load(MAP, 23, 62, 3); await fadeTo(0);
  await odok();
}
async function odok() {
  await ctx.chap(5, '세 갈래 길', '오독문');
  await narr('오독문은 늪 한가운데 섬에 있었다. 물안개에서 단내가 났고, 둑길 양옆으로 이름 모를 꽃이 피어 있었다. 꽃 하나하나가 다 독이라고 당소연이 말했다.');
  await say('odok_man', '정천맹 개들이 벌써 왔다! 둑길을 막아라!');
  await say('clan_dang', '아니에요! 우리는…… 아, 이 옷이 문제구나.', 'b');
  await ctx.duel({ foes: ['odok_man', 'odok_man', 'odok_man'], allies: ['dang_ally'], arena: 'forest', bgm: 'fight', title: '오독문 둑길', optional: true });
  await narr('독인들이 쓰러진 사이로 여인 하나가 걸어 나왔다. 손등에 푸른 전갈 문신이 있었다.');
  await say('namhwa', '죽이지는 않았네요. 정천맹 사람치고 손이 무르네.');
  await say('me', '정천맹 사람 아니에요. 역적이에요. 지금은.');
  await say('namhwa', '오독문 남화예요. 역적이 당가 아가씨를 데리고 오독문엔 왜 왔어요?');
  await say('me', '이십 년 전 사마웅 형제들이 마신 독. 그거 물어보러요.');
  await say('namhwa', '……입 안이 붉게 마르고, 맥이 거꾸로 뛰었대요. 잔을 내려놓기도 전에 쓰러졌고요.', 's');
  await say('namhwa', '그런 독은 오독문도 못 만들어요. 그런데 강호는 오독문 독이라고 했죠. 제 사부님은 그 말 때문에 정천맹 옥에서 돌아가셨어요.');
  await narr('품에서 독고 기록을 꺼냈다. 당소연이 옆에서 고개를 끄덕였다. 남화는 그 종이를 받아 들고 한 줄을 오래 읽었다.');
  await say('namhwa', '일배혈. 사천당가 독고. 맹주관 서기.', 's');
  await say('namhwa', '……이십 년 동안 이 한 줄이 없었어요.', 's');
  await narr('그때 둑길 끝에서 나팔 소리가 났다. 당가 깃발이었다. 앞장선 노인이 당소연을 보고 걸음을 멈췄다.');
  await say('dang_elder', '소연아. 네가 왜 거기 서 있느냐.');
  await say('clan_dang', '장로님. 오독문은 사마웅 형제를 죽이지 않았어요. 독고 기록이 있어요. 장로님도 아시잖아요.');
  await say('dang_elder', '안다. 그러니 오는 거다. 그 기록이 밖으로 나가면 당가가 끝난다. 오독문이 없어지면 그 이야기를 할 사람도 없어지지.');
  await say('namhwa', '그러니까 이십 년 동안 그렇게 해 온 거군요.', 'a');
  const c = await choice('당소연이 이쪽을 돌아본다. 손이 떨린다.', ['당소연에게 맡긴다 (가문 앞에서 기록을 읽게 한다)', '내가 막는다 (당소연은 물러나 있게 한다)']);
  if (c === 0) {
    await say('me', '읽어요. 당가 사람이 당가 마당에서 크게 읽으면 안 된다고 했죠. 여긴 당가 마당이 아니에요.');
    await narr('당소연이 기록을 펼쳤다. 목소리가 처음엔 작았다가, 마지막 줄에서 둑길 끝까지 들렸다.');
    await say('clan_dang', '"외부인 출입, 딱 한 사람. 맹주관 서기 위문상. 일배혈 한 병." 당가는 이걸 이십 년 동안 서랍에 넣어 두고 남한테 누명을 씌웠어요. 숨기면 당가가 끝나는 게 아니라, 숨겨서 이미 끝난 거예요.');
    await say('dang_elder', '……가문을 버리겠다는 말이냐.');
    await say('clan_dang', '아뇨. 가문을 살리겠다는 말이에요.', 'a');
    await ctx.duel({ foes: ['dang_elder', 'dang_guard', 'dang_guard'], allies: ['dang_ally'], arena: 'forest', bgm: 'boss', title: '사천당가 장로 당철' });
    F().jg_od = 'so'; ctx.love('clan_dang'); ctx.rep('jeong', -1); ctx.rep('sa', 2);
    await say('dang_elder', '…가자. 오늘 일은 가주께 고하겠다. 소연아, 너는 오늘부터 당가 마당에 못 들어온다.');
    await say('clan_dang', '알아요. 대신 가주님께 그 한 줄도 같이 고해 주세요.', 's');
    await narr('토벌대가 둑길을 돌아갔다. 당소연은 끝까지 등을 펴고 서 있다가, 깃발이 안개 속으로 사라지자 그 자리에 주저앉았다.');
    await say('namhwa', '당가 아가씨. 오늘 밤은 오독문에서 자요. 독은 안 탈게요.', 'h');
  } else {
    await say('me', '물러나 있어요. 당신이 칼을 뽑으면 다시는 집에 못 가요.');
    await say('clan_dang', '……미안해요.', 's');
    await ctx.duel({ foes: ['dang_elder', 'dang_guard', 'dang_guard'], arena: 'forest', bgm: 'boss', title: '사천당가 장로 당철' });
    F().jg_od = 'me'; ctx.rep('sa', 2);
    await say('dang_elder', '역적 놈이 당가 일에 끼어드는구나. 기억해 두마.');
    await narr('토벌대가 물러나는 동안 당소연은 끝내 장로를 똑바로 보지 못했다. 그래도 장로가 지나갈 때 기록을 쥔 손을 감추지는 않았다.');
    await say('clan_dang', '나 비겁하죠. 그래도 그 종이는 안 놨어요.', 's');
  }
  await say('namhwa', '패천도한테 가죠? 이거 가져가요.');
  await narr('남화가 전갈 문신과 같은 무늬가 찍힌 푸른 패를 내밀었다.');
  await say('namhwa', '오독문 패예요. 이걸 보여 주고, 오독문이 증언한다고 해요. 그 독은 오독문 독이 아니었다고. 그 사람은 이십 년 동안 오독문도 의심했으니까, 이 말이 필요할 거예요.');
  F().jg_od_token = true;
  ctx.note(`오독문에서 남화에게 독고 기록을 보였다. 당가 장로 당철이 토벌대를 끌고 왔고, ${F().jg_od === 'so' ? '당소연이 가문 앞에서 기록을 읽고 함께 싸웠다(당가 마당에서 쫓겨남)' : '내가 막았고 당소연은 물러나 있었다'}. 남화가 오독문 패를 주며 패천도에게 증언하겠다고 했다.`);
  ctx.goal('흑풍채에서 패천도 사마웅 만나기 (오독문 패를 가지고)');
}

Story.providers.push(function part5c(id) {
  const n = [];
  if (at('jg3') && G.ch5?.done?.() && !F().jg_od) {
    if (!F().jg_od_call && (id === 'guhwa' || id === 'inn2')) n.push({ id: 'clan_dang', spr: 'Dang', x: id === 'inn2' ? 13 : 24, y: id === 'inn2' ? 9 : 18, dir: 0, hint: '당소연', mark: () => true, talk: odokCall });
    if (F().jg_od_call && id === MAP) n.push({ id: 'clan_dang', spr: 'Dang', x: 23, y: 60, dir: 3, hint: '오독문 둑길', mark: () => true, talk: odok });  // 오독문에서 멈췄다 다시 불러올 때
  }
  return { npcs: n, spots: [], trigs: [], roam: [] };
});
G.act5c = { odokCall, odok };  // 시험용

// ── 5부 3장 흑도맹 총단: 패천도를 만나기 전에 밤에 숨어 들어가 본다(사파 쪽 사람들의 사정) ──
Object.assign(FOES, { hd_watch: foe('흑도맹 순찰', 'chars/Villager4', 640, 38, 10, 70, 100, 25, .95, ['double', 'lunge', 'quick'], { wpn: 'Sword', guard: .55 }) });
Object.assign(WHO, { hd_widow: { name: '산채 아낙', face: 'Woman' }, hd_boy: { name: '어린 녹림도', face: 'Child' } });
export async function sneak() {
  await ctx.chap(5, '세 갈래 길', '흑도맹 총단');
  await narr('흑풍채는 흑도맹의 총단이 되어 있었다. 녹림과 수로채와 혈의방 깃발이 한 마당에 꽂혀 있었다. 정면으로 가면 패천도 얼굴을 보기 전에 목이 먼저 떨어질 것 같았다.');
  await say('so', '밤에 들어가. 저 사람이 무슨 사람인지 먼저 보고 나서 말을 걸어도 늦지 않아.');
  await narr('삿갓을 벗고 녹림도 두건을 썼다. 부상병을 실어 나르는 수레 뒤에 붙어 목책을 넘었다.');
  await narr('마당 한쪽에 솥이 열 개쯤 걸려 있었다. 칼 찬 사내보다 아이를 업은 아낙이 더 많았다. 다리를 잃은 녹림도 하나가 솥 앞에서 죽을 젓고 있었다.');
  await say('hd_widow', '거기, 새로 온 {손님}. 무창 쪽에서 왔수? 우리 그이도 거기 갔는데. 오강 채주님 배에.');
  const c = await choice('아낙이 국자를 든 채 이쪽을 본다.', ['배 사람들은 살아서 보내졌다고 한다', '모른다고 한다']);
  if (c === 0) { await say('me', '…무창 배 사람들은 다 살아서 보내졌대요. 채주님도 살아 계시고요.'); await say('hd_widow', '그럼 됐수. 그 사람은 헤엄을 못 쳐서.', 'h'); await narr('무창 나루에서 오강의 배를 멈춘 건 나였다. 아낙은 그걸 몰랐다.'); }
  else { await say('me', '…모르겠어요.'); await say('hd_widow', '그렇지. 다들 모르지. 죽 한 그릇 먹고 가요.', 's'); }
  await say('hd_boy', '{아이호칭}도 정천맹이랑 싸웠어? 나는 아직 칼을 안 줘. 열다섯 살 돼야 준대.');
  await say('me', '몇 살인데.');
  await say('hd_boy', '열둘. 정천맹이 우리 마을 태울 때 형들이 날 업고 이 산에 올라왔어.');
  await narr('견대에서 나는 일곱 살에 칼을 받았다. 여기는 열다섯까지 기다려 준다고 했다.');
  await narr('안채 쪽으로 가는 길에 순찰이 횃불을 들고 돌아섰다.');
  await ctx.duel({ foes: ['hd_watch', 'hd_watch'], arena: 'fort', bgm: 'fight', title: '흑도맹 순찰', optional: true, noIntro: true });
  await narr('쓰러진 순찰을 그늘에 눕히고 안채 뒷문을 열었다. 촛불 열두 개가 켜진 방이었다. 위패가 열두 개, 그 옆에 아무것도 적히지 않은 위패가 하나 더 있었다.');
  await say('samaung', '열세 번째는 내 거다. 다 끝나면 거기 이름을 쓰라고 해 놨다.');
  await narr('등 뒤에 패천도가 서 있었다. 언제부터 있었는지 몰랐다.');
  F().jg_sneak = true;
  ctx.note('흑도맹 총단(흑풍채)에 밤에 숨어 들어갔다. 솥 앞의 아낙들, 열다섯이 되어야 칼을 준다는 열두 살 녹림도, 위패 열두 개와 이름 없는 열세 번째 위패.');
}

// ── 5부 4장 정천맹의 균열: 패천도 담판 뒤, 월하곡으로 가기 전 ──
export async function rift() {
  await ctx.chap(5, '세 갈래 길', '정천맹의 균열');
  await narr('그 밤 움막으로 손님 둘이 찾아왔다. 혜각 대사와 아미파 정혜 사태였다. 둘 다 피 묻은 가사를 그대로 입고 있었다.');
  await say('hyegak', '구파 회관이 둘로 갈라졌소. 맹주가 어제 영을 내렸소. 칠십이채 산채를 식솔째 불태우라고.');
  await say('me', '식솔째요?', 'a');
  await say('clan_emei', '남궁과 팽가는 받았어요. 오대세가는 맹주 쪽에 줄을 섰고, 소림과 아미는 거절했어요. 무당은 아직 대답이 없고요.');
  await say('hyegak', '노납은 승병을 돌려보냈소. 소림이 맹주 영을 거스른 건 맹이 선 뒤로 처음이오. 칠 년 전이었으면 노납이 먼저 횃불을 들었을 거요.', 's');
  await say('cheol', '사형…… 아니, 대사. 그럼 소림은 이제 맹의 적입니까.');
  await say('hyegak', '맹의 적이 아니라 맹주의 적이지. 그 둘을 나누는 데 이십 년이 걸렸구나.');
  await say('clan_emei', '제갈세가 군량관이 몰래 장부를 보내왔어요. 그믐날 맹주가 구화성에 없대요. 군량 수레 서른 대가 월하곡 쪽으로 간대요. 전쟁터가 아니라.');
  await say('me', '월하곡. 아주머니가 있는 데.', 'b');
  const c = await choice('혜각 대사가 염주를 굴린다.', ['그믐날 월하곡에 증인으로 와 달라고 한다', '구파 회관을 지켜 달라고 한다']);
  if (c === 0) { await say('me', '그믐날 월하곡에 와 주세요. 맹주가 거기서 뭘 하는지 소림이 보면, 그다음엔 아무도 저를 역적이라고 못 해요.'); await say('hyegak', '…가겠소. 이번에는 늦지 않겠소.'); F().jg_witness = 'hyegak'; }
  else { await say('me', '회관을 지켜 주세요. 맹주가 없을 때 남궁이랑 팽가가 무슨 짓을 할지 몰라요.'); await say('clan_emei', '그건 우리가 할게요. 피난민도 회관에 있으니까요.'); F().jg_witness = 'hall'; }
  ctx.note(`정천맹이 갈라졌다. 맹주가 칠십이채를 식솔째 태우라고 했고, 남궁·팽가(오대세가)는 따르고 소림·아미는 거절했다. 제갈 군량관 장부로는 그믐날 맹주와 군량 수레 서른 대가 월하곡으로 간다. ${F().jg_witness === 'hyegak' ? '혜각 대사가 증인으로 월하곡에 오기로 했다.' : '아미와 소림이 구파 회관을 지키기로 했다.'}`);
}
