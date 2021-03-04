/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { CHANGE_BROWSER_PROPERTIES } from '../actions/browser';

import layersEpics from '../epics/layers';
import controlsEpics from '../epics/controls';
import * as configEpics from '../epics/config';
import timeManagerEpics from '../epics/dimension';
import mapTypeEpics from '../epics/maptype';


import layers from '../reducers/layers';
import mapConfig from '../reducers/config';
import controls from '../reducers/controls';
import theme from '../reducers/theme';
import help from '../reducers/help';
import mapReducer from '../reducers/map';

import { mapConfigHistory, createHistory } from '../utils/MapHistoryUtils';
import { splitMapAndLayers } from '../utils/LayersUtils';

const map = mapConfigHistory(mapReducer);

export const standardReducers = {
    controls,
    theme,
    help,
    map: () => null,
    mapInitialConfig: () => null,
    mapConfigRawData: () => null,
    layers: () => null
};

export const standardEpics = {
    ...layersEpics,
    ...controlsEpics,
    ...timeManagerEpics,
    ...configEpics,
    ...mapTypeEpics // these are related to product routing so they should not to be included as baseEpics (maptype reducer instead is in baseEpics)
};

/**
 * default `rootReducerFunc` for MapStore
 * - Adds history for map (separating `map` from `layers` state)
 * - Adds `mapInitialConfig`
 * - Allow to override the state with `mapInitialConfig` and `mapConfigRawData`
 */
export const standardRootReducerFunc = ({
    state,
    action,
    allReducers,
    mobileOverride
}) => {
    let mapState = createHistory(splitMapAndLayers(mapConfig(state, action)));
    let newState = {
        ...allReducers(state, action),
        map: mapState && mapState.map ? map(mapState.map, action) : null,
        mapInitialConfig: mapState && mapState.mapInitialConfig || mapState && mapState.loadingError && {
            loadingError: mapState.loadingError,
            mapId: mapState.loadingError.mapId
        } || null,
        mapConfigRawData: mapState && mapState.mapConfigRawData || null,
        layers: mapState ? layers(mapState.layers, action) : null
    };
    if (action && action.type === CHANGE_BROWSER_PROPERTIES && newState.browser.mobile) {
        newState = { ...newState, ...mobileOverride };
    }
    return newState;
};

export default {
    standardReducers,
    standardEpics,
    standardRootReducerFunc
};
