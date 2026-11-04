// Article structured data on article pages (built by src/layouts/Base.astro). Needs `npm run build` first.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const dist = fileURLToPath(new URL('../dist/', import.meta.url));
const built = existsSync(join(dist, 'index.html'));
const opts = { skip: built ? false : 'dist/ not built; run npm run build first' };
const pageDates: Record<string, string> = JSON.parse(readFileSync(new URL('../src/data/pageDates.json', import.meta.url), 'utf8'));

function pages(dir = dist): string[] {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) return pages(p);
    return name === 'index.html' ? ['/' + p.slice(dist.length).replace(/index\.html$/, '')] : [];
  });
}
function nodesOf(path: string): any[] {
  const html = readFileSync(join(dist, path, 'index.html'), 'utf8');
  return [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)]
    .flatMap((m) => { const j = JSON.parse(m[1]); return j['@graph'] ?? [j]; });
}
const h1Of = (path: string) =>
  (readFileSync(join(dist, path, 'index.html'), 'utf8').match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1] ?? '')
    .replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

const SAMPLE = '/virginia-workers-comp-lawyer/what-is-maximum-medical-improvement-in-virginia-workers-comp-claims/';

test('article pages carry one Article block with the H1, Bryn, the firm, and the true date', opts, () => {
  for (const path of [SAMPLE, '/workers-comp-process-in-virginia/', '/how-to-appeal-a-workers-comp-denial-in-virginia/', '/car-accident-at-work-in-virginia/']) {
    const nodes = nodesOf(path);
    const articles = nodes.filter((n) => n['@type'] === 'Article');
    assert.equal(articles.length, 1, `${path} should have one Article`);
    const a = articles[0];
    const url = `https://pathfinderlaw.com${path}`;
    assert.equal(a['@id'], `${url}#article`);
    assert.equal(a.mainEntityOfPage['@id'], `${url}#webpage`);
    assert.ok(nodes.some((n) => n['@id'] === `${url}#webpage`), `${path}: Article points at a missing WebPage`);
    assert.equal(a.headline, h1Of(path), `${path}: headline should match the H1`);
    assert.equal(a.author['@id'], 'https://pathfinderlaw.com/#author');
    assert.equal(a.author.name, 'Bryn Swartz');
    assert.equal(a.publisher['@id'], 'https://pathfinderlaw.com/#organization');
    assert.equal(a.dateModified, pageDates[path], `${path}: dateModified should be the sitemap date`);
    assert.ok(!('datePublished' in a), `${path}: no datePublished (no true first-publish date exists)`);
  }
});

test('Article is not on blog posts, city pages, practice pages, or pages without an author', opts, () => {
  let count = 0;
  for (const path of pages()) {
    const nodes = nodesOf(path);
    const hasArticle = nodes.some((n) => n['@type'] === 'Article');
    if (nodes.some((n) => n['@type'] === 'BlogPosting')) assert.ok(!hasArticle, `${path}: blog post should not also carry Article`);
    if (/-workers-comp-(lawyer|worker)\/$/.test(path) && !path.startsWith('/virginia-')) assert.ok(!hasArticle, `${path}: city page should not carry Article`);
    if (hasArticle) count++;
  }
  for (const path of ['/', '/virginia-workers-comp-lawyer/', '/virginia-work-injury-lawyer/', '/virginia-construction-accident-lawyer/',
    '/virginia-factory-accident-lawyer/', '/virginia-workers-comp-lawyer/virginia-back-injury-lawyer/', '/contact/', '/about-us/', '/bryn-swartz/']) {
    assert.ok(!nodesOf(path).some((n) => n['@type'] === 'Article'), `${path} should not carry Article`);
  }
  assert.ok(count >= 25, `expected the article pages to carry Article, found ${count}`);
});

// Google asks for short headlines; 110 characters was its old hard limit and some validators still flag it.
test('every Article headline is present and 110 characters or fewer', opts, () => {
  for (const path of pages()) {
    for (const a of nodesOf(path).filter((n) => n['@type'] === 'Article')) {
      assert.ok(a.headline.length > 0 && a.headline.length <= 110, `${path}: headline length ${a.headline.length}`);
    }
  }
});
