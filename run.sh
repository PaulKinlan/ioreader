#!/bin/bash

if [ "$1" == "development" ] || [ "$1" == "production" ] || [ "$1" == "test" ]
then
  echo "Compiling Desktop"
  # Compile the CSS
  cat ./server/client/css/base.less ./server/client/css/desktop/*.less > /tmp/io-reader.desktop.less 
  lessc /tmp/io-reader.desktop.less > ./server/client-min/css/desktop.css

  # Compress the JS

  export NODE_ENV=$1
  node server/server.js
else
  echo "Arguments must be: 'development', 'production' or 'test'. For example setmode.sh test"
fi




