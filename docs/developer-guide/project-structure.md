# Folders structure

This is the overall framework folder structure:

```txt
+-- package.json
+-- pom.xml
+-- build.sh
+-- .editorconfig
+-- Dockerfile
+-- .travis.yml
+-- ...
+-- build       (build related files)
    +-- karma.conf.*.js
    +-- tests.webpack.js
    +-- webpack.config.js
    +-- prod-webpack.config.js
    +-- docma-config.json
    +-- testConfig.json
    +-- ...
+-- java        (java backend modules)
    +-- pom.xml
    +-- services
    +-- web
    +-- printing
+-- translations (i18n localization files)
    |  +-- data.en-US.json
+-- utility (general utility scripts and functions)
    |  +-- eslint
    |  +-- build
    |  +-- projects
    |  +-- translations
+-- web         (frontend module)
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
        +-- configs    (JSON config files like localConfig.json, pluginsConfig.json, new.json, newgeostory.json, etc)
        +-- epics      (redux-observable epics)
        +-- reducers   (Redux reducers)
        +-- stores     (Redux stores)
           ...
           product (the MapStore main application)
            +...

```
