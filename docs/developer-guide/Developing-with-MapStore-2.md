# Folders structure

This is the overall framework folder structure:

```
+-- package.json
+-- pom.xml
+-- build.sh
+-- karma.conf.*.js
+-- tests.webpack.js
+-- webpack.config.js
+-- prod-webpack.config.js
+-- .babelrc
+-- .eslintrc
+-- .editorconfig
+-- .travis.yml
+-- ...
+-- geostore (submodule)
+-- web      (MapStore2 maven module)
    +-- pom.xml
    +-- src        (maven java webapp src folder)
    |   +-- main
    |   |   +-- java
    |   |   +-- resources
    |   |   +-- webapp
    |   +-- test
    |        +-- java
    |        +-- resources   
    +-- client
    |   +-- index.html (demo application home page)
        +-- plugins (ReactJS smart components with required reducers)
        +-- components (ReactJS dumb components)
        |   +-- category
        |   |   +-- <component>.jsx (ReactJS component)
        |   |   +-- ...
        |   |   +-- __tests__       (unit tests folder)
        |   |       +-- <component>-test.jsx
        |   +-- ...
        +-- actions    (Redux actions)
        +-- reducers   (Redux reducers)
        +-- stores     (Redux stores)
        +-- translations (i18n localization files)
        |  +-- data.en-US
        |  ...
        |  product (the MapStore2 main application)
        |   +...
        +-- examples   (example applications)
             +-- 3dviewer
             |   +-- index.html
             |   +-- app.jsx
             |   +-- containers (app specific smart components)
             |   +-- components (app specific dumb components)
             |   +-- stores     (app specific stores)
             |   +-- reducers   (app specific reducers)
             |   +-- ...
             +-- ...
```

If you want to create an application based on MapStore2 you can use the [Project Creation Script](https://github.com/geosolutions-it/MapStore2/blob/master/docs/developer-guide/Project-Creation-Script).

If you want to learn how to develop a simple MapStore2 based application you can follow the [tutorial](https://github.com/geosolutions-it/MapStore2/blob/master/docs/developer-guide/Application-Tutorial)

If you want to learn how to develop a plugins based MapStore2 based application you can follow the [plugins tutorial](https://github.com/geosolutions-it/MapStore2/blob/master/docs/developer-guide/Plugins-architecture#building-an-application-using-plugins)
