/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var Layers = require('../../../../utils/leaflet/Layers');
var Bing = require('leaflet-plugins/layer/tile/Bing');

Layers.registerType('bing', (options) => {
    var key = options.apiKey;
    return new Bing(key,
        {
            subdomains: [0, 1, 2, 3],
            type: options.name,
            attribution: 'Bing',
            culture: ''
        }
    );
});
