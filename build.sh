#!/bin/bash
#
# Builds MapStore2, doing all needed clean-ups tests and checks and adding documentation.
# You should use this script to generate a full valid MapStore2 package.
# Use the `binary` profile to build also the binary package
#
# Usage:
# $ ./build.sh [version] [profiles]
# * version: The version for the final package
# * profiles: profiles for mvn build.
#
# use `binary` to build also the binary package
# use `printing` to include printing module in the ware
# use `printing-bundle` to build also the zip bundle
#
# Example
# $ ./build.sh 2022.02.00 binary

set -e

echo "Running NPM install to update dependencies"
echo `date`
npm install

echo "Building MS2 bundles"
echo `date`
npm run fe:build

echo "Cleanup Documentation"
echo `date`
npm run jsdoc:clean

echo "Checking syntax"
echo `date`
npm run lint

echo "Run MapStore2 tests"
echo `date`
npm test

echo "Creating Documentation"
echo `date`
npm run jsdoc:build

echo "Building final WAR package"
echo `date`
if [ $# -eq 0 ]
  then
    cd java
    mvn clean install
    cd ..
    mvn clean install
  elif [ $# -eq 1 ]
    then
        cd java
        mvn clean install
        cd ..
        mvn clean install -Dmapstore2.version=$1
    else
        cd java
        mvn clean install -Dmapstore2.version=$1 -P$2
        cd ..
        mvn clean install -Dmapstore2.version=$1 -P$2
fi

echo "Final Cleanup"
echo `date`
npm run jsdoc:clean
