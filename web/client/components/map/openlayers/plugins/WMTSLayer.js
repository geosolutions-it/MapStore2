/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var Layers = require('../../../../utils/openlayers/Layers');
var ol = require('openlayers');
const { castArray, head, last } = require('lodash');
const SecurityUtils = require('../../../../utils/SecurityUtils');
const WMTSUtils = require('../../../../utils/WMTSUtils');
const CoordinatesUtils = require('../../../../utils/CoordinatesUtils');
const mapUtils = require('../../../../utils/MapUtils');
const assign = require('object-assign');
const urlParser = require('url');

function getWMSURLs(urls) {
    return urls.map((url) => url.split("\?")[0]);
}

const createLayer = options => {
    // options.urls is an alternative name of URL.
    const urls = getWMSURLs(castArray(options.url));
    const srs = CoordinatesUtils.normalizeSRS(options.srs || 'EPSG:3857', options.allowedSRS);
    const projection = ol.proj.get(srs);
    const metersPerUnit = projection.getMetersPerUnit();
    const tilMatrixSetName = WMTSUtils.getTileMatrixSet(options.tileMatrixSet, srs, options.allowedSRS, options.matrixIds);
    const tileMatrixSet = head(options.tileMatrixSet.filter(tM => tM['ows:Identifier'] === tilMatrixSetName));
    const scales = tileMatrixSet && tileMatrixSet.TileMatrix.map(t => t.ScaleDenominator);
    const mapResolutions = mapUtils.getResolutions();
    /*
     * WMTS assumes a DPI 90.7 instead of 96 as documented in the WMTSCapabilities document:
     * "The tile matrix set that has scale values calculated based on the dpi defined by OGC specification
     * (dpi assumes 0.28mm as the physical distance of a pixel)."
     */
    const scaleToResolution = s => s * 0.28E-3 / metersPerUnit;
    const matrixResolutions = options.resolutions || scales && scales.map(scaleToResolution);
    const resolutions = matrixResolutions || mapResolutions;

    const matrixIds = WMTSUtils.limitMatrix(options.matrixIds && WMTSUtils.getMatrixIds(options.matrixIds, tilMatrixSetName || srs) || WMTSUtils.getDefaultMatrixId(options), resolutions.length);

    /* - enu - the default easting, north-ing, elevation
    * - neu - north-ing, easting, up - useful for "lat/long" geographic coordinates, or south orientated transverse mercator
    * - wnu - westing, north-ing, up - some planetary coordinate systems have "west positive" coordinate systems
    */
    const switchOriginXY = projection.getAxisOrientation().substr(0, 2) === 'ne';
    let origins = tileMatrixSet
        && tileMatrixSet.TileMatrix
        && tileMatrixSet.TileMatrix
            .map(({ TopLeftCorner } = {}) => TopLeftCorner && CoordinatesUtils.parseString(TopLeftCorner))
            .map(({ x, y } = {}) => switchOriginXY ? [y, x] : [x, y]);

    const bbox = options.bbox;

    const extent = bbox
        ? ol.extent.applyTransform([
                parseFloat(bbox.bounds.minx),
                parseFloat(bbox.bounds.miny),
                parseFloat(bbox.bounds.maxx),
                parseFloat(bbox.bounds.maxy)
            ], ol.proj.getTransform(bbox.crs, options.srs))
        : null;

    let queryParameters = {};
    urls.forEach(url => SecurityUtils.addAuthenticationParameter(url, queryParameters, options.securityToken));
    const queryParametersString = urlParser.format({ query: { ...queryParameters } });

    // WMTS Capabilities has "RESTful"/"KVP", OpenLayers uses "REST"/"KVP";
    let requestEncoding = options.requestEncoding === "RESTful" ? "REST" : options.requestEncoding;
    // TODO: support tileSizes from  matrix
    const TILE_SIZE = 256;

    // Temporary fix for https://github.com/openlayers/openlayers/issues/8700 . It should be solved in OL 5.3.0
    // it's exclusive so the map lower resolution that draws the image in less then 0.5 pixels have to be the maxResolution
    const maxResolution = options.maxResolution || last(mapResolutions.filter((r = []) => resolutions[0] / r * TILE_SIZE < 0.5));
    return new ol.layer.Tile({
        opacity: options.opacity !== undefined ? options.opacity : 1,
        zIndex: options.zIndex,
        extent: extent,
        maxResolution,
        visible: options.visibility !== false,
        source: new ol.source.WMTS(assign({
            requestEncoding,
            urls: urls.map(u => u + queryParametersString),
            layer: options.name,
            version: options.version || "1.0.0",
            matrixSet: tilMatrixSetName,
            format: options.format || 'image/png',
            style: options.style,
            tileGrid: new ol.tilegrid.WMTS({
                origins,
                origin: !origins ? [20037508.3428, -20037508.3428] : undefined, // Either origin or origins must be configured, never both.
                // extent: extent,
                resolutions,
                matrixIds,
                // TODO: matrixLimits from ranges
                tileSize: options.tileSize || [TILE_SIZE, TILE_SIZE]
            }),
            wrapX: true
        }))
    });
};

const updateLayer = (layer, newOptions, oldOptions) => {
    if (oldOptions.securityToken !== newOptions.securityToken || oldOptions.srs !== newOptions.srs) {
        return createLayer(newOptions);
    }
    return null;
};
const compatibleLayer = options =>
    head(CoordinatesUtils.getEquivalentSRS(options.srs).filter(proj => options.matrixIds && options.matrixIds.hasOwnProperty(proj))) ? true : false;


Layers.registerType('wmts', { create: createLayer, update: updateLayer, isCompatible: compatibleLayer });
