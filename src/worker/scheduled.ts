import { ALERT_RECIPIENTS, SPAM_RETENTION_DAYS } from './config.ts';
import { logCode, ping } from './alerts.ts';
import { processSubmission } from './contact.ts';
import { SendError, sendMail } from './google.ts';
import type { Deps, Env } from './types.ts';

const ET = 'America/New_York';
const etParts = (d: Date) => {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', { timeZone: ET, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit' })
      .formatToParts(d)
      .map((x) => [x.type, x.value]),
  );
  return { y: +p.year, m: +p.month, d: +p.day, h: +p.hour };
};

// UTC instant when the given Eastern calendar day begins (handles daylight saving).
function etMidnight(y: number, m: number, d: number): Date {
  for (const offset of [4, 5]) {
    const t = new Date(Date.UTC(y, m - 1, d, offset));
    const p = etParts(t);
    if (p.y === y && p.m === m && p.d === d && p.h === 0) return t;
  }
  return new Date(Date.UTC(y, m - 1, d, 5));
}

// Start and end (UTC ISO strings) of the Eastern calendar day `daysAgo` days before `now`.
export function etDayRange(now: Date, daysAgo: number) {
  const { y, m, d } = etParts(now);
  const day = new Date(Date.UTC(y, m - 1, d - daysAgo)); // calendar arithmetic only
  const next = new Date(Date.UTC(y, m - 1, d - daysAgo + 1));
  const start = etMidnight(day.getUTCFullYear(), day.getUTCMonth() + 1, day.getUTCDate());
  const end = etMidnight(next.getUTCFullYear(), next.getUTCMonth() + 1, next.getUTCDate());
  const label = day.toLocaleDateString('en-US', { timeZone: 'UTC', weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  return { start: start.toISOString(), end: end.toISOString(), label };
}

// Morning self-test: a tagged message through the exact same path as a real one.
// Only a delivered test pings the outside check-in service. No ping = alarm.
export async function runSelfTest(env: Env, deps: Deps) {
  const tag = deps.uuid().slice(0, 8);
  const result = await processSubmission(
    env,
    deps,
    {
      name: 'Morning self-test',
      email: 'admin@pathfinderlaw.com',
      phone: '804-505-0633',
      message: `Automated morning test ${tag}. This goes only to the admin@ mailbox to prove the form can send email.`,
      form: 'main',
      company: '',
      fillMs: 60_000,
      turnstileToken: '',
    },
    { test: { tag } },
  );
  if (result.delivery === 'sent') return ping(env.HEARTBEAT_URL, deps);
  return false;
}

interface Row {
  id: string;
  created_at: string;
  form: string;
  outcome: string;
  reason: string;
  turnstile: string;
  delivery_status: string;
  delivery_detail: string | null;
  name: string;
  email: string;
  phone: string;
  is_test: number;
}

// The daily check. Returns null on a normal day (no email at all). Otherwise returns one
// plain-English email that says what broke and what to do about it.
// (The morning self-test failing is not covered here: if Gmail is down this email cannot
// go out either, so the outside check-in service raises that alarm.)
export async function buildDailyCheck(env: Env, deps: Deps): Promise<{ subject: string; body: string } | null> {
  if (!env.DB) throw new Error('no_db');
  const now = deps.now();
  const day = etDayRange(now, 1);
  const cols = 'id, created_at, form, outcome, reason, turnstile, delivery_status, delivery_detail, name, email, phone, is_test';

  const yesterday = (
    await env.DB.prepare(`SELECT ${cols} FROM submissions WHERE created_at >= ? AND created_at < ? ORDER BY created_at`)
      .bind(day.start, day.end)
      .all<Row>()
  ).results;
  const real = yesterday.filter((r) => !isTest(r));
  // Only yesterday's rows, so the same problem is reported once, not every day for a week.
  const undelivered = real.filter((r) => r.delivery_status === 'pending' || r.delivery_status === 'failed');
  const spamCheckDown = real.filter((r) => r.turnstile === 'error' || r.turnstile === 'not_configured').length;
  const rulesErrors = real.filter((r) => r.reason === 'rules_error').length;

  // A quiet stretch can mean the form is broken for visitors (something the server cannot see).
  // Say so once, on the day the stretch reaches QUIET_DAYS, not every day after.
  const quietStart = etDayRange(now, QUIET_DAYS).start;
  const dayBefore = etDayRange(now, QUIET_DAYS + 1);
  const count = async (from: string, to: string) =>
    (await env.DB!.prepare('SELECT COUNT(*) AS n FROM submissions WHERE created_at >= ? AND created_at < ? AND is_test = 0').bind(from, to).first<{ n: number }>())?.n ?? 0;
  const quiet = (await count(quietStart, day.end)) === 0 && (await count(dayBefore.start, dayBefore.end)) > 0;

  const problems: string[] = [];
  if (undelivered.length) {
    const people = undelivered.map((r) => {
      const when = new Date(r.created_at).toLocaleString('en-US', { timeZone: ET, dateStyle: 'medium', timeStyle: 'short' });
      return `  - ${r.name}, ${r.phone}, ${r.email} (sent ${when})`;
    });
    problems.push(
      [
        `${undelivered.length === 1 ? 'Someone' : `${undelivered.length} people`} filled out the website form yesterday, but the email never reached your inbox.`,
        '',
        'What to do:',
        '1. Call them back today:',
        ...people,
        '2. Send yourself a test message from the website contact page on your phone.',
        '3. If your test does not arrive within a few minutes, tell Claude: "Website form emails are not arriving."',
      ].join('\n'),
    );
  }
  if (spamCheckDown) {
    problems.push(
      [
        "The website form's spam filter was not working yesterday. Messages from real people still reached you, but some spam may have too.",
        '',
        'What to do: tell Claude: "The website form spam filter is down." Nothing is urgent.',
      ].join('\n'),
    );
  }
  if (rulesErrors) {
    problems.push(
      [
        "The website form's spam rules could not be read yesterday. Messages still reached you.",
        '',
        'What to do: tell Claude: "The website form spam rules are not loading." Nothing is urgent.',
      ].join('\n'),
    );
  }
  if (quiet) {
    problems.push(
      [
        `Nobody has sent a message through the website form in ${QUIET_DAYS} days. That is unusual, and it can mean the form is broken for visitors.`,
        '',
        'What to do: send yourself a test message from the website contact page on your phone. If it does not arrive within a few minutes, tell Claude: "The website form is not working."',
      ].join('\n'),
    );
  }
  if (!problems.length) return null;

  const subject = undelivered.length
    ? `Website form: ${undelivered.length === 1 ? 'a message' : 'messages'} did not reach you. Please call back`
    : quiet
      ? 'Website form: no messages in 3 days. Please test it'
      : 'Website form: spam filter needs attention';
  const body = [...problems.flatMap((p, i) => (i ? ['', '---', '', p] : [p])), '', `(Daily website form check for ${day.label}. You only get this email when something needs attention.)`].join('\n');
  return { subject, body };
}

const QUIET_DAYS = 3;
const isTest = (r: Row) => r.reason === 'self_test';

export async function runDailyCheck(env: Env, deps: Deps) {
  try {
    const email = await buildDailyCheck(env, deps);
    if (email) await sendMail(env, deps, { ...email, to: ALERT_RECIPIENTS });
    return true;
  } catch (e) {
    logCode('daily_check_failed', { detail: e instanceof SendError ? e.code : 'unknown' });
    await ping(env.ALERT_URL, deps);
    return false;
  }
}

export async function runPurge(env: Env, deps: Deps) {
  if (!env.DB) return;
  const cutoff = new Date(deps.now().getTime() - SPAM_RETENTION_DAYS * 86400_000).toISOString();
  try {
    await env.DB.prepare("DELETE FROM submissions WHERE outcome = 'screened' AND created_at < ?").bind(cutoff).run();
  } catch {
    logCode('purge_failed');
  }
}
