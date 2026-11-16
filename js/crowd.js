// 비무대회 날의 사람들: 대회가 열리는 고을에 구경꾼이 몰리고, 문파마다 출전자가 무리 지어 온다
// 이야기 3부 구화성 천하비무, 자유 모드 무림대회(js/saga.js), 강호 소식의 비무대회(js/jianghu.js) 셋 다
import { G, TS, pick } from './core.js';
import { Story, say } from './ctx.js';
import { MAPS } from './maps.js';
import { FACS } from './free.js';
import { FOES } from './foes.js';

function tourneyAt(id) {
  const S = G.S; if (!S) return null;
  if (S.mode !== 'free' && id === 'guhwa' && G.after?.('c3b') && !G.after?.('c4a')) return { key: 'gu', name: '천하비무', facs: ['hwasan', 'jongnam', 'namgung', 'dang', 'shaolin', 'wudang', 'emei', 'paeng', 'gaebang', 'moyong'] };
  const a = G.saga?.arc?.('tourney'); if (a && a.map === id) return { key: 'sg' + (a.id || ''), name: `${a.place} 무림대회`, facs: a.ent.map(e => e.fac) };
  const e = (S.fr?.ev || []).find(e => e.type === 'tourney' && e.map === id && !e.done); if (e) return { key: 'ev' + e.id, name: e.name, facs: null };
  return null;
}
// 빈 칸: 지도 가운데에서 바깥으로, 사람 사이 간격 gap칸
function open(id, n, gap, avoid = []) {
  const m = MAPS[id]; if (!m?.blocked) return []; const out = [];
  // 비무 단상(땅 5)이 있으면 단상 둘레부터 채우고 단상 위에는 세우지 않는다
  let rx = 0, ry = 0, rn = 0; for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) if (m.g[y][x] === 5) { rx += x; ry += y; rn++; }
  const cx = rn ? Math.round(rx / rn) : Math.floor(m.w / 2), cy = rn ? Math.round(ry / rn) : Math.floor(m.h * .5);
  for (let r = 1; r < Math.max(m.w, m.h) && out.length < n; r++) for (let dy = -r; dy <= r && out.length < n; dy++) for (let dx = -r; dx <= r && out.length < n; dx++) {
    if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue; const x = cx + dx, y = cy + dy; if (x < 2 || y < 2 || x > m.w - 3 || y > m.h - 3) continue;
    if ([[0, 0], [0, 1], [1, 0], [-1, 0]].some(([a, b]) => m.blocked((x + a) * TS + 8, (y + b) * TS + 8) || m.g[y + b]?.[x + a] === 5)) continue;
    if (m.portals?.some(p => Math.abs(p.x / TS - x) < 3 && Math.abs(p.y / TS - y) < 3)) continue;
    const X = x + .5 + (r % 2 ? .25 : -.25), Y = y + .5;
    if ([...out, ...avoid].some(([px, py]) => Math.hypot(px - X, py - Y) < gap)) continue; out.push([X, Y]);
  }
  return out;
}
const SEE = ['villager', 'woman', 'oldman', 'oldwoman', 'villager', 'woman'];
const SEESPR = { villager: 'Villager', woman: 'Woman', oldman: 'OldMan', oldwoman: 'OldWoman' };
const CHEER = ['화산이 다시 올라왔다더라! 매화 피는 거 보려고 사흘을 걸어왔어.', '나는 남궁에 걸었네. 은자 두 냥. 마누라한테는 비밀일세.', '어제 예선에서 칼이 부러져 날아왔다니까. 앞자리 앉지 마.', '종남이 이기면 술 한 턱 쏜다고 했는데 지면 어쩌지.',
  '저기 저 사람 봐, 소림 스님이야. 스님도 비무에 나와?', '당가 사람 옆엔 서지 마. 바람만 불어도 따끔하대.', '이번엔 이름 없는 낭인이 이긴다는 소문이 있어. 누군지는 몰라.', '아이고, 자리 좀 비켜 주시오. 앞이 하나도 안 보이네.',
  '떡 사려! 비무 보며 먹는 떡! 한 개 서 푼!', '우리 애가 커서 저 단상에 서는 게 소원이라오.', '어제 거지 하나가 개방 사람이라며 공짜로 들어오더라고. 진짜였대.', '칼 소리 날 때마다 심장이 철렁해. 그래도 보러 와.'];
// 문파 출전자: 정사마 공통 말 + 이름난 문파 말
const ALIGN = {
  jeong: ['문파의 이름을 걸고 왔소. 지면 산문으로 못 돌아가오.', '사형이 예선에서 떨어졌소. 내가 대신 올라가야 하오.', '정정당당히 겨룰 뿐이오. 구경은 자유요.'],
  sa: ['정파 놈들 콧대 꺾으러 왔지. 상금도 좀 챙기고.', '규칙? 단상 위에선 지키지. 내려오면 모르고.', '우리 쪽에도 쓸 만한 놈이 있다는 걸 보여 줄 거다.'],
  ma: ['…구경하러 왔을 뿐이다. 칼은 안 뽑는다. 오늘은.', '중원의 검이 얼마나 무딘지 보러 왔다.'],
};
const FACT = {
  hwasan: ['화산이 다시 왔다고 전하시오. 매화는 지지 않소.', '사형이 단상에서 사고 치면… 모른 척해 주시오.'],
  jongnam: ['화산 놈들 대진표가 어디요? 종남이 먼저 만나야 하오.', '섬서의 검은 종남이오. 오늘 그걸 다시 확인할 거요.'],
  namgung: ['남궁세가는 이기러 왔지, 구경하러 온 게 아니오.', '검은 곧아야 하오. 남궁의 검처럼.'],
  dang: ['독은 안 쓰오. 대회 규칙이니까. 아쉽게도.', '당가가 단상에 오르면 다들 한 걸음씩 물러나더군. 재밌소.'],
  shaolin: ['아미타불. 승부보다 수련이오. 그래도 지고 싶지는 않소.', '소승은 맨손이오. 걱정하지 마시오.'],
  wudang: ['무량수불. 이기는 것도 흐름이고 지는 것도 흐름이지요.', '무당의 원은 단상 위에서도 그려집니다.'],
  emei: ['아미의 검은 부드럽지만 꺾이지 않습니다.', '사태께서 이번엔 꼭 본선까지 가라고 하셨습니다.'],
  paeng: ['팽가의 도는 한 번이면 충분하오. 두 번 휘두를 일 없소.', '말이 많군. 도로 말하지.'],
  gaebang: ['거지도 출전한다! 밥값 벌러 왔다!', '대진표? 그런 건 우리 거지들이 제일 먼저 알지.'],
  moyong: ['모용세가는 받은 대로 돌려줍니다. 단상 위에서도요.', '이번 대회의 수준을 보러 왔습니다. 기대는 크지 않지만요.'],
  jegal: ['대진표를 보면 결승이 보이오. 우리가 거기 있소.'], hwangbo: ['황보세가가 왔소. 길을 비키시오.'], gonryun: ['곤륜에서 내려오는 데만 한 달이오. 빈손으로는 못 가오.'],
};
const facOf = id => FACS.find(f => f.id === id);
const sprOf = f => { try { const k = G.jh?.disciple?.(f, Math.max(3, G.S.lv || 3)); const s = k && FOES[k]?.spr; return s ? s.replace(/^chars\//, '') : 'Knight'; } catch { return 'Knight'; } };
const CACHE = {};
function build(id, T) {
  const ck = id + T.key; if (CACHE[ck]) return CACHE[ck];
  const n = [], K = G.mapK?.(id) || 1, AV = T.key === 'gu' ? [[24.5, 15], [13, 15], [34, 15], [20, 22], [26.5, 29], [24.5, 29]].map(([x, y]) => [x * K, y * K]) : [];  // 구화성: 심판·윤설·소연하·철우·뱃사공 자리는 비운다
  // 출전 문파 넷~다섯: 문파마다 두셋이 모여 선다
  let L = (T.facs || []).map(facOf).filter(Boolean); if (!L.length) L = FACS.filter(f => f.align !== 'ma' || Math.random() < .3).sort(() => Math.random() - .5);
  L = L.slice(0, 5); const groups = open(id, L.length, 5.5, AV);
  L.forEach((f, gi) => { const g = groups[gi]; if (!g) return; const cnt = 2 + (gi % 2), spr = sprOf(f), lines = [...(FACT[f.id] || []), ...(ALIGN[f.align] || ALIGN.jeong)];
    for (let i = 0; i < cnt; i++) n.push({ id: `tn_${f.id}_${i}`, ghost: 1, spr, x: (g[0] + (i - (cnt - 1) / 2) * 1.1) / K, y: (g[1] + (i % 2) * .4) / K, dir: [0, 2, 3][i % 3], hint: `${f.name} 출전자`, role: f.align === 'jeong' ? 'mob_jeong' : f.align === 'sa' ? 'mob_sa' : 'mob_cult', talk: async () => { await say(null, `${f.name} 출전자: ${pick(lines)}`); } }); });
  // 구경꾼: 무리 사이사이를 촘촘히 채운다
  const S = open(id, 18, 1.7, [...AV, ...groups.map(g => g || [0, 0])]);
  const m = MAPS[id]; let rx = 0, ry = 0, rn = 0; for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) if (m.g[y][x] === 5) { rx += x; ry += y; rn++; }
  const cx = rn ? rx / rn + .5 : m.w / 2, cy = rn ? ry / rn + .5 : m.h / 2, face = (x, y) => Math.abs(x - cx) > Math.abs(y - cy) ? (x < cx ? 3 : 2) : (y < cy ? 0 : 1);  // 단상 쪽을 본다
  S.forEach(([x, y], i) => { const r = SEE[i % SEE.length]; n.push({ id: `tsee_${i}`, ghost: 1, spr: SEESPR[r], role: r, x: x / K, y: y / K, dir: face(x, y), hint: '구경꾼', talk: async () => { await say(null, `구경꾼: ${pick(CHEER)}`); } }); });
  return (CACHE[ck] = n);
}
Story.providers.push(function crowd(id) {
  const T = tourneyAt(id); return { npcs: T ? build(id, T) : [], spots: [], trigs: [], roam: [] };
});
G.crowd = { tourneyAt, build };
