/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const utils = require('./jsDocUtils');

const src = utils.parseSections(utils.defaultSections);

utils.updateConfig((config) => {
    return {
        ...config,
        src: [
            {
                ...config.src[0],
                jsapi: src.jsapi,
                plugins: src.plugins
            }
        ]
    };
});
