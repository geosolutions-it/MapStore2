/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const { withHandlers } = require('recompose');

const enhancer = withHandlers({
    onRemoveSelected: ({ selectedLayers = [], removeLayersById = () => { }, onNodeSelect = () => { } }) => () => {
        removeLayersById(selectedLayers);
        selectedLayers.forEach(layer => onNodeSelect(layer, 'layer', false));
    }
});

module.exports = enhancer;
