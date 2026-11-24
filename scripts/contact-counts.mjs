// Prints the call-tap and form-send counts (src/worker/counts.ts) from the live database.
// Read only. Needs a Wrangler login to the firm's Cloudflare account; there is no public readout.
//
//   npm run counts            last 30 days, totals by page
//   npm run counts -- 7       last 7 days
//   npm run counts -- 30 day  last 30 days, one line per day and page
//
// The table holds only a day, a page path, a kind (call or form), and a count. No visitor data.
import { execFileSync } from 'node:child_process';

const days = Math.max(1, Math.min(400, Number(process.argv[2]) || 30));
const byDay = process.argv[3] === 'day';
const since = new Date(Date.now() - days * 86_400_000).toLocaleDateString('en-CA', { timeZone: 'America/New_York' });

const sql = byDay
  ? `SELECT day, page, SUM(CASE WHEN kind='call' THEN count ELSE 0 END) AS calls, SUM(CASE WHEN kind='form' THEN count ELSE 0 END) AS forms
     FROM contact_counts WHERE day >= '${since}' GROUP BY day, page ORDER BY day DESC, calls + forms DESC`
  : `SELECT page, SUM(CASE WHEN kind='call' THEN count ELSE 0 END) AS calls, SUM(CASE WHEN kind='form' THEN count ELSE 0 END) AS forms
     FROM contact_counts WHERE day >= '${since}' GROUP BY page ORDER BY calls + forms DESC, page`;

const out = execFileSync('npx', ['wrangler', 'd1', 'execute', 'pathfinder-forms-us', '--remote', '--json', '--command', sql], {
  encoding: 'utf8',
  stdio: ['ignore', 'pipe', 'inherit'],
});
const rows = JSON.parse(out)[0]?.results ?? [];
console.log(`Call taps and form sends since ${since} (Eastern time)${byDay ? ', by day' : ''}:`);
if (!rows.length) console.log('  none yet');
else console.table(rows);
const total = (k) => rows.reduce((n, r) => n + (r[k] ?? 0), 0);
console.log(`Total: ${total('calls')} call taps, ${total('forms')} form sends.`);
