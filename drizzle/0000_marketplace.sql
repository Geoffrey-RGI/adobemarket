CREATE TABLE profiles (
 user_id TEXT PRIMARY KEY NOT NULL,
 name TEXT NOT NULL,
 phone TEXT NOT NULL,
 region TEXT NOT NULL,
 town TEXT NOT NULL,
 created_at TEXT NOT NULL,
 updated_at TEXT NOT NULL
);
--> statement-breakpoint
CREATE TABLE listings (
 id TEXT PRIMARY KEY NOT NULL,
 owner_id TEXT NOT NULL REFERENCES profiles(user_id),
 name TEXT NOT NULL,
 produce TEXT NOT NULL,
 category TEXT NOT NULL,
 measure TEXT NOT NULL,
 price REAL NOT NULL CHECK(price > 0),
 min INTEGER NOT NULL CHECK(min >= 1),
 qty INTEGER NOT NULL CHECK(qty >= 1),
 region TEXT NOT NULL,
 town TEXT NOT NULL,
 available TEXT NOT NULL,
 description TEXT NOT NULL,
 delivery TEXT NOT NULL,
 image_key TEXT NOT NULL,
 status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','paused','sold')),
 created_at TEXT NOT NULL,
 updated_at TEXT NOT NULL
);
--> statement-breakpoint
CREATE INDEX listings_status_created ON listings(status, created_at);
--> statement-breakpoint
CREATE INDEX listings_owner ON listings(owner_id);
--> statement-breakpoint
CREATE TABLE uploads (
 id TEXT PRIMARY KEY NOT NULL,
 owner_id TEXT NOT NULL,
 image_key TEXT NOT NULL UNIQUE,
 content_type TEXT NOT NULL,
 created_at TEXT NOT NULL
);
--> statement-breakpoint
CREATE INDEX uploads_owner ON uploads(owner_id);
