<?php

// ---

function sizeOfFile( $filepath ) {
  return filesize($filepath);
}

function appendToTextFile( $filepath, $line ) {
  $handle = fopen($filepath, "a");
  fwrite($handle, $line . PHP_EOL);
  fclose($handle);
}

function writeToTextFile( $filepath, $contents ) {
  $handle = fopen($filepath, "w");
  fwrite($handle, $line . PHP_EOL);
  fclose($handle);
}

function readFromTextFile( $filepath ) {
  $handle = fopen($filepath, "r");
  $contents = fread($handle, filesize($filepath));
  fclose($handle);
  return $contents;
}



?>