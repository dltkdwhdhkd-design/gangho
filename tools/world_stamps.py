#!/usr/bin/env python3
# 강호 전도에 쓰는 소품을 있는 도트에서 만든다: 이음매 없는 담(가로·세로), 세로 목책, 바위산 무더기
# python3 tools/world_stamps.py → assets/hd/stamp/*.webp
import colorsys
from PIL import Image
D = 'assets/hd/stamp/'
def load(n): return Image.open(D + n + '.webp').convert('RGBA')
def save(im, n): im.save(D + n + '.webp', lossless=True); print('만듦', n, im.size)

w = load('wall_h')
# 가로 담 가운데 토막: 양끝 마감을 빼고 가운데 16칸을 두 번 잇는다
mid = w.crop((8, 0, 24, 32)); m = Image.new('RGBA', (32, 32)); m.paste(mid, (0, 0)); m.paste(mid, (16, 0)); save(m, 'wall_m')
# 세로 담: 기와 지붕 줄(19~23행)을 눕혀 세로로 잇고 양옆에 외곽선
roof = w.crop((8, 19, 24, 24)).rotate(-90, expand=True)  # 5×16
v = Image.new('RGBA', (32, 32)); x0 = 12
for y in (0, 16): v.paste(roof, (x0 + 1, y))
px = v.load()
for y in range(32):
    px[x0, y] = (44, 42, 41, 255); px[x0 + 6, y] = (35, 33, 30, 255); px[x0 + 7, y] = (60, 50, 44, 120)
save(v, 'wall_v')
# 세로 목책: 말뚝 하나를 잘라 위아래로 겹쳐 세운다
wd = load('wood_h'); bb = wd.getbbox(); stake = wd.crop((2, bb[1], 8, 32))
v = Image.new('RGBA', (32, 32))
for y in (-14, -4, 6):
    v.alpha_composite(stake, (13, y)) if y >= 0 else v.alpha_composite(stake.crop((0, -y, stake.width, stake.height)), (13, 0))
save(v, 'wood_v')
# 바위산: 바위 무더기를 피라미드처럼 쌓는다
r = load('rocks'); W, H = 250, 190; mt = Image.new('RGBA', (W, H))
for x, y in ((64, 6), (24, 44), (104, 44), (0, 90), (64, 84), (128, 92)): mt.alpha_composite(r, (x, y))
mt = mt.crop(mt.getbbox()); save(mt, 'mtn')
def tint(im, fn):
    im = im.copy(); p = im.load()
    for y in range(im.height):
        for x in range(im.width):
            a = p[x, y]
            if a[3]: p[x, y] = fn(a, y / im.height)
    return im
def snowy(a, t):  # 밝고 위쪽인 면을 눈으로
    h, s, v = colorsys.rgb_to_hsv(a[0] / 255, a[1] / 255, a[2] / 255)
    if v > .55 or (.2 < h < .45 and s > .25): return (min(255, int(205 + v * 50)), min(255, int(212 + v * 43)), 240, a[3])
    return (int(a[0] * .85), int(a[1] * .88), int(min(255, a[2] * 1.05)), a[3])
def dusk(a, t):
    h, s, v = colorsys.rgb_to_hsv(a[0] / 255, a[1] / 255, a[2] / 255)
    if .2 < h < .45 and s > .25: return (90, 40, 38, a[3])
    return (int(a[0] * .75 + 20), int(a[1] * .6), int(a[2] * .6), a[3])
save(tint(mt, snowy), 'mtn_s'); save(tint(mt, dusk), 'mtn_d'); save(tint(r, snowy), 'rocks_s')
