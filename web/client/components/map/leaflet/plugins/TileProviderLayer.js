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
import TileProvider from  '../../../../utils/TileConfigProvider';

const getConfig = options => TileProvider.getLayerConfig(options.provider, {maxZoom: 23, ...options});
const createLayer = (options) => {
    let [url, opt] = getConfig(options);
    return L.tileLayer(addRefreshParameter(url, options._v_), opt);
};
Layers.registerType('tileprovider', {
    create: createLayer,
    update: (layer, newOptions, oldOptions) => {
        if (newOptions._v_ !== oldOptions._v_) {
            layer.setUrl(addRefreshParameter(getConfig(newOptions)[0], newOptions._v_));
        }
        return null;
    }
});
