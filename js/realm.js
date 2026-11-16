// 경지: 상대가 어느 경지냐에 따라 능력치와 싸우는 방식이 달라진다
// 0 삼류 1 이류 2 일류 3 절정 4 초절정 5 화경 6 현경 7 생사경 (주인공 경지 이름과 같은 표 RANKS)
// - 능력치: 이름 있는 고수(가주·장문인·장로 등)는 비무·자유 모드에서 그 경지의 기준보다 약하면 기준까지 끌어올린다. 이미 센 상대와 이야기 보스는 그대로 둔다
// - 싸움: 경지가 높을수록 공격을 미리 읽고 막고, 막은 뒤 곧바로 되받아치고, 초식을 끊지 않고 잇는다. 맞아도 덜 휘청인다
// - 경지 차이: 비무·자유 모드처럼 안 싸워도 되는 싸움에서 상대가 주인공보다 높으면 더 아프게 때리고 덜 다친다
import { G } from './core.js';
import { RANKS } from './data.js';

export const NAME = RANKS.map(r => r[1]);
export const LV = RANKS.map(r => r[0]);
const at = (r, a) => a[Math.max(0, Math.min(a.length - 1, r))];
// 경지별 싸움 버릇
const GUARD = [0, .1, .3, .5, .7, .9, 1.1, 1.3];      // 막을 확률(×.4가 실제, 기존 guard 값과 같은 눈금)
const READ = [0, 0, .02, .05, .08, .12, .16, .2];      // 상대 초식을 얼마나 일찍 읽나(초)
const PERFECT = [0, 0, .1, .2, .35, .5, .65, .8];      // 막을 때 튕겨내기 확률
const COMBO = [0, .05, .15, .3, .45, .6, .7, .8];      // 초식이 끝나자마자 다음 초식을 이을 확률
const CHAIN = [0, 1, 1, 2, 2, 3, 3, 4];                // 쉬지 않고 이을 수 있는 초식 수
const PAUSE = [1.15, 1.08, 1, .92, .85, .78, .72, .65];  // 초식 사이 쉬는 틈
const STUN = [1, 1, 1, .9, .8, .65, .5, .4];           // 맞고 휘청이는 시간
const KB = [1, 1, 1, .9, .75, .6, .5, .4];             // 밀려나는 거리

// 이름 있는 상대의 경지
const BYID = {
  lion: 2, wei: 2, senior_go: 2, so_rival: 3, elder_wi: 3, fighter_a: 2, fighter_b: 3, fighter_c: 3, cheolu_spar: 3, so_final: 4, fox: 4, chief: 5, chief2: 6, demon_eye: 3,
  ogang_foe: 3, guyang_foe: 3, paeng_cap: 3, samaung_foe: 4, samaung_last: 4, makgo: 3, hyeolma: 4, hyeolma2: 4, hyeol_elite: 3, bingma: 5, cheon2: 5, gwima: 5, moon_envoy: 5,
  tianmo: 6, tianmo0: 7, majang: 3, gate_guard: 3, wanted3: 3,
  so_ally: 4, cheol_ally: 3, hyegak_ally: 5, namgung_ally: 4, clan_namgung: 4,  // 남궁진은 가주가 아니라 후계자라 초절정
  baek_ally2: 5, gwak_ally: 4, samaung_ally: 4, hyeok_ally: 4, lion_ally: 3, wei_ally: 3, ogang_ally: 3, guyang_ally: 3, go_ally9: 3,
};
// 구파일방·오대세가 대표: 셋째 줄(가주·장문인급)은 화경, 둘째 줄은 초절정, 첫째 줄은 절정
const TIER = { 1: 3, 2: 4, 3: 5 };
// 화산귀환 인물(fanchars)
export const FAN = {
  cheongmyeong: 5, baekcheon: 3, yuseol: 3, yunjong: 2, jogeol: 2, dangsoso: 1, hyeonjong: 2, hyeonyeong: 2, hyeonsang: 3, ungeom: 3, unam: 2, ungak: 3, baeksang: 2,
  jingeumryong: 3, isongbaek: 3, jongseohan: 4, gohwi: 2, gimokseung: 2, samaseung: 3, heodo: 5, heowon: 4, heosan: 4, muyeon: 2, mujin: 2, jinhyeon: 3, jinmu: 2,
  danggunak: 5, dangbo: 4, dangho: 3, danghwa: 2, dangjan: 3, dangpae: 3, hongdaegwang: 4, guchil: 2, jongpal: 2,
};
export const fanRealm = (k, title = '') => FAN[k] ?? (/장문인|가주/.test(title) ? 5 : /장로|어른/.test(title) ? 4 : 2);

// 능력치로 짐작한 경지(이름 없는 상대). 문파 제자 공식(공격 6+레벨×1.4)을 거꾸로 푼다
const lvOfAtk = atk => (atk - 6) / 1.4;
export const realmOfLv = lv => { let r = 0; for (let i = 0; i < LV.length; i++) if (lv >= LV[i]) r = i; return r; };
export function realmOf(id, f) {
  if (f.realm != null) return f.realm;
  if (BYID[id] != null) return BYID[id];
  if (/^clan_/.test(id) && f.tier) return TIER[f.tier];
  if (f.dummy) return 0;
  const r = realmOfLv(lvOfAtk(f.atk || 0));
  return f.mon ? Math.min(r, 3) : r;
}
export const playerRealm = () => realmOfLv(G.S?.lv || 1);

// 싸움에 나설 때 한 번: 능력치와 버릇을 붙인다
export function apply(a, id, f, cfg, enemy) {
  const r = realmOf(id, f); a.realm = r;
  Object.assign(a, { rGuard: Math.max(f.guard || 0, at(r, GUARD)), rRead: at(r, READ), rPerfect: at(r, PERFECT), rCombo: at(r, COMBO), rChain: at(r, CHAIN), rStun: at(r, STUN), rKb: at(r, KB), chainN: 0, dmgIn: 1 });
  if (!f.dummy) a.pause = (a.pause || 1) * at(r, PAUSE);
  if (!enemy || f.dummy) return;
  // 그 경지의 기준보다 약하면 끌어올린다(정해 둔 경지가 있는 상대만). 이야기 보스는 이미 장마다 맞춰 둔 값이라 손대지 않고 싸우는 버릇만 바꾼다
  const free = cfg.optional || G.S?.mode === 'free', named = f.realm != null || BYID[id] != null || /^clan_|^fan_/.test(id);
  if (free && named && r >= 3) {
    const L = LV[r] + 3, std = (6 + L * 1.4) * (f.boss ? 1 : .95);
    if (a.atk < std) { const k = std / a.atk; a.atk = std; a.maxHp = a.hp = Math.round(a.hp * k); if (a.maxPoise) a.maxPoise = a.poise = Math.round(a.maxPoise * Math.min(k, 1.5)); }
  }
  // 경지 차이: 안 싸워도 되는 싸움에서만(이야기 진행을 막지 않게)
  const g = Math.min(3, r - playerRealm());
  if (free && g > 0) { a.atk *= 1 + .12 * g; a.dmgIn = 1 / (1 + .15 * g); a.gap = g; }
}
