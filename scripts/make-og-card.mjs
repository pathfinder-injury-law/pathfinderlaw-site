// Draws the link-preview picture (public/images/open-graph-card.jpg, 1000 x 522): the faded home
// page hiker photo (AI-made, see CREDITS.txt), the official horizontal logo, and the words
// "VIRGINIA WORKERS' COMP LAWYER" in Figtree Bold, the site's own free font (SIL Open Font License).
// Nexa, the Brand Book font, appears only inside the trademarked logo, never as set text (Bryn, Nov 16, 2026).
//
//   node scripts/make-og-card.mjs
// Needs Google Chrome installed (it takes the picture headless). Commit the new JPG.

import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import sharp from 'sharp';

const root = (p) => fileURLToPath(new URL(`../${p}`, import.meta.url));
const url = (p) => pathToFileURL(root(p)).href;
const OUT = root('public/images/open-graph-card.jpg');
const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const html = `<!doctype html><meta charset="utf-8"><style>
@font-face { font-family: Figtree; src: url("${url('node_modules/@fontsource-variable/figtree/files/figtree-latin-wght-normal.woff2')}") format("woff2"); font-weight: 100 900; }
html, body { margin: 0; width: 1000px; height: 522px; overflow: hidden; }
body { position: relative; background: #e9efdf; }
.photo { position: absolute; inset: 0; background: url("${url('public/images/photos/hero-over-shoulder-desktop.webp')}") 70% 40% / cover no-repeat; filter: grayscale(1); }
.wash { position: absolute; inset: 0; background: rgba(226, 233, 220, 0.86); }
.logo { position: absolute; left: 50%; top: 78px; width: 600px; transform: translateX(-50%); }
h1 { position: absolute; left: 0; right: 0; top: 290px; margin: 0; text-align: center; font: 700 63px/1.12 Figtree, sans-serif; letter-spacing: 0.01em; color: #294634; }
</style>
<div class="photo"></div><div class="wash"></div>
<img class="logo" src="${url('public/images/brand/logo-horizontal.png')}" alt="">
<h1>VIRGINIA WORKERS’<br>COMP LAWYER</h1>`;

const dir = mkdtempSync(join(tmpdir(), 'og-card-'));
try {
  const page = join(dir, 'card.html');
  const png = join(dir, 'card.png');
  writeFileSync(page, html);
  execFileSync(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1', '--allow-file-access-from-files', '--virtual-time-budget=3000', `--screenshot=${png}`, '--window-size=1000,522', pathToFileURL(page).href], { stdio: 'ignore' });
  const info = await sharp(png).jpeg({ quality: 86, mozjpeg: true }).toFile(OUT);
  console.log(`${OUT}: ${info.width} x ${info.height}, ${info.size} bytes`);
} finally {
  rmSync(dir, { recursive: true, force: true });
}
