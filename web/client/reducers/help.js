/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { CHANGE_HELP_STATE, CHANGE_HELP_TEXT, CHANGE_HELPWIN_VIZ } from '../actions/help';

import assign from 'object-assign';

function help(state = null, action) {
    switch (action.type) {
    case CHANGE_HELP_STATE:
        return assign({}, state, {
            enabled: action.enabled
        });
    case CHANGE_HELP_TEXT: {
        return assign({}, state, {
            helpText: action.helpText
        });
    }
    case CHANGE_HELPWIN_VIZ: {
        return assign({}, state, {
            helpwinViz: action.helpwinViz
        });
    }
    default:
        return state;
    }
}

export default help;
