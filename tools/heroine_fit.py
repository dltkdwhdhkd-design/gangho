# 히로인 도트 색을 일러스트에 맞춘다. 원본은 tools/orig에 두고, 여기서 읽어 assets/hd/chars에 쓴다
# 칸마다 HSV와 칸 안의 위치(fy: 칸 안 세로 위치, col: 방향)로 부위를 가르고, 부위마다 일러스트에서 뽑은 색 사다리로 바꾼다
# python3 tools/heroine_fit.py [--mask]  (--mask는 부위 구분을 색으로 칠한 확인용 그림을 남긴다)
import colorsys, sys
from PIL import Image

def hx(c): c = c.lstrip('#'); return tuple(int(c[i:i + 2], 16) for i in (0, 2, 4))
class P:
    def __init__(s, r, g, b, x, y):
        s.h, s.s, s.v = colorsys.rgb_to_hsv(r / 255, g / 255, b / 255); s.fy = y % 32; s.fx = x % 32; s.col = x // 32; s.row = y // 32
        s.line = s.v < .16                                                   # 외곽선
        s.skin = .02 < s.h < .11 and .18 < s.s < .62 and s.v > .62            # 살색
        s.green = .16 < s.h < .48 and s.s > .22 and s.v > .3
        s.greenish = .16 < s.h < .5 and s.s > .14 and s.v > .12            # 그늘진 초록까지
        s.trueskin = .03 < s.h < .1 and .22 < s.s < .5 and s.v > .78
        s.gold = .08 < s.h < .17 and s.s > .35 and s.v > .45
        s.dark = s.v < .5 and not s.skin
        s.light = s.s < .25 and s.v > .62                                    # 흰 옷, 흰 머리
        s.back = s.col == 1                                                  # 뒷모습 열
# 부위 규칙: (이름, 조건, [그늘, 중간, 밝음]). 위에서부터 먼저 맞는 규칙을 쓴다
CFG = {
    'Princess': [  # 윤설: 갈색 머리에 붉은 동백, 노란 저고리, 회색 앞치마, 갈색 치마
        ('flower', lambda p: p.green and p.fy < 12, ['#7e2219', '#b23a2a', '#da6a4e']),
        ('hair', lambda p: p.dark and not p.line and not p.greenish and p.fy < (16 if p.back else 15), ['#3b2a20', '#5e4131', '#87624a']),
        ('top', lambda p: p.greenish and p.fy < 21, ['#a27a49', '#cda466', '#e8c98f']),
        ('apron', lambda p: p.greenish, ['#7d6c64', '#a39184', '#c9b7a8']),
    ],
    'RedSamurai': [  # 소: 은빛 긴 머리. 붉은 옷은 이미 맞는다
        ('hair', lambda p: p.dark and not p.line and p.s < .62 and (p.fy < 12 or (p.back and p.fy < 20)) and not (.95 < p.h or p.h < .02 and p.s > .5), ['#7d7590', '#b4abc2', '#e6e0ec']),
    ],
    'Dang': [  # 당가: 자줏빛 단발, 자주 옷
        ('hair', lambda p: p.dark and not p.line and not p.greenish and p.fy < 14, ['#4f2a4c', '#7c4677', '#a86aa0']),
        ('cloth', lambda p: p.greenish, ['#3e2236', '#62385a', '#8f5f84']),
    ],
    'Namgung': [  # 남궁: 은발 높은 꽁지머리, 파란 머리끈, 흰 겉옷에 하늘색 치마
        ('tie', lambda p: p.gold, ['#3d557f', '#5c7bb0', '#86a3d4']),
        ('hair', lambda p: p.dark and not p.line and p.fy < 21, ['#7c7887', '#aaa5b2', '#dcd8e0']),
        ('dress', lambda p: p.fy >= 21, ['#6d81ac', '#8ea6d2', '#b4c8ea']),
    ],
    'Hyeok': [  # 혁: 검은 옷에 금박은 맞다. 허리띠만 붉게
        ('sash', lambda p: p.gold and 20 <= p.fy <= 23 and 10 <= p.fx <= 21, ['#6e1a1e', '#9e2a2c', '#c44a44']),
    ],
    'Sosu': ('RedSamurai', [  # 팽소소: 소연하 원래 도트에서 옷만 먹빛, 허리띠만 붉게. 머리끈은 그대로 붉다
        ('ribbon', lambda p: p.fy < 11, None),
        ('sash', lambda p: 18 <= p.fy <= 21 and 9 <= p.fx <= 22 and p.s > .3 and (p.h < .17 or p.h > .93), ['#4a1a1c', '#702a2a', '#9a4038']),
        ('cloth', lambda p: (p.h < .17 or p.h > .93) and p.s > .3 and not p.trueskin, ['#1b1d26', '#2e3242', '#4a4f63']),
    ]),
    'RedArmor': ('RedSamurai', []),  # 황보웅, 붉은 달 사자: 소연하 원래 도트를 그대로 쓴다
    'IceGirl': ('Cavegirl', []),     # 북해빙궁 제자: 백랑 원래 도트(흰 머리 털옷)를 그대로 쓴다
    'Cavegirl': [  # 백랑: 짙은 녹색 올림머리, 짙은 녹색 장포에 갈색 띠
        ('hair', lambda p: p.light and p.fy < 14, ['#252c24', '#3d4a3b', '#58664f']),
        ('sash', lambda p: not p.skin and not p.line and .0 < p.h < .08 and p.s > .4 and p.fy >= 14, ['#4e3a33', '#6f544a', '#8f7264']),
        ('robe', lambda p: p.fy >= 13 and not (p.trueskin and p.edge and 15 <= p.fy <= 24), ['#232a21', '#38432f', '#56614a']),  # 손만 남기고 털옷을 장포로
    ],
}
def ramp(stops, t):
    t = max(0., min(1., t)); a = [hx(c) for c in stops]
    if t < .5: u = t / .5; return tuple(round(a[0][i] + (a[1][i] - a[0][i]) * u) for i in range(3))
    u = (t - .5) / .5; return tuple(round(a[1][i] + (a[2][i] - a[1][i]) * u) for i in range(3))
def fit(name, mask=False):
    src, rules = CFG[name] if isinstance(CFG[name], tuple) else (name, CFG[name])
    im = Image.open(f'tools/orig/{src}.webp').convert('RGBA'); px = im.load()
    cls = {}  # 위치 → 규칙 번호
    for y in range(im.height):
        for x in range(im.width):
            r, g, b, a = px[x, y]
            if a < 10: continue
            p = P(r, g, b, x, y)
            if p.line: continue
            fx0 = x - x % 32; row = [px[q, y][3] > 10 for q in range(fx0, fx0 + 32)]; L = row.index(True); R = 31 - row[::-1].index(True); p.edge = p.fx - L < 3 or R - p.fx < 3
            for i, (_, f, _) in enumerate(rules):
                if f(p): cls[x, y] = (i, p.v); break
    # 부위마다 밝기 범위를 잡아 사다리 위치를 정한다
    rng = {}
    for (i, v) in cls.values(): lo, hi = rng.get(i, (1, 0)); rng[i] = (min(lo, v), max(hi, v))
    out = im.copy(); q = out.load(); dbg = [(255, 0, 0), (0, 255, 0), (0, 0, 255), (255, 0, 255), (0, 255, 255)]
    for (x, y), (i, v) in cls.items():
        if rules[i][2] is None and not mask: continue
        lo, hi = rng[i]; c = dbg[i] if mask else ramp(rules[i][2], (v - lo) / max(.05, hi - lo)); q[x, y] = (*c, px[x, y][3])
    return out
if __name__ == '__main__':
    mask = '--mask' in sys.argv
    for n in CFG:
        o = fit(n, mask)
        if mask: o.resize((o.width * 4, o.height * 4), Image.NEAREST).save(f'/tmp/claude-0/shots/cmp/mask_{n}.png')
        else: o.save(f'assets/hd/chars/{n}.webp', lossless=True); print('바꿈', n)
