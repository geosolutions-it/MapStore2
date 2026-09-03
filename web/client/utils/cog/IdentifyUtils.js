/**
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as Cesium from 'cesium';

/**
 * Convert a cartographic position to a pixel index inside loaded COG tile data.
 * The click is converted to a ratio inside the Cesium tile rectangle.
 *
 */
export const getPixelFromTileData = ({ data, width, height, rectangle, position }) => {
    if (!data || !width || !height) {
        return null;
    }
    // Locate the click as a ratio inside the Cesium tile rectangle.
    const xRatio = (position.longitude - rectangle.west) / (rectangle.east - rectangle.west);
    const yRatio = (rectangle.north - position.latitude) / (rectangle.north - rectangle.south);
    // Pixel column in the loaded tile data.
    const x = Math.max(0, Math.min(width - 1, Math.floor(xRatio * width)));
    // Pixel row in the loaded tile data.
    const y = Math.max(0, Math.min(height - 1, Math.floor(yRatio * height)));
    // Flat array index used by each band array.
    const index = y * width + x;
    return Object.fromEntries(data.map((value, idx) => [idx, value?.[index]]));
};

/**
 * Load the COG tile covering the click position and extract its pixel values.
 * Cesium resolves the tile from the click coordinate; the provider loads the
 * raster arrays for that tile and getPixelFromTileData reads the band values.
 */
export const getCOGPixelData = ({ provider, position, zoom }) => {
    if (!provider._loadTile || !provider.tilingScheme?.positionToTileXY) {
        return Promise.resolve(null);
    }
    // Use the closest available provider level for the current map zoom.
    const maximumLevel = Math.max(0, (provider.requestLevels?.length || 1) - 1);
    const tileZoom = Math.max(provider.minimumLevel || 0, Math.min(maximumLevel, Math.round(zoom)));
    const cartographic = new Cesium.Cartographic(position.longitude, position.latitude);
    // Find the Cesium imagery tile that contains the clicked coordinate.
    const tile = provider.tilingScheme.positionToTileXY(cartographic, tileZoom);
    if (!tile) {
        return Promise.resolve(null);
    }
    const rectangle = provider.tilingScheme.tileXYToRectangle(tile.x, tile.y, tileZoom);
    // Load the tile raster arrays and read the clicked pixel from each band.
    return provider._loadTile(tile.x, tile.y, tileZoom)
        .then(({ data, width, height }) =>
            getPixelFromTileData({ data, width, height, rectangle, position }));
};

export default {
    getCOGPixelData,
    getPixelFromTileData
};
