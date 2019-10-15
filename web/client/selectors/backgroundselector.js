/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

const {createSelector} = require('reselect');
const {layersSelector} = require('../selectors/layers');
const {mapTypeSelector} = require('../selectors/maptype');
const {invalidateUnsupportedLayer} = require('../utils/LayersUtils');

const metadataSourceSelector = (state) => state.backgroundSelector && state.backgroundSelector.source;
const modalParamsSelector = (state) => state.backgroundSelector && state.backgroundSelector.modalParams;
const backgroundListSelector = (state) => state.backgroundSelector && state.backgroundSelector.backgrounds;
const isDeletedIdSelector = (state) => state.backgroundSelector && state.backgroundSelector.lastRemovedId;
const removedBackgroundsThumbIdsSelector = (state) => state.backgroundSelector && state.backgroundSelector.removedBackgroundsThumbIds;
const backgroundLayersSelector = createSelector(layersSelector, mapTypeSelector, (layers, maptype) => {
    return layers.filter((l) => l && l.group === "background").map((l) => invalidateUnsupportedLayer(l, maptype)) || [];
});

module.exports = {
    metadataSourceSelector,
    modalParamsSelector,
    backgroundListSelector,
    isDeletedIdSelector,
    removedBackgroundsThumbIdsSelector,
    backgroundLayersSelector
};
