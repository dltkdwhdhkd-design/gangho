#!/usr/bin/env python3
# 쿼터뷰 소품 넣기. 그림은 assets/hd/iso/<이름>.webp(HD 2배), 정보는 js/isometa.js에 적는다
#   python3 tools/iso_in.py place <이름> <fw> <fh> [양식]          그림이 오기 전 임시 그림(상자 집)을 그린다
#   python3 tools/iso_in.py placeall                                요청서의 건물 전부 임시 그림
#   python3 tools/iso_in.py iso <그림> <이름> <fw> <fh>            ChatGPT 그림 한 장 (마젠타 배경)
#   python3 tools/iso_in.py worldmap <그림>                         강호 전도
#   python3 tools/iso_in.py isowalk <걷기 시트> <전투 시트|-> <이름>  인물 2열 3행 두 장 → chars/<이름>_q
#   python3 tools/iso_in.py mapicons <그림> sect,evil,out,city,old,mine   지도 표식 3열 2행
#   python3 tools/iso_in.py isosheet <그림> <열> <행> 이름,이름,...      소품 여러 개 한 장
#   python3 tools/iso_in.py isogrid <그림> <열> <행> ani/chicken           동물, 몬스터 2열 2행 → <키>_q
#   python3 tools/iso_in.py tex <그림> <이름>                          땅 텍스처(이음매를 지운다)
#   python3 tools/iso_in.py arena <그림> <테마>                        전투 배경
#   python3 tools/iso_in.py qb <번호> <그림> [그림2]                     요청서 번호(QB12, QC4)로 알아서 넣는다
#   python3 tools/iso_in.py batch <폴더>                               파일 이름에 번호가 든 그림을 몽땅 넣는다(QB62.png, QC4_fight.png)
import json, math, os, re, sys
from PIL import Image, ImageDraw
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); OUT = os.path.join(ROOT, 'assets/hd/iso'); META = os.path.join(ROOT, 'js/isometa.js')
IS, IH = 32, 16  # HD 점 기준 한 칸 걸음
def load_meta():
    s = open(META, encoding='utf8').read(); m = re.search(r'ISOMETA = (\{.*\});', s, re.S); return json.loads(m.group(1)) if m else {}
def save_meta(d):
    body = ',\n'.join(f'  {json.dumps(k)}: {json.dumps(v)}' for k, v in sorted(d.items()))
    open(META, 'w', encoding='utf8').write('// tools/iso_in.py가 쓰는 쿼터뷰 소품 정보. 손으로 고치지 않는다\nexport const ISOMETA = {\n' + body + '\n};\n')
def register(name, im, ax, ay, fw, fh, **extra):  # extra: ls, rs(바닥선 기울기), door(문 자리, 앞 모서리에서 잰 비율)
    os.makedirs(OUT, exist_ok=True); im.save(os.path.join(OUT, name + '.webp'), lossless=True)
    d = load_meta(); d[name] = {'w': int(im.width) // 2, 'h': int(im.height) // 2, 'ax': int(ax) // 2, 'ay': int(ay) // 2, 'fw': float(fw) if fw % 1 else int(fw), 'fh': float(fh) if fh % 1 else int(fh)}
    d[name].update({k: round(float(v), 3) for k, v in extra.items() if v is not None}); save_meta(d)
    L = json.load(open(os.path.join(ROOT, 'assets/hd/list.json'))); k = 'iso/' + name
    if k not in L: L.append(k); json.dump(L, open(os.path.join(ROOT, 'assets/hd/list.json'), 'w'), ensure_ascii=False)

# ── 임시 그림: 벽 두 면과 우진각 지붕을 얹은 상자 집 ──
PAL = {  # 왼벽, 오른벽, 기단, 지붕 앞왼, 지붕 앞오른, 지붕 줄, 문
  'tile': ((214, 200, 170), (168, 150, 122), (120, 112, 104), (128, 134, 146), (92, 96, 110), (70, 74, 86), (96, 52, 30)),
  'thatch': ((196, 168, 120), (150, 124, 86), (112, 100, 86), (214, 184, 104), (170, 140, 72), (140, 110, 56), (90, 60, 34)),
  'red': ((190, 60, 44), (140, 40, 30), (150, 140, 124), (124, 128, 140), (88, 92, 106), (66, 70, 82), (110, 30, 20)),
  'gold': ((222, 188, 96), (180, 146, 64), (150, 140, 124), (196, 120, 44), (150, 84, 30), (120, 64, 22), (130, 34, 22)),
  'dark': ((70, 56, 70), (48, 38, 50), (40, 36, 44), (58, 52, 64), (38, 34, 44), (26, 24, 30), (120, 30, 40)),
  'ice': ((226, 236, 244), (178, 196, 214), (160, 176, 196), (176, 214, 236), (130, 170, 200), (100, 140, 176), (70, 100, 140)),
  'adobe': ((214, 172, 120), (176, 132, 86), (150, 112, 74), (200, 158, 106), (168, 126, 82), (140, 100, 64), (100, 64, 36)),
  'wood': ((160, 112, 70), (120, 82, 50), (96, 84, 72), (120, 90, 60), (90, 66, 44), (70, 50, 34), (60, 36, 20)),
}
OL = (34, 20, 14, 255)
def place(name, fw, fh, style='tile', hw=None, roof=True, open_=False):
    hw = hw or (22 if max(fw, fh) < 5 else 30); hr = 10 + 3 * min(fw, fh); e = 4
    W = (fw + fh) * IS + 4 * e + 8; H = (fw + fh) * IH + hw * 2 + hr * 2 + 2 * e + 12
    im = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    F = (fw * IS + 2 * e + 4, H - 4); add = lambda p, q, k=1: (p[0] + q[0] * k, p[1] + q[1] * k)
    L = add(F, (-IS, -IH), fw); R = add(F, (IS, -IH), fh); K = add(L, (IS, -IH), fh); up = (0, -hw * 2)
    lw, rw, base, rl, rr, rline, door = PAL.get(style, PAL['tile'])
    if not open_:
        d.polygon([L, F, add(F, up), add(L, up)], fill=lw); d.polygon([F, R, add(R, up), add(F, up)], fill=rw)
        for t in range(0, 6): d.line([add(L, (0, -t)), add(F, (0, -t))], fill=base); d.line([add(F, (0, -t)), add(R, (0, -t))], fill=tuple(int(v * .8) for v in base))
        for y in range(10, hw * 2 - 4, 6): d.line([add(L, (0, -y)), add(F, (0, -y))], fill=tuple(int(v * .9) for v in lw)); d.line([add(F, (0, -y)), add(R, (0, -y))], fill=tuple(int(v * .9) for v in rw))
        # 문: 왼쪽 앞면 가운데
        m = fw / 2; dw = .45; a = add(F, (-IS, -IH), m - dw); b = add(F, (-IS, -IH), m + dw); dh = int(hw * 2 * .62)
        d.polygon([a, b, add(b, (0, -dh)), add(a, (0, -dh))], fill=door); d.line([add(a, (0, -dh)), add(b, (0, -dh))], fill=OL[:3], width=2)
        for t in (.3, .7):  # 오른쪽 면 창
            if fh < 2: break
            c = add(F, (IS, -IH), fh * t); d.polygon([add(c, (-7, -14 + 4)), add(c, (7, -14 - 3)), add(c, (7, -30 - 3)), add(c, (-7, -30 + 4))], fill=(60, 44, 34))
    else:
        for p in (F, L, R): d.rectangle([p[0] - 3, p[1] - hw * 2, p[0] + 3, p[1]], fill=(150, 40, 30), outline=OL)
    if roof:
        top = lambda p: add(p, up); Fe, Le, Re, Ke = add(top(F), (0, e)), add(top(L), (-2 * e, 0)), add(top(R), (2 * e, 0)), add(top(K), (0, -e))
        long_l = fw >= fh; s = min(fw, fh) / 2
        if long_l:
            M1 = ((Fe[0] + Re[0]) / 2, (Fe[1] + Re[1]) / 2); M2 = ((Le[0] + Ke[0]) / 2, (Le[1] + Ke[1]) / 2)
            u = ((M2[0] - M1[0]) / fw, (M2[1] - M1[1]) / fw); P1 = add(add(M1, u, min(s, fw / 2)), (0, -hr * 2)); P2 = add(add(M2, u, -min(s, fw / 2)), (0, -hr * 2))
            faces = [([Re, Ke, P2, P1], rr), ([Ke, Le, P2], rl), ([Le, Fe, P1, P2], rl), ([Fe, Re, P1], rr)]
        else:
            M1 = ((Fe[0] + Le[0]) / 2, (Fe[1] + Le[1]) / 2); M2 = ((Re[0] + Ke[0]) / 2, (Re[1] + Ke[1]) / 2)
            u = ((M2[0] - M1[0]) / fh, (M2[1] - M1[1]) / fh); P1 = add(add(M1, u, min(s, fh / 2)), (0, -hr * 2)); P2 = add(add(M2, u, -min(s, fh / 2)), (0, -hr * 2))
            faces = [([Ke, Le, P1, P2], rl), ([Re, Ke, P2], rr), ([Fe, Re, P2, P1], rr), ([Le, Fe, P1], rl)]
        for poly, col in faces:
            d.polygon(poly, fill=col)
        for poly, col in faces[2:]:  # 기와 줄
            xs = [p[0] for p in poly];
            for x in range(int(min(xs)) + 3, int(max(xs)), 5):
                pass
            d.line(poly + [poly[0]], fill=OL[:3], width=1)
        rl_ = faces[2][0]
        for k in range(1, 8):  # 앞왼 지붕면에 비스듬한 기와 줄
            t = k / 8; a = (rl_[0][0] + (rl_[1][0] - rl_[0][0]) * t, rl_[0][1] + (rl_[1][1] - rl_[0][1]) * t); b = (rl_[3][0] + (rl_[2][0] - rl_[3][0]) * t, rl_[3][1] + (rl_[2][1] - rl_[3][1]) * t)
            d.line([a, b], fill=rline)
    # 외곽선
    A = im.split()[3].load(); P = im.load()
    for x in range(W):
        for y in range(H):
            if A[x, y] == 0 and any(0 <= x + a < W and 0 <= y + b < H and A[x + a, y + b] > 0 for a, b in ((1, 0), (-1, 0), (0, 1), (0, -1))): P[x, y] = OL
    bb = im.getbbox(); im = im.crop((bb[0] - 1, bb[1] - 1, bb[2] + 1, bb[3] + 1))
    if im.width % 2: im = im.crop((0, 0, im.width + 1, im.height))
    if im.height % 2: im = im.crop((0, -1, im.width, im.height))
    ax, ay = F[0] - (bb[0] - 1), F[1] - (bb[1] - 1) + (1 if (bb[3] - bb[1] + 2) % 2 else 0)
    register(name, im, ax, ay, fw, fh)

def cutbg(im):  # 마젠타 배경을 지우고 외곽선에 묻은 분홍을 걷어낸다
    im = im.convert('RGBA'); px = im.load()
    for y in range(im.height):
        for x in range(im.width):
            r, g, b, a = px[x, y]
            if r > 170 and b > 170 and g < 110: px[x, y] = (0, 0, 0, 0)
            elif r > 150 and b > 130 and g < r - 70 and g < b - 50: px[x, y] = (r // 2, g, b // 2, a)
    return im
def reg_key(k):
    L = json.load(open(os.path.join(ROOT, 'assets/hd/list.json')))
    if k not in L: L.append(k); json.dump(L, open(os.path.join(ROOT, 'assets/hd/list.json'), 'w'), ensure_ascii=False)
def worldmap(path):  # 강호 전도: 804×658의 두 배로 맞춘다
    im = Image.open(path).convert('RGB'); W, H = 1608, 1316; r = W / H
    if im.width / im.height > r: nw = round(im.height * r); im = im.crop(((im.width - nw) // 2, 0, (im.width - nw) // 2 + nw, im.height))
    else: nh = round(im.width / r); im = im.crop((0, (im.height - nh) // 2, im.width, (im.height - nh) // 2 + nh))
    im.resize((W, H), Image.LANCZOS).save(os.path.join(ROOT, 'assets/hd/world/map.webp'), quality=90); reg_key('world/map')
def mapicons(path, names, cols=3, rows=2, h=60):  # 지도 표식: 칸마다 잘라 배경을 지우고 높이 h(HD)로
    im = cutbg(Image.open(path)); cw, ch = im.width / cols, im.height / rows; os.makedirs(os.path.join(ROOT, 'assets/hd/map'), exist_ok=True)
    for i, n in enumerate(names):
        c = im.crop((int(i % cols * cw), int(i // cols * ch), int((i % cols + 1) * cw), int((i // cols + 1) * ch))); bb = c.getbbox()
        if not bb: continue
        c = c.crop(bb); c = c.resize((max(1, round(c.width * h / c.height)), h), Image.LANCZOS); c.save(os.path.join(ROOT, f'assets/hd/map/{n}.webp'), lossless=True); reg_key('map/' + n)
def figures(im, n):  # 그림 속 인물(덩어리) n개를 찾아 줄 순서(위에서 아래, 왼쪽에서 오른쪽)로 돌려준다
    import numpy as np
    from scipy import ndimage
    a = np.array(im)[..., 3] > 0; lab, k = ndimage.label(ndimage.binary_dilation(a, iterations=6))
    objs = sorted(ndimage.find_objects(lab), key=lambda sl: -(sl[0].stop - sl[0].start) * (sl[1].stop - sl[1].start))[:n]
    boxes = [(sl[1].start, sl[0].start, sl[1].stop, sl[0].stop) for sl in objs]
    rows = sorted(boxes, key=lambda b: (b[1] + b[3]) / 2); out = []; per = max(1, n // 3) if n in (6, 4) else n
    if n == 6: per = 2
    if n == 4: per = 2
    for i in range(0, len(rows), per): out += sorted(rows[i:i + per], key=lambda b: b[0])
    return [im.crop(b) for b in out]
def base_corners(img):  # 밑선 아래쪽 껍질을 앞 모서리에서 좌우로 감아 나가 바닥 모서리를 찾는다. 처마나 벽 끝처럼 가파르게 꺾이면 멈춘다
    import numpy as np
    a = np.array(img)[..., 3] > 0; h, w = a.shape; bot = np.array([np.nonzero(a[:, x])[0].max() if a[:, x].any() else -1 for x in range(w)])
    fy = int(bot.max()); xs = np.nonzero(bot == fy)[0]; fx = int(xs[np.argmin(np.abs(xs - xs.mean()))])
    def walk(sign):
        cx, cy = fx, fy
        while True:
            X = np.arange(cx + sign, -1 if sign < 0 else w, sign); X = X[bot[X] >= 0] if len(X) else X
            if len(X) < 2: return cx, cy
            sl = (cy - bot[X]) / np.abs(X - cx); m = sl.min()
            if m > 1.0: return cx, cy
            j = np.nonzero(sl <= m + 1e-9)[0].max(); cx, cy = int(X[j]), int(bot[X[j]])  # 같은 기울기면 가장 먼 점
    (lx, ly), (rx, ry) = walk(-1), walk(1)
    return fx, fy, lx, ly, rx, ry
def isoin(path, name, fw, fh, door=None):  # 건물, 소품 한 장: 배경을 지우고 바닥 모서리 셋을 찾아 크기와 기울기를 맞춘다
    import numpy as np
    im = cutbg(Image.open(path)); im = im.crop(im.getbbox()); Wf = (fw + fh) * IS
    s = Wf * 1.1 / im.width
    for _ in range(3):
        t = im.resize((max(1, round(im.width * s)), max(1, round(im.height * s))), Image.LANCZOS); fx, fy, lx, ly, rx, ry = base_corners(t)
        if rx - lx < 8: break
        s *= Wf / (rx - lx)
    t = im.resize((max(2, round(im.width * s)) // 2 * 2, max(2, round(im.height * s)) // 2 * 2), Image.LANCZOS)
    A = np.array(t); A[..., 3] = np.where(A[..., 3] > 110, 255, 0); t = Image.fromarray(A)
    fx, fy, lx, ly, rx, ry = base_corners(t); mw, mh = max(1, fx - lx) / IS, max(1, rx - fx) / IS
    clampv = lambda v: min(.8, max(.12, v)); ls, rs = clampv((fy - ly) / max(1, fx - lx)), clampv((fy - ry) / max(1, rx - fx))
    k = (fw + fh) / max(.5, mw + mh); FW, FH = round(mw * k * 4) / 4, round(mh * k * 4) / 4
    register(name, t, fx, fy + 1, FW, FH, ls=None if abs(ls - .5) < .04 else ls, rs=None if abs(rs - .5) < .04 else rs, door=door)
    print(name, '크기', t.size, '바닥', FW, FH, '기울기', round(ls, 2), round(rs, 2))
def isowalk(walk, fight, name, H=44, C=64):  # 걷기 2열 3행(+전투 2열 3행) → chars/<이름>_q.webp (2열 6행, 칸 C)
    import numpy as np
    cells = figures(cutbg(Image.open(walk)), 6); fc = figures(cutbg(Image.open(fight)), 6) if fight and fight != '-' else cells
    allc = cells + fc; base = cells[0]; bb = base.getbbox(); s = H / (bb[3] - bb[1])
    out = Image.new('RGBA', (C * 2, C * 6), (0, 0, 0, 0))
    for i, c in enumerate(allc):
        c = c.crop(c.getbbox()); c = c.resize((max(1, round(c.width * s)), max(1, round(c.height * s))), Image.NEAREST if s > 1 else Image.LANCZOS)
        a = np.array(c)[..., 3] > 0; feet = np.nonzero(a[-4:].any(axis=0))[0]; fx = int(feet.mean()) if len(feet) else c.width // 2
        col, row = i % 2, i // 2; x = col * C + C // 2 - fx; y = row * C + C - 2 - c.height
        if c.width > C or c.height > C - 2: c.thumbnail((C, C - 2)); x = col * C + (C - c.width) // 2; y = row * C + C - 2 - c.height
        out.alpha_composite(c, (max(col * C, x), max(row * C, y)))
    os.makedirs(os.path.join(ROOT, 'assets/hd/chars'), exist_ok=True); out.save(os.path.join(ROOT, f'assets/hd/chars/{name}_q.webp'), lossless=True); reg_key(f'chars/{name}_q')
def wallseg(name, h, kind):  # 이어 붙이는 담 한 칸 임시 그림: 왼쪽 앞면 방향으로 한 칸, 두께 0.3칸
    fw, fh = 1, .3; W, H = 64, h * 2 + 40; im = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    add = lambda p, q, k=1: (p[0] + q[0] * k, p[1] + q[1] * k); F = (40, H - 4); L = add(F, (-IS, -IH), fw); R = add(F, (IS, -IH), fh); K = add(L, (IS, -IH), fh); up = (0, -h * 2)
    col = {'wall_tile': ((236, 228, 210), (190, 182, 166)), 'wall_stone': ((150, 144, 134), (112, 108, 100)), 'city_wall': ((140, 136, 130), (104, 100, 96)), 'palisade': ((150, 104, 62), (110, 74, 44)), 'fence': ((168, 120, 72), (124, 86, 50))}[kind]
    if kind == 'fence':
        for t in (.12, .5, .88): a = add(F, (-IS, -IH), fw * t); d.line([a, add(a, up)], fill=col[1], width=3)
        for y in (.35, .75): d.line([add(F, (0, -h * 2 * y)), add(L, (0, -h * 2 * y))], fill=col[0], width=3)
    elif kind == 'palisade':
        for i in range(6): a = add(F, (-IS, -IH), fw * (i + .5) / 6); d.polygon([add(a, (-3, 0)), add(a, (3, 0)), add(a, (3, -h * 2 + 4)), add(a, (0, -h * 2 - 2)), add(a, (-3, -h * 2 + 4))], fill=col[i % 2])
    else:
        d.polygon([L, F, add(F, up), add(L, up)], fill=col[0]); d.polygon([F, R, add(R, up), add(F, up)], fill=col[1]); d.polygon([add(L, up), add(F, up), add(R, up), add(K, up)], fill=col[1])
        if kind == 'wall_tile':  # 기와 갓
            e = 3; c1 = add(add(L, up), (-e, 2)); c2 = add(add(F, up), (0, 4)); c3 = add(add(R, up), (e, 2)); c4 = add(add(K, up), (0, -3)); top = (0, -8)
            d.polygon([c1, c2, add(c2, top), add(c1, top)], fill=(110, 116, 128)); d.polygon([c2, c3, add(c3, top), add(c2, top)], fill=(84, 88, 100)); d.polygon([add(c1, top), add(c2, top), add(c3, top), add(c4, top)], fill=(130, 136, 148))
        if kind == 'city_wall':
            for i in range(4): a = add(add(F, (-IS, -IH), fw * (i * 2 + 1) / 8), up); d.rectangle([a[0] - 3, a[1] - 7, a[0] + 3, a[1]], fill=col[0])
        for y in range(8, h * 2, 6): d.line([add(F, (0, -y)), add(L, (0, -y))], fill=tuple(int(v * .9) for v in col[0]))
    A = im.split()[3].load(); P = im.load()
    for x in range(W):
        for y in range(H):
            if A[x, y] == 0 and any(0 <= x + a < W and 0 <= y + b < H and A[x + a, y + b] > 0 for a, b in ((1, 0), (-1, 0), (0, 1), (0, -1))): P[x, y] = OL
    bb = im.getbbox(); x0, y0 = bb[0] - bb[0] % 2, bb[1] - bb[1] % 2; im = im.crop((x0, y0, x0 + (bb[2] - x0 + 1) // 2 * 2, y0 + (bb[3] - y0 + 1) // 2 * 2))
    register(name, im, F[0] - x0, F[1] - y0, fw, fh)
# ── 소품 한 장에 여러 개: 덩어리를 찾아 줄 순서로 자르고, 이름마다 정한 너비(논리 점)와 바닥 칸으로 맞춘다 ──
PROPS = {  # 이름: (너비, fw, fh)
  'well': (30, 1, 1), 'cart': (40, 1.5, 1), 'haystack': (30, 1, 1), 'woodpile': (34, 1.5, .75), 'millstone': (28, 1, 1), 'bench': (30, 1.25, .5),
  'jars': (26, 1, .75), 'crates': (28, 1, 1), 'ricebags': (28, 1, .75), 'laundry': (40, 1.5, .3), 'herbrack': (30, 1.25, .5), 'coop': (30, 1, 1),
  'stall': (56, 2, 1.5), 'stall_fruit': (56, 2, 1.5), 'stall_meat': (56, 2, 1.5), 'stall_pot': (56, 2, 1.5), 'signpole': (14, .4, .4), 'lamppost': (14, .4, .4),
  'dummy': (16, .5, .5), 'rack': (34, 1.5, .5), 'target': (22, .6, .6), 'censer': (26, 1, 1), 'lion': (24, .8, .8), 'stonelamp': (16, .5, .5),
  'signpost': (16, .4, .4), 'cairn': (22, .8, .8), 'log': (32, 1.5, .6), 'bridge': (64, 2, 3), 'grave': (24, 1, .75), 'stele': (20, .6, .6),
  'banner_red': (14, .3, .3), 'banner_blue': (14, .3, .3), 'banner_gold': (14, .3, .3), 'banner_inn': (16, .3, .3), 'flagpole': (14, .3, .3), 'lantern_string': (48, 2, .2),
  'tree_round': (68, .75, .75), 'tree_big': (64, 1, 1), 'willow': (52, .75, .75), 'pine': (40, .6, .6), 'pine_tall': (36, .6, .6), 'tree_old': (60, 1, 1),
  'peach': (46, .75, .75), 'plum': (46, .75, .75), 'maple': (48, .75, .75), 'tree_dead': (40, .6, .6), 'pine_snow': (40, .6, .6), 'bamboo': (36, .75, .75),
  'bush': (22, .75, .75), 'bush2': (24, .75, .75), 'grass': (18, .5, .5), 'flowers': (20, .5, .5), 'flowers2': (20, .5, .5), 'reed': (20, .5, .5),
  'rock_big': (48, 2, 1.5), 'rocks': (30, 1, 1), 'rock_moss': (32, 1.25, 1), 'rock_snow': (32, 1.25, 1), 'rock_dark': (32, 1.25, 1), 'stones': (20, .75, .5),
  'mountain': (128, 4, 4), 'mountain_snow': (128, 4, 4), 'cliff': (110, 4, 3), 'mountain_dark': (128, 4, 4), 'lotus': (36, 1.5, 1), 'boat': (48, 2, 1),
  'pillar': (10, .3, .3),
  'bed': (48, 2, 1.25), 'table': (36, 1.25, 1.25), 'table_round': (28, 1, 1), 'longbench': (36, 1.5, .5), 'wardrobe': (28, 1, .6), 'bookshelf': (32, 1.25, .5),
  'screen': (40, 1.75, .3), 'altar': (40, 1.5, .75), 'throne': (30, 1, 1), 'flowerpot': (18, .6, .6), 'standlamp': (12, .4, .4), 'scroll': (16, .2, .2),
  'stove': (40, 1.5, 1), 'watertank': (24, .8, .8), 'ricechest': (26, 1, .6), 'counter': (48, 2, .75), 'wineshelf': (36, 1.5, .5), 'medchest': (34, 1.5, .5),
  'weaponrack': (36, 1.5, .5), 'gambletable': (40, 1.5, 1), 'drum': (28, 1, 1), 'sutra': (32, 1.25, .5), 'cushion': (16, .6, .6), 'brazier': (22, .75, .75),
}
# 이어 붙이는 한 칸(왼쪽 위에서 오른쪽 아래로 뻗는다). 너비는 바닥 마름모 폭에 맞춘다. 오른쪽 뒷벽(_r)만 반대로 뻗는다
SEGS = {'fence': 1, 'fence_gate': 1, 'wall_stone': 1, 'wall_tile': 1, 'fence_bamboo': 1, 'hedge': 1, 'wall_l': 1, 'wall_l_win': 1, 'wall_l_door': 1, 'wall_r': -1, 'wall_r_win': -1}
def blobs_in(im, n, per):  # 덩어리 n개를 찾아 per개씩 줄로 묶어 왼쪽부터 돌려준다
    import numpy as np
    from scipy import ndimage
    a = np.array(im)[..., 3] > 0; lab, k = ndimage.label(ndimage.binary_dilation(a, iterations=6)); objs = ndimage.find_objects(lab)
    objs = sorted(objs, key=lambda sl: -(sl[0].stop - sl[0].start) * (sl[1].stop - sl[1].start))[:n]
    boxes = sorted([(sl[1].start, sl[0].start, sl[1].stop, sl[0].stop) for sl in objs], key=lambda b: (b[1] + b[3]) / 2); out = []
    for i in range(0, len(boxes), per): out += sorted(boxes[i:i + per], key=lambda b: b[0])
    res = []
    for b in out:  # 덩어리 상자 안에서도 다른 덩어리 조각은 지운다
        c = im.crop(b); A = np.array(c); m = lab[b[1]:b[3], b[0]:b[2]]; ids = [v for v in np.unique(m) if v]; keep = max(ids, key=lambda v: (m == v).sum()) if ids else 0
        A[..., 3] = np.where(m == keep, A[..., 3], 0); c = Image.fromarray(A); res.append(c.crop(c.getbbox()) if c.getbbox() else c)
    return res
def prop(name, c, w=None, fw=None, fh=None):  # 소품 한 개를 너비로 맞추고 맨 아래 점을 앞 모서리로 잡는다
    import numpy as np
    W0, FW, FH = PROPS.get(name, (32, 1, 1)); seg = SEGS.get(name)
    if seg: FW, FH = (1, .3) if seg > 0 else (.3, 1); W0 = (FW + FH) * 16
    w, fw, fh = w or W0, fw if fw is not None else FW, fh if fh is not None else FH
    s = w * 2 / c.width; t = c.resize((max(2, round(c.width * s)) // 2 * 2, max(2, round(c.height * s)) // 2 * 2), Image.LANCZOS)
    A = np.array(t); A[..., 3] = np.where(A[..., 3] > 110, 255, 0); t = Image.fromarray(A); a = A[..., 3] > 0
    ys = np.nonzero(a.any(axis=1))[0]; fy = int(ys.max()); xs = np.nonzero(a[max(0, fy - 2):fy + 1].any(axis=0))[0]
    fx = int(xs.max()) - 1 if seg and seg > 0 else int(xs.min()) + 1 if seg else int(round(xs.mean()))  # 담은 아래 끝, 오른쪽 뒷벽은 왼쪽 아래 끝
    register(name, t, fx, fy + 1, fw, fh); print(name, '크기', (t.width // 2, t.height // 2), '바닥', fw, fh)
def isosheet(path, cols, rows, names):
    im = cutbg(Image.open(path)); cs = blobs_in(im, cols * rows, cols)
    if len(cs) < len(names): print('덩어리가 모자라', len(cs), '/', len(names))
    for nm, c in zip(names, cs): prop(nm, c)
def bldsheet(path, cols, rows, specs):  # 건물 여러 채를 한 장에 그린 시트: 칸마다 잘라 isoin으로 넣는다. specs: 이름:가로칸:세로칸
    im = cutbg(Image.open(path)); cs = blobs_in(im, cols * rows, cols)
    if len(cs) < len(specs): print('덩어리가 모자라', len(cs), '/', len(specs))
    for spec, c in zip(specs, cs):
        if spec in ('-', ''): continue
        nm, fw, fh = spec.split(':'); tmp = os.path.join('/tmp', f'_bs_{nm}.png'); c.save(tmp); isoin(tmp, nm, float(fw), float(fh))
def isogrid(path, cols, rows, key, C=64):  # 동물, 몬스터: 2열(왼아래, 왼위) × 2행(걷기 두 동작) → 2열 6행 시트, 칸 C
    import numpy as np
    H = {'chicken': 16, 'cat': 16, 'rabbit': 14, 'pheasant': 18, 'badger': 16, 'piglet': 20, 'dog': 24, 'deer': 36, 'ox': 40, 'horse': 50, 'camel': 54,
         'Beast': 34, 'Snake': 16, 'Snake2': 30, 'Racoon': 22, 'Bamboo': 46, 'Spirit': 46, 'Spirit2': 46, 'Lizard': 22, 'Skeleton': 46}.get(key.split('/')[-1], 40)
    cs = blobs_in(cutbg(Image.open(path)), cols * rows, cols); s = H / max(c.height for c in cs); out = Image.new('RGBA', (C * 2, C * 6), (0, 0, 0, 0))
    for r, src in enumerate([0, 1, 1, 1, 0, 0]):  # 차렷, 왼발, 오른발, 공격, 도약, 막기. 걸을 때 줄이 0,1,0,2로 돌아서 두 동작이 번갈아 나온다
        for col in range(2):
            c = cs[min(len(cs) - 1, src * 2 + col)]; c = c.resize((max(1, round(c.width * s)), max(1, round(c.height * s))), Image.LANCZOS)
            A = np.array(c); A[..., 3] = np.where(A[..., 3] > 110, 255, 0); c = Image.fromarray(A)
            if c.width > C or c.height > C - 2: c.thumbnail((C, C - 2))
            out.alpha_composite(c, (col * C + (C - c.width) // 2, r * C + C - 2 - c.height))
    os.makedirs(os.path.join(ROOT, 'assets/hd', os.path.dirname(key)), exist_ok=True); out.save(os.path.join(ROOT, f'assets/hd/{key}_q.webp'), lossless=True); reg_key(key + '_q'); print(key + '_q', '키', H // 2)
TEXN = {'forest': 'deep', 'dirt': 'plain'}
def tex(path, name, N=None, D=512 / 1100):  # D: 원본 한 점이 HD 몇 점이 되나. 텍스처마다 되풀이 길이가 달라도 결 크기를 같게  # 땅 텍스처: 이어 붙는 길이를 골라 자르고, 이음매 띠를 가장 덜 티 나는 금(최소 비용 이음매)으로 꿰매 타일로 만든다
    import numpy as np
    name = TEXN.get(name, name); im = Image.open(path).convert('RGB'); m = min(im.size); im = im.crop(((im.width - m) // 2, (im.height - m) // 2, (im.width + m) // 2, (im.height + m) // 2))
    if m > 1400: im = im.resize((1400, 1400), Image.LANCZOS); m = 1400
    A = np.array(im).astype(np.float32); ov = max(48, m // 9)
    # 되풀이 길이: 가로세로로 S만큼 밀었을 때 가장 닮은 S (무늬가 반듯한 돌바닥, 마루에서 중요하다)
    def diff(S): return np.abs(A[:, :m - S] - A[:, S:]).mean() + np.abs(A[:m - S] - A[S:]).mean()
    S = min(range(int(m * .62), m - ov), key=diff)
    def seam(cost):  # 위에서 아래로 가는 가장 싼 금. 각 줄에서 금의 열 번호
        H, W = cost.shape; M = cost.copy(); back = np.zeros((H, W), int)
        for i in range(1, H):
            L = np.r_[np.inf, M[i - 1, :-1]]; R = np.r_[M[i - 1, 1:], np.inf]; st = np.stack([L, M[i - 1], R]); k = st.argmin(0); back[i] = k - 1; M[i] += st.min(0)
        j = int(M[-1].argmin()); out = [0] * H
        for i in range(H - 1, -1, -1): out[i] = j; j = min(W - 1, max(0, j + back[i, j]))
        return out
    def stitch(X):  # 가로로 이어 붙게: 오른쪽 끝 다음 띠(O)를 왼쪽 띠에 금을 따라 덮는다
        T = X[:, :S].copy(); O = X[:, S:S + ov]; Lb = T[:, :ov]; cut = seam(np.abs(O - Lb).sum(2))
        for i, j in enumerate(cut): T[i, :j] = O[i, :j]
        return T
    B = stitch(A); B = stitch(B.transpose(1, 0, 2)).transpose(1, 0, 2)[:S, :S]; N = N or max(256, round(S * m / 1254 * D / 32) * 32 if m < 1254 else round(S * D / 32) * 32)
    big = Image.fromarray(np.tile(B, (3, 3, 1)).clip(0, 255).astype('uint8')).resize((N * 3, N * 3), Image.LANCZOS)  # 둘레까지 이어진 채로 줄인다
    out = big.crop((N, N, 2 * N, 2 * N)); os.makedirs(os.path.join(ROOT, 'assets/hd/ground'), exist_ok=True)
    out.save(os.path.join(ROOT, f'assets/hd/ground/{name}.webp'), quality=92); reg_key('ground/' + name); print('ground/' + name, '되풀이', S, '/', m, '→', N)
def tint(src, name, dh=-.04, ks=.72, kv=.94):  # 이미 들어온 땅 텍스처의 빛깔만 돌려 새 땅을 만든다(들판 = 풀밭을 누렇게)
    import numpy as np
    im = Image.open(os.path.join(ROOT, f'assets/hd/ground/{src}.webp')).convert('HSV'); a = np.array(im).astype(np.float32)
    g = (a[..., 0] > 35) & (a[..., 0] < 120)  # 초록 계열만 돌리고(흙빛은 그대로 두어 분홍이 되지 않게) 모두 조금 바랜다
    a[..., 0] = np.where(g, a[..., 0] + dh * 255, a[..., 0]); a[..., 1] *= np.where(g, ks, .9); a[..., 2] *= kv
    Image.fromarray(a.clip(0, 255).astype('uint8'), 'HSV').convert('RGB').save(os.path.join(ROOT, f'assets/hd/ground/{name}.webp'), quality=92); reg_key('ground/' + name); print('ground/' + name, '←', src)
def arena(path, theme):
    im = Image.open(path).convert('RGB'); r = 768 / 480
    if im.width / im.height > r: nw = round(im.height * r); im = im.crop(((im.width - nw) // 2, 0, (im.width - nw) // 2 + nw, im.height))
    else: nh = round(im.width / r); im = im.crop((0, im.height - nh, im.width, im.height))  # 세로가 길면 바닥 쪽을 남긴다
    os.makedirs(os.path.join(ROOT, 'assets/hd/arena'), exist_ok=True); im.resize((768, 480), Image.LANCZOS).save(os.path.join(ROOT, f'assets/hd/arena/{theme}.webp'), quality=92); reg_key('arena/' + theme); print('arena/' + theme)
def qb(no, paths):  # 요청서 번호로 넣는 법을 찾아 부른다
    order = json.load(open(os.path.join(ROOT, 'docs/iso-order.json'), encoding='utf8')); o = next((x for x in order if x['no'].upper() == no.upper()), None)
    if not o: print('번호 없음', no); return
    h = o['how'].split(); c = h[0]; p = paths[0]
    if c == 'iso' and h[1].startswith('tree'): prop(h[1], cutbg(Image.open(p)).crop(cutbg(Image.open(p)).getbbox()))  # 나무는 밑동이 바닥이라 너비로 맞춘다
    elif c == 'iso': isoin(p, h[1], float(h[2]), float(h[3]))
    elif c == 'isosheet': isosheet(p, int(h[1]), int(h[2]), h[3].split(','))
    elif c == 'isogrid': isogrid(p, int(h[1]), int(h[2]), h[3])
    elif c == 'isowalk': isowalk(p, paths[1] if len(paths) > 1 else '-', h[1])
    elif c == 'tex': tex(p, h[1])
    elif c == 'arena': arena(p, h[1])
    elif c == 'worldmap': worldmap(p)
    elif c == 'mapicons': mapicons(p, h[1].split(','))
    print(o['no'], o['name'], '→', o['how'])
def batch(folder):  # QB62.png, qc4-walk.png, QC4_fight.png처럼 번호가 든 파일을 번호별로 모아 넣는다
    got = {}
    for f in sorted(os.listdir(folder)):
        m = re.search(r'(Q[BC]\d+)', f, re.I)
        if m and f.lower().endswith(('.png', '.jpg', '.jpeg', '.webp')): got.setdefault(re.sub(r'(?<=\D)0+(?=\d)', '', m.group(1).upper()), []).append(os.path.join(folder, f))  # QC04 → QC4
    for no, ps in sorted(got.items(), key=lambda kv: (kv[0][:2], int(kv[0][2:]))):
        ps.sort(key=lambda q: (any(k in q.lower() for k in ('fight', 'combat', 'battle', '전투')), q))  # 걷기 먼저, 전투 나중
        try: qb(no, ps)
        except Exception as e: print(no, '실패', e)
STYLE = {'thatch': 'thatch', 'thatch_long': 'thatch', 'tavern': 'thatch', 'barn': 'wood', 'shack': 'wood', 'stilt': 'wood', 'watchtower': 'wood', 'tent': 'adobe', 'yurt': 'ice', 'adobe': 'adobe', 'cabin': 'wood',
         'hall_temple': 'gold', 'temple_town': 'gold', 'hall_manor': 'red', 'gamble': 'red', 'yamen': 'red', 'restaurant': 'red', 'hall_dark': 'dark', 'hall_ice': 'ice', 'hall_west': 'adobe', 'ruin': 'dark'}
if __name__ == '__main__':
    cmd = sys.argv[1]
    if cmd == 'place': place(sys.argv[2], int(sys.argv[3]), int(sys.argv[4]), sys.argv[5] if len(sys.argv) > 5 else 'tile')
    elif cmd == 'iso': isoin(sys.argv[2], sys.argv[3], float(sys.argv[4]), float(sys.argv[5]), float(sys.argv[6]) if len(sys.argv) > 6 else None)
    elif cmd == 'worldmap': worldmap(sys.argv[2])
    elif cmd == 'isowalk': isowalk(sys.argv[2], sys.argv[3], sys.argv[4])
    elif cmd == 'mapicons': mapicons(sys.argv[2], sys.argv[3].split(','))
    elif cmd == 'isosheet': isosheet(sys.argv[2], int(sys.argv[3]), int(sys.argv[4]), sys.argv[5].split(','))
    elif cmd == 'bldsheet': bldsheet(sys.argv[2], int(sys.argv[3]), int(sys.argv[4]), sys.argv[5].split(','))
    elif cmd == 'isogrid': isogrid(sys.argv[2], int(sys.argv[3]), int(sys.argv[4]), sys.argv[5])
    elif cmd == 'tex': tex(sys.argv[2], sys.argv[3])
    elif cmd == 'arena': arena(sys.argv[2], sys.argv[3])
    elif cmd == 'tint': tint(sys.argv[2], sys.argv[3], *map(float, sys.argv[4:7]))
    elif cmd == 'qb': qb(sys.argv[2], sys.argv[3:])
    elif cmd == 'batch': batch(sys.argv[2])
    elif cmd == 'placeall':
        order = json.load(open(os.path.join(ROOT, 'docs/iso-order.json'), encoding='utf8')); n = 0
        for o in order:
            h = o['how'].split()
            if h[0] != 'iso' or not o['code'].startswith('bld/'): continue
            name, fw, fh = h[1], int(h[2]), int(h[3])
            if fw <= 1: continue  # 이어 붙이는 한 칸은 따로
            place(name, fw, fh, STYLE.get(name, 'tile'), open_=name in ('pavilion', 'gate_sect', 'platform', 'stairs', 'dock'), roof=name not in ('platform', 'stairs', 'dock')); n += 1
        place('inn', 5, 4, 'tile', hw=34); n += 1
        for nm, h in (('wall_tile', 14), ('wall_stone', 9), ('city_wall', 24), ('palisade', 15), ('fence', 9)): wallseg(nm, h, nm); n += 1
        print('임시 그림', n)
