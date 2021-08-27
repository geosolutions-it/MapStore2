# Styling and Theming

The look and feel is completely customizable either using one of the included themes, or building your own. Themes are built using [less](http://lesscss.org/).  
You can find the default theme here: https://github.com/geosolutions-it/MapStore2/tree/master/web/client/themes/default

## Theme Structure

```
.
+-- themes/
|   +-- theme-name/
|       +-- icons/
|           +-- icons.eot
|           +-- icons.svg
|           +-- icons.ttf
|           +-- icons.woff
|           +-- icons.woff2
|       +-- img/
|       +-- less/
|           +-- mixins/
|               +-- bootstrap.less
|               +-- css-properties.less
|               +-- theme.less
|           +-- mapstore.less
|           +-- common.less
|           +-- style-module.less
|           +-- .less files for all the other modules
|       +-- base.less
|       +-- bootstrap-theme.less
|       +-- bootstrap-variables.less
|       +-- icons.less
|       +-- ms2-theme.less
|       +-- ms-variables.less
|       +-- theme.less
|       +-- variables.less
```

`theme.less` is the entry point for all the main imports and it needs to be properly required in `buildConfig.js` or in your `webpack.config.js` in the themeEntries.

`theme.less` imports

|file|description|
|----------|------|
|base.less|contains a declaration of font colors and background defined for data-ms2-container attribute which is usually the body tag|
|icons.less|contains font-face declaration for glyphs, it extends the bootstrap glyphicons to use custom MapStore icons|
|bootstrap-theme.less|contains all the less style for bootstrap components|
|ms2-theme.less|contains all the less style for MapStore components|
|variable.less|contains the import of mapstore variables and the override of bootstrap variables|

below an example of entry configuration:
```js
entry: {
    ...other entries,
    'themes/theme-name': path.join(__dirname, 'path-to', 'theme-name', 'theme.less')
},
```

MapStore uses a `themeEntries` function to automatically create the entries for default themes that can be found under the `web/client/themes` directory

```js 
const themeEntries = require('./themes.js').themeEntries;

entry: {
    ...other entries,
    ...themeEntries
},
```

Default themes in [`web/client/themes`](https://github.com/geosolutions-it/MapStore2/tree/master/web/client/themes) directory are useful to have an overview of the structure described above.

Note: we suggest to place the theme folder inside a `themes` directory for MapStore project

### Structure of .less files

Each less file that represent a MapStore plugin or component is composed by two sections:

- **Theme section** includes all the styles and classes that should change based on css variables. All the new declared selector must be included in a special function called `#ms-components-theme`. The `#ms-components-theme` function provide access to all the available variables of the theme via the `@theme-vars` argument.

- **Layout section** includes all the styles and classes that should not change in a simple customization.

Example:

```less
// **************
// Theme
// **************
#ms-components-theme(@theme-vars) {
    // here all the selectors related to the theme
    // use the mixins declared in the web/client/theme/default/less/mixins/css-properties.less
    // to use one of the @theme-vars

    // eg: use the main background and text colors to paint my plugin
    .my-plugin-class {
        .color-var(@theme-vars[main-color]);
        .background-color-var(@theme-vars[main-bg]);
    }
}

// **************
// Layout
// **************

// eg: fill all the available space in the parent container with my plugin
.my-plugin-class {
    position: absolute;
    height: 100%;
    width: 100%;
}

// here
```

### ms-variables.less
MapStore uses basic less variables to change theme colors, buttons sizes and fonts.
It possible also to override bootstrap less variable for advanced customization.
Basic variables can be found in the ms-variable.less file

New declarations in MapStore should have the following structure:

global: `@ms-rule-value`

local: `@ms-name-of-plugin--rule-value`

- `@ms` suffix for MapStore variable
- `name-of-plugin` for local variable it's important to write the name of plugin in kebab-case
- `rule-value` value to use in compiled CSS, some examples:
    - `color` generic color variable
    - `text-color` color for text
    - `background-color` color for background
    - `border-color` color for border

### less/ directory

The `less/` directory contains all the modules needed to create the final CSS of MapStore.

Each file in this directory is related to a specific plugin or component and the files are named based on the plugin's name are referring to.

`common.less` file can be used for generic styles. 

### inline styles

Inline styles should be applied only for values that change dynamically during the lifecycle of the application, all others style should be moved to the related .less file.

The main reason of this choice is to allow easier overrides of styles in custom projects.

## Add New Theme

To support a new theme for mapstore product:

1. create a new folder in the themes folder with the name of your theme
1. create less files in the folder (at least `theme.less`, as the main file and `variables.less`, to customize standard variables)
1. add the new theme to the [index file](https://github.com/geosolutions-it/MapStore2/blob/master/web/client/themes/index.js), with the id corresponding to the theme folder name

If you are not using themeEntries a new entry needs to be added in the `buildConfig.js`

You can then switch your application to use the theme adding a new section in the `appConfig.js` file:

```
initialState: {
    defaultState: {
        ...
        theme: {
            selectedTheme: {
                id: <your theme id>
            }
        },
        ...
     }
}
```

## Custom Theme for project

In a mapstore project normally the theme configuration is placed in the `themes/` directory

Styles can be overridden declaring the same rules in a less module placed in a new project.

Below steps to configure a custom theme and override styles:

- add the following files to the themes folder of the project:

```
.
+-- themes/
|   +-- default/
|       +-- less/
|           +-- my-custom-module.less
|       +-- theme.less
|       +-- variables.less
```

- import in `theme.less` all the needed less module

```less
@import "../../MapStore2/web/client/themes/default/theme.less";
@import "./variables.less";
@import "./less/my-custom-module.less";
```

- update webpack configuration to use the custom style (webpack.config.js, prod-webpack.config.js)

```diff
module.exports = require('./MapStore2/buildConfig')(
    {
        '__PROJECTNAME__': path.join(__dirname, "js", "app"),
        '__PROJECTNAME__-embedded': path.join(__dirname, "MapStore2", "web", "client", "product", "embedded"),
        '__PROJECTNAME__-api': path.join(__dirname, "MapStore2", "web", "client", "product", "api")
    },
-   themeEntries,
+   {
+       "themes/default": path.join(__dirname, "themes", "default", "theme.less")
+   },
    ...
```

- update `variables.less` to override existing variables

```less
/* change primary color to blue */
@ms-primary: #0000ff;
```

- update `my-custom-module.less` to override existing rules or add new rules

```less
/* change the background color of the page*/
.page {
    background-color: #d9e6ff;
}
```


## Custom Theme for contexts

You can configure a list of themes to be used inside a context.

In order to do that you have to:

- create the themes in the `themes/` folder as described below
- edit **ContextCreator** plugin in the `localConfig.json`

example
```json
{
    "name": "ContextCreator",
    "cfg": {
        "documentationBaseURL": "https://mapstore.geo-solutions.it/mapstore/docs/api/plugins",
        "backToPageDestRoute": "/context-manager",
        "backToPageConfirmationMessage": "contextCreator.undo",
        "themes": [{
                "id": "complete-theme-override",
                "type": "link",
                "href": "dist/themes/complete-theme-override.css",
                "defaultVariables": {
                    "ms-main-color": "#000000",
                    "ms-main-bg": "#FFFFFF",
                    "ms-primary-contrast": "#FFFFFF",
                    "ms-primary": "#078aa3",
                    "ms-success-contrast": "#FFFFFF",
                    "ms-success": "#398439"
                }
            },
            {
                "id": "partial-theme-override",
                "type": "link",
                "href": "dist/themes/partial-theme-override.css"
            },
            {
                "id": "only-css-variables",
                "type": "link",
                "href": "dist/themes/only-css-variables.css"
            }
        ],
        "basicVariables": {
            "ms-main-color": "#000000",
            "ms-main-bg": "#FFFFFF",
            "ms-primary-contrast": "#FFFFFF",
            "ms-primary": "#078aa3",
            "ms-success-contrast": "#FFFFFF",
            "ms-success": "#398439"
        }
    }
}
```

for each theme you can define:
- **id** id of the theme equal to its name
- **type** values can be 
  - **link** will require a href property
- **href** path to find the css once built
- **defaultVariables** variables of the theme used to initialize the pickers (optional)

**basicVariables** these are the variables used as default values if a theme is not selected (optional)

## Suggested ways to create a custom theme for a context

### Complete theme override

This example will create a complete css file and is not recommended if you want a light version and you just need to customize the variables (for this check next paragraph)

Add the following files to the themes folder of the project

```
+-- themes/
|   +-- theme-name/
|       +-- theme.less
|       +-- variables.less
```

in `theme.less` put

```less
/*
 * This example will contain a complete mapstore theme with some customization
 * it will be selectable inside context theme step selector
*/

/*
 * it includes the main theme and this will recompile the whole theme
*/
@import "../../MapStore2/web/client/themes/default/theme.less";

/*
 * it includes some changes to css variables
*/
@import "./variables.less";

/*
* Note: You can always expand it with new less/css rules
*/
```

in `variables.less` you can put the mapstore variables customizations
```less
/*
 * A variable that will override the default css one
*/
@ms-primary: #2E13FE;
```

### Only css variables

This example is perfect if you just want to customize a few colors of the theme

```
+-- themes/
|   +-- theme-name/
|       +-- theme.less
|       +-- variables.less
```

in `theme.less` put
```less
/*
 * This example is the lightest version of all three examples
 * it will be selectable inside context theme step selector
 * this examples is limited to changing the css variables only,
 * but you can always expand it as we did for partial-theme-override
*/

/*
 * This will import as (reference) https://lesscss.org/features/#import-atrules-feature-reference
 * It's used to import external files, but without adding the imported styles
 * to the compiled output unless referenced.
 *
*/
@import (reference) "../../MapStore2/web/client/themes/default/theme.less";

/*
 * it includes some changes to css variables
*/
@import "./variables.less";

/*
 * this will create only one class with the :root selector inside
 * it's important to place the variable overrides before calling the css-variable mixin generator
 * which is called .get-root-css-variables
*/
.get-root-css-variables(@ms-theme-vars);

/*
* Note: You can always expand it with new less/css rules
*/
```

In the `variables.less` you can do put your variable customizations

### partial theme override
```
+-- themes/
|   +-- theme-name/
|       +-- less/
    |       +-- plugin-name.less
```

```less
/*
 * We can use this method when we want to customize some part of the theme
 * without the need to include the theme in its completeness
*/

/*
 * here you can apply some other overrides, like the size of thumbnails for backgrounds
*/
@import "./less/drawer-menu.less";

/*
* Note: You can always expand it with new less/css rules
*/
```

Note: These three styles are an example on how is possible to approach on the mapstore customizations. You could extend/combine them together to create a more complex theme.


## Tips

- When you develop locally
- and you want to reduce the building time
- and you don't need themes that are not the default theme
- then  you can comment this in the `webpack-config.js`

```js
    {
        ["themes/default"]: path.join(__dirname, "themes", "default", "theme.less")
        /*,
        ["themes/complete-theme-override"]: path.join(__dirname, "themes", "complete-theme-override", "theme.less"),
        ["themes/partial-theme-override"]: path.join(__dirname, "themes", "partial-theme-override", "theme.less"),
        ["themes/only-css-variables"]: path.join(__dirname, "themes", "only-css-variables", "theme.less")
        */
    },
```
