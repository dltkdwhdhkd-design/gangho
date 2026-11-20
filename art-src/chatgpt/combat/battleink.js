// Local coordinates: the cutting edge travels toward +x. BattleFX supplies the
// arena plane, elevation, school palette and clock for both canvas renderers.
const PI = Math.PI, TAU = PI * 2;
const family = {
  plum: 'blossom', jaha: 'blossom', lotus: 'blossom', lightning: 'bolt',
  blade: 'cleaver', beast: 'claw', gold: 'palm', quake: 'stone', dust: 'stone',
  glyph: 'seal', star: 'seal', ice: 'facet', mirror: 'facet', poison: 'barb',
  wind: 'flow', water: 'flow', cloud: 'flow', spear: 'coil', taiji: 'coil',
  fire: 'ember', blood: 'ember', sun: 'ray', moon: 'edge', steel: 'edge',
};

function polygon(c, color, pts) {
  c.fillStyle = color;
  c.beginPath();
  c.moveTo(pts[0], pts[1]);
  for (let i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]);
  c.closePath();
  c.fill();
}

function line(c, color, width, pts) {
  c.strokeStyle = color;
  c.lineWidth = width;
  c.beginPath();
  c.moveTo(pts[0], pts[1]);
  for (let i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]);
  c.stroke();
}

function sliver(c, color, x, y, length, width, bend = 0) {
  polygon(c, color, [x, y, x + length * .64, y + bend - width, x + length, y + bend,
    x + length * .57, y + bend + width * .55]);
}

// A leading mark doubles as the head of a travelling skill. Each is drawn in
// silhouette first, with a local reflected edge or facet from the school palette.
export function drawNib(c, st, colors, phase = 0) {
  const [body, light, ink] = colors;
  const pulse = Math.sin(phase);
  switch (family[st]) {
    case 'blossom':
      for (let i = 0; i < 3; i++) {
        const a = phase + i * TAU / 3, x = -6 + i * 3, y = Math.sin(a) * 3;
        polygon(c, ink, [x - 3, y - 1, x, y - 2, x + 3, y, x, y + 2, x - 2, y + 2]);
        sliver(c, body, x - 2, y, 4, 1.6, -1);
      }
      sliver(c, light, 0, 0, 6, 1.5, -.6);
      break;
    case 'bolt':
      polygon(c, ink, [-10, 2, -2, -4, 0, -1, 7, -3, 0, 3, -2, 0]);
      line(c, body, 1.8, [-8, 1, -2, -3, -1, 0, 7, -3]);
      line(c, light, 1, [0, 0, 7, -3]);
      break;
    case 'facet':
      polygon(c, ink, [-7, 1, -2, -4, 8, -1, 0, 4]);
      polygon(c, body, [-6, 1, -1, -3, 7, -1, 0, 1]);
      sliver(c, light, -1, -2, 8, 1, 1);
      break;
    case 'barb':
      polygon(c, ink, [-9, -3, -3, -1, -4, -3, 8, 0, -4, 2, -3, 0, -9, 3]);
      sliver(c, body, -7, 0, 15, 1.5);
      c.fillStyle = light; c.fillRect(1, -1, 3, 1);
      break;
    case 'palm': case 'seal':
      c.save(); c.rotate(pulse * .3);
      polygon(c, ink, [-6, 0, -1, -4, 5, -2, 6, 1, 0, 4]);
      line(c, body, 1.7, [-5, 0, 0, -3, 4, -1, 4, 1, 0, 3]);
      line(c, light, 1, [-1, 1, 1, -1, 3, 0]);
      c.restore(); break;
    case 'stone': case 'cleaver':
      polygon(c, ink, [-8, 2, -2, -4, 4, -3, 7, -1, 2, 3, -4, 4]);
      polygon(c, body, [-5, 1, -2, -3, 4, -2, 6, -1, 1, 0]);
      sliver(c, light, -2, -2, 7, 1); break;
    case 'ember':
      polygon(c, ink, [-11, -2, -3, -1, -6, -5, 3, -3, 7, 0, 1, 3, -8, 4, -4, 1]);
      polygon(c, body, [-8, 2, -2, 0, -4, -3, 3, -2, 6, 0, 0, 2]);
      sliver(c, light, -2, 1, 8, 1.6, -1); break;
    case 'flow': case 'coil': case 'edge': {
      const bend = st === 'moon' ? 7 : 4;
      polygon(c, ink, [-8, -bend, 2, -3, 7, 0, 2, 3, -7, bend, -1, 1, 1, 0, -1, -1]);
      line(c, body, 1.7, [-7, -bend, 2, -2, 6, 0, 1, 2, -5, bend]);
      line(c, light, 1, [1, -2, 6, 0, 2, 1]); break; }
    default:
      sliver(c, ink, -10, 1, 18, 2.8, -1);
      sliver(c, body, -8, 0, 16, 1.9);
      sliver(c, light, -2, -1, 10, 1, 1);
  }
}

// One tapered polygon per pass. Each station carries a normal so a dry seam
// and a polished edge can follow the same moving curve without halo blending.
function ribbon(c, points, color, width, offset = 0, from = 0, to = points.length - 1) {
  if (to <= from) return;
  c.fillStyle = color;
  c.beginPath();
  for (let side = 1; side >= -1; side -= 2) {
    for (let j = from; j <= to; j++) {
      const i = side === 1 ? j : to - (j - from), p = points[i];
      const taper = Math.sin(PI * (i - from) / (to - from));
      const w = offset + side * width * Math.sqrt(Math.max(0, taper));
      const x = p.x + p.nx * w, y = p.y + p.ny * w;
      if (side === 1 && i === from) c.moveTo(x, y); else c.lineTo(x, y);
    }
  }
  c.closePath(); c.fill();
}

function stamp(c, p, st, palette, size, angle, phase) {
  c.save();
  c.translate(p.x, p.y); c.rotate(angle); c.scale(size, size);
  drawNib(c, st, palette, phase);
  c.restore();
}

function spine(p, start, end, sweep, radius) {
  const points = [];
  const angular = p.shape !== 'line';
  const steps = Math.max(8, Math.min(42, Math.ceil((end - start) * (angular ? Math.abs(sweep) * radius : p.len) / 2.4)));
  for (let j = 0; j <= steps; j++) {
    const t = start + (end - start) * j / steps;
    let x, y;
    if (angular) {
      const a = (t - .5) * sweep;
      const r = radius * (p.shape === 'circle' ? 1 : .75 + .25 * Math.sin(t * PI));
      x = Math.cos(a) * r; y = Math.sin(a) * r;
    } else {
      x = p.start + (p.len - p.start) * t;
      y = 0;
    }
    // Fixed to the path: a given fork, bristle or facet never shuffles per frame.
    let tooth = 0;
    if (p.family === 'bolt' || p.family === 'stone' || p.family === 'blossom') {
      const freq = p.family === 'bolt' ? 7 : 4;
      tooth = (1 - 4 * Math.abs((t * freq + .25) % 1 - .5)) * Math.sin(PI * t) * (p.family === 'bolt' ? 3.1 : 1.6);
    }
    if (!angular && (p.family === 'flow' || p.family === 'coil')) tooth = Math.sin(t * TAU * 1.5) * Math.sin(PI * t) * 1.8;
    const a = angular ? (t - .5) * sweep : PI / 2;
    points.push({ x: x + Math.cos(a) * tooth, y: y + Math.sin(a) * tooth });
  }
  for (let i = 0; i <= steps; i++) {
    const a = points[Math.max(0, i - 1)], b = points[Math.min(steps, i + 1)];
    const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy) || 1;
    points[i].nx = -dy / len; points[i].ny = dx / len;
  }
  return points;
}

function paintStroke(c, p, points, width, u, ornaments) {
  const [body, light, ink] = p.colors, f = p.family, n = points.length - 1;
  const broad = f === 'cleaver' || f === 'stone' || f === 'palm' ? 1.38 : 1;
  const w = width * broad;
  ribbon(c, points, ink, w + .65);
  ribbon(c, points, body, w * .70, -.22 * w);
  ribbon(c, points, light, Math.max(.57, .29 * w), -.62 * w, Math.floor(n * .51));
  if (!ornaments) return;
  const a = Math.floor(n * .15), b = Math.ceil(n * .76);
  switch (f) {
    case 'coil': case 'flow': case 'claw':
      ribbon(c, points, f === 'coil' ? ink : body, .78, -w - 2.4, a, b);
      ribbon(c, points, f === 'claw' ? body : light, .67, w + 2, 0, Math.ceil(n * .49)); break;
    case 'barb': case 'ray':
      ribbon(c, points, body, .75, -w - 2.5, a, b);
      ribbon(c, points, ink, .86, w + 2.2, Math.floor(n * .34), n); break;
    case 'bolt': case 'blossom': case 'ember': {
      for (const i of [Math.floor(n * .31), Math.floor(n * .66)]) {
        const v = points[i], sign = i === Math.floor(n * .31) ? 1 : -1;
        const x = v.x + v.nx * sign * (w + 3) - v.ny * -2;
        const y = v.y + v.ny * sign * (w + 3) + v.nx * -2;
        line(c, f === 'blossom' ? ink : body, 1.2, [v.x, v.y, x, y, x + v.ny * 3, y - v.nx * 3]);
        if (f === 'blossom') {
          c.fillStyle = body; c.fillRect(x - 1, y - 1, 2.8, 2.8);
          c.fillStyle = light; c.fillRect(x, y - 1, 1.4, 1.2);
        }
      }
      break; }
    case 'stone': case 'cleaver':
      ribbon(c, points, ink, 1, w + 2.2, a, Math.ceil(n * .48)); break;
    case 'facet': case 'seal': case 'palm': {
      const v = points[Math.floor(n * .67)];
      stamp(c, { x: v.x + v.nx * (w + 3), y: v.y + v.ny * (w + 3) }, p.st, p.colors,
        .65, Math.atan2(-v.nx, v.ny) - .45, u * 3);
      break; }
  }
}

export function drawStroke(c, p, u) {
  c.translate(p.x, p.y); c.rotate(p.ang); c.scale(1, p.flip ? -1 : 1);
  const head = Math.min(1, .12 + u * 3.9);
  const tail = Math.max(0, (u - .26) / .8);
  const width = p.w * (1 - .46 * u);
  if (p.shape === 'circle') {
    const r = p.r * (.56 + .44 * (1 - (1 - head) ** 2));
    // Three broken pressure fronts keep the caster and the area inside legible.
    for (let i = 0; i < 3; i++) {
      c.save(); c.rotate(i * TAU / 3 + u * .48);
      paintStroke(c, p, spine(p, tail, head, i === 0 ? 1.92 : 1.49, r), width * (i === 0 ? 1 : .73), u, i === 0);
      c.restore();
    }
  } else {
    paintStroke(c, p, spine(p, tail, head, p.sweep, p.r), width, u, true);
  }
}

export function inkFamily(st) { return family[st] || 'edge'; }

export function drawWake(c, p, u) {
  c.translate(p.x, p.y); c.rotate(p.ang);
  const [body, light, ink] = p.colors;
  const size = (1 - u * .55) * p.size;
  c.scale(size, size);
  if (p.family === 'blossom' || p.family === 'facet' || p.family === 'stone') {
    const sign = p.side;
    c.translate(-2 - u * 3, sign * (1 + u * 3)); c.rotate(sign * (.4 + u * .7));
    sliver(c, ink, -4, 0, 7, 2); sliver(c, body, -3, -1, 5, 1.1);
    return;
  }
  sliver(c, ink, -6, 0, 10, 1.7, p.side);
  sliver(c, body, -5, 0, 8, .95, p.side);
  if (p.family === 'bolt' || p.family === 'coil') line(c, light, 1, [-4, -2, -1, -3, 1, -1]);
}

// A chipped edge at the entry point with fragments kicked back towards the
// attacker. The legacy spark and the target's hit flash already supply the core.
export function drawContact(c, p, u) {
  c.translate(p.x, p.y); c.rotate(p.ang);
  const [body, light, ink] = p.colors;
  const k = p.big ? 1.28 : 1;
  c.scale(k, k);
  for (let i = 0; i < (p.big ? 4 : 3); i++) {
    const a = [2.36, -2.57, 3.04, -1.87][i], d = (1 + u * (i === 0 ? 8 : 5));
    c.save(); c.rotate(a); c.translate(d, 0);
    const l = (i === 0 ? 7 : 4.5) * (1 - .52 * u);
    sliver(c, ink, 0, .4, l, 1.6); sliver(c, i === 0 && u < .4 ? light : body, .2, -.2, l, 1);
    c.restore();
  }
}
