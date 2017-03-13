#!/bin/bash
set -e

npm install
npm run compile
npm run lint
npm run doc
npm test
mvn clean install
npm run cleandoc
