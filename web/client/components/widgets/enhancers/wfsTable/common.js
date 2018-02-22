/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Gets the layer URL for the layer
 * @param {Object} layer
 * @returns {string} layer url
 */
const getLayerUrl = l => l && l.wpsUrl || (l.search && l.search.url) || l.url;
module.exports = {
    getLayerUrl
};
