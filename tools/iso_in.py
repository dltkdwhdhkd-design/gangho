#!/usr/bin/env python3
# 쿼터뷰 소품 넣기. 그림은 assets/hd/iso/<이름>.webp(HD 2배), 정보는 js/isometa.js에 적는다
#   python3 tools/iso_in.py place <이름> <fw> <fh> [양식]          그림이 오기 전 임시 그림(상자 집)을 그린다
#   python3 tools/iso_in.py placeall                                요청서의 건물 전부 임시 그림
#   python3 tools/iso_in.py iso <그림> <이름> <fw> <fh>            ChatGPT 그림 한 장 (마젠타 배경)
#   python3 tools/iso_in.py worldmap <그림>                         강호 전도
#   python3 tools/iso_in.py mapicons <그림> sect,evil,out,city,old,mine   지도 표식 3열 2행
import json, math, os, re, sys
from PIL import Image, ImageDraw
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); OUT = os.path.join(ROOT, 'assets/hd/iso'); META = os.path.join(ROOT, 'js/isometa.js')
IS, IH = 32, 16  # HD 점 기준 한 칸 걸음
def load_meta():
    s = open(META, encoding='utf8').read(); m = re.search(r'ISOMETA = (\{.*\});', s, re.S); return json.loads(m.group(1)) if m else {}
def save_meta(d):
    body = ',\n'.join(f'  {json.dumps(k)}: {json.dumps(v)}' for k, v in sorted(d.items()))
    open(META, 'w', encoding='utf8').write('// tools/iso_in.py가 쓰는 쿼터뷰 소품 정보. 손으로 고치지 않는다\nexport const ISOMETA = {\n' + body + '\n};\n')
def register(name, im, ax, ay, fw, fh):
    os.makedirs(OUT, exist_ok=True); im.save(os.path.join(OUT, name + '.webp'), lossless=True)
    d = load_meta(); d[name] = {'w': im.width // 2, 'h': im.height // 2, 'ax': ax // 2, 'ay': ay // 2, 'fw': fw, 'fh': fh}; save_meta(d)
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
STYLE = {'thatch': 'thatch', 'thatch_long': 'thatch', 'tavern': 'thatch', 'barn': 'wood', 'shack': 'wood', 'stilt': 'wood', 'watchtower': 'wood', 'tent': 'adobe', 'yurt': 'ice', 'adobe': 'adobe', 'cabin': 'wood',
         'hall_temple': 'gold', 'temple_town': 'gold', 'hall_manor': 'red', 'gamble': 'red', 'yamen': 'red', 'restaurant': 'red', 'hall_dark': 'dark', 'hall_ice': 'ice', 'hall_west': 'adobe', 'ruin': 'dark'}
if __name__ == '__main__':
    cmd = sys.argv[1]
    if cmd == 'place': place(sys.argv[2], int(sys.argv[3]), int(sys.argv[4]), sys.argv[5] if len(sys.argv) > 5 else 'tile')
    elif cmd == 'worldmap': worldmap(sys.argv[2])
    elif cmd == 'mapicons': mapicons(sys.argv[2], sys.argv[3].split(','))
    elif cmd == 'placeall':
        order = json.load(open(os.path.join(ROOT, 'docs/iso-order.json'), encoding='utf8')); n = 0
        for o in order:
            h = o['how'].split()
            if h[0] != 'iso' or not o['code'].startswith('bld/'): continue
            name, fw, fh = h[1], int(h[2]), int(h[3])
            if fw <= 1: continue  # 이어 붙이는 한 칸은 따로
            place(name, fw, fh, STYLE.get(name, 'tile'), open_=name in ('pavilion', 'gate_sect', 'platform', 'stairs', 'dock'), roof=name not in ('platform', 'stairs', 'dock')); n += 1
        place('inn', 5, 4, 'tile', hw=34); n += 1
        print('임시 그림', n)
