/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
export const CHANGE_BROWSER_PROPERTIES = 'CHANGE_BROWSER_PROPERTIES';


export const changeBrowserProperties = (properties) => {
    return {
        type: CHANGE_BROWSER_PROPERTIES,
        newProperties: properties
    };
};
