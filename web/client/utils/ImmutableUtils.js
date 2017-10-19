/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const {setWith, clone} = require('lodash');

module.exports = {
    /**
     * Immutable version of lodash set.
     * Can be used to set a value and build the proper path without mutating the original object.
     * It is useful for nested reducers
     * @param {object} obj   the object to clone and change
     * @param {string} path  the path of the
     * @param {[type]} value [description]
     */
    set: (obj, path, value) => setWith(
        clone(obj),
        path,
        value,
        clone
    )
};
