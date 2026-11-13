// 새 화면(HD-2D 시제품): 필드를 WebGL로 비춘다.
// 지도 자료, 걸음, 충돌, 문, 사람 자리는 평면도 좌표 그대로 두고 그리기만 바꾼다(쿼터뷰 모드가 하던 방식).
// 평면도 (x, y) → 세상 (X = x, Y = 높이, Z = y × ZS). 카메라는 남쪽 위에서 북쪽을 PITCH만큼 내려다보고 좌우로는 돌지 않는다.
// 집은 막힘 상자(바닥 넓이)를 밑면으로 한 덩어리(벽 네 면, 박공지붕)로 세우고, 나무와 소품과 사람은 선 판으로 세운다.
// 깊이(ZS)와 세운 판의 키(HS)를 시점만큼 늘려 둔다. 그러면 초점 거리에서는 예전 2D 화면과 같은 배치로 보이고
// 그 앞뒤로만 원근이 붙는다. 지도를 고치지 않아도 집과 사람의 앞뒤, 위아래 걸음 빠르기가 예전과 같게 보인다.
// 켜기: 주소 끝에 ?hd2d=1. 못 켜면(WebGL2 없음 등) 아무 일 없이 2D로 돈다.
import { G, IMG, TS, $ } from './core.js';
import { STAMPS } from './tiles.js';
import { newState } from './state.js';
import { makeBuilder, SPEC, GRAND } from './hd2d/build.js';

const DEG = Math.PI / 180, PITCH = 35 * DEG, FOV = 34, ZS = .857 / Math.sin(PITCH) /* 원근 때문에 주인공 발밑에서 세로 걸음이 가로보다 1.17배 빨라 보이던 것을 맞춘다(평면도 1점이 화면에서 가로와 세로 같은 길이) */, HS = 1 / Math.cos(PITCH);
const CHAR = 15, AHEAD = .04;  // 인물 도트의 키(평면도 점). 화면 높이의 1/zoom이 되게 카메라 거리를 잡는다
const W = 1280, H = 720;
let T = null;  // three.js

// 인물 키는 화면 높이의 1/9로 정했다(사용자). 그림은 새 그림이 기본
const OPTK = 'gangho_hd2d_opt2', OPT0 = { zoom: 9, time: 'auto', fx: 'mid', art: 1 };
const loadOpt = () => { let o; try { o = { ...OPT0, ...JSON.parse(localStorage.getItem(OPTK) || '{}') }; } catch { o = { ...OPT0 }; } o.zoom = 9; return o; };
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
  active(m) { return this.want && this.ready && !this.failed && !!m && (this.maps.has(m.id) || (!m.room && !m.hasIso)) && !m.isoRoom && !m.live; },  // 바깥 지도는 모두(방과 쿼터뷰 지도, 강호 큰 지도는 예전 화면)
  setOpt(k, v) { this.opt[k] = v; try { localStorage.setItem(OPTK, JSON.stringify(this.opt)); } catch { } if (k === 'fx') { slow = 0; resize(true); } if (k === 'art') loadPreview().then(() => { curMap = null; }); panelSync(); },
  hide() { if (cv && cv.style.display !== 'none') cv.style.display = 'none'; },
  init, render, proj, pxPerUnit: () => H / (CHAR * HD.opt.zoom),
  aim(F) { setMap(F.m); camT.set(-1, 0, 0); placeCam(F, 0); fades(F); },  // 시험용: 그리지 않고 카메라만 주인공에게 바로 맞춘다
  dbg: () => ({ fg: FG.map(o => [o.visible, o.position.toArray().map(Math.round), o.scale.toArray().map(Math.round), o.material.type, o.material.map?.image?.width, (() => { const c = o.material.map?.image; if (!c?.getContext) return -1; const d = c.getContext("2d").getImageData(0, 0, c.width, c.height).data; let a = 0; for (let i = 3; i < d.length; i += 4) a += d[i]; return Math.round(a / (d.length / 4)); })()]), cam: cam.position.toArray().map(Math.round), far: cam.far, m: mtns?.children.map(o => [o.position.toArray().map(Math.round), o.visible, o.material.color.getHexString()]) }),
  stats: () => ({ props: propG?.children.length || 0, faded: propG ? propG.children.filter(o => o.userData.faded || o.userData.cutOn).length : 0, boxes: propG ? propG.children.filter(o => o.isGroup).length : 0, buildMs, fps: fpsV, low: !!HD.low, size: R ? [R.domElement.width, R.domElement.height] : null }),
};
G.hd = HD;

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
// 새 인물 그림(Higgsfield HN*, 게임 시트 꼴 56점 칸)이 있는 사람 종류
const NEWNPC = { 'chars/Villager': 'n_villager', 'chars/Woman': 'n_woman', 'chars/OldMan': 'n_oldman', 'chars/OldWoman': 'n_oldwoman', 'chars/Monk': 'n_monk', 'chars/Gisaeng': 'n_gisaeng1', 'chars/Gisaeng2': 'n_gisaeng2', 'chars/Gisaeng3': 'n_gisaeng3', 'chars/Pimp': 'n_pimp' };  // 기루 사람들은 Higgsfield 시트(HN14~17)가 들어오면 바뀐다. 없으면 예전 도트
const PV = {}, PVN = ['n_villager', 'n_woman', 'n_oldman', 'n_oldwoman', 'n_monk', 'n_gisaeng1', 'n_gisaeng2', 'n_gisaeng3', 'n_pimp', 'hut_o', 'hut_b', 'hut_o2', 'straw', 'mud', 'clay', 'me', 'yun', 'w_front', 'w_side', 'g_grass', 'g_road', 'g_yard', 'g_cobble', 'g_sand', 'g_snow', 'r_orange', 'r_dark', 'r_thatch', 'r_plank', 'r_mud', 'r_snow', 'e_orange', 'e_dark', 'e_thatch', 'e_plank', 'e_ridge', 'e_bracket', 'w1_front', 'w2_front', 'w3_front', 'w1_side', 'w2_side', 'w3_side', 'w4_front', 'w5_front', 'w6_front', 'w4_side', 'w5_side', 'w6_side', 'k_fence', 'k_palisade', 'k_stone'];
const DOT = 48 / 15;  // 도트 밀도: 평면도 한 점에 도트 3.2점(새 인물 그림 기준). 새 땅과 지붕과 벽도 이 굵기로 깐다
const SIDE_RECT = .314;  // HW0 옆벽 그림에서 네모 벽이 시작하는 높이(위에서부터). 그 위는 세모 박공
let pvP = null;
// 블렌더로 지은 모형(tools/blender/hall.py → assets/hd2d/models/*.glb). 길이는 평면도 점이라 세울 때 (1, HS, ZS)로 늘린다
const MODELS = {}, MODELN = ['daewoong'], MODELM = new Map(), MODELP = {};  // MODELM: 그물(geometry) → 재질 셋. clone은 userData를 JSON으로 베껴 재질이 깨지므로 따로 둔다
let GLL = null;
async function loadModel(n) { try { if (!GLL) { const [{ GLTFLoader }, { MeshoptDecoder }] = await Promise.all([import('./lib/three/addons/GLTFLoader.js'), import('./lib/three/addons/meshopt_decoder.module.js')]); GLL = new GLTFLoader(); GLL.setMeshoptDecoder(MeshoptDecoder); } const g = await GLL.loadAsync(`assets/hd2d/models/${n}.glb`);
  g.scene.traverse(o => { if (!o.isMesh) return; const sm = o.material, t = sm.map, nm = sm.name || o.name;
    if (t) { t.magFilter = T.LinearFilter; t.minFilter = T.LinearMipmapLinearFilter; t.generateMipmaps = true; t.anisotropy = R.capabilities.getMaxAnisotropy(); t.needsUpdate = true; }
    const glow = /^(win|lantern)/.test(nm);
    const mkm = () => { const m = new T.MeshLambertMaterial({ map: t || null, color: t ? 0xffffff : sm.color }); if (glow) { m.emissive = new T.Color(nm === 'win' ? 0xffb050 : 0xff6a30); if (t) m.emissiveMap = t; m.emissiveIntensity = 0; GLOW.push(m); } return t ? sharpen(m) : m; };
    const M = { m: mkm(), f: holed(mkm()), d: new T.MeshDepthMaterial({ depthPacking: T.RGBADepthPacking }) }; MODELM.set(o.geometry, M); o.material = M.m; o.userData = {}; o.castShadow = o.receiveShadow = true; });
  const lp = g.scene.getObjectByName('lamps'); g.scene.userData.lamps = lp?.userData?.pts ? JSON.parse(lp.userData.pts) : []; MODELS[n] = g.scene; } catch (e) { MODELS[n] = null; console.warn('모형 못 읽음', n, e); } }
async function loadModels() { await Promise.all(MODELN.map(loadModel)); }
// 지도에 필요한 모형을 그때그때 읽는다. 다 읽으면 지도를 다시 세운다(그동안은 조립 건물로 보인다)
function needModel(n) { if (n in MODELS) return MODELS[n]; if (!MODELP[n]) { HD.modelsPending = (HD.modelsPending || 0) + 1; MODELP[n] = loadModel(n).then(() => { HD.modelsPending--; curMap = null; }); } return null; }
function modelKey(s) { const gs = s.grand && GRAND[s.grand]; return gs?.model || (s.grand ? `g_${s.grand}_${s.name}` : SPEC[s.name] ? `b_${s.name}` : null); }
function loadPreview() { if (!loadModels.p) loadModels.p = loadModels(); return pvP || (pvP = Promise.all([loadModels.p, ...PVN.map(n => new Promise(res => { const im = new Image(); im.onload = () => { PV[n] = im; res(); }; im.onerror = res; im.src = `assets/hd2d/preview/${n}.webp`; }))])); }
const art = () => !!HD.opt.art;
function previewTex(name) {
  const im = art() && PV[name]; if (!im) return null; if (TEX.has('p/' + name)) return TEX.get('p/' + name);
  const c = mk(im.width, im.height); c.getContext('2d').drawImage(im, 0, 0); const t = texFrom(c, { mips: name !== 'me' && name !== 'yun' && !name.startsWith('n_') }); if (/^[gre]_/.test(name)) { t.wrapS = t.wrapT = T.RepeatWrapping; t.needsUpdate = true; } TEX.set('p/' + name, t); return t;
}
// 소품: 도트 그대로 올려 '또렷한 겹선형'으로 읽는다(배경도 인물과 같은 도트 결. 매끈해지는 것은 흐림과 빛뿐)
// 옛 그림(16점 칸, 도트 2배) 소품은 새 그림보다 크고 쨍하다. 새 나무 그림(HT1)이 오기 전까지 새 화면에서만 줄이고 색을 맞춘다(막힘과 2D는 그대로)
const OLDSC = { tree_round: .8, tree_big: .8, tree_pine: .82, plum: .76, plum_g: .76, plum_o: .76, grove_green: .86, pot: .66, jar: .66, box: .74, stump: .85, boulder: .85,
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
const GROUND = { 0: 'g_grass', 1: 'g_road', 3: 'g_yard', 5: 'g_cobble' };  // 5: 비무대·광장 바닥(막돌)
// 땅 종류마다 풀 그림 색 바꾸기(새 땅 그림이 오기 전까지). 풀은 짙은 올리브(기준 화면의 풀은 누런 올리브와 갈색)
const BIOME_T = { grass: (r, g, b) => [r + 6, g * .9 + 2, b * .55], plain: (r, g, b) => [r + 6, g * .9 + 2, b * .55], rose: (r, g, b) => [r + 6, g * .9 + 2, b * .55],
  deep: (r, g, b) => [r * .78, g * .86, b * .5], sand: (r, g, b, l) => [l * 1.05 + 78, l * .86 + 56, l * .5 + 28], snow: (r, g, b, l) => [l * .45 + 168, l * .45 + 172, l * .4 + 184],  // 모래와 눈은 받은 땅 그림(g_sand, g_snow)이 있으면 그걸 쓴다
  dusk: (r, g, b, l) => [l * .62 + 36, l * .5 + 26, l * .48 + 24] };
const DECO = { grass: 1, plain: 1, rose: 1, deep: 1 };
// 땅 얼룩 세기: 흙 드러난 자리, 짙은 자리, 이끼. 눈에는 흙과 이끼가 없고 엷은 그늘만
const MOTTLE = { grass: { dirt: 1, dark: 1, moss: 1 }, plain: { dirt: 1, dark: 1, moss: 1 }, rose: { dirt: 1, dark: 1, moss: 1 }, deep: { dirt: .7, dark: 1, moss: 1 }, sand: { dirt: .6, dark: .6, moss: 0, dc: [120, 84, 48] }, dusk: { dirt: .6, dark: .8, moss: 0, dc: [70, 52, 40] }, snow: { dirt: 0, dark: .3, moss: 0 } };  // 풀 포기를 흩뿌리는 땅
function groundArt(m, base) {
  if (!art() || !PV.g_grass || m.room) return null;
  const W2 = Math.round(m.w * TS * DOT), H2 = Math.round(m.h * TS * DOT), c = mk(W2, H2), x = c.getContext('2d'), out = x.createImageData(W2, H2), o = out.data;
  const GB = { sand: 'g_sand', snow: 'g_snow' }[m.biome], pats = {}; for (const k in GROUND) { const nm = k === '0' && GB && PV[GB] ? GB : GROUND[k], im = PV[nm]; const q = mk(im.width, im.height).getContext('2d', { willReadFrequently: true }); q.drawImage(im, 0, 0); const d = q.getImageData(0, 0, im.width, im.height).data;
    if (nm === 'g_road' && m.biome === 'snow') for (let i = 0; i < d.length; i += 4) { const l = d[i] * .3 + d[i + 1] * .59 + d[i + 2] * .11; d[i] = l * .5 + 120; d[i + 1] = l * .5 + 124; d[i + 2] = l * .45 + 136; }  // 눈 위 길: 밟아 다진 회색 눈
    if (nm === 'g_grass') { const bt = BIOME_T[m.biome] || BIOME_T.grass; for (let i = 0; i < d.length; i += 4) { const l = d[i] * .3 + d[i + 1] * .59 + d[i + 2] * .11; [d[i], d[i + 1], d[i + 2]] = bt(d[i], d[i + 1], d[i + 2], l).map(v => Math.max(0, Math.min(255, v))); } }  // 풀 그림을 땅 종류(모래, 눈, 짙은 숲, 어스름)에 맞게 다시 칠한다
    pats[k] = { w: im.width, h: im.height, d }; }
  const bw = base.width, bd = base.getContext('2d', { willReadFrequently: true }).getImageData(0, 0, bw, base.height).data;
  const hs = (i, j) => { let h = (i * 374761393 + j * 668265263) | 0; h = (h ^ (h >>> 13)) * 1274126177 | 0; return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
  const nz = (u, v, k) => { const i = Math.floor(u), j = Math.floor(v), fu = u - i, fv = v - j, a = fu * fu * (3 - 2 * fu), b = fv * fv * (3 - 2 * fv), A = hs(i + k, j), B = hs(i + 1 + k, j), C = hs(i + k, j + 1), E = hs(i + 1 + k, j + 1); return A + (B - A) * a + (C - A) * b + (A - B - C + E) * a * b; };
  const cell = TS * DOT, S = 1 / 18;  // 잡음 크기: 도트 18점마다 한 마디
  // 가로로 난 길은 무늬를 눕혀 깐다(수레 자국이 길을 따라 나게)
  const G1 = (x, y) => m.g[y]?.[x] === 1, LIE = m.g.map((r, y) => r.map((v, x) => v === 1 && (G1(x - 1, y) || G1(x + 1, y)) && !(G1(x, y - 1) && G1(x, y + 1)) && !(G1(x, y - 1) && !G1(x - 1, y) && !G1(x + 1, y)))), lie = (x, y) => LIE[y][x];
  // 흔들림은 도트 두 점마다 한 번만 잰다(경계가 도트 크기로 각지고, 세우는 시간이 4분의 1)
  const bw2 = (W2 >> 1) + 1, bh2 = (H2 >> 1) + 1, JX = new Float32Array(bw2 * bh2), JY = new Float32Array(bw2 * bh2);
  // 풀밭 얼룩: 흙 드러난 자리, 짙은 풀, 이끼를 큰 잡음과 작은 잡음으로 섞는다(넓은 풀밭이 고르게 보이지 않게)
  const NA = new Float32Array(bw2 * bh2), NB = new Float32Array(bw2 * bh2), NC = new Float32Array(bw2 * bh2);
  for (let b = 0; b < bh2; b++) for (let a = 0; a < bw2; a++) { const X = a * 2, Y = b * 2, k = b * bw2 + a; NA[k] = nz(X * S / 4, Y * S / 4, 31) * .7 + nz(X * S, Y * S, 17) * .3; NB[k] = nz(X * S / 2.5, Y * S / 2.5, 77) * .75 + nz(X * S * 2, Y * S * 2, 5) * .25; NC[k] = nz(X * S / 3, Y * S / 3, 133); }
  const DIRT = [92, 70, 40], DARK = [.62, .64, .5], MOSS = [96, 98, 34];
  for (let b = 0; b < bh2; b++) for (let a = 0; a < bw2; a++) { const X = a * 2, Y = b * 2, k = b * bw2 + a; JX[k] = (nz(X * S, Y * S, 0) - .5) * .55 + (nz(X * S * 3, Y * S * 3, 7) - .5) * .2; JY[k] = (nz(X * S, Y * S, 91) - .5) * .55 + (nz(X * S * 3, Y * S * 3, 53) - .5) * .2; }
  for (let Y = 0; Y < H2; Y++) for (let X = 0; X < W2; X++) {
    const k = (Y >> 1) * bw2 + (X >> 1), jx = JX[k], jy = JY[k];
    const tx = Math.min(m.w - 1, Math.max(0, Math.floor(X / cell + jx))), ty = Math.min(m.h - 1, Math.max(0, Math.floor(Y / cell + jy))), p = pats[m.g[ty][tx]], i = (Y * W2 + X) * 4;
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
function terrain(m, gt) {
  const P = [], U = [], N = [], S = { stone: { P: [], U: [], N: [] }, wood: { P: [], U: [], N: [] } }, z = y => y * TS * ZS;
  const quad = (B, a, b, c, d, ua, ub, uc, ud, n) => { for (const [q, u] of [[a, ua], [b, ub], [c, uc], [a, ua], [c, uc], [d, ud]]) { B.P.push(...q); B.U.push(...u); B.N.push(...n); } };
  const top = { P, U, N };
  for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) {
    const [nw, ne, sw, se] = corners4(m, x, y), x0 = x * TS, x1 = x0 + TS, z0 = z(y), z1 = z(y + 1), u0 = x / m.w, u1 = (x + 1) / m.w, v0 = 1 - y / m.h, v1 = 1 - (y + 1) / m.h;
    const ny = Math.hypot(z1 - z0, nw - sw), n = [0, (z1 - z0) / ny, (nw - sw) / ny];
    quad(top, [x0, sw, z1], [x1, se, z1], [x1, ne, z0], [x0, nw, z0], [u0, v1], [u1, v1], [u1, v0], [u0, v0], n);
    // 둘레가 더 낮으면 축대 면을 세운다(높은 칸 쪽에서 낮은 칸을 바라보게). 나루 판(마루 칸)은 나무, 나머지는 돌
    const B = m.g[y][x] === 4 ? S.wood : S.stone, sd = (b0, b1, t0, t1, a, b, n2, len) => { if (t0 - b0 < .5 && t1 - b1 < .5) return; const L = len / 10, V0 = b0 / 10, V1 = t0 / 10;
      quad(B, [a[0], Math.min(b0, t0), a[1]], [b[0], Math.min(b1, t1), b[1]], [b[0], t1, b[1]], [a[0], t0, a[1]], [0, Math.min(b0, t0) / 10], [L, Math.min(b1, t1) / 10], [L, t1 / 10], [0, t0 / 10], n2); };
    { const c = corners4(m, x, y + 1); sd(c[0], c[1], sw, se, [x0, z1], [x1, z1], [0, 0, 1], TS); }  // 남쪽
    { const c = corners4(m, x, y - 1); sd(c[3], c[2], ne, nw, [x1, z0], [x0, z0], [0, 0, -1], TS); }  // 북쪽
    { const c = corners4(m, x - 1, y); sd(c[1], c[3], nw, sw, [x0, z0], [x0, z1], [-1, 0, 0], z1 - z0); }  // 서쪽
    { const c = corners4(m, x + 1, y); sd(c[2], c[0], se, ne, [x1, z1], [x1, z0], [1, 0, 0], z1 - z0); }  // 동쪽
  }
  const geo = B => { const g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(B.P, 3)); g.setAttribute('uv', new T.Float32BufferAttribute(B.U, 2)); g.setAttribute('normal', new T.Float32BufferAttribute(B.N, 3)); g.computeBoundingSphere(); return g; };
  for (const [k, B] of Object.entries(S)) { if (!B.P.length) continue; const t = previewTex(k === 'wood' ? 'r_plank' : 'g_cobble'), mt = t ? matOf(t).m : new T.MeshLambertMaterial({ color: k === 'wood' ? '#6b5038' : '#77746c' }), o = new T.Mesh(geo(B), mt); o.castShadow = o.receiveShadow = true; scene.add(o); cliffs.push(o); }
  return new T.Mesh(geo(top), sharpen(new T.MeshLambertMaterial({ map: gt })));
}

// ── 지도 ──
// 물(HG2 그림이 오기 전 코드로): 물 칸(2)마다 판을 깔고, 잔물결이 움직이며 하늘빛이 비치게 색을 섞는다. 빛과 그림자는 Lambert 그대로 받는다
let waterM = null; const WU = { uT: { value: 0 }, uSky: { value: null }, uDeep: { value: null } };
function waterMat() {
  if (waterM) return waterM; WU.uSky.value = new T.Color('#9cc0e8'); WU.uDeep.value = new T.Color('#1f4a52');
  waterM = new T.MeshLambertMaterial({ color: '#ffffff', transparent: true, opacity: .93 });
  waterM.onBeforeCompile = s => { Object.assign(s.uniforms, WU);
    s.vertexShader = 'varying vec3 vWp;\n' + s.vertexShader.replace('#include <project_vertex>', '#include <project_vertex>\n vWp = (modelMatrix * vec4(transformed, 1.)).xyz;');
    s.fragmentShader = 'varying vec3 vWp; uniform float uT; uniform vec3 uSky, uDeep;\n' + s.fragmentShader.replace('#include <map_fragment>', `
      vec2 q = floor(vWp.xz / vec2(1.2, 1.2 * 4.4)) * vec2(.09, .09 * 4.4 * 1.6);  // 도트 굵기로 끊어 잰다. 물결은 옆으로 긴 줄
      float w1 = sin(q.x * .9 + q.y * 2.6 + uT * 1.6) + sin(q.x * 1.9 - q.y * 3.3 - uT * 1.2) * .8 + sin(q.x * 3.7 + q.y * 5.1 + uT * 2.1) * .5;
      float rip = smoothstep(1.7, 2.1, w1), dark = smoothstep(-.8, -2.2, w1);
      float far = smoothstep(0., 600., length(vWp.xz - cameraPosition.xz));
      vec3 c = mix(uDeep, uSky, .38 + far * .3); c = mix(c, uSky * 1.25, rip * .75); c *= 1. - dark * .25;
      diffuseColor.rgb *= c;`); };
  return waterM;
}
function waterMesh(m) {
  const P = [], N = [], z = y => y * TS * ZS;
  for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) { if (m.g[y][x] !== 2) continue;
    const h = m.hgt ? Math.min(...corners4(m, x, y)) + .4 : .25, x0 = x * TS, x1 = x0 + TS + .02, z0 = z(y), z1 = z(y + 1) + .02;
    for (const v of [[x0, z1], [x1, z1], [x1, z0], [x0, z1], [x1, z0], [x0, z0]]) { P.push(v[0], h, v[1]); N.push(0, 1, 0); } }
  if (!P.length) return null; const g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(P, 3)); g.setAttribute('normal', new T.Float32BufferAttribute(N, 3));
  const o = new T.Mesh(g, waterMat()); o.receiveShadow = true; o.renderOrder = 1; return o;
}
let water = null;
let buildMs = 0;
function setMap(m) {
  if (curMap === m) return; curMap = m; const t0 = performance.now();
  for (const o of [...propG.children]) { propG.remove(o); o.traverse(c => { if (c.isMesh && !c.userData.shared) c.geometry.dispose(); }); }
  if (ground) { scene.remove(ground); ground.geometry.dispose(); ground.material.map.dispose(); ground.material.dispose(); ground = null; }
  for (const o of cliffs) { scene.remove(o); o.geometry.dispose(); } cliffs.length = 0;
  const Wm = m.w * TS, Dm = m.h * TS * ZS;
  // 땅: 지금 땅 그림을 그대로 눕힌다(땅 무늬 HB14가 오기 전 임시). 땅도 도트 결로 읽는다
  const gc = mk(m.w * TS, m.h * TS), gx = gc.getContext('2d', { willReadFrequently: true }); m.paintBase(gx);
  const gt = new T.CanvasTexture(groundArt(m, gc) || gc); gt.colorSpace = T.SRGBColorSpace; gt.anisotropy = R.capabilities.getMaxAnisotropy(); gt.minFilter = T.LinearMipmapLinearFilter;
  if (m.hgt) ground = terrain(m, gt);  // 높낮이가 있는 지도: 칸마다 높이대로 들고 단 사이에 축대를 세운다
  else { ground = new T.Mesh(new T.PlaneGeometry(Wm, Dm), sharpen(new T.MeshLambertMaterial({ map: gt }))); ground.rotation.x = -Math.PI / 2; ground.position.set(Wm / 2, 0, Dm / 2); }
  ground.receiveShadow = true; scene.add(ground);
  if (water) { scene.remove(water); water.geometry.dispose(); } water = art() ? waterMesh(m) : null; if (water) scene.add(water);
  // 지도 밖: 가장자리 땅빛으로 넓게 깔아 빈 곳이 안 보이게
  const ed = gx.getImageData(0, 0, gc.width, 8).data; let r = 0, g = 0, b = 0, n = 0; for (let i = 0; i < ed.length; i += 16) { r += ed[i]; g += ed[i + 1]; b += ed[i + 2]; n++; }
  if (!skirt) { skirt = new T.Mesh(new T.PlaneGeometry(1, 1), new T.MeshLambertMaterial()); skirt.rotation.x = -Math.PI / 2; skirt.receiveShadow = true; scene.add(skirt); }
  skirt.material.color.setRGB(r / n / 255, g / n / 255, b / n / 255, T.SRGBColorSpace).multiplyScalar(.82); skirt.scale.set(Wm + 4000, Dm + 4000, 1); skirt.position.set(Wm / 2, m.hgt ? lowest(m) - 1 : -.6, Dm / 2);
  // 소품: 2D가 그리던 순서(발 높이 순)를 깊이로 옮긴다. 같은 높이면 나중 것이 아주 조금 앞
  const list = m.stamps.map((s, i) => ({ s, i, z: s.flat ? s.y + TS : s.base })).sort((a, b) => a.z - b.z || a.i - b.i), GEO = new Map();
  list.forEach(({ s, z }, k) => {
    const st = STAMPS[s.name], t = st && stampTex(s.name); if (!t) return; const sc = s.sc || 1, pv = !!previewTex(s.name), w = st[3] * sc, h = pv ? w * t.image.height / t.image.width : st[4] * sc, gk = w + 'x' + h;
    const ef = !s.flat && st.length > 5 && (pv ? EAVE_PV : EAVE)[s.name];
    const mk_ = !s.flat && art() && modelKey(s), gm = mk_ && needModel(mk_);
    if (gm) { const g = new T.Group(), o = gm.clone(true); o.traverse(c => { if (c.isMesh) { const M = MODELM.get(c.geometry); c.userData = { M, owner: g }; c.material = M.m; c.customDepthMaterial = M.d; } }); g.add(o);
      const xc = s.x + st[5] + st[7] / 2, yf = s.y + st[6] + st[8], pb = s.grand && GRAND[s.grand]?.model ? GRAND[s.grand].modelFront || 7 : 0; g.scale.set(1, HS, ZS); g.position.set(xc, hAt(m, xc, yf - 1), (yf - pb) * ZS); g.userData = { s, house: true }; propG.add(g);
      for (const [x, y, z] of gm.userData.lamps || []) LAMPX.push([xc + x, yf - pb - y, z]); return; }  // 블렌더 모형(tools/blender/hall.py, houses.py)
    if (!s.flat && SPEC[s.name] && art() && PV.w1_front) { build ||= makeBuilder({ T, HS, ZS, DOT, PV, aniso: R.capabilities.getMaxAnisotropy(), texFrom, matOf, holed, LAMPX, face, glow: GLOW, get AO() { return aoTex(); } }); const b = build(s, st, SPEC[s.name]); if (b) { propG.add(b); return; } }  // 조립한 건물(js/hd2d/build.js)
    if (!s.flat && PARTS[s.name] && previewTex('w_front')) { propG.add(partsBox(s, PARTS[s.name])); return; }  // 새 그림: 벽 부품(HW0)과 지붕 무늬(HR1)로
    if (ef) { propG.add(houseBox(s, t, w, h, ef)); return; }
    if (!s.flat && WALLS.has(s.name)) { propG.add(wallBox(s, t, w, h)); return; }
    const sw = art() && !s.flat && SWAP[s.name] && IMG['stamp/' + SWAP[s.name]] && SWAP_SZ[SWAP[s.name]];
    if (sw) { const nm = SWAP[s.name], [w2, h2] = SWAP_SZ[nm].map(v => v * (s.sc || 1) * (.9 + ((s.x * 7 + s.y * 3) % 5) * .05)), t2 = stampTex(nm), gk2 = w2.toFixed(1) + 'x' + h2.toFixed(1); if (!GEO.has(gk2)) GEO.set(gk2, standGeo(w2, h2));
      const M = matOf(t2), o = new T.Mesh(GEO.get(gk2), M.m); o.customDepthMaterial = M.d; o.position.set(s.x + w / 2, hAt(m, s.x + w / 2, z - 1), z * ZS + k * .003);
      o.castShadow = true; o.receiveShadow = true; o.userData = { s, w: w2, h: h2, M, t: t2, owner: o, shared: true }; propG.add(o); return; }  // 새 그림(Higgsfield HT1, HP4)으로 바꿔 그린다. 막힘은 그대로
    if (art() && OLDSC[s.name] && !s.flat) { const k = OLDSC[s.name], w2 = w * k, h2 = h * k, gk2 = w2 + 'x' + h2; if (!GEO.has(gk2)) GEO.set(gk2, standGeo(w2, h2));
      const M = matOf(t), o = new T.Mesh(GEO.get(gk2), M.m); o.customDepthMaterial = M.d; o.position.set(s.x + w / 2, hAt(m, s.x + w / 2, z - 1), z * ZS + k * .003);
      o.castShadow = true; o.receiveShadow = true; o.userData = { s, w: w2, h: h2, M, t, owner: o, shared: true }; propG.add(o); return; }
    if (!GEO.has(gk)) GEO.set(gk, standGeo(w, h));
    const M = matOf(t), o = new T.Mesh(GEO.get(gk), M.m); o.customDepthMaterial = M.d; o.position.set(s.x + w / 2, hAt(m, s.x + w / 2, z - 1), z * ZS + k * .003);
    o.castShadow = !s.flat; o.receiveShadow = true; o.userData = { s, w, h, M, t, owner: o, flat: s.flat, shared: true }; propG.add(o);
  });
  // 풀 포기(새 화면만, 막힘 없음): 빈 풀밭 칸에 풀과 꽃을 흩뿌려 빈 땅이 넓게 보이지 않게. 길, 문 앞, 소품 둘레는 비운다. 그림마다 한 덩어리로 합쳐 그리는 횟수를 줄인다
  if (art() && DECO[m.biome || 'grass']) { const DK = IMG['stamp/g_fern'] ? ['g_fern', 'g_tallgrass', 'g_yflowers', 'g_tallgrass', 'g_wflowers', 'g_ivy', 'g_bush', 'g_fern'] : ['fern1', 'fern2', 'flower3', 'fern1', 'flower4', 'fern2', 'bush4', 'flower1'], hs = (a, b) => { let h = (a * 374761393 + b * 668265263) | 0; h = (h ^ (h >>> 13)) * 1274126177 | 0; return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
    const near = (px, py) => m.stamps.some(q => { const S = STAMPS[q.name]; return S && px > q.x - 6 && px < q.x + S[3] * (q.sc || 1) + 6 && py > q.y + S[4] * .4 - 4 && py < q.base + 8; }) || m.portals.some(q => px > q.x - 12 && px < q.x + q.w + 12 && py > q.y - 6 && py < q.y + q.h + 20);
    const B = new Map();
    for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) for (let j = 0; j < 3; j++) { if (m.g[y][x] !== 0 || hs(x * 7 + j, y * 13) > .7) continue;
      const px = (x + hs(x, y * 3 + j)) * TS, py = (y + hs(x * 5 + j, y)) * TS; if (near(px, py) || m.g[Math.floor(py / TS)]?.[Math.floor(px / TS)] !== 0) continue;
      const k = DK[Math.floor(hs(x * 3, y * 11 + j) * DK.length)], t = stampTex(k), st = STAMPS[k]; if (!t || !st) continue; const sc = (k.startsWith('g_') ? .75 : .45) + hs(y, x + j) * .3, w = st[3] * sc, h = st[4] * sc * HS, y0 = hAt(m, px, py), z = (py + .5) * ZS;
      if (!B.has(t)) B.set(t, { P: [], U: [], I: [] }); const b = B.get(t), n = b.P.length / 3;
      b.P.push(px - w / 2, y0, z, px + w / 2, y0, z, px + w / 2, y0 + h, z, px - w / 2, y0 + h, z); b.U.push(0, 0, 1, 0, 1, 1, 0, 1); b.I.push(n, n + 1, n + 2, n, n + 2, n + 3); }
    for (const [t, b] of B) { const g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(b.P, 3)); g.setAttribute('uv', new T.Float32BufferAttribute(b.U, 2)); g.setAttribute('normal', new T.Float32BufferAttribute(b.P.map((_, i) => i % 3 === 1 ? 1 : 0), 3)); g.setIndex(b.I);
      const o = new T.Mesh(g, matOf(t).m); o.receiveShadow = true; o.userData = { deco: true }; propG.add(o); } }
  // 등불 자리: 문 위, 등롱, 객잔 기
  m._lamps = [...LAMPX, ...m.portals.filter(q => q.door && !LAMPX.some(l => Math.abs(l[0] - q.x - q.w / 2) < 30 && Math.abs(l[1] - q.y) < 12)).map(q => [q.x + q.w / 2, q.y - 2, 26]), ...m.stamps.filter(s => /lantern|banner|censer|v_lamp|v_stonelamp/.test(s.name)).map(s => { const st = STAMPS[s.name]; return [s.x + st[3] * (s.name === 'v_lamppost' ? .7 : .5), s.base + 1, st[4] * (s.name === 'v_lamppost' ? .6 : s.name === 'v_stonelamp' ? .6 : .7)]; })]; LAMPX.length = 0;
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
  o.scale.set(size * wx, size * HS, 1); o.position.set(x, lift * HS + hAt(curMap, x, y), (y + 1) * ZS + .5);  // 2D는 발끝을 y+1에 그렸다. 같은 줄의 소품보다 반 점 앞
  return o;
}
// 예전 2.5등신 인물(16점 칸): 새 인물 그림이 오기 전까지 키는 주인공과 같게(칸 16점 중 사람 15점), 폭만 조금 줄여 덜 튀게
const OLDK = CHAR / 15;
let blobT = null; const blobs = []; let usedB = 0;
function blob(x, y, s) {
  if (!blobT) { const im = IMG['chars/_Shadow']; if (!im) return; blobT = new T.Texture(im); blobT.colorSpace = T.SRGBColorSpace; blobT.needsUpdate = true; }
  let o = blobs[usedB];
  if (!o) { o = new T.Mesh(new T.PlaneGeometry(1, 1), new T.MeshBasicMaterial({ map: blobT, transparent: true, depthWrite: false, opacity: .5 })); o.rotation.x = -Math.PI / 2; o.renderOrder = 1; blobs.push(o); actG.add(o); }
  usedB++; o.visible = true; o.scale.set(12 * s, 7 * s * ZS, 1); o.position.set(x, .15 + hAt(curMap, x, y), (y + .5) * ZS);
}
// drawActorSprite와 같은 칸을 고른다
function frameOf(key, dirCol, row, diag) {
  const img = IMG[key]; if (!img) return null; const dg = diag !== undefined && IMG[key + '_d'];
  if (dg) { const k = 16 * (dg.hd || 1); return { t: sheetTex(key + '_d'), sx: (diag % 2) * k, sy: Math.min(row, 3) * k, s: k, flip: diag > 1 }; }
  const f = 16 * (img.hd || 1), r = Math.min(row, Math.floor(img.height / f) - 1); return { t: sheetTex(key), sx: dirCol * f, sy: r * f, s: f, flip: false };
}
function syncActors(F) {
  used = 0; usedB = 0; const p = F.p, S = G.S, put = (key, dir, row, x, y, o = {}) => { const fr = frameOf(key, dir, row, o.diag); if (!fr || !fr.t) return; actor(fr.t, fr.sx, fr.sy, fr.s, fr.s, fr.flip, x, y, (o.size || 16) * OLDK, o.lift || 0, .84); blob(x, y, o.size ? o.size / 16 : 1); };
  for (const n of F.npcs) { if (n.hide > 0) continue; if (n.stamp) { const t = stampTex(n.stamp); if (t) actor(t, 0, 0, t.image.width, t.image.height, false, n.x, n.y, 16); continue; }
    const key = n.spr.includes('/') ? n.spr : 'chars/' + n.spr, yt = (key === 'chars/Princess' && previewTex('yun')) || (NEWNPC[key] && previewTex(NEWNPC[key])); if (yt) { actor(yt, n.dir * 56, (n.pose ?? Math.floor(n.walk || 0) % 4) % 4 * 56, 56, 56, false, n.x, n.y, CHAR * 56 / 48); blob(n.x, n.y, 1); continue; } put(key, n.dir, n.pose ?? Math.floor(n.walk || 0) % 4, n.x, n.y, { diag: n.walk ? n.diag : undefined, size: n.size, lift: n.hopT > 0 ? Math.sin(n.hopT / .4 * Math.PI) * 2.5 : 0 }); }
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
  const m = F.m, p = HD.peek ? { x: HD.peek[0], y: HD.peek[1] } : F.p, Wm = m.w * TS, Dm = m.h * TS * ZS, vh = CHAR * HD.opt.zoom; dist = vh / (2 * Math.tan(FOV / 2 * DEG));
  const ty = 8 * HS, hc = ty + dist * Math.sin(PITCH), back = dist * Math.cos(PITCH), f = FOV / 2 * DEG, hw = dist * Math.tan(f) * W / H;
  // 화면 위 끝과 아래 끝이 닿는 땅이 지도 밖으로 너무 나가지 않게 겨냥점을 묶는다(2D 카메라가 지도 안에 머물던 것과 같다)
  // 남쪽은 화면 아래 끝이 지도 밖으로 나가지 않게 묶고, 북쪽은 주인공이 끝까지 가운데 오게 둔다(지도 너머는 안개와 넓은 땅. 먼 산은 5단계)
  const dn = hc / Math.tan(PITCH + f) - back, lo = 4 * TS * ZS, hi = Math.max(lo, Dm + 4 * ZS + dn);
  let tx = p.x, tz = Math.min(hi, Math.max(lo, (p.y - vh * AHEAD) * ZS));  // 주인공보다 조금 앞(북쪽)을 겨눠 주인공이 화면 가운데보다 아래에 선다(일검풍운결처럼). 앞쪽 집이 더 크게 들어온다 tx = Wm < hw * 2 ? Wm / 2 : Math.min(Wm - hw, Math.max(hw, tx));
  if (camT.x < 0) camT.set(tx, ty, tz); else { const k = 1 - Math.exp(-dt * 7); camT.set(camT.x + (tx - camT.x) * k, ty, camT.z + (tz - camT.z) * k); }
  cam.position.set(camT.x, camT.y + dist * Math.sin(PITCH), camT.z + back);
  if (HD.orbit) { const a = HD.orbit * DEG; cam.position.set(camT.x + Math.sin(a) * back, camT.y + dist * Math.sin(PITCH), camT.z + Math.cos(a) * back); }  // 시험 화면용: 겨냥점 둘레로 돌려 옆과 뒤에서 본다(게임에서는 쓰지 않는다)
  cam.lookAt(camT.x, camT.y, camT.z); cam.updateMatrixWorld();
  // 그림자 상자는 보이는 땅을 덮을 만큼
  const L = TIMES[timeOf()], d = new T.Vector3(...L.sun).normalize(); sun.target.position.set(camT.x, 0, camT.z - dist * .3); sun.position.copy(sun.target.position).addScaledVector(d, 1200);
  const sc = sun.shadow.camera, half = Math.max(hw * 1.5, dist * 1.25); sc.left = -half; sc.right = half; sc.top = half; sc.bottom = -half; sc.near = 200; sc.far = 2600; sc.updateProjectionMatrix();
}
const V = () => new T.Vector3();
// 평면도 (x, y)에서 높이 h인 곳 → 1280×720 화면 자리
function proj(x, y, h = 0) { const v = V().set(x, h * HS, y * ZS).project(cam); return [(v.x + 1) / 2 * W, (1 - v.y) / 2 * H, v.z]; }

// ── 가림: 주인공 몸을 카메라에서 본 줄이 앞의 그림의 칠해진 곳을 지나면 그 그림을 옅게(occl.js와 같은 판단) ──
const BODY = [[0, 13], [0, 9], [0, 6], [-3, 3], [3, 3]], frac = v => v - Math.floor(v);
const alphaAt = (t, u, v) => { const { width: w, height: h, data } = t.image; return data[(Math.min(h - 1, v * h | 0) * w + Math.min(w - 1, u * w | 0)) * 4 + 3] > 127; };  // v는 아래가 0
function fades(F, dt = 1) {
  const p = F.p, C = cam.position, hit = new Set(), rc = fades.rc || (fades.rc = new T.Raycaster()), v = V();
  for (const [dx, dh] of BODY) {
    v.set(p.x + dx, dh * HS, (p.y + 1) * ZS + .5); const d = v.distanceTo(C); rc.set(C, v.sub(C).normalize()); rc.far = d - 1;
    for (const h of rc.intersectObjects(propG.children, true)) { const u = h.object.userData; if (!u.M || u.flat) continue; if (u.t && h.uv && !alphaAt(u.t, frac(h.uv.x), frac(h.uv.y))) continue; hit.add(u.owner); break; }
  }
  for (const o of propG.children) { const on = hit.has(o);
    if (o.userData.house) { cutHouse(o, on && !HD.orbit, dt); continue; }  // 집: 구멍 대신 건물째 무릎 높이로 걷어 낸다
    if (!!o.userData.faded === on) continue; o.userData.faded = on; (o.isGroup ? o.children : [o]).forEach(c => { if (c.userData.M) c.material = on ? c.userData.M.f : c.userData.M.m; }); }
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
const timeOf = () => HD.opt.time === 'auto' ? (G.S?.flags?.night ? 'night' : 'day') : HD.opt.time;
function light() {
  const L = TIMES[timeOf()];
  for (const m of GLOW) m.emissiveIntensity = (L.lamp || 0) * .9;  // 밤에는 창에서 빛이 샌다
  if (waterM) { WU.uT.value = performance.now() / 1000; WU.uSky.value.set(L.skyT); WU.uDeep.value.set(L.lamp ? '#0e2430' : '#1f4a52'); }
  sun.color.set(L.sunC); sun.intensity = L.sunI; hemi.color.set(L.sky); hemi.groundColor.set(L.gnd); hemi.intensity = L.hemI;
  { const d = L.sun; fill.position.set(camT.x - d[0] * 800, 500, camT.z + 600); fill.target.position.set(camT.x, 0, camT.z); fill.intensity = L.sunI * (L.fill ?? .2); fill.color.set(L.fillC || '#c8c0b8'); }
  scene.fog.color.set(L.fog); scene.fog.near = dist * 3; scene.fog.far = dist * 13; backdrop(L);
  const sz = HD.opt.fx === 'high' ? 4096 : HD.low ? 1024 : 2048; if (sun.shadow.mapSize.x !== sz) { sun.shadow.mapSize.set(sz, sz); sun.shadow.map?.dispose(); sun.shadow.map = null; }
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
  const fp = (HD.peek ? V().set(camT.x, 20 * HS, camT.z) : V().set(F.p.x, 8 * HS, (F.p.y + 1) * ZS)).applyMatrix4(cam.matrixWorldInverse);
  Object.assign(u.tS, { value: P.scene.texture }); u.tD.value = P.scene.depthTexture; u.tB1.value = P.a1.texture; u.tB2.value = P.a2.texture;
  u.cn.value = cam.near; u.cf.value = cam.far; u.focus.value = -fp.z; u.f0.value = dist * 1.6; u.f1.value = dist * 4; u.n0.value = dist * .5; u.n1.value = dist * .64;  // 가까운 흐림은 화면 앞 덤불에만(높은 지붕은 초점보다 가깝지만 흐리지 않게)
  const cool = curMap?.biome === 'snow' && !L.lamp;  // 눈 덮인 낮은 따뜻한 물들이기를 빼고 차갑게
  u.tint.value.set(...(cool ? [.94, 1, 1.1] : L.tint)); u.expo.value = L.expo; u.sat.value = L.sat; u.bk.value = HD.opt.fx === 'high' ? .75 : .55; u.bt.value = timeOf() === 'night' ? .55 : .82; u.vig.value = L.vig ?? .62; u.con.value = L.con || 1.08; u.warm.value = curMap?.biome === 'snow' ? 0 : L.warm || 0;
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
  resize(); setMap(F.m); placeCam(F, dt); foreground(); syncActors(F); fades(F, dt); light();
  { const [x, y] = proj(F.p.x, F.p.y, 8), k = post.h / H, v = V().set(F.p.x, 8 * HS, (F.p.y + 1) * ZS).applyMatrix4(cam.matrixWorldInverse);  // 구멍: 화면의 주인공 가슴 자리, 주인공 키의 0.9배 반지름
    if (!HOLE.uHole.value) HOLE.uHole.value = new T.Vector3(); HOLE.uHole.value.set(x * post.w / W, (H - y) * k, HD.pxPerUnit() * CHAR * .9 * k); HOLE.uHoleZ.value = -v.z - 2; }
  R.setRenderTarget(post.scene); R.render(scene, cam); postFx(F);
  fpsN++; if (now - fpsT > 1000) { fpsV = Math.round(fpsN * 1000 / (now - fpsT)); fpsN = 0; fpsT = now; const e = $('#hdfps'); if (e) e.textContent = fpsV + '장/초' + (HD.low ? ' (낮춤)' : ''); if (!G.auto && !HD.noGov) govern(); }
}

// ── 시제품 단추: 인물 키, 시각, 효과, 둘러보기 ──
function panel() {
  if ($('#hdp')) return; const d = document.createElement('div'); d.id = 'hdp';
  d.style.cssText = 'position:absolute;right:14px;bottom:12px;z-index:5;background:rgba(14,11,8,.82);border:2px solid #8a6a3a;color:#f3e6c8;font:14px Galmuri11,Galmuri14,sans-serif;padding:8px 10px;display:flex;flex-direction:column;gap:5px;pointer-events:auto';
  const row = (lab, key, items) => `<div class="hdr" data-k="${key}"><span style="display:inline-block;width:62px">${lab}</span>${items.map(([v, t]) => `<button data-v="${v}">${t}</button>`).join('')}</div>`;
  d.innerHTML = `<div style="display:flex;justify-content:space-between;gap:10px;cursor:pointer" id="hdt" title="눌러서 접기"><b style="color:#ffd88a;font-weight:400">새 화면 시제품 ▾</b><span id="hdfps" style="opacity:.7"></span></div>
    ${row('시각', 'time', [['auto', '게임대로'], ['morning', '아침'], ['day', '낮'], ['evening', '저녁'], ['night', '밤']])}${row('효과', 'fx', [['mid', '보통'], ['high', '높음']])}${row('그림', 'art', [[0, '지금 그림'], [1, '새 그림 맛보기']])}
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
