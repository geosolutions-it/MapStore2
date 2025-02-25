# Building and deploying

To create the final war, you have several options:

* full build (including all tests, syntax checks, frontend, backend and documentation):

 `./build.sh [version_identifier] [profiles]`

 Where `version_identifier` is an optional identifier of the generated war that will be shown in the settings panel of the application and profiles is an optional list of comma delimited building profiles (e.g. `printing`, `ldap`, `binary`)

* separated builds (skipping all the tests and checks, mainly for development purposes):

```bash
# build the front-end
npm run fe:build

# build the back-end, including the front-end parts build in the previous command
mvn clean install -Dmapstore2.version=[version_identifier] [profiles]
```

In this case we have 2 separated commands that can be run separately, for instance if you are working on back-end only, so you don't need to re-compile the front-end part every time.

## Building the documentation

MapStore generates 2 types of documentation:

* JSDoc: generated from source code, provides a reference of the API and for the plugins configurations
* MkDocs: generated from markdown files, provides guides for the developers and users

### API and Plugins documentation (JSDoc)

The API and plugins documentation is automatically generated using [docma](http://onury.github.io/docma/). Docma
parses the JSDoc comments in the source code and generates a static HTML documentation.

Refer to the existing files to follow the documentation style of various parts of the application:

* [actions](https://github.com/geosolutions-it/MapStore2/blob/master/web/client/actions/controls.js)
* [reducers](https://github.com/geosolutions-it/MapStore2/blob/master/web/client/reducers/controls.js)
* [components](https://github.com/geosolutions-it/MapStore2/blob/master/web/client/components/buttons/FullScreenButton.jsx)
* [epics](https://github.com/geosolutions-it/MapStore2/blob/master/web/client/epics/fullscreen.js)
* [plugins](https://github.com/geosolutions-it/MapStore2/blob/master/web/client/plugins/Login.jsx)

Please see [http://usejsdoc.org/](http://usejsdoc.org/) for further information about how to write proper documentation in JSDoc.

To install docma:

`npm install -g docma`

Before generating the documentation verify all files are included in the configuration with:

`npm run jsdoc:check`

Is is possible to update the documentation configuration in case the `jsdoc:check` command fails with:

`npm run jsdoc:update`

While developing you can generate the documentation to be accessible in the local machine by:

`npm run jsdoc:test`

The resulting doc will be accessible from [http://localhost:8081/mapstore/docs/](http://localhost:8081/mapstore/docs/)

For the production deploy a different npm task must be used:

`npm run jsdoc:build`

The documentation will be accessible from the */mapstore/docs/* path

The generated folders can be removed with:

`npm run jsdoc:clean`

### Users and developers documentation (MkDocs)

!!! Note
    Make sure to install the proper python dependencies for Mkdocs.
    See the dedicated page [here](./documentation-guidelines.md#building-documentation)

Build the mkdocs and generate md files to test in local machine by:

`npm run doc:build`

Start the built-in dev-server of mkdocs to preview and test documentation live by:

`npm run doc:start`

## Understanding frontend building tools

Frontend building is delegated to [NPM](https://www.npmjs.com/) and so leverages the NodeJS ecosystem.

In particular:

* a **[package.json](https://github.com/geosolutions-it/MapStore2/blob/master/package.json)** file is used to configure frontend dependencies, needed tools and building scripts
* **[babel](https://babeljs.io/)** is used for ES6/7 and JSX transpiling integrated with the other tools (e.g. webpack)
* **[webpack-dev-server](http://webpack.github.io/docs/webpack-dev-server.html)** is used to host the development application instance
* **[mocha](http://mochajs.org/)/[expect](https://github.com/mjackson/expect)** is used as a testing framework (with BDD style unit-tests)
* **[webpack](http://webpack.github.io/)**: as the bundling tool, for development (see [webpack.config.js](https://github.com/geosolutions-it/MapStore2/blob/master/build/webpack.config.js)), deploy (see [prod-webpack.config.js](https://github.com/geosolutions-it/MapStore2/blob/master/build/prod-webpack.config.js)) and test (see [test.webpack.js](https://github.com/geosolutions-it/MapStore2/blob/master/build/tests.webpack.js))
* **[karma](http://karma-runner.github.io/)** is used as the test suite runner, with several plugins to allow for custom reporting, browser running and so on; the test suite running is configured through different configuration files, for **[single running](https://github.com/geosolutions-it/MapStore2/blob/master/build/karma.conf.single-run.js)**  or **[continuous testing](https://github.com/geosolutions-it/MapStore2/blob/master/build/karma.conf.continuous-test.js)**
* **[istanbul](https://gotwarlost.github.io/istanbul/)/[coveralls](https://www.npmjs.com/package/coveralls)** are used for code coverage reporting

## Including the printing engine in your build

The [printing module](printing-module.md#printing-module) is not included in official builds by default.

To build your own version of MapStore with the this module, you can use the **printing** profile running the build script:

```sh
./build.sh [version_identifier] printing
```

For more information or troubleshooting about the printing module you can see the [dedicated section](printing-module.md#printing-module)
