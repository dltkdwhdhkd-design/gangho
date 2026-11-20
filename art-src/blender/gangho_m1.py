# 강호행 M1 | 방의 벽 조각 7종
# ChatGPT가 블렌더로 만든 것(2026-11-20에 받음). 'Claude가 고침'이라고 적힌 줄만 Claude가 손댔다.
# 다시 굽기: python3 tools/blender/gpt.py run art-src/blender/gangho_m1.py --install
# 실행: blender -b --python gangho_m1.py
# ---- 머리말(그대로 둔다): 틀(gangho_kit.py)을 불러온다. 옆에 없으면 받아 온다 ----
import importlib, os, sys, urllib.request
_d = os.path.join(os.path.expanduser('~'), 'gangho_models')
os.makedirs(_d, exist_ok=True)
try:
    _src = urllib.request.urlopen('https://dltkdwhdhkd-design.github.io/gangho/tools/blender/gangho_kit.py', timeout=15).read()
    open(os.path.join(_d, 'gangho_kit.py'), 'wb').write(_src)
except Exception:
    pass
sys.path[:0] = ([os.path.dirname(os.path.abspath(__file__))] if '__file__' in globals() else []) + [_d]
import gangho_kit
importlib.reload(gangho_kit)
from gangho_kit import *
# ---- 머리말 끝 ----


def loft(model, material, loops, closed_profile=False):
    """같은 수의 꼭짓점으로 된 단면을 잇는다. 마지막 단면은 막거나 처음으로 되돌린다."""
    width = len(loops[0])
    vertices = [point for row in loops for point in row]
    faces = []
    pairs = len(loops) if closed_profile else len(loops) - 1
    for row in range(pairs):
        next_row = (row + 1) % len(loops)
        for i in range(width):
            j = (i + 1) % width
            faces.append((row * width + i, row * width + j,
                          next_row * width + j, next_row * width + i))
    if not closed_profile:
        faces.extend([tuple(reversed(range(width))),
                      tuple(range(len(vertices) - width, len(vertices)))])
    model.mesh(material, vertices, faces)


def timber_or_stone(model, material, courses, center_y=0):
    """각 단의 절반 너비·깊이와 모서리 깎임을 지정한 팔모 단면."""
    loops = []
    for z, w, d, cut in courses:
        outline = [(-w + cut, -d), (w - cut, -d), (w, -d + cut),
                   (w, d - cut), (w - cut, d), (-w + cut, d),
                   (-w, d - cut), (-w, -d + cut)]
        loops.append([(x, y + center_y, z) for x, y in outline])
    loft(model, material, loops)


def tiled_coping(model):
    """암키와의 오목한 골·수키와 등·용마루를 하나의 닫힌 껍질로 빚는다."""
    # 골의 중심이 양 끝에 오므로 옆 칸과 이어져도 기와 간격이 정확히 4점이다.
    tile = [(-2.0, 0), (-0.91, 0.20), (-0.62, 0.86),
            (0.0, 1.16), (0.62, 0.86), (0.91, 0.20)]
    section = [(center + dx, height) for center in (-6, -2, 2, 6)
               for dx, height in tile] + [(8.0, 0)]
    vertices, faces, rows = [], [], []

    def row(y, z, relief=None):
        profile = [(x, 0) for x in range(-8, 9, 4)] if relief is None else section
        ids = []
        for x, h in profile:
            ids.append(len(vertices))
            vertices.append((x, y, z + h * (relief or 0)))
        rows.append(ids)

    # 앞처마에서 용마루를 넘어 뒤처마로 진행한 뒤, 밑면을 따라 돌아온다.
    row(-2.5, 57.82, 1)
    row(-0.45, 58.65, 1)
    row(1.46, 61.12, 0.92)
    row(1.60, 62.50)
    row(1.88, 63.63)
    row(2.50, 64.00)
    row(3.12, 63.63)
    row(3.40, 62.50)
    row(3.54, 61.12, 0.92)
    row(5.45, 58.65, 1)
    row(7.50, 57.82, 1)
    row(7.50, 57.00, 0)
    row(-2.50, 57.00, 0)
    for a, b in zip(rows, rows[1:] + rows[:1]):
        if len(a) == len(b):
            faces.extend((a[i], a[i + 1], b[i + 1], b[i]) for i in range(len(a) - 1))
        else:
            # 민마루와 굴곡진 면의 경계. 이웃 면도 같은 꼭짓점을 쓴다.
            dense, simple = (a, b) if len(a) > len(b) else (b, a)
            # 기왓골마다 삼각분할을 끝내어 처마 단면을 가로지르는 긴 면을 없앤다.
            steps = (len(dense) - 1) // (len(simple) - 1)
            for k, (left, right) in enumerate(zip(simple, simple[1:])):
                first = k * steps
                middle = first + steps // 2
                for i in range(first, first + steps):
                    tip = left if i < middle else right
                    faces.append((dense[i], dense[i + 1], tip))
                faces.append((left, dense[middle], right))
    faces.extend([tuple(row[0] for row in rows), tuple(row[-1] for row in reversed(rows))])
    model.mesh('wl_roof', vertices, faces)


def wall():
    m = Model('rw_wall')
    m.prism('wl_base', [(-0.8, 0), (5, 0), (5, 9), (-0.2, 9),
                        (-0.8, 8.2)], -8, 8)
    m.box('wl_field', (-8, 0, 9), (8, 5, 52))
    m.prism('wl_beam', [(-0.35, 52), (5, 52), (5, 57), (-1, 57),
                        (-1, 55.8), (-0.70, 55.3), (-0.70, 52.6)], -8, 8)
    tiled_coping(m)
    m.save(lim=((-8, 8), (-2.5, 7.5), (0, 64)), exact='x', tris=500)


def wall_post():
    m = Model('rw_post')
    timber_or_stone(m, 'wl_base', [
        (0, 2.50, 2.25, 0.70), (1.65, 2.50, 2.25, 0.70),
        (2.40, 2.12, 1.92, 0.54), (3, 2.12, 1.92, 0.54)], -1.25)
    # 긴 면을 남긴 모접기와 앞으로 내민 기둥머리가 들보 아래에서도 보인다.
    timber_or_stone(m, 'wl_post', [
        (3, 1.75, 1.75, 0.62), (52, 1.75, 1.75, 0.62),
        (52.75, 2.04, 1.95, 0.50), (53.65, 2.04, 1.95, 0.50),
        (55.4, 2.25, 2.0, 0.35), (57, 2.25, 2.0, 0.35)], -1.0)
    m.save(lim=((-2.5, 2.5), (-3.5, 1), (0, 57)), tris=250)


def corner_pillar():
    m = Model('rw_pillar')
    timber_or_stone(m, 'wl_base', [
        (0, 4.5, 4.5, 1), (1.35, 4.5, 4.5, 1), (2.5, 3.95, 3.95, 0.75),
        (3.25, 3.95, 3.95, 0.75), (4, 3.60, 3.60, 0.55)])
    timber_or_stone(m, 'wl_post', [
        (4, 3.50, 3.50, 0.45), (58.8, 3.5, 3.5, 0.45),
        (60.5, 3.5, 3.5, 0.80), (62, 3.5, 3.5, 0.80)])
    # 사모 덮개는 네 방향이 같다. 처마 모서리를 들어 올리고 추녀선을 둔다.
    loops = []
    for width, z, rise in [(3.52, 62, 0), (4.5, 62.65, 0.67),
                           (4.5, 63.52, 0.68), (3.2, 64.28, 0.62),
                           (1.14, 68.40, 0.18), (0.70, 69.15, 0), (0.70, 70, 0)]:
        corners = [(-width, -width), (width, -width), (width, width), (-width, width)]
        loop = []
        for i, (x, y) in enumerate(corners):
            xx, yy = corners[(i + 1) % 4]
            loop.extend([(x, y, z + rise), ((x + xx) / 2, (y + yy) / 2, z)])
        loops.append(loop)
    loft(m, 'wl_roof', loops)
    m.save(lim=((-4.5, 4.5), (-4.5, 4.5), (0, 70)), tris=300)


def round_column():
    m = Model('rw_column')
    m.lathe('stone', (0, 0), [(3.5, 0), (3.5, 1.25), (3.06, 2.10),
                              (3.06, 2.50), (2.72, 3)], n=8)
    # 열모 기둥의 지름은 마주 보는 꼭짓점 사이에서 4.8점이다.
    radius = 2.4 * math.cos(math.pi / 10)
    m.lathe('wl_post', (0, 0), [(radius, 3), (radius, 55), (2.70, 55.75),
                                (2.70, 56.55), (2.45, 57.2), (2.93, 58.15),
                                (3.5 * math.cos(math.pi / 10), 59.03),
                                (3.5 * math.cos(math.pi / 10), 60)], n=10)
    m.save(lim=((-3.5, 3.5), (-3.5, 3.5), (0, 60)), exact='z', tris=300)


def sill():
    m = Model('rw_sill')
    # 양 끝은 자르지 않고, 긴 두 모서리만 깎아서 긴 문지방으로 잇는다.
    m.prism('wl_base', [(-2, 0), (2, 0), (2, 1.75), (1.47, 2.38),
                        (1.07, 2.5), (-1.07, 2.5), (-1.47, 2.38), (-2, 1.75)], -8, 8)
    m.save(lim=((-8, 8), (-2, 2), (0, 2.5)), exact='x', tris=40)


def paper_window():
    m = Model('rw_window')
    # 안팎이 한 덩어리인 연귀 창틀. 창 안쪽 턱이 빛을 받는다.
    loops = []
    for half_width, half_height, y in [(7, 11.5, 0), (7, 11.5, -1.27),
                                       (6.72, 11.22, -1.6), (5.84, 10.34, -1.6),
                                       (5.5, 10, -1.22), (5.5, 10, 0)]:
        loops.append([(x, y, 11.5 + z) for x, z in
                      [(-half_width, -half_height), (half_width, -half_height),
                       (half_width, half_height), (-half_width, half_height)]])
    loft(m, 'wood_dark', loops, closed_profile=True)
    m.box('win_paper', (-5.5, -0.5, 1.5), (5.5, 0, 21.5))
    rails = (5.75, 17.25)
    for z in rails:
        m.box('wood_dark', (-5.5, -0.95, z - 0.48), (5.5, -0.5, z + 0.48))  # Claude가 고침: 깊이 0.88 → 0.45
    spans = [(1.5, rails[0] - 0.48), (rails[0] + 0.48, rails[1] - 0.48),
             (rails[1] + 0.48, 21.5)]
    for i in range(1, 7):
        x = -5.5 + i * 11 / 7
        for low, high in spans:
            # Claude가 고침: 살의 깊이 0.62 → 0.3. 옆벽에 박힌 창은 비스듬히 보이는데, 살이 깊으면 살끼리 겹쳐 창호지가 안 보이고 창이 까맣게 된다
            m.box('wood_dark', (x - 0.35, -0.8, low), (x + 0.35, -0.5, high))
    m.save(lim=((-7, 7), (-1.6, 0), (0, 23)), tris=400)


def emblem():
    m = Model('rw_emblem')
    # 각 문파의 글자는 게임이 입힌다. 종이보다 앞에 나온 깎은 나무 테만 둔다.
    with m.at((0, 0, 15), rx=90):
        m.lathe('paper', (0, 0), [(13.5, 0), (13.5, 0.80)], n=20)
        m.lathe('wood_dark', (0, 0), [(13.5, 0), (15, 0), (15, 1.0),
                                      (14.42, 1.60), (13.5, 1.36)], n=20, ring=True)
    m.save(lim=((-15, 15), (-1.6, 0), (0, 30)), tris=300)


wall()
wall_post()
corner_pillar()
round_column()
sill()
paper_window()
emblem()
look(22)
done('gangho_m1')
