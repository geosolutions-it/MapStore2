/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var Layers = require('../../../../utils/openlayers/Layers');
var ol = require('openlayers');
const {isArray, head} = require('lodash');
// const SecurityUtils = require('../../../../utils/SecurityUtils');
const WMTSUtils = require('../../../../utils/WMTSUtils');
const CoordinatesUtils = require('../../../../utils/CoordinatesUtils');
const mapUtils = require('../../../../utils/MapUtils');
const assign = require('object-assign');

function getWMSURLs( urls ) {
    return urls.map((url) => url.split("\?")[0]);
}

const getTopLeftCorner = (str) => {
    const coord = str.split(' ');
    const lng = parseFloat(coord[0]);
    const lat = parseFloat(coord[1]);
    return !isNaN(lng) && !isNaN(lat) && {lng, lat} || null;
};

Layers.registerType('wmts', {
    create: (options) => {
        const urls = getWMSURLs(isArray(options.url) ? options.url : [options.url]);
        const srs = CoordinatesUtils.normalizeSRS(options.srs || 'EPSG:3857', options.allowedSRS);
        const tilMatrixSetName = WMTSUtils.getTileMatrixSet(options.tileMatrixSet, srs, options.allowedSRS, options.matrixIds);
        const tileMatrixSet = head(options.tileMatrixSet.filter(tM => tM['ows:Identifier'] === tilMatrixSetName));
        const scales = tileMatrixSet.TileMatrix.map(t => t.ScaleDenominator);
        const mapResolutions = mapUtils.getResolutions();
        const matrixResolutions = options.resolutions || mapUtils.getResolutionsForScales(scales, srs, 96);
        const resolutions = matrixResolutions && matrixResolutions.map(res => {
            return head(mapResolutions.map((mRes, i) => {
                if (i === mapResolutions.length - 1) {
                    return null;
                }
                const isBetween = res <= mapResolutions[i] && res > mapResolutions[i + 1];
                if (isBetween) {
                    const delta = res - mapResolutions[i + 1];
                    return delta > (mapResolutions[i] - mapResolutions[i + 1]) / 2 ? mapResolutions[i] : mapResolutions[i + 1];
                }
                return null;
            }).filter(r => r)) || res;
        }) || mapResolutions;
        const matrixIds = WMTSUtils.limitMatrix(options.matrixIds && WMTSUtils.getMatrixIds(options.matrixIds, tilMatrixSetName || srs) || WMTSUtils.getDefaultMatrixId(options), resolutions.length);

        const extent = options.bbox ? ol.extent.applyTransform([parseFloat(options.bbox.bounds.minx), parseFloat(options.bbox.bounds.miny), parseFloat(options.bbox.bounds.maxx), parseFloat(options.bbox.bounds.maxy)], ol.proj.getTransform(options.bbox.crs, options.srs)) : null;

        const origin = tileMatrixSet.TileMatrix && tileMatrixSet.TileMatrix[1] && tileMatrixSet.TileMatrix[1].TopLeftCorner && getTopLeftCorner(tileMatrixSet.TileMatrix[1].TopLeftCorner);

        /* remove matrix 0, it doesn't happear correctly on map  */
        const paramResolutions = resolutions.filter((r, i) => i > 0);
        const paramMatrixIds = matrixIds.filter((r, i) => i > 0);

        // urls.forEach(url => SecurityUtils.addAuthenticationParameter(url, queryParameters));
        return new ol.layer.Tile({
            opacity: options.opacity !== undefined ? options.opacity : 1,
            zIndex: options.zIndex,
            source: new ol.source.WMTS(assign({
                urls: urls,
                layer: options.name,
                version: options.version || "1.0.0",
                matrixSet: tilMatrixSetName,
                format: options.format || 'image/png',
                tileGrid: new ol.tilegrid.WMTS({
                    origin: [
                        origin.lng || -20037508.3428,
                        origin.lat || 20037508.3428
                    ],
                    extent: extent,
                    resolutions: paramResolutions,
                    matrixIds: paramMatrixIds,
                    tileSize: options.tileSize || [256, 256]
                }),
                style: options.style || '',
                wrapX: true
            }))
        });
    }
});
