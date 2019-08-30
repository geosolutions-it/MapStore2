/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Layers from '../../../../utils/openlayers/Layers';

import castArray from 'lodash/castArray';
import head from 'lodash/head';
import last from 'lodash/last';

import SecurityUtils from '../../../../utils/SecurityUtils';
import WMTSUtils from '../../../../utils/WMTSUtils';
import CoordinatesUtils from '../../../../utils/CoordinatesUtils';
import MapUtils from '../../../../utils/MapUtils';
import { isVectorFormat} from '../../../../utils/VectorTileUtils';
import urlParser from 'url';

import {get, getTransform} from 'ol/proj';
import {applyTransform} from 'ol/extent';
import TileLayer from 'ol/layer/Tile';
import VectorTileLayer from 'ol/layer/VectorTile';
import WMTS from 'ol/source/WMTS';
import VectorTile from 'ol/source/VectorTile';
import WMTSTileGrid from 'ol/tilegrid/WMTS';
import MVT from 'ol/format/MVT';
import GeoJSON from 'ol/format/GeoJSON';
import TopoJSON from 'ol/format/TopoJSON';

import { getStyle } from '../VectorStyle';

const OL_VECTOR_FORMATS = {
    'application/vnd.mapbox-vector-tile': MVT,
    'application/json;type=geojson': GeoJSON,
    'application/json;type=topojson': TopoJSON
};

function getWMSURLs(urls) {
    return urls.map((url) => url.split("\?")[0]);
}

const createLayer = options => {
    // options.urls is an alternative name of URL.
    const urls = getWMSURLs(castArray(options.url));
    const srs = CoordinatesUtils.normalizeSRS(options.srs || 'EPSG:3857', options.allowedSRS);
    const projection = get(srs);
    const metersPerUnit = projection.getMetersPerUnit();
    const tilMatrixSetName = WMTSUtils.getTileMatrixSet(options.tileMatrixSet, srs, options.allowedSRS, options.matrixIds);
    const tileMatrixSet = head(options.tileMatrixSet.filter(tM => tM['ows:Identifier'] === tilMatrixSetName));
    const scales = tileMatrixSet && tileMatrixSet.TileMatrix.map(t => t.ScaleDenominator);
    const mapResolutions = MapUtils.getResolutions();
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
        ? applyTransform([
                parseFloat(bbox.bounds.minx),
                parseFloat(bbox.bounds.miny),
                parseFloat(bbox.bounds.maxx),
                parseFloat(bbox.bounds.maxy)
            ], getTransform(bbox.crs, options.srs))
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
    const format = (options.availableFormats || []).indexOf(options.format) !== -1 && options.format
        || !options.availableFormats && options.format || 'image/png';
    const isVector = isVectorFormat(format);

    const wmtsOptions = {
        requestEncoding,
        urls: urls.map(u => u + queryParametersString),
        layer: options.name,
        version: options.version || "1.0.0",
        matrixSet: tilMatrixSetName,
        format,
        style: options.style,
        tileGrid: new WMTSTileGrid({
            origins,
            origin: !origins ? [20037508.3428, -20037508.3428] : undefined, // Either origin or origins must be configured, never both.
            // extent: extent,
            resolutions,
            matrixIds,
            // TODO: matrixLimits from ranges
            tileSize: options.tileSize || [TILE_SIZE, TILE_SIZE]
        }),
        wrapX: true
    };

    const wmtsSource = new WMTS(wmtsOptions);
    const Layer = isVector ? VectorTileLayer : TileLayer;
    const wmtsLayer = new Layer({
        opacity: options.opacity !== undefined ? options.opacity : 1,
        zIndex: options.zIndex,
        extent: extent,
        maxResolution,
        visible: options.visibility !== false,
        source: isVector
            ? new VectorTile({
                ...wmtsOptions,
                format: new OL_VECTOR_FORMATS[options.format]({
                    dataProjection: srs
                }),
                tileUrlFunction: (...args) => wmtsSource.tileUrlFunction(...args)
            })
            : wmtsSource
    });

    if (isVector) wmtsLayer.setStyle(getStyle(options));

    return wmtsLayer;
};

const updateLayer = (layer, newOptions, oldOptions) => {
    if (oldOptions.securityToken !== newOptions.securityToken
    || oldOptions.srs !== newOptions.srs
    || oldOptions.format !== newOptions.format
    || oldOptions.style !== newOptions.style) {
        return createLayer(newOptions);
    }
    return null;
};
const compatibleLayer = options =>
    head(CoordinatesUtils.getEquivalentSRS(options.srs).filter(proj => options.matrixIds && options.matrixIds.hasOwnProperty(proj))) ? true : false;


Layers.registerType('wmts', { create: createLayer, update: updateLayer, isCompatible: compatibleLayer });
