-- VERSION 6.0
-- (c) by Damian Thater 2022

-- Add rec_update wih default datetime. Needs Hack because sqlite3 has no implementation for ALTER COLUMN.

ALTER TABLE info RENAME TO info_old;

CREATE TABLE IF NOT EXISTS "info" (
  uuid TEXT PRIMARY KEY,
  text TEXT UNIQUE NOT NULL,
  counter INTEGER NOT NULL DEFAULT 0,
  rec_new DATETIME NOT NULL DEFAULT(STRFTIME('%Y-%m-%d %H:%M:%f', 'NOW')), 
  rec_update DATETIME NOT NULL DEFAULT(STRFTIME('%Y-%m-%d %H:%M:%f', 'NOW')), 
  ref_counter INTEGER NOT NULL DEFAULT 0, 
  url TEXT, 
  body TEXT, 
  rank NUMBER, 
  status INT, 
  rating INT
);

-- ATTENTION! Copying rec_new to rec_update initaially!
INSERT INTO info (uuid, text, counter, rec_new, rec_update, ref_counter, url, body, rank, status, rating)
  SELECT uuid, text, 0, rec_new, rec_new, ref_counter, url, body, rank, status, rating FROM info_old;

DROP TABLE info_old;
