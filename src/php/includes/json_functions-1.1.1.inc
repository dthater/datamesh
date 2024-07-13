<?php

# CHANGELOG
# 2022-03-07 use urldecode payload

#!/bin/bash
# JSON functions library
# (c) Damian Thater, 2017
# Changes : 2021-02-13

$JSON_CURRENT_LEVEL=0;

function json_inc_level(){
	$JSON_CURRENT_LEVEL = $JSON_CURRENT_LEVEL+1;
}

function json_dec_level(){
	$JSON_CURRENT_LEVEL = $JSON_CURRENT_LEVEL-1;
}

# ----------------------------------------------------

function json_padd(){
	return sprintf( "%${JSON_CURRENT_LEVEL}s" );
}

# ----------------------------------------------------

function json_set_list_seperator(){
	return sprintf( ",\n" );
}

# ----------------------------------------------------

function json_set_unquoted_value_named( $NAME, $VALUE ){
	return json_padd() . sprintf( "\"%s\": %s", $NAME, $VALUE );
}

function json_set_quoted_value_named( $NAME, $VALUE ){
	return json_set_unquoted_value_named( $NAME, "\"".$VALUE."\"" );
}

# ----------------------------------------------------

function json_set_unquoted_value( $VALUE ){
	return json_padd() . printf( "%s", $VALUE );
}

function json_set_quoted_value( $VALUE ){
	return json_set_unquoted_value( "\"".$VALUE."\"" );
}

# ----------------------------------------------------

function json_set_string_named( $KEY, $VALUE ){
	return json_set_quoted_value_named( $KEY, $VALUE );
}

function json_set_bool_named( $KEY, $VALUE ){
	return json_set_unquoted_value_named( $KEY, $VALUE );
}

function json_set_int_named( $KEY, $VALUE ){
	return json_set_unquoted_value_named( $KEY, $VALUE );
}

# ----------------------------------------------------

function json_set_string( $VALUE ){
    return json_set_quoted_value( $VALUE );
}

function json_set_bool( $VALUE ){
	return json_set_unquoted_value( $VALUE );
}

function json_set_int( $VALUE ){
	return json_set_unquoted_value( $VALUE );
}

# ----------------------------------------------------

function json_start(){
	return json_start_object();
}

function json_end(){
	return json_end_object() . sprintf( "\n" );
}

# ----------------------------------------------------

function json_start_object(){
	return json_padd() . sprintf( "{\n" ) . json_inc_level();
}

function json_start_object_named( $NAME ){
	return json_padd() . sprintf( "\"%s\": {\n", $NAME ) . json_inc_level();
}

function json_end_object(){
	return sprintf( "\n" ) . json_dec_level() . json_padd() . sprintf( "}" );
}

# ----------------------------------------------------

function json_start_array(){
	return json_padd() . sprintf( "[\n" ) . json_inc_level();
}

function json_start_array_named( $NAME ){
	return json_padd() . sprintf( "\"%s\": [\n", $NAME ) . json_inc_level();
}

function json_end_array(){
	return sprintf( "\n" ) . json_dec_level() . json_padd() . sprintf( "]" ); 
}


function formatJsonAttribute( $key, $value ){
		$key = str_replace("\"", "\\\"", $key);
		$value = str_replace("\\", "\\\\", $value);
		$value = str_replace("\"", "\\\"", $value);
		return "\"".$key."\":\"".$value."\"";
}

function formatJsonAttributeByRowKey( $row, $key ){
		return formatJsonAttribute( $key, $row[$key] );
}

function fetchJsonBodyFromRequest(){
	$json = file_get_contents('php://input');
	if ($json){
			// Converts it into a PHP object
			return json_decode(urldecode($json));
	}
	return null;
}

?>