// Call-tap and form-send counters (src/worker/counts.ts, migration 0003).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import worker from '../src/worker/index.ts';
import { handleContact } from '../src/worker/contact.ts';
import { DAILY_CAP, cleanPath, etDay, handleTap } from '../src/worker/counts.ts';
import { goodInput, liveEnv, makeDb, makeWorld } from './helpers.ts';

const SITE = 'https://pathfinderlaw.com';
const REAL = new Set(['/', '/contact/', '/knee-injury-compensation/']);
// Stand-in for the site's own files: 200 for a real page, 404 for anything else.
const assets = { fetch: async (r: Request) => new Response(null, { status: REAL.has(new URL(r.url).pathname) ? 200 : 404 }) };

const tap = (body: string, headers: Record<string, string> = { origin: SITE }) =>
  new Request(`${SITE}/api/tap`, { method: 'POST', headers: { 'content-type': 'text/plain;charset=UTF-8', ...headers }, body });

const counts = (env: ReturnType<typeof liveEnv>) =>
  (env.sqlite.prepare('SELECT day, page, kind, count FROM contact_counts ORDER BY page, kind').all() as { day: string; page: string; kind: string; count: number }[]).map((r) => ({ ...r }));

test('counter table holds only day, page, kind, and count: nothing about the visitor', () => {
  const cols = (makeDb().sqlite.prepare('PRAGMA table_info(contact_counts)').all() as { name: string }[]).map((c) => c.name);
  assert.deepEqual(cols, ['day', 'page', 'kind', 'count']);
});

test('a phone tap adds 1 to that page for the day (Eastern time), and answers 204 with no body', async () => {
  const env = liveEnv({ ASSETS: assets }); const { deps } = makeWorld({ now: '2026-11-25T03:30:00Z' }); // 10:30 p.m. Nov 24 ET
  for (let i = 0; i < 3; i++) {
    const res = await handleTap(tap('/knee-injury-compensation/'), env, deps);
    assert.equal(res.status, 204);
    assert.equal(await res.text(), '');
  }
  assert.deepEqual(counts(env), [{ day: '2026-11-24', page: '/knee-injury-compensation/', kind: 'call', count: 3 }]);
});

test('taps from other sites, made-up pages, or odd paths are not counted', async () => {
  const env = liveEnv({ ASSETS: assets }); const { deps } = makeWorld();
  for (const req of [
    tap('/contact/', { origin: 'https://evil.example' }),
    tap('/contact/', {}), // no Origin
    tap('/no-such-page/'),
    tap('/../etc/passwd'),
    tap('/contact/?q=pat@example.com'),
    tap('x'.repeat(250)),
  ]) assert.equal((await handleTap(req, env, deps)).status, 204);
  assert.deepEqual(counts(env), []);
  assert.equal((await handleTap(new Request(`${SITE}/api/tap`), env, deps)).status, 405);
});

test('one page stops counting at the daily cap, so a bot cannot burn the form database writes', async () => {
  const env = liveEnv({ ASSETS: assets }); const { deps } = makeWorld();
  for (let i = 0; i < DAILY_CAP + 25; i++) await handleTap(tap('/'), env, deps);
  assert.equal(counts(env)[0].count, DAILY_CAP);
});

test('the Worker routes /api/tap, and a missing table (migration not yet applied) changes nothing', async () => {
  const env = liveEnv({ ASSETS: assets });
  env.sqlite.exec('DROP TABLE contact_counts');
  const res = await worker.fetch(tap('/contact/'), env);
  assert.equal(res.status, 204);
});

test('a real form send counts once for its page; screened messages and failures do not', async () => {
  const env = liveEnv(); const { deps } = makeWorld();
  const send = (body: unknown, referer = `${SITE}/knee-injury-compensation/`) =>
    handleContact(new Request(`${SITE}/api/contact`, { method: 'POST', headers: { 'content-type': 'application/json', referer }, body: JSON.stringify(body) }), env, deps);
  assert.equal((await send(goodInput())).status, 200);
  assert.equal((await send(goodInput({ company: 'trap filled' }))).status, 200); // bot trap: screened
  assert.equal((await send(goodInput({ email: 'other@example.com' }), 'https://evil.example/x/')).status, 200); // off-site referer
  assert.deepEqual(counts(env), [{ day: etDay(deps.now()), page: '/knee-injury-compensation/', kind: 'form', count: 1 }]);

  const down = liveEnv(); const { deps: d2 } = makeWorld({ gmail: 500 });
  await handleContact(new Request(`${SITE}/api/contact`, { method: 'POST', headers: { 'content-type': 'application/json', referer: `${SITE}/contact/` }, body: JSON.stringify(goodInput()) }), down, d2);
  assert.deepEqual(counts(down), []);
});

test('the form still answers normally when the counter table is missing', async () => {
  const env = liveEnv(); const { deps } = makeWorld();
  env.sqlite.exec('DROP TABLE contact_counts');
  const res = await handleContact(new Request(`${SITE}/api/contact`, { method: 'POST', headers: { 'content-type': 'application/json', referer: `${SITE}/contact/` }, body: JSON.stringify(goodInput()) }), env, deps);
  assert.equal(res.status, 200);
});

test('cleanPath keeps plain page paths only', () => {
  assert.equal(cleanPath('/contact/'), '/contact/');
  for (const bad of ['', 'contact', '/a b/', '/x?y=1', '/x#y', '/../x', 'https://x.test/']) assert.equal(cleanPath(bad), null);
});

test('the tap listener uses sendBeacon and sends only the page path', () => {
  const src = readFileSync(new URL('../src/components/Header.astro', import.meta.url), 'utf8');
  assert.match(src, /navigator\.sendBeacon\('\/api\/tap', location\.pathname\)/);
  assert.doesNotMatch(src, /document\.cookie|localStorage|userAgent/);
});
