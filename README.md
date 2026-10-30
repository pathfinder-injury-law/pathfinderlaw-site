# pathfinderlaw.com

The website of Pathfinder Injury Law, a Virginia workers' compensation law firm.

- **How to look after the site** (making changes, undoing them, yearly chores, who to call): [docs/HOW-TO.md](docs/HOW-TO.md)
- How the contact form works: [docs/form-pipeline.md](docs/form-pipeline.md)

For developers: an Astro static site plus a small Cloudflare Worker for `/api/contact`, deployed by Cloudflare Workers Builds when `main` changes.

```sh
npm ci
PUBLIC_SITE_LIVE=1 PUBLIC_TURNSTILE_SITE_KEY=<public site key> npm run build
PUBLIC_SITE_LIVE=1 node --test tests/
```
