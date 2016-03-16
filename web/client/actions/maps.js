/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var GeoStoreApi = require('../api/GeoStoreDAO');

const MAPS_LIST_LOADED = 'MAPS_LIST_LOADED';
const MAPS_LIST_LOAD_ERROR = 'MAPS_LIST_LOAD_ERROR';

function mapsLoaded(maps) {
    return {
        type: MAPS_LIST_LOADED,
        maps: maps
    };
}

function loadError(e) {
    return {
        type: MAPS_LIST_LOAD_ERROR,
        error: e
    };
}

function loadMaps(geoStoreUrl) {
    return (dispatch) => {
        GeoStoreApi.getResourcesByCategory("MAP", "*", {start: 0, limit: 20}, geoStoreUrl).then((response) => {
            dispatch(mapsLoaded(response));
        }).catch((e) => {
            dispatch(loadError(e));
        });
    };
}

module.exports = {MAPS_LIST_LOADED, MAPS_LIST_LOAD_ERROR, loadMaps};
