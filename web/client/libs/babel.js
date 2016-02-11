/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const Babel = (function() {
    let cache;
    return {
        transform: function(str) {
            return { code: cache[str]};
        },
        bind: function(obj) {
            cache = obj;
        },
        clear: function() {
            cache = null;
        }
    };
})();

module.exports = Babel;
