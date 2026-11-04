// 제목 화면, 주인공 만들기, 메뉴, 상점, 결과창
import { G, IMG, Input, Sound, $, $$, el, esc, toast, clamp, wait, fadeTo, TS } from './core.js';
import { SKILLS, WEAPONS, HEARTS, ITEMS, rankOf, expNeed } from './data.js';
import { newState, stats, save, load, hasSave, masteryLv, canEquip, DIFF, learn, have, give, take } from './state.js';
import { DB, ACCS, FURN, TREES, HOUSES } from './items.js';
import { icon } from './icons.js';
import { Story } from './story.js';
import { CLANS, SAPA, clansWon } from './clandata.js';

const LOOKS = [['BlueSamurai', '상투 머리'], ['Boy', '다홍 머리'], ['Villager3', '곱슬 머리'], ['Cavegirl2', '보랏빛 머리'], ['Woman', '금빛 머리'], ['Villager4', '단발 머리']];
function titleBg(c) {
  c.setTransform(1, 0, 0, 1, 0, 0); const g = c.createLinearGradient(0, 0, 0, 720); g.addColorStop(0, '#1b2348'); g.addColorStop(.62, '#4b3560'); g.addColorStop(1, '#c0694a'); c.fillStyle = g; c.fillRect(0, 0, 1280, 720);
  c.fillStyle = '#f7eecb'; c.beginPath(); c.arc(960, 170, 76, 0, 7); c.fill(); c.fillStyle = 'rgba(247,238,203,.12)'; c.beginPath(); c.arc(960, 170, 120, 0, 7); c.fill();
  const hill = (b, a, col) => { c.fillStyle = col; c.beginPath(); c.moveTo(0, 720); for (let x = 0; x <= 1280; x += 40) c.lineTo(x, b + Math.sin(x * .006 + a) * 50 + Math.sin(x * .017 + a * 2) * 20); c.lineTo(1280, 720); c.fill(); };
  hill(500, 1, '#3a2b52'); hill(570, 2.6, '#2a2038'); hill(650, 4, '#17121f');
}
export function showTitle() {
  G.scene = 'title'; G.bgDraw = titleBg; $('#hud').innerHTML = '';
  const s = $('#screen'); s.innerHTML = `<div id="title"><div class="logo">강호행</div><div class="han">江湖行</div><div class="sub">군적에서 지워진 낭인, 찢어진 비급 일곱 장</div><div class="col"><button class="btn pri" id="bNew">새로 시작</button><button class="btn" id="bLoad">이어 하기</button></div><div class="foot">도트 그림·소리: Ninja Adventure (CC0) · 글꼴: 갈무리 (OFL)</div></div>`;
  $('#bNew').onclick = () => { Sound.init(); Sound.resume(); Sound.bgm('story'); showCreate(); };
  const l = $('#bLoad'); if (!hasSave()) l.disabled = true; else l.classList.add('pri'); (hasSave() ? l : $('#bNew')).focus(); l.onclick = () => { Sound.init(); G.S = load(); s.innerHTML = ''; Story.resume(); };
}
function drawLook(cv, key) { const x = cv.getContext('2d'); cv.width = 16; cv.height = 16; x.imageSmoothingEnabled = false; const im = IMG['chars/' + key]; if (im) x.drawImage(im, 0, 0, 16, 16, 0, 0, 16, 16); }
function showCreate() {
  const s = $('#screen'); let look = 0, diff = 'normal';
  s.innerHTML = `<div class="sheet"><div class="card"><h2>어떤 낭인입니까?</h2><div class="hint">군막에서는 번호로 불렸습니다. 이름 하나만은 잊지 않았습니다.</div>
  <div class="field"><span>이름</span><input id="nm" maxlength="6" value="진소" autocomplete="off"></div>
  <div class="looks" id="lk"></div>
  <div class="field"><span>난이도</span><div class="seg" id="df"></div></div>
  <div class="hint">쉬움은 적이 약하고, 어려움은 적의 공격이 세고 체력도 많습니다. 나중에 바꿀 수 없습니다.</div>
  <div class="row"><button class="btn" id="back">돌아가기</button><button class="btn pri" id="go">시작</button></div></div></div>`;
  LOOKS.forEach(([k, n], i) => { const b = el('button', 'look' + (i === 0 ? ' on' : '')), cv = document.createElement('canvas'); drawLook(cv, k); b.appendChild(cv); b.appendChild(document.createTextNode(n)); b.onclick = () => { look = i; $$('.look').forEach((e, j) => e.classList.toggle('on', j === i)); Sound.sfx('tick'); }; $('#lk').appendChild(b); });
  for (const k of ['easy', 'normal', 'hard']) { const b = el('button', 'btn' + (k === diff ? ' on' : ''), DIFF[k].name); b.onclick = () => { diff = k; $$('#df .btn').forEach(e => e.classList.remove('on')); b.classList.add('on'); }; $('#df').appendChild(b); }
  $('#back').onclick = showTitle;
  $('#go').onclick = () => { const name = ($('#nm').value.trim() || '진소').slice(0, 6); G.S = newState(name, LOOKS[look][0], look < 3 ? 'm' : 'f', diff); s.innerHTML = ''; G.bgDraw = null; Story.begin(); };
  setTimeout(() => $('#nm').focus(), 50);
}
// ── 메뉴 ──
let tab = 'stat', slotSel = 0;
export function openMenu(t) {
  if (G.menuOpen) return; G.menuOpen = true; Input.clear(); if (t) tab = t;
  const M = $('#modal'); M.classList.add('on'); drawMenu();
  Sound.sfx('select');
}
export function closeMenu() { G.menuOpen = false; $('#modal').classList.remove('on'); $('#modal').innerHTML = ''; Input.clear(); save(); document.removeEventListener('keydown', menuKey); if (G.battle) G.battle.refreshGear(); }
function menuKey(e) { if (e.code === 'Escape' || e.code === 'KeyM') { e.preventDefault(); e.stopPropagation(); closeMenu(); } }
function drawMenu() {
  document.removeEventListener('keydown', menuKey); document.addEventListener('keydown', menuKey);
  const M = $('#modal'), S = G.S, tabs = [['stat', '상태'], ['skill', '초식 배치'], ['tree', '무공 트리'], ['gear', '장비·심법'], ['bag', '소지품'], ['clan', '강호'], ['note', '수첩'], ['love', '인연'], ['set', '설정']];
  const keep = M.querySelector('.body')?.scrollTop || 0;
  M.innerHTML = `<div class="menu"><div class="pane"><div class="tabs">${tabs.map(([k, n]) => `<button data-t="${k}" class="${k === tab ? 'on' : ''}">${n}</button>`).join('')}<button class="x">닫기 (Esc)</button></div><div class="body"></div></div></div>`;
  $$('.tabs button[data-t]', M).forEach(b => b.onclick = () => { tab = b.dataset.t; Sound.sfx('tick'); drawMenu(); });
  $('.tabs .x', M).onclick = closeMenu;
  const B = $('.body', M); ({ stat: tabStat, skill: tabSkill, tree: tabTree, gear: tabGear, bag: tabBag, clan: tabClan, note: tabNote, love: tabLove, set: tabSet })[tab](B); B.scrollTop = keep;
}
function tabStat(B) {
  const S = G.S, st = stats(), need = expNeed(S.lv);
  const line = (k, label, v, tip) => `<div class="stat"><b>${label}</b><span>${v} <small class="hint">${tip}</small></span>${S.pts > 0 ? `<button class="btn sm" data-up="${k}">+1</button>` : ''}</div>`;
  B.innerHTML = `<div class="two"><div><h2>${esc(S.name)}</h2><div class="hint">경지 <b style="color:var(--red);font-weight:400">${rankOf(S.lv)}</b> · ${S.lv}성 · 다음 깨달음까지 ${need - S.exp}</div>
  <div class="stat"><b>체력</b><span>${st.maxHp}</span></div><div class="stat"><b>내력</b><span>${st.maxMp} (초당 ${st.regen.toFixed(1)} 회복)</span></div><div class="stat"><b>공격력</b><span>${st.atk.toFixed(0)}</span></div><div class="stat"><b>방어</b><span>${st.def.toFixed(0)}</span></div><div class="stat"><b>은자</b><span>${S.silver} 냥</span></div><div class="stat"><b>금창약</b><span>${S.potion} / ${S.potionMax} 개</span></div><div class="stat"><b>내 집</b><span>${S.house.lv ? HOUSES[S.house.lv].name : '없음'}</span></div></div>
  <div><h2>능력치 ${S.pts > 0 ? `<span class="tag ult">남은 점수 ${S.pts}</span>` : ''}</h2>${line('str', '근력', S.str, '공격력')}${line('con', '근골', S.con, '체력과 방어')}${line('agi', '민첩', S.agi, '속도, 치명타, 쿨타임')}${line('inn', '내공', S.inn, '내력과 초식 위력')}
  <p class="hint" style="margin-top:12px">전투로 깨달음이 쌓이면 점수를 얻습니다. 초식은 많이 쓸수록 성이 오르고 강해집니다.</p></div></div>`;
  $$('[data-up]', B).forEach(b => b.onclick = () => { S[b.dataset.up]++; S.pts--; Sound.sfx('tick'); drawMenu(); });
}
function tabSkill(B) {
  const S = G.S; const skl = id => SKILLS[id];
  let html = `<p class="hint">위의 칸을 고르고 아래에서 초식을 누르세요. U I O P 키가 각 칸을 씁니다. 지금 무기는 <b>${WEAPONS[S.weapon].name}</b> (${WEAPONS[S.weapon].type}) 입니다. 무기가 맞지 않는 초식은 쓸 수 없습니다.</p><div class="slots">`;
  S.slots.forEach((id, i) => { const k = id && skl(id); html += `<button class="slot ${i === slotSel ? 'on' : ''} ${k ? 'fill' : ''}" data-s="${i}"><b style="font-weight:400">${'UIOP'[i]}</b> ${k ? `${k.name}<small>내력 ${k.mp} · 쿨타임 ${k.cd}초 ${!canEquip(id) ? '· 무기 안 맞음' : ''}</small>` : '<small>비어 있음</small>'}</button>`; });
  html += `</div><div class="list" style="display:grid;grid-template-columns:1fr 1fr;gap:6px">`;
  const sorted = [...S.skills].sort((a, b) => skl(a).school.localeCompare(skl(b).school));
  if (!sorted.length) html += '<p class="hint">아직 익힌 초식이 없습니다.</p>';
  for (const id of sorted) {
    const k = skl(id), on = S.slots.includes(id), ok = canEquip(id);
    html += `<button class="item ${on ? 'eq' : ''}" data-k="${id}" ${ok ? '' : 'disabled'}>${k.name}${k.han ? ` <small style="display:inline">${k.han}</small>` : ''}${k.ult ? '<span class="tag ult">절초</span>' : ''}<span class="tag">${k.w}</span><span class="tag">${masteryLv(id)}성</span><small>${k.desc} (내력 ${k.mp}, 쿨타임 ${k.cd}초)</small></button>`;
  }
  B.innerHTML = html + '</div>';
  $$('[data-s]', B).forEach(b => b.onclick = () => { slotSel = +b.dataset.s; Sound.sfx('tick'); drawMenu(); });
  $$('[data-k]', B).forEach(b => b.onclick = () => {
    const id = b.dataset.k, cur = S.slots.indexOf(id);
    if (cur >= 0) S.slots[cur] = null;
    if (cur !== slotSel) { S.slots[slotSel] = id; slotSel = (slotSel + 1) % 4; }
    Sound.sfx('accept'); drawMenu();
  });
}
function tabGear(B) {
  const S = G.S;
  let h = '<div class="two"><div><h2>무기</h2><div class="list">';
  for (const id of S.weapons) { const w = WEAPONS[id], p = S.wplus[id] || 0; h += `<button class="item ${id === S.weapon ? 'eq' : ''}" data-w="${id}">${icon(id)}${w.name}${p ? ` +${p}` : ''}<span class="tag">${w.type}</span><span class="tag">공격 ${Math.round(w.atk * (1 + p * .12))}</span><small>${w.desc}</small></button>`; }
  h += '</div></div><div><h2>장신구</h2><div class="list">';
  for (const id of S.accs || []) { const w = ACCS[id]; h += `<button class="item ${id === S.acc ? 'eq' : ''}" data-a="${id}">${w.name}<small>${w.desc}</small></button>`; }
  if (!(S.accs || []).length) h += '<p class="hint">비무에서 이기면 상대의 장신구를 가져올 수 있습니다.</p>';
  h += '</div><h2 style="margin-top:12px">심법</h2><div class="list">';
  for (const id of S.hearts) { const w = HEARTS[id]; h += `<button class="item ${id === S.heart ? 'eq' : ''}" data-h="${id}">${w.name}<small>${w.desc}</small></button>`; }
  B.innerHTML = h + '</div></div></div>';
  $$('[data-a]', B).forEach(b => b.onclick = () => { S.acc = S.acc === b.dataset.a ? null : b.dataset.a; Sound.sfx('accept'); drawMenu(); });
  $$('[data-w]', B).forEach(b => b.onclick = () => { S.weapon = b.dataset.w; S.slots = S.slots.map(id => id); Sound.sfx('accept'); drawMenu(); });
  $$('[data-h]', B).forEach(b => b.onclick = () => { S.heart = b.dataset.h; Sound.sfx('accept'); drawMenu(); });
}
function tabBag(B) {
  const S = G.S, kinds = ['요리', '선물', '보물', '물고기', '재료'], meal = S.meal && S.meal.left > 0 ? `먹은 음식: ${DB[S.meal.id].name} (전투 ${S.meal.left}번 남음)` : '먹은 음식 없음';
  let h = `<p class="hint">${meal} · 은자 ${S.silver}냥 · 금창약 ${S.potion}/${S.potionMax}</p><div class="two">`;
  const ids = Object.keys(S.inv).filter(k => DB[k]);
  if (!ids.length) h += '<p class="hint">가진 물건이 없습니다. 채집, 사냥, 낚시로 모을 수 있습니다.</p>';
  for (const kd of kinds) { const l = ids.filter(k => DB[k].kind === kd); if (!l.length) continue; h += `<div><h2>${kd}</h2><div class="list">${l.map(k => `<button class="item" ${DB[k].meal ? `data-eat="${k}"` : 'disabled style="opacity:1"'}>${icon(k)}${DB[k].name} × ${have(k)}${DB[k].meal ? '<span class="tag">먹기</span>' : ''}<small>${DB[k].desc}</small></button>`).join('')}</div></div>`; }
  B.innerHTML = h + '</div>';
  $$('[data-eat]', B).forEach(b => b.onclick = () => { const k = b.dataset.eat; take(k); S.meal = { id: k, left: 3 }; Sound.sfx('ok1'); toast(`${DB[k].name}을(를) 먹었다`); drawMenu(); });
}
let treeTab = 'sword';
export const nodeOpen = (n, tr) => !n.req.length || n.req.some(r => (G.S.tree[r] || 0) > 0);
export function learnNode(n) { const S = G.S, r = S.tree[n.id] || 0; if (r >= n.max || (S.tp || 0) < 1 || !nodeOpen(n)) return false; S.tree[n.id] = r + 1; S.tp--; return true; }
function tabTree(B) {
  const S = G.S, t = TREES.find(x => x.id === treeTab), X = c => 40 + c * 240, Y = r => 8 + r * 88;
  let lines = '', nodes = '';
  for (const n of t.nodes) { for (const q of n.req) { const p = t.nodes.find(z => z.id === q); lines += `<line x1="${X(p.c) + 100}" y1="${Y(p.r) + 34}" x2="${X(n.c) + 100}" y2="${Y(n.r) + 34}" stroke="${(S.tree[q] || 0) > 0 ? '#b5352a' : '#a8947a'}" stroke-width="4"/>`; } const r = S.tree[n.id] || 0, open = nodeOpen(n); nodes += `<button class="tnode ${r ? 'got' : ''} ${r >= n.max ? 'full' : ''}" data-n="${n.id}" ${!open || r >= n.max || !(S.tp > 0) ? 'disabled' : ''} style="left:${X(n.c)}px;top:${Y(n.r)}px"><b>${n.name}</b> <span>${r}/${n.max}</span><small>${n.desc}</small></button>`; }
  const wt = WEAPONS[S.weapon].type;
  B.innerHTML = `<div class="ttabs">${TREES.map(x => `<button class="btn sm ${x.id === treeTab ? 'pri' : ''}" data-t="${x.id}">${x.name}</button>`).join('')}<span class="hint" style="margin-left:14px">수련 점수 <b style="color:var(--red);font-weight:400">${S.tp || 0}</b> · 경지가 오를 때마다 1점</span><button class="btn sm" id="trs" style="margin-left:auto">초기화 (100냥)</button></div>${t.w && t.w !== wt ? `<p class="hint">${t.name} 트리는 ${t.name}을(를) 들었을 때만 효과가 납니다. 지금 무기는 ${wt}입니다.</p>` : ''}<div class="tree"><svg width="760" height="460">${lines}</svg>${nodes}</div>`;
  $$('[data-t]', B).forEach(b => b.onclick = () => { treeTab = b.dataset.t; Sound.sfx('tick'); drawMenu(); });
  $$('[data-n]', B).forEach(b => b.onclick = () => { if (learnNode(t.nodes.find(n => n.id === b.dataset.n))) Sound.sfx('power1'); drawMenu(); });
  $('#trs').onclick = () => { if (S.silver < 100) return; S.silver -= 100; S.tp = (S.tp || 0) + Object.values(S.tree).reduce((a, b) => a + b, 0); S.tree = {}; drawMenu(); };
}
function tabClan(B) {
  const S = G.S, row = c => { const w = S.flags['clan_' + c.id]; return `<div class="note" style="margin-bottom:6px;padding:7px 10px"><b style="font-weight:400;font-size:18px">${c.name}</b> <small class="hint">${c.han}</small>${w ? '<span class="tag ult">인정받음</span>' : ''}<div class="hint" style="line-height:1.35">${c.desc}${S.flags.boat_guhwa || w ? ` 대표 ${c.who}.` : ''}${w ? ` 전수: ${c.gift.map(id => SKILLS[id].name).join(', ')}` : ''}</div></div>`; };
  const sap = c => `<div class="note" style="margin-bottom:6px;padding:7px 10px"><b style="font-weight:400;font-size:18px">${S.flags[c.open] ? c.name : '???'}</b> ${S.flags[c.open] ? `<small class="hint">${c.han}</small><div class="hint" style="line-height:1.35">${c.desc}</div>` : ''}</div>`, demon = S.flags.cleared ? '<b style="font-weight:400;font-size:18px">천마신교</b> <small class="hint">天魔神敎</small><div class="hint">천산 너머에서 달을 먹는다는 자들.</div>' : S.flags.demon_hint ? '<b style="font-weight:400;font-size:18px">세 번째 길</b><div class="hint">백랑은 이 이름을 말하면 혀가 잘린다고 했다.</div>' : '<b style="font-weight:400;font-size:18px">???</b>';
  B.innerHTML = `<p class="hint">강호는 세 갈래다. 내 평판: 정파 ${S.rep.jeong} · 사파 ${S.rep.sa} · 인정받은 세력 ${clansWon()} / 15</p><div class="two"><div><h2>정파 · 구파일방</h2>${CLANS.filter(c => c.group === '구파일방').map(row).join('')}</div><div><h2>정파 · 오대세가</h2>${CLANS.filter(c => c.group === '오대세가').map(row).join('')}<h2 style="margin-top:12px">사파 · 흑도맹</h2>${SAPA.map(sap).join('')}<h2 style="margin-top:12px">마교</h2><div class="note">${demon}</div></div></div>`;
}
function tabNote(B) {
  const S = G.S, moon = ['moon1', 'moon2', 'moon3', 'moon4', 'moon5', 'moon6', 'moon7'];
  B.innerHTML = `<div class="two"><div><h2>월하칠식 낱장 ${S.pages.length} / 7</h2>${moon.map((id, i) => S.pages.includes(id) ? `<div class="note">${SKILLS[id].name} <small class="hint">${SKILLS[id].han}</small></div>` : `<div class="note" style="opacity:.5">제${i + 1}식 ……</div>`).join('')}</div><div><h2>적어 둔 것</h2>${S.notes.length ? S.notes.map(n => `<div class="note">${n}</div>`).join('') : '<p class="hint">아직 적어 둔 것이 없습니다.</p>'}</div></div>`;
}
function tabLove(B) {
  const S = G.S, L = G.life, list = Object.entries(L.cand).filter(([k]) => S.flags['met_' + k] || (S.love[k] || 0) > 0);
  const faces = { yun: 'Princess', so: 'RedSamurai', cheol: 'Monk2', clan_dang: 'Dang', clan_moyong: 'Moyong', clan_namgung: 'Namgung' }, desc = { yun: '청하진 약방집 딸. 말이 짧고 손이 빠르다.', so: '벽수궁 출신의 검객. 찾는 사람이 있다.', cheol: '소림에서 쫓겨난 스님. 밥값을 낸 적이 없다.', clan_dang: '사천당가의 딸. 찻잔에 손대지 말 것.', clan_moyong: '받은 것은 그대로 돌려주는 모용세가의 딸.', clan_namgung: '남궁세가의 후계자. 자존심이 높다.' };
  if (!list.length) { B.innerHTML = '<p class="hint">아직 가까운 사람이 없습니다.</p>'; return; }
  B.innerHTML = `<p class="hint">이야기는 하루 한 번, 선물도 하루 한 번. 호감 70이면 마음을 전할 수 있고, 연인이 되어 호감 100에 옥가락지와 집이 있으면 혼인을 청할 수 있습니다.</p>` + list.map(([k, c]) => `<div class="note" style="display:flex;gap:14px;align-items:center"><canvas data-f="${faces[k]}" width="38" height="38" style="width:66px;height:66px;image-rendering:pixelated"></canvas><div style="flex:1"><b style="font-weight:400;font-size:19px">${c.name}</b> <span class="tag ${S.partner === k || S.married === k ? 'ult' : ''}">${L.stageOf(k)}</span> <small class="hint">호감 ${S.love[k] || 0}</small><div class="bar" style="height:10px;margin:4px 0"><i class="val" style="width:${S.love[k] || 0}%"></i></div><div class="hint">${desc[k]}</div></div></div>`).join('');
  $$('canvas[data-f]', B).forEach(c => { const x = c.getContext('2d'); x.imageSmoothingEnabled = false; const im = IMG['faces/' + c.dataset.f]; if (im) x.drawImage(im, 0, 0); });
}
function tabSet(B) {
  B.innerHTML = `<h2>조작</h2><div class="two"><div class="note">이동 W A S D 또는 방향키<br>평타 J · 경공 K · 막기 L<br>초식 U I O P 또는 1 2 3 4<br>금창약 H · 대화 E · 메뉴 Esc</div><div class="note">막기를 맞기 직전에 누르면 <b>튕겨내기</b>가 됩니다.<br>노란 예고는 막을 수 있습니다.<br>붉은 예고는 막을 수 없으니 경공으로 피하세요.</div></div>
  <h2>생활</h2><div class="note">제작: 대장간(무기·강화·옥가락지), 약방(약), 부뚜막(요리), 작업대(가구) · 사냥: 청풍골에서 J로 활 쏘기, 사나운 짐승은 전투 · 낚시: 뱃사공에게 낚싯대를 받고 물가에서 E<br>집: 청하진 복덕방에서 구입, 집 안에서 B로 꾸미기, 침상에서 자면 다음 날 · 비무: 이기면 상대 물건 하나를 고른다 · 연애: 인연 탭의 호감 조건 참고</div>
  <h2>설정</h2><div class="row" style="justify-content:flex-start"><button class="btn" id="mute">소리 ${Sound.muted ? '켜기' : '끄기'}</button><button class="btn" id="sv">지금 저장</button><button class="btn" id="tt">제목으로</button></div>`;
  $('#mute').onclick = () => { Sound.setMuted(!Sound.muted); drawMenu(); };
  $('#sv').onclick = () => save(false);
  $('#tt').onclick = () => { save(); closeMenu(); G.field.busy = false; showTitle(); };
}
// ── 상점 ──
export function openShop(title, goods) {
  return new Promise(res => {
    G.menuOpen = true; Input.clear(); const M = $('#modal'); M.classList.add('on');
    const close = () => { G.menuOpen = false; M.classList.remove('on'); M.innerHTML = ''; Input.clear(); document.removeEventListener('keydown', k); save(); res(); };
    const k = e => { if (e.code === 'Escape') { e.preventDefault(); e.stopPropagation(); close(); } }; document.addEventListener('keydown', k);
    const draw = () => {
      const S = G.S;
      M.innerHTML = `<div class="menu"><div class="pane" style="width:820px"><div class="tabs"><button class="on">${title}</button><button class="x">나가기 (Esc)</button></div><div class="body"><p class="hint">가진 은자 ${S.silver} 냥</p><div class="list" id="gl"></div></div></div></div>`;
      $('.x', M).onclick = close;
      goods.forEach(g => {
        const d = g.info(), owned = g.owned && g.owned();
        const b = el('button', 'item', `${d.name}<span class="tag">${owned ? '가지고 있음' : d.price + ' 냥'}</span><small>${d.desc}</small>`);
        b.disabled = owned || S.silver < d.price;
        b.onclick = () => { S.silver -= d.price; g.buy(); Sound.sfx('coin'); draw(); };
        $('#gl', M).appendChild(b);
      });
    };
    draw();
  });
}
export const shopItem = {
  weapon: id => ({ info: () => { const w = WEAPONS[id]; return { name: `${w.name} (${w.type})`, price: w.price, desc: `공격 ${w.atk}. ${w.desc}` }; }, owned: () => G.S.weapons.includes(id), buy: () => { G.S.weapons.push(id); G.S.weapon = id; toast(`${WEAPONS[id].name}을(를) 들었다`); } }),
  potion: () => ({ info: () => ({ name: '금창약', price: ITEMS.hp.price, desc: `전투 중 H 키로 체력을 35% 되찾는다. 지금 ${G.S.potion}개` }), buy: () => { G.S.potion++; } }),
  stuff: (id, price) => ({ info: () => ({ name: DB[id].name, price, desc: `${DB[id].desc} 지금 ${have(id)}개` }), buy: () => give(id) }),
  furn: id => ({ info: () => ({ name: FURN[id].name, price: FURN[id].price, desc: `가구. 꾸밈 점수 ${FURN[id].score}. 가진 수 ${G.S.house.furn[id] || 0}` }), buy: () => { G.S.house.furn[id] = (G.S.house.furn[id] || 0) + 1; } }),
  book: (id, price) => ({ info: () => ({ name: `비급: ${SKILLS[id].name}`, price, desc: `[${SKILLS[id].w}] ${SKILLS[id].desc}` }), owned: () => G.S.skills.includes(id), buy: () => learn(id) }),
  heart: (id, price) => ({ info: () => ({ name: `심법서: ${HEARTS[id].name}`, price, desc: HEARTS[id].desc }), owned: () => G.S.hearts.includes(id), buy: () => { G.S.hearts.push(id); toast(`${HEARTS[id].name}을(를) 익혔다. 메뉴에서 고르세요.`, 3); } }),
};
// 전투 결과
export function showResult(r) {
  return new Promise(res => {
    if (G.auto) return res();
    const h = $('#hud'), e = el('div', 'result');
    e.innerHTML = `<h2>승리</h2><p>깨달음 +${r.exp}${r.silver ? ` · 은자 +${r.silver}냥` : ''}</p>${r.drops && r.drops.length ? `<p>${r.drops.join(', ')}</p>` : ''}${r.levelUp ? `<p style="color:var(--red)">경지가 깊어졌다! ${G.S.lv}성 (${rankOf(G.S.lv)})<br>메뉴에서 능력치와 무공 트리를 올리세요.</p>` : ''}<p class="hint">E 또는 누르기</p>`;
    h.appendChild(e); if (r.levelUp) Sound.sfx('ok3');
    let done = false; const go = () => { if (done) return; done = true; e.remove(); document.removeEventListener('keydown', kd); res(); };
    const kd = ev => { if (['KeyE', 'Enter', 'Space', 'KeyJ'].includes(ev.code)) go(); }; document.addEventListener('keydown', kd); e.onclick = go; e.style.pointerEvents = 'auto';
  });
}
export function choiceLose() {
  return new Promise(res => {
    if (G.auto) return res('retry');
    const h = $('#hud'), e = el('div', 'result');
    e.innerHTML = `<h2>패배</h2><p>정신을 차려 보니 아직 숨은 붙어 있다.</p><div class="row" style="justify-content:center"><button class="btn pri" id="rt">다시 도전</button><button class="btn" id="mn">초식 고치고 도전</button></div>`;
    h.appendChild(e); e.style.pointerEvents = 'auto';
    $('#rt').onclick = () => { e.remove(); res('retry'); };
    $('#mn').onclick = () => { e.remove(); openMenu('skill'); const t = setInterval(() => { if (!G.menuOpen) { clearInterval(t); res('retry'); } }, 100); };
  });
}
