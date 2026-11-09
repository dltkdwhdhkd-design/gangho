// 물건 아이콘을 작은 그림 주소로 만들어 둔다
import { IMG } from './core.js';
import { DB, ACCS } from './items.js';
import { WEAPONS } from './data.js';
const cache = {};
function rectUrl(key, x, y, w, h) {
  const k = [key, x, y, w, h].join(); if (cache[k]) return cache[k];
  const im = IMG[key]; if (!im) return '';
  // 새로 그린 아이콘(hd)은 32칸 그대로 쓴다. 16칸으로 줄이면 화면에서 다시 늘어나 뭉개진다
  const S = 16 * (im.hd || 1), c = document.createElement('canvas'); c.width = S; c.height = S; const q = c.getContext('2d'); q.imageSmoothingEnabled = false;
  q.drawImage(im, x, y, w, h, Math.floor((S - Math.min(w, S)) / 2), Math.floor((S - Math.min(h, S)) / 2), Math.min(w, S), Math.min(h, S));
  return cache[k] = c.toDataURL();
}
export function iconUrl(id) {
  const hd = IMG['icon/' + id]; if (hd) return rectUrl('icon/' + id, 0, 0, hd.width, hd.height);
  if (WEAPONS[id]) { const n = 'wpn/' + WEAPONS[id].spr + '_icon', im = IMG[n]; return im ? rectUrl(n, 0, 0, Math.min(16, im.width), Math.min(16, im.height)) : ''; }
  if (ACCS[id]) return rectUrl('items/Hear', 0, 0, 16, 16);
  const d = DB[id]; if (!d) return '';
  if (Array.isArray(d.icon)) return rectUrl(...d.icon);
  const im = IMG['items/' + d.icon]; return im ? rectUrl('items/' + d.icon, 0, 0, Math.min(16, im.width), Math.min(16, im.height)) : '';
}
export const icon = id => { const u = iconUrl(id); return u ? `<img class="ic" src="${u}" alt="">` : ''; };
export const nameOf = id => WEAPONS[id] ? WEAPONS[id].name : ACCS[id] ? ACCS[id].name : DB[id] ? DB[id].name : id;
export const descOf = id => WEAPONS[id] ? `[${WEAPONS[id].type}] 공격 ${WEAPONS[id].atk}. ${WEAPONS[id].desc}` : ACCS[id] ? `장신구. ${ACCS[id].desc}` : DB[id] ? `${DB[id].kind}. ${DB[id].desc}` : '';
