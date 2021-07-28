/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { get, find } from "lodash";
import { createSelector } from "reselect";

/**
 * Selects the open/closed state of the mediaEditor
 * @memberof selectors
 * @param {object} state application state
 */
export const openSelector = state => get(state, "mediaEditor.open");
export const editingSelector = state => get(state, "mediaEditor.saveState.editing", false);
export const addingSelector = state => get(state, "mediaEditor.saveState.addingMedia", false);
export const saveStateSelector = state => get(state, "mediaEditor.saveState");
export const sourceIdSelector = state => get(state, "mediaEditor.settings.sourceId");
export const currentMediaTypeSelector = state => get(state, "mediaEditor.settings.mediaType");
export const mediaTypesSelector = state => get(state, "mediaEditor.settings.mediaTypes");
export const sourcesSelector = state => get(state, "mediaEditor.settings.sources");
export const sourcesForMediaTypeSelector = state => get(mediaTypesSelector(state), `${currentMediaTypeSelector(state)}.sources`, []);
export const selectedSourceSelector = state => get(sourcesSelector(state), sourceIdSelector(state), {});
export const getSourceByIdSelectorCreator = sourceId => state => get(sourcesSelector(state), `${sourceId}`, {});
export const availableSourcesSelector = state => sourcesForMediaTypeSelector(state).map(s => ({id: s, name: getSourceByIdSelectorCreator(s)(state).name}));
export const resultDataSelector = state => get(state, `mediaEditor.data["${currentMediaTypeSelector(state)}"]["${sourceIdSelector(state)}"].resultData`);
export const getCurrentMediaResourcesParams = state => get(state, `mediaEditor.data["${currentMediaTypeSelector(state)}"]["${sourceIdSelector(state)}"].params`);
export const currentResourcesSelector = state => get(resultDataSelector(state), "resources");
export const getCurrentMediaResourcesTotalCount = state => get(resultDataSelector(state), "totalCount");
export const selectedIdSelector = state => get(state, "mediaEditor.selected");
export const getLoadingSelectedMedia = state => get(state, "mediaEditor.loadingSelected");
export const getLoadingMediaList = state => get(state, "mediaEditor.loadingList");
export const selectedItemSelector = createSelector(
    currentResourcesSelector,
    selectedIdSelector,
    (resources = [], id) => find(resources, {id})
);
export const disabledMediaTypeSelector = state => get(state, "mediaEditor.disabledMediaType", []);

/**
 * Disable `apply` on empty selection for map media editor when geostory section is GeoCarousel,
 * here disable media type value is available only in GeoCarousel section
 */
export const disableApplyMapMedia = (state) =>
    disabledMediaTypeSelector(state).length && !selectedItemSelector(state) && currentMediaTypeSelector(state) === 'map';
