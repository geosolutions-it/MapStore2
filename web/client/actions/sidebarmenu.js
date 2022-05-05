/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

export const SET_LAST_ACTIVE_ITEM = 'SIDEBARMENU:SET_LAST_ACTIVE_ITEM';

export function setLastActiveItem(value) {
    return {
        type: SET_LAST_ACTIVE_ITEM,
        value
    };
}
