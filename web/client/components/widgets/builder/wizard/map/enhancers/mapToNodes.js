/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const LayersUtils = require('../../../../../../utils/LayersUtils');
const { withProps } = require('recompose');

/**
 *
 * @param {*} param0
 */
const mapToNodes = ({ map }) => ({
    nodes: (
        ({ layers }) => (LayersUtils.denormalizeGroups(layers.flat, layers.groups).groups)
    )(LayersUtils.splitMapAndLayers(map))
});
module.exports = withProps(mapToNodes);
