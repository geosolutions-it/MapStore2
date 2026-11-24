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

/**
 * Create a Leaflet TMS layer with an optional refresh version in its tile URL.
 * @param {object} options MapStore layer options including tileMapUrl, extension and optional _v_.
 * @returns {L.TileLayer} TMS tile layer.
 */
const createLayer = (options) => {
    return L.tileLayer(addRefreshParameter(`${options.tileMapUrl}/{z}/{x}/{y}.${options.extension}`, options._v_), {
        hideErrors: options.hideErrors || true, // custom option to hide errors of TMS
        tms: true // inverses y axis
        // TODO: zoomOffset
    });
};
Layers.registerType('tms', {
    create: createLayer,
    /**
     * Reload TMS tiles when the refresh version changes.
     * @param {L.TileLayer} layer Existing tile layer.
     * @param {object} newOptions Updated MapStore layer options.
     * @param {object} oldOptions Previous MapStore layer options.
     * @returns {null} Update the existing layer without replacing it.
     */
    update: (layer, newOptions, oldOptions) => {
        if (newOptions._v_ !== oldOptions._v_) {
            layer.setUrl(addRefreshParameter(`${newOptions.tileMapUrl}/{z}/{x}/{y}.${newOptions.extension}`, newOptions._v_));
        }
        return null;
    }
});
