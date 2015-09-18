/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var Layers = require('../../../../utils/leaflet/Layers');
var L = require('leaflet');
var objectAssign = require('object-assign');

function wmsToLeafletOptions(options) {
    var opacity = options.opacity !== undefined ? options.opacity : 1;
    // NOTE: can we use opacity to manage visibility?
    return objectAssign({
        layers: options.name,
        styles: options.style || "",
        format: options.format || 'image/png',
        transparent: options.transparent !== undefined ? options.transparent : true,
        opacity: opacity
    }, options.params || {});
}

function getWMSURL( url ) {
    return url.split("\?")[0];
}

Layers.registerType('wms', (options) => {
    return L.tileLayer.wms(
        getWMSURL(options.url),
        wmsToLeafletOptions(options));
});
