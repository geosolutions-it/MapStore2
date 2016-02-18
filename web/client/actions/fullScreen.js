/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const TOGGLE_FULLSCREEN = 'TOGGLE_FULLSCREEN';

function toggleFullScreen(fullscreen) {
    return {
        type: TOGGLE_FULLSCREEN,
        fullscreen: fullscreen
    };
}
module.exports = {toggleFullScreen, TOGGLE_FULLSCREEN};
