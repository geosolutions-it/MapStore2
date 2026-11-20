/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { registerType } from '../../../../utils/leaflet/Layers';
import * as LEsri from 'esri-leaflet';
import { isImageServerUrl } from '../../../../utils/ArcGISUtils';

const createLayer = (options) => {
    // dynamicMapLayer and imageMapLayer work as a single tile request
    if (isImageServerUrl(options.url)) {
        return LEsri.imageMapLayer({
            url: options.url,
            opacity: options.opacity || 1,
            format: options.format,
            requestParams: { ...(options._v_ !== undefined && { _v_: options._v_ }) }
        });
    }
    return LEsri.dynamicMapLayer({
        url: options.url,
        opacity: options.opacity || 1,
        ...(options.name !== undefined && { layers: [`${options.name}`] }),
        format: options.format,
        requestParams: { ...(options._v_ !== undefined && { _v_: options._v_ }) }
    });
};

registerType('arcgis', {
    create: createLayer,
    update: (layer, newOptions, oldOptions) => {
        if (oldOptions._v_ !== newOptions._v_) {
            layer.options.requestParams = { ...layer.options.requestParams, _v_: newOptions._v_ };
            layer.redraw();
        }
        if (oldOptions.name !== newOptions.name) {
            if (layer.setLayers) {
                layer.setLayers(newOptions.name !== undefined ? [`${newOptions.name}`] : false);
            }
        }
        return null;
    }
});
