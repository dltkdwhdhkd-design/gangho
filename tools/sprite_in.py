#!/usr/bin/env python3
# ChatGPT가 그린 시트를 잘라 게임 규격으로 넣는다. 받은 그림은 assets/hd/<종류>/<이름>.webp 가 된다
#
#   python3 tools/sprite_in.py walk   <걷기 시트> <battle 시트|-> <이름>     인물 (3열×3행 + 3열×3행 → 4열×7행)
#   python3 tools/sprite_in.py grid   <시트> <열> <행> <칸폭> <칸높이> <종류/이름> [돌릴 각도]   몬스터, 이펙트, 동물처럼 칸이 나뉜 시트. 이펙트는 오른쪽을 향해야 한다
#   python3 tools/sprite_in.py stamp  <그림> <소품 이름> <폭> <높이>                건물, 나무, 가구 한 장
#   python3 tools/sprite_in.py stamps <시트> <열> <행> <이름,이름,...>                건물이나 가구를 한 장에 모아 받았을 때 (빈칸은 -)
#   python3 tools/sprite_in.py icons  <시트> <열> <행> <물건id,물건id,...>            아이콘 묶음
#   python3 tools/sprite_in.py one    <그림> <폭> <높이> <종류/이름>                무기, 아이콘 한 장
#   python3 tools/sprite_in.py arena  <그림> <테마>                                 전투 배경
#   python3 tools/sprite_in.py tex    <그림> <이름>                                 땅 텍스처 (512×512로 줄인다)
#   python3 tools/sprite_in.py check                                                list.json과 파일이 맞는지 본다
import json, os, sys
import numpy as np
from PIL import Image
from scipy import ndimage

OUT = 'assets/hd'
def cut_bg(im, tol=38):
    """투명 배경이면 그대로, 아니면 네 귀퉁이 색을 배경으로 보고 지운다"""
    im = im.convert('RGBA'); a = np.array(im)
    if (a[..., 3] < 10).mean() > .05: a[..., 3] = (a[..., 3] > 128) * 255; return a
    h, w = a.shape[:2]; c = np.median(np.array([a[2, 2, :3], a[2, w - 3, :3], a[h - 3, 2, :3], a[h - 3, w - 3, :3]]), axis=0)
    d = np.abs(a[..., :3].astype(int) - c).sum(axis=2) < tol * 3
    # 가장자리와 이어진 배경만 지운다. 옷 안쪽의 같은 색은 남긴다
    lab, n = ndimage.label(d); edge = set(lab[0]) | set(lab[-1]) | set(lab[:, 0]) | set(lab[:, -1]); edge.discard(0)
    a[..., 3] = np.where(np.isin(lab, list(edge)), 0, 255)
    # 외곽선에 묻은 배경색을 지운다. 배경이 마젠타면 초록이 낮고 빨강과 파랑이 높은 칸이다
    if c[0] > 180 and c[2] > 180 and c[1] < 90:
        r, g, b = [a[..., i].astype(int) for i in range(3)]; fringe = (g < (r + b) * .36) & (r > 96) & (b > 96) & (np.abs(r - b) < 90)
        near = ndimage.binary_dilation(a[..., 3] == 0, iterations=3); a[..., 3] = np.where(fringe & near, 0, a[..., 3])
    return a
def blobs(a, grow=None):
    """덩어리를 찾는다. 칼이나 머리끈이 떨어져 있어도 한 덩어리로 묶이게 살짝 부풀린다"""
    h = a.shape[0]; m = a[..., 3] > 0; m = ndimage.binary_dilation(m, iterations=grow or max(2, h // 120))
    lab, n = ndimage.label(m); box = ndimage.find_objects(lab)
    out = [(s[1].start, s[0].start, s[1].stop, s[0].stop) for s in box]; big = max((b[2] - b[0]) * (b[3] - b[1]) for b in out)
    return [b for b in out if (b[2] - b[0]) * (b[3] - b[1]) > big * .08]
def cells(a, cols, rows):
    """열×행으로 정렬한 칸 목록. 덩어리 수가 맞으면 덩어리대로, 아니면 똑같이 나눈다"""
    bs = blobs(a)
    if len(bs) == cols * rows:
        bs.sort(key=lambda b: (b[1] + b[3]) / 2); out = []
        for r in range(rows): out += sorted(bs[r * cols:(r + 1) * cols], key=lambda b: b[0])
        return out, True
    h, w = a.shape[:2]; print(f'  덩어리 {len(bs)}개, 기대 {cols * rows}개: 칸을 똑같이 나눕니다. 결과를 눈으로 확인하세요')
    return [(w * c // cols, h * r // rows, w * (c + 1) // cols, h * (r + 1) // rows) for r in range(rows) for c in range(cols)], False
def trim(a, b):
    p = a[b[1]:b[3], b[0]:b[2]].copy(); m = ndimage.binary_dilation(p[..., 3] > 0, iterations=max(2, a.shape[0] // 200)); lab, n = ndimage.label(m)
    if n > 1:  # 옆 칸에서 넘어온 조각을 버린다. 제일 큰 덩어리만 남긴다
        keep = 1 + int(np.argmax(ndimage.sum(m, lab, range(1, n + 1)))); p[lab != keep] = 0
    ys, xs = np.where(p[..., 3] > 0)
    return p if not len(ys) else p[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
def down(p, s):
    """칸 안으로 줄인다. 색을 도트답게 모으고 반투명을 없앤다"""
    w, h = max(1, round(p.shape[1] * s)), max(1, round(p.shape[0] * s)); im = Image.fromarray(p, 'RGBA')
    if s < 1: im = im.resize((w, h), Image.BOX)
    else: im = im.resize((w, h), Image.NEAREST)
    q = np.array(im); al = q[..., 3] > 110; rgb = Image.fromarray(q[..., :3]).quantize(128, method=Image.FASTOCTREE, dither=Image.NONE).convert('RGB')
    r = np.array(rgb); return np.dstack([r, al * 255]).astype('uint8')
def paste(sheet, p, x, y, cw, ch):
    """칸의 아래 가운데에 맞춘다. 발이 칸 바닥에 닿는다"""
    px = x + (cw - p.shape[1]) // 2; py = y + ch - p.shape[0]; sheet[py:py + p.shape[0], px:px + p.shape[1]] = np.where(p[..., 3:] > 0, p, sheet[py:py + p.shape[0], px:px + p.shape[1]])
def save(a, key):
    path = f'{OUT}/{key}.webp'; os.makedirs(os.path.dirname(path), exist_ok=True); Image.fromarray(a, 'RGBA').save(path, 'WEBP', lossless=True, method=6)
    lst = json.load(open(f'{OUT}/list.json', encoding='utf8')) if os.path.exists(f'{OUT}/list.json') else []
    if key not in lst: lst.append(key)
    json.dump(sorted(lst), open(f'{OUT}/list.json', 'w', encoding='utf8'), ensure_ascii=False); print(key, a.shape[1], 'x', a.shape[0], f'{os.path.getsize(path) // 1024}KB')
def load(p): return cut_bg(Image.open(p))
def scale_for(ps, w, h): return min(w / max(p.shape[1] for p in ps), h / max(p.shape[0] for p in ps))
def walk(src, fight, name):
    # 받는 시트: 열은 앞, 뒤, 옆(왼쪽을 본다) / 행은 서기, 왼발, 오른발
    a = load(src); bs, _ = cells(a, 3, 3); ps = [trim(a, b) for b in bs]; extra = []
    if fight != '-': b2 = load(fight); bs2, _ = cells(b2, 3, 3); extra = [trim(b2, b) for b in bs2]  # 휘두름, 도약, 막기
    # 칸 하나는 32×32. 머리 위 여유를 조금 둔다. 비율은 걷기 서 있는 그림 키에 맞춘다
    s = min(30 / max(p.shape[0] for p in ps), 30 / max(p.shape[1] for p in ps)); sheet = np.zeros((224, 128, 4), 'uint8')
    order = [(0, 0), (0, 1), (0, 0), (0, 2)]
    for r, (_, fr) in enumerate(order):
        for dcol, src_col, flip in [(0, 0, 0), (1, 1, 0), (2, 2, 0), (3, 2, 1)]:
            p = ps[fr * 3 + src_col]; p = p[:, ::-1] if flip else p; paste(sheet, down(p, s), dcol * 32, r * 32, 32, 32)
    if extra:
        s2 = min(s, 31 / max(p.shape[0] for p in extra), 31 / max(p.shape[1] for p in extra))
        for r in range(3):
            for dcol, src_col, flip in [(0, 0, 0), (1, 1, 0), (2, 2, 0), (3, 2, 1)]:
                p = extra[r * 3 + src_col]; p = p[:, ::-1] if flip else p; paste(sheet, down(p, s2), dcol * 32, (4 + r) * 32, 32, 32)
    else: sheet[128:224] = np.vstack([sheet[:32], sheet[:32], sheet[:32]])
    save(sheet, f'chars/{name}')
def fx_sheet(a, cols, rows, cw, ch, key, rot=0):
    # 이펙트는 칸을 똑같이 나눠 위치와 크기 변화를 그대로 살린다. 사라지는 프레임의 작은 조각도 남긴다
    h, w = a.shape[:2]; sw, sh = w // cols, h // rows; sheet = np.zeros((ch * rows, cw * cols, 4), 'uint8'); s = 1
    def cell(r, c):
        p = a[r * sh:(r + 1) * sh, c * sw:(c + 1) * sw]
        return np.array(Image.fromarray(p, 'RGBA').rotate(rot, Image.NEAREST, expand=True)) if rot else p
    for r in range(rows):
        for c in range(cols):
            p = cell(r, c); yy, xx = np.where(p[..., 3] > 0)
            if len(yy): s = min(s, cw / (xx.max() - xx.min() + 1), ch / (yy.max() - yy.min() + 1))
    for r in range(rows):
        for c in range(cols):
            q = down(cell(r, c), s); y0, x0 = max(0, (ch - q.shape[0]) // 2), max(0, (cw - q.shape[1]) // 2); yc, xc = max(0, (q.shape[0] - ch) // 2), max(0, (q.shape[1] - cw) // 2); part = q[yc:yc + ch, xc:xc + cw]; sheet[r * ch + y0:r * ch + y0 + part.shape[0], c * cw + x0:c * cw + x0 + part.shape[1]] = part
    save(sheet, key)
def grid(src, cols, rows, cw, ch, key, rot=0):
    a = load(src)
    if key.startswith('fx/'): return fx_sheet(a, cols, rows, cw, ch, key, rot)
    bs, _ = cells(a, cols, rows); ps = [trim(a, b) for b in bs]; s = scale_for(ps, cw, ch); sheet = np.zeros((ch * rows, cw * cols, 4), 'uint8')
    for i, p in enumerate(ps): paste(sheet, down(p, s), (i % cols) * cw, (i // cols) * ch, cw, ch)
    save(sheet, key)
def one(src, w, h, key):
    a = load(src); ys, xs = np.where(a[..., 3] > 0); p = a[ys.min():ys.max() + 1, xs.min():xs.max() + 1]; s = scale_for([p], w, h); sheet = np.zeros((h, w, 4), 'uint8'); paste(sheet, down(p, s), 0, 0, w, h); save(sheet, key)
def stamps(src, cols, rows, names):
    # 건물이나 가구를 한 장에 모아 받았을 때. names는 쉼표로 나눈 소품 이름, 크기는 js/tiles.js의 STAMPS를 읽는다
    import re
    t = open('js/tiles.js', encoding='utf8').read(); a = load(src); bs, _ = cells(a, cols, rows)
    for n, b in zip(names.split(','), bs):
        if n == '-': continue
        m = re.search(r'\b' + n + r": \[\w+, \d+, \d+, (\d+), (\d+)", t); w, h = int(m[1]) * 2, int(m[2]) * 2; p = trim(a, b); sheet = np.zeros((h, w, 4), 'uint8'); paste(sheet, down(p, scale_for([p], w, h)), 0, 0, w, h); save(sheet, f'stamp/{n}')
def icons(src, cols, rows, ids):
    a = load(src); bs, _ = cells(a, cols, rows)
    for n, b in zip(ids.split(','), bs):
        p = trim(a, b); sheet = np.zeros((32, 32, 4), 'uint8'); paste(sheet, down(p, scale_for([p], 30, 30)), 0, 0, 32, 32); save(sheet, f'icon/{n}')
def arena(src, theme): im = Image.open(src).convert('RGB').resize((768, 480), Image.LANCZOS); a = np.dstack([np.array(im), np.full((480, 768), 255, 'uint8')]); save(a, f'arena/{theme}')
def tex(src, name): im = Image.open(src).convert('RGB').resize((512, 512), Image.LANCZOS); a = np.dstack([np.array(im), np.full((512, 512), 255, 'uint8')]); save(a, f'ground/{name}')
def check():
    lst = json.load(open(f'{OUT}/list.json', encoding='utf8')); miss = [k for k in lst if not os.path.exists(f'{OUT}/{k}.webp')]; print(len(lst), '장 등록, 없는 파일', miss or '없음')
if __name__ == '__main__':
    k, *x = sys.argv[1:]
    if k == 'walk': walk(x[0], x[1], x[2])
    elif k == 'grid': grid(x[0], int(x[1]), int(x[2]), int(x[3]), int(x[4]), x[5], int(x[6]) if len(x) > 6 else 0)
    elif k == 'stamp': one(x[0], int(x[2]) * 2, int(x[3]) * 2, f'stamp/{x[1]}')
    elif k == 'stamps': stamps(x[0], int(x[1]), int(x[2]), x[3])
    elif k == 'icons': icons(x[0], int(x[1]), int(x[2]), x[3])
    elif k == 'one': one(x[0], int(x[1]), int(x[2]), x[3])
    elif k == 'arena': arena(x[0], x[1])
    elif k == 'tex': tex(x[0], x[1])
    elif k == 'check': check()
