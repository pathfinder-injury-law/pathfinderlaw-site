// Built-site page checks. Run after `npm run build`:
//   node scripts/check-html.mjs [dist-folder]
//
//  1. No em dashes. The site's style avoids them, in the words people read and in titles and
//     descriptions. Looks for the character itself and its HTML forms (&mdash; &#8212; &#x2014;).
//  2. Exactly one main heading (h1) on every page.
// Exits with code 1 and lists each problem with its page.

import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';

const root = resolve(process.argv[2] || 'dist');
if (!existsSync(join(root, 'index.html'))) {
  console.error(`No built site at ${root}. Run npm run build first.`);
  process.exit(1);
}

function files(dir) {
  const out = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, e.name);
    if (e.isDirectory()) out.push(...files(full));
    else if (e.name.endsWith('.html')) out.push(full);
  }
  return out;
}

const EM_DASH = /—|&mdash;|&#8212;|&#x2014;/gi;
const problems = [];
const pages = files(root);
for (const file of pages) {
  const page = '/' + relative(root, file).split(sep).join('/');
  const html = readFileSync(file, 'utf8');
  // feed/index.html is the RSS feed (XML), not a web page.
  if (!/^\s*<!doctype html/i.test(html)) continue;

  // Skip script bodies (code, not words), but keep structured data, which search engines show.
  const text = html.replace(/<script\b(?![^>]*ld\+json)[^>]*>[\s\S]*?<\/script>/gi, '');
  const dashes = text.match(EM_DASH);
  if (dashes) {
    const i = text.search(EM_DASH);
    const around = text.slice(Math.max(0, i - 50), i + 50).replace(/\s+/g, ' ');
    problems.push(`${page}: ${dashes.length} em dash(es), first near "...${around}..."`);
  }

  const h1s = html.match(/<h1[\s>]/gi)?.length ?? 0;
  if (h1s !== 1) problems.push(`${page}: ${h1s} h1 headings (should be exactly 1)`);
}

console.log(`Page check: ${pages.length} pages, ${problems.length} problem(s).`);
for (const p of problems) console.log(`  ${p}`);
process.exit(problems.length ? 1 : 0);
