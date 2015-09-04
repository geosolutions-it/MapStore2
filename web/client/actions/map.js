/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const CHANGE_MAP_VIEW = 'CHANGE_MAP_VIEW';

function changeMapView(center, zoom) {
    return {
        type: CHANGE_MAP_VIEW,
        center: center,
        zoom: zoom
    };
}

module.exports = {CHANGE_MAP_VIEW, changeMapView};
