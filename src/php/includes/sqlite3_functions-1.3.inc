<?php

function chooseSqlite( $file1, $file2 ){
    if (file_exists($file1)){
        return $file1;
    }
    if (file_exists($file2)){
        return $file2;
    }
    return "";
}

function openSqlite( $filepath ){
  $db = new SQLite3($filepath);
  //$db->setAttribute(SQLite3::ATTR_ERRMODE, SQLite3::ERRMODE_EXCEPTION);
  $db->busyTimeout(5000);

  // WAL mode has better control over concurrency: https://www.sqlite.org/wal.html
  $db->exec('PRAGMA journal_mode = wal;');
  return $db;
}

function closeSqlite( $db ){
  $db->close();
}

?>