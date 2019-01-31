# Creating a MapStore2 plugin
The MapStore2 [plugins architecture](plugins-architecture) allows building your own idenpendent modules that will integrate seamlessly into your project.

Creating a plugin is like assembling and connecting several pieces together into an atomic module. This happens by writing a plugin module (a ReactJS JSX file exporting the plugin descriptor).

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
};
```
Being a component with a name (**Sample** in our case) you can include it in your project editing the project *plugins.js* file:

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

And configure it properly so that is enabled in one or more [application modes](application-modes) / [pages](application-pages):

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
Side effects should be limited as much as possible, but there are use cases where a side effect cannot be avoided.
In particular all asynchronous operations are side effects in Redux, but we obviously need to handle them, in particular we need to asynchronously load the data that we need from ore or more web service.

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

## Plugins for other plugins
Till now, we have learned how to build a plugin that is not connected to any other plugin.
It is also possible to define plugins that can be contained in other plugins.

### ContainedComponent.jsx
```javascript
const {connect} = require('react-redux');

const SampleComponent = ({text) => {
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
    Toolbar: { // container
        name: "Sample",
        position: 3,
        ...
    }
};
```

Each section defines a possible container for the plugin, as the name of another plugin (*Toolbar* in the example). The properties in it define the plugin behaviour in relation to the container (e.g. position of the tool in the Toolbar).

Notice that also container related properties can be overridden in the application configuration, using the override property:

### localConfig.json
```javascript
{
    ...
    "plugins": {
        "desktop": [{
            "name": "Sample",
            "override": {
                "Toolbar": {
                    "position": 4
                }
            }
        }, ...],
        ...
    }
}
```

## General Guidelines
 * Components
    * define the plugin component(s) into dedicated JSX file(s), so that they can be reused outside of the plugin
    * connect the component(s) in the plugin JSX file
 * State
    * define your own state fragment (and related actions and reducers) to handle internal state, and use existing actions and state fragments from MapStore2 to interact with the framework
 * Selectors
    * use existing selectors when possible to connect the state, eventually using reselect to compose them together or with your own selectors
    * define new selectors only if you use them more than once and move them to a selectors JS file
 * Avoid as much as possible direct interactions between different plugins; plugins are meant to be indipendent modules, so they should be able to work if other plugins appear / disappear from the application configuration
   * interact with other plugins and the application itself using actions and state sharing
   * creating side effects to make plugins interact in more strict ways should not be done at the plugin level, orchestrating different plugins should be delegated at the top (application) level