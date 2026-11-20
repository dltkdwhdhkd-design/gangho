# 강호행 요청 3: 방의 벽: 벽 무늬, 아랫단과 들보, 나무 무늬

단계 이름 `room1` · 종류: 그림 장 · 차례표: https://dltkdwhdhkd-design.github.io/gangho/docs/gpt/index.md

방의 벽과 기둥은 블렌더 조각으로 서 있는데 겉무늬가 임시다. 이 세 장을 받으면 벽이 회벽·판자·벽돌·흙벽으로, 기둥과 가구가 제 나뭇결로 바뀐다. 방 바닥 무늬(FL1)는 받아서 깔았다.

**이 단계에서 만들 것: 3개** (이미 받은 1개는 아래에 '받음'으로 적혀 있다. 다시 만들지 않는다.)

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

### 1. `WL1.png` — 방 벽 무늬 여섯 (정면, 이어 붙는 정사각형, 3열 2행)

벽의 넓은 면에 되풀이해 입힌다. 창도 기둥도 그리지 않는다(따로 붙인다).

```text
Seamless wall texture sheet in exactly the same layout, pixel size and pixel-art style as the square texture swatches (roof tiles, wooden planks, cracked earth) in the reference image: 6 square swatches in 3 columns x 2 rows separated by thin solid pure blue #0000FF lines. Interior wall surfaces of Ming-dynasty buildings, flat front view, no perspective, no cast shadows, even lighting, no windows, no posts, no objects. Each swatch is filled edge to edge and must tile seamlessly left-right and top-bottom: 1) rough beige-grey lime plaster with a coarse grainy surface and faint darker stains, the same plaster as the house walls in the reference image, 2) smooth cream-white plaster with a few hairline cracks, 3) dark brown vertical wooden plank wall with visible grain and narrow dark gaps between planks, 4) grey fired-brick wall in regular courses with thin pale mortar lines, 5) yellow-brown rammed-earth wall with straw flecks and small pebbles, 6) dark blue-grey dressed stone block wall, large blocks, slightly damp. Muted, slightly dark colours. Crisp chunky pixels, no anti-aliasing, no text.
```

### 2. `WL2.png` — 벽의 아랫단과 들보 여섯 (정면, 옆으로 이어 붙는 긴 띠, 1열 6행)

벽 맨 아래에 두르는 단(1~3)과 벽 맨 위에 얹는 들보(4~6)다. 옆으로만 이어 붙는다.

```text
Horizontal strip texture sheet for a pixel-art wuxia RPG, in exactly the same pixel size and pixel-art style as the wall sheets in the reference image: 6 long horizontal strips stacked in 1 column x 6 rows on a solid flat pure blue #0000FF background, with a blue gap between strips. Flat front view, no perspective, no cast shadows, even lighting. Every strip is about 8 times wider than tall, its left and right ends are cut straight, and it must tile seamlessly left to right: 1) wall base course of rough grey fieldstones set in mortar, like the stone base of the house walls in the reference image, 2) wall base course of large dressed grey stone blocks, 3) dark brown wooden wainscot made of framed panels, 4) plain dark brown wooden beam with visible grain and a few iron nail heads, 5) red-lacquered beam with a thin gold line along its top and bottom edges, 6) painted temple beam: blue-green ground with a repeating gold cloud-scroll pattern, Ming style. Crisp chunky pixels, no anti-aliasing, no text.
```

### 3. `WL3.png` — 기둥과 가구의 나무 무늬 여섯 (정면, 이어 붙는 정사각형, 3열 2행)

기둥, 문틀, 탁자와 선반 같은 나무 모형의 겉에 입힌다.

```text
Seamless material texture sheet in exactly the same layout, pixel size and pixel-art style as the square texture swatches (roof tiles, wooden planks, cracked earth) in the reference image: 6 square swatches in 3 columns x 2 rows separated by thin solid pure blue #0000FF lines. Flat front view, no perspective, no cast shadows, even lighting, no objects. Each swatch is filled edge to edge and must tile seamlessly left-right and top-bottom: 1) dark brown hardwood with vertical grain, for posts and furniture, 2) worn red-lacquered wood with vertical grain and a few small chips, 3) pale unpainted pine with vertical grain and a few knots, 4) black lacquered wood with faint grain, 5) bamboo poles standing side by side, with nodes, 6) off-white rice paper with a faint fibre texture, for window panes and lanterns. Crisp chunky pixels, no anti-aliasing, no text.
```

### 4. `FL1.png` — 방 바닥 무늬 여섯 (바로 위에서, 이어 붙는 정사각형, 3열 2행) — **받음**

받아서 게임에 넣었다. 다시 만들지 않는다.

## 스스로 확인

- 칸 수와 열·행이 항목대로인가
- 글자가 한 자도 없는가
- 무늬 장은 칸을 꽉 채웠고 네 변이 이어 붙는가. 그림자가 없는가
- 바탕(칸 사이)이 단색 파랑인가

## 넘기는 것

- 위의 파일 이름 그대로 넣은 압축 파일 하나: `gangho_room1.zip`. 원본 크기의 PNG로(줄이거나 잘라 내지 않는다).
- 압축 파일을 만들 수 없으면 그림을 대화에 그대로 올리고, 그림마다 파일 이름을 한 줄씩 적는다.
- 게임 코드는 고치지 않는다. 넣는 일은 Claude가 한다.

---

다음 단계: 4번 `room2` 방의 벽: 창과 문, 벽에 거는 것 — https://dltkdwhdhkd-design.github.io/gangho/docs/gpt/room2.md
