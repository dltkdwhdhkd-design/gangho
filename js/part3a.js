// 제3부 3장 강을 따라: 화산 벼랑을 나와 구화성 대회까지 한 달. 개봉·무창·남경·항주를 원하는 순서로 들른다
// 복선: 개방의 "맹주 창고로 들어가는 쌀이 사람 수보다 많다", 제갈세가 토벌 명령서의 날짜(불이 난 사흘 뒤, 4부 '날짜'에서 풀림). 회수: 2부 떠돌이 약상이 말하는 칠일소혼산을 가져간 손님
import { G, fadeTo } from './core.js';
import { Story, ctx, say, narr, choice } from './ctx.js';
import { WHO } from './dialog.js';
import { FOES } from './foes.js';
import { set, at, after } from './story1.js';
import { toGuhwa } from './story2.js';

const F = () => G.S.flags;
Object.assign(WHO, { dangsang: WHO.dangsang || { name: '떠돌이 약상', face: 'Villager3' }, ng_young: { name: '남궁진', face: 'Namgung', art: 'clan_namgung' } });
// 길 위 싸움은 경험치를 덜 줘서(.4) 구화성 대회 난이도가 그대로 가게 한다. 세가 사람들과의 비무는 대회 전 몸풀기라 소연하 밤 비무 정도로 맞춘다(문파 도전용 clan_* 는 너무 세다)
const spar = (k, name) => ({ ...FOES['clan_' + k], name, hp: 1500, atk: 25, def: 8, boss: 0, poise: 60, phases: undefined, tier: undefined });
Object.assign(FOES, { r3_hongdu: spar('gaebang', '홍두 장로'), r3_namgung: spar('namgung', '남궁진'), r3_moyong: spar('moyong', '모용설') });

const CITY = {
  kaifeng: { map: 'c_kaifeng', name: '개봉', go: '황하를 따라 개봉으로 (개방)' },
  wuchang: { map: 'c_wuchang', name: '무창', go: '장강을 타고 무창으로 (제갈세가)' },
  nanjing: { map: 'c_nanjing', name: '남경', go: '물길로 남경으로 (남궁세가)' },
  hangzhou: { map: 'c_hangzhou', name: '항주', go: '운하를 타고 항주로 (모용세가)' },
};
const KEYS = Object.keys(CITY);
const left = () => KEYS.filter(k => !F()['r3_' + k]);
const goalNow = () => ctx.goal(`구화성 대회까지 한 달. ${CITY[F().r3_at]?.name || ''}에서 볼일 보기 (! 표시)`);

export async function roadStart() {
  await ctx.chap(3, '강호 유람', '제3장 강을 따라');
  await narr('구화성 대회까지 한 달이 남았다. 곧장 가면 열흘 길이었다. 윤설이 지도를 펴더니 손가락으로 강을 몇 번 따라갔다.');
  await say('yun', '곧장 가면 스무 날을 놀아야 해요. 돌아가요. 강가 큰 고을마다 약재 시장이 있어요.');
  await say('me', '약재 사러요?');
  await say('yun', '그것도 있고요. 십칠 년 전 일을 아는 사람이 소림에만 있었겠어요? 큰 고을엔 큰 문파가 있잖아요.', 'h');
  set('t6'); await nextCity();
}
async function nextCity() {
  const L = left();
  if (!L.length) {
    await narr('한 달이 금방 갔다. 강을 네 번 갈아탔고, 윤설의 약재 보따리는 세 배로 불었다. 구화성 성벽이 보였다.');
    set('c3a'); await toGuhwa(); return;
  }
  const c = L.length === 1 ? 0 : await choice(L.length === 4 ? '어디부터 들를까?' : '다음은 어디로 갈까?', L.map(k => CITY[k].go));
  const k = L[c]; F().r3_at = k;
  await fadeTo(1); G.field.load(CITY[k].map, 21, 18, 1); await fadeTo(0);
  await ARRIVE[k](); goalNow();
}
async function cityDone(k) { F()['r3_' + k] = true; F().r3_at = null; await nextCity(); }

// ── 개봉: 개방, 떠돌이 약상 ──
const ARRIVE = {
  kaifeng: () => narr('개봉은 황하 물보다 사람이 더 많았다. 다리 밑마다 거지가 있었고, 거지마다 허리에 매듭 주머니를 차고 있었다. 매듭 수가 계급이라고 윤설이 알려 주었다.'),
  wuchang: () => narr('무창 나루는 배가 다리처럼 이어져 있었다. 강 건너 언덕 위에 제갈세가 분가의 서고가 보였다. 비가 올 것 같았다.'),
  nanjing: () => narr('남경 성문은 청하진 전체보다 컸다. 성 안 큰길 한복판에 남궁세가 가마가 지나가자 사람들이 저절로 길을 비켰다.'),
  hangzhou: () => narr('항주는 호수가 성 안에 들어와 있었다. 버드나무 아래 찻집마다 시를 읊는 사람이 있었고, 찻집 어딘가에서 남의 말을 그대로 따라 하는 목소리가 들렸다.'),
};
async function kaifeng() {
  await say('dangsang', '한 푼만 줍쇼…… 어? 어어, 자네!', 'b');
  if (F().fs_dang) await say('me', '창운문에서 하룻밤 묵고 새벽에 사라진 분이잖아요.');
  else await say('me', '저를 아세요?');
  await say('dangsang', '창운문 외문 숙소에서 봤지. 그날 새벽에 도망 나온 뒤로 여기서 이러고 사네. 거지 노릇이 약 팔이보다 낫더라고. 여기는 개방이 지켜 주거든.');
  await say('me', '왜 도망치셨어요?');
  await say('dangsang', '그 검각주 말이야. 노잣돈을 두 배로 주더군. 사람이 이유 없이 두 배를 주면 그건 입 다물라는 돈이야.');
  await say('dangsang', '십칠 년 전 당가 약고에서 없어진 게 뭔지 알아? 칠일소혼산 처방이야. 이레마다 조금씩 먹이는 독.', 's');
  await say('yun', '창운문 문주님이 드신 독이에요.', 'b');
  await say('dangsang', '그 손님 얼굴은 생각이 안 나. 근데 손톱이 그렇게 깨끗한 사내는 처음 봤어. 그리고 그해 봄이었지. 무슨 골짜기에 큰불이 났다고 강호가 시끄럽던 봄.');
  await narr('외문 숙소 앞에서 내 어깨에 연고를 발라 주던 손이 생각났다. 유난히 깨끗하던 손톱. 그리고 십칠 년 전 봄, 월하곡.');
  ctx.note('개봉의 떠돌이 약상: 당가 약고에서 칠일소혼산 처방을 가져간 손님은 손톱이 깨끗한 사내였다. 월하곡에 불이 난 그해 봄이었다.');
  await say('clan_gaebang', '거기, 우리 식구한테 뭘 캐묻나?');
  await say('me', '옛날 일을 물었어요. 해코지하려는 거 아니에요.');
  await say('clan_gaebang', '말로는 다 그러지. 개방은 말보다 몽둥이를 믿네. 한 판 하고 얘기하세.');
  await ctx.duel({ foes: ['r3_hongdu'], arena: G.field.m.arena, bgm: 'fight', title: '개방 · 홍두 장로', yieldAt: .35, optional: true, noIntro: true, expMul: .4 });
  await say('clan_gaebang', '허허, 몽둥이를 피하는 게 아니라 몽둥이 옆으로 걸어 들어오는구먼. 됐네. 구화성 간다지?');
  await say('clan_gaebang', '거기 가거든 맹주 창고 앞을 한번 지나가 보게. 개방이 거기 쌀가마 드나드는 걸 세고 있는데, 이상하단 말이야.');
  await say('me', '뭐가요?');
  await say('clan_gaebang', '맹주 창고로 들어가는 쌀이 거기 사는 사람 수보다 많아. 훨씬. 그 쌀을 누가 먹는지 아무도 몰라.');
  ctx.note('개방 홍두 장로: 맹주 창고로 들어가는 쌀이 사람 수보다 많다. 그 쌀을 누가 먹는지 모른다.');
  await cityDone('kaifeng');
}
// ── 무창: 제갈세가 서고, 명령서의 날짜 ──
async function wuchang() {
  await say('clan_jegal', '구화성 대회 출전자시군요. 명단에서 봤습니다. 마침 잘 오셨습니다. 일손이 필요합니다.');
  await say('me', '무슨 일인데요?');
  await say('clan_jegal', '서고 상자를 배에 옮깁니다. 비 오기 전에 본가로 보내야 하는데, 나루에 질 나쁜 손님들이 붙어 있어서요.');
  await narr('상자를 반쯤 옮겼을 때 나루 쪽에서 쇠갈고리가 날아와 뱃전에 박혔다. 수적이었다.');
  await ctx.duel({ foes: ['pirate', 'pirate_hook', 'pirate_bow'], arena: 'dock', bgm: 'fight', title: '무창 나루 · 수적', optional: true, noIntro: true, expMul: .4 });
  await narr('수적들이 물로 뛰어든 사이 상자 하나가 엎어져 문서가 젖은 바닥에 쏟아졌다. 윤설과 둘이 주워 담았다.');
  await say('yun', '이거 월하곡 토벌 명령서 사본이네요. 정천맹 도장이 찍혀 있어요.', 'b');
  await say('yun', '근데 이상해요. 명령서는 삼월 열이레인데, 여기 붙은 보고서에는 월하곡에 불이 난 게 삼월 열나흘이래요.');
  await say('me', '불이 먼저 나고, 토벌 명령은 사흘 뒤에 났다고요?');
  await say('clan_jegal', '……주십시오.', 'b');
  await narr('제갈현이 종이를 받아 들고 한참을 보았다. 그러고는 접어서 소매에 넣었다.');
  await say('clan_jegal', '베낀 사람이 날짜를 잘못 적었겠지요. 사본에는 흔한 일입니다. 수고하셨습니다. 이건 일한 값입니다.');
  ctx.silver(40);
  await say('yun', '그 사람 손이 떨렸어요.', 's');
  ctx.note('무창 제갈세가 서고: 월하곡 토벌 명령서 사본은 삼월 열이레, 월하곡 불은 삼월 열나흘. 명령이 불보다 사흘 늦다. 제갈현은 베낀 사람이 잘못 적었을 거라며 사본을 가져갔다.');
  F().fs_order = true;
  await cityDone('wuchang');
}
// ── 남경: 남궁 혼담 ──
async function nanjing() {
  await narr('남궁세가 대문 앞에서 가마를 메던 하인 하나가 넘어져 발목이 꺾였다. 윤설이 보따리를 내려놓고 먼저 달려갔다. 뼈를 맞추는 소리가 났고, 하인은 소리도 못 질렀다.');
  await say('ng_elder', '손이 빠르구나. 어느 집 딸인가?');
  await say('yun', '청하진 윤씨 약방이요.');
  await say('ng_elder', '약방이라. 좋다. 우리 진이 녀석이 혼처를 다 걷어차서 골치였는데, 의원 며느리라면 그 녀석도 할 말이 없겠지.', 'h');
  await say('yun', '네? 며, 며느리요?', 'b');
  await say('ng_young', '숙부님, 또 길에서 혼처를 줍고 계십니까.', 'a');
  await narr('대문에서 나온 사내가 나를 위아래로 훑었다. 허리에 찬 검집이 은으로 감겨 있었다.');
  await say('ng_young', '그대가 이 아가씨 일행이오? 숙부님이 저러시면 말로는 안 끝나오. 내가 그대한테 지면 숙부님도 단념하실 거요.');
  const c = await choice('남궁진이 검을 반쯤 뽑는다. 윤설이 내 소매를 잡았다.', ['윤설은 내 일행이라고 말한다', '혼담은 본인한테 물어보라고 한다']);
  if (c === 0) { await say('me', '이 사람은 제 일행입니다. 데려가려면 저부터 넘으세요.'); await say('yun', '……누가 데려간대요.', 's'); ctx.love('yun'); }
  else { await say('me', '혼담은 본인한테 물어보세요. 저한테 칼 뽑지 말고요.'); await say('yun', '안 해요! 안 한다고요!', 'a'); await say('ng_young', '들었소? 그러니 그대가 져 주면 일이 쉬운데.', 'h'); }
  await ctx.duel({ foes: ['r3_namgung'], arena: G.field.m.arena, bgm: 'fight', title: '남궁세가 · 남궁진', yieldAt: .35, optional: true, noIntro: true, expMul: .4 });
  await say('ng_young', '하하, 졌소. 숙부님, 들으셨지요? 이 혼담은 없던 걸로 합시다.');
  await say('ng_elder', '네 녀석이 지고도 웃는 건 처음 보는구나.');
  await say('ng_young', '구화성에서 다시 붙읍시다. 그땐 혼담 걸지 말고 이름만 걸고.', 'h');
  await say('yun', '……며느리래.', 's');
  await say('me', '뭐라고요?');
  await say('yun', '아무것도 아니에요! 가요!', 'a');
  await cityDone('nanjing');
}
// ── 항주: 모용설 ──
async function hangzhou() {
  await narr('서호 찻집에서 차를 시키는데 옆자리 여인이 내 말을 그대로 따라 했다. 말투까지 똑같았다.');
  await say('clan_moyong', '차 두 잔이요. 하나는 식혀서요.');
  await say('me', '……저 따라 하시는 거예요?');
  await say('clan_moyong', '저 따라 하시는 거예요?', 'h');
  await say('yun', '모용세가 사람이에요. 남의 무공을 그대로 되돌려 주는 집안이래요. 말도 그런가 봐요.');
  await say('clan_moyong', '……버릇이오. 남의 말을 듣고 따라 하다 보면, 내 말은 어떻게 하는지 잊어버리오.', 's');
  await say('clan_moyong', '그대 걸음도 따라 해 보고 싶소. 구화성 가는 길이오? 나도 가오. 그 전에 한 번만.');
  await ctx.duel({ foes: ['r3_moyong'], arena: G.field.m.arena, bgm: 'fight', title: '모용세가 · 모용설', yieldAt: .35, optional: true, noIntro: true, expMul: .4 });
  await say('clan_moyong', '안 되오. 왼발로 미는 건 따라 했는데, 오른발이 따라오질 않소.');
  await say('me', '오른발은 그냥 두면 따라와요. 따라오게 하려고 하면 안 와요.');
  await say('clan_moyong', '……그냥 두면.');
  await narr('모용설은 그 말만은 따라 하지 않고 한참 입 안에서 굴렸다.');
  await say('clan_moyong', '구화성에서 보오. 그때는 내 말로 인사하겠소.');
  await cityDone('hangzhou');
}
// 길 위 그림은 새 화면 사람 그림이 있는 것만 쓴다(Jegal·Noble 옛 그림은 큰 덩어리로 그려진다)
const TALK = { kaifeng: ['dangsang', 'Villager3', '다리 밑 거지', kaifeng], wuchang: ['clan_jegal', 'Villager', '제갈세가 서고', wuchang], nanjing: ['ng_elder', 'OldMan', '남궁세가 대문', nanjing], hangzhou: ['clan_moyong', 'Woman', '서호 찻집', hangzhou] };
G.r3 = { roadStart, kaifeng, wuchang, nanjing, hangzhou };  // 시험용

Story.providers.push(function part3a(id) {
  const n = [];
  if (at('t6')) for (const k of KEYS) if (id === CITY[k].map && F().r3_at === k && !F()['r3_' + k]) {
    const [who, spr, hint, fn] = TALK[k];
    n.push({ id: 'r3_' + who, spr, x: 21, y: 15, dir: 0, hint, mark: () => true, talk: fn });
  }
  return { npcs: n, spots: [], trigs: [], roam: [] };
});

// ── 구화성 금봉 객잔: 이름 모르는 덩치와 합석 (5부 패천도 사마웅) ──
// 적에게 얼굴을 먼저 준다. 여기서는 이름을 끝까지 안 밝히고, 5부 담판에서 알아보게 한다(part4b samaungEcho)
WHO.sm_guest = { name: '덩치 큰 손님', face: 'Samaung', art: 'samaung' };  // 얼굴은 5부 패천도와 같다(눈치 빠른 사람은 알아본다)
async function smDrink() {
  await narr('금봉 객잔은 대회 손님으로 빈자리가 없었다. 구석 탁자 하나만 덩치 큰 사내가 혼자 차지하고 술을 마시고 있었다. 자리가 넉넉히 남았는데도 아무도 거기 앉지 않았다.');
  await say('sm_guest', '서 있지 말고 앉아. 자리는 넓다. 사람들이 안 앉아서 그렇지.');
  await narr('사내 옆에 큰 칼이 기대 있었다. 칼집이 내 키만 했다.');
  await say('sm_guest', '대회 나가냐? 그 칼 차고 다니는 꼴 보니 나가는구먼. 어느 문파냐.');
  await say('me', '창운문이요. 원래는 청하진 객잔 점소이였고요.');
  await say('sm_guest', '하하! 점소이. 좋다. 그럼 하나 묻자. 점소이가 칼을 들면 정파냐, 사파냐?');
  await say('me', '…칼 든 점소이요.');
  await say('sm_guest', '그 대답이 제일 위험한 거다. 이 강호는 둘 중 하나를 고르라고 한다. 안 고르면 남이 골라 준다. 대개 나쁜 쪽으로.', 'h');
  await say('sm_guest', '이 대회도 그래. 출신을 묻지. 사파 놈은 이름을 못 올린다. 나도 젊을 때 올리러 왔다가 문 앞에서 쫓겨났다.');
  const c = await choice('사내가 빈 잔을 내 앞에 놓고 술병을 든다.', ['따라 주는 술을 받는다', '병을 받아 내가 따른다']);
  if (c === 0) {
    await narr('사내가 잔을 채웠다. 내가 마시는 걸 끝까지 보고 나서야 자기 잔을 들었다.');
    await say('sm_guest', '남이 따른 술을 의심 없이 마시는구먼. 좋은 버릇은 아니다. 나는 남이 따른 술은 안 마신다. 그러다 형제를 잃었거든.', 's');
    F().sm_drink = 'took';
  } else {
    await say('me', '얻어먹는 쪽이 따르는 게 객잔 법이에요.');
    await narr('사내가 잠깐 나를 보더니, 내가 따른 잔을 단숨에 비웠다.');
    await say('sm_guest', '남이 따른 술은 이십 년 만이다. 점소이 손이라 그런가, 안 무섭네.', 'h');
    F().sm_drink = 'poured';
  }
  await say('sm_guest', '술값은 내가 냈다. 대회에서 이겨라. 이기면 출신을 덜 묻는다.');
  await narr('사내는 칼을 어깨에 메고 나갔다. 문 앞에 있던 손님들이 저절로 길을 비켰다.');
  await say('host', '…저 손님이랑 무슨 얘기를 하셨소? 아니, 말하지 마시오. 모르는 게 약이오.', 'b');
  ctx.note('구화성 금봉 객잔에서 덩치 큰 사내와 합석했다. 이름은 말하지 않았다. "점소이가 칼을 들면 정파냐, 사파냐?"');
}
G.r3.smDrink = smDrink;
Story.providers.push(function part3aInn(id) {
  const n = [];
  if (id === 'inn2' && after('c3b') && !after('c3e') && !F().sm_drink) n.push({ id: 'sm_guest', spr: 'Villager', x: 13, y: 5.4, dir: 0, hint: '구석 탁자', mark: () => true, talk: smDrink });
  return { npcs: n, spots: [], trigs: [], roam: [] };
});
