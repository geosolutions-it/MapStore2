/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import {get} from "lodash";

import {GPT_CONTROL_NAME} from "../actions/geoProcessingTools";
import {mapSelector} from "../selectors/map";

export const distanceSelector = state => state?.geoProcessingTools?.buffer?.distance || 100;
export const distanceUomSelector = state => state?.geoProcessingTools?.buffer?.distanceUom || "m";
export const quadrantSegmentsSelector = state => state?.geoProcessingTools?.quadrantSegments;
export const capStyleSelector = state => state?.geoProcessingTools?.capStyle;
export const bufferedLayersCounterSelector = state => state?.geoProcessingTools?.buffer?.counter ?? 0;
export const selectedToolSelector = state => state?.geoProcessingTools?.selectedTool;

export const sourceLayerIdSelector = state => state?.geoProcessingTools?.source?.layerId;
export const sourceFeatureIdSelector = state => state?.geoProcessingTools?.source?.featureId;
export const sourceFeatureSelector = state => state?.geoProcessingTools?.source?.feature;
export const sourceFeaturesSelector = state => state?.geoProcessingTools?.source?.features || [];
export const isSourceLayerInvalidSelector = state => {
    const id = sourceLayerIdSelector(state);
    return !!state?.geoProcessingTools?.flags?.invalid?.[id];
};

export const intersectionLayerIdSelector = state => state?.geoProcessingTools?.intersection?.layerId;
export const intersectionFeatureIdSelector = state => state?.geoProcessingTools?.intersection?.featureId;
export const intersectionFeatureSelector = state => state?.geoProcessingTools?.intersection?.feature;
export const intersectionFeaturesSelector = state => state?.geoProcessingTools?.intersection?.features || [];
export const intersectedLayersCounterSelector = state => state?.geoProcessingTools?.intersection?.counter ?? 0;
export const firstAttributesToRetainSelector = state => state?.geoProcessingTools?.intersection?.firstAttributesToRetain;
export const secondAttributesToRetainSelector = state => state?.geoProcessingTools?.intersection?.secondAttributesToRetain;
export const intersectionModeSelector = state => state?.geoProcessingTools?.intersection?.intersectionMode;
export const percentagesEnabledSelector = state => !!state?.geoProcessingTools?.intersection?.percentagesEnabled;
export const areasEnabledSelector = state => !!state?.geoProcessingTools?.intersection?.areasEnabled;
export const isIntersectionLayerInvalidSelector = state => {
    const id = intersectionLayerIdSelector(state);
    return !!state?.geoProcessingTools?.flags?.invalid?.[id];
};

export const isSourceFeaturesLoadingSelector = state => state?.geoProcessingTools?.flags?.featuresSourceLoading;
export const isIntersectionFeaturesLoadingSelector = state => state?.geoProcessingTools?.flags?.intersectionFeaturesLoading;
export const areAllWPSAvailableForSourceLayerSelector = state => {
    const id = sourceLayerIdSelector(state);
    return id ? state?.geoProcessingTools?.flags?.wpsAvailability?.[id] : null;
};
export const areAllWPSAvailableForIntersectionLayerSelector = state => {
    const id = intersectionLayerIdSelector(state);
    return id ? state?.geoProcessingTools?.flags?.wpsAvailabilityIntersection?.[id] : null;
};
export const checkingWPSAvailabilitySelector = state => !!state?.geoProcessingTools?.flags?.checkingWPSAvailability;
export const checkingWPSAvailabilityIntersectionSelector = state => !!state?.geoProcessingTools?.flags?.checkingIntersectionWPSAvailability;
export const isIntersectionEnabledSelector = state => !!state?.geoProcessingTools?.flags?.isIntersectionEnabled;
export const runningProcessSelector = state => !!state?.geoProcessingTools?.flags?.runningProcess;
export const showHighlightLayersSelector = state => !!state?.geoProcessingTools?.flags?.showHighlightLayers;

export const isListeningClickSelector = (state) => !!(get(mapSelector(state), 'eventListeners.click', []).find((el) => el === GPT_CONTROL_NAME));
export const selectedLayerIdSelector = (state) => state?.geoProcessingTools?.selectedLayerId;
export const selectedLayerTypeSelector = (state) => state?.geoProcessingTools?.selectedLayerType;
