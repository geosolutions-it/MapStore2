/**
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
    SET_FILTER_RELOAD_DELAY,
    TRIGGER_RELOAD
} from '../actions/mapcatalog';

import { set } from '../utils/ImmutableUtils';


/**
 * Manages the state of the MapCatalog plugin
 * @prop {boolean} triggerReloadValue triggers the reload of maps with current search text
 * @memberof reducers
 */
export default (state = {}, action) => {
    switch (action.type) {
    case SET_FILTER_RELOAD_DELAY: {
        return set('filterReloadDelay', action.delay, state);
    }
    case TRIGGER_RELOAD: {
        return set('triggerReloadValue', !(state.triggerReloadValue || false), state);
    }
    default:
        return state;
    }
};
