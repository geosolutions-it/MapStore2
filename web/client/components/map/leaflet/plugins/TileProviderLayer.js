/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Layers from '../../../../utils/leaflet/Layers';
import L from 'leaflet';
import TileProvider from '../../../../utils/TileConfigProvider';

Layers.registerType('tileprovider', (options) => {
    let [url, opt] = TileProvider.getLayerConfig(options.provider, {maxZoom: 23, ...options});
    return L.tileLayer(url, opt);
});
