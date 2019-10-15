/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */


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
