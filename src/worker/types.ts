// Minimal shapes for the Cloudflare bindings this Worker uses. Written by hand
// so the project needs no extra type packages.
export interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  run(): Promise<unknown>;
  first<T = Record<string, unknown>>(): Promise<T | null>;
  all<T = Record<string, unknown>>(): Promise<{ results: T[] }>;
}
export interface D1Database {
  prepare(sql: string): D1PreparedStatement;
}
export interface KVNamespace {
  get(key: string): Promise<string | null>;
  put?(key: string, value: string, opts?: { expirationTtl?: number }): Promise<void>;
}

export interface Env {
  DB?: D1Database;
  SETTINGS?: KVNamespace;
  ASSETS?: { fetch(request: Request): Promise<Response> };
  // Secrets (set in the Cloudflare dashboard, never in files)
  GOOGLE_SA_KEY?: string;
  TURNSTILE_SECRET?: string;
  HEARTBEAT_URL?: string;
  ALERT_URL?: string;
  // Intake sheet push (sheet.ts). Both unset = the push is off. Bryn sets them; nobody else sees them.
  INTAKE_URL?: string; // the Apps Script web app's /exec address (kept out of the public repo)
  INTAKE_SECRET?: string; // shared HMAC key, also in the script's Script Properties
  // Plain variables
  PREVIEW_MODE?: string;
  // Comma-separated hostnames a Turnstile token may come from (default in config.ts).
  ALLOWED_HOSTNAMES?: string;
  // Test-only overrides so local runs can point at stand-ins. Unset in production.
  GOOGLE_TOKEN_URL?: string;
  GMAIL_SEND_URL?: string;
  TURNSTILE_VERIFY_URL?: string;
}

// Things the tests replace.
export interface Deps {
  fetch: typeof fetch;
  now: () => Date;
  uuid: () => string;
  sleep?: (ms: number) => Promise<void>; // pause before a retry (tests pass a no-op)
}

export const realDeps: Deps = {
  fetch: (...args) => fetch(...args),
  now: () => new Date(),
  uuid: () => crypto.randomUUID(),
};
