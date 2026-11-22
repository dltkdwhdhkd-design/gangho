// GAME_URL에서 새 게임의 첫 수련과 화산파 장로 대련을 키보드로 확인한다.
const assert = require('node:assert/strict');
const { chromium } = require('playwright');

async function prepareField({ court }) {
  const G = window.__G;
  G.manual = G.noSave = G.noSpawn = true;
  G.auto = true;
  G.speedup = 500;
  G.bot = null;
  G.scene = 'field';
  G.bgDraw = null;
  document.querySelector('#screen').replaceChildren();
  G.S = G.dbg.newState('새 검객', 'BlueSamurai', 'm', 'normal');
  G.S.flags.step = 'p1';
  G.S.flags.world_tip = true;
  if (court) {
    (await import('./js/free.js')).initFree();
    G.field.load('r_hwasan_elder', 9, 8);
  } else {
    G.field.load('inn', 8, 8);
  }
  await G.field.peopleReady;
}

// 주민의 실제 대화로 입장한다. 키 입력을 재기 전에 입장 연출을 끝낸다.
async function talkToFighter(court) {
  const G = window.__G;
  const { tickDialog } = await import('./js/dialog.js');
  const { Input } = await import('./js/core.js');
  G.autoPick = choice => Math.max(0, choice.opts.findIndex(text => text.includes('대련을 청한다')));
  const npc = G.field.npcs.find(n => n.id === (court ? 'elder1' : 'baek'));
  void npc.talk();
  for (let i = 0; i < 500 && !G.battle; i++) {
    tickDialog(1 / 60);
    await new Promise(resolve => setTimeout(resolve, 5));
  }
  if (!G.battle) throw Error('주민 대화에서 전투가 시작되지 않았다');
  const B = G.battle;
  while (B.introT > 0) B.update(1 / 60);
  G.auto = false;
  Input.clear();
  return { title: B.cfg.title, map: B.venue.encounter.sourceId, level: G.S.lv, speed: B.p.spd, hd: !!B.stage };
}

async function measure(page, keys, frames) {
  for (const key of keys) await page.keyboard.down(key);
  try {
    return await page.evaluate(frames => {
      const G = window.__G, B = G.battle;
      const actor = B ? B.p : G.field.p;
      const x = actor.x, y = actor.y;
      for (let i = 0; i < frames; i++) (B || G.field).update(1 / 60);
      // 실제 장소의 바닥 좌표로 환산한다. 이동 코드가 제공하는 보정값은 쓰지 않는다.
      const scale = B ? B.venue.encounter.scale : 1;
      return Math.hypot(actor.x - x, actor.y - y) / scale * 60 / frames;
    }, frames);
  } finally {
    for (const key of keys) await page.keyboard.up(key);
  }
}

async function resetWalker(page) {
  await page.evaluate(async () => {
    const B = window.__G.battle;
    (await import('./js/core.js')).Input.clear();
    [B.p.x, B.p.y] = B.nav.focus;
    Object.assign(B.p, { st: 'idle', vx: 0, vy: 0, slowT: 0, dashCd: 0 });
  });
}

function near(actual, expected, label) {
  assert.ok(Math.abs(actual - expected) < 0.01, label + ': ' + actual + ' / ' + expected);
}

async function verify(browser, hd, court) {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  try {
    const url = new URL(process.env.GAME_URL);
    url.searchParams.set('hd2d', hd ? '1' : '0');
    await page.goto(url.href, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.__G?.dbg, null, { timeout: 90000 });
    await page.evaluate(prepareField, { court });
    let field;
    if (!court) {
      field = await measure(page, ['d'], 24);
      await page.evaluate(() => { const f = window.__G.field; f.p.x = f.p.y = 8 * 16; });
    }
    const entry = await page.evaluate(talkToFighter, court);
    assert.equal(entry.map, court ? 'b_hwasan' : 'inn');
    assert.equal(entry.hd, hd);
    assert.equal(entry.level, 1);
    if (!court) assert.equal(entry.title, '장작 패기');
    const walk = await measure(page, ['d'], court ? 6 : 24);
    near(walk, entry.speed, '전투 보행');
    if (!court) {
      assert.ok(walk / field > 0.90 && walk / field < 1.10, '첫 전투와 필드의 바닥 이동 거리');
      await resetWalker(page);
      near(await measure(page, ['d', 's'], 6), walk, '대각선');
      near(await measure(page, [], 6), 0, '키를 놓으면 정지');
      await resetWalker(page);
      near(await measure(page, ['d', 'l'], 6), walk * 0.30, '막기');
      await resetWalker(page);
      await page.evaluate(() => { Object.assign(window.__G.battle.p, { slowT: 1, slowF: 0.5 }); });
      near(await measure(page, ['d'], 6), walk * 0.5, '둔화');
      await resetWalker(page);
      near(await measure(page, ['d', 'k'], 6), 225, '경공');
      await resetWalker(page);
      await page.evaluate(async () => { (await import('./js/core.js')).Input.stick.x = 0.5; });
      near(await measure(page, [], 6), walk * 0.5, '반만 민 조이스틱');
      await resetWalker(page);
      await measure(page, ['d'], 240);
      const atWall = await page.evaluate(() => window.__G.battle.p.walk);
      near(await measure(page, ['d'], 12), 0, '벽 충돌');
      near(await page.evaluate(() => window.__G.battle.p.walk), atWall, '벽에서 발 정지');
      await resetWalker(page);
      const attack = await measure(page, ['d', 'j'], 1);
      const lunge = await page.evaluate(() => {
        const B = window.__G.battle, step = B.p.sk.steps[0].move;
        return step.d / step.dur / B.venue.encounter.scale;
      });
      near(attack, lunge, '평타의 전진 거리');
      const pursuit = await page.evaluate(() => {
        const B = window.__G.battle, actor = B.p;
        const enemy = B.spawn('rowdy', 1, actor.x + 85, actor.y);
        const ally = B.spawn('rowdy', 0, actor.x + 25, actor.y);
        return [enemy, ally].map(fighter => {
          const x = fighter.x, y = fighter.y;
          B.ai(fighter, 1 / 60);
          B.tickActor(fighter, 1 / 60);
          return [Math.hypot(fighter.x - x, fighter.y - y) * 60 / B.venue.encounter.scale, fighter.spd];
        });
      });
      for (const [speed, expected] of pursuit) near(speed, expected, '실내 적과 동료 추격');
    } else {
      const chase = await page.evaluate(() => {
        const B = window.__G.battle, elder = B.actors.find(a => a.team === 1);
        const x = elder.x, y = elder.y;
        B.update(1 / 60);
        return { actual: Math.hypot(elder.x - x, elder.y - y) * 60 / B.venue.encounter.scale, speed: elder.spd };
      });
      near(chase.actual, chase.speed, '장로 추격');
    }
    assert.deepEqual(errors, []);
    console.log(JSON.stringify({ ...entry, field, walk }));
  } finally { await page.close(); }
}

(async () => {
  const browser = await chromium.launch();
  try {
    for (const hd of [true, false]) for (const court of [false, true]) await verify(browser, hd, court);
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
