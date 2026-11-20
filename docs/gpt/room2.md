# 강호행 요청 4: 방의 벽: 창과 문, 벽에 거는 것

단계 이름 `room2` · 종류: 그림 장 · 차례표: https://dltkdwhdhkd-design.github.io/gangho/docs/gpt/index.md

벽에 박는 창과 문, 뒷벽에 거는 문양판·현판·족자·검이다. 지금 창은 한 가지뿐이고 벽에 건 것이 거의 없다.

**이 단계에서 만들 것: 2개**

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

### 1. `IN8.png` — 창과 문 여섯 (정면, 벽에 붙는 무늬, 3열 2행)

블렌더로 세운 벽에 그대로 박는다. 창은 세로로 긴 네모(가로 2 : 세로 3쯤. 폭이 사람 키의 0.7, 높이가 1.05)이고 종이 뒤에서 빛이 비친다. 밤에는 게임이 이 창을 더 밝힌다.

```text
Sprite sheet for a pixel-art wuxia RPG, 3 columns x 2 rows, exactly the pixel size, outline and palette of the temple wall sheets in the reference image, solid flat pure blue #0000FF background, wide gaps, nothing touching. Windows and doors of a Ming-dynasty building, front orthographic view, no perspective, each with warm light glowing through pale paper: 1) a tall rectangular lattice window, about 2 wide to 3 tall, with a simple square grid, 2) the same tall window with a bamboo blind rolled halfway down over its upper half, 3) a round moon window with a cracked-ice lattice, 4) a pair of tall door panels with flower-pattern lattice on the upper half, 5) a wide window made of four narrow lattice panels, 6) a small high paper window propped open with a stick. Dark red-brown wooden frames. Crisp chunky pixels, no anti-aliasing, no text.
```

### 2. `IN1.png` — 벽 장식 여섯 (정면, 3열 2행)

방 뒷벽에 거는 것. 블렌더로 세운 벽에 붙인다. 글자는 넣지 않는다(둥근 문양판의 '武' 같은 글자는 게임이 문파마다 다르게 얹는다).

```text
Sprite sheet for a pixel-art wuxia RPG, 3 columns x 2 rows, exactly the pixel size, outline and palette of the reference image, solid flat pure blue #0000FF background, wide gaps, nothing touching. Wall-mounted decorations of a Ming-dynasty martial arts hall, front orthographic view, no perspective, no writing anywhere: 1) a large round wall disc: a pale paper circle inside a dark carved wooden ring frame, the circle left empty, 2) a long horizontal wooden plaque board with a carved gold-trim frame, the board left empty, 3) a hanging scroll with an ink landscape painting (mountains and a pine), 4) a hanging scroll with only a few abstract ink brush strokes (not readable characters), 5) a pair of tall narrow hanging couplet boards, dark wood, left empty, 6) a straight sword in a scabbard hung diagonally on two wall hooks with a red tassel. Crisp chunky pixels, no anti-aliasing, no text.
```

## 스스로 확인

- 칸 수와 열·행이 항목대로인가
- 글자가 한 자도 없는가
- 무늬 장은 칸을 꽉 채웠고 네 변이 이어 붙는가. 그림자가 없는가
- 바탕(칸 사이)이 단색 파랑인가

## 넘기는 것

- 위의 파일 이름 그대로 넣은 압축 파일 하나: `gangho_room2.zip`. 원본 크기의 PNG로(줄이거나 잘라 내지 않는다).
- 압축 파일을 만들 수 없으면 그림을 대화에 그대로 올리고, 그림마다 파일 이름을 한 줄씩 적는다.
- 게임 코드는 고치지 않는다. 넣는 일은 Claude가 한다.

---

다음 단계: 5번 `m5` 모형 M5: 눈에 띄는 것: 문, 정자, 탑, 석등 — https://dltkdwhdhkd-design.github.io/gangho/docs/gpt/m5.md
