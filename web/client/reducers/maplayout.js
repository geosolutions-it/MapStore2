/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { UPDATE_MAP_LAYOUT } from '../actions/maplayout';

import assign from 'object-assign';

function mapLayout(state = { layout: {}, boundingMapRect: {} }, action) {
    switch (action.type) {
    case UPDATE_MAP_LAYOUT: {
        const {boundingMapRect = {}, ...layout} = action.layout;
        return assign({}, state, {layout: assign({}, layout, layout), boundingMapRect: {...boundingMapRect}});
    }
    default:
        return state;
    }
}

export default mapLayout;
