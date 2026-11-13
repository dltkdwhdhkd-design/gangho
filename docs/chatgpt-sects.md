# ChatGPT 요청서: 구파일방과 오대세가 전각

> 지금 받을 그림은 `docs/chatgpt-now.md` 하나에 모아 둔다. 이 문서는 예전 기록이다.

어디에 시킬지: **ChatGPT(이미지 만들기)**. 지금 쓰는 벽·지붕·소품 그림(HW1, HR1, HR2, HP2)이 모두 ChatGPT에서 나와서 도트 굵기와 색이 이미 맞는다. 붙인 그림의 칸 배치(3열 2행)를 잘 따르고, 파랑 바탕을 깨끗하게 칠한다. Gemini는 고쳐 그리기는 잘하지만 도트가 뭉개지고 매끈한 그림 쪽으로 가는 일이 많아서 이번 일에는 덜 맞는다.

공통으로 할 일
- **한 대화에서 차례로** 받는다. 앞서 그린 장을 보고 도트 굵기, 색, 칸 배치를 이어 가니 일곱 장이 서로 잘 맞는다.
- 첫 메시지에 `art-src/chatgpt/HW1.png`, `art-src/higgsfield/HW2.png`, `art-src/chatgpt/HR1.png`, `art-src/chatgpt/HR2.png`, `art-src/chatgpt/HP2.png`를 한꺼번에 붙이고 "이 그림들과 같은 도트 굵기와 색으로, 아래 요청을 한 장씩 차례로 그려 줘"라고 한 뒤 HS1 프롬프트를 넣는다. 다음부터는 "다음"과 함께 프롬프트만 넣으면 된다.
- 한 메시지에 한 장씩. 일곱 장을 한 메시지에 몰아 넣으면 한 장에 다 우겨 넣거나 칸 배치가 흐트러진다.
- 받은 그림은 이름 그대로(HS1.png 따위) `art-src/chatgpt/`에 올리거나 이 대화에 붙여 주면 된다. 1536×1024 그대로면 된다.
- 바탕이 파랑이 아니거나, 글자가 들어가거나, 칸이 붙어 버리면 '다시'라고 해서 다시 받는다.

받은 뒤 쓰는 법: 앞벽은 조각내지 않고 **한 장째 앞벽으로 입힌다**(문은 가운데에 맞춘다). 옆벽은 그대로 옆과 박공에 쓴다. 지붕(HR3)과 장식(HE1)으로 문파마다 지붕 빛과 용마루를 바꾸고, 전각은 이층 처마와 넓은 기단으로 키운다.

## HS1: 소림사, 무당파, 화산파

```
Building wall parts sheet in exactly the same layout, scale, pixel size and pixel-art style as the reference image: 3 columns x 2 rows on a solid flat pure blue #0000FF background. Top row: three FRONT walls (flat orthographic elevation, walls only, no roof, top edge cut flat, the main door exactly in the horizontal centre, raised stone plinth at the bottom). Bottom row: the matching SIDE wall of each building with a triangular gable top and one window. Crisp chunky hand-placed pixels, dark 1-pixel outlines, warm muted palette with light from the upper left, no text, no letters, no shadows on the background, wide blue gaps between pieces. These are the grand main halls of famous martial-arts sects in a wuxia world, so they must look rich, imposing and distinctive, far grander than a village house: tall walls, heavy carved beams, ornate lattice, painted bracket bands, big double doors. Column 1, Shaolin Temple main hall: ochre-yellow walls, thick red lacquered round columns, golden-brown carved lattice doors with swastika (manji) and lotus patterns, a deep red and gold beam band, bronze door studs, grey granite plinth with carved lotus base. Column 2, Wudang Taoist hall: plain white-washed walls with dark wood frame, black and white yin-yang taiji roundel above the door, jade-green painted beams with cloud scroll patterns, dark green lattice windows, grey stone base. Column 3, Mount Hua sword sect hall: pale granite stone walls with crimson wooden frame, plum blossom carvings on the beams and door panels, deep red double door with brass rings, cliff-stone plinth.
```

## HS2: 종남파, 아미파, 곤륜파

```
Building wall parts sheet in exactly the same layout, scale, pixel size and pixel-art style as the reference image: 3 columns x 2 rows on a solid flat pure blue #0000FF background. Top row: three FRONT walls (flat orthographic elevation, walls only, no roof, top edge cut flat, the main door exactly in the horizontal centre, raised stone plinth at the bottom). Bottom row: the matching SIDE wall of each building with a triangular gable top and one window. Crisp chunky hand-placed pixels, dark 1-pixel outlines, warm muted palette with light from the upper left, no text, no letters, no shadows on the background, wide blue gaps between pieces. These are the grand main halls of famous martial-arts sects in a wuxia world, so they must look rich, imposing and distinctive, far grander than a village house: tall walls, heavy carved beams, ornate lattice, painted bracket bands, big double doors. Column 1, Zhongnan Taoist sect hall: stern dark blue-grey wooden frame, grey stone walls, star-constellation (Big Dipper) carved panel above the door, iron-studded black double door, plain heavy beams. Column 2, Emei nunnery hall: pale cream walls, soft violet and gold painted beams with lotus and cloud motifs, round moon-gate shaped door frame with wooden doors, delicate white lattice windows. Column 3, Kunlun mountain sect hall: white marble-like stone walls, icy sky-blue beams, silver-grey frame, snow-capped mountain carving above a heavy white-grey double door, thick stone plinth.
```

## HS3: 공동파, 점창파, 청성파

```
Building wall parts sheet in exactly the same layout, scale, pixel size and pixel-art style as the reference image: 3 columns x 2 rows on a solid flat pure blue #0000FF background. Top row: three FRONT walls (flat orthographic elevation, walls only, no roof, top edge cut flat, the main door exactly in the horizontal centre, raised stone plinth at the bottom). Bottom row: the matching SIDE wall of each building with a triangular gable top and one window. Crisp chunky hand-placed pixels, dark 1-pixel outlines, warm muted palette with light from the upper left, no text, no letters, no shadows on the background, wide blue gaps between pieces. These are the grand main halls of famous martial-arts sects in a wuxia world, so they must look rich, imposing and distinctive, far grander than a village house: tall walls, heavy carved beams, ornate lattice, painted bracket bands, big double doors. Column 1, Kongtong sect hall: rugged brown rock-block walls, ochre timber, carved fierce beast-head brackets, heavy bronze door, rough stone base. Column 2, Diancang sect hall (southern Yunnan): dark polished wood and woven bamboo panels, green and terracotta painted beams, slatted bamboo lattice windows, wooden double door. Column 3, Qingcheng sect hall: mossy grey stone base, deep green-lacquered columns, green beams with mountain-mist cloud patterns, carved pine motifs, dark wooden doors.
```

## HS4: 개방, 남궁세가, 모용세가

```
Building wall parts sheet in exactly the same layout, scale, pixel size and pixel-art style as the reference image: 3 columns x 2 rows on a solid flat pure blue #0000FF background. Top row: three FRONT walls (flat orthographic elevation, walls only, no roof, top edge cut flat, the main door exactly in the horizontal centre, raised stone plinth at the bottom). Bottom row: the matching SIDE wall of each building with a triangular gable top and one window. Crisp chunky hand-placed pixels, dark 1-pixel outlines, warm muted palette with light from the upper left, no text, no letters, no shadows on the background, wide blue gaps between pieces. These are the grand main halls of famous martial-arts sects in a wuxia world, so they must look rich, imposing and distinctive, far grander than a village house: tall walls, heavy carved beams, ornate lattice, painted bracket bands, big double doors. Column 1, Beggars' Sect headquarters: large but humble patched hall of weathered planks, woven bamboo mats and straw, mismatched patches, a big gourd hung beside a plain plank double door, rope-bound posts, rough stone base. Column 2, Namgung family manor (richest sword clan): imposing deep navy-blue lacquered frame with gold trim, white walls, a gold sword emblem above a massive gate-like double door with rows of brass studs, carved granite plinth with steps. Column 3, Murong family manor (elegant Jiangnan style): white-washed walls with black tile edging, a round moon window on each side, black lacquered double door, graceful slender dark wood columns, plum-blossom lattice.
```

## HS5: 제갈세가, 사천당가, 하북팽가

```
Building wall parts sheet in exactly the same layout, scale, pixel size and pixel-art style as the reference image: 3 columns x 2 rows on a solid flat pure blue #0000FF background. Top row: three FRONT walls (flat orthographic elevation, walls only, no roof, top edge cut flat, the main door exactly in the horizontal centre, raised stone plinth at the bottom). Bottom row: the matching SIDE wall of each building with a triangular gable top and one window. Crisp chunky hand-placed pixels, dark 1-pixel outlines, warm muted palette with light from the upper left, no text, no letters, no shadows on the background, wide blue gaps between pieces. These are the grand main halls of famous martial-arts sects in a wuxia world, so they must look rich, imposing and distinctive, far grander than a village house: tall walls, heavy carved beams, ornate lattice, painted bracket bands, big double doors. Column 1, Zhuge family manor (strategists): dark green lacquered frame, eight-trigram bagua roundel above the door, intricate geometric interlocking lattice like puzzle mechanisms, scholarly wooden double door, grey stone base. Column 2, Sichuan Tang family manor (poison and hidden weapons): dark purple-black lacquered wood, iron studs and iron bands, narrow barred windows, carved centipede and snake motifs on the beams, black double door with iron rings. Column 3, Hebei Peng family manor (saber clan): massive northern-style red-brown timber and grey brick, heavy black iron fittings, crossed broadsword emblem above a thick red double door, coarse stone plinth.
```

## HR3: 문파 지붕 무늬 여섯

```
Roof tile texture sheet in exactly the same layout, pixel size and pixel-art style as the reference image: 3 columns x 2 rows of square seamless roof-tile swatches separated by blue lines, solid pure blue #0000FF gaps. Each swatch is a tileable pattern of curved Chinese roof tiles seen from above at a slight angle, with clear tile ridges and dark grooves, crisp chunky pixels, light from the upper left, no text. Swatches: 1) imperial yellow-gold glazed tiles (Shaolin); 2) jade-green glazed tiles (Wudang, Qingcheng); 3) deep blue glazed tiles (Namgung, Kunlun); 4) black glazed tiles with a slight purple sheen (Tang clan); 5) grey unglazed clay tiles with moss patches (Zhongnan, Kongtong); 6) red-brown glazed tiles (Hua, Peng). All six must tile seamlessly left-right and top-bottom.
```

## HE1: 지붕 장식과 현판

```
Sprite sheet of Chinese roof ornaments and hall decorations for a pixel-art wuxia RPG, 4 columns x 3 rows grid, in exactly the pixel size, outline and palette of the reference images, solid pure blue #0000FF background, wide gaps, nothing touching. Items: 1) dragon-head ridge-end ornament (chiwen), dark grey glazed, facing right; 2) the same in gold-yellow; 3) row of five small roof-ridge guardian beasts on a short ridge piece; 4) upturned flying eave corner piece with a hanging bronze wind bell; 5) long horizontal ridge band with a carved cloud pattern, tileable left-right; 6) small tower-like ridge-centre pearl/flame ornament; 7) blank dark lacquered horizontal plaque with a gold border (no text); 8) blank vertical plaque, red with gold border (no text); 9) pair of red lacquered round columns with gilded capitals; 10) row of painted dougong bracket sets under an eave, tileable left-right; 11) large bronze incense cauldron (ding) on three legs; 12) pair of tall stone lanterns with carved roofs. Same pixel scale for all: plaques about one person wide, columns about two people tall. No text or letters anywhere.
```
