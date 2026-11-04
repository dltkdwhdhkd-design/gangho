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
  await say('yun', '소림이면 숭산이죠? 저도 갈래요. 장경각에 의서가 많다고 들었어요.');
  await say('me', '약방은 어떡합니까.');
  await say('yun', '아버지가 계시잖아요. 그리고 혼자 보냈다가 또 어디서 물려 올 거잖아요.');
  await narr('제3부 · 강호 유람\n\n창운산을 내려와 뱃길과 산길로 보름을 갔다. 숭산에 가까워지자 절보다 종소리가 먼저 들렸다.');
  set('t2'); ctx.goal('소림사 산문 앞의 지객승에게 서찰 전하기');
  await ctx.warp('shaolin', 19.5, 26, 1);
}
async function jigaek() {
  await say('jigaek', '창운문 문주님의 서찰이군요. 먼 길 오셨습니다.');
  await say('me', '십칠 년 전 일을 아는 스님을 뵙고 싶습니다.');
  await say('jigaek', '그건 쉽지 않습니다. 그리고 소림에는 법이 있습니다. 외부 손님은 사흘을 먼저 일해야 합니다.');
  await say('me', '무슨 일입니까.');
  await say('jigaek', '장경각 청소입니다. 스님들이 수련하느라 손이 모자라서요.');
  await say('me', '바닥 말입니까.');
  await say('yun', '왜 웃어요?');
  await say('me', '안 웃었습니다. 그건 제가 잘합니다.');
  set('t3'); ctx.goal('장경각(왼쪽 건물) 바닥을 세 군데 닦기');
}
const mops = [
  ['서가 앞', '먼지가 손가락 두 마디는 쌓였다. 오십 년은 아무도 안 닦은 것 같다.'],
  ['창가', '허리를 세우고 왼발로 민다. 이제는 몸이 알아서 움직인다.'],
  ['문턱', '걸레를 짤 때마다 구정물이 나온다.'],
];
async function mop(i) {
  await say(null, mops[i][1]); F()['mop' + i] = true; Sound.sfx('select');
  if (F().mop0 && F().mop1 && F().mop2) await sweeper();
}
async function sweeper() {
  await say('sodi', '왼발로 미는구나.');
  await say('me', '언제부터 계셨습니까.');
  await say('sodi', '네가 들어오기 전부터 있었다. 나는 여기서 쉰 해째 비질을 하는 늙은이다.');
  await say('sodi', '그 걸레질은 누구한테 배웠느냐.');
  await say('me', '방값 안 내는 어르신한테 배웠습니다.');
  await say('sodi', '허허. 오십 년 전에 그 걸음을 한 번 본 적이 있다. 달 밝은 밤에 어떤 여인이 이 바닥을 그렇게 걷더구나.');
  await say('sodi', '칠식은 몇 장이나 모았느냐.');
  await say('me', '그걸 어떻게 아십니까.');
  await say('sodi', '바닥만 쉰 해를 닦으면 발소리로 다 안다. 어디 덤벼 봐라. 내 빗자루를 건드리면 하나 가르쳐 주마.');
  await ctx.duel({ foes: ['sodi'], arena: 'room', bgm: 'quiet', title: '비질하는 늙은이', survive: 24, expMul: 0, tip: '스님은 쓰러뜨릴 수 없습니다. 24초를 버티며 움직임을 익히세요.' });
  await say('sodi', '끝까지 서 있었구나. 그거면 됐다.');
  await say('sodi', '손 내밀어 봐라.');
  await narr('마른 손가락이 손목을 짚자 뜨거운 기운이 단전에서 등을 타고 올라갔다가 내려왔다. 막혀 있던 혈도가 뚫리는 느낌이었다.');
  S().inn += 3; S().con += 2; if (!S().hearts.includes('sesu')) S().hearts.push('sesu');
  Sound.sfx('power2'); toast('내공 +3, 근골 +2 · 심법 세수경 잔결을 익혔다', 3.5);
  await say('sodi', '세수경의 앞머리다. 소림에서도 아는 사람이 드물지.');
  await say('me', '왜 저한테 이런 걸 주십니까.');
  await say('sodi', '쉰 해 만에 장경각 바닥을 닦아 준 사람이라서.');
  await say('sodi', '그리고 네가 모으는 종이 말이다. 일식 앞에 한 장이 더 있었을 게다.');
  await say('me', '일곱 장이라고 들었습니다.');
  await say('sodi', '늙은이 말이니 흘려들어도 된다. 어서 나가 봐라. 나한당에서 너를 벼르고 있다.');
  ctx.note('장경각의 늙은 스님: 월하칠식의 앞에 한 장이 더 있었을 것이다.');
  set('t4'); ctx.goal('나한당(오른쪽 건물) 앞의 수좌 만나기');
}
async function luohanHall() {
  await say('luohan', '장경각을 청소했다는 객이 그대인가. 사흘 일을 반나절에 끝냈다지.');
  await say('me', '바닥 닦는 일은 익숙합니다.');
  await say('luohan', '소림을 그냥 나가는 객은 없소. 나한진을 통과하면 십칠 년 전 일을 아시는 분을 뵙게 해 주겠소.');
  await ctx.duel({ foes: ['luohan', 'luohan', 'luohan', 'luohan'], arena: 'court', title: '십팔나한진 · 첫 진', bgm: 'fight', tip: '둘러싸이기 전에 경공으로 빠져나오세요. 회전 공격 초식이 있다면 지금 씁니다.' });
  await say('luohan', '둘러싸이지 않는군. 그 걸음 덕인가. 다음 진으로 가시오.');
  await ctx.duel({ foes: ['luohan', 'luohan', 'luohan_chief'], arena: 'court', title: '십팔나한진 · 끝 진', bgm: 'boss', yieldAt: .25 });
  await say('clan_shaolin', '그만. 아미타불. 수좌는 물러서시오.');
  await say('me', '혜각 대사님이십니까.');
  await say('clan_shaolin', '그렇소. 시주가 무엇을 물으러 왔는지 아오. 십칠 년 전 월하곡에는 소림의 깃발도 있었소. 노납이 직접 들고 갔소.');
  await say('me', '왜 가셨습니까.');
  await say('clan_shaolin', '맹약이 있었고, 마공을 익힌 문파라고 들었기 때문이오. 그런데 도착해 보니 골짜기는 이미 불타고 있었소. 칼을 뽑을 일도 없었지.');
  await say('clan_shaolin', '누가 불을 질렀는지는 노납도 모르오. 그 뒤로 십칠 년을 염불만 했소.');
  await say('me', '철우라는 스님을 아십니까.');
  await say('jigaek', '그 이름은 어디서 들으셨습니까. 그자가 부순 산문을 저희가 아직도 고치고 있습니다.');
  ctx.note('혜각 대사: 소림이 도착했을 때 월하곡은 이미 불타고 있었다.');
  await narr('소림을 떠나 서쪽으로 갔다. 화산에 매화가 피었다는 소문이 있었고, 윤설이 그 산에서만 나는 약초를 찾았다.');
  await fadeTo(1); G.field.load('hwasan', 14, 11.5, 3); await fadeTo(0);
  await say('clan_hwasan', '비켜! 이 절벽길은 화산 땅이야!');
  await say('clan_jongnam', '언제부터? 삼백 년 전 지도에는 종남 땅으로 돼 있소.');
  await say('me', '약초만 캐고 가겠습니다.');
  await say('clan_jongnam', '넌 뭐냐? 화산 쪽 사람이냐?');
  await say('clan_hwasan', '우리가 저런 애를 데리고 다니겠어?');
  await say('yun', '저 사람들 왜 저래요?');
  await ctx.duel({ foes: ['jongnam_d', 'jongnam_d', 'jongnam_d'], arena: 'forest', title: '절벽길 시비', bgm: 'fight', tip: '좁은 싸움입니다. 끝나면 벼랑을 조심하세요.' });
  await say('me', '끝났습니까. 이제 약초만…');
  await say(null, '그때 발밑 바위가 부서지면서 몸이 뒤로 기울었다.');
  await say('yun', '{나} 씨!');
  await say('me', '아—');
  await fadeTo(1); await narr('얼마나 떨어졌는지 모르겠다. 나뭇가지에 몇 번 부딪히고 나서 차가운 물에 빠졌다.');
  set('t5'); ctx.goal('동굴을 살펴보고 나갈 길 찾기');
  G.field.load('cliffcave', 7.5, 9, 1); await fadeTo(0);
  await say('me', '살았네.');
  await say('me', '벼랑 밑에 동굴이 있네. 이야기책에서나 나오는 건 줄 알았는데.');
}
async function bones() {
  await say(null, '돌비석 앞에 유골 한 구가 앉아 있다. 무릎 위에 낡은 검이 놓여 있고, 벽에 칼끝으로 새긴 글이 있다.');
  await say(null, '“나는 월하문 제십일대 호법 강유다. 이 동굴에서 생을 마친다. 뒤에 올 아이에게 남긴다.”');
  await say(null, '“칠식을 다 모아도 그것이 끝은 아니다. 서문을 찢지 마라. 맨 앞 장은 절대 찢지 마라.”');
  await say(null, '“동굴 물가의 설삼은 내가 심은 것이다. 지금쯤 먹을 만할 것이니 가져가라.”');
  await say('me', '설삼?');
  ctx.note('벼랑 동굴의 유언: 칠식은 끝이 아니다. 서문을 찢지 마라.');
  F().bones = true; ctx.goal('물가의 설삼을 찾기');
}
async function ginseng() {
  await say('me', '이게 설삼인가.');
  await say(null, '바위 뒤에서 무언가 길게 움직였다. 사람 허리보다 굵은 몸이 물가를 감았다.');
  await say('me', '뱀이다. 이게 여태 지키고 있었나.');
  await ctx.duel({ foes: ['python'], arena: 'moon', bgm: 'boss', title: '벼랑 구렁이', tip: '독에 물리면 조금씩 체력이 줍니다. 붉은 예고는 경공으로 피하세요.' });
  await narr('설삼을 씹자 처음엔 쓰고 차갑더니 곧 뱃속이 불타는 것 같았다. 사흘 밤낮을 좌선하고 나서야 눈을 뜰 수 있었다.');
  S().inn += 4; S().str += 2; S().agi += 2; S().pts += 3; S().tp = (S().tp || 0) + 2; Sound.sfx('ok3');
  toast('내공 +4, 근력 +2, 민첩 +2 · 능력치 3점, 수련 점수 2점', 4);
  if (!S().weapons.includes('moon_blade_old')) { S().weapons.push('moon_blade_old'); await say(null, '유골 무릎의 검을 들자 녹이 떨어져 나갔다. 호법 강유의 검을 얻었다.'); }
  await say('me', '죄송합니다. 잘 쓰겠습니다.');
  await say(null, '폭포 뒤로 빛이 보였다. 물길을 따라 나가니 매화나무 숲이었다.');
  await fadeTo(1); G.field.load('hwasan', 22, 11.5, 2); await fadeTo(0);
  await say('yun', '살아 있었네요.');
  await say('me', '예.');
  await say('yun', '나흘을 찾아다녔어요. 사람들은 죽었을 거라고 하는데, 시체라도 찾아야 하잖아요.');
  const c = await choice('윤설의 소매가 젖어 있다.', ['미안하다고 한다', '벼랑 밑에서 비급을 찾았다고 말한다']);
  if (c === 0) { await say('me', '죄송합니다. 걱정을 끼쳤습니다.'); await say('yun', '됐어요. 팔 줘 봐요.'); ctx.love('yun'); } else await say('yun', '지금 그 얘기가 나와요? 팔 줘 봐요.');
  await say('clan_hwasan', '살아 있었어? 내 잘못은 아니지만 미안하긴 하네. 구화성에서 보자.');
  await say('me', '대회까지 얼마나 남았습니까.');
  await say('yun', '한 달이요. 가요. 이번엔 제가 앞에서 걸을게요.');
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
