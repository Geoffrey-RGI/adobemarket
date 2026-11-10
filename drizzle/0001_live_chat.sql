CREATE TABLE conversations (
 id TEXT PRIMARY KEY NOT NULL,
 listing_id TEXT NOT NULL REFERENCES listings(id),
 buyer_id TEXT NOT NULL,
 seller_id TEXT NOT NULL,
 buyer_read_id INTEGER NOT NULL DEFAULT 0,
 seller_read_id INTEGER NOT NULL DEFAULT 0,
 created_at TEXT NOT NULL,
 updated_at TEXT NOT NULL,
 UNIQUE(listing_id,buyer_id),
 CHECK(buyer_id <> seller_id)
);
--> statement-breakpoint
CREATE INDEX conversations_buyer_updated ON conversations(buyer_id,updated_at);
--> statement-breakpoint
CREATE INDEX conversations_seller_updated ON conversations(seller_id,updated_at);
--> statement-breakpoint
CREATE TABLE messages (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 conversation_id TEXT NOT NULL REFERENCES conversations(id),
 sender_id TEXT NOT NULL,
 client_id TEXT NOT NULL,
 body TEXT NOT NULL CHECK(length(body) BETWEEN 1 AND 2000),
 created_at TEXT NOT NULL,
 UNIQUE(conversation_id,sender_id,client_id)
);
--> statement-breakpoint
CREATE INDEX messages_conversation_id ON messages(conversation_id,id);
--> statement-breakpoint
CREATE INDEX messages_sender_time ON messages(sender_id,created_at);
