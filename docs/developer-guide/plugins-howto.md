# Creating a MapStore2 plugin
The MapStore2 [plugins architecture](../plugins-architecture) allows building your own independent modules that will integrate seamlessly into your project.

Creating a plugin is like assembling and connecting several pieces together into an atomic module. This happens by writing a plugin module, a ReactJS JSX file exporting the plugin descriptor.

## Introduction
During this tutorial, you will learn how to create and configure plugins in a MapStore project.
If you don't know how to work with MapStore projects, please read the [Projects Guide](../mapstore-projects). 
For this tutorial, a "standard project" is used. 

## A plugin example

A plugin is a ReactJS *component with a name*. The chosen name is always suffixed with **Plugin**.

### js/plugins/Sample.jsx
```javascript
import React from 'react';

class SampleComponent extends React.Component {
    render() {
        const style = {position: "absolute", top: "100px", left: "100px", zIndex: 10000000};
        return <div style={style}>Sample</div>;
    }
}

export const SamplePlugin = SampleComponent;
// the Plugin postfix is mandatory, avoid bugs by calling all your descriptors
// <Something>Plugin
```
Being a component with a name (**Sample** in our case) you can include it in your project by creating a *plugins.js* file:

### js/plugins.js
```javascript
module.exports = {
    plugins: {
        ...
        SamplePlugin: require('./plugins/Sample'),
        ...
    }
};

```

**Note** that SamplePlugin in plugins.js must be called with the same name used when exporting it.

Include the plugin.js from your app.jsx either replacing the plugins import from the product or extending it:

### js/app.jsx
```javascript
...

const m2Plugins = require('@mapstore/product/plugins');
const customPlugins = require('./plugins');
const allPlugins = {...m2Plugins, plugins: {...customPlugins.plugins, ...m2Plugins.plugins}};
require('@mapstore/product/main')(appConfig, allPlugins);


```

Then you have to configure it properly so that is enabled in one or more [application modes](../application-modes) / [pages](../application-pages):

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

Note: to enable a plugin you need to do two things:

 - require it in the plugins.js file
 - configure it in localConfig.json (remove the Plugins suffix here)

If one is missing, the plugin won't appear.
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

## A store connected plugin example
A plugin component is a **smart component** (connected to the Redux store) so that properties can be taken from the global state, as needed.

### js/plugins/ConnectedSample.jsx (1)
```javascript
import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {get} from 'lodash';

class SampleComponent extends React.Component {
    static propTypes = {
        zoom: PropTypes.number
    };

    render() {
        const style = {position: "absolute", top: "100px", left: "100px", zIndex: 1000000};
        return <div style={style}>Zoom: {this.props.zoom}</div>;
    }
}

const ConnectedSample = connect((state) => {
    return {
        zoom: get(state, 'map.present.zoom') // connected property
    };
})(SampleComponent);

export const ConnectedSamplePlugin = ConnectedSample;
```

A plugin can use actions to update the global state.

### js/plugins/ConnectedSample.jsx (2)
```javascript

import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import {get} from 'lodash';

import { changeZoomLevel } from '../../MapStore2/web/client/actions/map';

class SampleComponent extends React.Component {
    static propTypes = {
        zoom: PropTypes.number,
        onZoom: PropTypes.func
    };

    render() {
        const style = { position: "absolute", top: "100px", left: "100px", zIndex: 1000000 };
        return <div style={style}>Zoom: {this.props.zoom} <button onClick={() => this.props.onZoom(this.props.zoom + 1)}>Increase</button></div >;
    }
}

const ConnectedSample = connect((state) => {
    return {
        zoom: get(state, 'map.present.zoom')
    };
}, {
        onZoom: changeZoomLevel // connected action
    })(SampleComponent);

export const ConnectedSamplePlugin = ConnectedSample;

```

A plugin can define its own state fragments and the related reducers.
Obviously you will also be able to define your own actions.

### js/actions/sample.js
```javascript
export const UPDATE_SOMETHING = 'SAMPLE:UPDATE_SOMETHING';
export const updateSomething = (payload) => {
    return {
        type: UPDATE_SOMETHING,
        payload
    };
};
```

### js/reducers/sample.js
```javascript
import { UPDATE_SOMETHING } from '../actions/sample';
export default function(state = { text: 'Initial Text' }, action) {
    switch (action.type) {
        case UPDATE_SOMETHING:
            return {
                text: action.payload
            };
        default:
            return state;
    }
}
```

### js/plugins/ConnectedSample.jsx (3)
```javascript
import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import {get} from 'lodash';

import { updateSomething } from '../actions/sample';
import sample from '../reducers/sample';

class SampleComponent extends React.Component {
    static propTypes = {
        text: PropTypes.string,
        onUpdate: PropTypes.func
    };

    render() {
        const style = { position: "absolute", top: "100px", left: "100px", zIndex: 1000000 };
        return <div style={style}>Text: {this.props.text} <button onClick={() => this.props.onUpdate('Updated Text')}>Update</button></div >;
    }
}

const ConnectedSample = connect((state) => {
    return {
        text: get(state, 'sample.text')
    };
}, {
        onUpdate: updateSomething // connected action
    })(SampleComponent);

export const ConnectedSamplePlugin = ConnectedSample;
export const reducers = {sample};
```

## Data fetching and side effects
Side effects should be limited as much as possible, but there are cases where a side effect cannot be avoided.
In particular all asynchronous operations are side effects in Redux, but we obviously need to handle them, in particular we need to asynchronously load the data that we need from ore or more web services.

To handle data fetching a plugin can define Epics. To have more detail about epics look at the [Epics developers guide](../writing-epics) section of this documentation.

### js/actions/sample.js
```javascript
// custom action
export const LOAD_DATA = 'SAMPLE:LOAD_DATA';
export const LOADED_DATA = 'SAMPLE:LOADED_DATA';
export const LOAD_ERROR = 'SAMPLE:LOAD_ERROR';
export const loadData = () => {
    return {
        type: LOAD_DATA
    };
};

export const loadedData = (payload) => {
    return {
        type: LOADED_DATA,
        payload
    };
};

export const loadError = (error) => {
    return {
        type: LOAD_ERROR,
        error
    };
};
```

### js/reducers/sample.js
```javascript
import { LOADED_DATA, LOAD_ERROR } from '../actions/sample';
export default function(state = { text: 'Initial Text' }, action) {
    switch (action.type) {
        case LOADED_DATA:
            return {
                text: action.payload
            };
        case LOAD_ERROR:
            return {
                error: action.error
            };
        default:
            return state;
    }
}
```

### js/epics/sample.js
```javascript
import * as Rx from 'rxjs';
import axios from 'axios';

import { LOAD_DATA, loadedData, loadError } from '../actions/sample';

export const loadDataEpic = (action$) => {
    return action$.ofType(LOAD_DATA)
        .switchMap(() => {
            return Rx.Observable.defer(() => axios.get('version.txt'))
                .switchMap((response) => Rx.Observable.of(loadedData(response.data)))
                .catch(e => Rx.Observable.of(loadError(e.message)));
        });
};

export default {
    loadDataEpic
};
```

### js/plugins/SideEffectComponent.jsx
```javascript
import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import {get} from 'lodash';

import { loadData } from '../actions/sample';
import sampleEpics from '../epics/sample';
import sample from '../reducers/sample';

class SideEffectComponent extends React.Component {
    static propTypes = {
        text: PropTypes.string,
        onLoad: PropTypes.func
    };

    render() {
        const style = { position: "absolute", top: "100px", left: "100px", zIndex: 1000000 };
        return <div style={style}>Text: {this.props.text} <button onClick={this.props.onLoad}>Load</button></div >;
    }
}

const ConnectedSideEffect = connect((state) => {
    return {
        text: get(state, 'sample.text')
    };
}, {
        onLoad: loadData // connected action
    })(SideEffectComponent);

export const SideEffectPlugin = ConnectedSideEffect;
export const reducers = {sample};
export const epics = sampleEpics;
```

## Plugins that are containers of other plugins
It is possible to define **Container** plugins, that are able to receive a list of *items* from the plugins system automatically. Think of menus or toolbars that can dynamically configure their items / tools from the configuration.

In addition to those "user defined" containers, there is always a **root container**. When no container is specified for a plugin, it will be included in the root container.

### js/plugins/ContainerComponent.jsx
```javascript
import React from 'react';
import PropTypes from 'prop-types';

class SampleContainer extends React.Component {
    static propTypes = {
        items: PropTypes.array
    };
    renderItems = () => {
        return this.props.items.map(item => {
            const Item = item.plugin; // item.plugin is the plugin ReactJS component
            return <Item id={item.id} name={item.name} />;
        });
    };

    render() {
        const style = { zIndex: 1000, border: "solid black 1px", width: "200px", height: "200px", position: "absolute", top: "100px", left: "100px" };
        return <div style={style}>{this.renderItems()}</div>;
    }
}

export const ContainerPlugin = SampleContainer;
```

## Plugins for other plugins
Since we have containers, we can build plugins that can be contained in one or more container plugins.

### js/plugins/ContainedComponent.jsx
```javascript
import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import {get} from 'lodash';
import assign from 'object-assign';

import sample from '../reducers/sample';

class SampleComponent extends React.Component {
    static propTypes = {
        text: PropTypes.string
    };

    render() {
        const style = { position: "absolute", top: "100px", left: "100px", zIndex: 1000000 };
        return <div style={style}>Text: {this.props.text}</div >;
    }
}

const ConnectedSample = connect((state) => {
    return {
        text: get(state, 'sample.text')
    };
})(SampleComponent);

export const ContainedPlugin = assign(ConnectedSample, {
    // we support the previously defined Container Plugin as a
    // possible container for this plugin
    Container: {
        name: "Sample",
        id: "sample_tool",
        priority: 1
    }
});
export const reducers = {sample};
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
Configuration can also dynamically change when the application state changes. This is accomplished by using expressions in configuration values. An expression is a value of the following form:

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
      {"name": "router", "path": "router.location.pathname"},
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
 * between the existing ones, the ones with the highest priority property value will be chosen; note that a plugin can be included in more than one container if they have the same priority

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

There is also a set of options to (dynamically) add/exclude containers:

 * **showIn**: can be used to add a plugin to a container or more than one, in addition to the default one (it is an array of container plugin names)
 * **hideFrom**: can be used to exclude a plugin from a given container or more than one (it is an array of container plugin names)
 * **doNotHide**: can be used to show a plugin in the root container, in addition to the default one

Note that also these properties accept dynamic expressions.

#### js/plugins/Container.jsx
```javascript
import React from 'react';
import PropTypes from 'prop-types';

class SampleContainer extends React.Component {
    static propTypes = {
        items: PropTypes.array
    };
    renderItems = () => {
        return this.props.items.map(item => {
            const Item = item.plugin; // item.plugin is the plugin ReactJS component
            return <Item id={item.id} name={item.name} />;
        });
    };

    render() {
        const style = { zIndex: 1000, border: "solid black 1px", width: "200px", height: "200px", position: "absolute", top: "100px", left: "100px" };
        return <div style={style}>{this.renderItems()}</div>;
    }
}

export const ContainerPlugin = SampleContainer;

```

#### js/plugins/ContainerOther.jsx
```javascript
import React from 'react';
import PropTypes from 'prop-types';

class SampleContainer extends React.Component {
    static propTypes = {
        items: PropTypes.array
    };
    renderItems = () => {
        return this.props.items.map(item => {
            const Item = item.plugin; // item.plugin is the plugin ReactJS component
            return <Item id={item.id} name={item.name} />;
        });
    };

    render() {
        const style = { zIndex: 1000, border: "solid red 1px", width: "200px", height: "200px", position: "absolute", top: "100px", left: "100px" };
        return <div style={style}>{this.renderItems()}</div>;
    }
}

export const ContainerOtherPlugin = SampleContainer;

```

#### js/plugins/Sample.jsx
```javascript
import React from 'react';
import assign from 'object-assign';

class SampleComponent extends React.Component {
    render() {
        const style = { position: "absolute", top: "100px", left: "100px", zIndex: 1000000 };
        return <div style={style}>Hello</div >;
    }
}

export const SamplePlugin = assign(SampleComponent, {
    Container: {
        name: "Sample",
        id: "sample_tool",
        priority: 1
    },
    ContainerOther: {
        name: "Sample",
        id: "sample_tool",
        priority: 1
    }
});

```

With this configuration the sample plugin will be shown in both Container and ContainerOther plugins (they have the same priority, so both are picked).

We can change this using `showIn` or `hideFrom` in `localConfig.json`:
#### localConfig.json
```javascript
{
    ...,
    "plugins": {
        "desktop": [{
            "name": "Sample",
            "showIn": ["Container"]
            ...
        }, ...],
        ...
    }
    ...
}

or

{
    ...,
    "plugins": {
        "desktop": [{
            "name": "Sample",
            "hideFrom": ["ContainerOther"]
            ...
        }, ...],
        ...
    }
    ...
}
```

We can also add the plugin to the root container, using the doNotHide property (note that this is a container property, so we have to use an override for it):

#### localConfig.json
```javascript
{
    ...,
    "plugins": {
        "desktop": [{
            "name": "Sample",
            "showIn": ["Container"],
            "override": {
                "Container": {
                    "doNotHide": true
                }
            }
            ...
        }, ...],
        ...
    }
    ...
}

```

### Conditionally disabling plugins
Dynamyc expression can also be used to enable a plugin only when a specific application state is met, using the **disablePluginIf** property.

```javascript
{
    ...,
    "plugins": {
        "desktop": [{
            "name": "Sample",
            "cfg": {
                "disablePluginIf": "{state('mapType') === 'cesium'}"
            }
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
As we already mentioned a plugin is a collection of entities that should already have unit tests (components, reducers, actions, selectors, epics).
We can limit plugins testing to testing the interactions between these different entities, for example:

 * connection of the redux state to the plugins properties
 * epics that are related to the plugin lifecycle
 * containment relations between plugins

To ease writing a plugin unit test, an helper is available (pluginsTestUtils) that can be used to:

  * create a plugin connected with a redux store (**getPluginForTest**), initialized with plugin's defined reducers and epics, and with a given initial state
  * get access to the redux store
  * get access to the list of actions dispatched to the store
  * get access to the list of containers plugins supported by the plugin (you can limit this list by passing your plugins definitions to getPluginForTest)

### Examples

#### js/__tests__/myplugin-test.js

```javascript
import expect from 'expect';
import React from 'react';
import ReactDOM from 'react-dom';

import MyPlugin from '../MyPlugin';
import { getPluginForTest } from '../../MapStore2/web/client/plugins/__tests__/pluginsTestUtils';

const initialState = {};

describe('MyPlugin Test', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('creates MyPlugin with default configuration', () => {
        const {Plugin, store, actions, containers } = getPluginForTest(MyPlugin, initialState);
        ReactDOM.render(<Plugin />, document.getElementById("container"));
        expect(document.getElementById('<my plugin id>')).toExist();
        expect(...);
    });
    // use pluginCfg to override plugins properties
    it('creates MyPlugin with custom configuration', () => {
        const {Plugin, store, actions, containers } = getPluginForTest(MyPlugin, initialState);
        ReactDOM.render(<Plugin pluginCfg={{
            property: 'value'
        }}/>, document.getElementById("container"));
        expect(document.getElementById('<my plugin id>')).toExist();
        expect(...);
    });

    // test connected epics looking at the actions array
    it('test plugin epics', () => {
        const {Plugin, store, actions, containers } = getPluginForTest(MyPlugin, initialState);
        ReactDOM.render(<Plugin/>, document.getElementById("container"));
        store.dispatch({
            type: ACTION_CAPTURED_BY_AN_EPIC,
            payload
        });
        expect(actions.filter(action => action.type === ACTION_LAUNCHED_BY_AN_EPIC).length).toBe(1);
    });

    // test supported containers
    it('test containers', () => {
        const {Plugin, store, actions, containers } = getPluginForTest(MyPlugin, initialState, {
            MyContainerPlugin: {}
        });
        ReactDOM.render(<Plugin/>, document.getElementById("container"));
        expect(Object.keys(containers)).toContain('MyContainer');
    });
});

```

## General Guidelines
 * Components
    * define the plugin component(s) into dedicated JSX file(s), so that they can be reused outside of the plugin
    * connect the component(s) in the plugin JSX file
 * State
    * define your own state fragment (and related actions and reducers) to handle internal state, and use existing actions and state fragments from MapStore2 to interact with the framework
 * Selectors
    * use existing selectors when possible to connect the state, eventually using reselect to compose them together or with your own selectors
 * Avoid as much as possible direct interactions between different plugins; plugins are meant to be independent modules, so they should be able to work if other plugins appear / disappear from the application configuration
   * interact with other plugins and the application itself using actions and state sharing
   * creating side effects to make plugins interact in more strict ways should not be done at the plugin level, orchestrating different plugins should be delegated at the top (application) level
   * use containers configuration to combine plugins in containers
