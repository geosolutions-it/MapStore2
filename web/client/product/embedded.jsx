/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

const {loadVersion} = require('../actions/version');

require('./main')(
    require('./appConfigEmbedded'),
    require('./apiPlugins.js'),
    (cfg) => ({
        ...cfg,
        initialActions: [loadVersion]
    })
);
