// 1부 5장: 강호 유람. 소림 장경각과 화산 벼랑의 기연
import { G, Sound, fadeTo, toast } from './core.js';
import { Story, ctx, say, narr, choice } from './ctx.js';
import { WHO } from './dialog.js';
import { learn } from './state.js';
import { FOES } from './foes.js';
import { step, set, at } from './story1.js';
import { toGuhwa } from './story2.js';

const S = () => G.S, F = () => G.S.flags;
const F2 = (name, spr, hp, atk, def, spd, exp, silver, pause, moves, o = {}) => ({ name, spr, hp, atk, def, spd, exp, silver, pause, moves, ...o });
Object.assign(WHO, { jigaek: { name: '지객승 혜명', face: 'Monk' }, sodi: { name: '늙은 스님', face: 'Sodi' }, luohan: { name: '나한당 수좌', face: 'Monk' }, yuhyeon: { name: '화산 검수', face: 'Hwasan' } });
Object.assign(FOES, {
  sodi: F2('늙은 스님', 'chars/Sodi', 99999, 11, 40, 72, 0, 0, 1.15, ['quick', 'iron_fist', 'blink'], { boss: 1, poise: 99999, wpn: 'Stick', title: '장경각' }),
  luohan: F2('나한승', 'chars/Monk', 210, 21, 7, 58, 46, 10, 1.15, ['iron_fist', 'earth_stomp', 'slash'], { wpn: 'Club', guard: .5, poise: 20 }),
  luohan_chief: F2('나한당 수좌', 'chars/Monk', 780, 27, 9, 62, 190, 80, .95, ['luohan', 'chain_kick', 'heavy', 'earth_stomp'], { wpn: 'Club', guard: .8, boss: 1, poise: 110 }),
  jongnam_d: F2('종남 제자', 'chars/BlueNinja', 200, 23, 6, 64, 44, 12, 1.1, ['double', 'lunge', 'swallow_qi'], { wpn: 'Sword', guard: .4 }),
  python: F2('벼랑 구렁이', 'mon/Snake2', 1040, 28, 8, 54, 260, 0, .9, ['venom', 'charge', 'quake', 'spit'], { mon: 1, boss: 1, poise: 120, scale: 2.4, r: 11 }),
});

async function toShaolin() {
  await say('yun', '소림이면 숭산이죠. 제가 같이 가도 돼요? 장경각에 의서가 많다고 들었어요.');
  await say('me', '약방은요?');
  await say('yun', '아버지가 있잖아요. 그리고 당신 혼자 보내면 또 어디서 물려 와요.');
  await narr('강호 유람\n\n창운산을 내려와 뱃길과 산길로 보름.\n숭산의 종소리가 먼저 들리고, 그다음에 절이 보였다.');
  set('t2'); ctx.goal('소림사 산문 앞의 지객승에게 서찰 전하기');
  await ctx.warp('shaolin', 19.5, 26, 1);
}
async function jigaek() {
  await say('jigaek', '창운문 문주의 서찰이군요. 먼 길 오셨습니다.');
  await say('me', '혹시 십칠 년 전 일을 아시는 스님을 뵐 수 있을까요.');
  await say('jigaek', '그런 분을 뵙는 일은 쉽지 않습니다. 소림의 법이 있습니다. 객은 사흘을 먼저 일합니다.');
  await say('me', '무슨 일을요?');
  await say('jigaek', '장경각 바닥이 더럽습니다. 스님들은 무공을 닦느라 바빠서요.');
  await say('me', '저요? 바닥이요?');
  await say('yun', '…왜 웃어요?');
  await say('me', '안 웃었어요. 그런데 이건 진짜 제가 제일 잘하는 일이에요.');
  set('t3'); ctx.goal('장경각(왼쪽 건물) 바닥을 세 군데 닦기');
}
const mops = [
  ['서가 앞', '먼지가 손가락 두 마디는 쌓였다. 오십 년은 아무도 안 닦은 것 같다.'],
  ['창가', '허리를 세우고, 왼발로 민다. 오른발은 따라오게 둔다. 몸이 저절로 움직인다.'],
  ['문턱', '걸레를 짤 때마다 물이 검다. 소림의 무공은 깊어도 청소는 얕다.'],
];
async function mop(i) {
  await say(null, mops[i][1]); F()['mop' + i] = true; Sound.sfx('select');
  if (F().mop0 && F().mop1 && F().mop2) await sweeper();
}
async function sweeper() {
  await say('sodi', '왼발로 미는구나.');
  await say('me', '깜짝이야. 언제부터 계셨어요?');
  await say('sodi', '네가 들어오기 전부터. 여기서 쉰 해째 비질을 한다. 스님들은 나를 비질하는 늙은이라 부르지.');
  await say('sodi', '걸레질은 누구에게 배웠느냐.');
  await say('me', '방값 안 내는 영감님이요.');
  await say('sodi', '허허. 그 걸음을 오십 년 전에 한 번 보았다. 달 밝은 밤에 어떤 여인이 이 바닥을 그렇게 걸었지.');
  await say('sodi', '칠식은 얼마나 모았느냐.');
  await say('me', '…그걸 어떻게 아세요.');
  await say('sodi', '바닥을 쉰 해 닦으면 발소리만 들어도 안다. 들고 오너라. 내 빗자루를 건드리면 하나 가르쳐 주마.');
  await ctx.duel({ foes: ['sodi'], arena: 'room', bgm: 'quiet', title: '비질하는 늙은이', survive: 24, expMul: 0, tip: '스님은 쓰러뜨릴 수 없습니다. 24초를 버티며 움직임을 익히세요.' });
  await say('sodi', '끝까지 서 있었구나. 넘어지지 않는 건 재주다. 그거면 됐다.');
  await say('sodi', '손 내밀어라.');
  await narr('마른 손가락이 손목을 짚었다.\n뜨거운 물줄기가 단전에서 등을 타고 올라갔다가 내려왔다.\n막혀 있던 무언가가 소리 없이 열렸다.');
  S().inn += 3; S().con += 2; if (!S().hearts.includes('sesu')) S().hearts.push('sesu');
  Sound.sfx('power2'); toast('내공 +3, 근골 +2 · 심법 세수경 잔결을 익혔다', 3.5);
  await say('sodi', '세수경의 앞머리다. 소림에서도 아는 사람이 드물다. 장경각 바닥값이라 해 두자.');
  await say('me', '왜 저한테 이런 걸 주세요?');
  await say('sodi', '바닥을 닦아 준 사람은 네가 처음이다.');
  await say('sodi', '그리고 하나만 말해 두마. 네 종이들, 앞에 한 장이 더 있었을 게다. 일식보다 앞에.');
  await say('me', '앞에요? 일곱 장인데요.');
  await say('sodi', '늙은이 말은 빗자루로 쓸어 버려도 된다. 나가 보아라. 나한당에서 너를 벼른다.');
  ctx.note('장경각의 늙은 스님: 월하칠식의 앞에 한 장이 더 있었을 것이다.');
  set('t4'); ctx.goal('나한당(오른쪽 건물) 앞의 수좌 만나기');
}
async function luohanHall() {
  await say('luohan', '장경각 바닥을 닦았다는 객이 그대인가. 사흘 일거리를 반나절에 끝냈다더군.');
  await say('me', '그쪽이 제 전문이라서요.');
  await say('luohan', '소림을 그냥 나가는 객은 없다. 나한진을 지나면 십칠 년 전 일을 아는 분을 뵙게 해 주겠다.');
  await ctx.duel({ foes: ['luohan', 'luohan', 'luohan', 'luohan'], arena: 'court', title: '십팔나한진 · 첫 진', bgm: 'fight', tip: '둘러싸이기 전에 경공으로 빠져나오세요. 회전 공격 초식이 있다면 지금 씁니다.' });
  await say('luohan', '둘러싸이지 않는구나. 그 걸음 덕인가. 다음 진이다.');
  await ctx.duel({ foes: ['luohan', 'luohan', 'luohan_chief'], arena: 'court', title: '십팔나한진 · 끝 진', bgm: 'boss', yieldAt: .25 });
  await say('clan_shaolin', '그만. 아미타불. 수좌, 물러서라.');
  await say('me', '혜각 대사님이세요?');
  await say('clan_shaolin', '그렇소. 시주가 묻고 싶은 것은 알고 있소. 십칠 년 전 월하곡에 소림의 깃발도 있었소. 노납이 들고 갔지.');
  await say('me', '왜 가셨어요.');
  await say('clan_shaolin', '맹약이 있었고, 마공을 익힌 문파라 들었소. 도착해 보니 이미 불길이 올라 있었소. 우리는 칼도 뽑기 전에 재를 보았지.');
  await say('clan_shaolin', '시주를 탓할 수 없소. 그러니 시주도 노납에게 묻지 마시오. 답을 몰라서 십칠 년을 염불만 했소.');
  await say('me', '철우라는 스님을 아세요?');
  await say('jigaek', '…그 이름을 어디서 들으셨습니까. 그 자가 부순 문을 저희가 아직 고치고 있습니다.');
  ctx.note('혜각 대사: 소림이 도착했을 때 월하곡은 이미 불타고 있었다.');
  await narr('소림을 떠나 서쪽으로 길을 잡았다.\n화산에 매화가 피었다는 소문이 있었고,\n윤설이 그 산에서만 나는 약초를 찾았다.');
  await fadeTo(1); G.field.load('hwasan', 14, 11.5, 3); await fadeTo(0);
  await say('clan_hwasan', '비켜! 이 절벽길은 화산 땅이야!');
  await say('clan_jongnam', '언제부터? 삼백 년 전 지도에는 종남 땅이다.');
  await say('me', '저기요, 약초만 캐고 갈게요.');
  await say('clan_jongnam', '넌 뭐냐? 화산 편이냐?');
  await say('clan_hwasan', '화산이 저런 걸 데리고 다닐 것 같아?');
  await say('yun', '…저 사람들 왜 저래요.');
  await ctx.duel({ foes: ['jongnam_d', 'jongnam_d', 'jongnam_d'], arena: 'forest', title: '절벽길 시비', bgm: 'fight', tip: '좁은 싸움입니다. 끝나면 벼랑을 조심하세요.' });
  await say('me', '끝났죠? 이제 진짜 약초만…');
  await say(null, '발밑의 바위가 부서졌다. 몸이 뒤로 기울었다.');
  await say('yun', '{나} 씨!');
  await say('me', '왜 강호 사람들은 꼭 벼랑에서—');
  await fadeTo(1); await narr('얼마나 떨어졌는지 모른다.\n나뭇가지가 몇 번 등을 때렸고, 차가운 물이 얼굴에 닿았다.');
  set('t5'); ctx.goal('동굴을 살펴보고 나갈 길 찾기');
  G.field.load('cliffcave', 7.5, 9, 1); await fadeTo(0);
  await say('me', '…살았네. 곽 아주머니가 알면 또 뭐라고 하시겠다.');
  await say('me', '근데 진짜 벼랑 밑에 동굴이 있어? 이야기책에서만 그런 줄 알았는데.');
}
async function bones() {
  await say(null, '돌비석 앞에 유골 한 구가 앉아 있다. 무릎 위에 낡은 검이 놓여 있고, 벽에 칼끝으로 새긴 글이 있다.');
  await say(null, '“삼백 년 지기의 끝이 이 동굴이구나. 나는 월하문 제십일대 호법 강유. 뒤에 올 아이에게 남긴다.”');
  await say(null, '“칠식을 다 모아도 놀라지 마라. 칠식은 끝이 아니다. 서문을 찢지 마라. 맨 앞 장을 찢지 마라.”');
  await say(null, '“동굴 물가의 설삼은 내가 백 년 전 심었으니 지금쯤 먹을 만할 것이다. 값은 안 받는다.”');
  await say('me', '…여기까지 와서도 값 얘기네. 우리 문파는 왜 다 이래.');
  ctx.note('벼랑 동굴의 유언: 칠식은 끝이 아니다. 서문을 찢지 마라.');
  F().bones = true; ctx.goal('물가의 설삼을 찾기');
}
async function ginseng() {
  await say('me', '이게 설삼인가. 달빛처럼 희네.');
  await say(null, '바위 뒤에서 무언가 길게 움직였다. 사람 허리보다 굵은 몸이 물가를 감았다.');
  await say('me', '백 년 동안 이걸 지킨 분이 계셨네요. 값은 안 받는다더니.');
  await ctx.duel({ foes: ['python'], arena: 'moon', bgm: 'boss', title: '벼랑 구렁이', tip: '독에 물리면 조금씩 체력이 줍니다. 붉은 예고는 경공으로 피하세요.' });
  await narr('설삼을 씹었다. 쓰고, 뒤이어 차갑고, 그다음은 불이었다.\n사흘 밤낮을 좌선한 뒤에야 눈을 떴다.\n동굴 안의 물방울 소리가 하나하나 들렸다.');
  S().inn += 4; S().str += 2; S().agi += 2; S().pts += 3; S().tp = (S().tp || 0) + 2; Sound.sfx('ok3');
  toast('내공 +4, 근력 +2, 민첩 +2 · 능력치 3점, 수련 점수 2점', 4);
  if (!S().weapons.includes('moon_blade_old')) { S().weapons.push('moon_blade_old'); await say(null, '유골 무릎의 검을 들자 녹이 떨어져 나갔다. 호법 강유의 검을 얻었다.'); }
  await say('me', '죄송합니다. 잘 쓰겠습니다. 그리고 바닥은 제가 닦아 놓을게요.');
  await say(null, '폭포 뒤로 빛이 보였다. 물길을 따라 나가니 매화나무 숲이었다.');
  await fadeTo(1); G.field.load('hwasan', 22, 11.5, 2); await fadeTo(0);
  await say('yun', '…살아 있네요.');
  await say('me', '네.');
  await say('yun', '나흘을 찾아다녔어요. 장부에 적을 것도 없어서 그냥 찾아다녔어요.');
  const c = await choice('윤설의 소매가 젖어 있다.', ['미안하다고 말한다', '벼랑 밑에 비급이 있었다고 자랑한다']);
  if (c === 0) { await say('me', '미안해요. 걱정시켜서.'); await say('yun', '…팔 내밀어요.'); ctx.love('yun'); } else await say('yun', '네. 좋겠네요. 팔 내밀어요.');
  await say('clan_hwasan', '살아 있었어? 나 때문은 아니야. 그래도 미안은 하네. 구화성에서 보자, 쟁반.');
  await say('me', '이제 대회까지 얼마나 남았죠?');
  await say('yun', '한 달이요. 가요. 이번엔 저 앞에서 걸어요.');
  set('c3a'); await toGuhwa();
}

Story.providers.push(function content6(id) {
  const n = [], sp = [];
  if (id === 'cloudmt' && at('t1')) sp.push({ x: 21, y: 34, w: 4, h: 2, hint: '뱃길 안내', act: toShaolin });
  if (id === 'shaolin') {
    if (at('t2')) n.push({ id: 'jigaek', spr: 'Monk', x: 19.5, y: 23, dir: 0, mark: () => at('t2'), talk: jigaek });
    if (at('t4')) n.push({ id: 'luohan', spr: 'Monk', x: 30, y: 15.4, dir: 2, mark: () => at('t4'), talk: luohanHall });
  }
  if (id === 'sutra' && at('t3')) [[3, 4], [13, 9], [8, 10]].forEach(([x, y], i) => { if (!F()['mop' + i]) n.push({ id: 'mop' + i, stamp: 'pot', spr: '', x, y, mark: () => true, hint: `${mops[i][0]} 닦기`, talk: () => mop(i) }); });
  if (id === 'cliffcave' && at('t5')) { if (!F().bones) n.push({ id: 'bones', stamp: 'tablet', spr: '', x: 8, y: 4.4, mark: () => true, hint: '살펴보기', talk: bones }); else n.push({ id: 'ginseng', stamp: 'flower1', spr: '', x: 11, y: 8, mark: () => true, hint: '살펴보기', talk: ginseng }); }
  return { npcs: n, spots: sp, trigs: [], roam: [] };
});
