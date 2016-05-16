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

const {loadMapConfig} = require('../../actions/config');
const {loadLocale} = require('../../actions/locale');

const PluginsContainer = require('../../components/plugins/PluginsContainer');

const {plugins} = require('./plugins');
const pluginsCfg = require('./pluginsConfig');

const store = require('./store')(plugins);

ConfigUtils.loadConfiguration().then(() => {
    const { configUrl, legacy } = ConfigUtils.getUserConfiguration('config', 'json');
    store.dispatch(loadMapConfig(configUrl, legacy));

    let locale = LocaleUtils.getUserLocale();
    store.dispatch(loadLocale('../../translations', locale));

    ReactDOM.render(<PluginsContainer plugins={PluginsUtils.getPlugins(plugins)} pluginsConfig={pluginsCfg} mode="standard"/>, document.getElementById("container"));
});
