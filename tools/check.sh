#!/bin/bash
# 올리기 전에 꼭 돌린다: ① 모든 js 문법 검사 ② 주석에 먹힌 코드 검사
# 쓰는 법: bash tools/check.sh   (저장소 맨 위 폴더에서). 종료 값 0이면 통과
cd "$(dirname "$0")/.."; bad=0
for f in js/*.js js/hd2d/*.js; do node --input-type=module --check < "$f" 2>/dev/null || { echo "문법 오류: $f"; node --input-type=module --check < "$f" 2>&1 | head -4; bad=1; }; done
for f in tools/*.cjs tools/dev/*.cjs; do node --check "$f" 2>/dev/null || { echo "문법 오류: $f"; bad=1; }; done
python3 tools/check_comments.py || bad=1
[ $bad = 0 ] && echo "검사 통과"
exit $bad
