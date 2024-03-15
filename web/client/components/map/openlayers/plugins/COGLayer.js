/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Layers from '../../../../utils/openlayers/Layers';

import GeoTIFF from 'ol/source/GeoTIFF.js';
import TileLayer from 'ol/layer/WebGLTile.js';
import { isProjectionAvailable } from '../../../../utils/ProjectionUtils';

function create(options) {
    return new TileLayer({
        msId: options.id,
        style: options.style, // TODO style needs to be improved. Currently renders only predefined band and ranges when specified in config
        opacity: options.opacity !== undefined ? options.opacity : 1,
        visible: options.visibility,
        source: new GeoTIFF({
            convertToRGB: 'auto', // CMYK, YCbCr, CIELab, and ICCLab images will automatically be converted to RGB
            sources: options.sources,
            wrapX: true
        }),
        zIndex: options.zIndex,
        minResolution: options.minResolution,
        maxResolution: options.maxResolution
    });
}

Layers.registerType('cog', {
    create,
    update(layer, newOptions, oldOptions, map) {
        if (newOptions.srs !== oldOptions.srs) {
            return create(newOptions, map);
        }
        if (oldOptions.minResolution !== newOptions.minResolution) {
            layer.setMinResolution(newOptions.minResolution === undefined ? 0 : newOptions.minResolution);
        }
        if (oldOptions.maxResolution !== newOptions.maxResolution) {
            layer.setMaxResolution(newOptions.maxResolution === undefined ? Infinity : newOptions.maxResolution);
        }
        return null;
    },
    isCompatible: (layer) => {
        return isProjectionAvailable(layer?.sourceMetadata?.crs);
    }
});
