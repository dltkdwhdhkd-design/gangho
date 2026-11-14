# 문파·세가 전각 벽(ChatGPT HS1~HS9): 3열 2행(1행 앞벽, 2행 같은 건물의 옆벽 박공)을 잘라 assets/hd2d/preview/hs_<문파>_front/side.webp로,
# 부품 자리(대들보 띠, 회벽, 기단 돌, 기둥, 문, 창)를 그림 비율로 잡아 js/hd2d/build.js CROPS에 적는다(표시 사이). 블렌더 집(tools/blender/houses.py)이 이걸 쓴다
# 쓰는 법: python3 tools/walls_hs.py  (art-src/chatgpt/HS*.png 있는 것만)
import os, re, sys, json
import numpy as np
from PIL import Image
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from hd2d_preview import key_out, cells, shrink, ROOT
SRC = os.path.join(ROOT, 'art-src', 'chatgpt'); OUT = os.path.join(ROOT, 'assets', 'hd2d', 'preview')
SHEETS = {'HS1': ['shaolin', 'wudang', 'hwasan'], 'HS2': ['jongnam', 'emei', 'gonryun'], 'HS3': ['gongdong', 'jeomchang', 'cheongseong'], 'HS4': ['gaebang', 'namgung', 'moyong'],
          'HS5': ['jegal', 'dang', 'paeng'], 'HS6': ['hwangbo', 'ak', 'yang'], 'HS7': ['eon', 'jin', 'haenam'], 'HS8': ['cheonsan', 'jeonjin', 'mosan'], 'HS9': ['jangbaek', 'pota', 'giru']}
FW = 95  # 앞벽 폭(도트). 예전 벽(w1~w6)과 같은 굵기
# 부품 자리: 그림 크기에 대한 비율(왼쪽, 위, 오른쪽, 아래). 받은 그림이 모두 같은 틀(가운데 문, 양옆 창, 위 띠, 아래 기단)이라 비율로 잡는다
FR = {'beam': ('front', .08, .02, .92, .17), 'door': ('front', .36, .25, .64, .86), 'win': ('front', .12, .35, .29, .71),
      'plaster': ('side', .14, .58, .28, .80), 'stone': ('side', .02, .87, .98, 1.0), 'post': ('side', .02, .44, .12, .82)}
crops, FS, SZ = {}, {}, {}
def tight(c):  # 바탕에 튄 점 몇 개는 빼고 그림이 있는 테두리
    A = np.asarray(c.getchannel('A')) > 127; ys = np.where(A.sum(1) > 6)[0]; xs = np.where(A.sum(0) > 6)[0]
    return (xs[0], ys[0], xs[-1] + 1, ys[-1] + 1)
for sh, names in SHEETS.items():
    p = os.path.join(SRC, sh + '.png')
    if not os.path.exists(p): continue
    im = key_out(Image.open(p))
    # 칸 경계가 박공 꼭대기를 자르므로 칸으로 나누지 않고, 바탕을 지운 뒤 붙은 덩어리 여섯을 줄 순서대로 잡는다
    from scipy import ndimage
    A = np.asarray(im.getchannel('A')) > 127; lab, _ = ndimage.label(ndimage.binary_dilation(A, iterations=3))
    objs = sorted([o for o in ndimage.find_objects(lab) if (o[0].stop - o[0].start) * (o[1].stop - o[1].start) > 20000], key=lambda o: (o[0].start + o[0].stop) / 2)
    rows = [sorted(objs[r * 3:(r + 1) * 3], key=lambda o: o[1].start) for r in range(2)]
    for j in range(2):
      for i in range(3):
        o = rows[j][i]; c = im.crop((o[1].start, o[0].start, o[1].stop, o[0].stop)); c = c.crop(tight(c)); k = names[i]
        if j == 0: FS[k] = FW / c.width
        s = shrink(c, FS[k]); n = f"hs_{k}_{'front' if j == 0 else 'side'}"; s.save(os.path.join(OUT, n + '.webp'), lossless=True); SZ[n] = s.size
    for k in names:
        d = {}
        for part, (f, a, b, c2, d2) in FR.items():
            W, H = SZ[f'hs_{k}_{f}']; d[part] = [f, round(a * W), round(b * H), round(c2 * W), round(d2 * H)]
        crops['hs_' + k] = d
    print(sh, names)
# build.js CROPS에 적기(// hs 시작 ~ // hs 끝 사이를 바꾼다)
p = os.path.join(ROOT, 'js', 'hd2d', 'build.js'); s = open(p).read()
old = re.search(r'  // hs 시작\n.*?  // hs 끝\n', s, re.S)
allc = {}
if old:
    for m in re.finditer(r"  (hs_\w+): (\{.*\}),\n", old.group(0)): allc[m.group(1)] = m.group(2)
for k, d in crops.items(): allc[k] = json.dumps(d, ensure_ascii=False).replace('"', "'").replace("': ", "': ").replace("'beam'", 'beam').replace("'door'", 'door').replace("'win'", 'win').replace("'plaster'", 'plaster').replace("'stone'", 'stone').replace("'post'", 'post')
block = '  // hs 시작\n' + ''.join(f'  {k}: {v},\n' for k, v in sorted(allc.items())) + '  // hs 끝\n'
if old: s = s.replace(old.group(0), block)
else: s = s.replace("export const CROPS = {\n", "export const CROPS = {\n" + block, 1)
open(p, 'w').write(s); print('CROPS', sorted(allc))
