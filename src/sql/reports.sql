-- VERSION 1.0
-- (c) by Damian Thater 2021

.headers on

-- Zeige alle Beziehungen, die nicht mehr mit den Infos verknüpft sind.
SELECT uuid,info_uuid,rel_info_uuid,text,options 
FROM relationship 
WHERE info_uuid NOT IN (SELECT uuid FROM info);

-- Liste alle doppelten Infos (nach Text).
select uuid, text, (select count(1) from relationship where info_uuid = i.uuid) relationships
from info_old i where text in (
	select text from info_old group by text having count(1) > 1
) order by text;

-- Zeige alle Infos mit unsichtbarem Umbruch am Ende.
select uuid, text from info  where unicode(substr(text, -1)) in (10, 13, 27, 9);
