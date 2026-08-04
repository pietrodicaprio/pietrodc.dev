-- Tracks the last confirm-email send per address, to throttle resends
-- (anti subscription-bombing cooldown in /api/subscribe).
ALTER TABLE subscribers ADD COLUMN confirm_sent_at TEXT;
