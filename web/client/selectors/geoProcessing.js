/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import {get, head, memoize} from "lodash";

import {GPT_CONTROL_NAME} from "../actions/geoProcessing";
import {mapSelector} from "../selectors/map";
import {layersSelector} from "../selectors/layers";
import {hasWFSService} from '../utils/LayersUtils';
import {densifyGeodesicFeature, transformCircleIntoPolygon} from '../utils/GeoProcessingUtils';

// buffer
export const distanceSelector = state => state?.geoProcessing?.buffer?.distance || 100;
export const distanceUomSelector = state => state?.geoProcessing?.buffer?.distanceUom || "m";
export const quadrantSegmentsSelector = state => state?.geoProcessing?.buffer?.quadrantSegments;
export const capStyleSelector = state => state?.geoProcessing?.buffer?.capStyle;

// source
export const sourceLayerIdSelector = state => state?.geoProcessing?.source?.layerId;
export const sourceFeatureIdSelector = state => state?.geoProcessing?.source?.featureId;
export const sourceFeatureSelector = state => state?.geoProcessing?.source?.feature;
export const sourceFeaturesSelector = state => state?.geoProcessing?.source?.features || [];
export const sourceTotalCountSelector = state => state?.geoProcessing?.source?.totalCount || 0;
export const sourceCurrentPageSelector = state => state?.geoProcessing?.source?.currentPage || 0;
export const isSourceLayerInvalidSelector = state => {
    const id = sourceLayerIdSelector(state);
    return !!state?.geoProcessing?.flags?.invalid?.[id];
};
// intersection
export const intersectionLayerIdSelector = state => state?.geoProcessing?.intersection?.layerId;
export const intersectionFeatureIdSelector = state => state?.geoProcessing?.intersection?.featureId;
export const intersectionFeatureSelector = state => state?.geoProcessing?.intersection?.feature;
export const intersectionFeaturesSelector = state => state?.geoProcessing?.intersection?.features || [];
export const intersectionTotalCountSelector = state => state?.geoProcessing?.intersection?.totalCount || 0;
export const intersectionCurrentPageSelector = state => state?.geoProcessing?.intersection?.currentPage || 0;
export const firstAttributeToRetainSelector = state => state?.geoProcessing?.intersection?.firstAttributeToRetain;
export const secondAttributeToRetainSelector = state => state?.geoProcessing?.intersection?.secondAttributeToRetain;
export const intersectionModeSelector = state => state?.geoProcessing?.intersection?.intersectionMode;
export const percentagesEnabledSelector = state => state?.geoProcessing?.intersection?.percentagesEnabled;
export const areasEnabledSelector = state => state?.geoProcessing?.intersection?.areasEnabled;
export const isIntersectionLayerInvalidSelector = state => {
    const id = intersectionLayerIdSelector(state);
    return !!state?.geoProcessing?.flags?.invalid?.[id];
};

// flags
export const selectedToolSelector = state => state?.geoProcessing?.selectedTool;
export const isSourceFeaturesLoadingSelector = state => state?.geoProcessing?.flags?.featuresSourceLoading;
export const isIntersectionFeaturesLoadingSelector = state => state?.geoProcessing?.flags?.featuresIntersectionLoading;
export const areAllWPSAvailableForSourceLayerSelector = state => {
    const id = sourceLayerIdSelector(state);
    return id ? state?.geoProcessing?.flags?.wpsAvailability?.[id] : null;
};
export const areAllWPSAvailableForIntersectionLayerSelector = state => {
    const id = intersectionLayerIdSelector(state);
    return id ? state?.geoProcessing?.flags?.wpsAvailabilityIntersection?.[id] : null;
};
export const checkingWPSAvailabilitySelector = state => !!state?.geoProcessing?.flags?.checkingWPSAvailability;
export const checkingWPSAvailabilityIntersectionSelector = state => !!state?.geoProcessing?.flags?.checkingIntersectionWPSAvailability;
export const isIntersectionEnabledSelector = state => !!state?.geoProcessing?.flags?.isIntersectionEnabled;
export const runningProcessSelector = state => !!state?.geoProcessing?.flags?.runningProcess;
export const showHighlightLayersSelector = state => !!state?.geoProcessing?.flags?.showHighlightLayers;

export const isListeningClickSelector = (state) => !!(get(mapSelector(state), 'eventListeners.click', []).find((el) => el === GPT_CONTROL_NAME));
export const selectedLayerIdSelector = (state) => state?.geoProcessing?.selectedLayerId;
export const selectedLayerTypeSelector = (state) => state?.geoProcessing?.selectedLayerType;
export const maxFeaturesSelector = (state) => state?.geoProcessing?.maxFeatures || 10;
export const wpsUrlSelector = (state) => state?.geoProcessing?.wpsUrl;

export const availableLayersSelector = memoize((state) => {
    const layers = layersSelector(state);
    return layers
        .filter(l => l.group !== "background")
        .filter(layer => hasWFSService(layer) || layer.type === "vector")
        .map(layer => {
            return layer?.features?.length ? {
                ...layer,
                features: layer?.features?.map(feature => {
                    const ft = transformCircleIntoPolygon(densifyGeodesicFeature(feature));
                    return {
                        ...ft,
                        features: ft?.features?.length ? ft?.features?.map(transformCircleIntoPolygon).map(densifyGeodesicFeature) : ft?.features
                    };
                })
            } : layer;
        });
}, (state) => JSON.stringify(layersSelector(state).filter(l => l.group !== "background")
    .filter(layer => hasWFSService(layer) || layer.type === "vector")));

export const getLayerFromIdSelector = (state, id) => {
    const layer = head(availableLayersSelector(state).filter(l => l.id === id));
    // filtering out the features with measureId because they are not the measures, the LineString for length and bearing or the Polygon for the area one. We do not want to do the buffer on the point where the measure text label is stored
    const features = layer?.features?.length ? layer.features.reduce((p, c) => {
        return c.features?.length ? p.concat(c.features.filter((feature) => {
            if (c.properties?.type === "Measure" && feature?.geometry?.type === "Point") {
                return false;
            }
            return true;
        })) : p.concat([c]);
    }, []) : layer?.features;
    return {
        ...layer,
        features: features?.filter(f => !f?.properties?.measureId)
    };

};
