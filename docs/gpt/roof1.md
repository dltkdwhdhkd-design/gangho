# 강호행 요청 34: 지붕: 문파 지붕 무늬, 지붕 장식과 현판

단계 이름 `roof1` · 종류: 그림 장 · 차례표: https://dltkdwhdhkd-design.github.io/gangho/docs/gpt/index.md

건물 바깥은 거의 다 받았고 이 두 장이 남았다. 문파마다 다른 기와 빛깔, 용마루 끝 장식과 처마의 현판이다.

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

### 1. `HR3.png` — 문파 지붕 무늬 여섯 (위에서 비스듬히, 이어 붙는 정사각형, 3열 2행)

건물 지붕 모형에 입히는 기와 무늬다. 문파마다 기와 빛깔이 다르다. 무늬 장이다(칸마다 꽉 채워서, 네 변이 이어 붙게). 3열 2행 여섯 칸.

```text
Roof tile texture sheet in exactly the same layout, pixel size and pixel-art style as the reference image: 3 columns x 2 rows of square seamless roof-tile swatches separated by blue lines, solid pure blue #0000FF gaps. Each swatch is a tileable pattern of curved Chinese roof tiles seen from above at a slight angle, with clear tile ridges and dark grooves, crisp chunky pixels, light from the upper left, no text. Swatches: 1) imperial yellow-gold glazed tiles (Shaolin); 2) jade-green glazed tiles (Wudang, Qingcheng); 3) deep blue glazed tiles (Namgung, Kunlun); 4) black glazed tiles with a slight purple sheen (Tang clan); 5) grey unglazed clay tiles with moss patches (Zhongnan, Kongtong); 6) red-brown glazed tiles (Hua, Peng). All six must tile seamlessly left-right and top-bottom.
```

### 2. `HE1.png` — 지붕 장식과 현판 열둘 (정면과 비스듬히 위에서, 4열 3행)

용마루 끝과 처마에 붙이는 장식, 처마 밑의 현판과 기둥이다. 4열 3행 열두 칸. 현판은 글자 없이 빈 채로.

```text
Sprite sheet of Chinese roof ornaments and hall decorations for a pixel-art wuxia RPG, 4 columns x 3 rows grid, in exactly the pixel size, outline and palette of the reference images, solid pure blue #0000FF background, wide gaps, nothing touching. Items: 1) dragon-head ridge-end ornament (chiwen), dark grey glazed, facing right; 2) the same in gold-yellow; 3) row of five small roof-ridge guardian beasts on a short ridge piece; 4) upturned flying eave corner piece with a hanging bronze wind bell; 5) long horizontal ridge band with a carved cloud pattern, tileable left-right; 6) small tower-like ridge-centre pearl/flame ornament; 7) blank dark lacquered horizontal plaque with a gold border (no text); 8) blank vertical plaque, red with gold border (no text); 9) pair of red lacquered round columns with gilded capitals; 10) row of painted dougong bracket sets under an eave, tileable left-right; 11) large bronze incense cauldron (ding) on three legs; 12) pair of tall stone lanterns with carved roofs. Same pixel scale for all: plaques about one person wide, columns about two people tall. No text or letters anywhere.
```

## 스스로 확인

- 칸 수와 열·행이 항목대로인가
- 글자가 한 자도 없는가
- 무늬 장은 칸을 꽉 채웠고 네 변이 이어 붙는가. 그림자가 없는가
- 바탕(칸 사이)이 단색 파랑인가

## 넘기는 것

- 위의 파일 이름 그대로 넣은 압축 파일 하나: `gangho_roof1.zip`. 원본 크기의 PNG로(줄이거나 잘라 내지 않는다).
- 압축 파일을 만들 수 없으면 그림을 대화에 그대로 올리고, 그림마다 파일 이름을 한 줄씩 적는다.
- 게임 코드는 고치지 않는다. 넣는 일은 Claude가 한다.

---

다음 단계: 35번 `m6` 모형 M6: 장터와 나루 — https://dltkdwhdhkd-design.github.io/gangho/docs/gpt/m6.md
