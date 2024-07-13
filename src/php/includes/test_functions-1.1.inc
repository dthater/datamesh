<?php

function switchTestSuite($name){
	echo "Test suite: ".$name."\n";
}

function switchTestGroup($name){
	echo "\nTest group: ".$name."\n";
}

function assertEquals($expected, $actual, $message = null){
	$message = $message != null ? $message." ": "";
	echo ($expected == $actual) ? "OK\n" : "ERROR: ".$message."Expected '".$expected."' but is '".$actual."'.\n";
}

?>