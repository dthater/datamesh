<?php

/*
  1.5 2023-03-04 switch from mktime() to time() due to PHP 8.x
*/

// --- CONSTANTS

const DT_DATE_ISO = "Y-m-d";
const DT_DATE_NUMBER = "Ymd";
const DT_DATE_SQLITE = "Y-m-d";

const DT_DATETIME_ISO = "Y-m-d H:i:s";
const DT_DATETIME_NUMBER = "YmdHis";
const DT_DATETIME_SQLITE = "Y-m-d H:i:s";

// ---

function stripBreaks($lines) {
  return str_replace(array("\r\n", "\r", "\n"), " ", $lines);
}

function ensureString($value, $default = null) {
  $value = stripBreaks($value);
  return $value != null ? $value : ($default != null ? $default : "" );
}

// ---

function getParam($key, $maxlength = 255, $default = "") {
  $val = $key != null ? ($_GET[$key] != null ? $_GET[$key] : "") : "";
  return ensureString(substr(stripBreaks($val), 0, $maxlength), $default);
}

function getPostParam($key, $maxlength = 255, $default = "") {
  $val = $key != null ? ($_POST[$key] != null ? $_POST[$key] : "") : "";
  return ensureString(substr(stripBreaks($val), 0, $maxlength), $default);
}

function getPostGetParam($key, $maxlength = 255, $default = "") {
  return getPostParam( $key, $maxlength, getParam( $key, $maxlength, $default ));
}

function getGetPostParam($key, $maxlength = 255, $default = "") {
  return getParam( $key, $maxlength, getPostParam( $key, $maxlength, $default ));
}


// ---

function currentDate( $format ) {
  return date($format);
}

function currentDatetime( $format ) {
  return date($format, time());
}

function now() {
  return currentDatetime(DT_DATETIME_SQLITE, time());
}

?>
