# 새 화면 시제품의 "새 그림 맛보기"에 쓸 그림을 만든다(0단계 임시, 4단계에서 정식 도구로 바꾼다).
# art-src/chatgpt의 HB1(살림집 여섯 채)을 한 채씩 잘라 소품 이름으로, HC1·HC2(주인공, 윤설 걷기)를 게임 시트 꼴로 줄여 넣는다.
# HG1(땅 무늬), HR1(지붕 무늬)은 도트 한 점이 텍스처 한 점이 되게 줄이고, HW0(시험 집 앞벽, 옆벽)은 바탕을 지워 줄인다.
# 집도 사람과 같은 도트 굵기로 줄인다(면적 평균, 투명도는 반에서 잘라 가장자리를 또렷하게). 게임은 도트를 또렷하게 그린다.
# 쓰는 법: python3 tools/hd2d_preview.py   → assets/hd2d/preview/*.webp
import json, os, sys
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


def walker(code, out, src=None, tall_=48):
    """걷기 그림(a, b) → 게임 시트 꼴: 열은 방향(아래, 위, 왼쪽, 오른쪽), 행은 차렷, 왼발, 차렷, 오른발. 칸 FR×FR, 발끝을 칸 아래에 맞춘다"""
    FR, TALL = 56, tall_  # 사람 키 48점(원본 380점쯤을 8분의 1로). 노인은 조금 작게
    S = src or SRC; ld = lambda f: (lambda im: im if im.mode == 'RGBA' and np.asarray(im)[..., 3].min() < 10 else key_out(im))(Image.open(os.path.join(S, f)).convert('RGBA') if Image.open(os.path.join(S, f)).mode == 'RGBA' else Image.open(os.path.join(S, f)))
    A = ld(code + 'a.png'); B = ld(code + 'b.png')  # 투명 바탕(Higgsfield)이면 그대로, 분홍·파랑 바탕이면 지운다
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


def walls2():
    """HW2(Higgsfield): HW1과 같은 배치. 1행 앞벽(법당, 문파 회관, 부잣집), 2행 옆벽. 원본이 2048점이라 HW1과 같은 도트 굵기가 되게 0.15배"""
    from scipy import ndimage
    p = os.path.join(ROOT, 'art-src', 'higgsfield', 'HW2.png')
    if not os.path.exists(p): return
    im = key_out(Image.open(p)); A = np.asarray(im)[..., 3] > 127
    lab, n = ndimage.label(A); objs = [o for o in ndimage.find_objects(lab) if (o[0].stop - o[0].start) * (o[1].stop - o[1].start) > 20000]
    objs.sort(key=lambda o: (o[0].start // 300, o[1].start))
    for k, o in enumerate(objs[:6]):
        c = im.crop((o[1].start, o[0].start, o[1].stop, o[0].stop)); c = shrink(c, .15); n = ('w%d_front' if k < 3 else 'w%d_side') % (k % 3 + 4)
        c.save(os.path.join(OUT, n + '.webp'), lossless=True); print(n, c.size)


def walls_k():
    """HK2: 담 여섯 토막(2열 3행): 기와 얹은 흙담, 돌담, 목책, 나무 울타리, 성가퀴 담, 막돌 담"""
    im = key_out(Image.open(os.path.join(SRC, 'HK2.png')))
    for (i, j, c), n in zip(sorted(cells(im, 2, 3), key=lambda t: (t[1], t[0])), ['k_tiled', 'k_stone', 'k_palisade', 'k_fence', 'k_battle', 'k_cobble']):
        c = c.crop(c.getbbox()); c = shrink(c, 1 / 5); c.save(os.path.join(OUT, n + '.webp'), lossless=True); print(n, c.size)


# HP2(거리 채움 열두 가지): 4×3 칸을 하나씩 잘라 바탕을 지우고 도트 굵기(DOT)로 줄여 소품 그림으로(assets/hd/stamp/p_*.webp).
# 이름과 바닥 폭(평면도 점). 막힘 상자는 js/tiles.js STAMPS에 적는다
HP2 = [('p_lanterns', 18), ('p_banner', 16), ('p_barrels', 24), ('p_sacks', 28), ('p_flowerbed', 30), ('p_steps', 26),
       ('p_rail', 30), ('p_weapons', 30), ('p_foodstall', 28), ('p_target', 18), ('p_trough', 30), ('p_lion', 18)]


def props_p():
    """칸 경계가 그림을 자르므로 칸으로 나누지 않고, 바탕을 지운 뒤 붙어 있는 덩어리마다 테두리를 잡는다(큰 것 열두 개, 줄 순서대로)"""
    from scipy import ndimage
    im = Image.open(os.path.join(SRC, 'HP2.png')); k = key_out(im); A = np.asarray(k.getchannel('A')) > 128
    lab, n = ndimage.label(ndimage.binary_dilation(A, iterations=6)); objs = ndimage.find_objects(lab)
    boxes = sorted([o for o in objs if (o[0].stop - o[0].start) * (o[1].stop - o[1].start) > 4000], key=lambda o: (o[0].start + o[0].stop) / 2)
    rows = [sorted(boxes[r * 4:(r + 1) * 4], key=lambda o: o[1].start) for r in range(3)]
    out = os.path.join(ROOT, 'assets', 'hd', 'stamp'); sizes = {}
    for o, (name, w) in zip([b for r in rows for b in r], HP2):
        c = k.crop((o[1].start, o[0].start, o[1].stop, o[0].stop)); Ac = np.asarray(c.getchannel('A')) > 128; ys = np.where(Ac.any(1))[0]; xs = np.where(Ac.any(0))[0]
        c = c.crop((xs[0], ys[0], xs[-1] + 1, ys[-1] + 1)); s = shrink(c, w * DOT / c.width); s.save(os.path.join(out, name + '.webp'), lossless=True); sizes[name] = (w, round(s.height / DOT))
    return sizes



if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    houses(); walker('HC1', 'me'); walker('HC2', 'yun')
    HF = os.path.join(ROOT, 'art-src', 'higgsfield')  # Higgsfield로 받은 마을 사람
    Q = [(c, o, t) for c, o, _, t, _ in json.load(open(os.path.join(ROOT, 'tools', 'hf_queue.json')))]  # 줄에 선 사람들(키는 줄에 적힌 대로)
    for code, out, tl in [('HN1', 'n_villager', 48), ('HN2', 'n_woman', 45), ('HN3', 'n_oldman', 44), ('HN4', 'n_oldwoman', 41)] + Q:
        for D in (HF, os.path.join(ROOT, 'art-src', 'chatgpt'), os.path.join(ROOT, 'art-src', 'gemini')):  # Higgsfield, ChatGPT, Gemini 어디서 받았든
            if os.path.exists(os.path.join(D, code + 'a.png')) and os.path.exists(os.path.join(D, code + 'b.png')): walker(code, out, D, tl); break
    tiles('HG1', ['g_grass', 'g_road', 'g_yard', 'g_cobble', 'g_sand', 'g_snow'], 11)
    tiles('HR1', ['r_orange', 'r_dark', 'r_thatch', 'r_plank', 'r_mud', 'r_snow'], 11)
    walls(); strips(); walls1(); walls_k(); walls2()
    if 'hp2' in sys.argv: [print(n, w, h) for n, (w, h) in props_p().items()]
