#!/bin/bash

if [ "$1" == "development" ] || [ "$1" == "production" ] || [ "$1" == "test" ]
then
  export NODE_ENV=$1
  node server/server.js
else
  echo "Arguments must be: 'development', 'production' or 'test'. For example setmode.sh test"
fi




