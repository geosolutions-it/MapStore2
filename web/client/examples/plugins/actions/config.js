/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const SAVE_PLUGIN_CONFIG = 'SAVE_PLUGIN_CONFIG';

function savePluginConfig(plugin, cfg) {
    return {
        type: SAVE_PLUGIN_CONFIG,
        plugin,
        cfg
    };
}

module.exports = {SAVE_PLUGIN_CONFIG, savePluginConfig};
