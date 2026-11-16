// 팬 게임 인물(『화산귀환』): 사용자가 ChatGPT로 그린 걷는 도트(assets/hd2d/preview/n_<키>.webp)를 쓰는 사람들
// 저마다 소속 문파·세가 터(b_<문파>)나 고을에 서 있다. 말을 걸면 한두 마디 하고, 자유 모드에서는 비무를 청할 수 있다
// 대사는 원작 문장을 옮기지 않고 새로 썼다. 대화 그림(assets/art/<키>_n)이 들어오면 그 그림으로 말한다
import { G, TS, ART, pick, josa } from './core.js';
import { Story, ctx, say, choice, narr } from './ctx.js';
import { WHO } from './dialog.js';
import { FOES } from './foes.js';
import { MAPS } from './maps.js';

// [키, 이름, 자리(지도), 문파(비무 상대 무리), 칭호, 여자?, 대사들]
const P = [
  ['cheongmyeong', '청명', 'b_hwasan', 'hwasan', '화산파 제자', 0, ['화산 문 앞에서 기웃거리는 건 공짜지만, 들어오면 돈 내야 하는 거 알지?', '종남? 그 이름 나오면 밥맛이 떨어지니까 꺼내지 마.', '매화는 피는 게 아니라 터지는 거야. 검으로 보여 줄까?']],
  ['baekcheon', '백천', 'b_hwasan', 'hwasan', '화산파 제자', 0, ['화산의 이름에 먹칠하는 일은 하지 않겠습니다. 사제가 하는 건… 말리지 못해서 문제지만.', '검은 매일 휘둘러야 무뎌지지 않습니다. 사람도 그렇고요.']],
  ['yuseol', '유이설', 'b_hwasan', 'hwasan', '화산파 제자', 1, ['…검.', '말보다 한 번 겨뤄 보는 게 빨라.', '…매화는, 좋아.']],
  ['yunjong', '윤종', 'b_hwasan', 'hwasan', '화산파 제자', 0, ['사형제들 뒤치다꺼리하다 보면 하루가 다 갑니다. 그래도 화산 밥은 맛있습니다.', '소란 피우지 마십시오. 장문인께서 또 한숨 쉬십니다.']],
  ['jogeol', '조걸', 'b_hwasan', 'hwasan', '화산파 제자', 0, ['뭘 봐? 한판 붙고 싶으면 말로 하지 말고 검 뽑아.', '종남 놈들 다음엔 내가 먼저 손봐 준다.']],
  ['dangsoso', '당소소', 'b_hwasan', 'hwasan', '화산파 제자 (당가 출신)', 1, ['당가 딸이 왜 화산에 있냐고요? 여기가 더 재밌거든요.', '독은 안 써요. 화산에선요. …아마도.']],
  ['hyeonjong', '현종', 'b_hwasan', 'hwasan', '화산파 장문인', 0, ['화산의 살림이 펴야 제자들 밥상이 펴는 법이지요. 손님도 한 그릇 드시고 가시오.', '아이들이 사고를 쳐도, 그게 다 화산이 살아 있다는 증거지요.']],
  ['hyeonyeong', '현영', 'b_hwasan', 'hwasan', '화산파 장로', 0, ['장부가 맞으면 세상이 평안합니다. 장부가 안 맞으면… 누군가 경을 칩니다.', '화산 매화차 한 봉에 은자 열 냥. 비싸다고요? 화산 차니까요.']],
  ['hyeonsang', '현상', 'b_hwasan', 'hwasan', '화산파 장로', 0, ['수련을 게을리하는 놈은 산문 계단을 백 번 오르내리게 하지.', '검을 쥔 손보다 검을 놓을 줄 아는 손이 무섭다.']],
  ['ungeom', '운검', 'b_hwasan', 'hwasan', '화산파 교관', 0, ['자세가 틀리면 몸이 먼저 압니다. 아프게.', '제자들이 늘었습니다. 연무장이 좁아질 지경이지요.']],
  ['unam', '운암', 'b_hwasan', 'hwasan', '화산파 어른', 0, ['어린 제자들 밥은 먹었는지 그것부터 봅니다.', '화산은 한 번 무너졌지요. 두 번은 안 무너집니다.']],
  ['ungak', '운각', 'b_hwasan', 'hwasan', '화산파 어른', 0, ['산문을 지키는 게 제 일입니다. 수상한 사람은 못 지나갑니다. 손님은… 괜찮아 보이는군요.']],
  ['baeksang', '백상', 'b_hwasan', 'hwasan', '화산파 제자', 0, ['사형들한테 밀리지 않으려면 남들 잘 때 한 번 더 휘둘러야 합니다.']],
  ['jingeumryong', '진금룡', 'b_jongnam', 'jongnam', '종남파 제자', 0, ['종남이 섬서의 주인이오. 화산은 옛날이야기고.', '화산 사람을 만나거든 전하시오. 다음 비무에선 내가 이긴다고.']],
  ['isongbaek', '이송백', 'b_jongnam', 'jongnam', '종남파 제자', 0, ['이긴 것도 진 것도 검으로 받아들입니다. 그게 종남의 도리입니다.', '화산 사람들에게 배울 게 있다고 하면, 사형들이 싫어하겠지요.']],
  ['jongseohan', '종서한', 'b_jongnam', 'jongnam', '종남파 어른', 0, ['종남의 이름은 가벼이 걸지 마시오.', '섬서에 검문이 둘일 필요는 없다고 보오.']],
  ['gohwi', '고휘', 'b_jongnam', 'jongnam', '종남파 사람', 0, ['낯선 얼굴이군. 종남 땅에선 종남 법을 따르시오.']],
  ['gimokseung', '기목승', 'b_jongnam', 'jongnam', '종남파 사람', 0, ['사형들 심부름이 끝이 없소. 그래도 종남 밥값은 해야지.']],
  ['samaseung', '사마승', 'b_jongnam', 'jongnam', '종남파 사람', 0, ['검이 무거우면 마음이 가볍고, 검이 가벼우면 마음이 무겁지. 나는 아직 무겁소.']],
  ['heodo', '허도진인', 'b_wudang', 'wudang', '무당파 장문인', 0, ['무량수불. 서두르는 자는 길을 잃지요.', '태극은 밀지 않고 흘립니다. 사람 사이도 그렇지요.']],
  ['heowon', '허원', 'b_wudang', 'wudang', '무당파 장로', 0, ['무당의 산길은 길지요. 내려가는 길이 더 깁니다.']],
  ['heosan', '허산', 'b_wudang', 'wudang', '무당파 장로', 0, ['손님, 차 한 잔 하시겠소? 무당 차는 쓰지만 끝맛이 답니다.']],
  ['muyeon', '무연', 'b_wudang', 'wudang', '무당파 제자', 0, ['사형들이 화산 얘기를 하면 얼굴이 굳습니다. 이유는 묻지 마십시오.']],
  ['mujin', '무진', 'b_wudang', 'wudang', '무당파 제자', 0, ['검을 원으로 그리는 법, 아직 반도 못 그립니다.']],
  ['jinhyeon', '진현', 'b_wudang', 'wudang', '무당파 제자', 0, ['무당의 검은 느려 보여도 끝이 빠릅니다.']],
  ['jinmu', '진무', 'b_wudang', 'wudang', '무당파 제자', 0, ['오늘 수련은 끝났습니다. 내일 수련도 벌써 걱정입니다.']],
  ['danggunak', '당군악', 'b_dang', 'dang', '사천당가 가주', 0, ['당가의 손님이면 독도 대접이오. 농이오.', '사천의 일은 사천에서 끝냅니다. 밖으로 새지 않게.']],
  ['dangbo', '당보', 'b_dang', 'dang', '사천당가 어른', 0, ['허허, 젊은 놈. 손에 뭘 쥐었는지 보여 줘 봐. 내가 맞혀 볼 테니.', '당가 암기는 보이는 걸 던지는 게 아니라 안 보이는 걸 던지는 거다.']],
  ['dangho', '당호', 'b_dang', 'dang', '사천당가 사람', 0, ['가주님 앞에선 말 조심하시오. 당가 사람은 귀가 밝소.']],
  ['danghwa', '당화', 'b_dang', 'dang', '사천당가 사람', 0, ['약방 쪽엔 가지 마시오. 냄새만 맡아도 사흘 앓소.']],
  ['dangjan', '당잔', 'b_dang', 'dang', '사천당가 사람', 0, ['당가는 빚을 잊지 않소. 은혜도, 원한도.']],
  ['dangpae', '당패', 'b_dang', 'dang', '사천당가 사람', 0, ['암기 연습장 근처는 돌아서 가시오. 귀가 하나 줄 수도 있소.']],
  ['hongdaegwang', '홍대광', 'b_gaebang', 'gaebang', '개방 거지', 0, ['밥 한 술 주면 소문 두 개 준다! 개방 장사는 남는 장사야!', '거지가 모르는 소문은 아직 안 생긴 소문이지.']],
  ['guchil', '구칠', 'b_gaebang', 'gaebang', '개방 거지', 0, ['동냥 그릇이 비었으면 소식이라도 채워 가야지.']],
  ['jongpal', '종팔', 'b_gaebang', 'gaebang', '개방 거지', 0, ['오늘은 장터 쪽이 후하더라. 내일은 모르고.']],
  ['wiripsan', '위립산', 'c_changan', null, '화영문 문주', 0, ['화영문은 작은 문파지만, 은혜는 크게 갚습니다.', '장안 바닥에서 버티는 게 쉽지 않습니다. 그래도 버팁니다.']],
  ['wisoheng', '위소행', 'c_changan', null, '화영문 소문주', 0, ['아버지 문파를 꼭 키워 보일 겁니다. 화산 형님들처럼.']],
  ['yeompyeong', '염평', 'c_changan', null, '화영문 사람', 0, ['화영문 표국 짐이 장안 바닥에서 제일 안전합니다. 아마도요.']],
  ['maengso', '맹소', 'c_dali', null, '남만야수궁 사람', 0, ['짐승은 거짓말을 안 해. 사람은 하지.', '남만 밀림에서 하룻밤만 자 봐. 중원이 얼마나 조용한지 알게 될걸.']],
];
const BY = {}; for (const r of P) BY[r[0]] = r;
for (const [k, name, , , title, fem] of P) WHO['fan_' + k] = { name, face: fem ? 'Woman' : 'Samurai', art: k, title };

// 지도 안 빈자리: 마당 한가운데에서 둘레로 퍼져 나가며 막히지 않은 칸을 세 칸 간격으로 고른다(지도마다 한 번)
const SPOT = {};
function spots(id, n) {
  if (SPOT[id] && SPOT[id].length >= n) return SPOT[id]; const m = MAPS[id]; if (!m?.blocked) return [];
  const cx = Math.floor(m.w / 2), cy = Math.floor(m.h * .55), out = [];
  for (let r = 2; r < Math.max(m.w, m.h) && out.length < n; r++) for (let dy = -r; dy <= r && out.length < n; dy++) for (let dx = -r; dx <= r && out.length < n; dx++) {
    if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue; const x = cx + dx, y = cy + dy; if (x < 2 || y < 2 || x > m.w - 3 || y > m.h - 4) continue;
    if ([[0, 0], [0, 1], [1, 0], [-1, 0], [0, -1]].some(([a, b]) => m.blocked((x + a) * TS + 8, (y + b) * TS + 8))) continue;
    if (out.some(([px, py]) => Math.abs(px - x) < 3 && Math.abs(py - y) < 3)) continue; out.push([x + .5, y + .5]);
  }
  return (SPOT[id] = out);
}
async function talk(k) {
  const [, name, , fac, title] = BY[k], who = 'fan_' + k;
  await say(who, pick(BY[k][6]));
  if (G.S.mode !== 'free' || !fac || !G.jh?.disciple) return;
  const c = await choice(`${name} · ${title}`, ['비무를 청한다', '그냥 간다']); if (c) return;
  const f = G.free?.fac?.(fac); if (!f) return; const base = G.jh.disciple(f, G.S.lv + 1, true), id = 'fan_' + k;
  FOES[id] = { ...FOES[base], name: `${title} ${name}`, boss: 1 };
  await say(who, pick(['좋아. 다치지 않게 해 줄게.', '비무라. 사양하지 않겠습니다.', '한 수 부탁드립니다.']));
  const won = await ctx.duel({ foes: [id], arena: G.field.m.arena, bgm: 'fight', title: `${name}와(과) 비무`, optional: true, noIntro: true, noLoot: true });
  await say(who, won ? pick(['…졌다. 다음엔 안 진다.', '좋은 검이었습니다.', '다시 겨뤄 주십시오.']) : pick(['아직 멀었어.', '수련을 더 하고 오십시오.', '괜찮았어. 조금은.']));
}
Story.providers.push(function fanchars(id) {
  const here = P.filter(r => r[2] === id); if (!here.length) return { npcs: [], spots: [], trigs: [], roam: [] };
  const S = spots(id, here.length);
  const npcs = here.map((r, i) => S[i] && { id: r[0], spr: r[5] ? 'Woman' : 'Samurai', x: S[i][0], y: S[i][1], dir: 0, hint: `${r[1]} · ${r[4]}`, talk: () => talk(r[0]) }).filter(Boolean);
  return { npcs, spots: [], trigs: [], roam: [] };
});
G.fan = { P, spots };
