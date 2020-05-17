# Working with Extensions

The MapStore2 [plugins architecture](../plugins-architecture) allows building your own independent modules that will integrate seamlessly into your project.

Extensions are plugins that can be distributed as a separate package (a zip file), and be installed, activated and used at runtime.
Creating an extension is similar to creating a plugin. If you are not familiar with plugins, please, read the [Plugins HowTo page](../plugins-howto) first.

## Introduction

During this tutorial, you will learn how to create and build a plugin as an extension for MapStore.

## An extension example

A MapStore extension is a plugin, with some additional features.

### build/extensions/plugins/Extension.jsx

```javascript
import {connect} from "react-redux";
import Extension from "../components/Extension";
import Rx from "rxjs";

export default {
    name: "Extension",
    component: connect(state => ({
        value: state.extension && state.extension.value
    }), {onIncrease: () => {
        return {
            type: 'INCREASE_COUNTER'
        };
    }})(Extension),
    reducers: {
        extension: (state = {value: 1}, action) => {
            if (action.type === 'INCREASE_COUNTER') {
                return {value: state.value + 1};
            }
            return state;
        }
    },
    epics: {
        logCounterValue: (action$, store) => action$.ofType('INCREASE_COUNTER').switchMap(() => {
            /* eslint-disable */
            console.log('CURRENT VALUE: ' + store.getState().extension.value);
            /* eslint-enable */
            return Rx.Observable.empty();
        })
    },
    containers: {
        Toolbar: {
            name: "extension",
            position: 10,
            tooltip: "",
            help: "",
            tool: true,
            priority: 1
        }
    }
};
```

As you can see from the code, the most important difference is that you need to export the plugin descriptor **WITHOUT** invoking *createPlugin* on it.
The extension definition will import or define all the needed dependencies (components, reducers, epics) as well as the plugin configuration elements
(e.g. containers).

Let's see also the component code, so that we have a working example:

### build/extensions/components/Extension.jsx

```javascript
import React from "react";
import Message from "../../../web/client/components/I18N/Message";

const Extension = ({ value = 0, onIncrease }) => {
    return <div style={{ top: "600px", zIndex: 1000 }}><span><Message msgId="extension.message"/>{value}</span><button onClick={onIncrease}>+</button></div>;
};

export default Extension;
```

### Testing your extension

The extension source code has to be stored *INSIDE* the MapStore source code tree. We suggest to modify the sample app in the build/extensions folder.
Edit the plugins/Extension.jsx file to create your own extension (and add any additional files you may need).

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

You will find the built javascript in build/extensions/dist/extension.js

### Distributing your extension as an uploadable module

To distribute your extension so that it can be uploaded to a running MapStore instance and included in a context, you have to create a zip file with the following content:

* the js bundle built above, renamed to a convenient file name (e.g. my-wornderful-extension.js)
* an index.json file that describes the extension, an example follows
* optionally, a translations folder with localized message files used by the extension (in one or more languages of your choice)

You will find both the index.json file and a sample translation folder in build/extensions/bundle.

#### index.json example

```javascript
{
    "plugins": [
        {
            "name": "Extension",
            "dependencies": [
                "Toolbar"
            ]
        }
    ]
}
```

### Extensions uploading service

Extensions can be uploaded using the context creator UI of MapStore. The storage and configuration of the uploaded zip bundle as
a proper extension is managed by a dedicated MapStore backend service, the ***Upload Service***.
The Upload Service is responsible of unzipping the bundle, storing javascript and the other extension assets in the extensions folder and updating the configuration files needed by MapStore to use the extension:

* extensions.json (the extensions registry)
* pluginsConfig.json (the context creator plugins catalog)

### Extensions and datadir

Extensions work better if you use a [datadir](externalized-configuration.md), because when a datadir is configured,
extensions are uploaded there, can ***live*** outside of the application main folder (so you don't risk to overwrite them when
you upgrade MapStore to a newer version).

To enable extensions to work with the datadir the following is needed:

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

Assets are loaded using a different service, /rest/config/loadasset.

#### Upload Service and datadir

When a datadir is configured, the **Upload Service** will use it properly, to store uploaded extensions there.

It will also use the datadir to store, after any upload:

* the updated extensions registry (**extensions.json**) file
* a patch of the context creator plugins catalog (**pluginsConfig.json.patch**)
