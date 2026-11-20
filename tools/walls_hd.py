# 담장·울타리·대문(ChatGPT HD1~HD3)을 새 화면 그림으로 자른다. 2D 화면은 그대로다
# HD1: 1행 담장 한 칸(회벽 기와담, 돌담, 성벽), 2행 끝 기둥 / HD2: 1행 울타리 한 칸(나무 울짱, 대나무, 싸리 바자), 2행 끝 기둥 / HD3: 대문 셋(산문 패방, 고을 성문, 세가 대문)
# 담장·울타리 한 칸은 좌우가 맞물리게 그려 달라 했으니 그대로 되풀이해 깐다(js/hd2d.js wallRun)
# 쓰는 법: python3 tools/walls_hd.py
import os, sys
import numpy as np
from PIL import Image
from scipy import ndimage
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from hd2d_preview import key_out, shrink, ROOT
SRC = os.path.join(ROOT, 'art-src', 'chatgpt'); OUT = os.path.join(ROOT, 'assets', 'hd2d', 'preview'); K = .2  # 받은 그림 5점 → 1도트(문파 벽과 같은 굵기)
SHEETS = {'HD1': (['hd_wall_tile', 'hd_wall_stone', 'hd_wall_rampart'], 2), 'HD2': (['hd_fence_stake', 'hd_fence_bamboo', 'hd_fence_wattle'], 2), 'HD3': (['gate_arch', 'hd_gate_town', 'gate'], 1)}
def tight(c):
    A = np.asarray(c.getchannel('A')) > 127; ys = np.where(A.sum(1) > 3)[0]; xs = np.where(A.sum(0) > 3)[0]
    return (xs[0], ys[0], xs[-1] + 1, ys[-1] + 1)
for sh, (names, nrow) in SHEETS.items():
    p = os.path.join(SRC, sh + '.png')
    if not os.path.exists(p): continue
    im = key_out(Image.open(p)); A = np.asarray(im.getchannel('A')) > 127
    lab, _ = ndimage.label(ndimage.binary_dilation(A, iterations=4))
    objs = sorted([o for o in ndimage.find_objects(lab) if (o[0].stop - o[0].start) * (o[1].stop - o[1].start) > 6000], key=lambda o: (o[0].start + o[0].stop) / 2)
    rows = [sorted(objs[r * 3:(r + 1) * 3], key=lambda o: o[1].start) for r in range(nrow)]
    for j in range(nrow):
        for i in range(3):
            o = rows[j][i]; c = im.crop((o[1].start, o[0].start, o[1].stop, o[0].stop)); c = c.crop(tight(c))
            n = names[i] + ('_post' if j else ''); s = shrink(c, K); s.save(os.path.join(OUT, n + '.webp'), lossless=True); print(n, s.size)

# 문짝을 뗀 대문(임시). 받은 대문 그림은 문이 닫혀 있는데 게임에서는 그 문으로 드나든다. 열린 문 그림이 올 때까지 문짝 자리만 비워 뒤가 보이게 한다(js/hd2d.js가 *_open을 쓴다).
#   세가 대문(gate): 붉은 문짝 두 짝의 네모를 비운다(위 모서리의 금빛 까치발은 문틀이라 남긴다)
#   고을 성문(hd_gate_town): 홍예 안의 나무 문을 비운다(돌이 아닌 빛깔을 문 가운데에서 번져 가며 찾는다. 가는 줄눈으로 새지 않게 먼저 가는 선을 지운다)
def open_gate():
    p = os.path.join(OUT, 'gate.webp')
    if os.path.exists(p):
        im = Image.open(p).convert('RGBA'); a = np.array(im); H, W = a.shape[:2]; fx, fy = W / 111, H / 109
        X = lambda v: int(round(v * fx)); Y = lambda v: int(round(v * fy))
        a[Y(59):Y(98), X(32):X(79), 3] = 0; a[Y(51):Y(59), X(41):X(70), 3] = 0
        top = a[Y(51):Y(59), X(32):X(79)]; red = (top[..., 0] > 110) & (top[..., 1] < 75) & (top[..., 2] < 70); top[red, 3] = 0   # 까치발 밑에 남은 문짝의 붉은 조각
        Image.fromarray(a).save(os.path.join(OUT, 'gate_open.webp'), lossless=True); print('gate_open', (W, H))
    p = os.path.join(OUT, 'hd_gate_town.webp')
    if os.path.exists(p):
        im = Image.open(p).convert('RGBA'); a = np.array(im); H, W = a.shape[:2]; fx, fy = W / 102, H / 120
        rgb = a[..., :3].astype(int); lum = rgb @ np.array([.3, .59, .11]); sat = rgb.max(2) - rgb.min(2)
        door = ~((lum > 132) & (sat < 75)) & (a[..., 3] > 127)                      # 돌이 아닌 것
        box = np.zeros((H, W), bool); box[int(62 * fy):H, int(28 * fx):int(75 * fx)] = True
        door = ndimage.binary_opening(door & box, iterations=2)                      # 가는 줄눈을 지운다
        lab, _ = ndimage.label(door); k = lab[int(95 * fy), int(51 * fx)]
        if k:
            m = ndimage.binary_dilation(lab == k, iterations=2) & box & ~((lum > 132) & (sat < 75))   # 지우며 깎인 가장자리를 되찾는다
            m = ndimage.binary_fill_holes(m); m = ndimage.binary_erosion(m, iterations=1)            # 홍예 안쪽의 어두운 테는 남긴다
            a[m, 3] = 0; Image.fromarray(a).save(os.path.join(OUT, 'hd_gate_town_open.webp'), lossless=True); print('hd_gate_town_open', (W, H), int(m.sum()))
open_gate()
