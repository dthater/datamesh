<?php

include_once "datamesh/base_functions-1.0.inc.php";
include_once "datamesh/info_functions-1.0.inc.php";

class CommandController extends BaseCommandController {
  function __construct(){
    $this->list[] = new EmptyCommand(); // Asserts
    // TODO: respect context! like "food"
    
    $this->list[] = new QueryInfoV1Command(Info::class, ACTION_QUERY, 1);
    $this->list[] = new PutInfoV1Command(Info::class, ACTION_PUT, 1);
    $this->list[] = new DeleteInfoV1Command(Info::class, ACTION_DELETE, 1);
    $this->list[] = new PutRatingV1Command(Rating::class, ACTION_PUT, 1);

    $this->list[] = new UnknownCommand(); // Failover
  }
}


// Beispiel #3 Fehlermeldungen in Exceptions umwandeln
// https://www.php.net/manual/de/language.exceptions.php
/*
function exceptions_error_handler($severity, $message, $filename, $lineno) {
  throw new ErrorException($message, 0, $severity, $filename, $lineno);
}
set_error_handler('exceptions_error_handler');
*/
?>