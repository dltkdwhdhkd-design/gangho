#!/usr/bin/env python3
# ChatGPT가 블렌더로 만든 모형을 받아 넣는 도구. 규격은 tools/blender/spec.json, 틀은 tools/blender/gangho_kit.py, 요청서는 docs/chatgpt-blender.md.
#   python3 tools/blender/gpt.py run <받은 스크립트.py> [--install]   받은 스크립트를 돌려 .glb를 만들고 검사한다. --install이면 통과한 것을 assets/hd2d/models/에 넣는다
#   python3 tools/blender/gpt.py check <.glb나 폴더나 .zip…> [--install]   받은 .glb를 규격으로 검사한다
#   python3 tools/blender/gpt.py doc [--check]                       요청서의 표와 틀을 spec.json·gangho_kit.py에서 다시 뽑는다(--check는 어긋났는지만 본다)
# 받은 스크립트는 남이 쓴 코드다. 돌리기 전에 읽어 본다(파일을 지우거나 밖으로 내보내는 줄이 없는지). 돌릴 때는 빈 폴더에서 돌린다.
import json, os, re, shutil, subprocess, sys, tempfile

HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(os.path.dirname(HERE))
SPEC = json.load(open(os.path.join(HERE, 'spec.json'), encoding='utf-8')); KIT = os.path.join(HERE, 'gangho_kit.py'); DOC = os.path.join(ROOT, 'docs', 'chatgpt-blender.md')
MODELS = os.path.join(ROOT, 'assets', 'hd2d', 'models')
PIECES = {p['name']: (p, st) for st in SPEC['sets'] for p in st['pieces']}
K0, K1 = '# ==== 강호행 틀 v', '# ==== 강호행 틀 끝 ===='


def palette():
    src = open(KIT, encoding='utf-8').read(); body = src[src.index('PALETTE = {'):]; body = body[:body.index('\n}') + 2]
    ns = {}; exec(body, ns); return ns['PALETTE']


def measure(path):
    """.glb 하나를 블렌더로 읽어 잰다(블렌더 좌표: z가 위)"""
    import bpy
    bpy.ops.wm.read_factory_settings(use_empty=True); bpy.ops.import_scene.gltf(filepath=path)
    lo, hi, tris, mats, uv, lamps = [1e9] * 3, [-1e9] * 3, 0, set(), False, 0
    for o in bpy.context.scene.objects:
        if o.name.startswith('lamps'): lamps = len(json.loads(o.get('pts', '[]')))
        if o.type != 'MESH': continue
        me = o.data; W = o.matrix_world; me.calc_loop_triangles(); tris += len(me.loop_triangles); uv = uv or bool(me.uv_layers)
        for v in me.vertices:
            p = W @ v.co
            for i in range(3): lo[i], hi[i] = min(lo[i], p[i]), max(hi[i], p[i])
        mats |= {s.material.name.split('.')[0] for s in o.material_slots if s.material}
    imgs = [i.name for i in bpy.data.images if i.name not in ('Render Result', 'Viewer Node')]
    return dict(lo=lo, hi=hi, tris=tris, mats=sorted(mats), uv=uv, imgs=imgs, lamps=lamps)


def judge(name, m, pal):
    """규격과 견주어 문제 목록을 낸다"""
    bad, note = [], []
    if name not in PIECES: note.append('규격에 없는 이름')
    if abs(m['lo'][2]) > .05: bad.append(f"바닥이 z=0이 아니다({m['lo'][2]:.2f})")
    for k in m['mats']:
        if k not in pal and not k.startswith('c_'): bad.append(f"이름표에 없는 재질 '{k}'")
    if m['imgs']: bad.append('그림이 들어 있다: ' + ', '.join(m['imgs'][:3]))
    if m['uv']: note.append('UV가 들어 있다(게임은 쓰지 않는다)')
    if name in PIECES:
        p, st = PIECES[name]
        for i, ax in enumerate('xyz'):
            a, b = p['lim'][i]; l, h = m['lo'][i], m['hi'][i]
            if l < a - .06 or h > b + .06: bad.append(f'{ax}가 범위 {a}~{b}를 벗어난다({l:.2f}~{h:.2f})')
            elif ax in p.get('exact', '') and (abs(l - a) > .06 or abs(h - b) > .06): bad.append(f'{ax}가 {a}~{b}에 꼭 닿아야 한다({l:.2f}~{h:.2f})')
            elif (h - l) < (b - a) * p.get('fill', .5): bad.append(f'{ax} 크기가 너무 작다({h - l:.1f}. 범위는 {b - a:g})')  # 단위를 잘못 잡았을 때(미터로 만들었을 때) 걸린다
        if m['tris'] > p['tris']: bad.append(f"삼각형 {m['tris']}개(한도 {p['tris']})")
    return bad, note


def check(paths, install=False):
    pal, files, nbad = palette(), [], 0
    for p in paths:
        if p.endswith('.zip'):  # ChatGPT가 묶어 준 파일(gangho_m1.zip): 빈 폴더에 풀어서 본다
            import zipfile
            d = tempfile.mkdtemp(prefix='gpt_zip_'); z = zipfile.ZipFile(p)
            for n in z.namelist():
                if os.path.basename(n) == n and n.endswith(('.glb', '.py')): z.extract(n, d)
            py = [n for n in os.listdir(d) if n.endswith('.py')]
            if py: print(f'스크립트도 들어 있다: {os.path.join(d, py[0])}  (읽어 본 뒤 gpt.py run으로 돌릴 수 있다)')
            p = d
        files += sorted(os.path.join(p, f) for f in os.listdir(p) if f.endswith('.glb')) if os.path.isdir(p) else [p]
    rows = []
    for f in files:
        name = os.path.splitext(os.path.basename(f))[0]; m = measure(f); bad, note = judge(name, m, pal); nbad += bool(bad)
        rows.append((name, m, bad, note, f))
    print('\n== 검사 ==')
    for name, m, bad, note, f in rows:
        print(f"{name:14s} x {m['lo'][0]:6.1f}~{m['hi'][0]:5.1f}  y {m['lo'][1]:6.1f}~{m['hi'][1]:5.1f}  z {m['lo'][2]:5.1f}~{m['hi'][2]:5.1f}  삼각형 {m['tris']:4d}  등불 {m['lamps']}  {os.path.getsize(f) // 1024:3d}KB  재질 {','.join(m['mats'])}")
        for b in bad: print('    문제: ' + b)
        for n in note: print('    참고: ' + n)
    got = {r[0] for r in rows}; sets = {PIECES[r[0]][1]['id'] for r in rows if r[0] in PIECES}
    miss = [n for n, (p, st) in PIECES.items() if st['id'] in sets and n not in got]
    if miss: print('아직 없는 조각(같은 묶음): ' + ', '.join(miss))
    print(f'== 모형 {len(rows)}개, 문제 있는 것 {nbad}개 ==')
    if install:
        for name, m, bad, note, f in rows:
            if not bad: shutil.copy(f, os.path.join(MODELS, name + '.glb')); print('넣음: assets/hd2d/models/' + name + '.glb')
    return nbad


def run(script, install=False):
    src = open(script, encoding='utf-8').read()
    if K0 in src and K1 in src:  # 틀을 통째로 붙여 온 스크립트: 저장소의 틀로 바꿔 돌린다(틀을 고쳐도 받은 스크립트가 그대로 돈다)
        a = src.index(K0); b = src.index(K1) + len(K1); src = src[:a] + 'from gangho_kit import *' + src[b:]
    tmp = tempfile.mkdtemp(prefix='gpt_run_'); out = os.path.join(tmp, 'out'); shutil.copy(KIT, tmp)
    open(os.path.join(tmp, 'script.py'), 'w', encoding='utf-8').write(src)
    r = subprocess.run([sys.executable, 'script.py'], cwd=tmp, env={**os.environ, 'GANGHO_OUT': out}, capture_output=True, text=True, timeout=600)
    lines = [l for l in (r.stdout + r.stderr).splitlines() if l.startswith('[모형]') or l.startswith('== 끝') or 'Error' in l or 'Traceback' in l or l.startswith('  File')]
    print('\n'.join(lines) or '(찍힌 줄이 없다)')
    if r.returncode: print(f'스크립트가 오류로 끝났다(코드 {r.returncode})\n' + '\n'.join((r.stdout + r.stderr).splitlines()[-12:]))
    if not os.path.isdir(out) or not os.listdir(out): print('만들어진 .glb가 없다'); return 1
    nbad = check([out], install); print('만든 곳: ' + out); return nbad or (1 if r.returncode else 0)


# ── 요청서의 표와 틀을 다시 뽑는다 ──
def fmt(v): return f'{v:g}'
def asc(t): return t.replace('−', '-')  # 음수 부호는 코드에 그대로 옮겨 적을 수 있게 보통 빼기표로


def gen():
    pal, out = palette(), {}
    out['palette'] = '| 재질 이름 | 무엇 |\n|---|---|\n' + '\n'.join(f'| `{k}` | {v[0]} |' for k, v in pal.items())
    out['kit'] = '```python\n' + open(KIT, encoding='utf-8').read().rstrip() + '\n```'
    out['order'] = '| 차례 | 묶음 | 파일 이름 | 모형 |\n|---|---|---|---|\n' + '\n'.join(f"| {i + 1} | **{st['id']}** {st['ko']} | `{st['file']}` | {', '.join('`' + p['name'] + '`' for p in st['pieces'])} |" for i, st in enumerate(SPEC['sets']))
    for st in SPEC['sets']:
        t = [asc(st['intro']), '', '| 모형 | 무엇 | x | y | z | 꼭 닿는 축 | 삼각형 한도 |', '|---|---|---|---|---|---|---|']
        for p in st['pieces']:
            L = p['lim']; t.append(f"| `{p['name']}` | {p['ko']} | {fmt(L[0][0])}~{fmt(L[0][1])} | {fmt(L[1][0])}~{fmt(L[1][1])} | {fmt(L[2][0])}~{fmt(L[2][1])} | {', '.join(p.get('exact', '')) or '없음'} | {p['tris']} |")
        t.append('')
        for p in st['pieces']: t.append(f"- **`{p['name']}` {p['ko']}**: {asc(p['desc'])}")
        out[st['id']] = '\n'.join(t)
    return out


def doc(only_check=False):
    src = open(DOC, encoding='utf-8').read(); new = src
    for key, body in gen().items():
        a, b = f'<!-- gen:{key} -->', f'<!-- /gen:{key} -->'
        if a not in new or b not in new: print('요청서에 자리가 없다: ' + a); return 1
        i = new.index(a) + len(a); j = new.index(b); new = new[:i] + '\n' + body + '\n' + new[j:]
    if only_check:
        if new != src: print('docs/chatgpt-blender.md의 표나 틀이 spec.json·gangho_kit.py와 어긋난다. python3 tools/blender/gpt.py doc 을 돌린다'); return 1
        return 0
    if new != src: open(DOC, 'w', encoding='utf-8').write(new); print('요청서를 고쳐 썼다')
    else: print('요청서는 그대로다')
    return 0


if __name__ == '__main__':
    a = [x for x in sys.argv[1:] if not x.startswith('--')]; inst = '--install' in sys.argv
    if not a: print(__doc__ or open(__file__, encoding='utf-8').read().split('import json')[0]); sys.exit(0)
    if a[0] == 'run': sys.exit(run(a[1], inst))
    if a[0] == 'check': sys.exit(1 if check(a[1:], inst) else 0)
    if a[0] == 'doc': sys.exit(doc('--check' in sys.argv))
    print('모르는 명령: ' + a[0]); sys.exit(2)
