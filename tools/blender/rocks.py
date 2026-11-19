# 바위, 바위 무더기, 바위산, 절벽 조각을 블렌더로 만든다 → assets/hd2d/models/rk_*.glb
# 전에는 바위와 바위산을 2D 그림 판으로 세워 두었는데, 땅이 눕고 집이 모형이 되니 그림 판만 종이처럼 서 보였다(주인 지적, 2026-11-19).
# 만드는 법: 점 열몇 개의 볼록 껍질로 모난 덩어리를 만들고(바위), 밑이 넓고 위가 좁은 덩어리를 세워 봉우리를 만든 다음, 여러 개를 겹쳐 쌓는다.
# 무늬는 받아 둔 절벽 그림(HK3 → assets/hd2d/preview/cl_rock.webp)을 면마다 입히고, 꼭짓점 색으로 밑동의 그늘·이끼·눈을 넣는다.
# 길이는 평면도 점(사람 키 15점). 블렌더 좌표: x 오른쪽, y 뒤(북쪽), z 위. 원점은 밑면 가운데(바위산은 앞쪽 밑동 가운데). 게임이 (1, HS, ZS)로 늘려 세운다.
# 쓰는 법: python3 tools/blender/rocks.py [이름…]   (이름을 안 주면 전부)
import bpy, bmesh, math, os, random, sys
from mathutils import Vector
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
PV = os.path.join(ROOT, 'assets', 'hd2d', 'preview'); OUT = os.path.join(ROOT, 'assets', 'hd2d', 'models')
os.makedirs(OUT, exist_ok=True)
DOT = 48 / 15  # 평면도 1점에 그림 3.2점

def texsize():
    """절벽 그림 한 장이 덮는 평면도 넓이(가로, 세로). 빛깔(brown 그대로, grey 잿빛, snow 눈, red 붉은 바위)은 게임이 입힐 때 바꾼다"""
    im = Image.open(os.path.join(PV, 'cl_rock.webp')); return im.width / DOT, im.height / DOT

def hull(pts):
    bm = bmesh.new(); vs = [bm.verts.new(p) for p in pts]; r = bmesh.ops.convex_hull(bm, input=vs)
    for v in r['geom_interior']:
        if isinstance(v, bmesh.types.BMVert) and v.is_valid: bm.verts.remove(v)
    bm.normal_update(); return bm

def boulder(rng, sx, sy, sz, n=14):
    """모난 바위: 반타원체 위의 점들과 땅에 묻힌 밑 테"""
    pts = []
    for i in range(n):
        a = rng.uniform(0, 2 * math.pi); e = rng.uniform(.2, 1); r = math.sqrt(max(0, 1 - e * e)) * rng.uniform(.82, 1.05)
        pts.append((math.cos(a) * r * sx, math.sin(a) * r * sy, e * sz * rng.uniform(.85, 1.05)))
    k = rng.randint(6, 8)
    for i in range(k):
        a = 2 * math.pi * (i + rng.uniform(-.3, .3)) / k; pts.append((math.cos(a) * sx * rng.uniform(.88, 1.1), math.sin(a) * sy * rng.uniform(.88, 1.1), -sz * .12))
    return hull(pts)

def spire(rng, r, h, lean=(0, 0), ry=None):
    """봉우리: 밑이 넓고 위가 좁은 모난 기둥. lean만큼 꼭대기가 기운다"""
    ry = ry or r; pts = []; k = rng.randint(5, 7)
    for i in range(k):
        a = 2 * math.pi * (i + rng.uniform(-.25, .25)) / k; pts.append((math.cos(a) * r * rng.uniform(.85, 1.15), math.sin(a) * ry * rng.uniform(.85, 1.15), -2))
    k = rng.randint(4, 6); zz = h * rng.uniform(.4, .6)
    for i in range(k):
        a = 2 * math.pi * (i + rng.uniform(-.3, .3)) / k; pts.append((lean[0] * .5 + math.cos(a) * r * .72 * rng.uniform(.8, 1.1), lean[1] * .5 + math.sin(a) * ry * .72 * rng.uniform(.8, 1.1), zz * rng.uniform(.85, 1.15)))
    k = rng.randint(3, 4)
    for i in range(k):
        a = 2 * math.pi * (i + rng.uniform(-.3, .3)) / k; pts.append((lean[0] + math.cos(a) * r * .36, lean[1] + math.sin(a) * ry * .36, h * rng.uniform(.82, 1)))
    return hull(pts)

class Model:
    def __init__(s, kind='grey', moss=.0, snow=False): s.bm = bmesh.new(); s.kind = kind; s.moss = moss; s.snow = snow; s.rng = None; s.tw, s.th = 1, 1; s.tops = False
    def add(s, part, at, bright=1.0, rot=0.0, top=False):
        """덩어리 하나를 옮겨 붙인다. 면마다 무늬 자리와 꼭짓점 색을 정한다. top이면 위를 보는 면을 '땅' 재질(둘째 재질)로 둔다: 게임이 그 면에 그 자리의 땅 그림을 입힌다"""
        uvl = s.bm.loops.layers.uv.verify(); col = s.bm.loops.layers.color.verify(); rng = s.rng
        c, sn = math.cos(rot), math.sin(rot); vmap = {}
        for v in part.verts:
            x, y, z = v.co; vmap[v] = s.bm.verts.new((at[0] + x * c - y * sn, at[1] + x * sn + y * c, at[2] + z))
        off = (rng.uniform(0, 60), rng.uniform(0, 20))  # 덩어리마다 무늬 자리를 달리해 같은 돌이 되풀이되지 않게
        for f in part.faces:
            vs = [vmap[v] for v in f.verts]
            try: nf = s.bm.faces.new(vs)
            except ValueError: continue
            n = Vector((f.normal.x * c - f.normal.y * sn, f.normal.x * sn + f.normal.y * c, f.normal.z))
            up = n.z > .55; mossy = up and s.moss and rng.random() < s.moss; gnd = top and n.z > .8
            if gnd: nf.material_index = 1; s.tops = True
            for l in nf.loops:
                p = l.vert.co
                if abs(n.z) > .7: u, v = p.x / s.tw + off[0], p.y / s.tw + off[1]
                else:
                    t = Vector((-n.y, n.x, 0)); t.normalize(); u, v = (p.x * t.x + p.y * t.y) / s.tw + off[0], p.z / s.th + off[1]
                l[uvl].uv = (u, v)
                ao = .72 + .28 * min(1, max(0, p.z) / 14)  # 밑동은 어둡게
                k = bright * ao
                if gnd: rgb = (1, 1, 1)
                elif s.snow: rgb = (k, k, k) if up else (k * .80, k * .84, k * .93)   # 눈: 위를 보는 면은 희게, 옆면은 푸른 그늘
                elif mossy: rgb = (k * .60, k * .74, k * .42)                          # 이끼: 위를 보는 면에 드문드문
                else: rgb = (k, k, k)
                l[col] = (*rgb, 1)
        part.free()
    def export(s, name):
        bpy.ops.wm.read_factory_settings(use_empty=True)
        # 무늬 그림은 모형에 넣지 않는다(모형마다 40KB씩 겹친다). 재질 이름(rock_<빛깔>)을 보고 게임이 절벽 그림을 그 빛깔로 바꿔 입힌다(js/hd2d.js rockTex)
        m = bpy.data.materials.new('rock_' + s.kind); m.use_nodes = True; bs = m.node_tree.nodes['Principled BSDF']; bs.inputs['Roughness'].default_value = 1
        me = bpy.data.meshes.new(name); s.bm.normal_update(); s.bm.to_mesh(me); nf = len(s.bm.faces); s.bm.free()
        ob = bpy.data.objects.new(name, me); bpy.context.collection.objects.link(ob); ob.data.materials.append(m)
        if s.tops: ob.data.materials.append(bpy.data.materials.new('top'))  # 위 면: 게임이 땅 그림을 입힌다(js/hd2d.js topMat)
        if me.color_attributes: me.color_attributes.active_color = me.color_attributes[0]; me.color_attributes.render_color_index = 0
        out = os.path.join(OUT, name + '.glb')
        bpy.ops.export_scene.gltf(filepath=out, export_format='GLB', export_yup=True, export_image_format='AUTO', export_vertex_color='ACTIVE', export_all_vertex_colors=True, export_active_vertex_color_when_no_material=True)
        return nf, os.path.getsize(out)

def new(kind, seed, **kw):
    m = Model(kind, **kw); m.rng = random.Random(seed); m.tw, m.th = texsize(); return m

# ── 낱개 바위(boulder 소품 자리: 막힘 25×14점) ──
def make_boulder(name, kind, seed, **kw):
    m = new(kind, seed, **kw); r = m.rng
    m.add(boulder(r, 12, 7.5, r.uniform(13, 17), 16), (0, 0, 0), r.uniform(.94, 1.06), r.uniform(0, 6.28))
    if r.random() < .8: m.add(boulder(r, 5.5, 4, r.uniform(5, 8), 10), (r.choice((-1, 1)) * r.uniform(9, 12), -r.uniform(2, 5), 0), r.uniform(.9, 1.05), r.uniform(0, 6.28))
    return m.export(name)

# ── 작은 돌(g_mossrock, g_rocks 자리: 폭 16~18점) ──
def make_pebble(name, kind, seed, **kw):
    m = new(kind, seed, **kw); r = m.rng
    for i in range(r.randint(2, 3)): m.add(boulder(r, r.uniform(3.5, 5.5), r.uniform(2.5, 3.6), r.uniform(4, 7), 10), (r.uniform(-4.5, 4.5), r.uniform(-1.5, 1.5), 0), r.uniform(.92, 1.06), r.uniform(0, 6.28))
    return m.export(name)

# ── 바위 무더기(rocks 소품 자리: 막힘 54×18점) ── 큰 바위 둘셋이 기대어 선 더미. 그 둘레에 작은 바위
def make_rocks(name, kind, seed, **kw):
    m = new(kind, seed, **kw); r = m.rng; n = r.randint(2, 3)
    for i in range(n):
        x = (i + .5) / n * 44 - 22 + r.uniform(-3, 3); sx = r.uniform(10, 14); sz = r.uniform(15, 24)
        m.add(boulder(r, sx, sx * r.uniform(.6, .75), sz, 15), (x, r.uniform(0, 3), 0), r.uniform(.94, 1.08), r.uniform(0, 6.28))
    for i in range(r.randint(4, 6)): m.add(boulder(r, r.uniform(5, 8), r.uniform(4, 6), r.uniform(6, 10), 12), (r.uniform(-25, 25), r.uniform(-7, 1), 0), r.uniform(.9, 1.05), r.uniform(0, 6.28))
    return m.export(name)

# ── 바위산(큰 지도의 mtn 소품 자리: 그림은 125×75점. 모형은 폭 108, 깊이 46쯤, 봉우리 56~64) ──
# 넓은 밑에서 등성이로 좁아지는 몸통을 먼저 세우고, 그 겉에 모난 바위를 박아 넣는다. 등성이에는 뾰족한 봉우리 몇 개. 멀리서 보면 세모난 바위 더미다(2D 그림과 같은 생김새)
def make_mtn(name, kind, seed, **kw):
    m = new(kind, seed, **kw); r = m.rng; W, D, H = 108, 46, r.uniform(56, 64); cy = D * .5
    surf = lambda x, y: H * max(0, 1 - abs(x) / (W / 2)) ** .9 * max(0, 1 - abs(y - cy) / (D * .62)) ** .7   # 몸통 겉의 높이
    pts = []
    for i in range(11):
        a = 2 * math.pi * (i + r.uniform(-.25, .25)) / 11; pts.append((math.cos(a) * W / 2 * r.uniform(.9, 1.04), cy + math.sin(a) * D / 2 * r.uniform(.9, 1.04), -2))
    for i in range(8):
        a = 2 * math.pi * (i + r.uniform(-.3, .3)) / 8; pts.append((math.cos(a) * W * .3 * r.uniform(.85, 1.1), cy + math.sin(a) * D * .3 * r.uniform(.85, 1.1), H * .42 * r.uniform(.85, 1.1)))
    for i in range(4): pts.append((r.uniform(-W * .12, W * .12), cy + r.uniform(-D * .1, D * .1), H * r.uniform(.74, .86)))
    m.add(hull(pts), (0, 0, 0), 1.0)
    for i in range(r.randint(24, 28)):                                                                       # 겉에 박힌 모난 바위(위로 갈수록 뾰족하다)
        x = r.uniform(-W * .46, W * .46); y = cy + r.uniform(-D * .46, D * .4); z = surf(x, y)
        if z < 2 and r.random() < .5: continue
        f = z / H; sx = r.uniform(8, 13) * (1 - .3 * f); sz = r.uniform(9, 15) * (1 + .5 * f)
        m.add(boulder(r, sx, sx * r.uniform(.7, .95), sz, 13), (x, y, max(0, z - sz * .45)), r.uniform(.92, 1.08), r.uniform(0, 6.28))
    for i in range(r.randint(3, 5)):                                                                         # 등성이의 봉우리
        x = r.uniform(-W * .22, W * .22); y = cy + r.uniform(-D * .12, D * .12); z = surf(x, y)
        m.add(spire(r, r.uniform(9, 12), r.uniform(18, 26), (r.uniform(-2, 2), r.uniform(-1, 2)), r.uniform(7, 9)), (x, y, max(0, z - 10)), r.uniform(.95, 1.08))
    for i in range(r.randint(9, 12)):                                                                        # 발치의 바위
        s2 = r.uniform(5, 9); m.add(boulder(r, s2 * r.uniform(.9, 1.4), s2 * .8, s2 * r.uniform(.6, 1), 12), (r.uniform(-W / 2, W / 2), r.uniform(-3, D * .16), 0), r.uniform(.92, 1.06), r.uniform(0, 6.28))
    return m.export(name)

# ── 판돌(절벽과 벼랑바위를 쌓는 낱장): 상자의 여덟 모서리를 제각각 깎아 낸 모난 덩어리. 가운데가 원점이다(붙일 때 조금씩 돌려 놓는다) ──
# flat이면 윗면을 깎지 않고 뒤쪽(+y) 위 모서리도 그대로 둔다(절벽 맨 위 켜: 윗면이 높은 땅과 같은 높이로 평평해야 땅 그림이 그대로 이어진다). nose는 앞면(-y) 가운데가 튀어나오는 만큼
def slab(rng, sx, sy, sz, cut=.24, nose=1.6, flat=False):
    pts = []
    for ix in (-1, 1):
        for iy in (-1, 1):
            for iz in (-1, 1):
                c = [ix * sx / 2, iy * sy / 2, iz * sz / 2]; d = [sx * cut * rng.uniform(.25, 1), sy * cut * rng.uniform(.25, 1), sz * cut * rng.uniform(.25, 1)]
                if iz < 0 or (flat and iy > 0): pts.append(tuple(c)); continue   # 밑은 묻히니 그대로
                for a in range(3):
                    if a == 2 and flat: continue
                    q = list(c); q[a] -= (ix, iy, iz)[a] * d[a]; pts.append(tuple(q))
    xm = rng.uniform(-.28, .28) * sx
    pts.append((xm, -sy / 2 - rng.uniform(.3, 1) * nose, rng.uniform(-.35, .1) * sz)); pts.append((xm + rng.uniform(-1.5, 1.5), -sy / 2 - rng.uniform(.2, .8) * nose, rng.uniform(.15, .4) * sz * (0 if flat else 1)))
    return hull(pts)

# ── 벼랑바위(산길 지도의 가장자리와 뒤 배경: 폭 60, 깊이 34, 키 50~90). 판돌을 층층이 쌓은 바위 봉우리 서넛이 한 덩어리로 서 있다 ──
# 전에는 뾰족한 기둥 묶음이라 말뚝처럼 보였다. 기준 그림(docs/ref/ws-terrain.jpg)의 바위는 켜켜이 갈라진 덩어리다
def tower(m, r, cx, cy, w, d, h, lean=0):
    n = max(2, round(h / r.uniform(10, 15))); z = -2
    for i in range(n):
        t = i / n; k = 1 - .5 * t ** 1.3; zz = h * (i + 1) / n + r.uniform(-1.5, 1.5) if i < n - 1 else h
        ww = w * k * r.uniform(.88, 1.1); dd = d * k * r.uniform(.88, 1.1); ox = lean * t + r.uniform(-1.6, 1.6) * (1 - .3 * t); oy = r.uniform(-1.5, 1.5)
        m.add(slab(r, ww, dd, zz - z + .8, cut=r.uniform(.2, .32), nose=2.4), (cx + ox, cy + oy, (z - .8 + zz) / 2), r.uniform(.9, 1.08), r.uniform(-.2, .2)); z = zz
def make_crag(name, kind, seed, **kw):
    m = new(kind, seed, **kw); r = m.rng; n = r.randint(3, 4); xs = sorted(r.uniform(-20, 20) for i in range(n))
    for i, x in enumerate(xs):
        f = max(0, 1 - abs(x) / 30); tower(m, r, x, r.uniform(12, 22), r.uniform(17, 24), r.uniform(13, 18), r.uniform(50, 90) * (.55 + .45 * f), r.uniform(-4, 4))
    for i in range(r.randint(3, 5)): tower(m, r, r.uniform(-26, 26), r.uniform(3, 10), r.uniform(11, 16), r.uniform(8, 12), r.uniform(14, 34), r.uniform(-2, 2))
    for i in range(r.randint(5, 7)):
        s = r.uniform(4.5, 8); m.add(boulder(r, s * 1.25, s * .8, s * .75, 12), (r.uniform(-30, 30), r.uniform(-3, 4), 0), r.uniform(.9, 1.05), r.uniform(0, 6.28))
    return m.export(name)

# ── 절벽 조각(높낮이 지형의 면에 붙인다) ──
# 온 조각(cf)은 폭 32점(두 칸), 반 조각(ch)은 16점(한 칸). 높이는 단 수 × 9점. 원점은 면의 아래 가운데. 앞(-y)이 낮은 쪽, 뒤(+y)는 높은 땅 속에 묻힌다
# 세로 기둥 두셋을 판돌 몇 켜로 쌓는다. 아래 켜가 더 튀어나온다(벼랑 밑이 넓다). 맨 위 켜의 윗면은 높은 땅과 같은 높이이고 '땅' 재질이라, 땅이 들쭉날쭉한 바위 끝까지 이어져 보인다
# (반듯한 칸 가장자리가 안 보인다). 발치에 작은 돌이 드문드문 있다
def make_cliff(name, kind, seed, levels=1, width=32, **kw):
    m = new(kind, seed, **kw); r = m.rng; H = 9 * levels; n = max(1, round(width / r.uniform(9, 15)))
    xs = [-width / 2] + sorted((i + 1) / n * width - width / 2 + r.uniform(-2.5, 2.5) for i in range(n - 1)) + [width / 2]
    for i in range(n):
        xa, xb = xs[i] - r.uniform(.4, 1.8), xs[i + 1] + r.uniform(.4, 1.8); out = r.uniform(1.2, 4.8)
        pillar = levels > 1 and r.random() < .3                                                                   # 통바위: 켜를 나누지 않은 큰 덩어리 하나(반듯한 줄눈이 되풀이되지 않게)
        nl = 1 if pillar else max(1, round(H / r.uniform(6.5, 11)))
        zs = [-1.5] + sorted(H * (j + 1) / nl + r.uniform(-1.6, 1.6) for j in range(nl - 1)) + [H]
        for j in range(nl):
            t = (zs[j] + zs[j + 1]) / 2 / H; top = j == nl - 1; z0 = zs[j] - (.6 if j else 0); z1 = zs[j + 1]
            y0 = -(out + (1 - t) * (1 + .7 * levels) + r.uniform(-.9, .9) + (1.6 if r.random() < .2 else 0))    # 앞으로 튀어나온 만큼(아래 켜일수록 더)
            y1 = .4 if top else 2.5                                                                               # 맨 위 켜의 윗면은 높은 땅과 같은 높이로 맞닿는다(땅 그림이 이어진다)
            sh = r.uniform(-.9, .9) * (0 if top else 1)
            m.add(slab(r, xb - xa, y1 - y0, z1 - z0, cut=r.uniform(.16, .34), nose=1.2 + .3 * levels, flat=top), ((xa + xb) / 2 + sh, (y0 + y1) / 2, (z0 + z1) / 2), r.uniform(.9, 1.08), r.uniform(-.14, .14) * (0 if top else 1), top=top)
        if pillar:                                                                                                # 통바위 밑에 기댄 받침돌
            w2 = (xb - xa) * r.uniform(.5, .8); h2 = H * r.uniform(.3, .5); d2 = r.uniform(3, 5)
            m.add(slab(r, w2, d2, h2 + 1.5, cut=r.uniform(.2, .34), nose=1.5), (r.uniform(xa + w2 / 2, xb - w2 / 2), -(out + 1 + .7 * levels) - d2 * .3, (h2 - 1.5) / 2), r.uniform(.9, 1.06), r.uniform(-.25, .25))
    for i in range(r.randint(0, 2) if width > 20 else r.randint(0, 1)):
        s2 = r.uniform(2.2, 3.8); m.add(boulder(r, s2 * 1.3, s2, s2 * .9, 10), (r.uniform(-width / 2 + 2, width / 2 - 2), -r.uniform(5.5, 8) - .7 * levels, 0), r.uniform(.9, 1.04), r.uniform(0, 6.28))
    return m.export(name)

MODELS = {}
for i in (1, 2, 3):
    MODELS[f'rk_mtn_{i}'] = lambda n, i=i: make_mtn(n, 'grey', 100 + i, moss=.55)
    MODELS[f'rk_mtns_{i}'] = lambda n, i=i: make_mtn(n, 'snow', 100 + i, snow=True)
    MODELS[f'rk_mtnd_{i}'] = lambda n, i=i: make_mtn(n, 'red', 100 + i)
    MODELS[f'rk_boulder_{i}'] = lambda n, i=i: make_boulder(n, 'grey', 200 + i, moss=.5)
for i in (1, 2):
    MODELS[f'rk_rocks_{i}'] = lambda n, i=i: make_rocks(n, 'grey', 300 + i, moss=.5)
    MODELS[f'rk_rockss_{i}'] = lambda n, i=i: make_rocks(n, 'snow', 300 + i, snow=True)
    MODELS[f'rk_pebble_{i}'] = lambda n, i=i: make_pebble(n, 'grey', 400 + i, moss=.6)
    MODELS[f'rk_crag_{i}'] = lambda n, i=i: make_crag(n, 'grey', 600 + i, moss=.45)
    MODELS[f'rk_cragb_{i}'] = lambda n, i=i: make_crag(n, 'brown', 600 + i, moss=.45)

for L in (1, 2, 3, 4):
    for i in (1, 2, 3): MODELS[f'rk_cf{L}_{i}'] = lambda n, L=L, i=i: make_cliff(n, 'brown', 700 + 10 * L + i, L, 32, moss=.3)
    for i in (1, 2): MODELS[f'rk_ch{L}_{i}'] = lambda n, L=L, i=i: make_cliff(n, 'brown', 750 + 10 * L + i, L, 16, moss=.3)

if __name__ == '__main__':
    for k in (sys.argv[1:] or list(MODELS)):
        nf, sz = MODELS[k](k); print(k, '면', nf, '크기', sz)
