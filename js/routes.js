// 세력 갈림: 천하비무 뒤 누구의 손을 잡느냐에 따라 길과 결말이 달라진다
import { G, Sound, fadeTo, toast } from './core.js';
import { Story, ctx, say, narr, choice } from './ctx.js';
import { WHO } from './dialog.js';
import { FOES } from './foes.js';
import { set, at, after } from './story1.js';
import { clansWon } from './clandata.js';

const S = () => G.S, F = () => G.S.flags, side = () => G.S.side || 'jeong';
Object.assign(WHO, { samaung: { name: '패천도 사마웅', face: 'Samaung' }, hyeok: { name: '혁련하', face: 'Hyeok' }, hyeolma: { name: '혈마', face: 'Skeleton' }, makgo: { name: '혈수 막고', face: 'RedNinja' }, clerk: { name: '서기', face: 'Inspector' } });
const foe = (name, spr, hp, atk, def, spd, exp, silver, pause, moves, o = {}) => ({ name, spr, hp, atk, def, spd, exp, silver, pause, moves, ...o });
Object.assign(FOES, {
  jeong_guard: foe('정천맹 순찰', 'chars/Knight', 300, 30, 9, 62, 80, 30, 1.05, ['double', 'lunge', 'heavy'], { wpn: 'Sword', guard: .5 }),
  jeong_elite: foe('정천맹 검수', 'chars/Knight', 520, 38, 11, 68, 130, 50, .95, ['double', 'lunge', 'cloud_flash'], { wpn: 'Sword', guard: .6, elite: 1 }),
  myeon: foe('무면당 밀정', 'chars/GrayNinja', 400, 38, 9, 82, 110, 30, .95, ['quick', 'blink', 'dart3', 'lunge'], { wpn: 'Ninjaku', guard: .5 }),
  makgo: foe('혈수 막고', 'chars/RedNinja', 1100, 34, 9, 86, 320, 200, .85, ['flurry', 'blink', 'dart3', 'lunge'], { wpn: 'Ninjaku', guard: .7, boss: 1, poise: 110 }),
  hyeolma: foe('혈마', 'chars/Skeleton', 1800, 40, 11, 66, 520, 300, .85, ['venom', 'heavy', 'spin', 'quake'], { wpn: 'Axe', guard: .6, boss: 1, poise: 150 }),
  samaung_foe: foe('패천도 사마웅', 'chars/Samaung', 2800, 48, 15, 62, 700, 500, .85, ['heavy', 'quake', 'spin', 'charge'], { wpn: 'BigSword', guard: .8, boss: 1, poise: 200 }),
  samaung_ally: foe('사마웅', 'chars/Samaung', 2400, 46, 16, 62, 0, 0, 1.1, ['heavy', 'quake', 'spin'], { wpn: 'BigSword' }),
  hyeok_ally: foe('혁련하', 'chars/Hyeok', 1400, 44, 9, 78, 0, 0, 1, ['blood_fan', 'blink', 'fan5'], { wpn: 'Ninjaku' }),
  wei_ally: foe('위충', 'chars/Paeng', 1200, 36, 10, 66, 0, 0, 1.1, ['double', 'lunge'], { wpn: 'Sword' }),
  lion_ally: foe('맹호', 'chars/Lion', 1700, 40, 13, 58, 0, 0, 1.2, ['heavy', 'spin'], { wpn: 'BigSword' }),
});

// ── 구화성에서 먼저 손을 내미는 사람들 ──
async function baeGuhwa() {
  await say('baekrang', '또 보네요, 점소이. 대회 구경 왔어요? 저는 일하러 왔어요.');
  await say('me', '시골 도박장 주인이 구화성까지요?');
  await say('baekrang', '하오문이라고 들어 봤죠? 도박장은 간판이에요. 강호의 소문은 전부 우리 문턱을 넘어요.');
  await say('baekrang', '일감 하나 있어요. 정천맹 창고에 맡겨 둔 장부가 하나 있는데, 찾아다 주면 은자 백 냥. 순찰 둘만 눕히면 돼요.');
  const c = await choice('백랑이 주사위를 굴리며 기다린다.', ['맡는다', '정천맹 창고는 건드리기 싫다고 한다']);
  F().gu_bae = true;
  if (c === 0) {
    await ctx.duel({ foes: ['jeong_guard', 'jeong_guard'], arena: 'ring', bgm: 'fight', title: '정천맹 창고' });
    await say('baekrang', '빠르네요. 이 장부 말이에요, 구파일방 장로들이 받아 간 돈이 적혀 있어요. 정파도 외상은 긋더라고요.');
    ctx.silver(100); ctx.rep('sa', 2); ctx.love('baekrang');
    ctx.note('백랑은 하오문 사람이다. 정천맹 장로들의 뒷돈 장부를 훔쳐다 주었다.');
  } else { await say('baekrang', '착하네요. 착한 사람은 외상값을 잘 갚아요. 나중에 봐요.'); ctx.rep('jeong', 1); }
}
async function hyeokGuhwa() {
  await say('hyeok', '향을 사시겠습니까. 달맞이꽃으로 만든 향입니다.');
  await say('me', '이 동네에서는 안 나는 꽃인데요.');
  await say('hyeok', '천산 아래에서 납니다. 걸음이 곱습니다. 허리를 세우고, 왼발로 미는군요.');
  await say('me', '…누구세요.');
  await say('hyeok', '오늘은 향 장수입니다.');
  const c = await choice('낯선 여인의 눈이 붉게 보인다.', ['향을 산다 (10냥)', '어디서 그 걸음을 봤는지 묻는다', '그냥 지나간다']);
  F().gu_hyeok = true;
  if (c === 0) { S().silver = Math.max(0, S().silver - 10); await say('hyeok', '맹주가 권하는 잔은 조심하십시오. 덤입니다.'); ctx.rep('ma', 1); ctx.love('hyeok'); ctx.note('서역 향 장수: 맹주가 권하는 잔을 조심하라고 했다.'); }
  if (c === 1) { await say('hyeok', '강호에 길이 둘뿐이라고 믿는 사람은 대개 일찍 죽습니다. 세 번째 길에서 그 걸음을 봤습니다.'); ctx.rep('ma', 1); ctx.note('서역 향 장수는 월하칠식의 걸음을 알아보았다.'); }
  if (c === 2) await say('hyeok', '네. 또 뵙겠습니다.');
}

// ── 갈림 ──
export async function crossroads() {
  await narr('배는 불빛이 없는 쪽으로 내려갔다.\n구화성 쪽 하늘이 붉었다.');
  await say('boat', '나루마다 네 얼굴이 붙었단다. 맹주를 독살하려 한 역적이라더라.');
  await say('me', '독은 그쪽이 탔는데요.');
  await say('boat', '이긴 놈이 장부를 쓰는 거다.');
  await say('yun', '지금 정천맹 깃발 아래로 돌아가면 다 죽어요. 어디로 갈지 정해요.');
  await narr('새벽녘 갈대밭에 배를 댔다.\n등불이 셋 보였다.\n셋 다 나를 기다리고 있었다.');
  await say('so', '월하곡으로 가자. 곽 호법을 구하고 맹주의 정체를 강호에 밝혀. 구파일방에도 귀가 달린 사람은 있어.');
  await say('baekrang', '역적이 되셨네요, {호}. 패천도가 보자고 해요. 강호에서 맹주 목을 원하는 사람은 우리뿐이거든요.');
  await say('me', '사파 밑으로 들어오라는 얘기예요?');
  await say('baekrang', '정파가 당신한테 뭘 했는지 보세요. 우리는 적어도 값을 먼저 말하고 일을 시켜요.');
  await say('hyeok', F().gu_hyeok ? '향은 잘 쓰셨습니까. 저는 천마신교의 성녀 혁련하입니다.' : '처음 뵙습니다. 천마신교의 성녀 혁련하입니다.');
  await say('hyeok', '연경추는 우리 교의 심마였습니다. 교주를 깨워 제 것으로 쓰려고 교단을 배신했지요. 저희도 그를 죽여야 합니다.');
  await say('me', '마교가 저를 돕겠다고요?');
  await say('hyeok', '정파는 당신의 집을 불태웠고, 사파는 당신을 값으로 보고, 저희는 당신을 열쇠로 봅니다. 셋 중 누가 가장 솔직합니까.');
  await say('boat', '배는 네가 말하는 데로 간다. 이제 너한테 명령할 사람은 없다.');
  const c = await choice('누구의 손을 잡을까?', ['소연하와 월하곡으로 간다 (정파)', '백랑을 따라 흑도맹으로 간다 (사파)', '혁련하를 따라 서쪽으로 간다 (마교)', '아무의 손도 잡지 않는다 (낭인)']);
  if (c === 0) return toJeong();
  if (c === 1) return toSa();
  if (c === 2) return toMa();
  return toFree();
}
export async function toWolha() {
  set('c4a');
  await narr('제6부 · 달이 진 골짜기\n\n달이 없는 밤, 강을 거슬러 올랐다.\n열일곱 해 만에 돌아온 곳이었다.');
  ctx.goal('월하곡의 흔적 세 곳을 살펴보기');
  await ctx.warp('wolha', 22, 37, 1);
}
async function toJeong() {
  S().side = 'jeong'; ctx.rep('jeong', 2);
  await say('me', '월하곡으로 가요. 아주머니가 먼저예요.');
  await say('baekrang', '장사가 안 되네요. 외상으로 달아 둘게요.');
  await say('hyeok', '열쇠를 들고 그곳에 가십니까. 다음에 뵐 때는 서로 칼을 쥐고 있겠군요.');
  await toWolha();
}
async function toFree() {
  S().side = 'free';
  await say('me', '다들 고맙습니다. 저는 밥값만 받으러 갈게요. 혼자서요.');
  await say('so', '혼자서? 맹주 앞까지?');
  await say('me', '군막에서는 그게 기본이었어요.');
  await say('baekrang', '하, 어느 쪽에서도 값을 못 받는 사람이네요. 재미있어요.');
  await say('hyeok', '열쇠는 늘 혼자 돌아다니다 잃어버리는 법입니다.');
  await say('yun', '저는 청하진으로 돌아갈게요. 장부는 열어 둘 테니까 살아서 갚으러 와요.');
  await say('boat', '그래. 네가 제일 잘 아는 길이지.');
  await toWolha();
}

// ── 사파의 길 ──
async function toSa() {
  S().side = 'sa'; ctx.rep('sa', 3); ctx.rep('jeong', -2); F().fort_open = true;
  await say('me', '백랑 씨, 그 값이 얼마예요.');
  await say('baekrang', '당신 칼 한 자루요. 싸죠?');
  await say('so', '…사파 밑으로 들어가겠다고? 그럼 월하곡에서 보자. 어느 쪽에 서 있든 곽 호법은 내가 먼저 찾아.');
  await say('yun', '사파 쪽에도 다치는 사람은 있겠죠. 장부는 제가 챙길게요.');
  await say('hyeok', '값을 고르셨군요. 값은 언제나 오릅니다.');
  set('sa1'); ctx.goal('산채 안의 패천도 사마웅 만나기');
  await narr('제4부 · 흑도맹\n\n열흘 뒤, 동쪽 산길.\n맹호의 산채에 검은 깃발 열두 개가 올라가 있었다.');
  await ctx.warp('fort', 18, 22, 1);
}
async function samaungMeet() {
  await say('samaung', '네 이름은 들었다. {호} {나}.');
  await say('me', '맹주 목을 원하신다고 들었습니다.');
  await say('samaung', '이십 년을 원했다. 그자가 화해주라며 내 형제 열둘을 객잔에 불러 모았지. 술은 달았고, 열둘 다 그 자리에서 죽었다.');
  await say('me', '그것도 장부에는 사파 잘못으로 적혀 있겠네요.');
  await say('samaung', '그래서 나는 종이를 안 믿는다. 약속만 믿는다.');
  if (F().lion_debt) { await say('lion', '형님, 이놈이 나를 살려 준 놈이오. 칼은 잘 쓰는데 쓸데없는 말이 많소.'); await say('samaung', '맹호가 보증을 서는 건 처음 보는군.'); }
  await say('samaung', '입맹 절차는 하나다. 여기 막고가 네 목을 노린다. 서 있으면 들어온 거다.');
  await say('makgo', '…');
  await ctx.duel({ foes: ['makgo'], arena: 'fort', bgm: 'boss', title: '혈수 막고', yieldAt: .25 });
  await say('makgo', '…합격.');
  await say('samaung', '일감이 셋 있다. 순서는 네 마음대로 해라. 청하진 앞을 지나는 정천맹 군량선, 구화성 객관 서고의 제갈세가 명령서, 구파 회관의 혜각.');
  await say('me', '혜각 대사를요?');
  await say('samaung', '혈의방에 들어온 의뢰다. 하기 싫으면 말해라. 대신 안 한 일의 값은 내가 정한다.');
  ctx.note('흑도맹 입맹. 사마웅의 일감: 군량선, 제갈세가 명령서, 혜각 대사.');
  set('sa2'); ctx.goal('사마웅의 일감 셋 (청하진 나루, 구화성 정천맹 객관, 구파 회관). 순서는 자유');
}
async function jobShip() {
  if (F().wei_spared) await say('wei', '물 위에서 보자고 했지, 점소이. 빚 갚으러 왔다.');
  else await say('pirate', '위충 대장은 관아에 있소. 우리끼리 왔소이다.');
  await ctx.duel({ foes: ['jeong_guard', 'jeong_guard', 'jeong_elite'], allies: F().wei_spared ? ['wei_ally'] : [], arena: 'dock', bgm: 'fight', title: '정천맹 군량선' });
  await narr('곡식 삼백 섬. 창고 문을 열자 쌀 냄새가 났다.\n나루 사람들이 멀리서 보고 있었다.');
  const c = await choice('쌀을 어떻게 할까?', ['절반을 나루 사람들에게 푼다', '전부 산채로 올려 보낸다']);
  if (c === 0) { await say('elder', '…자네 쌀인가, 사파 쌀인가.'); await say('me', '쌀은 쌀이죠.'); ctx.rep('jeong', 1); F().sa_rice = true; }
  else { await say('town', '저게 다 사람 먹을 쌀인데.'); ctx.rep('sa', 2); }
  F().sa_job1 = true; jobCheck();
}
async function jobPaper() {
  await narr('정천맹 객관 서고.\n연회 날의 술 냄새가 아직 남아 있었다.');
  await say('clerk', '누구냐!');
  await ctx.duel({ foes: ['shadow2', 'shadow2', 'jeong_elite'], arena: 'room', bgm: 'fight', title: '정천맹 객관 서고' });
  await say(null, '궤짝 맨 아래에서 제갈세가의 인장이 찍힌 명령서가 나왔다. “월하문 토벌. 어린 것도 남기지 말 것. 북쪽 변경의 일도 이와 같이.”');
  await say('me', '…북쪽 변경의 일.');
  await narr('다섯 살 때 재가 된 마을이 떠올랐다.\n전쟁이 지나갔다고 다들 말했었다.');
  ctx.note('제갈세가 명령서: “어린 것도 남기지 말 것. 북쪽 변경의 일도 이와 같이.”');
  const c = await choice('명령서를 어떻게 할까?', ['사마웅에게 그대로 넘긴다', '베껴서 개방에도 흘린다']);
  if (c === 0) ctx.rep('sa', 2); else { ctx.rep('jeong', 2); F().sa_leak = true; }
  F().sa_job2 = true; jobCheck();
}
async function jobMonk() {
  await say('clan_shaolin', '시주가 올 줄 알았소. 앉으시오.');
  await say('me', '혈의방 일감으로 왔습니다. 대사를 베라는 일입니다.');
  await say('clan_shaolin', '그 일감은 십칠 년 늦었소. 노납은 월하곡에서 깃발을 내리지 못한 사람이오. 베어도 할 말이 없소.');
  const c = await choice('혜각이 염주를 내려놓는다.', ['칼을 뽑는다', '칼을 거둔다']);
  if (c === 0) {
    await ctx.duel({ foes: ['clan_shaolin'], arena: 'court', bgm: 'boss', title: '소림 혜각' });
    await narr('혜각은 끝내 손을 들지 않았다.\n그날 저녁 소림의 종이 백여덟 번 울렸다.');
    F().hyegak_dead = true; ctx.rep('sa', 3); ctx.rep('jeong', -4); ctx.note('혜각 대사를 베었다. 소림은 나를 잊지 않을 것이다.');
  } else {
    await say('me', '값은 제가 치를게요.');
    await say('clan_shaolin', '아미타불. 그럼 이것을 가져가시오. 소림의 이름으로 쓴 참회문이오. 언젠가 쓸 데가 있을 것이오.');
    F().sa_refused = true; ctx.rep('jeong', 2); ctx.note('혜각 대사를 베지 않고 참회문을 받았다.');
  }
  F().sa_job3 = true; jobCheck();
}
function jobCheck() { if (F().sa_job1 && F().sa_job2 && F().sa_job3) ctx.goal('산채로 돌아가 사마웅에게 알리기'); }
async function saReturn() {
  if (F().sa_refused) { await say('samaung', '혜각이 살아 있다더군. 안 한 일의 값은 내가 정한다고 했다. 월하곡 맨 앞자리에 서라. 그게 값이다.'); await say('me', '맨 앞은 제 전공이에요.'); }
  else await say('samaung', '일은 다 했군. 약속대로 맹주 목을 칠 자리에 네 칼을 세워 주마.');
  if (F().sa_rice) await say('baekrang', '쌀을 풀었다면서요. 나루에서 당신 욕이 절반으로 줄었어요. 장사 잘하네요.');
  await say('samaung', '연경추는 달이 없는 밤에 월하곡으로 간다. 우리도 간다.');
  await say('yun', '붕대 많이 챙겼어요. 이번엔 약값 안 깎아 줘요.');
  await toWolha();
}

// ── 마교의 길 ──
async function toMa() {
  S().side = 'ma'; ctx.rep('ma', 3); ctx.rep('jeong', -3); ctx.rep('sa', -1); F().ma_open = true;
  await say('so', '{나}. 지금 뭘 하는 거야.');
  await say('me', '제가 제일 잘 아는 일이요. 저를 쓰겠다는 사람 밑으로 들어가는 거.');
  await say('so', '…다음에 보면 칼로 인사할게.');
  await say('yun', '거기는 못 가요. 사람 살리려고 배운 손이에요.');
  await say('yun', '돌아오면 팔부터 봐 줄게요. 살아서 와요.');
  G.S.love.yun = Math.max(0, (G.S.love.yun || 0) - 14); G.S.love.so = Math.max(0, (G.S.love.so || 0) - 14);
  set('ma1'); ctx.goal('제단 앞의 혁련하와 이야기하기');
  await narr('제4부 · 붉은 초승달\n\n청풍골 서쪽 절벽에 문이 있었다.\n청하진에서 반나절 거리였다.\n십칠 년 동안 아무도 몰랐다.');
  await ctx.warp('shrine', 7, 8, 1);
}
async function maRite() {
  await say('hyeok', '입교에는 의식이 있습니다. 이름을 제단에 올리는 것입니다. 앞으로는 교주께서 내리시는 호로만 불립니다.');
  await say('me', '군막에서 번호로 십삼 년을 살았습니다.');
  const c = await choice('제단의 불이 낮게 흔들린다.', ['이름을 올린다', '이름만은 못 버린다고 한다']);
  if (c === 0) { await say('hyeok', '…네. 받았습니다.'); ctx.rep('ma', 2); F().name_given = true; }
  else { await say('hyeok', '처음 듣는 대답입니다. 교주께서 그런 사람을 가장 좋아하셨다고 합니다. 가장 먼저 부수셨으니까요.'); ctx.love('hyeok'); }
  await say('hyeolma', '이게 열쇠냐. 살이 없구나.');
  await say('hyeok', '혈마 님.');
  await say('hyeolma', '심마를 칠 칼이 필요하다는 말은 들었다. 쓸모를 보여라. 구화성 금봉 객잔에 심마의 밀정이 있다. 창운문 장서각에 제단 열쇠가 있다.');
  await say('hyeolma', '그리고 이것. 혈우의 씨앗이다. 청하진 우물에 부어라. 달이 뜨는 날 제물이 필요하다.');
  await say('me', '…청하진이요.');
  await say('hyeolma', '네 마을이냐. 그럼 더 잘 듣겠구나.');
  ctx.note('천마신교 입교. 혈마의 시험: 금봉 객잔의 밀정, 장서각의 제단 열쇠, 청하진 우물의 혈우.');
  set('ma2'); ctx.goal('혈마의 시험 셋 (구화성 금봉 객잔, 창운문 장서각, 청하진 우물가). 순서는 자유');
}
async function jobSpy() {
  await narr('금봉 객잔 구석 자리.\n국수를 시켜 놓고 한 젓가락도 들지 않는 손님들이 있었다.');
  await ctx.duel({ foes: ['myeon', 'myeon', 'myeon'], arena: 'room', bgm: 'fight', title: '무면당 밀정' });
  await say(null, '쓰러진 밀정의 품에서 낡은 나무패가 나왔다. 불에 지진 번호가 적혀 있다.');
  await say('me', '…이거 견대 번호패예요. 왜 이게 여기 있어요.');
  await say('hyeok', '무면당은 전쟁터에서 고아를 사 갑니다. 심마가 그렇게 조직을 키웠습니다. 당신 부대도 그중 하나였습니다.');
  ctx.note('무면당 밀정이 견대 번호패를 지니고 있었다. 견대는 심마가 고아를 모으던 곳이었다.');
  ctx.rep('ma', 1); F().ma_job1 = true; maCheck();
}
async function jobKey() {
  await say('go', '사제. 돌아와라. 문주께서 아직 네 이름을 명부에서 지우지 않으셨다.');
  await say('me', '사형, 저 그 궤짝이 필요해요.');
  const c = await choice('고진이 궤짝 앞을 막아선다.', ['베고 지나간다', '사정을 말하고 열쇠만 받는다']);
  if (c === 0) {
    await ctx.duel({ foes: ['senior_go'], arena: 'room', bgm: 'boss', title: '사형 고진' });
    await say('go', '…수련을… 게을리했구나, 내가.');
    F().go_dead = true; ctx.rep('ma', 2); ctx.rep('jeong', -2);
  } else {
    await say('go', '…가져가라. 이게 네가 받는 마지막 은혜다. 다음엔 사형이라 부르지 마라.');
    ctx.rep('jeong', 1);
  }
  F().ma_job2 = true; maCheck();
}
async function jobWell() {
  await narr('청하진 우물가.\n아이들이 물을 긷다 말고 놀고 있었다.');
  await say('kid', '쟁반 형이다! 쟁반 또 던져 봐요!');
  await say('me', '…물 긷는 데서 놀면 안 돼. 저리 가 있어.');
  const c = await choice('품속의 항아리가 무겁다.', ['항아리를 우물에 붓는다', '항아리를 깨 버린다']);
  if (c === 0) {
    await narr('사흘 뒤부터 마을에서 기침 소리가 났다.\n윤씨 약방의 불이 밤새 꺼지지 않았다.');
    F().plague = true; ctx.rep('ma', 4); ctx.rep('jeong', -5); G.S.love.yun = 0;
    ctx.note('청하진 우물에 혈우를 부었다.');
  } else {
    await say('me', '군막에서는 시키는 대로 했어요. 그래서 여기까지 왔죠.');
    F().ma_defy = true; ctx.rep('jeong', 2); ctx.note('혈우 항아리를 깨 버렸다. 혈마가 가만있지 않을 것이다.');
  }
  F().ma_job3 = true; maCheck();
}
function maCheck() { if (F().ma_job1 && F().ma_job2 && F().ma_job3) ctx.goal('청풍골 서쪽 분타로 돌아가 혁련하에게 알리기'); }
async function maReturn() {
  if (F().ma_defy) {
    await say('hyeolma', '항아리가 깨졌더군. 열쇠는 손잡이만 있으면 된다. 나머지는 잘라 내겠다.');
    await say('hyeok', '혈마 님. 제 앞에서는 안 됩니다.');
    await ctx.duel({ foes: ['hyeolma'], allies: ['hyeok_ally'], arena: 'moon', bgm: 'boss', title: '혈마' });
    F().hyeolma_dead = true;
    await say('hyeok', '성녀가 마왕을 베었습니다. 이제 저도 돌아갈 곳이 없습니다.');
    ctx.love('hyeok', 2);
  } else if (F().plague) await say('hyeolma', '잘했다. 네 마을의 기침 소리가 여기까지 들린다.');
  await say('hyeok', '심마는 달이 없는 밤에 월하곡으로 갑니다. 일곱 장이 모이는 곳입니다.');
  await toWolha();
}

// ── 월하곡 결전 ──
export async function chiefBattle() {
  const s = side(), won = clansWon(); let allies = [], mul = 1;
  if (s === 'jeong') {
    await say('so', '{나}! 내 사부 몫도 있어!');
    await say('cheol', '시주, 이 문도 내가 부수겠소!');
    await say('chief', '일곱 장이 다 모였구나. 고맙다. 이제 네 손을 놓거라.');
    allies = ['so_ally', 'cheol_ally'];
    if (won >= 5) { await say('clan_shaolin', '아미타불. 소림이 십칠 년 묵은 빚을 갚으러 왔소.'); allies.push('hyegak_ally'); }
    if (won >= 10) { await say('clan_namgung', '남궁의 검은 출신을 묻지 않기로 했다. 맹주, 당신의 출신은 물어야겠군.'); allies.push('namgung_ally'); }
    if (won >= 15) { await narr('골짜기 위로 깃발이 하나둘 올라왔다.\n소림, 무당, 화산, 종남, 아미, 곤륜, 공동, 점창, 청성, 개방.\n남궁, 모용, 제갈, 당가, 팽가.\n열일곱 해 전 이곳을 둘러쌌던 깃발들이, 이번에는 맹주를 향해 섰다.'); mul = .8; }
  }
  if (s === 'sa') {
    await say('samaung', '연경추. 화해주 값 받으러 왔다.');
    await say('chief', '사마웅. 네가 올 줄은 알았다. 저 아이를 데려올 줄은 몰랐지만.');
    await say('samaung', '{호}. 약속대로 맹주 앞이다.');
    await ctx.duel({ foes: ['jeong_elite', 'jeong_elite', 'shadow2'], allies: ['samaung_ally'], arena: 'moon', bgm: 'fight', title: '정천맹 친위대' });
    allies = ['samaung_ally'];
    if (F().wei_spared) { await say('wei', '물길은 내가 끊어 놨다, 점소이!'); allies.push('wei_ally'); }
    if (F().lion_debt) { await say('lion', '이 값은 나도 받아야겠다!'); allies.push('lion_ally'); }
  }
  if (s === 'ma') {
    await say('so', '거기까지야. 정천맹 때문이 아니야. 네가 그쪽에 서 있어서 그래.');
    await say('cheol', '시주. 이 문은 내가 지키겠소. 문을 지키는 건 처음이오.');
    await ctx.duel({ foes: ['so_final'], allies: ['hyeok_ally'], arena: 'moon', bgm: 'boss', title: '소연하', yieldAt: .3 });
    await say('so', '…가. 맹주는 네가 베어. 그다음은 나야.');
    await say('chief', '성녀까지 왔느냐. 교주를 깨우는 건 나다. 너희는 구경이나 해라.');
    await say('hyeok', '심마. 교의 이름으로 당신을 파문합니다.');
    allies = ['hyeok_ally'];
  }
  if (s === 'free') {
    await say('chief', '혼자 왔구나. 곽란이 너를 그렇게 키웠느냐.');
    await say('me', '키운 건 군막이에요. 밥을 먹인 건 아주머니고요.');
    if (S().sworn === 'cheol') { await say('cheol', '아우! 혼자 가면 밥은 누가 사오! 문 부수러 왔소!'); allies = ['cheol_ally']; }
    mul = .75;
  }
  await ctx.duel({ foes: ['chief'], allies, foeHpMul: mul, arena: 'moon', bgm: 'boss', title: '정천맹주 연경추' });
  await say('chief', '…왜지. 나는 다 익혔는데. 왜 네 달이 더 밝은 게냐.');
  await say('me', '걸레질을 안 해 보셨잖아요.');
  await say('chief', '하하… 그래도 늦었다. 일곱 장은 이미 천산을 향해 있다. 교주께서… 깨어나신다…');
  if (s === 'jeong') { await say('so', '천산? 교주? 저 사람 지금 무슨 소리를 하는 거야.'); await say('cheol', '…시주들. 달을 보시오.'); }
}

// ── 결말 ──
const hook = line => narr(`그해 겨울, 서쪽 하늘에 붉은 달이 떴다.\n${line}\n\n강호행 · 제1막 끝\n이야기는 제7부 ‘붉은 달’로 이어집니다.`);
function finish(map = 'cheongha') { set('end'); F().cleared = true; ctx.goal(''); return map === 'shrine' ? ctx.warp('shrine', 7, 8, 1) : ctx.warp('cheongha', 22.5, 16, 0); }
async function endSa() {
  await say('samaung', '약속은 지켰다. 맹주는 네 칼에 죽었고, 곽란은 네 사람이다. 일곱 장도 네 것이다.');
  await say('gwak', '사파 밥을 먹었다며.');
  await say('me', '밥은 밥이죠.');
  await say('gwak', '…그래. 살아 돌아왔으니 된 거지. 방값은?');
  await narr('정천맹이 무너지자 구파일방은 산문을 닫았고\n흑도맹의 검은 깃발이 장강을 따라 내려갔다.\n강호의 장부는 이제 사파가 쓴다.', 'end_sa');
  if (F().hyegak_dead) await narr('소림의 승병들이 산을 내려왔다는 소문이 돌았다.\n맨 앞의 깃발에는 내 이름이 적혀 있다고 했다.');
  const c = await choice('사마웅이 부맹주 자리를 내민다.', ['부맹주 자리를 받는다', '비무를 청해 맹주 자리를 건다', '밥값은 받았으니 떠난다']);
  if (c === 0) { F().ending = 'sa_vice'; await narr('그날부터 흑도맹에는 쟁반을 든 부맹주가 있었다.\n사마웅은 술을 마실 때마다 약속 얘기를 했다.'); }
  if (c === 1) {
    await say('samaung', '하하! 그 말을 기다렸다. 약속대로 해 주마.');
    await ctx.duel({ foes: ['samaung_foe'], arena: 'fort', bgm: 'boss', title: '패천도 사마웅', yieldAt: .15 });
    await say('samaung', '…졌다. 약속은 지킨다. 오늘부터 네가 맹주다.');
    F().ending = 'sa_lord'; await narr('군적에서 지워진 개가\n강호 절반의 맹주가 되었다.');
  }
  if (c === 2) { F().ending = 'sa_leave'; await say('baekrang', '돈도 자리도 안 챙기고요? 정말 장사 못 하네요. 외상 장부는 안 지워요.'); await narr('낭인은 다시 길을 나섰다.\n곽 아주머니의 국수 한 그릇만 품에 안은 채.'); }
  await hook('정파의 깃발이 내려간 강호를 마교는 오래 기다려 왔다.');
  await finish();
}
async function endMa() {
  await say('hyeok', '일곱 장이 다 모였습니다. 제단이 기다립니다.');
  await say('gwak', '…그 옷은 뭐냐.');
  await say('me', '일복이에요.');
  await say('gwak', '네 어미가 그 제단을 잠그다 죽었다. 알고나 입어라.');
  if (F().plague) { await say('gwak', '청하진 우물에 뭘 넣었냐.'); await say('me', '…….'); await say('gwak', '그래. 나는 이제 국수를 끓여 먹일 사람이 없다.'); }
  const c = await choice('일곱 장을 제단에 올렸다. 혁련하가 마지막 말을 기다린다.', ['봉인을 푼다. 천마를 깨운다', '봉인을 다시 잠그고 신교를 내가 잇는다', '일곱 장을 태우고 등을 돌린다']);
  if (c === 0) { F().ending = 'ma_awake'; await say('hyeok', '…교주께서 깨어나십니다.'); await narr('달이 안쪽에서부터 붉게 물들었다.\n강호의 모든 칼이 한꺼번에 떨었다.\n천마의 오른손에는 쟁반을 든 낭인이 서 있었다.', 'end_ma'); }
  if (c === 1) {
    if (!F().hyeolma_dead) { await say('hyeolma', '열쇠가 문을 고르겠다는 거냐.'); await ctx.duel({ foes: ['hyeolma'], allies: ['hyeok_ally'], arena: 'moon', bgm: 'boss', title: '혈마' }); F().hyeolma_dead = true; }
    F().ending = 'ma_lord'; await say('hyeok', '천마는 그대로 잠듭니다. 교단에는 주인이 필요합니다. 당신이 교주입니다.');
    await narr('천마신교는 삼백 년 만에 살아 있는 교주를 맞았다.\n첫 번째 교령은 짧았다.\n“밥은 먹고 다녀라.”', 'end_ma');
  }
  if (c === 2) { F().ending = 'ma_leave'; await say('hyeok', '그럴 줄 알았습니다. 문은 열어 두겠습니다.'); await narr('일곱 장은 재가 되었다.\n정파도 사파도 마교도 낭인 하나를 쫓기 시작했다.', 'end_free'); }
  await hook(F().ending === 'ma_awake' ? '이제 그 달은 저물지 않는다.' : '심마가 남긴 불씨는 꺼지지 않았다.');
  await finish(F().ending === 'ma_leave' ? 'cheongha' : 'shrine');
}
async function endFree() {
  await say('gwak', '혼자 왔냐.');
  await say('me', '네.');
  await say('gwak', '못난 놈. 밥은?');
  await say('me', '아직이요.');
  await say('gwak', '장부 봤지. 네 밥값은 첫날 끝났다. 그래도 칼은 네가 찾아갔으니 이제 갈 데 가라.');
  await say('me', '어디로요.');
  await say('gwak', '네 발이 아는 데로.');
  const c = await choice('찢어진 일곱 장을 앞에 두고', ['태운다. 어느 쪽도 못 갖게', '곽 아주머니에게 맡긴다', '품에 넣고 혼자 떠난다']);
  F().ending = 'free' + c;
  if (c === 0) await narr('일곱 장은 재가 되어 강으로 날아갔다.\n그 뒤로 강호에 걸레질이 유독 빠른 낭인이 있다는 소문이 돌았다.', 'end_free');
  if (c === 1) await narr('달맞이 객잔이 다시 문을 열었다.\n구석방 앞에는 오늘도 국 한 그릇이 놓인다.\n손님은 아직 돌아오지 않았다.', 'end_jeong');
  if (c === 2) await narr('새벽 안개 낀 강가 길에 발자국 하나가 이어졌다.\n왼발이 조금 깊었다.', 'end_free');
  await hook('어느 깃발에도 적히지 않은 이름 하나가 그 달 아래를 걷고 있었다.');
  await finish();
}
export async function routeEnding() { const s = side(); if (s === 'sa') await endSa(); else if (s === 'ma') await endMa(); else await endFree(); }
G.route = { crossroads, toWolha, chiefBattle, routeEnding, side };

// ── 지도별 사람과 일감 ──
const job = (o) => ({ dir: 0, mark: () => true, ...o });
Story.providers.push(function routes(id) {
  const n = [], ro = [], sd = S().side, has = k => !F()[k];
  if (id === 'guhwa' && after('c3b') && !after('c4a')) {
    n.push({ id: 'baekrang', spr: 'Cavegirl', x: 17, y: 27, dir: 3, mark: () => !F().gu_bae, talk: async () => { if (!F().gu_bae) await baeGuhwa(); else await say('baekrang', '소문은 신선할 때 파는 거예요.'); } });
    n.push({ id: 'hyeok', spr: 'Hyeok', x: 33, y: 27, dir: 2, mark: () => !F().gu_hyeok, talk: async () => { if (!F().gu_hyeok) await hyeokGuhwa(); else await say('hyeok', '바람이 서쪽에서 불고 있습니다.'); } });
  }
  if (sd === 'sa') {
    if (id === 'fort') {
      n.push({ id: 'samaung', spr: 'Samaung', x: 18, y: 20, dir: 0, mark: () => at('sa1') || (at('sa2') && !!F().sa_job1 && !!F().sa_job2 && !!F().sa_job3), talk: async () => { if (at('sa1')) await samaungMeet(); else if (at('sa2') && F().sa_job1 && F().sa_job2 && F().sa_job3) await saReturn(); else await say('samaung', '약속은 지켜라.'); } });
      n.push({ id: 'baekrang', spr: 'Cavegirl', x: 13, y: 20, dir: 3, talk: async () => { await say('baekrang', '소문은 신선할 때 파는 거예요. 지금 강호에서 제일 신선한 건 당신 이름이고요.'); } });
      if (F().lion_debt) n.push({ id: 'lion', spr: 'Lion', x: 23, y: 20, dir: 2, talk: async () => { await say('lion', '여기가 내 산채였다는 건 이제 아무도 기억 안 한다.'); } });
    }
    if (at('sa2')) {
      if (id === 'cheongha' && has('sa_job1')) n.push(job({ id: 'pirate', spr: 'Villager3', x: 24, y: 25, hint: '군량선 치기', talk: jobShip }));
      if (id === 'hall2' && has('sa_job2')) n.push(job({ id: 'clerk', spr: 'Inspector', x: 7, y: 4.6, hint: '서고 뒤지기', talk: jobPaper }));
      if (id === 'ninehall' && has('sa_job3')) n.push(job({ id: 'job_monk', spr: 'Monk', x: 9, y: 11, hint: '혜각 대사 찾기', talk: jobMonk }));
    }
  }
  if (sd === 'ma') {
    if (id === 'shrine') {
      n.push({ id: 'hyeok', spr: 'Hyeok', x: 7, y: 4.8, dir: 0, mark: () => at('ma1') || (at('ma2') && !!F().ma_job1 && !!F().ma_job2 && !!F().ma_job3), talk: async () => { if (at('ma1')) await maRite(); else if (at('ma2') && F().ma_job1 && F().ma_job2 && F().ma_job3) await maReturn(); else await say('hyeok', '제단의 불은 꺼지지 않습니다. 사람이 먼저 꺼질 뿐입니다.'); } });
    }
    if (at('ma2')) {
      if (id === 'inn2' && has('ma_job1')) n.push(job({ id: 'job_spy', spr: 'GrayNinja', x: 13.7, y: 8.6, hint: '밀정 찾기', talk: jobSpy }));
      if (id === 'library' && has('ma_job2')) n.push(job({ id: 'job_go', spr: 'Inspector', x: 7.5, y: 5, hint: '장서각 궤짝', talk: jobKey }));
      if (id === 'cheongha' && has('ma_job3')) n.push(job({ id: 'kid', spr: 'Child', x: 21, y: 23.5, hint: '우물가로 가기', talk: jobWell }));
    }
  }
  if (id === 'guhwa' && (sd === 'sa' || sd === 'ma') && !at('end')) ro.push({ spr: 'chars/Knight', x: 24, y: 24, foes: ['jeong_guard', 'jeong_guard'] }, { spr: 'chars/Knight', x: 12, y: 16, foes: ['jeong_elite'] });
  return { npcs: n, spots: [], trigs: [], roam: ro };
});
