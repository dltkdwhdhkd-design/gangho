// 새 화면(HD-2D 시제품): 필드를 WebGL로 비춘다.
// 지도 자료, 걸음, 충돌, 문, 사람 자리는 평면도 좌표 그대로 두고 그리기만 바꾼다(쿼터뷰 모드가 하던 방식).
// 평면도 (x, y) → 세상 (X = x, Y = 높이, Z = y × ZS). 카메라는 남쪽 위에서 북쪽을 PITCH만큼 내려다보고 좌우로는 돌지 않는다.
// 깊이(ZS)와 세운 판의 키(HS)를 시점만큼 늘려 둔다. 그러면 초점 거리에서는 예전 2D 화면과 같은 배치로 보이고
// 그 앞뒤로만 원근이 붙는다. 지도를 고치지 않아도 집과 사람의 앞뒤, 위아래 걸음 빠르기가 예전과 같게 보인다.
// 켜기: 주소 끝에 ?hd2d=1. 못 켜면(WebGL2 없음 등) 아무 일 없이 2D로 돈다.
import { G, IMG, TS, $ } from './core.js';
import { STAMPS } from './tiles.js';
import { newState } from './state.js';

const DEG = Math.PI / 180, PITCH = 33 * DEG, FOV = 26, ZS = 1 / Math.sin(PITCH), HS = 1 / Math.cos(PITCH);
const CHAR = 15;  // 인물 도트의 키(평면도 점). 화면 높이의 1/zoom이 되게 카메라 거리를 잡는다
const W = 1280, H = 720;
let T = null;  // three.js

const OPTK = 'gangho_hd2d_opt', OPT0 = { zoom: 8, time: 'auto', fx: 'mid', art: 0 };
const loadOpt = () => { try { return { ...OPT0, ...JSON.parse(localStorage.getItem(OPTK) || '{}') }; } catch { return { ...OPT0 }; } };
const want = (() => { try { return new URLSearchParams(location.search).get('hd2d') === '1'; } catch { return false; } })();

// 시각별 빛. sun: 해 쪽을 가리키는 방향(x 오른쪽, y 위, z 화면 앞쪽). 해가 뒤(북쪽)에서 들어 그림자가 화면 앞으로 길게 진다
const TIMES = {
  morning: { sun: [.72, .4, -.56], sunC: '#ffe2bc', sunI: 2.2, sky: '#a9c2ee', gnd: '#6a6250', hemI: 1.2, fog: '#d6dce4', tint: [.98, 1, 1.04], expo: 1.02, sat: .94, lamp: 0 },
  day: { sun: [-.42, .8, -.42], sunC: '#fff1d8', sunI: 2.7, sky: '#c4d6f2', gnd: '#7a6648', hemI: 1.25, fog: '#cdd3c8', tint: [1.02, 1, .96], expo: 1, sat: 1.04, lamp: 0 },
  evening: { sun: [-.82, .26, -.5], sunC: '#ffb26e', sunI: 2.6, sky: '#a690bc', gnd: '#5e4436', hemI: 1.15, fog: '#d3a07e', tint: [1.12, .97, .84], expo: 1.02, sat: 1.12, lamp: .3 },
  night: { sun: [-.35, .8, -.48], sunC: '#9fb4ff', sunI: .75, sky: '#3a4c8c', gnd: '#141a30', hemI: .45, fog: '#18204a', tint: [.8, .9, 1.2], expo: 1, sat: .9, lamp: 1 },
};

export const HD = {
  want, ready: false, failed: false, opt: loadOpt(),
  maps: new Set(['cheongha']),  // 시제품은 청하진만. 나머지 지도는 예전 2D로 그린다
  active(m) { return this.want && this.ready && !this.failed && !!m && this.maps.has(m.id) && !m.isoRoom && !m.live; },
  setOpt(k, v) { this.opt[k] = v; try { localStorage.setItem(OPTK, JSON.stringify(this.opt)); } catch { } if (k === 'fx') { slow = 0; resize(true); } if (k === 'art') loadPreview().then(() => { curMap = null; }); panelSync(); },
  hide() { if (cv && cv.style.display !== 'none') cv.style.display = 'none'; },
  init, render, proj, pxPerUnit: () => H / (CHAR * HD.opt.zoom),
  aim(F) { setMap(F.m); camT.set(-1, 0, 0); placeCam(F, 0); fades(F); },  // 시험용: 그리지 않고 카메라만 주인공에게 바로 맞춘다
  stats: () => ({ props: propG?.children.length || 0, faded: propG ? propG.children.filter(o => o.material === o.userData.M.f).length : 0, buildMs, fps: fpsV, low: !!HD.low, size: R ? [R.domElement.width, R.domElement.height] : null }),
};
G.hd = HD;

let R, cv, scene, cam, sun, hemi, ground, skirt, propG, actG, lamps = [], post, curMap = null;
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
    R.shadowMap.enabled = true; R.shadowMap.type = T.PCFShadowMap;
    scene = new T.Scene();
    cam = new T.PerspectiveCamera(FOV, W / H, 20, 6000);
    hemi = new T.HemisphereLight('#c4d6f2', '#7a6648', 1.2); scene.add(hemi);
    sun = new T.DirectionalLight('#fff1d8', 2.6); sun.castShadow = true; scene.add(sun, sun.target);
    sun.shadow.bias = -.0006; sun.shadow.normalBias = .4;
    for (let i = 0; i < 6; i++) { const l = new T.PointLight('#ffae5e', 0, 110, 1.6); scene.add(l); lamps.push(l); }  // 등불은 늘 여섯 개를 두고 세기만 바꾼다(개수가 바뀌면 셰이더를 다시 짠다)
    { // 등불 둘레의 빛무리: 저녁과 밤에 등불 자리마다 더해 그린다. 번짐(후처리)이 이것을 한 번 더 퍼뜨린다
      const c = mk(64, 64), x = c.getContext('2d'), g = x.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, 'rgba(255,214,150,1)'); g.addColorStop(.18, 'rgba(255,170,90,.55)'); g.addColorStop(.5, 'rgba(255,130,60,.12)'); g.addColorStop(1, 'rgba(255,120,50,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64);
      const t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace;
      for (const l of lamps) { const h = new T.Sprite(new T.SpriteMaterial({ map: t, blending: T.AdditiveBlending, depthWrite: false, transparent: true, fog: false })); h.scale.set(34, 34, 1); h.visible = false; scene.add(h); l.userData.halo = h; } }
    propG = new T.Group(); actG = new T.Group(); scene.add(propG, actG);
    scene.fog = new T.Fog('#cdd3c8', 600, 2400);
    post = makePost();
    resize(true);
    if (HD.opt.art) await loadPreview();
    HD.ready = true; panel();
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
const PV = {}, PVN = ['hut_o', 'hut_b', 'hut_o2', 'straw', 'mud', 'clay', 'me'];
let pvP = null;
function loadPreview() { return pvP || (pvP = Promise.all(PVN.map(n => new Promise(res => { const im = new Image(); im.onload = () => { PV[n] = im; res(); }; im.onerror = res; im.src = `assets/hd2d/preview/${n}.webp`; })))); }
const art = () => !!HD.opt.art;
function previewTex(name) {
  const im = art() && PV[name]; if (!im) return null; if (TEX.has('p/' + name)) return TEX.get('p/' + name);
  const c = mk(im.width, im.height); c.getContext('2d').drawImage(im, 0, 0); const t = texFrom(c, { mips: name !== 'me' }); TEX.set('p/' + name, t); return t;
}
// 소품: 도트 그대로 올려 '또렷한 겹선형'으로 읽는다(배경도 인물과 같은 도트 결. 매끈해지는 것은 흐림과 빛뿐)
function stampTex(name) {
  const pv = previewTex(name); if (pv) return pv;
  if (TEX.has('s/' + name)) return TEX.get('s/' + name);
  const st = STAMPS[name], hd = IMG['stamp/' + name], src = hd || (st && IMG['tiles/' + st[0]]); if (!src) return null;
  const sw = hd ? hd.width : st[3], sh = hd ? hd.height : st[4], sx = hd ? 0 : st[1], sy = hd ? 0 : st[2];
  const c = mk(sw, sh), x = c.getContext('2d'); x.drawImage(src, sx, sy, sw, sh, 0, 0, sw, sh);
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
const sharpen = m => { m.onBeforeCompile = s => { s.fragmentShader = s.fragmentShader.replace('#include <map_fragment>', SHARP); }; m.customProgramCacheKey = () => 'sharp'; return m; };
function matOf(t) {  // 그림마다 재질 하나. 해와 등불을 받고, 그림자를 받는다
  if (MATS.has(t)) return MATS.get(t);
  const m = sharpen(new T.MeshLambertMaterial({ map: t, alphaTest: .5 }));
  const f = sharpen(new T.MeshLambertMaterial({ map: t, alphaTest: .2, transparent: true, opacity: .42, depthWrite: false }));  // 주인공이 뒤로 들어가면 옅게. 알파 시험은 옅게 한 뒤 값에 걸리니 낮춰 둔다
  const d = new T.MeshDepthMaterial({ depthPacking: T.RGBADepthPacking, map: t, alphaTest: .5 });
  const r = { m, f, d }; MATS.set(t, r); return r;
}
// 땅에 수직으로 선 판. 밑변 가운데가 원점, 키는 HS만큼 늘린다. 빛은 위에서 받는 것처럼(법선이 위) 땅과 같은 밝기로 보인다
function standGeo(w, h) {
  const g = new T.PlaneGeometry(w, h * HS); g.translate(0, h * HS / 2, 0);
  const n = g.attributes.normal; for (let i = 0; i < n.count; i++) n.setXYZ(i, 0, 1, 0); return g;
}

// ── 지도 ──
let buildMs = 0;
function setMap(m) {
  if (curMap === m) return; curMap = m; const t0 = performance.now();
  for (const o of [...propG.children]) { propG.remove(o); o.geometry.dispose(); }
  if (ground) { scene.remove(ground); ground.geometry.dispose(); ground.material.map.dispose(); ground.material.dispose(); ground = null; }
  const Wm = m.w * TS, Dm = m.h * TS * ZS;
  // 땅: 지금 땅 그림을 그대로 눕힌다(땅 무늬 HB14가 오기 전 임시). 땅도 도트 결로 읽는다
  const gc = mk(m.w * TS, m.h * TS), gx = gc.getContext('2d', { willReadFrequently: true }); m.paintBase(gx);
  const gt = new T.CanvasTexture(gc); gt.colorSpace = T.SRGBColorSpace; gt.anisotropy = R.capabilities.getMaxAnisotropy(); gt.minFilter = T.LinearMipmapLinearFilter;
  ground = new T.Mesh(new T.PlaneGeometry(Wm, Dm), sharpen(new T.MeshLambertMaterial({ map: gt }))); ground.rotation.x = -Math.PI / 2; ground.position.set(Wm / 2, 0, Dm / 2); ground.receiveShadow = true; scene.add(ground);
  // 지도 밖: 가장자리 땅빛으로 넓게 깔아 빈 곳이 안 보이게
  const ed = gx.getImageData(0, 0, gc.width, 8).data; let r = 0, g = 0, b = 0, n = 0; for (let i = 0; i < ed.length; i += 16) { r += ed[i]; g += ed[i + 1]; b += ed[i + 2]; n++; }
  if (!skirt) { skirt = new T.Mesh(new T.PlaneGeometry(1, 1), new T.MeshLambertMaterial()); skirt.rotation.x = -Math.PI / 2; skirt.receiveShadow = true; scene.add(skirt); }
  skirt.material.color.setRGB(r / n / 255, g / n / 255, b / n / 255, T.SRGBColorSpace).multiplyScalar(.82); skirt.scale.set(Wm + 4000, Dm + 4000, 1); skirt.position.set(Wm / 2, -.6, Dm / 2);
  // 소품: 2D가 그리던 순서(발 높이 순)를 깊이로 옮긴다. 같은 높이면 나중 것이 아주 조금 앞
  const list = m.stamps.map((s, i) => ({ s, i, z: s.flat ? s.y + TS : s.base })).sort((a, b) => a.z - b.z || a.i - b.i), GEO = new Map();
  list.forEach(({ s, z }, k) => {
    const st = STAMPS[s.name], t = st && stampTex(s.name); if (!t) return; const sc = s.sc || 1, w = st[3] * sc, h = previewTex(s.name) ? w * t.image.height / t.image.width : st[4] * sc, gk = w + 'x' + h;
    if (!GEO.has(gk)) GEO.set(gk, standGeo(w, h));
    const M = matOf(t), o = new T.Mesh(GEO.get(gk), M.m); o.customDepthMaterial = M.d; o.position.set(s.x + w / 2, 0, z * ZS + k * .003);
    o.castShadow = !s.flat; o.receiveShadow = true; o.userData = { s, w, h, M, t }; propG.add(o);
  });
  // 등불 자리: 문 위, 등롱, 객잔 기
  m._lamps = [...m.portals.filter(q => q.door).map(q => [q.x + q.w / 2, q.y - 2, 26]), ...m.stamps.filter(s => /lantern|banner|censer/.test(s.name)).map(s => [s.x + 8, s.base + 2, 22])];
  camT.set(-1, 0, 0);  // 다음 장면에서 카메라를 바로 주인공에게
  buildMs = Math.round(performance.now() - t0);
}

// ── 인물 ──
const pool = []; let used = 0;
function actor(t, sx, sy, sw, sh, flip, x, y, size, lift = 0) {
  let o = pool[used];
  if (!o) { const g = new T.PlaneGeometry(1, 1); g.translate(0, .5, 0); const n = g.attributes.normal; for (let i = 0; i < 4; i++) n.setXYZ(i, 0, 1, 0); o = new T.Mesh(g); o.castShadow = true; o.receiveShadow = true; pool.push(o); actG.add(o); }
  used++; const M = matOf(t); o.material = M.m; o.customDepthMaterial = M.d; o.visible = true;
  const iw = t.image.width, ih = t.image.height, u0 = sx / iw, u1 = (sx + sw) / iw, v1 = 1 - sy / ih, v0 = 1 - (sy + sh) / ih, uv = o.geometry.attributes.uv;
  const a = flip ? u1 : u0, b = flip ? u0 : u1; uv.setXY(0, a, v1); uv.setXY(1, b, v1); uv.setXY(2, a, v0); uv.setXY(3, b, v0); uv.needsUpdate = true;
  o.scale.set(size, size * HS, 1); o.position.set(x, lift * HS, (y + 1) * ZS + .5);  // 2D는 발끝을 y+1에 그렸다. 같은 줄의 소품보다 반 점 앞
  return o;
}
let blobT = null; const blobs = []; let usedB = 0;
function blob(x, y, s) {
  if (!blobT) { const im = IMG['chars/_Shadow']; if (!im) return; blobT = new T.Texture(im); blobT.colorSpace = T.SRGBColorSpace; blobT.needsUpdate = true; }
  let o = blobs[usedB];
  if (!o) { o = new T.Mesh(new T.PlaneGeometry(1, 1), new T.MeshBasicMaterial({ map: blobT, transparent: true, depthWrite: false, opacity: .5 })); o.rotation.x = -Math.PI / 2; o.renderOrder = 1; blobs.push(o); actG.add(o); }
  usedB++; o.visible = true; o.scale.set(12 * s, 7 * s * ZS, 1); o.position.set(x, .15, (y + .5) * ZS);
}
// drawActorSprite와 같은 칸을 고른다
function frameOf(key, dirCol, row, diag) {
  const img = IMG[key]; if (!img) return null; const dg = diag !== undefined && IMG[key + '_d'];
  if (dg) { const k = 16 * (dg.hd || 1); return { t: sheetTex(key + '_d'), sx: (diag % 2) * k, sy: Math.min(row, 3) * k, s: k, flip: diag > 1 }; }
  const f = 16 * (img.hd || 1), r = Math.min(row, Math.floor(img.height / f) - 1); return { t: sheetTex(key), sx: dirCol * f, sy: r * f, s: f, flip: false };
}
function syncActors(F) {
  used = 0; usedB = 0; const p = F.p, S = G.S, put = (key, dir, row, x, y, o = {}) => { const fr = frameOf(key, dir, row, o.diag); if (!fr || !fr.t) return; actor(fr.t, fr.sx, fr.sy, fr.s, fr.s, fr.flip, x, y, o.size || 16, o.lift || 0); blob(x, y, o.size ? o.size / 16 : 1); };
  for (const n of F.npcs) { if (n.hide > 0) continue; if (n.stamp) { const t = stampTex(n.stamp); if (t) actor(t, 0, 0, t.image.width, t.image.height, false, n.x, n.y, 16); continue; }
    const key = n.spr.includes('/') ? n.spr : 'chars/' + n.spr; put(key, n.dir, n.pose ?? Math.floor(n.walk || 0) % 4, n.x, n.y, { diag: n.walk ? n.diag : undefined, size: n.size, lift: n.hopT > 0 ? Math.sin(n.hopT / .4 * Math.PI) * 2.5 : 0 }); }
  for (const r of F.roam) if (!r.gone) { const key = r.spr.includes('/') ? r.spr : 'chars/' + r.spr; put(key, r.dir, Math.floor(r.walk || 0) % 4, r.x, r.y, { size: r.size }); }
  if (G.party && F.m.id !== 'world0') G.party.members().forEach((id, i) => { if (F.npcs.some(n => n.id === id)) return; const q = F.trail[Math.min(F.trail.length - 1, 16 + i * 16)]; if (!q) return; const s = G.party.spr(id), key = s.includes('/') ? s : 'chars/' + s; put(key, q.dir, Math.floor(p.walk) % 4, q.x, q.y, { diag: p.walk ? q.diag : undefined }); });
  for (const a of F.animals || []) { if (a.gone) continue; const im = IMG[a.spr]; if (!im) continue; const t = sheetTex(a.spr); actor(t, (Math.floor(a.walk) % 2) * 16, 0, 16, 16, a.vx < 0, a.x, a.y - 1, 16); blob(a.x, a.y, .8); }
  const me = previewTex('me');  // 맛보기: 칸 56점, 사람 키 48점 → 사람 키가 CHAR가 되게 판을 키운다
  if (F.hideMe) { } else if (me) { actor(me, p.dir * 56, (Math.floor(p.walk) % 4) * 56, 56, 56, false, p.x, p.y, CHAR * 56 / 48); blob(p.x, p.y, 1); }
  else put('chars/' + S.look, p.dir, Math.floor(p.walk) % 4, p.x, p.y, { diag: p.walk ? p.diag : undefined });
  for (let i = used; i < pool.length; i++) pool[i].visible = false; for (let i = usedB; i < blobs.length; i++) blobs[i].visible = false;
}

// ── 카메라 ──
const camT = new (class { constructor() { this.x = -1; this.y = 0; this.z = 0; } set(x, y, z) { this.x = x; this.y = y; this.z = z; } })();
let dist = 300, lastT = 0;
function placeCam(F, dt) {
  const m = F.m, p = F.p, Wm = m.w * TS, Dm = m.h * TS * ZS, vh = CHAR * HD.opt.zoom; dist = vh / (2 * Math.tan(FOV / 2 * DEG));
  const ty = 8 * HS, hc = ty + dist * Math.sin(PITCH), back = dist * Math.cos(PITCH), f = FOV / 2 * DEG, hw = dist * Math.tan(f) * W / H;
  // 화면 위 끝과 아래 끝이 닿는 땅이 지도 밖으로 너무 나가지 않게 겨냥점을 묶는다(2D 카메라가 지도 안에 머물던 것과 같다)
  const up = hc / Math.tan(PITCH - f) - back, dn = hc / Math.tan(PITCH + f) - back, zMin = -10 * ZS, zMax = Dm + 6 * ZS;
  let tx = p.x, tz = p.y * ZS; const lo = zMin + up, hi = zMax + dn;
  tz = lo > hi ? (lo + hi) / 2 : Math.min(hi, Math.max(lo, tz)); tx = Wm < hw * 2 ? Wm / 2 : Math.min(Wm - hw, Math.max(hw, tx));
  if (camT.x < 0) camT.set(tx, ty, tz); else { const k = 1 - Math.exp(-dt * 7); camT.set(camT.x + (tx - camT.x) * k, ty, camT.z + (tz - camT.z) * k); }
  cam.position.set(camT.x, camT.y + dist * Math.sin(PITCH), camT.z + back); cam.lookAt(camT.x, camT.y, camT.z); cam.updateMatrixWorld();
  // 그림자 상자는 보이는 땅을 덮을 만큼
  const L = TIMES[timeOf()], d = new T.Vector3(...L.sun).normalize(); sun.target.position.set(camT.x, 0, camT.z - dist * .35); sun.position.copy(sun.target.position).addScaledVector(d, 900);
  const sc = sun.shadow.camera, half = Math.max(hw * 1.9, dist * 1.2); sc.left = -half; sc.right = half; sc.top = half; sc.bottom = -half; sc.near = 100; sc.far = 2200; sc.updateProjectionMatrix();
}
const V = () => new T.Vector3();
// 평면도 (x, y)에서 높이 h인 곳 → 1280×720 화면 자리
function proj(x, y, h = 0) { const v = V().set(x, h * HS, y * ZS).project(cam); return [(v.x + 1) / 2 * W, (1 - v.y) / 2 * H, v.z]; }

// ── 가림: 주인공 몸을 카메라에서 본 줄이 앞의 그림의 칠해진 곳을 지나면 그 그림을 옅게(occl.js와 같은 판단) ──
const BODY = [[0, 13], [0, 9], [0, 6], [-3, 3], [3, 3]];
const alphaAt = (t, u, v) => { const { width: w, height: h, data } = t.image; return data[(Math.min(h - 1, v * h | 0) * w + Math.min(w - 1, u * w | 0)) * 4 + 3] > 127; };  // v는 아래가 0
function fades(F) {
  const p = F.p, C = cam.position, pz = (p.y + 1) * ZS;
  for (const o of propG.children) {
    const { s, w, h, M, t: tx } = o.userData; let hit = false;
    if (!s.flat && s.base > p.y && s.x < p.x + 6 && s.x + w > p.x - 6) for (const [dx, dh] of BODY) {
      const bx = p.x + dx, by = dh * HS, t = (o.position.z - C.z) / (pz - C.z); if (t <= 0 || t >= 1) continue;
      const hx = C.x + (bx - C.x) * t, hy = C.y + (by - C.y) * t, lx = hx - s.x, lh = hy / HS; if (lx < 0 || lx >= w || lh < 0 || lh >= h) continue;
      if (alphaAt(tx, lx / w, lh / h)) { hit = true; break; }
    }
    o.material = hit ? M.f : M.m; o.castShadow = !s.flat;
  }
}

// ── 빛 ──
const timeOf = () => HD.opt.time === 'auto' ? (G.S?.flags?.night ? 'night' : 'day') : HD.opt.time;
function light() {
  const L = TIMES[timeOf()];
  sun.color.set(L.sunC); sun.intensity = L.sunI; hemi.color.set(L.sky); hemi.groundColor.set(L.gnd); hemi.intensity = L.hemI;
  scene.fog.color.set(L.fog); scene.background = scene.fog.color; scene.fog.near = dist * 1.25; scene.fog.far = dist * 5.5;
  const sz = HD.opt.fx === 'high' ? 2048 : HD.low ? 512 : 1024; if (sun.shadow.mapSize.x !== sz) { sun.shadow.mapSize.set(sz, sz); sun.shadow.map?.dispose(); sun.shadow.map = null; }
  const ls = (curMap._lamps || []).map(q => [q, (q[0] - camT.x) ** 2 + (q[1] * ZS - camT.z) ** 2]).sort((a, b) => a[1] - b[1]);
  lamps.forEach((l, i) => { const q = ls[i]?.[0], h = l.userData.halo; if (!q || !L.lamp) { l.intensity = 0; h.visible = false; return; } const fl = 1 + Math.sin(performance.now() / 260 + i * 1.7) * .05;
    l.intensity = 900 * L.lamp * fl; l.position.set(q[0], q[2] * HS, q[1] * ZS + 4); h.visible = true; h.position.set(q[0], q[2] * HS, q[1] * ZS + 6); h.material.opacity = L.lamp * .9 * fl; });
  for (const b of blobs) b.material.opacity = L.lamp ? .55 : .35;
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
    uniform sampler2D tS, tD, tB1, tB2; uniform float cn, cf, focus, f0, f1, n0, n1, dof, expo, sat, bk, bt, vig; uniform vec3 tint; varying vec2 vUv;
    vec3 srgb(vec3 c){ return mix(c * 12.92, 1.055 * pow(c, vec3(1. / 2.4)) - .055, step(.0031308, c)); }
    void main(){
      vec3 s = texture2D(tS, vUv).rgb, b1 = texture2D(tB1, vUv).rgb, b2 = texture2D(tB2, vUv).rgb;
      float z = -perspectiveDepthToViewZ(texture2D(tD, vUv).x, cn, cf), d = z - focus;
      float c = dof * (d > 0. ? smoothstep(f0, f1, d) : smoothstep(n0, n1, -d));
      vec3 col = mix(s, b1, smoothstep(0., .45, c)); col = mix(col, b2, smoothstep(.45, 1., c));
      col += (max(b2 - bt, 0.) + .5 * max(b1 - bt * 1.15, 0.)) * bk;
      col *= tint * expo; float l = dot(col, vec3(.2126, .7152, .0722)); col = mix(vec3(l), col, sat);
      vec2 qv = (vUv - .5) * vec2(1.3, 1.); col *= 1. - vig * smoothstep(.3, .85, length(qv));
      gl_FragColor = vec4(srgb(max(col, 0.)), 1.); }`,
    { tS: { value: null }, tD: { value: null }, tB1: { value: null }, tB2: { value: null }, cn: { value: 20 }, cf: { value: 6000 }, focus: { value: 300 }, f0: { value: 0 }, f1: { value: 1 }, n0: { value: 0 }, n1: { value: 1 }, dof: { value: 1 }, expo: { value: 1 }, sat: { value: 1 }, bk: { value: .6 }, bt: { value: .8 }, vig: { value: .3 }, tint: { value: new T.Vector3(1, 1, 1) } });
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
  const s = Math.min(innerWidth / W, innerHeight / H), dpr = window.devicePixelRatio || 1, cap = HD.opt.fx === 'high' ? 2560 : 1600;
  const bw = Math.round(Math.min(cap, Math.max(W, W * s * dpr)) * (HD.low ? .75 : 1)), bh = Math.round(bw * H / W);
  if (!force && R.domElement.width === bw) return; R.setSize(bw, bh, false); post.size(bw, bh);
}
function postFx(F) {
  const P = post, L = TIMES[timeOf()], u = P.fin.uniforms;
  P.down.uniforms.src.value = P.scene.texture; P.down.uniforms.px.value.set(1 / P.w, 1 / P.h); P.pass(P.down, P.a1);
  const bl = (a, b, w, h, k) => { P.blur.uniforms.src.value = a.texture; P.blur.uniforms.dir.value.set(k / w, 0); P.pass(P.blur, b); P.blur.uniforms.src.value = b.texture; P.blur.uniforms.dir.value.set(0, k / h); P.pass(P.blur, a); };
  bl(P.a1, P.b1, P.a1.width, P.a1.height, 1);
  P.down.uniforms.src.value = P.a1.texture; P.down.uniforms.px.value.set(1 / P.a1.width, 1 / P.a1.height); P.pass(P.down, P.a2);
  bl(P.a2, P.b2, P.a2.width, P.a2.height, 1.6); bl(P.a2, P.b2, P.a2.width, P.a2.height, 2.4);
  // 초점은 주인공 가슴 깊이. 뒤로는 천천히, 앞으로는 조금 빨리 흐려진다
  const fp = V().set(F.p.x, 8 * HS, (F.p.y + 1) * ZS).applyMatrix4(cam.matrixWorldInverse);
  Object.assign(u.tS, { value: P.scene.texture }); u.tD.value = P.scene.depthTexture; u.tB1.value = P.a1.texture; u.tB2.value = P.a2.texture;
  u.cn.value = cam.near; u.cf.value = cam.far; u.focus.value = -fp.z; u.f0.value = dist * .26; u.f1.value = dist * 1.25; u.n0.value = dist * .2; u.n1.value = dist * .75;
  u.tint.value.set(...L.tint); u.expo.value = L.expo; u.sat.value = L.sat; u.bk.value = HD.opt.fx === 'high' ? .75 : .55; u.bt.value = timeOf() === 'night' ? .55 : .82; u.vig.value = .32;
  P.pass(P.fin, null);
}

// ── 한 장면 ──
let fpsT = 0, fpsN = 0, fpsV = 0, slow = 0;
// 느리면 스스로 낮춘다: 높음 → 보통 → 보통(해상도 4분의 3, 그림자 작게). 3초 넘게 초당 45장이 안 되면 한 단계
function govern() {
  if (fpsV >= 45 || document.hidden) { slow = 0; return; } if (++slow < 3) return; slow = 0;
  if (HD.opt.fx === 'high') { HD.opt.fx = 'mid'; resize(true); panelSync(); } else if (!HD.low) { HD.low = true; resize(true); }
}
function render(F) {
  const now = performance.now(), dt = Math.min(.1, lastT ? (now - lastT) / 1000 : .016); lastT = now;
  if (cv.style.display === 'none') cv.style.display = 'block';
  resize(); setMap(F.m); placeCam(F, dt); syncActors(F); fades(F); light();
  R.setRenderTarget(post.scene); R.render(scene, cam); postFx(F);
  fpsN++; if (now - fpsT > 1000) { fpsV = Math.round(fpsN * 1000 / (now - fpsT)); fpsN = 0; fpsT = now; const e = $('#hdfps'); if (e) e.textContent = fpsV + '장/초' + (HD.low ? ' (낮춤)' : ''); if (!G.auto && !HD.noGov) govern(); }
}

// ── 시제품 단추: 인물 키, 시각, 효과, 둘러보기 ──
function panel() {
  if ($('#hdp')) return; const d = document.createElement('div'); d.id = 'hdp';
  d.style.cssText = 'position:absolute;right:14px;bottom:12px;z-index:5;background:rgba(14,11,8,.82);border:2px solid #8a6a3a;color:#f3e6c8;font:14px Galmuri11,Galmuri14,sans-serif;padding:8px 10px;display:flex;flex-direction:column;gap:5px;pointer-events:auto';
  const row = (lab, key, items) => `<div class="hdr" data-k="${key}"><span style="display:inline-block;width:62px">${lab}</span>${items.map(([v, t]) => `<button data-v="${v}">${t}</button>`).join('')}</div>`;
  d.innerHTML = `<div style="display:flex;justify-content:space-between;gap:10px;cursor:pointer" id="hdt" title="눌러서 접기"><b style="color:#ffd88a;font-weight:400">새 화면 시제품 ▾</b><span id="hdfps" style="opacity:.7"></span></div>
    ${row('인물 키', 'zoom', [[10, '1/10'], [8, '1/8'], [6, '1/6']])}${row('시각', 'time', [['auto', '게임대로'], ['morning', '아침'], ['day', '낮'], ['evening', '저녁'], ['night', '밤']])}${row('효과', 'fx', [['mid', '보통'], ['high', '높음']])}${row('그림', 'art', [[0, '지금 그림'], [1, '새 그림 맛보기']])}
    <div style="display:flex;gap:6px"><button id="hdgo" title="새 낭인으로 청하진에 선다. 이 판은 저장하지 않는다">청하진 둘러보기</button><button id="hd2d">2D로 보기</button></div>`;
  $('#stage').appendChild(d);
  const st = document.createElement('style'); st.textContent = '#hdp button{font:inherit;font-size:13px;background:#2a2016;color:#f3e6c8;border:1px solid #6a5232;padding:2px 7px;margin-right:3px;cursor:pointer}#hdp button.on{background:#c89a4a;color:#1a120a;border-color:#ffd88a}'; document.head.appendChild(st);
  d.querySelectorAll('.hdr button').forEach(b => b.onclick = e => { e.stopPropagation(); const k = b.parentElement.dataset.k, v = b.dataset.v; HD.setOpt(k, k === 'zoom' || k === 'art' ? +v : v); b.blur(); });
  $('#hdt').onclick = e => { e.stopPropagation(); const fold = d.dataset.fold !== '1'; d.dataset.fold = fold ? '1' : ''; [...d.children].slice(1).forEach(c => c.style.display = fold ? 'none' : ''); $('#hdt b').textContent = '새 화면 시제품 ' + (fold ? '▸' : '▾'); };
  $('#hdgo').onclick = e => { e.stopPropagation(); e.currentTarget.blur(); tour(); };
  $('#hd2d').onclick = e => { e.stopPropagation(); e.currentTarget.blur(); HD.off = !HD.off; e.currentTarget.textContent = HD.off ? '새 화면으로' : '2D로 보기'; HD.ready = !HD.off; if (HD.off) HD.hide(); };
  panelSync();
}
function panelSync() { const d = $('#hdp'); if (!d) return; d.querySelectorAll('.hdr').forEach(r => r.querySelectorAll('button').forEach(b => b.classList.toggle('on', String(HD.opt[r.dataset.k]) === b.dataset.v))); }
// 저장을 건드리지 않는 둘러보기: 새 낭인으로 자유 모드를 열어 청하진에 세운다. 이 판은 자동 저장하지 않는다
async function tour() {
  if (G.field?.busy && G.scene === 'field') return;
  G.noSave = true; G.S = newState('나그네', 'BlueSamurai', 'm', 'normal'); $('#screen').innerHTML = ''; G.bgDraw = null; G.auto = true;
  G.free.start(); for (let i = 0; i < 400 && G.field.busy; i++) await new Promise(r => setTimeout(r, 30));
  G.auto = false; G.S.flags.night = false; G.field.load('cheongha', 22.5, 16, 0);
}
