/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {get} from 'lodash';

/**
 * selector for localConfig from application state
 * @param {object} state the state
 * @return {object} localConfig loaded
 */
export const localConfigSelector = state => state.localConfig;

/**
 * Returns the monitor state array configured in localConfig
 * @param {object} state the state
 * @returns {array} the monitor state array
 */
export const monitorStateSelector = state => (localConfigSelector(state) || {}).monitorState;

export const pluginsObjectSelector = state => get(localConfigSelector(state), `plugins`);

/**
 * Creates a selector to get the plugins from localConfig where
 * @param {string} page the page of the plugins for which we want to get the plugins (desktop, mobile, maps...)
 */
export const pluginsSelectorCreator = (page) => state => get(pluginsObjectSelector(state), page);

/**
 * Returns a delay for the floating identify tool
 * @param {object} state the state
 * @returns {number} the delay in ms
 */
export const floatingIdentifyDelaySelector = state => get(localConfigSelector(state), 'defaultMapOptions.floatingIdentifyDelay', 500);
