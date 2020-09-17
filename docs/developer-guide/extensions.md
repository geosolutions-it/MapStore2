# Working with Extensions

The MapStore2 [plugins architecture](../plugins-architecture) allows building your own independent modules that will integrate seamlessly into your project.

Extensions are plugins that can be distributed as a separate package (a zip file), and be installed, activated and used at runtime.
Creating an extension is similar to creating a plugin. If you are not familiar with plugins, please, read the [Plugins HowTo page](../plugins-howto) first.

## Introduction

During this tutorial, you will learn how to create and build a plugin as an extension for MapStore.

## An extension example

A MapStore extension is a plugin, with some additional features.

`build/extensions/plugins/SampleExtension.jsx`

```javascript
import {connect} from "react-redux";

import Extension from "../components/Extension";
import Rx from "rxjs";
import { changeZoomLevel } from "../../../web/client/actions/map";

export default {
    name: "SampleExtension",
    component: connect(state => ({
        value: state.sampleExtension && state.sampleExtension.value
    }), {
        onIncrease: () => {
            return {
                type: 'INCREASE_COUNTER'
            };
        }, changeZoomLevel
    })(Extension),
    reducers: {
        sampleExtension: (state = { value: 1 }, action) => {
            if (action.type === 'INCREASE_COUNTER') {
                return { value: state.value + 1 };
            }
            return state;
        }
    },
    epics: {
        logCounterValue: (action$, store) => action$.ofType('INCREASE_COUNTER').switchMap(() => {
            /* eslint-disable */
            console.log('CURRENT VALUE: ' + store.getState().sampleExtension.value);
            /* eslint-enable */
            return Rx.Observable.empty();
        })
    },
    containers: {
        Toolbar: {
            name: "SampleExtension",
            position: 10,
            text: "INC",
            doNotHide: true,
            action: () => {
                return {
                    type: 'INCREASE_COUNTER'
                };
            },
            priority: 1
        }
    }
};

```

As you can see from the code, the most important difference is that you need to export the plugin descriptor **WITHOUT** invoking `createPlugin` on it (this is done in `extensions.js` in dev environment and when installed it will be done by the extensions load system).
The extension definition will import or define all the needed dependencies (components, reducers, epics) as well as the plugin configuration elements
(e.g. containers).

### Testing your extension

The extension source code has to be stored *INSIDE* the MapStore source code tree. We suggest to modify the sample app in the `build/extensions` folder.
Edit the `plugins/SampleExtension.jsx` file to create your own extension (and add any additional files you may need).

To run the sample app (with your extension) in developer mode, use the following command:

```javascript
npm run run-extension
```

This works exactly as npm start, but will give you a simple map viewer with your extension included.

### Building the compiled extension bundle

To build an extension a specific npm run task can be used:

```javascript
npm run build-extension
```

You will find the built javascript in `build/extensions/dist/extension.js`

### Distributing your extension as an uploadable module

To distribute your extension so that it can be uploaded to a running MapStore instance and included in a context, you have to create a zip file with the following content:

* the js bundle built above, renamed to a convenient file name (e.g. `my-wonderful-extension.js`)
* an `index.json` file that describes the extension, an example follows
* optionally, a translations folder with localized message files used by the extension (in one or more languages of your choice)

...note: You will find both the `index.json` file and a sample translation folder in `build/extensions/bundle`.

```text
my-extension.zip
|── index.js
├── index.json
└── translations
    └── data.en_EN.json
```

#### index.json

The `index.json file should contain all the information about the extension:

* An `id` that identifies the extension
* A `version` to show in UI. Semantic versioning is suggested.
* `title` and `description` to display in UI, mnemonic hints for the administrator
* `plugins` the list of plugins that it adds to the application, with all the data useful for the context manager. Format of the JSON object for plugins is suggested [here](https://github.com/georchestra/mapstore2-georchestra/issues/15#issuecomment-564974270)

```json
{
    "id": "a_unique_extension_identifier",
    "version": "1.0.0",
    "title": "the title of the description",
    "description": "a description of the extension",
    "plugins": [{
         "name": "MYPlugin",
         "title": "extensions.a_unique_extension_identifier.title",
         "description": "",
         "defaultConfig": {},
         "...": "..."
    }]
}
```

`plugins` section contains the plugins defined in the extension, and it is needed to be configured in the context-editor. See [Context Editor Configuration](context-editor-config.md)

### Installing Extensions

Extensions can be uploaded using the context creator UI of MapStore. The storage and configuration of the uploaded zip bundle is managed by a dedicated MapStore backend service, the ***Upload Service***.
The Upload Service is responsible of unzipping the bundle, storing javascript and the other extension assets in the extensions folder and updating the configuration files needed by MapStore to use the extension:

* `extensions.json` (the extensions registry)
* `pluginsConfig.json.patch` (the context creator plugins catalog patch file)

### Extensions and datadir

Extensions work better if you use a [datadir](externalized-configuration.md), because when a datadir is configured,
extensions are uploaded inside it so they can ***live*** outside of the application main folder (and you don't risk to overwrite them when
you upgrade MapStore to a newer version).

### Extensions for dependent projects

Extensions build in MapStore actually can run only in MapStore product. They can not be installed in dependent projects. If you have a custom project and you want to add support for extensions, you will have to create your build system for extensions dedicated to your application, to build the Javascript with the correct paths.
Moreover, to enable extensions to work with the datadir in a dependent project (MapStore product is already configured to use it) you need to configure (or customize) the following configuration properties in your `app.jsx`:

#### Externalize the extensions configuration

Change `app.jsx` to include the following statement:

```javascript
ConfigUtils.setConfigProp("extensionsRegistry", "rest/config/load/extensions.json");
```

#### Externalize the context plugins configuration

Change `app.jsx` to include the following statement:

```javascript
ConfigUtils.setConfigProp("contextPluginsConfiguration", "rest/config/load/pluginsConfig.json");
```

#### Externalize the extensions assets folder

Change `app.jsx` to include the following statement:

```javascript
ConfigUtils.setConfigProp("extensionsFolder", "rest/config/loadasset?resource=");
```

Assets are loaded using a different service, `/rest/config/loadasset`.
