/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { LOCAL_CONFIG_LOADED } from '../actions/localConfig';

import ConfigUtils from '../utils/ConfigUtils';
const initialState = ConfigUtils.getDefaults();
function controls(state = initialState, action) {
    switch (action.type) {
    case LOCAL_CONFIG_LOADED:
        return Object.assign({}, state, action.config);
    default:
        return state;
    }
}

export default controls;
