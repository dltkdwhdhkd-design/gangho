# 시험 도구

`/tmp/pw`에 두고 쓰던 것의 사본이다. 새 환경에서는:

```bash
mkdir -p /tmp/pw && cp tools/dev/* /tmp/pw/ && cd /tmp/pw && npm i
bash /tmp/pw/srv.sh   # 저장소의 윗 폴더를 8002번으로 연다. srv.sh 안의 폴더 경로를 환경에 맞게 고친다
bash /tmp/pw/run_tests.sh /tmp/out http://localhost:8002/gangho/ playthrough.cjs door_test.cjs reach_test.cjs
cat /tmp/out/_summary.txt
```

`run_tests.sh`와 `srv.sh`에는 `/home/claude/gangho` 경로가 박혀 있다. 저장소 위치가 다르면 고친다. 화면 찍기: `fxshot.cjs`(전투), `shotmap.cjs`(지도), `bshot.cjs`. 쓰는 법은 `docs/master-plan.md` 0절.

`tour.cjs`는 장면마다 한 장씩 찍으면서 새 화면인지, 사람 키가 화면 높이의 몇 분의 1인지, 싸움판 크기를 적는다. 화면을 손댄 뒤에 돌려 앞뒤를 견준다. 찍은 그림의 빛깔은 `python3 tools/tone.py <그림들>`로 잰다. 쓰는 법은 `docs/checklist.md`의 "결 재는 법".

올리기 전 검사는 저장소 맨 위에서 `bash tools/check.sh`(문법, 주석에 먹힌 코드).
