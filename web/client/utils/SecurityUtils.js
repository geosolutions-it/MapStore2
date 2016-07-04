/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const SecurityUtils = {
    /**
     * Return the user attributes as an array. If the provided user is not
     * defined or doens't have any attributes an empty array is returned.
     */
    getUserAttributes: function(user) {
        if (!user || !user.attribute) {
            return [];
        }
        let attributes = user.attribute;
        // if the user has only one attribute we need to put it in an array
        return Array.isArray(attributes) ? attributes : [attributes];
    }
};
module.exports = SecurityUtils;
