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
import TileProvider from  '../../../../utils/TileConfigProvider';

/**
 * Resolve provider URL and tile options, defaulting maxZoom to 23.
 * @param {object} options MapStore layer options including provider.
 * @returns {Array} Provider URL and Leaflet tile options.
 */
const getConfig = options => TileProvider.getLayerConfig(options.provider, {maxZoom: 23, ...options});
/**
 * Create a provider tile layer with an optional refresh version in its URL.
 * @param {object} options MapStore layer options including provider and optional _v_.
 * @returns {L.TileLayer} Provider tile layer.
 */
const createLayer = (options) => {
    let [url, opt] = getConfig(options);
    return L.tileLayer(addRefreshParameter(url, options._v_), opt);
};
Layers.registerType('tileprovider', {
    create: createLayer,
    /**
     * Reload provider tiles when the refresh version changes.
     * @param {L.TileLayer} layer Existing tile layer.
     * @param {object} newOptions Updated MapStore layer options.
     * @param {object} oldOptions Previous MapStore layer options.
     * @returns {null} Update the existing layer without replacing it.
     */
    update: (layer, newOptions, oldOptions) => {
        if (newOptions._v_ !== oldOptions._v_) {
            layer.setUrl(addRefreshParameter(getConfig(newOptions)[0], newOptions._v_));
        }
        return null;
    }
});
