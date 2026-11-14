// 건물 조립 도구: 바닥 네모에서 상자 하나를 뽑지 않고 부품으로 짓는다(docs/hd2d-next.md 방침 1).
// 부품: 돌 기단, 벽 판(문과 창 자리는 뚫는다), 벽 밖으로 나온 기둥, 도리, 들어간 문과 창, 돌계단,
// 두께 있는 지붕(앞뒤 두 면, 처마, 처마 끝 띠, 처마 밑면, 용마루, 박공판), 이층 난간과 중간 처마, 현판, 등롱.
// 그림은 받은 벽 그림(HW1)에서 부위별로 떠 낸 조각을 도트 굵기대로 되풀이해 입힌다(늘이지 않는다).
// 좌표: 세상 X = 평면도 x, Y = 높이, Z = 평면도 y × ZS. 선 것의 키는 HS만큼 늘린다(hd2d.js 머리말).

// 종류마다 조립 설명서. 길이는 평면도 점(사람 키 15점). 높이는 땅에서부터

// 구파일방·오대세가 전각: 종류 설명서 위에 덮어쓴다. 벽(w4 법당, w5 회관, w6 부잣집), 지붕 빛, 기둥 빛, 현판 글씨, 앞 기둥줄(porch), 넓게(widen)
// 문파마다 HS 벽 그림을 받으면 walls를 그 그림으로 바꾼다(docs/chatgpt-sects.md)
const G0 = { sign: false, pitch: 30, wall: 34, floors: 2, upper: 20, balcony: true, porch: 6, widen: 1.18, plat: [4, 5], lanterns: 2, depth: 30 };
export const GRAND = {
  shaolin_main: { ...G0, model: 'daewoong', walls: ['hs_shaolin', 'w4'], roof: 'r_orange', tint: '#ffd870', col: '#a8281e', plaque: '大雄寶殿', gold: 1, widen: 1.05, wall: 40, upper: 22 },
  shaolin: { ...G0, walls: ['hs_shaolin', 'w4'], roof: 'r_orange', tint: '#ffd870', col: '#a8281e', plaque: '羅漢堂', gold: 1 },
  wudang: { ...G0, walls: ['hs_wudang', 'w5'], roof: 'r_dark', tint: '#9ad0a0', col: '#2e4a36', plaque: '武當' },
  hwasan: { ...G0, walls: ['hs_hwasan', 'w4'], roof: 'r_orange', tint: '#e07060', col: '#8a2a22', plaque: '華山' },
  jongnam: { ...G0, walls: ['hs_jongnam', 'w5'], roof: 'r_dark', tint: '#98a8c0', col: '#2e3a4a', plaque: '終南' },
  emei: { ...G0, walls: ['hs_emei', 'w4'], roof: 'r_dark', tint: '#c0b0d8', col: '#6a4a70', plaque: '峨嵋' },
  gonryun: { ...G0, walls: ['hs_gonryun', 'w5'], roof: 'r_dark', tint: '#c8dcf0', col: '#5a6a80', plaque: '崑崙' },
  gongdong: { ...G0, walls: ['hs_gongdong', 'w6'], roof: 'r_dark', tint: '#b8a078', col: '#6a4a2a', plaque: '崆峒' },
  jeomchang: { ...G0, walls: ['hs_jeomchang', 'w5'], roof: 'r_dark', tint: '#98c098', col: '#4a3020', plaque: '點蒼' },
  cheongseong: { ...G0, walls: ['hs_cheongseong', 'w5'], roof: 'r_dark', tint: '#88c090', col: '#2a5a3a', plaque: '靑城' },
  gaebang: { ...G0, walls: ['hs_gaebang', 'w3'], plank: '#7a5a3a', roof: 'r_thatch', eave: 'e_thatch', thatch: true, pitch: 34, floors: 1, wall: 30, porch: 5, col: '#5a4030', plaque: '丐幇', widen: 1.12 },
  namgung: { ...G0, walls: ['hs_namgung', 'w5'], roof: 'r_dark', tint: '#8098d8', col: '#1e2a5a', plaque: '南宮世家', gold: 1, widen: 1.08 },
  moyong: { ...G0, walls: ['hs_moyong', 'w6'], roof: 'r_dark', tint: '#808890', col: '#202020', plaque: '慕容世家', widen: 1.05 },
  jegal: { ...G0, walls: ['hs_jegal', 'w5'], roof: 'r_dark', tint: '#88b898', col: '#2a4a30', plaque: '諸葛世家' },
  dang: { ...G0, walls: ['hs_dang', 'w6'], roof: 'r_dark', tint: '#a080a8', col: '#2a1a2a', plaque: '唐門' },
  paeng: { ...G0, walls: ['hs_paeng', 'w6'], roof: 'r_orange', tint: '#c87050', col: '#5a2018', plaque: '彭家' },
  // 강호 전도에 있는 그 밖의 세가와 정파 문파(세가 거리·구파 회관 셋째 줄)
  hwangbo: { ...G0, walls: ['hs_hwangbo', 'w6'], roof: 'r_dark', tint: '#d8b878', col: '#5a3a18', plaque: '皇甫世家', gold: 1 },
  ak: { ...G0, walls: ['hs_ak', 'w5'], roof: 'r_dark', tint: '#c87868', col: '#6a1e18', plaque: '岳家' },
  yang: { ...G0, walls: ['hs_yang', 'w4'], roof: 'r_orange', tint: '#e0a868', col: '#5a2a18', plaque: '楊家' },
  eon: { ...G0, walls: ['hs_eon', 'w6'], roof: 'r_dark', tint: '#a8a8b0', col: '#303038', plaque: '彦家' },
  jin: { ...G0, walls: ['hs_jin', 'w4'], roof: 'r_orange', tint: '#e8a070', col: '#4a2a18', plaque: '陳家' },
  haenam: { ...G0, walls: ['hs_haenam', 'w5'], roof: 'r_dark', tint: '#80b8c8', col: '#1e4a5a', plaque: '海南' },
  cheonsan: { ...G0, walls: ['hs_cheonsan', 'w5'], roof: 'r_dark', tint: '#d0e0f0', col: '#4a5a78', plaque: '天山' },
  jeonjin: { ...G0, walls: ['hs_jeonjin', 'w5'], roof: 'r_dark', tint: '#a0b8a8', col: '#2a3a30', plaque: '全眞' },
  mosan: { ...G0, walls: ['hs_mosan', 'w4'], roof: 'r_dark', tint: '#c8b878', col: '#4a3a1a', plaque: '茅山' },
  jangbaek: { ...G0, walls: ['hs_jangbaek', 'w6'], roof: 'r_dark', tint: '#c0d0d8', col: '#3a4a50', plaque: '長白' },
  pota: { ...G0, walls: ['hs_pota', 'w4'], roof: 'r_dark', tint: '#b8c8e0', col: '#4a5a80', plaque: '普陀' },
};
// 새 벽 그림 이름(그림이 없으면 대신 쓸 것). 실제로 고르는 것은 짓는 때(build 안)
const PVW = (a, b) => [a, b];
export const SPEC = {
  hut_o: { walls: 'w1', roof: 'r_orange', eave: 'e_orange', pitch: 27, wall: 30, lanterns: 2, depth: 22 },
  hut_b: { walls: 'w2', roof: 'r_dark', eave: 'e_dark', pitch: 27, wall: 30 },
  hut_o2: { walls: 'w3', roof: 'r_thatch', eave: 'e_thatch', pitch: 34, wall: 28, thatch: true },
  shop_blue: { walls: PVW('w6', 'w2'), roof: 'r_dark', tint: '#9fb4d8', eave: 'e_dark', pitch: 27, wall: 30, lanterns: 2, depth: 22 },
  shop_green: { walls: 'w1', roof: 'r_dark', tint: '#a8c4a0', eave: 'e_dark', pitch: 27, wall: 30, lanterns: 2, depth: 22 },
  house_red: { walls: PVW('w4', 'w1'), roof: 'r_orange', tint: '#e0a090', eave: 'e_orange', pitch: 28, wall: 32, depth: 22 },
  clay: { walls: 'w3', roof: 'r_mud', eave: 'e_plank', pitch: 24, wall: 28, depth: 22 },
  wood_o: { walls: 'w2', plank: '#7a4e2c', roof: 'r_plank', eave: 'e_plank', pitch: 26, wall: 30, depth: 22 },
  wood_b: { walls: 'w2', plank: '#5a4436', roof: 'r_dark', eave: 'e_dark', pitch: 26, wall: 30, depth: 22 },
  mud: { walls: 'w3', roof: 'r_thatch', eave: 'e_thatch', pitch: 34, wall: 24, thatch: true, depth: 18 },
  straw: { walls: 'w3', plank: '#8a6a44', roof: 'r_thatch', eave: 'e_thatch', pitch: 34, wall: 22, thatch: true, depth: 16 },
  lodge: { walls: PVW('w5', 'w1'), roof: 'r_dark', tint: '#d0c8c0', eave: 'e_dark', pitch: 30, wall: 30, floors: 2, upper: 20, lanterns: 2, depth: 34 },
  hall: { walls: PVW('w4', 'w1'), roof: 'r_dark', tint: '#c8c0b8', eave: 'e_dark', pitch: 32, wall: 42, lanterns: 2, sign: true, signText: '正殿', depth: 36 },
  inn: { walls: 'w1', roof: 'r_dark', tint: '#d8d0c4', eave: 'e_dark', pitch: 28, wall: 30, floors: 2, upper: 21, signText: '客棧', lanterns: 2, sign: true, balcony: true },
};

// 벽 그림(HW1 앞벽 95×55, 옆벽 72×85 도트)에서 떠 낼 자리 [x0, y0, x1, y1](위가 0)
export const CROP = {
  beam: ['front', 10, 0, 85, 4], plaster: ['side', 8, 32, 22, 68], stone: ['side', 6, 71, 66, 85], post: ['side', 0, 32, 6, 70],
  door: ['front', 34, 12, 60, 55], win: ['front', 7, 12, 27, 37],
};
// HW2(법당 w4, 문파 회관 w5, 부잣집 w6)는 그림마다 문과 창 자리가 달라 따로 적는다(도트, 위가 0)
export const CROPS = {
  // hs 시작
  hs_emei: {beam: ['front', 8, 1, 87, 12], door: ['front', 34, 18, 61, 60], win: ['front', 11, 24, 28, 50], plaster: ['side', 11, 51, 21, 70], stone: ['side', 2, 77, 74, 88], post: ['side', 2, 39, 9, 72]},
  hs_gonryun: {beam: ['front', 8, 1, 87, 12], door: ['front', 34, 17, 61, 58], win: ['front', 11, 24, 28, 48], plaster: ['side', 11, 50, 21, 70], stone: ['side', 2, 76, 74, 87], post: ['side', 2, 38, 9, 71]},
  hs_hwasan: {beam: ['front', 8, 1, 87, 12], door: ['front', 34, 17, 61, 58], win: ['front', 11, 24, 28, 48], plaster: ['side', 11, 50, 21, 70], stone: ['side', 2, 76, 74, 87], post: ['side', 2, 38, 9, 71]},
  hs_jongnam: {beam: ['front', 8, 1, 87, 12], door: ['front', 34, 17, 61, 58], win: ['front', 11, 24, 28, 48], plaster: ['side', 11, 50, 21, 70], stone: ['side', 2, 76, 74, 87], post: ['side', 2, 38, 9, 71]},
  hs_shaolin: {beam: ['front', 8, 1, 87, 12], door: ['front', 34, 17, 61, 58], win: ['front', 11, 24, 28, 48], plaster: ['side', 11, 51, 21, 70], stone: ['side', 2, 77, 74, 88], post: ['side', 2, 39, 9, 72]},
  hs_wudang: {beam: ['front', 8, 1, 87, 12], door: ['front', 34, 18, 61, 60], win: ['front', 11, 24, 28, 50], plaster: ['side', 11, 52, 22, 71], stone: ['side', 2, 77, 75, 89], post: ['side', 2, 39, 9, 73]},
  // hs 끝
  w4: { beam: ['front', 10, 6, 85, 15], plaster: ['side', 50, 36, 60, 70], stone: ['side', 0, 75, 72, 86], post: ['side', 2, 40, 10, 70], door: ['front', 14, 17, 81, 57], win: ['front', 15, 18, 26, 40] },
  w5: { beam: ['front', 2, 5, 92, 14], plaster: ['side', 10, 36, 24, 70], stone: ['side', 0, 74, 73, 86], post: ['side', 1, 30, 6, 74], door: ['front', 31, 17, 58, 60], win: ['front', 8, 21, 28, 47] },
  w6: { beam: ['front', 0, 1, 94, 5], plaster: ['side', 2, 34, 24, 72], stone: ['side', 0, 74, 73, 86], post: ['side', 0, 34, 6, 72], door: ['front', 35, 20, 60, 60], win: ['front', 4, 20, 24, 46] },
};
const PART = 1.2, ES = .55, RS = .62;  // ES: 처마 띠(HR2)는 받은 그림의 도트가 굵어 줄인다. RS: 지붕 무늬(HR1)도 기와 한 장이 크게 보여 줄인다  // 벽 부품의 도트 확대: 문이 사람보다 조금 높게(문 43도트 × 1.2 ≈ 사람 48도트 × 1.08)

export function makeBuilder(C) {
  const { T, HS, ZS, DOT, PV, texFrom, matOf, holed, LAMPX } = C, U = PART / DOT;  // U: 도트 한 점의 평면도 길이
  const TEX = new Map(), COL = new Map(), WIN = new Map();
  // 그림 조각 → 되풀이 텍스처
  const crop = (set, part) => {
    const key = set + '/' + part; if (TEX.has(key)) return TEX.get(key); const [f, x0, y0, x1, y1] = (CROPS[set] || CROP)[part], im = PV[set + '_' + f]; if (!im) return null;
    const c = document.createElement('canvas'); c.width = x1 - x0; c.height = y1 - y0; c.getContext('2d').drawImage(im, x0, y0, c.width, c.height, 0, 0, c.width, c.height);
    const t = texFrom(c); t.wrapS = t.wrapT = T.RepeatWrapping; t.anisotropy = C.aniso || 1; t.needsUpdate = true; t.userData.w = c.width; t.userData.h = c.height; TEX.set(key, t); return t;
  };
  const pv = n => { const key = 'pv/' + n; if (TEX.has(key)) return TEX.get(key); const im = PV[n]; if (!im) return null; const c = document.createElement('canvas'); c.width = im.width; c.height = im.height; c.getContext('2d').drawImage(im, 0, 0);
    const t = texFrom(c); t.wrapS = t.wrapT = T.RepeatWrapping; t.anisotropy = C.aniso || 1; t.needsUpdate = true; t.userData.w = im.width; t.userData.h = im.height; TEX.set(key, t); return t; };
  // 칠만 한 재질(그림 없는 부품). 검정은 쓰지 않는다
  const col = (hex) => { if (COL.has(hex)) return COL.get(hex); const m = new T.MeshLambertMaterial({ color: hex }), r = { m, f: holed(new T.MeshLambertMaterial({ color: hex })), d: new T.MeshDepthMaterial({ depthPacking: T.RGBADepthPacking }) }; COL.set(hex, r); return r; };
  // 그림 재질에 색을 곱한 것(지붕 색 바꾸기, 그늘진 안쪽 면)
  const tint = (t, hex) => { const k = t.uuid + hex; if (COL.has(k)) return COL.get(k); const b = matOf(t), r = { m: b.m.clone(), f: b.f.clone(), d: b.d }; r.m.onBeforeCompile = b.m.onBeforeCompile; r.m.customProgramCacheKey = b.m.customProgramCacheKey; r.f.onBeforeCompile = b.f.onBeforeCompile; r.f.customProgramCacheKey = b.f.customProgramCacheKey; r.m.color.set(hex); r.f.color.set(hex); COL.set(k, r); return r; };
  // 밤에 빛나는 창: 창 그림을 스스로 빛나게(세기는 hd2d.js가 시각마다 정한다)
  // 지붕 얼룩: 세상 자리로 낮은 잡음을 만들어 지붕 면의 밝기를 고르지 않게(이끼, 바랜 자리)
  const MOT = new Map(), mottle = (t, hex) => { const k = t.uuid + (hex || ''); if (MOT.has(k)) return MOT.get(k); const b = matOf(t), mk = (bm) => { const m = bm.clone(); if (hex) m.color.set(hex);
      m.onBeforeCompile = sh => { bm.onBeforeCompile(sh); sh.vertexShader = 'varying vec3 vMw;\n' + sh.vertexShader.replace('#include <project_vertex>', '#include <project_vertex>\n vMw = (modelMatrix * vec4(transformed, 1.)).xyz;');
        sh.fragmentShader = 'varying vec3 vMw;\nfloat h21(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }\nfloat vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3. - 2. * f); return mix(mix(h21(i), h21(i + vec2(1, 0)), f.x), mix(h21(i + vec2(0, 1)), h21(i + vec2(1)), f.x), f.y); }\n' +
          sh.fragmentShader.replace('#include <map_fragment>', '#include <map_fragment>\n { diffuseColor.rgb = pow(diffuseColor.rgb, vec3(1.45)) * 1.55;  // 기와 골을 또렷하게: 무늬 안의 밝고 어두운 차이를 키운다\n vec2 q = floor(vMw.xz / 1.2) * 1.2; float n = vn(q / 9.) * .65 + vn(q / 3.5) * .35; diffuseColor.rgb *= .66 + n * .5; diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb * vec3(.85, 1.02, .8), smoothstep(.62, .8, vn(q / 6. + 7.))); }'); };
      m.customProgramCacheKey = () => (bm.customProgramCacheKey ? bm.customProgramCacheKey() : '') + '-mot'; return m; };
    const r = { m: mk(b.m), f: mk(b.f), d: b.d }; MOT.set(k, r); return r; };
  // 현판 글씨: 도트 굵기(U)대로 작은 그림에 쓰고 키운다. 짙은 나무 바탕에 금빛 글자
  const signTex = (txt, w, h, vert) => { if (!txt) return null; const k = 'sign/' + txt + (vert ? '/v' : ''); if (TEX.has(k)) return TEX.get(k); const c = document.createElement('canvas'); c.width = Math.round(w / U); c.height = Math.round(h / U); const x = c.getContext('2d');
    x.fillStyle = '#3a2416'; x.fillRect(0, 0, c.width, c.height); x.fillStyle = '#7a5226'; x.strokeStyle = '#7a5226'; x.strokeRect(.5, .5, c.width - 1, c.height - 1);
    const chars = vert ? [...txt] : [txt], fs = vert ? Math.min(c.width - 3, (c.height - 4) / chars.length - 1) : c.height - 4; x.font = `bold ${fs}px serif`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillStyle = '#f0c45a';
    chars.forEach((ch, i) => x.fillText(ch, c.width / 2, vert ? (i + .5) * (c.height / chars.length) + .5 : c.height / 2 + .5));
    const d = x.getImageData(0, 0, c.width, c.height); for (let i = 0; i < d.data.length; i += 4) if (d.data[i] > 150) { d.data[i] = 236; d.data[i + 1] = 190; d.data[i + 2] = 88; } else if (d.data[i] > 95) { d.data[i] = 122; d.data[i + 1] = 82; d.data[i + 2] = 38; } x.putImageData(d, 0, 0);  // 글자 둘레를 두 색으로 끊어 도트처럼
    const t = texFrom(c, { mips: false }); t.magFilter = T.NearestFilter; TEX.set(k, t); return t; };
  // 처마 그늘과 벽 밑 접촉 그늘: 벽 바로 앞에 세로로 옅어지는 어두운 띠를 붙인다(그림자 지도가 못 만드는 북쪽 벽에도)
  let AOB = null; const aoBand = () => { if (AOB) return AOB; const c = document.createElement('canvas'); c.width = 4; c.height = 64; const x = c.getContext('2d'), g = x.createLinearGradient(0, 0, 0, 64);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,1)'); x.fillStyle = g; x.fillRect(0, 0, 4, 64); const t = new T.CanvasTexture(c);
    const mk = () => new T.MeshBasicMaterial({ color: '#160d08', alphaMap: t, transparent: true, depthWrite: false, opacity: .72 }); AOB = { m: mk(), f: mk(), d: null, noCast: true }; return AOB; };
  let LANT = null; const lanternMat = () => { if (LANT) return LANT; const mk = () => new T.MeshLambertMaterial({ color: '#c8372a', emissive: '#ff5a2a', emissiveIntensity: 0 }); LANT = { m: mk(), f: holed(mk()), d: new T.MeshDepthMaterial({ depthPacking: T.RGBADepthPacking }) }; C.glow.push(LANT.m, LANT.f); return LANT; };
  const winMat = t => { if (WIN.has(t)) return WIN.get(t); const mk = () => { const m = new T.MeshLambertMaterial({ map: t, emissive: '#ffb45a', emissiveMap: t, emissiveIntensity: 0 }); return m; };
    const r = { m: mk(), f: holed(mk()), d: new T.MeshDepthMaterial({ depthPacking: T.RGBADepthPacking }) }; WIN.set(t, r); C.glow.push(r.m, r.f); return r; };

  // 판자벽: 받은 벽 그림에 없어서 도트로 그린다(세로 판자, 판자마다 밝기 차, 틈, 옹이)
  const plank = hex => { const k = 'plank/' + hex; if (TEX.has(k)) return TEX.get(k); const c = document.createElement('canvas'); c.width = 24; c.height = 36; const x = c.getContext('2d'), b = new T.Color(hex);
    const rgb = (f) => `rgb(${b.r * 255 * f | 0},${b.g * 255 * f | 0},${b.b * 255 * f | 0})`; let sd = 7; const R = () => (sd = (sd * 9301 + 49297) % 233280) / 233280;
    for (let i = 0; i < 4; i++) { x.fillStyle = rgb(.82 + R() * .3); x.fillRect(i * 6, 0, 6, 36); x.fillStyle = rgb(.5); x.fillRect(i * 6, 0, 1, 36); x.fillStyle = rgb(1.12); x.fillRect(i * 6 + 1, 0, 1, 36);
      for (let j = 0; j < 5; j++) { x.fillStyle = rgb(.7 + R() * .2); x.fillRect(i * 6 + 2 + (R() * 3 | 0), R() * 36 | 0, 1, 3 + (R() * 5 | 0)); }
      if (R() < .6) { x.fillStyle = rgb(.45); x.fillRect(i * 6 + 2, R() * 30 | 0, 2, 2); } }
    x.fillStyle = rgb(.6); x.fillRect(0, 17, 24, 1);
    const t = texFrom(c); t.wrapS = t.wrapT = T.RepeatWrapping; t.anisotropy = C.aniso || 1; t.needsUpdate = true; t.userData.w = 24; t.userData.h = 36; TEX.set(k, t); return t; };
  return function build(s, st, spec) {
    if (s.grand && GRAND[s.grand]) spec = { ...spec, ...GRAND[s.grand] };
    const set = Array.isArray(spec.walls) ? (C.PV[spec.walls[0] + '_front'] ? spec.walls[0] : spec.walls[1]) : spec.walls, P = { plaster: spec.plank ? plank(spec.plank) : crop(set, 'plaster'), stone: crop(set, 'stone'), post: crop(set, 'post'), beam: crop(set, 'beam'), door: crop(set, 'door'), win: crop(set, 'win') };
    if (!P.plaster) return null;
    const roofT = pv(spec.roof), eaveT = pv(spec.eave), ridgeT = pv(spec.thatch ? 'e_thatch' : 'e_ridge');
    // 바닥: 막힘 상자의 앞쪽 끝과 좌우를 그대로, 깊이는 막힘 상자(뒤는 못 가는 곳이라 조금 얕아도 된다)
    const sc = s.sc || 1, yb = s.y + st[6] * sc, yf = yb + st[8] * sc, wd = spec.widen || 1, xc = s.x + (st[5] + st[7] / 2) * sc, x0 = xc - st[7] * sc / 2 * wd, x1 = xc + st[7] * sc / 2 * wd;  // 전각은 좌우로 조금 넓게 보인다(막힘은 그대로)
    const zf = yf * ZS, zb = Math.max(yb * ZS, zf - (spec.depth || 26)), zm = (zf + zb) / 2, cw = x1 - x0;  // 보이는 깊이는 줄인다(깊은 상자는 지붕만 넓어진다). 뒤쪽 남는 땅은 원래 못 가는 곳
    const g = new T.Group(); g.userData = { s, house: true };
    const B = new Map();  // 재질마다 면을 모아 한 덩어리로 합친다
    const put = (M, P4, UV) => { if (!B.has(M)) B.set(M, []); B.get(M).push(C.face(P4, UV)); };
    const H = h => h * HS;  // 높이(평면도 점) → 세상
    // 상자: 여섯 면. 무늬는 세상 길이를 도트 크기로 나눠 되풀이(옆면 세로는 HS, 윗면 깊이는 ZS를 되돌린다)
    const box = (ax, ay, az, bx, by, bz, M, t, o = {}) => {
      const tw = t ? t.userData.w * U * (o.ts || 1) : 1, th = t ? t.userData.h * U * (o.ts || 1) : 1, uX = (bx - ax) / tw, uZ = (bz - az) / ZS / tw, vY = (by - ay) / HS / th, vZ = (bz - az) / ZS / th;
      const S = o.side || M, Tp = o.top || M;
      if (!o.noFront) put(M, [[ax, ay, bz], [bx, ay, bz], [bx, by, bz], [ax, by, bz]], [[0, 0], [uX, 0], [uX, vY], [0, vY]]);
      if (!o.noBack) put(S, [[bx, ay, az], [ax, ay, az], [ax, by, az], [bx, by, az]], [[0, 0], [uX, 0], [uX, vY], [0, vY]]);
      put(S, [[ax, ay, az], [ax, ay, bz], [ax, by, bz], [ax, by, az]], [[0, 0], [uZ, 0], [uZ, vY], [0, vY]]);
      put(S, [[bx, ay, bz], [bx, ay, az], [bx, by, az], [bx, by, bz]], [[0, 0], [uZ, 0], [uZ, vY], [0, vY]]);
      if (!o.noTop) put(Tp, [[ax, by, bz], [bx, by, bz], [bx, by, az], [ax, by, az]], [[0, 0], [uX, 0], [uX, vZ], [0, vZ]]);
    };
    // 벽 판: 시작 모서리 O, 가로 방향 a(단위), 길이 L, 높이 h(세상). holes: [u0, u1, v0, v1](세상, 판 안 좌표)
    // 뚫린 자리 둘레에는 안쪽 면(어두운 회벽)을 세우고, 문과 창은 벽보다 dr만큼 안에 단다
    const wallPanel = (O, a, n, L, h, holes, MP, tP, inset) => {
      const pt = (u, v, d = 0) => [O[0] + a[0] * u - n[0] * d, O[1] + v, O[2] + a[2] * u - n[2] * d], tw = tP.userData.w * U, th = tP.userData.h * U * HS;
      const quad = (M, u0, u1, v0, v1, d = 0) => put(M, [pt(u0, v0, d), pt(u1, v0, d), pt(u1, v1, d), pt(u0, v1, d)], [[u0 / tw, v0 / th], [u1 / tw, v0 / th], [u1 / tw, v1 / th], [u0 / tw, v1 / th]]);
      const xs = [...new Set([0, L, ...holes.flatMap(q => [q[0], q[1]])])].sort((p, q) => p - q);
      for (let i = 0; i < xs.length - 1; i++) { const u0 = xs[i], u1 = xs[i + 1], um = (u0 + u1) / 2, hs = holes.filter(q => q[0] <= um && q[1] >= um).sort((p, q) => p[2] - q[2]); let v = 0;
        for (const q of hs) { if (q[2] > v) quad(MP, u0, u1, v, q[2]); v = q[3]; } if (v < h) quad(MP, u0, u1, v, h); }
      const IN = tint(tP, '#8a7a68'), dr = 1.4;
      for (const q of holes) { const [u0, u1, v0, v1] = q;  // 안쪽 면: 위, 왼, 오른, (아래는 창만)
        put(IN, [pt(u0, v1, dr), pt(u1, v1, dr), pt(u1, v1, 0), pt(u0, v1, 0)], [[0, 0], [1, 0], [1, .2], [0, .2]]);  // 위(아래를 본다)
        put(IN, [pt(u0, v0, 0), pt(u0, v0, dr), pt(u0, v1, dr), pt(u0, v1, 0)], [[0, 0], [.2, 0], [.2, 1], [0, 1]]);  // 왼
        put(IN, [pt(u1, v0, dr), pt(u1, v0, 0), pt(u1, v1, 0), pt(u1, v1, dr)], [[0, 0], [.2, 0], [.2, 1], [0, 1]]);  // 오른
        if (v0 > .1) put(IN, [pt(u0, v0, 0), pt(u1, v0, 0), pt(u1, v0, dr), pt(u0, v0, dr)], [[0, 0], [1, 0], [1, .2], [0, .2]]);  // 창턱(위를 본다)
        put(q[4], [pt(u0, v0, dr), pt(u1, v0, dr), pt(u1, v1, dr), pt(u0, v1, dr)], [[0, 0], [1, 0], [1, 1], [0, 1]]); }
    };
    const MP = matOf(P.plaster), MS = matOf(P.stone), MPost = matOf(P.post), MBeam = matOf(P.beam), MDoor = matOf(P.door), MWin = winMat(P.win);
    const MStoneTop = tint(P.stone, '#b8ae9c'), MWood = col('#4a3122'), MWoodL = col('#6b4a30'), MSoff = col('#3b2a1f');
    // 1) 돌 기단: 벽보다 사방 2점 넓고 3점 높다
    const [pb, ph] = spec.plat || [2, 3], yP = H(ph), porch = spec.porch || 0;  // porch: 앞 기둥줄. 벽을 그만큼 뒤로 들이고 기둥은 원래 벽 자리에
    box(x0 - pb, 0, zb - pb * ZS, x1 + pb, yP, zf + pb * ZS, MS, P.stone, { top: MStoneTop });
    // 2) 층마다 벽
    const floors = spec.floors || 1, dW = P.door.userData.w * U, dH = P.door.userData.h * U, wW = P.win.userData.w * U, wH = P.win.userData.h * U;
    const doorX = s.x + st[3] * sc / 2 + (s.doorDx || 0), postW = 2.2, postD = 1.1 * ZS;
    let yBase = yP, zF = zf - porch, zB = zb, X0 = x0, X1 = x1;
    for (let fl = 0; fl < floors; fl++) {
      const hh = H(fl === 0 ? spec.wall - ph : spec.upper), up = fl > 0;
      // 앞벽: 아래층은 가운데 문, 문 양쪽 칸에 창. 위층은 창만 고르게
      const holes = [], L = X1 - X0, mkWin = (c) => holes.push([c - wW / 2 - X0, c + wW / 2 - X0, H(up ? 4 : 7), H(up ? 4 : 7) + H(wH), MWin]);
      if (!up) { holes.push([doorX - dW / 2 - X0, doorX + dW / 2 - X0, 0, H(dH), MDoor]);
        for (const [a, b] of [[X0 + postW, doorX - dW / 2 - postW], [doorX + dW / 2 + postW, X1 - postW]]) { const sp = b - a; if (sp >= wW * 2 + 10) { mkWin(a + sp * .27); mkWin(a + sp * .73); } else if (sp >= wW + 3) mkWin((a + b) / 2); } }
      else { const n = Math.max(1, Math.floor((L - 6) / (wW + 7))); for (let i = 0; i < n; i++) mkWin(X0 + L * (i + .5) / n); }
      wallPanel([X0, yBase, zF], [1, 0, 0], [0, 0, 1], L, hh, holes, MP, P.plaster);
      // 네 벽 모두 위쪽에 처마 그늘, 아래쪽에 접촉 그늘
      for (const [O, a, n, Lw] of [[[X0, yBase, zF], [1, 0, 0], [0, 0, 1], L], [[X0, yBase, zB], [0, 0, 1], [-1, 0, 0], zF - zB], [[X1, yBase, zF], [0, 0, -1], [1, 0, 0], zF - zB], [[X1, yBase, zB], [-1, 0, 0], [0, 0, -1], L]]) {
        const pt = (u, v) => [O[0] + a[0] * u + n[0] * .12, O[1] + v, O[2] + a[2] * u + n[2] * .12], th = H(up ? 7 : 10), bh = H(2.6);
        put(aoBand(), [pt(0, hh - th), pt(Lw, hh - th), pt(Lw, hh), pt(0, hh)], [[0, 1], [1, 1], [1, 0], [0, 0]]);  // 그림 v=0이 가장 짙다
        put(aoBand(), [pt(0, 0), pt(Lw, 0), pt(Lw, bh), pt(0, bh)], [[0, .4], [1, .4], [1, 1], [0, 1]]); }
      // 옆벽: 가운데 창 하나(깊이가 넉넉하면), 뒷벽: 창 없음
      const D = zF - zB, wy = H(up ? 4 : 7), sh = D >= wW + 5 ? [[D / 2 - wW / 2, D / 2 + wW / 2, wy, wy + H(wH), MWin]] : [];
      wallPanel([X0, yBase, zB], [0, 0, 1], [-1, 0, 0], D, hh, sh, MP, P.plaster);
      wallPanel([X1, yBase, zF], [0, 0, -1], [1, 0, 0], D, hh, sh, MP, P.plaster);
      const bk = []; { const n = Math.max(1, Math.floor((L - 8) / (wW + 14))); for (let i = 0; i < n; i++) { const c = L * (i + .5) / n; bk.push([c - wW / 2, c + wW / 2, wy, wy + H(wH), MWin]); } }  // 뒷벽에도 창
      wallPanel([X1, yBase, zB], [-1, 0, 0], [0, 0, -1], L, hh, bk, MP, P.plaster);
      // 기둥: 네 귀퉁이와 문 양옆. 벽 밖으로 조금 나온다
      const yt = yBase + hh, posts = [[X0, zF], [X1, zF], [X0, zB], [X1, zB]]; if (!up) posts.push([doorX - dW / 2 - postW / 2, zF], [doorX + dW / 2 + postW / 2, zF]);
      else { const ws = holes.map(q => q[0] + X0).sort((a, b) => a - b); for (let i = 1; i < ws.length; i++) posts.push([(ws[i - 1] + wW + ws[i]) / 2, zF]); }  // 위층: 창 사이마다 기둥
      { const n = Math.round(L / 18); for (let i = 1; i < n; i++) posts.push([X0 + L * i / n, zB]); }  // 뒷벽: 18점마다 기둥
      for (const [x, z] of posts) box(x - postW / 2, yBase, z - postD, x + postW / 2, yt, z + postD * (z === zF ? 1 : .4), MPost, P.post, { top: MWood });
      if (!up && porch && spec.col) {  // 앞 기둥줄: 둥근 맛이 나게 모서리를 깎은 붉은(문파 빛) 기둥, 금빛 머리, 돌 받침. 위에 들보
        const zc = zF + porch - 1.4, n = Math.max(2, Math.round((X1 - X0) / 13)), CM = col(spec.col), CK = col(spec.gold ? '#c89a30' : '#7a6a50');
        for (let i = 0; i <= n; i++) { const x = X0 + (X1 - X0) * i / n; if (Math.abs(x - doorX) < dW / 2 + 1) continue;
          box(x - 1.9, yBase, zc - 1.9, x + 1.9, yBase + H(1.2), zc + 1.9, MS, P.stone, { top: MStoneTop }); box(x - 1.4, yBase + H(1.2), zc - 1.4, x + 1.4, yt - H(1.6), zc + 1.4, CM, null, {});
          box(x - .9, yBase + H(1.2), zc + 1.4, x + .9, yt - H(1.6), zc + 1.9, CM, null, {}); box(x - 1.7, yt - H(1.6), zc - 1.7, x + 1.7, yt, zc + 1.7, CK, null, {}); }
        box(X0 - 2, yt - H(3), zc - 1.6, X1 + 2, yt, zc + 1.6, MBeam, P.beam, { side: MWood, top: MWood }); }
      if (spec.plaque && (fl === floors - 1)) {  // 가로 현판: 맨 위층 앞벽 가운데(한 층이면 문 위)
        const w = Math.min(L * .5, 6 + spec.plaque.length * 5), h = 6.5, y0 = up ? yBase + hh * .42 : yBase + H(dH + 1.2), zz = zF + (up ? 1.9 : porch + .2);
        box(doorX - w / 2 - .8, y0 - H(.8), zz - 1.2, doorX + w / 2 + .8, y0 + H(h + .8), zz, col('#2a1a10'), null, {});
        const ST = signTex(spec.plaque, w, h, false); if (ST) put(matOf(ST), [[doorX - w / 2, y0, zz + .05], [doorX + w / 2, y0, zz + .05], [doorX + w / 2, y0 + H(h), zz + .05], [doorX - w / 2, y0 + H(h), zz + .05]], [[0, 0], [1, 0], [1, 1], [0, 1]]); }
      if (zF - zB > 22) for (const x of [X0, X1]) box(x - postW / 2 - .5, yBase, (zF + zB) / 2 - postW / 2, x + postW / 2 + .5, yt, (zF + zB) / 2 + postW / 2, MPost, P.post, { top: MWood });  // 옆벽 가운데 기둥
      // 옆벽과 뒷벽 위 도리
      for (const x of [X0, X1]) box(x - (x === X0 ? 1.2 : -.2), yt - H(2.2), zB - .5, x + (x === X0 ? .2 : 1.2), yt, zF + .5, MBeam, P.beam, { side: MWood, top: MWood });
      // 도리: 벽 위를 두르는 가로 들보
      const bh = H(2.2), bd = 1.3 * ZS;
      box(X0 - 1.4, yt - bh, zF - .2, X1 + 1.4, yt, zF + bd, MBeam, P.beam, { side: MWood, top: MWood, noBack: true });
      box(X0 - 1.4, yt - bh, zB - bd, X1 + 1.4, yt, zB + .2, MWood, null, { noFront: true });
      // 돌계단(아래층 문 앞)
      if (!up) { const sw = spec.plat ? dW / 2 + 7 : dW / 2 + 2, n = spec.plat ? 3 : 1;  // 돌계단: 전각은 넓은 세 단
        for (let i = 0; i < n; i++) box(doorX - sw, 0, zf + pb * ZS, doorX + sw, H(ph * (n - i) / (n + 1)), zf + (pb + 2.2 * (i + 1)) * ZS, MS, P.stone, { top: MStoneTop }); }
      // 등롱: 문 양옆 기둥에. 밤에 불빛 자리
      if (!up && spec.lanterns) for (const sgn of spec.sign ? [-1] : [-1, 1]) { const lx = doorX + sgn * (dW / 2 + postW + 2.4), ly = yBase + H(dH * .78);
        const LR = lanternMat(); box(lx - .5, ly, zF + .6, lx + .5, ly + H(1.2), zF + 1.4, MWood, null, {});  // 고리
        box(lx - 1.1, ly - H(.7), zF + .9, lx + 1.1, ly, zF + 3.1, MWood, null, {}); box(lx - 1.6, ly - H(3.6), zF + .4, lx + 1.6, ly - H(.7), zF + 3.6, LR, null, {}); box(lx - 1.1, ly - H(4.3), zF + .9, lx + 1.1, ly - H(3.6), zF + 3.1, MWood, null, {});
        box(lx - .3, ly - H(5.6), zF + 1.8, lx + .3, ly - H(4.3), zF + 2.2, col('#d4a63a'), null, {});  // 술
        LAMPX.push([lx, (zF + 4) / ZS, (ly - H(2)) / HS]); }
      // 현판: 문 위 도리 아래
      if (!up && spec.sign) {  // 세로 현판: 문 오른쪽 기둥 옆에 건다(처마에 가리지 않게 낮게)
        const sx = doorX + dW / 2 + postW + 3.4, w = 4.6, h = 15, y0 = yBase + H(4);
        box(sx - w / 2 - .5, y0 - H(.5), zF + .5, sx + w / 2 + .5, y0 + H(h + .5), zF + 1.7, col('#2f2016'), null, {});
        const ST = signTex(spec.signText || '', w, h, true); if (ST) put(matOf(ST), [[sx - w / 2, y0, zF + 1.75], [sx + w / 2, y0, zF + 1.75], [sx + w / 2, y0 + H(h), zF + 1.75], [sx - w / 2, y0 + H(h), zF + 1.75]], [[0, 0], [1, 0], [1, 1], [0, 1]]); }
      yBase = yt;
      if (fl < floors - 1) {  // 중간 처마와 위층(조금 들여 짓고 앞에 난간)
        const ov = 6 + porch, ovx = 4 + (spec.plat ? 2 : 0); roof(X0 - ovx, X1 + ovx, zF + ov, zF - 1, yt + 1.3 * ZS * Math.tan(22 * Math.PI / 180) + H(.6), 22, false, true);
        box(X0 - .6, yt, zB - .6, X1 + .6, yt + H(1.6), zF + .6, MBeam, P.beam, { side: MBeam, top: MWood });  // 층 사이를 메우는 바닥 띠(옆과 뒤에서 비치지 않게)
        const inset = 4; zF -= inset; zB += .5 * ZS; X0 += 2; X1 -= 2; yBase = yt + H(1.5);
        if (spec.balcony) { const zr = zF + inset - 1.2, rh = H(6); box(X0 - 2, yBase - H(.6), zF, X1 + 2, yBase, zr + 1, MWoodL, null, {});  // 난간 바닥
          for (let x = X0 - 1; x <= X1 + 1.01; x += (X1 - X0 + 2) / Math.round((X1 - X0 + 2) / 6)) box(x - .6, yBase, zr - .6, x + .6, yBase + rh, zr + .6, MWood, null, {});
          box(X0 - 2, yBase + rh - H(1), zr - .9, X1 + 2, yBase + rh, zr + .9, MWoodL, null, {}); box(X0 - 2, yBase + H(2), zr - .5, X1 + 2, yBase + H(2.8), zr + .5, MWood, null, {}); }
      }
    }
    // 3) 지붕: 앞뒤 두 면, 처마는 벽 밖으로 사람 반 키(7.5점), 옆으로 5점
    function roof(rx0, rx1, zE, zR, yW, pitch, gable, lean) {  // lean: 한쪽만 내린 지붕(중간 처마). zE 처마 끝, zR 용마루 쪽 끝, yW 벽 윗선
      const tp = Math.tan(pitch * Math.PI / 180), th = H(1.6), eh = eaveT ? eaveT.userData.h * U * HS * ES : H(5);
      const halfs = lean ? [[zE, zR]] : [[zE, zm], [zB - (zE - zF), zm]], RM = mottle(roofT, spec.tint), tw = roofT.userData.w * U * RS, tl = roofT.userData.h * U * RS;
      const ys = (za, front) => yW - Math.abs(za - (lean ? zR : front ? zF : zB)) * tp;  // 처마 끝은 벽 윗선보다 (내민 길이 × 물매)만큼 낮다
      let yr = 0;
      for (const [za, zr] of halfs) {
        const prof = spec.thatch ? [[0, 1], [.62, 1], [.86, .72], [1, .38]] : [[0, 1], [1, 1]];  // 초가는 꼭대기가 둥글다(물매가 점점 눕는다)
        let z0 = za, y0 = ys(za, zr < za), v = 0; const dz = zr - za;
        for (let i = 1; i < prof.length; i++) { const f0 = prof[i - 1][0], f1 = prof[i][0], k = prof[i][1], z1 = za + dz * f1, y1 = y0 + Math.abs(z1 - z0) * tp * k, sl = Math.hypot(z1 - z0, y1 - y0), v1 = v + sl / tl;
          const front = zr < za; const A = [rx0, y0, z0], Bp = [rx1, y0, z0], Cp = [rx1, y1, z1], Dp = [rx0, y1, z1];
          put(RM, front ? [A, Bp, Cp, Dp] : [Bp, A, Dp, Cp], [[0, v], [(rx1 - rx0) / tw, v], [(rx1 - rx0) / tw, v1], [0, v1]]);
          // 밑면(처마 밑): 지붕 면에서 두께만큼 아래, 처마 쪽 첫 마디만
          if (i === 1) put(MSoff, front ? [[rx1, y0 - th, z0], [rx0, y0 - th, z0], [rx0, y1 - th, z1], [rx1, y1 - th, z1]] : [[rx0, y0 - th, z0], [rx1, y0 - th, z0], [rx1, y1 - th, z1], [rx0, y1 - th, z1]], [[0, 0], [1, 0], [1, 1], [0, 1]]);
          // 박공판: 지붕 옆 끝의 두께
          for (const [x, sg] of [[rx0, -1], [rx1, 1]]) { const p = [[x, y0 - th, z0], [x, y1 - th, z1], [x, y1, z1], [x, y0, z0]]; put(MWood, (sg > 0) === front ? p : [p[1], p[0], p[3], p[2]], [[0, 0], [1, 0], [1, 1], [0, 1]]); }
          z0 = z1; y0 = y1; v = v1; }
        yr = y0;
        // 처마 끝: 두께 면에 처마 띠(막새, 짚 띠)를 드리운다
        const front = zr < za, y = ys(za, front), U2 = (rx1 - rx0) / (eaveT ? eaveT.userData.w * U * ES : 10);
        if (eaveT) { const M = matOf(eaveT), zz = za + (front ? .3 : -.3), P4 = [[rx0, y - eh * .7, zz], [rx1, y - eh * .7, zz], [rx1, y + eh * .3, zz], [rx0, y + eh * .3, zz]]; put(M, front ? P4 : [P4[1], P4[0], P4[3], P4[2]], [[0, 0], [U2, 0], [U2, 1], [0, 1]]); }
      }
      if (lean) return;
      // 박공: 옆벽 위 세모(회벽 무늬 되풀이)와 그 둘레 박공판
      const tw2 = P.plaster.userData.w * U, th2 = P.plaster.userData.h * U * HS;
      for (const [x, sg] of [[X0, -1], [X1, 1]]) { const a = [x, yW, sg < 0 ? zB : zF], b = [x, yW, sg < 0 ? zF : zB], c = [x, yr, zm], D = zF - zB;
        put(MP, [a, b, c], [[0, 0], [D / tw2, 0], [D / 2 / tw2, (yr - yW) / th2]]); }
      // 용마루: 지붕 꼭대기를 덮는 띠
      const rh = ridgeT ? ridgeT.userData.h * U * HS * ES : H(4), U3 = (rx1 - rx0 + 2) / (ridgeT ? ridgeT.userData.w * U : 10), RG = ridgeT ? matOf(ridgeT) : MWood;
      box(rx0 - 1, yr - rh * .5, zm - 1.7, rx1 + 1, yr + rh * .5, zm + 1.7, RG, ridgeT, { ts: ES, side: spec.thatch ? tint(roofT, '#8a7048') : col('#3d3a36'), top: spec.thatch ? tint(roofT, '#8a7048') : col('#4a4640') });
      if (!spec.thatch) for (const [x, sg] of [[rx0 - 1, 1], [rx1 + 1, -1]]) {  // 용마루 끝을 조금 들어 올린다(치미)
        box(x - (sg > 0 ? 0 : 2.2), yr - rh * .5, zm - 1.6, x + (sg > 0 ? 2.2 : 0), yr + rh * .7, zm + 1.6, col(spec.gold ? '#c09030' : '#55555a'), null, { top: col(spec.gold ? '#e0b850' : '#66666a') });
        box(x - (sg > 0 ? .8 : 1.4), yr + rh * .7, zm - 1.1, x + (sg > 0 ? 1.4 : .8), yr + rh * 1.0, zm + 1.1, col(spec.gold ? '#c09030' : '#55555a'), null, { top: col(spec.gold ? '#e0b850' : '#66666a') }); }
      return yr;
    }
    const ov = 7.5 + (floors > 1 ? 0 : porch), ovx = 5 + (spec.plat ? 2 : 0), yW = yBase + 1.3 * ZS * Math.tan(spec.pitch * Math.PI / 180) + H(.6);  // 지붕은 도리 위에 얹는다(도리와 기둥 머리가 지붕을 뚫지 않게)  // 처마는 사람 반 키(세상 길이)
    roof(X0 - ovx, X1 + ovx, zF + ov, zm, yW, spec.pitch, true, false);
    // 땅과 닿는 곳의 그늘(접촉 그늘): 기단 둘레에 어두운 띠
    if (C.AO) { const o = new T.Mesh(new T.PlaneGeometry(cw + 14, (zf - zb) + 7 * ZS + 6), new T.MeshBasicMaterial({ map: C.AO, transparent: true, depthWrite: false, fog: false, opacity: .8 })); o.rotation.x = -Math.PI / 2; o.position.set((x0 + x1) / 2, .2, zm); o.renderOrder = 1; o.userData = { owner: g, flat: true }; g.add(o); }
    // 모은 면을 재질마다 하나로
    for (const [M, list] of B) {
      const n = list.reduce((a, q) => a + q.attributes.position.count, 0), pos = new Float32Array(n * 3), uv = new Float32Array(n * 2), nor = new Float32Array(n * 3); let k = 0;
      for (const q of list) { pos.set(q.attributes.position.array, k * 3); uv.set(q.attributes.uv.array, k * 2); nor.set(q.attributes.normal.array, k * 3); k += q.attributes.position.count; q.dispose(); }
      const geo = new T.BufferGeometry(); geo.setAttribute('position', new T.BufferAttribute(pos, 3)); geo.setAttribute('uv', new T.BufferAttribute(uv, 2)); geo.setAttribute('normal', new T.BufferAttribute(nor, 3)); geo.computeBoundingSphere();
      const o = new T.Mesh(geo, M.m); if (M.d) o.customDepthMaterial = M.d; o.castShadow = !M.noCast; o.receiveShadow = !M.noCast; if (M.noCast) o.renderOrder = 2; o.userData = { M, t: null, owner: g }; g.add(o);
    }
    return g;
  };
}
