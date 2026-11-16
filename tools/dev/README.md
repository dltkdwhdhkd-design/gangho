# 시험 도구

`/tmp/pw`에 두고 쓰던 것의 사본이다. 새 환경에서는:

```bash
mkdir -p /tmp/pw && cp tools/dev/* /tmp/pw/ && cd /tmp/pw && npm i
bash /tmp/pw/srv.sh   # 저장소의 윗 폴더를 8002번으로 연다. srv.sh 안의 폴더 경로를 환경에 맞게 고친다
bash /tmp/pw/run_tests.sh /tmp/out http://localhost:8002/gangho/ playthrough.cjs door_test.cjs reach_test.cjs
cat /tmp/out/_summary.txt
```

`run_tests.sh`와 `srv.sh`에는 `/home/claude/gangho` 경로가 박혀 있다. 저장소 위치가 다르면 고친다. 화면 찍기: `fxshot.cjs`(전투), `shotmap.cjs`(지도), `bshot.cjs`. 쓰는 법은 `docs/master-plan.md` 0절.
