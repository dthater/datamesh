-- VERSION 2.0
-- (c) by Damian Thater 2021

ALTER TABLE info ADD COLUMN ref_counter INTEGER NOT NULL DEFAULT 0;

UPDATE info AS i SET ref_counter = (select count(1) FROM relationship WHERE info_uuid = i.uuid);