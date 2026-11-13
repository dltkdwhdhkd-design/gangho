#!/bin/bash
# 블렌더가 내보낸 .glb를 줄인다(꼭짓점 합치기 + meshopt 압축). 게임은 js/lib/three/addons/meshopt_decoder.module.js로 푼다.
# 준비: npm i -g @gltf-transform/cli (또는 GT=경로/gltf-transform)
GT=${GT:-gltf-transform}; cd "$(dirname "$0")/../../assets/hd2d/models" || exit 1
for f in ${@:-*.glb}; do f=${f%.glb}.glb; $GT weld "$f" /tmp/_w.glb >/dev/null && $GT meshopt /tmp/_w.glb "$f" --level medium >/dev/null && echo "$f $(stat -c %s "$f")"; done
