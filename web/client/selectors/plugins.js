/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Check if an entry in localConfig is configured for a specific entry of `plugins`
 * @param {string} entry the name of the entry
 * @return {function} a selector that returns true if the entry exists, false otherwise
 */
export const isPageConfigured = plugin => state => state.localConfig && state.localConfig.plugins && !!state.localConfig.plugins[plugin];

