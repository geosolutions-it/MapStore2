/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import urlParser from 'url';
import CoordinatesUtils from '../../../../utils/CoordinatesUtils';
import MapUtils from '../../../../utils/MapUtils';
import Layers from '../../../../utils/openlayers/Layers';
import SecurityUtils from '../../../../utils/SecurityUtils';

import { get, getTransform } from 'ol/proj';
import { applyTransform } from 'ol/extent';
import TileGrid from 'ol/tilegrid/TileGrid';
import VectorTileLayer from 'ol/layer/VectorTile';
import TileLayer from 'ol/layer/Tile';
import VectorTile from 'ol/source/VectorTile';
import MVT from 'ol/format/MVT';
import XYZ from 'ol/source/XYZ';
import WMTSUtils from '../../../../utils/WMTSUtils';
import { isVectorFormat } from '../../../../utils/VectorTileUtils';
import { OL_VECTOR_FORMATS, applyStyle } from '../../../../utils/openlayers/VectorTileUtils';
import { createXYZ } from 'ol/tilegrid';

const createLayer = (options) => {

    const srs = CoordinatesUtils.normalizeSRS(options.srs || 'EPSG:3857', options.allowedSRS);
    const projection = get(srs);
    const metersPerUnit = projection.getMetersPerUnit();
    const tileMatrixSetName = WMTSUtils.getTileMatrixSet(
        options.tileMatrixSet,
        srs,
        options.allowedSRS,
        options.matrixIds,
        srs,
        {
            identifierKey: 'identifier',
            supportedCRSKey: 'supportedCRS'
        }
    );

    const tileMatrixSet = options.tileMatrixSet.find(tM => {
        return tM.identifier === tileMatrixSetName;
    });
    const { identifier: tilingSchemeId, tileMatrix } = tileMatrixSet || {};
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
        : undefined;

    const tileGrid = tileMatrixSet && new TileGrid({
        minZoom: 0,
        origins,
        origin: !origins ? [20037508.3428, -20037508.3428] : undefined,
        resolutions,
        tileSizes,
        tileSize: !tileSizes ? [256, 256] : undefined
    }) || createXYZ();

    const tileUrl = ((options.tileUrls || []).find(({ format }) => format === options.format) || {}).url;
    const url = (tileUrl || '')
        .replace(/\{styleId\}/, options.style)
        .replace(/\{tileMatrixSetId\}/, tilingSchemeId)
        .replace(/\{tileMatrix\}/, tilingSchemeId === 'WebMercatorQuad' ? '{z}' : `${tilingSchemeId}:{z}`) // TODO: update z correctly
        .replace(/\{tileRow\}/, '{y}')
        .replace(/\{tileCol\}/, '{x}');

    const splitLayerUrl = url.split('?');
    const { query = {} } = splitLayerUrl[1]
        ? urlParser.parse('?' + splitLayerUrl[1], true)
        : {};
    const vParam = options._v_ ? { _v_: options._v_ } : {};
    let queryParameters = {
        ...query,
        ...vParam
    };
    SecurityUtils.addAuthenticationParameter(splitLayerUrl[0], queryParameters, options.securityToken);
    const layerUrl = decodeURI(splitLayerUrl[0]);
    const queryParametersString = urlParser.format({ query: { ...queryParameters } });

    if (isVectorFormat(options.format)) {
        const Format = OL_VECTOR_FORMATS[options.format] || MVT;
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
            zIndex: options.zIndex,
            declutter: true
        });
        applyStyle(options.vectorStyle, layer);
        return layer;
    }

    const source = new XYZ({
        tileGrid,
        projection,
        url: layerUrl + queryParametersString
    });

    const layer = new TileLayer({
        extent,
        msId: options.id,
        source: source,
        visible: options.visibility !== false,
        zIndex: options.zIndex
    });

    return layer;
};
Layers.registerType('ogc', {
    create: createLayer,
    update: (layer, newOptions, oldOptions, map) => {
        if (oldOptions.securityToken !== newOptions.securityToken
        || oldOptions.srs !== newOptions.srs
        || oldOptions.format !== newOptions.format
        || oldOptions._v_ !== newOptions._v_
        || oldOptions.style !== newOptions.style) {
            return createLayer(newOptions, map);
        }
        if (get(oldOptions, 'vectorStyle.body') !== get(newOptions, 'vectorStyle.body')
        || get(oldOptions, 'vectorStyle.url') !== get(newOptions, 'vectorStyle.url')) {
            applyStyle(newOptions.vectorStyle, layer);
        }
        return null;
    },
    render: () => {
        return null;
    }
});
