# Creating a MapStore2 plugin

The MapStore2 [plugins architecture](plugins-architecture.md#plugins-architecture) allows building your own independent modules that will integrate seamlessly into your project.

Creating a plugin is like assembling and connecting several pieces together into an atomic module. This happens by writing a plugin module, a ReactJS JSX file exporting the plugin descriptor.

## Introduction

During this tutorial, you will learn how to create and configure plugins in a MapStore project.
If you don't know how to work with MapStore projects, please read the [Projects Guide](mapstore-projects.md#mapstore-projects).
For this tutorial, a "standard project" is used.

## A plugin example

`js/plugins/Sample.jsx`

Plugins are react component exported with the [createPlugin](https://mapstore.geosolutionsgroup.com/mapstore/docs/api/framework#createPlugin) function

```javascript
import React from "react";
import { createPlugin } from "@mapstore/utils/PluginsUtils";

const Sample = () => {
    const style = {
        position: "absolute",
        top: 100,
        left: 100,
        zIndex: 2000
    };
    return (
        <div style={style}>
            Sample
        </div>
    );
};

export default createPlugin("Sample", {
    component: Sample
});
```

Being a component with a name (**Sample** in our case) you can include it in your project by creating a *plugins.js* file.

`js/plugins.js`

```javascript

import SamplePlugin from "./plugins/Sample";

export const plugins = {
    // ...
    SamplePlugin,
    // ...
};

export default {
    plugins
};

```

**Note** The chosen component name is always suffixed with **Plugin** when imported in the *plugins.js* file.

Include the plugin.js from your app.jsx either replacing the plugins import from the product or extending it:

`js/app.jsx`

```javascript
...

import m2Plugins from "@mapstore/product/plugins";
import customPlugins from "./plugins";
import main from "@mapstore/product/main";

const allPlugins = {
    ...m2Plugins,
    plugins: {
        ...customPlugins.plugins,
        ...m2Plugins.plugins
    }
};

main(appConfig, allPlugins);
```

Then you have to configure it properly so that is enabled in one or more application modes / pages:

`localConfig.json`

```javascript
{
    ...
    "plugins": {
        "desktop": [{ "name": "Sample" }, ...],
        ...
    }
}
```

Note: to enable a plugin you need to do two things:

- import it in the plugins.js file
- configure it in localConfig.json (remove the Plugins suffix here)

If one is missing, the plugin won't appear.
To globally remove a plugin from your project the preferred way is removing it from plugins.js, because this will reduce the global javascript size of your application.

You can also specify plugins properties in the configuration, using the **cfg** property:

`localConfig.json (2)`

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

`js/plugins/Sample.jsx (1)`

```javascript
import React from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";

import { createPlugin } from "@mapstore/utils/PluginsUtils";

const SampleComponent = ({
    style,
    zoom
}) => {
    return (
        <div style={style}>
            Zoom: {zoom}
        </div>
    );
};

SampleComponent.propTypes = {
    style: PropTypes.object,
    zoom: PropTypes.number
};

SampleComponent.defaultProps = {
    style: {
        position: "absolute",
        top: 100,
        left: 100,
        zIndex: 2000
    }
};

const Sample = connect((state) => {
    return {
        // connected property
        zoom: state?.map?.present?.zoom
    };
})(SampleComponent);

export default createPlugin("Sample", {
    component: Sample
});
```

A plugin can use actions to update the global state.

`js/plugins/Sample.jsx (2)`

```javascript

import React from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";

import { createPlugin } from "@mapstore/utils/PluginsUtils";
import { changeZoomLevel } from "@mapstore/actions/map";

const SampleComponent = ({
    style,
    zoom,
    onZoom
}) => {
    return (
        <div style={style}>
            Zoom: {zoom}
            <button onClick={() => onZoom(zoom + 1)}>
                Increase
            </button>
        </div>
    );
};

SampleComponent.propTypes = {
    style: PropTypes.object,
    zoom: PropTypes.number,
    onZoom: PropTypes.func
};

SampleComponent.defaultProps = {
    style: {
        position: "absolute",
        top: 100,
        left: 100,
        zIndex: 2000
    },
    onZoom: () => {}
};

const Sample = connect((state) => {
    return {
        zoom: state?.map?.present?.zoom
    };
}, {
    // connected action
    onZoom: changeZoomLevel
})(SampleComponent);

export default createPlugin("Sample", {
    component: Sample
});

```

A plugin can define its own state fragments and the related reducers.
You will also be able to define your own actions.

`js/actions/sample.js`

```javascript
export const UPDATE_SOMETHING = "SAMPLE:UPDATE_SOMETHING";
export const updateSomething = (payload) => ({
    type: UPDATE_SOMETHING,
    payload
});
```

`js/reducers/sample.js`

```javascript
import { UPDATE_SOMETHING } from "@js/actions/sample";
function sample(
    state = { text: "Initial Text" },
    action
) {
    switch (action.type) {
        case UPDATE_SOMETHING:
            return {
                text: action.payload
            };
        default:
            return state;
    }
}
export default sample;
```

`js/plugins/Sample.jsx (3)`

```javascript
import React from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";

import { createPlugin } from "@mapstore/utils/PluginsUtils";

import { updateSomething } from "@js/actions/sample";
import sample from "@js/reducers/sample";

const SampleComponent = ({
    style,
    text,
    onUpdate
}) => {
    return (
        <div style={style}>
            Text: {text}
            <button
                onClick={() => onUpdate("Updated Text")}
            >
            Update
            </button>
        </div>
    );
};

SampleComponent.propTypes = {
    style: PropTypes.object,
    text: PropTypes.string,
    onUpdate: PropTypes.func
};

SampleComponent.defaultProps = {
    style: {
        position: "absolute",
        top: 100,
        left: 100,
        zIndex: 2000
    },
    text: "",
    onUpdate: () => {}
};

const Sample = connect((state) => {
    return {
        // connected property
        text: state?.sample?.text
    };
}, {
    // connected action
    onUpdate: updateSomething
})(SampleComponent);

export default createPlugin("Sample", {
    component: Sample,
    reducers: {
        sample
    }
});
```

## Data fetching and side effects

Side effects should be limited as much as possible, but there are cases where a side effect cannot be avoided.
In particular we need to asynchronously load the data from external web services or files.

To handle data fetching a plugin can define Epics. To have more detail about epics look at the [Epics developers guide](./writing-epics) section of this documentation.

`js/actions/sample.js`

```javascript
// custom action
export const LOAD_DATA = "SAMPLE:LOAD_DATA";
export const LOADED_DATA = "SAMPLE:LOADED_DATA";
export const LOAD_ERROR = "SAMPLE:LOAD_ERROR";
export const loadData = () => ({
    type: LOAD_DATA
});

export const loadedData = (payload) => ({
    type: LOADED_DATA,
    payload
});

export const loadError = (error) => ({
    type: LOAD_ERROR,
    error
});
```

`js/reducers/sample.js`

```javascript
import { LOADED_DATA, LOAD_ERROR } from "@js/actions/sample";
function sample(
    state = { text: "Initial Text" },
    action
) {
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
export default sample;
```

`js/epics/sample.js`

```javascript
import { Observable } from "rxjs";
import axios from "axios";

import {
    LOAD_DATA,
    loadedData,
    loadError
} from "@js/actions/sample";

export const loadDataEpic = (action$) =>
    action$.ofType(LOAD_DATA)
        .switchMap(() => {
            return Observable.defer(() =>
                axios.get("version.txt")
            )
                .switchMap((response) =>
                    Observable.of(
                        loadedData(response.data)
                    )
                )
                .catch(e =>
                    Observable.of(
                        loadError(e.message)
                    )
                );
        });

export default {
    loadDataEpic
};
```

`js/plugins/Sample.jsx`

```javascript
import React from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";

import { createPlugin } from "@mapstore/utils/PluginsUtils";

import { loadData } from "@js/actions/sample";
import sampleEpics from "@js/epics/sample";
import sample from "@js/reducers/sample";

const SideEffectComponent = ({
    style,
    text,
    onLoad
}) => {
    return (
        <div style={style}>
            Text: {text}
            <button onClick={() => onLoad()}>
                Load
            </button>
        </div>
    );
};

SideEffectComponent.propTypes = {
    style: PropTypes.object,
    text: PropTypes.string,
    onLoad: PropTypes.func
};

SideEffectComponent.defaultProps = {
    style: {
        position: "absolute",
        top: 100,
        left: 100,
        zIndex: 2000
    },
    text: "",
    onLoad: () => {}
};

const Sample = connect((state) => {
    return {
        text: state?.sample?.text
    };
}, {
    // connected action
    onLoad: loadData
})(SideEffectComponent);

export default createPlugin("Sample", {
    component: Sample,
    reducers: {
        sample
    },
    epics: sampleEpics
});
```

## Plugin Containers

It is possible to define **Container** plugins, that are able to receive a list of *items* from the plugins system automatically. Think of menus or toolbars that can dynamically configure their items / tools from the configuration.

In addition to those "user defined" containers, there is always a **root container**. When no container is specified for a plugin, it will be included in the root container.

`js/plugins/Container.jsx`

```javascript
import React from "react";
import PropTypes from "prop-types";

import { createPlugin } from "@mapstore/utils/PluginsUtils";

const Container = ({
    style,
    items
}) => {
    return (
        <div style={style}>
            {items.map(item => {
                // item.plugin is the plugin ReactJS component
                const Item = item.plugin;
                return (
                    <Item
                        key={item.id}
                        id={item.id}
                        name={item.name}
                    />
                );
            })}
        </div>
    );
};

Container.propTypes = {
    style: PropTypes.object,
    items: PropTypes.array
};

Container.defaultProps = {
    style: {
        position: "absolute",
        top: 100,
        left: 100,
        zIndex: 2000
    },
    items: []
};

export default createPlugin("Container", {
    component: Container
});
```

## Plugins for other plugins

Since we have containers, we can build plugins that can be contained in one or more container plugins.

`js/plugins/Sample.jsx`

```javascript
import React from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";

import { createPlugin } from "@mapstore/utils/PluginsUtils";

import sample from "@js/reducers/sample";

const SampleComponent = ({
    text
}) => {
    return (
        <div>
            Text: {text}
        </div>
    );
};

SampleComponent.propTypes = {
    text: PropTypes.string
};

SampleComponent.defaultProps = {
    text: ""
};

const Sample = connect((state) => {
    return {
        text: state?.sample?.text
    };
})(SampleComponent);

export default createPlugin("Sample", {
    component: Sample,
    reducers: {
        sample
    },
    containers: {
        // we support the previously defined Container Plugin as a
        // possible container for this plugin
        Container: {
            name: "Sample",
            id: "sample-tool",
            priority: 1
        }
    }
});
```

Each section defines a possible container for the plugin, as the name of another plugin (*Container* in the example). The properties in it define the plugin behaviour in relation to the container (e.g. id of the item).

Containers will receive a list of items similar to this:

```javascript
items = [{ plugin: Sample, name: "Sample", id: "sample-tool", ... }]
```

Notice that also container related properties can be overridden in the application configuration, using the override property:

`localConfig.json`

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
The simplest configuration needed to include the plugin in a particular application mode is accomplished by listing a JSON object specifying the **name** property of the plugin in the plugins array of the chosen mode/page:

`localConfig.json`

```javascript
{
    ...
    "plugins": {
        "desktop": [{ "name": "Sample" }, ...],
        ...
    }
}
```

It is possible to customize a plugin configuration adding a **cfg** property to the plugin JSON object. All the **cfg** properties are passed as props to the main component of the plugin.

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
"property": "{expression}"
```

The expression itself is javascript code (supported by the browser, babel transpiled code is not supported here) where you can use the following variables:

- *request*: **request URL** parsed by the [url library](https://www.npmjs.com/package/url)
- *context*: anything defined in **plugins.js requires section**
- *state*: a function usable to extract values from the **application state** (e.g. state('map.present.zoom' to get current zoom))

Note that not all the application state is available through the state function, only the *monitored state* is. To add new fragments the monitored state, you can add the following to localConfig.json:

```javascript
{
    ...,
    "monitorState": [
        {"name": "router", "path": "router.location.pathname"},
        {"name": "browser", "path": "browser"},
        {"name": "featuregridmode", "path": "featuregrid.mode"}
    ],
    ...
}
```

The default monitored state is:

```javascript
{
    ...,
    "monitorState": [
        {"name": "router", "path": "router.location.pathname"},
        {"name": "browser", "path": "browser"},
        {"name": "geostorymode", "path": "geostory.mode"},
        {"name": "featuregridmode", "path": "featuregrid.mode"},
        {"name": "userrole", "path": "security.user.role"},
        {"name": "printEnabled", "path": "print.capabilities"}
    ],
    ...
}
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

- container existence: if a container is not configured, it will not be used
- between the existing ones, the ones with the highest priority property value will be chosen; note that a plugin can be included in more than one container if they have the same priority

#### Example

```javascript
// ...

import { createPlugin } from "@mapstore/utils/PluginsUtils";

// ...

export default createPlugin("Sample", {
    component: Sample,
    containers: {
        Container1: {
            name: "Sample",
            id: "sample-tool",
            priority: 1,
            // ...
        },
        Container2: {
            name: "Sample",
            id: "sample-tool",
            priority: 2,
            // ...
        },
        Container3: {
            name: "Sample",
            id: "sample-tool",
            priority: 3,
            // ...
        }
    }
});
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

- **showIn**: can be used to add a plugin to a container or more than one, in addition to the default one (it is an array of container plugin names)
- **hideFrom**: can be used to exclude a plugin from a given container or more than one (it is an array of container plugin names)
- **doNotHide**: can be used to show a plugin in the root container, in addition to the default one
- **alwaysRender**: can be used to always renders the component in the given container, regardless the priority

Note that also these properties accept dynamic expressions.

`js/plugins/Container.jsx`

```javascript
import React from "react";
import PropTypes from "prop-types";

import { createPlugin } from "@mapstore/utils/PluginsUtils";

const Container = ({
    items
}) => {
    const style = {
        zIndex: 1000,
        border: "solid black 1px",
        width: "200px",
        height: "200px",
        position: "absolute",
        top: "100px",
        left: "100px"
    };
    return (
        <div style={style}>
            {items.map(item => {
                // item.plugin is the plugin ReactJS component
                const Item = item.plugin;
                return (
                    <Item
                        key={item.id}
                        id={item.id}
                        name={item.name}
                    />
                );
            })}
        </div>
    );
};

Container.propTypes = {
    items: PropTypes.array
};

Container.defaultProps = {
    items: []
};

export default createPlugin("Container", {
    component: Container
});
```

`js/plugins/ContainerOther.jsx`

```javascript
import React from "react";
import PropTypes from "prop-types";

import { createPlugin } from "@mapstore/utils/PluginsUtils";

const ContainerOther = ({
    items
}) => {
    const style = {
        zIndex: 1000,
        border: "solid red 1px",
        width: "200px",
        height: "200px",
        position: "absolute",
        top: "100px",
        left: "100px"
    };
    return (
        <div style={style}>
            {items.map(item => {
                // item.plugin is the plugin ReactJS component
                const Item = item.plugin;
                return (
                    <Item
                        key={item.id}
                        id={item.id}
                        name={item.name}
                    />
                );
            })}
        </div>
    );
};

ContainerOther.propTypes = {
    items: PropTypes.array
};

ContainerOther.defaultProps = {
    items: []
};

export default createPlugin("ContainerOther", {
    component: ContainerOther
});
```

`js/plugins/Sample.jsx`

```javascript
import React from "react";
import { createPlugin } from "@mapstore/utils/PluginsUtils";

const Sample = () => {
    return (
        <div>Hello</div>
    );
};

export default createPlugin("Sample", {
    component: Sample,
    containers: {
        Container: {
            name: "Sample",
            id: "sample-tool",
            priority: 1
        },
        ContainerOther: {
            name: "Sample",
            id: "sample-tool",
            priority: 1
        }
    }
});
```

With this configuration the sample plugin will be shown in both Container and ContainerOther plugins (they have the same priority, so both are picked).

We can change this using `showIn` or `hideFrom` in `localConfig.json`:

#### localConfig.json - `showIn` and `hideFrom` examples

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
```

or

```javascript
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

#### localConfig.json - `doNotHide` example

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

Dynamic expression can also be used to enable a plugin only when a specific application state is met, using the **disablePluginIf** property.

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

You can lazy load your plugins components using the react lazy and Suspense API. This is especially useful for plugins that include components with big external libraries.

`js/plugins/Sample.jsx`

```javascript
import React, { useState, lazy, Suspense } from "react";
import { createPlugin } from "@mapstore/utils/PluginsUtils";
const LazySampleComponent = lazy(() => import("@js/components/LazySampleComponent"));

const Sample = () => {
    // this local state could be moved to redux state
    // as explained in previous sections
    const [enabled, setEnabled] = useState(false);
    const style = {
        position: "absolute",
        top: 100,
        left: 100,
        zIndex: 2000
    };
    return (
        <div style={style}>
            <button onClick={() => setEnabled(enabled)}>Load plugin</button>
            {enabled
                ? <Suspense fallback="Loading...">
                    <LazySampleComponent />
                </Suspense>
                : null}
        </div>
    );
};

export default createPlugin("Sample", {
    component: Sample
});
```

## Testing plugins

As we already mentioned a plugin is a collection of entities that should already have unit tests (components, reducers, actions, selectors, epics).
We can limit plugins testing to testing the interactions between these different entities, for example:

- connection of the redux state to the plugins properties
- epics that are related to the plugin lifecycle
- containment relations between plugins

To ease writing a plugin unit test, an helper is available (pluginsTestUtils) that can be used to:

- create a plugin connected with a redux store (**getPluginForTest**), initialized with plugin's defined reducers and epics, and with a given initial state
- get access to the redux store
- get access to the list of actions dispatched to the store
- get access to the list of containers plugins supported by the plugin (you can limit this list by passing your plugins definitions to getPluginForTest)

### Examples

`js/plugins/__tests__/MyPlugin-test.js`

```javascript
import expect from "expect";
import React from "react";
import ReactDOM from "react-dom";

import MyPlugin from "../MyPlugin";
import { getPluginForTest } from "@mapstore/plugins/__tests__/pluginsTestUtils";

const initialState = {};

describe("MyPlugin Test", () => {
    beforeEach((done) => {
        document.body.innerHTML = "<div id=\"container\"></div>";
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = "";
        setTimeout(done);
    });

    it("creates MyPlugin with default configuration", () => {
        const {Plugin, store, actions, containers } = getPluginForTest(MyPlugin, initialState);
        ReactDOM.render(<Plugin />, document.getElementById("container"));
        expect(document.getElementById("<my plugin id>")).toBeTruthy();
        expect(...);
    });
    // use pluginCfg to override plugins properties
    it("creates MyPlugin with custom configuration", () => {
        const {Plugin, store, actions, containers } = getPluginForTest(MyPlugin, initialState);
        ReactDOM.render(<Plugin pluginCfg={{
            property: "value"
        }}/>, document.getElementById("container"));
        expect(document.getElementById("<my plugin id>")).toBeTruthy();
        expect(...);
    });

    // test connected epics looking at the actions array
    it("test plugin epics", () => {
        const {Plugin, store, actions, containers } = getPluginForTest(MyPlugin, initialState);
        ReactDOM.render(<Plugin/>, document.getElementById("container"));
        store.dispatch({
            type: ACTION_CAPTURED_BY_AN_EPIC,
            payload
        });
        expect(actions.filter(action => action.type === ACTION_LAUNCHED_BY_AN_EPIC).length).toBe(1);
    });

    // test supported containers
    it("test containers", () => {
        const {Plugin, store, actions, containers } = getPluginForTest(MyPlugin, initialState, {
            MyContainerPlugin: {}
        });
        ReactDOM.render(<Plugin/>, document.getElementById("container"));
        expect(Object.keys(containers)).toContain("MyContainer");
    });
});

```

## General Guidelines

### Components

- Define the plugin component(s) into dedicated JSX file(s), so that they can be reused outside of the plugin
- Connect the component(s) in the plugin JSX file

### State

- Define your own state fragment (and related actions and reducers) to handle internal state, and use existing actions and state fragments from MapStore2 to interact with the framework

### Selectors

- Use existing selectors when possible to connect the state, eventually using reselect to compose them together or with your own selectors

### General

- Avoid as much as possible direct interactions between different plugins; plugins are meant to be independent modules, so they should be able to work if other plugins appear / disappear from the application configuration
- Interact with other plugins and the application itself using actions and state sharing
- Creating side effects to make plugins interact in more strict ways should not be done at the plugin level, orchestrating different plugins should be delegated at the top (application) level
- Use containers configuration to combine plugins in containers
