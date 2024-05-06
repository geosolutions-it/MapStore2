/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Layers from '../../../../utils/cesium/Layers';
import * as Cesium from 'cesium';

Layers.registerType('arcgis', (options) => {
    return new Cesium.ArcGisMapServerImageryProvider({
        url: options.url,
        layers: `${options.name}`,
        // we need to disable this when using layers ids
        // the usage of tiles will add an additional request to metadata
        // and render the map tiles representing all the layers available in the MapServer
        usePreCachedTilesIfAvailable: false
    });
});
