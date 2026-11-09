#!/usr/bin/env python3
# 아직 못 받은 그림만 모아 docs/missing.md로 뽑는다: python3 tools/missing_doc.py
# 받은 그림은 assets/를 보고 알아서 빠진다. 그림을 넣을 때마다 다시 돌리면 된다
import json, os, re
import numpy as np
from PIL import Image

def read(p): return open(p, encoding='utf8').read()
def has_art(k): return os.path.exists(f'assets/art/{k}.webp')
def has_hd(k): return os.path.exists(f'assets/hd/{k}.webp')
def full_char(k):
    """걷기와 전투가 다 들어간 시트인지 본다. 시험 때 걷기만 넣은 시트는 전투 칸이 서 있는 그림의 복사본이다"""
    if not has_hd(k): return False
    a = np.array(Image.open(f'assets/hd/{k}.webp').convert('RGBA')); return a.shape[0] >= 224 and not np.array_equal(a[128:160], a[0:32])

out = []; w = out.append; count = {}
def block(t): w('```text'); w(t.strip()); w('```'); w('')

# ── 대화 일러스트 ──
art = read('docs/art-requests.md')
rule = re.search(r'## 공통 규칙\n+```text\n(.*?)\n```', art, re.S).group(1)
scene_rule = re.search(r'## 4순위: 장면 그림.*?```text\n(.*?)\n```', art, re.S).group(1)
expr_txt = {k: t for k, t in re.findall(r'### _([hasb])\.png · [^\n]+\n+```text\n(.*?)\n```', art, re.S)}
expr_name = {'h': '웃는 표정', 'a': '화나거나 날이 선 표정', 's': '슬픈 표정', 'b': '당황해서 얼굴이 붉어진 표정'}
items = re.findall(r'### ([a-z0-9_]+)\.png · ([^\n]+)\n+```text\n(.*?)\n```', art, re.S)
people = [(k, n, t) for k, n, t in items if not k.startswith(('cg_', '_')) and not has_art(k)]
EXPR = ['me', 'yun', 'so', 'clan_dang', 'clan_moyong', 'clan_namgung', 'baekrang', 'hyeok', 'cheol', 'gwak']
names = {k[:-2]: n.split(' (')[0] for k, n, t in items if k.endswith('_n')}
exprs = [(c, e) for c in EXPR for e in 'hasb' if has_art(f'{c}_n') and not has_art(f'{c}_{e}')]
# ── 장면 그림 ──
cgjs = read('js/cg.js'); cg = re.findall(r"^\s+([a-z_0-9]+): \['([^']*)', '#[0-9a-f]+', '#[0-9a-f]+', '([^']*)'\],", cgjs, re.M)
cg_req = {k[3:]: t for k, n, t in items if k.startswith('cg_')}
# 장면마다 따로 다듬은 문장. 인물이 중심인 장면은 인물 그림을 첨부한다. 없는 장면은 js/cg.js 설명을 그대로 쓴다
CEN = '이번 그림은 인물이 중심이야. 첨부한 인물 그림과 같은 얼굴, 같은 옷으로 그려.'
SCENE = {
  'fire': ('밤에 불타는 이층 객잔 앞마당. 국자를 쥐고 버티고 선 중년 여인의 뒷모습과, 불빛 너머 지붕 위에 선 여우 가면의 검은 옷 무사.', ['gwak_n']),
  'well': ('우물 밑의 좁은 돌방. 촛불 몇 개 아래 작은 위패들이 계단처럼 빽빽이 놓였고, 그 앞에 편지를 든 낭인의 뒷모습.', []),
  'go_yard': ('구름이 발아래 깔린 산꼭대기 연무장. 목검을 맞댄 두 사람이 멀리 작게 보인다. 한 사람은 검은 옷의 낭인, 한 사람은 은빛 머리에 삿갓을 쓴 여검객.', []),
  'library': ('밤의 장서각. 촛불 하나만 켜진 높은 서가 사이에서 뜯겨 나간 책을 들여다보는 두 사람의 옆모습. 검은 옷의 낭인과 삿갓을 벗은 은빛 머리 여검객.', []),
  'sweep': ('먼지가 쌓인 넓은 장경각 마루. 허리를 세우고 걸레질하는 낭인과, 멀리서 빗자루를 짚고 지켜보는 늙은 스님.', []),
  'cliff': ('벼랑 밑 어두운 동굴. 천장 틈으로 한 줄기 빛이 내려오고, 무릎에 칼을 올린 채 앉아 있는 오래된 유골. 무섭기보다 고요하게.', []),
  'final': ('함성이 가득한 큰 성의 석조 비무대. 사방 관중석에 사람이 빽빽하고, 비무대 한가운데 칼을 맞댄 두 사람이 작게 보인다.', []),
  'banquet': (CEN + ' 화려한 연회장. 맹주가 웃으며 잔을 내밀고, 그 앞으로 젊은 여의원이 손을 뻗으며 뛰어든다. 탁자 위 술잔이 흔들린다.', ['chief_n', 'yun_n']),
  'cross': ('새벽안개 낀 갈대밭. 등불을 든 세 여인이 서로 떨어져 서서 길 끝을 바라본다. 길 끝에 작은 낭인의 뒷모습.', ['so_n', 'baekrang_n', 'hyeok_n']),
  'kids': ('쌀 창고 지하의 어두운 방. 복면을 무릎에 벗어 놓은 아이들이 등을 보이고 둘러앉아 말없이 주먹밥을 먹는다. 얼굴은 보이지 않게.', []),
  'council': ('밤의 큰 회관 마당. 양쪽에 문파 장문인들이 줄지어 서 있고, 마당 한가운데로 호위 없이 혼자 걸어 들어오는 맹주의 뒷모습.', []),
  'flags': ('산채 마당에 검은 깃발 열두 개가 바람에 펄럭인다. 깃발 아래 큰 칼을 짚은 거한과 그 옆에 선 낭인의 뒷모습.', ['samaung_n']),
  'fire_gu': ('불길이 치솟는 성의 남문. 그 앞으로 보따리와 수레를 끌고 빠져나가는 피난민들의 행렬.', []),
  'evac': ('새벽의 작은 강나루. 쟁반을 끌어안은 꼬마와 모루를 짊어진 대장장이가 나룻배에 오르고, 사람들이 줄지어 기다린다.', []),
  'mask': ('달빛 아래 반으로 갈라져 떨어지는 하얀 여우 가면. 가면 뒤로 드러나는 젊은 남자의 얼굴은 그림자에 반쯤 가려져 있다.', ['cheon_n']),
  'chief_stab': ('달 아래 산 위. 등에 칼을 맞고도 맹주의 손목을 끝까지 붙잡고 놓지 않는 남자의 뒷모습. 상처와 피는 보이지 않게, 두 사람의 실루엣으로.', []),
  'red_moon': ('저녁 강나루 마을. 서쪽 하늘에 뜬 크고 붉은 달을 올려다보는 마을 사람들의 뒷모습.', []),
  'rain': (CEN + ' 붉은 비가 내리는 마을 약방 앞. 소매를 걷어붙이고 약 사발을 든 젊은 여의원. 뒤로 줄지어 누운 환자들은 작게.', ['yun_n']),
  'table': ('다시 지은 이층 객잔 안. 큰 탁자 하나에 정파와 사파의 우두머리들이 마주 앉아 있고, 쟁반을 든 낭인이 국수를 나른다. 따뜻한 등불.', []),
  'gate': (CEN + ' 불타는 큰 절의 산문 앞. 삿갓을 벗은 덩치 큰 파계승이 철장을 짚고 혼자 버티고 서 있다.', ['cheol_n']),
  'retake': ('새벽 성벽 위로 서로 다른 두 깃발이 나란히 오른다. 성벽 아래 지친 무사들이 올려다본다.', []),
  'silk': ('끝없는 모래 언덕 위로 줄지어 가는 작은 원정대와 낙타. 해 질 녘 붉은 하늘.', []),
  'sheath': ('눈보라 치는 얼음 궁전 안. 무릎을 꿇고 오래된 칼을 빈 칼집에 넣는 은빛 머리 여검객의 뒷모습.', ['so_n']),
  'ghost': ('비 오는 밤. 시퍼렇게 빛나는 눈으로 칼을 든 남자가 낭인 앞에 말없이 서 있다. 둘 다 멀리서 본 실루엣으로.', ['cheon_n']),
  'last_rent': ('설산의 거대한 돌문 앞. 봉인 문양이 희미하게 빛나고, 백발 노인이 은자 봉투를 내밀고 있다.', ['baek_n']),
  'chief_end': ('무너지는 설산 동굴 입구. 붉게 터지는 봉인 문양의 빛과 쓰러진 남자의 실루엣.', []),
  'tianmo': ('붉은 달을 등지고 천천히 일어서는 거대한 마두의 실루엣. 그 앞에 무릎 꿇은 작은 낭인.', ['cheonma_n']),
  'mop_again': ('텅 빈 객잔 마루. 아침 햇살이 창으로 들어오고, 허리를 세우고 바닥을 닦는 낭인의 뒷모습.', []),
  'preface': (CEN + ' 등잔 하나 켜진 객잔 부엌의 밤. 중년 여인이 낡은 장부의 첫 장을 조심스레 뜯어 건넨다.', ['gwak_n']),
  'siege': ('객잔 앞에 사람들이 길게 늘어서 있고, 맨 앞에 국자를 든 중년 여인이 문을 막고 서 있다. 멀리 몰려오는 검은 무리.', ['gwak_n']),
  'samaung_end': (CEN + ' 깊은 골짜기 위 좁은 돌다리. 큰 칼을 든 거한이 혼자 다리를 막아서고, 건너편에서 그림자 같은 무리가 몰려온다.', ['samaung_n']),
  'cheon_end': ('가면을 벗은 젊은 남자가 낭인을 등 뒤로 밀어내며 앞으로 나서는 순간. 둘의 실루엣과 앞쪽의 붉은 빛.', ['cheon_n']),
  'fall': ('달이 지는 새벽하늘 아래 산마루. 허리를 세우고 왼발을 내딛는 낭인의 뒷모습.', []),
  'bond_yun': (CEN + ' 밤의 약방. 탁자에 엎드려 잠든 젊은 여의원, 옆에 반쯤 남은 국수 그릇과 장부.', ['yun_n']),
  'bond_so': (CEN + ' 달빛 아래 마당. 은빛 머리 여검객이 칼집째 든 칼끝으로 누군가의 발목을 툭 치며 웃는다.', ['so_n']),
  'bond_dang': (CEN + ' 다실. 보랏빛 옷의 여인이 흰 찻잔을 두 손으로 내민다. 잔 밑바닥에 글자가 새겨져 있지만 읽히지 않게.', ['clan_dang_n']),
  'bond_mo': (CEN + ' 큰 거울 앞. 푸른 옷의 귀한 집 아가씨가 거울을 보다가 얼굴이 붉어져 손으로 입을 가린다.', ['clan_moyong_n']),
  'bond_nam': (CEN + ' 새벽 담장 안 마당. 은발의 여검객이 붕대 감은 손으로 검을 천천히 내린다. 이마에 땀.', ['clan_namgung_n']),
  'bond_bae': (CEN + ' 도박장 구석. 붕대 감은 손가락으로 주사위 하나를 내미는 여인. 웃고 있지만 눈은 진지하다.', ['baekrang_n']),
  'bond_hyeok': (CEN + ' 향이 피어오르는 작은 방. 달맞이꽃 향 앞에서 처음으로 소리 내어 웃는 여인.', ['hyeok_n']),
  'bond_cheol': (CEN + ' 길가 바위에 걸터앉은 덩치 큰 파계승이 주먹밥 세 개 중 하나를 먼저 내민다.', ['cheol_n']),
  'wedding': ('객잔 마당에 차려진 혼례상. 등불과 붉은 천, 소매로 눈물을 훔치는 늙은 뱃사공과 크게 웃는 중년 여인. 신랑 신부는 뒷모습으로.', ['gwak_n']),
  'end_table': ('다시 문을 연 객잔. 탁자마다 강호 사람들이 앉아 있고, 국수 쟁반을 든 낭인이 그 사이를 지나간다. 따뜻한 저녁 빛.', []),
}
def scene_q(k, d):
    if k in cg_req: return cg_req[k], []
    t, att = SCENE.get(k, (d + '.', [])); return '같은 규칙으로 그려 줘. ' + t, att
scenes = [(k, t) + scene_q(k, d) for k, t, d in cg if not has_art('cg_' + k)]
# ── 도트 인물 ──
px = read('docs/pixel-characters.md')
first = re.search(r'\*\*대화방 첫 줄에 붙일 문장\*\*\n+```\n(.*?)\n```', px, re.S).group(1)
walk_t = re.search(r'\*\*걷기 시트 문장\*\*\n+```\n(.*?)\n```', px, re.S).group(1)
fight_t = re.search(r'\*\*전투 시트 문장\*\*\n+```\n(.*?)\n```', px, re.S).group(1)
diag_t = re.search(r'\*\*대각선 시트 문장\*\*\n+```\n(.*?)\n```', px, re.S).group(1)
pix = re.findall(r'\*\*(C\d+)\. (.+?)\*\* `([^`]+)`\n```\n(.*?)\n```(?:\n\n이 그림을 쓰는 사람: ([^\n]+))?', px, re.S)
def got(code):
    if code in ('T1', 'T2', 'T3'): return True
    if code == 'T4': return has_hd('chars/BlueSamurai_d')
    if code.startswith('chars/') and not code.endswith('_d'): return full_char(code)
    return has_hd(code)
chars = [x for x in pix if x[2].startswith('chars/') and not x[2].endswith('_d') and not got(x[2])]
mons = [x for x in pix if x[2].split('/')[0] in ('mon', 'boss', 'ani') and not got(x[2])]
diags = [x for x in pix if (x[2].endswith('_d') or x[2] == 'T4') and not got(x[2])]

w('# 강호행: 아직 못 받은 그림만 모은 요청서'); w('')
w('받은 그림은 빼고 남은 것만 모았어. 그림을 넣을 때마다 `python3 tools/missing_doc.py`로 다시 뽑으니까, 이 문서에 남아 있는 건 아직 게임에 없는 거야.'); w('')
w('| 묶음 | 남은 수 | 어느 대화방에서 |'); w('|---|---|---|')
w(f'| [1. 대화 일러스트](#1-대화-일러스트) | 인물 {len(people)}장, 표정 {len(exprs)}장 | 인물 일러스트를 뽑던 대화방 |')
w(f'| [2. 장면 그림](#2-장면-그림) | {len(scenes)}장 | 장면 그림을 뽑던 대화방 |')
w(f'| [3. 도트 인물](#3-도트-인물) | 인물 {len(chars)}명(2장씩), 몬스터와 동물 {len(mons)}장 | 도트 인물을 뽑던 대화방 |')
w(f'| [4. 대각선 걷기](#4-대각선-걷기) | {len(diags)}장 (없어도 게임은 돌아가) | 도트 인물을 뽑던 대화방 |'); w('')
w('배경과 이펙트(B, E 번호)는 다 받아서 여기 없어.'); w('')
w('예전 대화방이 남아 있으면 거기서 이어서 하는 게 그림체가 제일 잘 맞아. 새 대화방을 열 때는 각 묶음 맨 앞의 문장부터 붙이고, 이미 받은 그림 한 장을 같이 올려서 "이 그림체 그대로"라고 해 줘.'); w('')
w('파일 이름은 제목에 적힌 대로 저장해 줘. 이름이 달라도 누구인지만 알 수 있으면 내가 찾아 넣을게.'); w('')

w('## 1. 대화 일러스트'); w('')
if people or exprs:
    w('새 대화방이면 이 규칙부터 붙여.'); w(''); block(rule)
for k, n, t in people: w(f'### {k}.png · {n}'); w(''); block(t)
if exprs:
    w('### 표정'); w(''); w('기본 그림(`_n`)을 첨부하고 문장을 붙여. 원본 PNG가 없으면 저장소 `assets/art/`에 같은 이름으로 있어. 파일 이름은 뒤의 `_n`만 바꾸면 돼.'); w('')
    for c, e in exprs: w(f'**{c}_{e}.png** · {names.get(c, c)}, {expr_name[e]} (첨부: `{c}_n`)'); w(''); block(expr_txt[e])
if not people and not exprs: w('다 받았어.'); w('')

w('## 2. 장면 그림'); w('')
if scenes:
    w('가로 그림이야. 새 대화방이면 인물 일러스트 한 장을 먼저 올려서 그림체를 맞추고 이 규칙을 붙여. 첨부가 적힌 장면은 그 인물 그림을 같이 올려 줘. 원본 PNG가 없으면 저장소 `assets/art/`에 같은 이름으로 있어.'); w(''); block(scene_rule)
    for k, t, q, att in scenes: w(f'### cg_{k}.png · {t}' + (' (첨부: ' + ', '.join(f'`{a}`' for a in att) + ')' if att else '')); w(''); block(q)
else: w('다 받았어.'); w('')

w('## 3. 도트 인물'); w('')
if chars or mons:
    w('번호는 원래 요청서와 같아. 새 대화방이면 이 문장부터 붙여.'); w(''); block(first)
if chars:
    w('인물마다 아래 칸을 붙여 걷기 시트를 먼저 뽑고, 같은 대화에서 바로 이 전투 시트 문장을 붙여. 전투 시트 문장은 모든 인물에 똑같아.'); w('')
    w('**전투 시트 문장**'); w(''); block(fight_t)
    for no, n, code, t, who in chars:
        w(f'### {no}. {n}'); w(''); block(walk_t + '\n' + t.strip())
        if who: w(f'게임에서 이 도트를 쓰는 사람: {who}'); w('')
if mons:
    w('### 몬스터와 동물'); w('')
    for no, n, code, t, who in mons: w(f'**{no}. {n}** `{code}`'); w(''); block(t)
if not chars and not mons: w('다 받았어.'); w('')

w('## 4. 대각선 걷기'); w('')
if diags:
    w('비스듬히 걸을 때 쓰는 그림이야. 없으면 옆모습으로 걸어. 그 인물의 걷기 시트를 뽑은 대화방에서 걷기 시트를 보여 주고 이 문장을 붙여. 주인공(C68)부터 해 보고 괜찮으면 나머지를 해. 걷기 시트를 아직 안 뽑은 인물은 3번 묶음부터 해야 해.'); w(''); block(diag_t)
    for no, n, code, t, who in diags: w(f'- **{no}.** {n}' + (f' (`{code}`)' if code != 'T4' else '') + ' · ' + t.strip().split('\n')[-1].replace('인물: ', ''))
    w('')
else: w('다 받았어.'); w('')
open('docs/missing.md', 'w', encoding='utf8').write('\n'.join(out).rstrip() + '\n')
print('일러스트', len(people), '표정', len(exprs), '장면', len(scenes), '도트 인물', len(chars), '몬스터', len(mons), '대각선', len(diags))
