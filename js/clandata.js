// 구파일방과 오대세가 자료. 다른 모듈보다 먼저 읽혀도 되도록 의존을 작게 둔다
import { G } from './core.js';
import { WHO } from './dialog.js';
import { FOES } from './foes.js';

const T = { 1: { hp: 520, atk: 28, def: 8, spd: 66, exp: 130, silver: 60, pause: 1.05, poise: 60 }, 2: { hp: 860, atk: 34, def: 10, spd: 72, exp: 220, silver: 100, pause: .95, poise: 90 }, 3: { hp: 1280, atk: 40, def: 12, spd: 76, exp: 340, silver: 160, pause: .85, poise: 130 } };
// id, 무리, 이름, 한자, 대표, 그림, 강함, 무기, 기술, 전수, 심법, 소개, 위치
export const CLANS = [
  { id: 'shaolin', group: '구파일방', name: '소림사', han: '少林寺', who: '혜각 대사', spr: 'Monk', tier: 3, wpn: 'Club', moves: ['luohan', 'iron_fist', 'earth_stomp', 'heavy', 'tathagata'], gift: ['luohan', 'tathagata'], heart: 'yigin', at: ['ninehall', 6, 9.4], desc: '천하 무공의 뿌리라 불리는 절. 권법과 내공이 깊다.',
    intro: [['아미타불. 시주의 걸음이 낯설지 않소.'], ['me', '어디서 보셨는데요?'], ['노납이 젊을 때, 월하곡에서 보았소. 그날 소림의 깃발도 거기 있었소.'], ['그 걸음을 한 번은 받아 봐야 저승에 갈 면목이 설 것 같구려.']], win: [['아미타불. 주먹에 원망이 없구려. 그게 더 무섭소.'], ['이 권과 장은 가져가시오. 그리고 철우 그 녀석에게 밥은 먹고 다니라 전해 주시오.']] },
  { id: 'wudang', group: '구파일방', name: '무당파', han: '武當派', who: '청허 도장', spr: 'OldMan', tier: 3, wpn: 'Sword', moves: ['taiji', 'fall_flower', 'flurry', 'swallow_qi', 'fan5'], gift: ['taiji'], heart: 'taecheong', at: ['ninehall', 14, 9.4], desc: '부드러움으로 강함을 이긴다는 도가의 명문. 태극의 이치로 싸운다.',
    intro: [['태극은 이기려 하지 않소. 지지 않을 뿐이지.'], ['me', '그럼 비무는 어떻게 끝나요?'], ['대개 오래 걸리오.']], win: [['허허. 오래 걸리지 않았군.'], ['젊은이, 십칠 년 전 무당은 맹약을 따르면서도 칼을 뽑지 않았소. 그것으로 죄를 면한다고 믿었지. 면해지지 않더이다.']] },
  { id: 'hwasan', group: '구파일방', name: '화산파', han: '華山派', who: '매향', spr: 'Hwasan', tier: 2, wpn: 'Rapier', moves: ['plum', 'cloud_flash', 'flurry', 'blink'], gift: ['plum'], heart: 'jaha', at: ['ninehall', 22, 9.4], desc: '매화검수로 이름난 검문. 화려한 검로로 유명하다.',
    intro: [['네가 소문의 쟁반 점소이구나.'], ['me', '쟁반은 이제 좀 잊어 주시면 안 될까요.'], ['봐주지 않아. 종남 놈들이 보고 있거든.']], win: [['…꽃이 다 졌네. 구결은 네가 가져. 대신 종남한테는 지지 마.']] },
  { id: 'jongnam', group: '구파일방', name: '종남파', han: '終南派', who: '서문각', spr: 'BlueNinja', tier: 1, wpn: 'Sword', moves: ['zhongnan', 'double', 'lunge', 'swallow_qi'], gift: ['zhongnan'], at: ['ninehall', 30, 9.4], desc: '화산과 오랜 앙숙인 검문. 곧고 끈질긴 검을 쓴다.',
    intro: [['화산에 먼저 갔나? 순서가 틀렸다. 강호 제일 검문은 종남이다.'], ['me', '저쪽도 똑같이 말하던데요.'], ['그러니까 틀렸다는 거다.']], win: [['…이 일은 화산에 말하지 마라. 부탁이다.']] },
  { id: 'emei', group: '구파일방', name: '아미파', han: '峨嵋派', who: '정혜 사태', spr: 'EggGirl', tier: 2, wpn: 'Sword', moves: ['emei', 'quick', 'fan5', 'double'], gift: ['emei'], at: ['ninehall', 38, 9.4], desc: '여승과 여협이 이끄는 문파. 자비롭지만 말은 맵다.',
    intro: [['곽란은 아직도 국수를 끓이고 있느냐.'], ['me', '아주머니를 아세요?'], ['젊을 때 같이 칼을 들었지. 그때도 입이 험했다. 덤벼라. 얼마나 잘 먹이고 키웠는지 보자.']], win: [['밥은 잘 먹고 컸구나. 그거면 됐다.'], ['곽란을 찾거든 전해라. 그때 말리지 못해 미안했다고.']] },
  { id: 'gonryun', group: '구파일방', name: '곤륜파', han: '崑崙派', who: '설봉자', spr: 'Eskimo', tier: 2, wpn: 'Lance2', moves: ['kunlun', 'rain', 'slash', 'spin'], gift: ['kunlun'], at: ['ninehall', 6, 19.4], desc: '서쪽 설산의 문파. 경공이 천하제일이라 자부한다.',
    intro: [['여기는 덥군. 곤륜에서는 눈이 녹는 날이 일 년에 사흘이다.'], ['me', '그 옷 벗으시면 되잖아요.'], ['이것이 내 무공의 근본이다.']], win: [['땀을 흘렸다. 십 년 만이다.']] },
  { id: 'gongdong', group: '구파일방', name: '공동파', han: '崆峒派', who: '막철심', spr: 'Caveman', tier: 1, wpn: 'Club', moves: ['kongtong', 'iron_fist', 'chain_kick', 'heavy'], gift: ['kongtong'], at: ['ninehall', 14.5, 19.4], desc: '제 몸을 깎아 힘을 얻는 강맹한 권법의 문파.',
    intro: [['칠상권은 남을 크게 다치게 하고 나를 조금 다치게 하지.'], ['me', '왜 그런 걸 배우셨어요?'], ['젊을 땐 조금이 조금인 줄 알았다.']], win: [['허리가… 허리가 아프군. 너는 나이 들어서는 쓰지 마라.']] },
  { id: 'jeomchang', group: '구파일방', name: '점창파', han: '點蒼派', who: '섭일', spr: 'Samurai', tier: 1, wpn: 'Katana', moves: ['diancang', 'cloud_flash', 'quick', 'lunge'], gift: ['diancang'], at: ['ninehall', 22.5, 19.4], desc: '말보다 칼이 빠른 쾌검의 문파.',
    intro: [['빠른 게 전부다.']], win: [['…느렸다.']] },
  { id: 'cheongseong', group: '구파일방', name: '청성파', han: '靑城派', who: '진다명', spr: 'Greenman', tier: 1, wpn: 'Sword', moves: ['qingcheng', 'double', 'swallow_qi', 'spin'], gift: ['qingcheng'], at: ['ninehall', 30, 19.4], desc: '사천 청성산의 도가 검문. 차와 검을 함께 닦는다.',
    intro: [['차 한잔 하시겠소? 식기 전에 끝냅시다.'], ['me', '차가 식기 전에요?'], ['식으면 맛이 없으니.']], win: [['식었구려. 다시 끓이지요. 앉으시오.']] },
  { id: 'gaebang', group: '구파일방', name: '개방', han: '丐幇', who: '홍두 장로', spr: 'Gaebang', tier: 2, wpn: 'Stick', moves: ['tagu', 'hangryong', 'chain_kick', 'quick'], gift: ['tagu', 'hangryong'], at: ['ninehall', 38.5, 19.4], desc: '천하의 거지가 모인 일방. 강호의 소문은 모두 여기로 흐른다.',
    intro: [['밥 한 술만… 농담이다. 네가 철우 밥값을 대신 냈다며?'], ['me', '그게 벌써 거기까지 갔어요?'], ['개방의 귀는 천 개다. 입은 만 개고. 한 판 하고 얘기하자.']], win: [['밥값은 받은 셈 치마. 하나 알려 주지. 맹주 창고로 들어가는 쌀이 맹에 있는 사람 수보다 많다.'], ['거기서 누가 먹고 있는지는 나도 모른다. 얼굴을 안 보여 주는 놈들이라.']] },
  { id: 'namgung', group: '오대세가', name: '남궁세가', han: '南宮世家', who: '남궁진', spr: 'Namgung', tier: 3, wpn: 'Rapier', moves: ['sky_sword', 'cloud_flash', 'flurry', 'wind_turn', 'fan5'], gift: ['sky_sword'], heart: 'changgung', at: ['fiveclans', 5, 10.4], desc: '천하제일 검가를 자처하는 명문. 자존심이 하늘을 찌른다.',
    intro: [['출신 모를 자가 맹주 자리에 앉은 것도 불쾌한데, 이제 {호}까지 비무대에 오르는군.'], ['me', '국수는 드셔 보셨어요?'], ['…뽑아라.']], win: [['사과하지. 남궁의 검은 이제부터 출신을 묻지 않겠다.']] },
  { id: 'moyong', group: '오대세가', name: '모용세가', han: '慕容世家', who: '모용설', spr: 'Moyong', tier: 3, wpn: 'Katana', moves: ['ihwa', 'blink', 'flurry', 'fan5'], gift: ['ihwa'], at: ['fiveclans', 16, 10.4], desc: '상대의 초식을 상대에게 돌려주는 기이한 가문.',
    intro: [['네 초식은 네게 돌려줄게. 모용의 예법이야.'], ['me', '받은 걸 돌려주는 건 좋은 예법이네요. 방값도 그렇게 해 주시면…'], ['무슨 소리야?']], win: [['돌려줄 수 없는 것도 있구나. 그 걸음은 뭐지?'], ['me', '걸레질이요.'], ['…장난치지 마.']] },
  { id: 'jegal', group: '오대세가', name: '제갈세가', han: '諸葛世家', who: '제갈현', spr: 'Jegal', tier: 3, wpn: 'Stick', moves: ['palmun', 'rain', 'ring8', 'fan5'], keep: 95, gift: ['palmun'], at: ['fiveclans', 28, 10.4], desc: '진법과 지략의 가문. 정천맹의 작전은 대개 이곳에서 나온다.',
    intro: [['이 판의 계산은 끝났습니다. 공자는 일곱 수 안에 지십니다.'], ['me', '여덟 수까지 버티면요?'], ['그런 경우는 없습니다.']], win: [['여덟 수째가 있었군요.'], ['값을 치르지요. 십칠 년 전 토벌 명령서는 제 스승이 썼습니다. 날짜는 습격 사흘 뒤였습니다.'], ['그런데 불은 사흘 먼저 났지요. 명령보다 먼저 움직인 사람이 있었다는 뜻입니다.']], note: '제갈현: 토벌 명령서의 날짜는 습격 사흘 뒤였다. 명령보다 먼저 움직인 자가 있다.' },
  { id: 'dang', group: '오대세가', name: '사천당가', han: '四川唐家', who: '당소연', spr: 'Dang', tier: 2, wpn: 'Sai', moves: ['manchen', 'dart3', 'venom', 'blink'], keep: 75, gift: ['manchen'], at: ['fiveclans', 10, 19.4], desc: '독과 암기의 가문. 아무도 함부로 차를 얻어 마시지 않는다.',
    intro: [['창운산에서 칠일소혼산을 풀었다는 약방 아가씨 일행이지?'], ['me', '당가의 독이라고 들었어요.'], ['우리 문중에서 십칠 년 전에 도둑맞은 처방이야. 범인은 찾았어? 못 찾았으면 몸으로 얘기하자.']], win: [['제법이네. 그 처방을 훔쳐 간 손님은 맹주관에 자주 드나들던 사람이었어.'], ['증거는 없어. 당가가 증거 없이 말하는 일은 드물지만.']], note: '당소연: 칠일소혼산 처방은 십칠 년 전 도둑맞았다. 훔친 자는 맹주관을 드나들던 사람.' },
  { id: 'paeng', group: '오대세가', name: '하북팽가', han: '河北彭家', who: '팽대악', spr: 'Paeng', tier: 2, wpn: 'BigSword', moves: ['tiger_roar', 'break_mount', 'mad_wind', 'heavy', 'spin'], gift: ['tiger_roar'], at: ['fiveclans', 24, 19.4], desc: '도법의 가문. 밥을 많이 먹고 칼을 크게 휘두른다.',
    intro: [['밥은 먹었나!'], ['me', '네?'], ['밥을 먹어야 칼이 선다! 안 먹었으면 먹고 와라! 먹었으면 덤벼라!']], win: [['하하하! 좋다! 오호단문도를 가져가라! 대신 오늘 저녁은 네가 사라!']] },
];
for (const c of CLANS) {
  const t = T[c.tier];
  FOES['clan_' + c.id] = { name: c.who, spr: 'chars/' + c.spr, ...t, moves: c.moves, boss: 1, title: c.name, wpn: c.wpn, guard: c.tier * .4, keep: c.keep, phases: [{ hp: .5, pause: t.pause * .8 }] };
  WHO['clan_' + c.id] = { name: c.who, face: c.spr };
}
Object.assign(FOES, {
  hyegak_ally: { name: '혜각 대사', spr: 'chars/Monk', hp: 1900, atk: 42, def: 16, spd: 56, exp: 0, silver: 0, pause: 1.2, moves: ['luohan', 'iron_fist', 'earth_stomp'], wpn: 'Club' },
  namgung_ally: { name: '남궁진', spr: 'chars/Namgung', hp: 1600, atk: 46, def: 12, spd: 76, exp: 0, silver: 0, pause: 1.1, moves: ['cloud_flash', 'flurry', 'wind_turn'], wpn: 'Rapier' },
});
export const clansWon = () => CLANS.filter(c => G.S.flags['clan_' + c.id]).length;


// 사파 흑도맹과 마교. 정천맹과 맞서는 나머지 두 갈래
export const SAPA = [
  { name: '녹림 칠십이채', han: '綠林七十二寨', desc: '산을 먹고 사는 산채들의 연합. 흑풍채 같은 곳은 그 끝자락이다.', open: 'fort_open' },
  { name: '장강수로채', han: '長江水路寨', desc: '장강의 뱃길을 쥔 큰 수적. 동네 수적과는 규모가 다르다.', open: 'boat_guhwa' },
  { name: '하오문', han: '下五門', desc: '도박장과 기루, 도둑들의 소문망. 싸움보다 장사를 좋아한다.', open: 'boat_guhwa' },
  { name: '오독문', han: '五毒門', desc: '독을 쓰는 문파. 사천당가와 오랜 앙숙이다.', open: 'cloud_open' },
  { name: '혈의방', han: '血衣幇', desc: '돈을 받고 사람을 죽이는 살수들.', open: 'boat_guhwa' },
];
