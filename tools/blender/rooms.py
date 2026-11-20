# 2026-11-20: 방의 벽은 이제 조각(rw_*.glb. tools/blender/walls.py, js/hd2d/rooms.js)으로 세운다. 이 파일로 구운 방 모형 가운데 **동굴(rm_cliffcave)만** 게임이 쓰고 나머지 열셋은 지웠다.
# 이름을 안 주면 동굴만 굽는다. 아래 글과 다른 방의 크기 표는 예전 방식의 기록이다.
# 방 안 틀 모형(rm_<방>.glb). 바닥은 게임이 깐다(js/tiles.js paintRoom). 여기서는 북쪽 벽(높게)과 양옆 벽(낮게), 기둥, 들보, 창, 벽등만 짓는다. 남쪽 벽은 짓지 않는다(카메라 쪽).
# 좌표: 평면도 점. 방 북서쪽 모서리가 (0, 0), **북쪽이 +y**(방 안은 y<0), z는 위(사람 키 15). 한 칸은 16점. 2D가 벽을 칠한 줄은 북쪽 0번 줄, 서쪽 0번 칸, 동쪽 마지막 칸이다.
# 쓰는 법: python3 tools/blender/rooms.py [방...] && GT=/tmp/gt/node_modules/.bin/gltf-transform bash tools/blender/pack.sh rm_inn ...
# 게임 쪽: js/hd2d/rooms.js의 ROOMS에 방 이름이 있으면 그 방을 새 화면으로 그리고 m.models = [{ key: 'rm_<방>' }]를 놓는다. 방 크기를 바꾸면 여기 SIZE도 고친다
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from kit import Build, export

TS = 16
# 방: (칸 가로, 칸 세로, 꼴). 크기는 js/maps.js의 M('방', 가로, 세로, …)과 같아야 한다
SIZE = {'inn': (18, 13, 'wood'), 'inn2': (18, 13, 'wood'), 'clinic': (14, 11, 'wood'), 'shop': (12, 10, 'wood'), 'shop2': (12, 10, 'wood'), 'library': (16, 12, 'wood'),
        'smith': (14, 11, 'stone'), 'well': (12, 9, 'stone'), 'hall_in': (18, 14, 'temple'), 'hall2': (14, 11, 'temple'), 'bokun': (14, 11, 'temple'), 'sutra': (16, 12, 'temple'),
        'shrine': (14, 11, 'temple'), 'cliffcave': (16, 12, 'cave')}
WALL_H, SIDE_H = 40, 12

def room(b, w, h, kind):
    W, D = w * TS, h * TS
    if kind == 'cave':
        rock = b.T('rock', 'hd_wall_stone', '#8a8c96'); dark = b.C('dark', '#1a1a22')
        for i, x in enumerate(range(-8, W + 8, 22)): hh = WALL_H - 6 + (i * 7) % 12; b.box(rock, (x, 2, 0), (x + 24, 16 + (i % 3) * 3, hh)); b.box(rock, (x + 4, 4, hh), (x + 20, 14, hh + 6))
        for x in (-6, W - 2):
            for y in range(-D, 0, 20): b.box(rock, (x - 4, y, 0), (x + 8, y + 22, SIDE_H + (y // 20) % 3 * 3))
        b.lamps += [[W * .3, 6, 24], [W * .7, 6, 24]]
        return
    if kind == 'wood': wall = b.T('wall', 'w_front'); post = b.C('post', '#4a2e1c'); beam = b.T('beam', 'e_plank'); side = b.T('side', 'w_side'); trim = b.C('trim', '#6a4428')
    elif kind == 'stone': wall = b.T('wall', 'hd_wall_stone'); post = b.C('post', '#3a2a20'); beam = b.T('beam', 'e_plank'); side = b.T('side', 'hd_wall_stone'); trim = b.C('trim', '#4a3a2c')
    else: wall = b.T('wall', 'w_front', '#e8d8c0'); post = b.C('post', '#8a2018'); beam = b.T('beam', 'e_plank', '#c08850'); side = b.T('side', 'w_side'); trim = b.C('trim', '#c89a3a')
    # 북쪽 벽: 앞면이 평면도 y=16(0번 줄 아래 끝)
    b.box(wall, (-4, 0, 0), (W + 4, 4, WALL_H)); b.box(beam, (-6, -1, WALL_H), (W + 6, 6, WALL_H + 4))
    b.box(trim, (-4, -.3, 0), (W + 4, 0, 3))  # 걸레받이
    # 기둥: 북쪽 벽 앞, 네 칸마다
    n = max(2, round(w / 4)); xs = [8 + (W - 16) * i / (n - 1) for i in range(n)]
    for x in xs: b.cyl(post, (x, -1.5), 2.2 if kind == 'temple' else 1.8, 0, WALL_H)
    # 창(나무·전각): 기둥 사이에 창살
    lat = b.C('lat', '#2a1a10'); paper = b.C('paper', '#e8dcb8')
    if kind != 'stone':
        for a, c in zip(xs, xs[1:]):
            m = (a + c) / 2
            if abs(m - W / 2) < 12: continue  # 가운데는 비운다(현판·병풍 자리)
            b.box(paper, (m - 9, -.4, 16), (m + 9, 0, 30))
            for k in range(5): b.box(lat, (m - 9 + k * 4.5 - .4, -.8, 16), (m - 9 + k * 4.5 + .4, -.4, 30))
            b.box(lat, (m - 9, -.8, 22.6), (m + 9, -.4, 23.4))
    if kind == 'temple':  # 현판
        b.box(lat, (W / 2 - 18, -.8, 28), (W / 2 + 18, -.4, 36)); b.box(trim, (W / 2 - 16, -1, 29), (W / 2 + 16, -.8, 35))
    # 양옆 벽: 낮게(사람을 가리지 않게)
    for x0 in (-4, W - 6):
        b.box(side, (x0, -D + TS, 0), (x0 + 10, 4, SIDE_H)); b.box(beam, (x0 - 1, -D + TS, SIDE_H), (x0 + 11, 4, SIDE_H + 2))
    # 벽등
    for x in (W * .25, W * .75): b.lamps.append([x, 2, 30]); b.cyl(b.C('lamp', '#c83a1a'), (x, -3), 2.2, 26, 32)

if __name__ == '__main__':
    want = sys.argv[1:] or ['cliffcave']
    for k in want:
        w, h, kind = SIZE[k]; b = Build(); room(b, w, h, kind); print('rm_' + k, export(b, 'rm_' + k))
