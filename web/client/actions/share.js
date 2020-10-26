/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

export const CHANGE_SHARE_STATE = 'CHANGE_SHARE_STATE';

export function changeShareState(enabled) {
    return {
        type: CHANGE_SHARE_STATE,
        enabled: enabled
    };
}
