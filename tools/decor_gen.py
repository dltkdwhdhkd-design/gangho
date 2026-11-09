# 전각 안 꾸밈 소품을 점으로 그린다: 붉은 기둥, 병풍, 향로. HD 2배 크기
import json, math, os, random
from PIL import Image
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); OUT = os.path.join(ROOT, 'assets/hd/stamp')
OL = (30, 16, 12, 255)
def px(im, x, y, c):
  if 0 <= x < im.width and 0 <= y < im.height: im.putpixel((x, y), c if len(c) == 4 else c + (255,))
def rect(im, x0, y0, x1, y1, c):
  for y in range(y0, y1):
    for x in range(x0, x1): px(im, x, y, c)
def outline(im):
  W, H = im.size; A = [[im.getpixel((x, y))[3] > 0 for y in range(H)] for x in range(W)]
  for x in range(W):
    for y in range(H):
      if not A[x][y] and any(0 <= x + u < W and 0 <= y + v < H and A[x + u][y + v] for u, v in ((1, 0), (-1, 0), (0, 1), (0, -1))): im.putpixel((x, y), OL)
def pillar():  # 논리 12×44 → HD 24×88
  im = Image.new('RGBA', (24, 88), (0, 0, 0, 0)); red = [(120, 22, 18), (168, 34, 26), (196, 52, 36), (214, 84, 60), (150, 28, 22)]
  for y in range(10, 78):
    for i, x in enumerate(range(6, 18)): px(im, x, y, red[min(4, [0, 1, 2, 3, 3, 2, 2, 1, 1, 1, 4, 0][i])])
  for y in (14, 15, 16): rect(im, 5, y, 19, y + 1, (214, 170, 60) if y != 16 else (150, 110, 30))  # 금띠
  rect(im, 3, 4, 21, 10, (92, 52, 30)); rect(im, 3, 4, 21, 5, (130, 80, 44)); rect(im, 1, 2, 23, 4, (70, 40, 24))  # 두공
  for x in range(4, 21, 4): px(im, x, 7, (214, 170, 60))
  rect(im, 3, 78, 21, 84, (150, 146, 136)); rect(im, 3, 78, 21, 79, (196, 192, 182)); rect(im, 2, 84, 22, 87, (110, 106, 100))  # 주춧돌
  outline(im); return im
def screen():  # 병풍 논리 56×30 → HD 112×60. 네 폭에 먹으로 그린 산수
  W, H = 112, 60; im = Image.new('RGBA', (W, H), (0, 0, 0, 0)); fr = (70, 34, 22); fr2 = (110, 58, 34); paper = (234, 222, 196)
  rng = random.Random(7)
  for k in range(4):
    x0 = 2 + k * 27; x1 = x0 + 27; dy = 0 if k % 2 == 0 else 2
    rect(im, x0, 2 + dy, x1, H - 2 - (2 - dy), fr); rect(im, x0 + 1, 3 + dy, x1 - 1, 4 + dy, fr2)
    rect(im, x0 + 3, 5 + dy, x1 - 3, H - 7 - (2 - dy), paper)
    # 먹산
    base = H - 9 - (2 - dy); peaks = [(x0 + 7 + rng.randint(-2, 2), 16 + rng.randint(0, 8)), (x0 + 16 + rng.randint(-2, 2), 12 + rng.randint(0, 10))]
    for x in range(x0 + 3, x1 - 3):  # 먼 산: 능선만 진하게, 아래로 옅은 먹
      top = min(base, min(int(py + abs(x - pxk) * 1.4) for pxk, py in peaks) + dy)
      for y in range(top, min(base, top + 9)):
        t = y - top; c = (52, 56, 64) if t < 1 else (110, 116, 120) if t < 3 else (176, 178, 172) if (t < 6 and (x + y) % 2) else None
        if c: px(im, x, y, c)
    for x in range(x0 + 3, x1 - 3):  # 가까운 산자락
      top = base - 7 + int(3 * math.sin((x - x0) / 4.0 + k))
      for y in range(top, base): px(im, x, y, (70, 80, 72) if y == top else (130, 144, 120) if (x + y) % 2 else (160, 170, 146))
    for x in range(x0 + 5, x1 - 5, 5): px(im, x, base - 8, (40, 60, 40)); px(im, x, base - 9, (40, 60, 40)); px(im, x - 1, base - 8, (60, 90, 56)); px(im, x + 1, base - 8, (60, 90, 56))
    px(im, x1 - 6, 8 + dy, (190, 40, 30)); px(im, x1 - 6, 9 + dy, (190, 40, 30))  # 낙관
    rect(im, x0 + 1, H - 6 - (2 - dy), x1 - 1, H - 3 - (2 - dy), fr2)
  outline(im); return im
def censer():  # 향로 논리 18×22 → HD 36×44
  im = Image.new('RGBA', (36, 44), (0, 0, 0, 0)); br = [(84, 60, 30), (130, 96, 44), (176, 134, 60), (210, 170, 86)]
  for y in range(18, 34):
    w = int(12 - abs(y - 26) * .5)
    for x in range(18 - w, 18 + w): px(im, x, y, br[3 if x < 18 - w + 3 else 2 if x < 18 else 1 if x < 18 + w - 2 else 0])
  rect(im, 8, 16, 28, 19, br[1]); rect(im, 8, 16, 28, 17, br[3])  # 아가리
  for lx in (10, 17, 24): rect(im, lx, 34, lx + 3, 41, br[0]); rect(im, lx, 34, lx + 1, 41, br[2])  # 세 발
  rect(im, 14, 10, 22, 16, br[1]); rect(im, 16, 7, 20, 10, br[2])  # 뚜껑
  outline(im)
  for i, (x, y) in enumerate([(18, 5), (19, 3), (18, 1), (17, 0)]): px(im, x, y, (220, 220, 225, 150 - i * 30))  # 연기
  return im
if __name__ == '__main__':
  L = json.load(open(os.path.join(ROOT, 'assets/hd/list.json')))
  for n, f in (('pillar', pillar), ('screen', screen), ('censer', censer)):
    f().save(os.path.join(OUT, n + '.webp'), lossless=True)
    if 'stamp/' + n not in L: L.append('stamp/' + n)
  json.dump(L, open(os.path.join(ROOT, 'assets/hd/list.json'), 'w'), ensure_ascii=False)
  sh = Image.new('RGBA', (200, 100), (120, 84, 50, 255)); sh.alpha_composite(Image.open(os.path.join(OUT, 'pillar.webp')), (4, 6)); sh.alpha_composite(Image.open(os.path.join(OUT, 'screen.webp')), (34, 4)); sh.alpha_composite(Image.open(os.path.join(OUT, 'censer.webp')), (150, 40))
  sh.resize((800, 400), Image.NEAREST).save('/tmp/claude-0/shots/decor.png'); print('ok')
