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

def _hall(b, x0, x1, y0, depth, h, roofk, wallk, colk, pillar=True):
    """뒤 배경용 전각 한 채: 기단, 벽, 기둥줄, 겹 지붕"""
    b.box(b.T('base', 'hd_wall_stone'), (x0 - 6, y0, 0), (x1 + 6, y0 + depth + 6, 6), b.T('btop', 'k_stone'))
    b.box(wallk, (x0, y0 + 6, 6), (x1, y0 + depth, 6 + h))
    if pillar:
        for x in range(int(x0) + 2, int(x1), 18): b.cyl(colk, (x, y0 + 3), 1.6, 6, 6 + h)
    b.box(roofk, (x0 - 10, y0 - 4, 6 + h), (x1 + 10, y0 + depth + 8, 9 + h)); b.box(roofk, (x0 - 2, y0 + 2, 9 + h), (x1 + 2, y0 + depth, 14 + h))

def _wall(b, key, x0, x1, y, h, cap=None):
    b.box(key, (x0, y, 0), (x1, y + 4, h)); 
    if cap: b.box(cap, (x0 - 1, y - 1.5, h), (x1 + 1, y + 5.5, h + 3))

def _rock(b, key, x, y, w, d, h):
    b.box(key, (x, y, 0), (x + w, y + d, h * .6)); b.box(key, (x + w * .15, y + d * .15, h * .6), (x + w * .8, y + d * .85, h))

def court(b):
    """문파 마당: 뒤에 전각과 돌계단, 양옆 회랑, 석등"""
    wall = b.T('wall', 'w_front'); roof = b.T('roof', 'r_dark'); red = b.C('red', '#8a2018'); stone = b.T('stone', 'hd_wall_stone'); top = b.T('stop', 'k_stone'); gold = b.C('gold', '#d8a83a'); dark = b.C('dark', '#2a2420')
    _hall(b, 110, 274, 22, 30, 26, roof, wall, red)
    for i in range(4): b.box(stone, (150 + i * 4, 4 + i * 4, 0), (234 - i * 4, 8 + i * 4, 1.5 + i * 1.5), top)  # 돌계단
    b.box(dark, (176, 21.6, 22), (208, 22, 30)); b.box(gold, (178, 21.4, 23), (206, 21.6, 29))
    _wall(b, b.T('tile', 'hd_wall_tile'), -20, 100, 8, 14, roof); _wall(b, b.T('tile', 'hd_wall_tile'), 284, 404, 8, 14, roof)
    for x, sgn in ((-14, 1), (W + 14, -1)):  # 양옆 회랑
        for y in range(-200, 1, 40): b.cyl(red, (x, y), 1.6, 0, 22)
        b.box(roof, (x - 10, -210, 22), (x + 10, 6, 25))
    for x in (60, 324):  # 석등
        b.box(stone, (x - 3, 10, 0), (x + 3, 16, 2)); b.cyl(stone, (x, 13), 1.4, 2, 10); b.box(stone, (x - 3, 10, 10), (x + 3, 16, 15)); b.box(roof, (x - 4.5, 8.5, 15), (x + 4.5, 17.5, 17))
        b.lamps.append([x, 13, 13])

def yard(b):
    """객잔 뒷마당: 객잔 뒷벽, 장독대, 빨랫줄, 우물"""
    wall = b.T('wall', 'w_front'); roof = b.T('roof', 'r_orange'); wood = b.T('wood', 'e_plank'); stone = b.T('stone', 'hd_wall_stone'); top = b.T('stop', 'k_stone')
    jar = b.C('jar', '#5a3220'); rope = b.C('rope', '#d8d0b8'); cloth1 = b.C('c1', '#d9cfb0'); cloth2 = b.C('c2', '#6f8aa8'); dark = b.C('dark', '#2a2420')
    _hall(b, 80, 300, 18, 26, 30, roof, wall, wood, pillar=False)
    b.box(dark, (180, 23.6, 6), (196, 24, 22))  # 뒷문
    b.box(stone, (14, 6, 0), (64, 26, 4), top)  # 장독대
    for i, (x, y) in enumerate([(20, 12), (30, 12), (40, 12), (50, 12), (25, 20), (37, 20), (49, 20)]): b.cyl(jar, (x, y), 3.2 - (i % 3) * .4, 4, 10 - (i % 3)); b.cyl(dark, (x, y), 2, 10 - (i % 3), 11 - (i % 3))
    for x in (318, 372): b.cyl(wood, (x, 10), 1, 0, 22)  # 빨랫줄
    b.tube(rope, [(318, 10, 21), (345, 10, 19), (372, 10, 21)], .4, .4)
    b.cloth(cloth1, 324, 9.6, 12, 20, 10); b.cloth(cloth2, 348, 9.6, 11, 19, 12)
    b.cyl(stone, (W + 16, -60), 7, 0, 6); b.cyl(dark, (W + 16, -60), 5.5, 5.9, 6.1)  # 우물(오른쪽)
    for x in (W + 10, W + 22): b.cyl(wood, (x, -60), .8, 6, 20)
    b.box(roof, (W + 6, -66, 20), (W + 26, -54, 22))
    _wall(b, b.T('mudw', 'w_side'), -14, -10, 0, 0)

def village(b):
    """마을 어귀: 초가와 싸리 울타리, 수레, 장승"""
    mud = b.T('mud', 'w_side'); thatch = b.T('thatch', 'r_thatch'); wood = b.T('wood', 'e_plank'); fence = b.C('fence', '#8a6a3c'); dark = b.C('dark', '#3a2a1e'); red = b.C('red', '#9a2a1c')
    for x0, x1 in ((10, 96), (150, 230), (290, 370)):
        b.box(mud, (x0, 26, 0), (x1, 48, 20)); b.box(thatch, (x0 - 6, 22, 20), (x1 + 6, 52, 24)); b.box(thatch, (x0, 28, 24), (x1, 46, 30)); b.box(dark, ((x0 + x1) / 2 - 5, 25.6, 0), ((x0 + x1) / 2 + 5, 26, 14))
    for x in range(-20, W + 21, 8): b.cyl(fence, (x, 6), .7, 0, 8)
    b.tube(fence, [(-20, 6, 4), (W + 20, 6, 4)], .6, .6); b.tube(fence, [(-20, 6, 7), (W + 20, 6, 7)], .6, .6)
    b.box(wood, (110, 12, 4), (138, 22, 7)); b.cyl(dark, (113, 11), 4, 0, 1.2); b.cyl(dark, (135, 11), 4, 0, 1.2)  # 수레
    for x in (248, 262):  # 장승 둘
        b.cyl(wood, (x, 14), 2.6, 0, 24); b.box(red, (x - 2.8, 11.2, 18), (x + 2.8, 11.6, 22))

def forest(b):
    """숲속 빈터: 쓰러진 고목, 바위, 이끼 낀 돌무더기. 나무는 그림판 그대로 둔다"""
    bark = b.C('bark', '#4a3626'); moss = b.C('moss', '#3e5a2c'); rock = b.T('rock', 'hd_wall_stone', '#a0a8a0'); dark = b.C('dark', '#241a12')
    b.tube(bark, [(40, 14, 0), (90, 18, 3), (140, 12, 1)], 7, 7); b.cyl(dark, (40, 14), 3.4, 0, 7)  # 쓰러진 고목
    for x, y, w, d, h in ((180, 10, 22, 14, 14), (206, 16, 14, 10, 9), (300, 8, 26, 16, 18), (-24, -60, 18, 22, 12), (W + 6, -120, 20, 18, 14), (W + 4, -30, 14, 12, 8)): _rock(b, rock, x, y, w, d, h)
    for x, y in ((70, 22), (230, 20), (330, 26)): b.box(moss, (x - 8, y - 4, 0), (x + 8, y + 4, 3))

def dock(b):
    """나루: 잔교와 말뚝, 묶인 배, 창고"""
    wood = b.T('wood', 'e_plank'); post = b.C('post', '#3e2c1c'); roof = b.T('roof', 'r_dark'); wall = b.T('wall', 'w_side'); rope = b.C('rope', '#c9ad6a'); hull = b.C('hull', '#5a3a22')
    _hall(b, 250, 360, 26, 22, 20, roof, wall, wood, pillar=False)
    for x in range(-10, 230, 22): b.cyl(post, (x, 4), 1.6, -2, 9)
    b.tube(rope, [(x, 4, 8) for x in range(-10, 230, 22)], .5, .5)
    b.box(wood, (60, 8, 0), (110, 60, 2))  # 잔교(북쪽 물 위로)
    for x in (62, 108):
        for y in (20, 40, 58): b.cyl(post, (x, y), 1.4, -4, 5)
    for bx, by in ((126, 30), (170, 44)):  # 배 두 척
        b.box(hull, (bx, by, -1), (bx + 34, by + 10, 4)); b.box(hull, (bx + 4, by + 1, 4), (bx + 30, by + 9, 5)); b.cyl(post, (bx + 17, by + 5), .8, 4, 22)
    for i in range(3): b.box(wood, (276 + i * 14, 6, 0), (288 + i * 14, 16, 8))  # 짐 상자

def fort(b):
    """산채: 통나무 목책, 망루, 깃발"""
    log = b.C('log', '#5a3e26'); dark = b.C('dark', '#2e2016'); thatch = b.T('thatch', 'r_thatch'); red = b.C('red', '#7a1a14')
    for x in range(-24, W + 25, 6): b.cyl(log, (x, 8 + (x % 12) * .1), 2.8, 0, 22 + (x * 7 % 5))
    for x in range(-24, W + 25, 6): b.box(dark, (x - 1, 8, 20 + (x * 7 % 5)), (x + 1, 10, 24 + (x * 7 % 5)))  # 뾰족 끝
    b.tube(dark, [(-24, 6, 14), (W + 24, 6, 14)], 1, 1.4)
    for x in (40, 330):  # 망루
        for dx in (-8, 8):
            for dy in (-6, 6): b.cyl(log, (x + dx, 22 + dy), 1.6, 0, 40)
        b.box(log, (x - 11, 13, 32), (x + 11, 31, 34)); b.box(thatch, (x - 13, 11, 42), (x + 13, 33, 46))
        b.cloth(red, x + 8, 15, 46, 56, 10); b.cyl(dark, (x + 8, 15), .6, 42, 58)
    b.box(dark, (176, 7, 0), (208, 11, 26))  # 닫힌 문

def moon(b):
    """달밤 벌판: 무너진 돌담과 비석, 마른 덤불"""
    stone = b.T('stone', 'hd_wall_stone', '#9a9cb0'); dark = b.C('dark', '#1c1c26'); brush = b.C('brush', '#3a3020')
    for x0, x1, h in ((10, 70, 10), (84, 120, 6), (240, 300, 12), (318, 360, 7)): b.box(stone, (x0, 12, 0), (x1, 18, h))
    for x0, x1 in ((60, 72), (292, 304)): b.box(stone, (x0, 20, 0), (x1, 28, 3))  # 무너진 돌
    for x, h in ((160, 20), (196, 26), (226, 18)): b.box(stone, (x - 4, 20, 0), (x + 4, 24, h)); b.box(dark, (x - 2.5, 19.8, h * .3), (x + 2.5, 20, h * .9))  # 비석
    for x, y in ((130, 30), (210, 34), (-14, -90), (W + 12, -150)): b.box(brush, (x - 6, y - 4, 0), (x + 6, y + 4, 5))

def sand(b):
    """사막: 풍화된 돌기둥과 무너진 문, 모래 둔덕"""
    stone = b.T('stone', 'hd_wall_stone', '#d8b880'); sandc = b.C('sand', '#c9a468')
    for x, h in ((40, 30), (110, 18), (300, 34), (350, 14)): b.box(stone, (x - 5, 18, 0), (x + 5, 28, h)); b.box(stone, (x - 6.5, 16.5, h), (x + 6.5, 29.5, h + 3))
    b.box(stone, (170, 20, 0), (180, 28, 32)); b.box(stone, (204, 20, 0), (214, 28, 32)); b.box(stone, (164, 18, 32), (220, 30, 38))  # 무너진 문
    for x, y, w in ((60, 34, 60), (240, 40, 80), (-30, -100, 30), (W + 4, -60, 30)): b.box(sandc, (x, y - 6, 0), (x + w, y + 6, 5))

def snow(b):
    """설원: 얼음 바위와 눈 쌓인 돌, 부러진 창"""
    ice = b.C('ice', '#bcd4e6'); snowc = b.T('snow', 'g_snow'); dark = b.C('dark', '#3a3e4a')
    for x, y, w, d, h in ((20, 14, 30, 18, 22), (60, 22, 16, 12, 12), (300, 12, 34, 20, 28), (344, 26, 18, 12, 10), (150, 30, 20, 14, 16), (-26, -110, 22, 24, 16), (W + 6, -70, 22, 20, 18)): _rock(b, ice, x, y, w, d, h)
    for x, y in ((100, 16), (250, 18)): b.box(snowc, (x - 12, y - 6, 0), (x + 12, y + 6, 4))
    for x in (200, 214): b.tube(dark, [(x, 12, 0), (x + 4, 14, 18)], .8, .8)

def room(b):
    """실내(큰 방): 북쪽 벽과 양옆 벽, 기둥, 들보, 병풍과 탁자"""
    wall = b.T('wall', 'w_front'); side = b.T('side', 'w_side'); wood = b.T('wood', 'e_plank'); red = b.C('red', '#7a2018'); screen = b.C('screen', '#d8caa0'); dark = b.C('dark', '#2a2018')
    b.box(wall, (-30, 4, 0), (W + 30, 10, 44)); b.box(wood, (-30, 2, 44), (W + 30, 12, 48))
    for x in (-24, W + 20): b.box(side, (x, -250, 0), (x + 4, 10, 44))
    for x in range(-8, W + 9, 64): b.cyl(red, (x, 0), 2.4, 0, 44)
    for x in range(0, 6): b.box(screen, (150 + x * 14, 10.2, 0), (162 + x * 14, 11, 26))  # 병풍
    for x in (60, 324): b.box(dark, (x - 14, 14, 0), (x + 14, 26, 10)); b.box(wood, (x - 16, 12, 10), (x + 16, 28, 12))  # 뒤 탁자
    for x in (110, 274): b.lamps.append([x, 8, 34]); b.cyl(red, (x, 8), 2.4, 30, 36)  # 벽등

STAGES = {'ring': ring, 'court': court, 'yard': yard, 'village': village, 'forest': forest, 'dock': dock, 'fort': fort, 'moon': moon, 'sand': sand, 'snow': snow, 'room': room}

if __name__ == '__main__':
    want = sys.argv[1:] or list(STAGES)
    for k in want:
        b = Build(); STAGES[k](b); print('st_' + k, export(b, 'st_' + k))
