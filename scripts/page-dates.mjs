// Works out when each sitemap page's own words last changed, from git history, and writes
// src/data/pageDates.json (path -> YYYY-MM-DD). The sitemaps use it for <lastmod>.
//
// "Own words" means the text lines of that page only: its page file (template text and the quoted
// strings in its front matter) and, for pages built from a data file (cities.ts, articlesB.ts,
// subArticles.ts), the lines of its own entry. Markup, class names, styles, scripts, imports and
// comments don't count, and neither do shared components (header, footer, forms), so a design or
// speed change never moves a page's date. Blog posts are not here: they keep their own `updated`
// front matter.
//
// Run after changing a page's text, and commit the JSON with the change:
//   node scripts/page-dates.mjs            prints the dates and what changed against the JSON
//   node scripts/page-dates.mjs --write    rewrites src/data/pageDates.json
// Needs full git history (a normal clone). A shallow clone would date everything to one commit,
// so the script refuses to run there.

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const repo = fileURLToPath(new URL('..', import.meta.url));
const OUT = join(repo, 'src/data/pageDates.json');
const git = (...args) => execFileSync('git', args, { cwd: repo, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });

if (git('rev-parse', '--is-shallow-repository').trim() === 'true') {
  console.error('This is a shallow clone, so git blame would give wrong dates. Run it in a full clone.');
  process.exit(1);
}

// Every path in the non-post sitemaps, read from the data the sitemaps are built from.
const pathsFrom = (file, re) => [...readFileSync(join(repo, file), 'utf8').matchAll(re)].map((m) => m[1]);
const ARTICLE_BASE = '/virginia-workers-comp-lawyer/';

// Date of the newest committed line in `file` among `lines` (1-based) that pass `isText`.
const blameCache = new Map();
function blame(file) {
  if (!blameCache.has(file)) {
    const out = git('blame', '--line-porcelain', '-w', 'HEAD', '--', file).split('\n');
    const rows = [];
    let time = 0;
    for (const l of out) {
      if (l.startsWith('committer-time ')) time = Number(l.slice(15));
      else if (l.startsWith('\t')) rows.push({ time, text: l.slice(1) });
    }
    blameCache.set(file, rows);
  }
  return blameCache.get(file);
}

const words = (s) => (s.match(/[A-Za-z’']{2,}/g) ?? []).length >= 2;
const quoted = (line) => [...line.matchAll(/'((?:[^'\\]|\\.)*)'|"((?:[^"\\]|\\.)*)"|`([^`]*)`/g)].map((m) => m[1] ?? m[2] ?? m[3]).join(' ');
const isComment = (t) => /^\s*(\/\/|\/\*|\*|<!--)/.test(t);

// A data-file line counts when its quoted strings hold words (the page's wording).
const dataText = (t) => !isComment(t) && words(quoted(t).replace(/<[^>]+>/g, ' '));

// A page-file line counts when it is visible text in the template, or a worded string in the front matter.
function pageTextLines(rows) {
  const keep = [];
  let fence = 0, block = null;
  rows.forEach((r, i) => {
    const t = r.text;
    if (t.trim() === '---') { fence++; return; }
    if (fence === 1) { if (!/^\s*import\s/.test(t) && dataText(t)) keep.push(i); return; }
    if (block) { if (t.includes(`</${block}`)) block = null; return; }
    const open = t.match(/<(style|script)\b/);
    if (open && !t.includes(`</${open[1]}`)) { block = open[1]; return; }
    if (isComment(t)) return;
    const visible = t.replace(/<!--.*?-->/g, ' ').replace(/<[^>]*>?/g, ' ').replace(/\{[^}]*\}/g, ' ');
    if (words(visible) || words(quoted(t))) keep.push(i);
  });
  return keep;
}

// The line range of the entry whose key line matches `keyLine` (until the next entry's key line).
function entryRange(rows, keyRe, keyLine) {
  const starts = rows.map((r, i) => (keyRe.test(r.text) ? i : -1)).filter((i) => i >= 0);
  const at = starts.findIndex((i) => rows[i].text.includes(keyLine));
  if (at < 0) return null;
  return [starts[at], (starts[at + 1] ?? rows.length) - 1];
}

const newest = (rows, idx) => Math.max(0, ...idx.map((i) => rows[i].time));
const day = (t) => new Date(t * 1000).toISOString().slice(0, 10);

const sources = [];
const cityPaths = pathsFrom('src/data/cities.ts', /^\s{4}path: '([^']+)'/gm);
const bPaths = pathsFrom('src/data/articlesB.ts', /^\s{4}path: '([^']+)'/gm);
const subSlugs = pathsFrom('src/data/subArticles.ts', /^\s{4}slug: '([^']+)'/gm);
const pageDirs = git('ls-files', 'src/pages').split('\n').filter((f) => /^src\/pages\/(.+\/)?index\.astro$/.test(f));
const pagePath = (f) => '/' + f.replace(/^src\/pages\//, '').replace(/index\.astro$/, '');

const dates = {};
const add = (path, time, why) => { if (time) { dates[path] = Math.max(dates[path] ?? 0, time); sources.push([path, day(time), why]); } };

for (const f of pageDirs) {
  const p = pagePath(f);
  if (['/thank-you/', '/client-portal/', '/sitemap/', '/blog/'].includes(p) || p.startsWith('/blog/')) continue;
  const rows = blame(f);
  add(p, newest(rows, pageTextLines(rows)), f);
}
const fromData = (file, keyRe, list, toPath, keyOf) => {
  const rows = blame(file);
  for (const k of list) {
    const r = entryRange(rows, keyRe, keyOf(k));
    if (!r) continue;
    const idx = [];
    for (let i = r[0]; i <= r[1]; i++) if (dataText(rows[i].text)) idx.push(i);
    add(toPath(k), newest(rows, idx), `${file} entry`);
  }
};
fromData('src/data/cities.ts', /^\s{4}path: '/, cityPaths, (p) => p, (p) => `path: '${p}'`);
fromData('src/data/articlesB.ts', /^\s{4}path: '/, bPaths, (p) => p, (p) => `path: '${p}'`);
fromData('src/data/subArticles.ts', /^\s{4}slug: '/, subSlugs, (s) => `${ARTICLE_BASE}${s}/`, (s) => `slug: '${s}'`);

const result = Object.fromEntries(Object.keys(dates).sort().map((p) => [p, day(dates[p])]));
const old = existsSync(OUT) ? JSON.parse(readFileSync(OUT, 'utf8')) : {};
const changed = Object.keys(result).filter((p) => old[p] !== result[p]);

if (process.argv.includes('--write')) {
  writeFileSync(OUT, JSON.stringify(result, null, 2) + '\n');
  console.log(`Wrote ${Object.keys(result).length} page dates to src/data/pageDates.json (${changed.length} changed).`);
} else {
  for (const [p, d] of Object.entries(result)) console.log(`${d}  ${p}${old[p] && old[p] !== d ? `  (was ${old[p]})` : ''}`);
  if (process.argv.includes('--why')) for (const s of sources) console.log('   ', s.join('  '));
  console.log(changed.length ? `\n${changed.length} date(s) differ from the JSON. Run with --write to update.` : '\nThe JSON is up to date.');
}
