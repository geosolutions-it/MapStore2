/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

export const CHANGE_CRS_INPUT_VALUE = 'CHANGE_CRS_INPUT_VALUE';
export const SET_PROJECTIONS_CONFIG = 'SET_PROJECTIONS_CONFIG';

export function setInputValue(value) {
    return {
        type: CHANGE_CRS_INPUT_VALUE,
        value
    };
}

export function setProjectionsConfig(config) {
    return {
        type: SET_PROJECTIONS_CONFIG,
        config
    };
}
