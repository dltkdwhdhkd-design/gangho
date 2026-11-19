#!/bin/bash
# 기존 시험을 차례로 돌린다. $1: 결과 폴더, $2: 주소
OUT=$1; URL=$2; shift 2; mkdir -p $OUT
cd /tmp/pw
for t in "$@"; do
  s=$(date +%s)
  GAME_URL=$URL NODE_PATH=/tmp/pw/node_modules timeout 900 node -r ./launch_patch.cjs /home/claude/gangho/tools/$t > $OUT/$t.log 2>&1
  e=$?
  # 끝 값이 0이어도 기록에 오류 줄이 있으면 실패로 적는다(문제를 찍기만 하고 0으로 끝나는 시험이 있다. docs/checklist.md Q7)
  n=$(grep -c "PAGE \|TypeError\|ReferenceError\|RangeError\|Cannot read\|Cannot set\|is not a function\|is not defined\|^실패\|^✗" $OUT/$t.log)
  if [ "$e" = 0 ] && [ "$n" != 0 ]; then e="1(기록에 오류 줄 $n개)"; fi
  echo "$t exit=$e $(( $(date +%s) - s ))s" >> $OUT/_summary.txt
done
echo DONE >> $OUT/_summary.txt
