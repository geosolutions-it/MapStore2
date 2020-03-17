/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { createSelector } from 'reselect';
import { monitorStateSelector } from './localConfig';
import { get, findIndex } from 'lodash';
import ConfigUtils from '../utils/ConfigUtils';


import { getMonitoredState } from '../utils/PluginsUtils';
/**
 * Selects the current context
 * @param {object} state the state
 * @returns {object} the current context
 */
export const currentContextSelector = state => state.context && state.context.currentContext;

export const contextResourceSelector = state => state.context && state.context.resource;

export const currentTitleSelector = state => state.context && state.context.currentContext && state.context.currentContext.windowTitle;

/**
 * Implementation of monitoredState using the state for localConfig, instead of ConfigUtils.getM
 * @param {object} state the state
 * @returns the monitored state string
 */
const monitoredStateSelector = state => getMonitoredState(state, monitorStateSelector(state));

export const isLoadingSelector = state => get(state, 'context.loading');
export const loadFlagsSelector = state => get(state, 'context.loadFlags');

/**
 * returns the default plugins for context. By default always adds the Context plugin
 * (context plugin now provides epics and reducers, they should be anyway loaded)
 */
export const defaultPluginsSelector = createSelector(
    () => get(ConfigUtils.getConfigProp("plugins"), 'desktop'),
    (plugins = []) => ({ desktop: [...plugins, "Context"] } )
);
export const loadingPluginsSelector = state => defaultPluginsSelector(state);
export const errorPluginsSelector = state => loadingPluginsSelector(state);
export const userPluginsSelector = state => get(currentContextSelector(state), "userPlugins");
export const contextPluginsSelector = state => get(currentContextSelector(state), "plugins");
export const currentPluginsSelector = createSelector(
    contextPluginsSelector,
    userPluginsSelector,
    (plugins, userPlugins = []) =>
        plugins && ({ desktop: [...get(plugins, 'desktop', []), ...userPlugins.filter(plugin => plugin.active)] })
);

export const templatesSelector = createSelector(
    currentContextSelector,
    (context = {}) => context.templates
);

/**
 * Selects the plugins configuration depending on the current state.
 * It loads the defaultPlugins, the loadingPlugins, the errorPlugins or the contextPlugins.
 * For the moment in case of loading or error it loads default plugins from localConfig.
 *
 * @param {object} state the application state
 */
export const pluginsSelector = state =>
    isLoadingSelector(state)
        ? loadingPluginsSelector(state)
        : currentPluginsSelector(state) || defaultPluginsSelector(state);

/**
 * Creates a selector that will return true if mapstore currently has a context active,
 * and it has a specific plugin activated
 * @param {string} pluginName plugin name
 */
export const isPluginInContext = pluginName => createSelector(
    currentContextSelector,
    pluginsSelector,
    (currentContext, contextPlugins = {}) => !currentContext ||
        findIndex(get(contextPlugins, 'desktop', []), plugin => plugin.name === pluginName) > -1
);

/*
 * Adds the current context to the monitoredState. To update on every change of it.
 */
export const contextMonitoredStateSelector = createSelector(
    monitoredStateSelector,
    (monitoredState) => JSON.stringify(monitoredState)
);

/**
 * Returns the full resource. Accordingly with stories, dashboards and so on,
 * this content is the original resource, with id, permission (canRead, canWrite) and attributes.
 * @param {object} state the app state
 */
export const resourceSelector = ({context = {}} = {}) => context.resource;
