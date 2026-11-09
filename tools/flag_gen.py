# 문파 깃발 만들기: 문파마다 고유 색과 한자 한 글자를 수놓은 큰 깃발(장대 왼쪽, 오른쪽 두 벌)과 작은 기
# 출력: assets/hd/stamp/flag_<id>.webp, flagl_<id>.webp, pen_<id>.webp (HD 2배. 논리 크기 20×44, 16×28)
import json, math, os, sys
from PIL import Image, ImageDraw, ImageFont
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'assets/hd/stamp')
FONT = '/usr/share/fonts/opentype/noto/NotoSerifCJK-Black.ttc'
# id: 글자, 바탕, 글자색, 테두리
F = {
  'shaolin': ('少', '#e08a1e', '#7a1a10', '#8a2414'), 'wudang': ('武', '#e6e8ec', '#1e2c48', '#3a5a8a'), 'hwasan': ('華', '#f3e4e4', '#b01e3c', '#d4587a'),
  'jongnam': ('終', '#2f5e3c', '#f2ead0', '#c8a040'), 'emei': ('峨', '#d9cfe6', '#4a2a6a', '#8a6ab0'), 'gonryun': ('崑', '#5f98cc', '#ffffff', '#1e3a6a'),
  'gongdong': ('崆', '#a8743a', '#fff0c8', '#4a2a14'), 'jeomchang': ('蒼', '#2a7a7a', '#ffffff', '#c8b060'), 'cheongseong': ('靑', '#4a9a4a', '#ffffff', '#1e4a24'),
  'gaebang': ('丐', '#8f7f5c', '#2a1e10', '#5a4a30'), 'namgung': ('南', '#2a4aa0', '#f0c840', '#f0c840'), 'moyong': ('慕', '#6a3a8a', '#f4ecff', '#d8b048'),
  'jegal': ('葛', '#ece8dc', '#1a1a1a', '#3a7a5a'), 'dang': ('唐', '#1e2a22', '#7ad040', '#3a6a2a'), 'paeng': ('彭', '#b02a20', '#1a1010', '#2a1a14'),
  'hwangbo': ('皇', '#d8b030', '#6a1a1a', '#6a1a1a'), 'ak': ('岳', '#c02a24', '#fff4d8', '#e0b040'), 'yang': ('楊', '#24305a', '#ffffff', '#b02a20'),
  'eon': ('彦', '#efe6d0', '#2a5a7a', '#8ab0c8'), 'jin': ('陳', '#d87a2a', '#1a1010', '#3a2010'), 'janggang': ('江', '#1e3a4a', '#ffffff', '#5ab0b0'),
  'haenam': ('海', '#2a6ab0', '#ffffff', '#f0e0a0'), 'pota': ('普', '#f0eee6', '#2a5a9a', '#e08aa0'), 'haomun': ('下', '#3a3440', '#d05050', '#6a6070'),
  'odok': ('毒', '#2a1a30', '#9ae040', '#6a3a8a'), 'hyeoleui': ('血', '#8a1414', '#140808', '#1a0a0a'), 'cheonma': ('魔', '#140c10', '#e02a2a', '#8a1010'),
  'cheonsan': ('天', '#d8eaf4', '#1e4a8a', '#6aa0d0'), 'jeonjin': ('全', '#e8d8a8', '#3a2a14', '#1a1a1a'), 'mosan': ('茅', '#f0d850', '#c01e1e', '#c01e1e'),
  'jangbaek': ('白', '#5a6a7a', '#ffffff', '#e8eef4'), 'bukhae': ('氷', '#9ad0ec', '#1e3a6a', '#ffffff'), 'noeum': ('雷', '#c0502a', '#f0c840', '#f0c840'),
  'podalra': ('卍', '#6a1a2a', '#f0c840', '#f0c840'), 'cloudmt': ('雲', '#4a8ac8', '#ffffff', '#e8eef4'), 'heukpung': ('風', '#1c1c1c', '#e8e8e8', '#6a6a6a'),
  'gwan': ('官', '#b0302a', '#f8e8c0', '#1a1a1a'),
}
hx = lambda h: tuple(int(h[i:i + 2], 16) for i in (1, 3, 5))
mul = lambda c, k: tuple(max(0, min(255, round(v * k))) for v in c)
mix = lambda a, b, t: tuple(round(a[i] * (1 - t) + b[i] * t) for i in range(3))
W, H, WC, HC = 40, 88, 26, 34  # 캔버스, 천 크기
def glyph(ch, w, h):
  big = 240; f = ImageFont.truetype(FONT, big); im = Image.new('L', (big * 2, big * 2), 0); ImageDraw.Draw(im).text((big // 2, big // 4), ch, font=f, fill=255)
  bb = im.getbbox(); im = im.crop(bb); s = min(w / im.width, h / im.height); im = im.resize((max(1, round(im.width * s)), max(1, round(im.height * s))), Image.LANCZOS)
  return [[im.getpixel((x, y)) > 110 for x in range(im.width)] for y in range(im.height)]
def flag(fid, left):
  ch, bg, fg, tr = F[fid]; bg, fg, tr = hx(bg), hx(fg), hx(tr); ol = mul(bg, .28) if sum(bg) > 120 else (8, 6, 8)
  ragged = fid == 'gaebang'
  # 천의 모양(오른쪽으로 날리는 기준): 0 빈칸, 1 바탕, 2 테두리
  cw, chh = WC + 3, HC + 3; M = [[0] * cw for _ in range(chh)]
  for y in range(HC):
    for x in range(WC): M[y][x] = 2 if (x >= WC - 3 or y >= HC - 3 or y < 2) and not ragged else 1
  for y in range(HC + 3):  # 오른쪽 이빨
    d = 3 - abs((y % 6) - 3)
    for x in range(WC, WC + d):
      if y < HC: M[y][x] = 2 if not ragged else (1 if (x + y) % 5 else 0)
  for x in range(WC + 3):  # 아래 이빨
    d = 3 - abs((x % 6) - 3)
    for y in range(HC, HC + d):
      if x < WC: M[y][x] = 2 if not ragged else (1 if (x * 3 + y) % 4 else 0)
  if left: M = [r[::-1] for r in M]
  C = [[None] * cw for _ in range(chh)]
  for y in range(chh):
    for x in range(cw):
      if M[y][x]: C[y][x] = tr if M[y][x] == 2 else bg
  if ragged:  # 개방: 기운 천 조각
    for (px, py, pw, ph, col) in [(3, 6, 6, 5, (120, 96, 60)), (16, 22, 7, 6, (104, 112, 84)), (5, 24, 5, 4, (140, 110, 72))]:
      if left: px = cw - px - pw
      for y in range(py, py + ph):
        for x in range(px, px + pw):
          if C[y][x]: C[y][x] = col if (x in (px, px + pw - 1) or y in (py, py + ph - 1)) and (x + y) % 2 else mix(col, bg, .2)
  # 글자: 안쪽 가운데. 수놓은 그림자를 한 점 아래로
  gw, gh = (WC - 8, HC - 11); G = glyph(ch, gw, gh); gx0 = (cw - len(G[0])) // 2 + (-1 if not left else 1); gy0 = 3 + (HC - 6 - len(G)) // 2
  for y, row in enumerate(G):
    for x, v in enumerate(row):
      if v and C[gy0 + y + 1][gx0 + x + 1] and not (y + 1 < len(G) and x + 1 < len(row) and G[y + 1][x + 1]): C[gy0 + y + 1][gx0 + x + 1] = mul(C[gy0 + y + 1][gx0 + x + 1], .62)
  for y, row in enumerate(G):
    for x, v in enumerate(row):
      if v: C[gy0 + y][gx0 + x] = fg
  # 바람에 날리는 물결과 음영. 장대에서 멀수록 크게 흔들린다
  im = Image.new('RGBA', (W, H), (0, 0, 0, 0)); P = im.load()
  for y in range(chh):
    for x in range(cw):
      c = C[y][x]
      if not c: continue
      dist = (cw - 1 - x) if left else x; ph = dist / WC * math.pi * 1.7 + .4
      dy = round(1.6 * math.sin(ph) * dist / WC); k = 1 + .15 * math.cos(ph) - (.08 if dist < 2 else 0)
      X = (W - 9 - cw + 1 + x) if left else (8 + x); Y = 10 + y + dy
      if 0 <= X < W and 0 <= Y < H: P[X, Y] = mul(c, k) + (255,)
  # 테두리 선
  A = [[P[x, y][3] > 0 for y in range(H)] for x in range(W)]
  for x in range(W):
    for y in range(H):
      if not A[x][y] and any(0 <= x + u < W and 0 <= y + v < H and A[x + u][y + v] for u, v in ((1, 0), (-1, 0), (0, 1), (0, -1))): P[x, y] = ol + (255,)
  # 장대, 끈, 창날 장식
  px = 4 if not left else W - 7
  for y in range(7, H):
    for i, col in enumerate([(42, 24, 16), (176, 128, 70), (134, 86, 42), (96, 60, 30), (42, 24, 16)]):
      P[px - 1 + i, y] = col + (255,)
  for y in range(H - 3, H): P[px, y] = P[px + 1, y] = (70, 70, 74, 255)  # 쇠 밑동
  for y in (9, 10):  # 장대에 묶은 끈
    for i in range(5): P[px - 1 + i, y] = (150, 30, 24, 255) if i in (1, 2, 3) else (60, 10, 8, 255)
  tip = [(0, 0, 1), (-1, 1, 3), (-1, 2, 3), (-2, 3, 5), (-1, 4, 3), (-1, 5, 3), (0, 6, 1)]  # 창날
  for dx, yy, n in tip:
    for i in range(n): P[px + 1 + dx + i, yy] = ((246, 226, 140) if i == 0 else (214, 170, 60) if i < n - 1 else (130, 96, 30)) + (255,)
  for yy in (7, 8):  # 붉은 술
    for i in (-1, 0, 1, 2, 3): P[px + 1 + i - 1, yy] = (196, 44, 36, 255) if (i + yy) % 2 else (150, 28, 24, 255)
  return im
def pennant(fid):
  ch, bg, fg, tr = F[fid]; bg, tr = hx(bg), hx(tr); b = Image.open(os.path.join(OUT, 'banner1.webp')).convert('RGBA'); P = b.load(); w, h = b.size
  for x in range(w):
    for y in range(h):
      r, g, bl, a = P[x, y]
      if a and r > g + 50: k = (r + g + bl) / 3 / 92; P[x, y] = mul(bg if y < h * .78 else tr, .55 + .55 * k) + (a,)
  return b
if __name__ == '__main__':
  L = json.load(open(os.path.join(ROOT, 'assets/hd/list.json')))
  for fid in F:
    flag(fid, False).save(os.path.join(OUT, f'flag_{fid}.webp'), lossless=True); flag(fid, True).save(os.path.join(OUT, f'flagl_{fid}.webp'), lossless=True); pennant(fid).save(os.path.join(OUT, f'pen_{fid}.webp'), lossless=True)
    for k in (f'stamp/flag_{fid}', f'stamp/flagl_{fid}', f'stamp/pen_{fid}'):
      if k not in L: L.append(k)
  json.dump(L, open(os.path.join(ROOT, 'assets/hd/list.json'), 'w'), ensure_ascii=False)
  if len(sys.argv) > 1:  # 미리보기
    ids = list(F); sheet = Image.new('RGBA', (len(ids) * (W + 6), H * 2 + 70), (64, 84, 58, 255))
    for i, fid in enumerate(ids):
      sheet.alpha_composite(Image.open(os.path.join(OUT, f'flag_{fid}.webp')), (i * (W + 6), 0)); sheet.alpha_composite(Image.open(os.path.join(OUT, f'flagl_{fid}.webp')), (i * (W + 6), H + 4)); sheet.alpha_composite(Image.open(os.path.join(OUT, f'pen_{fid}.webp')), (i * (W + 6) + 4, H * 2 + 10))
    sheet.resize((sheet.width * 2, sheet.height * 2), Image.NEAREST).save(sys.argv[1])
  print('깃발', len(F))
