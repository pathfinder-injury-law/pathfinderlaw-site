import { handleContact } from './contact.ts';
import { runDigest, runPurge, runSelfTest } from './scheduled.ts';
import { realDeps, type Env } from './types.ts';

// Cron triggers (UTC), set in wrangler.jsonc:
//   "15 12 * * *"  morning self-test (7:15 a.m. Eastern in winter)
//   "30 12 * * *"  daily digest, then spam purge (7:30 a.m. Eastern in winter)
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === '/api/contact') return handleContact(request, env);
    if (url.pathname.startsWith('/api/')) return new Response('Not found', { status: 404 });
    return env.ASSETS ? env.ASSETS.fetch(request) : new Response('Not found', { status: 404 });
  },

  async scheduled(event: { cron: string }, env: Env, ctx: { waitUntil(p: Promise<unknown>): void }) {
    if (event.cron === '15 12 * * *') {
      ctx.waitUntil(runSelfTest(env, realDeps));
    } else {
      ctx.waitUntil(runDigest(env, realDeps).then(() => runPurge(env, realDeps)));
    }
  },
};
