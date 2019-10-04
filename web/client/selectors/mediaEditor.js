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
export const editingSelector = state => get(state, "mediaEditor.saveState.editing");
export const saveStateSelector = state => get(state, "mediaEditor.saveState");
export const sourceIdSelector = state => get(state, "mediaEditor.settings.sourceId");
export const mediaTypeSelector = state => get(state, "mediaEditor.settings.mediaType");
export const mediaTypesSelector = state => get(state, "mediaEditor.settings.mediaTypes");
export const sourcesSelector = state => get(state, "mediaEditor.settings.sources");
export const sourcesForMediaTypeSelector = state => get(mediaTypesSelector(state), `${mediaTypeSelector(state)}.sources`, []);
export const currentSource = sourceId => state => get(sourcesSelector(state), `${sourceId}`, {});
// export const availableSourcesSelector = state => pick(sourcesSelector(state), sourcesForMediaTypeSelector(state) );
export const availableSourcesSelector = state => sourcesForMediaTypeSelector(state).map(s => ({id: s, name: currentSource(s)(state).name}));
export const resultDataSelector = state => get(state, `mediaEditor.data["${mediaTypeSelector(state)}"]["${sourceIdSelector(state)}"].resultData`);
export const currentResourcesSelector = state => get(resultDataSelector(state), "resources");
export const selectedIdSelector = state => get(state, "mediaEditor.selected");
export const selectedItemSelector = createSelector(
    currentResourcesSelector,
    selectedIdSelector,
    (resources = [], id) => find(resources, {id})
);
