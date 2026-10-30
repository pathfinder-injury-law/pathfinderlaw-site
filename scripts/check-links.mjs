// Built-site link check. Run after `npm run build`:
//   node scripts/check-links.mjs [dist-folder]
//
// Reads every page in dist/ and checks every same-site address it points to (href, src and
// srcset on any tag). Each one must be a file in dist/ (a page, image, font, script...) or match a
// rule in public/_redirects. Outside links (https://other-site), phone, email and #anchors are
// skipped. Exits with code 1 and lists each broken address with the pages that use it.

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';

const root = resolve(process.argv[2] || 'dist');
const SITE = 'https://pathfinderlaw.com';

if (!existsSync(join(root, 'index.html'))) {
  console.error(`No built site at ${root}. Run npm run build first.`);
  process.exit(1);
}

function files(dir) {
  const out = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, e.name);
    if (e.isDirectory()) out.push(...files(full));
    else out.push(full);
  }
  return out;
}

// _redirects rules as regular expressions. ":name" matches one path segment, "*" matches the rest.
function redirectRules() {
  const file = existsSync(join(root, '_redirects')) ? join(root, '_redirects') : 'public/_redirects';
  if (!existsSync(file)) return [];
  return readFileSync(file, 'utf8')
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('#'))
    .map((l) => l.split(/\s+/)[0])
    .map((from) => new RegExp('^' + from.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/:[A-Za-z]\w*/g, '[^/]+') + '$'));
}

const rules = redirectRules();

// Does this path resolve on the built site? Cloudflare serves /a/ from a/index.html and also
// answers /a and /a.html (redirecting to the canonical form).
function resolves(path) {
  let p;
  try { p = decodeURIComponent(path); } catch { p = path; }
  const local = join(root, p);
  if (!local.startsWith(root)) return false;
  const isFile = (f) => existsSync(f) && statSync(f).isFile();
  if (isFile(local)) return true;
  if (isFile(join(local, 'index.html'))) return true;
  if (!p.endsWith('/') && isFile(local + '.html')) return true;
  const variants = [p, p.endsWith('/') ? p.slice(0, -1) : p + '/'];
  return variants.some((v) => rules.some((r) => r.test(v)));
}

// Same-site path for an address, or null for outside links, phone, email, data and anchors.
function sitePath(raw, pageUrl) {
  const v = raw.trim().replace(/&amp;/g, '&');
  if (!v || v.startsWith('#') || /^(mailto|tel|sms|data|javascript|blob):/i.test(v)) return null;
  let u;
  try { u = new URL(v, pageUrl); } catch { return `(unparseable) ${v}`; }
  if (u.origin !== SITE && u.origin !== SITE.replace('https://', 'https://www.')) return null;
  return u.pathname;
}

const pages = files(root).filter((f) => f.endsWith('.html'));
const broken = new Map();
let checked = 0;
for (const file of pages) {
  const rel = '/' + relative(root, file).split(sep).join('/');
  const pageUrl = SITE + rel.replace(/index\.html$/, '');
  const html = readFileSync(file, 'utf8').replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, (m) => (/\ssrc=/.test(m.slice(0, m.indexOf('>'))) ? m.slice(0, m.indexOf('>') + 1) : ''));
  const refs = [];
  for (const m of html.matchAll(/\s(?:href|src)\s*=\s*"([^"]*)"/gi)) refs.push(m[1]);
  for (const m of html.matchAll(/\ssrcset\s*=\s*"([^"]*)"/gi)) for (const part of m[1].split(',')) refs.push(part.trim().split(/\s+/)[0]);
  for (const ref of refs) {
    const path = sitePath(ref, pageUrl);
    if (path === null) continue;
    checked++;
    if (path.startsWith('(unparseable)') || !resolves(path)) {
      if (!broken.has(path)) broken.set(path, new Set());
      broken.get(path).add(rel);
    }
  }
}

console.log(`Link check: ${checked} same-site addresses on ${pages.length} pages, ${broken.size} broken.`);
for (const [path, on] of broken) console.log(`  BROKEN ${path}\n    on ${[...on].slice(0, 5).join(', ')}${on.size > 5 ? ` and ${on.size - 5} more` : ''}`);
process.exit(broken.size ? 1 : 0);
