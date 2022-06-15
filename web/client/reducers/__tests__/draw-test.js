/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';

import draw, {defaultSnappingConfig} from '../draw';
import {
    GEOMETRY_CHANGED,
    SET_CURRENT_STYLE, SET_SNAPPING_CONFIG,
    SET_SNAPPING_LAYER,
    SNAPPING_IS_LOADING,
    TOGGLE_SNAPPING
} from '../../actions/draw';

describe('Test the draw reducer', () => {

    it('returns the initial state on unrecognized action', () => {

        const initialState = {
            drawStatus: null,
            drawOwner: null,
            drawMethod: null,
            features: []
        };

        let state = draw(initialState, {type: 'UNKNOWN'});
        expect(state).toBe(initialState);
    });

    it('Change the drawing status', () => {
        let testAction = {
            type: "CHANGE_DRAWING_STATUS",
            status: "start",
            method: "Circle",
            owner: "queryform",
            features: []
        };

        let initialState = {
            drawStatus: null,
            drawOwner: null,
            drawMethod: null,
            features: []
        };

        let state = draw(initialState, testAction);
        expect(state).toExist();

        expect(state.drawStatus).toBe("start");
        expect(state.drawOwner).toBe("queryform");
        expect(state.drawMethod).toBe("Circle");
        expect(state.features.length).toBe(0);
    });

    it('FeatureGrid GEOMETRY_CHANGED', () => {
        const style = {
            fill: {
                color: "red"
            }
        };
        let testAction = {
            type: SET_CURRENT_STYLE,
            currentStyle: style
        };
        let state = draw({}, testAction);
        expect(state.currentStyle).toExist();
        expect(state.currentStyle).toBe(style);
    });
    it('FeatureGrid GEOMETRY_CHANGED', () => {
        const feature = {
            geometry: {
                type: "Point",
                coordinates: []
            }
        };
        let testAction = {
            type: GEOMETRY_CHANGED,
            features: [feature]
        };
        let state = draw({}, testAction);
        expect(state.tempFeatures).toExist();
        expect(state.tempFeatures[0]).toBe(feature);
    });

    it('POLYGON GEOMETRY_CHANGED', () => {
        let feature1 = {
            type: "Feature",
            geometry: {
                type: "Polygon",
                coordinates: [
                    [[35.0, 10.0], [45.0, 45.0], [15.0, 40.0], [10.0, 20.0], [35.0, 10.0]],
                    [[20.0, 30.0], [35.0, 35.0], [30.0, 20.0], [20.0, 30.0]]
                ]

            },
            id: 'idFt1',
            properties: {
                someProp: "someValue"
            }
        };
        let testAction = {
            type: GEOMETRY_CHANGED,
            features: [feature1]
        };
        let state = draw({}, testAction);
        expect(state.tempFeatures).toExist();
        expect(state.tempFeatures[0]).toBe(feature1);
        expect(state.tempFeatures.length).toEqual(1);
    });
    it('Point GEOMETRY_CHANGED', () => {
        let feature2 = {

            type: "Feature",
            geometry: {
                type: "Point",
                coordinates: [1, 2]
            },
            id: 'idFt2',
            properties: {
                someProp: "someValue2"
            }
        };
        let testAction = {
            type: GEOMETRY_CHANGED,
            features: [feature2]
        };
        let state = draw({}, testAction);
        expect(state.tempFeatures).toExist();
        expect(state.tempFeatures[0]).toBe(feature2);
        expect(state.tempFeatures.length).toEqual(1);
    });
    it('MultiPolygon GEOMETRY_CHANGED', () => {
        let feature3 = {
            type: "Feature",
            geometry: {
                type: "MultiPolygon",
                coordinates: [
                    [
                        [ [102.0, 2.0], [103.0, 2.0], [103.0, 3.0], [102.0, 3.0], [102.0, 2.0] ]
                    ],
                    [
                        [ [100.0, 0.0], [101.0, 0.0], [101.0, 1.0], [100.0, 1.0], [100.0, 0.0] ]

                    ]
                ]
            },
            id: 'idFt3',
            properties: {
                someProp: "someValue3"
            }
        };
        let testAction = {
            type: GEOMETRY_CHANGED,
            features: [feature3]
        };
        let state = draw({}, testAction);
        expect(state.tempFeatures).toExist();
        expect(state.tempFeatures[0]).toBe(feature3);
        expect(state.tempFeatures.length).toEqual(1);
    });
    it('MultiLineString GEOMETRY_CHANGED', () => {
        let feature4 = {
            type: "Feature",
            geometry: {
                type: "MultiLineString",
                coordinates: [
                    [ [100.0, 0.0], [101.0, 1.0] ],
                    [ [102.0, 2.0], [103.0, 3.0] ]
                ]
            },
            id: 'idFt4',
            properties: {
                someProp: "someValue4"
            }
        };
        let testAction = {
            type: GEOMETRY_CHANGED,
            features: [feature4]
        };
        let state = draw({}, testAction);
        expect(state.tempFeatures).toExist();
        expect(state.tempFeatures[0]).toBe(feature4);
        expect(state.tempFeatures.length).toEqual(1);
    });

    it('MultiPoint GEOMETRY_CHANGED', () => {
        let feature5 = {
            type: "Feature",
            geometry: {
                type: "MultiPoint",
                coordinates: [
                    [10.0, 40.0], [40.0, 30.0], [20.0, 20.0], [30.0, 10.0]
                ]
            },
            id: 'idFt5',
            properties: {
                someProp: "someValue5"
            }
        };
        let testAction = {
            type: GEOMETRY_CHANGED,
            features: [feature5]
        };
        let state = draw({}, testAction);
        expect(state.tempFeatures).toExist();
        expect(state.tempFeatures[0]).toBe(feature5);
        expect(state.tempFeatures.length).toEqual(1);
    });

    it('LineString GEOMETRY_CHANGED', () => {
        let feature6 = {
            type: "Feature",
            geometry: {
                type: "LineString",
                coordinates: [[101.0, 0.0], [102.0, 1.0], [103.0, 1.0]]
            },
            id: 'idFt6',
            properties: {
                someProp: "someValue6"
            }
        };
        let testAction = {
            type: GEOMETRY_CHANGED,
            features: [feature6]
        };
        let state = draw({}, testAction);
        expect(state.tempFeatures).toExist();
        expect(state.tempFeatures[0]).toBe(feature6);
        expect(state.tempFeatures.length).toEqual(1);
    });


    it('Snapping tool TOGGLE_SNAPPING', () => {
        let testAction = {
            type: TOGGLE_SNAPPING
        };
        let state = draw({}, testAction);

        expect(state.snapping).toBe(true);
    });
    it('Snapping tool SET_SNAPPING_LAYER', () => {
        let testAction = {
            type: SET_SNAPPING_LAYER,
            snappingLayer: 'layerId',
            snappingIsLoading: false
        };
        let state = draw({ snappingIsLoading: true }, testAction);

        expect(state.snappingLayer).toBe('layerId');
        expect(state.snappingIsLoading).toBe(false);
    });
    it('Snapping tool SNAPPING_IS_LOADING', () => {
        let testAction = {
            type: SNAPPING_IS_LOADING
        };
        let state = draw({ snappingIsLoading: true }, testAction);
        expect(state.snappingIsLoading).toBe(false);
    });
    it('Snapping tool SET_SNAPPING_CONFIG with no config in state', () => {
        let testAction = {
            type: SET_SNAPPING_CONFIG,
            pluginCfg: {
                snapTool: true,
                snapConfig: {
                    vertex: true,
                    edge: false
                }
            }
        };
        let state = draw({}, testAction);
        expect(state.snapConfig.vertex).toBe(true);
        expect(state.snapConfig.edge).toBe(false);
    });
    it('Snapping tool SET_SNAPPING_CONFIG with no config in state; from defaults', () => {
        let testAction = {
            type: SET_SNAPPING_CONFIG
        };
        let state = draw({}, testAction);
        expect(state.snapConfig.vertex).toBe(defaultSnappingConfig.vertex);
        expect(state.snapConfig.edge).toBe(defaultSnappingConfig.edge);
        expect(state.snapConfig.pixelTolerance).toBe(defaultSnappingConfig.pixelTolerance);
        expect(state.snapConfig.strategy).toBe(defaultSnappingConfig.strategy);
    });
    it('Snapping tool SET_SNAPPING_CONFIG with config in state; from defaults', () => {
        let testAction = {
            type: SET_SNAPPING_CONFIG
        };
        let state = draw({ snapConfig: { vertex: true, edge: false }}, testAction);
        expect(state.snapConfig.vertex).toBe(true);
        expect(state.snapConfig.edge).toBe(false);
        expect(state.snapConfig.pixelTolerance).toBe(defaultSnappingConfig.pixelTolerance);
        expect(state.snapConfig.strategy).toBe(defaultSnappingConfig.strategy);
    });
    it('Snapping tool SET_SNAPPING_CONFIG update setting value', () => {
        let testAction = {
            type: SET_SNAPPING_CONFIG,
            prop: 'vertex',
            value: false
        };
        let state = draw({ snapConfig: { vertex: true, edge: false }}, testAction);
        expect(state.snapConfig.vertex).toBe(false);
        expect(state.snapConfig.edge).toBe(false);
        expect(state.snapConfig.pixelTolerance).toBe(defaultSnappingConfig.pixelTolerance);
        expect(state.snapConfig.strategy).toBe(defaultSnappingConfig.strategy);
    });
});
