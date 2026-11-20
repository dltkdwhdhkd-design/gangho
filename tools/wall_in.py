# 블렌더 모형에 입히는 무늬(pm_*.webp)를 만든다. 모형에는 재질 이름만 있고, 게임(js/hd2d/palette.js)이 그 이름에 이 무늬를 입힌다.
# 지금은 **임시 무늬**다: 방의 벽과 기둥 무늬(요청서 docs/chatgpt-scene.md의 WL1, WL2, WL3)가 아직 안 와서, 받아 둔 담·지붕·땅 그림에서 잘라 빛깔만 바꿔 쓴다.
# 그림이 오면 아래 '받은 그림' 대목이 같은 파일 이름으로 덮어쓴다(게임 쪽은 손대지 않는다).
#   pm_plaster, pm_plaster_white : 회벽(담 그림 k_tiled의 회벽 띠)
#   pm_base_rough, pm_stone_dark : 막돌 쌓기(돌담 k_stone)
#   pm_stone, pm_brick           : 다듬은 돌(성벽 hd_wall_rampart), 전돌(마당 g_yard)
#   pm_wallplank, pm_plank, pm_wood_dark, pm_wood_red, pm_wood_pine, pm_wood_black, pm_bark : 널 지붕 그림(r_plank)의 빛깔을 바꾼 것
#   pm_earth                     : 흙(길 g_road)
# 도트 굵기는 다른 그림과 같다(평면도 한 점에 3.2점. 방 안에서는 게임이 2.2점으로 굵게 입힌다).
# 쓰는 법: python3 tools/wall_in.py
import os
import numpy as np
from PIL import Image
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'art-src', 'chatgpt'); PV = os.path.join(ROOT, 'assets', 'hd2d', 'preview')
DOT = 48 / 15

def load(n): return np.asarray(Image.open(os.path.join(PV, n + '.webp')).convert('RGB')).astype(np.float32)
def wrap_h(a, f):
    t = np.linspace(0, 1, f)[None, :, None]; out = a[:, :-f].copy(); out[:, :f] = a[:, -f:] * (1 - t) + a[:, :f] * t; return out
def mirror_v(a): return np.concatenate([a, a[::-1]])  # 위아래로 뒤집어 붙인다: 띠 하나짜리 그림이 세로로도 이어진다
def tone(a, mul=(1, 1, 1), sat=1.0):
    l = (a * (.299, .587, .114)).sum(axis=2, keepdims=True); return (l + (a - l) * sat) * np.array(mul, dtype=np.float32)
def save(arr, name):
    a8 = np.clip(arr, 0, 255).astype(np.uint8); p = os.path.join(PV, name + '.webp'); Image.fromarray(a8).save(p, lossless=True)
    print(os.path.relpath(p, ROOT), a8.shape[1], 'x', a8.shape[0], '→ 평면도', round(a8.shape[1] / DOT, 1), 'x', round(a8.shape[0] / DOT, 1))

# ── 임시 무늬(있는 그림에서) ──
pl = mirror_v(wrap_h(load('k_tiled')[14:33], 6))            # 담의 회벽 띠(위는 기와, 아래는 밑동이라 가운데 19줄만)
pl = pl.mean(axis=(0, 1), keepdims=True) * .6 + pl * .4     # 갈라진 금을 흐리게: 뒤집어 붙인 금이 벽지 무늬처럼 되풀이돼 보인다
save(tone(pl, (.93, .92, .89)), 'pm_plaster')               # 기준 그림의 벽은 누렇고 조금 가라앉았다
save(tone(pl, (1.04, 1.05, 1.06), .45), 'pm_plaster_white')
st = load('k_stone')[0:39]
save(st, 'pm_base_rough'); save(tone(st, (.52, .54, .62), .6), 'pm_stone_dark')
save(tone(load('hd_wall_rampart')[16:48], (.98, 1.0, 1.03), .5), 'pm_stone')
save(tone(load('g_yard'), (.74, .77, .82), .35), 'pm_brick')
wd = load('r_plank')                                        # 널 지붕 그림(잿빛 세로 널). 빛깔만 바꿔 여러 나무로 쓴다
for name, mul in (('pm_wallplank', (.86, .66, .47)), ('pm_plank', (.95, .76, .55)), ('pm_wood_dark', (.6, .42, .3)), ('pm_wood_red', (.98, .34, .26)), ('pm_wood_pine', (1.3, 1.08, .78)), ('pm_wood_black', (.3, .28, .27)), ('pm_bark', (.52, .44, .38))):
    save(tone(wd, mul, .5), name)
save(tone(load('g_road'), (.98, .9, .78), .8), 'pm_earth')

# ── 받은 그림(오면 여기서 같은 이름으로 덮어쓴다) ──
# WL1.png(방 벽 여섯: 누런 회벽, 흰 회벽, 판자, 벽돌, 흙벽, 짙은 돌) → pm_plaster, pm_plaster_white, pm_wallplank, pm_brick, pm_earth, pm_stone_dark
# WL2.png(아랫단 셋, 들보 셋) → pm_base_rough, pm_stone, pm_base_plank / pm_beam_dark, pm_beam_red, pm_beam_paint
# WL3.png(나무 여섯: 짙은 나무, 붉은 칠, 생나무, 검은 칠, 대나무, 창호지) → pm_wood_dark, pm_wood_red, pm_wood_pine, pm_wood_black, pm_bamboo, pm_paper
for f in ('WL1.png', 'WL2.png', 'WL3.png'):
    if os.path.exists(os.path.join(SRC, f)): print('받은 그림이 있다:', f, '— 자르는 대목을 여기에 넣는다')
