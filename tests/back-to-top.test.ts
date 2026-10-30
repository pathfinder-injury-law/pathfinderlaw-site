// Checks on the built site (dist/): the Back to top button is on every page, labelled,
// and has a focus target at the top of the page. Run `npm run build` first; without a build these tests skip.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const dist = new URL('../dist/', import.meta.url);
const built = existsSync(new URL('index.html', dist));
const opts = { skip: built ? false : 'dist/ not built; run npm run build first' };
const read = (path: string) => readFileSync(new URL(`.${path}index.html`, dist), 'utf8');

test('Back to top button is on the home, contact and a blog page, labelled for screen readers', opts, () => {
  for (const page of ['/', '/contact/', '/blog/', '/eastern-shore-workers-comp-lawyer/']) {
    const html = read(page);
    const buttons = html.match(/<button class="to-top"[^>]*>/g) ?? [];
    assert.equal(buttons.length, 1, `${page} should have one Back to top button`);
    assert.match(buttons[0], /type="button"/);
    assert.match(buttons[0], /aria-label="Back to top"/);
  }
});

test('Back to top has a focus target: the header, at the top of the page', opts, () => {
  const html = read('/');
  assert.match(html, /<header class="site-header" id="top" tabindex="-1">/);
  assert.equal(html.split('id="top"').length - 1, 1, 'only one element may have id="top"');
});
