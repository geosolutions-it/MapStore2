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
import axios from 'axios';
import { getCredentials } from '../../../../utils/SecurityUtils';
import { isEqual } from 'lodash';

const tileLoadFunction = options => (image, src) => {
    const storedProtectedService = getCredentials(options.security?.sourceId) || {};
    axios.get(src, {
        headers: {
            "Authorization": `Basic ${btoa(storedProtectedService.username + ":" + storedProtectedService.password)}`
        },
        responseType: 'blob'
    }).then(response => {
        image.getImage().src = URL.createObjectURL(response.data);
    }).catch(e => {
        image.getImage().src = null;
        console.error(e);
    });
};
registerType('arcgis', {
    create: (options) => {
        const sourceOpt = {};
        if (options.security) {
            sourceOpt.tileLoadFunction = tileLoadFunction(options);
        }
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
                url: options.url,
                ...sourceOpt
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
        if (!isEqual(oldOptions.security, newOptions.security)) {
            layer.getSource().setTileLoadFunction(tileLoadFunction(newOptions));
        }
    },
    render: () => {
        return null;
    }
});
