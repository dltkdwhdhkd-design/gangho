// 세력 갈림: 천하비무 뒤 누구의 손을 잡느냐에 따라 길과 결말이 달라진다
import { G, Sound, fadeTo, toast } from './core.js';
import { Story, ctx, say, narr, choice } from './ctx.js';
import { WHO } from './dialog.js';
import { FOES } from './foes.js';
import { set, at, after } from './story1.js';
import { clansWon } from './clandata.js';

const S = () => G.S, F = () => G.S.flags, side = () => G.S.side || 'jeong';
Object.assign(WHO, { samaung: { name: '패천도 사마웅', face: 'Samaung' }, hyeok: { name: '혁련하', face: 'Hyeok' }, hyeolma: { name: '혈마', face: 'Skeleton' }, makgo: { name: '혈수 막고', face: 'RedNinja' }, clerk: { name: '서기', face: 'Inspector' }, manhwa: { name: '만화부인', face: 'Woman' }, guyang: { name: '구양철', face: 'Caveman2' }, ogang: { name: '오강', face: 'Villager3' }, namhwa: { name: '남화', face: 'Woman' }, myeon: { name: '무면당 밀정', face: 'GrayNinja' } });
const foe = (name, spr, hp, atk, def, spd, exp, silver, pause, moves, o = {}) => ({ name, spr, hp, atk, def, spd, exp, silver, pause, moves, ...o });
Object.assign(FOES, {
  jeong_guard: foe('정천맹 순찰', 'chars/Knight', 420, 30, 9, 62, 80, 30, 1.05, ['double', 'lunge', 'heavy'], { wpn: 'Sword', guard: .5 }),
  jeong_elite: foe('정천맹 검수', 'chars/Knight', 700, 38, 11, 68, 130, 50, .95, ['double', 'lunge', 'cloud_flash'], { wpn: 'Sword', guard: .6, elite: 1 }),
  myeon: foe('무면당 밀정', 'chars/GrayNinja', 520, 38, 9, 82, 110, 30, .95, ['quick', 'blink', 'dart3', 'lunge'], { wpn: 'Ninjaku', guard: .5 }),
  makgo: foe('혈수 막고', 'chars/RedNinja', 2000, 34, 9, 86, 320, 200, .85, ['flurry', 'blink', 'dart3', 'lunge'], { wpn: 'Ninjaku', guard: .7, boss: 1, poise: 220 }),
  hyeolma: foe('혈마', 'chars/Skeleton', 3000, 40, 11, 66, 520, 300, .85, ['venom', 'heavy', 'spin', 'quake'], { wpn: 'Axe', guard: .6, boss: 1, poise: 280 }),
  samaung_foe: foe('패천도 사마웅', 'chars/Samaung', 4500, 48, 15, 62, 700, 500, .85, ['heavy', 'quake', 'spin', 'charge'], { wpn: 'BigSword', guard: .8, boss: 1, poise: 360 }),
  samaung_ally: foe('사마웅', 'chars/Samaung', 2400, 46, 16, 62, 0, 0, 1.1, ['heavy', 'quake', 'spin'], { wpn: 'BigSword' }),
  hyeok_ally: foe('혁련하', 'chars/Hyeok', 1400, 44, 9, 78, 0, 0, 1, ['blood_fan', 'blink', 'fan5'], { wpn: 'Ninjaku' }),
  wei_ally: foe('위충', 'chars/Paeng', 1200, 36, 10, 66, 0, 0, 1.1, ['double', 'lunge'], { wpn: 'Sword' }),
  lion_ally: foe('맹호', 'chars/Lion', 1700, 40, 13, 58, 0, 0, 1.2, ['heavy', 'spin'], { wpn: 'BigSword' }),
});

// ── 구화성에서 먼저 손을 내미는 사람들 ──
async function baeGuhwa() {
  await say('baekrang', '어머, 또 보네요. 대회 구경 왔어요? 저는 일하러 왔어요.');
  await say('me', '도박장 주인이 구화성엔 어쩐 일이에요?');
  await say('baekrang', '하오문이라고 들어 봤죠? 도박장은 간판이고 우리는 소문을 팔아요. 사람 많은 데는 다 가요.');
  await say('baekrang', '일 하나 할래요? 정천맹 창고에 장부가 하나 있는데 그것 좀 가져다줘요. 은자 백 냥 줄게요. 지키는 사람은 둘뿐이에요.');
  const c = await choice('백랑이 주사위 통을 흔들며 기다린다.', ['맡는다', '정천맹 창고는 건드리기 싫다고 한다']);
  F().gu_bae = true;
  if (c === 0) {
    await ctx.duel({ foes: ['jeong_guard', 'jeong_guard'], arena: 'room', bgm: 'fight', title: '정천맹 창고' });
    await say('baekrang', '빠르네요. 이거 구파일방 장로들이 뒷돈 받은 장부예요. 나중에 쓸 데가 있거든요.');
    ctx.silver(100); ctx.rep('sa', 2); ctx.love('baekrang');
    ctx.note('백랑은 하오문 사람이다. 정천맹 장로들의 뒷돈 장부를 훔쳐다 주었다.');
  } else { await say('baekrang', '알았어요. 나중에 마음 바뀌면 찾아와요.'); ctx.rep('jeong', 1); }
}
async function hyeokGuhwa() {
  await say('hyeok', '향 사시겠습니까. 달맞이꽃으로 만든 향입니다.');
  await say('me', '이쪽에선 안 나는 꽃인데요.');
  await say('hyeok', '천산 아래에서 납니다. 그런데 걸음이 특이하시군요. 허리를 세우고 왼발로 미는 걸음입니다.');
  await say('me', '누구세요?');
  await say('hyeok', '향 장수입니다.');
  const c = await choice('여인의 눈이 붉은빛을 띤다.', ['향을 산다 (10냥)', '어디서 그 걸음을 봤는지 묻는다', '그냥 지나간다']);
  F().gu_hyeok = true;
  if (c === 0) { S().silver = Math.max(0, S().silver - 10); F().gu_incense = true; await say('hyeok', '맹주가 권하는 잔은 조심하십시오. 덤입니다.'); ctx.rep('ma', 1); ctx.love('hyeok'); ctx.note('서역 향 장수: 맹주가 권하는 잔을 조심하라고 했다.'); }
  if (c === 1) { await say('hyeok', '아는 사람의 걸음과 같아서 여쭈었습니다. 정파 사람도 사파 사람도 아닙니다.'); ctx.rep('ma', 1); ctx.note('서역 향 장수는 월하칠식의 걸음을 알아보았다.'); }
  if (c === 2) await say('hyeok', '네. 또 뵙겠습니다.');
}

// ── 갈림 ──
export async function crossroads() {
  F().cross = true;
  await narr('배는 불빛이 없는 쪽으로 내려갔다. 돌아보니 구화성 쪽 하늘이 벌겋게 물들어 있었다.');
  await say('boat', '나루마다 네 얼굴이 붙었다더구먼. 맹주를 독살하려 한 역적이라고.');
  await say('me', '독은 저쪽이 탔는데요.');
  await say('boat', '그걸 누가 믿겄어.');
  await say('yun', '지금 정천맹으로 돌아가면 다 죽어요. 어디로 갈지 정해요.');
  await fadeTo(1); F().night = true; G.field.load('valley', 23, 15, 2); await fadeTo(0);
  await narr('새벽녘에 갈대밭에 배를 댔다. 등불을 든 사람들이 먼저 와서 기다리고 있었다.');
  ctx.cg('cross');
  await say('so', '이제 어쩔 거야? 곽 호법이 월하곡에 있다며. 바로 가자.');
  await say('boat', '못 가. 그 골짜기는 물안개가 막고 있어서 일 년에 딱 한 번, 가을 그믐밤에만 배가 들어가. 뱃사람들은 다 아는 얘기여.');
  await say('me', '그게 언제인데요?');
  await say('boat', '두 달 뒤구먼.');
  await say('so', '그럼 두 달 동안 맹주가 한 짓을 강호에 다 까발리자. 구파일방에도 말이 통하는 사람은 있을 거야.');
  await say('baekrang', '역적이 되셨네요, {호}. 패천도가 보자고 하세요. 지금 맹주랑 맞붙을 사람은 그분밖에 없거든요.');
  await say('me', '사파에 들어오라는 얘기예요?');
  await say('baekrang', '정파가 뭘 해 줬는데요? 우리는 일한 만큼은 확실히 쳐줘요.');
  await say('hyeok', F().gu_incense ? '향은 잘 쓰셨습니까. 저는 천마신교의 성녀 혁련하입니다.' : F().gu_hyeok ? '또 뵙습니다. 저는 천마신교의 성녀 혁련하입니다.' : '처음 뵙습니다. 천마신교의 성녀 혁련하입니다.');
  await say('hyeok', '연경추는 원래 우리 교의 심마였습니다. 교주님을 깨워 자기 뜻대로 쓰려고 교단을 배신했습니다. 저희도 그자를 죽여야 합니다.');
  await say('me', '마교가 저를 돕겠다고요?');
  await say('hyeok', '월하문의 핏줄이 필요합니다. 봉인을 다룰 수 있는 사람은 당신뿐이니까요. 숨기지 않겠습니다.');
  await say('boat', '어디로 갈 거여? 배는 네가 가자는 대로 갈 텨.');
  ctx.cgOff();
  const c = await choice('누구의 손을 잡을까?', ['소연하와 맹주의 죄를 밝힌다 (정파)', '백랑을 따라 흑도맹으로 간다 (사파)', '혁련하를 따라 서쪽으로 간다 (마교)', '아무의 손도 잡지 않는다 (낭인)']);
  const go = [toJeong, toSa, toMa, toFree][c];
  await go();
}
export async function toWolha() {
  set('c4a'); F().night = false;
  await ctx.part(6, '달이 진 골짜기', '제1장 월하곡');
  await narr('가을 그믐밤, 물안개가 걷혔다. 달 없는 강을 거슬러 올라갔다. 세 살 때 떠난 곳이라 기억나는 것은 아무것도 없었다.');
  ctx.goal('월하곡의 흔적 세 곳을 살펴보기');
  await ctx.warp('wolha', 22, 37, 1);
}
async function toJeong() {
  S().side = 'jeong'; ctx.rep('jeong', 2);
  await say('me', '맹주부터 끌어내릴게요. 아주머니를 구해도 쫓기면 소용없으니까요.');
  await say('baekrang', '아쉽네요. 마음 바뀌면 복운전으로 와요.');
  await say('hyeok', '그렇습니까. 다음에는 칼을 들고 뵙게 되겠습니다.');
  await G.ch.jeong4();
}
async function toFree() {
  S().side = 'free';
  await say('me', '말씀은 고맙지만 저는 혼자 갈게요.');
  await say('so', '혼자서? 맹주한테?');
  await say('me', '혼자 움직이는 건 익숙해요.');
  await say('baekrang', '어느 쪽에도 안 붙겠다고요? 별난 사람이네.');
  await say('hyeok', '혼자서는 오래 못 가실 겁니다.');
  await say('yun', '저는 청하진으로 돌아갈게요. 몸조심해요. 살아서 와요.');
  await say('boat', '그려. 조심혀.');
  await G.ch.free4();
}

// ── 사파의 길 ──
async function toSa() {
  S().side = 'sa'; ctx.rep('sa', 3); ctx.rep('jeong', -2); F().fort_open = true;
  await say('me', '패천도를 만나 볼게요.');
  await say('baekrang', '잘 생각했어요. 안내할게요.');
  await say('so', '사파 밑으로 들어가겠다고? 알았어. 그럼 월하곡에서 보자.');
  await say('yun', '저도 갈게요. 거기도 다치는 사람은 있을 거 아니에요.');
  await say('hyeok', '그렇습니까. 알겠습니다.');
  set('sa1'); F().night = false; ctx.goal('산채 안의 패천도 사마웅 만나기');
  await ctx.part(4, '흑도맹', '입맹');
  await narr('열흘 뒤, 동쪽 산길을 올랐다. 맹호의 산채에 검은 깃발 열두 개가 올라가 있었다.');
  await ctx.warp('fort', 18, 22, 1);
}
async function samaungMeet() {
  await say('samaung', '네놈이 {호} {나}구나. 얘기는 들었다.');
  await say('me', '맹주를 치신다고 들었습니다.');
  await say('samaung', '이십 년 전부터 벼르고 있었지. 그놈이 화해하자고 내 형제 열둘을 객잔에 불러 놓고 독주를 먹였어. 그 자리에서 다 죽었다.');
  await say('me', '처음 듣는 얘기네요.');
  await say('samaung', '당연하지. 강호에는 사파가 술자리에서 난동을 부린 걸로 알려져 있으니까.');
  if (F().lion_debt) { await say('lion', '형님, 이놈이 저 살려 준 놈입니다. 칼은 잘 쓰는데 말을 너무 안 해요.'); await say('samaung', '네가 보증을 다 서냐? 별일이다.'); }
  await say('samaung', '우리는 입맹 절차가 간단하다. 여기 막고랑 붙어서 서 있으면 들어온 거다.');
  await say('makgo', '…');
  await ctx.duel({ foes: ['makgo'], arena: 'fort', bgm: 'boss', title: '혈수 막고', yieldAt: .25 });
  await say('makgo', '…됐습니다.');
  await narr('막고가 칼을 거두자 안쪽 평상에서 박수 소리가 났다. 흑도맹 수뇌들이 술상을 받아 놓고 구경하고 있었다.');
  await say('guyang', '남의 산채 마당을 잘도 파 놓는구나. 녹림 칠십이채 총채주 구양철이다. 마당값은 나중에 받으마.');
  await say('ogang', '장강수로채 오강이다. 위충이 너 하나 때문에 배를 세 번 띄웠다지. 물에서 만나면 너부터 빠뜨리마.');
  await say('namhwa', '오독문 남화예요. 그 잔은 내려놓으세요. 제가 따른 거라서요.');
  await say('manhwa', '하오문 만화예요. 백랑이 물어 온 손님이 이분이구나. 값이 얼마나 나갈지 두고 볼게요.');
  await say('samaung', '좋아. 일이 세 개 있다. 순서는 알아서 해. 청하진 앞을 지나는 정천맹 군량선 털기, 구화성 객관 서고에서 제갈세가 명령서 빼 오기, 그리고 구파 회관의 혜각.');
  await say('me', '혜각 대사를 어쩌라고요?');
  await say('samaung', '죽이라는 거지. 혈의방에 들어온 의뢰다. 못 하겠으면 말해. 대신 그만큼 다른 데서 갚아야 한다.');
  ctx.note('흑도맹 입맹. 사마웅의 일감: 군량선, 제갈세가 명령서, 혜각 대사.');
  set('sa2'); ctx.goal('사마웅의 일감 셋 (청하진 나루, 구화성 정천맹 객관, 구파 회관). 순서는 자유');
}
async function jobShip() {
  await ctx.chap(4, '흑도맹', '군량선');
  if (F().wei_spared) await say('wei', '왔냐, 점소이. 저번에 살려 준 빚은 오늘 갚는다.');
  else await say('pirate', '대장은 사흘이면 나온다더니 아직도 옥에 있소. 우리끼리 왔소.');
  await ctx.duel({ foes: ['jeong_guard', 'jeong_guard', 'jeong_elite'], allies: F().wei_spared ? ['wei_ally'] : [], arena: 'dock', bgm: 'fight', title: '정천맹 군량선' });
  await narr('배에는 곡식 삼백 섬이 실려 있었다. 나루 사람들이 멀리서 이쪽을 보고 있었다.');
  const c = await choice('쌀을 어떻게 할까?', ['절반을 나루 사람들에게 푼다', '전부 산채로 올려 보낸다']);
  if (c === 0) { await say('elder', '자네, 이게 다 뭔가. 사파 쌀을 우리더러 먹으라는 건가?'); await say('me', '굶는 것보단 낫잖아요.'); ctx.rep('jeong', 1); F().sa_rice = true; }
  else { await say('town', '저걸 다 실어 가네. 올겨울은 어쩌라고.'); ctx.rep('sa', 2); }
  F().sa_job1 = true; jobCheck();
}
async function jobPaper() {
  await ctx.chap(4, '흑도맹', '명령서');
  await narr('정천맹 객관 서고에 들어갔다. 연회 때 쓴 술 냄새가 아직 남아 있었다.');
  await say('clerk', '누구냐!');
  await ctx.duel({ foes: ['shadow2', 'shadow2', 'jeong_elite'], arena: 'room', bgm: 'fight', title: '정천맹 객관 서고' });
  await say(null, '궤짝 맨 아래에서 제갈세가의 인장이 찍힌 명령서가 나왔다. “월하문 토벌. 어린 것도 남기지 말 것. 북쪽 변경의 일도 이와 같이 처리할 것.”');
  await say('me', '북쪽 변경…?');
  await narr('다섯 살 때 불탄 우리 마을도 북쪽 변경에 있었다. 전쟁 때문이라고만 알고 있었다.');
  ctx.note('제갈세가 명령서: “어린 것도 남기지 말 것. 북쪽 변경의 일도 이와 같이.”');
  const c = await choice('이 명령서를 어떻게 할까?', ['사마웅에게 그대로 넘긴다', '베껴서 개방에도 흘린다']);
  if (c === 0) ctx.rep('sa', 2); else { ctx.rep('jeong', 2); F().sa_leak = true; }
  F().sa_job2 = true; jobCheck();
}
async function jobMonk() {
  await ctx.chap(4, '흑도맹', '혜각');
  await say('clan_shaolin', '올 줄 알았소, 시주. 앉으시오.');
  await say('me', '혈의방 의뢰를 받고 왔습니다. 대사님을 베라고 하네요.');
  await say('clan_shaolin', '그렇소. 언젠가 이런 날이 올 줄 알았소. 십칠 년 전 월하곡에 깃발을 들고 간 사람이니, 베어도 할 말은 없소.');
  const c = await choice('혜각이 염주를 내려놓고 눈을 감는다.', ['칼을 뽑는다', '칼을 거둔다']);
  if (c === 0) {
    await ctx.duel({ foes: ['clan_shaolin'], arena: 'court', bgm: 'boss', title: '소림 혜각' });
    await narr('혜각은 마지막 일격을 피하지 않았다. 그날 저녁 소림의 종소리가 멀리서도 들렸다.');
    F().hyegak_dead = true; ctx.rep('sa', 3); ctx.rep('jeong', -4); ctx.note('혜각 대사를 베었다. 소림은 나를 잊지 않을 것이다.');
  } else {
    await say('me', '못 하겠습니다. 그 값은 제가 치를게요.');
    await say('clan_shaolin', '아미타불. 그럼 이것을 가져가시오. 십칠 년 전 일을 노납이 직접 적은 참회문이오. 언젠가 쓸 데가 있을 것이오.');
    F().sa_refused = true; ctx.rep('jeong', 2); ctx.note('혜각 대사를 베지 않고 참회문을 받았다.');
  }
  F().sa_job3 = true; jobCheck();
}
function jobCheck() { if (F().sa_job1 && F().sa_job2 && F().sa_job3) ctx.goal('산채로 돌아가 사마웅에게 알리기'); }
async function saReturn() {
  if (F().sa_refused) { await say('samaung', '혜각이 살아 있다더군. 못 하겠으면 다른 데서 갚으라고 했지? 월하곡에서는 네가 맨 앞에 서라.'); await say('me', '알겠습니다.'); }
  else await say('samaung', '일 잘했다. 약속대로 맹주 앞까지는 데려다주마.');
  if (F().sa_rice) await say('baekrang', '쌀 풀었다면서요? 나루에서 욕하는 사람이 많이 줄었어요.');
  await G.ch.sa5();
}

// ── 마교의 길 ──
async function toMa() {
  S().side = 'ma'; ctx.rep('ma', 3); ctx.rep('jeong', -3); ctx.rep('sa', -1); F().ma_open = true;
  await say('so', '야, {나}. 너 지금 뭐 하는 거야?');
  await say('me', '아주머니를 구하려면 저쪽 힘이 필요해요.');
  await say('so', '미쳤구나. 다음에 보면 나도 안 봐준다.');
  await say('yun', '저는 거기 못 가요. 사람 살리는 일을 하는 사람이에요.');
  await say('yun', '…돌아오면 팔부터 봐 줄게요. 꼭 살아서 와요.');
  G.S.love.yun = Math.max(0, (G.S.love.yun || 0) - 14); G.S.love.so = Math.max(0, (G.S.love.so || 0) - 14);
  set('ma1'); F().night = false; ctx.goal('제단 앞의 혁련하와 이야기하기');
  await ctx.part(4, '붉은 초승달', '입교');
  await narr('청풍골 서쪽 절벽에 숨겨진 문이 있었다. 청하진에서 반나절 거리였는데 아무도 몰랐다.');
  await ctx.warp('shrine', 7, 8, 1);
}
async function maRite() {
  await say('hyeok', '입교하려면 의식을 치러야 합니다. 이름을 제단에 올리고, 앞으로는 교주님이 내리시는 호로만 불리게 됩니다.');
  await say('me', '군막에서도 이름 없이 번호로 살았어요.');
  const c = await choice('제단의 불이 낮게 흔들린다.', ['이름을 올린다', '이름만은 못 버린다고 한다']);
  if (c === 0) { await say('hyeok', '네. 받았습니다.'); ctx.rep('ma', 2); F().name_given = true; }
  else { await say('hyeok', '그런 말씀은 처음 듣습니다. 알겠습니다. 이름은 가지고 계십시오.'); ctx.love('hyeok'); }
  await say('hyeolma', '이게 그 열쇠냐? 비쩍 말랐군.');
  await say('hyeok', '혈마 님, 예를 갖추십시오.');
  await say('hyeolma', '심마를 치려면 칼이 필요하다지. 쓸 만한지 보자. 구화성 금봉 객잔에 심마의 밀정이 있으니 처리해. 창운문 장서각에서는 제단 열쇠를 가져오고.');
  await say('hyeolma', '그리고 이거. 혈우 씨앗이다. 청하진 우물에 부어라. 의식에 제물이 필요하다.');
  await say('me', '청하진이요?');
  await say('hyeolma', '왜, 네가 살던 마을이냐? 그럼 더 잘 듣겠네.');
  ctx.note('천마신교 입교. 혈마의 시험: 금봉 객잔의 밀정, 장서각의 제단 열쇠, 청하진 우물의 혈우.');
  set('ma2'); ctx.goal('혈마의 시험 셋 (구화성 금봉 객잔, 창운문 장서각, 청하진 우물가). 순서는 자유');
}
async function jobSpy() {
  await ctx.chap(4, '붉은 초승달', '밀정');
  await narr('금봉 객잔 구석 자리에 국수를 시켜 놓고 한 젓가락도 먹지 않는 손님들이 앉아 있었다.');
  await say('me', '국수 불어요.');
  await say('myeon', '…번호를 대십시오.');
  await ctx.duel({ foes: ['myeon', 'myeon', 'myeon'], arena: 'room', bgm: 'fight', title: '무면당 밀정' });
  await say(null, '쓰러진 밀정의 품에서 낡은 나무패가 나왔다. 불에 지진 번호가 적혀 있었다.');
  await say('me', '이거 견대 번호패예요. 왜 이게 여기 있죠?');
  await say('hyeok', '무면당은 강호에서 무면회라고 부르는 자들입니다. 전쟁터에서 고아들을 사들여 조직을 키웠습니다. 당신이 있던 부대도 그중 하나였습니다.');
  ctx.note('무면당 밀정이 견대 번호패를 지니고 있었다. 견대는 심마가 고아를 모으던 곳이었다.');
  ctx.rep('ma', 1); F().ma_job1 = true; maCheck();
}
async function jobKey() {
  await ctx.chap(4, '붉은 초승달', '제단 열쇠');
  await say('go', '사제, 돌아와라. 문주님은 아직 네 이름을 명부에서 지우지 않으셨다.');
  await say('me', '사형, 그 궤짝이 필요해요.');
  const c = await choice('고진이 궤짝 앞을 막아선다.', ['베고 지나간다', '사정을 말하고 열쇠만 받는다']);
  if (c === 0) {
    await ctx.duel({ foes: ['senior_go'], arena: 'room', bgm: 'boss', title: '사형 고진' });
    await say('go', '네놈… 언제 이렇게…');
    F().go_dead = true; ctx.rep('ma', 2); ctx.rep('jeong', -2);
  } else {
    await say('go', '가져가라. 다만 이제부터 나를 사형이라고 부르지 마라.');
    ctx.rep('jeong', 1);
  }
  F().ma_job2 = true; maCheck();
}
async function jobWell() {
  await ctx.chap(4, '붉은 초승달', '우물');
  await narr('청하진 우물가에 갔다. 아이들이 물을 긷다 말고 놀고 있었다.');
  await say('kid', '쟁반 아저씨다! 쟁반 또 던져 봐요!');
  await say('me', '여기서 놀지 마라. 저쪽으로 가.');
  const c = await choice('품속의 항아리를 꺼냈다.', ['항아리를 우물에 붓는다', '항아리를 깨 버린다']);
  if (c === 0) {
    await narr('사흘 뒤부터 마을 곳곳에서 기침 소리가 났다. 윤씨 약방의 불이 밤새 꺼지지 않았다.');
    F().plague = true; ctx.rep('ma', 4); ctx.rep('jeong', -5); G.S.love.yun = 0;
    ctx.note('청하진 우물에 혈우를 부었다.');
  } else {
    await say('me', '이건 못 하겠어.');
    F().ma_defy = true; ctx.rep('jeong', 2); ctx.note('혈우 항아리를 깨 버렸다. 혈마가 가만있지 않을 것이다.');
  }
  F().ma_job3 = true; maCheck();
}
function maCheck() { if (F().ma_job1 && F().ma_job2 && F().ma_job3) ctx.goal('청풍골 서쪽 분타로 돌아가 혁련하에게 알리기'); }
async function maReturn() {
  if (F().ma_defy) {
    await say('hyeolma', '항아리가 깨졌다더군. 열쇠는 손잡이만 있으면 돼. 나머지는 잘라 내겠다.');
    await say('hyeok', '혈마 님, 멈추십시오. 제 앞에서는 안 됩니다.');
    await ctx.duel({ foes: ['hyeolma'], allies: ['hyeok_ally'], arena: 'moon', bgm: 'boss', title: '혈마' });
    F().hyeolma_dead = true;
    await say('hyeok', '제가 혈마를 벤 셈이 되었습니다. 이제 저도 교단으로 돌아갈 수 없습니다.');
    ctx.love('hyeok', 2);
  } else if (F().plague) await say('hyeolma', '잘했다. 네 마을 기침 소리가 여기까지 들리는 것 같구나.');
  await G.ch.ma5();
}

// ── 월하곡 결전 ──
export async function chiefBattle() {
  const s = side(), won = clansWon(); let allies = [], mul = 1;
  if (s === 'jeong') {
    await say('so', '{나}! 나도 왔어! 사부님 원수는 내 몫이야!');
    await say('cheol', '문은 내가 부수겠소!');
    await say('chief', '일곱 장이 다 모였군. 고맙네. 이제 그만 내놓게.');
    allies = ['so_ally', 'cheol_ally'];
    if (won >= 5 || F().jg_council) { await say('clan_shaolin', '아미타불. 십칠 년 묵은 빚을 갚으러 왔소.'); allies.push('hyegak_ally'); }
    if (won >= 10 || F().kids_saved) { await say('clan_namgung', '맹주. 남궁세가도 할 말이 있다.'); allies.push('namgung_ally'); }
    if (F().jg_samaung && F().lion_debt) { await say('lion', '나도 왔다! 빚 갚으러!'); allies.push('lion_ally'); }
    if (won >= 15) { await narr('골짜기 위로 깃발이 하나둘 올라왔다. 소림, 무당, 화산, 종남, 아미, 곤륜, 공동, 점창, 청성, 개방, 그리고 오대세가의 깃발까지. 십칠 년 전 이곳을 둘러쌌던 깃발들이 이번에는 맹주를 향해 있었다.'); mul = .8; }
  }
  if (s === 'sa') {
    await say('samaung', '연경추, 이 개자식아. 이십 년 기다렸다.');
    await say('chief', '사마웅인가. 자네가 올 줄은 알았네. 저 아이를 데려올 줄은 몰랐지만.');
    await say('samaung', '{호}, 맹주 앞까지 데려다준다고 했지. 앞장서라.');
    await ctx.duel({ foes: ['jeong_elite', 'jeong_elite', 'shadow2'], allies: ['samaung_ally'], arena: 'moon', bgm: 'fight', title: '정천맹 친위대' });
    allies = ['samaung_ally'];
    if (F().wei_spared) { await say('wei', '물길은 내가 끊어 놨다, 점소이!'); allies.push('wei_ally'); }
    if (F().lion_debt) { await say('lion', '나도 왔다! 빚 갚으러!'); allies.push('lion_ally'); }
  }
  if (s === 'ma') {
    await say('so', '그만해, {나}. 마교 편에 서 있는 한 여기는 못 지나가.');
    await say('cheol', '시주, 소승이 언제 문을 지켜 봤겠소만 오늘은 지키겠소.');
    await ctx.duel({ foes: ['so_final'], allies: ['hyeok_ally'], arena: 'moon', bgm: 'boss', title: '소연하', yieldAt: .3 });
    await say('so', '가. 맹주는 네가 처리해. 그다음은 나랑 다시 하는 거야.');
    await say('chief', '성녀까지 왔나. 교주는 내가 깨울 걸세. 너희는 구경이나 하게.');
    await say('hyeok', '심마, 교의 이름으로 당신을 파문합니다.');
    allies = ['hyeok_ally'];
  }
  if (s === 'sa' && F().sa_nam_spared) { await say('clan_namgung', '칼로 갚겠다고 했다. 비켜라.'); allies.push('namgung_ally'); }
  if (s === 'free') {
    await say('chief', '혼자 왔나. 곽란이 자네를 그렇게 가르쳤나 보군.');
    await say('me', '혼자 다니는 건 군막에서 배웠어.');
    if (S().sworn === 'cheol') { await say('cheol', '아우! 혼자 가면 어떡하오! 문은 내가 부수겠소!'); allies = ['cheol_ally']; }
    mul = .75;
  }
  { const a = await G.bond.join(s, allies); if (a) allies.push(a); }
  await ctx.duel({ foes: ['chief'], allies, foeHpMul: mul, arena: 'moon', bgm: 'boss', title: '정천맹주 연경추' });
  F().chief_down = true;
  await say('chief', '왜지… 나는 칠식을 다 익혔는데…');
  await say('me', '걸레질을 안 해 봤잖아.');
  await say('chief', '하하… 어차피 늦었네. 일곱 장은 이미 천산을 깨웠어. 교주께서 곧…');
  if (s === 'jeong') { await say('so', '천산? 교주? 저 사람 지금 무슨 소리야?'); await say('cheol', '시주들, 달을 보시오.'); }
  await narr('달이 구름에 가렸다가 다시 나왔을 때 연경추는 쓰러진 채 숨이 끊겨 있었다. 적어도 그때는 그렇게 보였다.');
}

// ── 결말 ──
const baekFate = async () => { if (F().baek_live) await say('baek', '점소이, 방값 가져왔다. 이자는 깎아라.'); else await narr('백 노인은 그날 밤을 넘기지 못했다. 곽 아주머니는 무덤 앞에 국 한 그릇을 놓고 한참 서 있다가 아무 말 없이 돌아갔다.'); };
const hook = line => narr(`그해 가을이 저물었다. ${line}`);
const finish = () => G.act3.begin();
async function endSa() {
  await say('samaung', '약속은 지켰다. 곽란은 데려가고, 일곱 장도 네가 가져라.');
  await say('gwak', '사파 밥 먹었다며?');
  await say('me', '네.');
  await say('gwak', '아이고, 이놈아. 그래도 살아 돌아왔으니 됐다. 밥은 먹었어?');
  await baekFate();
  await narr('정천맹이 무너지자 구파일방은 산문을 닫았고, 흑도맹의 검은 깃발이 장강을 따라 내려갔다.', 'end_sa');
  if (F().hyegak_dead) await narr('얼마 뒤 소림의 승병들이 산을 내려왔다는 소문이 돌았다. 혜각의 원수를 갚겠다고 했다.');
  const c = await choice('사마웅이 부맹주 자리를 맡으라고 한다.', ['부맹주 자리를 받는다', '비무를 청해 맹주 자리를 건다', '거절하고 떠난다']);
  if (c === 0) { F().ending = 'sa_vice'; await narr('나는 흑도맹의 부맹주가 되었다. 사마웅은 술만 마시면 그날 싸움 이야기를 했다.'); }
  if (c === 1) {
    await say('samaung', '하하! 그래, 그 말이 나올 줄 알았다. 덤벼라.');
    await ctx.duel({ foes: ['samaung_foe'], arena: 'fort', bgm: 'boss', title: '패천도 사마웅', yieldAt: .15 });
    await say('samaung', '내가 졌다. 사내가 한 말은 지킨다. 오늘부터 네가 맹주다.');
    F().ending = 'sa_lord'; await narr('그렇게 군적에서 지워진 낭인이 강호 절반을 쥔 맹주가 되었다.');
  }
  if (c === 2) { F().ending = 'sa_leave'; await say('baekrang', '돈도 자리도 싫다고요? 별난 사람이에요, 정말.'); await narr('나는 다시 길을 떠났다.'); }
  await hook('정파가 무너진 틈을 마교가 놓칠 리 없었다.');
  await finish();
}
async function endMa() {
  await say('hyeok', '일곱 장이 모두 모였습니다. 제단으로 가시지요.');
  await say('gwak', '그 옷은 뭐야?');
  await say('me', '천마신교 옷이요.');
  await say('gwak', '네 어미가 그 제단을 잠그다가 죽었다. 알고나 입어.');
  await baekFate();
  if (F().plague) { await say('gwak', '청하진 우물에 뭘 넣었어?'); await say('me', '…….'); await say('gwak', '…나가. 내 앞에 나타나지 마.'); }
  const c = await choice('일곱 장을 제단에 올렸다. 혁련하가 내 말을 기다린다.', ['봉인을 푼다. 천마를 깨운다', '봉인을 잠그고 신교를 잇는다', '일곱 장을 태우고 등을 돌린다']);
  if (c === 0) { F().ending = 'ma_awake'; await say('hyeok', '교주님이 깨어나십니다.'); await narr('달이 붉게 물들었다. 강호의 모든 칼이 한꺼번에 울었다고 한다. 나는 천마의 오른팔이 되었다.', 'end_ma'); }
  if (c === 1) {
    if (!F().hyeolma_dead) { await say('hyeolma', '네놈이 뭔데 교단을 맡겠다는 거냐.'); await ctx.duel({ foes: ['hyeolma'], allies: ['hyeok_ally'], arena: 'moon', bgm: 'boss', title: '혈마' }); F().hyeolma_dead = true; }
    F().ending = 'ma_lord'; await say('hyeok', '천마는 그대로 잠듭니다. 교단에는 주인이 필요합니다. 오늘부터 당신이 교주입니다.');
    await narr('천마신교는 삼백 년 만에 살아 있는 교주를 맞았다.', 'end_ma');
  }
  if (c === 2) { F().ending = 'ma_leave'; await say('hyeok', '그러실 줄 알았습니다. 문은 열어 두겠습니다.'); await narr('일곱 장을 태웠다. 그날부터 정파도 사파도 마교도 나를 쫓기 시작했다.', 'end_free'); }
  await hook(F().ending === 'ma_awake' ? '제단의 불은 그날부터 꺼지지 않았다.' : '심마가 남긴 무리는 아직 강호 곳곳에 숨어 있었다.');
  await finish();
}
async function endFree() {
  await say('gwak', '혼자 왔어?');
  await say('me', '네.');
  await say('gwak', '못난 놈. 밥은?');
  await say('me', '아직이요.');
  await say('gwak', '이리 와, 국수 끓여 줄게. 다 먹으면 어디로 갈지나 생각해 봐.');
  await say('me', '갈 데가 없는데요.');
  await say('gwak', '없으면 여기 있으면 되지.');
  await baekFate();
  const c = await choice('찢어진 일곱 장을 앞에 두고', ['태운다', '곽 아주머니에게 맡긴다', '품에 넣고 혼자 떠난다']);
  F().ending = 'free' + c;
  if (c === 0) await narr('일곱 장을 태웠다. 재는 강으로 날아갔고, 나는 다시 낭인으로 돌아갔다.', 'end_free');
  if (c === 1) { F().inn_rebuilt = true; await narr('달맞이 객잔이 다시 문을 열었다. 나는 가끔 들러 바닥을 닦고 간다.', 'end_jeong'); }
  if (c === 2) await narr('일곱 장을 품에 넣고 새벽에 길을 나섰다.', 'end_free');
  await hook('나는 아무 깃발도 없이 길 위에서 겨울을 맞았다.');
  await finish();
}
export async function routeEnding() { const s = side(); if (s === 'sa') await endSa(); else if (s === 'ma') await endMa(); else await endFree(); }
G.route = { crossroads, toWolha, chiefBattle, routeEnding, side, baekFate };

// ── 지도별 사람과 일감 ──
const job = (o) => ({ dir: 0, mark: () => true, ...o });
Story.providers.push(function routes(id) {
  const n = [], ro = [], sd = S().side, has = k => !F()[k];
  if (id === 'guhwa' && after('c3b') && (!after('c4a') || sd === 'free' || at('end'))) {
    n.push({ id: 'baekrang', spr: 'Cavegirl', x: 17, y: 27, dir: 3, mark: () => !F().gu_bae, talk: async () => { if (!F().gu_bae) await baeGuhwa(); else await say('baekrang', '또 봐요.'); } });
    n.push({ id: 'hyeok', spr: 'Hyeok', x: 33, y: 27, dir: 2, mark: () => !F().gu_hyeok, talk: async () => { if (!F().gu_hyeok) await hyeokGuhwa(); else await say('hyeok', '향이 필요하시면 말씀하십시오.'); } });
  }
  if (sd === 'sa') {
    if (id === 'fort') {
      n.push({ id: 'samaung', spr: 'Samaung', x: 18, y: 20, dir: 0, mark: () => at('sa1') || (at('sa2') && !!F().sa_job1 && !!F().sa_job2 && !!F().sa_job3), talk: async () => { if (at('sa1')) await samaungMeet(); else if (at('sa2') && F().sa_job1 && F().sa_job2 && F().sa_job3) await saReturn(); else await say('samaung', '일 끝나면 와라.'); } });
      n.push({ id: 'baekrang', spr: 'Cavegirl', x: 13, y: 20, dir: 3, talk: async () => { await say('baekrang', '요즘 강호에서 {호} 얘기가 제일 많이 들려요.'); } });
      if (F().lion_debt) n.push({ id: 'lion', spr: 'Lion', x: 23, y: 20, dir: 2, talk: async () => { await say('lion', '여기가 내 산채였는데. 쩝.'); } });
    }
    if (at('sa2')) {
      if (id === 'cheongha' && has('sa_job1')) n.push(job({ id: 'pirate', spr: 'Villager3', x: 24, y: 25, hint: '군량선 치기', talk: jobShip }));
      if (id === 'hall2' && has('sa_job2')) n.push(job({ id: 'clerk', spr: 'Inspector', x: 7, y: 4.6, hint: '서고 뒤지기', talk: jobPaper }));
      if (id === 'ninehall' && has('sa_job3')) n.push(job({ id: 'job_monk', spr: 'Monk', x: 9, y: 11, hint: '혜각 대사 찾기', talk: jobMonk }));
    }
  }
  if (sd === 'ma') {
    if (id === 'shrine') {
      n.push({ id: 'hyeok', spr: 'Hyeok', x: 7, y: 4.8, dir: 0, mark: () => at('ma1') || (at('ma2') && !!F().ma_job1 && !!F().ma_job2 && !!F().ma_job3), talk: async () => { if (at('ma1')) await maRite(); else if (at('ma2') && F().ma_job1 && F().ma_job2 && F().ma_job3) await maReturn(); else await say('hyeok', '일은 잘되고 있습니까.'); } });
    }
    if (at('ma2')) {
      if (id === 'inn2' && has('ma_job1')) n.push(job({ id: 'job_spy', spr: 'GrayNinja', x: 13.7, y: 8.6, hint: '밀정 찾기', talk: jobSpy }));
      if (id === 'library' && has('ma_job2')) n.push(job({ id: 'job_go', spr: 'Inspector', x: 7.5, y: 5, hint: '장서각 궤짝', talk: jobKey }));
      if (id === 'cheongha' && has('ma_job3')) n.push(job({ id: 'kid', spr: 'Child', x: 21, y: 23.5, hint: '우물가로 가기', talk: jobWell }));
    }
  }
  if (id === 'guhwa' && sd && !at('end') && !F().act3) ro.push({ spr: 'chars/Knight', x: 24, y: 24, foes: ['jeong_guard', 'jeong_guard'] }, { spr: 'chars/Knight', x: 12, y: 16, foes: ['jeong_elite'] });
  return { npcs: n, spots: [], trigs: [], roam: ro };
});
