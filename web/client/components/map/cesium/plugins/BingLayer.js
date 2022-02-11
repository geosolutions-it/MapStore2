/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Layers from '../../../../utils/cesium/Layers';
import * as Cesium from 'cesium';

Layers.registerType('bing', (options) => {
    const key = options.apiKey;
    return new Cesium.BingMapsImageryProvider({
        url: '//dev.virtualearth.net',
        key,
        mapStyle: Cesium.BingMapsStyle[options.name.toUpperCase()]
    });
});
