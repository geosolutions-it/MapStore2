# Migration Guidelines

## General update checklist

- updating an existing installation
- updating a MapStore project created for a previous version

To update an existing installation you usually have to do nothing except eventually to execute queries on your database to update the changes to the database schema.

In case of a project it becomes a little more complicated, depending on the customization.

This is a list of things to check if you want to update from a previous version valid for every version.

- Take a list to migration notes below for your version
- Take a look to the release notes
- update your `package.json` to latest libs versions
- take a look at your custom files to see if there are some changes (e.g. `localConfig.js`, `proxy.properties`)
- Some changes that may need to be ported could be present also in `pom.xml` files and in `configs` directory.
- check for changes also in `web/src/main/webapp/WEB-INF/web.xml`.
- Optionally check also accessory files like `.eslinrc`, if you want to keep aligned with lint standards.
- Follow the instructions below, in order, from your version to the one you want to update to.

## Migration from 2024.02.00 to 2025.01.00

### Language plugin configuration changes

1. The `Language` plugin has been added in the `localConfig.json` for map(desktop):

    ```diff
    {
        ...,
        "plugins": {
            "desktop": [
                ...,
    +           { "name": "Language" }
            ]
        }
    }
    ```

2. Here below all the changes needed related the `configs/pluginsConfig.json` configuration for Language.

    ```diff
    {
        "plugins": [
            ...,
            {
                "name": "BrandNavbar",
                "title": "plugins.BrandNavbar.title",
                "description": "plugins.BrandNavbar.description",
    +            "children": [
    +               "ResourceDetails",
    +               "Language"
    +            ],
                "defaultConfig": {
                    "containerPosition": "header"
                }
            },
            ...,
    +       {
    +           "name": "Language",
    +           "title": "plugins.Language.title",
    +           "description": "plugins.Language.description",
    +           "dependencies": ["BrandNavbar"],
    +        }
        ]
    }
    ```

### Remove context-manager page

The `context-manager` page and related `ContextManager` plugin should be removed from existing downstream project.

1. Remove `context-manager` configuration from `localConfig.json`:

    ```diff
    {
        ...,
        "plugins": {
            ...,
    -       "context-manager": [
    -           "Header",
    -           "Redirect",
    -           "Home",
    -           "ContextManager",
    -           "Footer",
    -           { "name": "About" }
    -       ]
        }
    }
    ```

2. Remove the `ContextManager` page from the `appConfig.js` in custom projects that includes it:

    ```diff
    [
        ...,
    -   {
    -       name: "context-manager",
    -       path: "/context-manager",
    -       component: require('./pages/ContextManager').default
    -   },
        ...,
    ]
    ```

3. Remove the `ContextManager` plugin from the `pluginsDef` in custom projects that includes it

### Rules manager page changes

The `localConfig.json` configuration for the `rulesmanager` page should be updated in existing project by including the new `BrandNavbar` plugin and removing the deprecated plugins:

```diff
{
    "rulesmanager": [
        "Redirect" ,
-        {
-           "name": "OmniBar",
-           "cfg": {
-               "containerPosition": "header",
-               "className": "navbar shadow navbar-home"
-           }
-       },
+       {
+           "name": "BrandNavbar",
+           "cfg": {
+               "containerPosition": "header"
+           }
+       },
        "Home",
        "ManagerMenu",
        "Login",
        "Language",
-       "NavMenu",
-       "Attribution",
        "RulesDataGrid",
        "Notifications",
        {
            "name": "RulesEditor",
            "cfg": {
                "containerPosition": "columns",
                "disableDetails": true
            }
        }
    ]
}

```

### Footer plugin configuration changes

The Footer plugin has been refactored and some properties have been removed:

- `cfg.logo` is not available anymore in favor of translation html snippet
- translation message identifier `home.footerDescription` is not used anymore in the footer by default

It is possible to replicate the old footer structure for existing project that want to keep the homepage footer information as before with the following configurations:

1. configure the new Footer plugin in `localConfig.json` as follow:

    ```js
    {
        "name": "Footer",
        "cfg": {
            "hideMenuItems": true,
            "customFooter": true,
            "customFooterMessageId": "home.footerDescription" // by default is using home.footerCustomHTML
        }
    }
    ```

2. update the `home.footerDescription` translation by adding the desired html structure, eg:

    ```js
    {
        "home": {
            "footerDescription": "<footer class=\"ms-flex-box _flex _flex-center-h _padding-md\"><div> ...my previous message </div></footer>"
        }
    }

### HomeDescription plugin configuration changes

The HomeDescription plugin has been refactored and a property has been removed:

- `cfg.name` removed in favor of the translation message `home.shortDescription`

For downstream projects review the `.less` or `.css` files for possible conflicting style related to the `.ms-home-description` class selector

### Update of CDN favicon

The usage of default CDN favicon is deprecated so existing downstream project still using this setup should be updated as follow:

1. Add a favicon image inside the `assets/img` folder:

    ```text
    MapStoreProject/
    |-- ...
    |-- assets/
    |    |-- img/
    |         |-- favicon.png (new)
    |-- ...
    |-- dashboard-embedded-template.html
    |-- dashboard-embedded.html
    |-- embedded.html
    |-- embeddedTemplate.html
    |-- geostory-embedded-template.html
    |-- geostory-embedded.html
    |-- index.html
    |-- indexTemplate.html
    |-- ...
    |-- prod-webpack.config.js
    |-- ...
    ```

2. Remove the existing favicon link from all the html files (index.html, indexTemplate.html, embedded.html, embeddedTemplate.hml, ...):

    ```diff
    - <link rel="shortcut icon" type="image/png" href="https://cdn.jslibs.mapstore2.geo-solutions.it/leaflet/favicon.ico" />
    ```

3. Include the new favicon inside the `prod-webpack.config.js` file:

    ```diff

    + const favicon = path.join(__dirname, "assets", "img", "favicon.png');

    module.exports = require('./MapStore2/build/buildConfig')({
        ...
        prodPlugins: [
            new HtmlWebpackPlugin({
                template: path.join(__dirname, 'indexTemplate.html'),
                chunks: ['__PROJECTNAME__'],
                publicPath: 'dist/',
                inject: "body",
                hash: true,
    +           favicon
            }),
            new HtmlWebpackPlugin({
                template: path.join(__dirname, 'embeddedTemplate.html'),
                chunks: ['__PROJECTNAME__-embedded'],
                publicPath: 'dist/',
                inject: "body",
                hash: true,
                filename: 'embedded.html',
    +           favicon
            }),
            new HtmlWebpackPlugin({
                template: path.join(__dirname, 'apiTemplate.html'),
                chunks: ['__PROJECTNAME__-api'],
                publicPath: 'dist/',
                inject: 'body',
                hash: true,
                filename: 'api.html',
    +           favicon
            }),
            new HtmlWebpackPlugin({
                template: path.join(__dirname, 'geostory-embedded-template.html'),
                chunks: ['geostory-embedded'],
                publicPath: 'dist/',
                inject: "body",
                hash: true,
                filename: 'geostory-embedded.html',
    +           favicon
            }),
            new HtmlWebpackPlugin({
                template: path.join(__dirname, 'dashboard-embedded-template.html'),
                chunks: ['dashboard-embedded'],
                publicPath: 'dist/',
                inject: 'body',
                hash: true,
                filename: 'dashboard-embedded.html',
    +           favicon
            })
        ],
        ...
    });
    ```

### New homepage changes

The new homepage work introduces significant changes about plugins and configurations. The list of plugins introduced by the homepage:

- `BrandNavbar`
- `DeleteResource`
- `EditContext`
- `Favorites`
- `Footer` (web/client/plugins/ResourcesCatalog/Footer)
- `HomeDescription` (web/client/plugins/ResourcesCatalog/HomeDescription)
- `ResourceDetails`
- `ResourcesFiltersForm`
- `ResourcesGrid`
- `Save` (web/client/plugins/ResourcesCatalog/Save)
- `SaveAs` (web/client/plugins/ResourcesCatalog/SaveAs)

There is also a list of deprecated plugins that will be removed soon:

- `Dashboards`
- `GeoStories`
- `Maps`
- `Attribution`
- `Footer` (web/client/product/plugins/Footer)
- `Fork`
- `HomeDescription` (web/client/product/plugins/HomeDescription)
- `NavMenu`
- `ContentTabs`
- `Contexts`
- `DeleteMap`
- `DeleteGeoStory`
- `DeleteDashboard`
- `FeaturedMaps`
- `GeoStorySave`
- `GeoStorySaveAs`
- `DashboardSave`
- `DashboardSaveAs`
- `Save` (web/client/plugins/Save)
- `SaveAs` (web/client/plugins/SaveAs)

General advice when updating a custom project:

- new plugins files should be imported in the application entrypoint and the deprecated ones removed. In case of downstream project the new files should be imported automatically
- ensure to use the correct version of GeoStore (2.3-SNAPSHOT)
- compare the localConfig.json configuration of the project with the MapStore submodule's localConfig.json
- compare the pluginsConfig.json configuration of the project with the MapStore submodule's pluginsConfig.json

Below the detail of the changes needed in the configurations

#### GeoStore version update

GeoStore needs to be updated to the `2.3` version, changes needed in the `pom.xml`:

```diff
- <geostore-webapp.version>2.2-SNAPSHOT</geostore-webapp.version>
+ <geostore-webapp.version>2.3-SNAPSHOT</geostore-webapp.version>
```

New tables have been added to support `tags` and `favorites` associated to the resources. If your installation has the database creation mode set to update (the default), the new tables will be added automatically and you do not have to do any action. If it is set to validate instead you will have to run the update scripts.

- For script reference see:

    [postgresql migration from 2.1.0 to 2.3.0](https://github.com/geosolutions-it/geostore/blob/master/doc/sql/migration/postgresql/postgresql-migration-from-v.2.1.0-to-v2.3.0.sql)

    [h2 migration from 2.1.0 to 2.3.0](https://github.com/geosolutions-it/geostore/blob/master/doc/sql/migration/h2/h2-migration-from-v.2.1.0-to-v2.3.0.sql)

    [oracle migration from 2.1.0 2.3.0](https://github.com/geosolutions-it/geostore/blob/master/doc/sql/migration/oracle/oracle-migration-from-v.2.1.0-to-v2.3.0.sql)

#### localConfig.json changes

Here below all the changes needed related the localConfig.json configuration:

Add `resourceCanEdit` and `resourceDetails` to the `monitorState` property:

```diff
{
    "monitorState": [
        ...,
+       { "name": "resourceCanEdit", "path": "resources.initialSelectedResource.canEdit" },
+       { "name": "resourceDetails", "path": "resources.initialSelectedResource.attributes.details" }
    ]
}
```

Replace `Save`, `SaveAs` and `DeleteMap` configurations in the `desktop` (map viewer) section with the new configuration:

```diff
{
    "plugins": {
        "desktop": [
            ...,
-           "Save",
-           "SaveAs",
-           "DeleteMap",
+           {
+               "name": "BrandNavbar",
+               "cfg": {
+                   "containerPosition": "header"
+               }
+           },
+           {
+               "name": "ResourceDetails",
+               "cfg": {
+                   "resourceType": "MAP"
+               }
+           },
+           {
+               "name": "Save",
+               "cfg": {
+                   "resourceType": "MAP"
+               }
+           },
+           {
+               "name": "SaveAs",
+               "cfg": {
+                   "resourceType": "MAP"
+               }
+           },
+           {
+               "name": "DeleteResource",
+               "cfg": {
+                   "resourceType": "MAP",
+                   "redirectTo": "/"
+               }
+          }
        ],
    }
}
```

Replace `OmniBar`, `NavMenu`, `Attribution`, `DashboardSave`, `DashboardSaveAs` and `DeleteDashboard` configurations in the `dashboard` section with the new configuration:

```diff
{
    "plugins": {
        "dashboard": [
            ...,
-           "NavMenu",
-           "Attribution",
-           "DashboardSave",
-           "DashboardSaveAs",
-           "DeleteDashboard",
-           {
-               "name": "OmniBar",
-               "cfg": {
-                   "containerPosition": "header",
-                   "className": "navbar shadow navbar-home"
-               }
-           },
+           {
+               "name": "BrandNavbar",
+               "cfg": {
+                   "containerPosition": "header"
+               }
+           },
+           {
+               "name": "ResourceDetails",
+               "cfg": {
+                   "resourceType": "DASHBOARD"
+               }
+           },
+           {
+               "name": "Save",
+               "cfg": {
+                   "resourceType": "DASHBOARD"
+               }
+           },
+           {
+               "name": "SaveAs",
+               "cfg": {
+                   "resourceType": "DASHBOARD"
+               }
+           },
+           {
+               "name": "DeleteResource",
+               "cfg": {
+                   "resourceType": "DASHBOARD",
+                   "redirectTo": "/"
+               }
+           }
        ]
    }
}
```

Replace `OmniBar`, `NavMenu`, `Attribution`, `GeoStorySave`, `GeoStorySaveAs` and `DeleteGeoStory` configurations in the `geostory` section with the new configuration:

```diff
{
    "plugins": {
        "geostory": [
-           "NavMenu",
-           "Attribution",
-           "GeoStorySave",
-           "GeoStorySaveAs",
-           "DeleteGeoStory",
-           {
-               "name": "OmniBar",
-               "cfg": {
-                   "containerPosition": "header",
-                   "className": "navbar shadow navbar-home"
-               }
-           },
+           {
+               "name": "BrandNavbar",
+               "cfg": {
+                   "containerPosition": "header",
+                   "disablePluginIf": "{(state('router') && state('router').includes('/geostory/shared') && state('geostorymode') !== 'edit')}"
+               }
+           },
+           {
+               "name": "ResourceDetails",
+               "cfg": {
+                   "resourceType": "GEOSTORY"
+                   "containerPosition": "columns"
+               }
+           },
+           {
+               "name": "Save",
+               "cfg": {
+                   "resourceType": "GEOSTORY"
+               }
+           },
+           {
+               "name": "SaveAs",
+               "cfg": {
+                   "resourceType": "GEOSTORY"
+               }
+           },
+           {
+               "name": "DeleteResource",
+               "cfg": {
+                   "resourceType": "GEOSTORY",
+                   "redirectTo": "/"
+               }
+           }
        ]
    }
}
```

Remove `NavMenu`, `Attribution` and `OmniBar` configuration from the `context-creator` section, review the `ContextCreator` configuration and add the new `BrandNavbar` plugin:

```diff
{
    "plugins": {
        "context-creator": [
            ...,
-           "NavMenu",
-           "Attribution",
-           {
-               "name": "OmniBar",
-               "cfg": {
-                   "containerPosition": "header",
-                   "className": "navbar shadow navbar-home"
-               }
-           },
            {
                "name": "ContextCreator",
                "cfg": {
                    "documentationBaseURL": "https://mapstore.geosolutionsgroup.com/mapstore/docs/api/plugins",
-                   "backToPageDestRoute": "/context-manager",
+                   "backToPageDestRoute": "/",
                    "backToPageConfirmationMessage": "contextCreator.undo"
                }
            },
+           {
+               "name": "BrandNavbar",
+               "cfg": {
+                   "containerPosition": "header"
+               }
+           }
        ]
    }
}
```

Finally replace the content of the `common` and `maps` (homepage) sections with the following configurations that includes all the nre homepage plugins:

```json
{
    "plugins": {
        "common": [
            {
                "name": "BrandNavbar"
            },
            {
                "name": "ManagerMenu"
            },
            "Login",
            "Language",
            "ScrollTop",
            "Notifications"
        ],
        "maps": [
            {
                "name": "HomeDescription"
            },
            {
                "name": "ResourcesGrid",
                "cfg": {
                    "id": "featured",
                    "titleId": "manager.featuredMaps",
                    "pageSize": 4,
                    "cardLayoutStyle": "grid",
                    "order": null,
                    "hideWithNoResults": true,
                    "defaultQuery": {
                        "f": "featured"
                    }
                }
            },
            {
                "name": "ResourcesGrid",
                "cfg": {
                    "id": "catalog",
                    "titleId": "resources.contents.title",
                    "queryPage": true,
                    "menuItems": [
                        {
                            "labelId": "resourcesCatalog.addResource",
                            "disableIf": "{!state('userrole')}",
                            "type": "dropdown",
                            "variant": "primary",
                            "size": "sm",
                            "responsive": true,
                            "noCaret": true,
                            "items": [
                                {
                                    "labelId": "resourcesCatalog.createMap",
                                    "type": "link",
                                    "href": "#/viewer/new"
                                },
                                {
                                    "labelId": "resourcesCatalog.createDashboard",
                                    "type": "link",
                                    "href": "#/dashboard/"
                                },
                                {
                                    "labelId": "resourcesCatalog.createGeoStory",
                                    "type": "link",
                                    "href": "#/geostory/newgeostory/"
                                },
                                {
                                    "labelId": "resourcesCatalog.createContext",
                                    "type": "link",
                                    "href": "#/context-creator/new",
                                    "disableIf": "{state('userrole') !== 'ADMIN'}"
                                }
                            ]
                        }
                    ]
                }
            },
            {
                "name": "TagsManager"
            },
            {
                "name": "Favorites"
            },
            {
                "name": "ResourcesFiltersForm",
                "cfg": {
                    "resourcesGridId": "catalog"
                }
            },
            {
                "name": "EditContext"
            },
            {
                "name": "DeleteResource"
            },
            {
                "name": "ResourceDetails",
                "cfg": {
                    "enableFilters": true
                }
            },
            {
                "name": "Share",
                "cfg": {
                    "draggable": false,
                    "advancedSettings": false,
                    "showAPI": false,
                    "embedOptions": {
                        "showTOCToggle": false
                    },
                    "map": {
                        "embedOptions": {
                            "showTOCToggle": true
                        }
                    },
                    "geostory": {
                        "embedOptions": {
                            "showTOCToggle": false,
                            "allowFullScreen": false
                        },
                        "shareUrlRegex": "(h[^#]*)#\\/geostory\\/([^\\/]*)\\/([A-Za-z0-9]*)",
                        "shareUrlReplaceString": "$1geostory-embedded.html#/$3",
                        "advancedSettings": {
                            "hideInTab": "embed",
                            "homeButton": true,
                            "sectionId": true
                        }
                    },
                    "dashboard": {
                        "shareUrlRegex": "(h[^#]*)#\\/dashboard\\/([A-Za-z0-9]*)",
                        "shareUrlReplaceString": "$1dashboard-embedded.html#/$2",
                        "embedOptions": {
                            "showTOCToggle": false,
                            "showConnectionsParamToggle": true
                        }
                    }
                }
            },
            {
                "name": "Footer"
            },
            {
                "name": "Cookie",
                "cfg": {
                    "externalCookieUrl": "",
                    "declineUrl": "http://www.google.com"
                }
            }
        ]
    }
}
```

#### pluginsConfig.json changes

Here below all the changes needed related the pluginsConfig.json configuration

```diff
{
    "plugins": [
        ...,
        {
-           "name": "DeleteMap",
+           "name": "DeleteResource",
            "glyph": "trash",
            "title": "plugins.DeleteMap.title",
            "hidden": false,
            "description": "plugins.DeleteMap.description",
            "dependencies": [
                "SidebarMenu"
            ]
        },
        ...,
+       {
+           "name": "BrandNavbar",
+           "title": "plugins.BrandNavbar.title",
+           "description": "plugins.BrandNavbar.description",
+           "defaultConfig": {
+               "containerPosition": "header"
+           }
+       },
+       {
+           "name": "ResourceDetails",
+           "title": "plugins.ResourceDetails.title",
+           "description": "plugins.ResourceDetails.description",
+           "defaultConfig": {
+               "resourceType": "MAP"
+           },
+           "dependencies": [
+               "BrandNavbar"
+           ]
+       }
    ]
}
```

## Migration from 2024.01.02 to 2024.02.00

### NodeJS and NPM update

From this version the **recommended version** to build MapStore or for development is **Node 20** (**minimum** version will be **Node 16**).
Please update your Node version accordingly on your develop machine or CI/CD.

See the [requirements](./requirements.md#debug-build) section of the documentation for the details.

The same for projects of derived `MapStoreExtensions`. Make sure to:

- Update `package.json` with the new versions of webpack and other dependencies.
- Remove and regenerate your `package-lock.json` with `npm install` after updating the Node version.

Here the diff used for MapStore Extensions to update the `package.json` file:

```diff
diff --git a/package.json b/package.json
index 62ddda0..62ce070 100644
--- a/package.json
+++ b/package.json
@@ -44,6 +44,7 @@
     "@geosolutions/jsdoc": "3.4.4",
     "@geosolutions/mocha": "6.2.1-3",
     "@mapstore/eslint-config-mapstore": "1.0.5",
+    "@testing-library/react": "12.1.5",
     "axios-mock-adapter": "1.16.0",
     "babel-loader": "8.0.5",
     "babel-plugin-add-module-exports": "0.1.4",
@@ -66,8 +67,8 @@
     "expect": "1.20.1",
     "file-loader": "2.0.0",
     "glob": "7.1.1",
-        "html-loader": "0.5.1",
-        "html-webpack-plugin": "4.5.0",
+    "html-loader": "2.0.0",
+    "html-webpack-plugin": "5.2.0",
     "jsdoc-jsx": "0.1.0",
     "karma": "6.4.0",
     "karma-chrome-launcher": "3.1.1",
@@ -104,9 +105,10 @@
     "rimraf": "2.5.2",
     "simple-git": "2.20.1",
     "style-loader": "2.0.0",
+    "terser": "5.18.1",
     "url-loader": "0.5.7",
     "vusion-webfonts-generator": "0.4.1",
-        "webpack": "5.9.0",
+    "webpack": "5.54.0",
     "webpack-bundle-size-analyzer": "2.0.2",
     "webpack-cli": "4.10.0",
     "webpack-dev-server": "3.11.0",
```

### Java dependencies update

Some libraries has been updated. if you have a MapStore project make sure to keep the versions aligned with the main product.

## Migration from 2024.01.00 to 2024.01.02

### Enable showing credits/attribution text in Print config

Due to showing layers' credits/attributions of printed map which will be displayed at the bottom of the map section, the MapStore `config.yaml` file should be reviewed and updated. Below are reported the relevant changes that need to be applied also to `config.yaml` of MapStore downstream projects where the printing engine is present.

- Added a section for credits into `config.yaml` file at the end of the mainPage for each layout, for more details see [here](https://github.com/geosolutions-it/MapStore2/pull/10451/files#diff-3599ba7c628c7c764665046828bad74c0c8576aad03f5497cf426b59010a6d07R27)
- In this added section, proper values for `absoluteX` and `absoluteY` should be applied to be consistent with overall layout
- There are some edits to the value of `absoluteY` for the section located directly above credit/attribution section based on the layout

example:

```yaml
    mainPage:
    ....
    items:
    ....
    - !columns
        absoluteX: 42
        absoluteY: 35
        width: 1111
        items:
        - !text
            align: left
            vertAlign: middle
            fontSize: 6
              text: '${credits}'
```

### Option to hide the group info of logged in user from user details modal window

Recently, we have added the option to hide the `user group info` from the user details modal.
To enable this, you have to add a cfg in all `Login` plugin into `localConfig.json` like:

```json
{
    "name": "Login",
    "cfg": { "toolsCfg": [{"hideGroupUserInfo": true}] }
}
```

where the first index of toolsCfg is for `userDetails` component that is responsible for displaying the user details including `user group info`

!!! note important notes should be considered:

- if you have customized the Login plugin and in particular the order of toolsCfg, make sure to override the correct one as the propagation of cfg for the tools is based on index value.

### Integration with openID Connect

A generic OpenID Connect (OIDC) authentication support has been introduced in MapStore. This feature allows to authenticate users using an OIDC provider, like Keycloak, Okta, Google, Azure, etc.

To provide this functionality, it is necessary to update the project's `geostore-spring-security.xml` file, if the default one is not used.
If you are using the default one, you can skip this step.

Here the changes to apply if needed:

```diff
@@ -24,6 +24,7 @@
         <security:custom-filter ref="sessionTokenProcessingFilter" after="FORM_LOGIN_FILTER"/>
         <security:custom-filter ref="keycloakFilter" before="BASIC_AUTH_FILTER"/>
         <security:custom-filter ref="googleOpenIdFilter" after="BASIC_AUTH_FILTER"/>
+        <security:custom-filter ref="oidcOpenIdFilter" before="OPENID_FILTER"/> <!-- ADD a filter with this ref -->
         <security:anonymous />
     </security:http>

@@ -52,6 +53,7 @@

     <!-- OAuth2 beans -->
     <context:annotation-config/>
+    <bean id="oidcSecurityConfiguration" class="it.geosolutions.geostore.services.rest.security.oauth2.openid_connect.OpenIdConnectSecurityConfiguration"/> <!-- add this bean to configure the integration -->

     <bean id="googleSecurityConfiguration" class="it.geosolutions.geostore.services.rest.security.oauth2.google.OAuthGoogleSecurityConfiguration"/>
```

## Migration from 2023.02.02 to 2024.01.00

### TOC plugin refactor

The table of content (TOC) has been refactored with following changes:

- Removal of hardcoded tools from the toolbar. Now all the toolbar's elements are injected by related plugins. This includes also the introduction of a new plugin called `MetadataInfo` for layer metadata.
- Refactors of TOC components
- Review of plugin configuration (cfg). List of changed configuration properties:
  - `activateSettingsTool` removed property, now the button will be added directly from `TOCItemsSettings` when available
  - `activateQueryTool` removed property, now the button will be directly added by `FilterLayer` plugin, when available
  - `activateDownloadTool` removed property, now the button will be added directly from `LayerDownload` when available
  - `activateMetedataTool` removed property, now the button will be added directly from `MetadataInfo` when availables
  - `checkPlugins` remove property, now availability of tools rely on the related plugin so this check is not needed anymore
  - `showFullTitleOnExpand`  removed property, the new style allows for seeing the full title inline without duplicating it
  - `metadataTemplate` this configuration has been moved to `MetadataInfo` plugin
  - `metadataOptions` this configuration has been moved to `MetadataInfo` plugin

### Introduction of MetadataInfo plugin

The `MetadataInfo` plugin has been introduced to include the layer metadata info button of the TOC toolbar has separated plugin as expected by the new TOC.
Some steps are needed to correctly configure it:

- Ensure to import the `MetadataInfo` plugin in the downstream project
- Include the plugin definition in the `pluginsConfig.json` to make it available inside contexts
- Move the related configuration (cfg) from the TOC to the `MetadataInfo` plugin definition in `localConfig.json` file. This is only necessary if the layer metadata button was configured at the application level
- Update your contexts to use `MetadataInfo` plugin, properly configured, when needed

expected changes in the `pluginsConfig.json` file:

- add `MetadataInfo` entry to the list

```js
{
    "name": "MetadataInfo"
}
```

### Maven project update

With this release the maven `pom.xml` files has been restructured to centralize dependencies version in the `dependencyManagement` section and then in some properties in the root `pom.xml` file.
This regards also the projects that now hold the versions of the dependencies in the properties section.
Your projects will work in any case, but we suggest to update your `pom.xml` files to align them to the new structure (see template file in the MapStore2 repository for more details).

### Database update

The resource metadata has been recently extented to include  information about resource creator and editor and to provide the advertises/unadvertised resource functionalities.
If your installation has the [database creation mode](https://docs.mapstore.geosolutionsgroup.com/en/latest/developer-guide/database-setup/#database-creation-mode) set to `update` (the default), the columns will be added automatically and you do not have to do any action. If it is set to `validate` instead you will have to run the update scripts.

*In any case*, the update scripts contain also a part to populate the `creator` column, that can not be applied automatically with  [database creation mode](https://docs.mapstore.geosolutionsgroup.com/en/latest/developer-guide/database-setup/#database-creation-mode) set to `update`.
So if you want to see this information, even if it is not strictily required, you will have to run the migration scripts anyway.

- For script reference see:

    [postgresql migration script 2.0.0 to 2.1.0](https://github.com/geosolutions-it/geostore/blob/master/doc/sql/migration/postgresql/postgresql-migration-from-v.2.0.0-to-v2.1.0.sql)

    [h2 migration script 2.0.0 to 2.1.0](https://github.com/geosolutions-it/geostore/blob/master/doc/sql/migration/h2/h2-migration-from-v.2.0.0-to-v2.1.0.sql)

    [oracle migration script 2.0.0 to 2.1.0](https://github.com/geosolutions-it/geostore/blob/master/doc/sql/migration/oracle/oracle-migration-from-v.2.0.0-to-v2.1.0.sql)

### Restructuring of Login and Home in Dashboard page

We recently added the sidebar to the dashboard page and by doing so we wanted to keep a uniform position of login and home plugins, by putting them in the omnibar container rather than the sidebar one. The viewer is a specific case that will be reviewed in the future.

In order to align the configuration of the two mentioned plugin you have to:

- edit `localConfig.json` `plugins.dashboard` section
- remove `BurgerMenu`, `Home` and `Login` items
- add the following

```json
"Details",
"AddWidgetDashboard",
"MapConnectionDashboard",
{
  "name": "SidebarMenu",
  "cfg": {
    "containerPosition": "columns"
  }
},
{
  "name": "Home",
  "override": {
    "OmniBar": {
      "priority": 5
    }
  }
},
{
  "name": "Login",
  "override": {
    "OmniBar": {
      "priority": 5
    }
  }
},
```

### Using `elevation` layer type instead of wms layer with useForElevation property

The wms layer with `useForElevation` property is deprecated and a `elevation` layer introduced in substitution.
The new `elevation` layer is used only to display height information inside the mouse position plugin and it will not provide a support for terrain model of the 3D visualziation mode. In order to provide this support, you need to add a `terrain` layer too. See documentation about [Elevation layer](maps-configuration.md#elevation) and [Terrain layer](maps-configuration.md#terrain) for more details.
A configuration update example:

```diff
{
    "name": "Map",
    "cfg": {
        "additionalLayers": [
            {
-               "type": "wms",
+               "type": "elevation",
                "url": "/geoserver/wms",
                "name": "workspace:layername",
-               "format": "application/bil16",
                "visibility": true,
-               "useForElevation": true,
                "littleEndian": false
            },
            // only needed for 3D terrain
+           {
+               "type": "terrain",
+               "provider": "wms",
+               "url": "/geoserver/wms",
+               "name": "workspace:layername",
+               "littleEndian": false,
+               "visibility": true,
+               "crs": "CRS:84"
            }
        ]
    }
}
```

### Removing possibility to add custom fonts to the Map

From this version we limited the load of the font to FontAwesome.

If you have changed the property **fonts** inside Map plugin it will not longer load the font. A possible fix would be to add the font to the `*.html` files in your application.

- make sure that the `localConfig.json` does not have **fonts** property in  **Map**  plugin

The following css is added automatically if needed `<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"/>` inside the *head* tag.

### Fixing background config

From this version in order to fix default 3d background config a change is needed here:

- update `localConfig.json` by adding **visibility: false**  to the Empty Background entry in `intialState.defaultState.catalog.default.staticServices.default_map_backgrounds.backgrounds`
- update `new.json` by adding **visibility: false**  to the Empty Background entry.

### Adding spatial filter to dashboard widgets

In order to enable the possibility to add in and the spatial filter to the widgets ( see [#9098](https://github.com/geosolutions-it/MapStore2/issues/9098) ) you have to edit the `QueryPanel` config in the `plugins.dashboard` array of the `localConfig.json` file by adding:

- **useEmbeddedMap**: flag to enable the embedded map
- **spatialOperations**: The list of spatial operations allowed for this plugin
- **spatialMethodOptions**: the list of spatial methods to use.

```json
...
"dashboard": [
...
{
    "name": "QueryPanel",
    "cfg": {
        "toolsOptions": {
            "hideCrossLayer": true,
            "useEmbeddedMap": true
        },
        "spatialPanelExpanded": false,
        "spatialOperations": [
            {"id": "INTERSECTS", "name": "queryform.spatialfilter.operations.intersects"},
            {"id": "CONTAINS", "name": "queryform.spatialfilter.operations.contains"},
            {"id": "WITHIN", "name": "queryform.spatialfilter.operations.within"}
        ],
        "spatialMethodOptions": [
            {"id": "BBOX", "name": "queryform.spatialfilter.methods.box"},
            {"id": "Circle", "name": "queryform.spatialfilter.methods.circle"},
            {"id": "Polygon", "name": "queryform.spatialfilter.methods.poly"}
        ],
        "containerPosition": "columns"
    }
}

```

### MapFish Print update

The **MapFish Print** library has been updated to work with the latest GeoTools version and Java 11 as well as being aligned with the same dependency used by the official GeoServer printing extension (see this issue <https://github.com/geosolutions-it/mapfish-print/issues/65>)
For this reason, if you are using the printing plugin in your project you have to update it by following the following steps:

- Change the version of the mapfish-print dependency in the project `pom.xml` file:

```diff
                <!-- mapfish-print -->
                <dependency>
                    <groupId>org.mapfish.print</groupId>
                    <artifactId>print-lib</artifactId>
-                    <version>geosolutions-2.3-SNAPSHOT</version>
+                    <version>2.4-SNAPSHOT</version>

```

- Add the mvn repository where this library is hosted in the `repositories` section of the same `pom.xml` (usually in `web` folder of a project)

```diff
        <repository>
            <id>osgeo-snapshot</id>
            <name>Open Source Geospatial Foundation Repository</name>
            <url>https://repo.osgeo.org/repository/snapshot/</url>
            <snapshots>
                <enabled>true</enabled>
            </snapshots>
        </repository>
```

#### Print config file update

Due to the introduction of the new `Jackson Yaml` parser, the MapStore `config.yaml` file has been reviewed and updated. Below are reported all the relevant changes that need to be applied also to `config.yaml` of MapStore donwstream projects where the printing engine is present.

Due to the new library being stricter on the format of the Yaml, some changes in the configuration files were made, to make them compliant with yaml format:

- Removed not allowed characters from property values (`@` in `@shared.privileged.geoserver.pass@`)
- Removed references without anchors (document declares link to `*commonFooter` but anchor `&commonFooter` was not defined previously)
- Added a space between key\value pairs (`"absoluteX: 30"` instead of `"absoluteX:30"`)

Some additional updates has been provided due to parsing issue with the new library:

```yaml
- !ipMatch
    host: 127.0.0.1
    # Allow to all hosts
    mask: 0.0.0.0
```

`!ipMatch` is mapped to [AddressHostMatcher](https://github.com/mapfish/mapfish-print-v2/blob/0c055e2a36bec3b12eafd207144ff8eb7b37f987/src/main/java/org/mapfish/print/config/AddressHostMatcher.java#L26), which does not have host property. Should instead use ip property (e.g IP: 127.0.0.1)

```yaml
- !text
              width: 300
              text: '${comment}'
              ...
```

`!text` is mapped to [TextBlock class](https://github.com/mapfish/mapfish-print-v2/blob/4b73912e5565ae206af5b5c434ef37454a98c252/src/main/java/org/mapfish/print/config/layout/TextBlock.java#L37). It does not have width property, so it should be removed.

```yaml
lastPage:
    rotation: true
    ...
```

lastPage is mapped to [LastPage class](https://github.com/mapfish/mapfish-print-v2/blob/4b73912e5565ae206af5b5c434ef37454a98c252/src/main/java/org/mapfish/print/config/layout/LastPage.java#L30), and does not have rotation property.

### Annotations plugin refactor

The Annotation plugin has been updated to be supported also in 3D maps. This update introduced some changes:

- All the configurations related to the "Annotations" plugin has been removed from `localConfig.json` `defaultState` entry and moved to the `cfg` property of the plugin
- The annotations reducers is not needed anymore inside the default reducers of the app

Please update by:

- Removing `annotations` entry from your `localConfig.json` `defaultState`
- If you customized the app, you can remove the `annotations` reducer from default reducers.
- If some customizations were applied to the Annotations plugin in `defaultState`, apply these changes to the plugin configuration, following the documentation of the plugin.

## Migration from 2023.01.02 to 2023.02.00

### About plugin cfg changes

Starting this release **2023.02.00** we have included a new *cfg* option the About plugin called **githubUrl**

We suggest you to edit About plugin cfg of **localConfig.json** adding the following

```diff
{
-    "name": "About"
+    "name": "About",
+    "cfg": {
+      "githubUrl": "https://github.com/GITHUB_USER/REPO_NAME/tree/"
+    }
```

inside `configs/pluginsConfig.json` you can add this to the About plugin definition

```diff
      "name": "About",
      "glyph": "info-sign",
      "title": "plugins.About.title",
      "description": "plugins.About.description",
      "dependencies": [
        "SidebarMenu"
-      ]
+      ],
+      "defaultConfig": {
+        "githubUrl": "https://github.com/GITHUB_USER/REPO_NAME/tree/"
+      }
    },
```

### NodeJS/NPM upgrade

In this release we updated all our systems to use node 16/NPM 8. This because Node 12 is actually out of maintenance.
We are going to support soon more recent versions of NodeJS solving the related issues.
So make you sure to use the correct version of NodeJS/NPM to build things correctly. See the [requirements](../requirements/#debug-build) section of the document for the details.

### Visualization mode in map configuration

The map configuration stores the information related to the visualization mode 2D or 3D after saving a map.
This update include also following changes:

- `maptype` default state configuration inside the initialState of `localConfig.json` needs to be removed. If a MapStore project needs a particular setup (eg. use only OpenLayers for 2D maps, initialize the app in 3D, ...) it is possible to override the default map libraries configuration with the new `mapType` property in the `localConfig.json` file, see documentation [here](local-config.md#application-configuration).

```diff
{
    // ...
    "initialState": {
        "defaultState": {
            // ...
-           "maptype": {
-               "mapType": "{context.mode === 'desktop' ? 'openlayers' : 'leaflet'}"
-           },
            // ...
        }
    }
    // ...
}
```

- the `changeMapType` action has been deprecated in favor of the `changeVisualizationMode` action

- the application does not expose the pathname of the viewer with `mapType` anymore. Example: the old path `/viewer/openlayers/1` becomes `/viewer/1`

- the app pages inside a MapStore project must be updated with a new entry, only for projects with custom pages and that are using context applications, here an example:

```js
import MapViewer from '@mapstore/product/pages/MapViewer';
import productAppConfig from "@mapstore/product/appConfig";

const appConfig = {
    ...productAppConfig,
    pages: [
        // my custom pages ...,
        {
            name: "mapviewer",
            path: "/viewer/:mapId/context/:contextId",
            component: MapViewer
        }
    ]
};
```

### Clean up of old maven repositories

The old spring maven repositories that do not exist anymore have been removed from the `pom.xml` files. They are not needed anymore, so you can remove them from your `pom.xml` files too.

```diff

-        <!-- Spring -->
-        <repository>
-            <id>spring-release</id>
-            <name>Spring Portfolio Release Repository</name>
-            <url>https://maven.springframework.org/release</url>
-            <snapshots>
-                <enabled>false</enabled>
-            </snapshots>
-        </repository>
-        <repository>
-            <id>spring-external</id>
-            <name>Spring Portfolio External Repository</name>
-            <url>https://maven.springframework.org/external</url>
-            <snapshots>
-                <enabled>false</enabled>
-            </snapshots>
-        </repository>
```

### New Permalink plugin

As part this release, permalink plugin is added to MapStore. The new plugin is already configured in standard MapStore application, but if you are working on a project or if you customized the configuration files, you may need to update them to introduce the new plugin.

In any case on an existing installation you **must** update the database adding the category to make the plugin work.

#### Add Permalink plugin to localConfig.json

In the case you customized your `configs/localConfig.json` file in your project/installation, to add the permalink plugin you will have to update it as following:

- Add the "Permalink" plugin to the pages you want to use this plugin. Pages plugins are in the `plugins` section in the root of `localConfig.json`,  so you have to add "Permalink" entry to `desktop`, `dashboard` and `geostory` arrays, like this:

```json
{
    "desktop": [
        ...
        "Permalink",
        ...
    ],
    "dashboard": [
        ...
        "Permalink",
        ...
    ],
    "geostory": [
        ...
        "Permalink",
        ...
    ]
}
```

- To activate the functionality, you must add a new `permalink` section to `plugins` root object of `localConfig.json`, as shown below

```json
{
    "permalink": [
        "Permalink",
        "FeedbackMask"
    ]
}
```

#### Using Permalink in new contexts

The plugins available for contexts are listed in the file `configs/pluginsConfig.json`. In your project/installation, you may need to edit this configuration to make the plugin selectable for your context.
Existing contexts need to be updated separately, after applying these changes

- Find the "Share" plugin configuration in the `plugins` array in the root of  `pluginsConfig.json` configuration file and modify it as shown below (adding `children` and `autoEnableChildren` sections:

```json
    {
      "name": "Share",
      "glyph": "share",
      "title": "plugins.Share.title",
      "description": "plugins.Share.description",
      "dependencies": [
        "SidebarMenu"
      ],
      "children": [
        "Permalink"
      ],
      "autoEnableChildren": [
        "Permalink"
      ]
    }
```

- Add "Permalink" plugin configuration to the `plugins` array in the root of `pluginsConfig.json`

```json
    {
      "name": "Permalink",
      "glyph": "link",
      "title": "plugins.Permalink.title",
      "description": "plugins.Permalink.description"
    },
```

- the app pages inside a MapStore project must be updated with a new entry, only for projects using permalink feature, here an example:

```js
import Permalink from '@mapstore/product/pages/Permalink';
import productAppConfig from "@mapstore/product/appConfig";

const appConfig = {
    ...productAppConfig,
    pages: [
        // my custom pages ...,
        {
            name: "permalink",
            path: "/permalink/:pid",
            component: Permalink
        }
    ]
};
```

#### Database Update

Add new category `PERMALINK` to `gs_category` table. To update your database you need to apply this SQL scripts to your database

##### PostgreSQL

```sql
-- New PERMALINK category
INSERT INTO geostore.gs_category(id, name) VALUES (nextval('geostore.hibernate_sequence'), 'PERMALINK') ON CONFLICT DO NOTHING;
```

##### H2

```sql
-- New PERMALINK category
INSERT INTO gs_category(name) VALUES ('PERMALINK');
```

##### Oracle

```sql
-- New PERMALINK category
INSERT INTO gs_category(id, name) VALUES (hibernate_sequence.nextval, ‘PERMALINK');
```

## Migration from 2022.02.02 to 2023.01.00

### Log4j update to Log4j2

With this release Log4j has been updated to Log4j2. The Log4j API has changed with version 2. Basically if you customized logging properties, you have to update the properties file following the `log4j properties file migration` section.

If you have a downstream project, you will have also to update your dependencies in `pom.xml` and your Java code, following the suggestions in `log4j2 dependencies and code update` section.

For more information or more details about how to migrate, follow the [official documentation](https://logging.apache.org/log4j/2.x/manual/migration.html).

!!! note:
    A compatibility tier has been added in order to allow to use old configurations. Anyway it is strongly suggested to update your files as soon as possible.

#### log4j2 properties file migration

To have logging properly work on MapStore then it is needed to:

- Rename `log4j.properties` file to `log4j2.properties`.

- Edit the `properties` to configure it according to the log4j2 syntax. See the `Configuration with Properties` section on the [official documentation page](https://logging.apache.org/log4j/2.x/manual/configuration.html). Below the old and the new default log4j configuration files are juxtaposed:

`log4j.properties`

```properties
log4j.rootLogger=INFO, fileAppender

log4j.appender.consoleAppender=org.apache.log4j.ConsoleAppender
log4j.appender.consoleAppender.layout=org.apache.log4j.PatternLayout
log4j.appender.consoleAppender.layout.ConversionPattern=%p %d{yyyy-MM-dd HH:mm:ss.SSS} %c::%M:%L - %m%n

log4j.logger.it.geosolutions.geostore.services.rest=INFO
log4j.logger.org.hibernate=INFO
log4j.logger.com.trg=INFO

# File appender
log4j.appender.fileAppender=org.apache.log4j.RollingFileAppender
log4j.appender.fileAppender.layout=org.apache.log4j.PatternLayout
log4j.appender.fileAppender.layout.ConversionPattern=%p   %d{yyyy-MM-dd HH:mm:ss.SSS}   %C{1}.%M() - %m %n
log4j.appender.fileAppender.File=${catalina.base}/logs/mapstore.log
```

`log42.properties`

```properties
rootLogger.level = INFO
appenders= console, file


appender.console.type = Console
appender.console.name = LogToConsole
appender.console.layout.type = PatternLayout
appender.console.layout.pattern = %p %d{yyyy-MM-dd HH:mm:ss.SSS} %c::%M:%L - %m%n
rootLogger.appenderRef.stdout.ref = LogToConsole
rootLogger.appenderRef.console.ref = LogToConsole

appender.file.type = File
appender.file.name = LogToFile
appender.file.fileName=${sys:catalina.base}/logs/mapstore.log
appender.file.layout.type=PatternLayout
appender.file.layout.pattern=%p   %d{yyyy-MM-dd HH:mm:ss.SSS}   %C{1}.%M() - %m %n
rootLogger.appenderRef.file.ref = LogToFile


logger.restsrv.name=it.geosolutions.geostore.services.rest
logger.restsrv.level=  INFO
logger.hibernate1.name=org.hibernate
logger.hibernate1.level=INFO
logger.trg1.name=com.trg
logger.trg1.level=INFO
```

The main difference applies to how define the Log level on a per package basis. If in previous version of log4j a single property was defining both the package and the level now we need two distinct properties, one to define the name (the package) and the other for the level:

- before

```properties
log4j.logger.it.geosolutions.geostore.services.rest=INFO
```

- now

```properties
logger.restsrv.name=it.geosolutions.geostore.services.rest
logger.restsrv.level=  INFO
```

Note that the second part of the property key in the log4j2 (`restsrv` in the example) can be whatever string of choice, with the only requirement to be the same for the `name` and the `level` property.

#### log4j2 dependencies and code update

In your downstream project you will have to replace, where you used (typically in `backend` and `web` folders) the following dependencies:

```xml
            <dependency>
                <groupId>log4j</groupId>
                <artifactId>log4j</artifactId>
                <version>${log4j.version}</version>
            </dependency>
            <dependency>
                <groupId>org.slf4j</groupId>
                <artifactId>slf4j-log4j12</artifactId>
                <version>${slf4j.version}</version>
            </dependency>
            <dependency>
                <groupId>org.slf4j</groupId>
                <artifactId>jcl-over-slf4j</artifactId>
                <version>${slf4j.version}</version>
            </dependency>
             <dependency>
                <groupId>org.slf4j</groupId>
                <artifactId>slf4j-api</artifactId>
                <version>${slf4j.version}</version>
            </dependency>
```

with

```xml
 <dependency>
    <groupId>org.apache.logging.log4j</groupId>
    <artifactId>log4j-core</artifactId>
    <version>2.19.0</version>
 </dependency>
 <dependency>
    <groupId>org.apache.logging.log4j</groupId>
    <artifactId>log4j-api</artifactId>
    <version>2.19.0</version>
 </dependency>
 <dependency>
    <groupId>org.apache.logging.log4j</groupId>
    <artifactId>log4j-slf4j-impl</artifactId>
    <version>2.19.0</version>
 </dependency>

```

!!! note:
    of course you can use `properties` of maven to not repeat the version numbers everytime, or dependency management.

Moreover, if you have some custom code, you will hae to replace  the use of `getLogger`. Example:

```java
private static final Logger LOGGER = Logger.getLogger(MyClass.class);
```

with

```java
private static final Logger LOGGER = LogManager.getLogger(MyClass.class);
```

where `LogManager` can be imported as:

```java
import org.apache.logging.log4j.LogManager;
```

and `Logger` can be imported as:

```java
import org.apache.logging.log4j.Logger;
```

### Update database schema

This new version introduced the attributes for user groups. This requires an update to your database applying the scripts available [here](https://github.com/geosolutions-it/geostore/tree/master/doc/sql/migration). You have to apply the script `*-migration-from-v.1.5.0-to-v2.0.0` of your database. For instance on postgreSQL, you will have to execute the script `postgresql/postgresql-migration-from-v.1.5.0-to-v2.0.0`.

!!! note:
    The script assumes you set the search path for your db schema. Usually in postgres it is `geostore`. So make you sure to set the proper search path before to execute the script in postgres. (e.g. `SET search_path TO geostore;` )

!!! note:
    If you don't want to or you can not execute the migration script, you can set in `geostore-datasource-ovr.properities` the following property to make MapStore update the database for you

    ```properties
    geostoreEntityManagerFactory.jpaPropertyMap[hibernate.hbm2ddl.auto]=update
    ``

## Migration from 2022.02.00 to 2022.02.01

### Package.json scripts migration

With this release we are refactoring a bit the naming of the scripts maintaining retro compatibility avoiding builds on ci/cd systems to break.
Anyway we suggest to align them as listed [here](https://github.com/geosolutions-it/MapStore2/blob/master/utility/projects/projectScripts.json)

The main changes are:

- We have removed `travis` and `mvntest` scripts.
- Most of the scripts are now prefixed with `app` or `fe` or `be` to make them more clear.
- Now `npm start` is an alias of `npm run app:start` and starts both front-end and back-end.

Although it is optional we suggest to align your project to these changes. In order to align your repository you should:

- update your `package.json` to latest scripts, you can copy them from `utility/projects/projectScripts.json` in MapStore2 repository.
- update your `build.sh` to use the latest scripts, instead of the old ones. See `project/standard/templates/build.sh` in MapStore2 repository.
- update in your repository `web/pom.xml` of your project to receive the backend property from ENV variables.

```diff
@@ -14,6 +14,7 @@
   <properties>
     <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
     <tomcat.version>8.5.69</tomcat.version>
+    <tomcat.port>8080</tomcat.port>
   </properties>

   <dependencies>
@@ -400,7 +401,7 @@
                         ${project.build.directory}/apache-tomcat-${tomcat.version}
                     </home>
                     <properties>
-                        <cargo.servlet.port>8080</cargo.servlet.port>
+                        <cargo.servlet.port>${tomcat.port}</cargo.servlet.port>
                         <cargo.logging>low</cargo.logging>
                     </properties>
                 </configuration>
@@ -419,6 +420,18 @@
     </plugins>
   </build>
     <profiles>
+        <profile>
+            <id>dev-custom-port</id>
+            <activation>
+                <property>
+                    <name>env.MAPSTORE_BACKEND_PORT</name>
+                </property>
+            </activation>
+            <properties>
+                <!-- Override only if necessary -->
+                <tomcat.port>${env.MAPSTORE_BACKEND_PORT}</tomcat.port>
+            </properties>
+        </profile>
         <profile>
             <id>printing</id>
             <activation>
```

## Migration from 2022.01.02 to 2022.02.00

### HTML pages optimization

We removed script and css link to leaflet CDN in favor of a dynamic import of the libraries in the main bundle, now leaflet is only loaded when the library is selected as map type of the viewer. You can update the project HTML files by removing these tags:

```diff
- <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/leaflet.css" />
- <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet.draw/1.0.2/leaflet.draw.css" />
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css" />
<link rel="shortcut icon" type="image/png" href="https://cdn.jslibs.mapstore2.geo-solutions.it/leaflet/favicon.ico" />
<!--script src="https://maps.google.com/maps/api/js?v=3"></script-->
- <script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/leaflet.js"></script>
- <script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet.draw/1.0.2/leaflet.draw.js"></script>
```

We also made asynchronous the script to detect valid browser. This should slightly improve the initial requests time.
 You can updated the script in your project as following:

```html
<script async type="text/javascript" src="https://unpkg.com/bowser@2.7.0/es5.js" onload="checkBrowser()"></script>
<script type="text/javascript">
    function checkBrowser() {
        var browserInfo = bowser.getParser(window.navigator.userAgent);
        var isValidBrowser = browserInfo.satisfies({
            "edge": ">1",
            "chrome": ">1",
            "safari": ">1",
            "firefox": ">1"
        });
        if (!isValidBrowser) {
            window.location.href = "unsupportedBrowser.html"
            document.querySelector("container").style.display = "none";
        }
    }
</script>
```

### Update plugins.js to make upstream plugins use dynamic import

We've updated `plugins.js` in MapStore to make most of the plugins use dynamic import. `plugins.js` of your project have to be updated separately.

Please use `web\client\product\plugins.js` file as a reference listing plugins whose definition can be changed to support dynamic import.

To use dynamic import for plugin, please update its definition to look like:

```js
{
    ...
    AnnotationsPlugin: toModulePlugin('Annotations', () => import(/* webpackChunkName: 'plugins/annotations' */ '../plugins/Annotations')),
    ...
}

```

See [Dynamic import of extension](../extensions/#dynamic-import-of-extension) to have more details about transforming extensions to use dynamic import.

### Version plugin has been removed

We no longer maintain the Version plugin since we have moved its content inside the About plugin (see [here](https://github.com/geosolutions-it/MapStore2/issues/7934#issuecomment-1201433942) for more details)

We suggest you to clean up your project as well:

- remove Version entry it from a local list of plugins.js
- remove Version entries it from a localConfig.json and pluginConfig.json
- add About entry into other pages of mapstore plugins array:

  - dashboard
  - geostory
  - mobile
- remove `DefinePlugin` entries dedicated to git revision retrieved by `git-revision-webpack-plugin`, if any, from `webpack-config.js` or `prod.webpack-config.js`, because they have been moved to the file `build/BuildUtils.js`
- check that in your package.json you have this extends rule

```js
"eslintConfig": {
    "extends": [
      "@mapstore/eslint-config-mapstore"
    ],
    ...
```

- edit the version of the *@mapstore/eslint-config-mapstore* to **1.0.5** in your package.json so that the new globals config will be inherited

!!! note
    this may fail on gha workflows, in that case we suggest to edit directly your package.json with globals taken from mapstore framework

### Support for OpenID

MapStore introduced support for OpenID for google and keycloak. In order to have this functionalities and to be aligned with the latest version of MapStore you have to update the following files in your projects:

- `geostore-spring-security.xml` (your custom spring security context) have to be updated adding the beans and the `security:custom-filter` entry in the `<security:http>` entry, as here below:

```diff
        <security:csrf disabled="true"/>
        <security:custom-filter ref="authenticationTokenProcessingFilter" before="FORM_LOGIN_FILTER"/>
        <security:custom-filter ref="sessionTokenProcessingFilter" after="FORM_LOGIN_FILTER"/>
+        <security:custom-filter ref="keycloakFilter" before="BASIC_AUTH_FILTER"/>
+        <security:custom-filter ref="googleOpenIdFilter" after="BASIC_AUTH_FILTER"/>
        <security:anonymous />
    </security:http>

    <security:authentication-manager>
        <security:authentication-provider ref='geoStoreUserServiceAuthenticationProvider' />
    </security:authentication-manager>
+
+
+    <bean id="preauthenticatedAuthenticationProvider" class="it.geosolutions.geostore.services.rest.security.PreAuthenticatedAuthenticationProvider">
+    </bean>
+
+    <!-- OAuth2 beans -->
+    <context:annotation-config/>
+
+    <bean id="googleSecurityConfiguration" class="it.geosolutions.geostore.services.rest.security.oauth2.google.OAuthGoogleSecurityConfiguration"/>
+
+    <!-- Keycloak -->
+
+   <bean id="keycloakConfig" class="it.geosolutions.geostore.services.rest.security.keycloak.KeyCloakSecurityConfiguration"/>
+
+    <!-- END OAuth2 beans-->
+
+    <!--  security integration inclusions  -->
+    <import resource="classpath*:security-integration-${security.integration:default}.xml"/>

</beans>

```

- `web.xml`: add the following content to the file:

```diff
@@ -34,6 +34,17 @@
        <listener-class>org.springframework.web.context.ContextLoaderListener</listener-class>
    </listener>

+    <!-- Allow to use RequestContextHolder -->
+    <filter>
+        <filter-name>springRequestContextFilter</filter-name>
+        <filter-class>org.springframework.web.filter.RequestContextFilter</filter-class>
+    </filter>
+    <filter-mapping>
+        <filter-name>springRequestContextFilter</filter-name>
+        <url-pattern>/*</url-pattern>
+    </filter-mapping>
+
+
    <!-- Spring Security Servlet -->
    <filter>
```

- `applicationContext.xml` for consistency, we added `mapstore-ovr.properties` files to be searched in class-path and in the data-dir, as for the other properties files:

```diff
@@ -49,6 +49,7 @@
         <property name="order" value="10"/>
         <property name="locations">
             <list>
+                 <value>classpath:mapstore-ovr.properties</value>
                 <value>file:${datadir.location:}/geostore-datasource-ovr.properties</value>
                 <value>file:${datadir.location:}/mapstore-ovr.properties</value>
             </list>
```

### Upgrading the printing engine

The mapfish-print based printing engine has been upgraded to align to the latest official 2.1.5 in term of functionalities.

An update to the MapStore printing engine context file (`applicationContext-print.xml`) is needed for all projects built with the printing profile enabled. The following sections should be added to the file:

```diff
<bean id="configFactory" class="org.mapfish.print.config.ConfigFactory"></bean>
+<bean id="threadResources" class="org.mapfish.print.ThreadResources">
+    <property name="connectionTimeout" value="30000"/>
+    <property name="socketTimeout" value="30000" />
+    <property name="globalParallelFetches" value="200"/>
+    <property name="perHostParallelFetches" value="30" />
+</bean>

<bean id="pdfOutputFactory" class="org.mapfish.print.output.PdfOutputFactory"/>
+
+<bean id="metricRegistry" class="com.codahale.metrics.MetricRegistry" lazy-init="false"/>
+<bean id="healthCheckRegistry" class="com.codahale.metrics.health.HealthCheckRegistry" lazy-init="false"/>
+<bean id="loggingMetricsConfigurator" class="org.mapfish.print.metrics.LoggingMetricsConfigurator"  lazy-init="false"/>
+<bean id="jvmMetricsConfigurator" class="org.mapfish.print.metrics.JvmMetricsConfigurator" lazy-init="false"/>
+<bean id="jmlMetricsReporter" class="org.mapfish.print.metrics.JmxMetricsReporter" lazy-init="false"/>
```

Also, remember to update your project pom.xml with the updated dependency:

- locate the print-lib dependency in the pom.xml file
- replace the dependency with the following snippet

```xml
<dependency>
    <groupId>org.mapfish.print</groupId>
    <artifactId>print-lib</artifactId>
    <version>geosolutions-2.1.0</version>
    <exclusions>
        <exclusion>
            <groupId>commons-codec</groupId>
            <artifactId>commons-codec</artifactId>
        </exclusion>
        <exclusion>
            <groupId>com.fasterxml.jackson.core</groupId>
            <artifactId>jackson-annotations</artifactId>
        </exclusion>
        <exclusion>
            <groupId>com.fasterxml.jackson.core</groupId>
            <artifactId>jackson-core</artifactId>
        </exclusion>
        <exclusion>
            <groupId>com.fasterxml.jackson.core</groupId>
            <artifactId>jackson-databind</artifactId>
        </exclusion>
        <exclusion>
            <groupId>org.springframework</groupId>
            <artifactId>spring-web</artifactId>
        </exclusion>
        <exclusion>
            <groupId>org.springframework</groupId>
            <artifactId>spring-context</artifactId>
        </exclusion>
    </exclusions>
</dependency>
```

Finally, to enable printing in different formats than PDF, you should add the following to your `config.yml` file (at the top level):

```yml
formats:
  - '*'
```

### Replacing BurgerMenu with SidebarMenu

There were several changes applied to the application layout, one of them is the Sidebar Menu that comes to replace Burger menu on map viewer and in contexts.
Following actions need to be applied to make a switch:

- Update localConfig.json and add "SidebarMenu" entry to the "desktop" section:

```json
{
    "desktop": [
        ...
        "SidebarMenu",
        ...
    ]
}
```

- Remove "BurgerMenu" entry from "desktop" section.

#### Using Sidebar Menu in new contexts

Contents of your `pluginsConfig.json` need to be reviewed to allow usage of new "SidebarMenu" in new contexts.
Existing contexts need to be updated separately, please refer to the next chapter for instructions.

- Find "BurgerMenu" plugin configuration in `pluginsConfig.json` and remove `"hidden": true` line from it:

```json
    {
    "name": "BurgerMenu",
    "glyph": "menu-hamburger",
    "title": "plugins.BurgerMenu.title",
    "description": "plugins.BurgerMenu.description",
    "dependencies": [
        "OmniBar"
    ]
}
```

- Add `SidebarMenu` entry to the "plugins" array:

```json
{
    "plugins": [
        ...
        {
            "name": "SidebarMenu",
            "hidden": true
        }
        ...
    ]
}
```

- Go through all plugins definitions and replace `BurgerMenu` dependency with `SidebarMenu`, e.g.:

```json
    {
      "name": "MapExport",
      "glyph": "download",
      "title": "plugins.MapExport.title",
      "description": "plugins.MapExport.description",
      "dependencies": [
        "SidebarMenu"
      ]
    }
```

- Also the `StreetView` plugin needs to depend from `SidebarMenu`.

```json
{
      "name": "StreetView",
      "glyph": "road",
      "title": "plugins.StreetView.title",
      "description": "plugins.StreetView.description",
      "dependencies": [
        "SidebarMenu"
      ]
}
```

#### Updating existing contexts to use Sidebar Menu

Contexts created in previous versions of MapStore will maintain old Burger Menu. There are two options allowing to replace it with the new Sidebar Menu:

- Using manual update.
- Using SQL query to update all contexts at once.

Before going with one of the approaches, please make sure that changes to `pluginsConfig.json` from previous chapter are applied.

**To update context manually:**

1. Go to the context manager (#/context-manager) and edit context you want to update.
2. Move to the step 3: Configure Plugins.
3. Find "Burger Menu" on the right side (enabled plugins) and move it to the left column.
4. Save context

**Note:** "Burger Menu" has higher priority over the "Sidebar Menu", so it will always be used if it's added to the list of enabled plugins of the context.

**To update all contexts at once:**

This is a sample SQL query that can be executed against the MapStore DB to replace the Burger Menu with the new Sidebar for existing application contexts previously created:

```sql
UPDATE geostore.gs_stored_data SET stored_data = regexp_replace(gs_stored_data.stored_data,'{"name":"BurgerMenu"},','{"name":"SidebarMenu"},')
FROM geostore.gs_resource
WHERE gs_stored_data.resource_id = gs_resource.id AND
        gs_resource.category_id = (SELECT id FROM geostore.gs_category WHERE name = 'CONTEXT') AND
        gs_stored_data.stored_data ~ '.*{"name":"BurgerMenu"},.*';
```

**Note:** Schema name could vary depending on your installation configuration.

### Updating extensions

Please refer to the [extensions](../extensions/#managing-drawing-interactions-conflict-in-extension) documentation to know how to update your extensions.

### Using `terrain` layer type to define 3D map elevation profile

A new `terrain` layer type has been created in order to provide more options and versatility when defining an elevation profile for the 3D map terrain.
This `terrain` layer will substitute the former `wms` layer (with `useForElevation` attribute) used to define the elevation profile.

!!! note
    The `wms` layer (with `useForElevation` attribute) configuration is still needed to show the elevation data inside the MousePosition plugin and it will display the terrain at the same time. The `terrain` layer type allows a more versatile way of handling elevation but it will work only as terrain visualization in the 3D map viewer.

The `additionalLayers` object on the `localConfig.json` file should adhere now to the [terrain layer configuration](../maps-configuration/#terrain).
Serve the following code as an example:

```json
{
    "name": "Map",
    "cfg": {
        "additionalLayers": [{
            "type": "terrain",
            "provider": "wms",
            "url": "https://host-sample/geoserver/wms",
            "name": "workspace:layername",  // name of the geoserver resource
            "littleendian": false,
            "visibility": true
        }]
    }
}
```

!!! note
    When using `terrain` layer with `wms` provider, the format option in layer configuration is not needed anymore as Mapstore supports only `image/bil` format and is used by default

## Migration from 2022.01.00 to 2022.01.01

### MailingLists plugin has been removed

`MailingLists` plugin has ben removed from the core of MapStore. This means you can remove it from your `localConfig.json` (if present, it will be anyway ignored by the plugin system).

## Migration from 2021.02.02 to 2022.01.00

This release includes several libraries upgrade on the backend side,
in particular the following have been migrated to the latest available versions:

| Library      | Old |New|
| ----------- | ----------- |--|
| Spring| 3.0.5|5.3.9|
| Spring-security| 3.0.5        |5.3.10|
| CXF| 2.3.2        |3.4.4|
| Hibernate|      3.3.2   |5.5.0|
| JPA| 1.0        |2.1|
| hibernate-generic-dao| 0.5.1        |1.3.0-SNAPSHOT|
| h2| 1.3.168        |1.3.175|
| javax-servlet-api | 2.5        |3.1.0|

This requires also the **upgrade of Tomcat to at least version 8.5.x**.

### Updating projects configuration

Projects need the following to update to this MapStore release:

- update dependencies (in `web/pom.xml`) copying those in `MapStore2/java/web/pom.xml`, in particular (where present):

| Dependency      | Version| Notes |
| ----------- | ----------- |---|
| mapstore-services| 1.3.0 | Replaces mapstore-backend|
| geostore-webapp| 1.8.0 | |

- update packagingExcludes in `web/pom.xml` to this list:

```text
WEB-INF/lib/commons-codec-1.2.jar,
WEB-INF/lib/commons-io-1.1.jar,
WEB-INF/lib/commons-logging-1.0.4.jar,
WEB-INF/lib/commons-pool-1.3.jar,
WEB-INF/lib/slf4j-api-1.5*.jar,
WEB-INF/lib/slf4j-log4j12-1.5*.jar,
WEB-INF/lib/spring-tx-5.2.15*.jar
```

- upgrade **Tomcat to 8.5** or greater
- update your `geostore-spring-security.xml` file to add the following setting, needed to disable CSRF validation, that MapStore services do not implement yet:

```xml
<security:http ... >
    ...
    <security:csrf disabled="true"/>
    ...
</security:http>
```

- remove the spring log4j listener from `web.xml`

```xml
 <!-- spring context loader
    <listener>
		<listener-class>org.springframework.web.util.Log4jConfigListener</listener-class>
    </listener>-->
```

- If one of the libraries updated is used in your project, you should align the version with the newer one to avoid jar duplications
- Some old project may define versions of spring and/or jackson in maven properties. You can remove these definition and the dependency from main `pom.xml` since they should be inherited from spring.
In particular you may need to remove these properties :

```diff
-        <jackson.version>1.9.10</jackson.version>
-        <jackson.databind-version>2.2.3</jackson.databind-version>
-        <jackson.annotations-version>2.5.3</jackson.annotations-version>
```

### Upgrading CesiumJS

CesiumJS has been upgraded to version 1.90 (from 1.17) and included directly in the mapstore bundle as async import.

Downstream project should update following configurations:

- remove all executions related to the cesium library from the pom.xml

```diff
<execution>
    <id>html, configuration files and images</id>
    <phase>process-classes</phase>
    <goals>
        <goal>copy-resources</goal>
    </goals>
    <configuration>
        <outputDirectory>${basedir}/target/mapstore</outputDirectory>
        <encoding>UTF-8</encoding>
        <resources>
            <resource>
                <directory>${basedir}/../web/client</directory>
                <includes>
                    <include>**/*.html</include>
                    <include>**/*.json</include>
                    <include>**/img/*</include>
                    <include>product/assets/symbols/*</include>
                    <include>**/*.less</include>
                </includes>
                <excludes>
                    <exclude>node_modules/*</exclude>
                    <exclude>node_modules/**/*</exclude>
-                    <exclude>**/libs/Cesium/**/*</exclude>
                    <exclude>**/test-resources/*</exclude>
                </excludes>
            </resource>
        </resources>
    </configuration>
</execution>
-<execution>
-    <id>CesiumJS-navigation</id>
-    <phase>process-classes</phase>
-    <goals>
-        <goal>copy-resources</goal>
-    </goals>
-    <configuration>
-        <outputDirectory>${basedir}/target/mapstore/libs/cesium-navigation</outputDirectory>
-        <encoding>UTF-8</encoding>
-        <resources>
-            <resource>
-                <directory>${basedir}/../web/client/libs/cesium-navigation</directory>
-            </resource>
-        </resources>
-    </configuration>
-</execution>
```

- remove all the external script and css related to cesium and cesium-navigation now included as packages

```diff
-<script src="https://cesium.com/downloads/cesiumjs/releases/1.42/Build/Cesium/Cesium.js"></script>
-<link rel="stylesheet" href="https://cesium.com/downloads/cesiumjs/releases/1.42/Build/Cesium/Widgets/widgets.css" />
-<script src="libs/cesium-navigation/cesium-navigation.js"></script>
-<link rel="stylesheet" href="libs/cesium-navigation/cesium-navigation.css" />
```

- This step is needed only for custom project with a specific `publicPath` different from the default one. In this case you may need to specify what folder deliver the  cesium build ( by default `dist/cesium`). To do that, you can add the  `cesiumBaseUrl` parameter in the webpack dev and prod configs to the correct location of the cesium static assets, widgets and workers folder.

## Migration from 2021.02.01 to 2021.02.02

### Style parsers dynamic import

The style parser libraries introduced a dynamic import to reduce the initial bundle size. This change reflects to the `getStyleParser` function provided by the VectorStyleUtils module. If a downstream project of MapStore is using `getStyleParser` it should update it to this new version:

```diff
// example

- // old use of parser
- const parser = getStyleParser('sld');

+ // new use of parser
+ getStyleParser('sld')
+     .then((parser) => {
+         // use parser
+     });
```

## Migration from 2021.02.00 to 2021.02.01

This update contains a fix for a minor vulnerability found in `log4j` library.
For this reason you may need to update the dependencies of your project

!!! note
    This vulnerability **is not** [CVE-2021-44228](https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2021-44228)
    but only a couple of smaller ones, that involve `Log4J` ( [CVE-2021-44228](https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2021-44228) is for `Log4J2` ).
    Anyway MapStore is not prone to these vulnerabilities with the default configuration.
    For more information, see the dedicated [blog post](https://www.geosolutionsgroup.com/blog/geosolutions-lo4shell/)

here the instructions:

### Align `pom.xml` files

Here the changes in `pom.xml` and `web/pom.xml` to update:

- Change `mapstore-backend` into `mapstore-services` and set the version to `1.2.2`

```diff
<!-- MapStore backend -->
    <dependency>
    <groupId>it.geosolutions.mapstore</groupId>
-      <artifactId>mapstore-backend</artifactId>
-      <version>1.2.1</version>
+      <artifactId>mapstore-services</artifactId>
+      <version>1.2.2</version>
    </dependency>
```

- Set `geostore-webapp` version to `1.7.1`

```diff
    <dependency>
    <groupId>it.geosolutions.geostore</groupId>
    <artifactId>geostore-webapp</artifactId>
-      <version>1.7.0</version>
+      <version>1.7.1</version>
    <type>war</type>
    <scope>runtime</scope>
    </dependency>
```

- Set `http_proxy` version to `1.1.1` (should already be there)

```diff
    <dependency>
    <!-- ... -->
    <groupId>proxy</groupId>
    <artifactId>http_proxy</artifactId>
-      <version>1.1.0</version>
+      <version>1.1.1</version>
    <type>war</type>
    <scope>runtime</scope>
    </dependency>
```

- Set `print-lib` version `geosolutions-2.0` to version `geosolutions-2.0.1`

```diff
    <dependency>
        <groupId>org.mapfish.print</groupId>
        <artifactId>print-lib</artifactId>
-        <version>geosolutions-2.0</version>
+        <version>geosolutions-2.0.1</version>
    </dependency>
```

## Migration from 2021.01.04 to 2021.02.00

### Theme updates and CSS variables

The theme of MapStore has been updated to support CSS variables for some aspects of the style, in particular colors and font families.
The `web/client/themes/default/variables.less` file contains all the available variables described under the `@ms-theme-vars` ruleset.
It is suggested to :

- update the lesscss variables in the projects because the variables starting with `@ms2-` will be deprecated soon:

`@ms2-color-text` -> `@ms-main-color`
`@ms2-color-background` -> `@ms-main-bg`
`@ms2-color-shade-lighter` -> `@ms-main-border-color`

`@ms2-color-code` -> `@ms-code-color`

`@ms2-color-text-placeholder` -> `@ms-placeholder-color`

`@ms2-color-disabled` -> `@ms-disabled-bg`
`@ms2-color-text-disabled` -> `@ms-disabled-color`

`@ms2-color-text-primary` -> `@ms-primary-contrast`

`@ms2-color-primary` -> `@ms-primary`
`@ms2-color-info` -> `@ms-info`
`@ms2-color-success` -> `@ms-success`
`@ms2-color-warning` -> `@ms-warning`
`@ms2-color-danger` -> `@ms-danger`

- The font family has been update to `Noto Sans` so all the html need to be updated removing the previous font link with:

```html
<link rel="preconnect" href="https://fonts.gstatic.com">
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans&display=swap" rel="stylesheet">
```

- if you are importing `react-select` or `react-widgets` inline css/less in your own project, you have to remove the import. Now the stile of these libraries is managed at project level

### Project system

During this release MapStore we started an rewrite of the [project system](https://github.com/geosolutions-it/MapStore2/issues/6314), organized in different phases.

The first phase of this migration has been identified by [this](https://github.com/geosolutions-it/MapStore2/pull/6738) pull request. In this phase we are supporting the backward compatibility as much as possible, introducing the new project system in parallel with the new one (experimental).
In the future the current script will be deprecated in favor of the new one.

Here below the breaking changes introduced in this release to support this new system:

This section will tell you how to migrate to support the following changes:

- Minor changes to `prod-webpack.config.js`
- Move front-end configuration files in `configs` folder
- Back-end has been reorganized

#### Minor changes to `prod-webpack.config.js`

Minor changes to `prod-webpack.config.js`:

```diff
diff --git a/project/standard/templates/prod-webpack.config.js b/project/standard/templates/prod-webpack.config.js
index 175bf3398..6d97e2c0f 100644
--- a/project/standard/templates/prod-webpack.config.js
+++ b/project/standard/templates/prod-webpack.config.js
@@ -2,8 +2,8 @@ const path = require("path");

 const themeEntries = require('./MapStore2/build/themes.js').themeEntries;
 const extractThemesPlugin = require('./MapStore2/build/themes.js').extractThemesPlugin;
-const ModuleFederationPlugin = require('./MapStore2/build/moduleFederation').plugin;
 const HtmlWebpackPlugin = require('html-webpack-plugin');
+const ModuleFederationPlugin = require('./MapStore2/build/moduleFederation').plugin;

 const paths = {
     base: __dirname,
@@ -24,17 +24,19 @@ module.exports = require('./MapStore2/build/buildConfig')(
     paths,
     [extractThemesPlugin, ModuleFederationPlugin],
     true,
-    "dist/",
+    undefined,
     '.__PROJECTNAME__',
     [
         new HtmlWebpackPlugin({
             template: path.join(__dirname, 'indexTemplate.html'),
+            publicPath: 'dist/',
             chunks: ['__PROJECTNAME__'],
             inject: "body",
             hash: true
         }),
         new HtmlWebpackPlugin({
             template: path.join(__dirname, 'embeddedTemplate.html'),
+            publicPath: 'dist/',
             chunks: ['__PROJECTNAME__-embedded'],
             inject: "body",
             hash: true,
@@ -42,13 +44,15 @@ module.exports = require('./MapStore2/build/buildConfig')(
         }),
         new HtmlWebpackPlugin({
             template: path.join(__dirname, 'apiTemplate.html'),
+            publicPath: 'dist/',
             chunks: ['__PROJECTNAME__-api'],
-            inject: 'head',
+            inject: 'body',
             hash: true,
             filename: 'api.html'
         }),
         new HtmlWebpackPlugin({
             template: path.join(__dirname, 'geostory-embedded-template.html'),
+            publicPath: 'dist/',
             chunks: ['geostory-embedded'],
             inject: "body",
             hash: true,
@@ -56,6 +60,7 @@ module.exports = require('./MapStore2/build/buildConfig')(
         }),
         new HtmlWebpackPlugin({
             template: path.join(__dirname, 'dashboard-embedded-template.html'),
+            publicPath: 'dist/',
             chunks: ['dashboard-embedded'],
             inject: 'body',
             hash: true,
@@ -63,6 +68,7 @@ module.exports = require('./MapStore2/build/buildConfig')(
         })
     ],
     {
+        "@mapstore/patcher": path.resolve(__dirname, "node_modules", "@mapstore", "patcher"),
         "@mapstore": path.resolve(__dirname, "MapStore2", "web", "client"),
         "@js": path.resolve(__dirname, "js")
     }
```

#### Move front-end configuration files in `configs` folder

We suggest you to move them as well from root to configs folder, and align your `app.jsx` configuration with the new standard (if you changed the location of configs).
This will allow to use the data dir in an easy way. So:

- Move the following files in `configs` directory:
  - `localConfig.json`
  - `new.json`
  - `pluginsConfig.json`
  - `config.json`
  - `simple.json`
- If changed something in `app.jsx` about configuration, align to get the files moved in config.
- To allow MapStore to copy the correct file in the final war, you have to change `web/pom.xml` execution `copy-resources` for id `config files` this way (this only if you didn't customized `localConfig.json`):

```diff
        <goal>copy-resources</goal>
                </goals>
                    <goal>copy-resources</goal>
                </goals>
                    <configuration>
-                        <outputDirectory>${basedir}/target/__PROJECTNAME__/MapStore2/web/client</outputDirectory>
+                        <outputDirectory>${basedir}/target/__PROJECTNAME__/MapStore2/web/client/configs</outputDirectory>
                        <encoding>UTF-8</encoding>
                        <resources>
                            <resource>
-                                <directory>${basedir}/../MapStore2/web/client</directory>
+                                <directory>${basedir}/../MapStore2/web/client/configs</directory>
                                <includes>
                                    <include>localConfig.json</include>
                                </includes>
```

#### Back-end has been reorganized

In particular:

- all the java code has been moved from `web/src/` to the `java/` and `product/` directories (and `release`, already existing).
- `mapstore-backend` has been renamed into `mapstore-services`.
- Some servlets have been added in order to provide native support to data dir and make it work with the new `configs` directory.

So you will have to:

- Align the `pom.xml` to the latest versions of the libs
- Edit the `web.xml` and change the `*-servlet.xml` files to expose the new services

!!! note
    Future evolution of the project will avoid you to keep your own copies of the pom files as much as possible, reducing the boilerplate and making
    migration a lot easier. For this reasons these migration guidelines will change soon.

Here below the details of the changes.

##### Align `pom.xml` files to latest versions of the libs

Here the changes in `pom.xml` and `web/pom.xml to update:

- Change `mapstore-backend` into `mapstore-services` and set the version to `1.2.1`

```diff
<!-- MapStore backend -->
    <dependency>
    <groupId>it.geosolutions.mapstore</groupId>
-      <artifactId>mapstore-backend</artifactId>
-      <version>1.1.2</version>
+      <artifactId>mapstore-services</artifactId>
+      <version>1.2.1</version>
    </dependency>
```

- Set `geostore-webapp` version to `1.7.0`

```diff
    <dependency>
    <groupId>it.geosolutions.geostore</groupId>
    <artifactId>geostore-webapp</artifactId>
-      <version>1.6.0</version>
+      <version>1.7.0</version>
    <type>war</type>
    <scope>runtime</scope>
    </dependency>
```

- Set `http_proxy` version to `1.1.0` (should already be there)

```diff
    <dependency>
    <!-- ... -->
    <groupId>proxy</groupId>
    <artifactId>http_proxy</artifactId>
-      <version>1.1.0</version>
+      <version>1.1-SNAPSHOT</version>
    <type>war</type>
    <scope>runtime</scope>
    </dependency>
```

##### Edit the `web.xml` and change the `*-servlet.xml` files to expose the new services

- Copy from mapstore to folder `web/src/main/webapp/WEB-INF/` the files:
  - `configs-servlet.xml`
  - `extensions-servlet.xml`
  - `loadAssets-servlet.xml`
- Remove the old `dispatcher-servlet.xml` (it has been replaced by `loadAssets-servlet.xml` for backward compatibility)
- Align `web/src/main/webapp/WEB-INF/web.xml` with the new servlets as changes below (remove `dispatcher` entry in favour of the following).

```diff
@@ -1,6 +1,6 @@
 <?xml version="1.0" encoding="UTF-8"?>
 <web-app id="WebApp_ID" version="2.4"
-    xmlns="http://java.sun.com/xml/ns/j2ee" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
+    xmlns:javaee="http://java.sun.com/xml/ns/j2ee" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
     xsi:schemaLocation="http://java.sun.com/xml/ns/j2ee http://java.sun.com/xml/ns/j2ee/web-app_2_4.xsd">

     <!-- pick up all spring application contexts -->
@@ -19,13 +19,16 @@

     <context-param>
       <param-name>proxyPropPath</param-name>
-      <param-value>/proxy.properties</param-value>
+      <param-value>/proxy.properties,${datadir.location}/proxy.properties</param-value>
     </context-param>

-    <!-- spring context loader -->
-    <listener>
+    <!-- <context-param> <param-name>log4jConfigLocation</param-name> <param-value>file:${config.dir}/log4j.xml</param-value>
+        </context-param> -->
+
+    <!-- spring context loader -->
+    <listener>
         <listener-class>org.springframework.web.util.Log4jConfigListener</listener-class>
-    </listener>
+    </listener>

     <!--
       - Loads the root application context of this web app at startup.
@@ -33,8 +36,8 @@
       - WebApplicationContextUtils.getWebApplicationContext(servletContext).
     -->
     <listener>
-        <listener-class>org.springframework.web.context.ContextLoaderListener</listener-class>
-    </listener>
+        <listener-class>org.springframework.web.context.ContextLoaderListener</listener-class>
+    </listener>

     <!-- Spring Security Servlet -->
     <filter>
@@ -46,7 +49,7 @@
         <url-pattern>/rest/*</url-pattern>
     </filter-mapping>

-  <!-- GZip compression -->
+    <!-- GZip compression -->
     <filter>
         <filter-name>CompressionFilter</filter-name>
         <filter-class>net.sf.ehcache.constructs.web.filter.GzipFilter</filter-class>
@@ -65,17 +68,38 @@
     </filter-mapping>

     <!--  Backend Spring MVC controllers -->
+    <!--  Backward compatibility -->
     <servlet>
-        <servlet-name>dispatcher</servlet-name>
+        <servlet-name>loadAssets</servlet-name>
         <servlet-class>org.springframework.web.servlet.DispatcherServlet</servlet-class>
         <load-on-startup>1</load-on-startup>
     </servlet>
     <servlet-mapping>
-        <servlet-name>dispatcher</servlet-name>
+        <servlet-name>loadAssets</servlet-name>
         <url-pattern>/rest/config/*</url-pattern>
     </servlet-mapping>
+    <!--  Configs -->
+    <servlet>
+        <servlet-name>configs</servlet-name>
+        <servlet-class>org.springframework.web.servlet.DispatcherServlet</servlet-class>
+        <load-on-startup>2</load-on-startup>
+    </servlet>
+    <servlet-mapping>
+        <servlet-name>configs</servlet-name>
+        <url-pattern>/configs/*</url-pattern>
+    </servlet-mapping>
+    <!-- Extensions -->
+    <servlet>
+        <servlet-name>extensions</servlet-name>
+        <servlet-class>org.springframework.web.servlet.DispatcherServlet</servlet-class>
+        <load-on-startup>3</load-on-startup>
+    </servlet>
+    <servlet-mapping>
+        <servlet-name>extensions</servlet-name>
+        <url-pattern>/extensions/*</url-pattern>
+    </servlet-mapping>

-    <!-- CXF Servlet -->
+    <!-- CXF Servlet -->
     <servlet>
         <servlet-name>CXFServlet</servlet-name>
         <servlet-class>org.apache.cxf.transport.servlet.CXFServlet</servlet-class>
@@ -97,7 +121,7 @@
       <url-pattern>/proxy/*</url-pattern>
     </servlet-mapping>

-   <!-- Printing Servlet -->
+    <!-- Printing Servlet -->
     <servlet>
        <servlet-name>mapfish.print</servlet-name>
        <servlet-class>org.mapfish.print.servlet.MapPrinterServlet</servlet-class>
```

#### Data directory has been reorganized and is now available also for product

The new organization of the data directory is:

- `configs` will contain all json files (`localConfig.json`, `new.json`, `pluginsConfig.json`, ...) and all the `.patch` files applied to them.
- `extensions` folder contains all the data for the extensions, including `extensions.json`
- The root contains the properties files to configure database, proxy and other configs

To organize your old data directory accordingly to the new specification.

- Move all `.json` and `.json.patch` files in `configs` folder (except `extensions.json`)
- Move the directory `dist/extensions` to simply `extensions`.
- The file `extensions.json` have to be moved in `extensions/extensions.json`.
- Edit the file `extensions/extensions.json` changing the paths from `dist/extensions/<Plugin-Name>/...` to `<Plugin-Name>/...`

You can set it up by configuring `datadir.location` java system property. Changes to paths or configuration files are not required anymore.

### Configurations

- Embedded now uses popup as default. Align localConfig.json `plugins --> embedded --> Identify` with the latest one:

```json
{
    "name": "Identify",
    "cfg": {
        "showInMapPopup":true,
        "viewerOptions": {
            "container": "{context.ReactSwipe}"
        }
    }
}
```

## Migration from 2021.01.01 to 2021.01.03

Generally speaking this is not properly a breaking change, but more a fix to apply to your installations. Certificate for 'cesiumjs.org' has expired at 2021.05.05, so to continue using CesiumJS with MapStore
you will have to replace all the URLs like `https://cesiumjs.org/releases/1.17` in `https://cesium.com/downloads/cesiumjs/releases/1.17`. This is the main fix of this minor release.
See [this pull request on GitHub](https://github.com/geosolutions-it/MapStore2/pull/6856) as a sample to apply these changes to your project.

## Migration from 2021.01.00 to 2021.01.01

### Update embedded entry to load the correct configuration

Existing MapStore project could have an issue with the loading of map embedded page due to the impossibility to change some configuration such as localConfig.json or translations path in the javascript entry.
This issue can be solved following these steps:
1 - add a custom entry named `embedded.jsx` in the `js/` directory of the project with the content:

```js
import {
    setConfigProp,
    setLocalConfigurationFile
} from '@mapstore/utils/ConfigUtils';

// Add custom (overriding) translations
// example for additional translations in the project folder
// setConfigProp('translationsPath', ['./MapStore2/web/client/translations', './translations']);
setConfigProp('translationsPath', './MapStore2/web/client/translations');
// __PROJECTNAME__ is the name of the project used in the creation process
setConfigProp('themePrefix', '__PROJECTNAME__');

// Use a custom plugins configuration file
// example if localConfig.json is located in the root of the project
// setLocalConfigurationFile('localConfig.json');
setLocalConfigurationFile('MapStore2/web/client/localConfig.json');

// async load of the standard embedded bundle
import('@mapstore/product/embedded');
```

2 - update the path of the embedded entry inside the `webpack.config.js` and `prod-webpack.config.js` files with:

```js
// __PROJECTNAME__ is the name of the project used in the creation process
'__PROJECTNAME__-embedded': path.join(__dirname, "js", "embedded"),
```

### Locate plugin configuration

Configuration for Locate plugin has changed and it is not needed anymore inside the Map plugin

- old localConfig.json configuration needed 'locate' listed as tool inside the Map plugin and as a separated Locate plugin

```js
// ...
{
    "name": "Map",
    "cfg": {
        "tools": ["locate"],
        // ...
    }
},
{
    "name": "Locate",
    // ...
}
// ...
```

- new localConfig.json configuration removes 'locate' from tools array and it keeps only the plugin configuration

```js
// ...
{
    "name": "Map",
    "cfg": {
        // ...
    }
},
{
    "name": "Locate",
    // ...
}
// ...
```

### Update an existing project to include embedded Dashboards and GeoStories

Embedded Dashboards and GeoStories need a new set of javascript entries, html templates and configuration files to make them completely available in an existing project.

The steps described above assume this structure of the MapStore2 project for the files that need update:

```text
MapStore2Project/
|-- ...
|-- js/
|    |-- ...
|    |-- dashboardEmbedded.jsx (new)
|    |-- geostoryEmbedded.jsx (new)
|-- MapStore2/
|-- web/
|    |-- ...
|    |-- pom.xml
|-- ...
|-- dashboard-embedded-template.html (new)
|-- dashboard-embedded.html (new)
|-- ...
|-- geostory-embedded-template.html (new)
|-- geostory-embedded.html (new)
|-- ...
|-- prod-webpack.config.js
|-- ...
|-- webpack.config.js
```

1) create the entries files for the embedded application named `dashboardEmbedded.jsx` and `geostoryEmbedded.jsx` in the js/ folder with the following content (see links):
    - [dashboardEmbedded.jsx](https://github.com/geosolutions-it/MapStore2/blob/2021.01.xx/project/standard/templates/js/dashboardEmbedded.jsx)
    - [geostoryEmbedded.jsx](https://github.com/geosolutions-it/MapStore2/blob/2021.01.xx/project/standard/templates/js/geostoryEmbedded.jsx)

2) add the html files and templates in the root directory of the project with these names and content (see links):
    - [dashboard-embedded-template.html](https://github.com/geosolutions-it/MapStore2/blob/2021.01.xx/project/standard/templates/dashboard-embedded-template.html)
    - [dashboard-embedded.html](https://github.com/geosolutions-it/MapStore2/blob/2021.01.xx/project/standard/templates/dashboard-embedded.html)
    - [geostory-embedded-template.html](https://github.com/geosolutions-it/MapStore2/blob/2021.01.xx/project/standard/templates/geostory-embedded-template.html)
    - [geostory-embedded.html](https://github.com/geosolutions-it/MapStore2/blob/2021.01.xx/project/standard/templates/geostory-embedded.html)

3) update webpack configuration for development and production with the new entries and the related configuration:

    - webpack.config.js

    ```js
    module.exports = require('./MapStore2/build/buildConfig')(
        {
            // other entries...,
            // add new embedded entries to entry object
            "geostory-embedded": path.join(__dirname, "js", "geostoryEmbedded"),
            "dashboard-embedded": path.join(__dirname, "js", "dashboardEmbedded")
        },
        // ...
    );
    ```

    - prod-webpack.config.js

    ```js

    module.exports = require('./MapStore2/build/buildConfig')(
        {
            // other entries...,
            // add new embedded entries to entry object
            "geostory-embedded": path.join(__dirname, "js", "geostoryEmbedded"),
            "dashboard-embedded": path.join(__dirname, "js", "dashboardEmbedded")
        },
        // ...
        [
            // new HtmlWebpackPlugin({ ... }),
            // add plugin to copy all the embedded html and inject the correct bundle
            new HtmlWebpackPlugin({
                template: path.join(__dirname, 'geostory-embedded-template.html'),
                chunks: ['geostory-embedded'],
                inject: "body",
                hash: true,
                filename: 'geostory-embedded.html'
            }),
            new HtmlWebpackPlugin({
                template: path.join(__dirname, 'dashboard-embedded-template.html'),
                chunks: ['dashboard-embedded'],
                inject: 'body',
                hash: true,
                filename: 'dashboard-embedded.html'
            })
        ],
        // ...
    );
    ```

4) Add configuration to localConfig.json in the plugins section related to Share functionalities (Only with custom localConfig.json in the project):
    - Dashboard share configuration

    ```js
    "dashboard": [
        // ...
        {
            "name": "Share",
            "cfg": {
                "showAPI": false,
                "advancedSettings": false,
                "shareUrlRegex": "(h[^#]*)#\\/dashboard\\/([A-Za-z0-9]*)",
                "shareUrlReplaceString": "$1dashboard-embedded.html#/$2",
                "embedOptions": {
                    "showTOCToggle": false,
                    "showConnectionsParamToggle": true
                }
            }
        },
        // ...
    ]
    ```

    - Dashboard share configuration

    ```js
    "geostory": [
        // ...
        {
            "name": "Share",
            "cfg": {
                "embedPanel": true,
                "showAPI": false,
                "advancedSettings": {
                    "hideInTab": "embed",
                    "homeButton": true,
                    "sectionId": true
                },
                "shareUrlRegex": "(h[^#]*)#\\/geostory\\/([^\\/]*)\\/([A-Za-z0-9]*)",
                "shareUrlReplaceString": "$1geostory-embedded.html#/$3",
                "embedOptions": {
                    "showTOCToggle": false
                }
            }
        },
        // ...
    ]
    ```

5) update the web/pom.xml to copy all the related resources in the final *.war file with these new executions

```xml
<!-- __PROJECTNAME__ should be equal to the one in use in the project, see other executions how they define the outputDirectory path  -->
<execution>
    <id>only dashboard-embedded.html</id>
    <phase>process-classes</phase>
    <goals>
        <goal>copy-resources</goal>
    </goals>
    <configuration>
        <outputDirectory>${basedir}/target/__PROJECTNAME__</outputDirectory>
        <encoding>UTF-8</encoding>
        <resources>
            <resource>
                <directory>${basedir}/../dist</directory>
                <includes>
                    <include>dashboard-embedded.html</include>
                </includes>
                <excludes>
                    <exclude>MapStore2/*</exclude>
                    <exclude>MapStore2/**/*</exclude>
                </excludes>
            </resource>
        </resources>
    </configuration>
</execution>
<execution>
    <id>only geostory-embedded.html</id>
    <phase>process-classes</phase>
    <goals>
        <goal>copy-resources</goal>
    </goals>
    <configuration>
        <outputDirectory>${basedir}/target/__PROJECTNAME__</outputDirectory>
        <encoding>UTF-8</encoding>
        <resources>
            <resource>
                <directory>${basedir}/../dist</directory>
                <includes>
                    <include>geostory-embedded.html</include>
                </includes>
                <excludes>
                    <exclude>MapStore2/*</exclude>
                    <exclude>MapStore2/**/*</exclude>
                </excludes>
            </resource>
        </resources>
    </configuration>
</execution>
```

## Migration from 2020.02.00 to 2021.01.00

### Update to webpack 5 - Module federation

MapStore migrated to webpack 5 and provided the extension system using "Webpack Module Federation". Here the steps to update the existing files in your project.

**package.json**:

- dev server scripts changed syntax. now you need to use `webpack serve` instead of `webpack-dev-server`. Replace also all `--colors` with `--color` in your scripts that use webpack / webpack-dev-server.
- Align `dependencies` and `devDependencies` with MapStore's one, reading the `package.json`, as usual.
- To support extensions in your project, you need to add `ModuleFederationPlugin` to your `prod-webpack.config.js` and `webpack.config.js`

```javascript
const ModuleFederationPlugin = require('./MapStore/build/moduleFederation').plugin; // <-- new line
module.exports = require('./buildConfig')(
    assign({
        "mapstore2": path.join(paths.code, "product", "app"),
        "embedded": path.join(paths.code, "product", "embedded"),
        "ms2-api": path.join(paths.code, "product", "api")
    },
    require('./examples')
    ),
    themeEntries,
    paths,
    extractThemesPlugin,
    [extractThemesPlugin, ModuleFederationPlugin], // <-- this parameter has been changed, now it accepts also array of the plugins you want to add bot in prod and dev
```

Other the other changes required are applied automatically in `buildConfig.js`.

### Eslint config

Now eslint configuration is shared in a separate npm module. To update your custom project you have to remove the following files:

- `.eslintignore`
- `.eslintconfig`

And add to `package.json` the following entry, in the root:

```json
        "eslintConfig": {
            "extends": [
                "@mapstore/eslint-config-mapstore"
            ],
            "parserOptions": {
                "babelOptions": {
                    "configFile": "./MapStore2/build/babel.config.js"
                }
            }
        },
```

If you have aproject that includes MapStore as a dependency, you can run `npm run updateDevDeps` to finalize the update. Otherwise make you sure to include:

- devDependencies:
  - add `"@mapstore/eslint-config-mapstore": "1.0.1",`
  - delete `babel-eslint`
- dependencies:
  - update `"eslint": "7.8.1"

### App structure review

From this version some base components of MapStore App (`StandardApp`, `StandardStore`...) has been restructured and better organized. Here a list of the breaking change you can find in a depending project

- `web/client/product/main.jsx` has been updated to new `import` and `export` syntax (removed `require` and `exports.module`). So if you are importing it (usually in your `app.jsx`) you have to use the `import` syntax or use `require(...).default` in your project. The same for the other files.
- New structure of arguments in web/client/stores/StandardStore.js

```js
const appStore = (
    {
        initialState = {
            defaultState: {},
            mobile: {}
        },
        appReducers = {},
        appEpics = {},
        rootReducerFunc = ({ state, action, allReducers }) => allReducers(state, action)
    },
    plugins = {},
    storeOpts = {}
) {
  ...
```

- Moved standard epics, standard reducers and standard rootReducer function from web/client/stores/StandardStore.js to a separated file web/client/stores/defaultOptions.js

- loading extensions functionalities inside StandardApp has been moved to an specific withExtensions HOC, so if you are not using `main.js` but directly `StandardApp` and you need extensions you need to add this HOC to your StandardApp

## Migration from 2020.01.00 to 2020.02.00

### New authentication rule for internal services

With this new version the support for uploading extensions has been introduced. A new entry point needs administration authorization to allow the upload of new plugins by the administrator. So:

- In `localConfig.json` add the following entry in the `authenticationRules` array:

```json
{
    "urlPattern": ".*rest/config.*",
    "method": "bearer"
  }

```

the final entry should look like this

```json
 "authenticationRules": [{
        "urlPattern": ".*geostore.*",
        "method": "bearer"
      }, {
        "urlPattern": ".*rest/config.*",
        "method": "bearer"
      }, ...],
```

### Translation files

- The translations file extension has been changed into JSON. Now translation files has been renamed from `data.<locale>` to `data.<locale>.json`. This change makes the `.json` extension mandatory for all translation files. This means that depending projects with custom translation files should be renabled in the same name. E.g. `data.it-IT` have to be renamed as `data.it-IT.json`

### Database Update

Database schema has changed. To update your database you need to apply this SQL scripts to your database

- Update the user schema
run the script available [here](https://github.com/geosolutions-it/geostore/tree/master/doc/sql/migration/postgresql):

```sql

-- Update the geostore database from 1.4.2 model to 1.5.0
-- It adds fields to gs_security for external authorization

-- The script assumes that the tables are located into the schema called "geostore"
--      if you put geostore in a different schema, please edit the following search_path.
SET search_path TO geostore, public;

-- Tested only with postgres9.1

-- Run the script with an unprivileged application user allowed to work on schema geostore

alter table gs_security add column username varchar(255);
alter table gs_security add column groupname varchar(255);

create index idx_security_username on gs_security (username);

create index idx_security_groupname on gs_security (groupname);

```

- Add new categories

```sql
-- New CONTEXT category
INSERT into geostore.gs_category (id ,name) values ( nextval('geostore.hibernate_sequence'),  'CONTEXT') ON CONFLICT DO NOTHING;
-- New GEOSTORY category (introduced in 2020.01.00)
INSERT into geostore.gs_category (id ,name) values (nextval('geostore.hibernate_sequence'),  'GEOSTORY') ON CONFLICT DO NOTHING;
-- New TEMPLATE category
INSERT into geostore.gs_category (id ,name) values ( nextval('geostore.hibernate_sequence'),  'TEMPLATE') ON CONFLICT DO NOTHING;
-- New USERSESSION category
INSERT into geostore.gs_category (id ,name) values ( nextval('geostore.hibernate_sequence'),  'USERSESSION') ON CONFLICT DO NOTHING;

```

### Backend update

For more details see [this](https://github.com/geosolutions-it/MapStore2/commit/4aa7b917abcb09571af5b9999a38e96f52eac4f3#diff-ac81cff563b78256ef26eca8a5103392592c7138987392a6fb3d79167d11bdcfR66) commit

new files have been added:

- `web/src/main/webapp/WEB-INF/dispatcher-servlet.xml`
- `web/src/main/resources/mapstore.properties`

some files has been changed:

- `web/src/main/webapp/WEB-INF/web.xml`
- `pom.xml`
- `web/pom.xml`

## Migration from 2019.02.01 to 2020.01.00

With MapStore **2020.01.00** some dependencies that were previously hosted on github, have now been published on the npm registry, and package.json has been updated accordingly.
[Here](https://github.com/geosolutions-it/MapStore2/pull/4598) is the PR that documents how to update local package.json and local webpack if not using the mapstore buildConfig/testConfig common files.

After updating package.json run **npm install**
Now you should be able to run locally with **npm start**

For more info see the related [issue](https://github.com/geosolutions-it/MapStore2/issues/4569)

Moreover a new category has been added for future features, called GEOSTORY.

It is not necessary for this release, but, to follow the update sequence, you can add it by executing the following line.

```sql
INSERT into geostore.gs_category (id ,name) values (nextval('geostore.hibernate_sequence'),  'GEOSTORY') ON CONFLICT DO NOTHING;
```

## Migration from 2019.01.00 to 2019.01.01

MapStore **2019.01.01** changes the location of some of the build and test configuration files.
This also affects projects using MapStore build files, sp if you update MapStore subproject to the **2019.01.01** version you also have to update some of the project configuration files. In particular:

- **webpack.config.js** and **prod-webpack.config.js**:
  - update path to themes.js from ./MapStore2/themes.js to ./MapStore2/build/themes.js
  - update path to buildConfig from ./MapStore2/buildConfig to ./MapStore2/build/buildConfig
- **karma.conf.continuous-test.js** and **karma.config.single-run.js**: update path to testConfig from ./MapStore2/testConfig to ./MapStore2/build/testConfig

## Migration from 2017.05.00 to 2018.01.00

MapStore **2018.01.00** introduced theme and js and css versioning.
This allows to auto-invalidates cache files for each version of your software.
For custom projects you could choose to ignore this changes by setting version: "no-version" in your app.jsx `StandardRouter` selector:

```javascript
//...
const routerSelector = createSelector(state => state.locale, (locale) => ({
    locale: locale || {},
    version: "no-version",
    themeCfg: {
        theme: "mythheme"
    },
    pages
}));
const StandardRouter = connect(routerSelector)(require('../MapStore2/web/client/components/app/StandardRouter'));
//...

```

### Support js/theme versioning in your project

Take a look to [this pull request](https://github.com/geosolutions-it/MapStore2/pull/2538/files) as reference.
Basically versioning is implemented in 2 different ways for css and js files :

- Add at build time the js files inclusion to the files, with proper hashes.
- Load theme css files appending to the URL the ?{version} where version is the current mapstore2 version
The different kind of loading for css files is needed to continue supporting the theme switching capabilities.
For the future we would like to unify these 2 systems. See [this issue](https://github.com/geosolutions-it/MapStore2/issues/2554).

You have to:

- Add the version file to the root (`version.txt`).
- Create a template for each html file you have. These files will replace the html files when you build the final  war file. These files are like the original ones but without the `[bundle].js` file inclusion and without theme css.
- Add `HtmlWebpackPlugin` for production only, one for each js file. This plugin will add to the template file the script inclusion ([example](https://github.com/geosolutions-it/MapStore2/pull/2538/files#diff-9d452e0b96db9be8d604c4c9dde575b4)).
  - if you have to include the script in the head (e.g. `api.html` has some script that need the js to be loaded before executing the inline scripts), use the option `inject: 'head'`
- change each entry point (`app.jsx`, `api.jsx`, `embedded.jsx`, `yourcoustomentrypoint.jsx`) this way ([example](https://github.com/geosolutions-it/MapStore2/pull/2538/files#diff-3bea50c2662e64129704ae694b587042)):
  - `version` reducer in `StandardRouter`
  - `loadVersion` action in `initialActions`
  - `version` and `loadAfterTheme` selectors to `StandardRouter` state.

```javascript
// Example
const {versionSelector} = require('../MapStore2/web/client/selectors/version');
const {loadVersion} = require('../MapStore2/web/client/actions/version');
const version = require('../MapStore2/web/client/actions/version');
//...
StandardRouter = connect ( state => ({
    locale: state.locale || {},
        pages,
        version : versionSelector(state),
        loadAfterTheme: loadAfterThemeSelector(state)
    }))(require('../MapStore2/web/client/components/app/StandardRouter'))
const appStore = require('../MapStore2/web/client/stores/StandardStore').bind(null, initialState, {
    // ...
    version: version
});
// ...
const appConfig = {
    // ...
    initialActions: [loadVersion]
}
```

- Add to your `pom.xml` some execution steps to replace html files with the ones generated in 'dist' directory. ([example](https://github.com/geosolutions-it/MapStore2/pull/2538/files#diff-eef89535a29b4a95a42d9de83cb53681)). And copy `version.txt`
- Override the version file in your build process (e.g. you can use the commit hash)

## Migration from 2017.05.00 to 2017.03.00 and previews

In **2017.03.00** the `createProject.js` script created only a custom project. From version 2017.04.00 we changed the script to generate 2 kind of projects:

- **custom**: the previous version
- **standard**: mapstore standard

Standard project wants to help to generate a project that is basically the MapStore product, where you can add your own plugins and customize your theme (before this you had to create a project similar to MapStore on your own)
Depending on our usage of custom project, this may introduce some breaking changes.
If you previously included some file from `product` folder, now `app.jsx` has been changed to call `main.jsx`. Please take a look on how the main product uses this to migrate your changes inside your custom project.

## Migration from 2017.01.00 to 2017.02.00

The version 2017.02.00 has many improvements and changes:

- introduced `redux-observable`
- updated `webpack` to version 2
- updated `react-intl` to version 2.x
- updated `react` to [version 15.4.2] (<https://facebook.github.io/react/blog/2016/04/07/react-v15.html>)
- updated `react-bootstrap` to version 0.30.7

We suggest you to:

- align your package.json with the latest version of 2017.02.00.
- update your webpack files (see below).
- update your tests to react 15 version. [see upgrade guide](https://facebook.github.io/react/blog/2016/04/07/react-v15.html#upgrade-guide)
- Update your `react-bootstrap` custom components with the new one (see below).

### Side Effect Management - Introduced redux-observable

To manage complex asynchronous operations the thunk middleware is not enough.
When we started with MapStore there was no alternative to thunk. Now we have some options. After a spike (results available [here](https://github.com/geosolutions-it/MapStore2/issues/1420)) we chose to use redux-observable.
For the future, we strongly recommend to use this library to perform asynchronous tasks.

Introducing this library will allow to :

- remove business logic from the components event handlers
- now all new  `actionCreators` should return pure actions. All async stuff will be deferred to the epics.
- avoid bouncing between components and state to trigger side effect
- speed up development with `rxjs` functionalities
- Existing thunk integration will be maintained since all the thunks will be replaced.

If you are using the Plugin system and the StandardStore, you may have only to include the missing new dependencies in your package.json (redux-observable and an updated version of redux).

Check the current package.json to get he most recent versions. For testing we included also redux-mockup-store as a dependency, but you are free to test your epics as you want.

For more complex integrations check [this](https://github.com/geosolutions-it/MapStore2/pull/1471) pull request to see how to integrate redux-observable or follow the guide on the [redux-observable site](https://redux-observable.js.org/).

### Webpack update to version 2

We updated webpack (old one is deprecated), check [this pull request](https://github.com/geosolutions-it/MapStore2/pull/1491) to find out how to update your webpack files.
here a list of what we had to update:

- module.loaders are now module.rules
- update your package.json with latest versions of webpack, webpack plugins and karma libs and integrations (Take a look to the changes on package.json in the pull request if you want a detailed list of what to update in this case).
- change your test proxy configuration with the new one.

More details on the [webpack site](https://webpack.js.org/migrate/).

### react-intl update to  2.x

See [this pull request](https://github.com/geosolutions-it/MapStore2/pull/1495/files) for the details. You should only have to update your package.json

### react update to 15.4.2

Check this pull request to see how to:

- update your package.json
- update your tests

### React Bootstrap update

The version we are using is not documented anymore, and not too much compatible with react 15 (too many warnings). So this update can not be postponed anymore.
The bigger change in this case is that the Input component do not exists anymore. You will have to replace all your Input with the proper components, and update the `package.json`. See [this pull request](https://github.com/geosolutions-it/MapStore2/pull/1511) for details.
