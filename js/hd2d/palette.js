// 블렌더 조각의 재질 이름 → 무늬. 조각(assets/hd2d/models/rw_*, fn_* …)에는 무늬도 UV도 없고 재질 이름만 있다.
// 이름은 tools/blender/gangho_kit.py의 PALETTE와 같아야 한다(tools/check.sh가 견준다). 요청서: docs/chatgpt-blender.md
// 여기에 없는 이름(종이, 쇠, 천 따위)은 조각에 든 민무늬 빛깔 그대로 그린다. 무늬 그림은 assets/hd2d/preview/<이름>.webp(tools/wall_in.py)
// lie: 옆면에서 무늬를 눕힌다(들보처럼 나뭇결이 가로로 흐르는 것)
export const PAL = {
  wl_field: { t: 'pm_plaster' }, wl_base: { t: 'pm_base_rough' }, wl_beam: { t: 'pm_wood_dark', lie: 1 }, wl_post: { t: 'pm_wood_dark' }, wl_roof: { t: 'r_dark' },
  wood_dark: { t: 'pm_wood_dark' }, wood_red: { t: 'pm_wood_red' }, wood_pine: { t: 'pm_wood_pine' }, wood_black: { t: 'pm_wood_black' }, plank: { t: 'pm_plank' },
  stone: { t: 'pm_stone' }, stone_rough: { t: 'pm_base_rough' }, stone_dark: { t: 'pm_stone_dark' }, brick: { t: 'pm_brick' },
  plaster: { t: 'pm_plaster' }, plaster_white: { t: 'pm_plaster_white' }, earth: { t: 'pm_earth' }, tile: { t: 'r_dark' }, thatch: { t: 'r_thatch' }, bark: { t: 'pm_bark' },
};
// 방 벽의 종류: wl_* 재질에 입힐 무늬. 방마다 하나를 고른다(js/hd2d/rooms.js wallKind). 요청서의 WL1·WL2·WL3이 오면 그림만 바뀐다
export const WALLS = {
  plaster: { wl_field: 'pm_plaster', wl_base: 'pm_base_rough', wl_beam: 'pm_wood_dark', wl_post: 'pm_wood_dark', wl_roof: 'r_dark' },        // 회벽: 객잔, 가게, 책방, 약방, 민가, 장로실
  hall: { wl_field: 'pm_plaster_white', wl_base: 'pm_stone', wl_beam: 'pm_wood_red', wl_post: 'pm_wood_red', wl_roof: 'r_dark' },            // 전각: 본전, 서고, 사당, 관아
  plank: { wl_field: 'pm_wallplank', wl_base: 'pm_wood_dark', wl_beam: 'pm_wood_dark', wl_post: 'pm_wood_dark', wl_roof: 'r_dark' },         // 판자: 숙소, 식당, 도박장
  brick: { wl_field: 'pm_brick', wl_base: 'pm_stone', wl_beam: 'pm_wood_dark', wl_post: 'pm_wood_black', wl_roof: 'r_dark' },                // 벽돌: 대장간, 병기고
  earth: { wl_field: 'pm_earth', wl_base: 'pm_base_rough', wl_beam: 'pm_wood_dark', wl_post: 'pm_wood_pine', wl_roof: 'r_thatch' },          // 흙벽: 초가, 움막
  dark: { wl_field: 'pm_stone_dark', wl_base: 'pm_stone', wl_beam: 'pm_wood_red', wl_post: 'pm_wood_black', wl_roof: 'r_dark' },             // 짙은 돌: 사파·마교의 방, 밀실
};
export const PALTEX = [...new Set([...Object.values(PAL).map(p => p.t), ...Object.values(WALLS).flatMap(w => Object.values(w))])];  // 미리 읽어 둘 그림
