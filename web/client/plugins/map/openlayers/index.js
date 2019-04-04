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
    LMap: require('../../../components/map/openlayers/Map'),
    Layer: require('../../../components/map/openlayers/Layer'),
    Feature: require('../../../components/map/openlayers/Feature'),
    Locate: require('../../../components/map/openlayers/Locate'),
    MeasurementSupport: addFormatNumber(require('../../../components/map/openlayers/MeasurementSupport')),
    Overview: require('../../../components/map/openlayers/Overview'),
    ScaleBar: require('../../../components/map/openlayers/ScaleBar'),
    DrawSupport: require('../../../components/map/openlayers/DrawSupport'),
    HighlightFeatureSupport: require('../../../components/map/openlayers/HighlightFeatureSupport'),
    SelectionSupport: require('../../../components/map/openlayers/SelectionSupport')
};
