// Makes smaller copies of the two logo files, so phones download a logo close to the size it is
// shown at (the originals are 1703px and 753px wide, shown at about 150 to 420px). Each copy is the
// same artwork scaled down in proportion: no change to colors, shape or proportions (Brand Book).
// The originals stay as they are (the schema logo and old links use them).
//
// Run this only after replacing a logo file:
//   node scripts/make-logo-sizes.mjs
// It writes public/images/brand/sized/<name>-<width>.png. Commit them. (Uses sharp, which comes with Astro.)

import sharp from 'sharp';
import { mkdirSync } from 'node:fs';
import { basename, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const repo = fileURLToPath(new URL('..', import.meta.url));
const OUT_DIR = '/images/brand/sized';

// Widths cover 1x to 3x screens at the sizes the header and footer use.
const LOGOS = {
  '/images/brand/logo-horizontal.png': [320, 480, 640, 860, 1280],
  '/images/brand/logo-vertical.png': [200, 320, 480],
};

mkdirSync(join(repo, 'public', OUT_DIR), { recursive: true });
for (const [src, widths] of Object.entries(LOGOS)) {
  const input = join(repo, 'public', src);
  const meta = await sharp(input).metadata();
  const name = basename(src, extname(src));
  for (const w of widths) {
    if (w >= meta.width) throw new Error(`${src}: ${w} is not smaller than the original (${meta.width})`);
    const url = `${OUT_DIR}/${name}-${w}.png`;
    const info = await sharp(input).resize({ width: w }).png({ compressionLevel: 9, effort: 10 }).toFile(join(repo, 'public', url));
    console.log(url, `${Math.round(info.size / 1024)} KB`);
  }
}
