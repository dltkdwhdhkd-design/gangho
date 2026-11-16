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
