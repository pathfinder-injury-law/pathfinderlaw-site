import { logCode, ping } from './alerts.ts';
import { emailBody, emailHtml, subjectTopic } from './contact.ts';
import { SendError, sendMail } from './google.ts';
import type { Deps, Env } from './types.ts';
import type { Submission } from './validate.ts';

// Re-send of real leads whose email did not go out (Gmail down, or the Worker stopped before sending).
// Runs every 15 minutes. Each lead gets at most RESEND_MAX_ATTEMPTS tries, and only while it is
// younger than RESEND_WINDOW_HOURS, so an old lead is never mailed days late. Anything still
// unsent after that is listed in the next morning's daily check, as before.
//
// Never twice: every send (first try or re-send) first marks the row 'sending'. Only rows that are
// 'failed' (Gmail said no) or 'pending' and never reached 'sending' are picked up. A row left at
// 'sending' may already be in the inbox, so it is never re-sent; the daily check reports it.
export const RESEND_AFTER_MINUTES = 5; // leave a lead alone while its own request may still be running
export const RESEND_WINDOW_HOURS = 24;
export const RESEND_MAX_ATTEMPTS = 3;
export const RESEND_BATCH = 10; // send attempts per run; rows already out of tries do not count
const SCAN_LIMIT = 500; // rows read per run, a safety bound only (24 hours of failures)

// Never emailed on purpose (bots), so never re-sent either.
const NOT_FOR_DELIVERY = ['trap_field', 'turnstile_failed', 'turnstile_wrong_hostname'];
const BOT_TURNSTILE = ['fail', 'wrong_hostname'];

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

// The try count lives in the settings store (KV), one key per lead, so no database change is needed.
// Keys expire after two days (the window is one).
const KEY = (id: string) => `resend:${id}`;
const KEY_TTL = 2 * 86400;

export async function runResend(env: Env, deps: Deps): Promise<{ sent: number; failed: number; skipped: number }> {
  const out = { sent: 0, failed: 0, skipped: 0 };
  const db = env.DB;
  const kv = env.SETTINGS;
  if (!db) return out;
  // Without a place to count tries, a broken Gmail would be retried every 15 minutes all day. Don't.
  if (!kv?.put) {
    logCode('resend_no_store');
    return out;
  }

  const now = deps.now().getTime();
  const from = new Date(now - RESEND_WINDOW_HOURS * 3600_000).toISOString();
  const until = new Date(now - RESEND_AFTER_MINUTES * 60_000).toISOString();
  const marks = (xs: string[]) => xs.map(() => '?').join(', ');
  let rows: Row[];
  try {
    rows = (
      await db
        .prepare(
          `SELECT id, created_at, form, outcome, reason, turnstile, name, email, phone, message FROM submissions
           WHERE is_test = 0 AND created_at >= ? AND created_at < ?
           AND (delivery_status = 'failed' OR (delivery_status = 'pending' AND reason != 'pending'))
           AND reason NOT IN (${marks(NOT_FOR_DELIVERY)}) AND turnstile NOT IN (${marks(BOT_TURNSTILE)})
           ORDER BY created_at LIMIT ${SCAN_LIMIT}`,
        )
        .bind(from, until, ...NOT_FOR_DELIVERY, ...BOT_TURNSTILE)
        .all<Row>()
    ).results;
  } catch {
    logCode('resend_query_failed');
    return out;
  }

  const setStatus = (id: string, status: 'sent' | 'failed', detail: string) =>
    db
      .prepare("UPDATE submissions SET delivery_status = ?, delivery_at = ?, delivery_detail = ? WHERE id = ? AND delivery_status = 'sending'")
      .bind(status, deps.now().toISOString(), detail, id)
      .run()
      .catch(() => logCode('db_update_failed'));

  let attempts = 0;
  for (const r of rows) {
    if (attempts >= RESEND_BATCH) break;
    let n: number;
    try {
      const raw = await kv.get(KEY(r.id));
      n = raw ? Number((JSON.parse(raw) as { n: number }).n) || 0 : 0;
    } catch {
      out.skipped++;
      logCode('resend_store_failed');
      continue;
    }
    // Out of tries: left for the daily check, and does not use up this run's batch.
    if (n >= RESEND_MAX_ATTEMPTS) {
      out.skipped++;
      continue;
    }
    // Count the try BEFORE sending, so a crash mid-send still uses it up.
    try {
      await kv.put(KEY(r.id), JSON.stringify({ n: n + 1 }), { expirationTtl: KEY_TTL });
    } catch {
      out.skipped++;
      logCode('resend_store_failed');
      continue;
    }
    // Claim the row: 'sending', only if it is still failed or pending. No row back = someone else has it,
    // or the database is down; either way, send nothing.
    let claimed: { id: string } | null = null;
    try {
      claimed = await db
        .prepare("UPDATE submissions SET delivery_status = 'sending' WHERE id = ? AND delivery_status IN ('failed', 'pending') RETURNING id")
        .bind(r.id)
        .first<{ id: string }>();
    } catch {
      logCode('db_update_failed');
    }
    if (!claimed) {
      out.skipped++;
      continue;
    }
    attempts++;

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
      logCode('resend_failed', { detail, attempt: n + 1 });
      await setStatus(r.id, 'failed', detail);
      continue;
    }
    out.sent++;
    logCode('resend_sent', { attempt: n + 1 });
    // If this update fails the row stays 'sending': never sent again, and the daily check lists it.
    await setStatus(r.id, 'sent', 'resent');
  }

  // One alarm per run, not one per lead.
  if (out.failed) await ping(env.ALERT_URL, deps);
  return out;
}
