/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const {getCurrentResolution, getResolutions} = require('../MapUtils');
const {reproject, normalizeSRS} = require('../CoordinatesUtils');
const {
    getTileMatrixSet,
    limitMatrix,
    getMatrixIds,
    getDefaultMatrixId
} = require('../WMTSUtils');
const {getLayerUrl} = require('../LayersUtils');
const {optionsToVendorParams} = require('../VendorParamsUtils');

const {isObject, isNil} = require('lodash');

const assign = require('object-assign');

module.exports = {
    buildRequest: (layer, props) => {
        const resolution = isNil(props.map.resolution)
            ? getCurrentResolution(Math.round(props.map.zoom), 0, 21, 96)
            : props.map.resolution;
        const resolutions = layer.resolutions || getResolutions();
        const tileSize = layer.tileSize || 256; // tilegrid.getTileSize(props.map.zoom);
        const tileOrigin = [
            layer.originX || -20037508.3428,
            layer.originY || 20037508.3428
        ];

        const wrongLng = props.point.latlng.lng;
        // longitude restricted to the [-180°,+180°] range
        const lngCorrected = wrongLng - 360 * Math.floor(wrongLng / 360 + 0.5);
        const center = {x: lngCorrected, y: props.point.latlng.lat};
        let centerProjected = reproject(center, 'EPSG:4326', props.map.projection);

        const srs = normalizeSRS(layer.srs || props.map.projection || 'EPSG:3857', layer.allowedSRS);
        const tileMatrixSet = getTileMatrixSet(layer.tileMatrixSet, srs, layer.allowedSRS, layer.matrixIds);

        const fx = (centerProjected.x - tileOrigin[0]) / (resolution * tileSize);
        const fy = (tileOrigin[1] - centerProjected.y) / (resolution * tileSize);
        const tileCol = Math.floor(fx);
        const tileRow = Math.floor(fy);
        const tileI = Math.floor((fx - tileCol) * tileSize);
        const tileJ = Math.floor((fy - tileRow) * tileSize);

        const matrixIds = limitMatrix(layer.matrixIds && getMatrixIds(layer.matrixIds, tileMatrixSet || srs) || getDefaultMatrixId(layer), resolutions.length);

        const params = optionsToVendorParams({
            layerFilter: layer.layerFilter,
            filterObj: layer.filterObj,
            params: assign({}, layer.baseParams, layer.params, props.params)
        });

        return {
            request: {
                service: 'WMTS',
                request: 'GetFeatureInfo',
                layer: layer.name,
                infoformat: props.format,
                style: layer.style || '',
                ...assign({}, params),
                tilecol: tileCol,
                tilerow: tileRow,
                tilematrix: matrixIds[Math.round(props.map.zoom)],
                tilematrixset: tileMatrixSet,
                i: tileI,
                j: tileJ
            },
            metadata: {
                title: isObject(layer.title) ? layer.title[props.currentLocale] || layer.title.default : layer.title,
                regex: layer.featureInfoRegex
            },
            url: getLayerUrl(layer).replace(/[?].*$/g, '')
        };
    }
};
