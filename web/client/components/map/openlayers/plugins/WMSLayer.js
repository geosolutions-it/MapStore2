/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var Layers = require('../../../../utils/openlayers/Layers');
var ol = require('openlayers');
var objectAssign = require('object-assign');
var CoordinatesUtils = require('../../../../utils/CoordinatesUtils');
var ConfigUtils = require('../../../../utils/ConfigUtils');

function isObject(val) {
    return val !== null && typeof val === 'object';
}

function wmsToOpenlayersOptions(options) {
    // NOTE: can we use opacity to manage visibility?
    return objectAssign({
        LAYERS: options.name,
        STYLES: options.style || "",
        FORMAT: options.format || 'image/png',
        TRANSPARENT: options.transparent !== undefined ? options.transparent : true,
        SRS: CoordinatesUtils.normalizeSRS(options.srs),
        CRS: CoordinatesUtils.normalizeSRS(options.srs),
        TILED: options.tiled || false
    }, options.params || {});
}

function getWMSURL( url ) {
    return url.split("\?")[0];
}

function needProxy(uri) {
    var needed = false;
    var sameOrigin = !(uri.indexOf("http") === 0);
    var urlParts = !sameOrigin && uri.match(/([^:]*:)\/\/([^:]*:?[^@]*@)?([^:\/\?]*):?([^\/\?]*)/);
    if (urlParts) {
        let location = window.location;
        sameOrigin =
            urlParts[1] === location.protocol &&
            urlParts[3] === location.hostname;
        let uPort = urlParts[4];
        let lPort = location.port;
        if (uPort !== 80 && uPort !== "" || lPort !== "80" && lPort !== "") {
            sameOrigin = sameOrigin && uPort === lPort;
        }
    }
    if (!sameOrigin) {
        let proxyUrl = ConfigUtils.getProxyUrl({});
        if (proxyUrl) {
            let useCORS = [];
            if (isObject(proxyUrl)) {
                useCORS = proxyUrl.useCORS || [];
                proxyUrl = proxyUrl.url;
            }
            const isCORS = useCORS.reduce((found, current) => found || uri.indexOf(current) === 0, false);
            if (!isCORS) {
                needed = true;
            }
        }
    }
    return needed;
}

// Works with geosolutions proxy
function proxyTileLoadFunction(imageTile, src) {
    var newSrc = src;
    if (needProxy(src)) {
        let proxyUrl = ConfigUtils.getProxyUrl({});
        if (proxyUrl) {
            if (isObject(proxyUrl)) {
                proxyUrl = proxyUrl.url;
            }
            newSrc = proxyUrl + encodeURIComponent(src);
        }
    }
    imageTile.getImage().src = newSrc;
}

Layers.registerType('wms', {
    create: (options) => {
        return new ol.layer.Tile({
            opacity: options.opacity !== undefined ? options.opacity : 1,
            visible: options.visibility !== false,
            zIndex: options.zIndex,
            source: new ol.source.TileWMS(objectAssign({
              url: getWMSURL(options.url),
              params: wmsToOpenlayersOptions(options)
            }, (options.forceProxy) ? {tileLoadFunction: proxyTileLoadFunction} : {}))
        });
    }
});
