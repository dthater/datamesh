-- VERSION 1.0
-- (c) by Damian Thater 2017

BEGIN TRANSACTION;

insert or replace into translation  (locale_id, key_id, text, lastchange_date, verified, verified_date)
select t.locale, k.id, t.text, CURRENT_TIMESTAMP, 1, t.rec_new from history t 
join key k on k.text = t.key
WHERE t.uuid in (
    SELECT max(u.uuid) FROM history u GROUP BY u.locale, u.key
);

COMMIT;
