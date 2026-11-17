// Draws the map contour lines drawn for this site. Two files, both made here, so we own them:
//  - public/images/contours.svg: faint lines behind home page sections (the "map" end of the
//    wilderness-to-map motif). Used as a mask, so the line color comes from the page.
//  - public/images/contour-texture.svg: the denser topographic texture behind the footer, the
//    contact band, and other dark sections on every page (Nov 16, 2026; replaced an old-site file
//    with no known source).
//
//   node scripts/make-contours.mjs
// Writes both files. Commit them. Same seed, same lines, every run.

import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

function draw({ file, W, H, C = 16, seed, nWaves = 6, nHills = 5, waveFreq = [1.6, 0.4], hillR = [200, 260], hillH = [0.8, 1], levels = [-3.2, 4.4, 0.26], stroke = '#000', width = 1.4, minLen = 6, knockout = false, eps = 1.1 }) {
const OUT = fileURLToPath(new URL(`../public/images/${file}`, import.meta.url));

// A smooth height field: a few broad waves plus some hills.
let s = seed;
const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
const waves = Array.from({ length: nWaves }, () => ({ fx: (rnd() * waveFreq[0] + waveFreq[1]) / W, fy: (rnd() * waveFreq[0] + waveFreq[1]) / H, p: rnd() * 6.28, a: rnd() * 0.6 + 0.4, r: rnd() * 6.28 }));
const hills = Array.from({ length: nHills }, () => ({ x: rnd() * W, y: rnd() * H, r: hillR[0] + rnd() * hillR[1], h: hillH[0] + rnd() * hillH[1] }));
function field(x, y) {
  let v = 0;
  for (const w of waves) {
    const u = x * Math.cos(w.r) - y * Math.sin(w.r), t = x * Math.sin(w.r) + y * Math.cos(w.r);
    v += w.a * Math.sin(u * w.fx * 6.28 + w.p) * Math.cos(t * w.fy * 6.28);
  }
  for (const h of hills) v += h.h * 2.2 * Math.exp(-(((x - h.x) ** 2 + (y - h.y) ** 2) / (h.r * h.r)));
  return v;
}
const nx = Math.ceil(W / C) + 1, ny = Math.ceil(H / C) + 1, g = [];
for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) g.push(field(i * C, j * C));
const at = (i, j) => g[j * nx + i];

// Marching squares for one level, then join the little segments into long lines.
function level(L) {
  const segs = [];
  const key = (p) => `${p[0].toFixed(2)},${p[1].toFixed(2)}`;
  for (let j = 0; j < ny - 1; j++) for (let i = 0; i < nx - 1; i++) {
    const a = at(i, j), b = at(i + 1, j), c = at(i + 1, j + 1), d = at(i, j + 1);
    const X = i * C, Y = j * C, pts = [];
    const lerp = (p, q, x0, y0, x1, y1) => { const t = (L - p) / (q - p); return [x0 + (x1 - x0) * t, y0 + (y1 - y0) * t]; };
    if ((a < L) !== (b < L)) pts.push(lerp(a, b, X, Y, X + C, Y));
    if ((b < L) !== (c < L)) pts.push(lerp(b, c, X + C, Y, X + C, Y + C));
    if ((c < L) !== (d < L)) pts.push(lerp(c, d, X + C, Y + C, X, Y + C));
    if ((d < L) !== (a < L)) pts.push(lerp(d, a, X, Y + C, X, Y));
    if (pts.length >= 2) segs.push([pts[0], pts[1]]);
    if (pts.length === 4) segs.push([pts[2], pts[3]]);
  }
  const ends = new Map();
  segs.forEach((sg, n) => sg.forEach((p) => { const k = key(p); (ends.get(k) || ends.set(k, []).get(k)).push(n); }));
  const used = new Set(), lines = [];
  for (let n = 0; n < segs.length; n++) {
    if (used.has(n)) continue;
    used.add(n);
    const line = [segs[n][0], segs[n][1]];
    for (const dir of [1, -1]) {
      for (;;) {
        const tip = dir === 1 ? line[line.length - 1] : line[0];
        const next = (ends.get(key(tip)) || []).find((m) => !used.has(m));
        if (next === undefined) break;
        used.add(next);
        const [p, q] = segs[next];
        const far = key(p) === key(tip) ? q : p;
        dir === 1 ? line.push(far) : line.unshift(far);
      }
    }
    lines.push(line);
  }
  return lines;
}

// Fewer points: Ramer-Douglas-Peucker.
function rdp(pts, eps) {
  if (pts.length < 3) return pts;
  const [a, b] = [pts[0], pts[pts.length - 1]];
  const dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy) || 1;
  let max = 0, idx = 0;
  for (let i = 1; i < pts.length - 1; i++) {
    const d = len === 1 && !dx && !dy ? Math.hypot(pts[i][0] - a[0], pts[i][1] - a[1]) : Math.abs(dy * pts[i][0] - dx * pts[i][1] + b[0] * a[1] - b[1] * a[0]) / len;
    if (d > max) { max = d; idx = i; }
  }
  return max > eps ? [...rdp(pts.slice(0, idx + 1), eps).slice(0, -1), ...rdp(pts.slice(idx), eps)] : [a, b];
}

const paths = [];
for (let L = levels[0]; L < levels[1]; L += levels[2]) {
  let d = '';
  for (const line of level(L)) {
    if (line.length < minLen) continue; // drop tiny specks
    const p = rdp(line, eps).map(([x, y]) => [Math.round(x), Math.round(y)]);
    d += `M${p[0][0]} ${p[0][1]}` + p.slice(1).map((q, i) => `l${q[0] - p[i][0]} ${q[1] - p[i][1]}`).join('');
  }
  if (d) paths.push(d);
}
const line = `<path fill="none" stroke="${stroke}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round" d="${paths.join('')}"/>`;
// knockout: a white sheet with the lines cut out of it, so the page color shows through the lines
// (the look of the old texture: a faint pale wash with darker map lines).
const svg = knockout
  ? `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice"><mask id="m"><rect width="${W}" height="${H}" fill="#fff"/>${line}</mask><rect width="${W}" height="${H}" fill="#fff" mask="url(#m)"/></svg>\n`
  : `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice">${line}</svg>\n`;
writeFileSync(OUT, svg);
console.log(`${OUT}: ${svg.length} bytes, ${paths.length} levels`);
}

draw({ file: 'contours.svg', W: 1440, H: 1000, seed: 11 });
draw({
  file: 'contour-texture.svg', W: 2560, H: 1600, C: 10, seed: 7, knockout: true, stroke: '#000',
  nWaves: 12, waveFreq: [5, 2], nHills: 220, hillR: [35, 55], hillH: [-0.4, 1.0],
  levels: [-4, 5, 0.42], width: 0.8, minLen: 5, eps: 0.8,
});
