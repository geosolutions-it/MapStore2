/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {getCurrentResolution, getResolutions, METERS_PER_UNIT} from '../MapUtils';
import {
    reproject,
    normalizeSRS,
    determineCrs
} from '../CoordinatesUtils';
import {
    getTileMatrixSet,
    limitMatrix,
    getMatrixIds,
    getDefaultMatrixId,
    parseTileMatrixSetOption
} from '../WMTSUtils';
import {getLayerUrl} from '../LayersUtils';
import {optionsToVendorParams} from '../VendorParamsUtils';
import { getAuthorizationBasic } from '../SecurityUtils';

import {isObject, isNil, get} from 'lodash';

import Rx, {Observable} from "rxjs";
import axios from "../../libs/ajax";
import {parseString} from "xml2js";
import {stripPrefix} from "xml2js/lib/processors";

export default {
    buildRequest: (_layer, props) => {
        const layer = parseTileMatrixSetOption(_layer);
        const resolution = isNil(props.map.resolution)
            ? getCurrentResolution(Math.round(props.map.zoom), 0, 21, 96)
            : props.map.resolution;
        const wrongLng = props.point.latlng.lng;
        // longitude restricted to the [-180°,+180°] range
        const lngCorrected = wrongLng - 360 * Math.floor(wrongLng / 360 + 0.5);
        const center = {x: lngCorrected, y: props.point.latlng.lat};
        let centerProjected = reproject(center, 'EPSG:4326', props.map.projection);

        const srs = normalizeSRS(layer.srs || props.map.projection || 'EPSG:3857', layer.allowedSRS);
        const projection = determineCrs(srs);
        const metersPerUnit = METERS_PER_UNIT[projection?.units] ? METERS_PER_UNIT[projection.units] : 1;
        const tileMatrixSet = getTileMatrixSet(layer.tileMatrixSet, srs, layer.allowedSRS, layer.matrixIds);
        /*
        * WMTS assumes a DPI 90.7 instead of 96 as documented in the WMTSCapabilities document:
        * "The tile matrix set that has scale values calculated based on the dpi defined by OGC specification
        * (dpi assumes 0.28mm as the physical distance of a pixel)."
        */
        const scaleToResolution = s => s * 0.28E-3 / metersPerUnit;
        const availableTileMatrix = layer?.availableTileMatrixSets?.[tileMatrixSet]?.tileMatrixSet;
        const resolutions = availableTileMatrix?.TileMatrix
            ? availableTileMatrix.TileMatrix.map((matrix) => scaleToResolution(Number(matrix.ScaleDenominator)))
            : layer.resolutions || getResolutions();
        const matrixIds = limitMatrix(layer.matrixIds && getMatrixIds(layer.matrixIds, tileMatrixSet || srs) || getDefaultMatrixId(layer), resolutions.length);
        const closestResolution = resolutions.reduce((prev, curr) =>
            (Math.abs(curr - resolution) < Math.abs(prev - resolution) ? curr : prev)
        );
        const matrixIdIndex = resolutions.indexOf(closestResolution);
        const currentTileMatrixId = matrixIds[matrixIdIndex];
        const currentTileMatrixInfo = (availableTileMatrix?.TileMatrix || [])
            .find((level) => level['ows:Identifier'] === currentTileMatrixId?.identifier);
        const tileSize = (currentTileMatrixInfo?.TileWidth && currentTileMatrixInfo?.TileHeight) ?
            [parseInt(currentTileMatrixInfo.TileWidth, 10), parseInt(currentTileMatrixInfo.TileHeight, 10)]
            : layer.tileSize
                ? [layer.tileSize, layer.tileSize]
                : [256, 256];
        const topLeftCorner = currentTileMatrixInfo?.TopLeftCorner
            ? currentTileMatrixInfo.TopLeftCorner.split(' ').map(parseFloat)
            : undefined;
        const tileOrigin = topLeftCorner || [
            layer.originX || -20037508.3428,
            layer.originY || 20037508.3428
        ];
        const fx = (centerProjected.x - tileOrigin[0]) / (resolution * tileSize[0]);
        const fy = (tileOrigin[1] - centerProjected.y) / (resolution * tileSize[1]);
        const tileCol = Math.floor(fx);
        const tileRow = Math.floor(fy);
        const tileI = Math.floor((fx - tileCol) * tileSize[0]);
        const tileJ = Math.floor((fy - tileRow) * tileSize[1]);

        const params = optionsToVendorParams({
            layerFilter: layer.layerFilter,
            filterObj: layer.filterObj,
            params: Object.assign({}, layer.baseParams, layer.params, props.params)
        });

        return {
            request: {
                service: 'WMTS',
                request: 'GetFeatureInfo',
                layer: layer.name,
                infoformat: props.format,
                format: layer.format,
                style: layer.style || '',
                ...Object.assign({}, params),
                tilecol: tileCol,
                tilerow: tileRow,
                tilematrix: currentTileMatrixId?.identifier,
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
    },
    getIdentifyFlow: (layer, basePath, params) => {
        const headers = getAuthorizationBasic(layer?.security?.sourceId);
        return Observable.defer(() => axios.get(basePath, { params, headers }))
            .catch((e) => {
                if (e.data.indexOf("ExceptionReport") > 0) {
                    return Rx.Observable.bindNodeCallback( (data, callback) => parseString(data, {
                        tagNameProcessors: [stripPrefix],
                        explicitArray: false,
                        mergeAttrs: true
                    }, callback))(e.data).map(data => {
                        const code = get(data, "ExceptionReport.Exception.exceptionCode");
                        if (code === 'TileOutOfRange') {
                            return params.infoformat === 'text/plain' ? {data: 'no features were found'} : { data: { features: []}};
                        }
                        return e;
                    });

                }
                return e;
            });
    }

};
