// js/hd2d/build.js의 설명서(SPEC, GRAND, CROP)와 js/tiles.js의 집 소품 크기를 JSON으로 꺼낸다. houses.py가 읽는다
// 쓰는 법: node tools/blender/dump_spec.mjs > /tmp/spec.json
import { readFileSync } from 'fs'; import { fileURLToPath } from 'url'; import { dirname, join } from 'path';
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const B = await import(join(ROOT, 'js', 'hd2d', 'build.js')); const src = readFileSync(join(ROOT, 'js', 'tiles.js'), 'utf8');
const st = {}; for (const n of Object.keys(B.SPEC)) { const m = src.match(new RegExp(' ' + n + ': \\[H, ([^\\]]*)\\]')); st[n] = m[1].split(',').map(Number); }
console.log(JSON.stringify({ SPEC: B.SPEC, GRAND: B.GRAND, CROP: B.CROP, CROPS: B.CROPS, ST: st }));
