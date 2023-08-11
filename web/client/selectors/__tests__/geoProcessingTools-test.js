/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';

import {
    distanceSelector,
    distanceUomSelector,
    quadrantSegmentsSelector,
    capStyleSelector,
    bufferedLayersCounterSelector,
    sourceLayerIdSelector,
    sourceFeatureIdSelector,
    sourceFeatureSelector,
    sourceFeaturesSelector,
    sourceTotalCountSelector,
    sourceCurrentPageSelector,
    isSourceLayerInvalidSelector,
    intersectionLayerIdSelector,
    intersectionFeatureIdSelector,
    intersectionFeatureSelector,
    intersectionFeaturesSelector,
    intersectionTotalCountSelector,
    intersectionCurrentPageSelector,
    intersectedLayersCounterSelector,
    firstAttributeToRetainSelector,
    secondAttributeToRetainSelector,
    intersectionModeSelector,
    percentagesEnabledSelector,
    areasEnabledSelector,
    isIntersectionLayerInvalidSelector,
    selectedToolSelector,
    isSourceFeaturesLoadingSelector,
    isIntersectionFeaturesLoadingSelector,
    areAllWPSAvailableForSourceLayerSelector,
    areAllWPSAvailableForIntersectionLayerSelector,
    checkingWPSAvailabilitySelector,
    checkingWPSAvailabilityIntersectionSelector,
    isIntersectionEnabledSelector,
    runningProcessSelector,
    showHighlightLayersSelector,
    isListeningClickSelector,
    selectedLayerIdSelector,
    selectedLayerTypeSelector,
    wfsBackedLayersSelector,
    maxFeaturesSelector
} from '../geoProcessingTools';
import {
    GPT_CONTROL_NAME
} from '../../actions/geoProcessingTools';

describe('Test Geo Processing Tools selectors', () => {
    it('distanceSelector', () => {
        const geoProcessingTools = {
            buffer: {
                distance: 123
            }
        };
        expect(distanceSelector({geoProcessingTools})).toEqual(123);
        expect(distanceSelector({})).toEqual(100);
    });
    it('distanceUomSelector', () => {
        const geoProcessingTools = {
            buffer: {
                uom: "m"
            }
        };
        expect(distanceUomSelector({geoProcessingTools})).toEqual("m");
        expect(distanceUomSelector()).toEqual("m");
    });
    it('quadrantSegmentsSelector', () => {
        const geoProcessingTools = {
            buffer: {
                quadrantSegments: 123
            }
        };
        expect(quadrantSegmentsSelector({geoProcessingTools})).toEqual(123);
    });
    it('capStyleSelector', () => {
        const geoProcessingTools = {
            buffer: {
                capStyle: "Round"
            }
        };
        expect(capStyleSelector({geoProcessingTools})).toEqual("Round");
    });
    it('bufferedLayersCounterSelector', () => {
        const geoProcessingTools = {
            buffer: {
                counter: 1
            }
        };
        expect(bufferedLayersCounterSelector({geoProcessingTools})).toEqual(1);
        expect(bufferedLayersCounterSelector({})).toEqual(0);
    });
    it('sourceLayerIdSelector', () => {
        const geoProcessingTools = {
            source: {
                layerId: 1
            }
        };
        expect(sourceLayerIdSelector({geoProcessingTools})).toEqual(1);
    });
    it('sourceFeatureIdSelector', () => {
        const geoProcessingTools = {
            source: {
                featureId: 1
            }
        };
        expect(sourceFeatureIdSelector({geoProcessingTools})).toEqual(1);
    });
    it('sourceFeatureSelector', () => {
        const geoProcessingTools = {
            source: {
                feature: {
                    type: "Feature"
                }
            }
        };
        expect(sourceFeatureSelector({geoProcessingTools})).toEqual({
            type: "Feature"
        });
    });
    it('sourceFeaturesSelector', () => {
        const geoProcessingTools = {
            source: {
                features: [{
                    type: "Feature"
                }]
            }
        };
        expect(sourceFeaturesSelector({geoProcessingTools})).toEqual([{
            type: "Feature"
        }]);
    });
    it('sourceTotalCountSelector', () => {
        const geoProcessingTools = {
            source: {
                totalCount: 5
            }
        };
        expect(sourceTotalCountSelector({geoProcessingTools})).toEqual(5);
    });
    it('sourceCurrentPageSelector', () => {
        const geoProcessingTools = {
            source: {
                currentPage: 6
            }
        };
        expect(sourceCurrentPageSelector({geoProcessingTools})).toEqual(6);
    });
    it('isSourceLayerInvalidSelector', () => {
        const layerId = "layerId";
        const geoProcessingTools = {
            source: {layerId},
            flags: {
                invalid: {
                    [layerId]: true
                }
            }
        };
        expect(isSourceLayerInvalidSelector({geoProcessingTools})).toEqual(true);
    });
    it('intersectionLayerIdSelector', () => {
        const geoProcessingTools = {
            intersection: {
                layerId: 1
            }
        };
        expect(intersectionLayerIdSelector({geoProcessingTools})).toEqual(1);
    });
    it('intersectionFeatureIdSelector', () => {
        const geoProcessingTools = {
            intersection: {
                featureId: 1
            }
        };
        expect(intersectionFeatureIdSelector({geoProcessingTools})).toEqual(1);
    });
    it('intersectionFeatureSelector', () => {
        const geoProcessingTools = {
            intersection: {
                feature: {
                    type: "Feature"
                }
            }
        };
        expect(intersectionFeatureSelector({geoProcessingTools})).toEqual({
            type: "Feature"
        });
    });
    it('intersectionFeaturesSelector', () => {
        const geoProcessingTools = {
            intersection: {
                features: [{
                    type: "Feature"
                }]
            }
        };
        expect(intersectionFeaturesSelector({geoProcessingTools})).toEqual([{
            type: "Feature"
        }]);
    });
    it('intersectionTotalCountSelector', () => {
        const geoProcessingTools = {
            intersection: {
                totalCount: 2
            }
        };
        expect(intersectionTotalCountSelector({geoProcessingTools})).toEqual(2);
    });
    it('intersectionCurrentPageSelector', () => {
        const geoProcessingTools = {
            intersection: {
                currentPage: 5
            }
        };
        expect(intersectionCurrentPageSelector({geoProcessingTools})).toEqual(5);
    });
    it('intersectedLayersCounterSelector', () => {
        const geoProcessingTools = {
            intersection: {
                counter: 2
            }
        };
        expect(intersectedLayersCounterSelector({geoProcessingTools})).toEqual(2);
    });
    it('firstAttributeToRetainSelector', () => {
        const geoProcessingTools = {
            intersection: {
                firstAttributeToRetain: "firstAttributeToRetain"
            }
        };
        expect(firstAttributeToRetainSelector({geoProcessingTools})).toEqual("firstAttributeToRetain");
    });
    it('secondAttributeToRetainSelector', () => {
        const geoProcessingTools = {
            intersection: {
                secondAttributeToRetain: "secondAttributeToRetain"
            }
        };
        expect(secondAttributeToRetainSelector({geoProcessingTools})).toEqual("secondAttributeToRetain");
    });
    it('intersectionModeSelector', () => {
        const geoProcessingTools = {
            intersection: {
                intersectionMode: "intersectionMode"
            }
        };
        expect(intersectionModeSelector({geoProcessingTools})).toEqual("intersectionMode");
    });
    it('percentagesEnabledSelector', () => {
        const geoProcessingTools = {
            intersection: {
                percentagesEnabled: true
            }
        };
        expect(percentagesEnabledSelector({geoProcessingTools})).toEqual(true);
    });
    it('areasEnabledSelector', () => {
        const geoProcessingTools = {
            intersection: {
                areasEnabled: true
            }
        };
        expect(areasEnabledSelector({geoProcessingTools})).toEqual(true);
    });
    it('isIntersectionLayerInvalidSelector', () => {
        const layerId = "layerId";
        const geoProcessingTools = {
            intersection: {layerId},
            flags: {
                invalid: {
                    [layerId]: true
                }
            }
        };
        expect(isIntersectionLayerInvalidSelector({geoProcessingTools})).toEqual(true);
    });
    it('selectedToolSelector', () => {
        const geoProcessingTools = {
            selectedTool: "buffer"
        };
        expect(selectedToolSelector({geoProcessingTools})).toEqual("buffer");
    });
    it('isSourceFeaturesLoadingSelector', () => {
        const geoProcessingTools = {
            flags: {
                featuresSourceLoading: true
            }
        };
        expect(isSourceFeaturesLoadingSelector({geoProcessingTools})).toEqual(true);
    });
    it('isIntersectionFeaturesLoadingSelector', () => {
        const geoProcessingTools = {
            flags: {
                featuresIntersectionLoading: true
            }
        };
        expect(isIntersectionFeaturesLoadingSelector({geoProcessingTools})).toEqual(true);
    });
    it('areAllWPSAvailableForSourceLayerSelector', () => {
        const geoProcessingTools = {
            source: {
                layerId: "layerId"
            },
            flags: {
                wpsAvailability: {
                    layerId: true
                }
            }
        };
        expect(areAllWPSAvailableForSourceLayerSelector({geoProcessingTools})).toEqual(true);
    });
    it('areAllWPSAvailableForIntersectionLayerSelector', () => {
        const geoProcessingTools = {
            intersection: {
                layerId: "layerId"
            },
            flags: {
                wpsAvailabilityIntersection: {
                    layerId: true
                }
            }
        };
        expect(areAllWPSAvailableForIntersectionLayerSelector({geoProcessingTools})).toEqual(true);
    });
    it('checkingWPSAvailabilitySelector', () => {
        const geoProcessingTools = {
            flags: {
                checkingWPSAvailability: true
            }
        };
        expect(checkingWPSAvailabilitySelector({geoProcessingTools})).toEqual(true);
    });
    it('checkingWPSAvailabilityIntersectionSelector', () => {
        const geoProcessingTools = {
            flags: {
                checkingIntersectionWPSAvailability: true
            }
        };
        expect(checkingWPSAvailabilityIntersectionSelector({geoProcessingTools})).toEqual(true);
    });
    it('isIntersectionEnabledSelector', () => {
        const geoProcessingTools = {
            flags: {
                isIntersectionEnabled: true
            }
        };
        expect(isIntersectionEnabledSelector({geoProcessingTools})).toEqual(true);
    });
    it('runningProcessSelector', () => {
        const geoProcessingTools = {
            flags: {
                runningProcess: true
            }
        };
        expect(runningProcessSelector({geoProcessingTools})).toEqual(true);
    });
    it('showHighlightLayersSelector', () => {
        const geoProcessingTools = {
            flags: {
                showHighlightLayers: true
            }
        };
        expect(showHighlightLayersSelector({geoProcessingTools})).toEqual(true);
    });
    it('isListeningClickSelector', () => {
        const map = {
            present: {
                eventListeners: {
                    click: [GPT_CONTROL_NAME]
                }
            }
        };
        expect(isListeningClickSelector({map})).toEqual(true);
    });
    it('selectedLayerIdSelector', () => {
        const geoProcessingTools = {
            selectedLayerId: "layerId"
        };
        expect(selectedLayerIdSelector({geoProcessingTools})).toEqual("layerId");
    });
    it('selectedLayerTypeSelector', () => {
        const geoProcessingTools = {
            selectedLayerType: "source"
        };
        expect(selectedLayerTypeSelector({geoProcessingTools})).toEqual("source");
    });
    it('maxFeaturesSelector', () => {
        const geoProcessingTools = {
            maxFeatures: 10
        };
        expect(maxFeaturesSelector({geoProcessingTools})).toEqual(10);
    });
    it('test wfsBackedLayersSelector', () => {
        let layers = wfsBackedLayersSelector({});
        expect(layers.length).toBeFalsy();
        layers = wfsBackedLayersSelector({
            layers: {
                flat: [{
                    name: "ws:layer_1",
                    group: "buffer",
                    type: "wms",
                    search: {
                        type: "wfs"
                    }
                },
                {
                    name: "ws:layer_3",
                    group: "buffer",
                    type: "wfs",
                    search: {
                        type: "wfs"
                    }
                },
                {
                    name: "ws:layer_2",
                    group: "background"
                }]}});
        expect(layers.length).toBeTruthy();
        expect(layers).toEqual([{
            name: "ws:layer_1",
            group: "buffer",
            type: "wms",
            search: {
                type: "wfs"
            }
        },
        {
            name: "ws:layer_3",
            group: "buffer",
            type: "wfs",
            search: {
                type: "wfs"
            }
        }]);
    });
});
