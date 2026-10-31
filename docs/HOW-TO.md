# How to look after the Pathfinder website

Plain-English notes for Bryn and for anyone who helps with the site later. No passwords or secret values are in this file, and none should ever be added.

For the contact form in detail (how it screens spam, the daily emails, the alarms), see [form-pipeline.md](form-pipeline.md).

## Where the site lives

| What | Where |
| --- | --- |
| The code and words | GitHub: **pathfinder-injury-law/pathfinderlaw-site** (branch `main` is the live site) |
| Hosting | Cloudflare, account **Pathfinder Injury Law**. The site is the Worker **pathfinderlaw-site** (Workers & Pages). |
| Previews | Cloudflare, separate account **Pathfinder Previews**, Worker **site-preview** (settings in `wrangler.preview.jsonc`) |
| Form log | Cloudflare D1 database **pathfinder-forms** (production account) |
| Form screening rules | Cloudflare KV, bound to the Worker as `SETTINGS`, key `rules` |
| Bot check on the form | Cloudflare Turnstile (production account) |
| Visitor counts | Cloudflare Web Analytics (production account) |
| Domain name (pathfinderlaw.com) | Registered at Namecheap. Its DNS is run by Cloudflare. |
| Email (admin@ and the inboxes the form writes to) | Google Workspace |

The site is a set of ready-made pages (built with Astro) plus one small program (the Worker) that only handles the contact form at `/api/contact` and two early-morning jobs.

## How a change goes live

Nothing goes live until it is merged into `main`. The steps:

1. The change is made on its own **branch** (a working copy with a short name, such as `fix-office-hours`).
2. A **pull request** is opened on GitHub for that branch. GitHub runs the automatic checks (build, tests, broken links, em dashes, one main heading per page). A green check mark means they passed; a red X means look at "Details" before going on.
3. Review the change on GitHub ("Files changed"). If it looks right, approve it while signed in as **pathfinderlaw-admin** (every change needs that approval).
4. Press **Merge pull request**.
5. Cloudflare builds and publishes the new version by itself. It takes **about 2 minutes**. Reload the page to see it (a hard reload, Shift and the reload button, if the old page still shows).

## How to undo a change (roll back)

Pick whichever is quicker:

- **Cloudflare (fastest, about 1 minute):** Cloudflare dashboard, production account, **Workers & Pages**, **pathfinderlaw-site**, **Deployments**. Find the last version that was fine and choose **Rollback** (in its "..." menu). The site switches back at once. The code on GitHub stays as it is, so also do the next step later, or the bad change returns with the next merge.
- **GitHub (permanent):** open the merged pull request and press **Revert**. That makes a new pull request that undoes it. Approve and merge it like any other change; it is live in about 2 minutes.

## Where the secrets live (names only)

All four are Worker secrets on **pathfinderlaw-site** (Cloudflare, Workers & Pages, pathfinderlaw-site, Settings, Variables and Secrets). Their values can be replaced there but never read back, and they must never be written in the code or in this file.

- `GOOGLE_SA_KEY`: the Google key that lets the form send email from admin@
- `TURNSTILE_SECRET`: the bot check's secret key
- `HEARTBEAT_URL`: the check-in service's "I am alive" address
- `ALERT_URL`: the check-in service's "something failed" address

One more setting that is **not** secret: `PUBLIC_TURNSTILE_SITE_KEY` (the bot check's public key, shown in every page). It is a Build variable on the same Worker (Settings, Build, Variables and secrets).

## Chores by the calendar

**Every morning (a glance):**
- On a normal day you get **no** emails about the form. The morning self-test (about 7:15 a.m.) goes only to the admin@ mailbox, and the outside check-in service (Healthchecks.io) quietly records that it worked.
- You get an email only when something needs attention, and it says in plain words what to do:
  - From the website (about 7:30 a.m.): a message that never reached the inbox (it lists who to call back), the spam filter being down, or three days with no messages at all.
  - From Healthchecks.io: the morning self-test did not run or could not send email. Send a test from the website on your phone, and get help if it does not arrive.

**Each week:**
- **Dependabot pull requests.** Every Monday GitHub checks for newer versions of the building blocks the site uses and opens a pull request for any it finds (small updates come grouped together). If its checks are green, approve and merge it as usual. If the checks are red, leave it and ask for help; nothing is broken on the live site, since nothing changes until a merge.

**Twice a year (daylight saving time):**
- The morning jobs run on UTC (world time), so their hour changes when the clocks do. In **March 2027** (daylight time starts March 14, 2027), edit `wrangler.jsonc` and change the two times from `"15 12 * * *"` and `"30 12 * * *"` to `"15 11 * * *"` and `"30 11 * * *"`. Change only the hour (12 to 11); keep the minutes 15 and 30. In **November**, when standard time returns, change 11 back to 12. Merge it like any other change.

**Each year:**
- **Domain renewal** at Namecheap (check that auto-renew is on and the card is current).
- **Early January:** the copyright year in the footer comes from the date the site was last built, so it changes only after the next merge. If nothing has been merged since New Year, merge any small change (or ask for one).
- Check that the office hours and addresses are still right.

## How to change the phone number, hours or offices

They are all in one file: **`src/data/site.ts`**. Edit the text between the quotation marks:

- Phone: `phoneDisplay` (shown as `(804) 505-0633`), `phoneHeader` (shown as `804-505-0633`) and `phoneHref` (the dialing form, `tel:+1` followed by the ten digits). Change all three together. The phone number also appears in the structured data in `src/layouts/Base.astro` (search for `telephone`) and in the home page description in `src/pages/index.astro`.
- Hours: the `hours` list.
- Offices: the `offices` list (name, two address lines, and the Google Maps link).

The menu is in the same file (`nav`).

## How to add a blog post

1. Copy any file in **`src/blog-posts/`** and give the copy a new name made of lower-case words joined by hyphens. The file name becomes the web address: `my-new-post.md` becomes `pathfinderlaw.com/my-new-post/`.
2. At the top, between the two `---` lines, change `title` (the headline), `metaTitle` (the title Google shows), `description` (the summary Google shows), `date` and `updated` (for example `2026-11-15T12:00:00Z`) and `tags`.
3. Replace the text below with the new post. `##` starts a heading; `[words](/some-page/)` makes a link. Keep the disclaimer paragraph at the top.
4. Open a pull request. The post appears on the Blog page, in the sitemap and in the feed by itself.

Avoid em dashes (the long dash); the checks will flag them. A comma, colon or full stop works instead.

## How to add a new page

1. Make a folder in **`src/pages/`** named the way the address should read, with an `index.astro` file inside (copy a similar page, such as a city page or an info page, and change the words). The folder name is the address: `src/pages/new-page/index.astro` becomes `pathfinderlaw.com/new-page/`.
2. Add the address to the right list in **`src/data/sitemaps.ts`** so search engines find it.
3. Link to it from a menu (`src/data/site.ts`) or from a related page.
4. Never rename or remove an existing page without adding a permanent redirect for its old address to **`public/_redirects`** (one line: old address, new address, `301`).

## Safety settings worth knowing about

- **Security headers** are in `public/_headers`. The Content-Security-Policy there lists every outside service the pages may load (today only Cloudflare Turnstile and Cloudflare Web Analytics). If a new outside service is ever added (a map, a video, a chat box, a booking tool), its address must be added there too, or browsers will block it.
- The site tells browsers to always use the secure (https) address (HSTS). Joining the browsers' built-in "preload" list is a separate, deliberate step that is hard to undo; it has not been done.

## Who to call for what

| Problem | Who |
| --- | --- |
| Site down, slow, or showing an error; form not sending; anything in the Cloudflare dashboard | **Cloudflare** (support from the dashboard: the "?" menu, Support). Also check cloudflarestatus.com. |
| Domain name renewal, ownership, or the bill for pathfinderlaw.com | **Namecheap** (the registrar) |
| Email not arriving in the inboxes; admin@ password; the Google key the form uses | **Google Workspace** support (admin.google.com, Support) |
| A change to the words, a page, or the code | Open a pull request, or ask a developer (or Claude) to make one |
| GitHub sign-in or the pathfinderlaw-admin account | **GitHub** support |
