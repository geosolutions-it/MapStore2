# Main scripts

Here a summary of the main utility scripts to run and build MapStore.

## npm scripts

| Command                          | Description                                                            |
|----------------------------------|------------------------------------------------------------------------|
| `npm install`                    | download dependencies and init the front-end environment               |
| `npm start`                      | start development instance (both front end and back-end)               |
| `npm run app:start`              | start development instance (both front end and back-end)               |
| `npm run fe:start`               | start front-end dev server                                             |
| `npm run be:start`               | start backend dev server (embedded in tomcat, with cargo)              |
| `npm run fe:build`               | build front-end                                                        |
| `npm run be:build`               | build backend                                                          |
| `npm test`                       | run test suite once                                                    |
| `npm run test:watch`             | run continuous test suite running (useful during developing)           |
| `npm run lint`                   | run ESLint checks                                                      |
| `npm run i18n`                   | checks missing strings in mandatory i18n files (ref to en-US)          |
| `npm run jsdoc:build`            | build JSDoc                                                            |
| `npm run jsdoc:test`             | build JSDoc in a directory available running npm start (for test)      |
| `npm run jsdoc:clean`            | clean JSDoc                                                            |
| `npm run doc:build`              | build MkDocs documentation                                             |
| `npm run doc:start`              | start `mkdocs serve` to have a live preview while editing documentation|
| `npm run generate:icons`         | generate icons from svg files                                          |
| `npm run generate:changelog`     | generate changelog for the MapStore release                            |

Other scripts are present for backward compatibility, but they are deprecated and will be removed in the future.

## bash scripts

| Command                                     | Description                                                            |
|---------------------------------------------|------------------------------------------------------------------------|
|`./build.sh [version_identifier] [profiles]` | build the deployable war (in `product/target`)                         |

Where `version_identifier` is an optional identifier of the generated war that will be shown in the settings panel of the application and profiles is an optional list of comma delimited building profiles (e.g. `printing`, `ldap`).
