#!/bin/bash

PORT=8081
echo "Running server at port $PORT"

docker run -it --rm --name datamesh \
  -p $PORT:80 -P \
  -v "$PWD/src/php":/app \
  -w /app \
  php:7.4-cli \
  php -S 0.0.0.0:80 -n -c /app
