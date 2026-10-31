import { GMAIL_SCOPE, GMAIL_SEND_URL, GOOGLE_TOKEN_URL, RECIPIENTS, SENDER } from './config.ts';
import type { Deps, Env } from './types.ts';

// kind 'auth' = Google refused our permission (key revoked, delegation removed,
// admin@ password flow broke, etc.). It drives the immediate alert.
export class SendError extends Error {
  kind: 'auth' | 'http' | 'network' | 'config';
  status: number;
  constructor(kind: 'auth' | 'http' | 'network' | 'config', status = 0) {
    super(kind); // message is only a code; never include request or response text
    this.kind = kind;
    this.status = status;
  }
  get code() {
    return this.kind === 'http' ? `http_${this.status}` : this.kind;
  }
}

const b64url = (bytes: ArrayBuffer | Uint8Array) => {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let s = '';
  for (const b of arr) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};
const utf8 = (s: string) => new TextEncoder().encode(s);

async function signJwt(clientEmail: string, privateKeyPem: string, now: Date, tokenUrl: string) {
  const der = Uint8Array.from(atob(privateKeyPem.replace(/-----[^-]+-----|\s/g, '')), (c) => c.charCodeAt(0));
  const key = await crypto.subtle.importKey('pkcs8', der, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['sign']);
  const iat = Math.floor(now.getTime() / 1000);
  const header = b64url(utf8(JSON.stringify({ alg: 'RS256', typ: 'JWT' })));
  const claims = b64url(
    utf8(JSON.stringify({ iss: clientEmail, sub: SENDER, scope: GMAIL_SCOPE, aud: tokenUrl, iat, exp: iat + 3600 })),
  );
  const sig = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, utf8(`${header}.${claims}`));
  return `${header}.${claims}.${b64url(sig)}`;
}

let cached: { token: string; expires: number; for: string } | null = null;
export const resetTokenCache = () => {
  cached = null;
};

async function accessToken(env: Env, deps: Deps): Promise<string> {
  if (!env.GOOGLE_SA_KEY) throw new SendError('config');
  const tokenUrl = env.GOOGLE_TOKEN_URL || GOOGLE_TOKEN_URL;
  const nowMs = deps.now().getTime();
  if (cached && cached.for === tokenUrl && cached.expires - 60_000 > nowMs) return cached.token;

  let jwt: string;
  try {
    const sa = JSON.parse(env.GOOGLE_SA_KEY);
    jwt = await signJwt(sa.client_email, sa.private_key, deps.now(), tokenUrl);
  } catch {
    throw new SendError('config');
  }
  let res: Response;
  try {
    res = await deps.fetch(tokenUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: jwt }),
    });
  } catch {
    throw new SendError('network');
  }
  if (!res.ok) throw new SendError(res.status >= 400 && res.status < 500 ? 'auth' : 'http', res.status);
  const body = (await res.json().catch(() => null)) as { access_token?: string; expires_in?: number } | null;
  if (!body?.access_token) throw new SendError('auth', res.status);
  cached = { token: body.access_token, expires: nowMs + (body.expires_in ?? 3600) * 1000, for: tokenUrl };
  return body.access_token;
}

const wrap76 = (s: string) => s.match(/.{1,76}/g)?.join('\r\n') ?? '';
const header = (s: string) => (/^[\x20-\x7e]*$/.test(s) ? s : `=?UTF-8?B?${btoa(String.fromCharCode(...utf8(s)))}?=`);

export function buildRawMessage(opts: { subject: string; body: string; replyTo?: string; to?: string[] }): string {
  const lines = [
    `From: Pathfinder Website <${SENDER}>`,
    `To: ${(opts.to ?? RECIPIENTS).join(', ')}`,
    ...(opts.replyTo ? [`Reply-To: ${opts.replyTo}`] : []),
    `Subject: ${header(opts.subject.replace(/[\r\n]+/g, ' '))}`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: base64',
    '',
    wrap76(btoa(String.fromCharCode(...utf8(opts.body)))),
  ];
  return lines.join('\r\n');
}

// Sends one email, to the two firm inboxes unless `to` says otherwise. Throws SendError on any failure.
export async function sendMail(env: Env, deps: Deps, opts: { subject: string; body: string; replyTo?: string; to?: string[] }) {
  const token = await accessToken(env, deps);
  let res: Response;
  try {
    res = await deps.fetch(env.GMAIL_SEND_URL || GMAIL_SEND_URL, {
      method: 'POST',
      headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
      body: JSON.stringify({ raw: b64url(utf8(buildRawMessage(opts))) }),
    });
  } catch {
    throw new SendError('network');
  }
  if (res.ok) return;
  if (res.status === 401) cached = null;
  throw new SendError(res.status === 401 || res.status === 403 ? 'auth' : 'http', res.status);
}
