#!/bin/bash
set -e

echo "Running NPM install to update dependencies"
echo `date`
npm install

echo "Building MS2 bundles"
echo `date`
npm run compile

echo "Cleanup Documentation"
echo `date`
npm run cleandoc

echo "Checking syntax"
echo `date`
npm run lint

echo "Run MapStore2 tests"
echo `date`
npm test

echo "Creating Documentation"
echo `date`
npm run doc

echo "Building final WAR package"
echo `date`
if [ $# -eq 0 ]
  then
    mvn clean install
  else
    mvn clean install -Dmapstore2.version=$1
fi

echo "Final Cleanup"
echo `date`
npm run cleandoc
