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
        Map: require('../openlayers/Map').default,
        Layer: require('../openlayers/Layer').default,
        Feature: require('../openlayers/Feature').default,
        Locate: require('../openlayers/Locate').default,
        MeasurementSupport: require('../openlayers/MeasurementSupport').default,
        Overview: require('../openlayers/Overview').default,
        ScaleBar: require('../openlayers/ScaleBar').default,
        DrawSupport: require('../openlayers/DrawSupport').default,
        PopupSupport: require('../openlayers/PopupSupport').default
    };
};

