/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { MAP_CONFIG_LOADED } from '../../../actions/config';
import { UPDATE_TOC_CONFIG } from '../actions/toc';

function toc(state = {}, action) {
    switch (action.type) {
    case MAP_CONFIG_LOADED: {
        return {
            ...state,
            mapLoadedCount: (state.mapLoadedCount || 0) + 1,
            config: {
                ...action?.config?.toc
            }
        };
    }
    case UPDATE_TOC_CONFIG: {
        return {
            ...state,
            config: {
                ...state?.config,
                ...action.payload
            }
        };
    }
    default:
        return state;

    }
}

export default toc;
