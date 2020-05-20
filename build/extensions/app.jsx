import React from "react";
import ReactDOM from "react-dom";
import PluginsContainer from "../../web/client/components/plugins/PluginsContainer";
import {Provider, connect} from "react-redux";
import { getPlugins, getReducers, getEpics } from "../../web/client/utils/PluginsUtils";
import { createStore, updateStore } from "../../web/client/utils/StateUtils";

import Theme from "../../web/client/components/theme/Theme";
import Localized from "../../web/client/components/I18N/Localized";

import plugins from "./plugins";
import rootTranslations from "../../web/client/translations/data.en-US.json";
import bundleTranslations from "./bundle/translations/data.en-US.json";

const pluginsConfig = ["Map", "Toolbar", "ZoomIn", "ZoomOut", "SampleExtension"];
const LOCALE = "en-US";

const startApp = (messages) => {
    const initialState = {
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
        updateStore({ reducers: { ...getReducers(plugins), ...extensionReducers }, epics: { ...getEpics(plugins), ...extensionEpics } });
    };
    import(/* webpackChunkName: "extensions/index" */`./extensions`).then(extensions => {
        const Container = connect((state) => ({
            pluginsState: { zoom: state.map && state.map.zoom },
            pluginsConfig: pluginsConfig
        }))(PluginsContainer);

        const App = ({ mergedPlugins }) => {
            return (<Provider store={store}>
                <Localized messages={messages} locale={LOCALE}>
                    <Theme version="noversion" path="../../dist/themes">
                        <Container plugins={mergedPlugins} onPluginLoaded={updatePlugins}/>
                    </Theme>
                </Localized>
            </Provider>);
        };
        const merged = getPlugins({ ...plugins, ...extensions.default });
        ReactDOM.render(<App mergedPlugins={merged} />, document.getElementById("container"));
    });
};
startApp({...rootTranslations.messages, ...bundleTranslations.messages});
