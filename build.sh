#!/bin/bash
set -e

npm install
npm run compile
npm run lint
npm test
mvn clean install

# TODO: Test folder for reference docs build
chmod +x genDocs
./genDocs web/client/components/mapcontrols/mouseposition/