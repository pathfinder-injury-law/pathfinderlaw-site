import type { Deps } from './types.ts';

// Plain HTTPS GET to an outside check-in service. Works with any vendor that
// accepts a GET. Never logs the URL (it often contains a secret token).
export async function ping(url: string | undefined, deps: Deps): Promise<boolean> {
  if (!url) return false;
  try {
    const res = await deps.fetch(url, { method: 'GET', signal: AbortSignal.timeout(5000) });
    return res.ok;
  } catch {
    return false;
  }
}

// Fixed codes only. Never pass submitted text or error messages in here.
export function logCode(code: string, facts: Record<string, string | number | boolean> = {}) {
  console.error(JSON.stringify({ event: code, ...facts }));
}
