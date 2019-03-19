/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

const metadataSourceSelector = (state) => state.backgroundSelector && state.backgroundSelector.source;
const modalParamsSelector = (state) => state.backgroundSelector && state.backgroundSelector.modalParams;
const backgroundThumbSelector = (state) => state.backgroundSelector && state.backgroundSelector.modalParams && state.backgroundSelector.modalParams.CurrentNewThumbnail;
const unsavedChangesSelector = (state) => state.backgroundSelector && state.backgroundSelector.unsavedChanges;
const isEditSelector = (state) => state.backgroundSelector && state.backgroundSelector.editing;
const backgroundListSelector = (state) => state.backgroundSelector && state.backgroundSelector.backgrounds;
const backgroundsSourceListSelector = (state) => state.backgroundSelector && state.backgroundSelector.backgroundSourcesId;
const isDeletedIdSelector = (state) => state.backgroundSelector && state.backgroundSelector.lastRemovedId;
const additionalParametersSelector = (state) => state.backgroundSelector && state.backgroundSelector.additionalParameters;
// const backgroundList = find(list, id);
module.exports = {
    isEditSelector,
    metadataSourceSelector,
    modalParamsSelector,
    backgroundThumbSelector,
    backgroundListSelector,
    unsavedChangesSelector,
    backgroundsSourceListSelector,
    isDeletedIdSelector,
    additionalParametersSelector
};
