/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

export const MANAGER_ITEM_SELECTED = 'MANAGER_ITEM_SELECTED';

export function itemSelected(toolId) {
    return {
        type: MANAGER_ITEM_SELECTED,
        toolId
    };
}
