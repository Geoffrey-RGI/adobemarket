CREATE TABLE listing_moderation (
 listing_id TEXT PRIMARY KEY NOT NULL REFERENCES listings(id),
 hidden INTEGER NOT NULL DEFAULT 0 CHECK(hidden IN (0,1)),
 reason TEXT NOT NULL,
 updated_by TEXT NOT NULL,
 updated_at TEXT NOT NULL
);
--> statement-breakpoint
CREATE TABLE account_flags (
 user_id TEXT PRIMARY KEY NOT NULL,
 suspended INTEGER NOT NULL DEFAULT 0 CHECK(suspended IN (0,1)),
 reason TEXT NOT NULL,
 updated_by TEXT NOT NULL,
 updated_at TEXT NOT NULL
);
--> statement-breakpoint
CREATE TABLE reports (
 id TEXT PRIMARY KEY NOT NULL,
 reporter_id TEXT NOT NULL,
 target_type TEXT NOT NULL CHECK(target_type IN ('listing','message')),
 target_id TEXT NOT NULL,
 target_user_id TEXT NOT NULL,
 reason TEXT NOT NULL,
 details TEXT NOT NULL,
 evidence TEXT NOT NULL,
 status TEXT NOT NULL DEFAULT 'open' CHECK(status IN ('open','resolved','dismissed')),
 resolution_note TEXT NOT NULL DEFAULT '',
 reviewed_by TEXT,
 created_at TEXT NOT NULL,
 updated_at TEXT NOT NULL,
 UNIQUE(reporter_id,target_type,target_id)
);
--> statement-breakpoint
CREATE INDEX reports_status_created ON reports(status,created_at);
--> statement-breakpoint
CREATE TABLE moderation_audit (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 admin_id TEXT NOT NULL,
 action TEXT NOT NULL,
 target_id TEXT NOT NULL,
 reason TEXT NOT NULL,
 created_at TEXT NOT NULL
);
