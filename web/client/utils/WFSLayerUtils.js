/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { optionsToVendorParams } from './VendorParamsUtils';

export const needsReload = (oldOptions, newOptions) => {
    const oldParams = { ...(optionsToVendorParams(oldOptions) || {}), _v_: oldOptions._v_ };
    const newParams = { ...(optionsToVendorParams(newOptions) || {}), _v_: newOptions._v_ };
    return ["_v_", "CQL_FILTER", "VIEWPARAMS"].reduce((found, param) => {
        if (oldParams[param] !== newParams[param]) {
            return true;
        }
        return found;
    }, false);
};
