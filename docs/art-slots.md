# 그림 자리 목록

게임에는 그림 자리가 미리 들어가 있다. **정해진 이름의 파일을 정해진 폴더에 넣고 도구를 한 번 돌리면** 그 자리에 그림이 바뀌어 나온다. 파일이 없으면 오른쪽 "없을 때" 칸의 임시 그림이 나온다. 받은 그림은 먼저 `art-src/chatgpt/`에 이름 그대로 둔다.

상태: 없음 / 받음(파일은 있고 아직 안 넣음) / 넣음

## 사람

| 자리 | 무엇 | 받을 파일 | 넣는 도구 | 없을 때 | 요청문 | 상태 |
|---|---|---|---|---|---|---|
| `n_<키>` | 걷는 도트(마을·전투·강호 큰 지도) | `<키>-a.png`, `<키>-b.png` | `python3 tools/people_in.py <키>` | 옛 16점 도트 | `docs/chatgpt-people.md` 1~4순위 | 사람마다 다름(`assets/hd2d/preview/people.json`에 있으면 넣음) |
| `n_mob_*` | 이름 없는 적 열 가지(산적, 거한, 해적, 궁수, 자객, 정파 제자, 사파 무사, 마교도, 관병, 강시) | `mob_<꼴>-a.png`, `-b.png` | `people_in.py mob_<꼴>` | 옛 16점 도트 | `chatgpt-people.md` 0순위 | 없음 |
| `<키>_act`, `me_act` | 동작 칸(준비·내지름·거둠·맞음·쓰러짐·경공) | `<키>-c.png` (그 사람의 `-a.png`도 있어야 키를 맞춘다) | `people_in.py <키>` | 걷는 그림을 기울여 흉내 | `chatgpt-people.md` "동작 칸" | 없음 |
| 운명이 갈리는 사람 열하나(위충, 맹호, 사마웅, 오강, 구양철, 막고, 고진, 월천, 연경추, 남화, 만화부인) | 걷는 도트 | `<키>-a.png`, `-b.png` | `people_in.py` | 옛 도트 | `chatgpt-people.md` 1-2순위 | 없음 |
| 장팔 | 일러스트 + 걷는 도트 | `jangpal_n.png`, `jangpal-a.png`, `-b.png` | `art_in.py`, `people_in.py` | 옛 그림 | `chatgpt-people.md` 3순위 | 없음 |
| 주인공 일러스트 `me_n` | 대화 일러스트 | `me_n.png` | `python3 tools/art_in.py art-src/chatgpt/me_n.png me_n` | 지금 일러스트 | — | 없음 |

## 효과

| 자리 | 무엇 | 받을 파일 | 넣는 도구 | 없을 때 | 요청문 | 상태 |
|---|---|---|---|---|---|---|
| `hs_petal` | 매화 꽃잎 16칸 | `hs_petal.png` | `python3 tools/fx_in.py hs_petal` | 코드로 점 찍은 꽃잎 | `docs/chatgpt-hwasan.md` H1 | 없음 |
| `hs_bloom` | 매화 한 송이 피고 지기 8칸 | `hs_bloom.png` | `fx_in.py hs_bloom` | 봉오리가 부풀다 번쩍이며 꽃잎으로 터짐 | H2 | 없음 |
| `hs_bloom_big` | 절초용 큰 만개 8칸 | `hs_bloom_big.png` | `fx_in.py hs_bloom_big` | 위와 같음(크게) | H3 | 없음 |
| `hs_branch` | 매화 가지 검기 8칸 | `hs_branch.png` | `fx_in.py hs_branch` | 코드로 그은 붉은 가지 | H4 | 없음 |
| `hs_slash`, `hs_thrust`, `hs_swirl`, `hs_jaha`, `hs_jahawave` | 칼빛, 칠매검, 꽃잎 소용돌이, 자하 기운, 자하검기 | 같은 이름 `.png` | `fx_in.py <이름>` | 코드 그림 | H5~H9 | 없음(게임은 아직 hs_petal·hs_bloom·hs_bloom_big·hs_branch만 읽는다. 나머지는 받으면 `js/battlefx.js`에 붙인다) |
| `sw_arc`, `sw_arc_big`, `sw_thrust`, `sw_ring`, `sw_wave`, `sw_hit`, `sw_clash`, `sw_dash`, `sw_ult_line` | 모든 문파 공통 검기(흰·회색, 게임이 색을 입힘) | 같은 이름 `.png` | `fx_in.py <이름>` | 코드로 그은 호·선 | `docs/chatgpt-swordfx.md` S1~S9 | 없음 |
| 다른 문파 효과 | 남궁 뇌전, 무당 태극, 소림 금강, 당가 독, 마교 혈마 | 문파 기획 문서를 만든 뒤 | `fx_in.py` 표에 이름을 더한다 | 코드 그림 | (아직 없음) | — |

## 일러스트

| 자리 | 무엇 | 받을 파일 | 넣는 도구 | 없을 때 | 요청문 | 상태 |
|---|---|---|---|---|---|---|
| `cut_plum` | 매화만개 절초 이름띠 뒤 그림 | `cut_plum.png` | `python3 tools/art_in.py art-src/chatgpt/cut_plum.png cut_plum` | 빛깔 띠만 | `chatgpt-hwasan.md` H10 | 없음 |
| `cut_<꼴>` | 다른 문파 절초 띠(`lightning`, `taiji`, `gold`, `blood` …) | `cut_<꼴>.png` | `art_in.py` | 빛깔 띠만 | (아직 없음) | — |
| `cg_end_<id>` | 결말 열둘(full, inn, empty, two, lord_j, lord_s, lord_m, lord_f, gate, road, alone, redmoon) | `cg_end_<id>.png` | `art_in.py ... cg_end_<id>` | 가까운 예전 결말 그림(end_table 등) | `docs/cg-list.md` | 없음 |

## 땅·벽·모형

| 자리 | 무엇 | 받을 파일 / 만드는 법 | 넣는 도구 | 없을 때 | 요청문 | 상태 |
|---|---|---|---|---|---|---|
| HK3 | 절벽·계단·바위 | 받음 | `python3 tools/cliff_in.py` → 절벽 무늬 `cl_rock`(블렌더 바위·절벽 모형에 입힌다), 돌계단 `cl_step` | — | `chatgpt-now.md` | **넣음(11-20)**. 그림 속 풀 띠와 이끼 바위는 안 쓴다 |
| HG2 | 물 셋(강물, 연못, 여울) | 받음 | `python3 tools/ground_in.py` → `wt_river`, `wt_pond`, `wt_rapid` | 코드로 그린 잔물결 | `chatgpt-now.md` | **넣음(11-20)** |
| HP5 | 나루·배·갈대 | 받음 | 널만: `tools/ground_in.py` → `g_plank`(나루와 다리 바닥) | 2D 타일을 키운 것 | `chatgpt-now.md` | 널만 넣음(11-20). 배·말뚝·갈대는 고을 채울 때 모형의 무늬로 |
| HP6 | 좌판·수레 | 받음 | 고을 채울 때 모형의 무늬로(그림 판으로 세우지 않는다) | 지금 그림 | `chatgpt-now.md` | 받음(아직 안 씀) |
| WL1, WL2, WL3, FL1 | 방 벽 무늬, 아랫단과 들보, 나무 무늬, 방 바닥 무늬 | `WL1.png` … (요청서 0번 묶음) | `python3 tools/wall_in.py`가 잘라 `assets/hd2d/preview/pm_*.webp`로(파일 맨 아래 "받은 그림" 대목에 자르는 줄을 넣는다) | 받아 둔 담·지붕·땅 그림에서 자른 임시 무늬 열넷(`pm_plaster`, `pm_base_rough`, `pm_wood_dark` …. 11-20) | `chatgpt-scene.md` | 없음(11-20 요청) |
| 방 벽 조각 `rw_*` 일곱 | 방의 뒷벽과 옆벽, 기둥, 문지방, 살창, 문양판 | 블렌더 스크립트: ChatGPT의 `gangho_m1.py`(요청서 `chatgpt-blender.md`의 M1). 무늬와 UV는 넣지 않고 재질 이름만 단다 | `python3 tools/blender/gpt.py run <스크립트> --install`(돌리고, 규격으로 검사하고, 넣는다). `.zip`이나 `.glb`만 받았으면 `gpt.py check <파일> --install` | Claude의 임시 조각(`tools/blender/walls.py`, 11-20) | `chatgpt-blender.md` | 없음(11-20 요청) |
| 그 밖의 블렌더 조각: 큰 가구 `fn_*` 17, 돌계단과 난간 `st_*` 6, 눈에 띄는 것 `lm_*` 7, 장터와 나루 `mk_*` 6, 소나무 `tr_pine` | 방 안 가구, 문파의 단, 문·정자·탑·석등, 좌판·배, 나무 | ChatGPT의 `gangho_m2.py` ~ `gangho_m7.py` | 위와 같다. 넣은 뒤 게임에서 쓰게 잇는 일(소품 그림 → 조각)은 그때 한다 | 지금은 2D 그림을 세운 것 | `chatgpt-blender.md` | 없음 |
| 바위·바위산·벼랑바위·절벽 조각 `rk_*` | 큰 지도의 산, 바위, 높낮이 지형의 절벽 면 | 블렌더 `python3 tools/blender/rocks.py [이름…]` (42개, 2.3MB. 무늬는 넣지 않는다) | 그대로 `assets/hd2d/models/`에 쓴다 | 2D 그림 판 | — | **있음(11-20)** |
| 전투 무대 모형 `st_<테마>` | 무대 둘레(뒤와 양옆) | 블렌더 `tools/blender/stages.py`(만들 것) | `pack.sh` | `js/hd2d/stages.js`가 놓는 집·담·나무 | — | 없음 |
| 방 안 틀 | 객잔 홀, 객잔 방, 약방, 대장간, 전각 안, 서고, 감옥, 동굴 | 블렌더 `tools/blender/rooms.py`(만들 것) | `pack.sh` | 예전 2D 방 | — | 없음 |
