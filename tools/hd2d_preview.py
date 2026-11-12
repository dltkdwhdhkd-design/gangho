# 새 화면 시제품의 "새 그림 맛보기"에 쓸 그림을 만든다(0단계 임시, 4단계에서 정식 도구로 바꾼다).
# art-src/chatgpt의 HB1(살림집 여섯 채)을 한 채씩 잘라 소품 이름으로, HC1·HC2(주인공, 윤설 걷기)를 게임 시트 꼴로 줄여 넣는다.
# HG1(땅 무늬), HR1(지붕 무늬)은 도트 한 점이 텍스처 한 점이 되게 줄이고, HW0(시험 집 앞벽, 옆벽)은 바탕을 지워 줄인다.
# 집도 사람과 같은 도트 굵기로 줄인다(면적 평균, 투명도는 반에서 잘라 가장자리를 또렷하게). 게임은 도트를 또렷하게 그린다.
# 쓰는 법: python3 tools/hd2d_preview.py   → assets/hd2d/preview/*.webp
import os, sys
from PIL import Image, ImageFilter
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'art-src', 'chatgpt')
OUT = os.path.join(ROOT, 'assets', 'hd2d', 'preview')


def key_out(im):
    """분홍(#FF00FF)이나 파랑(#0000FF) 바탕을 지우고 가장자리에 남는 색 테를 깎는다. 바탕색은 왼쪽 위 구석으로 정한다"""
    a = np.asarray(im.convert('RGB')).astype(np.int16)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    if a[3, 3, 0] < 100:  # 파랑 바탕
        blue = b - np.maximum(r, g)  # 파랑일수록 크다
        alpha = np.clip(1 - (blue - 90) / 90, 0, 1)
        alpha[(b > 200) & (r < 60) & (g < 60)] = 0
    else:
        pink = np.minimum(r, b) - g  # 분홍일수록 크다. 빨간 등롱(파랑 적음)과 보라(빨강 적음)는 작다
        alpha = np.clip(1 - (pink - 60) / 90, 0, 1)
        alpha[(r > 200) & (b > 200) & (g < 90)] = 0
    m = Image.fromarray((alpha * 255).astype(np.uint8)).filter(ImageFilter.MinFilter(3))  # 한 점 깎기
    out = im.convert('RGBA'); out.putalpha(m)
    return out


def cells(im, cols, rows):
    w, h = im.size
    for j in range(rows):
        for i in range(cols):
            yield i, j, im.crop((i * w // cols, j * h // rows, (i + 1) * w // cols, (j + 1) * h // rows))


def shrink(im, scale):
    """면적 평균으로 줄이고(색은 투명도를 곱한 채로), 투명도는 반에서 잘라 가장자리를 또렷하게"""
    a = np.asarray(im).astype(np.float32) / 255
    pm = a.copy(); pm[..., :3] *= pm[..., 3:4]
    w, h = im.size; W, H = max(1, round(w * scale)), max(1, round(h * scale))
    chans = [Image.fromarray(pm[..., k]).resize((W, H), Image.BOX) for k in range(4)]
    q = np.stack([np.asarray(c) for c in chans], -1)
    al = q[..., 3:4]; rgb = np.where(al > 1e-4, q[..., :3] / np.maximum(al, 1e-4), 0)
    out = np.concatenate([np.clip(rgb, 0, 1), (al > .5).astype(np.float32)], -1)
    return Image.fromarray((out * 255).astype(np.uint8), 'RGBA')


DOT = 48 / 15  # 인물 도트 밀도: 사람 키 15점(평면도)에 도트 48점. 배경도 이 굵기로 줄여 도트 결을 맞춘다
WIDE = {'hut_o': 64, 'hut_b': 64, 'hut_o2': 64, 'straw': 47, 'mud': 42, 'clay': 48}  # 소품 바닥 폭(js/tiles.js STAMPS)


def houses():
    im = key_out(Image.open(os.path.join(SRC, 'HB1.png')))
    for (i, j, c), n in zip(cells(im, 3, 2), WIDE):
        c = c.crop(c.getbbox()); c = shrink(c, WIDE[n] * DOT / c.width)
        c.save(os.path.join(OUT, n + '.webp'), lossless=True)
        print(n, c.size)


def walker(code, out):
    """걷기 그림(a, b) → 게임 시트 꼴: 열은 방향(아래, 위, 왼쪽, 오른쪽), 행은 차렷, 왼발, 차렷, 오른발. 칸 FR×FR, 발끝을 칸 아래에 맞춘다"""
    FR, TALL = 56, 48  # 사람 키 48점(원본 380점쯤을 8분의 1로)
    A = key_out(Image.open(os.path.join(SRC, code + 'a.png'))); B = key_out(Image.open(os.path.join(SRC, code + 'b.png')))
    a = {(i, j): c for i, j, c in cells(A, 2, 3)}; b = {(i, j): c for i, j, c in cells(B, 2, 3)}
    tall = max(c.getbbox()[3] - c.getbbox()[1] for c in list(a.values()) + list(b.values()))
    sc = TALL / tall
    def fit(c, flip=False):
        bb = c.getbbox(); c = c.crop(bb); s = shrink(c, sc)
        if flip: s = s.transpose(Image.FLIP_LEFT_RIGHT)
        f = Image.new('RGBA', (FR, FR)); f.paste(s, ((FR - s.width) // 2, FR - s.height - 1), s); return f
    cols = [
        [a[0, 0], a[0, 1], a[0, 0], a[0, 2]],  # 정면
        [a[1, 0], a[1, 1], a[1, 0], a[1, 2]],  # 뒷모습
        [b[0, 0], b[0, 1], b[1, 1], b[0, 2]],  # 왼쪽(원본이 왼쪽을 본다)
    ]
    sheet = Image.new('RGBA', (FR * 4, FR * 4))
    for d, col in enumerate(cols + [cols[2]]):
        for r, c in enumerate(col): sheet.paste(fit(c, d == 3), (d * FR, r * FR))
    sheet.save(os.path.join(OUT, out + '.webp'), lossless=True)
    print(out, sheet.size, 'scale', round(sc, 4))


def tiles(code, names, dot):
    """이어 까는 무늬 여섯 칸(3열 2행, 칸 사이 파랑 선) → 칸마다 도트 한 점이 텍스처 한 점이 되게 줄인다. dot: 원본에서 도트 한 점의 크기"""
    im = Image.open(os.path.join(SRC, code + '.png')).convert('RGB'); w, h = im.size
    for k, n in enumerate(names):
        i, j = k % 3, k // 3; c = im.crop((i * w // 3 + 4, j * h // 2 + 4, (i + 1) * w // 3 - 4, (j + 1) * h // 2 - 4))
        c = c.resize((round(c.width / dot), round(c.height / dot)), Image.BOX)
        c.save(os.path.join(OUT, n + '.webp'), lossless=True); print(n, c.size)


def walls():
    """HW0: 왼쪽 앞벽, 오른쪽 옆벽(위에 세모 박공). 바탕을 지우고 도트 굵기(원본 5점이 한 점)로 줄인다. 옆벽은 네모 부분이 시작하는 높이를 이름 끝에 적는다"""
    im = key_out(Image.open(os.path.join(SRC, 'HW0.png'))); w = im.width
    al = np.asarray(im)[..., 3] > 127; cols = np.where(al.any(0))[0]
    gap = cols[np.argmax(np.diff(cols))] + 1  # 두 벽 사이 빈 틈
    for n, box in [('w_front', (0, 0, gap, im.height)), ('w_side', (gap, 0, w, im.height))]:
        c = im.crop(box); c = c.crop(c.getbbox()); c = shrink(c, 1 / 5)
        a = np.asarray(c)[..., 3] > 127; full = np.where(a.sum(1) > a.shape[1] * .97)[0]
        c.save(os.path.join(OUT, n + '.webp'), lossless=True); print(n, c.size, '네모 시작', round(full[0] / c.height, 3))


def strips():
    """HR2: 가로 띠 여섯 줄(처마 끝 주황, 검푸름, 초가, 판자, 용마루, 서까래와 두공). 줄마다 바탕을 지우고 도트 굵기(원본 5점이 한 점)로 줄인다"""
    im = key_out(Image.open(os.path.join(SRC, 'HR2.png'))); a = np.asarray(im)[..., 3] > 127; rows = a.any(1)
    runs, y = [], 0
    while y < len(rows):
        if rows[y]:
            y0 = y
            while y < len(rows) and rows[y]: y += 1
            if y - y0 > 8: runs.append((y0, y))
        y += 1
    for n, (y0, y1) in zip(['e_orange', 'e_dark', 'e_thatch', 'e_plank', 'e_ridge', 'e_bracket'], runs):
        c = shrink(im.crop((0, y0, im.width, y1)), 1 / 5); c.save(os.path.join(OUT, n + '.webp'), lossless=True); print(n, c.size)


def walls1():
    """HW1: 3열 2행. 1행 앞벽 셋, 2행 옆벽 셋(같은 열이 같은 집)"""
    im = key_out(Image.open(os.path.join(SRC, 'HW1.png')))
    for (i, j, c) in cells(im, 3, 2):
        c = c.crop(c.getbbox()); c = shrink(c, 1 / 5); n = ('w%d_front' if j == 0 else 'w%d_side') % (i + 1)
        a = np.asarray(c)[..., 3] > 127; full = np.where(a.sum(1) > a.shape[1] * .97)[0]
        c.save(os.path.join(OUT, n + '.webp'), lossless=True); print(n, c.size, '네모 시작', round(full[0] / c.height, 3))


def walls_k():
    """HK2: 담 여섯 토막(2열 3행): 기와 얹은 흙담, 돌담, 목책, 나무 울타리, 성가퀴 담, 막돌 담"""
    im = key_out(Image.open(os.path.join(SRC, 'HK2.png')))
    for (i, j, c), n in zip(sorted(cells(im, 2, 3), key=lambda t: (t[1], t[0])), ['k_tiled', 'k_stone', 'k_palisade', 'k_fence', 'k_battle', 'k_cobble']):
        c = c.crop(c.getbbox()); c = shrink(c, 1 / 5); c.save(os.path.join(OUT, n + '.webp'), lossless=True); print(n, c.size)


if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    houses(); walker('HC1', 'me'); walker('HC2', 'yun')
    tiles('HG1', ['g_grass', 'g_road', 'g_yard', 'g_cobble', 'g_sand', 'g_snow'], 11)
    tiles('HR1', ['r_orange', 'r_dark', 'r_thatch', 'r_plank', 'r_mud', 'r_snow'], 11)
    walls(); strips(); walls1(); walls_k()
