# 받아 둔 물 그림(art-src/chatgpt/HG2.png: 강물, 연못, 얕은 여울)과 나루 그림(HP5.png의 선착장 판자)을 새 화면의 땅 무늬로 만든다.
#   assets/hd2d/preview/wt_river.webp : 강물(잔물결). 지도 가장자리까지 이어진 넓은 물
#   assets/hd2d/preview/wt_pond.webp  : 연못(연잎). 뭍에 갇힌 작은 물
#   assets/hd2d/preview/wt_rapid.webp : 여울(돌이 비치는 얕은 물). 너비 네 칸 아래의 물줄기
#   assets/hd2d/preview/g_plank.webp : 나루와 다리의 널(바깥 지도의 마루 칸). 널이 세로로 선 무늬이고, 세로로 긴 나루에서는 게임이 눕혀 깐다
# 물 그림은 도트 한 점이 7.7px쯤이라 한 칸(700px)을 92점으로 줄이고, 가장자리 6점을 섞어 가로세로로 이어 붙게 한다(86×86점 = 평면도 26.9점).
# 널은 그림 속 선착장이 비스듬히 그려져 있어, 기울기를 펴고 못 박힌 줄 사이의 가운데 토막만 쓴다. 널 하나의 폭을 평면도 5점(사람 키의 3분의 1)으로 잡았다.
# 쓰는 법: python3 tools/ground_in.py
import os
import numpy as np
from PIL import Image
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'art-src', 'chatgpt'); PV = os.path.join(ROOT, 'assets', 'hd2d', 'preview')
DOT = 48 / 15

def wrap_h(a, f):
    t = np.linspace(0, 1, f)[None, :, None]; out = a[:, :-f].copy(); out[:, :f] = a[:, -f:] * (1 - t) + a[:, :f] * t; return out
def wrap_v(a, f):
    t = np.linspace(0, 1, f)[:, None, None]; out = a[:-f].copy(); out[:f] = a[-f:] * (1 - t) + a[:f] * t; return out
def save(arr, name):
    a8 = np.clip(arr, 0, 255).astype(np.uint8); p = os.path.join(PV, name + '.webp'); Image.fromarray(a8).save(p, lossless=True)
    print(os.path.relpath(p, ROOT), a8.shape[1], 'x', a8.shape[0], '→ 평면도', round(a8.shape[1] / DOT, 1), 'x', round(a8.shape[0] / DOT, 1))

# 1) 물 셋: 파란 테두리 안쪽 세 칸
hg = Image.open(os.path.join(SRC, 'HG2.png')).convert('RGB')
for name, (x0, x1) in (('wt_river', (18, 717)), ('wt_pond', (738, 1433)), ('wt_rapid', (1454, 2153))):
    c = hg.crop((x0 + 2, 19, x1 - 1, 705)).resize((92, 92), Image.BOX)
    save(wrap_v(wrap_h(np.asarray(c).astype(np.float32), 6), 6), name)

# 2) 널: 선착장 윗면. 기울기(세로 1px에 가로 -0.3px)를 펴고, 못 박힌 두 줄 사이(세로 200~282)의 널 여덟 장(가로 120~420)을 쓴다
hp = Image.open(os.path.join(SRC, 'HP5.png')).convert('RGB'); y0, y1, sh = 200, 282, .30
st = hp.transform(hp.size, Image.AFFINE, (1, -sh, sh * y0, 0, 1, 0), resample=Image.BICUBIC).crop((120, y0, 420, y1))
k = 5 * DOT / 37.5                                    # 널 하나(37.5px)를 평면도 5점으로
pl = np.asarray(st.resize((round(st.width * k), round(st.height * k)), Image.BOX)).astype(np.float32)
save(wrap_v(wrap_h(pl, 8), 5), 'g_plank')
