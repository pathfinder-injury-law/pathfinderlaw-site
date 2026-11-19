import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { handleContact } from '../src/worker/contact.ts';
import { resetTokenCache } from '../src/worker/google.ts';
import { runScheduled } from '../src/worker/index.ts';
import { buildDailyCheck, runSelfTest } from '../src/worker/scheduled.ts';
import { SHEET_MAX_TRIES, runSheetRetry } from '../src/worker/sheet.ts';
import { goodInput, liveEnv, makeDb, makeWorld, post } from './helpers.ts';

// Made-up values only. The repo is public: no real person's details in tests.
const URL_ = 'https://intake.example/exec';
const SECRET = 'test-secret-not-real';
const on = (extra = {}) => liveEnv({ INTAKE_URL: URL_, INTAKE_SECRET: SECRET, ...extra });

beforeEach(() => resetTokenCache());

type Reply = 'ok' | 'down' | 'html' | 'wrong' | 'bad_signature' | number;
// makeWorld plus a scripted Intake web app. Replies are used one per call; the last one repeats.
function world(opts: Parameters<typeof makeWorld>[0] & { sheet?: Reply | Reply[] } = {}) {
  const w = makeWorld(opts);
  const replies = Array.isArray(opts.sheet) ? opts.sheet : [opts.sheet ?? 'ok'];
  const posts: { body: string; redirect?: string }[] = [];
  const inner = w.deps.fetch;
  w.deps.fetch = (async (url: string, init: RequestInit = {}) => {
    if (String(url) !== URL_) return inner(url, init);
    const body = String(init.body);
    posts.push({ body, redirect: init.redirect });
    const r = replies[Math.min(posts.length - 1, replies.length - 1)];
    const leadId = JSON.parse(JSON.parse(body).payload).LeadID;
    if (r === 'down') throw new Error('network');
    if (typeof r === 'number') return new Response('', { status: r });
    if (r === 'html') return new Response('<html>Sign in to Google</html>', { status: 200 });
    if (r === 'wrong') return Response.json({ ok: true, leadId: 'someone-else', result: 'created' });
    if (r === 'bad_signature') return Response.json({ ok: false, error: 'bad_signature' });
    return Response.json({ ok: true, leadId, result: 'created' });
  }) as typeof fetch;
  return { ...w, posts };
}

const rows = (env: ReturnType<typeof liveEnv>) => env.sqlite.prepare('SELECT * FROM submissions ORDER BY created_at').all() as Record<string, any>[];
const gmail = (calls: { url: string }[]) => calls.filter((c) => c.url.includes('gmail.googleapis.com'));
const alerts = (calls: { url: string }[]) => calls.filter((c) => c.url === 'https://hb.example/fail').length;
const quiet = async <T>(f: () => Promise<T>) => { const o = console.error; console.error = () => {}; try { return await f(); } finally { console.error = o; } };
const intake = { how: 'accident', when: 'sixMonths', work: 'virginia', surgery: 'yes', missedWork: 'yes' };
const send = (env: ReturnType<typeof liveEnv>, w: ReturnType<typeof world>, o: Record<string, unknown> = {}) =>
  quiet(() => handleContact(post(goodInput(o)), env, w.deps));

test('sheet: off by default; with no secrets nothing is posted and the row is not marked for the sheet', async () => {
  const env = liveEnv();
  const w = world();
  const res = await send(env, w, { intake, message: '' });
  assert.equal(res.status, 200);
  assert.equal(w.posts.length, 0);
  assert.equal(gmail(w.calls).length, 1);
  const [row] = rows(env);
  assert.equal(row.sheet_status, null);
  assert.equal(row.route, 'priority'); // the sorting tag is kept either way
  // The cron retry does nothing while off.
  assert.deepEqual(await runSheetRetry(env, world({ now: '2026-11-03T16:00:00Z' }).deps), { sent: 0, failed: 0 });
});

test('sheet: a lead is emailed as before, then posted once, signed, with the Intake columns', async () => {
  const env = on();
  const w = world();
  const res = await send(env, w, { intake, message: 'Fell off a ladder.' });
  assert.equal(res.status, 200);
  assert.equal(gmail(w.calls).length, 1);
  assert.equal(w.posts.length, 1);
  assert.equal(w.posts[0].redirect, 'follow');
  const env1 = JSON.parse(w.posts[0].body);
  assert.equal(env1.v, 1);
  assert.equal(env1.ts, Math.floor(Date.parse('2026-11-03T15:00:00Z') / 1000));
  assert.equal(env1.sig, createHmac('sha256', SECRET).update(`${env1.ts}.${env1.payload}`).digest('hex'));
  const p = JSON.parse(env1.payload);
  const [row] = rows(env);
  assert.deepEqual(Object.keys(p), ['LeadID', 'ReceivedAt', 'Name', 'Phone', 'Email', 'Source', 'DOI', 'Employer', 'Summary', 'Status']);
  assert.equal(p.LeadID, row.id);
  assert.equal(p.ReceivedAt, '2026-11-03T15:00:00.000Z');
  assert.equal(p.Name, 'Pat Example');
  assert.equal(p.Phone, '(804) 555-0100');
  assert.equal(p.Email, 'pat@example.com');
  assert.equal(p.Source, 'Website');
  assert.equal(p.DOI, '1 to 6 months ago');
  assert.equal(p.Employer, 'A private company, or a city or county government, in Virginia');
  assert.match(p.Summary, /^PRIORITY case\n\nHow hurt: An accident at work\n/);
  assert.match(p.Summary, /What happened and when:\nFell off a ladder\.$/);
  assert.equal(p.Status, 'New');
  assert.equal(row.sheet_status, 'sent');
  assert.equal(row.sheet_tries, 1);
  assert.equal(row.sheet_detail, null);
  assert.equal(row.delivery_status, 'sent'); // the email record is untouched
});

test('sheet: a plain message (no step-by-step answers) has blank DOI and Employer and no tag', async () => {
  const env = on();
  const w = world();
  await send(env, w);
  const p = JSON.parse(JSON.parse(w.posts[0].body).payload);
  assert.equal(p.DOI, '');
  assert.equal(p.Employer, '');
  assert.equal(p.Summary, 'I hurt my back at work in Richmond and my claim was denied.');
});

test('sheet: a screened message that is still emailed goes as Status Screened; bots and the self-test never go', async () => {
  const env = on();
  const w = world();
  await send(env, w, { fillMs: 500 }); // too fast: screened, still emailed
  assert.equal(JSON.parse(JSON.parse(w.posts[0].body).payload).Status, 'Screened');
  await send(env, w, { company: 'bot' }); // trap field: not emailed
  await send(env, world({ turnstile: 'fail' }), {}); // Turnstile says not human
  await quiet(() => runSelfTest(env, w.deps));
  assert.equal(w.posts.length, 1);
  const statuses = rows(env).map((r) => r.sheet_status);
  assert.deepEqual(statuses.filter(Boolean), ['sent']);
});

test('sheet: preview mode posts nothing even if the secrets were present', async () => {
  const env = on({ PREVIEW_MODE: '1' });
  const w = world();
  const res = await send(env, w);
  assert.equal(res.status, 200);
  assert.equal(w.posts.length, 0);
  assert.equal(rows(env).length, 0);
});

test('sheet: in the Worker the push runs after the answer (waitUntil), not before it', async () => {
  const env = on();
  const w = world();
  const waits: Promise<unknown>[] = [];
  const res = await quiet(() => handleContact(post(goodInput()), env, w.deps, { waitUntil: (p) => void waits.push(p) }));
  assert.equal(res.status, 200);
  assert.equal(waits.length, 1);
  await waits[0];
  assert.equal(rows(env)[0].sheet_status, 'sent');
});

test('sheet: if the sheet is down the visitor and the email are unaffected, nobody is paged, and the cron retries it', async () => {
  const env = on();
  const w = world({ sheet: 'down' });
  const res = await send(env, w);
  assert.equal(res.status, 200);
  assert.equal(gmail(w.calls).length, 1);
  assert.equal(alerts(w.calls), 0);
  assert.equal(rows(env)[0].sheet_status, 'failed');
  assert.equal(rows(env)[0].sheet_detail, 'network');
  // Too soon (under 5 minutes): left alone.
  const early = world({ now: '2026-11-03T15:03:00Z' });
  await quiet(() => runSheetRetry(env, early.deps));
  assert.equal(early.posts.length, 0);
  // The 15-minute cron picks it up and it lands; the email is not sent again.
  const later = world({ now: '2026-11-03T15:15:00Z' });
  await quiet(() => runScheduled('*/15 * * * *', env, later.deps));
  assert.equal(later.posts.length, 1);
  assert.equal(gmail(later.calls).length, 0);
  const [row] = rows(env);
  assert.equal(row.sheet_status, 'sent');
  assert.equal(row.sheet_tries, 2);
  // Same LeadID on the retry, so the sheet's dedupe can never add a second row.
  assert.equal(JSON.parse(JSON.parse(later.posts[0].body).payload).LeadID, row.id);
});

test('sheet: a lead whose email failed still reaches the sheet', async () => {
  const env = on();
  const w = world({ gmail: 500 });
  const res = await send(env, w);
  assert.equal(res.status, 502); // the visitor still sees the phone number, as before
  assert.equal(w.posts.length, 1);
  assert.equal(rows(env)[0].sheet_status, 'sent');
  assert.equal(rows(env)[0].delivery_status, 'failed'); // and the email re-send will still pick it up
});

test('sheet: only {"ok":true} with the same LeadID counts; a sign-in page or a setup error pings the alarm at most every 6 hours', async () => {
  for (const [reply, code, paged] of [['html', 'not_json', 1], ['wrong', 'wrong_lead', 1], ['bad_signature', 'app_bad_signature', 1], [500, 'http_500', 0], [403, 'http_403', 1]] as const) {
    const env = on();
    const w = world({ sheet: reply });
    await send(env, w);
    await send(env, w, { email: 'sam@example.com', name: 'Sam Example' });
    const rs = rows(env);
    assert.deepEqual(rs.map((r) => [r.sheet_status, r.sheet_detail]), [['failed', code], ['failed', code]], String(reply));
    assert.equal(alerts(w.calls), paged, `${reply}: one ping for two failures`);
  }
});

test('sheet: after the last try the row is given up and the daily check asks for it to be added by hand', async () => {
  const env = on();
  await send(env, world({ sheet: 'down', now: '2026-11-03T15:00:00Z' }));
  for (let i = 1; i < SHEET_MAX_TRIES + 2; i++) {
    const at = new Date(Date.parse('2026-11-03T15:00:00Z') + i * 15 * 60_000).toISOString();
    await quiet(() => runSheetRetry(env, world({ sheet: 'down', now: at }).deps));
  }
  const [row] = rows(env);
  assert.equal(row.sheet_status, 'gave_up');
  assert.equal(row.sheet_tries, SHEET_MAX_TRIES);
  // No more tries after giving up.
  const after = world({ now: '2026-11-03T20:00:00Z' });
  await quiet(() => runSheetRetry(env, after.deps));
  assert.equal(after.posts.length, 0);
  const email = await buildDailyCheck(env, world({ now: '2026-11-04T12:30:00Z' }).deps);
  assert.ok(email);
  assert.equal(email.subject, 'Website form: messages did not reach the Intake sheet');
  assert.match(email.body, /One website message from yesterday did not reach the Intake sheet\. It still reached your inbox by email\./);
  assert.match(email.body, /- Pat Example \(sent Nov 3, 2026, 10:00 AM\)/);
  assert.doesNotMatch(email.body, /pat@example\.com|555-0100/); // the inbox already has the details
});

test('sheet: a normal day with every lead in the sheet sends no daily email', async () => {
  const env = on();
  await send(env, world());
  assert.equal(await buildDailyCheck(env, world({ now: '2026-11-04T12:30:00Z' }).deps), null);
});

test('sheet: before migration 0002 is applied, email and daily check work as before and the push happens once, untracked', async () => {
  const db = makeDb('0001_create_submissions.sql');
  const env = on({ DB: db, sqlite: db.sqlite });
  const w = world();
  const res = await send(env, w, { intake, message: '' });
  assert.equal(res.status, 200);
  assert.equal(gmail(w.calls).length, 1);
  assert.equal(w.posts.length, 1);
  const [row] = rows(env);
  assert.equal(row.delivery_status, 'sent');
  assert.equal('sheet_status' in row, false);
  assert.deepEqual(await quiet(() => runSheetRetry(env, world({ now: '2026-11-03T16:00:00Z' }).deps)), { sent: 0, failed: 0 });
  assert.equal(await buildDailyCheck(env, world({ now: '2026-11-04T12:30:00Z' }).deps), null);
});

test('sheet: no personal data or response text reaches the logs on any sheet path', async () => {
  const logged: string[] = [];
  const orig = console.error;
  console.error = (...a) => void logged.push(a.join(' '));
  try {
    for (const reply of ['ok', 'down', 'html', 'wrong', 'bad_signature', 500] as const) {
      const env = on();
      await handleContact(post(goodInput({ intake, message: 'Fell off a ladder.' })), env, world({ sheet: reply }).deps);
      await runSheetRetry(env, world({ sheet: reply, now: '2026-11-03T15:20:00Z' }).deps);
    }
  } finally {
    console.error = orig;
  }
  const all = logged.join('\n');
  assert.ok(all.includes('sheet_'));
  for (const s of ['Pat Example', 'pat@example.com', '555-0100', 'ladder', 'Sign in', SECRET, 'intake.example']) assert.equal(all.includes(s), false, s);
});
