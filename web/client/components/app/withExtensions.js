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
import castArray from 'lodash/castArray';
import axios from '../../libs/ajax';
import ConfigUtils from '../../utils/ConfigUtils';
import PluginsUtils from '../../utils/PluginsUtils';
import { augmentStore } from '../../utils/StateUtils';
import { LOAD_EXTENSIONS, PLUGIN_UNINSTALLED } from '../../actions/contextcreator';

/**
 * This HOC adds to StandardApp (or whatever customization) the
 * possibility to dynamically load extensions. For more info see
 * MapStore developer documentation about extensions.
 * @param {Component} AppComponent the App component
 * @returns the App component that loads the extensions. The new component accepts the additional prop `enableExtensions` that can be set to `false` if need to disable this loading.
 */
function withExtensions(AppComponent) {

    class WithExtensions extends Component {

        static propTypes = {
            pluginsDef: PropTypes.object,
            enableExtensions: PropTypes.bool,
            onInit: PropTypes.func
        };

        static defaultProps = {
            pluginsDef: { plugins: {}, requires: {} },
            enableExtensions: true
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

        /**
         * Updates the internal list of dynamically loaded extensions.
         * Also takes care of properly enabling the related assets (e.g. new translations paths)         * @param {*} plugins
         *
         * @param {object} plugins extensions definition object
         * @param {array} translations list of extensions related translations paths
         * @param {*} store application redux store, used to dispatch reloading localized messages if needed
         */
        onPluginsLoaded = (plugins, translations, store) => {
            this.setState({
                pluginsRegistry: plugins
            });
            if (translations.length > 0) {
                ConfigUtils.setConfigProp("translationsPath", [...castArray(ConfigUtils.getConfigProp("translationsPath")), ...translations.map(this.getAssetPath)]);
            }
            const locale =  ConfigUtils.getConfigProp('locale');
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
                        this.removeExtension(action.plugin, action.cfg?.translations);
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

        /**
         * Removes the given extension from configuration, taking
         * care of the related assets too.
         *
         * @param {string} name of the plugin to be removed
         * @param {*} translations translations path used by the extension, if any
         */
        removeExtension = (plugin, translations) => {
            this.setState({
                removedPlugins: [...this.state.removedPlugins, plugin + "Plugin"] // TODO: check
            });
            if (translations) {
                // remove extension's translation paths from the actual list
                const translationsPath = ConfigUtils.getConfigProp("translationsPath");
                ConfigUtils.setConfigProp("translationsPath",
                    castArray(translationsPath).filter(p => p !== this.getAssetPath(translations)));
            }
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
                        return PluginsUtils.loadPlugin(bundlePath, pluginName).then((loaded) => {
                            const impl = loaded.plugin?.default ?? loaded.plugin;
                            augmentStore({ reducers: impl?.reducers ?? {}, epics: impl?.epics ?? {} });
                            const pluginDef = {
                                [pluginName + "Plugin"]: {
                                    [pluginName + "Plugin"]: {
                                        loadPlugin: (resolve) => {
                                            resolve(impl);
                                        }
                                    }
                                }
                            };
                            return { plugin: pluginDef, translations: plugins[pluginName].translations || "" };
                        }).catch(e => {
                            // log the errors before re-throwing
                            console.error(`Error loading MapStore extension "${pluginName}":`, e); // eslint-disable-line
                            return null;
                        });
                    })).then((loaded) => {
                        callback(
                            loaded
                                .filter(l => l !== null) // exclude extensions that triggered errors
                                .reduce((previous, current) => {
                                    return { ...previous, ...current.plugin };
                                }, {}),
                            loaded
                                .filter(l => l !== null) // exclude extensions that triggered errors
                                .map(p => p.translations).filter(p => p !== ""));
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
