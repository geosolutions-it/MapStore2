/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

export const START_UPDATING_RESOURCE = "AUTO_RESOURCE_UPDATE:START_UPDATING_RESOURCE";

export const startUpdatingResource = (options) => {
    return {
        type: START_UPDATING_RESOURCE,
        options
    };
};
