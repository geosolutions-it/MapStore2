/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

export const SET_CONFIGURATION = 'DYNAMIC_LEGEND:SET_CONFIGURATION';

export const setConfiguration = (config) => ({
    type: SET_CONFIGURATION,
    config
});
