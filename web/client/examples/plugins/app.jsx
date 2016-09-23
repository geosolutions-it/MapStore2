/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const startApp = () => {
    const React = require('react');
    const ReactDOM = require('react-dom');
    const {connect} = require('react-redux');

    const ConfigUtils = require('../../utils/ConfigUtils');
    const LocaleUtils = require('../../utils/LocaleUtils');
    const PluginsUtils = require('../../utils/PluginsUtils');

    const {changeBrowserProperties} = require('../../actions/browser');
    const {loadMapConfig} = require('../../actions/config');
    const {loadLocale} = require('../../actions/locale');
    const {loadPrintCapabilities} = require('../../actions/print');

    const PluginsContainer = connect((state) => ({
        pluginsState: state && state.controls || {}
    }))(require('../../components/plugins/PluginsContainer'));

    const {plugins} = require('./plugins');

    let pluginsCfg = {
        standard: ['Map', 'Toolbar']
    };

    let userCfg = {};

    const {Provider} = require('react-redux');

    const {Input} = require('react-bootstrap');

    const SaveAndLoad = require('./components/SaveAndLoad');

    const Debug = require('../../components/development/Debug');
    const store = require('./store')(plugins);

    const {savePluginConfig} = require('./actions/config');

    require('./assets/css/plugins.css');

    let mapType = 'leaflet';

    const Localized = connect((state) => ({
        messages: state.locale && state.locale.messages,
        locale: state.locale && state.locale.current,
        loadingError: state.locale && state.locale.localeError
    }))(require('../../components/I18N/Localized'));

    const togglePlugin = (pluginName, callback) => {
        pluginsCfg.standard = pluginsCfg.standard.indexOf(pluginName) !== -1 ?
            pluginsCfg.standard.filter((plugin) => plugin !== pluginName) :
            [...pluginsCfg.standard, pluginName];
        callback();
    };

    const configurePlugin = (pluginName, callback, cfg) => {
        try {
            userCfg[pluginName] = JSON.parse(cfg);
            store.dispatch(savePluginConfig(pluginName, userCfg[pluginName]));
        } catch(e) {
            /*eslint-disable */
            alert('Error in JSON');
            /*eslint-enable */
        }
        callback();
    };

    const PluginConfigurator = require('./components/PluginConfigurator');

    const renderPlugins = (callback) => {
        return Object.keys(plugins).map((plugin) => {
            const pluginName = plugin.substring(0, plugin.length - 6);
            return (<PluginConfigurator key={pluginName} pluginName={pluginName} pluginsCfg={pluginsCfg.standard}
                onToggle={togglePlugin.bind(null, pluginName, callback)}
                onApplyCfg={configurePlugin.bind(null, plugin, callback)}
                pluginConfig={userCfg[pluginName + 'Plugin'] && JSON.stringify(userCfg[pluginName + 'Plugin'], null, 2) || "{}"}
                />);
        });
    };

    const isHidden = (plugin) => plugins[plugin + 'Plugin'][plugin + 'Plugin'].Toolbar && plugins[plugin + 'Plugin'][plugin + 'Plugin'].Toolbar.hide;

    const getPluginsConfiguration = () => {
        return {
            standard: pluginsCfg.standard.map((plugin) => ({
                name: plugin,
                hide: isHidden(plugin),
                cfg: userCfg[plugin + 'Plugin'] || {}
            }))
        };
    };

    const assign = require('object-assign');

    const changeMapType = (callback, e) => {
        mapType = e.target.options[e.target.selectedIndex].value;
        callback();
    };

    const save = (callback, name) => {
        const state = assign({}, store.getState(), {
            map: assign({}, store.getState().map, {mapStateSource: null})
        });
        localStorage.setItem('mapstore.example.plugins.' + name, JSON.stringify({
            pluginsCfg,
            userCfg,
            mapType,
            state: state
        }));
        callback();
    };

    const load = (callback, name) => {
        const loaded = localStorage.getItem('mapstore.example.plugins.' + name);
        if (loaded) {
            const obj = JSON.parse(loaded);
            pluginsCfg = obj.pluginsCfg;
            userCfg = obj.userCfg;
            mapType = obj.mapType || mapType;
            if (obj.state) {
                store.dispatch({type: 'LOADED_STATE', state: obj.state});
            }
            callback();
        }
    };

    const renderPage = () => {
        ReactDOM.render(
            (
                <Provider store={store}>
                    <Localized>
                        <div style={{width: "100%", height: "100%"}}>
                            <div id="plugins-list" style={{position: "absolute", zIndex: "10000", backgroundColor: "white", width: "300px", left: 0, height: "100%", overflow: "auto"}}>
                                <h5>Configure application plugins</h5>
                                <Input value={mapType} type="select" bsSize="small" onChange={changeMapType.bind(null, renderPage)}>
                                    <option value="leaflet" key="leaflet">Leaflet</option>
                                    <option value="openlayers" key="openlayer">OpenLayers</option>
                                    <option value="cesium" key="cesium">CesiumJS</option>
                                </Input>
                                <SaveAndLoad onSave={save.bind(null, renderPage)} onLoad={load.bind(null, renderPage)}/>
                                <ul>
                                    {renderPlugins(renderPage)}
                                </ul>
                            </div>
                            <div style={{position: "absolute", right: 0, left: "300px", height: "100%"}}>
                                <PluginsContainer params={{mapType}} plugins={PluginsUtils.getPlugins(plugins)} pluginsConfig={getPluginsConfiguration()} mode="standard"/>
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

        store.dispatch(loadPrintCapabilities(ConfigUtils.getConfigProp('printUrl')));

        renderPage();
    });
};

if (!global.Intl ) {
    require.ensure(['intl', 'intl/locale-data/jsonp/en.js', 'intl/locale-data/jsonp/it.js'], (require) => {
        global.Intl = require('intl');
        require('intl/locale-data/jsonp/en.js');
        require('intl/locale-data/jsonp/it.js');
        startApp();
    });
} else {
    startApp();
}
