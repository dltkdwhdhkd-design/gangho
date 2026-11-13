# 그림 요청문 (ChatGPT·Gemini는 이것만 보면 된다)

이 문서 하나에 ChatGPT에게 맡길 그림을 **차례대로** 모아 둔다. 다 받은 것은 지우고, 새로 필요한 것은 맨 아래에 이어 붙인다. 다른 요청서(docs/chatgpt-*.md)는 예전 기록이다.

## ChatGPT에게 처음 하는 말

새 대화에서 아래를 그대로 붙인다. 다음부터는 "다음"이라고만 하면 된다.

```text
아래 주소의 문서를 읽어 줘. 내 게임 '강호행'에 들어갈 그림 요청문이야.
https://raw.githubusercontent.com/dltkdwhdhkd-design/gangho/main/docs/chatgpt-now.md
문서의 "규칙"을 지키고, "받을 차례"의 맨 위 항목부터 한 장씩 그려 줘. 한 메시지에 한 장만. 내가 "다음"이라고 하면 다음 항목을 그려. 각 항목에 적힌 참고 그림 주소를 열어서 그 그림과 도트 굵기·색·칸 배치를 맞춰. 주소를 못 열면 나한테 그 그림을 올려 달라고 말해. 다 그리면 항목의 파일 이름을 알려 줘.
```

받은 그림은 파일 이름 그대로 저장소 `art-src/chatgpt/`(Gemini면 `art-src/gemini/`)에 올리거나 Claude 대화에 붙인다. 넣는 일은 Claude가 한다.

## 규칙

- 한 메시지에 한 장. 앞서 그린 장과 그림체, 도트 굵기, 색감을 이어 간다.
- 그림 속에 글자, 번호, 서명, 워터마크, 테두리를 넣지 않는다.
- 배경 색은 항목에 적힌 대로(도트 시트는 단색 마젠타 #FF00FF 또는 단색 파랑 #0000FF, 일러스트는 투명 PNG). 그림 안에는 배경 색을 쓰지 않는다.
- 도트 그림은 안티앨리어싱, 블러, 그라데이션, 반투명 없이 각진 도트로.
- 배경은 명나라풍 무협. 일본풍(기모노, 사무라이)이나 서양 판타지가 아니다.
- 사람은 모두 설명에 적힌 나이대로. 기녀는 스물 넘은 성인 예인이고, 몸을 다 덮는 단정한 옷으로 노출 없이 그린다.

## 참고 그림

1. 인물 도트(걷기 시트 기준): https://raw.githubusercontent.com/dltkdwhdhkd-design/gangho/main/art-src/chatgpt/HC1a.png (앞·뒤), https://raw.githubusercontent.com/dltkdwhdhkd-design/gangho/main/art-src/chatgpt/HC1b.png (옆)
2. 벽 그림 묶음: https://raw.githubusercontent.com/dltkdwhdhkd-design/gangho/main/art-src/chatgpt/HW1.png , https://raw.githubusercontent.com/dltkdwhdhkd-design/gangho/main/art-src/higgsfield/HW2.png , https://raw.githubusercontent.com/dltkdwhdhkd-design/gangho/main/art-src/chatgpt/HR1.png , https://raw.githubusercontent.com/dltkdwhdhkd-design/gangho/main/art-src/chatgpt/HR2.png , https://raw.githubusercontent.com/dltkdwhdhkd-design/gangho/main/art-src/chatgpt/HP2.png
3. 도트 질의 기준(Gemini 시험 그림. 이 정도 세밀함으로): https://raw.githubusercontent.com/dltkdwhdhkd-design/gangho/main/art-src/gemini/G1.png
4. 인물 일러스트 그림체: https://raw.githubusercontent.com/dltkdwhdhkd-design/gangho/main/assets/art/yun_n.webp , https://raw.githubusercontent.com/dltkdwhdhkd-design/gangho/main/assets/art/so_n.webp , https://raw.githubusercontent.com/dltkdwhdhkd-design/gangho/main/assets/art/c_gu_n.webp

## 인물 도트 공통 문장 (도트 걷기 시트마다 앞에 붙는다)

```text
명나라를 배경으로 한 무협 RPG, 일검풍운결(Wandering Sword) 같은 HD-2D 게임의 인물 도트야. 참고 그림 1의 칸 배치와 참고 그림 3의 세밀함으로: 3.5등신, 한 인물의 키가 그림에서 300픽셀쯤, 얼굴에 눈·눈썹·입이 작게 찍히고, 머리카락은 3~4단, 옷은 주름과 겹침이 보이게 4~5단 명암, 외곽선은 짙은 갈색이나 짙은 남색 1도트, 빛은 왼쪽 위에서 약하게. 게임에서 8분의 1로 줄여 쓰니 얼굴은 옷보다 밝게, 앞머리가 눈을 가리지 않게, 검은 옷은 짙은 남회색으로. 배경은 완전한 단색 마젠타(#FF00FF), 그림 안에는 마젠타를 쓰지 마. 바닥 그림자, 빛번짐 없이.
```

- **a (앞뒤 걷기)**: 정사각형 한 장을 2열 3행으로 나눠 같은 인물을 6번. 1열은 정면, 2열은 뒷모습. 1행 차렷, 2행 왼발 내딛기, 3행 오른발 내딛기. 팔은 다리와 반대로 흔들리고, 손에 든 물건은 여섯 칸 모두 같게. 칸끼리 넉넉히 떼기.
- **b (옆 걷기)**: 방금 그 인물을 2열 3행으로 6번, 모두 왼쪽을 보는 옆모습. 1열은 차렷, 왼발 내딛기, 오른발 내딛기. 2열은 숨 쉬는 차렷, 왼발 다음 중간 걸음(뒷발이 들려 앞으로 넘어옴), 오른발 다음 중간 걸음. 키와 색은 a와 같게.

## 받을 차례

### 1. 기루 일러스트 7장 (투명 배경 1024×1536)

참고 그림 4의 그림체로. 허벅지 위까지, 몸은 오른쪽으로 살짝, 얼굴과 시선은 거의 정면. 첫 장 앞에 이 문장을 한 번 붙인다.

```text
이번 일곱 장은 명나라풍 큰 고을의 기루(술과 가무를 파는 곳) 사람들이야. 기녀는 모두 스물 넘은 성인 여성이고, 가야금·비파·춤·시로 손님을 맞는 예인으로 그려 줘. 옷은 몸을 다 덮는 단정한 비단옷(긴 소매, 바닥까지 닿는 치마, 여민 깃)으로, 노출과 몸선 강조 없이 품위 있게. 같은 그림체, 같은 구도(허벅지 위, 얼굴은 거의 정면), 1024×1536 투명 배경 규칙은 그대로야.
```

- **giru_hongmae_n.png** · 홍매 (가야금 타는 기녀, 스물넷)

```text
스물넷 여자. 높이 틀어 올린 쪽머리에 붉은 옥비녀와 작은 떨잠, 장밋빛과 짙은 진홍의 겹 비단옷, 흰 수놓은 깃, 오른손에 접은 부채. 다섯 해째 기루에 있어 표정은 차분하지만 눈에 피곤이 조금 비친다.
```

- **giru_wolhyang_n.png** · 월향 (춤추는 기녀, 스물둘)

```text
스물두 살 여자. 양쪽으로 둥글게 감아 올린 머리에 연보라 댕기, 연보라와 옅은 금빛 비단옷, 긴 소매 끝을 살짝 들어 춤사위를 시작하려는 손. 어머니에게 춤을 배운 사람답게 몸가짐이 반듯하고, 입가에 장난스러운 웃음.
```

- **giru_soak_n.png** · 소옥 (강남에서 온 가객, 스물셋)

```text
스물세 살 여자. 강남풍으로 낮게 묶은 쪽머리에 은비녀, 청록과 상아빛 비단옷, 길게 늘어진 물소매, 옅은 띠. 노래하는 사람이라 목선이 곧고, 순한 얼굴에 사투리 섞인 웃음이 어울리는 인상.
```

- **giru_yeonhwa_n.png** · 연화 (노예 시장에서 온 기녀, 스물하나)

```text
스물한 살 여자. 수수하게 틀어 올린 머리에 나무비녀 하나, 다른 기녀보다 소박한 분홍 비단옷(소매 끝이 조금 해짐), 두 손을 앞으로 모아 쥠. 겁먹었지만 꺾이지 않은 눈, 글을 배우고 싶어 하는 사람다운 또렷한 눈빛.
```

- **giru_chaeun_n.png** · 채운 (비파 타는 기녀, 스물다섯)

```text
스물다섯 살 여자. 한쪽으로 넘겨 묶은 긴 머리에 구름무늬 머리 장식, 하늘색과 흰빛 겹 비단옷, 비파를 가슴에 안음. 일할 때만 웃는 사람이라 지금은 담담한 얼굴, 손가락이 길고 단정함.
```

- **giru_nanju_n.png** · 난주 (관기 출신 기녀, 스물일곱)

```text
스물일곱 살 여자. 크고 화려하게 올린 머리에 금비녀와 비취 장식, 짙은 남색과 금실 비단옷, 관아 의례복을 닮은 단정한 깃. 이 기루에서 가장 이름난 사람답게 당당하고 영리한 눈, 입꼬리에 냉소가 조금.
```

- **giru_pimp_n.png** · 포주 (기루 주인)

```text
쉰 살 남자. 살집 있는 몸, 가늘게 늘어진 콧수염, 작은 검은 사모, 금빛 엽전 무늬가 들어간 진홍 비단옷에 털 깃, 허리에 불룩한 돈주머니와 주판, 손가락마다 반지. 웃고 있지만 계산이 끝난 눈.
```

### 2. 인물 도트 걷기 시트 (a, b 한 쌍씩)

위의 '인물 도트 공통 문장'과 a 또는 b 문장을 붙이고, 아래 인물 설명을 넣는다. 파일 이름은 `번호a.png`, `번호b.png`(예: HN15a.png).

- **HN15a, HN15b** · 월향·채운 같은 비파 타는 기녀

```text
인물: 스물 넘은 성인 여자 기녀(예인). 양쪽으로 둥글게 감아 올린 머리에 연보라 댕기, 몸을 다 덮는 연보라와 옅은 금빛 겹 비단옷(긴 소매, 바닥까지 닿는 치마), 작은 비파를 두 손으로 가슴 앞에 안음, 부드러운 웃음. 노출 없이 단정하게
```

- **HN16a, HN16b** · 춤추는 기녀

```text
인물: 스물 넘은 성인 여자 기녀(무희). 높게 올린 외쪽 머리에 은비녀, 몸을 다 덮는 청록과 상아빛 비단옷, 아주 긴 물소매, 바닥까지 닿는 치마, 길고 옅은 띠, 반듯한 얼굴. 노출 없이 단정하게
```

- **HN17a, HN17b** · 기루 포주

```text
인물: 쉰 살쯤 살집 있는 남자. 가늘게 늘어진 콧수염, 작은 검은 사모, 금빛 엽전 무늬의 진홍 비단옷에 털 깃, 허리에 불룩한 돈주머니와 주판, 손가락마다 반지, 웃지만 계산이 끝난 눈
```

- **HN6a, HN6b** · 문파 제자

```text
인물: 이십 대 남자 문파 제자. 상투에 초록 댕기, 몸에 맞는 짙은 초록 교령 수련복에 검은 띠와 팔토시, 등에 검은 칼집의 검, 검은 장화
```

- **HN7a, HN7b** · 부호

```text
인물: 오십 대 부유한 상인. 약간 통통하고 가는 콧수염, 검은 네모 유건, 금빛 둥근 무늬가 있는 짙은 붉은 비단옷, 허리에 옥 패물, 수놓은 신
```

- **HN8a, HN8b** · 순라군

```text
인물: 고을 순라군. 붉은 술이 달린 둥근 쇠투구, 가벼운 미늘 갑옷 위에 붉은 솜옷, 짙은 바지와 장화, 오른손에 긴 창을 곧게 세워 듦
```

- **HN9a, HN9b** · 덩치(대장장이·산적)

```text
인물: 사십 대 수염 난 덩치 큰 남자. 굵은 맨팔, 맨가슴 위에 짙은 갈색 가죽 조끼, 붉은 머리띠, 넓은 허리끈, 발목을 묶은 헐렁한 회색 바지, 짚신
```

- **HN10a, HN10b** · 점소이

```text
인물: 이십 대 객잔 점소이. 작은 검은 천 모자, 왼어깨에 흰 수건, 소매를 걷은 짧은 청회색 저고리, 긴 흰 앞치마, 검은 바지, 친근한 얼굴
```

- **HN11a, HN11b** · 아전

```text
인물: 사십 대 고을 관아 아전. 검은 사모, 띠를 두른 짙은 남색 관복, 손에 말린 문서, 검은 장화, 엄한 얼굴
```

- **HN12a, HN12b** · 개방 거지

```text
인물: 개방 사람. 헝겊으로 묶은 헝클어진 머리, 기운 자국 많은 누더기 갈색·회색 옷, 허리에 술 호리병, 대나무 지팡이, 짚신, 넉살 좋은 웃음
```

- **HN13a, HN13b** · 마을 아이

```text
인물: 여덟 살쯤 마을 아이. 양쪽에 작은 상투 두 개, 빛바랜 붉은 짧은 저고리와 파란 바지, 천신, 장난스러운 얼굴. 키는 어른의 3분의 2쯤
```

### 3. 문파·세가 전각 벽 (파랑 배경, 3열 2행)

파일 이름은 번호 그대로(HS1.png 따위). 1행은 앞벽 셋, 2행은 같은 건물의 옆벽(박공) 셋.

### HS1: 소림사, 무당파, 화산파

참고 그림: 벽 그림 묶음(참고 그림 2번)

```
Building wall parts sheet in exactly the same layout, scale, pixel size and pixel-art style as the reference image: 3 columns x 2 rows on a solid flat pure blue #0000FF background. Top row: three FRONT walls (flat orthographic elevation, walls only, no roof, top edge cut flat, the main door exactly in the horizontal centre, raised stone plinth at the bottom). Bottom row: the matching SIDE wall of each building with a triangular gable top and one window. Crisp chunky hand-placed pixels, dark 1-pixel outlines, warm muted palette with light from the upper left, no text, no letters, no shadows on the background, wide blue gaps between pieces. These are the grand main halls of famous martial-arts sects in a wuxia world, so they must look rich, imposing and distinctive, far grander than a village house: tall walls, heavy carved beams, ornate lattice, painted bracket bands, big double doors. Column 1, Shaolin Temple main hall: ochre-yellow walls, thick red lacquered round columns, golden-brown carved lattice doors with swastika (manji) and lotus patterns, a deep red and gold beam band, bronze door studs, grey granite plinth with carved lotus base. Column 2, Wudang Taoist hall: plain white-washed walls with dark wood frame, black and white yin-yang taiji roundel above the door, jade-green painted beams with cloud scroll patterns, dark green lattice windows, grey stone base. Column 3, Mount Hua sword sect hall: pale granite stone walls with crimson wooden frame, plum blossom carvings on the beams and door panels, deep red double door with brass rings, cliff-stone plinth.
```

### HS2: 종남파, 아미파, 곤륜파

참고 그림: 벽 그림 묶음(참고 그림 2번)

```
Building wall parts sheet in exactly the same layout, scale, pixel size and pixel-art style as the reference image: 3 columns x 2 rows on a solid flat pure blue #0000FF background. Top row: three FRONT walls (flat orthographic elevation, walls only, no roof, top edge cut flat, the main door exactly in the horizontal centre, raised stone plinth at the bottom). Bottom row: the matching SIDE wall of each building with a triangular gable top and one window. Crisp chunky hand-placed pixels, dark 1-pixel outlines, warm muted palette with light from the upper left, no text, no letters, no shadows on the background, wide blue gaps between pieces. These are the grand main halls of famous martial-arts sects in a wuxia world, so they must look rich, imposing and distinctive, far grander than a village house: tall walls, heavy carved beams, ornate lattice, painted bracket bands, big double doors. Column 1, Zhongnan Taoist sect hall: stern dark blue-grey wooden frame, grey stone walls, star-constellation (Big Dipper) carved panel above the door, iron-studded black double door, plain heavy beams. Column 2, Emei nunnery hall: pale cream walls, soft violet and gold painted beams with lotus and cloud motifs, round moon-gate shaped door frame with wooden doors, delicate white lattice windows. Column 3, Kunlun mountain sect hall: white marble-like stone walls, icy sky-blue beams, silver-grey frame, snow-capped mountain carving above a heavy white-grey double door, thick stone plinth.
```

### HS3: 공동파, 점창파, 청성파

참고 그림: 벽 그림 묶음(참고 그림 2번)

```
Building wall parts sheet in exactly the same layout, scale, pixel size and pixel-art style as the reference image: 3 columns x 2 rows on a solid flat pure blue #0000FF background. Top row: three FRONT walls (flat orthographic elevation, walls only, no roof, top edge cut flat, the main door exactly in the horizontal centre, raised stone plinth at the bottom). Bottom row: the matching SIDE wall of each building with a triangular gable top and one window. Crisp chunky hand-placed pixels, dark 1-pixel outlines, warm muted palette with light from the upper left, no text, no letters, no shadows on the background, wide blue gaps between pieces. These are the grand main halls of famous martial-arts sects in a wuxia world, so they must look rich, imposing and distinctive, far grander than a village house: tall walls, heavy carved beams, ornate lattice, painted bracket bands, big double doors. Column 1, Kongtong sect hall: rugged brown rock-block walls, ochre timber, carved fierce beast-head brackets, heavy bronze door, rough stone base. Column 2, Diancang sect hall (southern Yunnan): dark polished wood and woven bamboo panels, green and terracotta painted beams, slatted bamboo lattice windows, wooden double door. Column 3, Qingcheng sect hall: mossy grey stone base, deep green-lacquered columns, green beams with mountain-mist cloud patterns, carved pine motifs, dark wooden doors.
```

### HS4: 개방, 남궁세가, 모용세가

참고 그림: 벽 그림 묶음(참고 그림 2번)

```
Building wall parts sheet in exactly the same layout, scale, pixel size and pixel-art style as the reference image: 3 columns x 2 rows on a solid flat pure blue #0000FF background. Top row: three FRONT walls (flat orthographic elevation, walls only, no roof, top edge cut flat, the main door exactly in the horizontal centre, raised stone plinth at the bottom). Bottom row: the matching SIDE wall of each building with a triangular gable top and one window. Crisp chunky hand-placed pixels, dark 1-pixel outlines, warm muted palette with light from the upper left, no text, no letters, no shadows on the background, wide blue gaps between pieces. These are the grand main halls of famous martial-arts sects in a wuxia world, so they must look rich, imposing and distinctive, far grander than a village house: tall walls, heavy carved beams, ornate lattice, painted bracket bands, big double doors. Column 1, Beggars' Sect headquarters: large but humble patched hall of weathered planks, woven bamboo mats and straw, mismatched patches, a big gourd hung beside a plain plank double door, rope-bound posts, rough stone base. Column 2, Namgung family manor (richest sword clan): imposing deep navy-blue lacquered frame with gold trim, white walls, a gold sword emblem above a massive gate-like double door with rows of brass studs, carved granite plinth with steps. Column 3, Murong family manor (elegant Jiangnan style): white-washed walls with black tile edging, a round moon window on each side, black lacquered double door, graceful slender dark wood columns, plum-blossom lattice.
```

### HS5: 제갈세가, 사천당가, 하북팽가

참고 그림: 벽 그림 묶음(참고 그림 2번)

```
Building wall parts sheet in exactly the same layout, scale, pixel size and pixel-art style as the reference image: 3 columns x 2 rows on a solid flat pure blue #0000FF background. Top row: three FRONT walls (flat orthographic elevation, walls only, no roof, top edge cut flat, the main door exactly in the horizontal centre, raised stone plinth at the bottom). Bottom row: the matching SIDE wall of each building with a triangular gable top and one window. Crisp chunky hand-placed pixels, dark 1-pixel outlines, warm muted palette with light from the upper left, no text, no letters, no shadows on the background, wide blue gaps between pieces. These are the grand main halls of famous martial-arts sects in a wuxia world, so they must look rich, imposing and distinctive, far grander than a village house: tall walls, heavy carved beams, ornate lattice, painted bracket bands, big double doors. Column 1, Zhuge family manor (strategists): dark green lacquered frame, eight-trigram bagua roundel above the door, intricate geometric interlocking lattice like puzzle mechanisms, scholarly wooden double door, grey stone base. Column 2, Sichuan Tang family manor (poison and hidden weapons): dark purple-black lacquered wood, iron studs and iron bands, narrow barred windows, carved centipede and snake motifs on the beams, black double door with iron rings. Column 3, Hebei Peng family manor (saber clan): massive northern-style red-brown timber and grey brick, heavy black iron fittings, crossed broadsword emblem above a thick red double door, coarse stone plinth.
```

### HS6: 황보세가, 산동악가, 신창양가

참고 그림: 벽 그림 묶음(아래 '참고 그림' 2번)

```
Building wall parts sheet in exactly the same layout, scale, pixel size and pixel-art style as the reference image: 3 columns x 2 rows on a solid flat pure blue #0000FF background. Top row: three FRONT walls (flat orthographic elevation, walls only, no roof, top edge cut flat, the main door exactly in the horizontal centre, raised stone plinth at the bottom). Bottom row: the matching SIDE wall of each building with a triangular gable top and one window. Crisp chunky hand-placed pixels, dark 1-pixel outlines, warm muted palette with light from the upper left, no text, no letters, no shadows on the background, wide blue gaps between pieces. These are the grand main halls of famous martial-arts sects in a wuxia world, so they must look rich, imposing and distinctive, far grander than a village house: tall walls, heavy carved beams, ornate lattice, painted bracket bands, big double doors. Column 1, Hwangbo clan hall (Hebei fist masters): grey brick walls with gold-painted beams, heavy studded red double door, carved tiger heads on the beam ends, granite plinth. Column 2, Ak clan hall (loyal spear clan of Shandong): sturdy dark red timber frame, white walls, a carved spear-and-banner motif above the door, black iron-bound door. Column 3, Yang clan hall (spear clan): warm ochre walls, red-brown beams with pear-blossom carvings, wide double door with brass rings, racks of spears painted on the side panels.
```

### HS7: 진주언가, 광동진가, 해남파

참고 그림: 벽 그림 묶음(아래 '참고 그림' 2번)

```
Building wall parts sheet in exactly the same layout, scale, pixel size and pixel-art style as the reference image: 3 columns x 2 rows on a solid flat pure blue #0000FF background. Top row: three FRONT walls (flat orthographic elevation, walls only, no roof, top edge cut flat, the main door exactly in the horizontal centre, raised stone plinth at the bottom). Bottom row: the matching SIDE wall of each building with a triangular gable top and one window. Crisp chunky hand-placed pixels, dark 1-pixel outlines, warm muted palette with light from the upper left, no text, no letters, no shadows on the background, wide blue gaps between pieces. These are the grand main halls of famous martial-arts sects in a wuxia world, so they must look rich, imposing and distinctive, far grander than a village house: tall walls, heavy carved beams, ornate lattice, painted bracket bands, big double doors. Column 1, Eon clan hall (iron-body fist clan): rough dark grey stone walls, iron bands across the beams, massive iron door with big rivets, plain heavy plinth. Column 2, Jin clan hall of Guangdong: southern style, light grey brick with green glazed window grilles, red and green painted beams, carved wooden screen above a wide door. Column 3, Hainan sword sect hall (island by the sea): whitewashed coral-stone walls, sea-blue beams with wave patterns, wooden door with shell inlays, weathered stone base.
```

### HS8: 천산파, 전진교, 모산파

참고 그림: 벽 그림 묶음(아래 '참고 그림' 2번)

```
Building wall parts sheet in exactly the same layout, scale, pixel size and pixel-art style as the reference image: 3 columns x 2 rows on a solid flat pure blue #0000FF background. Top row: three FRONT walls (flat orthographic elevation, walls only, no roof, top edge cut flat, the main door exactly in the horizontal centre, raised stone plinth at the bottom). Bottom row: the matching SIDE wall of each building with a triangular gable top and one window. Crisp chunky hand-placed pixels, dark 1-pixel outlines, warm muted palette with light from the upper left, no text, no letters, no shadows on the background, wide blue gaps between pieces. These are the grand main halls of famous martial-arts sects in a wuxia world, so they must look rich, imposing and distinctive, far grander than a village house: tall walls, heavy carved beams, ornate lattice, painted bracket bands, big double doors. Column 1, Tianshan sect hall (snow mountains of the far west): white stone walls, icy pale-blue beams, silver-grey frame, snow lotus carving above a heavy white door. Column 2, Quanzhen Taoist hall: white walls, dark wooden frame, black-and-white Big Dipper star carving over the door, plain green-grey beams. Column 3, Maoshan Taoist exorcist hall: yellow ochre walls with painted red talisman-like patterns (abstract, no readable letters), dark wood frame, bronze mirror above the door, black door.
```

### HS9: 장백파, 보타문, 기루

참고 그림: 벽 그림 묶음(아래 '참고 그림' 2번)

```
Building wall parts sheet in exactly the same layout, scale, pixel size and pixel-art style as the reference image: 3 columns x 2 rows on a solid flat pure blue #0000FF background. Top row: three FRONT walls (flat orthographic elevation, walls only, no roof, top edge cut flat, the main door exactly in the horizontal centre, raised stone plinth at the bottom). Bottom row: the matching SIDE wall of each building with a triangular gable top and one window. Crisp chunky hand-placed pixels, dark 1-pixel outlines, warm muted palette with light from the upper left, no text, no letters, no shadows on the background, wide blue gaps between pieces. These are the grand main halls of famous martial-arts sects in a wuxia world, so they must look rich, imposing and distinctive, far grander than a village house: tall walls, heavy carved beams, ornate lattice, painted bracket bands, big double doors. Column 1, Changbai mountain sect hall (northeast): heavy log and stone walls, dark brown beams with tiger motifs, thick wooden door, snow on the plinth edge. Column 2, Putuo island nunnery hall: pale cream walls, soft blue and gold beams with lotus and wave motifs, round moon-gate door. Column 3, a two-storey city pleasure house (gilou) front: lacquered red pillars, carved latticework painted gold, rows of red paper lanterns along the beam, open entrance with a red curtain, very ornate and colourful.
```

### HR3: 문파 지붕 무늬 여섯

참고 그림: 벽 그림 묶음(참고 그림 2번)

```
Roof tile texture sheet in exactly the same layout, pixel size and pixel-art style as the reference image: 3 columns x 2 rows of square seamless roof-tile swatches separated by blue lines, solid pure blue #0000FF gaps. Each swatch is a tileable pattern of curved Chinese roof tiles seen from above at a slight angle, with clear tile ridges and dark grooves, crisp chunky pixels, light from the upper left, no text. Swatches: 1) imperial yellow-gold glazed tiles (Shaolin); 2) jade-green glazed tiles (Wudang, Qingcheng); 3) deep blue glazed tiles (Namgung, Kunlun); 4) black glazed tiles with a slight purple sheen (Tang clan); 5) grey unglazed clay tiles with moss patches (Zhongnan, Kongtong); 6) red-brown glazed tiles (Hua, Peng). All six must tile seamlessly left-right and top-bottom.
```

### HE1: 지붕 장식과 현판

참고 그림: 벽 그림 묶음(참고 그림 2번)

```
Sprite sheet of Chinese roof ornaments and hall decorations for a pixel-art wuxia RPG, 4 columns x 3 rows grid, in exactly the pixel size, outline and palette of the reference images, solid pure blue #0000FF background, wide gaps, nothing touching. Items: 1) dragon-head ridge-end ornament (chiwen), dark grey glazed, facing right; 2) the same in gold-yellow; 3) row of five small roof-ridge guardian beasts on a short ridge piece; 4) upturned flying eave corner piece with a hanging bronze wind bell; 5) long horizontal ridge band with a carved cloud pattern, tileable left-right; 6) small tower-like ridge-centre pearl/flame ornament; 7) blank dark lacquered horizontal plaque with a gold border (no text); 8) blank vertical plaque, red with gold border (no text); 9) pair of red lacquered round columns with gilded capitals; 10) row of painted dougong bracket sets under an eave, tileable left-right; 11) large bronze incense cauldron (ding) on three legs; 12) pair of tall stone lanterns with carved roofs. Same pixel scale for all: plaques about one person wide, columns about two people tall. No text or letters anywhere.
```

### 4. 물가와 저잣거리 (파랑 배경)

- **HG2** · 물 무늬 셋(3열 1행, 이어 붙는 정사각형): 강물(잔물결), 연못(연잎 몇 장), 얕은 여울(돌이 비치는 물). 참고 그림: https://raw.githubusercontent.com/dltkdwhdhkd-design/gangho/main/art-src/chatgpt/HG1.png

```
Seamless water texture sheet in exactly the same layout, pixel size and pixel-art style as the reference image: 3 square swatches in one row separated by solid pure blue #0000FF gaps. 1) river water with small ripples and light glints, 2) still pond water with a few lotus leaves, 3) clear shallow stream showing pebbles under the water. Each swatch must tile seamlessly left-right and top-bottom. Crisp chunky pixels, light from the upper left, no text.
```

- **HP5** · 나루와 배(3열 2행): 선착장 판자 토막, 말뚝과 밧줄, 나룻배, 돛단배, 고깃배와 그물, 물가 갈대 무더기. 참고 그림: 벽 그림 묶음의 HP2

```
Sprite sheet for a pixel-art wuxia RPG, 3 columns x 2 rows, exactly the pixel size, outline and palette of the reference image, solid pure blue #0000FF background, wide gaps, nothing touching. Items seen from a high three-quarter top-down view: 1) a wooden pier section with plank deck, 2) wooden mooring posts with coiled rope, 3) a small river ferry boat with a pole, 4) a sailing junk with a tan batten sail, 5) a small fishing boat with a net draped over the side, 6) a clump of riverside reeds. No text.
```

- **HP6** · 저잣거리 좌판(3열 2행): 포목 좌판, 약재 좌판, 그릇 좌판, 만두 찜통 좌판, 장신구 좌판, 짐수레

```
Sprite sheet for a pixel-art wuxia RPG, 3 columns x 2 rows, exactly the pixel size, outline and palette of the reference image, solid pure blue #0000FF background, wide gaps, nothing touching. Market stalls of a Ming-dynasty town seen from a high three-quarter top-down view, each with a cloth awning: 1) cloth and silk bolts stall, 2) herbal medicine stall with drawers and dried roots, 3) pottery and bowls stall, 4) steamed bun stall with stacked bamboo steamers and steam, 5) hairpin and trinket stall, 6) a wooden hand cart loaded with sacks. No text.
```

- **HK3** · 바위 절벽 토막(3열 2행): 절벽 앞면 둘, 절벽 모서리 둘, 바위 계단, 이끼 낀 큰 바위

```
Sprite sheet for a pixel-art wuxia RPG, 3 columns x 2 rows, exactly the pixel size, outline and palette of the reference image, solid pure blue #0000FF background, wide gaps. Cliff pieces seen from a high three-quarter top-down view that can be placed side by side: 1) and 2) two straight cliff face sections of layered grey-brown rock with grass on top, 3) and 4) left and right cliff corner pieces, 5) rough stone steps cut into the cliff, 6) a large mossy boulder. No text.
```
