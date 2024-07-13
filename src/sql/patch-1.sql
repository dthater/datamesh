-- VERSION 1.1
-- (c) by Damian Thater 2021

ALTER TABLE info RENAME TO info_old;

CREATE TABLE info (
	uuid TEXT PRIMARY KEY,
	text TEXT UNIQUE NOT NULL,
rec_new DATETIME NOT NULL DEFAULT(STRFTIME('%Y-%m-%d %H:%M:%f', 'NOW'))
);

INSERT OR IGNORE INTO info (uuid, text, rec_new)  
	SELECT uuid, text, rec_new FROM info_old;

DROP TABLE info_old;
