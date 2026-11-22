"""Group small startup textures by stable path. Run after changing these images, or use --check."""
import argparse
import base64
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / 'assets'
COUNT = 24
MAX_BYTES = 12 * 1024


def startup_files():
    for folder in ['hd', 'hd2d/preview', 'hd2d/field']:
        yield from (ASSETS / folder).rglob('*.webp')
    for folder in ['world', 'tiles', 'chars', 'faces', 'mon', 'boss', 'fx', 'wpn', 'items', 'ani']:
        for image in (ASSETS / folder).glob('*.png'):
            if not (ASSETS / 'hd' / folder / (image.stem + '.webp')).exists():
                yield image


def build(check=False):
    groups = [{} for _ in range(COUNT)]
    for image in sorted(startup_files()):
        if image.stat().st_size > MAX_BYTES:
            continue
        path = image.relative_to(ROOT).as_posix()
        bucket = int.from_bytes(hashlib.sha256(path.encode()).digest()[:4], 'big') % COUNT
        mime = 'image/' + image.suffix[1:]
        groups[bucket][path] = 'data:' + mime + ';base64,' + base64.b64encode(image.read_bytes()).decode()
    folder = ASSETS / 'hd' / 'startup'
    if not check:
        folder.mkdir(parents=True, exist_ok=True)
    for i, group in enumerate(groups):
        target = folder / f'{i:02}.json'
        data = (json.dumps(group, sort_keys=True, separators=(',', ':')) + '\n').encode()
        if check:
            if not target.exists() or target.read_bytes().replace(b'\r\n', b'\n') != data:
                raise SystemExit(f'Rebuild startup textures with python tools/build_startup_art.py ({target.name})')
        else:
            target.write_bytes(data)
    print(sum(map(len, groups)), 'textures in', len(groups), 'startup files')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true')
    build(parser.parse_args().check)
