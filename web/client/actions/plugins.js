/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const LOAD_PLUGINS = 'LOAD_PLUGINS';

function loadPlugins(plugins) {
    return {
        type: LOAD_PLUGINS,
        plugins
    };
}
module.exports = {LOAD_PLUGINS, loadPlugins};
