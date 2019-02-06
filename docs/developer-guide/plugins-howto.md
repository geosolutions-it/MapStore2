# Creating a MapStore2 plugin
The MapStore2 [plugins architecture](plugins-architecture) allows building your own idenpendent modules that will integrate seamlessly into your project.

Creating a plugin is like assembling and connecting several pieces together into an atomic module. This happens by writing a plugin module, a ReactJS JSX file exporting the plugin descriptor.

## A plugin example

A plugin is a ReactJS *component with a name*. The chosen name is always suffixed with **Plugin**.

### Sample.jsx
```javascript

const SampleComponent = () => {
    const style = {position: "absolute", top: "100px", left: "100px", zIndex: 10000000};
    return <div style={style}>Sample</div>;
}

module.exports = {
    SamplePlugin: SampleComponent
    // the Plugin postfix is mandatory, avoid bugs by calling all your descriptors
    // <Something>Plugin
};
```
Being a component with a name (**Sample** in our case) you can include it in your project editing its *plugins.js* file:

### plugins.js
```javascript
module.exports = {
    plugins: {
        ...
        SamplePlugin: require('../plugins/Sample'),
        ...
    }
};
```

Then you have to configure it properly so that is enabled in one or more [application modes](application-modes) / [pages](application-pages):

### localConfig.json
```javascript
{
    ...
    "plugins": {
        "desktop": ["Sample", ...],
        ...
    }
}
```

Note: to enable a plugin both requiring it in the plugins.js file and configuring it in localConfig.json is required. If one is missing, the plugin won't appear. 
To globally remove a plugin from your project the preferred way is removing it from plugins.js, because this will reduce the global javascript size of your application.

You can also specify plugins properties in the configuration, using the **cfg** property:

### localConfig.json (2)
```javascript
{
    ...
    "plugins": {
        "desktop": [{
            "name": "Sample",
            "cfg": {
                "myproperty": "myvalue"
            }
        }, ...],
        ...
    }
}
```

Plugin properties 

## A store connected plugin example
A plugin component is a **smart component** (connected to the Redux store) so that properties can be taken from the global state, as needed.

### ConnectedSample.jsx (1)
```javascript
const {connect} = require('react-redux');

const SampleComponent = ({zoom) => {
    const style = {position: "absolute", top: "100px", left: "100px", zIndex: 1000000};
    return <div style={style}>Zoom: {zoom}</div>;
}

const ConnectedSample = connect((state) => {
    return {
        zoom: get(state, 'map.present.zoom') // connected property
    };
})

module.exports = {
    ConnectedSamplePlugin: SampleComponent
};
```

A plugin can use actions to update the global state.

### ConnectedSample.jsx (2)
```javascript

const {connect} = require('react-redux');
const {changeZoomLevel} = require('../actions/map');
const {get} = require('lodash');

const SampleComponent = ({zoom, onZoom) => {
    const style = {position: "absolute", top: "100px", left: "100px", zIndex: 1000000};
    return <div style={style}>Zoom: {zoom} <button onClick={() => onZoom(zoom + 1))}>+</button></div>;
}

const ConnectedSample = connect((state) => {
    return {
        zoom: get(state, 'map.present.zoom')
    };
}, {
    onZoom: changeZoomLevel // connected action
})

module.exports = {
    ConnectedSamplePlugin: SampleComponent
};
```

A plugin can define its own state fragments and the related reducers.
Obviously you will also be able to define your own actions.

### actions/sample.js
```javascript
// custom action
const UPDATE_SOMETHING = 'SAMPLE:UPDATE_SOMETHING';
const updateSomething = (payload) => {
    return {
        type: UPDATE_SOMETHING,
        payload
    };
};
module.exports = {
    UPDATE_SOMETHING,
    updateSomething
};
```

### reducers/sample.js
```javascript
const {UPDATE_SOMETHING} = require('../actions/sample');
module.exports = function (action, state) {
        switch (action.type) {
            case UPDATE_SOMETHING:
                return {
                    text: action.payload
                }
                break;
            default:
                return state;
        }
    }
};
```

### ConnectedSample.jsx (3)
```javascript
const {connect} = require('react-redux');
// custom action
const {updateSomething} = require('../actions/sample');
// custom reducer and state fragment
const sample = require('../reducers/sample');

const {get} = require('lodash');

const SampleComponent = ({text, onUpdate}) => {
    const style = {position: "absolute", top: "100px", left: "100px", zIndex: 1000000};
    return <div style={style}>Text: {text} <button onClick={() => onUpdate('Updated Text'))}>Initial Text</button></div>;
};

const ConnectedSample = connect((state) => {
    return {
        text: get(state, 'sample.text')
    };
}, {
    onUpdate: updateSomething
});

module.exports = {
    ConnectedSamplePlugin: ConnectedSample,
    reducers: {
        sample
    }
};
```
## Data fetching and side effects
Side effects should be limited as much as possible, but there are cases where a side effect cannot be avoided.
In particular all asynchronous operations are side effects in Redux, but we obviously need to handle them, in particular we need to asynchronously load the data that we need from ore or more web services.

To handle data fetching a plugin can define Epics. To have more detail about epics look at the [Epics developers guide](writing-epics) section of this documentation.

### actions/sample.js
```javascript
// custom action
const LOAD_DATA = 'SAMPLE:LOAD_DATA';
const LOADED_DATA = 'SAMPLE:LOADED_DATA';
const loadData = () => {
    return {
        type: LOAD_DATA
    };
};

const loadedData = (payload) => {
    return {
        type: LOAD_DATA,
        payload
    };
};
module.exports = {
    LOAD_DATA,
    LOADED_DATA,
    loadData,
    loadedData
};
```

### reducers/sample.js
```javascript
const {LOADED_DATA} = require('../actions/sample');
module.exports = function (action, state) {
        switch (action.type) {
            case LOADED_DATA:
                return {
                    text: action.payload
                }
                break;
            default:
                return state;
        }
    }
};
```

### epics/sample.js
```javascript
const Rx = require('rxjs');
const {LOAD_DATA, lodadedData} = require('../actions/sample');
module.exports = {
    loadDataEpic: action$.ofType(LOAD_DATA)
            .switchMap((action) => {
                return Rx.Observable.defer(() => axios.get('load/data/service'))
                    .switchMap((response) => Rx.Observable.of(loadedData(response.data)))
                    .catch(e => Rx.Observable.of(...));
            })
    }
};
```

### SideEffectComponent.jsx
```javascript
const {connect} = require('react-redux');
const {loadData} = require('../actions/sample');

const SampleComponent = ({text, onLoad}) => {
    const style = {position: "absolute", top: "100px", left: "100px", zIndex: 1000000};
    return <div style={style}>Text: {text} <button onClick={onLoad)}>Load</button></div>;
};

const ConnectedSample = connect((state) => {
    return {
        text: get(state, 'sample.text')
    };
}, {
    onLoad: loadData
});

module.exports = {
    SideEffectSamplePlugin: ConnectedSample,
    reducers: {
        sample
    },
    epics: require('../epics/sample')
};
```

## Plugins that are containers of other plugins
It is possible to define **Container** plugins, that are able to receive a list of *items* from the plugins system automatically. Think of menus or toolbars that can dinamically configure their items / tools from the configuration. 

### ContainerComponent.jsx
```javascript
const SampleContainer = ({items) => {
    return items.map(item => {
        const Item = item.plugin; // item.plugin is the plugin ReactJS component
        return <Item id={item.id} name={item.name}/>;
    });
};

module.exports = {
    ContainerPlugin: SampleContainer
}
```

## Plugins for other plugins
Since we have containers, we can build plugins that can be contained in one or more container plugins.

### ContainedComponent.jsx
```javascript
const {connect} = require('react-redux');

const SampleComponent = ({text}) => {
    const style = {position: "absolute", top: "100px", left: "100px", zIndex: 1000000};
    return <div style={style}>Text: {text}</div>;
};

const ConnectedSample = connect((state) => {
    return {
        text: get(state, 'sample.text')
    };
});

module.exports = {
    ContainedSamplePlugin: ConnectedSample,
    Container: {
        name: "Sample",
        id: "sample_tool",
        ...
    }
};
```

Each section defines a possible container for the plugin, as the name of another plugin (*Container* in the example). The properties in it define the plugin behaviour in relation to the container (e.g. id of the item).

Containers will receive a list of items similar to this:

```javascript
items = [{plugin: ConnectedSample, name: "Sample", id: "sample_tool", ...}]
```

Notice that also container related properties can be overridden in the application configuration, using the override property:

### localConfig.json
```javascript
{
    ...
    "plugins": {
        "desktop": [{
            "name": "Sample",
            "override": {
                "Container": {
                    "name": "Another Sample"
                }
            }
        }, ...],
        ...
    }
}
```
## Plugins Configuration
We have already mentioned that plugins can be configured through the localConfig.json file.
The simplest configuration is needed to include the plugin in a particular application mode, and is accomplished by listing the plugin name in the plugins array of the chosen mode:

### localConfig.json
```javascript
{
    ...
    "plugins": {
        "desktop": ["Sample", ...],
        ...
    }
}
```

To customize a plugin style and behaviour a JSON object can be used instead, specifying the plugin name in the **name** property, and the plugin configuration in the **cfg** property.

```javascript
{
    ...
    "plugins": {
        "desktop": [{
            "name": "Sample",
            "cfg": {
                "text": "my text"
            }
            ...
        }, ...],
        ...
    }
}
```

### Dynamic configuration
Configuration can also dinamically change when the application state changes. This is accomplished by using expressions in configuration values. An expression is a value of the following form:

```javascript
"property: "{expression}"
```

The expression itself is javascript code (supported by the browser, babel transpiled code is not supported here) where you can use the following variables:
 * *request*: **request URL** parsed by the [url library](https://www.npmjs.com/package/url)
 * *context*: anything defined in **plugins.js requires section**
 * *state*: a function usable to extract values from the **application state** (e.g. state('map.present.zoom' to get current zoom))

Note that not all the application state is available through the state function, only the *monitored state* is. To add new fragments the monitored state, you can add the following to localConfig.json:
```javascript
{
    ...,
    "monitorState": [
      {"name": "routing", "path": "routing.location.pathname"},
      {"name": "browser", "path": "browser"},
      {"name": "featuregridmode", "path": "featuregrid.mode"}],
    ...
}
```

The default monitored state is:

```javascript
{name: "mapType", path: 'maptype.mapType'}, {name: "user", path: 'security.user'}
```

#### Example
```javascript
{
    ...,
    "plugins": {
        "desktop": [{
            "name": "Sample",
            "cfg": {
                "text": "{state('mapType') === 'leaflet' ? 'Leaflet Map' : 'OpenLayers Map'}"
            }
            ...
        }, ...],
        ...
    }
    ...
}
```

### Container configuration
Each plugin can define a list of supported containers, but it's the plugin system that decides which ones will be used at runtime based on:
 * container existance: if a container is not configured, it will not be used (obviously)
 * between the existing ones, the one with the highest priority property value will be chosen

#### Example
```javascript
...

module.exports = {
    ContainedSamplePlugin: ConnectedSample,
    Container1: {
        name: "Sample",
        id: "sample_tool",
        priority: 1,
        ...
    },
    Container2: {
        name: "Sample",
        id: "sample_tool",
        priority: 2,
        ...
    },
    Container3: {
        name: "Sample",
        id: "sample_tool",
        priority: 3,
        ...
    }
};
```

If all the containers exist, Container3 will be chosen, the one with highest priority,if not Container2 will be used, and so on.

To explicitly configure plugins containment and introduce custom behaviours (overriding default properties), the **override** configuration property is available.
Using it, you can override the relation between a plugin and its supported containers.

We can change containers relation like this:

```javascript
{
    ...,
    "plugins": {
        "desktop": [{
            "name": "Sample",
            "override": {
                "Container1": {
                    "name": "custom name",
                    "priority": 4
                }
            }
            ...
        }, ...],
        ...
    }
    ...
}
```

This will force the plugin system to choose Container1 instead of Container3, and will override the name property.

There is also a full set of options to (dinamically) add/exclude containers:
 * **showIn**: can be used to add a plugin to a container or more than one, in addition to the default one (it is an array of container plugin names)
 * **hideFrom**: can be used to exclude a plugin from a given container or more than one (it is an array of container plugin names)
 * **doNotHide**: can be used to show a plugin in the root container, in addition to the default one

Note that also these properties accept dynamic expressions.

```javascript
{
    ...,
    "plugins": {
        "desktop": [{
            "name": "Sample",
            "showIn": ["Container1"]
            ...
        }, ...],
        ...
    }
    ...
}
```
This will duplicate the plugin both in Container3 (the one chosen as the most prioritized) and Container1 (chosen by configuration).
This is useful when the same plugin controls different application widgets, for example:
 * a toolbar button to enable / disable the plugin functionality
 * a settings panel to configure the tool

The two widgets will be contained by 2 different containers, the Toolbar plugin and the Settings plugin.

### Conditionally disabling plugins
Dinamyc expression can also be used to enable a plugin only when a specific application state is met, using the **disablePluginIf** property.

```javascript
{
    ...,
    "plugins": {
        "desktop": [{
            "name": "Sample",
            "disablePluginIf": "{state('mapType') === 'cesium'}"
            ...
        }, ...],
        ...
    }
    ...
}
```
The plugin will be disabled in 3D mode.

## Lazy loading plugins
You can lazy load your plugins (load them on demand), but only if you define a loading mechanism for your plugin. This is expecially useful for plugins that include big external libraries.

A lazy loaded plugin is not defined by its component, but with a lazy descriptor with:
 * a **loadPlugin** function that loads the plugin code and calls the given **resolve** when the plugin is loaded
 * an **enabler** function that triggers plugin loading on a specific state change

```javascript
module.exports = {
    LazySamplePlugin: {
        loadPlugin: (resolve) => {
            // require.ensure allows code splitting through webpack and
            // creates a different js bundle for the plugin
            require.ensure(['./LazySampleComponent'], () => {
                const LazySamplePlugin = connect(...)(require('./LazySampleComponent'));
                resolve(LazySamplePlugin);
            });
        },
        enabler: (state) => state.controls.lazyplugin && state.controls.lazyplugin.enabled || false
    }
};
```

## Testing plugins

## General Guidelines
 * Components
    * define the plugin component(s) into dedicated JSX file(s), so that they can be reused outside of the plugin
    * connect the component(s) in the plugin JSX file
 * State
    * define your own state fragment (and related actions and reducers) to handle internal state, and use existing actions and state fragments from MapStore2 to interact with the framework
 * Selectors
    * use existing selectors when possible to connect the state, eventually using reselect to compose them together or with your own selectors
    * define new selectors only if you use them more than once and move them to a selectors JS file
 * Avoid as much as possible direct interactions between different plugins; plugins are meant to be independent modules, so they should be able to work if other plugins appear / disappear from the application configuration
   * interact with other plugins and the application itself using actions and state sharing
   * creating side effects to make plugins interact in more strict ways should not be done at the plugin level, orchestrating different plugins should be delegated at the top (application) level
   * use containers configuration to combine plugins in containers