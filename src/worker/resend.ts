import { logCode, ping } from './alerts.ts';
import { emailBody, emailHtml, subjectTopic } from './contact.ts';
import { SendError, sendMail } from './google.ts';
import type { Deps, Env } from './types.ts';
import type { Submission } from './validate.ts';

// Re-send of real leads whose email did not go out (Gmail down, or the Worker stopped mid-way).
// Runs every 15 minutes. Each lead gets at most RESEND_MAX_ATTEMPTS tries, and only while it is
// younger than RESEND_WINDOW_HOURS, so an old lead is never mailed days late. Anything still
// unsent after that is listed in the next morning's daily check, as before.
export const RESEND_AFTER_MINUTES = 5; // leave a lead alone while its own request may still be running
export const RESEND_WINDOW_HOURS = 24;
export const RESEND_MAX_ATTEMPTS = 3;
const BATCH = 10;

// Never delivered on purpose (bots), so never re-sent either.
const NOT_FOR_DELIVERY = ['trap_field', 'turnstile_failed', 'turnstile_wrong_hostname'];

interface Row {
  id: string;
  created_at: string;
  form: string;
  outcome: string;
  reason: string;
  turnstile: string;
  name: string;
  email: string;
  phone: string;
  message: string;
}

// The attempt count lives in the settings store (KV), one key per lead, so no database change is needed.
// { n: tries so far, done: true once Gmail accepted it }. Keys expire after two days.
const KEY = (id: string) => `resend:${id}`;
const KEY_TTL = 2 * 86400;
type Mark = { n: number; done?: boolean };

export async function runResend(env: Env, deps: Deps): Promise<{ sent: number; failed: number; skipped: number }> {
  const out = { sent: 0, failed: 0, skipped: 0 };
  const db = env.DB;
  const kv = env.SETTINGS;
  if (!db) return out;
  // Without a place to count attempts, a broken Gmail would be retried every 15 minutes all day. Don't.
  if (!kv?.put) {
    logCode('resend_no_store');
    return out;
  }

  const now = deps.now().getTime();
  const from = new Date(now - RESEND_WINDOW_HOURS * 3600_000).toISOString();
  const until = new Date(now - RESEND_AFTER_MINUTES * 60_000).toISOString();
  let rows: Row[];
  try {
    rows = (
      await db
        .prepare(
          `SELECT id, created_at, form, outcome, reason, turnstile, name, email, phone, message FROM submissions
           WHERE is_test = 0 AND delivery_status IN ('failed', 'pending') AND created_at >= ? AND created_at < ?
           AND reason NOT IN (${NOT_FOR_DELIVERY.map(() => '?').join(', ')})
           ORDER BY created_at LIMIT ${BATCH}`,
        )
        .bind(from, until, ...NOT_FOR_DELIVERY)
        .all<Row>()
    ).results;
  } catch {
    logCode('resend_query_failed');
    return out;
  }

  const markSent = (id: string) =>
    db
      .prepare("UPDATE submissions SET delivery_status = 'sent', delivery_at = ?, delivery_detail = 'resent' WHERE id = ? AND delivery_status IN ('failed', 'pending')")
      .bind(deps.now().toISOString(), id)
      .run()
      .catch(() => logCode('db_update_failed'));

  for (const r of rows) {
    let mark: Mark;
    try {
      const raw = await kv.get(KEY(r.id));
      mark = raw ? (JSON.parse(raw) as Mark) : { n: 0 };
    } catch {
      out.skipped++;
      logCode('resend_store_failed');
      continue;
    }
    // Already delivered by an earlier run whose database update did not stick: fix the record, send nothing.
    if (mark.done) {
      await markSent(r.id);
      out.skipped++;
      continue;
    }
    if (mark.n >= RESEND_MAX_ATTEMPTS) {
      out.skipped++;
      continue;
    }
    // Count the attempt BEFORE sending, so a crash mid-send still uses up a try.
    try {
      await kv.put(KEY(r.id), JSON.stringify({ n: mark.n + 1 }), { expirationTtl: KEY_TTL });
    } catch {
      out.skipped++;
      logCode('resend_store_failed');
      continue;
    }

    const sub: Submission = {
      name: r.name,
      email: r.email,
      phone: r.phone,
      message: r.message,
      form: r.form === 'sidebar' ? 'sidebar' : 'main',
      company: '',
      fillMs: 0,
      turnstileToken: '',
    };
    const facts = { id: r.id, outcome: r.outcome, reason: r.reason, logged: true, turnstile: r.turnstile, resentFrom: r.created_at };
    const prefix = r.outcome === 'screened' ? '[Screened] ' : '';
    try {
      await sendMail(env, deps, {
        subject: `${prefix}Website inquiry (re-sent)${subjectTopic(sub)}`,
        body: emailBody(sub, facts),
        html: emailHtml(sub, facts),
        replyTo: r.email,
      });
    } catch (e) {
      out.failed++;
      const detail = e instanceof SendError ? e.code : 'unknown';
      logCode('resend_failed', { detail, attempt: mark.n + 1 });
      await db
        .prepare("UPDATE submissions SET delivery_status = 'failed', delivery_at = ?, delivery_detail = ? WHERE id = ? AND delivery_status IN ('failed', 'pending')")
        .bind(deps.now().toISOString(), detail, r.id)
        .run()
        .catch(() => logCode('db_update_failed'));
      continue;
    }
    out.sent++;
    logCode('resend_sent', { attempt: mark.n + 1 });
    // Remember the send first, so a failed database update can never cause a second email.
    await kv.put(KEY(r.id), JSON.stringify({ n: mark.n + 1, done: true }), { expirationTtl: KEY_TTL }).catch(() => logCode('resend_store_failed'));
    await markSent(r.id);
  }

  // One alarm per run, not one per lead.
  if (out.failed) await ping(env.ALERT_URL, deps);
  return out;
}
