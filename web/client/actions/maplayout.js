/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

export const UPDATE_MAP_LAYOUT = 'MAP_LAYOUT:UPDATE_MAP_LAYOUT';
export const UPDATE_DOCK_PANELS = 'MAP_LAYOUT:UPDATE_DOCK_PANELS';
export const FORCE_UPDATE_MAP_LAYOUT = 'MAP_LAYOUT:FORCE_UPDATE_MAP_LAYOUT';

/**
 * updateMapLayout action, type `UPDATE_MAP_LAYOUT`
 * @memberof actions.mapLayout
 * @param  {object} layout style of the layout
 * @return {action} type `UPDATE_MAP_LAYOUT` with layout
 */
export function updateMapLayout(layout) {
    return {
        type: UPDATE_MAP_LAYOUT,
        layout
    };
}

/**
 * updateDockPanelsList action, type `UPDATE_DOCK_PANELS`
 * @memberof actions.mapLayout
 * @param name - name of the tool to add to the list or remove from the list
 * @param action {"add"|"remove"} - action to perform upon entry
 * @param location {"left"|"right"} - location of the dock panel
 * @returns {{action: string, location: string, type: string}}
 */
export function updateDockPanelsList(name, action = 'add', location = 'right') {
    return {
        type: UPDATE_DOCK_PANELS,
        name,
        action,
        location
    };
}

export function forceUpdateMapLayout() {
    return {
        type: FORCE_UPDATE_MAP_LAYOUT
    };
}

/**
 * Actions for map layout.
 * @name actions.mapLayout
 */
