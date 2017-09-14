/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var Layers = require('../../../../utils/leaflet/Layers');
var Google = require('leaflet-plugins/layer/tile/Google');
Google.prototype._checkZoomLevels = function() {
    // Avoid map zoom setting when current zoom is greatr then  the google's max zoom
};
Layers.registerType('google', (options) => {
    return new Google(options.name, {zoomOffset: options.zoomOffset || 0, maxNativeZoom: options.maxNativeZoom || 18,
        maxZoom: options.maxZoom || 20});
});
