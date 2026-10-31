import { DEFAULT_ALLOWED_HOSTNAMES, FIRM_PHONE, MIN_FILL_MS, SELF_TEST_RECIPIENTS, TURNSTILE_TEST_SECRET, TURNSTILE_VERIFY_URL } from './config.ts';
import { alertThrottled, logCode, ping } from './alerts.ts';
import { SendError, sendMail } from './google.ts';
import { decide, loadRules } from './screen.ts';
import { ROUTE_SUBJECT, intakeLines, intakeRows, route, type Route } from './intake.ts';
import type { Deps, Env } from './types.ts';
import { realDeps } from './types.ts';
import { validate, type Submission } from './validate.ts';

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });

// pass: Cloudflare says human. fail: Cloudflare says not human (or no token).
// error: Cloudflare could not be reached (an outage; the lead is still delivered).
// not_configured: TURNSTILE_SECRET is missing (a setup mistake; delivered, alarm raised).
// wrong_hostname: a valid token, but issued on a site not in ALLOWED_HOSTNAMES (treated like fail).
type Turnstile = 'pass' | 'fail' | 'error' | 'not_configured' | 'wrong_hostname';

export function allowedHostnames(env: Env): string[] {
  return (env.ALLOWED_HOSTNAMES || DEFAULT_ALLOWED_HOSTNAMES)
    .split(',')
    .map((h) => h.trim().toLowerCase())
    .filter(Boolean);
}

async function verifyTurnstile(env: Env, deps: Deps, token: string, ip: string | null): Promise<Turnstile> {
  const secret = env.TURNSTILE_SECRET || (env.PREVIEW_MODE ? TURNSTILE_TEST_SECRET : '');
  if (!secret) return 'not_configured';
  if (!token) return 'fail';
  try {
    const form = new URLSearchParams({ secret, response: token });
    if (ip) form.set('remoteip', ip); // sent to Cloudflare for the check; never stored or logged
    const res = await deps.fetch(env.TURNSTILE_VERIFY_URL || TURNSTILE_VERIFY_URL, { method: 'POST', body: form });
    if (!res.ok) return 'error';
    const data = (await res.json()) as { success?: boolean; hostname?: string };
    if (data.success !== true) return 'fail';
    // Previews run on test addresses with the always-pass test key: no hostname check there.
    if (!env.PREVIEW_MODE && data.hostname && !allowedHostnames(env).includes(data.hostname.toLowerCase())) return 'wrong_hostname';
    return 'pass';
  } catch {
    return 'error';
  }
}

export interface Processed {
  status: 'ok' | 'verification_failed' | 'delivery_failed';
  outcome: 'lead' | 'screened' | 'unsure';
  reason: string;
  delivery: 'sent' | 'failed' | 'skipped';
}

// Added to the end of the subject so the "[Screened]" and "[Form Test" filters still match.
const SUBJECT_MARK: Record<string, string> = {
  error: ' - spam check unavailable',
  not_configured: ' - TURNSTILE NOT CONFIGURED',
};

type EmailFacts = { id: string; outcome: string; reason: string; logged: boolean; turnstile?: string };

// Why a message needs a second look, in plain words. Empty for a clean lead.
export function leadNotes(o: EmailFacts): string[] {
  const why = (reason: string) => {
    if (reason.startsWith('repeat_sender')) return 'This person has sent the form more than once recently. It may be a follow-up or a duplicate.';
    if (reason.startsWith('agency_phrase')) return 'This reads like a sales pitch, not someone who was hurt.';
    if (reason === 'agency_domain') return 'This came from an address used by a marketing company.';
    if (reason.startsWith('many_links') || reason === 'has_link') return 'The message has web links in it, which spam often does.';
    if (reason === 'too_fast') return 'The form was filled out faster than a person usually can, so this may be a bot.';
    if (reason === 'rules_error') return 'The spam filter could not check this one, so it was let through.';
    return 'The spam filter flagged this one. Look it over before calling.';
  };
  const ts = o.turnstile ?? 'skipped';
  return [
    ...(o.outcome === 'lead' || o.reason === 'self_test' ? [] : [why(o.reason)]),
    ...(ts === 'error' ? ['The spam check was down when this was sent, so it was let through.'] : []),
    ...(ts === 'not_configured' ? ['The spam check is not set up on the website. Tell Claude: "The website spam check is not set up."'] : []),
    ...(o.logged ? [] : ['This message was not saved in the form log. This email is the only copy, so keep it.']),
  ];
}

// The plain-text copy. Mail apps show the styled copy (emailHtml) when they can.
export function emailBody(sub: Submission, o: EmailFacts) {
  const notes = leadNotes(o);
  return [
    ...(notes.length ? ['Check this one:', ...notes.map((n) => `- ${n}`), ''] : []),
    `Name: ${sub.name}`,
    `Email: ${sub.email}`,
    `Phone: ${sub.phone}`,
    '',
    ...(sub.intake
      ? [...intakeLines(sub.intake), '', 'What happened and when:', sub.message || '(left blank)']
      : ['Message:', sub.message]),
  ].join('\n');
}

const BADGE: Record<Route | 'message', { label: string; bg: string; fg: string }> = {
  priority: { label: 'PRIORITY CASE', bg: '#d77900', fg: '#ffffff' },
  possible: { label: 'POSSIBLE CASE', bg: '#638c1c', fg: '#ffffff' },
  refer: { label: 'REFER OUT', bg: '#6fb1c8', fg: '#294634' },
  unlikely: { label: 'LIKELY NOT A CASE', bg: '#666666', fg: '#ffffff' },
  message: { label: 'WEBSITE MESSAGE', bg: '#40683c', fg: '#ffffff' },
};

const html = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const FONT = "Nexa, Aptos, 'Segoe UI', Helvetica, Arial, sans-serif";

// The styled copy: a colored tag, any notes, big tap-to-call and tap-to-email links, then the answers.
// Everything the visitor typed is escaped. Brand colors only (Pathfinder Brand Book).
export function emailHtml(sub: Submission, o: EmailFacts) {
  const notes = leadNotes(o);
  const badge = BADGE[sub.intake ? route(sub.intake) : 'message'];
  const tel = sub.phone.replace(/[^\d+]/g, '');
  const label = (t: string) => `<div style="font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#40683c;margin:0 0 4px">${t}</div>`;
  // One answer per block, question above answer, so it reads well on a phone.
  const rows = sub.intake
    ? intakeRows(sub.intake)
        .map(([q, a]) => `<div style="padding:8px 0;border-top:1px solid #e3e3e3"><div style="color:#555555;font-size:13px">${html(q)}</div><div style="color:#294634;font-size:16px;font-weight:700">${html(a)}</div></div>`)
        .join('')
    : '';
  const story = sub.message ? html(sub.message).replace(/\n/g, '<br>') : '<span style="color:#777777">(left blank)</span>';
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head><body style="margin:0;padding:0;background:#ffffff">
<div style="max-width:560px;margin:0 auto;padding:20px 16px;font-family:${FONT};color:#294634;line-height:1.45">
<div style="display:inline-block;background:${badge.bg};color:${badge.fg};font-weight:700;font-size:13px;letter-spacing:.08em;padding:6px 12px;border-radius:4px">${badge.label}</div>
${notes.length ? `<div style="margin:16px 0 0;padding:12px 14px;border-left:4px solid #ffd040;background:#ffffff;border-top:1px solid #e3e3e3;border-right:1px solid #e3e3e3;border-bottom:1px solid #e3e3e3"><div style="font-weight:700;margin:0 0 4px">Check this one:</div>${notes.map((n) => `<div style="margin:2px 0">${html(n)}</div>`).join('')}</div>` : ''}
<div style="font-size:24px;font-weight:700;margin:18px 0 10px">${html(sub.name)}</div>
<div style="margin:0 0 6px;font-size:17px"><a href="tel:${html(tel)}" style="color:#294634;font-weight:700;text-decoration:none">&#9742;&nbsp; ${html(sub.phone)}</a></div>
<div style="margin:0 0 18px;font-size:17px"><a href="mailto:${html(sub.email)}" style="color:#40683c;text-decoration:underline">${html(sub.email)}</a></div>
${rows ? `${label('Their answers')}<div style="margin:0 0 18px">${rows}</div>` : ''}
${label(sub.intake ? 'What happened and when' : 'Message')}
<div style="font-size:16px;margin:0 0 8px;white-space:normal">${story}</div>
</div></body></html>`;
}

// What the form log keeps in its message column: the answers, then what the person typed.
export const loggedMessage = (sub: Submission) =>
  sub.intake ? [...intakeLines(sub.intake), '', 'What happened and when:', sub.message].join('\n') : sub.message;

// The end of the subject: the intake form's sorting tag, or which form a plain message came from.
const subjectTopic = (sub: Submission) =>
  sub.intake ? ` - ${ROUTE_SUBJECT[route(sub.intake)]}` : ` (${sub.form === 'sidebar' ? 'sidebar form' : 'main form'})`;

// The one path every submission takes: log, bot checks, screen, email, update log.
export async function processSubmission(
  env: Env,
  deps: Deps,
  sub: Submission,
  opts: { ip?: string | null; test?: { tag: string } } = {},
): Promise<Processed> {
  const id = deps.uuid();
  const created = deps.now().toISOString();
  const isTest = opts.test ? 1 : 0;
  const db = env.DB;
  let logged = false;

  // 1. Log first. If the log is down we still try to deliver, and raise the alarm.
  try {
    if (!db) throw new Error('no_db');
    await db
      .prepare(
        `INSERT INTO submissions (id, created_at, form, outcome, reason, is_test, turnstile, delivery_status, name, email, phone, message)
         VALUES (?, ?, ?, 'unsure', 'pending', ?, 'skipped', 'pending', ?, ?, ?, ?)`,
      )
      .bind(id, created, sub.form, isTest, sub.name, sub.email, sub.phone, loggedMessage(sub))
      .run();
    logged = true;
  } catch {
    logCode('db_insert_failed');
    await ping(env.ALERT_URL, deps);
  }

  // 2. Bot checks and screening.
  let turnstile: Turnstile | 'skipped' = 'skipped';
  let outcome: Processed['outcome'] = 'lead';
  let reason = 'clean';
  let deliver = true;

  if (opts.test) {
    reason = 'self_test';
  } else {
    turnstile = await verifyTurnstile(env, deps, sub.turnstileToken, opts.ip ?? null);
    if (turnstile === 'not_configured') {
      // A setup mistake, not an outage: deliver the lead, but sound the alarm (at most hourly).
      logCode('turnstile_not_configured');
      await alertThrottled(env, deps, 'turnstile_not_configured');
    } else if (turnstile === 'error') {
      logCode('turnstile_unavailable');
    }
    if (sub.company) {
      outcome = 'screened';
      reason = 'trap_field';
      deliver = false;
    } else if (turnstile === 'fail') {
      outcome = 'screened';
      reason = 'turnstile_failed';
      deliver = false;
    } else if (turnstile === 'wrong_hostname') {
      // Same handling as a failed check: stored as screened, not emailed, visitor refused.
      outcome = 'screened';
      reason = 'turnstile_wrong_hostname';
      deliver = false;
      logCode('turnstile_wrong_hostname');
    } else {
      try {
        const rules = await loadRules(env.SETTINGS);
        let earlier = 0;
        if (db) {
          const since = new Date(deps.now().getTime() - rules.limits.repeatWindowHours * 3600_000).toISOString();
          const row = await db
            .prepare('SELECT COUNT(*) AS n FROM submissions WHERE LOWER(email) = ? AND created_at >= ? AND id != ? AND is_test = 0')
            .bind(sub.email.toLowerCase(), since, id)
            .first<{ n: number }>();
          earlier = row?.n ?? 0;
        }
        ({ outcome, reason } = decide(sub, rules, earlier));
      } catch {
        outcome = 'unsure';
        reason = 'rules_error'; // any trouble with the rules counts as a lead
        logCode('rules_error');
      }
      if (!(sub.fillMs >= MIN_FILL_MS)) {
        // Too fast to be a person. Still emailed, tagged [Screened], so nothing is lost.
        if (outcome === 'lead' || outcome === 'unsure') {
          outcome = 'screened';
          reason = 'too_fast';
        }
      }
    }
  }

  if (logged) {
    await db!
      .prepare('UPDATE submissions SET outcome = ?, reason = ?, turnstile = ? WHERE id = ?')
      .bind(outcome, reason, turnstile, id)
      .run()
      .catch(() => logCode('db_update_failed'));
  }

  // 3. Email.
  let delivery: Processed['delivery'] = 'skipped';
  let detail: string | null = null;
  if (deliver) {
    const prefix = opts.test ? `[Form Test ${opts.test.tag}] ` : outcome === 'screened' ? '[Screened] ' : '';
    try {
      await sendMail(env, deps, {
        subject: `${prefix}Website inquiry${subjectTopic(sub)}${SUBJECT_MARK[turnstile] ?? ''}`,
        body: emailBody(sub, { id, outcome, reason, logged, turnstile }),
        html: emailHtml(sub, { id, outcome, reason, logged, turnstile }),
        replyTo: sub.email,
        ...(opts.test ? { to: SELF_TEST_RECIPIENTS } : {}),
      });
      delivery = 'sent';
    } catch (e) {
      delivery = 'failed';
      detail = e instanceof SendError ? e.code : 'unknown';
      logCode('send_failed', { detail });
      // Authorization failures and any failed real lead alert the phones at once.
      await ping(env.ALERT_URL, deps);
    }
  }
  if (logged) {
    await db!
      .prepare('UPDATE submissions SET delivery_status = ?, delivery_at = ?, delivery_detail = ? WHERE id = ?')
      .bind(delivery, deps.now().toISOString(), detail, id)
      .run()
      .catch(() => logCode('db_update_failed'));
  }

  const status = turnstileBlocked(reason) ? 'verification_failed' : delivery === 'failed' ? 'delivery_failed' : 'ok';
  return { status, outcome, reason, delivery };
}

const turnstileBlocked = (reason: string) => reason === 'turnstile_failed' || reason === 'turnstile_wrong_hostname';

export async function handleContact(request: Request, env: Env, deps: Deps = realDeps): Promise<Response> {
  if (request.method !== 'POST') return json({ ok: false, error: 'method_not_allowed' }, 405);
  if (!(request.headers.get('content-type') ?? '').toLowerCase().startsWith('application/json')) {
    return json({ ok: false, error: 'bad_request' }, 415);
  }
  let input: unknown;
  try {
    const text = await request.text();
    if (text.length > 20_000) return json({ ok: false, error: 'too_large' }, 413);
    input = JSON.parse(text);
  } catch {
    return json({ ok: false, error: 'bad_request' }, 400);
  }
  const v = validate(input);
  if (!v.ok) return json({ ok: false, error: v.error }, 400);
  const sub = v.value;

  // Previews: same checks as live, but nothing is stored or sent.
  if (env.PREVIEW_MODE) {
    const t = await verifyTurnstile(env, deps, sub.turnstileToken, null);
    logCode('preview_submission', { form: sub.form, trap: sub.company !== '', turnstile: t });
    if (t === 'fail') return json({ ok: false, error: 'verification_failed' }, 403);
    return json({ ok: true, preview: true, message: 'Preview: nothing was sent.', ...routeField(sub) });
  }

  const result = await processSubmission(env, deps, sub, { ip: request.headers.get('CF-Connecting-IP') });
  if (result.status === 'verification_failed') return json({ ok: false, error: 'verification_failed' }, 403);
  if (result.status === 'delivery_failed') return json({ ok: false, error: 'delivery_failed', phone: FIRM_PHONE }, 502);
  return json({ ok: true, ...routeField(sub) });
}

// Tells the page which ending to show. The Worker's own sorting wins over the page's.
const routeField = (sub: Submission) => (sub.intake ? { route: route(sub.intake) } : {});
