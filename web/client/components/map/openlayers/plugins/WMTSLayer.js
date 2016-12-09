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
const CoordinatesUtils = require('../../../../utils/CoordinatesUtils');
const {isArray} = require('lodash');
const SecurityUtils = require('../../../../utils/SecurityUtils');
const mapUtils = require('../../../../utils/MapUtils');

function wmtsToOpenlayersOptions(options) {
    // NOTE: can we use opacity to manage visibility?
    return objectAssign({}, options.baseParams, {
        LAYERS: options.name,
        STYLES: options.style || "",
        FORMAT: options.format || 'image/png',
        TRANSPARENT: options.transparent !== undefined ? options.transparent : true,
        SRS: CoordinatesUtils.normalizeSRS(options.srs || 'EPSG:3857', options.allowedSRS),
        CRS: CoordinatesUtils.normalizeSRS(options.srs || 'EPSG:3857', options.allowedSRS),
        TILED: options.tiled || false,
        VERSION: options.version || "1.3.0"
    }, options.params || {});
}

function getWMSURLs( urls ) {
    return urls.map((url) => url.split("\?")[0]);
}

Layers.registerType('wmts', {
    create: (options) => {
        const urls = getWMSURLs(isArray(options.url) ? options.url : [options.url]);
        const queryParameters = wmtsToOpenlayersOptions(options) || {};
        var projection = ol.proj.get('EPSG:900913');
        urls.forEach(url => SecurityUtils.addAuthenticationParameter(url, queryParameters));
        let projectionExtent = projection.getExtent();
        let matrixIds = new Array(22);
        for (let z = 0; z < 22; ++z) {
        // generate matrixIds arrays for this WMTS
            matrixIds[z] = options.tileMatrixPrefix + z;
        }
        return new ol.layer.Tile({
            opacity: options.opacity !== undefined ? options.opacity : 1,
            source: new ol.source.WMTS(objectAssign({
              urls: urls,
              layer: options.name,
              matrixSet: options.tileMatrixSet,
              format: 'image/png',
              tileGrid: new ol.tilegrid.WMTS({
                origin: ol.extent.getTopLeft(projectionExtent),
                resolutions: mapUtils.getResolutions(),
                matrixIds: matrixIds
              }),
              style: '',
              wrapX: true
            }))
        });
    }
});
