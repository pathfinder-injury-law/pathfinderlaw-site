import { defineConfig } from 'astro/config';

// Static site. Every page is built ahead of time into plain files in dist/.
export default defineConfig({
  site: 'https://www.pathfinderlaw.com',
  output: 'static',
});
