# 대사를 번호로 뽑고 고친다. 코드를 건드리지 않고 글만 바꾸기 위한 도구.
# python3 tools/lines.py dump js/story1.js
# python3 tools/lines.py apply js/story1.js 고친목록.json
# 고친목록: {"번호": "새 글"}. null이면 그 say 문장을 지운다. "새 글\n@@who|글"이면 뒤에 say를 더한다.
import json, re, sys
LIT = re.compile(r"'(?:[^'\\\n]|\\.)*'|`(?:[^`\\]|\\.)*`")
HAN = re.compile('[가-힣]')
def lits(s):
    out = []
    for line_start, line in iter_lines(s):
        if line.lstrip().startswith('//'): continue
        for m in LIT.finditer(line):
            if HAN.search(m.group()): out.append((line_start + m.start(), line_start + m.end()))
    return out
def iter_lines(s):
    i = 0
    for l in s.split('\n'):
        yield i, l
        i += len(l) + 1
mode, path = sys.argv[1], sys.argv[2]
s = open(path, encoding='utf8').read()
L = lits(s)
if mode == 'dump':
    for n, (a, b) in enumerate(L):
        b0 = s.rfind('\n', 0, a) + 1
        ctx = s[max(b0, a - 18):a].replace('await ', '').strip()
        print(f'{n}|{ctx}|{s[a + 1:b - 1]}')
else:
    fix = json.load(open(sys.argv[3], encoding='utf8'))
    for k in sorted(fix, key=int, reverse=True):
        a, b = L[int(k)]; q = s[a]; v = fix[k]
        if v is None:
            st = s.rfind('await ', 0, a); en = s.index(');', b) + 2
            assert 'say(' in s[st:a] and '\n' not in s[st:en], s[st:en]
            if s[en:en + 1] == ' ': en += 1
            s = s[:st] + s[en:]
            continue
        parts = v.split('\n@@')
        s2 = q + parts[0] + q; tail = ''
        for p in parts[1:]:
            w, t = p.split('|', 1); who = 'null' if w == 'null' else f"'{w}'"
            tail += f" await say({who}, '{t}');"
        en = b
        if tail:
            assert s[b:b + 2] == ');', s[a:b + 6]
            tail_at = b + 2; s = s[:tail_at] + tail + s[tail_at:]
        s = s[:a] + s2 + s[b:]
    open(path, 'w', encoding='utf8').write(s)
    print('applied', len(fix))
