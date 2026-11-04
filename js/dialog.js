// 대화창: 말하는 사람의 그림이 크게 뜨고, 글자가 한 자씩 나온다
import { G, IMG, ART, Input, Sound, $, el, esc } from './core.js';
export const WHO = {};
const D = { cur: null };
export const talking = () => !!D.cur;
function faceCanvas(key, size = 228) {
  const im = IMG['faces/' + key]; const c = document.createElement('canvas'); c.width = 38; c.height = 38; c.style.width = size + 'px'; c.style.height = size + 'px';
  if (im) { const x = c.getContext('2d'); x.imageSmoothingEnabled = false; x.drawImage(im, 0, 0); }
  return c;
}
function render(c) {
  const d = $('#dialog'); d.innerHTML = '';
  if (c.type === 'narr') {
    const n = el('div', 'narr'); d.appendChild(n); c.txtEl = n; n.onclick = () => click(c);
    d.style.background = 'rgba(0,0,0,.72)'; return;
  }
  d.style.background = '';
  const w = c.who ? (c.who === 'me' ? { name: G.S.name, face: G.S.look, art: 'me' } : (WHO[c.who] || { name: c.who })) : null;
  const expr = c.expr || 'n', art = w && (ART.get(`${w.art || c.who}_${expr}`) || ART.get(`${w.art || c.who}_n`));
  const box = el('div', 'box');
  if (w && art) {
    const pf = el('div', 'pf art'), im = new Image(); im.src = art.src; im.style.height = '520px'; pf.appendChild(im); d.appendChild(pf); box.classList.add('artbox');
  } else if (w && w.face) { const pf = el('div', 'pf'); pf.appendChild(faceCanvas(w.face, 244)); d.appendChild(pf); box.style.paddingLeft = '150px'; }
  else box.classList.add('nopf');
  if (w) box.appendChild(el('div', 'who', esc(w.name)));
  const t = el('div', 'txt'); box.appendChild(t); c.txtEl = t;
  box.appendChild(el('div', 'next', '▼')); box.onclick = () => click(c);
  d.appendChild(box);
}
function click(c) { Input.press('ok'); setTimeout(() => Input.release('ok'), 30); }
const sub = s => s.replaceAll('{나}', G.S ? G.S.name : '').replaceAll('{호}', G.S ? G.S.title : '');
export function say(who, text, expr) { return new Promise(res => { const c = { type: 'say', who, text: sub(text), expr, n: 0, res }; D.cur = c; render(c); }); }
export function narr(text) { return new Promise(res => { const c = { type: 'narr', text: sub(text), n: 0, res }; D.cur = c; render(c); }); }
export function choice(q, opts, who) {
  return new Promise(res => {
    const c = { type: 'choice', who, text: sub(q || ''), n: 0, res, opts, sel: 0 }; D.cur = c; render(c);
    const box = el('div', 'choices'); c.btns = opts.map((o, i) => { const b = el('button', 'btn', esc(sub(o))); b.onclick = () => { c.sel = i; pickIt(c); }; box.appendChild(b); return b; });
    c.btns[0].classList.add('on'); $('#dialog').appendChild(box);
  });
}
function pickIt(c) { Sound.sfx('accept'); D.cur = null; $('#dialog').innerHTML = ''; c.res(c.sel); }
export function tickDialog(dt) {
  const c = D.cur; if (!c) return false;
  Input.tick(dt);
  if (G.auto) {
    if (c.type === 'choice') { c.sel = Math.min(G.autoPick ? G.autoPick(c) : 0, c.opts.length - 1); pickIt(c); return true; }
    D.cur = null; $('#dialog').innerHTML = ''; $('#dialog').style.background = ''; c.res(); return true;
  }
  const len = c.text.length;
  if (c.n < len) {
    c.n = Math.min(len, c.n + dt * 42);
    const shown = c.text.slice(0, Math.ceil(c.n));
    if (c.txtEl) c.txtEl.textContent = shown;
    if (Math.ceil(c.n) % 4 === 0) Sound.sfx('text', .22);
    if (Input.take('ok')) { c.n = len; c.txtEl.textContent = c.text; }
    return true;
  }
  if (c.type === 'choice') {
    if (Input.take('down')) { c.sel = (c.sel + 1) % c.opts.length; hl(c); }
    if (Input.take('up')) { c.sel = (c.sel + c.opts.length - 1) % c.opts.length; hl(c); }
    if (Input.take('ok')) pickIt(c);
    return true;
  }
  if (Input.take('ok')) { Sound.sfx('tick', .5); D.cur = null; $('#dialog').innerHTML = ''; $('#dialog').style.background = ''; c.res(); }
  return true;
}
function hl(c) { Sound.sfx('tick'); c.btns.forEach((b, i) => b.classList.toggle('on', i === c.sel)); }
