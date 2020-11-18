/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

export const BOX_END = "BOX_END";
export const CHANGE_BOX_SELECTION_STATUS = "CHANGE_BOX_SELECTION_STATUS";

export function boxEnd(boxEndInfo) {
    return {
        type: BOX_END,
        boxEndInfo
    };
}

export function changeBoxSelectionStatus(status) {
    return {
        type: CHANGE_BOX_SELECTION_STATUS,
        status
    };
}
