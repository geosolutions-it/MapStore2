/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Layers from '../../../../utils/openlayers/Layers';
import isArray from 'lodash/isArray';
import { addAuthenticationParameter } from '../../../../utils/SecurityUtils';
import  {
    loadTile,
    getElevation as getElevationFunc,
    getElevationKey,
    getTileRelativePixel
} from '../../../../utils/ElevationUtils';
import TileLayer from 'ol/layer/Tile';
import TileWMS from 'ol/source/TileWMS';
import { transform } from 'ol/proj';
import CoordinatesUtils from '../../../../utils/CoordinatesUtils';
import {
    proxySource,
    getWMSURLs,
    wmsToOpenlayersOptions,
    toOLAttributions,
    generateTileGrid
} from '../../../../utils/openlayers/WMSUtils';

function getElevation(pos) {
    try {
        const map = this.get('map');
        const tileGrid = this.getSource().getTileGrid();
        const tileSize = tileGrid.getTileSize();
        const tileSizeArray = isArray(tileSize) ? tileSize : [tileSize, tileSize];
        // pos is the mouse event coordinate in map projection,
        // the tile grid could use a different projection (see srs option)
        const coords = transform(pos, map.getView().getProjection(), this.get('gridProjection'));
        // lookup the value from the most detailed requested tile level,
        // the level used by the renderer cannot be deduced from the map zoom
        // when the tile grid projection is different from the map one
        const zoomLevels = this.get('requestedZoomLevels') || [];
        for (let i = 0; i < zoomLevels.length; i++) {
            const tilePoint = tileGrid.getTileCoordForCoordAndZ(coords, zoomLevels[i]);
            const [z, x, y] = tilePoint;
            const extent = tileGrid.getTileCoordExtent(tilePoint);
            const elevation = getElevationFunc(
                getElevationKey(x, y, z, this.get('msId')),
                getTileRelativePixel(coords, extent, tileSizeArray),
                tileSizeArray[0],
                this.get('nodata'),
                this.get('littleEndian')
            );
            if (elevation.available) {
                return elevation.value;
            }
        }
        return '';
    } catch (e) {
        return '';
    }
}

const createWMSElevationLayer = (options, map) => {
    const urls = getWMSURLs(isArray(options.url) ? options.url : [options.url]);
    let queryParameters = wmsToOpenlayersOptions(options) || {};
    queryParameters = addAuthenticationParameter(urls[0] || '', queryParameters, options.securityToken, options.security?.sourceId);
    const requestedZoomLevels = [];
    const layer = new TileLayer({
        msId: options.id,
        opacity: options.opacity !== undefined ? options.opacity : 1,
        visible: options.visibility !== false,
        zIndex: options.zIndex,
        minResolution: options.minResolution,
        maxResolution: options.maxResolution,
        source: new TileWMS({
            attributions: toOLAttributions(options.credits),
            urls: urls,
            crossOrigin: options.crossOrigin,
            params: {
                ...queryParameters,
                format: options?.format || 'application/bil16'
            },
            tileGrid: generateTileGrid(options, map),
            tileLoadFunction: (imageTile, src) => {
                let newSrc = proxySource(options.forceProxy, src);
                const coords = imageTile.getTileCoord();
                imageTile.getImage().src = "";
                const [z, x, y] = coords;
                if (!requestedZoomLevels.includes(z)) {
                    requestedZoomLevels.push(z);
                    requestedZoomLevels.sort((a, b) => b - a);
                }
                loadTile(newSrc, coords, getElevationKey(x, y, z, options.id));
            }
        })
    });
    layer.set('map', map);
    layer.set('nodata', options.nodata);
    layer.set('littleEndian', options?.littleEndian ?? options?.littleendian ?? false);
    // same projection used by generateTileGrid to build the tile grid
    layer.set('gridProjection', CoordinatesUtils.normalizeSRS(options.srs || map?.getView()?.getProjection()?.getCode() || 'EPSG:3857', options.allowedSRS));
    layer.set('requestedZoomLevels', requestedZoomLevels);
    layer.set('getElevation', getElevation.bind(layer));

    if (!map.get('msElevationLayers')) {
        map.set('msElevationLayers', []);
    }
    map.get('msElevationLayers').push(layer);
    const removeElevationLayer = (e) => {
        if (e.key === 'map') {
            const newMap = e.target.get(e.key);
            if (newMap === null) {
                map.set('msElevationLayers',
                    map.get('msElevationLayers')
                        .filter(elevationLayer => elevationLayer.get('msId') !== options.id)
                );
                layer.un('propertychange', removeElevationLayer);
            }
        }
    };
    layer.on('propertychange', removeElevationLayer);
    return layer;
};

Layers.registerType('elevation', {
    create: (options, map) => {
        if (options.provider === 'wms') {
            return createWMSElevationLayer(options, map);
        }
        return null;
    }
});
