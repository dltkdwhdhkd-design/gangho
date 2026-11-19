# ChatGPT 요청문: 방 안 꾸밈, 돌계단과 난간, 절벽

방 안을 채울 소품(벽 장식, 제단, 도자기, 병기 걸이, 깔개, 창, 등), 문파 안의 돌계단·난간·기단, 산길의 절벽과 바위를 받는 문서다. 사람 그림은 `docs/chatgpt-people.md`, 건물 벽과 지붕은 `docs/chatgpt-now.md`에 따로 있다. Claude가 계속 고친다(새로 필요한 것은 아래에 붙는다. 받은 항목은 주인이 말할 때까지 지우지 않는다).

## ChatGPT에게 처음 하는 말

**방법 1 (주소)**: 새 대화에 아래를 붙인다. 다음부터는 "다음"이라고만 하면 된다.

```text
아래 주소의 문서를 읽어 줘. 내 게임 '강호행'에 들어갈 그림 요청문이야.
https://dltkdwhdhkd-design.github.io/gangho/docs/chatgpt-scene.md
문서의 "규칙"을 지키고, "받을 차례"의 맨 위 항목부터 한 장씩 그려 줘. 한 메시지에 한 장만. 내가 "다음"이라고 하면 다음 항목을 그려. 참고 그림은 https://dltkdwhdhkd-design.github.io/gangho/art-src/ref-walls.png 이야. 열어서 도트 굵기·색·칸 배치를 맞춰. 절벽(HK4, HK5)을 그릴 때는 전에 그린 절벽 https://dltkdwhdhkd-design.github.io/gangho/art-src/chatgpt/HK3.png 도 열어서 같은 바위로 그려. 주소를 못 열면 나한테 그 그림을 올려 달라고 말해. 다 그리면 항목의 파일 이름을 알려 줘.
```

**방법 2 (주소를 못 열 때)**: 이 문서를 GitHub에서 열고 오른쪽 위 복사 단추(Copy raw file)로 전부 복사해 새 대화에 붙이고, `art-src/ref-walls.png`(절벽을 받을 때는 `art-src/chatgpt/HK3.png`도)를 내려받아 함께 올린 뒤 "이 문서대로 받을 차례 맨 위부터 한 장씩 그려 줘"라고 한다.

받은 그림은 파일 이름 그대로 저장소 `art-src/chatgpt/`에 올리거나 Claude 대화에 붙인다. 넣는 일은 Claude가 한다.

## 규칙

- 한 메시지에 한 장. 앞서 그린 장과 도트 굵기, 색감, 칸 배치를 이어 간다.
- 그림 속에 글자, 번호, 서명, 워터마크, 테두리를 넣지 않는다. **현판, 족자, 문양판도 글자 없이 빈 채로**(글자는 게임이 얹는다).
- 배경은 단색 파랑(#0000FF). 그림 안에는 그 파랑을 쓰지 않는다. 칸 사이를 넓게 띄우고 서로 닿지 않게.
- 안티앨리어싱, 블러, 그라데이션, 반투명 없이 각진 도트로. 빛은 왼쪽 위에서.
- 명나라풍 무협. 일본풍이나 서양 판타지가 아니다.
- 보는 각도는 항목마다 적혀 있다. 바닥에 놓는 물건은 "비스듬히 위에서", 벽에 붙는 것은 "정면".

## 참고 그림

- 벽·지붕·소품(이미 받은 것을 한 장에): https://dltkdwhdhkd-design.github.io/gangho/art-src/ref-walls.png
- 전에 받은 절벽(HK4, HK5를 그릴 때): https://dltkdwhdhkd-design.github.io/gangho/art-src/chatgpt/HK3.png

## 받을 차례

맨 앞 세 장(IN1, IN2, HT1)이 가장 급하다. 이 셋으로 본보기 방(창운문 본전)과 본보기 문파(창운산)를 먼저 꾸민다.

### 1. 방 안 꾸밈

#### IN1: 벽 장식 여섯 (정면, 3열 2행)

본전 뒷벽에 거는 것. 글자는 넣지 않는다.

```
Sprite sheet for a pixel-art wuxia RPG, 3 columns x 2 rows, exactly the pixel size, outline and palette of the reference image, solid flat pure blue #0000FF background, wide gaps, nothing touching. Wall-mounted decorations of a Ming-dynasty martial arts hall, front orthographic view, no perspective, no writing anywhere: 1) a large round wall disc: a pale paper circle inside a dark carved wooden ring frame, the circle left empty, 2) a long horizontal wooden plaque board with a carved gold-trim frame, the board left empty, 3) a hanging scroll with an ink landscape painting (mountains and a pine), 4) a hanging scroll with only a few abstract ink brush strokes (not readable characters), 5) a pair of tall narrow hanging couplet boards, dark wood, left empty, 6) a straight sword in a scabbard hung diagonally on two wall hooks with a red tassel. Crisp chunky pixels, no anti-aliasing, no text.
```

파일 이름: `IN1.png`

#### IN2: 제단과 예식 물건 여섯 (비스듬히 위에서, 3열 2행)

```
Sprite sheet for a pixel-art wuxia RPG, 3 columns x 2 rows, exactly the pixel size, outline and palette of the reference image, solid flat pure blue #0000FF background, wide gaps, nothing touching. Altar furniture of a Ming-dynasty hall seen from a high three-quarter top-down view: 1) a long red-lacquered altar table with carved apron, empty top, 2) a pair of tall brass candlesticks with lit red candles and small flames, 3) a three-legged bronze incense burner with a thin line of smoke, 4) a set of three small offering bowls with fruit and buns on a tray, 5) a wooden ancestral tablet on a stepped stand, the tablet face left empty, 6) two square golden-yellow kneeling cushions. Crisp chunky pixels, no anti-aliasing, no text.
```

파일 이름: `IN2.png`

#### IN3: 도자기와 화분 여섯 (비스듬히 위에서, 3열 2행)

```
Sprite sheet for a pixel-art wuxia RPG, 3 columns x 2 rows, exactly the pixel size, outline and palette of the reference image, solid flat pure blue #0000FF background, wide gaps, nothing touching. Seen from a high three-quarter top-down view: 1) a tall blue-and-white porcelain floor vase, 2) a small blue-and-white porcelain jar with a lid, 3) a bonsai pine in a shallow rectangular pot on a low wooden stand, 4) a potted orchid on a tall slender flower stand, 5) a large dark glazed storage jar with a cloth-covered mouth, 6) a celadon vase holding a branch of plum blossoms. Crisp chunky pixels, no anti-aliasing, no text.
```

파일 이름: `IN3.png`

#### IN4: 앉는 자리 여섯 (비스듬히 위에서, 3열 2행)

```
Sprite sheet for a pixel-art wuxia RPG, 3 columns x 2 rows, exactly the pixel size, outline and palette of the reference image, solid flat pure blue #0000FF background, wide gaps, nothing touching. Ming-dynasty hardwood furniture seen from a high three-quarter top-down view: 1) a master's armchair (taishi chair) facing the viewer, dark rosewood with a red seat cushion, 2) the same armchair seen from the side, 3) a small square tea table with a teapot and two cups, 4) a low rectangular kang table, 5) a round drum stool, 6) a four-panel folding screen painted with a misty mountain landscape. Crisp chunky pixels, no anti-aliasing, no text.
```

파일 이름: `IN4.png`

#### IN5: 병기와 수련 도구 여섯 (비스듬히 위에서, 3열 2행)

```
Sprite sheet for a pixel-art wuxia RPG, 3 columns x 2 rows, exactly the pixel size, outline and palette of the reference image, solid flat pure blue #0000FF background, wide gaps, nothing touching. Training hall equipment seen from a high three-quarter top-down view: 1) a wooden weapon rack holding five spears and halberds upright, 2) a low sword rack holding three swords in scabbards horizontally, 3) a staff rack with six wooden staves, 4) a wooden training dummy with three arms on a heavy base, 5) a round straw archery target on a tripod, 6) a pair of stone lock weights and a stone drum for strength training. Crisp chunky pixels, no anti-aliasing, no text.
```

파일 이름: `IN5.png`

#### IN6: 가게 물건 여섯 (비스듬히 위에서, 3열 2행)

```
Sprite sheet for a pixel-art wuxia RPG, 3 columns x 2 rows, exactly the pixel size, outline and palette of the reference image, solid flat pure blue #0000FF background, wide gaps, nothing touching. Shop furnishings of a Ming-dynasty town seen from a high three-quarter top-down view: 1) a shelf unit stacked with rolled bolts of colored cloth, 2) a tall herbal medicine cabinet with many small drawers and brass pulls, 3) a shelf unit of bowls, plates and teapots, 4) a pile of thread-bound books and scroll tubes, 5) a shop counter with an abacus and a hanging scale, 6) a stack of wooden crates and a roped chest. Crisp chunky pixels, no anti-aliasing, no text.
```

파일 이름: `IN6.png`

#### IN7: 바닥 깔개 여섯 (바로 위에서 내려다본 그림, 3열 2행)

바닥에 납작하게 깔린다. 그림자와 두께가 없어야 한다.

```
Flat floor covering sheet for a pixel-art wuxia RPG, 3 columns x 2 rows, exactly the pixel size and palette of the reference image, solid flat pure blue #0000FF background, wide gaps, nothing touching. Every item is seen straight from above (pure top view), completely flat, no shadow, no thickness: 1) a long red runner carpet with gold border pattern, about 4 times longer than wide, 2) a round rug with a blue-and-cream cloud pattern, 3) a rectangular woven straw mat, 4) three round rush kneeling mats in a row, 5) a square dark blue rug with a simple geometric border, 6) a rolled-out bamboo slat mat. Crisp chunky pixels, no anti-aliasing, no text.
```

파일 이름: `IN7.png`

#### IN8: 창과 문 여섯 (정면, 벽에 붙는 무늬, 3열 2행)

```
Sprite sheet for a pixel-art wuxia RPG, 3 columns x 2 rows, exactly the pixel size, outline and palette of the temple wall sheets in the reference image, solid flat pure blue #0000FF background, wide gaps, nothing touching. Windows and doors of a Ming-dynasty building, front orthographic view, no perspective, each with warm light glowing through pale paper: 1) a square lattice window with a simple grid, 2) a round moon window with a cracked-ice lattice, 3) a pair of tall door panels with flower-pattern lattice on the upper half, 4) a wide window made of four narrow lattice panels, 5) a window with a rolled-down bamboo blind, 6) a small high paper window propped open with a stick. Dark red-brown wooden frames. Crisp chunky pixels, no anti-aliasing, no text.
```

파일 이름: `IN8.png`

#### IN9: 방 안 불빛 여섯 (비스듬히 위에서, 3열 2행)

```
Sprite sheet for a pixel-art wuxia RPG, 3 columns x 2 rows, exactly the pixel size, outline and palette of the reference image, solid flat pure blue #0000FF background, wide gaps, nothing touching. Indoor lights seen from a high three-quarter top-down view, each one lit: 1) a tall standing palace lantern on a carved wooden pole stand, 2) a single brass candlestick with a lit candle for a table, 3) a red paper lantern hanging from a short ceiling cord, 4) a bronze charcoal brazier with glowing embers, 5) a small oil lamp on a saucer, 6) a wall bracket holding a lit torch. Crisp chunky pixels, no anti-aliasing, no text.
```

파일 이름: `IN9.png`

### 2. 문파 안의 돌계단, 난간, 기단

#### HT1: 돌계단과 돌난간 여섯 (정면, 3열 2행)

문파 안에서 단과 단을 잇는 계단, 단 가장자리를 두르는 난간이다. 난간과 축대는 옆으로 이어 붙는다.

```
Stone stair and balustrade sheet for a pixel-art wuxia RPG, in exactly the same pixel size and pixel-art style as the wall sheets in the reference image, and matching the small stone steps and stone balustrade already shown among its props (Ming dynasty, front orthographic view, no perspective): 3 columns x 2 rows on a solid flat pure blue #0000FF background, wide gaps, nothing touching. 1) a flight of six dressed grey stone steps seen from the front, about 2 times wider than tall, left and right edges cut straight, 2) one straight section of carved white-grey stone balustrade: two square posts with lotus-bud caps and a carved panel between them, about 3 times wider than tall, left and right edges cut straight so copies tile side by side seamlessly, 3) a single balustrade end post with a small stone lion on top, 4) a sloped stone stair side wall (cheek block) for the left side of a stair, 5) a straight section of dressed stone retaining wall, large rectangular blocks, about 3 times wider than tall, tiles seamlessly left to right, 6) the same retaining wall with patches of moss and a few weeds in the joints, also tiling seamlessly. No ground, crisp chunky pixels, no anti-aliasing, no text.
```

파일 이름: `HT1.png`

#### HT2: 돌바닥 무늬 여섯 (바로 위에서, 이어 붙는 정사각형, 3열 2행)

마당이 한 가지 벽돌 무늬로만 깔려 있다. 구역마다 달리 깔 바닥.

```
Seamless ground texture sheet in exactly the same layout, pixel size and pixel-art style as the square texture swatches (roof tiles, wooden planks, cracked earth) in the reference image: 6 square swatches in 3 columns x 2 rows separated by solid pure blue #0000FF gaps. Each swatch is seen straight from above and must tile seamlessly left-right and top-bottom: 1) large square grey flagstones with thin dark joints, 2) the same flagstones weathered, with moss in the joints and a few fallen leaves, 3) herringbone grey brick paving, 4) hexagonal stone pavers, 5) a wide stone slab walkway with a carved border line (tiles along its length), 6) packed earth courtyard with scattered small pebbles. Crisp chunky pixels, no anti-aliasing, no text.
```

파일 이름: `HT2.png`

#### HT3: 뜰에 놓는 것 여섯 (비스듬히 위에서, 3열 2행)

```
Sprite sheet for a pixel-art wuxia RPG, 3 columns x 2 rows, exactly the pixel size, outline and palette of the reference image, solid flat pure blue #0000FF background, wide gaps, nothing touching. Things in a mountain sect courtyard seen from a high three-quarter top-down view: 1) a large old pine tree with a bent trunk and layered flat crowns, 2) a smaller young pine, 3) an upright weathered garden rock (scholar's rock) on a low base, 4) a tall stone lantern with a hexagonal roof, 5) a bronze incense cauldron on three legs with a small roof, 6) a stone water basin with a bamboo spout. Crisp chunky pixels, no anti-aliasing, no text.
```

파일 이름: `HT3.png`

### 3. 산길의 절벽과 바위

HK3(절벽 앞면 둘, 모서리 둘, 바위 계단, 이끼 바위)는 받았다. 같은 바위 빛과 도트 굵기로 이어 간다. 그릴 때 HK3 그림을 같이 보여 준다(위 "참고 그림").

#### HK4: 절벽 더 여섯 (정면에 가깝게 비스듬히, 3열 2행)

```
Sprite sheet for a pixel-art wuxia RPG, 3 columns x 2 rows, exactly the pixel size, outline and palette of the earlier cliff sheet HK3 (layered grey-brown rock blocks with a grass top; open the HK3 image linked in this document), solid flat pure blue #0000FF background, wide gaps, nothing touching. 1) a tall straight cliff face section, twice as tall as the earlier ones, left and right edges cut straight so copies tile side by side, no grass on top, 2) a long strip of overhanging grass and moss edge only (the top fringe of a cliff), tiles seamlessly left to right, 3) a narrow rock ledge sticking out of a cliff with a few tufts of grass, 4) a pile of fallen boulders and rubble at the foot of a cliff, 5) a small twisted pine growing out of a crack in a rock, 6) a boulder draped with hanging vines. Crisp chunky pixels, no anti-aliasing, no text.
```

파일 이름: `HK4.png`

#### HK5: 산길에 놓는 것 여섯 (비스듬히 위에서, 3열 2행)

```
Sprite sheet for a pixel-art wuxia RPG, 3 columns x 2 rows, exactly the pixel size, outline and palette of the reference image, solid flat pure blue #0000FF background, wide gaps, nothing touching. Things along a mountain path seen from a high three-quarter top-down view: 1) a section of old wooden guard rail made of rough logs, about 3 times wider than tall, tiles side by side, 2) two wooden posts joined by a sagging rope, tiles side by side, 3) a waist-high stone trail marker, the face left empty, 4) a cairn of piled stones with faded cloth strips tied to a branch, 5) a fallen dead tree trunk with moss, 6) a short flight of log steps set into earth. Crisp chunky pixels, no anti-aliasing, no text.
```

파일 이름: `HK5.png`
