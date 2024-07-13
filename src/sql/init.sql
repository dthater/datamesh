-- VERSION 1.2
-- (c) by Damian Thater 2021

/*  
CHANGELOG
2021-06-26 Added info.ref_counter 
*/

CREATE TABLE IF NOT EXISTS info (
  uuid TEXT PRIMARY KEY,
  text TEXT UNIQUE NOT NULL,
  counter INTEGER NOT NULL DEFAULT 0,
	url TEXT,
	body TEXT,
	ref_counter INTEGER NOT NULL DEFAULT 0,
  rec_new DATETIME NOT NULL DEFAULT(STRFTIME('%Y-%m-%d %H:%M:%f', 'NOW'))
);

CREATE TABLE IF NOT EXISTS relationship (
	uuid TEXT PRIMARY KEY,
	info_uuid TEXT NOT NULL,
	rel_info_uuid TEXT NOT NULL,
	text TEXT NOT NULL,
	options TEXT
);

CREATE TABLE IF NOT EXISTS attribute (
	uuid TEXT PRIMARY KEY,
	info_uuid TEXT NOT NULL,
	text TEXT NOT NULL,
	options TEXT
);

--CREATE UNIQUE INDEX IF NOT EXISTS latest_unique_key_locale ON latest( locale, key );
