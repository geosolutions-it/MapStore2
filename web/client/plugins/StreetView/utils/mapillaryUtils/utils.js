/**
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { S2GeometryProvider } from 'mapillary-js';
import { baseImageLevel, sizeToLevelColumnsRows, tileToPixelCoords2D } from './tilemath.js';

export const debugTiles = (imageSize, request, tileSize = 256) => {
    const max = baseImageLevel(imageSize);
    const level = {
        z: request.z,
        max
    };
    const { columns, rows } = sizeToLevelColumnsRows(imageSize, level);
    let node = [];
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < columns; x++) {
            const pixel = tileToPixelCoords2D({ x, y }, imageSize, level);
            const aspect = pixel.w / pixel.h;
            const width = tileSize;
            const height = tileSize / aspect;
            const canvas = document.createElement('canvas');
            canvas.setAttribute('width', width);
            canvas.setAttribute('height', height);
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, width, height);
            ctx.strokeStyle = '#ff0000';
            ctx.strokeRect(0, 0, width, height);
            ctx.fillStyle = '#000000';
            ctx.font = "10px monospace";
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(`x: ${x}, y: ${y}, z: ${request.z}`, width / 2, height / 2);
            node.push({
                url: canvas.toDataURL(),
                x,
                y,
                z: request?.z
            });
        }
    }
    return {
        node,
        node_id: request.imageId
    };
};

export const getCellGridCollection = ({
    features = [],
    level = 17 // default value in mapillary
}) => {
    const geometryProvider = new S2GeometryProvider(level);
    const cellsIds = features.reduce((acc, feature) => {
        const geometry = { lat: feature.geometry.coordinates[1], lng: feature.geometry.coordinates[0] };
        const cellId = geometryProvider.lngLatToCellId(geometry);
        return {
            ...acc,
            [cellId]: acc[cellId] ? [ ...acc[cellId], feature] : [feature]
        };
    }, {});
    return {
        type: 'FeatureCollection',
        features: Object.keys(cellsIds).map((cellId) => {
            const height = cellsIds[cellId].reduce((value, feature) => feature.geometry.coordinates[2] < value ? feature.geometry.coordinates[2] : value, Infinity);
            const extrudedHeight = cellsIds[cellId].reduce((value, feature) => feature.geometry.coordinates[2] > value ? feature.geometry.coordinates[2] : value, -Infinity);
            const coordinates = geometryProvider.getVertices(cellId).map(({ lat, lng }) => {
                return [lng, lat];
            });
            return {
                type: 'Feature',
                properties: {
                    height,
                    extrudedHeight
                },
                geometry: {
                    type: 'Polygon',
                    coordinates: [[...coordinates, coordinates[0]]]
                }
            };
        })
    };
};
