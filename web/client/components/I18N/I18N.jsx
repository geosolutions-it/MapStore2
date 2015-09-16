/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

if (!global.Intl) {
    require.ensure([
        'intl'
    ], function(require) {
        require('intl');
        module.exports.Message = require('./Message');
        module.exports.HTML = require('./HTML');
    });
} else {
    module.exports.Message = require('./Message');
    module.exports.HTML = require('./HTML');
}
