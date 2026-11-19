-- Intake sheet push (src/worker/sheet.ts). Additive only: no existing column changes,
-- and rows from before the push was switched on keep sheet_status NULL (never back-filled).
-- None of these columns holds personal data.
ALTER TABLE submissions ADD COLUMN route TEXT;          -- priority | possible | refer | unlikely (step-by-step form only)
ALTER TABLE submissions ADD COLUMN sheet_status TEXT;   -- NULL (not for the sheet) | pending | sending | sent | failed | gave_up
ALTER TABLE submissions ADD COLUMN sheet_tries INTEGER NOT NULL DEFAULT 0;
ALTER TABLE submissions ADD COLUMN sheet_at TEXT;       -- ISO 8601, UTC, of the last try
ALTER TABLE submissions ADD COLUMN sheet_detail TEXT;   -- error code only, e.g. 'network', 'app_bad_signature'

CREATE INDEX IF NOT EXISTS idx_submissions_sheet ON submissions (sheet_status, created_at);
