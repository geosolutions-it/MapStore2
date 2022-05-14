/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { UPDATE_MAP_LAYOUT } from '../actions/maplayout';

import assign from 'object-assign';

/**
 * Manages the map layout state. Determines and manages the placement of the components on the screen
 * @prop {object} [layout] property helps in organizing the components on the screen (ex. Leaves space for the footer, move the navBar or the background selector when the Catalog or the TOC panel is open, respectively)
 * @prop {object} [boundingMapRect] property treated as "padding" of the map that allows to zoom taking into account the panels that overlaps (ex. Catalog, Feature Grid)
 *
 * @memberof reducers
 */
function mapLayout(state = { layout: {}, boundingMapRect: {}, boundingSidebarRect: {} }, action) {
    switch (action.type) {
    case UPDATE_MAP_LAYOUT: {
        const {boundingMapRect = {}, boundingSidebarRect = {}, ...layout} = action.layout;
        return assign({}, state, {layout: assign({}, layout, layout), boundingMapRect: {...boundingMapRect}, boundingSidebarRect: {...boundingSidebarRect}});
    }
    default:
        return state;
    }
}

export default mapLayout;
