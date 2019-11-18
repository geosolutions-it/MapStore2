/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {SHOW_CONFIRMATION} from '../actions/backtopage';

export default (state = {
    showConfirm: false
}, action) => {
    switch (action.type) {
    case SHOW_CONFIRMATION: {
        return {...state, showConfirm: action.show};
    }
    default:
        return state;
    }
};
