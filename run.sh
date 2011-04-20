#!/bin/bash

function uglifyFormfactorScripts {
  cd ../../server/client/scripts/$1

  shopt -s nullglob
  for f in *.js
  do
    uglifyjs $f > ../../../client-min/scripts/$1/$f
  done
}

function uglifyLibs {
  (
    cd server/client/lib

    shopt -s nullglob
    for f in *.js
    do
      uglifyjs $f > ../../client-min/lib/$f
    done
  )
}

if [ "$1" ==  "production" ] 
then
  
  echo "Compiling Base Code"
  mkdir server/client-min/scripts
  mkdir server/client-min/scripts/desktop
  mkdir server/client-min/scripts/phone
  mkdir server/client-min/scripts/tv
  mkdir server/client-min/scripts/tablet
  mkdir server/client-min/css
  mkdir server/client-min/lib


  cp server/client/css/reset.css server/client-min/css/reset.css

  uglifyjs server/client/scripts/controller.js > server/client-min/scripts/controller.js
  uglifyjs server/client/scripts/uis.js > server/client-min/scripts/uis.js
  
  uglifyLibs

  echo "Compiling Desktop"
  # Compile the CSS
  cat ./server/client/css/base.less ./server/client/css/desktop/*.less > /tmp/io-reader.desktop.less 
  (
    cd ./build/less 
    node lessc /tmp/io-reader.desktop.less > ../../server/client/css/desktop.css
    node lessc /tmp/io-reader.desktop.less > ../../server/client-min/css/desktop.css
    
    uglifyFormfactorScripts "phone"
  ) 

  echo "Compiling Phone"
  cat ./server/client/css/base.less ./server/client/css/phone/*.less > /tmp/io-reader.phone.less 
  (
    cd ./build/less 
    node lessc /tmp/io-reader.phone.less > ../../server/client/css/phone.css
    node lessc /tmp/io-reader.phone.less > ../../server/client-min/css/phone.css
    
    uglifyFormfactorScripts "phone"
  ) 

  echo "Compiling Tablet"
  cat ./server/client/css/base.less ./server/client/css/tablet/*.less > /tmp/io-reader.tablet.less 
  (
    cd ./build/less 
    node lessc /tmp/io-reader.tablet.less > ../../server/client/css/tablet.css
    node lessc /tmp/io-reader.tablet.less > ../../server/client-min/css/tablet.css
    uglifyFormfactorScripts "tablet"
  ) 

  echo "Compiling TV"
  cat ./server/client/css/base.less ./server/client/css/tv/*.less > /tmp/io-reader.tv.less 
  (
    cd ./build/less 
    node lessc /tmp/io-reader.tv.less > ../../server/client/css/tv.css
    node lessc /tmp/io-reader.tv.less > ../../server/client-min/css/tv.css
    
    uglifyFormfactorScripts "tv"
  ) 

  # Compress the JS
elif [ "$1" == "test" ] || [ "$1" == "development" ]
then
  export NODE_ENV=$1
  node server/server.js
else
  echo "Arguments must be: 'development', 'production' or 'test'. For example setmode.sh test"
fi
