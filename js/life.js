import { currentRefinement, refinements, refitPrice, refitWeapon } from './refinements.js';
import { compareGear, gearRatings, numberText, projectGear } from './gear-comparison.js';
import { fanCandidates } from './fan-bonds.js';
import { withBondScene, outingPlace } from './cg.js';
import { factionOptions } from './faction-talk.js';
import { companionDialogue } from './companion-dialogue.js';
import { roadCompanions } from './road-companions.js';
// 생활: 제작, 채집, 사냥, 낚시, 집, 연애, 결혼, 비무 전리품
import { G, Input, Sound, $, $$, el, esc, toast, clamp, rnd, rint, pick, fadeTo, TS, josa } from './core.js';
import { Story, ctx, say, narr, choice } from './ctx.js';
import { WHO } from './dialog.js';
import { have, give, take, nextDay, save, stats, canRomance } from './state.js';
import { DB, ACCS, FISH, FURN, HOUSES, RECIPES, LOOT } from './items.js';
import { WEAPONS } from './data.js';
import { GRADES, weaponGrade, plusCap, fxText } from './gear.js';
import { FOES } from './foes.js';
import { buildHouse } from './maps.js';
import { canReachHouseExit } from './landing.js';
import { STAMPS } from './tiles.js';
import { icon, iconUrl, nameOf, descOf } from './icons.js';
import { showResult } from './ui.js';

const S = () => G.S, F = () => G.S.flags;
// 글을 받아 적는 창
export function askText(title, hint, def, max = 10) {
  if (G.auto) return Promise.resolve(def);
  return panel(title, (B, r, close) => {
    B.innerHTML = `<p class="hint">${esc(hint)}</p><div class="field"><input id="askv" maxlength="${max}" autocomplete="off" style="flex:1;min-width:0;width:auto"> <button class="btn pri" id="askok" style="flex:none;white-space:nowrap">정한다</button></div>`;
    B.closest('.pane').style.height = 'auto'; const i = $('#askv', B), ok = () => close(i.value.trim() || def); i.value = def; setTimeout(() => { i.focus(); i.select(); }, 300);
    $('#askok', B).onclick = ok; i.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.isComposing) { e.preventDefault(); e.stopPropagation(); ok(); } });
  }, 560).then(v => v || def);
}
ctx.ask = askText;
// 범용 창
export function panel(title, draw, width = 820) {
  return new Promise(res => {
    G.menuOpen = true; Input.clear(); const M = $('#modal'); M.classList.add('on');
    const k = e => { if (e.code === 'Escape') { e.preventDefault(); e.stopPropagation(); close(); } };
    const close = v => { G.menuOpen = false; M.classList.remove('on'); M.innerHTML = ''; Input.clear(); document.removeEventListener('keydown', k); save(); res(v); };
    document.addEventListener('keydown', k);
    const redraw = () => { const keep = M.querySelector('.body')?.scrollTop || 0; M.innerHTML = `<div class="menu"><div class="pane" style="width:${width}px"><div class="tabs"><button class="on">${title}</button><button class="x">닫기 (Esc)</button></div><div class="body"></div></div></div>`; $('.x', M).onclick = () => close(); const B = $('.body', M); draw(B, redraw, close); B.scrollTop = keep; };
    redraw();
  });
}
const needText = r => Object.entries(r.need).map(([k, n]) => `<span style="color:${have(k) >= n ? 'inherit' : 'var(--red)'}">${DB[k].name} ${have(k)}/${n}</span>`).join(' · ') + (r.silver ? ` · 은자 ${r.silver}냥` : '');
export const canCraft = r => Object.entries(r.need).every(([k, n]) => have(k) >= n) && S().silver >= r.silver;
export function craft(r) {
  if (!canCraft(r)) return false;
  for (const [k, n] of Object.entries(r.need)) take(k, n);
  S().silver -= r.silver; const o = r.out;
  if (o.weapon) { if (!S().weapons.includes(o.weapon)) S().weapons.push(o.weapon); }
  if (o.item) give(o.item); if (o.potion) S().potion += o.potion; if (o.maxpotion) { S().potionMax += 1; S().potion++; }
  if (o.furn) S().house.furn[o.furn] = (S().house.furn[o.furn] || 0) + 1;
  Sound.sfx('ok1'); return true;
}
const outName = r => { const o = r.out; return o.weapon ? WEAPONS[o.weapon].name : o.item ? DB[o.item].name : o.potion ? `금창약 ${o.potion}개` : o.maxpotion ? '금창약 최대치 +1' : FURN[o.furn].name; };
const outDesc = r => { const o = r.out; return o.weapon ? `[${WEAPONS[o.weapon].type}] 공격 ${WEAPONS[o.weapon].atk}` : o.item ? DB[o.item].desc : o.potion ? '전투에서 쓰는 약' : o.maxpotion ? '쉬고 나면 채워지는 금창약이 늘어난다' : `가구. 꾸밈 점수 ${FURN[o.furn].score}`; };
export function plusCost() { const p = S().wplus[S().weapon] || 0; return { p, need: { ore_iron: (p + 1) * 2, ore_blue: p }, silver: (p + 1) * 40 }; }
export function openCraft(at, title) {
  return panel(title, (B, redraw) => {
    const list = el('div', 'list');
    if (at === 'forge') {
      const s=S(),id=s.weapon,w=WEAPONS[id],base=gearRatings(s);
      const c=plusCost(),full=c.p>=plusCap(id),canPay=()=>s.silver>=c.silver &&
        Object.entries(c.need).every(([k,n])=>have(k)>=n);
      const next={...s,wplus:{...s.wplus,[id]:c.p+1}};
      const detail=full ? GRADES[weaponGrade(id)].name+' 등급의 강화 한도' :
        needText({need:Object.fromEntries(Object.entries(c.need).filter(([,n])=>n>0)),silver:c.silver});
      const attack=full?'':' · 실제 공격력 '+numberText(base.atk)+' → '+numberText(gearRatings(next).atk);
      const b=el('button','item',icon(id)+w.name+' 강화 +'+c.p+(full?'':' → +'+(c.p+1))+'<small>'+detail+attack+'</small>');
      b.dataset.upgrade=id;b.disabled=full || !canPay();
      b.onclick=()=>{
        if (s.weapon!==id || (s.wplus[id] || 0)!==c.p || full || !canPay()) return;
        for (const [k,n] of Object.entries(c.need)) if (n) take(k,n);
        s.silver-=c.silver;s.wplus[id]=c.p+1;Sound.sfx('power1');toast(w.name+' +'+(c.p+1));redraw();
      };
      list.appendChild(b);
      const price=refitPrice(id), active=s.refinements?.[id];
      list.appendChild(el('h3','forge-heading','무기 개조 · '+(currentRefinement(s,id)?.name || '기본형')));
      for (const [key,form] of Object.entries(refinements[w.type])) {
        const projected={...s,refinements:{...s.refinements,[id]:key}};
        const payment=key===active?'적용 중':DB[price.material].name+' '+price.count+'개 · 은자 '+price.silver+'냥';
        const btn=el('button','item'+(active===key?' eq':''),form.name+'<small>'+fxText(form.fx)+' · '+payment+'</small>'+compareGear(s,projected,base));
        btn.dataset.refit=key;
        btn.disabled=active===key || s.silver<price.silver || have(price.material)<price.count;
        btn.onclick=()=>{if (refitWeapon(s,id,key)) {Sound.sfx('power1');redraw();}};
        list.appendChild(btn);
      }
      if (active) {
        const reset=el('button','btn sm','기본형으로 복원 · 무료');reset.dataset.refit='reset';
        reset.onclick=()=>{if (refitWeapon(s,id,null)) redraw();};list.appendChild(reset);
      }
      list.appendChild(el('h3','forge-heading','제작'));
    }
    for (const r of RECIPES.filter(q => q.at === at)) {
      const owned = r.out.weapon && S().weapons.includes(r.out.weapon);
      const b = el('button', 'item', `${r.out.weapon ? icon(r.out.weapon) : r.out.item ? icon(r.out.item) : ''}${outName(r)}${owned ? '<span class="tag">가지고 있음</span>' : ''}<small>${outDesc(r)}<br>${needText(r)}</small>${r.out.weapon && !owned?compareGear(S(),projectGear(S(),'weapon',r.out.weapon)):''}`);
      b.disabled = owned || !canCraft(r); b.onclick = () => { craft(r); toast(`${josa(outName(r), '을/를')} 만들었다`); redraw(); }; list.appendChild(b);
    }
    B.innerHTML = `<p class="hint">가진 은자 ${S().silver}냥</p>`; B.appendChild(list);
  });
}
export function openSell() {
  return panel('물건 팔기', (B, redraw) => {
    const ids = Object.keys(S().inv).filter(k => DB[k] && DB[k].sell);
    B.innerHTML = `<p class="hint">가진 은자 ${S().silver}냥. 누르면 하나씩 팝니다.</p>`; const l = el('div', 'list');
    if (!ids.length) l.innerHTML = '<p class="hint">팔 물건이 없습니다.</p>';
    for (const k of ids) { const b = el('button', 'item', `${icon(k)}${DB[k].name} × ${have(k)}<span class="tag">${DB[k].sell}냥</span>`); b.onclick = () => { take(k); S().silver += DB[k].sell; Sound.sfx('coin'); redraw(); }; l.appendChild(b); }
    B.appendChild(l);
  });
}
// ── 채집 ──
const GATHER = {
  bamboo: [['herb', 'fern1', 6, 12], ['herb', 'fern1', 26, 12], ['shoot', 'fern2', 20, 21], ['shoot', 'fern2', 14, 12], ['herb', 'fern1', 34, 22]],
  pass: [['ore_iron', 'boulder', 15, 10], ['ore_iron', 'boulder', 24, 9], ['ore_iron', 'boulder', 33, 8], ['ore_iron', 'boulder', 31, 20]],
  fort: [['ore_iron', 'boulder', 31, 7], ['ore_iron', 'boulder', 5, 20]],
  valley: [['wood', 'stump', 8, 8], ['wood', 'stump', 12, 22], ['wood', 'stump', 27, 6], ['wood', 'stump', 33, 24], ['herb', 'fern1', 6, 14], ['herb', 'fern1', 28, 20], ['honey', 'flower4', 35, 7], ['ginseng', 'flower1', 4, 25]],
  cloudmt: [['ore_blue', 'boulder', 7, 9], ['ore_blue', 'boulder', 39, 16], ['ore_blue', 'boulder', 14, 32], ['herb', 'fern1', 32, 32], ['jade', 'boulder', 41, 28]],
  wolha: [['ore_star', 'boulder', 38, 25], ['ginseng', 'flower1', 6, 34], ['jade', 'boulder', 36, 8]],
};
function gather(mapId, i, g) {
  return async () => { const n = g[0] === 'ginseng' || g[0] === 'ore_star' || g[0] === 'jade' ? 1 : rint(1, 3); give(g[0], n); S().daily[`g_${mapId}_${i}`] = 1; Sound.sfx('select'); toast(`${DB[g[0]].name} ${n}개를 얻었다`); };
}
// ── 사냥 ──
export const ANIMALS = { rabbit: { name: '산토끼', spr: 'ani/rabbit', drops: [['meat', 1], ['hide', 1]] }, pheasant: { name: '꿩', spr: 'ani/pheasant', drops: [['meat', 1], ['feather', 2]] }, deer: { name: '노루', spr: 'ani/deer', drops: [['meat', 2], ['hide', 2], ['antler', 1]], speed: 84 }, piglet: { name: '멧돼지 새끼', spr: 'ani/piglet', drops: [['meat', 3], ['hide', 1]] }, badger: { name: '오소리', spr: 'ani/badger', drops: [['meat', 1], ['fur', 2]] } };
Object.assign(FOES.boar, { drops: [['meat', .9, 1, 2], ['hide', .7, 1, 2]] }); Object.assign(FOES.snake, { drops: [['venom', .7, 1, 1]] }); Object.assign(FOES.raccoon, { drops: [['fur', .7, 1, 1], ['meat', .5, 1, 1]] }); Object.assign(FOES.bamboo, { drops: [['shoot', .8, 1, 2], ['wood', .6, 1, 2]] }); Object.assign(FOES.bandit, { drops: [['ore_iron', .3, 1, 1]] }); Object.assign(FOES.raccoon_king, { drops: [['fur', 1, 3, 4], ['honey', 1, 1, 2]] }); Object.assign(FOES.disciple, { drops: [['ore_blue', .3, 1, 1]] }); Object.assign(FOES.skull, { drops: [['ore_star', .08, 1, 1]] });
// ── 낚시 ──
function pickFish(loc) { const t = FISH[loc], sum = t.reduce((a, b) => a + b[1], 0); let r = rnd(sum); for (const f of t) { r -= f[1]; if (r <= 0) return f; } return t[0]; }
export function fishing(loc) {
  return new Promise(res => {
    const [id, , hard] = pickFish(loc), done = ok => { G.menuOpen = false; M.classList.remove('on'); M.innerHTML = ''; Input.clear(); removeEventListener('pointerup', up); if (ok) { give(id); S().fishLog[id] = (S().fishLog[id] || 0) + 1; Sound.sfx('bonus'); toast(`${josa(DB[id].name, '을/를')} 낚았다!`, 2.6); } else toast('물고기가 달아났다'); save(); res(ok); };
    if (G.auto) { give(id); S().fishLog[id] = 1; return res(true); }
    G.menuOpen = true; Input.clear(); const M = $('#modal'); M.classList.add('on');
    M.innerHTML = `<div class="fishing"><div class="fmsg" id="fm">찌를 던졌다…</div><div class="ftrack" id="ft" style="display:none"><div class="fzone" id="fz"></div><img class="ffish" id="ff" src="${iconUrl(id)}" alt=""></div><div class="fprog" id="fpw" style="display:none"><i id="fp"></i></div><div class="hint" style="color:#efe3c8" id="fh">입질이 오면 E (또는 화면 누르기)</div></div>`;
    let hold = false, phase = 'wait', t = rnd(1.1, 3.2), last = performance.now(), zy = .5, zv = 0, fy = .5, ft = .5, nt = 0, prog = .3; const zh = .3 - hard * .03, sp = .35 + hard * .22;
    const up = () => { hold = false; }; addEventListener('pointerup', up); M.onpointerdown = () => { hold = true; if (phase === 'bite') phase = 'go'; };
    const loop = now => {
      const dt = Math.min(.05, (now - last) / 1000); last = now; const press = Input.down.ok || Input.down.atk || hold;
      if (phase === 'wait') { t -= dt; if (t <= 0) { phase = 'bite'; t = .9; $('#fm').textContent = '입질이다!'; Sound.sfx('alert'); } }
      else if (phase === 'bite') { t -= dt; if (press) phase = 'go'; else if (t <= 0) return done(false); }
      if (phase === 'go') { phase = 'play'; $('#ft').style.display = 'block'; $('#fpw').style.display = 'block'; $('#fm').textContent = DB[id].sell >= 60 ? '묵직하다!' : '당겨라!'; $('#fh').textContent = '누르고 있으면 초록 칸이 올라갑니다. 물고기를 칸 안에 두세요.'; }
      if (phase === 'play') {
        zv += (press ? 1.9 : -1.5) * dt; zv = clamp(zv, -.9, .9); zy += zv * dt; if (zy < zh / 2) { zy = zh / 2; zv = 0; } if (zy > 1 - zh / 2) { zy = 1 - zh / 2; zv = 0; }
        nt -= dt; if (nt <= 0) { nt = rnd(.5, 1.3); ft = rnd(.08, .92); } fy += clamp(ft - fy, -sp * dt, sp * dt);
        const inside = Math.abs(fy - zy) < zh / 2; prog = clamp(prog + (inside ? .3 : -.2) * dt, 0, 1);
        $('#fz').style.cssText = `bottom:${(zy - zh / 2) * 100}%;height:${zh * 100}%;background:${inside ? '#58c878' : '#c8a848'}`; $('#ff').style.bottom = `calc(${fy * 100}% - 16px)`; $('#fp').style.width = prog * 100 + '%';
        if (prog >= 1) return done(true); if (prog <= 0) return done(false);
      }
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  });
}
async function fishSpot(loc) {
  if (!F().rod) { await say(null, '물고기가 보인다. 낚싯대가 있어야 한다. 나루터 뱃사공이라면 하나 있을지도 모른다.'); return; }
  await fishing(loc);
}
// ── 집 ──
export function houseScore() { return S().house.items.reduce((a, i) => a + FURN[i.id].score, 0); }
export function enterHouse() { buildHouse(S()); }
async function sleep() {
  const c = await choice('잠을 잘까? 하루가 지나고 채집물이 다시 난다.', ['잔다', '그만둔다']); if (c) return;
  await fadeTo(1); nextDay(); const sc = houseScore(); if (sc >= 60) { S().rested = S().day; } if (sc >= 150) S().potion = Math.max(S().potion, S().potionMax + 2); await fadeTo(0);
  toast(`${S().day}일째 아침${sc >= 60 ? ' · 편히 잤다 (공격력 +5%)' : ''}`, 3); Sound.sfx('ok1');
  if (S().married) { await say(S().married, pick(CAND[S().married].wife)); give(pick(['noodle', 'rice_ball', 'skewer'])); toast('아침상을 받았다'); }
}
async function furnAct(a) {
  if (a === 'bed') await sleep();
  if (a === 'cook') await openCraft('cook', '부뚜막 · 요리');
  if (a === 'bench') await openCraft('bench', '작업대 · 가구 제작');
  if (a === 'book') { if (S().daily.book) { await say(null, '오늘은 더 읽히지 않는다.'); return; } S().daily.book = 1; const { gainExp } = await import('./state.js'); gainExp(20 + S().lv * 4); await say(null, '비급을 뒤적이며 하루치 깨달음을 얻었다.'); }
  if (a === 'dummy') await ctx.duel({ foes: ['dummy'], arena: 'yard', title: '목인장 수련', bgm: 'peaceful', survive: 25, expMul: 0, tip: '25초 동안 초식을 시험합니다.' });
}
export function openDecor() { G.decor = { sel: null, cx: 3, cy: 3 }; drawDecor(); toast('꾸미기: 가구를 고르고 놓을 곳을 누르세요. 놓인 가구를 누르면 치웁니다.', 3.5); }
function drawDecor() {
  let p = $('#decor'); if (!p) { p = el('div', 'decor'); p.id = 'decor'; $('#screen').appendChild(p); }
  const H = S().house, ids = Object.keys(H.furn).filter(k => H.furn[k] > 0);
  p.innerHTML = `<h3>꾸미기 · 점수 ${houseScore()}</h3><div class="hint" style="color:#e2d2ae">60점이면 편히 잠, 150점이면 금창약 추가</div><div class="list">${ids.map(k => `<button class="item ${G.decor.sel === k ? 'on' : ''}" data-f="${k}">${FURN[k].name} × ${H.furn[k]}</button>`).join('') || '<p class="hint" style="color:#e2d2ae">가진 가구가 없습니다. 만물상이나 작업대에서 구하세요.</p>'}</div><button class="btn sm" id="dx" style="margin-top:8px">끝내기 (Esc)</button>`;
  $$('[data-f]', p).forEach(b => b.onclick = () => { G.decor.sel = b.dataset.f; drawDecor(); });
  $('#dx', p).onclick = closeDecor;
}
export function closeDecor() { G.decor = null; $('#decor')?.remove(); save(); G.field.refresh(); }
const size = id => { const s = STAMPS[FURN[id].stamp]; return [Math.ceil(s[3] / TS), Math.ceil(s[4] / TS)]; };
export function canPlace(id, x, y) {
  const m = HOUSES[S().house.lv], [w, h] = size(id);
  if (x < 1 || y < 1 || x + w > m.w - 1 || y + h > m.h - 2) return false;
  const f=G.field, state=S(), previous=G.decor?.preview;
  if (previous && previous.map===f.m && previous.px===f.p.x && previous.py===f.p.y &&
      previous.id===id && previous.x===x && previous.y===y) return previous.ok;
  const overlaps=state.house.items.some(i => { const [a,b]=size(i.id); return x<i.x+a && x+w>i.x && y<i.y+b && y+h>i.y; });
  let ok=false;
  if (!overlaps) {
    const house={...state.house,items:[...state.house.items,{id,x,y}]};
    const candidate=buildHouse({...state,house},false);
    ok=canReachHouseExit(candidate,f.p.x,f.p.y) &&
      !f.npcs.some(n=>!n.ghost && !f.m.blocked(n.x,n.y) && candidate.blocked(n.x,n.y));
  }
  if (G.decor) G.decor.preview={map:f.m,px:f.p.x,py:f.p.y,id,x,y,ok};
  return ok;
}
export function placeAt(x, y) {
  const d = G.decor, H = S().house, f = G.field, hit = H.items.findIndex(i => { const [a, b] = size(i.id); return x >= i.x && x < i.x + a && y >= i.y && y < i.y + b; });
  if (d.sel) { if (!(H.furn[d.sel]>0) || !canPlace(d.sel, x, y)) { Sound.sfx('cancel'); toast('가구가 겹치거나 사람이 지날 길이 막히는 자리입니다.'); return; } H.items.push({ id: d.sel, x, y }); H.furn[d.sel]--; if (!H.furn[d.sel]) d.sel = null; Sound.sfx('accept'); }
  else if (hit >= 0) { const it = H.items.splice(hit, 1)[0]; H.furn[it.id] = (H.furn[it.id] || 0) + 1; d.sel = it.id; Sound.sfx('tick'); } else return;
  f.m=buildHouse(S());d.preview=null;f.refresh();drawDecor();
}
async function realtor() {
  const lv = S().house.lv, nx = HOUSES[lv + 1];
  if (!nx) { await say('realtor', '더 큰 집은 없소.'); return; }
  await say('realtor', lv ? `지금 집을 ${josa(nx.name, '으로/로')} 넓히겠소? ${nx.price}냥이오.` : `이 집 비어 있소. 곽 아주머니 객잔이 다시 서기까지 머물 곳이 필요하지 않소? ${nx.price}냥이오.`);
  const c = await choice(`${nx.name} ${nx.price}냥 · 가진 돈 ${S().silver}냥`, ['산다', '그만둔다']);
  if (c) return;
  if (S().silver < nx.price) { await say('realtor', '돈이 모자라오.'); return; }
  S().silver -= nx.price; S().house.lv = lv + 1; F().own_house = true; if (!lv) { S().house.furn.bed = 1; S().house.furn.stool = 2; S().house.furn.bench = 1; S().house.furn.stove = 1; } Sound.sfx('ok3');
  await say('realtor', '집문서요. 침상과 부뚜막, 작업대는 같이 드리겠소.'); toast('집을 얻었다! 들어가서 꾸미기를 눌러 보세요.', 3);
}
// ── 호감, 연애, 결혼 ──
export const CAND = {
  ...roadCompanions, ...fanCandidates,
  igyeom: {
    name: '서이겸', loves: ['poem', 'eel_rice', 'silver_cup'], likes: ['tea', 'wood', 'f_crucian'], hates: ['venom', 'sachet'],
    chat: ['배를 묶을 땐 한 번에 풀릴 매듭을 써요. 그래야 불난 집에 사람을 태우러 갈 수 있거든요.', '강 한가운데서 노래하면 꼭 건너편까지 들려요. 지난번엔 아침밥 먹으라는 답이 왔습니다.', '{나} 씨 발소리는 다리 널 세 번째에서 알아요. 거기만 밟으면 삑 소리가 나거든요.', '오늘은 지도를 접어 뒀어요. 당신이 어디로 걷는지 한번 따라가 보고 싶어서.'],
    date: ['배에 누워 갈대 끝을 보았다. 노가 떠내려간 줄 알고 벌떡 일어났더니 이겸이 발등으로 꼭 붙들고 있었다.', '이겸에게 매듭을 배웠다. 마지막 매듭은 서로의 손목에 묶었다. 나루에 닿을 때까지 둘 다 풀 줄 모르는 척했다.'],
    confess: ['다음 물때까지 기다리면 무슨 말을 할지 정해질 줄 알았어요. 물때만 세 번 바뀌었네요.', '좋아합니다, {나} 씨. 내일은 배 핑계 안 대고 보러 갈게요.'],
    propose: ['노를 놓고 받겠습니다. 이건 두 손으로 받고 싶어요.', '나랑 살아 줘요. 물 건너 장을 보러 가는 날에도, 그냥 집에 있는 날에도.'],
    house: '같이 신 벗을 문턱 하나는 직접 골라요. 집을 정하면 나도 데려가 줘요.',
    wife: ['처마 밑 방울 들었어요? 바람이 아니라 내가 당겼어요. 일어났나 보고 싶어서.', '오늘 밥엔 생강을 덜 넣었어요. 어제 당신 물을 세 잔이나 마시더라고.', '내일은 첫배를 남한테 맡겼어요. 눈 뜨면 옆에 있을게요.'],
  },
  yun: { name: '윤설', likes: ['tea', 'herb', 'poem', 'honey'], loves: ['ginseng', 'antler', 'hairpin'], hates: ['venom', 'f_catfish'], ...companionDialogue.yun },
  so: { name: '소연하', likes: ['plum_wine', 'skewer', 'hairpin'], loves: ['ore_star', 'poem', 'ginseng_soup'], hates: ['sachet', 'sweets'], ...companionDialogue.so },
  cheol: { name: '철우', likes: ['meat', 'skewer', 'noodle'], loves: ['plum_wine', 'ginseng_soup', 'eel_rice'], hates: ['tea', 'herb'], chat: ['시주, 오늘은 뭘 드셨소? 나는 아직이오.', '부처님도 배고프면 드셨을 것이오.', '소림 산문은 내가 부쉈지만 고치는 건 못 봤소.', '아우, 오늘 저잣거리 만두가 싸다더군. 같이 가세.', '계율이 서른 개쯤 있었는데 지금은 셋만 지키오. 셋이면 충분하오.', '아우는 밥을 너무 빨리 먹소. 군막 버릇이지? 천천히 드시게.', '소림에서 날 찾는다는 소문이 있소. 찾거든 만두나 사 오라고 하시게.', '염불은 배고플 때 해야 진심이 들어가오.', '아우 등 뒤는 내가 보겠소. 앞은 아우가 보고.'], date: ['철우와 시장을 돌며 만두를 먹었다. 값은 내가 냈다.', '철우가 강에 뛰어들어 맨손으로 잉어를 잡았다. 저녁이 해결됐다.', '철우가 불경을 외우다 잠들었다. 코 고는 소리가 불경보다 낭랑했다.'], sworn: ['시주… 아니, 아우. 내 평생 밥을 사 준 사람은 그대뿐이오.', '소승은 이미 파계한 몸이니 걸릴 것도 없소. 오늘부터 형제요.'] },
  baekrang: { name: '백랑', likes: ['plum_wine', 'silver_cup', 'sachet'], loves: ['gold_cup', 'hairpin', 'f_gold'], hates: ['herb', 'tea'], ...companionDialogue.baekrang },
  hyeok: { name: '혁련하', chat0: ['향을 피우면 잠이 오십니까. 저는 잘 오지 않습니다.', '국수라는 것을 먹어 보았습니다. 맛있었습니다.', '이 성은 사람이 많습니다. 다들 어디로 가는지 모르겠습니다.'], likes: ['poem', 'tea', 'sachet'], loves: ['ginseng', 'hairpin', 'antler'], hates: ['meat', 'noodle'], ...companionDialogue.hyeok },
  clan_dang: { name: '당소연', likes: ['venom', 'herb', 'sachet'], loves: ['antler', 'ginseng', 'hairpin'], hates: ['sweets', 'noodle'], ...companionDialogue.clan_dang },
  clan_moyong: { name: '모용설', likes: ['poem', 'tea', 'silver_cup'], loves: ['hairpin', 'gold_cup', 'f_gold'], hates: ['meat', 'hide'], ...companionDialogue.clan_moyong },
  clan_namgung: { name: '남궁선', likes: ['silver_cup', 'gold_cup', 'tea'], loves: ['ore_star', 'plum_wine', 'poem'], hates: ['meat', 'f_crucian'], ...companionDialogue.clan_namgung },
};
const THANKS = {
  ...Object.fromEntries(Object.entries(roadCompanions).map(([id,c]) => [id,c.thanks])),
  igyeom: ['내 배에서 제일 마른 칸을 비워 둬야겠네요. 정말 고마워요.', '마침 필요했어요. 내일 배에 싣고 갈게요.', '받을게요. 다음 건 내 차례예요.', '향이 세면 물 냄새를 놓쳐서요. 마음은 알겠습니다.'],
  yun: ['이걸 어떻게 알았어요? 제일 좋아하는 거예요.', '고마워요. 잘 쓸게요.', '고맙게 받을게요.', '…이걸 저한테요?'], so: ['어떻게 알았어? 이거 진짜 좋아해.', '오, 괜찮네. 고마워.', '고마워. 받아 둘게.', '이런 건 안 좋아해.'], cheol: ['시주! 부처님이 오셨소!', '고맙소. 잘 먹겠소.', '고맙소. 먹는 거요?', '이건 입에 안 맞소.'],
  baekrang: ['이걸 어떻게 구했어요? 소문 값으로 쳐 줄게요.', '오, 값이 나가겠는데요. 고마워요.', '받아 둘게요.', '이건 팔아도 안 남겠네요.'], hyeok: ['…제가 이것을 좋아한다는 것을 어찌 아셨습니까.', '고맙습니다.', '받겠습니다.', '이것은 교리에 맞지 않습니다.'],
  clan_dang: ['…어떻게 알았어요? 조사했어요?', '쓸 만하네요. 고마워요.', '받아 둘게요. 독은 안 넣었겠죠?', '이건 제가 독을 넣어도 못 살리겠어요.'], clan_moyong: ['이런 것은 돌려드리기 아깝구려. 고맙소.', '받았소. 언젠가 돌려드리겠소.', '고맙소. 예법대로 받겠소.', '이것은 그대로 돌려드리겠소.'], clan_namgung: ['…탐나는 물건이다. 어떻게 구했지?', '나쁘지 않군. 고맙다.', '받아 두지.', '남궁에 이런 것을 가져오다니.'],
};
const friendChat = {
  igyeom: ['왼쪽 여울은 깊어 보여도 바로 밑이 돌이에요. 장대를 먼저 짚고 건너요.', '배가 한 척 더 들어왔어요. 짐 풀고 나서 노 젓는 시합이나 합시다.', '매듭 둘이면 깊은 물. 기억하고 있죠? 오늘은 {나} 씨가 뱃머리를 잡아요.'],
  yun: ['그 붕대는 물에 적시지 마요. 약 바른 쪽이 씻겨 나가요.', '약방 문을 한 시진만 봐 줄래요? 왕진을 다녀올게요.'],
  so: ['칼자루를 너무 꽉 잡았어. 손 펴 봐. 그래, 그렇게.', '오늘은 내가 목검을 들게. 어제 진 쪽이 술 사기로 한 건 기억하지?'],
  clan_dang: ['이 풀하고 저 풀의 잎맥이 달라요. 하나는 상처에 붙이고 하나는 벌레 잡는 데 써요.', '바늘통 뚜껑에 홈을 냈어요. 밤에도 손끝으로 골라 쓸 수 있게요.'],
  clan_moyong: ['그대의 보법을 따라 해 봤소. 돌길에서는 마지막 한 걸음을 짧게 놓는구려.', '서고에 새 필사본이 들었소. 다 읽고 그대에게도 빌려주겠소.'],
  clan_namgung: ['손목을 먼저 내밀면 검끝이 늦는다. 다시 해 봐라.', '검끈을 갈았다. 헌 끈은 목검에 감으면 딱이다.'],
  baekrang: ['저 사람은 거짓말할 때 주사위 대신 찻잔을 굴려요. 다음 판에 잘 봐요.', '소문 값은 그대로예요. 벗한테는 틀린 소문을 먼저 걸러 주죠.'],
  hyeok: ['장에 가면 돌아오는 길부터 살펴봅니다. 오늘은 혼자서도 찾았습니다.', '엿장수의 가위 소리가 들립니다. 우리도 한 봉지 사서 나눕시다.'],
};
function chatLines(id) {
  const c = CAND[id];
  if (c.chat0 && !F().cross) return c.chat0;
  if (canRomance(id)) {
    if (S().married === id) return c.wife;
    if (S().partner === id && c.loverChat) return c.loverChat;
    if (G.bond.done(id) >= 2 && c.closeChat) return c.closeChat;
    return c.chat;
  }
  return friendChat[id] || (G.bond.done(id) >= 2 && c.closeChat) || c.chat;
}
const isSworn = (id,s=S())=>s.sworn===id || (s.swornBonds||[]).includes(id);
function kinName(id) {
  const same=S().gender===(CAND[id].gender||'m');
  return same ? (S().gender==='f'?'의자매':'의형제') : '의남매';
}
export const stageOf = id => {
  const s = S(), l = s.love[id] || 0, eligible = canRomance(id, s);
  if (isSworn(id,s)) return kinName(id);
  if (eligible && s.married === id) return '부부';
  if (eligible && s.partner === id) return '연인';
  if (l >= 70) return eligible ? '각별한 사이' : '막역한 벗';
  return l >= 40 ? '가까운 벗' : l >= 15 ? '친구' : '아는 사이';
};
const addLove = (id, n) => { G.S.love[id] = clamp((G.S.love[id] || 0) + n, 0, 100); F()['met_' + id] = true; };
async function giveGift(id) {
  const ids = Object.keys(S().inv).filter(k => DB[k] && ['선물', '요리', '물고기', '재료', '보물'].includes(DB[k].kind));
  const pickId = await panel('무엇을 줄까?', (B, r, close) => { const l = el('div', 'list'); for (const k of ids) { const b = el('button', 'item', `${icon(k)}${DB[k].name} × ${have(k)}<small>${DB[k].desc}</small>`); b.onclick = () => close(k); l.appendChild(b); } if (!ids.length) l.innerHTML = '<p class="hint">줄 만한 물건이 없습니다.</p>'; B.appendChild(l); });
  if (!pickId) return;
  take(pickId); S().daily['gift_' + id] = 1; const c = CAND[id], v = c.loves.includes(pickId) ? 15 : c.likes.includes(pickId) ? 8 : c.hates.includes(pickId) ? -5 : 3;
  addLove(id, v); Sound.sfx(v > 0 ? 'secret' : 'cancel');
  await say(id, (THANKS[id] || c.thanks || ['내가 좋아하는 걸 기억했군요. 잘 받겠습니다.','마침 필요했습니다.','고맙습니다.','이건 다음 사람을 위해 두시지요.'])[v >= 15 ? 0 : v >= 8 ? 1 : v > 0 ? 2 : 3]);
}
async function confess(id) {
  if (!canRomance(id) || S().partner || S().married) return;
  const c = CAND[id]; await say('me', c.confessLead || '당신을 좋아해요. 앞으로 어떤 사이로 지낼지, 당신 마음도 듣고 싶어요.'); for (const l of c.confess) await say(id, l);
  S().partner = id; Sound.sfx('ok3'); toast(`${josa(c.name, '과/와')} 연인이 되었다`, 3); ctx.note(`${josa(c.name, '과/와')} 연인이 되었다.`);
}
async function propose(id) {
  if (!canRomance(id) || S().partner !== id || S().married) return;
  const c = CAND[id];
  if (!F().own_house) { await say(id, c.house); return; }
  if (have('jade_ring') < 1) { await say('me', '(옥가락지가 있어야 한다. 대장간에서 옥돌로 만들 수 있다.)'); return; }
  take('jade_ring');
  await withBondScene(id,'proposal',async()=>{
    await say('me', c.promiseLead || '저랑 혼인해 주세요.', 'b');
    for (const line of c.propose) await say(id,line);
  });
  return withBondScene(id,'wedding',async()=>{
  ctx.cg('wedding'); await narr(`${F().inn_rebuilt ? '달맞이 객잔 마당에 혼례상이 차려졌다.\n뱃사공 노씨는 술도 안 마셨는데 울었고, 대장장이 강씨가 술을 돌렸다.\n곽 아주머니는 그날만큼은 밥값을 받지 않았다.' : '청하진 사람들이 내 집 마당에 혼례상을 차렸다.\n뱃사공 노씨는 술도 안 마셨는데 울었고, 대장장이 강씨가 술을 돌렸다.\n곽 아주머니 자리는 비워 두었다.'}\n\n${josa(S().name, '과/와')} ${josa(c.name, '은/는')} 부부가 되었다.`); ctx.cgOff();
  S().married = id; addLove(id, 100); Sound.sfx('ok3'); toast('혼인했다! 배우자가 집에서 기다린다.', 3.5); G.field.refresh();
  });
}
async function swear(id) {
  const c=CAND[id]; if(isSworn(id)||S().partner===id||S().married===id)return;
  await say('me','앞으로는 서로의 집안일을 제 일처럼 여기고 싶습니다. 저와 의를 맺어 주시겠습니까?');
  for(const l of c.sworn)await say(id,id==='cheol'&&S().gender==='f'?l.replace('형제요','남매요'):l);
  S().swornBonds=[...new Set([...(S().swornBonds||[]),S().sworn,id].filter(Boolean))];S().sworn ||= id; Sound.sfx('ok3'); const line = `${josa(c.name, '과/와')} ${stageOf(id)}를 맺었다`; toast(line, 3); ctx.note(line + '.');
}
async function romance(id, base) {
  const c = CAND[id], s = S(), L = s.love[id] || 0, d = s.daily, eligible = canRomance(id, s), opts = [];
  if (c.fan) {
    opts.push(['일상 대화를 나눈다',async()=>{
      await say(id,eligible&&s.married===id?pick(c.wife):G.fan.chat(id));
      if(!d['chat_'+id]){d['chat_'+id]=1;addLove(id,3);}
    }]);
    opts.push([G.fan.accepts(id)?'비무를 청한다':'지도 대련을 청한다',()=>G.fan.spar(id)]);
  } else opts.push(['이야기한다', async () => { if (base) await base(); if (!d['chat_' + id]) { d['chat_' + id] = 1; addLove(id, 3); await say(id, pick(chatLines(id))); } else if (!base) await say(id, pick(eligible && s.married === id ? c.wife : chatLines(id))); }]);
  if (id.startsWith('clan_')) {
    const f=G.free?.fac(id.slice(5));
    if(f)opts.push(...factionOptions(f,id));
  }
  if (!d['gift_' + id]) opts.push(['선물을 준다', () => giveGift(id)]);
  if (((eligible && s.partner === id) || (c.sworn && isSworn(id))) && !d['date_' + id]) opts.push([isSworn(id) ? '밥을 먹으러 간다' : '나들이를 간다', async () => { d['date_' + id] = 1; addLove(id, 7); const i = Math.floor(Math.random()*c.date.length); await withBondScene(id,'outing',()=>narr(c.date[i]),outingPlace(id,i,c.outingScene),i); }]);
  if (c.sworn && L>=70 && !isSworn(id) && s.partner!==id && s.married!==id && G.bond.done(id)>=3) {
    opts.push([kinName(id)+'를 맺는다',()=>withBondScene(id,'oath',()=>swear(id),c.oathScene)]);
  }
  if (eligible && !isSworn(id)) {
    if (L>=70 && !s.partner && !s.married && G.bond.done(id)>=3)opts.push(['마음을 전한다',()=>withBondScene(id,'confess',()=>confess(id))]);
    if (s.partner===id && !s.married && L>=100) opts.push(['혼인을 청한다',()=>propose(id)]);
  }
  { const q = G.party.loveOpt(id); if (q) opts.push(q); }
  opts.push(['그만둔다', async () => { }]);
  const k = await choice(`${c.name} · ${stageOf(id)} (호감 ${L})${c.fan?' · '+G.fan.power(id):''}`, opts.map(o => o[0]),id); await opts[k][1]();
}
Story.wrapNpc = n => {
  if (!CAND[n.id]) return; const base = n.talk, m0 = n.mark;
  n.mark = () => (m0 && m0()) || !!G.bond.next(n.id);
  n.talk = async () => { if(CAND[n.id].fan||n.id.startsWith('clan_'))F()['met_'+n.id]=true;
    if (m0 && m0() && (!n.id.startsWith('clan_') || G.ch?.hook(n.id))) return base(); if (G.bond.next(n.id)) return G.bond.play(n.id); await romance(n.id, base); };
};
for (const id in CAND) if (!WHO[id]) WHO[id] = { name: CAND[id].name };
WHO.igyeom.face = 'Igyeom';
for (const [id,c] of Object.entries(roadCompanions)) WHO[id].face = c.spr;
// ── 비무 전리품 ──
export const FOE_LOOT = { senior_go: ['blue_sword', 'silver_cup', 'tea'], so_rival: ['sachet', 'plum_wine', 'silver_cup'], fighter_a: ['iron_gauntlet', 'ore_blue', 'silver_cup'], fighter_b: ['ghost_blade', 'hide', 'silver_cup'], fighter_c: ['dragon_spear', 'ore_blue', 'gold_cup'], cheolu_spar: ['iron_gauntlet', 'meat', 'sweets'], so_final: ['poem', 'hairpin', 'gold_cup'] };
export function giveLoot(id) {
  const s = S(); s.taken[id] = true;
  if (WEAPONS[id]) { if (!s.weapons.includes(id)) s.weapons.push(id); else s.silver += 50; }
  else if (ACCS[id]) { (s.accs = s.accs || []).push(id); } else give(id, DB[id].kind === '재료' ? 3 : 1);
  Sound.sfx('bonus'); toast(`${josa(nameOf(id), '을/를')} 가져왔다`, 2.6);
}
export function lootPick(name, ids, onPick) {
  const claim=id=>{giveLoot(id);onPick?.(id);return id;};
  ids = ids.filter((v, i, a) => a.indexOf(v) === i);
  if (G.auto) { return Promise.resolve(claim(ids[0])); }
  return panel(`${name}의 소지품 · 하나를 고른다`, (B, r, close) => {
    B.innerHTML = '<p class="hint">이긴 사람이 상대 물건 하나를 가져가는 것이 비무의 예법입니다.</p>'; const w = el('div', 'loots');
    for (const id of ids) { const b = el('button', 'loot', `<img src="${iconUrl(id)}" alt=""><b>${nameOf(id)}</b><small>${descOf(id)}</small>`); b.onclick = () => { close(claim(id)); }; w.appendChild(b); }
    B.appendChild(w);
  }, 860);
}
G.life = { isSworn, gift: giveGift, chatLines,
  bondTalk: id => G.bond.next(id) ? G.bond.play(id) : romance(id), pick, craft, fishing, houseScore, cand: CAND, stageOf, animals: ANIMALS, openDecor, lootPick, openCraft, openSell, sleepNow: async () => { await fadeTo(1); nextDay(); await fadeTo(0); toast(`${S().day}일째 아침`, 2.4); }, lootAfter: async cfg => { const id = cfg.foes[0], t = FOE_LOOT[id]; if (t) await lootPick(FOES[id].name, t); }, placeAt, closeDecor, enterHouse, canPlace, size };
// 떠돌이 비무객: 하루 한 번, 경지에 맞는 상대
FOES.wanderer = { name: '떠돌이 비무객', spr: 'chars/Samurai', hp: 100, atk: 10, def: 3, spd: 66, exp: 0, silver: 0, pause: 1.05, moves: ['double', 'lunge', 'quick', 'dart3'], wpn: 'Katana', guard: .5, poise: 40, elite: 1 };
async function wanderer() {
  if (S().daily.wander) { await say('wander', '오늘은 이만. 내일 다시 오시오.'); return; }
  await say('wander', '강호를 떠도는 사람이오. 비무 한 판 어떻소? 이긴 쪽이 상대 물건 하나를 가져가는 것이 법이오.');
  const c = await choice('떠돌이 비무객과 겨룰까?', ['겨룬다', '그만둔다']); if (c) return;
  const lv = S().lv; Object.assign(FOES.wanderer, { hp: 60 + lv * 60, atk: 7 + lv * 2.1, def: 2 + lv * .4, exp: 12 + lv * 9, silver: 8 + lv * 4 });
  S().daily.wander = 1;
  const won = await ctx.duel({ spar: true, foes: ['wanderer'], arena: G.field.m.arena, title: '떠돌이 비무객', bgm: 'fight', yieldAt: .25, optional: true });
  if (won) await lootPick('떠돌이 비무객', pick([['silver_cup', 'herb', 'hide'], ['ore_blue', 'plum_wine', 'fur'], ['tea', 'wood', 'sachet'], ['jade', 'meat', 'sweets'], ['gold_cup', 'ore_iron', 'poem']]));
}
Object.assign(WHO, { realtor: { name: '복덕방 영감', face: 'OldMan' }, hunter: { name: '사냥꾼 호씨', face: 'Villager3' }, wander: { name: '떠돌이 비무객', face: 'Samurai' } });

Story.providers.push(function content4(id) {
  const n = [], sp = [], s = S(), hunt = [];
  for (const [key,c] of Object.entries(roadCompanions)) {
    if (id !== c.map || s.married === key || s.pt?.in?.includes(key) || (s.house.lv && Object.hasOwn(s.pt?.home || {},key))) continue;
    n.push({id:key, spr:c.spr, x:c.x, y:c.y, dir:0, hint:c.name, mark:()=>!F()['met_'+key], talk:async()=>{
      if (F()['met_'+key]) return;
      for (const [who,line,expression] of c.intro) {
        if (who) await say(who,line,expression); else await narr(line);
      }
      addLove(key,4);
    }});
  }
  if (GATHER[id] && (!['wolha'].includes(id) || true)) GATHER[id].forEach((g, i) => { if (!s.daily[`g_${id}_${i}`]) n.push({ id: `g${i}`, stamp: g[1], spr: '', x: g[2], y: g[3], hint: `${DB[g[0]].name} 얻기`, talk: gather(id, i, g) }); });
  if (id === 'cheongha' && !(s.married === 'igyeom' && canRomance('igyeom', s)) && !s.pt?.in?.includes('igyeom') && !(s.house.lv && Object.hasOwn(s.pt?.home || {}, 'igyeom'))) {
    n.push({ id: 'igyeom', spr: 'Igyeom', x: 25, y: 26.5, dir: 2, hint: '나루의 서이겸', mark: () => !F().met_igyeom, talk: async () => {
      if (F().met_igyeom) { await say('igyeom', '밧줄 잡고 건너와요. 여기 널판 하나가 들떠 있어요.'); return; }
      await narr('젖은 널판에 강줄기를 그리고 있던 사내가 발을 옮겼다. 내 짚신 밑으로 들릴 뻔한 널판 끝을 그가 밟고 있었다.');
      await say('igyeom', '청하진 첫배를 모는 서이겸입니다. 저 널판 때문에 어제도 손님 한 분이 젖은 버선 들고 내리셨지요.', 'h');
      await say('me', '고쳐 놓으면 되잖아요.');
      await say('igyeom', '그러려고 못 사러 나왔다가 당신이 서 있어서요. 망치 좀 잡아 줄래요?');
      addLove('igyeom', 4);
    } });
  }
  if (id === 'cheongha' && F().burned) {
    n.push({ id: 'realtor', spr: 'OldMan', x: 13, y: 21.6, dir: 3, hint: '복덕방', talk: realtor });
    n.push({ id: 'wander', spr: 'Samurai', x: 26, y: 16.8, dir: 2, talk: wanderer });
    sp.push({ x: 21, y: 30, w: 4, h: 3, hint: '낚시하기', act: () => fishSpot('river') });
  }
  if (id === 'guhwa') { sp.push({ x: 37, y: 24, w: 8, h: 7, hint: '낚시하기', act: () => fishSpot('pond') }); n.push({ id: 'wander', spr: 'Samurai', x: 22, y: 26, dir: 3, talk: wanderer }); }
  if (id === 'valley') {
    sp.push({ x: 17, y: 2, w: 6, h: 26, hint: '낚시하기', act: () => fishSpot('stream') });
    n.push({ id: 'hunter', spr: 'Villager3', x: 34.5, y: 14, dir: 2, mark: () => !F().bow, talk: async () => { if (!F().bow) { await say('hunter', '여긴 짐승이 많지. 활은 쏠 줄 아나? 하나 주지. 곽 아주머니 국수를 공으로 먹은 게 많아서 말이야.'); F().bow = true; Sound.sfx('bonus'); await say(null, '사냥활을 받았다. 사냥터에서 J 키로 화살을 쏜다. 짐승은 다가가면 달아난다.'); } else await say('hunter', '노루는 빠르니 앞을 보고 쏴라. 멧돼지 큰 놈은 칼로 상대하고.'); } });
    for (const [a, x, y] of [['rabbit', 10, 10], ['rabbit', 28, 10], ['rabbit', 30, 22], ['pheasant', 7, 18], ['pheasant', 26, 16], ['deer', 12, 24], ['deer', 33, 18], ['piglet', 9, 14], ['badger', 31, 8]]) hunt.push({ kind: a, x, y });
  }
  if (id === 'bamboo') for (const [a, x, y] of [['rabbit', 14, 15.5], ['pheasant', 30.5, 20], ['rabbit', 20, 7.5]]) hunt.push({ kind: a, x, y });
  if (id === 'myhouse') {
    s.house.items.forEach(i => { const a = FURN[i.id].act; if (a) { const [w, h] = size(i.id); sp.push({ x: i.x, y: i.y, w, h, hint: { bed: '잠자기', cook: '요리하기', bench: '가구 만들기', book: '책 읽기', dummy: '수련하기' }[a], act: () => furnAct(a) }); } });
    if (canRomance(s.married, s)) n.push({ id: s.married, spr: CAND[s.married].spr || { igyeom: 'Igyeom', yun: 'Princess', so: 'RedSamurai', baekrang: 'Cavegirl', hyeok: 'Hyeok', clan_dang: 'Dang', clan_moyong: 'Moyong', clan_namgung: 'Namgung' }[s.married], x: 4, y: 3.5, dir: 0, talk: async () => { await say(s.married, pick(CAND[s.married].wife)); } });
  }
  return { npcs: n, spots: sp, trigs: [], roam: [], hunt };
});
