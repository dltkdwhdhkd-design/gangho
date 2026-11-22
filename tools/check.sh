#!/bin/bash
# 올리기 전에 꼭 돌린다: ① 모든 js 문법 검사 ② 주석에 먹힌 코드 검사 ③ 블렌더 요청서가 규격과 같은지 ④ ChatGPT 요청서 묶음(docs/gpt/)이 지금 저장소와 맞는지
# 쓰는 법: bash tools/check.sh   (저장소 맨 위 폴더에서). 종료 값 0이면 통과
cd "$(dirname "$0")/.."; bad=0
for f in js/*.js js/hd2d/*.js; do node --input-type=module --check < "$f" 2>/dev/null || { echo "문법 오류: $f"; node --input-type=module --check < "$f" 2>&1 | head -4; bad=1; }; done
for f in tools/*.cjs tools/dev/*.cjs; do node --check "$f" 2>/dev/null || { echo "문법 오류: $f"; bad=1; }; done
python3 tools/check_comments.py || bad=1
python3 tools/build_startup_art.py --check || bad=1
python3 tools/blender/gpt.py doc --check || bad=1   # 블렌더 요청서(docs/chatgpt-blender.md)의 표와 틀이 spec.json·gangho_kit.py와 같은가
python3 tools/gpt_queue.py --check || bad=1   # ChatGPT 요청서 묶음(docs/gpt/): 그림이나 모형을 받아 넣었으면 python3 tools/gpt_queue.py 로 다시 뽑아 "받음"을 고친다
[ $bad = 0 ] && echo "검사 통과"
exit $bad
