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
# $ ./build.sh v2024.02.02 binary

set -u
set -e

echo "Running NPM install to update dependencies"
date
npm install

echo "Building MS2 bundles"
date
npm run fe:build

echo "Cleanup Documentation"
date
npm run jsdoc:clean

echo "Checking syntax"
date
npm run lint

echo "Run MapStore2 tests"
date
npm test

echo "Creating Documentation"
date
npm run jsdoc:build

echo "Building final WAR package"
date
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
        mvn clean install -Dmapstore2.version="$1"
    else
        cd java
        mvn clean install -Dmapstore2.version="$1" -P"$2"
        cd ..
        mvn clean install -Dmapstore2.version="$1" -P"$2"
fi

echo "Final Cleanup"
date
npm run jsdoc:clean
