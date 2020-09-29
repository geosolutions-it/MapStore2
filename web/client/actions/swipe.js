/**
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const SET_ACTIVE = "SWIPE:SET_ACTIVE";

function setActive(active) {
    return {
        type: SET_ACTIVE,
        active
    };
}

export {
    setActive,
    SET_ACTIVE
};
