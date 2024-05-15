/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { registerType } from '../../../../utils/openlayers/Layers';

import TileLayer from 'ol/layer/Tile';
import TileArcGISRest from 'ol/source/TileArcGISRest';

registerType('arcgis', {
    create: (options) => {
        return new TileLayer({
            msId: options.id,
            opacity: options.opacity !== undefined ? options.opacity : 1,
            visible: options.visibility !== false,
            zIndex: options.zIndex,
            minResolution: options.minResolution,
            maxResolution: options.maxResolution,
            source: new TileArcGISRest({
                params: {
                    ...(options.name !== undefined && { LAYERS: `show:${options.name}` }),
                    ...(options.format && { format: options.format })
                },
                url: options.url
            })
        });
    },
    update: (layer, newOptions, oldOptions) => {
        if (oldOptions.minResolution !== newOptions.minResolution) {
            layer.setMinResolution(newOptions.minResolution === undefined ? 0 : newOptions.minResolution);
        }
        if (oldOptions.maxResolution !== newOptions.maxResolution) {
            layer.setMaxResolution(newOptions.maxResolution === undefined ? Infinity : newOptions.maxResolution);
        }
    },
    render: () => {
        return null;
    }
});
