// IndexNow: tells Bing (and the other IndexNow engines: Naver, Seznam, Yandex, Yep) which pages
// changed, so they recrawl them soon instead of on their own schedule. Google does not use IndexNow.
// Protocol: https://www.indexnow.org/documentation
//
// The key is public on purpose: the engines check that https://pathfinderlaw.com/<KEY>.txt holds it,
// which proves the site owner sent the list. It is not a password. The file is public/<KEY>.txt.
//
// Used by .github/workflows/indexnow.yml. Modes:
//   node scripts/indexnow.mjs snapshot <file>
//       Save the live sitemap (every URL and its lastmod) to a JSON file.
//   node scripts/indexnow.mjs after-deploy <snapshot-file> [redirects-diff-file]
//       Wait until the live sitemap differs from the snapshot (the new deploy is out), then send the
//       URLs that were added, changed (new lastmod), or removed, plus the old addresses newly added
//       to public/_redirects. If the sitemap never changes, it sends only the redirect addresses.
//   node scripts/indexnow.mjs all
//       Send every URL in the live sitemap once.
// Add --dry-run to print the list without sending it.

import { readFileSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

export const KEY = 'cec0803fd02e87f7fe2ace1f00353909';
export const ORIGIN = 'https://pathfinderlaw.com';
const HOST = new URL(ORIGIN).host;
const ENDPOINT = 'https://api.indexnow.org/indexnow';

// Every <loc> in a sitemap or sitemap index, with its <lastmod> when there is one.
export function parseLocs(xml) {
  const out = [];
  for (const block of xml.match(/<(url|sitemap)>[\s\S]*?<\/\1>/g) ?? []) {
    const loc = block.match(/<loc>\s*([^<\s]+)\s*<\/loc>/)?.[1];
    if (!loc) continue;
    out.push({ loc, lastmod: block.match(/<lastmod>\s*([^<\s]+)\s*<\/lastmod>/)?.[1] ?? '' });
  }
  return out;
}

// What changed between two sitemap snapshots ({ url: lastmod }): new, re-dated, and removed URLs.
export function diffSitemaps(before, after) {
  const changed = Object.keys(after).filter((u) => before[u] !== after[u]);
  const removed = Object.keys(before).filter((u) => !(u in after));
  return [...changed, ...removed];
}

// Old addresses added to public/_redirects, read from a `git diff` of that file. Skipped: lines with
// :name or * patterns (not single addresses), and lines that only add the trailing slash.
export function redirectSources(diffText) {
  const out = [];
  for (const line of diffText.split('\n')) {
    if (!line.startsWith('+') || line.startsWith('+++')) continue;
    const [from, to, code] = line.slice(1).trim().split(/\s+/);
    if (!from || from.startsWith('#') || !from.startsWith('/') || /[:*]/.test(from)) continue;
    if (to === `${from}/`) continue;
    if (code && !/^30[178]$/.test(code)) continue;
    out.push(ORIGIN + from);
  }
  return out;
}

const fetchText = async (url) => {
  const res = await fetch(url, { headers: { 'cache-control': 'no-cache' } });
  if (!res.ok) throw new Error(`${url} returned ${res.status}`);
  return res.text();
};

// The live sitemap index and every child sitemap, as { url: lastmod }.
export async function liveSitemap() {
  const urls = {};
  for (const { loc } of parseLocs(await fetchText(`${ORIGIN}/sitemap.xml`))) {
    for (const u of parseLocs(await fetchText(loc))) urls[u.loc] = u.lastmod;
  }
  if (!Object.keys(urls).length) throw new Error('The live sitemap has no URLs.');
  return urls;
}

async function submit(urls, dryRun) {
  const list = [...new Set(urls)].filter((u) => u.startsWith(ORIGIN + '/'));
  console.log(`${list.length} URL(s):\n${list.join('\n')}`);
  if (!list.length || dryRun) return;
  const keyLive = (await fetchText(`${ORIGIN}/${KEY}.txt`)).trim();
  if (keyLive !== KEY) throw new Error('The live key file does not match the key. Deploy it first.');
  // The protocol takes up to 10,000 URLs per request; this site has about 100.
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'content-type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `${ORIGIN}/${KEY}.txt`, urlList: list }),
  });
  // 200 = received; 202 = received, key check still pending. Anything else is a failure.
  console.log(`IndexNow answered ${res.status} ${res.statusText}`);
  if (res.status !== 200 && res.status !== 202) {
    console.error(await res.text());
    process.exitCode = 1;
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const same = (a, b) => JSON.stringify(Object.entries(a).sort()) === JSON.stringify(Object.entries(b).sort());

async function main(argv) {
  const dryRun = argv.includes('--dry-run');
  const [mode, ...args] = argv.filter((a) => a !== '--dry-run');
  if (mode === 'snapshot') {
    writeFileSync(args[0], JSON.stringify(await liveSitemap(), null, 1));
    console.log(`Saved the live sitemap to ${args[0]}.`);
  } else if (mode === 'all') {
    await submit(Object.keys(await liveSitemap()), dryRun);
  } else if (mode === 'after-deploy') {
    const before = JSON.parse(readFileSync(args[0], 'utf8'));
    const redirects = args[1] ? redirectSources(readFileSync(args[1], 'utf8')) : [];
    // Workers Builds takes about 1 to 11 minutes after a merge. Check every 30 seconds for 20 minutes.
    let after = before;
    for (let i = 0; i < 40 && same(before, after); i++) {
      await sleep(30_000);
      after = await liveSitemap();
    }
    if (same(before, after)) console.log('The sitemap did not change in 20 minutes; sending redirect addresses only.');
    await submit([...diffSitemaps(before, after), ...redirects], dryRun);
  } else {
    console.error('Usage: node scripts/indexnow.mjs snapshot <file> | after-deploy <snapshot> [diff] | all  [--dry-run]');
    process.exitCode = 2;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main(process.argv.slice(2)).catch((e) => {
    console.error(e.message);
    process.exitCode = 1;
  });
}
