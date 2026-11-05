// 제2부 외문의 한 달: 소연하의 밤 비무, 장팔의 목검, 우물가 소동, 쌀수레, 문주와 장기, 월말 시험
import { G, Sound } from './core.js';
import { Story, ctx, say, narr, choice } from './ctx.js';
import { WHO } from './dialog.js';
import { FOES } from './foes.js';
import { set, at } from './story1.js';

const S = () => G.S, F = () => G.S.flags;
Object.assign(WHO, { wangchung: { name: '왕충', face: 'GreenNinja' }, seokdu: { name: '석두', face: 'Villager' }, gomom: { name: '두부 파는 노파', face: 'OldWoman' } });
FOES.jang_spar = { ...FOES.disciple, name: '장팔', hp: Math.round(FOES.disciple.hp * .7), atk: FOES.disciple.atk * .7, spd: 42 };
FOES.wang = { ...FOES.disciple, name: '왕충', hp: Math.round(FOES.disciple.hp * 1.9), atk: FOES.disciple.atk * 1.2, guard: .4 };
FOES.mask_low = { ...FOES.disciple, name: '복면 사내', spr: 'chars/DarkNinja', hp: Math.round(FOES.disciple.hp * 1.3), atk: FOES.disciple.atk * 1.1 };
const LIST = [['m_so', '밤 연무장'], ['m_jang', '장팔의 부탁'], ['m_well', '우물가 소동'], ['m_cart', '쌀수레 심부름'], ['m_lord', '문주']];
const left = () => LIST.filter(l => !F()[l[0]]).map(l => l[1]);
function next() { const L = left(); ctx.goal(L.length ? `외문의 한 달: ${L.join(', ')}` : '연무장에서 고진 사형에게 월말 시험 보기'); }
export const startMonth = async () => {
  await narr('이레면 끝나는 줄 알았던 일과는 끝나지 않았다. 장팔 말로는 외문의 하루는 삼 년을 간다고 했다.');
  set('c2b3'); next();
};
async function soNight() {
  await narr('밤에 물을 마시러 나왔더니 연무장에서 칼 소리가 났다. 소연하가 혼자 목인을 베고 있었다.');
  await say('so', '안 자? 외문은 묘시에 일어난다며.');
  await say('me', '목이 말라서요.');
  await say('so', '거짓말. 너 밤마다 걸음 연습하지. 어제도 봤어.');
  await say('so', '왼발로 밀고 오른발은 따라오게 두는 거. 누가 가르쳤는지는 안 물을게. 근데 네 걸음은 앞으로만 가더라.');
  await say('me', '앞으로 가야 칼이 닿잖아요.');
  await say('so', '그러다 죽어. 벽수궁에서는 물러서는 걸음을 먼저 배워. 해 봐. 나한테 안 맞으면 되는 거야.');
  await ctx.duel({ foes: ['so_rival'], arena: 'court', bgm: 'boss', title: '밤의 비무', yieldAt: .55, optional: true });
  await say('so', '봐, 두 걸음 물러서니까 내 칼이 보이지?');
  await say('me', '네. 조금요.');
  await say('so', '사부님 말씀이야. 강호에서 오래 사는 사람은 제일 잘 도망친 사람이라고.');
  await say('so', '그러고는 안 돌아오셨지만.');
  await narr('소연하는 칼을 칼집에 넣었다. 그쪽은 쳐다보지 않았다.');
  await say('so', '넌 왜 앞으로만 가? 뒤에 뭐가 있어?');
  const c = await choice('달이 목인 그림자를 길게 늘어뜨렸다.', ['돌아갈 데가 없었어요', '칼이 짧아서요']);
  if (c === 0) { await say('me', '돌아갈 데가 없었어요.'); await say('so', '이제 있잖아. 밥은 맛없어도.'); ctx.love('so'); }
  else { await say('me', '칼이 짧아서요.'); await say('so', '네 칼이 내 칼보다 길거든. 재미없는 놈.'); await narr('그래 놓고 소연하는 조금 웃었다.'); }
  F().m_so = true; next();
}
async function jangRope() {
  await say('jangpal', '형씨, 부탁이 있어유. 목검 안 놓치는 법 좀 알려 줘유.');
  await say('me', '왜 놓치는데요?');
  await say('jangpal', '사람 앞에 서면 손에 땀이 나유. 소 앞에서는 안 나는디.');
  await say('me', '소 없다면서요.');
  await say('jangpal', '남의 소유.');
  await narr('장팔의 목검 자루에 새끼줄을 감아 주었다. 곽 아주머니가 국자 자루에 감던 대로였다. 젖은 손으로 뜨거운 국을 뜨던 사람이라 그 매듭은 절대 안 미끄러졌다.');
  await say('me', '한번 쳐 봐요. 저는 막기만 할게요.');
  await say('jangpal', '진짜 쳐유?');
  await ctx.duel({ foes: ['jang_spar'], arena: 'court', title: '장팔의 목검', bgm: 'fight', yieldAt: .5, optional: true, noIntro: true });
  await say('jangpal', '안 놓쳤어유! 세 번 맞고도 안 놓쳤어유!');
  await say('me', '맞지는 말아야죠.');
  await say('jangpal', '그건 다음 시험 때 배울게유.');
  await narr('장팔은 그날 새끼줄 감은 목검을 안고 잤다고 한다. 같은 방 사람들이 코 고는 소리가 줄었다고 고마워했다. 왜 그런지는 아무도 몰랐다.');
  F().m_jang = true; next();
}
async function well() {
  await narr('우물가가 시끄러웠다. 외문 막내 석두가 쓰러져 있고 옆에 물동이가 깨져 있었다. 내문 복장을 한 사내가 신발에 튄 물을 털고 있었다.');
  await say('wangchung', '길을 막았으니 치운 것뿐이다. 외문이 어디 내문 앞을 가로지르느냐.');
  await say('jangpal', '형씨, 그냥 가유. 저 사람은 왕 장원 아들이어유. 우리 먹는 쌀이 그 집에서 들어와유.');
  const c = await choice('석두가 옆구리를 잡고 일어나지 못한다.', ['물동이 값을 내고 가라고 한다', '석두부터 업고 약방으로 간다']);
  if (c === 0) {
    await say('me', '물동이 값은 내고 가세요.');
    await say('wangchung', '뭐라고?');
    await say('me', '삼십 문이에요. 저 물동이는 제가 어제 고쳐 놓은 거라 값을 알아요.');
    await say('wangchung', '외문이 내문한테 돈을 받겠다고? 좋다. 비무대로 올라와라.');
    await narr('소문은 물보다 빨랐다. 저녁때 비무대 주위에 외문 제자들이 빼곡히 앉았다. 고진이 심판을 보러 나왔다.');
    await say('go', '목은 안 된다. 어깨, 손목, 무릎. 알겠느냐.');
    await say('me', '네.');
    const won = await ctx.duel({ foes: ['wang'], arena: 'ring', bgm: 'boss', title: '왕충', yieldAt: .3, optional: true, noIntro: true });
    if (won) { await narr('왕충의 목검이 비무대 밖으로 날아갔다. 어깨, 손목, 무릎 순서였다. 외문 쪽에서 함성이 나오려다 고진이 쳐다보자 쏙 들어갔다.'); await narr('왕충은 엽전 삼십 닢을 바닥에 던지고 내려갔다. 석두가 그걸 한 닢씩 주웠다. 내가 대신 주우려는 걸 석두가 말렸다.'); await say('seokdu', '제가 주울게요. 이건 제가 주워야 해요.'); }
    else await narr('졌다. 그래도 왕충은 그 뒤로 우물가를 돌아서 다녔다. 외문 제자들이 저녁마다 나를 보고 고개를 끄덕였다.');
    await say('go', '너희 둘 다 내일 물 백 동이다.');
    await say('me', '왕충 사형도요?');
    await say('go', '내가 언제 사람 봐 가며 벌을 주더냐.');
  } else {
    await narr('석두를 업고 약방으로 뛰었다. 업어 보니 생각보다 가벼웠다. 열아홉이라는데 밥을 제대로 못 먹은 등이었다.');
    await say('yun', '갈비뼈 하나 금 갔어요. 어쩌다 그랬어요?');
    await say('seokdu', '넘어졌어요.');
    await say('yun', '넘어져서 발자국 모양으로 멍이 드는 사람은 처음 보네요.');
    await say('yun', '이 산은 칼 가르치는 데라면서 왜 아픈 사람은 다 외문이에요?');
    await say('me', '내문은 안 다치거든요. 외문이 대신 맞으니까요.');
    await narr('윤설은 아무 말 없이 붕대를 감았다. 평소보다 세게 묶어서 석두가 한 번 소리를 질렀다.');
    ctx.love('yun');
  }
  F().m_well = true; next();
}
async function cart() {
  await say('go', '따라와라. 산 아래 장터에서 쌀을 실어 와야 한다.');
  await narr('구백 칸 계단을 내려갔다. 내려가는 건 올라오는 것보다 무릎이 더 아팠다. 장터 끄트머리에서 고진이 걸음을 늦췄다. 두부를 파는 노파 앞이었다.');
  await say('gomom', '밥은 먹고 다니냐.');
  await say('go', '먹습니다.');
  await say('gomom', '이 사람은 누구냐.');
  await say('go', '외문 제자입니다.');
  await say('gomom', '아이고, 그럼 이 애가 우리 아들 밑에 있는 거여? 총각, 얘가 이래 봬도 어릴 때는 두부 한 모를 못 들었어. 내문 들어갈 때 입은 옷은 내가 지었구먼.');
  await say('go', '어머니.');
  await say('gomom', '가져가. 식기 전에 먹어. 사형한테 혼나거든 나한테 일러.');
  await narr('두부 한 모를 받아 들었다. 고진은 내 쪽을 보지 않고 쌀수레 끈을 당겼다.');
  await say('go', '네가 들은 것은 잊어라.');
  await say('me', '두부요?');
  await say('go', '두부도 잊어라.');
  await narr('돌아오는 길, 산문까지 삼 리쯤 남은 곳에서 수레바퀴가 멈췄다. 길 한가운데 통나무가 놓여 있었다.');
  await say('go', '뒤로 붙어라.');
  await ctx.duel({ foes: ['mask_low', 'mask_low'], allies: ['go_ally'], arena: 'forest', title: '쌀수레', bgm: 'fight', optional: true, noIntro: true });
  await narr('달아나는 놈들 소매에서 작은 칼이 하나 떨어졌다. 고진이 주워 들고 칼자루를 오래 보았다. 산적의 칼치고는 너무 잘 갈려 있었다.');
  await say('go', '방금 왜 목을 안 쳤느냐. 칠 수 있었는데.');
  await say('me', '사형이 보고 계셔서요.');
  await say('go', '내가 안 보면 치겠구나.');
  await say('me', '아마도요.');
  await say('go', '이달 밥 당번은 면해 주마. 두부는 네가 먹어라.');
  await narr('식은 두부는 짭짤했다. 고진은 그날 저녁 혼자 산문까지 내려갔다가 늦게 올라왔다.');
  F().m_cart = true; next();
}
async function lordGame() {
  await narr('아침에 본전 앞을 쓸고 있는데 누가 비질을 보고 서 있었다. 얼굴이 흙빛인 중년 사내였다. 옷이 너무 수수해서 처음에는 집사인 줄 알았다.');
  await say('lord', '왼발로 미는 비질은 처음 보는구려.');
  await say('me', '버릇입니다.');
  await say('lord', '오래된 버릇이오. 앉으시오. 장기 둘 줄 아시오?');
  await narr('나중에야 문주라는 걸 알았다. 알았을 때는 이미 세 판을 진 뒤였다. 문주는 말을 옮길 때마다 손이 조금씩 떨렸다.');
  await say('lord', '강호에서는 문파를 세우는 일이 어렵다고들 하오. 나는 밥 먹이는 일이 제일 어렵습디다. 외문 제자 쉰 명이 한 달에 쌀을 얼마나 먹는지 아시오?');
  await say('me', '스물다섯 섬요.');
  await say('lord', '허. 어찌 아시오?');
  await say('me', '밥 당번을 했습니다.');
  await say('lord', '장문인도 모르는 사람이 많소. 왕 장원의 쌀을 받는 것도 그 때문이오. 그 집 아들이 외문을 걷어찬다는 말을 들었소. 나는 그 쌀을 먹이느라 그 발을 못 치우고 있소.');
  await narr('문주가 말을 내려놓았다. 장군이었다.');
  await say('lord', '그대는 왜 창운문에 왔소?');
  const c = await choice('문주가 찻잔을 들다 말고 내려놓았다.', ['밥을 먹으러 왔습니다', '찾는 사람이 있습니다']);
  if (c === 0) { await say('me', '밥을 먹으러 왔습니다.'); await say('lord', '좋은 답이오. 내가 들은 답 가운데 제일 정직하오.'); }
  else { await say('me', '찾는 사람이 있습니다.'); await say('lord', '찾으면 말해 주시오. 내 산에서 사람을 찾는 일이라면 나도 알아야 하니.'); }
  await narr('문주가 기침을 시작했다. 멈추는 데 한참 걸렸다. 입을 막았던 천을 소매에 넣는데 끝이 거뭇했다.');
  await say('wi', '문주님, 차 올렸습니다. 찬바람은 해롭습니다.');
  await narr('언제 왔는지 검각주가 뒤에 서 있었다. 문주는 내게 고개를 끄덕이고 천천히 일어났다. 빗자루를 다시 들었다. 비질이 잘 안 됐다.');
  F().m_lord = true; next();
}
async function exam() {
  await say('go', '오늘은 월말 시험이다. 외문 제자는 한 달에 한 번 칼을 내보인다. 진 사람은 다음 달에도 물을 긷고, 이긴 사람도 물을 긷는다.');
  await say('me', '그럼 왜 해요?');
  await say('go', '이긴 놈은 기분이 좋다.');
  await narr('첫 상대는 장팔이었다. 자루에 새끼줄이 감겨 있었다. 장팔은 나를 보더니 울상을 지었다.');
  await say('jangpal', '하필 형씨유? 살살 해 줘유.');
  await ctx.duel({ foes: ['jang_spar'], arena: 'court', title: '월말 시험 · 장팔', bgm: 'fight', yieldAt: .3, optional: true, noIntro: true });
  await narr('장팔은 끝까지 목검을 놓치지 않았다. 지고 나서도 놓지 않았다. 외문 제자들이 그걸 보고 박수를 쳤다. 삼 년 만에 처음 듣는 박수라고 했다.');
  await say('jangpal', '봤어유? 나 안 놓쳤어유!');
  await narr('다음은 내문에서 빌려 온 제자 둘이었고, 마지막은 고진이었다.');
  await ctx.duel({ foes: ['disciple', 'disciple'], arena: 'court', title: '월말 시험 · 내문 제자', bgm: 'fight', optional: true, noIntro: true });
  await ctx.duel({ foes: ['senior_go'], arena: 'court', bgm: 'boss', title: '월말 시험 · 고진', yieldAt: .3, optional: true, noIntro: true });
  await say('go', '목은 끝내 안 쳤구나.');
  await say('me', '칠 뻔했어요. 세 번쯤.');
  await say('go', '네 번이다. 다음 달에도 물을 길어라.');
  ctx.silver(60);
  await narr('그날 밤 외문 숙소에서 석두가 내 신발을 고쳐 놓았다. 말은 없었다. 뒤축이 전보다 단단해져 있었다.');
  F().m_exam = true; await G.part2Tea();
}
G.part2Month = startMonth;
Story.providers.push(function part2b(id) {
  const n = []; if (id !== 'cloudmt' || !at('c2b3')) return { npcs: n, spots: [], trigs: [], roam: [] };
  const job = o => n.push({ dir: 0, mark: () => true, ...o }), F0 = F();
  if (!F0.m_so) job({ id: 'so', spr: 'RedSamurai', x: 16, y: 24, hint: '소연하', talk: soNight });
  if (!F0.m_jang) job({ id: 'jangpal', spr: 'GreenNinja', x: 26, y: 18, hint: '장팔', talk: jangRope });
  if (!F0.m_well) job({ id: 'seokdu', spr: 'Villager', x: 25, y: 24, hint: '우물가가 시끄럽다', talk: well });
  if (!F0.m_cart) job({ id: 'go', spr: FOES.senior_go.spr.slice(6), x: 21, y: 28, hint: '고진', talk: cart });
  if (!F0.m_lord) job({ id: 'lord', spr: WHO.lord?.face || 'OldMan', x: 22.5, y: 12, hint: '본전 앞 마당', talk: lordGame });
  if (!left().length) job({ id: 'go', spr: FOES.senior_go.spr.slice(6), x: 21, y: 24, hint: '월말 시험', talk: exam });
  return { npcs: n, spots: [], trigs: [], roam: [] };
});
