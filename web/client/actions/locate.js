/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const CHANGE_LOCATE_STATE = 'CHANGE_LOCATE_STATE';

function changeLocateState(enabled) {
    return {
        type: CHANGE_LOCATE_STATE,
        enabled: enabled
    };
}


module.exports = {
    CHANGE_LOCATE_STATE,
    changeLocateState
};
