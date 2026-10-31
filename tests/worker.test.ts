import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { handleContact } from '../src/worker/contact.ts';
import { resetTokenCache } from '../src/worker/google.ts';
import { decide, findLinkHosts } from '../src/worker/screen.ts';
import { buildDailyCheck, etDayRange, runDailyCheck, runPurge, runSelfTest } from '../src/worker/scheduled.ts';
import { validate } from '../src/worker/validate.ts';
import { route } from '../src/worker/intake.ts';
import { cronJob, runScheduled } from '../src/worker/index.ts';
import { STARTER_RULES, decodeRaw, goodInput, liveEnv, makeKv, makeWorld, post } from './helpers.ts';

beforeEach(() => resetTokenCache());

const rows = (env: ReturnType<typeof liveEnv>) => env.sqlite.prepare('SELECT * FROM submissions ORDER BY created_at').all() as Record<string, any>[];
const gmail = (calls: { url: string }[]) => calls.filter((c) => c.url.includes('gmail.googleapis.com'));

// ---------- validation ----------
test('validation rejects a missing acknowledgement and bad fields', () => {
  assert.deepEqual(validate(goodInput({ acknowledged: false })), { ok: false, error: 'acknowledgement_required' });
  assert.deepEqual(validate(goodInput({ acknowledged: 'true' })), { ok: false, error: 'acknowledgement_required' });
  assert.equal((validate(goodInput({ email: 'nope' })) as any).error, 'invalid_email');
  assert.equal((validate(goodInput({ email: 'a@b.com\r\nBcc: x@y.com' })) as any).error, 'invalid_email');
  assert.equal((validate(goodInput({ phone: '12' })) as any).error, 'invalid_phone');
  assert.equal((validate(goodInput({ message: '  ' })) as any).error, 'invalid_message');
  assert.equal((validate(goodInput({ form: 'other' })) as any).error, 'invalid_form');
  assert.equal(validate(goodInput()).ok, true);
});

// ---------- screening rules ----------
const sub = (message: string, email = 'pat@example.com') => ({ ...(validate(goodInput({ message, email })) as any).value });
test('screening: clean message is a lead', () => {
  assert.equal(decide(sub('Please call me about my case.'), STARTER_RULES, 0).outcome, 'lead');
});
test('screening: agency phrase alone is screened; with case words it is unsure', () => {
  assert.equal(decide(sub('We offer a virtual assistant for your firm'), STARTER_RULES, 0).outcome, 'screened');
  assert.equal(decide(sub('Our SEO packages are cheap'), STARTER_RULES, 0).outcome, 'screened');
  assert.equal(decide(sub('I hurt my back; my virtual assistant said call you'), STARTER_RULES, 0).outcome, 'unsure');
});
test('screening: "VA", Seoul and phone country are not signals', () => {
  assert.equal(decide(sub('I live in Norfolk, VA and need a lawyer'), STARTER_RULES, 0).outcome, 'lead');
  assert.equal(decide(sub('I moved here from Seoul last year'), STARTER_RULES, 0).outcome, 'lead');
});
test('screening: one non-agency link is unsure; many links without case words are screened', () => {
  assert.equal(decide(sub('Here is the news story https://wtvr.com/story/123 about it'), STARTER_RULES, 0).outcome, 'unsure');
  assert.equal(decide(sub('see a.com b.com c.com'), STARTER_RULES, 0).outcome, 'screened');
  assert.equal(decide(sub('I was injured. a.com b.com c.com'), STARTER_RULES, 0).outcome, 'unsure');
});
test('screening: agency domain screens even with case words, as sender or link', () => {
  assert.equal(decide(sub('I was injured at work', 'x@example-agency.com'), STARTER_RULES, 0).reason, 'agency_domain');
  assert.equal(decide(sub('I was injured at work www.example-agency.com/x'), STARTER_RULES, 0).reason, 'agency_domain');
});
test('screening: repeat senders', () => {
  assert.equal(decide(sub('hello'), STARTER_RULES, 3).reason, 'repeat_sender');
  assert.equal(decide(sub('my injury'), STARTER_RULES, 3).outcome, 'unsure');
});
test('email addresses in a message are not links', () => {
  assert.deepEqual(findLinkHosts('write me at pat@example.com'), []);
});

// ---------- the form endpoint ----------
test('valid lead: logged, emailed to both inboxes with Reply-To, no [Screened]', async () => {
  const env = liveEnv(); const { deps, calls } = makeWorld();
  const res = await handleContact(post(goodInput()), env, deps);
  assert.equal(res.status, 200);
  const [row] = rows(env);
  assert.equal(row.outcome, 'lead'); assert.equal(row.delivery_status, 'sent'); assert.equal(row.turnstile, 'pass');
  assert.equal(row.form, 'main');
  const sent = gmail(calls); assert.equal(sent.length, 1);
  const { head, body } = decodeRaw(sent[0]);
  assert.match(head, /To: bswartz@pathfinderlaw.com, mtruman@pathfinderlaw.com/);
  assert.match(head, /Reply-To: pat@example.com/);
  assert.doesNotMatch(head, /Screened/);
  assert.match(body, /my claim was denied/);
  // A clean lead holds only the four fields, nothing above or below.
  assert.match(body, /^Name: .+\r?\nEmail: pat@example\.com\r?\nPhone: .+\r?\n\r?\nMessage:\r?\n/);
  assert.doesNotMatch(body, /Form:|Screening:|Bot check|Reference:|Reply to this email|attorney-client/);
  assert.doesNotMatch(body, /conflict protections|written agreement/);
});

test('sidebar form is recorded as sidebar', async () => {
  const env = liveEnv(); const { deps } = makeWorld();
  await handleContact(post(goodInput({ form: 'sidebar' })), env, deps);
  assert.equal(rows(env)[0].form, 'sidebar');
});

test('trap field: logged as screened, not emailed, bot sees success', async () => {
  const env = liveEnv(); const { deps, calls } = makeWorld();
  const res = await handleContact(post(goodInput({ company: 'Acme SEO' })), env, deps);
  assert.equal(res.status, 200);
  const [row] = rows(env);
  assert.equal(row.outcome, 'screened'); assert.equal(row.reason, 'trap_field'); assert.equal(row.delivery_status, 'skipped');
  assert.equal(gmail(calls).length, 0);
});

test('missing acknowledgement: rejected, nothing stored or sent', async () => {
  const env = liveEnv(); const { deps, calls } = makeWorld();
  const res = await handleContact(post(goodInput({ acknowledged: false })), env, deps);
  assert.equal(res.status, 400);
  assert.equal(rows(env).length, 0); assert.equal(gmail(calls).length, 0);
});

test('Turnstile failure: logged, not emailed, refused', async () => {
  const env = liveEnv(); const { deps, calls } = makeWorld({ turnstile: 'fail' });
  const res = await handleContact(post(goodInput()), env, deps);
  assert.equal(res.status, 403);
  const [row] = rows(env);
  assert.equal(row.reason, 'turnstile_failed'); assert.equal(row.turnstile, 'fail'); assert.equal(gmail(calls).length, 0);
});

test('Turnstile outage does not block a real person: delivered, marked spam check unavailable', async () => {
  const env = liveEnv(); const { deps, calls } = makeWorld({ turnstile: 'down' });
  const res = await handleContact(post(goodInput()), env, deps);
  assert.equal(res.status, 200);
  assert.equal(rows(env)[0].turnstile, 'error'); assert.equal(gmail(calls).length, 1);
  const { head, body } = decodeRaw(gmail(calls)[0]);
  assert.match(head, /Subject: Website inquiry \(main form\) - spam check unavailable/);
  assert.match(body, /The spam check was down when this was sent/);
  assert.match(body, /my claim was denied/);
});

test('Turnstile token for another hostname: stored as screened, not emailed, refused', async () => {
  const env = liveEnv(); const { deps, calls } = makeWorld({ hostname: 'evil.example' });
  const res = await handleContact(post(goodInput()), env, deps);
  assert.equal(res.status, 403);
  const [row] = rows(env);
  assert.equal(row.outcome, 'screened'); assert.equal(row.reason, 'turnstile_wrong_hostname');
  assert.equal(row.turnstile, 'wrong_hostname'); assert.equal(row.delivery_status, 'skipped');
  assert.equal(gmail(calls).length, 0);
});

test('ALLOWED_HOSTNAMES: default allows pathfinderlaw.com and www; the var can add a test hostname', async () => {
  for (const host of ['pathfinderlaw.com', 'WWW.pathfinderlaw.com']) {
    const env = liveEnv(); const { deps, calls } = makeWorld({ hostname: host });
    assert.equal((await handleContact(post(goodInput()), env, deps)).status, 200, host);
    assert.equal(gmail(calls).length, 1);
  }
  const env = liveEnv({ ALLOWED_HOSTNAMES: 'pathfinderlaw.com, www.pathfinderlaw.com, launch-test.example.workers.dev' });
  const ok = makeWorld({ hostname: 'launch-test.example.workers.dev' });
  assert.equal((await handleContact(post(goodInput()), env, ok.deps)).status, 200);
  const no = makeWorld({ hostname: 'other.example.workers.dev' });
  assert.equal((await handleContact(post(goodInput({ email: 'x@example.com' })), env, no.deps)).status, 403);
});

test('clean lead email leaves out the Turnstile line; the subject is plain', async () => {
  const env = liveEnv(); const { deps, calls } = makeWorld();
  await handleContact(post(goodInput()), env, deps);
  const { head, body } = decodeRaw(gmail(calls)[0]);
  assert.doesNotMatch(body, /Bot check/);
  assert.match(head, /Subject: Website inquiry \(main form\)\r?\n/);
});

test('missing TURNSTILE_SECRET: lead still delivered, marked, alarm pinged at most once an hour', async () => {
  const logged: string[] = [];
  const orig = console.error; console.error = (...a) => void logged.push(a.join(' '));
  try {
    const kv = makeKv(JSON.stringify(STARTER_RULES));
    const env = liveEnv({ TURNSTILE_SECRET: undefined, SETTINGS: kv }); const { deps, calls } = makeWorld();
    const res = await handleContact(post(goodInput()), env, deps);
    assert.equal(res.status, 200);
    const [row] = rows(env);
    assert.equal(row.turnstile, 'not_configured'); assert.equal(row.delivery_status, 'sent'); assert.equal(row.outcome, 'lead');
    const { head, body } = decodeRaw(gmail(calls)[0]);
    assert.match(head, /Subject: Website inquiry \(main form\) - TURNSTILE NOT CONFIGURED/);
    assert.match(body, /The spam check is not set up on the website/);
    assert.ok(!calls.some((c) => c.url.includes('siteverify')));
    const alerts = () => calls.filter((c) => c.url === 'https://hb.example/fail').length;
    assert.equal(alerts(), 1);
    assert.deepEqual(kv.puts, [{ key: 'alert-sent:turnstile_not_configured', ttl: 3600 }]);
    assert.match(logged.join('\n'), /"event":"turnstile_not_configured"/);
    // A second lead within the hour is delivered too, without a second alarm.
    await handleContact(post(goodInput({ email: 'second@example.com' })), env, deps);
    assert.equal(gmail(calls).length, 2); assert.equal(alerts(), 1);
  } finally { console.error = orig; }
});

test('missing TURNSTILE_SECRET with the settings store down: still delivered and alarm still pinged', async () => {
  const env = liveEnv({ TURNSTILE_SECRET: undefined, SETTINGS: makeKv('throw') }); const { deps, calls } = makeWorld();
  assert.equal((await handleContact(post(goodInput()), env, deps)).status, 200);
  assert.equal(gmail(calls).length, 1);
  assert.ok(calls.some((c) => c.url === 'https://hb.example/fail'));
});

test('too fast: emailed with [Screened]', async () => {
  const env = liveEnv(); const { deps, calls } = makeWorld();
  await handleContact(post(goodInput({ fillMs: 800 })), env, deps);
  assert.equal(rows(env)[0].reason, 'too_fast');
  assert.match(decodeRaw(gmail(calls)[0]).head, /Subject: \[Screened\]/);
});

test('screened by rule: emailed to both inboxes with [Screened]', async () => {
  const env = liveEnv(); const { deps, calls } = makeWorld();
  await handleContact(post(goodInput({ message: 'We provide a virtual assistant and SEO for law firms' })), env, deps);
  const [row] = rows(env);
  assert.equal(row.outcome, 'screened'); assert.equal(row.delivery_status, 'sent');
  assert.match(decodeRaw(gmail(calls)[0]).head, /Subject: \[Screened\] Website inquiry/);
});

for (const [label, kv] of [['missing', null], ['unreadable', 'throw'], ['not JSON', '{oops'], ['wrong shape', '{"agencyDomains":1}']] as const) {
  test(`rules store ${label}: unsure, still emailed as a lead`, async () => {
    const env = liveEnv({ SETTINGS: makeKv(kv) }); const { deps, calls } = makeWorld();
    const res = await handleContact(post(goodInput()), env, deps);
    assert.equal(res.status, 200);
    const [row] = rows(env);
    assert.equal(row.outcome, 'unsure'); assert.equal(row.reason, 'rules_error');
    assert.doesNotMatch(decodeRaw(gmail(calls)[0]).head, /Screened/);
  });
}

test('Gmail send failure: row kept as failed, phone-number failure response, alert pinged', async () => {
  const env = liveEnv(); const { deps, calls } = makeWorld({ gmail: 500 });
  const res = await handleContact(post(goodInput()), env, deps);
  assert.equal(res.status, 502);
  assert.equal(((await res.json()) as any).phone, '804-505-0633');
  const [row] = rows(env);
  assert.equal(row.delivery_status, 'failed'); assert.equal(row.delivery_detail, 'http_500');
  assert.ok(calls.some((c) => c.url === 'https://hb.example/fail'));
});

test('Google authorization failure: alert pinged immediately', async () => {
  const env = liveEnv(); const { deps, calls } = makeWorld({ token: 401 });
  const res = await handleContact(post(goodInput()), env, deps);
  assert.equal(res.status, 502);
  assert.equal(rows(env)[0].delivery_detail, 'auth');
  assert.ok(calls.some((c) => c.url === 'https://hb.example/fail'));
});

test('database down: lead is still emailed (flagged not saved) and the alarm fires', async () => {
  const env = liveEnv({ DB: undefined }); const { deps, calls } = makeWorld();
  const res = await handleContact(post(goodInput()), env, deps);
  assert.equal(res.status, 200);
  assert.match(decodeRaw(gmail(calls)[0]).body, /not saved in the form log\. This email is the only copy/);
  assert.ok(calls.some((c) => c.url === 'https://hb.example/fail'));
});

test('signs a real RS256 JWT for admin@ with only the gmail.send scope', async () => {
  const env = liveEnv(); const { deps, calls } = makeWorld();
  await handleContact(post(goodInput()), env, deps);
  const tokenCall = calls.find((c) => c.url.includes('oauth2'))!;
  const jwt = new URLSearchParams(tokenCall.body).get('assertion')!;
  const claims = JSON.parse(Buffer.from(jwt.split('.')[1], 'base64url').toString());
  assert.equal(claims.sub, 'admin@pathfinderlaw.com');
  assert.equal(claims.scope, 'https://www.googleapis.com/auth/gmail.send');
  assert.equal(claims.iss, 'forms-sender@example.iam.gserviceaccount.com');
  assert.equal(JSON.parse(Buffer.from(jwt.split('.')[0], 'base64url').toString()).alg, 'RS256');
  assert.equal(gmail(calls)[0].auth, 'Bearer tok');
});

test('preview mode: validates, stores nothing, sends nothing, writes no personal data to logs', async () => {
  const logged: string[] = [];
  const orig = console.error; console.error = (...a) => void logged.push(a.join(' '));
  try {
    const env = { PREVIEW_MODE: '1' } as any; const { deps, calls } = makeWorld();
    const ok = await handleContact(post(goodInput()), env, deps);
    const body = (await ok.json()) as any;
    assert.equal(ok.status, 200); assert.equal(body.preview, true); assert.match(body.message, /nothing was sent/);
    assert.equal(gmail(calls).length, 0);
    assert.equal((await handleContact(post(goodInput({ acknowledged: false })), env, deps)).status, 400);
    assert.equal((await handleContact(post(goodInput({ turnstileToken: '' })), env, deps)).status, 403);
    assert.ok(calls.every((c) => c.url.includes('siteverify')));
    assert.doesNotMatch(logged.join('\n'), /Pat Example|pat@example|804-555|hurt my back/);
  } finally { console.error = orig; }
});

test('no personal data reaches the logs on any failure path', async () => {
  const logged: string[] = [];
  const orig = console.error; console.error = (...a) => void logged.push(a.join(' '));
  try {
    for (const w of [{ gmail: 500 }, { token: 401 }]) {
      const env = liveEnv(); const { deps } = makeWorld(w);
      await handleContact(post(goodInput()), env, deps);
    }
    await handleContact(post(goodInput()), liveEnv({ DB: undefined, SETTINGS: makeKv('throw') }), makeWorld().deps);
    assert.ok(logged.length > 0);
    assert.doesNotMatch(logged.join('\n'), /Pat Example|pat@example|804-555|hurt my back/);
  } finally { console.error = orig; }
});

test('rejects non-JSON content type and non-POST', async () => {
  const env = liveEnv(); const { deps } = makeWorld();
  const form = new Request('https://x.test/api/contact', { method: 'POST', headers: { 'content-type': 'text/plain' }, body: '{}' });
  assert.equal((await handleContact(form, env, deps)).status, 415);
  assert.equal((await handleContact(new Request('https://x.test/api/contact'), env, deps)).status, 405);
});

// ---------- scheduled jobs ----------
test('Eastern day ranges handle standard and daylight time', () => {
  assert.equal(etDayRange(new Date('2026-11-03T12:30:00Z'), 1).start, '2026-11-02T05:00:00.000Z'); // after Nov 1: EST
  assert.equal(etDayRange(new Date('2026-10-28T12:30:00Z'), 1).start, '2026-10-27T04:00:00.000Z'); // EDT
});

test('self-test sends a tagged message and pings the heartbeat only when delivered', async () => {
  const env = liveEnv(); let w = makeWorld();
  assert.equal(await runSelfTest(env, w.deps), true);
  const { head } = decodeRaw(gmail(w.calls)[0]);
  assert.match(head, /Subject: \[Form Test [a-z0-9-]+\]/);
  // Only the sending mailbox gets it, not the people who watch the inboxes.
  assert.match(head, /To: admin@pathfinderlaw\.com\r?\n/);
  assert.ok(w.calls.some((c) => c.url === 'https://hb.example/ping'));
  assert.equal(rows(env)[0].is_test, 1);

  resetTokenCache(); w = makeWorld({ gmail: 500 });
  assert.equal(await runSelfTest(liveEnv(), w.deps), false);
  assert.ok(!w.calls.some((c) => c.url === 'https://hb.example/ping'));
});

test('lead email: a styled copy with the sorting tag, tap-to-call, answers, and everything typed escaped', async () => {
  const env = liveEnv(); const { deps, calls } = makeWorld();
  const intake = { how: 'accident', work: 'virginia', surgery: 'yes', missedWork: 'yes' };
  await handleContact(post(goodInput({ name: 'Pat <b>Example</b>', intake, message: 'Fell <script>x</script>' })), env, deps);
  const { head, html } = decodeRaw(gmail(calls)[0]);
  assert.match(head, /multipart\/alternative/);
  assert.match(html, /PRIORITY CASE/);
  assert.match(html, /href="tel:\+18045550100"[^>]*>Call</);
  assert.match(html, /href="sms:\+18045550100"[^>]*>Text</);
  assert.match(html, /What happened and when<\/div><div style="color:#294634;font-size:16px;font-weight:700">Fell &lt;script&gt;/);
  assert.match(html, /href="mailto:pat@example\.com"/);
  assert.match(html, /Surgery had or recommended/);
  assert.match(html, /Pat &lt;b&gt;Example&lt;\/b&gt;/);
  assert.doesNotMatch(html, /<script>|<b>Example/);
  assert.doesNotMatch(html, /Check this one/); // a clean lead has no notes
});

test('repeat sender who answered the questions is not screened, and the note is plain English', async () => {
  const env = liveEnv();
  const intake = { how: 'accident', work: 'virginia', surgery: 'no', missedWork: 'yes' };
  for (let i = 0; i < 4; i++) {
    resetTokenCache();
    const w = makeWorld({ now: `2026-11-02T15:0${i}:00Z` });
    await handleContact(post(goodInput({ intake, message: 'Banana wagon' })), env, w.deps);
    if (i === 3) {
      const { head, body, html } = decodeRaw(gmail(w.calls)[0]);
      assert.doesNotMatch(head, /Screened/);
      assert.match(body, /sent the form more than once recently/);
      assert.match(html, /Check this one/);
      assert.doesNotMatch(body + html, /repeat_sender|Screening:/);
    }
  }
});

test('daily check: a normal day sends no email at all', async () => {
  const env = liveEnv();
  let w = makeWorld({ now: '2026-11-02T15:00:00Z' });
  await handleContact(post(goodInput()), env, w.deps);
  await handleContact(post(goodInput({ name: 'Spam Bot', email: 's@bad.com', message: 'virtual assistant services' })), env, w.deps);
  await runSelfTest(env, makeWorld({ now: '2026-11-02T12:15:00Z' }).deps);
  resetTokenCache(); w = makeWorld({ now: '2026-11-03T12:30:00Z' });
  assert.equal(await buildDailyCheck(env, w.deps), null);
  assert.equal(await runDailyCheck(env, w.deps), true);
  assert.equal(gmail(w.calls).length, 0);
});

test('daily check: an undelivered message says who to call back, in plain English, to Bryn only', async () => {
  const env = liveEnv();
  let w = makeWorld({ now: '2026-11-02T15:00:00Z' });
  await handleContact(post(goodInput()), env, w.deps);
  resetTokenCache(); w = makeWorld({ now: '2026-11-02T16:00:00Z', gmail: 500 });
  await handleContact(post(goodInput({ email: 'fail@example.com' })), env, w.deps);

  resetTokenCache(); w = makeWorld({ now: '2026-11-03T12:30:00Z' });
  const d = await buildDailyCheck(env, w.deps);
  assert.ok(d);
  assert.match(d.subject, /did not reach you/);
  assert.match(d.body, /Someone filled out the website form yesterday, but the email never reached your inbox/);
  assert.match(d.body, /Pat Example, \(804\) 555-0100, fail@example\.com \(sent Nov 2, 2026, 11:00 AM\)/);
  assert.match(d.body, /What to do:/);
  // No codes, ids or message text.
  assert.doesNotMatch(d.body, /id-\d|http_500|my claim was denied|digest/i);
  assert.equal(await runDailyCheck(env, w.deps), true);
  const { head } = decodeRaw(gmail(w.calls)[0]);
  assert.match(head, /To: bswartz@pathfinderlaw\.com\r?\n/);
  // Reported once: the next day is quiet again.
  resetTokenCache(); w = makeWorld({ now: '2026-11-04T12:30:00Z' });
  assert.equal(await buildDailyCheck(env, w.deps), null);
});

test('daily check: spam filter down is reported calmly', async () => {
  const env = liveEnv(); let w = makeWorld({ now: '2026-11-02T15:00:00Z', turnstile: 'down' });
  await handleContact(post(goodInput()), env, w.deps);
  resetTokenCache(); w = makeWorld({ now: '2026-11-03T12:30:00Z' });
  const d = await buildDailyCheck(env, w.deps);
  assert.ok(d);
  assert.match(d.subject, /spam filter/);
  assert.match(d.body, /spam filter was not working yesterday/);
});

test('cron routing is by minute: hours can change for daylight saving', async () => {
  assert.equal(cronJob('15 12 * * *'), 'self_test');
  assert.equal(cronJob('30 12 * * *'), 'daily_check');
  assert.equal(cronJob('0 9 * * *'), 'none');
  let env = liveEnv(); let w = makeWorld({ now: '2027-03-15T11:15:00Z' });
  assert.equal(await runScheduled('15 11 * * *', env, w.deps), 'self_test');
  assert.match(decodeRaw(gmail(w.calls)[0]).head, /Subject: \[Form Test /);
  assert.ok(w.calls.some((c) => c.url === 'https://hb.example/ping'));
  resetTokenCache(); env = liveEnv(); w = makeWorld({ now: '2027-03-15T11:30:00Z' });
  assert.equal(await runScheduled('30 11 * * *', env, w.deps), 'daily_check');
  assert.equal(gmail(w.calls).length, 0); // nothing wrong, so no email
  w = makeWorld();
  const orig = console.error; console.error = () => {};
  try { assert.equal(await runScheduled('45 11 * * *', liveEnv(), w.deps), 'none'); } finally { console.error = orig; }
  assert.equal(w.calls.length, 0);
});

test('daily check: a 3-day quiet stretch is reported once, the day it starts', async () => {
  const env = liveEnv();
  await handleContact(post(goodInput()), env, makeWorld({ now: '2026-11-06T15:00:00Z' }).deps); // a Friday
  resetTokenCache();
  const d = await buildDailyCheck(env, makeWorld({ now: '2026-11-10T12:30:00Z' }).deps); // Sat, Sun, Mon empty
  assert.ok(d);
  assert.match(d.body, /Nobody has sent a message through the website form in 3 days/);
  assert.equal(await buildDailyCheck(env, makeWorld({ now: '2026-11-11T12:30:00Z' }).deps), null);
  assert.equal(await buildDailyCheck(env, makeWorld({ now: '2026-11-09T12:30:00Z' }).deps), null);
});

test('daily check failure to send pings the alert', async () => {
  const env = liveEnv();
  await handleContact(post(goodInput()), env, makeWorld({ now: '2026-11-09T15:00:00Z', turnstile: 'down' }).deps);
  resetTokenCache(); const w = makeWorld({ gmail: 403, now: '2026-11-10T12:30:00Z' });
  assert.equal(await runDailyCheck(env, w.deps), false);
  assert.ok(w.calls.some((c) => c.url === 'https://hb.example/fail'));
});

test('purge removes screened rows older than 90 days and keeps leads', async () => {
  const env = liveEnv();
  const ins = env.sqlite.prepare(`INSERT INTO submissions (id, created_at, form, outcome, reason, turnstile, name, email, phone, message) VALUES (?, ?, 'main', ?, 'x', 'pass', 'n', 'e@x.com', '8045550100', 'm')`);
  ins.run('old-spam', '2026-07-01T00:00:00Z', 'screened');
  ins.run('old-lead', '2026-07-01T00:00:00Z', 'lead');
  ins.run('old-unsure', '2026-07-01T00:00:00Z', 'unsure');
  ins.run('new-spam', '2026-10-25T00:00:00Z', 'screened');
  await runPurge(env, makeWorld({ now: '2026-11-03T12:30:00Z' }).deps);
  assert.deepEqual(rows(env).map((r) => r.id).sort(), ['new-spam', 'old-lead', 'old-unsure']);
});

// ---------- step-by-step intake form ----------
const caseIntake = { how: 'accident', when: 'sixMonths', work: 'virginia', surgery: 'yes', missedWork: 'yes' };
const intakeInput = (intake: unknown, o: Record<string, unknown> = {}) => goodInput({ intake, message: 'I fell off a ladder on March 3.', ...o });

test('intake validation: answers must be ones the form offers, on the path the form asks', () => {
  assert.equal(validate(intakeInput(caseIntake)).ok, true);
  assert.equal(validate(intakeInput({ how: 'sick' })).ok, true); // refer out by "how": nothing else asked
  assert.equal(validate(intakeInput({ how: 'accident', work: 'railroad' })).ok, true); // refer out by "work"
  for (const bad of [
    { how: 'hacked' },
    { how: 'accident' },
    { how: 'accident', work: 'virginia', surgery: 'yes' },
    { how: 'accident', work: 'virginia', surgery: 'maybe', missedWork: 'yes' },
    { how: 'accident', work: 'toString', surgery: 'yes', missedWork: 'yes' },
    { how: 'sick', work: 'virginia' },
    { how: 'accident', work: 'railroad', surgery: 'yes' },
    'accident',
  ]) {
    assert.deepEqual(validate(intakeInput(bad)), { ok: false, error: 'invalid_intake' }, JSON.stringify(bad));
  }
});

test('intake: "what happened" is optional, still capped', () => {
  assert.equal(validate(intakeInput(caseIntake, { message: '' })).ok, true);
  assert.equal((validate(intakeInput(caseIntake, { message: 'x'.repeat(5001) })) as any).error, 'invalid_message');
  assert.equal((validate(goodInput({ message: '' })) as any).error, 'invalid_message'); // plain message still required
});

test('phone: US 10 digits, formatted (xxx) xxx-xxxx; email pattern enforced', () => {
  for (const p of ['8045550100', '804.555.0100', '+1 804 555 0100', '1-804-555-0100', '(804) 555-0100']) {
    assert.equal((validate(goodInput({ phone: p })) as any).value.phone, '(804) 555-0100', p);
  }
  for (const p of ['555-0100', '0045550100', '+44 20 7946 0958', '804-555-01000', '1'.repeat(41)]) {
    assert.equal((validate(goodInput({ phone: p })) as any).error, 'invalid_phone', p);
  }
  for (const e of ['pat@example', 'pat example@x.com', '@example.com', 'pat@@example.com']) {
    assert.equal((validate(goodInput({ email: e })) as any).error, 'invalid_email', e);
  }
});

test('intake "when": more than 2 years is likely not a case; 1 to 2 years warns; missing is tolerated', async () => {
  assert.equal(route({ ...caseIntake, when: 'older' } as any), 'unlikely');
  assert.equal(route({ ...caseIntake, when: 'twoYears' } as any), 'priority');
  assert.equal(route({ how: 'accident', when: 'older', work: 'federal' }), 'refer'); // refer still wins
  assert.equal(validate(intakeInput({ ...caseIntake, when: 'yesterday' })).ok, false);
  const { when: _w, ...noWhen } = caseIntake;
  assert.equal(validate(intakeInput(noWhen)).ok, true); // a page loaded before the question existed

  let env = liveEnv(); let w = makeWorld();
  await handleContact(post(intakeInput({ ...caseIntake, when: 'older' })), env, w.deps);
  let mail = decodeRaw(gmail(w.calls)[0]);
  assert.match(mail.head, /Subject: Website inquiry - Likely not a case/);
  assert.match(mail.body, /When it happened: More than 2 years ago/);
  assert.match(mail.html, /The filing deadline may have passed/);

  resetTokenCache(); env = liveEnv(); w = makeWorld();
  await handleContact(post(intakeInput({ ...caseIntake, when: 'twoYears' })), env, w.deps);
  mail = decodeRaw(gmail(w.calls)[0]);
  assert.match(mail.head, /Subject: Website inquiry - PRIORITY case/);
  assert.match(mail.html, /deadline may be close\. Call soon/);
});

test('intake sorting: refer beats likely-not-a-case beats a case; "Not sure" stays with the firm', () => {
  assert.equal(route({ how: 'accident', work: 'virginia', surgery: 'yes', missedWork: 'yes' }), 'priority');
  assert.equal(route({ how: 'other', work: 'unsure', surgery: 'yes', missedWork: 'yes' }), 'priority');
  assert.equal(route({ how: 'accident', work: 'virginia', surgery: 'yes', missedWork: 'unsure' }), 'possible');
  assert.equal(route({ how: 'accident', work: 'virginia', surgery: 'no', missedWork: 'yes' }), 'possible');
  assert.equal(route({ how: 'sick' }), 'refer');
  assert.equal(route({ how: 'disability' }), 'refer');
  for (const work of ['state', 'federal', 'railroad', 'shipyard', 'outside'] as const) assert.equal(route({ how: 'accident', work }), 'refer');
  assert.equal(route({ how: 'overtime', work: 'virginia', surgery: 'yes', missedWork: 'yes' }), 'unlikely');
  assert.equal(route({ how: 'overtime', work: 'federal' }), 'refer');
});

for (const [label, intake, subject, routeName] of [
  ['PRIORITY', caseIntake, 'Website inquiry - PRIORITY case', 'priority'],
  ['possible case', { ...caseIntake, surgery: 'no' }, 'Website inquiry - Possible case', 'possible'],
  ['refer out', { how: 'accident', work: 'federal' }, 'Website inquiry - Refer out', 'refer'],
  ['likely not a case', { ...caseIntake, how: 'overtime' }, 'Website inquiry - Likely not a case', 'unlikely'],
] as const) {
  test(`intake ${label}: delivered to both inboxes, tag in the subject only, plain answer lines`, async () => {
    const env = liveEnv(); const { deps, calls } = makeWorld();
    const res = await handleContact(post(intakeInput(intake)), env, deps);
    assert.equal(res.status, 200);
    assert.deepEqual(await res.json(), { ok: true, route: routeName });
    const [row] = rows(env);
    assert.equal(row.outcome, 'lead'); assert.equal(row.delivery_status, 'sent');
    assert.equal(row.phone, '(804) 555-0100');
    assert.match(row.message, /^How hurt: .+\n[\s\S]*What happened and when:\nI fell off a ladder on March 3\.$/);
    const { head, body } = decodeRaw(gmail(calls)[0]);
    assert.match(head, /To: bswartz@pathfinderlaw.com, mtruman@pathfinderlaw.com/);
    assert.match(head, new RegExp(`Subject: ${subject}\\r?\\n`));
    assert.match(body, /^Name: Pat Example\r?\nEmail: pat@example\.com\r?\nPhone: \(804\) 555-0100\r?\n\r?\nHow hurt: /);
    assert.match(body, /\r?\n\r?\nWhat happened and when:\r?\nI fell off a ladder on March 3\.$/);
    assert.doesNotMatch(body, /PRIORITY|Refer out|Likely not|Form:|Screening:|Bot check|Reference:|attorney-client|route|priority|unlikely/);
  });
}

test('intake email: refer-out by "how" lists only what was asked; blank story says so', async () => {
  const env = liveEnv(); const { deps, calls } = makeWorld();
  await handleContact(post(intakeInput({ how: 'disability' }, { message: '' })), env, deps);
  const { body } = decodeRaw(gmail(calls)[0]);
  assert.match(body, /How hurt: I need help with Social Security disability\r?\n\r?\nWhat happened and when:\r?\n\(left blank\)$/);
  assert.doesNotMatch(body, /Where they work|Surgery|Missed work/);
});

test('intake screened by a rule keeps the [Screened] prefix before the tag', async () => {
  const env = liveEnv(); const { deps, calls } = makeWorld();
  await handleContact(post(intakeInput(caseIntake, { fillMs: 100 })), env, deps);
  assert.match(decodeRaw(gmail(calls)[0]).head, /Subject: \[Screened\] Website inquiry - PRIORITY case/);
});

test('intake in preview mode reports the sorting, stores and sends nothing', async () => {
  const env = liveEnv({ PREVIEW_MODE: '1', TURNSTILE_SECRET: undefined }); const { deps, calls } = makeWorld();
  const res = await handleContact(post(intakeInput({ how: 'sick' })), env, deps);
  assert.deepEqual(await res.json(), { ok: true, preview: true, message: 'Preview: nothing was sent.', route: 'refer' });
  assert.equal(rows(env).length, 0); assert.equal(gmail(calls).length, 0);
});
