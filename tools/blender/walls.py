# 방의 벽 조각(rw_*). 규격은 tools/blender/spec.json의 M1, 틀은 gangho_kit.py(ChatGPT에게 주는 것과 같은 틀이다).
# 이 파일은 Claude가 만든 임시 조각이다. **2026-11-20에 ChatGPT의 M1(art-src/blender/gangho_m1.py)을 받아 게임은 그쪽을 쓴다.** 이 파일은 견줘 볼 때만 돌린다(--install을 붙이면 받은 조각을 덮어쓰니 붙이지 않는다).
# 쓰는 법: python3 tools/blender/gpt.py run tools/blender/walls.py   (돌리고 규격으로 검사한다. 만든 것은 임시 폴더에 남는다)
# 약속: 벽의 앞면(방 안을 보는 넓은 면)이 y = 0, 방 안쪽이 -y, 벽의 몸은 +y 쪽으로 두께 5. 길이는 평면도 점(방 안 사람 키 22).
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

# 벽 한 칸: 아랫단, 넓은 면, 들보, 기와 덮개
m = Model('rw_wall')
m.box('wl_base', (-8, -.8, 0), (8, 5, 9))
m.box('wl_field', (-8, 0, 9), (8, 5, 52))
m.box('wl_beam', (-8, -1, 52), (8, 5, 57))
m.prism('wl_beam', [(-1, 57), (5, 57), (2.5, 62)], -8, 8)                                                      # 덮개 밑을 메우는 박공
m.prism('wl_roof', [(-2.5, 57.2), (2.5, 62.4), (7.5, 57.2), (7.5, 58), (2.5, 63.2), (-2.5, 58)], -8, 8)        # 맞배 덮개
for x in (-6, -2, 2, 6):                                                                                       # 수키와 줄: 4점마다
    m.bar('wl_roof', (x, -2.0, 58.5), (x, 2.5, 63.2), 1.3, .9, n=8)
    m.bar('wl_roof', (x, 2.5, 63.2), (x, 7.0, 58.5), 1.3, .9, n=8)
m.bar('wl_roof', (-8, 2.5, 63.3), (8, 2.5, 63.3), 1.7, 1.4, n=8)                                               # 용마루
m.save(lim=((-8, 8), (-2.5, 7.5), (0, 64)), exact='x', tris=500)

# 벽 사이기둥: 주춧돌, 여덟모 몸, 기둥머리
m = Model('rw_post')
m.box('wl_base', (-2.5, -3.5, 0), (2.5, 1, 3))
m.cyl('wl_post', (0, -1), 1.75, 3, 52, n=8)
m.box('wl_post', (-2.25, -3.25, 52), (2.25, 1, 53.2))
m.box('wl_post', (-2, -3, 53.2), (2, 1, 57))
m.save(lim=((-2.5, 2.5), (-3.5, 1), (0, 57)), tris=250)

# 모서리 기둥: 주춧돌, 네모 몸, 사모 덮개
m = Model('rw_pillar')
m.box('wl_base', (-4.5, -4.5, 0), (4.5, 4.5, 4))
m.box('wl_post', (-3.5, -3.5, 4), (3.5, 3.5, 62))
m.lathe('wl_roof', (0, 0), [(4.5, 62), (4.5, 63), (1, 68.6), (1, 70)], n=4)
m.save(lim=((-4.5, 4.5), (-4.5, 4.5), (0, 70)), tris=300)

# 방 안 두리기둥
m = Model('rw_column')
m.lathe('stone', (0, 0), [(3.5, 0), (3.5, 2), (3, 3)], n=8)
m.cyl('wl_post', (0, 0), 2.4, 3, 55, n=12)
m.lathe('wl_post', (0, 0), [(2.4, 55), (3.5, 58), (3.5, 60)], n=12)
m.save(lim=((-3.5, 3.5), (-3.5, 3.5), (0, 60)), exact='z', tris=300)

# 문지방 돌
m = Model('rw_sill')
m.prism('wl_base', [(-2, 0), (2, 0), (2, 2), (1.5, 2.5), (-1.5, 2.5), (-2, 2)], -8, 8)
m.save(lim=((-8, 8), (-2, 2), (0, 2.5)), exact='x', tris=40)

# 세로 살창: 틀, 창호지, 세로 살 여섯, 가로 띠살 둘
m = Model('rw_window')
m.box('wood_dark', (-7, -1.3, 0), (7, 0, 1.5)); m.box('wood_dark', (-7, -1.3, 21.5), (7, 0, 23))
m.box('wood_dark', (-7, -1.3, 1.5), (-5.5, 0, 21.5)); m.box('wood_dark', (5.5, -1.3, 1.5), (7, 0, 21.5))
m.box('win_paper', (-5.5, -.5, 1.5), (5.5, 0, 21.5))
for k in range(1, 7):                                         # 살은 얕게(0.3): 옆벽에 박힌 창을 비스듬히 봐도 살 사이로 창호지가 보인다
    x = -5.5 + 11 * k / 7
    m.box('wood_dark', (x - .35, -.8, 1.5), (x + .35, -.5, 21.5))
for z in (6.5, 16.5):
    m.box('wood_dark', (-5.5, -.9, z - .4), (5.5, -.5, z + .4))
m.save(lim=((-7, 7), (-1.6, 0), (0, 23)), tris=400)

# 둥근 문양판: 세로 축으로 돌려 만든 원판과 고리를 벽 쪽으로 눕힌다(rx=90이면 높이가 -y가 된다)
m = Model('rw_emblem')
with m.at((0, 0, 15), rx=90):
    m.lathe('paper', (0, 0), [(13.5, 0), (13.5, .8)], n=20)
    m.lathe('wood_dark', (0, 0), [(13.5, 0), (15, 0), (15, 1.6), (13.5, 1.6)], n=20, ring=True)
m.save(lim=((-15, 15), (-1.6, 0), (0, 30)), tris=300)
look(22)
done('gangho_m1')
