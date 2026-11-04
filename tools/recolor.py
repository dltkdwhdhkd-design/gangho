# 팩의 인물 그림을 색만 바꿔 세력 대표용 변형을 만든다
import colorsys
from PIL import Image
PAIRS = [('BlueSamurai', 'Namgung', 170, False), ('Princess', 'Moyong', 205, True), ('Inspector', 'Jegal', 120, True), ('RedNinja2', 'Dang', 275, False), ('Lion', 'Paeng', 195, False), ('RedNinja', 'Hwasan', 325, False), ('Villager3', 'Gaebang', 55, True)]
def shift(path, out, deg, keep_skin):
    im = Image.open(path).convert('RGBA'); px = im.load()
    for y in range(im.height):
        for x in range(im.width):
            r, g, b, a = px[x, y]
            if a == 0: continue
            h, s, v = colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)
            if s < .12: continue
            if keep_skin and .03 < h < .12 and v > .55: continue
            r, g, b = colorsys.hsv_to_rgb((h + deg / 360) % 1, s, v)
            px[x, y] = (round(r * 255), round(g * 255), round(b * 255), a)
    im.save(out)
for a, b, d, k in PAIRS:
    shift(f'assets/chars/{a}.png', f'assets/chars/{b}.png', d, k)
    shift(f'assets/faces/{a}.png', f'assets/faces/{b}.png', d, k)
