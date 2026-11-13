# Gemini가 GitHub에서 한 번에 가져가게(Gemini 웹 + → 코드 가져오기 → 이 저장소의 gemini 가지 주소) 작은 가지를 만든다
# 가지 안: README.md(요청문), ref/(참고 그림), art/<키>_n.jpg(사람마다 일러스트), kits/<키>.jpg(그 사람 일러스트 + 도트 참고를 한 장으로)
# 쓰는 법: python3 tools/gemini_branch.py  (요청문을 고칠 때마다 다시 돌린다)
import os, re, json, shutil, subprocess
from PIL import Image
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); W = '/tmp/gemini_branch'
def run(*a, cwd=ROOT): return subprocess.run(a, cwd=cwd, check=True, capture_output=True, text=True).stdout
subprocess.run(['git', 'worktree', 'remove', '--force', W], cwd=ROOT, capture_output=True); shutil.rmtree(W, ignore_errors=True)
run('git', 'worktree', 'add', '--orphan', '-b', 'gemini-tmp', W)
os.makedirs(f'{W}/ref'); os.makedirs(f'{W}/art'); os.makedirs(f'{W}/kits')
shutil.copy(f'{ROOT}/art-src/ref-art.png', f'{W}/ref/ref-art.png'); shutil.copy(f'{ROOT}/art-src/ref-people.png', f'{W}/ref/ref-people.png')
doc = open(f'{ROOT}/docs/gemini-now.md').read()
keys = re.findall(r"— 키 `(\w+)`", doc)
ppl = Image.open(f'{ROOT}/art-src/chatgpt/HC1a.png').convert('RGB')
def flat(p):
    im = Image.open(p).convert('RGBA'); bg = Image.new('RGBA', im.size, (128, 128, 128, 255)); bg.alpha_composite(im); return bg.convert('RGB')
n = 0
for k in keys:
    p = f'{ROOT}/assets/art/{k}_n.webp'
    if not os.path.exists(p): continue
    il = flat(p); il.save(f'{W}/art/{k}_n.jpg', quality=90)
    a = il.resize((round(il.width * 1024 / il.height), 1024), Image.LANCZOS); b = ppl.resize((1024, 1024), Image.NEAREST)
    kit = Image.new('RGB', (a.width + b.width + 16, 1024), (40, 40, 40)); kit.paste(a, (0, 0)); kit.paste(b, (a.width + 16, 0)); kit.save(f'{W}/kits/{k}.jpg', quality=90); n += 1
G = 'https://github.com/dltkdwhdhkd-design/gangho/blob/main/'
doc = doc.replace(f'{G}assets/art/', 'art/').replace('.webp', '.jpg').replace(f'{G}art-src/ref-art.png', 'ref/ref-art.png').replace(f'{G}art-src/ref-people.png', 'ref/ref-people.png')
doc = re.sub(r"일러스트: art/(\w+)_n\.jpg", r"일러스트: art/\1_n.jpg (한 장으로 올릴 때는 kits/\1.jpg: 일러스트와 도트 참고가 함께 있다)", doc)
head = """> 이 가지(gemini)는 Gemini가 가져가 읽는 판이다. Gemini 웹(gemini.google.com, 컴퓨터)에서 + → 코드 가져오기 → `https://github.com/dltkdwhdhkd-design/gangho/tree/gemini` 를 넣으면 이 문서와 그림이 한꺼번에 들어간다. 그다음 "README.md의 받을 차례 맨 위 사람부터, 칸 하나씩 그려 줘. 그 칸에 적힌 그림 파일을 참고해"라고 하면 된다. 가져온 뒤에 Claude가 고친 내용은 따라오지 않으니, 요청문이 바뀌면 새 대화에서 다시 가져온다.
> Gemini가 가져온 그림을 못 보면, 사람마다 `kits/<키>.jpg` 한 장만 올리면 된다(그 사람 일러스트와 도트 참고가 한 장에 있다).

"""
open(f'{W}/README.md', 'w').write(head + doc)
run('git', 'add', '-A', cwd=W); run('git', '-c', 'user.name=Claude', '-c', 'user.email=noreply@anthropic.com', 'commit', '-qm', 'Gemini 요청판(사람: 일러스트와 도트)', cwd=W)
run('git', 'push', '-f', '-q', 'origin', 'gemini-tmp:gemini', cwd=W)
subprocess.run(['git', 'worktree', 'remove', '--force', W], cwd=ROOT); run('git', 'branch', '-D', 'gemini-tmp')
print('gemini 가지 올림, 일러스트', n, '사람', len(keys))
