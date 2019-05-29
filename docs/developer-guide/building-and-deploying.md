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

`mvn clean install` -Dmapstore2.version=[version_identifier]


### Building the documentation

MapStore2 uses JSDoc to annotate the components, so the documentation can be automatically generated using [docma](http://onury.github.io/docma/).  
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
