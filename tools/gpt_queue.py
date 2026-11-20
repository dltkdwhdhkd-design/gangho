#!/usr/bin/env python3
# ChatGPT 요청서 묶음(docs/gpt/)을 다시 뽑는다: 차례표 index.md와 단계마다 문서 하나(<단계 이름>.md).
#   python3 tools/gpt_queue.py           다시 쓴다
#   python3 tools/gpt_queue.py --check   저장된 것과 다르면 1 (tools/check.sh가 부른다)
# 무엇을 받는지: 그림은 tools/gpt/items.json, 모형은 tools/blender/spec.json, 사람은 tools/people_new.py(새 사람)와 docs/art-requests.md(일러스트가 있는 사람).
# 차례는 아래 ORDER. 단계의 이름(파일 이름)은 바꾸지 않는다: ChatGPT 대화에 그 주소가 남아 있다. 새 단계는 새 이름으로 끼워 넣는다.
# "받음"은 저장소를 보고 스스로 적는다: 사람 도트와 동작 칸은 assets/hd2d/preview/people.json, 일러스트와 장면 그림은 assets/art/list.json,
# 효과는 assets/fx2/fx.json, 그림 장은 art-src/chatgpt/<이름>.png, 모형은 spec.json의 got과 assets/hd2d/models/kit.json.
import os, re, json, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'docs', 'gpt')
BASE = 'https://dltkdwhdhkd-design.github.io/gangho/'
U = lambda p: BASE + p
rd = lambda *p: open(os.path.join(ROOT, *p), encoding='utf-8').read()
IT = json.loads(rd('tools', 'gpt', 'items.json'))
SPEC = json.loads(rd('tools', 'blender', 'spec.json'))
PEOPLE = set(json.loads(rd('assets', 'hd2d', 'preview', 'people.json')))
ART = set(json.loads(rd('assets', 'art', 'list.json')))
FX = set(json.loads(rd('assets', 'fx2', 'fx.json')))
KIT = set(json.loads(rd('assets', 'hd2d', 'models', 'kit.json')))
have_src = lambda name: os.path.exists(os.path.join(ROOT, 'art-src', 'chatgpt', name))
_ns = {}; exec(rd('tools', 'people_new.py'), _ns); NEW = {k: (t, d) for k, t, d in _ns['NEW']}
DESC = {m.group(1): (m.group(2).strip(), m.group(3).strip().replace('같은 규칙으로 그려 줘. ', '')) for m in re.finditer(r"### (\w+)_n\.png · ([^\n]*)\n\n```text\n(.*?)\n```", rd('docs', 'art-requests.md'), re.S)}
who = lambda k: NEW[k] if k in NEW else DESC[k]
short = lambda k: re.sub(r'\s*\(.*$', '', who(k)[0]).strip()
def sprite(k):
    """그 사람의 걷는 도트 그림 주소. 크게 그린 원본이 저장소에 있으면 그것을, 없으면 게임용 작은 시트를 준다"""
    for n in (k + '-src.png', k + '-walk.png'):
        if have_src(n): return U('art-src/chatgpt/' + n)
    if have_src(k + '-a.png'): return U('art-src/chatgpt/' + k + '-a.png') + (' (옆모습은 ' + U('art-src/chatgpt/' + k + '-b.png') + ')' if have_src(k + '-b.png') else '')
    return U('assets/hd2d/preview/n_' + k + '.webp')

# ── 받았는지 ──
got_walk = lambda k: 'n_' + k in PEOPLE
got_act = lambda k: (k + '_act') in PEOPLE or ('n_' + k + '_act') in PEOPLE
got_ill = lambda k: k + '_n' in ART
got_sheet = lambda code: have_src(code + '.png')
got_fx = lambda f: f in FX or have_src(f + '.png')


# ── 종류마다 규칙, 참고 그림, 스스로 확인 ──
R_WALK = """- 한 사람에 그림 한 장. 가로가 세로의 두 배(2:1, 2048×1024쯤)인 그림을 **4열 3행 12칸**으로 나눠 같은 사람을 열두 번 그린다.
- 열: 1열 정면, 2열 뒷모습, 3열 왼쪽을 보는 옆모습, 4열 왼쪽을 보는 옆모습의 중간 걸음.
- 행: 1행 차렷(4열은 숨 쉬는 차렷), 2행 왼발 내딛기(4열은 왼발 다음의 중간 걸음: 뒷발이 들려 앞으로 넘어온다), 3행 오른발 내딛기(4열은 오른발 다음의 중간 걸음). 2행과 3행은 서로 반대 발이고, 팔은 다리와 반대로 흔들린다.
- 열두 칸 모두 키, 머리 크기, 옷, 색, 손에 든 물건이 같다. 칸끼리 넉넉히 떼고, 발끝은 줄마다 같은 높이에 둔다.
- 도트의 급: 3.5등신, 그림 속 한 사람의 키가 300픽셀쯤. 얼굴에 눈·눈썹·입이 작게, 머리카락 3~4단·옷 4~5단 명암, 외곽선은 짙은 갈색이나 짙은 남색 1도트, 빛은 왼쪽 위에서 약하게.
- 각진 도트로(안티앨리어싱·블러·그라데이션·반투명 없이). 바탕은 완전한 단색 마젠타(#FF00FF)이고 그림 안에는 마젠타를 쓰지 않는다. 바닥 그림자, 빛번짐, 글자, 칸 테두리를 넣지 않는다.
- 일러스트가 있는 사람은 **그 일러스트와 같은 사람**으로 그린다: 머리 모양과 색, 옷의 모양과 색, 허리띠와 장식, 들고 있는 물건까지.
- 명나라풍과 한복풍을 섞은 가상의 고대 무협이다(기모노, 사무라이 금지)."""
R_ILL = """- 대화창에 뜨는 일러스트. 세로 1024×1536, 허벅지 위까지 보이는 한 사람. 몸은 오른쪽으로 살짝, 얼굴과 시선은 거의 정면. 머리와 손이 잘리지 않게.
- 참고 그림 ref-art.png와 같은 그림체: 한국 웹소설 표지풍의 깔끔한 2D 일러스트, 또렷한 선, 셀화 채색에 가벼운 명암(사진풍·3D풍 금지).
- 복장은 명나라풍과 한복풍을 섞은 가상의 고대 무협(기모노, 사무라이 금지).
- 배경은 투명하거나 무늬 없는 단색 회색. 글자, 서명, 테두리를 넣지 않는다.
- 이 일러스트가 같은 사람의 걷는 도트의 기준이 된다. 머리 모양과 색, 옷의 모양과 색, 장식, 들고 있는 물건을 분명하게 그린다."""
R_FACE = R_ILL.replace('- 이 일러스트가 같은 사람의 걷는 도트의 기준이 된다. 머리 모양과 색, 옷의 모양과 색, 장식, 들고 있는 물건을 분명하게 그린다.', '- **도트 속 사람이 이 일러스트의 주인공이다.** 사람마다 적힌 도트 그림 주소를 열어 보고, 머리 모양과 색, 옷의 모양과 색, 장식, 무기를 도트와 똑같이 맞춘다.')
R_ACT = """- 한 사람에 그림 한 장. **가로 한 줄 여섯 칸**(전체 2400×320, 한 칸 400×320). 여섯 칸 모두 **왼쪽을 보는 옆모습**.
- 칸 순서: ① 무기를 뒤로 당겨 기를 모으는 준비 ② 무기를 크게 내지른 순간(팔과 무기가 칸 왼쪽 끝 가까이 뻗는다) ③ 휘두르고 난 뒤 거두는 자세 ④ 맞아서 뒤로 젖혀짐 ⑤ 옆으로 쓰러져 누움 ⑥ 땅을 박차고 뛰어올라 공중에 뜬 경공.
- 그 사람의 걷는 도트와 **같은 사람, 같은 도트 굵기·색·키**로 그린다. 이미 받은 주인공의 동작 칸(참고 그림)과 같은 크기와 배치로.
- **무기는 칸 안에 그려 넣는다**(게임이 따로 그리지 않는다). ④⑤⑥에서도 무기를 들고 있거나 옆에 떨어져 있게 한다. 무기 끝이 칸 밖으로 나가지 않게.
- 발끝(쓰러진 칸은 몸)이 칸 아래쪽에 닿게. 여섯 칸의 발끝 높이가 같게.
- 바탕은 투명. 투명하게 못 만들면 완전한 단색 마젠타(#FF00FF). 그림자, 빛번짐, 글자, 칸 테두리를 넣지 않는다."""
R_FX = """- **도트 그림(pixel art)**. 참고 그림 ref-fx.png의 사람 도트와 같은 굵기. 사람 키는 그 그림에서 48도트쯤이다. 효과는 사람보다 크게 뻗어도 되지만 도트 굵기는 같아야 한다.
- 각진 도트로. 안티앨리어싱, 블러, 그라데이션, 반투명, 빛번짐 없이. 빛나는 느낌은 **밝기 단계**로 낸다.
- **색은 네 단계만**: 흰색 #FFFFFF, 밝은 회색 #D0D0D0, 중간 회색 #909090, 어두운 회색 #505050. 다른 색은 쓰지 않는다(게임이 문파마다 색을 입힌다).
- 배경은 완전한 **단색 초록(#00FF00)**. 그림 안에는 초록을 쓰지 않는다.
- 한 장을 항목에 적힌 열·행 격자로 나눈다. 칸은 크기가 모두 같고, 그림이 칸 밖으로 나가지 않게 가장자리를 넉넉히 비운다.
- 칸 순서는 **왼쪽 위에서 오른쪽으로, 다음 줄로** 시간 순서다.
- 글자, 번호, 칸 테두리, 서명, 인물, 칼은 그리지 않는다. 기운만 그린다.
- 베기와 찌르기는 **오른쪽을 향해** 그린다(게임이 돌려서 쓴다).
- 서양 판타지의 마법이 아니라 무협의 **검기(劍氣)**다. 날카롭고 얇게, 끝이 칼날처럼 가늘어진다."""
R_FXH = """- **도트 그림(pixel art)**. 참고 그림 ref-fx.png의 사람 도트와 같은 굵기. 사람 키는 그 그림에서 48도트쯤이다.
- 각진 도트로. 안티앨리어싱, 블러, 그라데이션, 반투명, 빛번짐 없이. 빛나는 느낌은 **밝은 색 단계**(진홍 → 분홍 → 흰색)로 낸다.
- 배경은 완전한 **단색 초록(#00FF00)**. 그림 안에는 초록을 쓰지 않는다.
- 칸은 크기가 모두 같게, 칸끼리 넉넉히 떼고, 그림이 칸 밖으로 나가지 않게. 글자·번호·테두리 없이.
- 한 장 안의 칸은 **왼쪽 위에서 오른쪽으로, 다음 줄로** 시간 순서다.
- 색: 진홍 #C8284A, 짙은 진홍 #8E1838, 분홍 #FF9FBD, 연분홍 #FFC4D6, 흰 꽃잎 #FFF0F5, 꽃술 노랑 #FFE36A. 자하는 보라 #8A5AD8, 연보라 #C9A8FF, 짙은 보라 #4A2C7A.
- 일본 벚꽃이 아니라 **매화**다. 꽃잎 다섯 장이 둥글고, 가운데 꽃술이 짧게 많다.
- 이미 받은 매화 효과(참고 그림)와 같은 굵기와 색으로 이어 간다."""
R_SHEET = """- 한 장에 항목에 적힌 칸 수만큼. 앞서 그린 장과 도트 굵기, 색감, 칸 배치를 이어 간다.
- 그림 속에 글자, 번호, 서명, 워터마크, 테두리를 넣지 않는다. **현판, 족자, 문양판, 비석도 글자 없이 빈 채로**(글자는 게임이 얹는다).
- 배경은 단색 파랑(#0000FF). 그림 안에는 그 파랑을 쓰지 않는다. 칸 사이를 넓게 띄우고 서로 닿지 않게.
- 안티앨리어싱, 블러, 그라데이션, 반투명 없이 각진 도트로. 빛은 왼쪽 위에서.
- 명나라풍 무협. 일본풍이나 서양 판타지가 아니다.
- 보는 각도는 항목마다 적혀 있다. 바닥에 놓는 물건은 "비스듬히 위에서", 벽에 붙는 것은 "정면".
- **무늬 장(제목에 "이어 붙는"이 있는 것)은 위 규칙 가운데 둘을 따르지 않는다.** 물건이 아니라 겉면에 되풀이해 입히는 무늬라서, 빛 방향과 그림자가 없어야 하고(고르게 밝게), 칸을 가장자리까지 꽉 채운다(칸 사이는 가는 파란 줄만). 옆 칸과 이어 붙였을 때 금이 보이면 안 된다.
- 색은 가라앉은 누런 잿빛과 올리브빛으로. 돌과 회벽과 흙에 주황이나 붉은 기가 돌면 안 된다(게임의 햇빛이 따뜻한 빛을 더한다)."""
R_UI = """- **도트 그림(pixel art)**. 참고 그림 ref-ui.jpg(지금 게임 화면)의 사람 도트와 같은 굵기로. 그 화면에서 사람 키가 48도트쯤이다.
- 각진 도트로. 안티앨리어싱, 블러, 그라데이션, 반투명 없이. 번지고 마른 붓의 느낌은 색 단계 둘셋과 들쭉날쭉한 가장자리로 낸다.
- 배경은 완전한 **단색 초록(#00FF00)**. 그림 안에는 초록을 쓰지 않는다. 틀의 안쪽처럼 비워 둘 자리는 항목에 적혀 있다(비운 자리는 배경 초록 그대로 둔다).
- 칸은 크기가 모두 같고, 칸끼리 넉넉히 떼고, 그림이 칸 밖으로 나가지 않게. 칸 테두리, 번호, 서명을 넣지 않는다.
- **글자는 한 자도 넣지 않는다.** 한글과 한자는 게임이 제 글꼴로 얹는다.
- 느낌은 한지, 먹, 붓, 인장이다. 바탕 색: 한지색 #ece4d0, 먹색 #1c1a18, 금갈색 #a8782a, 진홍 #8e1838, 쪽빛 #22406a.
- 서양 판타지의 금속 테두리와 보석 장식, 일본풍 문양은 쓰지 않는다."""
R_ICON = """- **도트 아이콘**. 참고 그림 ref-icons.png(이미 게임에 있는 아이콘)와 같은 급과 그림체로. 게임에서는 32×32도트로 쓰인다.
- 크게 그리되(한 칸 256픽셀쯤) 도트 한 점이 8픽셀쯤인 굵은 도트로. 각진 도트로(안티앨리어싱·블러·그라데이션·반투명 없이).
- 물건 하나를 칸 한가운데에. 짙은 남갈색 외곽선 1도트, 명암 3~4단, 빛은 왼쪽 위에서.
- 배경은 완전한 단색 초록(#00FF00). 그림 안에는 초록을 쓰지 않는다. 칸 테두리, 바닥 그림자, 글자, 번호를 넣지 않는다.
- 칸 순서는 왼쪽 위에서 오른쪽으로, 다음 줄로. 항목에 적힌 순서를 꼭 지킨다(게임이 칸 번호로 물건을 찾는다).
- 명나라풍 무협의 물건이다(일본도, 서양 갑옷 금지)."""
R_CG = """- 도트가 아니라 **일러스트**다. 가로 16 : 세로 9(1536×864쯤). 참고 그림 ref-art.png와 같은 그림체: 한국 웹소설 표지풍의 깔끔한 2D 일러스트, 또렷한 선, 셀화 채색에 가벼운 명암(사진풍·3D풍 금지).
- 화면 아래쪽 4분의 1에는 대사 글이 얹힌다. 거기에는 얼굴이나 중요한 것을 두지 않고 조금 어둡게 둔다.
- 글자, 서명, 테두리, 말풍선을 넣지 않는다.
- 나오는 사람의 생김새는 항목에 적힌 일러스트 주소를 열어 보고 맞춘다(머리 모양과 색, 옷). 주인공은 스무 살 남자다: 검은 도포에 붉은 깃, 보라 허리띠, 길게 묶은 머리.
- 명나라풍과 한복풍을 섞은 가상의 고대 무협(기모노, 사무라이 금지).
- 싸움과 죽음이 나오는 장면도 피와 상처를 자세히 그리지 않는다. 실루엣, 표정, 빛으로 나타낸다."""
R_MODEL = """- 규칙, 재질 이름표, 틀(`gangho_kit.py`)은 모형 규칙 문서에 있다. **먼저 그 문서의 "규칙", "재질 이름표", "틀"을 읽는다**: """ + U('docs/chatgpt-blender.md') + """
- 길이의 단위는 점이다(블렌더 단위 1 = 1점, 게임의 땅 한 칸 = 16점). x는 오른쪽(동), y는 뒤(북), z는 위. 카메라는 남쪽에서 북쪽을 보며 비스듬히 내려다본다. 물건의 앞은 −y 쪽이다.
- 텍스처와 UV는 넣지 않는다. 면마다 **재질 이름**만 단다(이름표에 있는 이름만). 도트 무늬는 게임이 입힌다.
- 낮은 폴리곤, 평평한 면(flat shading), 닫힌 덩어리. 아래 표의 x, y, z 범위 안에 들어와야 하고, "꼭 닿는 축"에서는 범위의 양 끝에 정확히 닿아야 한다.
- 묶음 하나에 스크립트 하나. 틀의 `m.save(lim=…, exact=…, tris=…)`에 표의 값을 그대로 넣고, 찍힌 `[모형]` 줄이 전부 `OK`인지 본다.
- 블렌더에 연결돼 있으면 스크립트를 실행하고 `look()`으로 게임과 같은 각도에서 보며 다듬는다. 연결돼 있지 않으면 스크립트만 준다(그러면 Claude가 돌린다)."""

REF = {
 'walk': [('도트의 급', 'art-src/ref-people.png'), ('**칸 배치의 본보기**(이미 받은 사파 무사: 4열 3행, 마젠타 바탕)', 'art-src/chatgpt/mob_sa-src.png')],
 'ill': [('일러스트 그림체', 'art-src/ref-art.png')],
 'beast': [('사람 도트의 급(이것과 같은 굵기로)', 'art-src/ref-people.png'), ('**칸 배치의 본보기**(이미 받은 사파 무사: 4열 3행, 마젠타 바탕)', 'art-src/chatgpt/mob_sa-src.png')],
 'act': [('**이미 받은 주인공의 검 동작 칸**(이것과 같은 크기·배치로)', 'assets/hd2d/preview/me_act.webp'), ('이미 받은 큰 칼 동작 칸의 원본(2400×320)', 'art-src/chatgpt/me_blade-c.png')],
 'fx': [('지금 전투 화면(사람 도트 크기와 굵기)', 'art-src/ref-fx.png'), ('이미 받은 효과의 본보기(칸 나누기와 굵기)', 'art-src/chatgpt/hs_slash.png')],
 'fxh': [('지금 전투 화면(사람 도트 크기와 굵기)', 'art-src/ref-fx.png'), ('이미 받은 매화 칼빛(같은 굵기와 색으로)', 'art-src/chatgpt/hs_slash.png'), ('이미 받은 꽃잎 회오리', 'art-src/chatgpt/hs_swirl.png')],
 'sheet': [('이미 받은 벽·지붕·소품(도트 굵기와 색, 무늬 칸의 배치를 이 그림에 맞춘다)', 'art-src/ref-walls.png'), ('이미 받은 방 바닥 무늬(무늬 장의 본보기)', 'art-src/chatgpt/FL1.png')],
 'ui': [('**지금 게임 화면 넷**(대화, 선택지, 메뉴, 싸움. 이 화면의 테두리와 단추를 바꾸는 그림이다)', 'docs/gpt/ref-ui.jpg'), ('이미 있는 아이콘(도트의 급)', 'docs/gpt/ref-icons.png')],
 'icon': [('**이미 게임에 있는 아이콘**(이것과 같은 급과 그림체로)', 'docs/gpt/ref-icons.png'), ('지금 게임 화면(아이콘이 쓰이는 자리)', 'docs/gpt/ref-ui.jpg')],
 'cg': [('일러스트 그림체', 'art-src/ref-art.png'), ('이미 받은 장면 그림(같은 그림체와 구도로)', 'assets/art/cg_dock.webp'), ('주인공', 'assets/art/me_n.webp')],
 'model': [('벽 조각을 조립한 모습(모형의 급)', 'docs/shots/1120/wallkit_blender.jpg'), ('게임에 세운 모습', 'docs/shots/1120/room_walls.jpg')],
}
CHECK = {
 'walk': ['4열 3행 열두 칸인가. 열의 순서가 정면, 뒷모습, 옆모습, 옆모습 중간 걸음인가', '2행과 3행이 서로 반대 발인가', '열두 칸의 키와 옷과 색이 같은가. 일러스트와 같은 사람인가', '바탕이 단색 마젠타이고 그림자와 글자가 없는가'],
 'ill': ['세로 1024×1536, 허벅지 위까지, 머리와 손이 잘리지 않았는가', '글자와 서명이 없는가'],
 'beast': ['4열 3행 열두 칸인가. 열의 순서가 정면, 뒷모습, 옆모습, 옆모습 중간 걸음인가', '크기가 항목에 적힌 사람 키의 몇 배에 맞는가(사람 도트 옆에 세웠을 때)', '바탕이 단색 마젠타이고 그림자와 글자가 없는가'],
 'act': ['가로 한 줄 여섯 칸이고 모두 왼쪽을 보는가', '칸 순서가 준비, 내지름, 거둠, 맞음, 쓰러짐, 경공인가', '걷는 도트와 같은 사람·굵기·키인가. 무기가 칸 안에 있는가', '여섯 칸의 발끝 높이가 같은가'],
 'fx': ['격자의 열과 행이 항목대로인가. 칸 크기가 모두 같은가', '흰색과 회색 네 단계만 썼는가', '바탕이 단색 초록인가. 그림이 칸 밖으로 나가지 않았는가'],
 'fxh': ['격자의 열과 행이 항목대로인가. 칸 크기가 모두 같은가', '적힌 색만 썼는가. 벚꽃이 아니라 매화인가', '바탕이 단색 초록인가(이름띠 그림은 빼고)'],
 'sheet': ['칸 수와 열·행이 항목대로인가', '글자가 한 자도 없는가', '무늬 장은 칸을 꽉 채웠고 네 변이 이어 붙는가. 그림자가 없는가', '바탕(칸 사이)이 단색 파랑인가'],
 'ui': ['칸 수와 열·행이 항목대로인가', '글자가 한 자도 없는가', '바탕이 단색 초록인가. 그림 안에 초록이 없는가', '창 틀은 네 귀에만 장식이 있고 변과 가운데가 고른가'],
 'icon': ['칸 수와 순서가 항목대로인가', '물건마다 서로 구별되는가. 크기가 고른가', '바탕이 단색 초록이고 글자가 없는가'],
 'cg': ['가로 16:9인가. 아래쪽 4분의 1에 얼굴이 없는가', '나오는 사람이 일러스트와 같은 사람으로 보이는가', '글자와 서명이 없는가'],
 'model': ['`[모형]` 줄이 전부 `OK`이고 맨 끝이 `문제 0개`인가', '재질 이름이 이름표에 있는 것뿐인가', '`look()`으로 본 화면에서 사람 막대와 견준 크기가 맞는가'],
}
KIND = {'beast': '도트(짐승)', 'walk': '도트(걷기)', 'new': '일러스트와 도트', 'face': '일러스트', 'act': '동작 칸', 'fx': '효과', 'fxh': '효과', 'sheet': '그림 장', 'model': '모형(블렌더)', 'ui': '화면 틀', 'icon': '아이콘', 'cg': '장면 그림'}


# ── 단계를 짓는다 ──
STEPS = {}
def step(code, kind, title, why, items, **kw):
    assert code not in STEPS, code
    STEPS[code] = dict(code=code, kind=kind, title=title, why=why, items=items, **kw)

def it_prompt(name, title, got, body, pre=''):
    return dict(name=name, title=title, got=got, body=body, pre=pre)

SC = {x['code']: x for x in IT['scene'] + IT['land']}
def sheets(codes):
    out = []
    for c in codes:
        x = SC[c]; out.append(it_prompt(c + '.png', x['title'], got_sheet(c), x['prompt'], x.get('note', '')))
    return out
SW = {x['code']: x for x in IT['swordfx']}
def swords(codes): return [it_prompt(SW[c]['file'] + '.png', f"{c} {SW[c]['title']} ({SW[c]['grid']})", got_fx(SW[c]['file']), SW[c]['prompt']) for c in codes]
HW = {x['code']: x for x in IT['hwasan']}
def hwasan(codes): return [it_prompt(HW[c]['file'] + '.png', f"{c} {HW[c]['title']} ({HW[c]['grid']})", got_fx(HW[c]['file']), HW[c]['prompt']) for c in codes]

def walk_items(keys):
    out = []
    for k in keys:
        t, d = who(k)
        out.append(it_prompt(k + '-walk.png', f'{t} — 키 `{k}`', got_walk(k), f"규칙대로 이 사람의 걷는 도트 한 장(4열 3행). 일러스트 속 사람과 똑같이.\n\n인물: {d}", f"일러스트(이 사람의 기준): {U('assets/art/' + k + '_n.webp')}"))
    return out
def new_items(keys):
    out = []
    for k in keys:
        t, d = who(k)
        out.append(it_prompt(k + '_n.png', f'{t} — 키 `{k}` · 일러스트', got_ill(k), f"일러스트 규칙대로 이 사람의 대화 일러스트 한 장(세로 1024×1536).\n\n인물: {d}"))
        out.append(it_prompt(k + '-walk.png', f'{t} — 키 `{k}` · 걷는 도트', got_walk(k), f"방금 그린 일러스트 속 사람을 도트 규칙대로 걷는 도트 한 장(4열 3행)으로. 머리와 옷과 색을 일러스트와 똑같이.\n\n인물: {d}"))
    return out
def face_items(rows):
    return [it_prompt(x['key'] + '_n.png', f"{x['name']} ({x['role']}) — 키 `{x['key']}`", got_ill(x['key']), f"규칙대로 이 사람의 대화 일러스트 한 장. 위 주소의 도트 속 사람과 똑같이.\n\n인물: {x['desc']}", f"도트(이 사람의 기준): {sprite(x['key'])}") for x in rows]
def act_items(rows):
    out = []
    for r in rows:
        k = r[0]; mob = k.startswith('mob_'); nm = r[1] if mob else short(k); hint = r[2] if len(r) > 2 else '걷는 도트에 그려진(들거나 찬) 무기 그대로. 무기가 없는 사람은 맨손(주먹과 손바닥)으로'
        out.append(it_prompt(k + '-c.png', f'{nm} — 키 `{k}`', got_act(k), f"규칙대로 이 사람의 동작 여섯 칸(가로 한 줄). 위 주소의 걷는 도트와 같은 사람으로.\n\n무기와 몸짓: {hint}.", (f"걷는 도트(이 사람의 기준): {sprite(k)}" if got_walk(k) else f"걷는 도트: **아직 없다.** 차례표의 앞 단계에서 이 사람의 걷는 도트(`{k}-walk.png`)를 먼저 받고, 그 그림을 기준으로 삼는다. 일러스트: {U('assets/art/' + k + '_n.webp')}")))
    return out
CGREF = [('주인공', 'me_n'), ('낭인', 'me_n'), ('연경추', 'chief_n'), ('곽 아주머니', 'gwak_n'), ('곽씨', 'gwak_n'), ('소연하', 'so_n'), ('백랑', 'baekrang_n'), ('혁련하', 'hyeok_n'), ('윤설', 'yun_n'), ('철우', 'cheol_n'), ('맹주', 'chief_n'), ('월천', 'cheon_n'), ('패천도', 'samaung_n'), ('사마웅', 'samaung_n'), ('강씨', 'smith_n'), ('꼬마', 'kid_n'), ('맹호', 'lion_n'), ('위충', 'wei_n')]
def cg_items(rows):
    out = []
    for x in rows:
        refs = []
        for nm, key in CGREF:
            if nm in x['desc'] and key in ART and key not in [r[1] for r in refs]: refs.append((nm, key))
        pre = '나오는 사람: ' + ', '.join(f"{nm} {U('assets/art/' + key + '.webp')}" for nm, key in refs) if refs else ''
        out.append(it_prompt(x['file'] + '.png', f"{x['title']}", x['file'] in ART, f"규칙대로 장면 그림 한 장(16:9).\n\n장면: {x['desc']}.", pre))
    return out
def ui_items(codes, key='ui'):
    D = {x['code']: x for x in IT[key]}
    return [it_prompt(c + '.png', f"{D[c]['title']} ({D[c]['grid']})", got_sheet(c), D[c]['prompt'], '쓰는 곳: ' + D[c]['use'] + '.') for c in codes]
MS = {s['id']: s for s in SPEC['sets']}
def model_step(code, sid, why):
    st = MS[sid]; got = bool(st.get('got')) or all(p['name'] in KIT for p in st['pieces'])
    items = [dict(name=p['name'] + '.glb', title=p['ko'], got=bool(st.get('got')) or p['name'] in KIT, body='', pre='', piece=p) for p in st['pieces']]
    step(code, 'model', f"모형 {sid}: {st['ko']}", why, items, set=st)

chunks = lambda L, n: [L[i:i + n] for i in range(0, len(L), n)]

# 전투
step('act0', 'act', '주인공의 무기별 동작 칸(큰 칼, 창, 봉)', '큰 칼·창·봉을 든 주인공이 제 동작으로 싸우게 하는 그림이다. 검과 맨손은 전에 받았다.',
     [it_prompt('me_blade-c.png', '주인공 · 큰 칼(박도, 환두대도)', got_act('me_blade'), '두 손으로 위에서 아래로 내리찍는 베기.'), it_prompt('me_spear-c.png', '주인공 · 창', got_act('me_spear'), '두 손으로 길게 앞으로 찌르기.'), it_prompt('me_staff-c.png', '주인공 · 봉(목검, 자루)', got_act('me_staff'), '옆으로 크게 후려치기.')])
step('fx1', 'fx', '검기 1: 초승달 베기, 맞는 번쩍, 큰 반달', '기술을 쓸 때 나오는 검기와 맞는 순간의 번쩍임이다. 지금은 코드로 그은 선과 점이라 밋밋하다. 흰색과 회색으로 받아 게임이 문파마다 색을 입힌다. 가장 자주 보이는 셋부터 받는다.', swords(['S1', 'S6', 'S2']))
step('fx2', 'fx', '검기 2: 찌르기, 회전 베기, 날아가는 검기', '검기의 나머지 가운데 초식에 바로 쓰이는 셋이다.', swords(['S3', 'S4', 'S5']))
step('fx3', 'fx', '검기 3: 칼 부딪힘, 돌진 잔상, 절초 일자 검기', '막기·돌진·절초에 쓰이는 셋이다.', swords(['S7', 'S8', 'S9']))
step('fx4', 'fxh', '화산 매화: 남은 넷(꽃잎, 자하 기운, 자하검기, 이름띠 그림)', '화산파 무공의 매화 연출이다. 열 장 가운데 여섯 장(피고 지는 매화, 큰 매화 만개, 매화 가지 검기, 매화 칼빛, 칠매검 찌르기, 꽃잎 소용돌이)은 받았다. 남은 넷을 받는다.', hwasan(['H1', 'H8', 'H9', 'H10', 'H2', 'H3', 'H4', 'H5', 'H6', 'H7']))
A = IT['acts']
step('act1', 'act', '적 동작 칸 1: 산적, 거한, 수적, 궁수, 자객', '이름 없는 적들은 걷는 도트만 있어서, 싸울 때 서 있는 그림을 기울여 흉내만 낸다. 동작 칸을 받으면 칼을 휘두르고 맞고 쓰러지는 모습이 그 그림으로 나온다.', act_items(A['mob'][:5]))
step('act2', 'act', '적 동작 칸 2: 정파 제자, 사파 무사, 마교도, 관병, 강시', '이름 없는 적의 나머지 다섯이다.', act_items(A['mob'][5:]))
step('act3', 'act', '동료 동작 칸 1: 하후민, 문창, 오월, 당소연, 모용설, 남궁진', '함께 싸우는 동료와 히로인의 동작 칸이다. 소연하·철우·윤설·백랑은 받았다.', act_items(A['ally1']))
step('act4', 'act', '동료 동작 칸 2: 혁련하, 혜공, 사이라, 갈 선생, 양춘, 구 노창', '이 여섯은 걷는 도트부터 받아야 한다(차례표의 "사람 도트 1·2"). 그 도트가 온 뒤에 한다.', act_items(A['ally2']))
BOSS = ['wei', 'lion', 'samaung', 'ogang', 'guyang', 'makgo', 'go', 'cheon', 'chief', 'namhwa', 'manhwa']
step('act5', 'act', '맞서는 사람 동작 칸 1: ' + ', '.join(short(k) for k in BOSS[:6]), '이야기에서 주인공과 칼을 맞대는 사람들이다. 걷는 도트(차례표의 "사람 도트 3~5")가 온 뒤에 한다.', act_items([[k] for k in BOSS[:6]]))
step('act6', 'act', '맞서는 사람 동작 칸 2: ' + ', '.join(short(k) for k in BOSS[6:]), '맞서는 사람의 나머지 다섯이다.', act_items([[k] for k in BOSS[6:]]))
R_BEAST = """- 한 마리에 그림 한 장. 가로가 세로의 두 배(2:1, 2048×1024쯤)인 그림을 **4열 3행 12칸**으로 나눠 같은 짐승을 열두 번 그린다(사람의 걷는 도트와 같은 칸 배치다).
- 열: 1열 정면, 2열 뒷모습, 3열 왼쪽을 보는 옆모습, 4열 왼쪽을 보는 옆모습의 중간 걸음.
- 행: 1행 가만히 선 모습(4열은 숨 쉬는 모습), 2행과 3행은 걷는 두 동작(네발짐승이면 앞뒤 다리가 엇갈리는 두 순간, 뱀이면 몸이 물결치는 두 순간, 떠 있는 귀신이면 옷자락이 흔들리는 두 순간). 4열의 2행과 3행은 그 사이의 중간 동작이다.
- 열두 칸 모두 크기와 색이 같다. 칸끼리 넉넉히 떼고, 발끝(땅에 닿는 곳)은 줄마다 같은 높이에 둔다.
- 도트의 급은 사람 도트와 같다: 사람이라면 키가 300픽셀쯤으로 그려지는 굵기로 그리고, 항목에 적힌 "사람 키의 몇 배"에 맞춰 크기를 잡는다. 털과 비늘은 3~4단 명암, 외곽선은 짙은 갈색이나 짙은 남색 1도트, 빛은 왼쪽 위에서 약하게.
- 각진 도트로(안티앨리어싱·블러·그라데이션·반투명 없이). 바탕은 완전한 단색 마젠타(#FF00FF)이고 그림 안에는 마젠타를 쓰지 않는다. 바닥 그림자, 빛번짐, 글자, 칸 테두리를 넣지 않는다.
- 귀엽게 줄인 만화풍이 아니라 사람 도트와 어울리는 사실적인 비례로 그린다."""
def beast_items(rows): return [it_prompt(k + '-walk.png', f'{nm} — 키 `{k}`', got_walk(k), f"규칙대로 이 짐승의 걷는 도트 한 장(4열 3행).\n\n생김새와 크기: {d}.") for k, nm, d in rows]
step('beast1', 'beast', '짐승과 귀신 도트 1: 멧돼지, 독사, 너구리, 죽귀, 원혼', '싸움에 나오는 짐승과 귀신이 아직 옛 작은 도트(16도트짜리)라서 새 사람 도트 옆에 서면 급이 다르다.', beast_items(IT['beast']['fight']))
step('beast2', 'beast', '짐승 도트 2: 사냥감 다섯과 마을의 개, 닭, 말', '사냥감(토끼, 멧돼지 새끼, 꿩, 노루, 오소리)이 옛 작은 도트다. 마을에는 짐승이 한 마리도 없어서 개와 닭, 역참의 말을 더한다.', beast_items(IT['beast']['life']))
# 방
step('room1', 'sheet', '방의 벽: 벽 무늬, 아랫단과 들보, 나무 무늬', '방의 벽과 기둥은 블렌더 조각으로 서 있는데 겉무늬가 임시다. 이 세 장을 받으면 벽이 회벽·판자·벽돌·흙벽으로, 기둥과 가구가 제 나뭇결로 바뀐다. 방 바닥 무늬(FL1)는 받아서 깔았다.', sheets(['WL1', 'WL2', 'WL3', 'FL1']))
step('room2', 'sheet', '방의 벽: 창과 문, 벽에 거는 것', '벽에 박는 창과 문, 뒷벽에 거는 문양판·현판·족자·검이다. 지금 창은 한 가지뿐이고 벽에 건 것이 거의 없다.', sheets(['IN8', 'IN1']))
step('room3', 'sheet', '방 안 살림 1: 제단, 도자기와 화분, 불빛', '본전과 사당, 객잔을 채울 작은 살림이다. 그림 그대로 바닥이나 가구 위에 세운다. 이런 게임의 방은 한 화면에 살림이 스무 개 넘게 있는데 우리 방은 여섯에서 열두 개다.', sheets(['IN2', 'IN3', 'IN9']))
step('room4', 'sheet', '방 안 살림 2: 앉는 자리, 병기, 가게 물건, 깔개', '무관·가게·살림집을 채울 것들이다.', sheets(['IN4', 'IN5', 'IN6', 'IN7']))
model_step('m8', 'M8', '문파 본전과 사당의 북쪽 벽 앞이 비어 있다(제상과 의자뿐이다). 이런 게임의 본전에는 단 위에 조사상이 앉아 있고, 양옆에 사람 키보다 큰 종이 등롱과 촛대가 서서 방의 빛이 된다.')
model_step('m9', 'M9', '방의 뒷벽 위쪽이 비어 있다. 길게 드리운 번(깃발)과 휘장, 현판, 족자, 걸린 검, 객잔의 술독 선반을 벽에 건다.')
# 문파 터와 바깥
model_step('m5', 'M5', '마을과 문파의 얼굴이 되는 큰 것들이다. 문파 들머리에 사람 키 다섯 배의 산문(패루)이 서고, 본전 앞마당에 사람 키 두 배가 넘는 큰 향로가 놓인다. 2026-11-21에 패루와 향로의 크기를 키웠다.')
step('yard1', 'sheet', '문파 터: 돌계단과 난간의 겉, 돌바닥 무늬, 뜰에 놓는 것', '문파 마당이 한 가지 벽돌 무늬로만 깔려 있다. 돌계단·난간 모형(M4)의 겉에 입힐 그림과, 구역마다 달리 깔 돌바닥, 뜰의 소나무·정원석·석등이다.', sheets(['HT1', 'HT2', 'HT3']))
step('roof1', 'sheet', '지붕: 문파 지붕 무늬, 지붕 장식과 현판', '건물 바깥은 거의 다 받았고 이 두 장이 남았다. 문파마다 다른 기와 빛깔, 용마루 끝 장식과 처마의 현판이다.', sheets(['HR3', 'HE1']))
model_step('m10', 'M10', '문파의 뜰과 마을 길가가 비어 있다. 돌 두른 화단, 정원석, 깃대, 과녁, 게시판 같은 것으로 채운다.')
model_step('m6', 'M6', '고을의 장터와 나루를 채울 좌판, 수레, 배, 짐이다. 구화성 광장이 비어 있다.')
model_step('m7', 'M7', '나무는 지금 그림 판을 세운 것이라 종이처럼 보인다. 블렌더로 만든 나무가 도트 그림과 어울리는지 한 그루만 먼저 본다.')
model_step('m11', 'M11', 'M7의 소나무가 어울리면 나머지 나무도 모형으로 바꾼다.')
model_step('m12', 'M12', '덤불과 풀도 그림 판을 세운 것이다. 길가와 담 밑을 채울 덩어리 덤불로 바꾼다.')
model_step('m13', 'M13', '지도마다 눈에 띄는 것이 둘은 있어야 하는데 대부분 없다. 돌다리, 누각, 종각, 돌사자, 비무대다.')
step('rock1', 'sheet', '산길: 바위 무늬, 산길에 놓는 것', '바위와 절벽은 블렌더 모형인데 빛깔이 갈색 한 가지다. 산마다 달리 입힐 바위 무늬와 산길의 소품이다.', sheets(['HK4', 'HK5']), refs=[('전에 받은 절벽(같은 바위 빛과 도트 굵기로)', 'art-src/chatgpt/HK3.png')])
step('tree1', 'sheet', '나무: 껍질과 잎 무늬, 잎 뭉치', '나무 모형(M7, M11)의 줄기와 잎에 입힐 무늬와, 가지에 꽂을 잎 뭉치다.', sheets(['TR1', 'TR2']))
step('land1', 'sheet', '바깥 땅: 땅 무늬 여섯, 풀과 꽃 포기', '풀밭과 흙길이 한 가지 무늬뿐이라 넓은 땅이 밋밋하다. 구역마다 달리 깔 땅과, 길가에 흩어 놓을 풀꽃이다.', sheets(['GR1', 'PL1']))
step('far1', 'sheet', '먼 곳: 먼 산 띠 셋', '지도 북쪽 끝에 서면 화면 위쪽이 안개 띠로 빈다. 그 자리에 겹겹이 세울 먼 산이다.', sheets(['BG1']))
# 화면 틀
step('ui1', 'ui', '화면 틀 1: 창과 단추 틀, 붓자국 띠', '대화창, 메뉴, 단추가 지금은 민무늬 네모에 검은 테두리다. 한지와 먹의 느낌으로 바꿀 틀이다.', ui_items(['UI1', 'UI2']))
step('ui2', 'ui', '화면 틀 2: 화면 단추 그림, 머리 위 표식', '화면 구석의 단추와 사람·문 위에 뜨는 표식이다. 지금은 글자 단추와 화살표 하나뿐이다.', ui_items(['UI3', 'UI4']))
step('ui3', 'ui', '화면 틀 3: 싸움 화면 틀', '싸움 화면의 초상 틀, 체력·내력 막대, 초식 칸이다.', ui_items(['UI5']))
step('icon1', 'icon', '아이콘 1: 무기 스물', '무기 아이콘이 무협이 아닌 다른 그림 묶음에서 빌려 온 것이다(도끼, 일본도). 우리 무기 열아홉 가지와 금창약을 제 그림으로 바꾼다.', ui_items(['IC1'], 'icons'))
step('icon2', 'icon', '아이콘 2: 옷 서른다섯(윗옷, 아래옷, 신발, 머리)', '옷과 신발은 그림이 하나도 없어 장비 창에 글자만 뜬다.', ui_items(['IC2', 'IC3'], 'icons'))
step('icon3', 'icon', '아이콘 3: 초식 열여섯', '싸움 화면의 초식 칸에 글자만 있다. 초식마다 그림을 넣는다.', ui_items(['SK1'], 'icons'))
step('icon4', 'icon', '아이콘 4: 초식 스물여덟', '초식 아이콘의 나머지다.', ui_items(['SK2', 'SK3'], 'icons'))
# 사람: 일러스트가 있는 사람의 걷는 도트
WALK = [('동료와 히로인', ['hyeok', 'c_hyegong', 'c_saira', 'c_gal', 'c_yang', 'c_gu'], 3), ('이야기에서 맞서는 사람', BOSS, 4),
        ('청하진과 자주 만나는 사람', ['gwak', 'baek', 'elder', 'smith', 'doc', 'boat', 'hunter', 'realtor', 'shopk', 'host', 'town', 'town2', 'kid', 'beggar', 'disc', 'flower', 'wander', 'wife', 'husband'], 4),
        ('문파 장문인과 세가 가주', ['clan_shaolin', 'clan_wudang', 'clan_hwasan', 'clan_emei', 'clan_gonryun', 'clan_gongdong', 'clan_jeomchang', 'clan_cheongseong', 'clan_jongnam', 'clan_gaebang', 'clan_jegal', 'clan_paeng', 'clan_hwangbo', 'clan_jin', 'clan_ak', 'clan_yang', 'clan_eon', 'clan_jeonjin', 'clan_mosan', 'clan_noeum', 'clan_haenam', 'clan_cheonsan', 'clan_jangbaek', 'clan_bukhae', 'clan_podalra', 'clan_pota'], 4)]
WALKWHY = {'동료와 히로인': '함께 다니는 동료와 히로인인데 새 도트가 없어서 지금은 비슷한 다른 사람의 그림을 빌려 쓴다. 일러스트는 있다.', '이야기에서 맞서는 사람': '이야기에서 주인공과 맞서거나 운명이 갈리는 사람들이다. 일러스트는 있고 도트가 없다.', '청하진과 자주 만나는 사람': '첫 고을 청하진의 사람들과 어디서나 만나는 사람들이다. 일러스트는 있고 도트가 없다.', '문파 장문인과 세가 가주': '문파와 세가의 우두머리들이다. 일러스트는 있고 도트가 없다.'}
n = 0; WALKCODES = {}
for grp, keys, per in WALK:
    keys = [k for k in keys if k in DESC and k + '_n' in ART]
    for part in chunks(keys, per):
        n += 1; code = f'walk{n:02d}'; WALKCODES.setdefault(grp, []).append(code)
        step(code, 'walk', f"사람 도트 {n}: " + ', '.join(short(k) for k in part), WALKWHY[grp] + f' ({grp})', walk_items(part))
NEWK = [k for k, _, _ in _ns['NEW']]; NEWCODES = []
for i, part in enumerate(chunks(NEWK, 3)):
    code = f'new{i + 1:02d}'; NEWCODES.append(code)
    step(code, 'new', f"새 사람 {i + 1}: " + ', '.join(short(k) for k in part), '일러스트도 도트도 없는 사람들이다(창운문 사람, 거리의 사람, 새 이야기의 인물). 한 사람마다 일러스트를 먼저 그리고, 그 일러스트를 보고 걷는 도트를 그린다.', new_items(part))
FACECODES = []
for i, part in enumerate(chunks(IT['fan'], 6)):
    code = f'face{i + 1}'; FACECODES.append(code)
    step(code, 'face', f"화산귀환 인물 얼굴 {i + 1}: " + ', '.join(x['name'] for x in part), '『화산귀환』 인물(팬 캐릭터)은 걷는 도트는 있는데 대화 일러스트가 없어서, 말할 때 다른 사람의 얼굴이 나온다. 이미 있는 도트를 보고 그 사람의 일러스트를 그린다.', face_items(part))
CGCODES = []
for i, part in enumerate(chunks(IT['cg'], 4)):
    code = f'cg{i + 1:02d}'; CGCODES.append(code)
    step(code, 'cg', f"장면 그림 {i + 1}: " + ', '.join(x['title'] for x in part), '이야기의 큰 장면에 뜨는 그림이다. 게임에는 자리가 이미 있고, 그림이 없으면 색 바탕에 장면 제목만 뜬다.', cg_items(part))

W = WALKCODES
ORDER = (['act0', 'fx1', 'room1', 'room2', 'm5'] + W['동료와 히로인'] + ['fx2', 'room3', 'm8', 'act1', 'fx3', 'room4', 'm9'] + W['이야기에서 맞서는 사람'] + ['fx4', 'yard1', 'm10', 'act2', 'beast1']
         + FACECODES[:2] + ['ui1'] + FACECODES[2:4] + ['ui2', 'act3'] + FACECODES[4:] + ['ui3', 'roof1', 'm6'] + W['청하진과 자주 만나는 사람'][:3] + ['m7', 'act4', 'icon1'] + W['청하진과 자주 만나는 사람'][3:]
         + ['rock1', 'tree1', 'm11', 'act5', 'm12', 'beast2', 'land1', 'far1', 'act6', 'm13', 'icon2', 'icon3', 'icon4'] + NEWCODES + W['문파 장문인과 세가 가주'] + CGCODES)
assert sorted(ORDER) == sorted(STEPS), (set(ORDER) ^ set(STEPS))
NUM = {c: i + 1 for i, c in enumerate(ORDER)}


def status(s):
    g = [x['got'] for x in s['items']]
    return '받음' if all(g) else '남음' if not any(g) else f'일부 받음(남은 것 {g.count(False)})'


# ── 단계 문서 ──
def model_table(st):
    t = ['| 모형 | 무엇 | x | y | z | 꼭 닿는 축 | 삼각형 한도 |', '|---|---|---|---|---|---|---|']
    f = lambda v: f'{v:g}'
    for p in st['pieces']:
        L = p['lim']; t.append(f"| `{p['name']}` | {p['ko']} | {f(L[0][0])}~{f(L[0][1])} | {f(L[1][0])}~{f(L[1][1])} | {f(L[2][0])}~{f(L[2][1])} | {', '.join(p.get('exact', '')) or '없음'} | {p['tris']} |")
    return '\n'.join(t)

def page(s):
    k = s['kind']; n = NUM[s['code']]; left = [x for x in s['items'] if not x['got']]; rules = {'beast': R_BEAST, 'walk': R_WALK, 'face': R_FACE, 'act': R_ACT, 'fx': R_FX, 'fxh': R_FXH, 'sheet': R_SHEET, 'ui': R_UI, 'icon': R_ICON, 'cg': R_CG, 'model': R_MODEL}
    o = [f"# 강호행 요청 {n}: {s['title']}", '', f"단계 이름 `{s['code']}` · 종류: {KIND[k]} · 차례표: {U('docs/gpt/index.md')}", '', s['why'], '']
    if not left: o += ['**이 단계는 다 받았다. 다시 만들지 않는다.** 아래는 받을 때의 기록이다.', '']
    else: o += [f"**이 단계에서 만들 것: {len(left)}개**" + (f" (이미 받은 {len(s['items']) - len(left)}개는 아래에 '받음'으로 적혀 있다. 다시 만들지 않는다.)" if len(left) < len(s['items']) else ''), '']
    if k == 'new': o += ['## 규칙: 일러스트', '', R_ILL, '', '## 규칙: 걷는 도트', '', R_WALK, '']
    else: o += ['## 규칙', '', rules[k], '']
    refs = (REF['ill'] + REF['walk'] if k == 'new' else REF['ill'] if k == 'face' else REF[k]) + s.get('refs', [])
    o += ['## 참고 그림 (모두 열어 볼 것)', ''] + [f'- {t}: {U(p)}' for t, p in refs] + ['', '주소를 못 열면 주인에게 그 파일을 올려 달라고 말한다.', '']
    if k == 'model':
        st = s['set']; o += [f"## 만들 것: 묶음 {st['id']} (스크립트 `{st['file']}`)", '', st['intro'].replace('−', '-'), '', model_table(st), '']
        for p in st['pieces']: o.append(f"- **`{p['name']}` {p['ko']}**" + (' — 받음' if p['name'] in KIT or st.get('got') else '') + f": {p['desc'].replace('−', '-')}")
        o += ['', f"크기를 맞추는 방식: {'적힌 점 그대로(땅의 칸에 맞물린다)' if st['scale'] == 'grid' else '사람 키 15점 기준(게임이 사람과 같은 배율로 키운다)'}. `look({st['person']})`로 사람 키 {st['person']}점짜리 막대와 견주어 본다.", '']
    else:
        o += ['## 만들 것', '']
        for i, x in enumerate(s['items']):
            o += [f"### {i + 1}. `{x['name']}` — {x['title']}" + (' — **받음**' if x['got'] else ''), '']
            if x['got']: o += ['받아서 게임에 넣었다. 다시 만들지 않는다.', '']; continue
            if x['pre']: o += [x['pre'], '']
            o += ['```text', x['body'], '```', '']
    o += ['## 스스로 확인', ''] + [f'- {c}' for c in (CHECK['ill'] + CHECK['walk'] if k == 'new' else CHECK['ill'] if k == 'face' else CHECK[k])] + ['']
    z = f"gangho_{s['code']}.zip"
    if k == 'model':
        st = s['set']; o += ['## 넘기는 것', '', f"- 틀이 만든 `{st['file'][:-3]}.zip`(모형 `.glb` 묶음)과, 마지막에 돌린 스크립트 전체 `{st['file']}`.", '- 블렌더에 연결돼 있지 않으면 스크립트만(코드 블록 하나에 전부, 줄이지 말 것).', '- 파일이 주인 컴퓨터의 어느 폴더에 생겼는지 알려 준다.', '']
    else:
        o += ['## 넘기는 것', '', f"- 위의 파일 이름 그대로 넣은 압축 파일 하나: `{z}`. 원본 크기의 PNG로(줄이거나 잘라 내지 않는다).", '- 압축 파일을 만들 수 없으면 그림을 대화에 그대로 올리고, 그림마다 파일 이름을 한 줄씩 적는다.', '- 게임 코드는 고치지 않는다. 넣는 일은 Claude가 한다.', '']
    i = ORDER.index(s['code']); nxt = next((c for c in ORDER[i + 1:] if status(STEPS[c]) != '받음'), None)
    o += ['---', '', f"다음 단계: {NUM[nxt]}번 `{nxt}` {STEPS[nxt]['title']} — {U('docs/gpt/' + nxt + '.md')}" if nxt else '이 단계가 차례표의 마지막이다.', '']
    return '\n'.join(o)


FIRST = f"""아래 주소의 문서를 읽어 줘. 내 게임 '강호행'에 넣을 그림과 블렌더 모형을 차례대로 받는 요청서야.
{U('docs/gpt/index.md')}
문서의 "차례표"에서 상태가 "남음"이거나 "일부 받음"인 맨 위 단계부터, 한 번에 한 단계씩 만들어 줘. 단계마다 주소가 적혀 있으니 그 주소의 문서를 열어서 거기 적힌 대로 만들면 돼. 규칙, 크기, 칸 배치, 파일 이름이 다 적혀 있어. 문서에 적힌 참고 그림 주소도 열어서 봐. 주소를 못 열면 나한테 그 파일을 올려 달라고 말해.
종류가 "모형(블렌더)"인 단계는 블렌더로 만들어 줘. 블렌더에 연결이 안 돼 있으면 그렇다고 말하고 스크립트만 줘.
한 단계를 다 만들면 그 단계 문서의 "넘기는 것"대로 묶어 주고, 무엇을 만들었는지 파일 이름과 함께 한 줄씩 적어 줘. 게임 코드는 고치지 않아도 돼. 내가 "다음"이라고 하면 차례표의 다음 단계를 해 줘."""

def index():
    tot = sum(len(s['items']) for s in STEPS.values()); done = sum(x['got'] for s in STEPS.values() for x in s['items'])
    first = next(c for c in ORDER if status(STEPS[c]) != '받음')
    o = ['# 강호행: ChatGPT에게 받을 그림과 모형 전부 (차례표)', '',
         "도트 무협 게임 '강호행'에 아직 없는 그림(사람 도트, 일러스트, 효과, 무늬와 소품, 화면 틀, 아이콘, 장면 그림)과 블렌더 모형을 **한 줄로 세운 차례표**다. 위에서부터 한 단계씩 받는다. 단계마다 문서가 하나씩 있고, 그 문서에 규칙·크기·칸 배치·파일 이름이 다 적혀 있다.", '',
         f"단계 {len(ORDER)}개, 만들 것 {tot}개 가운데 {done}개를 받았다. **지금 할 차례는 {NUM[first]}번 `{first}`**: {U('docs/gpt/' + first + '.md')}", '',
         '2026-11-21에 처음부터 다시 썼다. 전에는 요청서가 종류마다 따로 열 군데에 흩어져 있었다(`docs/chatgpt-*.md`. 받은 기록은 거기 그대로 있다). 이 문서와 단계 문서는 `python3 tools/gpt_queue.py`가 만든다. "받음"은 저장소에 그 그림이나 모형이 들어와 있는지를 보고 스스로 적는다. 받은 단계는 지우지 않는다.', '',
         '## 주인이 하실 일', '',
         '1. ChatGPT 대화에 아래 "처음 하는 말"을 그대로 붙인다(블렌더가 연결된 대화면 모형 단계까지 한 대화에서 된다).',
         '2. ChatGPT가 한 단계를 만들어 압축 파일이나 그림을 주면, 그것을 Claude 대화에 올린다.',
         '3. ChatGPT에게 "다음"이라고 한다.', '',
         '검사해서 게임에 넣는 일과 이 표의 "받음"을 고치는 일은 Claude가 한다. 대화방이 길어져 느려지면 새 대화방에 "처음 하는 말"을 다시 붙이면 된다(그림체의 기준은 문서와 참고 그림에 있어서 이어진다).', '',
         '## ChatGPT에게 처음 하는 말', '', '```text', FIRST, '```', '',
         '---', '', '아래부터는 ChatGPT가 읽는 내용이다.', '',
         '## 이 게임과 그림의 기준 (처음에 한 번 읽는다)', '',
         "- '강호행'은 도트 그래픽 무협 RPG다. 화면은 HD-2D: 땅·집·벽·바위는 3D 모형이고, 사람과 작은 소품은 2D 도트 그림을 세운 것이다. 카메라는 남쪽 위에서 북쪽을 비스듬히 내려다본다.",
         '- 배경은 명나라풍과 한복풍을 섞은 가상의 고대 무협이다. 일본풍(기모노, 사무라이, 도리이)이나 서양 판타지(갑옷 기사, 마법진)가 아니다.',
         '- 도트는 각진 도트로 그린다(안티앨리어싱, 블러, 그라데이션, 반투명 없이). 게임에서 사람의 키는 48도트, 3.5등신이고 화면 높이의 8분의 1쯤이다.',
         '- 색: 풍경(돌, 회벽, 기와, 흙, 풀)은 가라앉은 누런 잿빛과 올리브빛이다. 주황이나 붉은 기가 화면을 덮으면 안 된다. 사람과 작은 소품은 또렷한 색(쪽빛, 진홍, 금빛, 흰색)으로 풍경에서 떠 보이게 한다.',
         '- 글자는 어떤 그림에도 넣지 않는다. 현판과 깃발의 글자, 초식 이름은 게임이 얹는다.',
         '- 한 번에 한 단계만 만든다. 단계 문서에 적힌 파일 이름, 크기, 칸 배치를 그대로 지킨다(게임의 도구가 그 이름과 배치로 그림을 읽는다).', '',
         '**크기의 기준(사람 키를 1로 볼 때).** 같은 갈래의 HD-2D 무협 게임 화면을 재서 정한 비례다. 모형과 소품의 크기는 단계 문서에 점 단위로 적혀 있고, 이 표는 그 바탕이다.', '',
         '| 무엇 | 사람 키의 몇 배 |', '|---|---|',
         '| 방의 뒷벽(바닥에서 들보까지) | 2.7. 문파 본전은 4를 넘는다 |', '| 방 안 두리기둥의 굵기 | 0.6 |', '| 세로 살창 | 폭 0.7, 높이 1.05. 창턱은 바닥에서 0.8 |', '| 단 위에 앉은 조사상 | 단까지 쳐서 2.3 |', '| 서 있는 종이 등롱 | 1.25 |', '| 벽에 드리운 번(깃발) | 길이 2 |',
         '| 문파의 산문(패루) | 높이 5, 가운데 칸의 폭 2.5~3 |', '| 본전 앞마당의 큰 향로 | 2.2 |', '| 돌난간 | 0.7 |', '| 돌계단 디딤판 하나의 높이 | 0.14 |', '| 본전의 기단(월대) | 2.5 |', '| 담(기와 덮개까지) | 3 |',
         '| 덤불 | 높이 1~1.5, 폭 1.5~2 |', '| 작은 나무, 큰 나무 | 2.5, 4 |', '| 마당의 태극 무늬 | 지름 4.8 |', '',
         '## 차례표', '',
         '위에서부터 게임에서 티가 많이 나는 순서다. 큰 줄기는 이렇다: ① 전투가 바로 좋아지는 것과 방·문파의 얼굴(검기, 방의 벽과 살림, 산문, 동료와 맞서는 사람의 도트, 적의 동작 칸) ② 화산귀환 인물의 얼굴, 화면 틀, 청하진 사람, 뜰과 나무와 덤불 ③ 아이콘, 새 사람, 문파 장문인 ④ 이야기의 장면 그림. 그림 단계 사이사이에 블렌더 모형 단계가 끼어 있다.', '',
         '| 차례 | 단계 | 무엇 | 종류 | 만들 것 | 상태 | 문서 |', '|---|---|---|---|---|---|---|']
    for c in ORDER:
        s = STEPS[c]; o.append(f"| {NUM[c]} | `{c}` | {s['title']} | {KIND[s['kind']]} | {len(s['items'])} | {status(s)} | {U('docs/gpt/' + c + '.md')} |")
    o += ['', '## 종류마다 넘기는 것', '',
          '| 종류 | 파일 | Claude가 넣는 방법 |', '|---|---|---|',
          '| 도트(걷기), 도트(짐승) | `<키>-walk.png` (2:1, 4열 3행, 마젠타 바탕) | `python3 tools/people_in.py <키>` |',
          '| 일러스트 | `<키>_n.png` (1024×1536) | `assets/art/`에 넣고 `list.json`에 이름을 적는다 |',
          '| 동작 칸 | `<키>-c.png` (2400×320, 여섯 칸) | `python3 tools/people_in.py <키>` |',
          '| 효과 | `<이름>.png` (초록 바탕) | `python3 tools/fx_in.py <이름>` |',
          '| 그림 장 | `<이름>.png` (파랑 바탕) | `python3 tools/wall_in.py`와 소품 자르기 |',
          '| 모형(블렌더) | `gangho_m<번호>.zip`과 `gangho_m<번호>.py` | `python3 tools/blender/gpt.py check <zip> --install` |',
          '| 화면 틀, 아이콘 | `<이름>.png` (초록 바탕) | 칸을 잘라 `assets/hd/ui/`, `assets/hd/icon/`에 |',
          '| 장면 그림 | `cg_<이름>.png` (16:9) | `assets/art/`에 넣고 `list.json`에 이름을 적는다 |', '',
          '받은 파일은 이름 그대로 저장소 `art-src/chatgpt/`에 둔다(모형 스크립트는 `art-src/blender/`).', '']
    return '\n'.join(o)


def build():
    files = {'index.md': index()}
    for c in ORDER: files[c + '.md'] = page(STEPS[c])
    return files


if __name__ == '__main__':
    files = build(); os.makedirs(OUT, exist_ok=True); bad = 0
    if '--check' in sys.argv:
        for n, t in files.items():
            p = os.path.join(OUT, n)
            if not os.path.exists(p) or open(p, encoding='utf-8').read() != t: bad += 1; print('docs/gpt/' + n + '가 저장된 것과 다르다')
        extra = [n for n in os.listdir(OUT) if n.endswith('.md') and n not in files]
        for n in extra: print('docs/gpt/' + n + '는 차례표에 없는 문서다'); bad += 1
        if bad: print('python3 tools/gpt_queue.py 를 돌려 요청서를 다시 뽑는다')
        sys.exit(1 if bad else 0)
    for n, t in files.items(): open(os.path.join(OUT, n), 'w', encoding='utf-8').write(t)
    tot = sum(len(s['items']) for s in STEPS.values()); done = sum(x['got'] for s in STEPS.values() for x in s['items'])
    print(f'단계 {len(ORDER)}개, 만들 것 {tot}개, 받은 것 {done}개 → docs/gpt/')
