# 블렌더(bpy)로 전각 모형을 짓는다: 휜 지붕(무전, 겹처마), 처마 끝 들림, 둥근 기둥, 기단과 계단, 살창 문, 두공 줄, 현판, 용마루와 치미.
# 길이는 평면도 점(사람 키 15점). 게임(js/hd2d.js)에서 (1, HS, ZS)로 늘려 세운다. 앞면은 y=0, 뒤로 +y(glTF로 나가면 z=0에서 -z로).
# 그림은 받은 도트 그림(assets/hd2d/preview)을 잘라 쓰고 '가장 가까운 점'으로 읽게 둔다(도트가 뭉개지지 않게).
# 쓰는 법: python3 tools/blender/hall.py [이름]   → assets/hd2d/models/<이름>.glb   (이름: daewoong)
import bpy, bmesh, math, os, sys
from mathutils import Vector
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
PV = os.path.join(ROOT, 'assets', 'hd2d', 'preview'); OUT = os.path.join(ROOT, 'assets', 'hd2d', 'models'); TMP = '/tmp/bl_tex'
os.makedirs(OUT, exist_ok=True); os.makedirs(TMP, exist_ok=True)
TX = 2.67  # 벽 도트: 평면도 1점에 그림 2.67점(사람 도트 48/15를 1.2배 크게 그린 벽 그림과 같은 굵기)

# 종류마다 설명서
HALLS = {
    'daewoong': dict(W=84, D=46, plat=(7, 6), colH=30, cols=6, skirtOut=9, upW=64, upD=34, upH=16, roofH=24, ridgeLen=.42,
                     roof=('r_orange', (1.15, .86, .32)), wall='w4', colC=(.62, .12, .09), plaque='大雄寶殿', gold=True),
}

def crop(name, box, tint=None, key=None):
    im = Image.open(os.path.join(PV, name + '.webp')).convert('RGBA')
    if box: im = im.crop(box)
    if tint:  # 밝기만 남기고 새 빛깔로 칠한다(tint: 밝기에 곱할 빛깔, 0~1.4)
        px = im.load()
        for y in range(im.height):
            for x in range(im.width):
                r, g, b, a = px[x, y]; l = r * .3 + g * .59 + b * .11; px[x, y] = tuple(min(255, int(l * c * 1.5 + 12 * c)) for c in tint) + (a,)
    p = os.path.join(TMP, (key or name) + '.png'); im.save(p); return p, im.size

def plaque_png(text, w, h):
    W, H = int(w * TX), int(h * TX); im = Image.new('RGBA', (W, H), (52, 30, 18, 255)); d = ImageDraw.Draw(im)
    d.rectangle([0, 0, W - 1, H - 1], outline=(176, 128, 50, 255)); d.rectangle([1, 1, W - 2, H - 2], outline=(96, 60, 28, 255))
    f = ImageFont.truetype('/usr/share/fonts/opentype/noto/NotoSerifCJK-Bold.ttc', H - 6); n = len(text); cw = (W - 6) / n
    for i, ch in enumerate(text): d.text((3 + cw * (i + .5), H / 2 + .5), ch, font=f, fill=(236, 190, 88, 255), anchor='mm')
    px = im.load()
    for y in range(H):  # 두 빛으로 끊어 도트처럼
        for x in range(W):
            r, g, b, a = px[x, y]
            if r > 150 and g > 110: px[x, y] = (236, 190, 88, 255)
            elif r > 80 and g > 50 and (x > 1 and y > 1 and x < W - 2 and y < H - 2): px[x, y] = (122, 82, 38, 255)
    p = os.path.join(TMP, 'plaque.png'); im.save(p); return p

MATS = {}
def mat(key, path=None, color=(1, 1, 1), size=None):
    if key in MATS: return MATS[key]
    m = bpy.data.materials.new(key); m.use_nodes = True; nt = m.node_tree; bs = nt.nodes['Principled BSDF']
    bs.inputs['Roughness'].default_value = 1; bs.inputs['Metallic'].default_value = 0
    if path:
        tn = nt.nodes.new('ShaderNodeTexImage'); tn.image = bpy.data.images.load(path); tn.interpolation = 'Closest'; tn.extension = 'REPEAT'
        nt.links.new(tn.outputs['Color'], bs.inputs['Base Color']); nt.links.new(tn.outputs['Alpha'], bs.inputs['Alpha'])
    else: bs.inputs['Base Color'].default_value = (*color, 1)
    MATS[key] = (m, size); return MATS[key]

# 그물 모으기: 재질마다 bmesh 하나
BM = {}
def bm_for(key):
    if key not in BM: BM[key] = (bmesh.new(), [])
    return BM[key]
def quad(key, P, UV):
    b, _ = bm_for(key); vs = [b.verts.new(p) for p in P]; f = b.faces.new(vs); uv = b.loops.layers.uv.verify()
    for l, t in zip(f.loops, UV): l[uv].uv = t
    return f
def tri(key, P, UV): return quad(key, P, UV)
def box(key, a, b, tex=None, top=None):  # a, b: 맞모서리. tex: 그림 크기(무늬 되풀이)
    x0, y0, z0 = a; x1, y1, z1 = b; tw, th = (tex[0] / TX, tex[1] / TX) if tex else (1e9, 1e9); k2 = top or key
    U = lambda u: u / tw; V = lambda v: v / th
    quad(key, [(x0, y0, z0), (x1, y0, z0), (x1, y0, z1), (x0, y0, z1)], [(0, 0), (U(x1 - x0), 0), (U(x1 - x0), V(z1 - z0)), (0, V(z1 - z0))])  # 앞(-y)
    quad(key, [(x1, y1, z0), (x0, y1, z0), (x0, y1, z1), (x1, y1, z1)], [(0, 0), (U(x1 - x0), 0), (U(x1 - x0), V(z1 - z0)), (0, V(z1 - z0))])
    quad(key, [(x0, y1, z0), (x0, y0, z0), (x0, y0, z1), (x0, y1, z1)], [(0, 0), (U(y1 - y0), 0), (U(y1 - y0), V(z1 - z0)), (0, V(z1 - z0))])
    quad(key, [(x1, y0, z0), (x1, y1, z0), (x1, y1, z1), (x1, y0, z1)], [(0, 0), (U(y1 - y0), 0), (U(y1 - y0), V(z1 - z0)), (0, V(z1 - z0))])
    quad(k2, [(x0, y0, z1), (x1, y0, z1), (x1, y1, z1), (x0, y1, z1)], [(0, 0), (U(x1 - x0), 0), (U(x1 - x0), V(y1 - y0)), (0, V(y1 - y0))])
    quad(key, [(x0, y1, z0), (x1, y1, z0), (x1, y0, z0), (x0, y0, z0)], [(0, 0), (1, 0), (1, 1), (0, 1)])
def cyl(key, c, r, z0, z1, n=12, tex=None):
    for i in range(n):
        a0, a1 = 2 * math.pi * i / n, 2 * math.pi * (i + 1) / n; p0 = (c[0] + r * math.cos(a0), c[1] + r * math.sin(a0)); p1 = (c[0] + r * math.cos(a1), c[1] + r * math.sin(a1))
        quad(key, [(p0[0], p0[1], z0), (p1[0], p1[1], z0), (p1[0], p1[1], z1), (p0[0], p0[1], z1)], [(i / n, 0), ((i + 1) / n, 0), ((i + 1) / n, 1), (i / n, 1)])

def tube(key, pts, w, h):
    """점들을 따라 네모 단면 띠(귀마루). 단면은 진행 방향에 수직인 가로(w)와 위(h)"""
    secs = []
    for i, p in enumerate(pts):
        a = Vector(pts[min(i + 1, len(pts) - 1)]) - Vector(pts[max(i - 1, 0)]); a.normalize(); side = a.cross(Vector((0, 0, 1))); side.normalize(); up = side.cross(a); up.normalize(); P = Vector(p)
        secs.append([P - side * w / 2, P + side * w / 2, P + side * w / 2 + up * h, P - side * w / 2 + up * h])
    for i in range(len(secs) - 1):
        A, B = secs[i], secs[i + 1]
        for k in range(4):
            k2 = (k + 1) % 4; quad(key, [tuple(A[k]), tuple(A[k2]), tuple(B[k2]), tuple(B[k])], [(0, 0), (1, 0), (1, 1), (0, 1)])
def ease(t): return t ** 1.7  # 휜 물매: 처마 쪽은 눕고 용마루 쪽은 선다

def hip_roof(cx, cy, A, B, H0, Hr, ridge, lift, th, key, under, fascia, inner=None):
    """무전 지붕(네 물매). 처마 바깥 [cx±A, cy±B] 높이 H0에서 용마루(길이 2*ridge) 높이 H0+Hr까지. inner가 있으면 그 네모까지만(아래 처마 고리)
    lift: 처마 귀가 들리는 높이. th: 지붕 두께. 위 면은 key(기와), 밑면 under, 처마 끝 띠 fascia"""
    N, M = 28, 10
    rt = (A - ridge) / B if inner is None else None
    def pt(face, a, t):  # face: 0 앞(-y) 1 뒤 2 왼 3 오른. a: 처마 따라 0~1, t: 안쪽으로 0~1
        if inner is None:
            if face < 2: half = A - t * (A - ridge); x = cx + (a * 2 - 1) * half; d = B * (1 - t); y = cy - d if face == 0 else cy + d
            else: half = B * (1 - t); y = cy + (a * 2 - 1) * half; d = A - t * (A - ridge); x = cx - d if face == 2 else cx + d
        else:
            iA, iB = inner
            if face < 2: half = A - t * (A - iA); x = cx + (a * 2 - 1) * half; d = B - t * (B - iB); y = cy - d if face == 0 else cy + d
            else: half = B - t * (B - iB); y = cy + (a * 2 - 1) * half; d = A - t * (A - iA); x = cx - d if face == 2 else cx + d
        ex = max(0, (abs(x - cx) - (A - 16)) / 16); ey = max(0, (abs(y - cy) - (B - 16)) / 16)  # 귀 쪽일수록 들린다
        z = H0 + Hr * ease(t) + lift * (min(1, ex) * min(1, ey)) ** 1.5 * (1 - t) ** 2
        return (x, y, z)
    for face in range(4):
        ln = 2 * A if face < 2 else 2 * B
        for i in range(N):
            for j in range(M):
                a0, a1, t0, t1 = i / N, (i + 1) / N, j / M, (j + 1) / M
                P = [pt(face, a0, t0), pt(face, a1, t0), pt(face, a1, t1), pt(face, a0, t1)]
                if face in (1, 2): P = [P[1], P[0], P[3], P[2]]
                sl = math.hypot(B if face < 2 else A, Hr) * 1.0
                U0, U1 = a0 * ln / ROOFTW, a1 * ln / ROOFTW; V0, V1 = t0 * sl / ROOFTL, t1 * sl / ROOFTL
                UV = [(U0, V0), (U1, V0), (U1, V1), (U0, V1)] if face not in (1, 2) else [(U1, V0), (U0, V0), (U0, V1), (U1, V1)]
                quad(key, P, UV)
                Q = [(p[0], p[1], p[2] - th) for p in P]; quad(under, [Q[1], Q[0], Q[3], Q[2]], [(0, 0), (1, 0), (1, 1), (0, 1)])
            # 처마 끝 띠(두께 면)
            a0, a1 = i / N, (i + 1) / N; p0, p1 = pt(face, a0, 0), pt(face, a1, 0)
            P = [(p0[0], p0[1], p0[2] - th), (p1[0], p1[1], p1[2] - th), p1, p0]
            if face in (1, 2): P = [P[1], P[0], P[3], P[2]]
            quad(fascia, P, [(a0 * ln / FASW, 0), (a1 * ln / FASW, 0), (a1 * ln / FASW, 1), (a0 * ln / FASW, 1)])
    return pt

def build(name):
    S = HALLS[name]; W, D = S['W'], S['D']; A, B = W / 2, D / 2; cy = B; pbx, ph = S['plat']
    global ROOFTW, ROOFTL, FASW
    rp, rs = crop(S['roof'][0], None, S['roof'][1], 'roof'); ROOFTW, ROOFTL = rs[0] / TX * .7, rs[1] / TX * .7
    ep, es = crop('e_orange' if S['roof'][0] == 'r_orange' else 'e_dark', None, S['roof'][1], 'eave'); FASW = es[0] / TX * .6
    w = S['wall']
    pl = crop(w + '_side', (50, 36, 60, 70), (1.15, .95, .7), 'plaster'); st = crop(w + '_side', (0, 75, 72, 86), None, 'stone'); bm = crop(w + '_front', (10, 6, 85, 15), None, 'beam')
    dr = crop(w + '_front', (14, 17, 81, 57), None, 'door'); rg = crop('e_ridge', None, S['roof'][1], 'ridge')
    mat('roof', rp)
    mat('eave', ep); mat('under', None, (.16, .1, .07)); mat('plaster', pl[0]); mat('stone', st[0]); mat('stonetop', None, (.62, .58, .52)); mat('beam', bm[0])
    mat('door', dr[0]); mat('col', None, S['colC']); mat('gold', None, (.78, .58, .2)); mat('wood', None, (.27, .17, .11)); mat('ridge', rg[0]); mat('ridgeend', None, (.76, .56, .2) if S['gold'] else (.3, .3, .32))
    mat('dougong', None, (.18, .36, .3)); mat('plaque', plaque_png(S['plaque'], 26, 7))
    # 1) 기단 두 층과 앞 계단
    box('stone', (-A - pbx, -pbx, 0), (A + pbx, D + pbx, ph * .55), st[1], 'stonetop'); box('stone', (-A - pbx + 2, -pbx + 2, ph * .55), (A + pbx - 2, D + pbx - 2, ph), st[1], 'stonetop')
    for i in range(4): sw = 14 - i * .0; box('stone', (-sw, -pbx - 2.6 * (4 - i), 0), (sw, -pbx - 2.6 * (3 - i), ph * (i + 1) / 4), st[1], 'stonetop')
    for sx in (-1, 1): box('stone', (sx * 15.5 - 1.2, -pbx - 10.4, 0), (sx * 15.5 + 1.2, -pbx, ph + 1.2), st[1], 'stonetop')  # 계단 난간
    # 2) 아래층: 앞 기둥줄(바깥), 안쪽 벽(살창 문 여섯 칸), 옆과 뒤는 회벽
    z0, cH = ph, S['colH']; inset = 6; n = S['cols']
    for i in range(n + 1):
        x = -A + 3 + (W - 6) * i / n
        for yy in (2.5, D - 2.5): cyl('col', (x, yy), 1.9, z0, z0 + cH); cyl('gold', (x, yy), 2.2, z0 + cH - 1.5, z0 + cH, 10); cyl('stonetop', (x, yy), 2.6, z0, z0 + 1.2, 10)
    for yy in (inset + 4, D - inset - 2):
        for x in (-A + 3, A - 3): cyl('col', (x, yy), 1.9, z0, z0 + cH)
    # 안쪽 벽 상자
    ix0, ix1, iy0, iy1 = -A + 6, A - 6, inset, D - inset
    tw, th = dr[1][0] / TX, dr[1][1] / TX; panes = 6; pw = (ix1 - ix0) / panes; dh = min(cH - 4, th * 1.0)
    for k in range(panes):  # 살창 문: 문 그림을 칸마다 한 장씩
        x0, x1 = ix0 + k * pw, ix0 + (k + 1) * pw
        quad('door', [(x0, iy0, z0), (x1, iy0, z0), (x1, iy0, z0 + dh), (x0, iy0, z0 + dh)], [(0, 0), (1, 0), (1, 1), (0, 1)])
    quad('plaster', [(ix0, iy0, z0 + dh), (ix1, iy0, z0 + dh), (ix1, iy0, z0 + cH), (ix0, iy0, z0 + cH)], [(0, 0), ((ix1 - ix0) / (pl[1][0] / TX), 0), ((ix1 - ix0) / (pl[1][0] / TX), (cH - dh) / (pl[1][1] / TX)), (0, (cH - dh) / (pl[1][1] / TX))])
    for (a, b, c) in [((ix0, iy1), (ix0, iy0), 'L'), ((ix1, iy0), (ix1, iy1), 'R'), ((ix1, iy1), (ix0, iy1), 'B')]:
        L = math.hypot(b[0] - a[0], b[1] - a[1]); U = L / (pl[1][0] / TX); V = cH / (pl[1][1] / TX)
        quad('plaster', [(a[0], a[1], z0), (b[0], b[1], z0), (b[0], b[1], z0 + cH), (a[0], a[1], z0 + cH)], [(0, 0), (U, 0), (U, V), (0, V)])
    # 들보와 두공 줄(기둥 머리 위를 두른다)
    zt = z0 + cH; box('beam', (-A + 1, 1, zt - 2.5), (A - 1, 4, zt), bm[1], 'wood'); box('beam', (-A + 1, D - 4, zt - 2.5), (A - 1, D - 1, zt), bm[1], 'wood')
    box('wood', (-A + 1, 1, zt - 2.5), (-A + 4, D - 1, zt), None); box('wood', (A - 4, 1, zt - 2.5), (A - 1, D - 1, zt), None)
    for i in range(int(W / 4)):
        x = -A + 2 + i * 4; box('dougong', (x - .8, 0, zt), (x + .8, 2.6, zt + 1.6)); box('gold', (x - 1.3, -.4, zt + 1.6), (x + 1.3, 2.8, zt + 2.3))
    # 3) 아래 처마(고리): 바깥 처마에서 위층 벽까지
    uA, uB = S['upW'] / 2, S['upD'] / 2; so = S['skirtOut']; z1 = zt + 2.5
    hip_roof(0, cy, A + so, B + so, z1 - 3, 9, 0, 6, 1.4, 'roof', 'under', 'eave', inner=(uA, uB))
    # 4) 위층 몸: 짧은 벽, 들보, 현판
    zu0, zu1 = z1 + 5, z1 + 5 + S['upH']
    for (a, b) in [((-uA, cy - uB), (uA, cy - uB)), ((uA, cy - uB), (uA, cy + uB)), ((uA, cy + uB), (-uA, cy + uB)), ((-uA, cy + uB), (-uA, cy - uB))]:
        L = math.hypot(b[0] - a[0], b[1] - a[1]); U = L / (pl[1][0] / TX); V = (zu1 - z1) / (pl[1][1] / TX)
        quad('plaster', [(a[0], a[1], z1), (b[0], b[1], z1), (b[0], b[1], zu1), (a[0], a[1], zu1)], [(0, 0), (U, 0), (U, V), (0, V)])
    for x in [-uA + i * (2 * uA) / 6 for i in range(7)]: cyl('col', (x, cy - uB - .6), 1.4, z1, zu1, 10)
    box('beam', (-uA - 1, cy - uB - 2, zu1 - 2.4), (uA + 1, cy - uB + 1, zu1), bm[1], 'wood')
    for i in range(int(2 * uA / 4) + 1):
        x = -uA + i * 4; box('dougong', (x - .7, cy - uB - 2.4, zu1), (x + .7, cy - uB, zu1 + 1.4)); box('gold', (x - 1.1, cy - uB - 2.8, zu1 + 1.4), (x + 1.1, cy - uB, zu1 + 2))
    pw2, ph2 = 26, 7; zc = (z1 + zu1) / 2 + 1
    box('wood', (-pw2 / 2 - 1, cy - uB - 3.2, zc - ph2 / 2 - 1), (pw2 / 2 + 1, cy - uB - 1.6, zc + ph2 / 2 + 1))
    quad('plaque', [(-pw2 / 2, cy - uB - 3.25, zc - ph2 / 2), (pw2 / 2, cy - uB - 3.25, zc - ph2 / 2), (pw2 / 2, cy - uB - 3.25, zc + ph2 / 2), (-pw2 / 2, cy - uB - 3.25, zc + ph2 / 2)], [(0, 0), (1, 0), (1, 1), (0, 1)])
    # 5) 위 지붕(무전): 처마는 위층 벽 밖으로 10점
    Ar, Br = uA + 11, uB + 10; zr0 = zu1 + 2.6; Hr = S['roofH']; ridge = Ar * S['ridgeLen']
    pt = hip_roof(0, cy, Ar, Br, zr0, Hr, ridge, 8, 1.6, 'roof', 'under', 'eave')
    # 용마루와 귀마루
    zr = zr0 + Hr; box('ridge', (-ridge - 1, cy - 1.8, zr - 1), (ridge + 1, cy + 1.8, zr + 2.6), (300, 16), 'ridgeend')
    for sx in (-1, 1):  # 치미: 용마루 끝에서 위로 휘어 오른 꼬리
        x = sx * (ridge + 1); box('ridgeend', (x - (0 if sx > 0 else 3), cy - 1.6, zr - 1), (x + (3 if sx > 0 else 0), cy + 1.6, zr + 5.5))
        box('ridgeend', (x - (1.6 if sx > 0 else 2.6) * 1, cy - 1.2, zr + 5.5), (x + (2.6 if sx > 0 else 1.6) * 1, cy + 1.2, zr + 7.2))
        box('ridgeend', (x + (-2.6 if sx > 0 else .6), cy - 1, zr + 4), (x + (-.6 if sx > 0 else 2.6), cy + 1, zr + 6.4))
    for face, a in [(0, 0), (0, 1), (1, 0), (1, 1)]:  # 귀마루: 처마 귀에서 용마루 끝까지 휜 띠
        tube('ridgeend', [tuple(Vector(pt(face, a, k / 16)) + Vector((0, 0, .3))) for k in range(17)], 1.8, 1.6)
        for k in range(1, 4):  # 잡상 셋
            p = pt(face, a, .06 + k * .06); box('ridgeend', (p[0] - .6, p[1] - .6, p[2] + 1.6), (p[0] + .6, p[1] + .6, p[2] + 2.9))
    # 그물 → 물체
    for key, (b, _) in BM.items():
        me = bpy.data.meshes.new(key); b.normal_update(); b.to_mesh(me); b.free(); ob = bpy.data.objects.new(key, me); bpy.context.collection.objects.link(ob)
        ob.data.materials.append(MATS[key][0])
    out = os.path.join(OUT, name + '.glb')
    bpy.ops.export_scene.gltf(filepath=out, export_format='GLB', export_apply=True, export_yup=True, export_image_format='AUTO')
    print('saved', out, os.path.getsize(out))

if __name__ == '__main__':
    bpy.ops.wm.read_factory_settings(use_empty=True)
    build(sys.argv[1] if len(sys.argv) > 1 else 'daewoong')
