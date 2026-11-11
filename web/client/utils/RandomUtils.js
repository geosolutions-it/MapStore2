/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/


// number of values that 32 random bits can produce, from 0 to 2^32 - 1
const UINT32_VALUES_COUNT = 2 ** 32;

// number of values that 53 random bits can produce, from 0 to Number.MAX_SAFE_INTEGER
const RANDOM_VALUES_COUNT = Number.MAX_SAFE_INTEGER + 1;

/**
  * Return values in the range of [0, 1)
 */
export const randomFloat = function() {
    const int = window.crypto.getRandomValues(new Uint32Array(1))[0];
    return int / UINT32_VALUES_COUNT;
};

/**
 * Return integers in the range of [min, max)
 */
export const randomInt = function(max = Number.MAX_SAFE_INTEGER, min = 0) {
    const range = max - min;
    if (range <= 0) {
        return min;
    }
    // values at or above the last full multiple of range are discarded, so every result has the same probability
    const limit = RANDOM_VALUES_COUNT - RANDOM_VALUES_COUNT % range;
    const values = new Uint32Array(2);
    let value;
    do {
        window.crypto.getRandomValues(values);
        value = (values[0] >>> 11) * UINT32_VALUES_COUNT + values[1];
    } while (value >= limit);
    return min + value % range;
};
