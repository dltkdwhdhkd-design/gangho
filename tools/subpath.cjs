// GitHub Pages처럼 하위 경로에서 열어도 파일이 모두 불러와지는지 확인한다
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
  const bad = []; let ok = 0; p.on('response', r => { if (r.status() >= 400) bad.push(r.status() + ' ' + r.url()); else ok++; }); p.on('pageerror', e => bad.push('PAGE ' + e.message));
  await p.goto(process.argv[2]); await p.waitForTimeout(2500);
  await p.click('#bNew'); await p.waitForTimeout(300); await p.click('#go'); await p.waitForTimeout(1500);
  console.log('응답', ok, '실패', bad.length); console.log(bad.slice(0, 8).join('\n')); await b.close();
})().catch(e => { console.log(String(e).slice(0, 500)); process.exit(1); });
