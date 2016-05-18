/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const ReactDOM = require('react-dom');

const ConfigUtils = require('../../utils/ConfigUtils');
const LocaleUtils = require('../../utils/LocaleUtils');
const PluginsUtils = require('../../utils/PluginsUtils');

const {changeBrowserProperties} = require('../../actions/browser');
const {loadMapConfig} = require('../../actions/config');
const {loadLocale} = require('../../actions/locale');

const PluginsContainer = require('../../components/plugins/PluginsContainer');

const {plugins} = require('./plugins');
const pluginsCfg = require('./pluginsConfig');

const {Provider} = require('react-redux');

const {Input} = require('react-bootstrap');

const Debug = require('../../components/development/Debug');
const store = require('./store')(plugins);


const togglePlugin = (pluginName, callback) => {
    pluginsCfg.standard = pluginsCfg.standard.indexOf(pluginName) !== -1 ?
        pluginsCfg.standard.filter((plugin) => plugin !== pluginName) :
        [...pluginsCfg.standard, pluginName];
    callback();
};


const renderPlugins = (callback) => {
    return Object.keys(plugins).map((plugin) => {
        const pluginName = plugin.substring(0, plugin.length - 6);
        return (<li>
            <Input type="checkbox"
                checked={pluginsCfg.standard.indexOf(pluginName) !== -1}
                label={pluginName}
                onChange={togglePlugin.bind(null, pluginName, callback)}/>
        </li>);
    });
};

const isHidden = (plugin) => plugins[plugin + 'Plugin'][plugin + 'Plugin'].Toolbar && plugins[plugin + 'Plugin'][plugin + 'Plugin'].Toolbar.hide;

const getPluginsConfiguration = () => {
    return {
        standard: pluginsCfg.standard.map((plugin) => ({
            name: plugin,
            hide: isHidden(plugin)
        }))
    };
};

const renderPage = () => {
    ReactDOM.render(
        (
            <Provider store={store}>
                <Localized>
                    <div>
                        <div style={{position: "absolute", right: "75%", left: 0, height: "100%"}}>
                            <ul>
                                {renderPlugins(renderPage)}
                            </ul>
                        </div>
                        <div style={{position: "absolute", right: 0, left: "25%", height: "100%"}}>
                            <PluginsContainer params={{mapType: "leaflet"}} plugins={PluginsUtils.getPlugins(plugins)} pluginsConfig={getPluginsConfiguration()} mode="standard"/>
                        </div>
                        <Debug/>
                    </div>
                </Localized>
            </Provider>
        ),
        document.getElementById("container"));
};


ConfigUtils.loadConfiguration().then(() => {
    store.dispatch(changeBrowserProperties(ConfigUtils.getBrowserProperties()));

    const { configUrl, legacy } = ConfigUtils.getUserConfiguration('config', 'json');
    store.dispatch(loadMapConfig(configUrl, legacy));

    let locale = LocaleUtils.getUserLocale();
    store.dispatch(loadLocale('../../translations', locale));

    renderPage();
});
