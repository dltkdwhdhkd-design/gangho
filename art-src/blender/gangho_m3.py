# 강호행 M3 · 세워 두는 가구 아홉 종
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
from math import atan2, degrees, hypot, cos, sin, pi


def save(m, width, depth, height, limit):
    m.save(lim=((-width/2, width/2), (-depth/2, depth/2), (0, height)), tris=limit)


def box(m, mat, x, y, z, w, d, h):
    """바닥 중심에서 크기로 널을 놓는다."""
    m.box(mat,(x-w/2,y-d/2,z),(x+w/2,y+d/2,z+h))


def stud(m, mat, x, y, z, width=.65):
    # 얕은 네모 피라미드. 옆에서 볼 때 손잡이가 앞판 밖으로 튀어나온다.
    w=width/2
    m.mesh(mat,[(x-w,y,z-w),(x+w,y,z-w),(x+w,y,z+w),(x-w,y,z+w),(x,y-w,z)],
           [(0,1,2,3),(0,4,1),(1,4,2),(2,4,3),(3,4,0)])


def books():
    m=Model('fn_bookcase')
    for x in (-10.45,10.45): box(m,'wood_dark',x,0,0,.8,5.8,18)
    box(m,'plank',0,2.65,.55,20.2,.45,17.3)
    for z in (0,3.5,7,10.5,14,17.5): box(m,'wood_dark',0,-.05,z,21.95,6,.5)
    covers=['cloth_blue','cloth_white','cloth_yellow','paper']
    for row in range(5):
        z=.50+3.50*row
        # 책등의 띠와 종이 단면, 줄마다 다른 빈자리
        shift=(-.7,.9,.15,-.45,.6)[row]
        for i in range(4):
            x=-8.2+1.96*i+shift
            box(m,covers[(i+row)%4],x,-.55,z,1.79,3.55,2.65-.19*(i%2))
            if i % 2 == 0: box(m,'paper',x,-2.36,z+1.55,1.06,.10,.47)
        for i in range(3):
            x=5.2+.15*(i%2)-shift
            box(m,covers[(row+i+1)%4],x,-.48,z+i*.81,5.5-.28*i,3.7,.76)
    save(m,22,6.4,18.5,700)


def apothecary():
    m=Model('fn_drawers')
    for x in (-9.6,9.6):
        for y in (-2,2): box(m,'wood_dark',x,y,0,1.5,1.35,1.4)
    box(m,'wood_dark',0,.23,1.15,21.45,5.3,14.1)
    for r in range(5):
        for c in range(6):
            x=(c-2.5)*3.4;z=1.65+r*2.67
            box(m,'wood_pine',x,-2.57,z,3.16,.31,2.46)
            stud(m,'metal',x,-2.74,z+1.04,.72)
    box(m,'wood_dark',0,0,15.15,22,6.2,.85)
    save(m,22,6.4,16.5,700)


def shop_shelf():
    m=Model('fn_shelf')
    for x in (-10.15,10.15):
        for y in (-2.5,2.5):box(m,'wood_pine',x,y,0,.8,.8,16)
    for z in (.7,6.1,11.65):box(m,'plank',0,0,z,21.9,6,.55)
    for x,z,r,mat in [(-7,1.25,1.8,'earth'),(-2.7,1.25,1.6,'stone_dark'),(7,6.65,1.62,'earth')]:
        m.lathe(mat,(x,0),[(r*.58,z),(r,z+1),(r*.9,z+2.3),(r*.55,z+2.85),(r*.7,z+3)],8)
    for x,z in [(4.8,1.25),(-6.2,6.65)]:
        box(m,'plank',x,0,z,6.3,4.4,3.0)
        for delta in (-2.1,2.1):box(m,'wood_dark',x+delta,-2.23,z,.46,.15,3.0)
    for x in (-6,-4.6,-3.2):
        m.bar('paper',(x,-1.8,12.85),(x,1.85,12.85),1.22,n=6)
    m.lathe('cloth_red',(4.1,0),[(1.9,12.2),(2.4,13.15),(1.85,14.1),(.48,14.6),(.72,15.2)],8)
    save(m,22,6.4,16.5,700)


def screen():
    m=Model('fn_screen')
    for i in range(6):
        x=-14.75+5.9*i
        dy=3 if i%2==0 else -3
        span=hypot(5.9,dy)
        with m.at((x,0,0),rz=degrees(atan2(dy,5.9))):
            box(m,'wood_dark',0,0,0,span,.47,19)
            for side in (-1,1):
                box(m,'paper',0,.237*side,3.8,span-1.12,.028,14.6)
    save(m,36,5,19.5,300)


def rack():
    m=Model('fn_rack')
    for x in (-9.7,9.7):
        box(m,'wood_dark',x,0,0,2.4,5.3,.9)
        box(m,'wood_dark',x,0,.9,1,1.1,8.8)
    for z in (2.6,8.1):box(m,'wood_dark',0,.1,z,20.1,1.05,.85)
    for x,h in [(-7.7,17),(-3.8,16.4),(.15,17),(4.3,15),(8,11)]:
        with m.at((x,-.75,.45),rx=-3,ry=2):
            if x<1:
                m.cyl('wood_pine',(0,0),.25,0,h-3.2,8)
                m.lathe('cloth_red',(0,0),[(.52,h-4.1),(.35,h-3.65),(.23,h-3)],8)
                if x<0: m.lathe('metal',(0,0),[(.20,h-3.15),(.56,h-2.5),(0,h)],4)
                else:
                    with m.at(rx=90):m.poly('metal',[(-.2,h-3.2),(.4,h-3.2),(1.38,h-1.55),(1.15,h),(.52,h-.84),(-.25,h-1.55)],-.14,.14)
            elif x<6: m.cyl('wood_pine',(0,0),.34,0,h,8)
            else:
                box(m,'wood_black',0,0,0,.78,.48,8.2)
                box(m,'metal',0,0,8.2,1.8,.62,.43)
                box(m,'cloth_red',0,0,8.63,.46,.45,2.2)
    save(m,22,6,18,600)


def chest():
    m=Model('fn_chest')
    box(m,'wood_dark',0,0,0,9.55,6.03,4.8)
    m.prism('wood_dark',[(-3.18,4.8),(3.18,4.8),(3.18,5.44),(2.52,6),(-2.52,6),(-3.18,5.44)],-5,5)
    for x in (-4.35,4.35):
        for z in (.25,3.76):box(m,'metal',x,-3.07,z,.82,.2,.8)
        box(m,'metal',x,-3.2,4.85,.5,.16,.57)
    box(m,'metal',0,-3.17,3.9,1.25,.28,1.55)
    for x in (-4.82,4.82):
        with m.at((x,0,3.05),ry=90):
            m.lathe('metal',(0,0),[(.59,-.12),(.82,-.12),(.82,.12),(.59,.12)],6,ring=True)
    save(m,10.4,6.8,6.4,250)


def practice_dummy():
    m=Model('fn_dummy')
    box(m,'wood_dark',0,0,0,7.6,1.45,.8)
    box(m,'wood_dark',0,0,0,1.55,7.6,.92)
    m.lathe('wood_pine',(0,.35),[(1.1,.8),(1.44,2),(1.5,14.6),(1.29,15.9)],8)
    for tip,z in [((-3.7,-1,11.5),10.8),((3.7,-1,12.1),11.4),((0,-3.55,9.8),9.5)]:
        m.bar('wood_pine',(0,.3,z),tip,.88,n=8)
    m.bar('wood_pine',(0,.1,6.4),(0,-2.68,4.5),1.04,n=8)
    m.bar('wood_pine',(0,-2.68,4.5),(0,-2.9,2.5),.9,n=8)
    save(m,8,8,16.5,350)


def drum():
    m=Model('fn_drum')
    for x in (-5.45,5.45):
        box(m,'wood_red',x,0,0,1.65,7.8,.87)
        box(m,'wood_red',x,0,.87,.96,1.2,13.33)
        m.bar('wood_dark',(x,-3.1,.8),(x,-.2,4.25),.54)
    box(m,'wood_red',0,0,14.05,12.5,1.6,.9)
    for x in (-2,2):m.bar('metal',(x,0,14.1),(x,0,12.3),.4,n=4)
    with m.at((0,0,8.62),rx=90):
        m.lathe('wood_red',(0,0),[(4.25,-2.55),(4.53,-1.45),(4.53,1.45),(4.25,2.55)],12)
        for sign in (-1,1):
            with m.at((0,0,sign*2.6)):
                m.cyl('paper',(0,0),4.21,-.06,.06,12)
                for i in range(10):
                    a=2*pi*i/10
                    with m.at((3.86*cos(a),3.86*sin(a),sign*.055),rx=-90*sign):
                        stud(m,'metal',0,0,0,.4)
    save(m,13,9,15.5,450)


def stove():
    m=Model('fn_stove')
    m.poly('earth',[(-9.6,-2.05),(9.6,-2.05),(9.9,-1.75),(9.9,4.45),(9.5,4.9),(-9.5,4.9),(-9.9,4.45),(-9.9,-1.75)],0,6)
    for x in (-4.8,4.8):
        with m.at((x,0,0),rz=90):
            # 아궁이 천장의 안쪽 단면을 잘라 빈 공간을 만든다.
            m.prism('earth',[(-4.8,0),(-2,0),(-2,2.3),(-1.3,3.35),(1.3,3.35),(2,2.3),(2,0),(4.8,0),(4.8,5.7),(4.5,6),(-4.5,6),(-4.8,5.7)],-4.8,-1.98)
        box(m,'stone_dark',x,-2.11,0,4.1,.22,3.45)
        m.lathe('lantern',(x,-2.7),[(.81,.15),(.68,.75),(.25,1.52),(0,1.92)],6)
        m.lamp(x,-3.18,1.18)
        m.lathe('metal',(x,.05),[(3.12,5.95),(3.48,6.22),(2.8,6.78),(1.62,7.46),(.45,7.58),(.45,8.04)],8)
    save(m,20,10,8.5,400)


for build in (books, apothecary, shop_shelf, screen, rack, chest, practice_dummy, drum, stove):
    build()
look(person=15)
done(pack='gangho_m3')
