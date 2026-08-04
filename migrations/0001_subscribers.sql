-- Newsletter subscribers with double opt-in.
-- status: pending (awaiting confirmation) -> confirmed -> unsubscribed
CREATE TABLE IF NOT EXISTS subscribers (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  email             TEXT NOT NULL,
  email_norm        TEXT NOT NULL UNIQUE,          -- lowercased, for dedupe/lookup
  locale            TEXT NOT NULL DEFAULT 'it',
  status            TEXT NOT NULL DEFAULT 'pending',
  confirm_token     TEXT,                          -- consumed on confirm
  unsub_token       TEXT NOT NULL,                 -- stable per subscriber
  created_at        TEXT NOT NULL DEFAULT (datetime('now')),
  confirmed_at      TEXT,
  unsubscribed_at   TEXT
);

CREATE INDEX IF NOT EXISTS idx_subscribers_status ON subscribers (status);
CREATE INDEX IF NOT EXISTS idx_subscribers_confirm ON subscribers (confirm_token);
CREATE INDEX IF NOT EXISTS idx_subscribers_unsub ON subscribers (unsub_token);
