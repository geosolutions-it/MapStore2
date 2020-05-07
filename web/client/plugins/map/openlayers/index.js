/**
* Copyright 2016, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/
const addI18NProps = require('../../../components/I18N/enhancers/addI18NProps');

// number format localization for measurements
const addFormatNumber = addI18NProps(['formatNumber']);

module.exports = {
    LMap: require('../../../components/map/openlayers/Map').default,
    Layer: require('../../../components/map/openlayers/Layer').default,
    Feature: require('../../../components/map/openlayers/Feature').default,
    Locate: require('../../../components/map/openlayers/Locate').default,
    MeasurementSupport: addFormatNumber(require('../../../components/map/openlayers/MeasurementSupport').default),
    Overview: require('../../../components/map/openlayers/Overview').default,
    ScaleBar: require('../../../components/map/openlayers/ScaleBar').default,
    DrawSupport: require('../../../components/map/openlayers/DrawSupport').default,
    HighlightFeatureSupport: require('../../../components/map/openlayers/HighlightFeatureSupport').default,
    SelectionSupport: require('../../../components/map/openlayers/SelectionSupport').default,
    PopupSupport: require('../../../components/map/openlayers/PopupSupport').default
};
