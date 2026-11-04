# 강호행 江湖行

객잔 점소이가 찢어진 비급 일곱 장을 찾아 강호로 나서는 도트 무협 액션 게임입니다.
평타와 초식을 직접 눌러 싸우고, 어떤 초식을 네 칸에 넣을지는 메뉴에서 고릅니다.

## 조작
- 이동 W A S D 또는 방향키, 대화 E, 메뉴 Esc
- 평타 J, 경공 K, 막기 L (맞기 직전에 누르면 튕겨내기), 금창약 H
- 초식 U I O P 또는 1 2 3 4
- 휴대폰과 태블릿은 화면 버튼으로 조작합니다.

## 강호와 생활
- 구파일방과 오대세가 열다섯 세력: 구화성 동문의 구파 회관, 서문의 세가 거리에서 대표에게 비무를 청합니다.
- 비무: 이기면 상대 물건 중 하나를 고릅니다. 세력 대표는 하루 한 번 다시 겨룰 수 있습니다.
- 제작: 대장간, 약방, 부뚜막, 작업대. 사냥과 벌목은 청풍골, 낚시는 나루터, 청풍골 계곡, 구화성 연못.
- 집: 청하진 복덕방에서 사고, 집 안에서 B 키로 꾸밉니다. 침상에서 자면 하루가 지납니다.
- 호감: 윤설, 소연하, 철우, 당소연, 모용설, 남궁진. 호감 70에 고백, 연인 호감 100과 옥가락지, 집이 있으면 혼인.
- 무공 트리: 경지가 오를 때마다 1점, 검 도 창 권 심공 신법 여섯 갈래.

## 소스 구조 (빌드 없이 그대로 실행)
- `js/battle.js` 전투, `js/data.js` 초식과 무기, `js/foes.js` 적
- `js/field.js` 걷기, `js/maps.js` 지도, `js/tiles.js` 타일과 소품
- `js/ctx.js`, `js/story1.js`, `js/story2.js` 이야기와 대사
- `js/items.js` 물건, 제작법, 가구, 무공 트리 자료, `js/life.js` 생활 체계, `js/clandata.js`와 `js/clans.js` 세력
- `js/dialog.js` 대화창, `js/ui.js` 메뉴와 상점, `js/state.js` 저장과 능력치
- `tools/` 자동 시험 (`playthrough.cjs`, `reach.cjs`)과 에셋 정리 스크립트

## 일러스트 넣는 법
`assets/art/<인물>_n.png` 파일을 넣고 `assets/art/list.json`에 `"<인물>_n"`을 적으면 대화에서 얼굴 그림 대신 나옵니다.
인물 이름은 `js/ctx.js`의 WHO 표를 따릅니다 (gwak, baek, yun, so, cheol 등). 주인공은 me 입니다.

## 출처
- 도트 그림, 음악, 효과음: [Ninja Adventure Asset Pack](https://pixel-boy.itch.io/ninja-adventure-asset-pack) by Pixel-boy & AAA (CC0)
- 글꼴: [갈무리](https://github.com/quiple/galmuri) by Quiple (SIL OFL 1.1)
