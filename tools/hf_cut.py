# Higgsfield로 받은 소품·나무 판을 잘라 게임 소품 그림으로(assets/hd/stamp/*.webp).
# 투명 바탕이면 그대로, 파랑 바탕이면 지운다. 붙어 있는 덩어리마다 테두리를 잡아(줄 순서, 줄 안에서는 왼쪽부터) 이름과 바닥 폭(평면도 점)에 맞춰 도트 굵기 48/15로 줄인다.
# 쓰는 법: python3 tools/hf_cut.py   (art-src/higgsfield/HT1.png, HP3.png, HP4.png를 읽는다)
import os, numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); SRC = os.path.join(ROOT, 'art-src', 'higgsfield'); OUT = os.path.join(ROOT, 'assets', 'hd', 'stamp')
DOT = 48 / 15
def alpha_of(im):
    im = im.convert('RGBA'); a = np.asarray(im).astype(np.int16); al = a[..., 3].astype(np.float32) / 255
    if al.min() > .9:  # 파랑 바탕
        r, g, b = a[..., 0], a[..., 1], a[..., 2]; blue = b - np.maximum(r, g)
        al = np.clip(1 - (blue - 90) / 90, 0, 1); al[(b > 200) & (r < 60) & (g < 60)] = 0
        al = np.asarray(Image.fromarray((al * 255).astype(np.uint8)).filter(ImageFilter.MinFilter(3))) / 255
    return im, al
def shrink(rgba, al, scale):
    a = np.asarray(rgba).astype(np.float32) / 255; a[..., 3] = al
    pm = a.copy(); pm[..., :3] *= pm[..., 3:4]; h, w = al.shape; W, H = max(1, round(w * scale)), max(1, round(h * scale))
    q = np.stack([np.asarray(Image.fromarray(pm[..., k]).resize((W, H), Image.BOX)) for k in range(4)], -1)
    A = q[..., 3:4]; rgb = np.where(A > 1e-4, q[..., :3] / np.maximum(A, 1e-4), 0)
    return Image.fromarray((np.concatenate([np.clip(rgb, 0, 1), (A > .5)], -1) * 255).astype(np.uint8), 'RGBA')
def run(src, names):
    im, al = alpha_of(Image.open(os.path.join(SRC, src))); A = al > .5
    lab, n = ndimage.label(ndimage.binary_dilation(A, iterations=10))
    objs = sorted([o for o in ndimage.find_objects(lab) if (o[0].stop - o[0].start) * (o[1].stop - o[1].start) > 6000], key=lambda o: (o[0].start + o[0].stop) / 2)
    rows, cur = [], []
    for o in objs:
        if cur and (o[0].start + o[0].stop) / 2 - (cur[0][0].start + cur[0][0].stop) / 2 > 150: rows.append(cur); cur = []
        cur.append(o)
    rows.append(cur); flat = [o for r in rows for o in sorted(r, key=lambda o: o[1].start)]; out = []
    for o, (nm, w) in zip(flat, names):
        sub = A[o]; ys = np.where(sub.any(1))[0]; xs = np.where(sub.any(0))[0]
        y0, y1, x0, x1 = o[0].start + ys[0], o[0].start + ys[-1] + 1, o[1].start + xs[0], o[1].start + xs[-1] + 1
        s = shrink(im.crop((x0, y0, x1, y1)), al[y0:y1, x0:x1], w * DOT / (x1 - x0)); s.save(os.path.join(OUT, nm + '.webp'), lossless=True); out.append((nm, w, round(s.height / DOT)))
    return out
SHEETS = {
    'HT1.png': [('t_pine', 40), ('t_camphor', 48), ('t_plum', 40), ('t_willow', 40), ('t_bamboo', 26), ('t_maple', 44), ('t_shrubs', 30), ('t_dead', 36)],
    'HP3.png': [('p_bench', 28), ('p_teatable', 30), ('p_vat', 20), ('p_woodshed', 30), ('p_laundry', 30), ('p_pots', 22), ('p_bamboofence', 30), ('p_stonewall', 30), ('p_chili', 24), ('p_garlic', 26), ('p_ladder', 24), ('p_coop', 30)],
    'HP4.png': [('g_tallgrass', 14), ('g_fern', 18), ('g_yflowers', 18), ('g_wflowers', 18), ('g_mossrock', 16), ('g_rocks', 18), ('g_log', 24), ('g_stump', 18), ('g_reeds', 14), ('g_lily', 18), ('g_bush', 16), ('g_ivy', 18)],
}
if __name__ == '__main__':
    for f, names in SHEETS.items():
        if os.path.exists(os.path.join(SRC, f)):
            for r in run(f, names): print(*r)
