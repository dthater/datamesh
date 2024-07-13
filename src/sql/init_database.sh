#!/bin/bash

echo "Init sqlite database."

DB=../php/database/links.sqlite

sqlite3 $DB < init.sql
sqlite3 $DB < patch-1.sql
sqlite3 $DB < patch-2.sql
sqlite3 $DB < patch-3.sql
sqlite3 $DB < patch-4.sql
sqlite3 $DB < patch-5.sql
sqlite3 $DB < patch-6.sql
