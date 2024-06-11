/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { registerType } from '../../../../utils/leaflet/Layers';
import * as LEsri from 'esri-leaflet';

registerType('arcgis', (options) => {
    // dynamicMapLayer works as a single tile request
    return LEsri.dynamicMapLayer({
        url: options.url,
        opacity: options.opacity || 1,
        ...(options.name !== undefined && { layers: [`${options.name}`] }),
        format: options.format
    });
});
