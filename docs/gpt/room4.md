# 강호행 요청 13: 방 안 살림 2: 앉는 자리, 병기, 가게 물건, 깔개

단계 이름 `room4` · 종류: 그림 장 · 차례표: https://dltkdwhdhkd-design.github.io/gangho/docs/gpt/index.md

무관·가게·살림집을 채울 것들이다.

**이 단계에서 만들 것: 4개**

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

### 1. `IN4.png` — 앉는 자리 여섯 (비스듬히 위에서, 3열 2행)

살림집과 찻집, 장로의 방에 놓는다.

```text
Sprite sheet for a pixel-art wuxia RPG, 3 columns x 2 rows, exactly the pixel size, outline and palette of the reference image, solid flat pure blue #0000FF background, wide gaps, nothing touching. Ming-dynasty hardwood furniture seen from a high three-quarter top-down view: 1) a master's armchair (taishi chair) facing the viewer, dark rosewood with a red seat cushion, 2) the same armchair seen from the side, 3) a small square tea table with a teapot and two cups, 4) a low rectangular kang table, 5) a round drum stool, 6) a four-panel folding screen painted with a misty mountain landscape. Crisp chunky pixels, no anti-aliasing, no text.
```

### 2. `IN5.png` — 병기와 수련 도구 여섯 (비스듬히 위에서, 3열 2행)

무관과 연무장에 놓는다.

```text
Sprite sheet for a pixel-art wuxia RPG, 3 columns x 2 rows, exactly the pixel size, outline and palette of the reference image, solid flat pure blue #0000FF background, wide gaps, nothing touching. Training hall equipment seen from a high three-quarter top-down view: 1) a wooden weapon rack holding five spears and halberds upright, 2) a low sword rack holding three swords in scabbards horizontally, 3) a staff rack with six wooden staves, 4) a wooden training dummy with three arms on a heavy base, 5) a round straw archery target on a tripod, 6) a pair of stone lock weights and a stone drum for strength training. Crisp chunky pixels, no anti-aliasing, no text.
```

### 3. `IN6.png` — 가게 물건 여섯 (비스듬히 위에서, 3열 2행)

가게와 약방, 서고에 놓는다.

```text
Sprite sheet for a pixel-art wuxia RPG, 3 columns x 2 rows, exactly the pixel size, outline and palette of the reference image, solid flat pure blue #0000FF background, wide gaps, nothing touching. Shop furnishings of a Ming-dynasty town seen from a high three-quarter top-down view: 1) a shelf unit stacked with rolled bolts of colored cloth, 2) a tall herbal medicine cabinet with many small drawers and brass pulls, 3) a shelf unit of bowls, plates and teapots, 4) a pile of thread-bound books and scroll tubes, 5) a shop counter with an abacus and a hanging scale, 6) a stack of wooden crates and a roped chest. Crisp chunky pixels, no anti-aliasing, no text.
```

### 4. `IN7.png` — 바닥 깔개 여섯 (바로 위에서 내려다본 그림, 3열 2행)

바닥에 납작하게 깔린다. 그림자와 두께가 없어야 한다.

```text
Flat floor covering sheet for a pixel-art wuxia RPG, 3 columns x 2 rows, exactly the pixel size and palette of the reference image, solid flat pure blue #0000FF background, wide gaps, nothing touching. Every item is seen straight from above (pure top view), completely flat, no shadow, no thickness: 1) a long red runner carpet with gold border pattern, about 4 times longer than wide, 2) a round rug with a blue-and-cream cloud pattern, 3) a rectangular woven straw mat, 4) three round rush kneeling mats in a row, 5) a square dark blue rug with a simple geometric border, 6) a rolled-out bamboo slat mat. Crisp chunky pixels, no anti-aliasing, no text.
```

## 스스로 확인

- 칸 수와 열·행이 항목대로인가
- 글자가 한 자도 없는가
- 무늬 장은 칸을 꽉 채웠고 네 변이 이어 붙는가. 그림자가 없는가
- 바탕(칸 사이)이 단색 파랑인가

## 넘기는 것

- 위의 파일 이름 그대로 넣은 압축 파일 하나: `gangho_room4.zip`. 원본 크기의 PNG로(줄이거나 잘라 내지 않는다).
- 압축 파일을 만들 수 없으면 그림을 대화에 그대로 올리고, 그림마다 파일 이름을 한 줄씩 적는다.
- 게임 코드는 고치지 않는다. 넣는 일은 Claude가 한다.

---

다음 단계: 14번 `m9` 모형 M9: 방 벽에 거는 것 — https://dltkdwhdhkd-design.github.io/gangho/docs/gpt/m9.md
