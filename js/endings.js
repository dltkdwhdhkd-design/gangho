// 결말 열둘: 마지막 보기(객잔/이끎/천산/떠남) 위에 누가 살았나와 편을 얹어 이름을 정한다. 본 결말은 세이브와 따로 적는다
import { G, ART } from './core.js';
import { ctx, say, narr } from './ctx.js';

const F = () => G.S.flags, side = () => G.S.side || 'jeong', fate = () => G.fate;
const KEY = 'gangho_endings';
// 위에서부터 따져 처음 맞는 것. hint는 못 본 결말에 보이는 귀띔
export const ENDINGS = [
  { id: 'two', name: '두 그릇', hint: '형을 부르고, 닦고, 국을 들고 가라', ok: c => c === 0 && F().fate_wolcheon === 'alive' },
  { id: 'redmoon', name: '붉은 달', hint: '천마 편에서 끝까지', ok: () => side() === 'ma' && !!F().ma_side_end },
  { id: 'full', name: '만석', hint: '여덟 사람이 모두 객잔에 앉는다', ok: c => c === 0 && fate().dead8() === 0 && fate().alive8() >= 8 && (F().table_good || 0) >= 2 },
  { id: 'empty', name: '빈 상', hint: '객잔에 돌아왔는데 상이 비었다', ok: c => c === 0 && fate().dead8() >= 5 },
  { id: 'inn', name: '점소이', hint: '객잔으로 돌아간다', ok: c => c === 0 },
  { id: 'lord_j', name: '맹주', hint: '정파 길에서 앞에 선다', ok: c => c === 1 && side() === 'jeong' },
  { id: 'lord_s', name: '산채의 큰 칼', hint: '사파 길에서 앞에 선다', ok: c => c === 1 && side() === 'sa' },
  { id: 'lord_m', name: '문을 잠근 교주', hint: '마교 길에서 앞에 선다', ok: c => c === 1 && side() === 'ma' },
  { id: 'lord_f', name: '합석 어른', hint: '어느 깃발도 없이 앞에 선다', ok: c => c === 1 },
  { id: 'gate', name: '문지기', hint: '천산에 남는다', ok: c => c === 2 },
  { id: 'alone', name: '번호 없는 사람', hint: '아무도 없이 다시 떠난다', ok: c => c === 3 && side() === 'free' && fate().dead8() >= 5 && !Object.values(G.S.love || {}).some(v => v >= 80) },
  { id: 'road', name: '그믐의 낭인', hint: '다시 떠난다', ok: c => c === 3 },
];
// 덧붙는 결말(다른 결말과 같이 기록)
export const EXTRA = [{ id: 'ash', name: '일곱 장의 재', hint: '낱장을 태운다' }];
const ALL = [...ENDINGS, ...EXTRA];

const seen = () => { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; } };
const mark = id => { try { const s = seen(); if (!s.includes(id)) { s.push(id); localStorage.setItem(KEY, JSON.stringify(s)); } } catch { } };
const seenText = () => { const s = seen(); return `${s.length} / ${ALL.length} · ` + ALL.map(e => s.includes(e.id) ? e.name : '…').join(', '); };
const pick = c => ENDINGS.find(e => e.ok(c)) || ENDINGS.find(e => e.id === 'road');

const LEAD = { jeong: '맹주 자리는 내가 맡았다. 맨 처음 한 일은 맹주 창고 지하를 메운 것이었다.', sa: '흑도맹은 큰 칼 앞에서 맹세한 뒤로 양민의 쌀을 건드리지 않는다.', ma: '남은 신도들을 데리고 제단의 불을 껐다. 제단 자리에 달맞이꽃을 심었다.', free: '깃발 없는 사람이 정파와 사파 사이에 앉는 자리가 생겼다. 다들 나를 합석 어른이라고 불렀는데, 그 말이 제일 듣기 싫었다.' };
const CGOF = { full: 'end_table', inn: 'end_table', empty: 'end_table', two: 'end_table', lord_j: 'end_jeong', lord_s: 'end_sa', lord_m: 'end_ma', lord_f: 'end_free', gate: 'end_ma', road: 'end_free', alone: 'end_free', redmoon: 'end_ma' };
const SCENE = {
  full: async () => {
    await narr('달맞이 객잔 지붕을 다시 올리던 날, 상이 모자랐다. 마당에 멍석을 깔고 문짝을 떼어 상을 폈다. 정파 사람 옆에 사파 사람이 앉았고, 아무도 자리를 바꾸지 않았다.');
    await say('gwak', '{나}야! 국수 모자란다! 손님이 왜 이렇게 많아!', 'a');
    await say('me', '아주머니가 다 부르셨잖아요.', 'h');
    await say('gwak', '…그래. 내가 불렀다. 빈자리 하나 없네.', 's');
  },
  inn: async () => {
    await narr('달맞이 객잔 지붕을 다시 올렸다. 나는 아침마다 바닥을 닦고 손님상에 국수를 나른다. 상 몇 개는 늘 비워 둔다. 앉을 사람이 없는 자리다.');
    await say('gwak', '{나}야! 거기서 뭐 해! 해가 중천이다!', 'a');
    await say('me', '바닥 닦았는데요.', 'h');
    await say('gwak', '이게 닦은 거야? …됐다. 밥 먹어.', 'h');
  },
  empty: async () => {
    await narr('객잔은 다시 열었는데 손님이 없었다. 저녁이면 곽 아주머니와 둘이 마주 앉아 국수를 먹었다. 상 위에 젓가락을 몇 벌씩 더 놓았다. 아무도 치우라고 하지 않았다.');
    await say('gwak', '소금 모자라다.', 's');
    await say('me', '네.', 's');
  },
  two: async () => {
    await narr('달맞이 객잔 지붕을 다시 올렸다. 그믐날 저녁이면 나는 국수를 두 그릇 더 만다. 하나는 문간에 앉은 형 몫이다. 형은 아직 말이 적고, 머리는 하얀 채다.');
    await say('cheon', '…소금이 모자라다.', 'h');
    await say('gwak', '그 소리는 내가 한다, 이놈들아.', 'h');
    await narr('남은 한 그릇은 뒷마당 우물가에 놓는다. 아침이면 그릇이 비어 있다. 바람이 먹었는지, 배고팠던 누가 먹었는지는 묻지 않기로 했다.');
  },
  lord_j: async () => { await narr(LEAD.jeong); await narr('일 년에 한 번은 달맞이 객잔에 들른다. 어느 자리에 앉아 있든 곽 아주머니는 걸레부터 던져 준다.'); },
  lord_s: async () => {
    if (fate().of('samaung') === 'alive') await narr('사마웅이 큰 칼을 내 손에 쥐여 주었다. 형제 열둘한테 혼날 날이 멀어졌으니 칼은 젊은 놈이 들라고 했다.');
    else await narr('사마웅의 큰 칼은 산채 마당에 꽂아 두었다. 나는 그 칼을 뽑지 않았다.');
    await narr(LEAD.sa); await narr('일 년에 한 번은 달맞이 객잔에 들른다. 곽 아주머니는 산적 두목한테도 걸레부터 던져 준다.');
  },
  lord_m: async () => { await narr(LEAD.ma); await narr('교단 사람들은 나를 교주라고 부르지 않는다. 걸레 든 사람이라고 부른다.'); },
  lord_f: async () => { await narr(LEAD.free); },
  gate: async () => {
    if (fate().of('baek') === 'alive') await narr('천산 돌문 앞에 움막을 지었다. 백 노인과 둘이서 아침마다 돌계단을 닦는다. 노인은 내 왼발이 아직도 늦다고 한다.');
    else await narr('천산 돌문 앞에 움막을 지었다. 백 노인이 쓰던 술병을 옆에 두고, 아침마다 돌계단을 닦는다. 사흘만 안 닦아도 먼지가 앉는다.');
  },
  road: async () => { await narr('칼 한 자루를 메고 새벽에 나루를 나섰다. 이번에는 갈 데가 없어서 떠나는 게 아니었다. 강호 어디서든 그믐날 밤이면 나무패도 번호도 없는 낭인 하나가 묵었다 간다는 얘기가 돌았다.'); },
  alone: async () => {
    await narr('아는 얼굴들이 하나씩 없어졌다. 칼 한 자루를 메고 나루를 나섰다. 스무 살 봄에 내렸던 그 나루였다.');
    await narr('배에서 내리는 사람 하나가 사흘은 굶은 얼굴이었다. 나는 그 사람에게 위쪽 객잔에 가면 국수를 판다고 일러 주었다. 칼은 잡혀도 된다고.');
  },
  redmoon: async () => {
    await narr('달은 지지 않았다. 붉은 달 아래서 강호는 조용해졌다. 다들 배가 불렀고, 다들 아무것도 원하지 않았다.');
    await narr('달맞이 객잔 문은 닫혀 있다. 곽 아주머니는 내가 오는 날이면 문을 걸어 잠근다. 문틈으로 국수 냄새만 났다.');
  },
};

async function play(c) {
  const e = pick(c); F().ending9 = e.id; mark(e.id);
  ctx.cg(ART.get('cg_end_' + e.id) ? 'end_' + e.id : CGOF[e.id] || 'end_free');  // 결말 그림이 오면 그 그림, 없으면 가까운 그림
  await SCENE[e.id]();
  if (F().pages_burned) { mark('ash'); await narr('월하칠식 일곱 장은 객잔 부뚜막에서 태웠다. 곽 아주머니가 국물을 올리는 불이었다. 재는 우물가에 묻었다.'); }
  for (const t of fate().lines()) await narr(t);
  ctx.cgOff();
  if (!G.auto) await narr(`결말 「${e.name}」`);
  return e;
}
G.endings = { ENDINGS, EXTRA, pick, play, seen, seenText, mark };
