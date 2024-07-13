<?php

/* Changes: 2021-02-13 */

function newRandomUUID(){
  return uniqid(rand(1000, 9999));
}


const ACTION_QUERY = "query";
const ACTION_PUT = "put";
const ACTION_DELETE = "delete";


class BaseCommand {
  public $entity;
  public $action;
  public $version;
  //public $error;
  public function __construct( $entity, $action, $version ) {
    $this->entity = strtolower($entity);
    $this->action = strtolower($action);
    $this->version = $version;
  }
  public function matches( $entity, $action, $version ) {
    return $this->entity == strtolower($entity) && 
      $this->action == strtolower($action) && 
      $this->version == $version;
  } 
  public function execute( $db, $session, $payload ) {
    // printf( $payload );
  }
}


class BaseCommandController {
  protected $list = [];
  function run( $entity, $action, $version, $db, $session, $payload  ){
    foreach ($this->list as $command){
      if ($command->matches( $entity, $action, $version)){
        return $command->execute( $db, $session, $payload );
      }
    }
    return (object)[
      "error" => "No REST handler found."
    ];
  }
}


class EmptyCommand extends BaseCommand {
  public function __construct() {
    parent::__construct(null, null, null);
  }
  function matches( $entity, $action, $version ) {
    return $entity == "" || $action == "" || $version == "" || $version <= 0;
  } 
  function execute( $db, $session, $payload ) {
    return (object)[ "error" => "Unexpected entity, command or version" ];
  }
}


class UnknownCommand extends BaseCommand {
  public function __construct() {
    parent::__construct(null, null, null);
  }
  function matches( $entity, $action, $version ) {
    return true;
  }
  function execute( $db, $session, $payload ) {
    return (object)[];
  }
}

?>