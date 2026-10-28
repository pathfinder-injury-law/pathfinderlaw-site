// Compares every page address in table T0 of the URL inventory across two sites:
// the live site (https://pathfinderlaw.com, still WordPress until cutover) and the
// local build in dist/. For each built page it checks the title, meta description,
// H1, canonical tag, robots tag and the four structured-data types.
//
// Run after `npm run build`:
//   node scripts/compare-old-new.mjs --inventory "<folder>/url-inventory.tsv"
//
// Options:
//   --inventory <file>  URL inventory TSV (or set the URL_INVENTORY environment variable)
//   --dist <folder>     built site to compare (default: dist)
//   --delay <ms>        pause between live requests (default: 1000)
//   --fail-on-diff      exit with code 1 if any unapproved difference is found
//
// Known, approved differences live in scripts/approved-differences.json.
// Pages that are not built yet show as "not built" and never fail.

import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptsDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptsDir, '..');

const SITE_ORIGIN = 'https://pathfinderlaw.com';
const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15';
const TABLE = 'T0';
const SCHEMA_TYPES = ['Organization', 'WebSite', 'WebPage', 'BreadcrumbList'];
const FIELDS = ['title', 'description', 'h1', 'canonical', 'robots', 'schema'];
const LABELS = { title: 'Title', description: 'Description', h1: 'H1', canonical: 'Canonical', robots: 'Robots', schema: 'Schema' };
// The launch switch. Previews leave it unset, so their pages are noindex.
const LIVE_BUILD = process.env.PUBLIC_SITE_LIVE === '1';

const NAMED_ENTITIES = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ',
  lsquo: '‘', rsquo: '’', ldquo: '“', rdquo: '”',
  ndash: '–', mdash: '—', hellip: '…',
};

const sleep = (ms) => new Promise((done) => setTimeout(done, ms));

function parseArgs(argv) {
  const opts = { inventory: process.env.URL_INVENTORY, dist: join(repoRoot, 'dist'), delay: 1000, failOnDiff: false };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--fail-on-diff') opts.failOnDiff = true;
    else if (arg === '--inventory') opts.inventory = argv[++i];
    else if (arg === '--dist') opts.dist = resolve(argv[++i]);
    else if (arg === '--delay') opts.delay = Number(argv[++i]);
    else throw new Error(`Unknown option: ${arg}`);
  }
  if (!opts.inventory) {
    throw new Error('Give the inventory path with --inventory "<folder>/url-inventory.tsv" (or set URL_INVENTORY).');
  }
  return opts;
}

// Turns HTML entities such as &#8217; and &amp; back into plain characters.
function decode(text) {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (whole, name) => {
    if (name[0] === '#') {
      const code = name[1].toLowerCase() === 'x' ? parseInt(name.slice(2), 16) : parseInt(name.slice(1), 10);
      return String.fromCodePoint(code);
    }
    return NAMED_ENTITIES[name.toLowerCase()] ?? whole;
  });
}

// Plain visible text: tags removed, entities decoded, spaces collapsed.
function plainText(html) {
  return decode(html.replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim();
}

// Reads one attribute (name="value" or name='value') from a tag string.
function attr(tag, name) {
  const match = tag.match(new RegExp(`\\s${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)')`, 'i'));
  return match ? decode(match[1] ?? match[2]) : null;
}

// Collects every @type value in JSON-LD blocks, at any depth.
function collectTypes(node, types) {
  if (Array.isArray(node)) {
    for (const item of node) collectTypes(item, types);
  } else if (node && typeof node === 'object') {
    for (const [key, value] of Object.entries(node)) {
      if (key === '@type') [].concat(value).forEach((type) => types.add(type));
      else collectTypes(value, types);
    }
  }
}

function schemaTypes(html) {
  const types = new Set();
  for (const match of html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      collectTypes(JSON.parse(match[1]), types);
    } catch {
      // A block that is not valid JSON contributes no types; the page will show as a difference.
    }
  }
  return [...types];
}

// Pulls the fields we compare out of one page's HTML.
function extract(html) {
  const metaTags = [...html.matchAll(/<meta\b[^>]*>/gi)].map((match) => match[0]);
  const metaNamed = (name) => {
    const tag = metaTags.find((t) => attr(t, 'name')?.toLowerCase() === name);
    return tag ? attr(tag, 'content') : null;
  };
  const canonicalTag = [...html.matchAll(/<link\b[^>]*>/gi)].map((m) => m[0]).find((t) => attr(t, 'rel') === 'canonical');
  const title = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i);
  const h1 = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i);
  return {
    title: title ? plainText(title[1]) : null,
    description: metaNamed('description'),
    h1: h1 ? plainText(h1[1]) : null,
    canonical: canonicalTag ? attr(canonicalTag, 'href') : null,
    robots: metaNamed('robots'),
    schemaTypes: schemaTypes(html),
  };
}

const robotsState = (value) => (value && /noindex/i.test(value) ? 'noindex' : 'indexable');
const shown = (value) => value ?? '(missing)';

// Builds one field-by-field comparison for a page. Nothing is approved yet at this point.
function compareFields(address, live, local) {
  const fields = {};

  for (const name of ['title', 'description', 'h1']) {
    fields[name] = { live: shown(live[name]), local: shown(local[name]), ok: live[name] === local[name] };
  }

  // The new site must use the no-www address, so the canonical must match the address exactly.
  fields.canonical = {
    live: shown(live.canonical),
    local: shown(local.canonical),
    ok: local.canonical === live.canonical && local.canonical === SITE_ORIGIN + address,
  };

  // Previews are noindex on purpose; that counts as expected, not as a failure.
  const liveRobots = robotsState(live.robots);
  const localRobots = robotsState(local.robots);
  fields.robots = {
    live: liveRobots,
    local: localRobots,
    ok: liveRobots === 'indexable' && localRobots === (LIVE_BUILD ? 'indexable' : 'noindex'),
    label: localRobots === 'noindex' && !LIVE_BUILD ? 'noindex (preview)' : undefined,
  };

  const liveTypes = SCHEMA_TYPES.filter((type) => live.schemaTypes.includes(type));
  const localTypes = SCHEMA_TYPES.filter((type) => local.schemaTypes.includes(type));
  fields.schema = {
    live: liveTypes.join(', ') || '(none)',
    local: localTypes.join(', ') || '(none)',
    ok: liveTypes.join() === localTypes.join() && localTypes.length === SCHEMA_TYPES.length,
  };

  for (const field of Object.values(fields)) field.status = field.ok ? 'ok' : 'DIFF';
  return fields;
}

// A difference is approved only when the live and new values both match an approved entry.
// If the new wording changes later, the entry stops matching and the difference fails again.
function applyApprovals(address, fields, approvals) {
  for (const [name, field] of Object.entries(fields)) {
    if (field.ok) continue;
    const approved = approvals.some(
      (entry) => entry.address === address && entry.field === name && entry.live === field.live && entry.new === field.local,
    );
    if (approved) field.status = 'approved';
  }
}

function localFile(dist, address) {
  return join(dist, address.endsWith('/') ? `${address}index.html` : address);
}

function readInventory(file) {
  const [headerLine, ...lines] = readFileSync(file, 'utf8').split(/\r?\n/).filter((line) => line.length > 0);
  const header = headerLine.split('\t');
  const addressCol = header.indexOf('Address');
  const numberCol = header.indexOf('#');
  const sectionCol = header.indexOf('Section');
  if (addressCol < 0) throw new Error(`No "Address" column in ${file}`);
  return lines
    .map((line) => line.split('\t'))
    .filter((cells) => cells[0] === TABLE)
    .map((cells) => ({ number: cells[numberCol] ?? '', address: (cells[addressCol] ?? '').trim(), section: cells[sectionCol] ?? '' }));
}

// Old addresses that the new site redirects with a 301 (from public/_redirects).
function readRedirects() {
  const redirects = new Map();
  const file = join(repoRoot, 'public', '_redirects');
  if (!existsSync(file)) return redirects;
  for (const line of readFileSync(file, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const [from, to, code] = trimmed.split(/\s+/);
    if (from && to && code === '301') redirects.set(from, to);
  }
  return redirects;
}

function readApprovals() {
  const file = join(scriptsDir, 'approved-differences.json');
  if (!existsSync(file)) return [];
  return JSON.parse(readFileSync(file, 'utf8')).approved ?? [];
}

async function fetchLive(address) {
  const response = await fetch(SITE_ORIGIN + address, {
    headers: { 'user-agent': USER_AGENT, accept: 'text/html' },
    signal: AbortSignal.timeout(30_000),
  });
  return { status: response.status, html: response.status === 200 ? await response.text() : '' };
}

function cellText(field) {
  if (field.status === 'ok') return field.label ?? 'ok';
  return field.status;
}

function printReport(results) {
  const table = [['#', 'Address', ...FIELDS.map((name) => LABELS[name]), 'Result']];
  for (const result of results) {
    if (result.state === 'built') {
      const cells = FIELDS.map((name) => cellText(result.fields[name]));
      const statuses = FIELDS.map((name) => result.fields[name].status);
      const outcome = statuses.includes('DIFF') ? 'FAIL' : statuses.includes('approved') ? 'pass (approved)' : 'pass';
      table.push([result.number, result.address, ...cells, outcome]);
    } else {
      const dashes = Array(FIELDS.length).fill('-');
      let outcome = 'not built';
      if (result.state === 'redirected') outcome = `redirected to ${result.target}`;
      if (result.state === 'live error') outcome = `live error (${result.liveStatus})`;
      table.push([result.number, result.address, ...dashes, outcome]);
    }
  }

  const widths = table[0].map((_, col) => Math.max(...table.map((row) => String(row[col]).length)));
  table.forEach((row, index) => {
    console.log(row.map((cell, col) => String(cell).padEnd(widths[col])).join('  ').trimEnd());
    if (index === 0) console.log(widths.map((w) => '-'.repeat(w)).join('  '));
  });

  const built = results.filter((r) => r.state === 'built');
  const details = [];
  for (const result of built) {
    for (const name of FIELDS) {
      const field = result.fields[name];
      if (field.status === 'ok') continue;
      details.push(`${result.address}  ${LABELS[name]}  [${field.status}]\n    live:  ${field.live}\n    new:   ${field.local}`);
    }
  }
  console.log('\nDifferences on built pages');
  console.log(details.length ? details.join('\n') : '  None.');

  const count = (state) => results.filter((r) => r.state === state).length;
  const passing = built.filter((r) => FIELDS.every((name) => r.fields[name].status !== 'DIFF')).length;
  const tally = (status) => built.reduce((total, r) => total + FIELDS.filter((name) => r.fields[name].status === status).length, 0);
  console.log('\nSummary');
  console.log(`  Addresses in table ${TABLE}:        ${results.length}`);
  console.log(`  Built and compared:               ${built.length}`);
  console.log(`  Built, live page unavailable:     ${count('live error')}`);
  console.log(`  Not built yet:                    ${count('not built')}`);
  console.log(`  Redirected (old address):         ${count('redirected')}`);
  console.log(`  Built pages passing:              ${passing}`);
  console.log(`  Built pages with differences:     ${built.length - passing}`);
  console.log(`  Field checks: ok ${tally('ok')}, approved ${tally('approved')}, differences ${tally('DIFF')}`);
  console.log(`  Robots: ${LIVE_BUILD ? 'live build (indexable expected)' : 'preview build (noindex (preview) expected)'}`);
  return built.length - passing;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const rows = readInventory(args.inventory);
  const redirects = readRedirects();
  const approvals = readApprovals();
  const results = [];
  let liveRequests = 0;

  for (const row of rows) {
    const file = localFile(args.dist, row.address);
    if (!existsSync(file)) {
      results.push({ ...row, state: redirects.has(row.address) ? 'redirected' : 'not built', target: redirects.get(row.address) });
      continue;
    }

    if (liveRequests > 0) await sleep(args.delay);
    liveRequests += 1;

    let live;
    try {
      live = await fetchLive(row.address);
    } catch (error) {
      live = { status: error.cause?.code ?? error.message, html: '' };
    }
    if (live.status !== 200) {
      results.push({ ...row, state: 'live error', liveStatus: live.status });
      continue;
    }

    const local = extract(readFileSync(file, 'utf8'));
    const fields = compareFields(row.address, extract(live.html), local);
    applyApprovals(row.address, fields, approvals);
    results.push({ ...row, state: 'built', fields });
  }

  const failing = printReport(results);
  if (args.failOnDiff && failing > 0) process.exitCode = 1;
}

main().catch((error) => {
  console.error(`compare-old-new: ${error.message}`);
  process.exitCode = 2;
});
