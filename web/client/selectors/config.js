/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

const loadAfterThemeSelector = (state) => state.localConfig && state.localConfig.loadAfterTheme;

/**
 * Returns the default coordinate format for coordinate editor
 * @param {object} state the state
 * @returns {number} the format as string
 */
const defaultCoordinateFormatSelector = (state) => state.localConfig && state.localConfig.defaultCoordinateFormat;


module.exports = {
    loadAfterThemeSelector,
    defaultCoordinateFormatSelector
};
