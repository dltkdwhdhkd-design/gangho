# docs/chatgpt-people.md를 만든다(사람 그림은 ChatGPT가 그린다): 사람마다 대화 일러스트와 걷기 도트를 한 묶음으로(일러스트가 먼저, 도트는 그 일러스트를 보고)
# 인물 설명은 docs/art-requests.md(이미 받은 일러스트)와 아래 NEW(새로 그릴 사람)에서 가져온다. 다 받은 사람은 빠진다
import os, re, json, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, '/tmp'); exec(open(os.path.join(ROOT, 'tools', 'people_new.py')).read())  # NEW, HOLD
art = set(json.load(open(os.path.join(ROOT, 'assets', 'art', 'list.json'))))
have = set(json.load(open(os.path.join(ROOT, 'assets', 'hd2d', 'preview', 'people.json'))))
req = open(os.path.join(ROOT, 'docs', 'art-requests.md')).read()
DESC = {m.group(1): (m.group(2).strip(), m.group(3).strip().replace('같은 규칙으로 그려 줘. ', '')) for m in re.finditer(r"### (\w+)_n\.png · ([^\n]*)\n\n```text\n(.*?)\n```", req, re.S)}
TIERS = [
 ('1순위: 동료와 히로인 (일러스트는 있다. 그 일러스트대로 도트만)', ['so', 'cheol', 'baekrang', 'hyeok', 'clan_dang', 'clan_moyong', 'clan_namgung', 'c_haho', 'c_mun', 'c_owol', 'c_hyegong', 'c_saira', 'c_gal', 'c_yang', 'c_gu']),
 ('2순위: 청하진과 자주 만나는 사람 (일러스트는 있다)', ['gwak', 'baek', 'elder', 'smith', 'doc', 'boat', 'hunter', 'realtor', 'shopk', 'host', 'town', 'town2', 'kid', 'beggar', 'disc', 'flower', 'wander', 'wife', 'husband']),
 ('3순위: 새로 그릴 사람 (일러스트부터)', [k for k, _, _ in NEW]),
 ('4순위: 문파 장문인과 세가 가주 (일러스트는 있다)', sorted(k[:-2] for k in art if k.startswith('clan_') and k.endswith('_n') and k[:-2] not in ('clan_dang', 'clan_moyong', 'clan_namgung'))),
]
NEWD = {k: (t, d) for k, t, d in NEW}
R = 'https://github.com/dltkdwhdhkd-design/gangho/blob/main/'
ILL = """지금부터 내 게임 '강호행'(한국 무협 도트 게임)의 대화 일러스트를 그려 줘. 첨부한 ref-art.png의 그림체와 똑같이: 한국 웹소설 표지풍의 깔끔한 2D 일러스트, 또렷한 선, 셀화 채색에 가벼운 명암(사진풍·3D풍 금지). 복장은 명나라풍과 한복풍을 섞은 가상의 고대 무협(기모노·사무라이 금지). 허벅지 위까지 보이는 한 사람, 몸은 오른쪽으로 살짝, 얼굴과 시선은 거의 정면, 머리와 손이 잘리지 않게. 세로 1024×1536, 배경은 투명하거나 무늬 없는 단색 회색. 글자·서명·테두리 없이. 이 일러스트는 같은 사람의 걷는 도트 그림의 기준이 되니, 머리 모양과 색, 옷의 모양과 색, 장식, 들고 있는 물건을 분명하게 그려."""
DOT = """첨부한 일러스트 속 사람을 HD-2D 무협 RPG(일검풍운결 같은)의 걷는 도트로 그려 줘. 일러스트와 같은 사람이어야 해: 머리 모양과 색, 옷의 모양과 색, 허리띠·장식, 들고 있는 물건까지 일러스트와 똑같이. 도트는 첨부한 ref-people.png와 같은 급: 3.5등신, 한 사람의 키가 그림에서 300픽셀쯤, 얼굴에 눈·눈썹·입이 작게, 머리카락 3~4단·옷 4~5단 명암, 외곽선은 짙은 갈색이나 짙은 남색 1도트, 빛은 왼쪽 위에서 약하게. 각진 도트로(안티앨리어싱·블러·그라데이션·반투명 없이). 배경은 완전한 단색 마젠타(#FF00FF), 그림 안에는 마젠타를 쓰지 마. 바닥 그림자·빛번짐·글자 없이."""
A = "정사각형 한 장(1:1)을 2열 3행으로 나눠 이 사람을 6번 그려. 1열은 정면, 2열은 뒷모습. 1행 차렷, 2행 왼발 내딛기, 3행 오른발 내딛기(2행과 3행은 서로 반대 발). 팔은 다리와 반대로 흔들리고, 손에 든 물건은 여섯 칸 모두 같게. 여섯 칸 모두 키·머리 크기·옷·색이 같고 칸끼리 넉넉히 떼."
B = "방금 그린 그 사람을 정사각형 한 장(1:1)에 2열 3행으로 6번 더 그려. 여섯 칸 모두 왼쪽을 보는 옆모습. 1열은 차렷, 왼발 내딛기, 오른발 내딛기. 2열은 숨 쉬는 차렷, 왼발 다음 중간 걸음(뒷발이 들려 앞으로 넘어옴), 오른발 다음 중간 걸음. 키·색·옷은 앞 그림과 같게. 배경은 같은 단색 마젠타."
out = [f"""# ChatGPT 요청문: 사람 (대화 일러스트와 걷는 도트를 한 사람씩)

사람 그림도 ChatGPT가 그린다. 같은 사람의 대화 일러스트와 도트가 서로 달라 보이면 안 되니, **사람마다 일러스트를 기준으로 도트를 그린다.** 이 문서는 Claude가 계속 고친다(다 받은 사람은 빠지고, 새 사람이 붙는다). 벽·지붕·소품 같은 사람 아닌 그림은 `docs/chatgpt-now.md`에 있다.

## ChatGPT에게 처음 하는 말

**방법 1 (주소)**: 새 대화에 아래를 붙인다. 다음부터는 "다음"이라고만 하면 된다.

```text
아래 주소의 문서를 읽어 줘. 내 게임 '강호행'에 들어갈 사람 그림 요청문이야.
https://dltkdwhdhkd-design.github.io/gangho/docs/chatgpt-people.md
맨 위 사람부터 칸 하나씩 그려 줘. 한 메시지에 한 장만. 칸에 적힌 참고 그림 주소도 열어서 봐. 내가 "다음"이라고 하면 다음 칸을 그려.
```

**방법 2 (주소를 못 열 때)**: 칸을 하나씩 복사해 붙이고, 칸에 적힌 그림을 같이 올린다.

한 사람은 한 대화에서 끝까지(일러스트 → a → b) 이어 가면 같은 사람으로 맞춰진다.

1. 일러스트가 이미 있는 사람: 그 사람의 일러스트(`assets/art/<키>_n.webp`)와 `art-src/ref-people.png`를 올리고 **a** 칸, 이어서 **b** 칸.
2. 새로 그릴 사람: `art-src/ref-art.png`를 올리고 **일러스트** 칸 → 받은 일러스트와 `ref-people.png`를 올리고 **a** 칸 → **b** 칸.
3. 받은 그림은 Claude 대화에 붙이거나, 칸 제목의 파일 이름 그대로(`<키>_n.png`, `<키>-a.png`, `<키>-b.png`) 저장소 `art-src/chatgpt/`에 올린다.
4. 바탕이 검정이거나 칸 수가 틀리면 "바탕은 단색 마젠타로, 칸은 2열 3행으로 다시"라고 한다. 도트가 일러스트와 다르면 "일러스트와 머리·옷 색을 똑같이 다시"라고 한다. a 칸의 2행과 3행이 같은 발이면 "3행은 반대 발로 다시"라고 한다.

참고 그림
- 일러스트 그림체: {R}art-src/ref-art.png
- 도트 급과 칸 배치: {R}art-src/ref-people.png
- 사람마다의 일러스트: {R}assets/art (파일 이름은 <키>_n.webp)
"""]
n = 0
for title, keys in TIERS:
    blocks = []
    for k in keys:
        if 'n_' + k in have: continue
        new = k in NEWD; t, d = NEWD[k] if new else DESC.get(k, (k, ''))
        if not new and k + '_n' not in art: continue
        n += 1; b = [f"### {t} — 키 `{k}`\n"]
        if new: b.append(f"**일러스트 `{k}_n.png`** (ref-art.png 올리기)\n\n```text\n{ILL}\n\n인물: {d}\n```\n")
        else: b.append(f"일러스트: {R}assets/art/{k}_n.webp\n")
        b.append(f"**도트 `{k}-a.png`** ({'방금 받은 일러스트' if new else '이 사람 일러스트'}와 ref-people.png 올리기)\n\n```text\n{DOT}\n\n{A}\n\n인물: {d}\n```\n")
        b.append(f"**도트 `{k}-b.png`**\n\n```text\n{B}\n```\n")
        blocks.append('\n'.join(b))
    if blocks: out.append(f"## {title}\n\n" + '\n'.join(blocks))
if HOLD:
    hb = []
    for k, t, d in HOLD:
        hb.append(f"### {t} — 키 `{k}`\n\n**일러스트 `{k}_n.png`**\n\n```text\n{ILL}\n\n인물: {d}\n```\n\n**도트 `{k}-a.png`**\n\n```text\n{DOT}\n\n{A}\n\n인물: {d}\n```\n\n**도트 `{k}-b.png`**\n\n```text\n{B}\n```\n")
    out.append("## 보류: 기루 사람들 (기루를 게임에 넣기로 하면 그때)\n\n기녀는 모두 스물 넘은 성인 예인이고, 몸을 다 덮는 단정한 비단옷으로 노출 없이 그린다.\n\n" + '\n'.join(hb))
open(os.path.join(ROOT, 'docs', 'chatgpt-people.md'), 'w').write('\n'.join(out)); print('사람', n)
