// Call-tap and form-send counters. Bryn asked for these on Nov 24, 2026 to see which pages lead
// people to call or write. Each one adds 1 to a daily tally for (day, page, kind) in D1's
// contact_counts table (migration 0003). Nothing about the visitor is kept: no IP address, browser,
// cookie, name, phone, or message. Only the page's path and the day.
//
// Neither counter can slow a page or a call: the page sends the tap with navigator.sendBeacon (the
// browser fires it and moves on, see Header.astro), and any database problem here is swallowed so it
// never touches the form's own reply. Until migration 0003 is applied, every count quietly does nothing.
//
// Read the counts with `npm run counts` (scripts/contact-counts.mjs). There is no public readout.
import { logCode } from './alerts.ts';
import { allowedHostnames } from './contact.ts';
import type { Deps, Env } from './types.ts';
import { realDeps } from './types.ts';

export type CountKind = 'call' | 'form';

// A row stops counting at this many a day. Real pages see a few taps a day; the cap only matters if a
// bot hammers the counter, and it keeps that from eating the database writes the contact form needs.
export const DAILY_CAP = 100;

// A page path we are willing to store: starts with "/", only plain URL characters, not too long.
const PATH = /^\/[A-Za-z0-9/_.-]{0,199}$/;

export function cleanPath(raw: string | null | undefined): string | null {
  const p = (raw ?? '').trim();
  return PATH.test(p) && !p.includes('..') ? p : null;
}

// The path of a same-site Referer (the page the form was sent from), or null.
export function refererPath(request: Request, env: Env): string | null {
  try {
    const ref = new URL(request.headers.get('referer') ?? '');
    return allowedHostnames(env).includes(ref.hostname.toLowerCase()) ? cleanPath(ref.pathname) : null;
  } catch {
    return null;
  }
}

// The day in Eastern time, as YYYY-MM-DD.
export const etDay = (now: Date) => now.toLocaleDateString('en-CA', { timeZone: 'America/New_York' });

export async function bump(env: Env, deps: Deps, page: string, kind: CountKind): Promise<void> {
  if (!env.DB || env.PREVIEW_MODE) return;
  try {
    await env.DB.prepare(
      `INSERT INTO contact_counts (day, page, kind, count) VALUES (?, ?, ?, 1)
       ON CONFLICT (day, page, kind) DO UPDATE SET count = count + 1 WHERE count < ?`,
    )
      .bind(etDay(deps.now()), page, kind, DAILY_CAP)
      .run();
  } catch {
    logCode('count_failed', { kind }); // most likely: migration 0003 not applied yet
  }
}

const done = () => new Response(null, { status: 204, headers: { 'cache-control': 'no-store' } });

// POST /api/tap, sent by the page when someone taps a phone number. The body is the page's path.
// Always answers 204 with no body, so the response says nothing about what was counted.
export async function handleTap(request: Request, env: Env, deps: Deps = realDeps): Promise<Response> {
  if (request.method !== 'POST') return new Response(null, { status: 405, headers: { allow: 'POST' } });
  // Only taps from the firm's own pages. Browsers always send Origin on a POST.
  let host = '';
  try {
    host = new URL(request.headers.get('origin') ?? '').hostname.toLowerCase();
  } catch {
    return done();
  }
  if (!allowedHostnames(env).includes(host)) return done();

  let body = '';
  try {
    body = (await request.text()).slice(0, 300);
  } catch {
    return done();
  }
  const page = cleanPath(body) ?? refererPath(request, env);
  if (!page) return done();

  // Count only real pages, so made-up paths cannot fill the table. The site's own files answer this.
  if (env.ASSETS) {
    try {
      const res = await env.ASSETS.fetch(new Request(`https://${host}${page}`, { method: 'HEAD' }));
      if (res.status !== 200) return done();
    } catch {
      return done();
    }
  }
  await bump(env, deps, page, 'call');
  return done();
}
