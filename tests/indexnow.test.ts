// IndexNow helper (scripts/indexnow.mjs): the key file is in place and the change list is right.
// No network: these only test the parsing and the diff.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { KEY, ORIGIN, parseLocs, diffSitemaps, redirectSources } from '../scripts/indexnow.mjs';

test('IndexNow key file holds exactly the key', () => {
  assert.match(KEY, /^[0-9a-f]{32}$/);
  assert.equal(readFileSync(new URL(`../public/${KEY}.txt`, import.meta.url), 'utf8'), KEY);
});

test('IndexNow: sitemap parsing reads loc and lastmod', () => {
  const xml = `<urlset><url><loc>${ORIGIN}/a/</loc><lastmod>2026-11-01</lastmod></url>
  <url><loc>${ORIGIN}/b/</loc></url></urlset>`;
  assert.deepEqual(parseLocs(xml), [
    { loc: `${ORIGIN}/a/`, lastmod: '2026-11-01' },
    { loc: `${ORIGIN}/b/`, lastmod: '' },
  ]);
});

test('IndexNow: the diff sends new, re-dated and removed URLs, not unchanged ones', () => {
  const before = { '/same/': '2026-11-01', '/redated/': '2026-11-01', '/gone/': '2026-10-01' };
  const after = { '/same/': '2026-11-01', '/redated/': '2026-11-08', '/new/': '2026-11-08' };
  assert.deepEqual(diffSitemaps(before, after).sort(), ['/gone/', '/new/', '/redated/']);
});

test('IndexNow: only plain old addresses added to _redirects are sent', () => {
  const diff = [
    '+++ b/public/_redirects',
    '+# a comment',
    '+/old-post/ /new-post/ 301',
    '+/old-post /new-post/ 301',
    '+/results/:amount/ /results/ 301',
    '+/new-post /new-post/ 301',
    '-/removed /x/ 301',
    ' /context /y/ 301',
  ].join('\n');
  assert.deepEqual(redirectSources(diff), [`${ORIGIN}/old-post/`, `${ORIGIN}/old-post`]);
});
