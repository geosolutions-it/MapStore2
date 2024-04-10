/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { LOCATION_CHANGE } from 'connected-react-router';

import {
    UPDATE_DETAILS
} from '../actions/details';

const details = (state = {}, action) => {
    switch (action.type) {
    case UPDATE_DETAILS: {
        return {...state, detailsText: action.detailsText, id: action.id};
    }
    case LOCATION_CHANGE: {
        return {...state, detailsText: ""};
    }
    default:
        return state;
    }
};

export default details;
