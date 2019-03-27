/**
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import head from 'lodash/head';
import urlParser from 'url';

import CoordinatesUtils from '../../../../utils/CoordinatesUtils';
import MapUtils from '../../../../utils/MapUtils';
import Layers from '../../../../utils/openlayers/Layers';
import SecurityUtils from '../../../../utils/SecurityUtils';

import {get, getTransform} from 'ol/proj';
import {applyTransform} from 'ol/extent';
import TileGrid from 'ol/tilegrid/TileGrid';
import VectorTileLayer from 'ol/layer/VectorTile';
import VectorTile from 'ol/source/VectorTile';
import MVT from 'ol/format/MVT';

import { isVectorFormat } from '../../../../utils/VectorTileUtils';
import { OL_VECTOR_FORMATS, applyStyle } from '../../../../utils/openlayers/VectorTileUtils';

const createLayer = (options) => {

    const srs = CoordinatesUtils.normalizeSRS(options.srs || 'EPSG:3857', options.allowedSRS);
    const projection = get(srs);
    const metersPerUnit = projection.getMetersPerUnit();

    const tilingScheme = head(options.tilingSchemes
        && options.tilingSchemes.schemes
        && options.tilingSchemes.schemes.filter(({ supportedCRS }) => supportedCRS === srs));

    const { identifier: tilingSchemeId, tileMatrix, boundingBox } = tilingScheme || {};
    const scales = tileMatrix && tileMatrix.map(({ scaleDenominator }) => scaleDenominator);
    const mapResolutions = MapUtils.getResolutions();

    const scaleToResolution = s => s * 0.28E-3 / metersPerUnit;
    const matrixResolutions = options.resolutions || scales && scales.map(scaleToResolution);
    const resolutions = matrixResolutions || mapResolutions;

    const switchOriginXY = projection.getAxisOrientation().substr(0, 2) === 'ne';
    const origins = tileMatrix && tileMatrix
        .map(({ topLeftCorner } = {}) => topLeftCorner)
        .map(([ x, y ] = []) => switchOriginXY ? [y, x] : [x, y]);

    const tileSizes = tileMatrix && tileMatrix
        .map(({tileWidth, tileHeight}) => [tileWidth, tileHeight]);

    const bbox = options.bbox;

    const extent = bbox
        ? applyTransform([
            parseFloat(bbox.bounds.minx),
            parseFloat(bbox.bounds.miny),
            parseFloat(bbox.bounds.maxx),
            parseFloat(bbox.bounds.maxy)
        ], getTransform(bbox.crs, options.srs))
        : null;

    const tileGridExtent = boundingBox && boundingBox.lowerCorner && boundingBox.upperCorner
        ? [
            ...boundingBox.lowerCorner,
            ...boundingBox.upperCorner
        ]
        : null;

    const tileGrid = new TileGrid({
        extent: tileGridExtent,
        minZoom: 0,
        origins,
        origin: !origins ? [20037508.3428, -20037508.3428] : undefined,
        resolutions,
        tileSizes,
        tileSize: !tileSizes ? [256, 256] : undefined
    });

    let url = (options.url || '')
        .replace(/\{tilingSchemeId\}/, tilingSchemeId)
        .replace(/\{level\}/, '{z}')
        .replace(/\{row\}/, '{y}')
        .replace(/\{col\}/, '{x}');

    let queryParameters = { };
    SecurityUtils.addAuthenticationParameter(url, queryParameters, options.securityToken);

    const layerUrl = decodeURI(url);
    const queryParametersString = urlParser.format({ query: { ...queryParameters } });

    const Format = isVectorFormat(options.format) && OL_VECTOR_FORMATS[options.format] || MVT;

    const source = new VectorTile({
        format: new Format({
            dataProjection: srs,
            layerName: '_layer_'
        }),
        tileGrid,
        url: layerUrl + queryParametersString
    });

    const layer = new VectorTileLayer({
        extent,
        msId: options.id,
        source: source,
        visible: options.visibility !== false,
        zIndex: options.zIndex
    });

    applyStyle(options.vectorStyle, layer);

    return layer;
};
Layers.registerType('wfs3', {
    create: createLayer,
    update: (layer, newOptions, oldOptions) => {
        if (oldOptions.securityToken !== newOptions.securityToken
        || oldOptions.srs !== newOptions.srs) {
            return createLayer(newOptions);
        }
        return null;
    },
    render: () => {
        return null;
    }
});
