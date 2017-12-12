/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var Layers = require('../../../../utils/openlayers/Layers');
var ol = require('openlayers');
const {isArray, head, isEmpty} = require('lodash');
const SecurityUtils = require('../../../../utils/SecurityUtils');
const WMTSUtils = require('../../../../utils/WMTSUtils');
const CoordinatesUtils = require('../../../../utils/CoordinatesUtils');
const mapUtils = require('../../../../utils/MapUtils');
const assign = require('object-assign');
const urlParser = require('url');

function getWMSURLs( urls ) {
    return urls.map((url) => url.split("\?")[0]);
}

const createLayer = options => {
    const urls = getWMSURLs(isArray(options.url) ? options.url : [options.url]);
    const srs = CoordinatesUtils.normalizeSRS(options.srs || 'EPSG:3857', options.allowedSRS);
    const tilMatrixSetName = WMTSUtils.getTileMatrixSet(options.tileMatrixSet, srs, options.allowedSRS, options.matrixIds);
    const tileMatrixSet = head(options.tileMatrixSet.filter(tM => tM['ows:Identifier'] === tilMatrixSetName));
    const scales = tileMatrixSet && tileMatrixSet.TileMatrix.map(t => t.ScaleDenominator);
    const mapResolutions = options.resolutions || mapUtils.getResolutions();
    const matrixResolutions = options.resolutions || scales && mapUtils.getResolutionsForScales(scales, srs, 96) || [];
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

    const origin = tileMatrixSet && tileMatrixSet.TileMatrix && tileMatrixSet.TileMatrix[1] && tileMatrixSet.TileMatrix[1].TopLeftCorner && CoordinatesUtils.parseString(tileMatrixSet.TileMatrix[1].TopLeftCorner) || {};

    let bbox = null;

    /* calculate bbox from tile matrix set to avoid tile errors when fit world bounds*/
    if (!isEmpty(origin) && origin.x && options.bbox && options.bbox.bounds
    && parseFloat(options.bbox.bounds.minx) === -180 && parseFloat(options.bbox.bounds.miny) === -90
    && parseFloat(options.bbox.bounds.maxx) === 180 && parseFloat(options.bbox.bounds.maxy) === 90
    && tileMatrixSet && tileMatrixSet.TileMatrix[1] && tileMatrixSet.TileMatrix[1].ScaleDenominator
    && tileMatrixSet.TileMatrix[1].MatrixWidth && tileMatrixSet.TileMatrix[1].MatrixHeight
    && tileMatrixSet.TileMatrix[1].TileWidth && tileMatrixSet.TileMatrix[1].TileHeight) {
        const res = mapUtils.getResolutionsForScales([tileMatrixSet.TileMatrix[1].ScaleDenominator], srs, 96);
        bbox = {
            bounds: {
                minx: origin.x,
                maxx: origin.x + tileMatrixSet.TileMatrix[1].MatrixWidth * tileMatrixSet.TileMatrix[1].TileWidth * res,
                maxy: origin.y,
                miny: origin.y - tileMatrixSet.TileMatrix[1].MatrixHeight * tileMatrixSet.TileMatrix[1].TileHeight * res
            },
            crs: srs
        };

    }
    bbox = bbox || options.bbox || null;

    const extent = bbox ? ol.extent.applyTransform([parseFloat(bbox.bounds.minx), parseFloat(bbox.bounds.miny), parseFloat(bbox.bounds.maxx), parseFloat(bbox.bounds.maxy)], ol.proj.getTransform(bbox.crs, options.srs)) : null;

    /* remove matrix 0, it doesn't happear correctly on map  */
    const paramResolutions = resolutions.filter((r, i) => i > 0);
    const paramMatrixIds = matrixIds.filter((r, i) => i > 0);

    let queryParameters = {};
    urls.forEach(url => SecurityUtils.addAuthenticationParameter(url, queryParameters, options.securityToken));
    const queryParametersString = urlParser.format({ query: {...queryParameters}});

    return new ol.layer.Tile({
        opacity: options.opacity !== undefined ? options.opacity : 1,
        zIndex: options.zIndex,
        extent: extent,
        source: new ol.source.WMTS(assign({
            urls: urls.map(u => u + queryParametersString),
            layer: options.name,
            version: options.version || "1.0.0",
            matrixSet: tilMatrixSetName,
            format: options.format || 'image/png',
            tileGrid: new ol.tilegrid.WMTS({
                origin: [
                    origin.lng || origin.x || options.originX || -20037508.3428,
                    origin.lat || origin.y || options.originY || 20037508.3428
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
};

const updateLayer = (layer, newOptions, oldOptions) => {
    if (oldOptions.securityToken !== newOptions.securityToken) {
        return createLayer(newOptions);
    }
    return null;
};

Layers.registerType('wmts', {create: createLayer, update: updateLayer});
