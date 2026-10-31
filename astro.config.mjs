import { defineConfig } from 'astro/config';
import cspHashes from './scripts/csp-hashes.mjs';

// Static site. Every page is built ahead of time into plain files in dist/.
// The main address has no www (migration plan, Section VI). Canonical tags
// and sitemaps are built from this value.
export default defineConfig({
  site: 'https://pathfinderlaw.com',
  output: 'static',
  // Keep the spaces between words and links when text is written across lines.
  // With compression on, Astro drops them ("forworkers' compensation").
  compressHTML: false,
  // Fills in the security policy's list of allowed inline scripts in dist/_headers (see the script).
  integrations: [cspHashes()],
  // Astro builds CSS for the newest browsers only, so the minifier strips the -webkit- prefixes
  // (no blur on iPhones before iOS 18) and rewrites max-width/min-width media queries into a
  // newer form iOS 16.3 and older ignore. Naming older browsers here keeps both working.
  vite: {
    build: {
      cssTarget: ['chrome111', 'edge111', 'firefox114', 'safari15', 'ios15'],
    },
  },
});
