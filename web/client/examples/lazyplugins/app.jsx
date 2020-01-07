import React from "react";
import ReactDOM from "react-dom";
import PluginsContainer from "../../components/plugins/PluginsContainer";
import {Provider, connect} from "react-redux";
import {getPlugins, getReducers, getEpics} from "../../utils/PluginsUtils";
import {createStore, updateStore} from "../../utils/StateUtils";

import Theme from "../../components/theme/Theme";

import plugins from "./plugins";

const pluginsConfig = ["Map", "Toolbar", "ZoomIn", "ZoomOut", "Lazy", "Extension"];

const startApp = (loadedPlugins) => {
    const initialState = {
        lazy: {
            loaded: [],
            toRestore: loadedPlugins
        },
        map: {
            center: {
                x: 10.0,
                y: 43.0,
                crs: 'EPSG:4326'
            },
            zoom: 5
        },
        layers: [{
            type: 'osm'
        }]
    };
    const store = createStore({ reducers: getReducers(plugins), epics: getEpics(plugins), state: initialState });
    let extensionReducers = {};
    let extensionEpics = {};
    const updatePlugins = (name, plugin) => {
        if (plugin.reducers) {
            extensionReducers = { ...extensionReducers, ...plugin.reducers };
        }
        if (plugin.epics) {
            extensionEpics = { ...extensionEpics, ...plugin.epics };
        }
        updateStore({ reducers: { ...getReducers(plugins), ...extensionReducers }, epics: { ...getEpics(plugins), ...extensionEpics} });
    };

    store.subscribe(() => {
        localStorage.setItem('mapstore.examples.lazyplugins', JSON.stringify(store.getState().lazy.loaded.map(e => ({ name: e.name, status: e.status, uploaded: e.uploaded }))));
    });

    import(/* webpackChunkName: "extensions/index" */`./extensions`).then(extensions => {
        const Container = connect((state, ownProps) => ({
            pluginsState: { zoom: state.map && state.map.zoom },
            pluginsConfig: [...pluginsConfig, ...state.lazy.loaded.map(l => l.name)],
            plugins: {
                ...ownProps.plugins, ...state.lazy.loaded.reduce((previous, current) => {
                    if (current.status === 'SHOWN') {
                        return {
                            ...previous,
                            [current.name + "Plugin"]: current.plugin
                        };
                    }
                    return previous;
                }, {})
            }
        }))(PluginsContainer);

        const App = ({ mergedPlugins }) => {
            return (<Provider store={store}>
                <Theme version="noversion" path="../../dist/themes">
                    <Container plugins={mergedPlugins} onPluginLoaded={updatePlugins} />
                </Theme>
            </Provider>);
        };
        const merged = getPlugins({ ...plugins, ...extensions.default });
        ReactDOM.render(<App mergedPlugins={merged} />, document.getElementById("container"));
    });
};

const lastSaved = localStorage.getItem('mapstore.examples.lazyplugins');
let loaded = [];
if (lastSaved) {
    loaded = JSON.parse(lastSaved);
    startApp(loaded);
} else {
    startApp(loaded);
}
