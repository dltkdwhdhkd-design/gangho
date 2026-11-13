# Gemini 요청문 (한 칸씩 복사해서 붙인다)

Gemini는 주소를 열지 못하니, 아래 칸을 **하나씩** 복사해 붙이고 적힌 그림을 같이 올린다. 칸마다 규칙이 다 들어 있어서 앞뒤 칸을 몰라도 된다. 같은 대화에서 이어 가면 그림체가 맞춰진다.

올릴 그림(저장소에서 내려받기)
- 사람 도트용: `art-src/ref-people.png` (https://github.com/dltkdwhdhkd-design/gangho/blob/main/art-src/ref-people.png)
- 벽·지붕·소품용: `art-src/ref-walls.png` (https://github.com/dltkdwhdhkd-design/gangho/blob/main/art-src/ref-walls.png)

받은 그림은 칸 제목의 파일 이름 그대로 저장소 `art-src/gemini/`에 올리거나 Claude 대화에 붙인다. 오른쪽 아래 Gemini 표시는 Claude가 지운다. 바탕이 마젠타·파랑이 아니고 검정이거나, 칸 수가 틀리면 "바탕은 단색 마젠타로, 칸은 2열 3행으로 다시"라고 한다.

## 사람 걷기 도트 (사람마다 a 다음 b. 첫 a에 ref-people.png를 올린다)

### HN6a · 문파 제자 앞·뒤

```text
명나라를 배경으로 한 무협 RPG, 일검풍운결(Wandering Sword) 같은 HD-2D 게임의 인물 도트야. 첨부한 그림(ref-people.png)의 왼쪽 두 칸 배치와 오른쪽 그림의 세밀함으로: 3.5등신, 한 인물의 키가 그림에서 300픽셀쯤, 얼굴에 눈·눈썹·입이 작게 찍히고, 머리카락은 3~4단, 옷은 주름과 겹침이 보이게 4~5단 명암, 외곽선은 짙은 갈색이나 짙은 남색 1도트, 빛은 왼쪽 위에서 약하게. 게임에서 8분의 1로 줄여 쓰니 얼굴은 옷보다 밝게, 앞머리가 눈을 가리지 않게, 검은 옷은 짙은 남회색으로. 배경은 완전한 단색 마젠타(#FF00FF), 그림 안에는 마젠타를 쓰지 마. 바닥 그림자, 빛번짐 없이.

정사각형 한 장(1:1)을 2열 3행으로 나눠 같은 인물을 6번 그려. 1열은 정면, 2열은 뒷모습. 1행 차렷, 2행 왼발 내딛기, 3행 오른발 내딛기. 팔은 다리와 반대로 흔들리고, 손에 든 물건은 여섯 칸 모두 같게. 여섯 칸 모두 키·머리 크기·옷·색이 같고, 칸끼리 넉넉히 떼.

인물: 이십 대 남자 문파 제자. 상투에 초록 댕기, 몸에 맞는 짙은 초록 교령 수련복에 검은 띠와 팔토시, 등에 검은 칼집의 검, 검은 장화
```

### HN6b · 문파 제자 옆

```text
방금 그린 그 인물을 정사각형 한 장(1:1)에 2열 3행으로 6번 그려. 여섯 칸 모두 왼쪽을 보는 옆모습. 1열은 차렷, 왼발 내딛기, 오른발 내딛기. 2열은 숨 쉬는 차렷, 왼발 다음 중간 걸음(뒷발이 들려 앞으로 넘어옴), 오른발 다음 중간 걸음. 키와 색은 앞서 그린 그림과 같게. 배경은 앞 그림과 같은 단색 마젠타(#FF00FF), 빛번짐과 바닥 그림자 없이, 각진 도트로.
```

### HN7a · 부호 앞·뒤

```text
명나라를 배경으로 한 무협 RPG, 일검풍운결(Wandering Sword) 같은 HD-2D 게임의 인물 도트야. 첨부한 그림(ref-people.png)의 왼쪽 두 칸 배치와 오른쪽 그림의 세밀함으로: 3.5등신, 한 인물의 키가 그림에서 300픽셀쯤, 얼굴에 눈·눈썹·입이 작게 찍히고, 머리카락은 3~4단, 옷은 주름과 겹침이 보이게 4~5단 명암, 외곽선은 짙은 갈색이나 짙은 남색 1도트, 빛은 왼쪽 위에서 약하게. 게임에서 8분의 1로 줄여 쓰니 얼굴은 옷보다 밝게, 앞머리가 눈을 가리지 않게, 검은 옷은 짙은 남회색으로. 배경은 완전한 단색 마젠타(#FF00FF), 그림 안에는 마젠타를 쓰지 마. 바닥 그림자, 빛번짐 없이.

정사각형 한 장(1:1)을 2열 3행으로 나눠 같은 인물을 6번 그려. 1열은 정면, 2열은 뒷모습. 1행 차렷, 2행 왼발 내딛기, 3행 오른발 내딛기. 팔은 다리와 반대로 흔들리고, 손에 든 물건은 여섯 칸 모두 같게. 여섯 칸 모두 키·머리 크기·옷·색이 같고, 칸끼리 넉넉히 떼.

인물: 오십 대 부유한 상인. 약간 통통하고 가는 콧수염, 검은 네모 유건, 금빛 둥근 무늬가 있는 짙은 붉은 비단옷, 허리에 옥 패물, 수놓은 신
```

### HN7b · 부호 옆

```text
방금 그린 그 인물을 정사각형 한 장(1:1)에 2열 3행으로 6번 그려. 여섯 칸 모두 왼쪽을 보는 옆모습. 1열은 차렷, 왼발 내딛기, 오른발 내딛기. 2열은 숨 쉬는 차렷, 왼발 다음 중간 걸음(뒷발이 들려 앞으로 넘어옴), 오른발 다음 중간 걸음. 키와 색은 앞서 그린 그림과 같게. 배경은 앞 그림과 같은 단색 마젠타(#FF00FF), 빛번짐과 바닥 그림자 없이, 각진 도트로.
```

### HN8a · 순라군 앞·뒤

```text
명나라를 배경으로 한 무협 RPG, 일검풍운결(Wandering Sword) 같은 HD-2D 게임의 인물 도트야. 첨부한 그림(ref-people.png)의 왼쪽 두 칸 배치와 오른쪽 그림의 세밀함으로: 3.5등신, 한 인물의 키가 그림에서 300픽셀쯤, 얼굴에 눈·눈썹·입이 작게 찍히고, 머리카락은 3~4단, 옷은 주름과 겹침이 보이게 4~5단 명암, 외곽선은 짙은 갈색이나 짙은 남색 1도트, 빛은 왼쪽 위에서 약하게. 게임에서 8분의 1로 줄여 쓰니 얼굴은 옷보다 밝게, 앞머리가 눈을 가리지 않게, 검은 옷은 짙은 남회색으로. 배경은 완전한 단색 마젠타(#FF00FF), 그림 안에는 마젠타를 쓰지 마. 바닥 그림자, 빛번짐 없이.

정사각형 한 장(1:1)을 2열 3행으로 나눠 같은 인물을 6번 그려. 1열은 정면, 2열은 뒷모습. 1행 차렷, 2행 왼발 내딛기, 3행 오른발 내딛기. 팔은 다리와 반대로 흔들리고, 손에 든 물건은 여섯 칸 모두 같게. 여섯 칸 모두 키·머리 크기·옷·색이 같고, 칸끼리 넉넉히 떼.

인물: 고을 순라군. 붉은 술이 달린 둥근 쇠투구, 가벼운 미늘 갑옷 위에 붉은 솜옷, 짙은 바지와 장화, 오른손에 긴 창을 곧게 세워 듦
```

### HN8b · 순라군 옆

```text
방금 그린 그 인물을 정사각형 한 장(1:1)에 2열 3행으로 6번 그려. 여섯 칸 모두 왼쪽을 보는 옆모습. 1열은 차렷, 왼발 내딛기, 오른발 내딛기. 2열은 숨 쉬는 차렷, 왼발 다음 중간 걸음(뒷발이 들려 앞으로 넘어옴), 오른발 다음 중간 걸음. 키와 색은 앞서 그린 그림과 같게. 배경은 앞 그림과 같은 단색 마젠타(#FF00FF), 빛번짐과 바닥 그림자 없이, 각진 도트로.
```

### HN9a · 덩치(대장장이·산적) 앞·뒤

```text
명나라를 배경으로 한 무협 RPG, 일검풍운결(Wandering Sword) 같은 HD-2D 게임의 인물 도트야. 첨부한 그림(ref-people.png)의 왼쪽 두 칸 배치와 오른쪽 그림의 세밀함으로: 3.5등신, 한 인물의 키가 그림에서 300픽셀쯤, 얼굴에 눈·눈썹·입이 작게 찍히고, 머리카락은 3~4단, 옷은 주름과 겹침이 보이게 4~5단 명암, 외곽선은 짙은 갈색이나 짙은 남색 1도트, 빛은 왼쪽 위에서 약하게. 게임에서 8분의 1로 줄여 쓰니 얼굴은 옷보다 밝게, 앞머리가 눈을 가리지 않게, 검은 옷은 짙은 남회색으로. 배경은 완전한 단색 마젠타(#FF00FF), 그림 안에는 마젠타를 쓰지 마. 바닥 그림자, 빛번짐 없이.

정사각형 한 장(1:1)을 2열 3행으로 나눠 같은 인물을 6번 그려. 1열은 정면, 2열은 뒷모습. 1행 차렷, 2행 왼발 내딛기, 3행 오른발 내딛기. 팔은 다리와 반대로 흔들리고, 손에 든 물건은 여섯 칸 모두 같게. 여섯 칸 모두 키·머리 크기·옷·색이 같고, 칸끼리 넉넉히 떼.

인물: 사십 대 수염 난 덩치 큰 남자. 굵은 맨팔, 맨가슴 위에 짙은 갈색 가죽 조끼, 붉은 머리띠, 넓은 허리끈, 발목을 묶은 헐렁한 회색 바지, 짚신
```

### HN9b · 덩치(대장장이·산적) 옆

```text
방금 그린 그 인물을 정사각형 한 장(1:1)에 2열 3행으로 6번 그려. 여섯 칸 모두 왼쪽을 보는 옆모습. 1열은 차렷, 왼발 내딛기, 오른발 내딛기. 2열은 숨 쉬는 차렷, 왼발 다음 중간 걸음(뒷발이 들려 앞으로 넘어옴), 오른발 다음 중간 걸음. 키와 색은 앞서 그린 그림과 같게. 배경은 앞 그림과 같은 단색 마젠타(#FF00FF), 빛번짐과 바닥 그림자 없이, 각진 도트로.
```

### HN10a · 점소이 앞·뒤

```text
명나라를 배경으로 한 무협 RPG, 일검풍운결(Wandering Sword) 같은 HD-2D 게임의 인물 도트야. 첨부한 그림(ref-people.png)의 왼쪽 두 칸 배치와 오른쪽 그림의 세밀함으로: 3.5등신, 한 인물의 키가 그림에서 300픽셀쯤, 얼굴에 눈·눈썹·입이 작게 찍히고, 머리카락은 3~4단, 옷은 주름과 겹침이 보이게 4~5단 명암, 외곽선은 짙은 갈색이나 짙은 남색 1도트, 빛은 왼쪽 위에서 약하게. 게임에서 8분의 1로 줄여 쓰니 얼굴은 옷보다 밝게, 앞머리가 눈을 가리지 않게, 검은 옷은 짙은 남회색으로. 배경은 완전한 단색 마젠타(#FF00FF), 그림 안에는 마젠타를 쓰지 마. 바닥 그림자, 빛번짐 없이.

정사각형 한 장(1:1)을 2열 3행으로 나눠 같은 인물을 6번 그려. 1열은 정면, 2열은 뒷모습. 1행 차렷, 2행 왼발 내딛기, 3행 오른발 내딛기. 팔은 다리와 반대로 흔들리고, 손에 든 물건은 여섯 칸 모두 같게. 여섯 칸 모두 키·머리 크기·옷·색이 같고, 칸끼리 넉넉히 떼.

인물: 이십 대 객잔 점소이. 작은 검은 천 모자, 왼어깨에 흰 수건, 소매를 걷은 짧은 청회색 저고리, 긴 흰 앞치마, 검은 바지, 친근한 얼굴
```

### HN10b · 점소이 옆

```text
방금 그린 그 인물을 정사각형 한 장(1:1)에 2열 3행으로 6번 그려. 여섯 칸 모두 왼쪽을 보는 옆모습. 1열은 차렷, 왼발 내딛기, 오른발 내딛기. 2열은 숨 쉬는 차렷, 왼발 다음 중간 걸음(뒷발이 들려 앞으로 넘어옴), 오른발 다음 중간 걸음. 키와 색은 앞서 그린 그림과 같게. 배경은 앞 그림과 같은 단색 마젠타(#FF00FF), 빛번짐과 바닥 그림자 없이, 각진 도트로.
```

### HN11a · 아전 앞·뒤

```text
명나라를 배경으로 한 무협 RPG, 일검풍운결(Wandering Sword) 같은 HD-2D 게임의 인물 도트야. 첨부한 그림(ref-people.png)의 왼쪽 두 칸 배치와 오른쪽 그림의 세밀함으로: 3.5등신, 한 인물의 키가 그림에서 300픽셀쯤, 얼굴에 눈·눈썹·입이 작게 찍히고, 머리카락은 3~4단, 옷은 주름과 겹침이 보이게 4~5단 명암, 외곽선은 짙은 갈색이나 짙은 남색 1도트, 빛은 왼쪽 위에서 약하게. 게임에서 8분의 1로 줄여 쓰니 얼굴은 옷보다 밝게, 앞머리가 눈을 가리지 않게, 검은 옷은 짙은 남회색으로. 배경은 완전한 단색 마젠타(#FF00FF), 그림 안에는 마젠타를 쓰지 마. 바닥 그림자, 빛번짐 없이.

정사각형 한 장(1:1)을 2열 3행으로 나눠 같은 인물을 6번 그려. 1열은 정면, 2열은 뒷모습. 1행 차렷, 2행 왼발 내딛기, 3행 오른발 내딛기. 팔은 다리와 반대로 흔들리고, 손에 든 물건은 여섯 칸 모두 같게. 여섯 칸 모두 키·머리 크기·옷·색이 같고, 칸끼리 넉넉히 떼.

인물: 사십 대 고을 관아 아전. 검은 사모, 띠를 두른 짙은 남색 관복, 손에 말린 문서, 검은 장화, 엄한 얼굴
```

### HN11b · 아전 옆

```text
방금 그린 그 인물을 정사각형 한 장(1:1)에 2열 3행으로 6번 그려. 여섯 칸 모두 왼쪽을 보는 옆모습. 1열은 차렷, 왼발 내딛기, 오른발 내딛기. 2열은 숨 쉬는 차렷, 왼발 다음 중간 걸음(뒷발이 들려 앞으로 넘어옴), 오른발 다음 중간 걸음. 키와 색은 앞서 그린 그림과 같게. 배경은 앞 그림과 같은 단색 마젠타(#FF00FF), 빛번짐과 바닥 그림자 없이, 각진 도트로.
```

### HN12a · 개방 거지 앞·뒤

```text
명나라를 배경으로 한 무협 RPG, 일검풍운결(Wandering Sword) 같은 HD-2D 게임의 인물 도트야. 첨부한 그림(ref-people.png)의 왼쪽 두 칸 배치와 오른쪽 그림의 세밀함으로: 3.5등신, 한 인물의 키가 그림에서 300픽셀쯤, 얼굴에 눈·눈썹·입이 작게 찍히고, 머리카락은 3~4단, 옷은 주름과 겹침이 보이게 4~5단 명암, 외곽선은 짙은 갈색이나 짙은 남색 1도트, 빛은 왼쪽 위에서 약하게. 게임에서 8분의 1로 줄여 쓰니 얼굴은 옷보다 밝게, 앞머리가 눈을 가리지 않게, 검은 옷은 짙은 남회색으로. 배경은 완전한 단색 마젠타(#FF00FF), 그림 안에는 마젠타를 쓰지 마. 바닥 그림자, 빛번짐 없이.

정사각형 한 장(1:1)을 2열 3행으로 나눠 같은 인물을 6번 그려. 1열은 정면, 2열은 뒷모습. 1행 차렷, 2행 왼발 내딛기, 3행 오른발 내딛기. 팔은 다리와 반대로 흔들리고, 손에 든 물건은 여섯 칸 모두 같게. 여섯 칸 모두 키·머리 크기·옷·색이 같고, 칸끼리 넉넉히 떼.

인물: 개방 사람. 헝겊으로 묶은 헝클어진 머리, 기운 자국 많은 누더기 갈색·회색 옷, 허리에 술 호리병, 대나무 지팡이, 짚신, 넉살 좋은 웃음
```

### HN12b · 개방 거지 옆

```text
방금 그린 그 인물을 정사각형 한 장(1:1)에 2열 3행으로 6번 그려. 여섯 칸 모두 왼쪽을 보는 옆모습. 1열은 차렷, 왼발 내딛기, 오른발 내딛기. 2열은 숨 쉬는 차렷, 왼발 다음 중간 걸음(뒷발이 들려 앞으로 넘어옴), 오른발 다음 중간 걸음. 키와 색은 앞서 그린 그림과 같게. 배경은 앞 그림과 같은 단색 마젠타(#FF00FF), 빛번짐과 바닥 그림자 없이, 각진 도트로.
```

### HN13a · 마을 아이 앞·뒤

```text
명나라를 배경으로 한 무협 RPG, 일검풍운결(Wandering Sword) 같은 HD-2D 게임의 인물 도트야. 첨부한 그림(ref-people.png)의 왼쪽 두 칸 배치와 오른쪽 그림의 세밀함으로: 3.5등신, 한 인물의 키가 그림에서 300픽셀쯤, 얼굴에 눈·눈썹·입이 작게 찍히고, 머리카락은 3~4단, 옷은 주름과 겹침이 보이게 4~5단 명암, 외곽선은 짙은 갈색이나 짙은 남색 1도트, 빛은 왼쪽 위에서 약하게. 게임에서 8분의 1로 줄여 쓰니 얼굴은 옷보다 밝게, 앞머리가 눈을 가리지 않게, 검은 옷은 짙은 남회색으로. 배경은 완전한 단색 마젠타(#FF00FF), 그림 안에는 마젠타를 쓰지 마. 바닥 그림자, 빛번짐 없이.

정사각형 한 장(1:1)을 2열 3행으로 나눠 같은 인물을 6번 그려. 1열은 정면, 2열은 뒷모습. 1행 차렷, 2행 왼발 내딛기, 3행 오른발 내딛기. 팔은 다리와 반대로 흔들리고, 손에 든 물건은 여섯 칸 모두 같게. 여섯 칸 모두 키·머리 크기·옷·색이 같고, 칸끼리 넉넉히 떼.

인물: 여덟 살쯤 마을 아이. 양쪽에 작은 상투 두 개, 빛바랜 붉은 짧은 저고리와 파란 바지, 천신, 장난스러운 얼굴. 키는 어른의 3분의 2쯤
```

### HN13b · 마을 아이 옆

```text
방금 그린 그 인물을 정사각형 한 장(1:1)에 2열 3행으로 6번 그려. 여섯 칸 모두 왼쪽을 보는 옆모습. 1열은 차렷, 왼발 내딛기, 오른발 내딛기. 2열은 숨 쉬는 차렷, 왼발 다음 중간 걸음(뒷발이 들려 앞으로 넘어옴), 오른발 다음 중간 걸음. 키와 색은 앞서 그린 그림과 같게. 배경은 앞 그림과 같은 단색 마젠타(#FF00FF), 빛번짐과 바닥 그림자 없이, 각진 도트로.
```

## 문파·세가 전각 벽과 지붕 (ref-walls.png를 올린다)

### HS1 · 소림사, 무당파, 화산파

```text
Building wall parts sheet in exactly the same layout, scale, pixel size and pixel-art style as the reference image: 3 columns x 2 rows on a solid flat pure blue #0000FF background. Top row: three FRONT walls (flat orthographic elevation, walls only, no roof, top edge cut flat, the main door exactly in the horizontal centre, raised stone plinth at the bottom). Bottom row: the matching SIDE wall of each building with a triangular gable top and one window. Crisp chunky hand-placed pixels, dark 1-pixel outlines, warm muted palette with light from the upper left, no text, no letters, no shadows on the background, wide blue gaps between pieces. These are the grand main halls of famous martial-arts sects in a wuxia world, so they must look rich, imposing and distinctive, far grander than a village house: tall walls, heavy carved beams, ornate lattice, painted bracket bands, big double doors. Column 1, Shaolin Temple main hall: ochre-yellow walls, thick red lacquered round columns, golden-brown carved lattice doors with swastika (manji) and lotus patterns, a deep red and gold beam band, bronze door studs, grey granite plinth with carved lotus base. Column 2, Wudang Taoist hall: plain white-washed walls with dark wood frame, black and white yin-yang taiji roundel above the door, jade-green painted beams with cloud scroll patterns, dark green lattice windows, grey stone base. Column 3, Mount Hua sword sect hall: pale granite stone walls with crimson wooden frame, plum blossom carvings on the beams and door panels, deep red double door with brass rings, cliff-stone plinth.
```

### HS2 · 종남파, 아미파, 곤륜파

```text
Building wall parts sheet in exactly the same layout, scale, pixel size and pixel-art style as the reference image: 3 columns x 2 rows on a solid flat pure blue #0000FF background. Top row: three FRONT walls (flat orthographic elevation, walls only, no roof, top edge cut flat, the main door exactly in the horizontal centre, raised stone plinth at the bottom). Bottom row: the matching SIDE wall of each building with a triangular gable top and one window. Crisp chunky hand-placed pixels, dark 1-pixel outlines, warm muted palette with light from the upper left, no text, no letters, no shadows on the background, wide blue gaps between pieces. These are the grand main halls of famous martial-arts sects in a wuxia world, so they must look rich, imposing and distinctive, far grander than a village house: tall walls, heavy carved beams, ornate lattice, painted bracket bands, big double doors. Column 1, Zhongnan Taoist sect hall: stern dark blue-grey wooden frame, grey stone walls, star-constellation (Big Dipper) carved panel above the door, iron-studded black double door, plain heavy beams. Column 2, Emei nunnery hall: pale cream walls, soft violet and gold painted beams with lotus and cloud motifs, round moon-gate shaped door frame with wooden doors, delicate white lattice windows. Column 3, Kunlun mountain sect hall: white marble-like stone walls, icy sky-blue beams, silver-grey frame, snow-capped mountain carving above a heavy white-grey double door, thick stone plinth.
```

### HS3 · 공동파, 점창파, 청성파

```text
Building wall parts sheet in exactly the same layout, scale, pixel size and pixel-art style as the reference image: 3 columns x 2 rows on a solid flat pure blue #0000FF background. Top row: three FRONT walls (flat orthographic elevation, walls only, no roof, top edge cut flat, the main door exactly in the horizontal centre, raised stone plinth at the bottom). Bottom row: the matching SIDE wall of each building with a triangular gable top and one window. Crisp chunky hand-placed pixels, dark 1-pixel outlines, warm muted palette with light from the upper left, no text, no letters, no shadows on the background, wide blue gaps between pieces. These are the grand main halls of famous martial-arts sects in a wuxia world, so they must look rich, imposing and distinctive, far grander than a village house: tall walls, heavy carved beams, ornate lattice, painted bracket bands, big double doors. Column 1, Kongtong sect hall: rugged brown rock-block walls, ochre timber, carved fierce beast-head brackets, heavy bronze door, rough stone base. Column 2, Diancang sect hall (southern Yunnan): dark polished wood and woven bamboo panels, green and terracotta painted beams, slatted bamboo lattice windows, wooden double door. Column 3, Qingcheng sect hall: mossy grey stone base, deep green-lacquered columns, green beams with mountain-mist cloud patterns, carved pine motifs, dark wooden doors.
```

### HS4 · 개방, 남궁세가, 모용세가

```text
Building wall parts sheet in exactly the same layout, scale, pixel size and pixel-art style as the reference image: 3 columns x 2 rows on a solid flat pure blue #0000FF background. Top row: three FRONT walls (flat orthographic elevation, walls only, no roof, top edge cut flat, the main door exactly in the horizontal centre, raised stone plinth at the bottom). Bottom row: the matching SIDE wall of each building with a triangular gable top and one window. Crisp chunky hand-placed pixels, dark 1-pixel outlines, warm muted palette with light from the upper left, no text, no letters, no shadows on the background, wide blue gaps between pieces. These are the grand main halls of famous martial-arts sects in a wuxia world, so they must look rich, imposing and distinctive, far grander than a village house: tall walls, heavy carved beams, ornate lattice, painted bracket bands, big double doors. Column 1, Beggars' Sect headquarters: large but humble patched hall of weathered planks, woven bamboo mats and straw, mismatched patches, a big gourd hung beside a plain plank double door, rope-bound posts, rough stone base. Column 2, Namgung family manor (richest sword clan): imposing deep navy-blue lacquered frame with gold trim, white walls, a gold sword emblem above a massive gate-like double door with rows of brass studs, carved granite plinth with steps. Column 3, Murong family manor (elegant Jiangnan style): white-washed walls with black tile edging, a round moon window on each side, black lacquered double door, graceful slender dark wood columns, plum-blossom lattice.
```

### HS5 · 제갈세가, 사천당가, 하북팽가

```text
Building wall parts sheet in exactly the same layout, scale, pixel size and pixel-art style as the reference image: 3 columns x 2 rows on a solid flat pure blue #0000FF background. Top row: three FRONT walls (flat orthographic elevation, walls only, no roof, top edge cut flat, the main door exactly in the horizontal centre, raised stone plinth at the bottom). Bottom row: the matching SIDE wall of each building with a triangular gable top and one window. Crisp chunky hand-placed pixels, dark 1-pixel outlines, warm muted palette with light from the upper left, no text, no letters, no shadows on the background, wide blue gaps between pieces. These are the grand main halls of famous martial-arts sects in a wuxia world, so they must look rich, imposing and distinctive, far grander than a village house: tall walls, heavy carved beams, ornate lattice, painted bracket bands, big double doors. Column 1, Zhuge family manor (strategists): dark green lacquered frame, eight-trigram bagua roundel above the door, intricate geometric interlocking lattice like puzzle mechanisms, scholarly wooden double door, grey stone base. Column 2, Sichuan Tang family manor (poison and hidden weapons): dark purple-black lacquered wood, iron studs and iron bands, narrow barred windows, carved centipede and snake motifs on the beams, black double door with iron rings. Column 3, Hebei Peng family manor (saber clan): massive northern-style red-brown timber and grey brick, heavy black iron fittings, crossed broadsword emblem above a thick red double door, coarse stone plinth.
```

### HS6 · 황보세가, 산동악가, 신창양가

```text
Building wall parts sheet in exactly the same layout, scale, pixel size and pixel-art style as the reference image: 3 columns x 2 rows on a solid flat pure blue #0000FF background. Top row: three FRONT walls (flat orthographic elevation, walls only, no roof, top edge cut flat, the main door exactly in the horizontal centre, raised stone plinth at the bottom). Bottom row: the matching SIDE wall of each building with a triangular gable top and one window. Crisp chunky hand-placed pixels, dark 1-pixel outlines, warm muted palette with light from the upper left, no text, no letters, no shadows on the background, wide blue gaps between pieces. These are the grand main halls of famous martial-arts sects in a wuxia world, so they must look rich, imposing and distinctive, far grander than a village house: tall walls, heavy carved beams, ornate lattice, painted bracket bands, big double doors. Column 1, Hwangbo clan hall (Hebei fist masters): grey brick walls with gold-painted beams, heavy studded red double door, carved tiger heads on the beam ends, granite plinth. Column 2, Ak clan hall (loyal spear clan of Shandong): sturdy dark red timber frame, white walls, a carved spear-and-banner motif above the door, black iron-bound door. Column 3, Yang clan hall (spear clan): warm ochre walls, red-brown beams with pear-blossom carvings, wide double door with brass rings, racks of spears painted on the side panels.
```

### HS7 · 진주언가, 광동진가, 해남파

```text
Building wall parts sheet in exactly the same layout, scale, pixel size and pixel-art style as the reference image: 3 columns x 2 rows on a solid flat pure blue #0000FF background. Top row: three FRONT walls (flat orthographic elevation, walls only, no roof, top edge cut flat, the main door exactly in the horizontal centre, raised stone plinth at the bottom). Bottom row: the matching SIDE wall of each building with a triangular gable top and one window. Crisp chunky hand-placed pixels, dark 1-pixel outlines, warm muted palette with light from the upper left, no text, no letters, no shadows on the background, wide blue gaps between pieces. These are the grand main halls of famous martial-arts sects in a wuxia world, so they must look rich, imposing and distinctive, far grander than a village house: tall walls, heavy carved beams, ornate lattice, painted bracket bands, big double doors. Column 1, Eon clan hall (iron-body fist clan): rough dark grey stone walls, iron bands across the beams, massive iron door with big rivets, plain heavy plinth. Column 2, Jin clan hall of Guangdong: southern style, light grey brick with green glazed window grilles, red and green painted beams, carved wooden screen above a wide door. Column 3, Hainan sword sect hall (island by the sea): whitewashed coral-stone walls, sea-blue beams with wave patterns, wooden door with shell inlays, weathered stone base.
```

### HS8 · 천산파, 전진교, 모산파

```text
Building wall parts sheet in exactly the same layout, scale, pixel size and pixel-art style as the reference image: 3 columns x 2 rows on a solid flat pure blue #0000FF background. Top row: three FRONT walls (flat orthographic elevation, walls only, no roof, top edge cut flat, the main door exactly in the horizontal centre, raised stone plinth at the bottom). Bottom row: the matching SIDE wall of each building with a triangular gable top and one window. Crisp chunky hand-placed pixels, dark 1-pixel outlines, warm muted palette with light from the upper left, no text, no letters, no shadows on the background, wide blue gaps between pieces. These are the grand main halls of famous martial-arts sects in a wuxia world, so they must look rich, imposing and distinctive, far grander than a village house: tall walls, heavy carved beams, ornate lattice, painted bracket bands, big double doors. Column 1, Tianshan sect hall (snow mountains of the far west): white stone walls, icy pale-blue beams, silver-grey frame, snow lotus carving above a heavy white door. Column 2, Quanzhen Taoist hall: white walls, dark wooden frame, black-and-white Big Dipper star carving over the door, plain green-grey beams. Column 3, Maoshan Taoist exorcist hall: yellow ochre walls with painted red talisman-like patterns (abstract, no readable letters), dark wood frame, bronze mirror above the door, black door.
```

### HS9 · 장백파, 보타문, 기루

```text
Building wall parts sheet in exactly the same layout, scale, pixel size and pixel-art style as the reference image: 3 columns x 2 rows on a solid flat pure blue #0000FF background. Top row: three FRONT walls (flat orthographic elevation, walls only, no roof, top edge cut flat, the main door exactly in the horizontal centre, raised stone plinth at the bottom). Bottom row: the matching SIDE wall of each building with a triangular gable top and one window. Crisp chunky hand-placed pixels, dark 1-pixel outlines, warm muted palette with light from the upper left, no text, no letters, no shadows on the background, wide blue gaps between pieces. These are the grand main halls of famous martial-arts sects in a wuxia world, so they must look rich, imposing and distinctive, far grander than a village house: tall walls, heavy carved beams, ornate lattice, painted bracket bands, big double doors. Column 1, Changbai mountain sect hall (northeast): heavy log and stone walls, dark brown beams with tiger motifs, thick wooden door, snow on the plinth edge. Column 2, Putuo island nunnery hall: pale cream walls, soft blue and gold beams with lotus and wave motifs, round moon-gate door. Column 3, a two-storey city pleasure house (gilou) front: lacquered red pillars, carved latticework painted gold, rows of red paper lanterns along the beam, open entrance with a red curtain, very ornate and colourful.
```

### HR3 · 문파 지붕 무늬 여섯

```text
Roof tile texture sheet in exactly the same layout, pixel size and pixel-art style as the reference image: 3 columns x 2 rows of square seamless roof-tile swatches separated by blue lines, solid pure blue #0000FF gaps. Each swatch is a tileable pattern of curved Chinese roof tiles seen from above at a slight angle, with clear tile ridges and dark grooves, crisp chunky pixels, light from the upper left, no text. Swatches: 1) imperial yellow-gold glazed tiles (Shaolin); 2) jade-green glazed tiles (Wudang, Qingcheng); 3) deep blue glazed tiles (Namgung, Kunlun); 4) black glazed tiles with a slight purple sheen (Tang clan); 5) grey unglazed clay tiles with moss patches (Zhongnan, Kongtong); 6) red-brown glazed tiles (Hua, Peng). All six must tile seamlessly left-right and top-bottom.
```

### HE1 · 지붕 장식과 현판

```text
Sprite sheet of Chinese roof ornaments and hall decorations for a pixel-art wuxia RPG, 4 columns x 3 rows grid, in exactly the pixel size, outline and palette of the reference images, solid pure blue #0000FF background, wide gaps, nothing touching. Items: 1) dragon-head ridge-end ornament (chiwen), dark grey glazed, facing right; 2) the same in gold-yellow; 3) row of five small roof-ridge guardian beasts on a short ridge piece; 4) upturned flying eave corner piece with a hanging bronze wind bell; 5) long horizontal ridge band with a carved cloud pattern, tileable left-right; 6) small tower-like ridge-centre pearl/flame ornament; 7) blank dark lacquered horizontal plaque with a gold border (no text); 8) blank vertical plaque, red with gold border (no text); 9) pair of red lacquered round columns with gilded capitals; 10) row of painted dougong bracket sets under an eave, tileable left-right; 11) large bronze incense cauldron (ding) on three legs; 12) pair of tall stone lanterns with carved roofs. Same pixel scale for all: plaques about one person wide, columns about two people tall. No text or letters anywhere.
```

## 물가와 저잣거리 (ref-walls.png를 올린다)

### HG2 · 물 무늬 셋(3열 1행, 이어 붙는 정사각형): 강물(잔물결), 연못(연잎 몇 장), 얕은 여울(돌이 비치는 물). 참고 그림: https://dltkdwhdhkd-design.github.io/gangho/art-src/chatgpt/HG1.png

```text
Seamless water texture sheet in exactly the same layout, pixel size and pixel-art style as the reference image: 3 square swatches in one row separated by solid pure blue #0000FF gaps. 1) river water with small ripples and light glints, 2) still pond water with a few lotus leaves, 3) clear shallow stream showing pebbles under the water. Each swatch must tile seamlessly left-right and top-bottom. Crisp chunky pixels, light from the upper left, no text.
```

### HP5 · 나루와 배(3열 2행): 선착장 판자 토막, 말뚝과 밧줄, 나룻배, 돛단배, 고깃배와 그물, 물가 갈대 무더기. 참고 그림: 벽 그림 묶음의 HP2

```text
Sprite sheet for a pixel-art wuxia RPG, 3 columns x 2 rows, exactly the pixel size, outline and palette of the reference image, solid pure blue #0000FF background, wide gaps, nothing touching. Items seen from a high three-quarter top-down view: 1) a wooden pier section with plank deck, 2) wooden mooring posts with coiled rope, 3) a small river ferry boat with a pole, 4) a sailing junk with a tan batten sail, 5) a small fishing boat with a net draped over the side, 6) a clump of riverside reeds. No text.
```

### HP6 · 저잣거리 좌판(3열 2행): 포목 좌판, 약재 좌판, 그릇 좌판, 만두 찜통 좌판, 장신구 좌판, 짐수레

```text
Sprite sheet for a pixel-art wuxia RPG, 3 columns x 2 rows, exactly the pixel size, outline and palette of the reference image, solid pure blue #0000FF background, wide gaps, nothing touching. Market stalls of a Ming-dynasty town seen from a high three-quarter top-down view, each with a cloth awning: 1) cloth and silk bolts stall, 2) herbal medicine stall with drawers and dried roots, 3) pottery and bowls stall, 4) steamed bun stall with stacked bamboo steamers and steam, 5) hairpin and trinket stall, 6) a wooden hand cart loaded with sacks. No text.
```

### HK3 · 바위 절벽 토막(3열 2행): 절벽 앞면 둘, 절벽 모서리 둘, 바위 계단, 이끼 낀 큰 바위

```text
Sprite sheet for a pixel-art wuxia RPG, 3 columns x 2 rows, exactly the pixel size, outline and palette of the reference image, solid pure blue #0000FF background, wide gaps. Cliff pieces seen from a high three-quarter top-down view that can be placed side by side: 1) and 2) two straight cliff face sections of layered grey-brown rock with grass on top, 3) and 4) left and right cliff corner pieces, 5) rough stone steps cut into the cliff, 6) a large mossy boulder. No text.
```
