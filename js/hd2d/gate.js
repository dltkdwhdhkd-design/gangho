// Three open bays. Roof strips rise at the corners and meet at a raised tiled ridge.
export function mountainGate(T, stamp, x, y, hs, zs, elevation, texture) {
  const group = new T.Group();
  group.position.set(x, elevation, y * zs);
  group.scale.set(1, hs, zs);
  group.userData = { s: stamp, ms: [] };
  const palette = {
    stone: [0xb2aca0, 'slab'], timber: [0x953f30, 'cedar'],
    trim: [0xbb965f], roof: [0x65746e, 'roof'], ridge: [0x989a83], green: [0x465d55],
  };
  const paints = {};
  for (const [name, [color, map]] of Object.entries(palette)) {
    const m = new T.MeshLambertMaterial({ color, map: map ? texture('field_' + map) : null, side: T.DoubleSide });
    const f = m.clone(); f.transparent = true; f.opacity = .29; f.depthWrite = false;
    paints[name] = { m, f };
  }
  function part(geometry, paint, px, py, pz) {
    const M = paints[paint], mesh = new T.Mesh(geometry, M.m);
    mesh.position.set(px, py, pz); mesh.castShadow = mesh.receiveShadow = true;
    mesh.userData = { M, owner: group }; group.add(mesh); group.userData.ms.push(mesh);
    return mesh;
  }
  function beam(px, py, pz, width, height, depth, paint) {
    return part(new T.BoxGeometry(width, height, depth), paint, px, py, pz);
  }
  for (const px of [-27, -14, 14, 27]) {
    const height = Math.abs(px) === 14 ? 29 : 22;
    for (const pz of [-3, 3]) {
      beam(px, 1.2, pz, 4, 2.4, 4, 'stone');
      part(new T.CylinderGeometry(.96, 1.3, height, 8), 'timber', px, height / 2 + 2, pz);
      beam(px, height - .5, pz, 4.4, 1.1, 3, 'green');
      beam(px, height + 1.2, pz, 6.1, 1.1, 3.4, 'trim');
    }
  }
  function roof(center, half, h, depth) {
    beam(center, h, 0, half * 1.95, 1.6, 8, 'timber');
    beam(center, h + 1.2, 0, half * 1.92, .9, 8.5, 'trim');
    for (const side of [-1, 1]) {
      const vertices = [], uv = [], indices = [];
      for (let i = 0; i <= 12; i++) {
        const t = i / 6 - 1, corner = Math.pow(Math.abs(t), 3.4);
        for (let j = 0; j <= 4; j++) {
          const u = j / 4;
          vertices.push(center + t * half, h + 2 + 4.2 * (1 - u) ** 1.65 + 2.7 * corner * u, side * depth * u);
          uv.push(i / 3, u);
          if (i && j) { const a = i * 5 + j; indices.push(a - 6, a - 1, a, a - 6, a, a - 5); }
        }
      }
      const geo = new T.BufferGeometry();
      geo.setAttribute('position', new T.Float32BufferAttribute(vertices, 3));
      geo.setAttribute('uv', new T.Float32BufferAttribute(uv, 2)); geo.setIndex(indices); geo.computeVertexNormals();
      part(geo, 'roof', 0, 0, 0);
    }
    beam(center, h + 6.4, 0, half * 2, 1.25, 1.25, 'ridge');
  }
  roof(-21, 9.5, 22, 6); roof(21, 9.5, 22, 6); roof(0, 19, 30, 8);
  return group;
}
