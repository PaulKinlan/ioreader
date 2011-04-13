#!/bin/bash

if [ "$1" == "development" ] || [ "$1" == "production" ] || [ "$1" == "test" ]
then
  echo "Compiling Desktop"
  # Compile the CSS
  cat ./server/client/css/base.less ./server/client/css/desktop/*.less > /tmp/io-reader.desktop.less 
  cat ./server/client/css/base.less ./server/client/css/phone/*.less > /tmp/io-reader.phone.less 
  cat ./server/client/css/base.less ./server/client/css/tablet/*.less > /tmp/io-reader.tablet.less 
  cat ./server/client/css/base.less ./server/client/css/tv/*.less > /tmp/io-reader.tv.less 
 
  (
    cd ./build/less 
    node lessc /tmp/io-reader.desktop.less > ../../server/client/css/desktop.css
    node lessc /tmp/io-reader.desktop.less > ../../server/client-min/css/desktop.css
  
    node lessc /tmp/io-reader.phone.less > ../../server/client/css/phone.css
    node lessc /tmp/io-reader.phone.less > ../../server/client-min/css/phone.css

    node lessc /tmp/io-reader.tablet.less > ../../server/client/css/tablet.css
    node lessc /tmp/io-reader.tablet.less > ../../server/client-min/css/tablet.css
  
    node lessc /tmp/io-reader.tv.less > ../../server/client/css/tv.css
    node lessc /tmp/io-reader.tv.less > ../../server/client-min/css/tv.css)
  pwd
  # Compress the JS

  export NODE_ENV=$1
  node server/server.js
else
  echo "Arguments must be: 'development', 'production' or 'test'. For example setmode.sh test"
fi




