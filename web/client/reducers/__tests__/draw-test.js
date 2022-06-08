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
