## Folders structure

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
        +-- epics      (redux-observable epics)
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
