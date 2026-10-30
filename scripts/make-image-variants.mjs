// Makes smaller copies of the big photos in modern formats (AVIF and WebP), so phones and
// small screens download only the size they need. The originals stay exactly as they are and
// remain the fallback for older browsers. Pages pick the copies through src/components/Photo.astro.
//
// Run this only after adding or replacing one of the photos listed below:
//   node scripts/make-image-variants.mjs
// It writes public/images/photos/sized/<name>-<width>.<avif|webp> and the list
// src/data/imageVariants.json. Commit both. (Uses sharp, which comes with Astro.)
//
// To give another photo the same treatment, add it to PHOTOS with the widths it needs
// (never wider than the original), run the script, then use <Photo> for it on the page.

import sharp from 'sharp';
import { mkdirSync, writeFileSync } from 'node:fs';
import { basename, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const repo = fileURLToPath(new URL('..', import.meta.url));
const OUT_DIR = '/images/photos/sized';

const PHOTOS = {
  '/images/photos/hero-over-shoulder-desktop.webp': [1024, 1376],
  '/images/photos/hero-over-shoulder-phone.webp': [480, 776],
  '/images/photos/tile-a.jpg': [480, 800, 1200, 1400],
  '/images/photos/tile-b.jpg': [480, 800, 1200, 1400],
  '/images/photos/tile-c.jpg': [480, 800, 1200, 1400],
  '/images/photos/bryn.jpg': [360, 600, 900],
  '/images/photos/mandy.jpg': [360, 600, 900],
};

// High quality settings: the copies should look the same as the originals.
const FORMATS = {
  avif: (img) => img.avif({ quality: 60, effort: 7, chromaSubsampling: '4:4:4' }),
  webp: (img) => img.webp({ quality: 82, effort: 6 }),
};

mkdirSync(join(repo, 'public', OUT_DIR), { recursive: true });
const manifest = {};
for (const [src, widths] of Object.entries(PHOTOS)) {
  const input = join(repo, 'public', src);
  const meta = await sharp(input).metadata();
  const name = basename(src, extname(src));
  const entry = { width: meta.width, height: meta.height, avif: [], webp: [] };
  for (const w of widths) {
    if (w > meta.width) throw new Error(`${src}: ${w} is wider than the original (${meta.width})`);
    for (const [fmt, encode] of Object.entries(FORMATS)) {
      const url = `${OUT_DIR}/${name}-${w}.${fmt}`;
      const info = await encode(sharp(input).resize({ width: w, withoutEnlargement: true })).toFile(join(repo, 'public', url));
      entry[fmt].push({ url, width: w, bytes: info.size });
    }
  }
  manifest[src] = entry;
  console.log(src, entry.avif.map((v) => `${v.width}w ${Math.round(v.bytes / 1024)} KB avif`).join(', '));
}
writeFileSync(join(repo, 'src/data/imageVariants.json'), JSON.stringify(manifest, null, 2) + '\n');
