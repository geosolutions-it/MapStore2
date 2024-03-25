/**
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

// from https://github.com/mapillary/mapillary-js/blob/312f14bddbb544cd461848c1147d439ee128a4a4/src/tile/TileMath.ts

const TILE_SIZE = 1024;

function levelScale(level) {
    return Math.pow(2, level.z - level.max);
}

function rawImageLevel(size) {
    const s = Math.max(size.w, size.h);
    return Math.log(s) / Math.log(2);
}

export function baseImageLevel(size) {
    return Math.ceil(rawImageLevel(size));
}

export function sizeToLevelColumnsRows(size, level) {
    const scale = levelScale(level);
    const rows = Math.ceil(scale * size.h / TILE_SIZE);
    const columns = Math.ceil(scale * size.w / TILE_SIZE);
    return { columns, rows };
}

export function tileToPixelCoords2D(
    tile,
    size,
    level) {
    const scale = 1 / levelScale(level);
    const scaledTS = scale * TILE_SIZE;
    const x = scaledTS * tile.x;
    const y = scaledTS * tile.y;
    const w = Math.min(scaledTS, size.w - x);
    const h = Math.min(scaledTS, size.h - y);
    return { h, x, y, w };
}

export const getTilesAtZ = (imageSize, z) => {
    let tiles = [];
    const max = baseImageLevel(imageSize);
    const level = { z, max };
    const { columns, rows } = sizeToLevelColumnsRows(imageSize, level);
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < columns; x++) {
            const pixel = tileToPixelCoords2D({ x, y }, imageSize, level);
            tiles.push({ x, y, z, pixel });
        }
    }
    return tiles;
};

export const getTiles = (imageSize) => {
    const max = baseImageLevel(imageSize);
    let tiles = [];
    for (let z = 11; z <= max; z++) {
        const level = { z, max };
        const { columns, rows } = sizeToLevelColumnsRows(imageSize, level);
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < columns; x++) {
                const pixel = tileToPixelCoords2D({ x, y }, imageSize, level);
                tiles.push({ x, y, z, pixel });
            }
        }
    }
    return tiles;
};
