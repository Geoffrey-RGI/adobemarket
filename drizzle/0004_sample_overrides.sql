CREATE TABLE sample_overrides (
 id TEXT PRIMARY KEY NOT NULL,
 data TEXT NOT NULL,
 visible INTEGER NOT NULL DEFAULT 1 CHECK(visible IN (0,1)),
 updated_by TEXT NOT NULL,
 updated_at TEXT NOT NULL
);
