/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import {createSelector} from 'reselect';
import {layersSelector} from '../selectors/layers';
import {mapTypeSelector} from '../selectors/maptype';
import {invalidateUnsupportedLayer} from '../utils/LayersUtils';

export const metadataSourceSelector = (state) => state.backgroundSelector && state.backgroundSelector.source;
export const modalParamsSelector = (state) => state.backgroundSelector && state.backgroundSelector.modalParams;
export const backgroundListSelector = (state) => state.backgroundSelector && state.backgroundSelector.backgrounds || [];
export const isDeletedIdSelector = (state) => state.backgroundSelector && state.backgroundSelector.lastRemovedId;
export const removedBackgroundsThumbIdsSelector = (state) => state.backgroundSelector && state.backgroundSelector.removedBackgroundsThumbIds;
export const confirmDeleteBackgroundModalSelector = (state) => state.backgroundSelector && state.backgroundSelector.confirmDeleteBackgroundModal;
export const backgroundControlsSelector = (state) => (state.controls && state.controls.backgroundSelector) || {};
export const allowBackgroundsDeletionSelector = (state) => state.backgroundSelector && state.backgroundSelector.allowDeletion;
export const backgroundLayersSelector = createSelector(layersSelector, mapTypeSelector, (layers, maptype) => {
    return layers.filter((l) => l && l.group === "background").map((l) => invalidateUnsupportedLayer(l, maptype)) || [];
});
