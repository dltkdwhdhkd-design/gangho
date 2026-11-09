# 받은 일러스트를 게임에 넣는다: python3 tools/art_in.py <그림 파일> <이름>  (예: so_n)
# 표정 그림(so_h 같은 것)은 같은 인물의 _n 그림에 자리와 크기를 맞춘다. 표정이 바뀔 때 인물이 들썩이지 않게 하려는 것
# 시작할 때 전부 내려받으므로 WebP로 줄인다. PNG보다 약 7배 작고 눈으로는 차이가 없다
import json, os, sys
import numpy as np
from PIL import Image

def align(im, base):
    """im을 base 그림에 맞춰 옮기고 키운다. 특징점이 모자라면 크기만 맞춘다"""
    import cv2
    W, H = base.size; im = im.resize((W, H), Image.LANCZOS)
    def gray(x): bg = Image.new('RGBA', x.size, (128, 128, 128, 255)); bg.alpha_composite(x); return np.array(bg.convert('L'))
    a, b = gray(im), gray(base); orb = cv2.ORB_create(4000); ka, da = orb.detectAndCompute(a, None); kb, db = orb.detectAndCompute(b, None)
    if da is None or db is None: return im, None
    m = sorted(cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=True).match(da, db), key=lambda q: q.distance)[:600]
    if len(m) < 30: return im, None
    pa = np.float32([ka[q.queryIdx].pt for q in m]); pb = np.float32([kb[q.trainIdx].pt for q in m])
    M, inl = cv2.estimateAffinePartial2D(pa, pb, method=cv2.RANSAC, ransacReprojThreshold=3)
    if M is None or inl.sum() < 25: return im, None
    s = float(np.hypot(M[0, 0], M[1, 0]))
    if not .85 < s < 1.18: return im, None  # 너무 다르면 엉뚱하게 맞춘 것이다
    out = cv2.warpAffine(np.array(im), M, (W, H), flags=cv2.INTER_LANCZOS4, borderMode=cv2.BORDER_CONSTANT, borderValue=(0, 0, 0, 0))
    return Image.fromarray(out, 'RGBA'), (round(s, 3), round(float(M[0, 2]), 1), round(float(M[1, 2]), 1), int(inl.sum()))

src, key = sys.argv[1], sys.argv[2]
im = Image.open(src).convert('RGBA')
if im.height > 1152: im = im.resize((round(im.width * 1152 / im.height), 1152), Image.LANCZOS)  # 게임 시작이 느려지지 않게 줄인다
base = f"assets/art/{key[:-2]}_n.webp"
if key[-2:] in ('_h', '_a', '_s', '_b') and os.path.exists(base): im, info = align(im, Image.open(base).convert('RGBA')); print(key, '맞춤', info or '실패: 크기만 맞춤')
im.save(f'assets/art/{key}.webp', 'WEBP', quality=86, method=6, alpha_quality=90)
lst = json.load(open('assets/art/list.json', encoding='utf8'))
if key not in lst: lst.append(key)
json.dump(sorted(lst), open('assets/art/list.json', 'w', encoding='utf8'), ensure_ascii=False)
print(key)
