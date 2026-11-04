const { chromium } = require('playwright'); const fs = require('fs');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
  await p.goto('http://127.0.0.1:8123/index.html'); await p.waitForTimeout(1200);
  const ids = process.argv.slice(2);
  for (const id of ids) {
    const url = await p.evaluate(async id => {
      const G = __G, m = G.dbg.MAPS[id]; const c = document.createElement('canvas'); c.width = m.w * 16 * 2; c.height = m.h * 16 * 2; const x = c.getContext('2d'); x.imageSmoothingEnabled = false; x.scale(2, 2);
      x.drawImage(m.canvas, 0, 0); const { drawStamp } = await import('/js/tiles.js');
      for (const s of [...m.objs].sort((a, b) => a.base - b.base)) drawStamp(x, s.name, s.x, s.y);
      x.strokeStyle = 'rgba(255,0,0,.6)'; x.lineWidth = .5; for (const s of m.solids) x.strokeRect(s.x, s.y, s.w, s.h);
      x.strokeStyle = 'rgba(0,160,255,.9)'; x.lineWidth = 1; for (const s of m.portals) x.strokeRect(s.x, s.y, s.w, s.h);
      return c.toDataURL();
    }, id);
    fs.writeFileSync(`/tmp/claude-0/shots/map_${id}.png`, Buffer.from(url.split(',')[1], 'base64'));
  }
  await b.close();
})().catch(e => { console.log(String(e).slice(0, 500)); process.exit(1); });
