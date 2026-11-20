# 강호행 M2 · 객잔과 전각 가구
# ChatGPT가 블렌더로 만든 것(2026-11-20에 받음). 받은 그대로다.
# 다시 굽기: python3 tools/blender/gpt.py run art-src/blender/gangho_m2.py --install
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


def loft(m, mat, rings):
    n = len(rings[0])
    vertices = [p for ring in rings for p in ring]
    faces = [tuple(reversed(range(n))), tuple(range(len(vertices)-n, len(vertices)))]
    for k in range(len(rings)-1):
        for i in range(n):
            j = (i+1) % n
            faces.append((k*n+i, k*n+j, (k+1)*n+j, (k+1)*n+i))
    m.mesh(mat, vertices, faces)


def slab(m, mat, w, d, z, height, *, x=0, y=0, corner=.45, bevel=.22):
    """모서리를 자른 판. 밑의 쇠시리와 상단 모서리가 서로 다른 빛을 받는다."""
    rings = []
    for level, inset in [(z, bevel), (z+height*.40, 0), (z+height*.78, 0),
                         (z+height, bevel*.65)]:
        a, b = w/2-inset, d/2-inset
        cut = min(corner, a*.4, b*.4)
        outline = [(-a+cut,-b),(a-cut,-b),(a,-b+cut),(a,b-cut),
                   (a-cut,b),(-a+cut,b),(-a,b-cut),(-a,-b+cut)]
        rings.append([(x+u,y+v,level) for u,v in outline])
    loft(m,mat,rings)


def rect_ring(x,y,z,w,d):
    return [(x+u*w/2,y+v*d/2,z) for u,v in [(-1,-1),(1,-1),(1,1),(-1,1)]]


def legs(m, mat, x, y, top, foot, neck, splay=0):
    for i in (-1,1):
        for j in (-1,1):
            loft(m,mat,[rect_ring(i*(x+splay), j*(y+splay), 0, foot, foot),
                        rect_ring(i*x, j*y, top, neck, neck)])


def front_panel(m, mat, profile, y, thick):
    """앞에서 그린 윤곽을 두께가 있는 수직 널로 만든다."""
    rings = [[(x,depth,z) for x,z in profile] for depth in (y-thick/2,y+thick/2)]
    loft(m,mat,rings)


def long_table():
    m=Model('fn_table')
    slab(m,'plank',32,9,6.1,.9,bevel=.21)
    legs(m,'wood_dark',14.83,3.32,6.1,1.1,1.1)
    for y in (-3.32,3.32):
        front_panel(m,'wood_dark',[(-14.64,6.1),(14.64,6.1),(14.64,4.28),
                    (13.4,4.28),(12.5,4.7),(-12.5,4.7),(-13.4,4.28),(-14.64,4.28)],y,.85)
        m.box('wood_dark',(-14.76,y-.4,1.75),(14.76,y+.4,2.58))
    for x in (-14.8,14.8):
        m.box('wood_dark',(x-.43,-3.2,4.72),(x+.43,3.2,6.1))
    m.save(lim=((-16,16),(-4.5,4.5),(0,7.2)),tris=300)


def altar():
    m=Model('fn_altar')
    # 상판 둘레의 금선과 끝이 들린 날개는 가로 전체에 이어진다.
    for material,z0,z1 in [('wood_red',6.20,6.80),('gold',6.80,7.40),('wood_red',7.40,8.0)]:
        outline=[(-15,z0+.6),(-13.5,z0),(13.5,z0),(15,z0+.6),
                 (15,z1+.6),(13.5,z1),(-13.5,z1),(-15,z1+.6)]
        front_panel(m,material,outline,0,8)
    legs(m,'wood_red',12.5,2.8,6.20,1.42,1.78,.15)
    # 좌우가 서로 마주 보는 여의운두. 중앙을 열어 실루엣에 여백을 준다.
    half=[(-12.95,2.55),(-11.68,2.55),(-11.22,3.15),(-11.55,3.67),
          (-10.67,4.03),(-9.42,3.87),(-9.07,4.53),(-8.16,4.87),
          (-6.65,4.55),(-5.78,5.12),(-1.65,5.12),(0,4.74)]
    bottom=half+[(-x,z) for x,z in reversed(half[:-1])]
    front_panel(m,'wood_red',[(-12.95,6.20)]+bottom+[(12.95,6.20)],-2.91,.88)
    m.box('wood_red',(-12.5,2.45,5.22),(12.5,3.28,6.20))
    for x in (-12.5,12.5):
        m.box('wood_red',(x-.44,-2.66,4.84),(x+.44,2.66,6.20))
        m.box('wood_red',(x-.43,-2.82,1.23),(x+.43,2.82,2.07))
    m.save(lim=((-15,15),(-4,4),(0,8.6)),tris=400)


def counter():
    m=Model('fn_counter')
    slab(m,'wood_dark',31.05,8.15,0,1.04,y=.22,bevel=.22)
    m.box('plank',(-14.85,-3.68,1.04),(14.85,-2.7,7.54))
    for x in (-14.36,14.36):
        m.box('plank',(x-.49,-2.7,1.04),(x+.49,3.97,7.54))
    # 손님 쪽 면의 세로 띠 셋. 점원 쪽에는 물건을 둘 수 있게 선반을 둔다.
    for x in (-14.12,0,14.12):
        m.box('wood_dark',(x-.47,-4.00,1.04),(x+.47,-3.44,7.54))
    m.box('wood_dark',(-13.87,-2.7,3.65),(13.87,3.78,4.45))
    slab(m,'wood_dark',32,9,7.54,1.06,bevel=.25)
    m.save(lim=((-16,16),(-4.5,4.5),(0,8.8)),tris=300)


def tea_table():
    m=Model('fn_teatable')
    # 연귀맞춤한 네 개의 변이 가운데 끼운 밝은 나무 상판을 받친다.
    rail=[(-5.5,-6),(5.5,-6),(5.75,-5.75),(4.65,-4.65),(-4.65,-4.65),(-5.75,-5.75)]
    for angle in (0,90,180,270):
        with m.at(rz=angle):
            m.poly('wood_dark',rail,5.03,6.0)
    m.box('wood_pine',(-4.65,-4.65,5.03),(4.65,4.65,5.92))
    legs(m,'wood_dark',4.54,4.54,5.04,1.00,1.30,.3)
    for sign in (-1,1):
        a=sign*4.68
        m.box('wood_dark',(-4.26,a-.41,2.15),(4.26,a+.41,3.0))
        m.box('wood_dark',(a-.41,-4.26,2.15),(a+.41,4.26,3.0))
    m.save(lim=((-6,6),(-6,6),(0,6.2)),tris=300)


def chair():
    m=Model('fn_chair')
    slab(m,'wood_dark',7.9,7.1,3.57,.93,corner=.46)
    legs(m,'wood_dark',2.86,2.55,3.60,.83,1.02,.28)
    m.box('wood_dark',(-3.09,-3.18,1.12),(3.09,-2.34,1.95))
    for x in (-2.95,2.95):
        # 앞 발을 연장한 팔걸이 받침, 뒤로 부드럽게 올라가는 팔걸이.
        loft(m,'wood_dark',[rect_ring(x,-2.03,4.49,.86,.87),
                            rect_ring(x,-2.28,7.15,.86,.87)])
        m.prism('wood_dark',[(-3.35,6.82),(-2.43,6.75),(.2,7.45),(2.84,8.20),
                    (2.84,9.06),(.2,8.32),(-2.4,7.64),(-3.35,7.78)],x-.44,x+.44)
        loft(m,'wood_dark',[rect_ring(x,2.57,4.49,.96,.93),
                            rect_ring(x,2.65,8.14,.89,.85),
                            rect_ring(x,3.11,11.42,.88,.85)])
    # S자로 휘는 등판과 양 끝이 들어 올려진 관모형 등받이.
    loft(m,'wood_red',[rect_ring(0,2.19,4.49,1.83,.80),
                       rect_ring(0,1.90,7.05,1.48,.80),
                       rect_ring(0,2.28,9.46,2.06,.84),
                       rect_ring(0,2.96,11.46,2.25,.84)])
    front_panel(m,'wood_dark',[(-4.1,11.27),(-3.67,11.17),(-2.51,11.26),
                (0,10.94),(2.51,11.26),(3.67,11.17),(4.1,11.27),
                (4.1,12.17),(3.68,12.07),(2.48,12.16),(0,11.84),
                (-2.48,12.16),(-3.68,12.07),(-4.1,12.17)],3.0,1.18)
    m.save(lim=((-4.2,4.2),(-4,4),(0,12.5)),tris=400)


def drum_stool():
    m=Model('fn_stool')
    # 마주 보는 면 기준 지름 5.5. 여덟 면이 각각 다른 빛을 받는다.
    m.lathe('wood_dark',(0,0),[(2.19,0),(2.43,.30),(2.43,.87)],n=8)
    m.lathe('wood_red',(0,0),[(2.34,.87),(2.72,1.72),(2.76,2.78),(2.34,3.66)],n=8)
    m.lathe('wood_dark',(0,0),[(2.35,3.66),(2.60,3.91),(2.60,4.32),(2.38,4.55)],n=8)
    m.save(lim=((-3,3),(-3,3),(0,4.8)),tris=250)


def bench():
    m=Model('fn_bench')
    slab(m,'plank',26,5.0,3.50,1.0,corner=.52)
    legs(m,'wood_dark',9.92,1.34,3.51,1.00,1.16,.53)
    for x in (-10.23,10.23):
        m.box('wood_dark',(x-.5,-1.86,1.22),(x+.50,1.86,2.18))
    m.box('wood_dark',(-10.55,-.43,1.34),(10.55,.43,2.20))
    m.save(lim=((-13,13),(-2.6,2.6),(0,4.8)),tris=200)


def bed():
    m=Model('fn_bed')
    legs(m,'wood_dark',10.63,4.99,3.14,1.15,1.37)
    slab(m,'wood_dark',24,12,2.79,1.21,corner=.45)
    slab(m,'cloth_white',22.68,10.62,4,1.00,corner=.67,bevel=.28)
    # 낮은 가림널은 머리(-x)와 뒤(+y)에만 둔다.
    front_panel(m,'wood_dark',[(-11.58,4),(11.53,4),(11.53,5.67),(10.43,6.35),
                (6.45,6.35),(4.75,7.23),(-8.60,7.23),(-10.55,8.43),(-11.58,8.43)],5.57,.85)
    m.prism('wood_dark',[(-5.71,4),(5.18,4),(5.18,8.93),(4.07,8.93),
                         (2.87,8.05),(-4.45,8.05),(-5.71,7.03)],-11.8,-10.96)
    # 이불의 곡면은 가장자리와 중앙의 높이 차이로 잡는다.
    cross=[(-5.18,0),(4.92,0),(4.92,.43),(4.21,.86),(1.04,1.12),
           (-1.36,1.18),(-4.30,.89),(-5.18,.50)]
    rings=[]
    for x,spread,crown in [(-.05,.94,.56),(.70,1,.90),(4.45,1,1.0),
                           (8.35,1,.86),(10.65,.99,.79),(11.15,.93,.44)]:
        rings.append([(x,y*spread,5+h*crown) for y,h in cross])
    loft(m,'cloth_blue',rings)
    # 접어 젖힌 이불깃과 머리맡의 각진 목침.
    m.prism('cloth_blue',[(-5.17,5.24),(-4.43,5.76),(4.23,5.76),(4.91,5.24),
                          (4.91,5.88),(4.13,6.41),(-4.29,6.41),(-5.17,5.88)],-.21,1.32)
    pillow=[(-.79,-.81),(.79,-.81),(1,-.28),(.92,.47),
            (.63,.96),(-.63,.96),(-.92,.47),(-1,-.28)]
    rings=[]
    for x,spread,loft_height in [(-9.90,2.73,.63),(-9.33,3.56,1.03),
                                 (-7.24,3.60,1.11),(-6.56,2.92,.71)]:
        rings.append([(x,y*spread,5.88+z*loft_height) for y,z in pillow])
    loft(m,'cloth_white',rings)
    m.save(lim=((-12,12),(-6.5,6.5),(0,9.5)),tris=400)


long_table()
altar()
counter()
tea_table()
chair()
drum_stool()
bench()
bed()
look(15)
done('gangho_m2')
