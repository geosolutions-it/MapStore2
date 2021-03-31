/**
* Copyright 2016, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

export default {
    LMap: require('../../../components/map/leaflet/Map').default,
    Layer: require('../../../components/map/leaflet/Layer').default,
    Feature: require('../../../components/map/leaflet/Feature').default,
    MeasurementSupport: require('../../../components/map/leaflet/MeasurementSupport').default,
    Overview: require('../../../components/map/leaflet/Overview'),
    ScaleBar: require('../../../components/map/leaflet/ScaleBar'),
    DrawSupport: require('../../../components/map/leaflet/DrawSupport').default,
    HighlightFeatureSupport: require('../../../components/map/leaflet/HighlightFeatureSupport').default,
    PopupSupport: require('../../../components/map/leaflet/PopupSupport').default
};
