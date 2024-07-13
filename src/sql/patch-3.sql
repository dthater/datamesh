-- VERSION 3.0
-- (c) by Damian Thater 2021

ALTER TABLE info ADD COLUMN url TEXT;

-- select * from info WHERE text like "https://%" OR text like "http://%";

UPDATE info SET url = text WHERE url is null AND (text like "https://%" OR text like "http://%");

-- select * from info WHERE url = text;
