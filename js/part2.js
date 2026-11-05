// 제2부 창운문의 나날: 외문 일과, 장팔, 위문상의 차, 고진
import { G } from './core.js';
import { Story, ctx, say, narr, choice } from './ctx.js';
import { WHO } from './dialog.js';
import { FOES } from './foes.js';
import { set, at } from './story1.js';

const S = () => G.S, F = () => G.S.flags;
Object.assign(WHO, { jangpal: { name: '장팔', face: 'GreenNinja', art: 'disc' }, naemun: { name: '내문 제자', face: 'GreenNinja' } });
FOES.go_ally = { ...FOES.senior_go, name: '고진', hp: 1400, atk: 30, boss: 0, poise: 0 };

const chores = () => F().ch_well && F().ch_dummy && F().ch_kitchen;
const left = () => [!F().ch_well && '우물가 물 긷기', !F().ch_dummy && '연무장 목인 치기', !F().ch_kitchen && '식당 밥 당번'].filter(Boolean).join(', ');
async function done() {
  if (!chores()) { ctx.goal(`외문 일과: ${left()}`); return; }
  await narr('그렇게 이레가 갔다. 손바닥에 잡힌 굳은살이 슬슬 칼자루 모양을 닮아 갔다.');
  await narr('이레째 저녁에 검각주가 나를 불렀다. 외문 제자를 검각주가 직접 부르는 일은 없다고 장팔이 몇 번이나 말했다.');
  await say('wi', '앉으시오. 객잔에서 일했다지. 고진이 그러더군, 목부터 치는 버릇이 있다고.');
  await say('me', '고치는 중입니다.');
  await say('wi', '그 걸음은 어디서 배웠소?');
  await say('me', '걸레질하다 보니 그렇게 됐습니다.');
  await say('wi', '걸레질이라. 재미있는 말을 하는구려.');
  await narr('위문상이 찻잔을 밀어 주었다. 손톱이 유난히 깨끗한 사람이었다.');
  const c = await choice('찻잔에서 김이 오른다.', ['마신다', '뜨거워서 못 마신다고 둘러댄다']);
  if (c === 0) { F().wi_tea = true; await narr('쓴맛 뒤로 매화 향이 조금 남았다. 위문상은 내가 잔을 내려놓을 때까지 내 손을 보고 있었다.'); await say('wi', '잘 마시는구려. 가 보시오.'); }
  else { await say('me', '혀가 약해서요. 식으면 마시겠습니다.'); await narr('위문상은 내 잔을 제 앞으로 끌어다 놓더니 천천히 비웠다.'); await say('wi', '점소이가 차를 식혀 마신다니, 귀한 손님이 오셨구려. 가 보시오.'); }
  set('c2c'); ctx.goal('본전에서 윤설과 함께 문주를 뵙기');
}
async function water() {
  await narr('물지게를 지고 우물과 주방 사이를 오갔다. 스무 번쯤 오가니 어깨가 벌겋게 부어올랐다. 장팔은 다섯 번 만에 주저앉았다.');
  await say('jangpal', '형씨는 어째 숨도 안 차유?');
  await say('me', '객잔에서 매일 했어요. 그 전에 있던 데서도 했고요.');
  await say('jangpal', '그 전에 어디 있었는디유?');
  const c = await choice('장팔이 물동이를 내려놓고 쳐다본다.', ['견대에 있었다고 말한다', '말을 돌린다']);
  if (c === 0) {
    F().jang_bond = true;
    await say('me', '군대요. 번호로 불리면서 맨 앞에 서는 부대였어요.');
    await say('jangpal', '밥은 줬어유?');
    await say('me', '하루 한 끼요.');
    await narr('장팔이 품에서 주먹밥 반쪽을 꺼내 내밀었다. 아침에 먹다 남긴 것 같았다.');
    await say('me', '지금은 세 끼 먹어요.');
    await say('jangpal', '그래도 드셔유.');
  } else await say('me', '여기저기요. 물이나 길어요.');
  await say('jangpal', '내문 사형들은 물 안 길어유. 어느 장원 아들이다, 누구 조카다, 그런 사람들이니께유. 우리는 삼 년을 길어야 내문 시험을 볼 수 있어유.');
  await say('me', '삼 년이요?');
  await say('jangpal', '고진 사형도 여기서 물 길었대유. 외문에서 대사형까지 올라간 사람은 그 양반뿐이래유. 그래서 우리한테 더 독해유.');
  F().ch_well = true; await done();
}
async function dummy() {
  await narr('연무장 구석에 나무 인형이 줄지어 서 있었다. 정해진 자리를 정해진 순서대로 치는 게 오늘 할 일이었다.');
  await say('go', '어깨, 손목, 무릎. 그 순서다. 시작해라.');
  await narr('나는 목을 쳤다. 나무가 깊게 패었다.');
  await say('go', '순서를 못 들었느냐?');
  await say('me', '들었어요.');
  await say('go', '그런데 왜 목을 치느냐.');
  await say('me', '손이 먼저 가요. 어깨를 치면 상대가 아직 움직이잖아요.');
  await say('go', '여기서는 사형제끼리 칼을 댄다. 너처럼 치면 사람이 죽어.');
  const c = await choice('고진이 목검을 다시 쥐여 준다.', ['시키는 대로 어깨부터 친다', '실전에서는 목이 맞다고 버틴다']);
  if (c === 0) { F().go_yard = true; await narr('저녁까지 어깨, 손목, 무릎만 쳤다. 사람을 안 죽이고 칼을 쓰는 게 이렇게 손에 안 붙을 줄은 몰랐다.'); await say('go', '내일도 해라.'); }
  else { await say('go', '실전이면 네 말이 맞겠지. 그런데 나는 사람을 가르치는 중이다. 오늘 밥 당번은 네가 두 번 해라.'); }
  F().ch_dummy = true; await done();
}
async function kitchen() {
  await narr('외문 식당은 동쪽 끝에 있었다. 솥은 큰데 쌀이 적었다. 내문 상부터 차리고 남는 걸 외문이 먹는다고 했다.');
  await say('naemun', '야, 외문. 국이 식었다. 다시 떠 와.');
  await say('jangpal', '형씨, 그냥 떠다 줘유. 저 사형 작년에 외문 하나 물동이째 굴렸어유.');
  const c = await choice('내문 제자 열두 명이 상을 두드린다.', ['쟁반에 열두 그릇을 얹어 한 번에 나른다', '국을 그 머리에 부어 버린다', '말없이 다시 떠다 준다']);
  if (c === 0) {
    F().ch_tray = true;
    await narr('왼팔에 쟁반 둘, 오른팔에 쟁반 하나. 곽 아주머니한테 국자로 맞아 가며 익힌 대로 상 사이를 돌았다. 국물은 한 방울도 흐르지 않았고 열두 그릇이 동시에 내려앉았다.');
    await say('naemun', '너 진짜 점소이였구나.');
    await say('me', '식기 전에 드세요.');
    await say('jangpal', '형씨, 그거 나도 가르쳐 줘유. 나 그거 하면 장가갈 수 있을 것 같어유.');
  } else if (c === 1) {
    await say('naemun', '이 자식이! 뭐 하고 있어, 잡아!');
    await ctx.duel({ foes: ['disciple', 'disciple'], arena: 'room', title: '식당 싸움', bgm: 'fight', optional: true });
    await say('go', '누가 시작했느냐.');
    await say('me', '제가요.');
    await say('go', '국은 왜 부었느냐.');
    await say('me', '식었다고 해서 데워 드리려고요.');
    await say('go', '너희 둘 다 내일 물 백 동이다.');
    await narr('고진은 돌아서서 한참 어깨를 들썩였다. 기침이라고 했다.');
  } else { await say('naemun', '진작 그럴 것이지.'); await say('jangpal', '잘 참았어유. 나는 삼 년째 참는 중이어유.'); }
  F().ch_kitchen = true; await done();
}
export const after2 = {
  async clue() {
    await narr('불침번을 서던 장팔이 나를 불러 세웠다.');
    await say('jangpal', '문주님 깨셨다면서유? 다행이어유. 근디 형씨, 이상한 게 하나 있어유.');
    await say('me', '뭔데요?');
    await say('jangpal', '제가 본전 상을 나르는디유, 이레에 한 번은 검각에서 차를 따로 올려유. 찻잔도 검각주가 손수 들고 가고유. 뭣 하러 그리 번거롭게 하는지 모르겠더라구유.');
    await say('me', '이레에 한 번이요? 확실해요?');
    await say('jangpal', '당번표에 다 적혀 있어유. 고진 사형이 짜는 거니께 틀림없어유.');
    F().jang_clue = true; ctx.note('장팔: 이레마다 검각에서 문주께 차를 올린다. 고진이 짠 당번표에 적혀 있다.');
    ctx.goal('밤에 장서각 들어가기 (왼쪽 건물). 고진에게 당번표를 물어볼 수도 있다');
  },
  async told() {
    await say('me', '사형, 당번표 좀 볼게요.');
    await say('go', '그걸 왜 찾느냐.');
    await say('me', '문주님이 드신 건 칠일소혼산이에요. 이레에 한 번씩 먹이는 독이고요. 이레마다 검각주가 차를 올린다면서요.');
    await narr('고진은 말없이 당번표를 펴더니 손가락으로 날짜를 짚어 내려갔다. 손가락이 중간에 멈췄다.');
    await say('go', '검각주님은 나를 외문에서 꺼내 준 분이다. 내 칼도 그분이 주셨다.');
    await say('me', '알아요.');
    await say('go', '증거도 없이 할 말이 아니다. 가 봐라.');
    await narr('돌아서는데 고진이 당번표를 접어 품에 넣는 소리가 들렸다.');
    F().go_told = true;
  },
  async wiArrive(allies) {
    if (!F().go_told) return;
    await narr('본전 문이 열리고 고진이 들어왔다. 칼은 뽑혀 있었고 왼손에 당번표가 구겨져 있었다.');
    await say('go', '검각주님, 칼을 내려놓으십시오.');
    await say('wi', '고진아. 너를 외문에서 꺼내 준 게 누구냐.');
    await say('go', '압니다. 그래서 제가 왔습니다.');
    allies.push('go_ally');
  },
  async wiAfter() {
    await narr('해가 진 뒤 연무장에 나갔더니 고진이 목인 앞에 앉아 있었다.');
    await say('go', '검각주 방을 치웠다. 십칠 년 치 서신이 나오더구나. 내가 내문에 오른 해 것도 있었다. 외문에 쓸 만한 아이가 있으니 키워 두면 문주 곁에 세우기 좋겠다고 적혀 있었다.');
    await say('me', '사형은 몰랐잖아요.');
    await say('go', '몰랐지. 십이 년을 몰랐다.');
    const c = await choice('고진이 칼을 무릎에 올려놓고 들여다본다.', ['옆 목인 앞에 서서 칼을 든다', F().go_told ? '그 칼로 오늘 문주님을 지켰다고 말한다' : '문주님이 버틴 건 사형 덕이라고 말한다']);
    if (c === 0) await narr('나는 옆 목인 앞에 섰다. 어깨, 손목, 무릎. 얼마 뒤 고진도 일어나 칼을 들었다. 달이 기울 때까지 둘이서 나무만 쳤다.');
    else await say('go', '말주변도 없는 놈이 애쓰는구나.');
    await say('go', '내일 떠나느냐.');
    await say('me', '네.');
    await say('go', '나는 남는다. 누가 남아서 이 문파를 치워야지. 어디 가서 창운문 제자였다는 말은 하지 마라. 내가 부끄럽다.');
    await say('me', '네.');
    await say('go', '농담이다.');
    await narr('고진이 농담을 하는 건 그날 처음 들었다. 별로 웃기지는 않았다.');
    F().go_bond = true;
  },
  async bye() {
    await say('jangpal', '가는 거유? 아이고, 말도 없이.');
    await say('me', '말하려고 왔어요.');
    await say('jangpal', '이거 가져가유. 주먹밥이어유. 이번엔 먹던 거 아니어유.');
    if (F().ch_tray) await say('jangpal', '내문 사형들이 요즘은 국 식었단 소리를 안 해유. 형씨 덕이어유.');
    await say('jangpal', '내년에 내문 시험 붙으면 편지할게유. 글은 고진 사형이 가르쳐 준대유.');
    await say('me', '소는요?');
    await say('jangpal', '돈 모으는 중이어유.');
    S().potion += 2; F().jang_bye = true;
  },
};
const job = o => ({ dir: 0, mark: () => true, ...o });
Story.providers.push(function part2p(id) {
  const n = [];
  if (id === 'cloudmt') {
    if (at('c2b2')) {
      if (!F().ch_well) n.push(job({ id: 'ch_well', stamp: 'jar', spr: '', x: 25, y: 23, hint: '물 긷기', talk: water }));
      if (!F().ch_dummy) n.push(job({ id: 'ch_dummy', stamp: 'f_dummy', spr: '', x: 18, y: 23, hint: '목인 치기', talk: dummy }));
      if (!F().ch_kitchen) n.push(job({ id: 'ch_kitchen', stamp: 'pot', spr: '', x: 31, y: 21, hint: '밥 당번', talk: kitchen }));
    }
    if (at('c2b2', 'c2c', 'c2d', 'c2e')) n.push({ id: 'jangpal', spr: 'GreenNinja', x: 26, y: 18, dir: 2, talk: async () => { await say('jangpal', at('c2b2') ? '물동이 드는 법 좀 알려 줘유.' : '문주님 빨리 나으셔야 할 텐디유.'); } });
    if (at('c2f')) n.push({ id: 'jangpal', spr: 'GreenNinja', x: 26, y: 18, dir: 2, mark: () => !F().jang_clue, talk: async () => { if (!F().jang_clue) await after2.clue(); else await say('jangpal', '고진 사형한테 물어봐유. 저는 눈치 보여서 못 물어봐유.'); } });
    if (at('t1')) n.push({ id: 'jangpal', spr: 'GreenNinja', x: 25, y: 31, dir: 2, mark: () => !F().jang_bye, talk: async () => { if (!F().jang_bye) await after2.bye(); else await say('jangpal', '조심해서 가유.'); } });
  }
  return { npcs: n, spots: [], trigs: [], roam: [] };
});
