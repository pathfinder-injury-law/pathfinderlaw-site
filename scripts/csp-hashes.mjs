// Astro build step: fills in the Content-Security-Policy's list of allowed inline scripts.
//
// The security policy in public/_headers only lets the browser run scripts that come from this
// site, from Cloudflare Turnstile (the form check) and from Cloudflare Web Analytics. The few small
// scripts written straight into each page (the menu, the motion helpers, the form) are allowed by
// their fingerprint (a "sha256 hash"), so nobody can slip a different script into a page.
//
// Those fingerprints change whenever the script text changes, so this step works them out on every
// build: it reads every built page in dist/, fingerprints each inline <script>, and writes the list
// into dist/_headers where public/_headers says {{INLINE_SCRIPT_HASHES}}. Nothing to do by hand.
// tests/security-headers.test.ts checks the result after every build.

import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const PLACEHOLDER = '{{INLINE_SCRIPT_HASHES}}';

// Script types the browser does not run as code are skipped (structured data).
const DATA_TYPES = /type\s*=\s*["']?application\/(ld\+)?json/i;

function htmlFiles(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...htmlFiles(full));
    else if (entry.name.endsWith('.html')) out.push(full);
  }
  return out;
}

// Every distinct inline script in the built site, as CSP source expressions ('sha256-...').
export function inlineScriptHashes(distDir) {
  const hashes = new Set();
  for (const file of htmlFiles(distDir)) {
    const html = readFileSync(file, 'utf8');
    for (const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
      const attrs = m[1];
      if (/\ssrc\s*=/i.test(attrs) || DATA_TYPES.test(attrs)) continue;
      hashes.add(`'sha256-${createHash('sha256').update(m[2], 'utf8').digest('base64')}'`);
    }
  }
  return [...hashes].sort();
}

export default function cspHashes() {
  return {
    name: 'pathfinder-csp-hashes',
    hooks: {
      'astro:build:done': ({ dir, logger }) => {
        const distDir = fileURLToPath(dir);
        const headersFile = join(distDir, '_headers');
        if (!existsSync(headersFile)) return;
        const text = readFileSync(headersFile, 'utf8');
        if (!text.includes(PLACEHOLDER)) return;
        const hashes = inlineScriptHashes(distDir);
        writeFileSync(headersFile, text.split(PLACEHOLDER).join(hashes.join(' ')));
        logger.info(`Content-Security-Policy: allowed ${hashes.length} inline script(s) by hash.`);
      },
    },
  };
}
