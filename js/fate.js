// 운명: 선택에 따라 사람이 죽고, 떠나고, 따라온다. 값은 따로 저장하지 않고 깃발에서 계산한다(옛 세이브도 그대로 통한다)
// 새로 정해지는 운명은 fate_<id> 깃발에 적는다(옛 깃발보다 앞선다). 계획: docs/master-plan.md A
import { G, toast } from './core.js';

const F = () => G.S.flags;
const af = s => !!G.after?.(s);  // 이야기 단계가 s를 지났나
const side = () => G.S.side || 'jeong';
// id: 이름, key8(주요 여덟), met(만났나), v(깃발로 정한 값, 아직 모르면 null), 결말에 쓰는 한 줄
export const FATE = {
  wei: { name: '위충', key8: 1, met: () => F().wei_spared !== undefined || af('c1e'),
    v: f => f.wei_spared ? (f.jg_late === 'wc' ? 'lost' : 'alive') : af('c1e') ? 'lost' : null,
    why: f => f.wei_spared ? (f.jg_late === 'wc' ? '무창 나루에 늦게 닿아, 혼자 나루를 막다 크게 다쳤다' : '청하진 나루에서 살려 보냈다') : '관아로 넘겼다',
    dead: '위충은 끝내 오지 않았다. 장강 어디쯤에서 뒤집힌 배 한 척이 발견됐다는 얘기만 들었다.',
    alive: '위충은 장강수로채를 떠나 청하진 나루에서 나룻배를 몬다. 뱃삯은 반값이고, 점소이에게는 받지 않는다.',
    lost: '위충은 무창 나루를 혼자 막다 다리 하나를 못 쓰게 됐다. 그 뒤로는 강에 나가지 않는다고 했다.' },
  lion: { name: '맹호', key8: 1, met: () => af('c1f'), v: f => f.lion_debt ? 'alive' : af('c1g') ? 'lost' : null,
    why: f => f.lion_debt ? '흑풍채에서 목숨값을 남겨 두었다' : '산적질을 그만두라고 했다',
    dead: '맹호는 객잔 대숲 문 앞에서 쓰러졌다. 도끼는 끝까지 오른손에 쥐여 있었다. 흑풍채 목책 앞에 그 도끼를 꽂아 두었다.',
    alive: '맹호는 흑풍채를 밭으로 갈아엎었다. 산에 농사지을 땅이 없다더니 감자가 잘 된다고 했다.',
    lost: '맹호는 그 뒤로 산에서 내려오지 않았다. 녹림 놈들은 빚이 없으면 찾아오지도 않는다.' },
  cheol: { name: '철우', key8: 1, met: () => !!F().met_cheol || af('c3d'), v: f => f.cheol_dead ? 'dead' : f.cheol_arm ? 'alive' : null,
    why: f => f.cheol_dead ? (f.moss_extra && G.S.sworn === 'cheol' ? '달빛이끼를 넉넉히 캐느라 소림에 사흘 늦었다' : '서로 의를 맺지 않아 혼자 산문을 지켰다') : '의를 맺고 곁에 섰다. 왼팔을 잃었다',
    dead: '철우는 소림 경내에 묻혔다. 파계승의 무덤으로는 처음이었다. 그 앞에는 언제나 만두가 놓여 있는데, 누가 놓는지는 아무도 말하지 않는다.',
    alive: '철우는 소림 산문 옆에 국숫집을 냈다. 젓가락은 못 쥐어서 손님 것을 빌려 먹는다.' },
  doc: { name: '윤 의원', key8: 1, met: () => af('c1b'), v: f => f.doc_dead ? 'dead' : f.fate_doc || null,
    why: f => f.doc_dead ? '혈우 약을 먼저 먹어 보고 사흘을 넘기지 못했다' : '넉넉히 캔 달빛이끼로 약을 묽게 먼저 시험했다',
    dead: '윤씨 약방 간판은 그대로다. 윤설이 아버지 글씨를 떼지 않았다.',
    alive: '윤 의원은 아직도 왕진을 다닌다. 받은 아이가 사백을 넘었다고 한다.' },
  baek: { name: '백 노인', key8: 1, met: () => af('c1a'), v: f => f.baek_gone ? 'dead' : f.fate_baek || (af('w4') && !f.baek_live ? 'dead' : null),
    why: f => f.fate_baek === 'alive' ? '월천의 가면 조각으로 돌문을 닫았다' : f.baek_live ? '돌문을 지키다 쓰러졌다' : '월하곡에서 그날 밤을 넘기지 못했다',
    dead: '백 노인의 마지막 봉투는 곽 아주머니에게 드렸다. 아주머니는 세어 보지도 않고 장부에 ‘갚음’이라고 적었다.',
    alive: '백 노인은 그믐마다 객잔에 와서 방값을 낸다. 이자는 아직도 깎아 달라고 한다.' },
  hyegak: { name: '혜각 대사', key8: 1, met: () => af('c3a'), v: f => f.hyegak_dead ? 'dead' : f.fate_hyegak || null, why: f => f.hyegak_dead ? '흑도맹의 일감으로 내 칼에 쓰러졌다' : '합석에서 사마웅에게 사과했다',
    dead: '소림 장경각 앞에 혜각의 이름은 없다. 혜명이 올리지 않았다.', alive: '혜각 대사는 십칠 년 전 깃발을 든 일을 장경각 벽에 새겨 두었다. 지우지 말라고 했다.' },
  go: { name: '고진', key8: 1, met: () => af('c2b'), v: f => f.go_dead ? 'dead' : f.fate_go || null,
    why: f => f.go_dead ? (f.fate_go === 'dead' ? '객잔 방어전에서 무너진 문을 혼자 지켰다' : '마교의 시험으로 내 칼에 쓰러졌다') : '위문상의 일을 먼저 알려 주었다',
    dead: '창운산 매화나무 아래 고진의 칼이 묻혔다. 사제들 칼 옆이다.', alive: '고진은 창운문 문주가 되었다. 제자들에게 목인 앞에서 칼보다 걸레를 먼저 쥐여 준다.' },
  samaung: { name: '사마웅', key8: 1, met: () => af('c4e') || !!F().jg_samaung, v: f => f.samaung_dead ? 'dead' : f.fate_samaung || null,
    why: f => f.fate_samaung === 'alive' ? '살려 보낸 오강과 구양철이 다리 위에 같이 섰다' : '흑운궁 다리를 혼자 막았다',
    dead: '흑풍채 마당에 사마웅의 큰 칼이 꽂혀 있다. 흑도맹은 그 칼 앞에서 맹세한다.', alive: '사마웅은 다리에서 살아 나왔다. 형제 열둘한테 혼날 날이 미뤄졌다며 투덜댔다.' },
  // 주요 여덟 밖
  jang: { name: '장팔', met: () => !!F().jang_bond, v: f => f.fate_jang || (f.jang_bond ? 'alive' : null), why: f => f.fate_jang === 'lost' ? '동쪽 산길에 늦어 피난민 마을과 집이 탔다' : '창운산에서 같이 물을 길었다',
    lost: '장팔은 불탄 마을을 다시 짓느라 객잔에 오지 못했다. 소는 끝내 못 샀다고 했다.', dead: '장팔이 사려던 소는 내가 샀다. 이름은 형씨라고 지었다. 장팔이 그러자고 했었다.', alive: '' },
  ogang: { name: '오강', met: () => !!F().jg_ogang, v: f => f.jg_ogang === 'spared' ? 'alive' : f.jg_ogang === 'bound' ? 'dead' : null,
    why: f => f.jg_ogang === 'spared' ? '무창 나루에서 살려 보냈다' : '정천맹에 넘겼고, 맹은 그를 처형했다', dead: '', alive: '' },
  guyang: { name: '구양철', met: () => !!F().jg_guyang, v: f => f.jg_guyang === 'saved' ? 'alive' : f.jg_guyang === 'burned' ? 'lost' : null,
    why: f => f.fate_guyang === 'dead' ? '객잔 방어전에서 산길 쪽 문을 혼자 지켰다' : f.jg_guyang === 'saved' ? '팽가 토벌대의 횃불을 막아 주었다' : '산채가 타는 것을 보고 지나갔다', dead: '녹림 칠십이채는 구양철의 도끼를 객잔 우물가에 묻었다. 해마다 감자 한 자루가 그 앞에 놓인다.', alive: '', lost: '' },
  hwasan_elder: { name: '화산 장문인', met: () => !!F().jg_late, v: f => f.jg_late === 'mk' ? 'dead' : f.jg_mk ? 'alive' : null,
    why: f => f.jg_late === 'mk' ? '구파 회관에 늦게 닿아 혈의방에 암살당했다' : '구파 회관 밤 경비를 섰다', dead: '화산은 장문인을 잃고 한동안 문을 닫았다. 종남과의 다툼은 끝내 풀리지 않았다.', alive: '' },
  hyeok: { name: '혁련하', met: () => af('c3f') || !!F().gu_hyeok, v: f => f.hyeok_join ? 'join' : f.fate_hyeok || null, why: () => '교단을 떠나 합석에 왔다', alive: '' },
  wolcheon: { name: '월천', met: () => af('c4a'), v: f => f.cheon_end ? (f.fate_wolcheon === 'alive' ? 'alive' : 'dead') : null,
    why: f => f.fate_wolcheon === 'alive' ? '이름을 불렀고, 걸레질로 끝냈고, 국 한 그릇을 들고 갔다' : '붉은 빛을 대신 맞았다',
    dead: '월천의 칼은 월하곡 물가에 꽂아 두었다. 그믐이면 그 앞에 국수 한 그릇을 놓는다.', alive: '' },
  town: { name: '촌장', met: () => af('c1a'), v: f => f.fate_town || null, why: () => '아무도 서지 않은 문으로 마장이 들이쳤다', dead: '촌장 어른은 객잔 우물 옆에 묻혔다. 늙은이는 맨 뒤에 있으라더니, 거기가 맨 앞이었다.' },
};
export const KEY8 = Object.keys(FATE).filter(k => FATE[k].key8);
const LABEL = { alive: '살아 있음', dead: '죽음', lost: '떠남', join: '따라옴' };

function of(id) {
  const e = FATE[id], f = F(); if (!e) return 'alive';
  if (f['fate_' + id]) return f['fate_' + id];
  return e.v(f) || 'alive';
}
const known = id => { const e = FATE[id], f = F(); return !!(f['fate_' + id] || (e.met() && e.v(f))); };
// 운명을 정한다. 깃발(fate_<id>)과 기록을 남기고, 작게 알린다
function set(id, v, why) {
  const s = G.S; F()['fate_' + id] = v; (s.fateLog = s.fateLog || []).push({ id, v, why: why || '', chap: s.chapter || '' });
  if (!G.auto) toast('이 일은 나중에 돌아온다', 2.4);
}
// 운명이 갈리는 순간을 알리기만 한다(값은 옛 깃발이 정할 때)
const mark = () => { if (!G.auto) toast('이 일은 나중에 돌아온다', 2.4); };
const dead8 = () => KEY8.filter(k => of(k) === 'dead').length;
const alive8 = () => KEY8.filter(k => ['alive', 'join'].includes(of(k))).length;
// 결말에 내보낼 줄: 죽은 사람 먼저, 그다음 산 사람
function lines() {
  const out = [];
  for (const k of Object.keys(FATE)) { if (!known(k)) continue; const v = of(k), t = FATE[k][v]; if (t && (v === 'dead' || v === 'lost')) out.push(t); }
  for (const k of Object.keys(FATE)) { if (!known(k)) continue; const v = of(k), t = FATE[k][v === 'join' ? 'alive' : v]; if (t && (v === 'alive' || v === 'join')) out.push(t); }
  return out;
}
// 메뉴 "인연의 실"
function tab(B) {
  const f = F(), L = Object.keys(FATE).filter(known);
  const row = k => { const v = of(k), e = FATE[k]; return `<div class="note"><b>${e.name}</b> <span class="hint" style="color:${{ dead: '#b0302a', lost: '#8a6420', join: '#2f7a3a', alive: '#2a5f96' }[v]}">${LABEL[v]}</span><br><small class="hint">${e.why?.(f) || ''}</small></div>`; };
  const log = (G.S.fateLog || []).slice(-8).reverse();
  B.innerHTML = `<div class="two"><div><h2>인연의 실</h2>${L.length ? L.map(row).join('') : '<p class="hint">아직 갈린 일이 없다.</p>'}<p class="hint">정해진 것만 적힌다. 앞으로 어떻게 될지는 적히지 않는다.</p></div>
    <div><h2>갈린 때</h2>${log.length ? log.map(x => `<div class="note">${FATE[x.id]?.name || x.id} · ${LABEL[x.v] || x.v}<br><small class="hint">${x.chap}</small></div>`).join('') : '<p class="hint">…</p>'}
    <h2 style="margin-top:14px">본 결말</h2><p class="hint">${G.endings ? G.endings.seenText() : ''}</p></div></div>`;
}
G.fate = { of, set, mark, known, dead8, alive8, lines, tab, FATE, KEY8, side };
