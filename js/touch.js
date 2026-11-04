// 휴대폰과 태블릿용 화면 버튼
import { G, Input, $, el } from './core.js';
export function initTouch() {
  if (!('ontouchstart' in window) && !(navigator.maxTouchPoints > 0)) return;
  G.touch = true;
  const T = $('#touch'); T.classList.add('on');
  const stick = el('div', 'stick', '<i></i>'), knob = stick.firstChild; T.appendChild(stick);
  let id = null;
  const mv = e => { const r = stick.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2, R = r.width / 2; let x = (e.clientX - cx) / R, y = (e.clientY - cy) / R; const l = Math.hypot(x, y); if (l > 1) { x /= l; y /= l; } if (l < .2) { x = 0; y = 0; } Input.stick = { x, y }; knob.style.transform = `translate(${x * 60}px,${y * 60}px)`; };
  stick.addEventListener('pointerdown', e => { e.preventDefault(); id = e.pointerId; stick.setPointerCapture(id); mv(e); });
  stick.addEventListener('pointermove', e => { if (e.pointerId === id) mv(e); });
  const up = e => { if (e.pointerId === id) { id = null; Input.stick = { x: 0, y: 0 }; knob.style.transform = ''; } };
  stick.addEventListener('pointerup', up); stick.addEventListener('pointercancel', up);
  const btn = (txt, act, x, y, cls = '') => { const b = el('div', 'tb ' + cls, txt); b.style.right = x + 'px'; b.style.bottom = y + 'px'; b.dataset.g = cls.includes('bt') ? 'b' : 'a'; b.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); Input.press(act); }); const u = e => { e.preventDefault(); Input.release(act); }; b.addEventListener('pointerup', u); b.addEventListener('pointercancel', u); b.addEventListener('pointerleave', u); T.appendChild(b); return b; };
  G.touchB = [btn('평타', 'atk', 30, 30, 'bt'), btn('경공', 'dash', 140, 26, 'bt s'), btn('막기', 'guard', 30, 140, 'bt s'), btn('U', 's0', 228, 40, 'bt s'), btn('I', 's1', 228, 124, 'bt s'), btn('O', 's2', 140, 110, 'bt s'), btn('P', 's3', 118, 194, 'bt s'), btn('약', 'potion', 30, 226, 'bt s')];
  G.touchF = [btn('대화', 'ok', 40, 60)];
  setInterval(() => { const b = G.scene === 'battle'; G.touchB.forEach(e => e.style.display = b ? 'flex' : 'none'); G.touchF.forEach(e => e.style.display = b ? 'none' : 'flex'); T.style.display = (G.scene === 'battle' || G.scene === 'field') && !G.menuOpen ? 'block' : 'none'; }, 200);
}
