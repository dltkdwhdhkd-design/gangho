# 블렌더(bpy)로 모든 건물 모형을 짓는다(js/hd2d/build.js의 SPEC, GRAND 설명서를 그대로 읽어서).
# 지붕 꼴: gable(맞배, 휜 물매와 살짝 들린 귀), hip(무전), xieshan(팔작: 아래는 네 물매, 위는 박공), thatch(초가: 둥글게 부푼 물매).
# 몸: 기단과 계단, 층마다 회벽(문과 창 자리를 뚫고 문·창은 안으로 들인다), 모서리 기둥과 도리, 앞 기둥줄(둥근 기둥), 두공 줄, 등롱, 현판, 이층 난간과 아래 처마.
# 길이는 평면도 점(사람 키 15점). x는 막힘 상자 가운데가 0, y는 막힘 상자 앞선이 0이고 뒤로 +, z는 위.
# 게임(js/hd2d.js)은 (1, HS, ZS)로 늘려 막힘 상자 앞선에 세운다. 등불 자리는 'lamps' 빈 물체의 pts에 적는다.
# 쓰는 법: node tools/blender/dump_spec.mjs > /tmp/spec.json && python3 tools/blender/houses.py [이름...] && tools/blender/pack.sh
import bpy, bmesh, math, os, sys, json
from mathutils import Vector
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
PV = os.path.join(ROOT, 'assets', 'hd2d', 'preview'); OUT = os.path.join(ROOT, 'assets', 'hd2d', 'models'); TMP = '/tmp/bl_tex2'
os.makedirs(OUT, exist_ok=True); os.makedirs(TMP, exist_ok=True)
TX = 2.67                      # 벽 도트: 평면도 1점에 그림 2.67점
RS, ES = .62, .55              # 지붕 무늬, 처마 띠 줄임(build.js와 같게)
ZS = .857 / math.sin(math.radians(35))  # build.js의 세상 깊이 → 평면도 깊이로 바꿀 때 나눈다
D = json.load(open(sys.argv[1] if len(sys.argv) > 1 and sys.argv[1].endswith('.json') else '/tmp/spec.json'))
SPEC, GRAND, CROP, CROPS, ST = D['SPEC'], D['GRAND'], D['CROP'], D['CROPS'], D['ST']

# 지붕 꼴: 종류마다
ROOF = {'hut_o': 'gable', 'hut_b': 'gable', 'hut_o2': 'thatch', 'shop_blue': 'gable', 'shop_green': 'gable', 'house_red': 'xieshan', 'clay': 'gable', 'wood_o': 'gable',
        'wood_b': 'gable', 'mud': 'thatch', 'straw': 'thatch', 'lodge': 'xieshan', 'hall': 'hip', 'inn': 'xieshan'}
GROOF = {'shaolin': 'hip', 'namgung': 'hip', 'gaebang': 'thatch', 'jongnam': 'hip', 'emei': 'hip', 'gongdong': 'gable', 'dang': 'gable', 'paeng': 'hip',
         'ak': 'hip', 'eon': 'gable', 'cheonsan': 'hip', 'mosan': 'gable', 'jangbaek': 'hip', 'pota': 'hip'}  # 나머지 문파·세가는 팔작
# 문파·세가마다 꼴을 달리한다(같은 설명서에 덮어쓴다): 층수, 물매, 기둥줄 깊이, 너비
SHAPE = {
    'wudang': dict(pitch=36, upper=24, gold=1),                 # 도가 산문: 높고 가파른 이층 누각
    'hwasan': dict(floors=1, wall=40, porch=9, pitch=32),       # 매화 핀 산 위의 넓은 단층 전각, 깊은 기둥줄
    'jongnam': dict(pitch=32, balcony=False),                   # 도관: 이층, 무전 지붕
    'emei': dict(floors=1, wall=38, porch=7, pitch=34),         # 비구니 암자: 단정한 단층 무전
    'gonryun': dict(pitch=36, balcony=False),                   # 설산: 눈이 흘러내리게 가파른 지붕
    'gongdong': dict(floors=1, wall=36, porch=0, plat=[3, 4]),  # 서쪽 변방: 투박한 단층 맞배
    'jeomchang': dict(pitch=26, upper=22),                      # 남쪽: 완만한 물매
    'cheongseong': dict(floors=1, wall=38, porch=8),            # 촉의 도관: 단층 팔작
    'namgung': dict(widen=1.2, upper=22),                       # 오대세가의 으뜸: 넓은 이층 무전
    'moyong': dict(upper=22),
    'jegal': dict(balcony=False, pitch=28),                     # 학자 집안: 난간 없이 단정하게
    'dang': dict(porch=0, widen=1.05, pitch=32, lanterns=1),    # 독문: 기둥줄 없이 닫힌 이층 맞배
    'paeng': dict(floors=1, wall=40, widen=1.25, porch=7),      # 도객 집안: 낮고 넓고 묵직한 단층
    'hwangbo': dict(upper=22),                                  # 하북의 권법 세가: 이층 팔작, 금빛 마루
    'ak': dict(upper=22, balcony=False),                        # 충의 창가: 무전 이층, 단단하게
    'yang': dict(floors=1, wall=38, porch=7),                   # 창술 세가: 넓은 단층 팔작
    'eon': dict(floors=1, wall=36, widen=1.2, porch=0),         # 철골공: 투박한 단층 맞배
    'jin': dict(pitch=26),                                      # 광동: 완만한 이층 팔작
    'haenam': dict(floors=1, wall=36, porch=8, pitch=24),       # 바닷가 문파: 낮은 물매, 트인 기둥줄
    'cheonsan': dict(pitch=36, balcony=False),                  # 천산 설산: 가파른 무전
    'jeonjin': dict(pitch=34, upper=24),                        # 전진 도관: 높은 이층 팔작
    'mosan': dict(porch=0, lanterns=1),                         # 부적 도관: 닫힌 이층 맞배
    'jangbaek': dict(floors=1, wall=38, pitch=36),              # 장백산: 가파른 단층 무전
    'pota': dict(floors=1, wall=38, porch=7, pitch=32),         # 섬의 비구니 암자: 단층 무전
}

def hexc(h): h = h.lstrip('#'); return tuple(int(h[i:i + 2], 16) / 255 for i in (0, 2, 4))

# ---------- 그림 ----------
def img(name):
    p = os.path.join(PV, name + '.webp'); return Image.open(p).convert('RGBA') if os.path.exists(p) else None
def save(im, key):
    p = os.path.join(TMP, key + '.png'); im.save(p); return p, im.size
def tinted(im, hx):
    if not hx: return im
    c = hexc(hx); px = im.load()
    for y in range(im.height):
        for x in range(im.width):
            r, g, b, a = px[x, y]; px[x, y] = (int(r * c[0]), int(g * c[1]), int(b * c[2]), a)
    return im
def plank_img(hx):
    import random; rnd = random.Random(7); b = hexc(hx); im = Image.new('RGBA', (24, 36)); d = ImageDraw.Draw(im)
    f = lambda k: tuple(int(min(255, v * 255 * k)) for v in b) + (255,)
    for i in range(4):
        d.rectangle([i * 6, 0, i * 6 + 5, 35], fill=f(.82 + rnd.random() * .3)); d.line([i * 6, 0, i * 6, 35], fill=f(.5)); d.line([i * 6 + 1, 0, i * 6 + 1, 35], fill=f(1.12))
        for j in range(5): x = i * 6 + 2 + rnd.randrange(3); y = rnd.randrange(36); d.line([x, y, x, y + 3 + rnd.randrange(5)], fill=f(.7 + rnd.random() * .2))
    d.line([0, 17, 23, 17], fill=f(.6)); return im
def sign_img(txt, w, h, vert):
    W, H = max(8, int(w * TX)), max(8, int(h * TX)); im = Image.new('RGBA', (W, H), (52, 30, 18, 255)); d = ImageDraw.Draw(im)
    d.rectangle([0, 0, W - 1, H - 1], outline=(176, 128, 50, 255)); d.rectangle([1, 1, W - 2, H - 2], outline=(96, 60, 28, 255))
    chars = list(txt); n = len(chars)
    fs = int(min(W - 6, (H - 6) / n) if vert else min(H - 6, (W - 6) / n)); f = ImageFont.truetype('/usr/share/fonts/opentype/noto/NotoSerifCJK-Bold.ttc', max(6, fs))
    for i, ch in enumerate(chars):
        pos = (W / 2, 3 + (H - 6) * (i + .5) / n) if vert else (3 + (W - 6) * (i + .5) / n, H / 2)
        d.text(pos, ch, font=f, fill=(236, 190, 88, 255), anchor='mm')
    px = im.load()
    for y in range(H):
        for x in range(W):
            r, g, b, a = px[x, y]
            if r > 150 and g > 110: px[x, y] = (236, 190, 88, 255)
            elif r > 80 and g > 50 and 1 < x < W - 2 and 1 < y < H - 2: px[x, y] = (122, 82, 38, 255)
    return im

# ---------- 그물 모으기 ----------
class Build:
    def __init__(s): s.bm = {}; s.mat = {}; s.lamps = []
    def M(s, key, path=None, color=None, size=None):
        if key not in s.mat: s.mat[key] = (path, color or (1, 1, 1), size)
        return key
    def quad(s, key, P, UV):
        if key not in s.bm: s.bm[key] = bmesh.new()
        b = s.bm[key]; vs = [b.verts.new(p) for p in P]; f = b.faces.new(vs); uv = b.loops.layers.uv.verify()
        for l, t in zip(f.loops, UV): l[uv].uv = t
    def tex(s, key):  # 그림 한 장이 덮는 평면도 길이
        p, c, sz = s.mat[key]; return (sz[0] / TX, sz[1] / TX) if sz else (1e9, 1e9)
    def box(s, key, a, b, top=None, ts=1):
        x0, y0, z0 = a; x1, y1, z1 = b; tw, th = s.tex(key); tw *= ts; th *= ts; k2 = top or key
        U = lambda u: u / tw; V = lambda v: v / th
        s.quad(key, [(x0, y0, z0), (x1, y0, z0), (x1, y0, z1), (x0, y0, z1)], [(0, 0), (U(x1 - x0), 0), (U(x1 - x0), V(z1 - z0)), (0, V(z1 - z0))])
        s.quad(key, [(x1, y1, z0), (x0, y1, z0), (x0, y1, z1), (x1, y1, z1)], [(0, 0), (U(x1 - x0), 0), (U(x1 - x0), V(z1 - z0)), (0, V(z1 - z0))])
        s.quad(key, [(x0, y1, z0), (x0, y0, z0), (x0, y0, z1), (x0, y1, z1)], [(0, 0), (U(y1 - y0), 0), (U(y1 - y0), V(z1 - z0)), (0, V(z1 - z0))])
        s.quad(key, [(x1, y0, z0), (x1, y1, z0), (x1, y1, z1), (x1, y0, z1)], [(0, 0), (U(y1 - y0), 0), (U(y1 - y0), V(z1 - z0)), (0, V(z1 - z0))])
        s.quad(k2, [(x0, y0, z1), (x1, y0, z1), (x1, y1, z1), (x0, y1, z1)], [(0, 0), (U(x1 - x0), 0), (U(x1 - x0), V(y1 - y0)), (0, V(y1 - y0))])
    def cyl(s, key, c, r, z0, z1, n=10):
        for i in range(n):
            a0, a1 = 2 * math.pi * i / n, 2 * math.pi * (i + 1) / n; p0 = (c[0] + r * math.cos(a0), c[1] + r * math.sin(a0)); p1 = (c[0] + r * math.cos(a1), c[1] + r * math.sin(a1))
            s.quad(key, [(p0[0], p0[1], z0), (p1[0], p1[1], z0), (p1[0], p1[1], z1), (p0[0], p0[1], z1)], [(i / n, 0), ((i + 1) / n, 0), ((i + 1) / n, 1), (i / n, 1)])
    def tube(s, key, pts, w, h):
        secs = []
        for i, p in enumerate(pts):
            a = Vector(pts[min(i + 1, len(pts) - 1)]) - Vector(pts[max(i - 1, 0)]); a.normalize(); side = a.cross(Vector((0, 0, 1)))
            if side.length < 1e-6: side = Vector((1, 0, 0))
            side.normalize(); up = side.cross(a); up.normalize(); P = Vector(p)
            secs.append([P - side * w / 2, P + side * w / 2, P + side * w / 2 + up * h, P - side * w / 2 + up * h])
        for i in range(len(secs) - 1):
            A, B = secs[i], secs[i + 1]
            for k in range(4): k2 = (k + 1) % 4; s.quad(key, [tuple(A[k]), tuple(A[k2]), tuple(B[k2]), tuple(B[k])], [(0, 0), (1, 0), (1, 1), (0, 1)])
    def panel(s, O, a, L, h, holes, key):
        """벽 판. O: 시작 모서리(바닥), a: 진행 방향(xy 단위), 바깥은 a × z 쪽. holes: [u0,u1,v0,v1,그림 이름]. 문·창은 1.2점 안에"""
        n = Vector((a[1], -a[0], 0)); A = Vector((a[0], a[1], 0)); O = Vector(O); tw, th = s.tex(key)
        pt = lambda u, v, d=0: tuple(O + A * u + Vector((0, 0, v)) - n * d)
        def q(k, u0, u1, v0, v1, d=0, uv=None): s.quad(k, [pt(u0, v0, d), pt(u1, v0, d), pt(u1, v1, d), pt(u0, v1, d)], uv or [(u0 / tw, v0 / th), (u1 / tw, v0 / th), (u1 / tw, v1 / th), (u0 / tw, v1 / th)])
        xs = sorted(set([0, L] + [h_[0] for h_ in holes] + [h_[1] for h_ in holes]))
        for i in range(len(xs) - 1):
            u0, u1 = xs[i], xs[i + 1]; um = (u0 + u1) / 2; hs = sorted([h_ for h_ in holes if h_[0] <= um <= h_[1]], key=lambda h_: h_[2]); v = 0
            for h_ in hs:
                if h_[2] > v: q(key, u0, u1, v, h_[2])
                v = h_[3]
            if v < h: q(key, u0, u1, v, h)
        dr = 1.2
        for (u0, u1, v0, v1, k) in holes:
            q(k, u0, u1, v0, v1, dr, [(0, 0), (1, 0), (1, 1), (0, 1)])
            s.quad('reveal', [pt(u0, v1, 0), pt(u1, v1, 0), pt(u1, v1, dr), pt(u0, v1, dr)], [(0, 0), (1, 0), (1, 1), (0, 1)])
            s.quad('reveal', [pt(u0, v0, dr), pt(u0, v0, 0), pt(u0, v1, 0), pt(u0, v1, dr)], [(0, 0), (1, 0), (1, 1), (0, 1)])
            s.quad('reveal', [pt(u1, v0, 0), pt(u1, v0, dr), pt(u1, v1, dr), pt(u1, v1, 0)], [(0, 0), (1, 0), (1, 1), (0, 1)])
            if v0 > .1: s.quad('reveal', [pt(u0, v0, dr), pt(u1, v0, dr), pt(u1, v0, 0), pt(u0, v0, 0)], [(0, 0), (1, 0), (1, 1), (0, 1)])

    # ---------- 지붕 ----------
    def roof_faces(s, faces, roofk, under, fascia, th, N, M, pt, rtw, rtl, ftw):
        """faces: [(이름, 처마 길이, 물매 길이, 뒤집기)]. pt(face, a, t) → 점. 위 면, 밑면, 처마 끝 띠"""
        for f, ln, sl, flip in faces:
            for i in range(N):
                a0, a1 = i / N, (i + 1) / N
                for j in range(M):
                    t0, t1 = j / M, (j + 1) / M; P = [pt(f, a0, t0), pt(f, a1, t0), pt(f, a1, t1), pt(f, a0, t1)]
                    UV = [(a0 * ln / rtw, t0 * sl / rtl), (a1 * ln / rtw, t0 * sl / rtl), (a1 * ln / rtw, t1 * sl / rtl), (a0 * ln / rtw, t1 * sl / rtl)]
                    if flip: P = [P[1], P[0], P[3], P[2]]; UV = [UV[1], UV[0], UV[3], UV[2]]
                    s.quad(roofk, P, UV); Q = [(p[0], p[1], p[2] - th) for p in P]; s.quad(under, [Q[1], Q[0], Q[3], Q[2]], [(0, 0), (1, 0), (1, 1), (0, 1)])
                p0, p1 = pt(f, a0, 0), pt(f, a1, 0); P = [(p0[0], p0[1], p0[2] - th), (p1[0], p1[1], p1[2] - th), p1, p0]
                if flip: P = [P[1], P[0], P[3], P[2]]
                s.quad(fascia, P, [(a0 * ln / ftw, 0), (a1 * ln / ftw, 0), (a1 * ln / ftw, 1), (a0 * ln / ftw, 1)])

def ease_tile(t): return t ** 1.7
def ease_thatch(t): return 1 - (1 - t) ** 1.5

def corner_lift(x, y, cx, cy, A, B, r): ex = max(0, (abs(x - cx) - (A - r)) / r); ey = max(0, (abs(y - cy) - (B - r)) / r); return (min(1, ex) * min(1, ey)) ** 1.5

def hip(b, cx, cy, A, B, H0, Hr, ridge, lift, th, prof, inner=None, N=16, M=7, rtw=1, rtl=1, ftw=1):
    def pt(face, a, t):
        if inner is None:
            if face < 2: half = A - t * (A - ridge); x = cx + (a * 2 - 1) * half; d = B * (1 - t); y = cy - d if face == 0 else cy + d
            else: half = B * (1 - t); y = cy + (a * 2 - 1) * half; d = A - t * (A - ridge); x = cx - d if face == 2 else cx + d
        else:
            iA, iB = inner
            if face < 2: half = A - t * (A - iA); x = cx + (a * 2 - 1) * half; d = B - t * (B - iB); y = cy - d if face == 0 else cy + d
            else: half = B - t * (B - iB); y = cy + (a * 2 - 1) * half; d = A - t * (A - iA); x = cx - d if face == 2 else cx + d
        return (x, y, H0 + Hr * prof(t) + lift * corner_lift(x, y, cx, cy, A, B, min(16, B * .8)) * (1 - t) ** 2)
    sl = math.hypot(B if inner is None else B - inner[1], Hr)
    b.roof_faces([(0, 2 * A, sl, False), (1, 2 * A, sl, True), (2, 2 * B, sl, True), (3, 2 * B, sl, False)], 'roof', 'under', 'eave', th, N, M, pt, rtw, rtl, ftw)
    return pt

def gable(b, cx, cy, A, B, H0, Hr, lift, th, prof, N=16, M=7, rtw=1, rtl=1, ftw=1):
    """맞배: 앞(0), 뒤(1) 두 면. x는 cx±A, 처마 y=cy∓B에서 용마루 y=cy까지"""
    def pt(face, a, t):
        x = cx + (a * 2 - 1) * A; d = B * (1 - t); y = cy - d if face == 0 else cy + d
        e = max(0, (abs(x - cx) - (A - 8)) / 8)
        return (x, y, H0 + Hr * prof(t) + lift * min(1, e) ** 1.5 * (1 - t) ** 1.5)
    sl = math.hypot(B, Hr); b.roof_faces([(0, 2 * A, sl, False), (1, 2 * A, sl, True)], 'roof', 'under', 'eave', th, N, M, pt, rtw, rtl, ftw)
    for sx in (-1, 1):  # 박공 끝 막새판(지붕 옆 두께)
        a = 0 if sx < 0 else 1
        for f in (0, 1):
            for j in range(M):
                p0, p1 = pt(f, a, j / M), pt(f, a, (j + 1) / M); P = [(p0[0], p0[1], p0[2] - th), (p1[0], p1[1], p1[2] - th), p1, p0]
                if (sx > 0) == (f == 0): P = [P[1], P[0], P[3], P[2]]
                b.quad('wood', P, [(0, 0), (1, 0), (1, 1), (0, 1)])
    return pt

def gable_wall(b, x, y0, y1, zb, ztop_fn, key, outward):
    """박공 세모(옆벽 위): x에서 y0~y1, 아래 zb, 위는 지붕 밑선 ztop_fn(y)"""
    n = 8; tw, th = b.tex(key)
    for i in range(n):
        ya, yb_ = y0 + (y1 - y0) * i / n, y0 + (y1 - y0) * (i + 1) / n; za, zb2 = ztop_fn(ya), ztop_fn(yb_)
        P = [(x, ya, zb), (x, yb_, zb), (x, yb_, zb2), (x, ya, za)]
        if outward < 0: P = [P[1], P[0], P[3], P[2]]
        b.quad(key, P, [((p[1] - y0) / tw, (p[2] - zb) / th) for p in P])

# ---------- 건물 하나 ----------
def build(name, spec, st, roofType):
    b = Build(); g = lambda k, d=None: spec.get(k, d)
    sw, sh = st[6], st[7]; wd = g('widen', 1); W = sw * wd; Dp = min(sh, g('depth', 26) / ZS); A0 = W / 2
    walls = g('walls'); wset = walls[0] if isinstance(walls, list) and img(walls[0] + '_front') else (walls[1] if isinstance(walls, list) else walls)
    if isinstance(walls, list) and walls[0].startswith('hs_') and img(walls[0] + '_front'): wset = walls[0]
    if isinstance(walls, list) and not img(wset + '_front'): wset = walls[1] if img(walls[1] + '_front') else 'w1'
    CR = CROPS.get(wset, CROP)
    def crop(part, tint=None):
        f, x0, y0, x1, y1 = CR[part]; im = img(wset + '_' + f).crop((x0, y0, x1, y1)); return save(tinted(im, tint), name + '_' + part)
    pl = save(plank_img(g('plank')), name + '_plaster') if g('plank') else crop('plaster')
    b.M('plaster', pl[0], size=pl[1]); st_ = crop('stone'); b.M('stone', st_[0], size=st_[1]); bm = crop('beam'); b.M('beam', bm[0], size=bm[1])
    dr = crop('door'); b.M('door', dr[0], size=dr[1]); wn = crop('win'); b.M('win', wn[0], size=wn[1]); po = crop('post'); b.M('post', po[0], size=po[1])
    rim = img(g('roof')); rim = tinted(rim, g('tint')); rp = save(rim, name + '_roof'); b.M('roof', rp[0], size=rp[1])
    eim = img(g('eave', 'e_dark')); eim = tinted(eim, g('tint')); ep = save(eim, name + '_eave'); b.M('eave', ep[0], size=ep[1])
    rgi = img('e_thatch' if roofType == 'thatch' else 'e_ridge'); rgi = tinted(rgi, g('tint')); rg = save(rgi, name + '_ridge'); b.M('ridge', rg[0], size=rg[1])
    b.M('under', color=(.16, .1, .07)); b.M('reveal', color=(.24, .17, .12)); b.M('wood', color=(.27, .17, .11)); b.M('woodl', color=(.42, .29, .19))
    b.M('stonetop', color=(.62, .58, .52)); b.M('gold', color=(.78, .58, .2)); b.M('lantern', color=(.78, .2, .14)); b.M('dougong', color=(.18, .36, .3))
    b.M('col', color=hexc(g('col')) if g('col') else (.45, .14, .1)); b.M('ridgeend', color=(.76, .56, .2) if g('gold') else (.33, .33, .35))
    rtw, rtl = rp[1][0] / TX * RS, rp[1][1] / TX * RS; ftw = ep[1][0] / TX * ES; prof = ease_thatch if roofType == 'thatch' else ease_tile
    pb, ph = g('plat', [2, 3]); porch = g('porch', 0) / ZS * 1.0 if g('porch') else 0; floors = g('floors', 1)
    # 1) 기단과 계단
    b.box('stone', (-A0 - pb, -pb, 0), (A0 + pb, Dp + pb * .5, ph), top='stonetop')
    dW, dH = dr[1][0] / TX, dr[1][1] / TX; wW, wH = wn[1][0] / TX, wn[1][1] / TX
    nst = 3 if g('plat') else 1; sw2 = dW / 2 + (7 if g('plat') else 2)
    for i in range(nst): b.box('stone', (-sw2, -pb - 2.2 * (i + 1), 0), (sw2, -pb - 2.2 * i, ph * (nst - i) / (nst + 1)), top='stonetop')
    # 2) 층마다 몸
    yF, yB, X0, X1, z = porch, Dp, -A0, A0, ph; postW = 2.2; yt = z
    for fl in range(floors):
        up = fl > 0; hh = (g('wall') - ph) if not up else g('upper', 20); yt = z + hh; L = X1 - X0
        holes = []
        wy = 4 if up else 7
        if not up:
            holes.append([-dW / 2 - X0, dW / 2 - X0, 0, dH, 'door'])
            for (a_, c_) in [(X0 + postW, -dW / 2 - postW), (dW / 2 + postW, X1 - postW)]:
                sp = c_ - a_
                if sp >= wW * 2 + 10: holes += [[a_ + sp * .27 - wW / 2 - X0, a_ + sp * .27 + wW / 2 - X0, wy, wy + wH, 'win'], [a_ + sp * .73 - wW / 2 - X0, a_ + sp * .73 + wW / 2 - X0, wy, wy + wH, 'win']]
                elif sp >= wW + 3: holes.append([(a_ + c_) / 2 - wW / 2 - X0, (a_ + c_) / 2 + wW / 2 - X0, wy, wy + wH, 'win'])
        else:
            n = max(1, int((L - 6) // (wW + 7)))
            for i in range(n): c_ = X0 + L * (i + .5) / n; holes.append([c_ - wW / 2 - X0, c_ + wW / 2 - X0, wy, wy + wH, 'win'])
        Dd = yB - yF; side = [[Dd / 2 - wW / 2, Dd / 2 + wW / 2, wy, wy + wH, 'win']] if Dd >= wW + 5 else []
        nb = max(1, int((L - 8) // (wW + 14))); back = [[L * (i + .5) / nb - wW / 2, L * (i + .5) / nb + wW / 2, wy, wy + wH, 'win'] for i in range(nb)]
        b.panel((X0, yF, z), (1, 0), L, hh, holes, 'plaster'); b.panel((X1, yF, z), (0, 1), Dd, hh, side, 'plaster')
        b.panel((X1, yB, z), (-1, 0), L, hh, back, 'plaster'); b.panel((X0, yB, z), (0, -1), Dd, hh, side, 'plaster')
        # 기둥(모서리, 문 양옆, 뒷벽 18점마다)과 도리
        posts = [(X0, yF), (X1, yF), (X0, yB), (X1, yB)] + ([(-dW / 2 - postW / 2, yF), (dW / 2 + postW / 2, yF)] if not up else [])
        nbk = round(L / 18); posts += [(X0 + L * i / nbk, yB) for i in range(1, nbk)]
        for (x, y) in posts: b.box('post', (x - postW / 2, y - postW / 2 - (.6 if y == yF else 0), z), (x + postW / 2, y + postW / 2, yt), top='wood')
        b.box('beam', (X0 - 1.2, yF - 1.4, yt - 2.2), (X1 + 1.2, yF + .2, yt), top='wood'); b.box('wood', (X0 - 1.2, yB - .2, yt - 2.2), (X1 + 1.2, yB + 1.4, yt))
        for x in (X0, X1): b.box('wood', (x - 1.2, yF, yt - 2.2), (x + 1.2, yB, yt))
        if porch and not up:  # 앞 기둥줄
            n = max(2, round(L / 13)); yc = 1.2
            for i in range(n + 1):
                x = X0 + L * i / n
                if abs(x) < dW / 2 + 1: continue
                b.cyl('stonetop', (x, yc), 2.2, z, z + 1.2); b.cyl('col', (x, yc), 1.6, z + 1.2, yt - 1.2); b.cyl('gold' if g('gold') else 'woodl', (x, yc), 1.9, yt - 1.6, yt)
            b.box('beam', (X0 - 2, yc - 1.4, yt - 3), (X1 + 2, yc + 1.4, yt), top='wood')
        if g('col') or g('plat'):  # 두공 줄
            for i in range(int((X1 - X0) / 4) + 1):
                x = X0 + i * 4; b.box('dougong', (x - .7, (1.2 if porch and not up else yF) - 1.6, yt), (x + .7, (1.2 if porch and not up else yF) + 1, yt + 1.4)); b.box('gold' if g('gold') else 'woodl', (x - 1.1, (1.2 if porch and not up else yF) - 2, yt + 1.4), (x + 1.1, (1.2 if porch and not up else yF) + 1, yt + 2))
        if not up and g('lanterns'):  # 등롱
            for sg in ((-1,) if g('sign') or g('lanterns') == 1 else (-1, 1)):
                lx = sg * (dW / 2 + postW + 2.4); ly = z + dH * .78; yy = (1.2 - 2.4) if porch else yF - 1.8
                b.box('wood', (lx - .5, yy - .5, ly), (lx + .5, yy + .5, ly + 1.2)); b.box('wood', (lx - 1.1, yy - 1.1, ly - .7), (lx + 1.1, yy + 1.1, ly))
                b.box('lantern', (lx - 1.6, yy - 1.6, ly - 3.6), (lx + 1.6, yy + 1.6, ly - .7)); b.box('wood', (lx - 1.1, yy - 1.1, ly - 4.3), (lx + 1.1, yy + 1.1, ly - 3.6))
                b.box('gold', (lx - .3, yy - .3, ly - 5.6), (lx + .3, yy + .3, ly - 4.3)); b.lamps.append([lx, yy - 3, ly - 2])
        if not up and g('sign') and g('signText'):  # 세로 현판
            sx = dW / 2 + postW + 3.4; w_, h_ = 4.6, 15; y0 = z + 4; yy = yF - 1.8
            b.box('wood', (sx - w_ / 2 - .5, yy - .6, y0 - .5), (sx + w_ / 2 + .5, yy + .6, y0 + h_ + .5))
            sp = save(sign_img(g('signText'), w_, h_, True), name + '_vsign'); b.M('vsign', sp[0]); b.quad('vsign', [(sx - w_ / 2, yy - .65, y0), (sx + w_ / 2, yy - .65, y0), (sx + w_ / 2, yy - .65, y0 + h_), (sx - w_ / 2, yy - .65, y0 + h_)], [(0, 0), (1, 0), (1, 1), (0, 1)])
        if g('plaque') and fl == floors - 1:  # 가로 현판(맨 위층)
            w_ = min(L * .5, 6 + len(g('plaque')) * 5); h_ = 6.5; y0 = (z + hh * .42) if up else (z + dH + 1.2); yy = yF - (1.4 if up else (0 if not porch else -porch + 1.4))
            yy = yF - 1.6 if (up or not porch) else 1.2 - 1.6
            b.box('wood', (-w_ / 2 - .8, yy - .4, y0 - .8), (w_ / 2 + .8, yy + 1.2, y0 + h_ + .8))
            sp = save(sign_img(g('plaque'), w_, h_, False), name + '_plaque'); b.M('plaque', sp[0]); b.quad('plaque', [(-w_ / 2, yy - .45, y0), (w_ / 2, yy - .45, y0), (w_ / 2, yy - .45, y0 + h_), (-w_ / 2, yy - .45, y0 + h_)], [(0, 0), (1, 0), (1, 1), (0, 1)])
        if fl < floors - 1:  # 아래 처마(고리)와 위층
            so = 6 + porch; zr = yt + 1.5; ins = 3
            b.box('beam', (X0 - .6, yF - .6, yt), (X1 + .6, yB + .6, yt + 1.6), top='wood')
            hip(b, 0, (yF + yB) / 2, A0 + so * .8, (yB - yF) / 2 + so, zr - 1.5, 6.5, 0, 5, 1.4, prof, inner=(A0 - ins + .5, (yB - yF) / 2 - ins / 2 + .5), N=12, M=4, rtw=rtw, rtl=rtl, ftw=ftw)
            yF += ins; yB -= ins * .5; X0 += ins; X1 -= ins; z = yt + 5.5
            if g('balcony'):
                yr = yF - ins + 1; rh = 5.5
                b.box('woodl', (X0 - 1.5, yr - 1, z - .6), (X1 + 1.5, yF, z))
                n = max(2, round((X1 - X0) / 6))
                for i in range(n + 1): x = X0 - 1 + (X1 - X0 + 2) * i / n; b.box('wood', (x - .5, yr - .5, z), (x + .5, yr + .5, z + rh))
                b.box('woodl', (X0 - 1.5, yr - .8, z + rh - .9), (X1 + 1.5, yr + .8, z + rh)); b.box('wood', (X0 - 1.5, yr - .4, z + 2), (X1 + 1.5, yr + .4, z + 2.7))
            z = z
    # 3) 지붕
    ov, ovx = 7.5 / ZS * 1.4 + (porch if floors == 1 else 0), 5 + (2 if g('plat') else 0); cy = (yF + yB) / 2; A = (X1 - X0) / 2 + ovx; B = (yB - yF) / 2 + ov
    zW = yt + 1.0; tp = math.tan(math.radians(g('pitch', 28))); Hr = (B) * tp * (1.15 if roofType != 'thatch' else 1.05); H0 = zW - ov * tp * .55; th = 2.4 if roofType == 'thatch' else 1.5
    aw = (X1 - X0) / 2
    if roofType == 'gable' or roofType == 'thatch' and False:
        pt = gable(b, 0, cy, A, B, H0, Hr, 3.5 if roofType != 'thatch' else 0, th, prof, rtw=rtw, rtl=rtl, ftw=ftw)
        for sx in (-1, 1): gable_wall(b, sx * aw, yF, yB, yt, lambda y: H0 + Hr * prof(1 - abs(y - cy) / B) - th - .2, 'plaster', sx)
        zr = H0 + Hr; ridgeL = A
    elif roofType == 'thatch':
        rid = max(2, A - B * 1.1)
        pt = hip(b, 0, cy, A, B, H0, Hr, rid, 0, th, prof, rtw=rtw, rtl=rtl, ftw=ftw); zr = H0 + Hr; ridgeL = rid
    elif roofType == 'hip':
        rid = max(2, A * .42); pt = hip(b, 0, cy, A, B, H0, Hr, rid, 6, th, prof, rtw=rtw, rtl=rtl, ftw=ftw); zr = H0 + Hr; ridgeL = rid
        for face, a in [(0, 0), (0, 1), (1, 0), (1, 1)]: b.tube('ridgeend', [tuple(Vector(pt(face, a, k / 12)) + Vector((0, 0, .3))) for k in range(13)], 1.6, 1.4)
    else:  # 팔작: 아래 45%는 네 물매, 위는 박공
        f1 = .45; iA, iB = A - B * f1 * 1.1, B * (1 - f1); H1 = Hr * prof(f1)
        pt = hip(b, 0, cy, A, B, H0, H1, 0, 6, th, lambda t: prof(t * f1) / prof(f1), inner=(iA, iB), rtw=rtw, rtl=rtl, ftw=ftw)
        for face, a in [(0, 0), (0, 1), (1, 0), (1, 1)]: b.tube('ridgeend', [tuple(Vector(pt(face, a, k / 8)) + Vector((0, 0, .3))) for k in range(9)], 1.5, 1.3)
        Hr2 = Hr - H1; prof2 = lambda t: (prof(f1 + (1 - f1) * t) - prof(f1)) / (1 - prof(f1))
        pt2 = gable(b, 0, cy, iA, iB, H0 + H1, Hr2, 0, th, prof2, N=12, M=5, rtw=rtw, rtl=rtl, ftw=ftw)
        for sx in (-1, 1): gable_wall(b, sx * (iA - 1.2), cy - iB, cy + iB, H0 + H1 - th, lambda y: H0 + H1 + Hr2 * prof2(1 - abs(y - cy) / iB) - th - .2, 'wood', sx)
        zr = H0 + Hr; ridgeL = iA
    # 용마루
    if roofType == 'thatch':
        b.tube('ridge', [(x, cy, zr - .8) for x in [-ridgeL - 1 + (2 * ridgeL + 2) * k / 6 for k in range(7)]], 3.2, 2)
    else:
        rgh = rg[1][1] / TX * ES * 1.1; b.box('ridge', (-ridgeL - 1, cy - 1.6, zr - rgh * .5), (ridgeL + 1, cy + 1.6, zr + rgh * .6), top='ridgeend', ts=ES)
        for sx in (-1, 1):  # 치미
            x = sx * (ridgeL + 1); o = 0 if sx > 0 else -2.4
            b.box('ridgeend', (x + o, cy - 1.4, zr - 1), (x + o + 2.4, cy + 1.4, zr + 3.8)); b.box('ridgeend', (x + o + (-.6 if sx > 0 else 1.2), cy - 1, zr + 3.8), (x + o + (1.8 if sx > 0 else 3.6) - 1.2, cy + 1, zr + 5.2))
    return b

def export(b, name):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    for key, bmh in b.bm.items():
        path, color, size = b.mat[key]; m = bpy.data.materials.new(key); m.use_nodes = True; bs = m.node_tree.nodes['Principled BSDF']
        bs.inputs['Roughness'].default_value = 1
        if path:
            tn = m.node_tree.nodes.new('ShaderNodeTexImage'); tn.image = bpy.data.images.load(path); tn.interpolation = 'Closest'
            m.node_tree.links.new(tn.outputs['Color'], bs.inputs['Base Color']); m.node_tree.links.new(tn.outputs['Alpha'], bs.inputs['Alpha'])
        else: bs.inputs['Base Color'].default_value = (*color, 1)
        me = bpy.data.meshes.new(key); bmh.normal_update(); bmh.to_mesh(me); bmh.free(); ob = bpy.data.objects.new(key, me); bpy.context.collection.objects.link(ob); ob.data.materials.append(m)
    em = bpy.data.objects.new('lamps', None); em['pts'] = json.dumps([[round(v, 2) for v in p] for p in b.lamps]); bpy.context.collection.objects.link(em)
    out = os.path.join(OUT, name + '.glb'); bpy.ops.export_scene.gltf(filepath=out, export_format='GLB', export_yup=True, export_extras=True, export_image_format='AUTO')
    return os.path.getsize(out)

def jobs():
    for k, sp in SPEC.items(): yield 'b_' + k, sp, ST[k], ROOF[k]
    # 문파·세가 전각: (문파, 지도에 놓인 소품). js/maps.js의 nine(구파 회관), 오대세가 거리, 소림사 나한당
    PAIRS = [('shaolin', 'house_red'), ('wudang', 'hut_b'), ('hwasan', 'hut_o'), ('jongnam', 'hut_o2'), ('emei', 'shop_green'), ('gonryun', 'wood_b'), ('gongdong', 'clay'), ('jeomchang', 'wood_o'),
             ('cheongseong', 'hut_b'), ('gaebang', 'straw'), ('namgung', 'hall'), ('moyong', 'lodge'), ('jegal', 'house_red'), ('dang', 'shop_green'), ('paeng', 'clay'), ('shaolin', 'lodge'),
             ('hwangbo', 'house_red'), ('ak', 'lodge'), ('yang', 'wood_b'), ('eon', 'clay'), ('jin', 'shop_blue'), ('haenam', 'wood_o'), ('cheonsan', 'wood_b'), ('jeonjin', 'hut_b'), ('mosan', 'hut_o2'), ('jangbaek', 'clay'), ('pota', 'shop_green')]
    for k, base in PAIRS:
        gs = GRAND[k]; sp = {**SPEC[base], **gs, **SHAPE.get(k, {})}; yield 'g_' + k + '_' + base, sp, ST[base], GROOF.get(k, 'xieshan')

if __name__ == '__main__':
    want = [a for a in sys.argv[1:] if not a.endswith('.json')]
    for name, sp, st, rt in jobs():
        if want and name not in want: continue
        b = build(name, sp, st, rt); print(name, rt, export(b, name))
