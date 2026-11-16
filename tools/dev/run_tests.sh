#!/bin/bash
# 기존 시험을 차례로 돌린다. $1: 결과 폴더, $2: 주소
OUT=$1; URL=$2; shift 2; mkdir -p $OUT
cd /tmp/pw
for t in "$@"; do
  s=$(date +%s)
  GAME_URL=$URL NODE_PATH=/tmp/pw/node_modules timeout 900 node -r ./launch_patch.cjs /home/claude/gangho/tools/$t > $OUT/$t.log 2>&1
  echo "$t exit=$? $(( $(date +%s) - s ))s" >> $OUT/_summary.txt
done
echo DONE >> $OUT/_summary.txt
