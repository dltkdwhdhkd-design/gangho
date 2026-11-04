# 받은 일러스트를 게임에 넣는다: python3 tools/art_in.py <그림 파일> <이름>  (예: so_n)
# 시작할 때 전부 내려받으므로 WebP로 줄인다. PNG보다 약 7배 작고 눈으로는 차이가 없다
import json, sys
from PIL import Image
src, key = sys.argv[1], sys.argv[2]
im = Image.open(src).convert('RGBA')
if im.height > 1152: im = im.resize((round(im.width * 1152 / im.height), 1152), Image.LANCZOS)  # 게임 시작이 느려지지 않게 줄인다
im.save(f'assets/art/{key}.webp', 'WEBP', quality=86, method=6, alpha_quality=90)
lst = json.load(open('assets/art/list.json', encoding='utf8'))
if key not in lst: lst.append(key)
json.dump(sorted(lst), open('assets/art/list.json', 'w', encoding='utf8'), ensure_ascii=False)
print(key)
