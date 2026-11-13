# 사람 도트: Gemini·ChatGPT·Higgsfield로 받은 걷기 시트(<키>-a.png 앞·뒤, <키>-b.png 옆)를 새 화면 시트(assets/hd2d/preview/n_<키>.webp)로 만들고
# assets/hd2d/preview/people.json(게임이 읽는 목록)을 고친다. 예전 번호(HN1a.png 따위)로 받은 것도 tools/hf_queue.json 이름으로 만든다
# 쓰는 법: python3 tools/people_in.py [키...]
import json, os, sys, glob
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import hd2d_preview as H
ROOT = H.ROOT; DIRS = [os.path.join(ROOT, 'art-src', d) for d in ('gemini', 'chatgpt', 'higgsfield')]
OUT = os.path.join(ROOT, 'assets', 'hd2d', 'preview')
# 키(사람 키 점수). 적지 않은 사람은 48. 여자 46, 노인 44, 아이 34
TALL = {'woman': 45, 'oldman': 44, 'oldwoman': 41, 'child': 34, 'kid': 34, 'granny': 41, 'orphan': 36}
FEM = {'yun', 'so', 'baekrang', 'hyeok', 'clan_dang', 'clan_moyong', 'clan_namgung', 'c_owol', 'c_saira', 'gwak', 'wife', 'flower', 'oldmom', 'sosu', 'manhwa', 'namhwa', 'town2', 'clan_hwasan', 'clan_emei', 'clan_pota', 'clan_bukhae', 'clan_yang', 'ricecake', 'onlooker', 'silk', 'tea', 'cap_herbal', 'cap_musician', 'cap_dancer', 'cheon'}
want = sys.argv[1:]
done = []
for D in DIRS:
    for a in sorted(glob.glob(os.path.join(D, '*-a.png'))):
        key = os.path.basename(a)[:-6]
        if want and key not in want: continue
        if not os.path.exists(os.path.join(D, key + '-b.png')) or key in done: continue
        src = D
        if D.endswith('gemini'):  # 오른쪽 아래 Gemini 표시를 바탕색으로 덮은 사본을 쓴다
            from PIL import Image
            src = '/tmp/people_in'; os.makedirs(src, exist_ok=True)
            for s_ in 'ab':
                im = Image.open(os.path.join(D, f'{key}-{s_}.png')).convert('RGB'); w, h = im.size; bg = im.getpixel((5, 5))
                im.paste(bg, (int(w * .9), int(h * .9), w, h)); im.save(os.path.join(src, f'{key}-{s_}.png'))
        H.walker(key + '-', 'n_' + key, src, TALL.get(key, 46 if key in FEM else 48)); done.append(key)
for c, o, _, t, _ in json.load(open(os.path.join(ROOT, 'tools', 'hf_queue.json'))):
    for D in DIRS:
        if os.path.exists(os.path.join(D, c + 'a.png')) and os.path.exists(os.path.join(D, c + 'b.png')) and not os.path.exists(os.path.join(OUT, o + '.webp')): H.walker(c, o, D, t); break
L = sorted(os.path.basename(f)[:-5] for f in glob.glob(os.path.join(OUT, 'n_*.webp')))
json.dump(L, open(os.path.join(OUT, 'people.json'), 'w'), ensure_ascii=False); print('people.json', L)
