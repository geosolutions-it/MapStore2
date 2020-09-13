# MapStore Projects
MapStore projects can be created using the [Project Creation Script](../project-creation-script).

A MapStore project is a custom WebGis application that uses MapStore as a framework.

The MapStore framework is linked as a git submodule in the MapStore2 project subfolder.

**Note**: since MapStore is linked as a submodule, every project custom file should be created outside of it. This allows updating MapStore to a newer version easily, without conflicts. The general rule is: **never add / update / modify files directly in the MapStore2 subfolder**.

## Standard Projects

A **Standard** MapStore project is a project that is, initially, a perfect copy of the standard MapStore
product.

To create custom application using the standard projects template, you will start from **js/app.jsx**
that is the project entry point.

Editing **app.jsx** you can start using your own configuration files and add custom behaviours and look and
feel to your project, in particular:

 * you can add your own translation files

```javascript
ConfigUtils.setConfigProp('translationsPath', ['./MapStore2/web/client/translations', './translations']);

```
 * Use your own configuration file for plugins:

```javascript
ConfigUtils.setLocalConfigurationFile('localConfig.json');

```
 * Use your own configuration:

```javascript
ConfigUtils.setLocalConfigurationFile('localConfig.json');

```
 * Configure your own pages:

```javascript
const appConfig = assign({}, require('../MapStore2/web/client/product/appConfig'), {
     pages: [{
         name: "mapviewer",
         path: "/",
         component: require('../MapStore2/web/client/product/pages/MapViewer')
     }]
});

```
 * Include the plugins you want in the app (either MapStore plugins or your own):

```javascript
const plugins = require('./plugins');

```

## Organizing your code
Our convention is to use the **js** folder to store your project code.
You should recreate inside it the usual folders to organize your code based on the source code type:
 * components
 * actions
 * reducers
 * epics
 * plugins

Images and other static assets should be located in the **assets** folder instead.
