/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
    SHOW, HIDE
} from '../actions/mapEditor';

import { compose, set } from '../utils/ImmutableUtils';

export const DEFAULT_STATE = {};

export default (state = DEFAULT_STATE, action) => {
    switch (action.type) {
    case SHOW:
        return compose(
            set('open', true),
            set('owner', action.owner),
        )(state);
    case HIDE:
        return compose(
            set('open', false),
            set('owner', undefined),
        )(state);
    default:
        return state;
    }
};
