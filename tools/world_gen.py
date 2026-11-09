#!/usr/bin/env python3
# 강호 전도의 땅 모양을 고지도 그림에서 뽑는다.
# 그림(assets/hd/world/concept.webp)의 색을 바다, 강, 초원, 숲, 산, 설산, 사막, 평지로 나누고,
# 문파와 도시 자리를 비우고, 길을 찾아 깔고, 주막 자리를 정해 assets/world/terrain.png 한 장에 담는다.
# 칸 값: 0 평지 1 바다 2 강 3 초원 4 숲 5 산 6 설산 7 사막 8 길 9 다리 10 주막 11 산기슭 12 숲속 빈터 13 눈밭
# 쓰는 법: python3 tools/world_gen.py [미리보기.png]   (worlddata.js의 자리나 길이 바뀌면 다시 돌린다)
import json, subprocess, sys
import numpy as np
from PIL import Image
from scipy import ndimage as nd
from skimage.graph import route_through_array

K = 1.6; WW, WH = round(804 * K), round(658 * K)
PLAIN, SEA, RIVER, STEPPE, FOREST, MOUNT, SNOW, DESERT, ROAD, BRIDGE, INN, FOOT, GLADE, SNOWF = range(14)
REF = {  # 그림에 쓰인 색 → 쓰임
    'water': [(15, 87, 156), (7, 104, 177), (31, 63, 98)],
    'snow': [(243, 244, 244), (185, 190, 196), (114, 144, 183)],
    'dark': [(56, 73, 35), (29, 38, 26)],          # 숲의 짙은 초록
    'lit': [(220, 176, 94), (161, 141, 117)],       # 산의 밝은 면
    'shade': [(92, 87, 52), (121, 109, 56)],        # 산 그늘
    'green': [(179, 173, 67), (153, 144, 55)],      # 초원
    'tan': [(246, 208, 131), (241, 197, 112)],      # 평지
}

def classify(path):
    im = np.array(Image.open(path).convert('RGB')).astype(np.float32); H, W, _ = im.shape
    cols, roles = [], []
    for r, cs in REF.items():
        for c in cs: cols.append(c); roles.append(r)
    C = np.array(cols, np.float32); best = np.full((H, W), 1e9, np.float32); lab = np.zeros((H, W), np.int16)
    for i, c in enumerate(C):
        d = ((im - c) ** 2).sum(2); m = d < best; best[m] = d[m]; lab[m] = i
    role = np.array(roles)[lab]
    fr = lambda r, k: nd.uniform_filter((role == r).astype(np.float32), 2 * k + 1)
    Wf, Sf, F, A, B, Gl = fr('water', 4), fr('snow', 4), fr('dark', 5), fr('lit', 5), fr('shade', 5), fr('green', 5)
    yy, xx = np.mgrid[0:H, 0:W]; sx, sy = W / 1386, H / 1135
    cls = np.full((H, W), PLAIN, np.uint8)
    cls[(xx < 760 * sx) & (yy < 600 * sy) & (xx / sx + yy / sy * .9 < 1150)] = DESERT
    cls[Gl > .32] = STEPPE
    forest = nd.binary_opening(F > .2, iterations=2)  # 해안선과 경계의 짙은 테두리는 숲이 아니다
    cls[forest] = FOREST
    mt = nd.binary_dilation(nd.binary_opening((B > .16) & (A > .1) & (F < .22), iterations=1), iterations=2)
    cls[mt] = MOUNT
    cls[Sf > .22] = SNOW
    water = Wf > .45
    core = nd.binary_erosion(water, iterations=6); lb, n = nd.label(core)
    if n:
        sz = nd.sum(core, lb, range(1, n + 1)); seed = np.isin(lb, [i + 1 for i, s in enumerate(sz) if s > 2000])
        sea = water & nd.binary_dilation(seed, iterations=9)
    else: sea = np.zeros_like(water)
    cls[water] = RIVER; cls[sea] = SEA
    def mode(a, k):
        out, bestv = a.copy(), np.zeros(a.shape, np.float32)
        for c in range(8):
            s = nd.uniform_filter((a == c).astype(np.float32), k); m = s > bestv; out[m] = c; bestv[m] = s[m]
        return out
    keep = (cls == SEA) | (cls == RIVER)
    c2 = mode(cls, 5); c2[keep] = cls[keep]; c2 = mode(c2, 3); c2[keep] = cls[keep]
    ys = (np.arange(WH) * H / WH).astype(int); xs = (np.arange(WW) * W / WW).astype(int)
    g = c2[ys][:, xs].copy()
    # 강은 대각선으로만 이어지면 끊겨 보인다. 옆 칸을 메워 네 방향으로 잇는다
    for v in (RIVER, SEA):
        w = g == v
        a = w[:-1, :-1] & w[1:, 1:] & ~w[:-1, 1:] & ~w[1:, :-1]; g[:-1, 1:][a] = v
        w = g == v; b = w[:-1, 1:] & w[1:, :-1] & ~w[:-1, :-1] & ~w[1:, 1:]; g[:-1, :-1][b] = v
    return g

def locs():
    js = "import('./js/worlddata.js').then(m=>console.log(JSON.stringify({L:m.LOCS.map(l=>({id:l.id,name:l.name,px:l.px,boat:!!l.boat,kind:l.kind,style:l.style||'',map:l.map})),R:m.ROADS})))"
    return json.loads(subprocess.check_output(['node', '-e', js], text=True))

FP = (16, 20, 6)  # 문파 터: 좌우, 위, 아래 칸 수
def foot(g, tx, ty, m=0): return g[max(0, ty - FP[1] - m):ty + FP[2] + m, max(0, tx - FP[0] - m):tx + FP[0] + 1 + m]

RNG = np.random.default_rng(7)
def clear(g, x0, y0, x1, y1, round_=True):
    """네모 안의 숲, 산, 설산을 걸을 수 있는 땅으로 바꾼다. 둥글고 들쭉날쭉하게 깎아 네모 티가 안 나게"""
    x0, y0 = max(0, x0), max(0, y0); s = g[y0:y1, x0:x1]
    if not s.size: return
    if round_:
        h, w = s.shape; yy, xx = np.mgrid[0:h, 0:w]; cy, cx = (h - 1) / 2, (w - 1) / 2
        ang = np.arctan2(yy - cy, xx - cx); wob = 1 + .12 * np.sin(ang * 3 + RNG.uniform(0, 6)) + .08 * np.sin(ang * 5 + RNG.uniform(0, 6))
        m = ((yy - cy) / (h / 2 + .5)) ** 2 + ((xx - cx) / (w / 2 + .5)) ** 2 <= wob ** 2
    else: m = np.ones(s.shape, bool)
    for a, b in ((FOREST, GLADE), (MOUNT, FOOT), (SNOW, SNOWF)): s[(s == a) & m] = b

def main():
    out_prev = sys.argv[1] if len(sys.argv) > 1 else None
    g = classify('assets/hd/world/concept.webp'); d = locs(); pos = {}
    for l in d['L']:
        tx, ty = round(l['px'][0] * K), round(l['px'][1] * K); f = foot(g, tx, ty)
        wet = ((f == SEA) | (f == RIVER)).sum()
        if wet and not l['boat']:
            best = None
            for r in range(1, 40):
                for ddx in range(-r, r + 1):
                    for ddy in (-r, r) if abs(ddx) < r else range(-r, r + 1):
                        q = foot(g, tx + ddx, ty + ddy, 2); w = ((q == SEA) | (q == RIVER)).sum()
                        if w == 0 and (best is None or abs(ddx) + abs(ddy) < best[0]): best = (abs(ddx) + abs(ddy), tx + ddx, ty + ddy)
                if best: break
            print(f"자리 옮김 필요: {l['id']} {l['name']} {l['px']} → [{best[1] / K:.0f}, {best[2] / K:.0f}]" if best else f"자리 못 찾음: {l['id']}")
        if l['boat']:  # 배로만 가는 섬: 터 둘레를 둥근 섬으로 메운다
            y0, x0 = ty - FP[1] - 6, tx - FP[0] - 7; s = g[y0:ty + FP[2] + 7, x0:tx + FP[0] + 8]; h, w = s.shape
            yy, xx = np.mgrid[0:h, 0:w]; ang = np.arctan2(yy - h / 2, xx - w / 2); r = 1 + .1 * np.sin(ang * 4 + 1) + .07 * np.sin(ang * 7 + 2)
            s[(((yy - h / 2) / (h / 2)) ** 2 + ((xx - w / 2) / (w / 2)) ** 2 <= r ** 2) & ((s == SEA) | (s == RIVER))] = PLAIN
        pos[l['id']] = (tx, ty)
        clear(g, tx - FP[0] - 8, ty - FP[1] - 7, tx + FP[0] + 9, ty + FP[2] + 9)
    # 길: 지형마다 걷기 힘든 정도를 매기고 가장 쉬운 길을 찾는다. 먼저 낸 길은 다음 길이 따라 걷는다
    cost = np.array([1, 1e5, 40, 1, 2.4, 18, 14, 1.6, .35, 2, 1, 1.2, 1.4, 1.6], np.float64)
    paths, stops = [], []
    for a, b in d['R']:
        (x0, y0), (x1, y1) = pos[a], pos[b]; y0 += 4; y1 += 4
        bx0, by0, bx1, by1 = max(0, min(x0, x1) - 140), max(0, min(y0, y1) - 140), min(WW, max(x0, x1) + 141), min(WH, max(y0, y1) + 141)
        cm = cost[g[by0:by1, bx0:bx1]]
        p, _ = route_through_array(cm, (y0 - by0, x0 - bx0), (y1 - by0, x1 - bx0), fully_connected=True, geometric=True)
        p = np.array([(y + by0, x + bx0) for y, x in p], np.float64)
        # 계단 같은 꺾임을 부드럽게. 바다로 밀려나면 원래 칸을 쓴다
        if len(p) > 9:
            k = 7; sm = p.copy()
            for i in range(k, len(p) - k): sm[i] = p[i - k:i + k + 1].mean(0)
            for i in range(len(p)):
                yy, xx = int(round(sm[i][0])), int(round(sm[i][1]))
                if g[yy, xx] == SEA: sm[i] = p[i]
            p = sm
        pts = []
        for i in range(len(p) - 1):
            (ya, xa), (yb, xb) = p[i], p[i + 1]; n = max(1, int(np.ceil(np.hypot(yb - ya, xb - xa) * 2)))
            for t in range(n + 1): pts.append((ya + (yb - ya) * t / n, xa + (xb - xa) * t / n))
        cells = set()
        for yy, xx in pts:
            for q in (-1, 0, 1):
                for r in (-1, 0, 1):
                    if q * q + r * r <= 2: cells.add((int(round(yy)) + q, int(round(xx)) + r))
        for yy, xx in cells:
            if 0 <= yy < WH and 0 <= xx < WW and g[yy, xx] != INN: g[yy, xx] = BRIDGE if g[yy, xx] in (SEA, RIVER, BRIDGE) else ROAD
        for yy, xx in p[::3]: clear(g, int(xx) - 4, int(yy) - 4, int(xx) + 5, int(yy) + 5)
        paths.append((a, b, p))
        if len(p) > 110:  # 긴 길 한가운데쯤 길가 주막
            yy, xx = p[len(p) // 2]; dy, dx = p[len(p) // 2 + 3] - p[len(p) // 2 - 3]; nrm = np.hypot(dx, dy) or 1
            for side in (1, -1):
                sx, sy = int(round(xx + -dy / nrm * 5 * side)), int(round(yy + dx / nrm * 5 * side))
                s = g[sy - 3:sy + 3, sx - 3:sx + 4]
                if s.size and not np.isin(s, [SEA, RIVER, BRIDGE, ROAD]).any(): clear(g, sx - 7, sy - 7, sx + 8, sy + 6); g[sy, sx] = INN; stops.append((sx, sy)); break
    # 바닥 그림: 0 풀밭 1 숲 바닥 2 황토 3 마른 풀(녹갈) 4 눈 5 검붉은 땅. 산, 물, 길 밑은 가장 가까운 뭍의 바닥을 따른다
    BI = {PLAIN: 3, STEPPE: 0, FOREST: 1, GLADE: 1, DESERT: 2, SNOW: 4, SNOWF: 4}
    bio = np.full(g.shape, 255, np.uint8)
    for c, b in BI.items(): bio[g == c] = b
    iy, ix = nd.distance_transform_edt(bio == 255, return_distances=False, return_indices=True); bio = bio[iy, ix]
    # 마른 들 군데군데 푸른 풀밭, 초원 군데군데 마른 들
    nz = nd.gaussian_filter(RNG.normal(size=g.shape), 9); nz /= nz.std()
    bio[(bio == 3) & (nz > .7) & np.isin(g, [PLAIN, FOOT, ROAD, INN])] = 0; bio[(bio == 0) & (nz < -.9) & np.isin(g, [STEPPE, ROAD])] = 3
    yy, xx = np.mgrid[0:WH, 0:WW]; P = {l['id']: l for l in d['L']}
    def patch(lid, r, b):  # 고장 색을 둥글게 칠한다
        tx, ty = pos[lid]; ang = np.arctan2(yy - ty, xx - tx); rr = r * (1 + .15 * np.sin(ang * 3 + 1) + .1 * np.sin(ang * 7))
        bio[((yy - ty) ** 2 + (xx - tx) ** 2 <= rr ** 2) & (g != SEA)] = b
    for lid, r, b in (('cheonma', 48, 5), ('blackpalace', 40, 5), ('bukhae', 44, 4), ('snowpeak', 30, 4), ('tiangate', 18, 4), ('cheonsan', 26, 4), ('jangbaek', 22, 4), ('gonryun', 24, 4)):
        if lid in pos: patch(lid, r, b)
    # 경계는 매끈한 잡음만큼 옆 칸 바닥을 가져와 들쭉날쭉하게
    jx = nd.gaussian_filter(RNG.normal(size=g.shape), 2.5); jy = nd.gaussian_filter(RNG.normal(size=g.shape), 2.5)
    jx = np.clip((jx / jx.std() * 2.2).round(), -4, 4).astype(int); jy = np.clip((jy / jy.std() * 2.2).round(), -4, 4).astype(int)
    bio = bio[np.clip(yy + jy, 0, WH - 1), np.clip(xx + jx, 0, WW - 1)]
    # 한두 칸짜리 가는 줄과 점은 지운다(5칸 최빈값 두 번)
    for k in (5, 5):
        best, out = np.zeros(bio.shape, np.float32), bio.copy()
        for c in range(6):
            sc = nd.uniform_filter((bio == c).astype(np.float32), k); mm = sc > best; out[mm] = c; best[mm] = sc[mm]
        bio = out
    rgb = np.zeros((WH, WW, 3), np.uint8); rgb[..., 0] = g * 16; rgb[..., 1] = bio * 32
    Image.fromarray(rgb).save('assets/world/terrain.png', optimize=True)
    print(f'길 {len(paths)}개, 주막 {len(stops)}곳, 크기 {WW}x{WH}')
    if out_prev:
        pal = np.array([[226, 196, 140], [30, 80, 150], [70, 130, 210], [170, 180, 80], [40, 90, 40], [120, 90, 60], [235, 240, 245], [230, 170, 90], [140, 70, 30], [200, 120, 60], [255, 0, 0], [170, 140, 110], [90, 130, 70], [210, 220, 230]], np.uint8)
        Image.fromarray(pal[g]).save(out_prev)
        bp = np.array([[120, 200, 80], [40, 80, 40], [220, 170, 100], [130, 130, 70], [240, 245, 250], [110, 40, 40]], np.uint8)
        Image.fromarray(bp[bio]).save(out_prev.replace('.png', '_bio.png'))

if __name__ == '__main__': main()
