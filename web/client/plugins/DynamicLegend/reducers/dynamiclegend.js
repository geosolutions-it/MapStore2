/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
    SET_CONFIGURATION
} from "../actions/dynamiclegend";

const defaultState = {};

const dynamiclegend = (state = defaultState, action) => {
    switch (action.type) {
    case SET_CONFIGURATION:
        return {
            ...state,
            config: action.config
        };
    default:
        return state;
    }
};

export default dynamiclegend;
