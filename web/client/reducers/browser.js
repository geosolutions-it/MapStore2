/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { CHANGE_BROWSER_PROPERTIES } from '../actions/browser';

function browser(state = null, action) {
    switch (action.type) {
    case CHANGE_BROWSER_PROPERTIES: {
        return Object.assign({}, state,
            action.newProperties
        );
    }
    default:
        return state;
    }
}

export default browser;
