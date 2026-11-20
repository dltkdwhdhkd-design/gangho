# 강호행 요청 9: 방 안 살림 1: 제단, 도자기와 화분, 불빛

단계 이름 `room3` · 종류: 그림 장 · 차례표: https://dltkdwhdhkd-design.github.io/gangho/docs/gpt/index.md

본전과 사당, 객잔을 채울 작은 살림이다. 그림 그대로 바닥이나 가구 위에 세운다. 이런 게임의 방은 한 화면에 살림이 스무 개 넘게 있는데 우리 방은 여섯에서 열두 개다.

**이 단계에서 만들 것: 3개**

## 규칙

- 한 장에 항목에 적힌 칸 수만큼. 앞서 그린 장과 도트 굵기, 색감, 칸 배치를 이어 간다.
- 그림 속에 글자, 번호, 서명, 워터마크, 테두리를 넣지 않는다. **현판, 족자, 문양판, 비석도 글자 없이 빈 채로**(글자는 게임이 얹는다).
- 배경은 단색 파랑(#0000FF). 그림 안에는 그 파랑을 쓰지 않는다. 칸 사이를 넓게 띄우고 서로 닿지 않게.
- 안티앨리어싱, 블러, 그라데이션, 반투명 없이 각진 도트로. 빛은 왼쪽 위에서.
- 명나라풍 무협. 일본풍이나 서양 판타지가 아니다.
- 보는 각도는 항목마다 적혀 있다. 바닥에 놓는 물건은 "비스듬히 위에서", 벽에 붙는 것은 "정면".
- **무늬 장(제목에 "이어 붙는"이 있는 것)은 위 규칙 가운데 둘을 따르지 않는다.** 물건이 아니라 겉면에 되풀이해 입히는 무늬라서, 빛 방향과 그림자가 없어야 하고(고르게 밝게), 칸을 가장자리까지 꽉 채운다(칸 사이는 가는 파란 줄만). 옆 칸과 이어 붙였을 때 금이 보이면 안 된다.
- 색은 가라앉은 누런 잿빛과 올리브빛으로. 돌과 회벽과 흙에 주황이나 붉은 기가 돌면 안 된다(게임의 햇빛이 따뜻한 빛을 더한다).

## 참고 그림 (모두 열어 볼 것)

- 이미 받은 벽·지붕·소품(도트 굵기와 색, 무늬 칸의 배치를 이 그림에 맞춘다): https://dltkdwhdhkd-design.github.io/gangho/art-src/ref-walls.png
- 이미 받은 방 바닥 무늬(무늬 장의 본보기): https://dltkdwhdhkd-design.github.io/gangho/art-src/chatgpt/FL1.png

주소를 못 열면 주인에게 그 파일을 올려 달라고 말한다.

## 만들 것

### 1. `IN2.png` — 제단과 예식 물건 여섯 (비스듬히 위에서, 3열 2행)

본전과 사당의 북쪽 벽 앞에 놓는다. 그림 그대로 바닥이나 가구 위에 세운다.

```text
Sprite sheet for a pixel-art wuxia RPG, 3 columns x 2 rows, exactly the pixel size, outline and palette of the reference image, solid flat pure blue #0000FF background, wide gaps, nothing touching. Altar furniture of a Ming-dynasty hall seen from a high three-quarter top-down view: 1) a long red-lacquered altar table with carved apron, empty top, 2) a pair of tall brass candlesticks with lit red candles and small flames, 3) a three-legged bronze incense burner with a thin line of smoke, 4) a set of three small offering bowls with fruit and buns on a tray, 5) a wooden ancestral tablet on a stepped stand, the tablet face left empty, 6) two square golden-yellow kneeling cushions. Crisp chunky pixels, no anti-aliasing, no text.
```

### 2. `IN3.png` — 도자기와 화분 여섯 (비스듬히 위에서, 3열 2행)

방 구석과 탁자 옆에 놓는다.

```text
Sprite sheet for a pixel-art wuxia RPG, 3 columns x 2 rows, exactly the pixel size, outline and palette of the reference image, solid flat pure blue #0000FF background, wide gaps, nothing touching. Seen from a high three-quarter top-down view: 1) a tall blue-and-white porcelain floor vase, 2) a small blue-and-white porcelain jar with a lid, 3) a bonsai pine in a shallow rectangular pot on a low wooden stand, 4) a potted orchid on a tall slender flower stand, 5) a large dark glazed storage jar with a cloth-covered mouth, 6) a celadon vase holding a branch of plum blossoms. Crisp chunky pixels, no anti-aliasing, no text.
```

### 3. `IN9.png` — 방 안 불빛 여섯 (비스듬히 위에서, 3열 2행)

방을 밝히는 것들. 게임이 그 자리에 불빛을 켠다.

```text
Sprite sheet for a pixel-art wuxia RPG, 3 columns x 2 rows, exactly the pixel size, outline and palette of the reference image, solid flat pure blue #0000FF background, wide gaps, nothing touching. Indoor lights seen from a high three-quarter top-down view, each one lit: 1) a tall standing palace lantern on a carved wooden pole stand, 2) a single brass candlestick with a lit candle for a table, 3) a red paper lantern hanging from a short ceiling cord, 4) a bronze charcoal brazier with glowing embers, 5) a small oil lamp on a saucer, 6) a wall bracket holding a lit torch. Crisp chunky pixels, no anti-aliasing, no text.
```

## 스스로 확인

- 칸 수와 열·행이 항목대로인가
- 글자가 한 자도 없는가
- 무늬 장은 칸을 꽉 채웠고 네 변이 이어 붙는가. 그림자가 없는가
- 바탕(칸 사이)이 단색 파랑인가

## 넘기는 것

- 위의 파일 이름 그대로 넣은 압축 파일 하나: `gangho_room3.zip`. 원본 크기의 PNG로(줄이거나 잘라 내지 않는다).
- 압축 파일을 만들 수 없으면 그림을 대화에 그대로 올리고, 그림마다 파일 이름을 한 줄씩 적는다.
- 게임 코드는 고치지 않는다. 넣는 일은 Claude가 한다.

---

다음 단계: 10번 `m8` 모형 M8: 큰 가구 3: 본전과 사당에 놓는 것 — https://dltkdwhdhkd-design.github.io/gangho/docs/gpt/m8.md
