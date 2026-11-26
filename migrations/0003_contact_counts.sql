-- Daily tallies of call-button taps and contact-form sends, by page.
-- One row per (day, page, kind) holding a running count. Nothing about the
-- visitor is stored: no IP address, browser, cookie, name, or message. The
-- count for one row stops at 100 a day (see src/worker/counts.ts), so a bot
-- cannot use this table to run up the database's daily write allowance that
-- the contact form depends on.
-- Numbered 0003 because 0002 is held by the Intake sheet branch (PR 138).
CREATE TABLE IF NOT EXISTS contact_counts (
  day   TEXT NOT NULL,                              -- YYYY-MM-DD, Eastern time
  page  TEXT NOT NULL,                              -- the page's path, e.g. /contact/
  kind  TEXT NOT NULL CHECK (kind IN ('call', 'form')),
  count INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (day, page, kind)
);
