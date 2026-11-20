# 강호행 요청 44: 산길: 바위 무늬, 산길에 놓는 것

단계 이름 `rock1` · 종류: 그림 장 · 차례표: https://dltkdwhdhkd-design.github.io/gangho/docs/gpt/index.md

바위와 절벽은 블렌더 모형인데 빛깔이 갈색 한 가지다. 산마다 달리 입힐 바위 무늬와 산길의 소품이다.

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
- 전에 받은 절벽(같은 바위 빛과 도트 굵기로): https://dltkdwhdhkd-design.github.io/gangho/art-src/chatgpt/HK3.png

주소를 못 열면 주인에게 그 파일을 올려 달라고 말한다.

## 만들 것

### 1. `HK4.png` — 바위 무늬 여섯 (정면, 이어 붙는 정사각형, 3열 2행)

바위와 절벽 모형의 겉에 입힌다. 무늬 장이다(빛 방향과 그림자 없이 고르게, 칸마다 꽉 채워서). 전에 받은 절벽 그림 HK3과 같은 바위 빛, 같은 도트 굵기로.

```text
Texture sheet for a pixel-art wuxia RPG: six square seamless tileable rock textures in a grid of 3 columns x 2 rows, the squares separated by a thin pure blue #0000FF gutter. Flat front view, no perspective, no cast shadows, even lighting. Each square is filled edge to edge and tiles seamlessly on all four sides. Same pixel size, outline weight and colours as the rock part of the earlier cliff sheet HK3 (open the HK3 image linked in this document). 1) layered grey-brown rock strata cracked into uneven blocks (the HK3 rock, without any grass), 2) pale grey granite with long cracks, 3) the same grey-brown rock half covered with patches of green moss, 4) red sandstone in horizontal layers, 5) rock under snow: mostly white snow with dark rock showing through in streaks, 6) weathered dressed stone blocks of a retaining wall in regular courses. Crisp chunky pixels, no anti-aliasing, no text.
```

### 2. `HK5.png` — 산길에 놓는 것 여섯 (비스듬히 위에서, 3열 2행)

산길 가에 놓는다. 전에 받은 절벽 그림 HK3과 같은 도트 굵기로.

```text
Sprite sheet for a pixel-art wuxia RPG, 3 columns x 2 rows, exactly the pixel size, outline and palette of the reference image, solid flat pure blue #0000FF background, wide gaps, nothing touching. Things along a mountain path seen from a high three-quarter top-down view: 1) a section of old wooden guard rail made of rough logs, about 3 times wider than tall, tiles side by side, 2) two wooden posts joined by a sagging rope, tiles side by side, 3) a waist-high stone trail marker, the face left empty, 4) a cairn of piled stones with faded cloth strips tied to a branch, 5) a fallen dead tree trunk with moss, 6) a short flight of log steps set into earth. Crisp chunky pixels, no anti-aliasing, no text.
```

## 스스로 확인

- 칸 수와 열·행이 항목대로인가
- 글자가 한 자도 없는가
- 무늬 장은 칸을 꽉 채웠고 네 변이 이어 붙는가. 그림자가 없는가
- 바탕(칸 사이)이 단색 파랑인가

## 넘기는 것

- 위의 파일 이름 그대로 넣은 압축 파일 하나: `gangho_rock1.zip`. 원본 크기의 PNG로(줄이거나 잘라 내지 않는다).
- 압축 파일을 만들 수 없으면 그림을 대화에 그대로 올리고, 그림마다 파일 이름을 한 줄씩 적는다.
- 게임 코드는 고치지 않는다. 넣는 일은 Claude가 한다.

---

다음 단계: 45번 `tree1` 나무: 껍질과 잎 무늬, 잎 뭉치 — https://dltkdwhdhkd-design.github.io/gangho/docs/gpt/tree1.md
