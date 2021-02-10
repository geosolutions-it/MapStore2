/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Layers from '../../../../utils/openlayers/Layers';
import OSM from 'ol/source/OSM';
import TileLayer from 'ol/layer/Tile';

Layers.registerType('osm', {
    create: (options) => {
        return new TileLayer({
            msId: options.id,
            opacity: options.opacity !== undefined ? options.opacity : 1,
            visible: options.visibility,
            zIndex: options.zIndex,
            source: new OSM(),
            minResolution: options.minResolution,
            maxResolution: options.maxResolution
        });
    },
    update: (layer, newOptions, oldOptions) => {
        if (oldOptions.minResolution !== newOptions.minResolution) {
            layer.setMinResolution(newOptions.minResolution === undefined ? 0 : newOptions.minResolution);
        }
        if (oldOptions.maxResolution !== newOptions.maxResolution) {
            layer.setMaxResolution(newOptions.maxResolution === undefined ? Infinity : newOptions.maxResolution);
        }
    }
});
