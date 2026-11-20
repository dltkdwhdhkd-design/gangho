# 강호행: ChatGPT에게 받을 그림과 모형 전부 (차례표)

도트 무협 게임 '강호행'에 아직 없는 그림(사람 도트, 일러스트, 효과, 무늬와 소품, 화면 틀, 아이콘, 장면 그림)과 블렌더 모형을 **한 줄로 세운 차례표**다. 위에서부터 한 단계씩 받는다. 단계마다 문서가 하나씩 있고, 그 문서에 규칙·크기·칸 배치·파일 이름이 다 적혀 있다.

단계 95개, 만들 것 413개 가운데 19개를 받았다. **지금 할 차례는 2번 `fx1`**: https://dltkdwhdhkd-design.github.io/gangho/docs/gpt/fx1.md

2026-11-21에 처음부터 다시 썼다. 전에는 요청서가 종류마다 따로 열 군데에 흩어져 있었다(`docs/chatgpt-*.md`. 받은 기록은 거기 그대로 있다). 이 문서와 단계 문서는 `python3 tools/gpt_queue.py`가 만든다. "받음"은 저장소에 그 그림이나 모형이 들어와 있는지를 보고 스스로 적는다. 받은 단계는 지우지 않는다.

## 주인이 하실 일

1. ChatGPT 대화에 아래 "처음 하는 말"을 그대로 붙인다(블렌더가 연결된 대화면 모형 단계까지 한 대화에서 된다).
2. ChatGPT가 한 단계를 만들어 압축 파일이나 그림을 주면, 그것을 Claude 대화에 올린다.
3. ChatGPT에게 "다음"이라고 한다.

검사해서 게임에 넣는 일과 이 표의 "받음"을 고치는 일은 Claude가 한다. 대화방이 길어져 느려지면 새 대화방에 "처음 하는 말"을 다시 붙이면 된다(그림체의 기준은 문서와 참고 그림에 있어서 이어진다).

## ChatGPT에게 처음 하는 말

```text
아래 주소의 문서를 읽어 줘. 내 게임 '강호행'에 넣을 그림과 블렌더 모형을 차례대로 받는 요청서야.
https://dltkdwhdhkd-design.github.io/gangho/docs/gpt/index.md
문서의 "차례표"에서 상태가 "남음"이거나 "일부 받음"인 맨 위 단계부터, 한 번에 한 단계씩 만들어 줘. 단계마다 주소가 적혀 있으니 그 주소의 문서를 열어서 거기 적힌 대로 만들면 돼. 규칙, 크기, 칸 배치, 파일 이름이 다 적혀 있어. 문서에 적힌 참고 그림 주소도 열어서 봐. 주소를 못 열면 나한테 그 파일을 올려 달라고 말해.
종류가 "모형(블렌더)"인 단계는 블렌더로 만들어 줘. 블렌더에 연결이 안 돼 있으면 그렇다고 말하고 스크립트만 줘.
한 단계를 다 만들면 그 단계 문서의 "넘기는 것"대로 묶어 주고, 무엇을 만들었는지 파일 이름과 함께 한 줄씩 적어 줘. 게임 코드는 고치지 않아도 돼. 내가 "다음"이라고 하면 차례표의 다음 단계를 해 줘.
```

---

아래부터는 ChatGPT가 읽는 내용이다.

## 이 게임과 그림의 기준 (처음에 한 번 읽는다)

- '강호행'은 도트 그래픽 무협 RPG다. 화면은 HD-2D: 땅·집·벽·바위는 3D 모형이고, 사람과 작은 소품은 2D 도트 그림을 세운 것이다. 카메라는 남쪽 위에서 북쪽을 비스듬히 내려다본다.
- 배경은 명나라풍과 한복풍을 섞은 가상의 고대 무협이다. 일본풍(기모노, 사무라이, 도리이)이나 서양 판타지(갑옷 기사, 마법진)가 아니다.
- 도트는 각진 도트로 그린다(안티앨리어싱, 블러, 그라데이션, 반투명 없이). 게임에서 사람의 키는 48도트, 3.5등신이고 화면 높이의 8분의 1쯤이다.
- 색: 풍경(돌, 회벽, 기와, 흙, 풀)은 가라앉은 누런 잿빛과 올리브빛이다. 주황이나 붉은 기가 화면을 덮으면 안 된다. 사람과 작은 소품은 또렷한 색(쪽빛, 진홍, 금빛, 흰색)으로 풍경에서 떠 보이게 한다.
- 글자는 어떤 그림에도 넣지 않는다. 현판과 깃발의 글자, 초식 이름은 게임이 얹는다.
- 한 번에 한 단계만 만든다. 단계 문서에 적힌 파일 이름, 크기, 칸 배치를 그대로 지킨다(게임의 도구가 그 이름과 배치로 그림을 읽는다).

**크기의 기준(사람 키를 1로 볼 때).** 같은 갈래의 HD-2D 무협 게임 화면을 재서 정한 비례다. 모형과 소품의 크기는 단계 문서에 점 단위로 적혀 있고, 이 표는 그 바탕이다.

| 무엇 | 사람 키의 몇 배 |
|---|---|
| 방의 뒷벽(바닥에서 들보까지) | 2.7. 문파 본전은 4를 넘는다 |
| 방 안 두리기둥의 굵기 | 0.6 |
| 세로 살창 | 폭 0.7, 높이 1.05. 창턱은 바닥에서 0.8 |
| 단 위에 앉은 조사상 | 단까지 쳐서 2.3 |
| 서 있는 종이 등롱 | 1.25 |
| 벽에 드리운 번(깃발) | 길이 2 |
| 문파의 산문(패루) | 높이 5, 가운데 칸의 폭 2.5~3 |
| 본전 앞마당의 큰 향로 | 2.2 |
| 돌난간 | 0.7 |
| 돌계단 디딤판 하나의 높이 | 0.14 |
| 본전의 기단(월대) | 2.5 |
| 담(기와 덮개까지) | 3 |
| 덤불 | 높이 1~1.5, 폭 1.5~2 |
| 작은 나무, 큰 나무 | 2.5, 4 |
| 마당의 태극 무늬 | 지름 4.8 |

## 차례표

| 차례 | 단계 | 무엇 | 종류 | 만들 것 | 상태 | 문서 |
|---|---|---|---|---|---|---|
| 1 | `act0` | 주인공의 무기별 동작 칸(큰 칼, 창, 봉) | 동작 칸 | 3 | 받음 | https://dltkdwhdhkd-design.github.io/gangho/docs/gpt/act0.md |
| 2 | `fx1` | 검기 1: 초승달 베기, 맞는 번쩍, 큰 반달 | 효과 | 3 | 남음 | https://dltkdwhdhkd-design.github.io/gangho/docs/gpt/fx1.md |
| 3 | `room1` | 방의 벽: 벽 무늬, 아랫단과 들보, 나무 무늬 | 그림 장 | 4 | 일부 받음(남은 것 3) | https://dltkdwhdhkd-design.github.io/gangho/docs/gpt/room1.md |
| 4 | `room2` | 방의 벽: 창과 문, 벽에 거는 것 | 그림 장 | 2 | 남음 | https://dltkdwhdhkd-design.github.io/gangho/docs/gpt/room2.md |
| 5 | `m5` | 모형 M5: 눈에 띄는 것: 문, 정자, 탑, 석등 | 모형(블렌더) | 7 | 남음 | https://dltkdwhdhkd-design.github.io/gangho/docs/gpt/m5.md |
| 6 | `walk01` | 사람 도트 1: 혁련하, 혜공, 사이라 | 도트(걷기) | 3 | 남음 | https://dltkdwhdhkd-design.github.io/gangho/docs/gpt/walk01.md |
| 7 | `walk02` | 사람 도트 2: 갈 선생, 양춘, 구 노창 | 도트(걷기) | 3 | 남음 | https://dltkdwhdhkd-design.github.io/gangho/docs/gpt/walk02.md |
| 8 | `fx2` | 검기 2: 찌르기, 회전 베기, 날아가는 검기 | 효과 | 3 | 남음 | https://dltkdwhdhkd-design.github.io/gangho/docs/gpt/fx2.md |
| 9 | `room3` | 방 안 살림 1: 제단, 도자기와 화분, 불빛 | 그림 장 | 3 | 남음 | https://dltkdwhdhkd-design.github.io/gangho/docs/gpt/room3.md |
| 10 | `m8` | 모형 M8: 큰 가구 3: 본전과 사당에 놓는 것 | 모형(블렌더) | 8 | 남음 | https://dltkdwhdhkd-design.github.io/gangho/docs/gpt/m8.md |
| 11 | `act1` | 적 동작 칸 1: 산적, 거한, 수적, 궁수, 자객 | 동작 칸 | 5 | 남음 | https://dltkdwhdhkd-design.github.io/gangho/docs/gpt/act1.md |
| 12 | `fx3` | 검기 3: 칼 부딪힘, 돌진 잔상, 절초 일자 검기 | 효과 | 3 | 남음 | https://dltkdwhdhkd-design.github.io/gangho/docs/gpt/fx3.md |
| 13 | `room4` | 방 안 살림 2: 앉는 자리, 병기, 가게 물건, 깔개 | 그림 장 | 4 | 남음 | https://dltkdwhdhkd-design.github.io/gangho/docs/gpt/room4.md |
| 14 | `m9` | 모형 M9: 방 벽에 거는 것 | 모형(블렌더) | 6 | 남음 | https://dltkdwhdhkd-design.github.io/gangho/docs/gpt/m9.md |
| 15 | `walk03` | 사람 도트 3: 낭리비어 위충, 광사자 맹호, 패천도 사마웅, 오강 | 도트(걷기) | 4 | 남음 | https://dltkdwhdhkd-design.github.io/gangho/docs/gpt/walk03.md |
| 16 | `walk04` | 사람 도트 4: 구양철, 혈수 막고, 고진, 월천 | 도트(걷기) | 4 | 남음 | https://dltkdwhdhkd-design.github.io/gangho/docs/gpt/walk04.md |
| 17 | `walk05` | 사람 도트 5: 연경추, 남화, 만화부인 | 도트(걷기) | 3 | 남음 | https://dltkdwhdhkd-design.github.io/gangho/docs/gpt/walk05.md |
| 18 | `fx4` | 화산 매화: 남은 넷(꽃잎, 자하 기운, 자하검기, 이름띠 그림) | 효과 | 10 | 일부 받음(남은 것 4) | https://dltkdwhdhkd-design.github.io/gangho/docs/gpt/fx4.md |
| 19 | `yard1` | 문파 터: 돌계단과 난간의 겉, 돌바닥 무늬, 뜰에 놓는 것 | 그림 장 | 3 | 남음 | https://dltkdwhdhkd-design.github.io/gangho/docs/gpt/yard1.md |
| 20 | `m10` | 모형 M10: 뜰과 길가에 놓는 것 | 모형(블렌더) | 8 | 남음 | https://dltkdwhdhkd-design.github.io/gangho/docs/gpt/m10.md |
| 21 | `act2` | 적 동작 칸 2: 정파 제자, 사파 무사, 마교도, 관병, 강시 | 동작 칸 | 5 | 남음 | https://dltkdwhdhkd-design.github.io/gangho/docs/gpt/act2.md |
| 22 | `face1` | 화산귀환 인물 얼굴 1: 청명, 백천, 유이설, 윤종, 조걸, 현종 | 일러스트 | 6 | 남음 | https://dltkdwhdhkd-design.github.io/gangho/docs/gpt/face1.md |
| 23 | `face2` | 화산귀환 인물 얼굴 2: 현영, 현상, 운검, 운암, 운각, 백상 | 일러스트 | 6 | 남음 | https://dltkdwhdhkd-design.github.io/gangho/docs/gpt/face2.md |
| 24 | `ui1` | 화면 틀 1: 창과 단추 틀, 붓자국 띠 | 화면 틀 | 2 | 남음 | https://dltkdwhdhkd-design.github.io/gangho/docs/gpt/ui1.md |
| 25 | `face3` | 화산귀환 인물 얼굴 3: 진금룡, 이송백, 종서한, 고휘, 기목승, 사마승 | 일러스트 | 6 | 남음 | https://dltkdwhdhkd-design.github.io/gangho/docs/gpt/face3.md |
| 26 | `face4` | 화산귀환 인물 얼굴 4: 허도진인, 허원, 허산, 무연, 무진, 진현 | 일러스트 | 6 | 남음 | https://dltkdwhdhkd-design.github.io/gangho/docs/gpt/face4.md |
| 27 | `ui2` | 화면 틀 2: 화면 단추 그림, 머리 위 표식 | 화면 틀 | 2 | 남음 | https://dltkdwhdhkd-design.github.io/gangho/docs/gpt/ui2.md |
| 28 | `act3` | 동료 동작 칸 1: 하후민, 문창, 오월, 당소연, 모용설, 남궁진 | 동작 칸 | 6 | 남음 | https://dltkdwhdhkd-design.github.io/gangho/docs/gpt/act3.md |
| 29 | `face5` | 화산귀환 인물 얼굴 5: 진무, 당소소, 당군악, 당보, 당호, 당화 | 일러스트 | 6 | 남음 | https://dltkdwhdhkd-design.github.io/gangho/docs/gpt/face5.md |
| 30 | `face6` | 화산귀환 인물 얼굴 6: 당잔, 당패, 홍대광, 구칠, 종팔, 위립산 | 일러스트 | 6 | 남음 | https://dltkdwhdhkd-design.github.io/gangho/docs/gpt/face6.md |
| 31 | `face7` | 화산귀환 인물 얼굴 7: 위소행, 염평, 맹소 | 일러스트 | 3 | 남음 | https://dltkdwhdhkd-design.github.io/gangho/docs/gpt/face7.md |
| 32 | `ui3` | 화면 틀 3: 싸움 화면 틀 | 화면 틀 | 1 | 남음 | https://dltkdwhdhkd-design.github.io/gangho/docs/gpt/ui3.md |
| 33 | `roof1` | 지붕: 문파 지붕 무늬, 지붕 장식과 현판 | 그림 장 | 2 | 남음 | https://dltkdwhdhkd-design.github.io/gangho/docs/gpt/roof1.md |
| 34 | `m6` | 모형 M6: 장터와 나루 | 모형(블렌더) | 6 | 남음 | https://dltkdwhdhkd-design.github.io/gangho/docs/gpt/m6.md |
| 35 | `walk06` | 사람 도트 6: 곽 아주머니, 백 노인, 촌장 어른, 대장장이 강씨 | 도트(걷기) | 4 | 남음 | https://dltkdwhdhkd-design.github.io/gangho/docs/gpt/walk06.md |
| 36 | `walk07` | 사람 도트 7: 윤 의원, 뱃사공 노씨, 사냥꾼 호씨, 복덕방 영감 | 도트(걷기) | 4 | 남음 | https://dltkdwhdhkd-design.github.io/gangho/docs/gpt/walk07.md |
| 37 | `walk08` | 사람 도트 8: 만물상 주인, 객잔 주인, 마을 사람, 마을 아낙 | 도트(걷기) | 4 | 남음 | https://dltkdwhdhkd-design.github.io/gangho/docs/gpt/walk08.md |
| 38 | `m7` | 모형 M7: 나무 (시험 삼아 한 그루) | 모형(블렌더) | 1 | 남음 | https://dltkdwhdhkd-design.github.io/gangho/docs/gpt/m7.md |
| 39 | `act4` | 동료 동작 칸 2: 혁련하, 혜공, 사이라, 갈 선생, 양춘, 구 노창 | 동작 칸 | 6 | 남음 | https://dltkdwhdhkd-design.github.io/gangho/docs/gpt/act4.md |
| 40 | `icon1` | 아이콘 1: 무기 스물 | 아이콘 | 1 | 남음 | https://dltkdwhdhkd-design.github.io/gangho/docs/gpt/icon1.md |
| 41 | `walk09` | 사람 도트 9: 동네 꼬마, 개방 거지, 창운문 제자, 꽃 파는 노파 | 도트(걷기) | 4 | 남음 | https://dltkdwhdhkd-design.github.io/gangho/docs/gpt/walk09.md |
| 42 | `walk10` | 사람 도트 10: 떠돌이 비무객, 순이네, 순이 아버지 | 도트(걷기) | 3 | 남음 | https://dltkdwhdhkd-design.github.io/gangho/docs/gpt/walk10.md |
| 43 | `rock1` | 산길: 바위 무늬, 산길에 놓는 것 | 그림 장 | 2 | 남음 | https://dltkdwhdhkd-design.github.io/gangho/docs/gpt/rock1.md |
| 44 | `tree1` | 나무: 껍질과 잎 무늬, 잎 뭉치 | 그림 장 | 2 | 남음 | https://dltkdwhdhkd-design.github.io/gangho/docs/gpt/tree1.md |
| 45 | `m11` | 모형 M11: 나무 다섯 | 모형(블렌더) | 5 | 남음 | https://dltkdwhdhkd-design.github.io/gangho/docs/gpt/m11.md |
| 46 | `act5` | 맞서는 사람 동작 칸 1: 낭리비어 위충, 광사자 맹호, 패천도 사마웅, 오강, 구양철, 혈수 막고 | 동작 칸 | 6 | 남음 | https://dltkdwhdhkd-design.github.io/gangho/docs/gpt/act5.md |
| 47 | `m12` | 모형 M12: 덤불과 풀 | 모형(블렌더) | 5 | 남음 | https://dltkdwhdhkd-design.github.io/gangho/docs/gpt/m12.md |
| 48 | `land1` | 바깥 땅: 땅 무늬 여섯, 풀과 꽃 포기 | 그림 장 | 2 | 남음 | https://dltkdwhdhkd-design.github.io/gangho/docs/gpt/land1.md |
| 49 | `far1` | 먼 곳: 먼 산 띠 셋 | 그림 장 | 1 | 남음 | https://dltkdwhdhkd-design.github.io/gangho/docs/gpt/far1.md |
| 50 | `act6` | 맞서는 사람 동작 칸 2: 고진, 월천, 연경추, 남화, 만화부인 | 동작 칸 | 5 | 남음 | https://dltkdwhdhkd-design.github.io/gangho/docs/gpt/act6.md |
| 51 | `m13` | 모형 M13: 눈에 띄는 것 2: 다리, 누각, 종각, 돌사자, 비무대 | 모형(블렌더) | 5 | 남음 | https://dltkdwhdhkd-design.github.io/gangho/docs/gpt/m13.md |
| 52 | `icon2` | 아이콘 2: 옷 서른다섯(윗옷, 아래옷, 신발, 머리) | 아이콘 | 2 | 남음 | https://dltkdwhdhkd-design.github.io/gangho/docs/gpt/icon2.md |
| 53 | `icon3` | 아이콘 3: 초식 열여섯 | 아이콘 | 1 | 남음 | https://dltkdwhdhkd-design.github.io/gangho/docs/gpt/icon3.md |
| 54 | `icon4` | 아이콘 4: 초식 스물여덟 | 아이콘 | 2 | 남음 | https://dltkdwhdhkd-design.github.io/gangho/docs/gpt/icon4.md |
| 55 | `new01` | 새 사람 1: 장팔, 왕충, 석두 | 일러스트와 도트 | 6 | 남음 | https://dltkdwhdhkd-design.github.io/gangho/docs/gpt/new01.md |
| 56 | `new02` | 새 사람 2: 운청, 화산 검수, 노예상 | 일러스트와 도트 | 6 | 남음 | https://dltkdwhdhkd-design.github.io/gangho/docs/gpt/new02.md |
| 57 | `new03` | 새 사람 3: 노예상 부하, 물주, 도박장 주인 | 일러스트와 도트 | 6 | 남음 | https://dltkdwhdhkd-design.github.io/gangho/docs/gpt/new03.md |
| 58 | `new04` | 새 사람 4: 도박장 덩치, 호객꾼, 취객 | 일러스트와 도트 | 6 | 남음 | https://dltkdwhdhkd-design.github.io/gangho/docs/gpt/new04.md |
| 59 | `new05` | 새 사람 5: 노름꾼·골목 건달, 아전, 순라군 | 일러스트와 도트 | 6 | 남음 | https://dltkdwhdhkd-design.github.io/gangho/docs/gpt/new05.md |
| 60 | `new06` | 새 사람 6: 숙수, 점소이, 전각지기·사당지기 | 일러스트와 도트 | 6 | 남음 | https://dltkdwhdhkd-design.github.io/gangho/docs/gpt/new06.md |
| 61 | `new07` | 새 사람 7: 이야기꾼, 재주꾼, 떡장수 | 일러스트와 도트 | 6 | 남음 | https://dltkdwhdhkd-design.github.io/gangho/docs/gpt/new07.md |
| 62 | `new08` | 새 사람 8: 구경꾼, 할멈·나물 파는 할머니, 포목전·잡화 상인 | 일러스트와 도트 | 6 | 남음 | https://dltkdwhdhkd-design.github.io/gangho/docs/gpt/new08.md |
| 63 | `new09` | 새 사람 9: 비단 장수·포목점 안주인, 찻집 주인, 무관 문하생 | 일러스트와 도트 | 6 | 남음 | https://dltkdwhdhkd-design.github.io/gangho/docs/gpt/new09.md |
| 64 | `new10` | 새 사람 10: 늙은 표사, 과거 준비생·책방 서생, 짐꾼·부두 일꾼 | 일러스트와 도트 | 6 | 남음 | https://dltkdwhdhkd-design.github.io/gangho/docs/gpt/new10.md |
| 65 | `new11` | 새 사람 11: 탁발승, 떠돌이 약장수, 어부 | 일러스트와 도트 | 6 | 남음 | https://dltkdwhdhkd-design.github.io/gangho/docs/gpt/new11.md |
| 66 | `new12` | 새 사람 12: 어부의 아들, 서생, 약초꾼 | 일러스트와 도트 | 6 | 남음 | https://dltkdwhdhkd-design.github.io/gangho/docs/gpt/new12.md |
| 67 | `new13` | 새 사람 13: 무관 낙제생, 악사, 대장간 도제 | 일러스트와 도트 | 6 | 남음 | https://dltkdwhdhkd-design.github.io/gangho/docs/gpt/new13.md |
| 68 | `new14` | 새 사람 14: 사냥꾼, 농사꾼, 춤꾼 | 일러스트와 도트 | 6 | 남음 | https://dltkdwhdhkd-design.github.io/gangho/docs/gpt/new14.md |
| 69 | `new15` | 새 사람 15: 떠돌이 무사, 역참 마부, 행상 | 일러스트와 도트 | 6 | 남음 | https://dltkdwhdhkd-design.github.io/gangho/docs/gpt/new15.md |
| 70 | `new16` | 새 사람 16: 순례자, 문파 전령, 입문 지망생 아이 | 일러스트와 도트 | 6 | 남음 | https://dltkdwhdhkd-design.github.io/gangho/docs/gpt/new16.md |
| 71 | `new17` | 새 사람 17: 떠돌이 의원, 농부, 남궁세가 장로 남궁위 | 일러스트와 도트 | 6 | 남음 | https://dltkdwhdhkd-design.github.io/gangho/docs/gpt/new17.md |
| 72 | `new18` | 새 사람 18: 제갈세가 군량관, 하북팽가 토벌대장 팽호 | 일러스트와 도트 | 4 | 남음 | https://dltkdwhdhkd-design.github.io/gangho/docs/gpt/new18.md |
| 73 | `walk11` | 사람 도트 11: 혜각 대사, 청허 도장, 매향, 정혜 사태 | 도트(걷기) | 4 | 남음 | https://dltkdwhdhkd-design.github.io/gangho/docs/gpt/walk11.md |
| 74 | `walk12` | 사람 도트 12: 설봉자, 막철심, 섭일, 진다명 | 도트(걷기) | 4 | 남음 | https://dltkdwhdhkd-design.github.io/gangho/docs/gpt/walk12.md |
| 75 | `walk13` | 사람 도트 13: 서문각, 홍두 장로, 제갈현, 팽대악 | 도트(걷기) | 4 | 남음 | https://dltkdwhdhkd-design.github.io/gangho/docs/gpt/walk13.md |
| 76 | `walk14` | 사람 도트 14: 황보웅, 진태석, 악정산, 양 태군 | 도트(걷기) | 4 | 남음 | https://dltkdwhdhkd-design.github.io/gangho/docs/gpt/walk14.md |
| 77 | `walk15` | 사람 도트 15: 언창호, 장양 진인, 허정자, 무량 법사 | 도트(걷기) | 4 | 남음 | https://dltkdwhdhkd-design.github.io/gangho/docs/gpt/walk15.md |
| 78 | `walk16` | 사람 도트 16: 임해조, 고산옥, 박무산, 설한연 | 도트(걷기) | 4 | 남음 | https://dltkdwhdhkd-design.github.io/gangho/docs/gpt/walk16.md |
| 79 | `walk17` | 사람 도트 17: 금강 법왕, 자운 사태 | 도트(걷기) | 2 | 남음 | https://dltkdwhdhkd-design.github.io/gangho/docs/gpt/walk17.md |
| 80 | `cg01` | 장면 그림 1: 잿더미, 견대, 빈 골짜기, 청하진 | 장면 그림 | 4 | 받음 | https://dltkdwhdhkd-design.github.io/gangho/docs/gpt/cg01.md |
| 81 | `cg02` | 장면 그림 2: 떨어진 국자, 그믐밤, 마흔아홉 개의 위패, 창운문 | 장면 그림 | 4 | 일부 받음(남은 것 3) | https://dltkdwhdhkd-design.github.io/gangho/docs/gpt/cg02.md |
| 82 | `cg03` | 장면 그림 3: 장서각의 밤, 장경각, 벼랑 아래, 천하비무 결승 | 장면 그림 | 4 | 남음 | https://dltkdwhdhkd-design.github.io/gangho/docs/gpt/cg03.md |
| 83 | `cg04` | 장면 그림 4: 연회, 네 개의 손, 창고 밑, 구파 회관의 밤 | 장면 그림 | 4 | 남음 | https://dltkdwhdhkd-design.github.io/gangho/docs/gpt/cg04.md |
| 84 | `cg05` | 장면 그림 5: 열두 깃발, 불타는 구화성, 강을 건너는 사람들, 갈라진 가면 | 장면 그림 | 4 | 남음 | https://dltkdwhdhkd-design.github.io/gangho/docs/gpt/cg05.md |
| 85 | `cg06` | 장면 그림 6: 달이 뜨면, 붉은 달, 혈우, 합석 | 장면 그림 | 4 | 남음 | https://dltkdwhdhkd-design.github.io/gangho/docs/gpt/cg06.md |
| 86 | `cg07` | 장면 그림 7: 소림의 문, 구화성 탈환, 비단길, 빈 칼집 | 장면 그림 | 4 | 남음 | https://dltkdwhdhkd-design.github.io/gangho/docs/gpt/cg07.md |
| 87 | `cg08` | 장면 그림 8: 돌아온 사람, 방값, 심마, 천마 | 장면 그림 | 4 | 남음 | https://dltkdwhdhkd-design.github.io/gangho/docs/gpt/cg08.md |
| 88 | `cg09` | 장면 그림 9: 걸레질, 서문, 달맞이 객잔, 패천도 | 장면 그림 | 4 | 남음 | https://dltkdwhdhkd-design.github.io/gangho/docs/gpt/cg09.md |
| 89 | `cg10` | 장면 그림 10: 형, 낙월, 국수 한 그릇, 달밤 | 장면 그림 | 4 | 남음 | https://dltkdwhdhkd-design.github.io/gangho/docs/gpt/cg10.md |
| 90 | `cg11` | 장면 그림 11: 이름 새긴 찻잔, 배고파, 천 번, 손가락 한 마디 | 장면 그림 | 4 | 남음 | https://dltkdwhdhkd-design.github.io/gangho/docs/gpt/cg11.md |
| 91 | `cg12` | 장면 그림 12: 서툰 웃음, 주먹밥 세 개, 혼례, 만석 | 장면 그림 | 4 | 남음 | https://dltkdwhdhkd-design.github.io/gangho/docs/gpt/cg12.md |
| 92 | `cg13` | 장면 그림 13: 점소이, 빈 상, 두 그릇, 맹주 | 장면 그림 | 4 | 남음 | https://dltkdwhdhkd-design.github.io/gangho/docs/gpt/cg13.md |
| 93 | `cg14` | 장면 그림 14: 산채의 큰 칼, 문을 잠근 교주, 합석 어른, 문지기 | 장면 그림 | 4 | 남음 | https://dltkdwhdhkd-design.github.io/gangho/docs/gpt/cg14.md |
| 94 | `cg15` | 장면 그림 15: 그믐의 낭인, 번호 없는 사람, 붉은 달, 다시, 달맞이 객잔 | 장면 그림 | 4 | 남음 | https://dltkdwhdhkd-design.github.io/gangho/docs/gpt/cg15.md |
| 95 | `cg16` | 장면 그림 16: 강호의 절반, 붉은 제단, 다시 길 위에서, 달이 진 뒤 | 장면 그림 | 4 | 받음 | https://dltkdwhdhkd-design.github.io/gangho/docs/gpt/cg16.md |

## 종류마다 넘기는 것

| 종류 | 파일 | Claude가 넣는 방법 |
|---|---|---|
| 도트(걷기) | `<키>-walk.png` (2:1, 4열 3행, 마젠타 바탕) | `python3 tools/people_in.py <키>` |
| 일러스트 | `<키>_n.png` (1024×1536) | `assets/art/`에 넣고 `list.json`에 이름을 적는다 |
| 동작 칸 | `<키>-c.png` (2400×320, 여섯 칸) | `python3 tools/people_in.py <키>` |
| 효과 | `<이름>.png` (초록 바탕) | `python3 tools/fx_in.py <이름>` |
| 그림 장 | `<이름>.png` (파랑 바탕) | `python3 tools/wall_in.py`와 소품 자르기 |
| 모형(블렌더) | `gangho_m<번호>.zip`과 `gangho_m<번호>.py` | `python3 tools/blender/gpt.py check <zip> --install` |
| 화면 틀, 아이콘 | `<이름>.png` (초록 바탕) | 칸을 잘라 `assets/hd/ui/`, `assets/hd/icon/`에 |
| 장면 그림 | `cg_<이름>.png` (16:9) | `assets/art/`에 넣고 `list.json`에 이름을 적는다 |

받은 파일은 이름 그대로 저장소 `art-src/chatgpt/`에 둔다(모형 스크립트는 `art-src/blender/`).
