ALTER TABLE listings ADD COLUMN content_revision INTEGER NOT NULL DEFAULT 1;
--> statement-breakpoint
CREATE TABLE listing_reviews (
 listing_id TEXT PRIMARY KEY NOT NULL REFERENCES listings(id),
 state TEXT NOT NULL DEFAULT 'pending' CHECK(state IN ('pending','approved','needs_changes')),
 note TEXT NOT NULL DEFAULT '',
 reviewed_by TEXT,
 reviewed_at TEXT,
 updated_at TEXT NOT NULL
);
--> statement-breakpoint
CREATE INDEX listing_reviews_state ON listing_reviews(state);
--> statement-breakpoint
CREATE TABLE trusted_sellers (
 seller_id TEXT PRIMARY KEY NOT NULL,
 approved_by TEXT NOT NULL,
 approved_at TEXT NOT NULL
);
