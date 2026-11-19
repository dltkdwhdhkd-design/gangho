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

`mapstat.cjs`는 지도마다 놓인 소품 수, 종류 수, 칸 100개당 수(담과 울타리는 빼고), 높낮이가 있는지를 뽑는다(`docs/checklist.md`의 "지도별 점검표").

`mock.cjs`는 실행 중에 지도에 소품이나 단을 얹어 찍는다. 게임 파일을 바꾸기 전에 밑그림을 눈으로 보는 데 쓴다: `WHAT=hall MOD=1 Q='&gk=0.6&time=morning'`(창운문 본전을 있는 그림으로 채운 것), `WHAT=hwasan MOD=1`(화산 절벽길에 단을 얹은 것). `MOD=0`이면 지금 그대로 찍는다. 그림은 `/tmp/mock`.

`run_tests.sh`가 적는 `_summary.txt`의 `exit=0`은 "끝까지 돌았다"는 뜻이다. 값을 찍기만 하는 시험이 많으니 기록(`*.log`)을 읽는다. 기록에 오류 줄(`PAGE`, `TypeError`, `실패`, `✗` 따위)이 있으면 `exit=1(기록에 오류 줄 N개)`로 적는다.

시험 파일은 저장소의 `tools/*_test.cjs`가 원본이다(`run_tests.sh`가 거기서 바로 돌린다). 2026-11-20에 둘이 더해졌다: `height_test.cjs`(높낮이 지도의 계단·닿기·가림), `hd_occl_test.cjs`(새 화면에서 서 있는 사람이 가려지는지. 12분쯤 걸려 따로 돌린다).

올리기 전 검사는 저장소 맨 위에서 `bash tools/check.sh`(문법, 주석에 먹힌 코드).
