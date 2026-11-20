/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { addRefreshParameter } from '../../../../utils/LayerRefreshUtils';
import Layers from  '../../../../utils/leaflet/Layers';
import L from  'leaflet';

const createLayer = (options) => {
    return L.tileLayer(addRefreshParameter(`${options.tileMapUrl}/{z}/{x}/{y}.${options.extension}`, options._v_), {
        hideErrors: options.hideErrors || true, // custom option to hide errors of TMS
        tms: true // inverses y axis
        // TODO: zoomOffset
    });
};
Layers.registerType('tms', {
    create: createLayer,
    update: (layer, newOptions, oldOptions) => {
        if (newOptions._v_ !== oldOptions._v_) {
            layer.setUrl(addRefreshParameter(`${newOptions.tileMapUrl}/{z}/{x}/{y}.${newOptions.extension}`, newOptions._v_));
        }
        return null;
    }
});
