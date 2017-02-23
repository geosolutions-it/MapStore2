#!/bin/bash
set -e

npm install
npm run compile
npm run lint
npm test
mvn clean install
