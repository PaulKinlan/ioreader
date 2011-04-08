#!/bin/bash

if [ "$1" == "development" ] || [ "$1" == "production" ] || [ "$1" == "test" ]
then
  echo "Compiling Desktop"
  cat ./server/client/css/desktop/*.excss > ./server/client-min/css/desktop.excss
  cat ./server/client/scripts/desktop/*.js > ./server/client-min/scripts/desktop.js
  
  # Compile the CSS

  # Compress the JS

  export NODE_ENV=$1
  node server/server.js
else
  echo "Arguments must be: 'development', 'production' or 'test'. For example setmode.sh test"
fi




