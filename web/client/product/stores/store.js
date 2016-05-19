/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const assign = require('object-assign');

const {mapConfigHistory, createHistory} = require('../../utils/MapHistoryUtils');

const map = mapConfigHistory(require('../../reducers/map'));

const layers = require('../../reducers/layers');
const mapConfig = require('../../reducers/config');

const DebugUtils = require('../../utils/DebugUtils');
const {combineReducers} = require('../../utils/PluginsUtils');

const LayersUtils = require('../../utils/LayersUtils');
const {CHANGE_BROWSER_PROPERTIES} = require('../../actions/browser');
const baseControls = require('../../reducers/controls');
const controls = require('../reducers/controls');

module.exports = (plugins) => {
    const allReducers = combineReducers(plugins, {
        home: require('../reducers/home'),
        locale: require('../../reducers/locale'),
        maps: require('../../reducers/maps'),
        browser: require('../../reducers/browser'),
        controls: () => {return null; },
        help: require('../../reducers/help'),
        map: () => {return null; },
        mapInitialConfig: () => {return null; },
        layers: () => {return null; }
    });
    const defaultState = {mousePosition: {enabled: false}};
    const mobileOverride = {mapInfo: {enabled: true, infoFormat: 'text/html' }, mousePosition: {enabled: true, crs: "EPSG:4326", showCenter: true}};

    const rootReducer = (state, action) => {
        let mapState = createHistory(LayersUtils.splitMapAndLayers(mapConfig(state, action)));
        let newState = {
            ...allReducers(state, action),
            controls: baseControls(controls(state.controls, action), action),
            map: mapState && mapState.map ? map(mapState.map, action) : null,
            mapInitialConfig: mapState ? mapState.mapInitialConfig : null,
            layers: mapState ? layers(mapState.layers, action) : null
        };
        if (action && action.type === CHANGE_BROWSER_PROPERTIES && newState.browser.mobile) {
            newState = assign(newState, mobileOverride);
        }

        return newState;
    };
    return DebugUtils.createDebugStore(rootReducer, defaultState);
};
