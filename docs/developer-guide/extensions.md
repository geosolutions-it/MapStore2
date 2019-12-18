# Working with Extensions
The MapStore2 [plugins architecture](../plugins-architecture) allows building your own independent modules that will integrate seamlessly into your project.

Extensions are plugins that can be distributed as a separate package (a zip file), and be installed, activated and used at runtime.
Creating an extension is similar to creating a plugin. If you are not familiar with plugins, please, read the [Plugins HowTo page](../plugins-howto) first.

## Introduction
During this tutorial, you will learn how to create and build a plugin as an extension for MapStore.

## An extension example

A MapStore extension is a plugin, with some additional features.

### web/client/extensions/Extension.jsx
```javascript
import {connect} from "react-redux";
import Extension from "../components/Extension";
import Rx from "rxjs";

export default {
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
        ...
    }
};
```
As you can see from the code, the most important difference is that you need to export the plugin descriptor **WITHOUT** invoking *createPlugin* on it.
The extension definition will import or define all the needed dependencies (components, reducers, epics) as well as the plugin configuration elements
(e.g. containers).

Let's see also the component code, so that we have a working example:

### web/client/components/Extension.jsx
```javascript
import React from "react";

const Extension = ({ value = 0, onIncrease }) => {
    return <div style={{ position: "absolute" }}><span>{value}</span><button onClick={onIncrease}>+</button></div>;
};

export default Extension;
```

### Building the compiled extension bundle
The extension source code has to be stored *INSIDE* the MapStore source code tree. We suggest to use the web/client/extensions folder.
This is needed so that all the imported dependencies paths are correct.

To build an extension a specific npm run task can be used:

```javascript
name=myextension version=abc source=extension_source_path npm run build-extension
```

The parameters that are needed are:
 - name: the final name prefix of the built bundle
 - version: will be appended to the name to have a final <name>.<version>.chunk.js filename
 - source: relative path to the extension jsx file (from the MapStore root folder)

The output js bundle will be written in web/client/dist.
