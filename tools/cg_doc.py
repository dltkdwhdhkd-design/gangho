# js/cg.js의 이벤트 그림 목록을 요청문용 문서로 뽑는다: python3 tools/cg_doc.py
import re
s = open('js/cg.js', encoding='utf8').read()
items = re.findall(r"^\s+([a-z_0-9]+): \['([^']*)', '#[0-9a-f]+', '#[0-9a-f]+', '([^']*)'\],", s, re.M)
sections = re.findall(r"^\s+// (.+)$", s[s.index('export const CG'):], re.M)
out = ['# 이벤트 그림 목록', '', '게임에는 이미 자리가 들어가 있습니다. 그림이 없으면 색 배경에 장면 제목만 뜹니다.', '`assets/art/cg_<이름>.png`로 넣고 `assets/art/list.json`에 `"cg_<이름>"`을 적으면 바로 바뀝니다. 이 문서는 `python3 tools/cg_doc.py`로 다시 뽑습니다.', '', '크기는 가로 1536×864 안팎의 16:9, 화면 아래쪽 4분의 1에는 대사창이 올라갑니다. 인물 생김새는 `docs/art-requests.md`의 인물 설명을 따릅니다.', '', '| 파일 | 장면 제목 | 그림 내용 |', '|---|---|---|']
for k, t, d in items: out.append(f'| cg_{k}.png | {t} | {d} |')
open('docs/cg-list.md', 'w', encoding='utf8').write('\n'.join(out) + '\n'); print(len(items))
