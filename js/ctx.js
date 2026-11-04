// 이야기에서 함께 쓰는 도구와 등장인물
import { G, Sound, $, fadeTo, wait, toast, TS } from './core.js';
import { say, narr, choice, WHO } from './dialog.js';
import { fight } from './battle.js';
import { learn, save } from './state.js';
import { showResult, choiceLose, openShop, shopItem } from './ui.js';
Object.assign(WHO, {
  gwak: { name: '곽 아주머니', face: 'OldWoman' }, baek: { name: '백 노인', face: 'OldMan3' }, yun: { name: '윤설', face: 'Princess' }, doc: { name: '윤 의원', face: 'OldMan' },
  smith: { name: '대장장이 강씨', face: 'Caveman2' }, boat: { name: '뱃사공 노씨', face: 'OldMan2' }, kid: { name: '동네 꼬마', face: 'Child' }, shopk: { name: '만물상 주인', face: 'Noble' }, town: { name: '마을 사람', face: 'Villager' }, town2: { name: '마을 아낙', face: 'Villager4' },
  rowdy: { name: '왈패', face: 'Villager2' }, shadow: { name: '흑의인', face: 'DarkNinja' }, fox: { name: '여우 가면', face: 'MaskedNinja' }, bandit: { name: '산적', face: 'Villager2' }, lion: { name: '광사자 맹호', face: 'Lion' },
  so: { name: '소연하', face: 'RedSamurai' }, go: { name: '고진', face: 'Inspector' }, wi: { name: '위문상', face: 'Noble' }, lord: { name: '청운자', face: 'Monk' }, disc: { name: '창운문 제자', face: 'GreenNinja' },
  cheol: { name: '철우', face: 'Monk2' }, judge: { name: '심판', face: 'Inspector' }, chief: { name: '연경추', face: 'Master' }, host: { name: '객잔 주인', face: 'Villager' }, cheon: { name: '월천', face: 'BlueSamurai' }, racoon: { name: '대왕 너구리', face: 'GiantRacoon' },
  ghost: { name: '원혼', face: 'Skeleton' }, voice: { name: '목소리' },
});

export const ctx = {
  F: () => G.S.flags,
  goal(t) { G.S.goal = t; G.field.updateGoal(); },
  note(t) { G.S.notes.push(t); toast('수첩에 적었다'); },
  love(k, n = 1) { G.S.love[k] = Math.min(100, (G.S.love[k] || 0) + n * 14); G.S.flags['met_' + k] = true; Sound.sfx('secret'); toast(`${WHO[k].name}와(과) 가까워졌다`); },
  page(id) { if (!G.S.pages.includes(id)) G.S.pages.push(id); learn(id); },
  rep(k, n) { G.S.rep[k] = (G.S.rep[k] || 0) + n; toast(`${{ jeong: '정파', sa: '사파', ma: '마교' }[k]} 평판 ${n > 0 ? '+' : ''}${n}`); },
  silver(n) { G.S.silver += n; Sound.sfx('coin'); toast(`은자 ${n}냥을 얻었다`); },
  async duel(cfg) {
    for (; ;) {
      await fadeTo(1); G.field.hideHud?.(); await fadeTo(0);
      const r = await fight(cfg);
      if (r.outcome === 'win') { await showResult(r); if (cfg.bgm === 'boss') G.S.potion = Math.max(G.S.potion, G.S.potionMax); if (cfg.yieldAt) await G.life.lootAfter(cfg); restoreBgm(); G.field.showHud(); return true; }
      if (cfg.optional) { restoreBgm(); G.field.showHud(); return false; }
      await choiceLose();
    }
  },
  warp: (id, x, y, d) => G.field.warp(id, x, y, d),
  npc: id => G.field.npcs.find(n => n.id === id),
  shop: (...a) => openShop(...a), get item() { return shopItem; }, learn: id => learn(id),
};
function restoreBgm() { const m = G.field.m; if (m) Sound.bgm(m.bgm); }

export const Story = {
  content(id) {
    const L = Story.providers.map(f => f(id));
    const npcs = L.flatMap(x => x.npcs).filter(n => !n.when || n.when());
    if (Story.wrapNpc) npcs.forEach(Story.wrapNpc);
    return { npcs, spots: L.flatMap(x => x.spots), trigs: L.flatMap(x => x.trigs), roam: L.flatMap(x => x.roam), hunt: L.flatMap(x => x.hunt || []) };
  },
  begin() { G.scene = 'field'; G.field.load('cheongha', 22, 25, 1); $('#fade').style.opacity = 1; G.field.run(Story.scenes.opening); },
  resume() { const S = G.S; G.scene = 'field'; G.bgDraw = null; G.field.load(S.map, (S.px ?? 120) / TS, (S.py ?? 120) / TS, S.dir || 0); },
  async line(t) { await say(null, t); },
  async encounter(r) {
    const won = await ctx.duel({ foes: r.foes, arena: G.field.m.arena, bgm: 'fight', noIntro: true, optional: true, expMul: 1 });
    return won;
  },
  scenes: {}, providers: [],
};
export { say, narr, choice };
