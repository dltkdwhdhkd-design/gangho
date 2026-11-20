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

시험 파일은 저장소의 `tools/*_test.cjs`가 원본이다(`run_tests.sh`가 거기서 바로 돌린다). 2026-11-20에 둘이 더해졌다: `height_test.cjs`(높낮이 지도의 계단·닿기·가림), `hd_occl_test.cjs`(새 화면에서 서 있는 사람이 가려지는지. 바깥 지도와 손으로 지은 방, 만들어지는 방 종류마다 두 곳. 3~12분 걸려 따로 돌린다. 가려짐은 "머리나 가슴이 막힌 것"이다: 계산대나 탁자 뒤에 서서 허리 아래만 가려진 사람은 세지 않는다. `LIST=1`을 주면 길에서 가려지는 사람을 다 적는다. 11-20 오후에 적게 세던 잘못을 고쳤다: `docs/checklist.md`의 잰 기록).

올리기 전 검사는 저장소 맨 위에서 `bash tools/check.sh`(문법, 주석에 먹힌 코드, 블렌더 요청서와 규격·재질 이름표가 서로 맞는지).

블렌더 조각(2026-11-20): ChatGPT에게 블렌더로 모형을 만들게 하는 요청서가 `docs/chatgpt-blender.md`다. 표와 틀은 `tools/blender/spec.json`(치수)과 `tools/blender/gangho_kit.py`(ChatGPT 스크립트가 불러 쓰는 틀)에서 뽑는다.
- `python3 tools/blender/gpt.py run <받은 스크립트.py> [--install]`: 빈 폴더에서 돌려 `.glb`를 만들고 규격으로 검사한다. `--install`이면 통과한 것을 `assets/hd2d/models/`에 넣는다. 받은 스크립트는 돌리기 전에 읽어 본다.
- `python3 tools/blender/gpt.py check <.glb나 폴더나 .zip…> [--install]`: 받은 `.glb`를 검사한다(치수, 꼭 닿는 축, 삼각형 수, 재질 이름, 앞뒤가 뒤집힌 면, 구멍). 받은 스크립트는 `art-src/blender/`에 둔다(M1: `gangho_m1.py`).
- `python3 tools/blender/gpt.py doc`: 요청서의 표와 틀 전문을 다시 뽑는다(`spec.json`이나 틀을 고친 뒤).
- `tools/blender/walls.py`: Claude가 같은 틀로 만든 임시 방 벽 조각. 게임은 받은 M1을 쓰니 `--install`을 붙이지 않는다.
- `python3 tools/wall_in.py`: 조각에 입히는 무늬(`assets/hd2d/preview/pm_*.webp`)를 만든다. 게임 쪽 이름표는 `js/hd2d/palette.js`.
- 방을 찍고 재는 것: `tools/dev/roomkit.cjs`(`ROOMS="hall_in inn" GEN="hall home" POS="n m s" OUT=/tmp/rm/x`). 사람 키, 벽 높이, 벽이 화면 어디에 오는지를 적는다.
- 주소로 바로 가 보기: 게임 주소 끝에 `?hd2d=1&see=inn`처럼 `see=지도 이름`을 붙이면 저장을 건드리지 않는 둘러보기(새 낭인, 자유 모드)로 그 지도에 바로 선다(`js/hd2d.js`의 `tour`). 방이면 나가는 문 앞에 선다. 손으로 지은 지도 이름만 된다(`inn`, `hall_in`, `clinic`, `cheongha` …. 만들어지는 방 `r_…`은 그 고을에 한 번 들어가야 생긴다). 고친 방을 주인께 보여 드릴 때 이 주소를 드린다.
- 방을 두 화면에서 찍는 것: `tools/dev/room2.cjs`(`MODE=2d|hd ROOMS="inn hall_in @inn @elder" STEP=p4 NIGHT=1 AT="8,6"`). `@종류`는 만들어지는 방 한 곳, `STEP`은 이야기 단계(그 단계의 사람이 선다). 살림을 다시 짰을 때 옛 2D 화면이 깨지지 않았는지도 이걸로 본다.
- 방 가구 조각: 받은 조각의 이름은 `assets/hd2d/models/kit.json`에 있고(`gpt.py --install`이 적는다. 손으로 넣었으면 `python3 tools/blender/gpt.py kit`), `js/hd2d/rooms.js`의 `FURN`이 "소품 그림 이름 → 조각"을 정한다. 그림이 없던 가구는 `js/tiles.js`에 새 이름(`altar`, `chair`, `teatable`, `seat`)을 붙였고, 옛 2D 화면에서는 있던 그림을 빌려 그린다(`js/core.js`의 `SAME`).
- 가구 위에 얹는 것(찻주전자, 촛대, 향로): 방을 짤 때 `m.on('teapot', 칸x, 칸y)`로 놓는다(`js/maps.js`). 먼저 놓은 가구의 막힘 상자 안이어야 하고, 새 화면에서는 그 가구 조각의 윗면 높이에 선다.
- 방 바닥 무늬: `art-src/chatgpt/FL1.png`를 `tools/wall_in.py`가 여섯 장(`fl_*.webp`)으로 자른다. 어느 방에 무엇을 까는지는 `js/hd2d/rooms.js`의 `floorOf`, 밝기는 `js/hd2d.js`의 `FLK`.
