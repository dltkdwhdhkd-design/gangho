# 강호행 M4 · 산문 앞 돌계단, 난간과 축대
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


def link_rings(m, rings):
    n = len(rings[0])
    faces = [tuple(reversed(range(n))), tuple(range(n*(len(rings)-1),n*len(rings)))]
    for k in range(len(rings)-1):
        for i in range(n):
            j = (i+1) % n
            faces.append((k*n+i,k*n+j,(k+1)*n+j,(k+1)*n+i))
    m.mesh('stone',[v for ring in rings for v in ring],faces)


def stair():
    m=Model('st_stair')
    profile=[(0,0),(0,.78),(.4,1.1),(4,1.1),(4,3.04),(4.4,3.4),(8,3.4),
             (8,5.23),(8.4,5.6),(12,5.6),(12,7.53),(12.4,7.9),
             (15.6,7.9),(15.6,8.84),(15.77,9),(16,9),(16,0)]
    m.prism('stone',profile,-8,8)
    m.save(lim=((-8,8),(0,16),(0,9)),exact='xyz',tris=150)


def cheek():
    m=Model('st_cheek')
    sections=[]
    for y,h in ((0,3.5),(16,12.5)):
        sections.append([(-3,y,0),(0,y,0),(0,y,h-.17),(-.16,y,h),
                         (-2.50,y,h),(-3,y,h-.5)])
    link_rings(m,sections)
    m.save(lim=((-3,0),(0,16),(0,12.5)),exact='yz',tris=60)


def rail():
    m=Model('st_rail')
    m.prism('stone',[(-1.5,0),(1.5,0),(1.5,1.13),(1.18,1.5),(-1.18,1.5),(-1.5,1.13)],-8,8)
    # 관통한 두 창의 모서리에 작은 사면을 둔다.
    m.prism('stone',[(-.6,1.5),(.6,1.5),(.6,3.0),(.43,3.32),(-.43,3.32),(-.6,3.0)],-8,8)
    m.prism('stone',[(-.43,6.25),(.43,6.25),(.6,6.52),(.6,8),(-.6,8),(-.6,6.52)],-8,8)
    for a,b in ((-8,-6.65),(-.76,.76),(6.65,8)):
        m.box('stone',(a,-.54,3.26),(b,.54,6.31))
    m.prism('stone',[(-.9,8),(.9,8),(1.3,8.48),(1.3,10.22),(1.10,10.65),
                     (.66,11),(-.66,11),(-1.10,10.65),(-1.3,10.22),(-1.3,8.48)],-8,8)
    m.save(lim=((-8,8),(-1.5,1.5),(0,11)),exact='x',tris=300)


def railpost():
    m=Model('st_railpost')
    def cut_square(r,z,b):
        return [(x,y,z) for x,y in [(-r+b,-r),(r-b,-r),(r,-r+b),(r,r-b),
                                     (r-b,r),(-r+b,r),(-r,r-b),(-r,-r+b)]]
    link_rings(m,[cut_square(r,z,b) for r,z,b in [(1.92,0,.28),(1.92,.62,.28),
                (1.7,.92,.4),(1.7,10.9,.4),(1.83,11.15,.36),(1.83,11.47,.36),
                (1.27,11.72,.29),(1.2,12.22,.29)]])
    m.lathe('stone',(0,0),[(.94,12.19),(1.48,12.49),(1.61,12.95),
                           (1.38,13.62),(.82,14.3),(0,15)],8)
    m.save(lim=((-2.2,2.2),(-2.2,2.2),(0,15)),tris=250)


def wall():
    m=Model('st_wall')
    m.box('stone',(-8,-.92,0),(8,.5,9))
    for row,cuts in enumerate([(-8,-2.9,3.3,8),(-8,.9,8),(-8,-4.2,2.1,8)]):
        for index,(x0,x1) in enumerate(zip(cuts,cuts[1:])):
            z0=row*3
            z1=z0+3
            front=(-1.3,-1.48,-1.24)[(row+index)%3]
            # 줄눈은 칸 안쪽에 둔다. 모듈 경계에서는 높이와 돌출량이 이어진다.
            a=x0+(.09 if x0!=-8 else 0)
            b=x1-(.09 if x1!=8 else 0)
            low=z0+(.08 if z0 else 0)
            high=z1-(.08 if z1!=9 else 0)
            def rect(l,r,bot,top,y):
                return [(l,y,bot),(r,y,bot),(r,y,top),(l,y,top)]
            link_rings(m,[rect(a,b,low,high,-.89),rect(a,b,low,high,-1.2),
                          rect(a+.19,b-.19,low+.17,high-.17,front)])
    m.save(lim=((-8,8),(-1.6,.5),(0,9)),exact='xz',tris=200)


def cap():
    m=Model('st_cap')
    m.prism('stone',[(-1.86,0),(.5,0),(.5,2),(-1.56,2),(-1.93,1.9),
                     (-2.14,1.65),(-2.2,1.32),(-2.2,.55)],-8,8)
    m.save(lim=((-8,8),(-2.2,.5),(0,2)),exact='x',tris=40)


for make in (stair,cheek,rail,railpost,wall,cap):
    make()
look(person=16)
done(pack='gangho_m4')
