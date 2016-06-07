/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var Layers = require('../../../../utils/leaflet/Layers');
var Bing = require('leaflet-plugins/layer/tile/Bing');
const assign = require('object-assign');

Layers.registerType('bing', {
    create: (options) => {
        var key = options.apiKey;
        let layerOptions = {
            subdomains: [0, 1, 2, 3],
            type: options.name,
            attribution: 'Bing',
            culture: ''
        };
        if (options.zoomOffset) {
            layerOptions = assign({}, layerOptions, {
                zoomOffset: options.zoomOffset
            });
        }
        return new Bing(key, layerOptions);
    },
    isValid: (layer) => {
        if (layer.meta && layer.meta.statusCode && layer.meta.statusCode !== 200) {
            return false;
        }
        return true;
    }
});
