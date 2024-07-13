<?php

function headerPlainText() {
	header("Content-type: text/plain; charset=UTF-8");
}

function headerApplicationJson() {
	header("Content-type: application/json; charset=UTF-8");
}

function headerNoCache() {
	header("Cache-Control: no-store, no-cache, must-revalidate"); 
	header("Cache-Control: post-check=0, pre-check=0", false); 
	header("Pragma: no-cache");
}

function headerHttpError( $number, $text ) {
	header('HTTP/1.0 $number $text');
}

function loadHtmlTitle( $url ) {
	if (strstr($url, "https://")){
			try {

				$opts = array(
					'http'=>array(
						'method' => "GET",
						'header' => "Accept-language: de\r\n".
												"Max-Forwards: 0\r\n",
					  'timeout' => 5,
						'follow_location' => false
					)
				);

				$context = stream_context_create($opts);

				$html = @file_get_contents($url, false, $context);
				
				if (preg_match("/.*?<title>(.*?)<\/title>/is", $html, $match)) {
					$title = $match[1];

					if (preg_match("/.*<\!\[CDATA\[(.*)\]\]>/is", $title, $match)) {
						$title = $match[1];
					}

					return $title;
				}

				

   		} catch (Exception $e) {
				 return null;
			}
	}
	return null;
}
?>