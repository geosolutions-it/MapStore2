
/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
export const sourceLayerIdSelector = state => state?.geoProcessingTools?.source?.layerId;
export const sourceFeatureIdSelector = state => state?.geoProcessingTools?.source?.featureId;
export const sourceFeaturesSelector = state => state?.geoProcessingTools?.source?.features || [];
export const intersectionLayerIdSelector = state => state?.geoProcessingTools?.intersectionLayerId;
export const selectedToolSelector = state => state?.geoProcessingTools?.selectedTool;
export const isSourceFeaturesLoadingSelector = state => state?.geoProcessingTools?.flags?.featuresSourceLoading;
export const featuresSourceErrorSelector = state => {
    const id = sourceLayerIdSelector(state);
    return !!state?.geoProcessingTools?.source?.error?.[id];
};
export const areAllWPSAvailableForSourceLayerSelector = state => {
    const id = sourceLayerIdSelector(state);
    return id ? state?.geoProcessingTools?.flags?.wpsAvailability?.[id] : null;
};
export const areAllWPSAvailableForIntersectionLayerSelector = state => {
    const id = intersectionLayerIdSelector(state);
    return id ? state?.geoProcessingTools?.flags?.wpsAvailability?.[id] : null;
};
export const checkingWPSAvailabilitySelector = state => !!state?.geoProcessingTools?.flags?.checkingWPSAvailability;
export const checkedWPSAvailabilitySelector = state => !!state?.geoProcessingTools?.flags?.checkedWPSAvailability;
