/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var Layers = require('../../../../utils/openlayers/Layers');
var ol = require('openlayers');
const {isArray} = require('lodash');
// const SecurityUtils = require('../../../../utils/SecurityUtils');
const WMTSUtils = require('../../../../utils/WMTSUtils');
const CoordinatesUtils = require('../../../../utils/CoordinatesUtils');
const mapUtils = require('../../../../utils/MapUtils');
const assign = require('object-assign');

function getWMSURLs( urls ) {
    return urls.map((url) => url.split("\?")[0]);
}

Layers.registerType('wmts', {
    create: (options) => {
        const urls = getWMSURLs(isArray(options.url) ? options.url : [options.url]);
        const srs = CoordinatesUtils.normalizeSRS(options.srs || 'EPSG:3857', options.allowedSRS);
        const tileMatrixSet = WMTSUtils.getTileMatrixSet(options.tileMatrixSet, srs, options.allowedSRS);
        const resolutions = options.resolutions || mapUtils.getResolutions();
        const matrixIds = WMTSUtils.limitMatrix(options.matrixIds && WMTSUtils.getMatrixIds(options.matrixIds, tileMatrixSet || srs) || WMTSUtils.getDefaultMatrixId(options), resolutions.length);
        const extent = options.bbox ? ol.extent.applyTransform([parseFloat(options.bbox.bounds.minx), parseFloat(options.bbox.bounds.miny), parseFloat(options.bbox.bounds.maxx), parseFloat(options.bbox.bounds.maxy)], ol.proj.getTransform(options.bbox.crs, options.srs)) : null;
        // urls.forEach(url => SecurityUtils.addAuthenticationParameter(url, queryParameters));
        return new ol.layer.Tile({
            opacity: options.opacity !== undefined ? options.opacity : 1,
            zIndex: options.zIndex,
            source: new ol.source.WMTS(assign({
              urls: urls,
              layer: options.name,
              version: options.version || "1.0.0",
              matrixSet: tileMatrixSet,
              format: options.format || 'image/png',
              tileGrid: new ol.tilegrid.WMTS({
                    origin: [
                        options.originX || -20037508.3428,
                        options.originY || 20037508.3428
                    ],
                    extent: extent,
                    resolutions: resolutions,
                    matrixIds: matrixIds
              }),
              style: options.style || '',
              wrapX: true
            }))
        });
    }
});
