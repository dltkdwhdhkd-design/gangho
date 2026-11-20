// 새 화면(HD-2D 시제품): 필드를 WebGL로 비춘다.
// 지도 자료, 걸음, 충돌, 문, 사람 자리는 평면도 좌표 그대로 두고 그리기만 바꾼다(쿼터뷰 모드가 하던 방식).
// 평면도 (x, y) → 세상 (X = x, Y = 높이, Z = y × ZS). 카메라는 남쪽 위에서 북쪽을 PITCH만큼 내려다보고 좌우로는 돌지 않는다.
// 집은 막힘 상자(바닥 넓이)를 밑면으로 한 덩어리(벽 네 면, 박공지붕)로 세우고, 나무와 소품과 사람은 선 판으로 세운다.
// 세운 판의 키(HS)는 시점만큼 늘려 둔다(내려다봐도 사람 도트가 눌리지 않게). 깊이(ZS)는 늘리지 않는다(2026-11-19부터 ZS = 1):
// 땅과 집이 진짜 비율 그대로 눕는다. 전에는 깊이를 1.49배 늘려 평면도가 2D 화면처럼 네모나게 보이게 했는데, 그래서 바닥과 지붕이 화면을 차지했다.
// 켜기: 주소 끝에 ?hd2d=1. 못 켜면(WebGL2 없음 등) 아무 일 없이 2D로 돈다.
import { OWN, roomModels, roomWalls, emblemOf, WALL_TOP, WALL_K, FURN, floorOf, FLOORS } from './hd2d/rooms.js';
import { PAL, WALLS as WKIND, PALTEX } from './hd2d/palette.js';
import { PSC } from './field.js';
import { G, IMG, TS, $ } from './core.js';
import { STAMPS, paintRoom } from './tiles.js';
import { newState } from './state.js';
import { makeBuilder, SPEC, GRAND } from './hd2d/build.js';
import { ROLE } from './talkdata.js';

// 주소에 붙여 견주어 보는 값: &camk=0.63(마을 카메라 거리, 클수록 멀다. 기본 .95), &gk=0.857(땅이 깊이 쪽으로 눌려 보이는 정도, 클수록 덜 눕는다. 기본은 진짜 비율인 sin(PITCH) = .574, 예전 값은 .857), &time=morning(빛: morning·day·evening·night)
const qn = k => { try { const v = parseFloat(new URLSearchParams(location.search).get(k)); return v > 0 ? v : 0; } catch { return 0; } };
const DEG = Math.PI / 180, PITCH = 35 * DEG, FOV = 34, ZS = qn('gk') ? qn('gk') / Math.sin(PITCH) : 1 /* 깊이를 늘리지 않는다: 땅이 카메라 각도(35도)대로 눕는다. 평면도의 한 칸이 화면에서 가로 1에 세로 .574(원근까지 치면 주인공 발밑에서 .65쯤) */, HS = 1 / Math.cos(PITCH);
const CHAR = 15, AHEAD = .04;
// 사람 크기: 집·소품에 비해 사람이 작아 보여서(일검풍운결은 사람이 계단 한 칸의 두세 배) 새 화면의 사람을 1.3배로 세우고, 카메라는 1.12배 뒤로 뺀다. 방은 js/field.js PSC
// 크기 기준(일검풍운결 비교, 2026-11-18): 사람 키 ≈ 문 높이의 0.9, 큰 독 ≈ 사람의 0.65, 등롱 기둥 ≈ 사람의 1.5.
// 카메라 거리 CAMK: .63일 때 사람이 화면 높이의 1/5.4였다(기준 그림은 1/7~1/10.5). 2026-11-19에 .95로 물려 1/8.7. docs/plan-2026-11-19.md 2장
export const ACTK = 1.05, CAMK = qn('camk') || .95, PROPK = .62;
// 큰 지도(world)는 멀리 봐야 하는 지도라 마을 값(CAMK)을 쓰면 땅 그림이 뭉개지고 좁게 보인다. 큰 지도는 만들 때 맞춘 값을 따로 둔다
const CAMW = 1.12, ACTW = 1.3;
// 방 안과 전투는 따로 맞춰 둔 크기를 그대로 둔다(방: 사람 PSC 배, 카메라 CAMR / 전투: 사람 ACTB 배, 카메라 CAMB)
const CAMR = 1.25, AHEADR = .2, ACTB = 1.3, CAMB = 1.12;  // CAMR: 방 안 사람 키가 화면 높이의 1/7.7이 되게(기준 그림 docs/ref/ws-interior.jpg에서 잰 값. 전에는 1.12로 1/6.9였다). AHEADR: 방에서는 주인공을 화면 가운데보다 한참 아래에 세워 뒷벽을 넓게 담는다  // 인물 도트의 키(평면도 점). 화면 높이의 1/zoom이 되게 카메라 거리를 잡는다
const W = 1280, H = 720;
let T = null;  // three.js

// 인물 키는 화면 높이의 1/9로 정했다(사용자). 그림은 새 그림이 기본
const OPTK = 'gangho_hd2d_opt2', OPT0 = { zoom: 9, time: 'auto', fx: 'auto', art: 1, battle3d: 1 };
let autoLv = 'mid'; const fxNow = () => HD.opt.fx === 'auto' ? autoLv : HD.opt.fx;  // 실제로 쓰는 화질
const loadOpt = () => { let o; try { o = { ...OPT0, ...JSON.parse(localStorage.getItem(OPTK) || '{}') }; } catch { o = { ...OPT0 }; } o.zoom = 9; const qt = (() => { try { return new URLSearchParams(location.search).get('time'); } catch { return null; } })(); if (qt && TIMES[qt]) o.time = qt; return o; };
const want = (() => { try { return new URLSearchParams(location.search).get('hd2d') === '1'; } catch { return false; } })();

// 시각별 빛. sun: 해 쪽을 가리키는 방향(x 오른쪽, y 위, z 화면 앞쪽). 낮과 저녁은 왼쪽에서 조금 앞으로 들어 왼벽이 밝고 오른벽이 그늘지며 그림자는 오른쪽으로 진다. 아침은 오른쪽에서
const TIMES = {
  // 명암: 해(sunI)는 세게, 하늘빛(hemI)은 약하게 해서 해 받는 면과 그늘의 차이를 크게 둔다. 해 높이를 낮춰 그림자를 길게.
  // 저녁은 화면 전체를 물들이지 않는다(tint는 거의 그대로). 해만 주황이고 하늘빛은 푸르고 어둡다
  morning: { sun: [.82, .38, .3], sunC: '#ffe0b4', sunI: 4, sky: '#8ea8d8', gnd: '#3a3628', hemI: .4, con: 1.15, fog: '#d4dae2', skyT: '#8fb4e6', mtn: '#7d8fa8', tint: [.99, 1, 1.03], expo: 1.02, sat: 1, lamp: 0 },
  day: { sun: [-.74, .5, .3], sunC: '#ffdca0', sunI: 5, sky: '#8a9cb8', gnd: '#3a2a1c', hemI: .4, fill: .14, con: 1.55, vig: .85, fog: '#b8b4a4', skyT: '#7fa6dc', mtn: '#6c7880', tint: [1.08, 1, .86], expo: .95, sat: .92, warm: 1, lamp: 0 },
  evening: { sun: [-.94, .12, .2], sunC: '#ff8a3a', sunI: 4.6, sky: '#5068a8', gnd: '#1c1a24', hemI: .75, fog: '#a58ca4', skyT: '#4c5c9c', mtn: '#4e4a6c', tint: [.98, .97, 1.04], expo: 1, sat: 1.08, lamp: .55 },
  night: { sun: [-.4, .75, -.15], sunC: '#7f9cff', sunI: 1.3, sky: '#3a54a8', gnd: '#10142a', hemI: .62, fog: '#141c3c', skyT: '#0a1028', mtn: '#1a2240', tint: [.74, .88, 1.3], expo: 1.05, sat: .8, lamp: 1.2 },
};

export const HD = {
  want, ready: false, failed: false, opt: loadOpt(), peek: null, orbit: 0,  // peek: 시험 화면용 카메라 겨냥점(평면도 점)
  maps: new Set(['cheongha']),  // 시제품은 청하진만. 나머지 지도는 예전 2D로 그린다
  active(m) { return this.want && this.ready && !this.failed && !!m && (this.maps.has(m.id) || (!m.room && !m.hasIso) || (m.room && art())) && !m.isoRoom && (!m.live || m.id === 'world'); },  // 강호 큰 지도는 주인공 둘레만 잘라 짓는다(winOf)  // 방은 전부 새 화면으로(벽을 조각으로 세운다: roomKit)(js/hd2d/rooms.js)  // 바깥 지도는 모두(방과 쿼터뷰 지도, 강호 큰 지도는 예전 화면)
  setOpt(k, v) { this.opt[k] = v; try { localStorage.setItem(OPTK, JSON.stringify(this.opt)); } catch { } if (k === 'fx') { slow = 0; autoLv = 'mid'; resize(true); } if (k === 'art') loadPreview().then(() => { curMap = null; }); panelSync(); },
  hide() { if (cv && cv.style.display !== 'none') cv.style.display = 'none'; },
  gnd: () => ground && { pos: ground.position.toArray().map(Math.round), box: (() => { ground.geometry.computeBoundingBox(); const b = ground.geometry.boundingBox; return [b.min.toArray().map(Math.round), b.max.toArray().map(Math.round)]; })(), map: curMap?.id, win: curMap?.win, hgt: !!curMap?.hgt, cam: cam.position.toArray().map(Math.round) },
  init, render, renderBattle, affine, resetCam: () => { camT.set(-1, 0, 0); for (const o of bboard) o.mesh.visible = false; },
  // 저장 칸 그림: 새 화면은 장면이 WebGL 캔버스에 있어서 2D 캔버스만 찍으면 빈 그림이 된다. 마지막 장면을 한 번 더 그려 그 자리에서 옮긴다
  snap(x, w, h) { if (!R || !lastF || !HD.ready || !HD.active(lastF.m)) return false; try { const d = cv.style.display; render(lastF); cv.style.display = d; x.drawImage(cv, 0, 0, w, h); return true; } catch (e) { return false; } }, bbLeft: () => bboard.filter(o => o.mesh.visible).length, mem: () => ({ ...R.info.memory }), fps: () => fpsV, actK: m => m?.room ? PSC : m?.id === 'world' ? ACTW : ACTK, bodyH: (m, battle) => 16 * OLDK * (battle ? ACTB : HD.actK(m)) /* 사람 그림 한 칸의 키(평면도 점). 화면에서 사람 키를 잴 때 쓴다(tools/dev/tour.cjs) */, tour: () => tour(), set2d(off) { HD.off = !!off; HD.ready = !HD.off; if (HD.off) HD.hide(); }, lowNow: () => fxNow() === 'low', fxNow: () => fxNow(), buildMs: () => buildMs, battleOk: () => HD.want && HD.ready && !HD.failed && !!HD.opt.battle3d, proj, pxPerUnit: () => H / (CHAR * HD.opt.zoom),
  aim(F) { setMap(F.m); camT.set(-1, 0, 0); placeCam(F, 0); fades(F); },  // 시험용: 그리지 않고 카메라만 주인공에게 바로 맞춘다
  // 시험용(tools/hd_occl_test.cjs): 평면도 (x, y)에 선 사람의 몸 다섯 점(머리, 가슴, 허리, 두 무릎) 가운데 지금 카메라에서 집·소품에 가려지는 점의 수, 가리는 것의 이름, 점마다 가려졌는지.
  // 걷어 낸 집과 옅어진 소품은 가리지 않는 것으로 친다. 몸의 크기는 그 지도의 사람 크기다(방 안은 PSC배. 전에는 방에서도 바깥 크기로 재서 허리가 무릎 높이에 있었다)
  covered(x, y) { const C = cam.position, rc = new T.Raycaster(), by = new Set(), k = curMap?.room ? PSC : 1, bits = []; let n = 0;
    scene.updateMatrixWorld();  // 지도를 막 세운 뒤(한 번도 그리기 전)에는 새 물체의 자리 행렬이 비어 있어 줄이 다 빗나간다. 그래서 가려진 사람을 못 세는 일이 있었다
    for (const [dx, dh] of BODY) { const v = new T.Vector3(x + dx * k, dh * k * HS + hAt(curMap, x, y), (y + 1) * ZS + .5), d = v.distanceTo(C); rc.set(C, v.sub(C).normalize()); rc.far = d - 1; let hit = false;
      for (const h of rc.intersectObjects(propG.children, true)) { const u = h.object.userData, ow = u.owner?.userData || {}; if (!u.M || u.flat) continue; if (u.t && h.uv && !alphaAt(u.t, frac(h.uv.x), frac(h.uv.y))) continue; if (ow.faded || ow.cutV > .5) continue; n++; hit = true; by.add(ow.s?.name || (ow.backdrop ? '방 모형' : '모형')); break; }
      bits.push(hit); }
    return [n, [...by], bits]; },
  dbg: () => ({ fg: FG.map(o => [o.visible, o.position.toArray().map(Math.round), o.scale.toArray().map(Math.round), o.material.type, o.material.map?.image?.width, (() => { const c = o.material.map?.image; if (!c?.getContext) return -1; const d = c.getContext("2d").getImageData(0, 0, c.width, c.height).data; let a = 0; for (let i = 3; i < d.length; i += 4) a += d[i]; return Math.round(a / (d.length / 4)); })()]), cam: cam.position.toArray().map(Math.round), far: cam.far, m: mtns?.children.map(o => [o.position.toArray().map(Math.round), o.visible, o.material.color.getHexString()]) }),
  stats: () => ({ props: propG?.children.length || 0, faded: propG ? propG.children.filter(o => o.userData.faded || o.userData.cutOn).length : 0, boxes: propG ? propG.children.filter(o => o.isGroup).length : 0, cliffs: propG ? propG.children.filter(o => o.userData.cliff).length : 0, buildMs, fps: fpsV, low: fxNow() === 'low', size: R ? [R.domElement.width, R.domElement.height] : null }),
};
G.hd = HD;
// 옛 2D 화면(전투, 강호 큰 지도, 방)에서도 마을과 같은 사람 도트를 쓰게 시트를 내준다. 새 화면과 새 그림을 켰을 때만
HD.sheetKey = o => {
  if (!want || !art() || !o) return null; const L = [];
  if (o.me) L.push('me');
  else {
    for (const k of [o.id, o.role, o.hint && ROLE[o.hint], ...(o.keys || [])]) if (k) L.push('n_' + k);
    const key = o.spr ? (o.spr.includes('/') ? o.spr : 'chars/' + o.spr) : null;
    if (key === 'chars/Princess') L.push('yun'); if (key && NEWNPC[key]) L.push(...NEWNPC[key]);
  }
  for (const n of L) if (PV[n]) return n; return null;
};
HD.sheet = o => { const k = HD.sheetKey(o); return k ? PV[k] : null; };
// 동작 시트(<키>_act: 왼쪽을 보는 옆모습 여섯 칸 — 준비, 내지름, 거둠, 맞음, 쓰러짐, 경공). tools/people_in.py가 <키>-c.png로 만든다
HD.act = k => (k && PV[k + '_act']) || null;
HD.draw2dAct = (c, im, fr, flip, x, y, h = CHAR, white) => {
  const CW = 80, CH = 64, k = h / 48; c.save(); c.imageSmoothingEnabled = true; c.imageSmoothingQuality = 'high'; if (white) c.filter = 'brightness(0) invert(1)';
  c.translate(x, y + 1); if (flip) c.scale(-1, 1); c.drawImage(im, fr * CW, 0, CW, CH, -CW / 2 * k, -CH * k, CW * k, CH * k); c.restore();
};
// 사람 시트 한 칸을 2D 캔버스에 그린다: 칸 56점, 사람 키 48점, 발이 칸 바닥. h는 사람 키(평면도 점)
HD.draw2d = (c, im, dir, frame, x, y, h = CHAR, white) => {
  const D = h * 56 / 48; c.save(); c.imageSmoothingEnabled = true; c.imageSmoothingQuality = 'high'; if (white) c.filter = 'brightness(0) invert(1)';
  c.drawImage(im, (dir & 3) * 56, (frame & 3) * 56, 56, 56, x - D / 2, y + 1 - D, D, D); c.restore();
};

let R, cv, scene, cam, sun, fill, hemi, ground, skirt, propG, actG, lamps = [], post, curMap = null;
const TEX = new Map(), MATS = new Map(), DMATS = new Map();

async function init() {
  if (!want) return;
  try {
    T = await import('./lib/three/three.module.min.js');
    cv = document.createElement('canvas'); cv.id = 'gl'; cv.style.cssText = 'position:absolute;inset:0;width:1280px;height:720px;display:none';
    const st = $('#stage'); st.insertBefore(cv, st.firstChild);
    R = new T.WebGLRenderer({ canvas: cv, antialias: false, alpha: false, stencil: false, powerPreference: 'high-performance' });
    if (!R.capabilities.isWebGL2) throw new Error('WebGL2를 못 쓴다');
    R.setPixelRatio(1); R.autoClear = true;
    R.shadowMap.enabled = true; R.shadowMap.type = T.PCFSoftShadowMap;
    scene = new T.Scene();
    cam = new T.PerspectiveCamera(FOV, W / H, 20, 14000);
    hemi = new T.HemisphereLight('#c4d6f2', '#7a6648', 1.2); scene.add(hemi);
    sun = new T.DirectionalLight('#fff1d8', 2.6); sun.castShadow = true; scene.add(sun, sun.target);
    fill = new T.DirectionalLight('#d8c8b0', .6); scene.add(fill, fill.target);  // 해 반대쪽에서 약하게: 그늘진 면도 무늬가 보이게(그림자는 안 만든다)
    sun.shadow.bias = -.0006; sun.shadow.normalBias = .4;
    for (let i = 0; i < 12; i++) { const l = new T.PointLight('#ffae5e', 0, 90, 1.7); scene.add(l); lamps.push(l); }  // 등불은 늘 열두 개를 두고 세기만 바꾼다(개수가 바뀌면 셰이더를 다시 짠다)
    { // 등불 둘레의 빛무리: 저녁과 밤에 등불 자리마다 더해 그린다. 번짐(후처리)이 이것을 한 번 더 퍼뜨린다
      const c = mk(64, 64), x = c.getContext('2d'), g = x.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, 'rgba(255,214,150,1)'); g.addColorStop(.18, 'rgba(255,170,90,.55)'); g.addColorStop(.5, 'rgba(255,130,60,.12)'); g.addColorStop(1, 'rgba(255,120,50,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64);
      const t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace;
      for (const l of lamps) { const h = new T.Sprite(new T.SpriteMaterial({ map: t, blending: T.AdditiveBlending, depthWrite: false, transparent: true, fog: false })); h.scale.set(34, 34, 1); h.visible = false; scene.add(h); l.userData.halo = h; } }
    propG = new T.Group(); actG = new T.Group(); scene.add(propG, actG);
    scene.fog = new T.Fog('#cdd3c8', 600, 2400);
    post = makePost();
    resize(true);
    if (HD.opt.art) await loadPreview();
    HD.ready = true; if (/[?&]hdpanel=1/.test(location.search)) panel();  // 시제품 판은 주소에 hdpanel=1을 붙였을 때만. 옵션은 메뉴의 설정 탭에 있다(js/ui.js)
    const see = /[?&]see=(\w+)/.exec(location.search); if (see) (async () => { while (!G.field || !G.dbg) await new Promise(r => setTimeout(r, 50)); tour(see[1]); })();  // 주소에 see 값으로 지도 이름을 붙이면(쓰는 법은 tools/dev/README.md) 저장을 건드리지 않는 둘러보기로 그 곳에 바로 선다. 방을 고친 뒤 주인께 주소로 보여 드릴 때 쓴다
  } catch (e) { console.warn('새 화면을 켜지 못해 2D로 그린다', e); HD.failed = true; if (cv) cv.remove(); }
}

// ── 그림 → 텍스처 ──
// 투명한 곳의 색을 옆 칸 색으로 채워 둔다. 줄여 그릴 때 가장자리에 검은 테가 끼지 않는다. 행은 뒤집어 넣는다(아래가 v=0)
function texFrom(c, { mips = true } = {}) {
  const w = c.width, h = c.height, src = c.getContext('2d', { willReadFrequently: true }).getImageData(0, 0, w, h).data, d = new Uint8Array(w * h * 4);
  for (let y = 0; y < h; y++) d.set(src.subarray(y * w * 4, (y + 1) * w * 4), (h - 1 - y) * w * 4);
  for (let it = 0; it < 4; it++) { let ch = false; const a = d.slice();
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const i = (y * w + x) * 4; if (a[i + 3] || (a[i] | a[i + 1] | a[i + 2])) continue; let r = 0, g = 0, b = 0, n = 0;
      for (const [u, v] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const X = x + u, Y = y + v; if (X < 0 || Y < 0 || X >= w || Y >= h) continue; const j = (Y * w + X) * 4; if (a[j + 3] || (a[j] | a[j + 1] | a[j + 2])) { r += a[j]; g += a[j + 1]; b += a[j + 2]; n++; } }
      if (n) { d[i] = r / n; d[i + 1] = g / n; d[i + 2] = b / n; ch = true; } }
    if (!ch) break; }
  const t = new T.DataTexture(d, w, h, T.RGBAFormat, T.UnsignedByteType); t.colorSpace = T.SRGBColorSpace;
  t.magFilter = T.LinearFilter; t.minFilter = mips ? T.LinearMipmapLinearFilter : T.LinearFilter; t.generateMipmaps = mips; t.anisotropy = mips ? R.capabilities.getMaxAnisotropy() : 1;
  t.needsUpdate = true; return t;
}
const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
// 새 그림 맛보기(tools/hd2d_preview.py가 만든 것): 받은 집 그림과 윤설 걷기. 0단계에서 크기와 결만 보려고 잠깐 씌운다
// 새 인물 그림(Higgsfield HN*, 게임 시트 꼴 56점 칸)이 있는 사람 종류
const NEWNPC = { 'chars/Villager': ['n_town', 'n_villager'], 'chars/Villager2': ['n_town'], 'chars/Villager3': ['n_town'], 'chars/Woman': ['n_town2', 'n_woman'], 'chars/Boy': ['n_kid'], 'chars/OldMan': ['n_oldman'], 'chars/OldWoman': ['n_oldwoman'], 'chars/Monk': ['n_monk'], 'chars/Gisaeng': ['n_gisaeng1'], 'chars/Gisaeng2': ['n_gisaeng2'], 'chars/Gisaeng3': ['n_gisaeng3'], 'chars/Pimp': ['n_pimp'] };  // 옛 도트 이름 → 새 사람 시트(앞의 것이 있으면 그것). 대화 그림과 맞춘 시트(n_town 따위)가 먼저
const PV = {}, PEOPLE = new Set(), PVN = [ 'hut_o', 'hut_b', 'hut_o2', 'straw', 'mud', 'clay', 'me', 'yun', 'w_front', 'w_side', 'g_grass', 'g_road', 'g_yard', 'g_cobble', 'g_sand', 'g_snow', 'r_orange', 'r_dark', 'r_thatch', 'r_plank', 'r_mud', 'r_snow', 'e_orange', 'e_dark', 'e_thatch', 'e_plank', 'e_ridge', 'e_bracket', 'w1_front', 'w2_front', 'w3_front', 'w1_side', 'w2_side', 'w3_side', 'w4_front', 'w5_front', 'w6_front', 'w4_side', 'w5_side', 'w6_side', 'k_fence', 'k_palisade', 'k_stone', 'hd_wall_tile', 'hd_wall_stone', 'hd_wall_rampart', 'hd_fence_stake', 'hd_fence_bamboo', 'hd_fence_wattle', 'gate', 'gate_arch', 'hd_gate_town', 'cl_rock', 'cl_step', 'g_plank', 'wt_river', 'wt_pond', 'wt_rapid', ...PALTEX.filter(n => n.startsWith('pm_')), ...FLOORS];  // pm_*: 블렌더 조각에 입히는 무늬(js/hd2d/palette.js)
const DOT = 48 / 15;  // 도트 밀도: 평면도 한 점에 도트 3.2점(새 인물 그림 기준). 새 땅과 지붕과 벽도 이 굵기로 깐다
const SIDE_RECT = .314;  // HW0 옆벽 그림에서 네모 벽이 시작하는 높이(위에서부터). 그 위는 세모 박공
let pvP = null;
// 블렌더로 지은 모형(tools/blender/hall.py → assets/hd2d/models/*.glb). 길이는 평면도 점이라 세울 때 (1, HS, ZS)로 늘린다
const MODELS = {}, MODELN = ['daewoong', 'rw_wall', 'rw_post', 'rw_pillar', 'rw_column', 'rw_sill', 'rw_window', 'rw_emblem'], MODELM = new Map(), MODELP = {};  // MODELM: 그물(geometry) → 재질 셋. clone은 userData를 JSON으로 베껴 재질이 깨지므로 따로 둔다
let GLL = null;
async function loadModel(n) { try { if (!GLL) { const [{ GLTFLoader }, { MeshoptDecoder }] = await Promise.all([import('./lib/three/addons/GLTFLoader.js'), import('./lib/three/addons/meshopt_decoder.module.js')]); GLL = new GLTFLoader(); GLL.setMeshoptDecoder(MeshoptDecoder); } const g = await GLL.loadAsync(`assets/hd2d/models/${n}.glb`);
  g.scene.traverse(o => { if (!o.isMesh) return; const sm = o.material, nm = (sm.name || o.name).replace(/\.\d+$/, ''), rk = /^rock_(\w+)/.exec(nm), top = nm === 'top', vc = !!o.geometry.attributes.color;  // 바위 모형(rock_<빛깔>)은 무늬를 게임이 입힌다. 꼭짓점 색(밑동 그늘, 이끼, 눈)이 있으면 곱한다. top은 절벽 조각의 윗면: 그 자리의 땅 그림을 입힌다
    // 조각(틀로 만든 것, docs/chatgpt-blender.md): UV가 없고 재질 이름만 있다. 이름표(PAL)에 있으면 무늬를 자리와 면 방향으로 입히고(palMat), 없으면 조각에 든 민무늬 빛깔 그대로다
    const pal = PAL[nm] || (rk && !o.geometry.attributes.uv ? { rock: rk[1] } : null), wl = pal && nm.startsWith('wl_');
    if (pal) { o.geometry = o.geometry.toNonIndexed(); o.geometry.computeVertexNormals(); }  // 면마다 평평하게: 둥글린 법선으로는 무늬 방향이 면 안에서 흔들린다
    const t = pal ? null : rk ? rockTex(rk[1]) : sm.map;
    if (t && !rk) { t.magFilter = T.LinearFilter; t.minFilter = T.LinearMipmapLinearFilter; t.generateMipmaps = true; t.anisotropy = R.capabilities.getMaxAnisotropy(); t.needsUpdate = true; }
    const glow = /^(win|lantern)/.test(nm), furn = /^fn_/.test(n);
    // sh: 낮은 땅(골짜기)에 선 절벽 조각은 그 땅만큼 어둡게(terrain의 lowShade와 같은 값). kind: 바위 빛깔을 지도에 맞춰 바꿀 때(모래땅의 바위는 갈색), 방 벽 조각은 벽 종류(palette.js WALLS)
    const mkm = (sh = 1, kind) => { if (top) { const m = topMat(vc); m.color.setScalar(sh); return m; }
      if (pal) { const pt = pal.rock ? rockTex(ROCKT_OK(kind) || pal.rock) : previewTex((wl && WKIND[kind]?.[nm]) || pal.t), m = pt ? palMat(pt, pal.lie) : new T.MeshLambertMaterial({ color: sm.color }); if (sh !== 1) m.color.multiplyScalar(sh); if (furn) m.color.multiplyScalar(FURNK); return m; }
      const tt = rk && kind ? rockTex(kind) : t, m = new T.MeshLambertMaterial({ map: tt || null, color: tt ? 0xffffff : rk ? 0x8a8478 : sm.color, vertexColors: vc }); if (glow) { m.emissive = new T.Color(nm === 'win' ? 0xffb050 : nm === 'win_paper' ? 0xffe6b8 : 0xff6a30); if (tt) m.emissiveMap = tt; m.emissiveIntensity = 0; m.userData.paper = nm === 'win_paper'; GLOW.push(m); }
      // 바위: 그늘진 면이 까맣게 죽지 않게 제 빛깔을 조금 낸다(모난 면마다 밝기가 크게 달라 얼룩져 보였다)
      if (rk && tt) { m.emissive = new T.Color(0xffffff); m.emissiveMap = tt; m.emissiveIntensity = .2 * sh; }
      if (sh !== 1) m.color.multiplyScalar(sh); return tt ? sharpen(m) : m; };
    const mkf = (sh, kind) => { const b = mkm(sh, kind), f = holed(b); if (top) f.customProgramCacheKey = () => 'sharp-top-hole'; else if (b.userData.pal) f.customProgramCacheKey = () => 'sharp-pal-hole'; return f; };
    const kinded = rk || wl;  // 종류에 따라 무늬가 바뀌는 재질
    const M = { m: mkm(), f: mkf(1), d: new T.MeshDepthMaterial({ depthPacking: T.RGBADepthPacking }), v: {}, as: (sh = 1, kind = '') => sh > .995 && (!kind || !kinded || (rk && kind === rk[1])) ? M : (M.v[Math.round(sh * 100) + (kinded ? kind : '')] ||= { m: mkm(sh, kind), f: mkf(sh, kind), d: M.d }) };
    MODELM.set(o.geometry, M); o.material = M.m; o.userData = {}; o.castShadow = o.receiveShadow = true; });
  const lp = g.scene.children.find(c => c.name.startsWith('lamps')) || g.scene.getObjectByName('lamps'); g.scene.userData.lamps = lp?.userData?.pts ? JSON.parse(lp.userData.pts) : []; MODELS[n] = g.scene; } catch (e) { MODELS[n] = null; console.warn('모형 못 읽음', n, e); } }
// 조각의 무늬 재질: 무늬 자리를 모형의 UV가 아니라 '놓인 자리와 면이 보는 방향'에서 셈한다. 조각을 늘이거나 돌려 세워도 무늬 굵기가 그대로고, 옆 조각과 무늬가 이어진다.
//   옆면: 가로는 면을 따라, 세로는 높이(lie면 눕힌다).  평평한 윗면: 무늬의 세로가 조각의 가로(모형 x)를 따른다(탁자의 나뭇결이 길이 방향).  비탈(지붕): 무늬의 세로가 비탈을 따라 오른다
// 무늬 굵기(PALU.uDot)는 지도를 지을 때 정한다: 바깥은 평면도 한 점에 3.2점, 방 안은 사람을 1.45배로 그리니 2.2점
const PALU = { uDot: { value: DOT }, uAmb: { value: .22 } }, ROCKT_OK = k => (k === 'grey' || k === 'brown' || k === 'red' || k === 'snow') && k;
function palMat(t, lie) { const m = new T.MeshLambertMaterial({ map: t }), pt = { value: new T.Vector3(t.image.width, t.image.height, lie ? 1 : 0) }; m.userData.pal = true;
  m.onBeforeCompile = s => { s.uniforms.uDot = PALU.uDot; s.uniforms.uPT = pt; s.uniforms.uAmb = PALU.uAmb; s.fragmentShader = 'uniform float uAmb;\n' + s.fragmentShader.replace('#include <map_fragment>', SHARP + '\n totalEmissiveRadiance += diffuseColor.rgb * uAmb;');  // 빛을 등진 면(옆벽의 안쪽)이 까맣게 죽지 않게 제 빛깔을 조금 낸다(바위 모형과 같은 처리)
    s.vertexShader = 'uniform float uDot; uniform vec3 uPT;\n' + s.vertexShader.replace('#include <project_vertex>', `#include <project_vertex>
#ifdef USE_MAP
 { vec4 wp = modelMatrix * vec4(transformed, 1.); vec3 wn = inverseTransformDirection(transformedNormal, viewMatrix);
   vec3 P = vec3(wp.x, wp.y / ${HS.toFixed(5)}, wp.z / ${ZS.toFixed(5)}), N = normalize(vec3(wn.x, wn.y * ${HS.toFixed(5)}, wn.z * ${ZS.toFixed(5)})); vec2 q; float hl = length(N.xz);
   if (abs(N.y) > .7) { if (hl > .15) { vec2 h = N.xz / hl; q = vec2(dot(P.xz, vec2(h.y, -h.x)), -dot(P.xz, h) / abs(N.y)); }
     else { vec2 ax = normalize((modelMatrix * vec4(1., 0., 0., 0.)).xz); q = vec2(dot(P.xz, vec2(-ax.y, ax.x)), dot(P.xz, ax)); } }
   else { vec2 tg = vec2(N.z, -N.x) / max(hl, 1e-4); q = vec2(dot(P.xz, tg), P.y); if (uPT.z > .5) q = q.yx; }
   vMapUv = q * uDot / uPT.xy; }
#endif`); };
  m.customProgramCacheKey = () => 'sharp-pal'; return m; }
const KITS = new Set();  // 들어와 있는 블렌더 조각의 이름(assets/hd2d/models/kit.json). 이 목록에 있는 것만 소품 그림 대신 세운다(없는 파일을 찾느라 헛걸음하지 않게)
async function loadModels() { try { for (const n of await (await fetch('assets/hd2d/models/kit.json')).json()) KITS.add(n); } catch (e) { } await Promise.all([...new Set([...MODELN, ...[...KITS].filter(n => /^(rw|fn)_/.test(n))])].map(loadModel)); }  // 방의 벽과 가구 조각은 미리 읽어 둔다(방에 들어설 때 그림이 섰다가 조각으로 바뀌는 깜박임이 없게. 가구 여덟 개 110KB)
// 바위 모형의 무늬: 받아 둔 절벽 그림(cl_rock)을 바위 빛깔로 바꿔 쓴다. brown 그대로, grey 잿빛 바위, snow 눈 덮인 바위, red 붉은 바위
const ROCKT = {};
function rockTex(kind) { if (kind in ROCKT) return ROCKT[kind]; const im = art() && PV.cl_rock; if (!im) return null; const c = mk(im.width, im.height), x = c.getContext('2d', { willReadFrequently: true }); x.drawImage(im, 0, 0);
  if (kind !== 'brown') { const d = x.getImageData(0, 0, c.width, c.height), a = d.data, cl = v => Math.max(0, Math.min(255, v));
    for (let i = 0; i < a.length; i += 4) { let r = a[i], g = a[i + 1], b = a[i + 2]; const l = .299 * r + .587 * g + .114 * b; r = (r + (l - r) * .72 - 128) * 1.12 + 128; g = (g + (l - g) * .72 - 128) * 1.12 + 128; b = (b + (l - b) * .72 - 128) * 1.12 + 128;
      r = r * 1.5 + 14; g = g * 1.5 + 14; b = b * 1.5 + 14;  // 잿빛 바위는 밝게(2D 바위 그림의 밝기에 맞춘다. 그늘진 면이 까맣게 죽지 않게)
      if (kind === 'snow') { r = 255 - (255 - r) * .5; g = 255 - (255 - g) * .47; b = 255 - (255 - b) * .4; } else if (kind === 'red') { r *= .92; g *= .6; b *= .56; } else { g *= 1.01; b *= 1.02; }
      a[i] = cl(r); a[i + 1] = cl(g); a[i + 2] = cl(b); }
    x.putImageData(d, 0, 0); }
  const t = texFrom(c, { mips: true }); t.wrapS = t.wrapT = T.RepeatWrapping; t.needsUpdate = true; return ROCKT[kind] = t; }
// 바위 소품 → 블렌더 바위 모형(tools/blender/rocks.py). 자리마다 다른 모양을 고르고, 낱개 바위는 돌려 놓고 바위산은 좌우를 뒤집어 놓는다
const ROCKM = { mtn: ['rk_mtn_', 3], mtn_s: ['rk_mtns_', 3], mtn_d: ['rk_mtnd_', 3], rocks: ['rk_rocks_', 2], rocks_s: ['rk_rockss_', 2], boulder: ['rk_boulder_', 3], g_mossrock: ['rk_pebble_', 2], g_rocks: ['rk_pebble_', 2], crag: ['rk_crag_', 2], crag_b: ['rk_cragb_', 2] };
const ROCKB = { sand: 'brown', rose: 'brown' };  // 바탕이 붉거나 누런 지도의 바위는 절벽과 같은 갈색으로(잿빛 바위가 혼자 떠 보였다). 큰 지도(world)의 바위산은 제 빛깔 그대로
const hash2 = (i, j) => { let h = (i * 374761393 + j * 668265263) | 0; h = (h ^ (h >>> 13)) * 1274126177 | 0; return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
const rockKey = s => { const r = ROCKM[s.name]; return r ? r[0] + (1 + Math.floor(hash2(Math.round(s.x), Math.round(s.y)) * r[1])) : null; };
// 지도에 필요한 모형을 그때그때 읽는다. 다 읽으면 지도를 다시 세운다(그동안은 조립 건물로 보인다)
function needModel(n) { if (n in MODELS) return MODELS[n]; if (!MODELP[n]) { HD.modelsPending = (HD.modelsPending || 0) + 1; MODELP[n] = loadModel(n).then(() => { if (!--HD.modelsPending) curMap = null; }); } return null; }  // 기다리던 모형이 다 오면 지도를 한 번만 다시 짓는다(바위·절벽 모형은 한꺼번에 여럿을 부른다)
function modelKey(s) { const gs = s.grand && GRAND[s.grand]; return gs?.model || (s.grand ? `g_${s.grand}_${s.name}` : SPEC[s.name] ? `b_${s.name}` : null); }
// 사람 도트 시트(n_*)는 people.json에 적힌 것만 읽는다(tools/people_in.py가 시트를 만들며 적는다). 사람 키는 npc id, 역할(talkdata ROLE), 옛 도트 이름(NEWNPC) 순으로 찾는다
const loadImg = n => new Promise(res => { const im = new Image(); im.onload = () => { PV[n] = im; res(); }; im.onerror = res; im.src = `assets/hd2d/preview/${n}.webp`; });
async function loadPeople() { try { const r = await fetch('assets/hd2d/preview/people.json'); if (!r.ok) return; const L = await r.json(); L.forEach(n => PEOPLE.add(n)); await Promise.all(L.map(loadImg)); } catch { } }
// 그림을 다 읽은 뒤에 조각을 읽는다. 조각의 재질은 읽을 때 무늬 그림을 찾아 쓰는데(loadModel의 mkm), 전에는 둘을 한꺼번에 읽어서 조각이 먼저 오면 무늬 없이 단색이 됐다
// (가구 조각을 미리 읽게 하자 탁자와 계산대가 밋밋한 갈색으로 나와서 알았다. 벽 조각의 창틀도 같은 까닭으로 가끔 단색이었을 것이다)
function loadPreview() { return pvP || (pvP = Promise.all([loadPeople(), ...PVN.map(loadImg)]).then(() => loadModels.p ||= loadModels())); }
const art = () => !!HD.opt.art;
function previewTex(name) {
  const im = art() && PV[name]; if (!im) return null; if (TEX.has('p/' + name)) return TEX.get('p/' + name);
  const c = mk(im.width, im.height); c.getContext('2d').drawImage(im, 0, 0); const t = texFrom(c, { mips: name !== 'me' && name !== 'yun' && !name.startsWith('n_') }); if (/^([gre]|hd|cl|wt|pm|fl)_/.test(name)) { t.wrapS = t.wrapT = T.RepeatWrapping; t.needsUpdate = true; } TEX.set('p/' + name, t); return t;
}
// 소품: 도트 그대로 올려 '또렷한 겹선형'으로 읽는다(배경도 인물과 같은 도트 결. 매끈해지는 것은 흐림과 빛뿐)
// 옛 그림(16점 칸, 도트 2배) 소품은 새 그림보다 크고 쨍하다. 새 나무 그림(HT1)이 오기 전까지 새 화면에서만 줄이고 색을 맞춘다(막힘과 2D는 그대로)  // 2026-11-18 독·항아리·상자를 사람 키의 6할쯤으로 더 줄임(일검풍운결 비교)
const OLDSC = { tree_round: .8, tree_big: .8, tree_pine: .82, plum: .76, plum_g: .76, plum_o: .76, grove_green: .86, pot: .42, jar: .42, box: .5, stump: .85, boulder: .85,
  flower1: .58, flower2: .58, flower3: .58, flower4: .58, fern1: .7, fern2: .7, bush1: .72, bush2: .72, bush3: .72, bush4: .72 };
// 옛 그림 → 새 그림(새 화면에서만, 그림이 받아져 있을 때만). 크기는 새 그림의 평면도 폭과 키
const SWAP = { tree_round: 't_camphor', tree_big: 't_camphor', tree_pine: 't_pine', tree_dead: 't_dead', plum: 't_plum', plum_w: 't_plum', plum_g: 't_willow', plum_o: 't_maple', grove_green: 't_shrubs', bamboo: 't_bamboo',
  bush1: 'g_bush', bush2: 'g_bush', bush3: 'g_bush', bush4: 'g_fern', fern1: 'g_fern', fern2: 'g_tallgrass', flower1: 'g_yflowers', flower2: 'g_wflowers', flower3: 'g_yflowers', flower4: 'g_wflowers', stump: 'g_stump', boulder: 'g_mossrock', rocks: 'g_rocks' };
const SWAP_SZ = { t_pine: [40, 47], t_camphor: [48, 48], t_plum: [40, 38], t_willow: [40, 43], t_bamboo: [26, 32], t_maple: [44, 42], t_shrubs: [30, 18], t_dead: [36, 36],
  g_tallgrass: [14, 10], g_fern: [18, 11], g_yflowers: [18, 9], g_wflowers: [18, 8], g_mossrock: [16, 10], g_rocks: [18, 11], g_log: [24, 11], g_stump: [18, 10], g_reeds: [14, 12], g_lily: [18, 11], g_bush: [16, 12], g_ivy: [18, 8] };
function stampTex(name) {
  const pv = previewTex(name); if (pv) return pv;
  if (TEX.has('s/' + name)) return TEX.get('s/' + name);
  const st = STAMPS[name], hd = IMG['stamp/' + name], src = hd || (st && IMG['tiles/' + st[0]]); if (!src) return null;
  const sw = hd ? hd.width : st[3], sh = hd ? hd.height : st[4], sx = hd ? 0 : st[1], sy = hd ? 0 : st[2];
  const c = mk(sw, sh), x = c.getContext('2d'); x.drawImage(src, sx, sy, sw, sh, 0, 0, sw, sh);
  if (OLDSC[name] && art()) { const d = x.getImageData(0, 0, sw, sh); for (let i = 0; i < d.data.length; i += 4) { const r = d.data[i], g = d.data[i + 1], b = d.data[i + 2], l = r * .3 + g * .59 + b * .11;
    d.data[i] = (l + (r - l) * .7) * .92; d.data[i + 1] = (l + (g - l) * .7) * .86; d.data[i + 2] = (l + (b - l) * .7) * .68; } x.putImageData(d, 0, 0); }  // 옛 그림: 채도를 낮추고 누렇게(새 그림과 결을 맞춘다)
  const t = texFrom(c); TEX.set('s/' + name, t); return t;
}
// 인물 시트: 그대로 올린다(작게 줄여 보는 일이 없어 밉맵은 안 만든다)
function sheetTex(key) {
  if (TEX.has(key)) return TEX.get(key); const im = IMG[key]; if (!im) return null;
  const c = mk(im.width, im.height); c.getContext('2d').drawImage(im, 0, 0); const t = texFrom(c, { mips: false }); TEX.set(key, t); return t;
}
// '또렷한 겹선형': 도트 한 점 안은 그 점 색 그대로, 점과 점 사이 경계만 화면 한 점 너비로 부드럽게 잇는다.
// 화면에서 도트가 반 점씩 밀려도 굵기가 들쭉날쭉하지 않고, 걸을 때 반짝이지 않는다. 멀어서 작아지면 밉맵을 그대로 쓴다
const SHARP = `#ifdef USE_MAP
  vec2 tsz = vec2(textureSize(map, 0)), tp = vMapUv * tsz, sm = floor(tp + .5), dd = max(fwidth(tp), vec2(1e-4));
  tp = sm + clamp((tp - sm) / dd, -.5, .5);
  diffuseColor *= textureGrad(map, tp / tsz, dFdx(vMapUv), dFdy(vMapUv));
#endif`;
// 주인공 둘레 구멍: 주인공보다 카메라에 가까운 면에서, 화면의 주인공 자리 둘레 원 안을 도트 무늬로 성기게 지운다(가장자리로 갈수록 덜 지운다)
const HOLE = { uHole: { value: null }, uHoleZ: { value: 0 } };
const holed = m => { const pre = m.onBeforeCompile; m.onBeforeCompile = s => { pre(s); s.uniforms.uHole = HOLE.uHole; s.uniforms.uHoleZ = HOLE.uHoleZ;
  s.fragmentShader = s.fragmentShader.replace('void main() {', `uniform vec3 uHole; uniform float uHoleZ;
float bayer4(vec2 p){ ivec2 q = ivec2(mod(p, 4.)); int i = q.x + q.y * 4; float b[16] = float[16](0.,8.,2.,10.,12.,4.,14.,6.,3.,11.,1.,9.,15.,7.,13.,5.); return (b[i] + .5) / 16.; }
void main() {`).replace('#include <clipping_planes_fragment>', `#include <clipping_planes_fragment>
  { float r = length(gl_FragCoord.xy - uHole.xy) / uHole.z; if (r < 1. && -vViewPosition.z < uHoleZ && smoothstep(.6, 1., r) < bayer4(floor(gl_FragCoord.xy / 2.))) discard; }`); }; m.customProgramCacheKey = () => 'sharp-hole'; return m; };
const sharpen = m => { m.onBeforeCompile = s => { s.fragmentShader = s.fragmentShader.replace('#include <map_fragment>', SHARP); }; m.customProgramCacheKey = () => 'sharp'; return m; };
// 절벽 조각의 윗면 재질: 제 무늬 대신 그 자리의 땅 그림을 위에서 비춘 것처럼 입힌다(땅이 바위 위까지 이어져 보이고, 반듯한 칸 가장자리가 가려진다).
// 땅 그림과 지도 크기는 지도를 지을 때 바꿔 준다(TOPU, TOPS). 무늬 자리는 꼭짓점이 놓인 자리(x, z)에서 셈한다
const TOPU = { uGS: { value: null }, map: null }, TOPS = [];
function topMat(vc) { TOPU.uGS.value ||= new T.Vector2(1, 1); const m = new T.MeshLambertMaterial({ map: TOPU.map, vertexColors: vc });
  m.onBeforeCompile = s => { s.uniforms.uGS = TOPU.uGS; s.fragmentShader = s.fragmentShader.replace('#include <map_fragment>', SHARP);
    s.vertexShader = 'uniform vec2 uGS;\n' + s.vertexShader.replace('#include <project_vertex>', '#include <project_vertex>\n#ifdef USE_MAP\n { vec4 wp = modelMatrix * vec4(transformed, 1.); vMapUv = vec2(wp.x * uGS.x, 1. - wp.z * uGS.y); }\n#endif'); };
  m.customProgramCacheKey = () => 'sharp-top'; TOPS.push(m); return m; }
function matOf(t) {  // 그림마다 재질 하나. 해와 등불을 받고, 그림자를 받는다
  if (MATS.has(t)) return MATS.get(t);
  const m = sharpen(new T.MeshLambertMaterial({ map: t, alphaTest: .5 }));
  const f = holed(sharpen(new T.MeshLambertMaterial({ map: t, alphaTest: .5 })));  // 주인공이 뒤로 들어가면 주인공 둘레만 동그랗게 뚫는다
  const d = new T.MeshDepthMaterial({ depthPacking: T.RGBADepthPacking, map: t, alphaTest: .5 });
  const r = { m, f, d }; MATS.set(t, r); return r;
}
// 땅에 수직으로 선 판. 밑변 가운데가 원점, 키는 HS만큼 늘린다. 빛은 위에서 받는 것처럼(법선이 위) 땅과 같은 밝기로 보인다
function standGeo(w, h) {
  const g = new T.PlaneGeometry(w, h * HS); g.translate(0, h * HS / 2, 0);
  const n = g.attributes.normal; for (let i = 0; i < n.count; i++) n.setXYZ(i, 0, 1, 0); return g;
}

// ── 덩어리 집 ──
// 지붕 처마선: 그림 위에서부터 몇 할에서 맨 위 지붕이 끝나나. 그 아래는 앞벽에, 위는 지붕에 입힌다(여러 층 건물은 맨 위 지붕 아래가 다 앞벽)
const EAVE = { inn: .3, hut_b: .61, hut_o: .56, hut_o2: .71, clay: .46, shop_green: .65, shop_blue: .6, wood_o: .46, wood_b: .6, house_red: .65, hall: .21, lodge: .38, mud: .51, straw: .81 };
const EAVE_PV = { hut_o: .46, hut_b: .47, hut_o2: .5, straw: .5, mud: .45, clay: .38 };  // 새 그림 맛보기(HB1)
const ROOF = Math.tan(25 * DEG);  // 지붕 물매 25도
const WALLS = new Set(['wall_h', 'wall_m', 'wall_v', 'wood_h', 'wood_v', 'fence_h']);
// 네 꼭짓점(왼아래, 오른아래, 오른위, 왼위: 앞에서 본 순서)과 무늬 자리로 면 하나. 법선은 꼭짓점으로 구한다
function face(P, UV) {
  const g = new T.BufferGeometry(), pos = [], uv = [], nor = [], ids = P.length === 4 ? [0, 1, 2, 0, 2, 3] : [0, 1, 2];
  const a = new T.Vector3(...P[0]), n = new T.Vector3(...P[1]).sub(a).cross(new T.Vector3(...P[P.length - 1]).sub(a)).normalize();
  for (const i of ids) { pos.push(...P[i]); uv.push(...UV[i]); nor.push(n.x, n.y, n.z); }
  g.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new T.Float32BufferAttribute(uv, 2)); g.setAttribute('normal', new T.Float32BufferAttribute(nor, 3)); g.computeBoundingSphere(); return g;
}
const topRow = t => { if (t.userData.top !== undefined) return t.userData.top; const { width: w, height: h, data } = t.image; let r = 0; out: for (; r < h; r++) { const y = h - 1 - r; for (let x = 0; x < w; x++) if (data[(y * w + x) * 4 + 3] > 127) break out; } return t.userData.top = r; };
// 앞벽에서 벽 무늬 한 조각을 떠서 되풀이 무늬로(옆벽, 뒷벽). u, v는 0~1(v는 아래가 0)
function strip(t, key, u0, u1, v0, v1) {
  if (TEX.has(key)) return TEX.get(key); const { width: w, height: h, data } = t.image, x0 = Math.floor(u0 * w), x1 = Math.max(x0 + 2, Math.floor(u1 * w)), y0 = Math.floor(v0 * h), y1 = Math.max(y0 + 2, Math.floor(v1 * h)), W2 = x1 - x0, H2 = y1 - y0, d = new Uint8Array(W2 * H2 * 4);
  for (let y = 0; y < H2; y++) for (let x = 0; x < W2; x++) { const i = ((y0 + y) * w + x0 + x) * 4, j = (y * W2 + x) * 4; d[j] = data[i]; d[j + 1] = data[i + 1]; d[j + 2] = data[i + 2]; d[j + 3] = 255; }
  const s = new T.DataTexture(d, W2, H2, T.RGBAFormat, T.UnsignedByteType); s.colorSpace = T.SRGBColorSpace; s.wrapS = s.wrapT = T.RepeatWrapping; s.magFilter = T.LinearFilter; s.minFilter = T.LinearMipmapLinearFilter; s.generateMipmaps = true; s.needsUpdate = true;
  s.userData.tw = W2 / w; s.userData.th = H2 / h; TEX.set(key, s); return s;
}
// 집 덩어리: 막힘 상자가 밑면. 앞벽에 그림의 벽 부분, 지붕(앞뒤 사다리꼴, 양옆 세모)에 지붕 부분, 옆벽과 뒷벽에 앞벽에서 뜬 무늬를 어둡게.
// 지붕 높이는 정면에서 볼 때 그림의 지붕 높이와 비슷하게 잡는다(앞 비탈이 그림의 지붕이 된다)
function houseBox(s, t, W_, H_, ef) {
  const st = STAMPS[s.name], sc = s.sc || 1, x0 = s.x + st[5] * sc, x1 = x0 + st[7] * sc, yb = s.y + st[6] * sc, yf = yb + st[8] * sc, dp = yf - yb;
  const zf = yf * ZS, zb = yb * ZS, zm = (zf + zb) / 2, D = zf - zb, eave = ef * H_, top = topRow(t) / t.image.height * H_;
  const Hw = Math.max(6, (H_ - eave) * HS), ov = 2.5, Hr = (D / 2 + ov * ZS) * ROOF, yr = Hw + Hr, ye = Hw - .6 * HS;  // 지붕은 정해진 물매로(그림 지붕은 앞 비탈에 늘여 입힌다)
  const rx0 = s.x, rx1 = s.x + W_, zfe = zf + ov * ZS, zbe = zb - ov * ZS, vE = 1 - ef, vT = 1 - top / H_, u0 = (x0 - s.x) / W_, u1 = (x1 - s.x) / W_;
  const M = matOf(t), ws = strip(t, 'w/' + s.name + (previewTex(s.name) ? '/p' : ''), u0 + .03, u0 + .17, .08, Math.max(.1, vE - .04)), WM = matOf(ws); WM.m.color.setScalar(.8); WM.f.color.setScalar(.8);
  const tw = ws.userData.tw * W_, th = ws.userData.th * H_ * HS, g = new T.Group(); g.userData = { s, house: true };
  const add = (geo, Mt, tx) => { const o = new T.Mesh(geo, Mt.m); o.customDepthMaterial = Mt.d; o.castShadow = o.receiveShadow = true; o.userData = { M: Mt, t: tx, owner: g }; g.add(o); };
  add(face([[x0, 0, zf], [x1, 0, zf], [x1, Hw, zf], [x0, Hw, zf]], [[u0, 0], [u1, 0], [u1, vE], [u0, vE]]), M, t);  // 앞벽
  // 우진각 지붕: 그림의 지붕은 위로 갈수록 좁은 사다리꼴이라, 용마루 폭을 그림에서 재서 앞뒤는 사다리꼴, 양옆은 세모 비탈로 덮는다
  const vR = vT - (vT - vE) * .1, xa = s.x + W_ * .2, xb = s.x + W_ * .8, ua = .2, ub = .8;  // 용마루는 그림 지붕 꼭대기 조금 아래(장식이 듬성한 줄은 버린다). 양옆으로 폭의 2할씩 들어간다
  add(face([[rx0, ye, zfe], [rx1, ye, zfe], [xb, yr, zm], [xa, yr, zm]], [[0, vE], [1, vE], [ub, vR], [ua, vR]]), M, t);  // 앞 지붕: 그림의 지붕
  const v0 = vE + (vT - vE) * .12, v1 = vE + (vT - vE) * .55;  // 뒤와 옆 비탈은 지붕 그림 가운데의 꽉 찬 기와 자리로 입힌다(가장자리와 꼭대기는 그림이 비어 있다)
  add(face([[rx1, ye, zbe], [rx0, ye, zbe], [xa, yr, zm], [xb, yr, zm]], [[.7, v0], [.3, v0], [.42, v1], [.58, v1]]), M, t);  // 뒤 지붕
  add(face([[rx0, ye, zbe], [rx0, ye, zfe], [xa, yr, zm]], [[.34, v0], [.66, v0], [.5, v1]]), M, t);  // 왼 비탈
  add(face([[rx1, ye, zfe], [rx1, ye, zbe], [xb, yr, zm]], [[.34, v0], [.66, v0], [.5, v1]]), M, t);  // 오른 비탈
  const a = D / tw, hb = Hw / th;
  add(face([[x0, 0, zb], [x0, 0, zf], [x0, Hw, zf], [x0, Hw, zb]], [[0, 0], [a, 0], [a, hb], [0, hb]]), WM, null);  // 왼벽
  add(face([[x1, 0, zf], [x1, 0, zb], [x1, Hw, zb], [x1, Hw, zf]], [[0, 0], [a, 0], [a, hb], [0, hb]]), WM, null);  // 오른벽
  add(face([[x1, 0, zb], [x0, 0, zb], [x0, Hw, zb], [x1, Hw, zb]], [[0, 0], [(x1 - x0) / tw, 0], [(x1 - x0) / tw, hb], [0, hb]]), WM, null);  // 뒷벽
  return g;
}
// 담 덩어리: 막힘 상자를 밑면으로, 그림의 아랫부분을 앞면에, 윗부분을 윗면에. 옆면은 앞면 무늬를 어둡게
// 담장·울타리(ChatGPT HD1·HD2): 좌우가 맞물리는 한 칸 그림을 담 길이를 따라 되풀이해 깐다. 구화성(고을)은 성벽, 문파·세가는 회벽 기와담
const HDH = { hd_wall_tile: 26, hd_wall_stone: 18, hd_wall_rampart: 34, hd_fence_stake: 22, hd_fence_bamboo: 17, hd_fence_wattle: 15 };
function hdWall(s, m) {
  const n = s.name; if (n === 'wall_h' || n === 'wall_m' || n === 'wall_v') return m.id === 'guhwa' ? 'hd_wall_rampart' : 'hd_wall_tile';
  return { wood_h: 'hd_fence_stake', wood_v: 'hd_fence_stake', fence_h: 'hd_fence_wattle', p_stonewall: 'hd_wall_stone', p_bamboofence: 'hd_fence_bamboo' }[n];
}
function wallRun(s, k) {
  const st = STAMPS[s.name], sc = s.sc || 1, x0 = s.x + st[5] * sc, x1 = x0 + st[7] * sc, yb = s.y + st[6] * sc, yf = yb + st[8] * sc, zf = yf * ZS, zb = yb * ZS;
  const t = previewTex(k), H = HDH[k], Hw = H * HS, P = H * t.image.width / t.image.height, top = 1 - 1.5 / t.image.height;  // P: 그림 한 장이 덮는 길이
  const M = matOf(t), g = new T.Group(); g.userData = { s, wall: true };
  const add = (geo) => { const o = new T.Mesh(geo, M.m); o.customDepthMaterial = M.d; o.castShadow = o.receiveShadow = true; o.userData = { M, t, owner: g }; g.add(o); };
  add(face([[x0, 0, zf], [x1, 0, zf], [x1, Hw, zf], [x0, Hw, zf]], [[x0 / P, 0], [x1 / P, 0], [x1 / P, 1], [x0 / P, 1]]));  // 앞면
  add(face([[x1, 0, zb], [x0, 0, zb], [x0, Hw, zb], [x1, Hw, zb]], [[x1 / P, 0], [x0 / P, 0], [x0 / P, 1], [x1 / P, 1]]));  // 뒷면
  add(face([[x0, 0, zb], [x0, 0, zf], [x0, Hw, zf], [x0, Hw, zb]], [[yb / P, 0], [yf / P, 0], [yf / P, 1], [yb / P, 1]]));  // 왼면(세로 담에서 보인다)
  add(face([[x1, 0, zf], [x1, 0, zb], [x1, Hw, zb], [x1, Hw, zf]], [[yf / P, 0], [yb / P, 0], [yb / P, 1], [yf / P, 1]]));  // 오른면
  if (!/fence/.test(k)) add(face([[x0, Hw, zf], [x1, Hw, zf], [x1, Hw, zb], [x0, Hw, zb]], [[x0 / P, top], [x1 / P, top], [x1 / P, 1], [x0 / P, 1]]));  // 윗면: 그림 맨 윗줄(기와, 갓돌)
  return g;
}
function wallBox(s, t, W_, H_) {
  const st = STAMPS[s.name], sc = s.sc || 1, x0 = s.x + st[5] * sc, x1 = x0 + st[7] * sc, yb = s.y + st[6] * sc, yf = yb + st[8] * sc, zf = yf * ZS, zb = yb * ZS;
  const top = topRow(t) / t.image.height * H_, vis = H_ - top, cap = Math.min(vis * .4, yf - yb), Hw = Math.max(4, (vis - cap) * HS), vC = 1 - (top + cap) / H_, vT = 1 - top / H_;
  const M = matOf(t), g = new T.Group(), u0 = (x0 - s.x) / W_, u1 = (x1 - s.x) / W_; g.userData = { s, wall: true };
  const add = (geo) => { const o = new T.Mesh(geo, M.m); o.customDepthMaterial = M.d; o.castShadow = o.receiveShadow = true; o.userData = { M, t, owner: g }; g.add(o); };
  add(face([[x0, 0, zf], [x1, 0, zf], [x1, Hw, zf], [x0, Hw, zf]], [[u0, 0], [u1, 0], [u1, vC], [u0, vC]]));  // 앞면
  add(face([[x0, Hw, zf], [x1, Hw, zf], [x1, Hw, zb], [x0, Hw, zb]], [[u0, vC], [u1, vC], [u1, vT], [u0, vT]]));  // 윗면
  add(face([[x0, 0, zb], [x0, 0, zf], [x0, Hw, zf], [x0, Hw, zb]], [[u0, 0], [u0 + .2, 0], [u0 + .2, vC], [u0, vC]]));  // 왼면
  add(face([[x1, 0, zf], [x1, 0, zb], [x1, Hw, zb], [x1, Hw, zf]], [[u1 - .2, 0], [u1, 0], [u1, vC], [u1 - .2, vC]]));  // 오른면
  add(face([[x1, 0, zb], [x0, 0, zb], [x0, Hw, zb], [x1, Hw, zb]], [[u1, 0], [u0, 0], [u0, vC], [u1, vC]]));  // 뒷면
  return g;
}

// ── 새 그림: 부품으로 짓는 집(HW0 벽 + HR1 지붕 무늬) ──
const LAMPX = [];  // 지도를 세우며 모으는 등불 자리(집 앞벽 등롱)
const PARTS = { hut_o: 'r_orange', hut_b: 'r_dark', hut_o2: 'r_thatch', straw: 'r_thatch', mud: 'r_thatch', clay: 'r_mud' };
const WALLSET = { hut_o: 'w1', hut_b: 'w2', hut_o2: 'w3' };  // HW1 세 채. 나머지 살림집은 HW0
const EAVES = { r_orange: 'e_orange', r_dark: 'e_dark', r_thatch: 'e_thatch', r_plank: 'e_plank', r_mud: 'e_plank', r_snow: 'e_dark' };
let SOFFIT = null, VERGE = null, AO = null, build = null; const GLOW = [];
const aoTex = () => { if (!AO) { const c = mk(64, 64), x = c.getContext('2d'), gr = x.createRadialGradient(32, 32, 8, 32, 32, 32); gr.addColorStop(0, 'rgba(0,0,0,.75)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = gr; x.fillRect(0, 0, 64, 64); AO = new T.CanvasTexture(c); } return AO; };
function partsBox(s, rk) {
  const st = STAMPS[s.name], sc = s.sc || 1, x0 = s.x + st[5] * sc, x1 = x0 + st[7] * sc, yb = s.y + st[6] * sc, yf = yb + st[8] * sc, ws = WALLSET[s.name];
  const F = (ws && previewTex(ws + '_front')) || previewTex('w_front'), Sd = (ws && previewTex(ws + '_side')) || previewTex('w_side'), Rt = previewTex(rk), Et = previewTex(EAVES[rk]), Rg = previewTex('e_ridge');
  // 벽은 사람 키의 두 배(문은 사람보다 조금 높다). 바닥 넓이는 막힘 상자 그대로. 처마는 앞뒤로 4점, 옆으로 6점 내민다
  const zf = yf * ZS, zb = yb * ZS, zm = (zf + zb) / 2, D = zf - zb, cw = x1 - x0, Hw = 2 * CHAR * HS, ov = 4, ovx = 6, Hr = (D / 2 + ov * ZS) * ROOF;
  const fh = Et ? Et.image.height / DOT * HS : 4, yr = Hw + Hr, ye = Hw + 1, zfe = zf + ov * ZS, zbe = zb - ov * ZS, rx0 = x0 - ovx, rx1 = x1 + ovx, vS = 1 - SIDE_RECT;
  const g = new T.Group(); g.userData = { s, house: true };
  LAMPX.push([x0 + cw * .3, yf + .5, Hw / HS * .55], [x0 + cw * .7, yf + .5, Hw / HS * .55]);  // 앞벽의 등롱 둘
  const add = (geo, tx, Mt = matOf(tx)) => { const o = new T.Mesh(geo, Mt.m); o.customDepthMaterial = Mt.d; o.castShadow = o.receiveShadow = true; o.userData = { M: Mt, t: tx, owner: g }; g.add(o); return o; };
  add(face([[x0, 0, zf], [x1, 0, zf], [x1, Hw, zf], [x0, Hw, zf]], [[0, 0], [1, 0], [1, 1], [0, 1]]), F);  // 앞벽
  add(face([[x1, 0, zb], [x0, 0, zb], [x0, Hw, zb], [x1, Hw, zb]], [[0, 0], [1, 0], [1, vS], [0, vS]]), Sd);  // 뒷벽: 옆벽 네모 부분을 늘여
  add(face([[x0, 0, zb], [x0, 0, zf], [x0, Hw, zf], [x0, Hw, zb]], [[0, 0], [1, 0], [1, vS], [0, vS]]), Sd);  // 왼벽
  add(face([[x1, 0, zf], [x1, 0, zb], [x1, Hw, zb], [x1, Hw, zf]], [[0, 0], [1, 0], [1, vS], [0, vS]]), Sd);  // 오른벽
  add(face([[x0, Hw, zb], [x0, Hw, zf], [x0, yr, zm]], [[0, vS], [1, vS], [.5, 1]]), Sd);  // 박공 왼쪽
  add(face([[x1, Hw, zf], [x1, Hw, zb], [x1, yr, zm]], [[0, vS], [1, vS], [.5, 1]]), Sd);  // 박공 오른쪽
  // 지붕: 무늬를 도트 굵기대로 되풀이한다. 기와 골이 처마에서 용마루로 올라간다
  const tw = Rt.image.width / DOT, th = Rt.image.height / DOT, L = Math.hypot(zfe - zm, yr - ye), U = (rx1 - rx0) / tw, Vv = L / th;
  add(face([[rx0, ye, zfe], [rx1, ye, zfe], [rx1, yr, zm], [rx0, yr, zm]], [[0, 0], [U, 0], [U, Vv], [0, Vv]]), Rt);  // 앞 지붕
  add(face([[rx1, ye, zbe], [rx0, ye, zbe], [rx0, yr, zm], [rx1, yr, zm]], [[0, 0], [U, 0], [U, Vv], [0, Vv]]), Rt);  // 뒤 지붕
  // 지붕 두께와 처마: 처마 끝에 처마 띠(HR2)를 드리우고, 처마 밑(벽 위에서 처마 끝까지)은 어두운 판으로 막는다. 옆 끝에는 박공널
  SOFFIT ||= { m: new T.MeshLambertMaterial({ color: '#1a130e' }), f: holed(new T.MeshLambertMaterial({ color: '#1a130e' })), d: new T.MeshDepthMaterial({ depthPacking: T.RGBADepthPacking }) };
  VERGE ||= { m: new T.MeshLambertMaterial({ color: '#3a2a1e' }), f: holed(new T.MeshLambertMaterial({ color: '#3a2a1e' })), d: SOFFIT.d };
  add(face([[rx0, ye - fh, zfe], [rx1, ye - fh, zfe], [rx1, Hw - 1, zf], [rx0, Hw - 1, zf]], [[0, 0], [1, 0], [1, 1], [0, 1]]), null, SOFFIT).userData.t = null;  // 앞 처마 밑
  add(face([[rx1, ye - fh, zbe], [rx0, ye - fh, zbe], [rx0, Hw - 1, zb], [rx1, Hw - 1, zb]], [[0, 0], [1, 0], [1, 1], [0, 1]]), null, SOFFIT).userData.t = null;  // 뒤 처마 밑
  const vt = 2.6 * HS;
  for (const [x, sgn] of [[rx0, -1], [rx1, 1]]) {  // 박공널(지붕 옆 끝 두께)
    const P = sgn < 0 ? [[x, ye - vt, zbe], [x, ye - vt, zfe], [x, ye, zfe], [x, yr, zm], [x, ye, zbe]] : [[x, ye - vt, zfe], [x, ye - vt, zbe], [x, ye, zbe], [x, yr, zm], [x, ye, zfe]];
    add(face([P[0], P[1], P[2]], [[0, 0], [1, 0], [1, 1]]), null, VERGE); add(face([P[0], P[2], P[4]], [[0, 0], [1, 1], [0, 1]]), null, VERGE);
    add(face([P[2], [x, yr - vt, zm], P[3]].map(q => q), [[0, 0], [1, 0], [1, 1]]), null, VERGE); }
  if (Et) { const U2 = (rx1 - rx0) / (Et.image.width / DOT);  // 처마 띠: 앞뒤 처마 끝에 드리운다
    add(face([[rx0, ye - fh, zfe + .3], [rx1, ye - fh, zfe + .3], [rx1, ye + .4, zfe + .3], [rx0, ye + .4, zfe + .3]], [[0, 0], [U2, 0], [U2, 1], [0, 1]]), Et);
    add(face([[rx1, ye - fh, zbe - .3], [rx0, ye - fh, zbe - .3], [rx0, ye + .4, zbe - .3], [rx1, ye + .4, zbe - .3]], [[0, 0], [U2, 0], [U2, 1], [0, 1]]), Et); }
  if (Rg && rk !== 'r_thatch') { const U3 = (rx1 - rx0) / (Rg.image.width / DOT), rh = Rg.image.height / DOT * HS;  // 용마루
    add(face([[rx0, yr - rh * .35, zm + .6], [rx1, yr - rh * .35, zm + .6], [rx1, yr + rh * .65, zm + .6], [rx0, yr + rh * .65, zm + .6]], [[0, 0], [U3, 0], [U3, 1], [0, 1]]), Rg); }
  // 벽과 땅이 만나는 곳을 어둡게: 바닥 둘레에 어두운 띠를 깐다
  if (!AO) { const c = mk(64, 64), x = c.getContext('2d'), gr = x.createRadialGradient(32, 32, 8, 32, 32, 32); gr.addColorStop(0, 'rgba(0,0,0,.75)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = gr; x.fillRect(0, 0, 64, 64); AO = new T.CanvasTexture(c); }
  { const pad = 7, o = new T.Mesh(new T.PlaneGeometry(cw + pad * 2, D + pad * 2 * ZS), new T.MeshBasicMaterial({ map: AO, transparent: true, depthWrite: false, fog: false })); o.rotation.x = -Math.PI / 2; o.position.set((x0 + x1) / 2, .25, zm); o.renderOrder = 1; o.userData = { owner: g, flat: true }; g.add(o); }
  return g;
}
// 새 땅(HG1): 칸 종류마다 무늬를 도트 굵기대로 깐다. 칸 경계는 낮은 잡음으로 흔들어 네모 칸이 드러나지 않게. 무늬가 없는 칸(물, 마루)은 예전 땅을 쓴다
const GROUND = { 0: 'g_grass', 1: 'g_road', 3: 'g_yard', 4: 'g_plank', 5: 'g_cobble' };  // 4: 나루와 다리의 널(받아 둔 HP5의 선착장 판자. 전에는 2D 타일을 키워 써서 뭉개졌다), 5: 비무대·광장 바닥(막돌)
// 땅 종류마다 풀 그림 색 바꾸기(새 땅 그림이 오기 전까지). 풀은 짙은 올리브(기준 화면의 풀은 누런 올리브와 갈색)
const BIOME_T = { grass: (r, g, b) => [r + 6, g * .9 + 2, b * .55], plain: (r, g, b) => [r + 6, g * .9 + 2, b * .55], rose: (r, g, b) => [r + 6, g * .9 + 2, b * .55],
  deep: (r, g, b) => [r * .78, g * .86, b * .5], sand: (r, g, b, l) => [l * 1.05 + 78, l * .86 + 56, l * .5 + 28], snow: (r, g, b, l) => [l * .45 + 168, l * .45 + 172, l * .4 + 184],  // 모래와 눈은 받은 땅 그림(g_sand, g_snow)이 있으면 그걸 쓴다
  dusk: (r, g, b, l) => [l * .62 + 36, l * .5 + 26, l * .48 + 24] };
const DECO = { grass: 1, plain: 1, rose: 1, deep: 1 };
// 땅 얼룩 세기: 흙 드러난 자리, 짙은 자리, 이끼. 눈에는 흙과 이끼가 없고 엷은 그늘만
const MOTTLE = { grass: { dirt: 1, dark: 1, moss: 1 }, plain: { dirt: 1, dark: 1, moss: 1 }, rose: { dirt: 1, dark: 1, moss: 1 }, deep: { dirt: .7, dark: 1, moss: 1 }, sand: { dirt: .6, dark: .6, moss: 0, dc: [120, 84, 48] }, dusk: { dirt: .6, dark: .8, moss: 0, dc: [70, 52, 40] }, snow: { dirt: 0, dark: .3, moss: 0 } };  // 풀 포기를 흩뿌리는 땅
function groundArt(m, base) {
  if (m.room) return null;  // 방 바닥은 2D 마루·돌바닥 그림 그대로
  if (!art() || !PV.g_grass || m.room) return null;
  const W2 = Math.round(m.w * TS * DOT), H2 = Math.round(m.h * TS * DOT), c = mk(W2, H2), x = c.getContext('2d'), out = x.createImageData(W2, H2), o = out.data;
  const GB = { sand: 'g_sand', snow: 'g_snow' }[m.biome], pats = {}; for (const k in GROUND) { const nm = k === '0' && GB && PV[GB] ? GB : GROUND[k], im = PV[nm]; if (!im) continue; const q = mk(im.width, im.height).getContext('2d', { willReadFrequently: true }); q.drawImage(im, 0, 0); const d = q.getImageData(0, 0, im.width, im.height).data;
    if (nm === 'g_road' && m.biome === 'snow') for (let i = 0; i < d.length; i += 4) { const l = d[i] * .3 + d[i + 1] * .59 + d[i + 2] * .11; d[i] = l * .5 + 120; d[i + 1] = l * .5 + 124; d[i + 2] = l * .45 + 136; }  // 눈 위 길: 밟아 다진 회색 눈
    if (nm === 'g_grass') { const bt = BIOME_T[m.biome] || BIOME_T.grass; for (let i = 0; i < d.length; i += 4) { const l = d[i] * .3 + d[i + 1] * .59 + d[i + 2] * .11; [d[i], d[i + 1], d[i + 2]] = bt(d[i], d[i + 1], d[i + 2], l).map(v => Math.max(0, Math.min(255, v))); } }  // 풀 그림을 땅 종류(모래, 눈, 짙은 숲, 어스름)에 맞게 다시 칠한다
    pats[k] = { w: im.width, h: im.height, d }; }
  const bw = base.width, bd = base.getContext('2d', { willReadFrequently: true }).getImageData(0, 0, bw, base.height).data;
  const hs = (i, j) => { let h = (i * 374761393 + j * 668265263) | 0; h = (h ^ (h >>> 13)) * 1274126177 | 0; return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
  const nz = (u, v, k) => { const i = Math.floor(u), j = Math.floor(v), fu = u - i, fv = v - j, a = fu * fu * (3 - 2 * fu), b = fv * fv * (3 - 2 * fv), A = hs(i + k, j), B = hs(i + 1 + k, j), C = hs(i + k, j + 1), E = hs(i + 1 + k, j + 1); return A + (B - A) * a + (C - A) * b + (A - B - C + E) * a * b; };
  const cell = TS * DOT, S = 1 / 18;  // 잡음 크기: 도트 18점마다 한 마디
  // 가로로 난 길은 무늬를 눕혀 깐다(수레 자국이 길을 따라 나게). 그 칸을 지나는 길이 세로보다 가로로 더 길게 이어지면 가로 길로 본다
  // (전에는 위아래가 다 길인 칸을 세로 길로 봐서, 너비 세 칸짜리 가로 길의 가운데 줄만 자국이 세로로 서서 글자처럼 끊겨 보였다)
  const runs = v => { const G1 = (x, y) => m.g[y]?.[x] === v, HR = m.g.map(r => new Int16Array(r.length)), VR = m.g.map(r => new Int16Array(r.length));
    for (let y = 0; y < HR.length; y++) for (let x = 0, n = HR[y].length; x < n;) { if (!G1(x, y)) { x++; continue; } let e = x; while (e < n && G1(e, y)) e++; HR[y].fill(e - x, x, e); x = e; }
    for (let x = 0, n = HR[0]?.length || 0; x < n; x++) for (let y = 0; y < VR.length;) { if (!G1(x, y)) { y++; continue; } let e = y; while (e < VR.length && G1(x, e)) e++; for (let j = y; j < e; j++) VR[j][x] = e - y; y = e; }
    return [HR, VR]; };
  // 널(4): 무늬는 널이 세로로 선 그림이다. 널은 다니는 방향을 가로질러 놓인다: 위아래로 뭍에 닿는 나루는 눕혀 깔고(널이 가로), 좌우로 뭍에 닿는 다리는 그대로 둔다(널이 세로).
  // 둘 다이거나 둘 다 아니면 더 긴 쪽을 다니는 방향으로 본다
  const [HR, VR] = runs(1), [HP, VP] = runs(4), land = (x, y) => m.g[y]?.[x] !== undefined && m.g[y][x] !== 2 && m.g[y][x] !== 4;
  const PL = m.g.map((r, y) => r.map((v, x) => { if (v !== 4) return false; let a = x, b = x, c = y, d = y; while (m.g[y][a - 1] === 4) a--; while (m.g[y][b + 1] === 4) b++; while (m.g[c - 1]?.[x] === 4) c--; while (m.g[d + 1]?.[x] === 4) d++;
    const ew = land(a - 1, y) || land(b + 1, y), ns = land(x, c - 1) || land(x, d + 1); return ew !== ns ? ns : VP[y][x] >= HP[y][x]; }));
  const lie = (x, y) => m.g[y][x] === 4 ? PL[y][x] : HR[y]?.[x] > VR[y]?.[x];
  // 흔들림은 도트 두 점마다 한 번만 잰다(경계가 도트 크기로 각지고, 세우는 시간이 4분의 1)
  const bw2 = (W2 >> 1) + 1, bh2 = (H2 >> 1) + 1, JX = new Float32Array(bw2 * bh2), JY = new Float32Array(bw2 * bh2);
  // 풀밭 얼룩: 흙 드러난 자리, 짙은 풀, 이끼를 큰 잡음과 작은 잡음으로 섞는다(넓은 풀밭이 고르게 보이지 않게)
  const NA = new Float32Array(bw2 * bh2), NB = new Float32Array(bw2 * bh2), NC = new Float32Array(bw2 * bh2);
  for (let b = 0; b < bh2; b++) for (let a = 0; a < bw2; a++) { const X = a * 2, Y = b * 2, k = b * bw2 + a; NA[k] = nz(X * S / 4, Y * S / 4, 31) * .7 + nz(X * S, Y * S, 17) * .3; NB[k] = nz(X * S / 2.5, Y * S / 2.5, 77) * .75 + nz(X * S * 2, Y * S * 2, 5) * .25; NC[k] = nz(X * S / 3, Y * S / 3, 133); }
  const DIRT = [92, 70, 40], DARK = [.62, .64, .5], MOSS = [96, 98, 34];
  for (let b = 0; b < bh2; b++) for (let a = 0; a < bw2; a++) { const X = a * 2, Y = b * 2, k = b * bw2 + a; JX[k] = (nz(X * S, Y * S, 0) - .5) * .55 + (nz(X * S * 3, Y * S * 3, 7) - .5) * .2; JY[k] = (nz(X * S, Y * S, 91) - .5) * .55 + (nz(X * S * 3, Y * S * 3, 53) - .5) * .2; }
  for (let Y = 0; Y < H2; Y++) for (let X = 0; X < W2; X++) {
    const k = (Y >> 1) * bw2 + (X >> 1), jx = JX[k], jy = JY[k];
    let tx = Math.min(m.w - 1, Math.max(0, Math.floor(X / cell + jx))), ty = Math.min(m.h - 1, Math.max(0, Math.floor(Y / cell + jy))); const ux = Math.min(m.w - 1, Math.floor(X / cell)), uy = Math.min(m.h - 1, Math.floor(Y / cell));
    if (m.g[uy][ux] === 4 || m.g[ty][tx] === 4) { tx = ux; ty = uy; }  // 널은 사람이 깐 것이라 가장자리를 흔들지 않는다(칸 그대로 곧게)
    const p = pats[m.g[ty][tx]], i = (Y * W2 + X) * 4;
    if (p) { const j = (lie(tx, ty) ? (X % p.h) * p.w + Y % p.w : (Y % p.h) * p.w + X % p.w) * 4; o[i] = p.d[j]; o[i + 1] = p.d[j + 1]; o[i + 2] = p.d[j + 2];
      if (m.g[ty][tx] === 0 && MOTTLE[m.biome || 'grass']) { const r = hs(X >> 1, Y >> 1) * .12, mo = MOTTLE[m.biome || 'grass'];  // 도트 두 점마다 떨림을 줘 경계를 도트로 끊는다
        if (NA[k] > .66 + r) { const t = Math.min(1, (NA[k] - .66) * 5) * mo.dirt; for (let c = 0; c < 3; c++) o[i + c] = o[i + c] * (1 - t * .8) + (mo.dc || DIRT)[c] * t * .8 * (.8 + (p.d[j] / 255) * .5); }
        else if (NB[k] < .34 - r) for (let c = 0; c < 3; c++) o[i + c] *= 1 - (1 - DARK[c]) * mo.dark;
        else if (NC[k] > .7 + r && mo.moss) for (let c = 0; c < 3; c++) o[i + c] = o[i + c] * .55 + MOSS[c] * .45 * (o[i + 1] / 120); } }
    else { const j = (Math.floor(Y / DOT) * bw + Math.floor(X / DOT)) * 4; o[i] = bd[j]; o[i + 1] = bd[j + 1]; o[i + 2] = bd[j + 2]; }
    o[i + 3] = 255;
  }
  x.putImageData(out, 0, 0); return c;
}

// ── 땅 높낮이 ──
const LV = 9;  // 한 단의 높이(세상 단위, 사람 키의 6할쯤)
const cliffs = [];
const lowest = m => Math.min(0, ...m.hgt.flat()) * LV * HS;
// 칸 네 모서리 높이(북서, 북동, 남서, 남동). 계단은 북쪽 모서리가 제 높이, 남쪽 모서리가 남쪽 칸 높이
function corners4(m, x, y) {
  if (x < 0 || y < 0 || x >= m.w || y >= m.h) { const h = lowest(m) - 1; return [h, h, h, h]; }
  const h = m.hgt[y][x] * LV * HS; if (m.stair?.[x + ',' + y] && m.hgt[y + 1]) { const s = m.hgt[y + 1][x] * LV * HS; return [h, h, s, s]; } return [h, h, h, h];
}
// 평면도 자리(x, y)의 땅 높이(사람과 소품을 세울 때)
function hAt(m, x, y) { if (!m?.hgt) return 0; const tx = Math.floor(x / TS), ty = Math.floor(y / TS), c = corners4(m, tx, ty), f = Math.min(1, Math.max(0, y / TS - ty)); return c[0] + (c[2] - c[0]) * f; }
// 절벽·계단 재질(지도마다 새로 만들지 않는다). 면은 꼭짓점 색으로 밑동을 어둡게 한다
const KMAT = new Map();
function kmat(name) { if (KMAT.has(name)) return KMAT.get(name); const t = previewTex(name); if (!t) return null; const mt = sharpen(new T.MeshLambertMaterial({ map: t, vertexColors: true })); KMAT.set(name, mt); return mt; }
// 낮은 땅일수록 어둡게(낭떠러지 아래). 0단 위로는 그대로
const lowShade = lv => lv >= 0 ? 1 : Math.max(.3, 1 + lv * .11);
const ROCK_W = 88.4, ROCK_H = 21.2, STEP_W = 32.5, STEPS = 4;  // 그림의 평면도 크기(tools/cliff_in.py), 한 단에 디딤판 넷
function terrain(m, gt) {
  const mk = () => ({ P: [], U: [], N: [], C: [] }), top = mk(), S = { stone: mk(), wood: mk(), rock: mk(), step: mk() }, z = y => y * TS * ZS;
  const quad = (B, a, b, c, d, ua, ub, uc, ud, n, ca = 1, cb = ca, cc = cb, cd = ca) => { for (const [q, u, k] of [[a, ua, ca], [b, ub, cb], [c, uc, cc], [a, ua, ca], [c, uc, cc], [d, ud, cd]]) { B.P.push(...q); B.U.push(...u); B.N.push(...n); B.C.push(k, k, k); } };
  const rocky = m.face === 'rock' && !!previewTex('cl_rock'), stepArt = !!previewTex('cl_step');
  const lvOf = (x, y) => m.hgt[y]?.[x] ?? 0, isStair = (x, y) => !!m.stair?.[x + ',' + y];
  for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) {
    const [nw, ne, sw, se] = corners4(m, x, y), x0 = x * TS, x1 = x0 + TS, z0 = z(y), z1 = z(y + 1), u0 = x / m.w, u1 = (x + 1) / m.w, v0 = 1 - y / m.h, v1 = 1 - (y + 1) / m.h, sh = lowShade(lvOf(x, y));
    const d = nw - sw, kind = m.g[y][x] === 4 ? 'wood' : rocky ? 'rock' : 'stone';
    if (isStair(x, y) && stepArt && kind !== 'wood' && Math.abs(d) > .5) {
      // 계단: 비탈 대신 디딤판을 놓는다. 사람은 비탈(hAt)을 따라 걷고, 디딤판은 그 비탈을 가운데로 지나게 반 단 어긋나 있다
      const n = Math.max(1, Math.round(Math.abs(d) / (LV * HS) * STEPS)), dz = (z1 - z0) / n, ua = x0 / STEP_W, ub = x1 / STEP_W, lo = Math.min(sw, nw), up = d > 0;
      for (let i = 0; i < n; i++) { const za = up ? z1 - dz * i : z0 + dz * i, zb = up ? za - dz : za + dz, ht = lo + Math.abs(d) * (i + .5) / n, hb = i ? lo + Math.abs(d) * (i - .5) / n : lo;
        quad(S.step, [x0, ht, Math.max(za, zb)], [x1, ht, Math.max(za, zb)], [x1, ht, Math.min(za, zb)], [x0, ht, Math.min(za, zb)], [ua, .4], [ub, .4], [ub, 1], [ua, 1], [0, 1, 0], sh);
        if (up) quad(S.step, [x0, hb, za], [x1, hb, za], [x1, ht, za], [x0, ht, za], [ua, 0], [ub, 0], [ub, .4], [ua, .4], [0, 0, 1], sh * .8); }
      if (up) { const hl = lo + Math.abs(d) * (n - .5) / n; quad(S.step, [x0, hl, z0], [x1, hl, z0], [x1, nw, z0], [x0, nw, z0], [ua, .2], [ub, .2], [ub, .4], [ua, .4], [0, 0, 1], sh * .8); }
    } else { const ny = Math.hypot(z1 - z0, nw - sw), n = [0, (z1 - z0) / ny, (nw - sw) / ny];
      quad(top, [x0, sw, z1], [x1, se, z1], [x1, ne, z0], [x0, nw, z0], [u0, v1], [u1, v1], [u1, v0], [u0, v0], n, sh); }
    // 둘레가 더 낮으면 면을 세운다(높은 칸 쪽에서 낮은 칸을 바라보게). 나루 판(마루 칸)은 나무, 바위 지도는 절벽 그림, 나머지는 돌 축대
    const B = S[kind];
    const sd = (b0, b1, t0, t1, a, b, n2, len, ax, low) => { if (t0 - b0 < .5 && t1 - b1 < .5) return; const y0 = Math.min(b0, t0), y1 = Math.min(b1, t1);
      if (kind === 'rock') { const ua = (ax ? a[0] : a[1]) / ROCK_W, ub = (ax ? b[0] : b[1]) / ROCK_W, tt = Math.max(t0, t1), v = h => 1 - (tt - h) / (ROCK_H * HS), dk = .5 * lowShade(low);  // 무늬는 위 끝에 맞춘다(단마다 지층 줄이 이어지게). 밑동은 어둡게
        quad(B, [a[0], y0, a[1]], [b[0], y1, b[1]], [b[0], t1, b[1]], [a[0], t0, a[1]], [ua, v(y0)], [ub, v(y1)], [ub, v(t1)], [ua, v(t0)], n2, dk, dk, 1, 1);
      } else { const L = len / 10; quad(B, [a[0], y0, a[1]], [b[0], y1, b[1]], [b[0], t1, b[1]], [a[0], t0, a[1]], [0, y0 / 10], [L, y1 / 10], [L, t1 / 10], [0, t0 / 10], n2); } };
    { const c = corners4(m, x, y + 1); sd(c[0], c[1], sw, se, [x0, z1], [x1, z1], [0, 0, 1], TS, 1, lvOf(x, y + 1)); }  // 남쪽
    { const c = corners4(m, x, y - 1); sd(c[3], c[2], ne, nw, [x1, z0], [x0, z0], [0, 0, -1], TS, 1, lvOf(x, y - 1)); }  // 북쪽
    { const c = corners4(m, x - 1, y); sd(c[1], c[3], nw, sw, [x0, z0], [x0, z1], [-1, 0, 0], z1 - z0, 0, lvOf(x - 1, y)); }  // 서쪽
    { const c = corners4(m, x + 1, y); sd(c[2], c[0], se, ne, [x1, z1], [x1, z0], [1, 0, 0], z1 - z0, 0, lvOf(x + 1, y)); }  // 동쪽
  }
  const geo = B => { const g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(B.P, 3)); g.setAttribute('uv', new T.Float32BufferAttribute(B.U, 2)); g.setAttribute('normal', new T.Float32BufferAttribute(B.N, 3)); g.setAttribute('color', new T.Float32BufferAttribute(B.C, 3)); g.computeBoundingSphere(); return g; };
  const MT = { stone: () => kmat('g_cobble') || new T.MeshLambertMaterial({ color: '#77746c', vertexColors: true }), wood: () => kmat('r_plank') || new T.MeshLambertMaterial({ color: '#6b5038', vertexColors: true }), rock: () => kmat('cl_rock'), step: () => kmat('cl_step') };
  for (const [k, B] of Object.entries(S)) { if (!B.P.length) continue; const o = new T.Mesh(geo(B), MT[k]()); o.castShadow = o.receiveShadow = true; scene.add(o); cliffs.push(o); }
  return new T.Mesh(geo(top), sharpen(new T.MeshLambertMaterial({ map: gt, vertexColors: true })));
}

// 절벽 조각: 바위 지도(m.rocky())의 면을 따라 블렌더 모형을 세운다(tools/blender/rocks.py: rk_cf<단>_<n>은 두 칸짜리, rk_ch<단>_<n>은 한 칸짜리, 단은 1~4).
// 면에 그림만 입히면 반듯한 축대로 보인다. 조각은 판돌을 켜켜이 쌓은 덩어리라 면이 들쭉날쭉하고, 맨 위 켜가 높은 땅의 가장자리를 바위 테로 덮는다.
// 조각의 앞(모형의 +z)이 낮은 쪽을 본다. 남쪽 면은 그대로, 동·서·북쪽 면은 돌려 세운다. 계단 칸과 지도 가장자리에는 안 세운다
// 방 바닥(임시): 붉은 마루 그림이 화면을 주황으로 덮는다. 방 바닥 그림(FL1)이 오기 전까지 새 화면에서만 채도를 낮추고 어둡게 가라앉힌다(2D 화면과 그림 파일은 그대로)
function calm(x, w, h) { const d = x.getImageData(0, 0, w, h), a = d.data; for (let i = 0; i < a.length; i += 4) { const l = a[i] * .3 + a[i + 1] * .59 + a[i + 2] * .11; a[i] = (l + (a[i] - l) * .5) * .86; a[i + 1] = (l + (a[i + 1] - l) * .5) * .86; a[i + 2] = (l + (a[i + 2] - l) * .5) * .8; } x.putImageData(d, 0, 0); }
// 방의 벽: 조각(rw_*)을 방 크기와 종류대로 세운다(자리는 js/hd2d/rooms.js roomWalls). 옆벽은 같은 조각을 돌려 세운다(ZS가 1이 아니어도 모양이 안 변하게 배율을 바꿔 준다: cliffKit과 같은 방법).
// 벽의 겉(회벽, 판자, 벽돌 …)은 재질을 고를 때 정한다(as(1, 벽 종류)). 사람을 가리면 뚫어 보이게 userData를 단다(fades)
const FURNK = 1.35;  // 가구 조각(fn_)의 밝기. 방의 빛만 받으면 탁자 윗면이 칠한 색의 0.7배로 나와 ChatGPT의 배치 예시보다 칙칙했다(긴 탁자 윗면의 밝기 58 → 72, 예시 82)
const FLDOT = 3.2, FLK = { fl_scale: 1.75, fl_dark: 1.9, fl_pine: 1.45, fl_brick: 1.6, fl_mat: 1.45, fl_slab: 1.6 };  // 방 바닥 무늬의 굵기(평면도 한 점에 도트 3.2점. 비늘 하나가 사람 키의 4분의 1쯤 된다)와 밝기. 방의 빛을 그대로 받으면 바닥이 그린 색의 절반 밝기로 가라앉아 무늬가 묻힌다(벽의 절반). 기준 그림(docs/ref/ws-interior.jpg)은 바닥과 벽이 비슷하게 밝고, ChatGPT의 배치 예시는 바닥이 그린 색 그대로 보인다. 짙은 무늬일수록 더 올린다
const TALL = /^rw_(wall|post|pillar|column)$/;  // 높이를 WALL_K배로 세우는 조각(벽 높이를 기준 그림의 사람 키 2.7배에 맞춘다. 무늬는 자리로 입히니 늘어나지 않는다)
function piece(key, kind, x, y, z, rot = 0, sx = 1) { const g = new T.Group(), o = MODELS[key].clone(true), ms = [], side = rot % 2 !== 0;
  o.traverse(c => { if (c.isMesh) { const M = MODELM.get(c.geometry).as(1, kind); c.userData = { M, owner: g }; c.material = M.m; c.customDepthMaterial = M.d; ms.push(c); } }); g.add(o);
  if (side && /^rw_/.test(key)) for (const c of ms) c.castShadow = false;  // 옆벽은 그림자를 드리우지 않는다. 빛이 조금 동쪽에서 와서 동쪽 벽을 따라 바닥에 긴 그늘이 졌고, 그 구석에 놓은 것(술통, 분재)이 묻혔다
  g.scale.set(sx * (side ? ZS : 1), HS * (TALL.test(key) ? WALL_K : 1), side ? 1 : ZS); g.rotation.y = rot * Math.PI / 2; g.position.set(x, z * HS, y * ZS); g.userData = { wall: true, ms }; propG.add(g); return g; }
function roomKit(m) { const { kind, parts } = roomWalls(m); m.wallKind = kind; if (!parts.map(q => needModel(q.key)).every(Boolean)) return false;
  for (const q of parts) { piece(q.key, kind, q.x, q.y, q.z, q.rot, q.sx); if (q.key === 'rw_emblem') glyph(emblemOf(m), q.x, q.y + 1, q.z + 15); } return true; }
// 문양판의 글자: 글꼴로 한 글자를 작게 찍어 도트로 굳힌다(반투명을 없앤다). 그 글자가 글꼴에 없으면(네모로 찍히면) 얹지 않는다
const GLY = {};
function glyphTex(ch) { if (ch in GLY) return GLY[ch]; const N = 30, draw = t => { const c = mk(N, N), x = c.getContext('2d', { willReadFrequently: true }); x.font = `bold 25px Gungsuh, Batang, "Noto Serif CJK KR", "Noto Serif KR", "Source Han Serif K", "Nanum Myeongjo", serif`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillStyle = '#241a12'; x.fillText(t, N / 2, N / 2 + 1); return [c, x]; };
  const [c, x] = draw(ch), d = x.getImageData(0, 0, N, N), miss = draw('\uFFFE')[1].getImageData(0, 0, N, N).data; let same = true, ink = 0;
  for (let i = 3; i < d.data.length; i += 4) { if (d.data[i] !== miss[i]) same = false; const on = d.data[i] > 110; d.data[i] = on ? 255 : 0; if (on) ink++; }
  if (same || ink < 20) return GLY[ch] = null; x.putImageData(d, 0, 0); return GLY[ch] = texFrom(c, { mips: false }); }
function glyph(ch, x, y, zc) { const t = ch && glyphTex(ch); if (!t) return; const q = new T.Mesh(new T.PlaneGeometry(17, 17), sharpen(new T.MeshLambertMaterial({ map: t, alphaTest: .5 })));
  q.scale.y = HS; q.position.set(x, zc * HS, y * ZS); q.userData = { flat: true }; propG.add(q); }
// 가구 조각을 소품 그림의 자리에 세운다. 자리는 그림의 막힘 상자(2D에서 사람이 못 지나가는 네모) 가운데. 크기는 사람과 같은 배율(방 안 PSC)로 키운 다음,
// 가로를 막힘 폭에 맞춘다: 조금 다르면 가로만 늘이거나 줄이고(무늬는 자리로 입히니 늘어나지 않는다), 그림이 한참 좁으면 통째로 줄이고, 한참 넓으면(긴 걸상) 여러 개를 이어 놓는다.
// keep인 것(의자, 걸상, 차 탁자)은 제 모양대로 세운다. top: 세운 조각의 윗면 높이(그 위에 얹는 것이 설 높이)
function furnFit(s, f, mdl) { const st = STAMPS[s.name], sol = s.sol || { x: s.x, y: s.base - 6, w: st[3] * (s.sc || 1), h: 6 }, side = (f.rot || 0) % 2 !== 0;
  const bb = mdl.userData.bb ||= new T.Box3().setFromObject(mdl), mw = side ? bb.max.z - bb.min.z : bb.max.x - bb.min.x;
  let k = HD.actK(curMap), fit = sol.w / (mw * k), n = 1; if (f.keep) fit = 1; else if (fit < .75) { k *= fit; fit = 1; } else if (fit > 1.45) { n = Math.round(fit); fit /= n; }
  return { sol, side, k, fit, n, top: bb.max.y * k }; }
function furniture(s, f, mdl) { const { sol, side, k, fit, n } = furnFit(s, f, mdl);
  for (let i = 0; i < n; i++) { const g = piece(f.key, curMap.wallKind, sol.x + sol.w * (i + .5) / n, sol.y + sol.h / 2 + (f.dy || 0), 0, f.rot || 0, 1);
    g.scale.multiplyScalar(k); if (side) g.scale.z *= fit; else g.scale.x *= fit; g.userData.furn = true; } }
// 가구 위에 얹은 것(m.on: 찻주전자, 촛대, 향로)이 설 높이: 발 자리를 덮는 가구가 조각으로 서 있으면 그 윗면, 아직 그림이면 그림 키의 절반쯤
function onTop(m, s, cx, fy) { const q = m.stamps.find(u => u !== s && u.sol && cx >= u.sol.x && cx <= u.sol.x + u.sol.w && fy >= u.sol.y && fy <= u.sol.y + u.sol.h); if (!q) return 0;
  const f = FURN[q.name], mdl = f && KITS.has(f.key) && needModel(f.key); return mdl ? furnFit(q, f, mdl).top : STAMPS[q.name][4] * (q.sc || 1) * .5; }
function column(s) { const st = STAMPS[s.name]; piece('rw_column', curMap.wallKind, s.x + st[3] / 2, s.base - 3, 0); }  // 기둥 그림(pillar)의 발 자리에 세운다
function cliffKit(m) {
  if (m.face !== 'rock' || !art()) return;
  const lv = (x, y) => m.hgt[y][x], ok = (x, y) => x >= 0 && y >= 0 && x < m.w && y < m.h && !m.stair?.[x + ',' + y];
  const drop = (hx, hy, lx, ly) => ok(hx, hy) && ok(lx, ly) && lv(hx, hy) > lv(lx, ly) ? lv(hx, hy) - lv(lx, ly) + ',' + lv(lx, ly) : '';
  const put = (wide, D, base, X, Z, rot, r) => { const L = Math.min(D, 4), mdl = needModel(`rk_c${wide ? 'f' : 'h'}${L}_${1 + Math.floor(r * (wide ? 3 : 2))}`); if (!mdl) return;
    const g = new T.Group(), o = mdl.clone(true), ms = [], side = rot % 2 !== 0, flip = (r * 97) % 1 < .5 ? -1 : 1;
    o.traverse(c => { if (c.isMesh) { const M = MODELM.get(c.geometry).as(lowShade(base + D)); c.userData = { M, owner: g }; c.material = M.m; c.customDepthMaterial = M.d; ms.push(c); } }); g.add(o);
    g.scale.set(flip * (side ? ZS : 1), HS * D / L, side ? 1 : ZS); g.rotation.y = rot * Math.PI / 2; g.position.set(X, base * LV * HS, Z); g.userData = { cliff: true, ms }; propG.add(g); };
  // 같은 높이로 이어진 면을 한 줄로 묶어, 두 칸짜리 조각으로 채우고 홀수면 한 칸짜리를 하나 끼운다
  const line = (len, key, at) => { for (let i = 0; i < len;) { const k = key(i); if (!k) { i++; continue; } let j = i + 1; while (j < len && key(j) === k) j++;
    const [D, base] = k.split(',').map(Number), n = j - i, half = n % 2 ? Math.floor(hash2(i * 7 + len, n + base * 13) * (n / 2 + .999)) : -1;
    for (let c = i, q = 0; c < j; q++) { const wide = q !== half && j - c >= 2, w = wide ? 2 : 1; at(wide, D, base, (c + w / 2) * TS, hash2(c * 31 + D, i * 17 + base)); c += w; } i = j; } };
  for (let y = 0; y < m.h; y++) {
    line(m.w, x => drop(x, y, x, y + 1), (w, D, b, c, r) => put(w, D, b, c, (y + 1) * TS * ZS, 0, r));   // 남쪽 면
    line(m.w, x => drop(x, y, x, y - 1), (w, D, b, c, r) => put(w, D, b, c, y * TS * ZS, 2, r)); }        // 북쪽 면(위 끝의 바위 테만 보인다)
  for (let x = 0; x < m.w; x++) {
    line(m.h, y => drop(x, y, x + 1, y), (w, D, b, c, r) => put(w, D, b, (x + 1) * TS, c * ZS, 1, r));    // 동쪽 면
    line(m.h, y => drop(x, y, x - 1, y), (w, D, b, c, r) => put(w, D, b, x * TS, c * ZS, 3, r)); }        // 서쪽 면
}

// ── 지도 ──
// 물: 받아 둔 물 그림(HG2 → wt_river 강물, wt_pond 연못, wt_rapid 여울. tools/ground_in.py)을 물 칸에 깔고 도트 한 점씩 일렁이게 한다. 강물은 천천히 흐른다.
// 물 칸마다 어느 그림을 쓸지는 waterKinds가 정한다. 그림을 못 읽었으면 전처럼 코드로 잔물결을 그린다. 빛과 그림자는 Lambert 그대로 받는다
let waterM = null; const WU = { uT: { value: 0 }, uSky: { value: null }, uDeep: { value: null }, uW0: { value: null }, uW1: { value: null }, uW2: { value: null } };
function waterMat() {
  if (waterM) return waterM; WU.uSky.value = new T.Color('#9cc0e8'); WU.uDeep.value = new T.Color('#1f4a52');
  const tx = ['wt_river', 'wt_pond', 'wt_rapid'].map(previewTex), pic = tx.every(Boolean); if (pic) tx.forEach((t, i) => { t.magFilter = T.NearestFilter; t.needsUpdate = true; WU['uW' + i].value = t; });
  waterM = new T.MeshLambertMaterial({ color: '#ffffff', transparent: true, opacity: pic ? .97 : .93 });
  waterM.onBeforeCompile = s => { Object.assign(s.uniforms, WU);
    s.vertexShader = 'attribute float aKind; varying float vKind; varying vec3 vWp;\n' + s.vertexShader.replace('#include <project_vertex>', '#include <project_vertex>\n vWp = (modelMatrix * vec4(transformed, 1.)).xyz; vKind = aKind;');
    s.fragmentShader = 'varying vec3 vWp; varying float vKind; uniform float uT; uniform vec3 uSky, uDeep; uniform sampler2D uW0, uW1, uW2;\n' + s.fragmentShader.replace('#include <map_fragment>', pic ? `
      vec2 uv = vec2(vWp.x, vWp.z / ${ZS.toFixed(4)}) * ${(DOT / 86).toFixed(6)};  // 그림 한 장이 86점(평면도 26.9점)
      float row = floor(uv.y * 43.);                                             // 도트 두 줄씩 묶어, 줄마다 다른 때에 한 점씩 좌우로 밀린다
      vec2 wob = vec2(floor(sin(row * .9 + uT * 1.4) * 1.49 + .5), 0.) / 86.;
      vec3 c;
      if (vKind < .5) c = texture2D(uW0, uv + wob + vec2(uT * .004, uT * .0015)).rgb;                       // 강: 천천히 흐른다
      else if (vKind < 1.5) c = texture2D(uW1, uv + vec2(floor(sin(row * .7 + uT * .6) * .99 + .5), 0.) / 86.).rgb;  // 못: 거의 고요하다
      else { c = texture2D(uW2, uv).rgb; vec3 r = texture2D(uW0, uv * 1.3 + vec2(uT * .02, uT * .011)).rgb; c += smoothstep(.62, .85, dot(r, vec3(.3, .59, .11))) * .22; }  // 여울: 바닥 돌은 그대로, 물비늘만 흐른다
      float far = smoothstep(0., 600., length(vWp.xz - cameraPosition.xz)); c = mix(c, uSky, far * .16);
      diffuseColor.rgb *= c;` : `
      vec2 q = floor(vWp.xz / vec2(1.2, 1.2 * 4.4)) * vec2(.09, .09 * 4.4 * 1.6);  // 도트 굵기로 끊어 잰다. 물결은 옆으로 긴 줄
      float w1 = sin(q.x * .9 + q.y * 2.6 + uT * 1.6) + sin(q.x * 1.9 - q.y * 3.3 - uT * 1.2) * .8 + sin(q.x * 3.7 + q.y * 5.1 + uT * 2.1) * .5;
      float rip = smoothstep(1.7, 2.1, w1), dark = smoothstep(-.8, -2.2, w1);
      float far = smoothstep(0., 600., length(vWp.xz - cameraPosition.xz));
      vec3 c = mix(uDeep, uSky, .38 + far * .3); c = mix(c, uSky * 1.25, rip * .75); c *= 1. - dark * .25;
      diffuseColor.rgb *= c;`); };
  waterM.customProgramCacheKey = () => pic ? 'water-pic' : 'water';
  return waterM;
}
// 물 칸마다 그림 고르기: 0 강물(지도 가장자리에 닿고 너비가 다섯 칸 넘는 물), 1 연못(뭍에 갇힌 작은 물), 2 여울(너비 네 칸 아래의 물줄기). 큰 지도는 모두 강물
function waterKinds(m) {
  if (m.win) return null; const K = m.g.map(r => new Int8Array(r.length).fill(-1)), wat = (x, y) => x < 0 || y < 0 || x >= m.w || y >= m.h || m.g[y][x] === 2;
  for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) { if (m.g[y][x] !== 2 || K[y][x] >= 0) continue; const cs = [[x, y]]; K[y][x] = 0; let edge = false, deep = false;
    for (let i = 0; i < cs.length; i++) { const [a, b] = cs[i]; if (a === 0 || b === 0 || a === m.w - 1 || b === m.h - 1) edge = true;
      if (!deep) { let all = true; for (let dy = -2; dy <= 2 && all; dy++) for (let dx = -2; dx <= 2; dx++) if (!wat(a + dx, b + dy)) { all = false; break; } deep = all; }
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const X = a + dx, Y = b + dy; if (X < 0 || Y < 0 || X >= m.w || Y >= m.h || m.g[Y][X] !== 2 || K[Y][X] >= 0) continue; K[Y][X] = 0; cs.push([X, Y]); } }
    const k = !edge && cs.length <= 200 ? 1 : deep ? 0 : 2; for (const [a, b] of cs) K[b][a] = k; }
  return K;
}
function waterMesh(m) {
  const P = [], N = [], KD = [], z = y => y * TS * ZS, WN = m.win || { x0: 0, y0: 0, x1: m.w, y1: m.h }, K = waterKinds(m);
  for (let y = WN.y0; y < WN.y1; y++) for (let x = WN.x0; x < WN.x1; x++) { if (m.g[y][x] !== 2) continue;
    const h = m.hgt ? Math.min(...corners4(m, x, y)) + .4 : .25, x0 = x * TS, x1 = x0 + TS + .02, z0 = z(y), z1 = z(y + 1) + .02, k = K ? K[y][x] : 0;
    for (const v of [[x0, z1], [x1, z1], [x1, z0], [x0, z1], [x1, z0], [x0, z0]]) { P.push(v[0], h, v[1]); N.push(0, 1, 0); KD.push(k); } }
  if (!P.length) return null; const g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(P, 3)); g.setAttribute('normal', new T.Float32BufferAttribute(N, 3)); g.setAttribute('aKind', new T.Float32BufferAttribute(KD, 1));
  const o = new T.Mesh(g, waterMat()); o.receiveShadow = true; o.renderOrder = 1; return o;
}
let water = null;
let buildMs = 0;
// 세운 그림판 그물은 크기별로 하나만 만들어 모든 지도가 같이 쓴다. 전에는 지도를 세울 때마다 새로 만들고 버리지 않아서, 지도를 옮기거나 전투를 할 때마다 수십 개씩 쌓였다
const STANDG = new Map();
// 지은 지도를 떼어서 들고 있기: 전투 무대는 한 번 지으면 계속 들고 있고, 전투에 들어갈 때는 있던 마을을 떼어 두었다가 돌아오면 그대로 붙인다.
// 전에는 전투에 들어갈 때와 나올 때마다 무대와 마을을 처음부터 다시 지어서 멈칫했다. 다른 마을로 가면 들고 있던 마을은 버린다. curMap = null(모형·그림이 바뀜)이면 전부 버리고 새로 짓는다
const STASH = new Map();
const dropSet = s => { for (const o of s.props) o.traverse(c => { if (c.isMesh && !c.userData.shared) c.geometry.dispose(); }); if (s.ground) { s.ground.geometry.dispose(); s.ground.material.map.dispose(); s.ground.material.dispose(); } for (const o of s.cliffs) o.geometry.dispose(); if (s.water) s.water.geometry.dispose(); };
function stashOut(m) {
  const s = { props: [...propG.children], ground, cliffs: [...cliffs], water, skirt: skirt ? [skirt.material.color.clone(), skirt.scale.clone(), skirt.position.clone()] : null };
  for (const o of s.props) propG.remove(o); if (ground) scene.remove(ground); for (const o of cliffs) scene.remove(o); if (water) scene.remove(water);
  ground = null; water = null; cliffs.length = 0; STASH.set(m, s);
}
function stashIn(m) {
  const s = STASH.get(m); STASH.delete(m);
  for (const o of s.props) propG.add(o); ground = s.ground; if (ground) scene.add(ground); for (const o of s.cliffs) { scene.add(o); cliffs.push(o); } water = s.water; if (water) scene.add(water);
  if (s.skirt && skirt) { skirt.material.color.copy(s.skirt[0]); skirt.scale.copy(s.skirt[1]); skirt.position.copy(s.skirt[2]); }
  camT.set(-1, 0, 0);
}
function setMap(m) {
  if (curMap === m) return; const prev = curMap, t0 = performance.now(); curMap = m;
  if (prev && (prev.stage || m.stage) && !STASH.has(prev)) stashOut(prev);
  else {
    for (const o of [...propG.children]) { propG.remove(o); o.traverse(c => { if (c.isMesh && !c.userData.shared) c.geometry.dispose(); }); }
    if (ground) { scene.remove(ground); ground.geometry.dispose(); ground.material.map.dispose(); ground.material.dispose(); ground = null; }
    for (const o of cliffs) { scene.remove(o); o.geometry.dispose(); } cliffs.length = 0;
    if (water) { scene.remove(water); water.geometry.dispose(); water = null; }
  }
  for (const k of [...STASH.keys()]) if (!prev || (!m.stage && !k.stage && k !== m)) { dropSet(STASH.get(k)); STASH.delete(k); }
  roomModels(m); PALU.uDot.value = m.room ? DOT / PSC : DOT;  // 방 안은 사람을 PSC배로 그리니 조각의 무늬도 그만큼 굵게
  if (STASH.has(m)) { stashIn(m); buildMs = Math.round(performance.now() - t0); return; }
  LAMPX.length = 0;  // 등불 자리는 지도마다 새로 모은다(전에는 안 비워서 지나온 지도의 등불 자리가 계속 쌓였고, 밤에 엉뚱한 자리에 불빛이 섰다)
  const WN = m.win || { x0: 0, y0: 0, x1: m.w, y1: m.h }, Wm = (WN.x1 - WN.x0) * TS, Dm = (WN.y1 - WN.y0) * TS * ZS, OX = WN.x0 * TS, OZ = WN.y0 * TS * ZS;  // 큰 지도는 잘라 낸 범위만
  // 땅: 지금 땅 그림을 그대로 눕힌다(땅 무늬 HB14가 오기 전 임시). 땅도 도트 결로 읽는다
  const gc = mk(Wm, (WN.y1 - WN.y0) * TS), gx = gc.getContext('2d', { willReadFrequently: true }); const flr = m.room && art(), kit = flr && !OWN.has(m.id);  // 새 화면의 방: 바닥만 칠한다(2D가 가장자리에 칠하던 납작한 벽은 뺀다). kit: 벽을 조각으로 세우는 방(동굴은 제 모형)
  // 방 바닥 무늬(받은 그림 FL1): 방 종류에 맞는 무늬를 평면도 한 점에 FLDOT점으로 되풀이해 깐다. 깔개(m.carpet)는 그 위에 따로 얹는다. 무늬가 없으면(그림 끔, 동굴) 2D 바닥 그림을 가라앉혀 깐다
  const ft = kit && previewTex(floorOf(m));
  if (m.win) G.world.paintWin(gx, OX, WN.y0 * TS, Wm, gc.height); else if (ft) { gx.fillStyle = '#2a2520'; gx.fillRect(0, 0, gc.width, gc.height); } else if (flr) { paintRoom(gx, m.w, m.h, m.roomStyle || 0, { carpet: m.carpet, floorOnly: true }); calm(gx, gc.width, gc.height); } else m.paintBase(gx);
  let gt; if (ft) { gt = ft.clone(); gt.repeat.set(Wm * FLDOT / ft.image.width, Dm / ZS * FLDOT / ft.image.height); gt.needsUpdate = true; }
  else { gt = new T.CanvasTexture((!m.win && groundArt(m, gc)) || gc); gt.colorSpace = T.SRGBColorSpace; gt.anisotropy = R.capabilities.getMaxAnisotropy(); gt.minFilter = T.LinearMipmapLinearFilter; }
  if (m.hgt && m.face === 'rock') { TOPU.map = gt; (TOPU.uGS.value ||= new T.Vector2()).set(1 / Wm, 1 / Dm); for (const t of TOPS) { if (!t.map) t.needsUpdate = true; t.map = gt; } }  // 절벽 조각의 윗면이 이 지도의 땅 그림을 받게
  if (m.hgt) { ground = terrain(m, gt); cliffKit(m); }  // 높낮이가 있는 지도: 칸마다 높이대로 들고 단 사이에 축대를 세운다. 바위 지도는 그 면에 절벽 조각을 붙인다
  else { ground = new T.Mesh(new T.PlaneGeometry(Wm, Dm), sharpen(new T.MeshLambertMaterial({ map: gt }))); ground.rotation.x = -Math.PI / 2; ground.position.set(OX + Wm / 2, 0, OZ + Dm / 2); }
  if (ft) ground.material.color.setScalar(FLK[floorOf(m)] || 1.45);
  ground.receiveShadow = true; ground.userData.map = m; scene.add(ground);
  if (ft && m.carpet) { const cc = mk(Wm, gc.height), cx2 = cc.getContext('2d', { willReadFrequently: true }); paintRoom(cx2, m.w, m.h, m.roomStyle || 0, { carpet: m.carpet, floorOnly: true, noFloor: true }); calm(cx2, cc.width, cc.height);  // 깔개만 그린 투명한 판을 바닥 바로 위에
    const rug = new T.Mesh(new T.PlaneGeometry(Wm, Dm), sharpen(new T.MeshLambertMaterial({ map: texFrom(cc, { mips: false }), alphaTest: .5 }))); rug.rotation.x = -Math.PI / 2; rug.position.set(OX + Wm / 2, .12, OZ + Dm / 2); rug.receiveShadow = true; rug.userData = { flat: true }; propG.add(rug); }
  water = art() ? waterMesh(m) : null; if (water) scene.add(water);
  // 지도 밖: 가장자리 땅빛으로 넓게 깔아 빈 곳이 안 보이게
  const ed = gx.getImageData(0, 0, gc.width, 8).data; let r = 0, g = 0, b = 0, n = 0; for (let i = 0; i < ed.length; i += 16) { r += ed[i]; g += ed[i + 1]; b += ed[i + 2]; n++; }
  if (!skirt) { skirt = new T.Mesh(new T.PlaneGeometry(1, 1), new T.MeshLambertMaterial()); skirt.rotation.x = -Math.PI / 2; skirt.receiveShadow = true; scene.add(skirt); }
  skirt.material.color.setRGB(r / n / 255, g / n / 255, b / n / 255, T.SRGBColorSpace).multiplyScalar(.82); skirt.scale.set(Wm + 4000, Dm + 4000, 1); skirt.position.set(OX + Wm / 2, m.hgt ? lowest(m) - 1 : -.6, OZ + Dm / 2);
  // 소품: 2D가 그리던 순서(발 높이 순)를 깊이로 옮긴다. 같은 높이면 나중 것이 아주 조금 앞
  const list = m.stamps.map((s, i) => ({ s, i, z: s.flat ? s.y + TS : s.on ? s.y + STAMPS[s.name][4] * s.sc : s.base })).sort((a, b) => a.z - b.z || a.i - b.i), GEO = STANDG;
  // 블렌더 무대·방 모형(m.models: [{ key, x, y }], tools/blender/stages.py·rooms.py). 좌표는 평면도 그대로(x, 북쪽이 +y), 지도 (x, y)에 놓는다. 다 읽혔으면 옛 소품(s.alt)은 뺀다
  const useModels = art() && (m.models || []).length > 0 && m.models.map(q => needModel(q.key)).every(Boolean);
  if (useModels) for (const q of m.models) { const gm = MODELS[q.key], g = new T.Group(), o = gm.clone(true);
    o.traverse(c => { if (c.isMesh) { const M = MODELM.get(c.geometry); c.userData = { M, owner: g }; c.material = M.m; c.customDepthMaterial = M.d; } }); g.add(o);
    g.scale.set(1, HS, ZS); g.position.set(q.x || 0, 0, (q.y || 0) * ZS); g.userData = { backdrop: true }; propG.add(g);
    for (const [x, y, z] of gm.userData.lamps || []) LAMPX.push([(q.x || 0) + x, (q.y || 0) - y, z]); }
  const walled = kit && roomKit(m); m.wallTop = walled ? WALL_TOP : useModels && m.room ? 47 : 0;  // 카메라가 벽 꼭대기까지 담게(placeCam)
  list.forEach(({ s, z }, k) => {
    if (s.alt && useModels) return;
    if (walled && s.name === 'pillar' && MODELS.rw_column) { column(s); return; }  // 방 안의 기둥 그림은 두리기둥 조각으로
    if (art() && m.room && !s.flat && FURN[s.name] && KITS.has(FURN[s.name].key)) { const mdl = needModel(FURN[s.name].key); if (mdl) { furniture(s, FURN[s.name], mdl); return; } }  // 가구 그림은 조각이 들어와 있으면 조각으로
    const nm = s.name === 'gate' && m.id === 'guhwa' && PV.hd_gate_town ? 'hd_gate_town' : s.name;  // 대문(ChatGPT HD3): 구화성은 성문, 문파·세가는 대문, 산문은 패방(gate_arch)
    const st = STAMPS[s.name], t = st && stampTex(nm); if (!t) return; const pk = art() && !s.flat && /^[vp]_/.test(s.name) ? PROPK : 1, sc = (s.sc || 1) * pk, cx = s.x + st[3] * (s.sc || 1) / 2, pv = !!previewTex(nm), w = st[3] * sc, h = pv ? w * t.image.height / t.image.width : st[4] * sc, gk = w + 'x' + h;
    const ef = !s.flat && st.length > 5 && (pv ? EAVE_PV : EAVE)[s.name];
    const rk = !s.flat && art() && rockKey(s), rm = rk && needModel(rk);
    if (rm) { const g = new T.Group(), o = rm.clone(true), ms = [], tone = ROCKB[m.biome] || ''; o.traverse(c => { if (c.isMesh) { const M = MODELM.get(c.geometry).as(1, tone); c.userData = { M, owner: g }; c.material = M.m; c.customDepthMaterial = M.d; ms.push(c); } }); g.add(o);
      // 자리: 가로는 그림의 가운데. 세로는 막힘 상자의 가운데(없으면 그림 밑에서 조금 위). 바위산은 밑동 줄이 모형의 앞
      const k0 = s.sc || 1, big = /^(mtn|crag)/.test(s.name), wide = big || /^rocks/.test(s.name), xc = s.x + st[3] * k0 / 2, yb = big ? s.y + st[4] * k0 - 2 : st.length > 5 ? s.y + (st[6] + st[8] / 2) * k0 : s.y + st[4] * k0 - 3, h1 = hash2(Math.round(s.y), Math.round(s.x)), kk = k0;
      g.scale.set(kk * (wide && h1 < .5 ? -1 : 1), kk * HS, kk * ZS); if (!wide) g.rotation.y = h1 * 6.283; g.position.set(xc, hAt(m, xc, yb), yb * ZS); g.userData = { s, rock: true, ms }; propG.add(g); return; }  // 블렌더 바위 모형
    const mk_ = !s.flat && art() && modelKey(s), gm = mk_ && needModel(mk_);
    if (gm) { const g = new T.Group(), o = gm.clone(true); o.traverse(c => { if (c.isMesh) { const M = MODELM.get(c.geometry); c.userData = { M, owner: g }; c.material = M.m; c.customDepthMaterial = M.d; } }); g.add(o);
      const xc = s.x + st[5] + st[7] / 2, yf = s.y + st[6] + st[8], pb = s.grand && GRAND[s.grand]?.model ? GRAND[s.grand].modelFront || 7 : 0; g.scale.set(1, HS, ZS); g.position.set(xc, hAt(m, xc, yf - 1), (yf - pb) * ZS); g.userData = { s, house: true }; propG.add(g);
      for (const [x, y, z] of gm.userData.lamps || []) LAMPX.push([xc + x, yf - pb - y, z]); return; }  // 블렌더 모형(tools/blender/hall.py, houses.py)
    if (!s.flat && SPEC[s.name] && art() && PV.w1_front) { build ||= makeBuilder({ T, HS, ZS, DOT, PV, aniso: R.capabilities.getMaxAnisotropy(), texFrom, matOf, holed, LAMPX, face, glow: GLOW, get AO() { return aoTex(); } }); const b = build(s, st, SPEC[s.name]); if (b) { propG.add(b); return; } }  // 조립한 건물(js/hd2d/build.js)
    if (!s.flat && PARTS[s.name] && previewTex('w_front')) { propG.add(partsBox(s, PARTS[s.name])); return; }  // 새 그림: 벽 부품(HW0)과 지붕 무늬(HR1)로
    if (ef) { propG.add(houseBox(s, t, w, h, ef)); return; }
    const hk = !s.flat && art() && hdWall(s, m); if (hk && PV[hk]) { propG.add(wallRun(s, hk)); return; }  // 새 담장·울타리(ChatGPT HD1·HD2)
    if (!s.flat && WALLS.has(s.name)) { propG.add(wallBox(s, t, w, h)); return; }
    const sw = art() && !s.flat && SWAP[s.name] && IMG['stamp/' + SWAP[s.name]] && SWAP_SZ[SWAP[s.name]];
    if (sw) { const nm = SWAP[s.name], [w2, h2] = SWAP_SZ[nm].map(v => v * (s.sc || 1) * (.9 + ((s.x * 7 + s.y * 3) % 5) * .05)), t2 = stampTex(nm), gk2 = w2.toFixed(1) + 'x' + h2.toFixed(1); if (!GEO.has(gk2)) GEO.set(gk2, standGeo(w2, h2));
      const M = matOf(t2), o = new T.Mesh(GEO.get(gk2), M.m); o.customDepthMaterial = M.d; o.position.set(s.x + w / 2, hAt(m, s.x + w / 2, z - 1), z * ZS + k * .003);
      o.castShadow = true; o.receiveShadow = true; o.userData = { s, w: w2, h: h2, M, t: t2, owner: o, shared: true }; propG.add(o); return; }  // 새 그림(Higgsfield HT1, HP4)으로 바꿔 그린다. 막힘은 그대로
    if (art() && OLDSC[s.name] && !s.flat) { const k = OLDSC[s.name], w2 = w * k, h2 = h * k, gk2 = w2 + 'x' + h2; if (!GEO.has(gk2)) GEO.set(gk2, standGeo(w2, h2));
      const M = matOf(t), o = new T.Mesh(GEO.get(gk2), M.m); o.customDepthMaterial = M.d; o.position.set(s.x + w / 2, hAt(m, s.x + w / 2, z - 1), z * ZS + k * .003);
      o.castShadow = true; o.receiveShadow = true; o.userData = { s, w: w2, h: h2, M, t, owner: o, shared: true }; propG.add(o); return; }
    if (!GEO.has(gk)) GEO.set(gk, standGeo(w, h));
    const M = matOf(t), o = new T.Mesh(GEO.get(gk), M.m); o.customDepthMaterial = M.d; o.position.set(cx, hAt(m, cx, z - 1) + (s.on ? onTop(m, s, cx, z) * HS : 0), z * ZS + k * .003);  // 줄인 소품도 원래 자리 가운데에 선다. 가구에 얹은 것은 그 윗면에
    o.castShadow = !s.flat; o.receiveShadow = true; o.userData = { s, w, h, M, t, owner: o, flat: s.flat, shared: true }; propG.add(o);
  });
  // 풀 포기(새 화면만, 막힘 없음): 빈 풀밭 칸에 풀과 꽃을 흩뿌려 빈 땅이 넓게 보이지 않게. 길, 문 앞, 소품 둘레는 비운다. 그림마다 한 덩어리로 합쳐 그리는 횟수를 줄인다
  if (art() && !m.room && DECO[m.biome || 'grass']) { const DK = IMG['stamp/g_fern'] ? ['g_fern', 'g_tallgrass', 'g_yflowers', 'g_tallgrass', 'g_wflowers', 'g_ivy', 'g_bush', 'g_fern'] : ['fern1', 'fern2', 'flower3', 'fern1', 'flower4', 'fern2', 'bush4', 'flower1'], hs = (a, b) => { let h = (a * 374761393 + b * 668265263) | 0; h = (h ^ (h >>> 13)) * 1274126177 | 0; return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
    // 소품 둘레 칸을 미리 표시해 둔다(전에는 풀 한 포기마다 소품을 전부 훑어서 큰 지도에서 몇 초씩 걸렸다)
    const OCC = new Set(), C8 = 8; for (const q of m.stamps) { const S = STAMPS[q.name]; if (!S) continue; for (let yy = Math.floor((q.y + S[4] * .4 - 4) / C8); yy <= Math.floor((q.base + 8) / C8); yy++) for (let xx = Math.floor((q.x - 6) / C8); xx <= Math.floor((q.x + S[3] * (q.sc || 1) + 6) / C8); xx++) OCC.add(xx * 65536 + yy); }
    const near = (px, py) => OCC.has(Math.floor(px / C8) * 65536 + Math.floor(py / C8)) || m.portals.some(q => px > q.x - 12 && px < q.x + q.w + 12 && py > q.y - 6 && py < q.y + q.h + 20);
    const B = new Map();
    for (let y = WN.y0; y < WN.y1; y++) for (let x = WN.x0; x < WN.x1; x++) for (let j = 0; j < 3; j++) { if (m.g[y][x] !== 0 || hs(x * 7 + j, y * 13) > .7) continue;
      const px = (x + hs(x, y * 3 + j)) * TS, py = (y + hs(x * 5 + j, y)) * TS; if (near(px, py) || m.g[Math.floor(py / TS)]?.[Math.floor(px / TS)] !== 0) continue;
      const k = DK[Math.floor(hs(x * 3, y * 11 + j) * DK.length)], t = stampTex(k), st = STAMPS[k]; if (!t || !st) continue; const sc = (k.startsWith('g_') ? .75 : .45) + hs(y, x + j) * .3, w = st[3] * sc, h = st[4] * sc * HS, y0 = hAt(m, px, py), z = (py + .5) * ZS;
      if (!B.has(t)) B.set(t, { P: [], U: [], I: [] }); const b = B.get(t), n = b.P.length / 3;
      b.P.push(px - w / 2, y0, z, px + w / 2, y0, z, px + w / 2, y0 + h, z, px - w / 2, y0 + h, z); b.U.push(0, 0, 1, 0, 1, 1, 0, 1); b.I.push(n, n + 1, n + 2, n, n + 2, n + 3); }
    for (const [t, b] of B) { const g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(b.P, 3)); g.setAttribute('uv', new T.Float32BufferAttribute(b.U, 2)); g.setAttribute('normal', new T.Float32BufferAttribute(b.P.map((_, i) => i % 3 === 1 ? 1 : 0), 3)); g.setIndex(b.I);
      const o = new T.Mesh(g, matOf(t).m); o.receiveShadow = true; o.userData = { deco: true }; propG.add(o); } }
  // 등불 자리: 문 위, 등롱, 객잔 기
  m._lamps = [...LAMPX, ...m.portals.filter(q => q.door && !m.room && !LAMPX.some(l => Math.abs(l[0] - q.x - q.w / 2) < 30 && Math.abs(l[1] - q.y) < 12)).map(q => [q.x + q.w / 2, q.y - 2, 26]), ...m.stamps.filter(s => /lantern|banner|censer|v_lamp|v_stonelamp/.test(s.name)).map(s => { const st = STAMPS[s.name]; if (s.on) { const cx = s.x + s.w / 2, fy = s.y + st[4] * s.sc; return [cx, fy + 1, onTop(m, s, cx, fy) + st[4] * s.sc * .7]; }  /* 가구에 얹은 향로: 그 높이에서 빛난다 */ return [s.x + st[3] * (s.name === 'v_lamppost' ? .7 : .5), s.base + 1, st[4] * (s.name === 'v_lamppost' ? .6 : s.name === 'v_stonelamp' ? .6 : .7)]; })]; LAMPX.length = 0;
  camT.set(-1, 0, 0);  // 다음 장면에서 카메라를 바로 주인공에게
  buildMs = Math.round(performance.now() - t0);
}

// ── 인물 ──
const pool = []; let used = 0;
function actor(t, sx, sy, sw, sh, flip, x, y, size, lift = 0, wx = 1) {
  let o = pool[used];
  if (!o) { const g = new T.PlaneGeometry(1, 1); g.translate(0, .5, 0); const n = g.attributes.normal; for (let i = 0; i < 4; i++) n.setXYZ(i, 0, 1, 0); o = new T.Mesh(g); o.castShadow = true; o.receiveShadow = true; pool.push(o); actG.add(o); }
  used++; const M = matOf(t); o.material = M.m; o.customDepthMaterial = M.d; o.visible = true;
  const iw = t.image.width, ih = t.image.height, u0 = sx / iw, u1 = (sx + sw) / iw, v1 = 1 - sy / ih, v0 = 1 - (sy + sh) / ih, uv = o.geometry.attributes.uv;
  const a = flip ? u1 : u0, b = flip ? u0 : u1; uv.setXY(0, a, v1); uv.setXY(1, b, v1); uv.setXY(2, a, v0); uv.setXY(3, b, v0); uv.needsUpdate = true;
  size *= HD.actK(curMap);  // 사람 크기(ACTK), 방 안은 더 크게(js/field.js PSC)
  o.scale.set(size * wx, size * HS, 1); o.position.set(x, lift * HS + hAt(curMap, x, y), (y + 1) * ZS + .5);  // 2D는 발끝을 y+1에 그렸다. 같은 줄의 소품보다 반 점 앞
  return o;
}
// 예전 2.5등신 인물(16점 칸): 새 인물 그림이 오기 전까지 키는 주인공과 같게(칸 16점 중 사람 15점), 폭만 조금 줄여 덜 튀게
const OLDK = CHAR / 15 * .87;  // 다시 그린 옛 도트(Knight 따위)가 새 사람 시트(n_*)와 주인공보다 한 뼘 커서 키를 맞춘다(마을에서 재 보니 83 대 72)
let blobT = null; const blobs = []; let usedB = 0;
function blob(x, y, s) {
  if (!blobT) { const im = IMG['chars/_Shadow']; if (!im) return; blobT = new T.Texture(im); blobT.colorSpace = T.SRGBColorSpace; blobT.needsUpdate = true; }
  let o = blobs[usedB];
  if (!o) { o = new T.Mesh(new T.PlaneGeometry(1, 1), new T.MeshBasicMaterial({ map: blobT, transparent: true, depthWrite: false, opacity: .5 })); o.rotation.x = -Math.PI / 2; o.renderOrder = 1; blobs.push(o); actG.add(o); }
  usedB++; o.visible = true; o.scale.set(12 * s, 7 * s * ZS, 1); o.position.set(x, .15 + hAt(curMap, x, y), (y + .5) * ZS);
}
// drawActorSprite와 같은 칸을 고른다
// 다시 그린(두 배) 도트가 없는 옛 사람 도트는 새 화면에서 머리 큰 덩어리로 보인다. 다시 그린 것이 있는 비슷한 사람으로 바꿔 그린다(옛 화면은 그대로)
const HDALIAS = { 'chars/Noble': 'chars/Inspector', 'chars/Jegal': 'chars/Inspector', 'chars/Samaung': 'chars/Lion', 'chars/Master': 'chars/OldMan', 'chars/OldMan2': 'chars/OldMan', 'chars/OldMan3': 'chars/OldMan', 'chars/Gaebang': 'chars/Villager3', 'chars/Paeng': 'chars/Knight', 'chars/Pimp': 'chars/Villager2', 'chars/Cavegirl2': 'chars/Cavegirl', 'chars/Gisaeng': 'chars/Woman', 'chars/Gisaeng2': 'chars/Woman', 'chars/Gisaeng3': 'chars/Woman', 'chars/EggBoy': 'chars/Villager', 'chars/Child': 'chars/Villager', 'chars/Boy': 'chars/Villager' };
const KIDS = new Set(['chars/Child', 'chars/Boy']);  // 아이는 옛 도트 그대로 두고 작게
function frameOf(key, dirCol, row, diag) {
  if (IMG[key] && !IMG[key].hd && HDALIAS[key] && IMG[HDALIAS[key]]?.hd) key = HDALIAS[key];
  const img = IMG[key]; if (!img) return null; const dg = diag !== undefined && IMG[key + '_d'];
  if (dg) { const k = 16 * (dg.hd || 1); return { t: sheetTex(key + '_d'), sx: (diag % 2) * k, sy: Math.min(row, 3) * k, s: k, flip: diag > 1 }; }
  const f = 16 * (img.hd || 1), r = Math.min(row, Math.floor(img.height / f) - 1); return { t: sheetTex(key), sx: dirCol * f, sy: r * f, s: f, flip: false };
}
function syncActors(F) {
  used = 0; usedB = 0; const p = F.p, S = G.S, put = (key, dir, row, x, y, o = {}) => { const fr = frameOf(key, dir, row, o.diag); if (!fr || !fr.t) return; const sz = o.size || (KIDS.has(key) ? 11 : 16); actor(fr.t, fr.sx, fr.sy, fr.s, fr.s, fr.flip, x, y, sz * OLDK, o.lift || 0, .84); blob(x, y, sz / 16); };
  for (const n of F.npcs) { if (n.hide > 0) continue; if (n.stamp) { const t = stampTex(n.stamp); if (t) actor(t, 0, 0, t.image.width, t.image.height, false, n.x, n.y, 16 * (OLDSC[n.stamp] ?? .66) / HD.actK(curMap)); continue; }  // 일감 표시용 소품(걸레질 자리의 독 따위)은 사람 크기 배율을 안 받고 바닥 소품 크기로(방 안에서 사람만 한 독이 되던 것)
    const key = n.spr.includes('/') ? n.spr : 'chars/' + n.spr, pk = n.id && PEOPLE.has('n_' + n.id) ? 'n_' + n.id : n.role && PEOPLE.has('n_' + n.role) ? 'n_' + n.role : ROLE[n.hint] && PEOPLE.has('n_' + ROLE[n.hint]) ? 'n_' + ROLE[n.hint] : null, yt = (pk && previewTex(pk)) || (key === 'chars/Princess' && previewTex('yun')) || (NEWNPC[key] && NEWNPC[key].map(previewTex).find(Boolean)); if (yt) { actor(yt, n.dir * 56, (n.pose ?? Math.floor(n.walk || 0) % 4) % 4 * 56, 56, 56, false, n.x, n.y, CHAR * 56 / 48); blob(n.x, n.y, 1); continue; } put(key, n.dir, n.pose ?? Math.floor(n.walk || 0) % 4, n.x, n.y, { diag: n.walk ? n.diag : undefined, size: n.size, lift: n.hopT > 0 ? Math.sin(n.hopT / .4 * Math.PI) * 2.5 : 0 }); }
  const walker = (n, row) => { const key = n.spr.includes('/') ? n.spr : 'chars/' + n.spr, pk = n.role && PEOPLE.has('n_' + n.role) ? 'n_' + n.role : null, yt = (pk && previewTex(pk)) || (NEWNPC[key] && NEWNPC[key].map(previewTex).find(Boolean)); if (yt) { actor(yt, n.dir * 56, row % 4 * 56, 56, 56, false, n.x, n.y, CHAR * 56 / 48); blob(n.x, n.y, 1); } else put(key, n.dir, row, n.x, n.y, { size: n.size }); };
  for (const r of F.roam) if (!r.gone) { walker(r, Math.floor(r.walk || 0) % 4); for (const q of r.crew || []) walker(q, Math.floor(q.walk || 0) % 4); }  // 떠도는 무리·길손과 그 뒤를 따르는 사람들
  if (G.party && F.m.id !== 'world0') G.party.members().forEach((id, i) => { if (F.npcs.some(n => n.id === id)) return; const q = F.trail[Math.min(F.trail.length - 1, 16 + i * 16)]; if (!q) return; const s = G.party.spr(id); if (PEOPLE.has('n_' + id)) return walker({ spr: s, role: id, dir: q.dir, x: q.x, y: q.y }, Math.floor(p.walk) % 4); const key = s.includes('/') ? s : 'chars/' + s; put(key, q.dir, Math.floor(p.walk) % 4, q.x, q.y, { diag: p.walk ? q.diag : undefined }); });  // 동료도 새 사람 시트가 있으면 그것으로
  for (const a of F.animals || []) { if (a.gone) continue; const im = IMG[a.spr]; if (!im) continue; const t = sheetTex(a.spr); actor(t, (Math.floor(a.walk) % 2) * 16, 0, 16, 16, a.vx < 0, a.x, a.y - 1, 16); blob(a.x, a.y, .8); }
  const me = previewTex('me');  // 맛보기: 칸 56점, 사람 키 48점 → 사람 키가 CHAR가 되게 판을 키운다
  if (F.hideMe) { } else if (me) { actor(me, p.dir * 56, (Math.floor(p.walk) % 4) * 56, 56, 56, false, p.x, p.y, CHAR * 56 / 48); blob(p.x, p.y, 1); }
  else put('chars/' + S.look, p.dir, Math.floor(p.walk) % 4, p.x, p.y, { diag: p.walk ? p.diag : undefined });
  for (let i = used; i < pool.length; i++) pool[i].visible = false; for (let i = usedB; i < blobs.length; i++) blobs[i].visible = false;
  for (const o of bboard) o.mesh.visible = false;  // 전투 때 쓴 인물 판(주인공·적)을 마을에서 숨긴다. 안 숨겨서 전투가 끝난 자리에 주인공 닮은 사람이 덩그러니 서 있었다
}

// ── 카메라 ──
const camT = new (class { constructor() { this.x = -1; this.y = 0; this.z = 0; } set(x, y, z) { this.x = x; this.y = y; this.z = z; } })();
let dist = 300, lastT = 0, lastF = null;
function placeCam(F, dt) {
  const m = F.m, p = HD.peek ? { x: HD.peek[0], y: HD.peek[1] } : F.p, Wm = m.w * TS, Dm = m.h * TS * ZS, vh = CHAR * HD.opt.zoom * (m.room ? CAMR : m.id === 'world' ? CAMW : CAMK); dist = vh / (2 * Math.tan(FOV / 2 * DEG));
  const ty = 8 * HS, hc = ty + dist * Math.sin(PITCH), back = dist * Math.cos(PITCH), f = FOV / 2 * DEG, hw = dist * Math.tan(f) * W / H;
  // 화면 위 끝과 아래 끝이 닿는 땅이 지도 밖으로 너무 나가지 않게 겨냥점을 묶는다(2D 카메라가 지도 안에 머물던 것과 같다)
  // 남쪽은 화면 아래 끝이 지도 밖으로 나가지 않게 묶고, 북쪽은 주인공이 끝까지 가운데 오게 둔다(지도 너머는 안개와 넓은 땅. 먼 산은 5단계)
  // 방(벽을 모형으로 세운 방)은 북쪽 벽의 들보 위 끝이 화면 위 끝에 닿는 데까지만 카메라가 올라간다: 방 북쪽에 서 있으면 뒷벽이 통째로 보이고, 벽 너머 빈 곳은 안 보인다
  // (벽 앞면은 평면도 y = 16. 꼭대기 높이는 m.wallTop: 조각으로 세운 벽은 js/hd2d/rooms.js의 WALL_TOP, 동굴 모형은 47)
  const dn = hc / Math.tan(PITCH + f) - back, lo = m.wallTop ? Math.max(4 * TS * ZS, 16 * ZS + (hc - m.wallTop * HS) / Math.tan(PITCH - f) - back) : 4 * TS * ZS, hi = Math.max(lo, Dm + 4 * ZS + dn);
  let tx = p.x, tz = Math.min(hi, Math.max(lo, (p.y - vh * (m.room ? AHEADR : AHEAD)) * ZS));  // 주인공보다 조금 앞(북쪽)을 겨눠 주인공이 화면 가운데보다 아래에 선다(일검풍운결처럼). 앞쪽 집이 더 크게 들어온다
  tx = Wm < hw * 2 ? Wm / 2 : Math.min(Wm - hw, Math.max(hw, tx));  // 가로도 지도 안에 묶는다(이 줄이 위 주석에 먹혀 동서 끝에서 지도 밖이 보였다)
  const gy = m.hgt ? hAt(m, p.x, p.y) : 0;  // 주인공이 선 땅의 높이. 단 위에 서면 카메라도 그만큼 따라 올라간다(안 그러면 두 단 위에서 주인공이 사람 키의 1.2배만큼 화면 위로 밀려났다)
  if (camT.x < 0) camT.set(tx, ty + gy, tz); else { const k = 1 - Math.exp(-dt * 7), ky = 1 - Math.exp(-dt * 4); camT.set(camT.x + (tx - camT.x) * k, camT.y + (ty + gy - camT.y) * ky, camT.z + (tz - camT.z) * k); }
  cam.position.set(camT.x, camT.y + dist * Math.sin(PITCH), camT.z + back);
  if (HD.orbit) { const a = HD.orbit * DEG; cam.position.set(camT.x + Math.sin(a) * back, camT.y + dist * Math.sin(PITCH), camT.z + Math.cos(a) * back); }  // 시험 화면용: 겨냥점 둘레로 돌려 옆과 뒤에서 본다(게임에서는 쓰지 않는다)
  cam.lookAt(camT.x, camT.y, camT.z); cam.updateMatrixWorld();
  // 그림자 상자는 보이는 땅을 덮을 만큼
  // 방 안: 해가 옆에서 들면 사람 키의 세 배쯤 되는 옆벽이 바닥의 절반을 그늘로 덮는다. 빛을 카메라 쪽 위에서 비스듬히 내려, 벽의 그림자는 벽 뒤로 가고 기둥과 가구만 짧은 그림자를 뒤로 떨군다
  const L = TIMES[timeOf()], d = new T.Vector3(...(m.room ? ROOMSUN : L.sun)).normalize(); sun.target.position.set(camT.x, 0, camT.z - dist * .3); sun.position.copy(sun.target.position).addScaledVector(d, 1200);
  const sc = sun.shadow.camera, half = Math.max(hw * 1.5, dist * 1.25); sc.left = -half; sc.right = half; sc.top = half; sc.bottom = -half; sc.near = 200; sc.far = 2600; sc.updateProjectionMatrix();
}
const V = () => new T.Vector3();
// 평면도 (x, y)에서 높이 h인 곳 → 1280×720 화면 자리
// 평면도 (x, y)에서 땅 위로 h만큼 뜬 점이 화면 어디에 오는가. 땅의 높이(단, 계단)를 더한다: 안 더하면 단 위에 선 사람의 느낌표·화살표·말풍선이 단 높이만큼 아래에 뜬다. g: 땅 높이를 따로 줄 때
function proj(x, y, h = 0, g = hAt(curMap, x, y)) { const v = V().set(x, h * HS + g, y * ZS).project(cam); return [(v.x + 1) / 2 * W, (1 - v.y) / 2 * H, v.z]; }

// ── 가림: 주인공 몸을 카메라에서 본 줄이 앞의 그림의 칠해진 곳을 지나면 그 그림을 옅게(occl.js와 같은 판단) ──
const BODY = [[0, 13], [0, 9], [0, 6], [-3, 3], [3, 3]], frac = v => v - Math.floor(v);
const alphaAt = (t, u, v) => { const { width: w, height: h, data } = t.image; return data[(Math.min(h - 1, v * h | 0) * w + Math.min(w - 1, u * w | 0)) * 4 + 3] > 127; };  // v는 아래가 0
function fades(F, dt = 1) {
  const p = F.p, C = cam.position, hit = new Set(), rc = fades.rc || (fades.rc = new T.Raycaster()), v = V();
  for (const [dx, dh] of BODY) {
    v.set(p.x + dx, dh * HS + hAt(curMap, p.x, p.y), (p.y + 1) * ZS + .5); const d = v.distanceTo(C); rc.set(C, v.sub(C).normalize()); rc.far = d - 1;
    for (const h of rc.intersectObjects(propG.children, true)) { const u = h.object.userData; if (!u.M || u.flat) continue; if (u.t && h.uv && !alphaAt(u.t, frac(h.uv.x), frac(h.uv.y))) continue; hit.add(u.owner); break; }
  }
  for (const o of propG.children) { const on = hit.has(o);
    if (o.userData.house) { cutHouse(o, on && !HD.orbit, dt); continue; }  // 집: 구멍 대신 건물째 무릎 높이로 걷어 낸다
    if (!!o.userData.faded === on) continue; o.userData.faded = on; (o.userData.ms || (o.isGroup ? o.children : [o])).forEach(c => { if (c.userData.M) c.material = on ? c.userData.M.f : c.userData.M.m; }); }
}
// 주인공과 카메라 사이에 낀 집: 지붕과 벽 윗부분을 걷어 내고 무릎 높이 밑동만 남긴다. 벗어나면 부드럽게 되돌린다(그림자는 그대로 진다)
const KNEE = 6;
function cutHouse(g, on, dt) {
  const u = g.userData, k = 1 - Math.exp(-dt * 6); u.cutV = (u.cutV || 0) + ((on ? 1 : 0) - (u.cutV || 0)) * k; if (!on && u.cutV < .01) u.cutV = 0;
  const want = u.cutV > 0; if (!u.cutU) { if (!want) return; const bb = new T.Box3().setFromObject(g); u.top = bb.max.y + 2; u.cutU = { value: u.top }; u.cutM = new Map(); }
  u.cutU.value = u.top + (KNEE * HS - u.top) * u.cutV;
  if (!!u.cutOn === want) return; u.cutOn = want;
  const ms = []; g.traverse(c => { if (c.isMesh) ms.push(c); });  // 블렌더 모형은 물체가 한 겹 더 안에 있다
  for (const c of ms) { if (c.userData.flat) continue; if (!c.userData.base) c.userData.base = c.material;
    if (!want) { c.material = c.userData.base; continue; }
    let m = u.cutM.get(c.userData.base); if (!m) { const b = c.userData.base; m = b.clone(); m.side = T.DoubleSide; const cu = u.cutU;
      m.onBeforeCompile = sh => { b.onBeforeCompile(sh); sh.uniforms.uCut = cu; sh.vertexShader = 'varying float vCutY;\n' + sh.vertexShader.replace('#include <project_vertex>', '#include <project_vertex>\n vCutY = (modelMatrix * vec4(transformed, 1.)).y;');
        sh.fragmentShader = 'uniform float uCut; varying float vCutY;\n' + sh.fragmentShader.replace('void main() {', 'void main() {\n if (vCutY > uCut) discard;'); };
      m.customProgramCacheKey = () => (b.customProgramCacheKey ? b.customProgramCacheKey() : '') + '-cut'; u.cutM.set(b, m); }
    c.material = m; }
}

// ── 먼 풍경(임시): 하늘은 화면 배경의 위아래 색, 먼 산은 단색 실루엣 세 겹, 산자락마다 뿌연 띠. 지도 북쪽 멀리 세운다 ──
let sky = null, mtns = null;
function backdrop(L) {
  if (!sky) {
    const c = mk(4, 256); sky = new T.CanvasTexture(c); sky.colorSpace = T.SRGBColorSpace; sky.userData.c = c;
    mtns = new T.Group(); scene.add(mtns);
    const ridge = (seed, n, rough) => { const c2 = mk(1024, 256), x = c2.getContext('2d'), hs = i => { const v = Math.sin(i * 127.1 + seed * 311.7) * 43758.5453; return v - Math.floor(v); }, nz = u => { const i = Math.floor(u), f = u - i, a = f * f * (3 - 2 * f); return hs(i) + (hs(i + 1) - hs(i)) * a; };
      x.fillStyle = '#fff'; x.beginPath(); x.moveTo(0, 256); for (let i = 0; i <= 256; i++) { const u = i / 256 * n; const y = 256 * (1 - (.35 + .45 * nz(u) + .2 * rough * nz(u * 3.7 + 9))); x.lineTo(i * 4, Math.max(4, y)); } x.lineTo(1024, 256); x.fill();
      const t = new T.CanvasTexture(c2); t.magFilter = T.NearestFilter; t.minFilter = T.LinearFilter; return t; };
    // 거리, 너비, 높이, 산 봉우리 수
    // 지도 북쪽 끝에서 얼마나 떨어졌나, 너비, 높이, 봉우리 수. 가까운 겹은 마을 바로 뒤에 솟아 마을 북쪽을 가린다
    [[4600, 24000, 1700, 5, 1], [2200, 14000, 900, 7, .8], [700, 9000, 520, 10, .6]].forEach(([d, w, h, n, r], i) => {
      const o = new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshBasicMaterial({ map: ridge(i + 1, n, r), transparent: true, alphaTest: .5, fog: false, depthWrite: true })); o.userData.k = i; o.userData.d = d; o.userData.h = h; mtns.add(o);
      const hz = mk(4, 64), hx = hz.getContext('2d'), g = hx.createLinearGradient(0, 0, 0, 64); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(.6, 'rgba(255,255,255,.5)'); g.addColorStop(1, 'rgba(255,255,255,.9)'); hx.fillStyle = g; hx.fillRect(0, 0, 4, 64);
      const ht = new T.CanvasTexture(hz), band = new T.Mesh(new T.PlaneGeometry(w, h * .3), new T.MeshBasicMaterial({ map: ht, transparent: true, depthWrite: false, fog: false })); band.userData.k = i; band.userData.d = d - 20; band.userData.h = h * .3; band.userData.band = true; mtns.add(band); });
  }
  if (sky.userData.t !== L) { sky.userData.t = L; const x = sky.userData.c.getContext('2d'), g = x.createLinearGradient(0, 0, 0, 256); g.addColorStop(0, L.skyT); g.addColorStop(.75, L.fog); g.addColorStop(1, L.fog); x.fillStyle = g; x.fillRect(0, 0, 4, 256); sky.needsUpdate = true; }
  scene.background = sky;
  const fog = new T.Color(L.fog), base = new T.Color(L.mtn);
  for (const o of mtns.children) { const { k, d, h, band } = o.userData; o.position.set(camT.x, h / 2 - 260, -d); if (band) o.material.color.copy(fog); else o.material.color.copy(base).lerp(fog, [.5, .25, 0][k]).multiplyScalar([1, .9, .78][k]); o.renderOrder = -10 + k; }
}

// ── 화면 맨 앞(임시): 카메라 바로 앞 땅에 덤불과 나무 울타리를 깐다. 아래쪽에 머리만 조금 들어와 앞 흐림으로 뿌옇게 보인다.
// 놓는 자리는 세상 좌표로 칸을 맞춰 두어, 걸으면 가까운 것답게 빨리 지나간다
const FG = [], FGM = new Map(); const FGK = ['bush2', 'bush4', 'fern1', 'bush1', 'bush2', 'fern2', 'bush4', 'bush3'];  // 둥근 덤불과 풀만(판자 울타리는 흐리면 네모 덩어리로 보여 뺐다)
// 앞가림은 역광 그늘이라 어둡게: 재질을 따로 복제해 색을 낮춘다
// 앞가림: 그림 모양 그대로 짙은 남갈색 실루엣(빛을 받지 않는다). 흐림은 화면 흐림(가까운 쪽)이 맡는다
const fgMat = t => { let m = FGM.get(t); if (!m) { m = new T.MeshBasicMaterial({ map: t, color: '#20160e', alphaTest: .35, fog: false }); FGM.set(t, m); } return m; };
function foreground() {
  if (true || HD.orbit || HD.peek) { for (const o of FG) o.visible = false; return; }  // 앞가림 덤불은 끈다: 흐리게 그릴 방법을 찾기 전까지 검은 덩어리가 따라다니는 것처럼 보였다  // 시험 화면(건물 겨냥)에서는 앞가림을 빼고 찍는다
  const step = 21, d = dist * .32, z = cam.position.z - d * Math.cos(0), base = Math.floor((camT.x - dist * .9) / step);
  for (let i = 0; i < 18; i++) {
    const n = base + i, k = FGK[((n % 8) + 8) % 8], t = k.startsWith('k_') ? previewTex(k) : stampTex(k); let o = FG[i];
    if (!o) { o = new T.Mesh(new T.PlaneGeometry(1, 1)); o.geometry.translate(0, .5, 0); const nn = o.geometry.attributes.normal; for (let j = 0; j < 4; j++) nn.setXYZ(j, 0, 1, 0); scene.add(o); FG.push(o); }
    if (!t) { o.visible = false; continue; } o.material = fgMat(t); o.visible = true;
    // 화면 아래 4분의 1쯤까지만 올라오게 키를 화면 좌표로 맞춘다(세운 판이라 높이와 화면 y가 거의 곧게 이어진다)
    const j = Math.abs(Math.sin(n * 12.9898) * 43758.5453 % 1), x = n * step + j * 10, zz = z + j * 8, y0 = hAt(curMap, x, zz / ZS);
    const top = k.startsWith('k_') ? -.5 : -.1 - j * .3, phi = PITCH + Math.atan(-top * Math.tan(cam.fov * Math.PI / 360));
    const h = Math.max(4, cam.position.y - y0 - (cam.position.z - zz) * Math.tan(phi)), w = h * t.image.width / t.image.height / (k.startsWith('k_') ? 1 : 1.2);
    o.scale.set(w * 1.15, h * 1.15, 1); o.position.set(x, y0, zz);
  }
}

// ── 빛 ──
const ROOMSUN = [.14, .8, .58];
// 방 안의 빛: 바깥의 낮 빛(센 해, 누렇게 물들이기)을 그대로 쓰면 방이 온통 주황이다(기준 그림은 주황 8%, 거의 검정 48%, 밝기 48).
// 해를 약하게, 물들이기를 빼고, 채도를 낮추고, 낮에도 등불을 켠다. 방 바닥과 벽 그림(FL1, WL1)이 오면 다시 맞춘다
const ROOMT = { day: { sunC: '#fff0d8', sunI: 2.7, sky: '#9a9486', gnd: '#3a3026', hemI: .5, fill: .1, con: 1.25, vig: .95, tint: [1, .98, .9], expo: .84, sat: .78, warm: 0, lamp: .45 },
  night: { sunC: '#ffc890', sunI: 1.5, sky: '#6e5e4c', gnd: '#261e16', hemI: .62, fill: .1, con: 1.2, vig: 1.05, tint: [1, .95, .88], expo: .9, sat: .85, warm: 0, lamp: 1.2 } }, ROOML = {};  // 밤의 방은 달빛이 아니라 촛불 빛이다: 누렇고 어둑하게, 등불 둘레가 밝다
const LT = () => { const t = timeOf(), L = TIMES[t]; return curMap?.room ? (ROOML[t] ||= { ...L, ...ROOMT[t === 'night' ? 'night' : 'day'] }) : L; };
const timeOf0 = () => HD.opt.time === 'auto' ? (G.S?.flags?.night ? 'night' : 'day') : HD.opt.time;
let inBattle = false;
// 전투는 밤이어도 저녁 빛으로 그린다. 밤 빛 그대로면 무대 대부분이 시커멓고 등불 둘레만 밝아서 사람이 안 보였다
const timeOf = () => { const t = timeOf0(); return inBattle && t === 'night' ? 'evening' : t; };
function light() {
  const L = LT(); PALU.uAmb.value = curMap?.room && timeOf() === 'night' ? .12 : .22;  // 조각이 스스로 내는 빛: 밤의 방에서는 줄인다(벽만 훤해 보인다)
  for (const m of GLOW) m.emissiveIntensity = m.userData.paper && curMap?.room ? (timeOf() === 'night' ? .1 : .8) : (L.lamp || 0) * .9;  // 밤에는 창에서 빛이 샌다. 방 안에서 보는 창호지(조각의 win_paper)는 거꾸로 낮에 바깥 빛으로 밝다
  if (waterM) { WU.uT.value = performance.now() / 1000; WU.uSky.value.set(L.skyT); WU.uDeep.value.set(L.lamp ? '#0e2430' : '#1f4a52'); }
  sun.color.set(L.sunC); sun.intensity = L.sunI; hemi.color.set(L.sky); hemi.groundColor.set(L.gnd); hemi.intensity = L.hemI;
  { const d = L.sun; fill.position.set(camT.x - d[0] * 800, 500, camT.z + 600); fill.target.position.set(camT.x, 0, camT.z); fill.intensity = L.sunI * (L.fill ?? .2); fill.color.set(L.fillC || '#c8c0b8'); }
  scene.fog.color.set(L.fog); scene.fog.near = dist * 3; scene.fog.far = dist * 13; backdrop(L);
  const sz = fxNow() === 'high' ? 4096 : fxNow() === 'low' ? 1024 : 2048; if (sun.shadow.mapSize.x !== sz) { sun.shadow.mapSize.set(sz, sz); sun.shadow.map?.dispose(); sun.shadow.map = null; }
  const ls = (curMap._lamps || []).map(q => [q, (q[0] - camT.x) ** 2 + (q[1] * ZS - camT.z) ** 2]).sort((a, b) => a[1] - b[1]);
  lamps.forEach((l, i) => { const q = ls[i]?.[0], h = l.userData.halo; if (!q || !L.lamp) { l.intensity = 0; h.visible = false; return; } const fl = 1 + Math.sin(performance.now() / 260 + i * 1.7) * .05;
    l.intensity = 300 * L.lamp * fl; l.position.set(q[0], q[2] * HS, q[1] * ZS + 14); h.visible = true; h.position.set(q[0], q[2] * HS, q[1] * ZS + 6); h.material.opacity = L.lamp * .9 * fl; });
  for (const b of blobs) b.material.opacity = L.lamp ? .6 : .55;
}

// ── 후처리: 깊이 흐림, 밝은 번짐, 시각별 색, 가장자리 어둡게 ──
const VS = 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }';
function makePost() {
  const rt = (w, h, o = {}) => new T.WebGLRenderTarget(w, h, { type: T.HalfFloatType, minFilter: T.LinearFilter, magFilter: T.LinearFilter, depthBuffer: false, ...o });
  const qs = new T.Scene(), qc = new T.OrthographicCamera(-1, 1, 1, -1, 0, 1), q = new T.Mesh(new T.PlaneGeometry(2, 2)); q.frustumCulled = false; qs.add(q);
  const sm = (fs, u) => new T.ShaderMaterial({ vertexShader: VS, fragmentShader: fs, uniforms: u, depthTest: false, depthWrite: false });
  const down = sm('uniform sampler2D src; uniform vec2 px; varying vec2 vUv; void main(){ gl_FragColor = .25 * (texture2D(src, vUv + px * vec2(-.5,-.5)) + texture2D(src, vUv + px * vec2(.5,-.5)) + texture2D(src, vUv + px * vec2(-.5,.5)) + texture2D(src, vUv + px * vec2(.5,.5))); }', { src: { value: null }, px: { value: new T.Vector2() } });
  const blur = sm(`uniform sampler2D src; uniform vec2 dir; varying vec2 vUv; void main(){
    vec4 c = texture2D(src, vUv) * .2270270270;
    c += (texture2D(src, vUv + dir * 1.3846153846) + texture2D(src, vUv - dir * 1.3846153846)) * .3162162162;
    c += (texture2D(src, vUv + dir * 3.2307692308) + texture2D(src, vUv - dir * 3.2307692308)) * .0702702703;
    gl_FragColor = c; }`, { src: { value: null }, dir: { value: new T.Vector2() } });
  const fin = sm(`#include <packing>
    uniform sampler2D tS, tD, tB1, tB2; uniform float cn, cf, focus, f0, f1, n0, n1, dof, expo, sat, bk, bt, vig, con, warm; uniform vec3 tint; varying vec2 vUv;
    vec3 srgb(vec3 c){ return mix(c * 12.92, 1.055 * pow(c, vec3(1. / 2.4)) - .055, step(.0031308, c)); }
    void main(){
      vec3 s = texture2D(tS, vUv).rgb, b1 = texture2D(tB1, vUv).rgb, b2 = texture2D(tB2, vUv).rgb;
      float z = -perspectiveDepthToViewZ(texture2D(tD, vUv).x, cn, cf), d = z - focus;
      float c = dof * (d > 0. ? smoothstep(f0, f1, d) : smoothstep(n0, n1, -d)); c = mix(c, .3, smoothstep(2800., 4200., z));  // 먼 산은 윤곽이 남게 덜 흐린다
      vec3 col = mix(s, b1, smoothstep(0., .45, c)); col = mix(col, b2, (d < 0. ? 1. : .7) * smoothstep(.45, 1., c));  // 먼 곳도 윤곽은 남게 강한 흐림은 7할까지만
      col += (max(b2 - bt, 0.) + .5 * max(b1 - bt * 1.15, 0.)) * bk;
      col *= tint * expo; col = pow(max(col, 0.), vec3(con)) * (1. + (con - 1.) * .6);  // 대비: 어두운 곳을 더 깊게
      float l = dot(col, vec3(.2126, .7152, .0722)); col = mix(vec3(l), col, sat);
      // 갈라 물들이기: 어두운 쪽은 짙은 남갈색으로 누르고, 밝은 쪽에는 따뜻한 빛을 얹는다(기준 낮 화면의 톤)
      col *= mix(vec3(1.), mix(vec3(.82, .74, .7), vec3(1.06, .99, .86), smoothstep(.04, .55, l)), warm);
      col += warm * vec3(.022, .014, .012) * (1. - smoothstep(0., .12, l));  // 그늘이 새까맣지 않게 짙은 남갈색으로 들어 올린다
      vec2 qv = (vUv - .5) * vec2(1.15, 1.); col *= 1. - vig * smoothstep(.22, .78, length(qv)); col *= mix(1., .5, vig * smoothstep(.3, 0., vUv.y));  // 가장자리, 특히 화면 아래를 어둡게
      gl_FragColor = vec4(srgb(max(col, 0.)), 1.); }`,
    { warm: { value: 0 }, tS: { value: null }, tD: { value: null }, tB1: { value: null }, tB2: { value: null }, cn: { value: 20 }, cf: { value: 6000 }, focus: { value: 300 }, f0: { value: 0 }, f1: { value: 1 }, n0: { value: 0 }, n1: { value: 1 }, dof: { value: 1 }, expo: { value: 1 }, sat: { value: 1 }, bk: { value: .6 }, bt: { value: .8 }, vig: { value: .3 }, con: { value: 1 }, tint: { value: new T.Vector3(1, 1, 1) } });
  const P = { rt, down, blur, fin, qs, qc, q, w: 0, h: 0 };
  P.pass = (mat, target) => { q.material = mat; R.setRenderTarget(target); R.render(qs, qc); };
  P.size = (w, h) => {
    if (P.w === w && P.h === h) return; P.w = w; P.h = h; for (const k of ['scene', 'a1', 'b1', 'a2', 'b2']) P[k]?.dispose();
    P.scene = rt(w, h, { depthBuffer: true, depthTexture: new T.DepthTexture(w, h) });
    const w2 = Math.ceil(w / 2), h2 = Math.ceil(h / 2), w4 = Math.ceil(w / 4), h4 = Math.ceil(h / 4);
    P.a1 = rt(w2, h2); P.b1 = rt(w2, h2); P.a2 = rt(w4, h4); P.b2 = rt(w4, h4);
  };
  return P;
}
function resize(force) {
  const s = Math.min(innerWidth / W, innerHeight / H), dpr = window.devicePixelRatio || 1, cap = fxNow() === 'high' ? 2560 : 1920;  // 보통도 1920×1080까지
  const bw = Math.round(Math.min(cap, Math.max(W, W * s * dpr)) * (fxNow() === 'low' ? .75 : 1)), bh = Math.round(bw * H / W);
  if (!force && R.domElement.width === bw) return; R.setSize(bw, bh, false); post.size(bw, bh);
}
function postFx(F) {
  const P = post, L = LT(), u = P.fin.uniforms;
  P.down.uniforms.src.value = P.scene.texture; P.down.uniforms.px.value.set(1 / P.w, 1 / P.h); P.pass(P.down, P.a1);
  const bl = (a, b, w, h, k) => { P.blur.uniforms.src.value = a.texture; P.blur.uniforms.dir.value.set(k / w, 0); P.pass(P.blur, b); P.blur.uniforms.src.value = b.texture; P.blur.uniforms.dir.value.set(0, k / h); P.pass(P.blur, a); };
  bl(P.a1, P.b1, P.a1.width, P.a1.height, 1);
  P.down.uniforms.src.value = P.a1.texture; P.down.uniforms.px.value.set(1 / P.a1.width, 1 / P.a1.height); P.pass(P.down, P.a2);
  bl(P.a2, P.b2, P.a2.width, P.a2.height, 1.6); bl(P.a2, P.b2, P.a2.width, P.a2.height, 2.4);
  // 초점은 주인공 가슴 깊이. 뒤로는 천천히, 앞으로는 조금 빨리 흐려진다
  const fp = (HD.peek ? V().set(camT.x, 20 * HS, camT.z) : V().set(F.p.x, 8 * HS + hAt(curMap, F.p.x, F.p.y), (F.p.y + 1) * ZS)).applyMatrix4(cam.matrixWorldInverse);
  Object.assign(u.tS, { value: P.scene.texture }); u.tD.value = P.scene.depthTexture; u.tB1.value = P.a1.texture; u.tB2.value = P.a2.texture;
  u.cn.value = cam.near; u.cf.value = cam.far; u.focus.value = -fp.z; u.f0.value = dist * 1.6; u.f1.value = dist * 4; u.n0.value = dist * .5; u.n1.value = dist * .64;  // 가까운 흐림은 화면 앞 덤불에만(높은 지붕은 초점보다 가깝지만 흐리지 않게)
  const cool = curMap?.biome === 'snow' && !L.lamp;  // 눈 덮인 낮은 따뜻한 물들이기를 빼고 차갑게
  u.tint.value.set(...(cool ? [.94, 1, 1.1] : L.tint)); u.expo.value = L.expo; u.sat.value = L.sat; u.bk.value = fxNow() === 'high' ? .75 : .55; u.bt.value = timeOf() === 'night' ? .55 : .82; u.vig.value = L.vig ?? .62; u.con.value = L.con || 1.08; u.warm.value = curMap?.biome === 'snow' ? 0 : L.warm || 0;
  P.pass(P.fin, null);
}

// ── 한 장면 ──
let fpsT = 0, fpsN = 0, fpsV = 0, slow = 0;
// 느리면 스스로 낮춘다: 높음 → 보통 → 보통(해상도 4분의 3, 그림자 작게). 3초 넘게 초당 45장이 안 되면 한 단계
function govern() {
  if (fpsV >= 45 || document.hidden) { slow = 0; return; } if (++slow < 3) return; slow = 0;
  if (HD.opt.fx === 'auto' && autoLv !== 'low') { autoLv = 'low'; resize(true); }  // 화질 '자동'일 때만 느리면 스스로 낮춘다. 낮음·보통·높음을 직접 고르면 그대로 둔다(전에는 높음을 골라도 몰래 낮춰서, 단추는 높음인데 '느려서 낮춤'이 떴다)
}
// 그림자 지도는 그리기의 6할을 먹는다(청하진: 604번 중 378번). 높음은 매 장, 보통은 두 장에 한 번, 낮음은 세 장에 한 번만 새로 그린다. 카메라가 크게 움직이면 바로 그린다
let shN = 0; const shCam = { x: 0, z: 0 };
function shadowTick() {
  if (R.shadowMap.autoUpdate) R.shadowMap.autoUpdate = false;
  const k = { high: 1, mid: 2, low: 3 }[fxNow()] || 2, moved = Math.abs(camT.x - shCam.x) + Math.abs(camT.z - shCam.z) > 3;
  if (++shN >= k || moved) { shN = 0; shCam.x = camT.x; shCam.z = camT.z; R.shadowMap.needsUpdate = true; }
}
// 강호 큰 지도(1286×1053칸)는 통째로 지을 수 없어서, 주인공 둘레 WIN칸만 잘라 짓고 주인공이 가운데서 STEP칸 넘게 벗어나면 다시 짓는다.
// 잘라 낸 지도(m.win)는 좌표를 그대로 두고(사람·소품·카메라 모두 큰 지도 좌표) 땅·물·풀만 그 범위로 짓는다
const WIN = [100, 76], STEP = 26; let winM = null;
function winOf(F) {
  const W = F.m, tx = F.p.x / TS, ty = F.p.y / TS;
  if (winM && winM.src === W && Math.abs(tx - winM.cx) < STEP && Math.abs(ty - winM.cy) < STEP * .8) return winM;
  const x0 = Math.max(0, Math.min(W.w - WIN[0], Math.round(tx - WIN[0] / 2))), y0 = Math.max(0, Math.min(W.h - WIN[1], Math.round(ty - WIN[1] * .55))), x1 = x0 + WIN[0], y1 = y0 + WIN[1];
  const X0 = x0 * TS, Y0 = y0 * TS, X1 = x1 * TS, Y1 = y1 * TS, stamps = W.stamps.filter(s => s.x < X1 + 40 && s.x > X0 - 120 && s.base > Y0 && s.y < Y1 + 20);
  winM = Object.assign(Object.create(W), { src: W, cx: Math.round(tx), cy: Math.round(ty), win: { x0, y0, x1, y1 }, stamps, portals: (W.portals || []).filter(q => q.x > X0 && q.x < X1 && q.y > Y0 && q.y < Y1), models: null });
  return winM;
}
function render(F) {
  inBattle = false; lastF = F; const now = performance.now(), dt = Math.min(.1, lastT ? (now - lastT) / 1000 : .016); lastT = now;
  if (cv.style.display === 'none') cv.style.display = 'block';
  if (cam.view?.enabled) cam.clearViewOffset();
  resize(); setMap(F.m.live ? winOf(F) : F.m); placeCam(F, dt); foreground(); syncActors(F); fades(F, dt); light();
  { const [x, y] = proj(F.p.x, F.p.y, 8), k = post.h / H, v = V().set(F.p.x, 8 * HS + hAt(curMap, F.p.x, F.p.y), (F.p.y + 1) * ZS).applyMatrix4(cam.matrixWorldInverse);  // 구멍: 화면의 주인공 가슴 자리, 주인공 키의 0.9배 반지름
    if (!HOLE.uHole.value) HOLE.uHole.value = new T.Vector3(); HOLE.uHole.value.set(x * post.w / W, (H - y) * k, HD.pxPerUnit() * CHAR * .9 * k); HOLE.uHoleZ.value = -v.z - 2; }
  shadowTick(); R.setRenderTarget(post.scene); R.render(scene, cam); postFx(F);
  fpsN++; if (now - fpsT > 1000) { fpsV = Math.round(fpsN * 1000 / (now - fpsT)); fpsN = 0; fpsT = now; const e = $('#hdfps'); if (e) e.textContent = fpsV + '장/초' + (fxNow() === 'low' ? ' (낮춤)' : ''); if (!G.auto && !HD.noGov) govern(); }
}

// ── 전투 ──
// 전투 좌표(평면도 점)는 그대로 두고 그리는 곳만 3D로 옮긴다. 사람마다 캔버스 하나에 전투 그림(drawActor)을 4배로 그려 세운 판에 입힌다.
// 효과·숫자·표시는 겹친 2D 캔버스에 그리는데, 그 자리의 땅을 화면으로 옮기는 행렬(affine)로 그대로 그린다
const BK = 4, bboard = []; let usedBB = 0;
function bbSlot(w, h) {
  let o = bboard[usedBB];
  const cw = Math.ceil(w * BK), ch = Math.ceil(h * BK);
  if (!o || o.cv.width !== cw || o.cv.height !== ch) {
    if (!o) { const g = new T.PlaneGeometry(1, 1); g.translate(0, .5, 0); const n = g.attributes.normal; for (let i = 0; i < 4; i++) n.setXYZ(i, 0, 1, 0); o = { mesh: new T.Mesh(g) }; o.mesh.castShadow = true; o.mesh.receiveShadow = true; actG.add(o.mesh); bboard.push(o); }
    o.cv = mk(cw, ch); o.x = o.cv.getContext('2d'); o.tex?.dispose(); o.tex = new T.CanvasTexture(o.cv); o.tex.colorSpace = T.SRGBColorSpace; o.tex.generateMipmaps = false; o.tex.minFilter = T.LinearFilter;
    o.mesh.material?.dispose(); o.mesh.material = sharpen(new T.MeshLambertMaterial({ map: o.tex, transparent: true, alphaTest: .04 }));
    o.mesh.customDepthMaterial = new T.MeshDepthMaterial({ depthPacking: T.RGBADepthPacking, map: o.tex, alphaTest: .5 });
  }
  usedBB++; o.mesh.visible = true; return o;
}
function syncBattle(B) {
  used = 0; usedB = 0; usedBB = 0;
  for (const a of B.actors) {
    if (a.dead && a.deadT > .8) continue;
    const s = a.scale || 1, b = a.big, w = b ? b.w + 24 : 60 * s, h = b ? b.h + 20 : 54 * s, down = 4, o = bbSlot(w, h), x = o.x;
    x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, o.cv.width, o.cv.height); x.imageSmoothingEnabled = false;
    x.setTransform(BK, 0, 0, BK, (w / 2 - a.x) * BK, (h - down - a.y) * BK); B.drawActor(x, a, true);
    o.tex.needsUpdate = true;
    o.mesh.scale.set(w * ACTB, h * HS * ACTB, 1); o.mesh.position.set(a.x, -down * HS * ACTB + hAt(curMap, a.x, a.y), (a.y + 1) * ZS + .5);
    { const mt = o.mesh.material; if (!mt.emissiveMap) { mt.emissive = new T.Color(0xffffff); mt.emissiveMap = o.tex; mt.needsUpdate = true; } mt.emissiveIntensity = a.isPlayer ? .22 : .08; }  // 어두운 무대에서 사람이 묻히지 않게 살짝 제 빛을 준다(주인공 테는 뺐다)
    if (!a.dead) blob(a.x, a.y, b ? 2 : s);
  }
  for (let i = used; i < pool.length; i++) pool[i].visible = false; for (let i = usedB; i < blobs.length; i++) blobs[i].visible = false; for (let i = usedBB; i < bboard.length; i++) bboard[i].mesh.visible = false;
}
function placeCamBattle(B, dt) {
  const m = B.stage, Wm = m.w * TS, Hm = m.h * TS; let sx = 0, sy = 0, n = 0;
  for (const a of B.actors) { if (a.dead) continue; const k = a.isPlayer ? 3 : 1; sx += a.x * k; sy += a.y * k; n += k; }
  const ax = n ? sx / n : Wm / 2, ay = n ? sy / n : Hm / 2, f = FOV / 2 * DEG;
  let d = CHAR * HD.opt.zoom * 1.08 * CAMB / (2 * Math.tan(f)); const hw = d * Math.tan(f) * W / H;  // 마을보다 3할 멀리: 싸움터 전체가 들어오게  // 마을 카메라와 같은 거리: 사람이 마을과 같은 크기
  let tx = Math.min(Wm - hw + 20, Math.max(hw - 20, ax)), tyP = Math.min(Hm - 50, Math.max(50, ay - 16));  // 사람보다 조금 북쪽을 겨눠 무대 뒤 담과 건물이 화면에 들어온다
  // 주인공은 늘 화면 안에 둔다. 전에는 싸우는 사람들의 가운데만 겨눠서, 적과 떨어져 아래나 구석으로 가면 주인공이 화면 밖으로 나갔다(시작할 때 동료도 화면 아래로 잘렸다)
  // 화면 세로 자리 sy(-1 맨 위, +1 맨 아래)에 놓이는 땅이 겨눈 곳에서 평면도로 몇 점 아래인지 구해, 주인공 발이 화면 위 15%~아래 75% 사이에 오게 겨눈 곳을 당긴다. 가로는 주인공 깊이에서 보이는 폭의 8할 안
  const P = B.actors.find(a => a.isPlayer && !a.dead);
  if (P) { const hcam = 8 * HS + d * Math.sin(PITCH), back = d * Math.cos(PITCH), planAt = sy => (back - hcam / Math.tan(PITCH + Math.atan(sy * Math.tan(f)))) / ZS;
    tyP = Math.min(P.y - planAt(-.7), Math.max(P.y - planAt(.5), tyP));
    const mx = (d - (P.y - tyP) * ZS * Math.cos(PITCH)) * Math.tan(f) * W / H * .8; tx = Math.min(P.x + mx, Math.max(P.x - mx, tx)); }
  if (B.zoomT > 0) { const u = Math.sin(Math.min(1, B.zoomT / .75) * Math.PI); d *= 1 - .16 * u; tx += ((B.zoomX ?? tx) - tx) * .5 * u; tyP += ((B.zoomY ?? tyP) - tyP) * .5 * u; }
  if (B.shakeT > 0) { tx += (Math.random() - .5) * 2 * B.shakeA; tyP += (Math.random() - .5) * 2 * B.shakeA; }
  dist = d; const ty = 8 * HS, tz = tyP * ZS;
  if (camT.x < 0 || !B.camInit) { camT.set(tx, ty, tz); B.camInit = true; } else { const k = 1 - Math.exp(-dt * 6); camT.set(camT.x + (tx - camT.x) * k, ty, camT.z + (tz - camT.z) * k); }
  cam.position.set(camT.x, camT.y + dist * Math.sin(PITCH), camT.z + dist * Math.cos(PITCH)); cam.lookAt(camT.x, camT.y, camT.z); cam.updateMatrixWorld();
  cam.setViewOffset(W, H, 0, (B.band || 0) / 2, W, H);  // 아래 기술 칸 띠만큼 그림을 위로 올린다(화면 행렬 proj도 같이 따라간다)
  const L = TIMES[timeOf()], dv = new T.Vector3(...L.sun).normalize(); sun.target.position.set(camT.x, 0, camT.z - dist * .3); sun.position.copy(sun.target.position).addScaledVector(dv, 1200);
  const sc = sun.shadow.camera, half = dist * 1.4; sc.left = -half; sc.right = half; sc.top = half; sc.bottom = -half; sc.near = 200; sc.far = 2600; sc.updateProjectionMatrix();
}
function renderBattle(B) {
  inBattle = true;
  const now = performance.now(), dt = Math.min(.1, lastT ? (now - lastT) / 1000 : .016); lastT = now;
  if (cv.style.display === 'none') cv.style.display = 'block';
  resize(); setMap(B.stage);
  // 무대 땅이 무대 것이 아니거나 장면에서 빠져 있으면 무대를 새로 짓는다. 전에 땅 없이 사람만 검은 바닥 위에서 싸우는 화면이 나왔다
  if (!ground || ground.userData.map !== B.stage || ground.parent !== scene) { console.warn('[hd2d] 전투 무대 땅이 어긋나 다시 지음', ground?.userData.map?.id); curMap = null; setMap(B.stage); }
  placeCamBattle(B, dt); foreground(); syncBattle(B); light();
  if (!HOLE.uHole.value) HOLE.uHole.value = new T.Vector3(); HOLE.uHole.value.set(0, 0, 0); HOLE.uHoleZ.value = 0;
  const p = B.p || { x: B.stage.w * TS / 2, y: B.stage.h * TS / 2 };
  shadowTick(); R.setRenderTarget(post.scene); R.render(scene, cam); postFx({ m: B.stage, p });
  fpsN++; if (now - fpsT > 1000) { fpsV = Math.round(fpsN * 1000 / (now - fpsT)); fpsN = 0; fpsT = now; }
}
// 평면도 (x, y) 둘레를 화면(1280×720)으로 옮기는 행렬. flat이면 땅에 눕힌 것, 아니면 세운 것(위로 1점 = 키 1점)
function affine(x, y, flat) {
  const Y = y + 1, g = hAt(curMap, x, y), [ex, ey] = proj(x, Y, 0, g), [px, py] = proj(x + 1, Y, 0, g), [vx, vy] = flat ? proj(x, Y + 1, 0, g) : proj(x, Y, 1, g);  // 사람 판은 발끝이 y+1에 선다. 세 점의 땅 높이는 같은 값으로(단 가장자리에서 축이 기울지 않게)
  const a = px - ex, b = py - ey, c = flat ? vx - ex : ex - vx, d = flat ? vy - ey : ey - vy;
  return [a, b, c, d, ex - a * x - c * y, ey - b * x - d * y];
}

// ── 시제품 단추: 인물 키, 시각, 효과, 둘러보기 ──
function panel() {
  if ($('#hdp')) return; const d = document.createElement('div'); d.id = 'hdp';
  d.style.cssText = 'position:absolute;right:14px;bottom:12px;z-index:5;background:rgba(14,11,8,.82);border:2px solid #8a6a3a;color:#f3e6c8;font:14px Galmuri11,Galmuri14,sans-serif;padding:8px 10px;display:flex;flex-direction:column;gap:5px;pointer-events:auto';
  const row = (lab, key, items) => `<div class="hdr" data-k="${key}"><span style="display:inline-block;width:62px">${lab}</span>${items.map(([v, t]) => `<button data-v="${v}">${t}</button>`).join('')}</div>`;
  d.innerHTML = `<div style="display:flex;justify-content:space-between;gap:10px;cursor:pointer" id="hdt" title="눌러서 접기"><b style="color:#ffd88a;font-weight:400">새 화면 시제품 ▾</b><span id="hdfps" style="opacity:.7"></span></div>
    ${row('시각', 'time', [['auto', '게임대로'], ['morning', '아침'], ['day', '낮'], ['evening', '저녁'], ['night', '밤']])}${row('효과', 'fx', [['mid', '보통'], ['high', '높음']])}${row('그림', 'art', [[0, '지금 그림'], [1, '새 그림 맛보기']])}${row('전투', 'battle3d', [[1, '새 화면'], [0, '2D']])}
    <div style="display:flex;gap:6px"><button id="hdgo" title="새 낭인으로 청하진에 선다. 이 판은 저장하지 않는다">청하진 둘러보기</button><button id="hd2d">2D로 보기</button></div>`;
  $('#stage').appendChild(d);
  const st = document.createElement('style'); st.textContent = '#hdp button{font:inherit;font-size:13px;background:#2a2016;color:#f3e6c8;border:1px solid #6a5232;padding:2px 7px;margin-right:3px;cursor:pointer}#hdp button.on{background:#c89a4a;color:#1a120a;border-color:#ffd88a}'; document.head.appendChild(st);
  d.querySelectorAll('.hdr button').forEach(b => b.onclick = e => { e.stopPropagation(); const k = b.parentElement.dataset.k, v = b.dataset.v; HD.setOpt(k, k === 'zoom' || k === 'art' || k === 'battle3d' ? +v : v); b.blur(); });
  const setFold = fold => { d.dataset.fold = fold ? '1' : ''; [...d.children].slice(1).forEach(c => c.style.display = fold ? 'none' : ''); $('#hdt b').textContent = '새 화면 시제품 ' + (fold ? '▸' : '▾'); try { localStorage.setItem('gangho_hdp_open', fold ? '' : '1'); } catch (e) { /* 저장이 막혀 있으면 기억만 못 한다 */ } };
  $('#hdt').onclick = e => { e.stopPropagation(); setFold(d.dataset.fold !== '1'); };
  { let open = ''; try { open = localStorage.getItem('gangho_hdp_open') || ''; } catch (e) { /* 그대로 접힌 채 */ } if (!open) setFold(true); }  // 처음에는 접어 둔다(제목 화면 글과 놀이 화면을 가렸다). 한 번 펼치면 펼친 채로 기억한다
  $('#hdgo').onclick = e => { e.stopPropagation(); e.currentTarget.blur(); tour(); };
  $('#hd2d').onclick = e => { e.stopPropagation(); e.currentTarget.blur(); HD.off = !HD.off; e.currentTarget.textContent = HD.off ? '새 화면으로' : '2D로 보기'; HD.ready = !HD.off; if (HD.off) HD.hide(); };
  panelSync();
}
function panelSync() { const d = $('#hdp'); if (!d) return; d.querySelectorAll('.hdr').forEach(r => r.querySelectorAll('button').forEach(b => b.classList.toggle('on', String(HD.opt[r.dataset.k]) === b.dataset.v))); }
// 저장을 건드리지 않는 둘러보기: 새 낭인으로 자유 모드를 열어 청하진에 세운다. 이 판은 자동 저장하지 않는다
async function tour(to) {
  if (G.field?.busy && G.scene === 'field') return;
  G.noSave = true; G.S = newState('나그네', 'BlueSamurai', 'm', 'normal'); $('#screen').innerHTML = ''; G.bgDraw = null; G.auto = true;
  G.free.start(); for (let i = 0; i < 400 && G.field.busy; i++) await new Promise(r => setTimeout(r, 30));
  G.auto = false; G.S.flags.night = false; const m = typeof to === 'string' && G.dbg.MAPS[to], e = m && m.portals[0];  // to: 바로 설 지도(방이면 나가는 문 앞)
  if (m) G.field.load(to, e ? (e.x + e.w / 2) / TS : m.w / 2, e ? Math.max(2, e.y / TS - 1.6) : m.h / 2, 1); else G.field.load('cheongha', 22.5, 16, 0);
}
