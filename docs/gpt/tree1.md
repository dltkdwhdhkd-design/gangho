# 강호행 요청 45: 나무: 껍질과 잎 무늬, 잎 뭉치

단계 이름 `tree1` · 종류: 그림 장 · 차례표: https://dltkdwhdhkd-design.github.io/gangho/docs/gpt/index.md

나무 모형(M7, M11)의 줄기와 잎에 입힐 무늬와, 가지에 꽂을 잎 뭉치다.

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

### 1. `TR1.png` — 나무 껍질과 잎 무늬 여섯 (정면, 이어 붙는 정사각형, 3열 2행)

블렌더로 만든 나무의 줄기와 잎 덩어리에 입힌다. 무늬 장이다(빛 방향과 그림자 없이 고르게, 칸마다 꽉 채워서).

```text
Seamless material texture sheet in exactly the same layout, pixel size and pixel-art style as the square texture swatches (roof tiles, wooden planks, cracked earth) in the reference image: 6 square swatches in 3 columns x 2 rows separated by thin solid pure blue #0000FF lines. Flat front view, no perspective, no cast shadows, even lighting. Each swatch is filled edge to edge and must tile seamlessly left-right and top-bottom: 1) pine bark: reddish-brown scaly plates, 2) grey-brown deeply furrowed bark of an old broadleaf tree, 3) dark smooth plum-tree bark with thin horizontal marks, 4) dense dark-green pine needle foliage, 5) dense green broadleaf foliage made of many small leaves, 6) plum blossoms: many small pink-white flowers on thin dark twigs. Crisp chunky pixels, no anti-aliasing, no text.
```

### 2. `TR2.png` — 잎 뭉치 여섯 (옆에서, 3열 2행)

가지에 꽂는 잎 뭉치. 줄기는 그리지 않는다. 가장자리가 파란 바탕과 또렷이 갈려야 오려 낼 수 있다.

```text
Sprite sheet for a pixel-art wuxia RPG, 3 columns x 2 rows, exactly the pixel size, outline and palette of the reference image, solid flat pure blue #0000FF background, wide gaps, nothing touching. Foliage clumps for building trees, each seen from the side, no trunk, hard clean edges against the blue: 1) a flat layered pine bough, wider than tall, 2) a rounded clump of green broadleaf leaves, 3) a plum branch tip covered with pink-white blossoms, 4) a spray of bamboo leaves, 5) a bare twisted dead branch with a few twigs, 6) a clump of orange-red autumn leaves. Crisp chunky pixels, no anti-aliasing, no text.
```

## 스스로 확인

- 칸 수와 열·행이 항목대로인가
- 글자가 한 자도 없는가
- 무늬 장은 칸을 꽉 채웠고 네 변이 이어 붙는가. 그림자가 없는가
- 바탕(칸 사이)이 단색 파랑인가

## 넘기는 것

- 위의 파일 이름 그대로 넣은 압축 파일 하나: `gangho_tree1.zip`. 원본 크기의 PNG로(줄이거나 잘라 내지 않는다).
- 압축 파일을 만들 수 없으면 그림을 대화에 그대로 올리고, 그림마다 파일 이름을 한 줄씩 적는다.
- 게임 코드는 고치지 않는다. 넣는 일은 Claude가 한다.

---

다음 단계: 46번 `m11` 모형 M11: 나무 다섯 — https://dltkdwhdhkd-design.github.io/gangho/docs/gpt/m11.md
