#!/usr/bin/env python3
# 주석에 먹힌 코드 찾기.
# 한 줄에 여러 문장을 쓰는 이 저장소에서는 줄 가운데에 `// 설명`을 넣으면 그 뒤 코드가 통째로 주석이 된다.
# 문법 검사로는 안 잡힌다(문법은 맞는다). 실제로 이 실수로 전투 싸움터 끝(battle.js)과 마을 카메라 가로 묶기(hd2d.js)가 죽어 있었다.
# 쓰는 법: python3 tools/check_comments.py        → 의심 줄을 보여 준다. 새로 생긴 줄이 있으면 종료 값 1
#          python3 tools/check_comments.py --ok   → 지금 나온 줄을 모두 "괜찮음"으로 적어 둔다(직접 읽어 본 뒤에만)
import re, glob, sys, json, os
BASE = os.path.join(os.path.dirname(__file__), 'check_comments.ok.json')
# 주석 글 안에 "코드처럼 생긴 것"이 있으면 의심한다: 대입, 선언, 호출 뒤 세미콜론, 화살표 함수, if (
CODE = re.compile(r"(\b(?:const|let|var) \w+\s*=|\)\s*;|;\s*\w|=>\s*[\w{(]|\bif \(|\breturn [\w!(]|\bawait \w|\bfor \(|(?<![\w가-힣'\"`])[A-Za-z_][\w.\[\]]*\s*[-+*/]?=\s*[^=\s>])")
def comment_of(line):
    # 문자열 밖의 첫 `//`를 찾는다(주소의 :// 와 문자열 안은 건너뜀)
    q = None; i = 0
    while i < len(line) - 1:
        ch = line[i]
        if q:
            if ch == '\\': i += 2; continue
            if ch == q: q = None
        elif ch in '\'"`': q = ch
        elif ch == '/' and line[i + 1] == '/' and (i == 0 or line[i - 1] != ':'): return i
        i += 1
    return -1
hits = []
files = sorted(glob.glob('js/*.js') + glob.glob('js/hd2d/*.js') + glob.glob('tools/*.cjs') + glob.glob('tools/dev/*.cjs'))
for f in files:
    for n, line in enumerate(open(f, encoding='utf8'), 1):
        k = comment_of(line)
        if k <= 0 or not line[:k].strip(): continue        # 줄 전체가 주석이면 건너뜀(일부러 꺼 둔 코드)
        c = line[k + 2:].strip()
        if CODE.search(c): hits.append((f.replace(os.sep,'/'), c[:140]))
ok = set(tuple(x) for x in json.load(open(BASE, encoding='utf8'))) if os.path.exists(BASE) else set()
if '--ok' in sys.argv:
    json.dump(sorted(set(hits)), open(BASE, 'w', encoding='utf8'), ensure_ascii=False, indent=0); print(f'{len(set(hits))}줄을 괜찮음으로 적었다'); sys.exit(0)
new = [h for h in hits if h not in ok]
for f, c in new: print(f'{f}: // {c}')
print(f'의심 {len(hits)}줄, 새로 생긴 것 {len(new)}줄')
sys.exit(1 if new else 0)
