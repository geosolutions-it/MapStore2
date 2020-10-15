/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { loadLocale } from '../../actions/locale';
import LocaleUtils from '../../utils/LocaleUtils';
import castArray from 'lodash/castArray';
import axios from '../../libs/ajax';
import ConfigUtils from '../../utils/ConfigUtils';
import PluginsUtils from '../../utils/PluginsUtils';
import { augmentStore } from '../../utils/StateUtils';
import { LOAD_EXTENSIONS, PLUGIN_UNINSTALLED } from '../../actions/contextcreator';

function withExtensions(AppComponent) {

    class WithExtensions extends Component {

        static propTypes = {
            pluginsDef: PropTypes.object,
            enableExtensions: PropTypes.bool,
            onInit: PropTypes.func
        };

        static defaultProps = {
            pluginsDef: { plugins: {}, requires: {} },
            enableExtensions: false
        };

        state = {
            pluginsRegistry: {},
            removedPlugins: []
        };

        shouldComponentUpdate(nextProps, nextState) {
            if (this.state.pluginsRegistry !== nextState.pluginsRegistry) {
                return true;
            }
            if (this.props.pluginsDef !== nextProps.pluginsDef) {
                return true;
            }
            return false;
        }

        onPluginsLoaded = (plugins, translations, store) => {
            this.setState({
                pluginsRegistry: plugins
            });
            if (translations.length > 0) {
                ConfigUtils.setConfigProp("translationsPath", [...castArray(ConfigUtils.getConfigProp("translationsPath")), ...translations.map(this.getAssetPath)]);
            }
            const locale = LocaleUtils.getUserLocale();
            store.dispatch(loadLocale(null, locale));
        };

        onInit = (store, afterInit, config) => {
            if (store.addActionListener) {
                store.addActionListener((action) => {
                    if (action.type === LOAD_EXTENSIONS) {
                        this.loadExtensions(
                            ConfigUtils.getConfigProp('extensionsRegistry'),
                            (plugins, translations) => this.onPluginsLoaded(plugins, translations, store)
                        );
                    }
                    if (action.type === PLUGIN_UNINSTALLED) {
                        this.removeExtension(action.plugin);
                    }
                });
            }
            this.loadExtensions(ConfigUtils.getConfigProp('extensionsRegistry'), (plugins, translations) => {
                this.onPluginsLoaded(plugins, translations, store);
                if (this.props.onInit) {
                    this.props.onInit(store, afterInit, config);
                } else {
                    afterInit(config);
                }
            });
        };

        getAssetPath = (asset) => {
            return ConfigUtils.getConfigProp("extensionsFolder") + asset;
        };

        render() {
            const { plugins, requires } = this.props.pluginsDef;
            const pluginsDef = {
                plugins: {...plugins, ...this.filterRemoved(this.state.pluginsRegistry, this.state.removedPlugins)},
                requires
            };
            return (
                <AppComponent
                    {...this.props}
                    pluginsDef={pluginsDef}
                    onInit={this.onInit}
                />);
        }

        removeExtension = (plugin) => {
            this.setState({
                removedPlugins: [...this.state.removedPlugins, plugin + "Plugin"]
            });
        };

        filterRemoved = (registry, removed) => {
            return Object.keys(registry).reduce((acc, p) => {
                if (removed.indexOf(p) !== -1) {
                    return acc;
                }
                return {
                    ...acc,
                    [p]: registry[p]
                };
            }, {});
        };

        loadExtensions = (path, callback) => {
            if (this.props.enableExtensions) {
                return axios.get(path).then((response) => {
                    const plugins = response.data;
                    Promise.all(Object.keys(plugins).map((pluginName) => {
                        const bundlePath = this.getAssetPath(plugins[pluginName].bundle);
                        return PluginsUtils.loadPlugin(bundlePath).then((loaded) => {
                            return loaded.plugin.loadPlugin().then((impl) => {
                                augmentStore({ reducers: impl.reducers || {}, epics: impl.epics || {} });
                                const pluginDef = {
                                    [pluginName]: {
                                        [pluginName]: {
                                            loadPlugin: (resolve) => {
                                                resolve(impl);
                                            }
                                        }
                                    }
                                };
                                return { plugin: pluginDef, translations: plugins[pluginName].translations || "" };
                            });
                        });
                    })).then((loaded) => {
                        callback(loaded.reduce((previous, current) => {
                            return { ...previous, ...current.plugin };
                        }, {}), loaded.map(p => p.translations).filter(p => p !== ""));
                    }).catch(() => {
                        callback({}, []);
                    });
                }).catch(() => {
                    callback({}, []);
                });
            }
            return callback({}, []);
        };
    }

    return WithExtensions;
}

export default withExtensions;
