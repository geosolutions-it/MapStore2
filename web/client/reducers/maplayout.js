/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {UPDATE_DOCK_PANELS, UPDATE_MAP_LAYOUT} from '../actions/maplayout';

const DEFAULT_RIGHT_DOCK_PANELS = ['mapCatalog', 'mapTemplates', 'metadataexplorer', 'userExtensions', 'details', 'GeoProcessing'];
const DEFAULT_LEFT_DOCK_PANELS = [];

/**
 * Manages the map layout state. Determines and manages the placement of the components on the screen
 * @prop {object} [layout] property helps in organizing the components on the screen (ex. Leaves space for the footer, move the navBar or the background selector when the Catalog or the TOC panel is open, respectively)
 * @prop {object} [boundingMapRect] property treated as "padding" of the map that allows to zoom taking into account the panels that overlaps (ex. Catalog, Feature Grid)
 *
 * @memberof reducers
 */
function mapLayout(state = { layout: {}, boundingMapRect: {}, boundingSidebarRect: {}, dockPanels: { left: DEFAULT_LEFT_DOCK_PANELS, right: DEFAULT_RIGHT_DOCK_PANELS } }, action) {
    switch (action.type) {
    case UPDATE_MAP_LAYOUT: {
        const {boundingMapRect = {}, boundingSidebarRect = {}, ...layout} = action.layout;
        return Object.assign({}, state, {layout: Object.assign({}, layout, layout), boundingMapRect: {...boundingMapRect}, boundingSidebarRect: {...boundingSidebarRect}});
    }
    case UPDATE_DOCK_PANELS: {
        const {name, action: operation, location} = action;
        switch (operation) {
        case 'add':
            return {
                ...state,
                dockPanels: {
                    left: location === 'left' ? ((state.dockPanels.left).includes(name) ? state.dockPanels.left : [...state.dockPanels.left, name]) : state.dockPanels.left,
                    right: location === 'right' ? ((state.dockPanels.right).includes(name) ? state.dockPanels.right : [...state.dockPanels.right, name]) : state.dockPanels.right
                }
            };
        default:
            const position = location === 'left' ? state.dockPanels.left.indexOf(name) : state.dockPanels.right.indexOf(name);
            const exists = position !== -1;
            return {
                ...state,
                dockPanels: {
                    left: location === 'left' ? (!exists ? state.dockPanels.left : state.dockPanels.left.filter(item => item !== name)) : state.dockPanels.left,
                    right: location === 'right' ? (!exists ? state.dockPanels.right : state.dockPanels.right.filter(item => item !== name)) : state.dockPanels.right
                }
            };
        }
    }
    default:
        return state;
    }
}

export default mapLayout;
