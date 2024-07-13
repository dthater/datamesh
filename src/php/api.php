<?php
    #declare(strict_types=1);

    include_once "includes/common_functions-1.5.inc";
    include_once "includes/sqlite3_functions-1.3.inc";
    include_once "includes/rest_functions-1.0.inc.php";
    include_once "includes/datamesh_functions-1.0.inc.php";

    http_response_code(200);

    $db = null;
    $result = new stdClass(); // entspricht $result = (object) [];
    $commandControler = new CommandController();
        
    try {
        $db = openSqlite("database/links.sqlite");

        $method = $_SERVER['REQUEST_METHOD'];

        if ($method == "POST"){           

            $req = fetchJsonBodyFromRequest();

            // Assert for json body
            if (!$req){
                throw new Exception("Expected to receive a JSON body. Check the syntax of your post.");
            }  

            $result = $commandControler->run( $req->entity, $req->action, $req->version, $db, isset($req->session) ? $req->session : 0, $req->payload );
        }
        
    } catch (Exception $e) {
        http_response_code(500);
        $result = (object) [ 
            "error" => $e->getMessage()
        ];
    }
    finally {
        //http_response_code(200);
        if ($db != null){
            closeSqlite($db);
        }
        exit( json_encode($result, JSON_PRETTY_PRINT)."\n" );
    }
?>
