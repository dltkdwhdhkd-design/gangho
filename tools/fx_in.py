# 효과 그림: ChatGPT로 받은 효과 시트(art-src/chatgpt/<이름>.png, 단색 초록 배경)를 게임 시트로 만든다
# 결과: assets/fx2/<이름>.webp (칸을 가로로 한 줄로 이어 붙임) + assets/fx2/fx.json (칸 크기, 칸 수)
# 게임(js/battlefx.js)은 fx.json에 있는 시트만 쓰고, 없으면 코드로 그린 임시 그림을 쓴다
# 쓰는 법: python3 tools/fx_in.py [이름...]   (이름을 안 주면 아래 표에 있고 파일이 있는 것 전부)
import os, sys, json
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'art-src', 'chatgpt'); OUT = os.path.join(ROOT, 'assets', 'fx2')
# 이름: (열, 행, 칸 가로, 칸 세로) — 칸 크기는 게임 평면도 점(사람 키 48점 그림 기준으로 줄인 크기)
TABLE = {
    'hs_petal': (4, 4, 8, 8), 'hs_bloom': (4, 2, 20, 20), 'hs_bloom_big': (4, 2, 64, 64), 'hs_branch': (4, 2, 96, 48),
    'hs_slash': (3, 2, 56, 56), 'hs_thrust': (1, 6, 140, 35), 'hs_swirl': (4, 2, 40, 40), 'hs_jaha': (4, 2, 40, 40), 'hs_jahawave': (4, 2, 72, 36),
}
KEY = (0, 255, 0)

def clean(im):
    """초록 배경과 그 둘레 번진 점을 지운다"""
    im = im.convert('RGBA'); px = im.load(); w, h = im.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if g > 180 and r < 120 and b < 120 and g - max(r, b) > 90: px[x, y] = (0, 0, 0, 0)
            elif g > max(r, b) + 60 and g > 120: px[x, y] = (r, max(r, b), b, a)  # 초록 번짐을 누른다
    return im

def build(name):
    cols, rows, cw, ch = TABLE[name]; f = os.path.join(SRC, name + '.png')
    if not os.path.exists(f): print('없음', f); return None
    im = clean(Image.open(f)); W, H = im.size; sw, sh = W / cols, H / rows
    cells = []
    for r in range(rows):
        for c in range(cols):
            cell = im.crop((round(c * sw), round(r * sh), round((c + 1) * sw), round((r + 1) * sh)))
            # 칸 가운데를 기준으로 비율을 지켜 줄인다(가장 가까운 점)
            k = min(cw / cell.width, ch / cell.height); nw, nh = max(1, round(cell.width * k)), max(1, round(cell.height * k))
            small = cell.resize((nw, nh), Image.NEAREST); out = Image.new('RGBA', (cw, ch)); out.paste(small, ((cw - nw) // 2, (ch - nh) // 2)); cells.append(out)
    sheet = Image.new('RGBA', (cw * len(cells), ch))
    for i, c in enumerate(cells): sheet.paste(c, (i * cw, 0))
    os.makedirs(OUT, exist_ok=True); sheet.save(os.path.join(OUT, name + '.webp'), lossless=True)
    return {'w': cw, 'h': ch, 'n': len(cells)}

if __name__ == '__main__':
    want = sys.argv[1:] or list(TABLE)
    jf = os.path.join(OUT, 'fx.json'); meta = json.load(open(jf)) if os.path.exists(jf) else {}
    for n in want:
        r = build(n)
        if r: meta[n] = r; print(n, r)
    os.makedirs(OUT, exist_ok=True); json.dump(meta, open(jf, 'w'), ensure_ascii=False, indent=1); print('fx.json', list(meta))
