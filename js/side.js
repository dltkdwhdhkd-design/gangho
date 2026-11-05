// 곁가지 이야기: 어느 길로 가든 만날 수 있고, 뒤에서 돌아온다
import { G, Sound, toast, josa } from './core.js';
import { Story, ctx, say, narr, choice } from './ctx.js';
import { WHO } from './dialog.js';
import { FOES } from './foes.js';
import { ACCS } from './items.js';
import { at, after } from './story1.js';

const S = () => G.S, F = () => G.S.flags;
const keep = id => { const s = S(); if (!(s.accs = s.accs || []).includes(id)) s.accs.push(id); Sound.sfx('bonus'); toast(`${josa(ACCS[id].name, '을/를')} 받았다`, 3); };
Object.assign(WHO, { ohbok: { name: '오복', face: 'Villager' }, oldmom: { name: '양씨 할머니', face: 'OldWoman' }, oldsword: { name: '늙은 검객', face: 'OldMan3' }, gwakchung: { name: '곽충', face: 'Caveman' }, sosu: { name: '팽소소', face: 'Paeng' }, deung: { name: '등표', face: 'Eskimo' } });
Object.assign(ACCS, { a_spoon: { name: '깎다 만 나무 숟가락', desc: '체력 +6%', fx: { hp: 6 } }, a_tassel: { name: '늙은 검객의 검수', desc: '치명타 +5%', fx: { crit: 5 } } });
Object.assign(FOES, {
  oldsword: { name: '늙은 검객', spr: 'chars/OldMan3', hp: 1500, atk: 26, def: 8, spd: 70, exp: 240, silver: 0, pause: .9, moves: ['double', 'cloud_flash', 'quick', 'swallow_qi'], wpn: 'Sword', guard: .7, boss: 1, poise: 260 },
  thug_boss: { name: '왈패 두목', spr: 'chars/Caveman', hp: 520, atk: 20, def: 6, spd: 54, exp: 70, silver: 40, pause: 1.1, moves: ['heavy', 'slash', 'lunge'], wpn: 'BigSword', guard: .3 },
});

async function fakeHero() {
  await narr('저잣거리 국숫집 앞에 사람들이 몰려 있었다. 웬 사내가 평상에 한 발을 올려놓고 떠들고 있었다.');
  await say('ohbok', '내가 바로 {호} {나}다! 창운문 검각주를 한칼에 베고 비무대를 쓸어 버린 그 {호} {나}란 말이다!');
  await narr('나보다 머리 하나는 크고 배가 나온 사람이었다. 국숫집 주인이 굽실거리며 고명을 더 얹어 주고 있었다.');
  await say('me', '저기요. 검각주랑 싸울 때 어디가 제일 아팠어요?');
  await say('ohbok', '아프긴! 내 몸에는 칼이 안 들어간다!');
  await say('me', '왼쪽 어깨 좀 볼게요. 거기 꿰맨 자국이 있어야 하는데요.');
  await narr('사내의 얼굴이 하얘졌다. 그는 국수 그릇을 든 채 나를 골목으로 끌고 갔다.');
  await say('ohbok', '아이고, 대협. 진짜시군요. 소리만 내지 말아 주십시오. 저는 소금 장수 오복이라고 합니다.');
  await say('me', '왜 이러고 다녀요?');
  await say('ohbok', '전쟁통에 나귀가 죽어서 소금을 못 나르게 됐습니다. 식구는 일곱인데요. 어느 날 대협 별호를 댔더니 국수가 공짜로 나오더군요. 사흘을 얻어먹고 나니 이제 못 그만두겠습니다.');
  const c = await choice('오복이 국수 그릇을 끌어안고 있다.', ['내 별호를 쓰지 말라고 한다', '사람만 안 다치게 하면 쓰라고 한다', '은자 쉰 냥을 쥐여 주며 나귀를 사라고 한다']);
  if (c === 0) { await say('ohbok', '예, 예. 오늘부로 저는 소금 장수입니다.'); F().ohbok = 1; }
  if (c === 1) { await say('me', '칼만 뽑지 마세요. 뽑으면 제가 찾아갈 거예요.'); await say('ohbok', '칼이 없습니다, 대협.'); F().ohbok = 2; }
  if (c === 2) {
    S().silver = Math.max(0, S().silver - 50);
    await say('ohbok', '대협, 이러시면 제가 더 못 그만둡니다. 진짜 대협 같잖습니까.');
    await say('me', '그만두라고 준 건데요.');
    F().ohbok = 2; ctx.rep('jeong', 1);
  }
}
async function mother47() {
  await narr('구화성 북쪽 우물가에 노파 하나가 앉아 있었다. 칼 찬 사람이나 군복 입은 사람만 지나가면 붙잡고 똑같은 걸 물었다.');
  await say('oldmom', '젊은이, 군에 있었수? 견대라는 데를 아우?');
  await say('me', '견대는 왜 찾으세요?');
  await say('oldmom', '우리 대복이가 거기로 끌려갔다우. 아홉 살에. 왼손 새끼손가락이 없는 앤데, 작두에 그랬어.');
  await narr('걸음이 멈췄다. 왼손 새끼손가락이 없는 놈은 하나밖에 몰랐다.');
  await say('me', '사십칠 번이요. 제 옆자리였어요.');
  await narr('노파가 내 손목을 잡았다. 손에 힘이 없을 줄 알았는데 아팠다.');
  await say('oldmom', '사십칠 번이 뭐유. 대복이야, 우리 대복이.');
  await say('me', '네. 대복이요. 번호로만 불렀거든요. 밤에 서로 이름을 말해 뒀어요. 까먹으면 안 된다고요.');
  await say('oldmom', '어떻게 됐수? 편지 한 장이 없었어. 열네 해야.');
  const c = await choice('노파가 손을 놓지 않는다.', ['마지막 임무를 사실대로 말한다', '칼을 맞고 바로 갔다고 말한다']);
  if (c === 0) {
    await say('me', '위에서 빈 골짜기로 보냈어요. 처음부터 저희를 버릴 생각이었던 거고요. 대복이는 화살을 맞고 사흘을 버텼어요. 제가 업고 가다가 내려놨어요.');
    await narr('노파는 한참 말이 없었다.');
    await say('oldmom', '내려놓은 데가 어디유.');
    await say('me', '북쪽 변경 마른 골짜기요. 돌을 쌓아 뒀어요.');
    await say('oldmom', '돌을 쌓아 줬어?');
    await say('me', '네.');
    F().mom47 = 1;
  } else {
    await say('me', '칼을 맞고 바로 갔어요. 아픈 줄도 몰랐을 거예요.');
    await say('oldmom', '그랬수. 다행이네. 다행이야.');
    F().mom47 = 2;
  }
  await narr('노파는 내 손을 놓고 보따리를 풀었다. 깎다 만 나무 숟가락이 나왔다.');
  await say('oldmom', '돌아오면 주려고 깎던 건데 다 못 깎았수. 자네가 쓰우.');
  keep('a_spoon');
}
async function lastDuel() {
  await narr('구파 회관 담장 밑에 노인 하나가 칼을 무릎에 올려놓고 앉아 있었다. 사흘째 저러고 있다고 문지기가 말했다.');
  await say('oldsword', '자네가 비무대에서 소문난 아이인가. 한 판만 해 주게.');
  await say('me', '어르신, 숨소리가 안 좋으신데요.');
  await say('oldsword', '폐가 다 녹았다네. 의원 말로는 이번 겨울을 못 넘긴다는군. 육십 년을 칼로 먹고살았는데 구들장에서 가기는 싫어서 말이야.');
  await say('oldsword', '제대로만 쳐 주게. 봐주면 귀신이 되어서 찾아가겠네.');
  const c = await choice('노인이 지팡이 삼아 칼을 짚고 일어선다.', ['전력으로 겨룬다', '적당히 맞춰 준다']);
  await ctx.duel({ foes: ['oldsword'], arena: 'court', bgm: 'boss', title: '늙은 검객', optional: true, noLoot: true });
  if (c === 0) {
    await narr('세 번 더 부딪치자 노인의 칼이 땅에 떨어졌다. 노인은 떨어진 칼을 내려다보며 웃다가 피를 뱉었다.');
    await say('oldsword', '좋아. 아주 좋았어. 그 걸음은 어디서 배웠나.');
    await say('me', '걸레질이요.');
    await say('oldsword', '허허, 나는 육십 년을 헛살았구먼. 이건 자네가 가져가게. 칼은 나랑 같이 묻어야 하니 줄 게 이것뿐일세.');
    keep('a_tassel'); F().old_full = true;
  } else {
    await say('oldsword', '봐줬구먼.');
    await say('me', '아니에요.');
    await say('oldsword', '거짓말도 못 하는 놈이 칼은 곧잘 속이네. 됐네. 고맙다고 해 두지.');
  }
  await narr('한 달쯤 뒤 문지기가 전해 주었다. 노인은 그 담장 밑에서 칼을 안고 앉은 채로 갔다고 했다.');
  F().old_done = true;
}
async function kangAsk() {
  await say('smith', '잠깐 앉아 봐라. 구화성 드나든다며. 부탁이 있다.');
  await say('me', '무슨 일인데요?');
  await say('smith', '십오 년 전에 내가 벼린 칼이 구화성 왈패 두목 손에 있다더라. 손잡이에 강(姜) 자를 새긴 칼이다. 그 칼에 벌써 셋이 죽었어. 찾아와라. 내가 녹여야겠다.');
  await say('me', '값 쳐 주고 사 오면 안 돼요?');
  await say('smith', '그놈이 팔 놈이면 내가 왜 너한테 말하겠냐.');
  F().kang = 1; ctx.note('강씨 부탁: 구화성 왈패 두목의 칼을 찾아오기. 손잡이에 강(姜) 자가 있다.');
}
async function kangThug() {
  await say('rowdy', '뭘 봐? 형님 칼이 그렇게 탐나냐?');
  await say('me', '그 칼 주인이 찾아요.');
  await ctx.duel({ foes: ['thug_boss', 'rowdy2', 'rowdy2'], arena: 'village', bgm: 'fight', title: '왈패 두목' });
  await narr('두목이 놓친 칼을 주웠다. 손잡이에 강 자가 닳아 있었다. 날은 잘 서 있었다. 강씨 솜씨가 맞았다.');
  F().kang = 2;
}
async function kangEnd() {
  await narr('강씨는 칼을 받아 들더니 아무 말 없이 화덕에 밀어 넣었다. 손잡이가 먼저 타서 없어지고 쇠가 천천히 붉어졌다.');
  await say('smith', '전쟁 때 군에 칼을 댔다. 한 자루에 은자 두 냥. 그 돈으로 이 대장간을 샀지.');
  await say('smith', '그 칼들이 어디 가서 뭘 했는지 나는 안 물어봤다. 너는 알겠구나.');
  await say('me', '견대에 오는 칼은 다 이가 나가 있었어요. 아저씨 칼은 아닐 거예요.');
  await say('smith', '위로하는 거냐?');
  await say('me', '칼 얘기예요.');
  await say('smith', '건방진 놈. 칼 내놔 봐라. 남은 쇠로 손봐 주마.');
  const s = S(); if (s.weapon) { s.wplus = s.wplus || {}; s.wplus[s.weapon] = (s.wplus[s.weapon] || 0) + 1; toast('강씨가 칼을 손봐 주었다'); }
  F().kang = 3;
}
async function birth() {
  await say('doc', '자네, 오늘 밤 손 좀 비었나. 순이네가 오늘내일한다네. 둘째야.');
  await say('me', '제가 뭘 해요?');
  await say('doc', '물 끓이고 불 보고, 내가 소리 지르면 뛰어오면 되네. 윤설이는 다른 환자한테 묶여 있고.');
  await narr('약 상자를 지고 밤길을 걸어 나루 아래 순이네 집으로 갔다. 순이 아버지가 마당을 빙빙 돌고 있었다.');
  await say('husband', '의원님! 아까부터 소리가 안 나요.');
  await say('doc', '소리가 안 나면 힘쓰는 중이야. 자네는 앉아 있게. 돌아다니니까 내가 어지럽네.');
  await narr('나는 부뚜막 앞에서 불을 봤다. 군막에서 사람 죽는 소리는 많이 들었는데 이런 소리는 들어 본 적이 없었다. 새벽이 다 되어서야 안방에서 아기 우는 소리가 났다.');
  await say('doc', '딸이네. 내 손으로 받은 게 이걸로 삼백열두 명이야.');
  await say('me', '그걸 다 세세요?');
  await say('doc', '장부에 적지. 우리 집안이 적는 건 좋아하네. 보낸 사람은 안 적어. 그걸 세기 시작하면 다음 날 왕진을 못 가거든.');
  await say('husband', '이보게, 이름 좀 지어 주게. 내가 배 밑에서 살아 나온 게 자네 덕 아닌가.');
  const name = (await ctx.ask('아기 이름', '순이 동생의 이름을 적으세요.', '달이') || '달이').trim() || '달이';
  F().baby = name;
  await say('husband', `${name}. 좋네. 이분이 쟁반 아저씨다, ${name}.`);
  await narr('돌아오는 길에 윤 의원은 약 상자를 자기가 지겠다고 우기다가 스무 걸음 만에 도로 내게 넘겼다.');
  await say('doc', '윤설이한테는 내가 지고 왔다고 하게.');
  ctx.note(`순이네 둘째가 태어났다. 이름은 ${name}.`);
}
const kangWin = () => after('c3b') && !after('r2');
const hook = k => {
  if (k === 'doc' && F().burned && !F().baby && after('c2a') && !after('r2') && !F().plague) return birth;
  if (k === 'smith' && kangWin()) { if (!F().kang) return kangAsk; if (F().kang === 2) return kangEnd; }
  return null;
};
const job = o => ({ dir: 0, mark: () => true, ...o });
Story.providers.push(function sidep(id) {
  const n = [], open = after('c3b') && !after('w1');
  if (id === 'guhwa') {
    if ((F().round || 0) >= 1 && !F().ohbok && !after('c4a')) n.push(job({ id: 'ohbok', spr: 'Villager', x: 29, y: 21, hint: '소란 구경하기', talk: fakeHero }));
    if (open && !F().mom47) n.push(job({ id: 'oldmom', spr: 'OldWoman', x: 16, y: 20, hint: '노파에게 말 걸기', talk: mother47 }));
    if (F().kang === 1 && !after('r2')) n.push(job({ id: 'thug', spr: 'Caveman', x: 36, y: 24, hint: '왈패 두목', talk: kangThug }));
  }
  if (id === 'ninehall' && open && !F().old_done) n.push(job({ id: 'oldsword', spr: 'OldMan3', x: 6, y: 12, hint: '늙은 검객', talk: lastDuel }));
  return { npcs: n, spots: [], trigs: [], roam: [] };
});
G.side = {
  hook,
  async siege() {
    if (F().kang === 3) await say('smith', '이번 칼은 어디로 가는지 내 눈으로 본다.');
    if (F().go_bond && !F().go_dead) {
      await say('go', '창운문 제자 마흔 명을 데려왔다. 내가 가르친 대로면 어깨부터 칠 거다.');
      await say('me', '이번엔 목 치라고 하세요.');
      await say('go', '그래. 오늘은 그렇게 말해 두마.');
      await say('jangpal', '형씨! 나 내문 시험 붙었어유. 문주님이 입문식은 살아서 하자고 하셨어유.');
    }
    if (F().ohbok === 2) {
      await narr('그때 강둑 쪽에서 누가 목청껏 소리를 질렀다. 배 나온 사내가 소금 수레를 끌고 달려오고 있었다.');
      await say('ohbok', '내가 {호} {나}다! 천마의 졸개들아, 나한테 덤벼라!');
      await say('gwak', '저건 또 뭐야?');
      await say('me', '제 이름 쓰는 사람이에요.');
      await narr('마장 몇이 정말로 그쪽으로 몰려갔다. 오복은 소금을 뿌리며 둑을 따라 내달렸다.');
    }
  },
  async ending() {
    if (F().baby && !F().plague) await narr(`순이네 둘째 ${josa(F().baby, '은/는')} 걸음마를 뗐다. 왼발부터 내디딘다고 순이 아버지가 객잔에 와서 자랑을 했다.`);
    if (F().ohbok === 2) await narr('오복은 나귀를 샀다. 요즘은 소금을 팔면서 {호} {나}의 사촌이라고 하고 다닌다고 한다.');
    if (F().mom47) await narr('봄에 북쪽 변경에 다녀왔다. 마른 골짜기 돌무더기는 그대로 있었다. 양씨 할머니가 준 숟가락으로 국수를 한 그릇 먹고 왔다.');
    if (F().jang_bye) await narr('창운산에서 편지가 왔다. 글씨가 삐뚤빼뚤했다. 소를 샀는데 이름을 형씨라고 지었다고 적혀 있었다.');
  },
};
