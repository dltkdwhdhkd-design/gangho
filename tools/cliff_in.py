# 받아 둔 절벽 그림(art-src/chatgpt/HK3.png: 절벽 앞면 둘, 모서리 둘, 바위 계단, 이끼 바위)을 새 화면의 높낮이 지형에 쓰는 그림으로 만든다.
#   assets/hd2d/preview/cl_rock.webp  : 절벽 면 무늬(가로세로로 이어 붙는다). 앞면 둘에서 풀 아래 바위만 잘라 옆으로 이었다
#   assets/hd2d/preview/cl_step.webp  : 돌계단 한 단(위 절반은 디딤판, 아래 절반은 챌판. 가로로 이어 붙는다)
# 크기는 다른 새 그림과 같은 도트 굵기(평면도 1점 = 3.2점)로 줄인다. 절벽 앞면 하나의 폭을 평면도 48점(세 칸)으로 잡았다.
# 그림의 풀 띠와 이끼 바위는 쓰지 않는다: 절벽 위 끝은 블렌더 절벽 조각의 윗면이 땅 그림을 이어받고, 바위는 모형으로 세운다(tools/blender/rocks.py).
# 쓰는 법: python3 tools/cliff_in.py
import os
import numpy as np
from PIL import Image
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'art-src', 'chatgpt', 'HK3.png'); PV = os.path.join(ROOT, 'assets', 'hd2d', 'preview')
DOT = 48 / 15; K = 48 * DOT / 432  # 그림 432px(앞면 하나의 폭)이 평면도 48점

im = Image.open(SRC).convert('RGB'); A = np.asarray(im).astype(np.float32)

def shrink(rgb, k=K):
    """면적 평균으로 줄인다"""
    h, w = rgb.shape[:2]; W, H = max(1, round(w * k)), max(1, round(h * k))
    return np.asarray(Image.fromarray(rgb.astype(np.uint8)).resize((W, H), Image.BOX)).astype(np.float32)

def join(a, c, f):
    """a 오른쪽 끝 f칸과 c 왼쪽 끝 f칸을 섞어 옆으로 잇는다"""
    t = np.linspace(0, 1, f)[None, :, None]; mid = a[:, -f:] * (1 - t) + c[:, :f] * t
    return np.concatenate([a[:, :-f], mid, c[:, f:]], axis=1)

def wrap_h(a, f):
    """가로로 이어 붙게: 오른쪽 끝 f칸을 왼쪽 끝에 섞어 넣고 잘라 낸다"""
    t = np.linspace(0, 1, f)[None, :, None]; out = a[:, :-f].copy(); out[:, :f] = a[:, -f:] * (1 - t) + a[:, :f] * t; return out

def wrap_v(a, f):
    t = np.linspace(0, 1, f)[:, None, None]; out = a[:-f].copy(); out[:f] = a[-f:] * (1 - t) + a[:f] * t; return out

def save(arr, path):
    a8 = np.clip(arr, 0, 255).astype(np.uint8); Image.fromarray(a8).save(path, lossless=True); print(os.path.relpath(path, ROOT), a8.shape[1], 'x', a8.shape[0], '→ 평면도', round(a8.shape[1] / DOT, 1), 'x', round(a8.shape[0] / DOT, 1))

# 1) 절벽 면: 앞면 A, B에서 풀 아래 바위만(세로 219~423, 양옆 테두리 6px를 뺀다)
rockA = shrink(A[219:423, 48 + 6:480 - 6]); rockB = shrink(A[219:423, 551 + 6:984 - 6])
rock = wrap_v(wrap_h(join(rockA, rockB, 8), 8), 5)
save(rock, os.path.join(PV, 'cl_rock.webp'))

# 2) 돌계단 한 단: 계단 그림의 아래 두 단에서 디딤판(위)과 챌판(아래)을 잘라 옆으로 잇는다. 높이는 디딤판 12점 + 챌판 8점으로 맞춘다
def step(x0, y0, x1, y1, ysplit):
    top = shrink(A[y0:ysplit, x0:x1]); rise = shrink(A[ysplit:y1, x0:x1]); w = top.shape[1]
    top = np.asarray(Image.fromarray(top.astype(np.uint8)).resize((w, 12), Image.BOX)).astype(np.float32); rise = np.asarray(Image.fromarray(rise.astype(np.uint8)).resize((w, 8), Image.BOX)).astype(np.float32)
    return np.concatenate([top, rise], axis=0)
s5 = step(624, 803, 770, 843, 825); s6 = step(590, 848, 770, 893, 872)
stp = wrap_h(join(s5, s6, 6), 6)
save(stp, os.path.join(PV, 'cl_step.webp'))
