# 블렌더 모형 공용 도구(전투 무대 stages.py, 방 틀 rooms.py가 쓴다). houses.py의 Build·export를 그대로 옮긴 것이다.
# 길이는 평면도 점(사람 키 15점). 블렌더 좌표: x 오른쪽, y 뒤(북쪽), z 위. 게임(js/hd2d.js)은 (1, HS, ZS)로 늘려 세운다.
# 그림은 assets/hd2d/preview/<이름>.webp를 쓴다(무늬는 되풀이된다). 그림 없이 빛깔만 줄 수도 있다.
import bpy, bmesh, math, os, json
from mathutils import Vector
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
PV = os.path.join(ROOT, 'assets', 'hd2d', 'preview'); OUT = os.path.join(ROOT, 'assets', 'hd2d', 'models'); TMP = '/tmp/bl_tex_kit'
os.makedirs(OUT, exist_ok=True); os.makedirs(TMP, exist_ok=True)
TX = 2.67  # 평면도 1점에 그림 2.67점

def hexc(h): h = h.lstrip('#'); return tuple(int(h[i:i + 2], 16) / 255 for i in (0, 2, 4))
def tex(name, tint=None):
    """미리보기 그림을 PNG로 옮겨 (경로, 크기)를 준다. tint는 '#rrggbb' 곱하기."""
    im = Image.open(os.path.join(PV, name + '.webp')).convert('RGBA')
    if tint:
        c = hexc(tint); px = im.load()
        for y in range(im.height):
            for x in range(im.width): r, g, b, a = px[x, y]; px[x, y] = (int(r * c[0]), int(g * c[1]), int(b * c[2]), a)
    p = os.path.join(TMP, name + (tint or '').replace('#', '_') + '.png'); im.save(p); return p, im.size

class Build:
    def __init__(s): s.bm = {}; s.mat = {}; s.lamps = []
    def T(s, key, name, tint=None):   # 그림 재질
        if key not in s.mat: p, sz = tex(name, tint); s.mat[key] = (p, (1, 1, 1), sz)
        return key
    def C(s, key, hx):                # 빛깔 재질
        if key not in s.mat: s.mat[key] = (None, hexc(hx), None)
        return key
    def quad(s, key, P, UV=((0, 0), (1, 0), (1, 1), (0, 1))):
        if key not in s.bm: s.bm[key] = bmesh.new()
        b = s.bm[key]; vs = [b.verts.new(p) for p in P]; f = b.faces.new(vs); uv = b.loops.layers.uv.verify()
        for l, t in zip(f.loops, UV): l[uv].uv = t
    def size(s, key): p, c, sz = s.mat[key]; return (sz[0] / TX, sz[1] / TX) if sz else (1e9, 1e9)
    def box(s, key, a, b, top=None):  # a=(x0,y0,z0) b=(x1,y1,z1). top: 윗면 재질
        x0, y0, z0 = a; x1, y1, z1 = b; tw, th = s.size(key); k2 = top or key; t2w, t2h = s.size(k2)
        U = lambda u: u / tw; V = lambda v: v / th
        s.quad(key, [(x0, y0, z0), (x1, y0, z0), (x1, y0, z1), (x0, y0, z1)], [(0, 0), (U(x1 - x0), 0), (U(x1 - x0), V(z1 - z0)), (0, V(z1 - z0))])
        s.quad(key, [(x1, y1, z0), (x0, y1, z0), (x0, y1, z1), (x1, y1, z1)], [(0, 0), (U(x1 - x0), 0), (U(x1 - x0), V(z1 - z0)), (0, V(z1 - z0))])
        s.quad(key, [(x0, y1, z0), (x0, y0, z0), (x0, y0, z1), (x0, y1, z1)], [(0, 0), (U(y1 - y0), 0), (U(y1 - y0), V(z1 - z0)), (0, V(z1 - z0))])
        s.quad(key, [(x1, y0, z0), (x1, y1, z0), (x1, y1, z1), (x1, y0, z1)], [(0, 0), (U(y1 - y0), 0), (U(y1 - y0), V(z1 - z0)), (0, V(z1 - z0))])
        s.quad(k2, [(x0, y0, z1), (x1, y0, z1), (x1, y1, z1), (x0, y1, z1)], [(0, 0), ((x1 - x0) / t2w, 0), ((x1 - x0) / t2w, (y1 - y0) / t2h), (0, (y1 - y0) / t2h)])
    def cyl(s, key, c, r, z0, z1, n=10):
        for i in range(n):
            a0, a1 = 2 * math.pi * i / n, 2 * math.pi * (i + 1) / n; p0 = (c[0] + r * math.cos(a0), c[1] + r * math.sin(a0)); p1 = (c[0] + r * math.cos(a1), c[1] + r * math.sin(a1))
            s.quad(key, [(p0[0], p0[1], z0), (p1[0], p1[1], z0), (p1[0], p1[1], z1), (p0[0], p0[1], z1)], [(i / n, 0), ((i + 1) / n, 0), ((i + 1) / n, 1), (i / n, 1)])
    def tube(s, key, pts, w, h):       # 줄·난간: 점들을 잇는 네모 막대
        secs = []
        for i, p in enumerate(pts):
            a = Vector(pts[min(i + 1, len(pts) - 1)]) - Vector(pts[max(i - 1, 0)]); a.normalize(); side = a.cross(Vector((0, 0, 1)))
            if side.length < 1e-6: side = Vector((1, 0, 0))
            side.normalize(); up = side.cross(a); up.normalize(); P = Vector(p)
            secs.append([P - side * w / 2, P + side * w / 2, P + side * w / 2 + up * h, P - side * w / 2 + up * h])
        for i in range(len(secs) - 1):
            A, B = secs[i], secs[i + 1]
            for k in range(4): k2 = (k + 1) % 4; s.quad(key, [tuple(A[k]), tuple(A[k2]), tuple(B[k2]), tuple(B[k])])
    def cloth(s, key, x, y, z0, z1, w):  # 깃발 천: 앞을 보는 얇은 판(양면)
        s.quad(key, [(x, y, z0), (x + w, y, z0), (x + w, y, z1), (x, y, z1)]); s.quad(key, [(x + w, y + .2, z0), (x, y + .2, z0), (x, y + .2, z1), (x + w, y + .2, z1)])

def export(b, name):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    for key, bmh in b.bm.items():
        path, color, size = b.mat[key]; m = bpy.data.materials.new(key); m.use_nodes = True; bs = m.node_tree.nodes['Principled BSDF']
        bs.inputs['Roughness'].default_value = 1
        if path:
            tn = m.node_tree.nodes.new('ShaderNodeTexImage'); tn.image = bpy.data.images.load(path); tn.interpolation = 'Closest'
            m.node_tree.links.new(tn.outputs['Color'], bs.inputs['Base Color'])
        else: bs.inputs['Base Color'].default_value = (*color, 1)
        me = bpy.data.meshes.new(key); bmh.normal_update(); bmh.to_mesh(me); bmh.free(); ob = bpy.data.objects.new(key, me); bpy.context.collection.objects.link(ob); ob.data.materials.append(m)
    em = bpy.data.objects.new('lamps', None); em['pts'] = json.dumps([[round(v, 2) for v in p] for p in b.lamps]); bpy.context.collection.objects.link(em)
    out = os.path.join(OUT, name + '.glb'); bpy.ops.export_scene.gltf(filepath=out, export_format='GLB', export_yup=True, export_extras=True, export_image_format='AUTO')
    return os.path.getsize(out)
