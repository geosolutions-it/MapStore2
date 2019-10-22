/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { createSelector } from 'reselect';
import { monitorStateSelector } from './localConfig';
import { get } from 'lodash';
import ConfigUtils from '../utils/ConfigUtils';


import { getMonitoredState } from '../utils/PluginsUtils';
/**
 * Selects the current context
 * @param {object} state the state
 * @returns {object} the current context
 */
export const currentContextSelector = state => state.context && state.context.currentContext;

/**
 * Implementation of monitoredState using the state for localConfig, instead of ConfigUtils.getM
 * @param {object} state the state
 * @returns the monitored state string
 */
const monitoredStateSelector = state => getMonitoredState(state, monitorStateSelector(state));

export const isLoadingSelector = state => get(state, 'loading');
export const isErrorSelector = () => false;
export const defaultPluginsSelector = createSelector(
    () => ConfigUtils.getConfigProp("plugins").desktop,
    plugins => ({ desktop: [...plugins, "Context"] } )
);
export const loadingPluginsSelector = state => defaultPluginsSelector(state);
export const errorPluginsSelector = state => loadingPluginsSelector(state);
export const currentPluginsSelector = state => get(currentContextSelector(state), "plugins");

export const pluginsSelector = state =>
    isLoadingSelector(state)
        ? loadingPluginsSelector(state)
        : isErrorSelector(state)
            ? errorPluginsSelector(state)
            : currentPluginsSelector(state) || defaultPluginsSelector(state);
/*
 * Adds the current context to the monitoredState. To update on every change of it.
 */
export const contextMonitoredStateSelector = createSelector(
    monitoredStateSelector,
    (monitoredState) => JSON.stringify(monitoredState)
);
