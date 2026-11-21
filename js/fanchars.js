// 팬 게임 인물(『화산귀환』): 공용 보행·무공 도트(assets/hd2d/field/walk.json)를 쓰는 사람들
// 저마다 소속 문파·세가 터(b_<문파>)나 고을에 서 있다. 말을 걸면 한두 마디 하고, 자유 모드에서는 비무를 청할 수 있다
// 대사는 원작 문장을 옮기지 않고 새로 썼다. 대화 그림(assets/art/<키>_n)이 들어오면 그 그림으로 말한다
import { fanRealm, LV as RLV, NAME as RNAME, playerRealm } from './realm.js';
import { gain } from './meridian.js';
import { G, TS, ART, pick, josa } from './core.js';
import { SKILLS } from './data.js';
import { learn } from './state.js';
import { Story, ctx, say, choice, narr } from './ctx.js';
import { WHO } from './dialog.js';
import { FOES } from './foes.js';
import { MAPS } from './maps.js';

// [키, 이름, 자리(지도), 문파(비무 상대 무리), 칭호, 여자?, 대사들]
import { fanCast as P } from './fan-cast.js';

// 성격대로: l 평소 말(위 표의 말에 더한다), ok 비무를 받을 때, w 그 사람이 이겼을 때, d 그 사람이 졌을 때, no 비무를 안 받는 사람(그 말을 하고 끝)
const TALK = {
  cheongmyeong: { l: ['화산은 돈이 없어. 그러니까 돈 냄새 나는 데는 다 내 구역이야.', '사형들 또 늘어지게 자네. 깨워야겠다. 몽둥이로.', '나? 착한 사람이야. 화산 밖에서만.'],
    ok: ['오, 맞으러 왔어? 좋아. 수련비는 선불, 치료비는 후불.', '비무? 좋지. 대신 지고 나서 울지 마. 우는 거 싫어.', '검 뽑아. 말 길게 하는 놈치고 센 놈 못 봤다.'],
    w: ['이게 다야? 매화 구경 한 번 잘 했다고 생각해.', '다음엔 사형들이랑 붙어 봐. 걔들도 맞아야 커.', '아, 시원하다. 한 판 더? 농담이야.'],
    d: ['…오늘은 봐준 거다. 진짜야. 사형들한테 말하지 마.', '하, 재밌네. 다음엔 안 봐준다.', '이 새… 아니, 좋은 검이었다. 됐냐?'] },
  baekcheon: { l: ['대사형이라는 자리는 모범이 돼야 하는 자리입니다. 사제가 그걸 자꾸 시험하지만요.', '진금룡과는 언젠가 끝을 봐야 합니다. 화산의 이름으로.'],
    ok: ['화산 대제자 백천, 한 수 받겠습니다. 정정당당히.', '좋습니다. 화산의 검이 어떤지 직접 보시지요.', '사양하지 않겠습니다. 다만 다치지는 마십시오.'],
    w: ['좋은 검이었습니다. 다만 매화를 피우기엔 아직 이르군요.', '감사합니다. 덕분에 저도 배웠습니다.'],
    d: ['…제 부족함입니다. 다시 청하겠습니다.', '졌습니다. 사제에게는 비밀로 해 주십시오. 부탁입니다.'] },
  yuseol: { l: ['…고양이.', '…연무장. 같이 갈래?'],
    ok: ['…해.', '…좋아.', '…검 뽑아.'], w: ['…아직.', '…다시 와.'], d: ['…좋아. 한 번 더.', '…강하네.'] },
  yunjong: { l: ['사제들 먹이고 재우고 씻기고. 제가 무슨 사형인지 유모인지 모르겠습니다.', '청명이 또 뭘 했습니까? 아, 아직이요. 다행입니다.'],
    ok: ['다치시면 제가 혼납니다. 살살 하겠습니다. 정말로요.', '한 판만입니다. 사제들 저녁 지어야 해서요.'],
    w: ['괜찮으십니까? 약 드릴까요? 화산 약은 쓰지만 잘 듣습니다.', '수고하셨습니다. 밥 먹고 가십시오.'],
    d: ['허허, 졌네요. 사제들이 보면 놀리겠습니다.', '잘하시네요. 저보다 청명한테 가 보시지요. 그 녀석이 좋아할 겁니다.'] },
  jogeol: { l: ['손이 근질거려 죽겠네. 누구 하나 안 덤비나.', '청명 그 녀석, 언젠간 꼭 이긴다. 언젠간.'],
    ok: ['드디어! 기다렸다고! 덤벼!', '좋아, 피하지 마라! 나도 안 피한다!', '말 필요 없지. 검으로 하자!'],
    w: ['하하! 봤냐? 이게 화산 조걸이다!', '다음엔 사형한테 자랑해야지!'],
    d: ['아 진짜! 한 판만 더! 아니, 오늘은 됐고 내일!', '…인정. 근데 다음엔 내가 이긴다.'] },
  dangsoso: { l: ['사형들 다치면 제가 고쳐요. 일부러 다치는 것 같기도 하지만요.', '당가에서 배운 건 쓰면 안 된대요. 그래서 몰래만 써요. 농담이에요!'],
    ok: ['좋아요! 다치면 제가 치료해 드릴게요. 제가 다치게 한 거면 반값!', '화산 검이에요. 당가 거 아니에요. 정말이에요!'],
    w: ['괜찮아요? 잠깐만요, 침 놔 드릴게요. 안 아파요. 조금 아파요.', '헤헤, 이겼다! 사형들한테 자랑해야지.'],
    d: ['아, 졌다! 그래도 재밌었어요!', '와, 세시네요. 다음엔 당가 거 써도 돼요? 안 되겠죠.'] },
  hyeonjong: { l: ['화산의 살림이 펴야 제자들 밥상도 펴는 법이지요.', '청명이 그 아이가 오고 나서 늙는 게 두 배로 빨라졌습니다. 그래도 고맙지요.'],
    no: ['장문인이 손님과 칼을 맞대면 화산 체면이 말이 아니지요. 아이들과 겨뤄 보시겠소? 아이들이 좋아할 겁니다.'] },
  hyeonyeong: { l: ['화산 살림은 제가 압니다. 동전 한 닢까지요.', '청명이가 돈을 벌어 오면 좋은데, 쓰는 것도 그 녀석이라 문제지요.'],
    ok: ['비무요? 연무장 쓰는 값은 받습니다. 농이오. 반쯤은.', '좋소. 다만 연무장 바닥 부수면 물어내시오.'],
    w: ['허허, 장부에 적어 둡니다. 화산 일 승.', '치료비는 따로입니다. 이건 농이 아니오.'], d: ['졌구려. 장부엔 안 적겠소.', '늙은이가 이러면 안 되는데. 허허.'] },
  hyeonsang: { l: ['수련을 게을리하는 놈은 산문 계단을 백 번 오르내리게 한다.', '요즘 아이들은 칼보다 입이 빠르다. 청명이 탓이다.'],
    ok: ['좋다. 자세부터 보자. 틀리면 계단 백 번이다.', '들어와라. 화산 장로는 손님이라고 봐주지 않는다.'],
    w: ['자세가 무너졌다. 허리부터 다시 세워라.', '근본이 없구나. 근본부터 쌓고 오너라.'], d: ['…좋다. 근본이 있구나.', '내가 늙었나. 허허, 아니다. 네가 강한 게지.'] },
  ungeom: { l: ['한 팔로도 검은 가르칠 수 있습니다. 두 팔로 휘두르는 놈들이 못 따라올 뿐이지요.', '제자들 자세 하나하나가 화산의 앞날입니다.'],
    ok: ['좋습니다. 가르치듯이 받겠습니다. 아프게.', '한 팔이라고 봐주시면 안 됩니다. 저도 안 봐드립니다.'],
    w: ['발이 늦었습니다. 왼발부터 고치십시오.', '나쁘지 않습니다. 매일 천 번 휘두르면 좋아질 겁니다.'], d: ['…좋은 검입니다. 제자들에게 보여 주고 싶군요.', '졌습니다. 오늘 수업 거리가 생겼네요.'] },
  unam: { l: ['어린 제자들 밥은 먹었는지, 그것부터 봅니다.', '화산은 한 번 무너졌지요. 두 번은 안 무너집니다.'],
    ok: ['늙은이도 검은 쥘 줄 압니다. 한 수만 나누지요.'], w: ['허허, 다치지 않았소? 밥 먹고 가시오.'], d: ['좋은 검이오. 아이들이 배워야 할 검이오.'] },
  ungak: { l: ['약재는 그늘에 말려야 합니다. 저 바구니는 그대로 두시지요.'], ok: ['맥을 먼저 짚어 보지요. 무리하실 몸은 아니군요.'], w: ['손목은 괜찮으십니까?'], d: ['제 팔에도 약을 좀 발라야겠군요.'] },
  baeksang: { l: ['사형들한테 밀리지 않으려면 남들 잘 때 한 번 더 휘둘러야 합니다.', '청명 사숙… 아니, 청명은 왜 저렇게 강한 겁니까.'],
    ok: ['좋습니다! 저도 백자 배의 체면이 있습니다.', '한 판 부탁드립니다. 진지하게요.'], w: ['이겼다… 이겼어요! 아, 실례했습니다.'], d: ['…또 졌네. 오늘 밤도 혼자 휘둘러야겠습니다.'] },
  jingeumryong: { l: ['종남이 섬서의 주인이오. 화산은 옛날이야기고.', '백천과는 내가 끝을 낸다. 다른 놈은 끼지 마라.'],
    ok: ['종남의 검을 보여 주지. 화산 놈들 상대하기 전 연습 삼아.', '좋다. 진금룡의 이름을 기억하게 해 주마.', '덤벼라. 오래 끌 생각 없다.'],
    w: ['역시 이 정도로군. 화산에 가서 전해라. 종남이 기다린다고.', '하, 시시하군.'], d: ['…방심했다. 다음은 없다.', '이 패배는 기억해 두지. 반드시 갚는다.'] },
  isongbaek: { l: ['이긴 것도 진 것도 검으로 받아들입니다. 그게 종남의 도리입니다.', '화산 사람들에게 배울 게 있다고 하면 사형들이 싫어하겠지요. 그래도 사실입니다.'],
    ok: ['좋습니다. 부끄럽지 않은 검을 보여 드리겠습니다.', '한 수 청하겠습니다. 정중히.'], w: ['감사합니다. 저도 배웠습니다.'], d: ['…졌습니다. 깨끗하게. 좋은 검이었습니다.', '부족함을 알았습니다. 감사합니다.'] },
  jongseohan: { l: ['종남의 이름은 가벼이 걸지 마시오.', '섬서에 검문이 둘일 필요는 없다고 보오.'],
    ok: ['종남 어른의 검을 청하다니, 배짱은 있군.'], w: ['종남의 검은 무겁소. 기억하시오.'], d: ['…이 일은 밖에 내지 마시오.'] },
  gohwi: { l: ['낯선 얼굴이군. 종남 땅에선 종남 법을 따르시오.'], ok: ['종남 땅에서 비무라. 받아 주지.'], w: ['종남 땅에선 종남이 이기오.'], d: ['…운이 좋았소.'] },
  gimokseung: { l: ['검 끝이 흐트러지는군. 종남의 제자라면 마지막 한 수까지 반듯해야 하네.'], ok: ['어디, 자네가 익힌 검을 보여 주게.'], w: ['한 번 더 복기하게. 검을 거둘 때 빈틈이 있었네.'], d: ['허허, 내가 한 수 배웠군.'] },
  samaseung: { l: ['검이 무거우면 마음이 가볍고, 검이 가벼우면 마음이 무겁지. 나는 아직 무겁소.'], ok: ['무거운 마음으로 받겠소.'], w: ['마음이 조금 가벼워졌소.'], d: ['더 무거워졌구려.'] },
  heodo: { l: ['무량수불. 서두르는 자는 길을 잃지요.', '태극은 밀지 않고 흘립니다. 사람 사이도 그렇지요.'],
    no: ['무량수불. 장문인의 검은 무당 밖으로 나가지 않습니다. 제자들의 검을 보시지요.'] },
  heowon: { l: ['무당의 산길은 길지요. 내려가는 길이 더 깁니다.'], ok: ['천천히 오시오. 무당은 서두르지 않소.'], w: ['힘을 빼시오. 그래야 원이 그려집니다.'], d: ['무량수불. 좋은 흐름이었소.'] },
  heosan: { l: ['손님, 차 한 잔 하시겠소? 무당 차는 쓰지만 끝맛이 답니다.'], ok: ['차가 식기 전에 끝내지요.'], w: ['차가 아직 따뜻하구려. 드시오.'], d: ['차가 식었구려. 다시 끓이지요.'] },
  muyeon: { l: ['사형들이 화산 얘기를 하면 얼굴이 굳습니다. 이유는 묻지 마십시오.'], ok: ['무당 제자 무연, 한 수 청합니다.'], w: ['원이 닫혔습니다. 감사합니다.'], d: ['원이 깨졌네요. 더 그려야겠습니다.'] },
  mujin: { l: ['검을 원으로 그리는 법, 아직 반도 못 그립니다.'], ok: ['반쪽짜리 원이라도 괜찮으시다면요.'], w: ['오늘은 원이 조금 더 둥글었습니다.'], d: ['역시 반쪽이었네요.'] },
  jinhyeon: { l: ['무당의 검은 느려 보여도 끝이 빠릅니다.'], ok: ['느리다고 얕보지 마십시오.'], w: ['끝이 빨랐지요?'], d: ['끝까지 못 갔네요.'] },
  jinmu: { l: ['오늘 수련은 끝났습니다. 내일 수련도 벌써 걱정입니다.'], ok: ['수련 끝났는데… 네, 한 판만이요.'], w: ['이걸로 내일 수련은 빠져도 되겠지요?'], d: ['내일 수련이 두 배가 되겠네요.'] },
  danggunak: { l: ['당가의 손님이면 독도 대접이오. 농이오.', '사천의 일은 사천에서 끝냅니다. 밖으로 새지 않게.'],
    ok: ['당가 가주가 직접 받는 비무요. 한 수만이오. 독은 쓰지 않겠소.'], w: ['손이 늦소. 당가 앞에서 손이 늦으면 손이 없어지오.'], d: ['…훌륭하오. 당가가 빚을 졌소. 기억하겠소.'] },
  dangbo: { l: ['허허, 젊은 놈. 손에 뭘 쥐었는지 보여 줘 봐. 내가 맞혀 볼 테니.', '당가 암기는 보이는 걸 던지는 게 아니라 안 보이는 걸 던지는 거다.'],
    ok: ['좋지, 좋아! 늙은이 손 풀기에 딱이다. 눈 크게 떠라.', '하하, 비무? 몇 개나 피하나 세어 보마.'], w: ['스물셋 중에 다섯 피했다. 나쁘지 않아. 허허.'], d: ['허허! 이놈 봐라. 다 피했어! 술 한잔 사마!'] },
  dangho: { l: ['가주님 앞에선 말 조심하시오. 당가 사람은 귀가 밝소.'], ok: ['당가의 손을 보시겠소?'], w: ['당가는 빈손으로 지지 않소.'], d: ['…가주님께는 비밀이오.'] },
  danghwa: { l: ['약방 쪽엔 가지 마시오. 냄새만 맡아도 사흘 앓소.'], ok: ['해독약은 챙기셨소? 농이오.'], w: ['약은 필요 없소? 다행이오.'], d: ['약이 필요한 건 나구려.'] },
  dangjan: { l: ['당가는 빚을 잊지 않소. 은혜도, 원한도.'], ok: ['비무는 빚이 아니지. 받겠소.'], w: ['갚을 것 없소. 비무였으니.'], d: ['이건 빚으로 적어 두겠소.'] },
  dangpae: { l: ['암기 연습장 근처는 돌아서 가시오. 귀가 하나 줄 수도 있소.'], ok: ['귀 조심하시오.'], w: ['귀는 붙어 있소?'], d: ['내 귀가 붙어 있는 게 다행이구려.'] },
  hongdaegwang: { l: ['밥 한 술 주면 소문 두 개 준다! 개방 장사는 남는 장사야!', '거지가 모르는 소문은 아직 안 생긴 소문이지.'],
    ok: ['하하, 거지랑 비무? 지면 밥 사는 거다!', '좋다! 개방 타구봉 맛 좀 봐라!'], w: ['밥 사라! 약속은 약속이다!'], d: ['하하, 졌다! 밥은 내가 사지. 동냥한 걸로.'] },
  guchil: { l: ['동냥 그릇이 비었으면 소식이라도 채워 가야지.'], ok: ['빈 그릇 걸고 하지.'], w: ['그릇 채워 주시오.'], d: ['그릇이 더 비었네.'] },
  jongpal: { l: ['오늘은 장터 쪽이 후하더라. 내일은 모르고.'], ok: ['장터 가기 전에 한 판.'], w: ['장터 가야지.'], d: ['장터 가서 울어야겠다.'] },
};
const BY = {}; for (const r of P) BY[r[0]] = r;
for (const [k, name, , , title, fem] of P) WHO[k] = WHO['fan_' + k] = { name, face: fem ? 'Woman' : 'Samurai', art: k, title };

// 지도 안 빈자리: 마당 한가운데에서 둘레로 퍼져 나가며 막히지 않은 칸을 세 칸 간격으로 고른다(지도마다 한 번)
const SPOT = {};
const homePosition = {
  cheongmyeong: [21, 36], baekcheon: [25, 28], yuseol: [11, 28], yunjong: [18, 39],
  jogeol: [28, 37], dangsoso: [17, 20], hyeonjong: [24, 8], hyeonyeong: [10, 16],
  hyeonsang: [33, 19], ungeom: [15, 31], unam: [10, 51], ungak: [15, 20], baeksang: [32, 28],
  jingeumryong: [26, 27], isongbaek: [18, 31], jongseohan: [31, 37], gohwi: [16, 39],
  gimokseung: [21, 12], samaseung: [32, 17], heodo: [24, 9], heowon: [11, 17], heosan: [34, 17],
  muyeon: [15, 28], mujin: [19, 35], jinhyeon: [27, 29], jinmu: [31, 38],
  danggunak: [24, 9], dangbo: [34, 17], dangho: [29, 36], danghwa: [16, 31],
  dangjan: [26, 29], dangpae: [19, 39],
};
function spots(id, n) {
  if (SPOT[id] && SPOT[id].length >= n) return SPOT[id]; const m = MAPS[id]; if (!m?.blocked) return [];
  const cx = Math.floor(m.w / 2), cy = Math.floor(m.h * .55), out = [];
  const residents = P.filter(r => r[2] === id);
  if (m.court && residents.every(r => homePosition[r[0]])) {
    for (const [key] of residents) {
      const [u, v] = homePosition[key], tx = Math.round(u * m.k), ty = Math.round(v * m.k);
      let found = false;
      for (let r = 0; r <= 6 && !found; r++) for (let dy = -r; dy <= r && !found; dy++) for (let dx = -r; dx <= r; dx++) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
        const x = tx + dx + .5, y = ty + dy + .5;
        if (out.some(p => Math.hypot(p[0] - x, p[1] - y) < 2)) continue;
        if ([[0,0],[0,1],[-1,0],[1,0]].some(([a,b]) => m.blocked((x+a)*TS,(y+b)*TS))) continue;
        out.push([x, y]); found = true; break;
      }
      if (!found) break;
    }
    if (out.length === residents.length) return (SPOT[id] = out);
    out.length = 0;
  }
  for (let r = 2; r < Math.max(m.w, m.h) && out.length < n; r++) for (let dy = -r; dy <= r && out.length < n; dy++) for (let dx = -r; dx <= r && out.length < n; dx++) {
    if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue; const x = cx + dx, y = cy + dy; if (x < 2 || y < 2 || x > m.w - 3 || y > m.h - 4) continue;
    if ([[0, 0], [0, 1], [1, 0], [-1, 0], [0, -1]].some(([a, b]) => m.blocked((x + a) * TS + 8, (y + b) * TS + 8))) continue;
    if (out.some(([px, py]) => Math.abs(px - x) < 3 && Math.abs(py - y) < 3)) continue; out.push([x + .5, y + .5]);
  }
  return (SPOT[id] = out);
}
const last = {};
const line = (k, L) => { if (!L?.length) return null; let t = pick(L); if (L.length > 1 && t === last[k]) t = L[(L.indexOf(t) + 1) % L.length]; last[k] = t; return t; };
// 고수를 비무로 이기면: 처음 이길 때 깨달음(나보다 경지가 높으면 2), 그 사람 문파 초식 하나를 전수받는다(경지가 높을수록 높은 초식: 일류 1단, 절정 2단, 초절정 이상 3단).
// 나보다 경지가 낮은 상대에게서는 전수받지 않는다. 같은 사람에게서는 한 번만
export const teachOf = (fac, rl) => { const ids = G.arts?.ID?.[fac] || []; const tier = rl >= 4 ? 3 : rl >= 3 ? 2 : 1; return ids.filter(id => (SKILLS[id]?.tier || 1) <= tier && !G.S.skills.includes(id)).sort((a, b) => (SKILLS[b].tier || 1) - (SKILLS[a].tier || 1))[0] || null; };
async function teach(k, fac, rl, name) {
  const S = G.S, f = S.flags; if (f['fanwin_' + k]) return; f['fanwin_' + k] = 1;
  const me = playerRealm(); gain(rl > me ? 2 : 1, `${name}에게 이겼다`);
  if (rl < me) return; const id = personalTeaching(k, fac, rl); if (!id) return;
  await say('fan_' + k, `한 수 가르쳐 드리지요. ${SKILLS[id].name}. 잘 쓰시오.`); learn(id);
}
async function talk(k, direct = false) {
  const [, name, , native, title] = BY[k], fac = native || (k==='maengso'?'nokrim':'hwasan'), who = 'fan_' + k, T = TALK[k] || {};
  if (!direct) await say(who, line(k, [...BY[k][6], ...(T.l || [])]), k === 'cheongmyeong' ? 'h' : 'n');
  if (!fac || !G.jh?.disciple || !G.free?.fac) return;
  const rl0 = fanRealm(k, title), tid = !G.S.flags['fanwin_' + k] && rl0 >= playerRealm() ? personalTeaching(k, fac, rl0) : null;  // 이기면 무엇을 얻는지 미리 보인다
  const c = direct ? 0 : await choice(`${name} · ${title} · ${RNAME[rl0]}${tid ? ` · 이기면 ${SKILLS[tid].name} 전수` : G.S.flags['fanwin_' + k] ? ' · 이긴 적 있음' : ''}`, ['비무를 청한다', '그냥 간다']); if (c) return;
  if (T.no && !direct) return say(who, pick(T.no));
  // 문파의 초식과 인물 고유의 경지를 함께 쓴다.
  const f = G.free.fac(fac); if (!f) return; const rl = fanRealm(k, title), base = G.jh.disciple(f, RLV[rl] + 3, true), id = 'fan_' + k;
  FOES[id] = { ...FOES[base], ...personalArms(k,fac,rl), name: `${title} ${name}`, boss: 1, realm: rl, position: title, uniform: null, artId:k };
  await say(who,T.no ? (k==='hyeonjong'?'승부는 사양하겠소만, 자네 검로를 봐 주는 일이야 좋지요. 한 수 보여 주시오.':'마당 안에서 가르침을 청한다면 좋습니다. 그대 수를 받아 봅시다.') : pick(T.ok || ['한 수 부탁드립니다.']));
  const won = await ctx.duel({ spar: true, foes: [id], arena: G.field.m.arena, bgm: 'fight', title: `${josa(name, '과/와')} 비무`, optional: true, noIntro: true, noLoot: true });
  await say(who, won ? pick(T.d || ['…졌습니다. 다시 겨뤄 주십시오.']) : pick(T.w || ['수련을 더 하고 오십시오.']));
  if (won) await teach(k, fac, rl, name);
}
Story.providers.push(function fanchars(id) {
  const here = P.filter(r => r[2] === id); if (!here.length) return { npcs: [], spots: [], trigs: [], roam: [] };
  const S = spots(id, here.length);
  const npcs = here.map((r, i) => G.S.married!==r[0] && S[i] && { id: r[0], spr: r[5] ? 'Woman' : 'Samurai', x: S[i][0], y: S[i][1], dir: 0, hint: `${r[1]} · ${r[4]}`, talk: () => talk(r[0]) }).filter(Boolean);
  return { npcs, spots: [], trigs: [], roam: [] };
});
// 같은 문파에서도 각 인물이 즐겨 쓰는 수와 연계 순서는 다르다.
const personalMoves = {
  cheongmyeong:['quick',6,7,8,4,5], baekcheon:['double',6,3,4], yuseol:['lunge',6,7,8,4],
  yunjong:['double',6,1,2], jogeol:['quick','lunge',7,2], dangsoso:['quick',6,1,7,'x_yunui3'],
  hyeonjong:[6,3,'fall_flower',4], hyeonyeong:['quick',6,2,3], hyeonsang:['heavy',6,1,4],
  ungeom:['lunge',6,8,4], unam:['double',6,2], ungak:['heavy',6,3,1], baeksang:['quick',6,1],
  jingeumryong:['lunge',1,2,3,4], isongbaek:['lunge',1,'zhongnan',2],
  jongseohan:['double',2,3,4], gohwi:['quick',1,2], gimokseung:['heavy',3,4], samaseung:['lunge',1,3,4],
  heodo:['double',1,4,5], heowon:['lunge',1,3,5], heosan:['quick',1,2,4], muyeon:[2,1,'taiji',3],
  mujin:['double',1,3,'taiji'], jinhyeon:['lunge',1,2,3], jinmu:['quick',1,2],
  danggunak:['dart3',1,2,4,3], dangbo:['dart3','fan5','blink',4,3], dangho:['quick',2,'dart3',4],
  danghwa:['dart3',1,2], dangjan:['dart3','blink',1,4], dangpae:['dart3',1,2,4],
  hongdaegwang:['spin',1,3,4,5], guchil:['punch',1,2], jongpal:['heavy',2,4],
  wiripsan:['double',6,1,2], wisoheng:['lunge',6,1], yeompyeong:['quick',6,2],
  maengso:['iron_fist','chain_kick','earth_stomp','quake'],
};
function personalArms(k,fac) {
  const moves=personalMoves[k].map(m=>typeof m==='number'?'x_'+fac+m:m);
  return {school:fac,moves};
}
function personalTeaching(k,fac,realm) {
  const maxTier=realm>=4?3:realm>=3?2:1;
  return personalArms(k,fac).moves.filter(id=>SKILLS[id] && !SKILLS[id].ult &&
    (SKILLS[id].tier || 1)<=maxTier && !G.S.skills.includes(id))
    .sort((a,b)=>(SKILLS[b].tier || 1)-(SKILLS[a].tier || 1))[0] || null;
}
G.fan = { P, spots, spar:k=>talk(k,true), accepts:k=>!TALK[k]?.no,
  chat:k=>line(k,[...BY[k][6],...(TALK[k]?.l||[])]),
  power:k=>RNAME[fanRealm(k)], ally(k) {
    const [,name,,native,title]=BY[k], f=G.free.fac(native || (k==='maengso'?'nokrim':'hwasan'));
    const id='fan_'+k+'_ally',realm=fanRealm(k),base=G.jh.disciple(f,RLV[realm],'사범');
    FOES[id]={...FOES[base],...personalArms(k,f.id,realm),name,position:title,realm,artId:k,uniform:null,exp:0,silver:0};return id;
  }
};
