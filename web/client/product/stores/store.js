/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const {combineReducers} = require('redux');
const {isEqual} = require('lodash');
const assign = require('object-assign');

const undoable = require('redux-undo').default;
const mapConfigHistory = require('../../utils/MapHistory');

const map = mapConfigHistory(undoable(require('../../reducers/map'), {
    filter: (action, currentState, previousState) => {
        let bool = false;
        if (previousState && previousState.mapStateSource && previousState.mapStateSource === 'map'
                && previousState.center && previousState.zoom !== undefined) {
            // Check geometry part
            bool = !(isEqual(currentState.center, previousState.center) && currentState.zoom === previousState.zoom);
        }
        return bool;
    }
}));

const layers = require('../../reducers/layers');
const mapConfig = require('../../reducers/config');


const DebugUtils = require('../../utils/DebugUtils');
const {isArray} = require('lodash');
const LayersUtils = require('../../utils/LayersUtils');
const {CHANGE_BROWSER_PROPERTIES} = require('../../actions/browser');

const allReducers = combineReducers({
    home: require('../reducers/home'),
    locale: require('../../reducers/locale'),
    maps: require('../../reducers/maps'),
    browser: require('../../reducers/browser'),
    controls: require('../reducers/controls'),
    mapInfo: require('../../reducers/mapInfo'),
    help: require('../../reducers/help'),
    locate: require('../../reducers/locate'),
    search: require('../../reducers/search').searchResults,
    measurement: require('../../reducers/measurement'),
    snapshot: require('../../reducers/snapshot'),
    map: () => {return null; },
    layers: () => {return null; },
    mousePosition: require('../../reducers/mousePosition')
});
const mobileOverride = {mapInfo: {enabled: true, infoFormat: 'text/html' }, mousePosition: {enabled: true, crs: "EPSG:4326"}};

const rootReducer = (state, action) => {
    let mapState = mapConfig({
        map: state && state.map,
        layers: state && state.layers
    }, action);
    if (mapState && isArray(mapState.layers)) {
        let groups = LayersUtils.getLayersByGroup(mapState.layers);
        mapState.layers = {flat: LayersUtils.reorder(groups, mapState.layers), groups: groups};
    }
    if (mapState && mapState.map && mapState.map.center) {
        mapState.map = {
            past: [],
            present: mapState.map,
            future: []
        };
    }
    let newState = {
        ...allReducers(state, action),
        map: mapState && mapState.map ? map(mapState.map, action) : null,
        layers: mapState ? layers(mapState.layers, action) : null
    };
    if (action && action.type === CHANGE_BROWSER_PROPERTIES && newState.browser.touch) {
        newState = assign(newState, mobileOverride);
    }
    return newState;
};

module.exports = DebugUtils.createDebugStore(rootReducer, {});
