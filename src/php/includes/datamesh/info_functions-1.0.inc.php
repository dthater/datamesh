<?php

/* Changes: 2021-02-13 */

class Info {
  public $uuid, $text, $counter, $ref_counter, $url, $body, $rank, $status, $rating;
  private $rec_new, $rec_update;

  function __construct(){
    // empty object
  }
  
  function objectFromRow($row){
    return (object)[
      "uuid"         => $row["uuid"],
      "text"         => $row["text"],
      "counter"      => $row["counter"],
      "timestamp"    => $row["rec_new"],
      "recUpdate"    => $row["rec_update"],
      #"ref_counter"  => $row["ref_counter"],
      "url"          => $row["url"],
      "body"         => $row["body"],
      "rank"         => $row["rank"],
      "status"       => $row["status"],
      "rating"       => $row["rating"],
    ];
  }

  function fromRow($row){

    $this->uuid         = $row["uuid"];

    $t = $row["text"];
    if (!json_encode($t)) {
      $t = "ERROR encoding text in $this->uuid!";
    }
    // $t = preg_replace( "/(.)/", "x", $t)

    $this->text         = $t;
    $this->counter      = $row["counter"];
    $this->timestamp    = $row["rec_new"];
    $this->recUpdate    = $row["rec_update"];
    //$this->ref_counter  = $row["ref_counter"];
    $this->url          = $row["url"];
    $this->body         = $row["body"];
    $this->rank         = $row["rank"];
    $this->status       = $row["status"];
    $this->rating       = $row["rating"];
    return $this;
  }

  function generateId(){
    $this->uuid = uniqid(rand(1000, 9999));
  }

  function setBody($value){
    $oldValue = $this->body;

    if (!$oldValue){
      // take whatever value, if there is no existing value at all.
      $this->body = $value;
    } else if ($oldValue && !$value){
      // ignore values, that lead into data loss
    } else if ($oldValue && $value){
      // update body
      $this->body = $value;
    }
  }

  function setText($value){
    $this->text = $value;
  }

  function setUrl($value){
    $this->url = $value;
  }

  function incCounter(){
    $this->counter++;
  }
}

class Ranking {
  public $uuid, $rating;
  
  function __construct( $row ){
    $this->uuid         = $row["uuid"];
    $this->rating       = $row["rating"];
  }
}

class InfoCommand extends BaseCommand {

  function fetchCount($db){
    $total = 0;
    $stmt = $db->prepare('select count(*) as total from info');
    $result = $stmt->execute();
    $arr = $result->fetchArray();
    $total = $arr["total"];
    return $total;
  }

  function fetchInfo($db, $uuid){
    if ($uuid){
      $stmt = $db->prepare('SELECT uuid, text, counter, strftime("%Y-%m-%dT%H:%M:%f", rec_new) AS rec_new , strftime("%Y-%m-%dT%H:%M:%f", rec_update) AS rec_update, ref_counter, url, body, rank, status, rating FROM info WHERE uuid = :uuid');
      $stmt->bindValue( "uuid" , $uuid, SQLITE3_TEXT );
      $result = $stmt->execute();
      $r = $result->fetchArray(SQLITE3_ASSOC);
      if (count($r)){
        $i = (new Info())->fromRow($r);
        return $i;
      } 
    }
    return null;
  }

  function updateInfo($db, $info){
    $stmt = $db->prepare('UPDATE info SET text = :text, body = :body, url = :url, counter = counter + 1, rec_update = STRFTIME("%Y-%m-%d %H:%M:%f", "NOW") WHERE uuid = :uuid');
    $stmt->bindValue( "uuid" , $info->uuid, SQLITE3_TEXT );
    $stmt->bindValue( "text" , $info->text, SQLITE3_TEXT );
    $stmt->bindValue( "body" , $info->body, SQLITE3_TEXT );
    $stmt->bindValue( "url" , $info->url, SQLITE3_TEXT );
    $stmt_result = $stmt->execute();
  }

  function persistInfo($db, $info){
    if ($info->uuid){
      $stmt = $db->prepare('UPDATE info SET text = :text, body = :body, url = :url, counter = counter + 1, rec_update = STRFTIME("%Y-%m-%d %H:%M:%f", "NOW") WHERE uuid = :uuid');
    } else {
      $info->generateId(); 
      $stmt = $db->prepare('INSERT INTO info (uuid, text, url, body) VALUES( :uuid, :text, :url, :body )');
    }
    $stmt->bindValue( "uuid" , $info->uuid, SQLITE3_TEXT );
    $stmt->bindValue( "text" , $info->text, SQLITE3_TEXT );
    $stmt->bindValue( "body" , $info->body, SQLITE3_TEXT );
    $stmt->bindValue( "url" , $info->url, SQLITE3_TEXT );
    $stmt_result = $stmt->execute();
    // error_log($stmt_result, E_NOTICE);
  }

}

class QueryInfoV1Command extends InfoCommand {
  function execute( $db, $session, $payload ) {

    error_log("Starting QueryInfoV1Command");

    /*
    $payload->time = getParam('t',30, 0);
    $payload->query = strtolower(urldecode(getParam('q', 1000, "")));
    $payload->param = getParam('p',30, "");
    */

    $order = "rec_update DESC";

    // $payload->query = ensure($payload->query, 1000, "=/="));
    if (!isset($payload->query)){
      $payload->query = "";
    }


    if ($payload->query){
      $order = "rec_update DESC";
    }

    $uuids = [];
    
    if (isset($payload->id)){
       error_log("Fetching details of $payload->id");

      $stmt = $db->prepare("SELECT uuid FROM info WHERE uuid = :uuid");
      $stmt->bindValue( "uuid" , $payload->uuid, SQLITE3_TEXT );

      $query = $stmt->execute();

      while ($r = $query->fetchArray(SQLITE3_ASSOC)) {
        $uuid = $r["uuid"];
        $uuids[] = $uuid;
      }
    } else {
      if (!isset($payload->limit)){ $payload->limit = 100; }
      if ($payload->limit > 1000){ $payload->limit = 1000; }
      if ($payload->limit < 1){ $payload->limit = 1; }

      if (!isset($payload->date)){ $payload->date = now(); }

      if (!$payload->query) {

        error_log("Quering details of $payload->query");
        // Exact search keywords
        $sql = "SELECT uuid FROM info 
        ORDER BY $order LIMIT :limit";

        $stmt = $db->prepare($sql);
        $stmt->bindValue( "limit" , $payload->limit, SQLITE3_TEXT );

        $query = $stmt->execute();

        //

        $countFetch = 0;

        while ($r = $query->fetchArray(SQLITE3_ASSOC)) {
          $uuid = $r["uuid"];
          // echo $uuid . "\n";
          $uuids[] = $uuid;
          $countFetch++;
        }

        error_log("Fetched $countFetch details 1.");

      } else {

        // Exact search keywords

        error_log("Quering exact details of $payload->query");

        $sql = "SELECT uuid FROM info 
        WHERE lower(text) = :key OR lower(url) = :key OR lower(body) = :key
        ORDER BY $order LIMIT :limit";

        $stmt = $db->prepare($sql);
        $stmt->bindValue( "key" , strtolower($payload->query), SQLITE3_TEXT );
        $stmt->bindValue( "limit" , $payload->limit, SQLITE3_TEXT );

        $query = $stmt->execute();

        $countFetch = 0;

        while ($r = $query->fetchArray(SQLITE3_ASSOC)) {
          $uuid = $r["uuid"];
          $uuids[] = $uuid;
          $countFetch++;
        }

        error_log("Fetched $countFetch details 2.");

        // search keywords abbreviations

        error_log("Quering abbr. details of $payload->query");

        $sql = "SELECT uuid FROM info 
        WHERE text like :key
        ORDER BY $order LIMIT :limit"; //  OR url like :key OR body like :key

        $stmt = $db->prepare($sql);
        $stmt->bindValue( "key" , "%($payload->query)%", SQLITE3_TEXT );
        $stmt->bindValue( "limit" , $payload->limit, SQLITE3_TEXT );

        $query = $stmt->execute();

        $countFetch = 0;

        while ($r = $query->fetchArray(SQLITE3_ASSOC)) {
          $uuid = $r["uuid"];
          $uuids[] = $uuid;
          $countFetch++;
        }

        error_log("Fetched $countFetch details 3.");

        // search keywords starts with

        error_log("Quering details starting with $payload->query");

        $sql = "SELECT uuid FROM info 
        WHERE text like :key OR url like :key OR body like :key
        ORDER BY $order LIMIT :limit";

        $stmt = $db->prepare($sql);
        $stmt->bindValue( "key" , "$payload->query%", SQLITE3_TEXT );
        $stmt->bindValue( "limit" , $payload->limit, SQLITE3_TEXT );

        $query = $stmt->execute();

        $countFetch = 0;

        while ($r = $query->fetchArray(SQLITE3_ASSOC)) {
          $uuid = $r["uuid"];
          $uuids[] = $uuid;
          $countFetch++;
        }

        error_log("Fetched $countFetch details 4.");

        // inline search keywords

        error_log("Quering details containing $payload->query");

        $sql = "SELECT uuid FROM info 
        WHERE text like :key OR url like :key OR body like :key
        ORDER BY $order LIMIT :limit";

        $stmt = $db->prepare($sql);
        $stmt->bindValue( "key" , "%$payload->query%", SQLITE3_TEXT );
        $stmt->bindValue( "limit" , $payload->limit, SQLITE3_TEXT );

        $query = $stmt->execute();

        $countFetch = 0;

        while ($r = $query->fetchArray(SQLITE3_ASSOC)) {
          $uuid = $r["uuid"];
          $uuids[] = $uuid;
          $countFetch++;
        }

        error_log("Fetched $countFetch details 5.");

      }

      $uuids = array_unique($uuids, SORT_REGULAR); // ATTENTION! do not sort.

      error_log("Fetched ".count($uuids)." details 6.");

    }

    $infos = [];

    error_log("Fetching infos for each detail.");

    foreach ($uuids as $uuid ) {

      //$uuids[] = $uuid;

      $info = (object)[
        "uuid" => $uuid
      ];

      $stmt = $db->prepare("SELECT text, rel_info_uuid as uuid FROM relationship WHERE info_uuid = :info_uuid");
      $stmt->bindValue( "info_uuid" , $uuid, SQLITE3_TEXT );
      $relationships_result = $stmt->execute();
    
      while ($dr = $relationships_result->fetchArray(SQLITE3_ASSOC)) {
        $uuids[] = $dr["uuid"];
        $info->downstream_relations[] = (object)[
          "uuid" => $dr["uuid"],
          "text" => $dr["text"]
        ];
      }

      $stmt = $db->prepare("SELECT text, info_uuid as uuid FROM relationship WHERE rel_info_uuid = :info_uuid");
      $stmt->bindValue( "info_uuid" , $uuid, SQLITE3_TEXT );
      $relationships_result = $stmt->execute();
    
      while ($dr = $relationships_result->fetchArray(SQLITE3_ASSOC)) {
        $uuids[] = $dr["uuid"];
        $info->upstream_relations[] = (object)[
          "uuid" => $dr["uuid"],
          "text" => $dr["text"]
        ];
      }

      $infos[] = $info;
    }

    $details = [];

    $uuids = array_unique($uuids);

    foreach($uuids as $uuid) {
      $infoObject = $this->fetchInfo($db, $uuid);
      if ($infoObject){
        $details[] = $infoObject;
      }
/*
    $sql = "SELECT uuid, text, counter, strftime('%Y-%m-%dT%H:%M:%f', rec_new) AS rec_new , ref_counter, url, body, rank, status, rating FROM info WHERE uuid = :uuid";
      $stmt = $db->prepare($sql);
      $stmt->bindValue( "uuid" , $uuid, SQLITE3_TEXT );
      $qDetails = $stmt->execute();
      $r = $qDetails->fetchArray(SQLITE3_ASSOC);
      $details[] = (new Info())->fromRow($r);
    */
    }

    $total = $this->fetchCount($db);

    error_log("Fetched $total infos in total.");

    $result = (object)[
      "entity" => $this->entity,
      "result" => "OK. Fetched links from DB.",
      "infos" => $infos,
      "details" => $details,
      "limit" => $payload->limit,
      "order" => $order,
      "query" => $payload->query,
      "sql" => $sql,
      "total" => $total
    ];

    if (!json_encode($result)){
      error_log("ERROR: Converting response info JSON failed.");
      http_response_code(500);
    }

    error_log("Returning result message: $result->result");

    return $result;
  }
}

class PutInfoV1Command extends InfoCommand {
  function execute( $db, $session, $payload ) {

    $link = $payload->link; // getPostParam('link', 1000, "");
    $uuid = $payload->uuid; // getPostParam('uuid', 30, "");
    $text = $payload->text; // getPostParam('text', 1000, "");
    $tags = $payload->tags; // getPostParam('tags', 1000, "");
    $body = $payload->body; // getPostParam('body', 10000, "");
    $url = $payload->url; // getPostParam('url', 1000, "");

    $info_uuid = $payload->info_uuid; // getPostParam('info_uuid', 30, "");
    $rel_info_uuid = $payload->rel_info_uuid; // getPostParam('rel_info_uuid', 30, "");

    /*
    $json = file_get_contents('php://input');
    if ($json){
        // Converts it into a PHP object
        $data = json_decode($json);
        $uuid = $data->uuid;
        $text = $data->text;
        $body = $data->body;
        $url = $data->url;
        $info_uuid = $data->info_uuid;
        $rel_info_uuid = $data->rel_info_uuid;
    }
    */

    if ($rel_info_uuid == "" && $info_uuid == ""){

        if ($text == ""){
            $result = "ERROR, Text required.";
            echo "{\n";
            echo "  \"result\": ".json_encode($result, JSON_PRETTY_PRINT)."\n";
            echo "}\n";
            http_response_code(502);
            exit;
        }   

        if (strstr($text, "https://")){
            $url = $text;
            $title = loadHtmlTitle($url);
            if (!!$title) {
                $text = $title;
            }
        }

        $existing_uuid = "null";

        if (!$uuid){
            // UUID eines vorherigen Infos nicht gegeben. Wir nehmen an, dass es sich um einen Insert handelt.
            // gibt es schon vergleichbare Inhalte?

            $stmt = $db->prepare('SELECT uuid FROM info WHERE text = :text');
            $stmt->bindValue( "text" , $text, SQLITE3_TEXT );
            $stmt_result = $stmt->execute();
            $fetch_result[] = $stmt_result->fetchArray(SQLITE3_ASSOC);
            // var_dump($fetch_result);
            $uuid = $fetch_result[0]["uuid"];
        }

        if (!$uuid){
            // Neuer Text ist noch nicht bekannt, also hinzufügen.
            $infoObject = new Info();
            $infoObject->setText($text); 
            $infoObject->setBody($body); 
            $infoObject->setUrl($url); 
            $this->persistInfo($db, $infoObject);
            $result = "OK, Put new link $uuid into DB. Text: $text, URL: $url";
        } else {
            // Neuer Text ist bekannt, also zusammenführen!
            $infoObject = $this->fetchInfo($db, $uuid);
            $infoObject->setText($text); 
            $infoObject->setBody($body); 
            $infoObject->setUrl($url); 
            $this->persistInfo($db, $infoObject);
            $result = "OK, Link $uuid has been updated. Text: $text, URL: $url";
        }
        
    } else {
        if (!$uuid){
            $uuid = uniqid(rand(1000, 9999));
        }

        $stmt = $db->prepare('INSERT INTO relationship (uuid, text, info_uuid, rel_info_uuid) 
            VALUES( :uuid, :text, :info_uuid, :rel_info_uuid ) 
            ON CONFLICT(uuid) 
            DO UPDATE SET text = :text, info_uuid = :info_uuid, rel_info_uuid = :rel_info_uuid;');
        $stmt->bindValue( "uuid" , $uuid, SQLITE3_TEXT );
        $stmt->bindValue( "info_uuid" , $info_uuid, SQLITE3_TEXT );
        $stmt->bindValue( "rel_info_uuid" , $rel_info_uuid, SQLITE3_TEXT );
        $stmt->bindValue( "text" , $text, SQLITE3_TEXT );
        $links_result = $stmt->execute();

        // Update relationship reference counters
        $stmt = $db->prepare('UPDATE info AS i SET ref_counter = (select count(1) FROM relationship WHERE info_uuid = i.uuid)');
        $links_result = $stmt->execute();

        $result = "OK, Relationship has been put into DB.";
    }

    $total = $this->fetchCount($db);

    return (object)[
      "entity" => $this->entity,
      "result" => "OK. $result.",
      "total" => $total
    ];
  }
}

class DeleteInfoV1Command extends InfoCommand {
  function execute( $db, $session, $payload ) {

    $uuid = $payload->uuid; // getPostGetParam('uuid', 100, "");

    if ($uuid == ""){
      http_response_code(502);
      throw new Exception("UUID required.");
    }
  
    $stmt = $db->prepare('DELETE FROM info WHERE uuid = :uuid');
    $stmt->bindValue( "uuid" , $uuid, SQLITE3_TEXT );
    $stmt->execute();

    $stmt = $db->prepare('DELETE FROM relationship WHERE info_uuid = :uuid');
    $stmt->bindValue( "uuid" , $uuid, SQLITE3_TEXT );
    $stmt->execute();

    $total = $this->fetchCount($db);

    return (object)[
      "entity" => $this->entity,
      "result" => "OK. Deleted link from DB.",
      "total" => $total
    ];

  }
}


class PutRatingV1Command extends InfoCommand {
  function execute( $db, $session, $payload ) {

    $uuid = $payload->uuid;
    $rating = $payload->rating;

    if ($uuid == ""){
      http_response_code(502);
      throw new Exception("UUID required.");
    }

    if ($rating == ""){
      http_response_code(502);
      throw new Exception("Rating required.");
    }
  
    $stmt = $db->prepare('UPDATE info SET rating = :rating WHERE uuid = :uuid');
    $stmt->bindValue( "uuid" , $uuid, SQLITE3_TEXT );
    $stmt->bindValue( "rating" , $rating, SQLITE3_TEXT );
    $stmt->execute();
    
    $total = $this->fetchCount($db);

    return (object)[
      "entity" => $this->entity,
      "result" => "OK. Updated rating.",
      "total" => $total
    ];

  }
}

?>