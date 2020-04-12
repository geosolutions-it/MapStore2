/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Layers from '../../../../utils/leaflet/Layers';
import L from 'leaflet';

Layers.registerType('tms', (options) => {
    return L.tileLayer(`${options.tileMapUrl}/{z}/{x}/{y}.${options.extension}`, {
        hideErrors: options.hideErrors || true, // custom option to hide errors of TMS
        tms: true // inverses y axis
        // TODO: zoomOffset
    });
});
