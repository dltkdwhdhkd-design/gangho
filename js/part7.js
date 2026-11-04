// 제7부 붉은 달: 어느 길을 왔든 청하진으로 모이고, 정파와 사파가 한 상에 앉는다
import { G, Sound, fadeTo, toast } from './core.js';
import { Story, ctx, say, narr, choice } from './ctx.js';
import { WHO } from './dialog.js';
import { FOES } from './foes.js';
import { set, at, after } from './story1.js';

const S = () => G.S, F = () => G.S.flags, side = () => G.S.side;
const PART = '붉은 달';
Object.assign(WHO, { gwima: { name: '귀마', face: 'Skeleton' }, rainman: { name: '일어난 사람', face: 'Skeleton' } });
const foe = (name, spr, hp, atk, def, spd, exp, silver, pause, moves, o = {}) => ({ name, spr, hp, atk, def, spd, exp, silver, pause, moves, ...o });
Object.assign(FOES, {
  hyeolgyo: foe('혈교 무사', 'chars/RedNinja', 760, 48, 11, 74, 170, 30, 1, ['flurry', 'lunge', 'quick'], { wpn: 'Ninjaku', guard: .4 }),
  rainman: foe('혈우귀', 'chars/Skeleton', 620, 42, 7, 46, 130, 8, 1.15, ['venom', 'slash', 'heavy']),
  hyeol_elite: foe('혈교 장수', 'chars/DarkNinja', 1700, 54, 13, 70, 360, 90, .95, ['heavy', 'flurry', 'rain', 'lunge'], { wpn: 'Axe', guard: .6, elite: 1, poise: 240 }),
  hyeolma2: foe('혈마', 'chars/Skeleton', 7600, 56, 14, 70, 1500, 800, .8, ['venom', 'heavy', 'spin', 'quake', 'charge'], { wpn: 'Axe', guard: .6, boss: 1, poise: 460, phases: [{ hp: .5, say: '피가 모자라는구나.', add: ['rain', 'flurry', 'ring8'], pause: .62 }], scale: 1.4 }),
  monk_block: foe('소림 승병', 'chars/Monk', 500, 40, 9, 60, 80, 0, 1.1, ['iron_fist', 'earth_stomp', 'slash'], { wpn: 'Club', guard: .5 }),
});

// ── 제1장 붉은 달 ──
async function maEscape() {
  await narr('봉인이 풀린 날부터 제단의 불이 꺼지지 않았다. 오른팔이라는 말은 사흘을 못 갔다.');
  const who = F().hyeolma_dead ? 'gwima' : 'hyeolma';
  await say(who, '교주님께서 피를 찾으신다. 월하문 마지막 핏줄의 피를.');
  await say('me', '오른팔 아니었어요?');
  await say(who, '개는 주인을 물기 전에 잡는 법이다.');
  await say('hyeok', '뛰십시오. 문은 제가 막겠습니다.');
  await ctx.duel({ foes: ['hyeolgyo', 'hyeolgyo'], allies: ['hyeok_ally'], arena: 'moon', bgm: 'fight', title: '분타 탈출' });
  await say('hyeok', '성녀는 천마가 깨어날 때 올리는 첫 제물이라고 합니다. 오늘 들었습니다. 열일곱 해를 제단 앞에 있었는데 말입니다.');
  await say('me', '같이 가요.');
  await say('hyeok', '네.');
}
export async function begin() {
  const s = side(), e = F().ending;
  F().act3 = true; F().inn_rebuilt = true; F().night = false; F().hyeok_join = s === 'ma';
  await ctx.part(7, PART, '제1장 붉은 달');
  if (e === 'ma_awake') await maEscape();
  else if (s === 'jeong') await narr('겨울이 오기 전에 정천맹은 깃발을 내렸다. 장문인들은 저마다 산으로 돌아갔고, 곽 아주머니는 청하진에 닿자마자 불탄 기둥부터 뽑았다.');
  else if (s === 'sa') await narr('장강 남쪽까지 검은 깃발이 꽂히던 겨울, 곽 아주머니가 청하진으로 돌아갔다는 말이 들렸다. 나는 배를 탔다.');
  else if (e === 'ma_lord') await narr('살아 있는 교주를 맞은 지 한 달 만에 천산에서 서찰이 왔다. “가짜는 내려와라.” 분타의 신도 절반이 그날 밤 사라졌다. 혁련하가 말없이 짐을 쌌다.');
  else if (e === 'ma_leave') await narr('정파도 사파도 마교도 나를 쫓았다. 쫓기다 보니 발이 닿은 곳이 청하진이었다.');
  else if (e === 'free1') await narr('달맞이 객잔이 다시 문을 열고 처음 맞는 겨울이었다.');
  else await narr('길에서 겨울을 맞았다. 그믐이 가까워지자 발이 저절로 청하진 쪽으로 향했다.');
  await fadeTo(1); G.field.load('cheongha', 22.5, 16, 1); await fadeTo(0);
  if (F().plague) {
    await narr('청하진 어귀에서 순이 아버지가 작대기를 들고 막아섰다. 마을에서는 아직도 기침 소리가 났다.');
    await say('husband', '돌아가시오. 우리 집 순이도 아직 못 일어났소.');
    await say('gwak', '들여보내. 밖에서 죽으면 치우기 귀찮아.');
  }
  await fadeTo(1); G.field.load('inn', 8, 8, 1); await fadeTo(0);
  await say('gwak', '왔냐. 기둥은 새로 세웠는데 바닥은 아직이다. 걸레는 저기 있다.');
  await say('me', '오자마자요?');
  await say('gwak', '그럼 앉아서 손님 노릇 할래? 밥값은 있고?');
  ctx.cg('red_moon');
  await narr('그날 저녁 나루 쪽이 웅성거렸다. 나가 보니 서쪽 하늘에 달이 떠 있었다. 어제가 그믐이었는데 달이 떴고, 붉었다.');
  await say('boat', '평생 강에서 살았는디 저런 달은 처음이여.');
  await say('gwak', '…기어이 떴구나.');
  await say('me', '저게 뭐예요?');
  ctx.cgOff();
  await say('gwak', '들어가자. 밥 먹으면서 얘기해.');
  await say('gwak', '월하문이 왜 그 골짜기에 틀어박혀 살았는지 아냐? 삼백 년 전에 낙월선자라는 분이 천마를 천산 밑에 묻었어. 우리는 그 문을 지키던 사람들이고, 일곱 장은 그 문 열쇠야.');
  await say('me', '그걸 제가 다 모았는데요.');
  await say('gwak', '그래, 네가 모았지. 모으라고 판을 깐 놈이 있었고.');
  await say('gwak', '월하곡에 다녀온 사람이 그러더라. 월천이 무덤이 파헤쳐져 있대. 연경추 시신도 없고.');
  await say('me', '…….');
  await say('gwak', '먹어. 네 어미가 늘 그랬다. 달이 붉어지면 일단 밥부터 먹이라고.');
  await narr('그릇을 다 비우기도 전에 강 쪽에서 비명이 났다.');
  await ctx.duel({ foes: ['hyeolgyo', 'hyeolgyo', 'hyeolgyo'], allies: ['smith_ally'], arena: 'dock', bgm: 'fight', title: '나루의 혈교도' });
  await say('boat', '저놈들 배에서 내리는 걸 봤는디 서쪽 말을 쓰더구먼.');
  if (s === 'jeong') await say('so', '서쪽이 뚫렸어. 곤륜이랑 공동이 열흘 만에 무너졌대.');
  else if (s === 'sa') await say('baekrang', '서쪽 소문이 안 좋아요. 곤륜이랑 공동이 열흘 만에 무너졌대요. 우리 분타도 연락이 끊겼고요.');
  else if (s === 'ma') await say('hyeok', '혈교의 선봉입니다. 곤륜과 공동은 이미 없다고 보셔야 합니다.');
  else await say('beggar', '서쪽 거지들 소식이 끊겼다. 곤륜이랑 공동이 열흘 만에 무너졌다더라.');
  await say('boat', '약방에 사람이 또 실려 갔구먼. 비 맞은 사람들이여. 가 봐.');
  set('r2'); ctx.goal('윤씨 약방의 윤설 찾아가기');
  ctx.note('서쪽 하늘에 붉은 달이 떴다. 월하칠식은 천마의 봉인을 여는 열쇠였다. 월천과 연경추의 시신이 사라졌다.');
}

// ── 제2장 혈우 ──
async function rainStart() {
  await ctx.chap(7, PART, '제2장 혈우');
  ctx.cg('rain');
  await narr('달이 뜨고 사흘째 되는 날 비가 왔다. 빗물이 붉었다. 그 물을 받아 마신 사람들부터 기침을 시작했다.');
  ctx.cgOff();
  await say('yun', '왔어요? 손 씻고 들어와요. 빗물 묻은 손으로 아무것도 만지지 말고요.');
  await say('me', '어떤 병이에요?');
  await say('yun', '열이 오르고 피를 토하다가 사흘째 되면 벌떡 일어나요.');
  await say('me', '나은 거예요?');
  await say('yun', '아니요. 일어난 사람은 눈이 빨개지고, 말을 못 하고, 옆 사람을 물어요.');
  if (F().plague) {
    await say('me', '이거, 제가 우물에 부은 거랑 같은 거예요.');
    await say('yun', '알아요. 처음 기침한 사람들이랑 똑같으니까요.');
    await say('yun', '그 얘기는 나중에 해요. 지금은 항아리에서 무슨 냄새가 났는지, 무슨 색이었는지부터 다 말해요.');
  }
  await say('doc', '피가 썩는 병이 아니다. 피가 남의 것이 되는 병이야. 피를 붙들어 줄 것이 있어야 해.');
  await say('yun', '달빛이끼가 피를 맑게 해요. 칠일소혼산 풀 때 썼던 거요. 거기에 당가의 벽독단 처방을 더하면 약이 될 것 같아요.');
  await say('yun', '이끼는 창운산, 처방은 세가 거리 당소연이 갖고 있어요. 서둘러요. 매일 세 명씩 일어나요.');
  set('r2b'); ctx.goal('약재 구하기: 창운산 북동쪽 끝의 달빛이끼, 세가 거리 당소연의 벽독단 처방. 순서는 자유');
}
async function mossRain() {
  await narr('창운산에도 붉은 비가 왔다. 매화나무 아래 바위틈만 희미하게 빛나고 있었다. 이끼를 긁어 담는데 등 뒤에서 발소리가 났다. 창운문 제자 옷을 입은 사람들이었고, 눈이 붉었다.');
  await ctx.duel({ foes: ['rainman', 'rainman', 'rainman'], arena: 'forest', bgm: 'fight', title: '일어난 사람들' });
  if (!F().go_dead) {
    await say('go', '…내 사제들이다.');
    await say('me', '사형, 죄송합니다.');
    await say('go', '네가 왜. 내가 할 일을 네가 했다. 문주님도 앓아누우셨다. 약이 되면 제일 먼저 기별해라.');
  } else await say('lord', '고진이 있었으면 저 아이들을 자기 손으로 보냈을 것이오. 이끼는 가져가시오. 산문을 나가시오.');
  F().r_moss = true; ctx.note('창운산에서 달빛이끼를 구했다.'); checkRain();
}
async function dangRain() {
  await say('clan_dang', '비 맞고 왔어요? 그 손으로 제 찻잔 만지지 마요.');
  await say('me', '벽독단 처방을 주세요. 청하진이 앓고 있어요.');
  await say('clan_dang', '줄게요. 근데 처방만으로는 안 돼요. 이 병은 독이 아니거든요. 당가에도 비가 왔는데 앓아누운 건 하인들뿐이에요. 왜인지 알겠어요?');
  await say('me', '왜요?');
  await say('clan_dang', '당가 사람은 피가 이미 망가져 있어서 그래요. 세 살 때부터 독을 먹고 자란 피는 남의 것이 끼어들 틈이 없나 봐요.');
  await say('clan_dang', '약에 그 피를 섞어야 해요. 제가 갈게요.');
  await say('me', '위험하지 않아요?');
  await say('clan_dang', '혀를 내주고 얻은 몸이에요. 이제야 쓸모가 있네요.');
  F().r_dang = true; ctx.love('clan_dang'); ctx.note('당소연이 벽독단 처방과 자기 피를 내주기로 했다.'); checkRain();
}
function checkRain() { if (F().r_moss && F().r_dang) ctx.goal('윤씨 약방으로 돌아가기'); }
async function rainCure() {
  await say('yun', '이끼 왔어요? 당 소저는 앉아요. 소매 걷고요.');
  await say('clan_dang', '피를 뽑히는 건 처음이네요. 살살 해요.');
  await narr('꼬박 하루가 걸렸다. 윤설은 약사발 하나를 들고 한참 들여다봤다.');
  await say('yun', '먹어 볼 사람이 있어야 해요. 제가 먹을게요.');
  await say('doc', '아니다. 이리 다오.');
  await narr('말릴 틈도 없었다. 윤 의원은 약사발을 비우고 나서야 소매로 입을 닦았다. 소매에 피가 묻어 있었다. 사흘 전부터 기침을 숨기고 있었다는 걸 그제야 알았다.');
  await say('yun', '아버지!');
  await say('doc', '의원은 제 몸으로 먼저 보는 거다. 너도 그렇게 해라. 맥이나 짚어 봐.');
  await narr('그날 밤 붉은 눈들이 약방으로 몰려왔다. 피 냄새를 맡은 것 같았다.');
  await ctx.duel({ foes: ['rainman', 'rainman', 'rainman', 'rainman'], allies: ['smith_ally', 'dang_ally'], arena: 'village', bgm: 'boss', title: '약방을 지켜라', survive: 40, tip: '40초를 버티면 날이 밝습니다.' });
  await narr('날이 밝자 비가 그쳤다. 약은 들었다. 윤 의원의 열이 내렸고 눈도 맑아졌다. 그런데 늙은 몸이 사흘을 넘기지 못했다.');
  await narr('장례를 치른 날 저녁, 약방에 불이 켜져 있었다.');
  if (F().plague) await narr('윤설은 내 쪽을 보지 않았다. 장부에 그날 날짜를 적고 붓을 내려놓았다. 나는 문밖에 한참 서 있다가 돌아왔다.');
  else {
    await say('yun', '약이 들어요. 마을 사람들은 다 살 거예요.');
    await say('me', '네.');
    await say('yun', '팔 줘 봐요.');
    await narr('윤설은 내 팔에 붕대를 감았다. 다친 데도 없는 팔이었다. 붕대를 감는 손이 떨리고 있었다. 나는 아무 말도 하지 않았다.');
  }
  F().doc_dead = true; set('r3'); ctx.goal('달맞이 객잔의 곽 아주머니에게 가기');
  ctx.note('윤 의원이 세상을 떠났다. 혈우를 고치는 약을 먼저 먹어 보고 사흘을 넘기지 못했다.');
}

// ── 제3장 합석 ──
async function tableScene() {
  const hy = F().hyegak_dead ? 'jigaek' : 'clan_shaolin'; let good = 0;
  await ctx.chap(7, PART, '제3장 합석');
  await say('gwak', '약은 됐는데 일손이 없다. 정파는 정파대로 사파는 사파대로 제 식구만 챙기고 앉았어. 그러다 다 죽지.');
  await say('me', '모여야겠네요. 근데 누가 한자리에 앉겠어요.');
  await say('gwak', '내가 앉힌다. 밥 한 끼 먹자는데 안 올 놈이 어딨어. 네가 기별 넣어.');
  ctx.cg('table');
  await narr('보름 뒤, 달맞이 객잔 문 앞에 칼이 산더미처럼 쌓였다. 칼을 풀지 않으면 못 들어온다고 곽 아주머니가 국자를 들고 서 있었기 때문이다.');
  await narr('나는 다시 쟁반을 들었다.');
  ctx.cgOff();
  await say('clan_namgung', '상석은 당연히 구파일방과 오대세가 몫이다.');
  await say('samaung', '네 할아비 뼈다귀가 와서 앉겠다냐.');
  await say('clan_jegal', '나이순, 병력순, 문파순. 어떻게 계산해도 누군가는 칼을 찾으러 나갑니다.');
  const a = await choice('탁자는 네모났고 다들 머리 쪽을 노려보고 있다.', ['나이순으로 앉힌다', '탁자 네 귀를 톱으로 잘라 버린다', '제비를 뽑게 한다']);
  if (a === 1) {
    good++;
    await say('me', '강씨 아저씨, 톱 좀 주세요.');
    await narr('탁자 네 귀를 쓱쓱 잘라 둥글게 만들었다. 모서리가 없으니 어디가 머리인지 알 수 없었다. 곽 아주머니가 내 탁자를 어쩔 거냐고 소리쳤지만 말리지는 않았다.');
    await say('samaung', '점소이 머리가 맹주보다 낫구먼.');
  } else if (a === 0) { await say('clan_namgung', '그럼 소림이 맨 위겠군.'); await say('samaung', '나는 곽씨 아줌마 다음이다.'); await say('gwak', '그 나이에 눈이 삐었냐?'); }
  else { await narr('제비는 사마웅이 맨 끝을 뽑았다. 사마웅은 제비를 씹어 삼키고 아무 데나 앉았다.'); }
  await say('samaung', '여기 앉은 건 저 아줌마 국수 때문이다. 내 형제 열둘 일은 안 끝났어.');
  await say('clan_dang', '그 일이라면 제가 할 말이 있어요. 이십 년 전 그 술에 든 독은 일배혈이고, 우리 독고에서 나갔어요. 맹주관 서기가 가져갔고요.');
  await narr('젓가락 소리가 멎었다.');
  if (F().hyegak_dead) {
    await say('jigaek', '소림은 혜각 대사님을 벤 사람이 나르는 국수는 먹지 않습니다.');
    const b = await choice('혜명이 내가 내려놓은 그릇을 밀어낸다.', ['그 자리에 무릎을 꿇는다', '그릇을 도로 집어 든다']);
    if (b === 0) { good++; await narr('쟁반을 내려놓고 무릎을 꿇었다. 아무도 말리지 않았다. 혜명은 오랫동안 나를 내려다보다가 그릇을 끌어당겼다.'); await say('jigaek', '용서한 것은 아닙니다. 국수가 식어서입니다.'); }
    else { await say('jigaek', '그러십시오.'); }
  } else {
    await say('clan_shaolin', '그날 사파가 술자리에서 난동을 부렸다는 말을 제일 먼저 퍼뜨린 곳이 소림이오. 노납이 사과하오.');
    await narr('혜각이 일어나 사마웅에게 머리를 숙였다. 구파일방의 장문인이 사파에게 머리를 숙이는 걸 본 사람은 그 마당에 아무도 없었다.');
    good++;
    await say('samaung', '…국수 식는다. 앉아.');
  }
  await narr('그때 문밖에서 누군가 칼을 내려놓는 소리가 났다.');
  if (side() !== 'ma') {
    await say('hyeok', '칼은 두고 왔습니다. 문 앞에 쌓인 것을 보니 그래야 하는 것 같았습니다.');
    await say('clan_namgung', '마교가 여기가 어디라고.');
    await say('hyeok', '성녀는 천마가 깨어날 때 올리는 첫 제물이라고 합니다. 어제 알았습니다. 저도 이제 그 편이 아닙니다. 천산으로 가는 길은 제가 압니다.');
    F().hyeok_join = true;
  } else await say('hyeok', '천산으로 가는 길은 제가 압니다. 믿지 않으셔도 좋습니다. 저도 제물로 쓰일 몸이었습니다.');
  await say('clan_jegal', '그러면 누가 맹주를 맡습니까. 군을 움직이려면 머리가 하나여야 합니다.');
  const c = await choice('다들 나를 본다. 나는 아직 쟁반을 들고 있다.', ['제가 맡겠다고 한다', '혜각과 사마웅이 함께 맡게 한다', '곽 아주머니를 추대한다']);
  if (c === 2) { good++; await say('me', '곽 아주머니가 하시면 되잖아요. 다들 말 잘 듣는데요.'); await say('gwak', '미쳤냐? 나는 국수 끓여야 돼.'); await narr('그런데 아무도 반대하지 않았다. 사마웅이 먼저 웃음을 터뜨렸고, 그날부터 정사연합의 군령은 달맞이 객잔에서 나갔다.'); }
  else if (c === 1) { good++; await say('samaung', '내가 저 중놈이랑?'); await say(hy, '노납도 내키지는 않소.'); await say('gwak', '둘 다 내키지 않으면 공평하네. 그렇게 해.'); }
  else { await say('clan_namgung', '점소이가 맹주를 하겠다고?'); await say('samaung', '내 칼 앞에서 서 있던 놈이다. 나는 상관없다.'); ctx.rep('sa', 1); ctx.rep('jeong', 1); }
  await say('gwak', '이름은 뭐로 할 거야. 합석이면 합석이지 뭘 고민해. 먹었으면 그릇은 각자 치워.');
  await narr('그렇게 정파와 사파가 처음으로 한 상에서 밥을 먹었다. 강호 사람들은 그걸 합석이라고 불렀다.');
  F().table_good = good; F().hapseok = true; ctx.rep('jeong', 2); ctx.rep('sa', 2);
  if (!F().so_back && side() === 'ma') { await say('so', '야, {나}. 다음에 보면 안 봐준다고 했는데, 지금은 바쁘니까 나중에 하자.'); await say('me', '네.'); }
  await say('boat', '소림에서 기별이 왔구먼. 서쪽 군세가 숭산 밑까지 왔다더라. 배는 띄워 놨어.');
  set('r4'); ctx.goal('나루의 뱃사공에게 말해 소림사로 가기');
  ctx.note('달맞이 객잔에서 정파와 사파가 한 상에 앉았다. 정사연합이 섰다.');
}

// ── 제4장 소림의 문 ──
async function gateScene() {
  const sworn = S().sworn === 'cheol';
  await ctx.chap(7, PART, '제4장 소림의 문');
  await narr('서쪽 군세가 숭산 아래까지 왔다. 소림을 넘으면 그다음은 중원이었다. 승병 대부분이 약을 나르러 내려간 뒤라 산문에 남은 사람은 쉰이 안 됐다.');
  if (F().hyegak_dead && !F().sa_refused) {
    await say('jigaek', '합석은 합석입니다. 소림 경내는 못 들어오십니다.');
    await ctx.duel({ foes: ['monk_block', 'monk_block'], arena: 'court', bgm: 'fight', title: '산문 앞', yieldAt: .5, noLoot: true, optional: true, expMul: 0 });
    await say('cheol', '그만들 하시오. 지금 저 밑에 뭐가 오는지 안 보이오?');
  }
  await say('cheol', '시주, 저 문 보이시오? 한쪽만 새 나무요.');
  await say('me', '스님이 부수고 나간 자리잖아요.');
  await say('cheol', '십 년이 넘었는데 아직도 다 못 고쳤소. 소승이 여기 서겠소. 부순 놈이 막아야 앞뒤가 맞지 않겠소.');
  await say('jigaek', '파계승은 산문 안으로 들어올 수 없습니다.');
  await say('cheol', '안 들어가오. 밖에 서겠소.');
  await narr('철우는 닫힌 문을 등지고 돌계단 맨 위에 앉았다. 그러고는 품에서 주먹밥을 꺼내 먹기 시작했다.');
  await ctx.duel({ foes: ['hyeolgyo', 'hyeolgyo', 'hyeolgyo'], allies: ['cheol_ally'], arena: 'court', bgm: 'fight', title: '산문 앞 첫 물결' });
  if (sworn) {
    await say('me', '형님, 뒷길에도 놈들이 올라온대요.');
    await say('cheol', '아우가 가시오. 여기는 소승이 보겠소.');
    await say('me', '싫어요. 뒷길은 나한당에 맡겼어요. 혼자 서지 마세요. 밥값을 누가 내요.');
    await say('cheol', '…허허, 그렇소. 밥값이 있었지.');
    await ctx.duel({ foes: ['hyeol_elite', 'hyeolgyo', 'hyeolgyo'], allies: ['cheol_ally'], arena: 'court', bgm: 'boss', title: '소림의 문' });
    ctx.cg('gate');
    await narr('사흘 동안 문이 열리지 않았다. 나흘째 아침, 서쪽 군세가 물러가자 철우가 돌계단에 주저앉았다. 왼팔이 어깨 밑에서 없어져 있었다.');
    await say('cheol', '아우, 이제 소승 밥값은 영영 못 치르겠소. 젓가락질이 안 되는구려.');
    await say('me', '언제 치르셨어요.');
    await say('cheol', '그렇소? 그럼 괜찮소.');
    ctx.cgOff();
    await say('jigaek', '…문을 열겠습니다. 스님, 안으로 드시지요.');
    await say('cheol', '소승은 파계승이오.');
    await say('jigaek', '오늘은 아닙니다.');
    F().cheol_arm = true;
  } else {
    await say('me', '스님, 뒷길에도 놈들이 올라온대요.');
    await say('cheol', '시주가 가시오. 여기는 소승이 보겠소.');
    await say('me', '혼자서요?');
    await say('cheol', '문을 부술 때도 혼자였소. 어서 가시오. 이따 저녁은 시주가 사시오.');
    await ctx.duel({ foes: ['hyeol_elite', 'hyeolgyo', 'hyeolgyo'], arena: 'forest', bgm: 'boss', title: '소림 뒷길' });
    ctx.cg('gate');
    await narr('뒷길을 막고 돌아왔을 때 싸움은 끝나 있었다. 산문 앞에 혈교도가 마흔 구 넘게 쓰러져 있었고, 철우는 닫힌 문 앞에 서 있었다.');
    await say('me', '스님. 저녁 사러 왔어요.');
    await narr('대답이 없었다. 가까이 가 보니 눈을 뜬 채였다. 오른손에 먹다 남은 주먹밥이 쥐여 있었다.');
    ctx.cgOff();
    await say('jigaek', '…문을 열겠습니다. 스님을 안으로 모십시오.');
    await narr('십 년 넘게 닫혀 있던 쪽 문이 열렸다. 승려들이 철우를 메고 그 문으로 들어갔다. 나는 돌계단에 남은 주먹밥 부스러기를 오래 내려다봤다.');
    F().cheol_dead = true;
  }
  ctx.note(F().cheol_dead ? '철우가 소림 산문 앞에서 세상을 떠났다. 끝까지 문 안으로 들어가지 않았다.' : '철우가 왼팔을 잃었다. 소림 산문은 뚫리지 않았다.');
  await ctx.warp('cheongha', 22.5, 26, 1);
  set('r5'); ctx.goal('구화성 남문으로 가기 (나루의 뱃사공)');
}

// ── 제5장 정사연합 ──
async function retake() {
  await ctx.chap(7, PART, '제5장 정사연합');
  await narr('눈이 녹기 전에 연합군이 구화성 앞에 모였다. 천하비무의 깃발이 걸렸던 성벽에 혈교의 붉은 천이 걸려 있었다.');
  await say('clan_jegal', '남문을 깨면 서문은 저절로 열립니다. 남문이 제일 단단합니다.');
  await say('samaung', '남문은 내가 깬다.');
  await say('clan_namgung', '사파한테 앞을 맡길 것 같으냐. 남궁이 먼저다.');
  await say('me', '같이 가시면 되잖아요.');
  await ctx.duel({ foes: ['hyeolgyo', 'hyeolgyo', 'hyeol_elite'], allies: ['samaung_ally', 'namgung_ally'], arena: 'ring', bgm: 'fight', title: '구화성 남문' });
  await say('samaung', '네 칼도 쓸 만하구나, 남궁 계집.');
  await say('clan_namgung', '네 칼은 너무 크다.');
  await narr('비무대가 있던 광장에 들어서자 시체 더미 위에 누가 앉아 있었다.');
  if (F().hyeolma_dead) { await say('hyeolma', '또 보는구나. 나는 한 번 죽었는데 귀마가 도로 일으키더군.'); await say('me', '몇 번을 베면 돼?'); await say('hyeolma', '이번이 마지막이었으면 좋겠구나. 나도 지겹다.'); }
  else { await say('hyeolma', '점잖게 앉아 국수나 먹던 놈들이 많이도 왔구나.'); await say('me', '여기서 내려와.'); await say('hyeolma', '내려가 주마. 네 피를 받으러.'); }
  const allies = ['so_ally']; if (!F().cheol_dead) allies.push('cheol_ally');
  await ctx.duel({ foes: ['hyeolma2'], allies, arena: 'ring', bgm: 'boss', title: '혈마' });
  ctx.cg('retake');
  await narr('그날 저녁 구화성 성벽에 깃발 두 개가 나란히 올라갔다. 하나는 소림의 것이었고 하나는 흑도맹의 것이었다. 깃대를 세운 건 남궁세가 사람들과 맹호의 산적들이었는데, 서로 삐뚤어졌다고 욕을 하면서 세웠다.');
  ctx.cgOff();
  await say('clan_jegal', '혈마는 넷 중 하나입니다. 빙마와 귀마가 남았고, 연경추도 어딘가 살아 있습니다. 천산을 치지 않으면 내년에 또 옵니다.');
  await say('hyeok', '천산까지는 비단길로 석 달입니다. 물이 있는 곳은 제가 압니다.');
  await say('gwak', '가겠다고? 그럼 밥은 먹고 가. 도시락 싸 줄 테니까 다 먹고 와. 남기면 혼난다.');
  ctx.silver(800);
  ctx.note('구화성을 되찾고 혈마를 쓰러뜨렸다. 천산으로 원정을 떠난다.');
  await G.act3.part8();
}

const job = o => ({ dir: 0, mark: () => true, ...o });
export const hook7 = k => {
  if (at('r2') && k === 'yun') return rainStart;
  if (at('r2b') && k === 'clan_dang' && !F().r_dang) return dangRain;
  if (at('r2b') && k === 'yun' && F().r_moss && F().r_dang) return rainCure;
  return null;
};
Story.providers.push(function part7(id) {
  const n = [], sp = [], tr = [];
  if (id === 'cheongha' && at('end') && !F().ended && !F().act3) tr.push({ x: 0, y: 0, w: 99, h: 99, when: () => at('end') && !F().ended && !F().act3, run: begin }); // 6부까지 끝낸 저장
  if (!F().act3) return { npcs: n, spots: sp, trigs: tr, roam: [] };
  if (id === 'inn' && !at('r3')) n.push({ id: 'gwak2', spr: 'OldWoman', x: 4, y: 4.6, talk: async () => { await say('gwak', F().ended ? '일해, 일.' : '밥은 먹었어? 다치지 말고 다녀.'); } });
  if (id === 'inn' && F().hapseok) {
    n.push({ id: 'so', spr: 'RedSamurai', x: 9, y: 9, dir: 2, talk: async () => { await say('so', '칼은 닦았어?'); } });
    if (F().hyeok_join) n.push({ id: 'hyeok', spr: 'Hyeok', x: 13, y: 9, dir: 2, talk: async () => { await say('hyeok', '천산으로 가는 길은 제가 압니다.'); } });
    if (!F().cheol_dead) n.push({ id: 'cheol', spr: 'Monk2', x: 6, y: 9, dir: 3, talk: async () => { await say('cheol', '시주, 오늘 저녁은 뭐요?'); } });
  }
  if (id === 'clinic' && at('r2', 'r2b')) n.push({ id: 'yun', spr: 'Princess', x: 3.5, y: 4.8, dir: 0, mark: () => !!hook7('yun'), talk: async () => { const h = hook7('yun'); if (h) return h(); await say('yun', '서둘러요. 매일 세 명씩 일어나요.'); } });
  if (id === 'cloudmt' && at('r2b') && !F().r_moss) n.push(job({ id: 'job_moss', stamp: 'flower1', spr: '', x: 40, y: 9, hint: '달빛이끼 캐기', talk: mossRain }));
  if (id === 'inn' && at('r3')) n.push(job({ id: 'gwak2', spr: 'OldWoman', x: 4, y: 4.6, talk: tableScene }));
  if (id === 'shaolin' && at('r4')) n.push(job({ id: 'cheol_gate', spr: 'Monk2', x: 19.5, y: 23, hint: '철우에게 말 걸기', talk: gateScene }));
  if (id === 'guhwa' && at('r5')) n.push(job({ id: 'job_gu', spr: 'Knight', x: 24.5, y: 27, hint: '남문 공격', talk: retake }));
  return { npcs: n, spots: sp, trigs: tr, roam: [] };
});
G.act3 = { begin, hook7 };
