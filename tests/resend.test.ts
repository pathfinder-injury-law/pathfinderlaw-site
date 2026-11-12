import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { handleContact } from '../src/worker/contact.ts';
import { resetTokenCache } from '../src/worker/google.ts';
import { RESEND_BATCH, RESEND_MAX_ATTEMPTS, runResend } from '../src/worker/resend.ts';
import { buildDailyCheck } from '../src/worker/scheduled.ts';
import { cronJob, runScheduled } from '../src/worker/index.ts';
import { decodeRaw, goodInput, liveEnv, makeWorld, post } from './helpers.ts';

beforeEach(() => resetTokenCache());

const rows = (env: ReturnType<typeof liveEnv>) => env.sqlite.prepare('SELECT * FROM submissions ORDER BY created_at').all() as Record<string, any>[];
const gmail = (calls: { url: string }[]) => calls.filter((c) => c.url.includes('gmail.googleapis.com'));
const alerted = (calls: { url: string }[]) => calls.some((c) => c.url === 'https://hb.example/fail');
const quiet = async <T>(f: () => Promise<T>) => { const o = console.error; console.error = () => {}; try { return await f(); } finally { console.error = o; } };

// A database whose writes matching `breaks` throw, to stand in for D1 failing part way.
function breakWrites(env: ReturnType<typeof liveEnv>, breaks: (sql: string) => boolean) {
  const db = env.DB!;
  env.DB = { prepare: (sql: string) => (breaks(sql) ? { bind: () => ({ run: async () => { throw new Error('d1 down'); }, first: async () => { throw new Error('d1 down'); } }) } : db.prepare(sql)) } as never;
  return () => { env.DB = db; };
}

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

test('first send: the row is marked "sending" before Gmail is called, then "sent"', async () => {
  const env = liveEnv(); const w = makeWorld();
  const seen: string[] = [];
  const f = w.deps.fetch;
  w.deps.fetch = (async (url: string, init?: RequestInit) => {
    if (String(url).includes('gmail.googleapis.com')) seen.push(rows(env)[0].delivery_status);
    return f(url as never, init);
  }) as typeof fetch;
  await handleContact(post(goodInput()), env, w.deps);
  assert.deepEqual(seen, ['sending']);
  assert.equal(rows(env)[0].delivery_status, 'sent');
});

test('never twice: Gmail accepted the first send but the final update failed: not re-sent, daily check lists it', async () => {
  const env = liveEnv();
  const restore = breakWrites(env, (sql) => sql.startsWith('UPDATE submissions SET delivery_status = ?, delivery_at'));
  await quiet(() => handleContact(post(goodInput()), env, makeWorld({ now: '2026-11-12T14:00:00Z' }).deps));
  restore();
  assert.equal(rows(env)[0].delivery_status, 'sending');
  for (const t of ['14:15', '14:30', '15:00']) {
    resetTokenCache(); const w = makeWorld({ now: `2026-11-12T${t}:00Z` });
    assert.deepEqual(await runResend(env, w.deps), { sent: 0, failed: 0, skipped: 0 });
    assert.equal(gmail(w.calls).length, 0);
  }
  resetTokenCache();
  const d = await buildDailyCheck(env, makeWorld({ now: '2026-11-13T12:30:00Z' }).deps);
  assert.ok(d); assert.match(d.body, /Pat Example/);
});

test('never twice: the Worker stopped right after the send (row left "sending"): not re-sent', async () => {
  const env = liveEnv();
  insert(env, { created_at: '2026-11-12T14:00:00.000Z', delivery_status: 'sending' });
  const w = makeWorld({ now: '2026-11-12T14:15:00Z' });
  assert.deepEqual(await runResend(env, w.deps), { sent: 0, failed: 0, skipped: 0 });
  assert.equal(w.calls.length, 0);
});

test('never twice: a re-send Gmail accepted whose final update failed stays "sending" and is not sent again', async () => {
  const env = liveEnv();
  await failedLead(env, '2026-11-12T14:00:00Z');
  const restore = breakWrites(env, (sql) => sql.startsWith('UPDATE submissions SET delivery_status = ?, delivery_at'));
  let w = makeWorld({ now: '2026-11-12T14:15:00Z' });
  assert.equal((await quiet(() => runResend(env, w.deps))).sent, 1);
  restore();
  assert.equal(rows(env)[0].delivery_status, 'sending');
  resetTokenCache(); w = makeWorld({ now: '2026-11-12T14:30:00Z' });
  await runResend(env, w.deps);
  assert.equal(gmail(w.calls).length, 0);
});

test('never twice: if the row cannot be claimed (database down), nothing is sent', async () => {
  const env = liveEnv();
  await failedLead(env, '2026-11-12T14:00:00Z');
  breakWrites(env, (sql) => sql.includes('RETURNING id'));
  const w = makeWorld({ now: '2026-11-12T14:15:00Z' });
  assert.deepEqual(await quiet(() => runResend(env, w.deps)), { sent: 0, failed: 0, skipped: 1 });
  assert.equal(gmail(w.calls).length, 0);
});

test('bots: a Turnstile failure whose screening update failed (reason still "pending") is never emailed', async () => {
  const env = liveEnv();
  // Every update fails, so the row keeps the first-insert values: pending, unsure, reason 'pending'.
  const restore = breakWrites(env, (sql) => sql.startsWith('UPDATE'));
  const res = await quiet(() => handleContact(post(goodInput()), env, makeWorld({ now: '2026-11-12T14:00:00Z', turnstile: 'fail' }).deps));
  restore();
  assert.equal(res.status, 403);
  const [row] = rows(env);
  assert.equal(row.delivery_status, 'pending'); assert.equal(row.reason, 'pending');
  const w = makeWorld({ now: '2026-11-12T14:15:00Z' });
  assert.deepEqual(await runResend(env, w.deps), { sent: 0, failed: 0, skipped: 0 });
  assert.equal(w.calls.length, 0);
});

test('re-send: a screened-as-real lead left "pending" that never reached "sending" is sent', async () => {
  const env = liveEnv();
  insert(env, { created_at: '2026-11-12T14:00:00.000Z', delivery_status: 'pending' }); // reason 'clean', turnstile 'pass'
  const w = makeWorld({ now: '2026-11-12T14:15:00Z' });
  assert.equal((await runResend(env, w.deps)).sent, 1);
  const { head, body } = decodeRaw(gmail(w.calls)[0]);
  assert.doesNotMatch(head, /Screened/);
  assert.match(body, /automatic re-send/);
  assert.equal(rows(env)[0].delivery_status, 'sent');
});

test(`batch: rows out of tries do not use up the ${RESEND_BATCH}-send batch, so a newer lead still goes out`, async () => {
  const env = liveEnv();
  const old: string[] = [];
  for (let i = 0; i < RESEND_BATCH + 2; i++) old.push(insert(env, { created_at: `2026-11-12T10:${String(i).padStart(2, '0')}:00.000Z`, email: `old${i}@example.com` }));
  for (const id of old) await env.SETTINGS!.put!(`resend:${id}`, JSON.stringify({ n: RESEND_MAX_ATTEMPTS }));
  insert(env, { created_at: '2026-11-12T14:00:00.000Z', email: 'new@example.com' });
  const w = makeWorld({ now: '2026-11-12T14:15:00Z' });
  assert.deepEqual(await runResend(env, w.deps), { sent: 1, failed: 0, skipped: RESEND_BATCH + 2 });
  assert.match(decodeRaw(gmail(w.calls)[0]).head, /Reply-To: new@example\.com/);
});

test(`batch: at most ${RESEND_BATCH} sends per run; the rest go out on the next run`, async () => {
  const env = liveEnv();
  for (let i = 0; i < RESEND_BATCH + 5; i++) insert(env, { created_at: `2026-11-12T13:${String(i).padStart(2, '0')}:00.000Z`, email: `p${i}@example.com` });
  let w = makeWorld({ now: '2026-11-12T14:15:00Z' });
  assert.equal((await runResend(env, w.deps)).sent, RESEND_BATCH);
  resetTokenCache(); w = makeWorld({ now: '2026-11-12T14:30:00Z' });
  assert.equal((await runResend(env, w.deps)).sent, 5);
  assert.equal(rows(env).filter((r) => r.delivery_status === 'sent').length, RESEND_BATCH + 5);
});

test('never twice: a row that changes after it is read (its own request finished) is not claimed or sent', async () => {
  const env = liveEnv();
  await failedLead(env, '2026-11-12T14:00:00Z');
  const db = env.DB!;
  env.DB = { prepare: (sql: string) => {
    if (sql.includes('RETURNING id')) env.sqlite.prepare("UPDATE submissions SET delivery_status = 'sent'").run();
    return db.prepare(sql);
  } } as never;
  const w = makeWorld({ now: '2026-11-12T14:15:00Z' });
  assert.deepEqual(await runResend(env, w.deps), { sent: 0, failed: 0, skipped: 1 });
  assert.equal(gmail(w.calls).length, 0);
});
