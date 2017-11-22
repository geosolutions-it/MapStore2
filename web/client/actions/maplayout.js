/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

const UPDATE_MAP_LAYOUT = 'MAP_LAYOUT:UPDATE_MAP_LAYOUT';

/**
 * updateMapLayout action, type `UPDATE_MAP_LAYOUT`
 * @memberof actions.mapLayout
 * @param  {object} layout style of the layout
 * @return {action} type `UPDATE_MAP_LAYOUT` with layout
 */
function updateMapLayout(layout) {
    return {
        type: UPDATE_MAP_LAYOUT,
        layout
    };
}

/**
 * Actions for map layout.
 * @name actions.mapLayout
 */
module.exports = {
    UPDATE_MAP_LAYOUT,
    updateMapLayout
};
