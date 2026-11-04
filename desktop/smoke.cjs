// 빌드된 프로그램을 실제로 띄워 게임이 뜨고 저장이 남는지 확인한다
const { _electron } = require('playwright');
const fs = require('fs'), path = require('path');
const dir = path.join(__dirname, 'dist', 'win-unpacked');
const exe = path.join(dir, fs.readdirSync(dir).find(f => f.endsWith('.exe')));
const launch = () => _electron.launch({ executablePath: exe, cwd: dir, timeout: 60000 });
(async () => {
  const errs = [];
  let app = await launch(), w = await app.firstWindow();
  w.on('pageerror', e => errs.push(e.message)); w.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await w.waitForTimeout(5000);
  const a = await w.evaluate(async () => { const c = await import('./js/core.js'); return { art: c.ART.size, title: document.title, sound: Object.keys(c.Sound.buf).length }; });
  console.log(JSON.stringify(a)); await w.screenshot({ path: path.join(__dirname, 'dist', 'smoke-title.png') });
  await w.evaluate(async () => { const G = __G, D = G.dbg, s = await import('./js/state.js'); G.S = D.newState('시험', 'BlueSamurai', 'm', 'normal'); document.querySelector('#screen').innerHTML = ''; G.bgDraw = null; G.scene = 'field'; G.field.load('cheongha', 20, 12, 1); G.S.silver = 777; s.save(true); });
  await w.waitForTimeout(1500); await w.screenshot({ path: path.join(__dirname, 'dist', 'smoke-field.png') });
  await app.close();
  app = await launch(); w = await app.firstWindow(); await w.waitForTimeout(4000);
  const b = await w.evaluate(async () => { const s = await import('./js/state.js'); const L = s.load(); return L && L.silver; });
  await app.close();
  console.log('reload silver', b, errs.length ? errs.join('\n') : 'no errors');
  if (!a.art || !a.sound || b !== 777 || errs.length) process.exit(1);
})().catch(e => { console.error(e); process.exit(1); });
