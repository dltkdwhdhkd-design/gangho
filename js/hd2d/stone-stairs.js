// 계단 칸은 북쪽이 높고, 남쪽 변이 모형의 원점이다.
export const STONE_PARTS = ['st_stair', 'st_cheek', 'st_wall', 'st_cap', 'st_rail', 'st_railpost'];

export function stoneStairs(map, tile, level, place) {
  const steps = new Set();
  const wings = new Set();
  const posts = new Set();
  const height = (x, y) => map.hgt[y]?.[x];
  const stone = (x, y) => height(x, y) !== undefined && ![2, 4].includes(map.g[y][x]);
  const id = (x, y) => x + ',' + y;
  for (const key of Object.keys(map.stair || {})) {
    const [x, y] = key.split(',').map(Number);
    // 청하진은 부두 전체를 나무 칸으로 칠했다. 둑의 입구 한 단에만 돌을 쓴다.
    const quay = map.id === 'cheongha' && map.g[y]?.[x] === 4;
    if ((stone(x, y) || quay) && height(x, y) - height(x, y + 1) === 1) steps.add(key);
  }
  for (const key of steps) {
    const [x, y] = key.split(',').map(Number);
    const front = (y + 1) * tile, low = height(x, y + 1), high = low + 1;
    place('st_stair', (x + .5) * tile, front, low * level);
    for (const side of [-1, 1]) {
      if (steps.has(id(x + side, y))) continue;
      place('st_cheek', (x + (side === 1 ? 1 : 0)) * tile, front, low * level, -side);
      // 입구 좌우 세 칸 안의 연속된 단차만 꾸민다. 평지와 계단 입구는 열린다.
      for (let i = 1; i <= 3; i++) {
        const cx = x + side * i, k = id(cx, y);
        const drop = high - height(cx, y + 1);
        if (!stone(cx, y) || map.stair[k] || height(cx, y) !== high || !(drop > 0 && drop <= 4)) break;
        if (wings.has(k)) continue;
        wings.add(k);
        const mid = (cx + .5) * tile;
        for (let n = 0; n < drop; n++) place('st_wall', mid, front, (high - drop + n) * level);
        place('st_cap', mid, front, high * level);
        place('st_rail', mid, front, high * level + 2);
        for (const px of [cx, cx + 1]) {
          const p = px + ',' + y + ',' + high;
          if (posts.has(p)) continue;
          posts.add(p);
          place('st_railpost', px * tile, front, high * level + 2);
        }
      }
    }
  }
  return steps;
}
