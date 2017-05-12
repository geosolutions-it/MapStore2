#!/bin/bash
set -e

npm install
npm run compile
npm run cleandoc
npm run lint
npm test
npm run doc
if [ $# -eq 0 ]
  then
    mvn clean install
  else
    mvn clean install -Dmapstore2.version=$1
fi

npm run cleandoc
