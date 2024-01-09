/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import find from 'lodash/find';

import {
    distanceSelector,
    distanceUomSelector,
    quadrantSegmentsSelector,
    capStyleSelector,
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
    availableLayersSelector,
    maxFeaturesSelector,
    wpsUrlSelector
} from '../geoProcessing';
import {
    GPT_CONTROL_NAME
} from '../../actions/geoProcessing';

describe('Test Geo Processing Tools selectors', () => {
    it('distanceSelector', () => {
        const geoProcessing = {
            buffer: {
                distance: 123
            }
        };
        expect(distanceSelector({geoProcessing})).toEqual(123);
        expect(distanceSelector({})).toEqual(100);
    });
    it('distanceUomSelector', () => {
        const geoProcessing = {
            buffer: {
                uom: "m"
            }
        };
        expect(distanceUomSelector({geoProcessing})).toEqual("m");
        expect(distanceUomSelector()).toEqual("m");
    });
    it('quadrantSegmentsSelector', () => {
        const geoProcessing = {
            buffer: {
                quadrantSegments: 123
            }
        };
        expect(quadrantSegmentsSelector({geoProcessing})).toEqual(123);
    });
    it('capStyleSelector', () => {
        const geoProcessing = {
            buffer: {
                capStyle: "Round"
            }
        };
        expect(capStyleSelector({geoProcessing})).toEqual("Round");
    });
    it('sourceLayerIdSelector', () => {
        const geoProcessing = {
            source: {
                layerId: 1
            }
        };
        expect(sourceLayerIdSelector({geoProcessing})).toEqual(1);
    });
    it('sourceFeatureIdSelector', () => {
        const geoProcessing = {
            source: {
                featureId: 1
            }
        };
        expect(sourceFeatureIdSelector({geoProcessing})).toEqual(1);
    });
    it('sourceFeatureSelector', () => {
        const geoProcessing = {
            source: {
                feature: {
                    type: "Feature"
                }
            }
        };
        expect(sourceFeatureSelector({geoProcessing})).toEqual({
            type: "Feature"
        });
    });
    it('sourceFeaturesSelector', () => {
        const geoProcessing = {
            source: {
                features: [{
                    type: "Feature"
                }]
            }
        };
        expect(sourceFeaturesSelector({geoProcessing})).toEqual([{
            type: "Feature"
        }]);
    });
    it('sourceTotalCountSelector', () => {
        const geoProcessing = {
            source: {
                totalCount: 5
            }
        };
        expect(sourceTotalCountSelector({geoProcessing})).toEqual(5);
    });
    it('sourceCurrentPageSelector', () => {
        const geoProcessing = {
            source: {
                currentPage: 6
            }
        };
        expect(sourceCurrentPageSelector({geoProcessing})).toEqual(6);
    });
    it('isSourceLayerInvalidSelector', () => {
        const layerId = "layerId";
        const geoProcessing = {
            source: {layerId},
            flags: {
                invalid: {
                    [layerId]: true
                }
            }
        };
        expect(isSourceLayerInvalidSelector({geoProcessing})).toEqual(true);
    });
    it('intersectionLayerIdSelector', () => {
        const geoProcessing = {
            intersection: {
                layerId: 1
            }
        };
        expect(intersectionLayerIdSelector({geoProcessing})).toEqual(1);
    });
    it('intersectionFeatureIdSelector', () => {
        const geoProcessing = {
            intersection: {
                featureId: 1
            }
        };
        expect(intersectionFeatureIdSelector({geoProcessing})).toEqual(1);
    });
    it('intersectionFeatureSelector', () => {
        const geoProcessing = {
            intersection: {
                feature: {
                    type: "Feature"
                }
            }
        };
        expect(intersectionFeatureSelector({geoProcessing})).toEqual({
            type: "Feature"
        });
    });
    it('intersectionFeaturesSelector', () => {
        const geoProcessing = {
            intersection: {
                features: [{
                    type: "Feature"
                }]
            }
        };
        expect(intersectionFeaturesSelector({geoProcessing})).toEqual([{
            type: "Feature"
        }]);
    });
    it('intersectionTotalCountSelector', () => {
        const geoProcessing = {
            intersection: {
                totalCount: 2
            }
        };
        expect(intersectionTotalCountSelector({geoProcessing})).toEqual(2);
    });
    it('intersectionCurrentPageSelector', () => {
        const geoProcessing = {
            intersection: {
                currentPage: 5
            }
        };
        expect(intersectionCurrentPageSelector({geoProcessing})).toEqual(5);
    });
    it('firstAttributeToRetainSelector', () => {
        const geoProcessing = {
            intersection: {
                firstAttributeToRetain: "firstAttributeToRetain"
            }
        };
        expect(firstAttributeToRetainSelector({geoProcessing})).toEqual("firstAttributeToRetain");
    });
    it('secondAttributeToRetainSelector', () => {
        const geoProcessing = {
            intersection: {
                secondAttributeToRetain: "secondAttributeToRetain"
            }
        };
        expect(secondAttributeToRetainSelector({geoProcessing})).toEqual("secondAttributeToRetain");
    });
    it('intersectionModeSelector', () => {
        const geoProcessing = {
            intersection: {
                intersectionMode: "intersectionMode"
            }
        };
        expect(intersectionModeSelector({geoProcessing})).toEqual("intersectionMode");
    });
    it('percentagesEnabledSelector', () => {
        const geoProcessing = {
            intersection: {
                percentagesEnabled: true
            }
        };
        expect(percentagesEnabledSelector({geoProcessing})).toEqual(true);
    });
    it('areasEnabledSelector', () => {
        const geoProcessing = {
            intersection: {
                areasEnabled: true
            }
        };
        expect(areasEnabledSelector({geoProcessing})).toEqual(true);
    });
    it('isIntersectionLayerInvalidSelector', () => {
        const layerId = "layerId";
        const geoProcessing = {
            intersection: {layerId},
            flags: {
                invalid: {
                    [layerId]: true
                }
            }
        };
        expect(isIntersectionLayerInvalidSelector({geoProcessing})).toEqual(true);
    });
    it('selectedToolSelector', () => {
        const geoProcessing = {
            selectedTool: "buffer"
        };
        expect(selectedToolSelector({geoProcessing})).toEqual("buffer");
    });
    it('isSourceFeaturesLoadingSelector', () => {
        const geoProcessing = {
            flags: {
                featuresSourceLoading: true
            }
        };
        expect(isSourceFeaturesLoadingSelector({geoProcessing})).toEqual(true);
    });
    it('isIntersectionFeaturesLoadingSelector', () => {
        const geoProcessing = {
            flags: {
                featuresIntersectionLoading: true
            }
        };
        expect(isIntersectionFeaturesLoadingSelector({geoProcessing})).toEqual(true);
    });
    it('areAllWPSAvailableForSourceLayerSelector', () => {
        const geoProcessing = {
            source: {
                layerId: "layerId"
            },
            flags: {
                wpsAvailability: {
                    layerId: true
                }
            }
        };
        expect(areAllWPSAvailableForSourceLayerSelector({geoProcessing})).toEqual(true);
    });
    it('areAllWPSAvailableForIntersectionLayerSelector', () => {
        const geoProcessing = {
            intersection: {
                layerId: "layerId"
            },
            flags: {
                wpsAvailabilityIntersection: {
                    layerId: true
                }
            }
        };
        expect(areAllWPSAvailableForIntersectionLayerSelector({geoProcessing})).toEqual(true);
    });
    it('checkingWPSAvailabilitySelector', () => {
        const geoProcessing = {
            flags: {
                checkingWPSAvailability: true
            }
        };
        expect(checkingWPSAvailabilitySelector({geoProcessing})).toEqual(true);
    });
    it('checkingWPSAvailabilityIntersectionSelector', () => {
        const geoProcessing = {
            flags: {
                checkingIntersectionWPSAvailability: true
            }
        };
        expect(checkingWPSAvailabilityIntersectionSelector({geoProcessing})).toEqual(true);
    });
    it('isIntersectionEnabledSelector', () => {
        const geoProcessing = {
            flags: {
                isIntersectionEnabled: true
            }
        };
        expect(isIntersectionEnabledSelector({geoProcessing})).toEqual(true);
    });
    it('runningProcessSelector', () => {
        const geoProcessing = {
            flags: {
                runningProcess: true
            }
        };
        expect(runningProcessSelector({geoProcessing})).toEqual(true);
    });
    it('showHighlightLayersSelector', () => {
        const geoProcessing = {
            flags: {
                showHighlightLayers: true
            }
        };
        expect(showHighlightLayersSelector({geoProcessing})).toEqual(true);
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
        const geoProcessing = {
            selectedLayerId: "layerId"
        };
        expect(selectedLayerIdSelector({geoProcessing})).toEqual("layerId");
    });
    it('selectedLayerTypeSelector', () => {
        const geoProcessing = {
            selectedLayerType: "source"
        };
        expect(selectedLayerTypeSelector({geoProcessing})).toEqual("source");
    });
    it('maxFeaturesSelector', () => {
        const geoProcessing = {
            maxFeatures: 10
        };
        expect(maxFeaturesSelector({geoProcessing})).toEqual(10);
    });
    it('wpsUrlSelector', () => {
        const geoProcessing = {
            wpsUrl: "url"
        };
        expect(wpsUrlSelector({geoProcessing})).toEqual("url");
    });
    it('test availableLayersSelector', () => {
        let layers = availableLayersSelector({});
        expect(layers.length).toBeFalsy();
        layers = availableLayersSelector({
            layers: {
                flat: [{
                    name: "ws:layer_1",
                    group: "buffer",
                    type: "wms",
                    search: {
                        type: "wfs"
                    }
                }, {
                    name: "ws:layer_11",
                    group: "buffer",
                    type: "vector"
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
            name: "ws:layer_11",
            group: "buffer",
            type: "vector"
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
    it('test availableLayersSelector without normalized layers', () => {
        let layers = availableLayersSelector({});
        expect(layers.length).toBeFalsy();
        layers = availableLayersSelector({
            layers: {
                flat: [{
                    name: "ws:layer_1",
                    group: "buffer",
                    type: "wms",
                    search: {
                        type: "wfs"
                    }
                }, {
                    name: "ws:layer_11",
                    group: "buffer",
                    type: "vector",
                    features: [{
                        geometry: {
                            coordinates: [[1, 1], [2, 2]],
                            type: "LineString"
                        },
                        properties: {
                            geodesic: true
                        }
                    }, {
                        geometry: {
                            coordinates: [1, 1],
                            type: "Point"
                        },
                        properties: {
                            annotationType: "Circle",
                            radius: 100
                        }
                    }]
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
                }]}
        });
        expect(layers.length).toBeTruthy();
        const transformedFeatures = find(layers, ({name}) => name === "ws:layer_11" ).features;
        expect(transformedFeatures[0].geometry.type).toEqual("LineString");
        expect(transformedFeatures[0].geometry.coordinates.length).toEqual(100);
        expect(transformedFeatures[1].geometry.type).toEqual("Polygon");
        expect(transformedFeatures[1].geometry.coordinates[0].length).toEqual(101);
    });
});
