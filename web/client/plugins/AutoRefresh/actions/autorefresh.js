/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

export const AUTOREFRESH_SET_ENABLED = 'AUTOREFRESH:SET_ENABLED';

export const autorefreshSetEnabled = (enabled, layers) => {
    return {
        type: AUTOREFRESH_SET_ENABLED,
        enabled,
        layers
    };
};

