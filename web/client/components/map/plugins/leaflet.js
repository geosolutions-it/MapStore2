/**
* Copyright 2016, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

module.exports = () => {
    require('../leaflet/plugins/index');
    return {
        Map: require('../leaflet/Map'),
        Layer: require('../leaflet/Layer'),
        Feature: require('../leaflet/Feature'),
        Locate: require('../leaflet/Locate'),
        MeasurementSupport: require('../leaflet/MeasurementSupport'),
        Overview: require('../leaflet/Overview'),
        ScaleBar: require('../leaflet/ScaleBar'),
        DrawSupport: require('../leaflet/DrawSupport'),
        PopupSupport: require('../leaflet/PopupSupport').default
    };
};
