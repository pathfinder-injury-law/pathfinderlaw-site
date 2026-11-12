import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { handleContact } from '../src/worker/contact.ts';
import { resetTokenCache } from '../src/worker/google.ts';
import { RESEND_MAX_ATTEMPTS, runResend } from '../src/worker/resend.ts';
import { buildDailyCheck } from '../src/worker/scheduled.ts';
import { cronJob, runScheduled } from '../src/worker/index.ts';
import { decodeRaw, goodInput, liveEnv, makeWorld, post } from './helpers.ts';

beforeEach(() => resetTokenCache());

const rows = (env: ReturnType<typeof liveEnv>) => env.sqlite.prepare('SELECT * FROM submissions ORDER BY created_at').all() as Record<string, any>[];
const gmail = (calls: { url: string }[]) => calls.filter((c) => c.url.includes('gmail.googleapis.com'));
const alerted = (calls: { url: string }[]) => calls.some((c) => c.url === 'https://hb.example/fail');

// A lead whose email failed at `when` (Gmail answered 500 twice, so the one built-in retry also failed).
async function failedLead(env: ReturnType<typeof liveEnv>, when: string, o: Record<string, unknown> = {}) {
  const res = await handleContact(post(goodInput(o)), env, makeWorld({ now: when, gmail: 500 }).deps);
  assert.equal(res.status, 502);
  resetTokenCache();
}

// A row written straight into the log, for states the form itself cannot easily produce.
function insert(env: ReturnType<typeof liveEnv>, r: Record<string, unknown>) {
  const row = { id: `row-${Math.random().toString(16).slice(2, 10)}`, form: 'main', outcome: 'lead', reason: 'clean', is_test: 0, turnstile: 'pass',
    delivery_status: 'failed', name: 'Pat Example', email: 'pat@example.com', phone: '(804) 555-0100', message: 'I hurt my back.', ...r };
  const keys = Object.keys(row);
  env.sqlite.prepare(`INSERT INTO submissions (${keys.join(', ')}) VALUES (${keys.map(() => '?').join(', ')})`).run(...(Object.values(row) as never[]));
  return row.id;
}

test('re-send: a failed lead goes to both inboxes 15 minutes later, marked as a re-send, and is recorded sent', async () => {
  const env = liveEnv();
  await failedLead(env, '2026-11-12T14:00:00Z');
  const w = makeWorld({ now: '2026-11-12T14:15:00Z' });
  assert.deepEqual(await runResend(env, w.deps), { sent: 1, failed: 0, skipped: 0 });
  const sent = gmail(w.calls);
  assert.equal(sent.length, 1);
  const { head, body, html } = decodeRaw(sent[0]);
  assert.match(head, /To: bswartz@pathfinderlaw\.com, mtruman@pathfinderlaw\.com/);
  assert.match(head, /Reply-To: pat@example\.com/);
  assert.match(head, /Subject: Website inquiry \(re-sent\) \(main form\)/);
  assert.match(body, /did not reach you when it was sent \(Nov 12, 2026, 9:00 AM\)\. This is the automatic re-send\./);
  assert.match(body, /my claim was denied/);
  assert.match(html, /automatic re-send/);
  const [row] = rows(env);
  assert.equal(row.delivery_status, 'sent');
  assert.equal(row.delivery_detail, 'resent');
  assert.equal(alerted(w.calls), false);
  // Nothing left to do: the next run sends nothing.
  resetTokenCache();
  const w2 = makeWorld({ now: '2026-11-12T14:30:00Z' });
  await runResend(env, w2.deps);
  assert.equal(gmail(w2.calls).length, 0);
});

test('re-send: a lead younger than 5 minutes is left alone (its own request may still be running)', async () => {
  const env = liveEnv();
  await failedLead(env, '2026-11-12T14:00:00Z');
  const w = makeWorld({ now: '2026-11-12T14:03:00Z' });
  await runResend(env, w.deps);
  assert.equal(gmail(w.calls).length, 0);
  assert.equal(rows(env)[0].delivery_status, 'failed');
});

test('re-send: a lead older than 24 hours is never re-sent, and its failed record is left as it is', async () => {
  const env = liveEnv();
  // Shaped like the Nov 9 lead the firm already called back: failed with http_500, days before this code.
  const id = insert(env, { created_at: '2026-11-09T18:10:14.645Z', delivery_at: '2026-11-09T18:10:20.466Z', delivery_detail: 'http_500' });
  for (const now of ['2026-11-12T15:00:00Z', '2026-11-13T15:00:00Z', '2026-12-01T15:00:00Z']) {
    resetTokenCache();
    const w = makeWorld({ now });
    assert.deepEqual(await runResend(env, w.deps), { sent: 0, failed: 0, skipped: 0 });
    assert.equal(w.calls.length, 0);
  }
  const [row] = rows(env);
  assert.equal(row.id, id);
  assert.equal(row.delivery_status, 'failed');
  assert.equal(row.delivery_detail, 'http_500');
  assert.equal(row.delivery_at, '2026-11-09T18:10:20.466Z');
  // The 24-hour edge: 23h59m old is re-sent, 24h01m old is not.
  const env2 = liveEnv();
  insert(env2, { created_at: '2026-11-11T15:01:00.000Z' });
  insert(env2, { created_at: '2026-11-11T14:59:00.000Z', email: 'old@example.com' });
  const w = makeWorld({ now: '2026-11-12T15:00:00Z' });
  assert.equal((await runResend(env2, w.deps)).sent, 1);
  assert.doesNotMatch(decodeRaw(gmail(w.calls)[0]).head, /old@example/);
});

test(`re-send: Gmail still down: at most ${RESEND_MAX_ATTEMPTS} tries, one alarm per run, and the daily check still lists it`, async () => {
  const env = liveEnv();
  await failedLead(env, '2026-11-12T14:00:00Z');
  const sends: number[] = [];
  for (let i = 1; i <= RESEND_MAX_ATTEMPTS + 2; i++) {
    resetTokenCache();
    const w = makeWorld({ now: new Date(Date.parse('2026-11-12T14:00:00Z') + i * 15 * 60_000).toISOString(), gmail: 500 });
    const r = await runResend(env, w.deps);
    sends.push(r.failed);
    assert.equal(alerted(w.calls), r.failed > 0);
  }
  assert.deepEqual(sends, [1, 1, 1, 0, 0]);
  const [row] = rows(env);
  assert.equal(row.delivery_status, 'failed');
  assert.equal(row.delivery_detail, 'http_500');
  resetTokenCache();
  const d = await buildDailyCheck(env, makeWorld({ now: '2026-11-13T12:30:00Z' }).deps);
  assert.ok(d);
  assert.match(d.body, /Pat Example/);
});

test('re-send: Gmail back on the second try: one email, then nothing more', async () => {
  const env = liveEnv();
  await failedLead(env, '2026-11-12T14:00:00Z');
  let w = makeWorld({ now: '2026-11-12T14:15:00Z', gmail: 500 });
  assert.equal((await runResend(env, w.deps)).failed, 1);
  resetTokenCache(); w = makeWorld({ now: '2026-11-12T14:30:00Z' });
  assert.equal((await runResend(env, w.deps)).sent, 1);
  resetTokenCache(); w = makeWorld({ now: '2026-11-12T14:45:00Z' });
  await runResend(env, w.deps);
  assert.equal(gmail(w.calls).length, 0);
  assert.equal(rows(env)[0].delivery_status, 'sent');
});

test('re-send: if the database update after a send fails, the next run fixes the record and sends nothing', async () => {
  const env = liveEnv();
  await failedLead(env, '2026-11-12T14:00:00Z');
  // Make the "mark sent" update fail once.
  const db = env.DB!;
  let breakUpdate = true;
  env.DB = { prepare: (sql: string) => (breakUpdate && sql.startsWith("UPDATE submissions SET delivery_status = 'sent'") ? { bind: () => ({ run: async () => { throw new Error('d1 down'); } }) } : db.prepare(sql)) } as never;
  const orig = console.error; console.error = () => {};
  let w = makeWorld({ now: '2026-11-12T14:15:00Z' });
  try { assert.equal((await runResend(env, w.deps)).sent, 1); } finally { console.error = orig; }
  assert.equal(rows(env)[0].delivery_status, 'failed');
  breakUpdate = false;
  resetTokenCache(); w = makeWorld({ now: '2026-11-12T14:30:00Z' });
  assert.deepEqual(await runResend(env, w.deps), { sent: 0, failed: 0, skipped: 1 });
  assert.equal(gmail(w.calls).length, 0);
  assert.equal(rows(env)[0].delivery_status, 'sent');
});

test('re-send: self-tests, bot-check failures, sent and skipped rows are never re-sent', async () => {
  const env = liveEnv();
  const at = '2026-11-12T14:00:00.000Z';
  insert(env, { created_at: at, is_test: 1, reason: 'self_test', turnstile: 'skipped' });
  insert(env, { created_at: at, outcome: 'screened', reason: 'trap_field', delivery_status: 'pending' });
  insert(env, { created_at: at, outcome: 'screened', reason: 'turnstile_failed', delivery_status: 'pending', turnstile: 'fail' });
  insert(env, { created_at: at, outcome: 'screened', reason: 'turnstile_wrong_hostname', delivery_status: 'pending', turnstile: 'wrong_hostname' });
  insert(env, { created_at: at, delivery_status: 'sent' });
  insert(env, { created_at: at, delivery_status: 'skipped' });
  const w = makeWorld({ now: '2026-11-12T14:15:00Z' });
  assert.deepEqual(await runResend(env, w.deps), { sent: 0, failed: 0, skipped: 0 });
  assert.equal(w.calls.length, 0);
});

test('re-send: a lead the Worker never finished (still pending) is sent, with no spam-filter note', async () => {
  const env = liveEnv();
  insert(env, { created_at: '2026-11-12T14:00:00.000Z', outcome: 'unsure', reason: 'pending', turnstile: 'skipped', delivery_status: 'pending' });
  const w = makeWorld({ now: '2026-11-12T14:15:00Z' });
  assert.equal((await runResend(env, w.deps)).sent, 1);
  const { head, body } = decodeRaw(gmail(w.calls)[0]);
  assert.doesNotMatch(head, /Screened/);
  assert.doesNotMatch(body, /spam filter/i);
  assert.match(body, /automatic re-send/);
});

test('re-send: a screened message keeps its [Screened] tag', async () => {
  const env = liveEnv();
  await failedLead(env, '2026-11-12T14:00:00Z', { fillMs: 500 });
  const w = makeWorld({ now: '2026-11-12T14:15:00Z' });
  await runResend(env, w.deps);
  assert.match(decodeRaw(gmail(w.calls)[0]).head, /Subject: \[Screened\] Website inquiry \(re-sent\)/);
});

test('re-send: with no settings store to count tries, nothing is sent', async () => {
  const env = liveEnv({ SETTINGS: undefined });
  await failedLead(env, '2026-11-12T14:00:00Z');
  const orig = console.error; console.error = () => {};
  const w = makeWorld({ now: '2026-11-12T14:15:00Z' });
  try { await runResend(env, w.deps); } finally { console.error = orig; }
  assert.equal(gmail(w.calls).length, 0);
});

test('re-send: runs from the every-15-minutes cron and writes no personal data to the logs', async () => {
  assert.equal(cronJob('*/15 * * * *'), 'resend');
  const env = liveEnv();
  await failedLead(env, '2026-11-12T14:00:00Z');
  const logs: string[] = [];
  const orig = console.error; console.error = (...a: unknown[]) => void logs.push(a.join(' '));
  try {
    let w = makeWorld({ now: '2026-11-12T14:15:00Z', gmail: 500 });
    assert.equal(await runScheduled('*/15 * * * *', env, w.deps), 'resend');
    resetTokenCache(); w = makeWorld({ now: '2026-11-12T14:30:00Z' });
    await runScheduled('*/15 * * * *', env, w.deps);
    assert.equal(gmail(w.calls).length, 1);
  } finally { console.error = orig; }
  assert.ok(logs.some((l) => l.includes('resend_failed')));
  assert.ok(logs.some((l) => l.includes('resend_sent')));
  assert.doesNotMatch(logs.join('\n'), /Pat|pat@example|555|claim was denied/);
});
