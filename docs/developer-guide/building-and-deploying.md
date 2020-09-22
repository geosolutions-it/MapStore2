# Building and deploying

Maven is the main tool for building and deploying a complete application. It takes care of:

* building the java libraries and webapp(s)
* calling NPM as needed to take care of the frontend builds
* launching both backend and frontend test suites
* creating the final war for deploy into a J2EE container (e.g. Tomcat)

To create the final war, you have several options:

* full build, including submodules and frontend (e.g. GeoStore)

 `./build.sh [version_identifier]`

 Where version_identifier is an optional identifier of the generated war that will be shown in the settings panel of the application.

* fast build (will use the last compiled version of submodules and compiled frontend)

`mvn clean install -Dmapstore2.version=[version_identifier]`

* release build (produces also the binary)

`mvn clean install -Dmapstore2.version=[version_identifier] -Prelease`

Where `[version_identifier]` is the version you want to export (e.g. 2020.01.00). This version name will appear in "Settings --> version information" and used to create handle bundles version (i.e. caching).

## Building the documentation

MapStore uses JSDoc to annotate the components, so the documentation can be automatically generated using [docma](http://onury.github.io/docma/).
Please see http://usejsdoc.org/ for further information about code documentation.

Refer to the existing files to follow the documentation style:

* [actions](https://github.com/geosolutions-it/MapStore2/blob/master/web/client/actions/controls.js)
* [reducers](https://github.com/geosolutions-it/MapStore2/blob/master/web/client/reducers/controls.js)
* [components](https://github.com/geosolutions-it/MapStore2/blob/master/web/client/components/buttons/FullScreenButton.jsx)
* [epics](https://github.com/geosolutions-it/MapStore2/blob/master/web/client/epics/fullscreen.js)
* [plugins](https://github.com/geosolutions-it/MapStore2/blob/master/web/client/plugins/Login.jsx)

To install docma:

`npm install -g docma`

While developing you can generate the documentation to be accessible in the local machine by:

`npm run doctest`

The resulting doc will be accessible from http://localhost:8081/mapstore/docs/

For the production deploy a different npm task must be used:

`npm run doc`

The documentation will be accessible from the */mapstore/docs/* path

The generated folders can be removed with:

`npm run cleandoc`

## Undestanding frontend building tools

Frontend building is delegated to [NPM](https://www.npmjs.com/) and so leverages the NodeJS ecosystem.

In particular:

* a **[package.json](https://github.com/geosolutions-it/MapStore2/blob/master/package.json)** file is used to configure frontend dependencies, needed tools and building scripts
* **[babel](https://babeljs.io/)** is used for ES6/7 and JSX transpiling integrated with the other tools (e.g. webpack)
* **[webpack-dev-server](http://webpack.github.io/docs/webpack-dev-server.html)** is used to host the development application instance
* **[mocha](http://mochajs.org/)/[expect](https://github.com/mjackson/expect)** is used as a testing framework (with BDD style unit-tests)
* **[webpack](http://webpack.github.io/)**: as the bundling tool, for development (see [webpack.config.js](https://github.com/geosolutions-it/MapStore2/blob/master/webpack.config.js)), deploy (see [prod-webpack.config.js](https://github.com/geosolutions-it/MapStore2/blob/master/prod-webpack.config.js)) and test (see [test.webpack.js](https://github.com/geosolutions-it/MapStore2/blob/master/tests.webpack.js))
* **[karma](http://karma-runner.github.io/)** is used as the test suite runner, with several plugins to allow for custom reporting, browser running and so on; the test suite running is configured through different configuration files, for **[single running](https://github.com/geosolutions-it/MapStore2/blob/master/karma.conf.single-run.js)**  or **[continuous testing](https://github.com/geosolutions-it/MapStore2/blob/master/karma.conf.continuous-test.js)**
* **[istanbul](https://gotwarlost.github.io/istanbul/)/[coveralls](https://www.npmjs.com/package/coveralls)** are used for code coverage reporting
* **[eslint](https://eslint.org)** is used to enforce coding styles guidelines, the tool is configured using a **[.eslintrc](https://github.com/geosolutions-it/MapStore2/blob/master/.eslintrc)** file

## Index of main npm scripts

| Command                  | Description                                                  |
|--------------------------|--------------------------------------------------------------|
| `npm install`            | download dependencies and init developer environment         |
| `npm start`              | start development instance                                   |
| `npm run examples`       | start development instance with examples                     |
| `npm run compile`        | run single build / bundling                                  |
| `npm test`               | run test suite once                                          |
| `npm run continuoustest` | run continuous test suite running (useful during developing) |
| `npm run lint`           | run ESLint checks                                            |
| `npm run mvntest`        | run tests from Maven                                         |
| `npm run travis`         | run the test build used for travis                           |

## Including the printing engine in your build

The [printing module](printing-module.md) is not included in official builds by default.

To build your own version of MapStore with the this module, you can use the **printing** profile running the build script:

```sh
./build.sh [version_identifier] printing
```

For more information or troubleshooting about the printing module you can see the [dedicated section](printing-module.md)
