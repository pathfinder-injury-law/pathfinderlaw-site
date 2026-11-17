// Fails the build when an image in public/ has no credit line in public/images/photos/CREDITS.txt.
// A file counts as credited when its file name appears in CREDITS.txt, or when its folder has a
// whole-folder line (e.g. "public/images/blog/birthday/   (whole folder) ..."). Resized copies (any /sized/ folder) and the firm's logo files are exempt.
//
//   node scripts/check-credits.mjs   (runs automatically before "npm run build")

import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, relative, basename, dirname } from 'node:path';

const PUBLIC = fileURLToPath(new URL('../public/', import.meta.url));
const CREDITS = readFileSync(join(PUBLIC, 'images/photos/CREDITS.txt'), 'utf8');
const IMAGE = /\.(png|jpe?g|webp|avif|gif|svg|ico)$/i;
const EXEMPT = [/^images\/brand\//, /^favicon\.(png|ico|svg)$/, /^apple-touch-icon\.png$/, /(^|\/)sized\//];

function* walk(dir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else yield p;
  }
}

const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const named = (name) => new RegExp(`(^|[\\s,/(])${escape(name)}($|[\\s,)])`, 'm').test(CREDITS);

const missing = [];
for (const file of walk(PUBLIC)) {
  const rel = relative(PUBLIC, file).split('\\').join('/');
  if (!IMAGE.test(rel) || EXEMPT.some((r) => r.test(rel))) continue;
  const folder = `public/${dirname(rel)}/`;
  if (named(basename(rel)) || new RegExp(`^${escape(folder)}\\s+\\(whole folder\\)`, 'm').test(CREDITS)) continue;
  missing.push(rel);
}

if (missing.length) {
  console.error(`Credit check: ${missing.length} image(s) have no line in public/images/photos/CREDITS.txt:`);
  for (const m of missing) console.error(`  public/${m}`);
  console.error('Add each one with its source and license (see the file for examples).');
  process.exit(1);
}
console.log('Credit check: every image in public/ has a credit line.');
