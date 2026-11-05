// 게임이 쓰는 그림 목록을 코드에서 뽑는다. tools/pixel_doc.py가 이걸로 요청 문서를 만든다
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage();
  await p.goto(process.env.GAME_URL); await p.waitForTimeout(2000);
  const r = await p.evaluate(async () => {
    const [D, I, F, T, W, M] = await Promise.all(['data', 'items', 'foes', 'tiles', 'dialog', 'maps'].map(x => import(`./js/${x}.js`)));
    const ser = o => JSON.parse(JSON.stringify(o, (k, v) => typeof v === 'function' ? undefined : v));
    return { skills: Object.fromEntries(Object.entries(D.SKILLS).map(([k, v]) => [k, { name: v.name, han: v.han, w: v.w, school: v.school, desc: v.desc }])), hearts: ser(D.HEARTS), db: ser(I.DB), accs: ser(I.ACCS), weapons: ser(D.WEAPONS), foes: Object.fromEntries(Object.entries(F.FOES).map(([k, v]) => [k, { name: v.name, spr: v.spr, mon: v.mon, boss: v.boss, scale: v.scale }])), who: ser(W.WHO), stamps: T.STAMPS,
      maps: Object.fromEntries(Object.entries(M.MAPS).map(([k, m]) => [k, { name: m.name, w: m.w, h: m.h, biome: m.biome, room: m.room, arena: m.arena, labels: m.labels, names: m.names, portals: m.portals.map(q => ({ to: q.to, x: Math.round(q.x / 16), y: Math.round(q.y / 16), door: !!q.door })), stamps: [...(m.stamps || []), ...(m.objs || [])].reduce((a, s) => (a[s.name] = (a[s.name] || 0) + 1, a), {}) }])) };
  });
  require('fs').writeFileSync(process.env.OUT, JSON.stringify(r)); console.log(Object.keys(r).map(k => k + ':' + Object.keys(r[k]).length).join(' ')); await b.close();
})().catch(e => { console.log(String(e).slice(0, 500)); process.exit(1); });
