// GAME_URL의 청하진 민가와 근교 이정표를 실제 필드 입력으로 왕복한다.
const assert = require('node:assert/strict');
const { chromium } = require('playwright');

async function checkLayout() {
  const G = window.__G, field = G.field;
  const { Input, TS } = await import('./js/core.js');
  const { STAMPS } = await import('./js/tiles.js');
  function requireState(ok, msg) { if (!ok) throw Error(msg); }
  async function arrive(id) {
    const until = performance.now() + 12000;
    while ((field.busy || field.m.id !== id) && performance.now() < until)
      await new Promise(resolve => setTimeout(resolve, 25));
    requireState(!field.busy && field.m.id === id, '도착 실패 ' + id + ' (' + field.m.id + ')');
    requireState(!field.m.blocked(field.p.x, field.p.y), id + ' 도착점 막힘');
  }
  function through(portal) {
    requireState(portal, '돌아오는 출입구 없음');
    field.p.x = portal.x + portal.w / 2;
    field.p.y = portal.y + portal.h / 2;
    field.update(1 / 60);
    return arrive(portal.to);
  }
  function faceFixture(m, stamp, spot) {
    const x = stamp.x + STAMPS[stamp.name][3] * (stamp.sc || 1) / 2, unit = TS * m.k;
    for (const dy of [.8, 1.1, 1.4, 1.75]) {
      for (const dx of [0, -.5, .5]) {
        field.p.x = x + dx * unit; field.p.y = stamp.base + dy * unit; field.p.dir = 1;
        if (!m.blocked(field.p.x, field.p.y) && field.target() === spot) return true;
      }
    }
    return false;
  }

  G.manual = G.noSpawn = G.noSave = true;
  G.auto = true;
  G.speedup = 500;
  G.S = G.dbg.newState('청하 나그네', 'BlueSamurai', 'm', 'normal');
  (await import('./js/free.js')).initFree();
  G.S.house.lv = 1;
  Object.assign(G.S.flags, { world_tip:true, world_open:true, bamboo_open:true, pass_open:true, own_house:true, bokun_open:true });
  G.scene = 'field';
  G.bgDraw = null;
  document.querySelector('#screen').replaceChildren();
  field.load('cheongha', 22.5, 15);
  const village = field.m;
  const homes = village.portals.filter(q => q.to.startsWith('h_cheongha_')).map(q => q.to).sort();
  const doors = village.portals.filter(q => q.door).map(q => q.to);
  for (const id of doors) {
    await through(village.portals.find(q => q.to === id));
    await through(field.m.portals.find(q => q.to === village.id));
    requireState(!village.portals.some(q => field.p.x > q.x && field.p.x < q.x+q.w && field.p.y > q.y && field.p.y < q.y+q.h), id + ' 귀환 즉시 재입장');
  }
  for (const [hint, name] of [['방 보기','signpost'], ['이정표','signpost'], ['수련하기','v_dummy']]) {
    const spot = field.spots.find(s => s.hint === hint);
    requireState(spot && village.stamps.some(s => s.name === name && faceFixture(village,s,spot)), hint + ' 표시물 앞에서 상호작용 불가');
  }

  const boards = [];
  for (const id of ['cheongha', 'bamboo', 'valley', 'pass']) {
    field.load(id, 10, 12);
    const m = field.m;
    const signs = m.stamps.filter(s => s.name === 'v_signboard');
    const spot = field.spots.find(s => s.hint === '강호로 나간다' && s.when());
    requireState(signs.length === 1 && spot, id + ' 이정표 표시/행동 불일치');
    requireState(faceFixture(m,signs[0],spot), id + ' 이정표 앞에서 상호작용 불가');
    Input.press('ok'); field.update(1 / 60); Input.release('ok');
    await arrive('world');
    const [wx, wy] = G.world.entry(id);
    requireState(Math.hypot(field.p.x / TS - wx, field.p.y / TS - wy) < 3, id + ' 다른 지역 도착');
    await through(field.m.portals.find(q => q.to === id));
    boards.push(id);
  }

  const grove = G.dbg.MAPS.bamboo;
  field.load('bamboo',18,30);
  for (const r of field.roam) {
    requireState(!grove.blocked(r.x,r.y), r.spr + ' 시작 위치 막힘');
    requireState(grove.g[Math.floor(r.y/TS)][Math.floor(r.x/TS)] === 0, r.spr + ' 길 안에 생성됨');
    requireState(field.animals.every(a => Math.hypot(a.x-r.x,a.y-r.y) > TS), r.spr + ' 사냥감과 시작 위치 겹침');
  }
  for (const s of grove.stamps.filter(s => s.name === 'bamboo')) {
    const sc = s.sc || 1, x = (s.x + STAMPS.bamboo[3] * sc / 2) / TS, y = s.base / TS;
    for (const [u,v] of [[18.5,26.5], [30.5,21], [17,15.5]]) {
      requireState(Math.abs(u-x) > 1.2*sc || v < y-3*sc || v > y+.4, '대숲길에서 대나무가 인물을 가림');
    }
  }
  return { doors, homes, boards };
}

(async () => {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));
    await page.goto(process.env.GAME_URL);
    await page.waitForFunction(() => window.__G?.dbg, null, {timeout:90000});
    const r = await page.evaluate(checkLayout);
    assert.deepEqual(r.homes, ['h_cheongha_1','h_cheongha_50','h_cheongha_7','h_cheongha_8']);
    assert.equal(r.doors.length, 10);
    assert.equal(r.boards.length, 4);
    assert.deepEqual(errors, []);
    console.log('건물 왕복', r.doors.length, '기존 민가', r.homes.length, '이정표 왕복', r.boards.length, '대숲길 시야 통과');
  } finally { await browser.close(); }
})().catch(err => { console.error(err); process.exitCode = 1; });
