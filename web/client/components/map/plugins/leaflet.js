/**
* Copyright 2016, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

export default () => {
    require('../leaflet/plugins/index');
    return {
<<<<<<< HEAD
        Map: require('../leaflet/Map'),
        Layer: require('../leaflet/Layer').default,
        Feature: require('../leaflet/Feature'),
        MeasurementSupport: require('../leaflet/MeasurementSupport'),
=======
        Map: require('../leaflet/Map').default,
        Layer: require('../leaflet/Layer').default,
        Feature: require('../leaflet/Feature').default,
        MeasurementSupport: require('../leaflet/MeasurementSupport').default,
>>>>>>> master
        Overview: require('../leaflet/Overview'),
        ScaleBar: require('../leaflet/ScaleBar'),
        DrawSupport: require('../leaflet/DrawSupport'),
        PopupSupport: require('../leaflet/PopupSupport').default
    };
};
