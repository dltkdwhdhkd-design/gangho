// 제5부 정파 길: 장문인 회의 뒤 흑도맹이 남하한다. 패천도에게 가기 전에 사파 거두 셋을 차례로 막는다(순서는 자유)
// - 무창 나루: 장강수로채 총채주 오강. 이긴 뒤 나루와 배를 두고 남궁세가와 제갈세가가 서로 차지하려 든다
// - 구파 회관의 밤: 혈의방 막고가 장문인을 노린다. 화산과 종남이 서로를 의심하고, 섬서 지휘권을 두고 다툰다
// - 동쪽 산길: 녹림 총채주 구양철. 이긴 뒤 하북팽가 토벌대가 산채 피난민 마을을 태워 땅을 차지하려 한다
// 같은 정파라도 이익 앞에서는 갈라선다. 사파는 중간 보스, 마지막 적은 마교(심마)다. 여기서 고른 것은 패천도 담판과 뒤 장에서 돌아온다
import { G, Sound, fadeTo, toast } from './core.js';
import { Story, ctx, say, narr, choice } from './ctx.js';
import { WHO } from './dialog.js';
import { FOES } from './foes.js';
import { at } from './story1.js';

const F = () => G.S.flags;
Object.assign(WHO, {
  ng_elder: { name: '남궁세가 장로 남궁위', face: 'Noble' }, jg_clerk: { name: '제갈세가 군량관', face: 'Inspector' }, sailor: { name: '무창 뱃사람', face: 'Villager3' },
  paeng_cap: { name: '하북팽가 토벌대장 팽호', face: 'Paeng' }, refugee: { name: '산채 아낙', face: 'Woman' },
});
const foe = (name, spr, hp, atk, def, spd, exp, silver, pause, moves, o = {}) => ({ name, spr, hp, atk, def, spd, exp, silver, pause, moves, ...o });
Object.assign(FOES, {
  ogang_foe: foe('장강수로채 총채주 오강', 'chars/Villager3', 2600, 40, 11, 70, 360, 220, .9, ['double', 'lunge', 'spin', 'dart3', 'heavy'], { wpn: 'Lance', boss: 1, guard: .6, poise: 240, phases: [{ hp: .5, say: '물 위였으면 벌써 끝났다!', pause: .75 }] }),
  guyang_foe: foe('녹림 총채주 구양철', 'chars/Caveman2', 3000, 44, 14, 60, 400, 160, .9, ['heavy', 'quake', 'spin', 'charge'], { wpn: 'Axe', boss: 1, guard: .7, poise: 300, phases: [{ hp: .45, say: '사만 식구 밥줄이다. 쉽게는 못 비켜 준다!', pause: .72 }] }),
  hyeol_kill: foe('혈의방 살수', 'chars/RedNinja', 560, 36, 8, 86, 110, 40, .95, ['quick', 'blink', 'dart3'], { wpn: 'Ninjaku', guard: .5 }),
  ng_guard: foe('남궁세가 무사', 'chars/Knight', 760, 38, 12, 68, 120, 40, .95, ['double', 'lunge', 'cloud_flash'], { wpn: 'Rapier', guard: .6 }),
  paeng_guard: foe('하북팽가 도수', 'chars/Paeng', 820, 40, 12, 62, 130, 40, .95, ['heavy', 'spin', 'double'], { wpn: 'BigSword', guard: .6 }),
  paeng_cap: foe('토벌대장 팽호', 'chars/Paeng', 1700, 44, 14, 64, 260, 120, .9, ['heavy', 'spin', 'charge', 'quake'], { wpn: 'BigSword', boss: 1, guard: .7, poise: 200 }),
});
const done = () => !!(F().jg_wc && F().jg_mk && F().jg_gy);
const left = () => [!F().jg_wc && '무창 나루(장강수로채)', !F().jg_mk && '구화성 구파 회관 밤 경비(혈의방)', !F().jg_gy && '동쪽 산길(녹림)'].filter(Boolean);
function nextGoal() {
  if (done()) { ctx.goal('흑도맹 거두 셋을 막았다. 동쪽 산길 너머 흑풍채에서 패천도 사마웅 만나기'); return; }
  ctx.goal(`흑도맹 남하 막기: ${left().join(', ')}. 순서는 자유. 셋을 막으면 흑풍채의 패천도에게 간다`);
}
// 회의가 끝나면 부른다(js/part4.js council)
export async function warOpens() {
  await narr('그날 밤 구화성 성문 위로 봉화가 세 군데에서 올랐다. 서쪽은 무창, 남쪽은 구화성 남문, 동쪽은 흑풍채 쪽 산길이었다.');
  await say('so', '흑도맹이 세 갈래로 내려와. 장강 물길로 오는 게 장강수로채, 산길로 오는 게 녹림이야. 혈의방은 길로 안 오고 지붕으로 오지.');
  await say('cheol', '패천도는 맨 뒤에 앉아 있겠구려. 앞에 선 셋을 지나야 얼굴이라도 보겠소.');
  await say('yun', '무창 나루에 피난민이 몰려 있대요. 배가 없으면 강을 못 건너요.');
  await say('me', '하나씩 막아요. 셋을 막으면 패천도도 말을 들을 거예요.');
  nextGoal(); ctx.note('흑도맹이 세 갈래로 남하한다. 장강수로채는 무창 나루로, 녹림은 동쪽 산길로, 혈의방은 구파 회관 지붕으로.');
}

// ── 무창 나루: 오강 ──
async function wuchang() {
  await ctx.chap(5, '세 갈래 길', '무창 나루');
  await narr('무창은 장강과 한수가 만나는 곳이다. 강 건너 한양 쪽 나루에서 연기가 올랐고, 이쪽 나루에는 짐 보따리를 진 사람들이 발 디딜 틈 없이 서 있었다.');
  await say('sailor', '배를 다 뺏겼소! 장강수로채가 한수 어귀에서 내려와 나루를 막았소. 강을 건너려면 뱃삯을 내라는데, 정천맹 세금보다 싸다니 웃기지도 않소.');
  await narr('물 위에 검은 돛배 여섯 척이 나란히 섰다. 가운데 배 이물에 창을 짚은 사내가 서 있었다.');
  await say('ogang', '장강수로채 총채주 오강이다. 오늘부로 이 나루 세금은 반값이다. 대신 정천맹 사람은 못 건넌다.');
  await say('me', '반값이어도 칼 들고 받으면 약탈이에요.');
  await say('ogang', '그럼 정천맹이 받던 건 뭐였냐? 역적 딱지 붙은 놈이 정천맹 나루를 지켜 주러 왔어?');
  await say('me', '정천맹 나루가 아니라 저 사람들 나루예요.');
  await say('ogang', '말은 맹주보다 낫구나. 물 밖으로 나와 주마. 물에서 붙으면 너무 쉬우니까.');
  await ctx.duel({ foes: ['ogang_foe', 'pirate', 'pirate'], allies: ['so_ally'], arena: 'dock', bgm: 'boss', title: '장강수로채 총채주 오강' });
  await narr('오강이 창을 놓치고 나루 기둥에 등을 기댔다. 돛배들이 하나둘 닻을 올렸다.');
  await say('ogang', '…졌다. 배는 두고 가마. 애들은 보내 줘라. 물 위에서 자란 놈들이라 땅에서는 쓸모가 없다.');
  const c = await choice('오강이 숨을 몰아쉰다.', ['살려 보낸다', '묶어서 정천맹에 넘긴다']);
  if (c === 0) { F().jg_ogang = 'spared'; await say('ogang', '빚졌다. 패천도 형님 앞에서 갚으마. 내가 아직 살아 있으면.'); ctx.rep('sa', 2); }
  else { F().jg_ogang = 'bound'; await say('ogang', '정천맹 옥이라. 위충이 있던 데군. 밥은 형편없다더라.'); ctx.rep('jeong', 1); }
  // 정파끼리: 나루와 배를 두고
  await narr('흑도맹 배가 떠나자마자 이번엔 강둑 위로 깃발 두 개가 내려왔다. 푸른 바탕에 남궁(南宮), 흰 바탕에 제갈(諸葛).');
  await say('ng_elder', '수고했네. 나루와 배는 남궁세가가 접수하겠네. 장강 수운은 앞으로 우리 집안이 맡지.');
  await say('jg_clerk', '그건 안 됩니다. 토벌 계획에 따라 장강 배는 맹의 군량 수송에 씁니다. 군량 장부는 제갈세가가 맡고 있습니다.');
  await say('ng_elder', '그 계획을 누가 짰나? 제갈세가 아닌가. 결국 제갈 장부로 들어가겠다는 소리지.');
  await say('sailor', '저기요, 그 배는 원래 우리 배요. 우리 배로 피난민을 건네줘야 하오.');
  await say('ng_elder', '전시에 배 주인이 어디 있나. 맹에 바치게.');
  await say('clan_namgung', '…숙부님, 저 사람들 아직 짐도 못 내려놨습니다.', 's');
  await say('so', '흑도맹 쫓아낸 지 한 식경도 안 됐는데 벌써 나눠 먹네.', 'a');
  const d = await choice('남궁 장로와 제갈 군량관이 동시에 이쪽을 본다. 싸움을 끝낸 사람이 정하라는 얼굴이다.', ['남궁세가에 넘긴다', '제갈세가(맹 군량)에 넘긴다', '뱃사람들에게 돌려준다']);
  if (d === 0) {
    F().jg_boats = 'nam'; ctx.rep('jeong', 1);
    await say('ng_elder', '말이 통하는 젊은이군. 남궁세가는 오늘을 기억하겠네.');
    await say('sailor', '…역적이라더니 정천맹이랑 똑같구먼.');
    await say('clan_namgung', '고맙다고는 못 하겠다. 숙부님이 저 배로 무엇을 실을지 나는 안다.', 's');
  } else if (d === 1) {
    F().jg_boats = 'jegal'; ctx.rep('jeong', 1);
    await say('jg_clerk', '장부에 올려 두겠습니다. 제갈현 공자께 공자님 이름을 전하지요.');
    await say('ng_elder', '제갈 장부라. 그 장부가 어디로 흘러가는지 나중에 보세.');
    await say('sailor', '군량이면 우리 애들 입에도 들어가긴 하겠지. 언제가 될지는 모르지만.');
  } else {
    F().jg_boats = 'people';
    await say('ng_elder', '역적이 정천맹 전리품을 마음대로 나눈다? 무사들, 저자를 물려라.');
    await say('clan_namgung', '저는 안 뽑습니다, 숙부님. 흑도맹 쫓아낸 사람한테 칼 뽑는 건 남궁 검이 할 일이 아닙니다.', 'a');
    await narr('남궁진이 검을 칼집째 땅에 꽂고 물러섰다. 남궁 무사들은 서로 눈치를 보다가 장로의 고함에 칼을 뽑았다.');
    await ctx.duel({ foes: ['ng_guard', 'ng_guard', 'ng_guard'], allies: ['so_ally'], arena: 'dock', bgm: 'fight', title: '정파끼리 뽑은 칼', noLoot: true });
    await say('ng_elder', '…이 일은 맹에 보고하겠네.');
    await say('sailor', '배 돌려받았소! 자, 노약자부터 태워! 뱃삯은 안 받소!');
    await say('clan_namgung', '숙부님 보고서에 내 이름도 넣어라. 칼을 안 뽑은 죄로.', 'h');
    ctx.rep('jeong', -1); ctx.love('clan_namgung');
  }
  F().jg_wc = true; ctx.note(`무창 나루에서 장강수로채 총채주 오강을 꺾었다(${F().jg_ogang === 'spared' ? '살려 보냄' : '정천맹에 넘김'}). 빼앗은 배를 두고 남궁세가와 제갈세가가 다퉜고, 배는 ${{ nam: '남궁세가', jegal: '맹 군량(제갈세가)', people: '뱃사람들' }[F().jg_boats]}에게 갔다.`);
  nextGoal();
}

// ── 구파 회관의 밤: 막고 ──
async function hallNight() {
  await ctx.chap(5, '세 갈래 길', '지붕 위의 손님');
  await fadeTo(1); F().night = true; G.field.load('ninehall', 20, 16, 1); await fadeTo(0);
  await say('clan_shaolin', '시주, 오늘 밤은 노납 곁에 있어 주시오. 장문인 셋이 묵는 처소 지붕에서 기와 밟는 소리가 났소.');
  await narr('삼경이 지나자 종남파 처소 쪽에서 비명이 터졌다. 달려가 보니 종남 장문인 서문각이 어깨를 감싸 쥐고 있었고, 지붕 위에 붉은 그림자가 셋 서 있었다.');
  await say('clan_jongnam', '…화산이다. 우리 처소 위치를 아는 건 화산밖에 없었다!', 'a');
  await say('clan_hwasan', '말 조심하세요, 서문 장문인. 저희도 지금 막 뛰어왔습니다.', 'a');
  await say('makgo', '정파 어른들 싸우는 소리 듣기 좋구먼. 계속하쇼. 우리는 일만 하고 갈 테니.');
  await ctx.duel({ foes: ['makgo', 'hyeol_kill', 'hyeol_kill'], allies: ['cheol_ally'], arena: 'court', bgm: 'boss', title: '혈수 막고' });
  await narr('막고가 무릎을 꿇었다. 단검을 버리면서도 웃음은 버리지 않았다.');
  await say('makgo', '혈의방은 청부를 받고 움직인다. 이번 청부 값이 어디서 나왔는지 궁금하지 않소?');
  await say('me', '흑도맹 아니에요?');
  await say('makgo', '흑도맹 돈이면 이렇게 많을 리가 없지. 은표 도장이 구화성 전장 것이더군. 정천맹 사람들이 쓰는 전장 말이오.');
  await narr('마당이 조용해졌다. 화산 매향이 먼저 칼을 뽑았다.');
  await say('clan_hwasan', '살수 말을 들을 필요 없어요. 화산이 이자를 베겠습니다. 오늘 일은 화산이 수습하지요. 섬서 전선도 앞으로 화산이 맡겠습니다. 종남은 장문인이 다쳤으니.');
  await say('clan_jongnam', '그게 속셈이었군! 섬서 지휘권 말이야!', 'a');
  await say('clan_shaolin', '아미타불. 시주, 이 자는 시주가 잡았소. 시주가 정하시오.');
  const c = await choice('막고를 누구에게 맡길까?', ['화산에 넘긴다 (그 자리에서 벤다)', '종남에 넘긴다 (원수를 갚게 한다)', '혜각 대사께 맡긴다 (살려서 돈줄을 캔다)']);
  if (c === 0) {
    F().jg_makgo = 'hwasan'; ctx.rep('jeong', 1);
    await narr('매향의 검이 한 번 번쩍였다. 막고는 웃는 얼굴 그대로 앞으로 쓰러졌다. 은표 이야기를 더 들을 길이 없어졌다.');
    await say('clan_jongnam', '입을 막았군. 잘 봐 두겠소.', 'a');
  } else if (c === 1) {
    F().jg_makgo = 'jongnam';
    await say('clan_jongnam', '고맙소. 종남은 은혜를 잊지 않소.');
    await narr('종남 제자들이 막고를 끌고 갔다. 다음 날 아침 종남 처소 뒤뜰에 거적 덮인 몸 하나가 나왔다. 은표 이야기는 거기서 끝났다.');
    await say('clan_hwasan', '화산은 이 일을 맹에 올리겠어요. 종남이 사사로이 사람을 죽였다고.', 'a');
  } else {
    F().jg_makgo = 'hyegak'; ctx.rep('jeong', 1); ctx.rep('sa', 1);
    await say('clan_shaolin', '소림 계율원 옥으로 데려가겠소. 거기서는 아무도 밤에 지붕을 못 타오.');
    await say('makgo', '하하, 중놈 옥이라. 밥은 맹물에 나물이겠군. 좋소. 은표 받은 놈 이름은 거기서 천천히 생각해 보지.');
    await say('clan_hwasan', '대사님까지 역적 편을 드시는군요.', 'a');
    await say('clan_shaolin', '노납은 사람 편이오, 매향 장문인.');
  }
  await say('so', '봤어? 칼은 흑도맹이 들었는데 싸움은 화산이랑 종남이 해. 누가 돈을 댔든 이게 그 사람이 원한 그림이야.', 'a');
  F().night = false; F().jg_mk = true; ctx.note(`구파 회관에서 혈수 막고를 잡았다. 청부 은표는 구화성 전장 것이었다. 막고는 ${{ hwasan: '화산이 그 자리에서 벴다', jongnam: '종남이 데려가 죽였다', hyegak: '혜각 대사가 소림 옥으로 데려갔다' }[F().jg_makgo]}. 화산과 종남은 섬서 지휘권을 두고 갈라섰다.`);
  nextGoal();
}

// ── 동쪽 산길: 구양철 ──
async function guyang() {
  await ctx.chap(5, '세 갈래 길', '산길의 솥');
  await narr('동쪽 산길 고갯마루에 통나무 목책이 섰다. 목책 너머로 연기가 여러 줄 올랐는데, 불이 아니라 밥 짓는 연기였다.');
  await say('guyang', '녹림 칠십이채 총채주 구양철이다. 이 고개 너머는 사만 식구가 사는 데다. 칼 찬 놈은 못 지나간다.');
  await say('me', '패천도를 만나러 가요. 싸우러 가는 게 아니에요.');
  await say('guyang', '정천맹 깃발 단 놈들도 다 그렇게 말하더라. 그리고 밭을 태웠지. 말은 칼로 해라. 사마웅 형님 버릇이 나한테도 옮았다.');
  await ctx.duel({ foes: ['guyang_foe', 'bandit', 'bandit'], allies: ['cheol_ally'], arena: 'forest', bgm: 'boss', title: '녹림 총채주 구양철' });
  await narr('구양철이 도끼를 땅에 박고 숨을 골랐다. 목책 뒤에서 아이들이 고개를 내밀었다.');
  await say('guyang', '…지나가라. 대신 산 아래 사람들은 건드리지 마라. 저 솥이 저 애들 하루치다.');
  await narr('그때 고개 아래에서 말발굽 소리가 올라왔다. 흰 바탕에 팽(彭) 자 깃발. 하북팽가 토벌대였다.');
  await say('paeng_cap', '하북팽가 토벌대장 팽호다. 녹림 두목을 잡아 줬군. 수고했다. 이제 산채를 태우고 이 고개를 접수한다.');
  await say('me', '저 안에 있는 건 아이들이랑 피난민이에요.');
  await say('paeng_cap', '산적 식구도 산적이다. 토벌한 산은 토벌한 집안이 갖는다는 게 맹의 법이지. 이 고개 목재랑 산채 곳간, 하북팽가가 다 맡는다.');
  await say('refugee', '살려 주세요. 밭 뺏기고 올라온 사람들이에요. 저희는 칼 한 번 안 잡아 봤어요.');
  await say('cheol', '시주, 저 사람 눈에는 아이들이 안 보이고 목재만 보이는 모양이오.', 'a');
  const c = await choice('팽호가 횃불을 든 도수들에게 손짓한다.', ['막아선다', '눈감고 지나간다']);
  if (c === 0) {
    await say('me', '지나가려면 저부터 넘으세요.');
    await say('paeng_cap', '역적이 산적 편까지 드는군. 좋다. 정천맹에 보고할 거리가 하나 늘었다.');
    await ctx.duel({ foes: ['paeng_cap', 'paeng_guard', 'paeng_guard'], allies: ['cheol_ally'], arena: 'forest', bgm: 'fight', title: '하북팽가 토벌대', noLoot: true });
    F().jg_guyang = 'saved'; ctx.rep('sa', 3); ctx.rep('jeong', -1);
    await say('paeng_cap', '이 일은 하북팽가가 잊지 않는다.');
    await say('guyang', '정파 놈이 정파를 막아? 형님한테 말해 두마. 이런 놈도 있더라고.');
  } else {
    F().jg_guyang = 'burned'; ctx.rep('jeong', 1); ctx.rep('sa', -3);
    await narr('등 뒤에서 목책이 타는 소리가 났다. 고개를 다 넘을 때까지 돌아보지 않았다. 연기 냄새는 그 뒤로도 사흘 동안 옷에서 빠지지 않았다.');
    await say('yun', '…아무 말 안 할게요. 대신 오늘 밤엔 제 옆에서 자요. 혼자 있으면 안 될 얼굴이에요.', 's');
  }
  F().jg_gy = true; ctx.note(`동쪽 산길에서 녹림 총채주 구양철을 꺾었다. 하북팽가 토벌대가 산채를 태우고 고개를 차지하려 했고, 나는 ${F().jg_guyang === 'saved' ? '막아섰다' : '눈감고 지나갔다'}.`);
  nextGoal();
}

// 패천도 담판에서 이 장의 선택이 돌아온다(js/part4.js samaungTalk)
export async function samaungEcho() {
  if (F().jg_ogang === 'spared') { await say('ogang', '형님, 이놈이오. 무창에서 나를 살려 보낸 놈.'); await say('samaung', '오강이 빚을 졌다고? 물귀신이 빚 얘기하는 건 처음 듣는다.'); }
  if (F().jg_guyang === 'saved') await say('guyang', '팽가 놈들 횃불을 이놈이 막았소. 솥 하나 안 엎어졌소.');
  if (F().jg_guyang === 'burned') await say('guyang', '…이놈이 지나간 뒤에 산채가 탔소, 형님. 칼 맞대기 전에 그것부터 아쇼.', 'a');
  if (F().jg_makgo === 'hyegak') await say('samaung', '막고가 소림 옥에 갇혔다더군. 그놈이 입을 열면 정천맹 쪽 은표가 나올 거다. 우리가 낸 돈이 아니니까.');
}

G.ch5 = { warOpens, samaungEcho, done, nextGoal };
const job = o => ({ dir: 0, mark: () => true, ...o });
Story.providers.push(function part4b(id) {
  const n = [];
  if (at('jg3') && F().jg_council !== undefined) {
    if (id === 'c_wuchang' && !F().jg_wc) n.push(job({ id: 'jg_sailor', spr: 'Villager3', x: 29.5, y: 40, hint: '무창 나루 뱃사람', talk: wuchang }));
    if (id === 'ninehall' && !F().jg_mk) n.push(job({ id: 'jg_hyegak', spr: 'Monk', x: 21.5, y: 22, hint: '혜각 대사 (밤 경비)', talk: hallNight }));
    if (id === 'pass' && !F().jg_gy) n.push(job({ id: 'jg_guyang', spr: 'Caveman2', x: 19, y: 10, hint: '녹림 목책', talk: guyang }));
  }
  return { npcs: n, spots: [], trigs: [], roam: [] };
});
