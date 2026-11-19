#!/usr/bin/env python3
# 화면 빛깔 재기: 찍은 그림이 기준 그림(docs/ref의 일검풍운결 두 장)과 얼마나 다른지 숫자로 본다.
#   python3 tools/tone.py /tmp/tour/*.png
# 밝기(0~255)와, 그림에서 붉은·주황 / 누런·올리브 / 풀빛 / 푸른빛 / 무채색 / 거의 검정이 차지하는 몫(%)을 찍는다.
# 기준 낮은 주황 23 · 올리브 29 · 거의 검정 36, 기준 밤은 푸른빛 44 · 거의 검정 39쯤이다. 한 빛깔이 8할을 넘으면 단색 화면이다.
import sys, os, colorsys, warnings
from PIL import Image
warnings.simplefilter('ignore')
HERE = os.path.dirname(os.path.abspath(__file__))
REF = [(os.path.join(HERE, '..', 'docs', 'ref', 'wandering-sword-day.png'), '기준 낮(일검풍운결)'), (os.path.join(HERE, '..', 'docs', 'ref', 'wandering-sword-night.png'), '기준 밤(일검풍운결)')]

def tone(path):
    im = Image.open(path).convert('RGB').resize((320, 180)); px = list(im.getdata()); n = len(px)
    L = sum(.3 * r + .59 * g + .11 * b for r, g, b in px) / n; c = dict(red=0, olive=0, green=0, blue=0, grey=0, dark=0)
    for r, g, b in px:
        h, s, v = colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)
        if v < .1: c['dark'] += 1
        elif s < .2: c['grey'] += 1
        elif h < .09 or h >= .78: c['red'] += 1
        elif h < .20: c['olive'] += 1
        elif h < .5: c['green'] += 1
        else: c['blue'] += 1
    return L, [round(c[k] * 100 / n) for k in ('red', 'olive', 'green', 'blue', 'grey', 'dark')]

if __name__ == '__main__':
    rows = [(p, l) for p, l in REF if os.path.exists(p)] + [(p, os.path.basename(p)) for p in sys.argv[1:]]
    print(f"{'그림':26s} 밝기 | 붉은·주황 올리브 풀빛 푸른빛 무채 거의검정")
    for p, label in rows:
        L, q = tone(p); print(f"{label[:26]:26s} {L:4.0f} | {q[0]:8d} {q[1]:6d} {q[2]:4d} {q[3]:6d} {q[4]:4d} {q[5]:8d}")
