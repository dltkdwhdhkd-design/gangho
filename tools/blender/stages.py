# 전투 무대 모형(st_<테마>.glb). 무대 바닥은 게임이 깔고(js/hd2d/stages.js), 여기서는 무대 둘레(뒤 배경·옆 소품)만 짓는다.
# 좌표: 무대는 가로 384(x 0..384), 세로 240. 무대 북쪽 끝이 y=0이고 **북쪽(화면 위)이 +y**, 무대 안은 y<0이다. z는 위(사람 키 15).
# 지킬 것: 무대 안(0<x<384, -240<y<0)에는 사람을 가리는 높은 것을 두지 않는다. 남쪽(y<-240, 화면 아래)은 비운다. 높은 것은 북쪽과 양옆에만.
# 쓰는 법: python3 tools/blender/stages.py [테마...] && GT=/tmp/gt/node_modules/.bin/gltf-transform tools/blender/pack.sh st_ring
# 게임 쪽: stages.js의 BUILD에서 `m.models = [{ key: 'st_ring' }]`. 모형이 없으면 아무것도 안 놓인다.
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from kit import Build, export

W, H = 384, 240

def ring(b):
    """비무대: 뒤에 계단식 구경 자리와 패방, 양옆 깃대, 무대 둘레 밧줄"""
    stone = b.T('stone', 'hd_wall_stone'); top = b.T('cobble', 'g_cobble'); wood = b.T('wood', 'e_plank'); roof = b.T('roof', 'r_dark')
    red = b.C('red', '#8a2018'); rope = b.C('rope', '#c9ad6a'); dark = b.C('dark', '#2a2420'); gold = b.C('gold', '#d8a83a')
    # 계단식 구경 자리 세 단(가운데는 패방 길로 비운다)
    for x0, x1 in ((6, 150), (234, 378)):
        for i in range(3): b.box(stone, (x0, 16 + i * 13, 0), (x1, 29 + i * 13, 6 + i * 6), top)
        b.box(wood, (x0, 55, 0), (x1, 58, 30))                                   # 뒤 판벽
        b.box(roof, (x0 - 4, 44, 30), (x1 + 4, 62, 33))                          # 차양
        for x in range(x0 + 4, x1, 28): b.cyl(red, (x, 46), 1.4, 18, 30)         # 차양 기둥
    # 난간: 구경 자리 앞
    for x0, x1 in ((6, 150), (234, 378)):
        for x in range(x0, x1 + 1, 24): b.cyl(dark, (x, 12), 1, 0, 7)
        b.tube(dark, [(x0, 12, 6.5), (x1, 12, 6.5)], 1.2, 1.2)
    # 패방(가운데 문): 붉은 기둥 둘, 들보, 지붕, 현판
    for x in (158, 226): b.cyl(red, (x, 40), 3.2, 0, 44, 12)
    b.box(wood, (150, 37, 38), (234, 43, 44)); b.box(roof, (140, 32, 44), (244, 48, 48)); b.box(roof, (150, 35, 48), (234, 45, 51))
    b.box(dark, (176, 36.4, 30), (208, 37, 38)); b.box(gold, (178, 36.2, 31), (206, 36.4, 37))
    b.lamps += [[158, 40, 30], [226, 40, 30]]   # 등불 자리도 같은 좌표(x, 북쪽 +y, 높이)
    # 양옆 깃대와 깃발
    for i, y in enumerate((-30, -110, -190)):
        for x, sgn in ((-10, 1), (W + 10, -1)):
            b.cyl(dark, (x, y), 1.2, 0, 46); b.cloth(b.C('flag%d' % (i % 2), ('#a8281c', '#27407e')[i % 2]), x if sgn > 0 else x - 12, y, 26, 44, 12)
    # 무대 둘레 밧줄: 북쪽과 양옆(남쪽은 비운다)
    posts = [(-2, -150), (-2, -75), (-2, 4), (96, 4), (192, 4), (288, 4), (W + 2, 4), (W + 2, -75), (W + 2, -150)]
    for x, y in posts: b.cyl(red, (x, y), 1.6, 0, 9)
    b.tube(rope, [(x, y, 7) for x, y in posts], .8, .8)

STAGES = {'ring': ring}   # 다음: court, yard, village, forest, dock, fort, moon, sand, snow, room (docs/master-plan.md D1)

if __name__ == '__main__':
    want = sys.argv[1:] or list(STAGES)
    for k in want:
        b = Build(); STAGES[k](b); print('st_' + k, export(b, 'st_' + k))
