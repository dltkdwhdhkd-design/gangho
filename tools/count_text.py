# 대사 분량 세기: say/narr/choice에 들어간 글의 글자 수(공백 빼고)와 싸움(ctx.duel) 수를 파일별로. 저장소 맨 위에서: python3 tools/count_text.py
# 장별로 보려면: python3 tools/count_text.py --chap  (파일 안에서 ctx.part/ctx.chap 표지가 나온 뒤의 글을 그 장으로 센다. 함수 순서대로 세는 어림이다)
import re, glob, sys
SAY = re.compile(r"say\(\s*(?:'[^']*'|null|[\w.\[\]]+)\s*,\s*(?:[^'`\n]{0,60}\?\s*)?('(?:[^'\\\n]|\\.)*'|`(?:[^`\\]|\\.)*`)")
NARR = re.compile(r"narr\(\s*('(?:[^'\\\n]|\\.)*'|`(?:[^`\\]|\\.)*`)")
LIT = re.compile(r"'(?:[^'\\\n]|\\.)*'|`(?:[^`\\]|\\.)*`")
HAN = re.compile('[가-힣]')
def n(s): return len(re.sub(r'\s', '', s[1:-1]))
tot = 0; duels = 0; rows = []
for f in sorted(glob.glob('js/*.js')):
    s = open(f, encoding='utf8').read(); c = 0
    for line in s.split('\n'):
        if line.lstrip().startswith('//'): continue
        if 'say(' in line or 'narr(' in line or 'choice(' in line:
            # 그 줄의 한글이 든 글 조각을 모두 센다(삼항으로 갈린 대사도 포함)
            for m in LIT.finditer(line):
                if HAN.search(m.group(0)): c += n(m.group(0))
    d = len(re.findall(r"ctx\.duel\(|await duel\(|fight\(\{", s))
    if c > 300: rows.append((f, c, d))
    tot += c; duels += d
for f, c, d in sorted(rows, key=lambda r: -r[1]): print(f"{f:22s} {c:7d}자  싸움 {d}")
print('합계', tot, '자 / 싸움 호출', duels)

if '--chap' in sys.argv:
    MARK = re.compile(r"ctx\.(?:part|chap)\(\s*([^,]+),\s*(.+?),\s*('(?:[^'\\]|\\.)*')\s*\)")
    print('\n── 장별(어림) ──')
    for f in sorted(glob.glob('js/*.js')):
        s = open(f, encoding='utf8').read()
        if 'ctx.part(' not in s and 'ctx.chap(' not in s: continue
        cur = '(표지 앞)'; seg = {}; order = []
        for line in s.split('\n'):
            if line.lstrip().startswith('//'): continue
            m = MARK.search(line)
            if m: cur = f"{m.group(1).strip()[:14]}부 {m.group(3)[1:-1]}"
            if 'say(' in line or 'narr(' in line or 'choice(' in line:
                c = sum(n(q.group(0)) for q in LIT.finditer(line) if HAN.search(q.group(0)))
                if cur not in seg: seg[cur] = 0; order.append(cur)
                seg[cur] += c
        for k in order: print(f"{f:16s} {k:34s} {seg[k]:6d}자")
