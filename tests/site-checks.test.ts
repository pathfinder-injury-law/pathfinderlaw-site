// Runs the built-site checks (scripts/check-links.mjs and scripts/check-html.mjs) as tests, so
// `node --test tests/` catches broken links, em dashes and h1 problems too.
// Run `npm run build` first; without a build these tests skip.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const repo = fileURLToPath(new URL('..', import.meta.url));
const built = existsSync(new URL('../dist/index.html', import.meta.url));
const opts = { skip: built ? false : 'dist/ not built; run npm run build first' };
const run = (script: string) => spawnSync(process.execPath, [script], { cwd: repo, encoding: 'utf8' });

test('Every same-site link on the built site resolves (page, file or redirect)', opts, () => {
  const r = run('scripts/check-links.mjs');
  assert.equal(r.status, 0, r.stdout + r.stderr);
});

test('No em dashes and exactly one h1 on every built page', opts, () => {
  const r = run('scripts/check-html.mjs');
  assert.equal(r.status, 0, r.stdout + r.stderr);
});
