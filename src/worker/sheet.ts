import { alertThrottled, logCode } from './alerts.ts';
import { ROUTE_SUBJECT, type Route } from './intake.ts';
import type { Deps, Env } from './types.ts';

// Intake sheet push: every emailed lead (not the self-test, never a bot) also becomes a row in the
// firm's Google Sheet "Intake" tab, through an Apps Script web app that checks a signature.
//
// This path is EXTRA. The D1 log, the two emails, the email re-send and the daily check do not
// depend on it, so a failure here loses nothing: the lead is already in both inboxes.
//
// Off until both secrets are set (INTAKE_URL, INTAKE_SECRET) and never in preview mode.
//
// Signing: Apps Script's doPost cannot read request headers, so the signature travels in the body:
//   { v: 1, ts: <unix seconds>, payload: "<payload JSON as a string>", sig: "<hex>" }
//   sig = lowercase hex HMAC-SHA256(key = INTAKE_SECRET, message = ts + "." + payload)
// The script refuses a ts more than 300 seconds off and dedupes on LeadID, so a retry can never
// add a second row. That is why, unlike email, a 'pending' or 'sending' row is safe to retry.
//
// Success is ONLY {"ok":true,"leadId":"<the same id>"}. Apps Script answers 200 even for its own
// errors (and a sign-in page if access is set wrong), so the status code alone means nothing.

export const SHEET_AFTER_MINUTES = 5; // leave a lead alone while its own request may still be pushing it
export const SHEET_WINDOW_HOURS = 24;
export const SHEET_MAX_TRIES = 10; // the first push plus up to 9 retries, about 2 hours
export const SHEET_BATCH = 10; // pushes per cron run
export const SHEET_TIMEOUT_MS = 10_000;
const SCAN_LIMIT = 200;
const SETUP_ALERT_SECONDS = 6 * 3600;

// Codes that mean the setup is wrong (not a passing hiccup): these ping ALERT_URL, at most every 6 hours.
const SETUP_CODES = new Set(['not_json', 'app_bad_signature', 'app_stale', 'wrong_lead', 'http_401', 'http_403', 'http_404']);
// Error codes the script may send back. Anything else is recorded as app_other (never its text).
const APP_ERRORS = new Set(['bad_signature', 'stale', 'bad_payload', 'sheet_error']);

export const sheetEnabled = (env: Env) => !env.PREVIEW_MODE && !!env.INTAKE_URL && !!env.INTAKE_SECRET;

// What the push needs from a lead. The same shape comes from a fresh submission and from a D1 row.
export interface SheetLead {
  id: string;
  created_at: string;
  name: string;
  phone: string;
  email: string;
  message: string; // the logged message: answers one per line, then what the person typed
  outcome: string;
  route: string | null;
}

const ROUTES = Object.keys(ROUTE_SUBJECT) as Route[];
const answer = (message: string, question: string) =>
  message.split('\n').find((l) => l.startsWith(`${question}: `))?.slice(question.length + 2) ?? '';

// Field names match the Intake tab's columns. The form asks "when" and "where do you work" as
// choices, not a date or an employer name, so DOI and Employer go blank (staff fill them in) and the
// choices lead the Summary as "When: <choice>. Where: <choice>." (agreed with the App expert, Nov 19).
// Summary: sorting tag, then that line, then the logged message (all answers, then what was typed).
export function sheetPayload(l: SheetLead): Record<string, string> {
  const tag = l.route && (ROUTES as string[]).includes(l.route) ? ROUTE_SUBJECT[l.route as Route] : '';
  const when = answer(l.message, 'When it happened');
  const where = answer(l.message, 'Where they work');
  const choices = [when && `When: ${when}.`, where && `Where: ${where}.`].filter(Boolean).join(' ');
  return {
    LeadID: l.id,
    ReceivedAt: l.created_at,
    Name: l.name,
    Phone: l.phone,
    Email: l.email,
    Source: 'Website',
    DOI: '',
    Employer: '',
    Summary: [tag, choices, l.message].filter(Boolean).join('\n\n'),
    Status: l.outcome === 'screened' ? 'Screened' : 'New',
  };
}

const hex = (buf: ArrayBuffer) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');

export async function signEnvelope(secret: string, ts: number, payload: string): Promise<string> {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return hex(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${ts}.${payload}`)));
}

// One signed POST. Returns ok or a fixed error code; never the response text.
export async function postToSheet(env: Env, deps: Deps, l: SheetLead): Promise<{ ok: true } | { ok: false; code: string }> {
  try {
    const ts = Math.floor(deps.now().getTime() / 1000);
    const payload = JSON.stringify(sheetPayload(l));
    const sig = await signEnvelope(env.INTAKE_SECRET!, ts, payload);
    const res = await deps.fetch(env.INTAKE_URL!, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ v: 1, ts, payload, sig }),
      redirect: 'follow', // Apps Script answers through a 302 to googleusercontent.com
      signal: AbortSignal.timeout(SHEET_TIMEOUT_MS),
    });
    if (!res.ok) return { ok: false, code: `http_${res.status}` };
    let data: { ok?: unknown; leadId?: unknown; error?: unknown };
    try {
      data = JSON.parse(await res.text());
    } catch {
      return { ok: false, code: 'not_json' }; // an HTML error or sign-in page
    }
    if (data?.ok === true) return data.leadId === l.id ? { ok: true } : { ok: false, code: 'wrong_lead' };
    return { ok: false, code: typeof data?.error === 'string' && APP_ERRORS.has(data.error) ? `app_${data.error}` : 'app_other' };
  } catch {
    return { ok: false, code: 'network' };
  }
}

// Push one lead and record the result in its own columns. Tracking is best effort: if the
// columns are missing (migration not applied) the push still happens once, untracked.
export async function pushLead(env: Env, deps: Deps, l: SheetLead): Promise<boolean> {
  if (!sheetEnabled(env)) return false;
  const db = env.DB;
  let tries = 1;
  let claimed = false; // only a claimed row has its result written back
  if (db) {
    try {
      const row = await db
        .prepare(
          "UPDATE submissions SET sheet_status = 'sending', sheet_tries = sheet_tries + 1 WHERE id = ? AND sheet_status IN ('pending', 'sending', 'failed') RETURNING sheet_tries",
        )
        .bind(l.id)
        .first<{ sheet_tries: number }>();
      if (row) {
        tries = row.sheet_tries;
        claimed = true;
      }
    } catch {
      logCode('sheet_track_failed');
    }
  }
  const result = await postToSheet(env, deps, l);
  const status = result.ok ? 'sent' : tries >= SHEET_MAX_TRIES ? 'gave_up' : 'failed';
  // Written only while the row is still ours ('sending'), so a slow push can never overwrite a
  // newer result. Unclaimed (no columns yet, or tracking failed): the push happened, untracked.
  if (db && claimed) {
    await db
      .prepare("UPDATE submissions SET sheet_status = ?, sheet_at = ?, sheet_detail = ? WHERE id = ? AND sheet_status = 'sending'")
      .bind(status, deps.now().toISOString(), result.ok ? null : result.code, l.id)
      .run()
      .catch(() => logCode('sheet_track_failed'));
  }
  if (result.ok) {
    logCode('sheet_sent', { attempt: tries });
    return true;
  }
  logCode('sheet_failed', { detail: result.code, attempt: tries });
  // A passing hiccup alerts nobody (the email already went). A setup problem does, at most every 6 hours.
  if (SETUP_CODES.has(result.code)) await alertThrottled(env, deps, 'sheet_setup', SETUP_ALERT_SECONDS);
  return false;
}

// Every 15 minutes, after the email re-send: retry leads not yet in the sheet.
export async function runSheetRetry(env: Env, deps: Deps): Promise<{ sent: number; failed: number }> {
  const out = { sent: 0, failed: 0 };
  if (!sheetEnabled(env) || !env.DB) return out;
  const now = deps.now().getTime();
  const from = new Date(now - SHEET_WINDOW_HOURS * 3600_000).toISOString();
  const until = new Date(now - SHEET_AFTER_MINUTES * 60_000).toISOString();
  let rows: (SheetLead & { sheet_tries: number })[];
  try {
    rows = (
      await env.DB.prepare(
        `SELECT id, created_at, name, phone, email, message, outcome, route, sheet_tries FROM submissions
         WHERE is_test = 0 AND sheet_status IN ('pending', 'sending', 'failed') AND created_at >= ? AND created_at < ?
         ORDER BY created_at LIMIT ${SCAN_LIMIT}`,
      )
        .bind(from, until)
        .all<SheetLead & { sheet_tries: number }>()
    ).results;
  } catch {
    logCode('sheet_query_failed'); // includes "migration not applied"
    return out;
  }
  let pushes = 0;
  for (const r of rows) {
    if (pushes >= SHEET_BATCH) break;
    if (r.sheet_tries >= SHEET_MAX_TRIES) {
      // Out of tries (a run stopped mid-push): give up; the daily check lists it.
      await env.DB.prepare("UPDATE submissions SET sheet_status = 'gave_up' WHERE id = ?").bind(r.id).run().catch(() => logCode('sheet_track_failed'));
      continue;
    }
    pushes++;
    if (await pushLead(env, deps, r)) out.sent++;
    else out.failed++;
  }
  return out;
}
