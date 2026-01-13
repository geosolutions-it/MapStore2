/**
* Copyright 2016, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

import '../openlayers/plugins/index';
import Map from '../openlayers/Map';
import Layer from '../openlayers/Layer';
import Feature from '../openlayers/Feature';
import MeasurementSupport from '../openlayers/MeasurementSupport';
import Overview from '../openlayers/Overview';
import ScaleBar from '../openlayers/ScaleBar';
import DrawSupport from '../openlayers/DrawSupport';
import PopupSupport from '../openlayers/PopupSupport';
import BoxSelectionSupport from '../openlayers/BoxSelectionSupport';

export default () => {
    return {
        Map,
        Layer,
        Feature,
        MeasurementSupport,
        Overview,
        ScaleBar,
        DrawSupport,
        PopupSupport,
        BoxSelectionSupport
    };
};

