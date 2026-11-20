# ==== 강호행 틀 v1 시작 (이 줄부터 "틀 끝"까지는 고치지 않는다) ====
# 강호행(무협 게임)에 넣을 블렌더 모형을 만드는 틀. 설명서: docs/chatgpt-blender.md
# 길이는 "평면도 점"(게임의 땅 한 칸이 16점). 좌표: x 오른쪽(동), y 뒤(북), z 위. 카메라는 남쪽(-y)에서 본다.
# 무늬(텍스처)와 UV는 넣지 않는다. 재질 "이름"만 달면 게임이 그 이름을 보고 도트 무늬를 입힌다.
import bpy, bmesh, math, os, json
from contextlib import contextmanager
from mathutils import Matrix, Vector

KIT = 1
BUILD = '2026-11-20b'  # 틀을 고친 날(끝 줄에 찍힌다. 받은 파일이 어느 틀로 만들어졌는지 본다)
OUT = os.environ.get('GANGHO_OUT') or os.path.join(os.path.expanduser('~'), 'gangho_models')
# 재질 이름표: 이름 -> (무엇, 임시 빛깔). 게임이 이 이름을 보고 무늬를 입힌다. 표에 없는 이름은 쓰지 않는다
PALETTE = {
    'wl_field': ('방 벽의 넓은 면(방 종류에 따라 회벽·판자·벽돌·흙벽으로 게임이 바꾼다)', '#b8aa8c'),
    'wl_base': ('방 벽의 아랫단(막돌, 다듬은 돌, 판자 굽도리)', '#7d7a74'),
    'wl_beam': ('방 벽 맨 위의 들보', '#4a3020'),
    'wl_post': ('방의 기둥', '#40281a'),
    'wl_roof': ('방 벽 위의 기와 덮개', '#3a3c44'),
    'wood_dark': ('짙은 나무(가구, 문틀, 창살)', '#4a3020'),
    'wood_red': ('붉은 칠을 한 나무', '#8a2a20'),
    'wood_pine': ('칠하지 않은 밝은 나무', '#b08a58'),
    'wood_black': ('검은 칠을 한 나무', '#24201e'),
    'plank': ('널빤지(마루, 판자, 배의 바닥)', '#6a4a30'),
    'bamboo': ('대나무', '#8a9a50'),
    'paper': ('종이, 창호지', '#e6dcc0'),
    'win_paper': ('불빛이 비치는 창호지(밤에 게임이 밝힌다)', '#ecdcb0'),
    'lantern': ('등불의 갓(밤에 게임이 밝힌다)', '#e8a050'),
    'stone': ('다듬은 잿빛 돌(계단, 난간, 기단, 석등)', '#8e8c88'),
    'stone_rough': ('막돌, 자연석 쌓기', '#7a766e'),
    'stone_dark': ('짙은 돌', '#4c4a50'),
    'brick': ('잿빛 전돌, 벽돌', '#7c7e80'),
    'plaster': ('누런 회벽', '#b8aa8c'),
    'plaster_white': ('흰 회벽', '#d8d0bc'),
    'earth': ('흙벽, 다진 흙', '#9a7a50'),
    'tile': ('기와', '#3a3c44'),
    'thatch': ('짚, 이엉', '#b09a58'),
    'rock_grey': ('잿빛 바위', '#8a8478'),
    'rock_brown': ('갈색 바위', '#7a6450'),
    'bark': ('나무 껍질', '#5a4634'),
    'leaf_pine': ('솔잎 뭉치', '#2f5a34'),
    'leaf_broad': ('넓은 잎 뭉치', '#4a7a3a'),
    'leaf_plum': ('매화 꽃 뭉치', '#d8a0b0'),
    'metal': ('쇠(칼날, 솥, 못, 경첩)', '#5a5e66'),
    'gold': ('금빛 장식', '#c8a040'),
    'rope': ('밧줄, 새끼줄', '#a08a60'),
    'cloth_red': ('붉은 천', '#a02820'),
    'cloth_blue': ('쪽빛 천', '#2c4a7a'),
    'cloth_white': ('흰 천, 삼베', '#d8d0c0'),
    'cloth_black': ('검은 천', '#22222a'),
    'cloth_yellow': ('누런 천', '#c8a040'),
}
_report, _cursor = [], [0.0]


def _lin(h):
    h = h.lstrip('#')
    return tuple(c / 12.92 if c <= .04045 else ((c + .055) / 1.055) ** 2.4 for c in (int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)))


def _material(name, hexrgb):
    m = bpy.data.materials.get(name) or bpy.data.materials.new(name)
    rgba = (*_lin(hexrgb), 1)
    m.diffuse_color = rgba
    try:
        m.use_nodes = True
    except Exception:
        pass
    nt = getattr(m, 'node_tree', None)
    for n in (nt.nodes if nt else []):
        if n.type == 'BSDF_PRINCIPLED':
            n.inputs['Base Color'].default_value = rgba
            n.inputs['Roughness'].default_value = 1
    return m


def _collection():
    c = bpy.data.collections.get('gangho')
    if not c:
        c = bpy.data.collections.new('gangho')
        bpy.context.scene.collection.children.link(c)
    return c


def _fix(bm):
    """덩어리마다 면의 앞뒤를 바깥쪽으로 맞춘다. 닫히지 않은(두께 없는) 덩어리의 수를 돌려준다"""
    bm.normal_update()
    seen, open_n = set(), 0
    for f in list(bm.faces):
        if f in seen:
            continue
        isl, stack = [], [f]
        seen.add(f)
        while stack:
            g = stack.pop()
            isl.append(g)
            for e in g.edges:
                for h in e.link_faces:
                    if h not in seen:
                        seen.add(h)
                        stack.append(h)
        closed = all(len(e.link_faces) == 2 for g in isl for e in g.edges)
        bmesh.ops.recalc_face_normals(bm, faces=isl)
        if closed:
            vol = sum(g.verts[0].co.dot(g.verts[i].co.cross(g.verts[i + 1].co)) for g in isl for i in range(1, len(g.verts) - 1))
            if vol < 0:
                bmesh.ops.reverse_faces(bm, faces=isl)
        else:
            open_n += 1
    bm.normal_update()
    return open_n


class Model:
    """모형 하나. 모양을 더한 다음 save()로 검사하고 <이름>.glb로 내보낸다"""

    def __init__(s, name):
        s.name, s.bm, s.lamps, s.mx, s.custom, s.notes = name, {}, [], [Matrix.Identity(4)], {}, []

    def _b(s, mat):
        if mat not in PALETTE and mat not in s.custom and f"재질 이름 '{mat}'은 이름표에 없다" not in s.notes:
            s.notes.append(f"재질 이름 '{mat}'은 이름표에 없다")
        if mat not in s.bm:
            s.bm[mat] = bmesh.new()
        return s.bm[mat]

    def color(s, name, hexrgb):
        """이름표에 없는 민무늬 빛깔을 하나 만든다(작은 장식에만 쓴다). 돌려주는 이름을 재질 이름으로 쓴다"""
        s.custom['c_' + name] = hexrgb
        return 'c_' + name

    @contextmanager
    def at(s, move=(0, 0, 0), rz=0, rx=0, ry=0, scale=1):
        """with m.at((x, y, z), rz=각도): 안에서 더한 모양을 그 자리로 옮기고 돌린다(도 단위, 겹쳐 쓸 수 있다)"""
        sc = scale if isinstance(scale, (tuple, list)) else (scale, scale, scale)
        M = Matrix.Translation(Vector(move)) @ Matrix.Rotation(math.radians(rz), 4, 'Z') @ Matrix.Rotation(math.radians(ry), 4, 'Y') @ Matrix.Rotation(math.radians(rx), 4, 'X') @ Matrix.Diagonal((*sc, 1))
        s.mx.append(s.mx[-1] @ M)
        try:
            yield s
        finally:
            s.mx.pop()

    def mesh(s, mat, verts, faces):
        """아무 그물: 꼭짓점 [(x, y, z)…]과 면 [(꼭짓점 번호…)…]. 면의 앞뒤는 save()가 맞춘다"""
        b, M = s._b(mat), s.mx[-1]
        vs = [b.verts.new(M @ Vector(v)) for v in verts]
        for f in faces:
            try:
                b.faces.new([vs[i] for i in f])
            except ValueError:
                pass

    def box(s, mat, a, b):
        """상자: 맞은편 두 모서리 a=(x, y, z), b=(x, y, z)"""
        x0, x1 = sorted((a[0], b[0])); y0, y1 = sorted((a[1], b[1])); z0, z1 = sorted((a[2], b[2]))
        s.mesh(mat, [(x0, y0, z0), (x1, y0, z0), (x1, y1, z0), (x0, y1, z0), (x0, y0, z1), (x1, y0, z1), (x1, y1, z1), (x0, y1, z1)],
               [(0, 3, 2, 1), (4, 5, 6, 7), (0, 1, 5, 4), (1, 2, 6, 5), (2, 3, 7, 6), (3, 0, 4, 7)])

    def lathe(s, mat, c, prof, n=8, ring=False):
        """돌려 만든 모양(항아리, 북, 향로, 둥근 기둥): 세로 축 c=(x, y), 옆 윤곽 prof=[(반지름, 높이)…]을 아래에서 위로.
        n각형으로 돌린다. 반지름은 축에서 평평한 면까지의 거리이고 평평한 면이 좌우(±x)를 본다. n이 4의 배수(4, 8, 12, 16…)이면
        앞뒤(±y)도 평평한 면이라 가로와 깊이가 정확히 반지름의 두 배다(n=4는 축에 나란한 네모). 반지름 0은 뾰족한 끝.
        ring=True면 윤곽의 끝을 처음과 이어 고리를 만든다(우물전, 바퀴 테, 북의 테): prof=[(안, 아래), (밖, 아래), (밖, 위), (안, 위)]"""
        cx, cy = c
        k = 1 / math.cos(math.pi / n)
        verts, rings = [], []
        for r, z in prof:
            if r <= 1e-6:
                rings.append([len(verts)]); verts.append((cx, cy, z))
            else:
                rings.append(list(range(len(verts), len(verts) + n)))
                verts += [(cx + r * k * math.cos(2 * math.pi * (i + .5) / n), cy + r * k * math.sin(2 * math.pi * (i + .5) / n), z) for i in range(n)]
        faces = []
        for A, B in zip(rings, rings[1:] + ([rings[0]] if ring else [])):
            for i in range(n):
                j = (i + 1) % n
                if len(A) == 1 and len(B) == 1:
                    continue
                faces.append((A[0], B[j], B[i]) if len(A) == 1 else (A[i], A[j], B[0]) if len(B) == 1 else (A[i], A[j], B[j], B[i]))
        if not ring and len(rings[0]) > 1:
            faces.append(tuple(reversed(rings[0])))
        if not ring and len(rings[-1]) > 1:
            faces.append(tuple(rings[-1]))
        s.mesh(mat, verts, faces)

    def cyl(s, mat, c, r, z0, z1, n=8, r1=None):
        """세운 기둥: 축 c=(x, y), 반지름 r(축에서 면까지), 높이 z0~z1. r1을 주면 위쪽 반지름이 r1(위가 좁거나 넓은 기둥)"""
        s.lathe(mat, c, [(r, z0), (r if r1 is None else r1, z1)], n)

    def prism(s, mat, prof, x0, x1):
        """옆에서 본 단면 prof=[(y, z)…]을 x0~x1로 민 모양(지붕, 처마, 쇠시리, 계단의 옆모습)"""
        k = len(prof)
        s.mesh(mat, [(x0, y, z) for y, z in prof] + [(x1, y, z) for y, z in prof],
               [tuple(range(k)), tuple(reversed(range(k, 2 * k)))] + [(i, k + i, k + (i + 1) % k, (i + 1) % k) for i in range(k)])

    def poly(s, mat, outline, z0, z1):
        """위에서 본 윤곽 outline=[(x, y)…]을 z0~z1로 세운 모양(여섯모 단, 배의 바닥)"""
        k = len(outline)
        s.mesh(mat, [(x, y, z0) for x, y in outline] + [(x, y, z1) for x, y in outline],
               [tuple(reversed(range(k))), tuple(range(k, 2 * k))] + [(i, (i + 1) % k, k + (i + 1) % k, k + i) for i in range(k)])

    def bar(s, mat, p0, p1, w, h=None, n=4):
        """두 점 p0, p1을 잇는 막대(비스듬한 버팀목, 난간, 창대, 가지). 폭 w(옆으로), 두께 h(위아래. 안 주면 w). n=4는 네모, 6 이상은 둥근 막대"""
        a, b = Vector(p0), Vector(p1)
        d = b - a
        if d.length < 1e-6:
            return
        d.normalize()
        side = d.cross(Vector((0, 0, 1)))
        if side.length < 1e-6:
            side = Vector((1, 0, 0))
        side.normalize()
        top = side.cross(d).normalized()
        h = w if h is None else h
        k = 1 / math.cos(math.pi / n)
        ring = [(-w / 2, -h / 2), (w / 2, -h / 2), (w / 2, h / 2), (-w / 2, h / 2)] if n == 4 else [(w / 2 * k * math.cos(2 * math.pi * (i + .5) / n), h / 2 * k * math.sin(2 * math.pi * (i + .5) / n)) for i in range(n)]
        s.mesh(mat, [tuple(p + side * u + top * v) for p in (a, b) for u, v in ring],
               [tuple(reversed(range(n))), tuple(range(n, 2 * n))] + [(i, (i + 1) % n, n + (i + 1) % n, n + i) for i in range(n)])

    def add(s, obj, mat=None):
        """블렌더로 만든 오브젝트를 그대로 넣는다(수정자와 위치·회전·크기를 적용한다). 넣은 오브젝트는 지운다.
        mat을 주면 전부 그 재질, 안 주면 오브젝트에 달린 재질 이름을 쓴다(이름표의 이름이어야 한다)"""
        bpy.context.view_layer.update()
        ev = obj.evaluated_get(bpy.context.evaluated_depsgraph_get())
        me = bpy.data.meshes.new_from_object(ev)
        W, slots, vmap = obj.matrix_world.copy(), obj.material_slots, {}
        for p in me.polygons:
            sm = slots[p.material_index].material if p.material_index < len(slots) else None
            nm = mat or (sm.name.split('.')[0] if sm else 'wood_dark')
            b, M, vs = s._b(nm), s.mx[-1] @ W, []
            for i in p.vertices:
                if (nm, i) not in vmap:
                    vmap[(nm, i)] = b.verts.new(M @ me.vertices[i].co)
                vs.append(vmap[(nm, i)])
            try:
                b.faces.new(vs)
            except ValueError:
                pass
        bpy.data.meshes.remove(me)
        bpy.data.objects.remove(obj, do_unlink=True)

    def lamp(s, x, y, z):
        """불빛 자리. 밤에 게임이 여기에 등불을 켠다(등롱, 석등, 촛대)"""
        s.lamps.append(tuple(round(v, 2) for v in s.mx[-1] @ Vector((x, y, z))))

    def save(s, lim=None, exact='', tris=None):
        """검사하고 <이름>.glb로 내보낸다. lim=((x0, x1), (y0, y1), (z0, z1))은 모형이 들어가야 하는 범위,
        exact='x'처럼 축 이름을 주면 그 축은 범위의 양 끝에 꼭 닿아야 한다(옆 조각과 이어 붙는 축). tris는 삼각형 수 한도"""
        os.makedirs(OUT, exist_ok=True)
        coll, bad, objs, ntri, open_n = _collection(), list(s.notes), [], 0, 0
        lo, hi = [1e9] * 3, [-1e9] * 3
        for o in [o for o in bpy.data.objects if o.name.startswith(s.name + '__') or o.name == 'lamps']:
            bpy.data.objects.remove(o, do_unlink=True)
        for mat, bm in s.bm.items():
            open_n += _fix(bm)
            bmesh.ops.delete(bm, geom=[f for f in bm.faces if f.normal.z < -.99 and all(abs(v.co.z) < 1e-4 for v in f.verts)], context='FACES')  # 땅에 닿는 밑면은 보이지 않는다
            if not bm.faces:
                continue
            for v in bm.verts:
                for i in range(3):
                    lo[i], hi[i] = min(lo[i], v.co[i]), max(hi[i], v.co[i])
            ntri += sum(len(f.verts) - 2 for f in bm.faces)
            me = bpy.data.meshes.new(s.name + '__' + mat)
            bm.to_mesh(me)
            bm.free()
            for p in me.polygons:
                p.use_smooth = False
            ob = bpy.data.objects.new(s.name + '__' + mat, me)
            coll.objects.link(ob)
            ob.data.materials.append(_material(mat, s.custom.get(mat) or PALETTE.get(mat, ('', '#ff00ff'))[1]))
            objs.append(ob)
        s.bm = {}
        if not objs:
            print(f'[모형] {s.name} 문제: 면이 하나도 없다')
            _report.append((s.name, True))
            return False
        if s.lamps:
            em = bpy.data.objects.new('lamps', None)
            em['pts'] = json.dumps([list(p) for p in s.lamps])
            coll.objects.link(em)
            objs.append(em)
        if abs(lo[2]) > .05:
            bad.append(f'바닥이 z=0이 아니다(가장 낮은 곳 z={lo[2]:.2f})')
        if lim:
            for i, ax in enumerate('xyz'):
                a, b = lim[i]
                if lo[i] < a - .05 or hi[i] > b + .05:
                    bad.append(f'{ax}가 범위 {a}~{b}를 벗어난다({lo[i]:.2f}~{hi[i]:.2f})')
                elif ax in exact and (abs(lo[i] - a) > .05 or abs(hi[i] - b) > .05):
                    bad.append(f'{ax}가 {a}~{b}에 꼭 닿아야 한다({lo[i]:.2f}~{hi[i]:.2f})')
        if tris and ntri > tris:
            bad.append(f'삼각형이 {ntri}개로 한도 {tris}개를 넘는다')
        if open_n:
            bad.append(f'두께 없는 면(닫히지 않은 덩어리)이 {open_n}개 있다')
        path = os.path.join(OUT, s.name + '.glb')
        for o in bpy.context.view_layer.objects:
            o.select_set(False)
        for o in objs:
            o.select_set(True)
        bpy.context.view_layer.objects.active = objs[0]
        want = dict(filepath=path, export_format='GLB', export_yup=True, export_apply=True, use_selection=True, export_cameras=False, export_lights=False,
                    export_extras=True, export_animations=False, export_texcoords=False, export_normals=True)
        have = bpy.ops.export_scene.gltf.get_rna_type().properties.keys()
        kw = {k: v for k, v in want.items() if k in have}
        try:
            bpy.ops.export_scene.gltf(**kw)
        except Exception:  # 블렌더 화면이 떠 있는데 창 없이 불렸을 때(연결 도구가 뒤에서 실행할 때): 첫 창을 빌려 다시 해 본다
            wins = bpy.context.window_manager.windows
            if not wins or not hasattr(bpy.context, 'temp_override'):
                raise
            with bpy.context.temp_override(window=wins[0], screen=wins[0].screen):
                bpy.ops.export_scene.gltf(**kw)
        for o in objs:
            if o.name == 'lamps':
                bpy.data.objects.remove(o, do_unlink=True)
            else:
                o.location.x += _cursor[0] - lo[0]  # 블렌더 화면에서 모형들이 겹치지 않게 옆으로 늘어놓는다(내보낸 파일과는 상관없다)
        _cursor[0] += hi[0] - lo[0] + 12
        print(f'[모형] {s.name}  x {lo[0]:.1f}~{hi[0]:.1f}  y {lo[1]:.1f}~{hi[1]:.1f}  z {lo[2]:.1f}~{hi[2]:.1f}  삼각형 {ntri}  ' + ('OK' if not bad else '문제: ' + ' / '.join(bad)))
        _report.append((s.name, bool(bad)))
        return not bad


def look(person=15):
    """게임과 같은 눈으로 보게 장면을 차린다(블렌더 화면으로 모양을 살필 때 쓴다. 내보낸 파일은 바뀌지 않는다).
    만든 모형들을 높이 1.22배로 늘려 보이게 하고(게임이 그렇게 세운다), 남쪽 위 35도에서 내려다보는 정사영 카메라 gangho_cam을 세우고,
    오른쪽 끝에 사람 키(person점)만 한 붉은 막대를 둔다. 이 카메라로 보면 가로 1점과 높이 1점이 화면에서 같은 길이다"""
    coll = _collection()
    objs = [o for o in coll.objects if o.type == 'MESH' and '__' in o.name]
    if not objs:
        return
    for n in ('gangho_view', 'gangho_person', 'gangho_cam'):
        if bpy.data.objects.get(n):
            bpy.data.objects.remove(bpy.data.objects[n], do_unlink=True)
    k = 1 / math.cos(math.radians(35))
    root = bpy.data.objects.new('gangho_view', None)
    coll.objects.link(root)
    root.scale = (1, 1, k)
    lo, hi = [1e9] * 3, [-1e9] * 3
    for o in objs:
        o.parent = root
        for c in o.bound_box:
            p = Vector((c[0] + o.location.x, c[1] + o.location.y, c[2] * k))
            for i in range(3):
                lo[i], hi[i] = min(lo[i], p[i]), max(hi[i], p[i])
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1)
    for v in bm.verts:
        v.co = Vector((v.co.x * 7 + hi[0] + 10, v.co.y * 4 + lo[1], (v.co.z + .5) * person))
    me = bpy.data.meshes.new('gangho_person')
    bm.to_mesh(me)
    bm.free()
    man = bpy.data.objects.new('gangho_person', me)
    coll.objects.link(man)
    man.parent = root
    man.data.materials.append(_material('gangho_person', '#c83a2a'))
    hi[0] += 14
    hi[2] = max(hi[2], person * k)
    cam = bpy.data.cameras.new('gangho_cam')
    cam.type, cam.clip_end = 'ORTHO', 100000
    a = math.radians(35)
    cam.ortho_scale = max(hi[0] - lo[0], ((hi[2] - lo[2]) * math.cos(a) + (hi[1] - lo[1]) * math.sin(a)) * 16 / 9) * 1.12
    co = bpy.data.objects.new('gangho_cam', cam)
    coll.objects.link(co)
    co.rotation_euler = (math.radians(90) - a, 0, 0)
    co.location = Vector(((lo[0] + hi[0]) / 2, (lo[1] + hi[1]) / 2, (lo[2] + hi[2]) / 2)) + Vector((0, -math.cos(a), math.sin(a))) * (hi[0] - lo[0] + hi[2] + 200)
    bpy.context.scene.camera = co
    try:
        for win in bpy.context.window_manager.windows:
            for area in win.screen.areas:
                if area.type == 'VIEW_3D':
                    area.spaces.active.region_3d.view_perspective = 'CAMERA'
    except Exception:
        pass


def done(pack=None):
    """맨 끝에 한 번 부른다. 만든 모형 수와 문제 수를 찍는다. pack='gangho_m1'처럼 묶음 이름을 주면 이번에 만든 .glb를 <이름>.zip 하나로 묶는다
    (같은 폴더에 <이름>.py가 있으면 그것도 넣는다)"""
    if pack and _report:
        import zipfile
        with zipfile.ZipFile(os.path.join(OUT, pack + '.zip'), 'w', zipfile.ZIP_DEFLATED) as z:
            for name in dict.fromkeys(r[0] for r in _report):
                if os.path.exists(os.path.join(OUT, name + '.glb')):
                    z.write(os.path.join(OUT, name + '.glb'), name + '.glb')
            if os.path.exists(os.path.join(OUT, pack + '.py')):
                z.write(os.path.join(OUT, pack + '.py'), pack + '.py')
        print(f'묶음 파일: {os.path.join(OUT, pack + ".zip")}')
    print(f'== 끝: 모형 {len(_report)}개, 문제 {sum(1 for r in _report if r[1])}개, 폴더 {OUT} (틀 {BUILD}) ==')
    del _report[:]
# ==== 강호행 틀 끝 ====
