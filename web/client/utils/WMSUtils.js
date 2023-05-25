/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { normalizeSRS } from "./CoordinatesUtils";

/**
 * Return the tileGrids that matches the srs and tileSize
 * @param {object} options
 * @param {array} tileGrids array of tileGrids objects
 * @param {string} projection projection code
 * @param {number} tileSize selected tile size, usually one of 256 or 512
 * @return {object} the selected tileGrid or undefined
 */
export const getTileGridFromLayerOptions = ({
    tileGrids = [],
    projection,
    tileSize = 256
}) => {
    return tileGrids.find((tileGrid) =>
        normalizeSRS(tileGrid.crs) === normalizeSRS(projection)
        // usually grid has the same tile grid structure
        // so we could simplify the check by taking only the first tile width for WMS
        && !!((tileGrid.tileSizes?.[0]?.[0] || tileGrid.tileSize?.[0]) === tileSize)
    );
};
