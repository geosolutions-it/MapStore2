/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const ON_STARTUP = 'ON_STARTUP';

function onStartUp(toolId) {
    return {
        type: ON_STARTUP,
        toolId
    };
}

module.exports = {
    ON_STARTUP, onStartUp
 };
