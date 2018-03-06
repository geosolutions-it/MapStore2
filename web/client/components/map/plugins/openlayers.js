/**
* Copyright 2016, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

module.exports = () => {
    require('../openlayers/plugins/index');
    return {
        Map: require('../openlayers/Map'),
        Layer: require('../openlayers/Layer'),
        Feature: require('../openlayers/Feature'),
        Locate: require('../openlayers/Locate'),
        MeasurementSupport: require('../openlayers/MeasurementSupport'),
        Overview: require('../openlayers/Overview'),
        ScaleBar: require('../openlayers/ScaleBar'),
        DrawSupport: require('../openlayers/DrawSupport')
    };
};

