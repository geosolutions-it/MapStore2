/**
* Copyright 2016, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/
import addI18NProps from '../../../components/I18N/enhancers/addI18NProps';

// number format localization for measurements
const addFormatNumber = addI18NProps(['formatNumber']);

import Map from '../../../components/map/openlayers/Map';
import Layer from '../../../components/map/openlayers/Layer';
import Feature from '../../../components/map/openlayers/Feature';
import MeasurementSupport from '../../../components/map/openlayers/MeasurementSupport';
import Overview from '../../../components/map/openlayers/Overview';
import ScaleBar from '../../../components/map/openlayers/ScaleBar';
import DrawSupport from '../../../components/map/openlayers/DrawSupport';
import HighlightFeatureSupport from '../../../components/map/openlayers/HighlightFeatureSupport';
import SelectionSupport from '../../../components/map/openlayers/SelectionSupport';
import PopupSupport from '../../../components/map/openlayers/PopupSupport';
import BoxSelectionSupport from '../../../components/map/openlayers/BoxSelectionSupport';

export default {
    LMap: Map,
    Layer,
    Feature,
    MeasurementSupport: addFormatNumber(MeasurementSupport),
    Overview,
    ScaleBar,
    DrawSupport,
    HighlightFeatureSupport,
    SelectionSupport,
    PopupSupport,
    BoxSelectionSupport
};
