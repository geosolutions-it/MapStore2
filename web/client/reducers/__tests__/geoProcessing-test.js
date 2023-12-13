/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import { LOCATION_CHANGE } from 'connected-react-router';

import geoProcessing from '../geoProcessing';
import {
    checkingWPSAvailability,
    checkingIntersectionWPSAvailability,
    errorLoadingDFT,
    initPlugin,
    runningProcess,
    setBufferDistance,
    setBufferDistanceUom,
    setBufferQuadrantSegments,
    setBufferCapStyle,
    setFeatures,
    setFeatureSourceLoading,
    setFeatureIntersectionLoading,
    setInvalidLayer,
    setWPSAvailability,
    setSelectedTool,
    setSourceLayerId,
    setSourceFeatureId,
    setSourceFeature,
    setIntersectionLayerId,
    setIntersectionFeatureId,
    setIntersectionFeature,
    setIntersectionFirstAttribute,
    setIntersectionSecondAttribute,
    setIntersectionMode,
    setIntersectionPercentagesEnabled,
    setIntersectionAreasEnabled,
    setSelectedLayerType,
    toggleHighlightLayers,
    reset
} from '../../actions/geoProcessing';
import {
    resetControls
} from '../../actions/controls';

describe('Test Geo Processing Tools reducer', () => {
    it('CHECKING_WPS_AVAILABILITY', () => {
        const status = true;
        const action = checkingWPSAvailability(status);
        const state = geoProcessing( undefined, action);
        expect(state.flags.checkingWPSAvailability).toEqual(true);
    });
    it('CHECKING_WPS_AVAILABILITY_INTERSECTION', () => {
        const status = true;
        const action = checkingIntersectionWPSAvailability(status);
        const state = geoProcessing( undefined, action);
        expect(state.flags.checkingWPSAvailabilityIntersection).toEqual(true);
    });
    it('ERROR_LOADING_DFT', () => {
        const layerId = "id";
        const action = errorLoadingDFT(layerId);
        const state = geoProcessing( undefined, action);
        expect(state.errorLoadingDFT[layerId]).toEqual(true);
    });
    it('INIT_PLUGIN', () => {
        const cfg = {
            wpsUrl: "test",
            buffer: {
                distance: 1234
            }
        };
        const action = initPlugin(cfg);
        const state = geoProcessing({
            intersection: {
                intersectionMode: "INTERSECTION",
                featureId: "id"
            }
        }, action);
        expect(state.buffer.distance).toEqual(1234);
        expect(state.intersection.intersectionMode).toEqual("INTERSECTION");
        expect(state.intersection.featureId).toEqual("id");
        expect(state.wpsUrl).toEqual("test");
        expect(state.cfg).toEqual(cfg);
    });
    it('RESET, RESET_CONTROLS, LOCATION_CHANGE', () => {
        const actions = [reset(), resetControls(), {type: LOCATION_CHANGE}];
        actions.forEach(a => {
            const state = geoProcessing({
                intersection: {
                    intersectionMode: "INTERSECTION",
                    firstAttributeToRetain: "first",
                    featureId: "id"
                },
                buffer: {
                    featureId: "id",
                    distance: 1400
                },
                cfg: {
                    buffer: {
                        distance: 100
                    }
                }
            }, a);
            expect(state.buffer.distance).toEqual(100);
            expect(state.intersection.intersectionMode).toEqual("INTERSECTION");
            expect(state.intersection.featureId).toEqual(undefined);
            expect(state.wpsUrl).toEqual(undefined);
            expect(state.cfg).toEqual({buffer: {
                distance: 100
            }});
        });
    });

    it('RUNNING_PROCESS', () => {
        const status = true;
        const action = runningProcess(status);
        const state = geoProcessing(undefined, action);
        expect(state.flags.runningProcess).toEqual(true);
    });
    it('SET_BUFFER_DISTANCE', () => {
        const distance = "123";
        const action = setBufferDistance(distance);
        const state = geoProcessing(undefined, action);
        expect(state.buffer.distance).toEqual(123);
    });
    it('SET_BUFFER_DISTANCE_UOM', () => {
        const uom = "m";
        const action = setBufferDistanceUom(uom);
        const state = geoProcessing(undefined, action);
        expect(state.buffer.distanceUom).toEqual(uom);
    });
    it('SET_BUFFER_QUADRANT_SEGMENTS', () => {
        const quadrantSegments = 100;
        const action = setBufferQuadrantSegments(quadrantSegments);
        const state = geoProcessing(undefined, action);
        expect(state.buffer.quadrantSegments).toEqual(quadrantSegments);
    });
    it('SET_BUFFER_CAP_STYLE', () => {
        const capStyle = "Round";
        const action = setBufferCapStyle(capStyle);
        const state = geoProcessing(undefined, action);
        expect(state.buffer.capStyle).toEqual(capStyle);
    });
    it('SET_FEATURES from empty state', () => {
        const layerId = "id";
        const source = "buffer";
        const data = {
            features: [{
                geometry: {
                    type: "Feature",
                    coordinates: [0, 0]
                }
            }]};
        const action = setFeatures(layerId, source, data);
        const state = geoProcessing(undefined, action);
        expect(state.buffer.features).toEqual([{
            geometry: {
                type: "Feature",
                coordinates: [0, 0]
            }
        }]);
    });
    it('SET_FEATURES add extra from pagination', () => {
        const layerId = "id";
        const source = "source";
        const data = {
            features: [{
                geometry: {
                    type: "Feature",
                    coordinates: [0, 0]
                }
            }],
            totalFeatures: 20
        };
        const nextPage = 2;
        const action = setFeatures(layerId, source, data, nextPage);
        const state = geoProcessing({
            source: {
                features: [{id: 1}]
            }
        }, action);
        expect(state.source.totalCount).toEqual(20);
        expect(state.source.currentPage).toEqual(nextPage);
        expect(state.source.features).toEqual([{id: 1}, {
            geometry: {
                type: "Feature",
                coordinates: [0, 0]
            }
        }]);
    });
    it('SET_FEATURES error', () => {
        const layerId = "id";
        const source = "buffer";
        const data = {message: "error"};
        const action = setFeatures(layerId, source, data);
        const state = geoProcessing(undefined, action);
        expect(state.buffer.error).toEqual(data);
    });
    it('SET_FEATURE_SOURCE_LOADING', () => {
        const status = true;
        const action = setFeatureSourceLoading(status);
        const state = geoProcessing(undefined, action);
        expect(state.flags.featuresSourceLoading).toEqual(status);
    });
    it('SET_FEATURE_INTERSECTION_LOADING', () => {
        const status = true;
        const action = setFeatureIntersectionLoading(status);
        const state = geoProcessing(undefined, action);
        expect(state.flags.featuresIntersectionLoading).toEqual(status);
    });
    it('SET_INVALID_LAYER', () => {
        const layerId = "id";
        const status = true;
        const action = setInvalidLayer(layerId, status);
        const state = geoProcessing(undefined, action);
        expect(state.flags.invalid[layerId]).toEqual(status);
    });
    it('SET_WPS_AVAILABILITY source', () => {
        const layerId = "id";
        const status = true;
        const source = "source";
        const action = setWPSAvailability(layerId, status, source);
        const state = geoProcessing({
            flags: {
                wpsAvailability: {
                    layerId: false
                }
            }
        }, action);
        expect(state.flags.wpsAvailability.layerId).toEqual(false);
        expect(state.flags.wpsAvailability[layerId]).toEqual(status);
    });
    it('SET_WPS_AVAILABILITY intersection', () => {
        const layerId = "id";
        const status = true;
        const source = "intersection";
        const action = setWPSAvailability(layerId, status, source);
        const state = geoProcessing({
            flags: {
                wpsAvailabilityIntersection: {
                    layerId: false
                }
            }
        }, action);
        expect(state.flags.wpsAvailabilityIntersection.layerId).toEqual(false);
        expect(state.flags.wpsAvailabilityIntersection[layerId]).toEqual(status);
    });
    it('SET_SELECTED_TOOL', () => {
        const tool = "buffer";
        const action = setSelectedTool(tool);
        const state = geoProcessing(undefined, action);
        expect(state.selectedTool).toEqual(tool);
    });
    it('SET_SOURCE_LAYER_ID', () => {
        const layerId = "id";
        const action = setSourceLayerId(layerId);
        let state = geoProcessing({}, action);
        expect(state.selectedLayerId).toEqual(undefined);
        expect(state.source.layerId).toEqual(layerId);
        expect(state.source.features).toEqual([]);
        expect(state.source.feature).toEqual(undefined);
        expect(state.source.featureId).toEqual("");

        state = geoProcessing({
            ...state,
            selectedLayerId: "old layer",
            source: {
                features: [{type: "Feature"}],
                feature: {type: "Feature"},
                featureId: "ft"
            }
        }, setSourceLayerId("layerId"));
        expect(state.selectedLayerId).toEqual("old layer");
        expect(state.source.layerId).toEqual("layerId");
        expect(state.source.features).toEqual([]);
        expect(state.source.features).toEqual([]);
        expect(state.source.feature).toEqual(undefined);
        expect(state.source.featureId).toEqual("");
    });
    it('SET_SOURCE_FEATURE_ID', () => {
        const featureId = "ftId";
        const action = setSourceFeatureId(featureId);
        const state = geoProcessing({}, action);
        expect(state.source.featureId).toEqual(featureId);
    });
    it('SET_SOURCE_FEATURE_ID clean up', () => {
        const action = setSourceFeatureId("");
        const state = geoProcessing({
            source: {
                totalCount: 40,
                features: [{type: "Feature"}],
                feature: {type: "Feature"},
                featureId: "ft"
            }
        }, action);
        expect(state.source).toEqual(
            {
                totalCount: 40,
                features: [],
                currentPage: 0,
                feature: {},
                featureId: ""
            }
        );
    });
    it('SET_SOURCE_FEATURE', () => {
        const feature = {geometry: {type: "Point"}};
        const action = setSourceFeature(feature);
        const state = geoProcessing({
            source: {
                features: []
            },
            intersection: {
                feature: {geometry: {type: "Polygon"}},
                features: []
            }
        }, action);
        expect(state.source.feature).toEqual(feature);
        expect(state.source.features).toEqual([feature]);
    });
    it('SET_INTERSECTION_LAYER_ID', () => {
        const layerId = "id";
        const action = setIntersectionLayerId(layerId);
        let state = geoProcessing({}, action);
        expect(state.selectedLayerId).toEqual(undefined);
        expect(state.intersection.layerId).toEqual(layerId);
        expect(state.intersection.features).toEqual([]);
        expect(state.intersection.feature).toEqual(undefined);
        expect(state.intersection.featureId).toEqual("");

        state = geoProcessing({
            ...state,
            selectedLayerId: "old layer",
            intersection: {
                features: [{type: "Feature"}],
                feature: {type: "Feature"},
                featureId: "ft"
            }
        }, setIntersectionLayerId("layerId"));
        expect(state.selectedLayerId).toEqual("old layer");
        expect(state.intersection.layerId).toEqual("layerId");
        expect(state.intersection.features).toEqual([]);
        expect(state.intersection.feature).toEqual(undefined);
        expect(state.intersection.featureId).toEqual("");
    });
    it('SET_INTERSECTION_FEATURE_ID', () => {
        const featureId = "ftId";
        const action = setIntersectionFeatureId(featureId);
        const state = geoProcessing({}, action);
        expect(state.intersection.featureId).toEqual(featureId);
    });
    it('SET_INTERSECTION_FEATURE_ID clean up', () => {
        const action = setIntersectionFeatureId("");
        const state = geoProcessing({
            intersection: {
                totalCount: 40,
                features: [{type: "Feature"}],
                feature: {type: "Feature"},
                featureId: "ft"
            }
        }, action);
        expect(state.intersection).toEqual(
            {
                totalCount: 40,
                features: [],
                currentPage: 0,
                feature: {},
                featureId: ""
            }
        );
    });
    it('SET_INTERSECTION_FEATURE', () => {
        const feature = {geometry: {type: "Point"}};
        const action = setIntersectionFeature(feature);
        const state = geoProcessing({
            intersection: {
                features: []
            },
            source: {
                features: [],
                feature: {geometry: {type: "Polygon"}}
            }
        }, action);
        expect(state.intersection.feature).toEqual(feature);
    });
    it('SET_INTERSECTION_FIRST_ATTRIBUTE', () => {
        const firstAttributeToRetain = "attr";
        const action = setIntersectionFirstAttribute(firstAttributeToRetain);
        const state = geoProcessing(undefined, action);
        expect(state.intersection.firstAttributeToRetain).toEqual(firstAttributeToRetain);
    });
    it('SET_INTERSECTION_SECOND_ATTRIBUTE', () => {
        const secondAttributeToRetain = "attr";
        const action = setIntersectionSecondAttribute(secondAttributeToRetain);
        const state = geoProcessing(undefined, action);
        expect(state.intersection.secondAttributeToRetain).toEqual(secondAttributeToRetain);
    });
    it('SET_INTERSECTION_MODE', () => {
        const intersectionMode = "";
        const action = setIntersectionMode(intersectionMode);
        const state = geoProcessing(undefined, action);
        expect(state.intersection.intersectionMode).toEqual(intersectionMode);
    });
    it('SET_INTERSECTION_PERCENTAGES_ENABLED', () => {
        const percentagesEnabled = true;
        const action = setIntersectionPercentagesEnabled(percentagesEnabled);
        const state = geoProcessing(undefined, action);
        expect(state.intersection.percentagesEnabled).toEqual(percentagesEnabled);
    });
    it('SET_INTERSECTION_AREAS_ENABLED', () => {
        const areasEnabled = true;
        const action = setIntersectionAreasEnabled(areasEnabled);
        const state = geoProcessing(undefined, action);
        expect(state.intersection.areasEnabled).toEqual(areasEnabled);
    });
    it('SET_SELECTED_LAYER_TYPE source', () => {
        const source = "source";
        const action = setSelectedLayerType(source);
        const state = geoProcessing({source: {
            layerId: "layerId"
        }}, action);
        expect(state.selectedLayerType).toEqual(source);
        expect(state.selectedLayerId).toEqual("layerId");
    });
    it('SET_SELECTED_LAYER_TYPE intersection', () => {
        const source = "intersection";
        const action = setSelectedLayerType(source);
        const state = geoProcessing({intersection: {
            layerId: "layerId"
        }}, action);
        expect(state.selectedLayerType).toEqual(source);
        expect(state.selectedLayerId).toEqual("layerId");
    });
    it('TOGGLE_HIGHLIGHT_LAYERS', () => {
        const action = toggleHighlightLayers();
        const state = geoProcessing(undefined, action);
        expect(state.flags.showHighlightLayers).toEqual(false);
    });
});
