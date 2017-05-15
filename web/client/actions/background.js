/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const SET_LAYER_BACKGROUND = 'SET_LAYER_BACKGROUND';
const SET_START_BACKGROUND = 'SET_START_BACKGROUND';

function setLayerBackground(name, layer) {
    return {
        type: SET_LAYER_BACKGROUND,
        name,
        layer
    };
}

function setStartBackground(start) {
    return {
        type: SET_START_BACKGROUND,
        start
    };
}

module.exports = {
    SET_LAYER_BACKGROUND,
    SET_START_BACKGROUND,
    setLayerBackground,
    setStartBackground
};
