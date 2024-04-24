/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/


/**
 * Return values in the range of [0, 1)
 */
export const randomFloat = function() {
    const int = window.crypto.getRandomValues(new Uint32Array(1))[0];
    return int / 2 ** 32;
};

/**
 * Return integers in the range of [min, max)
 *
 * @todo check that min is <= max.
 */
export const randomInt = function(max = Number.MAX_SAFE_INTEGER, min = 0) {
    const range = max - min;
    return Math.floor(randomFloat() * range + min);
};
