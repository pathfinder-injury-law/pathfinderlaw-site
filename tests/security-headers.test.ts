// Checks on the built site (dist/): the security headers are in dist/_headers, the security policy
// allows every inline script the pages actually contain, and the older rules are unchanged.
// Run `npm run build` first; without a build these tests skip.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
// @ts-ignore: plain JavaScript build step
import { inlineScriptHashes, PLACEHOLDER } from '../scripts/csp-hashes.mjs';

const dist = new URL('../dist/', import.meta.url);
const built = existsSync(new URL('index.html', dist));
const opts = { skip: built ? false : 'dist/ not built; run npm run build first' };

// The header lines under one path rule, as { name: value }.
function rule(text: string, path: string): Record<string, string> {
  const lines = text.split('\n');
  const start = lines.indexOf(path);
  assert.ok(start >= 0, `no ${path} rule in _headers`);
  const out: Record<string, string> = {};
  for (const line of lines.slice(start + 1)) {
    if (!/^\s+\S/.test(line)) break;
    const i = line.indexOf(':');
    out[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return out;
}

const headers = () => readFileSync(new URL('_headers', dist), 'utf8');

test('Every page gets the security headers', opts, () => {
  const all = rule(headers(), '/*');
  assert.equal(all['Strict-Transport-Security'], 'max-age=31536000; includeSubDomains');
  assert.equal(all['X-Content-Type-Options'], 'nosniff');
  assert.equal(all['X-Frame-Options'], 'DENY');
  assert.equal(all['Referrer-Policy'], 'strict-origin-when-cross-origin');
  for (const f of ['camera', 'microphone', 'geolocation', 'payment']) assert.match(all['Permissions-Policy'], new RegExp(`\\b${f}=\\(\\)`));
  const csp = all['Content-Security-Policy'];
  assert.ok(csp, 'Content-Security-Policy is set');
  assert.match(csp, /default-src 'self'/);
  assert.match(csp, /frame-ancestors 'none'/);
  assert.match(csp, /frame-src https:\/\/challenges\.cloudflare\.com/);
  assert.match(csp, /connect-src 'self' https:\/\/cloudflareinsights\.com/);
  assert.match(csp, /script-src 'self' [^;]*https:\/\/challenges\.cloudflare\.com https:\/\/static\.cloudflareinsights\.com/);
  assert.doesNotMatch(csp, /script-src[^;]*'unsafe-inline'/, 'scripts are allowed by hash, not unsafe-inline');
});

test('The security policy allows every inline script in the built pages, by hash', opts, () => {
  const text = headers();
  assert.ok(!text.includes(PLACEHOLDER), 'the build must replace the inline script marker');
  const scriptSrc = rule(text, '/*')['Content-Security-Policy'].split(';').find((d) => d.trim().startsWith('script-src'))!;
  const hashes: string[] = inlineScriptHashes(fileURLToPath(dist));
  assert.ok(hashes.length > 0);
  for (const h of hashes) assert.ok(scriptSrc.includes(h), `inline script ${h} is not allowed by the policy`);
  // Cloudflare limits one header line to 2,000 characters.
  for (const line of text.split('\n')) assert.ok(line.length <= 2000, `_headers line too long (${line.length})`);
});

test('Pages have no inline event handlers (the policy would block them)', opts, () => {
  for (const page of ['index.html', 'contact/index.html', 'blog/index.html', '404.html']) {
    const html = readFileSync(new URL(page, dist), 'utf8');
    assert.doesNotMatch(html, /<[a-z][^>]*\son(click|load|error|submit|change|input|focus|blur|mouseover|keydown)\s*=/i, page);
  }
});

test('The thank-you and feed rules are unchanged', opts, () => {
  const text = headers();
  assert.deepEqual(rule(text, '/thank-you/'), { 'X-Robots-Tag': 'noindex, nofollow' });
  assert.deepEqual(rule(text, '/feed/'), { 'Content-Type': 'application/rss+xml; charset=utf-8' });
});
