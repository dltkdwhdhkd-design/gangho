// 새 화면으로 그리는 방. 벽은 블렌더 모형(tools/blender/rooms.py → rm_<방>.glb), 바닥과 가구는 2D 그대로 깔고 세운다.
// 모형의 북쪽 벽 앞면은 모형 좌표 y=0이라, 방 0번 줄(2D가 벽을 칠한 줄) 아래 끝(평면도 y=16)에 오도록 16만큼 남쪽으로 놓는다
export const ROOMS = new Set(['inn', 'inn2', 'clinic', 'shop', 'shop2', 'library', 'smith', 'well', 'hall_in', 'hall2', 'bokun', 'sutra', 'shrine', 'cliffcave']);
export function roomModels(m) { if (!m.room || !ROOMS.has(m.id)) return; if (!m.models) m.models = [{ key: 'rm_' + m.id, y: 16 }]; }
